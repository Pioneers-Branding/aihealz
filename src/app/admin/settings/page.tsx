'use client';

import { useState } from 'react';
import ConfirmModal from '@/components/ui/confirm-modal';

interface FeatureFlag {
    name: string;
    key: string;
    enabled: boolean;
    disabled?: boolean;
}

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [features, setFeatures] = useState<FeatureFlag[]>([
        { name: 'Symptom Checker UI', key: 'symptom_checker', enabled: true },
        { name: 'Patient Vault (Coming Soon)', key: 'patient_vault', enabled: false, disabled: true },
        { name: 'Stripe Payments Checkout', key: 'stripe_payments', enabled: true },
        { name: 'Teleconsultation Video Rooms', key: 'teleconsultation', enabled: false, disabled: true },
    ]);
    const [purging, setPurging] = useState(false);
    const [purgeModal, setPurgeModal] = useState(false);

    const handleToggleFeature = (key: string) => {
        setFeatures(prev => prev.map(f =>
            f.key === key ? { ...f, enabled: !f.enabled } : f
        ));
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        setSaveMessage(null);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    features: features.filter(f => !f.disabled).map(f => ({
                        key: f.key,
                        enabled: f.enabled,
                    })),
                }),
            });

            if (res.ok) {
                setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    const handlePurgeCache = async () => {
        setPurgeModal(false);
        setPurging(true);
        try {
            const res = await fetch('/api/admin/settings/purge-cache', {
                method: 'POST',
            });

            if (res.ok) {
                setSaveMessage({ type: 'success', text: 'Translation cache cleared successfully!' });
            } else {
                throw new Error('Failed to purge');
            }
        } catch (error) {
            console.error('Failed to purge cache:', error);
            setSaveMessage({ type: 'error', text: 'Failed to clear cache. Please try again.' });
        } finally {
            setPurging(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={purgeModal}
                title="Clear Translation Cache"
                message="Are you sure you want to clear the translation cache? This action cannot be undone. Next requests will re-hit the translation API."
                confirmText="Purge Cache"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handlePurgeCache}
                onCancel={() => setPurgeModal(false)}
            />
            <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Platform Settings
                    </h1>
                    <p className="text-slate-500 mt-1">Manage global API keys, webhook endpoints, and platform variables.</p>
                </div>
                <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {saveMessage && (
                <div className={`p-4 rounded-lg ${
                    saveMessage.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}>
                    {saveMessage.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                    API Keys
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Environment Variables</span>
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    API keys are managed through environment variables for security. Update them in your deployment settings or .env file.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">OpenRouter API Key (LLM Generation)</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={process.env.NEXT_PUBLIC_OPENROUTER_KEY ? '••••••••••••••••' : 'Not configured'}
                                readOnly
                                className="flex-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-500 font-mono text-sm"
                            />
                            <span className={`px-3 py-2 rounded-lg text-xs font-medium ${
                                process.env.NEXT_PUBLIC_OPENROUTER_KEY
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                            }`}>
                                {process.env.NEXT_PUBLIC_OPENROUTER_KEY ? 'Configured' : 'Missing'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Stripe Secret Key</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value="••••••••••••••••"
                                readOnly
                                className="flex-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-500 font-mono text-sm"
                            />
                            <span className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                                Configured
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Database URL</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value="••••••••••••••••"
                                readOnly
                                className="flex-1 border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-500 font-mono text-sm"
                            />
                            <span className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                                Connected
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Features & Feature Flags</h3>

                <div className="space-y-4">
                    {features.map((feature) => (
                        <div key={feature.key} className="flex items-center justify-between">
                            <div>
                                <span className={`font-medium ${feature.disabled ? 'text-slate-400' : 'text-slate-700'}`}>
                                    {feature.name}
                                </span>
                                {feature.disabled && (
                                    <span className="ml-2 text-xs text-slate-400">(Not available)</span>
                                )}
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={feature.enabled}
                                    disabled={feature.disabled}
                                    onChange={() => handleToggleFeature(feature.key)}
                                />
                                <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                    feature.disabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'peer-checked:bg-teal-600 peer-focus:ring-4 peer-focus:ring-teal-300 cursor-pointer'
                                }`} />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 text-rose-600">Danger Zone</h3>

                <div className="p-4 border border-rose-200 rounded-xl bg-rose-50 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-rose-900 text-sm">Clear Translation Cache</h4>
                        <p className="text-xs text-rose-700 mt-1">Wipes the translation_cache table. Next requests will re-hit the translation API.</p>
                    </div>
                    <button
                        onClick={() => setPurgeModal(true)}
                        disabled={purging}
                        className="px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                    >
                        {purging ? 'Purging...' : 'Purge Cache'}
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}
