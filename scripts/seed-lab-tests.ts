/**
 * Seed comprehensive lab tests / diagnostic tests
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz' });

// Category mapping based on test category
const CATEGORY_MAP: Record<string, number> = {
    'hematology': 2,      // Complete Blood Count
    'liver': 3,           // Biochemistry
    'kidney': 3,          // Biochemistry
    'diabetes': 6,        // Diabetes Tests
    'thyroid': 5,         // Thyroid Tests
    'lipid': 4,           // Lipid Profile
    'vitamin': 7,         // Vitamin & Mineral Tests
    'hormone': 8,         // Hormone Tests
    'tumor': 12,          // Cancer Markers
    'autoimmune': 11,     // Autoimmune Tests
    'infectious': 9,      // Infectious Disease Tests
    'urine': 14,          // Urine Tests
    'stool': 27,          // Stool Tests
    'imaging': 15,        // Imaging & Radiology
    'xray': 16,           // X-Ray
    'ct': 17,             // CT Scan
    'mri': 18,            // MRI
    'ultrasound': 19,     // Ultrasound
    'pet': 20,            // PET-CT
    'cardiac': 23,        // Cardiac Tests
    'pulmonary': 24,      // Pulmonary Tests
    'genetic': 26,        // Genetic Tests
    'allergy': 10,        // Allergy Tests
    'pathology': 25,      // Pathology (for biopsies/endoscopy)
    'default': 1,         // Blood Tests (default)
};

interface LabTest {
    name: string;
    slug: string;
    testType: string;
    category: string;
    description: string;
    avgPriceInr: number;
}

const LAB_TESTS: LabTest[] = [
    // Blood Tests - Hematology
    { name: 'Peripheral Blood Smear', slug: 'peripheral-blood-smear', testType: 'lab_test', category: 'hematology', description: 'Microscopic examination of blood cells', avgPriceInr: 300 },
    { name: 'Reticulocyte Count', slug: 'reticulocyte-count', testType: 'lab_test', category: 'hematology', description: 'Measures immature red blood cells', avgPriceInr: 250 },
    { name: 'Platelet Count', slug: 'platelet-count', testType: 'lab_test', category: 'hematology', description: 'Measures blood clotting cells', avgPriceInr: 150 },
    { name: 'Prothrombin Time (PT)', slug: 'prothrombin-time', testType: 'lab_test', category: 'hematology', description: 'Measures blood clotting time', avgPriceInr: 400 },
    { name: 'INR Test', slug: 'inr-test', testType: 'lab_test', category: 'hematology', description: 'International Normalized Ratio for blood clotting', avgPriceInr: 350 },
    { name: 'APTT Test', slug: 'aptt-test', testType: 'lab_test', category: 'hematology', description: 'Activated Partial Thromboplastin Time', avgPriceInr: 450 },
    { name: 'D-Dimer Test', slug: 'd-dimer-test', testType: 'lab_test', category: 'hematology', description: 'Detects blood clots', avgPriceInr: 1200 },
    { name: 'Fibrinogen Test', slug: 'fibrinogen-test', testType: 'lab_test', category: 'hematology', description: 'Measures clotting protein levels', avgPriceInr: 500 },
    { name: 'G6PD Test', slug: 'g6pd-test', testType: 'lab_test', category: 'hematology', description: 'Glucose-6-Phosphate Dehydrogenase deficiency test', avgPriceInr: 600 },

    // Blood Chemistry - Liver
    { name: 'ALT (SGPT) Test', slug: 'alt-sgpt-test', testType: 'lab_test', category: 'liver', description: 'Alanine Aminotransferase liver enzyme', avgPriceInr: 200 },
    { name: 'AST (SGOT) Test', slug: 'ast-sgot-test', testType: 'lab_test', category: 'liver', description: 'Aspartate Aminotransferase liver enzyme', avgPriceInr: 200 },
    { name: 'ALP Test', slug: 'alp-test', testType: 'lab_test', category: 'liver', description: 'Alkaline Phosphatase enzyme test', avgPriceInr: 200 },
    { name: 'GGT Test', slug: 'ggt-test', testType: 'lab_test', category: 'liver', description: 'Gamma-Glutamyl Transferase liver test', avgPriceInr: 300 },
    { name: 'Bilirubin Test (Total)', slug: 'bilirubin-total', testType: 'lab_test', category: 'liver', description: 'Measures bilirubin in blood', avgPriceInr: 150 },
    { name: 'Bilirubin Test (Direct)', slug: 'bilirubin-direct', testType: 'lab_test', category: 'liver', description: 'Measures direct bilirubin', avgPriceInr: 150 },
    { name: 'Albumin Test', slug: 'albumin-test', testType: 'lab_test', category: 'liver', description: 'Measures albumin protein', avgPriceInr: 200 },
    { name: 'Total Protein Test', slug: 'total-protein-test', testType: 'lab_test', category: 'liver', description: 'Measures total protein in blood', avgPriceInr: 200 },
    { name: 'Hepatitis B Surface Antigen (HBsAg)', slug: 'hbsag-test', testType: 'lab_test', category: 'infectious', description: 'Detects Hepatitis B infection', avgPriceInr: 400 },
    { name: 'Hepatitis C Antibody Test', slug: 'hcv-antibody', testType: 'lab_test', category: 'infectious', description: 'Detects Hepatitis C antibodies', avgPriceInr: 800 },
    { name: 'Hepatitis A IgM', slug: 'hepatitis-a-igm', testType: 'lab_test', category: 'infectious', description: 'Detects Hepatitis A infection', avgPriceInr: 700 },

    // Kidney Function
    { name: 'Cystatin C Test', slug: 'cystatin-c-test', testType: 'lab_test', category: 'kidney', description: 'Sensitive kidney function marker', avgPriceInr: 1500 },
    { name: 'Microalbumin Test', slug: 'microalbumin-test', testType: 'lab_test', category: 'kidney', description: 'Detects small amounts of albumin in urine', avgPriceInr: 500 },
    { name: 'eGFR Test', slug: 'egfr-test', testType: 'lab_test', category: 'kidney', description: 'Estimated Glomerular Filtration Rate', avgPriceInr: 400 },
    { name: '24-Hour Urine Protein', slug: '24-hour-urine-protein', testType: 'lab_test', category: 'urine', description: 'Measures protein loss in urine', avgPriceInr: 600 },

    // Diabetes Tests
    { name: 'Fasting Blood Sugar (FBS)', slug: 'fasting-blood-sugar', testType: 'lab_test', category: 'diabetes', description: 'Blood sugar after fasting', avgPriceInr: 80 },
    { name: 'Post Prandial Blood Sugar (PPBS)', slug: 'ppbs-test', testType: 'lab_test', category: 'diabetes', description: 'Blood sugar after meal', avgPriceInr: 80 },
    { name: 'Random Blood Sugar (RBS)', slug: 'random-blood-sugar', testType: 'lab_test', category: 'diabetes', description: 'Blood sugar at any time', avgPriceInr: 80 },
    { name: 'Oral Glucose Tolerance Test (OGTT)', slug: 'ogtt-test', testType: 'lab_test', category: 'diabetes', description: 'Tests glucose metabolism', avgPriceInr: 400 },
    { name: 'Fructosamine Test', slug: 'fructosamine-test', testType: 'lab_test', category: 'diabetes', description: 'Short-term diabetes control marker', avgPriceInr: 600 },
    { name: 'C-Peptide Test', slug: 'c-peptide-test', testType: 'lab_test', category: 'diabetes', description: 'Measures insulin production', avgPriceInr: 1200 },
    { name: 'Insulin Fasting', slug: 'insulin-fasting', testType: 'lab_test', category: 'diabetes', description: 'Measures fasting insulin levels', avgPriceInr: 800 },

    // Thyroid Tests
    { name: 'T3 Test', slug: 't3-test', testType: 'lab_test', category: 'thyroid', description: 'Triiodothyronine hormone level', avgPriceInr: 250 },
    { name: 'T4 Test', slug: 't4-test', testType: 'lab_test', category: 'thyroid', description: 'Thyroxine hormone level', avgPriceInr: 250 },
    { name: 'Free T3 Test', slug: 'free-t3-test', testType: 'lab_test', category: 'thyroid', description: 'Free Triiodothyronine level', avgPriceInr: 350 },
    { name: 'Free T4 Test', slug: 'free-t4-test', testType: 'lab_test', category: 'thyroid', description: 'Free Thyroxine level', avgPriceInr: 350 },
    { name: 'TSH Test', slug: 'tsh-test', testType: 'lab_test', category: 'thyroid', description: 'Thyroid Stimulating Hormone', avgPriceInr: 300 },
    { name: 'Anti-TPO Antibody', slug: 'anti-tpo-antibody', testType: 'lab_test', category: 'thyroid', description: 'Thyroid peroxidase antibodies', avgPriceInr: 800 },
    { name: 'Thyroglobulin Test', slug: 'thyroglobulin-test', testType: 'lab_test', category: 'tumor', description: 'Thyroid cancer marker', avgPriceInr: 1500 },

    // Lipid Profile Extended
    { name: 'Apolipoprotein A1', slug: 'apolipoprotein-a1', testType: 'lab_test', category: 'lipid', description: 'HDL component test', avgPriceInr: 800 },
    { name: 'Apolipoprotein B', slug: 'apolipoprotein-b', testType: 'lab_test', category: 'lipid', description: 'LDL component test', avgPriceInr: 800 },
    { name: 'Lipoprotein(a)', slug: 'lipoprotein-a', testType: 'lab_test', category: 'lipid', description: 'Cardiovascular risk marker', avgPriceInr: 1200 },
    { name: 'hs-CRP Test', slug: 'hs-crp-test', testType: 'lab_test', category: 'cardiac', description: 'High-sensitivity C-Reactive Protein', avgPriceInr: 600 },
    { name: 'Homocysteine Test', slug: 'homocysteine-test', testType: 'lab_test', category: 'cardiac', description: 'Cardiovascular risk marker', avgPriceInr: 1000 },

    // Vitamins & Minerals
    { name: 'Vitamin D Test (25-OH)', slug: 'vitamin-d-test', testType: 'lab_test', category: 'vitamin', description: 'Measures Vitamin D levels', avgPriceInr: 1200 },
    { name: 'Vitamin B12 Test', slug: 'vitamin-b12-test', testType: 'lab_test', category: 'vitamin', description: 'Measures B12 levels', avgPriceInr: 800 },
    { name: 'Folate Test', slug: 'folate-test', testType: 'lab_test', category: 'vitamin', description: 'Measures folic acid levels', avgPriceInr: 700 },
    { name: 'Iron Studies Panel', slug: 'iron-studies-panel', testType: 'lab_test', category: 'vitamin', description: 'Complete iron profile', avgPriceInr: 900 },
    { name: 'Ferritin Test', slug: 'ferritin-test', testType: 'lab_test', category: 'vitamin', description: 'Iron storage protein', avgPriceInr: 500 },
    { name: 'TIBC Test', slug: 'tibc-test', testType: 'lab_test', category: 'vitamin', description: 'Total Iron Binding Capacity', avgPriceInr: 400 },
    { name: 'Serum Iron Test', slug: 'serum-iron-test', testType: 'lab_test', category: 'vitamin', description: 'Measures iron in blood', avgPriceInr: 300 },
    { name: 'Calcium Test', slug: 'calcium-test', testType: 'lab_test', category: 'vitamin', description: 'Measures calcium levels', avgPriceInr: 200 },
    { name: 'Magnesium Test', slug: 'magnesium-test', testType: 'lab_test', category: 'vitamin', description: 'Measures magnesium levels', avgPriceInr: 300 },
    { name: 'Phosphorus Test', slug: 'phosphorus-test', testType: 'lab_test', category: 'vitamin', description: 'Measures phosphorus levels', avgPriceInr: 200 },
    { name: 'Zinc Test', slug: 'zinc-test', testType: 'lab_test', category: 'vitamin', description: 'Measures zinc levels', avgPriceInr: 600 },

    // Hormones
    { name: 'Cortisol Test', slug: 'cortisol-test', testType: 'lab_test', category: 'hormone', description: 'Measures stress hormone', avgPriceInr: 500 },
    { name: 'Testosterone Total', slug: 'testosterone-total', testType: 'lab_test', category: 'hormone', description: 'Total testosterone level', avgPriceInr: 600 },
    { name: 'Testosterone Free', slug: 'testosterone-free', testType: 'lab_test', category: 'hormone', description: 'Free testosterone level', avgPriceInr: 800 },
    { name: 'Estradiol (E2) Test', slug: 'estradiol-test', testType: 'lab_test', category: 'hormone', description: 'Estrogen hormone test', avgPriceInr: 700 },
    { name: 'Progesterone Test', slug: 'progesterone-test', testType: 'lab_test', category: 'hormone', description: 'Progesterone hormone level', avgPriceInr: 600 },
    { name: 'FSH Test', slug: 'fsh-test', testType: 'lab_test', category: 'hormone', description: 'Follicle Stimulating Hormone', avgPriceInr: 500 },
    { name: 'LH Test', slug: 'lh-test', testType: 'lab_test', category: 'hormone', description: 'Luteinizing Hormone', avgPriceInr: 500 },
    { name: 'Prolactin Test', slug: 'prolactin-test', testType: 'lab_test', category: 'hormone', description: 'Prolactin hormone level', avgPriceInr: 500 },
    { name: 'DHEA-S Test', slug: 'dhea-s-test', testType: 'lab_test', category: 'hormone', description: 'Adrenal hormone test', avgPriceInr: 800 },
    { name: 'Growth Hormone Test', slug: 'growth-hormone-test', testType: 'lab_test', category: 'hormone', description: 'GH level measurement', avgPriceInr: 1500 },
    { name: 'PTH (Parathyroid Hormone)', slug: 'pth-test', testType: 'lab_test', category: 'hormone', description: 'Parathyroid hormone level', avgPriceInr: 900 },

    // Tumor Markers
    { name: 'PSA (Prostate Specific Antigen)', slug: 'psa-test', testType: 'lab_test', category: 'tumor', description: 'Prostate cancer marker', avgPriceInr: 600 },
    { name: 'CA-125 Test', slug: 'ca-125-test', testType: 'lab_test', category: 'tumor', description: 'Ovarian cancer marker', avgPriceInr: 1200 },
    { name: 'CA 19-9 Test', slug: 'ca-19-9-test', testType: 'lab_test', category: 'tumor', description: 'Pancreatic cancer marker', avgPriceInr: 1200 },
    { name: 'CEA Test', slug: 'cea-test', testType: 'lab_test', category: 'tumor', description: 'Carcinoembryonic Antigen', avgPriceInr: 800 },
    { name: 'AFP Test', slug: 'afp-test', testType: 'lab_test', category: 'tumor', description: 'Alpha-Fetoprotein tumor marker', avgPriceInr: 700 },
    { name: 'CA 15-3 Test', slug: 'ca-15-3-test', testType: 'lab_test', category: 'tumor', description: 'Breast cancer marker', avgPriceInr: 1200 },
    { name: 'Beta HCG Test', slug: 'beta-hcg-test', testType: 'lab_test', category: 'hormone', description: 'Pregnancy/tumor marker', avgPriceInr: 500 },

    // Autoimmune Tests
    { name: 'ANA Test', slug: 'ana-test', testType: 'lab_test', category: 'autoimmune', description: 'Antinuclear Antibody test', avgPriceInr: 1000 },
    { name: 'Anti-dsDNA Test', slug: 'anti-dsdna-test', testType: 'lab_test', category: 'autoimmune', description: 'Lupus specific antibody', avgPriceInr: 1200 },
    { name: 'Rheumatoid Factor', slug: 'rheumatoid-factor', testType: 'lab_test', category: 'autoimmune', description: 'RA screening test', avgPriceInr: 500 },
    { name: 'Anti-CCP Antibody', slug: 'anti-ccp-test', testType: 'lab_test', category: 'autoimmune', description: 'Rheumatoid arthritis marker', avgPriceInr: 1500 },
    { name: 'CRP (C-Reactive Protein)', slug: 'crp-test', testType: 'lab_test', category: 'autoimmune', description: 'Inflammation marker', avgPriceInr: 300 },

    // Infectious Disease Tests
    { name: 'HIV 1 & 2 Antibody Test', slug: 'hiv-antibody-test', testType: 'lab_test', category: 'infectious', description: 'HIV screening test', avgPriceInr: 500 },
    { name: 'VDRL Test', slug: 'vdrl-test', testType: 'lab_test', category: 'infectious', description: 'Syphilis screening test', avgPriceInr: 200 },
    { name: 'Dengue NS1 Antigen', slug: 'dengue-ns1-test', testType: 'lab_test', category: 'infectious', description: 'Dengue early detection', avgPriceInr: 800 },
    { name: 'Dengue IgG/IgM', slug: 'dengue-antibody-test', testType: 'lab_test', category: 'infectious', description: 'Dengue antibody test', avgPriceInr: 1000 },
    { name: 'Malaria Antigen Test', slug: 'malaria-antigen-test', testType: 'lab_test', category: 'infectious', description: 'Rapid malaria detection', avgPriceInr: 400 },
    { name: 'Typhoid Test (Widal)', slug: 'widal-test', testType: 'lab_test', category: 'infectious', description: 'Typhoid fever test', avgPriceInr: 300 },
    { name: 'TB Gold Test', slug: 'tb-gold-test', testType: 'lab_test', category: 'infectious', description: 'Tuberculosis detection', avgPriceInr: 2500 },
    { name: 'COVID-19 RT-PCR', slug: 'covid-19-rtpcr', testType: 'lab_test', category: 'infectious', description: 'COVID-19 detection test', avgPriceInr: 500 },
    { name: 'COVID-19 Antibody Test', slug: 'covid-19-antibody', testType: 'lab_test', category: 'infectious', description: 'COVID-19 immunity test', avgPriceInr: 600 },

    // Urine Tests
    { name: 'Urine Routine & Microscopy', slug: 'urine-routine', testType: 'lab_test', category: 'urine', description: 'Complete urine analysis', avgPriceInr: 150 },
    { name: 'Urine Culture & Sensitivity', slug: 'urine-culture', testType: 'lab_test', category: 'urine', description: 'Detects urinary infections', avgPriceInr: 500 },
    { name: 'Urine Protein', slug: 'urine-protein', testType: 'lab_test', category: 'urine', description: 'Protein in urine', avgPriceInr: 100 },
    { name: 'Urine Creatinine', slug: 'urine-creatinine', testType: 'lab_test', category: 'urine', description: 'Kidney function marker', avgPriceInr: 200 },

    // Stool Tests
    { name: 'Stool Routine & Microscopy', slug: 'stool-routine', testType: 'lab_test', category: 'stool', description: 'Complete stool analysis', avgPriceInr: 150 },
    { name: 'Stool Culture', slug: 'stool-culture', testType: 'lab_test', category: 'stool', description: 'Detects GI infections', avgPriceInr: 600 },
    { name: 'Occult Blood Test', slug: 'occult-blood-test', testType: 'lab_test', category: 'stool', description: 'Hidden blood in stool', avgPriceInr: 200 },
    { name: 'H. Pylori Stool Antigen', slug: 'h-pylori-stool-test', testType: 'lab_test', category: 'stool', description: 'H. pylori detection', avgPriceInr: 800 },

    // Imaging Tests - X-Ray
    { name: 'Chest X-Ray', slug: 'chest-xray', testType: 'imaging', category: 'xray', description: 'X-ray of chest/lungs', avgPriceInr: 400 },
    { name: 'Abdomen X-Ray', slug: 'abdomen-xray', testType: 'imaging', category: 'xray', description: 'X-ray of abdomen', avgPriceInr: 400 },
    { name: 'Spine X-Ray', slug: 'spine-xray', testType: 'imaging', category: 'xray', description: 'X-ray of spine', avgPriceInr: 500 },
    { name: 'Skull X-Ray', slug: 'skull-xray', testType: 'imaging', category: 'xray', description: 'X-ray of skull', avgPriceInr: 400 },

    // Imaging Tests - CT
    { name: 'CT Scan Brain', slug: 'ct-scan-brain', testType: 'imaging', category: 'ct', description: 'CT imaging of brain', avgPriceInr: 3500 },
    { name: 'CT Scan Chest', slug: 'ct-scan-chest', testType: 'imaging', category: 'ct', description: 'CT imaging of chest', avgPriceInr: 4000 },
    { name: 'CT Scan Abdomen', slug: 'ct-scan-abdomen', testType: 'imaging', category: 'ct', description: 'CT imaging of abdomen', avgPriceInr: 4500 },
    { name: 'HRCT Chest', slug: 'hrct-chest', testType: 'imaging', category: 'ct', description: 'High resolution CT of lungs', avgPriceInr: 5000 },

    // Imaging Tests - MRI
    { name: 'MRI Brain', slug: 'mri-brain', testType: 'imaging', category: 'mri', description: 'MRI of brain', avgPriceInr: 6000 },
    { name: 'MRI Spine', slug: 'mri-spine', testType: 'imaging', category: 'mri', description: 'MRI of spine', avgPriceInr: 7000 },
    { name: 'MRI Knee', slug: 'mri-knee', testType: 'imaging', category: 'mri', description: 'MRI of knee joint', avgPriceInr: 6000 },
    { name: 'MRI Whole Body', slug: 'mri-whole-body', testType: 'imaging', category: 'mri', description: 'Full body MRI scan', avgPriceInr: 25000 },

    // Imaging Tests - PET/Specialized
    { name: 'PET Scan', slug: 'pet-scan', testType: 'imaging', category: 'pet', description: 'Positron Emission Tomography', avgPriceInr: 20000 },
    { name: 'Mammography', slug: 'mammography', testType: 'imaging', category: 'imaging', description: 'Breast cancer screening', avgPriceInr: 1500 },
    { name: 'DEXA Scan', slug: 'dexa-scan', testType: 'imaging', category: 'imaging', description: 'Bone density scan', avgPriceInr: 2000 },

    // Ultrasound Tests
    { name: 'Ultrasound Abdomen', slug: 'ultrasound-abdomen', testType: 'imaging', category: 'ultrasound', description: 'Abdominal ultrasound', avgPriceInr: 800 },
    { name: 'Ultrasound Pelvis', slug: 'ultrasound-pelvis', testType: 'imaging', category: 'ultrasound', description: 'Pelvic ultrasound', avgPriceInr: 800 },
    { name: 'Ultrasound Thyroid', slug: 'ultrasound-thyroid', testType: 'imaging', category: 'ultrasound', description: 'Thyroid ultrasound', avgPriceInr: 700 },
    { name: 'Ultrasound KUB', slug: 'ultrasound-kub', testType: 'imaging', category: 'ultrasound', description: 'Kidney, Ureter, Bladder scan', avgPriceInr: 800 },
    { name: 'Doppler - Carotid', slug: 'doppler-carotid', testType: 'imaging', category: 'ultrasound', description: 'Carotid artery scan', avgPriceInr: 1500 },
    { name: 'Doppler - Lower Limb', slug: 'doppler-lower-limb', testType: 'imaging', category: 'ultrasound', description: 'Leg blood flow scan', avgPriceInr: 1800 },
    { name: 'Fetal Ultrasound', slug: 'fetal-ultrasound', testType: 'imaging', category: 'ultrasound', description: 'Pregnancy scan', avgPriceInr: 1200 },
    { name: 'NT Scan', slug: 'nt-scan', testType: 'imaging', category: 'ultrasound', description: 'Nuchal Translucency scan', avgPriceInr: 2000 },
    { name: 'Anomaly Scan', slug: 'anomaly-scan', testType: 'imaging', category: 'ultrasound', description: 'Fetal anomaly screening', avgPriceInr: 2500 },

    // Cardiac Tests
    { name: 'ECG (Electrocardiogram)', slug: 'ecg-test', testType: 'cardiac', category: 'cardiac', description: 'Heart electrical activity', avgPriceInr: 200 },
    { name: 'Echocardiography', slug: 'echocardiography', testType: 'cardiac', category: 'cardiac', description: 'Heart ultrasound', avgPriceInr: 2000 },
    { name: 'Treadmill Test (TMT)', slug: 'tmt-test', testType: 'cardiac', category: 'cardiac', description: 'Stress test for heart', avgPriceInr: 1500 },
    { name: 'Holter Monitoring', slug: 'holter-monitoring', testType: 'cardiac', category: 'cardiac', description: '24-hour ECG monitoring', avgPriceInr: 2500 },
    { name: 'Cardiac MRI', slug: 'cardiac-mri', testType: 'cardiac', category: 'cardiac', description: 'Detailed heart imaging', avgPriceInr: 15000 },
    { name: 'Coronary Angiography', slug: 'coronary-angiography', testType: 'cardiac', category: 'cardiac', description: 'Heart blood vessel imaging', avgPriceInr: 25000 },
    { name: 'Troponin I Test', slug: 'troponin-i-test', testType: 'lab_test', category: 'cardiac', description: 'Heart attack marker', avgPriceInr: 800 },
    { name: 'BNP Test', slug: 'bnp-test', testType: 'lab_test', category: 'cardiac', description: 'Heart failure marker', avgPriceInr: 1500 },

    // Pulmonary Tests
    { name: 'Pulmonary Function Test (PFT)', slug: 'pft-test', testType: 'pulmonary', category: 'pulmonary', description: 'Lung function assessment', avgPriceInr: 1000 },
    { name: 'Spirometry', slug: 'spirometry', testType: 'pulmonary', category: 'pulmonary', description: 'Breathing capacity test', avgPriceInr: 600 },
    { name: 'Peak Flow Test', slug: 'peak-flow-test', testType: 'pulmonary', category: 'pulmonary', description: 'Asthma monitoring', avgPriceInr: 200 },
    { name: 'ABG (Arterial Blood Gas)', slug: 'abg-test', testType: 'lab_test', category: 'pulmonary', description: 'Blood oxygen levels', avgPriceInr: 800 },
    { name: 'Sleep Study (Polysomnography)', slug: 'sleep-study', testType: 'pulmonary', category: 'pulmonary', description: 'Sleep disorder diagnosis', avgPriceInr: 8000 },

    // Genetic Tests
    { name: 'Karyotyping', slug: 'karyotyping', testType: 'genetic', category: 'genetic', description: 'Chromosome analysis', avgPriceInr: 4000 },
    { name: 'NIPT (Non-Invasive Prenatal Test)', slug: 'nipt-test', testType: 'genetic', category: 'genetic', description: 'Prenatal genetic screening', avgPriceInr: 20000 },
    { name: 'HLA Typing', slug: 'hla-typing', testType: 'genetic', category: 'genetic', description: 'Tissue compatibility test', avgPriceInr: 8000 },
    { name: 'BRCA Gene Test', slug: 'brca-gene-test', testType: 'genetic', category: 'genetic', description: 'Breast cancer gene test', avgPriceInr: 25000 },
    { name: 'Thalassemia Screening', slug: 'thalassemia-screening', testType: 'genetic', category: 'genetic', description: 'Hemoglobin disorder test', avgPriceInr: 1500 },
    { name: 'Sickle Cell Test', slug: 'sickle-cell-test', testType: 'genetic', category: 'genetic', description: 'Sickle cell disease test', avgPriceInr: 500 },

    // Allergy Tests
    { name: 'IgE Total', slug: 'ige-total', testType: 'lab_test', category: 'allergy', description: 'Total allergy antibodies', avgPriceInr: 600 },
    { name: 'Allergy Panel - Food', slug: 'allergy-panel-food', testType: 'lab_test', category: 'allergy', description: 'Food allergy testing', avgPriceInr: 4000 },
    { name: 'Allergy Panel - Respiratory', slug: 'allergy-panel-respiratory', testType: 'lab_test', category: 'allergy', description: 'Inhalant allergy testing', avgPriceInr: 4000 },
    { name: 'Skin Prick Test', slug: 'skin-prick-test', testType: 'lab_test', category: 'allergy', description: 'Allergy skin testing', avgPriceInr: 2000 },

    // Endoscopy Tests
    { name: 'Upper GI Endoscopy', slug: 'upper-gi-endoscopy', testType: 'endoscopy', category: 'pathology', description: 'Stomach and esophagus exam', avgPriceInr: 5000 },
    { name: 'Colonoscopy', slug: 'colonoscopy', testType: 'endoscopy', category: 'pathology', description: 'Large intestine exam', avgPriceInr: 8000 },
    { name: 'Bronchoscopy', slug: 'bronchoscopy', testType: 'endoscopy', category: 'pathology', description: 'Airway examination', avgPriceInr: 10000 },
    { name: 'Cystoscopy', slug: 'cystoscopy', testType: 'endoscopy', category: 'pathology', description: 'Bladder examination', avgPriceInr: 6000 },

    // Biopsy Tests
    { name: 'Fine Needle Aspiration (FNAC)', slug: 'fnac-test', testType: 'pathology', category: 'pathology', description: 'Cell sample analysis', avgPriceInr: 1500 },
    { name: 'Core Needle Biopsy', slug: 'core-needle-biopsy', testType: 'pathology', category: 'pathology', description: 'Tissue sample analysis', avgPriceInr: 5000 },
    { name: 'Bone Marrow Biopsy', slug: 'bone-marrow-biopsy', testType: 'pathology', category: 'pathology', description: 'Blood disorder diagnosis', avgPriceInr: 6000 },
    { name: 'Liver Biopsy', slug: 'liver-biopsy', testType: 'pathology', category: 'pathology', description: 'Liver tissue analysis', avgPriceInr: 8000 },
];

async function main() {
    console.log('Starting lab tests seeding...\n');
    const client = await pool.connect();

    try {
        let created = 0;
        let skipped = 0;

        for (const test of LAB_TESTS) {
            const existing = await client.query(
                'SELECT id FROM diagnostic_tests WHERE slug = $1',
                [test.slug]
            );

            if (existing.rows.length > 0) {
                skipped++;
                continue;
            }

            // Determine category based on test category field
            const categoryId = CATEGORY_MAP[test.category] || CATEGORY_MAP['default'];

            await client.query(`
                INSERT INTO diagnostic_tests (
                    name, slug, test_type, description, avg_price_inr, category_id,
                    is_active, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
            `, [
                test.name,
                test.slug,
                test.testType,
                test.description,
                test.avgPriceInr,
                categoryId,
            ]);

            console.log(`  Created: ${test.name}`);
            created++;
        }

        console.log(`\nCompleted!`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped} (already exist)`);

        // Show final count
        const total = await client.query('SELECT COUNT(*) FROM diagnostic_tests');
        console.log(`   Total lab tests now: ${total.rows[0].count}`);

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
