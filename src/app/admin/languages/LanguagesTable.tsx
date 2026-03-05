"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/confirm-modal';

interface Language {
    code: string;
    name: string;
    nativeName: string | null;
    isActive: boolean;
    _count: {
        localizedContent: number;
        uiTranslations: number;
    };
}

interface LanguagesTableProps {
    languages: Language[];
}

export default function LanguagesTable({ languages }: LanguagesTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; languageCode: string | null; languageName: string }>({
        isOpen: false,
        languageCode: null,
        languageName: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const filteredLanguages = languages.filter(language => {
        const matchesSearch =
            language.name.toLowerCase().includes(search.toLowerCase()) ||
            language.code.toLowerCase().includes(search.toLowerCase()) ||
            language.nativeName?.toLowerCase().includes(search.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'active') return matchesSearch && language.isActive;
        if (filter === 'inactive') return matchesSearch && !language.isActive;
        return matchesSearch;
    });

    const openDeleteModal = (code: string, name: string) => {
        setDeleteModal({ isOpen: true, languageCode: code, languageName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.languageCode) return;
        const code = deleteModal.languageCode;
        setDeleteModal({ isOpen: false, languageCode: null, languageName: '' });

        setDeleting(code);
        try {
            const res = await fetch(`/api/admin/languages/${code}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                setErrorMessage(data.error || 'Failed to delete');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch {
            setErrorMessage('Failed to delete language');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setDeleting(null);
        }
    };

    const toggleActive = async (code: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/languages/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                router.refresh();
            }
        } catch {
            setErrorMessage('Failed to update status');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    return (
        <>
        <ConfirmModal
            isOpen={deleteModal.isOpen}
            title="Delete Language"
            message={`Are you sure you want to delete "${deleteModal.languageName}"? This will also delete all related content.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmVariant="danger"
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal({ isOpen: false, languageCode: null, languageName: '' })}
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
                    placeholder="Search languages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                    <option value="all">All Languages</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Language</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Code</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Native Name</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Content</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">UI Translations</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                            <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLanguages.map((language) => (
                            <tr key={language.code} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900">{language.name}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-sm font-mono rounded">
                                        {language.code}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {language.nativeName || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {language._count.localizedContent} pages
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                    {language._count.uiTranslations} strings
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleActive(language.code, language.isActive)}
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            language.isActive
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {language.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/languages/${language.code}`}
                                            className="px-3 py-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => openDeleteModal(language.code, language.name)}
                                            disabled={deleting === language.code}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                        >
                                            {deleting === language.code ? '...' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredLanguages.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No languages found matching your criteria.
                </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 text-sm text-slate-500">
                Showing {filteredLanguages.length} of {languages.length} languages
            </div>
        </div>
        </>
    );
}
