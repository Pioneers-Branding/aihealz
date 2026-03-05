import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stitchPageData, PageData } from '@/lib/content-engine';
import { getConditionPageTranslations } from '@/lib/i18n-db';
import { generateHreflangTags } from '@/lib/hreflang';
import { generatePageSchemas, generateBreadcrumbSchema } from '@/lib/schema-markup';
import { buildCacheKey } from '@/lib/redis';
import { SmartShimmer, ScannerLine, AnalyzingPulse, ThemeScript } from '@/components/ui/LoadingEffects';
import Link from 'next/link';
import { AvatarWithFallback } from '@/components/ui/image-with-fallback';

/**
 * Convert specialty name to plural specialist title
 * e.g., "Endocrinology" → "Endocrinologists", "Cardiologist" → "Cardiologists"
 */
function pluralizeSpecialist(specialistType: string | null | undefined): string {
    if (!specialistType) return 'Specialists';

    const type = specialistType.trim();

    // If it ends in "-ology", convert to "-ologists"
    // "ology" is 5 chars, so slice off 5 and add "ologists"
    if (type.toLowerCase().endsWith('ology')) {
        return type.slice(0, -5) + 'ologists';
    }

    // If it ends in "-ist", just add "s"
    if (type.toLowerCase().endsWith('ist')) {
        return type + 's';
    }

    // If it ends in "-ian" (like Physician), just add "s"
    if (type.toLowerCase().endsWith('ian')) {
        return type + 's';
    }

    // Default: add "s"
    return type + 's';
}

/**
 * Get the correct article ("a" or "an") for a word based on its first letter sound.
 * Uses "an" before vowel sounds (a, e, i, o, u) and some special cases.
 */
function getArticle(word: string | null | undefined): string {
    if (!word) return 'a';
    const firstChar = word.trim().toLowerCase().charAt(0);
    // Use "an" before vowels
    if (['a', 'e', 'i', 'o', 'u'].includes(firstChar)) {
        return 'an';
    }
    // Special case: "hour" starts with silent H
    if (word.toLowerCase().startsWith('hour')) {
        return 'an';
    }
    return 'a';
}

/**
 * Expand common ICD abbreviations to user-friendly text.
 * Handles abbreviations like "w" -> "with", "w/o" -> "without", etc.
 */
