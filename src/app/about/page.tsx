import { Metadata } from 'next';
import Link from 'next/link';
import {
    generateAboutPageSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
    generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'About Us | aihealz | The Medical AI Concierge',
    description: 'Learn about aihealz, the AI-powered medical directory and concierge transforming patient-doctor discovery globally. Discover our mission to democratize elite healthcare.',
    keywords: 'about aihealz, medical AI, AI diagnosis, find doctors, medical travel concierge, health technology, AI healthcare startup',
    openGraph: {
        title: 'About Us | aihealz',
        description: 'Organizing the world\'s medical expertise with AI.',
        url: 'https://aihealz.com/about',
        siteName: 'aihealz',
        images: [{ url: '/og-about.jpg', width: 1200, height: 630 }],
    }
};

// Structured data for SEO and AI citation
const aboutFaqs = [
    { question: 'What is AIHealz?', answer: 'AIHealz is an AI-powered healthcare platform that connects patients with verified doctors, hospitals, and medical information worldwide. We use advanced AI to help patients find the right specialists for their conditions.' },
    { question: 'How does AIHealz help patients?', answer: 'AIHealz helps patients by providing AI-assisted symptom analysis, connecting them with verified specialists, comparing treatment costs across countries, and facilitating medical travel for complex procedures.' },
    { question: 'Is AIHealz available globally?', answer: 'Yes, AIHealz operates globally with coverage in the USA, UK, India, Thailand, Turkey, UAE, Mexico, and many other countries. We have over 10,000 verified specialists across 500+ healthcare hubs.' },
    { question: 'How are doctors verified on AIHealz?', answer: 'All doctors on AIHealz undergo a verification process that includes license validation, credential checking, and review of their medical practice history. We partner with medical boards and hospitals to ensure accuracy.' },
];

const structuredData = [
    generateAboutPageSchema(),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
    ]),
    generateFAQSchema(aboutFaqs),
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Background */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-900/15 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 mt-10 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="text-white">About</span>
                </nav>

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
                        Connecting patients with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">expert care</span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        AIHealz helps you find the right specialist, understand treatment options, and compare costs across countries. From initial research to booking care abroad.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-3 gap-5 mb-16">
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">70,000+</div>
                        <div className="text-sm text-slate-500">Conditions Covered</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">36,000+</div>
                        <div className="text-sm text-slate-500">Verified Doctors</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">7</div>
                        <div className="text-sm text-slate-500">Countries</div>
                    </div>
                </div>

                {/* Story Section */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 md:p-12 mb-16">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Why we built AIHealz</h2>
                        <div className="space-y-4 text-slate-400">
                            <p>
                                Finding the right doctor for a specific condition shouldn't require hours of research. Traditional search engines return generic results that don't account for a specialist's actual experience with your condition.
                            </p>
                            <p>
                                AIHealz was built to solve this. We index detailed information about conditions, treatments, and specialists, then use AI to match patients with the right care based on their specific needs and location.
                            </p>
                            <p>
                                For patients considering treatment abroad, we provide transparent cost comparisons and connect them with accredited hospitals worldwide.
                            </p>
                        </div>
                        <div className="mt-8">
                            <Link href="/for-doctors" className="inline-flex items-center gap-2 text-teal-400 font-medium hover:text-teal-300 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Are you a doctor? Join our network
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-5 mb-16">
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Verified Information</h3>
                        <p className="text-sm text-slate-500">All doctors undergo verification. Medical content is reviewed for accuracy.</p>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Global Coverage</h3>
                        <p className="text-sm text-slate-500">Compare treatment costs across USA, UK, India, Thailand, Mexico, Turkey, and UAE.</p>
                    </div>
                </div>

            </div>
        </main>
    );
}
