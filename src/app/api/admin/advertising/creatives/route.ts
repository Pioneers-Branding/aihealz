import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { AdType } from '@prisma/client';

/**
 * GET /api/admin/advertising/creatives
 * List all ad creatives
 *
 * POST /api/admin/advertising/creatives
 * Create a new creative
 */

export async function GET(request: NextRequest) {
    const auth = await verifyAdminAuth(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = request.nextUrl;
        const advertiserId = searchParams.get('advertiserId');

        const creatives = await prisma.adCreative.findMany({
            where: {
                ...(advertiserId && { advertiserId: parseInt(advertiserId) }),
            },
            include: {
                advertiser: {
                    select: { companyName: true },
                },
                _count: {
                    select: { placements: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ creatives });
    } catch (error: unknown) {
        console.error('Fetch creatives error:', error);
        return NextResponse.json({ error: 'Failed to fetch creatives' }, { status: 500 });
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
            advertiserId,
            name,
            adType = 'banner',
            headline,
            description,
            ctaText = 'Learn More',
            destinationUrl,
            imageUrl,
            width,
            height,
        } = body;

        if (!advertiserId || !name || !destinationUrl) {
            return NextResponse.json(
                { error: 'advertiserId, name, and destinationUrl are required' },
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

        const creative = await prisma.adCreative.create({
            data: {
                advertiserId,
                name,
                adType: adType as AdType,
                headline: headline || '',
                description: description || '',
                ctaText,
                destinationUrl,
                imageUrl: imageUrl || '',
                width: width || null,
                height: height || null,
                isActive: true,
            },
            include: {
                advertiser: {
                    select: { companyName: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            creative,
        });
    } catch (error: unknown) {
        console.error('Create creative error:', error);
        return NextResponse.json({ error: 'Failed to create creative' }, { status: 500 });
    }
}
