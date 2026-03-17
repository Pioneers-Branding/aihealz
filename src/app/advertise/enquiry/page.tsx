'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COMPANY_TYPES = [
    { value: 'clinic', label: 'Clinic / Medical Practice' },
    { value: 'hospital', label: 'Hospital / Healthcare Network' },
    { value: 'diagnostic', label: 'Diagnostic Lab' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'pharma', label: 'Pharmaceutical Company' },
    { value: 'medtech', label: 'Medical Device / MedTech' },
    { value: 'insurance', label: 'Health Insurance' },
    { value: 'wellness', label: 'Wellness / Fitness' },
    { value: 'other', label: 'Other Healthcare Business' },
];

const BUDGET_RANGES = [
    { value: 'under-500', label: 'Under $500/month' },
    { value: '500-2000', label: '$500 - $2,000/month' },
    { value: '2000-5000', label: '$2,000 - $5,000/month' },
    { value: '5000-10000', label: '$5,000 - $10,000/month' },
    { value: 'over-10000', label: '$10,000+/month' },
    { value: 'undecided', label: 'Not sure yet' },
];

const REGIONS = [
    { value: 'india', label: 'India' },
    { value: 'usa', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'uae', label: 'UAE' },
    { value: 'australia', label: 'Australia' },
    { value: 'canada', label: 'Canada' },
    { value: 'germany', label: 'Germany' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'kenya', label: 'Kenya' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'global', label: 'Global / Multiple Regions' },
];

export default function AdvertiseEnquiryPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        companyName: '',
        companyType: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        adBudget: '',
        targetRegions: [] as string[],
        message: '',
    });

    const handleRegionToggle = (region: string) => {
        setForm((prev) => ({
            ...prev,
            targetRegions: prev.targetRegions.includes(region)
                ? prev.targetRegions.filter((r) => r !== region)
                : [...prev.targetRegions, region],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/ads/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit enquiry');
            }

            router.push('/advertise/success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="relative pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link
                            href="/advertise"
                            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-medium mb-6 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Advertising
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Start Advertising on AIHealz
                        </h1>
                        <p className="text-lg text-slate-400">
                            Fill out the form below and our team will reach out within 24 hours.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/10 p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Company Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="w-7 h-7 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                                    Company Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Company Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.companyName}
                                            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                                            placeholder="Your company name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Company Type <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            required
                                            value={form.companyType}
                                            onChange={(e) => setForm({ ...form, companyType: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">Select type...</option>
                                            {COMPANY_TYPES.map((t) => (
                                                <option key={t.value} value={t.value} className="bg-slate-900">
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={form.website}
                                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                                            placeholder="https://your-website.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="w-7 h-7 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                                    Contact Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Your Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.contactName}
                                            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Campaign Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="w-7 h-7 bg-teal-500/20 text-teal-400 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                                    Campaign Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Monthly Advertising Budget
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {BUDGET_RANGES.map((b) => (
                                                <button
                                                    type="button"
                                                    key={b.value}
                                                    onClick={() => setForm({ ...form, adBudget: b.value })}
                                                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                        form.adBudget === b.value
                                                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    } border`}
                                                >
                                                    {b.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Target Regions (select all that apply)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {REGIONS.map((r) => (
                                                <button
                                                    type="button"
                                                    key={r.value}
                                                    onClick={() => handleRegionToggle(r.value)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        form.targetRegions.includes(r.value)
                                                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    } border`}
                                                >
                                                    {form.targetRegions.includes(r.value) && (
                                                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Tell us about your advertising goals
                                        </label>
                                        <textarea
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-colors resize-none"
                                            placeholder="What conditions or specialties do you want to target? Any specific goals or requirements?"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Enquiry
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-sm text-slate-500 mt-4">
                                    By submitting, you agree to our{' '}
                                    <Link href="/terms" className="text-teal-400 hover:underline">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Contact Alternative */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-400">
                            Prefer to talk to someone directly?{' '}
                            <Link href="/contact" className="text-teal-400 hover:text-teal-300 font-medium">
                                Contact our sales team
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
