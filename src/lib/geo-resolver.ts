import prisma from './db';
import type { Geography } from '@prisma/client';

export interface GeoChain {
    country?: Geography;
    state?: Geography;
    city?: Geography;
    locality?: Geography;
}

/**
 * Resolve a geography chain from URL slugs.
 * e.g. resolveGeoChain(['india', 'delhi', 'saket'])
 * → { country: {India}, state: {Delhi}, city: null, locality: {Saket} }
 *
 * Optimized: Fetches all matching geographies in a single query,
 * then resolves the hierarchy in memory.
 */
export async function resolveGeoChain(slugs: string[]): Promise<GeoChain> {
    if (slugs.length === 0) return {};

    const chain: GeoChain = {};
    const levels = ['country', 'state', 'city', 'locality'] as const;

    // Fetch all geographies matching any of the slugs in a single query
    const allMatches = await prisma.geography.findMany({
        where: {
            slug: { in: slugs.map(s => s.toLowerCase()) },
            isActive: true,
        },
        orderBy: { level: 'asc' }, // country first
    });

    // Group by slug for quick lookup
    const bySlug = new Map<string, Geography[]>();
    for (const geo of allMatches) {
        const existing = bySlug.get(geo.slug) || [];
        existing.push(geo);
        bySlug.set(geo.slug, existing);
    }

    // Walk the slugs and build the chain
    let parentId: number | null = null;

    for (let i = 0; i < slugs.length && i < levels.length; i++) {
        const slug = slugs[i].toLowerCase();
        const candidates = bySlug.get(slug) || [];

        // Find match at expected level with correct parent
        let match = candidates.find(g =>
            g.level === levels[i] && (parentId === null || g.parentId === parentId)
        );

        // If no exact match, try flexible match (any level with correct parent)
        if (!match) {
            match = candidates.find(g =>
                parentId === null || g.parentId === parentId
            );
        }

        if (match) {
            chain[match.level as keyof GeoChain] = match;
            parentId = match.id;
        }
    }

    return chain;
}

/**
 * Get the most specific (deepest) geography from a chain.
 */
export function getDeepestGeo(chain: GeoChain): Geography | null {
    return chain.locality || chain.city || chain.state || chain.country || null;
}

/**
 * Build breadcrumb trail from a geo chain.
 * Returns array of { name, slug, level } ordered from country → locality.
 */
export function buildGeoBreadcrumbs(chain: GeoChain) {
    const crumbs: Array<{ name: string; slug: string; level: string }> = [];

    if (chain.country) crumbs.push({ name: chain.country.name, slug: chain.country.slug, level: 'country' });
    if (chain.state) crumbs.push({ name: chain.state.name, slug: chain.state.slug, level: 'state' });
    if (chain.city) crumbs.push({ name: chain.city.name, slug: chain.city.slug, level: 'city' });
    if (chain.locality) crumbs.push({ name: chain.locality.name, slug: chain.locality.slug, level: 'locality' });

    return crumbs;
}

/**
 * Get all ancestor geography IDs for a given geography
 * (used for fallback content resolution).
 *
 * Optimized: Uses recursive CTE for single-query hierarchy traversal.
 */
export async function getAncestorIds(geoId: number): Promise<number[]> {
    // Use raw SQL with recursive CTE for efficient hierarchy traversal
    const result = await prisma.$queryRaw<{ id: number }[]>`
        WITH RECURSIVE ancestors AS (
            SELECT id, parent_id FROM geographies WHERE id = ${geoId}
            UNION ALL
            SELECT g.id, g.parent_id FROM geographies g
            INNER JOIN ancestors a ON g.id = a.parent_id
        )
        SELECT id FROM ancestors
    `;

    return result.map(r => r.id);
}

/**
 * Check if a language is supported in a geography.
 * Falls back up the hierarchy if needed.
 */
export async function isLanguageSupported(
    geoChain: GeoChain,
    langCode: string
): Promise<boolean> {
    const deepest = getDeepestGeo(geoChain);
    if (!deepest) return langCode === 'en'; // Default to English

    // Check from deepest to shallowest
    const levels = ['locality', 'city', 'state', 'country'] as const;
    for (const level of levels) {
        const geo = geoChain[level];
        if (geo && geo.supportedLanguages.includes(langCode)) {
            return true;
        }
    }

    return false;
}
