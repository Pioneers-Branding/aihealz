import { headers } from 'next/headers';
import { cookies } from 'next/headers';

/**
 * Geo Context Utility
 *
 * Provides a clean API for reading the user's detected geo context
 * in any server component. The middleware sets these values on every request.
 */

export interface GeoContext {
    countrySlug: string | null;
    citySlug: string | null;
    lang: string;
    countryCode: string | null;
}

// Country code to slug mapping
const COUNTRY_CODE_TO_SLUG: Record<string, string> = {
    IN: 'india',
    US: 'usa',
    GB: 'uk',
    NG: 'nigeria',
    DE: 'germany',
    FR: 'france',
    BR: 'brazil',
    ES: 'spain',
    KE: 'kenya',
    ZA: 'south-africa',
    AU: 'australia',
    CA: 'canada',
    MX: 'mexico',
    EG: 'egypt',
    SA: 'saudi-arabia',
    AE: 'uae',
    JP: 'japan',
    CN: 'china',
};

/**
 * Get the current user's geo context from middleware headers.
 * Use this in any Server Component or API route.
 * Returns null for countrySlug if no country detected (does NOT default to India).
 */
export async function getGeoContext(): Promise<GeoContext> {
    const headersList = await headers();

    const countrySlug = headersList.get('x-aihealz-country') || null;
    const countryCode = headersList.get('x-aihealz-country-code') || null;

    return {
        countrySlug,
        citySlug: headersList.get('x-aihealz-city') || null,
        lang: headersList.get('x-aihealz-lang') || 'en',
        countryCode,
    };
}

/**
 * Get country slug from country code
 */
export function getCountrySlugFromCode(code: string | null): string | null {
    if (!code) return null;
    return COUNTRY_CODE_TO_SLUG[code.toUpperCase()] || null;
}

/**
 * Get the user's language preference.
 * Priority: cookie → middleware header → 'en'
 */
export async function getUserLanguage(): Promise<string> {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get('aihealz-lang')?.value;

    if (cookieLang) return cookieLang;

    const headersList = await headers();
    return headersList.get('x-aihealz-lang') || 'en';
}

/**
 * Set the user's language preference cookie.
 * Call this from a Server Action when a user explicitly selects a language.
 */
export async function setUserLanguage(lang: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('aihealz-lang', lang, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
        sameSite: 'lax',
    });
}

/**
 * Build a localized URL path based on current geo context.
 */
export function buildLocalUrl(
    context: GeoContext,
    path: string
): string {
    const base = `/${context.countrySlug}/${context.lang}`;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
