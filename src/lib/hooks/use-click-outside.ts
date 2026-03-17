'use client';

import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to detect clicks outside of a referenced element
 *
 * @example
 * ```tsx
 * const dropdownRef = useOnClickOutside(() => setIsOpen(false));
 * return <div ref={dropdownRef}>...</div>;
 * ```
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    handler: () => void,
    enabled = true
): RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;

            if (ref.current && !ref.current.contains(target)) {
                handler();
            }
        };

        // Use mousedown for faster response
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [handler, enabled]);

    return ref;
}