function expandIcdAbbreviations(text: string | null | undefined): string {
    if (!text) return '';

    return text
        // Common ICD abbreviations
        .replace(/\bw\b/gi, 'with')
        .replace(/\bw\/o\b/gi, 'without')
        .replace(/\bw\/\b/gi, 'with')
        .replace(/\bhyprosm\b/gi, 'hyperosmolarity')
        .replace(/\bhypergl\b/gi, 'hyperglycemia')
        .replace(/\bhypogl\b/gi, 'hypoglycemia')
        .replace(/\bketoacid\b/gi, 'ketoacidosis')
        .replace(/\bunsp\b/gi, 'unspecified')
        .replace(/\bNEC\b/g, '')  // "Not elsewhere classified" - remove
        .replace(/\bNOS\b/g, '')  // "Not otherwise specified" - remove
        .replace(/\bOTH\b/gi, 'other')
        .replace(/\bspec\b/gi, 'specific')
        .replace(/\bdz\b/gi, 'disease')
        .replace(/\bcond\b/gi, 'condition')
        .replace(/\bmanif\b/gi, 'manifestation')
        .replace(/\bcomp\b/gi, 'complication')
        .replace(/\bprim\b/gi, 'primary')
        .replace(/\bsec\b/gi, 'secondary')
        .replace(/\bmult\b/gi, 'multiple')
        .replace(/\bperiphrl\b/gi, 'peripheral')
        .replace(/\bneuro\b/gi, 'neurological')
        .replace(/\bophthal\b/gi, 'ophthalmic')
        // Clean up multiple spaces
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * Filter treatments that are clearly mismatched for a condition.
 * Checks both condition name and specialty to catch data contamination issues.
 */
function filterMismatchedTreatments(
    treatments: string[],
    specialistType: string | null,
    conditionName?: string | null
): string[] {
    if (!treatments || treatments.length === 0) return [];

    const specialtyLower = (specialistType || '').toLowerCase();
    const conditionLower = (conditionName || '').toLowerCase();

    // Thyroid-related treatments - should only appear for thyroid conditions
    const thyroidTreatments = [
        'thyroidectomy', 'parathyroidectomy', 'thyroid hormone', 'levothyroxine',
        'methimazole', 'antithyroid', 'radioactive iodine', 'propylthiouracil'
    ];

    // Check if this is a thyroid condition
    const isThyroidCondition =
        conditionLower.includes('thyroid') ||
        conditionLower.includes('goiter') ||
        conditionLower.includes('graves') ||
        conditionLower.includes('hashimoto');

    // Check if this is a diabetes condition (NOT thyroid-related)
    const isDiabetesCondition =
        conditionLower.includes('diabetes') ||
        conditionLower.includes('diabetic') ||
        conditionLower.includes('hyperglycemia') ||
        conditionLower.includes('insulin');

    // Build exclusion list based on condition type
    let exclusionList: string[] = [];

    // For diabetes: exclude thyroid treatments (they should NOT appear)
    if (isDiabetesCondition && !isThyroidCondition) {
        exclusionList = [...exclusionList, ...thyroidTreatments];
    }

    // For non-endocrine specialties, exclude thyroid treatments
    if (!specialtyLower.includes('endocrin') && !isThyroidCondition) {
        exclusionList = [...exclusionList, ...thyroidTreatments];
    }

    // For cardiology conditions, exclude unrelated surgeries
    if (specialtyLower.includes('cardio') || conditionLower.includes('heart')) {
        exclusionList = [...exclusionList, 'thyroidectomy', 'parathyroidectomy', 'gastrectomy'];
    }

    // For orthopedic conditions, exclude unrelated treatments
    if (specialtyLower.includes('orthop') || conditionLower.includes('bone') || conditionLower.includes('joint')) {
        exclusionList = [...exclusionList, 'thyroidectomy', 'parathyroidectomy', 'chemotherapy', 'dialysis'];
    }

    if (exclusionList.length === 0) return treatments;

    return treatments.filter(treatment => {
        const treatmentLower = treatment.toLowerCase();
        return !exclusionList.some(exclusion =>
            treatmentLower.includes(exclusion.toLowerCase())
        );
    });
}

/**
 * Filter automated medical treatments that don't belong to this condition.
 */
function filterAutomatedTreatments<T extends { name: string }>(
    treatments: T[] | null,
    specialistType: string | null,
    conditionName?: string | null
): T[] {
    if (!treatments || treatments.length === 0) return [];

    const treatmentNames = treatments.map(t => t.name);
    const filteredNames = filterMismatchedTreatments(treatmentNames, specialistType, conditionName);

    return treatments.filter(t => filteredNames.includes(t.name));
}

/**
 * Dynamic Route: /{country}/{lang}/{condition}/{...geo}
 * Phase 9: Automated Content Assembly & Global Indexing
 */

interface PageProps {
    params: Promise<{
        country: string;
        lang: string;
        condition: string;
        geo?: string[];
    }>;
}

export const revalidate = 3600; // ISR 1 hour

// ─── Dynamic Metadata ───────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country, lang, condition, geo } = await params;
    const geoSlugs = [country, ...(geo || [])];
    const data = await stitchPageData(lang, condition, geoSlugs);

    if (!data) return { title: 'Not Found' };

    const deepestGeo = data.geoChain.locality || data.geoChain.city || data.geoChain.state || data.geoChain.country;
    const locationName = deepestGeo?.name || '';
    const conditionName = data.condition.commonName;

    // Use Automated Title if available -> Localized Content -> Default
    const metaTitle = data.automatedContent?.metaTitle || data.automatedContent?.h1Title || data.localContent?.metaTitle ||
        `${conditionName} Treatment in ${locationName} | aihealz`;

    // Use Automated Meta Desc if available
    const metaDescription = data.automatedContent?.metaDescription ||
        (data.automatedContent?.heroOverview ? data.automatedContent.heroOverview.substring(0, 155) + '...' : null) ||
        data.localContent?.metaDescription ||
        `Find the best ${pluralizeSpecialist(data.condition.specialistType)} for ${conditionName} treatment in ${locationName}. Verified specialists, patient reviews, and appointment booking.`;

    const hreflangTags = generateHreflangTags(condition, data.geoChain, lang, data.availableLanguages);
    const urlPath = `/${country}/${lang}/${condition}${geo ? '/' + geo.join('/') : ''}`;

    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${urlPath}`;

    return {
        title: metaTitle,
        description: metaDescription,
        other: {
            ...(data.automatedContent?.h1Title ? { 'llm-summary': `Review of ${conditionName} in ${locationName} based on local data.` } : {}),
            // E-E-A-T signals
            ...(data.reviewer?.name ? { 'reviewed-by': data.reviewer.name } : {}),
            ...(data.reviewer?.reviewDate ? { 'last-reviewed': new Date(data.reviewer.reviewDate).toISOString() } : {}),
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            url: canonicalUrl,
            siteName: 'aihealz',
            type: 'article', // More specific for medical content
            locale: lang,
            images: data.featureImage ? [{
                url: data.featureImage,
                width: 1200,
                height: 630,
                alt: `Medical illustration of ${conditionName}`,
            }] : undefined,
        },
        alternates: {
            canonical: canonicalUrl,
            languages: Object.fromEntries(hreflangTags.map(tag => [tag.hreflang, tag.href])),
        },
        robots: { index: true, follow: true },
    };
}

// ─── Page Component ─────────────────────────────────────────

export default async function ConditionPage({ params }: PageProps) {
    const { country, lang, condition, geo } = await params;
    const geoSlugs = [country, ...(geo || [])];
    const rawData = await stitchPageData(lang, condition, geoSlugs);

    if (!rawData) notFound();

    // Cast to ensure type safety after null check
    const data = rawData as PageData;

    // Extract typed values for rendering - expand ICD abbreviations for user-friendly text
    const heroOverviewText: string | null = expandIcdAbbreviations(data.automatedContent?.heroOverview) || null;
    const definitionText: string | null = expandIcdAbbreviations(data.automatedContent?.definition) || null;
    const cleanConditionName = expandIcdAbbreviations(data.condition.commonName);

    const t = await getConditionPageTranslations(lang);
    const urlPath = `/${country}/${lang}/${condition}${geo ? '/' + geo.join('/') : ''}`;
    const allDoctors = [...data.doctors.premium, ...data.doctors.free];

    // Schema - use pre-generated or generate dynamically
    // Map automated FAQs to schema format
    const faqsForSchema = data.automatedContent?.faqs?.map(faq => ({
        question: faq.question,
        answer: faq.answer
    })) || [];

    // Use pre-generated schema or generate dynamically
    let schemas: string;
    if (data.automatedContent?.schemaMedicalCondition && data.automatedContent?.schemaFaqPage) {
        // Use pre-generated schema data
        const allSchemas = [
            data.automatedContent.schemaMedicalCondition,
            data.automatedContent.schemaFaqPage,
            generateBreadcrumbSchema(lang, data.condition.commonName, condition, data.geoChain),
        ];
        schemas = JSON.stringify(allSchemas);
    } else {
        // Generate schema dynamically
        schemas = generatePageSchemas(
            {
                scientificName: data.condition.scientificName,
                commonName: data.condition.commonName,
                description: data.automatedContent?.definition || data.condition.description || '',
                symptoms: data.automatedContent?.primarySymptoms || data.condition.symptoms || [],
                treatments: data.condition.treatments || [],
                specialistType: data.condition.specialistType,
                icdCode: data.condition.icdCode || undefined,
            },
            data.reviewer,
            allDoctors.map(d => ({
                name: d.name,
                slug: d.slug,
                qualifications: d.qualifications,
                rating: d.rating || undefined,
                reviewCount: d.reviewCount,
                consultationFee: d.consultationFee || undefined,
                feeCurrency: d.feeCurrency,
                profileImage: d.profileImage || undefined,
            })),
            data.geoChain,
            lang,
            urlPath,
            {
                faqs: faqsForSchema.length > 0 ? faqsForSchema : undefined,
                featureImage: data.featureImage || undefined,
            }
        );
    }

    const hreflangTags = generateHreflangTags(condition, data.geoChain, lang, data.availableLanguages);
    const deepestGeo = data.geoChain.locality || data.geoChain.city || data.geoChain.state || data.geoChain.country;
    const locationName = deepestGeo?.name || 'your area';

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemas }} />
            {hreflangTags.map((tag) => (
                <link key={tag.hreflang} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
            ))}
            <ThemeScript />

            <main className="condition-page min-h-screen bg-[#050B14] text-slate-300 transition-colors duration-300 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

                {/* ── Breadcrumbs ───────────────────────────── */}
                <div className="container mx-auto px-4 py-6 relative z-10">
                    <nav className="text-sm text-slate-500 font-semibold flex flex-wrap gap-2 items-center">
                        <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={`/${country}/${lang}`} className="hover:text-teal-400 transition-colors">{t['nav.conditions'] || 'Conditions'}</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{data.condition.commonName}</span>
                    </nav>
                </div>

                {/* ── Hero Section with Scan Effect ─────────── */}
                <section className="relative z-10">
                    <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                                    {data.condition.specialistType}
                                </span>
                                {data.condition.severityLevel && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${
                                        data.condition.severityLevel === 'critical' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                                        data.condition.severityLevel === 'severe' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                                        data.condition.severityLevel === 'moderate' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/10 border border-green-500/20 text-green-400'
                                    }`}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        {data.condition.severityLevel}
                                    </span>
                                )}
                                {data.condition.icdCode && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                        ICD-10: {data.condition.icdCode}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                                {data.automatedContent?.h1Title ||
                                    `${data.condition.commonName} Treatment in ${locationName}`}
                            </h1>

                            {/* Simple Name & Regional Tags - for local language comprehension */}
                            {data.automatedContent?.simpleName && data.automatedContent.simpleName !== data.condition.commonName && (
                                <div className="mb-6">
                                    <p className="text-xl md:text-2xl text-teal-400 font-medium mb-2">
                                        {data.automatedContent.simpleName}
                                    </p>
                                    {data.automatedContent?.regionalNames && data.automatedContent.regionalNames.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {data.automatedContent.regionalNames.map((regional, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-white/10 text-sm text-slate-300">
                                                    <span className="text-slate-400 text-xs">{regional.region}:</span>
                                                    <span className="font-medium">{regional.name}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Overview Card */}
                            {heroOverviewText ? (
                                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-teal-500/20 mb-8 relative overflow-hidden shadow-2xl shadow-teal-900/20 group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-cyan-500"></div>
                                    <h3 className="text-sm font-bold text-teal-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                        <AnalyzingPulse status="" />
                                        Overview
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-lg">
                                        {heroOverviewText}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                    {data.localContent?.description || data.condition.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-6">
                                <a href="#local-doctors" className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:-translate-y-1 flex items-center gap-2">
                                    Find {pluralizeSpecialist(data.condition.specialistType)} in {locationName}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </a>
                                <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-lg border border-white/5">
                                    <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="flex items-center gap-1">
                                        Verified by <strong className="text-white">{data.reviewer?.name || 'Medical Board'}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Visual with Scan Effect - only show if there's an image */}
                        {data.featureImage && (
                            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-teal-900/20 aspect-[4/3] group border border-white/10">
                                <img
                                    src={data.featureImage}
                                    alt={`Anatomical render of ${data.condition.commonName}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Scan Effect Overlay */}
                                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <ScannerLine className="absolute inset-0 w-full h-full" />
                                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        AI Analysis: Active
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Content Grid ──────────────────────────── */}
                <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8 space-y-12 relative z-10">

                        {/* What is {Condition}? Section */}
                        {definitionText && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    What is {data.condition.commonName}?
                                </h2>
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-light">
                                    {definitionText}
                                </div>
                            </section>
                        )}

                        {/* Treatments Segment - filtered to remove clearly mismatched treatments */}
                        {(() => {
                            const filteredTreatments = filterMismatchedTreatments(
                                data.condition.treatments || [],
                                data.condition.specialistType,
                                data.condition.commonName
                            );
                            return filteredTreatments.length > 0 ? (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    </div>
                                    Common Treatments
                                </h2>
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {filteredTreatments.map((t, i) => (
                                        <Link
                                            key={i}
                                            href={`/${country}/${lang}/treatments/${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                            className="px-5 py-2.5 bg-slate-800/50 border border-white/10 hover:border-teal-500/50 rounded-xl text-sm font-semibold text-slate-300 hover:text-white shadow-sm hover:shadow-teal-500/20 transition-all flex items-center gap-2 group"
                                        >
                                            {t}
                                            <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-teal-400">→</span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="bg-teal-900/20 p-5 rounded-xl border border-teal-500/20">
                                    <p className="text-xs text-teal-200/80 leading-relaxed flex items-start gap-3">
                                        <svg className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span><strong className="text-teal-400">Note:</strong> Depending on severity, treatments may be medically managed by a <strong className="text-white">{data.condition.specialistType} (Physician)</strong> or require operative intervention by a specialized <strong className="text-white">Surgeon</strong>. Always consult your doctor for the appropriate pathway.</span>
                                    </p>
                                </div>
                            </section>
                        ) : null;
                        })()}

                        {/* Treatment Overview */}
                        {data.automatedContent?.treatmentOverview && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    Treatment Overview
                                </h2>
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-light mb-6">
                                    <div dangerouslySetInnerHTML={{ __html: data.automatedContent.treatmentOverview.replace(/\n/g, '<br/>') }} />
                                </div>

                                {/* Medical Treatments - filtered for condition relevance */}
                                {(() => {
                                    const filteredMedical = filterAutomatedTreatments(
                                        data.automatedContent.medicalTreatments,
                                        data.condition.specialistType,
                                        data.condition.commonName
                                    );
                                    return filteredMedical.length > 0 ? (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-teal-400 mb-4">Medical Treatments</h3>
                                        <div className="grid gap-3">
                                            {filteredMedical.map((treatment, i) => (
                                                <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                                    <h4 className="font-semibold text-white">{treatment.name}</h4>
                                                    <p className="text-sm text-slate-400 mt-1">{treatment.description}</p>
                                                    {treatment.effectiveness && (
                                                        <span className="inline-block mt-2 text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded">{treatment.effectiveness}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    ) : null;
                                })()}

                                {/* Surgical Options - filtered for condition relevance */}
                                {(() => {
                                    const filteredSurgical = filterAutomatedTreatments(
                                        data.automatedContent.surgicalOptions,
                                        data.condition.specialistType,
                                        data.condition.commonName
                                    );
                                    return filteredSurgical.length > 0 ? (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-purple-400 mb-4">Surgical Options</h3>
                                        <div className="grid gap-3">
                                            {filteredSurgical.map((surgery, i) => (
                                                <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-purple-500/10">
                                                    <h4 className="font-semibold text-white">{surgery.name}</h4>
                                                    <p className="text-sm text-slate-400 mt-1">{surgery.description}</p>
                                                    {surgery.successRate && (
                                                        <span className="inline-block mt-2 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Success Rate: {surgery.successRate}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    ) : null;
                                })()}
                            </section>
                        )}

                        {/* Symptoms - only show if symptoms exist */}
                        {((data.automatedContent?.primarySymptoms && data.automatedContent.primarySymptoms.length > 0) ||
                          (data.condition.symptoms && data.condition.symptoms.length > 0)) && (
                        <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                Symptoms of {data.condition.commonName}
                            </h2>

                            {/* Primary Symptoms */}
                            <h3 className="text-lg font-semibold text-orange-400 mb-4">Primary Symptoms</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {(data.automatedContent?.primarySymptoms || data.condition.symptoms)?.map((s, i) => (
                                    <li key={i} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span className="text-slate-300 font-medium">{s}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Early Warning Signs */}
                            {data.automatedContent?.earlyWarningSigns && data.automatedContent.earlyWarningSigns.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-yellow-400 mb-4">Early Warning Signs</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {data.automatedContent.earlyWarningSigns.map((sign, i) => (
                                            <li key={i} className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                                                <span className="text-yellow-400 mt-1">⚡</span>
                                                <span className="text-slate-300">{sign}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Emergency Signs - When to Seek Immediate Care */}
                            {data.automatedContent?.emergencySigns && data.automatedContent.emergencySigns.length > 0 && (
                                <div className="mt-6 p-4 bg-red-900/20 rounded-xl border border-red-500/30">
                                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Seek Emergency Care If You Experience
                                    </h3>
                                    <ul className="space-y-2">
                                        {data.automatedContent.emergencySigns.map((sign, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-300">
                                                <span className="text-red-400 mt-1">🚨</span>
                                                {sign}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                        )}

                        {/* Causes Section (Enhanced SEO) */}
                        {data.automatedContent?.causes && data.automatedContent.causes.length > 0 && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    What Causes {data.condition.commonName}?
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.automatedContent.causes.map((causeItem, i) => (
                                        <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                            <div className="flex items-start gap-3">
                                                <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                                                <div>
                                                    <h3 className="font-semibold text-white">{causeItem.cause}</h3>
                                                    {causeItem.description && (
                                                        <p className="text-sm text-slate-400 mt-1">{causeItem.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Risk Factors Section (Enhanced SEO) */}
                        {data.automatedContent?.riskFactors && data.automatedContent.riskFactors.length > 0 && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    Risk Factors for {data.condition.commonName}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.automatedContent.riskFactors.map((riskItem, i) => (
                                        <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-red-500/10">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-white">{riskItem.factor}</h3>
                                                        {riskItem.category && (
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                                riskItem.category === 'lifestyle' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                riskItem.category === 'genetic' ? 'bg-purple-500/20 text-purple-400' :
                                                                riskItem.category === 'medical' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                            }`}>{riskItem.category}</span>
                                                        )}
                                                    </div>
                                                    {riskItem.description && (
                                                        <p className="text-sm text-slate-400 mt-1">{riskItem.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Diagnosis Section */}
                        {data.automatedContent?.diagnosisOverview && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                    </div>
                                    How is {data.condition.commonName} Diagnosed?
                                </h2>
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed mb-6">
                                    <div dangerouslySetInnerHTML={{ __html: data.automatedContent.diagnosisOverview.replace(/\n/g, '<br/>') }} />
                                </div>

                                {/* Diagnostic Tests */}
                                {data.automatedContent.diagnosticTests && data.automatedContent.diagnosticTests.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Common Diagnostic Tests</h3>
                                        <div className="grid gap-3">
                                            {data.automatedContent.diagnosticTests.map((test, i) => (
                                                <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-cyan-500/10">
                                                    <h4 className="font-semibold text-white">{test.test}</h4>
                                                    <p className="text-sm text-slate-400 mt-1">{test.purpose}</p>
                                                    {test.whatToExpect && (
                                                        <p className="text-xs text-cyan-400/80 mt-2">What to expect: {test.whatToExpect}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}


                        {/* Prognosis Section (Enhanced SEO) */}
                        {data.automatedContent?.prognosis && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    Prognosis & Outlook for {data.condition.commonName}
                                </h2>
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                                    <div dangerouslySetInnerHTML={{ __html: data.automatedContent.prognosis.replace(/\n/g, '<br/>') }} />
                                </div>
                            </section>
                        )}

                        {/* Prevention & Lifestyle Section */}
                        {(data.automatedContent?.preventionStrategies && data.automatedContent.preventionStrategies.length > 0) && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    Prevention & Lifestyle
                                </h2>

                                {/* Prevention Strategies */}
                                <h3 className="text-lg font-semibold text-green-400 mb-4">Prevention Strategies</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {data.automatedContent.preventionStrategies.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-green-500/10">
                                            <span className="text-green-400 mt-1">✓</span>
                                            <span className="text-slate-300 font-medium">{tip}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Lifestyle Modifications */}
                                {data.automatedContent.lifestyleModifications && data.automatedContent.lifestyleModifications.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-teal-400 mb-4">Lifestyle Modifications</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {data.automatedContent.lifestyleModifications.map((mod, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 bg-teal-900/20 rounded-lg border border-teal-500/20">
                                                    <span className="text-teal-400 mt-1">→</span>
                                                    <span className="text-slate-300">{mod}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Diet Recommendations */}
                                {data.automatedContent.dietRecommendations && (
                                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                                        {data.automatedContent.dietRecommendations.recommended && data.automatedContent.dietRecommendations.recommended.length > 0 && (
                                            <div className="p-4 bg-green-900/20 rounded-xl border border-green-500/20">
                                                <h4 className="font-semibold text-green-400 mb-3">Foods to Include</h4>
                                                <ul className="space-y-2">
                                                    {data.automatedContent.dietRecommendations.recommended.map((food, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-slate-300">
                                                            <span className="text-green-400">+</span> {food}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {data.automatedContent.dietRecommendations.avoid && data.automatedContent.dietRecommendations.avoid.length > 0 && (
                                            <div className="p-4 bg-red-900/20 rounded-xl border border-red-500/20">
                                                <h4 className="font-semibold text-red-400 mb-3">Foods to Avoid</h4>
                                                <ul className="space-y-2">
                                                    {data.automatedContent.dietRecommendations.avoid.map((food, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-slate-300">
                                                            <span className="text-red-400">−</span> {food}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Complications Section (Enhanced SEO) */}
                        {data.automatedContent?.complications && data.automatedContent.complications.length > 0 && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-amber-500/20 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" /></svg>
                                    </div>
                                    Potential Complications if Untreated
                                </h2>
                                <ul className="grid grid-cols-1 gap-4">
                                    {data.automatedContent.complications.map((comp, i) => (
                                        <li key={i} className="flex items-start gap-3 p-4 bg-amber-900/20 rounded-xl border border-amber-500/20">
                                            <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                                            <span className="text-slate-300 font-medium">{comp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Why See a Specialist Section */}
                        {data.automatedContent?.whySeeSpecialist && (
                            <section className="bg-gradient-to-br from-teal-900/30 to-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-teal-500/20 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    Why See {getArticle(data.automatedContent.specialistType || data.condition.specialistType)} {data.automatedContent.specialistType || data.condition.specialistType}?
                                </h2>
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed mb-6">
                                    <p>{data.automatedContent.whySeeSpecialist}</p>
                                </div>

                                {/* Doctor Selection Guide */}
                                {data.automatedContent.doctorSelectionGuide && (
                                    <div className="mt-6 p-4 bg-teal-900/20 rounded-xl border border-teal-500/20">
                                        <h3 className="font-semibold text-teal-400 mb-3">How to Choose the Right Doctor</h3>
                                        <p className="text-slate-300">{data.automatedContent.doctorSelectionGuide}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Hospital Selection Criteria */}
                        {(data.automatedContent?.hospitalCriteria && data.automatedContent.hospitalCriteria.length > 0) && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    How to Choose the Best Hospital for {data.condition.commonName}
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-400 mb-4">Key Criteria</h3>
                                        <ul className="space-y-3">
                                            {data.automatedContent.hospitalCriteria.map((criterion, i) => (
                                                <li key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                                                    <span className="text-blue-400 font-bold">{i + 1}.</span>
                                                    <span className="text-slate-300">{criterion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {data.automatedContent.keyFacilities && data.automatedContent.keyFacilities.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-purple-400 mb-4">Key Facilities to Look For</h3>
                                            <ul className="space-y-3">
                                                {data.automatedContent.keyFacilities.map((facility, i) => (
                                                    <li key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5">
                                                        <span className="text-purple-400">🏥</span>
                                                        <span className="text-slate-300">{facility}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Related Conditions */}
                        {data.automatedContent?.relatedConditions && data.automatedContent.relatedConditions.length > 0 && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    </div>
                                    Related Conditions
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.automatedContent.relatedConditions.map((related, i) => (
                                        <Link
                                            key={i}
                                            href={`/${country}/${lang}/${related.slug}`}
                                            className="p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group"
                                        >
                                            <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{related.name}</h3>
                                            {related.relevance && <p className="text-sm text-slate-400 mt-1">{related.relevance}</p>}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Automated FAQs */}
                        {data.automatedContent?.faqs && data.automatedContent.faqs.length > 0 && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    Frequently Asked Questions about {data.condition.commonName}
                                </h2>
                                <div className="space-y-4">
                                    {data.automatedContent.faqs.map((faq, i) => (
                                        <details key={i} className="group bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
                                            <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/80 transition-colors">
                                                <span className="font-semibold text-white pr-4">{faq.question}</span>
                                                <svg className="w-5 h-5 text-slate-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </summary>
                                            <div className="px-5 pb-5 text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                                                {faq.answer}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* FAQs Section (Original) */}
                        {data.condition.faqs && Array.isArray(data.condition.faqs) && data.condition.faqs.length > 0 && (
                            <section className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    Frequently Asked Questions
                                </h2>
                                <div className="space-y-4">
                                    {(data.condition.faqs as Array<{ q: string; a: string }>).map((faq, i) => (
                                        <details key={i} className="group bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
                                            <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/80 transition-colors">
                                                <span className="font-semibold text-white pr-4">{faq.q}</span>
                                                <svg className="w-5 h-5 text-slate-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </summary>
                                            <div className="px-5 pb-5 text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                                                {faq.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar (Right) */}
                    <aside className="lg:col-span-4 space-y-8 relative z-10">
                        {/* Treatment Cost Estimator */}
                        {data.treatmentCost ? (
                            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-colors duration-500 pointer-events-none" />
                                <h3 className="text-xl font-bold mb-6 flex items-center justify-between text-white relative z-10">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Estimated Cost
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">AI Estimate</span>
                                </h3>
                                <div className="space-y-5 relative z-10">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-slate-400 font-medium">Procedure</span>
                                        <span className="font-bold text-right text-white max-w-[60%] line-clamp-2">{data.treatmentCost.treatmentName}</span>
                                    </div>
                                    <div className="h-px bg-white/10"></div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Average</span>
                                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                                            {data.treatmentCost.currency} {data.treatmentCost.avg.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 font-medium bg-slate-800/50 px-3 py-2 rounded-lg border border-white/5">
                                        <span>Range: {data.treatmentCost.min.toLocaleString()} - {data.treatmentCost.max.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/${country}/${lang}/${condition}/cost`}
                                    className="mt-8 block w-full text-center py-4 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-extrabold rounded-xl border border-teal-500/30 transition-all shadow-lg hover:shadow-teal-500/20 relative z-10"
                                >
                                    View Full Cost Analysis →
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                    <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Cost Analysis
                                </h3>
                                <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                                    Get detailed hospital cost breakdowns and procedure estimates for {data.condition.commonName} in {locationName}.
                                </p>
                                <Link
                                    href={`/${country}/${lang}/${condition}/cost`}
                                    className="block w-full text-center py-4 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-extrabold rounded-xl border border-teal-500/30 transition-all shadow-lg hover:shadow-teal-500/20"
                                >
                                    Unlock Cost Data →
                                </Link>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group border border-teal-400/50">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors pointer-events-none" />
                            <h3 className="text-2xl font-black mb-4 relative z-10">Need Help Now?</h3>
                            <p className="mb-8 font-medium text-slate-800 relative z-10">
                                Connect with top {pluralizeSpecialist(data.condition.specialistType)} in {locationName} for a second opinion.
                            </p>
                            <a href="/medical-travel/bot" className="block w-full text-center py-4 bg-slate-900 text-white font-extrabold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all relative z-10 flex items-center justify-center gap-2">
                                Get Estimate
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>
                    </aside>
                </div>

                {/* ── Specialist Bridge Footer ──────────────── */}
                <section id="local-doctors" className="bg-slate-900/60 py-24 border-t border-white/5 relative z-10 w-full">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                                    Top {pluralizeSpecialist(data.condition.specialistType)} in {locationName}
                                </h2>
                                <p className="text-slate-400 mt-3 text-lg">
                                    Ranked by patient outcomes and specialized experience.
                                </p>
                            </div>
                            <a href={`/doctors/${data.condition.slug}`} className="text-teal-400 font-bold hover:text-teal-300 transition-colors flex items-center gap-1 group">
                                View all specialists
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>

                        {/* Doctor Grid: Premium First */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {data.doctors.premium.map((doc) => (
                                <DoctorCardComponent key={doc.id} doctor={doc} t={t} />
                            ))}
                            {data.doctors.free.map((doc) => (
                                <DoctorCardComponent key={doc.id} doctor={doc} t={t} />
                            ))}
                        </div>

                        {allDoctors.length === 0 && (
                            <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-dashed border-white/10 mt-8">
                                <svg className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <p className="text-lg text-slate-400 mb-4">
                                    We are currently verifying top specialists in {locationName}.
                                </p>
                                <a href="/for-doctors" className="px-6 py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold rounded-xl border border-teal-500/30 transition-colors inline-flex items-center gap-2">
                                    Apply as a {data.condition.specialistType}
                                </a>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function DoctorCardComponent({ doctor, t }: { doctor: any; t: any }) {
    return (
        <Link href={`/doctor/${doctor.slug}`} className="block group">
            <article className={`h-full bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 relative ${doctor.subscriptionTier !== 'free'
                    ? 'border-teal-500/30 hover:border-teal-400 hover:shadow-[0_10px_30px_-10px_rgba(20,184,166,0.2)]'
                    : 'border-white/5 hover:border-white/20 hover:shadow-xl'
                }`}>
                {doctor.subscriptionTier !== 'free' && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-colors pointer-events-none"></div>
                )}
                <div className="p-8 flex flex-col items-center text-center relative z-10">
                    <div className="relative w-28 h-28 mb-5">
                        {doctor.profileImage ? (
                            <AvatarWithFallback src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform shadow-lg" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl font-black text-slate-500 shadow-inner">
                                {doctor.name.charAt(0)}
                            </div>
                        )}
                        {doctor.isVerified && (
                            <span className="absolute bottom-1 right-1 bg-teal-500 text-white p-1.5 rounded-full border-2 border-slate-900 shadow-lg" title="Verified Specialist">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </span>
                        )}
                    </div>

                    <h3 className="font-extrabold text-lg text-white mb-1 group-hover:text-teal-400 transition-colors">
                        {doctor.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-1">{doctor.qualifications.join(', ')}</p>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 w-full justify-center bg-slate-800/50 py-2.5 rounded-lg border border-white/5">
                        {doctor.experienceYears && <span>{doctor.experienceYears}y exp</span>}
                        {doctor.rating && (
                            <span className="flex items-center gap-1 text-amber-400">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                {doctor.rating}
                            </span>
                        )}
                    </div>

                    {doctor.subscriptionTier !== 'free' && (
                        <div className="mt-5 w-full">
                            <span className="block w-full py-3 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-wide uppercase rounded-xl border border-teal-500/30 group-hover:bg-teal-500 group-hover:text-slate-900 transition-all shadow-lg hover:shadow-teal-500/20">
                                Book Appointment
                            </span>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
