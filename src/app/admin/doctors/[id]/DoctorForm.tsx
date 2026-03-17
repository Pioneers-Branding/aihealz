"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ContactInfo {
    email?: string;
    phone?: string;
    clinicName?: string;
    clinicAddress?: string;
}

interface Doctor {
    id: number;
    slug: string;
    name: string;
    licenseNumber: string | null;
    licensingBody: string | null;
    bio: string | null;
    qualifications: string[];
    experienceYears: number | null;
    consultationFee: string | number | null;
    contactInfo: ContactInfo | Record<string, unknown> | null;
    profileImage: string | null;
    isVerified: boolean;
    subscriptionTier: string;
    availableOnline: boolean;
    geographyId: number | null;
    geography: { id: number; name: string; slug: string } | null;
    specialties: Array<{
        condition: { id: number; commonName: string }
    }>;
}

interface Geography {
    id: number;
    name: string;
    slug: string;
    displayName?: string;
}

interface Condition {
    id: number;
    commonName: string;
    specialistType: string;
}

interface TierOption {
    value: string;
    label: string;
}

// Default tiers used as fallback when no subscription plans exist
const defaultTierOptions: TierOption[] = [
    { value: 'free', label: 'Free' },
    { value: 'premium', label: 'Premium' },
    { value: 'enterprise', label: 'Enterprise' },
];

