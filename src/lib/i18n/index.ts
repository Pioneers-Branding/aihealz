/**
 * i18n Module Exports
 *
 * Central export point for internationalization utilities
 */

export * from './config';
export * from './translations';

// Re-export commonly used functions
export {
    isRTL,
    getLanguageConfig,
    getLanguageForLocation,
    getAvailableLanguages,
    LANGUAGES,
    RTL_LANGUAGES,
    INDIAN_REGION_LANGUAGES,
    COUNTRY_LANGUAGES,
} from './config';

export {
    getUITranslations,
    t,
    createTranslationContext,
} from './translations';
