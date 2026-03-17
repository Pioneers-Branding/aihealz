import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Admin Authentication Middleware
 *
 * Secure implementation with:
 * 1. HMAC-signed session tokens (prevents forgery)
 * 2. API key authentication with timing-safe comparison
 * 3. No development bypasses
 */

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SESSION_SALT;

// Validate required environment variables on startup
if (!SESSION_SECRET && process.env.NODE_ENV === 'production') {
    console.error('[Admin Auth] CRITICAL: SESSION_SECRET not set in production!');
}

interface AuthResult {
    authenticated: boolean;
    error?: string;
    adminId?: string;
}

interface SessionPayload {
    id: string;
    role: string;
    exp: number;
    iat: number;
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
    // Pad shorter string to prevent length-based timing attacks
    const maxLen = Math.max(a.length, b.length);
    const paddedA = a.padEnd(maxLen, '\0');
    const paddedB = b.padEnd(maxLen, '\0');
    return crypto.timingSafeEqual(Buffer.from(paddedA), Buffer.from(paddedB));
}

/**
 * Sign a session payload with HMAC-SHA256
 */
export function signSession(payload: SessionPayload): string {
    if (!SESSION_SECRET) {
        throw new Error('SESSION_SECRET not configured');
    }
    const data = JSON.stringify(payload);
    const signature = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(data)
        .digest('hex');
    return Buffer.from(`${data}.${signature}`).toString('base64');
}

/**
 * Verify and decode a signed session
 */
export function verifySession(token: string): SessionPayload | null {
    if (!SESSION_SECRET) {
        console.error('[Admin Auth] SESSION_SECRET not configured');
        return null;
    }

    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const lastDotIndex = decoded.lastIndexOf('.');

        if (lastDotIndex === -1) {
            return null;
        }

        const data = decoded.substring(0, lastDotIndex);
        const signature = decoded.substring(lastDotIndex + 1);

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', SESSION_SECRET)
            .update(data)
            .digest('hex');

        if (!timingSafeEqual(signature, expectedSignature)) {
            console.warn('[Admin Auth] Invalid session signature');
            return null;
        }

        const payload = JSON.parse(data) as SessionPayload;

        // Check expiration
        if (payload.exp <= Date.now()) {
            console.warn('[Admin Auth] Session expired');
            return null;
        }

        return payload;
    } catch (error) {
        console.error('[Admin Auth] Session verification failed:', error);
        return null;
    }
}

/**
 * Create a new admin session token
 */
export function createAdminSession(adminId: string, expiresInMs: number = 8 * 60 * 60 * 1000): string {
    const payload: SessionPayload = {
        id: adminId,
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + expiresInMs,
    };
    return signSession(payload);
}

export function checkAdminAuth(req: NextRequest): AuthResult {
    // Check Authorization header for API key
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
        const [type, token] = authHeader.split(' ');

        if (type === 'Bearer' && token && ADMIN_API_KEY) {
            // Use timing-safe comparison to prevent timing attacks
            if (timingSafeEqual(token, ADMIN_API_KEY)) {
                return { authenticated: true, adminId: 'api-key' };
            }
        }
    }

    // Check for signed admin session cookie
    const adminSession = req.cookies.get('admin_session')?.value;
    if (adminSession) {
        const payload = verifySession(adminSession);
        if (payload && payload.role === 'admin') {
            return { authenticated: true, adminId: payload.id };
        }
    }

    // Check for X-Admin-Key header (alternative auth method)
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey && ADMIN_API_KEY) {
        if (timingSafeEqual(adminKey, ADMIN_API_KEY)) {
            return { authenticated: true, adminId: 'header-key' };
        }
    }

    // NO DEVELOPMENT BYPASS - Removed for security
    // All environments require proper authentication

    return {
        authenticated: false,
        error: 'Unauthorized: Valid admin credentials required'
    };
}

export function withAdminAuth<T>(
    handler: (req: NextRequest, context: T) => Promise<NextResponse>
) {
    return async (req: NextRequest, context: T): Promise<NextResponse> => {
        const auth = checkAdminAuth(req);

        if (!auth.authenticated) {
            return NextResponse.json(
                { error: auth.error || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Add admin ID to request headers for downstream use
        req.headers.set('x-admin-id', auth.adminId || 'unknown');

        return handler(req, context);
    };
}

export function unauthorizedResponse(message?: string): NextResponse {
    return NextResponse.json(
        { error: message || 'Unauthorized: Admin access required' },
        { status: 401 }
    );
}

/**
 * Verify admin authentication (alias for checkAdminAuth for API routes)
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
    return checkAdminAuth(request);
}
