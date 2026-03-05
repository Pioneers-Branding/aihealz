import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';
import { z } from 'zod';

// Validation schema for PATCH
const updateEnquirySchema = z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'converted', 'closed']).optional(),
    assignedTo: z.string().max(100).nullable().optional(),
    notes: z.string().max(5000).nullable().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const { id } = await params;
        const enquiryId = parseInt(id, 10);

        if (isNaN(enquiryId) || enquiryId <= 0 || enquiryId > 2147483647) {
            return NextResponse.json({ error: 'Invalid enquiry ID' }, { status: 400 });
        }

        const enquiry = await prisma.adEnquiry.findUnique({
            where: { id: enquiryId },
            include: {
                advertiser: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                    },
                },
            },
        });

        if (!enquiry) {
            return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
        }

        return NextResponse.json(enquiry);
    } catch (error) {
        console.error('Failed to fetch enquiry:', error);
        return NextResponse.json({ error: 'Failed to fetch enquiry' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const { id } = await params;
        const enquiryId = parseInt(id, 10);

        if (isNaN(enquiryId) || enquiryId <= 0 || enquiryId > 2147483647) {
            return NextResponse.json({ error: 'Invalid enquiry ID' }, { status: 400 });
        }

        const body = await request.json();

        // Validate input with Zod
        const validation = updateEnquirySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { status, assignedTo, notes } = validation.data;
        const updateData: Record<string, unknown> = {};

        if (status) {
            updateData.status = status;

            // Set contactedAt timestamp when status changes to contacted
            if (status === 'contacted') {
                updateData.contactedAt = new Date();
            }
        }

        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo;
        }

        if (notes !== undefined) {
            updateData.notes = notes;
        }

        const enquiry = await prisma.adEnquiry.update({
            where: { id: enquiryId },
            data: updateData,
            include: {
                advertiser: {
                    select: {
                        id: true,
                        companyName: true,
                        slug: true,
                    },
                },
            },
        });

        return NextResponse.json(enquiry);
    } catch (error) {
        console.error('Failed to update enquiry:', error);
        return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify admin authentication
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const { id } = await params;
        const enquiryId = parseInt(id, 10);

        if (isNaN(enquiryId) || enquiryId <= 0 || enquiryId > 2147483647) {
            return NextResponse.json({ error: 'Invalid enquiry ID' }, { status: 400 });
        }

        await prisma.adEnquiry.delete({
            where: { id: enquiryId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete enquiry:', error);
        return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
    }
}
