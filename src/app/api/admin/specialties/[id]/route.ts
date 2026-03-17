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
 * GET /api/admin/specialties/[id]
 * Get a single specialty by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;
        const specialtyId = parseId(id);

        const specialty = await prisma.medicalSpecialty.findUnique({
            where: { id: specialtyId },
            include: {
                parent: {
                    select: { id: true, name: true, slug: true },
                },
                children: {
                    select: { id: true, name: true, slug: true, isActive: true },
                    orderBy: { displayOrder: 'asc' },
                },
            },
        });

        if (!specialty) {
            throw Errors.notFound('Specialty');
        }

        return success(specialty);
    });
}

/**
 * PATCH /api/admin/specialties/[id]
 * Update a specialty
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;
        const specialtyId = parseId(id);
        const body = await request.json();

        const {
            name,
            slug,
            shortName,
            description,
            icon,
            category,
            parentId,
            bodySystem,
            commonConditions,
            relatedTests,
            consultTypes,
            avgConsultFeeInr,
            avgConsultFeeUsd,
            metaTitle,
            metaDescription,
            displayOrder,
            isActive,
        } = body;

        // Check if specialty exists
        const existing = await prisma.medicalSpecialty.findUnique({
            where: { id: specialtyId },
        });

        if (!existing) {
            throw Errors.notFound('Specialty');
        }

        // If slug is being changed, check for conflicts
        if (slug && slug !== existing.slug) {
            const slugConflict = await prisma.medicalSpecialty.findUnique({
                where: { slug },
            });
            if (slugConflict) {
                throw Errors.conflict('Specialty with this slug already exists');
            }
        }

        // Validate parent exists and prevent circular reference
        if (parentId !== undefined) {
            if (parentId === specialtyId) {
                throw Errors.validation('Specialty cannot be its own parent');
            }
            if (parentId !== null) {
                const parent = await prisma.medicalSpecialty.findUnique({
                    where: { id: parentId },
                });
                if (!parent) {
                    throw Errors.notFound('Parent specialty');
                }
                // Check for circular reference
                if (parent.parentId === specialtyId) {
                    throw Errors.validation('Circular reference detected');
                }
            }
        }

        const specialty = await prisma.medicalSpecialty.update({
            where: { id: specialtyId },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(shortName !== undefined && { shortName }),
                ...(description !== undefined && { description }),
                ...(icon !== undefined && { icon }),
                ...(category !== undefined && { category }),
                ...(parentId !== undefined && { parentId }),
                ...(bodySystem !== undefined && { bodySystem }),
                ...(commonConditions !== undefined && { commonConditions }),
                ...(relatedTests !== undefined && { relatedTests }),
                ...(consultTypes !== undefined && { consultTypes }),
                ...(avgConsultFeeInr !== undefined && { avgConsultFeeInr }),
                ...(avgConsultFeeUsd !== undefined && { avgConsultFeeUsd }),
                ...(metaTitle !== undefined && { metaTitle }),
                ...(metaDescription !== undefined && { metaDescription }),
                ...(displayOrder !== undefined && { displayOrder }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                parent: {
                    select: { id: true, name: true, slug: true },
                },
                children: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });

        return success(specialty);
    });
}

/**
 * DELETE /api/admin/specialties/[id]
 * Delete a specialty (soft delete by setting isActive to false)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    return withErrorHandling(async () => {
        const { id } = await params;
        const specialtyId = parseId(id);

        const existing = await prisma.medicalSpecialty.findUnique({
            where: { id: specialtyId },
            include: { children: { select: { id: true } } },
        });

        if (!existing) {
            throw Errors.notFound('Specialty');
        }

        // Check if specialty has children
        if (existing.children.length > 0) {
            throw Errors.validation('Cannot delete specialty with child specialties. Remove children first.');
        }

        // Soft delete - set isActive to false
        await prisma.medicalSpecialty.update({
            where: { id: specialtyId },
            data: { isActive: false },
        });

        return success({ deleted: true, id: specialtyId });
    });
}
