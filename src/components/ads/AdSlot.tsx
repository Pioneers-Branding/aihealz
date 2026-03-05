'use client';

import { useState, useEffect, useRef } from 'react';
import type { AdPlacement } from '@prisma/client';

interface AdData {
    campaignId: number;
    creativeId: number;
    advertiserId: number;
    headline: string | null;
    description: string | null;
    ctaText: string | null;
    destinationUrl: string;
    imageUrl: string | null;
    imageAlt: string | null;
    logoUrl: string | null;
    width: number | null;
    height: number | null;
    adType: string;
    companyName: string;
}

interface AdSlotProps {
    placement: AdPlacement;
    conditionSlug?: string;
    specialtyType?: string;
    countryCode?: string | null;
    citySlug?: string | null;
    languageCode?: string;
    className?: string;
    fallback?: React.ReactNode;
}

export default function AdSlot({
    placement,
    conditionSlug,
    specialtyType,
    countryCode,
    citySlug,
    languageCode = 'en',
    className = '',
    fallback = null,
}: AdSlotProps) {
    const [ad, setAd] = useState<AdData | null>(null);
    const [sessionHash, setSessionHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [impressionId, setImpressionId] = useState<string | null>(null);
    const hasTrackedImpression = useRef(false);

    // Fetch ad on mount
    useEffect(() => {
        const fetchAd = async () => {
            try {
                const params = new URLSearchParams({
                    placement,
                    ...(countryCode && { country: countryCode }),
                    ...(citySlug && { city: citySlug }),
                    ...(conditionSlug && { condition: conditionSlug }),
                    ...(specialtyType && { specialty: specialtyType }),
                    lang: languageCode,
                });

                const res = await fetch(`/api/ads/serve?${params.toString()}`);
                const data = await res.json();

                if (data.ad) {
                    setAd(data.ad);
                }
                if (data.sessionHash) {
                    setSessionHash(data.sessionHash);
                }
            } catch (error) {
                console.error('Failed to fetch ad:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [placement, conditionSlug, specialtyType, countryCode, citySlug, languageCode]);

    // Track impression when ad is visible
    useEffect(() => {
        if (!ad || !sessionHash || hasTrackedImpression.current) return;

        const trackImpression = async () => {
            try {
                const res = await fetch('/api/ads/track/impression', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        campaignId: ad.campaignId,
                        sessionHash,
                        placement,
                        pageUrl: window.location.href,
                        countryCode,
                        citySlug,
                        conditionSlug,
                        languageCode,
                    }),
                });
                const data = await res.json();
                if (data.impressionId) {
                    setImpressionId(data.impressionId);
                }
                hasTrackedImpression.current = true;
            } catch (error) {
                console.error('Failed to track impression:', error);
            }
        };

        // Use Intersection Observer to track when ad is visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTrackedImpression.current) {
                        trackImpression();
                    }
                });
            },
            { threshold: 0.5 }
        );

        const adElement = document.getElementById(`ad-slot-${placement}-${ad.campaignId}`);
        if (adElement) {
            observer.observe(adElement);
        }

        return () => observer.disconnect();
    }, [ad, sessionHash, placement, countryCode, citySlug, conditionSlug, languageCode]);

    // Handle click
    const handleClick = async () => {
        if (!ad || !sessionHash) return;

        try {
            await fetch('/api/ads/track/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: ad.campaignId,
                    impressionId,
                    sessionHash,
                    placement,
                    pageUrl: window.location.href,
                    destinationUrl: ad.destinationUrl,
                    countryCode,
                    citySlug,
                }),
            });
        } catch (error) {
            console.error('Failed to track click:', error);
        }

        // Navigate to destination
        window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}>
                <div className="h-full min-h-[100px]" />
            </div>
        );
    }

    if (!ad) {
        return fallback ? <>{fallback}</> : null;
    }

    return (
        <div
            id={`ad-slot-${placement}-${ad.campaignId}`}
            className={`relative group cursor-pointer ${className}`}
            onClick={handleClick}
        >
            {/* Ad Label */}
            <div className="absolute top-1 left-1 z-10">
                <span className="px-1.5 py-0.5 bg-slate-900/60 text-white text-[10px] font-medium rounded">
                    Ad
                </span>
            </div>

            {/* Ad Content */}
            {ad.imageUrl ? (
                <div className="relative overflow-hidden rounded-lg bg-slate-100">
                    <img
                        src={ad.imageUrl}
                        alt={ad.imageAlt || ad.headline || 'Advertisement'}
                        className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                        style={{
                            maxWidth: ad.width ? `${ad.width}px` : undefined,
                            maxHeight: ad.height ? `${ad.height}px` : undefined,
                        }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
            ) : (
                // Text-based ad (native format)
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all">
                    {ad.logoUrl && (
                        <img
                            src={ad.logoUrl}
                            alt={ad.companyName}
                            className="w-10 h-10 object-contain rounded mb-3"
                        />
                    )}
                    {ad.headline && (
                        <h4 className="font-semibold text-slate-900 mb-1 line-clamp-2">{ad.headline}</h4>
                    )}
                    {ad.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ad.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{ad.companyName}</span>
                        {ad.ctaText && (
                            <span className="text-xs font-medium text-teal-600 group-hover:text-teal-700">
                                {ad.ctaText} →
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
