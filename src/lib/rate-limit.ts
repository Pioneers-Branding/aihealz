/**
 * Simple in-memory rate limiter for API routes
 * In production, use Redis or a similar distributed cache
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) {
            store.delete(key);
        }
    }
}, 60000); // Every minute

export interface RateLimitConfig {
    maxRequests: number;  // Max requests allowed
    windowMs: number;     // Time window in milliseconds
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP or user ID)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): RateLimitResult {
    const now = Date.now();
    const key = identifier;

    let entry = store.get(key);

    // If no entry or expired, create new one
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 1,
            resetAt: now + config.windowMs,
        };
        store.set(key, entry);
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetAt: entry.resetAt,
        };
    }

    // Increment count
    entry.count++;

    // Check if over limit
    if (entry.count > config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        };
    }

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    // Public API endpoints
    public: { maxRequests: 100, windowMs: 60000 },      // 100 req/min

    // Search endpoints (more restrictive)
    search: { maxRequests: 30, windowMs: 60000 },       // 30 req/min

    // AI/Bot endpoints (most restrictive)
    ai: { maxRequests: 10, windowMs: 60000 },           // 10 req/min
    analyze: { maxRequests: 5, windowMs: 60000 },       // 5 req/min for medical analysis

    // Contact/Form submissions
    form: { maxRequests: 5, windowMs: 60000 },          // 5 req/min
    contact: { maxRequests: 3, windowMs: 300000 },      // 3 req/5min for contact form

    // Authentication endpoints (strict to prevent brute force)
    auth: { maxRequests: 5, windowMs: 900000 },         // 5 req/15min

    // Ad tracking (prevent click fraud)
    adClick: { maxRequests: 30, windowMs: 60000 },      // 30 clicks/min per session
    adImpression: { maxRequests: 100, windowMs: 60000 },// 100 impressions/min

    // Checkout/Payment
    checkout: { maxRequests: 10, windowMs: 60000 },     // 10 req/min

    // Admin endpoints
    admin: { maxRequests: 200, windowMs: 60000 },       // 200 req/min
};

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
    // Try to get real IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback to a hash of user agent + accept headers
    const ua = request.headers.get('user-agent') || 'unknown';
    const accept = request.headers.get('accept') || '';
    return `anon-${hashCode(ua + accept)}`;
}

function hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    };

    if (result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
    }

    return headers;
}
