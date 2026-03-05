/**
 * Sitemap Generator Script
 *
 * Generates sitemap entries for all valid combinations of:
 * condition × geography × language
 *
 * Run via: npx ts-node scripts/generate-sitemaps.ts
 * Schedule as a cron job: run daily or after content updates.
 */

import prisma from '../src/lib/db';

const URLS_PER_SITEMAP = parseInt(process.env.SITEMAP_URLS_PER_FILE || '45000', 10);

interface GeoRecord {
    id: number;
    slug: string;
    level: string;
    parentId: number | null;
    supportedLanguages: string[];
}

async function generateSitemapEntries() {
    console.log('🗺️  Starting sitemap generation...');

    // Clear existing entries
    await prisma.sitemapEntry.deleteMany();

    // Fetch all active conditions
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: { id: true, slug: true },
    });

    // Fetch all active geographies with their parent chain
    const geographies: GeoRecord[] = await prisma.geography.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, level: true, parentId: true, supportedLanguages: true },
    });

    // Build parent lookup map
    const geoMap = new Map<number, GeoRecord>(geographies.map((g) => [g.id, g]));

    // Build URL path for each geography
    function buildGeoUrlPath(geoId: number): string {
        const parts: string[] = [];
        let current: GeoRecord | undefined = geoMap.get(geoId);
        while (current) {
            parts.unshift(current.slug);
            current = current.parentId ? geoMap.get(current.parentId) : undefined;
        }
        return parts.join('/');
    }

    const entries: Array<{
        urlPath: string;
        sitemapIndex: number;
        changefreq: string;
        priority: number;
        languageCode: string;
        conditionId: number;
        geographyId: number;
    }> = [];

    let urlCount = 0;

    for (const condition of conditions) {
        for (const geo of geographies) {
            for (const lang of geo.supportedLanguages) {
                const geoPath = buildGeoUrlPath(geo.id);
                // URL: /{country}/{lang}/{condition}/{state?}/{city?}/{locality?}
                const parts = geoPath.split('/');
                const country = parts[0];
                const subPath = parts.slice(1).join('/');

                const urlPath = `/${country}/${lang}/${condition.slug}${subPath ? '/' + subPath : ''}`;
                const sitemapIndex = Math.floor(urlCount / URLS_PER_SITEMAP);

                // Priority based on geo depth
                let priority = 0.5;
                switch (geo.level) {
                    case 'country': priority = 0.6; break;
                    case 'state': priority = 0.7; break;
                    case 'city': priority = 0.8; break;
                    case 'locality': priority = 0.9; break;
                }

                entries.push({
                    urlPath,
                    sitemapIndex,
                    changefreq: 'weekly',
                    priority,
                    languageCode: lang,
                    conditionId: condition.id,
                    geographyId: geo.id,
                });

                urlCount++;
            }
        }
    }

    // Batch insert (chunks of 1000)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        await prisma.sitemapEntry.createMany({ data: batch, skipDuplicates: true });
        process.stdout.write(`\r  Inserted ${Math.min(i + BATCH_SIZE, entries.length)} / ${entries.length} entries`);
    }

    console.log(`\n✅ Generated ${entries.length} sitemap entries across ${Math.ceil(entries.length / URLS_PER_SITEMAP)} sub-sitemaps`);
}

generateSitemapEntries()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
