import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';

/**
 * GET /sitemap-index.xml
 *
 * Master sitemap index referencing all database-driven sub-sitemaps.
 * Cached for 1 hour at the edge.
 */
export async function GET() {
    // Get max sitemap index from database
    const maxIndex = await prisma.sitemapEntry.aggregate({
        _max: { sitemapIndex: true },
    });

    const maxSitemapIndex = maxIndex._max.sitemapIndex || 0;

    // Build sitemap index XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add all numbered sitemaps
    for (let i = 0; i <= maxSitemapIndex; i++) {
        xml += '  <sitemap>\n';
        xml += `    <loc>${SITE_URL}/sitemap/${i}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
    });
}
