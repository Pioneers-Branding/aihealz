'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// INPUT COMPONENT
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    leftAddon?: string;
    rightAddon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        { label, error, hint, leftIcon, rightIcon, leftAddon, rightAddon, className = '', id, ...props },
        ref
    ) => {
        const inputId = id || props.name || `input-${Math.random().toString(36).slice(2)}`;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative flex">
                    {leftAddon && (
                        <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                            {leftAddon}
                        </span>
                    )}
                    <div className="relative flex-1">
                        {leftIcon && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {leftIcon}
                            </span>
                        )}
                        <input
                            ref={ref}
                            id={inputId}
                            className={`
                                w-full px-3 py-2.5 text-sm
                                bg-white dark:bg-gray-800
                                border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                ${leftAddon ? 'rounded-l-none' : 'rounded-l-lg'}
                                ${rightAddon ? 'rounded-r-none' : 'rounded-r-lg'}
                                ${leftIcon ? 'pl-10' : ''}
                                ${rightIcon ? 'pr-10' : ''}
                                text-gray-900 dark:text-white
                                placeholder-gray-400 dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:ring-opacity-50
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900
                                transition-colors
                                ${className}
                            `}
                            {...props}
                        />
                        {rightIcon && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {rightIcon}
                            </span>
                        )}
                    </div>
                    {rightAddon && (
                        <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                            {rightAddon}
                        </span>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
                {hint && !error && <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, showCount, className = '', id, maxLength, ...props }, ref) => {
        const textareaId = id || props.name || `textarea-${Math.random().toString(36).slice(2)}`;
        const [charCount, setCharCount] = React.useState(0);

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    maxLength={maxLength}
                    onChange={(e) => {
                        setCharCount(e.target.value.length);
                        props.onChange?.(e);
                    }}
                    className={`
                        w-full px-3 py-2.5 text-sm
                        bg-white dark:bg-gray-800
                        border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        rounded-lg
                        text-gray-900 dark:text-white
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:ring-opacity-50
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900
                        resize-y min-h-[100px]
                        transition-colors
                        ${className}
                    `}
                    {...props}
                />
                <div className="flex justify-between mt-1.5">
                    <div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {hint && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
                    </div>
                    {showCount && maxLength && (
                        <p className={`text-sm ${charCount >= maxLength ? 'text-red-500' : 'text-gray-500'}`}>
                            {charCount}/{maxLength}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 border-transparent',
    outline: 'bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border-transparent dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            children,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
                    inline-flex items-center justify-center gap-2
                    font-medium rounded-lg border
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                    ${variantStyles[variant]}
                    ${sizeStyles[size]}
                    ${fullWidth ? 'w-full' : ''}
                    ${className}
                `}
                {...props}
            >
                {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    leftIcon
                )}
                {children}
                {!loading && rightIcon}
            </button>
        );
    }
);
Button.displayName = 'Button';

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    description?: string;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, description, error, className = '', id, ...props }, ref) => {
        const checkboxId = id || props.name || `checkbox-${Math.random().toString(36).slice(2)}`;

        return (
            <div className={`flex items-start ${className}`}>
                <div className="flex items-center h-5">
                    <input
                        ref={ref}
                        id={checkboxId}
                        type="checkbox"
                        className={`
                            w-4 h-4
                            text-blue-600
                            border-gray-300 dark:border-gray-600
                            rounded
                            focus:ring-blue-500 focus:ring-2
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${error ? 'border-red-500' : ''}
                        `}
                        {...props}
                    />
                </div>
                {(label || description) && (
                    <div className="ml-3">
                        {label && (
                            <label htmlFor={checkboxId} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                {label}
                            </label>
                        )}
                        {description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        )}
                        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    </div>
                )}
            </div>
        );
    }
);
Checkbox.displayName = 'Checkbox';

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    name: string;
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    error?: string;
    orientation?: 'horizontal' | 'vertical';
}

export function RadioGroup({
    name,
    options,
    value,
    onChange,
    label,
    error,
    orientation = 'vertical',
}: RadioGroupProps) {
    return (
        <fieldset>
            {label && (
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </legend>
            )}
            <div className={`${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}`}>
                {options.map((option) => (
                    <div key={option.value} className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                type="radio"
                                id={`${name}-${option.value}`}
                                name={name}
                                value={option.value}
                                checked={value === option.value}
                                onChange={() => onChange?.(option.value)}
                                disabled={option.disabled}
                                className={`
                                    w-4 h-4
                                    text-blue-600
                                    border-gray-300 dark:border-gray-600
                                    focus:ring-blue-500 focus:ring-2
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            />
                        </div>
                        <div className="ml-3">
                            <label
                                htmlFor={`${name}-${option.value}`}
                                className={`text-sm font-medium ${option.disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300 cursor-pointer'}`}
                            >
                                {option.label}
                            </label>
                            {option.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </fieldset>
    );
}

// ============================================================================
// FORM FIELD WRAPPER
// ============================================================================

interface FormFieldProps {
    children: React.ReactNode;
    className?: string;
}

export function FormField({ children, className = '' }: FormFieldProps) {
    return <div className={`space-y-1.5 ${className}`}>{children}</div>;
}

// ============================================================================
// FORM GROUP
// ============================================================================

interface FormGroupProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

export function FormGroup({ children, title, description, className = '' }: FormGroupProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {(title || description) && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
                    {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
                </div>
            )}
            <div className="space-y-4">{children}</div>
        </div>
    );
}
