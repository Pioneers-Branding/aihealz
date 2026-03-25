import prisma from '@/lib/db';
import Link from 'next/link';

export default async function PricingAdminPage() {
    const pricing = await prisma.adPlacementPricing.findMany({
        orderBy: [{ placement: 'asc' }, { countryCode: 'asc' }],
    });

    const placementLabels: Record<string, string> = {
        condition_sidebar: 'Condition Page Sidebar',
        condition_inline: 'Condition Inline',
        homepage_hero: 'Homepage Hero',
        homepage_featured: 'Homepage Featured',
        search_results_top: 'Search Results Top',
        search_results_inline: 'Search Results Inline',
        doctor_profile_sidebar: 'Doctor Profile Sidebar',
        treatment_page_sidebar: 'Treatment Page Sidebar',
        global_header_banner: 'Global Header Banner',
        global_footer_banner: 'Global Footer Banner',
    };

    // Group by placement
    const groupedPricing = pricing.reduce((acc, p) => {
        if (!acc[p.placement]) acc[p.placement] = [];
        acc[p.placement].push(p);
        return acc;
    }, {} as Record<string, typeof pricing>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ad Placement Pricing</h1>
                    <p className="text-slate-500 mt-1">Configure CPM, CPC, and flat rate pricing</p>
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
                        href="/admin/advertising/pricing/new"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Pricing Rule
                    </Link>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                    <div className="font-medium text-blue-900">Pricing Logic</div>
                    <div className="text-sm text-blue-700 mt-1">
                        Country-specific pricing overrides global pricing. If no country-specific rule exists, the global rate (countryCode = null) is used.
                    </div>
                </div>
            </div>

            {/* Pricing Table */}
            {Object.keys(groupedPricing).length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-slate-500 mb-4">No pricing rules configured</div>
                    <Link
                        href="/admin/advertising/pricing/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                    >
                        Add First Pricing Rule
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedPricing).map(([placement, rules]: [string, typeof pricing]) => (
                        <div key={placement} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">{placementLabels[placement] || placement}</h3>
                                <span className="text-xs text-slate-500">{rules.length} rule{rules.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Region</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Min CPM</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Suggested CPM</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Min CPC</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Suggested CPC</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Flat Rate/mo</th>
                                            <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {rules.map((rule) => (
                                            <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${rule.countryCode ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {rule.countryCode || 'Global'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-mono text-slate-600">
                                                    ${Number(rule.minCpm).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-mono text-teal-600 font-medium">
                                                    ${Number(rule.suggestedCpm).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-mono text-slate-600">
                                                    ${Number(rule.minCpc).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-mono text-cyan-600 font-medium">
                                                    ${Number(rule.suggestedCpc).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-mono text-slate-600">
                                                    {rule.flatRateMonthly ? `$${Number(rule.flatRateMonthly).toFixed(0)}` : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${rule.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link
                                                        href={`/admin/advertising/pricing/${rule.id}`}
                                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Add Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Reference: Default Pricing</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500 text-xs mb-1">Base CPM</div>
                        <div className="font-semibold text-slate-900">$0.50 - $2.00</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500 text-xs mb-1">Base CPC</div>
                        <div className="font-semibold text-slate-900">$0.20 - $1.00</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500 text-xs mb-1">Premium Multiplier (US/UK)</div>
                        <div className="font-semibold text-slate-900">1.3x - 1.5x</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500 text-xs mb-1">Emerging Markets</div>
                        <div className="font-semibold text-slate-900">0.7x - 0.9x</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
