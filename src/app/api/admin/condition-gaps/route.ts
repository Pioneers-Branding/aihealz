import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * CMS: Condition Gaps — Underserved conditions by city
 *
 * GET /api/admin/condition-gaps
 *
 * Finds cities where conditions are searched but few doctors are available,
 * enabling targeted ad campaigns for doctor recruitment.
 *
 * Requires admin authentication.
 */

export async function GET(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }
    // Get all active conditions with their search frequency
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, commonName: true, specialistType: true },
    });

    // Get cities with active geographies
    const cities = await prisma.geography.findMany({
        where: { level: 'city', isActive: true },
        select: { id: true, name: true, slug: true, parentId: true },
        take: 50,
    });

    const gaps: Array<{
        condition: string;
        conditionSlug: string;
        specialistType: string;
        city: string;
        citySlug: string;
        doctorCount: number;
        premiumCount: number;
        demand: number;
        gapScore: number;
        recommendation: string;
    }> = [];

    for (const city of cities) {
        for (const condition of conditions) {
            // Count doctors for this condition in this city
            const doctorCount = await prisma.doctorProvider.count({
                where: {
                    geographyId: city.id,
                    isVerified: true,
                    specialties: { some: { conditionId: condition.id } },
                },
            });

            const premiumCount = await prisma.doctorProvider.count({
                where: {
                    geographyId: city.id,
                    isVerified: true,
                    subscriptionTier: { in: ['premium', 'enterprise'] },
                    specialties: { some: { conditionId: condition.id } },
                },
            });

            // Estimate demand from geo_analytics
            const demand = await prisma.geoAnalytics.aggregate({
                where: {
                    citySlug: city.slug,
                    topConditions: { has: condition.slug },
                },
                _sum: { visitCount: true },
            });

            const demandScore = demand._sum.visitCount || 0;

            // Calculate gap score: high demand + low supply = high gap
            if (doctorCount < 3 || (demandScore > 10 && premiumCount === 0)) {
                const gapScore = Math.min(
                    ((demandScore + 1) / (doctorCount + 1)) * (premiumCount === 0 ? 2 : 1),
                    100
                );

                gaps.push({
                    condition: condition.commonName,
                    conditionSlug: condition.slug,
                    specialistType: condition.specialistType,
                    city: city.name,
                    citySlug: city.slug,
                    doctorCount,
                    premiumCount,
                    demand: demandScore,
                    gapScore: Math.round(gapScore * 100) / 100,
                    recommendation: premiumCount === 0
                        ? `No Premium ${condition.specialistType}s in ${city.name}. High-priority recruitment target.`
                        : `Only ${doctorCount} ${condition.specialistType}s in ${city.name} for ${demandScore} monthly searches.`,
                });
            }
        }
    }

    // Sort by gap score descending
    gaps.sort((a, b) => b.gapScore - a.gapScore);

    return NextResponse.json({
        gaps: gaps.slice(0, 30),
        totalGaps: gaps.length,
        summary: {
            citiesAnalyzed: cities.length,
            conditionsAnalyzed: conditions.length,
            criticalGaps: gaps.filter((g) => g.premiumCount === 0).length,
        },
    });
}
