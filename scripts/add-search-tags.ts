#!/usr/bin/env npx tsx
/**
 * Add Search Tags to Treatments, Conditions, and Tests
 *
 * Creates comprehensive search tags including:
 * - Simple names / common names
 * - Brand names
 * - Symptoms treated
 * - Related conditions
 * - Alternate spellings
 * - Regional variations
 *
 * Usage: npx tsx scripts/add-search-tags.ts
 */

import fs from 'fs';
import path from 'path';

interface TreatmentEntry {
    name: string;
    simpleName?: string;
    type: string;
    specialty: string;
    brandNames?: string[];
    indications?: string[];
    searchTags?: string[];
    [key: string]: unknown;
}

// Common symptom keywords by treatment type
const SYMPTOM_KEYWORDS: Record<string, string[]> = {
    // Pain medications
    'Ibuprofen': ['headache', 'pain', 'fever', 'inflammation', 'body ache', 'muscle pain', 'joint pain', 'period pain', 'menstrual cramps'],
    'Acetaminophen': ['headache', 'fever', 'pain', 'cold', 'flu', 'body ache', 'toothache'],
    'Aspirin': ['heart attack prevention', 'blood thinner', 'pain', 'fever', 'inflammation', 'stroke prevention'],
    'Naproxen': ['arthritis', 'joint pain', 'muscle pain', 'back pain', 'menstrual cramps', 'inflammation'],

    // Diabetes
    'Metformin': ['diabetes', 'blood sugar', 'type 2 diabetes', 'sugar control', 'PCOS', 'weight loss', 'prediabetes'],
    'Insulin': ['diabetes', 'blood sugar', 'type 1 diabetes', 'type 2 diabetes', 'high sugar'],

    // Blood pressure
    'Lisinopril': ['high blood pressure', 'hypertension', 'heart failure', 'BP', 'blood pressure control'],
    'Amlodipine': ['high blood pressure', 'hypertension', 'chest pain', 'angina', 'BP'],
    'Losartan': ['high blood pressure', 'hypertension', 'kidney protection', 'diabetic nephropathy'],
    'Metoprolol': ['high blood pressure', 'heart rate', 'chest pain', 'heart failure', 'anxiety', 'palpitations'],

    // Cholesterol
    'Atorvastatin': ['cholesterol', 'high cholesterol', 'heart disease prevention', 'lipid', 'triglycerides'],
    'Rosuvastatin': ['cholesterol', 'high cholesterol', 'heart disease', 'lipid control'],
    'Simvastatin': ['cholesterol', 'high cholesterol', 'heart health'],

    // Acid reflux
    'Omeprazole': ['acidity', 'heartburn', 'acid reflux', 'GERD', 'stomach ulcer', 'gastritis', 'indigestion'],
    'Pantoprazole': ['acidity', 'heartburn', 'acid reflux', 'GERD', 'stomach ulcer', 'gastritis'],
    'Ranitidine': ['acidity', 'heartburn', 'stomach ulcer', 'indigestion'],

    // Thyroid
    'Levothyroxine': ['thyroid', 'hypothyroid', 'low thyroid', 'TSH', 'fatigue', 'weight gain', 'thyroid hormone'],

    // Mental health
    'Sertraline': ['depression', 'anxiety', 'panic attacks', 'OCD', 'PTSD', 'social anxiety', 'mood'],
    'Escitalopram': ['depression', 'anxiety', 'panic', 'mood disorder', 'stress'],
    'Fluoxetine': ['depression', 'anxiety', 'OCD', 'bulimia', 'panic disorder', 'mood'],
    'Alprazolam': ['anxiety', 'panic attacks', 'nervousness', 'stress', 'insomnia'],
    'Lorazepam': ['anxiety', 'panic', 'insomnia', 'seizures', 'stress'],

    // Allergy
    'Cetirizine': ['allergy', 'allergies', 'hay fever', 'itching', 'hives', 'sneezing', 'runny nose', 'allergic rhinitis'],
    'Loratadine': ['allergy', 'allergies', 'hay fever', 'itching', 'hives', 'sneezing', 'allergic reaction'],
    'Diphenhydramine': ['allergy', 'sleep', 'insomnia', 'itching', 'cold symptoms', 'motion sickness'],
    'Montelukast': ['asthma', 'allergies', 'breathing', 'wheezing', 'allergic rhinitis'],

    // Antibiotics
    'Amoxicillin': ['infection', 'bacterial infection', 'throat infection', 'ear infection', 'UTI', 'bronchitis', 'pneumonia'],
    'Azithromycin': ['infection', 'bacterial infection', 'respiratory infection', 'bronchitis', 'pneumonia', 'STD'],
    'Ciprofloxacin': ['infection', 'UTI', 'urinary infection', 'bacterial infection', 'travelers diarrhea'],
    'Doxycycline': ['infection', 'acne', 'malaria prevention', 'bacterial infection', 'Lyme disease'],

    // Sleep
    'Zolpidem': ['insomnia', 'sleep', 'trouble sleeping', 'cant sleep', 'sleep disorder'],
    'Melatonin': ['sleep', 'insomnia', 'jet lag', 'sleep cycle', 'natural sleep'],
    'Trazodone': ['insomnia', 'depression', 'anxiety', 'sleep', 'mood'],

    // Erectile dysfunction
    'Sildenafil': ['erectile dysfunction', 'ED', 'impotence', 'sexual health', 'erection problems'],
    'Tadalafil': ['erectile dysfunction', 'ED', 'impotence', 'BPH', 'prostate', 'sexual health'],

    // Asthma
    'Albuterol': ['asthma', 'breathing', 'wheezing', 'bronchospasm', 'COPD', 'shortness of breath', 'rescue inhaler'],
    'Fluticasone': ['asthma', 'allergies', 'nasal congestion', 'breathing', 'inflammation'],

    // Pain - stronger
    'Tramadol': ['severe pain', 'chronic pain', 'back pain', 'nerve pain', 'post surgery pain'],
    'Gabapentin': ['nerve pain', 'neuropathy', 'seizures', 'diabetic nerve pain', 'shingles pain', 'fibromyalgia'],
    'Pregabalin': ['nerve pain', 'fibromyalgia', 'anxiety', 'seizures', 'diabetic neuropathy'],

    // Muscle relaxers
    'Cyclobenzaprine': ['muscle spasm', 'muscle pain', 'back pain', 'neck pain', 'muscle relaxer'],

    // Blood thinners
    'Warfarin': ['blood clots', 'DVT', 'stroke prevention', 'atrial fibrillation', 'blood thinner', 'anticoagulant'],
    'Clopidogrel': ['blood clots', 'heart attack prevention', 'stroke prevention', 'blood thinner', 'stent'],

    // Prostate
    'Tamsulosin': ['prostate', 'BPH', 'urination problems', 'enlarged prostate', 'difficulty urinating'],
    'Finasteride': ['prostate', 'BPH', 'hair loss', 'enlarged prostate', 'male pattern baldness'],
};

