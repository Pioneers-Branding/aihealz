'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    COUNTRY_DISPLAY,
    CITY_DISPLAY,
    TIMEZONE_REGION_MAP,
    type Region,
    type NavbarProps,
} from './config';

/**
 * Hook to track scroll position and determine if page is scrolled
 */
export function useScrolled(threshold = 20): boolean {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > threshold);
        };

        // Check initial scroll position
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return scrolled;
}

/**
 * Parse region from geo cookie
 */
function getRegionFromCookie(): Region | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/aihealz-geo=([^;]+)/);
    if (!match) return null;

    try {
        const value = decodeURIComponent(match[1]);

        try {
            const json = JSON.parse(value);
            if (json.country) return json;
        } catch {
            // Not JSON, try colon-separated format
        }

        const parts = value.split(':');
        if (parts.length >= 1 && parts[0]) {
            const countrySlug = parts[0];
            const citySlug = parts[1] || null;

            const country = COUNTRY_DISPLAY[countrySlug] ||
                countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1).replace(/-/g, ' ');
            const city = citySlug
                ? (CITY_DISPLAY[citySlug] || citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, ' '))
                : null;

            return { country, city };
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Hook to manage user region/location
 */
export function useRegion(initialGeo?: NavbarProps['initialGeo']) {
    const [region, setRegion] = useState<Region | null>(() => {
        if (initialGeo?.countrySlug) {
            const country = COUNTRY_DISPLAY[initialGeo.countrySlug] ||
                initialGeo.countrySlug.charAt(0).toUpperCase() + initialGeo.countrySlug.slice(1).replace(/-/g, ' ');
            const city = initialGeo.citySlug
                ? (CITY_DISPLAY[initialGeo.citySlug] || initialGeo.citySlug.charAt(0).toUpperCase() + initialGeo.citySlug.slice(1).replace(/-/g, ' '))
                : null;
            return { country, city };
        }
        return null;
    });

    useEffect(() => {
        // Check if user has explicitly selected a country
        const hasExplicitSelection = document.cookie.includes('aihealz-explicit=1');

        if (initialGeo?.countrySlug) {
            const cookieRegion = getRegionFromCookie();
            if (!cookieRegion && !hasExplicitSelection) {
                const cookieValue = initialGeo.citySlug
                    ? `${initialGeo.countrySlug}:${initialGeo.citySlug}`
                    : initialGeo.countrySlug;
                document.cookie = `aihealz-geo=${cookieValue}; path=/; max-age=31536000; samesite=lax`;
            }
            return;
        }

        // If user has explicit selection, respect it
        if (hasExplicitSelection) {
            const cookieRegion = getRegionFromCookie();
            if (cookieRegion) {
                setRegion(cookieRegion);
            }
            return;
        }

        // Auto-detect from timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzRegion = TIMEZONE_REGION_MAP[tz] || null;
        const cookieRegion = getRegionFromCookie();

        if (tzRegion) {
            if (cookieRegion && cookieRegion.country !== tzRegion.country) {
                setRegion(tzRegion);
                const newCountrySlug = Object.entries(COUNTRY_DISPLAY).find(([, v]) => v === tzRegion.country)?.[0];
                const newCitySlug = tzRegion.city ? Object.entries(CITY_DISPLAY).find(([, v]) => v === tzRegion.city)?.[0] : null;
                if (newCountrySlug) {
                    const cookieValue = newCitySlug ? `${newCountrySlug}:${newCitySlug}` : newCountrySlug;
                    document.cookie = `aihealz-geo=${cookieValue}; path=/; max-age=31536000; samesite=lax`;
                }
            } else if (cookieRegion) {
                setRegion(cookieRegion);
            } else {
                setRegion(tzRegion);
            }
        } else if (cookieRegion) {
            setRegion(cookieRegion);
        }
    }, [initialGeo]);

    const setCountry = useCallback((slug: string) => {
        const name = COUNTRY_DISPLAY[slug];
        if (name) {
            setRegion({ country: name, city: null });
            document.cookie = `aihealz-geo=${slug}; path=/; max-age=31536000; samesite=lax`;
            document.cookie = `aihealz-explicit=1; path=/; max-age=31536000; samesite=lax`;
            document.cookie = `aihealz-country=${slug}; path=/; max-age=31536000; samesite=lax`;
        }
    }, []);

    const regionLabel = region
        ? region.city && region.city !== region.country
            ? `${region.city}, ${region.country}`
            : region.country
        : null;

    return {
        region,
        regionLabel,
        setCountry,
        countrySlug: region ? Object.entries(COUNTRY_DISPLAY).find(([, v]) => v === region.country)?.[0] || '' : '',
    };
}

/**
 * Hook to manage language selection
 */
export function useLanguage(initialLang = 'en') {
    const [currentLang, setCurrentLang] = useState(initialLang);

    const changeLanguage = useCallback((code: string) => {
        document.cookie = `aihealz-lang=${code}; path=/; max-age=31536000; samesite=lax`;
        setCurrentLang(code);
    }, []);

    return {
        currentLang,
        setCurrentLang: changeLanguage,
    };
}

/**
 * Hook to manage dropdown state with click-outside handling
 */
export function useDropdown(initialOpen = false) {
    const [isOpen, setIsOpen] = useState(initialOpen);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    return {
        isOpen,
        open,
        close,
        toggle,
        setIsOpen,
    };
}
