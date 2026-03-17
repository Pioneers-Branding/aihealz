import { NextRequest, NextResponse } from 'next/server';
import { getDoctorLeads } from '@/lib/provider/lead-scorer';
import prisma from '@/lib/db';
import { verifyProviderOwnership } from '@/lib/provider-auth';
import {
    Errors,
    parseId,
    parsePagination,
    withErrorHandling,
    assertExists,
} from '@/lib/api-errors';

/**
 * Provider Leads Dashboard API
 *
 * GET /api/provider/leads?doctorId=123&intent=high&page=1
 *
 * Requires authentication - token must match the requested doctorId
 */

export async function GET(request: NextRequest) {
    return withErrorHandling(async () => {
        const { searchParams } = request.nextUrl;

        // Parse and validate doctorId
        const doctorId = parseId(searchParams.get('doctorId'), 'doctorId');

        // Verify authentication and ownership
        const auth = await verifyProviderOwnership(request, doctorId);
        if (!auth.authorized) {
            throw Errors.unauthorized(auth.error || 'Authentication required');
        }

        // Parse pagination
        const { page, pageSize } = parsePagination(searchParams);

        // Fetch leads with filters
        const leads = await getDoctorLeads(doctorId, {
            page,
            limit: pageSize,
            intentFilter: searchParams.get('intent') || undefined,
            unviewedOnly: searchParams.get('unviewed') === 'true',
        });

        // Provider analytics summary (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const analytics = await prisma.providerAnalytics.aggregate({
            where: { doctorId, date: { gte: thirtyDaysAgo } },
            _sum: {
                profileViews: true,
                searchAppearances: true,
                leadCount: true,
                contactReveals: true,
                teleconsultCount: true,
            },
        });

        // Badge info
        const doctor = await prisma.doctorProvider.findUnique({
            where: { id: doctorId },
            select: {
                badgeScore: true,
                badgeRank: true,
                badgeLabel: true,
                name: true,
                subscriptionTier: true,
            },
        });

        assertExists(doctor, 'Doctor');

        return NextResponse.json({
            data: {
                leads,
                analytics: {
                    profileViews: analytics._sum.profileViews || 0,
                    searchAppearances: analytics._sum.searchAppearances || 0,
                    totalLeads: analytics._sum.leadCount || 0,
                    contactReveals: analytics._sum.contactReveals || 0,
                    teleconsults: analytics._sum.teleconsultCount || 0,
                },
                badge: {
                    score: doctor.badgeScore ? Number(doctor.badgeScore) : 0,
                    rank: doctor.badgeRank,
                    label: doctor.badgeLabel,
                },
                doctor: {
                    name: doctor.name,
                    tier: doctor.subscriptionTier,
                },
            },
        });
    });
}
