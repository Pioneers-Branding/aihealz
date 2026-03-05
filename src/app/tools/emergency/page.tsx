'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmergencyService {
    name: string;
    number: string;
    type: string;
}

interface CountryEmergency {
    name: string;
    flag: string;
    universal_emergency: string;
    services: EmergencyService[];
    tips: string[];
}

interface EmergencyType {
    type: string;
    name: string;
    icon: string;
    symptoms: string[];
    actions: string[];
    warning: string;
}

interface FirstAidKit {
    name: string;
    items: string[];
}

interface EmergencyData {
    countries: Record<string, CountryEmergency>;
    emergency_types: EmergencyType[];
    first_aid_kits: Record<string, FirstAidKit>;
}

const SERVICE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    all: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    police: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    medical: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    fire: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    mental_health: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    crisis: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    poison: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    rescue: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    substance: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    accident: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    disaster: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    utility: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
};

// Timezone to country code mapping for auto-detection
const TZ_COUNTRY_MAP: Record<string, string> = {
    'Asia/Kolkata': 'india', 'Asia/Calcutta': 'india',
    'America/New_York': 'usa', 'America/Los_Angeles': 'usa', 'America/Chicago': 'usa', 'America/Denver': 'usa',
    'Europe/London': 'uk', 'Europe/Berlin': 'germany', 'Europe/Paris': 'france',
    'Asia/Dubai': 'uae', 'Australia/Sydney': 'australia', 'Australia/Melbourne': 'australia',
    'America/Toronto': 'canada', 'America/Vancouver': 'canada',
    'Asia/Singapore': 'singapore', 'Asia/Tokyo': 'japan',
    'Africa/Lagos': 'nigeria', 'Africa/Nairobi': 'kenya',
};

function detectUserCountry(): string {
    // Check cookie first
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/aihealz-geo=([^;:]+)/);
        if (match) {
            const country = match[1].split(':')[0];
            if (country) return country;
        }
    }

    // Fall back to timezone detection
    if (typeof Intl !== 'undefined') {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TZ_COUNTRY_MAP[tz]) return TZ_COUNTRY_MAP[tz];
    }

    return 'usa'; // Default fallback
}

