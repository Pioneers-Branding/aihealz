import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { AdStatus } from '@prisma/client';

/**
 * GET /api/admin/advertising/campaigns
 * List all campaigns
 *
 * POST /api/admin/advertising/campaigns
 * Create a new campaign
 */

export async function GET(request: NextRequest) {
    const auth = await verifyAdminAuth(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = request.nextUrl;
        const status = searchParams.get('status');
        const advertiserId = searchParams.get('advertiserId');

        const campaigns = await prisma.adCampaign.findMany({
            where: {
                ...(status && { status: status as AdStatus }),
                ...(advertiserId && { advertiserId: parseInt(advertiserId) }),
            },
            include: {
                advertiser: {
                    select: { id: true, companyName: true, slug: true },
                },
                _count: {
                    select: { impressions: true, clicks: true, conversions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ campaigns });
    } catch (error: unknown) {
        console.error('Fetch campaigns error:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await verifyAdminAuth(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            name,
            advertiserId,
            objective = 'awareness',
            billingModel = 'cpm',
            totalBudget,
            dailyBudget,
            startDate,
            endDate,
            targetConditions = [],
            targetCities = [],
            targetSpecialties = [],
        } = body;

        if (!name || !advertiserId || !totalBudget || !startDate) {
            return NextResponse.json(
                { error: 'Name, advertiserId, totalBudget, and startDate are required' },
                { status: 400 }
            );
        }

        // Verify advertiser exists
        const advertiser = await prisma.advertiser.findUnique({
            where: { id: advertiserId },
        });

        if (!advertiser) {
            return NextResponse.json({ error: 'Advertiser not found' }, { status: 404 });
        }

        const campaign = await prisma.adCampaign.create({
            data: {
                name,
                advertiserId,
                objective,
                billingModel,
                totalBudget,
                dailyBudget: dailyBudget || 0,
                spentAmount: 0,
                status: 'draft',
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                targetConditions,
                targetCities,
                targetSpecialties,
            },
            include: {
                advertiser: {
                    select: { companyName: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            campaign,
        });
    } catch (error: unknown) {
        console.error('Create campaign error:', error);
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }
}
