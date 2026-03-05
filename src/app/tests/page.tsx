import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { getGeoContext } from '@/lib/geo-context';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { getTestTypeStyle, getCategoryStyle, type DiagnosticTestType } from '@/lib/test-type-colors';
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/structured-data';
import { AIDiagnosisCTA, FindDoctorCTA, MedicalTravelCTA } from '@/components/ui/cta-sections';

export const metadata: Metadata = {
  title: 'Lab Tests & Diagnostic Services | Compare Prices & Book Online | AIHealz',
  description: 'Find lab tests, blood tests, imaging scans, and health checkups near you. Compare prices from certified diagnostic centers, read reviews, and book appointments online.',
  keywords: ['lab tests', 'blood tests', 'diagnostic tests', 'health checkup', 'MRI', 'CT scan', 'X-ray', 'ultrasound', 'pathology'],
  openGraph: {
    title: 'Lab Tests & Diagnostic Services | AIHealz',
    description: 'Compare prices and book lab tests, imaging scans, and health checkups from certified diagnostic centers.',
    url: 'https://aihealz.com/tests',
    type: 'website',
  },
};

const TEST_TYPE_ICONS: Record<string, string> = {
  lab_test: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  imaging: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  cardiac: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  genetic: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  pulmonary: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  pathology: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  endoscopy: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  other: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
};