// Surgical procedure keywords
const SURGERY_KEYWORDS: Record<string, string[]> = {
    'Appendectomy': ['appendix', 'appendicitis', 'stomach pain', 'abdominal pain', 'appendix removal'],
    'Cholecystectomy': ['gallbladder', 'gallstones', 'gallbladder removal', 'bile duct', 'abdominal pain'],
    'Hysterectomy': ['uterus removal', 'fibroids', 'heavy bleeding', 'uterine cancer', 'endometriosis'],
    'Cesarean Section': ['c-section', 'baby delivery', 'pregnancy', 'childbirth', 'cesarean delivery'],
    'Cataract Surgery': ['cataract', 'cloudy vision', 'blurry vision', 'eye surgery', 'vision loss'],
    'LASIK': ['eye surgery', 'vision correction', 'glasses removal', 'nearsighted', 'farsighted', 'astigmatism'],
    'Knee Replacement': ['knee pain', 'arthritis', 'knee surgery', 'joint replacement', 'knee osteoarthritis'],
    'Hip Replacement': ['hip pain', 'arthritis', 'hip surgery', 'joint replacement', 'hip osteoarthritis'],
    'Coronary Artery Bypass': ['heart bypass', 'CABG', 'blocked arteries', 'heart surgery', 'chest pain', 'angina'],
    'Angioplasty': ['heart stent', 'blocked arteries', 'chest pain', 'heart attack', 'coronary artery'],
    'Colonoscopy': ['colon cancer screening', 'bowel problems', 'rectal bleeding', 'digestive issues'],
    'Endoscopy': ['stomach problems', 'GERD', 'ulcer', 'digestive issues', 'swallowing problems'],
    'Hernia Repair': ['hernia', 'bulge', 'groin pain', 'abdominal bulge', 'inguinal hernia'],
    'Tonsillectomy': ['tonsils', 'sore throat', 'tonsillitis', 'sleep apnea', 'snoring'],
    'Vasectomy': ['male sterilization', 'birth control', 'permanent contraception', 'no more kids'],
    'Tubal Ligation': ['tubes tied', 'female sterilization', 'permanent birth control', 'no more kids'],
    'Gastric Bypass': ['weight loss surgery', 'obesity', 'bariatric', 'stomach surgery'],
    'Gastric Sleeve': ['weight loss surgery', 'obesity', 'bariatric', 'stomach reduction'],
    'Liposuction': ['fat removal', 'body contouring', 'cosmetic surgery', 'stubborn fat'],
    'Rhinoplasty': ['nose job', 'nose surgery', 'cosmetic surgery', 'nose reshaping', 'deviated septum'],
    'Breast Augmentation': ['breast implants', 'breast enlargement', 'cosmetic surgery', 'boob job'],
    'Mammoplasty': ['breast surgery', 'breast reduction', 'breast lift', 'cosmetic surgery'],
    'Spinal Fusion': ['back surgery', 'spine surgery', 'back pain', 'herniated disc', 'scoliosis'],
    'Laminectomy': ['back surgery', 'spinal stenosis', 'back pain', 'nerve compression'],
    'ACL Reconstruction': ['knee ligament', 'sports injury', 'knee surgery', 'ACL tear', 'torn ACL'],
    'Rotator Cuff Repair': ['shoulder surgery', 'shoulder pain', 'rotator cuff tear', 'arm weakness'],
    'Carpal Tunnel Release': ['carpal tunnel', 'wrist pain', 'hand numbness', 'tingling fingers'],
};