export default function DoctorForm({
    doctor,
    geographies,
    conditions,
    tierOptions: propTierOptions,
}: {
    doctor: Doctor | null;
    geographies: Geography[];
    conditions: Condition[];
    tierOptions?: TierOption[];
}) {
    // Use provided tier options or fall back to defaults
    const tierOptions = propTierOptions?.length ? propTierOptions : defaultTierOptions;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const contactInfo = doctor?.contactInfo as ContactInfo | null;

    const [formData, setFormData] = useState({
        name: doctor?.name || '',
        slug: doctor?.slug || '',
        email: contactInfo?.email || '',
        phone: contactInfo?.phone || '',
        clinicName: contactInfo?.clinicName || '',
        clinicAddress: contactInfo?.clinicAddress || '',
        licenseNumber: doctor?.licenseNumber || '',
        licensingBody: doctor?.licensingBody || '',
        qualifications: doctor?.qualifications?.join('\n') || '',
        bio: doctor?.bio || '',
        experienceYears: doctor?.experienceYears?.toString() || '',
        consultationFee: doctor?.consultationFee?.toString() || '',
        profileImage: doctor?.profileImage || '',
        geographyId: doctor?.geographyId?.toString() || '',
        isVerified: doctor?.isVerified ?? false,
        availableOnline: doctor?.availableOnline ?? false,
        subscriptionTier: doctor?.subscriptionTier || 'free',
        selectedConditions: doctor?.specialties?.map(s => s.condition.id) || [],
    });

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
            if (name === 'name' && !doctor) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    const handleConditionToggle = (conditionId: number) => {
        setFormData(prev => ({
            ...prev,
            selectedConditions: prev.selectedConditions.includes(conditionId)
                ? prev.selectedConditions.filter(id => id !== conditionId)
                : [...prev.selectedConditions, conditionId]
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
                licenseNumber: formData.licenseNumber || null,
                licensingBody: formData.licensingBody || null,
                qualifications: formData.qualifications.split('\n').map(q => q.trim()).filter(Boolean),
                bio: formData.bio || null,
                experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null,
                consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
                contactInfo: {
                    email: formData.email || undefined,
                    phone: formData.phone || undefined,
                    clinicName: formData.clinicName || undefined,
                    clinicAddress: formData.clinicAddress || undefined,
                },
                profileImage: formData.profileImage || null,
                geographyId: formData.geographyId ? parseInt(formData.geographyId) : null,
                isVerified: formData.isVerified,
                availableOnline: formData.availableOnline,
                subscriptionTier: formData.subscriptionTier,
                conditionIds: formData.selectedConditions,
            };

            const url = doctor
                ? `/api/admin/doctors/${doctor.id}`
                : '/api/admin/doctors';

            const res = await fetch(url, {
                method: doctor ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save doctor');
            }

            router.push('/admin/doctors');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Group conditions by specialist type
    const conditionsBySpecialty = conditions.reduce((acc, condition) => {
        const type = condition.specialistType;
        if (!acc[type]) acc[type] = [];
        acc[type].push(condition);
        return acc;
    }, {} as Record<string, Condition[]>);

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
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="Dr. John Smith"
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
                            placeholder="dr-john-smith"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="doctor@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Bio / About
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="Brief professional biography..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Profile Image URL
                    </label>
                    <input
                        type="url"
                        name="profileImage"
                        value={formData.profileImage}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            </div>

            {/* License Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">License Information</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            License Number
                        </label>
                        <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="MCI-12345"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Licensing Body
                        </label>
                        <input
                            type="text"
                            name="licensingBody"
                            value={formData.licensingBody}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="Medical Council of India"
                        />
                    </div>
                </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Professional Details</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Years of Experience
                        </label>
                        <input
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears}
                            onChange={handleChange}
                            min="0"
                            max="70"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="15"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Consultation Fee (INR)
                        </label>
                        <input
                            type="number"
                            name="consultationFee"
                            value={formData.consultationFee}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="1500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Qualifications (one per line)
                    </label>
                    <textarea
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
                        placeholder="MBBS&#10;MD (Internal Medicine)&#10;DM (Cardiology)"
                    />
                </div>
            </div>

            {/* Clinic Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Clinic Information</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Clinic Name
                        </label>
                        <input
                            type="text"
                            name="clinicName"
                            value={formData.clinicName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="City Heart Clinic"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Location
                        </label>
                        <select
                            name="geographyId"
                            value={formData.geographyId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            <option value="">Select location...</option>
                            {geographies.map(geo => (
                                <option key={geo.id} value={geo.id}>{geo.displayName || geo.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Clinic Address
                    </label>
                    <textarea
                        name="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="123 Medical Plaza, Health Street..."
                    />
                </div>
            </div>

            {/* Conditions Treated */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Conditions Treated</h2>
                <p className="text-sm text-slate-500">Select the conditions this doctor specializes in treating.</p>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(conditionsBySpecialty).map(([specialistType, conds]) => (
                        <div key={specialistType}>
                            <h3 className="text-sm font-semibold text-slate-700 mb-2">{specialistType}</h3>
                            <div className="flex flex-wrap gap-2">
                                {conds.map(condition => (
                                    <button
                                        key={condition.id}
                                        type="button"
                                        onClick={() => handleConditionToggle(condition.id)}
                                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                            formData.selectedConditions.includes(condition.id)
                                                ? 'bg-teal-100 border-teal-300 text-teal-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {condition.commonName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {formData.selectedConditions.length > 0 && (
                    <p className="text-sm text-teal-600">
                        {formData.selectedConditions.length} condition(s) selected
                    </p>
                )}
            </div>

            {/* Status & Subscription */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Status & Subscription</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Subscription Tier
                        </label>
                        <select
                            name="subscriptionTier"
                            value={formData.subscriptionTier}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        >
                            {tierOptions.map(tier => (
                                <option key={tier.value} value={tier.value}>
                                    {tier.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="isVerified"
                            checked={formData.isVerified}
                            onChange={handleChange}
                            className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span className="font-medium text-slate-700">Verified</span>
                        <span className="text-sm text-slate-500">- Profile has been verified</span>
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="availableOnline"
                            checked={formData.availableOnline}
                            onChange={handleChange}
                            className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span className="font-medium text-slate-700">Available Online</span>
                        <span className="text-sm text-slate-500">- Offers teleconsultation</span>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/doctors"
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                    ← Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : (doctor ? 'Update Doctor' : 'Create Doctor')}
                </button>
            </div>
        </form>
    );
}
