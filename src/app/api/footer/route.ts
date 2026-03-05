import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * Footer API — Client-side fallback
 *
 * GET /api/footer?country=india&city=delhi&lang=en
 *
 * Returns contextual footer links for client-side hydration
 * when SSR context isn't available (e.g., SPA navigation).
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const countrySlug = searchParams.get('country') || 'india';
        const citySlug = searchParams.get('city');
        const lang = searchParams.get('lang') || 'en';

        // Resolve geography
        let geoId: number | null = null;
        let geoName = '';

    if (citySlug) {
        const city = await prisma.geography.findFirst({
            where: { slug: citySlug, isActive: true },
            select: { id: true, name: true },
        });
        if (city) {
            geoId = city.id;
            geoName = city.name;
        }
    }

    if (!geoId) {
        const country = await prisma.geography.findFirst({
            where: { slug: countrySlug, isActive: true, level: 'country' },
            select: { id: true, name: true },
        });
        if (country) {
            geoId = country.id;
            geoName = country.name;
        }
    }

    // Fetch pinned conditions
    const pinnedConditions = geoId
        ? await prisma.pinnedCondition.findMany({
            where: { geographyId: geoId, isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: {
                condition: { select: { commonName: true, slug: true } },
            },
            take: 10,
        })
        : [];

    // Fetch additional popular conditions
    const pinnedSlugs = pinnedConditions.map((p) => p.condition.slug);
    const additionalConditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            slug: { notIn: pinnedSlugs },
        },
        select: { commonName: true, slug: true },
        take: 20 - pinnedConditions.length,
        orderBy: { createdAt: 'asc' },
    });

    const conditions = [
        ...pinnedConditions.map((p) => ({
            name: p.condition.commonName,
            slug: p.condition.slug,
            isPinned: true,
            url: `/${countrySlug}/${lang}/${p.condition.slug}${citySlug ? `/${citySlug}` : ''}`,
        })),
        ...additionalConditions.map((c) => ({
            name: c.commonName,
            slug: c.slug,
            isPinned: false,
            url: `/${countrySlug}/${lang}/${c.slug}${citySlug ? `/${citySlug}` : ''}`,
        })),
    ];

    // Fetch nearby cities
    let nearbyCities: Array<{ name: string; slug: string; url: string }> = [];
    if (geoId) {
        const parentGeo = await prisma.geography.findFirst({
            where: { id: geoId },
            select: { parentId: true },
        });
        if (parentGeo?.parentId) {
            const cities = await prisma.geography.findMany({
                where: { level: 'city', isActive: true, parentId: parentGeo.parentId },
                select: { name: true, slug: true },
                take: 8,
            });
            nearbyCities = cities.map((c) => ({
                name: c.name,
                slug: c.slug,
                url: `/${countrySlug}/${lang}/${c.slug}`,
            }));
        }
    }

        return NextResponse.json(
            {
                geo: { country: countrySlug, city: citySlug, name: geoName },
                conditions,
                nearbyCities,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error) {
        console.error('Footer API error:', error);
        return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: 500 });
    }
}
