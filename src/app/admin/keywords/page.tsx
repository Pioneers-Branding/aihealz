'use client';

import { useState, useEffect } from 'react';

interface KeywordGap {
    id: number;
    keyword: string;
    searchVolume: number;
    keywordDifficulty: number;
    opportunityScore: number;
    targetPage: string;
    language: string;
    status: 'pending' | 'content_generated' | 'published';
}

export default function KeywordGapsPage() {
    const [keywords, setKeywords] = useState<KeywordGap[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [generating, setGenerating] = useState<number | null>(null);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchKeywords();
    }, [selectedLanguage]);

    async function fetchKeywords() {
        setLoading(true);
        setMessage(null);
        try {
            const params = new URLSearchParams();
            if (selectedLanguage !== 'all') params.set('language', selectedLanguage);

            // Add timeout to prevent infinite loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(`/api/admin/condition-gaps?${params}`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                setKeywords(data.gaps || []);
            } else {
                throw new Error('API returned error');
            }
        } catch (error) {
            // Show error message and use demo data as fallback
            if (error instanceof Error && error.name === 'AbortError') {
                setMessage({ type: 'error', text: 'Request timed out. Showing demo data.' });
            } else {
                console.error('Failed to fetch keywords:', error);
                setMessage({ type: 'error', text: 'Failed to load keywords. Showing demo data.' });
            }
            // Fallback to demo data
            setKeywords([
                { id: 1, keyword: 'best neurologist in navi mumbai', searchVolume: 1200, keywordDifficulty: 12, opportunityScore: 98, targetPage: '/in/en/navi-mumbai/neurology', language: 'en', status: 'pending' },
                { id: 2, keyword: 'ivf ka kharcha kitna hai', searchVolume: 3400, keywordDifficulty: 18, opportunityScore: 94, targetPage: '/in/hi/cost/ivf', language: 'hi', status: 'pending' },
                { id: 3, keyword: 'robotic knee replacement cost pune', searchVolume: 850, keywordDifficulty: 15, opportunityScore: 88, targetPage: '/in/en/pune/cost/robotic-knee-surgery', language: 'en', status: 'pending' },
                { id: 4, keyword: 'बाल रोग विशेषज्ञ near me', searchVolume: 5600, keywordDifficulty: 24, opportunityScore: 82, targetPage: '/in/hi/pediatrics', language: 'hi', status: 'pending' },
            ]);
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateContent(keywordId: number) {
        setGenerating(keywordId);
        try {
            const res = await fetch('/api/admin/content-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywordId, action: 'generate' }),
            });
            if (res.ok) {
                await fetchKeywords();
                setMessage({ type: 'success', text: 'Content generated successfully' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to generate content' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Generation failed:', error);
            setMessage({ type: 'error', text: 'Failed to generate content' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setGenerating(null);
        }
    }

    async function handleImportCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setImporting(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/admin/condition-gaps/import', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    setMessage({ type: 'success', text: `Imported ${data.imported} keywords` });
                    setTimeout(() => setMessage(null), 3000);
                    await fetchKeywords();
                } else {
                    setMessage({ type: 'error', text: 'Failed to import CSV' });
                    setTimeout(() => setMessage(null), 3000);
                }
            } catch (error) {
                console.error('Import failed:', error);
                setMessage({ type: 'error', text: 'Failed to import CSV' });
                setTimeout(() => setMessage(null), 3000);
            } finally {
                setImporting(false);
            }
        };
        input.click();
    }

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-3 rounded-lg text-sm ${
                    message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Keyword Gaps
                    </h1>
                    <p className="text-slate-500 mt-1">Discover missing localized keywords and high-opportunity searches.</p>
                </div>
                <button
                    onClick={handleImportCSV}
                    disabled={importing}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {importing ? 'Importing...' : 'Import Ahrefs CSV'}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                        Highest Opportunity Gaps
                        {!loading && <span className="ml-2 text-sm font-normal text-slate-500">({keywords.length} keywords)</span>}
                    </h3>
                    <div className="flex gap-2">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="text-sm border-slate-200 rounded-lg text-slate-600 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">All Languages</option>
                            <option value="en">English</option>
                            <option value="hi">Hindi (hi-IN)</option>
                            <option value="mr">Marathi (mr-IN)</option>
                            <option value="ta">Tamil (ta-IN)</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full" />
                    </div>
                ) : keywords.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">No keyword gaps found</p>
                        <p className="text-sm mt-1">Import an Ahrefs CSV to discover opportunities</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-4">Keyword</th>
                                <th className="px-6 py-4">Volume</th>
                                <th className="px-6 py-4">KD</th>
                                <th className="px-6 py-4">Opp. Score</th>
                                <th className="px-6 py-4">Target Page</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {keywords.map((kw) => (
                                <tr key={kw.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {kw.keyword}
                                        {kw.language !== 'en' && (
                                            <span className="ml-2 text-xs text-slate-400">({kw.language})</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{kw.searchVolume.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                                            kw.keywordDifficulty <= 20 ? 'bg-emerald-50 text-emerald-700' :
                                            kw.keywordDifficulty <= 40 ? 'bg-amber-50 text-amber-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                            {kw.keywordDifficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-amber-600 font-bold">{kw.opportunityScore}</td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500 truncate max-w-[200px]">{kw.targetPage}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            kw.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                                            kw.status === 'content_generated' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {kw.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {kw.status === 'pending' ? (
                                            <button
                                                onClick={() => handleGenerateContent(kw.id)}
                                                disabled={generating === kw.id}
                                                className="text-teal-600 hover:text-teal-700 text-xs font-bold uppercase tracking-wide disabled:opacity-50"
                                            >
                                                {generating === kw.id ? 'Generating...' : 'Generate Content'}
                                            </button>
                                        ) : (
                                            <button className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wide">
                                                View
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
