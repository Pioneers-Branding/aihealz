'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { formatZodErrors } from '../validation';

/**
 * Form State Management Hooks
 * Custom hooks for handling form state, validation, and submission
 */

// ============================================================================
// TYPES
// ============================================================================

export interface UseFormOptions<T> {
    initialValues: T;
    schema?: z.ZodSchema<T>;
    onSubmit?: (values: T) => Promise<void> | void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    resetOnSuccess?: boolean;
}

export interface UseFormReturn<T> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
    submitError: string | null;
    submitCount: number;
    // Methods
    setValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setValues: (values: Partial<T>) => void;
    setError: (field: string, message: string) => void;
    clearError: (field: string) => void;
    clearErrors: () => void;
    setTouched: (field: string, touched?: boolean) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    reset: (newValues?: T) => void;
    validate: () => boolean;
    validateField: (field: keyof T) => boolean;
    getFieldProps: (field: keyof T) => {
        name: string;
        value: T[keyof T];
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
        onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    };
}

// ============================================================================
// USE FORM HOOK
// ============================================================================

export function useForm<T extends Record<string, unknown>>(
    options: UseFormOptions<T>
): UseFormReturn<T> {
    const {
        initialValues,
        schema,
        onSubmit,
        validateOnChange = false,
        validateOnBlur = true,
        resetOnSuccess = false,
    } = options;

    const [values, setValuesState] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouchedState] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitCount, setSubmitCount] = useState(0);

    const initialValuesRef = useRef(initialValues);

    // Check if form is dirty
    const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);

    // Check if form is valid
    const isValid = Object.keys(errors).length === 0;

    // Set a single value
    const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setValuesState((prev) => ({ ...prev, [field]: value }));

        if (validateOnChange && schema) {
            // Validate the specific field
            try {
                const fieldSchema = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape[field as string];
                if (fieldSchema) {
                    fieldSchema.parse(value);
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[field as string];
                        return newErrors;
                    });
                }
            } catch (error) {
                if (error instanceof z.ZodError) {
                    setErrors((prev) => ({
                        ...prev,
                        [field]: error.issues[0]?.message || 'Invalid value',
                    }));
                }
            }
        }
    }, [schema, validateOnChange]);

    // Set multiple values
    const setValues = useCallback((newValues: Partial<T>) => {
        setValuesState((prev) => ({ ...prev, ...newValues }));
    }, []);

    // Set error for a field
    const setError = useCallback((field: string, message: string) => {
        setErrors((prev) => ({ ...prev, [field]: message }));
    }, []);

    // Clear error for a field
    const clearError = useCallback((field: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    // Clear all errors
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    // Set touched state for a field
    const setTouched = useCallback((field: string, isTouched = true) => {
        setTouchedState((prev) => ({ ...prev, [field]: isTouched }));
    }, []);

    // Validate entire form
    const validate = useCallback((): boolean => {
        if (!schema) return true;

        const result = schema.safeParse(values);

        if (result.success) {
            setErrors({});
            return true;
        }

        setErrors(formatZodErrors(result.error));
        return false;
    }, [schema, values]);

    // Validate a single field
    const validateField = useCallback((field: keyof T): boolean => {
        if (!schema) return true;

        try {
            const fieldSchema = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape[field as string];
            if (fieldSchema) {
                fieldSchema.parse(values[field]);
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field as string];
                    return newErrors;
                });
                return true;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors((prev) => ({
                    ...prev,
                    [field]: error.issues[0]?.message || 'Invalid value',
                }));
                return false;
            }
        }

        return true;
    }, [schema, values]);

    // Handle input change
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            const isCheckbox = type === 'checkbox';
            const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

            setValue(name as keyof T, newValue as T[keyof T]);
        },
        [setValue]
    );

    // Handle input blur
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name } = e.target;
            setTouched(name, true);

            if (validateOnBlur) {
                validateField(name as keyof T);
            }
        },
        [setTouched, validateOnBlur, validateField]
    );

    // Handle form submission
    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            setSubmitError(null);
            setSubmitCount((prev) => prev + 1);

            // Mark all fields as touched
            const allTouched: Record<string, boolean> = {};
            Object.keys(values).forEach((key) => {
                allTouched[key] = true;
            });
            setTouchedState(allTouched);

            // Validate
            const isFormValid = validate();

            if (!isFormValid) {
                return;
            }

            if (!onSubmit) {
                return;
            }

            setIsSubmitting(true);

            try {
                await onSubmit(values);

                if (resetOnSuccess) {
                    setValuesState(initialValuesRef.current);
                    setTouchedState({});
                    setErrors({});
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Submission failed';
                setSubmitError(message);
            } finally {
                setIsSubmitting(false);
            }
        },
        [values, validate, onSubmit, resetOnSuccess]
    );

    // Reset form
    const reset = useCallback((newValues?: T) => {
        const resetValues = newValues ?? initialValuesRef.current;
        setValuesState(resetValues);
        setErrors({});
        setTouchedState({});
        setSubmitError(null);

        if (newValues) {
            initialValuesRef.current = newValues;
        }
    }, []);

    // Get props for a field
    const getFieldProps = useCallback(
        (field: keyof T) => ({
            name: field as string,
            value: values[field],
            onChange: handleChange,
            onBlur: handleBlur,
        }),
        [values, handleChange, handleBlur]
    );

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        isDirty,
        submitError,
        submitCount,
        setValue,
        setValues,
        setError,
        clearError,
        clearErrors,
        setTouched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        validate,
        validateField,
        getFieldProps,
    };
}

