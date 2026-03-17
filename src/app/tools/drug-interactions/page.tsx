'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, Search, Plus, X, Pill, Wine, Apple, Shield } from 'lucide-react';

interface Drug {
    id: string;
    name: string;
    brands: string[];
    class: string;
}

interface Interaction {
    drug1: string;
    drug2: string;
    severity: 'contraindicated' | 'severe' | 'moderate' | 'mild';
    effect: string;
    mechanism: string;
    recommendation: string;
    monitoring: string;
}

interface FoodInteraction {
    drug: string;
    food: string;
    examples: string[];
    effect: string;
    recommendation: string;
}

interface AlcoholInteraction {
    drugClass: string;
    examples: string[];
    severity: string;
    effect: string;
    recommendation: string;
}

interface DrugData {
    drugs: Drug[];
    interactions: Interaction[];
    food_interactions: FoodInteraction[];
    alcohol_interactions: AlcoholInteraction[];
}

const SEVERITY_CONFIG = {
    contraindicated: {
        label: 'Contraindicated',
        bg: 'bg-black',
        border: 'border-red-500',
        text: 'text-red-400',
        icon: AlertTriangle,
        description: 'NEVER use together - life-threatening risk'
    },
    severe: {
        label: 'Severe',
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: AlertTriangle,
        description: 'Potentially dangerous - avoid if possible'
    },
    moderate: {
        label: 'Moderate',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        icon: AlertCircle,
        description: 'Use caution - monitor closely'
    },
    mild: {
        label: 'Mild',
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/50',
        text: 'text-blue-400',
        icon: Info,
        description: 'Minor interaction - usually safe'
    }
};

