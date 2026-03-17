'use client';

/**
 * Language Switcher — Minimal, elegant text toggle
 *
 * Renders: EN | ES | HI | AR
 * No flags, no icons — just clean text with subtle active state.
 */

import { usePathname } from 'next/navigation';

interface Props {
    currentLang: string;
    availableLanguages: Array<{ code: string; label: string }>;
}

const DEFAULT_LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'hi', label: 'HI' },
    { code: 'ar', label: 'AR' },
    { code: 'pt', label: 'PT' },
    { code: 'fr', label: 'FR' },
    { code: 'sw', label: 'SW' },
];

export default function LanguageSwitcher({
    currentLang = 'en',
    availableLanguages = DEFAULT_LANGUAGES,
}: Props) {
    const pathname = usePathname();

    function buildLocalizedPath(langCode: string): string {
        // If current path has a language prefix, replace it
        const segments = pathname.split('/').filter(Boolean);
        const firstIsLang = availableLanguages.some((l) => l.code === segments[0]);

        if (langCode === 'en') {
            // English is default — no prefix
            return firstIsLang ? `/${segments.slice(1).join('/')}` : pathname;
        }

        if (firstIsLang) {
            return `/${langCode}/${segments.slice(1).join('/')}`;
        }
        return `/${langCode}${pathname}`;
    }

    return (
        <div className="flex items-center gap-0.5 text-xs" role="navigation" aria-label="Language selection">
            {availableLanguages.map((lang, i) => (
                <span key={lang.code} className="flex items-center">
                    {i > 0 && <span className="text-surface-100/15 mx-1.5">|</span>}
                    <a
                        href={buildLocalizedPath(lang.code)}
                        hrefLang={lang.code}
                        className={`px-1 py-0.5 rounded transition-all ${currentLang === lang.code
                                ? 'text-primary-300 font-semibold'
                                : 'text-surface-100/30 hover:text-surface-100/60'
                            }`}
                        aria-current={currentLang === lang.code ? 'true' : undefined}
                    >
                        {lang.label}
                    </a>
                </span>
            ))}
        </div>
    );
}
