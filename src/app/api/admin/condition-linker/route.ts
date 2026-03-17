import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * Doctor-Condition Linker + Keyword Opportunity Alerts
 *
 * GET  ?action=search    — Search conditions to assign to doctor
 * GET  ?action=alerts    — Keyword opportunity alerts
 * POST                   — Link/unlink conditions to doctor
 *
 * Requires admin authentication.
 */

export async function GET(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action') || 'search';

    if (action === 'search') {
        const q = searchParams.get('q') || '';
        const doctorId = searchParams.get('doctorId');

        const conditions = await prisma.medicalCondition.findMany({
            where: {
                isActive: true,
                OR: [
                    { commonName: { contains: q, mode: 'insensitive' } },
                    { scientificName: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: { id: true, commonName: true, scientificName: true, slug: true, specialistType: true },
            take: 20,
        });

        // If doctorId provided, mark which are already linked
        let linkedIds: number[] = [];
        if (doctorId) {
            const linked = await prisma.conditionReviewer.findMany({
                where: { doctorId: parseInt(doctorId, 10) },
                select: { conditionId: true },
            });
            linkedIds = linked.map((l: { conditionId: number }) => l.conditionId);
        }

        return NextResponse.json({
            conditions: conditions.map((c) => ({
                id: c.id,
                name: c.commonName,
                slug: c.slug,
                specialty: c.specialistType,
                isLinked: linkedIds.includes(c.id),
            })),
        });
    }

    if (action === 'alerts') {
        // Keyword opportunities: high-search, no-doctor areas
        const opportunities = await prisma.keywordSearchLog.groupBy({
            by: ['normalizedQuery', 'citySlug', 'countryCode'],
            where: {
                hasDoctors: false,
                createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 20,
        });

        return NextResponse.json({
            alerts: opportunities
                .filter((o) => o._count.id >= 5)
                .map((o) => ({
                    keyword: o.normalizedQuery,
                    city: o.citySlug,
                    country: o.countryCode,
                    searchCount: o._count.id,
                    message: `Market Opportunity: Recruit ${o.normalizedQuery || 'unknown'} specialists in ${o.citySlug || o.countryCode || 'unknown'}`,
                })),
        });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const body = await request.json();
        const { doctorId, conditionId, action: linkAction } = body;

        if (!doctorId || !conditionId) {
            return NextResponse.json({ error: 'doctorId and conditionId required' }, { status: 400 });
        }

        const dId = parseInt(doctorId, 10);
        const cId = parseInt(conditionId, 10);

        if (linkAction === 'unlink') {
            await prisma.conditionReviewer.deleteMany({
                where: { doctorId: dId, conditionId: cId },
            });
            return NextResponse.json({ success: true, action: 'unlinked' });
        }

        // Check condition limit
        const doctor = await prisma.doctorProvider.findUnique({
            where: { id: dId },
            select: { subscriptionTier: true },
        });

        const currentCount = await prisma.conditionReviewer.count({
            where: { doctorId: dId },
        });

        const maxConditions: Record<string, number> = {
            free: 2, premium: 15, enterprise: 1000,
        };

        const limit = maxConditions[doctor?.subscriptionTier || 'free'] || 2;

        if (currentCount >= limit) {
            return NextResponse.json({
                error: `Condition limit reached (${currentCount}/${limit}). Upgrade to add more.`,
                requiresUpgrade: true,
            }, { status: 403 });
        }

        await prisma.conditionReviewer.create({
            data: { doctorId: dId, conditionId: cId },
        });

        return NextResponse.json({ success: true, action: 'linked', count: currentCount + 1, limit });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
