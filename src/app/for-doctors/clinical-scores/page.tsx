'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface FieldOption {
    label: string;
    value: number;
}

interface ScoreField {
    key: string;
    label: string;
    type: 'checkbox' | 'select' | 'number';
    points?: number;
    options?: FieldOption[];
    min?: number;
    max?: number;
}

interface Interpretation {
    range: [number, number];
    risk: string;
    probability?: string;
    action: string;
}

interface ClinicalScore {
    id: string;
    name: string;
    category: string;
    description: string;
    reference: string;
    fields: ScoreField[];
    formula?: string;
    interpretation: Interpretation[];
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface ScoresData {
    categories: Category[];
    scores: ClinicalScore[];
}

export default function ClinicalScoresPage() {
    const [data, setData] = useState<ScoresData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedScore, setSelectedScore] = useState<string | null>(null);
    const [values, setValues] = useState<Record<string, number | boolean>>({});
    const [result, setResult] = useState<{ score: number; interpretation: Interpretation } | null>(null);

    useEffect(() => {
        fetch('/data/clinical-scores.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredScores = useMemo(() => {
        if (!data) return [];
        if (selectedCategory === 'all') return data.scores;
        return data.scores.filter(s => s.category === selectedCategory);
    }, [data, selectedCategory]);

    const currentScore = data?.scores.find(s => s.id === selectedScore);

    const calculateScore = () => {
        if (!currentScore) return;

        let total = 0;

        // Special calculations for specific scores
        if (currentScore.id === 'meld') {
            const cr = Math.max(1, Math.min(4, Number(values.creatinine) || 1));
            const bili = Math.max(1, Number(values.bilirubin) || 1);
            const inr = Math.max(1, Number(values.inr) || 1);
            const dialysis = values.dialysis ? 4 : cr;

            total = Math.round(10 * (
                0.957 * Math.log(dialysis) +
                0.378 * Math.log(bili) +
                1.120 * Math.log(inr) +
                0.643
            ));
            total = Math.max(6, Math.min(40, total));
        } else if (currentScore.id === 'parkland') {
            const weight = Number(values.weight) || 0;
            const tbsa = Number(values.tbsa) || 0;
            total = Math.round(4 * weight * tbsa);
        } else if (currentScore.id === 'egfr') {
            const cr = Number(values.creatinine) || 1;
            const age = Number(values.age) || 40;
            const isFemale = values.female as boolean;
            const k = isFemale ? 0.7 : 0.9;
            const alpha = isFemale ? -0.329 : -0.411;
            total = Math.round(141 * Math.pow(Math.min(cr / k, 1), alpha) * Math.pow(Math.max(cr / k, 1), -1.209) * Math.pow(0.993, age) * (isFemale ? 1.018 : 1));
        } else if (currentScore.id === 'corrected_calcium') {
            const ca = Number(values.calcium) || 9;
            const alb = Number(values.albumin) || 4;
            total = Math.round((ca + 0.8 * (4 - alb)) * 10) / 10;
        } else if (currentScore.id === 'anion_gap') {
            const na = Number(values.sodium) || 140;
            const cl = Number(values.chloride) || 100;
            const hco3 = Number(values.bicarb) || 24;
            const alb = Number(values.albumin) || 4;
            const ag = na - (cl + hco3);
            total = Math.round(ag + 2.5 * (4 - alb));
        } else if (currentScore.id === 'gcs') {
            total = (Number(values.eye) || 1) + (Number(values.verbal) || 1) + (Number(values.motor) || 1);
        } else if (currentScore.id === 'nihss') {
            currentScore.fields.forEach(field => {
                total += Number(values[field.key]) || 0;
            });
        } else {
            // Standard checkbox/select scoring
            currentScore.fields.forEach(field => {
                if (field.type === 'checkbox' && values[field.key]) {
                    total += field.points || 0;
                } else if (field.type === 'select' && values[field.key] !== undefined) {
                    total += Number(values[field.key]) || 0;
                } else if (field.type === 'number' && field.key === 'gcs') {
                    total += Number(values[field.key]) || 0;
                }
            });
        }

        // Find interpretation
        const interp = currentScore.interpretation.find(i => total >= i.range[0] && total <= i.range[1])
            || currentScore.interpretation[currentScore.interpretation.length - 1];

        setResult({ score: total, interpretation: interp });
    };

    const handleSelectScore = (id: string) => {
        setSelectedScore(id);
        setValues({});
        setResult(null);
    };

    const handleReset = () => {
        setValues({});
        setResult(null);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/for-doctors" className="hover:text-cyan-400 transition-colors">For Doctors</Link>
                    <span>/</span>
                    <span className="text-slate-300">Clinical Scores</span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        For Medical Professionals
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                        Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500">Scoring Tools</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                        Evidence-based clinical calculators for risk stratification, prognosis, and treatment decisions.
                        {data && ` ${data.scores.length} validated scoring systems.`}
                    </p>
                </div>

                {/* Category Filter */}
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 mb-8 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                selectedCategory === 'all'
                                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                                    : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                            }`}
                        >
                            All Scores
                        </button>
                        {data?.categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    selectedCategory === cat.id
                                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                                        : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                }`}
                            >
                                <span className="mr-1.5">{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Score List */}
                    <div className="lg:col-span-1 space-y-2 max-h-[800px] overflow-y-auto pr-2">
                        {filteredScores.map(score => {
                            const cat = data?.categories.find(c => c.id === score.category);
                            return (
                                <button
                                    key={score.id}
                                    onClick={() => handleSelectScore(score.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                        selectedScore === score.id
                                            ? 'bg-blue-500/20 border-blue-500/40'
                                            : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">{cat?.icon}</span>
                                        <div>
                                            <div className="font-bold text-white text-sm">{score.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{score.description}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Calculator Panel */}
                    <div className="lg:col-span-2">
                        {!currentScore ? (
                            <div className="bg-slate-900/60 border border-dashed border-white/10 rounded-2xl p-16 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Select a Clinical Score</h3>
                                <p className="text-slate-500 text-sm">Choose a scoring system from the list to begin calculation.</p>
                            </div>
                        ) : (
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                                {/* Score Header */}
                                <div className="p-6 border-b border-white/5">
                                    <h2 className="text-xl font-bold text-white">{currentScore.name}</h2>
                                    <p className="text-sm text-slate-400 mt-1">{currentScore.description}</p>
                                    <p className="text-xs text-slate-500 mt-2">Reference: {currentScore.reference}</p>
                                    {currentScore.formula && (
                                        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                                            <span className="text-xs text-cyan-400 font-mono">{currentScore.formula}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Fields */}
                                <div className="p-6 space-y-4">
                                    {currentScore.fields.map(field => (
                                        <div key={field.key}>
                                            {field.type === 'checkbox' ? (
                                                <label className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!values[field.key]}
                                                        onChange={e => setValues(v => ({ ...v, [field.key]: e.target.checked }))}
                                                        className="mt-0.5 w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <span className="text-white text-sm">{field.label}</span>
                                                        {field.points !== undefined && (
                                                            <span className="ml-2 text-xs text-slate-500">
                                                                ({field.points > 0 ? '+' : ''}{field.points} pts)
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                            ) : field.type === 'select' ? (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                                        {field.label}
                                                    </label>
                                                    <select
                                                        value={values[field.key] as number ?? ''}
                                                        onChange={e => setValues(v => ({ ...v, [field.key]: Number(e.target.value) }))}
                                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    >
                                                        <option value="">Select...</option>
                                                        {field.options?.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label} ({opt.value} pts)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={values[field.key] as number ?? ''}
                                                        onChange={e => setValues(v => ({ ...v, [field.key]: parseFloat(e.target.value) }))}
                                                        min={field.min}
                                                        max={field.max}
                                                        step="any"
                                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={calculateScore}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                                        >
                                            Calculate Score
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-400 font-medium hover:bg-slate-700 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Result */}
                                {result && (
                                    <div className="p-6 border-t border-white/5 bg-slate-800/30">
                                        <div className="text-center mb-6">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score Result</p>
                                            <p className="text-5xl font-black text-white mb-2">
                                                {currentScore.id === 'parkland' ? `${(result.score / 1000).toFixed(1)}L` : result.score}
                                            </p>
                                            {currentScore.id === 'parkland' && (
                                                <p className="text-sm text-slate-400">
                                                    First 8h: {(result.score / 2 / 1000).toFixed(1)}L | Next 16h: {(result.score / 2 / 1000).toFixed(1)}L
                                                </p>
                                            )}
                                        </div>

                                        <div className={`p-4 rounded-xl ${
                                            result.interpretation.risk.includes('Low') ? 'bg-emerald-500/10 border border-emerald-500/30' :
                                            result.interpretation.risk.includes('High') || result.interpretation.risk.includes('Severe') ? 'bg-red-500/10 border border-red-500/30' :
                                            'bg-amber-500/10 border border-amber-500/30'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-bold ${
                                                    result.interpretation.risk.includes('Low') ? 'text-emerald-400' :
                                                    result.interpretation.risk.includes('High') || result.interpretation.risk.includes('Severe') ? 'text-red-400' :
                                                    'text-amber-400'
                                                }`}>
                                                    {result.interpretation.risk}
                                                </span>
                                                {result.interpretation.probability && (
                                                    <span className="text-sm text-slate-400">{result.interpretation.probability}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-300">{result.interpretation.action}</p>
                                        </div>

                                        {/* Interpretation Table */}
                                        <div className="mt-6">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Score Interpretation</p>
                                            <div className="space-y-2">
                                                {currentScore.interpretation.map((interp, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center gap-4 p-2 rounded-lg text-sm ${
                                                            result.score >= interp.range[0] && result.score <= interp.range[1]
                                                                ? 'bg-blue-500/10 border border-blue-500/30'
                                                                : 'bg-slate-800/30'
                                                        }`}
                                                    >
                                                        <span className="text-slate-500 w-16">{interp.range[0]}-{interp.range[1]}</span>
                                                        <span className="text-white font-medium flex-1">{interp.risk}</span>
                                                        {interp.probability && (
                                                            <span className="text-slate-400 text-xs">{interp.probability}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-400 mb-1">Clinical Decision Support Tool</h3>
                            <p className="text-sm text-slate-400">
                                These calculators are intended for use by medical professionals as clinical decision support tools.
                                They should not replace clinical judgment. Always consider the full clinical context when making treatment decisions.
                                Verify calculations independently for critical decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
