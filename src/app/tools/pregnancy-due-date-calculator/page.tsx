'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PregnancyDueDateCalculatorPage() {
    const [lmp, setLmp] = useState('');
    const [result, setResult] = useState<{ dueDate: Date; weeks: number; trimester: string; daysLeft: number } | null>(null);

    function calculate() {
        if (lmp) {
            const lmpDate = new Date(lmp);
            const dueDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
            const now = new Date();
            const weeks = Math.floor((now.getTime() - lmpDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            const trimester = weeks <= 12 ? 'First' : weeks <= 27 ? 'Second' : 'Third';
            const daysLeft = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
            setResult({ dueDate, weeks, trimester, daysLeft });
        }
    }

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                    <span>/</span>
                    <span className="text-white">Pregnancy Due Date Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Obstetrics Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Pregnancy <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Due Date Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Calculate your estimated due date, current pregnancy week, and trimester. Track your pregnancy journey.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Calculate Your Due Date</h2>
                        <p className="text-sm text-slate-400">Enter the first day of your last menstrual period (LMP)</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Last Menstrual Period (LMP)</label>
                            <input
                                type="date"
                                value={lmp}
                                onChange={e => setLmp(e.target.value)}
                                className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-pink-500/50"
                            />
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                        >
                            Calculate Due Date
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="text-center p-6 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                                    <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Estimated Due Date</p>
                                    <p className="text-3xl font-black text-white">
                                        {result.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2">{result.daysLeft} days remaining</p>
                                </div>
                                <div className="text-center p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Current Progress</p>
                                    <p className="text-3xl font-black text-white">Week {result.weeks}</p>
                                    <p className="text-sm text-slate-400 mt-2">{result.trimester} Trimester</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-slate-400 mb-2">
                                    <span>Week 0</span>
                                    <span>Week 40</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (result.weeks / 40) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-2">
                                    <span>First Trimester</span>
                                    <span>Second Trimester</span>
                                    <span>Third Trimester</span>
                                </div>
                            </div>

                            <Link
                                href="/doctors/specialty/gynecologist"
                                className="block w-full py-3 text-center rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-400 transition-all"
                            >
                                Find an OB-GYN Near You
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pregnancy Timeline */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Pregnancy Timeline</h2>
                    <div className="space-y-4">
                        {[
                            { trimester: 'First Trimester', weeks: 'Weeks 1-12', highlights: 'Morning sickness, fatigue, first ultrasound', color: 'border-l-pink-500' },
                            { trimester: 'Second Trimester', weeks: 'Weeks 13-27', highlights: 'Baby movements, gender reveal, energy returns', color: 'border-l-purple-500' },
                            { trimester: 'Third Trimester', weeks: 'Weeks 28-40', highlights: 'Baby growth, nesting, preparing for birth', color: 'border-l-rose-500' },
                        ].map((item, i) => (
                            <div key={i} className={`p-4 bg-slate-800/30 rounded-xl border-l-4 ${item.color}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-white">{item.trimester}</p>
                                    <p className="text-sm text-slate-400">{item.weeks}</p>
                                </div>
                                <p className="text-sm text-slate-400">{item.highlights}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Content */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">How is the Due Date Calculated?</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400 space-y-4">
                        <p>
                            Your estimated due date (EDD) is calculated by adding 280 days (40 weeks) to the first day of your last menstrual period (LMP). This is known as Naegele&apos;s rule and is the standard method used by healthcare providers.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Important Notes</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Only about 5% of babies are born on their exact due date</li>
                            <li>Most babies arrive within 2 weeks before or after the due date</li>
                            <li>Your doctor may adjust the date based on ultrasound measurements</li>
                            <li>First-time mothers often deliver a little later than the due date</li>
                        </ul>
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Track your pregnancy weight' },
                            { name: 'Water Intake Calculator', href: '/tools/water-intake-calculator', desc: 'Stay hydrated during pregnancy' },
                            { name: 'Vaccination Schedule', href: '/tools/vaccinations', desc: 'Prenatal vaccination guide' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-pink-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-pink-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This calculator provides an estimate based on the LMP method. Your actual due date may differ based on ultrasound measurements and other factors. Always consult your healthcare provider for accurate pregnancy dating.
                    </p>
                </div>
            </div>
        </div>
    );
}