// Type-based keywords
const TYPE_KEYWORDS: Record<string, string[]> = {
    'surgical': ['surgery', 'operation', 'procedure', 'hospital'],
    'drug': ['medication', 'medicine', 'pill', 'tablet', 'capsule', 'prescription'],
    'prescription': ['prescription', 'Rx', 'doctor prescribed', 'medicine'],
    'otc': ['over the counter', 'OTC', 'no prescription', 'pharmacy', 'drugstore'],
    'injection': ['injection', 'shot', 'injectable', 'needle', 'vaccine'],
    'therapy': ['therapy', 'rehabilitation', 'recovery', 'treatment'],
    'home_remedy': ['natural', 'home remedy', 'herbal', 'traditional', 'ayurvedic', 'home treatment'],
    'medical': ['treatment', 'medical', 'healthcare'],
};

// Specialty-based keywords
const SPECIALTY_KEYWORDS: Record<string, string[]> = {
    'Cardiology': ['heart', 'cardiac', 'cardiovascular', 'chest pain', 'blood pressure'],
    'Dermatology': ['skin', 'rash', 'acne', 'eczema', 'psoriasis', 'derma'],
    'Gastroenterology': ['stomach', 'digestive', 'gut', 'bowel', 'liver', 'gastro'],
    'Neurology': ['brain', 'nerve', 'headache', 'migraine', 'seizure', 'neuro'],
    'Orthopedics': ['bone', 'joint', 'muscle', 'fracture', 'spine', 'ortho'],
    'Psychiatry': ['mental health', 'depression', 'anxiety', 'mood', 'psychiatric'],
    'Pulmonology': ['lung', 'breathing', 'respiratory', 'asthma', 'COPD', 'pulmonary'],
    'Endocrinology': ['hormone', 'thyroid', 'diabetes', 'endocrine', 'metabolic'],
    'Oncology': ['cancer', 'tumor', 'chemotherapy', 'radiation', 'oncology'],
    'Nephrology': ['kidney', 'renal', 'dialysis', 'nephro'],
    'Urology': ['urinary', 'bladder', 'prostate', 'kidney stones', 'UTI'],
    'Gynecology': ['women health', 'menstrual', 'pregnancy', 'ovary', 'uterus', 'gynec'],
    'Ophthalmology': ['eye', 'vision', 'cataract', 'glaucoma', 'ophthal'],
    'ENT': ['ear', 'nose', 'throat', 'sinus', 'hearing', 'ENT'],
    'Rheumatology': ['arthritis', 'autoimmune', 'joint pain', 'lupus', 'rheuma'],
    'Pediatrics': ['child', 'baby', 'infant', 'kids', 'pediatric', 'children'],
    'General': ['general', 'common', 'primary care', 'family medicine'],
};

