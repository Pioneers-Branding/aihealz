'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect media query matches
 *
 * @example
 * ```tsx
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
}

/**
 * Tailwind breakpoints
 */
const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect Tailwind breakpoint matches
 *
 * @example
 * ```tsx
 * const { isSmall, isMedium, isLarge, current } = useBreakpoint();
 * ```
 */
export function useBreakpoint() {
    const sm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
    const md = useMediaQuery(`(min-width: ${breakpoints.md})`);
    const lg = useMediaQuery(`(min-width: ${breakpoints.lg})`);
    const xl = useMediaQuery(`(min-width: ${breakpoints.xl})`);
    const xxl = useMediaQuery(`(min-width: ${breakpoints['2xl']})`);

    // Determine current breakpoint
    let current: Breakpoint | 'xs' = 'xs';
    if (xxl) current = '2xl';
    else if (xl) current = 'xl';
    else if (lg) current = 'lg';
    else if (md) current = 'md';
    else if (sm) current = 'sm';

    return {
        isSmall: sm,
        isMedium: md,
        isLarge: lg,
        isXLarge: xl,
        is2XLarge: xxl,
        isMobile: !md,
        isTablet: md && !lg,
        isDesktop: lg,
        current,
        // Helper checks
        isAtLeast: (bp: Breakpoint): boolean => {
            switch (bp) {
                case 'sm': return sm;
                case 'md': return md;
                case 'lg': return lg;
                case 'xl': return xl;
                case '2xl': return xxl;
                default: return false;
            }
        },
        isAtMost: (bp: Breakpoint): boolean => {
            switch (bp) {
                case 'sm': return !md;
                case 'md': return !lg;
                case 'lg': return !xl;
                case 'xl': return !xxl;
                case '2xl': return true;
                default: return true;
            }
        },
    };
}
