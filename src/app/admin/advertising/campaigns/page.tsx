import prisma from '@/lib/db';
import Link from 'next/link';

export default async function CampaignsPage() {
    const campaigns = await prisma.adCampaign.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            advertiser: {
                select: {
                    id: true,
                    companyName: true,
                    slug: true,
                },
            },
            _count: {
                select: {
                    impressions: true,
                    clicks: true,
                    conversions: true,
                },
            },
        },
    });

    const statusColors: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-700 border-slate-200',
        pending_review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        approved: 'bg-blue-100 text-blue-700 border-blue-200',
        active: 'bg-green-100 text-green-700 border-green-200',
        paused: 'bg-orange-100 text-orange-700 border-orange-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        expired: 'bg-slate-100 text-slate-600 border-slate-200',
        completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ad Campaigns</h1>
                    <p className="text-slate-500 mt-1">Manage advertising campaigns</p>
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
                        href="/admin/advertising/campaigns/new"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Campaign
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', count: campaigns.length, color: 'bg-slate-500' },
                    { label: 'Active', count: campaigns.filter((c) => c.status === 'active').length, color: 'bg-green-500' },
                    { label: 'Pending Review', count: campaigns.filter((c) => c.status === 'pending_review').length, color: 'bg-yellow-500' },
                    { label: 'Paused', count: campaigns.filter((c) => c.status === 'paused').length, color: 'bg-orange-500' },
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

            {/* Campaigns Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {campaigns.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div className="text-slate-500 mb-4">No campaigns yet</div>
                        <Link
                            href="/admin/advertising/campaigns/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                            Create First Campaign
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Advertiser</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Impressions</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clicks</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CTR</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.map((campaign) => {
                                    const ctr = campaign._count.impressions > 0
                                        ? ((campaign._count.clicks / campaign._count.impressions) * 100).toFixed(2)
                                        : '0.00';
                                    return (
                                        <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <Link href={`/admin/advertising/campaigns/${campaign.id}`} className="hover:text-teal-600">
                                                    <div className="font-medium text-slate-900">{campaign.name}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {campaign.billingModel.toUpperCase()} • {campaign.objective}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Link href={`/admin/advertising/advertisers/${campaign.advertiser.id}`} className="text-sm text-slate-600 hover:text-teal-600">
                                                    {campaign.advertiser.companyName}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[campaign.status]}`}>
                                                    {campaign.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="text-sm font-medium text-slate-900">
                                                    ${Number(campaign.totalBudget).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    ${Number(campaign.spentAmount).toLocaleString()} spent
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right text-sm text-slate-600">
                                                {campaign._count.impressions.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-right text-sm text-slate-600">
                                                {campaign._count.clicks.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-right text-sm font-medium text-teal-600">
                                                {ctr}%
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Link
                                                    href={`/admin/advertising/campaigns/${campaign.id}`}
                                                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
