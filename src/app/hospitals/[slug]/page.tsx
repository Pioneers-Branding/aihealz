import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReactElement } from 'react';
import Script from 'next/script';
import MediaGallery from '@/components/ui/media-gallery';

interface Props {
  params: Promise<{ slug: string }>;
}

// Equipment commonly found in hospitals - used as fallback
const COMMON_EQUIPMENT = [
  'MRI Scanner', 'CT Scanner', 'X-Ray', 'Ultrasound', 'ECG',
  'Ventilators', 'Defibrillators', 'Patient Monitors', 'Infusion Pumps'
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hospital = await prisma.hospital.findUnique({
    where: { slug },
    select: { name: true, city: true, tagline: true, metaTitle: true, metaDescription: true },
  });

  if (!hospital) return { title: 'Hospital Not Found' };

  return {
    title: hospital.metaTitle || `${hospital.name} - Reviews, Doctors & Specialties | AIHealz`,
    description: hospital.metaDescription || hospital.tagline || `Find detailed information about ${hospital.name} in ${hospital.city}. Patient reviews, top doctors, specialties, and more.`,
  };
}

const PATIENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  domestic: { label: 'Domestic Patient', color: 'bg-blue-100 text-blue-700' },
  international: { label: 'International Patient', color: 'bg-purple-100 text-purple-700' },
  medical_tourist: { label: 'Medical Tourist', color: 'bg-indigo-100 text-indigo-700' },
};

