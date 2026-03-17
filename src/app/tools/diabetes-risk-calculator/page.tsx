'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DiabetesRiskCalculatorPage() {
    const [age, setAge] = useState('');
    const [bmi, setBmi] = useState('');
    const [familyHistory, setFamilyHistory] = useState('No');
    const [exercise, setExercise] = useState('Moderate');
    const [waist, setWaist] = useState('');
    const [result, setResult] = useState<{ score: number; risk: string; color: string } | null>(null);

    function calculate() {
        let score = 0;
        const a = parseFloat(age);
        if (a > 55) score += 3; else if (a > 45) score += 2; else if (a > 35) score += 1;

        const b = parseFloat(bmi);
        if (b > 30) score += 3; else if (b > 25) score += 2;

        if (familyHistory === 'Yes') score += 3;

        if (exercise === 'None') score += 2; else if (exercise === '1-2 days') score += 1;

        const w = parseFloat(waist);
        if (w > 102) score += 2; else if (w > 88) score += 1;

        const risk = score <= 3 ? 'Low' : score <= 7 ? 'Moderate' : 'High';
        const color = score <= 3 ? 'text-emerald-400' : score <= 7 ? 'text-amber-400' : 'text-red-400';
        setResult({ score, risk, color });
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
                    <span className="text-white">Diabetes Risk Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Endocrinology Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Type 2 Diabetes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Risk Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Assess your risk of developing Type 2 diabetes. Early detection and lifestyle changes can prevent or delay diabetes.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Assess Your Diabetes Risk</h2>
                        <p className="text-sm text-slate-400">Answer these questions to estimate your Type 2 diabetes risk</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    placeholder="e.g., 40"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">BMI</label>
                                <input
                                    type="number"
                                    value={bmi}
                                    onChange={e => setBmi(e.target.value)}
                                    placeholder="e.g., 25"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                                />
                                <Link href="/tools/bmi-calculator" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                                    Don&apos;t know your BMI? Calculate here →
                                </Link>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Family History of Diabetes?</label>
                                <select
                                    value={familyHistory}
                                    onChange={e => setFamilyHistory(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes (parent or sibling)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Weekly Exercise</label>
                                <select
                                    value={exercise}
                                    onChange={e => setExercise(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="None">None</option>
                                    <option value="1-2 days">1-2 days per week</option>
                                    <option value="3-5 days">3-5 days per week</option>
                                    <option value="Daily">Daily</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Waist Circumference (cm)</label>
                                <input
                                    type="number"
                                    value={waist}
                                    onChange={e => setWaist(e.target.value)}
                                    placeholder="e.g., 85"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                                />
                                <p className="text-xs text-slate-500 mt-1">Measure around your belly button while standing</p>
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                        >
                            Calculate Diabetes Risk
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="text-center mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type 2 Diabetes Risk</p>
                                <p className={`text-5xl font-black ${result.color} mb-2`}>{result.risk}</p>
                                <p className="text-sm text-slate-400">Risk Score: {result.score}/13</p>
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-xl mb-6">
                                <p className="text-sm text-slate-300">
                                    {result.risk === 'Low' && 'Your diabetes risk appears low. Maintain your healthy lifestyle with regular exercise and balanced nutrition.'}
                                    {result.risk === 'Moderate' && 'You have moderate risk factors. Consider getting regular blood sugar tests and making lifestyle improvements.'}
                                    {result.risk === 'High' && 'Your risk factors suggest elevated diabetes risk. We recommend consulting an endocrinologist and getting your blood sugar tested.'}
                                </p>
                            </div>

                            {result.risk !== 'Low' && (
                                <Link
                                    href="/doctors/specialty/endocrinologist"
                                    className="block w-full py-3 text-center rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all"
                                >
                                    Find an Endocrinologist
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Risk Factors */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Diabetes Risk Factors</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { factor: 'Overweight/Obesity', desc: 'BMI of 25 or higher', iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', color: 'text-amber-400', modifiable: true },
                            { factor: 'Family History', desc: 'Parent or sibling with diabetes', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-purple-400', modifiable: false },
                            { factor: 'Sedentary Lifestyle', desc: 'Little to no physical activity', iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'text-orange-400', modifiable: true },
                            { factor: 'Age', desc: 'Risk increases after 45', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-slate-400', modifiable: false },
                            { factor: 'High Blood Pressure', desc: 'BP above 140/90 mmHg', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-rose-400', modifiable: true },
                            { factor: 'Abdominal Fat', desc: 'Large waist circumference', iconPath: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4', color: 'text-blue-400', modifiable: true },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-slate-800/30 rounded-xl flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-white">{item.factor}</p>
                                        {item.modifiable && (
                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Modifiable</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Calculate your body mass index' },
                            { name: 'Heart Risk Calculator', href: '/tools/heart-risk-calculator', desc: 'Assess cardiovascular risk' },
                            { name: 'Kidney Function Calculator', href: '/tools/kidney-function-calculator', desc: 'Check your eGFR' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-blue-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This calculator provides a risk estimate based on known risk factors. It does not diagnose diabetes. Only blood tests can confirm diabetes. Please consult a healthcare provider for proper evaluation and testing.
                    </p>
                </div>
            </div>
        </div>
    );
}
