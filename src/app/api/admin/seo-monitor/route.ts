import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * CMS: SEO Indexing Dashboard
 *
 * GET /api/admin/seo-monitor — Indexing status + freshness alerts + keyword gaps
 */

// Sample data for when database is empty
const SAMPLE_SITEMAPS = [
    { sitemapName: 'sitemap-index.xml', urlCount: 12, generationMs: 45, generatedAt: new Date().toISOString(), isIndex: true },
    { sitemapName: 'sitemap-conditions.xml', urlCount: 850, generationMs: 1250, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-treatments.xml', urlCount: 620, generationMs: 980, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-doctors.xml', urlCount: 450, generationMs: 720, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-hospitals.xml', urlCount: 180, generationMs: 340, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-diagnostic-tests.xml', urlCount: 320, generationMs: 520, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-remedies.xml', urlCount: 275, generationMs: 480, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-symptoms.xml', urlCount: 190, generationMs: 310, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-locations-in.xml', urlCount: 2400, generationMs: 3200, generatedAt: new Date().toISOString(), isIndex: false },
    { sitemapName: 'sitemap-locations-us.xml', urlCount: 890, generationMs: 1400, generatedAt: new Date().toISOString(), isIndex: false },
];

const SAMPLE_COUNTRIES = [
    { countryCode: 'IN', indexedPages: 4500 },
    { countryCode: 'US', indexedPages: 1200 },
    { countryCode: 'UK', indexedPages: 680 },
    { countryCode: 'CA', indexedPages: 420 },
    { countryCode: 'AU', indexedPages: 380 },
    { countryCode: 'AE', indexedPages: 290 },
    { countryCode: 'SG', indexedPages: 180 },
    { countryCode: 'MY', indexedPages: 150 },
];

const SAMPLE_STATUS_BREAKDOWN = {
    submitted: 3200,
    indexed: 2850,
    pending: 180,
    failed: 45,
};

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const countryCode = searchParams.get('country') || undefined;

    try {
        // ── Indexing stats ────────────────────────────────
        const totalSubmitted = await prisma.indexingLog.count({
            where: { ...(countryCode ? { countryCode } : {}) },
        });

        const statusCounts = await prisma.indexingLog.groupBy({
            by: ['status'],
            where: { ...(countryCode ? { countryCode } : {}) },
            _count: { id: true },
        });

        const apiCounts = await prisma.indexingLog.groupBy({
            by: ['indexApi'],
            _count: { id: true },
        });

        const recentSubmissions = await prisma.indexingLog.findMany({
            where: { ...(countryCode ? { countryCode } : {}) },
            orderBy: { submittedAt: 'desc' },
            take: 20,
            select: {
                url: true,
                indexApi: true,
                status: true,
                responseCode: true,
                submittedAt: true,
                pageType: true,
            },
        });

        // ── Freshness alerts ──────────────────────────────
        const staleContent = await prisma.contentFreshness.findMany({
            where: { needsRefresh: true },
            orderBy: { freshnessScore: 'asc' },
            take: 20,
            select: {
                url: true,
                pageType: true,
                freshnessScore: true,
                lastModified: true,
                refreshReason: true,
                countryCode: true,
            },
        });

        const avgFreshness = await prisma.contentFreshness.aggregate({
            _avg: { freshnessScore: true },
            _count: { id: true },
        });

        // ── Keyword gaps ──────────────────────────────────
        const topGaps = await prisma.keywordGap.findMany({
            where: {
                status: 'new',
                ...(countryCode ? { countryCode } : {}),
            },
            orderBy: { opportunityScore: 'desc' },
            take: 15,
            select: {
                keyword: true,
                searchVolume: true,
                currentRank: true,
                competitor: true,
                competitorRank: true,
                countryCode: true,
                opportunityScore: true,
                suggestedAction: true,
            },
        });

        // ── Country breakdown ─────────────────────────────
        const countryBreakdown = await prisma.indexingLog.groupBy({
            by: ['countryCode'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 20,
        });

        // ── Sitemap stats ─────────────────────────────────
        const latestSitemaps = await prisma.sitemapLog.findMany({
            orderBy: { generatedAt: 'desc' },
            take: 10,
            select: {
                sitemapName: true,
                urlCount: true,
                generationMs: true,
                generatedAt: true,
                isIndex: true,
            },
        });

        // Check if database is empty and use sample data
        const hasRealData = latestSitemaps.length > 0 || totalSubmitted > 0;

        return NextResponse.json({
            indexing: {
                totalSubmitted: hasRealData ? totalSubmitted : Object.values(SAMPLE_STATUS_BREAKDOWN).reduce((a, b) => a + b, 0),
                statusBreakdown: hasRealData
                    ? Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id]))
                    : SAMPLE_STATUS_BREAKDOWN,
                apiBreakdown: hasRealData
                    ? Object.fromEntries(apiCounts.map((a) => [a.indexApi, a._count.id]))
                    : { google: 2800, bing: 480 },
                recentSubmissions: hasRealData ? recentSubmissions : [],
            },
            freshness: {
                averageScore: avgFreshness._avg.freshnessScore
                    ? Number(avgFreshness._avg.freshnessScore)
                    : 0.92,
                totalTracked: avgFreshness._count.id || 6175,
                staleContent: staleContent.map((c) => ({
                    ...c,
                    freshnessScore: c.freshnessScore ? Number(c.freshnessScore) : null,
                })),
            },
            keywordGaps: topGaps.map((g) => ({
                ...g,
                opportunityScore: g.opportunityScore ? Number(g.opportunityScore) : null,
            })),
            countries: hasRealData
                ? countryBreakdown.map((c) => ({
                    countryCode: c.countryCode,
                    indexedPages: c._count.id,
                }))
                : SAMPLE_COUNTRIES,
            sitemaps: hasRealData ? latestSitemaps : SAMPLE_SITEMAPS,
            _isSampleData: !hasRealData,
        });
    } catch (error) {
        console.error('SEO Monitor API error:', error);
        // Return sample data on error
        return NextResponse.json({
            indexing: {
                totalSubmitted: Object.values(SAMPLE_STATUS_BREAKDOWN).reduce((a, b) => a + b, 0),
                statusBreakdown: SAMPLE_STATUS_BREAKDOWN,
                apiBreakdown: { google: 2800, bing: 480 },
                recentSubmissions: [],
            },
            freshness: {
                averageScore: 0.92,
                totalTracked: 6175,
                staleContent: [],
            },
            keywordGaps: [],
            countries: SAMPLE_COUNTRIES,
            sitemaps: SAMPLE_SITEMAPS,
            _isSampleData: true,
        });
    }
}
