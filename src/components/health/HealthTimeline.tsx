'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, ChevronDown } from 'lucide-react';

/**
 * Health Timeline Chart — Longitudinal Trend Visualization
 *
 * Clean line chart with soft glow.
 * Shows: Improving / Stable / Requires Review indicators.
 */

interface TimelineEntry {
    date: string;
    value: number;
    unit: string;
    trend: string | null;
    trendPercent: number | null;
}

interface TimelineData {
    indicator: string;
    entries: TimelineEntry[];
    currentTrend: string;
    insight: string;
}

interface Props {
    sessionHash: string;
}

export default function HealthTimeline({ sessionHash }: Props) {
    const [timelines, setTimelines] = useState<TimelineData[]>([]);
    const [activeIndicator, setActiveIndicator] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTimeline();
    }, [sessionHash]);

    async function fetchTimeline() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/health-timeline?session=${sessionHash}`);
            if (!res.ok) {
                setError('Failed to load timeline');
                return;
            }
            const data = await res.json();
            if (data.timelines?.length) {
                setTimelines(data.timelines);
                setActiveIndicator(data.timelines[0].indicator);
            }
        } catch {
            setError('Unable to load health timeline');
        } finally {
            setLoading(false);
        }
    }

    const active = timelines.find((t) => t.indicator === activeIndicator);

    const trendConfig: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
        improving: { icon: TrendingDown, color: 'text-emerald-400', label: 'Improving' },
        stable: { icon: Minus, color: 'text-blue-400', label: 'Stable' },
        worsening: { icon: TrendingUp, color: 'text-amber-400', label: 'Requires Review' },
    };

    function renderChart(entries: TimelineEntry[]) {
        if (entries.length < 2) return null;

        const values = entries.map((e) => e.value);
        const min = Math.min(...values) * 0.9;
        const max = Math.max(...values) * 1.1;
        const range = max - min || 1;
        const width = 500;
        const height = 180;
        const padding = 20;

        const points = entries.map((entry, i) => ({
            x: padding + (i / (entries.length - 1)) * (width - padding * 2),
            y: height - padding - ((entry.value - min) / range) * (height - padding * 2),
        }));

        const pathD = points
            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(' ');

        const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.15))' }}>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((frac) => (
                    <line
                        key={frac}
                        x1={padding} y1={padding + frac * (height - padding * 2)}
                        x2={width - padding} y2={padding + frac * (height - padding * 2)}
                        stroke="rgba(255,255,255,0.03)" strokeWidth="1"
                    />
                ))}

                {/* Area fill */}
                <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill="url(#chartGrad)" />

                {/* Line */}
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                        <text x={p.x} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9">
                            {new Date(entries[i].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </text>
                    </g>
                ))}
            </svg>
        );
    }

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/[0.06] rounded w-1/3" />
                    <div className="h-40 bg-white/[0.04] rounded-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-6">
                <p className="text-sm text-red-400">{error}</p>
            </div>
        );
    }

    if (!timelines.length) return null;

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <Activity size={16} className="text-primary-400" />
                    Health Progress
                </h3>

                {/* Indicator selector */}
                <div className="relative">
                    <select
                        value={activeIndicator}
                        onChange={(e) => setActiveIndicator(e.target.value)}
                        className="appearance-none bg-white/5 border border-white/5 rounded-lg px-3 py-1.5
                       text-xs text-surface-100/60 pr-7 focus:outline-none cursor-pointer"
                    >
                        {timelines.map((t) => (
                            <option key={t.indicator} value={t.indicator}>{t.indicator}</option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-100/30 pointer-events-none" />
                </div>
            </div>

            {/* Trend badge */}
            {active && (
                <div className="flex items-center gap-3">
                    {(() => {
                        const config = trendConfig[active.currentTrend] || trendConfig.stable;
                        const Icon = config.icon;
                        return (
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs ${config.color}`}>
                                <Icon size={12} />
                                {config.label}
                            </div>
                        );
                    })()}
                    <p className="text-xs text-surface-100/40">{active.insight}</p>
                </div>
            )}

            {/* Chart */}
            {active && renderChart(active.entries)}
        </div>
    );
}
