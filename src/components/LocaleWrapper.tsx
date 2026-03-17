'use client';

import { useEffect } from 'react';
import { isRTL, getLanguageConfig } from '@/lib/i18n';

interface LocaleWrapperProps {
    lang: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * LocaleWrapper Component
 *
 * Wraps content with proper RTL/LTR direction and language attributes.
 * Also dynamically loads appropriate Google Fonts for non-Latin scripts.
 */
export default function LocaleWrapper({ lang, children, className = '' }: LocaleWrapperProps) {
    const config = getLanguageConfig(lang);
    const dir = config.dir;

    useEffect(() => {
        // Set document direction and language
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;

        // Load Google Font if needed
        if (config.googleFontFamily) {
            const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.googleFontFamily)}:wght@400;500;600;700&display=swap`;
            const existingLink = document.querySelector(`link[href*="${config.googleFontFamily.replace(/\s+/g, '+')}"]`);

            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = fontUrl;
                document.head.appendChild(link);
            }
        }

        return () => {
            // Reset to LTR on unmount (optional - depends on app structure)
            // document.documentElement.dir = 'ltr';
        };
    }, [lang, dir, config.googleFontFamily]);

    return (
        <div
            dir={dir}
            lang={lang}
            className={`${className} ${dir === 'rtl' ? 'font-rtl' : ''}`}
        >
            {children}
        </div>
    );
}

/**
 * RTL-aware icon component
 * Flips icons that indicate direction (arrows, chevrons) in RTL mode
 */
export function DirectionalIcon({
    children,
    flip = true,
    className = '',
}: {
    children: React.ReactNode;
    flip?: boolean;
    className?: string;
}) {
    return (
        <span className={`inline-flex ${flip ? 'rtl-flip' : ''} ${className}`}>
            {children}
        </span>
    );
}

/**
 * RTL-aware flex container
 * Automatically reverses flex direction in RTL mode
 */
export function RTLFlex({
    children,
    className = '',
    reverse = true,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { reverse?: boolean }) {
    return (
        <div
            className={`flex ${reverse ? 'rtl:flex-row-reverse' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
