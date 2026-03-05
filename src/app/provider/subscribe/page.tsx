'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import {
    Zap, CheckCircle, ArrowLeft, Shield, CreditCard,
    Lock, Building, Globe, Phone, Users, TrendingUp, Video
} from 'lucide-react';
import { ProviderAuthGate } from '@/components/provider/AuthGate';

/**
 * Subscription Upgrade Page
 *
 * Shows plan details and handles payment flow.
 * Currently a placeholder - will integrate with Razorpay.
 */

const PLANS = {
    premium: {
        name: 'Premium',
        price: 4999,
        currency: 'INR',
        period: 'month',
        features: [
            { icon: Building, text: 'Priority profile listing' },
            { icon: Users, text: '15 condition specialties' },
            { icon: Users, text: '50 lead credits per month' },
            { icon: Globe, text: 'Website URL on profile' },
            { icon: Phone, text: 'Full contact display' },
            { icon: TrendingUp, text: 'Complete analytics dashboard' },
            { icon: Video, text: 'Tele-Link video consultations' },
        ],
    },
    enterprise: {
        name: 'Enterprise',
        price: 19999,
        currency: 'INR',
        period: 'month',
        features: [
            { icon: Shield, text: 'Featured "Top Doctor" badge' },
            { icon: Users, text: 'Unlimited condition specialties' },
            { icon: Users, text: '500 lead credits per month' },
            { icon: Building, text: 'Guaranteed top 3 in search' },
            { icon: Globe, text: 'Custom branding options' },
            { icon: Phone, text: 'Dedicated account manager' },
        ],
    },
};

function SubscribeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planKey = searchParams.get('plan') || 'premium';
    const plan = PLANS[planKey as keyof typeof PLANS] || PLANS.premium;

    const [loading, setLoading] = useState(false);
    const [doctorId, setDoctorId] = useState<string>('');

    useEffect(() => {
        const storedId = localStorage.getItem('provider_doctor_id');
        if (storedId) setDoctorId(storedId);
    }, []);

    async function handlePayment() {
        setLoading(true);

        // In production, this would:
        // 1. Create a Razorpay order via API
        // 2. Open Razorpay checkout
        // 3. Handle payment success/failure
        // 4. Update subscription in database

        try {
            // Simulated API call
            const res = await fetch('/api/provider/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: parseInt(doctorId, 10),
                    planId: planKey,
                    // In production: paymentId, orderId from Razorpay
                }),
            });

            if (res.ok) {
                // Redirect to dashboard with success message
                router.push('/provider/dashboard?upgraded=true');
            } else {
                const error = await res.json();
                alert(error.message || 'Payment failed. Please try again.');
            }
        } catch {
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-surface-100/50 hover:text-surface-100/80 transition-colors mb-6 text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

                {/* Plan Card */}
                <div className="glass-card p-8 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center mx-auto mb-4">
                            <Zap size={32} className="text-primary-400" />
                        </div>
                        <h1 className="text-2xl font-bold">Upgrade to {plan.name}</h1>
                        <p className="text-surface-100/50 mt-2">Unlock premium features for your practice</p>
                    </div>

                    {/* Price */}
                    <div className="text-center py-4 border-y border-white/5">
                        <p className="text-4xl font-bold">
                            ₹{plan.price.toLocaleString()}
                            <span className="text-base font-normal text-surface-100/40">/{plan.period}</span>
                        </p>
                        <p className="text-xs text-surface-100/40 mt-1">Billed monthly. Cancel anytime.</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                        {plan.features.map((feature) => (
                            <li key={feature.text} className="flex items-center gap-3 text-sm text-surface-100/80">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <feature.icon size={14} className="text-emerald-400" />
                                </div>
                                {feature.text}
                            </li>
                        ))}
                    </ul>

                    {/* Payment Button */}
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-primary-600 text-white font-medium
                                   hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard size={18} />
                                Pay ₹{plan.price.toLocaleString()}/month
                            </>
                        )}
                    </button>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 text-xs text-surface-100/30">
                        <span className="flex items-center gap-1">
                            <Lock size={12} />
                            Secure Payment
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield size={12} />
                            Razorpay Protected
                        </span>
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-surface-100/30 text-center">
                        By subscribing, you agree to our{' '}
                        <a href="/terms" className="text-primary-400 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</a>.
                    </p>
                </div>

                {/* Contact option */}
                <p className="text-center text-sm text-surface-100/40 mt-6">
                    Need help choosing a plan?{' '}
                    <a href="/contact" className="text-primary-400 hover:underline">Contact our team</a>
                </p>
            </div>
        </div>
    );
}

export default function SubscribePage() {
    return (
        <ProviderAuthGate>
            <Suspense fallback={
                <div className="min-h-screen bg-surface-900 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary-500/30 border-t-primary-400 rounded-full" />
                </div>
            }>
                <SubscribeContent />
            </Suspense>
        </ProviderAuthGate>
    );
}
