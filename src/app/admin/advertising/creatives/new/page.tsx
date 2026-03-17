'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCreativePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        advertiserId: '',
        name: '',
        adType: 'banner',
        headline: '',
        description: '',
        ctaText: 'Learn More',
        destinationUrl: '',
        imageUrl: '',
        width: '',
        height: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/advertising/creatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    advertiserId: parseInt(formData.advertiserId) || 0,
                    width: formData.width ? parseInt(formData.width) : null,
                    height: formData.height ? parseInt(formData.height) : null,
                }),
            });

            if (res.ok) {
                router.push('/admin/advertising/creatives');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create creative');
            }
        } catch {
            setError('Failed to create creative');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Upload New Creative</h1>
                    <p className="text-slate-500 mt-1">Create a new ad creative</p>
                </div>
                <Link
                    href="/admin/advertising/creatives"
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    Cancel
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Creative Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Banner Ad - Diabetes Awareness"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Advertiser ID</label>
                        <input
                            type="number"
                            required
                            value={formData.advertiserId}
                            onChange={(e) => setFormData({ ...formData, advertiserId: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Enter advertiser ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Type</label>
                        <select
                            value={formData.adType}
                            onChange={(e) => setFormData({ ...formData, adType: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="banner">Banner</option>
                            <option value="native">Native Ad</option>
                            <option value="text">Text Ad</option>
                            <option value="sponsored">Sponsored</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Width (px)</label>
                        <input
                            type="number"
                            value={formData.width}
                            onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Height (px)</label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="250"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                        <input
                            type="text"
                            value={formData.headline}
                            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Your attention-grabbing headline"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Brief description of the ad"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CTA Button Text</label>
                        <input
                            type="text"
                            value={formData.ctaText}
                            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Learn More"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Destination URL</label>
                        <input
                            type="url"
                            required
                            value={formData.destinationUrl}
                            onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="https://example.com/landing-page"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="https://example.com/ad-image.jpg"
                        />
                        <p className="text-xs text-slate-500 mt-1">Direct URL to the creative image</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link
                        href="/admin/advertising/creatives"
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Creative'}
                    </button>
                </div>
            </form>
        </div>
    );
}
