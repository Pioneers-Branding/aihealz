'use client';

import { useEffect } from 'react';

/**
 * Invisible client component that triggers background translation
 * when a condition page falls back to English content for a non-English user.
 * On next visit, the translated content will be served directly.
 */
export function TranslateTrigger({
    conditionId,
    targetLang,
}: {
    conditionId: number;
    targetLang: string;
}) {
    useEffect(() => {
        if (!conditionId || !targetLang || targetLang === 'en') return;

        // Fire and forget — translation happens in background
        fetch('/api/translate-condition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conditionId, targetLang }),
        }).catch(() => {
            // Silent fail — translation will be retried on next visit
        });
    }, [conditionId, targetLang]);

    return null;
}