export default async function HospitalDetailPage({ params }: Props) {
  const { slug } = await params;

  const hospital = await prisma.hospital.findUnique({
    where: { slug },
    include: {
      geography: { select: { name: true, slug: true } },
      specialties: {
        orderBy: { displayOrder: 'asc' },
      },
      departments: {
        orderBy: { name: 'asc' },
      },
      doctors: {
        where: { isTopDoctor: true },
        include: {
          doctor: {
            select: { name: true, slug: true, profileImage: true, qualifications: true },
          },
        },
        take: 12,
      },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      insuranceTies: {
        where: { isActive: true },
        include: {
          insurer: { select: { name: true, slug: true, logo: true, providerType: true, shortName: true } },
        },
        orderBy: [{ isPreferred: 'desc' }, { isCashless: 'desc' }],
        take: 30,
      },
      _count: {
        select: { reviews: true, doctors: true, enquiries: true },
      },
    },
  });

  if (!hospital) notFound();

  // Get sibling hospitals (same parent organization)
  const siblingHospitals = hospital.parentOrganization
    ? await prisma.hospital.findMany({
        where: {
          parentOrganization: hospital.parentOrganization,
          slug: { not: hospital.slug },
          isActive: true,
        },
        select: {
          name: true,
          slug: true,
          city: true,
          state: true,
          bedCount: true,
        },
        take: 10,
      })
    : [];

  // Get review stats
  const reviewStats = await prisma.hospitalReview.groupBy({
    by: ['reviewerType'],
    where: { hospitalId: hospital.id, isVisible: true },
    _count: true,
    _avg: { rating: true },
  });

  // Structured Data for SEO
  const hospitalSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: hospital.name,
    description: hospital.description || hospital.tagline,
    url: `https://aihealz.com/hospitals/${hospital.slug}`,
    telephone: hospital.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hospital.address,
      addressLocality: hospital.city,
      addressRegion: hospital.state,
      addressCountry: hospital.country,
      postalCode: hospital.pincode,
    },
    ...(hospital.latitude && hospital.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: Number(hospital.latitude),
        longitude: Number(hospital.longitude),
      },
    }),
    ...(hospital.overallRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(hospital.overallRating),
        reviewCount: hospital._count.reviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    medicalSpecialty: hospital.specialties.map(s => s.specialty),
    availableService: hospital.departments.map(d => ({
      '@type': 'MedicalProcedure',
      name: d.name,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
      { '@type': 'ListItem', position: 2, name: 'Hospitals', item: 'https://aihealz.com/hospitals' },
      { '@type': 'ListItem', position: 3, name: hospital.name, item: `https://aihealz.com/hospitals/${hospital.slug}` },
    ],
  };

  const formatRating = (rating: number | null | undefined) => {
    if (!rating) return '-';
    return Number(rating).toFixed(1);
  };

  const renderStars = (rating: number) => {
    const stars: ReactElement[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
      } else {
        stars.push(<svg key={i} className="w-4 h-4 text-slate-200" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <>
      <Script
        id="hospital-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/15 to-transparent pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/hospitals" className="hover:text-white transition-colors">Hospitals</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white truncate max-w-[200px]">{hospital.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Hospital Logo & Basic Info */}
            <div className="lg:w-64 flex-shrink-0">
              {hospital.logo ? (
                <img
                  src={hospital.logo}
                  alt={hospital.name}
                  className="w-full h-48 object-contain rounded-xl bg-slate-800 p-4 border border-white/5"
                />
              ) : (
                <div className="w-full h-48 rounded-xl bg-gradient-to-br from-teal-900/50 to-emerald-900/50 flex items-center justify-center border border-white/5">
                  <span className="text-6xl font-bold text-teal-400">{hospital.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Hospital Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white">{hospital.name}</h1>
                {hospital.isFeatured && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">Featured</span>
                )}
                {hospital.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1 border border-green-500/30">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Verified
                  </span>
                )}
              </div>

              {hospital.tagline && (
                <p className="text-lg text-slate-400 mb-4">{hospital.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {hospital.city}{hospital.state && hospital.state !== hospital.city ? `, ${hospital.state}` : ''}{hospital.country && hospital.country !== 'India' ? `, ${hospital.country}` : ''}
                </span>
                {hospital.bedCount && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {hospital.bedCount} Beds
                  </span>
                )}
                {hospital.icuBeds && (
                  <span className="text-red-400 font-medium">{hospital.icuBeds} ICU</span>
                )}
                {hospital.operationTheaters && (
                  <span>{hospital.operationTheaters} OTs</span>
                )}
                {hospital.establishedYear && (
                  <span>Est. {hospital.establishedYear}</span>
                )}
              </div>

              {/* Accreditations */}
              {hospital.accreditations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {[...new Set(hospital.accreditations)].map((acc, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium border border-blue-500/20">
                      {acc}
                    </span>
                  ))}
                </div>
              )}

              {/* Ratings Row */}
              {hospital._count.reviews > 0 ? (
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-teal-500/20 rounded-lg px-4 py-2 border border-teal-500/20">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xl font-bold text-teal-400">{formatRating(hospital.overallRating as number | null)}</span>
                    </div>
                    <span className="text-sm text-teal-400/80">Overall ({hospital._count.reviews} reviews)</span>
                  </div>

                  {hospital.domesticRating && (
                    <div className="flex items-center gap-2 bg-blue-500/20 rounded-lg px-4 py-2 border border-blue-500/20">
                      <span className="text-lg font-bold text-blue-400">{formatRating(Number(hospital.domesticRating))}</span>
                      <span className="text-sm text-blue-400/80">Domestic</span>
                    </div>
                  )}

                  {hospital.internationalRating && (
                    <div className="flex items-center gap-2 bg-purple-500/20 rounded-lg px-4 py-2 border border-purple-500/20">
                      <span className="text-lg font-bold text-purple-400">{formatRating(Number(hospital.internationalRating))}</span>
                      <span className="text-sm text-purple-400/80">International</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2 border border-white/5">
                  <span className="text-sm text-slate-500">No reviews yet</span>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h3 className="font-semibold text-white mb-4">Get in Touch</h3>
                <Link
                  href={`/hospitals/${hospital.slug}/enquire`}
                  className="block w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-lg text-center transition-colors mb-3"
                >
                  Book Appointment
                </Link>
                <Link
                  href={`/hospitals/${hospital.slug}/enquire?type=international`}
                  className="block w-full py-3 px-4 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  International Patient Enquiry
                </Link>
                {hospital.website && (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 mt-3 text-sm text-center text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Visit Official Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {hospital.description && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">About {hospital.name}</h2>
                <div className="prose prose-invert prose-slate max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: hospital.description }} />
              </section>
            )}

            {/* Media Gallery */}
            {(hospital.coverImage || hospital.images.length > 0 || hospital.videoUrl) && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Photos & Videos
                </h2>
                <MediaGallery
                  coverImage={hospital.coverImage}
                  images={hospital.images}
                  videoUrl={hospital.videoUrl}
                  alt={hospital.name}
                  maxVisible={6}
                />
              </section>
            )}

            {/* Pros & Cons */}
            {(hospital.prosForPatients.length > 0 || hospital.consForPatients.length > 0) && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">What Patients Say</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {hospital.prosForPatients.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Pros
                      </h3>
                      <ul className="space-y-2">
                        {hospital.prosForPatients.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {hospital.consForPatients.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                        Cons
                      </h3>
                      <ul className="space-y-2">
                        {hospital.consForPatients.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Specialties */}
            {hospital.specialties.length > 0 && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">Specialties & Centers of Excellence</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {hospital.specialties.map((spec) => (
                    <div key={spec.id} className="p-4 bg-slate-800/50 rounded-lg border border-white/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{spec.specialty}</h3>
                          {spec.description && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{spec.description}</p>
                          )}
                        </div>
                        {spec.isCenter && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">CoE</span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        {spec.keyProcedures && spec.keyProcedures.length > 0 && <span>{spec.keyProcedures.slice(0, 3).join(', ')}</span>}
                        {spec.successRate && <span className="text-green-400">{Number(spec.successRate)}% success rate</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Top Doctors */}
            {hospital.doctors.length > 0 && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">Top Doctors</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hospital.doctors.map((hd) => (
                    <Link
                      key={hd.id}
                      href={hd.doctor?.slug ? `/doctors/${hd.doctor.slug}` : '#'}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5 hover:border-teal-500/30 transition-colors"
                    >
                      {hd.doctor?.profileImage ? (
                        <img src={hd.doctor.profileImage} alt={hd.doctor.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-900/50 flex items-center justify-center border border-teal-500/20">
                          <span className="text-lg font-bold text-teal-400">{hd.doctor?.name?.charAt(0) || hd.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{hd.doctor?.name || hd.name}</p>
                        <p className="text-xs text-slate-500 truncate">{hd.designation}</p>
                        {hd.specialty && (
                          <p className="text-xs text-teal-400 truncate">{hd.specialty}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                {hospital._count.doctors > 12 && (
                  <div className="mt-4 text-center">
                    <Link href={`/hospitals/${hospital.slug}/doctors`} className="text-teal-400 hover:text-teal-300 font-medium text-sm">
                      View all {hospital._count.doctors} doctors
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Notable Patients */}
            {Array.isArray(hospital.notablePatients) && hospital.notablePatients.length > 0 && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">Notable Patients</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {(hospital.notablePatients as Array<{ name: string; category: string; treatment?: string; doctor?: string; year?: number }>).map((np, i) => (
                    <div key={i} className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{np.name}</p>
                          <p className="text-xs text-amber-400">{np.category}</p>
                          {np.treatment && <p className="text-sm text-slate-400 mt-1">Treatment: {np.treatment}</p>}
                          {np.doctor && <p className="text-sm text-slate-500">By Dr. {np.doctor}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {hospital.reviews.length > 0 && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Patient Reviews</h2>
                  <div className="flex gap-2">
                    {reviewStats.map((rs) => (
                      <span key={rs.reviewerType} className="px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
                        {PATIENT_TYPE_LABELS[rs.reviewerType]?.label || rs.reviewerType}: {formatRating(rs._avg.rating as number | null)} ({rs._count})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {hospital.reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-slate-800/50 rounded-lg border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-white">{review.reviewerName || 'Anonymous'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(Number(review.rating))}
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 border border-white/5">
                              {PATIENT_TYPE_LABELS[review.reviewerType]?.label || review.reviewerType}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      {review.title && <p className="font-medium text-slate-200 mb-1">{review.title}</p>}
                      {review.review && <p className="text-sm text-slate-400">{review.review}</p>}
                      {review.treatmentReceived && (
                        <p className="text-xs text-slate-500 mt-2">Treatment: {review.treatmentReceived}</p>
                      )}
                    </div>
                  ))}
                </div>
                {hospital._count.reviews > 10 && (
                  <div className="mt-4 text-center">
                    <Link href={`/hospitals/${hospital.slug}/reviews`} className="text-teal-400 hover:text-teal-300 font-medium text-sm">
                      Read all {hospital._count.reviews} reviews
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Map & Location */}
            {hospital.latitude && hospital.longitude && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">Location & Directions</h2>
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 mb-4 border border-white/5">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${hospital.latitude},${hospital.longitude}&zoom=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${hospital.name} Location`}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Get Directions
                  </a>
                  {hospital.address && (
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {hospital.address}, {hospital.city} {hospital.pincode}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Other Locations (Sibling Hospitals) */}
            {siblingHospitals.length > 0 && (
              <section className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">
                  Other {hospital.parentOrganization} Locations
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  {hospital.parentOrganization} operates {siblingHospitals.length + 1} hospitals across India and other countries.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {siblingHospitals.map((sibling) => (
                    <Link
                      key={sibling.slug}
                      href={`/hospitals/${sibling.slug}`}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/5 hover:border-teal-500/30 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">{sibling.name}</p>
                        <p className="text-sm text-slate-500">{sibling.city}, {sibling.state}</p>
                      </div>
                      {sibling.bedCount && (
                        <span className="text-sm text-teal-400 font-medium">{sibling.bedCount} beds</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Awards & Recognition */}
            {Array.isArray(hospital.awards) && hospital.awards.length > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  Awards & Recognition
                </h3>
                <ul className="space-y-2">
                  {(hospital.awards as Array<{ year?: number; award: string; org?: string }>).map((award, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {award.award}{award.org ? ` - ${award.org}` : ''}{award.year ? ` (${award.year})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scandals (if any) */}
            {Array.isArray(hospital.scandals) && hospital.scandals.length > 0 && (
              <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
                <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Important Information
                </h3>
                <ul className="space-y-2">
                  {(hospital.scandals as Array<{ year?: number; title: string; description?: string }>).map((scandal, i) => (
                    <li key={i} className="text-sm text-red-400">
                      <span className="font-medium">{scandal.title}</span>
                      {scandal.year ? ` (${scandal.year})` : ''}
                      {scandal.description && <p className="text-red-400/80 text-xs mt-1">{scandal.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ownership Info */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
              <h3 className="font-semibold text-white mb-3">Ownership & Management</h3>
              <dl className="space-y-2 text-sm">
                {hospital.ownershipType && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Type</dt>
                    <dd className="font-medium text-white">{hospital.ownershipType}</dd>
                  </div>
                )}
                {hospital.parentOrganization && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Parent Organization</dt>
                    <dd className="font-medium text-white">{hospital.parentOrganization}</dd>
                  </div>
                )}
                {hospital.ownerName && (
                  <div>
                    <dt className="text-slate-500 mb-1">Key People</dt>
                    <dd className="text-slate-300">{hospital.ownerName}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Insurance Partners - Enhanced */}
            {hospital.insuranceTies.length > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h3 className="font-semibold text-white mb-1">Accepted Insurance</h3>
                <p className="text-xs text-slate-500 mb-4">
                  {hospital.insuranceTies.filter(t => t.isCashless).length} cashless partners
                </p>

                {/* Government Insurance First */}
                {hospital.insuranceTies.filter(t => t.insurer.providerType === 'government').length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Government Schemes
                    </p>
                    <div className="space-y-2">
                      {hospital.insuranceTies
                        .filter(t => t.insurer.providerType === 'government')
                        .map((tie) => (
                          <Link
                            key={tie.id}
                            href={`/insurance/${tie.insurer.slug}`}
                            className="flex items-center justify-between p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                          >
                            <span className="text-sm font-medium text-amber-400">{tie.insurer.name}</span>
                            {tie.isCashless && (
                              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/20">Cashless</span>
                            )}
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Private/Public Insurance */}
                <div className="space-y-2">
                  {hospital.insuranceTies
                    .filter(t => t.insurer.providerType !== 'government')
                    .slice(0, 8)
                    .map((tie) => (
                      <Link
                        key={tie.id}
                        href={`/insurance/${tie.insurer.slug}`}
                        className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-white/5 hover:border-teal-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {tie.insurer.logo ? (
                            <img src={tie.insurer.logo} alt={tie.insurer.name} className="h-6 w-6 object-contain flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-teal-900/50 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                              <span className="text-xs font-bold text-teal-400">{tie.insurer.name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="text-sm text-slate-300 truncate">{tie.insurer.name}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {tie.isCashless && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/20">Cashless</span>
                          )}
                          {tie.isPreferred && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/20">Preferred</span>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>

                {hospital.insuranceTies.filter(t => t.insurer.providerType !== 'government').length > 8 && (
                  <Link
                    href={`/hospitals/${hospital.slug}/insurance`}
                    className="block mt-3 text-center text-sm text-teal-400 hover:text-teal-300 font-medium"
                  >
                    View all {hospital.insuranceTies.length} accepted insurers
                  </Link>
                )}

                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-400">
                    <strong>Tip:</strong> Always verify insurance coverage and cashless eligibility with the hospital before admission.
                  </p>
                </div>
              </div>
            )}

            {/* Infrastructure */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
              <h3 className="font-semibold text-white mb-3">Infrastructure</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {hospital.bedCount && (
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center border border-white/5">
                    <dd className="text-xl font-bold text-teal-400">{hospital.bedCount}</dd>
                    <dt className="text-xs text-slate-500">Total Beds</dt>
                  </div>
                )}
                {hospital.icuBeds && (
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center border border-white/5">
                    <dd className="text-xl font-bold text-red-400">{hospital.icuBeds}</dd>
                    <dt className="text-xs text-slate-500">ICU Beds</dt>
                  </div>
                )}
                {hospital.operationTheaters && (
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center border border-white/5">
                    <dd className="text-xl font-bold text-blue-400">{hospital.operationTheaters}</dd>
                    <dt className="text-xs text-slate-500">Operation Theaters</dt>
                  </div>
                )}
                {hospital.emergencyBeds && (
                  <div className="p-3 bg-slate-800/50 rounded-lg text-center border border-white/5">
                    <dd className="text-xl font-bold text-orange-400">{hospital.emergencyBeds}</dd>
                    <dt className="text-xs text-slate-500">Emergency Beds</dt>
                  </div>
                )}
              </dl>
            </div>

            {/* Departments */}
            {hospital.departments.length > 0 && (
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
                <h3 className="font-semibold text-white mb-3">Departments</h3>
                <div className="flex flex-wrap gap-1">
                  {hospital.departments.slice(0, 15).map((dept) => (
                    <span key={dept.id} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-white/5">
                      {dept.name}
                    </span>
                  ))}
                  {hospital.departments.length > 15 && (
                    <span className="px-2 py-1 bg-slate-700 text-slate-500 text-xs rounded-full border border-white/5">
                      +{hospital.departments.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Equipment & Technology */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Equipment & Technology
              </h3>
              <div className="flex flex-wrap gap-1">
                {COMMON_EQUIPMENT.map((equip, i) => (
                  <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/20">
                    {equip}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                * Contact hospital for complete equipment list and availability
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
              <h3 className="font-semibold text-white mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {hospital.bloodBank && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Blood Bank
                  </div>
                )}
                {hospital.pharmacy24x7 && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    24/7 Pharmacy
                  </div>
                )}
                {hospital.cafeteria && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Cafeteria
                  </div>
                )}
                {hospital.parking && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Parking
                  </div>
                )}
                {hospital.wifi && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Free WiFi
                  </div>
                )}
                {hospital.airportPickup && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Airport Pickup
                  </div>
                )}
                {hospital.translatorServices && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Translator
                  </div>
                )}
                {hospital.internationalPatientDesk && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Int&apos;l Patient Desk
                  </div>
                )}
              </div>
            </div>

            {/* External Links */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5">
              <h3 className="font-semibold text-white mb-3">External Links</h3>
              <div className="space-y-2">
                {hospital.website && (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Official Website
                  </a>
                )}
                {hospital.latitude && hospital.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${hospital.name}+${hospital.city}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Google Business Profile
                  </a>
                )}
                {hospital.phone && (
                  <a
                    href={`tel:${hospital.phone}`}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Hospital
                  </a>
                )}
                {hospital.emergencyPhone && (
                  <a
                    href={`tel:${hospital.emergencyPhone}`}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Emergency: {hospital.emergencyPhone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
