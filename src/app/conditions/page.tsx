import prisma from '@/lib/db';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ConditionsExplorer, { type SeverityLevel, type SpecialtyGroup } from '@/components/ui/conditions-explorer';
import { normalizeSpecialty, SPECIALTY_ICON_MAP } from '@/lib/normalize-specialty';
import LanguageSwitcher from '@/components/ui/language-switcher';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import {
    isNonCondition,
    cleanConditionName,
    getSeverityOverride,
    isPoorlyFormatted
} from '@/lib/condition-cleaner';
import { QuickActionsBar, FindDoctorCTA, BookTestCTA, MedicalTravelCTA } from '@/components/ui/cta-sections';

// Helper to format count with K suffix
function formatConditionCount(count: number): string {
    if (count >= 1000) {
        const rounded = Math.floor(count / 1000);
        return `${rounded},000+`;
    }
    return `${count}+`;
}

// Generate dynamic metadata based on actual database count
export async function generateMetadata(): Promise<Metadata> {
    const count = await prisma.medicalCondition.count({ where: { isActive: true } });
    const displayCount = formatConditionCount(count);

    return {
        title: `Medical Conditions A-Z: ${displayCount} Diseases & Health Conditions`,
        description: `Complete A-Z directory of ${displayCount} medical conditions. Search by symptoms, browse by specialty (Cardiology, Neurology, Oncology & more). Get treatment info, find specialists, compare costs globally.`,
        keywords: 'medical conditions list, diseases directory, health conditions A-Z, symptom checker, disease symptoms, find condition, medical specialty, cardiology conditions, neurology diseases, orthopedic conditions, dermatology, gastroenterology, oncology, aihealz',
        openGraph: {
            title: `Medical Conditions A-Z Directory | ${displayCount} Conditions`,
            description: 'Comprehensive database of medical conditions organized by 25+ specialties. Find symptoms, treatments, costs, and specialists.',
            url: 'https://aihealz.com/conditions',
            siteName: 'aihealz',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Medical Conditions Directory | aihealz',
            description: `Browse ${displayCount} medical conditions. Find symptoms, treatments & specialists.`,
        },
        alternates: {
            canonical: 'https://aihealz.com/conditions',
        },
    };
}

