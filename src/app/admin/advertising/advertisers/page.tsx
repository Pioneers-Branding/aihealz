import prisma from '@/lib/db';
import Link from 'next/link';

export default async function AdvertisersPage() {
    const advertisers = await prisma.advertiser.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            geography: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            campaigns: {
                select: { id: true },
            },
            creatives: {
                select: { id: true },
            },
        },
    });

    const companyTypeLabels: Record<string, string> = {
        clinic: 'Clinic',
        hospital: 'Hospital',
        diagnostic: 'Diagnostic Lab',
        pharmacy: 'Pharmacy',
        pharma: 'Pharmaceutical',
        medtech: 'MedTech',
        insurance: 'Insurance',
        wellness: 'Wellness',
        other: 'Other',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Advertisers</h1>
                    <p className="text-slate-500 mt-1">Manage advertiser accounts</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/advertising"
                        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                    <Link
                        href="/admin/advertising/advertisers/new"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Advertiser
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Advertisers', count: advertisers.length, color: 'bg-blue-500' },
                    { label: 'Verified', count: advertisers.filter((a) => a.isVerified).length, color: 'bg-green-500' },
                    { label: 'Active', count: advertisers.filter((a) => a.isActive).length, color: 'bg-emerald-500' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center gap-3">
                        <div className={`w-2 h-8 ${stat.color} rounded-full`} />
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{stat.count}</div>
                            <div className="text-xs text-slate-500">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advertisers Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {advertisers.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div className="text-slate-500 mb-4">No advertisers yet</div>
                        <Link
                            href="/admin/advertising/advertisers/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                            Add First Advertiser
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaigns</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Creatives</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {advertisers.map((advertiser) => (
                                    <tr key={advertiser.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <Link href={`/admin/advertising/advertisers/${advertiser.id}`} className="hover:text-teal-600">
                                                <div className="flex items-center gap-3">
                                                    {advertiser.logo ? (
                                                        <img
                                                            src={advertiser.logo}
                                                            alt={advertiser.companyName}
                                                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-slate-900">{advertiser.companyName}</div>
                                                        <div className="text-xs text-slate-500">{advertiser.email}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-600">
                                            {companyTypeLabels[advertiser.companyType] || advertiser.companyType}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-600">
                                            {advertiser.geography?.name || '-'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                {advertiser.isVerified ? (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium border border-green-200">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium border border-yellow-200">
                                                        Pending
                                                    </span>
                                                )}
                                                {!advertiser.isActive && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {advertiser.campaigns.length}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-slate-600">
                                            {advertiser.creatives.length}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link
                                                href={`/admin/advertising/advertisers/${advertiser.id}`}
                                                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
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
        </div>
    );
}