// Common misspellings / alternate spellings
const ALTERNATE_SPELLINGS: Record<string, string[]> = {
    'Paracetamol': ['paracetamol', 'acetaminophen', 'tylenol'],
    'Acetaminophen': ['acetaminophen', 'paracetamol', 'tylenol'],
    'Ibuprofen': ['ibuprofen', 'advil', 'motrin', 'brufen'],
    'Aspirin': ['aspirin', 'disprin', 'ecosprin'],
    'Omeprazole': ['omeprazole', 'prilosec', 'omez'],
    'Metformin': ['metformin', 'glucophage', 'glycomet'],
    'Atorvastatin': ['atorvastatin', 'lipitor', 'atorva'],
    'Amlodipine': ['amlodipine', 'norvasc', 'amlod'],
    'Cetirizine': ['cetirizine', 'zyrtec', 'cetzine'],
    'Azithromycin': ['azithromycin', 'zithromax', 'zpack', 'z-pack', 'azithral'],
    'Amoxicillin': ['amoxicillin', 'amoxil', 'mox'],
    'Pantoprazole': ['pantoprazole', 'protonix', 'pantop'],
    'Levothyroxine': ['levothyroxine', 'synthroid', 'thyronorm', 'eltroxin'],
    'Losartan': ['losartan', 'cozaar', 'losar'],
    'Gabapentin': ['gabapentin', 'neurontin', 'gabantin'],
    'Sertraline': ['sertraline', 'zoloft', 'serlift'],
    'Escitalopram': ['escitalopram', 'lexapro', 'cipralex'],
    'Metoprolol': ['metoprolol', 'lopressor', 'betaloc'],
    'Lisinopril': ['lisinopril', 'zestril', 'prinivil'],
    'Montelukast': ['montelukast', 'singulair', 'montair'],
    'Fluoxetine': ['fluoxetine', 'prozac', 'fludac'],
    'Alprazolam': ['alprazolam', 'xanax', 'alprax'],
    'Sildenafil': ['sildenafil', 'viagra', 'vigora'],
    'Tadalafil': ['tadalafil', 'cialis', 'tadacip'],
    'Warfarin': ['warfarin', 'coumadin', 'warf'],
    'Clopidogrel': ['clopidogrel', 'plavix', 'clopilet'],
    'Rosuvastatin': ['rosuvastatin', 'crestor', 'rosuvas'],
    'Pregabalin': ['pregabalin', 'lyrica', 'pregalin'],
    'Tramadol': ['tramadol', 'ultram', 'tramazac'],
    'Cyclobenzaprine': ['cyclobenzaprine', 'flexeril', 'flexura'],
    'Zolpidem': ['zolpidem', 'ambien', 'zolfresh'],
    'Tamsulosin': ['tamsulosin', 'flomax', 'urimax'],
    'Finasteride': ['finasteride', 'propecia', 'proscar', 'finax'],
};

