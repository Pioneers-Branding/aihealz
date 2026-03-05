import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get a single content (requires admin auth)
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const contentId = parseInt(id, 10);

        if (isNaN(contentId)) {
            return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
        }

        const content = await prisma.localizedContent.findUnique({
            where: { id: contentId },
            include: {
                condition: true,
                language: true,
                geography: true,
                reviewer: {
                    select: { id: true, name: true, qualifications: true }
                },
            }
        });

        if (!content) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Failed to fetch content:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

// PUT - Update content (requires admin auth)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const contentId = parseInt(id, 10);

        if (isNaN(contentId)) {
            return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
        }

        const body = await request.json();

        const {
            title,
            description,
            localizedAdvice,
            localFactors,
            consultationTips,
            metaTitle,
            metaDescription,
            status,
            reviewedBy,
        } = body;

        // Check if content exists
        const existing = await prisma.localizedContent.findUnique({
            where: { id: contentId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        // Calculate word count
        const wordCount = description ? description.split(/\s+/).filter(Boolean).length : null;

        const content = await prisma.localizedContent.update({
            where: { id: contentId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(localizedAdvice !== undefined && { localizedAdvice }),
                ...(localFactors !== undefined && { localFactors }),
                ...(consultationTips !== undefined && { consultationTips }),
                ...(metaTitle !== undefined && { metaTitle }),
                ...(metaDescription !== undefined && { metaDescription }),
                ...(status && { status: status as ContentStatus }),
                ...(reviewedBy !== undefined && { reviewedBy }),
                ...(wordCount !== null && { wordCount }),
                ...(status === 'verified' || status === 'published' ? { reviewedAt: new Date() } : {}),
            },
        });

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Failed to update content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}

// PATCH - Partial update (whitelisted fields only for security, requires admin auth)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const contentId = parseInt(id, 10);

        if (isNaN(contentId)) {
            return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
        }

        const body = await request.json();

        // Whitelist allowed fields for PATCH updates
        const allowedFields = ['status', 'reviewedBy'] as const;
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === 'status') {
                    // Validate status is a valid ContentStatus
                    const validStatuses = ['ai_draft', 'under_review', 'verified', 'published'];
                    if (!validStatuses.includes(body.status)) {
                        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
                    }
                    updateData.status = body.status as ContentStatus;
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update. Allowed: ' + allowedFields.join(', ') },
                { status: 400 }
            );
        }

        // Handle status updates with timestamps
        if (updateData.status === 'verified' || updateData.status === 'published') {
            updateData.reviewedAt = new Date();
        }

        const content = await prisma.localizedContent.update({
            where: { id: contentId },
            data: updateData,
        });

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Failed to update content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}

// DELETE - Delete content (requires admin auth)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const contentId = parseInt(id, 10);

        if (isNaN(contentId)) {
            return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
        }

        await prisma.localizedContent.delete({
            where: { id: contentId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete content:', error);
        return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
    }
}
