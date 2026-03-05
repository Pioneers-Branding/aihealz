import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Top Hospitals - Rankings, Reviews & Specialties | AIHealz',
  description: 'Find the best hospitals with patient reviews, specialties, bed availability, accreditations, and detailed information for both domestic and international patients.',
  keywords: 'best hospitals, top hospitals, hospital rankings, medical tourism hospitals, NABH hospitals, JCI accredited',
  openGraph: {
    title: 'Find Top Hospitals Worldwide | AIHealz',
    description: 'Compare hospital rankings, specialties, accreditations, and patient reviews.',
    url: 'https://aihealz.com/hospitals',
  },
};

const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  government: 'Government',
  private: 'Private',
  public_private_partnership: 'PPP',
  charitable: 'Charitable',
  trust: 'Trust',
  corporate_chain: 'Corporate Chain',
  standalone: 'Standalone',
  teaching: 'Teaching',
  research: 'Research',
  military: 'Military',
  railway: 'Railway',
  municipal: 'Municipal',
};

async function getGeoFromCookie() {
  const cookieStore = await cookies();
  const geoCookie = cookieStore.get('aihealz-geo')?.value;
  if (!geoCookie) return null;

  const parts = geoCookie.split(':');
  return {
    countrySlug: parts[0] || null,
    citySlug: parts[1] || null,
  };
}

