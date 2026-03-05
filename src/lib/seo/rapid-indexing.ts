import prisma from '@/lib/db';

/**
 * Google Indexing API + IndexNow Integration
 *
 * Triggers rapid indexing when:
 * - New doctor joins the platform
 * - Condition page updated with AI insights
 * - New localized content published
 *
 * Google Indexing API: Immediate URL notification (requires service account)
 * IndexNow: Bing + Yandex coverage via single key-based API
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';

// ─── Google Indexing API ────────────────────────────────────

interface GoogleAuthToken {
    access_token: string;
    expires_in: number;
}

/**
 * Get Google OAuth2 token from service account credentials.
 */
async function getGoogleAuthToken(): Promise<string | null> {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) return null;

    try {
        const sa = JSON.parse(serviceAccountJson);
        const now = Math.floor(Date.now() / 1000);

        // Build JWT
        const header = Buffer.from(JSON.stringify({
            alg: 'RS256', typ: 'JWT',
        })).toString('base64url');

        const payload = Buffer.from(JSON.stringify({
            iss: sa.client_email,
            scope: 'https://www.googleapis.com/auth/indexing',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600,
        })).toString('base64url');

        // Sign with the service account private key
        const crypto = await import('crypto');
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(`${header}.${payload}`);
        const signature = sign.sign(sa.private_key, 'base64url');

        const jwt = `${header}.${payload}.${signature}`;

        // Exchange JWT for access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
        });

        if (!tokenRes.ok) return null;
        const tokenData: GoogleAuthToken = await tokenRes.json();
        return tokenData.access_token;
    } catch (error) {
        console.error('Google auth error:', error);
        return null;
    }
}

/**
 * Submit a URL to Google Indexing API.
 */
export async function notifyGoogle(
    url: string,
    action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: boolean; status?: number; error?: string }> {
    const token = await getGoogleAuthToken();
    if (!token) {
        return { success: false, error: 'Google service account not configured' };
    }

    try {
        const response = await fetch(
            'https://indexing.googleapis.com/v3/urlNotifications:publish',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ url, type: action }),
            }
        );

        const body = await response.json();

        // Log the submission
        await prisma.indexingLog.create({
            data: {
                url,
                indexApi: 'google',
                action,
                status: response.ok ? 'submitted' : 'failed',
                responseCode: response.status,
                responseBody: body,
                errorMessage: response.ok ? null : JSON.stringify(body),
            },
        });

        return {
            success: response.ok,
            status: response.status,
            error: response.ok ? undefined : JSON.stringify(body),
        };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

// ─── IndexNow (Bing + Yandex) ──────────────────────────────

/**
 * Submit URLs to IndexNow for Bing and Yandex indexing.
 * Single API call covers both search engines.
 */
export async function notifyIndexNow(urls: string[]): Promise<{
    success: boolean;
    error?: string;
}> {
    if (!INDEXNOW_KEY) {
        return { success: false, error: 'INDEXNOW_KEY not configured' };
    }

    try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                host: new URL(SITE_URL).hostname,
                key: INDEXNOW_KEY,
                keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
                urlList: urls,
            }),
        });

        // Log each URL
        for (const url of urls) {
            await prisma.indexingLog.create({
                data: {
                    url,
                    indexApi: 'indexnow',
                    action: 'URL_UPDATED',
                    status: response.ok || response.status === 202 ? 'submitted' : 'failed',
                    responseCode: response.status,
                },
            });
        }

        return { success: response.ok || response.status === 202 };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

// ─── Batch Indexing Triggers ────────────────────────────────

/**
 * Notify all search engines when a new doctor joins.
 */
export async function onDoctorJoined(doctorSlug: string, countrySlug: string, citySlug?: string) {
    const urls = [
        `${SITE_URL}/doctor/${doctorSlug}`,
        citySlug ? `${SITE_URL}/${countrySlug}/${citySlug}` : `${SITE_URL}/${countrySlug}`,
    ];

    await Promise.allSettled([
        notifyGoogle(urls[0]),
        notifyGoogle(urls[1]),
        notifyIndexNow(urls),
    ]);
}

/**
 * Notify all search engines when a condition page is updated.
 */
export async function onConditionUpdated(
    conditionSlug: string,
    geoPaths: string[] // e.g. ['india/mumbai', 'usa/new-york']
) {
    const urls = geoPaths.map((path) => `${SITE_URL}/${path}/${conditionSlug}`);
    urls.push(`${SITE_URL}/condition/${conditionSlug}`);

    await Promise.allSettled([
        ...urls.map((url) => notifyGoogle(url)),
        notifyIndexNow(urls),
    ]);
}

/**
 * Notify search engines about stale content that's been refreshed.
 */
export async function onContentRefreshed(urls: string[]) {
    await Promise.allSettled([
        ...urls.map((url) => notifyGoogle(url)),
        notifyIndexNow(urls),
    ]);

    // Update freshness records
    for (const url of urls) {
        await prisma.contentFreshness.upsert({
            where: { url },
            update: {
                lastModified: new Date(),
                freshnessScore: 1.0,
                needsRefresh: false,
            },
            create: {
                url,
                pageType: 'content',
                lastModified: new Date(),
                freshnessScore: 1.0,
            },
        });
    }
}
