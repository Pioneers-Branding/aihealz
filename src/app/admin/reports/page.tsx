'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalysisReport {
    id: string;
    reportType: string;
    urgencyLevel: string;
    confidenceScore: number;
    piiRedacted: number;
    processingTimeMs: number;
    doctorsMatched: number;
    specialtySearched: string | null;
    createdAt: string;
}

interface ReportsData {
    reports: AnalysisReport[];
    stats: {
        totalReports: number;
        avgConfidence: number;
        avgProcessingTime: number;
        byUrgency: Record<string, number>;
        byType: Record<string, number>;
    };
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'routine' | 'urgent' | 'emergency'>('all');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchReports();
    }, [filter, typeFilter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('urgency', filter);
            if (typeFilter) params.set('type', typeFilter);

            const res = await fetch(`/api/admin/reports?${params}`, {
                credentials: 'include',
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                // Mock data for development
                setData({
                    reports: [],
                    stats: {
                        totalReports: 0,
                        avgConfidence: 0,
                        avgProcessingTime: 0,
                        byUrgency: { routine: 0, urgent: 0, emergency: 0 },
                        byType: { blood_work: 0, imaging: 0, pathology: 0, prescription: 0, other: 0 },
                    },
                });
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setData({
                reports: [],
                stats: {
                    totalReports: 0,
                    avgConfidence: 0,
                    avgProcessingTime: 0,
                    byUrgency: { routine: 0, urgent: 0, emergency: 0 },
                    byType: {},
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const urgencyStyles: Record<string, string> = {
        routine: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        urgent: 'bg-amber-100 text-amber-700 border-amber-200',
        emergency: 'bg-rose-100 text-rose-700 border-rose-200',
    };

    const typeLabels: Record<string, string> = {
        blood_work: 'Blood Work',
        imaging: 'MRI / X-Ray',
        pathology: 'Pathology',
        prescription: 'Prescription',
        other: 'Other',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        AI Analysis Reports
                    </h1>
                    <p className="text-slate-500 mt-1">View all AI-generated medical report analyses.</p>
                </div>
                <button
                    onClick={fetchReports}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-emerald-600 font-bold">All Time</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{data?.stats.totalReports.toLocaleString() || 0}</p>
                    <p className="text-sm text-slate-500 mt-1">Total Reports</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{data?.stats.avgConfidence ? `${(data.stats.avgConfidence * 100).toFixed(0)}%` : '—'}</p>
                    <p className="text-sm text-slate-500 mt-1">Avg Confidence</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{data?.stats.avgProcessingTime ? `${(data.stats.avgProcessingTime / 1000).toFixed(1)}s` : '—'}</p>
                    <p className="text-sm text-slate-500 mt-1">Avg Processing</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{data?.stats.byUrgency?.emergency || 0}</p>
                    <p className="text-sm text-slate-500 mt-1">Emergency Flagged</p>
                </div>
            </div>

            {/* Urgency Breakdown */}
            {data?.stats.byUrgency && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Urgency Distribution</h3>
                    <div className="flex gap-4">
                        {Object.entries(data.stats.byUrgency).map(([level, count]) => (
                            <div key={level} className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700 capitalize">{level}</span>
                                    <span className="text-sm text-slate-500">{count}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            level === 'emergency' ? 'bg-rose-500' :
                                            level === 'urgent' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${data.stats.totalReports ? (count / data.stats.totalReports) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex gap-2">
                    {(['all', 'routine', 'urgent', 'emergency'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filter === f
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-700"
                >
                    <option value="">All Report Types</option>
                    {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-slate-500">Loading reports...</p>
                    </div>
                ) : !data?.reports || data.reports.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No reports yet</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            AI analysis reports will appear here when users submit medical reports for analysis.
                        </p>
                        <Link
                            href="/analyze"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Try Report Analysis
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-4 font-bold text-slate-700">Report ID</th>
                                <th className="text-left p-4 font-bold text-slate-700">Type</th>
                                <th className="text-left p-4 font-bold text-slate-700">Urgency</th>
                                <th className="text-left p-4 font-bold text-slate-700">Confidence</th>
                                <th className="text-left p-4 font-bold text-slate-700">PII Removed</th>
                                <th className="text-left p-4 font-bold text-slate-700">Processing</th>
                                <th className="text-left p-4 font-bold text-slate-700">Specialty</th>
                                <th className="text-left p-4 font-bold text-slate-700">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.reports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                                            {report.id.slice(0, 8)}...
                                        </code>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {typeLabels[report.reportType] || report.reportType}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${urgencyStyles[report.urgencyLevel] || urgencyStyles.routine}`}>
                                            {report.urgencyLevel}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        report.confidenceScore >= 0.8 ? 'bg-emerald-500' :
                                                        report.confidenceScore >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${report.confidenceScore * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {(report.confidenceScore * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {report.piiRedacted > 0 ? (
                                            <span className="text-emerald-600 font-medium">{report.piiRedacted} items</span>
                                        ) : (
                                            <span className="text-slate-400">None</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {(report.processingTimeMs / 1000).toFixed(1)}s
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {report.specialtySearched || '—'}
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">About AI Analysis Reports</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            This dashboard tracks all AI-generated medical report analyses. Each analysis automatically strips
                            personal identifiable information (PII), assigns an urgency level, and matches patients with relevant
                            specialists. Reports are stored for 24 hours then permanently deleted for HIPAA compliance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
