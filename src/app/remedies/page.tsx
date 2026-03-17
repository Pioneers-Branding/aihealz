import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Remedies & OTC Guides | aihealz',
    description: 'Evidence-based home remedies, OTC guidelines, and natural treatments for common health conditions, powered by AI analysis.',
};

const OTC_GUIDES = [
    {
        condition: 'Mild Fever / Body Ache',
        safeToTreat: true,
        tips: [
            'Stay extremely well hydrated (water, broths, electrolyte solutions).',
            'Rest in a cool room and wear light clothing.',
            'Use a lukewarm sponge bath if fever is uncomfortable.'
        ],
        medicines: [
            { name: 'Paracetamol (Acetaminophen)', dosage: '500mg - 650mg every 6-8 hours as needed.', warning: 'Max 4000mg/day. Avoid alcohol.' },
            { name: 'Ibuprofen', dosage: '400mg every 6-8 hours with food.', warning: 'Avoid if you have a history of stomach ulcers.' }
        ],
        whenToSeeDoctor: 'Fever above 103°F (39.4°C), lasts more than 3 days, accompanied by severe headache, stiff neck, or chest pain.'
    },
    {
        condition: 'Common Cold & Congestion',
        safeToTreat: true,
        tips: [
            'Inhale steam from a bowl of hot water or use a humidifier.',
            'Gargle with warm salt water 3-4 times a day for a sore throat.',
            'Use saline nasal drops/spray to clear blockages naturally.'
        ],
        medicines: [
            { name: 'Cetirizine / Loratadine', dosage: '10mg once daily.', warning: 'May cause mild drowsiness (Cetirizine).' },
            { name: 'Xylometazoline Nasal Drops', dosage: '1-2 drops per nostril, twice daily.', warning: 'Do not use for more than 5-7 consecutive days (rebound congestion).' }
        ],
        whenToSeeDoctor: 'Symptoms last >10 days, green/yellow phlegm with high fever, or severe shortness of breath.'
    },
    {
        condition: 'Acid Reflux / Mild Heartburn',
        safeToTreat: true,
        tips: [
            'Avoid lying down for at least 2-3 hours after eating.',
            'Elevate the head of your bed by 6-8 inches.',
            'Avoid trigger foods: spicy, fried, citrus, caffeine, and alcohol.'
        ],
        medicines: [
            { name: 'Calcium Carbonate Antacids', dosage: '1-2 tablets chewed as symptoms occur.', warning: 'Do not exceed maximum daily dose on label.' },
            { name: 'Pantoprazole / Omeprazole', dosage: '20mg - 40mg once daily before breakfast.', warning: 'For short-term use (up to 14 days) unless prescribed.' }
        ],
        whenToSeeDoctor: 'Difficulty swallowing, black/tarry stools, unexplained weight loss, or severe chest pain (which could mimic a heart attack).'
    },
    {
        condition: 'Mild Acute Diarrhea',
        safeToTreat: true,
        tips: [
            'Focus completely on fluid replacement (ORS - Oral Rehydration Salts).',
            'Eat a bland BRAT diet: Bananas, Rice, Applesauce, Toast.',
            'Avoid dairy, caffeine, and very greasy or sweet foods.'
        ],
        medicines: [
            { name: 'Loperamide', dosage: '4mg initially, then 2mg after each loose stool.', warning: 'Max 8mg/day (OTC). Do not use if fever or bloody stools are present.' },
            { name: 'Probiotic Supplements', dosage: 'Saccharomyces boulardii or Lactobacillus capsules daily.', warning: 'Safe for general gut health support.' }
        ],
        whenToSeeDoctor: 'Lasts more than 2 days in adults, severe dehydration (dry mouth, no urination), high fever, or bloody/black stools.'
    }
];

