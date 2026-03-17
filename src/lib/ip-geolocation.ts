/**
 * IP-based Geolocation Service
 *
 * Fallback for when Cloudflare/Vercel headers aren't available.
 * Uses free ip-api.com service (limited to 45 requests/minute from same IP)
 */

interface GeoResult {
    countryCode: string | null;
    countryName: string | null;
    city: string | null;
    region: string | null;
    timezone: string | null;
}

// Country code to slug mapping
const CODE_TO_SLUG: Record<string, string> = {
    'IN': 'india',
    'US': 'usa',
    'GB': 'uk',
    'AE': 'uae',
    'TH': 'thailand',
    'MX': 'mexico',
    'TR': 'turkey',
    'SG': 'singapore',
    'AU': 'australia',
    'CA': 'canada',
    'DE': 'germany',
    'FR': 'france',
    'BR': 'brazil',
    'SA': 'saudi-arabia',
    'EG': 'egypt',
    'NG': 'nigeria',
    'ZA': 'south-africa',
    'KE': 'kenya',
    'MY': 'malaysia',
    'ES': 'spain',
    'JP': 'japan',
    'KR': 'south-korea',
    'ID': 'indonesia',
    'PH': 'philippines',
    'PK': 'pakistan',
    'BD': 'bangladesh',
    'VN': 'vietnam',
    'RU': 'russia',
    'IT': 'italy',
    'NL': 'netherlands',
    'PL': 'poland',
    'NZ': 'new-zealand',
    'IE': 'ireland',
    'IL': 'israel',
    'SE': 'sweden',
    'CH': 'switzerland',
    'AT': 'austria',
    'BE': 'belgium',
    'PT': 'portugal',
    'GR': 'greece',
    'AR': 'argentina',
    'CO': 'colombia',
    'CL': 'chile',
    'PE': 'peru',
    'MA': 'morocco',
    'GH': 'ghana',
    'TZ': 'tanzania',
    'ET': 'ethiopia',
    'LK': 'sri-lanka',
    'NP': 'nepal',
    'QA': 'qatar',
    'KW': 'kuwait',
    'OM': 'oman',
    'BH': 'bahrain',
};

// Simple in-memory cache to avoid rate limits
const geoCache = new Map<string, { data: GeoResult; expires: number }>();
const CACHE_TTL = 3600000; // 1 hour

/**
 * Get geolocation from IP address using free ip-api.com
 */
export async function getGeoFromIP(ip: string): Promise<GeoResult> {
    // Check cache first
    const cached = geoCache.get(ip);
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }

    // Skip local/private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { countryCode: null, countryName: null, city: null, region: null, timezone: null };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,country,city,regionName,timezone`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return { countryCode: null, countryName: null, city: null, region: null, timezone: null };
        }

        const data = await response.json();

        if (data.status !== 'success') {
            return { countryCode: null, countryName: null, city: null, region: null, timezone: null };
        }

        const result: GeoResult = {
            countryCode: data.countryCode || null,
            countryName: data.country || null,
            city: data.city || null,
            region: data.regionName || null,
            timezone: data.timezone || null,
        };

        // Cache the result
        geoCache.set(ip, { data: result, expires: Date.now() + CACHE_TTL });

        return result;
    } catch (error) {
        console.error('IP geolocation failed:', error);
        return { countryCode: null, countryName: null, city: null, region: null, timezone: null };
    }
}

/**
 * Get country slug from country code
 */
export function getCountrySlug(countryCode: string | null): string | null {
    if (!countryCode) return null;
    return CODE_TO_SLUG[countryCode.toUpperCase()] || null;
}

/**
 * Get city slug from city name
 */
export function getCitySlug(city: string | null): string | null {
    if (!city) return null;
    return city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
