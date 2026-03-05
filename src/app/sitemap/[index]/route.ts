import prisma from '@/lib/db';
import { NextRequest } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
const URLS_PER_SITEMAP = parseInt(process.env.SITEMAP_URLS_PER_FILE || '45000', 10);

/**
 * Sub-Sitemap Handler
 *
 * Serves individual sitemap chunks: /sitemap/0, /sitemap/1, etc.
 * Each chunk contains up to 45,000 URLs to stay within Google's limits.
 */

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ index: string }> }
): Promise<Response> {
    const { index: indexStr } = await params;
    const index = parseInt(indexStr, 10);

    if (isNaN(index) || index < 0) {
        return new Response('Invalid sitemap index', { status: 400 });
    }

    const entries = await prisma.sitemapEntry.findMany({
        where: { sitemapIndex: index },
        orderBy: { lastModified: 'desc' },
        take: URLS_PER_SITEMAP,
        select: {
            urlPath: true,
            changefreq: true,
            priority: true,
            lastModified: true,
        },
    });

    if (entries.length === 0) {
        return new Response('Sitemap not found', { status: 404 });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((entry) => `  <url>
    <loc>${SITE_URL}${entry.urlPath}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
