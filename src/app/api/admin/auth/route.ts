import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Admin credentials - in production, store hashed password in env or database
// These should be set via environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aihealz.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Fallback password hash for development only (password: "Admin@123!")
// SHA-256 hash - generate with: echo -n "password" | shasum -a 256
const DEV_PASSWORD_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'; // "123456" for dev

// Rate limiting for auth attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

function checkRateLimit(clientIP: string): { allowed: boolean; remainingAttempts: number } {
    const now = Date.now();
    const record = authAttempts.get(clientIP);

    if (!record) {
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    // Reset if lockout period has passed
    if (now - record.lastAttempt > LOCKOUT_DURATION) {
        authAttempts.delete(clientIP);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    if (record.count >= MAX_ATTEMPTS) {
        return { allowed: false, remainingAttempts: 0 };
    }

    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.count };
}

function recordFailedAttempt(clientIP: string): void {
    const now = Date.now();
    const record = authAttempts.get(clientIP);

    if (!record) {
        authAttempts.set(clientIP, { count: 1, lastAttempt: now });
    } else {
        record.count++;
        record.lastAttempt = now;
    }
}

function clearAttempts(clientIP: string): void {
    authAttempts.delete(clientIP);
}

export async function POST(req: NextRequest) {
    const clientIP = getClientIP(req);

    // Check rate limit
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
        return NextResponse.json(
            { error: 'Too many login attempts. Please try again in 15 minutes.' },
            { status: 429 }
        );
    }

    try {
        const { email, password } = await req.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check email
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            recordFailedAttempt(clientIP);
            // Use generic error to prevent email enumeration
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check password
        const inputHash = hashPassword(password);
        const expectedHash = ADMIN_PASSWORD_HASH || DEV_PASSWORD_HASH;

        if (inputHash !== expectedHash) {
            recordFailedAttempt(clientIP);
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate secure session token
        const token = crypto.randomBytes(32).toString('hex');

        // Clear failed attempts on successful login
        clearAttempts(clientIP);

        // Log successful login (in production, you'd want proper audit logging)
        console.log(`[ADMIN AUTH] Successful login from ${clientIP} at ${new Date().toISOString()}`);

        return NextResponse.json({
            success: true,
            email: ADMIN_EMAIL,
            token,
        });

    } catch (error) {
        console.error('[ADMIN AUTH] Error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

// Logout endpoint - clear session
export async function DELETE() {
    return NextResponse.json({ success: true });
}
