"use client";

import { useState, useEffect } from 'react';

interface EnquiryData {
    period: string;
    responseTime: {
        average: number | null;
        fastest: number | null;
        slowest: number | null;
        totalEnquiries: number;
    };
    aiConfidence: {
        average: number | null;
    };
    outcomes: Record<string, number>;
    geoHeatmap: Array<{
        city: string;
        citySlug: string | null;
        enquiries: number;
    }>;
    supplyVsDemand: Array<{
        city: string;
        enquiries: number;
        doctors: number;
        premiumDoctors: number;
        isHighOpportunity: boolean;
    }>;
    topConditions: Array<{
        condition: string;
        count: number;
    }>;
}

export default function EncountersPage() {
    const [data, setData] = useState<EnquiryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/enquiry-monitor');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch enquiry data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Loading encounter data...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Failed to load data. Please try again.</p>
                <button onClick={fetchData} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">
                    Retry
                </button>
            </div>
        );
    }

    const totalOutcomes = Object.values(data.outcomes).reduce((a, b) => a + b, 0);

    // Check if there's no real data
    const hasNoData = data.responseTime.totalEnquiries === 0 &&
                      data.geoHeatmap.length === 0 &&
                      data.topConditions.length === 0;

    if (hasNoData) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Encounters & Enquiries
                        </h1>
                        <p className="text-slate-500 mt-1">Monitor patient enquiries, response times, and geographic demand.</p>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Encounters Yet</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Patient enquiries and encounters will appear here once users start interacting with the AI symptom checker and doctor recommendations on your platform.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Help Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What gets tracked here?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white/70 rounded-lg p-3">
                            <div className="font-medium text-slate-700 mb-1">Patient Enquiries</div>
                            <p className="text-sm text-slate-500">Questions submitted through the symptom checker</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                            <div className="font-medium text-slate-700 mb-1">Response Times</div>
                            <p className="text-sm text-slate-500">How quickly doctors respond to leads</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                            <div className="font-medium text-slate-700 mb-1">Geographic Demand</div>
                            <p className="text-sm text-slate-500">Which cities have the most enquiries</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const outcomeColors: Record<string, string> = {
        completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
        no_show: 'bg-slate-100 text-slate-700 border-slate-200',
        rescheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Encounters & Enquiries
                    </h1>
                    <p className="text-slate-500 mt-1">Monitor patient enquiries, response times, and geographic demand.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Period: {data.period}</span>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Response Time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total Enquiries</div>
                    <div className="text-3xl font-bold text-slate-900">{data.responseTime.totalEnquiries}</div>
                    <div className="text-sm text-slate-500 mt-1">Last 30 days</div>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
                    <div className="text-sm font-medium text-emerald-600 mb-1">Avg Response Time</div>
                    <div className="text-3xl font-bold text-emerald-700">
                        {data.responseTime.average ? `${data.responseTime.average} min` : 'N/A'}
                    </div>
                    <div className="text-sm text-emerald-600 mt-1">
                        Best: {data.responseTime.fastest ? `${data.responseTime.fastest} min` : 'N/A'}
                    </div>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200">
                    <div className="text-sm font-medium text-blue-600 mb-1">AI Confidence</div>
                    <div className="text-3xl font-bold text-blue-700">
                        {data.aiConfidence.average ? `${Math.round(data.aiConfidence.average * 100)}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">Average score</div>
                </div>
                <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200">
                    <div className="text-sm font-medium text-purple-600 mb-1">High Opportunity Cities</div>
                    <div className="text-3xl font-bold text-purple-700">
                        {data.supplyVsDemand.filter((s) => s.isHighOpportunity).length}
                    </div>
                    <div className="text-sm text-purple-600 mt-1">Need more doctors</div>
                </div>
            </div>

            {/* Outcome Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Outcome Distribution</h3>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(data.outcomes).map(([outcome, count]) => (
                        <div
                            key={outcome}
                            className={`px-4 py-2 rounded-lg border ${outcomeColors[outcome] || 'bg-slate-50 border-slate-200'}`}
                        >
                            <span className="font-bold">{count}</span>
                            <span className="ml-2 capitalize">{outcome.replace(/_/g, ' ')}</span>
                            <span className="ml-2 text-xs opacity-70">
                                ({totalOutcomes > 0 ? Math.round((count / totalOutcomes) * 100) : 0}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Geographic Heatmap */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-900">Enquiries by City</h3>
                        <p className="text-sm text-slate-500 mt-1">Top cities by enquiry volume</p>
                    </div>
                    {data.geoHeatmap.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No geographic data available
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {data.geoHeatmap.slice(0, 10).map((geo, i) => (
                                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium text-slate-900">{geo.city}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-teal-500"
                                                style={{
                                                    width: `${(geo.enquiries / (data.geoHeatmap[0]?.enquiries || 1)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="font-bold text-slate-700 w-12 text-right">
                                            {geo.enquiries}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Conditions */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-900">Top Conditions</h3>
                        <p className="text-sm text-slate-500 mt-1">Most enquired conditions</p>
                    </div>
                    {data.topConditions.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No condition data available
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {data.topConditions.slice(0, 10).map((cond, i) => (
                                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium text-slate-900 capitalize">
                                            {cond.condition?.replace(/-/g, ' ') || 'Unknown'}
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-700">{cond.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Supply vs Demand Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900">Supply vs Demand Analysis</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Identify cities where demand exceeds doctor supply
                    </p>
                </div>
                {data.supplyVsDemand.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No supply/demand data available
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">City</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Enquiries</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Verified Doctors</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Premium Doctors</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Ratio</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.supplyVsDemand.map((city, i) => {
                                const ratio = city.doctors > 0 ? (city.enquiries / city.doctors).toFixed(1) : 'N/A';
                                return (
                                    <tr key={i} className={`hover:bg-slate-50 ${city.isHighOpportunity ? 'bg-amber-50/50' : ''}`}>
                                        <td className="p-4 font-medium text-slate-900">{city.city}</td>
                                        <td className="p-4 text-slate-600">{city.enquiries}</td>
                                        <td className="p-4 text-slate-600">{city.doctors}</td>
                                        <td className="p-4 text-slate-600">{city.premiumDoctors}</td>
                                        <td className="p-4">
                                            <span className={`font-bold ${
                                                typeof ratio === 'string' || parseFloat(ratio) > 10
                                                    ? 'text-rose-600'
                                                    : parseFloat(ratio) > 5
                                                    ? 'text-amber-600'
                                                    : 'text-emerald-600'
                                            }`}>
                                                {ratio}x
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {city.isHighOpportunity ? (
                                                <span className="px-2 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                                                    High Opportunity
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">
                                                    Balanced
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Insights Card */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="text-sm font-medium text-slate-600 mb-1">Response Performance</div>
                        <p className="text-sm text-slate-700">
                            {data.responseTime.average && data.responseTime.average < 30
                                ? 'Excellent response times. Keep it up!'
                                : data.responseTime.average && data.responseTime.average < 60
                                ? 'Good response times. Room for improvement.'
                                : 'Response times need attention.'}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="text-sm font-medium text-slate-600 mb-1">Market Gaps</div>
                        <p className="text-sm text-slate-700">
                            {data.supplyVsDemand.filter((s) => s.isHighOpportunity).length > 0
                                ? `${data.supplyVsDemand.filter((s) => s.isHighOpportunity).length} cities need more premium doctors.`
                                : 'Doctor supply meets demand in all cities.'}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="text-sm font-medium text-slate-600 mb-1">Top Demand</div>
                        <p className="text-sm text-slate-700">
                            {data.topConditions[0]
                                ? `"${data.topConditions[0].condition?.replace(/-/g, ' ')}" is the most searched condition.`
                                : 'No condition data available yet.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
