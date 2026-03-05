'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Pill, Syringe, Scissors, Leaf, Activity, ChevronDown,
    ChevronRight, Search, Stethoscope, DollarSign, Globe,
    FlaskConical, FileText, X
} from 'lucide-react';

/* ─── Treatment Type Classification ────────────────────────── */

export type TreatmentType = 'medical' | 'surgical' | 'otc' | 'home_remedy' | 'therapy' | 'drug' | 'injection' | 'prescription';

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
}

interface TreatmentItem {
    name: string;
    type: TreatmentType;
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

interface SpecialtyGroup {
    specialty: string;
    treatments: TreatmentItem[];
}

type CountryKey = 'usa' | 'uk' | 'india' | 'thailand' | 'mexico' | 'turkey' | 'uae';

const COUNTRIES: { key: CountryKey; label: string; flag: string; currency: string }[] = [
    { key: 'usa', label: 'United States', flag: '🇺🇸', currency: 'USD' },
    { key: 'uk', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
    { key: 'india', label: 'India', flag: '🇮🇳', currency: 'INR' },
    { key: 'thailand', label: 'Thailand', flag: '🇹🇭', currency: 'THB' },
    { key: 'mexico', label: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
    { key: 'turkey', label: 'Turkey', flag: '🇹🇷', currency: 'TRY' },
    { key: 'uae', label: 'UAE', flag: '🇦🇪', currency: 'AED' },
];

const TYPE_CONFIG: Record<TreatmentType, {
    label: string;
    shortLabel: string;
    color: string;
    bg: string;
    border: string;
    text: string;
    dot: string;
    icon: typeof Pill;
}> = {
    medical: {
        label: 'Medical Management',
        shortLabel: 'Medical',
        color: 'blue',
        bg: 'bg-blue-500/15',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        dot: 'bg-blue-400',
        icon: Stethoscope,
    },
    surgical: {
        label: 'Surgical / Procedure',
        shortLabel: 'Surgical',
        color: 'rose',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        dot: 'bg-rose-400',
        icon: Scissors,
    },
    drug: {
        label: 'Prescription Drugs',
        shortLabel: 'Drug',
        color: 'cyan',
        bg: 'bg-cyan-500/15',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        dot: 'bg-cyan-400',
        icon: FlaskConical,
    },
    injection: {
        label: 'Injections',
        shortLabel: 'Injection',
        color: 'pink',
        bg: 'bg-pink-500/15',
        border: 'border-pink-500/30',
        text: 'text-pink-400',
        dot: 'bg-pink-400',
        icon: Syringe,
    },
    prescription: {
        label: 'Prescription Medicines',
        shortLabel: 'Rx',
        color: 'indigo',
        bg: 'bg-indigo-500/15',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        dot: 'bg-indigo-400',
        icon: FileText,
    },
    otc: {
        label: 'Over-the-Counter',
        shortLabel: 'OTC',
        color: 'amber',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        icon: Pill,
    },
    home_remedy: {
        label: 'Home Remedy',
        shortLabel: 'Home',
        color: 'emerald',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        icon: Leaf,
    },
    therapy: {
        label: 'Therapy / Rehabilitation',
        shortLabel: 'Therapy',
        color: 'violet',
        bg: 'bg-violet-500/15',
        border: 'border-violet-500/30',
        text: 'text-violet-400',
        dot: 'bg-violet-400',
        icon: Activity,
    },
};

const ALL_TYPES: TreatmentType[] = ['medical', 'surgical', 'drug', 'injection', 'prescription', 'otc', 'home_remedy', 'therapy'];

const INITIAL_VISIBLE = 12;

/* ─── TypeBadge Component ──────────────────────────────────── */

function TypeBadge({ type }: { type: TreatmentType }) {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.medical;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.text} border whitespace-nowrap`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.shortLabel}
        </span>
    );
}

/* ─── Cost Display Component ───────────────────────────────── */

function CostDisplay({ costs, country }: { costs?: TreatmentItem['costs']; country: CountryKey }) {
    if (!costs || !costs[country]) return null;

    const cost = costs[country];
    const countryInfo = COUNTRIES.find(c => c.key === country);

    if (!cost.range) return null;

    return (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
            {countryInfo?.currency} {cost.range[0].toLocaleString()}-{cost.range[1].toLocaleString()}
        </span>
    );
}

/* ─── Treatment Card Component ─────────────────────────────── */

interface TreatmentCardProps {
    treatment: TreatmentItem;
    country: CountryKey;
    lang?: string;
    baseUrl?: string;
}

function TreatmentCard({ treatment, country, lang = 'en', baseUrl }: TreatmentCardProps) {
    const slug = treatment.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Map CountryKey to country slug for URL
    const countrySlugMap: Record<CountryKey, string> = {
        'usa': 'us',
        'uk': 'uk',
        'india': 'in',
        'thailand': 'th',
        'mexico': 'mx',
        'turkey': 'tr',
        'uae': 'ae',
    };
    const countrySlug = countrySlugMap[country] || 'in';

    // Use baseUrl if provided, otherwise construct from country/lang
    const href = baseUrl
        ? `${baseUrl}/${slug}`
        : `/${countrySlug}/${lang}/treatments/${slug}`;

    return (
        <Link
            href={href}
            className="group flex flex-col gap-2 px-3.5 py-3 bg-slate-800/30 rounded-xl border border-white/[0.03] hover:bg-slate-800/60 hover:border-blue-500/20 transition-all"
        >
            <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-2 flex-1 min-w-0">
                    {treatment.name}
                </span>
                <TypeBadge type={treatment.type} />
            </div>

            {/* Brand names */}
            {treatment.brandNames && treatment.brandNames.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {treatment.brandNames.slice(0, 2).map((brand, i) => (
                        <span key={i} className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                            {brand}
                        </span>
                    ))}
                    {treatment.brandNames.length > 2 && (
                        <span className="text-[10px] text-slate-600">+{treatment.brandNames.length - 2}</span>
                    )}
                </div>
            )}

            {/* Cost and badges row */}
            <div className="flex items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-1.5">
                    {treatment.genericAvailable && (
                        <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded uppercase">
                            Generic
                        </span>
                    )}
                    {treatment.requiresPrescription && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">
                            Rx
                        </span>
                    )}
                </div>
                <CostDisplay costs={treatment.costs} country={country} />
            </div>
        </Link>
    );
}

/* ─── Country Slug to Key Mapping ─────────────────────────── */

const COUNTRY_SLUG_TO_KEY: Record<string, CountryKey> = {
    'usa': 'usa',
    'uk': 'uk',
    'india': 'india',
    'thailand': 'thailand',
    'mexico': 'mexico',
    'turkey': 'turkey',
    'uae': 'uae',
};

// Get the best matching country key from a country slug
function getCountryKey(slug: string | null | undefined): CountryKey {
    if (!slug) return 'usa';
    const lower = slug.toLowerCase();
    return COUNTRY_SLUG_TO_KEY[lower] || 'usa';
}

/* ─── Main Explorer Component ──────────────────────────────── */

interface TreatmentsExplorerProps {
    categories: SpecialtyGroup[];
    defaultCountry?: string | null;  // Country slug from geo detection
    lang?: string;                   // Language code (e.g., 'en', 'hi', 'ar', 'ta')
    baseUrl?: string;                // Base URL for treatment links (e.g., '/in/hi/treatments')
}

export default function TreatmentsExplorer({ categories, defaultCountry, lang = 'en', baseUrl }: TreatmentsExplorerProps) {
    const initialCountry = getCountryKey(defaultCountry);
    const [activeTypes, setActiveTypes] = useState<Set<TreatmentType>>(new Set(ALL_TYPES));
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<CountryKey>(initialCountry);
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const toggleType = (type: TreatmentType) => {
        setActiveTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                if (next.size > 1) next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    const toggleSection = (specialty: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(specialty)) next.delete(specialty);
            else next.add(specialty);
            return next;
        });
    };

    const filteredCategories = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();

        return categories
            .map(cat => {
                let treatments = cat.treatments.filter(t => activeTypes.has(t.type));
                if (q) {
                    treatments = treatments.filter(t =>
                        t.name.toLowerCase().includes(q) ||
                        (t.brandNames && t.brandNames.some(b => b.toLowerCase().includes(q)))
                    );
                }
                return { ...cat, treatments };
            })
            .filter(cat => cat.treatments.length > 0);
    }, [categories, activeTypes, searchQuery]);

    const totalFiltered = filteredCategories.reduce((sum, c) => sum + c.treatments.length, 0);
    const totalAll = categories.reduce((sum, c) => sum + c.treatments.length, 0);

    const currentCountry = COUNTRIES.find(c => c.key === selectedCountry)!;

    return (
        <>
            {/* ─── Stats Bar ─────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                    {filteredCategories.length} Specialties &bull; {totalFiltered.toLocaleString()} / {totalAll.toLocaleString()} Treatments
                </span>

                {/* Country Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowCountrySelector(!showCountrySelector)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm hover:bg-emerald-500/20 transition-colors"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{currentCountry.flag} {currentCountry.label}</span>
                        <DollarSign className="w-3 h-3" />
                    </button>

                    {showCountrySelector && (
                        <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] py-2 animate-in fade-in slide-in-from-top-2">
                            <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Select Country for Costs
                            </p>
                            {COUNTRIES.map(country => (
                                <button
                                    key={country.key}
                                    onClick={() => {
                                        setSelectedCountry(country.key);
                                        setShowCountrySelector(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5 transition-colors ${
                                        selectedCountry === country.key ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300'
                                    }`}
                                >
                                    <span>{country.flag}</span>
                                    <span>{country.label}</span>
                                    <span className="ml-auto text-xs text-slate-500">{country.currency}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Search Bar ────────────────────────────────── */}
            <div className="max-w-xl mx-auto mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search 10,000+ treatments, drugs, procedures..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* ─── Filter Toggle ─────────────────────────────── */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* ─── Type Filter Chips ─────────────────────────── */}
            {showFilters && (
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {ALL_TYPES.map(type => {
                        const cfg = TYPE_CONFIG[type];
                        const Icon = cfg.icon;
                        const isActive = activeTypes.has(type);
                        const count = categories.reduce(
                            (sum, c) => sum + c.treatments.filter(t => t.type === type).length, 0
                        );

                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-300
                                    ${isActive
                                        ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-lg`
                                        : 'bg-slate-900/30 border-white/5 text-slate-500 hover:text-slate-300'
                                    }
                                `}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{cfg.label}</span>
                                <span className="sm:hidden">{cfg.shortLabel}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/10' : 'bg-white/5'}`}>
                                    {count.toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ─── No Results State ──────────────────────────── */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No treatments found</h3>
                    <p className="text-slate-400 mb-6">Try adjusting your filters or search term.</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setActiveTypes(new Set(ALL_TYPES));
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* ─── Specialty Accordion Sections ───────────────── */}
            <div className="space-y-4">
                {filteredCategories.map(category => {
                    const isExpanded = expandedSections.has(category.specialty);
                    const visibleTreatments = isExpanded
                        ? category.treatments
                        : category.treatments.slice(0, INITIAL_VISIBLE);
                    const hasMore = category.treatments.length > INITIAL_VISIBLE;

                    const typeCounts: Partial<Record<TreatmentType, number>> = {};
                    category.treatments.forEach(t => {
                        typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
                    });

                    return (
                        <section
                            key={category.specialty}
                            id={`treat-${category.specialty.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                            className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-blue-500/15 transition-all duration-300 overflow-hidden scroll-mt-32 shadow-xl"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(category.specialty)}
                                className="w-full p-6 flex items-center justify-between gap-4 text-left group hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-white">{category.specialty}</h2>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg">
                                            {category.treatments.length}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_TYPES.map(type => {
                                            const count = typeCounts[type];
                                            if (!count) return null;
                                            const cfg = TYPE_CONFIG[type];
                                            return (
                                                <span key={type} className={`inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {count} {cfg.shortLabel}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/conditions/${category.specialty.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                        onClick={e => e.stopPropagation()}
                                        className="hidden md:flex text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 transition-all items-center gap-1.5"
                                    >
                                        Conditions
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {/* Treatment Grid */}
                            <div className="px-6 pb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {visibleTreatments.map((t, i) => (
                                        <TreatmentCard
                                            key={i}
                                            treatment={t}
                                            country={selectedCountry}
                                            lang={lang}
                                            baseUrl={baseUrl}
                                        />
                                    ))}
                                </div>

                                {hasMore && (
                                    <button
                                        onClick={() => toggleSection(category.specialty)}
                                        className="mt-4 w-full py-2.5 text-center text-sm font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl border border-blue-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isExpanded ? (
                                            <>Show Less<ChevronDown className="w-4 h-4 rotate-180" /></>
                                        ) : (
                                            <>Show All {category.treatments.length} Treatments<ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* ─── Cost Disclaimer ────────────────────────────── */}
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400/80 text-center">
                    <strong>Cost Disclaimer:</strong> Prices shown are estimates and may vary based on hospital, insurance, and individual circumstances.
                    Contact healthcare providers directly for accurate quotes. Costs for {currentCountry.label} shown in {currentCountry.currency}.
                </p>
            </div>
        </>
    );
}
