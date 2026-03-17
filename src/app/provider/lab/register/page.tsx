'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Microscope, MapPin, Phone, Mail, Globe, Shield,
  ChevronRight, Check, AlertCircle, Loader2, Home
} from 'lucide-react';

interface FormData {
  labName: string;
  legalName: string;
  labType: string;
  registrationNumber: string;
  establishedYear: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
  password: string;
  confirmPassword: string;
  accreditations: string[];
  homeCollection: boolean;
  operatingHours: string;
  agreeTerms: boolean;
}

const LAB_TYPES = [
  { value: 'pathology', label: 'Pathology Lab' },
  { value: 'imaging', label: 'Imaging / Radiology Center' },
  { value: 'full_service', label: 'Full Service Diagnostics' },
  { value: 'collection_center', label: 'Collection Center' },
  { value: 'hospital_lab', label: 'Hospital Laboratory' },
  { value: 'research', label: 'Research Laboratory' },
];

const ACCREDITATIONS = ['NABL', 'CAP', 'ISO 15189', 'ISO 9001', 'NABH'];

function LabRegisterForm() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'starter';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    labName: '',
    legalName: '',
    labType: '',
    registrationNumber: '',
    establishedYear: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    adminName: '',
    adminPhone: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    accreditations: [],
    homeCollection: false,
    operatingHours: '',
    agreeTerms: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAccreditation = (acc: string) => {
    setFormData((prev) => ({
      ...prev,
      accreditations: prev.accreditations.includes(acc)
        ? prev.accreditations.filter((a) => a !== acc)
        : [...prev.accreditations, acc],
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.labName || !formData.labType) {
        setError('Please fill in all required fields');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.address || !formData.city || !formData.phone || !formData.email) {
        setError('Please fill in all required contact details');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.adminName || !formData.adminEmail || !formData.password) {
        setError('Please fill in admin account details');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/provider/lab/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, plan: selectedPlan }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store session data in localStorage
        localStorage.setItem('provider_session', JSON.stringify({
          labId: data.lab.id,
          name: data.lab.name,
          email: data.lab.email,
          subscriptionTier: data.lab.subscriptionTier,
          token: data.session.token,
          expiresAt: data.session.expiresAt,
        }));
        localStorage.setItem('provider_lab_id', String(data.lab.id));

        window.location.href = data.redirectTo || '/provider/lab/dashboard?welcome=true';
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PLAN_NAMES: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    chain: 'Chain',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
            <Microscope size={18} className="text-emerald-600" />
            <span className="text-emerald-700 font-medium">Diagnostic Lab Registration</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Register Your Diagnostic Lab
          </h1>
          <p className="text-slate-600">
            Partner with AIHealz for patient bookings. Selected plan:{' '}
            <span className="font-semibold text-emerald-600">{PLAN_NAMES[selectedPlan]}</span>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? <Check size={20} /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    step > s ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Step 1: Lab Details */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Lab Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lab Name *
                  </label>
                  <input
                    type="text"
                    value={formData.labName}
                    onChange={(e) => updateField('labName', e.target.value)}
                    placeholder="e.g., Dr. Lal PathLabs"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => updateField('legalName', e.target.value)}
                    placeholder="As per registration"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Lab Type *
                    </label>
                    <select
                      value={formData.labType}
                      onChange={(e) => updateField('labType', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="">Select type</option>
                      {LAB_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => updateField('registrationNumber', e.target.value)}
                      placeholder="Lab license number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Accreditations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ACCREDITATIONS.map((acc) => (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => toggleAccreditation(acc)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.accreditations.includes(acc)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.homeCollection}
                    onChange={(e) => updateField('homeCollection', e.target.checked)}
                    className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <Home size={18} className="text-emerald-600" />
                    <span className="font-medium text-emerald-900">Home Collection Available</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Contact & Location</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Street address, landmark"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g., Delhi"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="e.g., Delhi NCR"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="lab@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => updateField('operatingHours', e.target.value)}
                    placeholder="e.g., Mon-Sat 7AM-9PM, Sun 8AM-2PM"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Admin Account */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Admin Account</h2>
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => updateField('adminName', e.target.value)}
                      placeholder="Full name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admin Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.adminPhone}
                      onChange={(e) => updateField('adminPhone', e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => updateField('adminEmail', e.target.value)}
                    placeholder="admin@lab.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Review & Submit</h2>
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Registration Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Lab Name</p>
                      <p className="font-medium text-slate-900">{formData.labName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Type</p>
                      <p className="font-medium text-slate-900">
                        {LAB_TYPES.find(t => t.value === formData.labType)?.label || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">
                        {formData.city ? `${formData.city}, ${formData.country}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Plan</p>
                      <p className="font-medium text-emerald-600">{PLAN_NAMES[selectedPlan]}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Home Collection</p>
                      <p className="font-medium text-slate-900">{formData.homeCollection ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Accreditations</p>
                      <p className="font-medium text-slate-900">
                        {formData.accreditations.length > 0 ? formData.accreditations.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => updateField('agreeTerms', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-emerald-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-emerald-600 hover:underline">
                      Privacy Policy
                    </Link>
                    . I confirm that I am authorized to register this diagnostic lab on AIHealz.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium"
              >
                Back
              </button>
            ) : (
              <Link
                href="/pricing"
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </Link>
            )}

            {step < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Complete Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LabRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    }>
      <LabRegisterForm />
    </Suspense>
  );
}
