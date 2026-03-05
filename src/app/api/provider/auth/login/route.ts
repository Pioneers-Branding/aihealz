import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';

/**
 * Provider Login API
 *
 * Secure implementation with:
 * 1. bcrypt password hashing (secure against rainbow tables)
 * 2. Account lockout after failed attempts
 * 3. No hardcoded passwords or development bypasses
 *
 * POST /api/provider/auth/login
 */

// Input validation schema
const loginSchema = z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

// Rate limiting config (in-memory for now, should use Redis in production)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    const record = loginAttempts.get(normalizedEmail);

    if (!record) {
        return { allowed: true };
    }

    // Check if locked out
    if (record.lockedUntil && record.lockedUntil > now) {
        return {
            allowed: false,
            retryAfter: Math.ceil((record.lockedUntil - now) / 1000)
        };
    }

    // Reset if window expired
    if (now - record.lastAttempt > ATTEMPT_WINDOW) {
        loginAttempts.delete(normalizedEmail);
        return { allowed: true };
    }

    return { allowed: record.count < MAX_ATTEMPTS };
}

function recordFailedAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    const record = loginAttempts.get(normalizedEmail) || { count: 0, lastAttempt: now };

    record.count += 1;
    record.lastAttempt = now;

    if (record.count >= MAX_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_DURATION;
    }

    loginAttempts.set(normalizedEmail, record);
}

function clearFailedAttempts(email: string): void {
    loginAttempts.delete(email.toLowerCase());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Check rate limiting
        const rateLimit = checkRateLimit(normalizedEmail);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many login attempts. Please try again later.',
                    retryAfter: rateLimit.retryAfter
                },
                {
                    status: 429,
                    headers: rateLimit.retryAfter
                        ? { 'Retry-After': String(rateLimit.retryAfter) }
                        : undefined
                }
            );
        }

        // Find doctor by email (stored in contactInfo JSON field)
        const doctor = await prisma.doctorProvider.findFirst({
            where: {
                isVerified: true,
                contactInfo: {
                    path: ['email'],
                    equals: normalizedEmail,
                },
            },
            select: {
                id: true,
                name: true,
                contactInfo: true,
            },
        });

        // Use constant-time comparison logic to prevent timing attacks
        // All auth failure paths should take roughly the same time and return same error
        const GENERIC_AUTH_ERROR = 'Invalid email or password';

        if (!doctor) {
            // Record failed attempt - use generic error to prevent email enumeration
            recordFailedAttempt(normalizedEmail);
            // Perform a dummy bcrypt compare to make timing consistent
            await bcrypt.compare(password, '$2a$12$dummy.hash.for.timing.attack.prevention');
            return NextResponse.json(
                { error: GENERIC_AUTH_ERROR },
                { status: 401 }
            );
        }

        // Get password hash from provider_auth table
        const authRecord = await prisma.$queryRaw<{ password_hash: string }[]>`
            SELECT password_hash FROM provider_auth WHERE doctor_id = ${doctor.id} LIMIT 1
        `.catch(() => null);

        if (!authRecord || authRecord.length === 0) {
            // No auth record - use same generic error to prevent enumeration
            recordFailedAttempt(normalizedEmail);
            // Perform a dummy bcrypt compare to make timing consistent
            await bcrypt.compare(password, '$2a$12$dummy.hash.for.timing.attack.prevention');
            return NextResponse.json(
                { error: GENERIC_AUTH_ERROR },
                { status: 401 }
            );
        }

        // Verify password using bcrypt
        const isValidPassword = await bcrypt.compare(password, authRecord[0].password_hash);

        if (!isValidPassword) {
            recordFailedAttempt(normalizedEmail);
            return NextResponse.json(
                { error: GENERIC_AUTH_ERROR },
                { status: 401 }
            );
        }

        // Clear failed attempts on successful login
        clearFailedAttempts(normalizedEmail);

        // Generate secure session token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store session in database (optional but recommended)
        await prisma.$executeRaw`
            INSERT INTO provider_sessions (doctor_id, token_hash, expires_at, created_at)
            VALUES (${doctor.id}, ${tokenHash}, ${expiresAt}, NOW())
            ON CONFLICT (doctor_id) DO UPDATE SET token_hash = ${tokenHash}, expires_at = ${expiresAt}
        `.catch(() => {
            // Session storage is optional, continue even if it fails
        });

        // Extract email from contactInfo
        const doctorEmail = (doctor.contactInfo as { email?: string })?.email || normalizedEmail;

        return NextResponse.json({
            success: true,
            doctorId: String(doctor.id),
            doctorName: doctor.name,
            email: doctorEmail,
            token,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Provider login error:', error);
        return NextResponse.json(
            { error: 'Authentication service unavailable' },
            { status: 500 }
        );
    }
}

/**
 * Utility function to hash passwords (for registration/password reset)
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}
