"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Condition {
    id: number;
    slug: string;
    scientificName: string;
    commonName: string;
    description: string | null;
    symptoms: unknown;
    treatments: unknown;
    faqs: unknown;
    specialistType: string;
    severityLevel: string | null;
    icdCode: string | null;
    bodySystem: string | null;
    isActive: boolean;
}

interface FAQItem {
    q: string;
    a: string;
}

interface ConditionFormProps {
    condition: Condition | null;
    specialistOptions?: string[];
    bodySystemOptions?: string[];
    severityOptions?: string[];
}

// Default options used as fallback when no data exists in database
const defaultBodySystemOptions = [
    'Cardiovascular', 'Respiratory', 'Digestive', 'Nervous', 'Musculoskeletal',
    'Endocrine', 'Immune', 'Integumentary', 'Urinary', 'Reproductive',
    'Lymphatic', 'Sensory', 'Mental Health'
];

const defaultSpecialistOptions = [
    'Cardiologist', 'Pulmonologist', 'Gastroenterologist', 'Neurologist',
    'Orthopedist', 'Endocrinologist', 'Immunologist', 'Dermatologist',
    'Urologist', 'Gynecologist', 'Oncologist', 'Psychiatrist', 'General Physician',
    'Pediatrician', 'ENT Specialist', 'Ophthalmologist', 'Rheumatologist'
];

const defaultSeverityOptions = ['mild', 'moderate', 'severe', 'critical'];

