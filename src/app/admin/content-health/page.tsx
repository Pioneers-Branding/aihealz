"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StaleContent {
    url: string;
    pageType: string;
    freshnessScore: number | null;
    lastModified: string;
    refreshReason: string | null;
    countryCode: string;
}

interface KeywordGap {
    keyword: string;
    searchVolume: number;
    currentRank: number | null;
    competitor: string | null;
    competitorRank: number | null;
    countryCode: string;
    opportunityScore: number | null;
    suggestedAction: string | null;
}

interface IndexSubmission {
    url: string;
    indexApi: string;
    status: string;
    responseCode: number | null;
    submittedAt: string;
    pageType: string;
}

interface SEOData {
    indexing: {
        totalSubmitted: number;
        statusBreakdown: Record<string, number>;
        apiBreakdown: Record<string, number>;
        recentSubmissions: IndexSubmission[];
    };
    freshness: {
        averageScore: number;
        totalTracked: number;
        staleContent: StaleContent[];
    };
    keywordGaps: KeywordGap[];
    countries: Array<{ countryCode: string; indexedPages: number }>;
    sitemaps: Array<{
        sitemapName: string;
        urlCount: number;
        generationMs: number;
        generatedAt: string;
        isIndex: boolean;
    }>;
}

export default function ContentHealthPage() {
    const [data, setData] = useState<SEOData | null>(null);
    const [loading, setLoading] = useState(true);
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'freshness' | 'indexing' | 'keywords'>('freshness');
    const [auditing, setAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [countryFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = countryFilter
                ? `/api/admin/seo-monitor?country=${countryFilter}`
                : '/api/admin/seo-monitor';
            const res = await fetch(url);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch SEO data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runFullAudit = async () => {
        setAuditing(true);
        setAuditResult(null);
        try {
            const res = await fetch('/api/admin/content-health/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryFilter || 'all' }),
            });
            const json = await res.json();
            if (res.ok) {
                setAuditResult({
                    type: 'success',
                    message: `Audit complete: ${json.pagesChecked} pages analyzed, ${json.issuesFound} issues found.`,
                });
                // Refresh data after audit
                await fetchData();
            } else {
                setAuditResult({
                    type: 'error',
                    message: json.error || 'Failed to run audit',
                });
            }
        } catch (error) {
            console.error('Audit failed:', error);
            setAuditResult({
                type: 'error',
                message: 'Failed to run audit. Please try again.',
            });
        } finally {
            setAuditing(false);
            setTimeout(() => setAuditResult(null), 5000);
        }
    };

    const getPriorityColor = (score: number | null) => {
        if (!score) return 'bg-slate-100 text-slate-600 border-slate-200';
        if (score < 0.5) return 'bg-rose-50 text-rose-600 border-rose-200';
        if (score < 0.8) return 'bg-amber-50 text-amber-600 border-amber-200';
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted':
            case 'success':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'failed':
            case 'error':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Loading SEO health data...</p>
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Content Health
                    </h1>
                    <p className="text-slate-500 mt-1">Monitor SEO performance, content freshness, and indexing status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                        <option value="">All Countries</option>
                        {data.countries.map((c) => (
                            <option key={c.countryCode} value={c.countryCode}>
                                {c.countryCode} ({c.indexedPages.toLocaleString()} pages)
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={runFullAudit}
                        disabled={auditing}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {auditing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Running Audit...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Run Full Audit
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Audit Result Message */}
            {auditResult && (
                <div className={`p-4 rounded-lg ${
                    auditResult.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {auditResult.message}
                </div>
            )}

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total Indexed</div>
                    <div className="text-3xl font-bold text-slate-900">{data.indexing.totalSubmitted.toLocaleString()}</div>
                    <div className="text-sm text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Pages submitted
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Avg. Freshness Score</div>
                    <div className="text-3xl font-bold text-slate-900">
                        {Math.round(data.freshness.averageScore * 100)}/100
                    </div>
                    <div className={`text-sm font-medium mt-2 ${
                        data.freshness.averageScore >= 0.8 ? 'text-emerald-600' :
                        data.freshness.averageScore >= 0.6 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                        {data.freshness.averageScore >= 0.8 ? 'Excellent Health' :
                         data.freshness.averageScore >= 0.6 ? 'Needs Attention' : 'Critical'}
                    </div>
                </div>
                <div className={`p-5 rounded-2xl border ${
                    data.freshness.staleContent.length > 50
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-white border-slate-200'
                }`}>
                    <div className={`text-sm font-medium mb-1 ${
                        data.freshness.staleContent.length > 50 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                        Needs Refresh
                    </div>
                    <div className={`text-3xl font-bold ${
                        data.freshness.staleContent.length > 50 ? 'text-rose-700' : 'text-slate-900'
                    }`}>
                        {data.freshness.staleContent.length}
                    </div>
                    <div className={`text-sm font-medium mt-2 ${
                        data.freshness.staleContent.length > 50 ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                        Pages with stale content
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Keyword Opportunities</div>
                    <div className="text-3xl font-bold text-slate-900">{data.keywordGaps.length}</div>
                    <div className="text-sm text-blue-600 font-medium mt-2">
                        Gaps to address
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {[
                    { id: 'freshness', label: 'Content Freshness', count: data.freshness.staleContent.length },
                    { id: 'indexing', label: 'Index Submissions', count: data.indexing.recentSubmissions.length },
                    { id: 'keywords', label: 'Keyword Gaps', count: data.keywordGaps.length },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                        <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 rounded-full">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Based on Tab */}
            {activeTab === 'freshness' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-900">Pages Needing Attention</h3>
                    </div>
                    {data.freshness.staleContent.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">All content is fresh!</h3>
                            <p className="text-slate-500">No pages need refreshing at this time.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {data.freshness.staleContent.map((item, i) => (
                                <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                                            {item.pageType}
                                        </h4>
                                        <div className="text-xs text-slate-500 font-mono truncate">{item.url}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Last modified: {new Date(item.lastModified).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityColor(item.freshnessScore)}`}>
                                            {item.refreshReason || 'Needs refresh'}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {item.freshnessScore ? Math.round(item.freshnessScore * 100) : 0}%
                                        </span>
                                        <button className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline whitespace-nowrap">
                                            Refresh Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'indexing' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Recent Index Submissions</h3>
                        <div className="flex gap-2">
                            {Object.entries(data.indexing.statusBreakdown).map(([status, count]) => (
                                <span
                                    key={status}
                                    className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(status)}`}
                                >
                                    {status}: {count}
                                </span>
                            ))}
                        </div>
                    </div>
                    {data.indexing.recentSubmissions.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No recent submissions
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">URL</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">API</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Status</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Response</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.indexing.recentSubmissions.map((sub, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-4 font-mono text-xs text-slate-600 max-w-xs truncate">
                                            {sub.url}
                                        </td>
                                        <td className="p-4 text-slate-600">{sub.indexApi}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">{sub.responseCode || '-'}</td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(sub.submittedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'keywords' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-900">Keyword Opportunities</h3>
                        <p className="text-sm text-slate-500 mt-1">Keywords where competitors outrank you</p>
                    </div>
                    {data.keywordGaps.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No keyword gaps identified
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Keyword</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Volume</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Your Rank</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Competitor</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Opportunity</th>
                                    <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.keywordGaps.map((gap, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-900">{gap.keyword}</td>
                                        <td className="p-4 text-slate-600">{gap.searchVolume?.toLocaleString() || '-'}</td>
                                        <td className="p-4">
                                            <span className={`font-bold ${
                                                gap.currentRank && gap.currentRank <= 10 ? 'text-emerald-600' :
                                                gap.currentRank && gap.currentRank <= 30 ? 'text-amber-600' : 'text-slate-500'
                                            }`}>
                                                #{gap.currentRank || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {gap.competitor && (
                                                <span>
                                                    {gap.competitor} <span className="text-emerald-600 font-bold">#{gap.competitorRank}</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
                                                    style={{ width: `${(gap.opportunityScore || 0) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                                                {gap.suggestedAction || 'Create content'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Sitemap Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Recent Sitemaps</h3>
                    <Link href="/admin/sitemap" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                        View All Sitemaps →
                    </Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {data.sitemaps.slice(0, 5).map((sitemap, i) => (
                        <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-sm text-indigo-600">{sitemap.sitemapName}</span>
                                {sitemap.isIndex && (
                                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">Index</span>
                                )}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <span>{sitemap.urlCount?.toLocaleString() || '-'} URLs</span>
                                <span>{sitemap.generationMs}ms</span>
                                <span>{new Date(sitemap.generatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
