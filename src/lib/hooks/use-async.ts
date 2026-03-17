'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Async operation state management hooks
 */

export interface AsyncState<T> {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
}

interface UseAsyncOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean;
}

/**
 * Hook for managing async operations
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useAsync(
 *   () => fetchUserProfile(userId),
 *   { immediate: true }
 * );
 * ```
 */
export function useAsync<T, Args extends unknown[] = []>(
    asyncFn: (...args: Args) => Promise<T>,
    options: UseAsyncOptions<T> = {}
): AsyncState<T> & {
    execute: (...args: Args) => Promise<T | null>;
    reset: () => void;
} {
    const { onSuccess, onError, immediate = false } = options;

    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        error: null,
        isLoading: immediate,
        isSuccess: false,
        isError: false,
    });

    const mountedRef = useRef(true);
    const asyncFnRef = useRef(asyncFn);
    asyncFnRef.current = asyncFn;

    const execute = useCallback(async (...args: Args): Promise<T | null> => {
        setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
        }));

        try {
            const data = await asyncFnRef.current(...args);

            if (mountedRef.current) {
                setState({
                    data,
                    error: null,
                    isLoading: false,
                    isSuccess: true,
                    isError: false,
                });
                onSuccess?.(data);
            }

            return data;
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));

            if (mountedRef.current) {
                setState({
                    data: null,
                    error: errorObj,
                    isLoading: false,
                    isSuccess: false,
                    isError: true,
                });
                onError?.(errorObj);
            }

            return null;
        }
    }, [onSuccess, onError]);

    const reset = useCallback(() => {
        setState({
            data: null,
            error: null,
            isLoading: false,
            isSuccess: false,
            isError: false,
        });
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        if (immediate) {
            execute(...([] as unknown as Args));
        }

        return () => {
            mountedRef.current = false;
        };
    }, [immediate, execute]);

    return {
        ...state,
        execute,
        reset,
    };
}

/**
 * Hook for async callbacks with loading state
 *
 * @example
 * ```tsx
 * const [submitForm, { isLoading, error }] = useAsyncCallback(
 *   async (data) => {
 *     await api.submitForm(data);
 *   },
 *   { onSuccess: () => toast.success('Submitted!') }
 * );
 * ```
 */
export function useAsyncCallback<T, Args extends unknown[]>(
    callback: (...args: Args) => Promise<T>,
    options: UseAsyncOptions<T> = {}
): [
    (...args: Args) => Promise<T | null>,
    AsyncState<T> & { reset: () => void }
] {
    const { data, error, isLoading, isSuccess, isError, execute, reset } = useAsync<T, Args>(
        callback,
        { ...options, immediate: false }
    );

    return [
        execute,
        { data, error, isLoading, isSuccess, isError, reset },
    ];
}
