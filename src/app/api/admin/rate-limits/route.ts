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
 * GET /api/admin/rate-limits
 * List rate limit records with filtering
 */
export async function GET(request: NextRequest) {
    return withErrorHandling(async () => {
        const searchParams = request.nextUrl.searchParams;
        const { skip, take, page, pageSize } = parsePagination(searchParams);

        const identifier = searchParams.get('identifier');
        const endpoint = searchParams.get('endpoint');

        const where: Record<string, unknown> = {};

        if (identifier) {
            where.identifier = { contains: identifier, mode: 'insensitive' };
        }
        if (endpoint) {
            where.endpoint = endpoint;
        }

        const [limits, total] = await Promise.all([
            prisma.apiRateLimit.findMany({
                where,
                orderBy: { windowStart: 'desc' },
                skip,
                take,
            }),
            prisma.apiRateLimit.count({ where }),
        ]);

        return paginated(limits, total, page, pageSize);
    });
}

/**
 * DELETE /api/admin/rate-limits
 * Clear rate limit records
 */
export async function DELETE(request: NextRequest) {
    return withErrorHandling(async () => {
        const body = await request.json();
        const { identifiers, clearAll, olderThanHours } = body;

        if (clearAll) {
            // Clear all rate limit records
            const result = await prisma.apiRateLimit.deleteMany({});
            return success({ cleared: result.count });
        }

        if (olderThanHours) {
            // Clear records older than specified hours
            const cutoff = new Date();
            cutoff.setHours(cutoff.getHours() - olderThanHours);
            const result = await prisma.apiRateLimit.deleteMany({
                where: {
                    windowStart: { lt: cutoff },
                },
            });
            return success({ cleared: result.count });
        }

        if (Array.isArray(identifiers) && identifiers.length > 0) {
            // Clear specific identifiers
            const result = await prisma.apiRateLimit.deleteMany({
                where: { identifier: { in: identifiers } },
            });
            return success({ cleared: result.count });
        }

        throw Errors.validation('Provide identifiers, clearAll, or olderThanHours');
    });
}
