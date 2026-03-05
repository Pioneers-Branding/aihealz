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
 * GET /api/admin/audit-logs
 * List audit logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
    return withErrorHandling(async () => {
        const searchParams = request.nextUrl.searchParams;
        const { skip, take, page, pageSize } = parsePagination(searchParams);

        // Filter parameters
        const actorType = searchParams.get('actorType');
        const actorId = searchParams.get('actorId');
        const action = searchParams.get('action');
        const resource = searchParams.get('resource');
        const resourceId = searchParams.get('resourceId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build where clause
        const where: Record<string, unknown> = {};

        if (actorType) where.actorType = actorType;
        if (actorId) where.actorId = actorId;
        if (action) where.action = { contains: action, mode: 'insensitive' };
        if (resource) where.resource = resource;
        if (resourceId) where.resourceId = resourceId;
        if (status) where.status = status;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                (where.createdAt as Record<string, Date>).gte = new Date(startDate);
            }
            if (endDate) {
                (where.createdAt as Record<string, Date>).lte = new Date(endDate);
            }
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return paginated(logs, total, page, pageSize);
    });
}

/**
 * POST /api/admin/audit-logs
 * Create a new audit log entry
 */
export async function POST(request: NextRequest) {
    return withErrorHandling(async () => {
        const body = await request.json();

        const { actorType, actorId, actorEmail, action, resource, resourceId, changes, metadata, status } = body;

        if (!actorType || !action || !resource) {
            throw Errors.validation('actorType, action, and resource are required');
        }

        // Get IP address and user agent from headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
        const userAgent = request.headers.get('user-agent');

        const log = await prisma.auditLog.create({
            data: {
                actorType,
                actorId,
                actorEmail,
                action,
                resource,
                resourceId,
                changes,
                metadata,
                ipAddress,
                userAgent,
                status: status || 'success',
            },
        });

        return success(log, 201);
    });
}
