'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'aihealz_cookie_consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

export default function CookieConsent() {
    const [status, setStatus] = useState<ConsentStatus>('pending');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if user has already made a choice
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (saved === 'accepted' || saved === 'rejected') {
                setStatus(saved as ConsentStatus);
            }
        }
    }, []);

    const handleAccept = () => {
        setStatus('accepted');
        if (typeof window !== 'undefined') {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        }
    };

    const handleReject = () => {
        setStatus('rejected');
        if (typeof window !== 'undefined') {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
        }
    };

    // Don't render on server or if user already made a choice
    if (!mounted || status !== 'pending') {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 print:hidden">
            <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">We value your privacy</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                            By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                            <Link href="/privacy" className="text-teal-400 hover:text-teal-300 underline">
                                Read our Privacy Policy
                            </Link>
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleReject}
                            className="flex-1 md:flex-none px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors text-sm"
                        >
                            Reject All
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 md:flex-none px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-colors text-sm"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
