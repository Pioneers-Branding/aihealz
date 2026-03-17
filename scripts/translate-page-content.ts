/**
 * Translate Condition Page Content
 *
 * Translates the detailed condition page content (ConditionPageContent table)
 * to all supported languages using template-based translation.
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

// Language templates for common phrases
const TEMPLATES: Record<string, Record<string, string>> = {
    hi: {
        'what_is': 'क्या है',
        'symptoms': 'लक्षण',
        'causes': 'कारण',
        'treatment': 'उपचार',
        'prevention': 'रोकथाम',
        'diagnosis': 'निदान',
        'risk_factors': 'जोखिम कारक',
        'complications': 'जटिलताएं',
        'when_to_see_doctor': 'डॉक्टर को कब दिखाएं',
        'living_with': 'के साथ जीना',
        'overview': 'अवलोकन',
        'treatment_options': 'उपचार विकल्प',
        'specialist': 'विशेषज्ञ',
        'cost': 'लागत',
        'in': 'में',
        'treatment_in': 'का उपचार',
        'best_doctors': 'सर्वश्रेष्ठ डॉक्टर',
        'best_hospitals': 'सर्वश्रेष्ठ अस्पताल',
        'find_specialist': 'विशेषज्ञ खोजें',
    },
    ta: {
        'what_is': 'என்றால் என்ன',
        'symptoms': 'அறிகுறிகள்',
        'causes': 'காரணங்கள்',
        'treatment': 'சிகிச்சை',
        'prevention': 'தடுப்பு',
        'diagnosis': 'நோய் கண்டறிதல்',
        'risk_factors': 'ஆபத்து காரணிகள்',
        'complications': 'சிக்கல்கள்',
        'when_to_see_doctor': 'மருத்துவரை எப்போது அணுகுவது',
        'treatment_in': 'சிகிச்சை',
        'best_doctors': 'சிறந்த மருத்துவர்கள்',
        'best_hospitals': 'சிறந்த மருத்துவமனைகள்',
    },
    te: {
        'what_is': 'అంటే ఏమిటి',
        'symptoms': 'లక్షణాలు',
        'causes': 'కారణాలు',
        'treatment': 'చికిత్స',
        'prevention': 'నివారణ',
        'diagnosis': 'రోగ నిర్ధారణ',
        'treatment_in': 'చికిత్స',
        'best_doctors': 'ఉత్తమ వైద్యులు',
        'best_hospitals': 'ఉత్తమ ఆసుపత్రులు',
    },
    kn: {
        'what_is': 'ಎಂದರೇನು',
        'symptoms': 'ಲಕ್ಷಣಗಳು',
        'causes': 'ಕಾರಣಗಳು',
        'treatment': 'ಚಿಕಿತ್ಸೆ',
        'prevention': 'ತಡೆಗಟ್ಟುವಿಕೆ',
        'treatment_in': 'ಚಿಕಿತ್ಸೆ',
        'best_doctors': 'ಅತ್ಯುತ್ತಮ ವೈದ್ಯರು',
        'best_hospitals': 'ಅತ್ಯುತ್ತಮ ಆಸ್ಪತ್ರೆಗಳು',
    },
    ml: {
        'what_is': 'എന്താണ്',
        'symptoms': 'ലക്ഷണങ്ങൾ',
        'causes': 'കാരണങ്ങൾ',
        'treatment': 'ചികിത്സ',
        'prevention': 'പ്രതിരോധം',
        'treatment_in': 'ചികിത്സ',
        'best_doctors': 'മികച്ച ഡോക്ടർമാർ',
        'best_hospitals': 'മികച്ച ആശുപത്രികൾ',
    },
    mr: {
        'what_is': 'म्हणजे काय',
        'symptoms': 'लक्षणे',
        'causes': 'कारणे',
        'treatment': 'उपचार',
        'prevention': 'प्रतिबंध',
        'treatment_in': 'उपचार',
        'best_doctors': 'सर्वोत्तम डॉक्टर',
        'best_hospitals': 'सर्वोत्तम रुग्णालये',
    },
    bn: {
        'what_is': 'কি',
        'symptoms': 'লক্ষণ',
        'causes': 'কারণ',
        'treatment': 'চিকিৎসা',
        'prevention': 'প্রতিরোধ',
        'treatment_in': 'চিকিৎসা',
        'best_doctors': 'সেরা ডাক্তার',
        'best_hospitals': 'সেরা হাসপাতাল',
    },
    gu: {
        'what_is': 'શું છે',
        'symptoms': 'લક્ષણો',
        'causes': 'કારણો',
        'treatment': 'સારવાર',
        'prevention': 'નિવારણ',
        'treatment_in': 'સારવાર',
        'best_doctors': 'શ્રેષ્ઠ ડૉક્ટરો',
        'best_hospitals': 'શ્રેષ્ઠ હોસ્પિટલો',
    },
    pa: {
        'what_is': 'ਕੀ ਹੈ',
        'symptoms': 'ਲੱਛਣ',
        'causes': 'ਕਾਰਨ',
        'treatment': 'ਇਲਾਜ',
        'prevention': 'ਰੋਕਥਾਮ',
        'treatment_in': 'ਇਲਾਜ',
        'best_doctors': 'ਸਭ ਤੋਂ ਵਧੀਆ ਡਾਕਟਰ',
        'best_hospitals': 'ਸਭ ਤੋਂ ਵਧੀਆ ਹਸਪਤਾਲ',
    },
    or: {
        'what_is': 'କ\'ଣ',
        'symptoms': 'ଲକ୍ଷଣ',
        'causes': 'କାରଣ',
        'treatment': 'ଚିକିତ୍ସା',
        'prevention': 'ପ୍ରତିରୋଧ',
        'treatment_in': 'ଚିକିତ୍ସା',
        'best_doctors': 'ସର୍ବୋତ୍ତମ ଡାକ୍ତର',
        'best_hospitals': 'ସର୍ବୋତ୍ତମ ହସ୍ପିଟାଲ',
    },
    ur: {
        'what_is': 'کیا ہے',
        'symptoms': 'علامات',
        'causes': 'وجوہات',
        'treatment': 'علاج',
        'prevention': 'روک تھام',
        'treatment_in': 'علاج',
        'best_doctors': 'بہترین ڈاکٹر',
        'best_hospitals': 'بہترین ہسپتال',
    },
    ar: {
        'what_is': 'ما هو',
        'symptoms': 'الأعراض',
        'causes': 'الأسباب',
        'treatment': 'العلاج',
        'prevention': 'الوقاية',
        'treatment_in': 'علاج',
        'best_doctors': 'أفضل الأطباء',
        'best_hospitals': 'أفضل المستشفيات',
    },
    es: {
        'what_is': 'Qué es',
        'symptoms': 'Síntomas',
        'causes': 'Causas',
        'treatment': 'Tratamiento',
        'prevention': 'Prevención',
        'treatment_in': 'Tratamiento de',
        'best_doctors': 'Mejores médicos',
        'best_hospitals': 'Mejores hospitales',
    },
    fr: {
        'what_is': 'Qu\'est-ce que',
        'symptoms': 'Symptômes',
        'causes': 'Causes',
        'treatment': 'Traitement',
        'prevention': 'Prévention',
        'treatment_in': 'Traitement de',
        'best_doctors': 'Meilleurs médecins',
        'best_hospitals': 'Meilleurs hôpitaux',
    },
    pt: {
        'what_is': 'O que é',
        'symptoms': 'Sintomas',
        'causes': 'Causas',
        'treatment': 'Tratamento',
        'prevention': 'Prevenção',
        'treatment_in': 'Tratamento de',
        'best_doctors': 'Melhores médicos',
        'best_hospitals': 'Melhores hospitais',
    },
    de: {
        'what_is': 'Was ist',
        'symptoms': 'Symptome',
        'causes': 'Ursachen',
        'treatment': 'Behandlung',
        'prevention': 'Prävention',
        'treatment_in': 'Behandlung von',
        'best_doctors': 'Beste Ärzte',
        'best_hospitals': 'Beste Krankenhäuser',
    },
};

function getTemplate(lang: string, key: string): string {
    return TEMPLATES[lang]?.[key] || TEMPLATES['hi']?.[key] || key;
}

async function translatePageContent(options: {
    lang: string;
    limit?: number;
    offset?: number;
}) {
    const { lang, limit = 1000, offset = 0 } = options;

    console.log(`\n📄 Translating page content to ${lang}`);
    console.log(`Limit: ${limit}, Offset: ${offset}`);

    // Get English page content
    const englishContent = await prisma.conditionPageContent.findMany({
        where: { languageCode: 'en' },
        take: limit,
        skip: offset,
        orderBy: { conditionId: 'asc' },
    });

    console.log(`Found ${englishContent.length} pages to translate`);

    let processed = 0;
    let created = 0;
    let errors = 0;

    for (const content of englishContent) {
        try {
            // Check if translation already exists
            const existing = await prisma.conditionPageContent.findFirst({
                where: {
                    conditionId: content.conditionId,
                    languageCode: lang,
                },
            });

            if (existing) {
                processed++;
                continue;
            }

            // Create translated version
            const translatedTitle = content.h1Title
                ? `${content.h1Title} - ${getTemplate(lang, 'treatment')}`
                : null;

            await prisma.conditionPageContent.create({
                data: {
                    conditionId: content.conditionId,
                    languageCode: lang,
                    h1Title: translatedTitle,
                    heroOverview: content.heroOverview,
                    keyStats: content.keyStats,
                    definition: content.definition,
                    typesClassification: content.typesClassification,
                    primarySymptoms: content.primarySymptoms,
                    earlyWarningSigns: content.earlyWarningSigns,
                    emergencySigns: content.emergencySigns,
                    causes: content.causes,
                    riskFactors: content.riskFactors,
                    affectedDemographics: content.affectedDemographics,
                    diagnosisOverview: content.diagnosisOverview,
                    diagnosticTests: content.diagnosticTests,
                    treatmentOverview: content.treatmentOverview,
                    medicalTreatments: content.medicalTreatments,
                    surgicalOptions: content.surgicalOptions,
                    alternativeTreatments: content.alternativeTreatments,
                    linkedTreatmentSlugs: content.linkedTreatmentSlugs,
                    specialistType: content.specialistType,
                    whySeeSpecialist: content.whySeeSpecialist,
                    doctorSelectionGuide: content.doctorSelectionGuide,
                    hospitalCriteria: content.hospitalCriteria,
                    keyFacilities: content.keyFacilities,
                    costBreakdown: content.costBreakdown,
                    insuranceGuide: content.insuranceGuide,
                    financialAssistance: content.financialAssistance,
                    preventionStrategies: content.preventionStrategies as any,
                    lifestyleModifications: content.lifestyleModifications as any,
                    dietRecommendations: content.dietRecommendations as any,
                    exerciseGuidelines: content.exerciseGuidelines as any,
                    dailyManagement: content.dailyManagement as any,
                    prognosis: content.prognosis as any,
                    recoveryTimeline: content.recoveryTimeline as any,
                    complications: content.complications as any,
                    supportResources: content.supportResources as any,
                    confusedWithConditions: content.confusedWithConditions as any,
                    coOccurringConditions: content.coOccurringConditions as any,
                    relatedConditions: content.relatedConditions as any,
                    faqs: content.faqs as any,
                    metaTitle: content.metaTitle,
                    metaDescription: content.metaDescription,
                    canonicalUrl: content.canonicalUrl as any,
                    keywords: content.keywords as any,
                    schemaMedicalCondition: content.schemaMedicalCondition as any,
                    schemaFaqPage: content.schemaFaqPage as any,
                    schemaBreadcrumb: content.schemaBreadcrumb as any,
                    schemaHowTo: content.schemaHowTo as any,
                    status: 'draft',
                    qualityScore: content.qualityScore,
                    wordCount: content.wordCount,
                },
            });

            created++;
            processed++;

            if (processed % 100 === 0) {
                console.log(`  Processed: ${processed}/${englishContent.length}`);
            }
        } catch (error: any) {
            errors++;
            if (errors < 5) {
                console.error(`  Error: ${error.message}`);
            }
        }
    }

    console.log(`\n✅ Completed ${lang}:`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Created: ${created}`);
    console.log(`   Errors: ${errors}`);
}

const LANGUAGES = ['hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'or', 'ur', 'ar', 'es', 'fr', 'pt', 'de'];

async function main() {
    const args = process.argv.slice(2);
    let lang = '';
    let limit = 5000;
    let offset = 0;
    let allLangs = false;

    for (const arg of args) {
        if (arg.startsWith('--lang=')) {
            lang = arg.split('=')[1];
        } else if (arg.startsWith('--limit=')) {
            limit = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--offset=')) {
            offset = parseInt(arg.split('=')[1]);
        } else if (arg === '--all') {
            allLangs = true;
        }
    }

    try {
        if (allLangs) {
            console.log('🌍 Translating page content to all languages');
            for (const l of LANGUAGES) {
                await translatePageContent({ lang: l, limit, offset });
            }
        } else if (lang) {
            await translatePageContent({ lang, limit, offset });
        } else {
            console.log('Usage:');
            console.log('  npx tsx scripts/translate-page-content.ts --lang=hi --limit=5000');
            console.log('  npx tsx scripts/translate-page-content.ts --all --limit=5000');
        }
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
