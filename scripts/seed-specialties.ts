/**
 * seed-specialties.ts
 * Seeds conditions for all missing/thin specialties.
 * Run: npx tsx scripts/seed-specialties.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type SeedCondition = {
    commonName: string;
    scientificName: string;
    slug: string;
    specialistType: string;
    severityLevel: string;
    bodySystem: string;
    description: string;
};

const CONDITIONS: SeedCondition[] = [
    // ─── NEPHROLOGY ────────────────────────────────────────
    ...genList('Nephrology', 'Urinary', [
        ['Chronic Kidney Disease Stage 1', 'Morbus renalis chronicus stadium I', 'chronic-kidney-disease-stage-1', 'mild'],
        ['Chronic Kidney Disease Stage 2', 'Morbus renalis chronicus stadium II', 'chronic-kidney-disease-stage-2', 'mild'],
        ['Chronic Kidney Disease Stage 3', 'Morbus renalis chronicus stadium III', 'chronic-kidney-disease-stage-3', 'moderate'],
        ['Chronic Kidney Disease Stage 4', 'Morbus renalis chronicus stadium IV', 'chronic-kidney-disease-stage-4', 'severe'],
        ['Chronic Kidney Disease Stage 5 (ESRD)', 'Morbus renalis chronicus stadium V', 'chronic-kidney-disease-stage-5-esrd', 'critical'],
        ['Nephrotic Syndrome', 'Syndroma nephroticum', 'nephrotic-syndrome', 'severe'],
        ['Nephritic Syndrome', 'Glomerulonephritis acuta', 'nephritic-syndrome', 'severe'],
        ['IgA Nephropathy', 'Nephropathia IgA (Berger)', 'iga-nephropathy', 'moderate'],
        ['Diabetic Nephropathy', 'Nephropathia diabetica', 'diabetic-nephropathy', 'severe'],
        ['Hypertensive Nephrosclerosis', 'Nephrosclerosis hypertensiva', 'hypertensive-nephrosclerosis', 'moderate'],
        ['Acute Kidney Injury', 'Insufficientia renalis acuta', 'acute-kidney-injury', 'critical'],
        ['Polycystic Kidney Disease', 'Morbus polycysticus renum', 'polycystic-kidney-disease', 'severe'],
        ['Renal Tubular Acidosis', 'Acidosis tubularis renalis', 'renal-tubular-acidosis', 'moderate'],
        ['Kidney Stones (Nephrolithiasis)', 'Nephrolithiasis', 'nephrolithiasis', 'moderate'],
        ['Renal Artery Stenosis', 'Stenosis arteriae renalis', 'renal-artery-stenosis', 'severe'],
        ['Lupus Nephritis', 'Nephritis luposa', 'lupus-nephritis', 'severe'],
        ['Membranous Nephropathy', 'Nephropathia membranosa', 'membranous-nephropathy', 'moderate'],
        ['Focal Segmental Glomerulosclerosis', 'Glomerulosclerosis focalis segmentalis', 'focal-segmental-glomerulosclerosis', 'severe'],
        ['Minimal Change Disease', 'Morbus mutationum minimarum', 'minimal-change-disease', 'moderate'],
        ['Renal Cell Carcinoma', 'Carcinoma cellularum renalium', 'renal-cell-carcinoma', 'critical'],
        ['Hemolytic Uremic Syndrome', 'Syndroma haemolyticum uraemicum', 'hemolytic-uremic-syndrome', 'critical'],
        ['Interstitial Nephritis', 'Nephritis interstitialis', 'interstitial-nephritis', 'moderate'],
        ['Goodpasture Syndrome', 'Syndroma Goodpasture', 'goodpasture-syndrome', 'critical'],
        ['Alport Syndrome', 'Syndroma Alport', 'alport-syndrome', 'severe'],
        ['Vesicoureteral Reflux', 'Refluxus vesicoureteralis', 'vesicoureteral-reflux', 'moderate'],
    ]),

    // ─── GERIATRICS ────────────────────────────────────────
    ...genList('Geriatrics', 'Multiple', [
        ['Sarcopenia', 'Sarcopenia senilis', 'sarcopenia', 'moderate'],
        ['Frailty Syndrome', 'Syndroma fragilitatis', 'frailty-syndrome', 'moderate'],
        ['Delirium in Elderly', 'Delirium senile', 'delirium-in-elderly', 'severe'],
        ['Polypharmacy Complications', 'Complicationes polypharmaciae', 'polypharmacy-complications', 'moderate'],
        ['Age-related Macular Degeneration', 'Degeneratio maculae senilis', 'age-related-macular-degeneration', 'moderate'],
        ['Senile Osteoporosis', 'Osteoporosis senilis', 'senile-osteoporosis', 'moderate'],
        ['Elder Abuse Syndrome', 'Syndroma abusus senilis', 'elder-abuse-syndrome', 'severe'],
        ['Failure to Thrive in Elderly', 'Defectus incrementi senilis', 'failure-to-thrive-elderly', 'severe'],
        ['Geriatric Depression', 'Depressio senilis', 'geriatric-depression', 'moderate'],
        ['Urinary Incontinence in Elderly', 'Incontinentia urinae senilis', 'urinary-incontinence-elderly', 'mild'],
        ['Falls in Elderly', 'Casus senilis', 'falls-in-elderly', 'moderate'],
        ['Pressure Ulcers (Bedsores)', 'Ulcus decubitalis', 'pressure-ulcers-bedsores', 'severe'],
        ['Sundowning Syndrome', 'Syndroma vespertinum', 'sundowning-syndrome', 'moderate'],
        ['Geriatric Malnutrition', 'Malnutritio senilis', 'geriatric-malnutrition', 'moderate'],
        ['Age-related Hearing Loss (Presbycusis)', 'Presbyacusis', 'presbycusis', 'mild'],
    ]),

    // ─── PHYSICAL MEDICINE & REHABILITATION ────────────────
    ...genList('Physical Medicine & Rehabilitation', 'Musculoskeletal', [
        ['Frozen Shoulder (Adhesive Capsulitis)', 'Capsulitis adhaesiva', 'frozen-shoulder-adhesive-capsulitis', 'moderate'],
        ['Rotator Cuff Tendinopathy', 'Tendinopathia coiffae rotatorii', 'rotator-cuff-tendinopathy', 'moderate'],
        ['Cervical Radiculopathy', 'Radiculopathia cervicalis', 'cervical-radiculopathy', 'moderate'],
        ['Lumbar Radiculopathy', 'Radiculopathia lumbalis', 'lumbar-radiculopathy', 'moderate'],
        ['Post-stroke Rehabilitation', 'Rehabilitatio post-ictum', 'post-stroke-rehabilitation', 'severe'],
        ['Spinal Cord Injury Rehabilitation', 'Rehabilitatio post laesionem medullae spinalis', 'spinal-cord-injury-rehabilitation', 'severe'],
        ['Traumatic Brain Injury Rehabilitation', 'Rehabilitatio TBI', 'tbi-rehabilitation', 'severe'],
        ['Chronic Low Back Pain', 'Dolor chronicus lumbalis', 'chronic-low-back-pain', 'moderate'],
        ['Myofascial Pain Syndrome', 'Syndroma doloris myofascialis', 'myofascial-pain-syndrome', 'moderate'],
        ['Carpal Tunnel Syndrome', 'Syndroma canalis carpi', 'carpal-tunnel-syndrome-rehab', 'moderate'],
        ['Tennis Elbow (Lateral Epicondylitis)', 'Epicondylitis lateralis', 'tennis-elbow-lateral-epicondylitis', 'mild'],
        ['De Quervain Tenosynovitis', 'Tenosynovitis De Quervain', 'de-quervain-tenosynovitis', 'mild'],
        ['Whiplash Injury', 'Trauma cervicale per flagellationem', 'whiplash-injury', 'moderate'],
        ['Amputation Rehabilitation', 'Rehabilitatio post amputationem', 'amputation-rehabilitation', 'severe'],
        ['Spasticity Management', 'Tractatio spasticitatis', 'spasticity-management', 'moderate'],
        ['Lymphedema', 'Lymphoedema', 'lymphedema-rehab', 'moderate'],
        ['Vestibular Rehabilitation', 'Rehabilitatio vestibularis', 'vestibular-rehabilitation', 'mild'],
        ['Fibromyalgia Rehabilitation', 'Rehabilitatio fibromyalgiae', 'fibromyalgia-rehabilitation', 'moderate'],
    ]),

    // ─── ALLERGY & IMMUNOLOGY ─────────────────────────────
    ...genList('Allergy & Immunology', 'Immune', [
        ['Allergic Rhinitis (Hay Fever)', 'Rhinitis allergica', 'allergic-rhinitis-hay-fever', 'mild'],
        ['Allergic Asthma', 'Asthma allergicum', 'allergic-asthma', 'moderate'],
        ['Chronic Urticaria', 'Urticaria chronica', 'chronic-urticaria', 'moderate'],
        ['Angioedema', 'Angioedema', 'angioedema-allergy', 'severe'],
        ['Anaphylaxis', 'Anaphylaxis', 'anaphylaxis', 'critical'],
        ['Food Allergy', 'Allergia alimentaria', 'food-allergy', 'moderate'],
        ['Drug Allergy', 'Allergia medicamentosa', 'drug-allergy', 'severe'],
        ['Insect Venom Allergy', 'Allergia veneni insectorum', 'insect-venom-allergy', 'severe'],
        ['Allergic Contact Dermatitis', 'Dermatitis contactus allergica', 'allergic-contact-dermatitis', 'mild'],
        ['Eosinophilic Esophagitis', 'Oesophagitis eosinophilica', 'eosinophilic-esophagitis', 'moderate'],
        ['Hereditary Angioedema', 'Angioedema hereditarium', 'hereditary-angioedema', 'severe'],
        ['Common Variable Immunodeficiency', 'Immunodeficientia communis variabilis', 'common-variable-immunodeficiency', 'severe'],
        ['Selective IgA Deficiency', 'Deficientia IgA selectiva', 'selective-iga-deficiency', 'mild'],
        ['Mast Cell Activation Syndrome', 'Syndroma activationis mastocytorum', 'mast-cell-activation-syndrome', 'moderate'],
        ['Latex Allergy', 'Allergia latex', 'latex-allergy', 'moderate'],
        ['Atopic Dermatitis (Eczema)', 'Dermatitis atopica', 'atopic-dermatitis-eczema', 'moderate'],
        ['Serum Sickness', 'Morbus serosus', 'serum-sickness', 'moderate'],
        ['Allergic Bronchopulmonary Aspergillosis', 'Aspergillosis bronchopulmonalis allergica', 'abpa', 'severe'],
    ]),

    // ─── PAIN MEDICINE & PALLIATIVE CARE ──────────────────
    ...genList('Pain Medicine & Palliative Care', 'Nervous', [
        ['Chronic Pain Syndrome', 'Syndroma doloris chronici', 'chronic-pain-syndrome', 'moderate'],
        ['Complex Regional Pain Syndrome (CRPS)', 'CRPS', 'complex-regional-pain-syndrome', 'severe'],
        ['Neuropathic Pain', 'Dolor neuropathicus', 'neuropathic-pain', 'moderate'],
        ['Cancer Pain Management', 'Tractatio doloris carcinomatis', 'cancer-pain-management', 'severe'],
        ['Phantom Limb Pain', 'Dolor membri phantasmi', 'phantom-limb-pain', 'moderate'],
        ['Trigeminal Neuralgia', 'Neuralgia trigemini', 'trigeminal-neuralgia', 'severe'],
        ['Postherpetic Neuralgia', 'Neuralgia postherpetica', 'postherpetic-neuralgia', 'moderate'],
        ['Chronic Migraine Pain Management', 'Tractatio doloris migraenosum', 'chronic-migraine-pain-management', 'moderate'],
        ['Failed Back Surgery Syndrome', 'Syndroma dorsi post chirurgiam', 'failed-back-surgery-syndrome', 'severe'],
        ['Central Pain Syndrome', 'Syndroma doloris centralis', 'central-pain-syndrome', 'severe'],
        ['End-of-life Symptom Management', 'Tractatio symptomatum vitae finis', 'end-of-life-symptom-management', 'critical'],
        ['Opioid-Induced Hyperalgesia', 'Hyperalgesia opioidibus inducta', 'opioid-induced-hyperalgesia', 'moderate'],
        ['Intractable Pain', 'Dolor intractabilis', 'intractable-pain', 'severe'],
        ['Breakthrough Pain', 'Dolor eruptivus', 'breakthrough-pain', 'severe'],
        ['Caregiver Burnout Syndrome', 'Syndroma defatigationis curatoris', 'caregiver-burnout-syndrome', 'moderate'],
    ]),

    // ─── FAMILY MEDICINE ──────────────────────────────────
    ...genList('Family Medicine', 'Multiple', [
        ['Hypertension (Primary Care)', 'Hypertensio arterialis', 'hypertension-primary-care', 'moderate'],
        ['Type 2 Diabetes (Primary Care)', 'Diabetes mellitus typus II', 'type-2-diabetes-primary-care', 'moderate'],
        ['Obesity Management', 'Tractatio obesitatis', 'obesity-management', 'moderate'],
        ['Hyperlipidemia', 'Hyperlipidaemia', 'hyperlipidemia-family', 'moderate'],
        ['Preventive Health Screening', 'Provisio sanitatis praeventiva', 'preventive-health-screening', 'mild'],
        ['Upper Respiratory Infection', 'Infectio viarum respiratoriarum superiorum', 'upper-respiratory-infection', 'mild'],
        ['Urinary Tract Infection (Primary Care)', 'Infectio tractus urinarii', 'urinary-tract-infection-primary-care', 'mild'],
        ['Childhood Immunization Schedules', 'Schedula immunisationis infantilis', 'childhood-immunization-schedules', 'mild'],
        ['Well-child Visits', 'Visitatio sanitatis infantilis', 'well-child-visits', 'mild'],
        ['Smoking Cessation Counseling', 'Consultatio cessationis fumandi', 'smoking-cessation-counseling', 'mild'],
        ['Anxiety Disorder (Primary Care)', 'Perturbatio anxietatis', 'anxiety-disorder-primary-care', 'moderate'],
        ['Chronic Disease Management', 'Tractatio morbi chronici', 'chronic-disease-management', 'moderate'],
        ['Travel Medicine Consultations', 'Consultatio medicinae itineris', 'travel-medicine-consultations', 'mild'],
        ['Osteoarthritis (Primary Care)', 'Osteoarthritis', 'osteoarthritis-primary-care', 'moderate'],
        ['Prenatal Care', 'Cura praenatalis', 'prenatal-care', 'mild'],
    ]),

    // ─── NEUROSURGERY ─────────────────────────────────────
    ...genList('Neurosurgery', 'Nervous', [
        ['Brain Tumor (Glioma)', 'Glioma cerebri', 'brain-tumor-glioma', 'critical'],
        ['Meningioma', 'Meningioma', 'meningioma', 'severe'],
        ['Cerebral Aneurysm', 'Aneurysma cerebrale', 'cerebral-aneurysm', 'critical'],
        ['Arteriovenous Malformation (AVM)', 'Malformatio arteriovenosa', 'arteriovenous-malformation', 'severe'],
        ['Hydrocephalus', 'Hydrocephalus', 'hydrocephalus-neurosurg', 'severe'],
        ['Chiari Malformation', 'Malformatio Chiari', 'chiari-malformation', 'severe'],
        ['Spinal Stenosis (Surgical)', 'Stenosis spinalis chirurgica', 'spinal-stenosis-surgical', 'severe'],
        ['Herniated Disc (Surgical)', 'Hernia disci intervertebralis chirurgica', 'herniated-disc-surgical', 'moderate'],
        ['Trigeminal Neuralgia (Surgical)', 'Neuralgia trigemini chirurgica', 'trigeminal-neuralgia-surgical', 'moderate'],
        ['Acoustic Neuroma (Vestibular Schwannoma)', 'Schwannoma vestibulare', 'acoustic-neuroma', 'severe'],
        ['Pituitary Adenoma', 'Adenoma pituitarium', 'pituitary-adenoma', 'moderate'],
        ['Craniosynostosis', 'Craniosynostosis', 'craniosynostosis', 'severe'],
        ['Subdural Hematoma', 'Haematoma subdurale', 'subdural-hematoma', 'critical'],
        ['Epidural Hematoma', 'Haematoma epidurale', 'epidural-hematoma', 'critical'],
        ['Deep Brain Stimulation (DBS) for Parkinson', 'Stimulatio cerebri profunda', 'deep-brain-stimulation-parkinsons', 'severe'],
    ]),

    // ─── CARDIOTHORACIC & VASCULAR SURGERY ────────────────
    ...genList('Cardiothoracic & Vascular Surgery', 'Cardiovascular', [
        ['Coronary Artery Bypass Grafting (CABG)', 'Derivatio arteriae coronariae', 'coronary-artery-bypass-grafting', 'critical'],
        ['Heart Valve Replacement', 'Substitutio valvulae cordis', 'heart-valve-replacement', 'critical'],
        ['Aortic Aneurysm Repair', 'Reparatio aneurysmatis aortae', 'aortic-aneurysm-repair', 'critical'],
        ['Thoracic Aortic Dissection', 'Dissectio aortae thoracicae', 'thoracic-aortic-dissection', 'critical'],
        ['Peripheral Artery Disease (Surgical)', 'Morbus arteriarum peripheralium chirurgicus', 'peripheral-artery-disease-surgical', 'severe'],
        ['Carotid Endarterectomy', 'Endarterectomia carotidea', 'carotid-endarterectomy', 'severe'],
        ['Varicose Vein Surgery', 'Chirurgia varicosa', 'varicose-vein-surgery', 'mild'],
        ['Atrial Septal Defect Repair', 'Reparatio defectus septi atrialis', 'atrial-septal-defect-repair', 'severe'],
        ['Ventricular Assist Device (LVAD)', 'Dispositio auxilii ventricularis', 'ventricular-assist-device', 'critical'],
        ['Heart Transplant', 'Transplantatio cordis', 'heart-transplant', 'critical'],
        ['Lung Transplant', 'Transplantatio pulmonis', 'lung-transplant', 'critical'],
        ['Thoracotomy for Lung Cancer', 'Thoracotomia pro carcinomate pulmonis', 'thoracotomy-lung-cancer', 'critical'],
        ['Minimally Invasive Cardiac Surgery (MICS)', 'Chirurgia cordis minime invasiva', 'minimally-invasive-cardiac-surgery', 'severe'],
        ['Endovascular Aneurysm Repair (EVAR)', 'Reparatio aneurysmatis endovascularis', 'endovascular-aneurysm-repair', 'severe'],
        ['Arteriovenous Fistula Creation for Dialysis', 'Fistula arteriovenosa pro dialysi', 'av-fistula-creation-dialysis', 'moderate'],
    ]),

    // ─── MAXILLOFACIAL & ORAL SURGERY ─────────────────────
    ...genList('Maxillofacial & Oral Surgery', 'Musculoskeletal', [
        ['Impacted Wisdom Teeth', 'Dentes sapientiae impacti', 'impacted-wisdom-teeth', 'mild'],
        ['TMJ Disorder', 'Perturbatio articulationis temporomandibularis', 'tmj-disorder', 'moderate'],
        ['Jaw Fracture (Mandibular)', 'Fractura mandibulae', 'jaw-fracture-mandibular', 'severe'],
        ['Cleft Lip and Palate', 'Labium fissum et palatum fissum', 'cleft-lip-and-palate', 'severe'],
        ['Oral Cancer', 'Carcinoma orale', 'oral-cancer', 'critical'],
        ['Dental Abscess', 'Abscessus dentalis', 'dental-abscess', 'moderate'],
        ['Malocclusion (Orthognathic)', 'Malocclusio', 'malocclusion-orthognathic', 'moderate'],
        ['Salivary Gland Tumor', 'Tumor glandulae salivaris', 'salivary-gland-tumor', 'severe'],
        ['Ludwig Angina', 'Angina Ludovici', 'ludwig-angina', 'critical'],
        ['Osteonecrosis of the Jaw (BRONJ)', 'Osteonecrosis mandibulae', 'osteonecrosis-of-jaw', 'severe'],
        ['Ranula', 'Ranula', 'ranula', 'mild'],
        ['Dentigerous Cyst', 'Cystis dentigera', 'dentigerous-cyst', 'moderate'],
        ['Facial Trauma Reconstruction', 'Reconstructio traumatis facialis', 'facial-trauma-reconstruction', 'severe'],
        ['Orofacial Pain', 'Dolor orofacialis', 'orofacial-pain', 'moderate'],
        ['Odontogenic Infection', 'Infectio odontogena', 'odontogenic-infection', 'moderate'],
    ]),

    // ─── SPORTS MEDICINE ──────────────────────────────────
    ...genList('Sports Medicine', 'Musculoskeletal', [
        ['ACL Tear', 'Ruptura ligamenti cruciati anterioris', 'acl-tear', 'severe'],
        ['Meniscus Tear', 'Ruptura menisci', 'meniscus-tear', 'moderate'],
        ['Achilles Tendon Rupture', 'Ruptura tendinis Achillis', 'achilles-tendon-rupture', 'severe'],
        ['Shin Splints', 'Syndroma tibialis medialis', 'shin-splints', 'mild'],
        ['Runner\'s Knee (Patellofemoral Syndrome)', 'Syndroma patellofemorale', 'runners-knee', 'mild'],
        ['Concussion in Sports', 'Commotio cerebri sportiva', 'concussion-in-sports', 'severe'],
        ['Stress Fracture', 'Fractura stresso', 'stress-fracture-sports', 'moderate'],
        ['Hamstring Strain', 'Distensio musculorum ischiocrurali', 'hamstring-strain', 'mild'],
        ['Groin Pull', 'Distensio inguinalis', 'groin-pull', 'mild'],
        ['Labral Tear (Hip)', 'Ruptura labri coxae', 'labral-tear-hip', 'moderate'],
        ['Labral Tear (Shoulder)', 'Ruptura labri glenoidalis', 'labral-tear-shoulder', 'moderate'],
        ['Muscle Contusion', 'Contusio muscularis', 'muscle-contusion', 'mild'],
        ['Exercise-Induced Asthma', 'Asthma exercitatione inductum', 'exercise-induced-asthma', 'mild'],
        ['Heat Stroke (Exertional)', 'Ictus caloris exercitationalis', 'exertional-heat-stroke', 'critical'],
        ['Overtraining Syndrome', 'Syndroma superexercitationis', 'overtraining-syndrome', 'moderate'],
    ]),

    // ─── OCCUPATIONAL MEDICINE ────────────────────────────
    ...genList('Occupational Medicine', 'Multiple', [
        ['Occupational Asthma', 'Asthma occupationale', 'occupational-asthma', 'moderate'],
        ['Silicosis', 'Silicosis', 'silicosis', 'severe'],
        ['Asbestosis', 'Asbestosis', 'asbestosis', 'severe'],
        ['Mesothelioma', 'Mesothelioma', 'mesothelioma', 'critical'],
        ['Noise-Induced Hearing Loss', 'Surditas strepitu inducta', 'noise-induced-hearing-loss', 'moderate'],
        ['Carpal Tunnel Syndrome (Occupational)', 'Syndroma canalis carpi occupationale', 'carpal-tunnel-syndrome-occupational', 'moderate'],
        ['Occupational Dermatitis', 'Dermatitis occupationalis', 'occupational-dermatitis', 'mild'],
        ['Burnout Syndrome', 'Syndroma defatigationis', 'burnout-syndrome', 'moderate'],
        ['Lead Poisoning (Occupational)', 'Saturnismus occupationalis', 'lead-poisoning-occupational', 'severe'],
        ['Vibration White Finger (Raynaud)', 'Digitus albus vibrationis', 'vibration-white-finger', 'moderate'],
        ['Work-related Musculoskeletal Disorder', 'Perturbatio musculoskeletal occupationalis', 'work-related-musculoskeletal-disorder', 'moderate'],
        ['Chemical Burns (Occupational)', 'Combustio chemica occupationalis', 'chemical-burns-occupational', 'severe'],
        ['Shift Work Sleep Disorder', 'Perturbatio somni operis mutationis', 'shift-work-sleep-disorder', 'mild'],
        ['Farmer\'s Lung', 'Pulmo agricolae', 'farmers-lung', 'moderate'],
        ['Coal Worker\'s Pneumoconiosis', 'Pneumoconiosis carbonaria', 'coal-workers-pneumoconiosis', 'severe'],
    ]),

    // ─── NUCLEAR MEDICINE ─────────────────────────────────
    ...genList('Nuclear Medicine', 'Multiple', [
        ['Thyroid Cancer (Radioiodine Therapy)', 'Carcinoma thyroideae therapia radioiodo', 'thyroid-cancer-radioiodine', 'severe'],
        ['Graves Disease (Nuclear Imaging)', 'Morbus Graves (scintigraphia)', 'graves-disease-nuclear', 'moderate'],
        ['Bone Metastasis Imaging', 'Scintigraphia metastasium ossis', 'bone-metastasis-imaging', 'severe'],
        ['PET-CT for Lymphoma Staging', 'PET-CT pro stadiis lymphomatis', 'pet-ct-lymphoma-staging', 'severe'],
        ['Myocardial Perfusion Imaging', 'Imaginatio perfusionis myocardialis', 'myocardial-perfusion-imaging', 'moderate'],
        ['Sentinel Lymph Node Mapping', 'Cartographia nodi lymphatici sentinaelae', 'sentinel-lymph-node-mapping', 'moderate'],
        ['Radioactive Iodine Ablation', 'Ablatio iodo radioactivo', 'radioactive-iodine-ablation', 'moderate'],
        ['Neuroendocrine Tumor Imaging', 'Imaginatio tumoris neuroendocrini', 'neuroendocrine-tumor-imaging', 'severe'],
        ['Renal Function Scintigraphy', 'Scintigraphia functionis renalis', 'renal-function-scintigraphy', 'mild'],
        ['Ventilation-Perfusion Scan', 'Scintigraphia ventilationis-perfusionis', 'ventilation-perfusion-scan', 'moderate'],
        ['Gallium Scan for Infection', 'Scintigraphia gallii pro infectione', 'gallium-scan-infection', 'moderate'],
        ['Thyroid Nodule Evaluation', 'Evaluatio noduli thyroideae', 'thyroid-nodule-evaluation', 'mild'],
    ]),

    // ─── PATHOLOGY ─────────────────────────────────────────
    ...genList('Pathology', 'Multiple', [
        ['Cervical Dysplasia (Pap Smear)', 'Dysplasia cervicalis', 'cervical-dysplasia-pap', 'moderate'],
        ['Breast Cancer Histopathology', 'Histopathologia carcinomatis mammae', 'breast-cancer-histopathology', 'critical'],
        ['Prostate Biopsy Analysis', 'Analysis biopsia prostatae', 'prostate-biopsy-analysis', 'severe'],
        ['Bone Marrow Biopsy Evaluation', 'Evaluatio biopsiae medullae ossis', 'bone-marrow-biopsy-evaluation', 'severe'],
        ['Liver Biopsy Interpretation', 'Interpretatio biopsiae hepatis', 'liver-biopsy-interpretation', 'moderate'],
        ['Thyroid FNA Cytology', 'Cytologia aspirationis thyroideae', 'thyroid-fna-cytology', 'moderate'],
        ['Colon Polyp Histology', 'Histologia polypi colici', 'colon-polyp-histology', 'moderate'],
        ['Melanoma Pathology Staging', 'Stadiis pathologiae melanomatis', 'melanoma-pathology-staging', 'critical'],
        ['Lymph Node Biopsy', 'Biopsia nodi lymphatici', 'lymph-node-biopsy-pathology', 'moderate'],
        ['Kidney Biopsy (Glomerulonephritis)', 'Biopsia renalis', 'kidney-biopsy-glomerulonephritis', 'severe'],
        ['Molecular Pathology Testing', 'Examinatio pathologiae molecularis', 'molecular-pathology-testing', 'moderate'],
        ['Frozen Section Analysis', 'Analysis sectionis congelatae', 'frozen-section-analysis', 'moderate'],
    ]),

    // ─── PREVENTIVE & PUBLIC HEALTH ───────────────────────
    ...genList('Preventive & Public Health', 'Multiple', [
        ['Vaccination Programs', 'Programmata vaccinationis', 'vaccination-programs', 'mild'],
        ['Epidemiological Surveillance', 'Surveillantia epidemiologica', 'epidemiological-surveillance', 'mild'],
        ['Tobacco Cessation Programs', 'Programmata cessationis tabaci', 'tobacco-cessation-programs', 'mild'],
        ['Obesity Prevention', 'Praeventio obesitatis', 'obesity-prevention', 'mild'],
        ['Maternal and Child Health', 'Sanitas materna et infantilis', 'maternal-and-child-health', 'mild'],
        ['Communicable Disease Control', 'Imperium morbi transmissibilis', 'communicable-disease-control', 'moderate'],
        ['Water and Sanitation-Related Disease', 'Morbi aquae et sanitationis', 'water-sanitation-disease', 'moderate'],
        ['Nutritional Deficiency Screening', 'Provisio deficientiae nutritionalis', 'nutritional-deficiency-screening', 'mild'],
        ['Occupational Health Screening', 'Provisio sanitatis occupationalis', 'occupational-health-screening', 'mild'],
        ['HIV/AIDS Prevention Programs', 'Programmata praeventionis HIV/AIDS', 'hiv-aids-prevention', 'moderate'],
        ['Cancer Screening Programs', 'Programmata provisionis carcinomatis', 'cancer-screening-programs', 'mild'],
        ['Disaster Medicine', 'Medicina calamitatis', 'disaster-medicine', 'severe'],
    ]),

    // ─── TROPICAL MEDICINE ────────────────────────────────
    ...genList('Tropical Medicine', 'Multiple', [
        ['Malaria', 'Malaria', 'malaria-tropical', 'severe'],
        ['Dengue Fever', 'Febris dengue', 'dengue-fever', 'severe'],
        ['Chikungunya', 'Chikungunya', 'chikungunya', 'moderate'],
        ['Zika Virus', 'Virus Zika', 'zika-virus', 'moderate'],
        ['Leishmaniasis', 'Leishmaniasis', 'leishmaniasis', 'severe'],
        ['Schistosomiasis', 'Schistosomiasis', 'schistosomiasis', 'moderate'],
        ['Chagas Disease', 'Morbus Chagas', 'chagas-disease', 'severe'],
        ['Filariasis', 'Filariasis', 'filariasis', 'moderate'],
        ['Trypanosomiasis (Sleeping Sickness)', 'Trypanosomiasis Africana', 'african-trypanosomiasis', 'critical'],
        ['Yellow Fever', 'Febris flava', 'yellow-fever', 'severe'],
        ['Hookworm Infection', 'Ancylostomiasis', 'hookworm-infection', 'mild'],
        ['Leprosy (Hansen Disease)', 'Morbus Hansen', 'leprosy-hansen-disease', 'moderate'],
        ['Strongyloidiasis', 'Strongyloidiasis', 'strongyloidiasis', 'moderate'],
        ['Ebola Virus Disease', 'Morbus virus Ebola', 'ebola-virus-disease', 'critical'],
        ['Leptospirosis', 'Leptospirosis', 'leptospirosis', 'severe'],
    ]),

    // ─── PLASTIC & RECONSTRUCTIVE SURGERY ─────────────────
    ...genList('Plastic & Reconstructive Surgery', 'Musculoskeletal', [
        ['Breast Reconstruction', 'Reconstructio mammae', 'breast-reconstruction', 'moderate'],
        ['Rhinoplasty', 'Rhinoplastica', 'rhinoplasty', 'mild'],
        ['Burn Scar Contracture', 'Contractura cicatricis combustionis', 'burn-scar-contracture', 'severe'],
        ['Skin Grafting', 'Transplantatio cutis', 'skin-grafting', 'moderate'],
        ['Hand Reconstruction', 'Reconstructio manus', 'hand-reconstruction', 'severe'],
        ['Microsurgery / Free Flap', 'Microchirurgia', 'microsurgery-free-flap', 'severe'],
        ['Keloid Treatment', 'Tractatio cheloidi', 'keloid-treatment', 'mild'],
        ['Blepharoplasty', 'Blepharoplastica', 'blepharoplasty', 'mild'],
        ['Abdominoplasty', 'Abdominoplastica', 'abdominoplasty', 'moderate'],
        ['Liposuction', 'Liposuctio', 'liposuction', 'mild'],
        ['Scar Revision', 'Revisio cicatricis', 'scar-revision', 'mild'],
        ['Craniofacial Surgery', 'Chirurgia craniofacialis', 'craniofacial-surgery', 'severe'],
        ['Microtia Repair', 'Reparatio microtiae', 'microtia-repair', 'moderate'],
        ['Gynecomastia Surgery', 'Chirurgia gynaecomastiae', 'gynecomastia-surgery', 'mild'],
        ['Tissue Expansion', 'Expansio textus', 'tissue-expansion', 'moderate'],
    ]),

    // ─── PODIATRY ─────────────────────────────────────────
    ...genList('Podiatry', 'Musculoskeletal', [
        ['Plantar Fasciitis', 'Fasciitis plantaris', 'plantar-fasciitis-pod', 'mild'],
        ['Bunion (Hallux Valgus)', 'Hallux valgus', 'bunion-hallux-valgus', 'moderate'],
        ['Hammer Toe', 'Digitus malleus', 'hammer-toe', 'mild'],
        ['Morton\'s Neuroma', 'Neuroma Morton', 'mortons-neuroma', 'moderate'],
        ['Ingrown Toenail', 'Onychocryptosis', 'ingrown-toenail', 'mild'],
        ['Diabetic Foot Ulcer', 'Ulcus pedis diabetici', 'diabetic-foot-ulcer', 'severe'],
        ['Flat Feet (Pes Planus)', 'Pes planus', 'flat-feet-pes-planus', 'mild'],
        ['Achilles Tendinitis', 'Tendinitis Achillis', 'achilles-tendinitis', 'moderate'],
        ['Metatarsalgia', 'Metatarsalgia', 'metatarsalgia', 'mild'],
        ['Ankle Sprain', 'Distorsio tali', 'ankle-sprain-pod', 'mild'],
        ['Heel Spur', 'Calcar calcanei', 'heel-spur', 'mild'],
        ['Tarsal Tunnel Syndrome', 'Syndroma canalis tarsi', 'tarsal-tunnel-syndrome', 'moderate'],
        ['Charcot Foot', 'Pes Charcot', 'charcot-foot', 'severe'],
        ['Gout (Podiatric)', 'Podagra', 'gout-podiatric', 'moderate'],
        ['Fungal Toenail (Onychomycosis)', 'Onychomycosis', 'fungal-toenail-onychomycosis', 'mild'],
    ]),

    // ─── ENT (AUGMENT — existing has only 22) ─────────────
    ...genList('ENT', 'ENT', [
        ['Chronic Sinusitis', 'Sinusitis chronica', 'chronic-sinusitis', 'moderate'],
        ['Deviated Nasal Septum', 'Deviatio septi nasi', 'deviated-nasal-septum', 'mild'],
        ['Nasal Polyps', 'Polypi nasi', 'nasal-polyps', 'moderate'],
        ['Laryngeal Cancer', 'Carcinoma laryngis', 'laryngeal-cancer', 'critical'],
        ['Vocal Cord Nodules', 'Noduli plicarum vocalium', 'vocal-cord-nodules', 'mild'],
        ['Vocal Cord Paralysis', 'Paralysis plicae vocalis', 'vocal-cord-paralysis', 'moderate'],
        ['Otitis Media (Chronic)', 'Otitis media chronica', 'chronic-otitis-media', 'moderate'],
        ['Cholesteatoma', 'Cholesteatoma', 'cholesteatoma', 'severe'],
        ['Otosclerosis', 'Otosclerosis', 'otosclerosis', 'moderate'],
        ['Sensorineural Hearing Loss', 'Surditas sensorineuralis', 'sensorineural-hearing-loss', 'moderate'],
        ['Meniere Disease', 'Morbus Meniere', 'meniere-disease', 'moderate'],
        ['Tinnitus', 'Tinnitus', 'tinnitus-ent', 'mild'],
        ['Sleep Apnea (ENT)', 'Apnoea somni obstructiva', 'sleep-apnea-ent', 'moderate'],
        ['Peritonsillar Abscess', 'Abscessus peritonsillaris', 'peritonsillar-abscess', 'severe'],
        ['Laryngopharyngeal Reflux', 'Refluxus laryngopharyngealis', 'laryngopharyngeal-reflux', 'mild'],
        ['Epistaxis (Recurrent Nosebleeds)', 'Epistaxis recurrens', 'epistaxis-recurrent', 'mild'],
        ['Salivary Gland Stones', 'Sialolithiasis', 'salivary-gland-stones', 'mild'],
        ['Parotitis', 'Parotitis', 'parotitis', 'moderate'],
        ['Nasopharyngeal Carcinoma', 'Carcinoma nasopharyngeum', 'nasopharyngeal-carcinoma', 'critical'],
        ['Epiglottitis', 'Epiglottitis', 'epiglottitis', 'critical'],
    ]),

    // ─── RHEUMATOLOGY (AUGMENT — existing has only 4) ─────
    ...genList('Rheumatology', 'Immune', [
        ['Rheumatoid Arthritis', 'Arthritis rheumatoidea', 'rheumatoid-arthritis', 'severe'],
        ['Systemic Lupus Erythematosus (SLE)', 'Lupus erythematosus systemicus', 'systemic-lupus-erythematosus', 'severe'],
        ['Ankylosing Spondylitis', 'Spondylitis ankylosans', 'ankylosing-spondylitis', 'severe'],
        ['Psoriatic Arthritis', 'Arthritis psoriatica', 'psoriatic-arthritis', 'moderate'],
        ['Gout', 'Arthritis urica', 'gout-rheum', 'moderate'],
        ['Sjogren Syndrome', 'Syndroma Sjogren', 'sjogren-syndrome', 'moderate'],
        ['Scleroderma (Systemic Sclerosis)', 'Sclerodermia systemica', 'scleroderma-systemic-sclerosis', 'severe'],
        ['Polymyalgia Rheumatica', 'Polymyalgia rheumatica', 'polymyalgia-rheumatica', 'moderate'],
        ['Giant Cell Arteritis', 'Arteritis gigantocellularis', 'giant-cell-arteritis', 'severe'],
        ['Dermatomyositis', 'Dermatomyositis', 'dermatomyositis', 'severe'],
        ['Polymyositis', 'Polymyositis', 'polymyositis', 'severe'],
        ['Vasculitis (ANCA-associated)', 'Vasculitis ANCA-associata', 'anca-vasculitis', 'severe'],
        ['Reactive Arthritis', 'Arthritis reactiva', 'reactive-arthritis', 'moderate'],
        ['Behcet Disease', 'Morbus Behcet', 'behcet-disease', 'severe'],
        ['Mixed Connective Tissue Disease', 'Morbus textus connectivi mixtus', 'mixed-connective-tissue-disease', 'severe'],
        ['Antiphospholipid Syndrome', 'Syndroma antiphospholipidicum', 'antiphospholipid-syndrome', 'severe'],
        ['Osteoarthritis (Rheumatology)', 'Osteoarthritis', 'osteoarthritis-rheum', 'moderate'],
        ['Fibromyalgia', 'Fibromyalgia', 'fibromyalgia-rheum', 'moderate'],
        ['Calcium Pyrophosphate Deposition Disease', 'CPPD', 'cppd-disease', 'moderate'],
        ['Raynaud Phenomenon', 'Phaenomenon Raynaud', 'raynaud-phenomenon', 'mild'],
    ]),

    // ─── RADIOLOGY / DIAGNOSTIC RADIOLOGY ─────────────────
    ...genList('Radiology', 'Multiple', [
        ['Mammographic Breast Lesion', 'Laesio mammae mammographica', 'mammographic-breast-lesion', 'moderate'],
        ['Lung Nodule (Incidental Finding)', 'Nodulus pulmonis incidentalis', 'lung-nodule-incidental', 'moderate'],
        ['Renal Mass (CT Finding)', 'Massa renalis (CT)', 'renal-mass-ct-finding', 'severe'],
        ['Liver Hemangioma', 'Haemangioma hepatis', 'liver-hemangioma', 'mild'],
        ['Ovarian Cyst (Ultrasound)', 'Cystis ovarii (ultrasonographia)', 'ovarian-cyst-ultrasound', 'mild'],
        ['Aortic Calcification', 'Calcificatio aortae', 'aortic-calcification', 'moderate'],
        ['Herniated Disc (MRI)', 'Hernia disci (MRI)', 'herniated-disc-mri', 'moderate'],
        ['Stroke Imaging (CT/MRI)', 'Imaginatio ictus (CT/MRI)', 'stroke-imaging', 'critical'],
        ['Coronary Artery Calcification Score', 'Score calcificationis arteriae coronariae', 'coronary-artery-calcium-score', 'moderate'],
        ['Thyroid Ultrasound Findings', 'Inventiones ultrasonographiae thyroideae', 'thyroid-ultrasound-findings', 'mild'],
        ['Abdominal Aortic Aneurysm Screening', 'Provisio aneurysmatis aortae abdominalis', 'aaa-screening', 'moderate'],
        ['Interventional Radiology Procedures', 'Procedura radiologiae interventionalis', 'interventional-radiology', 'moderate'],
    ]),
];

/* ─── Helper ──────────────────────────────────────────────── */

