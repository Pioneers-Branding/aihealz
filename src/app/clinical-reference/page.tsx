import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Clinical Reference & Tools | AIHealz',
    description: 'Access comprehensive medical references, drug databases, clinical guidelines, health calculators, and diagnostic tools for healthcare professionals and patients.',
};

const REFERENCE_CATEGORIES = [
    {
        slug: 'drugs',
        title: 'Drugs, OTCs, & Herbals',
        description: 'Pharmacology insights, dosages, side effects, and interactions',
        iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        color: 'from-rose-500 to-pink-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        textColor: 'text-rose-700',
    },
    {
        slug: 'guidelines',
        title: 'Latest Guidelines',
        description: 'Updated clinical guidelines from ACC, AHA, ADA, and more',
        iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
    },
    {
        slug: 'lab-medicine',
        title: 'Laboratory Medicine',
        description: 'Lab result interpretation and reference ranges',
        iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
    },
    {
        slug: 'anatomy',
        title: 'Clinical Anatomy',
        description: 'Detailed anatomical structures and surgical relevance',
        iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
    },
    {
        slug: 'procedures',
        title: 'Medical Procedures',
        description: 'Step-by-step guides and complication management',
        iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        color: 'from-cyan-500 to-sky-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        textColor: 'text-cyan-700',
    },
    {
        slug: 'slideshows',
        title: 'Clinical Slideshows',
        description: 'Visual diagnostic guides and presentations',
        iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
    },
    {
        slug: 'simulations',
        title: 'Cases & Quizzes',
        description: 'AI-generated patient scenarios and board-style questions',
        iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'from-red-500 to-rose-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
    },
    {
        slug: 'drug-interaction',
        title: 'Interaction Checker',
        description: 'Analyze polypharmacy for adverse drug interactions',
        iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        color: 'from-lime-500 to-green-600',
        bgColor: 'bg-lime-50',
        borderColor: 'border-lime-200',
        textColor: 'text-lime-700',
    },
    {
        slug: 'pill-identifier',
        title: 'Pill Identifier',
        description: 'Identify unknown medications by imprint, shape, color',
        iconPath: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        color: 'from-slate-500 to-gray-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        textColor: 'text-slate-700',
    },
];

const CALCULATOR_CATEGORIES = [
    {
        name: 'Body Metrics',
        calculators: ['BMI Calculator', 'Body Fat Percentage'],
    },
    {
        name: 'Cardiovascular',
        calculators: ['Heart Disease Risk Score'],
    },
    {
        name: 'Nephrology',
        calculators: ['Kidney Function (eGFR)'],
    },
    {
        name: 'Nutrition',
        calculators: ['BMR & Calorie Calculator', 'Daily Water Intake'],
    },
    {
        name: 'Endocrinology',
        calculators: ['Diabetes Risk Assessment'],
    },
    {
        name: 'Obstetrics',
        calculators: ['Due Date Calculator'],
    },
];

export default function ClinicalReferencePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <section className="relative pt-24 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-accent-50 opacity-50" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            AI-Powered Medical Resources
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Clinical Reference{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                                & Tools
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                            Access comprehensive medical references, drug databases, clinical calculators,
                            and diagnostic tools. Powered by AI for instant, evidence-based insights.
                        </p>
                    </div>
                </div>
            </section>

            {/* Reference Categories Grid */}
            <section className="px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </span>
                        Medical Reference Library
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {REFERENCE_CATEGORIES.map((category) => (
                            <Link
                                key={category.slug}
                                href={`/reference/${category.slug}`}
                                className={`group relative p-5 rounded-2xl border ${category.borderColor} ${category.bgColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.iconPath} />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold ${category.textColor} mb-1 group-hover:underline`}>
                                            {category.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {category.description}
                                        </p>
                                    </div>
                                    <svg className={`w-5 h-5 ${category.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Health Calculators Section */}
            <section className="px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                        <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        Health Calculators
                                    </h2>
                                    <p className="text-slate-300">
                                        Evidence-based calculators for clinical assessments and health metrics
                                    </p>
                                </div>
                                <Link
                                    href="/tools"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors shrink-0"
                                >
                                    View All Calculators
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {CALCULATOR_CATEGORIES.map((cat) => (
                                    <Link
                                        key={cat.name}
                                        href="/tools"
                                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                                    >
                                        <p className="text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">
                                            {cat.name}
                                        </p>
                                        <ul className="space-y-1">
                                            {cat.calculators.map((calc) => (
                                                <li key={calc} className="text-sm text-slate-300">
                                                    {calc}
                                                </li>
                                            ))}
                                        </ul>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Access Tools */}
            <section className="px-6 pb-24">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </span>
                        Quick Access Tools
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Symptom Checker */}
                        <Link
                            href="/symptoms"
                            className="group p-6 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Symptom Checker</h3>
                            <p className="text-slate-600 text-sm">
                                AI-powered symptom analysis to help identify potential conditions and specialist recommendations.
                            </p>
                        </Link>

                        {/* Report Analyzer */}
                        <Link
                            href="/analyze"
                            className="group p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Report Analyzer</h3>
                            <p className="text-slate-600 text-sm">
                                Upload medical reports for AI analysis with plain-English explanations and recommendations.
                            </p>
                        </Link>

                        {/* Find a Doctor */}
                        <Link
                            href="/doctors"
                            className="group p-6 bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Find a Specialist</h3>
                            <p className="text-slate-600 text-sm">
                                Search our verified directory of healthcare specialists by location and specialty.
                            </p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="px-6 pb-16">
                <div className="max-w-4xl mx-auto">
                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 mb-1">Medical Disclaimer</h4>
                                <p className="text-sm text-amber-800">
                                    The information provided by these tools is for educational and informational purposes only.
                                    It is not intended as a substitute for professional medical advice, diagnosis, or treatment.
                                    Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
