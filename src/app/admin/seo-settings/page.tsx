'use client';

import { useState, useEffect } from 'react';

interface SEOSettings {
    schemas: {
        organization: boolean;
        medicalWebPage: boolean;
        breadcrumbs: boolean;
        faq: boolean;
    };
    metaTemplates: {
        condition: string;
        treatment: string;
        doctor: string;
        city: string;
    };
    indexingApi: {
        googleKeyJson: string;
        bingApiKey: string;
        verified: boolean;
    };
    canonicalRules: {
        trailingSlash: boolean;
        wwwRedirect: boolean;
        httpsOnly: boolean;
    };
}

export default function SeoSettingsPage() {
    const [settings, setSettings] = useState<SEOSettings>({
        schemas: {
            organization: true,
            medicalWebPage: true,
            breadcrumbs: true,
            faq: true,
        },
        metaTemplates: {
            condition: 'Best [Condition] Doctors in [City] | Symptoms & Treatments',
            treatment: '[Treatment] Cost & Top Hospitals in [City]',
            doctor: 'Dr. [Name] - [Specialty] in [City] | Reviews & Appointment',
            city: 'Top Doctors & Hospitals in [City] | Healthcare Guide',
        },
        indexingApi: {
            googleKeyJson: '',
            bingApiKey: '',
            verified: false,
        },
        canonicalRules: {
            trailingSlash: false,
            wwwRedirect: true,
            httpsOnly: true,
        },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seo-settings');
            if (res.ok) {
                const data = await res.json();
                if (data.settings) {
                    setSettings(data.settings);
                }
            }
        } catch (error) {
            console.error('Failed to fetch SEO settings:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setSaveMessage(null);
        try {
            const res = await fetch('/api/admin/seo-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setHasChanges(false);
                setSaveMessage({ type: 'success', text: 'SEO settings saved successfully' });
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                const data = await res.json();
                setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    }

    async function handleVerifyCredentials() {
        setVerifying(true);
        try {
            const res = await fetch('/api/admin/seo-settings/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleKeyJson: settings.indexingApi.googleKeyJson,
                    bingApiKey: settings.indexingApi.bingApiKey,
                }),
            });
            const data = await res.json();
            setSettings(prev => ({
                ...prev,
                indexingApi: { ...prev.indexingApi, verified: data.verified || false },
            }));
            if (data.verified) {
                setSaveMessage({ type: 'success', text: 'Credentials verified successfully' });
            } else {
                setSaveMessage({ type: 'error', text: data.error || 'Verification failed' });
            }
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error('Verification failed:', error);
            setSaveMessage({ type: 'error', text: 'Verification failed' });
        } finally {
            setVerifying(false);
        }
    }

    function updateSchema(key: keyof typeof settings.schemas, value: boolean) {
        setSettings(prev => ({
            ...prev,
            schemas: { ...prev.schemas, [key]: value },
        }));
        setHasChanges(true);
    }

    function updateTemplate(key: keyof typeof settings.metaTemplates, value: string) {
        setSettings(prev => ({
            ...prev,
            metaTemplates: { ...prev.metaTemplates, [key]: value },
        }));
        setHasChanges(true);
    }

    function updateCanonical(key: keyof typeof settings.canonicalRules, value: boolean) {
        setSettings(prev => ({
            ...prev,
            canonicalRules: { ...prev.canonicalRules, [key]: value },
        }));
        setHasChanges(true);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        SEO & Meta Settings
                    </h1>
                    <p className="text-slate-500 mt-1">Configure global schema, canonical rules, and meta patterns.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {saveMessage && (
                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    saveMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    {saveMessage.type === 'success' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    {saveMessage.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Global Schema JSON-LD</h3>
                <div className="space-y-4">
                    {[
                        { key: 'organization' as const, label: 'Organization Schema', desc: 'Injects base aihealz organization schema on all pages.' },
                        { key: 'medicalWebPage' as const, label: 'MedicalWebPage Schema', desc: 'Auto-injects on condition, treatment, and directory pages.' },
                        { key: 'breadcrumbs' as const, label: 'Breadcrumb Schema', desc: 'Adds breadcrumb structured data for better navigation in search results.' },
                        { key: 'faq' as const, label: 'FAQ Schema', desc: 'Auto-generates FAQ schema from condition FAQs.' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-slate-800">{label}</div>
                                <div className="text-sm text-slate-500">{desc}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.schemas[key]}
                                    onChange={(e) => updateSchema(key, e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Meta Title Patterns</h3>
                <div className="space-y-4">
                    {[
                        { key: 'condition' as const, label: 'Conditions Template (City)' },
                        { key: 'treatment' as const, label: 'Treatments Template (City)' },
                        { key: 'doctor' as const, label: 'Doctor Profile Template' },
                        { key: 'city' as const, label: 'City Directory Template' },
                    ].map(({ key, label }) => (
                        <div key={key}>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    className="flex-1 border border-slate-200 rounded-l-lg p-2 bg-slate-50 text-slate-700 font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    value={settings.metaTemplates[key]}
                                    onChange={(e) => updateTemplate(key, e.target.value)}
                                />
                                <div className="bg-slate-100 border-y border-r border-slate-200 rounded-r-lg px-3 py-2 text-sm text-slate-500">| aihealz</div>
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-slate-400 mt-2">
                        Available placeholders: [Condition], [Treatment], [City], [Name], [Specialty], [Country]
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Canonical Rules</h3>
                <div className="space-y-4">
                    {[
                        { key: 'trailingSlash' as const, label: 'Trailing Slash', desc: 'Add trailing slash to all URLs (e.g., /conditions/ vs /conditions)' },
                        { key: 'wwwRedirect' as const, label: 'WWW Redirect', desc: 'Redirect non-www to www version of the site' },
                        { key: 'httpsOnly' as const, label: 'HTTPS Only', desc: 'Force HTTPS on all pages' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-slate-800">{label}</div>
                                <div className="text-sm text-slate-500">{desc}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.canonicalRules[key]}
                                    onChange={(e) => updateCanonical(key, e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Indexing API</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Google Indexing API Key (JSON)</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 text-slate-600 font-mono text-xs h-24 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={settings.indexingApi.googleKeyJson}
                            onChange={(e) => {
                                setSettings(prev => ({
                                    ...prev,
                                    indexingApi: { ...prev.indexingApi, googleKeyJson: e.target.value, verified: false },
                                }));
                                setHasChanges(true);
                            }}
                            placeholder='{"type": "service_account", "project_id": "...", ...}'
                            spellCheck={false}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Bing Webmaster API Key</label>
                        <input
                            type="password"
                            className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-600 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={settings.indexingApi.bingApiKey}
                            onChange={(e) => {
                                setSettings(prev => ({
                                    ...prev,
                                    indexingApi: { ...prev.indexingApi, bingApiKey: e.target.value, verified: false },
                                }));
                                setHasChanges(true);
                            }}
                            placeholder="Enter Bing API key..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleVerifyCredentials}
                            disabled={verifying}
                            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 flex items-center gap-2"
                        >
                            {verifying ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : null}
                            {verifying ? 'Verifying...' : 'Verify Credentials'}
                        </button>
                        {settings.indexingApi.verified && (
                            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
