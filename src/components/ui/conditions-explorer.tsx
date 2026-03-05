'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, ChevronDown, ChevronUp, Heart, Brain, Eye, Bone,
    Stethoscope, Wind, Droplets, Shield, Scissors,
    Activity, Filter, X
} from 'lucide-react';

/* ─── Severity Classification ──────────────────────────────── */

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'critical' | 'variable';

const SEVERITY_CONFIG: Record<SeverityLevel, {
    label: string;
    bg: string;
    border: string;
    text: string;
    dot: string;
}> = {
    mild: {
        label: 'Mild',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
    },
    moderate: {
        label: 'Moderate',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
    },
    severe: {
        label: 'Severe',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        dot: 'bg-orange-400',
    },
    critical: {
        label: 'Critical',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        dot: 'bg-rose-400',
    },
    variable: {
        label: 'Variable',
        bg: 'bg-slate-500/15',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        dot: 'bg-slate-400',
    },
};

/* ─── Types ────────────────────────────────────────────────── */

export interface ConditionItem {
    slug: string;
    name: string;
    severity: SeverityLevel;
    bodySystem: string | null;
}

export interface SpecialtyGroup {
    specialty: string;
    conditions: ConditionItem[];
}

const INITIAL_VISIBLE = 12;
const LOAD_MORE_COUNT = 24;
const MAX_SPECIALTIES_SHOWN = 10;

