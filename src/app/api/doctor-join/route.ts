import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Input validation schema - now includes password for direct signup
const doctorJoinSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
    email: z.string().email('Invalid email address').max(200).toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    phone: z.string().max(20).optional(),
    specialty: z.string().min(2, 'Specialty is required').max(100).trim(),
    city: z.string().min(2, 'City is required').max(100).trim(),
    experience: z.union([z.string(), z.number()]).optional().transform(val => {
        if (val === undefined || val === '') return null;
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        return isNaN(num) || num < 0 || num > 80 ? null : num;
    }),
    clinicName: z.string().max(200).optional(),
    // Premium fields (optional, unlocked with paid tier)
    websiteUrl: z.string().url().max(500).optional().or(z.literal('')),
    clinicAddress: z.string().max(500).optional(),
    bio: z.string().max(2000).optional(),
});

/**
 * Doctor Join API — Direct signup that creates profile immediately.
 *
 * - Creates verified DoctorProvider
 * - Creates provider_auth record with hashed password
 * - Creates free-tier subscription
 * - Returns session token for auto-login
 */
export async function POST(req: NextRequest) {
    // Apply rate limiting to prevent spam
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`doctorJoin:${clientId}`, RATE_LIMITS.form);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many submissions. Please wait before trying again.' },
            { status: 429, headers: rateLimitHeaders(rateLimit) }
        );
    }

    try {
        const body = await req.json();

        // Validate input
        const validation = doctorJoinSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, password, phone, specialty, city, experience, clinicName, websiteUrl, clinicAddress, bio } = validation.data;

        // Check if email already exists
        const existingAuth = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM provider_auth WHERE email = ${email} LIMIT 1
        `;
        if (existingAuth.length > 0) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please login instead.' },
                { status: 400 }
            );
        }

        // Check for existing doctor with same email in contactInfo
        const existingDoctor = await prisma.doctorProvider.findFirst({
            where: {
                OR: [
                    { contactInfo: { path: ['email'], equals: email } },
                ]
            }
        });
        if (existingDoctor) {
            return NextResponse.json(
                { error: 'An account with this email already exists.' },
                { status: 400 }
            );
        }

        // Generate unique slug
        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const randomStr = Math.random().toString(36).substring(2, 8);
        const slug = `${baseSlug}-${randomStr}`;

        // Try to find matching geography
        let geographyId: number | null = null;
        const geoMatch = await prisma.geography.findFirst({
            where: {
                name: { contains: city, mode: 'insensitive' },
                isActive: true,
            },
            orderBy: { level: 'desc' }, // Prefer more specific (city over state)
        });
        if (geoMatch) {
            geographyId = geoMatch.id;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create doctor profile (verified immediately)
        const doctor = await prisma.doctorProvider.create({
            data: {
                slug,
                name,
                isVerified: true, // Immediately verified for self-signup
                verificationDate: new Date(),
                subscriptionTier: 'free',
                experienceYears: experience,
                geographyId,
                bio: bio || null,
                contactInfo: {
                    email,
                    phone: phone || null,
                    city,
                    clinicName: clinicName || null,
                    clinicAddress: clinicAddress || null,
                    websiteUrl: websiteUrl || null, // Only shown for premium
                    specialty,
                    signupDate: new Date().toISOString(),
                },
                qualifications: [specialty],
            }
        });

        // Create provider_auth record
        await prisma.$executeRaw`
            INSERT INTO provider_auth (doctor_id, email, password_hash, created_at)
            VALUES (${doctor.id}, ${email}, ${passwordHash}, NOW())
            ON CONFLICT (email) DO NOTHING
        `;

        // Get the free plan ID from SubscriptionPlan table
        const freePlan = await prisma.subscriptionPlan.findFirst({
            where: { planSlug: 'free' },
            select: { id: true, maxLeadCredits: true },
        });

        // Create free subscription
        if (freePlan) {
            await prisma.providerSubscription.create({
                data: {
                    doctorId: doctor.id,
                    planId: freePlan.id,
                    status: 'active',
                    conditionsUsed: 0,
                    leadCreditsUsed: 0,
                    leadCreditsTotal: freePlan.maxLeadCredits || 5, // From plan or default 5
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                }
            });
        }

        // Create onboarding step tracker
        await prisma.onboardingStep.create({
            data: {
                doctorId: doctor.id,
                status: 'completed',
                currentStep: 5,
                stepProfile: true,
                stepLicense: false, // Can complete later
                stepBio: !!bio,
                stepConditions: false, // Can add later
                stepSubscription: true,
                completedAt: new Date(),
            }
        });

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store session (optional - for server-side validation)
        await prisma.$executeRaw`
            INSERT INTO provider_sessions (doctor_id, session_hash, expires_at, created_at)
            VALUES (${doctor.id}, ${sessionHash}, ${expiresAt}, NOW())
            ON CONFLICT DO NOTHING
        `;

        return NextResponse.json({
            success: true,
            message: 'Profile created successfully!',
            doctor: {
                id: doctor.id,
                name: doctor.name,
                slug: doctor.slug,
                email,
                subscriptionTier: 'free',
            },
            session: {
                token: sessionToken,
                expiresAt: expiresAt.toISOString(),
            },
            redirectTo: '/provider/dashboard',
        });

    } catch (error) {
        console.error('Doctor signup error:', error);
        return NextResponse.json(
            { error: 'Failed to create profile. Please try again later.' },
            { status: 500 }
        );
    }
}
