'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

// Language configuration
const LANGUAGES: Record<string, { name: string; nativeName: string }> = {
    'en': { name: 'English', nativeName: 'English' },
    'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
    'ta': { name: 'Tamil', nativeName: 'தமிழ்' },
    'te': { name: 'Telugu', nativeName: 'తెలుగు' },
    'kn': { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    'ml': { name: 'Malayalam', nativeName: 'മലയാളം' },
    'mr': { name: 'Marathi', nativeName: 'मराठी' },
    'bn': { name: 'Bengali', nativeName: 'বাংলা' },
    'gu': { name: 'Gujarati', nativeName: 'ગુજરાতી' },
    'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    'ur': { name: 'Urdu', nativeName: 'اردو' },
    'ar': { name: 'Arabic', nativeName: 'العربية' },
    'es': { name: 'Spanish', nativeName: 'Español' },
    'fr': { name: 'French', nativeName: 'Français' },
    'pt': { name: 'Portuguese', nativeName: 'Português' },
    'de': { name: 'German', nativeName: 'Deutsch' },
    'ja': { name: 'Japanese', nativeName: '日本語' },
    'ko': { name: 'Korean', nativeName: '한국어' },
    'zh': { name: 'Chinese', nativeName: '中文' },
    'th': { name: 'Thai', nativeName: 'ไทย' },
    'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    'id': { name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    'ms': { name: 'Malay', nativeName: 'Bahasa Melayu' },
    'sw': { name: 'Swahili', nativeName: 'Kiswahili' },
    'tr': { name: 'Turkish', nativeName: 'Türkçe' },
    'ru': { name: 'Russian', nativeName: 'Русский' },
    'nl': { name: 'Dutch', nativeName: 'Nederlands' },
    'pl': { name: 'Polish', nativeName: 'Polski' },
    'it': { name: 'Italian', nativeName: 'Italiano' },
};

// Country configuration with regions
const COUNTRIES: Record<string, { name: string; region: string }> = {
    // South Asia
    'india': { name: 'India', region: 'South Asia' },
    'pakistan': { name: 'Pakistan', region: 'South Asia' },
    'bangladesh': { name: 'Bangladesh', region: 'South Asia' },
    'sri-lanka': { name: 'Sri Lanka', region: 'South Asia' },
    'nepal': { name: 'Nepal', region: 'South Asia' },
    // Middle East
    'uae': { name: 'UAE', region: 'Middle East' },
    'saudi-arabia': { name: 'Saudi Arabia', region: 'Middle East' },
    'qatar': { name: 'Qatar', region: 'Middle East' },
    'kuwait': { name: 'Kuwait', region: 'Middle East' },
    'oman': { name: 'Oman', region: 'Middle East' },
    'bahrain': { name: 'Bahrain', region: 'Middle East' },
    'israel': { name: 'Israel', region: 'Middle East' },
    'turkey': { name: 'Turkey', region: 'Middle East' },
    // Southeast Asia
    'singapore': { name: 'Singapore', region: 'Southeast Asia' },
    'malaysia': { name: 'Malaysia', region: 'Southeast Asia' },
    'thailand': { name: 'Thailand', region: 'Southeast Asia' },
    'indonesia': { name: 'Indonesia', region: 'Southeast Asia' },
    'philippines': { name: 'Philippines', region: 'Southeast Asia' },
    'vietnam': { name: 'Vietnam', region: 'Southeast Asia' },
    // East Asia
    'japan': { name: 'Japan', region: 'East Asia' },
    'south-korea': { name: 'South Korea', region: 'East Asia' },
    // North America
    'usa': { name: 'USA', region: 'North America' },
    'canada': { name: 'Canada', region: 'North America' },
    'mexico': { name: 'Mexico', region: 'North America' },
    // Europe
    'uk': { name: 'UK', region: 'Europe' },
    'germany': { name: 'Germany', region: 'Europe' },
    'france': { name: 'France', region: 'Europe' },
    'spain': { name: 'Spain', region: 'Europe' },
    'italy': { name: 'Italy', region: 'Europe' },
    'netherlands': { name: 'Netherlands', region: 'Europe' },
    'switzerland': { name: 'Switzerland', region: 'Europe' },
    'ireland': { name: 'Ireland', region: 'Europe' },
    'sweden': { name: 'Sweden', region: 'Europe' },
    'poland': { name: 'Poland', region: 'Europe' },
    'portugal': { name: 'Portugal', region: 'Europe' },
    'greece': { name: 'Greece', region: 'Europe' },
    'russia': { name: 'Russia', region: 'Europe' },
    // Oceania
    'australia': { name: 'Australia', region: 'Oceania' },
    'new-zealand': { name: 'New Zealand', region: 'Oceania' },
    // Africa
    'south-africa': { name: 'South Africa', region: 'Africa' },
    'nigeria': { name: 'Nigeria', region: 'Africa' },
    'kenya': { name: 'Kenya', region: 'Africa' },
    'egypt': { name: 'Egypt', region: 'Africa' },
    'morocco': { name: 'Morocco', region: 'Africa' },
    'ghana': { name: 'Ghana', region: 'Africa' },
    'ethiopia': { name: 'Ethiopia', region: 'Africa' },
    'tanzania': { name: 'Tanzania', region: 'Africa' },
    // South America
    'brazil': { name: 'Brazil', region: 'South America' },
    'argentina': { name: 'Argentina', region: 'South America' },
    'colombia': { name: 'Colombia', region: 'South America' },
    'chile': { name: 'Chile', region: 'South America' },
    'peru': { name: 'Peru', region: 'South America' },
};

// Group countries by region for the dropdown
const COUNTRY_REGIONS = Object.entries(COUNTRIES).reduce((acc, [slug, data]) => {
    if (!acc[data.region]) {
        acc[data.region] = [];
    }
    acc[data.region].push({ slug, name: data.name });
    return acc;
}, {} as Record<string, { slug: string; name: string }[]>);

// Timezone to region mapping for auto-detection
const TIMEZONE_REGION_MAP: Record<string, { country: string; city: string | null }> = {
    'Asia/Kolkata': { country: 'india', city: null },
    'Asia/Calcutta': { country: 'india', city: null },
    'America/New_York': { country: 'usa', city: 'New York' },
    'America/Los_Angeles': { country: 'usa', city: 'Los Angeles' },
    'America/Chicago': { country: 'usa', city: 'Chicago' },
    'Europe/London': { country: 'uk', city: 'London' },
    'Asia/Dubai': { country: 'uae', city: 'Dubai' },
    'Asia/Singapore': { country: 'singapore', city: null },
    'Australia/Sydney': { country: 'australia', city: 'Sydney' },
    'America/Toronto': { country: 'canada', city: 'Toronto' },
    'Europe/Berlin': { country: 'germany', city: 'Berlin' },
    'Europe/Paris': { country: 'france', city: 'Paris' },
    'Asia/Tokyo': { country: 'japan', city: 'Tokyo' },
    'Asia/Seoul': { country: 'south-korea', city: 'Seoul' },
    'Asia/Bangkok': { country: 'thailand', city: 'Bangkok' },
    'America/Mexico_City': { country: 'mexico', city: 'Mexico City' },
    'America/Sao_Paulo': { country: 'brazil', city: 'Sao Paulo' },
    'Africa/Lagos': { country: 'nigeria', city: 'Lagos' },
    'Africa/Nairobi': { country: 'kenya', city: 'Nairobi' },
    'Africa/Johannesburg': { country: 'south-africa', city: 'Johannesburg' },
    'Asia/Karachi': { country: 'pakistan', city: 'Karachi' },
    'Asia/Dhaka': { country: 'bangladesh', city: 'Dhaka' },
    'Asia/Riyadh': { country: 'saudi-arabia', city: 'Riyadh' },
    'Asia/Kuala_Lumpur': { country: 'malaysia', city: 'Kuala Lumpur' },
    'Asia/Jakarta': { country: 'indonesia', city: 'Jakarta' },
    'Asia/Manila': { country: 'philippines', city: 'Manila' },
    'Europe/Istanbul': { country: 'turkey', city: 'Istanbul' },
    'Europe/Moscow': { country: 'russia', city: 'Moscow' },
};

/**
 * Global Footer — Comprehensive site navigation with all tools and pages.
 * Includes prominent location/language selectors with auto-detection.
 */
export default function ContextualFooter() {
    const [currentLang, setCurrentLang] = useState('en');
    const [currentCountry, setCurrentCountry] = useState('');
    const [currentCity, setCurrentCity] = useState('');
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [isAutoDetected, setIsAutoDetected] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Auto-detect location from timezone
    const autoDetectLocation = useCallback(() => {
        setIsDetecting(true);
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const tzRegion = TIMEZONE_REGION_MAP[tz];

            if (tzRegion) {
                const countrySlug = tzRegion.country;
                const citySlug = tzRegion.city?.toLowerCase().replace(/\s+/g, '-') || '';

                // Set cookies
                const geoValue = citySlug ? `${countrySlug}:${citySlug}` : countrySlug;
                document.cookie = `aihealz-geo=${geoValue}; path=/; max-age=31536000; samesite=lax`;

                setCurrentCountry(countrySlug);
                setCurrentCity(citySlug);
                setIsAutoDetected(true);

                // Reload to apply changes
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            console.error('Auto-detection failed:', error);
        } finally {
            setIsDetecting(false);
        }
    }, []);

    useEffect(() => {
        // Read language from cookie
        const langMatch = document.cookie.match(/aihealz-lang=([^;]+)/);
        if (langMatch) {
            setCurrentLang(langMatch[1]);
        }

        // Read country from cookie
        const geoMatch = document.cookie.match(/aihealz-geo=([^;]+)/);
        if (geoMatch) {
            const parts = geoMatch[1].split(':');
            setCurrentCountry(parts[0] || '');
            setCurrentCity(parts[1] || '');
        } else {
            // No geo cookie - auto-detect from timezone
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const tzRegion = TIMEZONE_REGION_MAP[tz];
            if (tzRegion) {
                setCurrentCountry(tzRegion.country);
                setCurrentCity(tzRegion.city?.toLowerCase().replace(/\s+/g, '-') || '');
                setIsAutoDetected(true);

                // Set the cookie silently
                const geoValue = tzRegion.city
                    ? `${tzRegion.country}:${tzRegion.city.toLowerCase().replace(/\s+/g, '-')}`
                    : tzRegion.country;
                document.cookie = `aihealz-geo=${geoValue}; path=/; max-age=31536000; samesite=lax`;
            }
        }

        // Check if was auto-detected
        const hasExplicit = document.cookie.includes('aihealz-explicit=1');
        setIsAutoDetected(!hasExplicit && !!geoMatch);
    }, []);

    const handleLanguageChange = (langCode: string) => {
        document.cookie = `aihealz-lang=${langCode}; path=/; max-age=31536000; samesite=lax`;
        setCurrentLang(langCode);
        setShowLangDropdown(false);
        // Check if current URL has language in path (e.g., /india/en/...)
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        if (segments.length >= 2) {
            const possibleLang = segments[1];
            const allLangCodes = Object.keys(LANGUAGES);
            if (allLangCodes.includes(possibleLang)) {
                // Replace language in URL
                segments[1] = langCode;
                const newPath = '/' + segments.join('/');
                window.location.href = newPath + window.location.search;
                return;
            }
        }
        // Fallback: just reload
        window.location.reload();
    };

    const handleCountryChange = (countrySlug: string) => {
        document.cookie = `aihealz-geo=${countrySlug}; path=/; max-age=31536000; samesite=lax`;
        document.cookie = `aihealz-explicit=1; path=/; max-age=31536000; samesite=lax`;
        setCurrentCountry(countrySlug);
        setCurrentCity('');
        setIsAutoDetected(false);
        setShowCountryDropdown(false);
        // Reload to apply country
        window.location.reload();
    };

    // Get display name for current location
    const getLocationDisplay = () => {
        const countryData = COUNTRIES[currentCountry];
        if (!countryData) return 'Select Location';

        if (currentCity) {
            const cityDisplay = currentCity.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `${cityDisplay}, ${countryData.name}`;
        }
        return countryData.name;
    };

    return (
        <footer className="bg-surface-900 text-white/80 border-t border-surface-800">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 lg:gap-5">

                    {/* Discover */}
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Discover</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/conditions" className="text-sm text-white/60 hover:text-white transition-colors">All Conditions</Link></li>
                            <li><Link href="/treatments" className="text-sm text-white/60 hover:text-white transition-colors">Treatments & Drugs</Link></li>
                            <li><Link href="/remedies" className="text-sm text-white/60 hover:text-white transition-colors">Home Remedies</Link></li>
                            <li><Link href="/doctors" className="text-sm text-white/60 hover:text-white transition-colors">Find Doctors</Link></li>
                            <li><Link href="/hospitals" className="text-sm text-white/60 hover:text-white transition-colors">Find Hospitals</Link></li>
                            <li><Link href="/tests" className="text-sm text-white/60 hover:text-white transition-colors">Lab Tests</Link></li>
                            <li><Link href="/diagnostic-labs" className="text-sm text-white/60 hover:text-white transition-colors">Diagnostic Labs</Link></li>
                            <li><Link href="/insurance" className="text-sm text-white/60 hover:text-white transition-colors">Health Insurance</Link></li>
                            <li><Link href="/medical-travel" className="text-sm text-white/60 hover:text-white transition-colors">Medical Travel</Link></li>
                        </ul>
                    </div>

                    {/* Patient Tools */}
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Patient Tools</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/analyze" className="text-sm text-white/60 hover:text-white transition-colors">AI Report Analysis</Link></li>
                            <li><Link href="/symptoms" className="text-sm text-white/60 hover:text-white transition-colors">AI Symptom Checker</Link></li>
                            <li><Link href="/healz-ai" className="text-sm text-white/60 hover:text-white transition-colors">Healz AI Assistant</Link></li>
                            <li><Link href="/vault" className="text-sm text-white/60 hover:text-white transition-colors">Health Vault</Link></li>
                            <li><Link href="/book" className="text-sm text-white/60 hover:text-white transition-colors">Book Appointment</Link></li>
                            <li><Link href="/tools/drug-interactions" className="text-sm text-white/60 hover:text-white transition-colors">Drug Interactions</Link></li>
                            <li><Link href="/tools/lab-tests" className="text-sm text-white/60 hover:text-white transition-colors">Lab Test Guide</Link></li>
                            <li><Link href="/tools/vaccinations" className="text-sm text-white/60 hover:text-white transition-colors">Vaccination Schedule</Link></li>
                            <li><Link href="/tools/emergency" className="text-sm text-white/60 hover:text-white transition-colors">Emergency Services</Link></li>
                            <li><Link href="/tools/glossary" className="text-sm text-white/60 hover:text-white transition-colors">Medical Glossary</Link></li>
                        </ul>
                    </div>

                    {/* Health Calculators */}
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Health Calculators</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/tools/bmi-calculator" className="text-sm text-white/60 hover:text-white transition-colors">BMI Calculator</Link></li>
                            <li><Link href="/tools/bmr-calculator" className="text-sm text-white/60 hover:text-white transition-colors">BMR & Calorie Calculator</Link></li>
                            <li><Link href="/tools/body-fat-calculator" className="text-sm text-white/60 hover:text-white transition-colors">Body Fat Calculator</Link></li>
                            <li><Link href="/tools/heart-risk-calculator" className="text-sm text-white/60 hover:text-white transition-colors">Heart Risk Calculator</Link></li>
                            <li><Link href="/tools/diabetes-risk-calculator" className="text-sm text-white/60 hover:text-white transition-colors">Diabetes Risk Calculator</Link></li>
                            <li><Link href="/tools/kidney-function-calculator" className="text-sm text-white/60 hover:text-white transition-colors">Kidney Function (eGFR)</Link></li>
                            <li><Link href="/tools/water-intake-calculator" className="text-sm text-white/60 hover:text-white transition-colors">Water Intake Calculator</Link></li>
                            <li><Link href="/tools/pregnancy-due-date-calculator" className="text-sm text-white/60 hover:text-white transition-colors">Pregnancy Due Date</Link></li>
                            <li><Link href="/tools" className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">View All Tools &rarr;</Link></li>
                        </ul>
                    </div>

                    {/* For Healthcare Providers */}
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">For Doctors</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/for-doctors" className="text-sm text-white/60 hover:text-white transition-colors">Doctor Portal</Link></li>
                            <li><Link href="/for-doctors/clinical-scores" className="text-sm text-white/60 hover:text-white transition-colors">Clinical Scores</Link></li>
                            <li><Link href="/for-doctors/drug-dosing" className="text-sm text-white/60 hover:text-white transition-colors">Drug Dosing Calculator</Link></li>
                            <li><Link href="/for-doctors/surgical-checklist" className="text-sm text-white/60 hover:text-white transition-colors">Surgical Checklist</Link></li>
                            <li><Link href="/for-doctors/quick-reference" className="text-sm text-white/60 hover:text-white transition-colors">Quick Reference</Link></li>
                            <li><Link href="/for-doctors/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing Plans</Link></li>
                            <li><Link href="/doctors/join" className="text-sm text-white/60 hover:text-white transition-colors">Join as Doctor</Link></li>
                        </ul>
                    </div>

                    {/* Clinical Reference */}
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Clinical Reference</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/clinical-reference" className="text-sm text-white/60 hover:text-white transition-colors">Reference Home</Link></li>
                            <li><Link href="/reference/drugs" className="text-sm text-white/60 hover:text-white transition-colors">Drugs & Medications</Link></li>
                            <li><Link href="/reference/guidelines" className="text-sm text-white/60 hover:text-white transition-colors">Clinical Guidelines</Link></li>
                            <li><Link href="/reference/lab-medicine" className="text-sm text-white/60 hover:text-white transition-colors">Laboratory Medicine</Link></li>
                            <li><Link href="/reference/anatomy" className="text-sm text-white/60 hover:text-white transition-colors">Clinical Anatomy</Link></li>
                            <li><Link href="/reference/procedures" className="text-sm text-white/60 hover:text-white transition-colors">Medical Procedures</Link></li>
                            <li><Link href="/reference/simulations" className="text-sm text-white/60 hover:text-white transition-colors">Cases & Quizzes</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Company</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/advertise" className="text-sm text-white/60 hover:text-white transition-colors">Advertise With Us</Link></li>
                            <li><Link href="/advertise/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Ad Pricing</Link></li>
                        </ul>

                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mt-6 mb-3">Legal</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Resources</h3>
                        <ul className="space-y-2.5">
                            <li><Link href="/chat/consult" className="text-sm text-white/60 hover:text-white transition-colors">AI Health Chat</Link></li>
                            <li><Link href="/medical-travel/bot" className="text-sm text-white/60 hover:text-white transition-colors">Trip Planner Bot</Link></li>
                            <li><Link href="/provider/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">Provider Dashboard</Link></li>
                            <li><Link href="/sitemap.xml" className="text-sm text-white/60 hover:text-white transition-colors">Sitemap</Link></li>
                        </ul>

                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mt-6 mb-3">Connect</h3>
                        <div className="flex items-center gap-3">
                            <a href="https://twitter.com/aihealz" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X (Twitter)" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="https://linkedin.com/company/aihealz" target="_blank" rel="noopener noreferrer" aria-label="Connect with us on LinkedIn" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                            <a href="https://facebook.com/aihealz" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── HIGH PRIORITY MEDICAL DISCLAIMER ── */}
                <div className="mt-14 pt-10 border-t border-white/10">
                    <div className="bg-rose-950/30 border border-rose-900/50 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="p-2.5 bg-rose-900/40 rounded-xl shrink-0">
                                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-rose-200 mb-1">Global Medical Disclaimer</h4>
                                <p className="text-xs text-rose-300/80 leading-relaxed max-w-4xl">
                                    The content on aihealz, including AI-generated analysis, remedies, and symptom insights, is provided for <strong>informational and educational purposes only</strong>. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website. <strong>If you think you may have a medical emergency, call your doctor or emergency services immediately.</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── LOCATION & LANGUAGE SETTINGS ── */}
                <div className="mt-10 pt-8 border-t border-white/10">
                    <div className="bg-gradient-to-r from-surface-800/50 to-surface-800/30 rounded-2xl p-6 border border-white/5">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            {/* Left: Location Info */}
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/10 rounded-xl">
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Your Location</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{getLocationDisplay()}</span>
                                        {isAutoDetected && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded-full uppercase">
                                                Auto-detected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Selectors */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {/* Auto-Detect Button */}
                                <button
                                    onClick={autoDetectLocation}
                                    disabled={isDetecting}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl border border-cyan-500/20 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50"
                                    aria-label="Auto-detect location"
                                >
                                    {isDetecting ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                    <span className="hidden sm:inline">{isDetecting ? 'Detecting...' : 'Auto-Detect'}</span>
                                </button>

                                {/* Language Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowLangDropdown(!showLangDropdown);
                                            setShowCountryDropdown(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm font-medium text-white/70 hover:text-white transition-all duration-200"
                                        aria-label="Change language"
                                    >
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                        </svg>
                                        <span>{LANGUAGES[currentLang]?.nativeName || 'English'}</span>
                                        <svg className={`w-3.5 h-3.5 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showLangDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-surface-900 rounded-xl border border-white/10 shadow-2xl z-50 py-2 max-h-80 overflow-auto">
                                                <p className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Select Language</p>
                                                {Object.entries(LANGUAGES).map(([code, lang]) => (
                                                    <button
                                                        key={code}
                                                        onClick={() => handleLanguageChange(code)}
                                                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                                            currentLang === code
                                                                ? 'bg-cyan-500/10 text-cyan-400'
                                                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    >
                                                        <span>{lang.nativeName}</span>
                                                        <span className="text-xs text-white/40">{lang.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Country Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowCountryDropdown(!showCountryDropdown);
                                            setShowLangDropdown(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm font-medium text-white/70 hover:text-white transition-all duration-200"
                                        aria-label="Change location"
                                    >
                                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{COUNTRIES[currentCountry]?.name || 'Select Country'}</span>
                                        <svg className={`w-3.5 h-3.5 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showCountryDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                                            <div className="absolute bottom-full mb-2 right-0 w-72 bg-surface-900 rounded-xl border border-white/10 shadow-2xl z-50 py-2 max-h-96 overflow-auto">
                                                {Object.entries(COUNTRY_REGIONS).map(([region, countries]) => (
                                                    <div key={region}>
                                                        <p className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider sticky top-0 bg-surface-900">{region}</p>
                                                        {countries.map(({ slug, name }) => (
                                                            <button
                                                                key={slug}
                                                                onClick={() => handleCountryChange(slug)}
                                                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                                                                    currentCountry === slug
                                                                        ? 'bg-cyan-500/10 text-cyan-400'
                                                                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                                }`}
                                                            >
                                                                {name}
                                                                {currentCountry === slug && (
                                                                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location benefits info */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Localized content
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Local pricing
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Nearby providers
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Regional language
                            </span>
                        </div>
                    </div>
                </div>

                {/* Copyright & Address */}
                <div className="mt-8 pt-6 border-t border-surface-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div>
                        <p className="text-xs font-bold text-white/50 mb-1">ATZ Medappz Pvt Ltd. &bull; 84, Supreme Coworks, Sector 32, Gurgaon, India</p>
                        <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} aihealz. All rights reserved.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/30 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 36 24"><rect fill="#FF9933" width="36" height="8"/><rect y="8" fill="#fff" width="36" height="8"/><rect y="16" fill="#128807" width="36" height="8"/><circle cx="18" cy="12" r="3" fill="#000088"/></svg>
                            Made in India
                        </span>
                        <span className="text-xs text-white/30 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            For the World
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
