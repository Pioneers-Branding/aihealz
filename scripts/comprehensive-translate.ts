/**
 * Comprehensive Translation Script
 *
 * Translates ALL content fields for condition pages including:
 * - Symptoms, Causes, Risk Factors
 * - Diagnostic Tests, Treatments
 * - FAQs, Complications, Prevention
 * - All other text content
 *
 * Uses template-based translation with extensive vocabulary dictionaries.
 *
 * Usage:
 *   npx tsx scripts/comprehensive-translate.ts --lang=hi --limit=1000
 *   npx tsx scripts/comprehensive-translate.ts --all --limit=25000
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

// ============================================================================
// COMPREHENSIVE MEDICAL VOCABULARY DICTIONARIES
// ============================================================================

interface LanguageDictionary {
    // Common medical terms
    terms: Record<string, string>;
    // Body parts
    bodyParts: Record<string, string>;
    // Symptoms
    symptoms: Record<string, string>;
    // Actions/Verbs
    actions: Record<string, string>;
    // Adjectives
    adjectives: Record<string, string>;
    // Connectors (of, in, with, etc.)
    connectors: Record<string, string>;
    // Common phrases
    phrases: Record<string, string>;
    // Numbers and time
    timeUnits: Record<string, string>;
}

const DICTIONARIES: Record<string, LanguageDictionary> = {
    hi: {
        terms: {
            // Medical conditions
            'diabetes': 'मधुमेह',
            'hypertension': 'उच्च रक्तचाप',
            'blood pressure': 'रक्तचाप',
            'heart disease': 'हृदय रोग',
            'heart attack': 'दिल का दौरा',
            'stroke': 'स्ट्रोक',
            'cancer': 'कैंसर',
            'tumor': 'ट्यूमर',
            'infection': 'संक्रमण',
            'inflammation': 'सूजन',
            'arthritis': 'गठिया',
            'asthma': 'दमा',
            'allergy': 'एलर्जी',
            'fever': 'बुखार',
            'cold': 'सर्दी',
            'cough': 'खांसी',
            'headache': 'सिरदर्द',
            'migraine': 'माइग्रेन',
            'back pain': 'पीठ दर्द',
            'joint pain': 'जोड़ों का दर्द',
            'muscle pain': 'मांसपेशियों में दर्द',
            'chest pain': 'सीने में दर्द',
            'stomach pain': 'पेट दर्द',
            'abdominal pain': 'पेट दर्द',
            'kidney': 'गुर्दा',
            'liver': 'जिगर',
            'lung': 'फेफड़ा',
            'brain': 'मस्तिष्क',
            'thyroid': 'थायराइड',
            'cholesterol': 'कोलेस्ट्रॉल',
            'obesity': 'मोटापा',
            'weight gain': 'वजन बढ़ना',
            'weight loss': 'वजन कम होना',
            'fatigue': 'थकान',
            'weakness': 'कमजोरी',
            'dizziness': 'चक्कर आना',
            'nausea': 'मतली',
            'vomiting': 'उल्टी',
            'diarrhea': 'दस्त',
            'constipation': 'कब्ज',
            'bleeding': 'रक्तस्राव',
            'swelling': 'सूजन',
            'rash': 'दाने',
            'itching': 'खुजली',
            'pain': 'दर्द',
            'chronic': 'पुराना',
            'acute': 'तीव्र',
            'severe': 'गंभीर',
            'mild': 'हल्का',
            'moderate': 'मध्यम',
            // Treatments
            'treatment': 'उपचार',
            'therapy': 'चिकित्सा',
            'medication': 'दवा',
            'medicine': 'दवाई',
            'surgery': 'सर्जरी',
            'operation': 'ऑपरेशन',
            'procedure': 'प्रक्रिया',
            'injection': 'इंजेक्शन',
            'vaccine': 'टीका',
            'antibiotic': 'एंटीबायोटिक',
            'painkiller': 'दर्द निवारक',
            'insulin': 'इंसुलिन',
            // Diagnosis
            'diagnosis': 'निदान',
            'test': 'परीक्षण',
            'blood test': 'रक्त परीक्षण',
            'urine test': 'मूत्र परीक्षण',
            'x-ray': 'एक्स-रे',
            'mri': 'एमआरआई',
            'ct scan': 'सीटी स्कैन',
            'ultrasound': 'अल्ट्रासाउंड',
            'ecg': 'ईसीजी',
            'biopsy': 'बायोप्सी',
            // Healthcare
            'doctor': 'डॉक्टर',
            'physician': 'चिकित्सक',
            'specialist': 'विशेषज्ञ',
            'surgeon': 'सर्जन',
            'nurse': 'नर्स',
            'hospital': 'अस्पताल',
            'clinic': 'क्लिनिक',
            'patient': 'मरीज',
            'appointment': 'अपॉइंटमेंट',
            'consultation': 'परामर्श',
            // Risk factors
            'risk factor': 'जोखिम कारक',
            'family history': 'पारिवारिक इतिहास',
            'genetic': 'आनुवंशिक',
            'hereditary': 'वंशानुगत',
            'lifestyle': 'जीवनशैली',
            'smoking': 'धूम्रपान',
            'alcohol': 'शराब',
            'diet': 'आहार',
            'exercise': 'व्यायाम',
            'stress': 'तनाव',
            'age': 'उम्र',
            'gender': 'लिंग',
            // Prevention
            'prevention': 'रोकथाम',
            'precaution': 'सावधानी',
            'vaccination': 'टीकाकरण',
            'screening': 'जांच',
            'checkup': 'जांच',
            // Outcomes
            'recovery': 'ठीक होना',
            'cure': 'इलाज',
            'prognosis': 'पूर्वानुमान',
            'complication': 'जटिलता',
            'side effect': 'दुष्प्रभाव',
            // Additional common words
            'previous': 'पहले का',
            'injuries': 'चोटें',
            'injury': 'चोट',
            'trauma': 'आघात',
            'increases': 'बढ़ाता है',
            'increase': 'वृद्धि',
            'decreases': 'कम करता है',
            'decrease': 'कमी',
            'problems': 'समस्याएं',
            'problem': 'समस्या',
            'influence': 'प्रभावित करते हैं',
            'affects': 'प्रभावित करता है',
            'affect': 'प्रभाव',
            'osteoporosis': 'ऑस्टियोपोरोसिस',
            'excess': 'अधिक',
            'related': 'संबंधित',
            'wear': 'घिसाव',
            'tear': 'टूट-फूट',
            'radiates': 'फैलता है',
            'radiate': 'फैलना',
            'shooting': 'तेज़',
            'stabbing': 'चुभने वाला',
            'throbbing': 'धड़कता हुआ',
            'burning': 'जलन वाला',
            'aching': 'दर्द करता हुआ',
            'sharp': 'तीखा',
            'dull': 'हल्का',
            'down': 'नीचे',
            'up': 'ऊपर',
            'movement': 'गति',
            'movements': 'गतिविधियां',
            'difficulty': 'कठिनाई',
            'difficulty in': 'में कठिनाई',
            'causes': 'कारण होते हैं',
            'caused by': 'के कारण',
            'leading to': 'जिससे होता है',
            'results in': 'परिणामस्वरूप',
            'associated with': 'से जुड़ा',
            'related to': 'से संबंधित',
            'linked to': 'से जुड़ा',
            'history': 'इतिहास',
            'past': 'पिछला',
            'current': 'वर्तमान',
            'future': 'भविष्य',
            'early': 'शुरुआती',
            'late': 'देर से',
            'advanced': 'उन्नत',
            'stage': 'चरण',
            'stages': 'चरण',
            'level': 'स्तर',
            'levels': 'स्तर',
            'range': 'सीमा',
            'rate': 'दर',
            'risk': 'जोखिम',
            'risks': 'जोखिम',
            'factor': 'कारक',
            'factors': 'कारक',
            'signs': 'संकेत',
            'sign': 'संकेत',
            'warning': 'चेतावनी',
            'condition': 'स्थिति',
            'conditions': 'स्थितियां',
            'disorder': 'विकार',
            'disorders': 'विकार',
            'syndrome': 'सिंड्रोम',
            'disease': 'रोग',
            'diseases': 'रोग',
            'illness': 'बीमारी',
            'medical': 'चिकित्सा',
            'clinical': 'नैदानिक',
            'physical': 'शारीरिक',
            'mental': 'मानसिक',
            'emotional': 'भावनात्मक',
            'health': 'स्वास्थ्य',
            'healthy': 'स्वस्थ',
            'unhealthy': 'अस्वस्थ',
            'body': 'शरीर',
            'system': 'तंत्र',
            'function': 'कार्य',
            'functions': 'कार्य',
            'process': 'प्रक्रिया',
            'processes': 'प्रक्रियाएं',
            'activity': 'गतिविधि',
            'activities': 'गतिविधियां',
            'ability': 'क्षमता',
            'inability': 'अक्षमता',
            'limited': 'सीमित',
            'reduced': 'कम',
            'increased': 'बढ़ा हुआ',
            'normal': 'सामान्य',
            'abnormal': 'असामान्य',
            'common': 'आम',
            'uncommon': 'असामान्य',
            'rare': 'दुर्लभ',
            'typical': 'विशिष्ट',
            'atypical': 'असामान्य',
            'specific': 'विशिष्ट',
            'general': 'सामान्य',
            'overall': 'समग्र',
            'total': 'कुल',
            'partial': 'आंशिक',
            'complete': 'पूर्ण',
            'effective': 'प्रभावी',
            'ineffective': 'अप्रभावी',
            'beneficial': 'लाभदायक',
            'harmful': 'हानिकारक',
            'safe': 'सुरक्षित',
            'unsafe': 'असुरक्षित',
            'important': 'महत्वपूर्ण',
            'essential': 'आवश्यक',
            'necessary': 'जरूरी',
            'required': 'आवश्यक',
            'recommended': 'अनुशंसित',
            'suggested': 'सुझाया गया',
            'possible': 'संभव',
            'impossible': 'असंभव',
            'likely': 'संभावित',
            'unlikely': 'असंभावित',
            'certain': 'निश्चित',
            'uncertain': 'अनिश्चित',
            'known': 'ज्ञात',
            'unknown': 'अज्ञात',
            'available': 'उपलब्ध',
            'unavailable': 'अनुपलब्ध',
        },
        bodyParts: {
            'head': 'सिर',
            'brain': 'मस्तिष्क',
            'eye': 'आंख',
            'ear': 'कान',
            'nose': 'नाक',
            'mouth': 'मुंह',
            'throat': 'गला',
            'neck': 'गर्दन',
            'chest': 'छाती',
            'heart': 'हृदय',
            'lung': 'फेफड़ा',
            'stomach': 'पेट',
            'liver': 'जिगर',
            'kidney': 'गुर्दा',
            'intestine': 'आंत',
            'colon': 'बृहदांत्र',
            'skin': 'त्वचा',
            'bone': 'हड्डी',
            'joint': 'जोड़',
            'muscle': 'मांसपेशी',
            'nerve': 'नस',
            'blood': 'रक्त',
            'vein': 'नस',
            'artery': 'धमनी',
            'spine': 'रीढ़',
            'back': 'पीठ',
            'arm': 'बांह',
            'hand': 'हाथ',
            'leg': 'पैर',
            'foot': 'पांव',
            'knee': 'घुटना',
            'hip': 'कूल्हा',
            'shoulder': 'कंधा',
            'elbow': 'कोहनी',
            'wrist': 'कलाई',
            'ankle': 'टखना',
            'finger': 'उंगली',
            'toe': 'पैर की उंगली',
            'tooth': 'दांत',
            'gum': 'मसूड़ा',
            'tongue': 'जीभ',
            'pancreas': 'अग्न्याशय',
            'thyroid': 'थायराइड',
            'prostate': 'प्रोस्टेट',
            'uterus': 'गर्भाशय',
            'ovary': 'अंडाशय',
            'bladder': 'मूत्राशय',
        },
        symptoms: {
            'pain': 'दर्द',
            'ache': 'दर्द',
            'burning': 'जलन',
            'tingling': 'झुनझुनी',
            'numbness': 'सुन्नपन',
            'swelling': 'सूजन',
            'redness': 'लालिमा',
            'itching': 'खुजली',
            'rash': 'दाने',
            'fever': 'बुखार',
            'chills': 'ठंड लगना',
            'sweating': 'पसीना आना',
            'fatigue': 'थकान',
            'weakness': 'कमजोरी',
            'dizziness': 'चक्कर आना',
            'fainting': 'बेहोशी',
            'headache': 'सिरदर्द',
            'nausea': 'मतली',
            'vomiting': 'उल्टी',
            'diarrhea': 'दस्त',
            'constipation': 'कब्ज',
            'bloating': 'पेट फूलना',
            'gas': 'गैस',
            'heartburn': 'सीने में जलन',
            'cough': 'खांसी',
            'sneezing': 'छींक',
            'runny nose': 'नाक बहना',
            'congestion': 'जमाव',
            'shortness of breath': 'सांस फूलना',
            'wheezing': 'घरघराहट',
            'chest tightness': 'सीने में जकड़न',
            'palpitations': 'धड़कन तेज होना',
            'high blood pressure': 'उच्च रक्तचाप',
            'low blood pressure': 'निम्न रक्तचाप',
            'rapid heartbeat': 'तेज धड़कन',
            'slow heartbeat': 'धीमी धड़कन',
            'weight gain': 'वजन बढ़ना',
            'weight loss': 'वजन कम होना',
            'loss of appetite': 'भूख न लगना',
            'increased appetite': 'भूख बढ़ना',
            'thirst': 'प्यास',
            'frequent urination': 'बार-बार पेशाब आना',
            'painful urination': 'पेशाब में दर्द',
            'blood in urine': 'पेशाब में खून',
            'blood in stool': 'मल में खून',
            'dark urine': 'गहरे रंग का पेशाब',
            'pale stool': 'हल्के रंग का मल',
            'jaundice': 'पीलिया',
            'hair loss': 'बाल झड़ना',
            'dry skin': 'रूखी त्वचा',
            'oily skin': 'तैलीय त्वचा',
            'acne': 'मुहांसे',
            'bruising': 'नील पड़ना',
            'bleeding': 'खून बहना',
            'clotting': 'खून जमना',
            'stiffness': 'अकड़न',
            'cramps': 'ऐंठन',
            'spasms': 'मरोड़',
            'tremors': 'कंपकंपी',
            'seizures': 'दौरे',
            'confusion': 'भ्रम',
            'memory loss': 'स्मृति हानि',
            'difficulty concentrating': 'ध्यान केंद्रित करने में कठिनाई',
            'anxiety': 'चिंता',
            'depression': 'अवसाद',
            'mood swings': 'मूड में बदलाव',
            'insomnia': 'अनिद्रा',
            'excessive sleeping': 'अधिक नींद',
            'snoring': 'खर्राटे',
            'sleep apnea': 'स्लीप एपनिया',
            'blurred vision': 'धुंधली दृष्टि',
            'double vision': 'दोहरी दृष्टि',
            'eye pain': 'आंख में दर्द',
            'hearing loss': 'सुनने में कमी',
            'ringing in ears': 'कान में बजना',
            'ear pain': 'कान में दर्द',
            'sore throat': 'गले में खराश',
            'difficulty swallowing': 'निगलने में कठिनाई',
            'hoarseness': 'आवाज बैठना',
        },
        actions: {
            'consult': 'परामर्श करें',
            'visit': 'जाएं',
            'take': 'लें',
            'avoid': 'बचें',
            'eat': 'खाएं',
            'drink': 'पिएं',
            'exercise': 'व्यायाम करें',
            'rest': 'आराम करें',
            'sleep': 'सोएं',
            'diagnose': 'निदान करें',
            'treat': 'इलाज करें',
            'prevent': 'रोकें',
            'manage': 'प्रबंधन करें',
            'monitor': 'निगरानी करें',
            'reduce': 'कम करें',
            'increase': 'बढ़ाएं',
            'maintain': 'बनाए रखें',
            'follow': 'पालन करें',
            'seek': 'लें',
            'get': 'लें',
            'undergo': 'कराएं',
            'perform': 'करें',
            'recommend': 'सिफारिश करें',
            'prescribe': 'निर्धारित करें',
            'administer': 'दें',
            'inject': 'इंजेक्ट करें',
            'apply': 'लगाएं',
            'use': 'उपयोग करें',
            'stop': 'बंद करें',
            'start': 'शुरू करें',
            'continue': 'जारी रखें',
            'discontinue': 'बंद करें',
        },
        adjectives: {
            'chronic': 'पुराना',
            'acute': 'तीव्र',
            'severe': 'गंभीर',
            'mild': 'हल्का',
            'moderate': 'मध्यम',
            'common': 'आम',
            'rare': 'दुर्लभ',
            'frequent': 'बार-बार',
            'occasional': 'कभी-कभी',
            'persistent': 'लगातार',
            'temporary': 'अस्थायी',
            'permanent': 'स्थायी',
            'sudden': 'अचानक',
            'gradual': 'धीरे-धीरे',
            'progressive': 'बढ़ता हुआ',
            'recurring': 'बार-बार होने वाला',
            'infectious': 'संक्रामक',
            'contagious': 'छूत का',
            'hereditary': 'वंशानुगत',
            'genetic': 'आनुवंशिक',
            'autoimmune': 'ऑटोइम्यून',
            'inflammatory': 'सूजन वाला',
            'degenerative': 'अपक्षयी',
            'benign': 'सौम्य',
            'malignant': 'घातक',
            'cancerous': 'कैंसरयुक्त',
            'non-cancerous': 'गैर-कैंसरयुक्त',
            'treatable': 'इलाज योग्य',
            'curable': 'ठीक होने योग्य',
            'incurable': 'लाइलाज',
            'manageable': 'प्रबंधनीय',
            'preventable': 'रोके जा सकने वाला',
            'high': 'उच्च',
            'low': 'निम्न',
            'normal': 'सामान्य',
            'abnormal': 'असामान्य',
            'elevated': 'बढ़ा हुआ',
            'reduced': 'कम हुआ',
            'painful': 'दर्दनाक',
            'painless': 'दर्द रहित',
        },
        phrases: {
            'seek medical attention': 'चिकित्सा सहायता लें',
            'consult a doctor': 'डॉक्टर से परामर्श करें',
            'see a specialist': 'विशेषज्ञ से मिलें',
            'go to hospital': 'अस्पताल जाएं',
            'emergency care': 'आपातकालीन देखभाल',
            'first aid': 'प्राथमिक चिकित्सा',
            'home remedies': 'घरेलू उपचार',
            'lifestyle changes': 'जीवनशैली में बदलाव',
            'dietary changes': 'आहार में बदलाव',
            'regular exercise': 'नियमित व्यायाम',
            'adequate sleep': 'पर्याप्त नींद',
            'stress management': 'तनाव प्रबंधन',
            'weight management': 'वजन प्रबंधन',
            'blood sugar control': 'रक्त शर्करा नियंत्रण',
            'blood pressure control': 'रक्तचाप नियंत्रण',
            'cholesterol management': 'कोलेस्ट्रॉल प्रबंधन',
            'quit smoking': 'धूम्रपान छोड़ें',
            'limit alcohol': 'शराब सीमित करें',
            'balanced diet': 'संतुलित आहार',
            'healthy lifestyle': 'स्वस्थ जीवनशैली',
            'regular checkup': 'नियमित जांच',
            'follow-up care': 'अनुवर्ती देखभाल',
            'take medication': 'दवा लें',
            'as prescribed': 'निर्धारित अनुसार',
            'side effects': 'दुष्प्रभाव',
            'drug interactions': 'दवा परस्पर क्रिया',
            'may cause': 'हो सकता है',
            'can lead to': 'हो सकता है',
            'risk of': 'का खतरा',
            'symptoms include': 'लक्षणों में शामिल हैं',
            'causes include': 'कारणों में शामिल हैं',
            'treatment options': 'उपचार विकल्प',
            'recovery time': 'ठीक होने का समय',
            'success rate': 'सफलता दर',
            'survival rate': 'जीवित रहने की दर',
            'what to expect': 'क्या उम्मीद करें',
            'how to prepare': 'कैसे तैयारी करें',
            'after the procedure': 'प्रक्रिया के बाद',
            'before the procedure': 'प्रक्रिया से पहले',
            'during treatment': 'उपचार के दौरान',
            'after treatment': 'उपचार के बाद',
        },
        timeUnits: {
            'day': 'दिन',
            'days': 'दिन',
            'week': 'सप्ताह',
            'weeks': 'सप्ताह',
            'month': 'महीना',
            'months': 'महीने',
            'year': 'साल',
            'years': 'साल',
            'hour': 'घंटा',
            'hours': 'घंटे',
            'minute': 'मिनट',
            'minutes': 'मिनट',
            'daily': 'रोजाना',
            'weekly': 'साप्ताहिक',
            'monthly': 'मासिक',
            'yearly': 'वार्षिक',
            'once': 'एक बार',
            'twice': 'दो बार',
            'times': 'बार',
        },
        connectors: {
            ' of ': ' का ',
            ' in ': ' में ',
            ' with ': ' के साथ ',
            ' and ': ' और ',
            ' or ': ' या ',
            ' to ': ' को ',
            ' for ': ' के लिए ',
            ' from ': ' से ',
            ' by ': ' द्वारा ',
            ' is ': ' है ',
            ' are ': ' हैं ',
            ' can ': ' कर सकते हैं ',
            ' may ': ' हो सकता है ',
            ' should ': ' चाहिए ',
            ' will ': ' होगा ',
            ' have ': ' है ',
            ' has ': ' है ',
            ' the ': ' ',
            ' a ': ' एक ',
            ' an ': ' एक ',
            ' this ': ' यह ',
            ' that ': ' वह ',
            ' these ': ' ये ',
            ' those ': ' वे ',
            ' such as ': ' जैसे कि ',
            ' including ': ' सहित ',
            ' especially ': ' विशेष रूप से ',
            ' particularly ': ' विशेष रूप से ',
            ' usually ': ' आमतौर पर ',
            ' often ': ' अक्सर ',
            ' sometimes ': ' कभी-कभी ',
            ' always ': ' हमेशा ',
            ' never ': ' कभी नहीं ',
            ' very ': ' बहुत ',
            ' more ': ' अधिक ',
            ' less ': ' कम ',
            ' most ': ' सबसे ',
            ' least ': ' कम से कम ',
            ' also ': ' भी ',
            ' only ': ' केवल ',
            ' just ': ' बस ',
            ' even ': ' भी ',
            ' when ': ' जब ',
            ' if ': ' अगर ',
            ' then ': ' तो ',
            ' because ': ' क्योंकि ',
            ' although ': ' हालांकि ',
            ' however ': ' हालांकि ',
            ' therefore ': ' इसलिए ',
            ' other ': ' अन्य ',
            ' another ': ' एक और ',
            ' same ': ' समान ',
            ' different ': ' अलग ',
            ' both ': ' दोनों ',
            ' all ': ' सभी ',
            ' any ': ' कोई ',
            ' some ': ' कुछ ',
            ' no ': ' नहीं ',
            ' not ': ' नहीं ',
            ' without ': ' बिना ',
        },
    },
    // Tamil dictionary
    ta: {
        terms: {
            'diabetes': 'நீரிழிவு',
            'hypertension': 'உயர் இரத்த அழுத்தம்',
            'blood pressure': 'இரத்த அழுத்தம்',
            'heart disease': 'இதய நோய்',
            'heart attack': 'மாரடைப்பு',
            'cancer': 'புற்றுநோய்',
            'infection': 'தொற்று',
            'fever': 'காய்ச்சல்',
            'cold': 'சளி',
            'cough': 'இருமல்',
            'headache': 'தலைவலி',
            'pain': 'வலி',
            'treatment': 'சிகிச்சை',
            'medication': 'மருந்து',
            'surgery': 'அறுவை சிகிச்சை',
            'doctor': 'மருத்துவர்',
            'hospital': 'மருத்துவமனை',
            'diagnosis': 'நோய் கண்டறிதல்',
            'test': 'பரிசோதனை',
            'symptom': 'அறிகுறி',
            'cause': 'காரணம்',
            'prevention': 'தடுப்பு',
            'recovery': 'குணமாதல்',
        },
        bodyParts: {
            'head': 'தலை',
            'heart': 'இதயம்',
            'lung': 'நுரையீரல்',
            'stomach': 'வயிறு',
            'liver': 'கல்லீரல்',
            'kidney': 'சிறுநீரகம்',
            'bone': 'எலும்பு',
            'muscle': 'தசை',
            'skin': 'தோல்',
            'blood': 'இரத்தம்',
            'eye': 'கண்',
            'ear': 'காது',
        },
        symptoms: {
            'pain': 'வலி',
            'fever': 'காய்ச்சல்',
            'fatigue': 'சோர்வு',
            'weakness': 'பலவீனம்',
            'swelling': 'வீக்கம்',
            'bleeding': 'இரத்தப்போக்கு',
            'cough': 'இருமல்',
            'headache': 'தலைவலி',
        },
        actions: {
            'consult': 'ஆலோசிக்கவும்',
            'take': 'எடுக்கவும்',
            'avoid': 'தவிர்க்கவும்',
            'exercise': 'உடற்பயிற்சி செய்யவும்',
        },
        adjectives: {
            'chronic': 'நாள்பட்ட',
            'acute': 'கடுமையான',
            'severe': 'தீவிரமான',
            'mild': 'லேசான',
        },
        phrases: {
            'consult a doctor': 'மருத்துவரை அணுகவும்',
            'seek medical attention': 'மருத்துவ உதவி பெறவும்',
        },
        timeUnits: {
            'day': 'நாள்',
            'week': 'வாரம்',
            'month': 'மாதம்',
            'year': 'ஆண்டு',
        },
    },
    // Telugu dictionary
    te: {
        terms: {
            'diabetes': 'మధుమేహం',
            'hypertension': 'అధిక రక్తపోటు',
            'blood pressure': 'రక్తపోటు',
            'heart disease': 'గుండె జబ్బు',
            'heart attack': 'గుండెపోటు',
            'cancer': 'క్యాన్సర్',
            'infection': 'సంక్రమణ',
            'fever': 'జ్వరం',
            'cold': 'జలుబు',
            'cough': 'దగ్గు',
            'headache': 'తలనొప్పి',
            'pain': 'నొప్పి',
            'treatment': 'చికిత్స',
            'medication': 'మందు',
            'surgery': 'శస్త్రచికిత్స',
            'doctor': 'వైద్యుడు',
            'hospital': 'ఆసుపత్రి',
            'diagnosis': 'రోగ నిర్ధారణ',
        },
        bodyParts: {
            'head': 'తల',
            'heart': 'గుండె',
            'stomach': 'పొట్ట',
            'kidney': 'మూత్రపిండం',
            'liver': 'కాలేయం',
            'bone': 'ఎముక',
        },
        symptoms: {
            'pain': 'నొప్పి',
            'fever': 'జ్వరం',
            'fatigue': 'అలసట',
            'weakness': 'బలహీనత',
            'swelling': 'వాపు',
        },
        actions: {
            'consult': 'సంప్రదించండి',
            'take': 'తీసుకోండి',
            'avoid': 'నివారించండి',
        },
        adjectives: {
            'chronic': 'దీర్ఘకాలిక',
            'severe': 'తీవ్రమైన',
            'mild': 'తేలికైన',
        },
        phrases: {
            'consult a doctor': 'వైద్యుడిని సంప్రదించండి',
        },
        timeUnits: {
            'day': 'రోజు',
            'week': 'వారం',
            'month': 'నెల',
            'year': 'సంవత్సరం',
        },
    },
    // Bengali dictionary
    bn: {
        terms: {
            'diabetes': 'ডায়াবেটিস',
            'hypertension': 'উচ্চ রক্তচাপ',
            'blood pressure': 'রক্তচাপ',
            'heart disease': 'হৃদরোগ',
            'heart attack': 'হার্ট অ্যাটাক',
            'cancer': 'ক্যান্সার',
            'infection': 'সংক্রমণ',
            'fever': 'জ্বর',
            'cold': 'সর্দি',
            'cough': 'কাশি',
            'headache': 'মাথা ব্যথা',
            'pain': 'ব্যথা',
            'treatment': 'চিকিৎসা',
            'medication': 'ওষুধ',
            'surgery': 'অস্ত্রোপচার',
            'doctor': 'ডাক্তার',
            'hospital': 'হাসপাতাল',
            'diagnosis': 'রোগ নির্ণয়',
        },
        bodyParts: {
            'head': 'মাথা',
            'heart': 'হৃদয়',
            'stomach': 'পেট',
            'kidney': 'কিডনি',
            'liver': 'যকৃত',
            'bone': 'হাড়',
        },
        symptoms: {
            'pain': 'ব্যথা',
            'fever': 'জ্বর',
            'fatigue': 'ক্লান্তি',
            'weakness': 'দুর্বলতা',
            'swelling': 'ফোলা',
        },
        actions: {
            'consult': 'পরামর্শ করুন',
            'take': 'নিন',
            'avoid': 'এড়িয়ে চলুন',
        },
        adjectives: {
            'chronic': 'দীর্ঘস্থায়ী',
            'severe': 'গুরুতর',
            'mild': 'হালকা',
        },
        phrases: {
            'consult a doctor': 'ডাক্তারের সাথে পরামর্শ করুন',
        },
        timeUnits: {
            'day': 'দিন',
            'week': 'সপ্তাহ',
            'month': 'মাস',
            'year': 'বছর',
        },
    },
    // Add more languages as needed (mr, gu, kn, ml, pa, or, ur, ar, es, fr, pt, de)
};

// ============================================================================
// TRANSLATION FUNCTIONS
// ============================================================================

function getDictionary(lang: string): LanguageDictionary {
    return DICTIONARIES[lang] || DICTIONARIES['hi'];
}

/**
 * Translate a text string using dictionary lookup and pattern matching
 */
