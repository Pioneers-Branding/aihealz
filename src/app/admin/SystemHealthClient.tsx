'use client';

import { useState, useEffect } from 'react';

interface HealthCheck {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    latency?: number;
}

interface HealthData {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    totalCheckTime: number;
    checks: HealthCheck[];
}

export function SystemHealthClient() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/health');
            if (res.ok) {
                const data = await res.json();
                setHealth(data);
                setLastChecked(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch health:', error);
            setHealth({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                totalCheckTime: 0,
                checks: [{
                    service: 'Health Check',
                    status: 'unhealthy',
                    message: 'Failed to connect',
                }],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Refresh every 60 seconds
        const interval = setInterval(fetchHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    const statusColors = {
        healthy: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', text: 'text-green-700' },
        degraded: { bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500', text: 'text-yellow-700' },
        unhealthy: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', text: 'text-red-700' },
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">System Status</h2>
                <div className="flex items-center gap-3">
                    {lastChecked && (
                        <span className="text-xs text-slate-400">
                            Last checked: {lastChecked.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={fetchHealth}
                        disabled={loading}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {loading && !health ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-lg animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : health ? (
                <>
                    {/* Overall Status Banner */}
                    <div className={`mb-4 p-3 rounded-lg ${statusColors[health.status].bg} ${statusColors[health.status].border} border flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${statusColors[health.status].dot} ${health.status === 'healthy' ? 'animate-pulse' : ''}`} />
                            <span className={`font-medium ${statusColors[health.status].text}`}>
                                System is {health.status === 'healthy' ? 'Operational' : health.status === 'degraded' ? 'Degraded' : 'Having Issues'}
                            </span>
                        </div>
                        <span className="text-xs text-slate-500">
                            Check completed in {health.totalCheckTime}ms
                        </span>
                    </div>

                    {/* Individual Services */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {health.checks.map((check) => {
                            const colors = statusColors[check.status];
                            return (
                                <div key={check.service} className={`p-4 ${colors.bg} rounded-lg border ${colors.border}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`w-2 h-2 ${colors.dot} rounded-full`} />
                                        <span className={`text-sm font-medium ${colors.text}`}>{check.service}</span>
                                    </div>
                                    <p className={`text-xs ${colors.text} opacity-80`}>{check.message}</p>
                                    {check.latency !== undefined && (
                                        <p className="text-xs text-slate-400 mt-1">{check.latency}ms</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : null}
        </div>
    );
}
