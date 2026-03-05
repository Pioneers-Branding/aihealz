"use client";

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ui/confirm-modal';

interface FooterTemplate {
    id: string;
    ruleName: string;
    matchType: 'city' | 'country' | 'default';
    matchValue: string;
    templateData: Record<string, unknown>;
    priority: number;
    isActive: boolean;
    createdAt: string;
    geography?: {
        name: string;
        slug: string;
    };
}

interface FooterData {
    templates: FooterTemplate[];
}

export default function FooterPage() {
    const [data, setData] = useState<FooterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        ruleName: '',
        matchType: 'city' as 'city' | 'country' | 'default',
        matchValue: '',
        priority: 0,
    });
    const [saving, setSaving] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<FooterTemplate | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; templateId: string | null; templateName: string }>({
        isOpen: false,
        templateId: null,
        templateName: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/footer-manager?action=list');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Failed to fetch footer templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/footer-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    templateData: {
                        columns: [
                            { title: 'Company', links: ['About Us', 'Careers', 'Contact'] },
                            { title: 'Resources', links: ['For Doctors', 'Blog', 'FAQ'] },
                            { title: 'Legal', links: ['Privacy', 'Terms'] },
                        ],
                    },
                }),
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ ruleName: '', matchType: 'city', matchValue: '', priority: 0 });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to create template:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (template: FooterTemplate) => {
        setEditingTemplate(template);
        setFormData({
            ruleName: template.ruleName,
            matchType: template.matchType,
            matchValue: template.matchValue,
            priority: template.priority,
        });
        setShowModal(true);
    };

    const openDeleteModal = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, templateId: id, templateName: name });
    };

    const handleDelete = async () => {
        if (!deleteModal.templateId) return;
        const id = deleteModal.templateId;
        setDeleteModal({ isOpen: false, templateId: null, templateName: '' });

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/footer-manager?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchData();
            } else {
                setErrorMessage('Failed to delete template');
                setTimeout(() => setErrorMessage(null), 3000);
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
            setErrorMessage('Failed to delete template');
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/footer-manager', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingTemplate.id,
                    ...formData,
                    templateData: editingTemplate.templateData,
                }),
            });

            if (res.ok) {
                setShowModal(false);
                setEditingTemplate(null);
                setFormData({ ruleName: '', matchType: 'city', matchValue: '', priority: 0 });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update template:', error);
        } finally {
            setSaving(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTemplate(null);
        setFormData({ ruleName: '', matchType: 'city', matchValue: '', priority: 0 });
    };

    const staticFooterColumns = [
        { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
        { title: 'Information', links: ['For Doctors', 'Pricing', 'Verified Specialists', 'Medical Glossary'] },
        { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Editorial Guidelines'] },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-slate-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Loading footer templates...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Footer Template"
                message={`Are you sure you want to delete "${deleteModal.templateName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, templateId: null, templateName: '' })}
            />
            <div className="space-y-6 max-w-5xl">
            {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        Footer Manager
                    </h1>
                    <p className="text-slate-500 mt-1">Manage global footer columns and contextual dynamic links.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Template
                </button>
            </div>

            {/* Static Footer Columns Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Default Footer Columns</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {staticFooterColumns.map((col, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-slate-900">{col.title}</h4>
                                <button className="text-slate-400 hover:text-slate-900">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-1.5">
                                {col.links.map((link) => (
                                    <div key={link} className="flex items-center justify-between group">
                                        <span className="text-sm text-slate-600">{link}</span>
                                        <div className="hidden group-hover:flex items-center gap-1">
                                            <button className="text-slate-400 hover:text-rose-600">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-3 w-full py-1.5 border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs font-medium hover:border-slate-400 hover:text-slate-700 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Link
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Footer Templates */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Dynamic Footer Templates</h3>
                        <p className="text-sm text-slate-500 mt-1">Location-specific footer variations</p>
                    </div>
                    <span className="text-sm text-slate-500">
                        {data?.templates?.length || 0} template{(data?.templates?.length || 0) !== 1 ? 's' : ''}
                    </span>
                </div>

                {!data?.templates || data.templates.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No custom templates</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            Create location-specific footer templates to show relevant content.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                            Create Template
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Rule Name</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Match Type</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Match Value</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Priority</th>
                                <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase">Status</th>
                                <th className="text-right p-4 font-bold text-slate-600 text-xs uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.templates.map((template) => (
                                <tr key={template.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{template.ruleName}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            template.matchType === 'city'
                                                ? 'bg-blue-100 text-blue-700'
                                                : template.matchType === 'country'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {template.matchType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 font-mono text-xs">
                                        {template.matchValue}
                                        {template.geography && (
                                            <span className="ml-2 text-slate-400">({template.geography.name})</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600">{template.priority}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            template.isActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {template.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(template.id, template.ruleName)}
                                                disabled={deletingId === template.id}
                                                className="px-3 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded disabled:opacity-50"
                                            >
                                                {deletingId === template.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Dynamic Contextual Footer Info */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-indigo-900 mb-1">Dynamic Contextual Footer</h3>
                        <p className="text-sm text-indigo-700 leading-relaxed mb-4">
                            The footer component automatically injects up to 60 targeted dynamic links based on the user's current city and viewed specialty. Templates are matched in order of priority: city → country → default.
                        </p>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                                View Documentation
                            </button>
                            <button className="px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                                Preview Footer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Template Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {editingTemplate ? 'Edit Footer Template' : 'Create Footer Template'}
                        </h3>

                        <form onSubmit={editingTemplate ? handleUpdate : handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Rule Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.ruleName}
                                    onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                    placeholder="e.g., Mumbai Footer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Match Type *
                                </label>
                                <select
                                    value={formData.matchType}
                                    onChange={(e) => setFormData({ ...formData, matchType: e.target.value as 'city' | 'country' | 'default' })}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                >
                                    <option value="city">City</option>
                                    <option value="country">Country</option>
                                    <option value="default">Default</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Match Value
                                </label>
                                <input
                                    type="text"
                                    value={formData.matchValue}
                                    onChange={(e) => setFormData({ ...formData, matchValue: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                    placeholder="e.g., mumbai or in"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Use city slug or country code. Leave empty for default template.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Priority
                                </label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                    placeholder="0"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Higher priority templates are matched first.
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !formData.ruleName}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {saving ? (editingTemplate ? 'Updating...' : 'Creating...') : (editingTemplate ? 'Update Template' : 'Create Template')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
