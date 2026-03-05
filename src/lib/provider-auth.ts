import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';

/**
 * Provider Authentication Utilities
 *
 * Verifies provider session tokens for API route protection.
 */

interface ProviderAuthResult {
    authenticated: boolean;
    doctorId: number | null;
    error?: string;
}

/**
 * Verify provider authentication from request headers
 *
 * Expects: Authorization: Bearer <token>
 * Or: X-Provider-Token: <token>
 */
export async function verifyProviderAuth(request: NextRequest): Promise<ProviderAuthResult> {
    try {
        // Get token from headers
        const authHeader = request.headers.get('authorization');
        const tokenHeader = request.headers.get('x-provider-token');

        let token = tokenHeader;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        if (!token) {
            return { authenticated: false, doctorId: null, error: 'No authentication token provided' };
        }

        // Hash the token for comparison (tokens are stored as SHA-256 hashes)
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Look up session in database
        const session = await prisma.$queryRaw<{ doctor_id: number; expires_at: Date }[]>`
            SELECT doctor_id, expires_at
            FROM provider_sessions
            WHERE token_hash = ${tokenHash}
            LIMIT 1
        `.catch(() => null);

        if (!session || session.length === 0) {
            return { authenticated: false, doctorId: null, error: 'Invalid session token' };
        }

        // Check expiration
        if (new Date(session[0].expires_at) < new Date()) {
            return { authenticated: false, doctorId: null, error: 'Session expired' };
        }

        return {
            authenticated: true,
            doctorId: session[0].doctor_id,
        };
    } catch (error) {
        console.error('Provider auth verification error:', error);
        return { authenticated: false, doctorId: null, error: 'Authentication verification failed' };
    }
}

/**
 * Middleware wrapper for protected provider API routes
 *
 * Usage:
 * export async function GET(request: NextRequest) {
 *     return withProviderAuth(request, async (doctorId) => {
 *         // Your authenticated logic here
 *         return NextResponse.json({ data: ... });
 *     });
 * }
 */
export async function withProviderAuth(
    request: NextRequest,
    handler: (doctorId: number) => Promise<NextResponse>
): Promise<NextResponse> {
    const auth = await verifyProviderAuth(request);

    if (!auth.authenticated || auth.doctorId === null) {
        return NextResponse.json(
            { error: auth.error || 'Unauthorized', requiresAuth: true },
            { status: 401 }
        );
    }

    return handler(auth.doctorId);
}

/**
 * Verify that the requested doctorId matches the authenticated session
 *
 * For routes like /api/provider/profile?doctorId=123, verify the
 * doctorId in the request matches the authenticated session.
 */
export async function verifyProviderOwnership(
    request: NextRequest,
    requestedDoctorId: number
): Promise<{ authorized: boolean; error?: string }> {
    const auth = await verifyProviderAuth(request);

    if (!auth.authenticated) {
        return { authorized: false, error: auth.error };
    }

    if (auth.doctorId !== requestedDoctorId) {
        return { authorized: false, error: 'Not authorized to access this resource' };
    }

    return { authorized: true };
}
