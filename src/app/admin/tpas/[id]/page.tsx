'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StarIcon, ShieldIcon, HospitalIcon, UsersIcon } from '@/components/ui/icons';

interface Tpa {
    id: number;
    slug: string;
    name: string;
    shortName?: string;
    tpaType: string;
    description?: string;
    logo?: string;
    website?: string;
    customerCarePhone?: string;
    claimHelpline?: string;
    email?: string;
    headquartersCity?: string;
    operatingCountries: string[];
    operatingStates: string[];
    operatingCities: string[];
    licenseNumber?: string;
    regulatoryBody?: string;
    establishedYear?: number;
    networkHospitalsCount?: number;
    livesManaged?: number;
    rating?: number;
    reviewCount: number;
    isActive: boolean;
    insuranceLinks: Array<{
        insurer: {
            id: number;
            name: string;
            logo?: string;
        };
        isExclusive: boolean;
    }>;
    hospitalLinks: Array<{
        id: number;
        isCashless: boolean;
    }>;
    geographyPresence: Array<{
        geography: {
            id: number;
            name: string;
        };
        isMainOffice: boolean;
    }>;
}

export default function TpaDetailPage() {
    const params = useParams();
    const [tpa, setTpa] = useState<Tpa | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'insurers' | 'presence'>('overview');

    useEffect(() => {
        fetchTpa();
    }, [params.id]);

    const fetchTpa = async () => {
        try {
            const res = await fetch(`/api/admin/tpas/${params.id}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setTpa(data);
            }
        } catch (error) {
            console.error('Failed to fetch TPA:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!tpa) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">TPA not found</p>
                <Link href="/admin/tpas" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
                    Back to TPAs
                </Link>
            </div>
        );
    }

    const tpaTypeLabels: Record<string, string> = {
        private: 'Private',
        public: 'Public',
        government: 'Government',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Link href="/admin/tpas" className="mt-1 text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex items-center gap-4">
                        {tpa.logo ? (
                            <img src={tpa.logo} alt={tpa.name} className="w-16 h-16 rounded-xl object-contain border border-slate-200 bg-white p-1" />
                        ) : (
                            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-2xl font-bold text-purple-600">
                                {tpa.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{tpa.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                    {tpaTypeLabels[tpa.tpaType] || tpa.tpaType}
                                </span>
                                {tpa.isActive ? (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                {tpa.headquartersCity}
                                {tpa.establishedYear && ` • Est. ${tpa.establishedYear}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                        <StarIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{tpa.rating ? Number(tpa.rating).toFixed(1) : 'N/A'}</div>
                    <div className="text-xs text-slate-500">Rating</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <ShieldIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{tpa.insuranceLinks?.length || 0}</div>
                    <div className="text-xs text-slate-500">Insurance Partners</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
                        <HospitalIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{tpa.networkHospitalsCount?.toLocaleString() || 'N/A'}</div>
                    <div className="text-xs text-slate-500">Network Hospitals</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <UsersIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{tpa.livesManaged ? `${(tpa.livesManaged / 100000).toFixed(1)}L` : 'N/A'}</div>
                    <div className="text-xs text-slate-500">Lives Managed</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-6">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'insurers', label: `Insurers (${tpa.insuranceLinks?.length || 0})` },
                        { key: 'presence', label: `Presence (${tpa.geographyPresence?.length || 0})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">TPA Details</h3>
                        <dl className="space-y-3 text-sm">
                            {tpa.description && (
                                <div>
                                    <dt className="text-slate-500">Description</dt>
                                    <dd className="text-slate-900 mt-1">{tpa.description}</dd>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-slate-500">License Number</dt>
                                    <dd className="text-slate-900">{tpa.licenseNumber || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Regulatory Body</dt>
                                    <dd className="text-slate-900">{tpa.regulatoryBody || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Customer Care</dt>
                                    <dd className="text-slate-900">{tpa.customerCarePhone || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Claim Helpline</dt>
                                    <dd className="text-slate-900">{tpa.claimHelpline || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Email</dt>
                                    <dd className="text-slate-900">{tpa.email || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Website</dt>
                                    <dd>
                                        {tpa.website ? (
                                            <a href={tpa.website} target="_blank" rel="noopener" className="text-purple-600 hover:underline">
                                                Visit
                                            </a>
                                        ) : '-'}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Operating Areas</h3>
                        <div className="space-y-4">
                            {tpa.operatingStates && tpa.operatingStates.length > 0 && (
                                <div>
                                    <div className="text-sm text-slate-500 mb-2">States ({tpa.operatingStates.length})</div>
                                    <div className="flex flex-wrap gap-2">
                                        {tpa.operatingStates.slice(0, 8).map((state) => (
                                            <span key={state} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                                {state}
                                            </span>
                                        ))}
                                        {tpa.operatingStates.length > 8 && (
                                            <span className="px-2 py-1 text-slate-500 text-xs">
                                                +{tpa.operatingStates.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {tpa.operatingCities && tpa.operatingCities.length > 0 && (
                                <div>
                                    <div className="text-sm text-slate-500 mb-2">Cities ({tpa.operatingCities.length})</div>
                                    <div className="flex flex-wrap gap-2">
                                        {tpa.operatingCities.slice(0, 8).map((city) => (
                                            <span key={city} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                                {city}
                                            </span>
                                        ))}
                                        {tpa.operatingCities.length > 8 && (
                                            <span className="px-2 py-1 text-slate-500 text-xs">
                                                +{tpa.operatingCities.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'insurers' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {tpa.insuranceLinks && tpa.insuranceLinks.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {tpa.insuranceLinks.map((link, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        {link.insurer.logo ? (
                                            <img src={link.insurer.logo} alt={link.insurer.name} className="w-10 h-10 rounded object-contain border border-slate-200" />
                                        ) : (
                                            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-medium">
                                                {link.insurer.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="font-medium text-slate-900">{link.insurer.name}</div>
                                    </div>
                                    {link.isExclusive && (
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                            Exclusive
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No insurance partnerships</div>
                    )}
                </div>
            )}

            {activeTab === 'presence' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {tpa.geographyPresence && tpa.geographyPresence.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {tpa.geographyPresence.map((presence, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="font-medium text-slate-900">{presence.geography.name}</div>
                                    {presence.isMainOffice && (
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                            Main Office
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No geographic presence data</div>
                    )}
                </div>
            )}
        </div>
    );
}
