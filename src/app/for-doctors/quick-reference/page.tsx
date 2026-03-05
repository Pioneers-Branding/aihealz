'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface ReferenceCard {
    id: string;
    name: string;
    category: string;
    icon: string;
    items?: Array<{ score?: string; term?: string; description?: string }>;
    steps?: Array<{ step: number; name: string; question?: string; yes?: string; no?: string; threshold?: string; questions?: string[] }>;
    drugs?: Array<{ name: string; indication: string; dose: string; notes?: string }>;
    antidotes?: Array<{ toxin: string; antidote: string; dose: string; notes?: string }>;
    antibiotics?: Array<{ name: string; spectrum: string; covers: string[]; gaps: string[]; note?: string }>;
    modes?: Array<{ name: string; settings: Record<string, string>; targets?: Record<string, string>; use?: string }>;
    scales?: Array<{ name: string; range: string; description?: string; use?: string; interpretation?: Array<{ range: string; level: string }> | string; components?: Array<{ domain: string; scores?: string[]; range?: string }> }>;
    products?: Array<{ product: string; thresholds: Array<{ population?: string; indication?: string; threshold?: string; dose?: string; target?: string }>; dose?: string; notes?: string; content?: string }>;
    protocol?: { initiation: Array<{ glucose?: string; action?: string; starting_rate?: string }>; adjustments: Array<{ bg_range: string; action: string }>; monitoring: string };
    target?: string;
    note?: string;
    notes?: string;
    ibw_formula?: string;
    ards_protocol?: { name: string; vt: string; plateau_goal: string; peep_fio2_table: string; ph_management: string };
}

interface ReferenceData {
    cards: ReferenceCard[];
}

