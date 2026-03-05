import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * Super-Admin CMS: SEO Command Center
 *
 * GET  — List SEO overrides, auto-fix suggestions, broken link detection
 * POST — Create/update SEO overrides
 * PUT  — Auto-fix missing meta using LLM
 */

export async function GET(request: NextRequest) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action') || 'list';

    if (action === 'list') {
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = (page - 1) * limit;

        const [overrides, total] = await Promise.all([
            prisma.seoOverride.findMany({
                orderBy: { updatedAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            prisma.seoOverride.count(),
        ]);

        return NextResponse.json({
            overrides: overrides.map((o) => ({
                ...o,
                priorityScore: o.priorityScore ? Number(o.priorityScore) : null,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }

    if (action === 'health-check') {
        // Find pages missing meta descriptions
        const missingMeta = await prisma.seoOverride.count({
            where: { metaDescription: null },
        });

        // Find noindex pages
        const noindexed = await prisma.seoOverride.count({
            where: { noIndex: true },
        });

        // Content freshness issues
        const stalePages = await prisma.contentFreshness.count({
            where: { needsRefresh: true },
        });

        // Indexing failures
        const indexFailed = await prisma.indexingLog.count({
            where: { status: 'failed' },
        });

        return NextResponse.json({
            health: {
                missingMetaDescriptions: missingMeta,
                noindexedPages: noindexed,
                stalePages,
                indexingFailures: indexFailed,
                overallScore: Math.max(0, 100 - missingMeta * 0.5 - stalePages * 1 - indexFailed * 2),
            },
        });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const body = await request.json();
        const { urlPattern, metaTitle, metaDescription, h1Override, jsonLdExtra, noIndex, noFollow, ogImage, priorityScore } = body;

        if (!urlPattern) return NextResponse.json({ error: 'urlPattern required' }, { status: 400 });

        const override = await prisma.seoOverride.upsert({
            where: { urlPattern },
            update: {
                metaTitle, metaDescription, h1Override,
                jsonLdExtra: jsonLdExtra || undefined,
                noIndex: noIndex ?? false,
                noFollow: noFollow ?? false,
                ogImage,
                priorityScore: priorityScore ?? 0.5,
            },
            create: {
                urlPattern, metaTitle, metaDescription, h1Override,
                jsonLdExtra: jsonLdExtra || undefined,
                noIndex: noIndex ?? false,
                noFollow: noFollow ?? false,
                ogImage,
                priorityScore: priorityScore ?? 0.5,
            },
        });

        return NextResponse.json({ override });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    // Auto-fix: use LLM to generate missing meta descriptions
    const apiKey = process.env.AI_API_KEY;
    const apiBase = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';
    if (!apiKey) return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });

    const missing = await prisma.seoOverride.findMany({
        where: { metaDescription: null },
        take: 20,
    });

    let fixed = 0;

    for (const override of missing) {
        try {
            const res = await fetch(`${apiBase}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: process.env.AI_MODEL || 'deepseek/deepseek-chat',
                    messages: [{
                        role: 'user',
                        content: `Write a 150-character SEO meta description for this medical page URL: ${override.urlPattern}. Be concise, include the condition and location if present. Output ONLY the meta description.`,
                    }],
                    temperature: 0.3,
                    max_tokens: 100,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const desc = data.choices?.[0]?.message?.content?.trim();
                if (desc) {
                    await prisma.seoOverride.update({
                        where: { id: override.id },
                        data: { metaDescription: desc.substring(0, 500), autoGenerated: true },
                    });
                    fixed++;
                }
            }
        } catch { /* continue */ }
        await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json({ fixed, total: missing.length });
}
