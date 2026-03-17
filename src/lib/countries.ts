/**
 * Unified Country Configuration
 *
 * Single source of truth for all country-related data across the application.
 * Used by: middleware, content-engine, cost estimator, hreflang, doctors, etc.
 */

export interface CountryConfig {
    slug: string;           // URL slug (india, usa, uk)
    name: string;           // Display name
    code: string;           // ISO 3166-1 alpha-2 (IN, US, GB)
    currency: string;       // Currency code (INR, USD, GBP)
    currencySymbol: string; // Display symbol (₹, $, £)
    languages: string[];    // Supported languages
    hasCostData: boolean;   // Has treatment cost data
    hasDoctors: boolean;    // Has doctor listings
    isMedicalTourism: boolean; // Popular for medical tourism
    timezone: string;       // Primary timezone
}

/**
 * Master list of supported countries
 *
 * When adding a new country:
 * 1. Add to this list
 * 2. Run seed script to add geography data
 * 3. Populate treatment costs if hasCostData is true
 */
export const COUNTRIES: CountryConfig[] = [
    // ═══════════════════════════════════════════════════════════════════════════════
    // Tier 1: Full support (cost data + doctors + all features)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        slug: 'india',
        name: 'India',
        code: 'IN',
        currency: 'INR',
        currencySymbol: '₹',
        // 22 official languages + English - comprehensive coverage for all states
        languages: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'mai', 'sa', 'ks', 'ne', 'sd', 'kok', 'doi', 'mni', 'sat', 'bho'],
        hasCostData: true,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'Asia/Kolkata',
    },
    {
        slug: 'usa',
        name: 'United States',
        code: 'US',
        currency: 'USD',
        currencySymbol: '$',
        // English + major immigrant languages (Spanish 13%, Chinese 1%, Tagalog, Vietnamese, Arabic, French, Korean, Russian, Portuguese, Hindi)
        languages: ['en', 'es', 'tl', 'vi', 'ar', 'fr', 'ko', 'ru', 'pt', 'hi', 'de', 'ja', 'pl', 'it'],
        hasCostData: true,
        hasDoctors: true,
        isMedicalTourism: false,
        timezone: 'America/New_York',
    },
    {
        slug: 'uk',
        name: 'United Kingdom',
        code: 'GB',
        currency: 'GBP',
        currencySymbol: '£',
        // English + Welsh, Scottish Gaelic + major immigrant languages (Polish, Urdu, Punjabi, Bengali, Gujarati, Arabic, Chinese)
        languages: ['en', 'cy', 'gd', 'pl', 'ur', 'pa', 'bn', 'gu', 'ar', 'pt', 'fr', 'ta', 'so', 'tr'],
        hasCostData: true,
        hasDoctors: true,
        isMedicalTourism: false,
        timezone: 'Europe/London',
    },
    {
        slug: 'uae',
        name: 'United Arab Emirates',
        code: 'AE',
        currency: 'AED',
        currencySymbol: 'د.إ',
        // Arabic + large expat population languages (Hindi, Urdu, Malayalam, Tamil, Tagalog, Bengali, English, Persian)
        languages: ['ar', 'en', 'hi', 'ur', 'ml', 'ta', 'tl', 'bn', 'fa', 'pa', 'te', 'ne', 'si'],
        hasCostData: true,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'Asia/Dubai',
    },
    {
        slug: 'thailand',
        name: 'Thailand',
        code: 'TH',
        currency: 'THB',
        currencySymbol: '฿',
        // Thai + Chinese (14% population), English, Malay, Khmer, Burmese
        languages: ['th', 'en', 'ms', 'km', 'my', 'lo', 'ja', 'ko'],
        hasCostData: true,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'Asia/Bangkok',
    },
    {
        slug: 'mexico',
        name: 'Mexico',
        code: 'MX',
        currency: 'MXN',
        currencySymbol: '$',
        // Spanish + 68 indigenous languages (Nahuatl, Yucatec Maya, Zapotec, Mixtec) + English
        languages: ['es', 'en', 'nah', 'yua', 'zap', 'mix', 'tzo', 'tzh', 'maz', 'hus'],
        hasCostData: true,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'America/Mexico_City',
    },
    {
        slug: 'turkey',
        name: 'Turkey',
        code: 'TR',
        currency: 'TRY',
        currencySymbol: '₺',
        // Turkish + Kurdish (15%), Arabic (2%), English, Russian (medical tourism)
        languages: ['tr', 'en', 'ku', 'ar', 'ru', 'de', 'fa', 'az', 'bg'],
        hasCostData: true,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'Europe/Istanbul',
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // Tier 2: Content support (no full cost data yet)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        slug: 'singapore',
        name: 'Singapore',
        code: 'SG',
        currency: 'SGD',
        currencySymbol: 'S$',
        // 4 official languages + major spoken languages
        languages: ['en', 'ms', 'ta', 'hi', 'tl', 'ja', 'ko', 'th'],
        hasCostData: false,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'Asia/Singapore',
    },
    {
        slug: 'australia',
        name: 'Australia',
        code: 'AU',
        currency: 'AUD',
        currencySymbol: 'A$',
        // English + major immigrant languages (Mandarin 2.5%, Arabic, Cantonese, Vietnamese, Italian, Greek, Hindi, Spanish)
        languages: ['en', 'ar', 'vi', 'it', 'el', 'hi', 'es', 'pa', 'tl', 'ko', 'ta', 'ne', 'fa'],
        hasCostData: false,
        hasDoctors: true,
        isMedicalTourism: false,
        timezone: 'Australia/Sydney',
    },
    {
        slug: 'canada',
        name: 'Canada',
        code: 'CA',
        currency: 'CAD',
        currencySymbol: 'C$',
        // English, French (22%) + major immigrant languages (Punjabi, Chinese, Tagalog, Arabic, Spanish, Italian)
        languages: ['en', 'fr', 'pa', 'tl', 'ar', 'es', 'it', 'de', 'pt', 'ur', 'ta', 'vi', 'ko', 'fa', 'hi'],
        hasCostData: false,
        hasDoctors: true,
        isMedicalTourism: false,
        timezone: 'America/Toronto',
    },
    {
        slug: 'germany',
        name: 'Germany',
        code: 'DE',
        currency: 'EUR',
        currencySymbol: '€',
        // German + major immigrant languages (Turkish 2.5%, Russian, Polish, Arabic, Kurdish, Greek, Italian)
        languages: ['de', 'en', 'tr', 'ru', 'pl', 'ar', 'ku', 'el', 'it', 'ro', 'hr', 'sr', 'fa', 'uk'],
        hasCostData: false,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'Europe/Berlin',
    },
    {
        slug: 'france',
        name: 'France',
        code: 'FR',
        currency: 'EUR',
        currencySymbol: '€',
        // French + regional languages (Occitan, Breton, Alsatian, Basque, Catalan, Corsican) + immigrant languages
        languages: ['fr', 'en', 'ar', 'pt', 'es', 'it', 'de', 'tr', 'vi', 'pl', 'ro', 'nl'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Paris',
    },
    {
        slug: 'brazil',
        name: 'Brazil',
        code: 'BR',
        currency: 'BRL',
        currencySymbol: 'R$',
        // Portuguese + 274 indigenous languages + major immigrant languages (German, Italian, Japanese, Spanish)
        languages: ['pt', 'en', 'es', 'de', 'it', 'ja', 'ar', 'ko', 'pl', 'uk'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'America/Sao_Paulo',
    },
    {
        slug: 'saudi-arabia',
        name: 'Saudi Arabia',
        code: 'SA',
        currency: 'SAR',
        currencySymbol: '﷼',
        // Arabic + major expat languages (Urdu, Hindi, Tagalog, Bengali, Malayalam, Indonesian)
        languages: ['ar', 'en', 'ur', 'hi', 'tl', 'bn', 'ml', 'id', 'ta', 'te', 'pa', 'fa', 'ne', 'si'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Riyadh',
    },
    {
        slug: 'egypt',
        name: 'Egypt',
        code: 'EG',
        currency: 'EGP',
        currencySymbol: 'E£',
        // Arabic (Egyptian dialect) + Nubian languages + Berber + English/French
        languages: ['ar', 'en', 'fr', 'de', 'it', 'ru'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Cairo',
    },
    {
        slug: 'nigeria',
        name: 'Nigeria',
        code: 'NG',
        currency: 'NGN',
        currencySymbol: '₦',
        // English + 500+ languages (Hausa 30%, Yoruba 21%, Igbo 18%, Fulani, Kanuri, Ibibio, Tiv)
        languages: ['en', 'ha', 'yo', 'ig', 'ff', 'kr', 'ibb', 'tiv', 'efi', 'edo', 'nup', 'pcm'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Lagos',
    },
    {
        slug: 'south-africa',
        name: 'South Africa',
        code: 'ZA',
        currency: 'ZAR',
        currencySymbol: 'R',
        // 11 official languages + major spoken languages
        languages: ['en', 'af', 'zu', 'xh', 'st', 'tn', 'ts', 'ss', 've', 'nr', 'nso'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Johannesburg',
    },
    {
        slug: 'kenya',
        name: 'Kenya',
        code: 'KE',
        currency: 'KES',
        currencySymbol: 'KSh',
        // English, Swahili + 68 tribal languages (Kikuyu, Luhya, Luo, Kalenjin, Kamba)
        languages: ['en', 'sw', 'ki', 'luy', 'luo', 'kln', 'kam', 'som', 'guz', 'mas'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Nairobi',
    },
    {
        slug: 'malaysia',
        name: 'Malaysia',
        code: 'MY',
        currency: 'MYR',
        currencySymbol: 'RM',
        // Malay + major ethnic languages (Chinese 24%, Tamil 7%) + indigenous languages
        languages: ['ms', 'en', 'ta', 'te', 'ml', 'pa', 'th', 'ar', 'iban', 'dtp'],
        hasCostData: false,
        hasDoctors: true,
        isMedicalTourism: true,
        timezone: 'Asia/Kuala_Lumpur',
    },
    {
        slug: 'spain',
        name: 'Spain',
        code: 'ES',
        currency: 'EUR',
        currencySymbol: '€',
        // Spanish + co-official languages (Catalan 17%, Galician 7%, Basque 2%, Valencian, Aranese)
        languages: ['es', 'en', 'ca', 'gl', 'eu', 'an', 'ast', 'oc', 'ar', 'ro', 'fr', 'pt'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Madrid',
    },
    {
        slug: 'japan',
        name: 'Japan',
        code: 'JP',
        currency: 'JPY',
        currencySymbol: '¥',
        // Japanese + Ryukyuan languages + Ainu + immigrant languages
        languages: ['ja', 'en', 'ko', 'pt', 'vi', 'tl', 'es', 'ne', 'id'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Tokyo',
    },
    {
        slug: 'south-korea',
        name: 'South Korea',
        code: 'KR',
        currency: 'KRW',
        currencySymbol: '₩',
        // Korean + English + immigrant languages
        languages: ['ko', 'en', 'ja', 'vi', 'th', 'ru', 'tl', 'id', 'uz'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: true,
        timezone: 'Asia/Seoul',
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // Tier 3: Additional countries for wider coverage
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        slug: 'indonesia',
        name: 'Indonesia',
        code: 'ID',
        currency: 'IDR',
        currencySymbol: 'Rp',
        // Indonesian + 700+ local languages (Javanese 40%, Sundanese 15%, Madurese, Minangkabau, Batak)
        languages: ['id', 'en', 'jv', 'su', 'mad', 'min', 'bbc', 'ms', 'ar', 'nl'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Jakarta',
    },
    {
        slug: 'philippines',
        name: 'Philippines',
        code: 'PH',
        currency: 'PHP',
        currencySymbol: '₱',
        // Filipino/Tagalog + English + 170+ languages (Cebuano 21%, Ilocano 9%, Hiligaynon 8%)
        languages: ['en', 'tl', 'ceb', 'ilo', 'hil', 'bik', 'war', 'pam', 'pag', 'ar', 'es'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Manila',
    },
    {
        slug: 'pakistan',
        name: 'Pakistan',
        code: 'PK',
        currency: 'PKR',
        currencySymbol: '₨',
        // Urdu + provincial languages (Punjabi 48%, Pashto 18%, Sindhi 12%, Saraiki 10%, Balochi 3%)
        languages: ['ur', 'en', 'pa', 'ps', 'sd', 'skr', 'bal', 'bra', 'hno', 'ar'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Karachi',
    },
    {
        slug: 'bangladesh',
        name: 'Bangladesh',
        code: 'BD',
        currency: 'BDT',
        currencySymbol: '৳',
        // Bengali + Chittagonian, Sylheti, Rangpuri + tribal languages
        languages: ['bn', 'en', 'ctg', 'syl', 'rkt', 'ccp', 'mni', 'ar', 'hi'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Dhaka',
    },
    {
        slug: 'vietnam',
        name: 'Vietnam',
        code: 'VN',
        currency: 'VND',
        currencySymbol: '₫',
        // Vietnamese + 53 ethnic minority languages (Tay, Thai, Muong, Khmer, Chinese)
        languages: ['vi', 'en', 'km', 'tay', 'nut', 'hmn', 'fr', 'ru', 'ja', 'ko'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Ho_Chi_Minh',
    },
    {
        slug: 'russia',
        name: 'Russia',
        code: 'RU',
        currency: 'RUB',
        currencySymbol: '₽',
        // Russian + 35 official minority languages (Tatar 4%, Ukrainian, Bashkir, Chechen, Chuvash)
        languages: ['ru', 'en', 'tt', 'uk', 'ba', 'ce', 'cv', 'av', 'os', 'de', 'ko', 'ja'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Moscow',
    },
    {
        slug: 'italy',
        name: 'Italy',
        code: 'IT',
        currency: 'EUR',
        currencySymbol: '€',
        // Italian + regional languages (Neapolitan, Sicilian, Venetian, Lombard) + minorities
        languages: ['it', 'en', 'de', 'fr', 'sl', 'fur', 'sc', 'nap', 'scn', 'vec', 'ro', 'ar', 'es'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Rome',
    },
    {
        slug: 'netherlands',
        name: 'Netherlands',
        code: 'NL',
        currency: 'EUR',
        currencySymbol: '€',
        // Dutch + Frisian + immigrant languages (Turkish, Arabic, Berber, Indonesian, Papiamento)
        languages: ['nl', 'en', 'fy', 'li', 'de', 'tr', 'ar', 'ber', 'id', 'pap', 'pl', 'es'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Amsterdam',
    },
    {
        slug: 'poland',
        name: 'Poland',
        code: 'PL',
        currency: 'PLN',
        currencySymbol: 'zł',
        // Polish + regional/minority languages (Silesian, Kashubian, German, Ukrainian, Belarusian)
        languages: ['pl', 'en', 'szl', 'csb', 'de', 'uk', 'be', 'ru', 'lt', 'vi'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Warsaw',
    },
    {
        slug: 'new-zealand',
        name: 'New Zealand',
        code: 'NZ',
        currency: 'NZD',
        currencySymbol: 'NZ$',
        // English, Māori (4%) + NZ Sign Language + immigrant languages
        languages: ['en', 'mi', 'sm', 'hi', 'fr', 'tl', 'de', 'nl', 'ko'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Pacific/Auckland',
    },
    {
        slug: 'ireland',
        name: 'Ireland',
        code: 'IE',
        currency: 'EUR',
        currencySymbol: '€',
        // English, Irish Gaelic (40% can speak) + immigrant languages
        languages: ['en', 'ga', 'pl', 'fr', 'de', 'es', 'ro', 'lt', 'pt', 'ar'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Dublin',
    },
    {
        slug: 'israel',
        name: 'Israel',
        code: 'IL',
        currency: 'ILS',
        currencySymbol: '₪',
        // Hebrew, Arabic (21% Arab population) + Russian (15%), Amharic, Yiddish, French, English
        languages: ['he', 'ar', 'en', 'ru', 'am', 'yi', 'fr', 'es', 'ro', 'fa'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: true,
        timezone: 'Asia/Jerusalem',
    },
    {
        slug: 'sweden',
        name: 'Sweden',
        code: 'SE',
        currency: 'SEK',
        currencySymbol: 'kr',
        // Swedish + minority languages (Finnish, Sami, Meänkieli, Romani, Yiddish) + immigrant languages
        languages: ['sv', 'en', 'fi', 'ar', 'fa', 'so', 'ku', 'bs', 'pl', 'de', 'es', 'tr'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Stockholm',
    },
    {
        slug: 'switzerland',
        name: 'Switzerland',
        code: 'CH',
        currency: 'CHF',
        currencySymbol: 'CHF',
        // 4 official languages + Romansh + immigrant languages
        languages: ['de', 'fr', 'it', 'rm', 'en', 'pt', 'es', 'sr', 'hr', 'sq', 'tr', 'ar'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Zurich',
    },
    {
        slug: 'austria',
        name: 'Austria',
        code: 'AT',
        currency: 'EUR',
        currencySymbol: '€',
        // German + recognized minority languages (Hungarian, Slovene, Croatian, Czech, Slovak)
        languages: ['de', 'en', 'hu', 'sl', 'hr', 'cs', 'sk', 'tr', 'sr', 'bs', 'ro', 'pl'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Vienna',
    },
    {
        slug: 'belgium',
        name: 'Belgium',
        code: 'BE',
        currency: 'EUR',
        currencySymbol: '€',
        // Dutch (60%), French (40%), German + immigrant languages
        languages: ['nl', 'fr', 'de', 'en', 'ar', 'tr', 'it', 'es', 'pl', 'ro'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Brussels',
    },
    {
        slug: 'portugal',
        name: 'Portugal',
        code: 'PT',
        currency: 'EUR',
        currencySymbol: '€',
        // Portuguese + Mirandese + immigrant languages
        languages: ['pt', 'en', 'mwl', 'es', 'fr', 'uk', 'ro', 'ar', 'hi'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Lisbon',
    },
    {
        slug: 'greece',
        name: 'Greece',
        code: 'GR',
        currency: 'EUR',
        currencySymbol: '€',
        // Greek + minority languages (Turkish, Macedonian, Albanian, Bulgarian, Romani)
        languages: ['el', 'en', 'tr', 'mk', 'sq', 'bg', 'rom', 'ar', 'de', 'fr'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Europe/Athens',
    },
    {
        slug: 'argentina',
        name: 'Argentina',
        code: 'AR',
        currency: 'ARS',
        currencySymbol: '$',
        // Spanish + indigenous languages (Quechua, Guaraní, Mapudungun) + immigrant languages
        languages: ['es', 'en', 'qu', 'gn', 'arn', 'it', 'de', 'ar', 'pt', 'fr'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'America/Buenos_Aires',
    },
    {
        slug: 'colombia',
        name: 'Colombia',
        code: 'CO',
        currency: 'COP',
        currencySymbol: '$',
        // Spanish + 65+ indigenous languages (Wayuu, Nasa, Emberá) + Creole
        languages: ['es', 'en', 'way', 'pbb', 'cja', 'guc', 'ar', 'pt', 'fr'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: true,
        timezone: 'America/Bogota',
    },
    {
        slug: 'chile',
        name: 'Chile',
        code: 'CL',
        currency: 'CLP',
        currencySymbol: '$',
        // Spanish + indigenous languages (Mapudungun, Aymara, Quechua, Rapa Nui)
        languages: ['es', 'en', 'arn', 'ay', 'qu', 'rap', 'de', 'it', 'ar'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'America/Santiago',
    },
    {
        slug: 'peru',
        name: 'Peru',
        code: 'PE',
        currency: 'PEN',
        currencySymbol: 'S/',
        // Spanish + Quechua (13%), Aymara (2%) + 47 other indigenous languages
        languages: ['es', 'en', 'qu', 'ay', 'shi', 'agr', 'ja', 'it', 'pt'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'America/Lima',
    },
    {
        slug: 'morocco',
        name: 'Morocco',
        code: 'MA',
        currency: 'MAD',
        currencySymbol: 'د.م.',
        // Arabic, Berber/Tamazight (40%) + French (widely used) + Spanish (in north)
        languages: ['ar', 'ber', 'fr', 'en', 'es', 'tzm', 'rif', 'shi', 'zgh'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Casablanca',
    },
    {
        slug: 'ghana',
        name: 'Ghana',
        code: 'GH',
        currency: 'GHS',
        currencySymbol: 'GH₵',
        // English + 80+ languages (Akan/Twi 47%, Mole-Dagbon 17%, Ewe 14%, Ga-Dangme 7%)
        languages: ['en', 'ak', 'dag', 'ee', 'gaa', 'ha', 'fat', 'nzi', 'tw', 'kas'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Accra',
    },
    {
        slug: 'tanzania',
        name: 'Tanzania',
        code: 'TZ',
        currency: 'TZS',
        currencySymbol: 'TSh',
        // Swahili, English + 120+ Bantu and Nilotic languages
        languages: ['sw', 'en', 'suk', 'ha', 'mas', 'ar', 'gu', 'hi'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Dar_es_Salaam',
    },
    {
        slug: 'ethiopia',
        name: 'Ethiopia',
        code: 'ET',
        currency: 'ETB',
        currencySymbol: 'Br',
        // Amharic (32%) + 80+ languages (Oromo 34%, Tigrinya 6%, Somali 6%, Sidamo 4%)
        languages: ['am', 'en', 'om', 'ti', 'so', 'sid', 'wal', 'ar', 'aa'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Africa/Addis_Ababa',
    },
    {
        slug: 'sri-lanka',
        name: 'Sri Lanka',
        code: 'LK',
        currency: 'LKR',
        currencySymbol: 'Rs',
        // Sinhala (75%), Tamil (25%) + English (link language)
        languages: ['si', 'ta', 'en', 'ar', 'ml', 'hi'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Colombo',
    },
    {
        slug: 'nepal',
        name: 'Nepal',
        code: 'NP',
        currency: 'NPR',
        currencySymbol: 'रू',
        // Nepali (45%) + 122 languages (Maithili 12%, Bhojpuri 6%, Tharu 5%, Tamang 5%, Newari 3%)
        languages: ['ne', 'en', 'mai', 'bho', 'thq', 'new', 'mgy', 'awa', 'hi', 'bn'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Kathmandu',
    },
    {
        slug: 'qatar',
        name: 'Qatar',
        code: 'QA',
        currency: 'QAR',
        currencySymbol: 'ر.ق',
        // Arabic + large expat population languages (English, Hindi, Urdu, Malayalam, Tagalog, Bengali, Tamil, Nepali)
        languages: ['ar', 'en', 'hi', 'ur', 'ml', 'tl', 'bn', 'ta', 'ne', 'fa', 'si', 'id'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Qatar',
    },
    {
        slug: 'kuwait',
        name: 'Kuwait',
        code: 'KW',
        currency: 'KWD',
        currencySymbol: 'د.ك',
        // Arabic + expat languages (English, Hindi, Urdu, Tagalog, Malayalam, Bengali, Tamil)
        languages: ['ar', 'en', 'hi', 'ur', 'tl', 'ml', 'bn', 'ta', 'fa', 'ne', 'si'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Kuwait',
    },
    {
        slug: 'oman',
        name: 'Oman',
        code: 'OM',
        currency: 'OMR',
        currencySymbol: 'ر.ع.',
        // Arabic + Balochi, Swahili (Zanzibar origin) + expat languages (Hindi, Urdu, Bengali, Tagalog)
        languages: ['ar', 'en', 'bal', 'sw', 'hi', 'ur', 'bn', 'tl', 'ml', 'ta'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Muscat',
    },
    {
        slug: 'bahrain',
        name: 'Bahrain',
        code: 'BH',
        currency: 'BHD',
        currencySymbol: '.د.ب',
        // Arabic + Persian (Ajam community) + expat languages (English, Hindi, Urdu, Tagalog, Malayalam)
        languages: ['ar', 'en', 'fa', 'hi', 'ur', 'tl', 'ml', 'bn', 'ta', 'ne'],
        hasCostData: false,
        hasDoctors: false,
        isMedicalTourism: false,
        timezone: 'Asia/Bahrain',
    },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface LanguageConfig {
    code: string;           // ISO 639-1/639-3 code
    name: string;           // English name
    nativeName: string;     // Native script name
    direction: 'ltr' | 'rtl'; // Text direction
    script: string;         // Primary script
}

/**
 * Master list of supported languages with metadata for SEO/i18n
 * Used for: hreflang tags, language selectors, translation systems
 */
export const LANGUAGES: Record<string, LanguageConfig> = {
    // ── Major World Languages ──────────────────────────────────────────────────
    'en': { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', script: 'Latin' },
    'es': { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', script: 'Latin' },
    'ar': { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', script: 'Arabic' },
    'pt': { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', script: 'Latin' },
    'fr': { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', script: 'Latin' },
    'de': { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', script: 'Latin' },
    'ru': { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', script: 'Cyrillic' },
    'ja': { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', script: 'Japanese' },
    'ko': { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', script: 'Hangul' },
    'it': { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', script: 'Latin' },
    'nl': { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', script: 'Latin' },
    'pl': { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', script: 'Latin' },
    'tr': { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', script: 'Latin' },
    'vi': { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', script: 'Latin' },
    'th': { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', script: 'Thai' },
    'id': { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', script: 'Latin' },
    'ms': { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', script: 'Latin' },
    'tl': { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', direction: 'ltr', script: 'Latin' },
    'sv': { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', script: 'Latin' },
    'el': { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', script: 'Greek' },
    'he': { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', script: 'Hebrew' },
    'fa': { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', script: 'Arabic' },
    'uk': { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', script: 'Cyrillic' },
    'ro': { code: 'ro', name: 'Romanian', nativeName: 'Română', direction: 'ltr', script: 'Latin' },
    'hu': { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', script: 'Latin' },
    'cs': { code: 'cs', name: 'Czech', nativeName: 'Čeština', direction: 'ltr', script: 'Latin' },
    'sk': { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', direction: 'ltr', script: 'Latin' },
    'bg': { code: 'bg', name: 'Bulgarian', nativeName: 'Български', direction: 'ltr', script: 'Cyrillic' },
    'hr': { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', direction: 'ltr', script: 'Latin' },
    'sr': { code: 'sr', name: 'Serbian', nativeName: 'Српски', direction: 'ltr', script: 'Cyrillic' },
    'sl': { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', direction: 'ltr', script: 'Latin' },
    'fi': { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', script: 'Latin' },
    'da': { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', script: 'Latin' },
    'no': { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', script: 'Latin' },
    'lt': { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', direction: 'ltr', script: 'Latin' },
    'lv': { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', direction: 'ltr', script: 'Latin' },
    'et': { code: 'et', name: 'Estonian', nativeName: 'Eesti', direction: 'ltr', script: 'Latin' },

    // ── South Asian Languages (India, Pakistan, Bangladesh, Nepal, Sri Lanka) ──
    'hi': { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', script: 'Devanagari' },
    'bn': { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', script: 'Bengali' },
    'te': { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', script: 'Telugu' },
    'mr': { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', script: 'Devanagari' },
    'ta': { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', script: 'Tamil' },
    'gu': { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', script: 'Gujarati' },
    'kn': { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', script: 'Kannada' },
    'ml': { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', script: 'Malayalam' },
    'or': { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', direction: 'ltr', script: 'Odia' },
    'pa': { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', script: 'Gurmukhi' },
    'as': { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', direction: 'ltr', script: 'Bengali' },
    'ur': { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', script: 'Arabic' },
    'ne': { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', direction: 'ltr', script: 'Devanagari' },
    'si': { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', direction: 'ltr', script: 'Sinhala' },
    'sd': { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', direction: 'rtl', script: 'Arabic' },
    'ks': { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', direction: 'rtl', script: 'Arabic' },
    'mai': { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', direction: 'ltr', script: 'Devanagari' },
    'bho': { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', direction: 'ltr', script: 'Devanagari' },
    'sa': { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', direction: 'ltr', script: 'Devanagari' },
    'kok': { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', direction: 'ltr', script: 'Devanagari' },
    'doi': { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', direction: 'ltr', script: 'Devanagari' },
    'mni': { code: 'mni', name: 'Meitei', nativeName: 'মৈতৈলোন্', direction: 'ltr', script: 'Bengali' },
    'sat': { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', direction: 'ltr', script: 'Ol Chiki' },
    'ps': { code: 'ps', name: 'Pashto', nativeName: 'پښتو', direction: 'rtl', script: 'Arabic' },
    'bal': { code: 'bal', name: 'Balochi', nativeName: 'بلوچی', direction: 'rtl', script: 'Arabic' },
    'skr': { code: 'skr', name: 'Saraiki', nativeName: 'سرائیکی', direction: 'rtl', script: 'Arabic' },

    // ── African Languages ──────────────────────────────────────────────────────
    'sw': { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', script: 'Latin' },
    'ha': { code: 'ha', name: 'Hausa', nativeName: 'Hausa', direction: 'ltr', script: 'Latin' },
    'yo': { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', direction: 'ltr', script: 'Latin' },
    'ig': { code: 'ig', name: 'Igbo', nativeName: 'Igbo', direction: 'ltr', script: 'Latin' },
    'am': { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr', script: 'Ethiopic' },
    'om': { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', direction: 'ltr', script: 'Latin' },
    'ti': { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', direction: 'ltr', script: 'Ethiopic' },
    'so': { code: 'so', name: 'Somali', nativeName: 'Soomaali', direction: 'ltr', script: 'Latin' },
    'zu': { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', direction: 'ltr', script: 'Latin' },
    'xh': { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', direction: 'ltr', script: 'Latin' },
    'af': { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', direction: 'ltr', script: 'Latin' },
    'st': { code: 'st', name: 'Sotho', nativeName: 'Sesotho', direction: 'ltr', script: 'Latin' },
    'tn': { code: 'tn', name: 'Tswana', nativeName: 'Setswana', direction: 'ltr', script: 'Latin' },
    'ak': { code: 'ak', name: 'Akan', nativeName: 'Akan', direction: 'ltr', script: 'Latin' },
    'ee': { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe', direction: 'ltr', script: 'Latin' },
    'ff': { code: 'ff', name: 'Fulani', nativeName: 'Fulfulde', direction: 'ltr', script: 'Latin' },
    'ber': { code: 'ber', name: 'Berber', nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', direction: 'ltr', script: 'Tifinagh' },

    // ── Southeast Asian Languages ──────────────────────────────────────────────
    'my': { code: 'my', name: 'Burmese', nativeName: 'မြန်မာဘာသာ', direction: 'ltr', script: 'Myanmar' },
    'km': { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', direction: 'ltr', script: 'Khmer' },
    'lo': { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', direction: 'ltr', script: 'Lao' },
    'jv': { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', direction: 'ltr', script: 'Latin' },
    'su': { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', direction: 'ltr', script: 'Latin' },
    'ceb': { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano', direction: 'ltr', script: 'Latin' },
    'ilo': { code: 'ilo', name: 'Ilocano', nativeName: 'Ilokano', direction: 'ltr', script: 'Latin' },
    'hil': { code: 'hil', name: 'Hiligaynon', nativeName: 'Hiligaynon', direction: 'ltr', script: 'Latin' },

    // ── Celtic & Regional European Languages ───────────────────────────────────
    'cy': { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', direction: 'ltr', script: 'Latin' },
    'gd': { code: 'gd', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', direction: 'ltr', script: 'Latin' },
    'ga': { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', direction: 'ltr', script: 'Latin' },
    'eu': { code: 'eu', name: 'Basque', nativeName: 'Euskara', direction: 'ltr', script: 'Latin' },
    'ca': { code: 'ca', name: 'Catalan', nativeName: 'Català', direction: 'ltr', script: 'Latin' },
    'gl': { code: 'gl', name: 'Galician', nativeName: 'Galego', direction: 'ltr', script: 'Latin' },
    'fy': { code: 'fy', name: 'Frisian', nativeName: 'Frysk', direction: 'ltr', script: 'Latin' },
    'lb': { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', direction: 'ltr', script: 'Latin' },
    'mt': { code: 'mt', name: 'Maltese', nativeName: 'Malti', direction: 'ltr', script: 'Latin' },
    'sq': { code: 'sq', name: 'Albanian', nativeName: 'Shqip', direction: 'ltr', script: 'Latin' },
    'bs': { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', direction: 'ltr', script: 'Latin' },
    'mk': { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', direction: 'ltr', script: 'Cyrillic' },
    'be': { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', direction: 'ltr', script: 'Cyrillic' },

    // ── Turkic Languages ───────────────────────────────────────────────────────
    'az': { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', direction: 'ltr', script: 'Latin' },
    'uz': { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek', direction: 'ltr', script: 'Latin' },
    'kk': { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ', direction: 'ltr', script: 'Cyrillic' },
    'ky': { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', direction: 'ltr', script: 'Cyrillic' },
    'tk': { code: 'tk', name: 'Turkmen', nativeName: 'Türkmen', direction: 'ltr', script: 'Latin' },
    'tt': { code: 'tt', name: 'Tatar', nativeName: 'Татарча', direction: 'ltr', script: 'Cyrillic' },
    'ku': { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', direction: 'ltr', script: 'Latin' },

    // ── Indigenous & Other Languages ───────────────────────────────────────────
    'mi': { code: 'mi', name: 'Māori', nativeName: 'Te Reo Māori', direction: 'ltr', script: 'Latin' },
    'sm': { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa', direction: 'ltr', script: 'Latin' },
    'haw': { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', direction: 'ltr', script: 'Latin' },
    'qu': { code: 'qu', name: 'Quechua', nativeName: 'Runasimi', direction: 'ltr', script: 'Latin' },
    'ay': { code: 'ay', name: 'Aymara', nativeName: 'Aymar aru', direction: 'ltr', script: 'Latin' },
    'gn': { code: 'gn', name: 'Guaraní', nativeName: 'Avañeʼẽ', direction: 'ltr', script: 'Latin' },
    'nah': { code: 'nah', name: 'Nahuatl', nativeName: 'Nāhuatl', direction: 'ltr', script: 'Latin' },
    'yi': { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', direction: 'rtl', script: 'Hebrew' },
    'hy': { code: 'hy', name: 'Armenian', nativeName: 'Hayeren', direction: 'ltr', script: 'Armenian' },
    'ka': { code: 'ka', name: 'Georgian', nativeName: 'ქართული', direction: 'ltr', script: 'Georgian' },
    'mn': { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', direction: 'ltr', script: 'Cyrillic' },
};

/** Get all unique language codes across all countries */
export const ALL_LANGUAGE_CODES = [...new Set(COUNTRIES.flatMap(c => c.languages))];

/** Get language display info */
export function getLanguageInfo(code: string): LanguageConfig | undefined {
    return LANGUAGES[code];
}

/** Get native language name */
export function getLanguageNativeName(code: string): string {
    return LANGUAGES[code]?.nativeName || code.toUpperCase();
}

/** Get language direction */
export function getLanguageDirection(code: string): 'ltr' | 'rtl' {
    return LANGUAGES[code]?.direction || 'ltr';
}

/** Check if language is RTL */
export function isRTL(code: string): boolean {
    return LANGUAGES[code]?.direction === 'rtl';
}

/** Get all languages for a country */
export function getCountryLanguages(countrySlug: string): LanguageConfig[] {
    const country = COUNTRIES.find(c => c.slug === countrySlug);
    if (!country) return [];
    return country.languages
        .map(code => LANGUAGES[code])
        .filter((lang): lang is LanguageConfig => lang !== undefined);
}

/** Generate hreflang entries for a country */
export function generateHreflangEntries(countrySlug: string, basePath: string): { lang: string; href: string }[] {
    const country = COUNTRIES.find(c => c.slug === countrySlug);
    if (!country) return [];

    return country.languages.map(langCode => ({
        lang: `${langCode}-${country.code}`,
        href: `/${countrySlug}/${langCode}${basePath}`,
    }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all country slugs */
export const COUNTRY_SLUGS = COUNTRIES.map(c => c.slug);

/** Get countries with cost data */
export const COUNTRIES_WITH_COSTS = COUNTRIES.filter(c => c.hasCostData);

/** Get countries with doctor listings */
export const COUNTRIES_WITH_DOCTORS = COUNTRIES.filter(c => c.hasDoctors);

/** Get medical tourism destination countries */
export const MEDICAL_TOURISM_COUNTRIES = COUNTRIES.filter(c => c.isMedicalTourism);

/** Slug to ISO code mapping */
export const SLUG_TO_CODE: Record<string, string> = Object.fromEntries(
    COUNTRIES.map(c => [c.slug, c.code])
);

/** ISO code to slug mapping */
export const CODE_TO_SLUG: Record<string, string> = Object.fromEntries(
    COUNTRIES.map(c => [c.code, c.slug])
);

/** Slug to currency mapping */
export const SLUG_TO_CURRENCY: Record<string, string> = Object.fromEntries(
    COUNTRIES.map(c => [c.slug, c.currency])
);

/** Slug to currency symbol mapping */
export const SLUG_TO_CURRENCY_SYMBOL: Record<string, string> = Object.fromEntries(
    COUNTRIES.map(c => [c.slug, c.currencySymbol])
);

/** Get country by slug */
export function getCountryBySlug(slug: string): CountryConfig | undefined {
    return COUNTRIES.find(c => c.slug === slug);
}

/** Get country by ISO code */
export function getCountryByCode(code: string): CountryConfig | undefined {
    return COUNTRIES.find(c => c.code === code.toUpperCase());
}

/** Check if a slug is a valid country */
export function isValidCountrySlug(slug: string): boolean {
    return COUNTRY_SLUGS.includes(slug);
}

/** Get default currency for a country, with fallback */
export function getCurrencyForCountry(slug: string, fallback = 'USD'): string {
    return SLUG_TO_CURRENCY[slug] || fallback;
}

/** Get currency symbol for a country */
export function getCurrencySymbol(slug: string, fallback = '$'): string {
    return SLUG_TO_CURRENCY_SYMBOL[slug] || fallback;
}

/** Format price with currency symbol */
export function formatPrice(amount: number, countrySlug: string): string {
    const symbol = getCurrencySymbol(countrySlug);
    return `${symbol}${amount.toLocaleString()}`;
}