function SeverityBadge({ severity }: { severity: SeverityLevel }) {
    const cfg = SEVERITY_CONFIG[severity];
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.text} border whitespace-nowrap`}>
            <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

/* ─── Specialty Card Component ─────────────────────────────── */

function SpecialtyCard({
    category,
    activeSeverities,
    urlPrefix,
}: {
    category: SpecialtyGroup;
    activeSeverities: Set<SeverityLevel>;
    urlPrefix: string;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

    // Filter conditions by active severities
    const filteredConditions = useMemo(() =>
        category.conditions.filter(c => activeSeverities.has(c.severity)),
        [category.conditions, activeSeverities]
    );

    // Severity breakdown
    const sevCounts = useMemo(() => {
        const counts: Partial<Record<SeverityLevel, number>> = {};
        filteredConditions.forEach(c => {
            counts[c.severity] = (counts[c.severity] || 0) + 1;
        });
        return counts;
    }, [filteredConditions]);

    const visibleConditions = isExpanded
        ? filteredConditions.slice(0, visibleCount)
        : filteredConditions.slice(0, INITIAL_VISIBLE);

    const hasMore = filteredConditions.length > INITIAL_VISIBLE;
    const canLoadMore = isExpanded && visibleCount < filteredConditions.length;

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredConditions.length));
    }, [filteredConditions.length]);

    const handleToggle = useCallback(() => {
        if (isExpanded) {
            setIsExpanded(false);
            setVisibleCount(INITIAL_VISIBLE);
        } else {
            setIsExpanded(true);
        }
    }, [isExpanded]);

    if (filteredConditions.length === 0) return null;

    return (
        <section
            id={`spec-${category.specialty.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
            className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-teal-500/15 transition-all duration-300 overflow-hidden scroll-mt-32 shadow-xl"
        >
            {/* Header */}
            <button
                onClick={handleToggle}
                className="w-full p-6 flex items-center justify-between gap-4 text-left group hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-white">{category.specialty}</h2>
                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg">
                            {filteredConditions.length.toLocaleString()}
                        </span>
                    </div>
                    {/* Severity breakdown */}
                    <div className="flex flex-wrap gap-3">
                        {(Object.keys(SEVERITY_CONFIG) as SeverityLevel[]).map(sev => {
                            const count = sevCounts[sev];
                            if (!count) return null;
                            const cfg = SEVERITY_CONFIG[sev];
                            return (
                                <span key={sev} className={`inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {count.toLocaleString()} {cfg.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Conditions Grid */}
            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {visibleConditions.map((c, i) => (
                        <Link
                            key={`${c.slug}-${i}`}
                            href={`${urlPrefix}/${c.slug}`}
                            className="group flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-800/30 rounded-xl border border-white/[0.03] hover:bg-slate-800/60 hover:border-teal-500/20 transition-all"
                        >
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-1 flex-1 min-w-0">
                                {c.name}
                            </span>
                            <SeverityBadge severity={c.severity} />
                        </Link>
                    ))}
                </div>

                {/* Load More / Collapse buttons */}
                {hasMore && (
                    <div className="mt-4 flex gap-2">
                        {!isExpanded ? (
                            <button
                                onClick={handleToggle}
                                className="flex-1 py-2.5 text-center text-sm font-semibold text-teal-400 hover:text-teal-300 bg-teal-500/5 hover:bg-teal-500/10 rounded-xl border border-teal-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                Show All {filteredConditions.length.toLocaleString()} Conditions
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        ) : (
                            <>
                                {canLoadMore && (
                                    <button
                                        onClick={handleLoadMore}
                                        className="flex-1 py-2.5 text-center text-sm font-semibold text-teal-400 hover:text-teal-300 bg-teal-500/5 hover:bg-teal-500/10 rounded-xl border border-teal-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        Load More ({filteredConditions.length - visibleCount} remaining)
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={handleToggle}
                                    className="px-4 py-2.5 text-center text-sm font-semibold text-slate-400 hover:text-slate-300 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
                                >
                                    Collapse
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ─── Main Explorer ────────────────────────────────────────── */

export default function ConditionsExplorer({
    categories,
    totalCount,
    country,
    lang,
}: {
    categories: SpecialtyGroup[];
    totalCount: number;
    country?: string | null;
    lang?: string;
}) {
    // Build the URL prefix based on detected region
    const urlPrefix = country ? `/${country}/${lang || 'en'}` : '/india/en';
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSeverities, setActiveSeverities] = useState<Set<SeverityLevel>>(
        new Set(['mild', 'moderate', 'severe', 'critical', 'variable'])
    );
    const [visibleSpecialties, setVisibleSpecialties] = useState(MAX_SPECIALTIES_SHOWN);
    const [showFilters, setShowFilters] = useState(false);

    const toggleSeverity = useCallback((sev: SeverityLevel) => {
        setActiveSeverities(prev => {
            const next = new Set(prev);
            if (next.has(sev)) {
                if (next.size > 1) next.delete(sev);
            } else {
                next.add(sev);
            }
            return next;
        });
    }, []);

    const selectAllSeverities = useCallback(() => {
        setActiveSeverities(new Set(['mild', 'moderate', 'severe', 'critical', 'variable']));
    }, []);

    const filteredCategories = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return categories
            .map(cat => {
                let conditions = cat.conditions.filter(c => activeSeverities.has(c.severity));
                if (q) {
                    conditions = conditions.filter(c =>
                        c.name.toLowerCase().includes(q) ||
                        cat.specialty.toLowerCase().includes(q)
                    );
                }
                return { ...cat, conditions };
            })
            .filter(cat => cat.conditions.length > 0);
    }, [categories, searchQuery, activeSeverities]);

    const totalFiltered = filteredCategories.reduce((sum, c) => sum + c.conditions.length, 0);

    // Paginated specialties for lazy loading
    const visibleCategories = filteredCategories.slice(0, visibleSpecialties);
    const hasMoreSpecialties = visibleSpecialties < filteredCategories.length;

    // Load more specialties on scroll near bottom
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMoreSpecialties) {
                    setVisibleSpecialties(prev => Math.min(prev + MAX_SPECIALTIES_SHOWN, filteredCategories.length));
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMoreSpecialties, filteredCategories.length]);

    // Reset visible specialties when search changes
    useEffect(() => {
        setVisibleSpecialties(MAX_SPECIALTIES_SHOWN);
    }, [searchQuery, activeSeverities]);

    // Calculate severity counts across all conditions
    const globalSevCounts = useMemo(() => {
        const counts: Record<SeverityLevel, number> = {
            mild: 0,
            moderate: 0,
            severe: 0,
            critical: 0,
            variable: 0,
        };
        categories.forEach(cat => {
            cat.conditions.forEach(c => {
                counts[c.severity]++;
            });
        });
        return counts;
    }, [categories]);

    // Empty state when no categories data
    if (!categories || categories.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Conditions Available</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Medical conditions data is currently being loaded or is not available for this region.
                </p>
                <Link
                    href="/conditions"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500/10 text-teal-400 font-semibold rounded-xl border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
                >
                    Browse All Conditions
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                    {filteredCategories.length} Specialties &bull; {totalFiltered.toLocaleString()} Conditions
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showFilters
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:text-white'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeSeverities.size < 5 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-teal-500 text-slate-900 rounded">
                            {activeSeverities.size}
                        </span>
                    )}
                </button>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder={`Search ${totalCount.toLocaleString()} conditions...`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Severity Filters */}
            {showFilters && (
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Filter by Severity</h3>
                        <button
                            onClick={selectAllSeverities}
                            className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                        >
                            Select All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {(Object.keys(SEVERITY_CONFIG) as SeverityLevel[]).map(sev => {
                            const cfg = SEVERITY_CONFIG[sev];
                            const isActive = activeSeverities.has(sev);
                            const count = globalSevCounts[sev];

                            return (
                                <button
                                    key={sev}
                                    onClick={() => toggleSeverity(sev)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${isActive
                                        ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-lg`
                                        : 'bg-slate-900/30 border-white/5 text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${isActive ? cfg.dot : 'bg-slate-600'}`} />
                                    {cfg.label}
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/10' : 'bg-white/5'}`}>
                                        {count.toLocaleString()}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No Results */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <Search className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No conditions found</h3>
                    <p className="text-slate-400 mb-6">
                        Try adjusting your search or filters
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            selectAllSeverities();
                        }}
                        className="px-6 py-2 bg-teal-500/10 text-teal-400 font-semibold rounded-xl border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Specialty Accordion */}
            <div className="space-y-4">
                {visibleCategories.map(category => (
                    <SpecialtyCard
                        key={category.specialty}
                        category={category}
                        activeSeverities={activeSeverities}
                        urlPrefix={urlPrefix}
                    />
                ))}
            </div>

            {/* Load More Trigger / Loading Indicator */}
            {hasMoreSpecialties && (
                <div ref={loadMoreRef} className="py-8 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900/40 rounded-xl border border-white/5">
                        <div className="animate-spin w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                        <span className="text-sm text-slate-400">
                            Loading more specialties... ({filteredCategories.length - visibleSpecialties} remaining)
                        </span>
                    </div>
                </div>
            )}

            {/* All Loaded */}
            {!hasMoreSpecialties && filteredCategories.length > 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                    Showing all {filteredCategories.length} specialties
                </div>
            )}
        </>
    );
}
