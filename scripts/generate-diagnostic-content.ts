/**
 * Diagnostic Test Content Generation & Translation Script
 *
 * Generates detailed content for diagnostic tests and translates to all languages.
 *
 * Usage:
 *   npx tsx scripts/generate-diagnostic-content.ts
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL not found');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// Languages
const LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'ar', 'es', 'fr', 'pt', 'de'];

// ============================================================================
// TRANSLATION DICTIONARIES
// ============================================================================

interface LanguageDictionary {
    terms: Record<string, string>;
    phrases: Record<string, string>;
    connectors: Record<string, string>;
}

const DICTIONARIES: Record<string, LanguageDictionary> = {
    hi: {
        terms: {
            // Test types
            'blood test': 'रक्त परीक्षण',
            'urine test': 'मूत्र परीक्षण',
            'stool test': 'मल परीक्षण',
            'imaging test': 'इमेजिंग परीक्षण',
            'biopsy': 'बायोप्सी',
            'culture': 'कल्चर',
            'screening': 'स्क्रीनिंग',
            // Common test names
            'complete blood count': 'पूर्ण रक्त गणना',
            'hemoglobin': 'हीमोग्लोबिन',
            'blood sugar': 'रक्त शर्करा',
            'glucose': 'ग्लूकोज',
            'cholesterol': 'कोलेस्ट्रॉल',
            'triglycerides': 'ट्राइग्लिसराइड्स',
            'liver function': 'लिवर फंक्शन',
            'kidney function': 'किडनी फंक्शन',
            'thyroid': 'थायराइड',
            'uric acid': 'यूरिक एसिड',
            'creatinine': 'क्रिएटिनिन',
            'electrolyte': 'इलेक्ट्रोलाइट',
            'lipid profile': 'लिपिड प्रोफाइल',
            'vitamin': 'विटामिन',
            // Medical terms
            'test': 'परीक्षण',
            'sample': 'नमूना',
            'result': 'परिणाम',
            'normal': 'सामान्य',
            'abnormal': 'असामान्य',
            'elevated': 'बढ़ा हुआ',
            'low': 'कम',
            'high': 'उच्च',
            'measures': 'मापता है',
            'detects': 'पता लगाता है',
            'evaluate': 'मूल्यांकन',
            'assess': 'आकलन',
            'monitor': 'निगरानी',
            'diagnose': 'निदान',
            'health': 'स्वास्थ्य',
            'disease': 'रोग',
            'disorder': 'विकार',
            'infection': 'संक्रमण',
            'inflammation': 'सूजन',
            'anemia': 'एनीमिया',
            'diabetes': 'मधुमेह',
            'cancer': 'कैंसर',
            'leukemia': 'ल्यूकेमिया',
            'kidney': 'गुर्दा',
            'liver': 'जिगर',
            'heart': 'हृदय',
            'blood': 'रक्त',
            'cells': 'कोशिकाएं',
            'red blood cells': 'लाल रक्त कोशिकाएं',
            'white blood cells': 'सफेद रक्त कोशिकाएं',
            'platelets': 'प्लेटलेट्स',
            'enzymes': 'एंजाइम',
            'protein': 'प्रोटीन',
            'albumin': 'एल्बुमिन',
            'bilirubin': 'बिलीरुबिन',
            // Preparations
            'fasting': 'उपवास',
            'overnight': 'रात भर',
            'hours': 'घंटे',
            'before': 'पहले',
            'after': 'बाद',
            'morning': 'सुबह',
            'water': 'पानी',
            'food': 'भोजन',
            'medicine': 'दवा',
            'medications': 'दवाइयां',
        },
        phrases: {
            'This test measures': 'यह परीक्षण मापता है',
            'This test evaluates': 'यह परीक्षण मूल्यांकन करता है',
            'This test is used to': 'यह परीक्षण इसके लिए किया जाता है',
            'No special preparation required': 'कोई विशेष तैयारी आवश्यक नहीं',
            'Fasting for 8-12 hours is required': '8-12 घंटे का उपवास आवश्यक है',
            'Fasting for 10-12 hours': '10-12 घंटे का उपवास',
            'Avoid eating or drinking': 'खाने या पीने से बचें',
            'Drink plenty of water': 'पर्याप्त पानी पिएं',
            'Inform your doctor about medications': 'अपने डॉक्टर को दवाओं के बारे में बताएं',
            'Higher levels indicate': 'उच्च स्तर दर्शाता है',
            'Lower levels indicate': 'निम्न स्तर दर्शाता है',
            'Normal range': 'सामान्य सीमा',
            'Consult your doctor': 'अपने डॉक्टर से परामर्श करें',
            'Results are usually available': 'परिणाम आमतौर पर उपलब्ध होते हैं',
            'within 24 hours': '24 घंटों के भीतर',
            'within 48 hours': '48 घंटों के भीतर',
            'same day': 'उसी दिन',
            'overall health': 'समग्र स्वास्थ्य',
            'detect disorders': 'विकारों का पता लगाएं',
            'assess function': 'कार्य का आकलन करें',
            'blood sample': 'रक्त का नमूना',
            'urine sample': 'मूत्र का नमूना',
        },
        connectors: {
            ' of ': ' का ',
            ' in ': ' में ',
            ' and ': ' और ',
            ' or ': ' या ',
            ' for ': ' के लिए ',
            ' to ': ' को ',
            ' the ': ' ',
            ' is ': ' है ',
            ' are ': ' हैं ',
        },
    },
    ta: {
        terms: {
            'blood test': 'இரத்த பரிசோதனை',
            'test': 'பரிசோதனை',
            'result': 'முடிவு',
            'normal': 'இயல்பான',
            'health': 'ஆரோக்கியம்',
            'blood': 'இரத்தம்',
            'kidney': 'சிறுநீரகம்',
            'liver': 'கல்லீரல்',
            'heart': 'இதயம்',
        },
        phrases: {},
        connectors: {
            ' and ': ' மற்றும் ',
            ' of ': ' இன் ',
        },
    },
    te: {
        terms: {
            'blood test': 'రక్త పరీక్ష',
            'test': 'పరీక్ష',
            'health': 'ఆరోగ్యం',
            'blood': 'రక్తం',
        },
        phrases: {},
        connectors: {
            ' and ': ' మరియు ',
        },
    },
    bn: {
        terms: {
            'blood test': 'রক্ত পরীক্ষা',
            'test': 'পরীক্ষা',
            'health': 'স্বাস্থ্য',
            'blood': 'রক্ত',
        },
        phrases: {},
        connectors: {
            ' and ': ' এবং ',
        },
    },
    es: {
        terms: {
            'blood test': 'análisis de sangre',
            'test': 'prueba',
            'result': 'resultado',
            'normal': 'normal',
            'health': 'salud',
            'blood': 'sangre',
            'kidney': 'riñón',
            'liver': 'hígado',
            'heart': 'corazón',
        },
        phrases: {
            'This test measures': 'Esta prueba mide',
            'No special preparation required': 'No se requiere preparación especial',
        },
        connectors: {
            ' and ': ' y ',
            ' of ': ' de ',
            ' for ': ' para ',
        },
    },
    fr: {
        terms: {
            'blood test': 'analyse de sang',
            'test': 'test',
            'health': 'santé',
            'blood': 'sang',
        },
        phrases: {},
        connectors: {
            ' and ': ' et ',
            ' of ': ' de ',
        },
    },
    de: {
        terms: {
            'blood test': 'Bluttest',
            'test': 'Test',
            'health': 'Gesundheit',
            'blood': 'Blut',
        },
        phrases: {},
        connectors: {
            ' and ': ' und ',
            ' of ': ' von ',
        },
    },
    ar: {
        terms: {
            'blood test': 'فحص الدم',
            'test': 'فحص',
            'health': 'صحة',
            'blood': 'دم',
        },
        phrases: {},
        connectors: {
            ' and ': ' و ',
        },
    },
    mr: { terms: {}, phrases: {}, connectors: { ' and ': ' आणि ' } },
    gu: { terms: {}, phrases: {}, connectors: { ' and ': ' અને ' } },
    kn: { terms: {}, phrases: {}, connectors: { ' and ': ' ಮತ್ತು ' } },
    ml: { terms: {}, phrases: {}, connectors: { ' and ': ' ഒപ്പം ' } },
    pa: { terms: {}, phrases: {}, connectors: { ' and ': ' ਅਤੇ ' } },
    or: { terms: {}, phrases: {}, connectors: { ' and ': ' ଏବଂ ' } },
    ur: { terms: {}, phrases: {}, connectors: { ' and ': ' اور ' } },
    pt: { terms: {}, phrases: {}, connectors: { ' and ': ' e ', ' of ': ' de ' } },
};

// ============================================================================
// CONTENT GENERATION TEMPLATES
// ============================================================================

interface TestContentTemplate {
    preparationRequired: boolean;
    fastingRequired: boolean;
    sampleType: string;
    turnaroundTime: string;
}

const TEST_TEMPLATES: Record<string, TestContentTemplate> = {
    'complete-blood-count': {
        preparationRequired: false,
        fastingRequired: false,
        sampleType: 'blood',
        turnaroundTime: '24 hours',
    },
    'hemoglobin-test': {
        preparationRequired: false,
        fastingRequired: false,
        sampleType: 'blood',
        turnaroundTime: '24 hours',
    },
    'lipid-profile-test': {
        preparationRequired: true,
        fastingRequired: true,
        sampleType: 'blood',
        turnaroundTime: '24 hours',
    },
    'liver-function-test': {
        preparationRequired: true,
        fastingRequired: true,
        sampleType: 'blood',
        turnaroundTime: '24-48 hours',
    },
    'kidney-function-test': {
        preparationRequired: true,
        fastingRequired: false,
        sampleType: 'blood',
        turnaroundTime: '24-48 hours',
    },
    'thyroid-function-test': {
        preparationRequired: true,
        fastingRequired: false,
        sampleType: 'blood',
        turnaroundTime: '24-48 hours',
    },
};

function generatePreparation(test: any): string {
    const template = TEST_TEMPLATES[test.slug];
    const name = test.name;

    if (template?.fastingRequired) {
        return `Fasting for 10-12 hours is required before this test. Only water is allowed during the fasting period. Avoid alcohol for 24 hours before the test. Inform your doctor about any medications you are taking.`;
    } else if (template?.preparationRequired) {
        return `Inform your doctor about any medications you are currently taking. Avoid alcohol for 24 hours before the test. Drink plenty of water before sample collection.`;
    } else {
        return `No special preparation is required for this test. You can eat and drink normally before the test. However, inform your doctor about any medications you are taking.`;
    }
}

function generateInterpretation(test: any): string {
    const name = test.name;
    const description = test.description || '';

    return `Your ${name} results will show values compared against the normal reference range. Results within the normal range generally indicate healthy function. Results outside the normal range may require further evaluation. Always consult your doctor to understand what your specific results mean for your health. Do not self-interpret results or make treatment decisions without medical guidance.`;
}

function generateWhenToGetTested(test: any): string {
    const name = test.name;

    return `Your doctor may recommend a ${name} as part of a routine health checkup, to diagnose symptoms you may be experiencing, to monitor an existing condition, or to check the effectiveness of treatment. Follow your doctor's advice on when and how often you need this test.`;
}

// ============================================================================
// TRANSLATION FUNCTION
// ============================================================================

function translateText(text: string | undefined | null, lang: string): string {
    if (!text || lang === 'en') return text || '';

    const dict = DICTIONARIES[lang];
    if (!dict) return text;

    let result = text;

    // Apply phrase translations
    if (dict.phrases) {
        for (const [en, translated] of Object.entries(dict.phrases)) {
            const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            result = result.replace(regex, translated);
        }
    }

    // Apply term translations
    if (dict.terms) {
        for (const [en, translated] of Object.entries(dict.terms)) {
            const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            result = result.replace(regex, translated);
        }
    }

    // Apply connectors
    if (dict.connectors) {
        for (const [en, translated] of Object.entries(dict.connectors)) {
            result = result.split(en).join(translated);
        }
    }

    return result;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
    console.log('============================================================');
    console.log('DIAGNOSTIC TEST CONTENT GENERATION & TRANSLATION');
    console.log('============================================================');
    console.log(`Languages: ${LANGUAGES.join(', ')}`);

    // Get all diagnostic tests
    const tests = await prisma.diagnosticTest.findMany({
        include: {
            category: true,
        },
    });

    console.log(`\nFound ${tests.length} diagnostic tests`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const test of tests) {
        console.log(`\n  Processing: ${test.name}`);

        // Generate English content
        const preparation = generatePreparation(test);
        const interpretation = generateInterpretation(test);
        const whenToGetTested = generateWhenToGetTested(test);

        for (const lang of LANGUAGES) {
            try {
                const title = lang === 'en'
                    ? `${test.name} - Purpose, Preparation, Results`
                    : translateText(`${test.name} - Purpose, Preparation, Results`, lang);

                const description = lang === 'en'
                    ? test.description
                    : translateText(test.description, lang);

                const translatedPrep = lang === 'en'
                    ? preparation
                    : translateText(preparation, lang);

                const translatedInterp = lang === 'en'
                    ? interpretation
                    : translateText(interpretation, lang);

                const translatedWhen = lang === 'en'
                    ? whenToGetTested
                    : translateText(whenToGetTested, lang);

                const metaTitle = lang === 'en'
                    ? `${test.name} | Purpose, Preparation & Results`
                    : translateText(`${test.name} | Purpose, Preparation & Results`, lang);

                const metaDescription = lang === 'en'
                    ? `Learn about ${test.name}: what it measures, how to prepare, and what results mean. Book ${test.name} near you.`
                    : translateText(`Learn about ${test.name}: what it measures, how to prepare, and what results mean. Book ${test.name} near you.`, lang);

                // Check if record exists
                const existing = await prisma.diagnosticTestContent.findFirst({
                    where: {
                        testId: test.id,
                        languageCode: lang,
                        geographyId: null,
                    },
                });

                if (existing) {
                    await prisma.diagnosticTestContent.update({
                        where: { id: existing.id },
                        data: {
                            title,
                            description,
                            preparation: translatedPrep,
                            interpretation: translatedInterp,
                            whenToGetTested: translatedWhen,
                            metaTitle,
                            metaDescription,
                            status: 'ai_draft',
                        },
                    });
                    updated++;
                } else {
                    await prisma.diagnosticTestContent.create({
                        data: {
                            testId: test.id,
                            languageCode: lang,
                            geographyId: null,
                            title,
                            description,
                            preparation: translatedPrep,
                            interpretation: translatedInterp,
                            whenToGetTested: translatedWhen,
                            metaTitle,
                            metaDescription,
                            status: 'ai_draft',
                        },
                    });
                    created++;
                }
            } catch (error: any) {
                console.log(`    Error [${lang}]: ${error.message}`);
                errors++;
            }
        }
    }

    console.log('\n============================================================');
    console.log('COMPLETE');
    console.log('============================================================');
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);

    await prisma.$disconnect();
}

main().catch(console.error);
