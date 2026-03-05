import { Metadata } from 'next';
import Link from 'next/link';
import {
    generateWebPageSchema,
    generateOrganizationSchema,
    generateBreadcrumbSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'Terms of Service | aihealz',
    description: 'Terms of Service for using aihealz directories, AI tools, and medical concierge platform.',
    keywords: 'terms of service aihealz, terms and conditions, medical disclaimer, aihealz rules',
    openGraph: {
        title: 'Terms of Service | aihealz',
        description: 'Read the Terms of Service for using aihealz.',
        url: 'https://aihealz.com/terms',
        siteName: 'aihealz',
    }
};

const structuredData = [
    generateWebPageSchema(
        'Terms of Service | AIHealz',
        'Terms of Service for using AIHealz directories, AI medical tools, symptom checker, and medical travel concierge platform.',
        'https://aihealz.com/terms',
        { dateModified: '2026-10-01' }
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms' },
    ]),
];

export default function TermsOfServicePage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-50 pt-24 pb-16 relative overflow-hidden">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Ambient Lighting */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 mt-10 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white drop-shadow-md">
                        Terms of Service
                    </h1>
                    <p className="text-primary-400 font-bold tracking-widest uppercase text-xs">Last Updated: October 2026</p>
                </div>

                <div className="bg-[#0A1128]/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/10 prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-strong:text-white">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-0 mb-6">1. Acceptance of Terms</h2>
                    <p className="text-slate-400">
                        By accessing or using aihealz ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service. The Service includes our global directory, Medical Travel Concierge, AI Diagnosis Bots, and B2B SaaS portals.
                    </p>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">2. Medical Disclaimer (Not Medical Advice)</h2>
                    <div className="bg-rose-950/40 border border-rose-500/30 p-8 rounded-2xl not-prose mb-10 text-rose-100 shadow-[0_0_30px_rgba(225,29,72,0.1)]">
                        <strong className="block mb-3 text-rose-400 font-black tracking-widest uppercase text-xs">CRITICAL LEGAL NOTICE:</strong>
                        <p className="leading-relaxed font-medium">The content provided by aihealz, including text, graphics, images, symptom checkers, and AI-generated analyses, is for <strong>informational and educational purposes only</strong>. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
                        <p className="mt-4 leading-relaxed font-medium">Never disregard professional medical advice or delay seeking it because of something you have read on this website. If you think you may have a medical emergency, call your doctor or 911 immediately.</p>
                    </div>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">3. Use of the Service</h2>
                    <ul className="text-slate-400 list-disc pl-6 space-y-2">
                        <li>You must be at least 18 years old to use this Service.</li>
                        <li>You are responsible for any activity that occurs through your use of the Service.</li>
                        <li>You must not use the Service for any illegal or unauthorized purpose.</li>
                        <li>You must not transmit any worms, viruses, or any code of a destructive nature.</li>
                    </ul>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">4. AI Tools and Accuracy</h2>
                    <p className="text-slate-400">
                        aihealz utilizes advanced Artificial Intelligence (AI), including Large Language Models, to organize medical data and provide general insights. While we strive for extreme accuracy, AI is not perfect and can make mistakes (hallucinations or algorithmic bias). You agree that aihealz and its parent company, ATZ Medappz Pvt Ltd, are not liable for any inaccuracies, errors, or omissions in the AI-generated content. You must independently verify critical information with a licensed board-certified medical professional.
                    </p>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">5. Doctor Profiles and Directory</h2>
                    <p className="text-slate-400">
                        We list medical professionals based on public data, user submissions, and partnerships. We attempt to verify credentials where indicated (designated by a "Verified" badge), but we do not endorse or guarantee the quality of care of any specific provider. It is your ultimate responsibility to verify a doctor's qualifications before seeking surgical or medical treatment.
                    </p>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">6. Intellectual Property</h2>
                    <p className="text-slate-400">
                        The Service and its original content, features, proprietary search indexes, and functionality are and will remain the exclusive property of aihealz and its licensors. The Service is protected by copyright, trademark, and other laws of both the country of operation and foreign countries. Scraping our directory is strictly prohibited without explicit written enterprise API access.
                    </p>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">7. Changes</h2>
                    <p className="text-slate-400">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>

                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mt-12 mb-6">8. Contact Us</h2>
                    <p className="text-slate-400">
                        If you have any questions about these Terms, please <Link href="/contact" className="font-bold underline">contact us</Link>.
                    </p>
                </div>
            </div>
        </main>
    );
}
