'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Accessibility Utilities
 * Helper hooks and functions for building accessible components
 */

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Hook to trap focus within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element when trap is activated
        firstElement?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [isActive]);

    return containerRef;
}

/**
 * Hook to restore focus to the element that triggered a modal/dialog
 */
export function useRestoreFocus() {
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const saveFocus = useCallback(() => {
        previousFocusRef.current = document.activeElement as HTMLElement;
    }, []);

    const restoreFocus = useCallback(() => {
        previousFocusRef.current?.focus();
    }, []);

    return { saveFocus, restoreFocus };
}

/**
 * Hook to focus an element on mount
 */
export function useAutoFocus<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return ref;
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

interface UseArrowNavigationOptions {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
}

/**
 * Hook for arrow key navigation in lists/menus
 */
export function useArrowNavigation(
    itemCount: number,
    options: UseArrowNavigationOptions = {}
) {
    const { orientation = 'vertical', loop = true, onSelect } = options;
    const [activeIndex, setActiveIndex] = useState(-1);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            let newIndex = activeIndex;
            const isVertical = orientation === 'vertical' || orientation === 'both';
            const isHorizontal = orientation === 'horizontal' || orientation === 'both';

            switch (e.key) {
                case 'ArrowDown':
                    if (isVertical) {
                        e.preventDefault();
                        newIndex = activeIndex + 1;
                        if (newIndex >= itemCount) {
                            newIndex = loop ? 0 : itemCount - 1;
                        }
                    }
                    break;
                case 'ArrowUp':
                    if (isVertical) {
                        e.preventDefault();
                        newIndex = activeIndex - 1;
                        if (newIndex < 0) {
                            newIndex = loop ? itemCount - 1 : 0;
                        }
                    }
                    break;
                case 'ArrowRight':
                    if (isHorizontal) {
                        e.preventDefault();
                        newIndex = activeIndex + 1;
                        if (newIndex >= itemCount) {
                            newIndex = loop ? 0 : itemCount - 1;
                        }
                    }
                    break;
                case 'ArrowLeft':
                    if (isHorizontal) {
                        e.preventDefault();
                        newIndex = activeIndex - 1;
                        if (newIndex < 0) {
                            newIndex = loop ? itemCount - 1 : 0;
                        }
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newIndex = itemCount - 1;
                    break;
                case 'Enter':
                case ' ':
                    if (activeIndex >= 0) {
                        e.preventDefault();
                        onSelect?.(activeIndex);
                    }
                    break;
            }

            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            }
        },
        [activeIndex, itemCount, loop, orientation, onSelect]
    );

    const reset = useCallback(() => setActiveIndex(-1), []);

    return {
        activeIndex,
        setActiveIndex,
        handleKeyDown,
        reset,
    };
}

// ============================================================================
// SCREEN READER UTILITIES
// ============================================================================

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const element = document.createElement('div');
        element.setAttribute('role', 'status');
        element.setAttribute('aria-live', priority);
        element.setAttribute('aria-atomic', 'true');
        element.className = 'sr-only';
        element.textContent = message;

        document.body.appendChild(element);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(element);
        }, 1000);
    }, []);

    return announce;
}

/**
 * Visually hidden class for screen reader only content
 */
export const srOnlyClass =
    'absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0';

/**
 * Component for screen reader only content
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
    return <span className={srOnlyClass}>{children}</span>;
}

// ============================================================================
// REDUCED MOTION
// ============================================================================

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return prefersReducedMotion;
}

// ============================================================================
// ARIA HELPERS
// ============================================================================

/**
 * Generate unique IDs for ARIA relationships
 */
export function useId(prefix = 'aria'): string {
    const [id] = useState(() => `${prefix}-${Math.random().toString(36).slice(2, 9)}`);
    return id;
}

/**
 * Common ARIA attribute builders
 */
export const aria = {
    /**
     * ARIA attributes for an expandable element (accordion, dropdown)
     */
    expandable: (id: string, isExpanded: boolean) => ({
        'aria-expanded': isExpanded,
        'aria-controls': id,
    }),

    /**
     * ARIA attributes for a dialog/modal trigger
     */
    dialogTrigger: (dialogId: string) => ({
        'aria-haspopup': 'dialog' as const,
        'aria-controls': dialogId,
    }),

    /**
     * ARIA attributes for a dialog/modal
     */
    dialog: (labelledBy?: string, describedBy?: string) => ({
        role: 'dialog' as const,
        'aria-modal': true,
        ...(labelledBy && { 'aria-labelledby': labelledBy }),
        ...(describedBy && { 'aria-describedby': describedBy }),
    }),

    /**
     * ARIA attributes for a menu trigger
     */
    menuTrigger: (menuId: string, isOpen: boolean) => ({
        'aria-haspopup': 'menu' as const,
        'aria-expanded': isOpen,
        'aria-controls': menuId,
    }),

    /**
     * ARIA attributes for a tab
     */
    tab: (id: string, panelId: string, isSelected: boolean) => ({
        role: 'tab' as const,
        id,
        'aria-selected': isSelected,
        'aria-controls': panelId,
        tabIndex: isSelected ? 0 : -1,
    }),

    /**
     * ARIA attributes for a tab panel
     */
    tabPanel: (id: string, tabId: string, isActive: boolean) => ({
        role: 'tabpanel' as const,
        id,
        'aria-labelledby': tabId,
        hidden: !isActive,
    }),

    /**
     * ARIA attributes for a listbox option
     */
    option: (isSelected: boolean, isDisabled = false) => ({
        role: 'option' as const,
        'aria-selected': isSelected,
        'aria-disabled': isDisabled,
    }),

    /**
     * ARIA attributes for a progress indicator
     */
    progress: (value: number, max = 100, label?: string) => ({
        role: 'progressbar' as const,
        'aria-valuenow': value,
        'aria-valuemin': 0,
        'aria-valuemax': max,
        ...(label && { 'aria-label': label }),
    }),

    /**
     * ARIA attributes for a loading state
     */
    loading: (isLoading: boolean, label = 'Loading') => ({
        'aria-busy': isLoading,
        ...(isLoading && { 'aria-label': label }),
    }),

    /**
     * ARIA attributes for an alert/error message
     */
    alert: () => ({
        role: 'alert' as const,
        'aria-live': 'assertive' as const,
    }),

    /**
     * ARIA attributes for live status updates
     */
    status: (priority: 'polite' | 'assertive' = 'polite') => ({
        role: 'status' as const,
        'aria-live': priority,
        'aria-atomic': true,
    }),
};

// ============================================================================
// COLOR CONTRAST HELPERS
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
): number {
    const l1 = getLuminance(color1.r, color1.g, color1.b);
    const l2 = getLuminance(color2.r, color2.g, color2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG requirements
 */
export function meetsContrastRequirement(
    ratio: number,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText = false
): boolean {
    if (level === 'AAA') {
        return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
