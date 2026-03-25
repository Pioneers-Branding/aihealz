import prisma from '@/lib/db';
import Link from 'next/link';

export default async function InsurancePlansPage() {
    const plans = await prisma.insurancePlan.findMany({
        orderBy: [{ provider: { name: 'asc' } }, { premiumStartsAt: 'asc' }],
        include: {
            provider: {
                select: { id: true, name: true, logo: true },
            },
        },
    });

    const planTypeLabels: Record<string, string> = {
        individual: 'Individual',
        family_floater: 'Family Floater',
        senior_citizen: 'Senior Citizen',
        critical_illness: 'Critical Illness',
        top_up: 'Top-Up',
        super_top_up: 'Super Top-Up',
        group: 'Group',
    };

    // Group plans by provider
    const groupedPlans = plans.reduce((acc, plan) => {
        const key = plan.provider.name;
        if (!acc[key]) acc[key] = { provider: plan.provider, plans: [] };
        acc[key].plans.push(plan);
        return acc;
    }, {} as Record<string, { provider: typeof plans[0]['provider']; plans: typeof plans }>);

    const stats = {
        total: plans.length,
        active: plans.filter(p => p.isActive).length,
        avgPremium: plans.length > 0
            ? Math.round(plans.reduce((sum, p) => sum + Number(p.premiumStartsAt || 0), 0) / plans.filter(p => p.premiumStartsAt).length)
            : 0,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Insurance Plans
                    </h1>
                    <p className="text-slate-500 mt-1">Manage all insurance plans across providers</p>
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
                        href="/admin/insurance/plans/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Plan
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-xs text-slate-500">Total Plans</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-xs text-slate-500">Active Plans</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-2xl font-bold text-slate-900">₹{stats.avgPremium.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Avg. Base Premium</div>
                </div>
            </div>

            {/* Plans by Provider */}
            {Object.keys(groupedPlans).length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <div className="text-slate-500 mb-4">No insurance plans added yet</div>
                    <Link
                        href="/admin/insurance/plans/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Add First Plan
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedPlans).map(([name, group]: [string, any]) => (
                        <div key={name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {group.provider.logo ? (
                                        <img src={group.provider.logo} alt={name} className="w-8 h-8 rounded object-contain" />
                                    ) : (
                                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {name.charAt(0)}
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-slate-900">{name}</h3>
                                </div>
                                <span className="text-xs text-slate-500">{group.plans.length} plans</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Plan Name</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Type</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Sum Insured</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Base Premium</th>
                                            <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {group.plans.map((plan) => (
                                            <tr key={plan.id} className="hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-900">{plan.name}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                        {planTypeLabels[plan.planType] || plan.planType}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm text-slate-600">
                                                    {plan.sumInsuredMax ? `₹${(Number(plan.sumInsuredMax) / 100000).toFixed(0)}L` : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm font-medium text-slate-900">
                                                    {plan.premiumStartsAt ? `₹${Number(plan.premiumStartsAt).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {plan.isActive ? (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Active</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link href={`/admin/insurance/plans/${plan.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
        </div>
    );
}
