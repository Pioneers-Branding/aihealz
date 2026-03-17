import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';

// ── Language display names ──────────────────────────────────
const LANG_NAMES: Record<string, string> = {
    en: 'English', hi: 'हिन्दी (Hindi)', te: 'తెలుగు (Telugu)', ta: 'தமிழ் (Tamil)',
    kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)', mr: 'मराठी (Marathi)',
    gu: 'ગુજરાતી (Gujarati)', bn: 'বাংলা (Bengali)', pa: 'ਪੰਜਾਬੀ (Punjabi)',
    or: 'ଓଡ଼ିଆ (Odia)', as: 'অসমীয়া (Assamese)', ur: 'اردو (Urdu)',
    ne: 'नेपाली (Nepali)', kok: 'कोंकणी (Konkani)', kha: 'Khasi',
    lus: 'Mizo', mni: 'মৈতৈলোন্ (Manipuri)', nag: 'Naga', fr: 'Français (French)',
};

// ── Collect descendant geo IDs ──────────────────────────────
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

// ── Dynamic metadata ────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ location: string; lang: string }> }): Promise<Metadata> {
    const { location, lang } = await params;
    const geo = await prisma.geography.findFirst({ where: { slug: location, isActive: true } });
    if (!geo) return { title: 'Doctors | aihealz' };
    const langName = LANG_NAMES[lang] || lang;

    return {
        title: `Doctors in ${geo.name} — ${langName} | aihealz`,
        description: `Browse top verified doctors in ${geo.name}. Page available in ${langName}. AI-powered specialist matching and ranking.`,
        keywords: [`doctors ${geo.name}`, `${langName} doctors`, `specialists ${geo.name}`, 'aihealz'],
    };
}

// ── Page Component ──────────────────────────────────────────
export default async function LanguageLocationDoctors({ params }: { params: Promise<{ location: string; lang: string }> }) {
    const { location, lang } = await params;

    const geo = await prisma.geography.findFirst({
        where: { slug: location, isActive: true },
    });
    if (!geo) notFound();

    // Check if this language is supported for this geo
    const supportedLangs: string[] = (geo.supportedLanguages as string[]) || ['en'];
    if (!supportedLangs.includes(lang)) notFound();

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

    // Sub-locations
    const subLocations = await prisma.geography.findMany({
        where: { parentId: geo.id, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, level: true },
    });

    const langName = LANG_NAMES[lang] || lang;
    const levelLabel = geo.level === 'country' ? 'Country' : geo.level === 'state' ? 'State' : 'City';

    return (
        <main className="min-h-screen bg-surface-50 text-surface-900 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6">

                {/* Breadcrumbs */}
                <nav className="text-sm text-surface-500 mb-8 flex items-center gap-2 flex-wrap">
                    <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <span className="text-surface-300">/</span>
                    <Link href="/doctors" className="hover:text-primary-600 transition-colors">Doctors</Link>
                    <span className="text-surface-300">/</span>
                    <Link href={`/doctors/${geo.slug}`} className="hover:text-primary-600 transition-colors">{geo.name}</Link>
                    <span className="text-surface-300">/</span>
                    <span className="text-surface-900 font-semibold">{langName}</span>
                </nav>

                {/* Hero */}
                <div className="mb-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-surface-100 text-surface-600 text-xs font-bold uppercase tracking-wider border border-surface-200">
                            {levelLabel}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-100">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                {langName}
                            </div>
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Doctors in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">{geo.name}</span>
                    </h1>
                    <p className="text-lg text-surface-600">
                        {doctors.length} verified specialists in {geo.name}. Viewing in {langName}.
                    </p>
                </div>

                {/* Language switcher */}
                <div className="mb-8">
                    <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Available Languages</p>
                    <div className="flex flex-wrap gap-2">
                        {supportedLangs.map(l => (
                            <Link
                                key={l}
                                href={l === 'en' ? `/doctors/${geo.slug}` : `/doctors/${geo.slug}/${l}`}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${l === lang
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'bg-white border-surface-200 text-surface-600 hover:border-primary-200 hover:text-primary-700'
                                    }`}
                            >
                                {LANG_NAMES[l] || l}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Sub-locations */}
                {subLocations.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-lg font-extrabold text-surface-900 mb-4">
                            {geo.level === 'country' ? 'States' : 'Cities'} in {geo.name}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {subLocations.map(sub => (
                                <Link
                                    key={sub.id}
                                    href={`/doctors/${sub.slug}/${lang}`}
                                    className="px-4 py-2 bg-white rounded-xl border border-surface-200 text-sm font-semibold text-surface-700 hover:text-primary-700 hover:border-primary-200 hover:bg-primary-50 transition-all"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Doctor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {doctors.map((doc) => (
                        <Link
                            key={doc.id}
                            href={`/doctor/${doc.slug}`}
                            className="bg-white rounded-3xl border border-surface-200 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all group flex flex-col"
                        >
                            <div className="h-40 bg-gradient-to-br from-primary-100 via-surface-100 to-accent-50 relative overflow-hidden">
                                {doc.profileImage ? (
                                    <AvatarWithFallback src={doc.profileImage} alt={doc.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold border border-white/30 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        {doc.rating ? Number(doc.rating).toFixed(1) : '5.0'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-base font-extrabold text-surface-900 mb-0.5 group-hover:text-primary-600 transition-colors">{doc.name}</h3>
                                {doc.specialties.length > 0 && (
                                    <p className="text-xs font-bold text-primary-600 mb-3 truncate">{doc.specialties[0].condition?.commonName || 'Specialist'}</p>
                                )}
                                <div className="space-y-1.5 mt-auto">
                                    <div className="flex items-center gap-2 text-xs text-surface-500">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="truncate">{doc.geography?.name || geo.name}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {doctors.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-surface-300">
                        <h3 className="text-2xl font-bold text-surface-900 mb-2">No Specialists Found</h3>
                        <p className="text-surface-500 mb-4">We haven&apos;t onboarded specialists in this area yet.</p>
                        <Link href="/doctors" className="text-primary-600 font-bold hover:underline">← Browse All Locations</Link>
                    </div>
                )}
            </div>
        </main>
    );
}
