import prisma from '@/lib/db';
import Link from 'next/link';
import { BuildingIcon, CheckIcon, ChartIcon, ClipboardIcon, ClockIcon } from '@/components/ui/icons';

export default async function InsuranceAdminPage() {
    const [providers, stats] = await Promise.all([
        prisma.insuranceProvider.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                _count: {
                    select: {
                        plans: true,
                        hospitalTies: true,
                        tpaAssociations: true,
                        claims: true,
                    },
                },
            },
        }),
        Promise.all([
            prisma.insuranceProvider.count(),
            prisma.insuranceProvider.count({ where: { isActive: true } }),
            prisma.insuranceProvider.aggregate({ _avg: { claimSettlementRatio: true, rating: true } }),
            prisma.insurancePlan.count({ where: { isActive: true } }),
            prisma.insuranceClaim.count({ where: { status: 'submitted' } }),
        ]),
    ]);

    const [totalCount, activeCount, avgStats, totalPlans, pendingClaims] = stats;

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Insurance Providers
                    </h1>
                    <p className="text-slate-500 mt-1">Manage insurance companies, plans, and hospital networks</p>
                </div>
                <Link
                    href="/admin/insurance/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Provider
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BuildingIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalCount.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Total Providers</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{activeCount.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Active</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <ChartIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{Number(avgStats._avg.claimSettlementRatio || 0).toFixed(0)}%</div>
                            <div className="text-xs text-slate-500">Avg. CSR</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <ClipboardIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalPlans.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Total Plans</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{pendingClaims.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Pending Claims</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-4">
                <Link
                    href="/admin/insurance/plans"
                    className="flex-1 bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-slate-900">Manage Plans</div>
                            <div className="text-xs text-slate-500">{totalPlans} active plans</div>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/admin/tpas"
                    className="flex-1 bg-white rounded-xl border border-slate-200 p-4 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-slate-900">TPAs</div>
                            <div className="text-xs text-slate-500">Third Party Administrators</div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Providers Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {providers.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div className="text-slate-500 mb-4">No insurance providers added yet</div>
                        <Link
                            href="/admin/insurance/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            Add First Provider
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CSR</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plans</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospitals</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">TPAs</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {providers.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                {provider.logo ? (
                                                    <img
                                                        src={provider.logo}
                                                        alt={provider.name}
                                                        className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                                                        {provider.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <Link href={`/admin/insurance/${provider.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                                                        {provider.name}
                                                    </Link>
                                                    {provider.shortName && (
                                                        <div className="text-xs text-slate-500">{provider.shortName}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                                {providerTypeLabels[provider.providerType] || provider.providerType}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {provider.claimSettlementRatio ? (
                                                <span className={`font-medium ${
                                                    Number(provider.claimSettlementRatio) >= 95 ? 'text-green-600' :
                                                    Number(provider.claimSettlementRatio) >= 90 ? 'text-emerald-600' :
                                                    Number(provider.claimSettlementRatio) >= 80 ? 'text-amber-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {Number(provider.claimSettlementRatio).toFixed(1)}%
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {provider.rating ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-amber-500">★</span>
                                                    <span className="font-medium">{Number(provider.rating).toFixed(1)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">Not rated</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {provider._count.plans}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {provider._count.hospitalTies}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {provider._count.tpaAssociations}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {provider.isActive ? (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/insurance/${provider.slug}`}
                                                    target="_blank"
                                                    className="text-slate-400 hover:text-slate-600"
                                                    title="View on site"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/admin/insurance/${provider.id}`}
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                >
                                                    Manage
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                    <div className="font-medium text-blue-900">CSR = Claim Settlement Ratio</div>
                    <div className="text-sm text-blue-700 mt-1">
                        Higher CSR indicates better claim approval rates. IRDAI requires insurers to disclose this metric annually.
                        Providers with CSR above 95% are marked as excellent.
                    </div>
                </div>
            </div>
        </div>
    );
}
