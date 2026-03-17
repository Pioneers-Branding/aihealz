"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/confirm-modal';

interface Condition {
    id: number;
    slug: string;
    scientificName: string;
    commonName: string;
    description: string | null;
    specialistType: string;
    severityLevel: string | null;
    icdCode: string | null;
    bodySystem: string | null;
    isActive: boolean;
    createdAt: string;
    _count: {
        localizedContent: number;
        doctorSpecialties: number;
    };
}

interface SearchResult {
    conditions: Condition[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export default function ConditionsTable({ specialties }: { specialties: string[] }) {
    const router = useRouter();
    const [data, setData] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [sortBy, setSortBy] = useState('commonName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; conditionId: number | null; conditionName: string }>({
        isOpen: false,
        conditionId: null,
        conditionName: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = useCallback(async (params: {
        q: string; page: number; pageSize: number;
        specialty: string; status: string; sortBy: string; sortDir: string;
    }) => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const qs = new URLSearchParams({
                q: params.q,
                page: String(params.page),
                pageSize: String(params.pageSize),
                specialty: params.specialty,
                status: params.status,
                sortBy: params.sortBy,
                sortDir: params.sortDir,
            });

            // Add timeout to prevent infinite loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const res = await fetch(`/api/admin/conditions/search?${qs}`, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const json: SearchResult = await res.json();
                setData(json);
            } else {
                const error = await res.json().catch(() => ({ error: 'Search failed' }));
                setErrorMessage(error.error || 'Failed to load conditions');
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setErrorMessage('Request timed out. The database may have too many conditions to load quickly.');
            } else {
                console.error('Failed to fetch conditions:', err);
                setErrorMessage('Failed to load conditions. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount + whenever filters change (except search which is debounced)
    useEffect(() => {
        fetchData({ q: search, page, pageSize, specialty, status, sortBy, sortDir });
    }, [page, pageSize, specialty, status, sortBy, sortDir, fetchData]);

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchData({ q: value, page: 1, pageSize, specialty, status, sortBy, sortDir });
        }, 350);
    };

    const openDeleteModal = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, conditionId: id, conditionName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.conditionId) return;
        const id = deleteModal.conditionId;
        setDeleteModal({ isOpen: false, conditionId: null, conditionName: '' });
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/conditions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData({ q: search, page, pageSize, specialty, status, sortBy, sortDir });
            } else {
                setErrorMessage('Failed to delete condition');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch {
            setErrorMessage('An error occurred');
            setTimeout(() => setErrorMessage(null), 3000);
        }
        setDeleting(null);
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/conditions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                fetchData({ q: search, page, pageSize, specialty, status, sortBy, sortDir });
            }
        } catch {
            setErrorMessage('Failed to update status');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        setPage(1);
    };

    const SortIcon = ({ field }: { field: string }) => (
        <span className="ml-1 inline-flex flex-col -space-y-1 text-[8px] leading-none">
            <span className={sortBy === field && sortDir === 'asc' ? 'text-teal-600' : 'text-slate-300'}>▲</span>
            <span className={sortBy === field && sortDir === 'desc' ? 'text-teal-600' : 'text-slate-300'}>▼</span>
        </span>
    );

    const conditions = data?.conditions || [];
    const total = data?.total || 0;
    const totalPages = data?.totalPages || 0;

    return (
        <>
        <ConfirmModal
            isOpen={deleteModal.isOpen}
            title="Delete Condition"
            message={`Are you sure you want to delete "${deleteModal.conditionName}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmVariant="danger"
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal({ isOpen: false, conditionId: null, conditionName: '' })}
        />
        {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errorMessage}
            </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search all conditions by name, scientific name, or slug..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        />
                    </div>
                    <select
                        value={specialty}
                        onChange={(e) => { setSpecialty(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                    >
                        <option value="">All Specialties</option>
                        {specialties.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {(['all', 'active', 'inactive'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => { setStatus(s); setPage(1); }}
                                className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${status === s
                                        ? s === 'active' ? 'bg-green-600 text-white'
                                            : s === 'inactive' ? 'bg-slate-600 text-white'
                                                : 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Show</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className="px-2 py-1 border border-slate-300 rounded text-sm"
                        >
                            {[25, 50, 100].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                        <span>per page</span>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="px-4 py-8 text-center">
                    <div className="inline-flex items-center gap-3 text-slate-500">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading conditions...</span>
                    </div>
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase cursor-pointer hover:text-teal-600"
                                    onClick={() => toggleSort('commonName')}
                                >
                                    Condition <SortIcon field="commonName" />
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase cursor-pointer hover:text-teal-600"
                                    onClick={() => toggleSort('specialistType')}
                                >
                                    Specialist <SortIcon field="specialistType" />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Body System</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Content</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Doctors</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {conditions.map((condition) => (
                                <tr key={condition.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-900">{condition.commonName}</p>
                                            <p className="text-sm text-slate-500">{condition.scientificName}</p>
                                            <p className="text-xs text-slate-400">/{condition.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{condition.specialistType}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{condition.bodySystem || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                                            {condition._count.localizedContent}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">
                                            {condition._count.doctorSpecialties}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleActive(condition.id, condition.isActive)}
                                            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${condition.isActive
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {condition.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/conditions/${condition.id}`}
                                                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/in/en/${condition.slug}`}
                                                target="_blank"
                                                className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded"
                                            >
                                                View ↗
                                            </Link>
                                            <button
                                                onClick={() => openDeleteModal(condition.id, condition.commonName)}
                                                disabled={deleting === condition.id}
                                                className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                            >
                                                {deleting === condition.id ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {conditions.length === 0 && (
                        <div className="px-4 py-12 text-center text-slate-500">
                            No conditions found matching your criteria
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Footer */}
            <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-slate-500">
                    Showing {conditions.length > 0 ? ((page - 1) * pageSize + 1).toLocaleString() : 0}–{Math.min(page * pageSize, total).toLocaleString()} of {total.toLocaleString()} conditions
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ««
                        </button>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ‹ Prev
                        </button>

                        {/* Page numbers */}
                        {(() => {
                            const pages: number[] = [];
                            const maxVisible = 5;
                            let start = Math.max(1, page - Math.floor(maxVisible / 2));
                            const end = Math.min(totalPages, start + maxVisible - 1);
                            start = Math.max(1, end - maxVisible + 1);

                            for (let i = start; i <= end; i++) pages.push(i);
                            return pages.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-3 py-1 text-sm font-medium rounded ${p === page
                                            ? 'bg-teal-600 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            ));
                        })()}

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next ›
                        </button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            »»
                        </button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