export default async function TestsPage() {
  const geo = await getGeoContext();

  // Fetch all parent categories with test counts
  const categories = await prisma.diagnosticCategory.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    include: {
      children: {
        where: { isActive: true },
        include: {
          _count: { select: { tests: true } },
        },
      },
      _count: { select: { tests: true } },
    },
    orderBy: { displayOrder: 'asc' },
  });

  // Fetch popular tests
  const popularTests = await prisma.diagnosticTest.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
    },
    orderBy: { searchVolume: 'desc' },
    take: 12,
  });

  // Currency mapping by country
  const CURRENCY_MAP: Record<string, { symbol: string; locale: string; rate: number }> = {
    'india': { symbol: '₹', locale: 'en-IN', rate: 1 },
    'in': { symbol: '₹', locale: 'en-IN', rate: 1 },
    'usa': { symbol: '$', locale: 'en-US', rate: 0.012 },
    'us': { symbol: '$', locale: 'en-US', rate: 0.012 },
    'uae': { symbol: 'AED', locale: 'en-AE', rate: 0.044 },
    'uk': { symbol: '£', locale: 'en-GB', rate: 0.0095 },
    'nigeria': { symbol: '₦', locale: 'en-NG', rate: 18.5 },
    'kenya': { symbol: 'KSh', locale: 'en-KE', rate: 1.54 },
    'saudi-arabia': { symbol: 'SAR', locale: 'ar-SA', rate: 0.045 },
    'germany': { symbol: '€', locale: 'de-DE', rate: 0.011 },
    'france': { symbol: '€', locale: 'fr-FR', rate: 0.011 },
    'spain': { symbol: '€', locale: 'es-ES', rate: 0.011 },
    'australia': { symbol: 'A$', locale: 'en-AU', rate: 0.018 },
    'canada': { symbol: 'C$', locale: 'en-CA', rate: 0.016 },
  };

  // Format currency based on geo
  const formatPrice = (priceInr: number | null, priceUsd: number | null) => {
    if (!priceInr && !priceUsd) return null;

    const countryKey = geo.countrySlug?.toLowerCase() || 'india';
    const currency = CURRENCY_MAP[countryKey] || CURRENCY_MAP['india'];

    // Use INR as base and convert
    if (priceInr) {
      if (countryKey === 'india' || countryKey === 'in') {
        return `${currency.symbol}${priceInr.toLocaleString(currency.locale)}`;
      }
      const converted = Math.round(priceInr * currency.rate);
      return `${currency.symbol}${converted.toLocaleString(currency.locale)}`;
    }

    // Fallback to USD display
    return priceUsd ? `$${priceUsd.toLocaleString('en-US')}` : null;
  };

  // Generate structured data
  const testFaqs = [
    { question: 'How do I book a lab test online?', answer: 'Search for your required test, compare prices from multiple labs, and book online. You can opt for home sample collection or visit a nearby diagnostic center.' },
    { question: 'Is home sample collection available?', answer: 'Yes, many tests offer home sample collection at no extra cost. Look for the "Home Collection" badge on tests. A trained phlebotomist will visit your location.' },
    { question: 'How long does it take to get test results?', answer: 'Report timing varies by test type. Most blood tests are available within 24-48 hours. Imaging scans may take 24 hours. Genetic tests can take 2-3 weeks.' },
    { question: 'Are lab tests covered by insurance?', answer: 'Yes, most health insurance plans cover diagnostic tests when prescribed by a doctor. Check with your insurer for coverage details and pre-authorization requirements.' },
  ];

  const structuredData = [
    generateWebPageSchema(
      'Lab Tests & Diagnostic Services',
      'Find lab tests, blood tests, imaging scans, and health checkups. Compare prices from certified diagnostic centers and book online.',
      'https://aihealz.com/tests'
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Tests', url: '/tests' },
    ]),
    generateItemListSchema(
      'Popular Lab Tests',
      'Compare prices and book diagnostic tests online',
      popularTests.slice(0, 10).map((test, i) => ({
        name: test.name,
        url: `/tests/${test.slug}`,
        position: i + 1,
      }))
    ),
    generateFAQSchema(testFaqs),
  ];

  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 relative overflow-hidden">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-sm font-medium text-emerald-400">Certified Diagnostic Partners</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Lab Tests &</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Diagnostic Services
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Compare prices from certified diagnostic centers. Book blood tests, imaging scans, and health checkups with home sample collection available.
          </p>

          {/* Search Bar - connected to test search API */}
          <div className="max-w-2xl mx-auto">
            <SearchAutocomplete
              placeholder="Search for tests, scans, or health packages..."
              variant="dark"
              typeFilter="test"
            />
          </div>
        </div>

        {/* Popular Tests */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Popular Tests</h2>
            <Link href="/tests/all" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all tests
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularTests.map((test) => {
              const typeStyle = getTestTypeStyle(test.testType);
              return (
                <Link
                  key={test.id}
                  href={`/tests/${test.slug}`}
                  className={`group bg-slate-900/50 backdrop-blur-sm border rounded-2xl p-5 transition-all hover:bg-slate-800/50 ${typeStyle.border} hover:border-opacity-50`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${typeStyle.bg}`}>
                      <span className="text-lg">{typeStyle.icon}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} border`}>
                        {typeStyle.label}
                      </span>
                      {test.homeCollectionPossible && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          Home Collection
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className={`font-semibold text-white group-hover:${typeStyle.text} transition-colors mb-1 line-clamp-2`}>
                    {test.name}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3">{test.category.name}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    {test.avgPriceInr && (
                      <span className={`text-sm font-semibold ${typeStyle.text}`}>
                        {formatPrice(Number(test.avgPriceInr), Number(test.avgPriceUsd))}
                      </span>
                    )}
                    {test.reportTimeHours && (
                      <span className="text-xs text-slate-500">
                        Report: {test.reportTimeHours < 24 ? `${test.reportTimeHours}h` : `${Math.round(test.reportTimeHours / 24)}d`}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Categories Grid */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const totalTests = category._count.tests + category.children.reduce((sum, child) => sum + child._count.tests, 0);
              const catStyle = getCategoryStyle(category.slug);

              return (
                <div
                  key={category.id}
                  className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`text-3xl ${catStyle.color} group-hover:scale-110 transition-transform`}>
                      {category.icon || catStyle.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{category.name}</h3>
                      <p className="text-xs text-slate-500">{totalTests} tests available</p>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{category.description}</p>
                  )}

                  {/* Subcategories */}
                  {category.children.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {category.children.slice(0, 4).map((child) => {
                        const childStyle = getCategoryStyle(child.slug);
                        return (
                          <Link
                            key={child.id}
                            href={`/tests/category/${child.slug}`}
                            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors flex items-center gap-1"
                          >
                            <span>{childStyle.icon}</span>
                            {child.name}
                          </Link>
                        );
                      })}
                      {category.children.length > 4 && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800/50 text-slate-500">
                          +{category.children.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/tests/category/${category.slug}`}
                    className={`inline-flex items-center text-sm font-semibold ${catStyle.color} hover:opacity-80 transition-colors`}
                  >
                    Explore {category.name}
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Health Packages CTA */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-3xl p-8 md:p-12 border border-emerald-500/20">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Comprehensive Health Checkup Packages
              </h2>
              <p className="text-slate-300 mb-6">
                Get complete health assessments with bundled tests at discounted prices. Choose from basic to executive packages tailored for your age and health goals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tests/category/health-checkup-packages"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                >
                  View Health Packages
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/chat/diagnostic"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors border border-white/10"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Ask About Tests
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* AI Diagnosis CTA */}
        <section className="mt-12">
          <AIDiagnosisCTA
            title="Not sure which test you need?"
            subtitle="Describe your symptoms and our AI will recommend the right diagnostic tests"
          />
        </section>

        {/* Find Doctor CTA */}
        <section className="mt-8">
          <FindDoctorCTA variant="banner" />
        </section>

        {/* Medical Travel CTA */}
        <section className="mt-8 mb-8">
          <MedicalTravelCTA variant="mini" />
        </section>
      </div>
    </main>
  );
}
