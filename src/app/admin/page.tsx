import prisma from '@/lib/db';
import Link from 'next/link';
import { SystemHealthClient } from './SystemHealthClient';

async function getDashboardStats() {
    const [
        conditionsCount,
        doctorsCount,
        locationsCount,
        languagesCount,
        leadsCount,
        contentCount,
        pendingVerifications,
        pendingContent,
        premiumDoctors,
        recentLeads,
        recentDoctors,
        highIntentLeads,
        hospitalsCount,
        insuranceCount,
        tpaCount,
        diagnosticTestsCount,
    ] = await Promise.all([
        prisma.medicalCondition.count({ where: { isActive: true } }),
        prisma.doctorProvider.count(),
        prisma.geography.count(),
        prisma.language.count({ where: { isActive: true } }),
        prisma.leadLog.count(),
        prisma.localizedContent.count(),
        // Count pending license verifications (not just unverified doctors)
        // This syncs with the verification queue page
        prisma.licenseVerification.count({ where: { status: 'pending' } }),
        prisma.localizedContent.count({ where: { status: 'under_review' } }),
        prisma.doctorProvider.count({ where: { subscriptionTier: { in: ['premium', 'enterprise'] } } }),
        prisma.leadLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                intentLevel: true,
                isContacted: true,
                isViewed: true,
                conditionSlug: true,
                createdAt: true,
                doctor: { select: { name: true } },
                geography: { select: { name: true } },
            },
        }),
        prisma.doctorProvider.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                isVerified: true,
                subscriptionTier: true,
                createdAt: true,
            },
        }),
        prisma.leadLog.count({ where: { intentLevel: 'high', isContacted: false } }),
        prisma.hospital.count({ where: { isActive: true } }),
        prisma.insuranceProvider.count({ where: { isActive: true } }),
        prisma.tpa.count({ where: { isActive: true } }),
        prisma.diagnosticTest.count({ where: { isActive: true } }),
    ]);

    return {
        conditionsCount,
        doctorsCount,
        locationsCount,
        languagesCount,
        leadsCount,
        contentCount,
        pendingVerifications,
        pendingContent,
        premiumDoctors,
        recentLeads,
        recentDoctors,
        highIntentLeads,
        hospitalsCount,
        insuranceCount,
        tpaCount,
        diagnosticTestsCount,
    };
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    const statCards = [
        {
            label: 'Conditions', value: stats.conditionsCount, href: '/admin/conditions', icon: (
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ), color: 'blue'
        },
        {
            label: 'Doctors', value: stats.doctorsCount, href: '/admin/doctors', icon: (
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ), color: 'green'
        },
        {
            label: 'Hospitals', value: stats.hospitalsCount, href: '/admin/hospitals', icon: (
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ), color: 'teal'
        },
        {
            label: 'Locations', value: stats.locationsCount, href: '/admin/locations', icon: (
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ), color: 'purple'
        },
        {
            label: 'Leads', value: stats.leadsCount, href: '/admin/leads', icon: (
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ), color: 'pink'
        },
        {
            label: 'Content Pages', value: stats.contentCount, href: '/admin/content', icon: (
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ), color: 'orange'
        },
    ];

    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        purple: 'bg-purple-50 border-purple-200 text-purple-700',
        orange: 'bg-orange-50 border-orange-200 text-orange-700',
        pink: 'bg-pink-50 border-pink-200 text-pink-700',
        teal: 'bg-teal-50 border-teal-200 text-teal-700',
    };

    // Determine alerts
    const alerts: { type: string; message: string; href: string; action: string }[] = [];
    if (stats.pendingVerifications > 0) {
        alerts.push({
            type: 'warning',
            message: `${stats.pendingVerifications} doctors pending verification`,
            href: '/admin/verification',
            action: 'Review',
        });
    }
    if (stats.pendingContent > 0) {
        alerts.push({
            type: 'info',
            message: `${stats.pendingContent} content pages under review`,
            href: '/admin/content',
            action: 'Review',
        });
    }
    if (stats.highIntentLeads > 0) {
        alerts.push({
            type: 'urgent',
            message: `${stats.highIntentLeads} high-intent leads not contacted`,
            href: '/admin/leads',
            action: 'Contact Now',
        });
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome to AIHealz CMS. Manage your content and data.</p>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    {alerts.map((alert, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between p-4 rounded-xl border ${
                                alert.type === 'urgent'
                                    ? 'bg-rose-50 border-rose-200'
                                    : alert.type === 'warning'
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-blue-50 border-blue-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    alert.type === 'urgent'
                                        ? 'bg-rose-100 text-rose-600'
                                        : alert.type === 'warning'
                                        ? 'bg-amber-100 text-amber-600'
                                        : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {alert.type === 'urgent' ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`font-medium ${
                                    alert.type === 'urgent'
                                        ? 'text-rose-800'
                                        : alert.type === 'warning'
                                        ? 'text-amber-800'
                                        : 'text-blue-800'
                                }`}>
                                    {alert.message}
                                </span>
                            </div>
                            <Link
                                href={alert.href}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold ${
                                    alert.type === 'urgent'
                                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                                        : alert.type === 'warning'
                                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {alert.action}
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className={`p-4 rounded-xl border-2 ${colorClasses[stat.color]} hover:shadow-lg transition-all group`}
                    >
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                        <div className="text-sm font-medium opacity-80">{stat.label}</div>
                    </Link>
                ))}
            </div>

            {/* New Section: Insurance & Healthcare Network */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/admin/insurance" className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-blue-600">Insurance Providers</div>
                            <div className="text-3xl font-bold text-blue-800">{stats.insuranceCount}</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm text-blue-600 mt-2">Manage providers &rarr;</div>
                </Link>

                <Link href="/admin/tpas" className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-purple-600">TPAs</div>
                            <div className="text-3xl font-bold text-purple-800">{stats.tpaCount}</div>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm text-purple-600 mt-2">Manage TPAs &rarr;</div>
                </Link>

                <Link href="/admin/diagnostics/tests" className="bg-gradient-to-br from-cyan-50 to-teal-50 p-5 rounded-xl border border-cyan-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-cyan-600">Diagnostic Tests</div>
                            <div className="text-3xl font-bold text-cyan-800">{stats.diagnosticTestsCount}</div>
                        </div>
                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm text-cyan-600 mt-2">Manage tests &rarr;</div>
                </Link>

                <Link href="/admin/geography" className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border border-emerald-200 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-emerald-600">Languages</div>
                            <div className="text-3xl font-bold text-emerald-800">{stats.languagesCount}</div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-sm text-emerald-600 mt-2">View coverage &rarr;</div>
                </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-emerald-600">Premium Doctors</div>
                            <div className="text-3xl font-bold text-emerald-800">{stats.premiumDoctors}</div>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                    </div>
                    <Link href="/admin/subscriptions" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium mt-2 inline-block">
                        View Subscriptions &rarr;
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-amber-600">Pending Verification</div>
                            <div className="text-3xl font-bold text-amber-800">{stats.pendingVerifications}</div>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <Link href="/admin/verification" className="text-sm text-amber-600 hover:text-amber-800 font-medium mt-2 inline-block">
                        Review Queue &rarr;
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-blue-600">Content Under Review</div>
                            <div className="text-3xl font-bold text-blue-800">{stats.pendingContent}</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <Link href="/admin/content" className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block">
                        Review Content &rarr;
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link
                        href="/admin/conditions/new"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                    >
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium text-slate-700">Add Condition</span>
                    </Link>
                    <Link
                        href="/admin/doctors/new"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                    >
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-slate-700">Add Doctor</span>
                    </Link>
                    <Link
                        href="/admin/hospitals/new"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                    >
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium text-slate-700">Add Hospital</span>
                    </Link>
                    <Link
                        href="/admin/trigger-batch"
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                    >
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium text-slate-700">Generate Content</span>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Leads */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Recent Leads</h2>
                        <Link href="/admin/leads" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
                            View All &rarr;
                        </Link>
                    </div>
                    {stats.recentLeads.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentLeads.map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {lead.doctor?.name || 'Unknown Doctor'}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {lead.geography?.name || 'Unknown Location'} &bull; {lead.conditionSlug?.replace(/-/g, ' ') || 'General'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${lead.intentLevel === 'high' ? 'bg-red-100 text-red-700' :
                                                lead.intentLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {lead.intentLevel}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No leads yet</p>
                    )}
                </div>

                {/* Recent Doctors */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Recent Doctors</h2>
                        <Link href="/admin/doctors" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
                            View All &rarr;
                        </Link>
                    </div>
                    {stats.recentDoctors.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentDoctors.map((doctor) => (
                                <div key={doctor.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                            {doctor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{doctor.name}</p>
                                            <p className="text-sm text-slate-500">/{doctor.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {doctor.isVerified && (
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${doctor.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                                doctor.subscriptionTier === 'premium' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {doctor.subscriptionTier}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No doctors yet</p>
                    )}
                </div>
            </div>

            {/* System Status - Now with real health checks */}
            <SystemHealthClient />
        </div>
    );
}
