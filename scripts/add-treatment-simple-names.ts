#!/usr/bin/env npx ts-node
/**
 * Add Simple Names to Treatments
 *
 * This script adds user-friendly, common names alongside technical medical names
 * to make treatments easier to search for by patients.
 *
 * Usage: npx ts-node scripts/add-treatment-simple-names.ts
 */

import fs from 'fs';
import path from 'path';

interface TreatmentEntry {
    name: string;
    simpleName?: string;
    type: string;
    specialty: string;
    [key: string]: unknown;
}

// Mapping of medical/technical names to simple/common names
const SIMPLE_NAME_MAPPINGS: Record<string, string> = {
    // Medications - Generic to Brand/Common
    'Metformin': 'Diabetes Pill (Metformin)',
    'Atorvastatin': 'Cholesterol Medication (Lipitor)',
    'Lisinopril': 'Blood Pressure Pill (Lisinopril)',
    'Amlodipine': 'Blood Pressure Medication',
    'Omeprazole': 'Heartburn/Acid Reflux Pill (Prilosec)',
    'Pantoprazole': 'Acid Reflux Medication',
    'Levothyroxine': 'Thyroid Medication',
    'Gabapentin': 'Nerve Pain Medication',
    'Losartan': 'Blood Pressure Medication',
    'Hydrochlorothiazide': 'Water Pill (Diuretic)',
    'Furosemide': 'Water Pill (Lasix)',
    'Simvastatin': 'Cholesterol Medication (Zocor)',
    'Rosuvastatin': 'Cholesterol Medication (Crestor)',
    'Prednisone': 'Steroid Anti-inflammatory',
    'Prednisolone': 'Steroid Medication',
    'Azithromycin': 'Z-Pack Antibiotic',
    'Amoxicillin': 'Penicillin Antibiotic',
    'Ciprofloxacin': 'Antibiotic (Cipro)',
    'Doxycycline': 'Antibiotic',
    'Cetirizine': 'Allergy Medication (Zyrtec)',
    'Loratadine': 'Allergy Medication (Claritin)',
    'Diphenhydramine': 'Allergy/Sleep Aid (Benadryl)',
    'Ibuprofen': 'Pain Reliever (Advil/Motrin)',
    'Acetaminophen': 'Pain Reliever (Tylenol)',
    'Naproxen': 'Pain Reliever (Aleve)',
    'Aspirin': 'Blood Thinner/Pain Reliever',
    'Warfarin': 'Blood Thinner (Coumadin)',
    'Clopidogrel': 'Blood Thinner (Plavix)',
    'Rivaroxaban': 'Blood Thinner (Xarelto)',
    'Apixaban': 'Blood Thinner (Eliquis)',
    'Insulin Glargine': 'Long-acting Insulin (Lantus)',
    'Insulin Lispro': 'Fast-acting Insulin (Humalog)',
    'Insulin Aspart': 'Fast-acting Insulin (NovoLog)',
    'Metoprolol': 'Heart/Blood Pressure Medication',
    'Carvedilol': 'Heart Medication',
    'Propranolol': 'Beta Blocker',
    'Atenolol': 'Heart/Blood Pressure Pill',
    'Sertraline': 'Antidepressant (Zoloft)',
    'Escitalopram': 'Antidepressant (Lexapro)',
    'Fluoxetine': 'Antidepressant (Prozac)',
    'Paroxetine': 'Antidepressant (Paxil)',
    'Citalopram': 'Antidepressant (Celexa)',
    'Venlafaxine': 'Antidepressant (Effexor)',
    'Duloxetine': 'Antidepressant/Pain (Cymbalta)',
    'Bupropion': 'Antidepressant (Wellbutrin)',
    'Trazodone': 'Sleep/Antidepressant Medication',
    'Alprazolam': 'Anti-anxiety Medication (Xanax)',
    'Lorazepam': 'Anti-anxiety Medication (Ativan)',
    'Diazepam': 'Anti-anxiety Medication (Valium)',
    'Clonazepam': 'Anti-anxiety/Seizure Medication',
    'Zolpidem': 'Sleep Medication (Ambien)',
    'Eszopiclone': 'Sleep Medication (Lunesta)',
    'Melatonin': 'Natural Sleep Aid',
    'Sildenafil': 'Erectile Dysfunction Pill (Viagra)',
    'Tadalafil': 'Erectile Dysfunction Pill (Cialis)',
    'Montelukast': 'Asthma/Allergy Medication (Singulair)',
    'Albuterol': 'Asthma Inhaler',
    'Fluticasone': 'Steroid Inhaler/Nasal Spray',
    'Budesonide': 'Steroid Inhaler',
    'Tamsulosin': 'Prostate Medication (Flomax)',
    'Finasteride': 'Prostate/Hair Loss Medication',
    'Dutasteride': 'Prostate Medication',
    'Cyclobenzaprine': 'Muscle Relaxer (Flexeril)',
    'Methocarbamol': 'Muscle Relaxer (Robaxin)',
    'Baclofen': 'Muscle Relaxer',
    'Tramadol': 'Pain Medication',
    'Oxycodone': 'Strong Pain Medication',
    'Hydrocodone': 'Strong Pain Medication (Vicodin)',
    'Morphine': 'Strong Pain Medication',
    'Fentanyl': 'Very Strong Pain Medication',
    'Pregabalin': 'Nerve Pain Medication (Lyrica)',

    // Surgical Procedures
    'Appendectomy': 'Appendix Removal Surgery',
    'Cholecystectomy': 'Gallbladder Removal Surgery',
    'Hysterectomy': 'Uterus Removal Surgery',
    'Mastectomy': 'Breast Removal Surgery',
    'Lumpectomy': 'Breast Lump Removal Surgery',
    'Colectomy': 'Colon/Large Intestine Surgery',
    'Gastrectomy': 'Stomach Removal Surgery',
    'Nephrectomy': 'Kidney Removal Surgery',
    'Prostatectomy': 'Prostate Removal Surgery',
    'Thyroidectomy': 'Thyroid Removal Surgery',
    'Splenectomy': 'Spleen Removal Surgery',
    'Tonsillectomy': 'Tonsil Removal Surgery',
    'Adenoidectomy': 'Adenoid Removal Surgery',
    'Rhinoplasty': 'Nose Surgery (Nose Job)',
    'Blepharoplasty': 'Eyelid Surgery',
    'Rhytidectomy': 'Face Lift Surgery',
    'Abdominoplasty': 'Tummy Tuck Surgery',
    'Liposuction': 'Fat Removal Surgery',
    'Mammoplasty': 'Breast Surgery',
    'Arthroscopy': 'Joint Keyhole Surgery',
    'Laparoscopy': 'Keyhole Abdominal Surgery',
    'Thoracoscopy': 'Keyhole Chest Surgery',
    'Colonoscopy': 'Colon Examination',
    'Endoscopy': 'Internal Examination with Camera',
    'Gastroscopy': 'Stomach Examination',
    'Bronchoscopy': 'Lung/Airway Examination',
    'Cystoscopy': 'Bladder Examination',
    'Angioplasty': 'Heart Artery Opening Procedure',
    'Coronary Artery Bypass Grafting': 'Heart Bypass Surgery (CABG)',
    'CABG': 'Heart Bypass Surgery',
    'Percutaneous Coronary Intervention': 'Heart Stent Procedure',
    'PCI': 'Heart Stent Procedure',
    'Cardiac Catheterization': 'Heart Catheter Test',
    'Pacemaker Implantation': 'Heart Pacemaker Surgery',
    'Defibrillator Implantation': 'Heart Defibrillator Surgery (ICD)',
    'Valve Replacement': 'Heart Valve Surgery',
    'Mitral Valve Repair': 'Heart Valve Repair Surgery',
    'Aortic Valve Replacement': 'Heart Valve Replacement',
    'Total Hip Replacement': 'Hip Replacement Surgery',
    'Total Knee Replacement': 'Knee Replacement Surgery',
    'Arthroplasty': 'Joint Replacement Surgery',
    'Laminectomy': 'Back/Spine Surgery',
    'Discectomy': 'Disc Removal Surgery',
    'Spinal Fusion': 'Spine Fusion Surgery',
    'Vertebroplasty': 'Spine Cement Injection',
    'Kyphoplasty': 'Spine Balloon Procedure',
    'Carpal Tunnel Release': 'Carpal Tunnel Surgery',
    'Rotator Cuff Repair': 'Shoulder Repair Surgery',
    'ACL Reconstruction': 'Knee Ligament Surgery',
    'Meniscectomy': 'Knee Cartilage Surgery',
    'Cataract Surgery': 'Cataract Removal',
    'LASIK': 'Laser Eye Surgery',
    'Vitrectomy': 'Eye Surgery',
    'Corneal Transplant': 'Eye Transplant Surgery',
    'Cochlear Implant': 'Hearing Implant Surgery',
    'Tympanoplasty': 'Eardrum Repair Surgery',
    'Septoplasty': 'Deviated Septum Surgery',
    'Turbinate Reduction': 'Nasal Surgery',
    'Sinus Surgery': 'Sinus Procedure',
    'Hernia Repair': 'Hernia Surgery',
    'Inguinal Hernia Repair': 'Groin Hernia Surgery',
    'Umbilical Hernia Repair': 'Belly Button Hernia Surgery',
    'Hiatal Hernia Repair': 'Stomach Hernia Surgery',
    'Bariatric Surgery': 'Weight Loss Surgery',
    'Gastric Bypass': 'Weight Loss Bypass Surgery',
    'Gastric Sleeve': 'Stomach Reduction Surgery',
    'Lap-Band Surgery': 'Stomach Band Surgery',
    'Cesarean Section': 'C-Section Delivery',
    'C-Section': 'Cesarean Delivery',
    'Tubal Ligation': 'Tubes Tied (Female Sterilization)',
    'Vasectomy': 'Male Sterilization',
    'Circumcision': 'Foreskin Removal',
    'Orchiectomy': 'Testicle Removal Surgery',
    'Oophorectomy': 'Ovary Removal Surgery',
    'Salpingectomy': 'Fallopian Tube Removal',
    'Dilation and Curettage': 'D&C Procedure',
    'Myomectomy': 'Fibroid Removal Surgery',
    'Cryotherapy': 'Freezing Treatment',
    'Electrocautery': 'Heat/Burning Treatment',
    'Biopsy': 'Tissue Sample Collection',
    'Excision': 'Surgical Removal',
    'Debridement': 'Wound Cleaning Surgery',
    'Skin Graft': 'Skin Transplant',
    'Craniotomy': 'Brain Surgery',
    'Cranioplasty': 'Skull Repair Surgery',
    'Ventriculoperitoneal Shunt': 'Brain Fluid Drain (VP Shunt)',
    'Deep Brain Stimulation': 'Brain Stimulator Implant',
    'Carotid Endarterectomy': 'Neck Artery Surgery',
    'Aortic Aneurysm Repair': 'Aorta Repair Surgery',
    'Varicose Vein Surgery': 'Vein Removal Surgery',
    'Hemorrhoidectomy': 'Hemorrhoid Removal Surgery',
    'Fistulotomy': 'Fistula Surgery',
    'Fissurectomy': 'Anal Fissure Surgery',

    // Therapy & Rehabilitation
    'Physical therapy': 'Physiotherapy',
    'Physical Therapy': 'Physiotherapy',
    'Occupational therapy': 'Daily Living Skills Therapy',
    'Occupational Therapy': 'Daily Living Skills Therapy',
    'Speech therapy': 'Speech and Language Therapy',
    'Speech Therapy': 'Speech and Language Therapy',
    'Cognitive Behavioral Therapy': 'Talk Therapy (CBT)',
    'CBT': 'Talk Therapy',
    'Psychotherapy': 'Talk Therapy',
    'Dialectical Behavior Therapy': 'DBT Therapy',
    'EMDR': 'Trauma Processing Therapy',
    'Chemotherapy': 'Cancer Drug Treatment',
    'Radiation Therapy': 'Cancer Radiation Treatment',
    'Immunotherapy': 'Immune System Cancer Treatment',
    'Hormone Therapy': 'Hormone Treatment',
    'Dialysis': 'Kidney Filtering Treatment',
    'Hemodialysis': 'Blood Dialysis',
    'Peritoneal Dialysis': 'Belly Dialysis',
    'Phototherapy': 'Light Therapy',
    'Electroconvulsive Therapy': 'ECT Treatment',
    'Transcranial Magnetic Stimulation': 'Brain Stimulation Therapy (TMS)',

    // Diagnostic Tests
    'Magnetic Resonance Imaging': 'MRI Scan',
    'MRI': 'MRI Scan',
    'Computed Tomography': 'CT Scan',
    'CT Scan': 'CT Scan',
    'Positron Emission Tomography': 'PET Scan',
    'PET Scan': 'PET Scan',
    'Electrocardiogram': 'Heart Rhythm Test (ECG/EKG)',
    'ECG': 'Heart Rhythm Test',
    'EKG': 'Heart Rhythm Test',
    'Echocardiogram': 'Heart Ultrasound',
    'Electroencephalogram': 'Brain Wave Test (EEG)',
    'EEG': 'Brain Wave Test',
    'Electromyography': 'Nerve/Muscle Test (EMG)',
    'EMG': 'Nerve/Muscle Test',
    'Mammography': 'Breast X-ray',
    'Mammogram': 'Breast X-ray',
    'Bone Densitometry': 'Bone Density Test (DEXA)',
    'DEXA Scan': 'Bone Density Test',
    'Spirometry': 'Lung Function Test',
    'Pulmonary Function Test': 'Breathing Test',
    'Stress Test': 'Heart Stress Test',
    'Holter Monitor': '24-Hour Heart Monitor',
    'Amniocentesis': 'Pregnancy Fluid Test',
    'Chorionic Villus Sampling': 'CVS Pregnancy Test',
    'Pap Smear': 'Cervical Cancer Screening',
    'Pap Test': 'Cervical Cancer Screening',
    'PSA Test': 'Prostate Cancer Blood Test',
    'Complete Blood Count': 'CBC Blood Test',
    'CBC': 'Full Blood Test',
    'Basic Metabolic Panel': 'Blood Chemistry Test',
    'Comprehensive Metabolic Panel': 'Full Blood Chemistry Test',
    'Lipid Panel': 'Cholesterol Test',
    'Thyroid Function Test': 'Thyroid Blood Test',
    'Hemoglobin A1C': 'Diabetes Blood Test',
    'HbA1c': 'Diabetes Blood Test',
    'Fasting Blood Sugar': 'Fasting Glucose Test',
    'Glucose Tolerance Test': 'Sugar Tolerance Test',
    'Urinalysis': 'Urine Test',
    'Blood Culture': 'Blood Infection Test',
    'Urine Culture': 'Urine Infection Test',

    // Injectable Treatments
    'Botulinum Toxin': 'Botox Injection',
    'Botox': 'Botox Injection',
    'Hyaluronic Acid Filler': 'Dermal Filler',
    'Corticosteroid Injection': 'Steroid Shot',
    'Cortisone Shot': 'Steroid Injection',
    'Epidural Steroid Injection': 'Back Pain Injection',
    'Nerve Block': 'Pain Blocking Injection',
    'Trigger Point Injection': 'Muscle Pain Injection',
    'Platelet-Rich Plasma': 'PRP Injection',
    'PRP Therapy': 'Blood Plasma Injection',
    'Viscosupplementation': 'Joint Lubricant Injection',
    'Flu Shot': 'Influenza Vaccine',
    'Influenza Vaccine': 'Flu Shot',
    'COVID-19 Vaccine': 'COVID Vaccine',
    'Pneumococcal Vaccine': 'Pneumonia Vaccine',
    'Hepatitis B Vaccine': 'Hep B Vaccine',
    'HPV Vaccine': 'Cervical Cancer Vaccine',
    'Tetanus Shot': 'Tetanus Vaccine',
    'MMR Vaccine': 'Measles Mumps Rubella Vaccine',
    'Varicella Vaccine': 'Chickenpox Vaccine',
    'Shingles Vaccine': 'Herpes Zoster Vaccine',
};

