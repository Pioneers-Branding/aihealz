import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Medical Travel & Concierge — End-to-End Healthcare | aihealz',
    description: 'Travel for world-class medical care with aihealz. We manage your end-to-end journey including top hospital matchmaking, cost negotiation, airport transfers, and premium stay.',
    keywords: ['medical travel concierge', 'health tourism', 'hospitals in india', 'surgery travel abroad', 'cost of surgery abroad', 'medical travel agency'],
    openGraph: {
        title: 'Medical Travel & Concierge | aihealz',
        description: 'End-to-End Healthcare Travel Management.',
        url: 'https://aihealz.com/medical-travel',
        siteName: 'aihealz',
    }
};

export default function MedicalTravelPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-50 overflow-hidden font-sans">
            {/* Hero Section */}
            <section className="relative px-6 pt-32 pb-20 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 z-0 bg-[#050B14]">
                    <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Premium Hospital Care" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent"></div>
                    {/* Ambient Glows */}
                    <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary-900/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center mt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/30 border border-primary-500/30 text-primary-400 text-sm font-bold uppercase tracking-wider mb-8 backdrop-blur-md">
                        Global Health Concierge
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight drop-shadow-md">
                        World-Class Healthcare, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-300 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">Seamlessly Managed.</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                        Traveling to another city or country for surgery doesn't have to be stressful. Our end-to-end concierge matches you with top surgeons, negotiates costs, and handles your entire itinerary.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/medical-travel/bot" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold overflow-hidden transition-all hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative">Build My Estimate</span>
                            <svg className="w-5 h-5 relative transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                        <a href="#how-it-works" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-colors backdrop-blur-sm">
                            See How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* Comprehensive Services Grid */}
            <section className="py-32 px-6 relative border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A1128]/50 to-[#050B14] pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-sm">Everything is Taken Care Of</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">From the moment you arrive at the airport to your final clearance to fly home, our team provides 24/7 VIP assistance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: 'Hospital Matchmaking', desc: 'We leverage our data to find the absolute best surgeon and accredited facility for your specific condition.', iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-teal-400' },
                            { title: 'Cost Negotiation', desc: 'Get transparent, pre-negotiated package prices ensuring no hidden surprises on your medical bills.', iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400' },
                            { title: 'Visa & Flight Assistance', desc: 'Dedicated help for medical visa letters, flight bookings, and fast-track airport clearances.', iconPath: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', color: 'text-sky-400' },
                            { title: 'Premium Recovery Stays', desc: 'Recover in comfort at our partner luxury hotels or serviced apartments near the treating hospital.', iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'text-amber-400' },
                            { title: 'Dedicated Translators', desc: 'Bridge the language gap. We provide native-speaking medical translators to accompany you to all consults.', iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'text-violet-400' },
                            { title: 'Post-Op Remote Care', desc: 'Even after returning home, we bridge video consults with your surgeon to track your recovery.', iconPath: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'text-rose-400' },
                        ].map((s, i) => (
                            <div key={i} className="bg-[#0A1128]/80 backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 hover:border-primary-500/30 hover:-translate-y-1 transition-all duration-300 shadow-xl group">
                                <div className="mb-8 bg-[#050B14] border border-white/10 w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 shadow-inner overflow-hidden transition-all duration-300">
                                    <svg className={`w-10 h-10 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.iconPath} />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{s.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works (Journey) */}
            <section id="how-it-works" className="py-32 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-sm">Your Medical Journey</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">A transparent, step-by-step process designed for your ultimate peace of mind and swift recovery.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent -translate-y-1/2"></div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { step: '01', title: 'Free Review', desc: 'Share your medical reports over our secure chat for a free preliminary evaluation by top doctors.' },
                                { step: '02', title: 'Travel Plan', desc: 'Receive a structured treatment plan with exact hospital quotes, visa letters, and hotel options.' },
                                { step: '03', title: 'Treatment', desc: 'Arrive via our VIP airport pickup. Complete your procedure at a gold-standard facility.' },
                                { step: '04', title: 'Recovery', desc: 'Rest at a partner hotel and receive "Fit to Fly" clearance before heading safely home.' },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-10 border border-white/10 text-center hover:-translate-y-2 transition-transform duration-300 shadow-2xl flex flex-col items-center group">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white mb-8 shadow-[0_0_20px_rgba(45,212,191,0.4)] group-hover:scale-110 transition-transform duration-300 border border-white/10">
                                        {s.step}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{s.title}</h3>
                                    <p className="text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call To Action */}
            <section className="py-32 px-6 relative">
                <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10 bg-[#0A1128]/80 backdrop-blur-xl rounded-[3rem] p-12 md:p-16 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight drop-shadow-md relative z-10">Ready to plan your treatment?</h2>
                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
                        Speak directly with our International Patient Care Team. We're ready to review your case and provide a comprehensive treatment roadmap within 24 hours.
                    </p>
                    <Link href="/medical-travel/bot" className="relative z-10 group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-3xl font-black text-lg transition-all hover:scale-[1.02] overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-accent-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">Get Your Free PDF Estimate</span>
                        <svg className="w-6 h-6 relative z-10 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                    <p className="text-sm text-slate-500 mt-8 font-bold tracking-widest uppercase relative z-10">100% Confidential • No Obligation</p>
                </div>
            </section>
        </main>
    );
}
