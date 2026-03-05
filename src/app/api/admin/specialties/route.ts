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
 * GET /api/admin/specialties
 * List all medical specialties with optional filtering
 */
export async function GET(request: NextRequest) {
    return withErrorHandling(async () => {
        const searchParams = request.nextUrl.searchParams;
        const { skip, take, page, pageSize } = parsePagination(searchParams);

        const isActive = searchParams.get('isActive');
        const parentId = searchParams.get('parentId');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const where: Record<string, unknown> = {};

        if (isActive !== null) {
            where.isActive = isActive === 'true';
        }
        if (parentId) {
            where.parentId = parseInt(parentId, 10);
        }
        if (category) {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [specialties, total] = await Promise.all([
            prisma.medicalSpecialty.findMany({
                where,
                include: {
                    parent: {
                        select: { id: true, name: true, slug: true },
                    },
                    children: {
                        select: { id: true, name: true, slug: true },
                        where: { isActive: true },
                    },
                },
                orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
                skip,
                take,
            }),
            prisma.medicalSpecialty.count({ where }),
        ]);

        return paginated(specialties, total, page, pageSize);
    });
}

/**
 * POST /api/admin/specialties
 * Create a new medical specialty
 */
export async function POST(request: NextRequest) {
    return withErrorHandling(async () => {
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

        if (!name || !slug || !category) {
            throw Errors.validation('name, slug, and category are required');
        }

        // Check for slug conflict
        const existing = await prisma.medicalSpecialty.findUnique({
            where: { slug },
        });

        if (existing) {
            throw Errors.conflict('Specialty with this slug already exists');
        }

        // Validate parent exists if provided
        if (parentId) {
            const parent = await prisma.medicalSpecialty.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw Errors.notFound('Parent specialty');
            }
        }

        const specialty = await prisma.medicalSpecialty.create({
            data: {
                name,
                slug,
                shortName,
                description,
                icon,
                category,
                parentId,
                bodySystem,
                commonConditions: commonConditions ?? [],
                relatedTests: relatedTests ?? [],
                consultTypes: consultTypes ?? [],
                avgConsultFeeInr,
                avgConsultFeeUsd,
                metaTitle,
                metaDescription,
                displayOrder: displayOrder ?? 0,
                isActive: isActive ?? true,
            },
            include: {
                parent: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });

        return success(specialty, 201);
    });
}
