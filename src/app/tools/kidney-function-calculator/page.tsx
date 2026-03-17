'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KidneyFunctionCalculatorPage() {
    const [creatinine, setCreatinine] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [result, setResult] = useState<{ egfr: number; stage: string; color: string } | null>(null);

    function calculate() {
        const cr = parseFloat(creatinine);
        const a = parseFloat(age);
        if (cr > 0 && a > 0) {
            const isFemale = gender === 'Female';
            const k = isFemale ? 0.7 : 0.9;
            const alpha = isFemale ? -0.329 : -0.411;
            const eGFR = 141 * Math.pow(Math.min(cr / k, 1), alpha) * Math.pow(Math.max(cr / k, 1), -1.209) * Math.pow(0.993, a) * (isFemale ? 1.018 : 1);

            const stage = eGFR >= 90 ? 'Normal (Stage 1)' : eGFR >= 60 ? 'Mild Decrease (Stage 2)' : eGFR >= 30 ? 'Moderate (Stage 3)' : eGFR >= 15 ? 'Severe (Stage 4)' : 'Kidney Failure (Stage 5)';
            const color = eGFR >= 90 ? 'text-emerald-400' : eGFR >= 60 ? 'text-amber-400' : 'text-red-400';
            setResult({ egfr: Math.round(eGFR), stage, color });
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
                    <span className="text-white">Kidney Function Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Nephrology Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Kidney Function <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">(eGFR) Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Calculate your estimated Glomerular Filtration Rate (eGFR) to assess kidney health and function.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Calculate Your eGFR</h2>
                        <p className="text-sm text-slate-400">Enter your serum creatinine level to estimate kidney function</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Serum Creatinine (mg/dL)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={creatinine}
                                    onChange={e => setCreatinine(e.target.value)}
                                    placeholder="e.g., 1.0"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    placeholder="e.g., 40"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                            Calculate eGFR
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="text-center mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estimated GFR</p>
                                <p className={`text-5xl font-black ${result.color} mb-2`}>{result.egfr} mL/min</p>
                                <p className={`text-lg font-bold ${result.color}`}>{result.stage}</p>
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-xl mb-6">
                                <p className="text-sm text-slate-300">
                                    {result.egfr >= 90 && 'Your kidney function appears normal. Continue with regular health checkups and maintain a healthy lifestyle.'}
                                    {result.egfr >= 60 && result.egfr < 90 && 'Your kidney function shows mild decrease. This is common with age. Monitor with regular tests and maintain healthy habits.'}
                                    {result.egfr >= 30 && result.egfr < 60 && 'Your kidney function shows moderate reduction. Please consult a nephrologist for proper evaluation and management.'}
                                    {result.egfr < 30 && 'Your kidney function shows significant reduction. Please see a nephrologist immediately for evaluation and treatment options.'}
                                </p>
                            </div>

                            {result.egfr < 60 && (
                                <Link
                                    href="/doctors/specialty/nephrologist"
                                    className="block w-full py-3 text-center rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-400 transition-all"
                                >
                                    Find a Nephrologist Near You
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* CKD Stages */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Chronic Kidney Disease Stages</h2>
                    <div className="space-y-3">
                        {[
                            { stage: 'Stage 1', gfr: '90+', desc: 'Normal kidney function', color: 'bg-emerald-500' },
                            { stage: 'Stage 2', gfr: '60-89', desc: 'Mild loss of kidney function', color: 'bg-lime-500' },
                            { stage: 'Stage 3a', gfr: '45-59', desc: 'Mild to moderate loss', color: 'bg-amber-500' },
                            { stage: 'Stage 3b', gfr: '30-44', desc: 'Moderate to severe loss', color: 'bg-orange-500' },
                            { stage: 'Stage 4', gfr: '15-29', desc: 'Severe loss', color: 'bg-red-500' },
                            { stage: 'Stage 5', gfr: '<15', desc: 'Kidney failure', color: 'bg-red-700' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-white">{item.stage}</p>
                                        <p className="text-sm text-slate-400">eGFR: {item.gfr} mL/min</p>
                                    </div>
                                    <p className="text-sm text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Content */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">What is eGFR?</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400 space-y-4">
                        <p>
                            The estimated Glomerular Filtration Rate (eGFR) is a measure of how well your kidneys filter waste from your blood. It&apos;s calculated using your serum creatinine level, age, gender, and race using the CKD-EPI equation.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Why is eGFR Important?</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Early detection of chronic kidney disease (CKD)</li>
                            <li>Monitoring kidney function over time</li>
                            <li>Adjusting medication dosages based on kidney function</li>
                            <li>Determining the need for dialysis or transplant</li>
                        </ul>
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'Heart Risk Calculator', href: '/tools/heart-risk-calculator', desc: 'Assess cardiovascular risk' },
                            { name: 'Diabetes Risk Calculator', href: '/tools/diabetes-risk-calculator', desc: 'Check your diabetes risk' },
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Calculate your BMI' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-purple-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This calculator uses the CKD-EPI equation for estimation. Results may vary from laboratory calculations. This tool is for educational purposes and should not replace professional medical evaluation.
                    </p>
                </div>
            </div>
        </div>
    );
}
