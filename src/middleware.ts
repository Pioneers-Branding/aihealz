import { NextRequest, NextResponse } from 'next/server';
import { CODE_TO_SLUG, COUNTRIES } from './lib/countries';

/**
 * Edge Middleware — Geospatial Intelligence
 *
 * Runs on EVERY request at the edge. Detects user location and language,
 * sets cookies for session persistence, and injects geo-context headers
 * so downstream components know the user's locale.
 *
 * Detection priority:
 * 1. Explicit URL path (e.g. /india/hi/back-pain/delhi)
 * 2. Stored cookie preference (aihealz-geo, aihealz-lang)
 * 3. Platform geo headers (Vercel: x-vercel-ip-*, Cloudflare: cf-ipcountry)
 * 4. Accept-Language header
 * 5. Default: en, global
 */

// Country code → slug mapping (from unified config)
const COUNTRY_SLUGS: Record<string, string> = CODE_TO_SLUG;

// Country → default language (from unified config - use first language)
const COUNTRY_DEFAULT_LANG: Record<string, string> = Object.fromEntries(
    COUNTRIES.map(c => [c.code, c.languages[0]])
);

// Indian city/region → regional language code
const INDIAN_CITY_LANG: Record<string, string> = {
    // Hindi belt (North / Central India)
    'delhi': 'hi', 'new-delhi': 'hi', 'new delhi': 'hi',
    'noida': 'hi', 'gurgaon': 'hi', 'gurugram': 'hi', 'faridabad': 'hi', 'ghaziabad': 'hi',
    'lucknow': 'hi', 'kanpur': 'hi', 'varanasi': 'hi', 'agra': 'hi', 'prayagraj': 'hi',
    'jaipur': 'hi', 'jodhpur': 'hi', 'udaipur': 'hi',
    'bhopal': 'hi', 'indore': 'hi',
    'patna': 'hi', 'ranchi': 'hi',
    'dehradun': 'hi', 'haridwar': 'hi',
    // Tamil (Tamil Nadu)
    'chennai': 'ta', 'coimbatore': 'ta', 'madurai': 'ta', 'salem': 'ta', 'tiruchirappalli': 'ta', 'tirunelveli': 'ta',
    // Marathi (Maharashtra)
    'mumbai': 'mr', 'pune': 'mr', 'nagpur': 'mr', 'nashik': 'mr', 'aurangabad': 'mr', 'thane': 'mr', 'navi mumbai': 'mr',
    // Kannada (Karnataka)
    'bangalore': 'kn', 'bengaluru': 'kn', 'mysore': 'kn', 'mysuru': 'kn', 'mangalore': 'kn', 'hubli': 'kn',
    // Bengali (West Bengal)
    'kolkata': 'bn', 'howrah': 'bn', 'durgapur': 'bn', 'siliguri': 'bn',
    // Gujarati (Gujarat)
    'ahmedabad': 'gu', 'surat': 'gu', 'vadodara': 'gu', 'rajkot': 'gu',
    // Telugu (Andhra Pradesh / Telangana)
    'hyderabad': 'te', 'secunderabad': 'te', 'visakhapatnam': 'te', 'vijayawada': 'te', 'tirupati': 'te',
    // Malayalam (Kerala)
    'kochi': 'ml', 'thiruvananthapuram': 'ml', 'kozhikode': 'ml', 'thrissur': 'ml',
    // Punjabi (Punjab)
    'chandigarh': 'pa', 'amritsar': 'pa', 'ludhiana': 'pa', 'jalandhar': 'pa',
};

// Language code → display info
const LANG_DISPLAY: Record<string, { name: string; nativeName: string }> = {
    'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
    'ta': { name: 'Tamil', nativeName: 'தமிழ்' },
    'mr': { name: 'Marathi', nativeName: 'मराठी' },
    'kn': { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    'bn': { name: 'Bengali', nativeName: 'বাংলা' },
    'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી' },
    'te': { name: 'Telugu', nativeName: 'తెలుగు' },
    'ml': { name: 'Malayalam', nativeName: 'മലയാളം' },
    'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
};

