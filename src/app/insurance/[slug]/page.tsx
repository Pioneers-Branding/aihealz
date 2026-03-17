import prisma from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const insurer = await prisma.insuranceProvider.findUnique({
    where: { slug },
    select: { name: true, description: true, metaTitle: true, metaDescription: true },
  });

  if (!insurer) return { title: 'Insurance Provider Not Found' };

  return {
    title: insurer.metaTitle || `${insurer.name} - Health Insurance Plans, Network Hospitals & Claim Settlement | AIHealz`,
    description: insurer.metaDescription || `Compare ${insurer.name} health insurance plans, network hospitals, TPAs, and claim settlement ratio.`,
  };
}

const PLAN_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  individual: { label: 'Individual', color: 'bg-blue-100 text-blue-700' },
  family_floater: { label: 'Family Floater', color: 'bg-green-100 text-green-700' },
  senior_citizen: { label: 'Senior Citizen', color: 'bg-purple-100 text-purple-700' },
  group: { label: 'Group', color: 'bg-orange-100 text-orange-700' },
  critical_illness: { label: 'Critical Illness', color: 'bg-red-100 text-red-700' },
  top_up: { label: 'Top-Up', color: 'bg-teal-100 text-teal-700' },
  super_top_up: { label: 'Super Top-Up', color: 'bg-cyan-100 text-cyan-700' },
  personal_accident: { label: 'Personal Accident', color: 'bg-amber-100 text-amber-700' },
};

