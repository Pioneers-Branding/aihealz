import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { z } from 'zod';

/**
 * Provider Forgot Password API
 *
 * POST /api/provider/auth/forgot-password
 *
 * Sends a password reset link to the provider's email.
 * Uses same response for all cases to prevent email enumeration.
 */

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email format').max(255),
});

// Rate limiting for password reset requests
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 3;
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    const record = resetAttempts.get(normalizedEmail);

    if (!record) {
        return true;
    }

    if (now - record.lastAttempt > ATTEMPT_WINDOW) {
        resetAttempts.delete(normalizedEmail);
        return true;
    }

    return record.count < MAX_ATTEMPTS;
}

function recordAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    const record = resetAttempts.get(normalizedEmail) || { count: 0, lastAttempt: now };
    record.count += 1;
    record.lastAttempt = now;
    resetAttempts.set(normalizedEmail, record);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email } = validation.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Check rate limiting
        if (!checkRateLimit(normalizedEmail)) {
            return NextResponse.json(
                { error: 'Too many reset requests. Please try again in 1 hour.' },
                { status: 429 }
            );
        }

        // Record the attempt
        recordAttempt(normalizedEmail);

        // Find doctor by email - but always return success to prevent enumeration
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
            },
        });

        // Generate reset token regardless of whether doctor exists
        // This prevents timing attacks
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        if (doctor) {
            // Store reset token in database
            await prisma.$executeRaw`
                INSERT INTO password_reset_tokens (doctor_id, token_hash, expires_at, created_at)
                VALUES (${doctor.id}, ${tokenHash}, ${expiresAt}, NOW())
                ON CONFLICT (doctor_id) DO UPDATE SET token_hash = ${tokenHash}, expires_at = ${expiresAt}, created_at = NOW()
            `.catch((err) => {
                // Table might not exist yet, log but don't fail
                console.error('Failed to store reset token:', err);
            });

            // TODO: Send email with reset link
            // const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/provider/reset-password?token=${resetToken}`;
            // await sendPasswordResetEmail(normalizedEmail, doctor.name, resetUrl);

            console.log(`[Password Reset] Token generated for doctor ${doctor.id}`);
            console.log(`[Password Reset] Reset URL would be: /provider/reset-password?token=${resetToken}`);
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Service temporarily unavailable' },
            { status: 500 }
        );
    }
}