// Generate additional mappings based on patterns
function generatePatternMappings(name: string): string | null {
    const lowerName = name.toLowerCase();

    // Pattern: "-ectomy" suffix (surgical removal)
    if (lowerName.endsWith('ectomy') && !SIMPLE_NAME_MAPPINGS[name]) {
        const root = name.slice(0, -6);
        return `${root} Removal Surgery`;
    }

    // Pattern: "-plasty" suffix (surgical repair/reconstruction)
    if (lowerName.endsWith('plasty') && !SIMPLE_NAME_MAPPINGS[name]) {
        const root = name.slice(0, -6);
        return `${root} Repair/Reconstruction Surgery`;
    }

    // Pattern: "-otomy" suffix (surgical incision)
    if (lowerName.endsWith('otomy') && !SIMPLE_NAME_MAPPINGS[name]) {
        const root = name.slice(0, -5);
        return `${root} Incision Surgery`;
    }

    // Pattern: "-oscopy" suffix (examination with scope)
    if (lowerName.endsWith('oscopy') && !SIMPLE_NAME_MAPPINGS[name]) {
        const root = name.slice(0, -6);
        return `${root} Examination`;
    }

    // Pattern: "-itis" suffix (inflammation)
    if (lowerName.endsWith('itis') && !SIMPLE_NAME_MAPPINGS[name]) {
        return `${name} (Inflammation)`;
    }

    return null;
}

