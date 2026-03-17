import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Free Health Tools & Medical Calculators | AIHealz',
    description: 'Free health calculators and medical tools. BMI calculator, calorie calculator, heart risk assessment, pregnancy due date, diabetes risk, and more. AI-powered health insights.',
    keywords: 'health calculators, medical tools, BMI calculator, calorie calculator, health assessment, medical calculator, free health tools',
};

// ── Health Tools Navigation ──────────────────────────────────
const HEALTH_TOOLS = [
    {
        id: 'drug-interactions',
        name: 'Drug Interactions Checker',
        desc: 'Check for dangerous interactions between medications',
        iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        iconColor: 'text-pink-400',
        color: 'from-pink-500 to-rose-500',
        href: '/tools/drug-interactions',
    },
    {
        id: 'lab-tests',
        name: 'Lab Test Directory',
        desc: 'Understand lab tests with normal ranges and costs',
        iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        iconColor: 'text-blue-400',
        color: 'from-blue-500 to-cyan-500',
        href: '/tools/lab-tests',
    },
    {
        id: 'vaccinations',
        name: 'Vaccination Schedule',
        desc: 'Country-specific immunization schedules and travel vaccines',
        iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        iconColor: 'text-green-400',
        color: 'from-green-500 to-emerald-500',
        href: '/tools/vaccinations',
    },
    {
        id: 'emergency',
        name: 'Emergency Services',
        desc: 'Emergency numbers, first aid guides, and crisis support',
        iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        iconColor: 'text-red-400',
        color: 'from-red-500 to-orange-500',
        href: '/tools/emergency',
    },
    {
        id: 'glossary',
        name: 'Medical Glossary',
        desc: 'Searchable dictionary of medical terms',
        iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        iconColor: 'text-violet-400',
        color: 'from-violet-500 to-purple-500',
        href: '/tools/glossary',
    },
    {
        id: 'surgery-checklist',
        name: 'Surgery Checklists',
        desc: 'Pre-op and post-op checklists for various surgeries',
        iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        iconColor: 'text-teal-400',
        color: 'from-teal-500 to-cyan-500',
        href: '/tools/surgery-checklist',
    },
];

// ── Calculator definitions with links ──────────────────────────────────
const CALCULATORS = [
    {
        id: 'bmi',
        name: 'BMI Calculator',
        desc: 'Calculate your Body Mass Index',
        category: 'Body Metrics',
        href: '/tools/bmi-calculator',
        iconColor: 'text-emerald-400',
        color: 'from-emerald-500 to-teal-500',
        iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    },
    {
        id: 'bmr',
        name: 'BMR & Calorie Calculator',
        desc: 'Find your daily calorie needs',
        category: 'Nutrition',
        href: '/tools/bmr-calculator',
        iconColor: 'text-orange-400',
        color: 'from-orange-500 to-amber-500',
        iconPath: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    },
    {
        id: 'heart-risk',
        name: 'Heart Disease Risk',
        desc: 'Assess cardiovascular risk',
        category: 'Cardiovascular',
        href: '/tools/heart-risk-calculator',
        iconColor: 'text-red-400',
        color: 'from-red-500 to-pink-500',
        iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
    {
        id: 'kidney',
        name: 'Kidney Function (eGFR)',
        desc: 'Check your kidney health',
        category: 'Nephrology',
        href: '/tools/kidney-function-calculator',
        iconColor: 'text-purple-400',
        color: 'from-purple-500 to-violet-500',
        iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    },
    {
        id: 'pregnancy',
        name: 'Pregnancy Due Date',
        desc: 'Calculate your due date',
        category: 'Obstetrics',
        href: '/tools/pregnancy-due-date-calculator',
        iconColor: 'text-pink-400',
        color: 'from-pink-500 to-rose-500',
        iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        id: 'diabetes-risk',
        name: 'Diabetes Risk Assessment',
        desc: 'Type 2 diabetes risk check',
        category: 'Endocrinology',
        href: '/tools/diabetes-risk-calculator',
        iconColor: 'text-blue-400',
        color: 'from-blue-500 to-cyan-500',
        iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
        id: 'water',
        name: 'Water Intake Calculator',
        desc: 'Daily hydration needs',
        category: 'Nutrition',
        href: '/tools/water-intake-calculator',
        iconColor: 'text-cyan-400',
        color: 'from-cyan-500 to-blue-500',
        iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    },
    {
        id: 'body-fat',
        name: 'Body Fat Calculator',
        desc: 'U.S. Navy method estimate',
        category: 'Body Metrics',
        href: '/tools/body-fat-calculator',
        iconColor: 'text-violet-400',
        color: 'from-violet-500 to-purple-500',
        iconPath: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
    },
];

export default function ToolsPage() {
    const categories = [...new Set(CALCULATORS.map(c => c.category))];

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-cyan-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Hero */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        AI-Enhanced Health Tools
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                        Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Calculators & Tools</span>
                    </h1>
                    <p className="text-lg text-slate-400">
                        Free medical calculators to assess your health metrics. All tools are evidence-based and provide personalized insights.
                    </p>
                </div>

                {/* Health Tools Grid */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </span>
                            Health Tools
                        </h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{HEALTH_TOOLS.length} Tools</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {HEALTH_TOOLS.map(tool => (
                            <Link
                                key={tool.id}
                                href={tool.href}
                                className="group relative bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`} />
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3 ${tool.iconColor}`}>
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.iconPath} />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{tool.name}</h3>
                                    <p className="text-sm text-slate-400">{tool.desc}</p>
                                    <div className="mt-4 flex items-center text-xs font-semibold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open Tool
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Health Calculators Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </span>
                            Health Calculators
                        </h2>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{CALCULATORS.length} Calculators</span>
                    </div>

                    {/* Category Groups */}
                    {categories.map(cat => (
                        <div key={cat} className="mb-8">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{cat}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {CALCULATORS.filter(c => c.category === cat).map(calc => (
                                    <Link
                                        key={calc.id}
                                        href={calc.href}
                                        className="group bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5 hover:border-teal-500/30 hover:bg-white/[0.05] transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${calc.iconColor}`}>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={calc.iconPath} />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white group-hover:text-teal-400 transition-colors truncate">{calc.name}</h4>
                                                <p className="text-xs text-slate-400 mt-1">{calc.desc}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center text-xs font-semibold text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Calculate
                                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 rounded-3xl p-8 md:p-12 text-center border border-cyan-500/20">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Need Personalized Health Advice?</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Our AI health assistant can analyze your results and provide personalized recommendations based on your health data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/healz-ai"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Talk to AI Health Assistant
                        </Link>
                        <Link
                            href="/doctors"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-xl border border-white/[0.1] transition-all"
                        >
                            Find a Specialist
                        </Link>
                    </div>
                </section>

                {/* Disclaimer */}
                <div className="mt-12 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200/80 text-center">
                        <strong>Disclaimer:</strong> These tools provide estimates for informational purposes only and should not replace professional medical advice. Always consult a healthcare provider for personalized health guidance.
                    </p>
                </div>
            </div>
        </div>
    );
}
