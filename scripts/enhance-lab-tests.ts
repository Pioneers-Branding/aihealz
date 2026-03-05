/**
 * Enhance lab tests with detailed medical data
 * Adds: preparation instructions, normal ranges, sample types, report times, body systems
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz' });

interface TestEnhancement {
    slug: string;
    sampleType?: string;
    fastingRequired?: boolean;
    fastingHours?: number;
    reportTimeHours?: number;
    bodySystem?: string;
    preparationInstructions?: string;
    normalRanges?: Record<string, string>;
}

const TEST_ENHANCEMENTS: TestEnhancement[] = [
    // ================== HEMATOLOGY ==================
    {
        slug: 'complete-blood-count',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No special preparation required. Inform your doctor about any medications you are taking. Stay well hydrated before the test.',
        normalRanges: {
            'Hemoglobin (Male)': '13.5-17.5 g/dL',
            'Hemoglobin (Female)': '12.0-16.0 g/dL',
            'RBC (Male)': '4.5-5.5 million/mcL',
            'RBC (Female)': '4.0-5.0 million/mcL',
            'WBC': '4,500-11,000/mcL',
            'Platelets': '150,000-400,000/mcL',
            'Hematocrit (Male)': '38.8-50%',
            'Hematocrit (Female)': '34.9-44.5%',
            'MCV': '80-100 fL',
            'MCH': '27-33 pg',
            'MCHC': '32-36 g/dL'
        }
    },
    {
        slug: 'peripheral-blood-smear',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No fasting required. Avoid strenuous exercise 24 hours before the test. Inform your doctor about all medications.',
        normalRanges: {
            'RBC Morphology': 'Normocytic, normochromic',
            'WBC Differential': 'Normal distribution',
            'Platelet Estimate': 'Adequate'
        }
    },
    {
        slug: 'reticulocyte-count',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No special preparation needed. Inform your doctor if you have received a blood transfusion recently.',
        normalRanges: {
            'Reticulocyte Count': '0.5-2.5%',
            'Absolute Reticulocyte Count': '25,000-125,000/mcL'
        }
    },
    {
        slug: 'platelet-count',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No fasting required. Avoid aspirin and NSAIDs for 7 days before if instructed by your doctor.',
        normalRanges: {
            'Platelet Count': '150,000-400,000/mcL'
        }
    },
    {
        slug: 'prothrombin-time',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Hematologic',
        preparationInstructions: 'Inform your doctor about all medications, especially blood thinners like warfarin. Avoid vitamin K supplements.',
        normalRanges: {
            'PT': '11-13.5 seconds',
            'INR (not on warfarin)': '0.8-1.1',
            'INR (on warfarin)': '2.0-3.0'
        }
    },
    {
        slug: 'inr-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Hematologic',
        preparationInstructions: 'Take your warfarin at the same time daily. Maintain consistent vitamin K intake. Report any bleeding or bruising.',
        normalRanges: {
            'INR (not on anticoagulants)': '0.8-1.1',
            'INR (atrial fibrillation)': '2.0-3.0',
            'INR (mechanical heart valve)': '2.5-3.5'
        }
    },
    {
        slug: 'aptt-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Hematologic',
        preparationInstructions: 'Inform your doctor about heparin or other anticoagulant medications. No special dietary restrictions.',
        normalRanges: {
            'aPTT': '25-35 seconds',
            'aPTT (on heparin therapy)': '1.5-2.5x control'
        }
    },
    {
        slug: 'd-dimer-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No special preparation. Inform your doctor if you are pregnant, had recent surgery, or have liver disease.',
        normalRanges: {
            'D-Dimer': '<0.50 mg/L FEU',
            'D-Dimer (age-adjusted >50 years)': 'Age x 10 ng/mL'
        }
    },
    {
        slug: 'fibrinogen-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No fasting required. Avoid strenuous exercise before the test. Inform doctor about recent infections or surgeries.',
        normalRanges: {
            'Fibrinogen': '200-400 mg/dL'
        }
    },
    {
        slug: 'g6pd-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Hematologic',
        preparationInstructions: 'Avoid fava beans, certain medications (sulfonamides, antimalarials) before the test. Wait 3 months after a hemolytic episode.',
        normalRanges: {
            'G6PD Activity (Male)': '4.6-13.5 U/g Hb',
            'G6PD Activity (Female)': '4.0-12.0 U/g Hb'
        }
    },

    // ================== LIVER FUNCTION ==================
    {
        slug: 'alt-sgpt-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'Fasting not required but avoid alcohol for 24 hours. Inform doctor about all medications including herbal supplements.',
        normalRanges: {
            'ALT (Male)': '7-56 U/L',
            'ALT (Female)': '7-45 U/L'
        }
    },
    {
        slug: 'ast-sgot-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'Avoid strenuous exercise 24 hours before test. Avoid alcohol for 24 hours. Report all medications to your doctor.',
        normalRanges: {
            'AST (Male)': '8-48 U/L',
            'AST (Female)': '8-43 U/L'
        }
    },
    {
        slug: 'alp-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 10,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'Fasting for 10-12 hours required. Avoid fatty foods the night before. Inform doctor about bone medications.',
        normalRanges: {
            'ALP (Adult)': '44-147 U/L',
            'ALP (Children)': 'Higher due to bone growth'
        }
    },
    {
        slug: 'ggt-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'Fasting for 8-12 hours. Avoid alcohol for at least 24 hours, preferably 72 hours. Report all medications.',
        normalRanges: {
            'GGT (Male)': '8-61 U/L',
            'GGT (Female)': '5-36 U/L'
        }
    },
    {
        slug: 'bilirubin-total',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 4,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'Fasting for 4 hours recommended. Avoid prolonged fasting which can increase bilirubin. Stay hydrated.',
        normalRanges: {
            'Total Bilirubin': '0.1-1.2 mg/dL',
            'Newborn (24 hours)': '<6 mg/dL',
            'Newborn (48 hours)': '<8 mg/dL'
        }
    },
    {
        slug: 'bilirubin-direct',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'No fasting required. Inform your doctor if you have jaundice or dark urine.',
        normalRanges: {
            'Direct Bilirubin': '0.0-0.3 mg/dL'
        }
    },
    {
        slug: 'albumin-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'No fasting required. Stay well hydrated. Inform doctor about recent illnesses or surgeries.',
        normalRanges: {
            'Serum Albumin': '3.5-5.0 g/dL'
        }
    },
    {
        slug: 'total-protein-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Hepatic',
        preparationInstructions: 'No fasting required. Avoid prolonged tourniquet application during blood draw.',
        normalRanges: {
            'Total Protein': '6.0-8.3 g/dL',
            'Albumin': '3.5-5.0 g/dL',
            'Globulin': '2.0-3.5 g/dL'
        }
    },

    // ================== KIDNEY FUNCTION ==================
    {
        slug: 'cystatin-c-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Renal',
        preparationInstructions: 'No fasting required. More accurate than creatinine for kidney function in elderly and muscular individuals.',
        normalRanges: {
            'Cystatin C': '0.56-0.98 mg/L'
        }
    },
    {
        slug: 'microalbumin-test',
        sampleType: 'urine',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Renal',
        preparationInstructions: 'Collect first morning urine sample. Avoid strenuous exercise 24 hours before. Avoid urinary tract infections.',
        normalRanges: {
            'Urine Microalbumin': '<30 mg/24 hours',
            'Albumin/Creatinine Ratio': '<30 mg/g'
        }
    },
    {
        slug: 'egfr-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Renal',
        preparationInstructions: 'No fasting required. Calculated from creatinine, age, sex, and race. Avoid high protein meals before test.',
        normalRanges: {
            'eGFR (Normal)': '>90 mL/min/1.73m²',
            'Stage 2 CKD': '60-89 mL/min/1.73m²',
            'Stage 3a CKD': '45-59 mL/min/1.73m²',
            'Stage 3b CKD': '30-44 mL/min/1.73m²',
            'Stage 4 CKD': '15-29 mL/min/1.73m²',
            'Stage 5 CKD': '<15 mL/min/1.73m²'
        }
    },
    {
        slug: '24-hour-urine-protein',
        sampleType: 'urine',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Renal',
        preparationInstructions: 'Collect all urine for 24 hours. Start after first morning void. Keep refrigerated. Record total volume.',
        normalRanges: {
            '24-hour Urine Protein': '<150 mg/24 hours',
            'Nephrotic Range': '>3.5 g/24 hours'
        }
    },

    // ================== DIABETES ==================
    {
        slug: 'fasting-blood-sugar',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 2,
        bodySystem: 'Endocrine',
        preparationInstructions: 'Fast for 8-12 hours (water allowed). Take test in the morning. Avoid alcohol the night before. Continue regular medications unless advised otherwise.',
        normalRanges: {
            'Normal': '70-99 mg/dL',
            'Prediabetes': '100-125 mg/dL',
            'Diabetes': '≥126 mg/dL'
        }
    },
    {
        slug: 'ppbs-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 2,
        bodySystem: 'Endocrine',
        preparationInstructions: 'Eat a normal meal. Blood is drawn exactly 2 hours after the first bite of meal. Do not snack between meal and test.',
        normalRanges: {
            'Normal': '<140 mg/dL',
            'Prediabetes': '140-199 mg/dL',
            'Diabetes': '≥200 mg/dL'
        }
    },
    {
        slug: 'random-blood-sugar',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 1,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Can be done any time of day regardless of when you last ate.',
        normalRanges: {
            'Normal': '<140 mg/dL',
            'Diabetes (with symptoms)': '≥200 mg/dL'
        }
    },
    {
        slug: 'hba1c-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Reflects average blood sugar over past 2-3 months. Recent blood transfusion may affect results.',
        normalRanges: {
            'Normal': '<5.7%',
            'Prediabetes': '5.7-6.4%',
            'Diabetes': '≥6.5%',
            'Target for diabetics': '<7%'
        }
    },
    {
        slug: 'ogtt-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 4,
        bodySystem: 'Endocrine',
        preparationInstructions: 'Fast for 8-14 hours. Eat normally for 3 days before. Avoid smoking. Stay seated during test. Multiple blood draws over 2 hours.',
        normalRanges: {
            'Fasting': '<100 mg/dL',
            '2-hour': '<140 mg/dL',
            'Gestational Diabetes 1-hour': '<180 mg/dL',
            'Gestational Diabetes 2-hour': '<153 mg/dL'
        }
    },
    {
        slug: 'fructosamine-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Reflects blood sugar control over past 2-3 weeks. Useful when HbA1c is unreliable.',
        normalRanges: {
            'Non-diabetic': '200-285 µmol/L',
            'Well-controlled diabetes': '<350 µmol/L'
        }
    },
    {
        slug: 'c-peptide-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'Fasting for 8-12 hours required. Helps differentiate Type 1 from Type 2 diabetes. Report insulin use.',
        normalRanges: {
            'Fasting C-Peptide': '0.5-2.0 ng/mL'
        }
    },
    {
        slug: 'insulin-fasting',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'Fasting for 8-12 hours required. Do not take insulin or diabetes medications before test unless instructed.',
        normalRanges: {
            'Fasting Insulin': '2.6-24.9 µIU/mL',
            'HOMA-IR (Insulin Resistance)': '<2.5'
        }
    },

    // ================== THYROID ==================
    {
        slug: 't3-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Take thyroid medications after blood draw. Inform about biotin supplements (can interfere).',
        normalRanges: {
            'Total T3': '80-200 ng/dL'
        }
    },
    {
        slug: 't4-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Take thyroid medications after blood draw. Report all medications including birth control pills.',
        normalRanges: {
            'Total T4': '5.0-12.0 µg/dL'
        }
    },
    {
        slug: 'free-t3-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Stop biotin supplements 2 days before test. Take thyroid medications after blood draw.',
        normalRanges: {
            'Free T3': '2.3-4.2 pg/mL'
        }
    },
    {
        slug: 'free-t4-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Stop biotin supplements 2 days before test. More accurate than total T4 in pregnancy.',
        normalRanges: {
            'Free T4': '0.8-1.8 ng/dL'
        }
    },
    {
        slug: 'tsh-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Best done in the morning. Take thyroid medications after blood draw. Stop biotin 2 days before.',
        normalRanges: {
            'TSH (Adult)': '0.4-4.0 mIU/L',
            'TSH (Pregnancy 1st trimester)': '0.1-2.5 mIU/L',
            'TSH (Pregnancy 2nd trimester)': '0.2-3.0 mIU/L',
            'TSH (Pregnancy 3rd trimester)': '0.3-3.0 mIU/L'
        }
    },
    {
        slug: 'anti-tpo-antibody',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Used to diagnose autoimmune thyroid disease. One-time test usually sufficient.',
        normalRanges: {
            'Anti-TPO Antibodies': '<35 IU/mL'
        }
    },
    {
        slug: 'thyroglobulin-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Used to monitor thyroid cancer after treatment. Anti-thyroglobulin antibodies tested simultaneously.',
        normalRanges: {
            'Thyroglobulin (with thyroid)': '3-40 ng/mL',
            'Thyroglobulin (after thyroidectomy)': '<1 ng/mL'
        }
    },

    // ================== LIPID PROFILE ==================
    {
        slug: 'lipid-profile',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 12,
        reportTimeHours: 6,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'Fast for 9-12 hours. Water is allowed. Avoid alcohol for 24 hours. Avoid fatty foods the day before.',
        normalRanges: {
            'Total Cholesterol': '<200 mg/dL (desirable)',
            'LDL Cholesterol': '<100 mg/dL (optimal)',
            'HDL Cholesterol (Male)': '>40 mg/dL',
            'HDL Cholesterol (Female)': '>50 mg/dL',
            'Triglycerides': '<150 mg/dL',
            'VLDL': '5-40 mg/dL'
        }
    },
    {
        slug: 'apolipoprotein-a1',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'No fasting required. Main protein component of HDL cholesterol. Good indicator of cardiovascular health.',
        normalRanges: {
            'Apo A1 (Male)': '94-176 mg/dL',
            'Apo A1 (Female)': '101-199 mg/dL'
        }
    },
    {
        slug: 'apolipoprotein-b',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'No fasting required. Better predictor of heart disease than LDL in some cases. One molecule per LDL particle.',
        normalRanges: {
            'Apo B (Low risk)': '<90 mg/dL',
            'Apo B (Moderate risk)': '<80 mg/dL',
            'Apo B (High risk)': '<70 mg/dL'
        }
    },
    {
        slug: 'lipoprotein-a',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'No fasting required. Genetically determined - levels dont change much with lifestyle. One-time test usually sufficient.',
        normalRanges: {
            'Lp(a)': '<30 mg/dL (desirable)',
            'Lp(a) High Risk': '>50 mg/dL'
        }
    },
    {
        slug: 'hs-crp-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'No fasting required. Avoid testing during acute illness or infection. Marker of inflammation and cardiovascular risk.',
        normalRanges: {
            'Low Risk': '<1.0 mg/L',
            'Moderate Risk': '1.0-3.0 mg/L',
            'High Risk': '>3.0 mg/L'
        }
    },
    {
        slug: 'homocysteine-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 10,
        reportTimeHours: 24,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'Fasting for 10-12 hours required. Elevated levels linked to heart disease and B vitamin deficiency.',
        normalRanges: {
            'Normal': '5-15 µmol/L',
            'Elevated': '>15 µmol/L'
        }
    },

    // ================== VITAMINS & MINERALS ==================
    {
        slug: 'vitamin-d-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Musculoskeletal',
        preparationInstructions: 'No fasting required. Stop vitamin D supplements 24 hours before if monitoring therapy. Best tested in late winter.',
        normalRanges: {
            'Deficient': '<20 ng/mL',
            'Insufficient': '20-29 ng/mL',
            'Sufficient': '30-100 ng/mL',
            'Toxic': '>100 ng/mL'
        }
    },
    {
        slug: 'vitamin-b12-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No fasting required. Stop B12 supplements 24 hours before. Inform about vegetarian/vegan diet.',
        normalRanges: {
            'Normal': '200-900 pg/mL',
            'Deficient': '<200 pg/mL',
            'Borderline': '200-300 pg/mL'
        }
    },
    {
        slug: 'folate-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No fasting required. Stop folic acid supplements if monitoring. Important for pregnant women.',
        normalRanges: {
            'Serum Folate': '2.7-17.0 ng/mL',
            'RBC Folate': '140-628 ng/mL'
        }
    },
    {
        slug: 'iron-studies-panel',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 12,
        reportTimeHours: 24,
        bodySystem: 'Hematologic',
        preparationInstructions: 'Fasting for 12 hours required. Test in the morning. Stop iron supplements for 24 hours if instructed.',
        normalRanges: {
            'Serum Iron': '60-170 µg/dL',
            'TIBC': '250-400 µg/dL',
            'Transferrin Saturation': '20-50%',
            'Ferritin (Male)': '20-250 ng/mL',
            'Ferritin (Female)': '10-120 ng/mL'
        }
    },
    {
        slug: 'ferritin-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Hematologic',
        preparationInstructions: 'No fasting required. Can be elevated in inflammation, infection, or liver disease. Inform about recent illnesses.',
        normalRanges: {
            'Male': '20-250 ng/mL',
            'Female (premenopausal)': '10-120 ng/mL',
            'Female (postmenopausal)': '12-150 ng/mL'
        }
    },
    {
        slug: 'tibc-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 12,
        reportTimeHours: 24,
        bodySystem: 'Hematologic',
        preparationInstructions: 'Fasting for 12 hours required. Measures transferrin (iron transport protein) capacity.',
        normalRanges: {
            'TIBC': '250-400 µg/dL'
        }
    },
    {
        slug: 'serum-iron-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 12,
        reportTimeHours: 6,
        bodySystem: 'Hematologic',
        preparationInstructions: 'Fasting for 12 hours. Morning sample preferred as iron levels vary during day. Stop iron supplements if instructed.',
        normalRanges: {
            'Serum Iron': '60-170 µg/dL'
        }
    },
    {
        slug: 'calcium-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Musculoskeletal',
        preparationInstructions: 'No fasting required. Avoid calcium supplements morning of test. Report vitamin D and parathyroid medications.',
        normalRanges: {
            'Total Calcium': '8.6-10.2 mg/dL',
            'Ionized Calcium': '4.5-5.6 mg/dL'
        }
    },
    {
        slug: 'magnesium-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Musculoskeletal',
        preparationInstructions: 'No fasting required. Inform about magnesium supplements, diuretics, and proton pump inhibitors.',
        normalRanges: {
            'Serum Magnesium': '1.7-2.2 mg/dL'
        }
    },
    {
        slug: 'phosphorus-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 6,
        bodySystem: 'Musculoskeletal',
        preparationInstructions: 'Fasting for 8-12 hours preferred. Avoid phosphate-containing laxatives. Report kidney disease.',
        normalRanges: {
            'Adult': '2.5-4.5 mg/dL',
            'Children': '4.5-6.5 mg/dL'
        }
    },
    {
        slug: 'zinc-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 48,
        bodySystem: 'Immune',
        preparationInstructions: 'Fasting for 8-12 hours required. Morning sample preferred. Avoid zinc supplements for 24 hours.',
        normalRanges: {
            'Serum Zinc': '60-120 µg/dL'
        }
    },

    // ================== HORMONES ==================
    {
        slug: 'cortisol-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'Morning sample required (8-9 AM). Avoid strenuous exercise. Report steroid medications. Stay calm before test.',
        normalRanges: {
            'Morning (8 AM)': '6-23 µg/dL',
            'Afternoon (4 PM)': '3-15 µg/dL'
        }
    },
    {
        slug: 'testosterone-total',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 24,
        bodySystem: 'Reproductive',
        preparationInstructions: 'Morning sample required (7-10 AM). Fast overnight. Avoid testosterone supplements. Levels vary with age.',
        normalRanges: {
            'Male (Adult)': '270-1070 ng/dL',
            'Female': '15-70 ng/dL'
        }
    },
    {
        slug: 'testosterone-free',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 24,
        bodySystem: 'Reproductive',
        preparationInstructions: 'Morning sample required (7-10 AM). More accurate than total testosterone in obese individuals.',
        normalRanges: {
            'Male (20-29 years)': '9.3-26.5 pg/mL',
            'Male (30-39 years)': '8.7-25.1 pg/mL',
            'Male (40-49 years)': '6.8-21.5 pg/mL',
            'Female': '0.3-1.9 pg/mL'
        }
    },
    {
        slug: 'estradiol-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Reproductive',
        preparationInstructions: 'No fasting required. For women: note menstrual cycle day. Stop estrogen medications if instructed.',
        normalRanges: {
            'Male': '10-40 pg/mL',
            'Female (Follicular)': '12.5-166 pg/mL',
            'Female (Ovulatory)': '85-498 pg/mL',
            'Female (Luteal)': '43-211 pg/mL',
            'Female (Postmenopausal)': '<10-50 pg/mL'
        }
    },
    {
        slug: 'progesterone-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Reproductive',
        preparationInstructions: 'No fasting required. Best done day 21 of menstrual cycle (7 days before expected period) to confirm ovulation.',
        normalRanges: {
            'Male': '<1 ng/mL',
            'Female (Follicular)': '<1 ng/mL',
            'Female (Luteal)': '5-20 ng/mL',
            'Female (Postmenopausal)': '<1 ng/mL',
            '1st Trimester': '11-44 ng/mL'
        }
    },
    {
        slug: 'fsh-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Reproductive',
        preparationInstructions: 'No fasting required. For women: best done on day 2-3 of menstrual cycle. Report hormone medications.',
        normalRanges: {
            'Male': '1.5-12.4 mIU/mL',
            'Female (Follicular)': '3.5-12.5 mIU/mL',
            'Female (Ovulatory)': '4.7-21.5 mIU/mL',
            'Female (Luteal)': '1.7-7.7 mIU/mL',
            'Female (Postmenopausal)': '25.8-134.8 mIU/mL'
        }
    },
    {
        slug: 'lh-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Reproductive',
        preparationInstructions: 'No fasting required. For women: best done on day 2-3 of menstrual cycle or during suspected ovulation.',
        normalRanges: {
            'Male': '1.7-8.6 mIU/mL',
            'Female (Follicular)': '2.4-12.6 mIU/mL',
            'Female (Ovulatory)': '14.0-95.6 mIU/mL',
            'Female (Luteal)': '1.0-11.4 mIU/mL',
            'Female (Postmenopausal)': '7.7-58.5 mIU/mL'
        }
    },
    {
        slug: 'prolactin-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Morning sample preferred. Avoid breast stimulation before test. Report medications.',
        normalRanges: {
            'Male': '2-18 ng/mL',
            'Female (Non-pregnant)': '2-29 ng/mL',
            'Female (Pregnant)': '10-209 ng/mL'
        }
    },
    {
        slug: 'dhea-s-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Levels decline with age. Used to evaluate adrenal function.',
        normalRanges: {
            'Male (20-29)': '280-640 µg/dL',
            'Male (30-39)': '120-520 µg/dL',
            'Female (20-29)': '65-380 µg/dL',
            'Female (30-39)': '45-270 µg/dL'
        }
    },
    {
        slug: 'growth-hormone-test',
        sampleType: 'blood',
        fastingRequired: true,
        fastingHours: 10,
        reportTimeHours: 48,
        bodySystem: 'Endocrine',
        preparationInstructions: 'Fasting for 10-12 hours. Avoid vigorous exercise. Morning sample preferred. May require stimulation test.',
        normalRanges: {
            'Adult (Fasting)': '<5 ng/mL',
            'After stimulation': '>10 ng/mL'
        }
    },
    {
        slug: 'pth-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Endocrine',
        preparationInstructions: 'No fasting required. Often done with calcium and vitamin D tests. Report any calcium or vitamin D supplements.',
        normalRanges: {
            'Intact PTH': '10-65 pg/mL'
        }
    },

    // ================== TUMOR MARKERS ==================
    {
        slug: 'psa-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Reproductive',
        preparationInstructions: 'Avoid ejaculation for 48 hours. No digital rectal exam or prostate manipulation for 1 week. No vigorous cycling.',
        normalRanges: {
            'Age 40-49': '<2.5 ng/mL',
            'Age 50-59': '<3.5 ng/mL',
            'Age 60-69': '<4.5 ng/mL',
            'Age 70+': '<6.5 ng/mL'
        }
    },
    {
        slug: 'ca-125-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Reproductive',
        preparationInstructions: 'No fasting required. Can be elevated during menstruation, pregnancy, or pelvic inflammatory disease.',
        normalRanges: {
            'Normal': '<35 U/mL'
        }
    },
    {
        slug: 'ca-19-9-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Gastrointestinal',
        preparationInstructions: 'No fasting required. Used to monitor pancreatic cancer treatment. Can be elevated in biliary obstruction.',
        normalRanges: {
            'Normal': '<37 U/mL'
        }
    },
    {
        slug: 'cea-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Gastrointestinal',
        preparationInstructions: 'No fasting required. Used to monitor colorectal cancer. Smokers may have higher baseline levels.',
        normalRanges: {
            'Non-smoker': '<3.0 ng/mL',
            'Smoker': '<5.0 ng/mL'
        }
    },
    {
        slug: 'afp-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Hepatic',
        preparationInstructions: 'No fasting required. Used to monitor liver cancer and testicular cancer. Elevated in pregnancy.',
        normalRanges: {
            'Adult (Non-pregnant)': '<10 ng/mL'
        }
    },
    {
        slug: 'ca-15-3-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Reproductive',
        preparationInstructions: 'No fasting required. Used to monitor breast cancer treatment. Not for screening.',
        normalRanges: {
            'Normal': '<30 U/mL'
        }
    },
    {
        slug: 'beta-hcg-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Reproductive',
        preparationInstructions: 'No fasting required. Doubling time important in early pregnancy monitoring.',
        normalRanges: {
            'Non-pregnant': '<5 mIU/mL',
            '3 weeks': '5-50 mIU/mL',
            '4 weeks': '5-426 mIU/mL',
            '5 weeks': '18-7,340 mIU/mL',
            '6 weeks': '1,080-56,500 mIU/mL'
        }
    },

    // ================== CARDIAC TESTS ==================
    {
        slug: 'ecg-test',
        sampleType: 'none',
        fastingRequired: false,
        reportTimeHours: 1,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'Wear loose clothing. Avoid lotions on chest. Avoid caffeine and smoking 2 hours before. Stay calm and relaxed.',
        normalRanges: {
            'Heart Rate': '60-100 bpm',
            'PR Interval': '0.12-0.20 sec',
            'QRS Duration': '<0.12 sec',
            'QTc': '<450 ms'
        }
    },
    {
        slug: 'echocardiography',
        sampleType: 'none',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'No fasting for standard echo. TEE requires 6-hour fast. Wear two-piece clothing. Remove jewelry.',
        normalRanges: {
            'Ejection Fraction': '55-70%',
            'LV End-Diastolic Diameter': '39-53 mm',
            'LA Diameter': '19-40 mm'
        }
    },
    {
        slug: 'tmt-test',
        sampleType: 'none',
        fastingRequired: true,
        fastingHours: 4,
        reportTimeHours: 2,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'Light meal 4 hours before. Wear comfortable walking shoes and clothes. Avoid caffeine and smoking. Ask doctor about medications.',
        normalRanges: {
            'Target Heart Rate': '85% of (220-age)',
            'Duke Score': '≥5 (low risk)'
        }
    },
    {
        slug: 'holter-monitoring',
        sampleType: 'none',
        fastingRequired: false,
        reportTimeHours: 72,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'Shower before wearing monitor. Keep diary of activities and symptoms. Avoid magnets and metal detectors.',
        normalRanges: {
            'Heart Rate': '60-100 bpm (awake)',
            'Heart Rate (sleep)': '40-60 bpm'
        }
    },
    {
        slug: 'troponin-i-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 2,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'No fasting required. Serial testing may be needed. Report chest pain duration and severity.',
        normalRanges: {
            'Normal': '<0.04 ng/mL',
            'Elevated (possible MI)': '>0.4 ng/mL'
        }
    },
    {
        slug: 'bnp-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Cardiovascular',
        preparationInstructions: 'No fasting required. Used to evaluate heart failure. Levels increase with age and obesity.',
        normalRanges: {
            'BNP (Age <75)': '<125 pg/mL',
            'BNP (Age >75)': '<450 pg/mL',
            'NT-proBNP (Age <75)': '<125 pg/mL'
        }
    },

    // ================== IMAGING ==================
    {
        slug: 'chest-xray',
        sampleType: 'none',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Respiratory',
        preparationInstructions: 'Remove jewelry and metallic objects. Wear a gown if provided. Inform technician if pregnant.',
        normalRanges: {}
    },
    {
        slug: 'ct-scan-brain',
        sampleType: 'none',
        fastingRequired: true,
        fastingHours: 4,
        reportTimeHours: 24,
        bodySystem: 'Neurological',
        preparationInstructions: 'Fast 4 hours if contrast used. Report kidney problems or allergies. Remove jewelry and hearing aids.',
        normalRanges: {}
    },
    {
        slug: 'mri-brain',
        sampleType: 'none',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Neurological',
        preparationInstructions: 'Remove all metal objects. Report implants, pacemakers, or claustrophobia. May take 30-60 minutes.',
        normalRanges: {}
    },
    {
        slug: 'ultrasound-abdomen',
        sampleType: 'none',
        fastingRequired: true,
        fastingHours: 8,
        reportTimeHours: 2,
        bodySystem: 'Gastrointestinal',
        preparationInstructions: 'Fast for 8-12 hours. Full bladder may be required for pelvic view. Wear loose comfortable clothing.',
        normalRanges: {
            'Liver Size': '<15 cm',
            'Spleen Size': '<12 cm',
            'Kidney Size': '10-12 cm'
        }
    },

    // ================== INFECTIOUS DISEASE ==================
    {
        slug: 'hiv-antibody-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Immune',
        preparationInstructions: 'No fasting required. Window period of 2-4 weeks after exposure. Confirmatory test needed if positive.',
        normalRanges: {
            'Result': 'Non-reactive (Negative)'
        }
    },
    {
        slug: 'hbsag-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Hepatic',
        preparationInstructions: 'No fasting required. Part of hepatitis panel. Important for pregnancy screening.',
        normalRanges: {
            'Result': 'Non-reactive (Negative)'
        }
    },
    {
        slug: 'covid-19-rtpcr',
        sampleType: 'nasal swab',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Respiratory',
        preparationInstructions: 'Do not eat, drink, or use mouthwash 30 minutes before. Blow nose before swab. Inform about symptoms.',
        normalRanges: {
            'Result': 'Not Detected (Negative)'
        }
    },

    // ================== URINE TESTS ==================
    {
        slug: 'urine-routine',
        sampleType: 'urine',
        fastingRequired: false,
        reportTimeHours: 4,
        bodySystem: 'Renal',
        preparationInstructions: 'Collect midstream clean-catch sample. First morning sample preferred. Avoid contamination. Label properly.',
        normalRanges: {
            'pH': '4.5-8.0',
            'Specific Gravity': '1.005-1.030',
            'Protein': 'Negative',
            'Glucose': 'Negative',
            'Blood': 'Negative',
            'WBC': '<5/HPF',
            'RBC': '<3/HPF'
        }
    },
    {
        slug: 'urine-culture',
        sampleType: 'urine',
        fastingRequired: false,
        reportTimeHours: 72,
        bodySystem: 'Renal',
        preparationInstructions: 'Collect midstream clean-catch sample in sterile container. First morning sample preferred. Deliver within 2 hours.',
        normalRanges: {
            'Bacteria': '<100,000 CFU/mL (negative)',
            'Infection': '≥100,000 CFU/mL'
        }
    },

    // ================== STOOL TESTS ==================
    {
        slug: 'stool-routine',
        sampleType: 'stool',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Gastrointestinal',
        preparationInstructions: 'Collect fresh sample in clean container. Avoid contamination with urine or water. Report recent medications.',
        normalRanges: {
            'Color': 'Brown',
            'Consistency': 'Formed',
            'Occult Blood': 'Negative',
            'Parasites': 'Not seen'
        }
    },
    {
        slug: 'occult-blood-test',
        sampleType: 'stool',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Gastrointestinal',
        preparationInstructions: 'Avoid red meat, NSAIDs, and vitamin C for 3 days. Avoid testing during menstruation or hemorrhoid bleeding.',
        normalRanges: {
            'Result': 'Negative'
        }
    },

    // ================== GENETIC TESTS ==================
    {
        slug: 'karyotyping',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 336,
        bodySystem: 'Genetic',
        preparationInstructions: 'No special preparation. Used for chromosomal analysis. Results take 2-3 weeks due to cell culture.',
        normalRanges: {
            'Male': '46,XY',
            'Female': '46,XX'
        }
    },
    {
        slug: 'brca-gene-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 504,
        bodySystem: 'Genetic',
        preparationInstructions: 'No fasting required. Genetic counseling recommended before and after. Results take 3-4 weeks.',
        normalRanges: {
            'Result': 'No pathogenic mutation detected'
        }
    },

    // ================== ALLERGY TESTS ==================
    {
        slug: 'ige-total',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Immune',
        preparationInstructions: 'No fasting required. Can be elevated in allergies, parasitic infections, and some immune disorders.',
        normalRanges: {
            'Adult': '<100 IU/mL',
            'Child (1-5 years)': '<60 IU/mL'
        }
    },
    {
        slug: 'allergy-panel-food',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 72,
        bodySystem: 'Immune',
        preparationInstructions: 'No fasting required. Continue normal diet. Report known allergies and current antihistamine use.',
        normalRanges: {
            'Class 0': '<0.35 kU/L (Negative)',
            'Class 1': '0.35-0.70 kU/L (Low)',
            'Class 2': '0.70-3.50 kU/L (Moderate)',
            'Class 3-6': '>3.50 kU/L (High)'
        }
    },

    // ================== PULMONARY TESTS ==================
    {
        slug: 'pft-test',
        sampleType: 'none',
        fastingRequired: false,
        reportTimeHours: 2,
        bodySystem: 'Respiratory',
        preparationInstructions: 'Avoid smoking for 6 hours. Avoid bronchodilators if instructed. Wear loose clothing. Practice breathing maneuvers.',
        normalRanges: {
            'FEV1': '>80% predicted',
            'FVC': '>80% predicted',
            'FEV1/FVC': '>70%'
        }
    },
    {
        slug: 'spirometry',
        sampleType: 'none',
        fastingRequired: false,
        reportTimeHours: 1,
        bodySystem: 'Respiratory',
        preparationInstructions: 'Avoid smoking for 4-6 hours. No heavy meals 2 hours before. Avoid vigorous exercise. Wear loose clothing.',
        normalRanges: {
            'FEV1': '>80% predicted',
            'FVC': '>80% predicted',
            'FEV1/FVC': '>0.70'
        }
    },
    {
        slug: 'abg-test',
        sampleType: 'blood (arterial)',
        fastingRequired: false,
        reportTimeHours: 1,
        bodySystem: 'Respiratory',
        preparationInstructions: 'Stay calm and breathe normally. Report oxygen therapy. Usually taken from radial artery in wrist.',
        normalRanges: {
            'pH': '7.35-7.45',
            'PaO2': '80-100 mmHg',
            'PaCO2': '35-45 mmHg',
            'HCO3': '22-26 mEq/L',
            'O2 Saturation': '>95%'
        }
    },

    // ================== AUTOIMMUNE TESTS ==================
    {
        slug: 'ana-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Immune',
        preparationInstructions: 'No fasting required. Can be positive in healthy individuals. Further tests needed if positive.',
        normalRanges: {
            'Titer': '<1:40 (Negative)',
            'Pattern': 'None detected'
        }
    },
    {
        slug: 'rheumatoid-factor',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 24,
        bodySystem: 'Musculoskeletal',
        preparationInstructions: 'No fasting required. Can be positive in other conditions. Used with anti-CCP for RA diagnosis.',
        normalRanges: {
            'RF': '<14 IU/mL (Negative)'
        }
    },
    {
        slug: 'anti-ccp-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 48,
        bodySystem: 'Musculoskeletal',
        preparationInstructions: 'No fasting required. More specific for rheumatoid arthritis than RF. Can be positive years before symptoms.',
        normalRanges: {
            'Anti-CCP': '<20 U/mL (Negative)'
        }
    },
    {
        slug: 'crp-test',
        sampleType: 'blood',
        fastingRequired: false,
        reportTimeHours: 6,
        bodySystem: 'Immune',
        preparationInstructions: 'No fasting required. Elevated in inflammation, infection, or tissue injury. Not specific for any disease.',
        normalRanges: {
            'Normal': '<10 mg/L',
            'Inflammation': '>10 mg/L'
        }
    }
];

async function main() {
    console.log('Starting lab tests enhancement...\n');
    const client = await pool.connect();

    try {
        let updated = 0;
        let notFound = 0;

        for (const enhancement of TEST_ENHANCEMENTS) {
            const existing = await client.query(
                'SELECT id FROM diagnostic_tests WHERE slug = $1',
                [enhancement.slug]
            );

            if (existing.rows.length === 0) {
                console.log(`  Not found: ${enhancement.slug}`);
                notFound++;
                continue;
            }

            const updates: string[] = [];
            const values: (string | number | boolean | object | null)[] = [];
            let paramIndex = 1;

            if (enhancement.sampleType !== undefined) {
                updates.push(`sample_type = $${paramIndex++}`);
                values.push(enhancement.sampleType);
            }
            if (enhancement.fastingRequired !== undefined) {
                updates.push(`fasting_required = $${paramIndex++}`);
                values.push(enhancement.fastingRequired);
            }
            if (enhancement.fastingHours !== undefined) {
                updates.push(`fasting_hours = $${paramIndex++}`);
                values.push(enhancement.fastingHours);
            }
            if (enhancement.reportTimeHours !== undefined) {
                updates.push(`report_time_hours = $${paramIndex++}`);
                values.push(enhancement.reportTimeHours);
            }
            if (enhancement.bodySystem !== undefined) {
                updates.push(`body_system = $${paramIndex++}`);
                values.push(enhancement.bodySystem);
            }
            if (enhancement.preparationInstructions !== undefined) {
                updates.push(`preparation_instructions = $${paramIndex++}`);
                values.push(enhancement.preparationInstructions);
            }
            if (enhancement.normalRanges !== undefined) {
                updates.push(`normal_ranges = $${paramIndex++}`);
                values.push(JSON.stringify(enhancement.normalRanges));
            }

            updates.push(`updated_at = NOW()`);

            values.push(enhancement.slug);

            await client.query(
                `UPDATE diagnostic_tests SET ${updates.join(', ')} WHERE slug = $${paramIndex}`,
                values
            );

            console.log(`  Updated: ${enhancement.slug}`);
            updated++;
        }

        console.log(`\nCompleted!`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Not found: ${notFound}`);

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
