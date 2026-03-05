'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

function DoctorsJoinSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const plan = searchParams.get('plan');
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If no session_id, redirect to for-doctors registration page
        if (!sessionId) {
            window.location.href = '/for-doctors#join-form';
            return;
        }

        // Verify the session with our backend
        async function verifySession() {
            try {
                const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
                if (res.ok) {
                    setVerified(true);
                } else {
                    setError('Unable to verify payment. Please contact support.');
                }
            } catch {
                setError('Unable to verify payment. Please contact support.');
            } finally {
                setLoading(false);
            }
        }

        verifySession();
    }, [sessionId]);

    // Don't show loading spinner if there's no session_id - we're redirecting
    if (!sessionId) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-surface-600">Redirecting to registration...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-surface-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-surface-50 pt-24 pb-16">
                <div className="max-w-md mx-auto px-6 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900 mb-4">Verification Issue</h1>
                    <p className="text-surface-600 mb-8">{error}</p>
                    <Link
                        href="/contact?subject=Payment%20Verification%20Issue"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                        Contact Support
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const planName = plan === 'enterprise' ? 'Enterprise' : 'Premium';

    return (
        <div className="min-h-screen bg-surface-50 pt-24 pb-16">
            <div className="max-w-lg mx-auto px-6">
                <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center shadow-xl">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-surface-900 mb-3">
                        Welcome to {planName}!
                    </h1>

                    <p className="text-surface-600 mb-8">
                        Your subscription is now active. You have access to all {planName} features including enhanced visibility, priority ranking, and lead credits.
                    </p>

                    <div className="bg-surface-50 rounded-xl p-6 mb-8">
                        <h3 className="font-semibold text-surface-900 mb-4">Next Steps:</h3>
                        <ul className="text-left space-y-3 text-sm text-surface-600">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span>Complete your doctor profile with qualifications and specialties</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span>Add your clinic address and contact information</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span>Upload your license documents for verification</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                <span>Start receiving patient leads and inquiries</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/provider/dashboard"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/for-doctors"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-100 text-surface-700 rounded-xl font-semibold hover:bg-surface-200 transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                <p className="text-center text-sm text-surface-500 mt-6">
                    A confirmation email has been sent to your registered email address.
                </p>
            </div>
        </div>
    );
}

export default function DoctorsJoinSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-surface-600">Loading...</p>
                </div>
            </div>
        }>
            <DoctorsJoinSuccessContent />
        </Suspense>
    );
}
