/**
 * Additional Specialty Templates
 *
 * Contains templates for remaining medical specialties.
 * These follow the base template structure but are defined more compactly.
 */

import type { SpecialtyTemplate, RiskFactor, DiagnosticTest } from './base-template';

// ============================================================================
// NEPHROLOGY - Kidney Conditions
// ============================================================================

export const nephrologyTemplate: SpecialtyTemplate = {
  specialty: 'Nephrology',
  specialistTitle: 'Nephrologist',
  specialistTitlePlural: 'Nephrologists',
  bodySystem: 'Renal System',
  commonSymptomPatterns: [
    'Swelling in legs, ankles, or feet', 'Changes in urination frequency',
    'Blood in urine', 'Foamy urine', 'Fatigue', 'Loss of appetite',
    'High blood pressure', 'Muscle cramps', 'Itchy skin', 'Nausea',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['ACE inhibitors', 'ARBs', 'Diuretics', 'Phosphate binders', 'Erythropoietin'] },
    { type: 'procedure', examples: ['Hemodialysis', 'Peritoneal dialysis', 'Kidney biopsy'] },
    { type: 'surgery', examples: ['Kidney transplant', 'AV fistula creation', 'Nephrostomy'] },
    { type: 'lifestyle', examples: ['Low-sodium diet', 'Fluid restriction', 'Protein management'] },
  ],
  commonRiskFactors: [
    { factor: 'Diabetes', category: 'medical', description: 'Leading cause of kidney disease', modifiable: true },
    { factor: 'High blood pressure', category: 'medical', description: 'Damages kidney blood vessels', modifiable: true },
    { factor: 'Family history', category: 'genetic', description: 'Genetic kidney conditions', modifiable: false },
  ],
  commonDiagnosticTests: [
    { test: 'Creatinine/BUN blood test', purpose: 'Assess kidney function', whatToExpect: 'Simple blood draw' },
    { test: 'Urinalysis', purpose: 'Check for protein/blood in urine', whatToExpect: 'Urine sample collection' },
    { test: 'Kidney ultrasound', purpose: 'Image kidney structure', whatToExpect: 'Painless imaging' },
    { test: 'Kidney biopsy', purpose: 'Diagnose kidney disease type', whatToExpect: 'Needle biopsy under imaging guidance' },
  ],
  faqTemplates: ['Can kidney damage be reversed?', 'How do I know if I need dialysis?', 'What is the difference between hemodialysis and peritoneal dialysis?'],
  linkedTreatmentSlugs: ['kidney-dialysis', 'kidney-transplant', 'av-fistula-surgery'],
  costRanges: { consultation: { min: 600, max: 2000, currency: 'INR' }, dialysis: { min: 2000, max: 5000, currency: 'INR' }, kidneyTransplant: { min: 500000, max: 1500000, currency: 'INR' } },
  emergencyIndicators: ['Inability to urinate', 'Severe swelling', 'Chest pain with kidney disease', 'Confusion'],
  lifestyleRecommendations: ['Control blood pressure', 'Manage diabetes', 'Limit salt intake', 'Stay hydrated appropriately'],
  dietPatterns: { recommended: ['Low-sodium foods', 'Lean proteins', 'Fresh vegetables'], avoid: ['High-potassium foods if restricted', 'Excess phosphorus', 'Processed foods'] },
};

// ============================================================================
// UROLOGY - Urinary and Male Reproductive Conditions
// ============================================================================

export const urologyTemplate: SpecialtyTemplate = {
  specialty: 'Urology',
  specialistTitle: 'Urologist',
  specialistTitlePlural: 'Urologists',
  bodySystem: 'Urinary and Male Reproductive System',
  commonSymptomPatterns: [
    'Difficulty urinating', 'Frequent urination', 'Blood in urine',
    'Painful urination', 'Urinary incontinence', 'Lower back pain',
    'Erectile dysfunction', 'Testicular pain', 'Kidney stones symptoms',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Alpha-blockers', 'Finasteride', 'Antibiotics for UTI', 'PDE5 inhibitors'] },
    { type: 'procedure', examples: ['Cystoscopy', 'Urodynamics', 'Lithotripsy'] },
    { type: 'surgery', examples: ['TURP', 'Prostatectomy', 'Nephrectomy', 'Vasectomy'] },
  ],
  commonRiskFactors: [
    { factor: 'Age', category: 'demographic', description: 'Prostate issues increase with age', modifiable: false },
    { factor: 'Family history of prostate cancer', category: 'genetic', description: 'Genetic predisposition', modifiable: false },
  ],
  commonDiagnosticTests: [
    { test: 'PSA test', purpose: 'Screen for prostate cancer', whatToExpect: 'Blood test' },
    { test: 'Cystoscopy', purpose: 'Visualize bladder', whatToExpect: 'Scope through urethra' },
    { test: 'CT urogram', purpose: 'Image urinary tract', whatToExpect: 'CT scan with contrast' },
  ],
  faqTemplates: ['What causes kidney stones?', 'Is prostate cancer curable?', 'What is BPH?'],
  linkedTreatmentSlugs: ['lithotripsy', 'prostatectomy', 'turp-surgery', 'cystoscopy'],
  costRanges: { consultation: { min: 500, max: 2000, currency: 'INR' }, lithotripsy: { min: 50000, max: 150000, currency: 'INR' }, prostateSurgery: { min: 100000, max: 400000, currency: 'INR' } },
  emergencyIndicators: ['Complete inability to urinate', 'Severe kidney pain', 'Blood in urine with clots', 'Testicular torsion signs'],
  lifestyleRecommendations: ['Stay well hydrated', 'Limit caffeine and alcohol', 'Practice safe sex', 'Regular prostate screening'],
  dietPatterns: { recommended: ['Plenty of fluids', 'Citrus fruits', 'Low-oxalate foods if prone to stones'], avoid: ['Excess salt', 'High-oxalate foods', 'Excessive animal protein'] },
};

