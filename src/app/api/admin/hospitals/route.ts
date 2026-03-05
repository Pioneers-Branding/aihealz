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
    const city = searchParams.get('city') || '';
    const isVerified = searchParams.get('isVerified');
    const skip = (page - 1) * limit;

    try {
        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (type) {
            where.hospitalType = type;
        }

        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }

        if (isVerified !== null && isVerified !== undefined) {
            where.isVerified = isVerified === 'true';
        }

        const [hospitals, total] = await Promise.all([
            prisma.hospital.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    geography: {
                        select: { name: true, slug: true },
                    },
                    _count: {
                        select: {
                            doctors: true,
                            reviews: true,
                            enquiries: true,
                            specialties: true,
                            insuranceTies: true,
                        },
                    },
                },
            }),
            prisma.hospital.count({ where }),
        ]);

        // Get aggregate stats
        const stats = await prisma.hospital.aggregate({
            _count: true,
            _avg: { bedCount: true, overallRating: true },
        });

        const verifiedCount = await prisma.hospital.count({ where: { isVerified: true } });
        const activeCount = await prisma.hospital.count({ where: { isActive: true } });

        return NextResponse.json({
            hospitals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total: stats._count,
                verified: verifiedCount,
                active: activeCount,
                avgBeds: Math.round(stats._avg.bedCount || 0),
                avgRating: Number(stats._avg.overallRating || 0).toFixed(1),
            },
        });
    } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
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
        const existing = await prisma.hospital.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Hospital with this slug already exists' },
                { status: 400 }
            );
        }

        const hospital = await prisma.hospital.create({
            data: {
                slug: data.slug,
                name: data.name,
                hospitalType: data.hospitalType || 'private',
                description: data.description,
                tagline: data.tagline,
                logo: data.logo,
                coverImage: data.coverImage,
                images: data.images || [],
                address: data.address,
                city: data.city,
                state: data.state,
                country: data.country || 'India',
                pincode: data.pincode,
                latitude: data.latitude,
                longitude: data.longitude,
                phone: data.phone,
                emergencyPhone: data.emergencyPhone,
                email: data.email,
                website: data.website,
                bedCount: data.bedCount,
                icuBeds: data.icuBeds,
                operationTheaters: data.operationTheaters,
                emergencyBeds: data.emergencyBeds,
                accreditations: data.accreditations || [],
                geographyId: data.geographyId,
                isActive: data.isActive ?? true,
                isVerified: data.isVerified ?? false,
            },
        });

        return NextResponse.json(hospital, { status: 201 });
    } catch (error) {
        console.error('Failed to create hospital:', error);
        return NextResponse.json({ error: 'Failed to create hospital' }, { status: 500 });
    }
}
