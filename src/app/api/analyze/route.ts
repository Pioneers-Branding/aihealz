import { NextRequest, NextResponse } from 'next/server';
import { runAnalysisPipeline, generateSessionHash } from '@/lib/ai-pipeline/pipeline';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { z } from 'zod';

// Input validation schema
const analyzeSchema = z.object({
    text: z.string()
        .min(20, 'Report text must be at least 20 characters')
        .max(50000, 'Report text exceeds maximum length (50,000 characters)'),
    reportType: z.enum(['blood_work', 'imaging', 'pathology', 'prescription', 'other']).optional().default('other'),
});

/**
 * POST /api/analyze
 *
 * Accepts medical report text and runs the complete analysis pipeline:
 * Sanitize → Extract → Match Doctors → Generate Dossier
 *
 * Request body:
 * {
 *   text: string,           // OCR-extracted or pasted report text
 *   reportType?: string,    // 'blood_work' | 'imaging' | 'pathology' | 'other'
 * }
 *
 * Geo context is automatically read from middleware headers.
 */
export async function POST(request: NextRequest) {
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`analyze:${clientId}`, RATE_LIMITS.analyze);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait before analyzing another report.' },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = analyzeSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { text, reportType } = validation.data;

        // Generate anonymous session hash
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const sessionHash = generateSessionHash(ip, userAgent);

        // Read geo context from middleware
        const countrySlug = request.headers.get('x-aihealz-country') || 'india';
        const citySlug = request.headers.get('x-aihealz-city') || null;
        const lang = request.headers.get('x-aihealz-lang') || 'en';

        // Run the complete pipeline
        const result = await runAnalysisPipeline({
            text: text.trim(),
            reportType: reportType as 'blood_work' | 'imaging' | 'pathology' | 'prescription' | 'other',
            sessionHash,
            countrySlug,
            citySlug,
            lang,
        });

        return NextResponse.json({
            success: true,
            analysisId: result.analysisId,
            dossier: result.dossier,
            doctors: result.matchedDoctors,
            meta: {
                confidenceScore: result.meta.confidenceScore,
                urgencyLevel: result.extraction.urgencyLevel,
                processingTimeMs: result.meta.processingTimeMs,
                piiRedacted: result.meta.sanitizedPiiCount,
            },
        });
    } catch (error) {
        console.error('Analysis pipeline error:', error);
        return NextResponse.json(
            { error: 'Failed to process report. Please try again.' },
            { status: 500 }
        );
    }
}
