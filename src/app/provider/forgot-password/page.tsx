'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

/**
 * Provider Forgot Password Page
 *
 * Allows providers to request a password reset link via email.
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/provider/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to send reset link');
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch {
            setError('Failed to connect. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="glass-card p-8 space-y-6">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600/20 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
                            <p className="text-slate-400 text-sm">
                                If an account exists with <span className="text-white">{email}</span>,
                                you will receive a password reset link within a few minutes.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-slate-500 text-center">
                                Did not receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail('');
                                }}
                                className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Try a different email
                            </button>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <Link
                                href="/provider/login"
                                className="flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="glass-card p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-600/20 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-primary-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                        <p className="text-slate-400 text-sm">
                            Enter your email address and we will send you a link to reset your password.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="doctor@clinic.com"
                                autoComplete="email"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                                         text-white placeholder:text-slate-500
                                         focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3
                                     bg-primary-600 hover:bg-primary-500 disabled:opacity-50
                                     text-white font-semibold rounded-xl transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail size={18} />
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="pt-4 border-t border-white/10">
                        <Link
                            href="/provider/login"
                            className="flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Back to login
                        </Link>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 text-center">
                        For security, the reset link will expire in 1 hour.
                        If you continue to have issues, please contact support.
                    </p>
                </div>
            </div>
        </div>
    );
}
