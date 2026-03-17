import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import {
    withErrorHandling,
    success,
    Errors,
} from '@/lib/api-errors';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/email-queue/[id]
 * Get a single email from the queue
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;

        const email = await prisma.emailQueue.findUnique({
            where: { id },
        });

        if (!email) {
            throw Errors.notFound('Email');
        }

        return success(email);
    });
}

/**
 * PATCH /api/admin/email-queue/[id]
 * Update an email in the queue (only if pending)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.emailQueue.findUnique({
            where: { id },
        });

        if (!existing) {
            throw Errors.notFound('Email');
        }

        if (existing.status !== 'pending') {
            throw Errors.validation('Can only update pending emails');
        }

        const {
            toEmail,
            toName,
            subject,
            variables,
            priority,
            scheduledFor,
        } = body;

        const email = await prisma.emailQueue.update({
            where: { id },
            data: {
                ...(toEmail !== undefined && { toEmail }),
                ...(toName !== undefined && { toName }),
                ...(subject !== undefined && { subject }),
                ...(variables !== undefined && { variables }),
                ...(priority !== undefined && { priority }),
                ...(scheduledFor !== undefined && { scheduledFor: new Date(scheduledFor) }),
            },
        });

        return success(email);
    });
}

/**
 * DELETE /api/admin/email-queue/[id]
 * Delete a specific email from the queue
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;

        const existing = await prisma.emailQueue.findUnique({
            where: { id },
        });

        if (!existing) {
            throw Errors.notFound('Email');
        }

        await prisma.emailQueue.delete({
            where: { id },
        });

        return success({ deleted: true, id });
    });
}