export default async function InsuranceDetailPage({ params }: Props) {
  const { slug } = await params;

  const insurer = await prisma.insuranceProvider.findUnique({
    where: { slug },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { premiumStartsAt: 'asc' }],
      },
      tpaAssociations: {
        include: {
          tpa: { select: { name: true, slug: true, logo: true, customerCarePhone: true } },
        },
      },
      hospitalTies: {
        include: {
          hospital: { select: { name: true, slug: true, city: true, logo: true } },
        },
        take: 20,
      },
      _count: {
        select: { plans: true, hospitalTies: true, claims: true },
      },
    },
  });

  if (!insurer) notFound();

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(0)} L`;
    return `${amount.toLocaleString('en-IN')}`;
  };

  const formatRatio = (ratio: number | null | undefined) => {
    if (!ratio) return '-';
    return `${Number(ratio).toFixed(1)}%`;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Logo */}
            <div className="lg:w-48 flex-shrink-0">
              {insurer.logo ? (
                <img
                  src={insurer.logo}
                  alt={insurer.name}
                  className="w-full h-32 object-contain rounded-xl bg-slate-50 p-4 border border-slate-200"
                />
              ) : (
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-slate-200">
                  <span className="text-4xl font-bold text-indigo-600">{insurer.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{insurer.name}</h1>
                {Number(insurer.claimSettlementRatio) >= 95 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Top Rated</span>
                )}
              </div>

              {insurer.description && (
                <p className="text-lg text-slate-600 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: insurer.description.slice(0, 200) }} />
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                <span className="px-3 py-1 rounded-full bg-slate-100 font-medium">
                  {insurer.providerType === 'private' ? 'Private Insurer' :
                   insurer.providerType === 'public' ? 'Public Sector' :
                   insurer.providerType === 'government' ? 'Government Scheme' : insurer.providerType}
                </span>
                {insurer.licenseNumber && (
                  <span className="text-slate-500">{insurer.regulatoryBody || 'License'}: {insurer.licenseNumber}</span>
                )}
                {insurer.establishedYear && (
                  <span className="text-slate-500">Est. {insurer.establishedYear}</span>
                )}
              </div>

              {/* Key Metrics */}
              <div className="flex flex-wrap gap-4">
                {insurer.claimSettlementRatio && (
                  <div className="flex items-center gap-2 bg-green-50 rounded-lg px-4 py-2">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{Number(insurer.claimSettlementRatio).toFixed(0)}%</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700">Claim Settlement Ratio</p>
                      <p className="text-xs text-green-600">Industry avg: ~90%</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-4 py-2">
                  <span className="text-xl font-bold text-purple-700">{insurer._count.hospitalTies}</span>
                  <span className="text-sm text-purple-600">Network Hospitals</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="font-semibold text-slate-900 mb-4">Get a Quote</h3>
                <Link
                  href={`/insurance/${insurer.slug}/quote`}
                  className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-center transition-colors mb-3"
                >
                  Compare Plans
                </Link>
                {insurer.website && (
                  <a
                    href={insurer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 text-sm text-center text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Visit Official Website
                  </a>
                )}
                {insurer.customerCarePhone && (
                  <p className="mt-3 text-center text-sm text-slate-600">
                    Call: <a href={`tel:${insurer.customerCarePhone}`} className="text-indigo-600 font-medium">{insurer.customerCarePhone}</a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {insurer.description && (
              <section className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">About {insurer.name}</h2>
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: insurer.description }} />
              </section>
            )}

            {/* Plans */}
            <section className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Health Insurance Plans ({insurer._count.plans})</h2>
              <div className="space-y-4">
                {insurer.plans.map((plan) => (
                  <div key={plan.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PLAN_TYPE_LABELS[plan.planType]?.color || 'bg-slate-100 text-slate-600'}`}>
                            {PLAN_TYPE_LABELS[plan.planType]?.label || plan.planType}
                          </span>
                          {plan.isFeatured && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-semibold">Popular</span>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-slate-500">
                            Sum Insured: <span className="font-medium text-slate-700">{formatCurrency(Number(plan.sumInsuredMin))} - {formatCurrency(Number(plan.sumInsuredMax))}</span>
                          </span>
                          {plan.entryAgeMin !== null && plan.entryAgeMax !== null && (
                            <span className="text-slate-500">
                              Age: <span className="font-medium text-slate-700">{plan.entryAgeMin} - {plan.entryAgeMax} years</span>
                            </span>
                          )}
                        </div>

                        {/* Key Features */}
                        {plan.coverageHighlights && plan.coverageHighlights.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {plan.coverageHighlights.slice(0, 4).map((feature, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="md:text-right flex-shrink-0">
                        {plan.premiumStartsAt && (
                          <div className="mb-2">
                            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(Number(plan.premiumStartsAt))}</p>
                            <p className="text-xs text-slate-500">per year starting</p>
                          </div>
                        )}
                        <Link
                          href={`/insurance/${insurer.slug}/plans/${plan.slug}`}
                          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Waiting Periods */}
                    {(plan.preExistingWaitYears || plan.specificDiseaseWait) && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Waiting Periods</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {plan.preExistingWaitYears && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded">
                              Pre-existing: {plan.preExistingWaitYears} years
                            </span>
                          )}
                          {plan.specificDiseaseWait && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded">
                              Specific diseases: {plan.specificDiseaseWait} days
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Network Hospitals */}
            {insurer.hospitalTies.length > 0 && (
              <section className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Cashless Network Hospitals</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {insurer.hospitalTies.map((tie) => (
                    <Link
                      key={tie.id}
                      href={`/hospitals/${tie.hospital.slug}`}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                    >
                      {tie.hospital.logo ? (
                        <img src={tie.hospital.logo} alt={tie.hospital.name} className="w-10 h-10 rounded object-contain bg-white" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-teal-100 flex items-center justify-center">
                          <span className="font-bold text-teal-600">{tie.hospital.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{tie.hospital.name}</p>
                        <p className="text-xs text-slate-500">{tie.hospital.city}</p>
                      </div>
                      {tie.isCashless && (
                        <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded flex-shrink-0">
                          Cashless
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
                {insurer._count.hospitalTies > 20 && (
                  <div className="mt-4 text-center">
                    <Link href={`/insurance/${insurer.slug}/hospitals`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                      View all {insurer._count.hospitalTies} network hospitals
                    </Link>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* TPAs */}
            {insurer.tpaAssociations.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">TPAs (Claim Processing)</h3>
                <div className="space-y-3">
                  {insurer.tpaAssociations.map((link) => (
                    <Link
                      key={link.id}
                      href={`/insurance/tpa/${link.tpa.slug}`}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      {link.tpa.logo ? (
                        <img src={link.tpa.logo} alt={link.tpa.name} className="w-10 h-10 rounded object-contain bg-white" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center">
                          <span className="font-bold text-purple-600">{link.tpa.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{link.tpa.name}</p>
                        {link.tpa.customerCarePhone && (
                          <p className="text-xs text-slate-500">{link.tpa.customerCarePhone}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Key Info */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Key Information</h3>
              <dl className="space-y-3 text-sm">
                {insurer.claimSettlementRatio && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Claim Settlement Ratio</dt>
                    <dd className="font-semibold text-green-600">{formatRatio(Number(insurer.claimSettlementRatio))}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Total Plans</dt>
                  <dd className="font-medium text-slate-900">{insurer._count.plans}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Network Hospitals</dt>
                  <dd className="font-medium text-slate-900">{insurer._count.hospitalTies}</dd>
                </div>
              </dl>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                {insurer.customerCarePhone && (
                  <p>
                    <span className="text-slate-500">Toll Free:</span>{' '}
                    <a href={`tel:${insurer.customerCarePhone}`} className="text-indigo-600 font-medium">{insurer.customerCarePhone}</a>
                  </p>
                )}
                {insurer.email && (
                  <p>
                    <span className="text-slate-500">Email:</span>{' '}
                    <a href={`mailto:${insurer.email}`} className="text-indigo-600">{insurer.email}</a>
                  </p>
                )}
                {insurer.headquartersCity && (
                  <p>
                    <span className="text-slate-500">HQ:</span>{' '}
                    <span className="text-slate-700">{insurer.headquartersCity}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Exclusions Warning */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Important
              </h3>
              <p className="text-sm text-amber-700">
                Always read the policy document carefully for exclusions, waiting periods, and claim procedures before purchasing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
