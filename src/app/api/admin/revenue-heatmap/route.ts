import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * CMS: Revenue Heatmap
 *
 * GET /api/admin/revenue-heatmap
 *
 * Returns top conditions×cities combinations for outreach targeting:
 * "Diabetes is trending in Lagos → reach out to Endocrinologists there."
 */

export async function GET(request: NextRequest) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();
    // Top conditions by analysis count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const conditionAnalyses = await prisma.analysisResult.groupBy({
        by: ['conditionSlug'],
        where: {
            createdAt: { gte: thirtyDaysAgo },
            conditionSlug: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
    });

    // Top cities by geo analytics
    const cityVisits = await prisma.geoAnalytics.groupBy({
        by: ['countryCode', 'citySlug'],
        where: { visitDate: { gte: thirtyDaysAgo } },
        _sum: { visitCount: true, uniqueVisitors: true },
        orderBy: { _sum: { visitCount: 'desc' } },
        take: 20,
    });

    // Cross-reference: conditions searched per city
    const geoConditions = await prisma.geoAnalytics.findMany({
        where: {
            visitDate: { gte: thirtyDaysAgo },
            topConditions: { isEmpty: false },
        },
        select: {
            countryCode: true,
            citySlug: true,
            topConditions: true,
            visitCount: true,
        },
        orderBy: { visitCount: 'desc' },
        take: 50,
    });

    // Build opportunities: high-demand conditions in cities with few premium doctors
    const opportunities: Array<{
        condition: string;
        city: string;
        country: string;
        demand: number;
        suggestion: string;
    }> = [];

    for (const gc of geoConditions) {
        if (gc.topConditions.length > 0 && gc.citySlug) {
            for (const condSlug of gc.topConditions.slice(0, 3)) {
                // Check how many premium doctors exist for this condition in this city
                const cityGeo = await prisma.geography.findFirst({
                    where: { slug: gc.citySlug },
                    select: { id: true, name: true },
                });

                if (cityGeo) {
                    const premDocs = await prisma.doctorProvider.count({
                        where: {
                            geographyId: cityGeo.id,
                            subscriptionTier: { in: ['premium', 'enterprise'] },
                            specialties: {
                                some: { condition: { slug: condSlug } },
                            },
                        },
                    });

                    if (premDocs < 3) {
                        // Opportunity: high demand, low supply
                        const condition = await prisma.medicalCondition.findUnique({
                            where: { slug: condSlug },
                            select: { commonName: true, specialistType: true },
                        });

                        if (condition) {
                            opportunities.push({
                                condition: condition.commonName,
                                city: cityGeo.name,
                                country: gc.countryCode,
                                demand: gc.visitCount,
                                suggestion: `Reach out to ${condition.specialistType}s in ${cityGeo.name} for Premium plan.`,
                            });
                        }
                    }
                }
            }
        }
    }

    return NextResponse.json({
        topConditions: conditionAnalyses.map((c) => ({
            slug: c.conditionSlug,
            count: c._count.id,
        })),
        topCities: cityVisits.map((c) => ({
            country: c.countryCode,
            city: c.citySlug,
            visits: c._sum.visitCount,
            unique: c._sum.uniqueVisitors,
        })),
        opportunities: opportunities.slice(0, 15),
        period: '30 days',
    });
}
