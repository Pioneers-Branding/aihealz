import prisma from '@/lib/db';

/**
 * Dynamic Sitemap Generator
 *
 * Master Sitemap Index → Country sub-sitemaps → City sub-sitemaps
 *
 * Since Google limits sitemaps to 50,000 URLs, we split:
 * - sitemap-index.xml (master)
 * - sitemap-doctors-{country}.xml
 * - sitemap-conditions-{country}-{state}.xml
 * - sitemap-cities-{country}.xml
 * - sitemap-content-{lang}.xml
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
const MAX_URLS_PER_SITEMAP = 45000; // Leave buffer under 50k limit

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    alternates?: Array<{ hreflang: string; href: string }>;
}

export interface SitemapFile {
    name: string;
    urls: SitemapUrl[];
    countryCode?: string;
}

/**
 * Generate all sitemap files for the platform.
 */
export async function generateAllSitemaps(): Promise<SitemapFile[]> {
    const startTime = Date.now();
    const sitemaps: SitemapFile[] = [];

    // ── Static pages ──────────────────────────────────
    const staticSitemap: SitemapFile = {
        name: 'sitemap-static.xml',
        urls: [
            // Main pages
            { loc: SITE_URL, changefreq: 'daily', priority: 1.0 },
            { loc: `${SITE_URL}/analyze`, changefreq: 'weekly', priority: 0.9 },
            { loc: `${SITE_URL}/conditions`, changefreq: 'daily', priority: 0.95 },
            { loc: `${SITE_URL}/treatments`, changefreq: 'daily', priority: 0.95 },
            { loc: `${SITE_URL}/doctors`, changefreq: 'daily', priority: 0.95 },
            { loc: `${SITE_URL}/hospitals`, changefreq: 'weekly', priority: 0.9 },
            { loc: `${SITE_URL}/insurance`, changefreq: 'weekly', priority: 0.85 },
            { loc: `${SITE_URL}/diagnostic-labs`, changefreq: 'weekly', priority: 0.85 },
            { loc: `${SITE_URL}/tests`, changefreq: 'weekly', priority: 0.85 },
            { loc: `${SITE_URL}/symptoms`, changefreq: 'weekly', priority: 0.9 },
            { loc: `${SITE_URL}/medical-travel`, changefreq: 'weekly', priority: 0.8 },
            { loc: `${SITE_URL}/remedies`, changefreq: 'weekly', priority: 0.7 },
            { loc: `${SITE_URL}/clinical-reference`, changefreq: 'weekly', priority: 0.8 },
            { loc: `${SITE_URL}/healz-ai`, changefreq: 'weekly', priority: 0.9 },

            // Health Tools
            { loc: `${SITE_URL}/tools`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/bmi-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/bmr-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/body-fat-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/diabetes-risk-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/heart-risk-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/kidney-function-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/pregnancy-due-date-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/water-intake-calculator`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/drug-interactions`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/lab-tests`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/glossary`, changefreq: 'monthly', priority: 0.6 },
            { loc: `${SITE_URL}/tools/emergency`, changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/tools/vaccinations`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/tools/surgery-checklist`, changefreq: 'monthly', priority: 0.7 },

            // For Doctors
            { loc: `${SITE_URL}/for-doctors`, changefreq: 'weekly', priority: 0.8 },
            { loc: `${SITE_URL}/for-doctors/pricing`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/for-doctors/clinical-scores`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/for-doctors/drug-dosing`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/for-doctors/quick-reference`, changefreq: 'monthly', priority: 0.7 },
            { loc: `${SITE_URL}/for-doctors/surgical-checklist`, changefreq: 'monthly', priority: 0.7 },

            // Provider pages
            { loc: `${SITE_URL}/provider`, changefreq: 'weekly', priority: 0.7 },
            { loc: `${SITE_URL}/provider/login`, changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/provider/hospital/register`, changefreq: 'monthly', priority: 0.6 },
            { loc: `${SITE_URL}/provider/lab/register`, changefreq: 'monthly', priority: 0.6 },

            // Advertising
            { loc: `${SITE_URL}/advertise`, changefreq: 'monthly', priority: 0.6 },
            { loc: `${SITE_URL}/advertise/pricing`, changefreq: 'monthly', priority: 0.5 },

            // Pricing
            { loc: `${SITE_URL}/pricing`, changefreq: 'monthly', priority: 0.7 },

            // Chat/AI features
            { loc: `${SITE_URL}/chat/consult`, changefreq: 'weekly', priority: 0.8 },
            { loc: `${SITE_URL}/chat/diagnostic`, changefreq: 'weekly', priority: 0.8 },

            // Static/Legal pages
            { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/privacy`, changefreq: 'yearly', priority: 0.3 },
            { loc: `${SITE_URL}/terms`, changefreq: 'yearly', priority: 0.3 },
        ],
    };
    sitemaps.push(staticSitemap);

    // ── Get all active countries ──────────────────────
    const countries = await prisma.geography.findMany({
        where: { level: 'country', isActive: true },
        select: { id: true, slug: true, isoCode: true, supportedLanguages: true },
    });

    for (const country of countries) {
        // ── Doctor sitemaps per country ──────────────────
        const doctors = await prisma.doctorProvider.findMany({
            where: {
                isVerified: true,
                geography: {
                    OR: [
                        { id: country.id },
                        { parent: { id: country.id } },
                        { parent: { parent: { id: country.id } } },
                        { parent: { parent: { parent: { id: country.id } } } },
                    ],
                },
            },
            select: { slug: true, updatedAt: true },
        });

        if (doctors.length > 0) {
            const chunks = chunkArray(doctors, MAX_URLS_PER_SITEMAP);
            for (let i = 0; i < chunks.length; i++) {
                const suffix = chunks.length > 1 ? `-${i + 1}` : '';
                sitemaps.push({
                    name: `sitemap-doctors-${country.slug}${suffix}.xml`,
                    countryCode: country.isoCode || undefined,
                    urls: chunks[i].map((d) => ({
                        loc: `${SITE_URL}/doctor/${d.slug}`,
                        lastmod: d.updatedAt.toISOString().split('T')[0],
                        changefreq: 'weekly' as const,
                        priority: 0.7,
                    })),
                });
            }
        }

        // ── City + condition sitemaps ────────────────────
        // Route format: /{country}/{lang}/{condition}/{state}/{city}
        const states = await prisma.geography.findMany({
            where: { parentId: country.id, isActive: true },
            select: { id: true, slug: true },
        });

        // Get all conditions with page content (only index those with generated content)
        const conditionsWithContent = await prisma.medicalCondition.findMany({
            where: {
                isActive: true,
                pageContent: { some: {} }  // Only conditions that have generated content
            },
            select: { slug: true, updatedAt: true },
        });

        const defaultLang = 'en';
        const supportedLangs = country.supportedLanguages || ['en'];

        for (const state of states) {
            const cities = await prisma.geography.findMany({
                where: { parentId: state.id, isActive: true },
                select: { slug: true },
            });

            const conditionCityUrls: SitemapUrl[] = [];

            for (const city of cities) {
                // Condition × city pages for each language
                // URL format: /{country}/{lang}/{condition}/{state}/{city}
                for (const condition of conditionsWithContent) {
                    // Primary English URL
                    const primaryUrl = `${SITE_URL}/${country.slug}/${defaultLang}/${condition.slug}/${state.slug}/${city.slug}`;

                    // Generate alternates for all supported languages
                    const alternates = supportedLangs.map((lang) => ({
                        hreflang: `${lang}-${country.isoCode || country.slug.toUpperCase()}`,
                        href: `${SITE_URL}/${country.slug}/${lang}/${condition.slug}/${state.slug}/${city.slug}`,
                    }));

                    // Add x-default pointing to English
                    alternates.push({
                        hreflang: 'x-default',
                        href: primaryUrl,
                    });

                    conditionCityUrls.push({
                        loc: primaryUrl,
                        lastmod: condition.updatedAt.toISOString().split('T')[0],
                        changefreq: 'weekly',
                        priority: 0.9,
                        alternates,
                    });

                    // Also add entries for non-English languages (so Google can discover them)
                    for (const lang of supportedLangs.filter(l => l !== defaultLang)) {
                        conditionCityUrls.push({
                            loc: `${SITE_URL}/${country.slug}/${lang}/${condition.slug}/${state.slug}/${city.slug}`,
                            lastmod: condition.updatedAt.toISOString().split('T')[0],
                            changefreq: 'weekly',
                            priority: 0.85,
                            alternates,
                        });
                    }
                }
            }

            if (conditionCityUrls.length > 0) {
                const chunks = chunkArray(conditionCityUrls, MAX_URLS_PER_SITEMAP);
                for (let i = 0; i < chunks.length; i++) {
                    const suffix = chunks.length > 1 ? `-${i + 1}` : '';
                    sitemaps.push({
                        name: `sitemap-${country.slug}-${state.slug}${suffix}.xml`,
                        countryCode: country.isoCode || undefined,
                        urls: chunks[i],
                    });
                }
            }
        }
    }

    // ── Hospital sitemaps per country ─────────────────
    for (const country of countries) {
        const hospitals = await prisma.hospital.findMany({
            where: {
                isActive: true,
                geography: {
                    OR: [
                        { id: country.id },
                        { parent: { id: country.id } },
                        { parent: { parent: { id: country.id } } },
                    ],
                },
            },
            select: { slug: true, updatedAt: true },
        });

        if (hospitals.length > 0) {
            sitemaps.push({
                name: `sitemap-hospitals-${country.slug}.xml`,
                countryCode: country.isoCode || undefined,
                urls: hospitals.map((h) => ({
                    loc: `${SITE_URL}/hospitals/${h.slug}`,
                    lastmod: h.updatedAt.toISOString().split('T')[0],
                    changefreq: 'weekly' as const,
                    priority: 0.8,
                })),
            });
        }
    }

    // ── Treatments sitemap (from TreatmentCost for unique treatments) ──
    // Note: Treatment data comes from JSON file, not a dedicated table
    // Static treatments page already included in static sitemap

    // ── Insurance providers sitemap ─────────────────────
    const insurers = await prisma.insuranceProvider.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });

    if (insurers.length > 0) {
        sitemaps.push({
            name: 'sitemap-insurance.xml',
            urls: insurers.map((i) => ({
                loc: `${SITE_URL}/insurance/${i.slug}`,
                lastmod: i.updatedAt.toISOString().split('T')[0],
                changefreq: 'weekly' as const,
                priority: 0.7,
            })),
        });
    }

    // ── Diagnostic providers (labs) per country ─────────────────────
    for (const country of countries) {
        const labs = await prisma.diagnosticProvider.findMany({
            where: {
                isActive: true,
                geography: {
                    OR: [
                        { id: country.id },
                        { parent: { id: country.id } },
                        { parent: { parent: { id: country.id } } },
                    ],
                },
            },
            select: { slug: true, updatedAt: true },
        });

        if (labs.length > 0) {
            sitemaps.push({
                name: `sitemap-labs-${country.slug}.xml`,
                countryCode: country.isoCode || undefined,
                urls: labs.map((l) => ({
                    loc: `${SITE_URL}/diagnostic-labs/${l.slug}`,
                    lastmod: l.updatedAt.toISOString().split('T')[0],
                    changefreq: 'weekly' as const,
                    priority: 0.7,
                })),
            });
        }
    }

    // ── Tests sitemap ───────────────────────────────────
    const tests = await prisma.diagnosticTest.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });

    if (tests.length > 0) {
        const chunks = chunkArray(tests, MAX_URLS_PER_SITEMAP);
        for (let i = 0; i < chunks.length; i++) {
            const suffix = chunks.length > 1 ? `-${i + 1}` : '';
            sitemaps.push({
                name: `sitemap-tests${suffix}.xml`,
                urls: chunks[i].map((t) => ({
                    loc: `${SITE_URL}/tests/${t.slug}`,
                    lastmod: t.updatedAt.toISOString().split('T')[0],
                    changefreq: 'monthly' as const,
                    priority: 0.6,
                })),
            });
        }
    }

    // ── Medical conditions sitemap (global pages without location) ──────
    // URL format: /{country}/{lang}/{condition} - default to India/English
    const allConditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            pageContent: { some: {} }  // Only conditions with generated content
        },
        select: { slug: true, updatedAt: true },
    });

    if (allConditions.length > 0) {
        // Generate condition URLs for each major country
        const majorCountries = ['india', 'usa', 'uk'];
        const conditionUrls: SitemapUrl[] = [];

        for (const countrySlug of majorCountries) {
            for (const c of allConditions) {
                conditionUrls.push({
                    loc: `${SITE_URL}/${countrySlug}/en/${c.slug}`,
                    lastmod: c.updatedAt.toISOString().split('T')[0],
                    changefreq: 'weekly' as const,
                    priority: 0.85,
                });
            }
        }

        const chunks = chunkArray(conditionUrls, MAX_URLS_PER_SITEMAP);
        for (let i = 0; i < chunks.length; i++) {
            const suffix = chunks.length > 1 ? `-${i + 1}` : '';
            sitemaps.push({
                name: `sitemap-conditions${suffix}.xml`,
                urls: chunks[i],
            });
        }
    }

    // ── Localized content sitemaps ─────────────────────
    const languages = await prisma.language.findMany({
        where: { isActive: true },
        select: { code: true },
    });

    for (const lang of languages) {
        const content = await prisma.localizedContent.findMany({
            where: { languageCode: lang.code, status: 'published' },
            select: { condition: { select: { slug: true } }, geography: { select: { slug: true } }, updatedAt: true },
            take: MAX_URLS_PER_SITEMAP,
        });

        if (content.length > 0) {
            sitemaps.push({
                name: `sitemap-content-${lang.code}.xml`,
                urls: content.map((c) => ({
                    loc: `${SITE_URL}/${lang.code}/${c.geography?.slug || 'global'}/${c.condition.slug}`,
                    lastmod: c.updatedAt.toISOString().split('T')[0],
                    changefreq: 'monthly' as const,
                    priority: 0.6,
                })),
            });
        }
    }

    // ── Log generation ────────────────────────────────
    const totalUrls = sitemaps.reduce((sum, s) => sum + s.urls.length, 0);
    for (const sm of sitemaps) {
        await prisma.sitemapLog.create({
            data: {
                sitemapName: sm.name,
                urlCount: sm.urls.length,
                generationMs: Date.now() - startTime,
                countryCode: sm.countryCode || null,
                isIndex: false,
            },
        });
    }

    // Log the index itself
    await prisma.sitemapLog.create({
        data: {
            sitemapName: 'sitemap-index.xml',
            urlCount: totalUrls,
            generationMs: Date.now() - startTime,
            isIndex: true,
        },
    });

    return sitemaps;
}

/**
 * Generate sitemap XML string from URLs.
 */
export function buildSitemapXml(urls: SitemapUrl[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
    xml += ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    for (const url of urls) {
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
        if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        if (url.priority !== undefined) xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
        if (url.alternates) {
            for (const alt of url.alternates) {
                xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />\n`;
            }
        }
        xml += '  </url>\n';
    }

    xml += '</urlset>';
    return xml;
}

/**
 * Generate sitemap index XML.
 */
export function buildSitemapIndexXml(sitemapNames: string[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const name of sitemapNames) {
        xml += '  <sitemap>\n';
        xml += `    <loc>${SITE_URL}/${name}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';
    return xml;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

function escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
