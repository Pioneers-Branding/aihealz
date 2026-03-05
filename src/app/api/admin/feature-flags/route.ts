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
 * GET /api/admin/feature-flags
 * List all feature flags with optional filtering
 */
export async function GET(request: NextRequest) {
    return withErrorHandling(async () => {
        const searchParams = request.nextUrl.searchParams;
        const { skip, take, page, pageSize } = parsePagination(searchParams);

        const isEnabled = searchParams.get('isEnabled');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const where: Record<string, unknown> = {};

        if (isEnabled !== null) {
            where.isEnabled = isEnabled === 'true';
        }
        if (category) {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { key: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [flags, total] = await Promise.all([
            prisma.featureFlag.findMany({
                where,
                orderBy: { key: 'asc' },
                skip,
                take,
            }),
            prisma.featureFlag.count({ where }),
        ]);

        return paginated(flags, total, page, pageSize);
    });
}

/**
 * POST /api/admin/feature-flags
 * Create a new feature flag
 */
export async function POST(request: NextRequest) {
    return withErrorHandling(async () => {
        const body = await request.json();

        const { key, name, description, isEnabled, rolloutPct, targetRules, variants, category, expiresAt } = body;

        if (!key || !name) {
            throw Errors.validation('key and name are required');
        }

        // Check if flag with this key already exists
        const existing = await prisma.featureFlag.findUnique({
            where: { key },
        });

        if (existing) {
            throw Errors.conflict('Feature flag with this key already exists');
        }

        const flag = await prisma.featureFlag.create({
            data: {
                key,
                name,
                description,
                isEnabled: isEnabled ?? false,
                rolloutPct: rolloutPct ?? 100,
                targetRules,
                variants,
                category: category ?? 'general',
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        });

        return success(flag, 201);
    });
}

/**
 * PATCH /api/admin/feature-flags
 * Bulk update feature flags (enable/disable multiple)
 */
export async function PATCH(request: NextRequest) {
    return withErrorHandling(async () => {
        const body = await request.json();

        const { ids, isEnabled } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            throw Errors.validation('ids array is required');
        }

        if (typeof isEnabled !== 'boolean') {
            throw Errors.validation('isEnabled must be a boolean');
        }

        const result = await prisma.featureFlag.updateMany({
            where: { id: { in: ids } },
            data: { isEnabled },
        });

        return success({ updated: result.count });
    });
}
