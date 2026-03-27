import prisma from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
const URLS_PER_SITEMAP = parseInt(process.env.SITEMAP_URLS_PER_FILE || '45000', 10);

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
    let totalUrls = 0;
    try {
        totalUrls = await prisma.sitemapEntry.count();
    } catch {
        // DB unavailable
    }

    const totalSitemaps = Math.max(1, Math.ceil(totalUrls / URLS_PER_SITEMAP));

    // If all URLs fit in a single sitemap, serve them directly instead of an index
    if (totalSitemaps <= 1) {
        const entries = await prisma.sitemapEntry.findMany({
            orderBy: { priority: 'desc' },
            take: URLS_PER_SITEMAP,
            select: {
                urlPath: true,
                changefreq: true,
                priority: true,
                lastModified: true,
            },
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

    // Multiple sitemaps needed — serve a sitemap index
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: totalSitemaps }, (_, i) => `  <sitemap>
    <loc>${SITE_URL}/sitemap/${i}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    return new Response(sitemapIndex, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
