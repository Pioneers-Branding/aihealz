'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// Common test name to slug mapping
const TEST_SLUGS: Record<string, string> = {
    'cbc': 'complete-blood-count',
    'complete blood count': 'complete-blood-count',
    'blood glucose': 'blood-glucose-fasting',
    'fasting blood sugar': 'blood-glucose-fasting',
    'hba1c': 'hba1c-glycated-hemoglobin',
    'lipid profile': 'lipid-profile',
    'cholesterol': 'lipid-profile',
    'thyroid profile': 'thyroid-profile',
    'thyroid function': 'thyroid-profile',
    'tsh': 'tsh',
    'liver function test': 'liver-function-test',
    'lft': 'liver-function-test',
    'kidney function test': 'kidney-function-test',
    'kft': 'kidney-function-test',
    'creatinine': 'creatinine',
    'urine test': 'urinalysis',
    'urinalysis': 'urinalysis',
    'ecg': 'ecg-electrocardiogram',
    'ekg': 'ecg-electrocardiogram',
    'electrocardiogram': 'ecg-electrocardiogram',
    'x-ray': 'x-ray',
    'ct scan': 'ct-scan',
    'mri': 'mri',
    'ultrasound': 'ultrasound',
    'vitamin d': 'vitamin-d',
    'vitamin b12': 'vitamin-b12',
    'iron studies': 'iron-studies',
    'hemoglobin': 'hemoglobin',
    'blood pressure': 'blood-pressure-monitoring',
    'blood test': 'complete-blood-count',
    'uric acid': 'uric-acid',
    'bilirubin': 'bilirubin',
    'albumin': 'albumin',
    'blood culture': 'blood-culture',
    'stool test': 'stool-examination',
    'covid test': 'covid-19-rt-pcr',
};

// Convert test name to URL slug
function getTestSlug(testName: string): string | null {
    const normalized = testName.toLowerCase().trim();
    // Direct match
    if (TEST_SLUGS[normalized]) return TEST_SLUGS[normalized];
    // Partial match
    for (const [key, slug] of Object.entries(TEST_SLUGS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return slug;
        }
    }
    return null;
}

interface ConditionResult {
    name: string;
    likelihood: number;
    explanation: string;
    tests: string[];
    urgency: string;
    slug?: string;
    url?: string;
    otc_remedies?: string[];
    home_care?: string[];
}

interface AnalysisResponse {
    symptoms: string[];
    analysis: ConditionResult[];
    disclaimer: string;
    model: string;
}

interface SymptomSuggestion {
    name: string;
    category: string;
}

