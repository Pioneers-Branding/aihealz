import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SubscriptionTier } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get a single doctor
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const doctorId = parseInt(id, 10);

        if (isNaN(doctorId)) {
            return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 });
        }

        const doctor = await prisma.doctorProvider.findUnique({
            where: { id: doctorId },
            include: {
                geography: true,
                specialties: {
                    include: {
                        condition: {
                            select: { id: true, commonName: true }
                        }
                    }
                },
                leadLogs: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!doctor) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
        }

        return NextResponse.json({ doctor });
    } catch (error) {
        console.error('Failed to fetch doctor:', error);
        return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: 500 });
    }
}

// PUT - Update a doctor
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const doctorId = parseInt(id, 10);

        if (isNaN(doctorId)) {
            return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 });
        }

        const body = await request.json();

        const {
            name,
            slug,
            licenseNumber,
            licensingBody,
            qualifications,
            bio,
            experienceYears,
            consultationFee,
            contactInfo,
            profileImage,
            geographyId,
            isVerified,
            subscriptionTier,
            availableOnline,
            conditionIds,
        } = body;

        // Check if doctor exists
        const existing = await prisma.doctorProvider.findUnique({
            where: { id: doctorId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
        }

        // Check for slug conflict with other doctors
        if (slug && slug !== existing.slug) {
            const slugConflict = await prisma.doctorProvider.findUnique({
                where: { slug },
            });
            if (slugConflict) {
                return NextResponse.json(
                    { error: 'A doctor with this slug already exists' },
                    { status: 409 }
                );
            }
        }

        // Update doctor with transaction to handle specialties
        const doctor = await prisma.$transaction(async (tx) => {
            const updatedDoctor = await tx.doctorProvider.update({
                where: { id: doctorId },
                data: {
                    ...(name && { name }),
                    ...(slug && { slug }),
                    ...(licenseNumber !== undefined && { licenseNumber }),
                    ...(licensingBody !== undefined && { licensingBody }),
                    ...(qualifications !== undefined && { qualifications }),
                    ...(bio !== undefined && { bio }),
                    ...(experienceYears !== undefined && { experienceYears }),
                    ...(consultationFee !== undefined && { consultationFee }),
                    ...(contactInfo !== undefined && { contactInfo }),
                    ...(profileImage !== undefined && { profileImage }),
                    ...(geographyId !== undefined && { geographyId }),
                    ...(isVerified !== undefined && { isVerified }),
                    ...(subscriptionTier && { subscriptionTier: subscriptionTier as SubscriptionTier }),
                    ...(availableOnline !== undefined && { availableOnline }),
                },
            });

            // Update specialty links if provided
            if (conditionIds !== undefined) {
                // Remove existing specialties
                await tx.doctorSpecialty.deleteMany({
                    where: { doctorId },
                });

                // Add new specialties
                if (conditionIds.length > 0) {
                    await tx.doctorSpecialty.createMany({
                        data: conditionIds.map((conditionId: number) => ({
                            doctorId,
                            conditionId,
                        })),
                    });
                }
            }

            return updatedDoctor;
        });

        return NextResponse.json({ doctor });
    } catch (error) {
        console.error('Failed to update doctor:', error);
        return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
    }
}

// PATCH - Partial update (for toggling status, verification, etc.)
// Only allows specific whitelisted fields for security
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const doctorId = parseInt(id, 10);

        if (isNaN(doctorId)) {
            return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 });
        }

        const body = await request.json();

        // Whitelist allowed fields for PATCH updates
        const allowedFields = ['isVerified', 'availableOnline', 'subscriptionTier'] as const;
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update. Allowed: ' + allowedFields.join(', ') },
                { status: 400 }
            );
        }

        const doctor = await prisma.doctorProvider.update({
            where: { id: doctorId },
            data: updateData,
        });

        return NextResponse.json({ doctor });
    } catch (error) {
        console.error('Failed to update doctor:', error);
        return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
    }
}

// DELETE - Delete a doctor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const doctorId = parseInt(id, 10);

        if (isNaN(doctorId)) {
            return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 });
        }

        // Check if doctor exists
        const existing = await prisma.doctorProvider.findUnique({
            where: { id: doctorId },
            include: {
                _count: {
                    select: {
                        leadLogs: true,
                    }
                }
            }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
        }

        // Delete related records first (cascade may handle this, but being explicit)
        await prisma.$transaction(async (tx) => {
            // Delete specialties
            await tx.doctorSpecialty.deleteMany({
                where: { doctorId },
            });

            // Delete the doctor
            await tx.doctorProvider.delete({
                where: { id: doctorId },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete doctor:', error);
        return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
    }
}
