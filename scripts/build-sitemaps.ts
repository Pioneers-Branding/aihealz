import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';
const URLS_PER_SITEMAP = 45000;

// Priority countries for full location coverage
const PRIORITY_COUNTRIES = ['india', 'usa', 'uk', 'australia', 'canada', 'nigeria', 'uae', 'germany'];

async function main() {
  console.log('=== Building Sitemaps for aihealz.com ===\n');
  const startTime = Date.now();

  // Clear existing sitemap entries
  console.log('Clearing existing sitemap entries...');
  await prisma.sitemapEntry.deleteMany({});

  let totalUrls = 0;
  let sitemapIndex = 0;

  // ═══════════════════════════════════════════════════════════════
  // 1. STATIC PAGES (Index 0)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n[1/6] Adding static pages...');
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/analyze', priority: 0.9, changefreq: 'weekly' },
    { path: '/conditions', priority: 0.95, changefreq: 'daily' },
    { path: '/treatments', priority: 0.95, changefreq: 'daily' },
    { path: '/doctors', priority: 0.95, changefreq: 'daily' },
    { path: '/hospitals', priority: 0.9, changefreq: 'weekly' },
    { path: '/insurance', priority: 0.85, changefreq: 'weekly' },
    { path: '/diagnostic-labs', priority: 0.85, changefreq: 'weekly' },
    { path: '/tests', priority: 0.85, changefreq: 'weekly' },
    { path: '/symptoms', priority: 0.9, changefreq: 'weekly' },
    { path: '/medical-travel', priority: 0.8, changefreq: 'weekly' },
    { path: '/tools', priority: 0.7, changefreq: 'monthly' },
    { path: '/about', priority: 0.5, changefreq: 'monthly' },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' },
    { path: '/for-doctors', priority: 0.7, changefreq: 'weekly' },
    { path: '/advertise', priority: 0.6, changefreq: 'monthly' },
  ];

  await prisma.sitemapEntry.createMany({
    data: staticPages.map(p => ({
      urlPath: p.path,
      sitemapIndex: 0,
      changefreq: p.changefreq,
      priority: p.priority,
      lastModified: new Date(),
    })),
  });
  totalUrls += staticPages.length;
  console.log(`  Added ${staticPages.length} static pages`);

  // ═══════════════════════════════════════════════════════════════
  // 2. GLOBAL CONDITION PAGES (All conditions for priority countries)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n[2/6] Adding global condition pages...');
  sitemapIndex = 1;

  const conditions = await prisma.medicalCondition.findMany({
    where: {
      isActive: true,
      pageContent: { some: {} }
    },
    select: { id: true, slug: true },
  });

  const priorityCountryData = await prisma.geography.findMany({
    where: {
      level: 'country',
      isActive: true,
      slug: { in: PRIORITY_COUNTRIES }
    },
    select: { id: true, slug: true, supportedLanguages: true },
  });

  let conditionBatch: any[] = [];
  let conditionCount = 0;

  for (const country of priorityCountryData) {
    const langs = country.supportedLanguages?.length > 0
      ? country.supportedLanguages.slice(0, 3) // Max 3 languages per country
      : ['en'];

    for (const condition of conditions) {
      for (const lang of langs) {
        conditionBatch.push({
          urlPath: `/${country.slug}/${lang}/${condition.slug}`,
          sitemapIndex: sitemapIndex,
          changefreq: 'weekly',
          priority: 0.85,
          languageCode: lang,
          conditionId: condition.id,
          geographyId: country.id,
          lastModified: new Date(),
        });

        if (conditionBatch.length >= 10000) {
          await prisma.sitemapEntry.createMany({ data: conditionBatch, skipDuplicates: true });
          conditionCount += conditionBatch.length;
          conditionBatch = [];

          if (conditionCount % 50000 === 0) {
            console.log(`    Progress: ${conditionCount.toLocaleString()} global condition URLs...`);
          }

          // Check if we need a new sitemap
          if (conditionCount % URLS_PER_SITEMAP === 0) {
            sitemapIndex++;
          }
        }
      }
    }
  }

  // Insert remaining
  if (conditionBatch.length > 0) {
    await prisma.sitemapEntry.createMany({ data: conditionBatch, skipDuplicates: true });
    conditionCount += conditionBatch.length;
  }
  totalUrls += conditionCount;
  console.log(`  Added ${conditionCount.toLocaleString()} global condition pages`);

  // ═══════════════════════════════════════════════════════════════
  // 3. LOCATION-SPECIFIC PAGES (Top 50 cities in India)
  // ═══════════════════════════════════════════════════════════════
  console.log('\n[3/6] Adding India location-specific pages (top cities)...');
  sitemapIndex++;

  // Get India
  const india = await prisma.geography.findFirst({
    where: { slug: 'india', level: 'country', isActive: true },
  });

  if (india) {
    // Get top 50 cities in India by getting cities with most conditions
    const topIndiaCities = await prisma.geography.findMany({
      where: {
        level: 'city',
        isActive: true,
        parent: { parentId: india.id }
      },
      include: { parent: { select: { slug: true } } },
      take: 50,
    });

    const indiaLangs = ['en', 'hi']; // English and Hindi
    let locationBatch: any[] = [];
    let locationCount = 0;

    for (const city of topIndiaCities) {
      const stateSlug = city.parent?.slug;
      if (!stateSlug) continue;

      for (const condition of conditions.slice(0, 1000)) { // Top 1000 conditions
        for (const lang of indiaLangs) {
          locationBatch.push({
            urlPath: `/${india.slug}/${lang}/${condition.slug}/${stateSlug}/${city.slug}`,
            sitemapIndex: sitemapIndex,
            changefreq: 'weekly',
            priority: 0.9,
            languageCode: lang,
            conditionId: condition.id,
            geographyId: city.id,
            lastModified: new Date(),
          });

          if (locationBatch.length >= 10000) {
            await prisma.sitemapEntry.createMany({ data: locationBatch, skipDuplicates: true });
            locationCount += locationBatch.length;
            locationBatch = [];

            if (locationCount % 50000 === 0) {
              console.log(`    Progress: ${locationCount.toLocaleString()} India location URLs...`);
            }

            if (locationCount % URLS_PER_SITEMAP === 0) {
              sitemapIndex++;
            }
          }
        }
      }
    }

    if (locationBatch.length > 0) {
      await prisma.sitemapEntry.createMany({ data: locationBatch, skipDuplicates: true });
      locationCount += locationBatch.length;
    }
    totalUrls += locationCount;
    console.log(`  Added ${locationCount.toLocaleString()} India location pages`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. DOCTOR PROFILES
  // ═══════════════════════════════════════════════════════════════
  console.log('\n[4/6] Adding doctor profiles...');
  sitemapIndex++;

  const doctors = await prisma.doctorProvider.findMany({
    where: { isVerified: true },
    select: { slug: true },
    take: 50000, // Limit to 50k doctors
  });

  if (doctors.length > 0) {
    await prisma.sitemapEntry.createMany({
      data: doctors.map((d, i) => ({
        urlPath: `/doctor/${d.slug}`,
        sitemapIndex: sitemapIndex + Math.floor(i / URLS_PER_SITEMAP),
        changefreq: 'weekly',
        priority: 0.7,
        lastModified: new Date(),
      })),
      skipDuplicates: true,
    });
    totalUrls += doctors.length;
    console.log(`  Added ${doctors.length} doctor profiles`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. HOSPITALS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n[5/6] Adding hospital pages...');
  sitemapIndex++;

  const hospitals = await prisma.hospital.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  if (hospitals.length > 0) {
    await prisma.sitemapEntry.createMany({
      data: hospitals.map(h => ({
        urlPath: `/hospitals/${h.slug}`,
        sitemapIndex: sitemapIndex,
        changefreq: 'weekly',
        priority: 0.8,
        lastModified: new Date(),
      })),
      skipDuplicates: true,
    });
    totalUrls += hospitals.length;
    console.log(`  Added ${hospitals.length} hospital pages`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 6. TESTS & INSURANCE
  // ═══════════════════════════════════════════════════════════════
  console.log('\n[6/6] Adding tests and insurance pages...');

  const tests = await prisma.diagnosticTest.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  if (tests.length > 0) {
    await prisma.sitemapEntry.createMany({
      data: tests.map(t => ({
        urlPath: `/tests/${t.slug}`,
        sitemapIndex: sitemapIndex,
        changefreq: 'monthly',
        priority: 0.6,
        lastModified: new Date(),
      })),
      skipDuplicates: true,
    });
    totalUrls += tests.length;
    console.log(`  Added ${tests.length} test pages`);
  }

  const insurers = await prisma.insuranceProvider.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  if (insurers.length > 0) {
    await prisma.sitemapEntry.createMany({
      data: insurers.map(i => ({
        urlPath: `/insurance/${i.slug}`,
        sitemapIndex: sitemapIndex,
        changefreq: 'weekly',
        priority: 0.7,
        lastModified: new Date(),
      })),
      skipDuplicates: true,
    });
    totalUrls += insurers.length;
    console.log(`  Added ${insurers.length} insurance pages`);
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  const finalCount = await prisma.sitemapEntry.count();
  const maxIndex = await prisma.sitemapEntry.aggregate({ _max: { sitemapIndex: true } });
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('SITEMAP BUILD COMPLETE');
  console.log('='.repeat(60));
  console.log(`
Summary:
  Total URLs indexed:     ${finalCount.toLocaleString()}
  Number of sitemaps:     ${(maxIndex._max.sitemapIndex || 0) + 1}
  Build time:             ${duration}s

Access sitemaps at:
  Index:    ${SITE_URL}/sitemap-index.xml
  Chunk 0:  ${SITE_URL}/sitemap/0
  Chunk 1:  ${SITE_URL}/sitemap/1
  ...up to: ${SITE_URL}/sitemap/${maxIndex._max.sitemapIndex || 0}

Note: Additional location pages are generated dynamically via
      ${SITE_URL}/sitemap-{country}-{state}.xml routes.
`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error('Error:', e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
