import prisma from '@/lib/db';
import Link from 'next/link';
import Script from 'next/script';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

type PageParams = Promise<{ specialty: string }>;

// Specialty descriptions for SEO
const SPECIALTY_INFO: Record<string, { description: string; specialist: string; bodySystem: string }> = {
    cardiology: { description: 'heart and cardiovascular system disorders including heart disease, arrhythmias, and vascular conditions', specialist: 'Cardiologist', bodySystem: 'Heart & Blood Vessels' },
    neurology: { description: 'brain, spinal cord, and nervous system conditions including stroke, epilepsy, and neurological disorders', specialist: 'Neurologist', bodySystem: 'Brain & Nervous System' },
    orthopedics: { description: 'bone, joint, muscle, and skeletal system conditions including fractures, arthritis, and sports injuries', specialist: 'Orthopedic Surgeon', bodySystem: 'Bones & Joints' },
    dermatology: { description: 'skin, hair, and nail conditions including eczema, psoriasis, and skin infections', specialist: 'Dermatologist', bodySystem: 'Skin & Hair' },
    gastroenterology: { description: 'digestive system disorders including GERD, IBD, liver disease, and gastrointestinal conditions', specialist: 'Gastroenterologist', bodySystem: 'Digestive System' },
    oncology: { description: 'cancer and tumor conditions across all body systems including diagnosis and treatment', specialist: 'Oncologist', bodySystem: 'Various' },
    pulmonology: { description: 'lung and respiratory system conditions including asthma, COPD, and pulmonary diseases', specialist: 'Pulmonologist', bodySystem: 'Lungs & Airways' },
    endocrinology: { description: 'hormone and metabolic disorders including diabetes, thyroid conditions, and hormonal imbalances', specialist: 'Endocrinologist', bodySystem: 'Hormones & Metabolism' },
    psychiatry: { description: 'mental health conditions including depression, anxiety, bipolar disorder, and psychiatric disorders', specialist: 'Psychiatrist', bodySystem: 'Mental Health' },
    ophthalmology: { description: 'eye and vision conditions including cataracts, glaucoma, and eye diseases', specialist: 'Ophthalmologist', bodySystem: 'Eyes & Vision' },
    urology: { description: 'urinary tract and male reproductive system conditions including kidney stones and prostate issues', specialist: 'Urologist', bodySystem: 'Urinary System' },
    gynecology: { description: 'female reproductive system conditions including PCOS, endometriosis, and gynecological disorders', specialist: 'Gynecologist', bodySystem: 'Female Reproductive System' },
    rheumatology: { description: 'autoimmune and joint conditions including rheumatoid arthritis, lupus, and inflammatory diseases', specialist: 'Rheumatologist', bodySystem: 'Joints & Immune System' },
    nephrology: { description: 'kidney and renal system conditions including chronic kidney disease and dialysis care', specialist: 'Nephrologist', bodySystem: 'Kidneys' },
    hematology: { description: 'blood disorders including anemia, leukemia, and blood clotting conditions', specialist: 'Hematologist', bodySystem: 'Blood & Lymph' },
    ent: { description: 'ear, nose, and throat conditions including hearing loss, sinusitis, and ENT disorders', specialist: 'ENT Specialist', bodySystem: 'Ear, Nose & Throat' },
    infectious: { description: 'infectious diseases including viral, bacterial, and parasitic infections', specialist: 'Infectious Disease Specialist', bodySystem: 'Immune System' },
    pediatrics: { description: 'childhood conditions and pediatric diseases affecting infants, children, and adolescents', specialist: 'Pediatrician', bodySystem: 'Child Health' },
    geriatrics: { description: 'age-related conditions and elderly care including dementia and geriatric syndromes', specialist: 'Geriatrician', bodySystem: 'Elderly Health' },
};

