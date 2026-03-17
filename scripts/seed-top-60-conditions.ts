import 'dotenv/config';
import prisma from '@/lib/db';

const conditions = [
    // Cardiology
    { slug: 'coronary-artery-disease', commonName: 'Coronary Artery Disease', scientificName: 'Coronary artery disease', specialistType: 'Cardiologist', icdCode: 'I25.10', bodySystem: 'Heart & Cardiovascular' },
    { slug: 'heart-failure', commonName: 'Heart Failure', scientificName: 'Heart failure', specialistType: 'Cardiologist', icdCode: 'I50.9', bodySystem: 'Heart & Cardiovascular' },
    { slug: 'atrial-fibrillation', commonName: 'Atrial Fibrillation', scientificName: 'Atrial fibrillation', specialistType: 'Cardiologist', icdCode: 'I48.91', bodySystem: 'Heart & Cardiovascular' },
    // Neurology
    { slug: 'stroke', commonName: 'Stroke', scientificName: 'Cerebrovascular accident', specialistType: 'Neurologist', icdCode: 'I63.9', bodySystem: 'Head & Brain' },
    { slug: 'alzheimers-disease', commonName: "Alzheimer's Disease", scientificName: "Alzheimer's disease", specialistType: 'Neurologist', icdCode: 'G30.9', bodySystem: 'Head & Brain' },
    { slug: 'parkinsons-disease', commonName: "Parkinson's Disease", scientificName: "Parkinson's disease", specialistType: 'Neurologist', icdCode: 'G20', bodySystem: 'Head & Brain' },
    { slug: 'multiple-sclerosis', commonName: 'Multiple Sclerosis', scientificName: 'Multiple sclerosis', specialistType: 'Neurologist', icdCode: 'G35', bodySystem: 'Head & Brain' },
    { slug: 'epilepsy', commonName: 'Epilepsy', scientificName: 'Epilepsy', specialistType: 'Neurologist', icdCode: 'G40.9', bodySystem: 'Head & Brain' },
    // Orthopedics
    { slug: 'rheumatoid-arthritis', commonName: 'Rheumatoid Arthritis', scientificName: 'Rheumatoid arthritis', specialistType: 'Rheumatologist', icdCode: 'M06.9', bodySystem: 'Spine & Joints' },
    { slug: 'osteoporosis', commonName: 'Osteoporosis', scientificName: 'Osteoporosis', specialistType: 'Endocrinologist', icdCode: 'M81.0', bodySystem: 'Spine & Joints' },
    { slug: 'scoliosis', commonName: 'Scoliosis', scientificName: 'Scoliosis', specialistType: 'Orthopedic Surgeon', icdCode: 'M41.9', bodySystem: 'Spine & Joints' },
    { slug: 'carpal-tunnel', commonName: 'Carpal Tunnel Syndrome', scientificName: 'Carpal tunnel syndrome', specialistType: 'Orthopedic Surgeon', icdCode: 'G56.0', bodySystem: 'Spine & Joints' },
    { slug: 'plantar-fasciitis', commonName: 'Plantar Fasciitis', scientificName: 'Plantar fascial fibromatosis', specialistType: 'Podiatrist', icdCode: 'M72.2', bodySystem: 'Spine & Joints' },
    // Gastroenterology
    { slug: 'ulcerative-colitis', commonName: 'Ulcerative Colitis', scientificName: 'Ulcerative colitis', specialistType: 'Gastroenterologist', icdCode: 'K51.9', bodySystem: 'Digestive System' },
    { slug: 'crohns-disease', commonName: "Crohn's Disease", scientificName: "Crohn's disease", specialistType: 'Gastroenterologist', icdCode: 'K50.9', bodySystem: 'Digestive System' },
    { slug: 'celiac-disease', commonName: 'Celiac Disease', scientificName: 'Celiac disease', specialistType: 'Gastroenterologist', icdCode: 'K90.0', bodySystem: 'Digestive System' },
    { slug: 'gallstones', commonName: 'Gallstones', scientificName: 'Cholelithiasis', specialistType: 'Gastroenterologist', icdCode: 'K80', bodySystem: 'Digestive System' },
    { slug: 'peptic-ulcer', commonName: 'Peptic Ulcer', scientificName: 'Peptic ulcer disease', specialistType: 'Gastroenterologist', icdCode: 'K27.9', bodySystem: 'Digestive System' },
    // Pulmonology
    { slug: 'copd', commonName: 'COPD', scientificName: 'Chronic obstructive pulmonary disease', specialistType: 'Pulmonologist', icdCode: 'J44.9', bodySystem: 'Lungs & Respiratory' },
    { slug: 'pneumonia', commonName: 'Pneumonia', scientificName: 'Pneumonia', specialistType: 'Pulmonologist', icdCode: 'J18.9', bodySystem: 'Lungs & Respiratory' },
    { slug: 'bronchitis', commonName: 'Bronchitis', scientificName: 'Bronchitis', specialistType: 'Pulmonologist', icdCode: 'J40', bodySystem: 'Lungs & Respiratory' },
    { slug: 'tuberculosis', commonName: 'Tuberculosis', scientificName: 'Tuberculosis', specialistType: 'Infectious Disease', icdCode: 'A15.9', bodySystem: 'Lungs & Respiratory' },
    // Endocrinology
    { slug: 'type-1-diabetes', commonName: 'Type 1 Diabetes', scientificName: 'Type 1 diabetes mellitus', specialistType: 'Endocrinologist', icdCode: 'E10.9', bodySystem: 'Endocrine System' },
    { slug: 'hyperthyroidism', commonName: 'Overactive Thyroid (Hyperthyroidism)', scientificName: 'Hyperthyroidism', specialistType: 'Endocrinologist', icdCode: 'E05.9', bodySystem: 'Endocrine System' },
    { slug: 'pcos', commonName: 'PCOS', scientificName: 'Polycystic ovarian syndrome', specialistType: 'Endocrinologist', icdCode: 'E28.2', bodySystem: 'Endocrine System' },
    { slug: 'cushings-syndrome', commonName: "Cushing's Syndrome", scientificName: "Cushing's syndrome", specialistType: 'Endocrinologist', icdCode: 'E24.9', bodySystem: 'Endocrine System' },
    // Oncology
    { slug: 'breast-cancer', commonName: 'Breast Cancer', scientificName: 'Malignant neoplasm of breast', specialistType: 'Oncologist', icdCode: 'C50.9', bodySystem: 'Multiple Systems' },
    { slug: 'lung-cancer', commonName: 'Lung Cancer', scientificName: 'Malignant neoplasm of bronchus and lung', specialistType: 'Oncologist', icdCode: 'C34.9', bodySystem: 'Lungs & Respiratory' },
    { slug: 'prostate-cancer', commonName: 'Prostate Cancer', scientificName: 'Malignant neoplasm of prostate', specialistType: 'Oncologist', icdCode: 'C61', bodySystem: 'Urinary System' },
    { slug: 'colorectal-cancer', commonName: 'Colorectal Cancer', scientificName: 'Malignant neoplasm of colon and rectum', specialistType: 'Oncologist', icdCode: 'C18.9', bodySystem: 'Digestive System' },
    { slug: 'melanoma', commonName: 'Melanoma', scientificName: 'Malignant melanoma of skin', specialistType: 'Oncologist', icdCode: 'C43.9', bodySystem: 'Skin & Dermatology' },
    { slug: 'leukemia', commonName: 'Leukemia', scientificName: 'Leukemia', specialistType: 'Oncologist', icdCode: 'C95.9', bodySystem: 'Blood & Lymphatic' },
    { slug: 'lymphoma', commonName: 'Lymphoma', scientificName: 'Lymphoma', specialistType: 'Oncologist', icdCode: 'C85.9', bodySystem: 'Blood & Lymphatic' },
    // Dermatology
    { slug: 'rosacea', commonName: 'Rosacea', scientificName: 'Rosacea', specialistType: 'Dermatologist', icdCode: 'L71.9', bodySystem: 'Skin & Dermatology' },
    { slug: 'vitiligo', commonName: 'Vitiligo', scientificName: 'Vitiligo', specialistType: 'Dermatologist', icdCode: 'L80', bodySystem: 'Skin & Dermatology' },
    { slug: 'alopecia', commonName: 'Alopecia Areata', scientificName: 'Alopecia areata', specialistType: 'Dermatologist', icdCode: 'L66.9', bodySystem: 'Skin & Dermatology' },
    { slug: 'hives', commonName: 'Hives (Urticaria)', scientificName: 'Urticaria', specialistType: 'Dermatologist', icdCode: 'L50.9', bodySystem: 'Skin & Dermatology' },
    // Psychiatry
    { slug: 'bipolar-disorder', commonName: 'Bipolar Disorder', scientificName: 'Bipolar disorder', specialistType: 'Psychiatrist', icdCode: 'F31.9', bodySystem: 'Mental Health' },
    { slug: 'schizophrenia', commonName: 'Schizophrenia', scientificName: 'Schizophrenia', specialistType: 'Psychiatrist', icdCode: 'F20.9', bodySystem: 'Mental Health' },
    { slug: 'ptsd', commonName: 'PTSD', scientificName: 'Post-traumatic stress disorder', specialistType: 'Psychiatrist', icdCode: 'F43.10', bodySystem: 'Mental Health' },
    { slug: 'ocd', commonName: 'OCD', scientificName: 'Obsessive-compulsive disorder', specialistType: 'Psychiatrist', icdCode: 'F42.9', bodySystem: 'Mental Health' },
    { slug: 'adhd', commonName: 'ADHD', scientificName: 'Attention-deficit hyperactivity disorder', specialistType: 'Psychiatrist', icdCode: 'F90.9', bodySystem: 'Mental Health' },
    // Urology / Gynecology
    { slug: 'uti', commonName: 'UTI (Urinary Tract Infection)', scientificName: 'Urinary tract infection', specialistType: 'Urologist', icdCode: 'N39.0', bodySystem: 'Urinary System' },
    { slug: 'bph', commonName: 'Enlarged Prostate (BPH)', scientificName: 'Benign prostatic hyperplasia', specialistType: 'Urologist', icdCode: 'N40', bodySystem: 'Urinary System' },
    { slug: 'erectile-dysfunction', commonName: 'Erectile Dysfunction', scientificName: 'Erectile dysfunction', specialistType: 'Urologist', icdCode: 'N32.8', bodySystem: 'Urinary System' },
    { slug: 'fibroids', commonName: 'Uterine Fibroids', scientificName: 'Leiomyoma of uterus', specialistType: 'Gynecologist', icdCode: 'D25.9', bodySystem: "Women's Health" },
    { slug: 'pelvic-inflammatory-disease', commonName: 'Pelvic Inflammatory Disease', scientificName: 'Pelvic inflammatory disease', specialistType: 'Gynecologist', icdCode: 'N73.9', bodySystem: "Women's Health" },
    // ENT / Ophthalmology
    { slug: 'tinnitus', commonName: 'Tinnitus', scientificName: 'Tinnitus', specialistType: 'ENT Specialist', icdCode: 'H93.1', bodySystem: 'Eyes & Ears' },
    { slug: 'vertigo', commonName: 'Vertigo', scientificName: 'Vertigo', specialistType: 'ENT Specialist', icdCode: 'H81.4', bodySystem: 'Eyes & Ears' },
    { slug: 'macular-degeneration', commonName: 'Macular Degeneration', scientificName: 'Macular degeneration', specialistType: 'Ophthalmologist', icdCode: 'H35.30', bodySystem: 'Eyes & Ears' },
    { slug: 'diabetic-retinopathy', commonName: 'Diabetic Retinopathy', scientificName: 'Diabetic retinopathy', specialistType: 'Ophthalmologist', icdCode: 'E11.31', bodySystem: 'Eyes & Ears' },
    // Infectious Disease
    { slug: 'hiv-aids', commonName: 'HIV/AIDS', scientificName: 'Human immunodeficiency virus', specialistType: 'Infectious Disease', icdCode: 'B20', bodySystem: 'Immune System' },
    { slug: 'hepatitis-b', commonName: 'Hepatitis B', scientificName: 'Hepatitis B', specialistType: 'Gastroenterologist', icdCode: 'B18.1', bodySystem: 'Digestive System' },
    { slug: 'hepatitis-c', commonName: 'Hepatitis C', scientificName: 'Hepatitis C', specialistType: 'Gastroenterologist', icdCode: 'B18.2', bodySystem: 'Digestive System' },
    { slug: 'lyme-disease', commonName: 'Lyme Disease', scientificName: 'Lyme disease', specialistType: 'Infectious Disease', icdCode: 'A69.2', bodySystem: 'Immune System' },
    { slug: 'malaria', commonName: 'Malaria', scientificName: 'Malaria', specialistType: 'Infectious Disease', icdCode: 'B54', bodySystem: 'Multiple Systems' },
    { slug: 'dengue-fever', commonName: 'Dengue Fever', scientificName: 'Dengue fever', specialistType: 'Infectious Disease', icdCode: 'A90', bodySystem: 'Multiple Systems' },
    // Autoimmune / Other
    { slug: 'lupus', commonName: 'Lupus (SLE)', scientificName: 'Systemic lupus erythematosus', specialistType: 'Rheumatologist', icdCode: 'M32.9', bodySystem: 'Immune System' },
    { slug: 'hashimotos-disease', commonName: "Hashimoto's Disease", scientificName: 'Autoimmune thyroiditis', specialistType: 'Endocrinologist', icdCode: 'E06.3', bodySystem: 'Endocrine System' },
    { slug: 'fibromyalgia', commonName: 'Fibromyalgia', scientificName: 'Fibromyalgia', specialistType: 'Rheumatologist', icdCode: 'M79.7', bodySystem: 'Spine & Joints' },
    { slug: 'chronic-fatigue-syndrome', commonName: 'Chronic Fatigue Syndrome', scientificName: 'Chronic fatigue syndrome', specialistType: 'Internal Medicine', icdCode: 'R53.82', bodySystem: 'Multiple Systems' },
    { slug: 'gout', commonName: 'Gout', scientificName: 'Gout', specialistType: 'Rheumatologist', icdCode: 'M10.9', bodySystem: 'Spine & Joints' },
    { slug: 'anemia', commonName: 'Anemia', scientificName: 'Anemia', specialistType: 'Hematologist', icdCode: 'D64.9', bodySystem: 'Blood & Lymphatic' }
];

async function main() {
    console.log(`Seeding ${conditions.length} additional medical conditions...`);
    let created = 0;
    for (const c of conditions) {
        try {
            await prisma.medicalCondition.upsert({
                where: { slug: c.slug },
                update: {},
                create: {
                    slug: c.slug,
                    commonName: c.commonName,
                    scientificName: c.scientificName,
                    specialistType: c.specialistType,
                    icdCode: c.icdCode,
                    bodySystem: c.bodySystem,
                    isActive: true,
                    symptoms: [],
                    treatments: [],
                    description: ''
                }
            });
            created++;
        } catch (e) {
            console.error(`Failed to add ${c.slug}`, e);
        }
    }
    console.log(`✅ Successfully added ${created} conditions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