// ============================================================================
// OPHTHALMOLOGY - Eye Conditions
// ============================================================================

export const ophthalmologyTemplate: SpecialtyTemplate = {
  specialty: 'Ophthalmology',
  specialistTitle: 'Ophthalmologist',
  specialistTitlePlural: 'Ophthalmologists',
  bodySystem: 'Visual System',
  commonSymptomPatterns: [
    'Blurred vision', 'Eye pain', 'Redness', 'Light sensitivity',
    'Double vision', 'Floaters', 'Loss of peripheral vision',
    'Difficulty seeing at night', 'Eye discharge', 'Itchy eyes',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Eye drops', 'Anti-glaucoma medications', 'Antibiotics', 'Anti-inflammatories'] },
    { type: 'procedure', examples: ['Laser eye surgery', 'Intravitreal injections', 'Laser photocoagulation'] },
    { type: 'surgery', examples: ['Cataract surgery', 'Vitrectomy', 'Corneal transplant', 'LASIK'] },
  ],
  commonRiskFactors: [
    { factor: 'Age', category: 'demographic', description: 'Cataracts and macular degeneration', modifiable: false },
    { factor: 'Diabetes', category: 'medical', description: 'Diabetic retinopathy risk', modifiable: true },
    { factor: 'UV exposure', category: 'environmental', description: 'Increases cataract risk', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Eye exam', purpose: 'Comprehensive vision assessment', whatToExpect: 'Various tests including dilation' },
    { test: 'OCT scan', purpose: 'Retinal imaging', whatToExpect: 'Non-invasive scan' },
    { test: 'Visual field test', purpose: 'Detect peripheral vision loss', whatToExpect: 'Look at lights and respond' },
  ],
  faqTemplates: ['Is LASIK safe?', 'Can cataracts come back after surgery?', 'What causes glaucoma?'],
  linkedTreatmentSlugs: ['cataract-surgery', 'lasik', 'glaucoma-treatment', 'retinal-surgery'],
  costRanges: { consultation: { min: 500, max: 1500, currency: 'INR' }, cataractSurgery: { min: 25000, max: 100000, currency: 'INR' }, lasik: { min: 50000, max: 150000, currency: 'INR' } },
  emergencyIndicators: ['Sudden vision loss', 'Severe eye pain', 'Chemical in eye', 'Eye injury', 'Flashing lights with floaters'],
  lifestyleRecommendations: ['Wear UV-protective sunglasses', 'Take screen breaks', 'Get regular eye exams', 'Control diabetes and blood pressure'],
  dietPatterns: { recommended: ['Leafy greens', 'Omega-3 fatty acids', 'Vitamin C and E foods', 'Zinc-rich foods'], avoid: ['Excessive alcohol', 'High-sugar foods', 'Trans fats'] },
};

// ============================================================================
// ENT (Otolaryngology) - Ear, Nose, Throat Conditions
// ============================================================================

export const entTemplate: SpecialtyTemplate = {
  specialty: 'ENT',
  specialistTitle: 'ENT Specialist',
  specialistTitlePlural: 'ENT Specialists',
  bodySystem: 'Ear, Nose, and Throat',
  commonSymptomPatterns: [
    'Hearing loss', 'Ear pain', 'Sore throat', 'Nasal congestion',
    'Sinus pressure', 'Dizziness/vertigo', 'Voice changes', 'Difficulty swallowing',
    'Snoring', 'Nosebleeds', 'Ringing in ears (tinnitus)',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Antibiotics', 'Nasal steroids', 'Decongestants', 'Antihistamines'] },
    { type: 'procedure', examples: ['Endoscopy', 'Audiometry', 'Balloon sinuplasty'] },
    { type: 'surgery', examples: ['Tonsillectomy', 'Septoplasty', 'Cochlear implant', 'Thyroidectomy'] },
  ],
  commonRiskFactors: [
    { factor: 'Allergies', category: 'medical', description: 'Chronic ENT issues', modifiable: true },
    { factor: 'Smoking', category: 'lifestyle', description: 'Throat and sinus problems', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Audiometry', purpose: 'Hearing assessment', whatToExpect: 'Listen to sounds through headphones' },
    { test: 'CT sinus', purpose: 'Sinus evaluation', whatToExpect: 'Quick CT scan' },
    { test: 'Nasal endoscopy', purpose: 'Visualize nasal passages', whatToExpect: 'Thin scope inserted in nose' },
  ],
  faqTemplates: ['What causes tinnitus?', 'When should tonsils be removed?', 'Can sinusitis be cured?'],
  linkedTreatmentSlugs: ['tonsillectomy', 'septoplasty', 'cochlear-implant', 'sinus-surgery'],
  costRanges: { consultation: { min: 500, max: 1500, currency: 'INR' }, tonsillectomy: { min: 30000, max: 80000, currency: 'INR' }, cochlearImplant: { min: 500000, max: 1500000, currency: 'INR' } },
  emergencyIndicators: ['Severe throat swelling', 'Difficulty breathing', 'Heavy nosebleed', 'Foreign object in airway'],
  lifestyleRecommendations: ['Avoid smoking', 'Use humidifiers', 'Practice good vocal hygiene', 'Protect hearing from loud noises'],
  dietPatterns: { recommended: ['Warm fluids for sore throat', 'Anti-inflammatory foods', 'Vitamin C-rich foods'], avoid: ['Dairy during congestion', 'Very hot or cold foods with throat issues', 'Irritating spicy foods'] },
};

// ============================================================================
// PSYCHIATRY - Mental Health Conditions
// ============================================================================

export const psychiatryTemplate: SpecialtyTemplate = {
  specialty: 'Psychiatry',
  specialistTitle: 'Psychiatrist',
  specialistTitlePlural: 'Psychiatrists',
  bodySystem: 'Central Nervous System (Mental Health)',
  commonSymptomPatterns: [
    'Persistent sadness', 'Anxiety', 'Sleep disturbances', 'Mood swings',
    'Difficulty concentrating', 'Changes in appetite', 'Social withdrawal',
    'Unusual thoughts or beliefs', 'Substance use issues', 'Suicidal thoughts',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Antidepressants (SSRIs, SNRIs)', 'Anxiolytics', 'Mood stabilizers', 'Antipsychotics'] },
    { type: 'therapy', examples: ['Cognitive behavioral therapy', 'Psychotherapy', 'Group therapy', 'Family therapy'] },
    { type: 'procedure', examples: ['Electroconvulsive therapy (ECT)', 'Transcranial magnetic stimulation (TMS)'] },
  ],
  commonRiskFactors: [
    { factor: 'Family history', category: 'genetic', description: 'Genetic predisposition to mental illness', modifiable: false },
    { factor: 'Trauma', category: 'medical', description: 'Past traumatic experiences', modifiable: false },
    { factor: 'Chronic stress', category: 'lifestyle', description: 'Ongoing life stressors', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Psychiatric evaluation', purpose: 'Comprehensive mental health assessment', whatToExpect: 'Detailed interview and questionnaires' },
    { test: 'Psychological testing', purpose: 'Assess specific conditions', whatToExpect: 'Various standardized tests' },
  ],
  faqTemplates: ['Is depression curable?', 'How long should I take antidepressants?', 'What is the difference between psychiatry and psychology?'],
  linkedTreatmentSlugs: ['cbt-therapy', 'depression-treatment', 'anxiety-treatment', 'ect-therapy'],
  costRanges: { consultation: { min: 1000, max: 3000, currency: 'INR' }, therapy: { min: 1500, max: 4000, currency: 'INR' }, ect: { min: 5000, max: 15000, currency: 'INR' } },
  emergencyIndicators: ['Suicidal thoughts or actions', 'Self-harm', 'Psychotic episode', 'Severe panic attack', 'Substance overdose'],
  lifestyleRecommendations: ['Regular exercise', 'Adequate sleep', 'Social connections', 'Stress management', 'Avoid alcohol and drugs'],
  dietPatterns: { recommended: ['Omega-3 rich foods', 'Whole grains', 'Fruits and vegetables', 'Probiotics'], avoid: ['Excess caffeine', 'Alcohol', 'Processed foods', 'High sugar intake'] },
};

// ============================================================================
// RHEUMATOLOGY - Joint and Autoimmune Conditions
// ============================================================================

export const rheumatologyTemplate: SpecialtyTemplate = {
  specialty: 'Rheumatology',
  specialistTitle: 'Rheumatologist',
  specialistTitlePlural: 'Rheumatologists',
  bodySystem: 'Musculoskeletal and Immune System',
  commonSymptomPatterns: [
    'Joint pain and stiffness', 'Morning stiffness lasting >1 hour', 'Joint swelling',
    'Fatigue', 'Fever', 'Skin rashes', 'Muscle pain', 'Dry eyes and mouth',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['DMARDs (Methotrexate)', 'Biologics', 'NSAIDs', 'Corticosteroids', 'Hydroxychloroquine'] },
    { type: 'therapy', examples: ['Physical therapy', 'Occupational therapy'] },
    { type: 'procedure', examples: ['Joint injections', 'Joint aspiration'] },
  ],
  commonRiskFactors: [
    { factor: 'Autoimmune predisposition', category: 'genetic', description: 'Family history of autoimmune diseases', modifiable: false },
    { factor: 'Female gender', category: 'demographic', description: 'Higher risk for many autoimmune conditions', modifiable: false },
  ],
  commonDiagnosticTests: [
    { test: 'Autoimmune panel (ANA, RF)', purpose: 'Detect autoimmune markers', whatToExpect: 'Blood test' },
    { test: 'Joint imaging (X-ray, MRI)', purpose: 'Assess joint damage', whatToExpect: 'Imaging procedures' },
  ],
  faqTemplates: ['Can rheumatoid arthritis be cured?', 'What triggers lupus flares?', 'Is fibromyalgia real?'],
  linkedTreatmentSlugs: ['biologic-therapy', 'joint-injection', 'physical-therapy'],
  costRanges: { consultation: { min: 800, max: 2500, currency: 'INR' }, biologics: { min: 20000, max: 100000, currency: 'INR' } },
  emergencyIndicators: ['Severe joint inflammation', 'High fever with joint symptoms', 'Organ involvement signs'],
  lifestyleRecommendations: ['Low-impact exercise', 'Joint protection techniques', 'Stress management', 'Adequate rest'],
  dietPatterns: { recommended: ['Anti-inflammatory foods', 'Omega-3 fatty acids', 'Colorful vegetables'], avoid: ['Processed foods', 'Excess sugar', 'Red meat in excess'] },
};

// ============================================================================
// PEDIATRICS - Child Health
// ============================================================================

export const pediatricsTemplate: SpecialtyTemplate = {
  specialty: 'Pediatrics',
  specialistTitle: 'Pediatrician',
  specialistTitlePlural: 'Pediatricians',
  bodySystem: 'Pediatric Healthcare (All Systems)',
  commonSymptomPatterns: [
    'Fever', 'Cough and cold symptoms', 'Diarrhea/vomiting', 'Rashes',
    'Ear pain', 'Poor weight gain', 'Developmental delays', 'Behavioral issues',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Pediatric antibiotics', 'Fever reducers', 'Antihistamines', 'Bronchodilators'] },
    { type: 'therapy', examples: ['Speech therapy', 'Occupational therapy', 'Developmental therapy'] },
  ],
  commonRiskFactors: [
    { factor: 'Premature birth', category: 'medical', description: 'Increased health risks', modifiable: false },
    { factor: 'Incomplete vaccination', category: 'lifestyle', description: 'Preventable disease risk', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Growth assessment', purpose: 'Track development', whatToExpect: 'Height, weight, head measurements' },
    { test: 'Developmental screening', purpose: 'Identify delays', whatToExpect: 'Questionnaires and observation' },
  ],
  faqTemplates: ['When should I worry about my child\'s fever?', 'What vaccines does my child need?', 'Is my child developing normally?'],
  linkedTreatmentSlugs: ['pediatric-care', 'vaccination', 'developmental-therapy'],
  costRanges: { consultation: { min: 400, max: 1500, currency: 'INR' } },
  emergencyIndicators: ['High fever in infant', 'Difficulty breathing', 'Severe dehydration', 'Seizure', 'Non-responsive child'],
  lifestyleRecommendations: ['Ensure complete vaccination', 'Proper nutrition', 'Adequate sleep', 'Regular checkups', 'Limit screen time'],
  dietPatterns: { recommended: ['Age-appropriate balanced diet', 'Fruits and vegetables', 'Calcium-rich foods', 'Iron-rich foods'], avoid: ['Excess sugar', 'Processed foods', 'Choking hazards for small children'] },
};

// ============================================================================
// OBSTETRICS & GYNECOLOGY
// ============================================================================

export const obgynTemplate: SpecialtyTemplate = {
  specialty: 'Obstetrics & Gynecology',
  specialistTitle: 'Gynecologist',
  specialistTitlePlural: 'Gynecologists',
  bodySystem: 'Female Reproductive System',
  commonSymptomPatterns: [
    'Irregular periods', 'Painful periods', 'Heavy bleeding', 'Pelvic pain',
    'Vaginal discharge', 'Infertility concerns', 'Pregnancy symptoms', 'Menopausal symptoms',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Hormonal contraceptives', 'Fertility drugs', 'HRT', 'Progesterone'] },
    { type: 'procedure', examples: ['Pap smear', 'Colposcopy', 'IUD insertion', 'Ultrasound'] },
    { type: 'surgery', examples: ['Hysterectomy', 'C-section', 'Laparoscopy', 'Myomectomy'] },
  ],
  commonRiskFactors: [
    { factor: 'Age', category: 'demographic', description: 'Fertility and menopause timing', modifiable: false },
    { factor: 'Family history', category: 'genetic', description: 'Breast/ovarian cancer risk', modifiable: false },
  ],
  commonDiagnosticTests: [
    { test: 'Pap smear', purpose: 'Cervical cancer screening', whatToExpect: 'Quick sample collection' },
    { test: 'Pelvic ultrasound', purpose: 'View reproductive organs', whatToExpect: 'Abdominal or transvaginal imaging' },
  ],
  faqTemplates: ['What causes PCOS?', 'Is heavy bleeding normal?', 'What are treatment options for fibroids?'],
  linkedTreatmentSlugs: ['hysterectomy', 'laparoscopy', 'fertility-treatment', 'iud-insertion'],
  costRanges: { consultation: { min: 500, max: 2000, currency: 'INR' }, delivery: { min: 50000, max: 200000, currency: 'INR' }, ivf: { min: 100000, max: 300000, currency: 'INR' } },
  emergencyIndicators: ['Heavy bleeding in pregnancy', 'Severe pelvic pain', 'Ectopic pregnancy signs', 'Labor complications'],
  lifestyleRecommendations: ['Regular gynecological checkups', 'Safe sex practices', 'Prenatal care during pregnancy', 'Menopause management'],
  dietPatterns: { recommended: ['Iron-rich foods', 'Folic acid', 'Calcium', 'Balanced nutrition'], avoid: ['Excess caffeine during pregnancy', 'Alcohol', 'Raw/undercooked foods during pregnancy'] },
};

// ============================================================================
// GENERAL MEDICINE / INTERNAL MEDICINE
// ============================================================================

export const generalMedicineTemplate: SpecialtyTemplate = {
  specialty: 'General Medicine',
  specialistTitle: 'General Physician',
  specialistTitlePlural: 'General Physicians',
  bodySystem: 'Multiple Body Systems',
  commonSymptomPatterns: [
    'Fever', 'Fatigue', 'Body aches', 'Headache', 'Cough', 'Cold symptoms',
    'Digestive issues', 'General weakness', 'Dizziness', 'Loss of appetite',
    'Weight changes', 'Sleep disturbances', 'Pain', 'Breathing difficulties',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Antibiotics', 'Antivirals', 'Pain relievers', 'Anti-inflammatories', 'Vitamins'] },
    { type: 'therapy', examples: ['Rest and hydration', 'Physical therapy', 'Lifestyle counseling'] },
    { type: 'procedure', examples: ['Blood tests', 'Imaging studies', 'Health screenings'] },
  ],
  commonRiskFactors: [
    { factor: 'Poor nutrition', category: 'lifestyle', description: 'Weakens immune system', modifiable: true },
    { factor: 'Sedentary lifestyle', category: 'lifestyle', description: 'Increases disease risk', modifiable: true },
    { factor: 'Smoking', category: 'lifestyle', description: 'Multiple health risks', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Complete blood count', purpose: 'Assess overall health', whatToExpect: 'Simple blood draw' },
    { test: 'Basic metabolic panel', purpose: 'Check organ function', whatToExpect: 'Blood test' },
    { test: 'Physical examination', purpose: 'Comprehensive health check', whatToExpect: 'Full body examination' },
    { test: 'Chest X-ray', purpose: 'Lung and heart assessment', whatToExpect: 'Quick imaging' },
  ],
  faqTemplates: ['When should I see a doctor for fever?', 'What tests are included in a full body checkup?', 'How often should I get a health checkup?'],
  linkedTreatmentSlugs: ['general-consultation', 'health-checkup', 'vaccination'],
  costRanges: { consultation: { min: 300, max: 1000, currency: 'INR' }, healthCheckup: { min: 1000, max: 5000, currency: 'INR' } },
  emergencyIndicators: ['High fever unresponsive to medication', 'Severe chest pain', 'Difficulty breathing', 'Loss of consciousness', 'Severe allergic reaction'],
  lifestyleRecommendations: ['Regular exercise', 'Balanced diet', 'Adequate sleep', 'Stress management', 'Regular health checkups', 'Stay hydrated'],
  dietPatterns: { recommended: ['Balanced meals', 'Fruits and vegetables', 'Whole grains', 'Lean proteins', 'Adequate water'], avoid: ['Processed foods', 'Excess sugar', 'Excess salt', 'Trans fats'] },
};

export const internalMedicineTemplate: SpecialtyTemplate = {
  ...generalMedicineTemplate,
  specialty: 'Internal Medicine',
  specialistTitle: 'Internist',
  specialistTitlePlural: 'Internists',
};

export const familyMedicineTemplate: SpecialtyTemplate = {
  ...generalMedicineTemplate,
  specialty: 'Family Medicine',
  specialistTitle: 'Family Physician',
  specialistTitlePlural: 'Family Physicians',
};

// ============================================================================
// EMERGENCY MEDICINE
// ============================================================================

export const emergencyMedicineTemplate: SpecialtyTemplate = {
  specialty: 'Emergency Medicine',
  specialistTitle: 'Emergency Physician',
  specialistTitlePlural: 'Emergency Physicians',
  bodySystem: 'All Body Systems (Acute Care)',
  commonSymptomPatterns: [
    'Severe pain', 'Difficulty breathing', 'Chest pain', 'Loss of consciousness',
    'Severe bleeding', 'Trauma injuries', 'Seizures', 'Severe allergic reactions',
    'Stroke symptoms', 'Heart attack symptoms', 'Poisoning', 'Burns',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['IV fluids', 'Pain management', 'Antibiotics', 'Epinephrine', 'Thrombolytics'] },
    { type: 'procedure', examples: ['Intubation', 'CPR', 'Wound care', 'Fracture stabilization', 'IV access'] },
    { type: 'surgery', examples: ['Emergency surgery', 'Trauma surgery', 'Emergency cesarean'] },
  ],
  commonRiskFactors: [
    { factor: 'Accidents', category: 'environmental', description: 'Trauma and injury', modifiable: true },
    { factor: 'Chronic conditions', category: 'medical', description: 'May lead to acute episodes', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'STAT blood tests', purpose: 'Rapid assessment', whatToExpect: 'Urgent blood work' },
    { test: 'CT scan', purpose: 'Quick imaging for emergencies', whatToExpect: 'Rapid scan' },
    { test: 'ECG', purpose: 'Heart rhythm assessment', whatToExpect: 'Quick electrode placement' },
  ],
  faqTemplates: ['When should I go to the emergency room?', 'What happens in an emergency room?', 'How are emergencies prioritized?'],
  linkedTreatmentSlugs: ['emergency-care', 'trauma-care', 'acute-care'],
  costRanges: { consultation: { min: 500, max: 2000, currency: 'INR' }, emergencyRoom: { min: 2000, max: 20000, currency: 'INR' } },
  emergencyIndicators: ['All presentations to emergency medicine are potentially emergencies'],
  lifestyleRecommendations: ['Know basic first aid', 'Keep emergency numbers handy', 'Wear seatbelts', 'Practice fire safety'],
  dietPatterns: { recommended: [], avoid: [] },
};

// ============================================================================
// GENETICS
// ============================================================================

export const geneticsTemplate: SpecialtyTemplate = {
  specialty: 'Genetics',
  specialistTitle: 'Geneticist',
  specialistTitlePlural: 'Geneticists',
  bodySystem: 'Genetic and Hereditary Conditions',
  commonSymptomPatterns: [
    'Developmental delays', 'Birth defects', 'Family history of genetic conditions',
    'Unusual physical features', 'Intellectual disability', 'Growth abnormalities',
    'Recurrent pregnancy loss', 'Multiple family members with same condition',
  ],
  commonTreatmentTypes: [
    { type: 'procedure', examples: ['Genetic counseling', 'Prenatal testing', 'Carrier screening'] },
    { type: 'therapy', examples: ['Gene therapy', 'Enzyme replacement therapy', 'Supportive care'] },
  ],
  commonRiskFactors: [
    { factor: 'Family history', category: 'genetic', description: 'Inherited conditions', modifiable: false },
    { factor: 'Advanced maternal age', category: 'demographic', description: 'Chromosomal abnormalities', modifiable: false },
  ],
  commonDiagnosticTests: [
    { test: 'Genetic testing', purpose: 'Identify genetic mutations', whatToExpect: 'Blood or saliva sample' },
    { test: 'Chromosomal analysis', purpose: 'Detect chromosomal abnormalities', whatToExpect: 'Blood test' },
    { test: 'Prenatal screening', purpose: 'Assess fetal genetic health', whatToExpect: 'Blood tests or amniocentesis' },
  ],
  faqTemplates: ['Is this condition hereditary?', 'Should I get genetic testing?', 'Can genetic conditions be treated?'],
  linkedTreatmentSlugs: ['genetic-counseling', 'prenatal-testing', 'gene-therapy'],
  costRanges: { consultation: { min: 1000, max: 3000, currency: 'INR' }, geneticTesting: { min: 5000, max: 50000, currency: 'INR' } },
  emergencyIndicators: ['Acute metabolic crisis in genetic disorders'],
  lifestyleRecommendations: ['Genetic counseling before pregnancy', 'Regular monitoring for genetic conditions', 'Follow treatment plans closely'],
  dietPatterns: { recommended: ['Disease-specific dietary needs'], avoid: ['Foods that may trigger metabolic issues'] },
};

// ============================================================================
// NEONATOLOGY
// ============================================================================

export const neonatologyTemplate: SpecialtyTemplate = {
  specialty: 'Neonatology',
  specialistTitle: 'Neonatologist',
  specialistTitlePlural: 'Neonatologists',
  bodySystem: 'Newborn Healthcare',
  commonSymptomPatterns: [
    'Prematurity', 'Low birth weight', 'Breathing difficulties', 'Jaundice',
    'Feeding difficulties', 'Birth defects', 'Infections', 'Temperature instability',
  ],
  commonTreatmentTypes: [
    { type: 'procedure', examples: ['NICU care', 'Phototherapy', 'Ventilation support', 'IV nutrition'] },
    { type: 'medication', examples: ['Surfactant', 'Antibiotics', 'Caffeine for apnea'] },
  ],
  commonRiskFactors: [
    { factor: 'Premature birth', category: 'medical', description: 'Multiple health challenges', modifiable: false },
    { factor: 'Low birth weight', category: 'medical', description: 'Developmental concerns', modifiable: false },
  ],
  commonDiagnosticTests: [
    { test: 'Newborn screening', purpose: 'Detect metabolic disorders', whatToExpect: 'Heel prick blood test' },
    { test: 'Head ultrasound', purpose: 'Brain assessment', whatToExpect: 'Painless ultrasound' },
  ],
  faqTemplates: ['Why is my baby in the NICU?', 'What are the risks of premature birth?', 'When can my baby go home?'],
  linkedTreatmentSlugs: ['nicu-care', 'phototherapy', 'premature-baby-care'],
  costRanges: { consultation: { min: 500, max: 2000, currency: 'INR' }, nicuPerDay: { min: 10000, max: 50000, currency: 'INR' } },
  emergencyIndicators: ['Breathing difficulties', 'Severe jaundice', 'Feeding refusal', 'Lethargy', 'Fever or hypothermia'],
  lifestyleRecommendations: ['Kangaroo care', 'Breastfeeding support', 'Regular follow-ups', 'Developmental monitoring'],
  dietPatterns: { recommended: ['Breast milk or specialized formula', 'Fortified feeds if needed'], avoid: [] },
};

// ============================================================================
// INFECTIOUS DISEASE
// ============================================================================

export const infectiousDiseaseTemplate: SpecialtyTemplate = {
  specialty: 'Infectious Disease',
  specialistTitle: 'Infectious Disease Specialist',
  specialistTitlePlural: 'Infectious Disease Specialists',
  bodySystem: 'Immune System and Infections',
  commonSymptomPatterns: [
    'Fever', 'Chills', 'Body aches', 'Fatigue', 'Swollen lymph nodes',
    'Rash', 'Cough', 'Diarrhea', 'Night sweats', 'Weight loss',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Antibiotics', 'Antivirals', 'Antifungals', 'Antiparasitics', 'Immunoglobulins'] },
    { type: 'procedure', examples: ['Isolation protocols', 'IV antimicrobials', 'Wound care'] },
  ],
  commonRiskFactors: [
    { factor: 'Weakened immune system', category: 'medical', description: 'Increased infection risk', modifiable: true },
    { factor: 'Travel to endemic areas', category: 'environmental', description: 'Exposure to tropical diseases', modifiable: true },
    { factor: 'Close contact with infected individuals', category: 'environmental', description: 'Transmission risk', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Blood cultures', purpose: 'Identify bacteria in blood', whatToExpect: 'Blood draw' },
    { test: 'PCR testing', purpose: 'Detect viral/bacterial DNA', whatToExpect: 'Swab or blood sample' },
    { test: 'Serology', purpose: 'Detect antibodies', whatToExpect: 'Blood test' },
  ],
  faqTemplates: ['How are infections spread?', 'When are antibiotics needed?', 'How can I prevent infections?'],
  linkedTreatmentSlugs: ['antibiotic-therapy', 'antiviral-therapy', 'infection-treatment'],
  costRanges: { consultation: { min: 500, max: 2000, currency: 'INR' }, hospitalStay: { min: 5000, max: 30000, currency: 'INR' } },
  emergencyIndicators: ['Sepsis signs', 'Meningitis symptoms', 'Severe dehydration', 'High fever unresponsive to treatment'],
  lifestyleRecommendations: ['Hand hygiene', 'Vaccination', 'Safe food practices', 'Safe sex', 'Avoid contact during illness'],
  dietPatterns: { recommended: ['Hydrating fluids', 'Easy to digest foods', 'Nutrient-rich foods'], avoid: ['Alcohol during infection', 'Heavy foods when sick'] },
};

// ============================================================================
// HEMATOLOGY
// ============================================================================

export const hematologyTemplate: SpecialtyTemplate = {
  specialty: 'Hematology',
  specialistTitle: 'Hematologist',
  specialistTitlePlural: 'Hematologists',
  bodySystem: 'Blood and Lymphatic System',
  commonSymptomPatterns: [
    'Fatigue', 'Weakness', 'Easy bruising', 'Prolonged bleeding',
    'Pale skin', 'Shortness of breath', 'Frequent infections', 'Swollen lymph nodes',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Iron supplements', 'Folic acid', 'Blood thinners', 'Chemotherapy', 'Growth factors'] },
    { type: 'procedure', examples: ['Blood transfusion', 'Bone marrow biopsy', 'Plasmapheresis'] },
    { type: 'surgery', examples: ['Bone marrow transplant', 'Splenectomy'] },
  ],
  commonRiskFactors: [
    { factor: 'Family history of blood disorders', category: 'genetic', description: 'Inherited conditions', modifiable: false },
    { factor: 'Nutritional deficiencies', category: 'lifestyle', description: 'Iron, B12, folate deficiency', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Complete blood count', purpose: 'Assess blood cells', whatToExpect: 'Blood draw' },
    { test: 'Coagulation studies', purpose: 'Assess clotting', whatToExpect: 'Blood test' },
    { test: 'Bone marrow biopsy', purpose: 'Examine blood cell production', whatToExpect: 'Needle biopsy from hip bone' },
  ],
  faqTemplates: ['What causes anemia?', 'Is leukemia curable?', 'Why do I bruise easily?'],
  linkedTreatmentSlugs: ['blood-transfusion', 'bone-marrow-transplant', 'chemotherapy'],
  costRanges: { consultation: { min: 600, max: 2000, currency: 'INR' }, boneMarrowTransplant: { min: 1500000, max: 4000000, currency: 'INR' } },
  emergencyIndicators: ['Severe anemia', 'Uncontrolled bleeding', 'Blood clots', 'High white cell count'],
  lifestyleRecommendations: ['Iron-rich diet for anemia', 'Avoid injury if bleeding disorder', 'Regular monitoring', 'Stay hydrated'],
  dietPatterns: { recommended: ['Iron-rich foods', 'Vitamin C for iron absorption', 'Folate-rich foods', 'B12 sources'], avoid: ['Alcohol excess', 'Foods that interfere with medication'] },
};

// ============================================================================
// ALLERGY & IMMUNOLOGY
// ============================================================================

export const allergyImmunologyTemplate: SpecialtyTemplate = {
  specialty: 'Allergy & Immunology',
  specialistTitle: 'Allergist',
  specialistTitlePlural: 'Allergists',
  bodySystem: 'Immune System',
  commonSymptomPatterns: [
    'Sneezing', 'Runny nose', 'Itchy eyes', 'Skin rashes', 'Hives',
    'Swelling', 'Breathing difficulties', 'Food reaction symptoms', 'Anaphylaxis',
  ],
  commonTreatmentTypes: [
    { type: 'medication', examples: ['Antihistamines', 'Corticosteroids', 'Epinephrine', 'Immunosuppressants'] },
    { type: 'therapy', examples: ['Allergen immunotherapy', 'Desensitization'] },
    { type: 'procedure', examples: ['Allergy testing', 'Skin prick tests', 'Blood tests'] },
  ],
  commonRiskFactors: [
    { factor: 'Family history of allergies', category: 'genetic', description: 'Allergic predisposition', modifiable: false },
    { factor: 'Environmental allergens', category: 'environmental', description: 'Pollen, dust, pet dander', modifiable: true },
  ],
  commonDiagnosticTests: [
    { test: 'Skin prick test', purpose: 'Identify allergens', whatToExpect: 'Small skin punctures with allergens' },
    { test: 'IgE blood test', purpose: 'Measure allergic antibodies', whatToExpect: 'Blood draw' },
    { test: 'Patch testing', purpose: 'Identify contact allergens', whatToExpect: 'Patches worn for 48 hours' },
  ],
  faqTemplates: ['Can allergies be cured?', 'What is anaphylaxis?', 'Should I carry an EpiPen?'],
  linkedTreatmentSlugs: ['allergy-testing', 'immunotherapy', 'anaphylaxis-treatment'],
  costRanges: { consultation: { min: 500, max: 2000, currency: 'INR' }, allergyTesting: { min: 2000, max: 10000, currency: 'INR' } },
  emergencyIndicators: ['Anaphylaxis', 'Severe asthma attack', 'Throat swelling', 'Difficulty breathing'],
  lifestyleRecommendations: ['Avoid known allergens', 'Carry emergency medication', 'Wear medical alert bracelet', 'Keep home clean'],
  dietPatterns: { recommended: ['Allergen-free alternatives', 'Read food labels carefully'], avoid: ['Known food allergens', 'Cross-contaminated foods'] },
};

// Export all templates
export const additionalSpecialtyTemplates: Record<string, SpecialtyTemplate> = {
  'Nephrology': nephrologyTemplate,
  'Urology': urologyTemplate,
  'Ophthalmology': ophthalmologyTemplate,
  'ENT': entTemplate,
  'Psychiatry': psychiatryTemplate,
  'Rheumatology': rheumatologyTemplate,
  'Pediatrics': pediatricsTemplate,
  'Obstetrics & Gynecology': obgynTemplate,
  'General Medicine': generalMedicineTemplate,
  'Internal Medicine': internalMedicineTemplate,
  'Family Medicine': familyMedicineTemplate,
  'Emergency Medicine': emergencyMedicineTemplate,
  'Genetics': geneticsTemplate,
  'Neonatology': neonatologyTemplate,
  'Infectious Disease': infectiousDiseaseTemplate,
  'Hematology': hematologyTemplate,
  'Allergy & Immunology': allergyImmunologyTemplate,
};

export default additionalSpecialtyTemplates;
