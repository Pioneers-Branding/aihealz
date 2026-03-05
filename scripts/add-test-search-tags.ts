/**
 * Add comprehensive search tags to diagnostic tests
 * This enhances the keywords array with:
 * - Alternate spellings and abbreviations
 * - Common patient search terms
 * - Related conditions
 * - Body system keywords
 * - Sample type keywords
 */

import prisma from '../src/lib/db';

// Test name patterns to search tags mapping
const TEST_KEYWORD_PATTERNS: Record<string, string[]> = {
    // Common blood tests
    'cbc': ['complete blood count', 'blood test', 'hemoglobin', 'rbc count', 'wbc count', 'platelet count', 'anemia test', 'infection test'],
    'complete blood count': ['cbc', 'blood test', 'hemoglobin test', 'rbc', 'wbc', 'platelet'],
    'hemoglobin': ['hb', 'hgb', 'anemia test', 'blood test', 'iron deficiency test'],
    'hba1c': ['glycated hemoglobin', 'diabetes test', 'sugar test', 'a1c', 'hemoglobin a1c', 'average blood sugar'],
    'blood sugar': ['glucose', 'diabetes test', 'fasting sugar', 'fbs', 'rbs', 'ppbs', 'sugar level'],
    'glucose': ['blood sugar', 'diabetes', 'fasting glucose', 'fbs', 'rbs'],
    'lipid': ['cholesterol', 'triglycerides', 'ldl', 'hdl', 'heart health', 'cardiac profile', 'fat test'],
    'cholesterol': ['lipid', 'cholestrol', 'heart test', 'ldl', 'hdl', 'fat test', 'cardiac'],

    // Thyroid tests
    'thyroid': ['tsh', 't3', 't4', 'thyroid function', 'thyroid panel', 'hypothyroid', 'hyperthyroid', 'goiter'],
    'tsh': ['thyroid stimulating hormone', 'thyroid test', 'thyroid function'],
    't3': ['triiodothyronine', 'thyroid test', 'free t3'],
    't4': ['thyroxine', 'thyroid test', 'free t4'],

    // Liver function
    'liver': ['lft', 'liver function', 'sgot', 'sgpt', 'alt', 'ast', 'bilirubin', 'hepatitis', 'jaundice test'],
    'lft': ['liver function test', 'liver profile', 'sgot', 'sgpt', 'hepatic'],
    'sgot': ['ast', 'aspartate aminotransferase', 'liver enzyme'],
    'sgpt': ['alt', 'alanine aminotransferase', 'liver enzyme'],
    'bilirubin': ['jaundice', 'liver test', 'yellowing'],

    // Kidney function
    'kidney': ['renal', 'kft', 'creatinine', 'urea', 'bun', 'egfr', 'renal function'],
    'creatinine': ['kidney function', 'renal test', 'kidney health'],
    'urea': ['bun', 'kidney function', 'blood urea nitrogen'],
    'egfr': ['glomerular filtration rate', 'kidney function', 'renal function'],

    // Urine tests
    'urine': ['urinalysis', 'urine test', 'urine routine', 'urinary', 'uti test', 'bladder test'],
    'urinalysis': ['urine test', 'urine routine', 'urine analysis'],

    // Imaging
    'xray': ['x-ray', 'radiograph', 'radiography', 'imaging'],
    'x-ray': ['xray', 'radiograph', 'radiography'],
    'ct scan': ['cat scan', 'computed tomography', 'ct imaging'],
    'mri': ['magnetic resonance imaging', 'mri scan', 'magnetic imaging'],
    'ultrasound': ['sonography', 'usg', 'sonogram', 'ultrasonography'],
    'ecg': ['ekg', 'electrocardiogram', 'heart rhythm', 'cardiac test'],
    'ekg': ['ecg', 'electrocardiogram', 'heart test'],
    'echo': ['echocardiogram', 'heart ultrasound', 'cardiac echo'],

    // Vitamin tests
    'vitamin d': ['vit d', 'd3', 'cholecalciferol', 'bone health', 'calcium absorption'],
    'vitamin b12': ['vit b12', 'cobalamin', 'b12 deficiency', 'anemia test'],
    'iron': ['ferritin', 'tibc', 'iron deficiency', 'anemia', 'hemoglobin'],
    'ferritin': ['iron stores', 'iron level', 'anemia test'],

    // Hormone tests
    'testosterone': ['male hormone', 'androgen', 'low t', 'hormone test'],
    'estrogen': ['female hormone', 'estradiol', 'e2', 'hormone test'],
    'cortisol': ['stress hormone', 'adrenal test', 'cortisone'],
    'prolactin': ['prl', 'milk hormone', 'pituitary test'],

    // Cancer markers
    'psa': ['prostate specific antigen', 'prostate test', 'prostate cancer screening'],
    'cea': ['carcinoembryonic antigen', 'cancer marker', 'tumor marker'],
    'ca125': ['ovarian cancer marker', 'cancer antigen 125'],
    'ca19': ['pancreatic cancer marker', 'cancer antigen 19-9'],
    'afp': ['alpha fetoprotein', 'liver cancer marker', 'tumor marker'],

    // Infection tests
    'hiv': ['aids test', 'human immunodeficiency virus', 'hiv screening'],
    'hepatitis': ['hbsag', 'hcv', 'liver infection', 'viral hepatitis'],
    'hbsag': ['hepatitis b', 'hep b', 'liver test'],
    'covid': ['coronavirus', 'sars-cov-2', 'rt-pcr', 'rapid antigen'],
    'dengue': ['dengue fever', 'ns1', 'dengue antibodies', 'breakbone fever'],
    'malaria': ['plasmodium', 'malaria parasite', 'mp test'],
    'typhoid': ['widal', 'salmonella', 'typhoid fever'],

    // Allergy tests
    'allergy': ['ige', 'allergen', 'allergic test', 'hypersensitivity'],
    'ige': ['immunoglobulin e', 'allergy antibody', 'allergic reaction'],

    // Pregnancy tests
    'pregnancy': ['hcg', 'beta hcg', 'urine pregnancy test', 'upt'],
    'hcg': ['pregnancy hormone', 'human chorionic gonadotropin', 'beta hcg'],

    // Electrolytes
    'electrolyte': ['sodium', 'potassium', 'chloride', 'bicarbonate', 'minerals'],
    'sodium': ['na', 'salt level', 'electrolyte'],
    'potassium': ['k', 'electrolyte', 'mineral test'],
    'calcium': ['ca', 'bone health', 'parathyroid'],

    // Cardiac tests
    'troponin': ['heart attack marker', 'cardiac enzyme', 'myocardial infarction'],
    'bnp': ['brain natriuretic peptide', 'heart failure marker', 'cardiac'],
    'cpk': ['creatine phosphokinase', 'muscle enzyme', 'heart enzyme'],

    // Stool tests
    'stool': ['fecal', 'occult blood', 'stool test', 'bowel test', 'feces'],

    // Genetic tests
    'genetic': ['dna test', 'gene test', 'hereditary', 'chromosomal'],
    'karyotype': ['chromosome analysis', 'genetic test'],

    // Biopsy
    'biopsy': ['tissue sample', 'histopathology', 'pathology'],
};

