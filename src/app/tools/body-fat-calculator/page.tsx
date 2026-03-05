'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BodyFatCalculatorPage() {
    const [gender, setGender] = useState('Male');
    const [waist, setWaist] = useState('');
    const [neck, setNeck] = useState('');
    const [height, setHeight] = useState('');
    const [hip, setHip] = useState('');
    const [result, setResult] = useState<{ bodyFat: number; category: string; color: string } | null>(null);

    function calculate() {
        const w = parseFloat(waist);
        const n = parseFloat(neck);
        const h = parseFloat(height);
        const hp = parseFloat(hip);

        if (gender === 'Male' && w > 0 && n > 0 && h > 0) {
            const bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
            const category = bf < 14 ? 'Athletic' : bf < 18 ? 'Fit' : bf < 25 ? 'Average' : 'Above Average';
            const color = bf < 18 ? 'text-emerald-400' : bf < 25 ? 'text-amber-400' : 'text-red-400';
            setResult({ bodyFat: bf, category, color });
        } else if (gender === 'Female' && w > 0 && n > 0 && h > 0 && hp > 0) {
            const bf = 163.205 * Math.log10(w + hp - n) - 97.684 * Math.log10(h) - 78.387;
            const category = bf < 21 ? 'Athletic' : bf < 25 ? 'Fit' : bf < 32 ? 'Average' : 'Above Average';
            const color = bf < 25 ? 'text-emerald-400' : bf < 32 ? 'text-amber-400' : 'text-red-400';
            setResult({ bodyFat: bf, category, color });
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
                    <span className="text-white">Body Fat Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Body Metrics Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Body Fat <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">Percentage Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Estimate your body fat percentage using the U.S. Navy method. A more accurate measure than BMI for body composition.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Calculate Your Body Fat</h2>
                        <p className="text-sm text-slate-400">Use the U.S. Navy method to estimate body fat percentage</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['Male', 'Female'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g)}
                                        className={`py-3 rounded-xl font-bold transition-all ${gender === g
                                            ? 'bg-violet-500 text-white'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Height (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="e.g., 170"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Neck Circumference (cm)</label>
                                <input
                                    type="number"
                                    value={neck}
                                    onChange={e => setNeck(e.target.value)}
                                    placeholder="e.g., 38"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                                />
                                <p className="text-xs text-slate-500 mt-1">Measure below the Adam&apos;s apple</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Waist Circumference (cm)</label>
                                <input
                                    type="number"
                                    value={waist}
                                    onChange={e => setWaist(e.target.value)}
                                    placeholder="e.g., 85"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                                />
                                <p className="text-xs text-slate-500 mt-1">Measure at belly button level</p>
                            </div>
                            {gender === 'Female' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Hip Circumference (cm)</label>
                                    <input
                                        type="number"
                                        value={hip}
                                        onChange={e => setHip(e.target.value)}
                                        placeholder="e.g., 95"
                                        className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Measure at widest part of hips</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                        >
                            Calculate Body Fat
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="text-center mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estimated Body Fat</p>
                                <p className={`text-5xl font-black ${result.color} mb-2`}>{result.bodyFat.toFixed(1)}%</p>
                                <p className={`text-lg font-bold ${result.color}`}>{result.category}</p>
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-xl mb-6">
                                <p className="text-sm text-slate-300">
                                    {result.category === 'Athletic' && 'Excellent! Your body fat is in the athletic range. This level is typical for competitive athletes.'}
                                    {result.category === 'Fit' && 'Great job! Your body fat is in a healthy, fit range. This is ideal for overall health and fitness.'}
                                    {result.category === 'Average' && 'Your body fat is in the average range. Consider incorporating more exercise and balanced nutrition.'}
                                    {result.category === 'Above Average' && 'Your body fat is above the recommended range. Consider consulting a fitness professional or dietitian.'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/tools/bmi-calculator" className="flex-1 py-3 text-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm font-bold text-white hover:bg-white/[0.1] transition-all">
                                    Check Your BMI
                                </Link>
                                <Link href="/tools/bmr-calculator" className="flex-1 py-3 text-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm font-bold text-white hover:bg-white/[0.1] transition-all">
                                    Calculate Calories
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body Fat Ranges */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Body Fat Categories</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Men</h3>
                            <div className="space-y-2">
                                {[
                                    { category: 'Essential Fat', range: '2-5%', color: 'bg-blue-500' },
                                    { category: 'Athletic', range: '6-13%', color: 'bg-emerald-500' },
                                    { category: 'Fit', range: '14-17%', color: 'bg-lime-500' },
                                    { category: 'Average', range: '18-24%', color: 'bg-amber-500' },
                                    { category: 'Above Average', range: '25%+', color: 'bg-red-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                        <span className="flex-1 text-white">{item.category}</span>
                                        <span className="text-slate-400">{item.range}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Women</h3>
                            <div className="space-y-2">
                                {[
                                    { category: 'Essential Fat', range: '10-13%', color: 'bg-blue-500' },
                                    { category: 'Athletic', range: '14-20%', color: 'bg-emerald-500' },
                                    { category: 'Fit', range: '21-24%', color: 'bg-lime-500' },
                                    { category: 'Average', range: '25-31%', color: 'bg-amber-500' },
                                    { category: 'Above Average', range: '32%+', color: 'bg-red-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                        <span className="flex-1 text-white">{item.category}</span>
                                        <span className="text-slate-400">{item.range}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">About the U.S. Navy Method</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400 space-y-4">
                        <p>
                            The U.S. Navy body fat formula uses circumference measurements to estimate body fat percentage. It was developed for the U.S. Navy to assess recruits&apos; body composition without expensive equipment.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Why Body Fat % Matters More Than BMI</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>BMI doesn&apos;t distinguish between muscle and fat</li>
                            <li>Athletes may have high BMI but low body fat</li>
                            <li>Body fat percentage better predicts health risks</li>
                            <li>More accurate for tracking fitness progress</li>
                        </ul>
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Calculate your body mass index' },
                            { name: 'BMR Calculator', href: '/tools/bmr-calculator', desc: 'Find your daily calorie needs' },
                            { name: 'Water Intake Calculator', href: '/tools/water-intake-calculator', desc: 'Calculate hydration needs' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-violet-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> The U.S. Navy method provides estimates only. For accurate body fat measurement, consider DEXA scans, hydrostatic weighing, or professional assessment. This tool is not suitable for athletes with high muscle mass.
                    </p>
                </div>
            </div>
        </div>
    );
}
