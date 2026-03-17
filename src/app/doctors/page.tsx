import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';
import { getGeoContext } from '@/lib/geo-context';
import { AIDiagnosisCTA, BookTestCTA, MedicalTravelCTA } from '@/components/ui/cta-sections';

// Helper function to format doctor name without double "Dr." prefix
function formatDoctorName(name: string): string {
    const trimmed = name.trim();
    // Check for various "Dr." patterns at the start
    if (/^dr\.?\s+/i.test(trimmed)) {
        return trimmed; // Already has Dr. prefix
    }
    return `Dr. ${trimmed}`;
}
import {
    generateItemListSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
    generateWebPageSchema,
    generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'Top Rated Doctors & Specialists | AIHealz',
    description: 'Find, compare, and connect with the highest-rated medical professionals across the world. Browse verified doctors by country, state, or city.',
    keywords: 'find doctors, top doctors, medical specialists, verified physicians, doctor directory, healthcare providers',
    openGraph: {
        title: 'Find Top Doctors & Specialists Worldwide',
        description: 'Browse verified doctors across 50+ countries. Compare ratings, specialties, and book consultations.',
        url: 'https://aihealz.com/doctors',
        siteName: 'AIHealz',
    },
};

interface GeoNode {
    id: number;
    name: string;
    slug: string;
    level: string;
    parentId: number | null;
}

