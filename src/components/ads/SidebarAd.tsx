'use client';

import AdSlot from './AdSlot';
import type { AdPlacement } from '@prisma/client';

interface SidebarAdProps {
    placement?: AdPlacement;
    conditionSlug?: string;
    specialtyType?: string;
    countryCode?: string | null;
    citySlug?: string | null;
    languageCode?: string;
}

export default function SidebarAd({
    placement = 'condition_sidebar',
    conditionSlug,
    specialtyType,
    countryCode,
    citySlug,
    languageCode = 'en',
}: SidebarAdProps) {
    return (
        <div className="sticky top-24">
            <AdSlot
                placement={placement}
                conditionSlug={conditionSlug}
                specialtyType={specialtyType}
                countryCode={countryCode}
                citySlug={citySlug}
                languageCode={languageCode}
                className="w-full max-w-[300px]"
                fallback={
                    <div className="w-full max-w-[300px] p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-teal-100 rounded-xl flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-1">Advertise Here</h4>
                            <p className="text-sm text-slate-600 mb-3">
                                Reach patients researching this condition
                            </p>
                            <a
                                href="/advertise"
                                className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                            >
                                Learn More
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