function translateText(text: string, lang: string): string {
    if (!text || lang === 'en') return text;

    const dict = getDictionary(lang);
    let translated = text;

    // Replace phrases first (longer matches)
    for (const [en, local] of Object.entries(dict.phrases || {})) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, local);
    }

    // Replace terms
    for (const [en, local] of Object.entries(dict.terms || {})) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, local);
    }

    // Replace body parts
    for (const [en, local] of Object.entries(dict.bodyParts || {})) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, local);
    }

    // Replace symptoms
    for (const [en, local] of Object.entries(dict.symptoms || {})) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, local);
    }

    // Replace adjectives
    for (const [en, local] of Object.entries(dict.adjectives || {})) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, local);
    }

    // Replace actions
    for (const [en, local] of Object.entries(dict.actions || {})) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, local);
    }

    // Replace connectors (these have spaces, use direct string replace)
    for (const [en, local] of Object.entries(dict.connectors || {})) {
        // Use case-insensitive replace
        const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        translated = translated.replace(regex, local);
    }

    // Replace time units
    for (const [en, local] of Object.entries(dict.timeUnits || {})) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, local);
    }

    return translated;
}

/**
 * Translate an array of strings
 */
function translateArray(arr: string[] | null, lang: string): string[] | null {
    if (!arr || lang === 'en') return arr;
    return arr.map(item => translateText(item, lang));
}

