'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface Term {
    term: string;
    pronunciation: string;
    category: string;
    definition: string;
    related: string[];
}

interface GlossaryData {
    categories: Category[];
    terms: Term[];
}

export default function GlossaryPage() {
    const [data, setData] = useState<GlossaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedLetter, setSelectedLetter] = useState<string>('all');
    const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/medical-glossary.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const filteredTerms = useMemo(() => {
        if (!data) return [];
        return data.terms.filter(term => {
            const matchesSearch = !searchQuery ||
                term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
            const matchesLetter = selectedLetter === 'all' ||
                term.term.toUpperCase().startsWith(selectedLetter);
            return matchesSearch && matchesCategory && matchesLetter;
        });
    }, [data, searchQuery, selectedCategory, selectedLetter]);

    const termsByLetter = useMemo(() => {
        const grouped: Record<string, Term[]> = {};
        filteredTerms.forEach(term => {
            const letter = term.term[0].toUpperCase();
            if (!grouped[letter]) grouped[letter] = [];
            grouped[letter].push(term);
        });
        return grouped;
    }, [filteredTerms]);

    const getCategoryInfo = (categoryId: string) => {
        return data?.categories.find(c => c.id === categoryId);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-violet-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/tools" className="hover:text-cyan-400 transition-colors">Tools</Link>
                    <span>/</span>
                    <span className="text-slate-300">Medical Glossary</span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                        Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-500">Glossary</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                        Understand medical terminology with our comprehensive glossary.
                        {data && ` ${data.terms.length} terms across ${data.categories.length} categories.`}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search medical terms..."
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Category Filter */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Filter by Category</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                                        : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                }`}
                            >
                                All
                            </button>
                            {data?.categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                                            : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                    }`}
                                >
                                    <span className="mr-1">{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alphabet Filter */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Jump to Letter</h3>
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => setSelectedLetter('all')}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                    selectedLetter === 'all'
                                        ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                                        : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                }`}
                            >
                                All
                            </button>
                            {alphabet.map(letter => (
                                <button
                                    key={letter}
                                    onClick={() => setSelectedLetter(letter)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                        selectedLetter === letter
                                            ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                                            : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                    }`}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 text-sm text-slate-400">
                    Showing {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''}
                    {searchQuery && ` matching "${searchQuery}"`}
                </div>

                {/* Terms List */}
                <div className="space-y-8">
                    {Object.keys(termsByLetter).sort().map(letter => (
                        <div key={letter} id={`letter-${letter}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-3xl font-black text-violet-400">{letter}</span>
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-sm text-slate-500">{termsByLetter[letter].length} terms</span>
                            </div>
                            <div className="space-y-3">
                                {termsByLetter[letter].map(term => {
                                    const category = getCategoryInfo(term.category);
                                    const isExpanded = expandedTerm === term.term;
                                    return (
                                        <div
                                            key={term.term}
                                            className={`bg-slate-900/60 border rounded-xl overflow-hidden transition-all ${
                                                isExpanded ? 'border-violet-500/40' : 'border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <button
                                                onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                                                className="w-full p-4 text-left flex items-start justify-between gap-4"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-lg font-bold text-white">{term.term}</h3>
                                                        {category && (
                                                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                                                                {category.icon} {category.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-violet-400 italic mb-2">{term.pronunciation}</div>
                                                    <p className={`text-slate-400 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                        {term.definition}
                                                    </p>
                                                </div>
                                                <svg
                                                    className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isExpanded && term.related.length > 0 && (
                                                <div className="px-4 pb-4 pt-0">
                                                    <div className="border-t border-white/5 pt-4">
                                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Related Terms</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {term.related.map(r => (
                                                                <button
                                                                    key={r}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSearchQuery(r);
                                                                        setSelectedCategory('all');
                                                                        setSelectedLetter('all');
                                                                    }}
                                                                    className="px-3 py-1 bg-violet-500/10 text-violet-400 text-sm rounded-lg hover:bg-violet-500/20 transition-colors"
                                                                >
                                                                    {r}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTerms.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 mx-auto mb-4 bg-violet-500/10 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="text-xl font-bold text-white mb-2">No terms found</div>
                        <div className="text-slate-400">Try adjusting your search or filters</div>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-16 grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Easy to Understand</h3>
                        <p className="text-sm text-slate-400">
                            All definitions are written in plain language to help patients understand medical terminology.
                        </p>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Pronunciation Guides</h3>
                        <p className="text-sm text-slate-400">
                            Each term includes a phonetic pronunciation to help you say medical words correctly.
                        </p>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Related Terms</h3>
                        <p className="text-sm text-slate-400">
                            Discover connected concepts with our related terms feature for deeper understanding.
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-6 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-violet-400 mb-1">Educational Information</h3>
                            <p className="text-sm text-slate-400">
                                This glossary is for educational purposes only and should not be used for self-diagnosis.
                                Always consult with healthcare professionals for medical advice.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
