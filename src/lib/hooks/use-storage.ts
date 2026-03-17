'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Browser storage hooks (localStorage, sessionStorage)
 */

type StorageType = 'local' | 'session';

function getStorage(type: StorageType): Storage | null {
    if (typeof window === 'undefined') return null;
    return type === 'local' ? window.localStorage : window.sessionStorage;
}

function useStorage<T>(
    key: string,
    initialValue: T,
    type: StorageType
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // Read initial value from storage
    const [storedValue, setStoredValue] = useState<T>(() => {
        const storage = getStorage(type);
        if (!storage) return initialValue;

        try {
            const item = storage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    // Update stored value
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((prev) => {
                const newValue = value instanceof Function ? value(prev) : value;

                const storage = getStorage(type);
                if (storage) {
                    try {
                        storage.setItem(key, JSON.stringify(newValue));
                    } catch {
                        // Quota exceeded or other error
                    }
                }

                return newValue;
            });
        },
        [key, type]
    );

    // Remove from storage
    const removeValue = useCallback(() => {
        const storage = getStorage(type);
        if (storage) {
            storage.removeItem(key);
        }
        setStoredValue(initialValue);
    }, [key, type, initialValue]);

    // Sync with storage events (cross-tab)
    useEffect(() => {
        if (type !== 'local') return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue) as T);
                } catch {
                    // Ignore parse errors
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, type]);

    return [storedValue, setValue, removeValue];
}

/**
 * Hook for localStorage
 *
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * ```
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    return useStorage(key, initialValue, 'local');
}

/**
 * Hook for sessionStorage
 *
 * @example
 * ```tsx
 * const [formData, setFormData, clearFormData] = useSessionStorage('form', {});
 * ```
 */
export function useSessionStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    return useStorage(key, initialValue, 'session');
}
