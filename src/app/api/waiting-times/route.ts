import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateSessionHash } from '@/lib/ai-pipeline/pipeline';

/**
 * POST /api/waiting-times
 * Submit a wait time report for a doctor.
 *
 * GET /api/waiting-times?doctorId=123
 * Get average wait time for a doctor.
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { doctorId, waitMinutes, visitType = 'in-person' } = body;

        if (!doctorId || waitMinutes === undefined) {
            return NextResponse.json(
                { error: 'doctorId and waitMinutes are required' },
                { status: 400 }
            );
        }

        if (waitMinutes < 0 || waitMinutes > 480) {
            return NextResponse.json(
                { error: 'waitMinutes must be between 0 and 480' },
                { status: 400 }
            );
        }

        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const sessionHash = generateSessionHash(ip, userAgent);

        const report = await prisma.waitingTimeReport.create({
            data: {
                doctorId: parseInt(doctorId, 10),
                waitMinutes: parseInt(waitMinutes, 10),
                visitType,
                sessionHash,
            },
        });

        return NextResponse.json({ success: true, id: report.id });
    } catch (error) {
        console.error('Waiting time report error:', error);
        return NextResponse.json(
            { error: 'Failed to submit report' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const doctorId = searchParams.get('doctorId');

        if (!doctorId) {
            return NextResponse.json(
                { error: 'doctorId query parameter is required' },
                { status: 400 }
            );
        }

        const stats = await prisma.waitingTimeReport.aggregate({
            where: { doctorId: parseInt(doctorId, 10) },
            _avg: { waitMinutes: true },
            _min: { waitMinutes: true },
            _max: { waitMinutes: true },
            _count: true,
        });

        // Recent reports (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentStats = await prisma.waitingTimeReport.aggregate({
            where: {
                doctorId: parseInt(doctorId, 10),
                visitDate: { gte: thirtyDaysAgo },
            },
            _avg: { waitMinutes: true },
            _count: true,
        });

        return NextResponse.json({
            doctorId: parseInt(doctorId, 10),
            allTime: {
                averageMinutes: stats._avg.waitMinutes ? Math.round(stats._avg.waitMinutes) : null,
                minMinutes: stats._min.waitMinutes,
                maxMinutes: stats._max.waitMinutes,
                totalReports: stats._count,
            },
            last30Days: {
                averageMinutes: recentStats._avg.waitMinutes
                    ? Math.round(recentStats._avg.waitMinutes)
                    : null,
                totalReports: recentStats._count,
            },
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=1800' },
        });
    } catch (error) {
        console.error('Waiting times GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch waiting times' }, { status: 500 });
    }
}
