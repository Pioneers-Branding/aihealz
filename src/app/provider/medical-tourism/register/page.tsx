'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Globe, Building2, Users, MapPin, Phone, Mail, Shield,
  ChevronRight, Check, AlertCircle, Loader2, Plane, Briefcase,
  Award, Clock, Languages, Wallet
} from 'lucide-react';

type ProviderType = 'hcf' | 'agency';

interface FormData {
  providerType: ProviderType;
  companyName: string;
  legalName: string;
  registrationNumber: string;
  establishedYear: string;
  website: string;
  // Contact
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  whatsapp: string;
  // Services
  servicesOffered: string[];
  specializations: string[];
  destinationCountries: string[];
  sourceCountries: string[];
  languagesSupported: string[];
  // Credentials
  certifications: string[];
  hospitalPartners: string;
  insurancePartners: string;
  // Admin
  adminName: string;
  adminDesignation: string;
  adminPhone: string;
  adminEmail: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const SERVICES_HCF = [
  'Treatment Planning',
  'Hospital Selection',
  'Doctor Appointments',
  'Visa Assistance',
  'Airport Pickup',
  'Accommodation Booking',
  'Local Transport',
  'Language Interpretation',
  'Medical Records Translation',
  'Post-Treatment Follow-up',
  'Second Opinion Coordination',
  'Insurance Coordination',
];

const SERVICES_AGENCY = [
  'End-to-End Medical Tourism Packages',
  'Hospital Tie-ups',
  'Travel Arrangements',
  'Visa Processing',
  'Medical Visa Letters',
  'Accommodation',
  'Local Tours',
  'Companion Assistance',
  'Currency Exchange Support',
  'Emergency Support 24/7',
];

const SPECIALIZATIONS = [
  'Cardiac Care',
  'Orthopedics',
  'Oncology',
  'Fertility & IVF',
  'Cosmetic Surgery',
  'Dental Tourism',
  'Eye Care',
  'Organ Transplant',
  'Bariatric Surgery',
  'Neurosurgery',
  'Spine Surgery',
  'Wellness & Ayurveda',
];

const DESTINATION_COUNTRIES = [
  'India', 'Thailand', 'Turkey', 'Singapore', 'Malaysia',
  'Mexico', 'Costa Rica', 'Germany', 'South Korea', 'UAE',
];

const SOURCE_COUNTRIES = [
  'USA', 'UK', 'Canada', 'Australia', 'Middle East',
  'Africa', 'CIS Countries', 'Bangladesh', 'Nepal', 'Sri Lanka',
];

const LANGUAGES = [
  'English', 'Hindi', 'Arabic', 'Russian', 'French',
  'Spanish', 'German', 'Bengali', 'Swahili', 'Mandarin',
];

const CERTIFICATIONS = [
  'MTQUA Certified',
  'NABH Empanelled',
  'JCI Partner',
  'TEMOS Certified',
  'ISO 9001',
  'Government Registered',
];

function MedicalTourismRegisterForm() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as ProviderType | null;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    providerType: typeParam || 'hcf',
    companyName: '',
    legalName: '',
    registrationNumber: '',
    establishedYear: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
    whatsapp: '',
    servicesOffered: [],
    specializations: [],
    destinationCountries: [],
    sourceCountries: [],
    languagesSupported: ['English'],
    certifications: [],
    hospitalPartners: '',
    insurancePartners: '',
    adminName: '',
    adminDesignation: '',
    adminPhone: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof FormData, value: string) => {
    const current = formData[field] as string[];
    setFormData((prev) => ({
      ...prev,
      [field]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.companyName || !formData.providerType) {
        setError('Please fill in company name and select provider type');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.address || !formData.city || !formData.country || !formData.phone || !formData.email) {
        setError('Please fill in all required contact details');
        return false;
      }
    }
    if (currentStep === 3) {
      if (formData.servicesOffered.length === 0) {
        setError('Please select at least one service');
        return false;
      }
    }
    if (currentStep === 4) {
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
      setStep((prev) => Math.min(prev + 1, 5));
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
      const res = await fetch('/api/provider/medical-tourism/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        window.location.href = '/provider/medical-tourism/dashboard?welcome=true';
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHCF = formData.providerType === 'hcf';
  const services = isHCF ? SERVICES_HCF : SERVICES_AGENCY;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
            <Globe size={18} className="text-purple-400" />
            <span className="text-purple-300 font-medium">Medical Tourism Partner</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Become a Medical Tourism Partner
          </h1>
          <p className="text-slate-400">
            Register as a Healthcare Facilitator (HCF) or Medical Tourism Agency
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {step > s ? <Check size={20} /> : s}
              </div>
              {s < 5 && (
                <div
                  className={`w-12 h-1 mx-1 rounded ${
                    step > s ? 'bg-purple-500' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 text-red-300">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-3xl border border-white/10 overflow-hidden">
          {/* Step 1: Provider Type & Company */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Provider Type & Company</h2>
              <div className="space-y-6">
                {/* Provider Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    What type of provider are you? *
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => updateField('providerType', 'hcf')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        formData.providerType === 'hcf'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Briefcase size={32} className={formData.providerType === 'hcf' ? 'text-purple-400' : 'text-slate-500'} />
                      <h3 className="text-lg font-semibold text-white mt-3">Healthcare Facilitator (HCF)</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Individual or company that guides patients through medical treatment abroad
                      </p>
                      <ul className="mt-3 space-y-1 text-xs text-slate-500">
                        <li>• Direct patient coordination</li>
                        <li>• Hospital liaison services</li>
                        <li>• Treatment planning</li>
                      </ul>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField('providerType', 'agency')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        formData.providerType === 'agency'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Building2 size={32} className={formData.providerType === 'agency' ? 'text-purple-400' : 'text-slate-500'} />
                      <h3 className="text-lg font-semibold text-white mt-3">Medical Tourism Agency</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Company offering end-to-end medical tourism packages and services
                      </p>
                      <ul className="mt-3 space-y-1 text-xs text-slate-500">
                        <li>• Complete travel packages</li>
                        <li>• Multiple hospital tie-ups</li>
                        <li>• Volume-based operations</li>
                      </ul>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company/Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder={isHCF ? 'e.g., HealthCare Solutions' : 'e.g., MedTravel International'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Registration/License Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => updateField('registrationNumber', e.target.value)}
                      placeholder="Business registration no."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Established Year
                    </label>
                    <input
                      type="text"
                      value={formData.establishedYear}
                      onChange={(e) => updateField('establishedYear', e.target.value)}
                      placeholder="e.g., 2015"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://www.yourcompany.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Contact & Location</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Office Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Street address"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g., Mumbai"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="e.g., Maharashtra"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Country *</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="e.g., India"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="contact@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => updateField('whatsapp', e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services & Specializations */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Services & Coverage</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Services Offered *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleArrayField('servicesOffered', service)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.servicesOffered.includes(service)
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Medical Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleArrayField('specializations', spec)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.specializations.includes(spec)
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      <Plane size={16} className="inline mr-2" />
                      Destination Countries
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DESTINATION_COUNTRIES.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => toggleArrayField('destinationCountries', country)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            formData.destinationCountries.includes(country)
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      <Users size={16} className="inline mr-2" />
                      Source Markets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SOURCE_COUNTRIES.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => toggleArrayField('sourceCountries', country)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            formData.sourceCountries.includes(country)
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    <Languages size={16} className="inline mr-2" />
                    Languages Supported
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArrayField('languagesSupported', lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          formData.languagesSupported.includes(lang)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Admin Account */}
          {step === 4 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Credentials & Account</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    <Award size={16} className="inline mr-2" />
                    Certifications & Accreditations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CERTIFICATIONS.map((cert) => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => toggleArrayField('certifications', cert)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.certifications.includes(cert)
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hospital Partners (Names)
                    </label>
                    <textarea
                      value={formData.hospitalPartners}
                      onChange={(e) => updateField('hospitalPartners', e.target.value)}
                      placeholder="List your major hospital partners"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Insurance Partners
                    </label>
                    <textarea
                      value={formData.insurancePartners}
                      onChange={(e) => updateField('insurancePartners', e.target.value)}
                      placeholder="List insurance companies you work with"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Admin Account</h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Admin Name *</label>
                      <input
                        type="text"
                        value={formData.adminName}
                        onChange={(e) => updateField('adminName', e.target.value)}
                        placeholder="Full name"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Designation</label>
                      <input
                        type="text"
                        value={formData.adminDesignation}
                        onChange={(e) => updateField('adminDesignation', e.target.value)}
                        placeholder="e.g., Managing Director"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email *</label>
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => updateField('adminEmail', e.target.value)}
                        placeholder="admin@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Admin Phone</label>
                      <input
                        type="tel"
                        value={formData.adminPhone}
                        onChange={(e) => updateField('adminPhone', e.target.value)}
                        placeholder="+91-XXXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password *</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Review & Submit</h2>
              <div className="space-y-6">
                {/* What You'll Get Section */}
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4">What You&apos;ll Get as a Partner</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Users, text: 'Access to international patient leads' },
                      { icon: Globe, text: 'Listing on AIHealz medical tourism directory' },
                      { icon: Shield, text: 'Verified partner badge' },
                      { icon: Wallet, text: 'Commission-based earning model' },
                      { icon: Clock, text: '24/7 support dashboard' },
                      { icon: Award, text: 'Quality certification display' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <item.icon size={16} className="text-purple-400" />
                        </div>
                        <span className="text-sm text-slate-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-slate-900/50 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4">Registration Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Provider Type</p>
                      <p className="font-medium text-white">{isHCF ? 'Healthcare Facilitator' : 'Medical Tourism Agency'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Company Name</p>
                      <p className="font-medium text-white">{formData.companyName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="font-medium text-white">{formData.city ? `${formData.city}, ${formData.country}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Services</p>
                      <p className="font-medium text-white">{formData.servicesOffered.length} selected</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Specializations</p>
                      <p className="font-medium text-white">{formData.specializations.length} selected</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Languages</p>
                      <p className="font-medium text-white">{formData.languagesSupported.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => updateField('agreeTerms', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-400 hover:underline">Terms of Service</Link>,{' '}
                    <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>, and{' '}
                    <Link href="/partner-agreement" className="text-purple-400 hover:underline">Partner Agreement</Link>.
                    I confirm that all information provided is accurate and I am authorized to register this business.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-8 py-5 bg-slate-900/50 border-t border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-2.5 text-slate-400 hover:text-white font-medium"
              >
                Back
              </button>
            ) : (
              <Link
                href="/medical-travel"
                className="px-6 py-2.5 text-slate-400 hover:text-white font-medium"
              >
                Cancel
              </Link>
            )}

            {step < 5 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Submit Application
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

export default function MedicalTourismRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-24 pb-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    }>
      <MedicalTourismRegisterForm />
    </Suspense>
  );
}