export default function ConditionForm({
    condition,
    specialistOptions: propSpecialistOptions,
    bodySystemOptions: propBodySystemOptions,
    severityOptions: propSeverityOptions,
}: ConditionFormProps) {
    // Merge dynamic options with defaults, removing duplicates
    const specialistOptions = Array.from(new Set([
        ...(propSpecialistOptions?.length ? propSpecialistOptions : []),
        ...defaultSpecialistOptions,
    ])).sort();

    const bodySystemOptions = Array.from(new Set([
        ...(propBodySystemOptions?.length ? propBodySystemOptions : []),
        ...defaultBodySystemOptions,
    ])).sort();

    const severityOptions = Array.from(new Set([
        ...(propSeverityOptions?.length ? propSeverityOptions : []),
        ...defaultSeverityOptions,
    ])).sort();

    // State for custom value inputs
    const [showCustomSpecialist, setShowCustomSpecialist] = useState(false);
    const [customSpecialist, setCustomSpecialist] = useState('');
    const [showCustomBodySystem, setShowCustomBodySystem] = useState(false);
    const [customBodySystem, setCustomBodySystem] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parse FAQs from condition data
    const parseFaqs = (faqs: unknown): FAQItem[] => {
        if (Array.isArray(faqs)) {
            return faqs.filter((f): f is FAQItem =>
                typeof f === 'object' && f !== null && 'q' in f && 'a' in f
            );
        }
        return [];
    };

    const [formData, setFormData] = useState({
        commonName: condition?.commonName || '',
        scientificName: condition?.scientificName || '',
        slug: condition?.slug || '',
        description: condition?.description || '',
        specialistType: condition?.specialistType || '',
        bodySystem: condition?.bodySystem || '',
        severityLevel: condition?.severityLevel || '',
        icdCode: condition?.icdCode || '',
        symptoms: Array.isArray(condition?.symptoms) ? (condition.symptoms as string[]).join('\n') : '',
        treatments: Array.isArray(condition?.treatments) ? (condition.treatments as string[]).join('\n') : '',
        isActive: condition?.isActive ?? true,
    });

    const [faqs, setFaqs] = useState<FAQItem[]>(parseFaqs(condition?.faqs));

    const addFaq = () => {
        setFaqs([...faqs, { q: '', a: '' }]);
    };

    const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
        const updated = [...faqs];
        updated[index] = { ...updated[index], [field]: value };
        setFaqs(updated);
    };

    const removeFaq = (index: number) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            // Auto-generate slug from common name
            if (name === 'commonName' && !condition) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Parse symptoms and treatments from newline-separated text
            const symptoms = formData.symptoms.split('\n').map(s => s.trim()).filter(Boolean);
            const treatments = formData.treatments.split('\n').map(t => t.trim()).filter(Boolean);

            // Filter out empty FAQs
            const validFaqs = faqs.filter(f => f.q.trim() && f.a.trim());

            const payload = {
                commonName: formData.commonName,
                scientificName: formData.scientificName,
                slug: formData.slug,
                description: formData.description || null,
                specialistType: formData.specialistType,
                bodySystem: formData.bodySystem || null,
                severityLevel: formData.severityLevel || null,
                icdCode: formData.icdCode || null,
                symptoms,
                treatments,
                faqs: validFaqs,
                isActive: formData.isActive,
            };

            const url = condition
                ? `/api/admin/conditions/${condition.id}`
                : '/api/admin/conditions';

            const res = await fetch(url, {
                method: condition ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save condition');
            }

            router.push('/admin/conditions');
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
                <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Common Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="commonName"
                            value={formData.commonName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="e.g., Diabetes"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Scientific Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="scientificName"
                            value={formData.scientificName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="e.g., Diabetes Mellitus"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                            placeholder="e.g., diabetes"
                        />
                        <p className="text-xs text-slate-500 mt-1">URL: /in/en/{formData.slug || 'slug'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ICD-10 Code
                        </label>
                        <input
                            type="text"
                            name="icdCode"
                            value={formData.icdCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="e.g., E11"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="Brief description of the condition..."
                    />
                </div>
            </div>

            {/* Classification */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Classification</h2>

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Specialist Type <span className="text-red-500">*</span>
                        </label>
                        {showCustomSpecialist ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customSpecialist}
                                    onChange={(e) => setCustomSpecialist(e.target.value)}
                                    placeholder="Enter custom specialist..."
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (customSpecialist.trim()) {
                                            setFormData(prev => ({ ...prev, specialistType: customSpecialist.trim() }));
                                        }
                                        setShowCustomSpecialist(false);
                                        setCustomSpecialist('');
                                    }}
                                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomSpecialist(false);
                                        setCustomSpecialist('');
                                    }}
                                    className="px-3 py-2 text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    name="specialistType"
                                    value={formData.specialistType}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    <option value="">Select specialist...</option>
                                    {specialistOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomSpecialist(true)}
                                    className="px-3 py-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
                                    title="Add custom specialist type"
                                >
                                    + New
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Body System
                        </label>
                        {showCustomBodySystem ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customBodySystem}
                                    onChange={(e) => setCustomBodySystem(e.target.value)}
                                    placeholder="Enter custom system..."
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (customBodySystem.trim()) {
                                            setFormData(prev => ({ ...prev, bodySystem: customBodySystem.trim() }));
                                        }
                                        setShowCustomBodySystem(false);
                                        setCustomBodySystem('');
                                    }}
                                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomBodySystem(false);
                                        setCustomBodySystem('');
                                    }}
                                    className="px-3 py-2 text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <select
                                    name="bodySystem"
                                    value={formData.bodySystem}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    <option value="">Select system...</option>
                                    {bodySystemOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomBodySystem(true)}
                                    className="px-3 py-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
                                    title="Add custom body system"
                                >
                                    + New
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Severity Level
                        </label>
                        <select
                            name="severityLevel"
                            value={formData.severityLevel}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            <option value="">Select severity...</option>
                            {severityOptions.map(opt => (
                                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Symptoms & Treatments */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Symptoms & Treatments</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Symptoms (one per line)
                        </label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
                            placeholder="Fatigue&#10;Weight loss&#10;Increased thirst"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Treatments (one per line)
                        </label>
                        <textarea
                            name="treatments"
                            value={formData.treatments}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
                            placeholder="Insulin therapy&#10;Dietary changes&#10;Regular exercise"
                        />
                    </div>
                </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">FAQs</h2>
                    <button
                        type="button"
                        onClick={addFaq}
                        className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                        + Add FAQ
                    </button>
                </div>

                {faqs.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-3">No FAQs added yet</p>
                        <button
                            type="button"
                            onClick={addFaq}
                            className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                        >
                            Add First FAQ
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <span className="flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                                        {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(index)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                        title="Remove FAQ"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Question
                                        </label>
                                        <input
                                            type="text"
                                            value={faq.q}
                                            onChange={(e) => updateFaq(index, 'q', e.target.value)}
                                            placeholder="What is the question?"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Answer
                                        </label>
                                        <textarea
                                            value={faq.a}
                                            onChange={(e) => updateFaq(index, 'a', e.target.value)}
                                            placeholder="Enter the answer..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                    <span className="text-sm text-slate-500">- Condition will be visible on the site</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/conditions"
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                    ← Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : (condition ? 'Update Condition' : 'Create Condition')}
                </button>
            </div>
        </form>
    );
}
