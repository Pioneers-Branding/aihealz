import prisma from '@/lib/db';
import Link from 'next/link';

export default async function ReportsPage() {
    // Get aggregate stats
    const [
        totalImpressions,
        totalClicks,
        totalConversions,
        impressionsByPlacement,
        clicksByPlacement,
        topCampaigns,
        recentMetrics,
    ] = await Promise.all([
        prisma.adImpression.count(),
        prisma.adClick.count(),
        prisma.adConversion.count(),
        prisma.adImpression.groupBy({
            by: ['placement'],
            _count: true,
        }),
        prisma.adClick.groupBy({
            by: ['placement'],
            _count: true,
        }),
        prisma.adCampaign.findMany({
            where: { status: 'active' },
            orderBy: { spentAmount: 'desc' },
            take: 5,
            include: {
                advertiser: { select: { companyName: true } },
                _count: { select: { impressions: true, clicks: true, conversions: true } },
            },
        }),
        prisma.adDailyMetrics.findMany({
            orderBy: { date: 'desc' },
            take: 30,
            include: {
                campaign: {
                    select: { name: true },
                },
            },
        }),
    ]);

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

    const placementLabels: Record<string, string> = {
        condition_sidebar: 'Condition Sidebar',
        condition_inline: 'Condition Inline',
        homepage_hero: 'Homepage Hero',
        homepage_featured: 'Homepage Featured',
        search_results_top: 'Search Top',
        search_results_inline: 'Search Inline',
        doctor_profile_sidebar: 'Doctor Profile',
        treatment_page_sidebar: 'Treatment Page',
        global_header_banner: 'Header Banner',
        global_footer_banner: 'Footer Banner',
    };

    // Merge impressions and clicks by placement
    const placementStats = impressionsByPlacement.map((imp) => {
        const clicks = clicksByPlacement.find((c) => c.placement === imp.placement)?._count || 0;
        const placementCtr = imp._count > 0 ? ((clicks / imp._count) * 100).toFixed(2) : '0.00';
        return {
            placement: imp.placement,
            label: placementLabels[imp.placement] || imp.placement,
            impressions: imp._count,
            clicks,
            ctr: placementCtr,
        };
    }).sort((a, b) => b.impressions - a.impressions);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Advertising Reports</h1>
                    <p className="text-slate-500 mt-1">Performance analytics and metrics</p>
                </div>
                <Link
                    href="/admin/advertising"
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Overview Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Impressions', value: totalImpressions.toLocaleString(), iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'bg-blue-500' },
                    { label: 'Total Clicks', value: totalClicks.toLocaleString(), iconPath: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', color: 'bg-teal-500' },
                    { label: 'CTR', value: `${ctr}%`, iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'bg-purple-500' },
                    { label: 'Conversions', value: totalConversions.toLocaleString(), subtext: `${conversionRate}% rate`, iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-500' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`w-10 h-10 rounded-lg ${stat.color}/10 flex items-center justify-center`}>
                                <svg className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.iconPath} />
                                </svg>
                            </div>
                            <div className={`w-2 h-8 ${stat.color} rounded-full`} />
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                        {stat.subtext && <div className="text-xs text-slate-400 mt-1">{stat.subtext}</div>}
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Performance by Placement */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Performance by Placement</h2>
                    </div>
                    {placementStats.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">No data yet</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {placementStats.map((stat) => (
                                <div key={stat.placement} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900">{stat.label}</div>
                                        <div className="text-xs text-slate-500">
                                            {stat.impressions.toLocaleString()} impressions
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-teal-600">{stat.ctr}% CTR</div>
                                        <div className="text-xs text-slate-400">{stat.clicks} clicks</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Campaigns */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Top Active Campaigns</h2>
                    </div>
                    {topCampaigns.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">No active campaigns</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {topCampaigns.map((campaign, index) => {
                                const campaignCtr = campaign._count.impressions > 0
                                    ? ((campaign._count.clicks / campaign._count.impressions) * 100).toFixed(2)
                                    : '0.00';
                                return (
                                    <div key={campaign.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-500">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <Link href={`/admin/advertising/campaigns/${campaign.id}`} className="font-medium text-slate-900 hover:text-teal-600">
                                                    {campaign.name}
                                                </Link>
                                                <div className="text-xs text-slate-500">{campaign.advertiser.companyName}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-slate-900">${Number(campaign.spentAmount).toFixed(2)}</div>
                                            <div className="text-xs text-slate-400">{campaignCtr}% CTR</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Metrics Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Recent Daily Metrics</h2>
                    <span className="text-xs text-slate-500">Last 30 days</span>
                </div>
                {recentMetrics.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        No daily metrics recorded yet.
                        <p className="text-xs text-slate-400 mt-2">
                            Metrics are aggregated daily from campaign activity.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Date</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Campaign</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Impressions</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Clicks</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">CTR</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Spend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentMetrics.map((metric) => (
                                    <tr key={metric.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {new Date(metric.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-900">{metric.campaign.name}</td>
                                        <td className="py-3 px-4 text-right text-sm text-slate-600">{metric.impressions.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right text-sm text-slate-600">{metric.clicks}</td>
                                        <td className="py-3 px-4 text-right text-sm font-medium text-teal-600">
                                            {metric.ctr ? `${Number(metric.ctr).toFixed(2)}%` : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right text-sm font-medium text-slate-900">
                                            ${Number(metric.spend).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Export Section */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900">Export Reports</h3>
                    <p className="text-sm text-slate-500 mt-1">Download detailed reports in CSV format</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Export Impressions
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Export Clicks
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                        Full Report
                    </button>
                </div>
            </div>
        </div>
    );
}
