import prisma from '@/lib/db';
import Link from 'next/link';
import Script from 'next/script';
import SearchAutocomplete from '@/components/ui/search-autocomplete';
import HomepageSpecialties from '@/components/ui/homepage-specialties';
import { normalizeSpecialty, SPECIALTY_ICON_MAP } from '@/lib/normalize-specialty';
import { getGeoContext } from '@/lib/geo-context';

// Country display names
const COUNTRY_NAMES: Record<string, string> = {
  'india': 'India',
  'usa': 'United States',
  'uk': 'United Kingdom',
  'nigeria': 'Nigeria',
  'germany': 'Germany',
  'france': 'France',
  'brazil': 'Brazil',
  'spain': 'Spain',
  'kenya': 'Kenya',
  'south-africa': 'South Africa',
  'australia': 'Australia',
  'canada': 'Canada',
  'mexico': 'Mexico',
  'uae': 'UAE',
  'saudi-arabia': 'Saudi Arabia',
};

export default async function Home() {
  // Get user's geo context from middleware
  const geo = await getGeoContext();
  const countryName = geo.countrySlug ? COUNTRY_NAMES[geo.countrySlug] || geo.countrySlug : null;
  const cityDisplay = geo.citySlug ? geo.citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;

  // Gracefully handle DB unavailability during local dev
  let specCountMap: Record<string, number> = {};
  let specialties: string[] = [];
  let grouped: Record<string, { slug: string; commonName: string; specialistType: string | null; description: string | null }[]> = {};

  try {
    /* ── Lightweight aggregation: only fetch distinct specialties + top conditions ── */
    // Step 1: Get all distinct specialist_type values with counts
    const rawSpecialties = await prisma.medicalCondition.groupBy({
      by: ['specialistType'],
      where: { isActive: true },
      _count: { _all: true },
    });

    // Normalize and merge counts
    rawSpecialties.forEach(r => {
      const canon = normalizeSpecialty(r.specialistType);
      specCountMap[canon] = (specCountMap[canon] || 0) + r._count._all;
    });

    specialties = Object.keys(specCountMap).sort();

    // Step 2: For each specialty, fetch top 12 curated conditions (with description first)
    // We batch this to avoid N+1 — get raw specialist types per normalized specialty
    const rawSpecMap: Record<string, string[]> = {};
    rawSpecialties.forEach(r => {
      const canon = normalizeSpecialty(r.specialistType);
      if (!rawSpecMap[canon]) rawSpecMap[canon] = [];
      rawSpecMap[canon].push(r.specialistType);
    });

    // Fetch top conditions for each specialty (limited, not all 70k)
    const seenNames = new Set<string>();

    await Promise.all(
      specialties.map(async (specName) => {
        const rawTypes = rawSpecMap[specName] || [];
        const conditions = await prisma.medicalCondition.findMany({
          where: {
            isActive: true,
            specialistType: { in: rawTypes },
          },
          select: { slug: true, commonName: true, specialistType: true, description: true },
          orderBy: [{ description: 'asc' }, { commonName: 'asc' }],
          take: 30, // Fetch extra to allow for dedup, we'll trim to 12
        });

        // Deduplicate by commonName
        const deduped = conditions.filter(c => {
          const key = c.commonName.toLowerCase().trim();
          if (seenNames.has(key)) return false;
          seenNames.add(key);
          return true;
        });

        // Curated first (with description), then others
        const curated = deduped.filter(c => c.description && c.description.length > 0);
        const others = deduped.filter(c => !c.description || c.description.length === 0);
        grouped[specName] = [...curated, ...others].slice(0, 12);
      })
    );
  } catch (err) {
    // DB not available in local dev — page will still render with empty specialties
    console.warn('[page.tsx] Database unavailable, rendering without specialties:', (err as Error).message);
  }


  // Homepage structured data for AI/Voice/Search
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://aihealz.com/#webpage',
    url: 'https://aihealz.com',
    name: 'AIHealz — AI-Powered Medical Directory',
    description: 'Find verified doctors, understand medical conditions, and get AI-powered report analysis. Trusted by millions across the globe.',
    isPartOf: { '@id': 'https://aihealz.com/#website' },
    about: {
      '@type': 'MedicalBusiness',
      name: 'AIHealz Healthcare Platform',
      description: 'Global healthcare directory with 70,000+ conditions, 8,900+ treatments, and AI-powered health tools.',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-description', '.feature-cards'],
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Medical Specialties',
      numberOfItems: specialties.length,
      itemListElement: specialties.slice(0, 10).map((spec, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'MedicalSpecialty',
          name: spec,
          url: `https://aihealz.com/conditions?specialty=${encodeURIComponent(spec)}`,
        },
      })),
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AIHealz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AIHealz is an AI-powered healthcare platform that helps you find verified doctors, understand medical conditions, get treatment cost estimates, and analyze medical reports using artificial intelligence.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many medical conditions does AIHealz cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AIHealz covers over 70,000 medical conditions organized by 20+ medical specialties, with detailed information about symptoms, treatments, and specialist recommendations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I get an AI second opinion on AIHealz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, AIHealz provides AI-powered analysis of medical reports, lab results, and imaging studies. Upload your documents securely for an instant, plain-English breakdown.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find a specialist doctor on AIHealz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use our search to find verified specialists by condition, specialty, or location. View doctor profiles with qualifications, patient reviews, and consultation fees.',
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <Script
        id="homepage-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen bg-[#050B14] text-slate-300 font-sans selection:bg-teal-500/30 pb-20">

      {/* ── Navbar Spacer & Top Gradient ── */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden border-b border-white/5">
        {/* Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {/* Location Indicator */}
          {countryName && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-white/10 mb-6">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-slate-300">
                {cityDisplay ? `${cityDisplay}, ${countryName}` : countryName}
              </span>
              <Link href="/settings/location" className="text-xs text-slate-500 hover:text-white transition-colors">Change</Link>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Find the right care, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">faster.</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Search 70,000+ conditions, compare treatment costs across 7 countries, and get AI-powered second opinions on your medical reports.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-1">
              <SearchAutocomplete variant="dark" placeholder="Search conditions, treatments, symptoms..." />
            </div>

            {/* Quick Links */}
            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              <span className="text-slate-600">Popular:</span>
              <Link href={`/${geo.countrySlug || 'india'}/${geo.lang}/hair-loss/cost`} className="text-slate-400 hover:text-teal-400 transition-colors">Hair Transplant Cost</Link>
              <Link href={`/${geo.countrySlug || 'india'}/${geo.lang}/knee-osteoarthritis/cost`} className="text-slate-400 hover:text-teal-400 transition-colors">Knee Replacement</Link>
              <Link href="/treatments" className="text-slate-400 hover:text-teal-400 transition-colors">Browse Treatments</Link>
              <Link href="/analyze" className="text-teal-400 font-medium hover:text-teal-300 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Analyze Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Action Cards ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/doctors"
            className="group bg-slate-900/50 border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 flex flex-col gap-4 hover:bg-slate-800/60 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Find Specialists</h3>
              <p className="text-sm text-slate-500">Browse verified doctors by specialty and location.</p>
            </div>
            <div className="mt-auto flex items-center text-sm text-slate-500 group-hover:text-white transition-colors">
              Browse doctors
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </Link>

          <Link
            href="/analyze"
            className="group bg-slate-900/50 border border-white/5 hover:border-teal-500/30 rounded-2xl p-6 flex flex-col gap-4 hover:bg-slate-800/60 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">AI Report Analysis</h3>
              <p className="text-sm text-slate-500">Upload scans or blood work for instant breakdown.</p>
            </div>
            <div className="mt-auto flex items-center text-sm text-slate-500 group-hover:text-white transition-colors">
              Upload report
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </Link>

          <Link
            href="/treatments"
            className="group bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 flex flex-col gap-4 hover:bg-slate-800/60 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Treatment Costs</h3>
              <p className="text-sm text-slate-500">Compare surgery costs across 7 countries.</p>
            </div>
            <div className="mt-auto flex items-center text-sm text-slate-500 group-hover:text-white transition-colors">
              Compare costs
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Browse by Medical Specialty ── */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Browse by Specialty</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Explore 70,000+ conditions across {specialties.length} medical specialties.
            </p>
          </div>

          <HomepageSpecialties
            specialties={specialties}
            grouped={grouped}
            counts={specCountMap}
            icons={SPECIALTY_ICON_MAP}
            country={geo.countrySlug || 'india'}
            lang={geo.lang}
          />
        </div>
      </section>

      {/* ── Medical Travel Banner ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Planning surgery abroad?
              </h2>
              <p className="text-slate-400 max-w-lg">
                Get a free, detailed cost estimate for your treatment including hospital stay and travel logistics.
              </p>
            </div>
          </div>

          <Link href="/medical-travel/bot" className="shrink-0 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center gap-2">
            Get Free Estimate
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
