import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Lab type mapping from form values to DiagnosticProviderType enum
const LAB_TYPE_MAP: Record<string, 'lab' | 'imaging_center' | 'hospital' | 'clinic' | 'home_collection' | 'full_service'> = {
    pathology: 'lab',
    imaging: 'imaging_center',
    full_service: 'full_service',
    collection_center: 'home_collection',
    hospital_lab: 'hospital',
    research: 'lab',
};

// Input validation schema
const labRegisterSchema = z.object({
    // Lab Details
    labName: z.string().min(2, 'Lab name must be at least 2 characters').max(300).trim(),
    legalName: z.string().max(300).optional(),
    labType: z.string().min(1, 'Lab type is required'),
    registrationNumber: z.string().max(100).optional(),
    establishedYear: z.string().max(4).optional(),

    // Location
    address: z.string().min(5, 'Address is required').max(500).trim(),
    city: z.string().min(2, 'City is required').max(100).trim(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).default('India'),
    pincode: z.string().max(10).optional(),

    // Contact
    phone: z.string().min(10, 'Phone number is required').max(20).trim(),
    email: z.string().email('Invalid email address').max(200).toLowerCase().trim(),
    website: z.string().url().max(500).optional().or(z.literal('')),

    // Admin Account
    adminName: z.string().min(2, 'Admin name is required').max(100).trim(),
    adminPhone: z.string().max(20).optional(),
    adminEmail: z.string().email('Invalid admin email').max(200).toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
    confirmPassword: z.string(),

    // Services
    accreditations: z.array(z.string()).default([]),
    homeCollection: z.boolean().default(false),
    operatingHours: z.string().max(200).optional(),

    // Terms
    agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),

    // Plan
    plan: z.enum(['starter', 'growth', 'chain']).default('starter'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

/**
 * Lab Provider Registration API
 *
 * - Creates verified DiagnosticProvider
 * - Creates provider_auth record with hashed password
 * - Creates free-tier subscription
 * - Returns session token for auto-login
 */
export async function POST(req: NextRequest) {
    // Apply rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`labRegister:${clientId}`, RATE_LIMITS.form);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many submissions. Please wait before trying again.' },
            { status: 429, headers: rateLimitHeaders(rateLimit) }
        );
    }

    try {
        const body = await req.json();

        // Validate input
        const validation = labRegisterSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Check if admin email already exists in provider_auth
        const existingAuth = await prisma.$queryRaw<{ id: number }[]>`
            SELECT id FROM provider_auth WHERE email = ${data.adminEmail} LIMIT 1
        `;
        if (existingAuth.length > 0) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please login instead.' },
                { status: 400 }
            );
        }

        // Check if lab email already exists
        const existingLab = await prisma.diagnosticProvider.findFirst({
            where: { email: data.email }
        });
        if (existingLab) {
            return NextResponse.json(
                { error: 'A lab with this email is already registered.' },
                { status: 400 }
            );
        }

        // Generate unique slug
        const baseSlug = data.labName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const randomStr = Math.random().toString(36).substring(2, 8);
        const slug = `${baseSlug}-${randomStr}`;

        // Try to find matching geography
        let geographyId: number | null = null;
        const geoMatch = await prisma.geography.findFirst({
            where: {
                name: { contains: data.city, mode: 'insensitive' },
                isActive: true,
            },
            orderBy: { level: 'desc' },
        });
        if (geoMatch) {
            geographyId = geoMatch.id;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Map lab type to enum
        const providerType = LAB_TYPE_MAP[data.labType] || 'lab';

        // Map plan to subscription tier (free, premium, enterprise)
        const subscriptionTier = data.plan === 'chain' ? 'enterprise' : data.plan === 'growth' ? 'premium' : 'free';

        // Create diagnostic provider
        const lab = await prisma.diagnosticProvider.create({
            data: {
                slug,
                name: data.labName,
                providerType,
                description: data.legalName ? `Legal Name: ${data.legalName}` : null,
                geographyId,
                address: `${data.address}${data.pincode ? `, ${data.pincode}` : ''}`,
                phone: data.phone,
                email: data.email,
                website: data.website || null,
                operatingHours: {
                    displayText: data.operatingHours || '',
                    adminName: data.adminName,
                    adminPhone: data.adminPhone || null,
                    adminEmail: data.adminEmail,
                    registrationNumber: data.registrationNumber || null,
                    establishedYear: data.establishedYear || null,
                    state: data.state || null,
                    country: data.country,
                    signupDate: new Date().toISOString(),
                },
                accreditations: data.accreditations,
                homeCollectionAvailable: data.homeCollection,
                isVerified: true, // Verified immediately for self-signup
                subscriptionTier: subscriptionTier as 'free' | 'premium' | 'enterprise',
                isActive: true,
                isPartner: true, // Registered labs are partners
            }
        });

        // Create provider_auth record for lab
        await prisma.$executeRaw`
            INSERT INTO provider_auth (lab_id, email, password_hash, provider_type, created_at)
            VALUES (${lab.id}, ${data.adminEmail}, ${passwordHash}, 'lab', NOW())
            ON CONFLICT (email) DO NOTHING
        `;

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store session
        await prisma.$executeRaw`
            INSERT INTO provider_sessions (lab_id, session_hash, expires_at, created_at)
            VALUES (${lab.id}, ${sessionHash}, ${expiresAt}, NOW())
            ON CONFLICT DO NOTHING
        `;

        return NextResponse.json({
            success: true,
            message: 'Lab registered successfully!',
            lab: {
                id: lab.id,
                name: lab.name,
                slug: lab.slug,
                email: data.adminEmail,
                subscriptionTier: lab.subscriptionTier,
            },
            session: {
                token: sessionToken,
                expiresAt: expiresAt.toISOString(),
            },
            redirectTo: '/provider/lab/dashboard?welcome=true',
        });

    } catch (error) {
        console.error('Lab registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register lab. Please try again later.' },
            { status: 500 }
        );
    }
}
