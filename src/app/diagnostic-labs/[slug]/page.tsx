import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await prisma.diagnosticProvider.findUnique({
    where: { slug },
    select: { name: true, description: true, providerType: true },
  });

  if (!provider) {
    return { title: 'Lab Not Found | aihealz' };
  }

  return {
    title: `${provider.name} - Tests, Prices & Reviews | aihealz`,
    description: provider.description || `Book lab tests at ${provider.name}. Compare prices, read reviews, and book with home collection available.`,
    openGraph: {
      title: `${provider.name} | Diagnostic Lab`,
      description: `View tests, packages, and prices at ${provider.name}.`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  const providers = await prisma.diagnosticProvider.findMany({
    where: { isActive: true },
    select: { slug: true },
    take: 50,
  });
  return providers.map((p) => ({ slug: p.slug }));
}

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

export default async function ProviderDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const provider = await prisma.diagnosticProvider.findUnique({
    where: { slug },
    include: {
      geography: {
        include: { parent: { include: { parent: true } } },
      },
      testPrices: {
        where: { isActive: true },
        include: {
          test: {
            select: {
              id: true,
              slug: true,
              name: true,
              shortName: true,
              sampleType: true,
              reportTimeHours: true,
              homeCollectionPossible: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { test: { searchVolume: 'desc' } },
        take: 50,
      },
      packages: {
        where: { isActive: true },
        include: {
          tests: {
            include: {
              test: { select: { name: true, shortName: true } },
            },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
        take: 10,
      },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!provider || !provider.isActive) {
    notFound();
  }

  // Group tests by category
  const testsByCategory = provider.testPrices.reduce(
    (acc, tp) => {
      const catName = tp.test.category.name;
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(tp);
      return acc;
    },
    {} as Record<string, typeof provider.testPrices>
  );

  // Calculate average rating
  const avgRating = provider.rating ? Number(provider.rating).toFixed(1) : null;

  // Structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'DiagnosticLab',
    name: provider.name,
    description: provider.description,
    address: provider.address,
    telephone: provider.phone,
    email: provider.email,
    url: provider.website,
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: provider.reviewCount,
      },
    }),
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

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/diagnostic-labs" className="hover:text-emerald-400 transition-colors">Labs</Link>
            <span>/</span>
            <span className="text-slate-400">{provider.name}</span>
          </nav>

          {/* Header */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Logo & Basic Info */}
              <div className="flex items-start gap-6 flex-1">
                {provider.logo ? (
                  <img src={provider.logo} alt={provider.name} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-4xl">{provider.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{provider.name}</h1>
                    {provider.isPartner && (
                      <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium border border-orange-500/20">
                        Partner Lab
                      </span>
                    )}
                  </div>

                  {provider.geography && (
                    <p className="text-slate-400 mb-3">
                      {[provider.geography.name, provider.geography.parent?.name, provider.geography.parent?.parent?.name]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    {avgRating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-slate-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-white font-semibold">{avgRating}</span>
                        <span className="text-slate-500">({provider.reviewCount} reviews)</span>
                      </div>
                    )}
                    {provider.homeCollectionAvailable && (
                      <span className="flex items-center gap-1 text-teal-400 text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home Collection Available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6 lg:gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{provider.testPrices.length}</p>
                  <p className="text-sm text-slate-400">Tests</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{provider.packages.length}</p>
                  <p className="text-sm text-slate-400">Packages</p>
                </div>
                {provider.partnerDiscount && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-400">{Number(provider.partnerDiscount)}%</p>
                    <p className="text-sm text-slate-400">Discount</p>
                  </div>
                )}
              </div>
            </div>

            {/* Accreditations & Features */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/5">
              {provider.accreditations.map((acc, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                  {acc}
                </span>
              ))}
              {provider.onlineReportsAvailable && (
                <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm">
                  Online Reports
                </span>
              )}
            </div>

            {provider.description && (
              <p className="text-slate-300 mt-6">{provider.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tests & Packages */}
            <div className="lg:col-span-2 space-y-8">
              {/* Health Packages */}
              {provider.packages.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-6">Health Packages</h2>
                  <div className="grid gap-4">
                    {provider.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-white text-lg">{pkg.name}</h3>
                            {pkg.description && (
                              <p className="text-sm text-slate-400 mt-1">{pkg.description}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              {pkg.tests.length} tests included
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">{formatPrice(Number(pkg.price))}</p>
                            {pkg.mrpPrice && Number(pkg.mrpPrice) > Number(pkg.price) && (
                              <p className="text-sm text-slate-500 line-through">{formatPrice(Number(pkg.mrpPrice))}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {pkg.tests.slice(0, 5).map((pt) => (
                            <span key={pt.id} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                              {pt.test.shortName || pt.test.name}
                            </span>
                          ))}
                          {pkg.tests.length > 5 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-800/50 text-slate-500">
                              +{pkg.tests.length - 5} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex gap-4 text-xs text-slate-500">
                            {pkg.homeCollection && <span>Home Collection</span>}
                            {pkg.reportTimeHours && (
                              <span>
                                Report: {pkg.reportTimeHours < 24 ? `${pkg.reportTimeHours}h` : `${Math.round(pkg.reportTimeHours / 24)}d`}
                              </span>
                            )}
                            {pkg.fastingRequired && <span>Fasting Required</span>}
                          </div>
                          <Link
                            href={`/book/package/${pkg.slug}?provider=${provider.slug}`}
                            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                          >
                            Book Package
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Individual Tests */}
              <section>
                <h2 className="text-xl font-bold text-white mb-6">Available Tests</h2>

                {Object.entries(testsByCategory).map(([category, tests]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">{category}</h3>
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
                      {tests.map((tp, index) => (
                        <div
                          key={tp.id}
                          className={`p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors ${
                            index > 0 ? 'border-t border-white/5' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <Link href={`/tests/${tp.test.slug}`} className="font-medium text-white hover:text-emerald-400 transition-colors">
                              {tp.test.shortName || tp.test.name}
                            </Link>
                            <div className="flex gap-3 text-xs text-slate-500 mt-1">
                              {tp.test.sampleType && <span>{tp.test.sampleType}</span>}
                              {tp.reportTimeHours && (
                                <span>
                                  {tp.reportTimeHours < 24 ? `${tp.reportTimeHours}h` : `${Math.round(tp.reportTimeHours / 24)}d`}
                                </span>
                              )}
                              {tp.homeCollection && <span className="text-teal-400">Home</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-emerald-400">{formatPrice(Number(tp.price))}</p>
                              {tp.mrpPrice && Number(tp.mrpPrice) > Number(tp.price) && (
                                <p className="text-xs text-slate-500 line-through">{formatPrice(Number(tp.mrpPrice))}</p>
                              )}
                            </div>
                            <Link
                              href={`/book/test/${tp.test.slug}?provider=${provider.slug}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
                            >
                              Book
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-white mb-4">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  {provider.address && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-slate-300">{provider.address}</span>
                    </div>
                  )}
                  {provider.phone && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${provider.phone}`} className="text-emerald-400 hover:underline">{provider.phone}</a>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${provider.email}`} className="text-emerald-400 hover:underline">{provider.email}</a>
                    </div>
                  )}
                  {provider.website && (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline truncate">
                        {provider.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {provider.homeCollectionAvailable && provider.homeCollectionFee && (
                  <div className="mt-4 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                    <p className="text-sm text-teal-400">
                      Home collection fee: {formatPrice(Number(provider.homeCollectionFee))}
                    </p>
                  </div>
                )}

                <Link
                  href={`/chat/diagnostic?provider=${provider.slug}`}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Ask About Tests
                </Link>
              </div>

              {/* Reviews Summary */}
              {provider.reviews.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {provider.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-slate-400">{review.reviewerName}</span>
                        </div>
                        {review.review && (
                          <p className="text-sm text-slate-300 line-clamp-2">{review.review}</p>
                        )}
                      </div>
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
