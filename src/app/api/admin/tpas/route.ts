import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    try {
        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { shortName: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [tpas, total] = await Promise.all([
            prisma.tpa.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            insuranceLinks: true,
                            hospitalLinks: true,
                            geographyPresence: true,
                        },
                    },
                },
            }),
            prisma.tpa.count({ where }),
        ]);

        // Get aggregate stats
        const stats = await prisma.tpa.aggregate({
            _count: true,
            _avg: { rating: true },
            _sum: { networkHospitalsCount: true, livesManaged: true },
        });

        const activeCount = await prisma.tpa.count({ where: { isActive: true } });

        return NextResponse.json({
            tpas,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total: stats._count,
                active: activeCount,
                avgRating: Number(stats._avg.rating || 0).toFixed(1),
                totalNetworkHospitals: stats._sum.networkHospitalsCount || 0,
                totalLivesManaged: stats._sum.livesManaged || 0,
            },
        });
    } catch (error) {
        console.error('Failed to fetch TPAs:', error);
        return NextResponse.json({ error: 'Failed to fetch TPAs' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const data = await req.json();

        // Generate slug from name if not provided
        if (!data.slug) {
            data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }

        // Check for existing slug
        const existing = await prisma.tpa.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'TPA with this slug already exists' },
                { status: 400 }
            );
        }

        const tpa = await prisma.tpa.create({
            data: {
                slug: data.slug,
                name: data.name,
                shortName: data.shortName,
                tpaType: data.tpaType || 'private',
                description: data.description,
                logo: data.logo,
                website: data.website,
                customerCarePhone: data.customerCarePhone,
                claimHelpline: data.claimHelpline,
                email: data.email,
                headquartersCity: data.headquartersCity,
                operatingCountries: data.operatingCountries || [],
                operatingStates: data.operatingStates || [],
                operatingCities: data.operatingCities || [],
                licenseNumber: data.licenseNumber,
                regulatoryBody: data.regulatoryBody,
                establishedYear: data.establishedYear,
                networkHospitalsCount: data.networkHospitalsCount,
                livesManaged: data.livesManaged,
                isActive: data.isActive ?? true,
            },
        });

        return NextResponse.json(tpa, { status: 201 });
    } catch (error) {
        console.error('Failed to create TPA:', error);
        return NextResponse.json({ error: 'Failed to create TPA' }, { status: 500 });
    }
}
