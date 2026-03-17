'use client';

import React from 'react';
import Link from 'next/link';
import { navLinks, COUNTRY_DISPLAY, LANGUAGE_DISPLAY } from './config';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentLang: string;
    onLanguageChange: (code: string) => void;
    selectedCountrySlug: string;
    onCountryChange: (slug: string) => void;
}

export function MobileMenu({
    isOpen,
    onClose,
    currentLang,
    onLanguageChange,
    selectedCountrySlug,
    onCountryChange,
}: MobileMenuProps) {
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        onLanguageChange(code);

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

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onCountryChange(e.target.value);
    };

    const selectStyle = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '16px',
    };

    return (
        <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
            <div className="bg-[#0a1628]/98 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4 space-y-1">
                {/* Mobile Location Selector */}
                <div className="mb-4 pb-4 border-b border-white/[0.06]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                        Your Location
                    </label>
                    <select
                        value={selectedCountrySlug}
                        onChange={handleCountryChange}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 appearance-none cursor-pointer"
                        style={selectStyle}
                    >
                        <option value="" className="bg-[#0f172a] text-slate-300">
                            Select your country
                        </option>
                        {Object.entries(COUNTRY_DISPLAY).map(([slug, name]) => (
                            <option key={slug} value={slug} className="bg-[#0f172a] text-white">
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mobile Language Selector */}
                <div className="mb-4 pb-4 border-b border-white/[0.06]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                        Language
                    </label>
                    <select
                        value={currentLang}
                        onChange={handleLanguageChange}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 appearance-none cursor-pointer"
                        style={selectStyle}
                    >
                        {Object.entries(LANGUAGE_DISPLAY).map(([code, lang]) => (
                            <option key={code} value={code} className="bg-[#0f172a] text-white">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mobile Nav Links */}
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-3 py-3 px-4 text-slate-300 hover:text-white hover:bg-white/[0.05] rounded-xl font-medium transition-all duration-200 no-underline"
                    >
                        {link.label}
                    </Link>
                ))}

                {/* Mobile CTA */}
                <Link
                    href="/analyze"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 mt-4 py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-center no-underline shadow-lg shadow-cyan-500/20"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                    AI Report Analysis
                </Link>
            </div>
        </div>
    );
}

interface HamburgerButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
        >
            <div className="w-5 h-4 flex flex-col justify-between">
                <span
                    className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 origin-center ${
                        isOpen ? 'rotate-45 translate-y-[7px]' : ''
                    }`}
                />
                <span
                    className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 ${
                        isOpen ? 'opacity-0 scale-0' : ''
                    }`}
                />
                <span
                    className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 origin-center ${
                        isOpen ? '-rotate-45 -translate-y-[7px]' : ''
                    }`}
                />
            </div>
        </button>
    );
}