// Paths to SKIP middleware entirely
const SKIP_PATHS = [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap',
    '/admin/',
];

// Routes that start with these are NOT geo-prefixed (they use standard routing)
// Geo-prefixed routes are at /{country}/{lang}/{content-slug}
const NON_GEO_ROUTES = [
    'doctor',
    'doctors',
    'insurance',
    'diagnostic-labs',
    'symptoms',
    'tools',
    'analyze',
    'about',
    'contact',
    'privacy',
    'terms',
    'for-doctors',
    'advertise',
    'medical-travel',
    'book',
    'vault',
    'chat',
    'healz-ai',
    'provider',
    'clinical-reference',
    'reference',
    'pricing',
    'remedies',
    'conditions',    // /conditions/[specialty] is non-geo, individual conditions are at /{country}/{lang}/{slug}
    'treatments',    // /treatments listing page
    'tests',         // /tests listing page
    'hospitals',     // /hospitals listing page
];

// Valid country slugs (must match for geo URL detection)
const VALID_COUNTRY_SLUGS = new Set([
    'india', 'usa', 'uk', 'uae', 'thailand', 'mexico', 'turkey', 'singapore',
    'australia', 'canada', 'germany', 'france', 'brazil', 'saudi-arabia', 'egypt',
    'nigeria', 'south-africa', 'kenya', 'malaysia', 'spain', 'japan', 'south-korea',
    'indonesia', 'philippines', 'pakistan', 'bangladesh', 'vietnam', 'russia',
    'italy', 'netherlands', 'poland', 'new-zealand', 'ireland', 'israel', 'sweden',
    'switzerland', 'austria', 'belgium', 'portugal', 'greece', 'argentina', 'colombia',
    'chile', 'peru', 'morocco', 'ghana', 'tanzania', 'ethiopia', 'sri-lanka', 'nepal',
    'qatar', 'kuwait', 'oman', 'bahrain',
]);

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Skip static/API routes ────────────────────────
    if (SKIP_PATHS.some((p) => pathname.startsWith(p)) || pathname.includes('.')) {
        return NextResponse.next();
    }

    // ── 1. Extract geo from URL if present ────────────
    const urlSegments = pathname.split('/').filter(Boolean);
    const firstSegment = urlSegments[0]?.toLowerCase();

    // Check if this is a standard route (not geo-prefixed)
    const isNonGeoRoute = firstSegment && NON_GEO_ROUTES.includes(firstSegment);

    // ── Handle geo-prefixed standard routes → redirect to standard route ──
    // e.g., /india/en/doctors → /doctors, /india/en/hospitals → /hospitals
    if (!isNonGeoRoute && urlSegments.length >= 3) {
        const thirdSegment = urlSegments[2]?.toLowerCase();
        if (thirdSegment && NON_GEO_ROUTES.includes(thirdSegment)) {
            // This is a geo-prefixed standard route - redirect to standard route
            const remainingPath = urlSegments.slice(2).join('/');
            const redirectUrl = new URL(`/${remainingPath}`, request.url);
            // Preserve query params
            redirectUrl.search = request.nextUrl.search;
            return NextResponse.redirect(redirectUrl, 301);
        }
    }

    // Only treat as geo URL if:
    // 1. NOT a standard route
    // 2. Has at least 2 segments
    // 3. First segment is a VALID country slug (prevents /conditions/diabetes being misinterpreted)
    const hasGeoInUrl = !isNonGeoRoute &&
        urlSegments.length >= 2 &&
        VALID_COUNTRY_SLUGS.has(firstSegment); // e.g. /india/en/...

    // ── 2. Detect country from headers ────────────────
    const cfCountry = request.headers.get('cf-ipcountry');
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    const vercelCity = request.headers.get('x-vercel-ip-city');
    const detectedCountryCode = cfCountry || vercelCountry || null;

    // ── 3. Read cookie preferences ────────────────────
    const cookieGeo = request.cookies.get('aihealz-geo')?.value;    // e.g. "india:delhi:saket"
    const cookieLang = request.cookies.get('aihealz-lang')?.value;  // e.g. "hi"
    const cookieExplicit = request.cookies.get('aihealz-explicit')?.value;  // "1" if user explicitly selected
    const cookieGeoRedirect = request.cookies.get('aihealz-geo-redirect')?.value;  // Prevents redirect loops

    // ── 3b. Fallback: Detect from Accept-Language header ─────────
    // When platform headers aren't available, use Accept-Language as a hint
    const acceptLanguage = request.headers.get('accept-language') || '';
    let languageHintCountry: string | null = null;

    // Map language preferences to likely countries
    const langToCountryHint: Record<string, string> = {
        'en-US': 'US', 'en-GB': 'GB', 'en-AU': 'AU', 'en-CA': 'CA', 'en-IN': 'IN',
        'hi': 'IN', 'ta': 'IN', 'te': 'IN', 'kn': 'IN', 'ml': 'IN', 'mr': 'IN', 'gu': 'IN', 'bn': 'IN', 'pa': 'IN',
        'ar-AE': 'AE', 'ar-SA': 'SA', 'ar-EG': 'EG',
        'de-DE': 'DE', 'de': 'DE',
        'fr-FR': 'FR', 'fr-CA': 'CA', 'fr': 'FR',
        'es-ES': 'ES', 'es-MX': 'MX', 'es': 'ES',
        'pt-BR': 'BR', 'pt': 'BR',
        'ja': 'JP', 'ko': 'KR', 'zh': 'CN', 'th': 'TH',
        'ms': 'MY', 'id': 'ID', 'vi': 'VN', 'tl': 'PH',
        'sw': 'KE', 'zu': 'ZA', 'af': 'ZA',
        'ur': 'PK', 'bn-BD': 'BD',
        'tr': 'TR', 'ru': 'RU',
    };

    // Parse Accept-Language to find best match
    const langParts = acceptLanguage.split(',').map(l => l.split(';')[0].trim());
    for (const langPart of langParts) {
        if (langToCountryHint[langPart]) {
            languageHintCountry = langToCountryHint[langPart];
            break;
        }
        // Try just the language code (e.g., "en" from "en-US")
        const baseLang = langPart.split('-')[0];
        if (langToCountryHint[baseLang]) {
            languageHintCountry = langToCountryHint[baseLang];
            break;
        }
    }

    // ── 4. Determine effective geo context ────────────
    let countrySlug: string | null = null;
    let citySlug: string | null = null;
    let lang: string = 'en';
    let regionalLang: string | null = null; // secondary language for the region
    let shouldUpdateGeoCookie = false; // Track if we need to refresh the cookie

    // Check if user has explicitly selected a country (don't override their choice)
    const hasExplicitSelection = cookieExplicit === '1';

    // Use the best available country detection
    const effectiveCountryCode = detectedCountryCode || languageHintCountry;

    if (hasGeoInUrl) {
        // Explicit URL path takes highest priority
        countrySlug = urlSegments[0];
        lang = urlSegments[1] || cookieLang || 'en';
    } else if (hasExplicitSelection && cookieGeo) {
        // User has explicitly selected a country - ALWAYS respect their choice
        const parts = cookieGeo.split(':');
        countrySlug = parts[0] || null;
        citySlug = parts[1] || null;
        lang = cookieLang || 'en';
        // Never update cookie when user has explicit selection
    } else if (effectiveCountryCode) {
        // Platform detection OR language hint - only if no explicit selection
        const detectedSlug = COUNTRY_SLUGS[effectiveCountryCode] || null;
        const detectedCity = vercelCity ? vercelCity.toLowerCase().replace(/\s+/g, '-') : null;

        if (cookieGeo) {
            const cookieParts = cookieGeo.split(':');
            const cookieCountry = cookieParts[0] || null;

            // If detected country differs from cookie, update to detected location
            // (only when user hasn't made explicit selection)
            if (detectedSlug && cookieCountry !== detectedSlug) {
                countrySlug = detectedSlug;
                citySlug = detectedCity;
                lang = COUNTRY_DEFAULT_LANG[effectiveCountryCode] || 'en';
                shouldUpdateGeoCookie = true; // Auto-detected new location
            } else {
                // Same country - keep cookie data (might have more specific city)
                countrySlug = cookieCountry;
                citySlug = cookieParts[1] || detectedCity;
                lang = cookieLang || 'en';
            }
        } else {
            // No cookie - use detection
            countrySlug = detectedSlug;
            citySlug = detectedCity;
            lang = COUNTRY_DEFAULT_LANG[effectiveCountryCode] || 'en';
            shouldUpdateGeoCookie = true;
        }
    } else if (cookieGeo && !hasExplicitSelection) {
        // Fallback to cookie - but if no detection available and no explicit selection,
        // mark for client-side timezone detection to take over
        const parts = cookieGeo.split(':');
        countrySlug = parts[0] || null;
        citySlug = parts[1] || null;
        lang = cookieLang || 'en';
        // Set header to trigger client-side timezone detection
        // Client will use timezone API which is more accurate for geolocation
    } else if (cookieGeo) {
        // Has explicit selection - use cookie
        const parts = cookieGeo.split(':');
        countrySlug = parts[0] || null;
        citySlug = parts[1] || null;
        lang = cookieLang || 'en';
    }

    // ── 4b. Detect regional language for India ────────
    if (detectedCountryCode === 'IN' || countrySlug === 'india') {
        const cityKey = citySlug || (vercelCity ? vercelCity.toLowerCase().replace(/\s+/g, '-') : '');
        if (cityKey && INDIAN_CITY_LANG[cityKey]) {
            regionalLang = INDIAN_CITY_LANG[cityKey];
        }
    }

    // ── 5. Build response with geo headers ────────────
    const requestHeaders = new Headers(request.headers);

    // Inject geo context as custom headers (readable by server components)
    if (countrySlug) {
        requestHeaders.set('x-aihealz-country', countrySlug);
    }
    if (citySlug) {
        requestHeaders.set('x-aihealz-city', citySlug);
    }
    requestHeaders.set('x-aihealz-lang', lang);

    // Regional language for bilingual display
    if (regionalLang) {
        requestHeaders.set('x-aihealz-regional-lang', regionalLang);
        const display = LANG_DISPLAY[regionalLang];
        if (display) {
            // URL encode the display text since HTTP headers must be ASCII
            requestHeaders.set('x-aihealz-regional-display', encodeURIComponent(`${display.name}|${display.nativeName}`));
        }
    }

    if (detectedCountryCode) {
        requestHeaders.set('x-aihealz-country-code', detectedCountryCode);
    }

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // ── 6. Set/refresh cookies ────────────────────────
    const ONE_YEAR = 365 * 24 * 60 * 60;

    // Geo cookie - set if new or if location changed
    if (countrySlug && (!cookieGeo || shouldUpdateGeoCookie)) {
        const geoValue = [countrySlug, citySlug].filter(Boolean).join(':');
        response.cookies.set('aihealz-geo', geoValue, {
            maxAge: ONE_YEAR,
            path: '/',
            sameSite: 'lax',
            httpOnly: false, // Client JS needs to read this for footer
        });
    }

    // Language cookie — set if from URL or detection, refresh if existing
    if (hasGeoInUrl && urlSegments[1]) {
        // User explicitly chose a language via URL
        response.cookies.set('aihealz-lang', urlSegments[1], {
            maxAge: ONE_YEAR,
            path: '/',
            sameSite: 'lax',
            httpOnly: false,
        });
    } else if (!cookieLang && lang !== 'en') {
        // First visit, non-English detected
        response.cookies.set('aihealz-lang', lang, {
            maxAge: ONE_YEAR,
            path: '/',
            sameSite: 'lax',
            httpOnly: false,
        });
    }

    // NOTE: Auto-redirect for geo routes removed - these pages now use standard routing
    // Individual conditions/treatments are at /{country}/{lang}/{slug} but listing pages
    // like /conditions, /conditions/cardiology use standard routing with geo context headers

    // Homepage: just set context headers (no redirect)
    if (pathname === '/' && countrySlug && !hasGeoInUrl) {
        // Don't hard-redirect — just set context headers
        // The homepage component reads these to show localized content
        // This prevents jarring redirects on first visit
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
