import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Health Insurance Providers - Compare Plans & TPAs | AIHealz',
  description: 'Compare health insurance providers, plans, TPAs, and claim settlement ratios. Find the best insurance for your needs with cashless hospital networks.',
  keywords: 'health insurance, insurance providers, TPA, claim settlement, cashless hospitals, medical insurance',
  openGraph: {
    title: 'Compare Health Insurance Plans | AIHealz',
    description: 'Compare insurance providers by claim settlement ratio, network hospitals, and plan options.',
    url: 'https://aihealz.com/insurance',
  },
};

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  private: 'Private Insurer',
  public: 'Public Sector',
  government: 'Government Scheme',
  cooperative: 'Cooperative',
};

const PLAN_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  family_floater: 'Family Floater',
  senior_citizen: 'Senior Citizen',
  group: 'Group/Corporate',
  critical_illness: 'Critical Illness',
  top_up: 'Top-Up',
  super_top_up: 'Super Top-Up',
  personal_accident: 'Personal Accident',
};

async function getGeoFromCookie() {
  const cookieStore = await cookies();
  const geoCookie = cookieStore.get('aihealz-geo')?.value;
  if (!geoCookie) return null;

  const parts = geoCookie.split(':');
  return {
    countrySlug: parts[0] || null,
    citySlug: parts[1] || null,
  };
}

