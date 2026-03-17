'use client';

import { useState, useCallback } from 'react';

/**
 * Hook for boolean toggle state
 *
 * @example
 * ```tsx
 * const [isOpen, toggle, setIsOpen] = useToggle(false);
 *
 * <button onClick={toggle}>Toggle</button>
 * <button onClick={() => setIsOpen(true)}>Open</button>
 * <button onClick={() => setIsOpen(false)}>Close</button>
 * ```
 */
export function useToggle(
    initialValue = false
): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => {
        setValue((prev) => !prev);
    }, []);

    const set = useCallback((newValue: boolean) => {
        setValue(newValue);
    }, []);

    return [value, toggle, set];
}
