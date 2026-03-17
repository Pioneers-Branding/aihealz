import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * CMS: Translation Queue
 *
 * GET  /api/admin/translation-queue — List pending translations
 * PUT  /api/admin/translation-queue — Approve, reject, or fix a translation
 *
 * Shows English master text side-by-side with AI translation
 * for human review and approval.
 */

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') || 'pending';
    const lang = searchParams.get('lang');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {
        status,
        ...(lang ? { targetLanguage: lang } : {}),
    };

    const [entries, total] = await Promise.all([
        prisma.translationQueue.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                localizedContent: {
                    include: {
                        condition: { select: { commonName: true, slug: true } },
                        geography: { select: { name: true, slug: true } },
                    },
                },
            },
        }),
        prisma.translationQueue.count({ where }),
    ]);

    return NextResponse.json({
        entries: entries.map((e) => ({
            id: e.id,
            sourceLanguage: e.sourceLanguage,
            targetLanguage: e.targetLanguage,
            masterText: e.masterText,
            translatedText: e.translatedText,
            correctedText: e.correctedText,
            status: e.status,
            qualityScore: e.qualityScore ? Number(e.qualityScore) : null,
            condition: e.localizedContent.condition.commonName,
            geography: e.localizedContent.geography?.name || 'Global',
            createdAt: e.createdAt,
            reviewedBy: e.reviewedBy,
            reviewedAt: e.reviewedAt,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, action, correctedText, reviewedBy } = body;
        // action: 'approve' | 'reject' | 'fix'

        if (!id || !action) {
            return NextResponse.json(
                { error: 'id and action are required' },
                { status: 400 }
            );
        }

        const statusMap: Record<string, string> = {
            approve: 'approved',
            reject: 'rejected',
            fix: 'needs_fix',
        };

        const status = statusMap[action];
        if (!status) {
            return NextResponse.json(
                { error: 'action must be approve, reject, or fix' },
                { status: 400 }
            );
        }

        const updated = await prisma.translationQueue.update({
            where: { id },
            data: {
                status: status as 'pending' | 'approved' | 'rejected' | 'needs_fix',
                correctedText: correctedText || undefined,
                reviewedBy: reviewedBy || 'admin',
                reviewedAt: new Date(),
            },
        });

        // If approved, update the localized content
        if (action === 'approve') {
            const finalText = correctedText || updated.translatedText;
            await prisma.localizedContent.update({
                where: { id: updated.localizedContentId },
                data: {
                    description: finalText,
                    status: 'verified',
                    reviewedAt: new Date(),
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Translation queue error:', error);
        return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 });
    }
}
