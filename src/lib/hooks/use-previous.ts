'use client';

import { useRef, useEffect } from 'react';

/**
 * Hook to get the previous value of a variable
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 *
 * // After setCount(1):
 * // count = 1, previousCount = 0
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
