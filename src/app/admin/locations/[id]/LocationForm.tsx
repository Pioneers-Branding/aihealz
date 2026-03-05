"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Location {
    id: number;
    name: string;
    slug: string;
    level: string;
    parentId: number | null;
    latitude: string | null;
    longitude: string | null;
    supportedLanguages: string[];
    population: string | null;
    timezone: string | null;
    isoCode: string | null;
    localeConfig: unknown;
    isActive: boolean;
}

interface ParentOption {
    id: number;
    name: string;
    slug: string;
    level: string;
}

interface LanguageOption {
    code: string;
    name: string;
}

// GeoLevel enum values from database schema
const levelOptions = [
    { value: 'continent', label: 'Continent' },
    { value: 'country', label: 'Country' },
    { value: 'state', label: 'State/Province' },
    { value: 'city', label: 'City' },
    { value: 'locality', label: 'Locality' },
];

// Default timezone options used when no timezones exist in database
const defaultTimezones = [
    'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Hong_Kong', 'Asia/Seoul', 'Asia/Bangkok', 'Asia/Jakarta',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Rome',
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'America/Toronto', 'America/Sao_Paulo', 'America/Mexico_City',
    'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
    'Africa/Cairo', 'Africa/Lagos', 'Africa/Johannesburg',
];

export default function LocationForm({
    location,
    parentOptions,
    languages,
    timezoneOptions: propTimezones,
}: {
    location: Location | null;
    parentOptions: ParentOption[];
    languages: LanguageOption[];
    timezoneOptions?: string[];
}) {
    // Merge dynamic timezones with defaults, removing duplicates
    const timezones = Array.from(new Set([
        ...(propTimezones?.length ? propTimezones : []),
        ...defaultTimezones,
    ])).sort();

    // State for custom timezone input
    const [showCustomTimezone, setShowCustomTimezone] = useState(false);
    const [customTimezone, setCustomTimezone] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: location?.name || '',
        slug: location?.slug || '',
        level: location?.level || 'city',
        parentId: location?.parentId?.toString() || '',
        latitude: location?.latitude || '',
        longitude: location?.longitude || '',
        supportedLanguages: location?.supportedLanguages || ['en'],
        population: location?.population || '',
        timezone: location?.timezone || '',
        isoCode: location?.isoCode || '',
        isActive: location?.isActive ?? true,
    });

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            if (name === 'name' && !location) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleLanguageToggle = (langCode: string) => {
        setFormData(prev => ({
            ...prev,
            supportedLanguages: prev.supportedLanguages.includes(langCode)
                ? prev.supportedLanguages.filter(l => l !== langCode)
                : [...prev.supportedLanguages, langCode]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                slug: formData.slug,
                level: formData.level,
                parentId: formData.parentId ? parseInt(formData.parentId) : null,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                supportedLanguages: formData.supportedLanguages,
                population: formData.population ? parseInt(formData.population) : null,
                timezone: formData.timezone || null,
                isoCode: formData.isoCode || null,
                isActive: formData.isActive,
            };

            const url = location
                ? `/api/admin/locations/${location.id}`
                : '/api/admin/locations';

            const res = await fetch(url, {
                method: location ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save location');
            }

            router.push('/admin/locations');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Filter parent options based on level hierarchy
    const getValidParents = () => {
        const levelOrder = ['continent', 'country', 'state', 'city', 'locality'];
        const currentLevelIndex = levelOrder.indexOf(formData.level);

        if (currentLevelIndex <= 0) return [];

        const validParentLevels = levelOrder.slice(0, currentLevelIndex);
        return parentOptions.filter(p => validParentLevels.includes(p.level));
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
                <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="e.g., Mumbai"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            URL Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
                            placeholder="e.g., mumbai"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Level <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            {levelOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Parent Location
                        </label>
                        <select
                            name="parentId"
                            value={formData.parentId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            <option value="">No parent (top-level)</option>
                            {getValidParents().map(parent => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.name} ({parent.level})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ISO Code
                        </label>
                        <input
                            type="text"
                            name="isoCode"
                            value={formData.isoCode}
                            onChange={handleChange}
                            maxLength={5}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="e.g., IN, US"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Timezone
                        </label>
                        {showCustomTimezone ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customTimezone}
                                    onChange={(e) => setCustomTimezone(e.target.value)}
                                    placeholder="e.g., Asia/Manila"
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (customTimezone.trim()) {
                                            setFormData(prev => ({ ...prev, timezone: customTimezone.trim() }));
                                        }
                                        setShowCustomTimezone(false);
                                        setCustomTimezone('');
                                    }}
                                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomTimezone(false);
                                        setCustomTimezone('');
                                    }}
                                    className="px-3 py-2 text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    <option value="">Select timezone...</option>
                                    {timezones.map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomTimezone(true)}
                                    className="px-3 py-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
                                    title="Add custom timezone"
                                >
                                    + New
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Geographic Data */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Geographic Data</h2>

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Latitude
                        </label>
                        <input
                            type="number"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            step="0.0000001"
                            min="-90"
                            max="90"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="19.0760"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Longitude
                        </label>
                        <input
                            type="number"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            step="0.0000001"
                            min="-180"
                            max="180"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="72.8777"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Population
                        </label>
                        <input
                            type="number"
                            name="population"
                            value={formData.population}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="12442373"
                        />
                    </div>
                </div>
            </div>

            {/* Supported Languages */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Supported Languages</h2>
                <p className="text-sm text-slate-500">Select the languages supported in this location.</p>

                <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleLanguageToggle(lang.code)}
                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                formData.supportedLanguages.includes(lang.code)
                                    ? 'bg-teal-100 border-teal-300 text-teal-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {lang.name} ({lang.code})
                        </button>
                    ))}
                </div>

                {formData.supportedLanguages.length === 0 && (
                    <p className="text-sm text-amber-600">At least one language should be selected.</p>
                )}
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
                    <span className="text-sm text-slate-500">- Location will be available for selection</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/locations"
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                    ← Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : (location ? 'Update Location' : 'Create Location')}
                </button>
            </div>
        </form>
    );
}
