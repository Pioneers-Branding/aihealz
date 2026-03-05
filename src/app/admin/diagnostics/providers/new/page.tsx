'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FlaskConical, MapPin, Phone, Mail, Globe, Home,
  Save, ArrowLeft, Loader2, AlertCircle, Check, Shield
} from 'lucide-react';

interface ProviderFormData {
  name: string;
  slug: string;
  providerType: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  accreditations: string[];
  homeCollectionAvailable: boolean;
  homeCollectionFee: string;
  isPartner: boolean;
  isVerified: boolean;
  isActive: boolean;
}

const PROVIDER_TYPES = [
  { value: 'lab', label: 'Pathology Lab' },
  { value: 'imaging_center', label: 'Imaging Center' },
  { value: 'hospital', label: 'Hospital Lab' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'home_collection', label: 'Home Collection Only' },
  { value: 'full_service', label: 'Full Service Center' },
];

const ACCREDITATIONS = [
  'NABL', 'CAP', 'ISO 15189', 'ISO 9001', 'JCI', 'NABH',
  'College of American Pathologists', 'AERB (Radiology)'
];

export default function AddDiagnosticProviderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    slug: '',
    providerType: 'lab',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    accreditations: [],
    homeCollectionAvailable: false,
    homeCollectionFee: '',
    isPartner: false,
    isVerified: false,
    isActive: true,
  });

  const updateField = (field: keyof ProviderFormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const toggleAccreditation = (acc: string) => {
    const current = formData.accreditations;
    setFormData((prev) => ({
      ...prev,
      accreditations: current.includes(acc)
        ? current.filter((a) => a !== acc)
        : [...current, acc],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Please enter the provider name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/diagnostic-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          homeCollectionFee: formData.homeCollectionFee ? parseFloat(formData.homeCollectionFee) : null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/diagnostics/providers');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create provider');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Provider Added Successfully!</h2>
          <p className="text-slate-500 mt-2">Redirecting to providers list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/diagnostics/providers"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Diagnostic Provider</h1>
          <p className="text-slate-500 mt-1">Create a new lab or diagnostic center profile</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FlaskConical size={20} className="text-teal-600" />
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Provider Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Dr. Lal PathLabs"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="dr-lal-pathlabs"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Provider Type *</label>
              <select
                value={formData.providerType}
                onChange={(e) => updateField('providerType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {PROVIDER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe the lab, its services, and specialties..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-teal-600" />
            Contact & Location
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Complete address with area, city"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="info@lab.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://lab.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Home size={20} className="text-teal-600" />
            Services
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="homeCollection"
                  checked={formData.homeCollectionAvailable}
                  onChange={(e) => updateField('homeCollectionAvailable', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="homeCollection" className="text-sm font-medium text-slate-700">
                  Home Collection Available
                </label>
              </div>
              {formData.homeCollectionAvailable && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Fee:</span>
                  <input
                    type="number"
                    value={formData.homeCollectionFee}
                    onChange={(e) => updateField('homeCollectionFee', e.target.value)}
                    placeholder="100"
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <span className="text-sm text-slate-500">INR</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accreditations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-teal-600" />
            Accreditations
          </h2>
          <div className="flex flex-wrap gap-2">
            {ACCREDITATIONS.map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => toggleAccreditation(acc)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.accreditations.includes(acc)
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {acc}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Settings</h2>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPartner"
                checked={formData.isPartner}
                onChange={(e) => updateField('isPartner', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="isPartner" className="text-sm font-medium text-slate-700">
                Official Partner
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) => updateField('isVerified', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="isVerified" className="text-sm font-medium text-slate-700">
                Mark as Verified
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Active Profile
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/diagnostics/providers"
            className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Provider
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
