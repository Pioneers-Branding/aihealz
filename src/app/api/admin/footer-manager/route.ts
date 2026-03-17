import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * Dynamic Footer Manager
 *
 * GET  — Get footer template for a given city/country
 * POST — Create/update footer templates
 *
 * Requires admin authentication.
 */

export async function GET(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }
    const { searchParams } = request.nextUrl;
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const action = searchParams.get('action') || 'resolve';

    if (action === 'list') {
        const templates = await prisma.footerTemplate.findMany({
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
            include: { geography: { select: { name: true, slug: true } } },
        });
        return NextResponse.json({ templates });
    }

    // Resolve: find best-match template for location
    const candidates = await prisma.footerTemplate.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
    });

    // Priority: city > country > continent > default
    let matched = candidates.find((t) => t.matchType === 'city' && t.matchValue === city);
    if (!matched) matched = candidates.find((t) => t.matchType === 'country' && t.matchValue === country);
    if (!matched) matched = candidates.find((t) => t.matchType === 'default');

    // If trending footer is enabled, inject top conditions
    let trending: Array<{ condition: string; slug: string }> = [];
    if (city || country) {
        const geoFilter = city
            ? { geography: { slug: city } }
            : country ? { geography: { parent: { slug: country } } } : {};

        const recentSearches = await prisma.keywordSearchLog.groupBy({
            by: ['normalizedQuery'],
            where: {
                ...geoFilter,
                createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
        });

        trending = recentSearches.map((s) => ({
            condition: s.normalizedQuery || '',
            slug: (s.normalizedQuery || '').replace(/\s+/g, '-').toLowerCase(),
        }));
    }

    return NextResponse.json({
        template: matched?.templateData || {},
        trending,
        matchType: matched?.matchType || 'none',
    });
}

export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const body = await request.json();
        const { ruleName, matchType, matchValue, geographyId, templateData, priority } = body;

        if (!ruleName || !matchType) {
            return NextResponse.json({ error: 'ruleName and matchType required' }, { status: 400 });
        }

        const template = await prisma.footerTemplate.create({
            data: {
                ruleName,
                matchType,
                matchValue: matchValue || '*',
                geographyId: geographyId ? parseInt(geographyId, 10) : null,
                templateData: templateData || {},
                priority: priority || 0,
            },
        });

        return NextResponse.json({ template });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
