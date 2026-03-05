'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChecklistItem {
    task: string;
    important: boolean;
}

interface PreOp {
    weeks_before: ChecklistItem[];
    days_before: ChecklistItem[];
    night_before: ChecklistItem[];
    day_of: ChecklistItem[];
}

interface PostOp {
    hospital: ChecklistItem[];
    first_week: ChecklistItem[];
    followup: ChecklistItem[];
}

interface Surgery {
    id: string;
    name: string;
    icon: string;
    description: string;
    preOp: PreOp;
    postOp: PostOp;
    warning_signs: string[];
}

interface PackingList {
    essentials: string[];
    comfort: string[];
    leave_home: string[];
}

interface SurgeryData {
    surgeries: Surgery[];
    packing_list: PackingList;
    general_tips: string[];
}

export default function SurgeryChecklistPage() {
    const [data, setData] = useState<SurgeryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSurgery, setSelectedSurgery] = useState<string>('general');
    const [activePhase, setActivePhase] = useState<'preOp' | 'postOp'>('preOp');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [showPacking, setShowPacking] = useState(false);

    useEffect(() => {
        fetch('/data/surgery-checklists.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const surgery = data?.surgeries.find(s => s.id === selectedSurgery);

    const toggleItem = (itemKey: string) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(itemKey)) {
            newChecked.delete(itemKey);
        } else {
            newChecked.add(itemKey);
        }
        setCheckedItems(newChecked);
    };

    const getProgress = () => {
        if (!surgery) return { total: 0, checked: 0, percent: 0 };
        const phase = activePhase === 'preOp' ? surgery.preOp : surgery.postOp;
        const allItems = Object.values(phase).flat();
        const total = allItems.length;
        const checked = allItems.filter((_, i) => checkedItems.has(`${selectedSurgery}-${activePhase}-${i}`)).length;
        return { total, checked, percent: total > 0 ? Math.round((checked / total) * 100) : 0 };
    };

    const progress = getProgress();

    const renderChecklist = (items: ChecklistItem[], section: string) => {
        return (
            <div className="space-y-3">
                {items.map((item, idx) => {
                    const key = `${selectedSurgery}-${activePhase}-${section}-${idx}`;
                    const isChecked = checkedItems.has(key);
                    return (
                        <label
                            key={key}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                isChecked
                                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                                    : 'bg-slate-800/50 border border-white/5 hover:border-white/20'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItem(key)}
                                className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                            <div className="flex-1">
                                <span className={`${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                                    {item.task}
                                </span>
                                {item.important && !isChecked && (
                                    <span className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded">
                                        Important
                                    </span>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/tools" className="hover:text-cyan-400 transition-colors">Tools</Link>
                    <span>/</span>
                    <span className="text-slate-300">Surgery Checklist</span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                        Surgery <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">Checklists</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                        Pre-operative and post-operative checklists to help you prepare for surgery and recover safely.
                    </p>
                </div>

                {/* Surgery Type Selector */}
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-8">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Surgery Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {data?.surgeries.map(s => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setSelectedSurgery(s.id);
                                    setCheckedItems(new Set());
                                }}
                                className={`p-4 rounded-xl text-center transition-all ${
                                    selectedSurgery === s.id
                                        ? 'bg-teal-500/20 border-2 border-teal-500/40'
                                        : 'bg-slate-800/50 border border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="text-2xl mb-2">{s.icon}</div>
                                <div className={`text-sm font-medium ${selectedSurgery === s.id ? 'text-teal-400' : 'text-white'}`}>
                                    {s.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {surgery && (
                    <>
                        {/* Surgery Info */}
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">{surgery.icon}</div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{surgery.name}</h2>
                                    <p className="text-slate-400">{surgery.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Phase Toggle & Progress */}
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActivePhase('preOp')}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                        activePhase === 'preOp'
                                            ? 'bg-teal-500 text-slate-900'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                    }`}
                                >
                                    Pre-Operative
                                </button>
                                <button
                                    onClick={() => setActivePhase('postOp')}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                        activePhase === 'postOp'
                                            ? 'bg-teal-500 text-slate-900'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                    }`}
                                >
                                    Post-Operative
                                </button>
                                <button
                                    onClick={() => setShowPacking(!showPacking)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                        showPacking
                                            ? 'bg-amber-500 text-slate-900'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                    }`}
                                >
                                    Packing List
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex-1 flex items-center gap-4">
                                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
                                        style={{ width: `${progress.percent}%` }}
                                    />
                                </div>
                                <span className="text-sm text-slate-400">
                                    {progress.checked}/{progress.total} ({progress.percent}%)
                                </span>
                            </div>
                        </div>

                        {showPacking && data && (
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        Essentials to Bring
                                    </h3>
                                    <ul className="space-y-2">
                                        {data.packing_list.essentials.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                                                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </span>
                                        Comfort Items
                                    </h3>
                                    <ul className="space-y-2">
                                        {data.packing_list.comfort.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </span>
                                        Leave at Home
                                    </h3>
                                    <ul className="space-y-2">
                                        {data.packing_list.leave_home.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Checklists */}
                        {!showPacking && (
                            <div className="space-y-8">
                                {activePhase === 'preOp' ? (
                                    <>
                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">1</span>
                                                Weeks Before Surgery
                                            </h3>
                                            {renderChecklist(surgery.preOp.weeks_before, 'weeks_before')}
                                        </div>
                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">2</span>
                                                Days Before Surgery
                                            </h3>
                                            {renderChecklist(surgery.preOp.days_before, 'days_before')}
                                        </div>
                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">3</span>
                                                Night Before Surgery
                                            </h3>
                                            {renderChecklist(surgery.preOp.night_before, 'night_before')}
                                        </div>
                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">4</span>
                                                Day of Surgery
                                            </h3>
                                            {renderChecklist(surgery.preOp.day_of, 'day_of')}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">1</span>
                                                In the Hospital
                                            </h3>
                                            {renderChecklist(surgery.postOp.hospital, 'hospital')}
                                        </div>
                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">2</span>
                                                First Week at Home
                                            </h3>
                                            {renderChecklist(surgery.postOp.first_week, 'first_week')}
                                        </div>
                                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">3</span>
                                                Follow-Up Care
                                            </h3>
                                            {renderChecklist(surgery.postOp.followup, 'followup')}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Warning Signs */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Warning Signs - Call Your Doctor If:
                            </h3>
                            <div className="grid md:grid-cols-2 gap-2">
                                {surgery.warning_signs.map((sign, i) => (
                                    <div key={i} className="flex items-center gap-2 text-slate-300">
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                                        {sign}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* General Tips */}
                {data && (
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mt-8">
                        <h3 className="text-lg font-bold text-white mb-4">General Tips</h3>
                        <ul className="space-y-2">
                            {data.general_tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-400">
                                    <svg className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {tip}
                                </li>
                            ))}
                        </ul>
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
                            <h3 className="font-semibold text-amber-400 mb-1">Important Notice</h3>
                            <p className="text-sm text-slate-400">
                                These checklists are general guides. Always follow your surgeon&apos;s specific instructions,
                                as they may differ based on your individual health needs and the specific procedure being performed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
