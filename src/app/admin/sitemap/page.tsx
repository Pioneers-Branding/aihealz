"use client";

import { useState, useEffect } from 'react';

interface SitemapEntry {
    sitemapName: string;
    urlCount: number;
    generationMs: number;
    generatedAt: string;
    isIndex: boolean;
}

interface SitemapData {
    indexing: {
        totalSubmitted: number;
        statusBreakdown: Record<string, number>;
    };
    countries: Array<{ countryCode: string; indexedPages: number }>;
    sitemaps: SitemapEntry[];
}

export default function SitemapMonitorPage() {
    const [data, setData] = useState<SitemapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seo-monitor');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch sitemap data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async (sitemapName: string) => {
        setRegenerating(sitemapName);
        try {
            // In production, this would trigger sitemap regeneration
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await fetchData();
        } catch (error) {
            console.error('Failed to regenerate:', error);
        } finally {
            setRegenerating(null);
        }
    };

    const handlePingGoogle = async (url: string) => {
        try {
            // Open Google ping URL in new tab
            window.open(`https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`, '_blank');
        } catch (error) {
            console.error('Failed to ping Google:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Loading sitemap data...</p>
                </div>
            </div>
        );
    }

    const totalUrls = data?.sitemaps.reduce((acc, s) => acc + (s.urlCount || 0), 0) || 0;
    const indexFiles = data?.sitemaps.filter((s) => s.isIndex).length || 0;
    const sitemapFiles = data?.sitemaps.filter((s) => !s.isIndex).length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Sitemap Monitor
                    </h1>
                    <p className="text-slate-500 mt-1">Manage dynamically generated location and condition XML sitemaps.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Regenerate All Sitemaps
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Index Files</div>
                    <div className="text-2xl font-bold text-slate-900">{indexFiles}</div>
                    <div className="text-sm text-slate-500 mt-1">sitemap.xml</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Sitemap Files</div>
                    <div className="text-2xl font-bold text-slate-900">{sitemapFiles}</div>
                    <div className="text-sm text-slate-500 mt-1">Individual sitemaps</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Total URLs Tracked</div>
                    <div className="text-2xl font-bold text-slate-900">{totalUrls.toLocaleString()}</div>
                    <div className="text-sm text-slate-500 mt-1">Across all sitemaps</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 mb-1">Countries Covered</div>
                    <div className="text-2xl font-bold text-slate-900">{data?.countries.length || 0}</div>
                    <div className="text-sm text-slate-500 mt-1">Active regions</div>
                </div>
            </div>

            {/* Country Breakdown */}
            {data?.countries && data.countries.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Pages by Country</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {data.countries.slice(0, 12).map((country) => (
                            <div
                                key={country.countryCode}
                                className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                                <div className="font-bold text-slate-900 text-lg">
                                    {country.countryCode}
                                </div>
                                <div className="text-sm text-slate-500">
                                    {country.indexedPages.toLocaleString()} pages
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sitemap Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900">Sitemap Files</h3>
                </div>
                {!data?.sitemaps || data.sitemaps.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No sitemaps generated yet
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Sitemap File</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">URLs</th>
                                <th className="px-6 py-4">Generation Time</th>
                                <th className="px-6 py-4">Last Generated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.sitemaps.map((sitemap, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-indigo-600 font-medium">
                                        {sitemap.sitemapName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            sitemap.isIndex
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {sitemap.isIndex ? 'Index' : 'Sitemap'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {sitemap.urlCount?.toLocaleString() || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className={`font-mono ${
                                            sitemap.generationMs > 5000 ? 'text-amber-600' : 'text-slate-600'
                                        }`}>
                                            {sitemap.generationMs}ms
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(sitemap.generatedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handlePingGoogle(`https://aihealz.com/${sitemap.sitemapName}`)}
                                                className="text-sm text-slate-500 hover:text-indigo-600"
                                            >
                                                Ping Google
                                            </button>
                                            <button
                                                onClick={() => handleRegenerate(sitemap.sitemapName)}
                                                disabled={regenerating === sitemap.sitemapName}
                                                className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-50"
                                            >
                                                {regenerating === sitemap.sitemapName ? (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Rebuilding...
                                                    </span>
                                                ) : (
                                                    'Rebuild'
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Indexing Status */}
            {data?.indexing && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Indexing Status Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(data.indexing.statusBreakdown).map(([status, count]) => (
                            <div
                                key={status}
                                className={`p-4 rounded-lg border ${
                                    status === 'success' || status === 'submitted'
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : status === 'pending'
                                        ? 'bg-amber-50 border-amber-200'
                                        : status === 'failed' || status === 'error'
                                        ? 'bg-rose-50 border-rose-200'
                                        : 'bg-slate-50 border-slate-200'
                                }`}
                            >
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-sm font-medium capitalize">{status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-slate-900">Regenerate All</div>
                            <div className="text-xs text-slate-500">Rebuild all sitemap files</div>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-slate-900">Submit to Google</div>
                            <div className="text-xs text-slate-500">Ping Google Search Console</div>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <div className="font-medium text-slate-900">Download Index</div>
                            <div className="text-xs text-slate-500">Export sitemap index XML</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
