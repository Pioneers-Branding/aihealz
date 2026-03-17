"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/confirm-modal';

interface Content {
    id: number;
    conditionId: number;
    languageCode: string;
    geographyId: number | null;
    title: string;
    status: string;
    wordCount: number | null;
    createdAt: Date;
    updatedAt: Date;
    condition: { id: number; commonName: string; slug: string };
    language: { code: string; name: string };
    geography: { id: number; name: string; slug: string } | null;
    reviewer: { id: number; name: string } | null;
}

interface ContentTableProps {
    content: Content[];
}

const statusColors: Record<string, string> = {
    ai_draft: 'bg-amber-100 text-amber-700',
    under_review: 'bg-blue-100 text-blue-700',
    verified: 'bg-purple-100 text-purple-700',
    published: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
    ai_draft: 'AI Draft',
    under_review: 'Under Review',
    verified: 'Verified',
    published: 'Published',
};

export default function ContentTable({ content }: ContentTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterLanguage, setFilterLanguage] = useState<string>('all');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; contentId: number | null; contentTitle: string }>({
        isOpen: false,
        contentId: null,
        contentTitle: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Get unique languages for filter
    const languages = [...new Set(content.map(c => c.languageCode))].sort();

    const filteredContent = content.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.condition.commonName.toLowerCase().includes(search.toLowerCase()) ||
            item.geography?.name.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchesLanguage = filterLanguage === 'all' || item.languageCode === filterLanguage;

        return matchesSearch && matchesStatus && matchesLanguage;
    });

    const openDeleteModal = (id: number, title: string) => {
        setDeleteModal({ isOpen: true, contentId: id, contentTitle: title });
    };

    const handleDelete = async () => {
        if (!deleteModal.contentId) return;
        const id = deleteModal.contentId;
        setDeleteModal({ isOpen: false, contentId: null, contentTitle: '' });

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                setErrorMessage(data.error || 'Failed to delete');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch {
            setErrorMessage('Failed to delete content');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setDeleting(null);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/content/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                router.refresh();
            }
        } catch {
            setErrorMessage('Failed to update status');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
        <ConfirmModal
            isOpen={deleteModal.isOpen}
            title="Delete Content"
            message={`Are you sure you want to delete "${deleteModal.contentTitle}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmVariant="danger"
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal({ isOpen: false, contentId: null, contentTitle: '' })}
        />
        {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errorMessage}
            </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search content..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                    <option value="all">All Statuses</option>
                    <option value="ai_draft">AI Draft</option>
                    <option value="under_review">Under Review</option>
                    <option value="verified">Verified</option>
                    <option value="published">Published</option>
                </select>
                <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                    <option value="all">All Languages</option>
                    {languages.map(lang => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Title</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Condition</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Language</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Region</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Words</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Updated</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredContent.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900 truncate max-w-xs">{item.title}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/admin/conditions/${item.condition.id}`} className="text-sm text-teal-600 hover:text-teal-700">
                                        {item.condition.commonName}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                                        {item.languageCode}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {item.geography?.name || 'Global'}
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={item.status}
                                        onChange={(e) => updateStatus(item.id, e.target.value)}
                                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${statusColors[item.status]}`}
                                    >
                                        {Object.entries(statusLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {item.wordCount?.toLocaleString() || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500">
                                    {formatDate(item.updatedAt)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/content/${item.id}`}
                                            className="px-3 py-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(item.id, item.title)}
                                            disabled={deleting === item.id}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                        >
                                            {deleting === item.id ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredContent.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No content found matching your criteria.
                </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 text-sm text-slate-500">
                Showing {filteredContent.length} of {content.length} content pages
            </div>
        </div>
        </>
    );
}
