'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    type: 'condition' | 'treatment' | 'specialty' | 'tool' | 'symptom' | 'test';
    slug: string;
    name: string;
    subtitle: string;
    url: string;
    icon?: string;
    matchedSymptom?: string;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    condition: { bg: 'bg-teal-500/20', text: 'text-teal-400', label: 'Condition' },
    treatment: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Treatment' },
    specialty: { bg: 'bg-violet-500/20', text: 'text-violet-400', label: 'Specialty' },
    tool: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Tool' },
    symptom: { bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'Matching Symptom' },
    test: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Lab Test' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
    condition: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    treatment: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    specialty: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    tool: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    symptom: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    test: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
};

interface SearchAutocompleteProps {
    className?: string;
    variant?: 'light' | 'dark';
    placeholder?: string;
    typeFilter?: 'condition' | 'treatment' | 'specialty' | 'tool' | 'test'; // Filter search to specific type
}

export default function SearchAutocomplete({
    className = '',
    variant = 'dark',
    placeholder = 'Search conditions, symptoms, treatments...',
    typeFilter,
}: SearchAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetchResults = useCallback(async (q: string) => {
        if (q.length < 2) { setResults([]); setIsOpen(false); return; }
        setIsLoading(true);
        try {
            const typeParam = typeFilter ? `&type=${typeFilter}` : '';
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}${typeParam}`);
            const data: SearchResult[] = await res.json();
            setResults(data);
            setIsOpen(data.length > 0);
            setActiveIdx(-1);
        } catch { setResults([]); }
        setIsLoading(false);
    }, [typeFilter]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchResults(query), 250);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, fetchResults]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navigate = (url: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(url);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); navigate(results[activeIdx].url); }
        else if (e.key === 'Escape') setIsOpen(false);
    };

    // Group results by type for section headers
    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    let flatIdx = 0;

    // Dark variant styles (for homepage)
    const isDark = variant === 'dark';

    const inputWrapperClasses = isDark
        ? 'bg-slate-800/60 backdrop-blur-xl border border-white/10 hover:border-white/20 focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20'
        : 'bg-white border border-slate-200 hover:border-slate-300 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400/20';

    const inputClasses = isDark
        ? 'text-white placeholder:text-slate-400'
        : 'text-slate-900 placeholder:text-slate-400';

    const iconClasses = isDark
        ? 'text-teal-500'
        : 'text-slate-400';

    const dropdownClasses = isDark
        ? 'bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50'
        : 'bg-white border border-slate-200 shadow-2xl';

    const sectionHeaderClasses = isDark
        ? 'bg-slate-800/50 border-b border-white/5 text-slate-500'
        : 'bg-slate-50 border-b border-slate-100 text-slate-400';

    const itemClasses = isDark
        ? 'hover:bg-white/5 border-b border-white/5'
        : 'hover:bg-slate-50 border-b border-slate-100';

    const itemActiveClasses = isDark
        ? 'bg-teal-500/10'
        : 'bg-primary-50';

    const itemTextClasses = isDark
        ? 'text-white'
        : 'text-slate-900';

    const itemSubtitleClasses = isDark
        ? 'text-slate-400'
        : 'text-slate-500';

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className={`flex items-center rounded-xl overflow-hidden transition-all duration-200 ${inputWrapperClasses}`}>
                <svg className={`w-5 h-5 ml-4 shrink-0 ${iconClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className={`flex-1 py-4 px-4 bg-transparent outline-none font-medium text-sm ${inputClasses}`}
                />
                {isLoading && (
                    <div className="mr-4 animate-spin w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                )}
                {!isLoading && query.length > 0 && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
                        className={`mr-4 p-1 rounded-full hover:bg-white/10 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {isOpen && (
                <div className={`absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50 max-h-96 overflow-y-auto ${dropdownClasses}`}>
                    {Object.entries(grouped).map(([type, items]) => (
                        <div key={type}>
                            {/* Section header */}
                            <div className={`px-4 py-2 ${sectionHeaderClasses}`}>
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {TYPE_STYLES[type]?.label || type}
                                </span>
                            </div>
                            {items.map((r) => {
                                const idx = flatIdx++;
                                const style = TYPE_STYLES[r.type] || TYPE_STYLES.condition;
                                return (
                                    <button
                                        key={`${r.type}-${r.slug}`}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onClick={() => navigate(r.url)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors last:border-b-0
                                            ${itemClasses}
                                            ${idx === activeIdx ? itemActiveClasses : ''}
                                        `}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                                            {r.icon ? (
                                                <span className="text-base">{r.icon}</span>
                                            ) : (
                                                TYPE_ICONS[r.type] || TYPE_ICONS.condition
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${itemTextClasses}`}>{r.name}</p>
                                            <p className={`text-xs truncate ${itemSubtitleClasses}`}>{r.subtitle}</p>
                                        </div>
                                        <svg className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                    {/* No results message */}
                    {results.length === 0 && query.length >= 2 && !isLoading && (
                        <div className={`px-4 py-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <p className="text-sm">No results found for &quot;{query}&quot;</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
