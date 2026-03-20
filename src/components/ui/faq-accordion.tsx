'use client';

import { useState } from 'react';

interface FaqItem {
    question: string;
    answer: string;
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="space-y-3">
            {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                    <div
                        key={i}
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                            isOpen
                                ? 'bg-slate-800/60 border-teal-500/30 shadow-lg shadow-teal-500/5'
                                : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                        }`}
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : i)}
                            className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                        >
                            <span className={`font-semibold text-base transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                                {faq.question}
                            </span>
                            <svg
                                className={`w-5 h-5 shrink-0 text-teal-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                        >
                            <div className="overflow-hidden">
                                <p className="px-6 pb-5 text-slate-400 leading-relaxed text-[15px]">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
