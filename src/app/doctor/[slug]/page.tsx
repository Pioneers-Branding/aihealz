import prisma from '@/lib/db';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import MediaGallery from '@/components/ui/media-gallery';

type PageParams = Promise<{ slug: string }>;

// Helper function to format doctor name without double "Dr." prefix
function formatDoctorName(name: string): string {
    const trimmed = name.trim();
    // Check for various "Dr." patterns at the start
    if (/^dr\.?\s+/i.test(trimmed)) {
        return trimmed; // Already has Dr. prefix
    }
    return `Dr. ${trimmed}`;
}

// Detect obvious placeholder phone numbers that shouldn't be displayed
function isPlaceholderPhone(phone: string): boolean {
    if (!phone) return true;
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    // Common placeholder patterns
    const placeholderPatterns = [
        /^555\d{7}$/,           // 555 numbers (US fake)
        /1234567890$/,          // Obvious sequential
        /9876543210$/,          // Reverse sequential
        /0000000000$/,          // All zeros
        /1111111111$/,          // All ones
        /^0{7,}$/,              // Multiple zeros
    ];
    return placeholderPatterns.some(pattern => pattern.test(cleaned));
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
    const { slug } = await params;

    const doctor = await prisma.doctorProvider.findUnique({
        where: { slug },
        select: {
            name: true,
            qualifications: true,
            experienceYears: true,
            bio: true,
            specialties: { select: { condition: { select: { commonName: true, specialistType: true } } } },
            geography: { select: { name: true, parent: { select: { name: true } } } },
        },
    });

    if (!doctor) {
        return { title: 'Doctor Not Found | aihealz' };
    }

    const specialty = doctor.specialties[0]?.condition?.specialistType || doctor.specialties[0]?.condition?.commonName || 'Medical';
    const location = doctor.geography?.name || '';
    const quals = doctor.qualifications?.slice(0, 3).join(', ') || '';

    const displayName = formatDoctorName(doctor.name);
    const title = `${displayName} - ${specialty} | ${location} | aihealz`;
    const description = doctor.bio?.slice(0, 155) ||
        `${formatDoctorName(doctor.name)} is a ${specialty} specialist${location ? ` in ${location}` : ''}${doctor.experienceYears ? ` with ${doctor.experienceYears}+ years of experience` : ''}. ${quals}. Book appointment online.`;

    return {
        title,
        description,
        keywords: `Dr ${doctor.name}, ${specialty} ${location}, ${specialty} doctor, best ${specialty.toLowerCase()}, ${location} doctors`,
        openGraph: {
            title,
            description,
            url: `https://aihealz.com/doctor/${slug}`,
            siteName: 'aihealz',
            type: 'profile',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
        alternates: {
            canonical: `https://aihealz.com/doctor/${slug}`,
        },
    };
}

export default async function DoctorProfilePage({ params }: { params: PageParams }) {
    const { slug } = await params;

    // Get geo context
    const hdrs = await headers();
    const country = hdrs.get('x-aihealz-country') || 'india';
    const lang = hdrs.get('x-aihealz-lang') || 'en';

    const doctor = await prisma.doctorProvider.findUnique({
        where: { slug },
        include: {
            specialties: { select: { condition: { select: { commonName: true, specialistType: true, slug: true } } } },
            geography: {
                select: {
                    name: true,
                    slug: true,
                    level: true,
                    parent: {
                        select: {
                            name: true,
                            slug: true,
                            parent: { select: { name: true, slug: true } }
                        }
                    }
                }
            },
            hospitalDoctors: {
                include: {
                    hospital: {
                        select: { name: true, slug: true, address: true }
                    }
                }
            },
            providerSubscription: {
                select: { planId: true, status: true }
            },
        },
    });

    // Type assertion for media fields (they may not exist yet in DB)
    const doctorMedia = doctor as typeof doctor & {
        coverImage?: string | null;
        images?: string[];
        videoUrl?: string | null;
        videoThumbnail?: string | null;
    };

    // Determine if this is a premium profile
    const isPremium = doctor?.subscriptionTier === 'premium' || doctor?.subscriptionTier === 'enterprise';
    const isEnterprise = doctor?.subscriptionTier === 'enterprise';

    // Extract contact info for premium features
    const contactInfo = doctor?.contactInfo as {
        email?: string;
        phone?: string;
        websiteUrl?: string;
        clinicAddress?: string;
        clinicName?: string;
    } | null;

    if (!doctor) {
        notFound();
    }

    // Get the primary specialty name
    const primarySpecialty = doctor.specialties[0]?.condition?.specialistType || doctor.specialties[0]?.condition?.commonName || '';

    // Get related doctors in same specialty/location
    const relatedDoctors = await prisma.doctorProvider.findMany({
        where: {
            id: { not: doctor.id },
            isVerified: true,
            specialties: {
                some: { conditionId: doctor.specialties[0]?.condition ? undefined : undefined }
            },
            geographyId: doctor.geographyId,
        },
        select: { name: true, slug: true, profileImage: true, rating: true, experienceYears: true },
        take: 4,
    });

    // Get conditions treated by this specialty
    const treatedConditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            specialistType: {
                contains: primarySpecialty.split(' ')[0] || '',
                mode: 'insensitive'
            }
        },
        select: { commonName: true, slug: true },
        take: 12,
    });

    // Build location chain for breadcrumb
    const city = doctor.geography;
    const state = city?.parent;
    const countryGeo = state?.parent;

    // Schema markup
    const physicianSchema = {
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name: formatDoctorName(doctor.name),
        url: `https://aihealz.com/doctor/${slug}`,
        image: doctor.profileImage || undefined,
        description: doctor.bio || undefined,
        medicalSpecialty: doctor.specialties.map(s => s.condition?.specialistType || s.condition?.commonName),
        knowsAbout: treatedConditions.slice(0, 10).map(c => c.commonName),
        ...(doctor.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(doctor.rating), reviewCount: doctor.reviewCount } }),
        ...(city && {
            address: {
                '@type': 'PostalAddress',
                addressLocality: city.name,
                addressRegion: state?.name,
                addressCountry: countryGeo?.name,
            }
        }),
        ...(doctor.consultationFee && {
            priceRange: `${doctor.feeCurrency} ${doctor.consultationFee}`,
        }),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Doctors', item: 'https://aihealz.com/doctors' },
            ...(city ? [{ '@type': 'ListItem', position: 3, name: city.name, item: `https://aihealz.com/doctors/${city.slug}` }] : []),
            { '@type': 'ListItem', position: city ? 4 : 3, name: formatDoctorName(doctor.name), item: `https://aihealz.com/doctor/${slug}` },
        ],
    };

    const specialty = primarySpecialty || 'Medical';

    return (
        <>
            <Script id="physician-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianSchema) }} />
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-28 pb-16">
                <div className="max-w-6xl mx-auto px-6">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/doctors" className="hover:text-white transition-colors">Doctors</Link>
                        {city && (
                            <>
                                <span>/</span>
                                <Link href={`/doctors/${city.slug}`} className="hover:text-white transition-colors">{city.name}</Link>
                            </>
                        )}
                        <span>/</span>
                        <span className="text-white font-medium">{formatDoctorName(doctor.name)}</span>
                    </nav>

                    {/* Doctor Profile Card */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8 mb-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden">
                                    {doctor.profileImage ? (
                                        <Image
                                            src={doctor.profileImage}
                                            alt={formatDoctorName(doctor.name)}
                                            width={160}
                                            height={160}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        /* Professional doctor icon fallback */
                                        <svg className="w-20 h-20 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-col items-center gap-1">
                                    {doctor.isVerified && (
                                        <div className="flex items-center gap-1 text-xs text-emerald-400">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verified
                                        </div>
                                    )}
                                    {isPremium && (
                                        <div className={`flex items-center gap-1 text-xs font-bold ${isEnterprise ? 'text-amber-400' : 'text-teal-400'}`}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {isEnterprise ? 'Top Doctor' : 'Premium'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {formatDoctorName(doctor.name)}
                                </h1>

                                {/* Specialties */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {doctor.specialties.map((s, i) => (
                                        <span key={i} className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-sm font-medium">
                                            {s.condition?.specialistType || s.condition?.commonName}
                                        </span>
                                    ))}
                                </div>

                                {/* Qualifications */}
                                {doctor.qualifications && doctor.qualifications.length > 0 && (
                                    <p className="text-slate-400 text-sm mb-3">
                                        {doctor.qualifications.join(' | ')}
                                    </p>
                                )}

                                {/* Stats Row */}
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {doctor.experienceYears && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-500">Experience:</span>
                                            <span className="text-white font-semibold">{doctor.experienceYears}+ years</span>
                                        </div>
                                    )}
                                    {doctor.rating && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-white font-semibold">{Number(doctor.rating).toFixed(1)}</span>
                                            <span className="text-slate-500">({doctor.reviewCount} reviews)</span>
                                        </div>
                                    )}
                                    {doctor.consultationFee && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-500">Fee:</span>
                                            <span className="text-white font-semibold">{doctor.feeCurrency} {Number(doctor.consultationFee).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Location */}
                                {city && (
                                    <p className="text-sm text-slate-400 mb-4">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {city.name}{state ? `, ${state.name}` : ''}{countryGeo ? `, ${countryGeo.name}` : ''}
                                    </p>
                                )}

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href="#contact"
                                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all"
                                    >
                                        Book Appointment
                                    </a>
                                    {doctor.availableOnline && (
                                        <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-white/10 transition-all">
                                            Video Consult
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            {/* About */}
                            {doctor.bio && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4">About {formatDoctorName(doctor.name)}</h2>
                                    <p className="text-slate-400 leading-relaxed">{doctor.bio}</p>
                                </section>
                            )}

                            {/* Media Gallery */}
                            {(doctorMedia.coverImage || (doctorMedia.images && doctorMedia.images.length > 0) || doctorMedia.videoUrl) && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Photos & Videos
                                    </h2>
                                    <MediaGallery
                                        coverImage={doctorMedia.coverImage}
                                        images={doctorMedia.images}
                                        videoUrl={doctorMedia.videoUrl}
                                        videoThumbnail={doctorMedia.videoThumbnail}
                                        alt={formatDoctorName(doctor.name)}
                                    />
                                </section>
                            )}

                            {/* Hospitals */}
                            {doctor.hospitalDoctors.length > 0 && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4">Hospital Affiliations</h2>
                                    <div className="space-y-3">
                                        {doctor.hospitalDoctors.map((hd, i) => (
                                            <Link
                                                key={i}
                                                href={`/hospitals/${hd.hospital.slug}`}
                                                className="block p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                                            >
                                                <h3 className="font-semibold text-white">{hd.hospital.name}</h3>
                                                {hd.hospital.address && (
                                                    <p className="text-sm text-slate-500 mt-1">{hd.hospital.address}</p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Conditions Treated */}
                            {treatedConditions.length > 0 && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4">Conditions Treated</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {treatedConditions.map((c, i) => (
                                            <Link
                                                key={i}
                                                href={`/${country}/${lang}/${c.slug}`}
                                                className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-white/5 transition-colors"
                                            >
                                                {c.commonName}
                                            </Link>
                                        ))}
                                    </div>
                                    <Link
                                        href={`/conditions/${specialty.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="inline-block mt-4 text-teal-400 hover:text-teal-300 text-sm font-medium"
                                    >
                                        View all {specialty} conditions →
                                    </Link>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Contact Card */}
                            <div id="contact" className={`rounded-2xl p-6 ${isPremium ? 'bg-gradient-to-b from-teal-900/30 to-slate-900/60 border border-teal-500/20' : 'bg-slate-900/60 border border-white/5'}`}>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    Contact Information
                                    {isPremium && (
                                        <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full font-semibold">
                                            {isEnterprise ? 'Elite' : 'Pro'}
                                        </span>
                                    )}
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {/* Clinic Name - Premium feature */}
                                    {isPremium && contactInfo?.clinicName && (
                                        <p className="text-slate-400">
                                            <strong className="text-white">Clinic:</strong><br />
                                            {contactInfo.clinicName}
                                        </p>
                                    )}

                                    {/* Location */}
                                    {city && (
                                        <p className="text-slate-400">
                                            <strong className="text-white">Location:</strong><br />
                                            {city.name}{state ? `, ${state.name}` : ''}
                                        </p>
                                    )}

                                    {/* Clinic Address - Premium feature */}
                                    {isPremium && contactInfo?.clinicAddress && (
                                        <p className="text-slate-400">
                                            <strong className="text-white">Address:</strong><br />
                                            {contactInfo.clinicAddress}
                                        </p>
                                    )}

                                    {/* Consultation Fee */}
                                    {doctor.consultationFee && (
                                        <p className="text-slate-400">
                                            <strong className="text-white">Consultation Fee:</strong><br />
                                            {doctor.feeCurrency} {Number(doctor.consultationFee).toLocaleString()}
                                        </p>
                                    )}

                                    {/* Website - Premium feature */}
                                    {isPremium && contactInfo?.websiteUrl && (
                                        <a
                                            href={contactInfo.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            Visit Website
                                        </a>
                                    )}

                                    {/* Phone - Premium feature (hide obvious placeholder numbers) */}
                                    {isPremium && contactInfo?.phone && !isPlaceholderPhone(contactInfo.phone) && (
                                        <a
                                            href={`tel:${contactInfo.phone}`}
                                            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {contactInfo.phone}
                                        </a>
                                    )}
                                </div>
                                <Link
                                    href={`/book/doctor?doctor=${doctor.slug}&name=${encodeURIComponent(formatDoctorName(doctor.name))}`}
                                    className="block w-full mt-4 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-center transition-all"
                                >
                                    Request Appointment
                                </Link>
                            </div>

                            {/* Related Doctors */}
                            {relatedDoctors.length > 0 && (
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Similar Doctors</h3>
                                    <div className="space-y-3">
                                        {relatedDoctors.map((rd, i) => (
                                            <Link
                                                key={i}
                                                href={`/doctor/${rd.slug}`}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-teal-400 font-semibold">
                                                    {rd.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{formatDoctorName(rd.name)}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {rd.experienceYears ? `${rd.experienceYears}+ yrs` : ''}
                                                        {rd.rating ? ` • ★ ${Number(rd.rating).toFixed(1)}` : ''}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link
                                        href={city ? `/doctors/${city.slug}` : '/doctors'}
                                        className="block w-full mt-4 px-4 py-2 text-center text-teal-400 hover:text-teal-300 text-sm font-medium border border-teal-500/20 rounded-lg"
                                    >
                                        View More {specialty} Doctors
                                    </Link>
                                </div>
                            )}
                        </aside>
                    </div>

                    {/* Internal Links Section */}
                    <section className="mt-12 grid md:grid-cols-3 gap-6">
                        <Link href="/doctors" className="bg-slate-900/60 border border-white/5 hover:border-teal-500/30 rounded-2xl p-6 transition-all group">
                            <h3 className="font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Find More Doctors</h3>
                            <p className="text-sm text-slate-500">Browse verified specialists across all locations</p>
                        </Link>
                        <Link href="/hospitals" className="bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 transition-all group">
                            <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Top Hospitals</h3>
                            <p className="text-sm text-slate-500">Find the best hospitals for your treatment</p>
                        </Link>
                        <Link href="/symptoms" className="bg-slate-900/60 border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 transition-all group">
                            <h3 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">AI Symptom Checker</h3>
                            <p className="text-sm text-slate-500">Get instant guidance on your symptoms</p>
                        </Link>
                    </section>
                </div>
            </main>
        </>
    );
}
