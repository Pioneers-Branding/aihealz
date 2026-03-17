'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, MapPin, Phone, Mail, Globe, Bed, Users,
  Save, ArrowLeft, Loader2, AlertCircle, Check, Shield
} from 'lucide-react';

interface HospitalFormData {
  name: string;
  slug: string;
  hospitalType: string;
  description: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  bedCount: string;
  icuBeds: string;
  operationTheaters: string;
  emergencyBeds: string;
  accreditations: string[];
  isVerified: boolean;
  isActive: boolean;
}

const HOSPITAL_TYPES = [
  { value: 'private', label: 'Private Hospital' },
  { value: 'government', label: 'Government Hospital' },
  { value: 'corporate_chain', label: 'Corporate Chain' },
  { value: 'charitable', label: 'Charitable Trust' },
  { value: 'trust', label: 'Trust Hospital' },
  { value: 'public_private_partnership', label: 'PPP Hospital' },
];

const ACCREDITATIONS = [
  'NABH', 'JCI', 'NABL', 'ISO 9001', 'ISO 14001', 'Green OT',
  'QCI', 'HACCP', 'ISO 22000', 'CAP'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat',
  'Rajasthan', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Bihar',
  'Punjab', 'Haryana', 'Kerala', 'Telangana', 'Madhya Pradesh',
];

export default function AddHospitalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
    slug: '',
    hospitalType: 'private',
    description: '',
    tagline: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    emergencyPhone: '',
    email: '',
    website: '',
    bedCount: '',
    icuBeds: '',
    operationTheaters: '',
    emergencyBeds: '',
    accreditations: [],
    isVerified: false,
    isActive: true,
  });

  const updateField = (field: keyof HospitalFormData, value: string | boolean | string[]) => {
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

    if (!formData.name || !formData.city) {
      setError('Please fill in the hospital name and city');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bedCount: formData.bedCount ? parseInt(formData.bedCount) : null,
          icuBeds: formData.icuBeds ? parseInt(formData.icuBeds) : null,
          operationTheaters: formData.operationTheaters ? parseInt(formData.operationTheaters) : null,
          emergencyBeds: formData.emergencyBeds ? parseInt(formData.emergencyBeds) : null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/hospitals');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create hospital');
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
          <h2 className="text-xl font-bold text-slate-900">Hospital Added Successfully!</h2>
          <p className="text-slate-500 mt-2">Redirecting to hospitals list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/hospitals"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Hospital</h1>
          <p className="text-slate-500 mt-1">Create a new hospital profile</p>
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
            <Building2 size={20} className="text-teal-600" />
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hospital Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Apollo Hospital"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="apollo-hospital-mumbai"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hospital Type *</label>
              <select
                value={formData.hospitalType}
                onChange={(e) => updateField('hospitalType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {HOSPITAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="Where Care Meets Excellence"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe the hospital, its history, specialties, and facilities..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-teal-600" />
            Location
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Complete street address"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div className="grid md:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Mumbai"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="India"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => updateField('pincode', e.target.value)}
                  placeholder="400001"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Phone size={20} className="text-teal-600" />
            Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91-22-XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Emergency Phone</label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                placeholder="+91-22-XXXXXXXX"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="info@hospital.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://hospital.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Bed size={20} className="text-teal-600" />
            Facilities & Capacity
          </h2>
          <div className="grid md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Beds</label>
              <input
                type="number"
                value={formData.bedCount}
                onChange={(e) => updateField('bedCount', e.target.value)}
                placeholder="500"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ICU Beds</label>
              <input
                type="number"
                value={formData.icuBeds}
                onChange={(e) => updateField('icuBeds', e.target.value)}
                placeholder="50"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Operation Theaters</label>
              <input
                type="number"
                value={formData.operationTheaters}
                onChange={(e) => updateField('operationTheaters', e.target.value)}
                placeholder="10"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Emergency Beds</label>
              <input
                type="number"
                value={formData.emergencyBeds}
                onChange={(e) => updateField('emergencyBeds', e.target.value)}
                placeholder="20"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-teal-600" />
            Admin Settings
          </h2>
          <div className="flex items-center gap-8">
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
            href="/admin/hospitals"
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
                Create Hospital
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
