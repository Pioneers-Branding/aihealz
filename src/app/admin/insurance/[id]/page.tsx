'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChartIcon, StarIcon, ClipboardIcon, HospitalIcon, DocumentIcon } from '@/components/ui/icons';

interface InsuranceProvider {
    id: number;
    slug: string;
    name: string;
    shortName?: string;
    providerType: string;
    description?: string;
    logo?: string;
    headquartersCountry?: string;
    headquartersCity?: string;
    website?: string;
    customerCarePhone?: string;
    claimPhone?: string;
    email?: string;
    operatingCountries: string[];
    operatingStates: string[];
    licenseNumber?: string;
    regulatoryBody?: string;
    establishedYear?: number;
    claimSettlementRatio?: number;
    rating?: number;
    reviewCount: number;
    isActive: boolean;
    stats: {
        totalClaims: number;
        totalClaimAmount: number;
        totalApprovedAmount: number;
        networkHospitals: number;
        activePlans: number;
    };
    plans: Array<{
        id: number;
        name: string;
        planType: string;
        basePremium?: number;
        sumInsured?: number;
        isActive: boolean;
    }>;
    hospitalTies: Array<{
        hospital: {
            id: number;
            name: string;
            city?: string;
            logo?: string;
        };
        isCashless: boolean;
    }>;
    tpaAssociations: Array<{
        tpa: {
            id: number;
            name: string;
            logo?: string;
        };
    }>;
}

