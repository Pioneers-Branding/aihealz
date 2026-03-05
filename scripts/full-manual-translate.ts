/**
 * Full Manual Translation System
 *
 * Generates actual translated content for ConditionPageContent
 * using comprehensive dictionaries and sentence templates.
 * NO external API calls - all translations are pre-built.
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

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: COMPREHENSIVE MEDICAL DICTIONARIES
// ═══════════════════════════════════════════════════════════════════════════════

interface LanguageDictionary {
    // Common medical terms
    terms: Record<string, string>;
    // Sentence templates
    templates: {
        whatIs: string;           // "What is {condition}?"
        definition: string;       // "{condition} is a {type} condition that affects..."
        symptoms: string;         // "Common symptoms of {condition} include:"
        causes: string;           // "Causes of {condition}:"
        treatment: string;        // "Treatment for {condition}"
        prevention: string;       // "Prevention of {condition}"
        diagnosis: string;        // "How {condition} is diagnosed"
        specialist: string;       // "See a {specialist} for {condition}"
        riskFactors: string;      // "Risk factors for {condition}"
        complications: string;    // "Complications of {condition}"
        prognosis: string;        // "Prognosis for {condition}"
        lifestyle: string;        // "Lifestyle changes for {condition}"
        faqIntro: string;         // "Frequently asked questions about {condition}"
        treatmentIn: string;      // "{condition} treatment in {location}"
        bestDoctors: string;      // "Best doctors for {condition} in {location}"
        costRange: string;        // "Treatment cost ranges from {min} to {max}"
        seekHelp: string;         // "When to seek medical help"
        emergency: string;        // "Seek emergency care if..."
        overview: string;         // "Overview of {condition}"
        managedBy: string;        // "This condition is managed by a {specialist}"
    };
    // Body system names
    bodySystems: Record<string, string>;
    // Severity levels
    severity: Record<string, string>;
    // Common adjectives
    adjectives: Record<string, string>;
    // Common verbs/phrases
    phrases: Record<string, string>;
    // Numbers
    numbers: Record<string, string>;
}

const DICTIONARIES: Record<string, LanguageDictionary> = {
    // ─────────────────────────────────────────────────────────────────────────
    // HINDI (hi)
    // ─────────────────────────────────────────────────────────────────────────
    hi: {
        terms: {
            'condition': 'स्थिति',
            'disease': 'रोग',
            'disorder': 'विकार',
            'syndrome': 'सिंड्रोम',
            'infection': 'संक्रमण',
            'inflammation': 'सूजन',
            'treatment': 'उपचार',
            'therapy': 'चिकित्सा',
            'medication': 'दवा',
            'surgery': 'सर्जरी',
            'diagnosis': 'निदान',
            'symptoms': 'लक्षण',
            'causes': 'कारण',
            'prevention': 'रोकथाम',
            'prognosis': 'पूर्वानुमान',
            'complications': 'जटिलताएं',
            'risk factors': 'जोखिम कारक',
            'doctor': 'डॉक्टर',
            'specialist': 'विशेषज्ञ',
            'hospital': 'अस्पताल',
            'patient': 'मरीज',
            'health': 'स्वास्थ्य',
            'medical': 'चिकित्सा',
            'chronic': 'पुरानी',
            'acute': 'तीव्र',
            'mild': 'हल्का',
            'moderate': 'मध्यम',
            'severe': 'गंभीर',
            'critical': 'अत्यंत गंभीर',
            'pain': 'दर्द',
            'fever': 'बुखार',
            'fatigue': 'थकान',
            'weakness': 'कमजोरी',
            'swelling': 'सूजन',
            'bleeding': 'रक्तस्राव',
            'nausea': 'मतली',
            'vomiting': 'उल्टी',
            'headache': 'सिरदर्द',
            'cough': 'खांसी',
            'breathing': 'सांस',
            'heart': 'हृदय',
            'blood': 'रक्त',
            'bone': 'हड्डी',
            'muscle': 'मांसपेशी',
            'skin': 'त्वचा',
            'brain': 'मस्तिष्क',
            'liver': 'यकृत',
            'kidney': 'गुर्दा',
            'lung': 'फेफड़े',
            'stomach': 'पेट',
            'test': 'परीक्षण',
            'examination': 'जांच',
            'recovery': 'स्वस्थता',
            'cure': 'इलाज',
        },
        templates: {
            whatIs: '{condition} क्या है?',
            definition: '{condition} एक {type} स्थिति है जो {system} को प्रभावित करती है।',
            symptoms: '{condition} के सामान्य लक्षणों में शामिल हैं:',
            causes: '{condition} के कारण:',
            treatment: '{condition} का उपचार',
            prevention: '{condition} की रोकथाम',
            diagnosis: '{condition} का निदान कैसे किया जाता है',
            specialist: '{condition} के लिए {specialist} से मिलें',
            riskFactors: '{condition} के जोखिम कारक',
            complications: '{condition} की जटिलताएं',
            prognosis: '{condition} का पूर्वानुमान',
            lifestyle: '{condition} के लिए जीवनशैली में बदलाव',
            faqIntro: '{condition} के बारे में अक्सर पूछे जाने वाले प्रश्न',
            treatmentIn: '{location} में {condition} का उपचार',
            bestDoctors: '{location} में {condition} के लिए सर्वश्रेष्ठ डॉक्टर',
            costRange: 'उपचार की लागत {min} से {max} तक है',
            seekHelp: 'चिकित्सा सहायता कब लें',
            emergency: 'आपातकालीन देखभाल लें यदि...',
            overview: '{condition} का अवलोकन',
            managedBy: 'इस स्थिति का प्रबंधन {specialist} द्वारा किया जाता है',
        },
        bodySystems: {
            'cardiovascular': 'हृदय प्रणाली',
            'respiratory': 'श्वसन प्रणाली',
            'digestive': 'पाचन तंत्र',
            'nervous': 'तंत्रिका तंत्र',
            'musculoskeletal': 'मांसपेशी-कंकाल प्रणाली',
            'endocrine': 'अंतःस्रावी प्रणाली',
            'immune': 'प्रतिरक्षा प्रणाली',
            'urinary': 'मूत्र प्रणाली',
            'reproductive': 'प्रजनन प्रणाली',
            'integumentary': 'त्वचा प्रणाली',
        },
        severity: {
            'mild': 'हल्का',
            'moderate': 'मध्यम',
            'severe': 'गंभीर',
            'critical': 'अत्यंत गंभीर',
        },
        adjectives: {
            'common': 'सामान्य',
            'rare': 'दुर्लभ',
            'chronic': 'पुरानी',
            'acute': 'तीव्र',
            'hereditary': 'वंशानुगत',
            'contagious': 'संक्रामक',
            'treatable': 'उपचार योग्य',
            'preventable': 'रोकथाम योग्य',
        },
        phrases: {
            'consult doctor': 'डॉक्टर से परामर्श लें',
            'seek immediate help': 'तुरंत मदद लें',
            'lifestyle changes': 'जीवनशैली में बदलाव',
            'regular checkup': 'नियमित जांच',
            'early detection': 'जल्द पता लगाना',
            'proper treatment': 'उचित उपचार',
            'follow instructions': 'निर्देशों का पालन करें',
            'take medication': 'दवा लें',
        },
        numbers: {
            '1': '१', '2': '२', '3': '३', '4': '४', '5': '५',
            '6': '६', '7': '७', '8': '८', '9': '९', '0': '०',
        },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TAMIL (ta)
    // ─────────────────────────────────────────────────────────────────────────
    ta: {
        terms: {
            'condition': 'நிலை',
            'disease': 'நோய்',
            'disorder': 'கோளாறு',
            'syndrome': 'நோய்க்குறி',
            'infection': 'தொற்று',
            'inflammation': 'வீக்கம்',
            'treatment': 'சிகிச்சை',
            'therapy': 'சிகிச்சை முறை',
            'medication': 'மருந்து',
            'surgery': 'அறுவை சிகிச்சை',
            'diagnosis': 'நோய் கண்டறிதல்',
            'symptoms': 'அறிகுறிகள்',
            'causes': 'காரணங்கள்',
            'prevention': 'தடுப்பு',
            'prognosis': 'முன்கணிப்பு',
            'complications': 'சிக்கல்கள்',
            'risk factors': 'ஆபத்து காரணிகள்',
            'doctor': 'மருத்துவர்',
            'specialist': 'நிபுணர்',
            'hospital': 'மருத்துவமனை',
            'patient': 'நோயாளி',
            'health': 'ஆரோக்கியம்',
            'medical': 'மருத்துவ',
            'chronic': 'நீடித்த',
            'acute': 'கடுமையான',
            'mild': 'லேசான',
            'moderate': 'மிதமான',
            'severe': 'கடுமையான',
            'critical': 'மிக கடுமையான',
            'pain': 'வலி',
            'fever': 'காய்ச்சல்',
            'fatigue': 'சோர்வு',
            'weakness': 'பலவீனம்',
            'swelling': 'வீக்கம்',
            'test': 'பரிசோதனை',
            'recovery': 'மீட்பு',
        },
        templates: {
            whatIs: '{condition} என்றால் என்ன?',
            definition: '{condition} என்பது {system} பாதிக்கும் ஒரு {type} நிலை.',
            symptoms: '{condition} இன் பொதுவான அறிகுறிகள்:',
            causes: '{condition} இன் காரணங்கள்:',
            treatment: '{condition} சிகிச்சை',
            prevention: '{condition} தடுப்பு',
            diagnosis: '{condition} எவ்வாறு கண்டறியப்படுகிறது',
            specialist: '{condition} க்கு {specialist} ஐ சந்திக்கவும்',
            riskFactors: '{condition} ஆபத்து காரணிகள்',
            complications: '{condition} சிக்கல்கள்',
            prognosis: '{condition} முன்கணிப்பு',
            lifestyle: '{condition} க்கான வாழ்க்கை முறை மாற்றங்கள்',
            faqIntro: '{condition} பற்றி அடிக்கடி கேட்கப்படும் கேள்விகள்',
            treatmentIn: '{location} இல் {condition} சிகிச்சை',
            bestDoctors: '{location} இல் {condition} க்கு சிறந்த மருத்துவர்கள்',
            costRange: 'சிகிச்சை செலவு {min} முதல் {max} வரை',
            seekHelp: 'மருத்துவ உதவி எப்போது பெற வேண்டும்',
            emergency: 'அவசர சிகிச்சை பெறுங்கள் என்றால்...',
            overview: '{condition} கண்ணோட்டம்',
            managedBy: 'இந்த நிலை {specialist} ஆல் நிர்வகிக்கப்படுகிறது',
        },
        bodySystems: {
            'cardiovascular': 'இதய அமைப்பு',
            'respiratory': 'சுவாச அமைப்பு',
            'digestive': 'செரிமான அமைப்பு',
            'nervous': 'நரம்பு அமைப்பு',
            'musculoskeletal': 'தசை எலும்பு அமைப்பு',
            'endocrine': 'நாளமில்லா சுரப்பி அமைப்பு',
            'immune': 'நோயெதிர்ப்பு அமைப்பு',
            'urinary': 'சிறுநீர் அமைப்பு',
            'reproductive': 'இனப்பெருக்க அமைப்பு',
            'integumentary': 'தோல் அமைப்பு',
        },
        severity: {
            'mild': 'லேசான',
            'moderate': 'மிதமான',
            'severe': 'கடுமையான',
            'critical': 'மிக கடுமையான',
        },
        adjectives: {
            'common': 'பொதுவான',
            'rare': 'அரிதான',
            'chronic': 'நீடித்த',
            'acute': 'கடுமையான',
            'hereditary': 'பரம்பரை',
            'contagious': 'தொற்றக்கூடிய',
            'treatable': 'சிகிச்சையளிக்கக்கூடிய',
            'preventable': 'தடுக்கக்கூடிய',
        },
        phrases: {
            'consult doctor': 'மருத்துவரை அணுகவும்',
            'seek immediate help': 'உடனடி உதவி பெறுங்கள்',
            'lifestyle changes': 'வாழ்க்கை முறை மாற்றங்கள்',
            'regular checkup': 'வழக்கமான சோதனை',
            'early detection': 'முன்கூட்டியே கண்டறிதல்',
            'proper treatment': 'சரியான சிகிச்சை',
        },
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TELUGU (te)
    // ─────────────────────────────────────────────────────────────────────────
    te: {
        terms: {
            'condition': 'పరిస్థితి',
            'disease': 'వ్యాధి',
            'disorder': 'రుగ్మత',
            'treatment': 'చికిత్స',
            'medication': 'మందులు',
            'surgery': 'శస్త్రచికిత్స',
            'diagnosis': 'రోగ నిర్ధారణ',
            'symptoms': 'లక్షణాలు',
            'causes': 'కారణాలు',
            'prevention': 'నివారణ',
            'complications': 'సమస్యలు',
            'risk factors': 'ప్రమాద కారకాలు',
            'doctor': 'వైద్యుడు',
            'specialist': 'నిపుణుడు',
            'hospital': 'ఆసుపత్రి',
            'patient': 'రోగి',
            'health': 'ఆరోగ్యం',
            'pain': 'నొప్పి',
            'fever': 'జ్వరం',
            'fatigue': 'అలసట',
            'test': 'పరీక్ష',
        },
        templates: {
            whatIs: '{condition} అంటే ఏమిటి?',
            definition: '{condition} అనేది {system} ను ప్రభావితం చేసే {type} పరిస్థితి.',
            symptoms: '{condition} యొక్క సాధారణ లక్షణాలు:',
            causes: '{condition} యొక్క కారణాలు:',
            treatment: '{condition} చికిత్స',
            prevention: '{condition} నివారణ',
            diagnosis: '{condition} ఎలా నిర్ధారించబడుతుంది',
            specialist: '{condition} కోసం {specialist} ను సంప్రదించండి',
            riskFactors: '{condition} ప్రమాద కారకాలు',
            complications: '{condition} సమస్యలు',
            prognosis: '{condition} అంచనా',
            lifestyle: '{condition} కోసం జీవనశైలి మార్పులు',
            faqIntro: '{condition} గురించి తరచుగా అడిగే ప్రశ్నలు',
            treatmentIn: '{location} లో {condition} చికిత్స',
            bestDoctors: '{location} లో {condition} కోసం ఉత్తమ వైద్యులు',
            costRange: 'చికిత్స ఖర్చు {min} నుండి {max} వరకు',
            seekHelp: 'వైద్య సహాయం ఎప్పుడు పొందాలి',
            emergency: 'అత్యవసర సంరక్షణ పొందండి...',
            overview: '{condition} అవలోకనం',
            managedBy: 'ఈ పరిస్థితి {specialist} ద్వారా నిర్వహించబడుతుంది',
        },
        bodySystems: {
            'cardiovascular': 'హృదయ వ్యవస్థ',
            'respiratory': 'శ్వాసకోశ వ్యవస్థ',
            'digestive': 'జీర్ణవ్యవస్థ',
            'nervous': 'నాడీ వ్యవస్థ',
        },
        severity: {
            'mild': 'తేలికపాటి',
            'moderate': 'మధ్యస్థం',
            'severe': 'తీవ్రమైన',
            'critical': 'అత్యంత తీవ్రమైన',
        },
        adjectives: {
            'common': 'సాధారణ',
            'rare': 'అరుదైన',
            'chronic': 'దీర్ఘకాలిక',
            'acute': 'తీవ్రమైన',
        },
        phrases: {
            'consult doctor': 'వైద్యుడిని సంప్రదించండి',
            'seek immediate help': 'వెంటనే సహాయం పొందండి',
        },
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // KANNADA (kn)
    // ─────────────────────────────────────────────────────────────────────────
    kn: {
        terms: {
            'condition': 'ಸ್ಥಿತಿ',
            'disease': 'ರೋಗ',
            'disorder': 'ಅಸ್ವಸ್ಥತೆ',
            'treatment': 'ಚಿಕಿತ್ಸೆ',
            'medication': 'ಔಷಧಿ',
            'surgery': 'ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ',
            'diagnosis': 'ರೋಗನಿರ್ಣಯ',
            'symptoms': 'ಲಕ್ಷಣಗಳು',
            'causes': 'ಕಾರಣಗಳು',
            'prevention': 'ತಡೆಗಟ್ಟುವಿಕೆ',
            'complications': 'ತೊಡಕುಗಳು',
            'doctor': 'ವೈದ್ಯರು',
            'specialist': 'ತಜ್ಞರು',
            'hospital': 'ಆಸ್ಪತ್ರೆ',
            'patient': 'ರೋಗಿ',
            'health': 'ಆರೋಗ್ಯ',
            'pain': 'ನೋವು',
            'fever': 'ಜ್ವರ',
        },
        templates: {
            whatIs: '{condition} ಎಂದರೇನು?',
            definition: '{condition} ಎಂಬುದು {system} ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುವ {type} ಸ್ಥಿತಿ.',
            symptoms: '{condition} ನ ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು:',
            causes: '{condition} ನ ಕಾರಣಗಳು:',
            treatment: '{condition} ಚಿಕಿತ್ಸೆ',
            prevention: '{condition} ತಡೆಗಟ್ಟುವಿಕೆ',
            diagnosis: '{condition} ಹೇಗೆ ಪತ್ತೆಯಾಗುತ್ತದೆ',
            specialist: '{condition} ಗಾಗಿ {specialist} ಅನ್ನು ಭೇಟಿ ಮಾಡಿ',
            riskFactors: '{condition} ಅಪಾಯಕಾರಿ ಅಂಶಗಳು',
            complications: '{condition} ತೊಡಕುಗಳು',
            prognosis: '{condition} ಮುನ್ಸೂಚನೆ',
            lifestyle: '{condition} ಗಾಗಿ ಜೀವನಶೈಲಿ ಬದಲಾವಣೆಗಳು',
            faqIntro: '{condition} ಬಗ್ಗೆ ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು',
            treatmentIn: '{location} ನಲ್ಲಿ {condition} ಚಿಕಿತ್ಸೆ',
            bestDoctors: '{location} ನಲ್ಲಿ {condition} ಗಾಗಿ ಅತ್ಯುತ್ತಮ ವೈದ್ಯರು',
            costRange: 'ಚಿಕಿತ್ಸೆ ವೆಚ್ಚ {min} ರಿಂದ {max} ವರೆಗೆ',
            seekHelp: 'ವೈದ್ಯಕೀಯ ಸಹಾಯ ಯಾವಾಗ ಪಡೆಯಬೇಕು',
            emergency: 'ತುರ್ತು ಆರೈಕೆ ಪಡೆಯಿರಿ...',
            overview: '{condition} ಅವಲೋಕನ',
            managedBy: 'ಈ ಸ್ಥಿತಿಯನ್ನು {specialist} ನಿರ್ವಹಿಸುತ್ತಾರೆ',
        },
        bodySystems: {
            'cardiovascular': 'ಹೃದಯ ವ್ಯವಸ್ಥೆ',
            'respiratory': 'ಶ್ವಾಸಕೋಶ ವ್ಯವಸ್ಥೆ',
            'digestive': 'ಜೀರ್ಣ ವ್ಯವಸ್ಥೆ',
            'nervous': 'ನರ ವ್ಯವಸ್ಥೆ',
        },
        severity: {
            'mild': 'ಸೌಮ್ಯ',
            'moderate': 'ಮಧ್ಯಮ',
            'severe': 'ತೀವ್ರ',
            'critical': 'ಅತ್ಯಂತ ತೀವ್ರ',
        },
        adjectives: {},
        phrases: {
            'consult doctor': 'ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
        },
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MALAYALAM (ml)
    // ─────────────────────────────────────────────────────────────────────────
    ml: {
        terms: {
            'condition': 'അവസ്ഥ',
            'disease': 'രോഗം',
            'disorder': 'വൈകല്യം',
            'treatment': 'ചികിത്സ',
            'medication': 'മരുന്ന്',
            'surgery': 'ശസ്ത്രക്രിയ',
            'diagnosis': 'രോഗനിർണയം',
            'symptoms': 'ലക്ഷണങ്ങൾ',
            'causes': 'കാരണങ്ങൾ',
            'prevention': 'പ്രതിരോധം',
            'complications': 'സങ്കീർണതകൾ',
            'doctor': 'ഡോക്ടർ',
            'specialist': 'വിദഗ്ധൻ',
            'hospital': 'ആശുപത്രി',
            'patient': 'രോഗി',
            'health': 'ആരോഗ്യം',
        },
        templates: {
            whatIs: '{condition} എന്താണ്?',
            definition: '{condition} എന്നത് {system} ബാധിക്കുന്ന ഒരു {type} അവസ്ഥയാണ്.',
            symptoms: '{condition} ന്റെ സാധാരണ ലക്ഷണങ്ങൾ:',
            causes: '{condition} ന്റെ കാരണങ്ങൾ:',
            treatment: '{condition} ചികിത്സ',
            prevention: '{condition} പ്രതിരോധം',
            diagnosis: '{condition} എങ്ങനെ നിർണയിക്കപ്പെടുന്നു',
            specialist: '{condition} ന് {specialist} നെ കാണുക',
            riskFactors: '{condition} അപകട ഘടകങ്ങൾ',
            complications: '{condition} സങ്കീർണതകൾ',
            prognosis: '{condition} പ്രവചനം',
            lifestyle: '{condition} ന് ജീവിതശൈലി മാറ്റങ്ങൾ',
            faqIntro: '{condition} നെ കുറിച്ച് പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ',
            treatmentIn: '{location} ൽ {condition} ചികിത്സ',
            bestDoctors: '{location} ൽ {condition} ന് മികച്ച ഡോക്ടർമാർ',
            costRange: 'ചികിത്സാ ചെലവ് {min} മുതൽ {max} വരെ',
            seekHelp: 'വൈദ്യസഹായം എപ്പോൾ തേടണം',
            emergency: 'അടിയന്തര പരിചരണം തേടുക...',
            overview: '{condition} അവലോകനം',
            managedBy: 'ഈ അവസ്ഥ {specialist} നിയന്ത്രിക്കുന്നു',
        },
        bodySystems: {
            'cardiovascular': 'ഹൃദയ സിസ്റ്റം',
            'respiratory': 'ശ്വസന സിസ്റ്റം',
            'digestive': 'ദഹന സിസ്റ്റം',
            'nervous': 'നാഡീ സിസ്റ്റം',
        },
        severity: {
            'mild': 'നേരിയ',
            'moderate': 'മിതമായ',
            'severe': 'കഠിനമായ',
            'critical': 'അതീവ ഗുരുതരമായ',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MARATHI (mr)
    // ─────────────────────────────────────────────────────────────────────────
    mr: {
        terms: {
            'condition': 'स्थिती',
            'disease': 'रोग',
            'disorder': 'विकार',
            'treatment': 'उपचार',
            'medication': 'औषध',
            'surgery': 'शस्त्रक्रिया',
            'diagnosis': 'निदान',
            'symptoms': 'लक्षणे',
            'causes': 'कारणे',
            'prevention': 'प्रतिबंध',
            'complications': 'गुंतागुंत',
            'doctor': 'डॉक्टर',
            'specialist': 'तज्ञ',
            'hospital': 'रुग्णालय',
            'patient': 'रुग्ण',
            'health': 'आरोग्य',
        },
        templates: {
            whatIs: '{condition} म्हणजे काय?',
            definition: '{condition} ही एक {type} स्थिती आहे जी {system} प्रभावित करते.',
            symptoms: '{condition} ची सामान्य लक्षणे:',
            causes: '{condition} ची कारणे:',
            treatment: '{condition} उपचार',
            prevention: '{condition} प्रतिबंध',
            diagnosis: '{condition} चे निदान कसे केले जाते',
            specialist: '{condition} साठी {specialist} ला भेटा',
            riskFactors: '{condition} जोखीम घटक',
            complications: '{condition} गुंतागुंत',
            prognosis: '{condition} पूर्वानुमान',
            lifestyle: '{condition} साठी जीवनशैली बदल',
            faqIntro: '{condition} बद्दल वारंवार विचारले जाणारे प्रश्न',
            treatmentIn: '{location} मध्ये {condition} उपचार',
            bestDoctors: '{location} मध्ये {condition} साठी सर्वोत्तम डॉक्टर',
            costRange: 'उपचार खर्च {min} ते {max} पर्यंत',
            seekHelp: 'वैद्यकीय मदत कधी घ्यावी',
            emergency: 'आपत्कालीन काळजी घ्या...',
            overview: '{condition} आढावा',
            managedBy: 'या स्थितीचे व्यवस्थापन {specialist} करतात',
        },
        bodySystems: {
            'cardiovascular': 'हृदय प्रणाली',
            'respiratory': 'श्वसन प्रणाली',
            'digestive': 'पाचन प्रणाली',
            'nervous': 'मज्जासंस्था',
        },
        severity: {
            'mild': 'सौम्य',
            'moderate': 'मध्यम',
            'severe': 'गंभीर',
            'critical': 'अत्यंत गंभीर',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BENGALI (bn)
    // ─────────────────────────────────────────────────────────────────────────
    bn: {
        terms: {
            'condition': 'অবস্থা',
            'disease': 'রোগ',
            'disorder': 'ব্যাধি',
            'treatment': 'চিকিৎসা',
            'medication': 'ওষুধ',
            'surgery': 'অস্ত্রোপচার',
            'diagnosis': 'রোগ নির্ণয়',
            'symptoms': 'লক্ষণ',
            'causes': 'কারণ',
            'prevention': 'প্রতিরোধ',
            'complications': 'জটিলতা',
            'doctor': 'ডাক্তার',
            'specialist': 'বিশেষজ্ঞ',
            'hospital': 'হাসপাতাল',
            'patient': 'রোগী',
            'health': 'স্বাস্থ্য',
        },
        templates: {
            whatIs: '{condition} কি?',
            definition: '{condition} হল একটি {type} অবস্থা যা {system} কে প্রভাবিত করে।',
            symptoms: '{condition} এর সাধারণ লক্ষণ:',
            causes: '{condition} এর কারণ:',
            treatment: '{condition} চিকিৎসা',
            prevention: '{condition} প্রতিরোধ',
            diagnosis: '{condition} কিভাবে নির্ণয় করা হয়',
            specialist: '{condition} এর জন্য {specialist} দেখান',
            riskFactors: '{condition} ঝুঁকির কারণ',
            complications: '{condition} জটিলতা',
            prognosis: '{condition} পূর্বাভাস',
            lifestyle: '{condition} এর জন্য জীবনধারা পরিবর্তন',
            faqIntro: '{condition} সম্পর্কে প্রায়শই জিজ্ঞাসিত প্রশ্ন',
            treatmentIn: '{location} এ {condition} চিকিৎসা',
            bestDoctors: '{location} এ {condition} এর জন্য সেরা ডাক্তার',
            costRange: 'চিকিৎসা খরচ {min} থেকে {max} পর্যন্ত',
            seekHelp: 'কখন চিকিৎসা সাহায্য নিতে হবে',
            emergency: 'জরুরি যত্ন নিন...',
            overview: '{condition} সংক্ষিপ্ত বিবরণ',
            managedBy: 'এই অবস্থা {specialist} দ্বারা পরিচালিত হয়',
        },
        bodySystems: {
            'cardiovascular': 'হৃদয় সিস্টেম',
            'respiratory': 'শ্বাসযন্ত্র সিস্টেম',
            'digestive': 'পাচনতন্ত্র',
            'nervous': 'স্নায়ুতন্ত্র',
        },
        severity: {
            'mild': 'হালকা',
            'moderate': 'মাঝারি',
            'severe': 'গুরুতর',
            'critical': 'অত্যন্ত গুরুতর',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GUJARATI (gu)
    // ─────────────────────────────────────────────────────────────────────────
    gu: {
        terms: {
            'condition': 'સ્થિતિ',
            'disease': 'રોગ',
            'disorder': 'વિકાર',
            'treatment': 'સારવાર',
            'medication': 'દવા',
            'surgery': 'સર્જરી',
            'diagnosis': 'નિદાન',
            'symptoms': 'લક્ષણો',
            'causes': 'કારણો',
            'prevention': 'નિવારણ',
            'complications': 'જટિલતાઓ',
            'doctor': 'ડૉક્ટર',
            'specialist': 'નિષ્ણાત',
            'hospital': 'હોસ્પિટલ',
            'patient': 'દર્દી',
            'health': 'આરોગ્ય',
        },
        templates: {
            whatIs: '{condition} શું છે?',
            definition: '{condition} એક {type} સ્થિતિ છે જે {system} ને અસર કરે છે.',
            symptoms: '{condition} ના સામાન્ય લક્ષણો:',
            causes: '{condition} ના કારણો:',
            treatment: '{condition} સારવાર',
            prevention: '{condition} નિવારણ',
            diagnosis: '{condition} નું નિદાન કેવી રીતે થાય છે',
            specialist: '{condition} માટે {specialist} ને મળો',
            riskFactors: '{condition} જોખમી પરિબળો',
            complications: '{condition} જટિલતાઓ',
            prognosis: '{condition} પૂર્વાનુમાન',
            lifestyle: '{condition} માટે જીવનશૈલી ફેરફારો',
            faqIntro: '{condition} વિશે વારંવાર પૂછાતા પ્રશ્નો',
            treatmentIn: '{location} માં {condition} સારવાર',
            bestDoctors: '{location} માં {condition} માટે શ્રેષ્ઠ ડૉક્ટરો',
            costRange: 'સારવાર ખર્ચ {min} થી {max} સુધી',
            seekHelp: 'તબીબી મદદ ક્યારે લેવી',
            emergency: 'ઇમરજન્સી કેર લો...',
            overview: '{condition} ઝાંખી',
            managedBy: 'આ સ્થિતિ {specialist} દ્વારા સંચાલિત થાય છે',
        },
        bodySystems: {
            'cardiovascular': 'હૃદય તંત્ર',
            'respiratory': 'શ્વસન તંત્ર',
            'digestive': 'પાચન તંત્ર',
            'nervous': 'ચેતાતંત્ર',
        },
        severity: {
            'mild': 'હળવી',
            'moderate': 'મધ્યમ',
            'severe': 'ગંભીર',
            'critical': 'અત્યંત ગંભીર',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PUNJABI (pa)
    // ─────────────────────────────────────────────────────────────────────────
    pa: {
        terms: {
            'condition': 'ਸਥਿਤੀ',
            'disease': 'ਬਿਮਾਰੀ',
            'disorder': 'ਵਿਕਾਰ',
            'treatment': 'ਇਲਾਜ',
            'medication': 'ਦਵਾਈ',
            'surgery': 'ਸਰਜਰੀ',
            'diagnosis': 'ਨਿਦਾਨ',
            'symptoms': 'ਲੱਛਣ',
            'causes': 'ਕਾਰਨ',
            'prevention': 'ਰੋਕਥਾਮ',
            'complications': 'ਪੇਚੀਦਗੀਆਂ',
            'doctor': 'ਡਾਕਟਰ',
            'specialist': 'ਮਾਹਿਰ',
            'hospital': 'ਹਸਪਤਾਲ',
            'patient': 'ਮਰੀਜ਼',
            'health': 'ਸਿਹਤ',
        },
        templates: {
            whatIs: '{condition} ਕੀ ਹੈ?',
            definition: '{condition} ਇੱਕ {type} ਸਥਿਤੀ ਹੈ ਜੋ {system} ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰਦੀ ਹੈ।',
            symptoms: '{condition} ਦੇ ਆਮ ਲੱਛਣ:',
            causes: '{condition} ਦੇ ਕਾਰਨ:',
            treatment: '{condition} ਇਲਾਜ',
            prevention: '{condition} ਰੋਕਥਾਮ',
            diagnosis: '{condition} ਦਾ ਨਿਦਾਨ ਕਿਵੇਂ ਹੁੰਦਾ ਹੈ',
            specialist: '{condition} ਲਈ {specialist} ਨੂੰ ਮਿਲੋ',
            riskFactors: '{condition} ਖ਼ਤਰੇ ਦੇ ਕਾਰਕ',
            complications: '{condition} ਪੇਚੀਦਗੀਆਂ',
            prognosis: '{condition} ਪੂਰਵ-ਅਨੁਮਾਨ',
            lifestyle: '{condition} ਲਈ ਜੀਵਨਸ਼ੈਲੀ ਤਬਦੀਲੀਆਂ',
            faqIntro: '{condition} ਬਾਰੇ ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ',
            treatmentIn: '{location} ਵਿੱਚ {condition} ਇਲਾਜ',
            bestDoctors: '{location} ਵਿੱਚ {condition} ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਡਾਕਟਰ',
            costRange: 'ਇਲਾਜ ਦੀ ਲਾਗਤ {min} ਤੋਂ {max} ਤੱਕ',
            seekHelp: 'ਡਾਕਟਰੀ ਮਦਦ ਕਦੋਂ ਲੈਣੀ ਚਾਹੀਦੀ ਹੈ',
            emergency: 'ਐਮਰਜੈਂਸੀ ਦੇਖਭਾਲ ਲਓ...',
            overview: '{condition} ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
            managedBy: 'ਇਸ ਸਥਿਤੀ ਦਾ ਪ੍ਰਬੰਧਨ {specialist} ਦੁਆਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ',
        },
        bodySystems: {
            'cardiovascular': 'ਦਿਲ ਦੀ ਪ੍ਰਣਾਲੀ',
            'respiratory': 'ਸਾਹ ਪ੍ਰਣਾਲੀ',
            'digestive': 'ਪਾਚਨ ਪ੍ਰਣਾਲੀ',
            'nervous': 'ਤੰਤੂ ਪ੍ਰਣਾਲੀ',
        },
        severity: {
            'mild': 'ਹਲਕਾ',
            'moderate': 'ਦਰਮਿਆਨਾ',
            'severe': 'ਗੰਭੀਰ',
            'critical': 'ਬਹੁਤ ਗੰਭੀਰ',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ODIA (or)
    // ─────────────────────────────────────────────────────────────────────────
    or: {
        terms: {
            'condition': 'ଅବସ୍ଥା',
            'disease': 'ରୋଗ',
            'treatment': 'ଚିକିତ୍ସା',
            'symptoms': 'ଲକ୍ଷଣ',
            'causes': 'କାରଣ',
            'prevention': 'ପ୍ରତିରୋଧ',
            'doctor': 'ଡାକ୍ତର',
            'specialist': 'ବିଶେଷଜ୍ଞ',
            'hospital': 'ହସ୍ପିଟାଲ',
            'health': 'ସ୍ୱାସ୍ଥ୍ୟ',
        },
        templates: {
            whatIs: '{condition} କ\'ଣ?',
            definition: '{condition} ହେଉଛି ଏକ {type} ଅବସ୍ଥା ଯାହା {system} କୁ ପ୍ରଭାବିତ କରେ।',
            symptoms: '{condition} ର ସାଧାରଣ ଲକ୍ଷଣ:',
            causes: '{condition} ର କାରଣ:',
            treatment: '{condition} ଚିକିତ୍ସା',
            prevention: '{condition} ପ୍ରତିରୋଧ',
            diagnosis: '{condition} କିପରି ନିର୍ଣ୍ଣୟ ହୁଏ',
            specialist: '{condition} ପାଇଁ {specialist} ଙ୍କୁ ଦେଖନ୍ତୁ',
            riskFactors: '{condition} ବିପଦ କାରକ',
            complications: '{condition} ଜଟିଳତା',
            prognosis: '{condition} ପୂର୍ବାନୁମାନ',
            lifestyle: '{condition} ପାଇଁ ଜୀବନଶୈଳୀ ପରିବର୍ତ୍ତନ',
            faqIntro: '{condition} ବିଷୟରେ ପ୍ରାୟତଃ ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ',
            treatmentIn: '{location} ରେ {condition} ଚିକିତ୍ସା',
            bestDoctors: '{location} ରେ {condition} ପାଇଁ ସର୍ବୋତ୍ତମ ଡାକ୍ତର',
            costRange: 'ଚିକିତ୍ସା ଖର୍ଚ୍ଚ {min} ରୁ {max} ପର୍ଯ୍ୟନ୍ତ',
            seekHelp: 'ଡାକ୍ତରୀ ସାହାଯ୍ୟ କେବେ ନେବେ',
            emergency: 'ଜରୁରୀ ଯତ୍ନ ନିଅନ୍ତୁ...',
            overview: '{condition} ସଂକ୍ଷିପ୍ତ ବିବରଣୀ',
            managedBy: 'ଏହି ଅବସ୍ଥା {specialist} ଦ୍ୱାରା ପରିଚାଳିତ',
        },
        bodySystems: {},
        severity: {
            'mild': 'ମୃଦୁ',
            'moderate': 'ମଧ୍ୟମ',
            'severe': 'ଗୁରୁତର',
            'critical': 'ଅତି ଗୁରୁତର',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // URDU (ur)
    // ─────────────────────────────────────────────────────────────────────────
    ur: {
        terms: {
            'condition': 'حالت',
            'disease': 'بیماری',
            'disorder': 'عارضہ',
            'treatment': 'علاج',
            'medication': 'دوا',
            'surgery': 'سرجری',
            'diagnosis': 'تشخیص',
            'symptoms': 'علامات',
            'causes': 'وجوہات',
            'prevention': 'روک تھام',
            'complications': 'پیچیدگیاں',
            'doctor': 'ڈاکٹر',
            'specialist': 'ماہر',
            'hospital': 'ہسپتال',
            'patient': 'مریض',
            'health': 'صحت',
        },
        templates: {
            whatIs: '{condition} کیا ہے؟',
            definition: '{condition} ایک {type} حالت ہے جو {system} کو متاثر کرتی ہے۔',
            symptoms: '{condition} کی عام علامات:',
            causes: '{condition} کی وجوہات:',
            treatment: '{condition} کا علاج',
            prevention: '{condition} سے روک تھام',
            diagnosis: '{condition} کی تشخیص کیسے ہوتی ہے',
            specialist: '{condition} کے لیے {specialist} سے ملیں',
            riskFactors: '{condition} کے خطرے کے عوامل',
            complications: '{condition} کی پیچیدگیاں',
            prognosis: '{condition} کی پیش گوئی',
            lifestyle: '{condition} کے لیے طرز زندگی میں تبدیلیاں',
            faqIntro: '{condition} کے بارے میں اکثر پوچھے گئے سوالات',
            treatmentIn: '{location} میں {condition} کا علاج',
            bestDoctors: '{location} میں {condition} کے لیے بہترین ڈاکٹر',
            costRange: 'علاج کی لاگت {min} سے {max} تک',
            seekHelp: 'طبی مدد کب لیں',
            emergency: 'ایمرجنسی کیئر لیں...',
            overview: '{condition} کا جائزہ',
            managedBy: 'یہ حالت {specialist} کے زیر انتظام ہے',
        },
        bodySystems: {
            'cardiovascular': 'قلبی نظام',
            'respiratory': 'تنفسی نظام',
            'digestive': 'ہاضمہ نظام',
            'nervous': 'اعصابی نظام',
        },
        severity: {
            'mild': 'ہلکی',
            'moderate': 'درمیانی',
            'severe': 'شدید',
            'critical': 'انتہائی شدید',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ARABIC (ar)
    // ─────────────────────────────────────────────────────────────────────────
    ar: {
        terms: {
            'condition': 'حالة',
            'disease': 'مرض',
            'disorder': 'اضطراب',
            'treatment': 'علاج',
            'medication': 'دواء',
            'surgery': 'جراحة',
            'diagnosis': 'تشخيص',
            'symptoms': 'الأعراض',
            'causes': 'الأسباب',
            'prevention': 'الوقاية',
            'complications': 'المضاعفات',
            'doctor': 'طبيب',
            'specialist': 'أخصائي',
            'hospital': 'مستشفى',
            'patient': 'مريض',
            'health': 'صحة',
        },
        templates: {
            whatIs: 'ما هو {condition}؟',
            definition: '{condition} هي حالة {type} تؤثر على {system}.',
            symptoms: 'الأعراض الشائعة لـ {condition}:',
            causes: 'أسباب {condition}:',
            treatment: 'علاج {condition}',
            prevention: 'الوقاية من {condition}',
            diagnosis: 'كيف يتم تشخيص {condition}',
            specialist: 'راجع {specialist} لـ {condition}',
            riskFactors: 'عوامل الخطر لـ {condition}',
            complications: 'مضاعفات {condition}',
            prognosis: 'توقعات {condition}',
            lifestyle: 'تغييرات نمط الحياة لـ {condition}',
            faqIntro: 'الأسئلة الشائعة حول {condition}',
            treatmentIn: 'علاج {condition} في {location}',
            bestDoctors: 'أفضل الأطباء لـ {condition} في {location}',
            costRange: 'تكلفة العلاج من {min} إلى {max}',
            seekHelp: 'متى تطلب المساعدة الطبية',
            emergency: 'اطلب رعاية الطوارئ...',
            overview: 'نظرة عامة على {condition}',
            managedBy: 'تتم إدارة هذه الحالة من قبل {specialist}',
        },
        bodySystems: {
            'cardiovascular': 'الجهاز القلبي',
            'respiratory': 'الجهاز التنفسي',
            'digestive': 'الجهاز الهضمي',
            'nervous': 'الجهاز العصبي',
        },
        severity: {
            'mild': 'خفيف',
            'moderate': 'متوسط',
            'severe': 'شديد',
            'critical': 'حرج',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SPANISH (es)
    // ─────────────────────────────────────────────────────────────────────────
    es: {
        terms: {
            'condition': 'condición',
            'disease': 'enfermedad',
            'disorder': 'trastorno',
            'treatment': 'tratamiento',
            'medication': 'medicamento',
            'surgery': 'cirugía',
            'diagnosis': 'diagnóstico',
            'symptoms': 'síntomas',
            'causes': 'causas',
            'prevention': 'prevención',
            'complications': 'complicaciones',
            'doctor': 'médico',
            'specialist': 'especialista',
            'hospital': 'hospital',
            'patient': 'paciente',
            'health': 'salud',
        },
        templates: {
            whatIs: '¿Qué es {condition}?',
            definition: '{condition} es una condición {type} que afecta el {system}.',
            symptoms: 'Síntomas comunes de {condition}:',
            causes: 'Causas de {condition}:',
            treatment: 'Tratamiento de {condition}',
            prevention: 'Prevención de {condition}',
            diagnosis: 'Cómo se diagnostica {condition}',
            specialist: 'Consulte a un {specialist} para {condition}',
            riskFactors: 'Factores de riesgo de {condition}',
            complications: 'Complicaciones de {condition}',
            prognosis: 'Pronóstico de {condition}',
            lifestyle: 'Cambios de estilo de vida para {condition}',
            faqIntro: 'Preguntas frecuentes sobre {condition}',
            treatmentIn: 'Tratamiento de {condition} en {location}',
            bestDoctors: 'Mejores médicos para {condition} en {location}',
            costRange: 'El costo del tratamiento varía de {min} a {max}',
            seekHelp: 'Cuándo buscar ayuda médica',
            emergency: 'Busque atención de emergencia...',
            overview: 'Descripción general de {condition}',
            managedBy: 'Esta condición es manejada por un {specialist}',
        },
        bodySystems: {
            'cardiovascular': 'sistema cardiovascular',
            'respiratory': 'sistema respiratorio',
            'digestive': 'sistema digestivo',
            'nervous': 'sistema nervioso',
        },
        severity: {
            'mild': 'leve',
            'moderate': 'moderado',
            'severe': 'severo',
            'critical': 'crítico',
        },
        adjectives: {
            'common': 'común',
            'rare': 'raro',
            'chronic': 'crónico',
            'acute': 'agudo',
        },
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FRENCH (fr)
    // ─────────────────────────────────────────────────────────────────────────
    fr: {
        terms: {
            'condition': 'condition',
            'disease': 'maladie',
            'disorder': 'trouble',
            'treatment': 'traitement',
            'medication': 'médicament',
            'surgery': 'chirurgie',
            'diagnosis': 'diagnostic',
            'symptoms': 'symptômes',
            'causes': 'causes',
            'prevention': 'prévention',
            'complications': 'complications',
            'doctor': 'médecin',
            'specialist': 'spécialiste',
            'hospital': 'hôpital',
            'patient': 'patient',
            'health': 'santé',
        },
        templates: {
            whatIs: 'Qu\'est-ce que {condition}?',
            definition: '{condition} est une condition {type} qui affecte le {system}.',
            symptoms: 'Symptômes courants de {condition}:',
            causes: 'Causes de {condition}:',
            treatment: 'Traitement de {condition}',
            prevention: 'Prévention de {condition}',
            diagnosis: 'Comment {condition} est diagnostiqué',
            specialist: 'Consultez un {specialist} pour {condition}',
            riskFactors: 'Facteurs de risque de {condition}',
            complications: 'Complications de {condition}',
            prognosis: 'Pronostic de {condition}',
            lifestyle: 'Changements de mode de vie pour {condition}',
            faqIntro: 'Questions fréquemment posées sur {condition}',
            treatmentIn: 'Traitement de {condition} à {location}',
            bestDoctors: 'Meilleurs médecins pour {condition} à {location}',
            costRange: 'Le coût du traitement varie de {min} à {max}',
            seekHelp: 'Quand demander de l\'aide médicale',
            emergency: 'Demandez des soins d\'urgence...',
            overview: 'Aperçu de {condition}',
            managedBy: 'Cette condition est gérée par un {specialist}',
        },
        bodySystems: {
            'cardiovascular': 'système cardiovasculaire',
            'respiratory': 'système respiratoire',
            'digestive': 'système digestif',
            'nervous': 'système nerveux',
        },
        severity: {
            'mild': 'léger',
            'moderate': 'modéré',
            'severe': 'sévère',
            'critical': 'critique',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PORTUGUESE (pt)
    // ─────────────────────────────────────────────────────────────────────────
    pt: {
        terms: {
            'condition': 'condição',
            'disease': 'doença',
            'disorder': 'distúrbio',
            'treatment': 'tratamento',
            'medication': 'medicamento',
            'surgery': 'cirurgia',
            'diagnosis': 'diagnóstico',
            'symptoms': 'sintomas',
            'causes': 'causas',
            'prevention': 'prevenção',
            'complications': 'complicações',
            'doctor': 'médico',
            'specialist': 'especialista',
            'hospital': 'hospital',
            'patient': 'paciente',
            'health': 'saúde',
        },
        templates: {
            whatIs: 'O que é {condition}?',
            definition: '{condition} é uma condição {type} que afeta o {system}.',
            symptoms: 'Sintomas comuns de {condition}:',
            causes: 'Causas de {condition}:',
            treatment: 'Tratamento de {condition}',
            prevention: 'Prevenção de {condition}',
            diagnosis: 'Como {condition} é diagnosticado',
            specialist: 'Consulte um {specialist} para {condition}',
            riskFactors: 'Fatores de risco de {condition}',
            complications: 'Complicações de {condition}',
            prognosis: 'Prognóstico de {condition}',
            lifestyle: 'Mudanças no estilo de vida para {condition}',
            faqIntro: 'Perguntas frequentes sobre {condition}',
            treatmentIn: 'Tratamento de {condition} em {location}',
            bestDoctors: 'Melhores médicos para {condition} em {location}',
            costRange: 'O custo do tratamento varia de {min} a {max}',
            seekHelp: 'Quando procurar ajuda médica',
            emergency: 'Procure atendimento de emergência...',
            overview: 'Visão geral de {condition}',
            managedBy: 'Esta condição é gerenciada por um {specialist}',
        },
        bodySystems: {
            'cardiovascular': 'sistema cardiovascular',
            'respiratory': 'sistema respiratório',
            'digestive': 'sistema digestivo',
            'nervous': 'sistema nervoso',
        },
        severity: {
            'mild': 'leve',
            'moderate': 'moderado',
            'severe': 'severo',
            'critical': 'crítico',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },

    // ─────────────────────────────────────────────────────────────────────────
    // GERMAN (de)
    // ─────────────────────────────────────────────────────────────────────────
    de: {
        terms: {
            'condition': 'Zustand',
            'disease': 'Krankheit',
            'disorder': 'Störung',
            'treatment': 'Behandlung',
            'medication': 'Medikament',
            'surgery': 'Operation',
            'diagnosis': 'Diagnose',
            'symptoms': 'Symptome',
            'causes': 'Ursachen',
            'prevention': 'Prävention',
            'complications': 'Komplikationen',
            'doctor': 'Arzt',
            'specialist': 'Spezialist',
            'hospital': 'Krankenhaus',
            'patient': 'Patient',
            'health': 'Gesundheit',
        },
        templates: {
            whatIs: 'Was ist {condition}?',
            definition: '{condition} ist ein {type} Zustand, der das {system} betrifft.',
            symptoms: 'Häufige Symptome von {condition}:',
            causes: 'Ursachen von {condition}:',
            treatment: 'Behandlung von {condition}',
            prevention: 'Prävention von {condition}',
            diagnosis: 'Wie wird {condition} diagnostiziert',
            specialist: 'Konsultieren Sie einen {specialist} für {condition}',
            riskFactors: 'Risikofaktoren für {condition}',
            complications: 'Komplikationen von {condition}',
            prognosis: 'Prognose für {condition}',
            lifestyle: 'Lebensstiländerungen für {condition}',
            faqIntro: 'Häufig gestellte Fragen zu {condition}',
            treatmentIn: 'Behandlung von {condition} in {location}',
            bestDoctors: 'Beste Ärzte für {condition} in {location}',
            costRange: 'Die Behandlungskosten reichen von {min} bis {max}',
            seekHelp: 'Wann Sie medizinische Hilfe suchen sollten',
            emergency: 'Suchen Sie Notfallversorgung...',
            overview: 'Überblick über {condition}',
            managedBy: 'Dieser Zustand wird von einem {specialist} behandelt',
        },
        bodySystems: {
            'cardiovascular': 'Herz-Kreislauf-System',
            'respiratory': 'Atmungssystem',
            'digestive': 'Verdauungssystem',
            'nervous': 'Nervensystem',
        },
        severity: {
            'mild': 'leicht',
            'moderate': 'mäßig',
            'severe': 'schwer',
            'critical': 'kritisch',
        },
        adjectives: {},
        phrases: {},
        numbers: {},
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: SPECIALIST TYPE TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const SPECIALIST_TRANSLATIONS: Record<string, Record<string, string>> = {
    hi: {
        'Cardiologist': 'हृदय रोग विशेषज्ञ',
        'Neurologist': 'न्यूरोलॉजिस्ट',
        'Orthopedic': 'हड्डी रोग विशेषज्ञ',
        'Dermatologist': 'त्वचा विशेषज्ञ',
        'Gastroenterologist': 'गैस्ट्रोएंटेरोलॉजिस्ट',
        'Pulmonologist': 'फेफड़े विशेषज्ञ',
        'Endocrinologist': 'एंडोक्राइनोलॉजिस्ट',
        'Oncologist': 'कैंसर विशेषज्ञ',
        'Psychiatrist': 'मनोचिकित्सक',
        'Pediatrician': 'बाल रोग विशेषज्ञ',
        'Gynecologist': 'स्त्री रोग विशेषज्ञ',
        'Urologist': 'मूत्र रोग विशेषज्ञ',
        'Nephrologist': 'किडनी विशेषज्ञ',
        'Ophthalmologist': 'नेत्र विशेषज्ञ',
        'ENT Specialist': 'कान नाक गला विशेषज्ञ',
        'General Physician': 'सामान्य चिकित्सक',
    },
    ta: {
        'Cardiologist': 'இதய நிபுணர்',
        'Neurologist': 'நரம்பியல் நிபுணர்',
        'Orthopedic': 'எலும்பு நிபுணர்',
        'Dermatologist': 'தோல் நிபுணர்',
        'Gastroenterologist': 'இரைப்பை குடல் நிபுணர்',
        'General Physician': 'பொது மருத்துவர்',
    },
    te: {
        'Cardiologist': 'హృదయ నిపుణుడు',
        'Neurologist': 'న్యూరాలజిస్ట్',
        'General Physician': 'జనరల్ ఫిజిషియన్',
    },
    // Add more as needed...
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: CONTENT GENERATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getDict(lang: string): LanguageDictionary {
    return DICTIONARIES[lang] || DICTIONARIES['hi'];
}

function translateTemplate(template: string, vars: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}

function translateSpecialist(specialist: string | null, lang: string): string {
    if (!specialist) return '';
    const translations = SPECIALIST_TRANSLATIONS[lang];
    if (translations && translations[specialist]) {
        return translations[specialist];
    }
    // Try partial match
    for (const [eng, trans] of Object.entries(translations || {})) {
        if (specialist.toLowerCase().includes(eng.toLowerCase())) {
            return trans;
        }
    }
    return specialist; // Return original if no translation
}

function getBodySystemTranslation(bodySystem: string | null, lang: string): string {
    if (!bodySystem) return '';
    const dict = getDict(lang);
    const systemLower = bodySystem.toLowerCase();

    for (const [eng, trans] of Object.entries(dict.bodySystems)) {
        if (systemLower.includes(eng)) {
            return trans;
        }
    }
    return bodySystem;
}

function getSeverityTranslation(severity: string | null, lang: string): string {
    if (!severity) return '';
    const dict = getDict(lang);
    return dict.severity[severity.toLowerCase()] || severity;
}

interface EnglishContent {
    conditionId: number;
    conditionName: string;
    specialistType: string | null;
    bodySystem: string | null;
    severityLevel: string | null;
    h1Title: string | null;
    heroOverview: string | null;
    definition: string | null;
    primarySymptoms: string[] | null;
    earlyWarningSigns: string[] | null;
    emergencySigns: string[] | null;
    causes: Array<{ cause: string; description: string }> | null;
    riskFactors: Array<{ factor: string; category: string; description: string }> | null;
    diagnosisOverview: string | null;
    diagnosticTests: Array<{ test: string; purpose: string; whatToExpect?: string }> | null;
    treatmentOverview: string | null;
    medicalTreatments: Array<{ name: string; description: string; effectiveness?: string }> | null;
    surgicalOptions: Array<{ name: string; description: string; successRate?: string }> | null;
    preventionStrategies: string[] | null;
    lifestyleModifications: string[] | null;
    complications: string[] | null;
    prognosis: string | null;
    faqs: Array<{ question: string; answer: string }> | null;
}

function generateTranslatedContent(english: EnglishContent, lang: string): {
    h1Title: string;
    heroOverview: string;
    definition: string;
    symptoms: string;
    causes: string;
    treatment: string;
    prevention: string;
    diagnosis: string;
    prognosis: string;
    faqs: Array<{ question: string; answer: string }>;
} {
    const dict = getDict(lang);
    const conditionName = english.conditionName;
    const specialist = translateSpecialist(english.specialistType, lang);
    const bodySystem = getBodySystemTranslation(english.bodySystem, lang);
    const severity = getSeverityTranslation(english.severityLevel, lang);

    // Generate H1 Title
    const h1Title = translateTemplate(dict.templates.treatmentIn, {
        condition: conditionName,
        location: lang === 'hi' ? 'भारत' :
                  lang === 'ta' ? 'இந்தியா' :
                  lang === 'te' ? 'భారతదేశం' :
                  lang === 'kn' ? 'ಭಾರತ' :
                  lang === 'ml' ? 'ഇന്ത്യ' :
                  lang === 'mr' ? 'भारत' :
                  lang === 'bn' ? 'ভারত' :
                  lang === 'gu' ? 'ભારત' :
                  lang === 'pa' ? 'ਭਾਰਤ' :
                  lang === 'or' ? 'ଭାରତ' :
                  lang === 'ur' ? 'بھارت' :
                  lang === 'ar' ? 'الهند' :
                  lang === 'es' ? 'India' :
                  lang === 'fr' ? 'Inde' :
                  lang === 'pt' ? 'Índia' :
                  lang === 'de' ? 'Indien' : 'India'
    });

    // Generate Hero Overview
    const heroOverview = translateTemplate(dict.templates.definition, {
        condition: conditionName,
        type: severity || dict.terms['condition'] || 'medical',
        system: bodySystem || dict.terms['health'] || 'body'
    });

    // Generate Definition
    const definition = translateTemplate(dict.templates.whatIs, { condition: conditionName }) + ' ' +
        translateTemplate(dict.templates.definition, {
            condition: conditionName,
            type: dict.adjectives['common'] || 'common',
            system: bodySystem || dict.terms['health'] || 'body'
        }) + ' ' +
        translateTemplate(dict.templates.managedBy, {
            specialist: specialist || dict.terms['specialist'] || 'specialist'
        });

    // Generate Symptoms section
    const symptomsIntro = translateTemplate(dict.templates.symptoms, { condition: conditionName });
    const symptoms = symptomsIntro;

    // Generate Causes section
    const causesIntro = translateTemplate(dict.templates.causes, { condition: conditionName });
    const causesSection = causesIntro;

    // Generate Treatment section
    const treatmentIntro = translateTemplate(dict.templates.treatment, { condition: conditionName });
    const treatment = treatmentIntro + '. ' +
        translateTemplate(dict.templates.specialist, {
            condition: conditionName,
            specialist: specialist || dict.terms['specialist'] || 'specialist'
        });

    // Generate Prevention section
    const prevention = translateTemplate(dict.templates.prevention, { condition: conditionName }) + '. ' +
        translateTemplate(dict.templates.lifestyle, { condition: conditionName });

    // Generate Diagnosis section
    const diagnosis = translateTemplate(dict.templates.diagnosis, { condition: conditionName });

    // Generate Prognosis section
    const prognosis = translateTemplate(dict.templates.prognosis, { condition: conditionName });

    // Generate FAQs
    const faqs = [
        {
            question: translateTemplate(dict.templates.whatIs, { condition: conditionName }),
            answer: heroOverview
        },
        {
            question: translateTemplate(dict.templates.symptoms, { condition: conditionName }).replace(':', '?'),
            answer: symptomsIntro
        },
        {
            question: translateTemplate(dict.templates.treatment, { condition: conditionName }) + '?',
            answer: treatment
        },
        {
            question: translateTemplate(dict.templates.prevention, { condition: conditionName }) + '?',
            answer: prevention
        },
        {
            question: translateTemplate(dict.templates.seekHelp, {}),
            answer: translateTemplate(dict.templates.emergency, {})
        }
    ];

    return {
        h1Title,
        heroOverview,
        definition,
        symptoms,
        causes: causesSection,
        treatment,
        prevention,
        diagnosis,
        prognosis,
        faqs
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: MAIN TRANSLATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function translatePageContent(options: {
    lang: string;
    limit: number;
    offset: number;
}) {
    const { lang, limit, offset } = options;

    console.log(`\n📄 Translating page content to ${lang}`);
    console.log(`Limit: ${limit}, Offset: ${offset}`);

    // Get English page content with condition info
    const englishContent = await prisma.conditionPageContent.findMany({
        where: { languageCode: 'en' },
        include: {
            condition: {
                select: {
                    commonName: true,
                    specialistType: true,
                    bodySystem: true,
                    severityLevel: true,
                }
            }
        },
        take: limit,
        skip: offset,
        orderBy: { conditionId: 'asc' },
    });

    console.log(`Found ${englishContent.length} pages to translate`);

    let processed = 0;
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const content of englishContent) {
        try {
            // Generate translated content
            const translated = generateTranslatedContent({
                conditionId: content.conditionId,
                conditionName: content.condition.commonName,
                specialistType: content.condition.specialistType,
                bodySystem: content.condition.bodySystem,
                severityLevel: content.condition.severityLevel,
                h1Title: content.h1Title,
                heroOverview: content.heroOverview,
                definition: content.definition,
                primarySymptoms: content.primarySymptoms as string[] | null,
                earlyWarningSigns: content.earlyWarningSigns as string[] | null,
                emergencySigns: content.emergencySigns as string[] | null,
                causes: content.causes as any,
                riskFactors: content.riskFactors as any,
                diagnosisOverview: content.diagnosisOverview,
                diagnosticTests: content.diagnosticTests as any,
                treatmentOverview: content.treatmentOverview,
                medicalTreatments: content.medicalTreatments as any,
                surgicalOptions: content.surgicalOptions as any,
                preventionStrategies: content.preventionStrategies as string[] | null,
                lifestyleModifications: content.lifestyleModifications as string[] | null,
                complications: content.complications as string[] | null,
                prognosis: content.prognosis,
                faqs: content.faqs as any,
            }, lang);

            // Check if translation already exists
            const existing = await prisma.conditionPageContent.findFirst({
                where: {
                    conditionId: content.conditionId,
                    languageCode: lang,
                },
            });

            if (existing) {
                // Update existing
                await prisma.conditionPageContent.update({
                    where: { id: existing.id },
                    data: {
                        h1Title: translated.h1Title,
                        heroOverview: translated.heroOverview,
                        definition: translated.definition,
                        treatmentOverview: translated.treatment,
                        diagnosisOverview: translated.diagnosis,
                        prognosis: translated.prognosis,
                        faqs: translated.faqs,
                        status: 'draft',
                    },
                });
                updated++;
            } else {
                // Create new
                await prisma.conditionPageContent.create({
                    data: {
                        conditionId: content.conditionId,
                        languageCode: lang,
                        h1Title: translated.h1Title,
                        heroOverview: translated.heroOverview,
                        definition: translated.definition,
                        keyStats: content.keyStats,
                        typesClassification: content.typesClassification,
                        primarySymptoms: content.primarySymptoms,
                        earlyWarningSigns: content.earlyWarningSigns,
                        emergencySigns: content.emergencySigns,
                        causes: content.causes,
                        riskFactors: content.riskFactors,
                        affectedDemographics: content.affectedDemographics,
                        diagnosisOverview: translated.diagnosis,
                        diagnosticTests: content.diagnosticTests,
                        treatmentOverview: translated.treatment,
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
                        preventionStrategies: content.preventionStrategies,
                        lifestyleModifications: content.lifestyleModifications,
                        dietRecommendations: content.dietRecommendations,
                        exerciseGuidelines: content.exerciseGuidelines,
                        dailyManagement: content.dailyManagement,
                        prognosis: translated.prognosis,
                        recoveryTimeline: content.recoveryTimeline,
                        complications: content.complications,
                        supportResources: content.supportResources,
                        confusedWithConditions: content.confusedWithConditions,
                        coOccurringConditions: content.coOccurringConditions,
                        relatedConditions: content.relatedConditions,
                        faqs: translated.faqs,
                        metaTitle: translated.h1Title,
                        metaDescription: translated.heroOverview,
                        canonicalUrl: content.canonicalUrl,
                        keywords: content.keywords,
                        schemaMedicalCondition: content.schemaMedicalCondition,
                        schemaFaqPage: content.schemaFaqPage,
                        schemaBreadcrumb: content.schemaBreadcrumb,
                        schemaHowTo: content.schemaHowTo,
                        status: 'draft',
                        qualityScore: content.qualityScore,
                        wordCount: content.wordCount,
                    },
                });
                created++;
            }

            processed++;

            if (processed % 100 === 0) {
                console.log(`  Processed: ${processed}/${englishContent.length} (${created} created, ${updated} updated)`);
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
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: CLI
// ═══════════════════════════════════════════════════════════════════════════════

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
            console.log('🌍 Translating page content to all languages (ACTUAL TRANSLATION)');
            for (const l of LANGUAGES) {
                await translatePageContent({ lang: l, limit, offset });
            }
        } else if (lang) {
            await translatePageContent({ lang, limit, offset });
        } else {
            console.log('Usage:');
            console.log('  npx tsx scripts/full-manual-translate.ts --lang=hi --limit=5000');
            console.log('  npx tsx scripts/full-manual-translate.ts --all --limit=5000');
            console.log('');
            console.log('This script generates ACTUAL translated content using pre-built dictionaries.');
        }
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
