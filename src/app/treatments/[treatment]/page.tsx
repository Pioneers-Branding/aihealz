import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { headers, cookies } from 'next/headers';

// ─── Types ───────────────────────────────────────────────────

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
}

interface TreatmentReference {
    title: string;
    url: string;
}

interface TreatmentEntry {
    name: string;
    simpleName?: string;
    type: string;
    specialty: string;
    group?: string;
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    description?: string;
    mechanism?: string;
    indications?: string[];
    sideEffects?: string[];
    references?: TreatmentReference[];
    costs?: {
        usa: TreatmentCost;
        uk: TreatmentCost;
        india: TreatmentCost;
        thailand: TreatmentCost;
        mexico: TreatmentCost;
        turkey: TreatmentCost;
        uae: TreatmentCost;
    };
}

interface TranslatedTreatmentEntry extends TreatmentEntry {
    translatedName?: string;
    typeLabel?: string;
}

type CountryKey = 'usa' | 'uk' | 'india' | 'thailand' | 'mexico' | 'turkey' | 'uae';

const COUNTRIES: { key: CountryKey; label: string; code: string; colors: string[]; currency: string; slug: string }[] = [
    { key: 'usa', label: 'United States', code: 'US', colors: ['#B22234', '#FFFFFF', '#3C3B6E'], currency: 'USD', slug: 'us' },
    { key: 'uk', label: 'United Kingdom', code: 'UK', colors: ['#012169', '#C8102E', '#FFFFFF'], currency: 'GBP', slug: 'uk' },
    { key: 'india', label: 'India', code: 'IN', colors: ['#FF9933', '#FFFFFF', '#138808'], currency: 'INR', slug: 'india' },
    { key: 'thailand', label: 'Thailand', code: 'TH', colors: ['#A51931', '#F4F5F8', '#2D2A4A'], currency: 'THB', slug: 'th' },
    { key: 'mexico', label: 'Mexico', code: 'MX', colors: ['#006847', '#FFFFFF', '#CE1126'], currency: 'MXN', slug: 'mx' },
    { key: 'turkey', label: 'Turkey', code: 'TR', colors: ['#E30A17', '#FFFFFF', '#E30A17'], currency: 'TRY', slug: 'tr' },
    { key: 'uae', label: 'UAE', code: 'AE', colors: ['#00732F', '#FFFFFF', '#000000', '#FF0000'], currency: 'AED', slug: 'ae' },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; iconPath: string }> = {
    medical: { label: 'Medical Management', color: 'text-blue-400', bg: 'bg-blue-500/15', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    surgical: { label: 'Surgical Procedure', color: 'text-rose-400', bg: 'bg-rose-500/15', iconPath: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z' },
    drug: { label: 'Prescription Drug', color: 'text-cyan-400', bg: 'bg-cyan-500/15', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    injection: { label: 'Injectable Treatment', color: 'text-pink-400', bg: 'bg-pink-500/15', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    prescription: { label: 'Prescription Medicine', color: 'text-indigo-400', bg: 'bg-indigo-500/15', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    otc: { label: 'Over-the-Counter', color: 'text-amber-400', bg: 'bg-amber-500/15', iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    home_remedy: { label: 'Home Remedy', color: 'text-emerald-400', bg: 'bg-emerald-500/15', iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    therapy: { label: 'Therapy / Rehabilitation', color: 'text-violet-400', bg: 'bg-violet-500/15', iconPath: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

// ─── Helper to load treatment data ──────────────────────────────

function loadTreatmentData(treatmentSlug: string, lang: string = 'en'): TranslatedTreatmentEntry | undefined {
    try {
        const langFile = path.join(process.cwd(), 'public', 'data', `treatments-${lang}.json`);
        const defaultFile = path.join(process.cwd(), 'public', 'data', 'treatments.json');
        const filePath = fs.existsSync(langFile) ? langFile : defaultFile;
        const treatments: TranslatedTreatmentEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Match by slug (from name or simpleName)
        return treatments.find(t => {
            const nameSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const simpleSlug = t.simpleName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return nameSlug === treatmentSlug.toLowerCase() || simpleSlug === treatmentSlug.toLowerCase();
        });
    } catch {
        return undefined;
    }
}

function loadAllTreatments(lang: string = 'en'): TranslatedTreatmentEntry[] {
    try {
        const langFile = path.join(process.cwd(), 'public', 'data', `treatments-${lang}.json`);
        const defaultFile = path.join(process.cwd(), 'public', 'data', 'treatments.json');
        const filePath = fs.existsSync(langFile) ? langFile : defaultFile;
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return [];
    }
}

// ─── Generate Metadata ───────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ treatment: string }> }): Promise<Metadata> {
    const { treatment } = await params;
    const cookieStore = await cookies();
    const lang = cookieStore.get('aihealz-lang')?.value || 'en';

    const treatmentData = loadTreatmentData(treatment, lang);
    const treatmentName = treatmentData?.translatedName || treatmentData?.simpleName || treatmentData?.name || treatment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const actualDescription = treatmentData?.description && treatmentData.description.length > 50
        ? treatmentData.description
        : null;

    const metaDescription = actualDescription
        ? `${actualDescription.substring(0, 120)}... Compare costs in USA, UK, India, Thailand, Mexico, Turkey & UAE.`
        : `Complete guide to ${treatmentName}: costs across 7 countries, procedure details, recovery timeline, risks, and find qualified specialists near you.`;

    const usaPrice = treatmentData?.costs?.usa;
    const indiaPrice = treatmentData?.costs?.india;
    const priceInfo = usaPrice && indiaPrice
        ? ` Prices from $${indiaPrice.usd} (India) to $${usaPrice.usd} (USA).`
        : '';

    const keywords = [
        treatmentName,
        treatmentData?.simpleName,
        `${treatmentName} cost`,
        `${treatmentName} price`,
        treatmentData?.specialty || '',
        treatmentData?.type || '',
        ...(treatmentData?.indications?.slice(0, 3) || []),
    ].filter(Boolean).join(', ');

    return {
        title: `${treatmentName} - Cost, Procedure & Recovery Guide | AIHealz`,
        description: metaDescription + priceInfo,
        keywords,
        openGraph: {
            title: `${treatmentName} Treatment Guide | AIHealz`,
            description: actualDescription?.substring(0, 200) || `Compare ${treatmentName} costs globally. USA, UK, India, Thailand, Mexico, Turkey & UAE pricing with recovery info.`,
            type: 'article',
            siteName: 'AIHealz',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${treatmentName} - Cost & Procedure Guide`,
            description: metaDescription.substring(0, 200),
        },
        alternates: {
            canonical: `https://aihealz.com/treatments/${treatment}`,
        },
        robots: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
        },
    };
}

// ─── Main Page Component ─────────────────────────────────────

export default async function TreatmentPage({ params }: { params: Promise<{ treatment: string }> }) {
    const { treatment } = await params;
    const hdrs = await headers();
    const cookieStore = await cookies();

    // Get geo context from middleware headers or cookies
    const detectedCountry = hdrs.get('x-aihealz-country') || cookieStore.get('aihealz-geo')?.value?.split(':')[0] || 'india';
    const lang = hdrs.get('x-aihealz-lang') || cookieStore.get('aihealz-lang')?.value || 'en';

    // Load treatments data
    const treatments = loadAllTreatments(lang);
    const treatmentSlug = treatment.toLowerCase();

    // Find the treatment (match by name slug or simpleName slug)
    const treatmentData = treatments.find(t => {
        const nameSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const simpleSlug = t.simpleName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return nameSlug === treatmentSlug || simpleSlug === treatmentSlug;
    });

    // Build display name (show both simple name and medical name if different)
    const medicalName = treatmentData?.translatedName || treatmentData?.name;
    const simpleName = treatmentData?.simpleName;
    const displayName = simpleName && simpleName !== medicalName
        ? simpleName
        : medicalName || treatment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const typeConfig = TYPE_CONFIG[treatmentData?.type || 'medical'] || TYPE_CONFIG.medical;

    // Determine user's country for highlighting
    const userCountryKey: CountryKey = (
        COUNTRIES.find(c => c.slug === detectedCountry)?.key ||
        'usa'
    );

    // Find related treatments in the same specialty
    const relatedTreatments = treatments
        .filter(t => t.specialty === treatmentData?.specialty && t.name !== treatmentData?.name)
        .slice(0, 6);

    // Structured data
    const treatmentSchema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalProcedure',
        name: displayName,
        alternateName: medicalName !== displayName ? medicalName : undefined,
        procedureType: treatmentData?.type || 'medical',
        description: treatmentData?.description || `${displayName} is a ${typeConfig.label.toLowerCase()} used in ${treatmentData?.specialty || 'General'} medicine.`,
        ...(treatmentData?.mechanism && { howPerformed: treatmentData.mechanism }),
        ...(treatmentData?.indications && treatmentData.indications.length > 0 && {
            indication: treatmentData.indications.map(ind => ({
                '@type': 'MedicalIndication',
                name: ind,
            })),
        }),
        ...(treatmentData?.sideEffects && treatmentData.sideEffects.length > 0 && {
            risks: treatmentData.sideEffects.join(', '),
        }),
        ...(treatmentData?.specialty && {
            relevantSpecialty: {
                '@type': 'MedicalSpecialty',
                name: treatmentData.specialty,
            },
        }),
        ...(treatmentData?.costs && {
            offers: COUNTRIES.map(c => ({
                '@type': 'Offer',
                price: treatmentData.costs?.[c.key]?.range?.[0] || 0,
                priceCurrency: treatmentData.costs?.[c.key]?.currency || 'USD',
                priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                eligibleRegion: {
                    '@type': 'Country',
                    name: c.label,
                },
            })),
        }),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Treatments', item: 'https://aihealz.com/treatments' },
            { '@type': 'ListItem', position: 3, name: displayName, item: `https://aihealz.com/treatments/${treatment}` },
        ],
    };

    const faqSchema = (treatmentData?.indications && treatmentData?.sideEffects) ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What is ${displayName} used for?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: treatmentData.indications.join(', '),
                },
            },
            {
                '@type': 'Question',
                name: `What are the side effects of ${displayName}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: treatmentData.sideEffects.join(', '),
                },
            },
            {
                '@type': 'Question',
                name: `How much does ${displayName} cost?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${displayName} costs vary by country: USA $${treatmentData.costs?.usa?.usd || 'N/A'}, UK $${treatmentData.costs?.uk?.usd || 'N/A'}, India $${treatmentData.costs?.india?.usd || 'N/A'}, Thailand $${treatmentData.costs?.thailand?.usd || 'N/A'}.`,
                },
            },
        ],
    } : null;

    return (
        <>
            <Script
                id="treatment-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(treatmentSchema) }}
            />
            <Script
                id="breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {faqSchema && (
                <Script
                    id="faq-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}

            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none" />
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[80px] translate-y-1/2 pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 relative z-10">

                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex items-center gap-2 text-sm text-slate-500">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li aria-hidden="true">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li>
                                <Link href="/treatments" className="hover:text-white transition-colors">Treatments</Link>
                            </li>
                            <li aria-hidden="true">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li>
                                <span className="text-white font-medium">{displayName}</span>
                            </li>
                        </ol>
                    </nav>

                    {/* Hero Section */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${typeConfig.bg} ${typeConfig.color} text-sm font-bold border border-current/20`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeConfig.iconPath} />
                                    </svg>
                                    {typeConfig.label}
                                </span>
                                {treatmentData?.specialty && (
                                    <Link
                                        href={`/conditions?specialty=${encodeURIComponent(treatmentData.specialty)}`}
                                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        {treatmentData.specialty}
                                    </Link>
                                )}
                                {treatmentData?.requiresPrescription && (
                                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold border border-amber-500/20">
                                        Rx Required
                                    </span>
                                )}
                                {treatmentData?.genericAvailable && (
                                    <span className="px-3 py-1.5 bg-teal-500/10 text-teal-400 rounded-lg text-xs font-bold border border-teal-500/20">
                                        Generic Available
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight">
                                {displayName}
                            </h1>

                            {/* Show medical name if different from display name */}
                            {simpleName && medicalName && simpleName !== medicalName && (
                                <p className="text-lg text-slate-400 mb-4">
                                    Medical name: <span className="text-slate-300 font-medium">{medicalName}</span>
                                </p>
                            )}

                            <p className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed mb-8">
                                Comprehensive guide to {displayName.toLowerCase()}, including global cost comparison,
                                procedure details, recovery expectations, and qualified specialists.
                            </p>

                            {/* Brand Names */}
                            {treatmentData?.brandNames && treatmentData.brandNames.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand Names:</span>
                                    {treatmentData.brandNames.map((brand, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-slate-800/50 text-slate-300 rounded-lg text-sm">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cost Comparison Section */}
                    {treatmentData?.costs && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                Cost Comparison by Country
                            </h2>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {COUNTRIES.map((c) => {
                                    const cost = treatmentData.costs?.[c.key];
                                    const isUserCountry = c.key === userCountryKey;

                                    if (!cost?.range) return null;

                                    return (
                                        <div
                                            key={c.key}
                                            className={`relative p-5 rounded-2xl border transition-all ${
                                                isUserCountry
                                                    ? 'bg-gradient-to-br from-teal-500/20 to-blue-500/10 border-teal-500/30 ring-2 ring-teal-500/20'
                                                    : 'bg-slate-900/60 border-white/5 hover:border-white/10'
                                            }`}
                                        >
                                            {isUserCountry && (
                                                <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-teal-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                                    Your Location
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-8 h-6 rounded overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(180deg, ${c.colors[0]} 33%, ${c.colors[1]} 33%, ${c.colors[1]} 66%, ${c.colors[2]} 66%)` }}>
                                                    <span className="sr-only">{c.code}</span>
                                                </span>
                                                <span className="text-sm font-semibold text-white">{c.label}</span>
                                            </div>
                                            <div className="text-2xl font-bold text-white mb-1">
                                                {c.currency} {cost.range[0].toLocaleString()} - {cost.range[1].toLocaleString()}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                ~${cost.usd} USD equivalent
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="mt-4 text-xs text-slate-500 text-center">
                                * Prices are estimates and may vary based on hospital, facility, and individual requirements.
                            </p>
                        </section>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Overview */}
                            <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 md:p-8">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    What is {displayName}?
                                </h2>
                                <div className="prose prose-invert prose-slate max-w-none">
                                    <p className="text-slate-400 leading-relaxed">
                                        {treatmentData?.description || (
                                            `${displayName} is a ${typeConfig.label.toLowerCase()} commonly used in ${treatmentData?.specialty || 'general'} medicine. This treatment approach helps address various health conditions and symptoms, providing patients with effective therapeutic options.`
                                        )}
                                    </p>
                                    {treatmentData?.mechanism && (
                                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                How It Works
                                            </h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">{treatmentData.mechanism}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Indications */}
                            {treatmentData?.indications && treatmentData.indications.length > 0 && (
                                <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 md:p-8">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Common Uses & Indications
                                    </h2>
                                    <ul className="grid sm:grid-cols-2 gap-3">
                                        {treatmentData.indications.map((indication, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                                <span className="text-slate-400">{indication}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Side Effects */}
                            {treatmentData?.sideEffects && treatmentData.sideEffects.length > 0 && (
                                <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 md:p-8">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Possible Side Effects
                                    </h2>
                                    <ul className="space-y-2">
                                        {treatmentData.sideEffects.map((effect, i) => (
                                            <li key={i} className="flex items-start gap-2 text-orange-200/80">
                                                <span className="text-orange-400 mt-1">•</span>
                                                <span>{effect}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-4 text-xs text-orange-300/60">
                                        This is not a complete list. Contact your healthcare provider if you experience any concerning symptoms.
                                    </p>
                                </section>
                            )}

                            {/* What to Expect */}
                            <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 md:p-8">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    What to Expect
                                </h2>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                        <div className="w-10 h-10 mx-auto mb-2 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-semibold text-white mb-1">Duration</div>
                                        <div className="text-xs text-slate-500">
                                            {treatmentData?.type === 'surgical' ? '1-4 hours' :
                                             treatmentData?.type === 'therapy' ? 'Multiple sessions' :
                                             'Varies by condition'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                        <div className="w-10 h-10 mx-auto mb-2 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-semibold text-white mb-1">Setting</div>
                                        <div className="text-xs text-slate-500">
                                            {treatmentData?.type === 'surgical' ? 'Hospital/Clinic' :
                                             treatmentData?.type === 'home_remedy' ? 'Home' :
                                             'Clinic/Outpatient'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                        <div className="w-10 h-10 mx-auto mb-2 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-semibold text-white mb-1">Recovery</div>
                                        <div className="text-xs text-slate-500">
                                            {treatmentData?.type === 'surgical' ? 'Days to weeks' :
                                             treatmentData?.type === 'therapy' ? 'Progressive' :
                                             'Varies'}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Important Considerations */}
                            <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 md:p-8">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Important Considerations
                                </h2>
                                <ul className="space-y-3 text-sm text-amber-200/80">
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span>Always consult with a qualified healthcare provider before starting any treatment</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span>Inform your doctor about all current medications and health conditions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        <span>Individual results may vary based on health status and other factors</span>
                                    </li>
                                    {treatmentData?.requiresPrescription && (
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-400 mt-1">•</span>
                                            <span>This treatment requires a valid prescription from a licensed healthcare provider</span>
                                        </li>
                                    )}
                                </ul>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">

                            {/* Find Specialists CTA */}
                            <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/10 border border-teal-500/30 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-3">Find Specialists</h3>
                                <p className="text-sm text-slate-400 mb-4">
                                    Connect with qualified {treatmentData?.specialty || 'healthcare'} specialists who provide this treatment.
                                </p>
                                <Link
                                    href={`/doctors?specialty=${encodeURIComponent(treatmentData?.specialty || '')}`}
                                    className="block w-full py-3 bg-teal-500 hover:bg-teal-400 text-center text-slate-900 font-bold rounded-xl transition-colors"
                                >
                                    Find Doctors Near You
                                </Link>
                            </div>

                            {/* Medical Travel CTA */}
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold text-white">Medical Travel</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">
                                    Save up to 70% on {displayName} by traveling to India, Thailand, or Turkey.
                                </p>
                                <Link
                                    href="/medical-travel/bot"
                                    className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-center text-white font-semibold rounded-xl border border-white/10 transition-colors"
                                >
                                    Get Free Quote
                                </Link>
                            </div>

                            {/* Related Treatments */}
                            {relatedTreatments.length > 0 && (
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Related Treatments</h3>
                                    <ul className="space-y-2">
                                        {relatedTreatments.map((t, i) => {
                                            const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                            return (
                                                <li key={i}>
                                                    <Link
                                                        href={`/treatments/${slug}`}
                                                        className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors group"
                                                    >
                                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                                            {t.simpleName || t.name}
                                                        </span>
                                                        <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* AI Analysis CTA */}
                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </span>
                                    <h3 className="text-lg font-bold text-white">AI Health Analysis</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">
                                    Upload your medical reports for instant AI-powered insights.
                                </p>
                                <Link
                                    href="/analyze"
                                    className="block w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-center text-purple-300 font-semibold rounded-xl border border-purple-500/30 transition-colors"
                                >
                                    Analyze Your Reports
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
                                <h3 className="font-semibold text-white mb-2">How much does {displayName} cost?</h3>
                                <p className="text-sm text-slate-400">
                                    Costs vary by country. In the USA, expect ${treatmentData?.costs?.usa?.range?.[0] || 'N/A'}-${treatmentData?.costs?.usa?.range?.[1] || 'N/A'} USD.
                                    India offers significant savings at {treatmentData?.costs?.india?.range?.[0] || 'N/A'}-{treatmentData?.costs?.india?.range?.[1] || 'N/A'} INR.
                                </p>
                            </div>
                            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
                                <h3 className="font-semibold text-white mb-2">Is {displayName} covered by insurance?</h3>
                                <p className="text-sm text-slate-400">
                                    Coverage depends on your insurance plan and medical necessity. Check with your provider for specific coverage details.
                                </p>
                            </div>
                            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
                                <h3 className="font-semibold text-white mb-2">What is the recovery time?</h3>
                                <p className="text-sm text-slate-400">
                                    Recovery varies based on individual factors and treatment type. Consult your healthcare provider for personalized estimates.
                                </p>
                            </div>
                            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
                                <h3 className="font-semibold text-white mb-2">Are there alternatives to {displayName}?</h3>
                                <p className="text-sm text-slate-400">
                                    Yes, there may be alternative treatments available. Discuss all options with your doctor to find the best approach for your condition.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Back to Treatments */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/treatments"
                            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Browse All Treatments
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
