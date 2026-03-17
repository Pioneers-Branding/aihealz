'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        advertiserId: '',
        objective: 'awareness',
        billingModel: 'cpm',
        totalBudget: '',
        dailyBudget: '',
        startDate: '',
        endDate: '',
        targetConditions: '',
        targetCities: '',
        targetSpecialties: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/advertising/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    totalBudget: parseFloat(formData.totalBudget) || 0,
                    dailyBudget: parseFloat(formData.dailyBudget) || 0,
                    advertiserId: parseInt(formData.advertiserId) || 0,
                    targetConditions: formData.targetConditions.split(',').map(s => s.trim()).filter(Boolean),
                    targetCities: formData.targetCities.split(',').map(s => s.trim()).filter(Boolean),
                    targetSpecialties: formData.targetSpecialties.split(',').map(s => s.trim()).filter(Boolean),
                }),
            });

            if (res.ok) {
                router.push('/admin/advertising/campaigns');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create campaign');
            }
        } catch {
            setError('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Campaign</h1>
                    <p className="text-slate-500 mt-1">Set up a new advertising campaign</p>
                </div>
                <Link
                    href="/admin/advertising/campaigns"
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Q1 2026 Cardiology Campaign"
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Objective</label>
                        <select
                            value={formData.objective}
                            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="awareness">Brand Awareness</option>
                            <option value="traffic">Website Traffic</option>
                            <option value="leads">Lead Generation</option>
                            <option value="conversions">Conversions</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Billing Model</label>
                        <select
                            value={formData.billingModel}
                            onChange={(e) => setFormData({ ...formData, billingModel: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="cpm">CPM (Cost per 1000 impressions)</option>
                            <option value="cpc">CPC (Cost per click)</option>
                            <option value="cpa">CPA (Cost per acquisition)</option>
                            <option value="flat">Flat Rate</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Budget ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.totalBudget}
                            onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="1000.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Daily Budget ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.dailyBudget}
                            onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="50.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Conditions (comma separated)</label>
                        <input
                            type="text"
                            value={formData.targetConditions}
                            onChange={(e) => setFormData({ ...formData, targetConditions: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="diabetes, hypertension, heart-disease"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Locations (comma separated)</label>
                        <input
                            type="text"
                            value={formData.targetCities}
                            onChange={(e) => setFormData({ ...formData, targetCities: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="mumbai, delhi, bangalore"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Specialties (comma separated)</label>
                        <input
                            type="text"
                            value={formData.targetSpecialties}
                            onChange={(e) => setFormData({ ...formData, targetSpecialties: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="cardiology, endocrinology"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link
                        href="/admin/advertising/campaigns"
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Campaign'}
                    </button>
                </div>
            </form>
        </div>
    );
}
