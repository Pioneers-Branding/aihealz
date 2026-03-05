'use client';

/**
 * Custom Hooks
 * Re-export all hooks from a single entry point
 */

// Form hooks
export {
    useForm,
    useField,
    useDebouncedValue,
    useFormPersist,
    type UseFormOptions,
    type UseFormReturn,
    type UseFieldOptions,
    type UseFieldReturn,
} from './use-form';

// Additional utility hooks
export { useAsync, useAsyncCallback, type AsyncState } from './use-async';
export { useLocalStorage, useSessionStorage } from './use-storage';
export { useOnClickOutside } from './use-click-outside';
export { useMediaQuery, useBreakpoint } from './use-media-query';
export { useClipboard } from './use-clipboard';
export { usePrevious } from './use-previous';
export { useToggle } from './use-toggle';