function genList(
    specialistType: string,
    bodySystem: string,
    items: [string, string, string, string][]
): SeedCondition[] {
    return items.map(([commonName, scientificName, slug, severityLevel]) => ({
        commonName,
        scientificName,
        slug,
        specialistType,
        severityLevel,
        bodySystem,
        description: `${commonName} is a condition managed by ${specialistType} specialists.`,
    }));
}

/* ─── Main ─────────────────────────────────────────────────── */

async function main() {
    console.log('🌱 Seeding missing specialties...\n');

    let created = 0;
    let skipped = 0;

    for (const cond of CONDITIONS) {
        const existing = await prisma.medicalCondition.findUnique({
            where: { slug: cond.slug },
        });
        if (existing) {
            skipped++;
            continue;
        }

        await prisma.medicalCondition.create({
            data: {
                commonName: cond.commonName,
                scientificName: cond.scientificName,
                slug: cond.slug,
                specialistType: cond.specialistType,
                severityLevel: cond.severityLevel,
                bodySystem: cond.bodySystem,
                description: cond.description,
                isActive: true,
                symptoms: [],
                treatments: [],
                faqs: [],
            },
        });
        created++;
    }

    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏩ Skipped (already exists): ${skipped}`);
    console.log(`  📊 Total attempted: ${CONDITIONS.length}`);
    console.log('\n🎉 Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
