'use client';

import React, { useState, useEffect } from 'react';

interface BatchRun {
    id: string;
    name: string;
    pagesGenerated: number;
    cost: string;
    status: 'running' | 'completed' | 'failed';
    completedAt: string | null;
    createdAt: string;
}

export default function BatchGeneratorPage() {
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [recentRuns, setRecentRuns] = useState<BatchRun[]>([]);
    const [selectedGeo, setSelectedGeo] = useState('india-tier2');
    const [selectedType, setSelectedType] = useState('conditions');
    const [dryRunResult, setDryRunResult] = useState<{ pages: number; cost: string; duration: string } | null>(null);

    useEffect(() => {
        fetchRecentRuns();
    }, []);

    async function fetchRecentRuns() {
        try {
            const res = await fetch('/api/admin/batch-runs');
            if (res.ok) {
                const data = await res.json();
                setRecentRuns(data.runs || []);
            } else {
                // Demo data
                setRecentRuns([
                    { id: '1', name: 'Batch_IN_Tier1_Costs', pagesGenerated: 2100, cost: '$5.20', status: 'completed', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                    { id: '2', name: 'Batch_MiddleEast_Ar', pagesGenerated: 850, cost: '$2.80', status: 'completed', completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch runs:', error);
        }
    }

    async function handleDryRun() {
        setLogs(['Simulating batch run...']);
        setDryRunResult(null);

        try {
            const res = await fetch('/api/admin/content-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'dry-run',
                    geography: selectedGeo,
                    contentType: selectedType,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setDryRunResult({
                    pages: data.estimatedPages || 4200,
                    cost: data.estimatedCost || '$12.40',
                    duration: data.estimatedDuration || '4.5 hours',
                });
                setLogs(prev => [...prev, `Dry run complete: ${data.estimatedPages || 4200} pages estimated`]);
            } else {
                setLogs(prev => [...prev, `Dry run failed: ${data.error}`]);
            }
        } catch (error) {
            // Simulate result for demo
            setDryRunResult({
                pages: selectedGeo === 'india-tier2' ? 4200 : selectedGeo === 'middle-east' ? 1500 : 3000,
                cost: selectedGeo === 'india-tier2' ? '$12.40' : selectedGeo === 'middle-east' ? '$4.80' : '$9.20',
                duration: selectedGeo === 'india-tier2' ? '4.5 hours' : selectedGeo === 'middle-east' ? '2 hours' : '3.5 hours',
            });
            setLogs(prev => [...prev, 'Dry run simulation complete (demo mode)']);
        }
    }

    async function handleDeploy() {
        setStatus('running');
        setLogs(prev => [...prev, `Starting batch run for ${selectedGeo}...`]);
        setDryRunResult(null);

        try {
            const res = await fetch('/api/admin/content-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'seed',
                    geography: selectedGeo,
                    contentType: selectedType,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setLogs(prev => [...prev, `Batch queued successfully. Job ID: ${data.jobId || 'N/A'}`]);
                setLogs(prev => [...prev, `Message: ${data.message || 'Processing started'}`]);
                setStatus('done');
                fetchRecentRuns();
            } else {
                setLogs(prev => [...prev, `Failed: ${data.error}`]);
                setStatus('idle');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setLogs(prev => [...prev, `Error: ${errorMessage}`]);
            setStatus('idle');
        }
    }

    function getRelativeTime(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1d ago';
        return `${diffDays}d ago`;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Batch Content Generator
                    </h1>
                    <p className="text-slate-500 mt-1">Trigger LLM generation for programmatic SEO pages across regions and languages.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">New Batch Run</h3>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Target Geography</label>
                        <select
                            value={selectedGeo}
                            onChange={(e) => {
                                setSelectedGeo(e.target.value);
                                setDryRunResult(null);
                            }}
                            className="w-full border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-purple-500 p-2.5 bg-slate-50 border"
                        >
                            <option value="india-tier1">India (Tier 1 Cities)</option>
                            <option value="india-tier2">India (Tier 2-3 Expansion)</option>
                            <option value="middle-east">Middle East (UAE, Qatar)</option>
                            <option value="custom">Custom List...</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setDryRunResult(null);
                            }}
                            className="w-full border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-purple-500 p-2.5 bg-slate-50 border"
                        >
                            <option value="conditions">Missing Conditions (Local + Local Lang)</option>
                            <option value="treatments">Treatment Cost Estimates</option>
                            <option value="doctors">Doctor Promoted Bios</option>
                        </select>
                    </div>
                </div>

                {dryRunResult && (
                    <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-bold text-purple-900">Estimated Cost & Time (Dry Run)</h4>
                                <p className="text-sm text-purple-700 mt-1">
                                    This run will generate ~<strong className="text-purple-900">{dryRunResult.pages.toLocaleString()}</strong> pages.
                                    Estimated OpenRouter API cost: <strong className="text-purple-900">{dryRunResult.cost}</strong>.
                                    Expected duration: <strong className="text-purple-900">{dryRunResult.duration}</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!dryRunResult && (
                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-sm text-slate-600">
                            Click "Simulate Run (Dry)" to estimate the number of pages, cost, and duration before deploying.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDeploy}
                            disabled={status === 'running'}
                            className={`px-5 py-2.5 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 ${
                                status === 'running' ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow'
                            }`}
                        >
                            {status === 'running' ? (
                                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            {status === 'running' ? 'Deploying...' : 'Deploy Batch Run'}
                        </button>
                        <button
                            onClick={handleDryRun}
                            disabled={status === 'running'}
                            className="px-5 py-2.5 bg-white text-slate-700 font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Simulate Run (Dry)
                        </button>
                    </div>

                    {logs.length > 0 && (
                        <div className="mt-4 bg-slate-900 rounded-xl p-4 font-mono text-xs text-green-400 overflow-y-auto max-h-48 border border-slate-800">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1">
                                    <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    {log}
                                </div>
                            ))}
                            {status === 'running' && (
                                <div className="animate-pulse flex gap-1 mt-2">
                                    <div className="w-1.5 h-3 bg-green-400"></div>
                                    <div className="w-1.5 h-3 bg-green-400"></div>
                                    <div className="w-1.5 h-3 bg-green-400"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-semibold text-slate-900">Recent Runs</h3>
                </div>
                {recentRuns.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        No recent batch runs
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 text-sm">
                        {recentRuns.map((run) => (
                            <div key={run.id} className="p-4 px-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                        run.status === 'completed' ? 'bg-emerald-500' :
                                        run.status === 'running' ? 'bg-amber-500 animate-pulse' :
                                        'bg-rose-500'
                                    }`}></div>
                                    <span className="font-medium text-slate-900">{run.name}</span>
                                    <span className="text-slate-500">{run.pagesGenerated.toLocaleString()} pages</span>
                                </div>
                                <div className="text-slate-500">
                                    {run.status === 'completed' && run.completedAt
                                        ? `Completed ${getRelativeTime(run.completedAt)}`
                                        : run.status === 'running'
                                        ? 'Running...'
                                        : 'Failed'
                                    }
                                    {run.cost && ` • ${run.cost}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
