import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * CMS: Enquiry Monitor — Response times, volume, lead heatmap
 *
 * GET /api/admin/enquiry-monitor
 */

type GeoHeatmapItem = {
    geographyId: number | null;
    _count: { id: number };
};

type OutcomeItem = {
    outcome: string | null;
    _count: { id: number };
};

type ConditionItem = {
    conditionSlug: string | null;
    _count: { id: number };
};

type GeoInfo = {
    id: number;
    name: string;
    slug: string;
};

export async function GET() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Response time stats
    const responseStats = await prisma.enquiryLog.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, responseTimeMs: { not: null } },
        _avg: { responseTimeMs: true, aiConfidenceScore: true },
        _count: { id: true },
        _min: { responseTimeMs: true },
        _max: { responseTimeMs: true },
    });

    // Outcome breakdown
    const outcomes = await prisma.enquiryLog.groupBy({
        by: ['outcome'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
    });

    // Geographic heatmap — enquiry volume by city
    const geoHeatmap = await prisma.enquiryLog.groupBy({
        by: ['geographyId'],
        where: { createdAt: { gte: thirtyDaysAgo }, geographyId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
    });

    // Hydrate geography names
    const geoIds = geoHeatmap
        .map((g: GeoHeatmapItem) => g.geographyId)
        .filter((id): id is number => id !== null);

    const geoNames = await prisma.geography.findMany({
        where: { id: { in: geoIds } },
        select: { id: true, name: true, slug: true },
    });

    const geoMap: Record<number, GeoInfo> = Object.fromEntries(geoNames.map((g: GeoInfo) => [g.id, g]));

    // Doctor supply vs demand per city
    const supplyVsDemand = await Promise.all(
        geoHeatmap.slice(0, 10).map(async (g: GeoHeatmapItem) => {
            if (!g.geographyId) return null;
            const doctorCount = await prisma.doctorProvider.count({
                where: { geographyId: g.geographyId, isVerified: true },
            });
            const premiumCount = await prisma.doctorProvider.count({
                where: {
                    geographyId: g.geographyId,
                    isVerified: true,
                    subscriptionTier: { in: ['premium', 'enterprise'] },
                },
            });
            return {
                city: geoMap[g.geographyId]?.name || 'Unknown',
                enquiries: g._count.id,
                doctors: doctorCount,
                premiumDoctors: premiumCount,
                isHighOpportunity: g._count.id > 50 && premiumCount < 5,
            };
        })
    );

    // Condition breakdown
    const conditionBreakdown = await prisma.enquiryLog.groupBy({
        by: ['conditionSlug'],
        where: { createdAt: { gte: thirtyDaysAgo }, conditionSlug: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 15,
    });

    return NextResponse.json({
        period: '30 days',
        responseTime: {
            average: responseStats._avg.responseTimeMs
                ? Math.round(responseStats._avg.responseTimeMs / 60000) // Convert to minutes
                : null,
            fastest: responseStats._min.responseTimeMs
                ? Math.round(responseStats._min.responseTimeMs / 60000)
                : null,
            slowest: responseStats._max.responseTimeMs
                ? Math.round(responseStats._max.responseTimeMs / 60000)
                : null,
            totalEnquiries: responseStats._count.id,
        },
        aiConfidence: {
            average: responseStats._avg.aiConfidenceScore
                ? Number(responseStats._avg.aiConfidenceScore)
                : null,
        },
        outcomes: Object.fromEntries(
            outcomes.map((o: OutcomeItem) => [o.outcome || 'pending', o._count.id])
        ),
        geoHeatmap: geoHeatmap.map((g: GeoHeatmapItem) => ({
            city: g.geographyId ? geoMap[g.geographyId]?.name : 'Unknown',
            citySlug: g.geographyId ? geoMap[g.geographyId]?.slug : null,
            enquiries: g._count.id,
        })),
        supplyVsDemand: supplyVsDemand.filter(Boolean),
        topConditions: conditionBreakdown.map((c: ConditionItem) => ({
            condition: c.conditionSlug,
            count: c._count.id,
        })),
    });
}