export default async function DoctorsDirectory() {
    // Get user's detected location
    const geo = await getGeoContext();

    // Find user's country geography ID if detected
    let userCountryGeoId: number | null = null;
    let userCityGeoId: number | null = null;

    if (geo.countrySlug) {
        const userGeos = await prisma.geography.findMany({
            where: {
                slug: { in: [geo.countrySlug, geo.citySlug].filter(Boolean) as string[] },
                isActive: true,
            },
            select: { id: true, slug: true, level: true },
        });

        for (const g of userGeos) {
            if (g.level === 'country') userCountryGeoId = g.id;
            if (g.level === 'city' || g.level === 'state') userCityGeoId = g.id;
        }
    }

    // Build query to prioritize doctors from user's location
    // Start with basic verification filter
    const doctorWhere: { isVerified?: boolean; geographyId?: { in: number[] } } = {};

    // Get geography IDs for filtering (if user location detected)
    let geoIds: number[] = [];

    // If we have user's location, filter doctors from that country
    if (userCountryGeoId) {
        // Get all geography IDs under this country for broader matching
        const countryGeoIds = await prisma.geography.findMany({
            where: {
                OR: [
                    { id: userCountryGeoId },
                    { parentId: userCountryGeoId },
                ],
                isActive: true,
            },
            select: { id: true },
        });
        geoIds = countryGeoIds.map(g => g.id);

        // Also get cities under states
        if (geoIds.length > 0) {
            const citiesUnderStates = await prisma.geography.findMany({
                where: {
                    parentId: { in: geoIds },
                    isActive: true,
                },
                select: { id: true },
            });
            geoIds.push(...citiesUnderStates.map(g => g.id));

            // Get localities under cities too
            const localitiesUnderCities = await prisma.geography.findMany({
                where: {
                    parentId: { in: geoIds },
                    isActive: true,
                },
                select: { id: true },
            });
            geoIds.push(...localitiesUnderCities.map(g => g.id));
        }

        if (geoIds.length > 0) {
            doctorWhere.geographyId = { in: geoIds };
        }
    }
    // Note: If no geo detected, we show ALL doctors (no geographyId filter)

    const [doctors, allGeos] = await Promise.all([
        prisma.doctorProvider.findMany({
            where: doctorWhere,
            orderBy: { badgeScore: 'desc' },
            take: 24,
            include: {
                specialties: { include: { condition: true } },
                geography: true,
            }
        }),
        prisma.geography.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, level: true, parentId: true },
        }),
    ]);

    // Build hierarchy: country → states → cities
    const countries = allGeos.filter(g => g.level === 'country');
    const statesByParent = new Map<number, GeoNode[]>();
    const citiesByParent = new Map<number, GeoNode[]>();

    for (const g of allGeos) {
        if (g.level === 'state' && g.parentId) {
            if (!statesByParent.has(g.parentId)) statesByParent.set(g.parentId, []);
            statesByParent.get(g.parentId)!.push(g);
        }
        if (g.level === 'city' && g.parentId) {
            if (!citiesByParent.has(g.parentId)) citiesByParent.set(g.parentId, []);
            citiesByParent.get(g.parentId)!.push(g);
        }
    }

    const totalStates = allGeos.filter(g => g.level === 'state').length;
    const totalCities = allGeos.filter(g => g.level === 'city').length;

    // Get user's country name for display
    const userCountry = geo.countrySlug
        ? allGeos.find(g => g.slug === geo.countrySlug && g.level === 'country')
        : null;
    const userCity = geo.citySlug
        ? allGeos.find(g => g.slug === geo.citySlug)
        : null;

    const locationDisplay = userCity && userCountry
        ? `${userCity.name}, ${userCountry.name}`
        : userCountry?.name || null;

    // Generate structured data
    const doctorFaqs = [
        { question: 'How do I find a specialist near me?', answer: 'Use our location-based search to find verified doctors in your city. Our AI matches you with specialists based on your condition and location.' },
        { question: 'Are doctors verified on AIHealz?', answer: 'Yes, all doctors with a "Verified" badge have undergone credential verification including license validation and practice history review.' },
        { question: 'Can I book an appointment online?', answer: 'Yes, many doctors on our platform offer online booking. You can also request a callback or video consultation.' },
        { question: 'How are doctor ratings calculated?', answer: 'Ratings are based on verified patient reviews, treatment outcomes, and professional credentials. Our AI analyzes multiple factors for accurate scoring.' },
    ];

    const structuredData = [
        generateWebPageSchema(
            'Find Top Doctors & Specialists Worldwide',
            'Browse verified doctors across 50+ countries. Compare ratings, specialties, and book consultations with the best medical professionals.',
            'https://aihealz.com/doctors'
        ),
        generateOrganizationSchema(),
        generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Doctors', url: '/doctors' },
        ]),
        generateItemListSchema(
            'Top Rated Doctors',
            'Browse verified medical specialists worldwide',
            doctors.slice(0, 10).map((doc, i) => ({
                name: doc.name,
                url: `/doctor/${doc.slug}`,
                position: i + 1,
            }))
        ),
        generateFAQSchema(doctorFaqs),
    ];

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-cyan-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                {/* ── Hero ─────────────────────────────────── */}
                <div className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
                    {/* Location indicator */}
                    {locationDisplay && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Showing doctors in {locationDisplay}
                            <Link href="/doctors" className="text-cyan-300 hover:text-white text-xs ml-1">(View all)</Link>
                        </div>
                    )}

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>
                        AI-Verified Network
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white">
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500">Perfect Specialist</span>
                        {userCountry && <span className="block text-xl sm:text-2xl md:text-3xl text-slate-400 font-medium mt-2">in {userCountry.name}</span>}
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 mb-8 px-4 sm:px-0">
                        {locationDisplay
                            ? `Browse verified specialists near you. Can't find what you need? Explore doctors across ${countries.length} countries worldwide.`
                            : `Connect with verified, top-rated medical professionals across ${countries.length} countries, ${totalStates} states, and ${totalCities} cities worldwide.`
                        }
                    </p>
                    <SearchAutocomplete variant="dark" className="max-w-2xl mx-auto" />
                </div>

                {/* ── Browse by Specialty ──────────────────── */}
                <section className="mb-16 md:mb-20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Browse by Specialty</h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Categories</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                        {[
                            { name: 'General Physician', slug: 'general-physician', iconPath: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-cyan-400', category: 'Primary Care' },
                            { name: 'Cardiologist', slug: 'cardiologist', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-rose-400', category: 'Specialist' },
                            { name: 'Dermatologist', slug: 'dermatologist', iconPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', color: 'text-pink-400', category: 'Specialist' },
                            { name: 'Neurologist', slug: 'neurologist', iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'text-purple-400', category: 'Specialist' },
                            { name: 'Orthopedist', slug: 'orthopedist', iconPath: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', color: 'text-amber-400', category: 'Specialist' },
                            { name: 'Pediatrician', slug: 'pediatrician', iconPath: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400', category: 'Pediatric' },
                            { name: 'Gynecologist', slug: 'gynecologist', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-pink-400', category: "Women's Health" },
                            { name: 'Dentist', slug: 'dentist', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'text-sky-400', category: 'Dental' },
                            { name: 'Psychiatrist', slug: 'psychiatrist', iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'text-violet-400', category: 'Mental Health' },
                            { name: 'Ophthalmologist', slug: 'ophthalmologist', iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'text-blue-400', category: 'Eye Care' },
                            { name: 'ENT Specialist', slug: 'ent-specialist', iconPath: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'text-teal-400', category: 'ENT' },
                            { name: 'General Surgeon', slug: 'general-surgeon', iconPath: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', color: 'text-red-400', category: 'Surgeon' },
                        ].map((spec) => (
                            <Link
                                key={spec.slug}
                                href={`/doctors/specialty/${spec.slug}`}
                                className="bg-white/[0.03] rounded-xl sm:rounded-2xl border border-white/[0.08] p-4 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group text-center"
                            >
                                <div className={`w-12 h-12 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-3 ${spec.color}`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={spec.iconPath} />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{spec.name}</h3>
                                <p className="text-[10px] text-slate-500 mt-1">{spec.category}</p>
                            </Link>
                        ))}
                    </div>

                    {/* Popular Searches */}
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        {[
                            'Top 10 Cardiologists',
                            'Best Dermatologist Near Me',
                            'Pediatrician for Kids',
                            'Affordable Dentist',
                            'Best Orthopedic Surgeon',
                            'Women Gynecologist',
                        ].map((keyword, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-800/50 text-slate-400 text-xs rounded-full border border-white/5 hover:border-cyan-500/30 hover:text-cyan-400 cursor-pointer transition-colors">
                                {keyword}
                            </span>
                        ))}
                    </div>

                    {/* AI Diagnosis CTA */}
                    <div className="mt-8">
                        <AIDiagnosisCTA
                            variant="inline"
                            title="Not sure which specialist you need?"
                            subtitle="Our AI can recommend the right doctor based on your symptoms"
                        />
                    </div>
                </section>

                {/* ── Browse by Location (Full Hierarchy) ─── */}
                <section className="mb-16 md:mb-20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Browse by Location</h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{countries.length} Countries</span>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {countries.map(country => {
                            const states = statesByParent.get(country.id) || [];
                            return (
                                <div key={country.id} className="bg-white/[0.03] rounded-2xl sm:rounded-3xl border border-white/[0.08] overflow-hidden backdrop-blur-sm">
                                    {/* Country Header */}
                                    <Link
                                        href={`/doctors/${country.slug}`}
                                        className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/20">
                                                {country.slug.toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">{country.name}</h3>
                                                <p className="text-xs text-slate-500">{states.length} states/provinces</p>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>

                                    {/* States & Cities */}
                                    {states.length > 0 && (
                                        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {states.map(state => {
                                                const cities = citiesByParent.get(state.id) || [];
                                                return (
                                                    <div key={state.id} className="bg-white/[0.02] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/[0.06]">
                                                        <Link
                                                            href={`/doctors/${state.slug}`}
                                                            className="flex items-center gap-2 mb-3 group"
                                                        >
                                                            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                                                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{state.name}</h4>
                                                        </Link>
                                                        {cities.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {cities.map(city => (
                                                                    <Link
                                                                        key={city.id}
                                                                        href={`/doctors/${city.slug}`}
                                                                        className="text-xs font-medium text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-white/[0.08] hover:border-cyan-500/30 transition-all"
                                                                    >
                                                                        {city.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Top Specialists Grid ───────────────── */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Top Specialists</h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{doctors.length} Specialists</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {doctors.map((doc) => {
                            // Determine category based on badgeLabel or specialty
                            const categoryColors: Record<string, string> = {
                                'Primary Care': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                'Specialist': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                                'Surgeon': 'bg-red-500/10 text-red-400 border-red-500/20',
                                'Pediatric': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
                                "Women's Health": 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                                'Dental': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                                'Mental Health': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                                'Eye Care': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                'ENT': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
                            };
                            const category = doc.badgeLabel || 'Specialist';
                            const categoryColor = categoryColors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                            return (
                                <Link
                                    key={doc.id}
                                    href={`/doctor/${doc.slug}`}
                                    className="bg-white/[0.03] rounded-2xl sm:rounded-3xl border border-white/[0.08] overflow-hidden hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col backdrop-blur-sm"
                                >
                                    <div className="h-36 sm:h-40 bg-gradient-to-br from-cyan-900/40 via-slate-800/40 to-blue-900/40 relative overflow-hidden">
                                        {doc.profileImage ? (
                                            <AvatarWithFallback src={doc.profileImage} alt={doc.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent"></div>

                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${categoryColor}`}>
                                                {category}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold border border-white/20 flex items-center gap-1">
                                                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                            </span>
                                            {Number(doc.badgeScore || 0) > 90 && (
                                                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">Top 1%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                                        <h3 className="text-sm sm:text-base font-bold text-white mb-0.5 group-hover:text-cyan-400 transition-colors leading-tight">{formatDoctorName(doc.name)}</h3>
                                        {doc.specialties.length > 0 && (
                                            <p className="text-xs font-semibold text-cyan-400 mb-3 truncate">{doc.specialties[0].condition?.specialistType || doc.specialties[0].condition?.commonName || 'Specialist'}</p>
                                        )}
                                        <div className="space-y-1.5 mt-auto">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{doc.geography?.name || 'India'}</span>
                                            </div>
                                            {doc.experienceYears && (
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span>{doc.experienceYears}+ Years Exp.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {doctors.length === 0 && (
                    <div className="text-center py-16 sm:py-20 bg-white/[0.02] rounded-2xl sm:rounded-3xl border border-dashed border-white/[0.1] mt-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Network Syncing</h3>
                        <p className="text-slate-500">The provider database is currently populating. Please check back shortly.</p>
                    </div>
                )}

                {/* Additional CTAs Section */}
                <section className="mt-16 grid md:grid-cols-2 gap-6">
                    {/* Book Test CTA */}
                    <BookTestCTA variant="card" />

                    {/* Medical Travel CTA */}
                    <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">Need Treatment Abroad?</h3>
                                <p className="text-sm text-slate-400 mb-4">
                                    Compare treatment costs across 7 countries and save up to 90% on medical procedures.
                                </p>
                                <MedicalTravelCTA variant="mini" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
