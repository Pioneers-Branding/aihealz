'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface RenalAdjustment {
    crcl_min: number;
    crcl_max: number;
    adjustment: string;
}

interface DrugCalculation {
    type: string;
    dose?: string;
    dose_per_kg?: number;
    unit?: string;
    frequency?: string;
    route?: string;
    label?: string;
    min_mcg_kg_min?: number;
    max_mcg_kg_min?: number;
    min_mcg_kg_hr?: number;
    max_mcg_kg_hr?: number;
    typical_start?: number;
}

interface Drug {
    id: string;
    name: string;
    category: string;
    class: string;
    standard_dose: string;
    loading_dose?: string;
    max_dose?: string;
    calculations: DrugCalculation[];
    renal_adjustments?: RenalAdjustment[];
    monitoring?: string;
    notes?: string;
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface DosingData {
    categories: Category[];
    drugs: Drug[];
}

export default function DrugDosingPage() {
    const [data, setData] = useState<DosingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
    const [weight, setWeight] = useState<number>(70);
    const [age, setAge] = useState<number>(50);
    const [scr, setScr] = useState<number>(1.0);
    const [sex, setSex] = useState<'male' | 'female'>('male');
    const [showCrCl, setShowCrCl] = useState(false);

    useEffect(() => {
        fetch('/data/drug-dosing.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredDrugs = useMemo(() => {
        if (!data) return [];
        if (selectedCategory === 'all') return data.drugs;
        return data.drugs.filter(d => d.category === selectedCategory);
    }, [data, selectedCategory]);

    const currentDrug = data?.drugs.find(d => d.id === selectedDrug);

    // Calculate CrCl using Cockcroft-Gault
    const crcl = useMemo(() => {
        const factor = sex === 'female' ? 0.85 : 1;
        return Math.round(((140 - age) * weight * factor) / (72 * scr));
    }, [age, weight, scr, sex]);

    // Get renal adjustment for current CrCl
    const renalAdjustment = useMemo(() => {
        if (!currentDrug?.renal_adjustments) return null;
        return currentDrug.renal_adjustments.find(
            adj => crcl >= adj.crcl_min && crcl <= adj.crcl_max
        );
    }, [currentDrug, crcl]);

    const calculateDose = (calc: DrugCalculation) => {
        if (calc.type === 'weight_based' && calc.dose_per_kg) {
            const dose = calc.dose_per_kg * weight;
            return `${dose.toFixed(0)} ${calc.unit || 'mg'} ${calc.frequency || ''} ${calc.route || ''}`;
        }
        if (calc.type === 'fixed') {
            return `${calc.dose} ${calc.frequency || ''} ${calc.route || ''}`;
        }
        if (calc.type === 'infusion_range') {
            if (calc.min_mcg_kg_min !== undefined) {
                const minRate = calc.min_mcg_kg_min * weight * 60;
                const maxRate = (calc.max_mcg_kg_min || 0) * weight * 60;
                return `${calc.min_mcg_kg_min}-${calc.max_mcg_kg_min} mcg/kg/min (${(minRate/1000).toFixed(1)}-${(maxRate/1000).toFixed(1)} mg/hr for ${weight}kg)`;
            }
            if (calc.min_mcg_kg_hr !== undefined) {
                const minRate = calc.min_mcg_kg_hr * weight;
                const maxRate = (calc.max_mcg_kg_hr || 0) * weight;
                return `${calc.min_mcg_kg_hr}-${calc.max_mcg_kg_hr} mcg/kg/hr (${minRate.toFixed(0)}-${maxRate.toFixed(0)} mcg/hr for ${weight}kg)`;
            }
        }
        return calc.dose || '';
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-cyan-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/for-doctors" className="hover:text-cyan-400 transition-colors">For Doctors</Link>
                    <span>/</span>
                    <span className="text-slate-300">Drug Dosing</span>
                </nav>

                {/* Header */}
                <div className="mb-8 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Clinical Calculator
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
                        Drug Dosing Calculator
                    </h1>
                    <p className="text-slate-400">
                        Weight-based dosing, renal adjustments, and infusion rate calculations.
                    </p>
                </div>

                {/* Patient Parameters */}
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">Patient Parameters</h3>
                        <button
                            onClick={() => setShowCrCl(!showCrCl)}
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            {showCrCl ? 'Hide' : 'Show'} CrCl Calculator
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Weight (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                        {showCrCl && (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age (years)</label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={e => setAge(Number(e.target.value))}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">SCr (mg/dL)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={scr}
                                        onChange={e => setScr(Number(e.target.value))}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sex</label>
                                    <select
                                        value={sex}
                                        onChange={e => setSex(e.target.value as 'male' | 'female')}
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                    {showCrCl && (
                        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-cyan-400">Creatinine Clearance (Cockcroft-Gault)</div>
                                    <div className="text-xs text-slate-500">CrCl = [(140-age) × weight × (0.85 if female)] / (72 × SCr)</div>
                                </div>
                                <div className="text-3xl font-bold text-white">{crcl} <span className="text-lg text-slate-400">mL/min</span></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedCategory === 'all'
                                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                                : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                        }`}
                    >
                        All Drugs
                    </button>
                    {data?.categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedCategory === cat.id
                                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                                    : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                            }`}
                        >
                            <span className="mr-1.5">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Drug List */}
                    <div className="lg:col-span-1 space-y-2 max-h-[700px] overflow-y-auto pr-2">
                        {filteredDrugs.map(drug => {
                            const cat = data?.categories.find(c => c.id === drug.category);
                            return (
                                <button
                                    key={drug.id}
                                    onClick={() => setSelectedDrug(drug.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                        selectedDrug === drug.id
                                            ? 'bg-cyan-500/20 border-cyan-500/40'
                                            : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{cat?.icon}</span>
                                        <div>
                                            <div className="font-bold text-white text-sm">{drug.name}</div>
                                            <div className="text-xs text-slate-500">{drug.class}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Drug Details */}
                    <div className="lg:col-span-2">
                        {!currentDrug ? (
                            <div className="bg-slate-900/60 border border-dashed border-white/10 rounded-2xl p-16 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Select a Drug</h3>
                                <p className="text-slate-500 text-sm">Choose a medication from the list to view dosing information.</p>
                            </div>
                        ) : (
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
                                {/* Drug Header */}
                                <div className="p-6 border-b border-white/5">
                                    <h2 className="text-2xl font-bold text-white">{currentDrug.name}</h2>
                                    <p className="text-cyan-400 text-sm">{currentDrug.class}</p>
                                    <p className="text-slate-400 mt-2">{currentDrug.standard_dose}</p>
                                    {currentDrug.loading_dose && (
                                        <p className="text-amber-400 text-sm mt-1">Loading: {currentDrug.loading_dose}</p>
                                    )}
                                    {currentDrug.max_dose && (
                                        <p className="text-red-400 text-sm mt-1">Max: {currentDrug.max_dose}</p>
                                    )}
                                </div>

                                {/* Calculated Doses */}
                                <div className="p-6 border-b border-white/5">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                                        Calculated Doses for {weight} kg
                                    </h3>
                                    <div className="space-y-3">
                                        {currentDrug.calculations.map((calc, i) => (
                                            <div key={i} className="p-4 bg-slate-800/50 rounded-xl">
                                                {calc.label && (
                                                    <div className="text-xs text-cyan-400 font-medium mb-1">{calc.label}</div>
                                                )}
                                                <div className="text-lg font-bold text-white">
                                                    {calculateDose(calc)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Renal Adjustments */}
                                {currentDrug.renal_adjustments && (
                                    <div className="p-6 border-b border-white/5">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                                            Renal Dose Adjustments
                                        </h3>
                                        <div className="space-y-2">
                                            {currentDrug.renal_adjustments.map((adj, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-3 rounded-xl flex items-center justify-between ${
                                                        showCrCl && crcl >= adj.crcl_min && crcl <= adj.crcl_max
                                                            ? 'bg-cyan-500/20 border border-cyan-500/40'
                                                            : 'bg-slate-800/30'
                                                    }`}
                                                >
                                                    <span className="text-slate-400 text-sm">
                                                        CrCl {adj.crcl_min}-{adj.crcl_max === 999 ? '∞' : adj.crcl_max} mL/min
                                                    </span>
                                                    <span className="text-white font-medium">{adj.adjustment}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {showCrCl && renalAdjustment && (
                                            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                                <div className="text-amber-400 font-medium">
                                                    For CrCl {crcl} mL/min: {renalAdjustment.adjustment}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Monitoring */}
                                {currentDrug.monitoring && (
                                    <div className="p-6 border-b border-white/5">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Monitoring</h3>
                                        <p className="text-white">{currentDrug.monitoring}</p>
                                    </div>
                                )}

                                {/* Notes */}
                                {currentDrug.notes && (
                                    <div className="p-6">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical Notes</h3>
                                        <p className="text-slate-300">{currentDrug.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-400 mb-1">Clinical Decision Support - Verify All Doses</h3>
                            <p className="text-sm text-slate-400">
                                This calculator is intended for use by healthcare professionals as a reference tool only.
                                Always verify doses with current prescribing information, institutional protocols, and clinical judgment.
                                Consider patient-specific factors including hepatic function, drug interactions, and clinical status.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