async function main() {
    console.log('============================================================');
    console.log('ADDING SIMPLE NAMES TO TREATMENTS');
    console.log('============================================================\n');

    const treatmentsPath = path.join(process.cwd(), 'public', 'data', 'treatments.json');

    // Load treatments
    let treatments: TreatmentEntry[];
    try {
        treatments = JSON.parse(fs.readFileSync(treatmentsPath, 'utf-8'));
        console.log(`Loaded ${treatments.length} treatments\n`);
    } catch (error) {
        console.error('Failed to load treatments.json:', error);
        process.exit(1);
    }

    let updated = 0;
    let patterned = 0;

    // Add simple names
    for (const treatment of treatments) {
        // Check for exact match first
        if (SIMPLE_NAME_MAPPINGS[treatment.name]) {
            treatment.simpleName = SIMPLE_NAME_MAPPINGS[treatment.name];
            updated++;
        } else {
            // Try pattern-based mapping
            const patternName = generatePatternMappings(treatment.name);
            if (patternName) {
                treatment.simpleName = patternName;
                patterned++;
            }
        }
    }

    // Save updated treatments
    fs.writeFileSync(treatmentsPath, JSON.stringify(treatments, null, 2));
    console.log(`✅ Updated treatments.json`);
    console.log(`   - Exact matches: ${updated}`);
    console.log(`   - Pattern matches: ${patterned}`);
    console.log(`   - Total with simple names: ${updated + patterned}`);

    // Also update all translated files
    const langCodes = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'ar', 'es', 'fr', 'pt', 'de'];

    for (const lang of langCodes) {
        const langPath = path.join(process.cwd(), 'public', 'data', `treatments-${lang}.json`);
        if (fs.existsSync(langPath)) {
            try {
                const langTreatments: TreatmentEntry[] = JSON.parse(fs.readFileSync(langPath, 'utf-8'));

                // Add simple names to language files (keep original English simple names)
                for (let i = 0; i < langTreatments.length && i < treatments.length; i++) {
                    if (treatments[i].simpleName) {
                        langTreatments[i].simpleName = treatments[i].simpleName;
                    }
                }

                fs.writeFileSync(langPath, JSON.stringify(langTreatments, null, 2));
                console.log(`✅ Updated treatments-${lang}.json`);
            } catch (error) {
                console.error(`Failed to update treatments-${lang}.json:`, error);
            }
        }
    }

    console.log('\n============================================================');
    console.log('COMPLETE');
    console.log('============================================================');
}

main().catch(console.error);
