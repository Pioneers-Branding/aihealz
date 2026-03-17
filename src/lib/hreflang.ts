import type { GeoChain } from './geo-resolver';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';

/**
 * hreflang Tag Generator
 *
 * Generates <link rel="alternate" hreflang="..."> tags so Google knows:
 * - The English page for USA vs the English page for UK (different content)
 * - The Hindi version vs the English version of the same India page
 *
 * Strategy:
 * 1. For each supported language of the geography, generate an hreflang entry
 * 2. Always include an x-default pointing to the English version
 * 3. Use ISO format: hreflang="en-IN" for English in India, "en-US" for USA
 */

// Import unified country config
import { SLUG_TO_CODE } from './countries';

// Country code to ISO 3166-1 mapping (from unified config)
const COUNTRY_CODE_MAP = SLUG_TO_CODE;

interface HreflangTag {
    hreflang: string;
    href: string;
}

/**
 * Build the geo path portion of the URL from the chain.
 */
function buildGeoPath(geoChain: GeoChain): string {
    const parts: string[] = [];
    if (geoChain.country) parts.push(geoChain.country.slug);
    if (geoChain.state) parts.push(geoChain.state.slug);
    if (geoChain.city) parts.push(geoChain.city.slug);
    if (geoChain.locality) parts.push(geoChain.locality.slug);
    return parts.join('/');
}

/**
 * Generate hreflang tags for a condition page.
 *
 * @param conditionSlug - The condition slug (e.g. 'back-pain')
 * @param geoChain - Resolved geography chain
 * @param currentLang - Current page language
 * @param availableLanguages - Languages that have content for this page
 * @returns Array of hreflang link objects
 */
export function generateHreflangTags(
    conditionSlug: string,
    geoChain: GeoChain,
    currentLang: string,
    availableLanguages: string[]
): HreflangTag[] {
    const tags: HreflangTag[] = [];
    const geoPath = buildGeoPath(geoChain);
    const countrySlug = geoChain.country?.slug || '';
    const countryCode = COUNTRY_CODE_MAP[countrySlug] || '';

    for (const lang of availableLanguages) {
        const url = `${SITE_URL}/${countrySlug}/${lang}/${conditionSlug}${geoPath ? '/' + geoPath.split('/').slice(1).join('/') : ''}`;

        // Specific language-region tag (e.g. "en-IN", "hi-IN")
        if (countryCode) {
            tags.push({
                hreflang: `${lang}-${countryCode}`,
                href: url,
            });
        } else {
            tags.push({
                hreflang: lang,
                href: url,
            });
        }
    }

    // x-default: points to the English version (or first available)
    const defaultLang = availableLanguages.includes('en') ? 'en' : availableLanguages[0];
    const defaultUrl = `${SITE_URL}/${countrySlug}/${defaultLang}/${conditionSlug}${geoPath ? '/' + geoPath.split('/').slice(1).join('/') : ''}`;

    tags.push({
        hreflang: 'x-default',
        href: defaultUrl,
    });

    return tags;
}

/**
 * Render hreflang tags as HTML string for <head>.
 */
export function renderHreflangHTML(tags: HreflangTag[]): string {
    return tags
        .map((tag) => `<link rel="alternate" hreflang="${tag.hreflang}" href="${tag.href}" />`)
        .join('\n');
}

/**
 * Detect the best language for a user based on geography and Accept-Language header.
 *
 * Fallback chain:
 * 1. Explicit URL language parameter
 * 2. Geography's supported languages matched against Accept-Language
 * 3. First supported language of the geography
 * 4. English (ultimate fallback)
 */
export function detectBestLanguage(
    requestedLang: string | null,
    geoSupportedLanguages: string[],
    acceptLanguageHeader?: string
): string {
    // 1. Explicit URL language — if it's supported, use it
    if (requestedLang && geoSupportedLanguages.includes(requestedLang)) {
        return requestedLang;
    }

    // 2. Parse Accept-Language header and match
    if (acceptLanguageHeader) {
        const preferred = parseAcceptLanguage(acceptLanguageHeader);
        for (const lang of preferred) {
            if (geoSupportedLanguages.includes(lang)) {
                return lang;
            }
        }
    }

    // 3. First supported language
    if (geoSupportedLanguages.length > 0) {
        return geoSupportedLanguages[0];
    }

    // 4. Ultimate fallback
    return 'en';
}

/**
 * Parse Accept-Language header into ordered array of language codes.
 */
function parseAcceptLanguage(header: string): string[] {
    return header
        .split(',')
        .map((part) => {
            const [lang, q] = part.trim().split(';q=');
            return {
                lang: lang.trim().split('-')[0].toLowerCase(), // 'en-US' → 'en'
                quality: q ? parseFloat(q) : 1.0,
            };
        })
        .sort((a, b) => b.quality - a.quality)
        .map((item) => item.lang);
}
