'use client';

import Link from 'next/link';
import { useState } from 'react';

const STATS = [
    { value: '71,000+', label: 'Medical Conditions', iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { value: '1M+', label: 'Monthly Visitors', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { value: '18+', label: 'Countries', iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: '15+', label: 'Languages', iconPath: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
];

const AD_PLACEMENTS = [
    {
        name: 'Condition Page Sidebar',
        description: 'Premium sidebar placement on condition detail pages. Highly targeted to users researching specific medical conditions.',
        size: '300x250 / 300x600',
        ctr: '2.1%',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
        ),
    },
    {
        name: 'Homepage Featured',
        description: 'Showcase your clinic or hospital in the featured section of our homepage. Maximum visibility for brand awareness.',
        size: '970x250',
        ctr: '3.2%',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'Search Results',
        description: 'Appear at the top of search results when users look for treatments, doctors, or conditions in your specialty.',
        size: '728x90 / Native',
        ctr: '2.8%',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    {
        name: 'Doctor Profile Sidebar',
        description: 'Cross-promote your services alongside doctor profiles. Ideal for hospitals, diagnostic labs, and pharmacies.',
        size: '300x250',
        ctr: '1.9%',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        name: 'Sponsored Listings',
        description: 'Get featured as a recommended provider in condition pages. Native ad format that blends seamlessly with content.',
        size: 'Native Card',
        ctr: '4.1%',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
    },
    {
        name: 'Global Banner',
        description: 'Site-wide header or footer banner for maximum reach. Perfect for brand campaigns and awareness drives.',
        size: '970x90',
        ctr: '1.5%',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
    },
];

const PRICING_TIERS = [
    {
        name: 'Starter',
        price: '$0.50',
        unit: 'CPM',
        description: 'Perfect for small clinics testing digital advertising',
        features: [
            'Self-serve dashboard',
            'Basic geo-targeting',
            'Condition page placements',
            'Real-time analytics',
            'Email support',
        ],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Professional',
        price: '$0.25',
        unit: 'CPC',
        description: 'Best for growing healthcare businesses',
        features: [
            'Everything in Starter',
            'Advanced targeting',
            'All placement types',
            'A/B testing',
            'Dedicated account manager',
            'Custom reporting',
        ],
        cta: 'Get Started',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        unit: 'Flat Rate',
        description: 'For hospitals and healthcare networks',
        features: [
            'Everything in Professional',
            'Premium placements',
            'Exclusive sponsorships',
            'API access',
            'White-glove onboarding',
            'SLA guarantee',
            'Multi-location support',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

const TARGETING_OPTIONS = [
    { iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', name: 'Geographic', desc: '18+ countries, 500+ cities' },
    { iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', name: 'Condition', desc: '71,000+ medical conditions' },
    { iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', name: 'Specialty', desc: '25+ medical specialties' },
    { iconPath: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129', name: 'Language', desc: '15+ supported languages' },
];

const TESTIMONIALS = [
    {
        quote: "AIHealz helped us reach patients actively researching our specialty. Our appointment bookings increased by 40% in the first month.",
        author: "Dr. Priya Sharma",
        role: "Director, Apollo Multi-Specialty Clinic",
        location: "Mumbai, India",
    },
    {
        quote: "The targeting options are incredible. We can reach patients looking for specific treatments in specific cities. No wasted impressions.",
        author: "James Mitchell",
        role: "Marketing Head, HealthFirst Network",
        location: "London, UK",
    },
];

export default function AdvertisePage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const faqs = [
        {
            q: 'What types of healthcare businesses can advertise?',
            a: 'We welcome hospitals, clinics, diagnostic labs, pharmacies, medical device companies, health insurance providers, and pharmaceutical companies. All ads are reviewed for compliance with healthcare advertising standards.',
        },
        {
            q: 'How does geo-targeting work?',
            a: 'Our platform detects user location through IP geolocation and allows you to target by country, region, or city. You can target multiple locations in a single campaign or run location-specific campaigns.',
        },
        {
            q: 'What ad formats do you support?',
            a: 'We support display banners (various sizes), native sponsored listings, and featured placements. All formats are designed to be non-intrusive while maximizing engagement.',
        },
        {
            q: 'How is billing handled?',
            a: 'We offer CPM (cost per thousand impressions), CPC (cost per click), and flat-rate billing. You can set daily and total campaign budgets. Payment is processed securely through Stripe.',
        },
        {
            q: 'Can I track campaign performance?',
            a: 'Yes! Our dashboard provides real-time analytics including impressions, clicks, CTR, conversions, and ROI. You can segment data by placement, geography, and time period.',
        },
    ];

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-teal-900/30 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-semibold mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        Now accepting advertisers worldwide
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white leading-[1.1]">
                        Reach Millions of<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">
                            Healthcare Seekers
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-3xl mx-auto mb-10">
                        Advertise on the world&apos;s first and biggest multilingual healthcare platform.
                        <span className="text-white font-medium"> 71,000+ conditions. 18+ countries. 15+ languages.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/advertise/enquiry"
                            className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all hover:-translate-y-1 flex items-center gap-2 text-lg"
                        >
                            Start Advertising
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href="/advertise/pricing"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-lg"
                        >
                            View Pricing
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
                                <div className="w-10 h-10 mx-auto mb-2 bg-teal-500/10 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.iconPath} />
                                    </svg>
                                </div>
                                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Banner */}
            <section className="relative py-8 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified Medical Content
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            HIPAA-Aware Platform
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            E-E-A-T Compliant
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                            </svg>
                            24/7 Global Reach
                        </div>
                    </div>
                </div>
            </section>

            {/* Ad Placements Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                            Ad Placements
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Premium Placements Across the Platform
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Choose from multiple high-visibility placements designed to reach users at every stage of their healthcare journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {AD_PLACEMENTS.map((placement) => (
                            <div
                                key={placement.name}
                                className="group bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-teal-500/30 p-6 transition-all hover:bg-white/[0.05]"
                            >
                                <div className="w-14 h-14 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mb-4 group-hover:bg-teal-500/20 transition-colors">
                                    {placement.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{placement.name}</h3>
                                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{placement.description}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">{placement.size}</span>
                                    <span className="text-teal-400 font-semibold">Avg CTR: {placement.ctr}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Targeting Section */}
            <section className="relative py-24 px-6 bg-gradient-to-b from-transparent via-teal-900/10 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                                Advanced Targeting
                            </span>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                                Reach the Right Patients
                            </h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                Our granular targeting options ensure your ads reach users actively researching conditions relevant to your practice. No wasted impressions.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {TARGETING_OPTIONS.map((opt) => (
                                    <div key={opt.name} className="flex items-start gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.iconPath} />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{opt.name}</div>
                                            <div className="text-sm text-slate-400">{opt.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
                            <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
                                <div className="text-sm text-slate-400 mb-4">Example Campaign Targeting</div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-slate-300">Countries</span>
                                        <span className="text-teal-400 font-mono text-sm">India, USA, UK</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-slate-300">Cities</span>
                                        <span className="text-teal-400 font-mono text-sm">Mumbai, Delhi, NYC</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-slate-300">Conditions</span>
                                        <span className="text-teal-400 font-mono text-sm">Diabetes, Hypertension</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-slate-300">Specialty</span>
                                        <span className="text-teal-400 font-mono text-sm">Cardiology</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <span className="text-slate-300">Languages</span>
                                        <span className="text-teal-400 font-mono text-sm">English, Hindi</span>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-400">Estimated Reach</span>
                                        <span className="text-2xl font-bold text-white">125K</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full w-3/4"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative py-24 px-6" id="pricing">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                            Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Flexible Pricing for Every Budget
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Start with pay-per-impression or pay-per-click. Scale with flat-rate enterprise plans.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {PRICING_TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative rounded-3xl border p-8 ${
                                    tier.popular
                                        ? 'bg-gradient-to-b from-teal-900/40 to-slate-900/80 border-teal-500/30 shadow-xl shadow-teal-500/10'
                                        : 'bg-white/[0.03] border-white/10'
                                }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-500 text-slate-900 text-xs font-bold rounded-full">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                                    <p className="text-slate-400 text-sm">{tier.description}</p>
                                </div>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                                    <span className="text-slate-400 ml-2">/ {tier.unit}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                                            <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/advertise/enquiry"
                                    className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                                        tier.popular
                                            ? 'bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-lg shadow-teal-500/20'
                                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                    }`}
                                >
                                    {tier.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative py-24 px-6 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                            Testimonials
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Trusted by Healthcare Leaders
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                                <svg className="w-10 h-10 text-teal-500/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                                <p className="text-lg text-slate-300 mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                                <div>
                                    <div className="font-semibold text-white">{t.author}</div>
                                    <div className="text-sm text-slate-400">{t.role}</div>
                                    <div className="text-sm text-teal-400">{t.location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                            FAQ
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-semibold text-white pr-4">{faq.q}</span>
                                    <svg
                                        className={`w-5 h-5 text-teal-500 shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {activeFaq === i && (
                                    <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900/60 via-blue-900/40 to-slate-900 border border-teal-500/20 p-12 md:p-16 shadow-2xl shadow-teal-900/30">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                        <div className="relative z-10 text-center">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                                Ready to Grow Your Practice?
                            </h2>
                            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                                Join hundreds of healthcare businesses reaching millions of patients through AIHealz.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/advertise/enquiry"
                                    className="px-10 py-5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all hover:-translate-y-1 flex items-center gap-2 text-lg"
                                >
                                    Get Started Today
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/30 transition-all flex items-center gap-2 text-lg"
                                >
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
