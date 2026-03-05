/**
 * Fix Treatment Prices and Add Detailed Content
 *
 * This script:
 * 1. Maps common treatments to realistic price ranges
 * 2. Adds detailed descriptions for treatments
 * 3. Adds medical references
 * 4. Properly categorizes OTC vs prescription
 */

import * as fs from 'fs';
import * as path from 'path';

interface TreatmentCost {
    usd: number;
    currency: string;
    range?: [number, number];
}

interface Treatment {
    name: string;
    type: 'medical' | 'surgical' | 'otc' | 'home_remedy' | 'therapy' | 'drug' | 'injection' | 'prescription';
    specialty: string;
    description?: string;
    mechanism?: string;
    indications?: string[];
    sideEffects?: string[];
    references?: { title: string; url: string }[];
    costs?: {
        usa: TreatmentCost;
        uk: TreatmentCost;
        india: TreatmentCost;
        thailand: TreatmentCost;
        mexico: TreatmentCost;
        turkey: TreatmentCost;
        uae: TreatmentCost;
    };
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// REALISTIC PRICE MAPPINGS BY TREATMENT NAME (USD base prices)
// ═══════════════════════════════════════════════════════════════════════════

const TREATMENT_PRICES: Record<string, number> = {
    // Common OTC / Generic medications
    'nsaids': 15,
    'ibuprofen': 12,
    'aspirin': 8,
    'acetaminophen': 10,
    'paracetamol': 10,
    'antacids': 12,
    'antihistamines': 15,
    'cough syrup': 12,
    'eye drops': 15,
    'nasal spray': 18,
    'sunscreen': 15,
    'moisturizer': 20,
    'bandages': 8,
    'antiseptic': 10,

    // Physical therapies
    'physical therapy': 150,
    'physiotherapy': 150,
    'occupational therapy': 180,
    'speech therapy': 200,
    'cognitive behavioral therapy': 200,
    'massage therapy': 80,
    'chiropractic care': 75,
    'acupuncture': 90,
    'hydrotherapy': 120,

    // Prescription medications (monthly cost)
    'muscle relaxants': 45,
    'antibiotics': 35,
    'antidepressants': 60,
    'blood pressure medication': 40,
    'cholesterol medication': 50,
    'diabetes medication': 80,
    'thyroid medication': 25,
    'pain medication': 55,
    'anti-anxiety medication': 50,
    'sleep medication': 40,
    'birth control pills': 30,
    'hormone therapy': 120,

    // Injections
    'spinal injections': 1500,
    'cortisone injection': 350,
    'steroid injection': 400,
    'botox': 500,
    'fillers': 700,
    'prp injection': 900,
    'epidural injection': 2000,
    'nerve block': 1200,
    'joint injection': 450,
    'trigger point injection': 300,
    'insulin': 350,
    'b12 injection': 30,

    // Surgical procedures
    'appendectomy': 15000,
    'hernia repair': 12000,
    'gallbladder surgery': 18000,
    'knee replacement': 45000,
    'hip replacement': 48000,
    'cataract surgery': 4500,
    'lasik': 4000,
    'rhinoplasty': 8000,
    'tonsillectomy': 5500,
    'c-section': 15000,
    'hysterectomy': 20000,
    'colonoscopy': 3500,
    'endoscopy': 2500,
    'biopsy': 2000,
    'mri scan': 1200,
    'ct scan': 800,
    'x-ray': 150,
    'ultrasound': 300,
    'mammogram': 250,
    'blood test': 50,
    'cardiac catheterization': 25000,
    'angioplasty': 35000,
    'bypass surgery': 85000,
    'pacemaker': 40000,
    'spinal fusion': 85000,
    'disc surgery': 35000,
    'acl surgery': 25000,
    'rotator cuff repair': 20000,
    'carpal tunnel surgery': 5000,
    'dental implant': 3500,
    'root canal': 1200,
    'wisdom tooth extraction': 500,
    'dental crown': 1500,
    'liposuction': 6000,
    'breast augmentation': 8000,
    'facelift': 12000,
    'tummy tuck': 10000,
    'hair transplant': 8000,
    'ivf': 15000,
    'vasectomy': 1500,
    'tubal ligation': 4500,
    'circumcision': 2500,
    'prostate surgery': 25000,
    'kidney stone removal': 8000,
    'dialysis': 500,
    'chemotherapy': 12000,
    'radiation therapy': 15000,
    'immunotherapy': 25000,
    'stem cell therapy': 50000,
    'organ transplant': 400000,
    'heart transplant': 1200000,
    'liver transplant': 750000,
    'kidney transplant': 350000,
};

// ═══════════════════════════════════════════════════════════════════════════
// TREATMENT DESCRIPTIONS AND REFERENCES
// ═══════════════════════════════════════════════════════════════════════════

interface TreatmentContent {
    description: string;
    mechanism?: string;
    indications?: string[];
    sideEffects?: string[];
    references?: { title: string; url: string }[];
}

const TREATMENT_CONTENT: Record<string, TreatmentContent> = {
    'physical therapy': {
        description: 'Physical therapy (PT) is a healthcare specialty focused on restoring movement and function through exercise, manual therapy, and patient education. It helps patients recover from injuries, surgeries, and chronic conditions affecting mobility.',
        mechanism: 'PT works by strengthening muscles, improving flexibility, reducing pain through targeted exercises, and teaching proper movement patterns to prevent re-injury.',
        indications: [
            'Post-surgical rehabilitation',
            'Sports injuries and sprains',
            'Chronic back or neck pain',
            'Arthritis and joint conditions',
            'Stroke recovery',
            'Balance disorders'
        ],
        sideEffects: [
            'Temporary muscle soreness',
            'Mild fatigue after sessions',
            'Occasional swelling (usually resolves quickly)'
        ],
        references: [
            { title: 'American Physical Therapy Association', url: 'https://www.apta.org' },
            { title: 'Physical Therapy Guidelines - NCBI', url: 'https://www.ncbi.nlm.nih.gov/books/NBK559574/' }
        ]
    },
    'nsaids': {
        description: 'Non-steroidal anti-inflammatory drugs (NSAIDs) are medications that reduce pain, fever, and inflammation. Common examples include ibuprofen (Advil, Motrin), naproxen (Aleve), and aspirin.',
        mechanism: 'NSAIDs work by blocking cyclooxygenase (COX) enzymes, which reduces the production of prostaglandins - chemicals that cause inflammation, pain, and fever.',
        indications: [
            'Mild to moderate pain relief',
            'Headaches and migraines',
            'Menstrual cramps',
            'Arthritis and joint pain',
            'Muscle aches and sprains',
            'Fever reduction'
        ],
        sideEffects: [
            'Stomach upset and heartburn',
            'Increased bleeding risk',
            'Kidney problems with long-term use',
            'Cardiovascular risks in high doses',
            'Allergic reactions (rare)'
        ],
        references: [
            { title: 'NSAIDs - MedlinePlus', url: 'https://medlineplus.gov/druginfo/meds/a682159.html' },
            { title: 'NSAID Safety - FDA', url: 'https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/nonsteroidal-anti-inflammatory-drugs-nsaids' }
        ]
    },
    'muscle relaxants': {
        description: 'Muscle relaxants are medications prescribed to relieve muscle spasms, stiffness, and pain. They are often used short-term alongside physical therapy and rest for acute musculoskeletal conditions.',
        mechanism: 'Most muscle relaxants work centrally in the brain and spinal cord to reduce muscle tone and spasm signals, rather than directly on muscles.',
        indications: [
            'Acute muscle spasms',
            'Back pain with muscle tension',
            'Neck pain and stiffness',
            'Fibromyalgia',
            'Multiple sclerosis spasticity',
            'Post-injury muscle guarding'
        ],
        sideEffects: [
            'Drowsiness and sedation',
            'Dizziness',
            'Dry mouth',
            'Potential for dependence',
            'Should not be combined with alcohol'
        ],
        references: [
            { title: 'Muscle Relaxants - AAFP', url: 'https://www.aafp.org/pubs/afp/issues/2008/0815/p453.html' },
            { title: 'Skeletal Muscle Relaxants - StatPearls', url: 'https://www.ncbi.nlm.nih.gov/books/NBK537158/' }
        ]
    },
    'spinal injections': {
        description: 'Spinal injections are minimally invasive procedures where medication (usually corticosteroids and local anesthetic) is injected into or around the spine to reduce inflammation and pain.',
        mechanism: 'Corticosteroids reduce inflammation around compressed nerves, while local anesthetics provide immediate pain relief. The combined effect can last weeks to months.',
        indications: [
            'Herniated disc pain',
            'Sciatica',
            'Spinal stenosis',
            'Degenerative disc disease',
            'Failed back surgery syndrome',
            'Chronic low back pain'
        ],
        sideEffects: [
            'Temporary pain at injection site',
            'Headache (with some techniques)',
            'Temporary leg weakness',
            'Infection (rare)',
            'Nerve damage (very rare)'
        ],
        references: [
            { title: 'Epidural Steroid Injections - Spine-health', url: 'https://www.spine-health.com/treatment/injections/epidural-steroid-injections' },
            { title: 'Spinal Injections - AAOS', url: 'https://orthoinfo.aaos.org/en/treatment/spinal-injections/' }
        ]
    },
    'cognitive behavioral therapy': {
        description: 'Cognitive Behavioral Therapy (CBT) is a structured, evidence-based psychotherapy that helps patients identify and change negative thought patterns and behaviors that contribute to mental health problems.',
        mechanism: 'CBT works by teaching patients to recognize distorted thinking, challenge negative beliefs, and develop healthier coping strategies through structured exercises and homework.',
        indications: [
            'Depression',
            'Anxiety disorders',
            'PTSD and trauma',
            'OCD',
            'Eating disorders',
            'Insomnia',
            'Chronic pain management',
            'Substance use disorders'
        ],
        sideEffects: [
            'Temporary emotional discomfort when confronting issues',
            'Requires active participation and homework',
            'Not a quick fix - typically 12-20 sessions'
        ],
        references: [
            { title: 'Cognitive Behavioral Therapy - APA', url: 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral' },
            { title: 'CBT Evidence Base - NCBI', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3584580/' }
        ]
    },
    'cortisone injection': {
        description: 'Cortisone injections deliver powerful anti-inflammatory corticosteroid medication directly into joints, tendons, or soft tissues to reduce inflammation and pain.',
        mechanism: 'Corticosteroids suppress the immune response and reduce the production of inflammatory chemicals, providing rapid relief from swelling and pain.',
        indications: [
            'Joint arthritis',
            'Bursitis',
            'Tendinitis',
            'Carpal tunnel syndrome',
            'Tennis elbow',
            'Plantar fasciitis',
            'Frozen shoulder'
        ],
        sideEffects: [
            'Temporary pain flare (1-2 days)',
            'Skin lightening at injection site',
            'Facial flushing',
            'Elevated blood sugar (diabetics)',
            'Tendon weakening with repeated injections'
        ],
        references: [
            { title: 'Cortisone Shots - Mayo Clinic', url: 'https://www.mayoclinic.org/tests-procedures/cortisone-shots/about/pac-20384794' },
            { title: 'Corticosteroid Injections - AAOS', url: 'https://orthoinfo.aaos.org/en/treatment/cortisone-shots-steroid-injections/' }
        ]
    },
    'acupuncture': {
        description: 'Acupuncture is a traditional Chinese medicine practice involving the insertion of thin needles into specific points on the body to balance energy flow and promote healing.',
        mechanism: 'Modern research suggests acupuncture may stimulate nerves, muscles, and connective tissue, triggering the body\'s natural painkillers and increasing blood flow.',
        indications: [
            'Chronic pain conditions',
            'Headaches and migraines',
            'Lower back pain',
            'Osteoarthritis',
            'Nausea (chemotherapy, pregnancy)',
            'Stress and anxiety'
        ],
        sideEffects: [
            'Mild soreness at needle sites',
            'Minor bleeding or bruising',
            'Temporary fatigue',
            'Dizziness (rare)'
        ],
        references: [
            { title: 'Acupuncture - NCCIH', url: 'https://www.nccih.nih.gov/health/acupuncture-in-depth' },
            { title: 'Acupuncture Evidence - Cochrane', url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD001218.pub3/full' }
        ]
    },
    'knee replacement': {
        description: 'Total knee replacement (arthroplasty) is a surgical procedure to resurface a knee damaged by arthritis or injury with metal and plastic components, relieving pain and restoring function.',
        mechanism: 'The damaged bone and cartilage surfaces are removed and replaced with prosthetic components that recreate the smooth gliding surfaces of a healthy knee.',
        indications: [
            'Severe osteoarthritis',
            'Rheumatoid arthritis',
            'Post-traumatic arthritis',
            'Failed conservative treatments',
            'Significant functional limitation',
            'Chronic knee pain affecting quality of life'
        ],
        sideEffects: [
            'Blood clots (DVT risk)',
            'Infection',
            'Implant loosening over time',
            'Stiffness',
            'Nerve damage (rare)',
            'Requires 3-6 months rehabilitation'
        ],
        references: [
            { title: 'Total Knee Replacement - AAOS', url: 'https://orthoinfo.aaos.org/en/treatment/total-knee-replacement/' },
            { title: 'Knee Replacement Outcomes - NCBI', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6371679/' }
        ]
    },
    'cataract surgery': {
        description: 'Cataract surgery is a procedure to remove the clouded natural lens of the eye and replace it with an artificial intraocular lens (IOL) to restore clear vision.',
        mechanism: 'Using phacoemulsification, ultrasound waves break up the clouded lens which is then suctioned out. A foldable artificial lens is inserted through a tiny incision.',
        indications: [
            'Cloudy or blurred vision from cataracts',
            'Difficulty driving at night',
            'Colors appearing faded',
            'Double vision in one eye',
            'Frequent prescription changes',
            'Visual impairment affecting daily activities'
        ],
        sideEffects: [
            'Temporary blurry vision',
            'Dry eyes',
            'Light sensitivity',
            'Posterior capsule opacification (treatable)',
            'Infection (rare)',
            'Retinal detachment (very rare)'
        ],
        references: [
            { title: 'Cataract Surgery - AAO', url: 'https://www.aao.org/eye-health/diseases/what-is-cataract-surgery' },
            { title: 'Cataract Surgery Safety - NEI', url: 'https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/cataracts' }
        ]
    },
    'chemotherapy': {
        description: 'Chemotherapy uses powerful drugs to destroy rapidly dividing cancer cells throughout the body. It may be used alone or combined with surgery, radiation, or other treatments.',
        mechanism: 'Chemotherapy drugs target cells that divide rapidly, disrupting DNA replication and cell division. Since cancer cells divide faster than most normal cells, they are more susceptible.',
        indications: [
            'Various types of cancer',
            'Shrinking tumors before surgery (neoadjuvant)',
            'Destroying remaining cells after surgery (adjuvant)',
            'Controlling advanced cancer',
            'Preparing for stem cell transplant'
        ],
        sideEffects: [
            'Nausea and vomiting',
            'Hair loss',
            'Fatigue',
            'Increased infection risk',
            'Anemia',
            'Neuropathy',
            'Mouth sores',
            'Fertility effects'
        ],
        references: [
            { title: 'Chemotherapy - American Cancer Society', url: 'https://www.cancer.org/treatment/treatments-and-side-effects/treatment-types/chemotherapy.html' },
            { title: 'Chemotherapy Side Effects - NCI', url: 'https://www.cancer.gov/about-cancer/treatment/types/chemotherapy/side-effects' }
        ]
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// COST MULTIPLIERS BY COUNTRY
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
            range: [
                Math.round(localPrice * (1 - variance)),
                Math.round(localPrice * (1 + variance))
            ] as [number, number]
        };
    }

    return costs as Treatment['costs'];
}

function findBasePrice(treatment: Treatment): number {
    const nameLower = treatment.name.toLowerCase();

    // Check for exact or partial match in price mapping
    for (const [key, price] of Object.entries(TREATMENT_PRICES)) {
        if (nameLower.includes(key) || key.includes(nameLower)) {
            return price;
        }
    }

    // Fallback based on type with more realistic defaults
    switch (treatment.type) {
        case 'surgical':
            return 15000;
        case 'injection':
            return 500;
        case 'therapy':
            return 150;
        case 'drug':
        case 'prescription':
            return 80;
        case 'medical':
            return 100;
        case 'otc':
            return 20;
        case 'home_remedy':
            return 10;
        default:
            return 50;
    }
}

function getContent(treatment: Treatment): TreatmentContent | undefined {
    const nameLower = treatment.name.toLowerCase();

    for (const [key, content] of Object.entries(TREATMENT_CONTENT)) {
        if (nameLower.includes(key) || key.includes(nameLower)) {
            return content;
        }
    }

    return undefined;
}

async function fixTreatmentPrices() {
    const filePath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    let treatments: Treatment[] = [];

    try {
        treatments = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`Loaded ${treatments.length} treatments`);
    } catch (e) {
        console.error('Failed to load treatments:', e);
        return;
    }

    let pricesFixed = 0;
    let contentAdded = 0;

    const updatedTreatments = treatments.map(treatment => {
        // Fix price
        const basePrice = findBasePrice(treatment);
        const oldPrice = treatment.costs?.usa?.usd;

        if (!oldPrice || Math.abs(oldPrice - basePrice) > 10) {
            treatment.costs = generateCosts(basePrice);
            pricesFixed++;
        }

        // Add content if available
        const content = getContent(treatment);
        if (content) {
            treatment.description = content.description;
            if (content.mechanism) treatment.mechanism = content.mechanism;
            if (content.indications) treatment.indications = content.indications;
            if (content.sideEffects) treatment.sideEffects = content.sideEffects;
            if (content.references) treatment.references = content.references;
            contentAdded++;
        }

        // Fix OTC categorization
        const otcMeds = ['nsaids', 'ibuprofen', 'aspirin', 'acetaminophen', 'paracetamol', 'antacids', 'antihistamines', 'cough', 'cold medicine'];
        const nameLower = treatment.name.toLowerCase();

        if (otcMeds.some(med => nameLower.includes(med))) {
            treatment.type = 'otc';
            treatment.requiresPrescription = false;
        }

        return treatment;
    });

    // Write updated file
    fs.writeFileSync(filePath, JSON.stringify(updatedTreatments, null, 2));

    // Also update treatments-with-costs.json
    const costsPath = path.join(process.cwd(), 'public', 'data', 'treatments-with-costs.json');
    fs.writeFileSync(costsPath, JSON.stringify(updatedTreatments, null, 2));

    console.log(`\n[OK] Treatment data fixed:`);
    console.log(`  - Prices corrected: ${pricesFixed}`);
    console.log(`  - Content added: ${contentAdded}`);
    console.log(`  - Total treatments: ${updatedTreatments.length}`);
}

fixTreatmentPrices();
