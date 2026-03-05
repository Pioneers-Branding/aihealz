'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BMRCalculatorPage() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [result, setResult] = useState<{ bmr: number; maintenance: number; weightLoss: number; weightGain: number } | null>(null);

    function calculate() {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseFloat(age);
        if (w > 0 && h > 0 && a > 0) {
            const bmr = gender === 'Male'
                ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
                : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
            setResult({
                bmr: Math.round(bmr),
                maintenance: Math.round(bmr * 1.55),
                weightLoss: Math.round(bmr * 1.55 - 500),
                weightGain: Math.round(bmr * 1.55 + 500),
            });
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
                    <span className="text-white">BMR Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Free Health Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        BMR & Calorie <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Calculate your Basal Metabolic Rate and daily calorie needs. Plan your diet for weight loss, maintenance, or muscle gain.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Calculate Your BMR</h2>
                        <p className="text-sm text-slate-400">Enter your details to find your basal metabolic rate and daily calorie needs</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g., 70"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Height (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="e.g., 170"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Age (years)</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    placeholder="e.g., 30"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                        >
                            Calculate BMR & Calories
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="text-center p-6 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Basal Metabolic Rate</p>
                                    <p className="text-4xl font-black text-white">{result.bmr}</p>
                                    <p className="text-sm text-slate-400">calories/day at rest</p>
                                </div>
                                <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Maintenance Calories</p>
                                    <p className="text-4xl font-black text-white">{result.maintenance}</p>
                                    <p className="text-sm text-slate-400">calories/day (moderate activity)</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                                    <p className="text-sm font-bold text-blue-400">For Weight Loss</p>
                                    <p className="text-2xl font-bold text-white">{result.weightLoss} cal/day</p>
                                    <p className="text-xs text-slate-400">~0.5 kg/week deficit</p>
                                </div>
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                                    <p className="text-sm font-bold text-purple-400">For Weight Gain</p>
                                    <p className="text-2xl font-bold text-white">{result.weightGain} cal/day</p>
                                    <p className="text-xs text-slate-400">~0.5 kg/week surplus</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SEO Content */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">What is BMR?</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400 space-y-4">
                        <p>
                            Basal Metabolic Rate (BMR) is the number of calories your body burns while at complete rest. It represents the minimum amount of energy needed to keep your body functioning, including breathing, circulation, and cell production.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Harris-Benedict Equation</h3>
                        <p>This calculator uses the revised Harris-Benedict equation:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Men:</strong> BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age)</li>
                            <li><strong>Women:</strong> BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age)</li>
                        </ul>
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Calculate your Body Mass Index' },
                            { name: 'Body Fat Calculator', href: '/tools/body-fat-calculator', desc: 'Estimate your body fat percentage' },
                            { name: 'Water Intake Calculator', href: '/tools/water-intake-calculator', desc: 'Find your daily water requirement' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-orange-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This BMR calculator provides estimates for informational purposes only. Individual calorie needs vary based on activity level, body composition, and health conditions. Consult a dietitian or healthcare provider for personalized nutrition advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
