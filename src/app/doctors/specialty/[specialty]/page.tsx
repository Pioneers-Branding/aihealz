import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';
import { getGeoContext } from '@/lib/geo-context';

type PageParams = Promise<{ specialty: string }>;

// Doctor categories for labels
// Helper function to format doctor name without double "Dr." prefix
function formatDoctorName(name: string): string {
    const trimmed = name.trim();
    // Check for various "Dr." patterns at the start
    if (/^dr\.?\s+/i.test(trimmed)) {
        return trimmed; // Already has Dr. prefix
    }
    return `Dr. ${trimmed}`;
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
    'Primary Care': { label: 'Primary Care', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'Specialist': { label: 'Specialist', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'Surgeon': { label: 'Surgeon', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    'Pediatric': { label: 'Pediatric', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    "Women's Health": { label: "Women's Health", color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    'Dental': { label: 'Dental', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    'Mental Health': { label: 'Mental Health', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    'Eye Care': { label: 'Eye Care', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'ENT': { label: 'ENT', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
};

function getCategoryStyle(label: string | null): { label: string; color: string } {
    if (!label) return { label: 'Specialist', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    return CATEGORY_MAP[label] || { label, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
}

function formatSpecialtyTitle(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Convert specialty title to various search variants for matching
// e.g., "Cardiologist" -> ["Cardiologist", "Cardiology", "Cardiac"]
function getSpecialtyVariants(title: string): string[] {
    const variants: string[] = [title];
    const lower = title.toLowerCase();

    // Cardiologist -> Cardiology
    if (lower.endsWith('ist')) {
        variants.push(title.slice(0, -3) + 'ogy');
        variants.push(title.slice(0, -3) + 'y');
    }
    // Cardiology -> Cardiologist
    if (lower.endsWith('ology')) {
        variants.push(title.slice(0, -5) + 'ologist');
    }
    if (lower.endsWith('ogy')) {
        variants.push(title.slice(0, -3) + 'ogist');
    }
    // Dermatologist -> Dermatology
    if (lower.endsWith('logist')) {
        variants.push(title.slice(0, -5) + 'ogy');
    }
    // General Physician
    if (lower.includes('physician')) {
        variants.push('General Practice', 'Internal Medicine', 'Family Medicine');
    }
    // Orthopedist / Orthopedic
    if (lower.includes('orthop')) {
        variants.push('Orthopedics', 'Orthopedic Surgery', 'Orthopedist', 'Orthopaedics');
    }
    // ENT
    if (lower.includes('ent') || lower.includes('otolaryngology')) {
        variants.push('ENT', 'Otolaryngology', 'ENT Specialist', 'Ear Nose Throat');
    }
    // Dentist
    if (lower.includes('dent')) {
        variants.push('Dentist', 'Dentistry', 'Dental', 'Dental Surgeon');
    }

    return [...new Set(variants)];
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
    const { specialty } = await params;
    const title = formatSpecialtyTitle(specialty);

    return {
        title: `Top ${title}s Near You | Best ${title} Doctors | AIHealz`,
        description: `Find the best ${title.toLowerCase()}s near you. Compare ratings, read reviews, and book appointments with top-rated ${title.toLowerCase()} doctors. Verified specialists with years of experience.`,
        keywords: `best ${title.toLowerCase()}, top ${title.toLowerCase()}, ${title.toLowerCase()} near me, ${title.toLowerCase()} doctor, find ${title.toLowerCase()}, ${title.toLowerCase()} specialist`,
        openGraph: {
            title: `Top ${title}s - Find Best ${title} Doctors Near You`,
            description: `Browse verified ${title.toLowerCase()}s. Compare ratings, experience, and book consultations.`,
            url: `https://aihealz.com/doctors/specialty/${specialty}`,
        },
    };
}

export default async function SpecialtyDoctorsPage({ params }: { params: PageParams }) {
    const { specialty } = await params;
    const specialtyTitle = formatSpecialtyTitle(specialty);

    // Get user's geo context for location-aware results
    const geo = await getGeoContext();

    // Build location filter if available
    let geoIds: number[] = [];
    if (geo.countrySlug) {
        const userGeos = await prisma.geography.findMany({
            where: {
                OR: [
                    { slug: geo.countrySlug, level: 'country' },
                    { slug: geo.citySlug || '', level: 'city' },
                ],
                isActive: true,
            },
            select: { id: true },
        });

        if (userGeos.length > 0) {
            // Get all descendant geographies
            const countryId = userGeos.find(g => g.id)?.id;
            if (countryId) {
                const descendants = await prisma.geography.findMany({
                    where: {
                        OR: [
                            { id: countryId },
                            { parentId: countryId },
                        ],
                        isActive: true,
                    },
                    select: { id: true },
                });
                geoIds = descendants.map(g => g.id);

                // Get cities under states
                if (geoIds.length > 0) {
                    const cities = await prisma.geography.findMany({
                        where: { parentId: { in: geoIds }, isActive: true },
                        select: { id: true },
                    });
                    geoIds.push(...cities.map(g => g.id));
                }
            }
        }
    }

    // Get all variants of the specialty name for matching
    const specialtyVariants = getSpecialtyVariants(specialtyTitle);

    // Find doctors matching this specialty - use flexible matching with variants
    const doctors = await prisma.doctorProvider.findMany({
        where: {
            isVerified: true,
            // Match the specialty using all variants
            specialties: {
                some: {
                    condition: {
                        OR: [
                            // Match any variant on specialist type
                            ...specialtyVariants.map(variant => ({
                                specialistType: { contains: variant, mode: 'insensitive' as const }
                            })),
                            // Or the common name contains any variant
                            ...specialtyVariants.map(variant => ({
                                commonName: { contains: variant, mode: 'insensitive' as const }
                            })),
                        ],
                    },
                },
            },
            // Filter by location if geo context available, otherwise show all
            ...(geoIds.length > 0 ? { geographyId: { in: geoIds } } : {}),
        },
        orderBy: [
            { subscriptionTier: 'desc' },
            { badgeScore: 'desc' },
            { rating: 'desc' },
        ],
        take: 50,
        include: {
            specialties: { include: { condition: { select: { commonName: true, specialistType: true } } } },
            geography: {
                include: {
                    parent: { select: { name: true, slug: true } },
                },
            },
        },
    });

    // If no doctors found for this specialty, show empty state
    if (doctors.length === 0) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/doctors" className="hover:text-white transition-colors">Doctors</Link>
                        <span>/</span>
                        <span className="text-white">{specialtyTitle}</span>
                    </nav>

                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">No {specialtyTitle}s Found</h1>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            We&apos;re currently expanding our network of {specialtyTitle.toLowerCase()}s.
                            Check back soon or browse our other specialties.
                        </p>
                        <Link
                            href="/doctors"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors"
                        >
                            Browse All Doctors
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Get related specialties for sidebar
    const relatedSpecialties = [
        'cardiologist', 'dermatologist', 'neurologist', 'orthopedist',
        'gastroenterologist', 'pediatrician', 'gynecologist', 'dentist',
        'psychiatrist', 'ophthalmologist', 'ent-specialist', 'general-physician'
    ].filter(s => s !== specialty);

    // Proper country display names (handles acronyms like UAE, USA, UK)
    const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
        'uae': 'UAE', 'usa': 'USA', 'uk': 'UK',
        'india': 'India', 'nigeria': 'Nigeria', 'kenya': 'Kenya',
        'germany': 'Germany', 'france': 'France', 'spain': 'Spain',
        'australia': 'Australia', 'canada': 'Canada', 'brazil': 'Brazil',
        'saudi-arabia': 'Saudi Arabia', 'south-africa': 'South Africa',
    };

    const locationDisplay = geo.citySlug
        ? doctors[0]?.geography?.name
        : (geo.countrySlug ? COUNTRY_DISPLAY_NAMES[geo.countrySlug.toLowerCase()] || geo.countrySlug.charAt(0).toUpperCase() + geo.countrySlug.slice(1) : '');

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-cyan-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/doctors" className="hover:text-white transition-colors">Doctors</Link>
                    <span>/</span>
                    <span className="text-white font-medium">{specialtyTitle}</span>
                </nav>

                {/* Hero */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        {doctors.length} Verified {specialtyTitle}s
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">{specialtyTitle}s</span>
                        {locationDisplay && <span className="block text-xl sm:text-2xl text-slate-400 font-medium mt-2">in {locationDisplay}</span>}
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 px-4 sm:px-0">
                        Find and compare the best {specialtyTitle.toLowerCase()}s. All doctors are verified with credentials checked.
                    </p>
                </div>

                {/* SEO Keywords Section */}
                <div className="mb-8 flex flex-wrap gap-2 justify-center">
                    {[
                        `Best ${specialtyTitle}`,
                        `Top 10 ${specialtyTitle}s`,
                        `${specialtyTitle} Near Me`,
                        `Affordable ${specialtyTitle}`,
                        `Experienced ${specialtyTitle}`,
                    ].map((keyword, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-800/50 text-slate-400 text-sm rounded-full border border-white/5">
                            {keyword}
                        </span>
                    ))}
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            {doctors.map((doc, index) => {
                                const category = getCategoryStyle(doc.badgeLabel);
                                const isTop = index < 3;

                                return (
                                    <Link
                                        key={doc.id}
                                        href={`/doctor/${doc.slug}`}
                                        className="bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col backdrop-blur-sm"
                                    >
                                        {/* Top Badge */}
                                        {isTop && (
                                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-1.5 px-3 text-center">
                                                #{index + 1} Top Rated {specialtyTitle}
                                            </div>
                                        )}

                                        <div className="h-32 bg-gradient-to-br from-cyan-900/40 via-slate-800/40 to-blue-900/40 relative overflow-hidden">
                                            {doc.profileImage ? (
                                                <AvatarWithFallback
                                                    src={doc.profileImage}
                                                    alt={doc.name}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                        <span className="text-2xl text-slate-400 font-bold">{doc.name.charAt(0)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent"></div>

                                            {/* Category Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${category.color}`}>
                                                    {category.label}
                                                </span>
                                            </div>

                                            {/* Rating */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs font-bold border border-white/20 flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                                </span>
                                            </div>

                                            {/* Premium Badge */}
                                            {doc.subscriptionTier === 'premium' && (
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                                                        Premium
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-cyan-400 transition-colors">
                                                {formatDoctorName(doc.name)}
                                            </h3>
                                            {doc.specialties.length > 0 && (
                                                <p className="text-xs font-semibold text-cyan-400 mb-2 truncate">
                                                    {doc.specialties[0].condition?.specialistType || doc.specialties[0].condition?.commonName || specialtyTitle}
                                                </p>
                                            )}

                                            <div className="space-y-1.5 mt-auto text-xs text-slate-400">
                                                {doc.geography && (
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="truncate">{doc.geography.name}{doc.geography.parent ? `, ${doc.geography.parent.name}` : ''}</span>
                                                    </div>
                                                )}
                                                {doc.experienceYears && (
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{doc.experienceYears}+ Years Experience</span>
                                                    </div>
                                                )}
                                                {doc.consultationFee && (
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{doc.feeCurrency} {Number(doc.consultationFee).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Related Specialties */}
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
                            <h3 className="text-lg font-bold text-white mb-4">Other Specialties</h3>
                            <div className="space-y-2">
                                {relatedSpecialties.slice(0, 10).map((spec) => (
                                    <Link
                                        key={spec}
                                        href={`/doctors/specialty/${spec}`}
                                        className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                                    >
                                        {formatSpecialtyTitle(spec)}s
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-cyan-900/30 to-slate-900/60 rounded-2xl border border-cyan-500/20 p-5">
                            <h3 className="text-lg font-bold text-white mb-4">Need Help Finding?</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Use our AI to match you with the perfect {specialtyTitle.toLowerCase()} based on your needs.
                            </p>
                            <Link
                                href="/healz-ai"
                                className="block w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-center transition-colors"
                            >
                                Ask AI Assistant
                            </Link>
                        </div>

                        {/* Browse by Location */}
                        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
                            <h3 className="text-lg font-bold text-white mb-4">Browse by Location</h3>
                            <Link
                                href="/doctors"
                                className="block px-3 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-white/[0.05] rounded-lg transition-colors"
                            >
                                View All Locations →
                            </Link>
                        </div>
                    </aside>
                </div>

                {/* SEO Content */}
                <section className="mt-16 bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">About {specialtyTitle}s</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400">
                        <p>
                            A {specialtyTitle.toLowerCase()} is a medical professional specializing in diagnosing and treating conditions related to their area of expertise.
                            On AIHealz, all {specialtyTitle.toLowerCase()}s are verified with credential checks and patient reviews.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">When to See a {specialtyTitle}?</h3>
                        <p>
                            You should consider consulting a {specialtyTitle.toLowerCase()} when you experience symptoms related to their specialty,
                            need a second opinion, or require specialized treatment that your primary care physician cannot provide.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">How to Choose the Best {specialtyTitle}?</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Check their qualifications and credentials</li>
                            <li>Read patient reviews and ratings</li>
                            <li>Consider their experience in treating your specific condition</li>
                            <li>Look for doctors affiliated with reputable hospitals</li>
                            <li>Compare consultation fees and availability</li>
                        </ul>
                    </div>
                </section>
            </div>
        </main>
    );
}
