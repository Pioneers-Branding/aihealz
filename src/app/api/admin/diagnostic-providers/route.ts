import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const [providers, stats] = await Promise.all([
      prisma.diagnosticProvider.findMany({
        include: {
          geography: { select: { name: true } },
          _count: { select: { testPrices: true, packages: true, bookings: true, reviews: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      prisma.diagnosticProvider.aggregate({
        _count: true,
        _avg: { rating: true },
      }),
    ]);

    const partnerCount = providers.filter((p) => p.isPartner).length;
    const verifiedCount = providers.filter((p) => p.isVerified).length;
    const homeCollectionCount = providers.filter((p) => p.homeCollectionAvailable).length;

    return NextResponse.json({
      providers: providers.map(p => ({
        ...p,
        rating: p.rating ? Number(p.rating) : null,
      })),
      stats: {
        total: stats._count,
        avgRating: stats._avg.rating ? Number(stats._avg.rating).toFixed(1) : null,
        partners: partnerCount,
        verified: verifiedCount,
        homeCollection: homeCollectionCount,
      },
    });
  } catch (error) {
    console.error('Failed to fetch diagnostic providers:', error);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = checkAdminAuth(req);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

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
    const existing = await prisma.diagnosticProvider.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Provider with this slug already exists' },
        { status: 400 }
      );
    }

    const provider = await prisma.diagnosticProvider.create({
      data: {
        slug: data.slug,
        name: data.name,
        providerType: data.providerType || 'lab',
        description: data.description,
        logo: data.logo,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        accreditations: data.accreditations || [],
        homeCollectionAvailable: data.homeCollectionAvailable || false,
        homeCollectionFee: data.homeCollectionFee,
        isPartner: data.isPartner || false,
        isVerified: data.isVerified || false,
        isActive: data.isActive ?? true,
        geographyId: data.geographyId,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error('Failed to create diagnostic provider:', error);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
