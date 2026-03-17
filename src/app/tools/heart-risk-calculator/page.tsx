'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HeartRiskCalculatorPage() {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [systolic, setSystolic] = useState('');
    const [cholesterol, setCholesterol] = useState('');
    const [smoker, setSmoker] = useState('No');
    const [diabetic, setDiabetic] = useState('No');
    const [result, setResult] = useState<{ score: number; risk: string; color: string } | null>(null);

    function calculate() {
        let score = 0;
        const a = parseFloat(age);
        if (a > 55) score += 3; else if (a > 45) score += 2; else if (a > 35) score += 1;
        if (gender === 'Male') score += 1;
        const bp = parseFloat(systolic);
        if (bp > 140) score += 3; else if (bp > 130) score += 2;
        const chol = parseFloat(cholesterol);
        if (chol > 240) score += 2; else if (chol > 200) score += 1;
        if (smoker === 'Yes') score += 3;
        if (diabetic === 'Yes') score += 2;

        const risk = score <= 3 ? 'Low' : score <= 6 ? 'Moderate' : score <= 9 ? 'High' : 'Very High';
        const color = score <= 3 ? 'text-emerald-400' : score <= 6 ? 'text-amber-400' : 'text-red-400';
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
                    <span className="text-white">Heart Risk Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Cardiovascular Health
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Heart Disease <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">Risk Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Estimate your 10-year cardiovascular disease risk. Understand your heart health and take preventive action.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Assess Your Heart Risk</h2>
                        <p className="text-sm text-slate-400">Enter your health parameters to estimate cardiovascular risk</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    placeholder="e.g., 45"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-red-500/50"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Systolic BP (mmHg)</label>
                                <input
                                    type="number"
                                    value={systolic}
                                    onChange={e => setSystolic(e.target.value)}
                                    placeholder="e.g., 120"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Total Cholesterol (mg/dL)</label>
                                <input
                                    type="number"
                                    value={cholesterol}
                                    onChange={e => setCholesterol(e.target.value)}
                                    placeholder="e.g., 200"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Smoker?</label>
                                <select
                                    value={smoker}
                                    onChange={e => setSmoker(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-red-500/50"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Diabetic?</label>
                                <select
                                    value={diabetic}
                                    onChange={e => setDiabetic(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-red-500/50"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all"
                        >
                            Calculate Heart Risk
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="text-center mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">10-Year Heart Disease Risk</p>
                                <p className={`text-5xl font-black ${result.color} mb-2`}>{result.risk}</p>
                                <p className="text-sm text-slate-400">Risk Score: {result.score}/15</p>
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-xl mb-6">
                                <p className="text-sm text-slate-300">
                                    {result.risk === 'Low' && 'Great news! Your cardiovascular risk appears low. Continue maintaining a healthy lifestyle with regular exercise and a balanced diet.'}
                                    {result.risk === 'Moderate' && 'Your cardiovascular risk is moderate. Consider lifestyle modifications and consult a doctor for preventive measures.'}
                                    {result.risk === 'High' && 'Your cardiovascular risk is elevated. We strongly recommend scheduling a checkup with a cardiologist.'}
                                    {result.risk === 'Very High' && 'Your cardiovascular risk is very high. Please consult a cardiologist immediately for proper evaluation and treatment.'}
                                </p>
                            </div>

                            <Link
                                href="/doctors/specialty/cardiologist"
                                className="block w-full py-3 text-center rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 transition-all"
                            >
                                Find a Cardiologist Near You
                            </Link>
                        </div>
                    )}
                </div>

                {/* Risk Factors */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Heart Disease Risk Factors</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { factor: 'High Blood Pressure', desc: 'BP consistently above 130/80 mmHg', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-rose-400' },
                            { factor: 'High Cholesterol', desc: 'Total cholesterol above 200 mg/dL', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'text-red-400' },
                            { factor: 'Smoking', desc: 'Current or recent tobacco use', iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', color: 'text-orange-400' },
                            { factor: 'Diabetes', desc: 'Type 1 or Type 2 diabetes', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-blue-400' },
                            { factor: 'Obesity', desc: 'BMI of 30 or higher', iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', color: 'text-amber-400' },
                            { factor: 'Family History', desc: 'Heart disease in close relatives', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-purple-400' },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-slate-800/30 rounded-xl flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-white">{item.factor}</p>
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
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Check if your weight is healthy' },
                            { name: 'Diabetes Risk Calculator', href: '/tools/diabetes-risk-calculator', desc: 'Assess your diabetes risk' },
                            { name: 'Kidney Function Calculator', href: '/tools/kidney-function-calculator', desc: 'Calculate your eGFR' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-red-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This calculator provides a simplified risk estimate and is not a substitute for professional medical evaluation. Actual cardiovascular risk depends on many factors. Please consult a cardiologist for comprehensive heart health assessment.
                    </p>
                </div>
            </div>
        </div>
    );
}
