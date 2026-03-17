'use client';

import { useEffect } from 'react';
import { COUNTRY_DISPLAY, TIMEZONE_REGION_MAP } from './ui/navbar/config';

/**
 * Reverse geocoding to get country/city from coordinates
 * Uses free Nominatim API (OpenStreetMap)
 */
async function reverseGeocode(lat: number, lon: number): Promise<{ country: string; city: string | null; countryCode: string } | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'aihealz-medical-directory',
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const address = data.address;

        if (!address) return null;

        const countryCode = address.country_code?.toUpperCase() || '';
        const country = address.country || '';
        const city = address.city || address.town || address.village || address.state || null;

        return { country, city, countryCode };
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return null;
    }
}

/**
 * Country code to slug mapping
 */
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

/**
 * Country slug to default language
 */
const COUNTRY_DEFAULT_LANG: Record<string, string> = {
    'india': 'en',
    'usa': 'en',
    'uk': 'en',
    'uae': 'en',
    'thailand': 'en',
    'mexico': 'es',
    'turkey': 'en',
    'singapore': 'en',
    'australia': 'en',
    'canada': 'en',
    'germany': 'de',
    'france': 'fr',
    'brazil': 'pt',
    'saudi-arabia': 'ar',
    'egypt': 'ar',
    'spain': 'es',
    'japan': 'en',
    'south-korea': 'en',
    'pakistan': 'ur',
    'bangladesh': 'bn',
};

/**
 * GeoAutoDetect Component
 *
 * Automatically detects user location using:
 * 1. Browser Geolocation API (most accurate, requires permission)
 * 2. Timezone detection (fallback, always available)
 *
 * Sets cookies and optionally redirects to country-specific pages.
 */
export default function GeoAutoDetect() {
    useEffect(() => {
        // Check if user has already explicitly selected a country
        const hasExplicitSelection = document.cookie.includes('aihealz-explicit=1');
        if (hasExplicitSelection) {
            return;
        }

        // Check if we've already done auto-detection this session
        const hasAutoDetected = sessionStorage.getItem('aihealz-geo-detected');
        if (hasAutoDetected) {
            return;
        }

        // Check if geo cookie already exists - but only skip if it has real data
        const existingGeo = document.cookie.match(/aihealz-geo=([^;]+)/);
        if (existingGeo && existingGeo[1] && existingGeo[1].length > 2) {
            // Already have valid geo from middleware, don't override
            sessionStorage.setItem('aihealz-geo-detected', '1');
            return;
        }

        const detectLocation = async () => {
            try {
                let detectedCity: string | null = null;
                let detectedCountrySlug: string | null = null;

                // PRIMARY: Try server-side IP geolocation API (most reliable)
                try {
                    const response = await fetch('/api/geo/detect');
                    const data = await response.json();

                    if (data.success && data.countrySlug) {
                        detectedCountrySlug = data.countrySlug;
                        detectedCity = data.city;
                        console.log('IP geolocation detected:', data.countrySlug, data.city);
                    }
                } catch (error) {
                    console.log('IP geolocation API failed, trying fallbacks');
                }

                // FALLBACK 1: Timezone detection (instant, no permission needed)
                if (!detectedCountrySlug) {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const tzRegion = TIMEZONE_REGION_MAP[tz];

                    if (tzRegion) {
                        detectedCity = tzRegion.city;
                        // Find slug from country name
                        detectedCountrySlug = Object.entries(COUNTRY_DISPLAY)
                            .find(([, name]) => name === tzRegion.country)?.[0] || null;
                        console.log('Timezone detection:', detectedCountrySlug, detectedCity);
                    }
                }

                // FALLBACK 2: Browser geolocation (requires permission)
                if ('geolocation' in navigator && !detectedCountrySlug) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, {
                                enableHighAccuracy: false,
                                timeout: 5000,
                                maximumAge: 3600000, // Cache for 1 hour
                            });
                        });

                        const geoData = await reverseGeocode(
                            position.coords.latitude,
                            position.coords.longitude
                        );

                        if (geoData && geoData.countryCode) {
                            detectedCountrySlug = CODE_TO_SLUG[geoData.countryCode] || null;
                            detectedCity = geoData.city;
                        }
                    } catch {
                        // Geolocation failed or denied
                        console.log('Browser geolocation unavailable');
                    }
                }

                // If we detected a country, save it
                if (detectedCountrySlug) {
                    const citySlug = detectedCity
                        ? detectedCity.toLowerCase().replace(/\s+/g, '-')
                        : null;

                    const geoValue = citySlug
                        ? `${detectedCountrySlug}:${citySlug}`
                        : detectedCountrySlug;

                    // Set geo cookie
                    document.cookie = `aihealz-geo=${geoValue}; path=/; max-age=31536000; samesite=lax`;

                    // Set default language for country if not already set
                    const existingLang = document.cookie.match(/aihealz-lang=([^;]+)/);
                    if (!existingLang) {
                        const defaultLang = COUNTRY_DEFAULT_LANG[detectedCountrySlug] || 'en';
                        document.cookie = `aihealz-lang=${defaultLang}; path=/; max-age=31536000; samesite=lax`;
                    }

                    sessionStorage.setItem('aihealz-geo-detected', '1');

                    // Check if we should redirect to a country-specific page
                    const pathname = window.location.pathname;
                    const geoRoutes = ['/conditions', '/treatments', '/tests', '/hospitals'];

                    // Only redirect for geo-specific routes if not already on a country path
                    const isGeoRoute = geoRoutes.some(route => pathname.startsWith(route));
                    const alreadyHasCountry = pathname.split('/').filter(Boolean)[0] === detectedCountrySlug;

                    if (isGeoRoute && !alreadyHasCountry) {
                        // Optionally redirect to localized version
                        // For now, just reload to apply the new geo context
                        // Uncomment below for actual redirect:
                        // const lang = COUNTRY_DEFAULT_LANG[detectedCountrySlug] || 'en';
                        // window.location.href = `/${detectedCountrySlug}/${lang}${pathname}`;

                        // Soft reload to apply new context
                        window.location.reload();
                    }
                }
            } catch (error) {
                console.error('Location detection failed:', error);
            }
        };

        detectLocation();
    }, []);

    // This component doesn't render anything visible
    return null;
}
