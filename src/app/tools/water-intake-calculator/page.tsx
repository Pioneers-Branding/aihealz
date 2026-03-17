'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WaterIntakeCalculatorPage() {
    const [weight, setWeight] = useState('');
    const [activity, setActivity] = useState('Moderate');
    const [climate, setClimate] = useState('Moderate');
    const [result, setResult] = useState<{ ml: number; liters: number; glasses: number } | null>(null);

    function calculate() {
        const w = parseFloat(weight);
        if (w > 0) {
            const base = w * 35; // ml per kg baseline
            const activityMultiplier: Record<string, number> = {
                'Sedentary': 1,
                'Light': 1.1,
                'Moderate': 1.2,
                'Active': 1.35,
                'Very Active': 1.5
            };
            const climateMultiplier: Record<string, number> = {
                'Cool': 1,
                'Moderate': 1.1,
                'Hot & Humid': 1.3
            };
            const ml = Math.round(base * (activityMultiplier[activity] || 1.2) * (climateMultiplier[climate] || 1.1));
            setResult({
                ml,
                liters: ml / 1000,
                glasses: Math.round(ml / 250)
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
                    <span className="text-white">Water Intake Calculator</span>
                </nav>

                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
                        Nutrition Tool
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Daily Water <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Intake Calculator</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Calculate how much water you should drink daily based on your body weight, activity level, and climate.
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] overflow-hidden mb-12">
                    <div className="p-6 md:p-8 border-b border-white/[0.06]">
                        <h2 className="text-xl font-bold text-white mb-2">Calculate Your Daily Water Needs</h2>
                        <p className="text-sm text-slate-400">Enter your details to find your optimal daily water intake</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Body Weight (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g., 70"
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Activity Level</label>
                                <select
                                    value={activity}
                                    onChange={e => setActivity(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                >
                                    <option value="Sedentary">Sedentary (desk job)</option>
                                    <option value="Light">Light (1-2 workouts/week)</option>
                                    <option value="Moderate">Moderate (3-5 workouts/week)</option>
                                    <option value="Active">Active (daily exercise)</option>
                                    <option value="Very Active">Very Active (athlete/manual labor)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Climate</label>
                                <select
                                    value={climate}
                                    onChange={e => setClimate(e.target.value)}
                                    className="w-full py-3 px-4 bg-slate-800/50 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                                >
                                    <option value="Cool">Cool/Cold</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Hot & Humid">Hot & Humid</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={calculate}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                        >
                            Calculate Water Intake
                        </button>
                    </div>

                    {result && (
                        <div className="p-6 md:p-8 bg-slate-800/30 border-t border-white/[0.06]">
                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                <div className="text-center p-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Daily Water Intake</p>
                                    <p className="text-4xl font-black text-white">{result.liters.toFixed(1)}L</p>
                                    <p className="text-sm text-slate-400">{result.ml.toLocaleString()} ml</p>
                                </div>
                                <div className="text-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Glasses (250ml)</p>
                                    <p className="text-4xl font-black text-white">{result.glasses}</p>
                                    <p className="text-sm text-slate-400">glasses per day</p>
                                </div>
                                <div className="text-center p-6 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                                    <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Bottles (500ml)</p>
                                    <p className="text-4xl font-black text-white">{Math.round(result.ml / 500)}</p>
                                    <p className="text-sm text-slate-400">bottles per day</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-xl">
                                <p className="text-sm text-slate-300">
                                    💡 <strong>Pro Tips:</strong> Spread your water intake throughout the day. Drink a glass when you wake up, before meals, and after exercise. Increase intake if you consume caffeine or alcohol.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hydration Tips */}
                <div className="bg-white/[0.03] rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-12">
                    <h2 className="text-xl font-bold text-white mb-6">Hydration Tips</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { tip: 'Start Your Day Right', desc: 'Drink a glass of water first thing in the morning', iconPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-amber-400' },
                            { tip: 'Before Meals', desc: 'Drink water 30 minutes before eating', iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400' },
                            { tip: 'During Exercise', desc: 'Sip water every 15-20 minutes while working out', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-orange-400' },
                            { tip: 'Watch for Signs', desc: 'Dark urine indicates dehydration', iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-yellow-400' },
                            { tip: 'Set Reminders', desc: 'Use apps or alarms to track intake', iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'text-cyan-400' },
                            { tip: 'Eat Water-Rich Foods', desc: 'Fruits and vegetables count toward hydration', iconPath: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', color: 'text-green-400' },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-slate-800/30 rounded-xl flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-white">{item.tip}</p>
                                    <p className="text-sm text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Content */}
                <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">Why is Hydration Important?</h2>
                    <div className="prose prose-invert prose-slate max-w-none text-slate-400 space-y-4">
                        <p>
                            Water is essential for nearly every bodily function. It regulates body temperature, transports nutrients, cushions joints, and helps remove waste. Even mild dehydration can affect your mood, energy, and cognitive function.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-6 mb-2">Benefits of Proper Hydration</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Improved physical performance and endurance</li>
                            <li>Better brain function and concentration</li>
                            <li>Healthy skin and reduced signs of aging</li>
                            <li>Better digestion and nutrient absorption</li>
                            <li>Reduced headaches and fatigue</li>
                        </ul>
                    </div>
                </div>

                {/* Related Tools */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Related Health Tools</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'BMR Calculator', href: '/tools/bmr-calculator', desc: 'Calculate daily calorie needs' },
                            { name: 'BMI Calculator', href: '/tools/bmi-calculator', desc: 'Check your body mass index' },
                            { name: 'Body Fat Calculator', href: '/tools/body-fat-calculator', desc: 'Estimate body fat percentage' },
                        ].map((tool, i) => (
                            <Link
                                key={i}
                                href={tool.href}
                                className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] hover:border-cyan-500/30 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80">
                        <strong>Disclaimer:</strong> This calculator provides general guidelines. Individual water needs vary based on health conditions, medications, and other factors. People with kidney disease or heart conditions should consult their doctor about fluid intake.
                    </p>
                </div>
            </div>
        </div>
    );
}
