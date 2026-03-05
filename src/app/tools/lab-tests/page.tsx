'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Search, Filter, ChevronDown, ChevronRight, Droplet, Activity,
    Heart, Zap, Pill, Target, Sun, Shield, AlertCircle, Beaker,
    Globe, DollarSign, Clock, CheckCircle, X
} from 'lucide-react';

interface LabTest {
    id: string;
    name: string;
    category: string;
    description: string;
    fasting: boolean;
    turnaround: string;
    components: any[];
    costs: Record<string, { min: number; max: number }>;
    interpretation?: Record<string, string>;
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface LabData {
    categories: Category[];
    tests: LabTest[];
}

type CountryKey = 'usa' | 'uk' | 'india' | 'thailand' | 'mexico' | 'turkey' | 'uae';

const COUNTRIES: { key: CountryKey; label: string; flag: string; currency: string; symbol: string }[] = [
    { key: 'usa', label: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$' },
    { key: 'uk', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
    { key: 'india', label: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
    { key: 'thailand', label: 'Thailand', flag: '🇹🇭', currency: 'THB', symbol: '฿' },
    { key: 'mexico', label: 'Mexico', flag: '🇲🇽', currency: 'MXN', symbol: '$' },
    { key: 'turkey', label: 'Turkey', flag: '🇹🇷', currency: 'TRY', symbol: '₺' },
    { key: 'uae', label: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ' },
];

const CATEGORY_ICONS: Record<string, typeof Droplet> = {
    droplet: Droplet,
    activity: Activity,
    heart: Heart,
    zap: Zap,
    pill: Pill,
    filter: Filter,
    thermometer: Activity,
    target: Target,
    sun: Sun,
    shield: Shield,
    'heart-pulse': Heart,
    'alert-circle': AlertCircle,
    beaker: Beaker,
    clipboard: Beaker,
    wind: Activity,
};

// Timezone to country code mapping for auto-detection
const TZ_COUNTRY_MAP: Record<string, CountryKey> = {
    'Asia/Kolkata': 'india', 'Asia/Calcutta': 'india',
    'America/New_York': 'usa', 'America/Los_Angeles': 'usa', 'America/Chicago': 'usa', 'America/Denver': 'usa',
    'Europe/London': 'uk',
    'Asia/Dubai': 'uae',
    'Asia/Bangkok': 'thailand',
    'America/Mexico_City': 'mexico',
    'Europe/Istanbul': 'turkey',
};

function detectUserCountry(): CountryKey {
    // Check cookie first
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/aihealz-geo=([^;:]+)/);
        if (match) {
            const country = match[1].split(':')[0];
            // Map cookie country to CountryKey
            const countryMap: Record<string, CountryKey> = {
                'india': 'india', 'usa': 'usa', 'uk': 'uk',
                'uae': 'uae', 'thailand': 'thailand', 'mexico': 'mexico', 'turkey': 'turkey'
            };
            if (countryMap[country]) return countryMap[country];
        }
    }

    // Fall back to timezone detection
    if (typeof Intl !== 'undefined') {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TZ_COUNTRY_MAP[tz]) return TZ_COUNTRY_MAP[tz];
    }

    return 'usa'; // Default fallback
}

export default function LabTestsDirectory() {
    const [labData, setLabData] = useState<LabData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryKey>('usa');
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [expandedTest, setExpandedTest] = useState<string | null>(null);

    useEffect(() => {
        // Detect user's country on mount
        setSelectedCountry(detectUserCountry());

        fetch('/data/lab-tests.json')
            .then(res => res.json())
            .then(data => setLabData(data))
            .catch(console.error);
    }, []);

    const filteredTests = useMemo(() => {
        if (!labData) return [];

        let tests = labData.tests;

        if (selectedCategory) {
            tests = tests.filter(t => t.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            tests = tests.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.components.some((c: any) => c.name?.toLowerCase().includes(q))
            );
        }

        return tests;
    }, [labData, searchQuery, selectedCategory]);

    const currentCountry = COUNTRIES.find(c => c.key === selectedCountry)!;

    const formatCost = (costs: Record<string, { min: number; max: number }>, country: CountryKey) => {
        const cost = costs[country];
        if (!cost) return 'N/A';
        const countryInfo = COUNTRIES.find(c => c.key === country)!;
        return `${countryInfo.symbol}${cost.min} - ${countryInfo.symbol}${cost.max}`;
    };

    if (!labData) {
        return (
            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold mb-4">
                        <Beaker className="w-4 h-4" />
                        LAB REFERENCE GUIDE
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Lab Test Directory
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Explore {labData.tests.length}+ lab tests with normal ranges, costs by country,
                        and what your results mean.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tests (e.g., CBC, thyroid, cholesterol)..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        )}
                    </div>

                    {/* Country Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCountrySelector(!showCountrySelector)}
                            className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-medium hover:bg-emerald-500/20 transition-colors"
                        >
                            <Globe className="w-5 h-5" />
                            <span>{currentCountry.flag} {currentCountry.label}</span>
                            <DollarSign className="w-4 h-4" />
                        </button>

                        {showCountrySelector && (
                            <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] py-2">
                                <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase">
                                    Select Country for Prices
                                </p>
                                {COUNTRIES.map(country => (
                                    <button
                                        key={country.key}
                                        onClick={() => {
                                            setSelectedCountry(country.key);
                                            setShowCountrySelector(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5 ${
                                            selectedCountry === country.key ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300'
                                        }`}
                                    >
                                        <span>{country.flag}</span>
                                        <span>{country.label}</span>
                                        <span className="ml-auto text-xs text-slate-500">{country.currency}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            !selectedCategory
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        All Tests
                    </button>
                    {labData.categories.map(cat => {
                        const Icon = CATEGORY_ICONS[cat.icon] || Beaker;
                        const count = labData.tests.filter(t => t.category === cat.id).length;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    selectedCategory === cat.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.name}
                                <span className="text-xs opacity-60">({count})</span>
                            </button>
                        );
                    })}
                </div>

                {/* Results Count */}
                <p className="text-sm text-slate-500 mb-4">
                    Showing {filteredTests.length} of {labData.tests.length} tests
                </p>

                {/* Tests List */}
                <div className="space-y-4">
                    {filteredTests.map(test => {
                        const isExpanded = expandedTest === test.id;
                        const category = labData.categories.find(c => c.id === test.category);
                        const Icon = category ? (CATEGORY_ICONS[category.icon] || Beaker) : Beaker;

                        return (
                            <div
                                key={test.id}
                                className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {/* Test Header */}
                                <button
                                    onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{test.name}</h3>
                                            <p className="text-sm text-slate-400">{test.description}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                {test.fasting && (
                                                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                                                        <Clock className="w-3 h-3" />
                                                        Fasting Required
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500">
                                                    Results: {test.turnaround}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-emerald-400">
                                                {formatCost(test.costs, selectedCountry)}
                                            </p>
                                            <p className="text-xs text-slate-500">{currentCountry.currency}</p>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                                        {/* Components/Normal Ranges */}
                                        <h4 className="text-sm font-bold text-white mb-3">
                                            Components & Normal Ranges
                                        </h4>
                                        <div className="bg-slate-800/50 rounded-xl overflow-hidden mb-4">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-800">
                                                    <tr>
                                                        <th className="text-left p-3 text-slate-400 font-medium">Component</th>
                                                        <th className="text-left p-3 text-slate-400 font-medium">Normal Range</th>
                                                        <th className="text-left p-3 text-slate-400 font-medium">Unit</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {test.components.map((comp: any, i: number) => (
                                                        <tr key={i}>
                                                            <td className="p-3 text-white">{comp.name}</td>
                                                            <td className="p-3 text-slate-300">
                                                                {comp.range && `${comp.range.low} - ${comp.range.high}`}
                                                                {comp.male && `M: ${comp.male.low}-${comp.male.high}`}
                                                                {comp.female && ` | F: ${comp.female.low}-${comp.female.high}`}
                                                                {comp.normal && typeof comp.normal === 'string' && comp.normal}
                                                                {comp.optimal && `< ${comp.optimal.high} (optimal)`}
                                                            </td>
                                                            <td className="p-3 text-slate-500">{comp.unit || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Interpretation */}
                                        {test.interpretation && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-bold text-white mb-2">
                                                    What Results Mean
                                                </h4>
                                                <div className="space-y-2">
                                                    {Object.entries(test.interpretation).map(([key, value]) => (
                                                        <div key={key} className="flex items-start gap-2 text-sm">
                                                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <span className="text-slate-300 font-medium capitalize">
                                                                    {key.replace(/_/g, ' ')}:
                                                                </span>
                                                                <span className="text-slate-400 ml-1">{value as string}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cost Comparison */}
                                        <h4 className="text-sm font-bold text-white mb-2">
                                            Cost by Country
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {COUNTRIES.map(country => (
                                                <div
                                                    key={country.key}
                                                    className={`p-3 rounded-lg text-center ${
                                                        country.key === selectedCountry
                                                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                            : 'bg-slate-800/50'
                                                    }`}
                                                >
                                                    <span className="text-lg">{country.flag}</span>
                                                    <p className="text-xs text-slate-500 mt-1">{country.label}</p>
                                                    <p className={`text-sm font-bold mt-1 ${
                                                        country.key === selectedCountry ? 'text-emerald-400' : 'text-white'
                                                    }`}>
                                                        {formatCost(test.costs, country.key)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredTests.length === 0 && (
                    <div className="text-center py-16">
                        <Beaker className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No tests found</h3>
                        <p className="text-slate-400">Try adjusting your search or filters.</p>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                    <p className="text-xs text-slate-500 text-center">
                        <strong className="text-slate-400">Note:</strong> Normal ranges may vary slightly between laboratories.
                        Always consult your healthcare provider for result interpretation. Costs are estimates and may vary by facility.
                    </p>
                </div>

                {/* Back Link */}
                <div className="text-center mt-8">
                    <Link href="/tools" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        ← Back to Health Tools
                    </Link>
                </div>
            </div>
        </main>
    );
}