const CATEGORIES = [
    { id: 'all', name: 'All', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'Sedation', name: 'Sedation', iconPath: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
    { id: 'Emergency', name: 'Emergency', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'Toxicology', name: 'Toxicology', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'Infectious Disease', name: 'ID', iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'Critical Care', name: 'ICU', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { id: 'Assessment', name: 'Assessment', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'Hematology', name: 'Hematology', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'Endocrine', name: 'Endocrine', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
];

export default function QuickReferencePage() {
    const [data, setData] = useState<ReferenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/data/clinical-reference.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredCards = useMemo(() => {
        if (!data) return [];
        let cards = data.cards;
        if (selectedCategory !== 'all') {
            cards = cards.filter(c => c.category === selectedCategory);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            cards = cards.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                JSON.stringify(c).toLowerCase().includes(q)
            );
        }
        return cards;
    }, [data, selectedCategory, searchQuery]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-purple-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/for-doctors" className="hover:text-cyan-400 transition-colors">For Doctors</Link>
                    <span>/</span>
                    <span className="text-slate-300">Quick Reference</span>
                </nav>

                {/* Header */}
                <div className="mb-8 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Clinical Reference
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
                        Quick Reference Cards
                    </h1>
                    <p className="text-slate-400">
                        Essential clinical references: scales, protocols, drug guides, and more.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto mb-6">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search references..."
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                                selectedCategory === cat.id
                                    ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                                    : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.iconPath} />
                            </svg>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                    {filteredCards.map(card => (
                        <div
                            key={card.id}
                            className={`bg-slate-900/60 border rounded-2xl overflow-hidden transition-all ${
                                expandedCard === card.id ? 'border-purple-500/40' : 'border-white/5'
                            }`}
                        >
                            <button
                                onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{card.icon}</span>
                                    <div>
                                        <div className="font-bold text-white">{card.name}</div>
                                        <div className="text-xs text-slate-500">{card.category}</div>
                                    </div>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-500 transition-transform ${expandedCard === card.id ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {expandedCard === card.id && (
                                <div className="p-4 pt-0 border-t border-white/5">
                                    {/* RASS Scale */}
                                    {card.items && (
                                        <div className="space-y-2">
                                            {card.items.map((item, i) => (
                                                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/30">
                                                    <span className={`font-mono font-bold w-10 text-center ${
                                                        (item.score?.startsWith('+') || item.score === '0') ? 'text-amber-400' : 'text-cyan-400'
                                                    }`}>
                                                        {item.score}
                                                    </span>
                                                    <div>
                                                        <div className="font-medium text-white">{item.term}</div>
                                                        <div className="text-sm text-slate-400">{item.description}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {card.target && (
                                                <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                                                    {card.target}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* CAM-ICU Steps */}
                                    {card.steps && (
                                        <div className="space-y-3">
                                            {card.steps.map((step, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-slate-800/30">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center font-bold">
                                                            {step.step}
                                                        </span>
                                                        <span className="font-bold text-white">{step.name}</span>
                                                    </div>
                                                    {step.question && <p className="text-sm text-slate-300 mb-2">{step.question}</p>}
                                                    {step.questions && (
                                                        <ul className="text-sm text-slate-400 space-y-1 mb-2">
                                                            {step.questions.map((q, j) => <li key={j}>• {q}</li>)}
                                                        </ul>
                                                    )}
                                                    {step.threshold && <div className="text-xs text-amber-400 mb-2">Threshold: {step.threshold}</div>}
                                                    <div className="flex gap-4 text-xs">
                                                        {step.yes && <span className="text-emerald-400">Yes → {step.yes}</span>}
                                                        {step.no && <span className="text-red-400">No → {step.no}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ACLS Drugs */}
                                    {card.drugs && (
                                        <div className="space-y-2">
                                            {card.drugs.map((drug, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-slate-800/30">
                                                    <div className="flex items-start justify-between">
                                                        <div className="font-bold text-white">{drug.name}</div>
                                                        <span className="text-xs text-amber-400">{drug.indication}</span>
                                                    </div>
                                                    <div className="text-cyan-400 font-mono text-sm mt-1">{drug.dose}</div>
                                                    {drug.notes && <div className="text-xs text-slate-500 mt-1">{drug.notes}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Antidotes */}
                                    {card.antidotes && (
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {card.antidotes.map((ant, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-slate-800/30">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-red-400 font-medium">{ant.toxin}</span>
                                                        <span className="text-slate-500">→</span>
                                                        <span className="text-emerald-400 font-medium">{ant.antidote}</span>
                                                    </div>
                                                    <div className="text-cyan-400 font-mono text-sm">{ant.dose}</div>
                                                    {ant.notes && <div className="text-xs text-slate-500 mt-1">{ant.notes}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Antibiotic Spectrum */}
                                    {card.antibiotics && (
                                        <div className="space-y-3">
                                            {card.antibiotics.map((abx, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-slate-800/30">
                                                    <div className="font-bold text-white mb-1">{abx.name}</div>
                                                    <div className="text-xs text-purple-400 mb-2">{abx.spectrum}</div>
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {abx.covers.map((c, j) => (
                                                            <span key={j} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded">
                                                                {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Gaps: {abx.gaps.join(', ')}
                                                    </div>
                                                    {abx.note && <div className="text-xs text-amber-400 mt-1">{abx.note}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Vent Settings */}
                                    {card.modes && (
                                        <div className="space-y-4">
                                            {card.modes.map((mode, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-slate-800/30">
                                                    <div className="font-bold text-white mb-2">{mode.name}</div>
                                                    <div className="space-y-1">
                                                        {Object.entries(mode.settings).map(([key, val]) => (
                                                            <div key={key} className="flex justify-between text-sm">
                                                                <span className="text-slate-400">{key}:</span>
                                                                <span className="text-cyan-400 font-mono">{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {mode.targets && (
                                                        <div className="mt-2 pt-2 border-t border-white/5">
                                                            <div className="text-xs text-slate-500 mb-1">Targets:</div>
                                                            {Object.entries(mode.targets).map(([key, val]) => (
                                                                <div key={key} className="text-xs text-emerald-400">
                                                                    {key}: {val}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {card.ibw_formula && (
                                                <div className="p-2 bg-amber-500/10 rounded text-xs text-amber-300">
                                                    IBW: {card.ibw_formula}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Pain Scales */}
                                    {card.scales && (
                                        <div className="space-y-4">
                                            {card.scales.map((scale, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-slate-800/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-white">{scale.name}</span>
                                                        <span className="text-xs text-purple-400">Range: {scale.range}</span>
                                                    </div>
                                                    {scale.description && <p className="text-sm text-slate-400 mb-2">{scale.description}</p>}
                                                    {scale.use && <p className="text-xs text-cyan-400 mb-2">Use: {scale.use}</p>}
                                                    {scale.interpretation && Array.isArray(scale.interpretation) && (
                                                        <div className="space-y-1">
                                                            {scale.interpretation.map((int, j) => (
                                                                <div key={j} className="flex justify-between text-sm">
                                                                    <span className="text-slate-500">{int.range}</span>
                                                                    <span className="text-white">{int.level}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {typeof scale.interpretation === 'string' && (
                                                        <div className="text-sm text-emerald-400">{scale.interpretation}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Transfusion Products */}
                                    {card.products && (
                                        <div className="space-y-4">
                                            {card.products.map((prod, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-slate-800/30">
                                                    <div className="font-bold text-white mb-2">{prod.product}</div>
                                                    <div className="space-y-2">
                                                        {prod.thresholds.map((t, j) => (
                                                            <div key={j} className="text-sm">
                                                                <span className="text-slate-400">{t.population || t.indication}: </span>
                                                                <span className="text-cyan-400">{t.threshold || t.dose}</span>
                                                                {t.target && <span className="text-emerald-400"> → {t.target}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {prod.dose && <div className="text-xs text-amber-400 mt-2">{prod.dose}</div>}
                                                    {prod.notes && <div className="text-xs text-slate-500 mt-1">{prod.notes}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Insulin Protocol */}
                                    {card.protocol && (
                                        <div className="space-y-3">
                                            <div className="p-2 bg-emerald-500/10 rounded text-sm text-emerald-400">
                                                Target: {card.target}
                                            </div>
                                            <div className="text-sm font-medium text-white">Adjustments:</div>
                                            <div className="space-y-1">
                                                {card.protocol.adjustments.map((adj, i) => (
                                                    <div key={i} className="flex justify-between text-sm p-2 rounded bg-slate-800/50">
                                                        <span className="text-slate-400">BG {adj.bg_range}</span>
                                                        <span className="text-cyan-400">{adj.action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-slate-500">{card.protocol.monitoring}</div>
                                        </div>
                                    )}

                                    {card.notes && (
                                        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-sm text-slate-400">
                                            {card.notes}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredCards.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="text-xl font-bold text-white mb-2">No references found</div>
                        <div className="text-slate-400">Try a different search or category</div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-400 mb-1">Clinical Reference Only</h3>
                            <p className="text-sm text-slate-400">
                                These references are intended as quick guides for trained medical professionals.
                                Always verify information with institutional protocols and current guidelines.
                                Clinical judgment should guide all patient care decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