function generateSearchTags(treatment: TreatmentEntry): string[] {
    const tags = new Set<string>();
    const name = treatment.name;
    const lowerName = name.toLowerCase();

    // 1. Add simple name if exists
    if (treatment.simpleName) {
        tags.add(treatment.simpleName.toLowerCase());
        // Extract keywords from simple name
        treatment.simpleName.split(/[\s\-\/\(\)]+/).forEach(word => {
            if (word.length > 2) tags.add(word.toLowerCase());
        });
    }

    // 2. Add brand names
    if (treatment.brandNames) {
        treatment.brandNames.forEach(brand => {
            tags.add(brand.toLowerCase());
        });
    }

    // 3. Add symptom keywords
    if (SYMPTOM_KEYWORDS[name]) {
        SYMPTOM_KEYWORDS[name].forEach(symptom => tags.add(symptom.toLowerCase()));
    }

    // 4. Add surgery keywords
    if (SURGERY_KEYWORDS[name]) {
        SURGERY_KEYWORDS[name].forEach(keyword => tags.add(keyword.toLowerCase()));
    }

    // 5. Add type keywords
    if (treatment.type && TYPE_KEYWORDS[treatment.type]) {
        TYPE_KEYWORDS[treatment.type].forEach(keyword => tags.add(keyword.toLowerCase()));
    }

    // 6. Add specialty keywords
    if (treatment.specialty) {
        const normalizedSpec = treatment.specialty.replace(/\s+/g, '');
        Object.entries(SPECIALTY_KEYWORDS).forEach(([spec, keywords]) => {
            if (treatment.specialty?.toLowerCase().includes(spec.toLowerCase()) ||
                spec.toLowerCase().includes(treatment.specialty?.toLowerCase() || '')) {
                keywords.forEach(keyword => tags.add(keyword.toLowerCase()));
            }
        });
    }

    // 7. Add alternate spellings
    if (ALTERNATE_SPELLINGS[name]) {
        ALTERNATE_SPELLINGS[name].forEach(alt => tags.add(alt.toLowerCase()));
    }

    // 8. Add indications as tags
    if (treatment.indications) {
        treatment.indications.forEach(ind => {
            // Extract key terms from indications
            const words = ind.toLowerCase().split(/[\s,\-\/]+/);
            words.forEach(word => {
                if (word.length > 3) tags.add(word);
            });
            // Also add full indication
            tags.add(ind.toLowerCase());
        });
    }

    // 9. Add the treatment name words
    name.split(/[\s\-\/\(\)]+/).forEach(word => {
        if (word.length > 2) tags.add(word.toLowerCase());
    });

    // Remove the exact treatment name to avoid redundancy
    tags.delete(lowerName);

    return Array.from(tags).filter(tag => tag.length > 1);
}

async function main() {
    console.log('============================================================');
    console.log('ADDING SEARCH TAGS TO ALL CONTENT');
    console.log('============================================================\n');

    // ─────────────────────────────────────────────────────────────
    // 1. UPDATE TREATMENTS
    // ─────────────────────────────────────────────────────────────
    console.log('Processing treatments...\n');

    const treatmentsPath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    let treatments: TreatmentEntry[];
    try {
        treatments = JSON.parse(fs.readFileSync(treatmentsPath, 'utf-8'));
        console.log(`  Loaded ${treatments.length} treatments`);
    } catch (error) {
        console.error('Failed to load treatments.json:', error);
        process.exit(1);
    }

    let tagsAdded = 0;
    let totalTags = 0;

    for (const treatment of treatments) {
        const tags = generateSearchTags(treatment);
        if (tags.length > 0) {
            treatment.searchTags = tags;
            tagsAdded++;
            totalTags += tags.length;
        }
    }

    // Save updated treatments
    fs.writeFileSync(treatmentsPath, JSON.stringify(treatments, null, 2));
    console.log(`  ✅ Updated treatments.json`);
    console.log(`     - Treatments with tags: ${tagsAdded}`);
    console.log(`     - Total tags added: ${totalTags}`);
    console.log(`     - Avg tags per treatment: ${(totalTags / tagsAdded).toFixed(1)}`);

    // Update all translated treatment files
    const langCodes = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'ar', 'es', 'fr', 'pt', 'de'];

    console.log('\n  Updating translated files...');
    for (const lang of langCodes) {
        const langPath = path.join(process.cwd(), 'public', 'data', `treatments-${lang}.json`);
        if (fs.existsSync(langPath)) {
            try {
                const langTreatments: TreatmentEntry[] = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
                for (let i = 0; i < langTreatments.length && i < treatments.length; i++) {
                    if (treatments[i].searchTags) {
                        langTreatments[i].searchTags = treatments[i].searchTags;
                    }
                }
                fs.writeFileSync(langPath, JSON.stringify(langTreatments, null, 2));
                console.log(`  ✅ Updated treatments-${lang}.json`);
            } catch (error) {
                console.error(`  ❌ Failed to update treatments-${lang}.json:`, error);
            }
        }
    }

    console.log('\n============================================================');
    console.log('SEARCH TAGS COMPLETE');
    console.log('============================================================');
    console.log('\nNext step: Update the search API to search by tags.');
}

main().catch(console.error);
