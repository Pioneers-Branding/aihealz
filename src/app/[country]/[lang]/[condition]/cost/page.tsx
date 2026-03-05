import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { SLUG_TO_CODE, getCountryBySlug } from '@/lib/countries';

// ── Locale map for currency formatting ──────────────────────
const LOCALE_MAP: Record<string, string> = {
    in: 'en-IN', us: 'en-US', gb: 'en-GB', ae: 'en-AE', sg: 'en-SG',
    au: 'en-AU', ca: 'en-CA', de: 'de-DE', fr: 'fr-FR', jp: 'ja-JP',
    kr: 'ko-KR', br: 'pt-BR', mx: 'es-MX', sa: 'ar-SA', za: 'en-ZA',
    my: 'en-MY', th: 'th-TH', ph: 'en-PH', ng: 'en-NG', ke: 'en-KE',
};

function formatCost(amount: number | { toNumber?: () => number }, currency: string, countryCode: string): string {
    const num = typeof amount === 'number' ? amount : (amount?.toNumber?.() ?? Number(amount));
    const locale = LOCALE_MAP[countryCode.toLowerCase()] || 'en-US';
    try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(num);
    } catch {
        return `${currency} ${num.toLocaleString()}`;
    }
}

// ── Dynamic SEO Metadata ────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ country: string; lang: string; condition: string }> }): Promise<Metadata> {
    const { country, condition } = await params;
    const mc = await prisma.medicalCondition.findUnique({ where: { slug: condition } });
    const countryName = country.toUpperCase();
    return {
        title: mc ? `Cost of ${mc.commonName} Treatment in ${countryName} | aihealz` : 'Treatment Costs | aihealz',
        description: mc ? `Compare treatment costs for ${mc.commonName} in ${countryName}. AI-estimated pricing from verified hospitals.` : 'Compare medical treatment costs.',
    };
}

export default async function CostPage({ params }: { params: Promise<{ country: string, lang: string, condition: string }> }) {
    const { country, lang, condition } = await params;

    const medicalCondition = await prisma.medicalCondition.findUnique({
        where: { slug: condition, isActive: true }
    });

    if (!medicalCondition) notFound();

    // Convert country slug to ISO code for database lookup
    // Database stores lowercase ISO codes: "in", "us", "gb"
    // URL uses slugs: "india", "usa", "uk"
    const countryCode = SLUG_TO_CODE[country]?.toLowerCase() || country;
    const countryConfig = getCountryBySlug(country);

    const costData = await prisma.treatmentCost.findFirst({
        where: { conditionSlug: condition, countryCode: countryCode }
    });

    return (
        <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <nav className="text-sm text-slate-500 mb-8 flex gap-2 font-semibold">
                    <Link href="/" className="hover:text-teal-400 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href={`/${country}/${lang}/${condition}`} className="hover:text-teal-400 transition-colors">{medicalCondition.commonName}</Link>
                    <span>/</span>
                    <span className="text-white">Cost Analysis</span>
                </nav>

                <div className="bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/5 p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">
                            Cost of {medicalCondition.commonName} Treatment
                        </h1>
                        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                            Understand the financial aspects, hospital estimates, and average procedure costs for treating {medicalCondition.commonName.toLowerCase()}.
                        </p>

                        {costData ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-12">
                                <div className="p-8 bg-slate-800/50 rounded-2xl border border-white/5 text-center flex flex-col justify-center shadow-lg">
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum</div>
                                    <div className="text-2xl font-bold text-white">{formatCost(costData.minCost, costData.currency, country)}</div>
                                </div>
                                <div className="p-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl border border-teal-400/50 text-center text-slate-900 shadow-2xl transform md:scale-110 z-10 relative">
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-teal-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-teal-500/30">
                                        AI Database Average
                                    </span>
                                    <div className="text-sm font-bold text-slate-800/70 uppercase tracking-wider mb-2 mt-2">Average</div>
                                    <div className="text-4xl font-black tracking-tight">{formatCost(costData.avgCost, costData.currency, country)}</div>
                                    <div className="text-xs font-bold text-slate-900 mt-4 bg-white/20 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm">{costData.treatmentName}</div>
                                </div>
                                <div className="p-8 bg-slate-800/50 rounded-2xl border border-white/5 text-center flex flex-col justify-center shadow-lg">
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Maximum</div>
                                    <div className="text-2xl font-bold text-white">{formatCost(costData.maxCost, costData.currency, country)}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 bg-slate-800/30 rounded-2xl border border-dashed border-white/10 text-center mb-10">
                                <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-slate-400 font-medium">Detailed cost data is currently being gathered for this region.</p>
                            </div>
                        )}

                        <div className="mt-8 bg-slate-800/30 p-8 rounded-2xl border border-white/5">
                            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                What's included typically?
                            </h3>
                            <ul className="space-y-3 marker:text-teal-500 text-slate-300">
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">•</span> Initial specialist consultation and physical examination.</li>
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">•</span> Standard diagnostic tests (varies heavily by severity).</li>
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">•</span> The core procedure or treatment protocol ({costData?.treatmentName || 'Standard care'}).</li>
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">•</span> Follow-up visits (usually 1-2 included post-procedure).</li>
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">•</span> Standard hospital room charges for basic tiers (if surgical).</li>
                            </ul>
                            <div className="mt-8 p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                                <p className="text-xs text-teal-200/80 leading-relaxed font-medium">
                                    *Note: These are AI-estimated averages based on public health data and private hospital rate cards. Actual costs will vary heavily based on the patient's specific health profile, room category chosen, doctor seniority, and exact hospital tier.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-teal-900/40 to-slate-800 rounded-[2rem] p-10 md:p-14 text-center shadow-2xl relative overflow-hidden border border-teal-500/20 group">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl group-hover:bg-teal-500/30 transition-colors duration-1000"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Need an Exact Quote?</h2>
                        <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                            Connect with our Medical Travel Concierge. We'll match you with top-rated hospitals and verify your exact procedure costs within 24 hours.
                        </p>
                        <Link href="/medical-travel/bot" className="inline-flex items-center gap-2 px-10 py-5 bg-teal-500 text-slate-900 font-extrabold rounded-2xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 transform duration-300">
                            Get Official PDF Estimate
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                        <p className="mt-6 text-xs text-teal-500/70 font-bold tracking-widest uppercase">100% Free Service • Transparent Pricing • No Obligations</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
