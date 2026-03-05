import prisma from '@/lib/db';
import Link from 'next/link';

export default async function AdvertisingDashboard() {
    // Fetch key metrics
    const [
        totalAdvertisers,
        activeAdvertisers,
        totalCampaigns,
        activeCampaigns,
        pendingCampaigns,
        totalEnquiries,
        newEnquiries,
        totalImpressions,
        totalClicks,
        recentEnquiries,
        recentCampaigns,
    ] = await Promise.all([
        prisma.advertiser.count(),
        prisma.advertiser.count({ where: { isActive: true, isVerified: true } }),
        prisma.adCampaign.count(),
        prisma.adCampaign.count({ where: { status: 'active' } }),
        prisma.adCampaign.count({ where: { status: 'pending_review' } }),
        prisma.adEnquiry.count(),
        prisma.adEnquiry.count({ where: { status: 'new' } }),
        prisma.adImpression.count(),
        prisma.adClick.count(),
        prisma.adEnquiry.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                companyName: true,
                companyType: true,
                email: true,
                adBudget: true,
                status: true,
                createdAt: true,
            },
        }),
        prisma.adCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                advertiser: {
                    select: {
                        companyName: true,
                        slug: true,
                    },
                },
            },
        }),
    ]);

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    const stats = [
        {
            label: 'Total Advertisers',
            value: totalAdvertisers,
            subtext: `${activeAdvertisers} verified`,
            color: 'bg-blue-500',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        },
        {
            label: 'Active Campaigns',
            value: activeCampaigns,
            subtext: `${pendingCampaigns} pending review`,
            color: 'bg-emerald-500',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        },
        {
            label: 'Total Impressions',
            value: totalImpressions.toLocaleString(),
            subtext: `${ctr}% CTR`,
            color: 'bg-purple-500',
            icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
        },
        {
            label: 'Ad Enquiries',
            value: totalEnquiries,
            subtext: `${newEnquiries} new`,
            color: 'bg-amber-500',
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        },
    ];

    const statusBadgeColors: Record<string, string> = {
        new: 'bg-blue-100 text-blue-700',
        contacted: 'bg-yellow-100 text-yellow-700',
        qualified: 'bg-purple-100 text-purple-700',
        converted: 'bg-green-100 text-green-700',
        closed: 'bg-slate-100 text-slate-700',
        draft: 'bg-slate-100 text-slate-700',
        pending_review: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-blue-100 text-blue-700',
        active: 'bg-green-100 text-green-700',
        paused: 'bg-orange-100 text-orange-700',
        rejected: 'bg-red-100 text-red-700',
        expired: 'bg-slate-100 text-slate-700',
        completed: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Advertising Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage ad campaigns, advertisers, and enquiries</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/advertising/enquiries"
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        View Enquiries
                        {newEnquiries > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                {newEnquiries}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/admin/advertising/campaigns"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Campaign
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                                <svg className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                <div className="text-sm text-slate-500">{stat.label}</div>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-400">{stat.subtext}</div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Enquiries */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Recent Enquiries</h2>
                        <Link href="/admin/advertising/enquiries" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentEnquiries.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-500">
                                No enquiries yet
                            </div>
                        ) : (
                            recentEnquiries.map((enquiry) => (
                                <Link
                                    key={enquiry.id}
                                    href={`/admin/advertising/enquiries?id=${enquiry.id}`}
                                    className="block px-6 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-medium text-slate-900">{enquiry.companyName}</div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeColors[enquiry.status]}`}>
                                            {enquiry.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span>{enquiry.companyType}</span>
                                        <span>•</span>
                                        <span>{enquiry.adBudget || 'Budget TBD'}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {new Date(enquiry.createdAt).toLocaleDateString()}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Campaigns */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Recent Campaigns</h2>
                        <Link href="/admin/advertising/campaigns" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentCampaigns.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-500">
                                No campaigns yet
                            </div>
                        ) : (
                            recentCampaigns.map((campaign) => (
                                <Link
                                    key={campaign.id}
                                    href={`/admin/advertising/campaigns/${campaign.id}`}
                                    className="block px-6 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-medium text-slate-900">{campaign.name}</div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeColors[campaign.status]}`}>
                                            {campaign.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {campaign.advertiser.companyName}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span>Budget: ${Number(campaign.totalBudget).toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{campaign.billingModel}</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/admin/advertising/advertisers"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-slate-900">Add Advertiser</div>
                            <div className="text-sm text-slate-500">Create new account</div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/advertising/creatives"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-slate-900">Upload Creative</div>
                            <div className="text-sm text-slate-500">Add new ad images</div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/advertising/pricing"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-slate-900">Manage Pricing</div>
                            <div className="text-sm text-slate-500">Set CPM/CPC rates</div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/advertising/reports"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-slate-900">View Reports</div>
                            <div className="text-sm text-slate-500">Performance analytics</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