// Sample type keywords
const SAMPLE_TYPE_KEYWORDS: Record<string, string[]> = {
    'blood': ['blood test', 'blood sample', 'venous', 'fasting blood'],
    'urine': ['urine test', 'urine sample', 'midstream urine', 'morning urine'],
    'stool': ['stool sample', 'fecal test', 'bowel sample'],
    'sputum': ['spit test', 'phlegm', 'respiratory sample'],
    'tissue': ['biopsy', 'tissue sample', 'pathology'],
    'swab': ['throat swab', 'nasal swab', 'specimen'],
    'csf': ['spinal fluid', 'cerebrospinal fluid', 'lumbar puncture'],
};

// Body system keywords
const BODY_SYSTEM_KEYWORDS: Record<string, string[]> = {
    'cardiovascular': ['heart', 'cardiac', 'blood vessels', 'circulatory'],
    'respiratory': ['lungs', 'breathing', 'pulmonary', 'chest'],
    'digestive': ['stomach', 'intestine', 'liver', 'gi tract', 'gastro'],
    'urinary': ['kidney', 'bladder', 'urine', 'renal'],
    'endocrine': ['hormones', 'thyroid', 'diabetes', 'glands'],
    'nervous': ['brain', 'nerves', 'neuro', 'neurological'],
    'musculoskeletal': ['bone', 'muscle', 'joints', 'orthopedic'],
    'reproductive': ['fertility', 'pregnancy', 'sexual health'],
    'immune': ['immunity', 'infection', 'antibodies', 'allergies'],
    'hematological': ['blood', 'anemia', 'bleeding', 'clotting'],
};