// Top specialties for featured section - icons rendered as inline SVGs
const FEATURED_SPECIALTIES = [
    { name: 'Cardiology', iconClass: 'text-rose-500', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', description: 'Heart & cardiovascular conditions' },
    { name: 'Neurology', iconClass: 'text-purple-500', iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', description: 'Brain & nervous system disorders' },
    { name: 'Orthopedics', iconClass: 'text-amber-500', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Bone, joint & muscle conditions' },
    { name: 'Dermatology', iconClass: 'text-pink-500', iconPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', description: 'Skin, hair & nail conditions' },
    { name: 'Gastroenterology', iconClass: 'text-orange-500', iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', description: 'Digestive system disorders' },
    { name: 'Oncology', iconClass: 'text-indigo-500', iconPath: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7', description: 'Cancer & tumor conditions' },
    { name: 'Pulmonology', iconClass: 'text-cyan-500', iconPath: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2', description: 'Lung & respiratory conditions' },
    { name: 'Endocrinology', iconClass: 'text-emerald-500', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', description: 'Hormone & metabolic disorders' },
];

/**
 * Normalize severity level with override support
 */
const normalizeSeverity = (sev: string | null, conditionName: string): SeverityLevel => {
    const override = getSeverityOverride(conditionName);
    if (override) return override;

    const s = sev?.toLowerCase()?.trim() || 'moderate';
    if (s === 'mild' || s === 'low') return 'mild';
    if (s === 'moderate' || s === 'medium') return 'moderate';
    if (s === 'severe' || s === 'high') return 'severe';
    if (s === 'critical' || s === 'life_threatening' || s === 'life-threatening') return 'critical';
    return 'variable';
};

/**
 * Strip laterality, encounter type, and ICD-10 suffixes for deduplication
 */
function getBaseConditionName(name: string): string {
    let s = name.toLowerCase().trim();
    s = s.replace(/,?\s*(initial encounter|subsequent encounter|sequela)$/i, '');
    s = s.replace(/\b(left|right|bilateral|unspecified|other specified|unsp)\b/gi, '');
    s = s.replace(/\bdue to\b.*$/i, '');
    s = s.replace(/[,\-]+\s*$/, '').replace(/\s{2,}/g, ' ').trim();
    s = s.replace(/of\s+of/g, 'of').replace(/\s{2,}/g, ' ').trim();
    return s;
}

export default async function ConditionsDirectory() {
    const rawConditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: {
            slug: true,
            commonName: true,
            specialistType: true,
            severityLevel: true,
            bodySystem: true,
        },
        orderBy: { commonName: 'asc' },
    });

    const conditions = rawConditions.filter(c => !isNonCondition(c.commonName));
    const totalCount = conditions.length;

    // Group by specialty with deduplication
    const specialtyMap: Record<string, Map<string, { slug: string; name: string; severity: SeverityLevel; bodySystem: string | null; isClean: boolean }>> = {};

    conditions.forEach(c => {
        const specialty = normalizeSpecialty(c.specialistType);
        if (!specialtyMap[specialty]) specialtyMap[specialty] = new Map();

        const baseName = getBaseConditionName(c.commonName);
        const isClean = !isPoorlyFormatted(c.commonName);
        const cleanedName = cleanConditionName(c.commonName);

        if (!specialtyMap[specialty].has(baseName)) {
            specialtyMap[specialty].set(baseName, {
                slug: c.slug,
                name: cleanedName,
                severity: normalizeSeverity(c.severityLevel, c.commonName),
                bodySystem: c.bodySystem,
                isClean,
            });
        } else {
            const existing = specialtyMap[specialty].get(baseName)!;
            if (!existing.isClean && isClean) {
                specialtyMap[specialty].set(baseName, {
                    slug: c.slug,
                    name: cleanedName,
                    severity: normalizeSeverity(c.severityLevel, c.commonName),
                    bodySystem: c.bodySystem,
                    isClean,
                });
            }
        }
    });

    const categories: SpecialtyGroup[] = Object.keys(specialtyMap)
        .sort()
        .map(specialty => ({
            specialty,
            conditions: Array.from(specialtyMap[specialty].values())
                .sort((a, b) => {
                    if (a.isClean && !b.isClean) return -1;
                    if (!a.isClean && b.isClean) return 1;
                    return a.name.localeCompare(b.name);
                })
                .map(({ slug, name, severity, bodySystem }) => ({ slug, name, severity, bodySystem })),
        }))
        .filter(c => c.conditions.length > 0);

    const specialtyCount = categories.length;

    // Read geo context
    const hdrs = await headers();
    const country = hdrs.get('x-aihealz-country');
    const city = hdrs.get('x-aihealz-city');
    const lang = hdrs.get('x-aihealz-lang') || 'en';
    const regionalLang = hdrs.get('x-aihealz-regional-lang');
    const regionalDisplay = hdrs.get('x-aihealz-regional-display');

    // ─── Structured Data for SEO & LLMs ───────────────────────────────────

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Medical Conditions', item: 'https://aihealz.com/conditions' },
        ],
    };

    const conditionsSchema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: 'Medical Conditions A-Z Directory',
        headline: `Complete Medical Conditions Database - ${totalCount.toLocaleString()}+ Diseases & Health Conditions`,
        description: `Comprehensive directory of ${totalCount.toLocaleString()}+ medical conditions organized by ${specialtyCount} medical specialties. Each condition includes symptoms, causes, treatments, specialist recommendations, and global cost comparisons.`,
        url: 'https://aihealz.com/conditions',
        datePublished: '2024-01-01',
        dateModified: new Date().toISOString().split('T')[0],
        inLanguage: 'en-US',
        isPartOf: { '@id': 'https://aihealz.com/#website' },
        about: {
            '@type': 'MedicalCondition',
            name: 'Medical Conditions Database',
        },
        mainEntity: {
            '@type': 'ItemList',
            name: 'Medical Specialties',
            numberOfItems: categories.length,
            itemListElement: categories.slice(0, 20).map((cat, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'MedicalSpecialty',
                    name: cat.specialty,
                    url: `https://aihealz.com/conditions/${cat.specialty.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                    description: `${cat.conditions.length} medical conditions in ${cat.specialty}`,
                },
            })),
        },
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', 'article p', '.condition-description'],
        },
        audience: {
            '@type': 'MedicalAudience',
            audienceType: 'Patient',
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'How many medical conditions are listed on AIHealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `AIHealz has a comprehensive database of over ${totalCount.toLocaleString()} medical conditions covering ${specialtyCount} major medical specialties including Cardiology, Neurology, Oncology, Orthopedics, Dermatology, Gastroenterology, Pulmonology, and Endocrinology.`,
                },
            },
            {
                '@type': 'Question',
                name: 'How do I find information about a specific medical condition?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Use the search bar at the top of the page to find conditions by name, symptoms, or related keywords. You can also browse by medical specialty or filter by severity level. Each condition page includes detailed information about symptoms, causes, diagnosis, treatment options, and cost estimates across 7 countries.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I find doctors for my condition on AIHealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, each condition page displays verified specialists in your area who treat that condition. You can view their qualifications, patient reviews, hospital affiliations, and book appointments directly through our platform.',
                },
            },
            {
                '@type': 'Question',
                name: 'What medical specialties are covered on AIHealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `AIHealz covers ${specialtyCount} medical specialties including: Cardiology (heart conditions), Neurology (brain and nervous system), Orthopedics (bones and joints), Dermatology (skin conditions), Gastroenterology (digestive system), Oncology (cancer), Pulmonology (lungs), Endocrinology (hormones), Rheumatology, Nephrology, Urology, Ophthalmology, ENT, Psychiatry, and many more.`,
                },
            },
            {
                '@type': 'Question',
                name: 'How accurate is the medical information on AIHealz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AIHealz medical content is reviewed by healthcare professionals and based on peer-reviewed medical literature. Our condition information includes ICD-10 classifications, evidence-based treatment protocols, and is regularly updated. However, this information is for educational purposes only and should not replace professional medical advice.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I compare treatment costs for my condition across countries?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, AIHealz provides treatment cost comparisons across 7 countries: USA, UK, India, Thailand, Mexico, Turkey, and UAE. Each condition page shows estimated costs in local currencies, helping you understand your options for medical travel if needed.',
                },
            },
        ],
    };

    // Organization schema for brand recognition
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://aihealz.com/#organization',
        name: 'AIHealz',
        url: 'https://aihealz.com',
        logo: 'https://aihealz.com/logo.png',
        description: 'AI-powered global healthcare platform providing medical condition information, treatment costs, and doctor discovery.',
        sameAs: [
            'https://twitter.com/aihealz',
            'https://linkedin.com/company/aihealz',
            'https://facebook.com/aihealz',
        ],
    };

    return (
        <>
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <Script id="conditions-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(conditionsSchema) }} />
            <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Script id="org-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
                <LanguageSwitcher country={country} city={city} lang={lang} regionalLang={regionalLang} regionalDisplay={regionalDisplay} />

                {/* Background Effects */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 mt-8">

                    {/* Hero Section with H1 */}
                    <header className="mb-12 text-center max-w-4xl mx-auto">
                        <nav className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-white font-medium">Medical Conditions</span>
                        </nav>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                            Medical Conditions <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">A-Z Directory</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-8 conditions-description">
                            Browse our comprehensive database of <strong className="text-white">{totalCount.toLocaleString()}+</strong> medical conditions
                            across <strong className="text-white">{specialtyCount}</strong> specialties. Find detailed information about symptoms,
                            causes, treatments, and connect with specialists worldwide.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <SearchAutocomplete
                                variant="dark"
                                placeholder="Search conditions, symptoms, treatments..."
                                className="w-full"
                            />
                        </div>
                    </header>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">{totalCount.toLocaleString()}+</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Conditions</div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">{specialtyCount}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Specialties</div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">7</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Countries</div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">15+</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Languages</div>
                        </div>
                    </div>

                    {/* Quick Actions Bar */}
                    <div className="mb-12">
                        <QuickActionsBar actions={['diagnosis', 'doctors', 'tests', 'travel']} />
                    </div>

                    {/* Featured Specialties */}
                    <section className="mb-12" aria-labelledby="specialties-heading">
                        <h2 id="specialties-heading" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </span>
                            Browse by Medical Specialty
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {FEATURED_SPECIALTIES.map((spec) => {
                                const cat = categories.find(c => c.specialty === spec.name);
                                const count = cat?.conditions.length || 0;
                                return (
                                    <Link
                                        key={spec.name}
                                        href={`/conditions/${spec.name.toLowerCase()}`}
                                        className="group bg-slate-900/60 border border-white/5 hover:border-teal-500/30 rounded-2xl p-5 transition-all hover:bg-slate-900/80"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mb-3 ${spec.iconClass}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={spec.iconPath} />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">{spec.name}</h3>
                                        <p className="text-xs text-slate-500 mb-2">{spec.description}</p>
                                        <span className="text-xs text-teal-400 font-semibold">{count.toLocaleString()} conditions →</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Interactive Explorer */}
                    <section aria-labelledby="all-conditions-heading">
                        <h2 id="all-conditions-heading" className="sr-only">All Medical Conditions</h2>
                        <ConditionsExplorer categories={categories} totalCount={totalCount} country={country} lang={lang} />
                    </section>

                    {/* Find Doctor CTA Banner */}
                    <section className="my-12">
                        <FindDoctorCTA variant="banner" location={city || undefined} />
                    </section>

                    {/* Book Tests CTA */}
                    <section className="mb-12">
                        <BookTestCTA variant="card" />
                    </section>

                    {/* FAQ Section for SEO */}
                    <section className="mt-16 mb-12" aria-labelledby="faq-heading">
                        <h2 id="faq-heading" className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            <article className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="font-semibold text-white mb-3">How do I find a medical condition?</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Use the search bar to type symptoms or condition names. You can also browse by medical specialty
                                    (like Cardiology or Neurology) or filter by severity level. Each condition has detailed information
                                    about symptoms, causes, and treatments.
                                </p>
                            </article>
                            <article className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="font-semibold text-white mb-3">What information is available for each condition?</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Every condition page includes: overview and description, common symptoms, causes and risk factors,
                                    diagnosis methods, treatment options with costs across 7 countries, home remedies when applicable,
                                    and links to verified specialists.
                                </p>
                            </article>
                            <article className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="font-semibold text-white mb-3">Are the treatment costs accurate?</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Treatment costs are estimates based on aggregated data from hospitals and clinics in USA, UK, India,
                                    Thailand, Mexico, Turkey, and UAE. Actual costs may vary based on facility, doctor, and individual case complexity.
                                </p>
                            </article>
                            <article className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="font-semibold text-white mb-3">Can I book a doctor appointment through AIHealz?</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Yes, you can connect with verified specialists directly through our platform. Each condition page
                                    shows relevant doctors in your area with their qualifications, reviews, and appointment availability.
                                </p>
                            </article>
                        </div>
                    </section>

                    {/* AI CTA */}
                    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900/40 via-blue-900/20 to-slate-900 border border-teal-500/20 p-8 md:p-12 shadow-2xl shadow-teal-900/20 group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[80px] group-hover:bg-teal-500/20 transition-colors duration-1000 -translate-y-1/2 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-xl">
                                <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                                    Not sure what you&apos;re looking for?
                                </span>
                                <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                    Let our AI Care Bot guide you.
                                </h3>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    Describe your symptoms and our clinical-grade AI will suggest likely conditions,
                                    over-the-counter remedies, and guide you to the right specialist instantly.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/symptoms" className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:-translate-y-1 flex items-center gap-2">
                                        Consult AI Free
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </Link>
                                    <Link href="/analyze" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-white/10 transition-all hover:-translate-y-1">
                                        Upload Medical Report
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Related Pages for Internal Linking */}
                    <section className="mt-12 grid md:grid-cols-3 gap-6">
                        <Link href="/treatments" className="bg-slate-900/60 border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Treatments Directory</h3>
                            <p className="text-sm text-slate-500">Browse 10,000+ treatments with global cost comparisons</p>
                        </Link>
                        <Link href="/doctors" className="bg-slate-900/60 border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Find Doctors</h3>
                            <p className="text-sm text-slate-500">Connect with verified specialists worldwide</p>
                        </Link>
                        <Link href="/medical-travel" className="bg-slate-900/60 border border-white/5 hover:border-amber-500/30 rounded-2xl p-6 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Medical Travel</h3>
                            <p className="text-sm text-slate-500">Save up to 70% on treatments abroad</p>
                        </Link>
                    </section>
                </div>
            </main>
        </>
    );
}
