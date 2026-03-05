'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BMICalculatorPage() {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    function calculate() {
        setError(null);
        const w = parseFloat(weight);
        const h = parseFloat(height);

        // Validation
        if (isNaN(w) || w <= 0) {
            setError('Please enter a valid weight (must be greater than 0)');
            setResult(null);
            return;
        }
        if (w > 500) {
            setError('Weight must be less than 500 kg');
            setResult(null);
            return;
        }
        if (isNaN(h) || h <= 0) {
            setError('Please enter a valid height (must be greater than 0)');
            setResult(null);
            return;
        }
        if (h < 50 || h > 300) {
            setError('Height must be between 50 and 300 cm');
            setResult(null);
            return;
        }

        const heightInMeters = h / 100;
        const bmi = w / (heightInMeters * heightInMeters);
        const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : 'Obese';
        const color = bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-amber-400' : 'text-red-400';
        setResult({ bmi, category, color });
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
                    <span className="text-white">BMI Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Free Health Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        BMI <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Calculate your Body Mass Index (BMI) instantly. Understand your weight category and get personalized health insights.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Calculate Your BMI</h2>
                        <p className="text-sm text-slate-400">Enter your weight and height to calculate your Body Mass Index</p>
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
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Height (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="e.g., 170"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                        >
                            Calculate BMI
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your BMI</p>
                                <p className={`text-5xl font-black ${result.color} mb-2`}>{result.bmi.toFixed(1)}</p>
                                <p className={`text-lg font-bold ${result.color}`}>{result.category}</p>
                                <p className="text-sm text-slate-400 mt-4 max-w-md mx-auto">
                                    {result.category === 'Normal Weight'
                                        ? 'Your BMI is within the healthy range. Maintain your current lifestyle!'
                                        : 'Consider consulting a healthcare provider for personalized advice on achieving a healthy weight.'}
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <Link href="/doctors/specialty/general-physician" className="flex-1 py-3 text-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm font-bold text-white hover:bg-white/[0.1] transition-all">
                                    Consult a Doctor
                                </Link>
                                <Link href="/tools" className="flex-1 py-3 text-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm font-bold text-white hover:bg-white/[0.1] transition-all">
                                    Try Other Calculators
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* BMI Chart */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">BMI Categories</h2>
                    <div className="space-y-3">
                        {[
                            { range: 'Below 18.5', category: 'Underweight', color: 'bg-blue-500' },
                            { range: '18.5 - 24.9', category: 'Normal Weight', color: 'bg-emerald-500' },
                            { range: '25.0 - 29.9', category: 'Overweight', color: 'bg-amber-500' },
                            { range: '30.0 and above', category: 'Obese', color: 'bg-red-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
                                <div className={`w-4 h-4 rounded-full ${item.color}`} />
                                <div className="flex-1">
                                    <p className="font-bold text-white">{item.category}</p>
                                    <p className="text-sm text-slate-400">BMI: {item.range}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Content */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">What is BMI?</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400 space-y-4">
                        <p>
                            Body Mass Index (BMI) is a simple calculation using a person&apos;s height and weight. The formula is BMI = kg/m², where kg is your weight in kilograms and m² is your height in meters squared.
                        </p>
                        <p>
                            BMI is a useful screening tool to identify possible weight problems in adults. However, it is not a diagnostic tool. A high BMI doesn&apos;t necessarily mean you have health problems, and a normal BMI doesn&apos;t guarantee perfect health.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Limitations of BMI</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Does not differentiate between muscle and fat mass</li>
                            <li>May not be accurate for athletes or very muscular individuals</li>
                            <li>Does not account for age, gender, or ethnicity differences</li>
                            <li>Should be used alongside other health indicators</li>
                        </ul>
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'Body Fat Calculator', href: '/tools/body-fat-calculator', desc: 'Estimate your body fat percentage' },
                            { name: 'BMR Calculator', href: '/tools/bmr-calculator', desc: 'Calculate your daily calorie needs' },
                            { name: 'Water Intake Calculator', href: '/tools/water-intake-calculator', desc: 'Find your daily water requirement' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-emerald-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This BMI calculator provides estimates for informational purposes only and should not replace professional medical advice. Consult a healthcare provider for personalized health guidance.
                    </p>
                </div>
            </div>
        </div>
    );
}
