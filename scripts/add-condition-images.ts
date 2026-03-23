import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// ─── Keyword-based image rules (checked in order, first match wins) ───
// Each rule: { keywords: string[], image: url, alt: string }
const imageRules: { keywords: string[]; image: string; alt: string }[] = [
    // ── Heart & Cardiovascular ──
    { keywords: ['heart failure', 'cardiomyopathy'], image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80', alt: 'Heart failure and cardiac care' },
    { keywords: ['atrial fibrillation', 'arrhythmia', 'tachycardia', 'bradycardia', 'flutter'], image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=600&fit=crop&q=80', alt: 'Heart rhythm and ECG monitoring' },
    { keywords: ['myocardial infarction', 'heart attack', 'coronary'], image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&h=600&fit=crop&q=80', alt: 'Coronary artery and heart health' },
    { keywords: ['aneurysm', 'aortic'], image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&h=600&fit=crop&q=80', alt: 'Aortic and vascular health' },
    { keywords: ['hypertension', 'blood pressure', 'hypertensive'], image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop&q=80', alt: 'Blood pressure monitoring and hypertension care' },
    { keywords: ['embolism', 'thrombosis', 'thrombus', 'thombos', 'dvt', 'clot', 'emblsm'], image: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=800&h=600&fit=crop&q=80', alt: 'Blood clot and thrombosis treatment' },
    { keywords: ['valve', 'mitral', 'tricuspid', 'aortic valve', 'stenosis', 'regurgitation'], image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80', alt: 'Heart valve care and treatment' },
    { keywords: ['endocarditis', 'pericarditis', 'myocarditis'], image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80', alt: 'Heart inflammation treatment' },
    { keywords: ['varicose', 'venous', 'vein'], image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80', alt: 'Venous health and circulation' },

    // ── Brain & Nervous System ──
    { keywords: ['stroke', 'cerebrovascular', 'cerebral infarct', 'cerebral hemorrhage'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Brain stroke and cerebrovascular care' },
    { keywords: ['epilepsy', 'seizure', 'convulsion'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Epilepsy and neurological care' },
    { keywords: ['alzheimer', 'dementia', 'cognitive'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Brain health and cognitive care' },
    { keywords: ['parkinson', 'tremor', 'movement disorder'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Movement disorder and neurological treatment' },
    { keywords: ['migraine', 'headache', 'cephalalgia'], image: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=800&h=600&fit=crop&q=80', alt: 'Headache and migraine treatment' },
    { keywords: ['neuropathy', 'nerve', 'neuralgia', 'neuritis'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Nerve and neuropathy treatment' },
    { keywords: ['meningitis', 'encephalitis', 'brain infection'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Brain infection treatment' },
    { keywords: ['multiple sclerosis', 'ms ', 'demyelinating'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Multiple sclerosis and autoimmune neurological care' },
    { keywords: ['spinal cord', 'spinal stenosis', 'myelopathy'], image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Spinal cord and neurological care' },

    // ── Bones, Fractures & Musculoskeletal ──
    { keywords: ['fracture', 'fx ', 'broken bone'], image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Bone fracture treatment and orthopedic care' },
    { keywords: ['dislocation', 'dislocated', 'subluxation'], image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Joint dislocation and orthopedic care' },
    { keywords: ['arthritis', 'osteoarthritis', 'rheumatoid'], image: 'https://images.unsplash.com/photo-1616012480717-fd3e0e4d0843?w=800&h=600&fit=crop&q=80', alt: 'Joint arthritis and rheumatic care' },
    { keywords: ['osteoporosis', 'bone density', 'bone loss'], image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Bone health and osteoporosis treatment' },
    { keywords: ['spine', 'vertebr', 'disc ', 'disk ', 'spondyl', 'lumbar', 'cervical', 'thoracic'], image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80', alt: 'Spine health and back care' },
    { keywords: ['knee', 'patella', 'meniscus', 'cruciate'], image: 'https://images.unsplash.com/photo-1616012480717-fd3e0e4d0843?w=800&h=600&fit=crop&q=80', alt: 'Knee joint and orthopedic care' },
    { keywords: ['hip ', 'femur', 'femor', 'femr'], image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Hip and femur orthopedic care' },
    { keywords: ['shoulder', 'rotator', 'humerus', 'humer'], image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Shoulder and upper arm care' },
    { keywords: ['wrist', 'carpal', 'radius', 'ulna', 'hand ', 'finger'], image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Hand and wrist orthopedic care' },
    { keywords: ['ankle', 'foot', 'tibia', 'fibula', 'calcaneus', 'metatarsal', 'toe'], image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Foot and ankle orthopedic care' },
    { keywords: ['muscle', 'tendon', 'ligament', 'strain', 'sprain', 'tear'], image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop&q=80', alt: 'Muscle and soft tissue injury treatment' },

    // ── Lungs & Respiratory ──
    { keywords: ['pneumonia', 'lung infection'], image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop&q=80', alt: 'Lung infection and pneumonia treatment' },
    { keywords: ['asthma', 'bronchospasm', 'wheezing'], image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop&q=80', alt: 'Asthma and respiratory care' },
    { keywords: ['copd', 'emphysema', 'chronic obstructive', 'bronchitis'], image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop&q=80', alt: 'COPD and chronic lung disease treatment' },
    { keywords: ['pulmonary', 'lung', 'respiratory', 'pleural', 'bronch'], image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop&q=80', alt: 'Pulmonary and respiratory health' },

    // ── Eyes ──
    { keywords: ['glaucoma'], image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&h=600&fit=crop&q=80', alt: 'Glaucoma and eye pressure treatment' },
    { keywords: ['cataract'], image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&h=600&fit=crop&q=80', alt: 'Cataract surgery and lens care' },
    { keywords: ['retina', 'macular', 'retinal'], image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&h=600&fit=crop&q=80', alt: 'Retinal health and eye care' },
    { keywords: ['eye ', 'ocular', 'optic', 'conjunctiv', 'cornea', 'iris', 'lens ', 'visual'], image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&h=600&fit=crop&q=80', alt: 'Eye health and ophthalmology care' },

    // ── Skin ──
    { keywords: ['melanoma', 'skin cancer', 'basal cell', 'squamous cell'], image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&q=80', alt: 'Skin cancer detection and treatment' },
    { keywords: ['eczema', 'dermatitis', 'psoriasis'], image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&q=80', alt: 'Skin condition and dermatology treatment' },
    { keywords: ['acne', 'rosacea', 'skin rash'], image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&q=80', alt: 'Skin health and dermatology care' },
    { keywords: ['wound', 'burn', 'ulcer', 'abscess', 'cellulitis'], image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&q=80', alt: 'Wound care and skin treatment' },
    { keywords: ['skin', 'cutaneous', 'dermat', 'epiderm'], image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&q=80', alt: 'Dermatology and skin health' },

    // ── Digestive & GI ──
    { keywords: ['liver', 'hepat', 'cirrhosis', 'hepatitis'], image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80', alt: 'Liver health and hepatology care' },
    { keywords: ['stomach', 'gastric', 'gastritis', 'peptic'], image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80', alt: 'Stomach and gastric health' },
    { keywords: ['intestin', 'colon', 'bowel', 'colitis', 'crohn', 'ibs', 'diverticu'], image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80', alt: 'Intestinal and digestive health' },
    { keywords: ['pancrea', 'gallbladder', 'biliary', 'cholecyst'], image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80', alt: 'Pancreatic and biliary care' },
    { keywords: ['esophag', 'swallow', 'reflux', 'gerd'], image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80', alt: 'Esophageal and digestive care' },

    // ── Kidney & Urinary ──
    { keywords: ['kidney', 'renal', 'nephri', 'nephro'], image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80', alt: 'Kidney health and renal care' },
    { keywords: ['bladder', 'urinary', 'ureter', 'urethra', 'incontinence'], image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80', alt: 'Urinary system and bladder health' },
    { keywords: ['prostate', 'prostatic'], image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80', alt: 'Prostate health and urological care' },

    // ── Cancer ──
    { keywords: ['leukemia', 'lymphoma', 'myeloma'], image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop&q=80', alt: 'Blood cancer and hematology treatment' },
    { keywords: ['breast cancer', 'breast neoplasm'], image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop&q=80', alt: 'Breast cancer treatment and care' },
    { keywords: ['lung cancer', 'bronchial neoplasm'], image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop&q=80', alt: 'Lung cancer and thoracic oncology' },
    { keywords: ['cancer', 'neoplasm', 'tumor', 'malignant', 'carcinoma', 'sarcoma'], image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop&q=80', alt: 'Cancer treatment and oncology care' },

    // ── Blood & Immune ──
    { keywords: ['anemia', 'anaemia', 'iron deficiency'], image: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=800&h=600&fit=crop&q=80', alt: 'Blood health and anemia treatment' },
    { keywords: ['blood', 'hematol', 'haemato', 'coagul', 'platelet', 'bleeding'], image: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=800&h=600&fit=crop&q=80', alt: 'Blood disorder and hematology care' },
    { keywords: ['hiv', 'aids', 'immunodeficiency'], image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop&q=80', alt: 'HIV/AIDS treatment and immune care' },
    { keywords: ['lupus', 'autoimmune', 'immune'], image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80', alt: 'Autoimmune and immune system care' },

    // ── Diabetes & Endocrine ──
    { keywords: ['diabetes', 'diabetic', 'insulin', 'glycem'], image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop&q=80', alt: 'Diabetes management and blood sugar monitoring' },
    { keywords: ['thyroid', 'hypothyroid', 'hyperthyroid', 'goiter'], image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop&q=80', alt: 'Thyroid health and endocrine care' },
    { keywords: ['hormone', 'adrenal', 'pituitary', 'endocrine'], image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop&q=80', alt: 'Hormonal and endocrine health' },

    // ── Mental Health ──
    { keywords: ['depression', 'depressive', 'major depressive'], image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop&q=80', alt: 'Depression and mental health care' },
    { keywords: ['anxiety', 'panic', 'phobia', 'ptsd', 'stress disorder'], image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop&q=80', alt: 'Anxiety and mental wellness care' },
    { keywords: ['schizophrenia', 'psychosis', 'bipolar', 'mania'], image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop&q=80', alt: 'Psychiatric care and mental health treatment' },
    { keywords: ['alcohol', 'substance', 'addiction', 'dependence', 'opioid'], image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop&q=80', alt: 'Substance and addiction treatment' },
    { keywords: ['autism', 'adhd', 'developmental', 'intellectual'], image: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop&q=80', alt: 'Developmental and neurobehavioral care' },

    // ── Pregnancy & Women's Health ──
    { keywords: ['pregnancy', 'pregnant', 'prenatal', 'gestation', 'trimester', 'antepartum'], image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop&q=80', alt: 'Pregnancy and maternal healthcare' },
    { keywords: ['labor', 'delivery', 'childbirth', 'postpartum', 'puerperal'], image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop&q=80', alt: 'Labor and delivery care' },
    { keywords: ['fetus', 'fetal', 'newborn', 'neonatal', 'perinatal'], image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop&q=80', alt: 'Fetal and neonatal care' },
    { keywords: ['ovarian', 'uterine', 'cervical', 'endometri', 'menstrual'], image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop&q=80', alt: 'Women\'s reproductive health care' },

    // ── Infections ──
    { keywords: ['tuberculosis', 'tb '], image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop&q=80', alt: 'Tuberculosis treatment and care' },
    { keywords: ['covid', 'coronavirus', 'sars'], image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop&q=80', alt: 'COVID and respiratory infection treatment' },
    { keywords: ['sepsis', 'septic', 'bacteremia'], image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop&q=80', alt: 'Sepsis and critical infection care' },
    { keywords: ['infection', 'infectious', 'bacterial', 'viral', 'fungal', 'parasit'], image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop&q=80', alt: 'Infectious disease treatment' },

    // ── Genetics ──
    { keywords: ['genetic', 'chromosom', 'trisomy', 'down syndrome', 'cystic fibrosis', 'inherited'], image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop&q=80', alt: 'Genetic medicine and DNA health' },

    // ── Emergency & Trauma ──
    { keywords: ['poisoning', 'toxic', 'overdose', 'adverse effect'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop&q=80', alt: 'Emergency toxicology and poisoning treatment' },
    { keywords: ['injury', 'trauma', 'contusion', 'laceration', 'crush'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop&q=80', alt: 'Trauma and emergency care' },
    { keywords: ['accident', 'collision', 'fall ', 'struck', 'vehicle'], image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop&q=80', alt: 'Accident and emergency care' },

    // ── Ear, Nose, Throat ──
    { keywords: ['ear ', 'hearing', 'tinnitus', 'otitis', 'deaf'], image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80', alt: 'Ear health and hearing care' },
    { keywords: ['sinus', 'nasal', 'nose ', 'rhinitis', 'sinusitis'], image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80', alt: 'Nasal and sinus health care' },
    { keywords: ['throat', 'tonsil', 'laryn', 'pharyn', 'vocal'], image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80', alt: 'Throat and ENT care' },
];

// Fallback images by specialty (when no keyword matches)
const specialtyFallbacks: Record<string, { url: string; alt: string }> = {
    'Cardiology':         { url: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&h=600&fit=crop&q=80', alt: 'Cardiovascular health and heart care' },
    'Neurology':          { url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80', alt: 'Brain and neurological health' },
    'Orthopedics':        { url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop&q=80', alt: 'Orthopedic and bone care' },
    'Oncology':           { url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop&q=80', alt: 'Oncology and cancer care' },
    'Dermatology':        { url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop&q=80', alt: 'Skin health and dermatology' },
    'Gastroenterology':   { url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop&q=80', alt: 'Digestive health care' },
    'Pulmonology':        { url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=600&fit=crop&q=80', alt: 'Respiratory and lung care' },
    'Endocrinology':      { url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop&q=80', alt: 'Endocrine and hormonal health' },
    'Ophthalmology':      { url: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&h=600&fit=crop&q=80', alt: 'Eye health and vision care' },
    'Psychiatry':         { url: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop&q=80', alt: 'Mental health and wellness' },
    'Urology':            { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&q=80', alt: 'Urological health care' },
    'Hematology':         { url: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=800&h=600&fit=crop&q=80', alt: 'Blood health and hematology' },
    'Infectious Disease': { url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop&q=80', alt: 'Infectious disease care' },
    'General Medicine':   { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&q=80', alt: 'General medical care' },
    'Emergency Medicine': { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop&q=80', alt: 'Emergency medical care' },
    'Obstetrics':         { url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop&q=80', alt: 'Obstetric and maternal care' },
    'Genetics':           { url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop&q=80', alt: 'Genetic medicine' },
    'Neonatology':        { url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop&q=80', alt: 'Neonatal care' },
};

const defaultFallback = { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80', alt: 'Medical healthcare services' };

function getImageForCondition(name: string, specialty: string): { url: string; alt: string } {
    const lower = name.toLowerCase();

    // Try keyword-based matching first
    for (const rule of imageRules) {
        if (rule.keywords.some(kw => lower.includes(kw))) {
            return { url: rule.image, alt: `${name} - ${rule.alt}` };
        }
    }

    // Fall back to specialty
    if (specialtyFallbacks[specialty]) {
        return { url: specialtyFallbacks[specialty].url, alt: `${name} - ${specialtyFallbacks[specialty].alt}` };
    }

    return { url: defaultFallback.url, alt: `${name} - ${defaultFallback.alt}` };
}

async function main() {
    console.log('Updating images based on condition content...\n');

    // Delete all existing condition images (we're replacing them with smarter ones)
    const deleted = await prisma.mediaAsset.deleteMany({
        where: { entityType: 'condition', assetType: 'render' },
    });
    console.log(`Cleared ${deleted.count} existing images`);

    // Get all active conditions
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, commonName: true, specialistType: true },
        orderBy: { commonName: 'asc' },
    });

    console.log(`Processing ${conditions.length} conditions...\n`);

    // Track matching stats
    let keywordMatched = 0;
    let specialtyMatched = 0;
    let defaultMatched = 0;

    // Insert in batches
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < conditions.length; i += batchSize) {
        const batch = conditions.slice(i, i + batchSize);

        const records = batch.map(c => {
            const lower = c.commonName.toLowerCase();
            let matched = 'default';

            // Check keyword match
            for (const rule of imageRules) {
                if (rule.keywords.some(kw => lower.includes(kw))) {
                    matched = 'keyword';
                    break;
                }
            }
            if (matched === 'default' && specialtyFallbacks[c.specialistType]) {
                matched = 'specialty';
            }

            if (matched === 'keyword') keywordMatched++;
            else if (matched === 'specialty') specialtyMatched++;
            else defaultMatched++;

            const img = getImageForCondition(c.commonName, c.specialistType);
            return {
                conditionSlug: c.slug,
                entityType: 'condition',
                entityId: c.id,
                assetType: 'render',
                sourceUrl: img.url,
                cdnUrl: img.url,
                altText: img.alt,
                width: 800,
                height: 600,
                stylePreset: 'clinical-blue',
                isActive: true,
            };
        });

        const result = await prisma.mediaAsset.createMany({ data: records });
        inserted += result.count;

        if ((i / batchSize) % 20 === 0) {
            const pct = ((i + batch.length) / conditions.length * 100).toFixed(1);
            console.log(`Progress: ${inserted} / ${conditions.length} (${pct}%)`);
        }
    }

    console.log(`\nDone! Inserted ${inserted} content-matched images.`);
    console.log(`\nMatching stats:`);
    console.log(`  Keyword matched (specific): ${keywordMatched} (${(keywordMatched/conditions.length*100).toFixed(1)}%)`);
    console.log(`  Specialty fallback: ${specialtyMatched} (${(specialtyMatched/conditions.length*100).toFixed(1)}%)`);
    console.log(`  Default fallback: ${defaultMatched} (${(defaultMatched/conditions.length*100).toFixed(1)}%)`);
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); pool.end(); });
