import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

interface HealthCheck {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    latency?: number;
}

export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const checks: HealthCheck[] = [];
    const startTime = Date.now();

    // Check Database connectivity
    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbLatency = Date.now() - dbStart;
        checks.push({
            service: 'Database',
            status: dbLatency < 100 ? 'healthy' : dbLatency < 500 ? 'degraded' : 'unhealthy',
            message: `Connected (${dbLatency}ms)`,
            latency: dbLatency,
        });
    } catch (error) {
        checks.push({
            service: 'Database',
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Connection failed',
        });
    }

    // Check OpenRouter API key validity
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
        try {
            const apiStart = Date.now();
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });
            const apiLatency = Date.now() - apiStart;

            if (response.ok) {
                checks.push({
                    service: 'AI API (OpenRouter)',
                    status: apiLatency < 1000 ? 'healthy' : 'degraded',
                    message: `Connected (${apiLatency}ms)`,
                    latency: apiLatency,
                });
            } else {
                checks.push({
                    service: 'AI API (OpenRouter)',
                    status: 'unhealthy',
                    message: `API returned ${response.status}`,
                });
            }
        } catch (error) {
            checks.push({
                service: 'AI API (OpenRouter)',
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Connection failed',
            });
        }
    } else {
        checks.push({
            service: 'AI API (OpenRouter)',
            status: 'unhealthy',
            message: 'API key not configured',
        });
    }

    // Check Stripe connection
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
        try {
            const stripeStart = Date.now();
            const response = await fetch('https://api.stripe.com/v1/balance', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${stripeKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });
            const stripeLatency = Date.now() - stripeStart;

            if (response.ok) {
                checks.push({
                    service: 'Stripe Payments',
                    status: stripeLatency < 1000 ? 'healthy' : 'degraded',
                    message: `Connected (${stripeLatency}ms)`,
                    latency: stripeLatency,
                });
            } else if (response.status === 401) {
                checks.push({
                    service: 'Stripe Payments',
                    status: 'unhealthy',
                    message: 'Invalid API key',
                });
            } else {
                checks.push({
                    service: 'Stripe Payments',
                    status: 'degraded',
                    message: `API returned ${response.status}`,
                });
            }
        } catch (error) {
            checks.push({
                service: 'Stripe Payments',
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Connection failed',
            });
        }
    } else {
        checks.push({
            service: 'Stripe Payments',
            status: 'unhealthy',
            message: 'API key not configured',
        });
    }

    // Check content generation queue (by checking draft translations)
    try {
        const draftContent = await prisma.localizedContent.count({
            where: { status: 'ai_draft' },
        });
        const underReview = await prisma.localizedContent.count({
            where: { status: 'under_review' },
        });

        checks.push({
            service: 'Content Queue',
            status: draftContent < 100 ? 'healthy' : draftContent < 500 ? 'degraded' : 'unhealthy',
            message: `${draftContent} drafts, ${underReview} under review`,
        });
    } catch (error) {
        checks.push({
            service: 'Content Queue',
            status: 'unhealthy',
            message: 'Failed to check queue status',
        });
    }

    // Overall health status
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
        // Database being unhealthy is critical
        if (checks.find(c => c.service === 'Database' && c.status === 'unhealthy')) {
            overallStatus = 'unhealthy';
        } else if (unhealthyCount >= 2) {
            overallStatus = 'unhealthy';
        } else {
            overallStatus = 'degraded';
        }
    } else if (degradedCount > 0) {
        overallStatus = 'degraded';
    }

    const totalLatency = Date.now() - startTime;

    return NextResponse.json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        totalCheckTime: totalLatency,
        checks,
    });
}
