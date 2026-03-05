import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import ReferenceChat from '@/components/ui/reference-chat';

type CategorySlug =
    | 'drugs'
    | 'guidelines'
    | 'lab-medicine'
    | 'anatomy'
    | 'procedures'
    | 'slideshows'
    | 'simulations'
    | 'drug-interaction'
    | 'pill-identifier';

const CATEGORY_MAP: Record<CategorySlug, { title: string; desc: string; heroIconPath: string; placeholder: string; example: string }> = {
    'drugs': {
        title: 'Drugs, OTCs, & Herbals',
        desc: 'Advanced pharmacology insights, dosage guidelines, side effects, and off-label usages powered by clinical AI.',
        heroIconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        placeholder: 'Enter drug name (e.g., Atorvastatin, Ashwagandha)...',
        example: 'What is the standard pediatric dosing for Amoxicillin in acute otitis media?'
    },
    'guidelines': {
        title: 'Latest Clinical Guidelines',
        desc: 'Ask our AI to parse thousands of updated clinical guidelines from ACC, AHA, ADA, AAP, and more.',
        heroIconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        placeholder: 'Search guidelines (e.g., AHA Heart Failure 2023)...',
        example: 'Summarize the 2023 ACC/AHA guidelines for the management of patients with chronic coronary disease.'
    },
    'lab-medicine': {
        title: 'Laboratory Medicine',
        desc: 'Interpret complex lab results, reference ranges, and diagnostic algorithms instantly.',
        heroIconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
        placeholder: 'Enter lab test or result...',
        example: 'Explain elevated ALT and AST with a ratio greater than 2:1.'
    },
    'anatomy': {
        title: 'Clinical Anatomy',
        desc: 'Explore detailed anatomical structures, innervation, blood supply, and surgical relevance.',
        heroIconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
        placeholder: 'Enter anatomical structure...',
        example: 'Detail the arterial supply and venous drainage of the thyroid gland.'
    },
    'procedures': {
        title: 'Medical Procedures',
        desc: 'Step-by-step clinical procedure guides, contraindications, and complication management.',
        heroIconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        placeholder: 'Enter procedure name...',
        example: 'What are the absolute contraindications for a lumbar puncture?'
    },
    'slideshows': {
        title: 'Clinical Slideshows',
        desc: 'Visual diagnostic guides and clinical presentation breakdowns.',
        heroIconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        placeholder: 'Search visual presentations...',
        example: 'Show me classic ECG findings in hyperkalemia.'
    },
    'simulations': {
        title: 'Cases & Quizzes',
        desc: 'Test your clinical acumen against AI-generated patient scenarios and board-style quizzes.',
        heroIconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        placeholder: 'Start a simulation (e.g., ER Trauma case)...',
        example: 'Present a 55-year-old male with crushing chest pain and diaphoresis.'
    },
    'drug-interaction': {
        title: 'Drug Interaction Checker',
        desc: 'Analyze complex polypharmacy for adverse interactions and metabolic pathway conflicts.',
        heroIconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        placeholder: 'Enter multiple drugs (comma separated)...',
        example: 'Check interactions between Warfarin, Amiodarone, and Grapefruit juice.'
    },
    'pill-identifier': {
        title: 'Pill Identifier',
        desc: 'Identify unknown medications by imprint, shape, and color using AI vision and database cross-referencing.',
        heroIconPath: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        placeholder: 'Describe pill (e.g., Round, White, Imprint 54 411)...',
        example: 'Identify a capsule shaped, blue pill with "V 3202" imprinted.'
    }
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const categoryKey = category as CategorySlug;
    if (!CATEGORY_MAP[categoryKey]) return { title: 'Not Found' };

    return {
        title: `${CATEGORY_MAP[categoryKey].title} — AI Reference | aihealz`,
        description: CATEGORY_MAP[categoryKey].desc,
    };
}

export default async function ReferencePage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const categoryKey = category as CategorySlug;
    const data = CATEGORY_MAP[categoryKey];

    if (!data) {
        return (
            <main className="min-h-screen bg-[#050B14] text-white flex flex-col items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                        <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold mb-4">Reference Not Found</h1>
                    <p className="text-slate-400 mb-8">The clinical reference category &quot;{category}&quot; doesn&apos;t exist.</p>
                    <Link href="/clinical-reference" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition-colors">
                        Browse All References
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-50 font-sans pb-24">
            {/* Header Area */}
            <div className="relative pt-24 pb-16 px-6 border-b border-white/5 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-primary-900/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-primary-500/10 rounded-2xl flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={data.heroIconPath} />
                        </svg>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/40 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider mb-6">
                        AI Clinical Reference
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-md">
                        {data.title}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                        {data.desc}
                    </p>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="max-w-4xl mx-auto px-6 mt-12">
                <ReferenceChat
                    category={category}
                    placeholder={data.placeholder}
                    example={data.example}
                    title={data.title}
                />
            </div>

            {/* Contextual Links */}
            <div className="max-w-4xl mx-auto px-6 mt-16 text-center">
                <Link href="/doctors" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-bold transition-colors">
                    Need a human specialist? Search our Verified Directory &rarr;
                </Link>
            </div>
        </main>
    );
}
