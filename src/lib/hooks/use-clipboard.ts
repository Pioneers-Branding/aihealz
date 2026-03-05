'use client';

import { useState, useCallback } from 'react';

/**
 * Hook for clipboard operations
 *
 * @example
 * ```tsx
 * const { copy, copied, error } = useClipboard();
 *
 * <button onClick={() => copy('Text to copy')}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 * ```
 */
export function useClipboard(
    options?: { timeout?: number }
): {
    copy: (text: string) => Promise<boolean>;
    copied: boolean;
    error: Error | null;
    reset: () => void;
} {
    const { timeout = 2000 } = options ?? {};

    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const copy = useCallback(async (text: string): Promise<boolean> => {
        if (!navigator?.clipboard) {
            setError(new Error('Clipboard not supported'));
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setError(null);

            // Reset copied state after timeout
            setTimeout(() => {
                setCopied(false);
            }, timeout);

            return true;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to copy');
            setError(error);
            setCopied(false);
            return false;
        }
    }, [timeout]);

    const reset = useCallback(() => {
        setCopied(false);
        setError(null);
    }, []);

    return { copy, copied, error, reset };
}