// Related specialties mapping for internal linking
const RELATED_SPECIALTIES: Record<string, string[]> = {
    cardiology: ['pulmonology', 'endocrinology', 'nephrology'],
    neurology: ['psychiatry', 'orthopedics', 'ophthalmology'],
    orthopedics: ['rheumatology', 'neurology', 'sports-medicine'],
    dermatology: ['rheumatology', 'infectious', 'oncology'],
    gastroenterology: ['hepatology', 'oncology', 'infectious'],
    oncology: ['hematology', 'radiology', 'surgery'],
    pulmonology: ['cardiology', 'infectious', 'oncology'],
    endocrinology: ['cardiology', 'nephrology', 'gynecology'],
    psychiatry: ['neurology', 'psychology', 'geriatrics'],
    ophthalmology: ['neurology', 'endocrinology', 'rheumatology'],
};

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
    const { specialty } = await params;
    const rawSpec = decodeURIComponent(specialty).replace(/-/g, ' ');
    const specKey = specialty.toLowerCase().replace(/-/g, '');
    const info = SPECIALTY_INFO[specKey];

    const title = `${rawSpec.charAt(0).toUpperCase() + rawSpec.slice(1)} Conditions A-Z | Medical Conditions Directory`;
    const description = info
        ? `Complete list of ${rawSpec} conditions covering ${info.description}. Find symptoms, causes, treatments, and ${info.specialist}s near you.`
        : `Comprehensive A-Z directory of ${rawSpec} medical conditions. Find detailed information about symptoms, treatments, and specialists.`;

    return {
        title,
        description,
        keywords: `${rawSpec} conditions, ${rawSpec} diseases, ${rawSpec} symptoms, ${info?.specialist || rawSpec + ' doctor'}, ${rawSpec} treatment, ${info?.bodySystem || ''} conditions`,
        openGraph: {
            title,
            description,
            url: `https://aihealz.com/conditions/${specialty}`,
            siteName: 'aihealz',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: `https://aihealz.com/conditions/${specialty}`,
        },
    };
}

