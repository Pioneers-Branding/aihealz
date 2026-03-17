import prisma from '@/lib/db';
import Link from 'next/link';
import { BuildingIcon, CheckIcon, HospitalIcon, UsersIcon } from '@/components/ui/icons';

export default async function TpasAdminPage() {
    const [tpas, stats] = await Promise.all([
        prisma.tpa.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        insuranceLinks: true,
                        hospitalLinks: true,
                        geographyPresence: true,
                    },
                },
            },
        }),
        Promise.all([
            prisma.tpa.count(),
            prisma.tpa.count({ where: { isActive: true } }),
            prisma.tpa.aggregate({ _sum: { networkHospitalsCount: true, livesManaged: true } }),
        ]),
    ]);

    const [totalCount, activeCount, sumStats] = stats;

    const tpaTypeLabels: Record<string, string> = {
        private: 'Private',
        public: 'Public',
        government: 'Government',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Third Party Administrators (TPAs)
                    </h1>
                    <p className="text-slate-500 mt-1">Manage TPAs, insurance partnerships, and hospital networks</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/insurance"
                        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                    <Link
                        href="/admin/tpas/new"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add TPA
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BuildingIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{totalCount.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Total TPAs</div>
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
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <HospitalIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{(sumStats._sum.networkHospitalsCount || 0).toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Network Hospitals</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{((sumStats._sum.livesManaged || 0) / 100000).toFixed(1)}L</div>
                            <div className="text-xs text-slate-500">Lives Managed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TPAs Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {tpas.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div className="text-slate-500 mb-4">No TPAs added yet</div>
                        <Link
                            href="/admin/tpas/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                        >
                            Add First TPA
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">TPA</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">HQ</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Insurers</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospitals</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Presence</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tpas.map((tpa) => (
                                    <tr key={tpa.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                {tpa.logo ? (
                                                    <img
                                                        src={tpa.logo}
                                                        alt={tpa.name}
                                                        className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                                                        {tpa.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <Link href={`/admin/tpas/${tpa.id}`} className="font-medium text-slate-900 hover:text-purple-600">
                                                        {tpa.name}
                                                    </Link>
                                                    {tpa.shortName && (
                                                        <div className="text-xs text-slate-500">{tpa.shortName}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                                {tpaTypeLabels[tpa.tpaType] || tpa.tpaType}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-600">
                                            {tpa.headquartersCity || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {tpa._count.insuranceLinks}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {tpa.networkHospitalsCount || tpa._count.hospitalLinks || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {tpa._count.geographyPresence} cities
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {tpa.rating ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-amber-500">★</span>
                                                    <span className="font-medium">{Number(tpa.rating).toFixed(1)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {tpa.isActive ? (
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
                                            <Link
                                                href={`/admin/tpas/${tpa.id}`}
                                                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                                            >
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                    <div className="font-medium text-purple-900">What is a TPA?</div>
                    <div className="text-sm text-purple-700 mt-1">
                        Third Party Administrators (TPAs) are intermediaries licensed by IRDAI to process health insurance claims.
                        They manage cashless hospitalization, claim settlements, and maintain networks of hospitals for insurance companies.
                    </div>
                </div>
            </div>
        </div>
    );
}
