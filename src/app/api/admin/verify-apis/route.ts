import { NextResponse } from 'next/server';

/**
 * GET /api/admin/verify-apis
 *
 * Verifies Google and other API configurations are working.
 */
export async function GET() {
    const results: Record<string, { status: string; message: string }> = {};

    // 1. Check Google Service Account
    const googleServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (googleServiceAccount) {
        try {
            const sa = JSON.parse(googleServiceAccount);
            if (sa.client_email && sa.private_key) {
                results.googleServiceAccount = {
                    status: 'configured',
                    message: `Service account: ${sa.client_email}`,
                };
            } else {
                results.googleServiceAccount = {
                    status: 'error',
                    message: 'Missing client_email or private_key',
                };
            }
        } catch {
            results.googleServiceAccount = {
                status: 'error',
                message: 'Invalid JSON format',
            };
        }
    } else {
        results.googleServiceAccount = {
            status: 'missing',
            message: 'GOOGLE_SERVICE_ACCOUNT_JSON not set',
        };
    }

    // 2. Check IndexNow Key
    const indexNowKey = process.env.INDEXNOW_KEY;
    results.indexNow = indexNowKey
        ? { status: 'configured', message: `Key: ${indexNowKey.slice(0, 8)}...` }
        : { status: 'missing', message: 'INDEXNOW_KEY not set' };

    // 3. Check OpenRouter API (for AI features)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    results.openRouter = openRouterKey
        ? { status: 'configured', message: `Key: ${openRouterKey.slice(0, 12)}...` }
        : { status: 'missing', message: 'OPENROUTER_API_KEY not set' };

    // 4. Check Resend Email
    const resendKey = process.env.RESEND_API_KEY;
    results.resendEmail = resendKey
        ? { status: 'configured', message: `Key: ${resendKey.slice(0, 8)}...` }
        : { status: 'missing', message: 'RESEND_API_KEY not set' };

    // 5. Check Stripe
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    results.stripe = stripeKey
        ? { status: 'configured', message: `Key: ${stripeKey.slice(0, 10)}...` }
        : { status: 'missing', message: 'STRIPE_SECRET_KEY not set' };

    // 6. Check Database
    const dbUrl = process.env.DATABASE_URL;
    results.database = dbUrl
        ? { status: 'configured', message: 'PostgreSQL connection configured' }
        : { status: 'missing', message: 'DATABASE_URL not set' };

    // 7. Check Cloudflare
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    results.cloudflare = cfToken
        ? { status: 'configured', message: `Token: ${cfToken.slice(0, 8)}...` }
        : { status: 'missing', message: 'CLOUDFLARE_API_TOKEN not set' };

    // Summary
    const allConfigured = Object.values(results).every(r => r.status === 'configured');

    return NextResponse.json({
        success: true,
        allConfigured,
        apis: results,
        instructions: {
            googleIndexingAPI: 'Enable "Indexing API" at https://console.cloud.google.com/apis/library/indexing.googleapis.com',
            searchConsole: 'Add service account email as owner in Search Console > Settings > Users and permissions',
        },
    });
}
