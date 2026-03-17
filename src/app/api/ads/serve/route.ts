import { NextRequest, NextResponse } from 'next/server';
import { selectAd, generateSessionHash } from '@/lib/ads/ad-server';
import { AdPlacement } from '@prisma/client';
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';

// Ad serve rate limit: allow frequent requests for page loads
const AD_SERVE_RATE_LIMIT = { maxRequests: 120, windowMs: 60 * 1000 }; // 120 per minute

export async function GET(request: NextRequest) {
    // Apply rate limiting to prevent abuse
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`adServe:${clientId}`, AD_SERVE_RATE_LIMIT);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Rate limit exceeded', ad: null },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const { searchParams } = new URL(request.url);

        const placementParam = searchParams.get('placement');
        if (!placementParam || !Object.values(AdPlacement).includes(placementParam as AdPlacement)) {
            return NextResponse.json({ error: 'Invalid or missing placement parameter' }, { status: 400 });
        }

        const placement = placementParam as AdPlacement;

        // Get targeting parameters
        const countryCode = searchParams.get('country') || null;
        const citySlug = searchParams.get('city') || null;
        const conditionSlug = searchParams.get('condition') || null;
        const specialtyType = searchParams.get('specialty') || null;
        const languageCode = searchParams.get('lang') || 'en';

        // Get or generate session hash
        let sessionHash = request.cookies.get('ad_session')?.value;
        if (!sessionHash) {
            sessionHash = generateSessionHash();
        }

        // Select an ad
        const ad = await selectAd({
            placement,
            countryCode,
            citySlug,
            conditionSlug,
            specialtyType,
            languageCode,
            sessionHash,
        });

        if (!ad) {
            return NextResponse.json({ ad: null, sessionHash });
        }

        const response = NextResponse.json({
            ad,
            sessionHash,
        });

        // Set session cookie if new
        if (!request.cookies.get('ad_session')) {
            response.cookies.set('ad_session', sessionHash, {
                maxAge: 30 * 24 * 60 * 60, // 30 days
                httpOnly: false,
                path: '/',
                sameSite: 'lax',
            });
        }

        return response;
    } catch (error) {
        console.error('Ad serve error:', error);
        return NextResponse.json({ error: 'Failed to serve ad' }, { status: 500 });
    }
}
