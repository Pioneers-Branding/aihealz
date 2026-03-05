import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { verifyProviderOwnership } from '@/lib/provider-auth';

/**
 * Provider Profile API
 *
 * GET /api/provider/profile?doctorId=123 - Fetch profile
 * PUT /api/provider/profile - Update profile (tier-gated fields)
 *
 * Requires authentication - token must match the requested doctorId
 */

const profileUpdateSchema = z.object({
    doctorId: z.number(),
    // Basic fields (all tiers)
    name: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
    city: z.string().max(100).optional(),
    specialty: z.string().max(100).optional(),
    clinicName: z.string().max(200).optional(),
    experienceYears: z.number().min(0).max(80).optional(),
    // Premium fields (requires premium/enterprise tier)
    bio: z.string().max(2000).optional(),
    websiteUrl: z.string().url().max(500).optional().or(z.literal('')),
    clinicAddress: z.string().max(500).optional(),
    consultationFee: z.number().min(0).optional(),
    teleconsultFee: z.number().min(0).optional(),
    availableHours: z.string().max(500).optional(),
    languages: z.array(z.string()).optional(),
    education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.number().optional(),
    })).optional(),
    certifications: z.array(z.string()).optional(),
});

// Fields that require premium tier
const PREMIUM_FIELDS = [
    'bio', 'websiteUrl', 'clinicAddress', 'consultationFee',
    'teleconsultFee', 'availableHours', 'languages', 'education', 'certifications'
];

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
        return NextResponse.json({ error: 'doctorId required' }, { status: 400 });
    }

    const id = parseInt(doctorId, 10);

    // Verify authentication and ownership
    const auth = await verifyProviderOwnership(request, id);
    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized', requiresAuth: true },
            { status: 401 }
        );
    }

    const doctor = await prisma.doctorProvider.findUnique({
        where: { id },
        select: {
            id: true,
            slug: true,
            name: true,
            bio: true,
            experienceYears: true,
            qualifications: true,
            contactInfo: true,
            subscriptionTier: true,
            isVerified: true,
            badgeScore: true,
            badgeLabel: true,
            createdAt: true,
            geography: {
                select: { name: true, parentId: true }
            },
            providerSubscription: {
                select: {
                    planId: true,
                    status: true,
                    conditionsUsed: true,
                    leadCreditsUsed: true,
                    leadCreditsTotal: true,
                    currentPeriodEnd: true,
                }
            },
            onboardingSteps: {
                select: {
                    currentStep: true,
                    stepProfile: true,
                    stepLicense: true,
                    stepBio: true,
                    stepConditions: true,
                    stepSubscription: true,
                    completedAt: true,
                }
            }
        },
    });

    if (!doctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const contactInfo = doctor.contactInfo as Record<string, unknown> || {};
    const isPremium = doctor.subscriptionTier === 'premium' || doctor.subscriptionTier === 'enterprise';

    // Calculate profile completion percentage
    const completionChecks = [
        !!doctor.name,
        !!contactInfo.email,
        !!contactInfo.phone,
        !!contactInfo.city,
        !!contactInfo.specialty,
        !!doctor.bio,
        !!contactInfo.clinicName,
        !!doctor.experienceYears,
    ];
    const profileCompletion = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

    return NextResponse.json({
        profile: {
            id: doctor.id,
            slug: doctor.slug,
            name: doctor.name,
            bio: doctor.bio,
            experienceYears: doctor.experienceYears,
            qualifications: doctor.qualifications,
            email: contactInfo.email || '',
            phone: contactInfo.phone || '',
            city: contactInfo.city || '',
            specialty: contactInfo.specialty || '',
            clinicName: contactInfo.clinicName || '',
            clinicAddress: isPremium ? (contactInfo.clinicAddress || '') : null,
            websiteUrl: isPremium ? (contactInfo.websiteUrl || '') : null,
            consultationFee: contactInfo.consultationFee || null,
            teleconsultFee: contactInfo.teleconsultFee || null,
            availableHours: contactInfo.availableHours || '',
            languages: contactInfo.languages || [],
            education: contactInfo.education || [],
            certifications: contactInfo.certifications || [],
        },
        subscription: {
            tier: doctor.subscriptionTier,
            isPremium,
            plan: doctor.providerSubscription?.planId || 0,
            status: doctor.providerSubscription?.status || 'active',
            conditionsUsed: doctor.providerSubscription?.conditionsUsed || 0,
            leadCreditsUsed: doctor.providerSubscription?.leadCreditsUsed || 0,
            leadCreditsTotal: doctor.providerSubscription?.leadCreditsTotal || 5,
            periodEnd: doctor.providerSubscription?.currentPeriodEnd,
        },
        onboarding: doctor.onboardingSteps?.[0] || null,
        meta: {
            isVerified: doctor.isVerified,
            badgeScore: doctor.badgeScore ? Number(doctor.badgeScore) : 0,
            badgeLabel: doctor.badgeLabel,
            profileCompletion,
            createdAt: doctor.createdAt,
        },
        // Feature availability based on tier
        features: {
            maxConditions: isPremium ? (doctor.subscriptionTier === 'enterprise' ? 1000 : 15) : 2,
            leadCreditsPerMonth: isPremium ? (doctor.subscriptionTier === 'enterprise' ? 500 : 50) : 5,
            canShowWebsite: isPremium,
            canShowClinicAddress: isPremium,
            canShowPhone: isPremium,
            canEditBio: isPremium,
            hasAnalytics: isPremium,
            hasTelelink: isPremium,
            priorityListing: isPremium,
            aiPoweredBio: isPremium,
            leadScoring: isPremium,
        },
    });
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = profileUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { doctorId, ...updates } = validation.data;

        // Verify authentication and ownership
        const auth = await verifyProviderOwnership(request, doctorId);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.error || 'Unauthorized', requiresAuth: true },
                { status: 401 }
            );
        }

        // Get current doctor to check tier
        const doctor = await prisma.doctorProvider.findUnique({
            where: { id: doctorId },
            select: { subscriptionTier: true, contactInfo: true },
        });

        if (!doctor) {
            return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
        }

        const isPremium = doctor.subscriptionTier === 'premium' || doctor.subscriptionTier === 'enterprise';
        const currentContactInfo = (doctor.contactInfo as Record<string, unknown>) || {};

        // Check if trying to update premium-only fields without premium tier
        const attemptedPremiumFields = Object.keys(updates).filter(key => PREMIUM_FIELDS.includes(key));
        if (attemptedPremiumFields.length > 0 && !isPremium) {
            return NextResponse.json({
                error: `Upgrade to Premium to update: ${attemptedPremiumFields.join(', ')}`,
                requiresUpgrade: true,
                lockedFields: attemptedPremiumFields,
            }, { status: 403 });
        }

        // Separate profile fields from contactInfo fields
        const profileFields: Record<string, unknown> = {};
        const contactInfoUpdates: Record<string, unknown> = { ...currentContactInfo };

        // Map updates to correct location
        if (updates.name) profileFields.name = updates.name;
        if (updates.bio !== undefined) profileFields.bio = updates.bio;
        if (updates.experienceYears !== undefined) profileFields.experienceYears = updates.experienceYears;

        // ContactInfo fields
        if (updates.phone !== undefined) contactInfoUpdates.phone = updates.phone;
        if (updates.city !== undefined) contactInfoUpdates.city = updates.city;
        if (updates.specialty !== undefined) contactInfoUpdates.specialty = updates.specialty;
        if (updates.clinicName !== undefined) contactInfoUpdates.clinicName = updates.clinicName;
        if (updates.websiteUrl !== undefined) contactInfoUpdates.websiteUrl = updates.websiteUrl;
        if (updates.clinicAddress !== undefined) contactInfoUpdates.clinicAddress = updates.clinicAddress;
        if (updates.consultationFee !== undefined) contactInfoUpdates.consultationFee = updates.consultationFee;
        if (updates.teleconsultFee !== undefined) contactInfoUpdates.teleconsultFee = updates.teleconsultFee;
        if (updates.availableHours !== undefined) contactInfoUpdates.availableHours = updates.availableHours;
        if (updates.languages !== undefined) contactInfoUpdates.languages = updates.languages;
        if (updates.education !== undefined) contactInfoUpdates.education = updates.education;
        if (updates.certifications !== undefined) contactInfoUpdates.certifications = updates.certifications;

        // Update doctor
        const updatedDoctor = await prisma.doctorProvider.update({
            where: { id: doctorId },
            data: {
                ...profileFields,
                contactInfo: contactInfoUpdates as object,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                slug: true,
                bio: true,
                experienceYears: true,
                contactInfo: true,
                subscriptionTier: true,
            },
        });

        // Update onboarding if bio was added
        if (updates.bio) {
            await prisma.onboardingStep.updateMany({
                where: { doctorId },
                data: { stepBio: true },
            });
        }

        return NextResponse.json({
            success: true,
            profile: updatedDoctor,
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
