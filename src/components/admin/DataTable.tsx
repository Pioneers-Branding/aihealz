"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface BulkAction<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedItems: T[]) => void;
    variant?: 'primary' | 'danger' | 'default';
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchKey?: keyof T;
    searchPlaceholder?: string;
    actions?: (item: T) => React.ReactNode;
    onDelete?: (item: T) => void;
    editHref?: (item: T) => string;
    itemKey: keyof T;
    emptyMessage?: string;
    selectable?: boolean;
    bulkActions?: BulkAction<T>[];
    onExport?: (data: T[]) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    searchKey,
    searchPlaceholder = 'Search...',
    actions,
    onDelete,
    editHref,
    itemKey,
    emptyMessage = 'No data found',
    selectable = false,
    bulkActions = [],
    onExport,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<unknown>>(new Set());
    const itemsPerPage = 20;

    // Filter data
    const filteredData = useMemo(() => {
        return searchKey
            ? data.filter((item) => {
                const value = item[searchKey];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(search.toLowerCase());
                }
                return true;
            })
            : data;
    }, [data, searchKey, search]);

    // Sort data
    const sortedData = useMemo(() => {
        return sortKey
            ? [...filteredData].sort((a, b) => {
                const aVal = a[sortKey as keyof T];
                const bVal = b[sortKey as keyof T];
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDir === 'asc'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
                }
                return 0;
            })
            : filteredData;
    }, [filteredData, sortKey, sortDir]);

    // Paginate
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const getValue = (item: T, key: string): unknown => {
        if (key.includes('.')) {
            const keys = key.split('.');
            let value: unknown = item;
            for (const k of keys) {
                if (value && typeof value === 'object') {
                    value = (value as Record<string, unknown>)[k];
                } else {
                    return undefined;
                }
            }
            return value;
        }
        return item[key as keyof T];
    };

    // Selection handlers
    const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item[itemKey]));
    const isSomeSelected = paginatedData.some(item => selectedIds.has(item[itemKey]));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            const newSelected = new Set(selectedIds);
            paginatedData.forEach(item => newSelected.delete(item[itemKey]));
            setSelectedIds(newSelected);
        } else {
            const newSelected = new Set(selectedIds);
            paginatedData.forEach(item => newSelected.add(item[itemKey]));
            setSelectedIds(newSelected);
        }
    };

    const toggleSelect = (item: T) => {
        const id = item[itemKey];
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectedItems = data.filter(item => selectedIds.has(item[itemKey]));

    const clearSelection = () => setSelectedIds(new Set());

    const handleExport = () => {
        if (onExport) {
            onExport(selectedItems.length > 0 ? selectedItems : sortedData);
        } else {
            // Default CSV export
            const exportData = selectedItems.length > 0 ? selectedItems : sortedData;
            const headers = columns.map(c => c.label).join(',');
            const rows = exportData.map(item =>
                columns.map(col => {
                    const val = getValue(item, String(col.key));
                    const strVal = val === null || val === undefined ? '' : String(val);
                    return `"${strVal.replace(/"/g, '""')}"`;
                }).join(',')
            ).join('\n');

            const csv = `${headers}\n${rows}`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'export.csv';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const getVariantClasses = (variant?: string) => {
        switch (variant) {
            case 'danger':
                return 'bg-rose-600 text-white hover:bg-rose-700';
            case 'primary':
                return 'bg-teal-600 text-white hover:bg-teal-700';
            default:
                return 'bg-slate-600 text-white hover:bg-slate-700';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                {/* Search */}
                {searchKey && (
                    <div className="flex-1 min-w-[200px] max-w-md">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">
                                {selectedIds.size} selected
                            </span>
                            <button
                                onClick={clearSelection}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedIds.size > 0 && bulkActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => action.onClick(selectedItems)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 ${getVariantClasses(action.variant)}`}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export {selectedIds.size > 0 ? `(${selectedIds.size})` : 'All'}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {selectable && (
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                                        }}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className={`px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider ${
                                        col.sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                                    }`}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.label}
                                        {col.sortable && (
                                            <span className={`${sortKey === col.key ? 'text-teal-600' : 'text-slate-300'}`}>
                                                {sortKey === col.key
                                                    ? (sortDir === 'asc' ? '↑' : '↓')
                                                    : '↕'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {(actions || onDelete || editHref) && (
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <tr
                                    key={String(item[itemKey])}
                                    className={`hover:bg-slate-50 ${selectedIds.has(item[itemKey]) ? 'bg-teal-50' : ''}`}
                                >
                                    {selectable && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(item[itemKey])}
                                                onChange={() => toggleSelect(item)}
                                                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={String(col.key)} className="px-4 py-3 text-sm text-slate-700">
                                            {col.render
                                                ? col.render(item)
                                                : String(getValue(item, String(col.key)) ?? '-')}
                                        </td>
                                    ))}
                                    {(actions || onDelete || editHref) && (
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {editHref && (
                                                    <Link
                                                        href={editHref(item)}
                                                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(item)}
                                                        className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {actions && actions(item)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions || onDelete || editHref ? 1 : 0)}
                                    className="px-4 py-12 text-center text-slate-500"
                                >
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        {emptyMessage}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="text-sm text-slate-600">
                    {sortedData.length > 0 ? (
                        <>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
                            {sortedData.length} results
                        </>
                    ) : (
                        'No results'
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-sm font-medium border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            First
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 text-sm font-medium rounded ${
                                            currentPage === pageNum
                                                ? 'bg-teal-600 text-white'
                                                : 'border border-slate-300 hover:bg-white'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-medium border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-sm font-medium border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Last
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
