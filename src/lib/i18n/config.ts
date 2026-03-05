/**
 * Internationalization Configuration
 *
 * Centralized configuration for:
 * - RTL languages
 * - Region to language mapping
 * - Language metadata
 */

export interface LanguageConfig {
    code: string;
    name: string;
    nativeName: string;
    dir: 'ltr' | 'rtl';
    script: string;
    googleFontFamily?: string;
}

// All supported languages with their configuration
export const LANGUAGES: Record<string, LanguageConfig> = {
    // LTR Languages
    en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', script: 'Latn' },
    hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', script: 'Deva', googleFontFamily: 'Noto Sans Devanagari' },
    ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', script: 'Taml', googleFontFamily: 'Noto Sans Tamil' },
    te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', script: 'Telu', googleFontFamily: 'Noto Sans Telugu' },
    kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', script: 'Knda', googleFontFamily: 'Noto Sans Kannada' },
    ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', script: 'Mlym', googleFontFamily: 'Noto Sans Malayalam' },
    mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', script: 'Deva', googleFontFamily: 'Noto Sans Devanagari' },
    gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', script: 'Gujr', googleFontFamily: 'Noto Sans Gujarati' },
    bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', script: 'Beng', googleFontFamily: 'Noto Sans Bengali' },
    pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', script: 'Guru', googleFontFamily: 'Noto Sans Gurmukhi' },
    or: { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr', script: 'Orya', googleFontFamily: 'Noto Sans Oriya' },
    as: { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', dir: 'ltr', script: 'Beng', googleFontFamily: 'Noto Sans Bengali' },
    th: { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr', script: 'Thai', googleFontFamily: 'Noto Sans Thai' },
    zh: { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr', script: 'Hans', googleFontFamily: 'Noto Sans SC' },
    ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', script: 'Jpan', googleFontFamily: 'Noto Sans JP' },
    ko: { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', script: 'Kore', googleFontFamily: 'Noto Sans KR' },
    es: { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', script: 'Latn' },
    pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', script: 'Latn' },
    fr: { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', script: 'Latn' },
    de: { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', script: 'Latn' },
    ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr', script: 'Cyrl', googleFontFamily: 'Noto Sans' },
    tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', script: 'Latn' },
    vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr', script: 'Latn' },
    id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', script: 'Latn' },
    ms: { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', dir: 'ltr', script: 'Latn' },
    sw: { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', dir: 'ltr', script: 'Latn' },

    // RTL Languages
    ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', script: 'Arab', googleFontFamily: 'Noto Sans Arabic' },
    ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', script: 'Arab', googleFontFamily: 'Noto Nastaliq Urdu' },
    fa: { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl', script: 'Arab', googleFontFamily: 'Noto Sans Arabic' },
    he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl', script: 'Hebr', googleFontFamily: 'Noto Sans Hebrew' },
    ps: { code: 'ps', name: 'Pashto', nativeName: 'پښتو', dir: 'rtl', script: 'Arab', googleFontFamily: 'Noto Sans Arabic' },
    sd: { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', dir: 'rtl', script: 'Arab', googleFontFamily: 'Noto Sans Arabic' },
    ks: { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', dir: 'rtl', script: 'Arab', googleFontFamily: 'Noto Sans Arabic' },
};

// RTL language codes for quick lookup
export const RTL_LANGUAGES = Object.values(LANGUAGES)
    .filter(l => l.dir === 'rtl')
    .map(l => l.code);

// Check if a language is RTL
export function isRTL(langCode: string): boolean {
    return RTL_LANGUAGES.includes(langCode);
}

// Get language config with fallback to English
export function getLanguageConfig(langCode: string): LanguageConfig {
    return LANGUAGES[langCode] || LANGUAGES.en;
}

/**
 * Region to Language Mapping
 *
 * Maps geographic locations (cities, states, countries) to their primary language
 */

// Indian states/regions to primary language
export const INDIAN_REGION_LANGUAGES: Record<string, string> = {
    // States
    'tamil-nadu': 'ta',
    'karnataka': 'kn',
    'kerala': 'ml',
    'andhra-pradesh': 'te',
    'telangana': 'te',
    'maharashtra': 'mr',
    'gujarat': 'gu',
    'west-bengal': 'bn',
    'punjab': 'pa',
    'odisha': 'or',
    'assam': 'as',
    'bihar': 'hi',
    'jharkhand': 'hi',
    'uttar-pradesh': 'hi',
    'madhya-pradesh': 'hi',
    'rajasthan': 'hi',
    'haryana': 'hi',
    'himachal-pradesh': 'hi',
    'uttarakhand': 'hi',
    'chhattisgarh': 'hi',
    'delhi': 'hi',
    'jammu-and-kashmir': 'ks',
    'goa': 'mr', // Konkani is close to Marathi

    // Major cities
    'chennai': 'ta',
    'coimbatore': 'ta',
    'madurai': 'ta',
    'bangalore': 'kn',
    'bengaluru': 'kn',
    'mysore': 'kn',
    'mysuru': 'kn',
    'kochi': 'ml',
    'thiruvananthapuram': 'ml',
    'hyderabad': 'te',
    'visakhapatnam': 'te',
    'vijayawada': 'te',
    'mumbai': 'mr',
    'pune': 'mr',
    'nagpur': 'mr',
    'ahmedabad': 'gu',
    'surat': 'gu',
    'vadodara': 'gu',
    'kolkata': 'bn',
    'howrah': 'bn',
    'chandigarh': 'pa',
    'amritsar': 'pa',
    'ludhiana': 'pa',
    'bhubaneswar': 'or',
    'guwahati': 'as',
    'patna': 'hi',
    'lucknow': 'hi',
    'kanpur': 'hi',
    'jaipur': 'hi',
    'new-delhi': 'hi',
    'noida': 'hi',
    'gurgaon': 'hi',
    'gurugram': 'hi',
    'bhopal': 'hi',
    'indore': 'hi',
    'varanasi': 'hi',
    'agra': 'hi',
};

// Countries to primary language
export const COUNTRY_LANGUAGES: Record<string, string> = {
    'india': 'hi', // Default to Hindi, but will use regional
    'usa': 'en',
    'uk': 'en',
    'uae': 'ar',
    'saudi-arabia': 'ar',
    'egypt': 'ar',
    'iraq': 'ar',
    'kuwait': 'ar',
    'qatar': 'ar',
    'bahrain': 'ar',
    'oman': 'ar',
    'jordan': 'ar',
    'lebanon': 'ar',
    'syria': 'ar',
    'yemen': 'ar',
    'libya': 'ar',
    'tunisia': 'ar',
    'algeria': 'ar',
    'morocco': 'ar',
    'sudan': 'ar',
    'pakistan': 'ur',
    'iran': 'fa',
    'afghanistan': 'ps',
    'israel': 'he',
    'thailand': 'th',
    'mexico': 'es',
    'spain': 'es',
    'argentina': 'es',
    'colombia': 'es',
    'peru': 'es',
    'chile': 'es',
    'venezuela': 'es',
    'brazil': 'pt',
    'portugal': 'pt',
    'france': 'fr',
    'germany': 'de',
    'russia': 'ru',
    'turkey': 'tr',
    'japan': 'ja',
    'china': 'zh',
    'south-korea': 'ko',
    'vietnam': 'vi',
    'indonesia': 'id',
    'malaysia': 'ms',
    'singapore': 'en', // English is official
    'kenya': 'sw',
    'tanzania': 'sw',
    'nigeria': 'en',
    'south-africa': 'en',
    'australia': 'en',
    'canada': 'en',
};

/**
 * Get the appropriate language for a location
 */
export function getLanguageForLocation(
    countrySlug?: string,
    stateSlug?: string,
    citySlug?: string
): string {
    // Check city first (most specific)
    if (citySlug && INDIAN_REGION_LANGUAGES[citySlug]) {
        return INDIAN_REGION_LANGUAGES[citySlug];
    }

    // Check state
    if (stateSlug && INDIAN_REGION_LANGUAGES[stateSlug]) {
        return INDIAN_REGION_LANGUAGES[stateSlug];
    }

    // Check country
    if (countrySlug && COUNTRY_LANGUAGES[countrySlug]) {
        return COUNTRY_LANGUAGES[countrySlug];
    }

    // Default to English
    return 'en';
}

/**
 * Get all available languages for a country
 */
export function getAvailableLanguages(countrySlug: string): string[] {
    const countryLangs: Record<string, string[]> = {
        'india': ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or', 'as'],
        'usa': ['en', 'es'],
        'uk': ['en'],
        'uae': ['ar', 'en', 'hi', 'ur'],
        'saudi-arabia': ['ar', 'en'],
        'pakistan': ['ur', 'en'],
        'thailand': ['th', 'en'],
        'mexico': ['es', 'en'],
        'turkey': ['tr', 'en'],
        'germany': ['de', 'en'],
        'france': ['fr', 'en'],
        'japan': ['ja', 'en'],
        'china': ['zh', 'en'],
        'brazil': ['pt', 'en'],
        'russia': ['ru', 'en'],
    };

    return countryLangs[countrySlug] || ['en'];
}
