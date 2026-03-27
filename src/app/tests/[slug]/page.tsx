import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGeoContext } from '@/lib/geo-context';
import { getTestTypeStyle } from '@/lib/test-type-colors';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    select: { name: true, shortName: true, description: true, metaTitle: true, metaDescription: true, keywords: true },
  });

  if (!test) {
    return { title: 'Test Not Found | aihealz' };
  }

  return {
    title: test.metaTitle || `${test.name} - Cost, Preparation, Normal Range | aihealz`,
    description: test.metaDescription || test.description || `Get ${test.name} done at certified labs near you. Compare prices, read preparation instructions, and book online with home collection available.`,
    keywords: test.keywords || [test.name, test.shortName || '', 'lab test', 'diagnostic', 'price', 'near me'].filter(Boolean),
    openGraph: {
      title: `${test.name} | Lab Test Details`,
      description: test.description || `Complete guide to ${test.name} including preparation, normal ranges, and pricing.`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  try {
    const tests = await prisma.diagnosticTest.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 100,
    });
    return tests.map((test) => ({ slug: test.slug }));
  } catch {
    return [];
  }
}

export default async function TestDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const geo = await getGeoContext();

  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      prices: {
        where: {
          isActive: true,
          provider: { isActive: true },
        },
        include: {
          provider: {
            select: {
              id: true,
              slug: true,
              name: true,
              providerType: true,
              rating: true,
              reviewCount: true,
              homeCollectionAvailable: true,
              partnerDiscount: true,
              isPartner: true,
              logo: true,
            },
          },
        },
        orderBy: { price: 'asc' },
        take: 10,
      },
    },
  });

  if (!test || !test.isActive) {
    notFound();
  }

  // Related tests in same category
  const relatedTests = await prisma.diagnosticTest.findMany({
    where: {
      categoryId: test.categoryId,
      isActive: true,
      id: { not: test.id },
    },
    select: { id: true, slug: true, name: true, shortName: true, avgPriceInr: true },
    take: 6,
  });

  const formatPrice = (price: number) => {
    if (geo.countrySlug === 'in' || geo.countrySlug === 'india') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    return `$${Math.round(price / 83).toLocaleString('en-US')}`;
  };

  const normalRanges = test.normalRanges as Record<string, unknown> | null;
  const typeStyle = getTestTypeStyle(test.testType);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalTest',
    name: test.name,
    alternateName: test.shortName,
    description: test.description,
    usedToDiagnose: test.relatedConditions,
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: test.specialistType,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/tests" className="hover:text-emerald-400 transition-colors">Tests</Link>
            <span>/</span>
            {test.category.parent && (
              <>
                <Link href={`/tests/category/${test.category.parent.slug}`} className="hover:text-emerald-400 transition-colors">
                  {test.category.parent.name}
                </Link>
                <span>/</span>
              </>
            )}
            <Link href={`/tests/category/${test.category.slug}`} className="hover:text-emerald-400 transition-colors">
              {test.category.name}
            </Link>
            <span>/</span>
            <span className="text-slate-400">{test.shortName || test.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Test Header */}
              <div className={`bg-slate-900/50 backdrop-blur-sm border ${typeStyle.border} rounded-3xl p-8`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {/* Test Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-2xl`}>{typeStyle.icon}</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} border font-medium`}>
                        {typeStyle.label}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{test.name}</h1>
                    {test.shortName && (
                      <p className={`text-lg ${typeStyle.text} font-medium`}>{test.shortName}</p>
                    )}
                    {test.aliases && test.aliases.length > 0 && (
                      <p className="text-sm text-slate-500 mt-2">
                        Also known as: {test.aliases.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {test.homeCollectionPossible && (
                      <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home Collection
                      </span>
                    )}
                    {test.bodySystem && (
                      <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400">
                        {test.bodySystem}
                      </span>
                    )}
                  </div>
                </div>

                {test.description && (
                  <p className="text-slate-300 leading-relaxed mb-6">{test.description}</p>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {test.sampleType && (
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Sample Type</p>
                      <p className="font-semibold text-white">{test.sampleType}</p>
                    </div>
                  )}
                  {test.reportTimeHours && (
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Report Time</p>
                      <p className="font-semibold text-white">
                        {test.reportTimeHours < 24 ? `${test.reportTimeHours} hours` : `${Math.round(test.reportTimeHours / 24)} days`}
                      </p>
                    </div>
                  )}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Fasting Required</p>
                    <p className="font-semibold text-white">
                      {test.fastingRequired ? `Yes (${test.fastingHours || 8}-12 hours)` : 'No'}
                    </p>
                  </div>
                  {test.avgPriceInr && (
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 mb-1">Starting Price</p>
                      <p className="font-bold text-emerald-400 text-lg">{formatPrice(Number(test.avgPriceInr))}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preparation Instructions */}
              {test.preparationInstructions && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Preparation
                  </h2>
                  <div className="prose prose-invert prose-emerald max-w-none">
                    <p className="text-slate-300 whitespace-pre-line">{test.preparationInstructions}</p>
                  </div>
                </div>
              )}

              {/* Normal Ranges */}
              {normalRanges && Object.keys(normalRanges).length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Normal Reference Ranges
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Parameter</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Normal Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(normalRanges).map(([key, value]) => (
                          <tr key={key} className="border-b border-white/5">
                            <td className="py-3 px-4 text-white font-medium">{key}</td>
                            <td className="py-3 px-4 text-slate-300">{String(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Note: Normal ranges may vary between labs. Always consult your doctor for interpretation.
                  </p>
                </div>
              )}

              {/* Related Conditions */}
              {test.relatedConditions && test.relatedConditions.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-white mb-4">Commonly Used For</h2>
                  <div className="flex flex-wrap gap-2">
                    {test.relatedConditions.map((condition, index) => (
                      <Link
                        key={index}
                        href={`/conditions?q=${encodeURIComponent(condition)}`}
                        className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-sm"
                      >
                        {condition}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Providers */}
            <div className="space-y-6">
              {/* Book Now Card */}
              <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-4">Book This Test</h3>

                {test.prices.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {test.prices.slice(0, 5).map((priceInfo) => (
                      <div
                        key={priceInfo.id}
                        className="bg-slate-900/50 rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {priceInfo.provider.logo ? (
                              <img src={priceInfo.provider.logo} alt={priceInfo.provider.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-400 font-bold text-sm">{priceInfo.provider.name.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white text-sm">{priceInfo.provider.name}</p>
                              {priceInfo.provider.rating && (
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {Number(priceInfo.provider.rating).toFixed(1)} ({priceInfo.provider.reviewCount})
                                </div>
                              )}
                            </div>
                          </div>
                          {priceInfo.provider.isPartner && priceInfo.provider.partnerDiscount && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/20">
                              {Number(priceInfo.provider.partnerDiscount)}% off
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">{formatPrice(Number(priceInfo.price))}</span>
                            {priceInfo.provider.homeCollectionAvailable && (
                              <span className="text-xs text-slate-500">+ Home</span>
                            )}
                          </div>
                          <Link
                            href={`/book/test/${test.slug}?provider=${priceInfo.provider.slug}`}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 mb-6">
                    <p className="text-slate-400 mb-3">No providers listed yet</p>
                    <p className="text-sm text-slate-500">We&apos;re adding diagnostic centers in your area.</p>
                  </div>
                )}

                <Link
                  href={`/chat/diagnostic?test=${test.slug}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Ask About This Test
                </Link>
              </div>

              {/* Related Tests */}
              {relatedTests.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Related Tests</h3>
                  <div className="space-y-3">
                    {relatedTests.map((related) => (
                      <Link
                        key={related.id}
                        href={`/tests/${related.slug}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                      >
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          {related.shortName || related.name}
                        </span>
                        {related.avgPriceInr && (
                          <span className="text-xs text-emerald-400">{formatPrice(Number(related.avgPriceInr))}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
