import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import TreatmentsExplorer, { type TreatmentType } from '@/components/ui/treatments-explorer';
import { normalizeSpecialty, SPECIALTY_ICON_DATA } from '@/lib/normalize-specialty';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import { isRTL, getLanguageConfig, getUITranslations } from '@/lib/i18n';
import { COUNTRIES } from '@/lib/countries';

/**
 * Localized Treatments Directory Page
 *
 * Renders treatments in the user's regional language with RTL support.
 * Route: /[country]/[lang]/treatments
 */

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
    costs?: Record<string, TreatmentCost>;
}

const VALID_TYPES = new Set(['medical', 'surgical', 'otc', 'home_remedy', 'therapy', 'drug', 'injection', 'prescription']);

// Validate country and language
function validateParams(country: string, lang: string): boolean {
    const validCountry = COUNTRIES.find(c => c.slug === country || c.code.toLowerCase() === country);
    if (!validCountry) return false;

    const countryConfig = getLanguageConfig(lang);
    return !!countryConfig;
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ country: string; lang: string }>
}): Promise<Metadata> {
    const { country, lang } = await params;
    const ui = getUITranslations(lang);
    const langConfig = getLanguageConfig(lang);
    const dir = isRTL(lang) ? 'rtl' : 'ltr';

    const countryName = COUNTRIES.find(c => c.slug === country)?.name || country;

    const title = lang === 'en'
        ? `Medical Treatments Directory | ${countryName} | AIHealz`
        : `${ui.treatments} | ${countryName} | AIHealz`;

    const description = lang === 'en'
        ? `Explore 10,000+ medical treatments with cost estimates in ${countryName}. Compare prescription drugs, surgical procedures, and find generic alternatives.`
        : `${countryName} में 10,000+ चिकित्सा उपचार खोजें। दवाओं, सर्जरी और जेनेरिक विकल्पों की तुलना करें।`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://aihealz.com/${country}/${lang}/treatments`,
            languages: {
                'en': `https://aihealz.com/${country}/en/treatments`,
                [lang]: `https://aihealz.com/${country}/${lang}/treatments`,
            },
        },
        openGraph: {
            title,
            description,
            locale: `${lang}_${country.toUpperCase()}`,
            type: 'website',
        },
        other: {
            'content-language': lang,
            dir,
        },
    };
}

