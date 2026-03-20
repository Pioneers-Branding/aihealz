import React, { cache } from 'react';
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
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { TableOfContents } from '@/components/ui/table-of-contents';

// Deduplicate stitchPageData calls within the same request
// (generateMetadata + page component both call this)
const getCachedPageData = cache(
    (lang: string, condition: string, geoSlugs: string[]) =>
        stitchPageData(lang, condition, geoSlugs)
);

const getCachedTranslations = cache(
    (lang: string) => getConditionPageTranslations(lang)
);

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
    const data = await getCachedPageData(lang, condition, geoSlugs);

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
    const rawData = await getCachedPageData(lang, condition, geoSlugs);

    if (!rawData) notFound();

    // Cast to ensure type safety after null check
    const data = rawData as PageData;

    // Extract typed values for rendering - expand ICD abbreviations for user-friendly text
    const heroOverviewText: string | null = expandIcdAbbreviations(data.automatedContent?.heroOverview) || null;
    const definitionText: string | null = expandIcdAbbreviations(data.automatedContent?.definition) || null;
    const cleanConditionName = expandIcdAbbreviations(data.condition.commonName);

    const t = await getCachedTranslations(lang);
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

    // Build TOC items dynamically based on available content
    const tocItems: { id: string; label: string; icon: string }[] = [];
    if (definitionText) tocItems.push({ id: 'overview', label: 'Overview', icon: '📋' });
    if (data.condition.treatments?.length) tocItems.push({ id: 'treatments', label: 'Treatments', icon: '💊' });
    if (data.automatedContent?.primarySymptoms?.length || data.condition.symptoms?.length)
        tocItems.push({ id: 'symptoms', label: 'Symptoms', icon: '🔍' });
    if (data.automatedContent?.diagnosisOverview || data.automatedContent?.prognosis)
        tocItems.push({ id: 'diagnosis', label: 'Diagnosis', icon: '🩺' });
    if (data.automatedContent?.preventionStrategies?.length)
        tocItems.push({ id: 'lifestyle', label: 'Lifestyle', icon: '🌿' });
    if (data.automatedContent?.complications?.length || data.automatedContent?.whySeeSpecialist)
        tocItems.push({ id: 'complications', label: 'Complications', icon: '⚠️' });
    if (data.automatedContent?.faqs?.length || (data.condition.faqs && Array.isArray(data.condition.faqs) && data.condition.faqs.length > 0))
        tocItems.push({ id: 'faqs', label: 'FAQs', icon: '❓' });
    tocItems.push({ id: 'local-doctors', label: 'Find Doctors', icon: '👨‍⚕️' });

    // Collect all FAQs for the accordion
    const allFaqs: { question: string; answer: string }[] = [
        ...(data.automatedContent?.faqs || []),
        ...((data.condition.faqs as any[]) || []).map((faq: any) => ({
            question: faq.q || faq.question,
            answer: faq.a || faq.answer,
        })),
    ];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemas }} />
            {hreflangTags.map((tag) => (
                <link key={tag.hreflang} rel="alternate" hrefLang={tag.hreflang} href={tag.href} />
            ))}
            <ThemeScript />

            <main className="condition-page min-h-screen bg-[#050B14] text-slate-300 relative overflow-hidden">
                {/* ── Ambient Background ── */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 inset-x-0 h-[900px] bg-gradient-to-b from-teal-950/30 via-[#050B14]/90 to-transparent" />
                    <div className="absolute -top-40 right-[-200px] w-[700px] h-[700px] bg-teal-500/[0.07] rounded-full blur-[150px]" />
                    <div className="absolute top-[400px] left-[-200px] w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
                </div>

                {/* ── Breadcrumbs ── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 relative z-10">
                    <nav className="text-sm text-slate-500 flex flex-wrap gap-1.5 items-center">
                        <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <Link href={`/${country}/${lang}`} className="hover:text-teal-400 transition-colors">{t['nav.conditions'] || 'Conditions'}</Link>
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="text-slate-300">{data.condition.commonName}</span>
                    </nav>
                </div>

                {/* ══════════════════════════════════════════════
                    HERO SECTION
                ══════════════════════════════════════════════ */}
                <section className="relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Left: Text Content */}
                        <div className={data.featureImage ? "lg:col-span-8" : "lg:col-span-12"}>
                            {/* Badges Row */}
                            <div className="flex flex-wrap items-center gap-2 mb-5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    {data.condition.specialistType}
                                </span>
                                {data.condition.severityLevel && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                        data.condition.severityLevel === 'critical' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                                        data.condition.severityLevel === 'severe' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                                        data.condition.severityLevel === 'moderate' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/10 border border-green-500/20 text-green-400'
                                    }`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {data.condition.severityLevel}
                                    </span>
                                )}
                                {data.condition.icdCode && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wider">
                                        ICD-10: {data.condition.icdCode}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-5">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
                                    {data.automatedContent?.h1Title ||
                                        `${data.condition.commonName} Treatment in ${locationName}`}
                                </span>
                            </h1>

                            {/* Simple Name & Regional Tags */}
                            {data.automatedContent?.simpleName && data.automatedContent.simpleName !== data.condition.commonName && (
                                <div className="mb-5">
                                    <p className="text-lg text-teal-400/90 font-medium">
                                        {data.automatedContent.simpleName}
                                    </p>
                                    {data.automatedContent?.regionalNames && data.automatedContent.regionalNames.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2.5">
                                            {data.automatedContent.regionalNames.map((regional, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-white/5 text-sm text-slate-400">
                                                    <span className="text-slate-500 text-xs">{regional.region}:</span>
                                                    <span>{regional.name}</span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Hero Overview */}
                            {heroOverviewText && (
                                <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
                                    {heroOverviewText.split('. ').slice(0, 2).join('. ')}.
                                </p>
                            )}

                            {/* Quick Stats Bar */}
                            <div className="flex flex-wrap gap-3 mb-8">
                                {data.condition.icdCode && (
                                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">ICD Code</div>
                                            <div className="text-sm font-bold text-white">{data.condition.icdCode}</div>
                                        </div>
                                    </div>
                                )}
                                {allDoctors.length > 0 && (
                                    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Specialists</div>
                                            <div className="text-sm font-bold text-white">{allDoctors.length} Available</div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Reviewed By</div>
                                        <div className="text-sm font-bold text-white">{data.reviewer?.name || 'Medical Board'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap items-center gap-3">
                                <a href="#local-doctors" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-900 font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0">
                                    Find a Specialist
                                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </a>
                                <a href="#symptoms" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    View Symptoms
                                </a>
                            </div>
                        </div>

                        {/* Right: Feature Image */}
                        {data.featureImage && (
                            <div className="lg:col-span-4 relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 bg-slate-900">
                                    <img
                                        src={data.featureImage}
                                        alt={`Medical illustration of ${data.condition.commonName}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/60 via-transparent to-transparent" />
                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <ScannerLine className="absolute inset-0 w-full h-full" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-md text-xs text-slate-300 rounded-lg border border-white/10 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                        AI-Enhanced Illustration
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    MAIN CONTENT + SIDEBAR
                ══════════════════════════════════════════════ */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">

                    {/* ── Main Content (Left 8 cols) ── */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* ─── OVERVIEW ─── */}
                        {definitionText && (
                            <section id="overview" className="scroll-mt-24">
                                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-teal-600 rounded-full" />
                                    <h2 className="text-2xl font-bold mb-5 text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        What is {cleanConditionName}?
                                    </h2>
                                    <p className="text-slate-300 leading-relaxed text-[17px] pl-[52px]">
                                        {definitionText.split('. ').slice(0, 3).join('. ')}.
                                    </p>
                                    <div className="mt-5 ml-[52px] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/[0.06] border border-teal-500/10 text-sm text-teal-400/80">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Specialist: {data.condition.specialistType}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ─── TREATMENTS ─── */}
                        {(() => {
                            const filteredTreatments = filterMismatchedTreatments(
                                data.condition.treatments || [],
                                data.condition.specialistType,
                                data.condition.commonName
                            );
                            if (!filteredTreatments.length) return null;
                            return (
                                <section id="treatments" className="scroll-mt-24">
                                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                        Treatment Options
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredTreatments.map((tr, i) => (
                                            <Link
                                                key={i}
                                                href={`/${country}/${lang}/treatments/${tr.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                                className="group flex items-start gap-4 p-5 bg-slate-900/50 rounded-xl border border-white/[0.06] hover:border-blue-500/30 hover:bg-slate-800/50 transition-all"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold text-sm group-hover:bg-blue-500/20 transition-colors">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors leading-snug">{tr}</h4>
                                                    <span className="text-xs text-slate-500 mt-1 inline-block">Learn more →</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            );
                        })()}

                        {/* Treatment Detail: Medical + Surgical */}
                        {data.automatedContent?.treatmentOverview && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {(() => {
                                    const medical = filterAutomatedTreatments(data.automatedContent.medicalTreatments, data.condition.specialistType, data.condition.commonName);
                                    if (!medical.length) return null;
                                    return (
                                        <div className="bg-slate-900/40 p-6 rounded-2xl border border-teal-500/10 hover:border-teal-500/25 transition-all">
                                            <h3 className="text-sm font-bold text-teal-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-teal-400" />
                                                Medical Treatments
                                            </h3>
                                            <ul className="space-y-3">
                                                {medical.slice(0, 4).map((m, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                                                        <svg className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        {m.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })()}
                                {(() => {
                                    const surgical = filterAutomatedTreatments(data.automatedContent.surgicalOptions, data.condition.specialistType, data.condition.commonName);
                                    if (!surgical.length) return null;
                                    return (
                                        <div className="bg-slate-900/40 p-6 rounded-2xl border border-purple-500/10 hover:border-purple-500/25 transition-all">
                                            <h3 className="text-sm font-bold text-purple-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                                Surgical Options
                                            </h3>
                                            <div className="space-y-3">
                                                {surgical.slice(0, 4).map((s, i) => (
                                                    <div key={i} className="bg-slate-800/40 px-4 py-3 rounded-xl border border-white/5">
                                                        <div className="text-white font-medium text-sm">{s.name}</div>
                                                        <div className="text-xs text-purple-400/80 mt-0.5">{s.successRate || 'Consult Specialist'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* ─── SYMPTOMS ─── */}
                        {((data.automatedContent?.primarySymptoms && data.automatedContent.primarySymptoms.length > 0) ||
                          (data.condition.symptoms && data.condition.symptoms.length > 0)) && (
                        <section id="symptoms" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                Key Symptoms
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(data.automatedContent?.primarySymptoms || data.condition.symptoms || []).map((symptom, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-white/[0.06] hover:border-orange-500/20 transition-colors group">
                                        <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                                            <span className="text-orange-400 font-bold text-sm">{i + 1}</span>
                                        </div>
                                        <span className="text-slate-200 font-medium">{symptom}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Early & Emergency Signs */}
                            {((data.automatedContent?.earlyWarningSigns && data.automatedContent.earlyWarningSigns.length > 0) ||
                               (data.automatedContent?.emergencySigns && data.automatedContent.emergencySigns.length > 0)) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                                    {data.automatedContent?.earlyWarningSigns && data.automatedContent.earlyWarningSigns.length > 0 && (
                                        <div className="p-5 rounded-xl bg-blue-500/[0.04] border border-blue-500/15">
                                            <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Early Warning Signs
                                            </h3>
                                            <ul className="space-y-2.5">
                                                {data.automatedContent.earlyWarningSigns.map((sign, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm leading-relaxed">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2" />
                                                        {sign}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {data.automatedContent?.emergencySigns && data.automatedContent.emergencySigns.length > 0 && (
                                        <div className="p-5 rounded-xl bg-rose-500/[0.04] border border-rose-500/15">
                                            <h3 className="text-sm font-bold text-rose-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                Emergency Signs
                                            </h3>
                                            <ul className="space-y-2.5">
                                                {data.automatedContent.emergencySigns.map((sign, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm leading-relaxed font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                                                        {sign}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                        )}


                        {/* ─── DIAGNOSIS & PROGNOSIS ─── */}
                        {((data.automatedContent?.diagnosisOverview) || (data.automatedContent?.prognosis)) && (
                            <section id="diagnosis" className="scroll-mt-24">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                    </div>
                                    Diagnosis & Outlook
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {/* Diagnosis */}
                                    <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/[0.06] h-fit">
                                        <h3 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">How It&apos;s Diagnosed</h3>
                                        {data.automatedContent?.diagnosisOverview && (
                                            <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-6">
                                                {data.automatedContent.diagnosisOverview.replace(/\n/g, ' ')}
                                            </p>
                                        )}
                                        {data.automatedContent?.diagnosticTests && data.automatedContent.diagnosticTests.length > 0 && (
                                            <div className="space-y-2 pt-3 border-t border-white/5">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Key Tests</h4>
                                                {data.automatedContent.diagnosticTests.slice(0, 3).map((test, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-lg">
                                                        <span className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">{i + 1}</span>
                                                        <div>
                                                            <div className="font-semibold text-white text-sm">{test.test}</div>
                                                            <div className="text-xs text-slate-400 mt-0.5">{test.purpose}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Prognosis */}
                                    <div className="bg-gradient-to-br from-emerald-500/[0.06] to-slate-900/40 p-6 rounded-2xl border border-emerald-500/15 h-fit">
                                        <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wider">Prognosis & Outlook</h3>
                                        {data.automatedContent?.prognosis ? (
                                            <blockquote className="text-slate-300 leading-relaxed text-sm border-l-2 border-emerald-500/30 pl-4">
                                                {data.automatedContent.prognosis.split('. ').slice(0, 3).join('. ')}.
                                            </blockquote>
                                        ) : (
                                            <p className="text-slate-400 text-sm">Timely intervention significantly improves outcomes.</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ─── LIFESTYLE & PREVENTION + COMPLICATIONS (Side by Side) ─── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left: Prevention & Lifestyle */}
                            {(data.automatedContent?.preventionStrategies && data.automatedContent.preventionStrategies.length > 0) && (
                                <section id="lifestyle" className="scroll-mt-24">
                                    <h2 className="text-2xl font-bold mb-5 text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        </div>
                                        Prevention & Lifestyle
                                    </h2>
                                    <div className="space-y-2.5 mb-5">
                                        {data.automatedContent.preventionStrategies.map((tip, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/[0.06] hover:border-green-500/20 transition-colors">
                                                <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <span className="text-slate-200 text-sm font-medium">{tip}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Diet Recommendations */}
                                    {(data.automatedContent.dietRecommendations?.recommended?.length || data.automatedContent.dietRecommendations?.avoid?.length) && (
                                        <div className="space-y-4">
                                            {data.automatedContent.dietRecommendations?.recommended && data.automatedContent.dietRecommendations.recommended.length > 0 && (
                                                <div className="p-4 rounded-xl bg-green-500/[0.04] border border-green-500/15">
                                                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                        Recommended Foods
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {data.automatedContent.dietRecommendations.recommended.slice(0, 4).map((food, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                                {food}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {data.automatedContent.dietRecommendations?.avoid && data.automatedContent.dietRecommendations.avoid.length > 0 && (
                                                <div className="p-4 rounded-xl bg-red-500/[0.04] border border-red-500/15">
                                                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                        Foods to Avoid
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {data.automatedContent.dietRecommendations.avoid.slice(0, 4).map((food, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                <span className="line-through decoration-red-500/40">{food}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Right: Complications */}
                            {data.automatedContent?.complications && data.automatedContent.complications.length > 0 && (
                                <section id="complications" className="scroll-mt-24">
                                    <h2 className="text-2xl font-bold mb-5 text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </div>
                                        Complications
                                    </h2>
                                    <div className="space-y-2.5">
                                        {data.automatedContent.complications.map((comp, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/[0.06]">
                                                <span className="text-amber-400 font-bold text-sm mt-0.5 shrink-0">{i + 1}.</span>
                                                <span className="text-slate-300 text-sm leading-relaxed">{comp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Why See a Specialist */}
                        {data.automatedContent?.whySeeSpecialist && (
                            <div className="bg-gradient-to-br from-teal-500/10 to-slate-900/60 p-6 rounded-2xl border border-teal-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Why See {getArticle(data.condition.specialistType)} <span className="text-teal-400">{data.condition.specialistType}</span>?
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {data.automatedContent.whySeeSpecialist.split('. ').slice(0, 2).join('. ')}.
                                    </p>
                                </div>
                                <a href="#local-doctors" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 shrink-0">
                                    Find Specialists
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </a>
                            </div>
                        )}

                        {/* Hospital Criteria */}
                        {(data.automatedContent?.hospitalCriteria && data.automatedContent.hospitalCriteria.length > 0) && (
                            <section className="scroll-mt-24">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    Choosing the Right Hospital
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.automatedContent.hospitalCriteria.map((criterion, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-900/40 rounded-xl border border-white/[0.06]">
                                            <span className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">{i + 1}</span>
                                            <span className="text-slate-300 text-sm">{criterion}</span>
                                        </div>
                                    ))}
                                </div>
                                {data.automatedContent.keyFacilities && data.automatedContent.keyFacilities.length > 0 && (
                                    <div className="mt-5">
                                        <h3 className="text-sm font-bold text-purple-400 mb-3 uppercase tracking-wider">Essential Facilities</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.automatedContent.keyFacilities.map((facility, i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-white/5 text-sm text-slate-300">
                                                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    {facility}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Related Conditions */}
                        {data.automatedContent?.relatedConditions && data.automatedContent.relatedConditions.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    </div>
                                    Related Conditions
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.automatedContent.relatedConditions.map((related, i) => (
                                        <Link
                                            key={i}
                                            href={`/${country}/${lang}/${related.slug}`}
                                            className="group flex items-start gap-3 p-4 bg-slate-900/40 rounded-xl border border-white/[0.06] hover:border-indigo-500/25 transition-all"
                                        >
                                            <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{related.name}</h3>
                                                {related.relevance && <p className="text-slate-500 text-sm mt-0.5">{related.relevance}</p>}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ─── FAQs ─── */}
                        {allFaqs.length > 0 && (
                            <section id="faqs" className="scroll-mt-24">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    Frequently Asked Questions
                                </h2>
                                <FaqAccordion faqs={allFaqs} />
                            </section>
                        )}
                    </div>

                    {/* ── Sidebar (Right 4 cols) ── */}
                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-6">
                        {/* Table of Contents */}
                        <div className="hidden lg:block">
                            <TableOfContents items={tocItems} />
                        </div>

                        {/* Treatment Cost Card */}
                        {data.treatmentCost ? (
                            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/[0.06] shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-colors pointer-events-none" />
                                <h3 className="text-base font-bold mb-5 flex items-center justify-between text-white relative z-10">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Cost Estimate
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-teal-400 px-2 py-0.5 bg-teal-500/10 rounded border border-teal-500/20">AI</span>
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Procedure</div>
                                        <div className="text-sm font-medium text-white line-clamp-2">{data.treatmentCost.treatmentName}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Average Cost</div>
                                        <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                                            {data.treatmentCost.currency} {data.treatmentCost.avg.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1.5">
                                            Range: {data.treatmentCost.currency} {data.treatmentCost.min.toLocaleString()} – {data.treatmentCost.max.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/${country}/${lang}/${condition}/cost`}
                                    className="mt-5 block w-full text-center py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold text-sm rounded-xl border border-teal-500/25 transition-all relative z-10"
                                >
                                    Full Cost Analysis →
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/[0.06]">
                                <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-white">
                                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Cost Analysis
                                </h3>
                                <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                                    Get hospital cost breakdowns for {data.condition.commonName} in {locationName}.
                                </p>
                                <Link
                                    href={`/${country}/${lang}/${condition}/cost`}
                                    className="block w-full text-center py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-bold text-sm rounded-xl border border-teal-500/25 transition-all"
                                >
                                    Unlock Cost Data →
                                </Link>
                            </div>
                        )}

                        {/* Quick Action CTA */}
                        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                            <h3 className="text-lg font-bold mb-2 relative z-10">Need Help Now?</h3>
                            <p className="text-sm mb-5 text-teal-100/80 relative z-10">
                                Connect with {pluralizeSpecialist(data.condition.specialistType)} in {locationName} for a second opinion.
                            </p>
                            <a href="/medical-travel/bot" className="block w-full text-center py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-xl border border-white/20 transition-all relative z-10 backdrop-blur-sm">
                                Get Free Estimate →
                            </a>
                        </div>
                        </div>{/* end sticky wrapper */}
                    </aside>
                </div>

                {/* ══════════════════════════════════════════════
                    DOCTORS SECTION
                ══════════════════════════════════════════════ */}
                <section id="local-doctors" className="scroll-mt-24 py-20 border-t border-white/5 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                            <div>
                                <div className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Verified Specialists</div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                                    Top {pluralizeSpecialist(data.condition.specialistType)} in {locationName}
                                </h2>
                                <p className="text-slate-400 mt-2">
                                    Ranked by patient outcomes and specialized experience.
                                </p>
                            </div>
                            <a href={`/doctors/${data.condition.slug}`} className="text-teal-400 font-semibold hover:text-teal-300 transition-colors flex items-center gap-1.5 group text-sm">
                                View all specialists
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {data.doctors.premium.map((doc) => (
                                <DoctorCardComponent key={doc.id} doctor={doc} t={t} />
                            ))}
                            {data.doctors.free.map((doc) => (
                                <DoctorCardComponent key={doc.id} doctor={doc} t={t} />
                            ))}
                        </div>

                        {allDoctors.length === 0 && (
                            <div className="text-center py-14 bg-slate-800/20 rounded-2xl border border-dashed border-white/10 mt-6">
                                <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <p className="text-slate-400 mb-4">
                                    Verifying top specialists in {locationName}.
                                </p>
                                <a href="/for-doctors" className="px-5 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-semibold text-sm rounded-xl border border-teal-500/25 transition-colors inline-flex items-center gap-2">
                                    Apply as Specialist
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    CTA SECTION - Before Footer
                ══════════════════════════════════════════════ */}
                <section className="relative z-10 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 p-8 md:p-12 text-center shadow-2xl shadow-teal-500/20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-400/20 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
                                    Take Control of Your Health Today
                                </h2>
                                <p className="text-teal-100/90 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                                    Connect with top {pluralizeSpecialist(data.condition.specialistType)} in {locationName} who specialize in treating {data.condition.commonName}. Get expert guidance and personalized care.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <a
                                        href="#local-doctors"
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all hover:-translate-y-0.5 shadow-lg text-sm md:text-base"
                                    >
                                        Find a Specialist
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </a>
                                    <a
                                        href="/medical-travel/bot"
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/15 text-white font-bold rounded-xl border border-white/25 hover:bg-white/25 transition-all hover:-translate-y-0.5 backdrop-blur-sm text-sm md:text-base"
                                    >
                                        Get Free Estimate
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function DoctorCardComponent({ doctor, t }: { doctor: any; t: any }) {
    const isPremium = doctor.subscriptionTier !== 'free';
    return (
        <Link href={`/doctor/${doctor.slug}`} className="block group">
            <article className={`h-full bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                isPremium
                    ? 'border-teal-500/20 hover:border-teal-400/40 hover:shadow-[0_8px_30px_-12px_rgba(20,184,166,0.25)]'
                    : 'border-white/[0.06] hover:border-white/15 hover:shadow-lg'
            }`}>
                <div className="p-6 flex flex-col items-center text-center relative">
                    {isPremium && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                            Featured
                        </div>
                    )}
                    <div className="relative w-20 h-20 mb-4">
                        {doctor.profileImage ? (
                            <AvatarWithFallback src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform ring-2 ring-white/10 group-hover:ring-teal-500/30" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 ring-2 ring-white/10">
                                {doctor.name.charAt(0)}
                            </div>
                        )}
                        {doctor.isVerified && (
                            <span className="absolute -bottom-0.5 -right-0.5 bg-teal-500 text-white p-1 rounded-full border-2 border-[#0a1628] shadow" title="Verified">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </span>
                        )}
                    </div>

                    <h3 className="font-bold text-white mb-0.5 group-hover:text-teal-400 transition-colors leading-snug">
                        {doctor.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-1">{doctor.qualifications.join(', ')}</p>

                    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                        {doctor.experienceYears && <span>{doctor.experienceYears}y exp</span>}
                        {doctor.rating && (
                            <span className="flex items-center gap-1 text-amber-400">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                {doctor.rating}
                            </span>
                        )}
                    </div>

                    {isPremium && (
                        <div className="mt-4 w-full">
                            <span className="block w-full py-2.5 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-wide uppercase rounded-lg border border-teal-500/25 group-hover:bg-teal-500 group-hover:text-slate-900 transition-all">
                                Book Appointment
                            </span>
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
