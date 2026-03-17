'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  User, Building2, Microscope, Check, X, Star, Zap,
  Users, TrendingUp, Shield, Clock, Phone, BarChart3
} from 'lucide-react';

type ProviderType = 'doctors' | 'hospitals' | 'labs';

interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  name: string;
  slug: string;
  price: string;
  priceSuffix: string;
  description: string;
  badge?: string;
  highlighted?: boolean;
  metrics: { label: string; value: string }[];
  features: PlanFeature[];
  cta: string;
  ctaLink: string;
}

const DOCTOR_PLANS: Plan[] = [
  {
    name: 'Free',
    slug: 'doctor-free',
    price: '$0',
    priceSuffix: 'forever',
    description: 'Get started and claim your profile. Perfect for individual practitioners.',
    metrics: [
      { label: 'Specialties', value: '2' },
      { label: 'Leads/mo', value: '5' },
    ],
    features: [
      { label: 'Basic profile listing', included: true },
      { label: 'Patient lead credits (5/month)', included: true },
      { label: 'Standard search ranking', included: true },
      { label: 'AI-generated bio', included: false },
      { label: 'Lead scoring & quality filters', included: false },
      { label: 'Telelink booking integration', included: false },
      { label: 'Priority listing on condition pages', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: 'Dedicated account manager', included: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/for-doctors#join-form',
  },
  {
    name: 'Premium',
    slug: 'doctor-premium',
    price: '$19',
    priceSuffix: '/month',
    description: 'For growing practices that want more visibility and patient flow.',
    badge: 'Most Popular',
    highlighted: true,
    metrics: [
      { label: 'Specialties', value: '15' },
      { label: 'Leads/mo', value: '50' },
    ],
    features: [
      { label: 'Enhanced profile with AI bio', included: true },
      { label: 'Patient lead credits (50/month)', included: true, highlight: true },
      { label: 'Priority search ranking', included: true, highlight: true },
      { label: 'AI-generated bio', included: true },
      { label: 'Lead scoring & quality filters', included: true },
      { label: 'Telelink booking integration', included: true },
      { label: 'Priority listing on condition pages', included: true },
      { label: 'Analytics dashboard', included: false },
      { label: 'Dedicated account manager', included: false },
    ],
    cta: 'Start 14-Day Trial',
    ctaLink: '/for-doctors/checkout?plan=premium',
  },
  {
    name: 'Enterprise',
    slug: 'doctor-enterprise',
    price: '$59',
    priceSuffix: '/month',
    description: 'For multi-specialty clinics and practice groups.',
    badge: 'Best for Clinics',
    metrics: [
      { label: 'Specialties', value: 'Unlimited' },
      { label: 'Leads/mo', value: '500' },
    ],
    features: [
      { label: 'Premium profile with full customization', included: true },
      { label: 'Patient lead credits (500/month)', included: true, highlight: true },
      { label: 'Top-tier search ranking', included: true, highlight: true },
      { label: 'AI-generated bio', included: true },
      { label: 'Lead scoring & quality filters', included: true },
      { label: 'Telelink booking integration', included: true },
      { label: 'Priority listing on condition pages', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?subject=Enterprise%20Doctor%20Plan',
  },
];

const HOSPITAL_PLANS: Plan[] = [
  {
    name: 'Basic',
    slug: 'hospital-basic',
    price: '$99',
    priceSuffix: '/month',
    description: 'Essential listing for small hospitals and nursing homes.',
    metrics: [
      { label: 'Departments', value: '5' },
      { label: 'Doctor Profiles', value: '10' },
    ],
    features: [
      { label: 'Hospital profile page', included: true },
      { label: 'Location on maps', included: true },
      { label: 'Department listings (5)', included: true },
      { label: 'Doctor profile links (10)', included: true },
      { label: 'Insurance empanelment display', included: true },
      { label: 'Enquiry lead management', included: false },
      { label: 'Equipment & facilities showcase', included: false },
      { label: 'International patient portal', included: false },
      { label: 'Analytics & reporting', included: false },
      { label: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/provider/hospital/register?plan=basic',
  },
  {
    name: 'Professional',
    slug: 'hospital-professional',
    price: '$299',
    priceSuffix: '/month',
    description: 'Full-featured listing for multi-specialty hospitals.',
    badge: 'Recommended',
    highlighted: true,
    metrics: [
      { label: 'Departments', value: 'Unlimited' },
      { label: 'Doctor Profiles', value: '100' },
    ],
    features: [
      { label: 'Enhanced hospital profile', included: true },
      { label: 'Location on maps + street view', included: true },
      { label: 'Unlimited department listings', included: true, highlight: true },
      { label: 'Doctor profile links (100)', included: true, highlight: true },
      { label: 'Insurance empanelment display', included: true },
      { label: 'Enquiry lead management', included: true },
      { label: 'Equipment & facilities showcase', included: true },
      { label: 'International patient portal', included: false },
      { label: 'Analytics & reporting', included: true },
      { label: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/provider/hospital/register?plan=professional',
  },
  {
    name: 'Enterprise',
    slug: 'hospital-enterprise',
    price: 'Custom',
    priceSuffix: 'pricing',
    description: 'For hospital chains, corporate groups, and medical tourism hubs.',
    badge: 'For Chains',
    metrics: [
      { label: 'Locations', value: 'Unlimited' },
      { label: 'Doctor Profiles', value: 'Unlimited' },
    ],
    features: [
      { label: 'Multi-location management', included: true, highlight: true },
      { label: 'Centralized dashboard', included: true },
      { label: 'Unlimited departments & doctors', included: true, highlight: true },
      { label: 'White-label patient portal', included: true },
      { label: 'Insurance empanelment display', included: true },
      { label: 'Enquiry lead management', included: true },
      { label: 'Equipment & facilities showcase', included: true },
      { label: 'International patient portal', included: true },
      { label: 'Custom analytics & API access', included: true },
      { label: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?subject=Enterprise%20Hospital%20Plan',
  },
];

const LAB_PLANS: Plan[] = [
  {
    name: 'Starter',
    slug: 'lab-starter',
    price: '$49',
    priceSuffix: '/month',
    description: 'For single-location pathology labs and collection centers.',
    metrics: [
      { label: 'Test Listings', value: '100' },
      { label: 'Bookings/mo', value: '50' },
    ],
    features: [
      { label: 'Lab profile page', included: true },
      { label: 'Test catalog (100 tests)', included: true },
      { label: 'Online booking widget', included: true },
      { label: 'Home collection scheduling', included: true },
      { label: 'Price comparison visibility', included: true },
      { label: 'Partner discounts display', included: false },
      { label: 'Report delivery portal', included: false },
      { label: 'Multi-branch management', included: false },
      { label: 'Analytics dashboard', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/provider/lab/register?plan=starter',
  },
  {
    name: 'Growth',
    slug: 'lab-growth',
    price: '$149',
    priceSuffix: '/month',
    description: 'For growing labs with multiple collection points.',
    badge: 'Most Popular',
    highlighted: true,
    metrics: [
      { label: 'Test Listings', value: '500' },
      { label: 'Bookings/mo', value: '300' },
    ],
    features: [
      { label: 'Enhanced lab profile', included: true },
      { label: 'Test catalog (500 tests)', included: true, highlight: true },
      { label: 'Online booking widget', included: true },
      { label: 'Home collection scheduling', included: true },
      { label: 'Price comparison visibility', included: true },
      { label: 'Partner discounts display', included: true },
      { label: 'Report delivery portal', included: true },
      { label: 'Multi-branch (3 locations)', included: true, highlight: true },
      { label: 'Analytics dashboard', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/provider/lab/register?plan=growth',
  },
  {
    name: 'Chain',
    slug: 'lab-chain',
    price: '$399',
    priceSuffix: '/month',
    description: 'For diagnostic chains and franchise networks.',
    badge: 'For Networks',
    metrics: [
      { label: 'Test Listings', value: 'Unlimited' },
      { label: 'Bookings/mo', value: 'Unlimited' },
    ],
    features: [
      { label: 'Premium network profile', included: true },
      { label: 'Unlimited test catalog', included: true, highlight: true },
      { label: 'Online booking widget', included: true },
      { label: 'Home collection scheduling', included: true },
      { label: 'Price comparison visibility', included: true },
      { label: 'Featured partner placement', included: true, highlight: true },
      { label: 'Report delivery portal', included: true },
      { label: 'Unlimited locations', included: true, highlight: true },
      { label: 'Custom analytics & API', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact?subject=Lab%20Chain%20Plan',
  },
];

const PROVIDER_TABS: { id: ProviderType; label: string; icon: typeof User }[] = [
  { id: 'doctors', label: 'Doctors', icon: User },
  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
  { id: 'labs', label: 'Diagnostic Labs', icon: Microscope },
];

export default function PricingPage() {
  const [providerType, setProviderType] = useState<ProviderType>('doctors');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = {
    doctors: DOCTOR_PLANS,
    hospitals: HOSPITAL_PLANS,
    labs: LAB_PLANS,
  }[providerType];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-6">
            <Zap size={14} />
            Provider Plans & Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
            Grow your practice with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
              AIHealz
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the right plan for your practice size. Start free, scale as you grow.
          </p>
        </div>

        {/* Provider Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100">
            {PROVIDER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setProviderType(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  providerType === tab.id
                    ? 'bg-white text-teal-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span
            className={`text-sm font-medium ${
              billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full bg-slate-200 transition-colors"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-teal-600 transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : ''
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            Annual
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">
              Save 20%
            </span>
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`rounded-3xl border overflow-hidden flex flex-col transition-all ${
                plan.highlighted
                  ? 'bg-white border-teal-300 ring-2 ring-teal-200 shadow-xl shadow-teal-500/10 scale-105 z-10'
                  : 'bg-white border-slate-200 hover:border-teal-200 hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`text-center py-2 text-xs font-bold uppercase tracking-wider ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    {plan.price === 'Custom'
                      ? 'Custom'
                      : billingCycle === 'annual'
                      ? `$${Math.floor(parseInt(plan.price.replace('$', '')) * 0.8)}`
                      : plan.price}
                  </span>
                  <span className="text-sm text-slate-500 mb-1.5">
                    {plan.price === 'Custom' ? plan.priceSuffix : billingCycle === 'annual' ? '/month (billed annually)' : plan.priceSuffix}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-3">
                {plan.metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="text-xs text-slate-500 font-medium">{metric.label}</p>
                    <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check
                          size={16}
                          className={`mt-0.5 flex-shrink-0 ${
                            feature.highlight ? 'text-teal-600' : 'text-emerald-500'
                          }`}
                        />
                      ) : (
                        <X size={16} className="mt-0.5 flex-shrink-0 text-slate-300" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? feature.highlight
                              ? 'text-slate-900 font-medium'
                              : 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <Link
                  href={plan.ctaLink}
                  className={`block w-full text-center py-3 rounded-2xl font-bold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Why Healthcare Providers Choose AIHealz
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Patient Reach',
                desc: 'Connect with millions of patients searching for healthcare.',
              },
              {
                icon: TrendingUp,
                title: 'Lead Quality',
                desc: 'AI-scored leads based on intent and condition match.',
              },
              {
                icon: Shield,
                title: 'Verified Profiles',
                desc: 'Build trust with verified credentials and reviews.',
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                desc: 'Track performance, conversions, and ROI in real-time.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I try before committing?',
                a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'How do lead credits work?',
                a: 'Lead credits allow you to view and respond to patient enquiries. Each credit reveals one patient contact. Unused credits roll over for up to 3 months.',
              },
              {
                q: 'Can I upgrade or downgrade?',
                a: 'Absolutely. Upgrade anytime with prorated billing. Downgrade takes effect at the end of your billing cycle.',
              },
              {
                q: 'Do you offer custom enterprise plans?',
                a: 'Yes, for large hospital chains, diagnostic networks, or special requirements. Contact our sales team for custom pricing.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, net banking (India), and wire transfers for enterprise accounts.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl border border-slate-200"
              >
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">Need help choosing the right plan?</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
            >
              <Phone size={18} />
              Talk to Sales
            </Link>
            <Link
              href="/for-doctors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
            >
              Get Started
              <Star size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