/**
 * Translate an array of objects with specific string fields
 */
function translateObjectArray<T extends Record<string, any>>(
    arr: T[] | null,
    lang: string,
    fieldsToTranslate: string[]
): T[] | null {
    if (!arr || lang === 'en') return arr;

    return arr.map(item => {
        const translatedItem = { ...item };
        for (const field of fieldsToTranslate) {
            if (typeof translatedItem[field] === 'string') {
                translatedItem[field] = translateText(translatedItem[field], lang);
            }
        }
        return translatedItem;
    });
}

/**
 * Comprehensive translate all fields of a page content record
 */
function translatePageContent(content: any, lang: string): any {
    if (lang === 'en') return content;

    return {
        // Hero
        h1Title: translateText(content.h1Title, lang),
        heroOverview: translateText(content.heroOverview, lang),

        // Definition
        definition: translateText(content.definition, lang),

        // Symptoms
        primarySymptoms: translateArray(content.primarySymptoms as string[], lang),
        earlyWarningSigns: translateArray(content.earlyWarningSigns as string[], lang),
        emergencySigns: translateArray(content.emergencySigns as string[], lang),

        // Causes & Risk Factors
        causes: translateObjectArray(content.causes as any[], lang, ['cause', 'description']),
        riskFactors: translateObjectArray(content.riskFactors as any[], lang, ['factor', 'description']),
        affectedDemographics: translateArray(content.affectedDemographics as string[], lang),

        // Diagnosis
        diagnosisOverview: translateText(content.diagnosisOverview, lang),
        diagnosticTests: translateObjectArray(content.diagnosticTests as any[], lang, ['test', 'purpose', 'whatToExpect']),

        // Treatment
        treatmentOverview: translateText(content.treatmentOverview, lang),
        medicalTreatments: translateObjectArray(content.medicalTreatments as any[], lang, ['name', 'description', 'effectiveness']),
        surgicalOptions: translateObjectArray(content.surgicalOptions as any[], lang, ['name', 'description']),
        alternativeTreatments: translateObjectArray(content.alternativeTreatments as any[], lang, ['name', 'description']),

        // Doctors
        whySeeSpecialist: translateText(content.whySeeSpecialist, lang),
        doctorSelectionGuide: translateText(content.doctorSelectionGuide, lang),

        // Hospitals
        hospitalCriteria: translateArray(content.hospitalCriteria as string[], lang),
        keyFacilities: translateArray(content.keyFacilities as string[], lang),

        // Costs
        insuranceGuide: translateText(content.insuranceGuide, lang),
        financialAssistance: translateText(content.financialAssistance, lang),

        // Prevention & Lifestyle
        preventionStrategies: translateArray(content.preventionStrategies as string[], lang),
        lifestyleModifications: translateArray(content.lifestyleModifications as string[], lang),
        exerciseGuidelines: translateText(content.exerciseGuidelines, lang),

        // Living With
        dailyManagement: translateArray(content.dailyManagement as string[], lang),
        prognosis: translateText(content.prognosis, lang),
        recoveryTimeline: translateText(content.recoveryTimeline, lang),
        complications: translateArray(content.complications as string[], lang),

        // FAQs
        faqs: translateObjectArray(content.faqs as any[], lang, ['question', 'answer']),

        // Meta
        metaTitle: translateText(content.metaTitle, lang),
        metaDescription: translateText(content.metaDescription, lang),
    };
}

