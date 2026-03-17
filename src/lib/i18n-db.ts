import prisma from '@/lib/db';

/**
 * i18n Key-Value Translation System
 * 
 * 90% of page text (headers, buttons, labels, disclaimers) is stored as
 * pre-translated key-value pairs in the `ui_translations` table.
 * Only the "Local Intro" paragraph is AI-generated per locale.
 */

// In-memory cache for UI translations (invalidated on deploy)
const translationCache = new Map<string, Record<string, string>>();

/**
 * Load all translations for a language + namespace.
 * Results are cached in-memory for the lifetime of the serverless function.
 */
export async function getTranslations(
    langCode: string,
    namespace: string = 'common'
): Promise<Record<string, string>> {
    const cacheKey = `${langCode}:${namespace}`;

    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    const rows = await prisma.uiTranslation.findMany({
        where: { languageCode: langCode, namespace },
        select: { key: true, value: true },
    });

    const translations: Record<string, string> = {};
    for (const row of rows) {
        translations[row.key] = row.value;
    }

    translationCache.set(cacheKey, translations);
    return translations;
}

/**
 * Get a single translation value with fallback to English.
 */
export async function t(
    langCode: string,
    key: string,
    namespace: string = 'common'
): Promise<string> {
    const translations = await getTranslations(langCode, namespace);

    if (translations[key]) {
        return translations[key];
    }

    // Fallback to English
    if (langCode !== 'en') {
        const enTranslations = await getTranslations('en', namespace);
        if (enTranslations[key]) {
            return enTranslations[key];
        }
    }

    // Last resort: return the key itself
    return key;
}

/**
 * Get all UI translations needed for the condition page template.
 * Loads both 'common' and 'condition' namespaces.
 */
export async function getConditionPageTranslations(langCode: string) {
    const [common, condition] = await Promise.all([
        getTranslations(langCode, 'common'),
        getTranslations(langCode, 'condition'),
    ]);

    return { ...common, ...condition };
}

/**
 * Supported languages list (cached).
 */
let languagesCache: Array<{ code: string; name: string; nativeName: string | null }> | null = null;

export async function getSupportedLanguages() {
    if (languagesCache) return languagesCache;

    languagesCache = await prisma.language.findMany({
        where: { isActive: true },
        select: { code: true, name: true, nativeName: true },
        orderBy: { name: 'asc' },
    });

    return languagesCache;
}

/**
 * Clear the in-memory translation cache (call after updating translations).
 */
export function clearTranslationCache(): void {
    translationCache.clear();
    languagesCache = null;
}
