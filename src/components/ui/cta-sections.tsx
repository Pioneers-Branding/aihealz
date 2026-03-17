'use client';

import Link from 'next/link';

/**
 * Reusable CTA Components for consistent call-to-action sections across the site
 */

// ═══════════════════════════════════════════════════════════════════════════════
// AI DIAGNOSIS CTA - Promotes symptom checker
// ═══════════════════════════════════════════════════════════════════════════════

export function AIDiagnosisCTA({
  title = "Not sure what's wrong?",
  subtitle = "Our AI can help identify potential conditions based on your symptoms",
  variant = 'default'
}: {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'inline';
}) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white text-sm">{title}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <Link
          href="/symptoms"
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          Try AI Diagnosis
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href="/symptoms"
        className="group flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-cyan-400 group-hover:text-cyan-300">Get AI Diagnosis</span>
        <svg className="w-4 h-4 text-cyan-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400 mb-4">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/symptoms"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start AI Diagnosis
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
            >
              Upload Medical Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOK APPOINTMENT CTA - For doctor/hospital pages
// ═══════════════════════════════════════════════════════════════════════════════

export function BookAppointmentCTA({
  doctorName,
  specialty,
  href = '/book',
  variant = 'default'
}: {
  doctorName?: string;
  specialty?: string;
  href?: string;
  variant?: 'default' | 'floating' | 'card';
}) {
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href={href}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book Appointment
        </Link>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-6 border border-emerald-500/20">
        <h3 className="text-lg font-bold text-white mb-2">Ready to Book?</h3>
        <p className="text-sm text-slate-400 mb-4">
          {doctorName
            ? `Schedule your consultation with ${doctorName} today.`
            : 'Find available slots and book your appointment online.'}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors w-full justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book Now
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors text-sm"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Book Appointment
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIND DOCTOR CTA - Generic doctor finding CTA
// ═══════════════════════════════════════════════════════════════════════════════

export function FindDoctorCTA({
  specialty,
  condition,
  location,
  variant = 'default'
}: {
  specialty?: string;
  condition?: string;
  location?: string;
  variant?: 'default' | 'banner' | 'sidebar';
}) {
  const href = specialty
    ? `/doctors/specialty/${specialty.toLowerCase().replace(/\s+/g, '-')}`
    : '/doctors';

  const title = specialty
    ? `Find ${specialty} Specialists`
    : condition
      ? `Find Doctors for ${condition}`
      : 'Find the Right Doctor';

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">
              {location
                ? `Top-rated specialists in ${location} with verified reviews`
                : 'Browse verified specialists with patient reviews and ratings'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={href}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Doctors
            </Link>
            <Link
              href="/symptoms"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors whitespace-nowrap"
            >
              Get Recommendation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{title}</p>
            <p className="text-xs text-slate-400">Verified specialists</p>
          </div>
        </div>
        <Link
          href={href}
          className="block w-full text-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Browse Doctors
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-medium rounded-lg transition-colors text-sm border border-purple-500/30"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      {title}
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEDICAL TRAVEL CTA - For cost comparison/medical tourism
// ═══════════════════════════════════════════════════════════════════════════════

export function MedicalTravelCTA({
  treatment,
  variant = 'default'
}: {
  treatment?: string;
  variant?: 'default' | 'mini' | 'full';
}) {
  if (variant === 'mini') {
    return (
      <Link
        href="/medical-travel/bot"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium rounded-lg transition-colors text-xs border border-amber-500/20"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Compare Prices
      </Link>
    );
  }

  if (variant === 'full') {
    return (
      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-8 border border-amber-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                Save up to 90%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {treatment ? `Get ${treatment} Abroad` : 'Medical Travel Made Easy'}
            </h3>
            <p className="text-slate-400 mb-4">
              Compare treatment costs across top medical tourism destinations. Get personalized quotes from JCI-accredited hospitals.
            </p>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free cost estimates from verified hospitals
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Visa assistance & travel planning
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Post-treatment follow-up support
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 lg:w-64">
            <Link
              href="/medical-travel/bot"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Free Quote
            </Link>
            <Link
              href="/medical-travel"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/medical-travel/bot"
      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
      Compare International Prices
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOK TEST CTA - For diagnostic tests
// ═══════════════════════════════════════════════════════════════════════════════

export function BookTestCTA({
  testName,
  testSlug,
  variant = 'default'
}: {
  testName?: string;
  testSlug?: string;
  variant?: 'default' | 'card' | 'inline';
}) {
  const href = testSlug ? `/tests/${testSlug}/book` : '/diagnostic-labs';

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 rounded-2xl p-6 border border-teal-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              {testName ? `Book ${testName}` : 'Book Lab Tests'}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Home sample collection available. Get results in 24-48 hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={href}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Book Now
              </Link>
              <Link
                href="/diagnostic-labs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-colors text-sm"
              >
                Find Labs Near Me
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-3 bg-teal-500/10 rounded-lg border border-teal-500/20">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-sm text-teal-300">Home collection available</span>
        </div>
        <Link
          href={href}
          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Book Test
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors text-sm"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
      {testName ? `Book ${testName}` : 'Book Lab Test'}
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS BAR - Sticky/floating action bar
// ═══════════════════════════════════════════════════════════════════════════════

export function QuickActionsBar({
  actions = ['diagnosis', 'doctors', 'tests', 'travel'],
  variant = 'default'
}: {
  actions?: ('diagnosis' | 'doctors' | 'tests' | 'travel' | 'appointment')[];
  variant?: 'default' | 'sticky';
}) {
  const actionConfig = {
    diagnosis: { label: 'AI Diagnosis', href: '/symptoms', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'cyan' },
    doctors: { label: 'Find Doctors', href: '/doctors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'purple' },
    tests: { label: 'Book Tests', href: '/tests', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'teal' },
    travel: { label: 'Medical Travel', href: '/medical-travel/bot', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064', color: 'amber' },
    appointment: { label: 'Book Now', href: '/book', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'emerald' },
  };

  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20',
    teal: 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20',
  };

  const content = (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {actions.map((action) => {
        const config = actionConfig[action];
        return (
          <Link
            key={action}
            href={config.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${colorClasses[config.color]}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
            </svg>
            {config.label}
          </Link>
        );
      })}
    </div>
  );

  if (variant === 'sticky') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#050B14]/95 backdrop-blur-xl border-t border-white/10 py-3 px-4">
        {content}
      </div>
    );
  }

  return (
    <div className="py-4">
      {content}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEXT STEPS CTA - After completing an action
// ═══════════════════════════════════════════════════════════════════════════════

export function NextStepsCTA({
  currentStep,
  steps
}: {
  currentStep: string;
  steps: Array<{ label: string; href: string; description: string; icon?: string }>;
}) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Next Steps
      </h3>
      <div className="grid gap-3">
        {steps.map((step, index) => (
          <Link
            key={index}
            href={step.href}
            className="group flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold group-hover:bg-emerald-500/30 transition-colors">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{step.label}</p>
              <p className="text-sm text-slate-400">{step.description}</p>
            </div>
            <svg className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMERGENCY CTA - For urgent situations
// ═══════════════════════════════════════════════════════════════════════════════

export function EmergencyCTA() {
  return (
    <div className="bg-gradient-to-r from-red-900/40 to-rose-900/40 rounded-xl p-4 border border-red-500/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-red-300 text-sm">Medical Emergency?</p>
          <p className="text-xs text-red-400/80">Call emergency services immediately</p>
        </div>
        <a
          href="tel:112"
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Call 112
        </a>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSULTATION CTA - WhatsApp/Chat consultation
// ═══════════════════════════════════════════════════════════════════════════════

export function ConsultationCTA({
  variant = 'default'
}: {
  variant?: 'default' | 'whatsapp' | 'chat';
}) {
  if (variant === 'whatsapp') {
    return (
      <a
        href="https://wa.me/919876543210?text=Hi,%20I%20need%20medical%20consultation"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp Consult
      </a>
    );
  }

  if (variant === 'chat') {
    return (
      <Link
        href="/chat"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Chat with Doctor
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      <ConsultationCTA variant="whatsapp" />
      <ConsultationCTA variant="chat" />
    </div>
  );
}