export default async function SpecialtyConditionsPage({ params }: { params: PageParams }) {
    const { specialty } = await params;
    const rawSpecialty = decodeURIComponent(specialty).replace(/-/g, ' ');
    const specKey = specialty.toLowerCase().replace(/-/g, '');

    // Get geo context for proper linking
    const hdrs = await headers();
    const country = hdrs.get('x-aihealz-country') || 'india';
    const lang = hdrs.get('x-aihealz-lang') || 'en';
    const city = hdrs.get('x-aihealz-city');

    // We do a loose matching based on the specialty name to fetch corresponding conditions
    const conditions = await prisma.medicalCondition.findMany({
        where: {
            isActive: true,
            specialistType: {
                contains: rawSpecialty.split(' ')[0],
                mode: 'insensitive'
            }
        },
        select: { id: true, commonName: true, slug: true, description: true, icdCode: true },
        orderBy: { commonName: 'asc' },
    });

    if (conditions.length === 0) {
        notFound();
    }

    // Get specialty info
    const info = SPECIALTY_INFO[specKey];
    const relatedSpecs = RELATED_SPECIALTIES[specKey] || [];

    // Get top cities for this country for GEO linking
    const topCities = await prisma.geography.findMany({
        where: {
            level: 'city',
            isActive: true,
            parent: {
                parent: {
                    slug: country
                }
            }
        },
        select: { name: true, slug: true, parent: { select: { slug: true } } },
        take: 12,
    });

    // Schema markup for SEO
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aihealz.com' },
            { '@type': 'ListItem', position: 2, name: 'Medical Conditions', item: 'https://aihealz.com/conditions' },
            { '@type': 'ListItem', position: 3, name: `${rawSpecialty} Conditions`, item: `https://aihealz.com/conditions/${specialty}` },
        ],
    };

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${rawSpecialty} Medical Conditions`,
        description: info?.description || `Medical conditions related to ${rawSpecialty}`,
        numberOfItems: conditions.length,
        itemListElement: conditions.slice(0, 50).map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'MedicalCondition',
                name: c.commonName,
                url: `https://aihealz.com/${country}/${lang}/${c.slug}`,
                code: c.icdCode ? { '@type': 'MedicalCode', codeValue: c.icdCode, codingSystem: 'ICD-10' } : undefined,
            },
        })),
    };

    const specialtySchema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalSpecialty',
        name: rawSpecialty,
        relevantSpecialty: info?.specialist,
    };

    return (
        <>
            <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <Script id="itemlist-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
            <Script id="specialty-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(specialtySchema) }} />

            <main className="min-h-screen bg-[#050B14] text-slate-300 pt-32 pb-16 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-teal-900/20 via-[#050B14]/80 to-[#050B14] pointer-events-none z-0" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/conditions" className="hover:text-white transition-colors">Conditions</Link>
                        <span>/</span>
                        <span className="text-white font-medium capitalize">{rawSpecialty}</span>
                    </nav>

                    {/* Hero */}
                    <header className="mb-12">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white capitalize">
                            {rawSpecialty} <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Conditions</span>
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-3xl mb-6">
                            {info
                                ? `Complete A-Z directory of ${conditions.length.toLocaleString()} ${rawSpecialty} conditions covering ${info.description}. Find detailed symptoms, treatment options, and ${info.specialist}s in your area.`
                                : `A complete A-Z directory of ${conditions.length.toLocaleString()} indexed medical conditions and subsets specific to ${rawSpecialty}.`
                            }
                        </p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className="bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2">
                                <span className="text-2xl font-bold text-white">{conditions.length.toLocaleString()}</span>
                                <span className="text-sm text-slate-500 ml-2">Conditions</span>
                            </div>
                            {info && (
                                <>
                                    <div className="bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2">
                                        <span className="text-sm font-semibold text-teal-400">{info.specialist}</span>
                                        <span className="text-sm text-slate-500 ml-2">Specialist</span>
                                    </div>
                                    <div className="bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2">
                                        <span className="text-sm font-semibold text-cyan-400">{info.bodySystem}</span>
                                        <span className="text-sm text-slate-500 ml-2">Body System</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={`/doctors?specialty=${encodeURIComponent(info?.specialist || rawSpecialty)}`}
                                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all hover:-translate-y-0.5"
                            >
                                Find {info?.specialist || rawSpecialty} Doctors
                            </Link>
                            <Link
                                href="/symptoms"
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-white/10 transition-all"
                            >
                                Check Symptoms
                            </Link>
                        </div>
                    </header>

                    {/* Location-specific quick links */}
                    {topCities.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-lg font-bold text-white mb-4">
                                {rawSpecialty} Treatment by City
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {topCities.slice(0, 8).map(c => (
                                    <Link
                                        key={c.slug}
                                        href={`/${country}/${lang}/${conditions[0]?.slug}/${c.parent?.slug}/${c.slug}`}
                                        className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-white/5 transition-colors"
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Conditions Grid */}
                    <section aria-labelledby="conditions-heading">
                        <h2 id="conditions-heading" className="text-xl font-bold text-white mb-6">
                            All {rawSpecialty} Conditions ({conditions.length.toLocaleString()})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {conditions.map(cond => (
                                <Link
                                    key={cond.id}
                                    href={`/${country}/${lang}/${cond.slug}`}
                                    className="bg-slate-900/50 backdrop-blur-sm border border-white/5 hover:border-teal-500/30 rounded-2xl p-5 hover:bg-slate-800 transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        <h3 className="text-base font-bold text-slate-200 group-hover:text-white mb-2 line-clamp-1">{cond.commonName}</h3>
                                        {cond.icdCode && (
                                            <span className="text-[10px] text-slate-600 font-mono mb-1 block">{cond.icdCode}</span>
                                        )}
                                        {cond.description ? (
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{cond.description}</p>
                                        ) : (
                                            <p className="text-xs text-slate-600 italic">Exploring symptoms and treatments for {cond.commonName}.</p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-teal-600 group-hover:text-teal-400 transition-colors">
                                        View full guide
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Related Specialties */}
                    {relatedSpecs.length > 0 && (
                        <section className="mt-16">
                            <h2 className="text-xl font-bold text-white mb-6">Related Specialties</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedSpecs.map(spec => (
                                    <Link
                                        key={spec}
                                        href={`/conditions/${spec}`}
                                        className="bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all group"
                                    >
                                        <h3 className="font-semibold text-white capitalize group-hover:text-cyan-400 transition-colors">{spec.replace(/-/g, ' ')}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Browse conditions →</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Internal Links Section */}
                    <section className="mt-16 grid md:grid-cols-3 gap-6">
                        <Link href="/doctors" className="bg-slate-900/60 border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Find {info?.specialist || 'Specialist'}</h3>
                            <p className="text-sm text-slate-500">Connect with verified {rawSpecialty} specialists</p>
                        </Link>
                        <Link href="/treatments" className="bg-slate-900/60 border border-white/5 hover:border-blue-500/30 rounded-2xl p-6 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Treatment Options</h3>
                            <p className="text-sm text-slate-500">Browse {rawSpecialty} treatment procedures and costs</p>
                        </Link>
                        <Link href="/hospitals" className="bg-slate-900/60 border border-white/5 hover:border-amber-500/30 rounded-2xl p-6 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Top Hospitals</h3>
                            <p className="text-sm text-slate-500">Best hospitals for {rawSpecialty} treatment</p>
                        </Link>
                    </section>

                    {/* Back to all conditions */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/conditions"
                            className="inline-flex items-center text-teal-500 hover:text-teal-400 font-semibold transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Browse All {conditions.length > 1000 ? '70,000+' : ''} Medical Conditions
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
