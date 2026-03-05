import prisma from './db';
import { cachedQuery, invalidateCache } from './db-utils';

/**
 * Feature Flag Utilities
 * Helper functions for checking feature flags in application code
 */

const CACHE_PREFIX = 'feature-flag:';
const CACHE_TTL = 60; // 1 minute cache

interface FeatureFlag {
    id: number;
    key: string;
    name: string;
    isEnabled: boolean;
    rolloutPct: number;
    targetRules: {
        countries?: string[];
        tiers?: string[];
        userIds?: string[];
    } | null;
    category: string;
    expiresAt: Date | null;
}

/**
 * Get a feature flag by key
 */
async function getFlag(key: string): Promise<FeatureFlag | null> {
    return cachedQuery(
        `${CACHE_PREFIX}${key}`,
        async () => {
            const flag = await prisma.featureFlag.findUnique({
                where: { key },
                select: {
                    id: true,
                    key: true,
                    name: true,
                    isEnabled: true,
                    rolloutPct: true,
                    targetRules: true,
                    category: true,
                    expiresAt: true,
                },
            });
            return flag as FeatureFlag | null;
        },
        CACHE_TTL
    );
}

/**
 * Check if a feature is enabled
 *
 * @param key - Feature flag key
 * @param options - Optional user context for targeted rollouts
 */
export async function isFeatureEnabled(
    key: string,
    options?: {
        userId?: string;
        country?: string;
        tier?: string;
    }
): Promise<boolean> {
    const flag = await getFlag(key);

    if (!flag) {
        return false;
    }

    // Check if expired
    if (flag.expiresAt && new Date(flag.expiresAt) < new Date()) {
        return false;
    }

    // Check if globally disabled
    if (!flag.isEnabled) {
        return false;
    }

    // Check target rules
    if (flag.targetRules) {
        const rules = flag.targetRules;

        // Check targeted users
        if (options?.userId && rules.userIds?.length) {
            if (rules.userIds.includes(options.userId)) {
                return true;
            }
        }

        // Check targeted countries
        if (options?.country && rules.countries?.length) {
            if (rules.countries.includes(options.country)) {
                return true;
            }
        }

        // Check targeted tiers
        if (options?.tier && rules.tiers?.length) {
            if (rules.tiers.includes(options.tier)) {
                return true;
            }
        }
    }

    // Check rollout percentage
    if (flag.rolloutPct < 100) {
        // Use user ID for consistent rollout, or random for anonymous
        const hash = options?.userId
            ? hashString(options.userId + key)
            : Math.random() * 100;

        return hash < flag.rolloutPct;
    }

    return true;
}

/**
 * Get multiple feature flags at once
 */
export async function getFeatureFlags(
    keys: string[]
): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    await Promise.all(
        keys.map(async (key) => {
            results[key] = await isFeatureEnabled(key);
        })
    );

    return results;
}

/**
 * Invalidate feature flag cache
 */
export function invalidateFeatureFlagCache(key?: string): void {
    if (key) {
        invalidateCache(`${CACHE_PREFIX}${key}`);
    } else {
        invalidateCache(CACHE_PREFIX);
    }
}

/**
 * Simple hash function for consistent rollout
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
}

/**
 * React hook helper for feature flags (client-side)
 * Usage: const isEnabled = useFeatureFlag('new-dashboard');
 */
export function createFeatureFlagChecker(flags: Record<string, boolean>) {
    return function useFeatureFlag(key: string): boolean {
        return flags[key] ?? false;
    };
}

/**
 * Middleware helper to check feature flag
 */
export async function requireFeature(
    key: string,
    options?: { userId?: string; country?: string; tier?: string }
): Promise<{ enabled: boolean; error?: string }> {
    const enabled = await isFeatureEnabled(key, options);

    if (!enabled) {
        return {
            enabled: false,
            error: `Feature '${key}' is not enabled`,
        };
    }

    return { enabled: true };
}
