'use client';

import { useState, useEffect } from 'react';

interface NavItem {
    id: string;
    label: string;
    path: string;
    isMega: boolean;
    isActive: boolean;
    order: number;
}

const AVAILABLE_LINKS = [
    { label: 'Home', path: '/' },
    { label: 'Conditions', path: '/conditions' },
    { label: 'Treatments', path: '/treatments' },
    { label: 'Find Doctors', path: '/doctors' },
    { label: 'AI Remedies', path: '/remedies' },
    { label: 'Symptom Checker', path: '/symptoms' },
    { label: 'Health Tools', path: '/tools' },
];

export default function NavigationPage() {
    const [menuItems, setMenuItems] = useState<NavItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [editingItem, setEditingItem] = useState<NavItem | null>(null);

    useEffect(() => {
        fetchNavigation();
    }, []);

    async function fetchNavigation() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/navigation');
            if (res.ok) {
                const data = await res.json();
                setMenuItems(data.items || []);
            } else {
                // Default menu items
                setMenuItems([
                    { id: '1', label: 'Conditions', path: '/conditions', isMega: true, isActive: true, order: 1 },
                    { id: '2', label: 'Treatments', path: '/treatments', isMega: true, isActive: true, order: 2 },
                    { id: '3', label: 'Find Doctors', path: '/doctors', isMega: false, isActive: true, order: 3 },
                    { id: '4', label: 'AI Remedies', path: '/remedies', isMega: false, isActive: true, order: 4 },
                    { id: '5', label: 'Health Tools', path: '/tools', isMega: true, isActive: true, order: 5 },
                    { id: '6', label: 'Symptom Checker', path: '/symptoms', isMega: false, isActive: true, order: 6 },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch navigation:', error);
            // Fallback default items
            setMenuItems([
                { id: '1', label: 'Conditions', path: '/conditions', isMega: true, isActive: true, order: 1 },
                { id: '2', label: 'Treatments', path: '/treatments', isMega: true, isActive: true, order: 2 },
                { id: '3', label: 'Find Doctors', path: '/doctors', isMega: false, isActive: true, order: 3 },
            ]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/navigation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: menuItems }),
            });
            if (res.ok) {
                setHasChanges(false);
            } else {
                const data = await res.json();
                console.error('Failed to save navigation:', data.error);
            }
        } catch (error) {
            console.error('Failed to save navigation:', error);
        } finally {
            setSaving(false);
        }
    }

    function handleAddItem(link: { label: string; path: string }) {
        const exists = menuItems.some(item => item.path === link.path);
        if (exists) return;

        const newItem: NavItem = {
            id: `new-${Date.now()}`,
            label: link.label,
            path: link.path,
            isMega: false,
            isActive: true,
            order: menuItems.length + 1,
        };
        setMenuItems([...menuItems, newItem]);
        setHasChanges(true);
    }

    function handleRemoveItem(id: string) {
        setMenuItems(menuItems.filter(item => item.id !== id));
        setHasChanges(true);
    }

    function handleToggleMega(id: string) {
        setMenuItems(menuItems.map(item =>
            item.id === id ? { ...item, isMega: !item.isMega } : item
        ));
        setHasChanges(true);
    }

    function handleMoveUp(index: number) {
        if (index === 0) return;
        const newItems = [...menuItems];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        newItems.forEach((item, i) => item.order = i + 1);
        setMenuItems(newItems);
        setHasChanges(true);
    }

    function handleMoveDown(index: number) {
        if (index === menuItems.length - 1) return;
        const newItems = [...menuItems];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        newItems.forEach((item, i) => item.order = i + 1);
        setMenuItems(newItems);
        setHasChanges(true);
    }

    const availableToAdd = AVAILABLE_LINKS.filter(
        link => !menuItems.some(item => item.path === link.path)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-slate-500/30 border-t-slate-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Navigation Builder
                    </h1>
                    <p className="text-slate-500 mt-1">Configure main menu links, dropdowns, and mega-menus.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {hasChanges && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    You have unsaved changes
                </div>
            )}

            <div className="flex gap-6">
                <div className="w-1/3 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Available Links</h3>
                        <div className="space-y-2">
                            {availableToAdd.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">All links added</p>
                            ) : (
                                availableToAdd.map(link => (
                                    <div key={link.path} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-300">
                                        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                            </svg>
                                            {link.label}
                                        </span>
                                        <button
                                            onClick={() => handleAddItem(link)}
                                            className="text-teal-600 hover:text-teal-800"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-2/3">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[500px]">
                        <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                            <span>Main Menu Structure</span>
                            <span className="text-xs text-slate-400 font-normal">{menuItems.length} items</span>
                        </h3>

                        {menuItems.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <p>No menu items. Add links from the left panel.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {menuItems.map((item, i) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMoveUp(i)}
                                                disabled={i === 0}
                                                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(i)}
                                                disabled={i === menuItems.length - 1}
                                                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                {item.label}
                                                {item.isMega && (
                                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded uppercase tracking-wider font-bold border border-indigo-100">
                                                        Mega Menu
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{item.path}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleMega(item.id)}
                                                className={`p-1.5 rounded-md ${item.isMega ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                                                title={item.isMega ? 'Remove mega menu' : 'Make mega menu'}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
