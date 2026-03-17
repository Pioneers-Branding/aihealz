'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function BookingForm() {
    const searchParams = useSearchParams();
    const doctorSlug = searchParams.get('doctor');
    const doctorName = searchParams.get('name');

    const [formData, setFormData] = useState({
        patientName: '',
        phone: '',
        email: '',
        preferredDate: '',
        preferredTime: '',
        reason: '',
        isNewPatient: 'yes',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Warn if no email provided
        if (!formData.email) {
            const proceed = window.confirm(
                'No email provided. Without an email, you will not receive appointment confirmation or reminders. Continue anyway?'
            );
            if (!proceed) {
                setLoading(false);
                return;
            }
        }

        try {
            const res = await fetch('/api/book/doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    doctorSlug,
                    doctorName,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            // Successfully submitted
            setSubmitted(true);
            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <h1 className="text-2xl font-bold text-white mb-3">Appointment Request Sent</h1>
                <p className="text-slate-400 mb-6">
                    Your appointment request has been submitted. The doctor&apos;s office will contact you within 24 hours to confirm.
                </p>
                <Link
                    href="/doctors"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all"
                >
                    Browse More Doctors
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Request Appointment
                </h1>
                {doctorName && (
                    <p className="text-teal-400">with {doctorName}</p>
                )}
                <p className="text-slate-400 mt-2">
                    Fill in your details and we&apos;ll coordinate with the doctor&apos;s office
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
                            placeholder="+91 9876543210"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Email <span className="text-amber-400">(Recommended)</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            placeholder="your@email.com"
                            autoComplete="email"
                        />
                        <p className="text-xs text-slate-500 mt-1">For confirmation and reminders</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Preferred Date *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.preferredDate}
                            onChange={e => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Preferred Time
                        </label>
                        <select
                            value={formData.preferredTime}
                            onChange={e => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                            className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500/50"
                        >
                            <option value="">Any time</option>
                            <option value="morning">Morning (9AM - 12PM)</option>
                            <option value="afternoon">Afternoon (12PM - 4PM)</option>
                            <option value="evening">Evening (4PM - 8PM)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Are you a new patient?
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="isNewPatient"
                                value="yes"
                                checked={formData.isNewPatient === 'yes'}
                                onChange={e => setFormData(prev => ({ ...prev, isNewPatient: e.target.value }))}
                                className="w-4 h-4 text-teal-500"
                            />
                            <span className="text-slate-300">Yes, first visit</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="isNewPatient"
                                value="no"
                                checked={formData.isNewPatient === 'no'}
                                onChange={e => setFormData(prev => ({ ...prev, isNewPatient: e.target.value }))}
                                className="w-4 h-4 text-teal-500"
                            />
                            <span className="text-slate-300">No, follow-up</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Reason for Visit
                    </label>
                    <textarea
                        value={formData.reason}
                        onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        rows={3}
                        className="w-full py-3 px-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 resize-none"
                        placeholder="Briefly describe your symptoms or reason for consultation..."
                    />
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Request Appointment
                        </>
                    )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                    By submitting, you agree to our <Link href="/terms" className="text-teal-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>
                </p>
            </form>
        </>
    );
}

function LoadingFallback() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="text-center mb-8">
                <div className="h-8 bg-slate-700 rounded w-64 mx-auto mb-3" />
                <div className="h-4 bg-slate-800 rounded w-48 mx-auto" />
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="space-y-4">
                    <div className="h-12 bg-slate-800 rounded-xl" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="h-12 bg-slate-800 rounded-xl" />
                        <div className="h-12 bg-slate-800 rounded-xl" />
                    </div>
                    <div className="h-12 bg-slate-800 rounded-xl" />
                    <div className="h-14 bg-teal-500/20 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export default function BookDoctorPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-200 pt-24 pb-16">
            <div className="max-w-xl mx-auto px-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/doctors" className="hover:text-white transition-colors">Doctors</Link>
                    <span>/</span>
                    <span className="text-white">Book Appointment</span>
                </nav>

                <Suspense fallback={<LoadingFallback />}>
                    <BookingForm />
                </Suspense>
            </div>
        </main>
    );
}
