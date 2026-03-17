import { NextRequest, NextResponse } from 'next/server';
import { trackImpression, hasRecentImpression } from '@/lib/ads/ad-tracker';
import { AdPlacement } from '@prisma/client';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';

// Impression rate limit: higher than clicks since impressions are more frequent
const IMPRESSION_RATE_LIMIT = { maxRequests: 100, windowMs: 60 * 1000 }; // 100 per minute

// Input validation schema
const impressionSchema = z.object({
    campaignId: z.union([z.string(), z.number()]).transform(val => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num) || num <= 0) throw new Error('Invalid campaignId');
        return num;
    }),
    sessionHash: z.string().min(1).max(100),
    placement: z.nativeEnum(AdPlacement),
    pageUrl: z.string().url().max(2000),
    countryCode: z.string().max(10).optional(),
    citySlug: z.string().max(100).optional(),
    conditionSlug: z.string().max(200).optional(),
    languageCode: z.string().max(10).optional(),
});

export async function POST(request: NextRequest) {
    // Apply rate limiting to prevent impression fraud
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`adImpression:${clientId}`, IMPRESSION_RATE_LIMIT);

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

        // Validate input with Zod
        const validation = impressionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const {
            campaignId,
            sessionHash,
            placement,
            pageUrl,
            countryCode,
            citySlug,
            conditionSlug,
            languageCode,
        } = validation.data;

        // Check for recent impression (prevent spam)
        const hasRecent = await hasRecentImpression(sessionHash, campaignId, 5);
        if (hasRecent) {
            return NextResponse.json({
                success: true,
                impressionId: null,
                deduplicated: true,
            });
        }

        // Track the impression
        const impressionId = await trackImpression({
            campaignId,
            sessionHash,
            placement,
            pageUrl,
            countryCode: countryCode || null,
            citySlug: citySlug || null,
            conditionSlug: conditionSlug || null,
            languageCode: languageCode || null,
        });

        return NextResponse.json({
            success: true,
            impressionId,
            deduplicated: false,
        });
    } catch (error) {
        console.error('Impression tracking error:', error);
        return NextResponse.json({ error: 'Failed to track impression' }, { status: 500 });
    }
}
