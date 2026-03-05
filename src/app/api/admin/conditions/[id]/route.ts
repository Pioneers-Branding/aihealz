import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get a single condition (requires admin auth)
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const conditionId = parseInt(id, 10);

        if (isNaN(conditionId)) {
            return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 });
        }

        const condition = await prisma.medicalCondition.findUnique({
            where: { id: conditionId },
            include: {
                localizedContent: true,
                doctorSpecialties: {
                    include: {
                        doctor: {
                            select: { id: true, name: true, slug: true }
                        }
                    }
                },
            }
        });

        if (!condition) {
            return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
        }

        return NextResponse.json({ condition });
    } catch (error) {
        console.error('Failed to fetch condition:', error);
        return NextResponse.json({ error: 'Failed to fetch condition' }, { status: 500 });
    }
}

// PUT - Update a condition (requires admin auth)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const conditionId = parseInt(id, 10);

        if (isNaN(conditionId)) {
            return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 });
        }

        const body = await request.json();

        const {
            commonName,
            scientificName,
            slug,
            description,
            specialistType,
            bodySystem,
            severityLevel,
            icdCode,
            symptoms,
            treatments,
            faqs,
            isActive,
        } = body;

        // Check if condition exists
        const existing = await prisma.medicalCondition.findUnique({
            where: { id: conditionId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
        }

        // Check for slug conflict with other conditions
        if (slug && slug !== existing.slug) {
            const slugConflict = await prisma.medicalCondition.findUnique({
                where: { slug },
            });
            if (slugConflict) {
                return NextResponse.json(
                    { error: 'A condition with this slug already exists' },
                    { status: 409 }
                );
            }
        }

        const condition = await prisma.medicalCondition.update({
            where: { id: conditionId },
            data: {
                ...(commonName && { commonName }),
                ...(scientificName && { scientificName }),
                ...(slug && { slug }),
                description: description ?? existing.description,
                ...(specialistType && { specialistType }),
                bodySystem: bodySystem ?? existing.bodySystem,
                severityLevel: severityLevel ?? existing.severityLevel,
                icdCode: icdCode ?? existing.icdCode,
                ...(symptoms !== undefined && { symptoms }),
                ...(treatments !== undefined && { treatments }),
                ...(faqs !== undefined && { faqs }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ condition });
    } catch (error) {
        console.error('Failed to update condition:', error);
        return NextResponse.json({ error: 'Failed to update condition' }, { status: 500 });
    }
}

// PATCH - Partial update (whitelisted fields only for quick toggles, requires admin auth)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const conditionId = parseInt(id, 10);

        if (isNaN(conditionId)) {
            return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 });
        }

        const body = await request.json();

        // Whitelist allowed fields for PATCH updates (quick toggles)
        const allowedFields = ['isActive', 'severityLevel'] as const;
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                if (field === 'severityLevel') {
                    // Validate severity level
                    const validSeverities = ['mild', 'moderate', 'severe', 'critical', 'varies'];
                    if (body.severityLevel !== null && !validSeverities.includes(body.severityLevel)) {
                        return NextResponse.json({ error: 'Invalid severity level' }, { status: 400 });
                    }
                }
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update. Allowed: ' + allowedFields.join(', ') },
                { status: 400 }
            );
        }

        const condition = await prisma.medicalCondition.update({
            where: { id: conditionId },
            data: updateData,
        });

        return NextResponse.json({ condition });
    } catch (error) {
        console.error('Failed to update condition:', error);
        return NextResponse.json({ error: 'Failed to update condition' }, { status: 500 });
    }
}

// DELETE - Delete a condition (requires admin auth)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) {
        return unauthorizedResponse(auth.error);
    }

    try {
        const { id } = await params;
        const conditionId = parseInt(id, 10);

        if (isNaN(conditionId)) {
            return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 });
        }

        // Check if condition exists
        const existing = await prisma.medicalCondition.findUnique({
            where: { id: conditionId },
            include: {
                _count: {
                    select: {
                        localizedContent: true,
                        doctorSpecialties: true,
                    }
                }
            }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
        }

        // Warn if there are related records
        if (existing._count.localizedContent > 0 || existing._count.doctorSpecialties > 0) {
            // Could return warning or just cascade delete based on schema
        }

        await prisma.medicalCondition.delete({
            where: { id: conditionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete condition:', error);
        return NextResponse.json({ error: 'Failed to delete condition' }, { status: 500 });
    }
}
