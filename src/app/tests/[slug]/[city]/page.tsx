import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string; city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, city } = await params;
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    select: { name: true, shortName: true, description: true, avgPriceInr: true },
  });

  if (!test) {
    return { title: 'Test Not Found | aihealz' };
  }

  const priceText = test.avgPriceInr ? ` starting at ₹${Number(test.avgPriceInr).toLocaleString('en-IN')}` : '';

  return {
    title: `${test.name} in ${cityName} - Price, Labs & Home Collection | aihealz`,
    description: `Book ${test.name} in ${cityName}${priceText}. Compare prices from certified labs, get home sample collection, and receive reports online.`,
    keywords: [
      `${test.name} in ${cityName}`,
      `${test.shortName || test.name} ${cityName}`,
      `${test.name} price ${cityName}`,
      `${test.name} home collection ${cityName}`,
      'lab test near me',
    ],
    openGraph: {
      title: `${test.name} in ${cityName} | Compare Prices & Book`,
      description: `Find the best prices for ${test.name} in ${cityName}. Home sample collection available.`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  // Get popular tests
  const tests = await prisma.diagnosticTest.findMany({
    where: { isActive: true },
    select: { slug: true },
    orderBy: { searchVolume: 'desc' },
    take: 20,
  });

  // Get major cities
  const cities = await prisma.geography.findMany({
    where: {
      level: 'city',
      isActive: true,
    },
    select: { slug: true },
    take: 50,
  });

  // Generate combinations
  const params: { slug: string; city: string }[] = [];
  for (const test of tests) {
    for (const city of cities) {
      params.push({ slug: test.slug, city: city.slug });
    }
  }

  return params.slice(0, 200); // Limit for initial build
}

export default async function TestCityPage({ params }: PageProps) {
  const { slug, city } = await params;
  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const test = await prisma.diagnosticTest.findUnique({
    where: { slug },
    include: {
      category: {
        include: { parent: true },
      },
    },
  });

  if (!test || !test.isActive) {
    notFound();
  }

  // Try to find the city geography
  const cityGeo = await prisma.geography.findFirst({
    where: {
      slug: city,
      level: 'city',
      isActive: true,
    },
    include: {
      parent: {
        include: { parent: true }, // state -> country
      },
    },
  });

  // Find providers in this city
  const providers = cityGeo
    ? await prisma.diagnosticProvider.findMany({
        where: {
          isActive: true,
          geographyId: cityGeo.id,
          testPrices: {
            some: {
              testId: test.id,
              isActive: true,
            },
          },
        },
        include: {
          testPrices: {
            where: {
              testId: test.id,
              isActive: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
        take: 10,
      })
    : [];

  // If no specific city providers, get general providers
  const generalProviders =
    providers.length === 0
      ? await prisma.diagnosticProvider.findMany({
          where: {
            isActive: true,
            testPrices: {
              some: {
                testId: test.id,
                isActive: true,
              },
            },
          },
          include: {
            testPrices: {
              where: {
                testId: test.id,
                isActive: true,
              },
            },
            geography: { select: { name: true } },
          },
          orderBy: { rating: 'desc' },
          take: 8,
        })
      : [];

  const allProviders = providers.length > 0 ? providers : generalProviders;

  // Related tests
  const relatedTests = await prisma.diagnosticTest.findMany({
    where: {
      categoryId: test.categoryId,
      isActive: true,
      id: { not: test.id },
    },
    select: { slug: true, name: true, shortName: true },
    take: 6,
  });

  // Other cities
  const otherCities = await prisma.geography.findMany({
    where: {
      level: 'city',
      isActive: true,
      slug: { not: city },
    },
    select: { slug: true, name: true },
    take: 8,
  });

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  // Structured data for local SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalTest',
    name: test.name,
    alternateName: test.shortName,
    description: test.description,
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    provider: allProviders.map((p) => ({
      '@type': 'DiagnosticLab',
      name: p.name,
      ...(p.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(p.rating), reviewCount: p.reviewCount } }),
    })),
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
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
            <Link href="/tests" className="hover:text-emerald-400 transition-colors">Tests</Link>
            <span>/</span>
            <Link href={`/tests/${test.slug}`} className="hover:text-emerald-400 transition-colors">
              {test.shortName || test.name}
            </Link>
            <span>/</span>
            <span className="text-slate-400">{cityName}</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-emerald-400">{cityName}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              {test.name} in {cityName}
            </h1>

            <p className="text-lg text-slate-400 max-w-3xl mb-6">
              Compare prices and book {test.name} from certified diagnostic labs in {cityName}. Home sample collection available at select centers.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4">
              {test.avgPriceInr && (
                <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-white/5">
                  <span className="text-sm text-slate-400">Starting at </span>
                  <span className="font-bold text-emerald-400">{formatPrice(Number(test.avgPriceInr))}</span>
                </div>
              )}
              {allProviders.length > 0 && (
                <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-white/5">
                  <span className="font-bold text-white">{allProviders.length}</span>
                  <span className="text-sm text-slate-400"> labs available</span>
                </div>
              )}
              {test.homeCollectionPossible && (
                <div className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <span className="text-sm font-medium text-teal-400">Home Collection Available</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Providers List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-6">
                Labs Offering {test.shortName || test.name} in {cityName}
              </h2>

              {allProviders.length > 0 ? (
                <div className="space-y-4">
                  {allProviders.map((provider) => {
                    const price = provider.testPrices[0];
                    return (
                      <div
                        key={provider.id}
                        className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {provider.logo ? (
                              <img src={provider.logo} alt={provider.name} className="w-14 h-14 rounded-xl object-cover" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-400 font-bold text-xl">{provider.name.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-white text-lg">{provider.name}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                {provider.rating && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-white font-medium">{Number(provider.rating).toFixed(1)}</span>
                                    <span className="text-slate-500">({provider.reviewCount})</span>
                                  </div>
                                )}
                                {(() => {
                                  const geo = 'geography' in provider ? provider.geography : null;
                                  if (geo && typeof geo === 'object' && 'name' in geo) {
                                    return <span className="text-sm text-slate-500">{String(geo.name)}</span>;
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>

                          {provider.isPartner && provider.partnerDiscount && (
                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium border border-orange-500/20">
                              {Number(provider.partnerDiscount)}% OFF via aihealz
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {provider.homeCollectionAvailable && (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              Home Collection
                            </span>
                          )}
                          {provider.accreditations && provider.accreditations.length > 0 && (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-400">
                              {provider.accreditations.join(', ')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div>
                            {price && (
                              <>
                                <span className="text-2xl font-bold text-emerald-400">{formatPrice(Number(price.price))}</span>
                                {price.mrpPrice && Number(price.mrpPrice) > Number(price.price) && (
                                  <span className="ml-2 text-sm text-slate-500 line-through">
                                    {formatPrice(Number(price.mrpPrice))}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <Link
                            href={`/book/test/${test.slug}?provider=${provider.slug}&city=${city}`}
                            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No labs listed in {cityName} yet</h3>
                  <p className="text-slate-400 mb-6">We&apos;re adding diagnostic centers in your area. Check back soon!</p>
                  <Link
                    href={`/tests/${test.slug}`}
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                  >
                    View All Providers
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Test Info Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">About This Test</h3>
                <div className="space-y-3 text-sm">
                  {test.sampleType && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sample</span>
                      <span className="text-white">{test.sampleType}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fasting</span>
                    <span className="text-white">{test.fastingRequired ? `${test.fastingHours || 8}-12 hours` : 'Not required'}</span>
                  </div>
                  {test.reportTimeHours && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Report Time</span>
                      <span className="text-white">
                        {test.reportTimeHours < 24 ? `${test.reportTimeHours} hours` : `${Math.round(test.reportTimeHours / 24)} days`}
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/tests/${test.slug}`}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
                >
                  View Full Details
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Other Cities */}
              {otherCities.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">{test.shortName || test.name} in Other Cities</h3>
                  <div className="flex flex-wrap gap-2">
                    {otherCities.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/tests/${test.slug}/${c.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Tests */}
              {relatedTests.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Related Tests in {cityName}</h3>
                  <div className="space-y-2">
                    {relatedTests.map((rt) => (
                      <Link
                        key={rt.slug}
                        href={`/tests/${rt.slug}/${city}`}
                        className="block px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        {rt.shortName || rt.name}
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