// ============================================================================
// MAIN TRANSLATION FUNCTION
// ============================================================================

async function comprehensiveTranslate(options: {
    lang?: string;
    allLangs?: boolean;
    limit?: number;
    offset?: number;
}) {
    const { lang, allLangs, limit = 25000, offset = 0 } = options;

    const LANGUAGES = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'ar', 'es', 'fr', 'pt', 'de'];
    const languagesToProcess = allLangs ? LANGUAGES : (lang ? [lang] : []);

    if (languagesToProcess.length === 0) {
        console.log('Usage:');
        console.log('  npx tsx scripts/comprehensive-translate.ts --lang=hi --limit=1000');
        console.log('  npx tsx scripts/comprehensive-translate.ts --all --limit=25000');
        return;
    }

    console.log('='.repeat(60));
    console.log('COMPREHENSIVE TRANSLATION');
    console.log('='.repeat(60));
    console.log(`Languages: ${languagesToProcess.join(', ')}`);
    console.log(`Limit: ${limit}, Offset: ${offset}`);
    console.log('');

    for (const targetLang of languagesToProcess) {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`Translating to: ${targetLang.toUpperCase()}`);
        console.log('─'.repeat(50));

        // Get English content as source
        const englishContent = await prisma.conditionPageContent.findMany({
            where: { languageCode: 'en' },
            take: limit,
            skip: offset,
            orderBy: { conditionId: 'asc' },
        });

        console.log(`Found ${englishContent.length} English records to translate`);

        let processed = 0;
        let updated = 0;
        let created = 0;
        let errors = 0;

        for (const enContent of englishContent) {
            try {
                // Translate all fields
                const translated = translatePageContent(enContent, targetLang);

                // Check if target language record exists
                const existing = await prisma.conditionPageContent.findFirst({
                    where: {
                        conditionId: enContent.conditionId,
                        languageCode: targetLang,
                    },
                });

                if (existing) {
                    // Update existing record with translated content
                    await prisma.conditionPageContent.update({
                        where: { id: existing.id },
                        data: {
                            h1Title: translated.h1Title,
                            heroOverview: translated.heroOverview,
                            definition: translated.definition,
                            primarySymptoms: translated.primarySymptoms,
                            earlyWarningSigns: translated.earlyWarningSigns,
                            emergencySigns: translated.emergencySigns,
                            causes: translated.causes,
                            riskFactors: translated.riskFactors,
                            affectedDemographics: translated.affectedDemographics,
                            diagnosisOverview: translated.diagnosisOverview,
                            diagnosticTests: translated.diagnosticTests,
                            treatmentOverview: translated.treatmentOverview,
                            medicalTreatments: translated.medicalTreatments,
                            surgicalOptions: translated.surgicalOptions,
                            alternativeTreatments: translated.alternativeTreatments,
                            whySeeSpecialist: translated.whySeeSpecialist,
                            doctorSelectionGuide: translated.doctorSelectionGuide,
                            hospitalCriteria: translated.hospitalCriteria,
                            keyFacilities: translated.keyFacilities,
                            insuranceGuide: translated.insuranceGuide,
                            financialAssistance: translated.financialAssistance,
                            preventionStrategies: translated.preventionStrategies,
                            lifestyleModifications: translated.lifestyleModifications,
                            exerciseGuidelines: translated.exerciseGuidelines,
                            dailyManagement: translated.dailyManagement,
                            prognosis: translated.prognosis,
                            recoveryTimeline: translated.recoveryTimeline,
                            complications: translated.complications,
                            faqs: translated.faqs,
                            metaTitle: translated.metaTitle,
                            metaDescription: translated.metaDescription,
                        },
                    });
                    updated++;
                } else {
                    // Create new record
                    await prisma.conditionPageContent.create({
                        data: {
                            conditionId: enContent.conditionId,
                            languageCode: targetLang,
                            ...translated,
                            status: 'draft',
                        },
                    });
                    created++;
                }

                processed++;
                if (processed % 500 === 0) {
                    console.log(`  Processed: ${processed}/${englishContent.length} (${created} created, ${updated} updated)`);
                }
            } catch (error: any) {
                errors++;
                if (errors <= 3) {
                    console.error(`  Error: ${error.message}`);
                }
            }
        }

        console.log(`\n✅ Completed ${targetLang}:`);
        console.log(`   Processed: ${processed}`);
        console.log(`   Created: ${created}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Errors: ${errors}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('COMPREHENSIVE TRANSLATION COMPLETE');
    console.log('='.repeat(60));
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    let lang = '';
    let limit = 25000;
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
        await comprehensiveTranslate({ lang, allLangs, limit, offset });
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
