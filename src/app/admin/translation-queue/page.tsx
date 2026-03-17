'use client';

import React, { useState } from 'react';

export default function TranslationQueuePage() {
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('hi');

    const handleTranslate = async () => {
        setStatus('running');
        setLogs(prev => [...prev, `Starting batch translation from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}...`]);

        try {
            const res = await fetch('/api/admin/translation-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: sourceLang,
                    target: targetLang,
                    limit: 50 // process 50 missing items
                })
            });
            const data = await res.json();

            if (res.ok) {
                setLogs(prev => [...prev, `Translation queued successfully. Jobs added: ${data.queued || 50}`]);
                setStatus('done');
            } else {
                setLogs(prev => [...prev, `Failed: ${data.error}`]);
                setStatus('idle');
            }
        } catch (error: any) {
            setLogs(prev => [...prev, `Error: ${error.message}`]);
            setStatus('idle');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Translation Queue Workload
                    </h1>
                    <p className="text-slate-500 mt-1">Manage AI-driven semantic translations for global markets.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">New Translation Batch</h3>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Source Language</label>
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            className="w-full border-slate-200 rounded-xl text-slate-600 focus:ring-2 focus:ring-blue-500 p-3 bg-slate-50 border outline-none"
                        >
                            <option value="en">English (EN)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Target Language</label>
                        <select
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="w-full border-slate-200 rounded-xl text-slate-600 focus:ring-2 focus:ring-blue-500 p-3 bg-slate-50 border outline-none"
                        >
                            <option value="hi">Hindi (IN)</option>
                            <option value="ar">Arabic (UAE)</option>
                            <option value="es">Spanish (MX)</option>
                            <option value="pt">Portuguese (BR)</option>
                        </select>
                    </div>
                </div>

                <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">Translation Metrics</h4>
                            <p className="text-sm text-blue-700 mt-1">Found <strong>3,402</strong> missing translations for {targetLang.toUpperCase()}. Estimated LLM Token Cost: <strong className="text-blue-900">$8.50</strong>.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTranslate}
                            disabled={status === 'running'}
                            className={`px-6 py-3 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 ${status === 'running' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'}`}
                        >
                            {status === 'running' ? (
                                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                            )}
                            {status === 'running' ? 'Processing...' : 'Run Translation Batch'}
                        </button>
                    </div>

                    {/* Build Logs UI */}
                    {logs.length > 0 && (
                        <div className="mt-4 bg-[#0a0a0a] rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto max-h-48 border border-slate-800 shadow-inner">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1.5 flex gap-2">
                                    <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                            {status === 'running' && (
                                <div className="animate-pulse flex gap-1 mt-2">
                                    <div className="w-1.5 h-3 bg-emerald-400"></div>
                                    <div className="w-1.5 h-3 bg-emerald-400"></div>
                                    <div className="w-1.5 h-3 bg-emerald-400"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <div className="text-sm font-semibold text-slate-500 mb-1">Queue Status</div>
                    <div className="text-3xl font-black text-slate-900 mb-2">4,209</div>
                    <div className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Pending Items
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <div className="text-sm font-semibold text-slate-500 mb-1">Success Rate</div>
                    <div className="text-3xl font-black text-slate-900 mb-2">99.8%</div>
                    <div className="text-sm text-slate-500 font-medium line-clamp-1">Last 30 days</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <div className="text-sm font-semibold text-slate-500 mb-1">Cost / Page</div>
                    <div className="text-3xl font-black text-slate-900 mb-2">$0.002</div>
                    <div className="text-sm text-slate-500 font-medium">via DeepSeek-chat</div>
                </div>
            </div>
        </div>
    );
}
