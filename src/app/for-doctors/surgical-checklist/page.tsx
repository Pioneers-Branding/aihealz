'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface ChecklistItem {
    id: string;
    text: string;
    critical: boolean;
    details?: string;
    type?: 'question' | 'verbal';
    options?: string[];
    prompts?: string[];
}

interface Phase {
    id: string;
    name: string;
    timing: string;
    color: string;
    personnel: string[];
    items: ChecklistItem[];
}

interface AdditionalCheck {
    name: string;
    items: string[];
}

interface ChecklistData {
    version: string;
    reference: string;
    phases: Phase[];
    additional_checks: Record<string, AdditionalCheck>;
}

const PHASE_COLORS = {
    amber: { bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    red: { bg: 'bg-red-500', bgLight: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    green: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
};

export default function SurgicalChecklistPage() {
    const [data, setData] = useState<ChecklistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [patientInfo, setPatientInfo] = useState({ name: '', dob: '', procedure: '', surgeon: '' });
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [completionModal, setCompletionModal] = useState<{ isOpen: boolean; completionTime: string }>({ isOpen: false, completionTime: '' });

    useMemo(() => {
        fetch('/data/surgical-safety-checklist.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const phase = data?.phases[currentPhase];
    const colors = phase ? PHASE_COLORS[phase.color as keyof typeof PHASE_COLORS] : PHASE_COLORS.amber;

    const getPhaseProgress = (phaseId: string) => {
        const p = data?.phases.find(ph => ph.id === phaseId);
        if (!p) return { total: 0, checked: 0, percent: 0 };
        const total = p.items.length;
        const checked = p.items.filter(item => checkedItems.has(item.id)).length;
        return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 };
    };

    const toggleItem = (itemId: string) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(itemId)) {
            newChecked.delete(itemId);
        } else {
            newChecked.add(itemId);
        }
        setCheckedItems(newChecked);
    };

    const startChecklist = () => {
        setStartTime(new Date());
        setCurrentPhase(0);
        setCheckedItems(new Set());
        setResponses({});
    };

    const resetChecklist = () => {
        setStartTime(null);
        setCurrentPhase(0);
        setCheckedItems(new Set());
        setResponses({});
        setPatientInfo({ name: '', dob: '', procedure: '', surgeon: '' });
    };

    const isPhaseComplete = (phaseId: string) => {
        const p = data?.phases.find(ph => ph.id === phaseId);
        if (!p) return false;
        return p.items.filter(i => i.critical).every(item => checkedItems.has(item.id));
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <>
            {/* Completion Modal */}
            {completionModal.isOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setCompletionModal({ isOpen: false, completionTime: '' })}>
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Checklist Complete!</h3>
                        <p className="text-slate-400 mb-4">
                            All phases of the Surgical Safety Checklist have been verified.
                        </p>
                        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completion Time</div>
                            <div className="text-lg font-mono text-emerald-400">{completionModal.completionTime}</div>
                        </div>
                        <button
                            onClick={() => setCompletionModal({ isOpen: false, completionTime: '' })}
                            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-red-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/for-doctors" className="hover:text-cyan-400 transition-colors">For Doctors</Link>
                    <span>/</span>
                    <span className="text-slate-300">Surgical Safety Checklist</span>
                </nav>

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        WHO Safe Surgery
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
                        Surgical Safety Checklist
                    </h1>
                    <p className="text-slate-400">
                        {data?.version} • {data?.reference}
                    </p>
                </div>

                {!startTime ? (
                    /* Pre-Start Screen */
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Patient Information</h2>
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Patient Name</label>
                                <input
                                    type="text"
                                    value={patientInfo.name}
                                    onChange={e => setPatientInfo(p => ({ ...p, name: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    placeholder="Enter patient name"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Date of Birth</label>
                                <input
                                    type="date"
                                    value={patientInfo.dob}
                                    onChange={e => setPatientInfo(p => ({ ...p, dob: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Procedure</label>
                                <input
                                    type="text"
                                    value={patientInfo.procedure}
                                    onChange={e => setPatientInfo(p => ({ ...p, procedure: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    placeholder="Enter planned procedure"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Surgeon</label>
                                <input
                                    type="text"
                                    value={patientInfo.surgeon}
                                    onChange={e => setPatientInfo(p => ({ ...p, surgeon: e.target.value }))}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    placeholder="Enter surgeon name"
                                />
                            </div>
                        </div>

                        <button
                            onClick={startChecklist}
                            disabled={!patientInfo.name || !patientInfo.procedure}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Begin Safety Checklist
                        </button>

                        {/* Phases Overview */}
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Checklist Phases</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {data?.phases.map(p => {
                                    const c = PHASE_COLORS[p.color as keyof typeof PHASE_COLORS];
                                    return (
                                        <div key={p.id} className={`${c.bgLight} ${c.border} border rounded-xl p-4`}>
                                            <div className={`${c.text} font-bold mb-1`}>{p.name}</div>
                                            <div className="text-xs text-slate-400 mb-2">{p.timing}</div>
                                            <div className="text-xs text-slate-500">
                                                {p.items.length} items • {p.items.filter(i => i.critical).length} critical
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Active Checklist */
                    <>
                        {/* Patient Banner */}
                        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div>
                                    <div className="text-xs text-slate-500">Patient</div>
                                    <div className="font-bold text-white">{patientInfo.name}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">DOB</div>
                                    <div className="text-white">{patientInfo.dob}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Procedure</div>
                                    <div className="text-white">{patientInfo.procedure}</div>
                                </div>
                            </div>
                            <div className="text-sm text-slate-400">
                                Started: {startTime.toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Phase Navigation */}
                        <div className="flex gap-2 mb-6">
                            {data?.phases.map((p, i) => {
                                const c = PHASE_COLORS[p.color as keyof typeof PHASE_COLORS];
                                const progress = getPhaseProgress(p.id);
                                const complete = isPhaseComplete(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setCurrentPhase(i)}
                                        className={`flex-1 p-3 rounded-xl border transition-all ${
                                            currentPhase === i
                                                ? `${c.bgLight} ${c.border}`
                                                : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-bold text-sm ${currentPhase === i ? c.text : 'text-white'}`}>
                                                {p.name}
                                            </span>
                                            {complete && (
                                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${c.bg} transition-all`} style={{ width: `${progress.percent}%` }} />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">{progress.checked}/{progress.total}</div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Current Phase */}
                        {phase && (
                            <div className={`${colors.bgLight} border ${colors.border} rounded-2xl overflow-hidden`}>
                                <div className={`${colors.bg} p-4`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{phase.name}</h2>
                                            <p className="text-white/80 text-sm">{phase.timing}</p>
                                        </div>
                                        <div className="text-right text-white/80 text-sm">
                                            <div>Personnel:</div>
                                            <div className="font-medium">{phase.personnel.join(', ')}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {phase.items.map(item => (
                                        <div key={item.id} className={`p-4 rounded-xl border transition-all ${
                                            checkedItems.has(item.id)
                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                : 'bg-slate-800/50 border-white/5'
                                        }`}>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedItems.has(item.id)}
                                                    onChange={() => toggleItem(item.id)}
                                                    className="mt-1 w-6 h-6 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-2">
                                                        <span className={`font-medium ${checkedItems.has(item.id) ? 'line-through text-slate-500' : 'text-white'}`}>
                                                            {item.text}
                                                        </span>
                                                        {item.critical && (
                                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded font-bold">
                                                                CRITICAL
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.details && (
                                                        <p className="text-sm text-slate-400 mt-1">{item.details}</p>
                                                    )}
                                                    {item.prompts && (
                                                        <ul className="mt-2 space-y-1">
                                                            {item.prompts.map((prompt, i) => (
                                                                <li key={i} className="text-sm text-cyan-400 flex items-start gap-2">
                                                                    <span className="text-slate-500">•</span>
                                                                    {prompt}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {item.options && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {item.options.map((opt, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setResponses(r => ({ ...r, [item.id]: opt }))}
                                                                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                                        responses[item.id] === opt
                                                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                                    }`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* Phase Navigation Buttons */}
                                <div className="p-6 pt-0 flex gap-3">
                                    {currentPhase > 0 && (
                                        <button
                                            onClick={() => setCurrentPhase(currentPhase - 1)}
                                            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                                        >
                                            Previous Phase
                                        </button>
                                    )}
                                    {currentPhase < (data?.phases.length || 0) - 1 ? (
                                        <button
                                            onClick={() => setCurrentPhase(currentPhase + 1)}
                                            disabled={!isPhaseComplete(phase.id)}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                                isPhaseComplete(phase.id)
                                                    ? `${colors.bg} text-white hover:opacity-90`
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {isPhaseComplete(phase.id) ? 'Proceed to Next Phase' : 'Complete Critical Items to Continue'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (isPhaseComplete(phase.id)) {
                                                    setCompletionModal({ isOpen: true, completionTime: new Date().toLocaleTimeString() });
                                                }
                                            }}
                                            disabled={!isPhaseComplete(phase.id)}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                                isPhaseComplete(phase.id)
                                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Complete Checklist
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Checks Accordion */}
                        <div className="mt-6 space-y-2">
                            {data && Object.entries(data.additional_checks).map(([key, check]) => (
                                <details key={key} className="bg-slate-900/60 border border-white/5 rounded-xl overflow-hidden">
                                    <summary className="p-4 cursor-pointer text-white font-medium hover:bg-slate-800/30 transition-colors">
                                        {check.name}
                                    </summary>
                                    <div className="px-4 pb-4 space-y-2">
                                        {check.items.map((item, i) => (
                                            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 cursor-pointer">
                                                <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500" />
                                                <span className="text-slate-300 text-sm">{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>

                        {/* Reset Button */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={resetChecklist}
                                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                Reset Checklist
                            </button>
                        </div>
                    </>
                )}

                {/* Disclaimer */}
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mt-8">
                    <h3 className="font-bold text-white mb-2">About the WHO Surgical Safety Checklist</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        The WHO Surgical Safety Checklist is a tool used by surgical teams to improve patient safety.
                        Studies have shown it reduces surgical complications by up to 36% and mortality by up to 47%.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <a href="https://www.who.int/publications/i/item/9789241598590" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                            WHO Implementation Manual →
                        </a>
                        <span>•</span>
                        <span>Haynes AB, et al. NEJM 2009</span>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}
