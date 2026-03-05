import prisma from '@/lib/db';
import Link from 'next/link';

interface SubscriptionStats {
    totalDoctors: number;
    freeTier: number;
    premiumTier: number;
    enterpriseTier: number;
    monthlyRevenue: number;
}

interface DoctorSubscription {
    id: number;
    name: string;
    slug: string;
    subscriptionTier: 'free' | 'premium' | 'enterprise';
    isVerified: boolean;
    createdAt: Date;
    geography: { name: string } | null;
    providerSubscription: {
        id: string;
        planId: string;
        status: string;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        stripeCustomerId: string | null;
    } | null;
}

async function getSubscriptionData(): Promise<{
    stats: SubscriptionStats;
    subscriptions: DoctorSubscription[];
}> {
    const [
        totalDoctors,
        freeTier,
        premiumTier,
        enterpriseTier,
        doctors,
    ] = await Promise.all([
        prisma.doctorProvider.count(),
        prisma.doctorProvider.count({ where: { subscriptionTier: 'free' } }),
        prisma.doctorProvider.count({ where: { subscriptionTier: 'premium' } }),
        prisma.doctorProvider.count({ where: { subscriptionTier: 'enterprise' } }),
        prisma.doctorProvider.findMany({
            where: {
                subscriptionTier: { in: ['premium', 'enterprise'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: {
                id: true,
                name: true,
                slug: true,
                subscriptionTier: true,
                isVerified: true,
                createdAt: true,
                geography: { select: { name: true } },
                providerSubscription: {
                    select: {
                        id: true,
                        planId: true,
                        status: true,
                        currentPeriodStart: true,
                        currentPeriodEnd: true,
                        stripeCustomerId: true,
                    },
                },
            },
        }),
    ]);

    // Calculate estimated monthly revenue
    const premiumPrice = 2999; // INR per month
    const enterprisePrice = 9999; // INR per month
    const monthlyRevenue = (premiumTier * premiumPrice) + (enterpriseTier * enterprisePrice);

    return {
        stats: {
            totalDoctors,
            freeTier,
            premiumTier,
            enterpriseTier,
            monthlyRevenue,
        },
        subscriptions: doctors as DoctorSubscription[],
    };
}

export default async function SubscriptionsPage() {
    const { stats, subscriptions } = await getSubscriptionData();

    const tierColors: Record<string, string> = {
        free: 'bg-slate-100 text-slate-700 border-slate-200',
        premium: 'bg-blue-100 text-blue-700 border-blue-200',
        enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-700',
        trialing: 'bg-blue-100 text-blue-700',
        past_due: 'bg-amber-100 text-amber-700',
        canceled: 'bg-rose-100 text-rose-700',
        unpaid: 'bg-rose-100 text-rose-700',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Subscriptions
                    </h1>
                    <p className="text-slate-500 mt-1">Manage doctor subscription plans and billing.</p>
                </div>
                <Link
                    href="/admin/doctors"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    Manage Doctors
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total Doctors</div>
                    <div className="text-3xl font-bold text-slate-900">{stats.totalDoctors}</div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Free Tier</div>
                    <div className="text-3xl font-bold text-slate-700">{stats.freeTier}</div>
                    <div className="text-xs text-slate-500 mt-1">
                        {stats.totalDoctors > 0 ? Math.round((stats.freeTier / stats.totalDoctors) * 100) : 0}% of total
                    </div>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200">
                    <div className="text-sm font-medium text-blue-600 mb-1">Premium</div>
                    <div className="text-3xl font-bold text-blue-700">{stats.premiumTier}</div>
                    <div className="text-xs text-blue-600 mt-1">
                        Rs. 2,999/mo each
                    </div>
                </div>
                <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200">
                    <div className="text-sm font-medium text-purple-600 mb-1">Enterprise</div>
                    <div className="text-3xl font-bold text-purple-700">{stats.enterpriseTier}</div>
                    <div className="text-xs text-purple-600 mt-1">
                        Rs. 9,999/mo each
                    </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200">
                    <div className="text-sm font-medium text-emerald-600 mb-1">Est. Monthly Revenue</div>
                    <div className="text-3xl font-bold text-emerald-700">
                        Rs. {stats.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">
                        Rs. {(stats.monthlyRevenue * 12).toLocaleString()}/year
                    </div>
                </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Subscription Distribution</h3>
                <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden">
                    <div
                        className="h-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700"
                        style={{ width: `${stats.totalDoctors > 0 ? (stats.freeTier / stats.totalDoctors) * 100 : 0}%` }}
                    >
                        {stats.freeTier > 0 && 'Free'}
                    </div>
                    <div
                        className="h-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                        style={{ width: `${stats.totalDoctors > 0 ? (stats.premiumTier / stats.totalDoctors) * 100 : 0}%` }}
                    >
                        {stats.premiumTier > 0 && 'Premium'}
                    </div>
                    <div
                        className="h-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white"
                        style={{ width: `${stats.totalDoctors > 0 ? (stats.enterpriseTier / stats.totalDoctors) * 100 : 0}%` }}
                    >
                        {stats.enterpriseTier > 0 && 'Enterprise'}
                    </div>
                </div>
                <div className="flex justify-between mt-3 text-xs text-slate-500">
                    <span>Free: {stats.totalDoctors > 0 ? Math.round((stats.freeTier / stats.totalDoctors) * 100) : 0}%</span>
                    <span>Premium: {stats.totalDoctors > 0 ? Math.round((stats.premiumTier / stats.totalDoctors) * 100) : 0}%</span>
                    <span>Enterprise: {stats.totalDoctors > 0 ? Math.round((stats.enterpriseTier / stats.totalDoctors) * 100) : 0}%</span>
                </div>
            </div>

            {/* Paying Subscribers Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Paying Subscribers</h3>
                        <p className="text-sm text-slate-500 mt-1">Doctors on premium and enterprise plans</p>
                    </div>
                    <div className="text-sm text-slate-500">
                        {subscriptions.length} subscriber{subscriptions.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No paying subscribers yet</h3>
                        <p className="text-slate-500 text-sm">Premium and enterprise subscribers will appear here.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Doctor</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Location</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Tier</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Status</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Period</th>
                                <th className="text-right p-4 font-bold text-slate-600 text-xs uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subscriptions.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                                {doc.name.charAt(0)}
                                            </div>
                                            <div>
                                                <Link
                                                    href={`/admin/doctors/${doc.id}`}
                                                    className="font-medium text-slate-900 hover:text-teal-600"
                                                >
                                                    {doc.name}
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-500">/{doc.slug}</p>
                                                    {doc.isVerified && (
                                                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {doc.geography?.name || '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${tierColors[doc.subscriptionTier]}`}>
                                            {doc.subscriptionTier}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {doc.providerSubscription ? (
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[doc.providerSubscription.status] || 'bg-slate-100 text-slate-700'}`}>
                                                {doc.providerSubscription.status}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600 text-xs">
                                        {doc.providerSubscription?.currentPeriodEnd ? (
                                            <span>
                                                Renews {new Date(doc.providerSubscription.currentPeriodEnd).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Manual upgrade</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/doctors/${doc.id}`}
                                                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                View
                                            </Link>
                                            {doc.providerSubscription?.stripeCustomerId && (
                                                <a
                                                    href={`https://dashboard.stripe.com/customers/${doc.providerSubscription.stripeCustomerId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded"
                                                >
                                                    Stripe
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Upgrade Opportunities */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Upgrade Opportunities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="text-2xl font-bold text-slate-900">{stats.freeTier}</div>
                        <div className="text-sm text-slate-600 mb-2">Free doctors</div>
                        <p className="text-xs text-slate-500">
                            Potential monthly revenue: Rs. {(stats.freeTier * 2999).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="text-2xl font-bold text-slate-900">{stats.premiumTier}</div>
                        <div className="text-sm text-slate-600 mb-2">Premium doctors</div>
                        <p className="text-xs text-slate-500">
                            Upgrade potential: Rs. {(stats.premiumTier * 7000).toLocaleString()}/mo
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="text-2xl font-bold text-blue-700">
                            {stats.totalDoctors > 0 ? Math.round(((stats.premiumTier + stats.enterpriseTier) / stats.totalDoctors) * 100) : 0}%
                        </div>
                        <div className="text-sm text-slate-600 mb-2">Conversion Rate</div>
                        <p className="text-xs text-slate-500">
                            Free to paid conversion
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
