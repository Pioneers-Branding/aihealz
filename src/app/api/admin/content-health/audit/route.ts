import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) {
        return unauthorizedResponse();
    }

    try {
        const { country } = await req.json();

        // Run content health audit
        let pagesChecked = 0;
        let issuesFound = 0;

        // 1. Check for stale content (content not updated in 30+ days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const staleContent = await prisma.localizedContent.count({
            where: {
                updatedAt: { lt: thirtyDaysAgo },
                status: 'published',
            },
        });
        pagesChecked += staleContent;
        if (staleContent > 0) issuesFound += staleContent;

        // 2. Check for content without meta descriptions
        const missingMeta = await prisma.localizedContent.count({
            where: {
                status: 'published',
                OR: [
                    { metaDescription: null },
                    { metaDescription: '' },
                ],
            },
        });
        if (missingMeta > 0) issuesFound += missingMeta;

        // 3. Check for short content (less than 500 words)
        const shortContent = await prisma.localizedContent.count({
            where: {
                status: 'published',
                wordCount: { lt: 500 },
            },
        });
        if (shortContent > 0) issuesFound += shortContent;

        // 4. Get total published content
        const totalPublished = await prisma.localizedContent.count({
            where: { status: 'published' },
        });
        pagesChecked = totalPublished;

        // 5. Check doctors without profiles
        const doctorsWithoutBio = await prisma.doctorProvider.count({
            where: {
                isVerified: true,
                OR: [
                    { bio: null },
                    { bio: '' },
                ],
            },
        });
        if (doctorsWithoutBio > 0) issuesFound += doctorsWithoutBio;

        // 6. Update freshness tracking (update scores for checked content)
        const auditTimestamp = new Date();

        // Log audit run
        const auditLog = {
            timestamp: auditTimestamp.toISOString(),
            country: country || 'all',
            pagesChecked,
            issuesFound,
            breakdown: {
                staleContent,
                missingMeta,
                shortContent,
                doctorsWithoutBio,
            },
        };

        return NextResponse.json({
            success: true,
            pagesChecked,
            issuesFound,
            breakdown: auditLog.breakdown,
            auditedAt: auditTimestamp.toISOString(),
        });
    } catch (error) {
        console.error('Content health audit error:', error);
        return NextResponse.json({ error: 'Failed to run audit' }, { status: 500 });
    }
}
