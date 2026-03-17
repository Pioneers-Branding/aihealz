'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface SelectProps {
    options: Option[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    searchable?: boolean;
    clearable?: boolean;
    name?: string;
    id?: string;
    'aria-label'?: string;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    error,
    className = '',
    searchable = false,
    clearable = false,
    name,
    id,
    'aria-label': ariaLabel,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable
        ? options.filter(
              (opt) =>
                  opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : options;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0) {
                    const option = filteredOptions[highlightedIndex];
                    if (!option.disabled) {
                        onChange?.(option.value);
                        setIsOpen(false);
                        setSearchQuery('');
                    }
                } else {
                    setIsOpen(true);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchQuery('');
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setHighlightedIndex((prev) =>
                        prev < filteredOptions.length - 1 ? prev + 1 : 0
                    );
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (isOpen) {
                    setHighlightedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredOptions.length - 1
                    );
                }
                break;
        }
    };

    // Scroll highlighted option into view
    useEffect(() => {
        if (isOpen && listRef.current && highlightedIndex >= 0) {
            const items = listRef.current.querySelectorAll('[role="option"]');
            items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, isOpen]);

    const handleSelect = (option: Option) => {
        if (option.disabled) return;
        onChange?.(option.value);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.('');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={value || ''} />}

            {/* Trigger button */}
            <button
                type="button"
                id={id}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                        if (searchable && !isOpen) {
                            setTimeout(() => inputRef.current?.focus(), 0);
                        }
                    }
                }}
                onKeyDown={handleKeyDown}
                className={`
                    w-full flex items-center justify-between gap-2
                    px-3 py-2.5 text-left
                    bg-white dark:bg-gray-800
                    border rounded-lg
                    transition-colors
                    ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : 'cursor-pointer'}
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                `}
            >
                <span className={`flex items-center gap-2 truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {selectedOption?.icon}
                    {selectedOption?.label || placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {clearable && value && (
                        <span
                            onClick={handleClear}
                            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    )}
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    {/* Search input */}
                    {searchable && (
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search..."
                                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Options list */}
                    <ul
                        ref={listRef}
                        role="listbox"
                        className="max-h-60 overflow-auto py-1"
                    >
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No options found
                            </li>
                        ) : (
                            filteredOptions.map((option, index) => (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={option.value === value}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 cursor-pointer
                                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                        ${option.value === value ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                                        ${highlightedIndex === index && !option.disabled ? 'bg-gray-100 dark:bg-gray-700' : ''}
                                    `}
                                >
                                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm ${option.value === value ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-900 dark:text-white'}`}>
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                    {option.value === value && (
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

// Multi-select variant
interface MultiSelectProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    maxSelections?: number;
}

export function MultiSelect({
    options,
    value = [],
    onChange,
    placeholder = 'Select options',
    disabled = false,
    error,
    className = '',
    maxSelections,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            if (maxSelections && value.length >= maxSelections) return;
            onChange([...value, optionValue]);
        }
    };

    const removeOption = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center flex-wrap gap-1.5
                    min-h-[42px] px-3 py-2 text-left
                    bg-white dark:bg-gray-800
                    border rounded-lg
                    ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {selectedOptions.length === 0 ? (
                    <span className="text-gray-400">{placeholder}</span>
                ) : (
                    selectedOptions.map((option) => (
                        <span
                            key={option.value}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded"
                        >
                            {option.label}
                            <button
                                type="button"
                                onClick={(e) => removeOption(option.value, e)}
                                className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    ))
                )}
            </button>

            {isOpen && (
                <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            className={`
                                flex items-center gap-2 px-3 py-2 cursor-pointer
                                hover:bg-gray-100 dark:hover:bg-gray-700
                                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <input
                                type="checkbox"
                                checked={value.includes(option.value)}
                                readOnly
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900 dark:text-white">{option.label}</span>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}
