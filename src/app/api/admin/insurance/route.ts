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
    const type = searchParams.get('type') || '';
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

        if (type) {
            where.providerType = type;
        }

        const [providers, total] = await Promise.all([
            prisma.insuranceProvider.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            plans: true,
                            hospitalTies: true,
                            tpaAssociations: true,
                            claims: true,
                        },
                    },
                },
            }),
            prisma.insuranceProvider.count({ where }),
        ]);

        // Get aggregate stats
        const stats = await prisma.insuranceProvider.aggregate({
            _count: true,
            _avg: { claimSettlementRatio: true, rating: true },
        });

        const activeCount = await prisma.insuranceProvider.count({ where: { isActive: true } });

        // Get type distribution
        const typeDistribution = await prisma.insuranceProvider.groupBy({
            by: ['providerType'],
            _count: true,
        });

        return NextResponse.json({
            providers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total: stats._count,
                active: activeCount,
                avgCSR: Number(stats._avg.claimSettlementRatio || 0).toFixed(1),
                avgRating: Number(stats._avg.rating || 0).toFixed(1),
                typeDistribution: typeDistribution.map(t => ({
                    type: t.providerType,
                    count: t._count,
                })),
            },
        });
    } catch (error) {
        console.error('Failed to fetch insurance providers:', error);
        return NextResponse.json({ error: 'Failed to fetch insurance providers' }, { status: 500 });
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
        const existing = await prisma.insuranceProvider.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Insurance provider with this slug already exists' },
                { status: 400 }
            );
        }

        const provider = await prisma.insuranceProvider.create({
            data: {
                slug: data.slug,
                name: data.name,
                shortName: data.shortName,
                providerType: data.providerType || 'private',
                description: data.description,
                logo: data.logo,
                headquartersCountry: data.headquartersCountry || 'India',
                headquartersCity: data.headquartersCity,
                website: data.website,
                customerCarePhone: data.customerCarePhone,
                claimPhone: data.claimPhone,
                email: data.email,
                operatingCountries: data.operatingCountries || [],
                operatingStates: data.operatingStates || [],
                licenseNumber: data.licenseNumber,
                regulatoryBody: data.regulatoryBody,
                establishedYear: data.establishedYear,
                claimSettlementRatio: data.claimSettlementRatio,
                isActive: data.isActive ?? true,
            },
        });

        return NextResponse.json(provider, { status: 201 });
    } catch (error) {
        console.error('Failed to create insurance provider:', error);
        return NextResponse.json({ error: 'Failed to create insurance provider' }, { status: 500 });
    }
}
