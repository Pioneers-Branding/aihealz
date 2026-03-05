'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { navLinks, type NavbarProps, COUNTRY_DISPLAY } from './config';
import { useScrolled, useRegion, useLanguage, useDropdown } from './hooks';
import { LocationSelector, LanguageSelector } from './location-selector';
import { MobileMenu, HamburgerButton } from './mobile-menu';

export default function Navbar({ initialGeo }: NavbarProps = {}) {
    const scrolled = useScrolled();
    const { region, regionLabel, setCountry, countrySlug } = useRegion(initialGeo);
    const { currentLang, setCurrentLang } = useLanguage(initialGeo?.lang);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const countryDropdown = useDropdown();
    const languageDropdown = useDropdown();

    const handleCountryToggle = () => {
        countryDropdown.toggle();
        languageDropdown.close();
    };

    const handleLanguageToggle = () => {
        languageDropdown.toggle();
        countryDropdown.close();
    };

    const handleMobileCountryChange = (slug: string) => {
        const name = COUNTRY_DISPLAY[slug];
        if (name) {
            setCountry(slug);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-[#050B14]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/10'
                    : 'bg-transparent border-b border-transparent'
            }`}
            aria-label="Main navigation"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline group flex-shrink-0">
                    <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300 transform group-hover:scale-105">
                        <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12h6M12 9v6" />
                        </svg>
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-white tracking-tight">aihealz</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-3 xl:px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-200 no-underline"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Location Selector */}
                    <LocationSelector
                        isOpen={countryDropdown.isOpen}
                        onToggle={handleCountryToggle}
                        onClose={countryDropdown.close}
                        regionLabel={regionLabel}
                        selectedCountry={countrySlug}
                        onSelectCountry={setCountry}
                    />

                    {/* Language Selector */}
                    <LanguageSelector
                        isOpen={languageDropdown.isOpen}
                        onToggle={handleLanguageToggle}
                        onClose={languageDropdown.close}
                        currentLang={currentLang}
                        onSelectLanguage={setCurrentLang}
                    />

                    {/* CTA Button */}
                    <Link
                        href="/analyze"
                        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 no-underline"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                        <span className="hidden xl:inline">AI Analysis</span>
                        <span className="xl:hidden">Analyze</span>
                    </Link>

                    {/* Mobile Hamburger */}
                    <HamburgerButton isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
                </div>
            </div>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                currentLang={currentLang}
                onLanguageChange={setCurrentLang}
                selectedCountrySlug={countrySlug}
                onCountryChange={handleMobileCountryChange}
            />
        </nav>
    );
}

// Re-export types and config
export * from './config';
export * from './hooks';