export default async function InsurancePage() {
  const geo = await getGeoFromCookie();

  const [insurers, tpas, stats] = await Promise.all([
    prisma.insuranceProvider.findMany({
      where: { isActive: true },
      include: {
        plans: {
          where: { isActive: true },
          take: 3,
          select: { name: true, planType: true, sumInsuredMin: true, sumInsuredMax: true, premiumStartsAt: true },
        },
        _count: {
          select: { plans: true, hospitalTies: true, claims: true },
        },
      },
      orderBy: [
        { claimSettlementRatio: 'desc' },
      ],
    }),
    prisma.tpa.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { insuranceLinks: true, hospitalLinks: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.insuranceProvider.aggregate({
      _count: true,
      _avg: { claimSettlementRatio: true },
      where: { isActive: true },
    }),
  ]);

  const formatRatio = (ratio: number | null) => {
    if (!ratio) return '-';
    return `${Number(ratio).toFixed(1)}%`;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)} L`;
    return `${amount.toLocaleString('en-IN')}`;
  };

  // Generate structured data
  const insuranceFaqs = [
    { question: 'What is Claim Settlement Ratio (CSR)?', answer: 'CSR indicates the percentage of claims an insurer pays out of total claims received. A higher CSR (above 95%) indicates reliable claim processing and is a key factor in choosing insurance.' },
    { question: 'What is a TPA in health insurance?', answer: 'A Third Party Administrator (TPA) is an organization that processes insurance claims on behalf of insurance companies. They handle cashless hospitalization approvals and claim settlements.' },
    { question: 'What are cashless hospitals?', answer: 'Cashless hospitals are part of an insurer\'s network where you can get treatment without paying upfront. The insurer directly settles the bill with the hospital.' },
    { question: 'How do I compare insurance plans?', answer: 'Compare plans by premium, sum insured, claim settlement ratio, network hospitals, waiting periods, co-pay requirements, and specific coverage inclusions/exclusions.' },
  ];

  const structuredData = [
    generateWebPageSchema(
      'Health Insurance Providers - Compare Plans & TPAs',
      'Compare health insurance providers, plans, TPAs, and claim settlement ratios. Find the best insurance with cashless hospital networks.',
      'https://aihealz.com/insurance'
    ),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Insurance', url: '/insurance' },
    ]),
    generateItemListSchema(
      'Health Insurance Providers',
      'Compare insurance providers by claim settlement ratio and plans',
      insurers.slice(0, 10).map((ins, i) => ({
        name: ins.name,
        url: `/insurance/${ins.slug}`,
        position: i + 1,
      }))
    ),
    generateFAQSchema(insuranceFaqs),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-medical.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Health Insurance & TPAs
            </h1>
            <p className="text-xl text-indigo-200 mb-8">
              Compare {stats._count}+ insurance providers by claim settlement ratio, network hospitals, and plans.
              Find the right coverage for you and your family.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{stats._count}</span>
                <span className="ml-2 text-indigo-200">Insurers</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{tpas.length}</span>
                <span className="ml-2 text-indigo-200">TPAs</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{formatRatio(stats._avg.claimSettlementRatio as number | null)}</span>
                <span className="ml-2 text-indigo-200">Avg CSR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Filters */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Browse by Type</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/insurance"
              className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-200 transition-colors"
            >
              All Providers
            </Link>
            {Object.entries(PROVIDER_TYPE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/insurance?type=${key}`}
                className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Insurance Providers Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Insurance Providers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insurers.map((insurer) => (
              <Link
                key={insurer.id}
                href={`/insurance/${insurer.slug}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {insurer.logo ? (
                      <img
                        src={insurer.logo}
                        alt={insurer.name}
                        className="w-16 h-16 object-contain rounded-lg bg-slate-50 p-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600">{insurer.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {insurer.name}
                        </h3>
                        {Number(insurer.claimSettlementRatio) >= 95 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-semibold flex-shrink-0">
                            Top Rated
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {PROVIDER_TYPE_LABELS[insurer.providerType] || insurer.providerType}
                      </p>
                    </div>
                  </div>

                  {/* CSR Badge */}
                  {insurer.claimSettlementRatio && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{Number(insurer.claimSettlementRatio).toFixed(0)}%</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-700">Claim Settlement Ratio</p>
                        <p className="text-xs text-green-600">
                          {Number(insurer.claimSettlementRatio) >= 95 ? 'Excellent' :
                           Number(insurer.claimSettlementRatio) >= 90 ? 'Very Good' :
                           Number(insurer.claimSettlementRatio) >= 80 ? 'Good' : 'Average'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{insurer._count.plans}</p>
                      <p className="text-xs text-slate-500">Plans</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{insurer._count.hospitalTies}</p>
                      <p className="text-xs text-slate-500">Hospitals</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{insurer._count.claims || 0}</p>
                      <p className="text-xs text-slate-500">Claims</p>
                    </div>
                  </div>

                  {/* Sample Plans */}
                  {insurer.plans.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Popular Plans</p>
                      {insurer.plans.map((plan, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700 truncate">{plan.name}</span>
                          {plan.premiumStartsAt && (
                            <span className="text-indigo-600 font-medium flex-shrink-0">
                              from {formatCurrency(Number(plan.premiumStartsAt))}/yr
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TPAs Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Third Party Administrators (TPAs)</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <p className="text-sm text-slate-600">
                TPAs handle claim processing and cashless hospitalization on behalf of insurance companies.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">TPA Name</th>
                    <th className="px-6 py-3 text-center">Insurance Partners</th>
                    <th className="px-6 py-3 text-center">Network Hospitals</th>
                    <th className="px-6 py-3 text-left">Contact</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tpas.map((tpa) => (
                    <tr key={tpa.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {tpa.logo ? (
                            <img src={tpa.logo} alt={tpa.name} className="w-10 h-10 rounded object-contain bg-slate-50" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center">
                              <span className="font-bold text-purple-600">{tpa.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{tpa.name}</p>
                            {tpa.licenseNumber && (
                              <p className="text-xs text-slate-500">License: {tpa.licenseNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-indigo-600">{tpa._count.insuranceLinks}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-teal-600">{tpa._count.hospitalLinks}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {tpa.customerCarePhone && (
                            <p className="text-slate-600">{tpa.customerCarePhone}</p>
                          )}
                          {tpa.email && (
                            <p className="text-slate-500 text-xs">{tpa.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/insurance/tpa/${tpa.slug}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Plan Types Info */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Types of Health Insurance Plans</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(PLAN_TYPE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/insurance/plans?type=${key}`}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-slate-900 mb-2">{label}</h3>
                <p className="text-sm text-slate-500">
                  {key === 'individual' && 'Coverage for a single person'}
                  {key === 'family_floater' && 'Single sum insured for entire family'}
                  {key === 'senior_citizen' && 'Specialized plans for 60+ age group'}
                  {key === 'group' && 'Corporate and group coverage'}
                  {key === 'critical_illness' && 'Lump sum on diagnosis of listed illnesses'}
                  {key === 'top_up' && 'Extra coverage above base policy'}
                  {key === 'super_top_up' && 'Aggregate deductible based coverage'}
                  {key === 'personal_accident' && 'Coverage for accidental injuries'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