export default function DrugInteractionsChecker() {
    const [drugData, setDrugData] = useState<DrugData | null>(null);
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [includeAlcohol, setIncludeAlcohol] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load drug data
    useEffect(() => {
        fetch('/data/drug-interactions.json')
            .then(res => res.json())
            .then(data => setDrugData(data))
            .catch(console.error);
    }, []);

    // Filter drugs based on search
    const filteredDrugs = useMemo(() => {
        if (!drugData || !searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return drugData.drugs.filter(drug =>
            drug.name.toLowerCase().includes(q) ||
            drug.brands.some(b => b.toLowerCase().includes(q)) ||
            drug.class.toLowerCase().includes(q)
        ).slice(0, 10);
    }, [drugData, searchQuery]);

    // Find interactions between selected drugs
    const foundInteractions = useMemo(() => {
        if (!drugData || selectedDrugs.length < 2) return [];

        const interactions: Interaction[] = [];
        for (let i = 0; i < selectedDrugs.length; i++) {
            for (let j = i + 1; j < selectedDrugs.length; j++) {
                const drug1 = selectedDrugs[i];
                const drug2 = selectedDrugs[j];

                const found = drugData.interactions.find(int =>
                    (int.drug1 === drug1 && int.drug2 === drug2) ||
                    (int.drug1 === drug2 && int.drug2 === drug1)
                );

                if (found) interactions.push(found);
            }
        }

        // Sort by severity
        const severityOrder = { contraindicated: 0, severe: 1, moderate: 2, mild: 3 };
        return interactions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }, [drugData, selectedDrugs]);

    // Find food interactions for selected drugs
    const foodInteractions = useMemo(() => {
        if (!drugData) return [];
        return drugData.food_interactions.filter(fi =>
            selectedDrugs.some(d => {
                const drug = drugData.drugs.find(dd => dd.id === d);
                return drug && (
                    fi.drug.toLowerCase().includes(drug.name.toLowerCase()) ||
                    fi.drug.toLowerCase().includes(drug.class.toLowerCase())
                );
            })
        );
    }, [drugData, selectedDrugs]);

    // Find alcohol interactions
    const alcoholWarnings = useMemo(() => {
        if (!drugData || !includeAlcohol) return [];
        return drugData.alcohol_interactions.filter(ai =>
            selectedDrugs.some(d => {
                const drug = drugData.drugs.find(dd => dd.id === d);
                return drug && (
                    ai.examples.some(e => e.toLowerCase().includes(drug.name.toLowerCase())) ||
                    ai.drugClass.toLowerCase().includes(drug.class.toLowerCase())
                );
            })
        );
    }, [drugData, selectedDrugs, includeAlcohol]);

    const addDrug = (drugId: string) => {
        if (!selectedDrugs.includes(drugId)) {
            setSelectedDrugs([...selectedDrugs, drugId]);
        }
        setSearchQuery('');
        setShowSearch(false);
    };

    const removeDrug = (drugId: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d !== drugId));
    };

    const getDrugName = (id: string) => {
        return drugData?.drugs.find(d => d.id === id)?.name || id;
    };

    const getDrugBrands = (id: string) => {
        return drugData?.drugs.find(d => d.id === id)?.brands || [];
    };

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-bold mb-4">
                        <Shield className="w-4 h-4" />
                        DRUG SAFETY TOOL
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Drug Interactions Checker
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Check for potentially dangerous interactions between your medications.
                        Add multiple drugs to see how they interact with each other.
                    </p>
                </div>

                {/* Drug Input Section */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-400" />
                        Your Medications
                    </h2>

                    {/* Selected Drugs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedDrugs.map(drugId => (
                            <div
                                key={drugId}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl"
                            >
                                <Pill className="w-4 h-4 text-blue-400" />
                                <div>
                                    <span className="text-white font-medium">{getDrugName(drugId)}</span>
                                    <span className="text-xs text-slate-400 ml-2">
                                        ({getDrugBrands(drugId).slice(0, 2).join(', ')})
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeDrug(drugId)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        ))}

                        {selectedDrugs.length === 0 && (
                            <p className="text-slate-500 text-sm">No medications added yet</p>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by drug name or brand (e.g., Lipitor, Warfarin, Aspirin)..."
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setShowSearch(true);
                            }}
                            onFocus={() => setShowSearch(true)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none"
                        />

                        {/* Search Results Dropdown */}
                        {showSearch && filteredDrugs.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                {filteredDrugs.map(drug => (
                                    <button
                                        key={drug.id}
                                        onClick={() => addDrug(drug.id)}
                                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-white font-medium">{drug.name}</span>
                                            <span className="text-xs text-slate-500 ml-2">({drug.class})</span>
                                            <div className="text-xs text-slate-400">
                                                Brands: {drug.brands.join(', ')}
                                            </div>
                                        </div>
                                        <Plus className="w-5 h-5 text-blue-400" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Alcohol Toggle */}
                    <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeAlcohol}
                            onChange={e => setIncludeAlcohol(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-slate-300 flex items-center gap-2">
                            <Wine className="w-4 h-4" />
                            Include alcohol interaction warnings
                        </span>
                    </label>
                </div>

                {/* Results Section */}
                {selectedDrugs.length >= 2 && (
                    <div className="space-y-6">
                        {/* Drug-Drug Interactions */}
                        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                                Drug-Drug Interactions
                                {foundInteractions.length > 0 && (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                        {foundInteractions.length} found
                                    </span>
                                )}
                            </h3>

                            {foundInteractions.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <p className="text-emerald-400 font-semibold">No known interactions found</p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        These medications appear safe to take together, but always consult your doctor.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {foundInteractions.map((int, i) => {
                                        const config = SEVERITY_CONFIG[int.severity];
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={i}
                                                className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Icon className={`w-6 h-6 ${config.text} flex-shrink-0 mt-0.5`} />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${config.text} bg-black/30`}>
                                                                {config.label}
                                                            </span>
                                                            <span className="text-white font-semibold">
                                                                {getDrugName(int.drug1)} + {getDrugName(int.drug2)}
                                                            </span>
                                                        </div>
                                                        <p className="text-white mb-2">{int.effect}</p>
                                                        <div className="space-y-1 text-sm">
                                                            <p className="text-slate-400">
                                                                <strong className="text-slate-300">Mechanism:</strong> {int.mechanism}
                                                            </p>
                                                            <p className="text-slate-400">
                                                                <strong className="text-slate-300">Recommendation:</strong> {int.recommendation}
                                                            </p>
                                                            {int.monitoring && (
                                                                <p className="text-slate-400">
                                                                    <strong className="text-slate-300">Monitor:</strong> {int.monitoring}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Food Interactions */}
                        {foodInteractions.length > 0 && (
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Apple className="w-5 h-5 text-emerald-400" />
                                    Food Interactions
                                </h3>
                                <div className="space-y-3">
                                    {foodInteractions.map((fi, i) => (
                                        <div key={i} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                            <p className="text-white font-medium mb-1">
                                                Avoid: {fi.food}
                                            </p>
                                            <p className="text-sm text-slate-400 mb-2">
                                                Examples: {fi.examples.join(', ')}
                                            </p>
                                            <p className="text-sm text-amber-400">{fi.effect}</p>
                                            <p className="text-sm text-slate-300 mt-1">{fi.recommendation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alcohol Warnings */}
                        {includeAlcohol && alcoholWarnings.length > 0 && (
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Wine className="w-5 h-5 text-purple-400" />
                                    Alcohol Interactions
                                </h3>
                                <div className="space-y-3">
                                    {alcoholWarnings.map((aw, i) => (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-xl border ${
                                                aw.severity === 'severe'
                                                    ? 'bg-red-500/10 border-red-500/20'
                                                    : 'bg-amber-500/10 border-amber-500/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                    aw.severity === 'severe' ? 'text-red-400 bg-red-500/20' : 'text-amber-400 bg-amber-500/20'
                                                }`}>
                                                    {aw.severity}
                                                </span>
                                                <span className="text-white font-medium">{aw.drugClass}</span>
                                            </div>
                                            <p className="text-white mb-1">{aw.effect}</p>
                                            <p className="text-sm text-slate-300">{aw.recommendation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Single Drug Info */}
                {selectedDrugs.length === 1 && (
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 text-center">
                        <Info className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-white font-semibold mb-2">Add more medications to check interactions</p>
                        <p className="text-slate-400 text-sm">
                            Drug interaction checking requires at least 2 medications.
                        </p>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                    <p className="text-xs text-slate-500 text-center">
                        <strong className="text-slate-400">Medical Disclaimer:</strong> This tool provides general information
                        and is not a substitute for professional medical advice. Always consult your doctor or pharmacist
                        about your specific medications. This database may not include all possible interactions.
                    </p>
                </div>

                {/* Back to Tools */}
                <div className="text-center mt-8">
                    <Link
                        href="/tools"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                        ← Back to Health Tools
                    </Link>
                </div>
            </div>
        </main>
    );
}
