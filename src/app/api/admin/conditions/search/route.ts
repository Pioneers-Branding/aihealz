import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * GET /api/admin/conditions/search
 * Server-side paginated, searchable, filterable conditions API for CMS.
 *
 * Query params:
 *   q         - text search (commonName, scientificName, slug)
 *   page      - page number (default: 1)
 *   pageSize  - items per page (default: 50, max: 100)
 *   specialty - filter by specialistType (exact match)
 *   status    - all | active | inactive
 *   sortBy    - commonName | createdAt | specialistType (default: commonName)
 *   sortDir   - asc | desc (default: asc)
 *
 * Requires admin authentication.
 */
export async function GET(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { searchParams } = request.nextUrl;

        const q = searchParams.get('q')?.trim() || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10)));
        const specialty = searchParams.get('specialty') || '';
        const status = searchParams.get('status') || 'all';
        const sortBy = searchParams.get('sortBy') || 'commonName';
        const sortDir = (searchParams.get('sortDir') || 'asc') as 'asc' | 'desc';

        // Build where clause
        const where: Prisma.MedicalConditionWhereInput = {};

        // Text search
        if (q) {
            where.OR = [
                { commonName: { contains: q, mode: 'insensitive' } },
                { scientificName: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q.toLowerCase() } },
            ];
        }

        // Specialty filter
        if (specialty) {
            where.specialistType = specialty;
        }

        // Status filter
        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'inactive') {
            where.isActive = false;
        }

        // Build orderBy
        const validSortFields: Record<string, string> = {
            commonName: 'commonName',
            createdAt: 'createdAt',
            specialistType: 'specialistType',
        };
        const orderByField = validSortFields[sortBy] || 'commonName';
        const orderBy = { [orderByField]: sortDir };

        // Execute queries in parallel
        const [conditions, total] = await Promise.all([
            prisma.medicalCondition.findMany({
                where,
                orderBy,
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    slug: true,
                    scientificName: true,
                    commonName: true,
                    description: true,
                    specialistType: true,
                    severityLevel: true,
                    icdCode: true,
                    bodySystem: true,
                    isActive: true,
                    createdAt: true,
                    _count: {
                        select: {
                            localizedContent: true,
                            doctorSpecialties: true,
                        }
                    }
                }
            }),
            prisma.medicalCondition.count({ where }),
        ]);

        const totalPages = Math.ceil(total / pageSize);

        return NextResponse.json({
            conditions,
            total,
            page,
            pageSize,
            totalPages,
        });
    } catch (error) {
        console.error('Conditions search failed:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
