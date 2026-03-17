import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';

// ── Dynamic SEO Metadata ────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
    const { location } = await params;
    const geo = await prisma.geography.findFirst({ where: { slug: location, isActive: true } });
    if (!geo) return { title: 'Doctors | aihealz' };

    const levelLabel = geo.level === 'country' ? 'Country' : geo.level === 'state' ? 'State' : 'City';
    return {
        title: `Top Doctors in ${geo.name} – Verified Specialists | aihealz`,
        description: `Find the best verified doctors and specialists in ${geo.name} (${levelLabel}). Compare ratings, read patient reviews, and book consultations.`,
        keywords: [`doctors in ${geo.name}`, `best doctors ${geo.name}`, `specialists ${geo.name}`, `hospitals ${geo.name}`, 'aihealz'],
        openGraph: {
            title: `Top Doctors in ${geo.name} | aihealz`,
            description: `Browse verified specialists in ${geo.name}. AI-powered ranking and matching.`,
            type: 'website',
        },
    };
}

// ── Collect all descendant geography IDs ────────────────────
async function getDescendantIds(parentId: number): Promise<number[]> {
    const children = await prisma.geography.findMany({
        where: { parentId, isActive: true },
        select: { id: true },
    });
    const ids = children.map(c => c.id);
    for (const child of children) {
        const grandchildren = await getDescendantIds(child.id);
        ids.push(...grandchildren);
    }
    return ids;
}

// ── Page Component ──────────────────────────────────────────
export default async function LocationDoctors({ params }: { params: Promise<{ location: string }> }) {
    const { location } = await params;

    // Find geography at any level
    const geo = await prisma.geography.findFirst({
        where: { slug: location, isActive: true },
    });

    if (!geo) notFound();

    // Collect all geo IDs to search (self + all descendants)
    const descendantIds = await getDescendantIds(geo.id);
    const allGeoIds = [geo.id, ...descendantIds];

    const doctors = await prisma.doctorProvider.findMany({
        where: { geographyId: { in: allGeoIds }, isVerified: true },
        orderBy: { badgeScore: 'desc' },
        take: 50,
        include: {
            specialties: { include: { condition: true } },
            geography: true,
        },
    });

    // Sub-locations (children of this geo)
    const subLocations = await prisma.geography.findMany({
        where: { parentId: geo.id, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, level: true },
    });

    // JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Top Doctors in ${geo.name}`,
        description: `Verified medical specialists in ${geo.name}, ranked by AI-powered impact scoring.`,
        numberOfItems: doctors.length,
        itemListElement: doctors.slice(0, 10).map((doc, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'Physician',
                name: doc.name,
                url: `https://aihealz.com/in/en/doctors/${doc.slug}`,
                ...(doc.profileImage && { image: doc.profileImage }),
                ...(doc.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(doc.rating), bestRating: 5, ratingCount: doc.reviewCount || 1 } }),
                address: { '@type': 'PostalAddress', addressLocality: geo.name },
                medicalSpecialty: doc.specialties[0]?.condition?.commonName || 'General Medicine',
            }
        })),
    };

    const levelLabel = geo.level === 'country' ? 'Country' : geo.level === 'state' ? 'State / Province' : 'City';
    const subLevelLabel = geo.level === 'country' ? 'States / Provinces' : geo.level === 'state' ? 'Cities' : 'Localities';

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-purple-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <Link href="/doctors" className="hover:text-white transition-colors">Doctors</Link>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="text-white font-medium">{geo.name}</span>
                    </nav>

                    {/* Hero */}
                    <div className="mb-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/60 text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {levelLabel}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                            Top Doctors in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{geo.name}</span>
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            {doctors.length} verified specialists available across {geo.name}. AI-ranked by clinical outcomes, patient feedback, and research impact.
                        </p>
                    </div>

                    <SearchAutocomplete className="max-w-2xl mb-10" />

                    {/* Language Options */}
                    {(() => {
                        const LANG_NAMES: Record<string, string> = {
                            en: 'English', hi: 'हिन्दी', te: 'తెలుగు', ta: 'தமிழ்', kn: 'ಕನ್ನಡ', ml: 'മലയാളം', mr: 'मराठी',
                            gu: 'ગુજરાતી', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ', or: 'ଓଡ଼ିଆ', as: 'অসমীয়া', ur: 'اردو', ne: 'नेपाली',
                            kok: 'कोंकणी', kha: 'Khasi', lus: 'Mizo', mni: 'মৈতৈলোন্', fr: 'Français',
                        };
                        const langs = (geo.supportedLanguages as string[]) || [];
                        const otherLangs = langs.filter(l => l !== 'en');
                        if (otherLangs.length === 0) return null;
                        return (
                            <div className="mb-8">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    Also available in
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {otherLangs.map(l => (
                                        <Link
                                            key={l}
                                            href={`/doctors/${geo.slug}/${l}`}
                                            className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-white/5 transition-colors"
                                        >
                                            {LANG_NAMES[l] || l}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Sub-locations */}
                    {subLocations.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                {subLevelLabel} in {geo.name}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {subLocations.map(sub => (
                                    <Link
                                        key={sub.id}
                                        href={`/doctors/${sub.slug}`}
                                        className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg border border-white/5 hover:border-purple-500/30 transition-all"
                                    >
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Doctor Grid */}
                    <section aria-labelledby="doctors-heading">
                        <h2 id="doctors-heading" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Verified Specialists ({doctors.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {doctors.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/doctor/${doc.slug}`}
                                    className="bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 rounded-2xl overflow-hidden hover:bg-slate-800/60 transition-all group flex flex-col"
                                >
                                    <div className="h-36 bg-gradient-to-br from-purple-900/40 via-slate-800 to-cyan-900/30 relative overflow-hidden">
                                        {doc.profileImage ? (
                                            <AvatarWithFallback src={doc.profileImage} alt={doc.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                                    <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <span className="bg-slate-900/70 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-semibold border border-white/10 flex items-center gap-1">
                                                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                            </span>
                                            {Number(doc.badgeScore || 0) > 90 && (
                                                <span className="bg-amber-500/90 text-slate-900 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Top 1%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-purple-400 transition-colors leading-tight line-clamp-1">{doc.name}</h3>
                                        {doc.specialties.length > 0 && (
                                            <p className="text-xs font-medium text-cyan-400 mb-3 truncate">{doc.specialties[0].condition?.commonName || 'Specialist'}</p>
                                        )}
                                        <div className="space-y-1.5 mt-auto">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{doc.geography?.name || geo.name}</span>
                                            </div>
                                            {doc.experienceYears && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <span>{doc.experienceYears}+ Years</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {doctors.length === 0 && (
                        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Specialists Found in {geo.name}</h3>
                            <p className="text-slate-500 mb-6">We haven&apos;t onboarded specialists in this {levelLabel.toLowerCase()} yet.</p>
                            <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Browse All Locations
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