// Test type keywords
const TEST_TYPE_KEYWORDS: Record<string, string[]> = {
    'lab_test': ['laboratory', 'blood work', 'pathology', 'lab report'],
    'imaging': ['scan', 'radiology', 'x-ray', 'mri', 'ct', 'ultrasound'],
    'pathology': ['biopsy', 'tissue analysis', 'histopathology', 'cytology'],
    'genetic': ['dna', 'gene', 'chromosomal', 'hereditary'],
    'cardiac': ['heart test', 'ecg', 'echo', 'stress test'],
    'pulmonary': ['lung test', 'breathing test', 'pft', 'spirometry'],
    'endoscopy': ['scope', 'colonoscopy', 'gastroscopy', 'internal view'],
};

async function generateSearchKeywords(test: {
    name: string;
    shortName: string | null;
    aliases: string[];
    keywords: string[];
    sampleType: string | null;
    bodySystem: string | null;
    testType: string;
    relatedConditions: string[];
}): Promise<string[]> {
    const tags = new Set<string>();

    // Add existing keywords
    test.keywords.forEach(k => tags.add(k.toLowerCase()));

    // Add aliases
    test.aliases.forEach(a => tags.add(a.toLowerCase()));

    // Add short name
    if (test.shortName) {
        tags.add(test.shortName.toLowerCase());
    }

    // Match patterns in test name
    const lowerName = test.name.toLowerCase();
    for (const [pattern, keywords] of Object.entries(TEST_KEYWORD_PATTERNS)) {
        if (lowerName.includes(pattern.toLowerCase())) {
            keywords.forEach(k => tags.add(k));
        }
    }

    // Add sample type keywords
    if (test.sampleType) {
        const sampleLower = test.sampleType.toLowerCase();
        for (const [type, keywords] of Object.entries(SAMPLE_TYPE_KEYWORDS)) {
            if (sampleLower.includes(type)) {
                keywords.forEach(k => tags.add(k));
                tags.add(type);
            }
        }
    }

    // Add body system keywords
    if (test.bodySystem) {
        const systemLower = test.bodySystem.toLowerCase();
        for (const [system, keywords] of Object.entries(BODY_SYSTEM_KEYWORDS)) {
            if (systemLower.includes(system)) {
                keywords.forEach(k => tags.add(k));
            }
        }
        tags.add(test.bodySystem.toLowerCase());
    }

    // Add test type keywords
    const typeKeywords = TEST_TYPE_KEYWORDS[test.testType];
    if (typeKeywords) {
        typeKeywords.forEach(k => tags.add(k));
    }

    // Add related conditions as keywords
    test.relatedConditions.forEach(c => {
        // Convert slug to words
        const words = c.split('-').join(' ');
        tags.add(words);
    });

    // Add word variations of test name
    const nameWords = lowerName.split(/[\s\-\/\(\)]+/).filter(w => w.length > 2);
    nameWords.forEach(word => tags.add(word));

    return Array.from(tags);
}

async function main() {
    console.log('🔍 Adding search tags to diagnostic tests...\n');

    // Get all tests
    const tests = await prisma.diagnosticTest.findMany({
        select: {
            id: true,
            name: true,
            shortName: true,
            aliases: true,
            keywords: true,
            sampleType: true,
            bodySystem: true,
            testType: true,
            relatedConditions: true,
        }
    });

    console.log(`Found ${tests.length} diagnostic tests\n`);

    let updated = 0;
    let totalKeywords = 0;

    for (const test of tests) {
        const newKeywords = await generateSearchKeywords(test);

        // Only update if we have new keywords
        if (newKeywords.length > test.keywords.length) {
            await prisma.diagnosticTest.update({
                where: { id: test.id },
                data: { keywords: newKeywords }
            });
            updated++;
            totalKeywords += newKeywords.length;

            if (updated % 20 === 0) {
                console.log(`Updated ${updated} tests...`);
            }
        }
    }

    console.log(`\n✅ Updated ${updated} tests with ${totalKeywords} total keywords`);
    console.log(`   Average ${updated > 0 ? (totalKeywords / updated).toFixed(1) : 0} keywords per test`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
