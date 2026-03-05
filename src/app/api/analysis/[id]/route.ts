import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateSessionHash } from '@/lib/ai-pipeline/pipeline';

/**
 * GET /api/analysis/[id]
 *
 * Fetch a completed analysis dossier by ID.
 * Only accessible within the same session (verified by session hash).
 */

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = await params;

    // Generate session hash from request to verify ownership
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const requestSessionHash = generateSessionHash(ip, userAgent);

    const analysis = await prisma.analysisResult.findUnique({
        where: { id },
        select: {
            id: true,
            sessionHash: true,
            primaryIndicators: true,
            specialtyRequired: true,
            conditionSlug: true,
            urgencyLevel: true,
            plainEnglish: true,
            questionsToAsk: true,
            lifestyleFactors: true,
            fullDossier: true,
            confidenceScore: true,
            matchedDoctorIds: true,
            processingTimeMs: true,
            createdAt: true,
        },
    });

    if (!analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Verify session hash matches (privacy protection)
    if (analysis.sessionHash !== requestSessionHash) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Fetch matched doctors
    const doctors = analysis.matchedDoctorIds.length > 0
        ? await prisma.doctorProvider.findMany({
            where: { id: { in: analysis.matchedDoctorIds } },
            select: {
                id: true, slug: true, name: true, qualifications: true,
                experienceYears: true, rating: true, reviewCount: true,
                consultationFee: true, feeCurrency: true, profileImage: true,
                subscriptionTier: true, isVerified: true,
            },
        })
        : [];

    // Strip sessionHash from response for security
    const { sessionHash: _sessionHash, ...analysisData } = analysis;

    return NextResponse.json({
        analysis: {
            ...analysisData,
            confidenceScore: Number(analysis.confidenceScore),
        },
        doctors,
    });
}