export default async function HospitalsPage() {
  const geo = await getGeoFromCookie();

  // Get geography ID if available - include country, states, and cities
  let geoFilter = {};
  if (geo?.citySlug) {
    const city = await prisma.geography.findFirst({
      where: { slug: geo.citySlug, level: 'city' },
    });
    if (city) geoFilter = { geographyId: city.id };
  } else if (geo?.countrySlug) {
    const country = await prisma.geography.findFirst({
      where: { slug: geo.countrySlug, level: 'country' },
    });
    if (country) {
      // Get all descendant geographies (states and cities under the country)
      const states = await prisma.geography.findMany({
        where: { parentId: country.id },
        select: { id: true },
      });
      const stateIds = states.map(s => s.id);

      // Get cities under states
      const cities = await prisma.geography.findMany({
        where: { parentId: { in: stateIds } },
        select: { id: true },
      });

      // Include country ID, state IDs, and city IDs
      const allGeoIds = [country.id, ...stateIds, ...cities.map(c => c.id)];
      geoFilter = { geographyId: { in: allGeoIds } };
    }
  }

  const [hospitals, stats, topCities] = await Promise.all([
    prisma.hospital.findMany({
      where: {
        isActive: true,
        ...geoFilter,
      },
      include: {
        geography: { select: { name: true, slug: true } },
        specialties: {
          take: 5,
          select: { specialty: true },
        },
        _count: {
          select: { reviews: true, doctors: true, departments: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { overallRating: 'desc' },
      ],
      take: 50,
    }),
    prisma.hospital.aggregate({
      _count: true,
      _avg: { overallRating: true, domesticRating: true, internationalRating: true },
      where: { isActive: true, ...geoFilter },
    }),
    prisma.hospital.groupBy({
      by: ['geographyId'],
      _count: true,
      where: { isActive: true },
      orderBy: { _count: { geographyId: 'desc' } },
      take: 10,
    }),
  ]);

  // Get city names for top cities
  const cityIds = topCities.map(c => c.geographyId).filter(Boolean) as number[];
  const cities = await prisma.geography.findMany({
    where: { id: { in: cityIds } },
    select: { id: true, name: true, slug: true },
  });
  const cityMap = new Map(cities.map(c => [c.id, c]));

  const formatRating = (rating: number | null) => {
    if (!rating) return '-';
    return Number(rating).toFixed(1);
  };

  // Generate structured data
  const hospitalFaqs = [
    { question: 'How are hospitals ranked on AIHealz?', answer: 'Hospitals are ranked based on patient reviews, accreditations (JCI, NABH), specialty expertise, bed count, and outcome data. We combine domestic and international patient ratings.' },
    { question: 'What does hospital accreditation mean?', answer: 'Accreditation (JCI, NABH) indicates that a hospital meets international quality and safety standards. It ensures standardized processes, patient safety protocols, and quality of care.' },
    { question: 'Can international patients use AIHealz?', answer: 'Yes, AIHealz serves both domestic and international patients. We provide separate ratings for international patient experience and offer medical travel coordination.' },
    { question: 'How do I compare hospitals?', answer: 'You can compare hospitals by ratings, specialties, accreditations, bed count, and patient reviews. Filter by city or specialty to find the best match for your needs.' },
  ];

  const structuredData = [
    generateWebPageSchema(
      'Top Hospitals - Rankings, Reviews & Specialties',
      'Find the best hospitals with patient reviews, specialties, bed availability, accreditations for domestic and international patients.',
      'https://aihealz.com/hospitals'
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Hospitals', url: '/hospitals' },
    ]),
    generateItemListSchema(
      'Top Hospitals',
      'Compare hospital rankings, specialties, and accreditations',
      hospitals.slice(0, 10).map((h, i) => ({
        name: h.name,
        url: `/hospitals/${h.slug}`,
        position: i + 1,
      }))
    ),
    generateFAQSchema(hospitalFaqs),
  ];

  return (
    <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Background */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mt-10 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-white">Hospitals</span>
        </nav>

        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Find the Best Hospitals
            {geo?.citySlug && <span className="text-teal-400"> in Your City</span>}
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            Compare {stats._count}+ hospitals by patient reviews, specialties, accreditations, and more.
            Trusted by domestic and international patients.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-900/50 border border-white/5 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-white">{stats._count}</span>
              <span className="ml-2 text-slate-500">Hospitals</span>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-white">{formatRating(stats._avg.overallRating as number | null)}</span>
              <span className="ml-2 text-slate-500">Avg Rating</span>
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-white">{formatRating(stats._avg.internationalRating as number | null)}</span>
              <span className="ml-2 text-slate-500">Int&apos;l Rating</span>
            </div>
          </div>
        </div>

        {/* City Filters */}
        {topCities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Browse by City</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/hospitals"
                className="px-4 py-2 rounded-full bg-teal-500/20 text-teal-400 text-sm font-medium hover:bg-teal-500/30 transition-colors border border-teal-500/30"
              >
                All Cities
              </Link>
              {topCities.map(tc => {
                const city = cityMap.get(tc.geographyId!);
                if (!city) return null;
                return (
                  <Link
                    key={city.id}
                    href={`/hospitals?city=${city.slug}`}
                    className="px-4 py-2 rounded-full bg-slate-800/50 text-slate-300 text-sm font-medium hover:bg-slate-700/50 transition-colors border border-white/5"
                  >
                    {city.name} ({tc._count})
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Hospital Cards */}
        <div className="grid gap-5">
          {hospitals.map((hospital) => (
            <Link
              key={hospital.id}
              href={`/hospitals/${hospital.slug}`}
              className="bg-slate-900/50 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Hospital Image */}
                  <div className="lg:w-48 lg:h-32 flex-shrink-0">
                    {hospital.logo ? (
                      <img
                        src={hospital.logo}
                        alt={hospital.name}
                        className="w-full h-32 lg:h-full object-contain rounded-xl bg-slate-800 p-4"
                      />
                    ) : (
                      <div className="w-full h-32 lg:h-full rounded-xl bg-gradient-to-br from-teal-900/50 to-emerald-900/50 flex items-center justify-center border border-white/5">
                        <svg className="w-16 h-16 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Hospital Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h2 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                        {hospital.name}
                      </h2>
                      {hospital.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
                          Featured
                        </span>
                      )}
                      {hospital.isVerified && (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1 border border-green-500/30">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {hospital.geography?.name || hospital.city}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-white/5">
                        {HOSPITAL_TYPE_LABELS[hospital.hospitalType] || hospital.hospitalType}
                      </span>
                      {hospital.ownershipType &&
                       hospital.ownershipType.toLowerCase() !== hospital.hospitalType.toLowerCase() &&
                       hospital.ownershipType.toLowerCase() !== (HOSPITAL_TYPE_LABELS[hospital.hospitalType] || '').toLowerCase() && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-white/5">
                          {hospital.ownershipType}
                        </span>
                      )}
                      {hospital.bedCount && (
                        <span className="text-slate-500">
                          {hospital.bedCount} Beds
                        </span>
                      )}
                    </div>

                    {/* Accreditations */}
                    {hospital.accreditations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {[...new Set(hospital.accreditations)].slice(0, 4).map((acc, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/20">
                            {acc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Specialties */}
                    {hospital.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {hospital.specialties.map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-xs font-medium border border-teal-500/20">
                            {spec.specialty}
                          </span>
                        ))}
                        {hospital._count.departments > 5 && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-xs border border-white/5">
                            +{hospital._count.departments - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-slate-500">{hospital._count.doctors} Doctors</span>
                      <span className="text-slate-500">{hospital._count.reviews} Reviews</span>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="lg:w-48 flex-shrink-0 flex flex-row lg:flex-col gap-3 lg:items-end lg:text-right">
                    {/* Overall Rating */}
                    <div className="flex items-center gap-2 lg:flex-row-reverse">
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 text-slate-900 rounded-lg font-bold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {formatRating(hospital.overallRating as number | null)}
                      </div>
                      <span className="text-xs text-slate-500">Overall</span>
                    </div>

                    {/* Domestic vs International */}
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2 lg:flex-row-reverse">
                        <span className="font-semibold text-slate-300">{formatRating(hospital.domesticRating as number | null)}</span>
                        <span className="text-slate-500">Domestic</span>
                      </div>
                      <div className="flex items-center gap-2 lg:flex-row-reverse">
                        <span className="font-semibold text-purple-400">{formatRating(hospital.internationalRating as number | null)}</span>
                        <span className="text-slate-500">Int&apos;l Patients</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pros & Awards */}
                {(hospital.prosForPatients.length > 0 || (Array.isArray(hospital.awards) && hospital.awards.length > 0)) && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4">
                    {hospital.prosForPatients.slice(0, 2).map((pro, i) => (
                      <span key={i} className="flex items-center gap-1 text-sm text-green-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {pro}
                      </span>
                    ))}
                    {Array.isArray(hospital.awards) && (hospital.awards as Array<{ award: string }>).slice(0, 2).map((award, i) => (
                      <span key={i} className="flex items-center gap-1 text-sm text-amber-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                        {award.award}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {hospitals.length === 0 && (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-white/5">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No hospitals found</h3>
            <p className="text-slate-500">Try selecting a different city or check back later.</p>
          </div>
        )}
      </div>
    </main>
  );
}
