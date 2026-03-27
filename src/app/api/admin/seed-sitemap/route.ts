import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import prisma from '@/lib/db';

const URLS_PER_SITEMAP = 45000;

interface SitemapUrl {
    urlPath: string;
    changefreq: string;
    priority: number;
    conditionId?: number;
    geographyId?: number;
    languageCode?: string;
}

/**
 * POST /api/admin/seed-sitemap
 *
 * Populates the sitemap_entries table with ALL indexable URLs:
 * - Static pages (tools, info, for-doctors, advertise, etc.)
 * - Conditions by specialty (from DB)
 * - Doctor specialty pages (from DB)
 * - Doctor profile pages
 * - Doctor location pages (country/city level)
 * - Hospital pages + enquiry pages
 * - Insurance provider pages
 * - Diagnostic lab pages
 * - Diagnostic test pages + test-by-city pages
 * - Diagnostic test category pages
 * - Treatment pages
 * - Localized condition pages (country/lang/condition/city)
 * - Localized condition cost pages
 * - Localized treatment pages
 * - Clinical reference category pages
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { clearExisting = true } = body;

        if (clearExisting) {
            await prisma.sitemapEntry.deleteMany({});
            console.log('Cleared existing sitemap entries');
        }

        const urls: SitemapUrl[] = [];

        // ── 1. Static pages ──────────────────────────────────
        const staticPages = [
            // Core pages
            { path: '/', changefreq: 'daily', priority: 1.0 },
            { path: '/conditions', changefreq: 'daily', priority: 0.95 },
            { path: '/treatments', changefreq: 'daily', priority: 0.95 },
            { path: '/doctors', changefreq: 'daily', priority: 0.95 },
            { path: '/hospitals', changefreq: 'weekly', priority: 0.9 },
            { path: '/insurance', changefreq: 'weekly', priority: 0.85 },
            { path: '/diagnostic-labs', changefreq: 'weekly', priority: 0.85 },
            { path: '/tests', changefreq: 'weekly', priority: 0.85 },
            { path: '/symptoms', changefreq: 'weekly', priority: 0.9 },
            { path: '/remedies', changefreq: 'weekly', priority: 0.7 },
            { path: '/clinical-reference', changefreq: 'weekly', priority: 0.8 },
            // AI & analysis
            { path: '/healz-ai', changefreq: 'weekly', priority: 0.9 },
            { path: '/analyze', changefreq: 'weekly', priority: 0.9 },
            // Medical travel
            { path: '/medical-travel', changefreq: 'weekly', priority: 0.8 },
            { path: '/medical-travel/bot', changefreq: 'monthly', priority: 0.6 },
            // Chat & consultation
            { path: '/chat/consult', changefreq: 'weekly', priority: 0.85 },
            { path: '/chat/diagnostic', changefreq: 'weekly', priority: 0.85 },
            // Booking
            { path: '/book/doctor', changefreq: 'weekly', priority: 0.8 },
            // Health vault
            { path: '/vault', changefreq: 'weekly', priority: 0.7 },
            // Tools
            { path: '/tools', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/bmi-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/bmr-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/body-fat-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/diabetes-risk-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/heart-risk-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/kidney-function-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/pregnancy-due-date-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/water-intake-calculator', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/drug-interactions', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/lab-tests', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/glossary', changefreq: 'monthly', priority: 0.6 },
            { path: '/tools/emergency', changefreq: 'monthly', priority: 0.8 },
            { path: '/tools/vaccinations', changefreq: 'monthly', priority: 0.7 },
            { path: '/tools/surgery-checklist', changefreq: 'monthly', priority: 0.7 },
            // For doctors
            { path: '/for-doctors', changefreq: 'weekly', priority: 0.8 },
            { path: '/for-doctors/clinical-scores', changefreq: 'monthly', priority: 0.7 },
            { path: '/for-doctors/drug-dosing', changefreq: 'monthly', priority: 0.7 },
            { path: '/for-doctors/quick-reference', changefreq: 'monthly', priority: 0.7 },
            { path: '/for-doctors/surgical-checklist', changefreq: 'monthly', priority: 0.7 },
            // Advertise
            { path: '/advertise', changefreq: 'monthly', priority: 0.6 },
            { path: '/advertise/pricing', changefreq: 'monthly', priority: 0.6 },
            { path: '/advertise/enquiry', changefreq: 'monthly', priority: 0.5 },
            // Pricing
            { path: '/pricing', changefreq: 'monthly', priority: 0.7 },
            // Doctors join
            { path: '/doctors/join', changefreq: 'monthly', priority: 0.6 },
            // Info pages
            { path: '/about', changefreq: 'monthly', priority: 0.5 },
            { path: '/contact', changefreq: 'monthly', priority: 0.5 },
            { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
            { path: '/terms', changefreq: 'yearly', priority: 0.3 },
        ];

        for (const page of staticPages) {
            urls.push({
                urlPath: page.path,
                changefreq: page.changefreq,
                priority: page.priority,
            });
        }

        // ── 2. Medical specialties (from DB) ──────────────────
        const specialties = await prisma.medicalSpecialty.findMany({
            where: { isActive: true },
            select: { slug: true },
        });

        for (const s of specialties) {
            // /conditions/[specialty]
            urls.push({
                urlPath: `/conditions/${s.slug}`,
                changefreq: 'weekly',
                priority: 0.85,
            });
            // /doctors/specialty/[specialty]
            urls.push({
                urlPath: `/doctors/specialty/${s.slug}`,
                changefreq: 'weekly',
                priority: 0.8,
            });
        }

        // ── 3. Doctor profile pages ──────────────────────────
        const doctors = await prisma.doctorProvider.findMany({
            where: { isVerified: true },
            select: { slug: true },
        });

        for (const doctor of doctors) {
            urls.push({
                urlPath: `/doctor/${doctor.slug}`,
                changefreq: 'weekly',
                priority: 0.7,
            });
        }

        // ── 4. Hospital pages + enquiry pages ────────────────
        const hospitals = await prisma.hospital.findMany({
            where: { isActive: true },
            select: { slug: true },
        });

        for (const hospital of hospitals) {
            urls.push({
                urlPath: `/hospitals/${hospital.slug}`,
                changefreq: 'weekly',
                priority: 0.8,
            });
            urls.push({
                urlPath: `/hospitals/${hospital.slug}/enquire`,
                changefreq: 'monthly',
                priority: 0.5,
            });
        }

        // ── 5. Diagnostic lab pages ──────────────────────────
        const labs = await prisma.diagnosticProvider.findMany({
            where: { isActive: true },
            select: { slug: true },
        });

        for (const lab of labs) {
            urls.push({
                urlPath: `/diagnostic-labs/${lab.slug}`,
                changefreq: 'weekly',
                priority: 0.7,
            });
        }

        // ── 6. Insurance provider pages ──────────────────────
        const insurers = await prisma.insuranceProvider.findMany({
            where: { isActive: true },
            select: { slug: true },
        });

        for (const insurer of insurers) {
            urls.push({
                urlPath: `/insurance/${insurer.slug}`,
                changefreq: 'weekly',
                priority: 0.7,
            });
        }

        // ── 7. Diagnostic test pages ─────────────────────────
        const tests = await prisma.diagnosticTest.findMany({
            where: { isActive: true },
            select: { slug: true },
        });

        for (const test of tests) {
            urls.push({
                urlPath: `/tests/${test.slug}`,
                changefreq: 'monthly',
                priority: 0.6,
            });
            // /book/test/[slug]
            urls.push({
                urlPath: `/book/test/${test.slug}`,
                changefreq: 'monthly',
                priority: 0.5,
            });
        }

        // ── 8. Diagnostic test categories ────────────────────
        const testCategories = await prisma.diagnosticCategory.findMany({
            where: { isActive: true },
            select: { slug: true },
        });

        for (const cat of testCategories) {
            urls.push({
                urlPath: `/tests/category/${cat.slug}`,
                changefreq: 'monthly',
                priority: 0.6,
            });
        }

        // ── 9. Fetch all geographies ─────────────────────────
        const allGeo = await prisma.geography.findMany({
            where: { isActive: true },
            select: {
                id: true,
                slug: true,
                level: true,
                supportedLanguages: true,
                parent: {
                    select: {
                        slug: true,
                        level: true,
                        parent: { select: { slug: true, level: true } },
                    },
                },
            },
        });

        const countriesGeo = allGeo.filter((g) => g.level === 'country');
        const citiesGeo = allGeo.filter((g) => g.level === 'city');

        // ── 10. Doctor location pages ────────────────────────
        // /doctors/[location] and /doctors/[location]/[lang]
        for (const city of citiesGeo) {
            const languages = city.supportedLanguages?.length ? city.supportedLanguages : ['en'];
            urls.push({
                urlPath: `/doctors/${city.slug}`,
                changefreq: 'weekly',
                priority: 0.7,
            });
            for (const lang of languages) {
                if (lang !== 'en') {
                    urls.push({
                        urlPath: `/doctors/${city.slug}/${lang}`,
                        changefreq: 'weekly',
                        priority: 0.65,
                        languageCode: lang,
                    });
                }
            }
        }

        // ── 11. Tests by city ────────────────────────────────
        // /tests/[slug]/[city] — top tests × active cities
        const topTests = tests.slice(0, 50);
        for (const test of topTests) {
            for (const city of citiesGeo.slice(0, 100)) {
                urls.push({
                    urlPath: `/tests/${test.slug}/${city.slug}`,
                    changefreq: 'monthly',
                    priority: 0.55,
                    geographyId: city.id,
                });
            }
        }

        // ── 12. Conditions (all active) ──────────────────────
        const conditions = await prisma.medicalCondition.findMany({
            where: { isActive: true },
            select: { id: true, slug: true },
        });

        // ── 13. Localized condition pages ────────────────────
        // /[country]/[lang]/[condition] — country-level (all conditions)
        for (const country of countriesGeo) {
            const languages = country.supportedLanguages?.length ? country.supportedLanguages : ['en'];
            for (const lang of languages) {
                for (const condition of conditions) {
                    urls.push({
                        urlPath: `/${country.slug}/${lang}/${condition.slug}`,
                        changefreq: 'weekly',
                        priority: 0.85,
                        conditionId: condition.id,
                        languageCode: lang,
                    });
                    // /[country]/[lang]/[condition]/cost
                    urls.push({
                        urlPath: `/${country.slug}/${lang}/${condition.slug}/cost`,
                        changefreq: 'weekly',
                        priority: 0.7,
                        conditionId: condition.id,
                        languageCode: lang,
                    });
                }
            }
        }

        // /[country]/[lang]/[condition]/[city] — city-level (top conditions)
        const topConditions = conditions.slice(0, 200);
        for (const city of citiesGeo) {
            const countrySlug = city.parent?.parent?.slug || city.parent?.slug;
            if (!countrySlug) continue;
            const languages = city.supportedLanguages?.length ? city.supportedLanguages : ['en'];

            for (const lang of languages) {
                for (const condition of topConditions) {
                    urls.push({
                        urlPath: `/${countrySlug}/${lang}/${condition.slug}/${city.slug}`,
                        changefreq: 'weekly',
                        priority: 0.8,
                        conditionId: condition.id,
                        geographyId: city.id,
                        languageCode: lang,
                    });
                }
            }
        }

        // ── 14. Localized treatment pages ────────────────────
        // /[country]/[lang]/treatments
        for (const country of countriesGeo) {
            const languages = country.supportedLanguages?.length ? country.supportedLanguages : ['en'];
            for (const lang of languages) {
                urls.push({
                    urlPath: `/${country.slug}/${lang}/treatments`,
                    changefreq: 'weekly',
                    priority: 0.8,
                    languageCode: lang,
                });
            }
        }

        // ── 15. Treatment pages from JSON ────────────────────
        const slugify = (name: string) =>
            name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        let treatmentSlugs: string[] = [];
        try {
            const treatmentsFile = path.join(process.cwd(), 'public', 'data', 'treatments.json');
            const treatmentsData = JSON.parse(fs.readFileSync(treatmentsFile, 'utf8'));
            const slugSet = new Set<string>();
            for (const t of treatmentsData) {
                const slug = slugify(t.simpleName || t.name);
                if (slug) slugSet.add(slug);
            }
            treatmentSlugs = Array.from(slugSet);
        } catch {
            console.log('Could not read treatments.json, falling back to TreatmentCost table');
            const treatmentCosts = await prisma.treatmentCost.findMany({
                distinct: ['treatmentName'],
                select: { treatmentName: true },
            });
            treatmentSlugs = treatmentCosts
                .map((t) => slugify(t.treatmentName))
                .filter((s) => !!s);
        }

        for (const slug of treatmentSlugs) {
            // /treatments/[treatment]
            urls.push({
                urlPath: `/treatments/${slug}`,
                changefreq: 'weekly',
                priority: 0.75,
            });
        }

        // /[country]/[lang]/treatments/[treatment] — top treatments only to avoid explosion
        const topTreatmentSlugs = treatmentSlugs.slice(0, 200);
        for (const country of countriesGeo) {
            const languages = country.supportedLanguages?.length ? country.supportedLanguages : ['en'];
            for (const lang of languages) {
                for (const slug of topTreatmentSlugs) {
                    urls.push({
                        urlPath: `/${country.slug}/${lang}/treatments/${slug}`,
                        changefreq: 'weekly',
                        priority: 0.7,
                        languageCode: lang,
                    });
                }
            }
        }

        // ── 16. Clinical reference categories ────────────────
        const referenceCategories = [
            'drugs', 'guidelines', 'lab-medicine', 'anatomy',
            'procedures', 'slideshows', 'simulations',
            'drug-interaction', 'pill-identifier',
        ];
        for (const cat of referenceCategories) {
            urls.push({
                urlPath: `/reference/${cat}`,
                changefreq: 'monthly',
                priority: 0.6,
            });
        }

        // ── Deduplicate by urlPath ───────────────────────────
        const seen = new Set<string>();
        const dedupedUrls: SitemapUrl[] = [];
        for (const url of urls) {
            if (!seen.has(url.urlPath)) {
                seen.add(url.urlPath);
                dedupedUrls.push(url);
            }
        }

        console.log(`Total unique URLs to seed: ${dedupedUrls.length}`);

        // ── Batch insert with sitemap index assignment ───────
        let sitemapIndex = 0;
        let urlsInCurrentSitemap = 0;
        const batchSize = 1000;

        for (let i = 0; i < dedupedUrls.length; i += batchSize) {
            const batch = dedupedUrls.slice(i, i + batchSize);
            const data = batch.map((url) => {
                if (urlsInCurrentSitemap >= URLS_PER_SITEMAP) {
                    sitemapIndex++;
                    urlsInCurrentSitemap = 0;
                }
                urlsInCurrentSitemap++;

                return {
                    urlPath: url.urlPath,
                    sitemapIndex,
                    changefreq: url.changefreq,
                    priority: url.priority,
                    conditionId: url.conditionId,
                    geographyId: url.geographyId,
                    languageCode: url.languageCode,
                    lastModified: new Date(),
                };
            });

            await prisma.sitemapEntry.createMany({
                data,
                skipDuplicates: true,
            });
        }

        const finalCount = await prisma.sitemapEntry.count();

        return NextResponse.json({
            success: true,
            message: `Seeded ${finalCount} sitemap entries across ${sitemapIndex + 1} sitemaps`,
            breakdown: {
                static: staticPages.length,
                specialties: specialties.length * 2,
                doctors: doctors.length,
                hospitals: hospitals.length * 2,
                labs: labs.length,
                insurers: insurers.length,
                tests: tests.length * 2,
                testCategories: testCategories.length,
                testByCityPages: topTests.length * Math.min(citiesGeo.length, 100),
                conditionsCountryLevel: conditions.length * countriesGeo.length,
                conditionsCityLevel: topConditions.length * citiesGeo.length,
                costPages: conditions.length * countriesGeo.length,
                treatments: treatmentSlugs.length,
                localizedTreatments: treatmentSlugs.length * countriesGeo.length,
                doctorLocationPages: citiesGeo.length,
                referenceCategories: referenceCategories.length,
                totalUnique: dedupedUrls.length,
            },
            totalSitemaps: sitemapIndex + 1,
        });
    } catch (error: any) {
        console.error('Seed sitemap error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    const count = await prisma.sitemapEntry.count();
    const maxIndex = await prisma.sitemapEntry.aggregate({
        _max: { sitemapIndex: true },
    });

    return NextResponse.json({
        totalEntries: count,
        totalSitemaps: (maxIndex._max.sitemapIndex || 0) + 1,
    });
}
