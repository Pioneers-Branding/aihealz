'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
    success: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const toastStyles: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    useEffect(() => {
        if (toast.duration !== 0) {
            const timer = setTimeout(onRemove, toast.duration || 5000);
            return () => clearTimeout(timer);
        }
    }, [toast.duration, onRemove]);

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${toastStyles[toast.type]}`}
            role="alert"
        >
            <div className="flex-shrink-0">{toastIcons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.title}</p>
                {toast.message && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{toast.message}</p>
                )}
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action?.onClick();
                            onRemove();
                        }}
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button
                onClick={onRemove}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Dismiss"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback(
        (title: string, message?: string) => addToast({ type: 'success', title, message }),
        [addToast]
    );

    const error = useCallback(
        (title: string, message?: string) => addToast({ type: 'error', title, message }),
        [addToast]
    );

    const warning = useCallback(
        (title: string, message?: string) => addToast({ type: 'warning', title, message }),
        [addToast]
    );

    const info = useCallback(
        (title: string, message?: string) => addToast({ type: 'info', title, message }),
        [addToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            {/* Toast Container */}
            <div
                className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
                aria-live="polite"
            >
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// Simple toast function for use without context (creates a temporary container)
export function toast(options: Omit<Toast, 'id'>) {
    const container = document.createElement('div');
    container.className = 'fixed bottom-4 right-4 z-50 max-w-sm w-full';
    document.body.appendChild(container);

    const id = `toast-${Date.now()}`;
    const toastElement = document.createElement('div');
    toastElement.className = `flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${toastStyles[options.type]}`;
    toastElement.innerHTML = `
        <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">${options.title}</p>
            ${options.message ? `<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">${options.message}</p>` : ''}
        </div>
    `;

    container.appendChild(toastElement);

    setTimeout(() => {
        toastElement.remove();
        if (container.children.length === 0) {
            container.remove();
        }
    }, options.duration || 5000);

    return id;
}
