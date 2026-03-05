'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Condition = {
    slug: string;
    commonName: string;
    specialistType: string | null;
    description: string | null;
};

interface HomepageSpecialtiesProps {
    specialties: string[];
    grouped: Record<string, Condition[]>;
    counts?: Record<string, number>;
    icons?: Record<string, string>;
    country?: string;
    lang?: string;
}

export default function HomepageSpecialties({ specialties, grouped, counts, icons, country = 'india', lang = 'en' }: HomepageSpecialtiesProps) {
    const [activeSpecialty, setActiveSpecialty] = useState<string>(specialties[0] || '');

    if (!specialties.length || !grouped) return null;

    const currentConditions = grouped[activeSpecialty] || [];

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
            <div className="lg:w-1/3 shrink-0 flex flex-col h-full max-h-[600px]">
                {/* Mobile: Horizontal scrollable categories */}
                <div className="lg:hidden flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x relative z-10">
                    {specialties.map((specialty) => (
                        <button
                            key={specialty}
                            onClick={() => setActiveSpecialty(specialty)}
                            className={`whitespace-nowrap px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 snap-center border flex items-center gap-2 ${activeSpecialty === specialty
                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5'
                                }`}
                        >
                            {icons?.[specialty] && <span className="text-base">{icons[specialty]}</span>}
                            {specialty}
                            {counts?.[specialty] && (
                                <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded-md">
                                    {counts[specialty].toLocaleString()}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Desktop: Vertical list */}
                <div className="hidden lg:flex flex-col gap-2 overflow-y-auto no-scrollbar pr-4 relative z-10 sticky top-0">
                    <h3 className="text-xl font-bold text-white mb-4 px-2 tracking-tight">Specialties</h3>
                    {specialties.map((specialty) => (
                        <button
                            key={specialty}
                            onClick={() => setActiveSpecialty(specialty)}
                            className={`text-left px-5 py-4 rounded-2xl font-medium transition-all duration-300 group flex items-center justify-between border ${activeSpecialty === specialty
                                ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 shadow-[inset_0_0_20px_rgba(20,184,166,0.1)]'
                                : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSpecialty === specialty ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'
                                    }`}>
                                    <span className="text-lg">{icons?.[specialty] || specialty.charAt(0)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span>{specialty}</span>
                                    {counts?.[specialty] && (
                                        <span className="text-[10px] font-semibold text-slate-500">
                                            {counts[specialty].toLocaleString()} conditions
                                        </span>
                                    )}
                                </div>
                            </div>
                            <svg className={`w-4 h-4 transition-transform duration-300 ${activeSpecialty === specialty ? 'text-teal-400 translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}

                    {/* Browse All CTA */}
                    <Link
                        href="/conditions"
                        className="mt-4 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20 text-teal-400 font-semibold text-sm text-center hover:from-teal-500/20 hover:to-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        Browse All Conditions
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                </div>
            </div>

            <div className="lg:w-2/3 flex-1">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden min-h-[400px]">
                    {/* Subtle background glow based on interaction */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                {icons?.[activeSpecialty] && <span className="text-2xl">{icons[activeSpecialty]}</span>}
                                {activeSpecialty}
                            </h3>
                            {counts?.[activeSpecialty] && (
                                <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg">
                                    {counts[activeSpecialty].toLocaleString()} total
                                </span>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSpecialty}
                                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {currentConditions.slice(0, 10).map(cond => (
                                    <Link
                                        key={cond.slug}
                                        href={`/${country}/${lang}/${cond.slug}`}
                                        className="group bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between"
                                    >
                                        <div className="flex flex-col pr-4">
                                            <span className="text-slate-200 font-medium group-hover:text-white transition-colors line-clamp-1">{cond.commonName}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-teal-500/20 flex items-center justify-center shrink-0 transition-colors">
                                            <svg className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {currentConditions.length > 10 && (
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <Link href="/conditions" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-sm font-semibold group/btn">
                                    View all {counts?.[activeSpecialty]?.toLocaleString() || currentConditions.length} {activeSpecialty} conditions
                                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
