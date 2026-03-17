import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEFAULT_TTL = parseInt(process.env.REDIS_CACHE_TTL || '3600', 10);

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

export const redis =
    globalForRedis.redis ??
    new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        lazyConnect: true,
    });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// ─── Cache Helpers ──────────────────────────────────────────

/**
 * Build a cache key from URL segments.
 * e.g. buildCacheKey('hi', 'back-pain', ['india', 'delhi', 'saket'])
 * → 'page:hi:back-pain:india:delhi:saket'
 */
export function buildCacheKey(
    lang: string,
    conditionSlug: string,
    geoSlugs: string[]
): string {
    return `page:${lang}:${conditionSlug}:${geoSlugs.join(':')}`;
}

/**
 * Get a cached page fragment. Returns null on miss.
 */
export async function getCachedPage(key: string): Promise<string | null> {
    try {
        return await redis.get(key);
    } catch {
        console.warn('[Redis] Cache read failed for key:', key);
        return null;
    }
}

/**
 * Cache a rendered page fragment with TTL.
 */
export async function setCachedPage(
    key: string,
    html: string,
    ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
    try {
        await redis.setex(key, ttlSeconds, html);
    } catch {
        console.warn('[Redis] Cache write failed for key:', key);
    }
}

/**
 * Invalidate a specific cache key or pattern.
 */
export async function invalidateCache(pattern: string): Promise<number> {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            return await redis.del(...keys);
        }
        return 0;
    } catch {
        console.warn('[Redis] Cache invalidation failed for pattern:', pattern);
        return 0;
    }
}

/**
 * Cache AI analysis results to save LLM credits.
 */
export async function cacheAiResult(
    inputHash: string,
    result: object,
    ttlSeconds: number = 86400 // 24h default
): Promise<void> {
    try {
        await redis.setex(`ai:${inputHash}`, ttlSeconds, JSON.stringify(result));
    } catch {
        console.warn('[Redis] AI cache write failed');
    }
}

export async function getCachedAiResult(inputHash: string): Promise<object | null> {
    try {
        const data = await redis.get(`ai:${inputHash}`);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export default redis;
