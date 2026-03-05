"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Language {
    code: string;
    name: string;
    nativeName: string | null;
    isActive: boolean;
}

export default function LanguageForm({ language }: { language: Language | null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: language?.code || '',
        name: language?.name || '',
        nativeName: language?.nativeName || '',
        isActive: language?.isActive ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                code: formData.code.toLowerCase(),
                name: formData.name,
                nativeName: formData.nativeName || null,
                isActive: formData.isActive,
            };

            const url = language
                ? `/api/admin/languages/${language.code}`
                : '/api/admin/languages';

            const res = await fetch(url, {
                method: language ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save language');
            }

            router.push('/admin/languages');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Language Details</h2>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Language Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        disabled={!!language}
                        maxLength={5}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                        placeholder="e.g., en, hi, es"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        ISO 639-1 code (2 letters) or ISO 639-2 code (3 letters). Cannot be changed after creation.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Language Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="e.g., English, Hindi, Spanish"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Native Name
                    </label>
                    <input
                        type="text"
                        name="nativeName"
                        value={formData.nativeName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="e.g., English, हिन्दी, Español"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        The name of the language in that language itself.
                    </p>
                </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-700">Active</span>
                    <span className="text-sm text-slate-500">- Language will be available for content</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/languages"
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                    ← Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : (language ? 'Update Language' : 'Create Language')}
                </button>
            </div>
        </form>
    );
}
