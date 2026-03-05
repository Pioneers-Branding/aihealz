'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
    /** Country slug from server-side headers, e.g. "india" */
    country?: string | null;
    /** Detected city slug, e.g. "delhi" */
    city?: string | null;
    /** Primary language code, e.g. "en" */
    lang?: string;
    /** Regional language code, e.g. "hi" */
    regionalLang?: string | null;
    /** Display info like "Hindi|हिन्दी" */
    regionalDisplay?: string | null;
}

const LANG_INFO: Record<string, { name: string; native: string }> = {
    en: { name: 'English', native: 'English' },
    hi: { name: 'Hindi', native: 'हिन्दी' },
    ta: { name: 'Tamil', native: 'தமிழ்' },
    mr: { name: 'Marathi', native: 'मराठी' },
    kn: { name: 'Kannada', native: 'ಕನ್ನಡ' },
    bn: { name: 'Bengali', native: 'বাংলা' },
    gu: { name: 'Gujarati', native: 'ગુજરાતી' },
    te: { name: 'Telugu', native: 'తెలుగు' },
    ml: { name: 'Malayalam', native: 'മലയാളം' },
    pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
};

function capitalize(s: string): string {
    return s.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export default function LanguageSwitcher({
    country,
    city,
    lang = 'en',
    regionalLang,
    regionalDisplay,
}: LanguageSwitcherProps) {
    const [activeLang, setActiveLang] = useState(lang);
    const [dismissed, setDismissed] = useState(false);

    // Read override from cookie on client
    useEffect(() => {
        const cookieVal = document.cookie
            .split('; ')
            .find(c => c.startsWith('aihealz-lang='))
            ?.split('=')[1];
        if (cookieVal) setActiveLang(cookieVal);
    }, []);

    // No regional language detected or already dismissed — don't show
    if (!regionalLang || dismissed) return null;
    // Already viewing in the regional language
    if (activeLang === regionalLang) return null;

    // Parse display info
    let regName = LANG_INFO[regionalLang]?.name || regionalLang;
    let regNative = LANG_INFO[regionalLang]?.native || '';
    if (regionalDisplay) {
        try {
            const decoded = decodeURIComponent(regionalDisplay);
            const parts = decoded.split('|');
            regName = parts[0] || regName;
            regNative = parts[1] || regNative;
        } catch (e) {
            // fallback gracefully
        }
    }

    const cityDisplay = city ? capitalize(city) : null;

    const switchToLang = (code: string) => {
        document.cookie = `aihealz-lang=${code};path=/;max-age=${365 * 24 * 3600};samesite=lax`;
        setActiveLang(code);
        // Let the page re-render with the new lang context
        window.location.reload();
    };

    return (
        <div className="bg-gradient-to-r from-primary-900/60 to-primary-800/60 backdrop-blur-md border-b border-primary-500/20">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-primary-400 shrink-0" />
                    <span className="text-slate-300">
                        {cityDisplay ? (
                            <>Browsing from <strong className="text-white">{cityDisplay}</strong></>
                        ) : country ? (
                            <>Browsing from <strong className="text-white">{capitalize(country)}</strong></>
                        ) : (
                            <>Choose your language</>
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeLang === 'en'
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        onClick={() => switchToLang('en')}
                    >
                        English
                    </button>
                    <button
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeLang === regionalLang
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        onClick={() => switchToLang(regionalLang)}
                    >
                        {regNative} ({regName})
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-slate-500 hover:text-slate-300 transition-colors ml-2"
                        aria-label="Dismiss language switcher"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
