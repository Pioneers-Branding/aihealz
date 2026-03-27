import prisma from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
const URLS_PER_SITEMAP = parseInt(process.env.SITEMAP_URLS_PER_FILE || '45000', 10);

/**
 * Sitemap Index Handler
 *
 * For 500,000+ URLs, we use a Sitemap Index strategy:
 * - GET /sitemap.xml → Returns sitemap index pointing to sub-sitemaps
 * - GET /sitemap-0.xml → First 45,000 URLs
 * - GET /sitemap-1.xml → Next 45,000 URLs
 * - ...etc
 *
 * Each sub-sitemap stays under the 50,000 URL / 50MB limit.
 */

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
    // Count total URLs
    let totalUrls = 0;
    try {
        totalUrls = await prisma.sitemapEntry.count();
    } catch {
        // DB unavailable, return minimal sitemap index
    }
    const totalSitemaps = Math.max(1, Math.ceil(totalUrls / URLS_PER_SITEMAP));

    // Generate sitemap index - using /sitemap/{index} route format
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
