'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!mounted || !open) {
        return null;
    }

    return createPortal(
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>,
        document.body
    );
}

interface DialogContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error('Dialog components must be used within a Dialog provider');
    }
    return context;
}

interface DialogOverlayProps {
    className?: string;
}

export function DialogOverlay({ className = '' }: DialogOverlayProps) {
    const { onOpenChange } = useDialogContext();

    return (
        <div
            className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in ${className}`}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
        />
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
};

export function DialogContent({ children, className = '', size = 'md' }: DialogContentProps) {
    const { onOpenChange } = useDialogContext();
    const contentRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        },
        [onOpenChange]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        contentRef.current?.focus();
    }, []);

    return (
        <>
            <DialogOverlay />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    ref={contentRef}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                    className={`
                        relative w-full ${sizeClasses[size]}
                        bg-white dark:bg-gray-900
                        rounded-xl shadow-xl
                        animate-scale-in
                        focus:outline-none
                        ${className}
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </>
    );
}

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
    return (
        <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
            {children}
        </h2>
    );
}

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
    return (
        <p className={`mt-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
            {children}
        </p>
    );
}

interface DialogBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogBody({ children, className = '' }: DialogBodyProps) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
}

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 ${className}`}>
            {children}
        </div>
    );
}

interface DialogCloseProps {
    children?: React.ReactNode;
    className?: string;
    asChild?: boolean;
}

export function DialogClose({ children, className = '', asChild = false }: DialogCloseProps) {
    const { onOpenChange } = useDialogContext();

    if (asChild && React.isValidElement(children)) {
        const childProps = children.props as Record<string, unknown>;
        return React.cloneElement(children, {
            ...childProps,
            onClick: (e: React.MouseEvent) => {
                (childProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
                onOpenChange(false);
            },
        } as React.Attributes);
    }

    return (
        <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`
                absolute top-4 right-4
                p-1.5 rounded-lg
                text-gray-400 hover:text-gray-600 hover:bg-gray-100
                dark:hover:text-gray-300 dark:hover:bg-gray-800
                transition-colors
                ${className}
            `}
            aria-label="Close dialog"
        >
            {children || (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
        </button>
    );
}

// Alert Dialog variant for confirmations
interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: 'default' | 'danger';
    loading?: boolean;
}

export function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    variant = 'default',
    loading = false,
}: AlertDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        if (!loading) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="sm">
                <DialogClose />
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`
                            px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50
                            ${variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
