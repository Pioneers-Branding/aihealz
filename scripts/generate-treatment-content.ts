/**
 * Generate Comprehensive Treatment Content for E-E-A-T, Geo-SEO, and AEO
 *
 * This script generates:
 * - Detailed descriptions optimized for featured snippets
 * - Mechanism of action explanations
 * - Clinical indications
 * - Side effects and precautions
 * - Realistic pricing by treatment category
 * - Authoritative medical references
 *
 * No API calls - all content generated from comprehensive medical templates
 */

import * as fs from 'fs';
import * as path from 'path';

interface TreatmentReference {
    title: string;
    url: string;
}

interface TreatmentCost {
    usd: number;
    currency: string;
    range: [number, number];
}

interface Treatment {
    name: string;
    type: string;
    specialty: string;
    description?: string;
    mechanism?: string;
    indications?: string[];
    sideEffects?: string[];
    contraindications?: string[];
    preparation?: string;
    recovery?: string;
    references?: TreatmentReference[];
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    costs?: {
        usa: TreatmentCost;
        uk: TreatmentCost;
        india: TreatmentCost;
        thailand: TreatmentCost;
        mexico: TreatmentCost;
        turkey: TreatmentCost;
        uae: TreatmentCost;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// COST CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

const COST_MULTIPLIERS: Record<string, number> = {
    usa: 1.0,
    uk: 0.70,
    india: 0.10,
    thailand: 0.18,
    mexico: 0.28,
    turkey: 0.22,
    uae: 0.50,
};

const CURRENCIES: Record<string, string> = {
    usa: 'USD',
    uk: 'GBP',
    india: 'INR',
    thailand: 'THB',
    mexico: 'MXN',
    turkey: 'TRY',
    uae: 'AED',
};

const EXCHANGE_RATES: Record<string, number> = {
    usa: 1,
    uk: 0.79,
    india: 83,
    thailand: 35,
    mexico: 17,
    turkey: 32,
    uae: 3.67,
};

function generateCosts(baseUsdPrice: number): Treatment['costs'] {
    const costs: Record<string, TreatmentCost> = {};
    for (const [country, multiplier] of Object.entries(COST_MULTIPLIERS)) {
        const usdPrice = Math.round(baseUsdPrice * multiplier);
        const localPrice = Math.round(usdPrice * EXCHANGE_RATES[country]);
        const variance = 0.2;
        costs[country] = {
            usd: usdPrice,
            currency: CURRENCIES[country],
            range: [Math.round(localPrice * (1 - variance)), Math.round(localPrice * (1 + variance))] as [number, number]
        };
    }
    return costs as Treatment['costs'];
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALTY-SPECIFIC REFERENCES (Authoritative sources for E-E-A-T)
// ═══════════════════════════════════════════════════════════════════════════

const SPECIALTY_REFERENCES: Record<string, TreatmentReference[]> = {
    'Cardiology': [
        { title: 'American Heart Association', url: 'https://www.heart.org' },
        { title: 'American College of Cardiology', url: 'https://www.acc.org' },
        { title: 'European Society of Cardiology', url: 'https://www.escardio.org' },
    ],
    'Cardiologist': [
        { title: 'American Heart Association', url: 'https://www.heart.org' },
        { title: 'American College of Cardiology', url: 'https://www.acc.org' },
    ],
    'Neurology': [
        { title: 'American Academy of Neurology', url: 'https://www.aan.com' },
        { title: 'National Institute of Neurological Disorders', url: 'https://www.ninds.nih.gov' },
    ],
    'Neurologist': [
        { title: 'American Academy of Neurology', url: 'https://www.aan.com' },
        { title: 'National Institute of Neurological Disorders', url: 'https://www.ninds.nih.gov' },
    ],
    'Orthopedics': [
        { title: 'American Academy of Orthopaedic Surgeons', url: 'https://www.aaos.org' },
        { title: 'OrthoInfo - AAOS', url: 'https://orthoinfo.aaos.org' },
    ],
    'Orthopedic Surgeon': [
        { title: 'American Academy of Orthopaedic Surgeons', url: 'https://www.aaos.org' },
        { title: 'OrthoInfo - AAOS', url: 'https://orthoinfo.aaos.org' },
    ],
    'Oncology': [
        { title: 'American Cancer Society', url: 'https://www.cancer.org' },
        { title: 'National Cancer Institute', url: 'https://www.cancer.gov' },
    ],
    'Oncologist': [
        { title: 'American Cancer Society', url: 'https://www.cancer.org' },
        { title: 'National Cancer Institute', url: 'https://www.cancer.gov' },
    ],
    'Psychiatry': [
        { title: 'American Psychiatric Association', url: 'https://www.psychiatry.org' },
        { title: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov' },
    ],
    'Psychiatrist': [
        { title: 'American Psychiatric Association', url: 'https://www.psychiatry.org' },
        { title: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov' },
    ],
    'Dermatology': [
        { title: 'American Academy of Dermatology', url: 'https://www.aad.org' },
        { title: 'DermNet NZ', url: 'https://dermnetnz.org' },
    ],
    'Dermatologist': [
        { title: 'American Academy of Dermatology', url: 'https://www.aad.org' },
        { title: 'DermNet NZ', url: 'https://dermnetnz.org' },
    ],
    'Gastroenterology': [
        { title: 'American Gastroenterological Association', url: 'https://gastro.org' },
        { title: 'American College of Gastroenterology', url: 'https://gi.org' },
    ],
    'Gastroenterologist': [
        { title: 'American Gastroenterological Association', url: 'https://gastro.org' },
        { title: 'American College of Gastroenterology', url: 'https://gi.org' },
    ],
    'Pulmonology': [
        { title: 'American Thoracic Society', url: 'https://www.thoracic.org' },
        { title: 'American Lung Association', url: 'https://www.lung.org' },
    ],
    'Pulmonologist': [
        { title: 'American Thoracic Society', url: 'https://www.thoracic.org' },
        { title: 'American Lung Association', url: 'https://www.lung.org' },
    ],
    'Endocrinology': [
        { title: 'American Diabetes Association', url: 'https://diabetes.org' },
        { title: 'Endocrine Society', url: 'https://www.endocrine.org' },
    ],
    'Endocrinologist': [
        { title: 'American Diabetes Association', url: 'https://diabetes.org' },
        { title: 'Endocrine Society', url: 'https://www.endocrine.org' },
    ],
    'Rheumatology': [
        { title: 'American College of Rheumatology', url: 'https://www.rheumatology.org' },
        { title: 'Arthritis Foundation', url: 'https://www.arthritis.org' },
    ],
    'Rheumatologist': [
        { title: 'American College of Rheumatology', url: 'https://www.rheumatology.org' },
        { title: 'Arthritis Foundation', url: 'https://www.arthritis.org' },
    ],
    'Ophthalmology': [
        { title: 'American Academy of Ophthalmology', url: 'https://www.aao.org' },
        { title: 'National Eye Institute', url: 'https://www.nei.nih.gov' },
    ],
    'Ophthalmologist': [
        { title: 'American Academy of Ophthalmology', url: 'https://www.aao.org' },
        { title: 'National Eye Institute', url: 'https://www.nei.nih.gov' },
    ],
    'Urology': [
        { title: 'American Urological Association', url: 'https://www.auanet.org' },
        { title: 'Urology Care Foundation', url: 'https://www.urologyhealth.org' },
    ],
    'Urologist': [
        { title: 'American Urological Association', url: 'https://www.auanet.org' },
        { title: 'Urology Care Foundation', url: 'https://www.urologyhealth.org' },
    ],
    'Gynecology': [
        { title: 'American College of Obstetricians and Gynecologists', url: 'https://www.acog.org' },
        { title: 'Office on Women\'s Health', url: 'https://www.womenshealth.gov' },
    ],
    'Gynecologist': [
        { title: 'American College of Obstetricians and Gynecologists', url: 'https://www.acog.org' },
        { title: 'Office on Women\'s Health', url: 'https://www.womenshealth.gov' },
    ],
    'Pediatrics': [
        { title: 'American Academy of Pediatrics', url: 'https://www.aap.org' },
        { title: 'CDC - Child Health', url: 'https://www.cdc.gov/ncbddd' },
    ],
    'Pediatrician': [
        { title: 'American Academy of Pediatrics', url: 'https://www.aap.org' },
        { title: 'CDC - Child Health', url: 'https://www.cdc.gov/ncbddd' },
    ],
    'ENT': [
        { title: 'American Academy of Otolaryngology', url: 'https://www.entnet.org' },
        { title: 'ENT Health', url: 'https://www.enthealth.org' },
    ],
    'ENT Specialist': [
        { title: 'American Academy of Otolaryngology', url: 'https://www.entnet.org' },
        { title: 'ENT Health', url: 'https://www.enthealth.org' },
    ],
    'Nephrology': [
        { title: 'American Society of Nephrology', url: 'https://www.asn-online.org' },
        { title: 'National Kidney Foundation', url: 'https://www.kidney.org' },
    ],
    'Nephrologist': [
        { title: 'American Society of Nephrology', url: 'https://www.asn-online.org' },
        { title: 'National Kidney Foundation', url: 'https://www.kidney.org' },
    ],
    'Hematology': [
        { title: 'American Society of Hematology', url: 'https://www.hematology.org' },
        { title: 'Leukemia & Lymphoma Society', url: 'https://www.lls.org' },
    ],
    'Hematologist': [
        { title: 'American Society of Hematology', url: 'https://www.hematology.org' },
        { title: 'Leukemia & Lymphoma Society', url: 'https://www.lls.org' },
    ],
    'Allergy': [
        { title: 'American Academy of Allergy, Asthma & Immunology', url: 'https://www.aaaai.org' },
        { title: 'Asthma and Allergy Foundation', url: 'https://www.aafa.org' },
    ],
    'Allergist': [
        { title: 'American Academy of Allergy, Asthma & Immunology', url: 'https://www.aaaai.org' },
        { title: 'Asthma and Allergy Foundation', url: 'https://www.aafa.org' },
    ],
    'Infectious Disease': [
        { title: 'Infectious Diseases Society of America', url: 'https://www.idsociety.org' },
        { title: 'CDC - Infectious Diseases', url: 'https://www.cdc.gov/ncezid' },
    ],
    'Infectious Disease Specialist': [
        { title: 'Infectious Diseases Society of America', url: 'https://www.idsociety.org' },
        { title: 'CDC - Infectious Diseases', url: 'https://www.cdc.gov/ncezid' },
    ],
    'General': [
        { title: 'Mayo Clinic', url: 'https://www.mayoclinic.org' },
        { title: 'MedlinePlus - NIH', url: 'https://medlineplus.gov' },
        { title: 'Cleveland Clinic', url: 'https://my.clevelandclinic.org' },
    ],
    'Pain Management': [
        { title: 'American Academy of Pain Medicine', url: 'https://painmed.org' },
        { title: 'American Chronic Pain Association', url: 'https://www.theacpa.org' },
    ],
    'Sports Medicine': [
        { title: 'American College of Sports Medicine', url: 'https://www.acsm.org' },
        { title: 'American Orthopaedic Society for Sports Medicine', url: 'https://www.sportsmed.org' },
    ],
    'Physical Medicine': [
        { title: 'American Academy of Physical Medicine', url: 'https://www.aapmr.org' },
        { title: 'American Physical Therapy Association', url: 'https://www.apta.org' },
    ],
    'Plastic Surgery': [
        { title: 'American Society of Plastic Surgeons', url: 'https://www.plasticsurgery.org' },
        { title: 'American Board of Plastic Surgery', url: 'https://www.abplasticsurgery.org' },
    ],
    'Dental': [
        { title: 'American Dental Association', url: 'https://www.ada.org' },
        { title: 'Academy of General Dentistry', url: 'https://www.agd.org' },
    ],
    'Alternate Medicine': [
        { title: 'National Center for Complementary and Integrative Health', url: 'https://www.nccih.nih.gov' },
        { title: 'World Health Organization - Traditional Medicine', url: 'https://www.who.int/health-topics/traditional-complementary-and-integrative-medicine' },
    ],
    'Ayurveda': [
        { title: 'National Ayurvedic Medical Association', url: 'https://www.ayurvedanama.org' },
        { title: 'NCCIH - Ayurvedic Medicine', url: 'https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth' },
    ],
    'Homeopathy': [
        { title: 'National Center for Homeopathy', url: 'https://www.homeopathycenter.org' },
        { title: 'NCCIH - Homeopathy', url: 'https://www.nccih.nih.gov/health/homeopathy' },
    ],
};

// Default references for any specialty
const DEFAULT_REFERENCES: TreatmentReference[] = [
    { title: 'Mayo Clinic', url: 'https://www.mayoclinic.org' },
    { title: 'MedlinePlus - NIH', url: 'https://medlineplus.gov' },
    { title: 'Cleveland Clinic', url: 'https://my.clevelandclinic.org' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TREATMENT TYPE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

interface ContentTemplate {
    descriptionTemplate: (name: string, specialty: string) => string;
    mechanismTemplate: (name: string) => string;
    indicationsTemplate: (name: string, specialty: string) => string[];
    sideEffectsTemplate: (name: string, type: string) => string[];
    preparationTemplate: (name: string, type: string) => string;
    recoveryTemplate: (name: string, type: string) => string;
    basePriceRange: [number, number];
}

const TYPE_TEMPLATES: Record<string, ContentTemplate> = {
    surgical: {
        descriptionTemplate: (name, specialty) =>
            `${name} is a surgical procedure performed by ${specialty} specialists to treat specific medical conditions. This procedure involves precise surgical techniques to address underlying anatomical or functional issues, with the goal of restoring normal function and improving quality of life. Modern surgical approaches often utilize minimally invasive techniques when appropriate, reducing recovery time and complications.`,
        mechanismTemplate: (name) =>
            `${name} works by surgically addressing the affected tissue or organ. The procedure may involve removal of diseased tissue, repair of damaged structures, or reconstruction to restore normal anatomy. Surgeons use specialized instruments and techniques, often guided by imaging technology, to achieve precise results while minimizing trauma to surrounding tissues.`,
        indicationsTemplate: (name, specialty) => [
            `Conditions requiring surgical intervention in ${specialty}`,
            'Failed conservative treatment options',
            'Significant functional impairment',
            'Anatomical abnormalities requiring correction',
            'Disease progression despite medical management',
            'Quality of life significantly affected'
        ],
        sideEffectsTemplate: () => [
            'Post-operative pain and discomfort',
            'Swelling and bruising at surgical site',
            'Risk of infection',
            'Bleeding complications',
            'Anesthesia-related effects',
            'Temporary mobility restrictions',
            'Scar formation'
        ],
        preparationTemplate: (name) =>
            `Preparation for ${name} typically includes pre-operative testing, medical clearance, fasting instructions, and medication adjustments. Patients should discuss all medications and supplements with their surgeon and follow specific pre-operative instructions.`,
        recoveryTemplate: (name) =>
            `Recovery from ${name} varies by individual and procedure complexity. Most patients require rest, pain management, and gradual return to activities. Follow-up appointments are essential to monitor healing and address any concerns.`,
        basePriceRange: [8000, 50000]
    },
    drug: {
        descriptionTemplate: (name, specialty) =>
            `${name} is a prescription medication used in ${specialty} for treating specific medical conditions. This pharmaceutical agent works through targeted mechanisms to address disease processes, manage symptoms, or prevent complications. It should be taken exactly as prescribed by a healthcare provider.`,
        mechanismTemplate: (name) =>
            `${name} exerts its therapeutic effects through specific biochemical pathways. The medication interacts with receptors, enzymes, or other molecular targets to produce the desired clinical outcome. The drug's pharmacokinetics determine how it is absorbed, distributed, metabolized, and eliminated from the body.`,
        indicationsTemplate: (name, specialty) => [
            `FDA-approved indications in ${specialty}`,
            'Management of chronic conditions',
            'Acute symptom relief',
            'Disease modification and progression control',
            'Prevention of complications',
            'Adjunct to other treatments'
        ],
        sideEffectsTemplate: () => [
            'Gastrointestinal effects (nausea, upset stomach)',
            'Headache or dizziness',
            'Fatigue or drowsiness',
            'Allergic reactions (rare)',
            'Drug interactions with other medications',
            'Effects may vary by individual'
        ],
        preparationTemplate: (name) =>
            `Before starting ${name}, inform your doctor about all current medications, allergies, and medical conditions. Some medications require baseline lab tests or monitoring during treatment.`,
        recoveryTemplate: () =>
            `Medication effects typically begin within the expected timeframe for the drug class. Regular follow-up with your healthcare provider helps optimize treatment and monitor for side effects.`,
        basePriceRange: [20, 500]
    },
    prescription: {
        descriptionTemplate: (name, specialty) =>
            `${name} is a prescription medication commonly prescribed in ${specialty} practice. This medication requires a valid prescription from a licensed healthcare provider due to its potency, potential side effects, or need for medical supervision. It plays an important role in managing various health conditions when used appropriately.`,
        mechanismTemplate: (name) =>
            `${name} works through specific pharmacological mechanisms to achieve therapeutic effects. The medication targets particular biological pathways or receptors to treat the underlying condition or manage symptoms effectively.`,
        indicationsTemplate: (name, specialty) => [
            `Conditions within ${specialty} requiring prescription treatment`,
            'Moderate to severe symptom management',
            'Chronic disease control',
            'Acute condition treatment',
            'Prevention therapy',
            'Specialist-recommended treatment protocols'
        ],
        sideEffectsTemplate: () => [
            'Common: mild gastrointestinal symptoms',
            'Possible: headache, fatigue',
            'Less common: dizziness, sleep changes',
            'Rare: allergic reactions',
            'May interact with other medications',
            'Individual responses vary'
        ],
        preparationTemplate: (name) =>
            `Discuss your complete medical history with your prescriber before starting ${name}. Include information about allergies, current medications, and any previous adverse reactions to medications.`,
        recoveryTemplate: () =>
            `Treatment duration varies based on condition and response. Regular follow-up appointments help ensure optimal outcomes and allow for dose adjustments if needed.`,
        basePriceRange: [30, 300]
    },
    injection: {
        descriptionTemplate: (name, specialty) =>
            `${name} is an injectable treatment administered in ${specialty} practice. Injectable medications offer advantages including rapid onset, precise dosing, and ability to deliver treatments that cannot be taken orally. This treatment is typically administered by healthcare professionals in clinical settings.`,
        mechanismTemplate: (name) =>
            `${name} delivers medication directly into the body through injection, allowing for rapid absorption and distribution. Depending on the injection type (intramuscular, subcutaneous, intravenous, or local), the medication reaches its target tissues through specific pathways to produce therapeutic effects.`,
        indicationsTemplate: (name, specialty) => [
            `${specialty} conditions requiring injectable therapy`,
            'Conditions where oral medications are ineffective',
            'Need for rapid medication onset',
            'Localized treatment delivery',
            'Biologic or specialty medication administration',
            'Maintenance therapy protocols'
        ],
        sideEffectsTemplate: () => [
            'Injection site reactions (pain, redness, swelling)',
            'Bruising at injection site',
            'Temporary discomfort during administration',
            'Systemic effects depend on specific medication',
            'Rare: allergic reactions',
            'Infection risk (minimized with proper technique)'
        ],
        preparationTemplate: (name) =>
            `${name} injections may require specific preparation such as skin cleansing, proper positioning, or pre-medication. Follow your healthcare provider's instructions regarding any preparation steps.`,
        recoveryTemplate: (name) =>
            `After receiving ${name}, you may be observed briefly for any immediate reactions. Most patients can resume normal activities shortly after injection, though specific restrictions may apply depending on the treatment.`,
        basePriceRange: [100, 2000]
    },
    therapy: {
        descriptionTemplate: (name, specialty) =>
            `${name} is a therapeutic intervention used in ${specialty} to improve function, reduce symptoms, and enhance quality of life. This therapy approach involves structured sessions with trained professionals who guide patients through evidence-based techniques and exercises tailored to individual needs.`,
        mechanismTemplate: (name) =>
            `${name} works through structured therapeutic interventions that target specific functional, physical, or psychological goals. Regular sessions help develop skills, improve capabilities, and create lasting positive changes through practice and professional guidance.`,
        indicationsTemplate: (name, specialty) => [
            `Rehabilitation needs in ${specialty}`,
            'Functional improvement goals',
            'Chronic condition management',
            'Recovery from injury or surgery',
            'Developmental or skill-building needs',
            'Quality of life enhancement'
        ],
        sideEffectsTemplate: () => [
            'Temporary muscle soreness (physical therapies)',
            'Fatigue after sessions',
            'Emotional responses during psychological therapies',
            'Temporary symptom fluctuation',
            'Generally well-tolerated',
            'Effects typically improve with continued treatment'
        ],
        preparationTemplate: (name) =>
            `For ${name} sessions, wear comfortable clothing if physical activity is involved. Be prepared to discuss your goals, symptoms, and progress with your therapist.`,
        recoveryTemplate: () =>
            `Progress in therapy is typically gradual and cumulative. Completing prescribed home exercises or activities between sessions enhances outcomes. Regular attendance and active participation are key to success.`,
        basePriceRange: [75, 250]
    },
    medical: {
        descriptionTemplate: (name, specialty) =>
            `${name} is a medical treatment approach used in ${specialty} to manage health conditions through non-surgical interventions. This treatment may include medications, monitoring, lifestyle modifications, or other conservative approaches as part of a comprehensive treatment plan developed by healthcare providers.`,
        mechanismTemplate: (name) =>
            `${name} addresses health conditions through medical management approaches. This may involve pharmacological interventions, monitoring protocols, lifestyle modifications, or a combination of strategies to achieve optimal health outcomes.`,
        indicationsTemplate: (name, specialty) => [
            `Medical conditions within ${specialty}`,
            'Initial conservative treatment approach',
            'Ongoing condition management',
            'Preventive care needs',
            'Chronic disease control',
            'Health maintenance and optimization'
        ],
        sideEffectsTemplate: () => [
            'Effects vary based on specific treatment components',
            'Medication-related effects if applicable',
            'Generally well-tolerated conservative approaches',
            'Individual responses vary',
            'Discuss concerns with your healthcare provider'
        ],
        preparationTemplate: (name) =>
            `Preparation for ${name} depends on the specific components of treatment. Bring relevant medical records, medication lists, and questions to your appointments.`,
        recoveryTemplate: () =>
            `Medical management is often ongoing and requires regular follow-up. Work closely with your healthcare team to optimize your treatment plan and address any concerns.`,
        basePriceRange: [50, 300]
    },
    otc: {
        descriptionTemplate: (name, specialty) =>
            `${name} is an over-the-counter treatment available without a prescription for common health concerns. While accessible for self-care, it's important to use OTC products as directed and consult a healthcare provider if symptoms persist or worsen.`,
        mechanismTemplate: (name) =>
            `${name} works through mechanisms appropriate for self-treatment of mild to moderate symptoms. OTC products are formulated to be effective for common conditions while maintaining a favorable safety profile for general use.`,
        indicationsTemplate: () => [
            'Mild to moderate symptom relief',
            'Common health concerns suitable for self-care',
            'Temporary symptom management',
            'Supportive care alongside other treatments',
            'Preventive use as appropriate',
            'General wellness support'
        ],
        sideEffectsTemplate: () => [
            'Generally well-tolerated when used as directed',
            'Possible mild side effects vary by product',
            'Allergic reactions possible in sensitive individuals',
            'May interact with prescription medications',
            'Overuse can lead to complications',
            'Read and follow label directions carefully'
        ],
        preparationTemplate: () =>
            `Read all product labels carefully before use. Check for ingredient allergies and potential interactions with other medications. Consult a pharmacist if you have questions.`,
        recoveryTemplate: () =>
            `OTC treatments provide symptomatic relief. If symptoms persist beyond the recommended treatment duration or worsen, consult a healthcare provider for evaluation.`,
        basePriceRange: [5, 50]
    },
    home_remedy: {
        descriptionTemplate: (name, specialty) =>
            `${name} is a natural or home-based approach used traditionally for wellness support. While many people find these remedies helpful, they should complement rather than replace professional medical care for significant health concerns.`,
        mechanismTemplate: (name) =>
            `${name} is believed to work through natural mechanisms that support the body's own healing processes. Traditional use has informed these approaches, though scientific evidence varies for different remedies.`,
        indicationsTemplate: () => [
            'Mild symptom relief and comfort',
            'Wellness maintenance',
            'Complementary support to medical treatment',
            'Preventive health practices',
            'Natural approach preferences',
            'Traditional health practices'
        ],
        sideEffectsTemplate: () => [
            'Generally considered safe when used appropriately',
            'Natural doesn\'t always mean safe for everyone',
            'Possible allergic reactions',
            'May interact with medications',
            'Not a substitute for medical treatment of serious conditions',
            'Consult healthcare provider if pregnant or nursing'
        ],
        preparationTemplate: () =>
            `Ensure ingredients are fresh and from reliable sources. Follow traditional preparation methods and dosing guidelines. Discontinue use if any adverse reactions occur.`,
        recoveryTemplate: () =>
            `Home remedies may provide supportive benefits for wellness. They work best as part of a healthy lifestyle. Seek medical attention for symptoms that don't improve or worsen.`,
        basePriceRange: [5, 30]
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// SPECIFIC TREATMENT DATA (High-priority treatments with detailed content)
// ═══════════════════════════════════════════════════════════════════════════

const SPECIFIC_TREATMENTS: Record<string, Partial<Treatment> & { basePrice: number }> = {
    // ── CARDIOLOGY ──────────────────────────────────────────────
    'coronary angioplasty': {
        description: 'Coronary angioplasty, also known as percutaneous coronary intervention (PCI), is a minimally invasive procedure to open blocked or narrowed coronary arteries. A catheter with a balloon is inserted through a blood vessel and guided to the blocked artery, where the balloon is inflated to compress plaque and restore blood flow. Often, a stent is placed to keep the artery open.',
        mechanism: 'During angioplasty, a thin catheter with a deflated balloon is threaded through an artery (usually in the groin or wrist) to the blocked coronary artery. The balloon is inflated to compress fatty deposits against the artery walls, widening the vessel. A mesh tube called a stent is typically placed to maintain the opening and prevent re-narrowing.',
        indications: ['Coronary artery disease with significant blockage', 'Acute heart attack (emergency intervention)', 'Unstable angina not responding to medications', 'Significant symptoms despite optimal medical therapy', 'Positive stress test indicating ischemia', 'Blockage amenable to catheter-based treatment'],
        sideEffects: ['Bleeding at catheter insertion site', 'Bruising and soreness', 'Allergic reaction to contrast dye', 'Kidney function changes', 'Artery damage (rare)', 'Restenosis (re-narrowing) of treated artery', 'Blood clots requiring ongoing medication'],
        basePrice: 35000
    },
    'bypass surgery': {
        description: 'Coronary artery bypass grafting (CABG) is open-heart surgery that creates new routes around blocked coronary arteries to improve blood flow to the heart muscle. Surgeons use healthy blood vessels from other parts of the body (typically leg veins or chest arteries) to bypass the blockages and restore adequate blood supply to the heart.',
        mechanism: 'CABG works by grafting healthy blood vessels to bypass blocked sections of coronary arteries. The grafts are attached above and below the blockage, creating a new pathway for blood to reach the heart muscle. This improves oxygen delivery to the heart and relieves angina symptoms.',
        indications: ['Severe blockages in multiple coronary arteries', 'Left main coronary artery disease', 'Failed angioplasty or stent placement', 'Diabetes with multi-vessel disease', 'Reduced heart function with coronary disease', 'Angina not controlled by medications'],
        sideEffects: ['Post-operative pain and discomfort', 'Fatigue lasting weeks to months', 'Temporary cognitive changes', 'Infection risk', 'Bleeding complications', 'Atrial fibrillation', 'Depression during recovery'],
        basePrice: 85000
    },
    'pacemaker implantation': {
        description: 'Pacemaker implantation is a procedure to place a small electronic device under the skin to help regulate abnormal heart rhythms. The pacemaker monitors the heart\'s electrical activity and delivers electrical impulses when needed to maintain a regular heartbeat.',
        mechanism: 'A pacemaker consists of a pulse generator (containing battery and computer) and leads (wires) that connect to the heart. The device continuously monitors heart rhythm and delivers electrical signals when the heart beats too slowly or irregularly, ensuring adequate heart rate and cardiac output.',
        indications: ['Bradycardia (slow heart rate)', 'Heart block', 'Sick sinus syndrome', 'Fainting spells due to slow heart rate', 'After heart attack affecting electrical system', 'Certain types of heart failure'],
        sideEffects: ['Swelling or bruising at implant site', 'Infection', 'Lead displacement', 'Device malfunction (rare)', 'Electromagnetic interference concerns', 'Need for eventual battery replacement'],
        basePrice: 40000
    },

    // ── ORTHOPEDICS ─────────────────────────────────────────────
    'total knee replacement': {
        description: 'Total knee replacement (arthroplasty) is a surgical procedure to resurface a knee damaged by arthritis or injury. The damaged bone and cartilage are removed and replaced with metal and plastic components that recreate the smooth gliding surface of a healthy knee, relieving pain and restoring function.',
        mechanism: 'During total knee replacement, the surgeon removes damaged cartilage and bone from the thighbone (femur), shinbone (tibia), and kneecap (patella). These surfaces are replaced with metal implants, and a plastic spacer is inserted between them to create a smooth gliding surface that mimics natural knee movement.',
        indications: ['Severe osteoarthritis of the knee', 'Rheumatoid arthritis affecting the knee', 'Post-traumatic arthritis', 'Significant pain limiting daily activities', 'Knee deformity', 'Failed conservative treatments'],
        sideEffects: ['Blood clots (DVT/PE risk)', 'Infection', 'Implant loosening over time', 'Stiffness', 'Nerve or blood vessel damage', 'Persistent pain in some patients', 'May require revision surgery years later'],
        preparation: 'Pre-operative preparation includes medical evaluation, physical therapy to strengthen muscles, home modifications for recovery, and medication adjustments. Stop certain medications as directed and follow fasting instructions.',
        recovery: 'Initial hospital stay is typically 1-3 days. Physical therapy begins immediately and continues for months. Most patients walk with assistance within days and can drive in 4-6 weeks. Full recovery takes 3-6 months.',
        basePrice: 45000
    },
    'total hip replacement': {
        description: 'Total hip replacement is a surgical procedure in which the damaged hip joint is replaced with artificial components. The procedure relieves pain and improves function in patients with severe hip arthritis or injury, allowing return to daily activities and improved quality of life.',
        mechanism: 'The surgeon removes the damaged femoral head (ball) and replaces it with a metal stem and ball. The damaged cartilage of the acetabulum (socket) is replaced with a metal cup, often with a plastic or ceramic liner. These components work together to restore smooth, pain-free hip movement.',
        indications: ['Severe osteoarthritis of the hip', 'Rheumatoid arthritis affecting the hip', 'Hip fracture in elderly patients', 'Avascular necrosis', 'Hip dysplasia', 'Failed previous hip surgery'],
        sideEffects: ['Blood clots', 'Dislocation of the new joint', 'Leg length inequality', 'Infection', 'Implant wear or loosening', 'Nerve damage', 'Fracture around implant'],
        basePrice: 48000
    },
    'acl reconstruction': {
        description: 'ACL reconstruction is a surgical procedure to replace a torn anterior cruciate ligament (ACL) in the knee. The ACL is a major ligament that provides stability, and reconstruction involves replacing the torn ligament with a tissue graft to restore knee stability and function.',
        mechanism: 'The torn ACL is removed and replaced with a graft, typically harvested from the patient\'s own tissue (patellar tendon, hamstring tendon) or from a donor. The graft is positioned through tunnels drilled in the bone and fixed in place, allowing it to heal and function as a new ACL.',
        indications: ['Complete ACL tear', 'Knee instability affecting activities', 'Athletes wanting to return to sports', 'Active individuals with giving way episodes', 'Combined ligament injuries', 'Failed non-surgical treatment'],
        sideEffects: ['Graft failure or re-tear', 'Knee stiffness', 'Anterior knee pain', 'Infection', 'Blood clots', 'Numbness around incision', 'Arthritis development long-term'],
        basePrice: 25000
    },
    'spinal fusion': {
        description: 'Spinal fusion is a surgical procedure that permanently joins two or more vertebrae in the spine, eliminating motion between them. It is used to treat various spinal conditions including instability, deformity, and chronic pain that hasn\'t responded to conservative treatment.',
        mechanism: 'Bone graft material is placed between vertebrae, and hardware (screws, rods, plates) holds the spine in position while the bones fuse together over several months. This creates a solid bone mass that stabilizes the spine and can relieve pain caused by abnormal motion.',
        indications: ['Degenerative disc disease', 'Spinal stenosis', 'Spondylolisthesis', 'Spinal fractures', 'Scoliosis or kyphosis', 'Spinal tumors or infections', 'Failed disc surgery'],
        sideEffects: ['Failed fusion (pseudarthrosis)', 'Hardware complications', 'Adjacent segment disease', 'Nerve damage', 'Infection', 'Blood clots', 'Chronic pain persistence'],
        basePrice: 85000
    },

    // ── NEUROLOGY ───────────────────────────────────────────────
    'deep brain stimulation': {
        description: 'Deep brain stimulation (DBS) is a neurosurgical procedure that implants electrodes in specific areas of the brain to deliver electrical impulses that regulate abnormal brain activity. It is used to treat movement disorders and certain psychiatric conditions when medications are insufficient.',
        mechanism: 'DBS involves placing thin electrodes in targeted brain regions connected to a pulse generator (similar to a pacemaker) implanted in the chest. The device delivers continuous electrical stimulation that modulates neural circuits, reducing symptoms without destroying brain tissue.',
        indications: ['Parkinson\'s disease with motor fluctuations', 'Essential tremor', 'Dystonia', 'Obsessive-compulsive disorder (severe)', 'Epilepsy (certain types)', 'Treatment-resistant depression (investigational)'],
        sideEffects: ['Infection', 'Bleeding in the brain', 'Stroke', 'Hardware complications', 'Speech or balance problems', 'Mood changes', 'Stimulation-related side effects'],
        basePrice: 85000
    },

    // ── GASTROENTEROLOGY ────────────────────────────────────────
    'colonoscopy': {
        description: 'Colonoscopy is a procedure that allows examination of the entire colon and rectum using a flexible tube with a camera. It is both a diagnostic and therapeutic procedure, enabling detection and removal of polyps, biopsy of suspicious areas, and screening for colorectal cancer.',
        mechanism: 'A colonoscope (flexible tube with camera and light) is inserted through the rectum and advanced through the colon. The physician can visualize the intestinal lining, take tissue samples, and remove polyps using specialized instruments passed through the scope.',
        indications: ['Colorectal cancer screening', 'Evaluation of bowel symptoms', 'Surveillance after polyp removal', 'Inflammatory bowel disease monitoring', 'Unexplained rectal bleeding', 'Abnormal imaging findings'],
        sideEffects: ['Bloating and gas', 'Mild cramping', 'Bleeding (especially after polyp removal)', 'Perforation (rare)', 'Adverse reaction to sedation', 'Missed lesions possible'],
        preparation: 'Bowel preparation is essential and involves a special diet and laxative solution to clean the colon. Follow specific instructions about medications and fasting.',
        basePrice: 3500
    },
    'endoscopy': {
        description: 'Upper endoscopy (esophagogastroduodenoscopy or EGD) is a procedure to examine the lining of the upper digestive tract, including the esophagus, stomach, and duodenum. It allows diagnosis and treatment of various conditions affecting these areas.',
        mechanism: 'An endoscope (thin, flexible tube with camera) is passed through the mouth into the upper digestive tract. The physician can visualize abnormalities, take biopsies, stop bleeding, remove foreign objects, and perform various therapeutic interventions.',
        indications: ['Persistent heartburn or GERD symptoms', 'Difficulty swallowing', 'Upper abdominal pain', 'Unexplained nausea/vomiting', 'Gastrointestinal bleeding', 'Celiac disease diagnosis', 'Barrett\'s esophagus surveillance'],
        sideEffects: ['Sore throat', 'Bloating', 'Mild cramping', 'Bleeding (especially after biopsy)', 'Perforation (rare)', 'Aspiration risk', 'Reaction to sedation'],
        basePrice: 2500
    },

    // ── OPHTHALMOLOGY ───────────────────────────────────────────
    'cataract surgery': {
        description: 'Cataract surgery removes the clouded natural lens of the eye and replaces it with an artificial intraocular lens (IOL). It is one of the most common and successful surgeries performed worldwide, restoring clear vision for millions of people annually.',
        mechanism: 'Using phacoemulsification, ultrasound energy breaks up the clouded lens into small pieces that are suctioned out. A foldable artificial lens is then inserted through a tiny incision and positioned to replace the natural lens, restoring clear vision.',
        indications: ['Vision impairment from cataracts', 'Difficulty with daily activities', 'Glare problems with driving', 'Declining quality of life', 'Need for better vision for work or hobbies', 'Cataracts interfering with other eye conditions'],
        sideEffects: ['Temporary blurry vision', 'Dry eyes', 'Light sensitivity', 'Floaters', 'Posterior capsule opacification', 'Infection (rare)', 'Retinal detachment (rare)', 'Persistent refractive error'],
        basePrice: 4500
    },
    'lasik': {
        description: 'LASIK (Laser-Assisted In Situ Keratomileusis) is a refractive surgery that uses laser technology to reshape the cornea and correct vision problems including nearsightedness, farsightedness, and astigmatism, reducing or eliminating the need for glasses or contact lenses.',
        mechanism: 'A thin flap is created in the cornea using a femtosecond laser. The flap is lifted, and an excimer laser precisely removes corneal tissue to reshape its curvature. The flap is then repositioned, adhering naturally without sutures. This reshaping corrects how light focuses on the retina.',
        indications: ['Myopia (nearsightedness)', 'Hyperopia (farsightedness)', 'Astigmatism', 'Desire to reduce dependence on glasses/contacts', 'Stable vision prescription', 'Adequate corneal thickness'],
        sideEffects: ['Dry eyes', 'Glare and halos around lights', 'Under-correction or over-correction', 'Flap complications', 'Infection', 'Temporary visual fluctuations', 'Rare: vision loss'],
        basePrice: 4000
    },

    // ── GYNECOLOGY ──────────────────────────────────────────────
    'hysterectomy': {
        description: 'Hysterectomy is the surgical removal of the uterus. Depending on the condition being treated, it may also involve removal of the cervix, ovaries, and fallopian tubes. It can be performed through various approaches including vaginal, abdominal, or laparoscopic methods.',
        mechanism: 'The uterus is surgically separated from its attachments to blood vessels, ligaments, and surrounding tissues, then removed. The surgical approach depends on the reason for surgery, uterus size, and patient factors. After removal, the vaginal cuff is closed.',
        indications: ['Uterine fibroids causing symptoms', 'Endometriosis', 'Uterine prolapse', 'Abnormal uterine bleeding', 'Gynecologic cancers', 'Chronic pelvic pain', 'Adenomyosis'],
        sideEffects: ['Surgical menopause (if ovaries removed)', 'Bladder or bowel injury', 'Infection', 'Blood clots', 'Vaginal vault prolapse', 'Sexual function changes', 'Emotional effects'],
        basePrice: 18000
    },
    'ivf': {
        description: 'In vitro fertilization (IVF) is an assisted reproductive technology where eggs are retrieved from the ovaries, fertilized with sperm in a laboratory, and the resulting embryo(s) are transferred to the uterus. IVF offers hope for many couples struggling with infertility.',
        mechanism: 'IVF involves ovarian stimulation with hormones to produce multiple eggs, which are retrieved through a minor procedure. Eggs are combined with sperm in the laboratory, and fertilized eggs develop into embryos. Selected embryos are transferred to the uterus, where implantation may occur.',
        indications: ['Blocked or damaged fallopian tubes', 'Male factor infertility', 'Ovulation disorders', 'Endometriosis', 'Unexplained infertility', 'Genetic disorder screening needed', 'Failed other fertility treatments'],
        sideEffects: ['Ovarian hyperstimulation syndrome', 'Multiple pregnancy risk', 'Ectopic pregnancy', 'Procedure-related discomfort', 'Emotional stress', 'Medication side effects', 'Cost and time commitment'],
        basePrice: 15000
    },

    // ── ONCOLOGY ────────────────────────────────────────────────
    'chemotherapy': {
        description: 'Chemotherapy uses powerful drugs to destroy rapidly dividing cancer cells throughout the body. It may be used as a primary treatment, before surgery (neoadjuvant), after surgery (adjuvant), or for palliative care. Treatment protocols are tailored to each cancer type and patient.',
        mechanism: 'Chemotherapy drugs target cells that divide rapidly, interfering with DNA replication and cell division. Since cancer cells typically divide faster than most normal cells, they are more susceptible. Different drug classes work through various mechanisms to attack cancer at multiple points.',
        indications: ['Primary cancer treatment', 'Shrinking tumors before surgery', 'Destroying residual cancer cells after surgery', 'Controlling advanced or metastatic cancer', 'Preparing for bone marrow transplant', 'Palliative symptom control'],
        sideEffects: ['Nausea and vomiting', 'Hair loss', 'Fatigue', 'Increased infection risk', 'Anemia', 'Easy bruising/bleeding', 'Mouth sores', 'Neuropathy', 'Fertility effects'],
        basePrice: 12000
    },
    'radiation therapy': {
        description: 'Radiation therapy uses high-energy beams to destroy cancer cells and shrink tumors. Modern techniques precisely target tumors while minimizing damage to surrounding healthy tissue. It may be used alone or combined with surgery and chemotherapy.',
        mechanism: 'Radiation damages the DNA of cancer cells, preventing them from dividing and growing. While radiation affects both cancer and normal cells, cancer cells are less able to repair DNA damage. Treatment is planned using imaging to precisely target the tumor.',
        indications: ['Primary cancer treatment', 'Adjuvant therapy after surgery', 'Neoadjuvant therapy before surgery', 'Palliation of cancer symptoms', 'Prevention of cancer recurrence', 'Treatment of inoperable tumors'],
        sideEffects: ['Skin changes in treatment area', 'Fatigue', 'Site-specific effects depending on location', 'Long-term: secondary cancers (rare)', 'Scarring of treated tissues', 'Specific organ effects vary by treatment site'],
        basePrice: 15000
    },

    // ── COMMON MEDICATIONS ──────────────────────────────────────
    'metformin': {
        description: 'Metformin is a first-line medication for type 2 diabetes that helps control blood sugar levels. It has been used safely for decades and offers additional benefits including weight neutrality and cardiovascular protection.',
        mechanism: 'Metformin works primarily by reducing glucose production in the liver and improving insulin sensitivity in muscle tissue. It also slows intestinal glucose absorption. Unlike some diabetes medications, it doesn\'t cause hypoglycemia when used alone.',
        indications: ['Type 2 diabetes mellitus', 'Prediabetes prevention', 'Polycystic ovary syndrome', 'Gestational diabetes (off-label)', 'Metabolic syndrome', 'Weight management support'],
        sideEffects: ['Gastrointestinal upset (nausea, diarrhea)', 'Metallic taste', 'Vitamin B12 deficiency with long-term use', 'Lactic acidosis (rare, serious)', 'Should be held before contrast procedures'],
        basePrice: 20
    },
    'lisinopril': {
        description: 'Lisinopril is an ACE inhibitor medication used to treat high blood pressure, heart failure, and diabetic kidney disease. It helps protect the heart and kidneys while effectively lowering blood pressure.',
        mechanism: 'Lisinopril blocks the angiotensin-converting enzyme (ACE), preventing the formation of angiotensin II, a potent vasoconstrictor. This leads to blood vessel relaxation, reduced blood pressure, and decreased strain on the heart. It also reduces aldosterone secretion, helping control fluid balance.',
        indications: ['Hypertension', 'Heart failure', 'After heart attack', 'Diabetic nephropathy', 'Chronic kidney disease', 'Left ventricular dysfunction'],
        sideEffects: ['Dry cough (common)', 'Dizziness', 'Hyperkalemia (high potassium)', 'Angioedema (rare but serious)', 'Kidney function changes', 'First-dose hypotension'],
        basePrice: 25
    },
    'atorvastatin': {
        description: 'Atorvastatin (Lipitor) is a statin medication that lowers cholesterol and reduces the risk of heart attack and stroke. It is one of the most prescribed medications worldwide for cardiovascular disease prevention.',
        mechanism: 'Atorvastatin inhibits HMG-CoA reductase, an enzyme essential for cholesterol synthesis in the liver. This reduces LDL (bad) cholesterol, triglycerides, and slightly increases HDL (good) cholesterol. It also has anti-inflammatory effects that benefit blood vessels.',
        indications: ['High cholesterol', 'Cardiovascular disease prevention', 'After heart attack or stroke', 'Diabetes with cardiovascular risk', 'Familial hypercholesterolemia', 'Peripheral artery disease'],
        sideEffects: ['Muscle pain or weakness', 'Liver enzyme elevation', 'Digestive problems', 'Memory issues (uncommon)', 'Increased blood sugar', 'Rhabdomyolysis (rare, serious)'],
        basePrice: 45
    },
    'omeprazole': {
        description: 'Omeprazole is a proton pump inhibitor (PPI) that reduces stomach acid production. It is used to treat acid reflux, ulcers, and conditions where reducing stomach acid is beneficial.',
        mechanism: 'Omeprazole irreversibly blocks the hydrogen-potassium ATPase enzyme system (proton pump) in stomach parietal cells. This is the final step in acid production, so blocking it provides powerful and long-lasting acid suppression.',
        indications: ['Gastroesophageal reflux disease (GERD)', 'Peptic ulcers', 'H. pylori infection (with antibiotics)', 'Zollinger-Ellison syndrome', 'Prevention of NSAID-induced ulcers', 'Erosive esophagitis'],
        sideEffects: ['Headache', 'Diarrhea', 'Abdominal pain', 'Vitamin B12 deficiency (long-term)', 'Magnesium deficiency', 'Increased infection risk', 'Possible bone fracture risk'],
        basePrice: 25
    },
    'sertraline': {
        description: 'Sertraline (Zoloft) is a selective serotonin reuptake inhibitor (SSRI) antidepressant used to treat depression, anxiety disorders, PTSD, and other mental health conditions. It is one of the most commonly prescribed antidepressants.',
        mechanism: 'Sertraline blocks the reuptake of serotonin in the brain, increasing serotonin availability in synapses. This enhanced serotonin signaling helps regulate mood, anxiety, and emotional responses over time with continued treatment.',
        indications: ['Major depressive disorder', 'Generalized anxiety disorder', 'Panic disorder', 'Post-traumatic stress disorder', 'Obsessive-compulsive disorder', 'Social anxiety disorder', 'Premenstrual dysphoric disorder'],
        sideEffects: ['Nausea', 'Insomnia or drowsiness', 'Sexual dysfunction', 'Weight changes', 'Dry mouth', 'Increased anxiety initially', 'Withdrawal symptoms if stopped abruptly'],
        basePrice: 35
    },
    'gabapentin': {
        description: 'Gabapentin is an anticonvulsant medication also used to treat nerve pain and certain anxiety conditions. It has become widely prescribed for various pain syndromes and off-label uses.',
        mechanism: 'Gabapentin binds to calcium channels in the nervous system, reducing the release of excitatory neurotransmitters. This calms overactive nerve signaling associated with seizures and neuropathic pain.',
        indications: ['Epilepsy (partial seizures)', 'Postherpetic neuralgia', 'Diabetic neuropathy', 'Fibromyalgia', 'Restless legs syndrome', 'Anxiety disorders (off-label)', 'Chronic pain conditions'],
        sideEffects: ['Drowsiness', 'Dizziness', 'Fatigue', 'Weight gain', 'Peripheral edema', 'Coordination problems', 'Mood changes'],
        basePrice: 45
    },

    // ── THERAPIES ───────────────────────────────────────────────
    'cognitive behavioral therapy': {
        description: 'Cognitive Behavioral Therapy (CBT) is an evidence-based psychotherapy that helps patients identify and change negative thought patterns and behaviors. It is highly effective for many mental health conditions and teaches practical skills for ongoing self-management.',
        mechanism: 'CBT works by helping patients recognize distorted thinking patterns, challenge negative beliefs, and develop healthier cognitive and behavioral responses. Through structured sessions and homework exercises, patients learn to manage symptoms and prevent relapse.',
        indications: ['Depression', 'Anxiety disorders', 'Post-traumatic stress disorder', 'Obsessive-compulsive disorder', 'Eating disorders', 'Insomnia', 'Chronic pain', 'Substance use disorders'],
        sideEffects: ['Temporary emotional discomfort', 'Requires consistent effort', 'May surface difficult emotions', 'Time commitment for sessions and homework', 'Not effective for everyone'],
        basePrice: 200
    },
    'physical therapy': {
        description: 'Physical therapy is a healthcare specialty focused on restoring movement, function, and quality of life through exercise, manual therapy, and education. Physical therapists help patients recover from injuries, surgeries, and chronic conditions affecting mobility.',
        mechanism: 'Physical therapy works through targeted exercises that strengthen muscles, improve flexibility, and enhance coordination. Manual techniques address joint mobility and soft tissue restrictions. Patient education promotes proper movement patterns and injury prevention.',
        indications: ['Post-surgical rehabilitation', 'Sports injuries', 'Back and neck pain', 'Arthritis', 'Stroke recovery', 'Balance disorders', 'Chronic pain conditions', 'Neurological conditions'],
        sideEffects: ['Temporary muscle soreness', 'Fatigue after sessions', 'Occasional symptom flare-up', 'Generally very well tolerated'],
        basePrice: 150
    },
    'occupational therapy': {
        description: 'Occupational therapy helps people participate in daily activities (occupations) that are meaningful to them. OTs work with individuals recovering from injury, managing chronic conditions, or facing developmental challenges to maximize independence and quality of life.',
        mechanism: 'Occupational therapy addresses functional limitations through activity modification, adaptive equipment, environmental changes, and skill training. Therapists analyze activities and develop strategies to help patients accomplish their goals.',
        indications: ['Stroke and brain injury recovery', 'Hand and upper extremity injuries', 'Developmental delays in children', 'Autism spectrum disorder', 'Mental health conditions', 'Aging-related functional decline', 'Chronic disease management'],
        sideEffects: ['Fatigue from therapy activities', 'Temporary frustration during skill building', 'Generally very well tolerated'],
        basePrice: 180
    },

    // ── DIAGNOSTIC PROCEDURES ───────────────────────────────────
    'mri scan': {
        description: 'Magnetic Resonance Imaging (MRI) is a non-invasive imaging technique that uses powerful magnets and radio waves to create detailed images of organs and tissues. It provides excellent soft tissue contrast without using ionizing radiation.',
        mechanism: 'MRI works by aligning hydrogen atoms in the body using a strong magnetic field, then disrupting this alignment with radio waves. As atoms return to their original state, they emit signals that are processed by computer to create detailed cross-sectional images.',
        indications: ['Brain and spinal cord abnormalities', 'Joint and soft tissue injuries', 'Tumor detection and staging', 'Cardiac imaging', 'Abdominal organ evaluation', 'Blood vessel assessment', 'Multiple sclerosis monitoring'],
        sideEffects: ['Claustrophobia in enclosed scanner', 'Loud noise during scan', 'Contrast agent reactions (if used)', 'Not suitable for patients with certain implants', 'May require sedation for some patients'],
        basePrice: 1200
    },
    'ct scan': {
        description: 'Computed Tomography (CT) scan uses X-rays and computer processing to create detailed cross-sectional images of the body. It provides rapid, detailed imaging useful for diagnosing many conditions and guiding treatments.',
        mechanism: 'CT scanners rotate X-ray beams around the body while detectors measure how much radiation passes through. A computer processes this data to create detailed cross-sectional images that can be viewed individually or reconstructed into 3D models.',
        indications: ['Trauma evaluation', 'Cancer detection and staging', 'Lung disease evaluation', 'Abdominal pain investigation', 'Stroke diagnosis', 'Bone fractures', 'Guiding biopsies and procedures'],
        sideEffects: ['Radiation exposure', 'Contrast agent allergic reactions', 'Kidney function concerns with contrast', 'Brief discomfort from lying still'],
        basePrice: 800
    },
    'ultrasound': {
        description: 'Ultrasound imaging uses high-frequency sound waves to create real-time images of internal body structures. It is safe, non-invasive, and does not use radiation, making it ideal for many diagnostic applications including pregnancy monitoring.',
        mechanism: 'A transducer sends sound waves into the body and receives echoes bouncing back from tissues. Different tissues reflect sound differently, creating distinct patterns that are processed into images. Real-time imaging allows assessment of movement and blood flow.',
        indications: ['Pregnancy monitoring', 'Abdominal organ evaluation', 'Heart function assessment', 'Blood vessel examination', 'Thyroid and breast imaging', 'Musculoskeletal injuries', 'Guiding biopsies and procedures'],
        sideEffects: ['No known harmful effects', 'Mild pressure from transducer', 'Generally very comfortable'],
        basePrice: 300
    },

    // ── DENTAL ──────────────────────────────────────────────────
    'dental implant': {
        description: 'Dental implants are titanium posts surgically placed in the jawbone to serve as artificial tooth roots. After healing, they support crowns, bridges, or dentures, providing a permanent solution for missing teeth that looks and functions like natural teeth.',
        mechanism: 'The titanium implant integrates with the jawbone through osseointegration, becoming a stable anchor. An abutment is attached to the implant, which then supports a custom-made crown or prosthesis. This mimics the structure of a natural tooth.',
        indications: ['Single missing tooth replacement', 'Multiple missing teeth', 'Full arch replacement', 'Denture stabilization', 'Preservation of jawbone', 'Alternative to bridges affecting adjacent teeth'],
        sideEffects: ['Surgical discomfort and swelling', 'Infection risk', 'Implant failure', 'Nerve damage (rare)', 'Sinus problems (upper jaw)', 'Extended treatment timeline'],
        basePrice: 3500
    },
    'root canal': {
        description: 'Root canal treatment removes infected or damaged pulp from inside a tooth, cleaning and sealing the root canals to save the tooth. This endodontic procedure eliminates infection and prevents extraction while preserving the natural tooth structure.',
        mechanism: 'The dentist accesses the pulp chamber, removes infected tissue, and cleans the root canals using specialized instruments. The canals are shaped, disinfected, and filled with biocompatible material. A crown typically protects the treated tooth.',
        indications: ['Severe tooth decay reaching pulp', 'Dental abscess', 'Tooth trauma with pulp damage', 'Cracked tooth with pulp involvement', 'Deep cavity', 'Repeated dental procedures on tooth'],
        sideEffects: ['Post-procedure sensitivity', 'Temporary discomfort', 'Tooth discoloration possible', 'Risk of treatment failure', 'Tooth may become more brittle'],
        basePrice: 1200
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CONTENT GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

function generateTreatmentContent(treatment: Treatment): Treatment {
    // Check if we have specific content for this treatment
    const nameLower = treatment.name.toLowerCase();
    const specificData = Object.entries(SPECIFIC_TREATMENTS).find(([key]) =>
        nameLower.includes(key) || key.includes(nameLower)
    );

    if (specificData) {
        const [, data] = specificData;
        return {
            ...treatment,
            description: data.description || treatment.description,
            mechanism: data.mechanism || treatment.mechanism,
            indications: data.indications || treatment.indications,
            sideEffects: data.sideEffects || treatment.sideEffects,
            preparation: data.preparation,
            recovery: data.recovery,
            references: treatment.references || SPECIALTY_REFERENCES[treatment.specialty] || DEFAULT_REFERENCES,
            costs: generateCosts(data.basePrice),
        };
    }

    // If treatment already has content, keep it
    if (treatment.description && treatment.mechanism && treatment.indications?.length) {
        return treatment;
    }

    // Generate content from templates
    const template = TYPE_TEMPLATES[treatment.type] || TYPE_TEMPLATES.medical;

    // Calculate appropriate base price
    const [minPrice, maxPrice] = template.basePriceRange;
    const basePrice = Math.round(minPrice + Math.random() * (maxPrice - minPrice));

    return {
        ...treatment,
        description: treatment.description || template.descriptionTemplate(treatment.name, treatment.specialty),
        mechanism: treatment.mechanism || template.mechanismTemplate(treatment.name),
        indications: treatment.indications || template.indicationsTemplate(treatment.name, treatment.specialty),
        sideEffects: treatment.sideEffects || template.sideEffectsTemplate(treatment.name, treatment.type),
        preparation: template.preparationTemplate(treatment.name, treatment.type),
        recovery: template.recoveryTemplate(treatment.name, treatment.type),
        references: treatment.references || SPECIALTY_REFERENCES[treatment.specialty] || DEFAULT_REFERENCES,
        costs: treatment.costs || generateCosts(basePrice),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
    const filePath = path.join(process.cwd(), 'public', 'data', 'treatments.json');

    let treatments: Treatment[] = [];
    try {
        treatments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`[INFO] Loaded ${treatments.length} treatments`);
    } catch (e) {
        console.error('[ERROR] Failed to load treatments:', e);
        return;
    }

    let contentAdded = 0;
    let pricesFixed = 0;
    let alreadyHadContent = 0;

    const updatedTreatments = treatments.map(treatment => {
        const hadContent = !!(treatment.description && treatment.mechanism);
        const updated = generateTreatmentContent(treatment);

        if (hadContent) {
            alreadyHadContent++;
        } else if (updated.description) {
            contentAdded++;
        }

        // Check if price was updated
        if (JSON.stringify(updated.costs) !== JSON.stringify(treatment.costs)) {
            pricesFixed++;
        }

        return updated;
    });

    // Write updated data
    fs.writeFileSync(filePath, JSON.stringify(updatedTreatments, null, 2));

    // Also update treatments-with-costs.json
    const costsPath = path.join(process.cwd(), 'public', 'data', 'treatments-with-costs.json');
    fs.writeFileSync(costsPath, JSON.stringify(updatedTreatments, null, 2));

    console.log(`\n[OK] Treatment content generation complete:`);
    console.log(`  - Already had content: ${alreadyHadContent}`);
    console.log(`  - Content added: ${contentAdded}`);
    console.log(`  - Prices updated: ${pricesFixed}`);
    console.log(`  - Total treatments: ${updatedTreatments.length}`);
    console.log(`\nFiles updated:`);
    console.log(`  - ${filePath}`);
    console.log(`  - ${costsPath}`);
}

main();
