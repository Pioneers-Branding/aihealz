'use client';

import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
    {
        name: 'Free',
        slug: 'free',
        price: '$0',
        period: 'forever',
        desc: 'Get started and claim your profile. Perfect for individual practitioners.',
        highlight: false,
        badge: null,
        conditions: 2,
        leads: 5,
        features: [
            { label: 'Basic profile listing', included: true },
            { label: 'Up to 2 condition specialties', included: true },
            { label: '5 patient lead credits / month', included: true },
            { label: 'Standard search ranking', included: true },
            { label: 'AI-generated bio', included: false },
            { label: 'Lead scoring & quality filters', included: false },
            { label: 'Telelink (booking integration)', included: false },
            { label: 'Priority listing', included: false },
            { label: 'Analytics & insights dashboard', included: false },
            { label: 'Dedicated account manager', included: false },
        ],
    },
    {
        name: 'Premium',
        slug: 'premium',
        price: '$19',
        period: '/month',
        desc: 'For growing practices that want more visibility and patient flow.',
        highlight: true,
        badge: 'Most Popular',
        conditions: 15,
        leads: 50,
        features: [
            { label: 'Enhanced profile with AI bio', included: true },
            { label: 'Up to 15 condition specialties', included: true },
            { label: '50 patient lead credits / month', included: true },
            { label: 'Priority search ranking', included: true },
            { label: 'AI-generated bio', included: true },
            { label: 'Lead scoring & quality filters', included: true },
            { label: 'Telelink (booking integration)', included: true },
            { label: 'Priority listing on condition pages', included: true },
            { label: 'Analytics & insights dashboard', included: false },
            { label: 'Dedicated account manager', included: false },
        ],
    },
    {
        name: 'Enterprise',
        slug: 'enterprise',
        price: '$59',
        period: '/month',
        desc: 'For hospitals, clinics, and multi-specialty practices.',
        highlight: false,
        badge: 'Best Value',
        conditions: 1000,
        leads: 500,
        features: [
            { label: 'Premium profile with full customization', included: true },
            { label: 'Up to 1,000 condition specialties', included: true },
            { label: '500 patient lead credits / month', included: true },
            { label: 'Top-tier search ranking', included: true },
            { label: 'AI-generated bio', included: true },
            { label: 'Lead scoring & quality filters', included: true },
            { label: 'Telelink (booking integration)', included: true },
            { label: 'Priority listing on condition pages', included: true },
            { label: 'Analytics & insights dashboard', included: true },
            { label: 'Dedicated account manager', included: true },
        ],
    },
];

const PROMOTIONS = [
    { title: 'Early Adopter', desc: 'First 500 doctors get 3 months free on any paid plan.', code: 'EARLY500', discount: '3 months free' },
    { title: 'Annual Plan', desc: 'Pay yearly and save 20% on Premium or Enterprise.', code: 'ANNUAL20', discount: '20% off' },
    { title: 'Referral Bonus', desc: 'Refer a colleague and both get 1 month free.', code: 'REFER1MO', discount: '1 month free each' },
];

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleCheckout = async (planSlug: string) => {
        if (planSlug === 'free') {
            // Direct to registration for free
            window.location.href = '/for-doctors#join-form';
            return;
        }

        setLoadingPlan(planSlug);
        try {
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: planSlug }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Checkout failed');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setErrorMessage('Unable to initialize checkout. Please try again later.');
            setTimeout(() => setErrorMessage(null), 5000);
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-surface-50 text-surface-900 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6">
                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errorMessage}
                    </div>
                )}

                {/* Hero */}
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6">
                        Doctor Plans & Pricing
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Choose the right plan for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">practice</span>
                    </h1>
                    <p className="text-lg text-surface-600">
                        Start free, upgrade when you grow. All plans include a verified profile and patient matching.
                    </p>
                </div>

                {/* Promotions Banner */}
                <div className="mb-12 grid md:grid-cols-3 gap-4">
                    {PROMOTIONS.map(promo => (
                        <div key={promo.code} className="bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-extrabold text-surface-900 text-sm">{promo.title}</h3>
                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-md">{promo.discount}</span>
                            </div>
                            <p className="text-xs text-surface-600 mb-2">{promo.desc}</p>
                            <code className="text-xs bg-white/80 border border-primary-200 text-primary-700 font-bold px-2 py-1 rounded-md">{promo.code}</code>
                        </div>
                    ))}
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {PLANS.map(plan => (
                        <div
                            key={plan.slug}
                            className={`rounded-3xl border overflow-hidden flex flex-col ${plan.highlight
                                ? 'bg-white border-primary-300 ring-2 ring-primary-200 shadow-xl shadow-primary-500/10 relative'
                                : 'bg-white border-surface-200'
                                }`}
                        >
                            {plan.badge && (
                                <div className={`text-center py-2 text-xs font-extrabold uppercase tracking-wider ${plan.highlight
                                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                                    : 'bg-surface-100 text-surface-600'
                                    }`}>
                                    {plan.badge}
                                </div>
                            )}

                            <div className="p-6 border-b border-surface-100">
                                <h2 className="text-xl font-extrabold text-surface-900 mb-1">{plan.name}</h2>
                                <p className="text-sm text-surface-500 mb-4">{plan.desc}</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-black text-surface-900">{plan.price}</span>
                                    <span className="text-sm text-surface-500 mb-1">{plan.period}</span>
                                </div>
                            </div>

                            {/* Limits */}
                            <div className="px-6 py-4 bg-surface-50 border-b border-surface-100 grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-surface-500 font-semibold">Specialties</p>
                                    <p className="text-lg font-black text-surface-900">{plan.conditions >= 1000 ? 'Unlimited' : plan.conditions}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-surface-500 font-semibold">Lead Credits/mo</p>
                                    <p className="text-lg font-black text-surface-900">{plan.leads}</p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-6 flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            {f.included ? (
                                                <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-surface-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            )}
                                            <span className={`text-sm ${f.included ? 'text-surface-700' : 'text-surface-400'}`}>{f.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="p-6 pt-0">
                                <button
                                    onClick={() => handleCheckout(plan.slug)}
                                    disabled={loadingPlan === plan.slug}
                                    className={`w-full block text-center py-3 rounded-2xl font-extrabold transition-all ${plan.highlight
                                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                                        : 'bg-surface-100 text-surface-700 hover:bg-primary-50 hover:text-primary-700'
                                        }`}
                                >
                                    {loadingPlan === plan.slug ? 'Connecting Secure Checkout...' : plan.price === '$0' ? 'Get Started Free' : 'Start Free Trial'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-extrabold text-center mb-10">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: 'Can I start for free?', a: 'Yes! The Free plan gives you a verified profile, 2 specialty conditions, and 5 lead credits per month. No credit card required.' },
                            { q: 'What are lead credits?', a: 'Lead credits allow you to view and respond to patient enquiries. Each credit reveals one patient contact. Credits reset monthly.' },
                            { q: 'Can I change plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately, downgrades at the end of your billing cycle.' },
                            { q: 'Is there a lock-in period?', a: 'No lock-in. Monthly plans can be cancelled anytime. Annual plans can be cancelled but are non-refundable.' },
                            { q: 'How does verification work?', a: 'We verify your medical registration number, qualifications, and clinic/hospital affiliation. This typically takes 24-48 hours.' },
                            { q: 'Do you support international doctors?', a: 'Yes. We have pricing for India, US, UK, and other regions. Contact us for enterprise pricing in your region.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-surface-200 p-6">
                                <h3 className="font-extrabold text-surface-900 mb-2">{faq.q}</h3>
                                <p className="text-sm text-surface-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
