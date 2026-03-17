import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateSessionHash } from '@/lib/ai-pipeline/pipeline';

/**
 * GET /api/health-timeline
 *
 * Returns longitudinal health indicator trends for the current session.
 * Detects improvements, worsening, and stable trends across uploads.
 *
 * Query params:
 * - indicator: Filter by specific indicator name (optional)
 * - limit: Max entries per indicator (default: 10)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const indicatorFilter = searchParams.get('indicator');
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const sessionHash = generateSessionHash(ip, userAgent);

        // Fetch timeline entries
        const entries = await prisma.healthTimeline.findMany({
            where: {
                sessionHash,
                ...(indicatorFilter ? { indicatorName: indicatorFilter } : {}),
            },
            orderBy: { recordedDate: 'desc' },
            take: limit * 10, // Fetch enough for multiple indicators
        });

    // Group by indicator
    const grouped: Record<string, Array<{
        value: number | null;
        unit: string | null;
        date: string;
        trend: string | null;
        trendPercent: number | null;
    }>> = {};

    for (const entry of entries) {
        const key = entry.indicatorName;
        if (!grouped[key]) grouped[key] = [];
        if (grouped[key].length < limit) {
            grouped[key].push({
                value: entry.indicatorValue ? Number(entry.indicatorValue) : null,
                unit: entry.indicatorUnit,
                date: entry.recordedDate.toISOString().split('T')[0],
                trend: entry.trendDirection,
                trendPercent: entry.trendPercent ? Number(entry.trendPercent) : null,
            });
        }
    }

    // Generate summary insights
    const insights: string[] = [];
    for (const [name, values] of Object.entries(grouped)) {
        if (values.length >= 2) {
            const latest = values[0];
            if (latest.trend === 'improving') {
                insights.push(`Your ${name} has improved by ${Math.abs(latest.trendPercent || 0).toFixed(1)}% since your last report.`);
            } else if (latest.trend === 'worsening') {
                insights.push(`Your ${name} has increased by ${Math.abs(latest.trendPercent || 0).toFixed(1)}% since your last report. Consider discussing this with your doctor.`);
            } else {
                insights.push(`Your ${name} has remained stable since your last report.`);
            }
        }
    }

        return NextResponse.json({
            indicators: grouped,
            insights,
            totalEntries: entries.length,
        });
    } catch (error) {
        console.error('Health timeline API error:', error);
        return NextResponse.json({ error: 'Failed to fetch health timeline' }, { status: 500 });
    }
}
