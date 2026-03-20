'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// ─── Static Metadata exported separately via generateMetadata won't work with 'use client'
// This is a client component for the FAQ accordion; metadata is set in a sibling layout or as static exports.

const STATS = [
    { value: '~4,000', label: 'UK cases per year', icon: '🫀' },
    { value: '15–30%', label: 'In-hospital mortality', icon: '⚠️' },
    { value: 'I33.9', label: 'ICD-10 Code', icon: '🔬' },
    { value: '6 weeks', label: 'Typical antibiotic course', icon: '💊' },
];

const ORGANISMS = [
    {
        name: 'Streptococcus viridans',
        type: 'Subacute',
        source: 'Oral flora — dental procedures',
        frequency: '30–40%',
        color: 'blue',
    },
    {
        name: 'Staphylococcus aureus',
        type: 'Acute',
        source: 'Skin, IV lines, catheters, IVDU',
        frequency: '25–35%',
        color: 'red',
    },
    {
        name: 'Staphylococcus epidermidis',
        type: 'Subacute',
        source: 'Prosthetic valves, IV devices',
        frequency: '5–10%',
        color: 'amber',
    },
    {
        name: 'Enterococcus spp.',
        type: 'Subacute',
        source: 'GI / GU tract — urological procedures',
        frequency: '8–12%',
        color: 'purple',
    },
    {
        name: 'HACEK organisms',
        type: 'Subacute',
        source: 'Oral cavity, slow-growing',
        frequency: '3–5%',
        color: 'teal',
    },
    {
        name: 'Candida / Fungi',
        type: 'Acute',
        source: 'Immunosuppressed, IV drug users',
        frequency: '1–2%',
        color: 'pink',
    },
];

const DUKE_CRITERIA = {
    major: [
        {
            title: 'Positive blood cultures',
            detail: 'Two separate blood cultures positive for typical IE organisms (Strep viridans, Staph aureus, Enterococcus, HACEK), OR persistently positive blood cultures over 12 hrs.',
        },
        {
            title: 'Evidence of endocardial involvement',
            detail: 'Echocardiogram showing oscillating intracardiac mass (vegetation), abscess, or new partial dehiscence of prosthetic valve; OR new valvular regurgitation.',
        },
    ],
    minor: [
        { title: 'Predisposing condition', detail: 'IV drug use, known valvular or structural heart disease' },
        { title: 'Fever ≥ 38°C', detail: 'Temperature of 38°C or higher' },
        { title: 'Vascular phenomena', detail: 'Arterial emboli, septic pulmonary infarcts, conjunctival haemorrhages, Janeway lesions' },
        { title: 'Immunological phenomena', detail: 'Osler nodes, Roth spots, positive rheumatoid factor, glomerulonephritis' },
        { title: 'Positive blood culture', detail: 'Not meeting major criteria — single positive or culture of non-typical organism' },
    ],
};

const ANTIBIOTICS = [
    { organism: 'Strep viridans (penicillin-sensitive)', regimen: 'Benzylpenicillin IV × 4 weeks', alt: 'Amoxicillin + Gentamicin × 2 weeks' },
    { organism: 'Staphylococcus aureus (MSSA, native valve)', regimen: 'Flucloxacillin IV × 4–6 weeks', alt: 'Vancomycin if penicillin allergy' },
    { organism: 'MRSA', regimen: 'Vancomycin IV × 6 weeks ± Rifampicin', alt: 'Daptomycin (NICE guidance)' },
    { organism: 'Enterococcus (ampicillin-sensitive)', regimen: 'Amoxicillin + Gentamicin IV × 4–6 weeks', alt: 'Vancomycin + Gentamicin' },
    { organism: 'Prosthetic valve (CoNS)', regimen: 'Vancomycin + Gentamicin + Rifampicin × 6 weeks', alt: 'Per sensitivities' },
    { organism: 'Culture-negative', regimen: 'Amoxicillin + Flucloxacillin + Gentamicin', alt: 'Per NICE NG63 guidance' },
];

