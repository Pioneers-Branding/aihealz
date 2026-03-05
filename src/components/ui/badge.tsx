'use client';

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    removable?: boolean;
    onRemove?: () => void;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

const dotStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    secondary: 'bg-purple-500',
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    removable = false,
    onRemove,
    className = '',
}: BadgeProps) {
    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                font-medium rounded-full
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${className}
            `}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
            )}
            {children}
            {removable && onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 -mr-1 hover:opacity-75"
                    aria-label="Remove"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </span>
    );
}

// Status Badge - for showing online/offline/busy states
interface StatusBadgeProps {
    status: 'online' | 'offline' | 'busy' | 'away';
    label?: string;
    showLabel?: boolean;
    className?: string;
}

const statusStyles: Record<StatusBadgeProps['status'], { color: string; label: string }> = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-gray-400', label: 'Offline' },
    busy: { color: 'bg-red-500', label: 'Busy' },
    away: { color: 'bg-yellow-500', label: 'Away' },
};

export function StatusBadge({ status, label, showLabel = true, className = '' }: StatusBadgeProps) {
    const statusInfo = statusStyles[status];
    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
            {showLabel && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {label || statusInfo.label}
                </span>
            )}
        </span>
    );
}

// Notification Badge - for showing counts
interface NotificationBadgeProps {
    count: number;
    max?: number;
    variant?: 'default' | 'primary' | 'danger';
    size?: 'sm' | 'md';
    className?: string;
}

export function NotificationBadge({
    count,
    max = 99,
    variant = 'primary',
    size = 'md',
    className = '',
}: NotificationBadgeProps) {
    if (count <= 0) return null;

    const displayCount = count > max ? `${max}+` : count;

    const variantClasses = {
        default: 'bg-gray-500 text-white',
        primary: 'bg-blue-600 text-white',
        danger: 'bg-red-600 text-white',
    };

    const sizeClasses = {
        sm: 'min-w-[16px] h-4 text-[10px] px-1',
        md: 'min-w-[20px] h-5 text-xs px-1.5',
    };

    return (
        <span
            className={`
                inline-flex items-center justify-center
                font-medium rounded-full
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${className}
            `}
        >
            {displayCount}
        </span>
    );
}

// Verification Badge
interface VerificationBadgeProps {
    verified: boolean;
    label?: string;
    className?: string;
}

export function VerificationBadge({ verified, label, className = '' }: VerificationBadgeProps) {
    if (!verified) return null;

    return (
        <span
            className={`inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 ${className}`}
            title={label || 'Verified'}
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {label && <span className="text-sm font-medium">{label}</span>}
        </span>
    );
}

// Tier/Subscription Badge
interface TierBadgeProps {
    tier: 'free' | 'basic' | 'premium' | 'enterprise';
    className?: string;
}

const tierStyles: Record<TierBadgeProps['tier'], { bg: string; text: string; label: string }> = {
    free: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Free' },
    basic: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', label: 'Basic' },
    premium: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-700 dark:text-purple-300', label: 'Premium' },
    enterprise: { bg: 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50', text: 'text-amber-700 dark:text-amber-300', label: 'Enterprise' },
};

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
    const style = tierStyles[tier];
    return (
        <span
            className={`
                inline-flex items-center gap-1
                px-2 py-0.5 text-xs font-medium rounded
                ${style.bg} ${style.text}
                ${className}
            `}
        >
            {tier === 'premium' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )}
            {tier === 'enterprise' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 5.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 11H13a1 1 0 100-2H8.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
            )}
            {style.label}
        </span>
    );
}
