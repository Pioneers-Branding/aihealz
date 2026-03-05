'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface VaccineDose {
    age: string;
    note?: string;
}

interface VaccineScheduleItem {
    vaccine: string;
    name: string;
    doses: VaccineDose[];
}

interface CountrySchedule {
    name: string;
    authority: string;
    infant?: VaccineScheduleItem[];
    child?: VaccineScheduleItem[];
    adolescent?: VaccineScheduleItem[];
    adult?: VaccineScheduleItem[];
    booster?: VaccineScheduleItem[];
}

interface TravelVaccine {
    id: string;
    name: string;
    description: string;
    required_regions: string[];
    timing: string;
    duration: string;
    certificate: boolean;
    note?: string;
    costs: Record<string, { min: number; max: number }>;
}

interface VaccineInfo {
    fullName: string;
    type: string;
    protects: string[];
}

interface Destination {
    region: string;
    vaccines: string[];
    malaria: boolean | string;
}

interface VaccinationData {
    schedules: Record<string, CountrySchedule>;
    travel_vaccines: TravelVaccine[];
    vaccine_info: Record<string, VaccineInfo>;
    destinations: Destination[];
}

const COUNTRIES = [
    { key: 'usa', label: 'United States', flag: '🇺🇸' },
    { key: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
    { key: 'india', label: 'India', flag: '🇮🇳' },
    { key: 'thailand', label: 'Thailand', flag: '🇹🇭' },
    { key: 'mexico', label: 'Mexico', flag: '🇲🇽' },
    { key: 'turkey', label: 'Turkey', flag: '🇹🇷' },
    { key: 'uae', label: 'UAE', flag: '🇦🇪' },
];

const CURRENCY_MAP: Record<string, { symbol: string; rate: number }> = {
    usa: { symbol: '$', rate: 1 },
    uk: { symbol: '£', rate: 0.79 },
    india: { symbol: '₹', rate: 83 },
    thailand: { symbol: '฿', rate: 35 },
    mexico: { symbol: 'MX$', rate: 17 },
    turkey: { symbol: '₺', rate: 32 },
    uae: { symbol: 'AED', rate: 3.67 },
};

const AGE_GROUPS = [
    { key: 'infant', label: 'Infant (0-2 years)', iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { key: 'child', label: 'Child (2-11 years)', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key: 'adolescent', label: 'Adolescent (11-18 years)', iconPath: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'adult', label: 'Adult (18+ years)', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key: 'booster', label: 'Boosters', iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
];

export default function VaccinationsPage() {
    const [data, setData] = useState<VaccinationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('usa');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('infant');
    const [activeTab, setActiveTab] = useState<'schedule' | 'travel'>('schedule');
    const [selectedDestination, setSelectedDestination] = useState<string>('');
    const [priceCountry, setPriceCountry] = useState('usa');

    // Load data
    useEffect(() => {
        fetch('/data/vaccinations.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const schedule = data?.schedules[selectedCountry];
    const ageGroupSchedule = schedule?.[selectedAgeGroup as keyof CountrySchedule] as VaccineScheduleItem[] | undefined;

    const filteredTravelVaccines = useMemo(() => {
        if (!data || !selectedDestination) return data?.travel_vaccines || [];
        const dest = data.destinations.find(d => d.region === selectedDestination);
        if (!dest) return data.travel_vaccines;
        return data.travel_vaccines.filter(v =>
            dest.vaccines.some(dv => v.name.toLowerCase().includes(dv.toLowerCase()) || dv.toLowerCase().includes(v.name.toLowerCase()))
        );
    }, [data, selectedDestination]);

    const selectedDest = data?.destinations.find(d => d.region === selectedDestination);

    const formatPrice = (costs: Record<string, { min: number; max: number }>, country: string) => {
        const c = costs[country];
        if (!c) return 'N/A';
        const { symbol, rate } = CURRENCY_MAP[country] || { symbol: '$', rate: 1 };
        const min = Math.round(c.min * rate);
        const max = Math.round(c.max * rate);
        return `${symbol}${min} - ${symbol}${max}`;
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-green-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/tools" className="hover:text-cyan-400 transition-colors">Tools</Link>
                    <span>/</span>
                    <span className="text-slate-300">Vaccination Schedule</span>
                </nav>

                {/* Header */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                        Vaccination <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500">Schedule</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                        View country-specific immunization schedules and travel vaccine recommendations.
                        Compare costs across 7 countries.
                    </p>
                </div>

                {/* Tab Selector */}
                <div className="flex justify-center gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${
                            activeTab === 'schedule'
                                ? 'bg-green-500 text-slate-900'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Routine Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('travel')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${
                            activeTab === 'travel'
                                ? 'bg-green-500 text-slate-900'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Travel Vaccines
                    </button>
                </div>

                {activeTab === 'schedule' ? (
                    <>
                        {/* Country & Age Group Selectors */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Country Selector */}
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Country</h3>
                                <div className="flex flex-wrap gap-2">
                                    {COUNTRIES.map(c => (
                                        <button
                                            key={c.key}
                                            onClick={() => setSelectedCountry(c.key)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                selectedCountry === c.key
                                                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                                                    : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <span className="mr-1.5">{c.flag}</span>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Age Group Selector */}
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Age Group</h3>
                                <div className="flex flex-wrap gap-2">
                                    {AGE_GROUPS.filter(g => schedule?.[g.key as keyof CountrySchedule]).map(g => (
                                        <button
                                            key={g.key}
                                            onClick={() => setSelectedAgeGroup(g.key)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                                                selectedAgeGroup === g.key
                                                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                                    : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={g.iconPath} />
                                            </svg>
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        {schedule && (
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 mb-8">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{schedule.name}</h2>
                                        <p className="text-sm text-slate-400">{schedule.authority}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full">
                                            {ageGroupSchedule?.length || 0} vaccines
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vaccine Schedule Table */}
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left p-4 text-sm font-semibold text-slate-400">Vaccine</th>
                                            <th className="text-left p-4 text-sm font-semibold text-slate-400">Full Name</th>
                                            <th className="text-left p-4 text-sm font-semibold text-slate-400">Doses & Timing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ageGroupSchedule?.map((item, idx) => {
                                            const info = data?.vaccine_info[item.vaccine];
                                            return (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-slate-800/30">
                                                    <td className="p-4">
                                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded font-mono text-sm">
                                                            {item.vaccine}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-white">{item.name}</div>
                                                        {info && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {info.type} • Protects: {info.protects.join(', ')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.doses.map((dose, di) => (
                                                                <div key={di} className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm">
                                                                    <span className="text-cyan-400 font-medium">{dose.age}</span>
                                                                    {dose.note && (
                                                                        <span className="text-slate-500 text-xs block">{dose.note}</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {(!ageGroupSchedule || ageGroupSchedule.length === 0) && (
                                <div className="p-8 text-center text-slate-500">
                                    No vaccines scheduled for this age group in selected country.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Travel Vaccines Section */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Destination Selector */}
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Where are you traveling?</h3>
                                <select
                                    value={selectedDestination}
                                    onChange={(e) => setSelectedDestination(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                >
                                    <option value="">All Travel Vaccines</option>
                                    {data?.destinations.map(d => (
                                        <option key={d.region} value={d.region}>{d.region}</option>
                                    ))}
                                </select>
                                {selectedDest && (
                                    <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-400">Malaria Risk:</span>
                                            <span className={typeof selectedDest.malaria === 'boolean'
                                                ? selectedDest.malaria ? 'text-red-400' : 'text-green-400'
                                                : 'text-amber-400'
                                            }>
                                                {typeof selectedDest.malaria === 'boolean'
                                                    ? selectedDest.malaria ? 'Yes - Prophylaxis Required' : 'No'
                                                    : selectedDest.malaria
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price Country Selector */}
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">View Prices In</h3>
                                <div className="flex flex-wrap gap-2">
                                    {COUNTRIES.map(c => (
                                        <button
                                            key={c.key}
                                            onClick={() => setPriceCountry(c.key)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                priceCountry === c.key
                                                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                                                    : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <span className="mr-1.5">{c.flag}</span>
                                            {c.key.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Travel Vaccines Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {filteredTravelVaccines.map(vaccine => (
                                <div key={vaccine.id} className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white">{vaccine.name}</h3>
                                        {vaccine.certificate && (
                                            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">
                                                Certificate Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 mb-4">{vaccine.description}</p>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Timing:</span>
                                            <span className="text-cyan-400">{vaccine.timing}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Duration:</span>
                                            <span className="text-slate-300">{vaccine.duration}</span>
                                        </div>
                                        {vaccine.note && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-400 text-xs">{vaccine.note}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Estimated Cost:</span>
                                            <span className="text-lg font-bold text-green-400">
                                                {formatPrice(vaccine.costs, priceCountry)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="text-xs text-slate-500 mb-2">Required/Recommended for:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {vaccine.required_regions.slice(0, 3).map((region, i) => (
                                                <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">
                                                    {region}
                                                </span>
                                            ))}
                                            {vaccine.required_regions.length > 3 && (
                                                <span className="px-2 py-1 bg-slate-800 text-slate-500 text-xs rounded">
                                                    +{vaccine.required_regions.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-400 mb-1">Medical Disclaimer</h3>
                            <p className="text-sm text-slate-400">
                                This information is for educational purposes only and should not replace professional medical advice.
                                Consult your healthcare provider or travel medicine specialist for personalized vaccination recommendations.
                                Schedules may vary and costs are estimates only.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-900/40 via-emerald-900/20 to-slate-900 border border-green-500/20 p-8 md:p-12 shadow-2xl shadow-green-900/20 my-16">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                                Travel Health Services
                            </span>
                            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                Planning International Travel?
                            </h3>
                            <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                Get personalized travel health advice, find vaccination clinics near you, and ensure you&apos;re protected before your trip.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/medical-travel/bot" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all hover:-translate-y-1 flex items-center gap-2">
                                    Get Travel Health Plan
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