export default async function LocalizedTreatmentsDirectory({
    params
}: {
    params: Promise<{ country: string; lang: string }>
}) {
    const { country, lang } = await params;

    // Validate params
    if (!validateParams(country, lang)) {
        notFound();
    }

    const ui = getUITranslations(lang);
    const langConfig = getLanguageConfig(lang);
    const dir = isRTL(lang) ? 'rtl' : 'ltr';
    const countryConfig = COUNTRIES.find(c => c.slug === country);

    // Load treatments.json
    const filePath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    let raw: TreatmentEntry[] = [];
    try {
        raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error('Failed to load treatments.json:', e);
    }

    // Group by specialty
    const specialtyMap: Record<string, Map<string, TreatmentEntry>> = {};

    raw.forEach(t => {
        const specialty = normalizeSpecialty(t.specialty);
        if (!specialtyMap[specialty]) specialtyMap[specialty] = new Map();
        const type = VALID_TYPES.has(t.type) ? t.type as TreatmentType : 'medical';
        const key = `${t.name.trim()}-${type}`;

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
                    costs: t.costs as {
                        usa: TreatmentCost;
                        uk: TreatmentCost;
                        india: TreatmentCost;
                        thailand: TreatmentCost;
                        mexico: TreatmentCost;
                        turkey: TreatmentCost;
                        uae: TreatmentCost;
                    } | undefined,
                }))
                .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter(c => c.treatments.length > 0);

    const totalTreatments = categories.reduce((sum, c) => sum + c.treatments.length, 0);

    // Treatment type labels in current language
    const TREATMENT_TYPES = [
        { type: 'prescription', label: ui.prescriptionDrug, color: 'cyan', iconColor: 'text-cyan-400' },
        { type: 'injection', label: ui.injectableTreatment, color: 'pink', iconColor: 'text-pink-400' },
        { type: 'surgical', label: ui.surgicalProcedure, color: 'rose', iconColor: 'text-rose-400' },
        { type: 'therapy', label: ui.therapy, color: 'violet', iconColor: 'text-violet-400' },
        { type: 'otc', label: ui.otcMedication, color: 'amber', iconColor: 'text-amber-400' },
        { type: 'home_remedy', label: ui.homeRemedy, color: 'green', iconColor: 'text-green-400' },
    ];

    // Breadcrumb schema
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: ui.home, item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: ui.treatments, item: `https://aihealz.com/${country}/${lang}/treatments` },
        ],
    };

    return (
        <>
            <Script
                id="breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <main
                dir={dir}
                lang={lang}
                className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden"
            >
                {/* Background Effects */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
                <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none`} />
                <div className={`absolute bottom-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[80px] translate-y-1/2 pointer-events-none`} />

                <div className="max-w-7xl mx-auto px-6 relative z-10 mt-8">

                    {/* Language indicator for regional pages */}
                    {lang !== 'en' && (
                        <div className={`mb-6 flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-lg text-sm font-medium border border-primary-500/20">
                                {langConfig.nativeName}
                            </span>
                            <Link
                                href={`/${country}/en/treatments`}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Switch to English →
                            </Link>
                        </div>
                    )}

                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className={`mb-6 ${dir === 'rtl' ? 'text-right' : ''}`}>
                        <ol className={`flex items-center gap-2 text-sm text-slate-400 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">{ui.home}</Link>
                            </li>
                            <li aria-hidden="true" className={dir === 'rtl' ? 'rotate-180' : ''}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li>
                                <span className="text-white font-medium">{ui.treatments}</span>
                            </li>
                        </ol>
                    </nav>

                    {/* Hero Header */}
                    <header className={`mb-10 text-center max-w-4xl mx-auto ${dir === 'rtl' ? 'font-rtl' : ''}`}>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                            {lang === 'en' ? (
                                <>
                                    Medical Treatments, Drugs & <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">Procedures Directory</span>
                                </>
                            ) : lang === 'hi' ? (
                                <>
                                    चिकित्सा उपचार, दवाएं और <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">प्रक्रियाएं निर्देशिका</span>
                                </>
                            ) : lang === 'ar' ? (
                                <>
                                    دليل العلاجات الطبية <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">والأدوية والإجراءات</span>
                                </>
                            ) : lang === 'ta' ? (
                                <>
                                    மருத்துவ சிகிச்சைகள், மருந்துகள் <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">மற்றும் நடைமுறைகள்</span>
                                </>
                            ) : lang === 'bn' ? (
                                <>
                                    চিকিৎসা, ওষুধ এবং <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">পদ্ধতির ডিরেক্টরি</span>
                                </>
                            ) : (
                                <>
                                    {ui.treatments} <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">Directory</span>
                                </>
                            )}
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-6">
                            {lang === 'en'
                                ? `Browse ${totalTreatments.toLocaleString()}+ treatments with cost estimates across 7 countries.`
                                : lang === 'hi'
                                    ? `7 देशों में ${totalTreatments.toLocaleString()}+ उपचार की लागत के साथ ब्राउज़ करें।`
                                    : lang === 'ar'
                                        ? `تصفح ${totalTreatments.toLocaleString()}+ علاج مع تقديرات التكلفة في 7 دول.`
                                        : lang === 'ta'
                                            ? `7 நாடுகளில் ${totalTreatments.toLocaleString()}+ சிகிச்சைகளை செலவு மதிப்பீடுகளுடன் உலாவுங்கள்.`
                                            : `${totalTreatments.toLocaleString()}+ ${ui.treatments}`
                            }
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <SearchAutocomplete
                                placeholder={ui.searchPlaceholder}
                                className="w-full"
                            />
                        </div>
                    </header>

                    {/* Stats Bar */}
                    <section aria-label="Treatment Statistics" className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 ${dir === 'rtl' ? 'direction-rtl' : ''}`}>
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-white mb-1">{totalTreatments.toLocaleString()}+</div>
                            <div className="text-sm text-slate-400">{ui.treatments}</div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-cyan-400 mb-1">{categories.length}</div>
                            <div className="text-sm text-slate-400">
                                {lang === 'en' ? 'Specialties' : lang === 'hi' ? 'विशेषताएं' : lang === 'ar' ? 'التخصصات' : 'Specialties'}
                            </div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-emerald-400 mb-1">7</div>
                            <div className="text-sm text-slate-400">
                                {lang === 'en' ? 'Countries' : lang === 'hi' ? 'देश' : lang === 'ar' ? 'الدول' : 'Countries'}
                            </div>
                        </div>
                        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                            <div className="text-3xl font-extrabold text-amber-400 mb-1">90%</div>
                            <div className="text-sm text-slate-400">{ui.potentialSavings}</div>
                        </div>
                    </section>

                    {/* Featured Treatment Types */}
                    <section aria-labelledby="treatment-types-heading" className="mb-12">
                        <h2 id="treatment-types-heading" className="text-2xl font-bold text-white mb-6 text-center">
                            {lang === 'en' ? 'Browse by Treatment Type' : lang === 'hi' ? 'उपचार प्रकार के अनुसार ब्राउज़ करें' : lang === 'ar' ? 'تصفح حسب نوع العلاج' : 'Browse by Type'}
                        </h2>
                        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${dir === 'rtl' ? 'direction-rtl' : ''}`}>
                            {TREATMENT_TYPES.map(t => (
                                <Link
                                    key={t.type}
                                    href={`/${country}/${lang}/treatments?type=${t.type}`}
                                    className={`group bg-slate-900/60 border border-white/5 hover:border-${t.color}-500/30 rounded-xl p-4 text-center transition-all hover:bg-slate-800/60`}
                                >
                                    <div className={`w-10 h-10 mx-auto rounded-xl bg-slate-800/80 flex items-center justify-center mb-2 ${t.iconColor}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <div className="text-sm font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                        {t.label}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Interactive Explorer */}
                    <article aria-labelledby="explorer-heading">
                        <h2 id="explorer-heading" className="sr-only">{ui.browseAllTreatments}</h2>
                        <TreatmentsExplorer
                            categories={categories}
                            defaultCountry={country}
                            lang={lang}
                            baseUrl={`/${country}/${lang}/treatments`}
                        />
                    </article>

                    {/* Back to main treatments */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/treatments"
                            className={`inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}
                        >
                            <svg className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {ui.browseAllTreatments}
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
