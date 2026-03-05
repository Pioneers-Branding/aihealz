'use client';

import { useState } from 'react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        // Validation
        if (!formData.name.trim()) {
            setStatus('error');
            setErrorMessage('Please enter your name');
            return;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address');
            return;
        }
        if (!formData.message.trim() || formData.message.length < 10) {
            setStatus('error');
            setErrorMessage('Please enter a message (at least 10 characters)');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch {
            setStatus('error');
            setErrorMessage('Failed to send message. Please try again or email us directly.');
        }
    };

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-24 pb-16">
            {/* Background */}
            <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 mt-10 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                        Contact Us
                    </h1>
                    <p className="text-slate-400">
                        Have questions? We&apos;re here to help with patient support, doctor verification, and partnership inquiries.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-5">
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                                    <p className="text-sm text-slate-500 mb-3">For support and inquiries</p>
                                    <a href="mailto:support@aihealz.com" className="text-teal-400 font-medium hover:text-teal-300">support@aihealz.com</a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Office</h3>
                                    <address className="not-italic text-sm text-slate-400 leading-relaxed">
                                        ATZ Medappz Pvt Ltd.<br />
                                        84, Supreme Coworks, Sector 32<br />
                                        Gurgaon, Haryana, India
                                    </address>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg font-semibold text-white mb-6">Send a Message</h3>

                        {status === 'success' ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">Message Sent</h4>
                                <p className="text-sm text-slate-400 mb-6">We&apos;ll respond within 24 hours.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-white/10 focus:border-teal-500/50 outline-none transition-all text-white placeholder:text-slate-600"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-white/10 focus:border-teal-500/50 outline-none transition-all text-white placeholder:text-slate-600"
                                        placeholder="you@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Message</label>
                                    <textarea
                                        rows={4}
                                        required
                                        minLength={10}
                                        maxLength={2000}
                                        value={formData.message}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-800/60 border border-white/10 focus:border-teal-500/50 outline-none transition-all resize-none text-white placeholder:text-slate-600"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {errorMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Message'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
