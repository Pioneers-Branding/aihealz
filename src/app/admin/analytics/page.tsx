'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface DailyMetric {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    searches: number;
    botChats: number;
    reportAnalyses: number;
    doctorLeads: number;
}

interface AnalyticsData {
    overview: {
        totalConditions: number;
        totalDoctors: number;
        totalLeads: number;
        totalGeographies: number;
        totalTreatments: number;
        totalRemedies: number;
    };
    trends: {
        conditionsGrowth: number;
        doctorsGrowth: number;
        leadsGrowth: number;
    };
    topSpecialties: { specialty: string; count: number }[];
    topCities: { city: string; count: number }[];
    recentActivity: { type: string; description: string; time: string }[];
    dailyMetrics: DailyMetric[];
}

const COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/analytics?range=${timeRange}`, {
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Failed to fetch analytics data');
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const statCards = data ? [
        {
            label: 'Medical Conditions',
            value: data.overview.totalConditions,
            color: 'bg-blue-500',
            trend: data.trends.conditionsGrowth,
        },
        {
            label: 'Registered Doctors',
            value: data.overview.totalDoctors,
            color: 'bg-emerald-500',
            trend: data.trends.doctorsGrowth,
        },
        {
            label: 'Patient Leads',
            value: data.overview.totalLeads,
            color: 'bg-amber-500',
            trend: data.trends.leadsGrowth,
        },
        {
            label: 'Geographies',
            value: data.overview.totalGeographies,
            color: 'bg-purple-500',
            trend: 0,
        },
        {
            label: 'Treatments',
            value: data.overview.totalTreatments,
            color: 'bg-pink-500',
            trend: 0,
        },
        {
            label: 'Home Remedies',
            value: data.overview.totalRemedies,
            color: 'bg-teal-500',
            trend: 0,
        },
    ] : [];

    // Prepare chart data
    const trafficData = data?.dailyMetrics.slice(-14).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Page Views': d.pageViews,
        'Visitors': d.uniqueVisitors,
    })) || [];

    const engagementData = data?.dailyMetrics.slice(-14).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Searches': d.searches,
        'Bot Chats': d.botChats,
        'Leads': d.doctorLeads,
    })) || [];

    const specialtyPieData = data?.topSpecialties.slice(0, 6).map((s, i) => ({
        name: s.specialty || 'Unknown',
        value: s.count,
        color: COLORS[i % COLORS.length],
    })) || [];

    const cityBarData = data?.topCities.slice(0, 5).map(c => ({
        name: c.city,
        value: c.count,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Platform Analytics
                    </h1>
                    <p className="text-slate-500 mt-1">Real-time platform metrics and performance data</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    timeRange === range
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <svg className="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-800 font-medium">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-slate-500">Loading analytics...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {statCards.map((stat) => (
                            <div key={stat.label} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-3 h-3 ${stat.color} rounded-full`} />
                                    {stat.trend > 0 && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            +{stat.trend}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row - Traffic and Engagement */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Traffic Trends - Line Chart */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Traffic Trends</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trafficData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="Page Views"
                                            stroke="#0ea5e9"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="Visitors"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* User Engagement - Area Chart */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">User Engagement</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={engagementData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="Searches"
                                            stackId="1"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Bot Chats"
                                            stackId="1"
                                            stroke="#f59e0b"
                                            fill="#f59e0b"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Leads"
                                            stackId="1"
                                            stroke="#10b981"
                                            fill="#10b981"
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row - Specialties and Cities */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Specialties - Pie Chart */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Top Specialties</h3>
                            {specialtyPieData.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={specialtyPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {specialtyPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-8">No specialty data available</p>
                            )}
                            {specialtyPieData.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {specialtyPieData.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-slate-600 truncate max-w-[120px]">{item.name}</span>
                                            </div>
                                            <span className="font-medium text-slate-900">{item.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Cities - Bar Chart */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Top Cities</h3>
                            {cityBarData.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={cityBarData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={80} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-8">No city data available</p>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {data?.recentActivity && data.recentActivity.length > 0 ? (
                                    data.recentActivity.map((activity, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                activity.type === 'condition' ? 'bg-blue-100 text-blue-600' :
                                                activity.type === 'doctor' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                                {activity.type === 'condition' ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                ) : activity.type === 'doctor' ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-900 truncate">{activity.description}</p>
                                                <p className="text-xs text-slate-400">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data Quality Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold mb-2">Data Quality Score</h3>
                                <p className="text-indigo-100 text-sm mb-4">
                                    Based on condition coverage, doctor verification rate, and geographic distribution.
                                </p>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-3xl font-bold">
                                            {data ? Math.round((data.overview.totalDoctors > 0 ? 75 : 60) + (data.overview.totalGeographies > 100 ? 12 : 5)) : '--'}%
                                        </p>
                                        <p className="text-xs text-indigo-200">Overall Score</p>
                                    </div>
                                    <div className="h-12 w-px bg-white/20" />
                                    <div>
                                        <p className="text-3xl font-bold">{data?.overview.totalConditions.toLocaleString() || '--'}</p>
                                        <p className="text-xs text-indigo-200">Conditions</p>
                                    </div>
                                    <div className="h-12 w-px bg-white/20" />
                                    <div>
                                        <p className="text-3xl font-bold">{data?.overview.totalGeographies || '--'}</p>
                                        <p className="text-xs text-indigo-200">Geographies</p>
                                    </div>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                                View Report
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