export default function SymptomChecker() {
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<SymptomSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState('');
    const [activeIdx, setActiveIdx] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Autocomplete fetch — uses the dedicated symptoms endpoint
    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
        try {
            const res = await fetch(`/api/symptoms/suggest?q=${encodeURIComponent(q)}`);
            if (!res.ok) {
                setSuggestions([]);
                return;
            }
            const data = await res.json();
            // Validate response is an array
            if (!Array.isArray(data)) {
                setSuggestions([]);
                return;
            }
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
            setActiveIdx(-1);
        } catch {
            setSuggestions([]);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(inputValue), 200);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [inputValue, fetchSuggestions]);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addSymptom = (text: string) => {
        const trimmed = text.trim();
        if (trimmed && !symptoms.includes(trimmed)) {
            setSymptoms(prev => [...prev, trimmed]);
        }
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeSymptom = (idx: number) => {
        setSymptoms(prev => prev.filter((_, i) => i !== idx));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIdx >= 0 && suggestions[activeIdx]) {
                addSymptom(suggestions[activeIdx].name);
            } else if (inputValue.trim()) {
                addSymptom(inputValue);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Backspace' && !inputValue && symptoms.length > 0) {
            removeSymptom(symptoms.length - 1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const analyze = async () => {
        if (symptoms.length === 0) return;
        setIsAnalyzing(true);
        setError('');
        setResults(null);

        // Client-side timeout (35 seconds to give server timeout a chance first)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        try {
            const res = await fetch('/api/symptoms/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms, age: age || undefined, gender: gender || undefined }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            // Check response status BEFORE parsing to handle HTML error pages
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Analysis failed' }));
                throw new Error(errorData.error || 'Analysis failed');
            }
            const data = await res.json();
            // Validate response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response from server');
            }
            setResults(data);
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    setError('Analysis timed out. Please try again with fewer symptoms or try later.');
                } else {
                    setError(err.message || 'Something went wrong. Please try again.');
                }
            } else {
                setError('Something went wrong. Please try again.');
            }
        }
        setIsAnalyzing(false);
    };

    const urgencyColor = (u: string) => {
        switch (u) {
            case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
    };

    const likelihoodBar = (pct: number) => {
        const color = pct > 70 ? 'bg-red-500' : pct > 40 ? 'bg-amber-500' : 'bg-emerald-500';
        return <div className="h-2 rounded-full bg-surface-100 overflow-hidden"><div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} /></div>;
    };

    return (
        <div className="space-y-8">
            {/* ── Symptom Input Area ─────────────────────── */}
            <div className="bg-white rounded-3xl border border-surface-200 p-8 shadow-sm">
                <h2 className="text-lg font-extrabold text-surface-900 mb-1">Describe Your Symptoms</h2>
                <p className="text-sm text-surface-500 mb-6">Type a symptom and press Enter. Add as many as you're experiencing.</p>

                <div ref={wrapperRef} className="relative mb-6">
                    <div className="flex flex-wrap items-center gap-2 p-3 bg-surface-50 border border-surface-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all min-h-[56px]">
                        {symptoms.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold border border-primary-200">
                                {s}
                                <button onClick={() => removeSymptom(i)} className="hover:text-primary-900 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        ))}
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder={symptoms.length === 0 ? 'e.g. headache, nausea, chest pain...' : 'Add another symptom...'}
                            className="flex-1 min-w-[200px] py-1.5 bg-transparent outline-none text-surface-900 placeholder:text-surface-400 text-sm font-medium"
                        />
                    </div>

                    {/* Autocomplete dropdown */}
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <button
                                    key={`${s.name}-${i}`}
                                    onMouseEnter={() => setActiveIdx(i)}
                                    onClick={() => addSymptom(s.name)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-surface-50 last:border-0 text-sm
                                        ${i === activeIdx ? 'bg-primary-50' : 'hover:bg-surface-50'}
                                    `}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-surface-900">{s.name}</p>
                                        <p className="text-xs text-surface-500">{s.category}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Optional context */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5 block">Age Range (optional)</label>
                        <select value={age} onChange={e => setAge(e.target.value)} className="w-full py-2.5 px-4 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 outline-none focus:ring-2 focus:ring-primary-400">
                            <option value="">Select</option>
                            <option value="0-12">Child (0-12)</option>
                            <option value="13-17">Teen (13-17)</option>
                            <option value="18-30">Young Adult (18-30)</option>
                            <option value="31-50">Adult (31-50)</option>
                            <option value="51-65">Middle-aged (51-65)</option>
                            <option value="65+">Senior (65+)</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5 block">Gender (optional)</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full py-2.5 px-4 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 outline-none focus:ring-2 focus:ring-primary-400">
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Analyze Button */}
                <button
                    onClick={analyze}
                    disabled={symptoms.length === 0 || isAnalyzing}
                    className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-primary-600 to-accent-600 hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Analyze Symptoms ({symptoms.length} selected)
                        </>
                    )}
                </button>
            </div>

            {/* ── Error ──────────────────────────────────── */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-red-700 font-semibold">{error}</p>
                </div>
            )}

            {/* ── Analysis Loading State ─────────────────── */}
            {isAnalyzing && (
                <div className="bg-white rounded-3xl border border-surface-200 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-surface-900 mb-2">AI Engine Processing</h3>
                    <p className="text-surface-500">Cross-referencing symptoms against our medical database...</p>
                    <div className="mt-6 max-w-xs mx-auto">
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Results ────────────────────────────────── */}
            {results && (
                <div className="space-y-6">
                    {/* Disclaimer */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        <div>
                            <p className="text-sm font-bold text-amber-800 mb-1">Medical Disclaimer</p>
                            <p className="text-xs text-amber-700 leading-relaxed">{results.disclaimer}</p>
                        </div>
                    </div>

                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-extrabold text-surface-900">Possible Conditions</h2>
                        <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">{results.analysis.length} matches</span>
                    </div>

                    {/* Condition Cards */}
                    {results.analysis.map((cond, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-surface-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6 pb-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center text-lg font-black text-surface-400">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-surface-900">{cond.name}</h3>
                                            <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${urgencyColor(cond.urgency)}`}>
                                                {cond.urgency} urgency
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-2xl font-black text-surface-900">{cond.likelihood}%</span>
                                        <p className="text-[10px] text-surface-400 uppercase font-bold tracking-wider">likelihood</p>
                                    </div>
                                </div>

                                {likelihoodBar(cond.likelihood)}
                                <p className="text-sm text-surface-600 mt-4 leading-relaxed">{cond.explanation}</p>
                            </div>

                            {/* Tests */}
                            <div className="px-6 pb-4">
                                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Recommended Tests</p>
                                <div className="flex flex-wrap gap-2">
                                    {cond.tests.map((test, ti) => {
                                        const testSlug = getTestSlug(test);
                                        if (testSlug) {
                                            return (
                                                <Link
                                                    key={ti}
                                                    href={`/tests/${testSlug}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg text-xs font-semibold text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors group"
                                                >
                                                    <svg className="w-3 h-3 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                    </svg>
                                                    {test}
                                                    <svg className="w-3 h-3 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                            );
                                        }
                                        return (
                                            <span key={ti} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs font-semibold text-surface-700">
                                                <svg className="w-3 h-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" /></svg>
                                                {test}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Home Care & OTC */}
                            {((cond.otc_remedies?.length ?? 0) > 0 || (cond.home_care?.length ?? 0) > 0) && (
                                <div className="px-6 pb-5 pt-3 border-t border-surface-100 bg-emerald-50/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* OTC */}
                                        {cond.otc_remedies && cond.otc_remedies.length > 0 && (
                                            <div>
                                                <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                                                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                                    Safe OTC Options
                                                </h4>
                                                <ul className="space-y-2">
                                                    {cond.otc_remedies.map((remedy, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-surface-700 leading-snug">
                                                            <span className="text-emerald-500 mt-0.5 shrink-0">❖</span>
                                                            <span>{remedy}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {/* Home Care */}
                                        {cond.home_care && cond.home_care.length > 0 && (
                                            <div>
                                                <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                                                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                    Natural / Home Care
                                                </h4>
                                                <ul className="space-y-2">
                                                    {cond.home_care.map((care, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-surface-700 leading-snug">
                                                            <span className="text-emerald-500 mt-0.5 shrink-0">❖</span>
                                                            <span>{care}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-emerald-200/50 flex justify-end">
                                        <Link href={`/chat/consult?condition=${encodeURIComponent(cond.name)}`} className="text-xs font-bold text-emerald-800 bg-emerald-200/50 hover:bg-emerald-200 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                            Consult AI Care Bot for more details
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Link to condition page */}
                            {cond.url && (
                                <div className="border-t border-surface-100 px-6 py-3">
                                    <Link href={cond.url} className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-2 transition-colors">
                                        Read full condition guide →
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Reset Button */}
                    <button
                        onClick={() => { setResults(null); setSymptoms([]); setAge(''); setGender(''); }}
                        className="w-full py-3 rounded-2xl font-bold text-surface-600 bg-surface-100 hover:bg-surface-200 transition-colors border border-surface-200"
                    >
                        Start New Analysis
                    </button>
                </div>
            )}
        </div>
    );
}