const FAQS = [
    {
        q: 'What is acute and subacute endocarditis?',
        a: 'Endocarditis is an infection of the endocardium — the inner lining of the heart, most commonly affecting the heart valves. Acute endocarditis develops rapidly (days to weeks), is usually caused by aggressive bacteria like Staphylococcus aureus, and carries high short-term mortality. Subacute endocarditis (formerly called subacute bacterial endocarditis or SBE) develops slowly over weeks to months, typically caused by less virulent organisms like Streptococcus viridans.',
    },
    {
        q: 'What are the early warning signs of endocarditis?',
        a: 'Early symptoms can be subtle — especially in subacute disease. They include persistent unexplained fever, night sweats, fatigue, unexplained weight loss, new or changed heart murmur, and joint pain. Classical peripheral signs (Osler nodes, Janeway lesions, Roth spots) are actually seen in fewer than 20% of cases today. Anyone with unexplained fever and a prosthetic heart valve, structural heart disease, or history of IV drug use should be evaluated urgently for endocarditis.',
    },
    {
        q: 'How is endocarditis diagnosed in the UK?',
        a: 'Diagnosis is based on the Modified Duke Criteria — a combination of blood culture results and echocardiographic findings. Three sets of blood cultures should be taken from different sites before antibiotics are started. Trans-oesophageal echocardiography (TOE) is more sensitive than transthoracic echo (TTE) and is recommended for all suspected cases. Additional investigations include full blood count, CRP, ESR, renal function, urinalysis, and CT/PET scanning for complications.',
    },
    {
        q: 'What is the treatment for endocarditis?',
        a: 'Treatment requires prolonged intravenous antibiotic therapy — typically 4 to 6 weeks. The exact regimen depends on the causative organism and its antibiotic sensitivities. All patients should be managed by a multidisciplinary "Endocarditis Team" including cardiologists, microbiologists, and cardiac surgeons. Approximately 40–50% of patients ultimately require cardiac surgery to repair or replace a damaged valve, drain an abscess, or control unresponsive infection.',
    },
    {
        q: 'Who is most at risk of developing endocarditis?',
        a: 'High-risk groups include people with prosthetic heart valves or prosthetic material used in valve repair, previous infective endocarditis, complex congenital heart disease (unrepaired cyanotic defects, repaired with residual shunts), and intravenous drug users. Moderate-risk groups include those with acquired valvular disease (e.g. rheumatic heart disease), hypertrophic cardiomyopathy, and mitral valve prolapse with regurgitation.',
    },
    {
        q: 'Does the NHS recommend antibiotic prophylaxis before dental procedures?',
        a: 'Current NICE guidance (CG64, updated 2016) does NOT recommend routine antibiotic prophylaxis before dental procedures for patients at risk of endocarditis. This represented a significant change from previous guidance. However, maintaining excellent oral hygiene is strongly recommended. Antibiotic prophylaxis may still be considered in very high-risk patients at the discretion of their cardiologist.',
    },
    {
        q: 'What complications can endocarditis cause?',
        a: 'Endocarditis can cause severe and life-threatening complications: heart failure from valve destruction (most common), embolic stroke (caused by infected vegetation fragments breaking off and travelling to the brain — occurs in 20–40% of cases), splenic abscess or infarction, renal failure from immune complex glomerulonephritis or emboli, septic metastatic abscesses in the brain, spine, or other organs, and mycotic (infected) aneurysms in cerebral or peripheral arteries.',
    },
    {
        q: 'Can endocarditis be cured without surgery?',
        a: 'Yes, approximately 50–60% of patients are cured with antibiotics alone. Surgery is indicated when medical therapy is failing, when there is severe valve dysfunction causing heart failure, when there is a periannular abscess or intracardiac fistula, when vegetations are very large (>10mm), when there is persistent sepsis despite appropriate antibiotics, or in cases of fungal or highly resistant organism infection. Early surgical consultation is recommended for all patients.',
    },
];

