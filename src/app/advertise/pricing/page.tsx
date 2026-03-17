import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Advertising Pricing | AIHealz',
    description: 'Flexible advertising pricing for healthcare businesses. CPM, CPC, and flat-rate options available.',
    openGraph: {
        title: 'Advertising Pricing | AIHealz',
        description: 'Flexible advertising pricing for healthcare businesses on the world\'s biggest multilingual healthcare platform.',
        url: 'https://aihealz.com/advertise/pricing',
    },
};

const PRICING_TIERS = [
    {
        name: 'Starter',
        price: '$0.50',
        unit: 'CPM',
        minSpend: '$100',
        description: 'Perfect for small clinics testing digital advertising',
        features: [
            { text: 'Self-serve dashboard', included: true },
            { text: 'Basic geo-targeting (country level)', included: true },
            { text: 'Condition page sidebar placements', included: true },
            { text: 'Real-time analytics', included: true },
            { text: 'Email support (48hr response)', included: true },
            { text: 'Advanced city-level targeting', included: false },
            { text: 'A/B testing', included: false },
            { text: 'Dedicated account manager', included: false },
            { text: 'Custom reporting', included: false },
        ],
        cta: 'Start Free Trial',
        popular: false,
        color: 'slate',
    },
    {
        name: 'Professional',
        price: '$0.25',
        unit: 'CPC',
        minSpend: '$500',
        description: 'Best for growing healthcare businesses',
        features: [
            { text: 'Everything in Starter', included: true },
            { text: 'Advanced city-level targeting', included: true },
            { text: 'All placement types', included: true },
            { text: 'A/B testing (up to 3 variants)', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Priority support (24hr response)', included: true },
            { text: 'Custom reporting', included: true },
            { text: 'Conversion tracking', included: true },
            { text: 'API access', included: false },
        ],
        cta: 'Get Started',
        popular: true,
        color: 'teal',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        unit: 'Flat Rate',
        minSpend: 'Custom',
        description: 'For hospitals and healthcare networks',
        features: [
            { text: 'Everything in Professional', included: true },
            { text: 'Premium homepage placements', included: true },
            { text: 'Exclusive sponsorships', included: true },
            { text: 'Unlimited A/B testing', included: true },
            { text: 'API access', included: true },
            { text: 'White-glove onboarding', included: true },
            { text: 'SLA guarantee (99.9% uptime)', included: true },
            { text: 'Multi-location support', included: true },
            { text: 'Custom integrations', included: true },
        ],
        cta: 'Contact Sales',
        popular: false,
        color: 'blue',
    },
];

const PLACEMENT_PRICING = [
    { placement: 'Condition Page Sidebar', size: '300x250', cpm: '$0.50', cpc: '$0.25', flatRate: '$200/mo' },
    { placement: 'Condition Page Inline', size: 'Native', cpm: '$0.75', cpc: '$0.35', flatRate: '$300/mo' },
    { placement: 'Homepage Hero', size: '970x250', cpm: '$1.50', cpc: '$0.75', flatRate: '$1,000/mo' },
    { placement: 'Homepage Featured', size: 'Card', cpm: '$1.00', cpc: '$0.50', flatRate: '$750/mo' },
    { placement: 'Search Results Top', size: '728x90', cpm: '$0.80', cpc: '$0.40', flatRate: '$400/mo' },
    { placement: 'Doctor Profile Sidebar', size: '300x250', cpm: '$0.60', cpc: '$0.30', flatRate: '$250/mo' },
    { placement: 'Global Header Banner', size: '970x90', cpm: '$2.00', cpc: '$1.00', flatRate: '$2,000/mo' },
    { placement: 'Global Footer Banner', size: '970x90', cpm: '$0.40', cpc: '$0.20', flatRate: '$150/mo' },
];

const REGIONAL_MULTIPLIERS = [
    { region: 'United States', multiplier: '1.5x' },
    { region: 'United Kingdom', multiplier: '1.3x' },
    { region: 'Australia', multiplier: '1.3x' },
    { region: 'Canada', multiplier: '1.2x' },
    { region: 'UAE', multiplier: '1.2x' },
    { region: 'Germany', multiplier: '1.1x' },
    { region: 'India', multiplier: '1.0x (Base)' },
    { region: 'Nigeria', multiplier: '0.8x' },
    { region: 'Kenya', multiplier: '0.8x' },
];

export default function AdvertisePricingPage() {
    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            {/* Header */}
            <section className="relative pt-32 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <Link
                        href="/advertise"
                        className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-medium mb-6 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Advertising
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Choose the billing model that works best for your business. No hidden fees.
                    </p>
                </div>
            </section>

            {/* Pricing Tiers */}
            <section className="relative py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {PRICING_TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative rounded-3xl border p-8 ${
                                    tier.popular
                                        ? 'bg-gradient-to-b from-teal-900/40 to-slate-900/80 border-teal-500/30 shadow-xl shadow-teal-500/10'
                                        : 'bg-white/[0.03] border-white/10'
                                }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-500 text-slate-900 text-xs font-bold rounded-full">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                                    <p className="text-slate-400 text-sm">{tier.description}</p>
                                </div>
                                <div className="mb-2">
                                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                                    <span className="text-slate-400 ml-2">/ {tier.unit}</span>
                                </div>
                                <div className="text-sm text-slate-500 mb-6">
                                    Minimum spend: {tier.minSpend}/month
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            {feature.included ? (
                                                <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                            <span className={feature.included ? 'text-slate-300' : 'text-slate-600'}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/advertise/enquiry"
                                    className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                                        tier.popular
                                            ? 'bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-lg shadow-teal-500/20'
                                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                    }`}
                                >
                                    {tier.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Placement Pricing Table */}
            <section className="relative py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                            Placement Rates
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Pricing by Placement
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Base rates shown below. Final pricing may vary based on targeting options and region.
                        </p>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Placement</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">Size</th>
                                        <th className="text-center py-4 px-6 text-sm font-semibold text-slate-400">CPM</th>
                                        <th className="text-center py-4 px-6 text-sm font-semibold text-slate-400">CPC</th>
                                        <th className="text-center py-4 px-6 text-sm font-semibold text-slate-400">Flat Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PLACEMENT_PRICING.map((p, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 px-6 text-white font-medium">{p.placement}</td>
                                            <td className="py-4 px-6 text-slate-400 font-mono text-sm">{p.size}</td>
                                            <td className="py-4 px-6 text-center text-teal-400 font-semibold">{p.cpm}</td>
                                            <td className="py-4 px-6 text-center text-cyan-400 font-semibold">{p.cpc}</td>
                                            <td className="py-4 px-6 text-center text-blue-400 font-semibold">{p.flatRate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Regional Multipliers */}
            <section className="relative py-20 px-6 bg-gradient-to-b from-transparent via-teal-900/10 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                            Regional Pricing
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Geographic Rate Adjustments
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Prices vary by target region based on market demand and purchasing power.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {REGIONAL_MULTIPLIERS.map((r) => (
                            <div
                                key={r.region}
                                className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/10"
                            >
                                <span className="text-slate-300">{r.region}</span>
                                <span className={`font-mono font-semibold ${
                                    r.multiplier.includes('Base') ? 'text-teal-400' :
                                    r.multiplier.startsWith('0') ? 'text-green-400' : 'text-amber-400'
                                }`}>
                                    {r.multiplier}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="relative py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Pricing FAQ
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'What is CPM vs CPC billing?',
                                a: 'CPM (Cost Per Mille) charges you for every 1,000 impressions your ad receives, regardless of clicks. CPC (Cost Per Click) only charges when someone clicks on your ad. CPM is better for brand awareness, while CPC is better for direct response campaigns.',
                            },
                            {
                                q: 'Is there a minimum spend requirement?',
                                a: 'Yes, minimum spend varies by plan: Starter requires $100/month, Professional requires $500/month. Enterprise minimums are negotiated based on your campaign scope.',
                            },
                            {
                                q: 'How do I pay for advertising?',
                                a: 'We accept all major credit cards via Stripe. Enterprise accounts can also pay via wire transfer or invoice. You can prepay for a campaign budget or set up automatic billing.',
                            },
                            {
                                q: 'Can I change my billing model mid-campaign?',
                                a: 'Yes, you can switch between CPM and CPC billing at any time. Changes take effect from the next billing cycle. Flat-rate campaigns cannot be changed once started.',
                            },
                            {
                                q: 'Do you offer discounts for long-term commitments?',
                                a: 'Yes! We offer 10% off for 3-month commitments, 15% off for 6-month commitments, and 20% off for annual contracts. Contact our sales team to discuss.',
                            },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-teal-900/40 via-blue-900/20 to-slate-900 rounded-3xl border border-teal-500/20 p-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                            Fill out our enquiry form and our team will help you choose the right plan for your goals.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/advertise/enquiry"
                                className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:-translate-y-0.5"
                            >
                                Start Advertising
                            </Link>
                            <Link
                                href="/contact"
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
