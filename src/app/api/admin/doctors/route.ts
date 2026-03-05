import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SubscriptionTier } from '@prisma/client';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

// GET - List all doctors
export async function GET(req: NextRequest) {
    const auth = checkAdminAuth(req);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
        const doctors = await prisma.doctorProvider.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                geography: {
                    select: { id: true, name: true, slug: true }
                },
                _count: {
                    select: {
                        specialties: true,
                        leadLogs: true,
                    }
                }
            }
        });

        return NextResponse.json({ doctors });
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
        return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
    }
}

// POST - Create a new doctor
export async function POST(request: NextRequest) {
    const auth = checkAdminAuth(request);
    if (!auth.authenticated) return unauthorizedResponse();

    try {
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

        // Validate required fields
        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug' },
                { status: 400 }
            );
        }

        // Check for duplicate slug
        const existing = await prisma.doctorProvider.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A doctor with this slug already exists' },
                { status: 409 }
            );
        }

        // Create doctor with transaction to handle specialties
        const doctor = await prisma.$transaction(async (tx) => {
            const newDoctor = await tx.doctorProvider.create({
                data: {
                    name,
                    slug,
                    licenseNumber: licenseNumber || null,
                    licensingBody: licensingBody || null,
                    qualifications: qualifications || [],
                    bio: bio || null,
                    experienceYears: experienceYears || null,
                    consultationFee: consultationFee || null,
                    contactInfo: contactInfo || {},
                    profileImage: profileImage || null,
                    geographyId: geographyId || null,
                    isVerified: isVerified ?? false,
                    subscriptionTier: (subscriptionTier as SubscriptionTier) || 'free',
                    availableOnline: availableOnline ?? false,
                },
            });

            // Create specialty links if conditions provided
            if (conditionIds && conditionIds.length > 0) {
                await tx.doctorSpecialty.createMany({
                    data: conditionIds.map((conditionId: number) => ({
                        doctorId: newDoctor.id,
                        conditionId,
                    })),
                });
            }

            return newDoctor;
        });

        return NextResponse.json({ doctor }, { status: 201 });
    } catch (error) {
        console.error('Failed to create doctor:', error);
        return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
    }
}
