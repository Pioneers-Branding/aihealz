import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// Input validation schema
const enquirySchema = z.object({
    companyName: z.string().min(1, 'Company name is required').max(200).trim(),
    companyType: z.enum(['hospital', 'clinic', 'pharma', 'medtech', 'insurance', 'other'], {
        error: 'Invalid company type'
    }),
    contactName: z.string().min(1, 'Contact name is required').max(100).trim(),
    email: z.string().email('Invalid email address').max(200).toLowerCase().trim(),
    phone: z.string().max(20).optional(),
    website: z.string().url().max(500).optional().or(z.literal('')),
    adBudget: z.string().max(50).optional(),
    targetRegions: z.array(z.string().max(100)).max(20).optional(),
    message: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`adEnquiry:${clientId}`, RATE_LIMITS.form);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many submissions. Please wait before trying again.' },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const body = await request.json();

        // Validate input with Zod
        const validation = enquirySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Extract UTM parameters from headers (if present)
        const referer = request.headers.get('referer') || '';
        let utmSource: string | null = null;
        let utmMedium: string | null = null;
        let utmCampaign: string | null = null;

        try {
            const url = new URL(referer);
            utmSource = url.searchParams.get('utm_source')?.slice(0, 100) || null;
            utmMedium = url.searchParams.get('utm_medium')?.slice(0, 100) || null;
            utmCampaign = url.searchParams.get('utm_campaign')?.slice(0, 100) || null;
        } catch {
            // Referer is not a valid URL, skip UTM parsing
        }

        // Create enquiry in database
        const enquiry = await prisma.adEnquiry.create({
            data: {
                companyName: data.companyName,
                companyType: data.companyType,
                contactName: data.contactName,
                email: data.email,
                phone: data.phone || null,
                website: data.website || null,
                adBudget: data.adBudget || null,
                targetRegions: data.targetRegions || [],
                targetConditions: [],
                message: data.message || null,
                source: 'website',
                utmSource,
                utmMedium,
                utmCampaign,
                status: 'new',
            },
        });

        return NextResponse.json({
            success: true,
            enquiryId: enquiry.id,
            message: 'Enquiry submitted successfully. Our team will contact you within 24 hours.',
        });

    } catch (error) {
        console.error('Ad enquiry submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit enquiry. Please try again later.' },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve enquiries (for admin)
export async function GET(request: NextRequest) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const skip = (page - 1) * limit;

        const where = status ? { status } : {};

        const [enquiries, total] = await Promise.all([
            prisma.adEnquiry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    advertiser: {
                        select: {
                            id: true,
                            companyName: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.adEnquiry.count({ where }),
        ]);

        return NextResponse.json({
            enquiries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Failed to fetch enquiries:', error);
        return NextResponse.json(
            { error: 'Failed to fetch enquiries' },
            { status: 500 }
        );
    }
}
