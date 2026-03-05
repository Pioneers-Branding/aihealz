'use client';

import React from 'react';
import { COUNTRY_DISPLAY, LANGUAGE_DISPLAY } from './config';

interface LocationSelectorProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    regionLabel: string | null;
    selectedCountry: string;
    onSelectCountry: (slug: string) => void;
}

export function LocationSelector({
    isOpen,
    onToggle,
    onClose,
    regionLabel,
    selectedCountry,
    onSelectCountry,
}: LocationSelectorProps) {
    const selectedCountryName = COUNTRY_DISPLAY[selectedCountry];

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg border border-white/[0.08] text-xs font-medium text-slate-400 hover:text-white transition-all duration-200"
                aria-label="Change location"
                aria-expanded={isOpen}
            >
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline max-w-[100px] truncate">{regionLabel || 'Location'}</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f172a] rounded-xl border border-white/[0.1] shadow-2xl z-50 py-2 max-h-80 overflow-auto animate-scale-in">
                        <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Select Country
                        </p>
                        {Object.entries(COUNTRY_DISPLAY).map(([slug, name]) => (
                            <button
                                key={slug}
                                onClick={() => {
                                    onSelectCountry(slug);
                                    window.location.reload();
                                }}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                    selectedCountryName === name
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                                }`}
                            >
                                {name}
                                {selectedCountryName === name && (
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

interface LanguageSelectorProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    currentLang: string;
    onSelectLanguage: (code: string) => void;
}

export function LanguageSelector({
    isOpen,
    onToggle,
    onClose,
    currentLang,
    onSelectLanguage,
}: LanguageSelectorProps) {
    const handleSelect = (code: string) => {
        onSelectLanguage(code);
        onClose();

        // Check if current URL has language in path
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        if (segments.length >= 2) {
            const possibleLang = segments[1];
            const allLangCodes = Object.keys(LANGUAGE_DISPLAY);
            if (allLangCodes.includes(possibleLang)) {
                segments[1] = code;
                const newPath = '/' + segments.join('/');
                window.location.href = newPath + window.location.search;
                return;
            }
        }
        window.location.reload();
    };

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg border border-white/[0.08] text-xs font-medium text-slate-400 hover:text-white transition-all duration-200"
                aria-label="Change language"
                aria-expanded={isOpen}
            >
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{LANGUAGE_DISPLAY[currentLang]?.nativeName || 'EN'}</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onClose} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f172a] rounded-xl border border-white/[0.1] shadow-2xl z-50 py-2 max-h-80 overflow-auto animate-scale-in">
                        <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Select Language
                        </p>
                        {Object.entries(LANGUAGE_DISPLAY).map(([code, lang]) => (
                            <button
                                key={code}
                                onClick={() => handleSelect(code)}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                    currentLang === code
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                                }`}
                            >
                                <span>{lang.name}</span>
                                {currentLang === code && (
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
