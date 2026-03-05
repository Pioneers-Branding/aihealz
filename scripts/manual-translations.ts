/**
 * Manual Content Translation Pipeline
 *
 * Generates translations using pre-written medical dictionaries
 * and template-based content generation (no external API calls)
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

// ══════════════════════════════════════════════════════════════════════════════
// MEDICAL TERM DICTIONARIES
// ══════════════════════════════════════════════════════════════════════════════

const MEDICAL_TERMS: Record<string, Record<string, string>> = {
    // ── Hindi (hi) ────────────────────────────────────────────────────────────
    hi: {
        // Common medical terms
        'treatment': 'उपचार',
        'symptoms': 'लक्षण',
        'causes': 'कारण',
        'diagnosis': 'निदान',
        'prevention': 'रोकथाम',
        'doctor': 'डॉक्टर',
        'specialist': 'विशेषज्ञ',
        'hospital': 'अस्पताल',
        'patient': 'रोगी',
        'medicine': 'दवाई',
        'consultation': 'परामर्श',
        'appointment': 'अपॉइंटमेंट',
        'cost': 'लागत',
        'recovery': 'स्वास्थ्य लाभ',
        'surgery': 'सर्जरी',
        'therapy': 'थेरेपी',
        'pain': 'दर्द',
        'fever': 'बुखार',
        'infection': 'संक्रमण',
        'inflammation': 'सूजन',
        'chronic': 'दीर्घकालिक',
        'acute': 'तीव्र',
        'mild': 'हल्का',
        'severe': 'गंभीर',
        'moderate': 'मध्यम',
        'risk factors': 'जोखिम कारक',
        'complications': 'जटिलताएं',
        'prognosis': 'पूर्वानुमान',
        'lifestyle': 'जीवनशैली',
        'diet': 'आहार',
        'exercise': 'व्यायाम',
        'medication': 'दवा',
        'dosage': 'खुराक',
        'side effects': 'दुष्प्रभाव',
        'blood test': 'रक्त परीक्षण',
        'scan': 'स्कैन',
        'x-ray': 'एक्स-रे',
        'ultrasound': 'अल्ट्रासाउंड',
        'MRI': 'एमआरआई',
        'CT scan': 'सीटी स्कैन',
        'biopsy': 'बायोप्सी',

        // Body parts
        'heart': 'हृदय',
        'brain': 'मस्तिष्क',
        'liver': 'यकृत',
        'kidney': 'गुर्दा',
        'lung': 'फेफड़ा',
        'stomach': 'पेट',
        'skin': 'त्वचा',
        'bone': 'हड्डी',
        'muscle': 'मांसपेशी',
        'joint': 'जोड़',
        'blood': 'रक्त',
        'eye': 'आंख',
        'ear': 'कान',
        'throat': 'गला',
        'spine': 'रीढ़',

        // Specialties
        'cardiologist': 'हृदय रोग विशेषज्ञ',
        'neurologist': 'न्यूरोलॉजिस्ट',
        'orthopedic': 'हड्डी रोग विशेषज्ञ',
        'dermatologist': 'त्वचा विशेषज्ञ',
        'gastroenterologist': 'गैस्ट्रोएंटेरोलॉजिस्ट',
        'pulmonologist': 'फेफड़े विशेषज्ञ',
        'nephrologist': 'गुर्दा विशेषज्ञ',
        'oncologist': 'कैंसर विशेषज्ञ',
        'psychiatrist': 'मनोचिकित्सक',
        'pediatrician': 'बाल रोग विशेषज्ञ',
        'gynecologist': 'स्त्री रोग विशेषज्ञ',
        'urologist': 'मूत्र रोग विशेषज्ञ',
        'ENT specialist': 'कान-नाक-गला विशेषज्ञ',
        'ophthalmologist': 'नेत्र विशेषज्ञ',
        'endocrinologist': 'एंडोक्राइनोलॉजिस्ट',

        // Common phrases
        'best treatment': 'सर्वोत्तम उपचार',
        'top doctors': 'शीर्ष डॉक्टर',
        'best hospitals': 'सर्वश्रेष्ठ अस्पताल',
        'treatment cost': 'उपचार की लागत',
        'book appointment': 'अपॉइंटमेंट बुक करें',
        'consult now': 'अभी परामर्श करें',
        'find doctors': 'डॉक्टर खोजें',
        'near you': 'आपके पास',
        'what is': 'क्या है',
        'how to treat': 'कैसे इलाज करें',
        'when to see doctor': 'डॉक्टर को कब दिखाएं',
    },

    // ── Tamil (ta) ────────────────────────────────────────────────────────────
    ta: {
        'treatment': 'சிகிச்சை',
        'symptoms': 'அறிகுறிகள்',
        'causes': 'காரணங்கள்',
        'diagnosis': 'நோய் கண்டறிதல்',
        'prevention': 'தடுப்பு',
        'doctor': 'மருத்துவர்',
        'specialist': 'நிபுணர்',
        'hospital': 'மருத்துவமனை',
        'patient': 'நோயாளி',
        'medicine': 'மருந்து',
        'consultation': 'ஆலோசனை',
        'appointment': 'சந்திப்பு',
        'cost': 'செலவு',
        'recovery': 'குணமடைதல்',
        'surgery': 'அறுவை சிகிச்சை',
        'therapy': 'சிகிச்சை முறை',
        'pain': 'வலி',
        'fever': 'காய்ச்சல்',
        'infection': 'தொற்று',
        'inflammation': 'வீக்கம்',
        'chronic': 'நாள்பட்ட',
        'acute': 'கடுமையான',
        'mild': 'லேசான',
        'severe': 'தீவிரமான',
        'moderate': 'மிதமான',
        'risk factors': 'ஆபத்து காரணிகள்',
        'complications': 'சிக்கல்கள்',
        'heart': 'இதயம்',
        'brain': 'மூளை',
        'liver': 'கல்லீரல்',
        'kidney': 'சிறுநீரகம்',
        'lung': 'நுரையீரல்',
        'stomach': 'வயிறு',
        'skin': 'தோல்',
        'bone': 'எலும்பு',
        'blood': 'இரத்தம்',
        'eye': 'கண்',
        'cardiologist': 'இதய நிபுணர்',
        'neurologist': 'நரம்பியல் நிபுணர்',
        'orthopedic': 'எலும்பியல் நிபுணர்',
        'dermatologist': 'தோல் நிபுணர்',
        'best treatment': 'சிறந்த சிகிச்சை',
        'top doctors': 'சிறந்த மருத்துவர்கள்',
        'best hospitals': 'சிறந்த மருத்துவமனைகள்',
        'treatment cost': 'சிகிச்சை செலவு',
        'book appointment': 'சந்திப்பை முன்பதிவு செய்யுங்கள்',
        'consult now': 'இப்போது ஆலோசிக்கவும்',
        'find doctors': 'மருத்துவர்களைக் கண்டறியுங்கள்',
        'near you': 'உங்களுக்கு அருகில்',
        'what is': 'என்றால் என்ன',
        'when to see doctor': 'மருத்துவரை எப்போது அணுகுவது',
    },

    // ── Telugu (te) ────────────────────────────────────────────────────────────
    te: {
        'treatment': 'చికిత్స',
        'symptoms': 'లక్షణాలు',
        'causes': 'కారణాలు',
        'diagnosis': 'రోగ నిర్ధారణ',
        'prevention': 'నివారణ',
        'doctor': 'వైద్యుడు',
        'specialist': 'నిపుణుడు',
        'hospital': 'ఆసుపత్రి',
        'patient': 'రోగి',
        'medicine': 'మందు',
        'consultation': 'సంప్రదింపు',
        'cost': 'ఖర్చు',
        'recovery': 'కోలుకోవడం',
        'surgery': 'శస్త్రచికిత్స',
        'pain': 'నొప్పి',
        'fever': 'జ్వరం',
        'infection': 'ఇన్ఫెక్షన్',
        'chronic': 'దీర్ఘకాలిక',
        'acute': 'తీవ్రమైన',
        'mild': 'తేలికపాటి',
        'severe': 'తీవ్రమైన',
        'heart': 'గుండె',
        'brain': 'మెదడు',
        'liver': 'కాలేయం',
        'kidney': 'మూత్రపిండం',
        'lung': 'ఊపిరితిత్తి',
        'stomach': 'కడుపు',
        'skin': 'చర్మం',
        'bone': 'ఎముక',
        'blood': 'రక్తం',
        'cardiologist': 'హృదయ నిపుణుడు',
        'neurologist': 'నరాల నిపుణుడు',
        'orthopedic': 'ఎముకల నిపుణుడు',
        'dermatologist': 'చర్మ నిపుణుడు',
        'best treatment': 'ఉత్తమ చికిత్స',
        'top doctors': 'అగ్ర వైద్యులు',
        'best hospitals': 'ఉత్తమ ఆసుపత్రులు',
        'treatment cost': 'చికిత్స ఖర్చు',
        'book appointment': 'అపాయింట్‌మెంట్ బుక్ చేయండి',
        'find doctors': 'వైద్యులను కనుగొనండి',
        'near you': 'మీ సమీపంలో',
    },

    // ── Kannada (kn) ──────────────────────────────────────────────────────────
    kn: {
        'treatment': 'ಚಿಕಿತ್ಸೆ',
        'symptoms': 'ಲಕ್ಷಣಗಳು',
        'causes': 'ಕಾರಣಗಳು',
        'diagnosis': 'ರೋಗನಿರ್ಣಯ',
        'prevention': 'ತಡೆಗಟ್ಟುವಿಕೆ',
        'doctor': 'ವೈದ್ಯರು',
        'specialist': 'ತಜ್ಞರು',
        'hospital': 'ಆಸ್ಪತ್ರೆ',
        'patient': 'ರೋಗಿ',
        'medicine': 'ಔಷಧಿ',
        'consultation': 'ಸಮಾಲೋಚನೆ',
        'cost': 'ವೆಚ್ಚ',
        'recovery': 'ಚೇತರಿಕೆ',
        'surgery': 'ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ',
        'pain': 'ನೋವು',
        'fever': 'ಜ್ವರ',
        'infection': 'ಸೋಂಕು',
        'heart': 'ಹೃದಯ',
        'brain': 'ಮೆದುಳು',
        'liver': 'ಯಕೃತ್',
        'kidney': 'ಮೂತ್ರಪಿಂಡ',
        'lung': 'ಶ್ವಾಸಕೋಶ',
        'stomach': 'ಹೊಟ್ಟೆ',
        'skin': 'ಚರ್ಮ',
        'bone': 'ಮೂಳೆ',
        'blood': 'ರಕ್ತ',
        'cardiologist': 'ಹೃದ್ರೋಗ ತಜ್ಞ',
        'neurologist': 'ನರವಿಜ್ಞಾನಿ',
        'orthopedic': 'ಮೂಳೆ ತಜ್ಞ',
        'dermatologist': 'ಚರ್ಮ ತಜ್ಞ',
        'best treatment': 'ಅತ್ಯುತ್ತಮ ಚಿಕಿತ್ಸೆ',
        'top doctors': 'ಅಗ್ರ ವೈದ್ಯರು',
        'best hospitals': 'ಅತ್ಯುತ್ತಮ ಆಸ್ಪತ್ರೆಗಳು',
        'treatment cost': 'ಚಿಕಿತ್ಸೆ ವೆಚ್ಚ',
        'book appointment': 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
        'find doctors': 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ',
        'near you': 'ನಿಮ್ಮ ಬಳಿ',
    },

    // ── Malayalam (ml) ────────────────────────────────────────────────────────
    ml: {
        'treatment': 'ചികിത്സ',
        'symptoms': 'ലക്ഷണങ്ങൾ',
        'causes': 'കാരണങ്ങൾ',
        'diagnosis': 'രോഗനിർണയം',
        'prevention': 'പ്രതിരോധം',
        'doctor': 'ഡോക്ടർ',
        'specialist': 'വിദഗ്ധൻ',
        'hospital': 'ആശുപത്രി',
        'patient': 'രോഗി',
        'medicine': 'മരുന്ന്',
        'consultation': 'കൺസൾട്ടേഷൻ',
        'cost': 'ചെലവ്',
        'recovery': 'സുഖപ്പെടൽ',
        'surgery': 'ശസ്ത്രക്രിയ',
        'pain': 'വേദന',
        'fever': 'പനി',
        'infection': 'അണുബാധ',
        'heart': 'ഹൃദയം',
        'brain': 'മസ്തിഷ്കം',
        'liver': 'കരൾ',
        'kidney': 'വൃക്ക',
        'lung': 'ശ്വാസകോശം',
        'stomach': 'വയറ്',
        'skin': 'ത്വക്ക്',
        'bone': 'അസ്ഥി',
        'blood': 'രക്തം',
        'cardiologist': 'ഹൃദ്രോഗ വിദഗ്ധൻ',
        'neurologist': 'ന്യൂറോളജിസ്റ്റ്',
        'orthopedic': 'അസ്ഥി വിദഗ്ധൻ',
        'dermatologist': 'ത്വക്ക് വിദഗ്ധൻ',
        'best treatment': 'മികച്ച ചികിത്സ',
        'top doctors': 'മികച്ച ഡോക്ടർമാർ',
        'best hospitals': 'മികച്ച ആശുപത്രികൾ',
        'treatment cost': 'ചികിത്സാ ചെലവ്',
        'book appointment': 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',
        'find doctors': 'ഡോക്ടർമാരെ കണ്ടെത്തുക',
        'near you': 'നിങ്ങളുടെ അടുത്ത്',
    },

    // ── Marathi (mr) ──────────────────────────────────────────────────────────
    mr: {
        'treatment': 'उपचार',
        'symptoms': 'लक्षणे',
        'causes': 'कारणे',
        'diagnosis': 'निदान',
        'prevention': 'प्रतिबंध',
        'doctor': 'डॉक्टर',
        'specialist': 'तज्ञ',
        'hospital': 'रुग्णालय',
        'patient': 'रुग्ण',
        'medicine': 'औषध',
        'consultation': 'सल्ला',
        'cost': 'खर्च',
        'recovery': 'बरे होणे',
        'surgery': 'शस्त्रक्रिया',
        'pain': 'वेदना',
        'fever': 'ताप',
        'infection': 'संसर्ग',
        'heart': 'हृदय',
        'brain': 'मेंदू',
        'liver': 'यकृत',
        'kidney': 'मूत्रपिंड',
        'lung': 'फुफ्फुस',
        'stomach': 'पोट',
        'skin': 'त्वचा',
        'bone': 'हाड',
        'blood': 'रक्त',
        'cardiologist': 'हृदयरोग तज्ञ',
        'neurologist': 'न्यूरोलॉजिस्ट',
        'orthopedic': 'हाडांचे तज्ञ',
        'dermatologist': 'त्वचा तज्ञ',
        'best treatment': 'सर्वोत्तम उपचार',
        'top doctors': 'शीर्ष डॉक्टर',
        'best hospitals': 'सर्वोत्तम रुग्णालये',
        'treatment cost': 'उपचार खर्च',
        'book appointment': 'भेट बुक करा',
        'find doctors': 'डॉक्टर शोधा',
        'near you': 'तुमच्या जवळ',
    },

    // ── Bengali (bn) ──────────────────────────────────────────────────────────
    bn: {
        'treatment': 'চিকিৎসা',
        'symptoms': 'লক্ষণ',
        'causes': 'কারণ',
        'diagnosis': 'রোগ নির্ণয়',
        'prevention': 'প্রতিরোধ',
        'doctor': 'ডাক্তার',
        'specialist': 'বিশেষজ্ঞ',
        'hospital': 'হাসপাতাল',
        'patient': 'রোগী',
        'medicine': 'ওষুধ',
        'consultation': 'পরামর্শ',
        'cost': 'খরচ',
        'recovery': 'সুস্থতা',
        'surgery': 'অস্ত্রোপচার',
        'pain': 'ব্যথা',
        'fever': 'জ্বর',
        'infection': 'সংক্রমণ',
        'heart': 'হৃদয়',
        'brain': 'মস্তিষ্ক',
        'liver': 'যকৃত',
        'kidney': 'কিডনি',
        'lung': 'ফুসফুস',
        'stomach': 'পেট',
        'skin': 'ত্বক',
        'bone': 'হাড়',
        'blood': 'রক্ত',
        'cardiologist': 'হৃদরোগ বিশেষজ্ঞ',
        'neurologist': 'স্নায়ু বিশেষজ্ঞ',
        'orthopedic': 'হাড় বিশেষজ্ঞ',
        'dermatologist': 'চর্ম বিশেষজ্ঞ',
        'best treatment': 'সেরা চিকিৎসা',
        'top doctors': 'শীর্ষ ডাক্তার',
        'best hospitals': 'সেরা হাসপাতাল',
        'treatment cost': 'চিকিৎসা খরচ',
        'book appointment': 'অ্যাপয়েন্টমেন্ট বুক করুন',
        'find doctors': 'ডাক্তার খুঁজুন',
        'near you': 'আপনার কাছে',
    },

    // ── Gujarati (gu) ─────────────────────────────────────────────────────────
    gu: {
        'treatment': 'સારવાર',
        'symptoms': 'લક્ષણો',
        'causes': 'કારણો',
        'diagnosis': 'નિદાન',
        'prevention': 'નિવારણ',
        'doctor': 'ડૉક્ટર',
        'specialist': 'નિષ્ણાત',
        'hospital': 'હોસ્પિટલ',
        'patient': 'દર્દી',
        'medicine': 'દવા',
        'consultation': 'પરામર્શ',
        'cost': 'ખર્ચ',
        'recovery': 'સાજા થવું',
        'surgery': 'શસ્ત્રક્રિયા',
        'pain': 'દુખાવો',
        'fever': 'તાવ',
        'infection': 'ચેપ',
        'heart': 'હૃદય',
        'brain': 'મગજ',
        'liver': 'યકૃત',
        'kidney': 'કિડની',
        'lung': 'ફેફસાં',
        'stomach': 'પેટ',
        'skin': 'ત્વચા',
        'bone': 'હાડકું',
        'blood': 'લોહી',
        'cardiologist': 'હૃદય રોગ નિષ્ણાત',
        'neurologist': 'ન્યુરોલોજિસ્ટ',
        'orthopedic': 'હાડકાના નિષ્ણાત',
        'dermatologist': 'ત્વચા નિષ્ણાત',
        'best treatment': 'શ્રેષ્ઠ સારવાર',
        'top doctors': 'શ્રેષ્ઠ ડૉક્ટરો',
        'best hospitals': 'શ્રેષ્ઠ હોસ્પિટલો',
        'treatment cost': 'સારવાર ખર્ચ',
        'book appointment': 'એપોઇન્ટમેન્ટ બુક કરો',
        'find doctors': 'ડૉક્ટરો શોધો',
        'near you': 'તમારી નજીક',
    },

    // ── Punjabi (pa) ──────────────────────────────────────────────────────────
    pa: {
        'treatment': 'ਇਲਾਜ',
        'symptoms': 'ਲੱਛਣ',
        'causes': 'ਕਾਰਨ',
        'diagnosis': 'ਨਿਦਾਨ',
        'prevention': 'ਰੋਕਥਾਮ',
        'doctor': 'ਡਾਕਟਰ',
        'specialist': 'ਮਾਹਿਰ',
        'hospital': 'ਹਸਪਤਾਲ',
        'patient': 'ਮਰੀਜ਼',
        'medicine': 'ਦਵਾਈ',
        'consultation': 'ਸਲਾਹ',
        'cost': 'ਖਰਚਾ',
        'recovery': 'ਠੀਕ ਹੋਣਾ',
        'surgery': 'ਸਰਜਰੀ',
        'pain': 'ਦਰਦ',
        'fever': 'ਬੁਖਾਰ',
        'infection': 'ਲਾਗ',
        'heart': 'ਦਿਲ',
        'brain': 'ਦਿਮਾਗ',
        'liver': 'ਜਿਗਰ',
        'kidney': 'ਗੁਰਦਾ',
        'lung': 'ਫੇਫੜੇ',
        'stomach': 'ਪੇਟ',
        'skin': 'ਚਮੜੀ',
        'bone': 'ਹੱਡੀ',
        'blood': 'ਖੂਨ',
        'cardiologist': 'ਦਿਲ ਦੇ ਮਾਹਿਰ',
        'neurologist': 'ਨਿਊਰੋਲੋਜਿਸਟ',
        'orthopedic': 'ਹੱਡੀਆਂ ਦੇ ਮਾਹਿਰ',
        'dermatologist': 'ਚਮੜੀ ਮਾਹਿਰ',
        'best treatment': 'ਸਭ ਤੋਂ ਵਧੀਆ ਇਲਾਜ',
        'top doctors': 'ਸਿਖਰਲੇ ਡਾਕਟਰ',
        'best hospitals': 'ਸਭ ਤੋਂ ਵਧੀਆ ਹਸਪਤਾਲ',
        'treatment cost': 'ਇਲਾਜ ਦਾ ਖਰਚਾ',
        'book appointment': 'ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ',
        'find doctors': 'ਡਾਕਟਰ ਲੱਭੋ',
        'near you': 'ਤੁਹਾਡੇ ਨੇੜੇ',
    },

    // ── Odia (or) ─────────────────────────────────────────────────────────────
    or: {
        'treatment': 'ଚିକିତ୍ସା',
        'symptoms': 'ଲକ୍ଷଣ',
        'causes': 'କାରଣ',
        'diagnosis': 'ରୋଗ ନିର୍ଣୟ',
        'prevention': 'ପ୍ରତିରୋଧ',
        'doctor': 'ଡାକ୍ତର',
        'specialist': 'ବିଶେଷଜ୍ଞ',
        'hospital': 'ହସ୍ପିଟାଲ',
        'patient': 'ରୋଗୀ',
        'medicine': 'ଔଷଧ',
        'consultation': 'ପରାମର୍ଶ',
        'cost': 'ଖର୍ଚ୍ଚ',
        'recovery': 'ସୁସ୍ଥତା',
        'surgery': 'ଅସ୍ତ୍ରୋପଚାର',
        'pain': 'ଯନ୍ତ୍ରଣା',
        'fever': 'ଜ୍ୱର',
        'infection': 'ସଂକ୍ରମଣ',
        'heart': 'ହୃଦୟ',
        'brain': 'ମସ୍ତିଷ୍କ',
        'liver': 'ଯକୃତ',
        'kidney': 'ବୃକକ',
        'lung': 'ଫୁସଫୁସ',
        'stomach': 'ପେଟ',
        'skin': 'ଚର୍ମ',
        'bone': 'ହାଡ',
        'blood': 'ରକ୍ତ',
        'best treatment': 'ସର୍ବୋତ୍ତମ ଚିକିତ୍ସା',
        'top doctors': 'ଶ୍ରେଷ୍ଠ ଡାକ୍ତର',
        'best hospitals': 'ସର୍ବୋତ୍ତମ ହସ୍ପିଟାଲ',
        'treatment cost': 'ଚିକିତ୍ସା ଖର୍ଚ୍ଚ',
        'book appointment': 'ଆପଏଣ୍ଟମେଣ୍ଟ ବୁକ କରନ୍ତୁ',
        'find doctors': 'ଡାକ୍ତର ଖୋଜନ୍ତୁ',
        'near you': 'ଆପଣଙ୍କ ନିକଟରେ',
    },

    // ── Urdu (ur) ─────────────────────────────────────────────────────────────
    ur: {
        'treatment': 'علاج',
        'symptoms': 'علامات',
        'causes': 'وجوہات',
        'diagnosis': 'تشخیص',
        'prevention': 'روک تھام',
        'doctor': 'ڈاکٹر',
        'specialist': 'ماہر',
        'hospital': 'ہسپتال',
        'patient': 'مریض',
        'medicine': 'دوا',
        'consultation': 'مشاورت',
        'cost': 'لاگت',
        'recovery': 'صحت یابی',
        'surgery': 'سرجری',
        'pain': 'درد',
        'fever': 'بخار',
        'infection': 'انفیکشن',
        'heart': 'دل',
        'brain': 'دماغ',
        'liver': 'جگر',
        'kidney': 'گردہ',
        'lung': 'پھیپھڑے',
        'stomach': 'پیٹ',
        'skin': 'جلد',
        'bone': 'ہڈی',
        'blood': 'خون',
        'best treatment': 'بہترین علاج',
        'top doctors': 'بہترین ڈاکٹر',
        'best hospitals': 'بہترین ہسپتال',
        'treatment cost': 'علاج کی لاگت',
        'book appointment': 'ملاقات بک کریں',
        'find doctors': 'ڈاکٹر تلاش کریں',
        'near you': 'آپ کے قریب',
    },

    // ── Arabic (ar) ───────────────────────────────────────────────────────────
    ar: {
        'treatment': 'علاج',
        'symptoms': 'الأعراض',
        'causes': 'الأسباب',
        'diagnosis': 'التشخيص',
        'prevention': 'الوقاية',
        'doctor': 'طبيب',
        'specialist': 'أخصائي',
        'hospital': 'مستشفى',
        'patient': 'مريض',
        'medicine': 'دواء',
        'consultation': 'استشارة',
        'cost': 'التكلفة',
        'recovery': 'الشفاء',
        'surgery': 'جراحة',
        'pain': 'ألم',
        'fever': 'حمى',
        'infection': 'عدوى',
        'heart': 'قلب',
        'brain': 'دماغ',
        'liver': 'كبد',
        'kidney': 'كلية',
        'lung': 'رئة',
        'stomach': 'معدة',
        'skin': 'جلد',
        'bone': 'عظم',
        'blood': 'دم',
        'best treatment': 'أفضل علاج',
        'top doctors': 'أفضل الأطباء',
        'best hospitals': 'أفضل المستشفيات',
        'treatment cost': 'تكلفة العلاج',
        'book appointment': 'حجز موعد',
        'find doctors': 'البحث عن أطباء',
        'near you': 'بالقرب منك',
    },

    // ── Spanish (es) ──────────────────────────────────────────────────────────
    es: {
        'treatment': 'tratamiento',
        'symptoms': 'síntomas',
        'causes': 'causas',
        'diagnosis': 'diagnóstico',
        'prevention': 'prevención',
        'doctor': 'médico',
        'specialist': 'especialista',
        'hospital': 'hospital',
        'patient': 'paciente',
        'medicine': 'medicina',
        'consultation': 'consulta',
        'cost': 'costo',
        'recovery': 'recuperación',
        'surgery': 'cirugía',
        'pain': 'dolor',
        'fever': 'fiebre',
        'infection': 'infección',
        'heart': 'corazón',
        'brain': 'cerebro',
        'liver': 'hígado',
        'kidney': 'riñón',
        'lung': 'pulmón',
        'stomach': 'estómago',
        'skin': 'piel',
        'bone': 'hueso',
        'blood': 'sangre',
        'best treatment': 'mejor tratamiento',
        'top doctors': 'mejores médicos',
        'best hospitals': 'mejores hospitales',
        'treatment cost': 'costo del tratamiento',
        'book appointment': 'reservar cita',
        'find doctors': 'buscar médicos',
        'near you': 'cerca de ti',
    },

    // ── French (fr) ───────────────────────────────────────────────────────────
    fr: {
        'treatment': 'traitement',
        'symptoms': 'symptômes',
        'causes': 'causes',
        'diagnosis': 'diagnostic',
        'prevention': 'prévention',
        'doctor': 'médecin',
        'specialist': 'spécialiste',
        'hospital': 'hôpital',
        'patient': 'patient',
        'medicine': 'médicament',
        'consultation': 'consultation',
        'cost': 'coût',
        'recovery': 'récupération',
        'surgery': 'chirurgie',
        'pain': 'douleur',
        'fever': 'fièvre',
        'infection': 'infection',
        'heart': 'cœur',
        'brain': 'cerveau',
        'liver': 'foie',
        'kidney': 'rein',
        'lung': 'poumon',
        'stomach': 'estomac',
        'skin': 'peau',
        'bone': 'os',
        'blood': 'sang',
        'best treatment': 'meilleur traitement',
        'top doctors': 'meilleurs médecins',
        'best hospitals': 'meilleurs hôpitaux',
        'treatment cost': 'coût du traitement',
        'book appointment': 'prendre rendez-vous',
        'find doctors': 'trouver des médecins',
        'near you': 'près de chez vous',
    },

    // ── Portuguese (pt) ───────────────────────────────────────────────────────
    pt: {
        'treatment': 'tratamento',
        'symptoms': 'sintomas',
        'causes': 'causas',
        'diagnosis': 'diagnóstico',
        'prevention': 'prevenção',
        'doctor': 'médico',
        'specialist': 'especialista',
        'hospital': 'hospital',
        'patient': 'paciente',
        'medicine': 'medicamento',
        'consultation': 'consulta',
        'cost': 'custo',
        'recovery': 'recuperação',
        'surgery': 'cirurgia',
        'pain': 'dor',
        'fever': 'febre',
        'infection': 'infecção',
        'heart': 'coração',
        'brain': 'cérebro',
        'liver': 'fígado',
        'kidney': 'rim',
        'lung': 'pulmão',
        'stomach': 'estômago',
        'skin': 'pele',
        'bone': 'osso',
        'blood': 'sangue',
        'best treatment': 'melhor tratamento',
        'top doctors': 'melhores médicos',
        'best hospitals': 'melhores hospitais',
        'treatment cost': 'custo do tratamento',
        'book appointment': 'agendar consulta',
        'find doctors': 'encontrar médicos',
        'near you': 'perto de você',
    },

    // ── German (de) ───────────────────────────────────────────────────────────
    de: {
        'treatment': 'Behandlung',
        'symptoms': 'Symptome',
        'causes': 'Ursachen',
        'diagnosis': 'Diagnose',
        'prevention': 'Prävention',
        'doctor': 'Arzt',
        'specialist': 'Spezialist',
        'hospital': 'Krankenhaus',
        'patient': 'Patient',
        'medicine': 'Medikament',
        'consultation': 'Beratung',
        'cost': 'Kosten',
        'recovery': 'Genesung',
        'surgery': 'Operation',
        'pain': 'Schmerz',
        'fever': 'Fieber',
        'infection': 'Infektion',
        'heart': 'Herz',
        'brain': 'Gehirn',
        'liver': 'Leber',
        'kidney': 'Niere',
        'lung': 'Lunge',
        'stomach': 'Magen',
        'skin': 'Haut',
        'bone': 'Knochen',
        'blood': 'Blut',
        'best treatment': 'beste Behandlung',
        'top doctors': 'Top-Ärzte',
        'best hospitals': 'beste Krankenhäuser',
        'treatment cost': 'Behandlungskosten',
        'book appointment': 'Termin buchen',
        'find doctors': 'Ärzte finden',
        'near you': 'in Ihrer Nähe',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// CONDITION NAME TRANSLATIONS
// ══════════════════════════════════════════════════════════════════════════════

const CONDITION_TRANSLATIONS: Record<string, Record<string, string>> = {
    // ── Common Conditions - Hindi ─────────────────────────────────────────────
    hi: {
        'diabetes': 'मधुमेह',
        'diabetes mellitus': 'मधुमेह',
        'type 2 diabetes': 'टाइप 2 मधुमेह',
        'type 1 diabetes': 'टाइप 1 मधुमेह',
        'hypertension': 'उच्च रक्तचाप',
        'high blood pressure': 'उच्च रक्तचाप',
        'heart disease': 'हृदय रोग',
        'coronary artery disease': 'कोरोनरी धमनी रोग',
        'heart attack': 'दिल का दौरा',
        'stroke': 'स्ट्रोक',
        'asthma': 'दमा',
        'arthritis': 'गठिया',
        'rheumatoid arthritis': 'रूमेटोइड गठिया',
        'osteoarthritis': 'ऑस्टियोआर्थराइटिस',
        'back pain': 'पीठ दर्द',
        'migraine': 'माइग्रेन',
        'headache': 'सिरदर्द',
        'depression': 'अवसाद',
        'anxiety': 'चिंता',
        'obesity': 'मोटापा',
        'thyroid': 'थायराइड',
        'hypothyroidism': 'हाइपोथायरायडिज्म',
        'hyperthyroidism': 'हाइपरथायरायडिज्म',
        'cancer': 'कैंसर',
        'breast cancer': 'स्तन कैंसर',
        'lung cancer': 'फेफड़े का कैंसर',
        'kidney disease': 'गुर्दे की बीमारी',
        'liver disease': 'यकृत रोग',
        'pneumonia': 'निमोनिया',
        'tuberculosis': 'टीबी',
        'malaria': 'मलेरिया',
        'dengue': 'डेंगू',
        'covid-19': 'कोविड-19',
        'allergies': 'एलर्जी',
        'skin allergy': 'त्वचा एलर्जी',
        'eczema': 'एक्जिमा',
        'psoriasis': 'सोरायसिस',
        'acne': 'मुंहासे',
        'hair loss': 'बाल झड़ना',
        'gastritis': 'गैस्ट्राइटिस',
        'acid reflux': 'एसिड रिफ्लक्स',
        'ulcer': 'अल्सर',
        'constipation': 'कब्ज',
        'diarrhea': 'दस्त',
        'hemorrhoids': 'बवासीर',
        'hernia': 'हर्निया',
        'appendicitis': 'अपेंडिसाइटिस',
        'gallstones': 'पित्त की पथरी',
        'kidney stones': 'गुर्दे की पथरी',
        'urinary tract infection': 'मूत्र पथ संक्रमण',
        'prostate': 'प्रोस्टेट',
        'erectile dysfunction': 'स्तंभन दोष',
        'infertility': 'बांझपन',
        'pcos': 'पीसीओएस',
        'endometriosis': 'एंडोमेट्रियोसिस',
        'menopause': 'रजोनिवृत्ति',
        'pregnancy': 'गर्भावस्था',
        'anemia': 'एनीमिया',
        'vitamin deficiency': 'विटामिन की कमी',
        'osteoporosis': 'ऑस्टियोपोरोसिस',
        'fracture': 'फ्रैक्चर',
        'sprain': 'मोच',
        'slip disc': 'स्लिप डिस्क',
        'sciatica': 'साइटिका',
        'cervical spondylosis': 'सर्वाइकल स्पोंडिलोसिस',
        'carpal tunnel syndrome': 'कार्पल टनल सिंड्रोम',
        'cataract': 'मोतियाबिंद',
        'glaucoma': 'ग्लूकोमा',
        'conjunctivitis': 'आंख आना',
        'hearing loss': 'श्रवण हानि',
        'tinnitus': 'टिनिटस',
        'sinusitis': 'साइनसाइटिस',
        'tonsillitis': 'टॉन्सिलाइटिस',
        'bronchitis': 'ब्रोंकाइटिस',
        'copd': 'सीओपीडी',
        'sleep apnea': 'स्लीप एपनिया',
        'insomnia': 'अनिद्रा',
        'alzheimer': 'अल्जाइमर',
        'parkinson': 'पार्किंसन',
        'epilepsy': 'मिर्गी',
        'multiple sclerosis': 'मल्टीपल स्क्लेरोसिस',
        'cerebral palsy': 'सेरेब्रल पाल्सी',
        'autism': 'ऑटिज्म',
        'adhd': 'एडीएचडी',
        'schizophrenia': 'सिज़ोफ्रेनिया',
        'bipolar disorder': 'द्विध्रुवी विकार',
    },

    // ── Tamil ─────────────────────────────────────────────────────────────────
    ta: {
        'diabetes': 'நீரிழிவு',
        'hypertension': 'உயர் இரத்த அழுத்தம்',
        'heart disease': 'இதய நோய்',
        'asthma': 'ஆஸ்துமா',
        'arthritis': 'மூட்டுவலி',
        'back pain': 'முதுகு வலி',
        'migraine': 'ஒற்றைத் தலைவலி',
        'depression': 'மனச்சோர்வு',
        'obesity': 'உடல் பருமன்',
        'thyroid': 'தைராய்டு',
        'cancer': 'புற்றுநோய்',
        'kidney disease': 'சிறுநீரக நோய்',
        'liver disease': 'கல்லீரல் நோய்',
        'tuberculosis': 'காசநோய்',
        'malaria': 'மலேரியா',
        'dengue': 'டெங்கு',
        'allergies': 'ஒவ்வாமை',
        'acne': 'முகப்பரு',
        'gastritis': 'இரைப்பை அழற்சி',
        'constipation': 'மலச்சிக்கல்',
        'hemorrhoids': 'மூலம்',
        'kidney stones': 'சிறுநீரக கற்கள்',
        'anemia': 'இரத்த சோகை',
        'cataract': 'கண்புரை',
        'sinusitis': 'சைனசைட்டிஸ்',
    },

    // ── Telugu ────────────────────────────────────────────────────────────────
    te: {
        'diabetes': 'మధుమేహం',
        'hypertension': 'అధిక రక్తపోటు',
        'heart disease': 'గుండె జబ్బు',
        'asthma': 'ఆస్తమా',
        'arthritis': 'కీళ్ల వాతం',
        'back pain': 'నడుము నొప్పి',
        'migraine': 'మైగ్రేన్',
        'depression': 'నిరాశ',
        'obesity': 'ఊబకాయం',
        'thyroid': 'థైరాయిడ్',
        'cancer': 'క్యాన్సర్',
        'kidney disease': 'మూత్రపిండాల వ్యాధి',
        'tuberculosis': 'క్షయ',
        'dengue': 'డెంగ్యూ',
        'allergies': 'అలెర్జీలు',
        'acne': 'మొటిమలు',
        'constipation': 'మలబద్ధకం',
        'anemia': 'రక్తహీనత',
        'cataract': 'కంటి పొర',
    },

    // Add more languages as needed...
};

// ══════════════════════════════════════════════════════════════════════════════
// CITY/LOCATION NAMES
// ══════════════════════════════════════════════════════════════════════════════

const CITY_TRANSLATIONS: Record<string, Record<string, string>> = {
    hi: {
        'delhi': 'दिल्ली',
        'mumbai': 'मुंबई',
        'bangalore': 'बैंगलोर',
        'chennai': 'चेन्नई',
        'kolkata': 'कोलकाता',
        'hyderabad': 'हैदराबाद',
        'pune': 'पुणे',
        'ahmedabad': 'अहमदाबाद',
        'jaipur': 'जयपुर',
        'lucknow': 'लखनऊ',
        'chandigarh': 'चंडीगढ़',
        'kochi': 'कोच्चि',
        'indore': 'इंदौर',
        'bhopal': 'भोपाल',
        'patna': 'पटना',
        'noida': 'नोएडा',
        'gurgaon': 'गुरुग्राम',
        'india': 'भारत',
    },
    ta: {
        'chennai': 'சென்னை',
        'coimbatore': 'கோயம்புத்தூர்',
        'madurai': 'மதுரை',
        'trichy': 'திருச்சி',
        'salem': 'சேலம்',
        'india': 'இந்தியா',
    },
    te: {
        'hyderabad': 'హైదరాబాద్',
        'vijayawada': 'విజయవాడ',
        'visakhapatnam': 'విశాఖపట్నం',
        'tirupati': 'తిరుపతి',
        'india': 'భారతదేశం',
    },
    kn: {
        'bangalore': 'ಬೆಂಗಳೂರು',
        'mysore': 'ಮೈಸೂರು',
        'mangalore': 'ಮಂಗಳೂರು',
        'hubli': 'ಹುಬ್ಬಳ್ಳಿ',
        'india': 'ಭಾರತ',
    },
    ml: {
        'kochi': 'കൊച്ചി',
        'thiruvananthapuram': 'തിരുവനന്തപുരം',
        'kozhikode': 'കോഴിക്കോട്',
        'thrissur': 'തൃശ്ശൂർ',
        'india': 'ഇന്ത്യ',
    },
    mr: {
        'mumbai': 'मुंबई',
        'pune': 'पुणे',
        'nagpur': 'नागपूर',
        'nashik': 'नाशिक',
        'india': 'भारत',
    },
    bn: {
        'kolkata': 'কলকাতা',
        'howrah': 'হাওড়া',
        'durgapur': 'দুর্গাপুর',
        'siliguri': 'শিলিগুড়ি',
        'india': 'ভারত',
    },
    gu: {
        'ahmedabad': 'અમદાવાદ',
        'surat': 'સુરત',
        'vadodara': 'વડોદરા',
        'rajkot': 'રાજકોટ',
        'india': 'ભારત',
    },
    pa: {
        'chandigarh': 'ਚੰਡੀਗੜ੍ਹ',
        'amritsar': 'ਅੰਮ੍ਰਿਤਸਰ',
        'ludhiana': 'ਲੁਧਿਆਣਾ',
        'jalandhar': 'ਜਲੰਧਰ',
        'india': 'ਭਾਰਤ',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE-BASED TRANSLATION
// ══════════════════════════════════════════════════════════════════════════════

interface TranslatedContent {
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    localizedAdvice: string;
}

function translateConditionName(name: string, lang: string): string {
    const lowerName = name.toLowerCase();
    const translations = CONDITION_TRANSLATIONS[lang];
    if (translations && translations[lowerName]) {
        return translations[lowerName];
    }
    // Return original if no translation found
    return name;
}

function translateCity(city: string, lang: string): string {
    const lowerCity = city.toLowerCase();
    const translations = CITY_TRANSLATIONS[lang];
    if (translations && translations[lowerCity]) {
        return translations[lowerCity];
    }
    return city;
}

function getTerm(term: string, lang: string): string {
    const terms = MEDICAL_TERMS[lang];
    if (terms && terms[term]) {
        return terms[term];
    }
    return term;
}

function generateTranslatedContent(
    conditionName: string,
    description: string,
    symptoms: any[],
    treatments: any[],
    lang: string,
    cityName: string,
    countryName: string
): TranslatedContent {
    const translatedCondition = translateConditionName(conditionName, lang);
    const translatedCity = translateCity(cityName, lang);
    const translatedCountry = translateCity(countryName, lang);

    const treatmentWord = getTerm('treatment', lang);
    const symptomsWord = getTerm('symptoms', lang);
    const doctorWord = getTerm('doctor', lang);
    const hospitalWord = getTerm('hospital', lang);
    const bestWord = getTerm('best treatment', lang);
    const costWord = getTerm('treatment cost', lang);
    const specialistWord = getTerm('specialist', lang);
    const consultWord = getTerm('consultation', lang);

    // Generate title
    const title = `${translatedCondition} ${treatmentWord} - ${translatedCity} | ${bestWord}`;

    // Generate meta title (under 60 chars)
    const metaTitle = `${translatedCondition} ${treatmentWord} ${translatedCity} | AIHEALZ`.substring(0, 60);

    // Generate meta description (under 160 chars)
    const metaDescription = `${translatedCondition} ${treatmentWord} ${translatedCity}. ${bestWord}, ${doctorWord}, ${hospitalWord}. ${costWord}.`.substring(0, 155);

    // Generate localized advice
    const localizedAdvice = generateLocalizedAdvice(translatedCondition, translatedCity, lang);

    // Generate description with translated terms
    const translatedDescription = generateDescription(
        translatedCondition,
        description,
        translatedCity,
        lang
    );

    return {
        title,
        description: translatedDescription,
        metaTitle,
        metaDescription,
        localizedAdvice,
    };
}

function generateLocalizedAdvice(condition: string, city: string, lang: string): string {
    const templates: Record<string, string> = {
        hi: `${city} में ${condition} के लिए विशेषज्ञ डॉक्टरों से मिलें। अपने पास के अस्पतालों में सर्वोत्तम उपचार प्राप्त करें। समय पर निदान और उचित देखभाल महत्वपूर्ण है।`,
        ta: `${city} இல் ${condition} க்கான சிறந்த மருத்துவர்களை சந்தியுங்கள். உங்கள் அருகிலுள்ள மருத்துவமனைகளில் சிறந்த சிகிச்சை பெறுங்கள்.`,
        te: `${city} లో ${condition} కోసం నిపుణుల వైద్యులను సంప్రదించండి. మీ సమీపంలోని ఆసుపత్రులలో ఉత్తమ చికిత్స పొందండి.`,
        kn: `${city} ನಲ್ಲಿ ${condition} ಗಾಗಿ ತಜ್ಞ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ. ನಿಮ್ಮ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಚಿಕಿತ್ಸೆ ಪಡೆಯಿರಿ.`,
        ml: `${city} ൽ ${condition} നായി വിദഗ്ധ ഡോക്ടർമാരെ കാണുക. നിങ്ങളുടെ അടുത്തുള്ള ആശുപത്രികളിൽ മികച്ച ചികിത്സ നേടുക.`,
        mr: `${city} मध्ये ${condition} साठी तज्ञ डॉक्टरांना भेटा. तुमच्या जवळच्या रुग्णालयांमध्ये सर्वोत्तम उपचार मिळवा.`,
        bn: `${city} তে ${condition} এর জন্য বিশেষজ্ঞ ডাক্তারদের সাথে দেখা করুন। আপনার কাছের হাসপাতালে সেরা চিকিৎসা পান।`,
        gu: `${city} માં ${condition} માટે નિષ્ણાત ડૉક્ટરોને મળો. તમારી નજીકની હોસ્પિટલોમાં શ્રેષ્ઠ સારવાર મેળવો.`,
        pa: `${city} ਵਿੱਚ ${condition} ਲਈ ਮਾਹਿਰ ਡਾਕਟਰਾਂ ਨਾਲ ਮਿਲੋ। ਆਪਣੇ ਨੇੜੇ ਦੇ ਹਸਪਤਾਲਾਂ ਵਿੱਚ ਸਭ ਤੋਂ ਵਧੀਆ ਇਲਾਜ ਪ੍ਰਾਪਤ ਕਰੋ।`,
        ur: `${city} میں ${condition} کے لیے ماہر ڈاکٹروں سے ملیں۔ اپنے قریبی ہسپتالوں میں بہترین علاج حاصل کریں۔`,
        ar: `احصل على أفضل علاج لـ ${condition} في ${city}. استشر الأطباء المتخصصين في المستشفيات القريبة منك.`,
        es: `Encuentre el mejor tratamiento para ${condition} en ${city}. Consulte especialistas en hospitales cercanos.`,
        fr: `Trouvez le meilleur traitement pour ${condition} à ${city}. Consultez des spécialistes dans les hôpitaux proches.`,
        pt: `Encontre o melhor tratamento para ${condition} em ${city}. Consulte especialistas em hospitais próximos.`,
        de: `Finden Sie die beste Behandlung für ${condition} in ${city}. Konsultieren Sie Spezialisten in Krankenhäusern in Ihrer Nähe.`,
    };

    return templates[lang] || templates['hi'];
}

function generateDescription(
    condition: string,
    originalDesc: string,
    city: string,
    lang: string
): string {
    const treatmentWord = getTerm('treatment', lang);
    const symptomsWord = getTerm('symptoms', lang);
    const doctorWord = getTerm('specialist', lang);
    const hospitalWord = getTerm('hospital', lang);

    const templates: Record<string, string> = {
        hi: `${condition} एक सामान्य स्वास्थ्य स्थिति है जो कई लोगों को प्रभावित करती है। ${city} में ${condition} के ${treatmentWord} के लिए अनुभवी ${doctorWord} और आधुनिक ${hospitalWord} उपलब्ध हैं। समय पर निदान और उचित ${treatmentWord} से इस स्थिति को प्रभावी ढंग से प्रबंधित किया जा सकता है।`,

        ta: `${condition} என்பது பலரை பாதிக்கும் ஒரு பொதுவான உடல்நல நிலை. ${city} இல் ${condition} ${treatmentWord} க்கு அனுபவம் வாய்ந்த ${doctorWord} மற்றும் நவீன ${hospitalWord} கள் உள்ளன. சரியான நேரத்தில் கண்டறிதல் மற்றும் சரியான ${treatmentWord} மூலம் இந்த நிலையை திறம்பட நிர்வகிக்க முடியும்.`,

        te: `${condition} అనేది చాలా మందిని ప్రభావితం చేసే సాధారణ ఆరోగ్య పరిస్థితి. ${city} లో ${condition} ${treatmentWord} కోసం అనుభవజ్ఞులైన ${doctorWord} మరియు ఆధునిక ${hospitalWord} లు అందుబాటులో ఉన్నాయి.`,

        kn: `${condition} ಅನೇಕ ಜನರ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುವ ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಸ್ಥಿತಿಯಾಗಿದೆ. ${city} ನಲ್ಲಿ ${condition} ${treatmentWord} ಗಾಗಿ ಅನುಭವಿ ${doctorWord} ಮತ್ತು ಆಧುನಿಕ ${hospitalWord} ಗಳು ಲಭ್ಯವಿವೆ.`,

        ml: `${condition} പലരെയും ബാധിക്കുന്ന ഒരു സാധാരണ ആരോഗ്യ അവസ്ഥയാണ്. ${city} ൽ ${condition} ${treatmentWord} ന് പരിചയസമ്പന്നരായ ${doctorWord} ഉം ആധുനിക ${hospitalWord} കളും ലഭ്യമാണ്.`,

        mr: `${condition} ही एक सामान्य आरोग्य स्थिती आहे जी अनेकांना प्रभावित करते. ${city} मध्ये ${condition} ${treatmentWord} साठी अनुभवी ${doctorWord} आणि आधुनिक ${hospitalWord} उपलब्ध आहेत.`,

        bn: `${condition} একটি সাধারণ স্বাস্থ্য অবস্থা যা অনেককে প্রভাবিত করে। ${city} তে ${condition} ${treatmentWord} এর জন্য অভিজ্ঞ ${doctorWord} এবং আধুনিক ${hospitalWord} উপলব্ধ।`,

        gu: `${condition} એક સામાન્ય આરોગ્ય સ્થિતિ છે જે ઘણા લોકોને અસર કરે છે. ${city} માં ${condition} ${treatmentWord} માટે અનુભવી ${doctorWord} અને આધુનિક ${hospitalWord} ઉપલબ્ધ છે.`,

        pa: `${condition} ਇੱਕ ਆਮ ਸਿਹਤ ਸਥਿਤੀ ਹੈ ਜੋ ਬਹੁਤ ਸਾਰੇ ਲੋਕਾਂ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰਦੀ ਹੈ। ${city} ਵਿੱਚ ${condition} ${treatmentWord} ਲਈ ਤਜਰਬੇਕਾਰ ${doctorWord} ਅਤੇ ਆਧੁਨਿਕ ${hospitalWord} ਉਪਲਬਧ ਹਨ।`,

        ar: `${condition} هي حالة صحية شائعة تؤثر على كثيرين. تتوفر في ${city} أطباء متخصصون ومستشفيات حديثة لعلاج ${condition}.`,

        es: `${condition} es una condición de salud común que afecta a muchas personas. En ${city} hay especialistas experimentados y hospitales modernos disponibles para el tratamiento de ${condition}.`,

        fr: `${condition} est une condition de santé courante qui affecte de nombreuses personnes. À ${city}, des spécialistes expérimentés et des hôpitaux modernes sont disponibles pour le traitement de ${condition}.`,

        pt: `${condition} é uma condição de saúde comum que afeta muitas pessoas. Em ${city}, especialistas experientes e hospitais modernos estão disponíveis para o tratamento de ${condition}.`,

        de: `${condition} ist eine häufige Gesundheitszustand, der viele Menschen betrifft. In ${city} stehen erfahrene Spezialisten und moderne Krankenhäuser für die Behandlung von ${condition} zur Verfügung.`,
    };

    return templates[lang] || originalDesc;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PROCESSING
// ══════════════════════════════════════════════════════════════════════════════

async function processConditions(options: {
    limit?: number;
    lang?: string;
    offset?: number;
    country?: string;
}) {
    const targetLang = options.lang || 'hi';
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const countrySlug = options.country || 'india';

    console.log(`\n📝 Manual Translation Pipeline`);
    console.log(`Language: ${targetLang}`);
    console.log(`Country: ${countrySlug}`);
    console.log(`Limit: ${limit}, Offset: ${offset}`);
    console.log('═'.repeat(60));

    // Get the country geography
    const countryGeo = await prisma.geography.findFirst({
        where: { slug: countrySlug, level: 'country' },
        select: { id: true, name: true },
    });

    if (!countryGeo) {
        console.error(`Country '${countrySlug}' not found in geography table`);
        return;
    }

    console.log(`Using geography: ${countryGeo.name} (ID: ${countryGeo.id})`);

    // Get conditions
    const conditions = await prisma.medicalCondition.findMany({
        where: { isActive: true },
        select: {
            id: true,
            slug: true,
            commonName: true,
            description: true,
            symptoms: true,
            treatments: true,
        },
        take: limit,
        skip: offset,
        orderBy: { commonName: 'asc' },
    });

    console.log(`Found ${conditions.length} conditions to process`);

    let processed = 0;
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const condition of conditions) {
        try {
            // Generate translation for national level
            const translated = generateTranslatedContent(
                condition.commonName,
                condition.description || '',
                (condition.symptoms as any[]) || [],
                (condition.treatments as any[]) || [],
                targetLang,
                countryGeo.name,
                countryGeo.name
            );

            // Upsert localized content
            const result = await prisma.localizedContent.upsert({
                where: {
                    conditionId_languageCode_geographyId: {
                        conditionId: condition.id,
                        languageCode: targetLang,
                        geographyId: countryGeo.id,
                    },
                },
                create: {
                    conditionId: condition.id,
                    languageCode: targetLang,
                    geographyId: countryGeo.id,
                    title: translated.title,
                    description: translated.description,
                    metaTitle: translated.metaTitle,
                    metaDescription: translated.metaDescription,
                    localizedAdvice: translated.localizedAdvice,
                    aiModelUsed: 'manual-template-v1',
                    wordCount: translated.description.split(/\s+/).length,
                },
                update: {
                    title: translated.title,
                    description: translated.description,
                    metaTitle: translated.metaTitle,
                    metaDescription: translated.metaDescription,
                    localizedAdvice: translated.localizedAdvice,
                    updatedAt: new Date(),
                },
            });

            processed++;
            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                created++;
            } else {
                updated++;
            }

            if (processed % 50 === 0) {
                console.log(`  Processed: ${processed}/${conditions.length}`);
            }
        } catch (error: any) {
            errors++;
            console.error(`  ❌ Error processing ${condition.slug}: ${error.message}`);
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Completed!`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// BATCH PROCESSING
// ══════════════════════════════════════════════════════════════════════════════

const INDIAN_LANGUAGES = ['hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'or', 'ur'];
const GLOBAL_LANGUAGES = ['ar', 'es', 'fr', 'pt', 'de'];

async function processAllLanguages(options: {
    limit?: number;
    offset?: number;
    country?: string;
    languages?: string[];
}) {
    const languages = options.languages || INDIAN_LANGUAGES;

    console.log('\n🌍 Batch Translation Pipeline');
    console.log(`Languages: ${languages.join(', ')}`);
    console.log('═'.repeat(60));

    const stats = {
        totalProcessed: 0,
        totalCreated: 0,
        totalUpdated: 0,
        totalErrors: 0,
    };

    for (const lang of languages) {
        console.log(`\n📝 Processing language: ${lang}`);

        await processConditions({
            lang,
            limit: options.limit,
            offset: options.offset,
            country: options.country,
        });
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 All languages completed!');
}

// ══════════════════════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);

    const options: any = {};
    let allLangs = false;
    let globalLangs = false;

    for (const arg of args) {
        if (arg.startsWith('--lang=')) {
            options.lang = arg.split('=')[1];
        } else if (arg.startsWith('--limit=')) {
            options.limit = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--offset=')) {
            options.offset = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--country=')) {
            options.country = arg.split('=')[1];
        } else if (arg === '--all-indian') {
            allLangs = true;
        } else if (arg === '--all-global') {
            globalLangs = true;
        } else if (arg === '--help') {
            console.log(`
Manual Translation Pipeline

Usage:
  npx tsx scripts/manual-translations.ts [options]

Options:
  --lang=XX          Single language code (hi, ta, te, etc.)
  --limit=N          Number of conditions to process (default: 100)
  --offset=N         Starting offset (default: 0)
  --country=slug     Country slug (default: india)
  --all-indian       Process all Indian languages
  --all-global       Process global languages (ar, es, fr, pt, de)
  --help             Show this help

Examples:
  npx tsx scripts/manual-translations.ts --lang=hi --limit=1000
  npx tsx scripts/manual-translations.ts --all-indian --limit=500
  npx tsx scripts/manual-translations.ts --all-global --limit=500
`);
            process.exit(0);
        }
    }

    try {
        if (allLangs) {
            await processAllLanguages({
                languages: INDIAN_LANGUAGES,
                limit: options.limit,
                offset: options.offset,
                country: options.country,
            });
        } else if (globalLangs) {
            await processAllLanguages({
                languages: GLOBAL_LANGUAGES,
                limit: options.limit,
                offset: options.offset,
                country: options.country,
            });
        } else {
            await processConditions(options);
        }
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
