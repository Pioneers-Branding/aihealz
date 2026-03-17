import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
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
 * Populates the sitemap_entries table with all indexable URLs
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { clearExisting = true } = body;

        // Clear existing entries if requested
        if (clearExisting) {
            await prisma.sitemapEntry.deleteMany({});
            console.log('Cleared existing sitemap entries');
        }

        const urls: SitemapUrl[] = [];

        // ── Static pages ──────────────────────────────────
        const staticPages = [
            { path: '/', changefreq: 'daily', priority: 1.0 },
            { path: '/analyze', changefreq: 'weekly', priority: 0.9 },
            { path: '/conditions', changefreq: 'daily', priority: 0.95 },
            { path: '/treatments', changefreq: 'daily', priority: 0.95 },
            { path: '/doctors', changefreq: 'daily', priority: 0.95 },
            { path: '/hospitals', changefreq: 'weekly', priority: 0.9 },
            { path: '/insurance', changefreq: 'weekly', priority: 0.85 },
            { path: '/diagnostic-labs', changefreq: 'weekly', priority: 0.85 },
            { path: '/tests', changefreq: 'weekly', priority: 0.85 },
            { path: '/symptoms', changefreq: 'weekly', priority: 0.9 },
            { path: '/medical-travel', changefreq: 'weekly', priority: 0.8 },
            { path: '/remedies', changefreq: 'weekly', priority: 0.7 },
            { path: '/clinical-reference', changefreq: 'weekly', priority: 0.8 },
            { path: '/healz-ai', changefreq: 'weekly', priority: 0.9 },
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
            { path: '/for-doctors/pricing', changefreq: 'monthly', priority: 0.7 },
            { path: '/for-doctors/clinical-scores', changefreq: 'monthly', priority: 0.7 },
            { path: '/for-doctors/drug-dosing', changefreq: 'monthly', priority: 0.7 },
            // Provider
            { path: '/provider', changefreq: 'weekly', priority: 0.7 },
            { path: '/advertise', changefreq: 'monthly', priority: 0.6 },
            { path: '/pricing', changefreq: 'monthly', priority: 0.7 },
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

        // ── Conditions by specialty (for /conditions/[specialty] pages) ──────
        const specialties = [
            'cardiology', 'neurology', 'orthopedics', 'dermatology', 'gastroenterology',
            'oncology', 'pulmonology', 'endocrinology', 'psychiatry', 'ophthalmology',
            'urology', 'gynecology', 'rheumatology', 'nephrology', 'hematology',
            'ent', 'infectious', 'pediatrics', 'geriatrics',
        ];

        for (const specialty of specialties) {
            urls.push({
                urlPath: `/conditions/${specialty}`,
                changefreq: 'weekly',
                priority: 0.85,
            });
        }

        // ── Doctor pages ──────────────────────────────────
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

        // ── Hospital pages ──────────────────────────────────
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
        }

        // ── Diagnostic lab pages ──────────────────────────────────
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

        // ── Insurance provider pages ──────────────────────────────────
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

        // ── Condition pages with region-appropriate languages ──────────────────
        // Get cities with their supported languages
        const cities = await prisma.geography.findMany({
            where: {
                isActive: true,
                level: 'city',
            },
            select: {
                id: true,
                slug: true,
                supportedLanguages: true,
                parent: {
                    select: {
                        slug: true,
                        parent: { select: { slug: true } } // country
                    }
                }
            },
            take: 1000,
        });

        const conditions = await prisma.medicalCondition.findMany({
            where: { isActive: true },
            select: { id: true, slug: true },
            take: 5000, // Limit for initial seeding
        });

        // Generate URLs only for supported language-region combinations
        for (const city of cities) {
            const countrySlug = city.parent?.parent?.slug || 'india';
            const languages = city.supportedLanguages || ['en'];

            for (const lang of languages) {
                for (const condition of conditions.slice(0, 100)) { // Start with top 100 conditions
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

        // Also add country-level condition pages (no city)
        const countries = ['india', 'usa', 'uk', 'uae', 'singapore'];
        for (const countrySlug of countries) {
            for (const condition of conditions.slice(0, 500)) {
                urls.push({
                    urlPath: `/${countrySlug}/en/${condition.slug}`,
                    changefreq: 'weekly',
                    priority: 0.85,
                    conditionId: condition.id,
                    languageCode: 'en',
                });
            }
        }

        // ── Tests pages ──────────────────────────────────
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
        }

        // ── Batch insert with sitemap index assignment ──────────────────
        let sitemapIndex = 0;
        let urlsInCurrentSitemap = 0;
        const batchSize = 1000;

        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
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
                specialties: specialties.length,
                doctors: doctors.length,
                hospitals: hospitals.length,
                labs: labs.length,
                insurers: insurers.length,
                conditions: conditions.length * countries.length,
                tests: tests.length,
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