// ============================================================================
// USE FIELD HOOK (for individual field management)
// ============================================================================

export interface UseFieldOptions<T> {
    name: string;
    initialValue: T;
    validate?: (value: T) => string | undefined;
}

export interface UseFieldReturn<T> {
    value: T;
    error: string | undefined;
    touched: boolean;
    setValue: (value: T) => void;
    setError: (error: string) => void;
    setTouched: (touched: boolean) => void;
    clear: () => void;
    props: {
        name: string;
        value: T;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onBlur: () => void;
    };
}

export function useField<T>(options: UseFieldOptions<T>): UseFieldReturn<T> {
    const { name, initialValue, validate } = options;

    const [value, setValueState] = useState<T>(initialValue);
    const [error, setErrorState] = useState<string | undefined>(undefined);
    const [touched, setTouchedState] = useState(false);

    const setValue = useCallback((newValue: T) => {
        setValueState(newValue);

        if (validate && touched) {
            setErrorState(validate(newValue));
        }
    }, [validate, touched]);

    const setError = useCallback((err: string) => {
        setErrorState(err);
    }, []);

    const setTouched = useCallback((isTouched: boolean) => {
        setTouchedState(isTouched);

        if (isTouched && validate) {
            setErrorState(validate(value));
        }
    }, [validate, value]);

    const clear = useCallback(() => {
        setValueState(initialValue);
        setErrorState(undefined);
        setTouchedState(false);
    }, [initialValue]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.type === 'checkbox'
            ? e.target.checked as unknown as T
            : e.target.value as unknown as T;
        setValue(newValue);
    }, [setValue]);

    const handleBlur = useCallback(() => {
        setTouched(true);
    }, [setTouched]);

    return {
        value,
        error,
        touched,
        setValue,
        setError,
        setTouched,
        clear,
        props: {
            name,
            value: value as T,
            onChange: handleChange,
            onBlur: handleBlur,
        },
    };
}

// ============================================================================
// USE DEBOUNCED VALUE HOOK
// ============================================================================

export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

// ============================================================================
// USE FORM PERSIST HOOK (persist form to localStorage)
// ============================================================================

export function useFormPersist<T>(
    key: string,
    initialValues: T,
    options?: { debounce?: number }
): [T, (values: T) => void, () => void] {
    const { debounce = 500 } = options ?? {};

    const [values, setValuesState] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValues;

        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                return JSON.parse(saved) as T;
            }
        } catch {
            // Ignore parse errors
        }

        return initialValues;
    });

    const debouncedValues = useDebouncedValue(values, debounce);

    // Persist to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(key, JSON.stringify(debouncedValues));
        } catch {
            // Ignore storage errors
        }
    }, [key, debouncedValues]);

    const setValues = useCallback((newValues: T) => {
        setValuesState(newValues);
    }, []);

    const clear = useCallback(() => {
        setValuesState(initialValues);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    }, [key, initialValues]);

    return [values, setValues, clear];
}
