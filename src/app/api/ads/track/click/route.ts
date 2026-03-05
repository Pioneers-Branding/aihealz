import { NextRequest, NextResponse } from 'next/server';
import { trackClick } from '@/lib/ads/ad-tracker';
import { AdPlacement } from '@prisma/client';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { z } from 'zod';

// Input validation schema
const clickSchema = z.object({
    campaignId: z.union([z.string(), z.number()]).transform(val => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num) || num <= 0) throw new Error('Invalid campaignId');
        return num;
    }),
    impressionId: z.string().optional(),
    sessionHash: z.string().min(1).max(100),
    placement: z.nativeEnum(AdPlacement),
    pageUrl: z.string().url().max(2000),
    destinationUrl: z.string().url().max(2000),
    countryCode: z.string().max(10).optional(),
    citySlug: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
    // Apply rate limiting to prevent click fraud
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`adclick:${clientId}`, RATE_LIMITS.adClick);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Rate limit exceeded', success: false },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const body = await request.json();

        // Validate input
        const validation = clickSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message, success: false },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Track the click with validated data
        const clickId = await trackClick({
            campaignId: data.campaignId,
            impressionId: data.impressionId,
            sessionHash: data.sessionHash,
            placement: data.placement,
            pageUrl: data.pageUrl,
            destinationUrl: data.destinationUrl,
            countryCode: data.countryCode || null,
            citySlug: data.citySlug || null,
        });

        return NextResponse.json({
            success: true,
            clickId,
        });
    } catch (error) {
        console.error('Click tracking error:', error);
        return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }
}
