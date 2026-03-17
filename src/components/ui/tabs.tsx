'use client';

import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
}

interface TabsProps {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const activeTab = value ?? internalValue;

    const setActiveTab = (newValue: string) => {
        if (!value) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
    return (
        <div
            className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}
            role="tablist"
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export function TabsTrigger({ value, children, disabled = false, className = '' }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${value}`}
            disabled={disabled}
            onClick={() => setActiveTab(value)}
            className={`
                relative px-4 py-2.5 text-sm font-medium transition-colors
                ${isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
        >
            {children}
            {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    forceMount?: boolean;
}

export function TabsContent({ value, children, className = '', forceMount = false }: TabsContentProps) {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === value;

    if (!isActive && !forceMount) {
        return null;
    }

    return (
        <div
            role="tabpanel"
            id={`tabpanel-${value}`}
            aria-labelledby={`tab-${value}`}
            hidden={!isActive}
            className={`focus:outline-none ${className}`}
            tabIndex={0}
        >
            {children}
        </div>
    );
}

// Pill-style variant
interface PillTabsProps {
    tabs: { value: string; label: string; icon?: React.ReactNode; count?: number }[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function PillTabs({ tabs, value, onChange, className = '' }: PillTabsProps) {
    return (
        <div className={`inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
                        ${value === tab.value
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }
                    `}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                        <span className={`
                            px-1.5 py-0.5 text-xs rounded-full
                            ${value === tab.value
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                            }
                        `}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

// Vertical tabs for sidebars
interface VerticalTabsProps {
    tabs: { value: string; label: string; icon?: React.ReactNode; description?: string }[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function VerticalTabs({ tabs, value, onChange, className = '' }: VerticalTabsProps) {
    return (
        <nav className={`flex flex-col gap-1 ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`
                        flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors
                        ${value === tab.value
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                        }
                    `}
                >
                    {tab.icon && (
                        <span className={value === tab.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}>
                            {tab.icon}
                        </span>
                    )}
                    <div>
                        <div className="text-sm font-medium">{tab.label}</div>
                        {tab.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">{tab.description}</div>
                        )}
                    </div>
                </button>
            ))}
        </nav>
    );
}
