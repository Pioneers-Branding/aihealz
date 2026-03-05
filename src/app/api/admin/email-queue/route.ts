import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import {
    withErrorHandling,
    parsePagination,
    success,
    paginated,
    Errors,
} from '@/lib/api-errors';

/**
 * GET /api/admin/email-queue
 * List email queue entries with filtering
 */
export async function GET(request: NextRequest) {
    return withErrorHandling(async () => {
        const searchParams = request.nextUrl.searchParams;
        const { skip, take, page, pageSize } = parsePagination(searchParams);

        const status = searchParams.get('status');
        const templateName = searchParams.get('templateName');
        const toEmail = searchParams.get('toEmail');
        const priority = searchParams.get('priority');

        const where: Record<string, unknown> = {};

        if (status) where.status = status;
        if (templateName) where.templateName = templateName;
        if (toEmail) where.toEmail = { contains: toEmail, mode: 'insensitive' };
        if (priority) where.priority = parseInt(priority, 10);

        const [emails, total] = await Promise.all([
            prisma.emailQueue.findMany({
                where,
                orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
                skip,
                take,
            }),
            prisma.emailQueue.count({ where }),
        ]);

        return paginated(emails, total, page, pageSize);
    });
}

/**
 * POST /api/admin/email-queue
 * Add an email to the queue
 */
export async function POST(request: NextRequest) {
    return withErrorHandling(async () => {
        const body = await request.json();

        const {
            toEmail,
            toName,
            subject,
            templateName,
            variables,
            priority,
            scheduledFor,
        } = body;

        if (!toEmail || !subject || !templateName) {
            throw Errors.validation('toEmail, subject, and templateName are required');
        }

        const email = await prisma.emailQueue.create({
            data: {
                toEmail,
                toName,
                subject,
                templateName,
                variables: variables ?? {},
                priority: priority ?? 5,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                status: 'pending',
            },
        });

        return success(email, 201);
    });
}

/**
 * PATCH /api/admin/email-queue
 * Bulk update email status (retry failed, cancel pending)
 */
export async function PATCH(request: NextRequest) {
    return withErrorHandling(async () => {
        const body = await request.json();
        const { ids, action } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            throw Errors.validation('ids array is required');
        }

        if (!['retry', 'cancel'].includes(action)) {
            throw Errors.validation('action must be "retry" or "cancel"');
        }

        let count = 0;

        if (action === 'retry') {
            const result = await prisma.emailQueue.updateMany({
                where: {
                    id: { in: ids },
                    status: 'failed',
                },
                data: {
                    status: 'pending',
                    attempts: 0,
                    errorMsg: null,
                },
            });
            count = result.count;
        } else if (action === 'cancel') {
            const result = await prisma.emailQueue.updateMany({
                where: {
                    id: { in: ids },
                    status: 'pending',
                },
                data: {
                    status: 'cancelled',
                },
            });
            count = result.count;
        }

        return success({ action, updated: count });
    });
}

/**
 * DELETE /api/admin/email-queue
 * Clear old/processed emails
 */
export async function DELETE(request: NextRequest) {
    return withErrorHandling(async () => {
        const body = await request.json();
        const { status, olderThanDays } = body;

        const where: Record<string, unknown> = {};

        if (status) {
            where.status = Array.isArray(status) ? { in: status } : status;
        }

        if (olderThanDays) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - olderThanDays);
            where.createdAt = { lt: cutoff };
        }

        if (Object.keys(where).length === 0) {
            throw Errors.validation('Provide status or olderThanDays filter');
        }

        const result = await prisma.emailQueue.deleteMany({ where });

        return success({ deleted: result.count });
    });
}