export default function InsuranceDetailPage() {
    const params = useParams();
    const [provider, setProvider] = useState<InsuranceProvider | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'hospitals' | 'tpas'>('overview');

    useEffect(() => {
        fetchProvider();
    }, [params.id]);

    const fetchProvider = async () => {
        try {
            const res = await fetch(`/api/admin/insurance/${params.id}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                setProvider(data);
            }
        } catch (error) {
            console.error('Failed to fetch provider:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Insurance provider not found</p>
                <Link href="/admin/insurance" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Back to Providers
                </Link>
            </div>
        );
    }

    const providerTypeLabels: Record<string, string> = {
        private: 'Private',
        public: 'Public Sector',
        general: 'General',
        health: 'Health Only',
        standalone_health: 'Standalone Health',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <Link href="/admin/insurance" className="mt-1 text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex items-center gap-4">
                        {provider.logo ? (
                            <img src={provider.logo} alt={provider.name} className="w-16 h-16 rounded-xl object-contain border border-slate-200 bg-white p-1" />
                        ) : (
                            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-600">
                                {provider.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                    {providerTypeLabels[provider.providerType] || provider.providerType}
                                </span>
                                {provider.isActive ? (
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
                                {provider.headquartersCity}{provider.headquartersCountry && `, ${provider.headquartersCountry}`}
                                {provider.establishedYear && ` • Est. ${provider.establishedYear}`}
                            </p>
                        </div>
                    </div>
                </div>
                <Link
                    href={`/insurance/${provider.slug}`}
                    target="_blank"
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Site
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className={`bg-white rounded-xl border p-4 ${Number(provider.claimSettlementRatio || 0) >= 95 ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                        <ChartIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{provider.claimSettlementRatio ? `${Number(provider.claimSettlementRatio).toFixed(1)}%` : 'N/A'}</div>
                    <div className="text-xs text-slate-500">CSR</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                        <StarIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{provider.rating ? `${Number(provider.rating).toFixed(1)}` : 'N/A'}</div>
                    <div className="text-xs text-slate-500">Rating</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <ClipboardIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{provider.stats.activePlans}</div>
                    <div className="text-xs text-slate-500">Active Plans</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-2">
                        <HospitalIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{provider.stats.networkHospitals}</div>
                    <div className="text-xs text-slate-500">Network Hospitals</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <DocumentIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{provider.stats.totalClaims}</div>
                    <div className="text-xs text-slate-500">Total Claims</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-6">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'plans', label: `Plans (${provider.plans.length})` },
                        { key: 'hospitals', label: `Hospitals (${provider.hospitalTies.length})` },
                        { key: 'tpas', label: `TPAs (${provider.tpaAssociations.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600'
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
                        <h3 className="font-semibold text-slate-900 mb-4">Provider Details</h3>
                        <dl className="space-y-3 text-sm">
                            {provider.description && (
                                <div>
                                    <dt className="text-slate-500">Description</dt>
                                    <dd className="text-slate-900 mt-1">{provider.description}</dd>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-slate-500">License Number</dt>
                                    <dd className="text-slate-900">{provider.licenseNumber || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Regulatory Body</dt>
                                    <dd className="text-slate-900">{provider.regulatoryBody || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Customer Care</dt>
                                    <dd className="text-slate-900">{provider.customerCarePhone || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Claim Helpline</dt>
                                    <dd className="text-slate-900">{provider.claimPhone || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Email</dt>
                                    <dd className="text-slate-900">{provider.email || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Website</dt>
                                    <dd className="text-slate-900">
                                        {provider.website ? (
                                            <a href={provider.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                                Visit
                                            </a>
                                        ) : '-'}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Coverage Areas</h3>
                        <div className="space-y-4">
                            {provider.operatingCountries.length > 0 && (
                                <div>
                                    <div className="text-sm text-slate-500 mb-2">Countries</div>
                                    <div className="flex flex-wrap gap-2">
                                        {provider.operatingCountries.map((country) => (
                                            <span key={country} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                {country}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {provider.operatingStates.length > 0 && (
                                <div>
                                    <div className="text-sm text-slate-500 mb-2">States</div>
                                    <div className="flex flex-wrap gap-2">
                                        {provider.operatingStates.slice(0, 10).map((state) => (
                                            <span key={state} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                                {state}
                                            </span>
                                        ))}
                                        {provider.operatingStates.length > 10 && (
                                            <span className="px-2 py-1 text-slate-500 text-xs">
                                                +{provider.operatingStates.length - 10} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                        <h3 className="font-semibold text-slate-900 mb-4">Claims Summary</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="text-slate-500 text-sm">Total Claims</div>
                                <div className="text-2xl font-bold text-slate-900">{provider.stats.totalClaims}</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="text-slate-500 text-sm">Total Claim Amount</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    ₹{(provider.stats.totalClaimAmount / 100000).toFixed(1)}L
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="text-slate-500 text-sm">Approved Amount</div>
                                <div className="text-2xl font-bold text-green-600">
                                    ₹{(provider.stats.totalApprovedAmount / 100000).toFixed(1)}L
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {provider.plans.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {provider.plans.map((plan) => (
                                <div key={plan.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div>
                                        <div className="font-medium text-slate-900">{plan.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {plan.planType} • Sum Insured: ₹{plan.sumInsured ? (plan.sumInsured / 100000).toFixed(0) + 'L' : '-'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {plan.basePremium && (
                                            <span className="text-sm font-medium text-slate-900">
                                                ₹{plan.basePremium.toLocaleString()}/yr
                                            </span>
                                        )}
                                        {plan.isActive ? (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Active</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">Inactive</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No plans added</div>
                    )}
                </div>
            )}

            {activeTab === 'hospitals' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {provider.hospitalTies.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {provider.hospitalTies.map((tie, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        {tie.hospital.logo ? (
                                            <img src={tie.hospital.logo} alt={tie.hospital.name} className="w-10 h-10 rounded object-contain border border-slate-200" />
                                        ) : (
                                            <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center text-teal-600 font-medium">
                                                {tie.hospital.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-slate-900">{tie.hospital.name}</div>
                                            {tie.hospital.city && <div className="text-xs text-slate-500">{tie.hospital.city}</div>}
                                        </div>
                                    </div>
                                    {tie.isCashless && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                            Cashless
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No hospital tie-ups</div>
                    )}
                </div>
            )}

            {activeTab === 'tpas' && (
                <div className="bg-white rounded-xl border border-slate-200">
                    {provider.tpaAssociations.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {provider.tpaAssociations.map((assoc, i) => (
                                <div key={i} className="p-4 flex items-center gap-3 hover:bg-slate-50">
                                    {assoc.tpa.logo ? (
                                        <img src={assoc.tpa.logo} alt={assoc.tpa.name} className="w-10 h-10 rounded object-contain border border-slate-200" />
                                    ) : (
                                        <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center text-purple-600 font-medium">
                                            {assoc.tpa.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="font-medium text-slate-900">{assoc.tpa.name}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400">No TPA associations</div>
                    )}
                </div>
            )}
        </div>
    );
}
