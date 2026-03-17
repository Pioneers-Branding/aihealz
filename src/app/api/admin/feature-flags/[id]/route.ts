import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import {
    withErrorHandling,
    parseId,
    success,
    Errors,
} from '@/lib/api-errors';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/feature-flags/[id]
 * Get a single feature flag by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;
        const flagId = parseId(id);

        const flag = await prisma.featureFlag.findUnique({
            where: { id: flagId },
        });

        if (!flag) {
            throw Errors.notFound('Feature flag');
        }

        return success(flag);
    });
}

/**
 * PATCH /api/admin/feature-flags/[id]
 * Update a feature flag
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;
        const flagId = parseId(id);
        const body = await request.json();

        const { key, name, description, isEnabled, rolloutPct, targetRules, variants, category, expiresAt } = body;

        // Check if flag exists
        const existing = await prisma.featureFlag.findUnique({
            where: { id: flagId },
        });

        if (!existing) {
            throw Errors.notFound('Feature flag');
        }

        // If key is being changed, check for conflicts
        if (key && key !== existing.key) {
            const keyConflict = await prisma.featureFlag.findUnique({
                where: { key },
            });
            if (keyConflict) {
                throw Errors.conflict('Feature flag with this key already exists');
            }
        }

        const flag = await prisma.featureFlag.update({
            where: { id: flagId },
            data: {
                ...(key !== undefined && { key }),
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(isEnabled !== undefined && { isEnabled }),
                ...(rolloutPct !== undefined && { rolloutPct }),
                ...(targetRules !== undefined && { targetRules }),
                ...(variants !== undefined && { variants }),
                ...(category !== undefined && { category }),
                ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
            },
        });

        return success(flag);
    });
}

/**
 * DELETE /api/admin/feature-flags/[id]
 * Delete a feature flag
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;
        const flagId = parseId(id);

        const existing = await prisma.featureFlag.findUnique({
            where: { id: flagId },
        });

        if (!existing) {
            throw Errors.notFound('Feature flag');
        }

        await prisma.featureFlag.delete({
            where: { id: flagId },
        });

        return success({ deleted: true });
    });
}