export default function EmergencyPage() {
    const [data, setData] = useState<EmergencyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('usa');
    const [activeTab, setActiveTab] = useState<'numbers' | 'guide' | 'kits'>('numbers');
    const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);

    useEffect(() => {
        // Detect user's country on mount
        const detected = detectUserCountry();
        setSelectedCountry(detected);

        fetch('/data/emergency-services.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                // Verify detected country exists in data, otherwise fall back
                if (!d.countries[detected]) {
                    setSelectedCountry('usa');
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const country = data?.countries[selectedCountry];
    const countries = data ? Object.entries(data.countries) : [];

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-red-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/tools" className="hover:text-cyan-400 transition-colors">Tools</Link>
                    <span>/</span>
                    <span className="text-slate-300">Emergency Services</span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                        Emergency <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-500">Services</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                        Quick access to emergency numbers, first aid guides, and crisis support across 7 countries.
                    </p>
                </div>

                {/* Tab Selector */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    <button
                        onClick={() => setActiveTab('numbers')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${
                            activeTab === 'numbers'
                                ? 'bg-red-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Emergency Numbers
                    </button>
                    <button
                        onClick={() => setActiveTab('guide')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${
                            activeTab === 'guide'
                                ? 'bg-red-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Emergency Guide
                    </button>
                    <button
                        onClick={() => setActiveTab('kits')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${
                            activeTab === 'kits'
                                ? 'bg-red-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        First Aid Kits
                    </button>
                </div>

                {activeTab === 'numbers' && (
                    <>
                        {/* Country Selector */}
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-8">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Country</h3>
                            <div className="flex flex-wrap gap-2">
                                {countries.map(([key, c]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCountry(key)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            selectedCountry === key
                                                ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                                                : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                        }`}
                                    >
                                        <span className="mr-1.5">{c.flag}</span>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Emergency Number */}
                        {country && (
                            <div className="bg-gradient-to-br from-red-900/40 via-red-900/20 to-slate-900 border border-red-500/30 rounded-2xl p-8 mb-8 text-center">
                                <div className="text-sm text-red-400 uppercase tracking-wider mb-2">Universal Emergency Number</div>
                                <div className="text-6xl md:text-8xl font-black text-white mb-4">{country.universal_emergency}</div>
                                <div className="text-lg text-slate-400">{country.flag} {country.name}</div>
                                <div className="mt-6 flex justify-center">
                                    <a
                                        href={`tel:${country.universal_emergency}`}
                                        className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all hover:-translate-y-1 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Call Now
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* All Services */}
                        {country && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {country.services.map((service, idx) => {
                                    const colors = SERVICE_COLORS[service.type] || SERVICE_COLORS.all;
                                    return (
                                        <div key={idx} className={`${colors.bg} border ${colors.border} rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className={`text-sm ${colors.text} uppercase tracking-wider mb-1`}>
                                                        {service.type.replace('_', ' ')}
                                                    </div>
                                                    <div className="font-medium text-white mb-2">{service.name}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-2xl font-bold text-white">{service.number}</span>
                                                <a
                                                    href={`tel:${service.number.replace(/[^0-9+]/g, '')}`}
                                                    className={`px-3 py-1.5 ${colors.bg} ${colors.text} rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}
                                                >
                                                    Call
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tips */}
                        {country && (
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Emergency Tips for {country.name}</h3>
                                <ul className="space-y-3">
                                    {country.tips.map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-slate-400">
                                            <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'guide' && (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {data?.emergency_types.map((emergency) => (
                                <button
                                    key={emergency.type}
                                    onClick={() => setSelectedEmergency(selectedEmergency === emergency.type ? null : emergency.type)}
                                    className={`text-left p-6 rounded-2xl border transition-all ${
                                        selectedEmergency === emergency.type
                                            ? 'bg-red-500/20 border-red-500/40'
                                            : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-3xl mb-3">{emergency.icon}</div>
                                    <div className="font-bold text-white">{emergency.name}</div>
                                    <div className="text-sm text-slate-400 mt-1">Tap for guidance</div>
                                </button>
                            ))}
                        </div>

                        {selectedEmergency && (
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-8">
                                {(() => {
                                    const emergency = data?.emergency_types.find(e => e.type === selectedEmergency);
                                    if (!emergency) return null;
                                    return (
                                        <>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="text-4xl">{emergency.icon}</div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">{emergency.name}</h2>
                                                    <div className="text-red-400 text-sm mt-1 flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        {emergency.warning}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Symptoms to Watch For</h3>
                                                    <ul className="space-y-2">
                                                        {emergency.symptoms.map((s, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-slate-300">
                                                                <span className="text-red-400">•</span>
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">What to Do</h3>
                                                    <ul className="space-y-2">
                                                        {emergency.actions.map((a, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-slate-300">
                                                                <span className="text-green-400 font-bold">{i + 1}.</span>
                                                                {a}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'kits' && data && (
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {Object.entries(data.first_aid_kits).map(([key, kit]) => (
                            <div key={key} className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                                    {key === 'basic' && (
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                    {key === 'travel' && (
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                    {key === 'car' && (
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4-9v2m0 12v2m5.364-16.364l-1.414 1.414M7.05 7.05L5.636 5.636m0 12.728l1.414-1.414m11.314 1.414l-1.414-1.414M12 17a5 5 0 100-10 5 5 0 000 10z" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-4">{kit.name}</h3>
                                <ul className="space-y-2">
                                    {kit.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                                            <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-400 mb-1">In a Real Emergency</h3>
                            <p className="text-sm text-slate-400">
                                This information is for educational purposes. In a real emergency, call your local emergency number immediately.
                                Do not rely solely on this guide. Professional medical help should always be sought for emergencies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
