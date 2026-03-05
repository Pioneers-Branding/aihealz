'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

function EnquiryForm() {
    const params = useParams();
    const searchParams = useSearchParams();
    const hospitalSlug = params.slug as string;
    const isInternational = searchParams.get('type') === 'international';

    const [hospitalName, setHospitalName] = useState('');
    const [formData, setFormData] = useState({
        patientName: '',
        phone: '',
        email: '',
        country: isInternational ? '' : 'India',
        patientType: isInternational ? 'international' : 'domestic',
        enquiryType: '',
        condition: '',
        specialty: '',
        message: '',
        hasInsurance: false,
        insuranceProvider: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch hospital name
    useEffect(() => {
        fetch(`/api/hospitals/${hospitalSlug}`)
            .then(res => res.json())
            .then(data => {
                if (data.name) setHospitalName(data.name);
            })
            .catch(() => {});
    }, [hospitalSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/hospitals/enquire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    hospitalSlug,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to submit enquiry');
            }

            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">Enquiry Submitted</h1>
                <p className="text-slate-400 mb-6">
                    {isInternational
                        ? 'Our international patient services team will contact you within 24 hours with treatment options and cost estimates.'
                        : 'The hospital will contact you within 24 hours to assist with your enquiry.'
                    }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={`/hospitals/${hospitalSlug}`}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
                    >
                        Back to Hospital
                    </Link>
                    <Link
                        href="/hospitals"
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all"
                    >
                        Browse More Hospitals
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/hospitals" className="hover:text-white transition-colors">Hospitals</Link>
                <span>/</span>
                <Link href={`/hospitals/${hospitalSlug}`} className="hover:text-white transition-colors">
                    {hospitalName || 'Hospital'}
                </Link>
                <span>/</span>
                <span className="text-white">Enquiry</span>
            </nav>

            <div className="text-center mb-8">
                {isInternational && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
                        International Patient Services
                    </div>
                )}
                <h1 className="text-3xl font-bold text-white mb-2">
                    {isInternational ? 'International Patient Enquiry' : 'Book Appointment'}
                </h1>
                {hospitalName && (
                    <p className="text-teal-400">at {hospitalName}</p>
                )}
                <p className="text-slate-400 mt-2">
                    {isInternational
                        ? 'Get personalized treatment plans and cost estimates for medical travel'
                        : 'Fill in your details and we\'ll help you schedule your visit'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Your Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.patientName}
                        onChange={e => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                        className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            placeholder={isInternational ? '+1 234 567 8900' : '+91 9876543210'}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            placeholder="your@email.com"
                        />
                    </div>
                </div>

                {isInternational && (
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Your Country *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.country}
                            onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            placeholder="e.g., United States, United Kingdom"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Enquiry Type
                    </label>
                    <select
                        value={formData.enquiryType}
                        onChange={e => setFormData(prev => ({ ...prev, enquiryType: e.target.value }))}
                        className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500/50"
                    >
                        <option value="">Select type</option>
                        <option value="treatment">Treatment / Surgery</option>
                        <option value="consultation">Doctor Consultation</option>
                        <option value="second_opinion">Second Opinion</option>
                        <option value="cost_estimate">Cost Estimate</option>
                        <option value="general">General Enquiry</option>
                    </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Medical Condition
                        </label>
                        <input
                            type="text"
                            value={formData.condition}
                            onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            placeholder="e.g., Knee Replacement, Heart Surgery"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Preferred Specialty
                        </label>
                        <input
                            type="text"
                            value={formData.specialty}
                            onChange={e => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            placeholder="e.g., Orthopedics, Cardiology"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Additional Details
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 resize-none"
                        placeholder="Describe your medical condition, treatment requirements, or any questions you have..."
                    />
                </div>

                <div className="p-4 bg-slate-800/30 rounded-xl space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.hasInsurance}
                            onChange={e => setFormData(prev => ({ ...prev, hasInsurance: e.target.checked }))}
                            className="w-5 h-5 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-slate-300">I have health insurance</span>
                    </label>

                    {formData.hasInsurance && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Insurance Provider
                            </label>
                            <input
                                type="text"
                                value={formData.insuranceProvider}
                                onChange={e => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                                className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                                placeholder="e.g., HDFC Ergo, Star Health"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Submit Enquiry
                        </>
                    )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                    By submitting, you agree to our <Link href="/terms" className="text-teal-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>
                </p>
            </form>

            {isInternational && (
                <div className="mt-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        International Patient Services
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Personalized treatment plans with cost estimates
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Medical visa assistance and documentation
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Airport pickup and accommodation arrangements
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Dedicated international patient coordinator
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
}

function LoadingFallback() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-4 bg-slate-700 rounded w-64 mb-8" />
            <div className="text-center mb-8">
                <div className="h-8 bg-slate-700 rounded w-72 mx-auto mb-3" />
                <div className="h-4 bg-slate-800 rounded w-48 mx-auto" />
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="space-y-4">
                    <div className="h-12 bg-slate-800 rounded-xl" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="h-12 bg-slate-800 rounded-xl" />
                        <div className="h-12 bg-slate-800 rounded-xl" />
                    </div>
                    <div className="h-24 bg-slate-800 rounded-xl" />
                    <div className="h-14 bg-teal-500/20 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export default function HospitalEnquirePage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16">
            <div className="max-w-xl mx-auto px-6">
                <Suspense fallback={<LoadingFallback />}>
                    <EnquiryForm />
                </Suspense>
            </div>
        </main>
    );
}
