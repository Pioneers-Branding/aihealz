import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        const dateFilter = startDate && endDate ? {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        } : {};

        switch (type) {
            case 'leads': {
                const leads = await prisma.leadLog.findMany({
                    where: dateFilter,
                    orderBy: { createdAt: 'desc' },
                    take: 100,
                    include: {
                        doctor: { select: { name: true, slug: true } },
                        geography: { select: { name: true, slug: true } },
                    },
                });

                const totalLeads = await prisma.leadLog.count({ where: dateFilter });
                const uniqueDoctors = await prisma.leadLog.groupBy({
                    by: ['doctorId'],
                    where: dateFilter,
                });

                return NextResponse.json({
                    type: 'leads',
                    data: leads,
                    summary: {
                        totalLeads,
                        uniqueDoctors: uniqueDoctors.length,
                    },
                });
            }

            case 'conditions': {
                const conditions = await prisma.medicalCondition.findMany({
                    orderBy: { commonName: 'asc' },
                    take: 100,
                    include: {
                        _count: {
                            select: {
                                localizedContent: true,
                                doctorSpecialties: true,
                            },
                        },
                    },
                });

                const totalConditions = await prisma.medicalCondition.count();
                const withContent = await prisma.medicalCondition.count({
                    where: { localizedContent: { some: {} } },
                });

                return NextResponse.json({
                    type: 'conditions',
                    data: conditions,
                    summary: {
                        totalConditions,
                        withLocalizedContent: withContent,
                        contentCoverage: Math.round((withContent / totalConditions) * 100),
                    },
                });
            }

            case 'doctors': {
                const doctors = await prisma.doctorProvider.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 100,
                    include: {
                        geography: { select: { name: true, slug: true } },
                        _count: {
                            select: {
                                specialties: true,
                                leadLogs: true,
                            },
                        },
                    },
                });

                const totalDoctors = await prisma.doctorProvider.count();
                const verifiedDoctors = await prisma.doctorProvider.count({
                    where: { isVerified: true },
                });

                return NextResponse.json({
                    type: 'doctors',
                    data: doctors,
                    summary: {
                        totalDoctors,
                        verifiedDoctors,
                        verificationRate: Math.round((verifiedDoctors / totalDoctors) * 100),
                    },
                });
            }

            case 'geography': {
                const geographies = await prisma.geography.findMany({
                    orderBy: [{ level: 'asc' }, { name: 'asc' }],
                    take: 100,
                    include: {
                        _count: {
                            select: {
                                children: true,
                                doctors: true,
                                localizedContent: true,
                            },
                        },
                    },
                });

                const byLevel = await prisma.geography.groupBy({
                    by: ['level'],
                    _count: { level: true },
                });

                return NextResponse.json({
                    type: 'geography',
                    data: geographies.map(g => ({
                        ...g,
                        population: g.population?.toString() || null,
                    })),
                    summary: {
                        byLevel: Object.fromEntries(byLevel.map(l => [l.level, l._count.level])),
                    },
                });
            }

            default: {
                // Overview report
                const [conditionsCount, doctorsCount, leadsCount, geoCount] = await Promise.all([
                    prisma.medicalCondition.count(),
                    prisma.doctorProvider.count(),
                    prisma.leadLog.count(),
                    prisma.geography.count(),
                ]);

                return NextResponse.json({
                    type: 'overview',
                    data: {
                        conditions: conditionsCount,
                        doctors: doctorsCount,
                        leads: leadsCount,
                        geographies: geoCount,
                    },
                    generatedAt: new Date().toISOString(),
                });
            }
        }
    } catch (error) {
        console.error('Failed to generate report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
