import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import TreatmentsExplorer, { type TreatmentType } from '@/components/ui/treatments-explorer';
import { normalizeSpecialty, SPECIALTY_ICON_DATA } from '@/lib/normalize-specialty';
import LanguageSwitcher from '@/components/ui/language-switcher';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { AIDiagnosisCTA, FindDoctorCTA, BookTestCTA } from '@/components/ui/cta-sections';

export const metadata: Metadata = {
    title: 'Medical Treatments, Drugs & Procedures Directory | Compare Costs Globally',
    description: 'Explore 10,000+ medical treatments with cost estimates across USA, UK, India, Thailand, Mexico, Turkey & UAE. Compare prescription drugs, surgical procedures, injections, home remedies, and therapy protocols. Find generic alternatives and save up to 90%.',
    keywords: 'medical treatments, prescription drugs, surgical procedures, treatment costs, home remedies, medical management, drug prices, injection therapy, generic drugs, brand name medications, OTC medications, therapy protocols, medical travel, surgery abroad, treatment comparison',
    openGraph: {
        title: 'Medical Treatments, Drugs & Procedures Directory',
        description: 'Explore 10,000+ medical treatments with cost estimates across 7 countries. Compare drug prices, find generics, and discover affordable treatment options worldwide.',
        url: 'https://aihealz.com/treatments',
        siteName: 'aihealz',
        type: 'website',
        images: [
            {
                url: 'https://aihealz.com/og/treatments-directory.jpg',
                width: 1200,
                height: 630,
                alt: 'aihealz Medical Treatments Directory - Compare costs across 7 countries',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Medical Treatments Directory | Compare Global Costs | aihealz',
        description: 'Browse 10,000+ treatments with cost comparisons across USA, UK, India, Thailand, Mexico, Turkey & UAE.',
        images: ['https://aihealz.com/og/treatments-directory.jpg'],
    },
    alternates: {
        canonical: 'https://aihealz.com/treatments',
        languages: {
            'en': 'https://aihealz.com/treatments',
            'es': 'https://aihealz.com/es/treatments',
            'hi': 'https://aihealz.com/hi/treatments',
            'ar': 'https://aihealz.com/ar/treatments',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
}

interface TreatmentEntry {
    name: string;
    type: string;
    specialty: string;
    group?: string;
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    description?: string;
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

const VALID_TYPES = new Set(['medical', 'surgical', 'otc', 'home_remedy', 'therapy', 'drug', 'injection', 'prescription']);

// Treatment type icons and colors for featured section
const TREATMENT_TYPES = [
    { type: 'prescription', label: 'Prescription Drugs', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'cyan', iconColor: 'text-cyan-400', description: 'FDA-approved medications requiring a prescription' },
    { type: 'injection', label: 'Injectable Therapies', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'pink', iconColor: 'text-pink-400', description: 'Biologics, vaccines, and injectable medications' },
    { type: 'surgical', label: 'Surgical Procedures', iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'rose', iconColor: 'text-rose-400', description: 'Minimally invasive and major surgical operations' },
    { type: 'therapy', label: 'Therapy & Rehabilitation', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'violet', iconColor: 'text-violet-400', description: 'Physical therapy, occupational therapy, and rehabilitation' },
    { type: 'otc', label: 'OTC Medications', iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', color: 'emerald', iconColor: 'text-emerald-400', description: 'Over-the-counter drugs available without prescription' },
    { type: 'home_remedy', label: 'Home Remedies', iconPath: 'M5 13l4 4L19 7', color: 'green', iconColor: 'text-green-400', description: 'Natural and traditional remedies for common ailments' },
];

// FAQs for both schema and visible display
const FAQS = [
    {
        question: 'What types of medical treatments are available?',
        answer: 'AIHealz covers prescription drugs, injectable medications, medical management, surgical procedures, over-the-counter (OTC) medications, home remedies, and therapy protocols including physical therapy and rehabilitation. Each treatment includes detailed information about what to expect, brand names, generic availability, and cost estimates.',
    },
    {
        question: 'How do I find treatment options for my condition?',
        answer: 'Use our search bar or browse by medical specialty. You can filter by treatment type (drugs, surgery, therapy) and compare costs across 7 countries. Each treatment page includes comprehensive information including brand names, generic options, and typical costs.',
    },
    {
        question: 'Can I compare treatment costs across different countries?',
        answer: 'Yes, AIHealz provides transparent cost estimates for treatments across USA, UK, India, Thailand, Mexico, Turkey, and UAE. Many surgical procedures can cost 50-90% less abroad while maintaining high quality standards. Use the country selector to view prices in your preferred currency.',
    },
    {
        question: 'What is the difference between brand name and generic drugs?',
        answer: 'Generic drugs contain the same active ingredients as brand-name medications and work the same way in your body. The main difference is price—generics are typically 80-85% cheaper because manufacturers don\'t have to repeat costly clinical trials. Look for the "Generic Available" badge on treatments to find cost-effective options.',
    },
    {
        question: 'How accurate are the treatment cost estimates?',
        answer: 'Our cost estimates are based on aggregated data from hospitals, pharmacies, and healthcare providers across each country. Prices are updated regularly and show typical ranges. Actual costs may vary based on your specific situation, insurance coverage, and chosen provider. For surgery abroad, our concierge service can provide exact quotes.',
    },
    {
        question: 'Is it safe to get medical treatment abroad?',
        answer: 'Many countries have world-class healthcare facilities with internationally trained doctors. India, Thailand, Turkey, and Mexico are popular medical tourism destinations with JCI-accredited hospitals. Our medical travel concierge helps verify credentials, arrange consultations, and coordinate your entire trip safely.',
    },
];

export default async function TreatmentsDirectory() {
    // Load treatments.json (10,000+ treatments with costs)
    const filePath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    let raw: TreatmentEntry[] = [];
    try {
        raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error('Failed to load treatments.json:', e);
    }

    // Group by specialty, preserving all treatment data
    const specialtyMap: Record<string, Map<string, TreatmentEntry>> = {};

    raw.forEach(t => {
        const specialty = normalizeSpecialty(t.specialty);
        if (!specialtyMap[specialty]) specialtyMap[specialty] = new Map();
        const type = VALID_TYPES.has(t.type) ? t.type as TreatmentType : 'medical';
        const key = `${t.name.trim()}-${type}`;

        // Keep first occurrence with full data
        if (!specialtyMap[specialty].has(key)) {
            specialtyMap[specialty].set(key, {
                ...t,
                type,
                specialty,
            });
        }
    });

    const categories = Object.keys(specialtyMap)
        .sort()
        .map(specialty => ({
            specialty,
            treatments: Array.from(specialtyMap[specialty].values())
                .map(t => ({
                    name: t.name,
                    type: t.type as TreatmentType,
                    brandNames: t.brandNames,
                    genericAvailable: t.genericAvailable,
                    requiresPrescription: t.requiresPrescription,
                    description: t.description,
                    costs: t.costs,
                }))
                .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter(c => c.treatments.length > 0);

    const totalTreatments = categories.reduce((sum, c) => sum + c.treatments.length, 0);

    // Count by type
    const typeCounts = raw.reduce((acc, t) => {
        const type = VALID_TYPES.has(t.type) ? t.type : 'medical';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Read geo context from middleware headers
    const hdrs = await headers();
    const country = hdrs.get('x-aihealz-country');
    const city = hdrs.get('x-aihealz-city');
    const lang = hdrs.get('x-aihealz-lang') || 'en';
    const regionalLang = hdrs.get('x-aihealz-regional-lang');
    const regionalDisplay = hdrs.get('x-aihealz-regional-display');

    // ─── STRUCTURED DATA SCHEMAS ────────────────────────────────

    // 1. Breadcrumb Schema
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://aihealz.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Medical Treatments Directory',
                item: 'https://aihealz.com/treatments',
            },
        ],
    };

    // 2. Medical Web Page Schema with Speakable
    const treatmentsSchema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: 'Medical Treatments, Drugs & Procedures Directory',
        headline: 'Compare Medical Treatment Costs Across 7 Countries',
        description: `Explore ${totalTreatments.toLocaleString()}+ medical treatments with cost estimates across USA, UK, India, Thailand, Mexico, Turkey & UAE. Compare prescription drugs, surgical procedures, and find generic alternatives.`,
        url: 'https://aihealz.com/treatments',
        datePublished: '2024-01-01T00:00:00Z',
        dateModified: new Date().toISOString(),
        inLanguage: 'en',
        isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://aihealz.com/#website',
            name: 'aihealz',
            url: 'https://aihealz.com',
        },
        about: {
            '@type': 'MedicalEntity',
            name: 'Medical Treatments',
            description: 'Comprehensive directory of medical treatments including drugs, surgeries, therapies, and home remedies',
        },
        audience: {
            '@type': 'MedicalAudience',
            audienceType: 'Patient',
            healthCondition: {
                '@type': 'MedicalCondition',
                name: 'Various medical conditions',
            },
        },
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', 'article p', '.treatment-description', '.faq-answer'],
        },
        mainEntity: {
            '@type': 'ItemList',
            name: 'Medical Treatment Categories by Specialty',
            numberOfItems: categories.length,
            itemListElement: categories.slice(0, 20).map((cat, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'MedicalSpecialty',
                    name: cat.specialty,
                    description: `${cat.treatments.length} treatments in ${cat.specialty}`,
                    url: `https://aihealz.com/treatments?specialty=${encodeURIComponent(cat.specialty)}`,
                },
            })),
        },
    };

    // 3. FAQ Schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    // 4. Organization Schema
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://aihealz.com/#organization',
        name: 'aihealz',
        url: 'https://aihealz.com',
        logo: 'https://aihealz.com/logo.png',
        description: 'World\'s first and biggest multilingual healthcare content platform with 70,000+ conditions and treatments across 18+ countries.',
        sameAs: [
            'https://twitter.com/aihealz',
            'https://linkedin.com/company/aihealz',
            'https://facebook.com/aihealz',
        ],
    };

    // 5. Treatment Types as ItemList
    const treatmentTypesSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Types of Medical Treatments',
        description: 'Categories of medical treatments available on aihealz',
        numberOfItems: TREATMENT_TYPES.length,
        itemListElement: TREATMENT_TYPES.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'MedicalTherapy',
                name: t.label,
                description: t.description,
                url: `https://aihealz.com/treatments?type=${t.type}`,
            },
        })),
    };

    return (
        <>
            <Script
                id="breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <Script
                id="treatments-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(treatmentsSchema) }}
            />
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <Script
                id="treatment-types-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(treatmentTypesSchema) }}
            />

            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
                {/* Language Switcher Banner */}
                <LanguageSwitcher
                    country={country}
                    city={city}
                    lang={lang}
                    regionalLang={regionalLang}
                    regionalDisplay={regionalDisplay}
                />

                {/* Background Effects */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 mt-8">

                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-6">
                        <ol className="flex items-center gap-2 text-sm text-slate-400">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li aria-hidden="true">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li>
                                <span className="text-white font-medium">Treatments Directory</span>
                            </li>
                        </ol>
                    </nav>

                    {/* Hero Header */}
                    <header className="mb-10 text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                            Medical Treatments, Drugs & <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">Procedures Directory</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-6 treatment-description">
                            Browse {totalTreatments.toLocaleString()}+ treatments with cost estimates across 7 countries.
                            Compare drug prices, find generic alternatives, and discover treatment options for your health needs.
                        </p>

                        {/* Search Bar - filtered to treatments only */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <SearchAutocomplete
                                placeholder="Search treatments, drugs, procedures..."
                                className="w-full"
                                typeFilter="treatment"
                            />
                        </div>
                    </header>

                    {/* Stats Bar */}
                    <section aria-label="Treatment Statistics" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-white mb-1">{totalTreatments.toLocaleString()}+</div>
                            <div className="text-sm text-slate-400">Total Treatments</div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-cyan-400 mb-1">{categories.length}</div>
                            <div className="text-sm text-slate-400">Specialties</div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-emerald-400 mb-1">7</div>
                            <div className="text-sm text-slate-400">Countries</div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-amber-400 mb-1">90%</div>
                            <div className="text-sm text-slate-400">Potential Savings</div>
                        </div>
                    </section>

                    {/* AI Diagnosis Inline CTA */}
                    <section className="mb-12">
                        <AIDiagnosisCTA
                            variant="inline"
                            title="Not sure which treatment you need?"
                            subtitle="Our AI can help identify the right treatment based on your symptoms"
                        />
                    </section>

                    {/* Featured Treatment Types */}
                    <section aria-labelledby="treatment-types-heading" className="mb-12">
                        <h2 id="treatment-types-heading" className="text-2xl font-bold text-white mb-6 text-center">
                            Browse by Treatment Type
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {TREATMENT_TYPES.map(t => (
                                <Link
                                    key={t.type}
                                    href={`/treatments?type=${t.type}`}
                                    className={`group bg-slate-900/60 border border-white/5 hover:border-${t.color}-500/30 rounded-xl p-4 text-center transition-all hover:bg-slate-800/60`}
                                >
                                    <div className={`w-10 h-10 mx-auto rounded-xl bg-slate-800/80 flex items-center justify-center mb-2 ${t.iconColor}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.iconPath} />
                                        </svg>
                                    </div>
                                    <div className="text-sm font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                        {t.label}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {typeCounts[t.type] || 0}+ options
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Featured Specialties */}
                    <section aria-labelledby="specialties-heading" className="mb-12">
                        <h2 id="specialties-heading" className="text-2xl font-bold text-white mb-6 text-center">
                            Browse by Medical Specialty
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.slice(0, 16).map(cat => {
                                const iconData = SPECIALTY_ICON_DATA[cat.specialty];
                                return (
                                    <Link
                                        key={cat.specialty}
                                        href={`/treatments?specialty=${encodeURIComponent(cat.specialty)}`}
                                        className="px-4 py-2 bg-slate-800/60 border border-white/5 hover:border-cyan-500/30 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <span className={`w-4 h-4 ${iconData?.color || 'text-teal-400'}`}>
                                            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconData?.path || 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z'} />
                                            </svg>
                                        </span>
                                        <span>{cat.specialty}</span>
                                        <span className="text-xs text-slate-500">({cat.treatments.length})</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Interactive Explorer */}
                    <article aria-labelledby="explorer-heading">
                        <h2 id="explorer-heading" className="sr-only">Browse All Treatments</h2>
                        <TreatmentsExplorer categories={categories} defaultCountry={country} />
                    </article>

                    {/* Mid-Page CTA - Medical Travel */}
                    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-900/40 via-teal-900/20 to-slate-900 border border-blue-500/20 p-8 md:p-12 shadow-2xl shadow-blue-900/20 my-16 group" aria-labelledby="medical-travel-heading">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-1000 -translate-y-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-xl">
                                <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                                    Concierge Medical Travel
                                </span>
                                <h3 id="medical-travel-heading" className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                    Traveling for Surgery? Let us handle it all.
                                </h3>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    Save 50-90% on surgeries abroad. Our end-to-end concierge matches you with JCI-accredited hospitals, negotiates exact costs, and handles your entire travel itinerary seamlessly.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/medical-travel/bot" className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1 flex items-center gap-2">
                                        Build Your Estimate
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </Link>
                                    <Link href="/medical-travel" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all">
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cost Comparison Info Cards */}
                    <section aria-labelledby="features-heading" className="grid md:grid-cols-3 gap-6 mb-16">
                        <h2 id="features-heading" className="sr-only">Treatment Directory Features</h2>
                        <article className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Compare Costs Globally</h3>
                            <p className="text-sm text-slate-400">
                                View treatment costs across USA, UK, India, Thailand, Mexico, Turkey, and UAE. Find savings of up to 90% on procedures abroad with transparent pricing.
                            </p>
                        </article>
                        <article className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Generic Alternatives</h3>
                            <p className="text-sm text-slate-400">
                                Find FDA-approved generic drugs that cost 80-85% less than brand names. Look for the &ldquo;Generic Available&rdquo; badge on medications.
                            </p>
                        </article>
                        <article className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Verified Information</h3>
                            <p className="text-sm text-slate-400">
                                All drug information includes brand names, prescription requirements, and is regularly updated from trusted medical databases and sources.
                            </p>
                        </article>
                    </section>

                    {/* FAQ Section (Visible for users AND LLMs) */}
                    <section aria-labelledby="faq-heading" className="mb-16">
                        <div className="max-w-4xl mx-auto">
                            <h2 id="faq-heading" className="text-3xl font-bold text-white mb-8 text-center">
                                Frequently Asked Questions About Medical Treatments
                            </h2>
                            <div className="space-y-4">
                                {FAQS.map((faq, i) => (
                                    <article key={i} className="bg-slate-900/60 border border-white/5 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-3 flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                                                Q
                                            </span>
                                            {faq.question}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed pl-9 faq-answer">
                                            {faq.answer}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Find Doctor CTA */}
                    <section className="mb-16">
                        <FindDoctorCTA variant="banner" />
                    </section>

                    {/* Book Test CTA */}
                    <section className="mb-16">
                        <BookTestCTA variant="card" />
                    </section>

                    {/* Related Pages - Internal Linking */}
                    <section aria-labelledby="related-heading" className="mb-12">
                        <h2 id="related-heading" className="text-2xl font-bold text-white mb-6 text-center">
                            Explore More Health Resources
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link
                                href="/conditions"
                                className="bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-xl p-5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                                    Medical Conditions
                                </h3>
                                <p className="text-xs text-slate-500">70,000+ conditions A-Z</p>
                            </Link>
                            <Link
                                href="/symptoms"
                                className="bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-xl p-5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                                    AI Symptom Checker
                                </h3>
                                <p className="text-xs text-slate-500">Get AI-powered insights</p>
                            </Link>
                            <Link
                                href="/reference/drugs"
                                className="bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-xl p-5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                                    Drug Reference
                                </h3>
                                <p className="text-xs text-slate-500">Dosages & interactions</p>
                            </Link>
                            <Link
                                href="/doctors"
                                className="bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-xl p-5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                                    Find Doctors
                                </h3>
                                <p className="text-xs text-slate-500">Search specialists near you</p>
                            </Link>
                        </div>
                    </section>

                    {/* Bottom SEO Text Block */}
                    <article className="max-w-4xl mx-auto text-center mb-8">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            The aihealz Medical Treatments Directory is the world&apos;s most comprehensive resource for comparing healthcare costs globally.
                            Whether you&apos;re looking for prescription medications, surgical procedures, injectable therapies, or natural home remedies,
                            our database covers {totalTreatments.toLocaleString()}+ treatment options across {categories.length} medical specialties.
                            Compare costs across USA, UK, India, Thailand, Mexico, Turkey, and UAE to make informed healthcare decisions.
                            All information is regularly updated and verified from trusted medical sources.
                        </p>
                    </article>
                </div>
            </main>
        </>
    );
}