const REMEDY_CATEGORIES = [
    {
        name: 'Digestive Health',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        items: [
            { name: 'Bloating & Gas', remedies: 'Peppermint oil, Chamomile tea, Probiotics, Fennel seeds' },
            { name: 'Constipation', remedies: 'Psyllium husk, Prune juice, Magnesium citrate, Hydration' },
            { name: 'Nausea', remedies: 'Ginger root, Vitamin B6, Acupressure wristbands' }
        ]
    },
    {
        name: 'Skin & Dermatology',
        icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5',
        items: [
            { name: 'Acne & Blemishes', remedies: 'Tea tree oil, Salicylic acid (Willow bark), Green tea extract' },
            { name: 'Dry Skin / Eczema', remedies: 'Colloidal oatmeal bath, Coconut oil, Ceramide creams' },
            { name: 'Minor Burns', remedies: 'Cool water running, Honey dressing, Calendula ointment' }
        ]
    },
    {
        name: 'Pain & Stress',
        icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        items: [
            { name: 'Headaches (Tension)', remedies: 'Peppermint oil on temples, Magnesium, Hydration' },
            { name: 'Muscle Aches', remedies: 'Epsom salt baths, Arnica gel, Heat/Ice therapy' },
            { name: 'Insomnia', remedies: 'Melatonin, Valerian root, Tart cherry juice, Sleep hygiene' }
        ]
    }
];

export default function RemediesPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6 mt-10">

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-teal-50 border border-teal-100 mb-8 max-w-fit mx-auto">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-teal-800 tracking-wide uppercase">AI-Curated Pharmacy & Care</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                            Safe OTC Medicines
                        </span> & Home Care
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Evidence-based over-the-counter (OTC) medication guides and natural home remedies for minor, safe-to-treat conditions.
                    </p>
                </div>

                {/* ── HIGH PRIORITY MEDICAL DISCLAIMER ── */}
                <div className="mb-16 p-6 md:p-8 bg-rose-50 border-2 border-rose-200 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-600 shrink-0 border border-rose-100">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-rose-900 mb-2">Important Medical Disclaimer</h2>
                            <p className="text-rose-800/80 leading-relaxed">
                                The information provided here is strictly for <strong>educational and informational purposes</strong> regarding minor health issues. It is <strong>NOT a substitute for professional medical advice, diagnosis, or treatment</strong>. Always read medication labels carefully, check for allergies, and consult a qualified healthcare provider if your symptoms are severe, persistent, or worsening. Always consult a pediatrician before giving OTC medications to children.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── OTC MEDICATIONS SECTION ── */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Safe to Treat at Home: OTC Guides
                    </h2>
                    <div className="grid lg:grid-cols-2 gap-8">
                        {OTC_GUIDES.map((guide, idx) => (
                            <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">{guide.condition}</h3>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-200">
                                        Safe to self-treat
                                    </span>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Actionable Tips */}
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-3">General Tips</h4>
                                        <ul className="space-y-2">
                                            {guide.tips.map((tip, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-slate-700">
                                                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Medicines */}
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-3">Suggested OTC Medicines</h4>
                                        <div className="space-y-3">
                                            {guide.medicines.map((med, i) => (
                                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                                    <div className="font-bold text-slate-900 mb-1">{med.name}</div>
                                                    <div className="text-sm text-slate-600 mb-2"><span className="font-medium text-slate-500">Dosage:</span> {med.dosage}</div>
                                                    <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-xl flex gap-2 items-start mt-3">
                                                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                        {med.warning}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <h4 className="text-sm font-extrabold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            When to see a Doctor
                                        </h4>
                                        <p className="text-sm text-rose-800 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                                            {guide.whenToSeeDoctor}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── HOME REMEDIES SECTION ── */}
                <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Natural Relief & Lifestyle Interventions
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {REMEDY_CATEGORIES.map((category) => (
                        <div key={category.name} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-teal-50 rounded-xl">
                                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={category.icon} />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
                            </div>

                            <div className="space-y-4">
                                {category.items.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors">
                                        <h3 className="font-semibold text-slate-800 mb-2 flex justify-between items-center">
                                            {item.name}
                                            <Link href={`/symptoms`} className="text-teal-600 hover:text-teal-700">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </Link>
                                        </h3>
                                        <div className="flex gap-2">
                                            <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <p className="text-sm text-slate-600 leading-relaxed">{item.remedies}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}
