import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { getGeoContext } from '@/lib/geo-context';
import AIKioskFinder from '@/components/diagnostic/AIKioskFinder';

export const metadata: Metadata = {
  title: 'Diagnostic Labs & Imaging Centers Near You | aihealz',
  description: 'Find certified diagnostic labs and imaging centers near you. Compare prices, read reviews, and book lab tests with home sample collection available.',
  keywords: 'diagnostic labs, pathology labs, imaging centers, MRI scan, CT scan, blood test, lab test near me, home collection',
  openGraph: {
    title: 'Diagnostic Labs & Imaging Centers | aihealz',
    description: 'Find certified diagnostic labs and imaging centers with best prices.',
    type: 'website',
  },
};

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  lab: 'Pathology Lab',
  imaging_center: 'Imaging Center',
  hospital: 'Hospital Diagnostics',
  clinic: 'Clinic',
  home_collection: 'Home Collection Service',
  full_service: 'Full Service Diagnostics',
};

export default async function DiagnosticLabsPage() {
  const geo = await getGeoContext();

  // Get user's geography for filtering
  let geoFilter = {};
  if (geo.countrySlug) {
    const userGeo = await prisma.geography.findFirst({
      where: { slug: geo.countrySlug, isActive: true },
      select: { id: true },
    });
    if (userGeo) {
      // Get all geographies under this country
      const childGeos = await prisma.geography.findMany({
        where: {
          OR: [
            { id: userGeo.id },
            { parentId: userGeo.id },
            { parent: { parentId: userGeo.id } },
          ],
          isActive: true,
        },
        select: { id: true },
      });
      geoFilter = { geographyId: { in: childGeos.map((g) => g.id) } };
    }
  }

  // Fetch featured partners first
  const featuredProviders = await prisma.diagnosticProvider.findMany({
    where: {
      isActive: true,
      isPartner: true,
      ...geoFilter,
    },
    include: {
      geography: { select: { name: true } },
      _count: { select: { testPrices: true, packages: true, reviews: true } },
    },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: 6,
  });

  // Fetch all providers
  const providers = await prisma.diagnosticProvider.findMany({
    where: {
      isActive: true,
      id: { notIn: featuredProviders.map((p) => p.id) },
      ...geoFilter,
    },
    include: {
      geography: { select: { name: true } },
      _count: { select: { testPrices: true, packages: true, reviews: true } },
    },
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    take: 24,
  });

  const allProviders = [...featuredProviders, ...providers];

  // Get provider type counts
  const typeCounts = await prisma.diagnosticProvider.groupBy({
    by: ['providerType'],
    where: { isActive: true, ...geoFilter },
    _count: true,
  });

  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-white">Diagnostic Labs &</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Imaging Centers
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Find certified diagnostic centers near you. Compare prices, read reviews, and book with home sample collection.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          <Link
            href="/diagnostic-labs"
            className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium text-sm"
          >
            All Centers
          </Link>
          {typeCounts.map((tc) => (
            <Link
              key={tc.providerType}
              href={`/diagnostic-labs?type=${tc.providerType}`}
              className="px-4 py-2 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/5 font-medium text-sm transition-colors"
            >
              {PROVIDER_TYPE_LABELS[tc.providerType] || tc.providerType} ({tc._count})
            </Link>
          ))}
        </div>

        {/* Featured Partners */}
        {featuredProviders.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-white">Partner Labs</h2>
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium border border-orange-500/20">
                Exclusive Discounts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/diagnostic-labs/${provider.slug}`}
                  className="group bg-gradient-to-br from-emerald-900/30 to-slate-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {provider.logo ? (
                      <img src={provider.logo} alt={provider.name} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 font-bold text-2xl">{provider.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-slate-400">{PROVIDER_TYPE_LABELS[provider.providerType] || provider.providerType}</p>
                      {provider.geography && (
                        <p className="text-xs text-slate-500 mt-1">{provider.geography.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {provider.rating && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-medium">{Number(provider.rating).toFixed(1)}</span>
                        <span className="text-slate-500 text-sm">({provider.reviewCount})</span>
                      </div>
                    )}
                    {provider.partnerDiscount && (
                      <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                        {Number(provider.partnerDiscount)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {provider.homeCollectionAvailable && (
                      <span className="text-xs px-2 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        Home Collection
                      </span>
                    )}
                    {provider.accreditations.slice(0, 2).map((acc, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                        {acc}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-white/5">
                    <span>{provider._count.testPrices} tests</span>
                    <span>{provider._count.packages} packages</span>
                    <span className="text-emerald-400 font-medium group-hover:underline">View Lab</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Providers */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">All Diagnostic Centers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/diagnostic-labs/${provider.slug}`}
                className="group bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 transition-all hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  {provider.logo ? (
                    <img src={provider.logo} alt={provider.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold">{provider.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {provider.geography?.name || PROVIDER_TYPE_LABELS[provider.providerType]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {provider.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white">{Number(provider.rating).toFixed(1)}</span>
                    </div>
                  )}
                  {provider.homeCollectionAvailable && (
                    <span className="text-xs text-teal-400">Home Collection</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
                  <span>{provider._count.testPrices} tests</span>
                  <span className="text-emerald-400 font-medium">View Details</span>
                </div>
              </Link>
            ))}
          </div>

          {allProviders.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No labs found in your area</h3>
              <p className="text-slate-400 mb-6">We&apos;re adding diagnostic centers near you soon.</p>
              <Link
                href="/tests"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
              >
                Browse All Tests
              </Link>
            </div>
          )}
        </section>

        {/* AI Health Kiosks Section */}
        <section className="mt-16">
          <AIKioskFinder />
        </section>

        {/* Partner CTA */}
        <section className="mt-16 text-center">
          <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-10">
            <h2 className="text-2xl font-bold text-white mb-3">Own a Diagnostic Lab?</h2>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              Partner with AIHealz to reach more patients. Get online bookings, home collection management, and real-time analytics.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/provider/lab/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
              >
                Register Your Lab
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