const TOC = [
    { id: 'overview', label: 'What Is Endocarditis?' },
    { id: 'acute-vs-subacute', label: 'Acute vs Subacute' },
    { id: 'causes', label: 'Causative Organisms' },
    { id: 'risk-factors', label: 'Risk Factors' },
    { id: 'symptoms', label: 'Symptoms & Signs' },
    { id: 'diagnosis', label: 'Diagnosis (Duke Criteria)' },
    { id: 'treatment', label: 'Antibiotic Treatment' },
    { id: 'surgery', label: 'When Surgery Is Needed' },
    { id: 'complications', label: 'Complications' },
    { id: 'prevention', label: 'Prevention' },
    { id: 'faq', label: 'FAQs' },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${open ? 'border-indigo-500/40 bg-indigo-950/30' : 'border-white/5 bg-slate-900/50'}`}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start justify-between p-5 text-left gap-4 group"
                aria-expanded={open}
            >
                <div className="flex items-start gap-3">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${open ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'}`}>
                        {index + 1}
                    </span>
                    <span className={`font-semibold text-sm leading-snug transition-colors ${open ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>{q}</span>
                </div>
                <svg
                    className={`w-5 h-5 shrink-0 text-slate-400 mt-0.5 transition-transform duration-300 ${open ? 'rotate-180 text-indigo-400' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="px-5 pb-5 pt-0 pl-[3.75rem]">
                    <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
}

export default function EndocarditisPage() {
    return (
        <>
            {/* Inline JSON-LD schemas */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
                            { '@type': 'ListItem', position: 2, name: 'Conditions', item: 'https://aihealz.com/conditions' },
                            { '@type': 'ListItem', position: 3, name: 'Cardiology', item: 'https://aihealz.com/conditions/cardiology' },
                            { '@type': 'ListItem', position: 4, name: 'Acute & Subacute Endocarditis', item: 'https://aihealz.com/uk/en/acute-and-subacute-endocarditis-unspecified-i339' },
                        ],
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'MedicalWebPage',
                        name: 'Acute and Subacute Endocarditis (Unspecified)',
                        headline: 'Acute & Subacute Endocarditis: Symptoms, Diagnosis & Treatment in the UK',
                        description: 'Comprehensive NHS guide to infective endocarditis (ICD-10 I33.9) — causative organisms, Duke Criteria, antibiotic therapy, surgical indications, and prevention.',
                        url: 'https://aihealz.com/uk/en/acute-and-subacute-endocarditis-unspecified-i339',
                        inLanguage: 'en-GB',
                        about: {
                            '@type': 'MedicalCondition',
                            name: 'Infective Endocarditis',
                            alternateName: ['Bacterial Endocarditis', 'SBE', 'IE'],
                            code: { '@type': 'MedicalCode', codeValue: 'I33.9', codingSystem: 'ICD-10' },
                        },
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: FAQS.map(f => ({
                            '@type': 'Question',
                            name: f.q,
                            acceptedAnswer: { '@type': 'Answer', text: f.a },
                        })),
                    }),
                }}
            />

            <div className="min-h-screen bg-[#060A18] text-slate-300 pt-28 pb-24 relative overflow-hidden">

                {/* ── Background atmosphere ── */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-indigo-950/40 via-[#060A18]/60 to-[#060A18]" />
                    <div className="absolute -top-40 right-0 w-[900px] h-[900px] bg-indigo-600/8 rounded-full blur-[140px]" />
                    <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-violet-600/6 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />
                    {/* Subtle grid lines */}
                    <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                    {/* ── Breadcrumb ── */}
                    <nav className="flex items-center gap-2 text-xs text-slate-600 mb-10 flex-wrap">
                        <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
                        <span className="text-slate-700">/</span>
                        <Link href="/conditions" className="hover:text-slate-300 transition-colors">Conditions</Link>
                        <span className="text-slate-700">/</span>
                        <Link href="/conditions/cardiology" className="hover:text-slate-300 transition-colors">Cardiology</Link>
                        <span className="text-slate-700">/</span>
                        <span className="text-slate-400">Endocarditis</span>
                    </nav>

                    {/* ══════════════════════════════════════════
                        HERO
                    ══════════════════════════════════════════ */}
                    <header className="mb-16">
                        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
                            <div>
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-slate-800/80 border border-white/10 text-indigo-300 px-3 py-1.5 rounded-lg">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                        ICD-10 I33.9
                                    </span>
                                    <span className="text-xs bg-amber-900/30 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg font-semibold">
                                        ⚠ High Severity
                                    </span>
                                    <span className="text-xs bg-blue-900/20 border border-blue-500/15 text-blue-400 px-3 py-1.5 rounded-lg">
                                        Cardiology · Infectious Disease
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                                    Acute &amp; Subacute{' '}
                                    <span className="relative">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
                                            Endocarditis
                                        </span>
                                        <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
                                    </span>
                                </h1>

                                <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-8">
                                    Infective endocarditis (IE) is a life-threatening infection of the heart's inner lining and valves.
                                    It can destroy cardiac structures within days in its acute form, or silently erode valve function
                                    over months in its subacute presentation. Early diagnosis and specialist-led treatment are
                                    critical to survival.
                                </p>

                                {/* Stat cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                                    {STATS.map(s => (
                                        <div key={s.label} className="relative bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl p-4 overflow-hidden group hover:border-indigo-500/20 transition-colors">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="text-2xl mb-1">{s.icon}</div>
                                            <div className="text-xl font-bold text-white leading-none mb-1">{s.value}</div>
                                            <div className="text-[11px] text-slate-500 leading-snug">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/doctors?specialty=Cardiologist&country=uk"
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-900/40 text-sm"
                                    >
                                        Find a Cardiologist in UK
                                    </Link>
                                    <Link
                                        href="/symptoms"
                                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-white/8 transition-all text-sm"
                                    >
                                        Check Your Symptoms
                                    </Link>
                                </div>
                            </div>

                            {/* Hero image panel */}
                            <div className="relative">
                                <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-indigo-950/50">
                                    <Image
                                        src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=85"
                                        alt="Cardiologist performing transoesophageal echocardiography to detect endocarditis vegetations"
                                        width={420}
                                        height={480}
                                        className="w-full object-cover h-72 lg:h-80"
                                        priority
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#060A18] via-transparent to-transparent" />
                                </div>
                                {/* Floating info card */}
                                <div className="absolute -bottom-5 -left-5 bg-slate-900 border border-indigo-500/20 rounded-2xl p-4 shadow-xl max-w-[200px]">
                                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Key Investigation</p>
                                    <p className="text-sm font-bold text-white">Trans-oesophageal Echocardiography (TOE)</p>
                                    <p className="text-[11px] text-indigo-400 mt-1">95% sensitivity for vegetation detection</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* ══════════════════════════════════════════
                        MAIN LAYOUT — Sidebar + Content
                    ══════════════════════════════════════════ */}
                    <div className="grid lg:grid-cols-[260px_1fr] gap-10 items-start">

                        {/* ── Sticky Table of Contents ── */}
                        <aside className="lg:sticky lg:top-24 space-y-4">
                            <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Contents</p>
                                <nav className="space-y-0.5">
                                    {TOC.map(item => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-white py-2 px-3 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-300 transition-all group"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-indigo-400 transition-colors shrink-0" />
                                            {item.label}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            {/* Quick alert */}
                            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 border border-amber-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-amber-400 text-base">⚡</span>
                                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">Urgent Care</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Unexplained fever + heart murmur + risk factors = get to A&amp;E today. Do not wait.
                                </p>
                            </div>

                            {/* Doctor CTA */}
                            <Link
                                href="/doctors?specialty=Cardiologist&country=uk"
                                className="block bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-2xl p-4 transition-all group"
                            >
                                <p className="text-xs text-indigo-400 font-bold mb-1 group-hover:text-indigo-300">🩺 Find a Specialist</p>
                                <p className="text-[11px] text-slate-500">Connect with NHS cardiologists and infectious disease specialists</p>
                            </Link>
                        </aside>

                        {/* ── Article body ── */}
                        <article className="space-y-16 min-w-0">

                            {/* ── 1. OVERVIEW ── */}
                            <section id="overview" className="scroll-mt-28">
                                <SectionHeading icon="🫀" color="indigo" label="What Is Endocarditis?" />
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4 text-slate-300 leading-relaxed">
                                        <p>
                                            The endocardium is the smooth inner lining of the heart's chambers and valves. <strong className="text-white">Infective endocarditis (IE)</strong> occurs when micro-organisms — most commonly bacteria — colonise this surface, typically attaching to a damaged or abnormal valve and forming a destructive, friable mass called a <strong className="text-white">vegetation</strong>.
                                        </p>
                                        <p>
                                            Vegetations are clumps of microorganisms, fibrin, and platelets. They can grow large enough to obstruct valve function, break off and embolise to the brain, kidneys, or spleen, and erode through adjacent cardiac tissue to form abscesses or fistulae.
                                        </p>
                                    </div>
                                    <div className="space-y-4 text-slate-300 leading-relaxed">
                                        <p>
                                            In England and Wales, around <strong className="text-white">4,000–5,000 cases</strong> of IE are diagnosed annually, and the incidence has been rising — partly due to an ageing population with more prosthetic valves and intracardiac devices, and partly due to increased IV drug use. Despite modern treatment, in-hospital mortality remains <strong className="text-white">15–30%</strong>, and long-term outcomes are shaped heavily by complications.
                                        </p>
                                        <p>
                                            The condition is coded as <strong className="text-white">I33.9</strong> in ICD-10 (acute and subacute endocarditis, unspecified) when the specific organism or valve is not documented. NICE guideline NG63 governs management in the NHS.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative rounded-2xl overflow-hidden border border-white/5 h-56">
                                    <Image
                                        src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80"
                                        alt="Echocardiogram screen displaying heart valve with endocarditis vegetation"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#060A18]/80 via-[#060A18]/40 to-transparent" />
                                    <div className="absolute inset-0 flex items-center p-8">
                                        <blockquote className="max-w-sm">
                                            <p className="text-white font-semibold text-base leading-snug mb-2">"Infective endocarditis requires early diagnosis — every hour of delay with an active vegetation increases embolic risk."</p>
                                            <cite className="text-xs text-indigo-400">— British Society for Antimicrobial Chemotherapy (BSAC)</cite>
                                        </blockquote>
                                    </div>
                                </div>
                            </section>

                            {/* ── 2. ACUTE VS SUBACUTE ── */}
                            <section id="acute-vs-subacute" className="scroll-mt-28">
                                <SectionHeading icon="⚖️" color="violet" label="Acute vs Subacute Endocarditis" />
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-xl">🔥</div>
                                            <div>
                                                <h3 className="font-bold text-white text-base">Acute Endocarditis</h3>
                                                <p className="text-xs text-red-400">Days to 2 weeks onset</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            {[
                                                'Typically Staph. aureus (MSSA or MRSA)',
                                                'High fever, rigors, systemic toxicity',
                                                'Rapid valve destruction',
                                                'Higher risk of heart failure and death',
                                                'Often affects previously normal valves',
                                                'IVDU, IV lines, recent healthcare contact',
                                            ].map(item => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span className="text-red-400 mt-0.5 shrink-0">→</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl">🌊</div>
                                            <div>
                                                <h3 className="font-bold text-white text-base">Subacute Endocarditis</h3>
                                                <p className="text-xs text-blue-400">Weeks to months onset</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            {[
                                                'Typically Strep. viridans, Enterococcus, HACEK',
                                                'Low-grade fever, malaise, weight loss',
                                                'Slow progressive valve damage',
                                                'Classical peripheral stigmata more common',
                                                'Usually affects abnormal or diseased valves',
                                                'Dental / GI / GU procedures, prosthetic valves',
                                            ].map(item => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* ── 3. CAUSATIVE ORGANISMS ── */}
                            <section id="causes" className="scroll-mt-28">
                                <SectionHeading icon="🦠" color="teal" label="Causative Organisms" />
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Blood culture identification of the causative organism is central to diagnosis and guides antibiotic choice.
                                    Around 5–10% of cases are culture-negative, often due to prior antibiotic use or fastidious organisms.
                                </p>
                                <div className="relative rounded-2xl overflow-hidden border border-white/5 h-44 mb-6">
                                    <Image
                                        src="https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=1200&q=80"
                                        alt="Blood culture bottles being incubated in microbiology laboratory to identify bacteria causing endocarditis"
                                        fill className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#060A18]/90 to-[#060A18]/40" />
                                    <div className="absolute inset-0 flex items-center px-8">
                                        <p className="text-white font-bold text-base max-w-xs">Three sets of blood cultures from separate sites before starting antibiotics</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {ORGANISMS.map(o => (
                                        <div key={o.name} className={`bg-slate-900/60 border border-${o.color}-500/15 hover:border-${o.color}-500/30 rounded-2xl p-5 transition-all`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <span className={`text-xs px-2 py-1 rounded-lg font-semibold bg-${o.color}-900/30 text-${o.color}-400 border border-${o.color}-500/15`}>
                                                    {o.type}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">{o.frequency}</span>
                                            </div>
                                            <h3 className="font-bold text-white text-sm mb-2 italic">{o.name}</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed">{o.source}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ── 4. RISK FACTORS ── */}
                            <section id="risk-factors" className="scroll-mt-28">
                                <SectionHeading icon="⚠️" color="amber" label="Risk Factors" />
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-400 rounded-full" />
                                            High Risk
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Prosthetic heart valves', icon: '⚙️', detail: 'Mechanical or biological — prosthetic valve endocarditis (PVE) carries ~40% mortality' },
                                                { label: 'Previous infective endocarditis', icon: '🔁', detail: 'Up to 10% relapse rate, especially with poor dentition' },
                                                { label: 'Complex congenital heart disease', icon: '🫀', detail: 'Unrepaired cyanotic defects, surgically created shunts, conduits' },
                                                { label: 'Intravenous drug use (IVDU)', icon: '💉', detail: 'Right-sided IE (tricuspid valve) predominates; Staph aureus in ~70%' },
                                            ].map(({ label, icon, detail }) => (
                                                <div key={label} className="bg-red-950/15 border border-red-500/10 rounded-xl p-4">
                                                    <p className="text-sm font-semibold text-white mb-1">{icon} {label}</p>
                                                    <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-400 rounded-full" />
                                            Moderate Risk
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Acquired valvular disease', icon: '🫁', detail: 'Rheumatic heart disease, calcific aortic stenosis, mitral regurgitation' },
                                                { label: 'Mitral valve prolapse with regurgitation', icon: '🔽', detail: 'Without MR, risk is very low' },
                                                { label: 'Hypertrophic obstructive cardiomyopathy', icon: '📈', detail: 'Turbulent flow increases endocardial exposure' },
                                                { label: 'Intracardiac devices', icon: '📡', detail: 'Pacemakers, ICDs, VADs — device-related IE is increasing' },
                                            ].map(({ label, icon, detail }) => (
                                                <div key={label} className="bg-amber-950/15 border border-amber-500/10 rounded-xl p-4">
                                                    <p className="text-sm font-semibold text-white mb-1">{icon} {label}</p>
                                                    <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── 5. SYMPTOMS ── */}
                            <section id="symptoms" className="scroll-mt-28">
                                <SectionHeading icon="🌡️" color="rose" label="Symptoms & Clinical Signs" />

                                <div className="relative rounded-2xl overflow-hidden border border-white/5 h-52 mb-6">
                                    <Image
                                        src="https://images.unsplash.com/photo-1626542907081-b2dd49ff5a87?w=1200&q=80"
                                        alt="Doctor using stethoscope to auscultate heart murmur in patient presenting with fever — classic endocarditis assessment"
                                        fill className="object-cover object-top"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#060A18]/90 via-[#060A18]/40 to-transparent" />
                                    <div className="absolute bottom-4 left-6 right-6">
                                        <p className="text-white font-semibold text-sm">Classical peripheral signs are present in fewer than 20% of modern IE cases — a high clinical index of suspicion is essential</p>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Constitutional Symptoms</h3>
                                        <div className="space-y-2">
                                            {[
                                                { s: 'Persistent fever (>38°C)', freq: 'Present in ~90%' },
                                                { s: 'Night sweats & rigors', freq: 'Very common' },
                                                { s: 'Unexplained fatigue & malaise', freq: 'Common, insidious' },
                                                { s: 'Weight loss & anorexia', freq: 'Subacute disease' },
                                                { s: 'New or changed heart murmur', freq: 'Present in ~85%' },
                                                { s: 'Shortness of breath', freq: 'Heart failure complication' },
                                            ].map(({ s, freq }) => (
                                                <div key={s} className="flex items-center justify-between bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5">
                                                    <span className="text-sm text-slate-300">{s}</span>
                                                    <span className="text-[11px] text-slate-500 font-mono">{freq}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Classical Peripheral Signs</h3>
                                        <div className="space-y-2">
                                            {[
                                                { s: 'Osler nodes', detail: 'Painful nodules on fingers/toes (immune complex)' },
                                                { s: 'Janeway lesions', detail: 'Painless haemorrhagic macules on palms/soles (embolic)' },
                                                { s: 'Roth spots', detail: 'Retinal haemorrhages with pale centres' },
                                                { s: 'Splinter haemorrhages', detail: 'Linear nail-bed haemorrhages' },
                                                { s: 'Clubbing', detail: 'Late, chronic disease sign' },
                                                { s: 'Splenomegaly', detail: 'Palpable in ~25% of subacute cases' },
                                            ].map(({ s, detail }) => (
                                                <div key={s} className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5">
                                                    <p className="text-sm font-semibold text-indigo-300">{s}</p>
                                                    <p className="text-[11px] text-slate-500 leading-relaxed">{detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── 6. DIAGNOSIS ── */}
                            <section id="diagnosis" className="scroll-mt-28">
                                <SectionHeading icon="🔬" color="blue" label="Diagnosis — Modified Duke Criteria" />
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    The Modified Duke Criteria (2000) remain the standard diagnostic framework. <strong className="text-white">Definite IE</strong> requires 2 major criteria, 1 major + 3 minor, or 5 minor criteria.
                                    <strong className="text-white"> Possible IE</strong> = 1 major + 1 minor, or 3 minor.
                                </p>

                                <div className="grid md:grid-cols-2 gap-5 mb-6">
                                    <div className="bg-gradient-to-br from-blue-950/30 to-slate-900/50 border border-blue-500/20 rounded-2xl p-6">
                                        <h3 className="font-bold text-blue-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black">M</span>
                                            Major Criteria
                                        </h3>
                                        {DUKE_CRITERIA.major.map(c => (
                                            <div key={c.title} className="mb-4 last:mb-0">
                                                <p className="font-semibold text-white text-sm mb-1">✓ {c.title}</p>
                                                <p className="text-xs text-slate-400 leading-relaxed pl-4">{c.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/5 rounded-2xl p-6">
                                        <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <span className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-black">m</span>
                                            Minor Criteria
                                        </h3>
                                        {DUKE_CRITERIA.minor.map(c => (
                                            <div key={c.title} className="mb-3 last:mb-0">
                                                <p className="font-semibold text-slate-300 text-sm">• {c.title}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed pl-3">{c.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-white mb-3">Investigations Checklist (NICE NG63)</h3>
                                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-400">
                                        {[
                                            '3× blood cultures — separate sites, before antibiotics',
                                            'Transthoracic echocardiogram (TTE) — first-line',
                                            'Trans-oesophageal echo (TOE) — if TTE negative or prosthetic valve',
                                            'FBC, CRP, ESR, procalcitonin',
                                            'Renal / liver function, urine dipstick (haematuria)',
                                            'ECG (new AV block = aortic root abscess)',
                                            'CT chest/abdomen/pelvis — embolic complications',
                                            '18F-FDG PET-CT — prosthetic valve / device IE',
                                            'Dental OPG X-ray — identify dental septic focus',
                                            'Ophthalmology referral — Roth spots / fundal emboli',
                                        ].map(item => (
                                            <div key={item} className="flex items-start gap-2">
                                                <span className="text-teal-400 shrink-0 mt-0.5">✓</span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* ── 7. ANTIBIOTIC TREATMENT ── */}
                            <section id="treatment" className="scroll-mt-28">
                                <SectionHeading icon="💊" color="teal" label="Antibiotic Treatment Regimens" />
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    All patients should be managed by a multidisciplinary <strong className="text-white">Endocarditis Team</strong> (cardiologist, microbiologist, cardiac surgeon, specialist nurse). Antibiotic choice is guided by organism identity and sensitivity. The following regimens are based on <strong className="text-white">NICE NG63</strong> and <strong className="text-white">BSAC 2023 guidelines</strong>.
                                </p>

                                <div className="overflow-x-auto rounded-2xl border border-white/5 mb-6">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-800/80">
                                                <th className="text-left p-4 text-slate-300 font-semibold">Organism</th>
                                                <th className="text-left p-4 text-teal-400 font-semibold">First-line Regimen</th>
                                                <th className="text-left p-4 text-blue-400 font-semibold">Alternative</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {ANTIBIOTICS.map((row, i) => (
                                                <tr key={row.organism} className={i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10'}>
                                                    <td className="p-4 font-medium text-slate-300 italic text-[11px]">{row.organism}</td>
                                                    <td className="p-4 text-slate-400">{row.regimen}</td>
                                                    <td className="p-4 text-slate-500">{row.alt}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[11px] text-slate-600 italic">* All regimens are IV. Duration 4–6 weeks (longer for prosthetic valve IE). Aminoglycoside monitoring required. Consult microbiologist for culture-negative IE.</p>
                            </section>

                            {/* ── 8. SURGERY ── */}
                            <section id="surgery" className="scroll-mt-28">
                                <SectionHeading icon="🏥" color="purple" label="When Surgery Is Needed" />

                                <div className="relative rounded-2xl overflow-hidden border border-white/5 h-48 mb-6">
                                    <Image
                                        src="https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=1200&q=80"
                                        alt="Cardiac surgery team performing open heart valve repair for infective endocarditis"
                                        fill className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#060A18]/85 to-[#060A18]/30" />
                                    <div className="absolute inset-0 flex items-center px-8">
                                        <div>
                                            <p className="text-white font-bold text-lg mb-1">~40–50% of IE patients require cardiac surgery</p>
                                            <p className="text-slate-400 text-sm">Early surgical consultation is recommended for all cases</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    {[
                                        {
                                            urgency: 'Emergency', timing: 'Same day', color: 'red',
                                            indications: ['Pulmonary oedema / cardiogenic shock from acute severe AR or MR', 'Septic shock from uncontrolled infection', 'Large valve perforation'],
                                        },
                                        {
                                            urgency: 'Urgent', timing: 'Within 72 hours', color: 'amber',
                                            indications: ['Periannular abscess or fistula', 'Persistent sepsis after 5–7 days of appropriate antibiotics', 'Vegetation >10 mm with embolic event', 'New heart block (implies abscess)'],
                                        },
                                        {
                                            urgency: 'Elective', timing: 'Within 1–2 weeks', color: 'teal',
                                            indications: ['Vegetation >15 mm on mitral valve', 'Fungal IE (very high recurrence)', 'MRSA prosthetic valve IE', 'Large recurrent emboli despite antibiotics'],
                                        },
                                    ].map(({ urgency, timing, color, indications }) => (
                                        <div key={urgency} className={`bg-${color}-950/15 border border-${color}-500/20 rounded-2xl p-5`}>
                                            <div className={`inline-flex items-center gap-1.5 text-xs font-bold text-${color}-400 bg-${color}-900/20 px-3 py-1 rounded-lg mb-3`}>
                                                <span className={`w-1.5 h-1.5 bg-${color}-400 rounded-full`} />
                                                {urgency} — {timing}
                                            </div>
                                            <ul className="space-y-2">
                                                {indications.map(ind => (
                                                    <li key={ind} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                                                        <span className={`text-${color}-400 shrink-0 mt-0.5`}>·</span>
                                                        {ind}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ── 9. COMPLICATIONS ── */}
                            <section id="complications" className="scroll-mt-28">
                                <SectionHeading icon="🧠" color="rose" label="Complications" />
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { title: 'Embolic Stroke', stat: '20–40%', desc: 'Infected vegetation fragments embolise to the cerebral circulation — most feared and most common major complication.', color: 'red' },
                                        { title: 'Heart Failure', stat: '#1 cause of death', desc: 'Acute severe regurgitation from leaflet perforation or chordal rupture overwhelms ventricular compensation.', color: 'orange' },
                                        { title: 'Periannular Abscess', stat: '10–40%', desc: 'Extension of infection beyond the valve ring — may cause AV block, fistulae, or pericarditis. Surgical emergency.', color: 'amber' },
                                        { title: 'Renal Failure', stat: 'Common', desc: 'Immune complex glomerulonephritis or renal emboli — may require dialysis. Aminoglycosides add nephrotoxicity risk.', color: 'purple' },
                                        { title: 'Splenic Abscess', stat: '3–5%', desc: 'Presents as persistent fever despite appropriate antibiotics. CT-guided drainage or splenectomy required.', color: 'blue' },
                                        { title: 'Mycotic Aneurysm', stat: '2–5%', desc: 'Infected emboli lodge in arterial walls — cerebral mycotic aneurysms risk catastrophic haemorrhagic stroke.', color: 'teal' },
                                    ].map(({ title, stat, desc, color }) => (
                                        <div key={title} className="bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all">
                                            <div className={`text-xs font-bold text-${color}-400 mb-2`}>{stat}</div>
                                            <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* ── 10. PREVENTION ── */}
                            <section id="prevention" className="scroll-mt-28">
                                <SectionHeading icon="🛡️" color="green" label="Prevention" />

                                <div className="relative rounded-2xl overflow-hidden border border-white/5 h-44 mb-6">
                                    <Image
                                        src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80"
                                        alt="Dental examination and oral hygiene — the most important preventive measure against infective endocarditis in at-risk patients"
                                        fill className="object-cover object-center"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#060A18]/90 to-[#060A18]/30" />
                                    <div className="absolute inset-0 flex items-center px-8">
                                        <p className="text-white font-semibold text-base max-w-sm">
                                            Excellent oral hygiene is the most effective strategy for preventing IE in at-risk patients
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="bg-green-950/15 border border-green-500/15 rounded-2xl p-5">
                                        <h3 className="font-bold text-green-300 text-sm mb-4 uppercase tracking-wide">NICE Recommends ✓</h3>
                                        <ul className="space-y-3 text-sm text-slate-400">
                                            {[
                                                'Excellent oral and dental hygiene — regular check-ups',
                                                'Prompt treatment of any skin infections, dental infections, or urinary tract infections',
                                                'Use of sterile technique for all venous access and injections',
                                                'Informing all future healthcare providers about cardiac risk status',
                                                'Carrying an IE patient alert card (available from BHF)',
                                                'Avoiding body piercing and tattooing if high cardiac risk',
                                            ].map(item => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-red-950/15 border border-red-500/15 rounded-2xl p-5">
                                        <h3 className="font-bold text-red-300 text-sm mb-4 uppercase tracking-wide">NICE Does NOT Recommend ✗</h3>
                                        <ul className="space-y-3 text-sm text-slate-400">
                                            {[
                                                'Routine antibiotic prophylaxis before dental procedures (changed in 2008)',
                                                'Prophylaxis before upper / lower GI endoscopy',
                                                'Prophylaxis before bronchoscopy',
                                                'Prophylaxis before genitourinary procedures (unless infection already present)',
                                                'Prophylaxis before cardiac catheterisation',
                                            ].map(item => (
                                                <li key={item} className="flex items-start gap-2">
                                                    <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4 bg-amber-900/20 border border-amber-500/15 rounded-xl p-3">
                                            <p className="text-xs text-amber-300 leading-relaxed">
                                                <strong>Note:</strong> Some cardiologists exercise clinical judgement for very high-risk patients (e.g. prior IE, cyanotic CHD) — discuss with your cardiology team.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── 11. FAQ ── */}
                            <section id="faq" className="scroll-mt-28">
                                <SectionHeading icon="💬" color="indigo" label="Frequently Asked Questions" />
                                <div className="space-y-3">
                                    {FAQS.map((faq, i) => (
                                        <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
                                    ))}
                                </div>
                            </section>

                            {/* Disclaimer */}
                            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 text-xs text-slate-600 leading-relaxed">
                                <strong className="text-slate-500">Medical Disclaimer:</strong> This page is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. All content is based on NHS and NICE guidelines current as of 2024–2025. Always consult a qualified healthcare professional. For emergencies, call 999 or attend your nearest A&amp;E.
                            </div>
                        </article>
                    </div>

                    {/* ── Related cards ── */}
                    <aside className="mt-16 grid md:grid-cols-3 gap-5">
                        <Link href="/conditions/cardiology" className="group bg-slate-900/50 border border-white/5 hover:border-indigo-500/25 rounded-2xl p-6 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 text-xl">🫀</div>
                            <h3 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors text-sm">All Cardiology Conditions</h3>
                            <p className="text-xs text-slate-500">Browse heart & vascular conditions A-Z →</p>
                        </Link>
                        <Link href="/doctors?specialty=Cardiologist&country=uk" className="group bg-slate-900/50 border border-white/5 hover:border-teal-500/25 rounded-2xl p-6 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mb-3 text-xl">🩺</div>
                            <h3 className="font-bold text-white mb-1 group-hover:text-teal-400 transition-colors text-sm">Find a Cardiologist (UK)</h3>
                            <p className="text-xs text-slate-500">Connect with verified NHS specialists →</p>
                        </Link>
                        <Link href="/tools/heart-risk-calculator" className="group bg-slate-900/50 border border-white/5 hover:border-violet-500/25 rounded-2xl p-6 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3 text-xl">📊</div>
                            <h3 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors text-sm">Heart Risk Calculator</h3>
                            <p className="text-xs text-slate-500">Assess your cardiovascular risk →</p>
                        </Link>
                    </aside>

                    <div className="mt-10 text-center">
                        <Link href="/conditions/cardiology" className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-400 font-semibold transition-colors text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Cardiology Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Reusable section heading component ──
function SectionHeading({ icon, label, color }: { icon: string; label: string; color: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-2xl bg-${color}-500/10 border border-${color}-500/15 flex items-center justify-center text-lg shrink-0`}>
                {icon}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{label}</h2>
            <div className={`flex-1 h-px bg-gradient-to-r from-${color}-500/20 to-transparent`} />
        </div>
    );
}
