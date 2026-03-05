import { Metadata } from 'next';
import Link from 'next/link';
import SymptomChecker from '@/components/ui/symptom-checker';
import { FindDoctorCTA, BookTestCTA, MedicalTravelCTA } from '@/components/ui/cta-sections';

export const metadata: Metadata = {
    title: 'AI Diagnosis & Care — Analyze Your Symptoms',
    description: 'Describe your symptoms and let our AI engine analyze possible conditions, recommend diagnostic tests, and provide safe OTC and home care remedies.',
    keywords: ['symptom checker', 'AI diagnosis', 'medical symptoms', 'health check', 'aihealz', 'home remedies', 'OTC'],
    openGraph: {
        title: 'AI Diagnosis & Care | aihealz',
        description: 'Analyze your symptoms with our AI Care Bot.',
        url: 'https://aihealz.com/symptoms',
        siteName: 'aihealz',
    }
};

export default function SymptomsPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-50 pt-24 pb-16 relative overflow-hidden">
            {/* Ambient Lighting Background */}
            <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 relative z-10">

                {/* Hero */}
                <div className="mb-12 text-center mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/30 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span></span>
                        AI-Powered Analysis & Care
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 drop-shadow-md text-white">
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">Diagnosis & Care</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        Describe your symptoms and our clinical-grade AI will analyze possible conditions, recommend diagnostic tests, and prescribe safe OTC options and natural home remedies.
                    </p>
                </div>

                {/* Symptom Checker Component */}
                <div className="shadow-2xl shadow-black/50 rounded-[2.5rem] overflow-hidden border border-white/5 relative bg-[#0A1128]/80 backdrop-blur-xl">
                    <SymptomChecker />
                </div>

                {/* Trust Badges */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {[
                        { icon: <svg className="w-5 h-5 mx-auto text-primary-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, label: 'End-to-end Encrypted' },
                        { icon: <svg className="w-5 h-5 mx-auto text-primary-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>, label: 'Deleted After 24h' },
                        { icon: <svg className="w-5 h-5 mx-auto text-primary-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'HIPAA & GDPR Ready' },
                    ].map((badge, i) => (
                        <div key={i} className="py-5 px-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors">
                            {badge.icon}
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">{badge.label}</span>
                        </div>
                    ))}
                </div>

                {/* Next Steps CTAs */}
                <div className="mt-16">
                    <h2 className="text-xl font-bold text-white text-center mb-8">What Would You Like to Do Next?</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <FindDoctorCTA variant="sidebar" />
                        <BookTestCTA variant="card" />
                        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">Compare Treatment Costs</p>
                                    <p className="text-xs text-slate-400">Save up to 90% abroad</p>
                                </div>
                            </div>
                            <Link
                                href="/medical-travel/bot"
                                className="block w-full text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                                Get Free Quote
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Related Links */}
                <div className="mt-12 flex flex-wrap justify-center gap-3">
                    <Link href="/conditions" className="px-4 py-2 bg-white/5 text-slate-400 text-sm rounded-full border border-white/10 hover:border-primary-500/30 hover:text-primary-400 transition-colors">
                        Browse Conditions A-Z
                    </Link>
                    <Link href="/treatments" className="px-4 py-2 bg-white/5 text-slate-400 text-sm rounded-full border border-white/10 hover:border-primary-500/30 hover:text-primary-400 transition-colors">
                        Treatment Options
                    </Link>
                    <Link href="/analyze" className="px-4 py-2 bg-white/5 text-slate-400 text-sm rounded-full border border-white/10 hover:border-primary-500/30 hover:text-primary-400 transition-colors">
                        Upload Medical Report
                    </Link>
                    <Link href="/remedies" className="px-4 py-2 bg-white/5 text-slate-400 text-sm rounded-full border border-white/10 hover:border-primary-500/30 hover:text-primary-400 transition-colors">
                        Home Remedies
                    </Link>
                </div>

            </div>
        </main>
    );
}
