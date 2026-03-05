/**
 * Populate Simple Names, Regional Tags & Search Keywords
 *
 * This script adds:
 * 1. Simple/non-medical names in local languages (e.g., "Diabetes" → "मधुमेह" / "Sugar Ki Bimari")
 * 2. Regional name variations (different regions call conditions differently)
 * 3. Symptom-based keywords for search
 * 4. Combined search tags for the search bar
 *
 * Usage:
 *   npx tsx scripts/populate-simple-names.ts --lang=hi --limit=1000
 *   npx tsx scripts/populate-simple-names.ts --all --limit=25000
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
// CONDITION NAME MAPPINGS - Medical to Simple/Common Names
// ============================================================================

interface ConditionNameMapping {
    medical: string; // English medical term (commonName in DB)
    simple: Record<string, string>; // Simple name by language
    regional: Array<{ name: string; region: string; lang: string }>; // Regional variations
    symptoms: string[]; // Common symptom keywords
}

// Major conditions with their simple names and regional variations
const CONDITION_MAPPINGS: Record<string, ConditionNameMapping> = {
    // DIABETES
    'diabetes': {
        medical: 'Diabetes',
        simple: {
            en: 'Sugar Disease',
            hi: 'मधुमेह / शुगर की बीमारी',
            ta: 'நீரிழிவு நோய் / சர்க்கரை வியாதி',
            te: 'మధుమేహం / షుగర్ వ్యాధి',
            kn: 'ಮಧುಮೇಹ / ಸಕ್ಕರೆ ಕಾಯಿಲೆ',
            ml: 'പ്രമേഹം / ഷുഗർ രോഗം',
            mr: 'मधुमेह / साखरेचा आजार',
            bn: 'ডায়াবেটিস / বহুমূত্র',
            gu: 'મધુપ્રમેહ / ખાંડનો રોગ',
            pa: 'ਸ਼ੂਗਰ / ਮਧੁਮੇਹ',
            or: 'ମଧୁମେହ / ଶୁଗର ରୋଗ',
            ur: 'ذیابیطس / شوگر کی بیماری',
            ar: 'السكري / مرض السكر',
            es: 'Diabetes / Azúcar en sangre alta',
            fr: 'Diabète / Maladie du sucre',
            pt: 'Diabetes / Doença do açúcar',
            de: 'Diabetes / Zuckerkrankheit',
        },
        regional: [
            { name: 'शुगर', region: 'North India', lang: 'hi' },
            { name: 'मीठी बीमारी', region: 'Rajasthan', lang: 'hi' },
            { name: 'சக்கரை', region: 'Tamil Nadu', lang: 'ta' },
            { name: 'షుగర్', region: 'Andhra/Telangana', lang: 'te' },
            { name: 'সুগার', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['frequent urination', 'excessive thirst', 'weight loss', 'fatigue', 'blurred vision'],
    },

    // HYPERTENSION / HIGH BLOOD PRESSURE
    'hypertension': {
        medical: 'Hypertension',
        simple: {
            en: 'High Blood Pressure',
            hi: 'उच्च रक्तचाप / हाई बीपी',
            ta: 'உயர் இரத்த அழுத்தம் / பிபி',
            te: 'అధిక రక్తపోటు / హై బీపీ',
            kn: 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡ / ಹೈ ಬಿಪಿ',
            ml: 'ഉയർന്ന രക്തസമ്മർദ്ദം / ഹൈ ബിപി',
            mr: 'उच्च रक्तदाब / हाय बीपी',
            bn: 'উচ্চ রক্তচাপ / হাই বিপি',
            gu: 'ઉચ્ચ રક્તદાબ / હાઈ બીપી',
            pa: 'ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ / ਹਾਈ ਬੀਪੀ',
            or: 'ଉଚ୍ଚ ରକ୍ତଚାପ / ହାଇ ବିପି',
            ur: 'ہائی بلڈ پریشر',
            ar: 'ارتفاع ضغط الدم',
            es: 'Presión arterial alta',
            fr: 'Hypertension artérielle',
            pt: 'Pressão alta',
            de: 'Bluthochdruck',
        },
        regional: [
            { name: 'बीपी', region: 'All India', lang: 'hi' },
            { name: 'ब्लड प्रेशर', region: 'Urban India', lang: 'hi' },
            { name: 'হাই প্রেসার', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['headache', 'dizziness', 'chest pain', 'shortness of breath', 'nosebleed'],
    },

    // HEART ATTACK
    'heart attack': {
        medical: 'Myocardial Infarction',
        simple: {
            en: 'Heart Attack',
            hi: 'दिल का दौरा / हार्ट अटैक',
            ta: 'மாரடைப்பு / இதய தாக்குதல்',
            te: 'గుండెపోటు / హార్ట్ ఎటాక్',
            kn: 'ಹೃದಯಾಘಾತ / ಹಾರ್ಟ್ ಅಟ್ಯಾಕ್',
            ml: 'ഹൃദയാഘാതം / ഹാർട്ട് അറ്റാക്ക്',
            mr: 'हृदयविकाराचा झटका / हार्ट अटॅक',
            bn: 'হার্ট অ্যাটাক / হৃদরোগ',
            gu: 'હાર્ટ એટેક / હૃદયરોગનો હુમલો',
            pa: 'ਦਿਲ ਦਾ ਦੌਰਾ / ਹਾਰਟ ਅਟੈਕ',
            or: 'ହୃଦଘାତ / ହାର୍ଟ ଆଟାକ',
            ur: 'دل کا دورہ / ہارٹ اٹیک',
            ar: 'نوبة قلبية / أزمة قلبية',
            es: 'Ataque al corazón / Infarto',
            fr: 'Crise cardiaque / Infarctus',
            pt: 'Ataque cardíaco / Infarto',
            de: 'Herzinfarkt / Herzanfall',
        },
        regional: [
            { name: 'सीने में दर्द', region: 'North India', lang: 'hi' },
            { name: 'छाती में दर्द', region: 'Central India', lang: 'hi' },
        ],
        symptoms: ['chest pain', 'shortness of breath', 'arm pain', 'sweating', 'nausea'],
    },

    // BACK PAIN
    'back pain': {
        medical: 'Dorsalgia',
        simple: {
            en: 'Back Pain / Spine Pain',
            hi: 'पीठ दर्द / कमर दर्द',
            ta: 'முதுகு வலி / இடுப்பு வலி',
            te: 'వెన్నునొప్పి / నడుము నొప్పి',
            kn: 'ಬೆನ್ನು ನೋವು / ಸೊಂಟ ನೋವು',
            ml: 'നടുവേദന / മുതുകുവേദന',
            mr: 'पाठदुखी / कंबरदुखी',
            bn: 'পিঠে ব্যথা / কোমর ব্যথা',
            gu: 'પીઠનો દુખાવો / કમરનો દુખાવો',
            pa: 'ਪਿੱਠ ਦਰਦ / ਕਮਰ ਦਰਦ',
            or: 'ପିଠି ବ୍ୟଥା / କମ୍ବର ଯନ୍ତ୍ରଣା',
            ur: 'کمر درد / پیٹھ درد',
            ar: 'ألم الظهر / وجع الظهر',
            es: 'Dolor de espalda / Lumbago',
            fr: 'Mal de dos / Douleur lombaire',
            pt: 'Dor nas costas / Lombalgia',
            de: 'Rückenschmerzen / Kreuzschmerzen',
        },
        regional: [
            { name: 'कमर की नस', region: 'North India', lang: 'hi' },
            { name: 'रीढ़ की हड्डी', region: 'All India', lang: 'hi' },
            { name: 'স্পনডিলাইটিস', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['muscle stiffness', 'shooting pain', 'limited movement', 'numbness', 'tingling'],
    },

    // FEVER
    'fever': {
        medical: 'Pyrexia',
        simple: {
            en: 'Fever / High Temperature',
            hi: 'बुखार / ज्वर / ताप',
            ta: 'காய்ச்சல் / ஜுரம்',
            te: 'జ్వరం / బుఖార్',
            kn: 'ಜ್ವರ / ಬುಖಾರ್',
            ml: 'പനി / ജ്വരം',
            mr: 'ताप / ज्वर',
            bn: 'জ্বর / বুখার',
            gu: 'તાવ / જ્વર',
            pa: 'ਬੁਖ਼ਾਰ / ਤਾਪ',
            or: 'ଜ୍ୱର / ବୁଖାର',
            ur: 'بخار / تاپ',
            ar: 'حمى / سخونة',
            es: 'Fiebre / Calentura',
            fr: 'Fièvre / Température',
            pt: 'Febre / Temperatura alta',
            de: 'Fieber / Erhöhte Temperatur',
        },
        regional: [
            { name: 'तेज बुखार', region: 'North India', lang: 'hi' },
            { name: 'মালয়েরিয়া জ্বর', region: 'Bengal', lang: 'bn' },
            { name: 'டைபாய்டு', region: 'Tamil Nadu', lang: 'ta' },
        ],
        symptoms: ['chills', 'sweating', 'headache', 'body ache', 'weakness'],
    },

    // COLD / FLU
    'common cold': {
        medical: 'Upper Respiratory Infection',
        simple: {
            en: 'Cold / Flu',
            hi: 'सर्दी-जुकाम / ठंड लगना',
            ta: 'சளி / ஜலதோஷம்',
            te: 'జలుబు / పరదా',
            kn: 'ಶೀತ / ನೆಗಡಿ',
            ml: 'ജലദോഷം / തണുപ്പ്',
            mr: 'सर्दी / पडसे',
            bn: 'সর্দি-কাশি / ঠান্ডা লাগা',
            gu: 'શરદી / ઠંડી લાગવી',
            pa: 'ਜ਼ੁਕਾਮ / ਠੰਡ ਲੱਗਣਾ',
            or: 'ଥଣ୍ଡା / ସର୍ଦ୍ଦି',
            ur: 'نزلہ زکام / ٹھنڈ',
            ar: 'نزلة برد / زكام',
            es: 'Resfriado / Gripe',
            fr: 'Rhume / Grippe',
            pt: 'Resfriado / Gripe',
            de: 'Erkältung / Grippe',
        },
        regional: [
            { name: 'खांसी-जुकाम', region: 'North India', lang: 'hi' },
            { name: 'नाक बहना', region: 'All India', lang: 'hi' },
        ],
        symptoms: ['runny nose', 'sneezing', 'sore throat', 'cough', 'congestion'],
    },

    // HEADACHE / MIGRAINE
    'migraine': {
        medical: 'Migraine',
        simple: {
            en: 'Severe Headache / Migraine',
            hi: 'सिरदर्द / माइग्रेन / अधकपारी',
            ta: 'தலைவலி / ஒற்றைத் தலைவலி',
            te: 'తలనొప్పి / మైగ్రేన్',
            kn: 'ತಲೆನೋವು / ಮೈಗ್ರೇನ್',
            ml: 'തലവേദന / മൈഗ്രേൻ',
            mr: 'डोकेदुखी / मायग्रेन',
            bn: 'মাথা ব্যথা / মাইগ্রেন',
            gu: 'માથાનો દુખાવો / માઇગ્રેન',
            pa: 'ਸਿਰ ਦਰਦ / ਮਾਈਗ੍ਰੇਨ',
            or: 'ମୁଣ୍ଡ ବିନ୍ଧା / ମାଇଗ୍ରେନ',
            ur: 'سر درد / آدھے سر کا درد',
            ar: 'صداع / الشقيقة',
            es: 'Dolor de cabeza / Migraña',
            fr: 'Mal de tête / Migraine',
            pt: 'Dor de cabeça / Enxaqueca',
            de: 'Kopfschmerzen / Migräne',
        },
        regional: [
            { name: 'आधा सीसी', region: 'North India', lang: 'hi' },
            { name: 'अर्धशीशी', region: 'Sanskrit origin', lang: 'hi' },
        ],
        symptoms: ['throbbing pain', 'nausea', 'light sensitivity', 'vision changes', 'aura'],
    },

    // ASTHMA
    'asthma': {
        medical: 'Bronchial Asthma',
        simple: {
            en: 'Asthma / Breathing Problem',
            hi: 'दमा / सांस की बीमारी',
            ta: 'ஆஸ்துமா / மூச்சுத்திணறல்',
            te: 'ఆస్తమా / ఊపిరి ఆడకపోవడం',
            kn: 'ಆಸ್ತಮಾ / ಉಸಿರಾಟದ ತೊಂದರೆ',
            ml: 'ആസ്ത്മ / ശ്വാസം മുട്ടൽ',
            mr: 'दमा / श्वासाचा त्रास',
            bn: 'হাঁপানি / শ্বাসকষ্ট',
            gu: 'અસ્થમા / શ્વાસની તકલીફ',
            pa: 'ਦਮਾ / ਸਾਹ ਦੀ ਤਕਲੀਫ਼',
            or: 'ଦମା / ଶ୍ୱାସକଷ୍ଟ',
            ur: 'دمہ / سانس کی بیماری',
            ar: 'الربو / ضيق التنفس',
            es: 'Asma / Dificultad respiratoria',
            fr: 'Asthme / Difficulté à respirer',
            pt: 'Asma / Dificuldade respiratória',
            de: 'Asthma / Atemnot',
        },
        regional: [
            { name: 'फेफड़ों की बीमारी', region: 'North India', lang: 'hi' },
            { name: 'শ্বাসকষ্ট', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'coughing', 'difficulty breathing'],
    },

    // ARTHRITIS
    'arthritis': {
        medical: 'Arthritis',
        simple: {
            en: 'Joint Pain / Arthritis',
            hi: 'जोड़ों का दर्द / गठिया',
            ta: 'மூட்டு வலி / கீல்வாதம்',
            te: 'కీళ్ల నొప్పి / సంధివాతం',
            kn: 'ಕೀಲು ನೋವು / ಸಂಧಿವಾತ',
            ml: 'സന്ധിവേദന / വാതം',
            mr: 'सांधेदुखी / संधिवात',
            bn: 'জয়েন্ট পেইন / বাত',
            gu: 'સાંધાનો દુખાવો / સંધિવા',
            pa: 'ਜੋੜਾਂ ਦਾ ਦਰਦ / ਗਠੀਆ',
            or: 'ଗଣ୍ଠି ଯନ୍ତ୍ରଣା / ବାତ',
            ur: 'جوڑوں کا درد / گٹھیا',
            ar: 'ألم المفاصل / التهاب المفاصل',
            es: 'Dolor articular / Artritis',
            fr: 'Douleur articulaire / Arthrite',
            pt: 'Dor nas articulações / Artrite',
            de: 'Gelenkschmerzen / Arthritis',
        },
        regional: [
            { name: 'आमवात', region: 'Ayurvedic', lang: 'hi' },
            { name: 'घुटनों का दर्द', region: 'North India', lang: 'hi' },
            { name: 'হাঁটুতে ব্যথা', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['joint swelling', 'stiffness', 'reduced movement', 'pain', 'redness'],
    },

    // THYROID
    'hypothyroidism': {
        medical: 'Hypothyroidism',
        simple: {
            en: 'Thyroid Problem / Low Thyroid',
            hi: 'थायराइड / थायरॉइड की समस्या',
            ta: 'தைராய்டு பிரச்சனை',
            te: 'థైరాయిడ్ సమస్య',
            kn: 'ಥೈರಾಯ್ಡ್ ಸಮಸ್ಯೆ',
            ml: 'തൈറോയ്ഡ് പ്രശ്നം',
            mr: 'थायरॉईड समस्या',
            bn: 'থাইরয়েড সমস্যা',
            gu: 'થાઇરોઇડ સમસ્યા',
            pa: 'ਥਾਇਰਾਇਡ ਸਮੱਸਿਆ',
            or: 'ଥାଇରଏଡ ସମସ୍ୟା',
            ur: 'تھائیرائیڈ کا مسئلہ',
            ar: 'مشكلة الغدة الدرقية',
            es: 'Problema de tiroides',
            fr: 'Problème de thyroïde',
            pt: 'Problema de tireoide',
            de: 'Schilddrüsenprobleme',
        },
        regional: [
            { name: 'गले की गांठ', region: 'Rural India', lang: 'hi' },
            { name: 'থাইরয়েড', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['weight gain', 'fatigue', 'cold sensitivity', 'dry skin', 'hair loss'],
    },

    // ACIDITY / GASTRIC
    'gastritis': {
        medical: 'Gastritis',
        simple: {
            en: 'Acidity / Gas Problem',
            hi: 'एसिडिटी / गैस / पेट में जलन',
            ta: 'அசிடிட்டி / வாயு தொல்லை',
            te: 'ఆసిడిటీ / గ్యాస్ సమస్య',
            kn: 'ಆಮ್ಲಪಿತ್ತ / ಗ್ಯಾಸ್ ಸಮಸ್ಯೆ',
            ml: 'അസിഡിറ്റി / ഗ്യാസ് പ്രശ്നം',
            mr: 'ॲसिडिटी / गॅस / पित्त',
            bn: 'অম্লতা / গ্যাস',
            gu: 'એસિડિટી / ગેસ',
            pa: 'ਐਸਿਡਿਟੀ / ਗੈਸ',
            or: 'ଏସିଡିଟି / ଗ୍ୟାସ',
            ur: 'تیزابیت / گیس',
            ar: 'حموضة / غازات',
            es: 'Acidez / Gases',
            fr: 'Acidité / Gaz',
            pt: 'Acidez / Gases',
            de: 'Sodbrennen / Blähungen',
        },
        regional: [
            { name: 'पित्त', region: 'North India', lang: 'hi' },
            { name: 'खट्टी डकार', region: 'North India', lang: 'hi' },
            { name: 'পেট জ্বালা', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['heartburn', 'bloating', 'nausea', 'stomach pain', 'belching'],
    },

    // KIDNEY STONES
    'kidney stones': {
        medical: 'Nephrolithiasis',
        simple: {
            en: 'Kidney Stones / Stone in Kidney',
            hi: 'गुर्दे की पथरी / किडनी स्टोन',
            ta: 'சிறுநீரக கல் / கிட்னி ஸ்டோன்',
            te: 'మూత్రపిండాల్లో రాళ్లు / కిడ్నీ స్టోన్',
            kn: 'ಮೂತ್ರಪಿಂಡದ ಕಲ್ಲು / ಕಿಡ್ನಿ ಸ್ಟೋನ್',
            ml: 'വൃക്കയിലെ കല്ല് / കിഡ്നി സ്റ്റോൺ',
            mr: 'किडनी स्टोन / मूतखडा',
            bn: 'কিডনিতে পাথর / বৃক্কে পাথর',
            gu: 'કિડની સ્ટોન / પથરી',
            pa: 'ਗੁਰਦੇ ਦੀ ਪੱਥਰੀ',
            or: 'କିଡନି ଷ୍ଟୋନ / ପଥୁରୀ',
            ur: 'گردے کی پتھری',
            ar: 'حصى الكلى / حصوات الكلى',
            es: 'Cálculos renales / Piedras en el riñón',
            fr: 'Calculs rénaux / Pierres aux reins',
            pt: 'Pedras nos rins / Cálculos renais',
            de: 'Nierensteine',
        },
        regional: [
            { name: 'पथरी', region: 'All India', lang: 'hi' },
            { name: 'পাথরি', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['severe pain', 'blood in urine', 'nausea', 'frequent urination', 'burning urination'],
    },

    // PILES / HEMORRHOIDS
    'hemorrhoids': {
        medical: 'Hemorrhoids',
        simple: {
            en: 'Piles / Hemorrhoids',
            hi: 'बवासीर / पाइल्स',
            ta: 'மூலம் / பைல்ஸ்',
            te: 'మూలవ్యాధి / పైల్స్',
            kn: 'ಮೂಲವ್ಯಾಧಿ / ಪೈಲ್ಸ್',
            ml: 'മൂലക്കുരു / പൈൽസ്',
            mr: 'मूळव्याध / पाइल्स',
            bn: 'অর্শ / পাইলস',
            gu: 'હરસ / પાઇલ્સ',
            pa: 'ਬਵਾਸੀਰ / ਪਾਇਲਜ਼',
            or: 'ଅର୍ଶ / ପାଇଲସ',
            ur: 'بواسیر / پائلز',
            ar: 'البواسير',
            es: 'Hemorroides / Almorranas',
            fr: 'Hémorroïdes',
            pt: 'Hemorroidas',
            de: 'Hämorrhoiden',
        },
        regional: [
            { name: 'खूनी बवासीर', region: 'North India', lang: 'hi' },
            { name: 'बादी बवासीर', region: 'North India', lang: 'hi' },
        ],
        symptoms: ['bleeding', 'pain', 'itching', 'swelling', 'discomfort'],
    },

    // SKIN CONDITIONS
    'eczema': {
        medical: 'Atopic Dermatitis',
        simple: {
            en: 'Skin Rash / Eczema',
            hi: 'खुजली / एक्जिमा / चर्म रोग',
            ta: 'தோல் அலர்ஜி / எக்ஸிமா',
            te: 'చర్మ వ్యాధి / ఎగ్జిమా',
            kn: 'ಚರ್ಮ ರೋಗ / ಎಕ್ಸಿಮಾ',
            ml: 'ചൊറി / എക്സിമ',
            mr: 'त्वचारोग / एक्झिमा',
            bn: 'চর্মরোগ / একজিমা',
            gu: 'ચામડીનો રોગ / ખરજવું',
            pa: 'ਚਮੜੀ ਦਾ ਰੋਗ / ਐਗਜ਼ੀਮਾ',
            or: 'ଚର୍ମ ରୋଗ / ଏକଜିମା',
            ur: 'چنبل / ایکزیما',
            ar: 'الأكزيما / الطفح الجلدي',
            es: 'Eczema / Sarpullido',
            fr: 'Eczéma / Éruption cutanée',
            pt: 'Eczema / Erupção cutânea',
            de: 'Ekzem / Hautausschlag',
        },
        regional: [
            { name: 'दाद', region: 'North India', lang: 'hi' },
            { name: 'खाज', region: 'North India', lang: 'hi' },
            { name: 'চুলকানি', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['itching', 'redness', 'dry skin', 'rash', 'scaling'],
    },

    // EYE PROBLEMS
    'cataract': {
        medical: 'Cataract',
        simple: {
            en: 'Cataract / Eye Clouding',
            hi: 'मोतियाबिंद / आंख का पर्दा',
            ta: 'கண்புரை / கேட்டராக்ட்',
            te: 'కంటి పొర / కాటరాక్ట్',
            kn: 'ಕಣ್ಣಿನ ಪೊರೆ / ಕ್ಯಾಟರಾಕ್ಟ್',
            ml: 'തിമിരം / കാറ്ററാക്ട്',
            mr: 'मोतीबिंदू / कॅटरॅक्ट',
            bn: 'চোখে ছানি / ক্যাটারাক্ট',
            gu: 'મોતિયો / કેટરેક્ટ',
            pa: 'ਮੋਤੀਆਬਿੰਦ',
            or: 'ମୋତିଆବିନ୍ଦୁ / କେଟାରାକ୍ଟ',
            ur: 'موتیا / کیٹریکٹ',
            ar: 'المياه البيضاء / الساد',
            es: 'Cataratas',
            fr: 'Cataracte',
            pt: 'Catarata',
            de: 'Grauer Star / Katarakt',
        },
        regional: [
            { name: 'सफेद मोतिया', region: 'North India', lang: 'hi' },
            { name: 'ছানি পড়া', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['blurred vision', 'cloudy vision', 'difficulty seeing at night', 'sensitivity to light', 'faded colors'],
    },

    // PREGNANCY RELATED
    'pregnancy': {
        medical: 'Pregnancy Care',
        simple: {
            en: 'Pregnancy / Maternity Care',
            hi: 'गर्भावस्था / प्रेगनेंसी',
            ta: 'கர்ப்பம் / கர்ப்ப கால பராமரிப்பு',
            te: 'గర్భం / ప్రెగ్నెన్సీ',
            kn: 'ಗರ್ಭಧಾರಣೆ / ಪ್ರೆಗ್ನೆನ್ಸಿ',
            ml: 'ഗർഭം / പ്രെഗ്നൻസി',
            mr: 'गर्भारपण / प्रेग्नन्सी',
            bn: 'গর্ভাবস্থা / প্রেগনেন্সি',
            gu: 'ગર્ભાવસ્થા / પ્રેગનન્સી',
            pa: 'ਗਰਭ ਅਵਸਥਾ / ਪ੍ਰੈਗਨੈਂਸੀ',
            or: 'ଗର୍ଭାବସ୍ଥା / ପ୍ରେଗନାନ୍ସି',
            ur: 'حمل / پریگننسی',
            ar: 'الحمل / رعاية الحمل',
            es: 'Embarazo / Cuidado prenatal',
            fr: 'Grossesse / Soins prénataux',
            pt: 'Gravidez / Cuidados pré-natais',
            de: 'Schwangerschaft / Schwangerschaftsvorsorge',
        },
        regional: [
            { name: 'गोद', region: 'Rural India', lang: 'hi' },
            { name: 'पेट से', region: 'Colloquial', lang: 'hi' },
        ],
        symptoms: ['morning sickness', 'missed period', 'fatigue', 'mood changes', 'frequent urination'],
    },

    // DENTAL
    'tooth decay': {
        medical: 'Dental Caries',
        simple: {
            en: 'Tooth Decay / Cavity',
            hi: 'दांत में कीड़ा / दांत में सड़न',
            ta: 'பல் சொத்தை / பற்சிதைவு',
            te: 'పంటి పురుగు / దంత క్షయం',
            kn: 'ಹಲ್ಲು ಹುಳು / ದಂತಕ್ಷಯ',
            ml: 'പല്ലിന്റെ ദ്രവിക്കൽ / ദന്തക്ഷയം',
            mr: 'दातांना कीड / दातांचे किडणे',
            bn: 'দাঁতে পোকা / দাঁত ক্ষয়',
            gu: 'દાંતમાં કીડો / દાંતનો સડો',
            pa: 'ਦੰਦ ਵਿੱਚ ਕੀੜਾ',
            or: 'ଦାନ୍ତ ପୋକ / ଦନ୍ତକ୍ଷୟ',
            ur: 'دانت میں کیڑا / دانت کا سڑنا',
            ar: 'تسوس الأسنان / نخر الأسنان',
            es: 'Caries dental / Cavidad',
            fr: 'Carie dentaire',
            pt: 'Cárie dentária',
            de: 'Karies / Zahnfäule',
        },
        regional: [
            { name: 'दांत का दर्द', region: 'All India', lang: 'hi' },
            { name: 'দাঁতে ব্যথা', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['toothache', 'sensitivity', 'pain when eating', 'visible holes', 'bad breath'],
    },

    // MENTAL HEALTH
    'depression': {
        medical: 'Major Depressive Disorder',
        simple: {
            en: 'Depression / Feeling Low',
            hi: 'डिप्रेशन / उदासी / मन की बेचैनी',
            ta: 'மனச்சோர்வு / டிப்ரஷன்',
            te: 'డిప్రెషన్ / మానసిక క్షోభ',
            kn: 'ಖಿನ್ನತೆ / ಡಿಪ್ರೆಶನ್',
            ml: 'വിഷാദം / ഡിപ്രഷൻ',
            mr: 'नैराश्य / डिप्रेशन',
            bn: 'বিষণ্ণতা / ডিপ্রেশন',
            gu: 'હતાશા / ડિપ્રેશન',
            pa: 'ਉਦਾਸੀ / ਡਿਪਰੈਸ਼ਨ',
            or: 'ବିଷାଦ / ଡିପ୍ରେସନ',
            ur: 'ڈپریشن / اداسی',
            ar: 'اكتئاب / حزن شديد',
            es: 'Depresión / Tristeza',
            fr: 'Dépression / Tristesse',
            pt: 'Depressão / Tristeza',
            de: 'Depression / Niedergeschlagenheit',
        },
        regional: [
            { name: 'मन का बोझ', region: 'North India', lang: 'hi' },
            { name: 'तनाव', region: 'All India', lang: 'hi' },
            { name: 'মনখারাপ', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['sadness', 'loss of interest', 'fatigue', 'sleep problems', 'hopelessness'],
    },

    // ANXIETY
    'anxiety': {
        medical: 'Generalized Anxiety Disorder',
        simple: {
            en: 'Anxiety / Nervousness',
            hi: 'चिंता / घबराहट / बेचैनी',
            ta: 'பதற்றம் / கவலை',
            te: 'ఆందోళన / భయం',
            kn: 'ಆತಂಕ / ಕಳವಳ',
            ml: 'ഉത്കണ്ഠ / ആശങ്ക',
            mr: 'चिंता / अस्वस्थता',
            bn: 'উদ্বেগ / দুশ্চিন্তা',
            gu: 'ચિંતા / બેચેની',
            pa: 'ਚਿੰਤਾ / ਘਬਰਾਹਟ',
            or: 'ଚିନ୍ତା / ଉଦ୍ବେଗ',
            ur: 'پریشانی / گھبراہٹ',
            ar: 'القلق / التوتر',
            es: 'Ansiedad / Nerviosismo',
            fr: 'Anxiété / Nervosité',
            pt: 'Ansiedade / Nervosismo',
            de: 'Angst / Nervosität',
        },
        regional: [
            { name: 'दिल की धड़कन', region: 'North India', lang: 'hi' },
            { name: 'পেট কামড়ানো', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['worry', 'restlessness', 'rapid heartbeat', 'sweating', 'difficulty concentrating'],
    },

    // ALLERGIES
    'allergies': {
        medical: 'Allergic Reaction',
        simple: {
            en: 'Allergy / Allergic Reaction',
            hi: 'एलर्जी / अलर्जी',
            ta: 'ஒவ்வாமை / அலர்ஜி',
            te: 'అలర్జీ',
            kn: 'ಅಲರ್ಜಿ',
            ml: 'അലർജി',
            mr: 'ॲलर्जी',
            bn: 'অ্যালার্জি',
            gu: 'એલર્જી',
            pa: 'ਐਲਰਜੀ',
            or: 'ଆଲର୍ଜି',
            ur: 'الرجی',
            ar: 'حساسية',
            es: 'Alergia',
            fr: 'Allergie',
            pt: 'Alergia',
            de: 'Allergie',
        },
        regional: [
            { name: 'कुछ सूट नहीं करना', region: 'Colloquial', lang: 'hi' },
            { name: 'শরীরে সইবে না', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['sneezing', 'itching', 'rash', 'swelling', 'runny nose'],
    },

    // URINARY INFECTION
    'urinary tract infection': {
        medical: 'Urinary Tract Infection',
        simple: {
            en: 'UTI / Urine Infection',
            hi: 'पेशाब में इन्फेक्शन / यूटीआई',
            ta: 'சிறுநீர் தொற்று / யூடிஐ',
            te: 'మూత్ర సంక్రమణ / యూటీఐ',
            kn: 'ಮೂತ್ರ ಸೋಂಕು / ಯುಟಿಐ',
            ml: 'മൂത്ര അണുബാധ / യുടിഐ',
            mr: 'लघवीचा संसर्ग / यूटीआय',
            bn: 'প্রস্রাবে সংক্রমণ / ইউটিআই',
            gu: 'પેશાબમાં ઇન્ફેક્શન',
            pa: 'ਪਿਸ਼ਾਬ ਵਿੱਚ ਇਨਫੈਕਸ਼ਨ',
            or: 'ପରସ୍ରା ସଂକ୍ରମଣ',
            ur: 'پیشاب میں انفیکشن',
            ar: 'التهاب المسالك البولية',
            es: 'Infección urinaria',
            fr: 'Infection urinaire',
            pt: 'Infecção urinária',
            de: 'Harnwegsinfektion',
        },
        regional: [
            { name: 'पेशाब में जलन', region: 'All India', lang: 'hi' },
            { name: 'প্রস্রাবে জ্বালা', region: 'Bengal', lang: 'bn' },
        ],
        symptoms: ['burning urination', 'frequent urination', 'cloudy urine', 'pelvic pain', 'strong odor'],
    },
};

// ============================================================================
// GENERIC TRANSLATIONS FOR COMMON TERMS
// ============================================================================

const BODY_PART_TRANSLATIONS: Record<string, Record<string, string>> = {
    'head': {
        hi: 'सिर', ta: 'தலை', te: 'తల', kn: 'ತಲೆ', ml: 'തല', mr: 'डोके', bn: 'মাথা',
        gu: 'માથું', pa: 'ਸਿਰ', or: 'ମୁଣ୍ଡ', ur: 'سر', ar: 'رأس', es: 'cabeza', fr: 'tête', pt: 'cabeça', de: 'Kopf'
    },
    'chest': {
        hi: 'छाती', ta: 'மார்பு', te: 'ఛాతీ', kn: 'ಎದೆ', ml: 'നെഞ്ച്', mr: 'छाती', bn: 'বুক',
        gu: 'છાતી', pa: 'ਛਾਤੀ', or: 'ବକ୍ଷ', ur: 'سینہ', ar: 'صدر', es: 'pecho', fr: 'poitrine', pt: 'peito', de: 'Brust'
    },
    'stomach': {
        hi: 'पेट', ta: 'வயிறு', te: 'పొట్ట', kn: 'ಹೊಟ್ಟೆ', ml: 'വയറ്', mr: 'पोट', bn: 'পেট',
        gu: 'પેટ', pa: 'ਪੇਟ', or: 'ପେଟ', ur: 'پیٹ', ar: 'بطن', es: 'estómago', fr: 'estomac', pt: 'estômago', de: 'Magen'
    },
    'back': {
        hi: 'पीठ', ta: 'முதுகு', te: 'వెన్ను', kn: 'ಬೆನ್ನು', ml: 'മുതുക്', mr: 'पाठ', bn: 'পিঠ',
        gu: 'પીઠ', pa: 'ਪਿੱਠ', or: 'ପିଠି', ur: 'پیٹھ', ar: 'ظهر', es: 'espalda', fr: 'dos', pt: 'costas', de: 'Rücken'
    },
    'leg': {
        hi: 'पैर', ta: 'கால்', te: 'కాలు', kn: 'ಕಾಲು', ml: 'കാല്', mr: 'पाय', bn: 'পা',
        gu: 'પગ', pa: 'ਲੱਤ', or: 'ଗୋଡ', ur: 'ٹانگ', ar: 'ساق', es: 'pierna', fr: 'jambe', pt: 'perna', de: 'Bein'
    },
    'arm': {
        hi: 'हाथ', ta: 'கை', te: 'చేయి', kn: 'ಕೈ', ml: 'കൈ', mr: 'हात', bn: 'হাত',
        gu: 'હાથ', pa: 'ਬਾਂਹ', or: 'ହାତ', ur: 'بازو', ar: 'ذراع', es: 'brazo', fr: 'bras', pt: 'braço', de: 'Arm'
    },
    'eye': {
        hi: 'आंख', ta: 'கண்', te: 'కన్ను', kn: 'ಕಣ್ಣು', ml: 'കണ്ണ്', mr: 'डोळा', bn: 'চোখ',
        gu: 'આંખ', pa: 'ਅੱਖ', or: 'ଆଖି', ur: 'آنکھ', ar: 'عين', es: 'ojo', fr: 'œil', pt: 'olho', de: 'Auge'
    },
    'ear': {
        hi: 'कान', ta: 'காது', te: 'చెవి', kn: 'ಕಿವಿ', ml: 'ചെവി', mr: 'कान', bn: 'কান',
        gu: 'કાન', pa: 'ਕੰਨ', or: 'କାନ', ur: 'کان', ar: 'أذن', es: 'oreja', fr: 'oreille', pt: 'ouvido', de: 'Ohr'
    },
    'skin': {
        hi: 'त्वचा', ta: 'தோல்', te: 'చర్మం', kn: 'ಚರ್ಮ', ml: 'ത്വക്ക്', mr: 'त्वचा', bn: 'ত্বক',
        gu: 'ચામડી', pa: 'ਚਮੜੀ', or: 'ଚର୍ମ', ur: 'جلد', ar: 'جلد', es: 'piel', fr: 'peau', pt: 'pele', de: 'Haut'
    },
    'heart': {
        hi: 'दिल', ta: 'இதயம்', te: 'గుండె', kn: 'ಹೃದಯ', ml: 'ഹൃദയം', mr: 'हृदय', bn: 'হৃদয়',
        gu: 'હૃદય', pa: 'ਦਿਲ', or: 'ହୃଦୟ', ur: 'دل', ar: 'قلب', es: 'corazón', fr: 'cœur', pt: 'coração', de: 'Herz'
    },
    'kidney': {
        hi: 'गुर्दा', ta: 'சிறுநீரகம்', te: 'మూత్రపిండం', kn: 'ಮೂತ್ರಪಿಂಡ', ml: 'വൃക്ക', mr: 'मूत्रपिंड', bn: 'কিডনি',
        gu: 'કિડની', pa: 'ਗੁਰਦਾ', or: 'କିଡନୀ', ur: 'گردہ', ar: 'كلية', es: 'riñón', fr: 'rein', pt: 'rim', de: 'Niere'
    },
    'liver': {
        hi: 'जिगर', ta: 'கல்லீரல்', te: 'కాలేయం', kn: 'ಯಕೃತ್', ml: 'കരള്', mr: 'यकृत', bn: 'যকৃত',
        gu: 'લિવર', pa: 'ਜਿਗਰ', or: 'ଯକୃତ', ur: 'جگر', ar: 'كبد', es: 'hígado', fr: 'foie', pt: 'fígado', de: 'Leber'
    },
    'lung': {
        hi: 'फेफड़ा', ta: 'நுரையீரல்', te: 'ఊపిరితిత్తులు', kn: 'ಶ್ವಾಸಕೋಶ', ml: 'ശ്വാസകോശം', mr: 'फुप्फुस', bn: 'ফুসফুস',
        gu: 'ફેફસાં', pa: 'ਫੇਫੜਾ', or: 'ଫୁସଫୁସ', ur: 'پھیپھڑا', ar: 'رئة', es: 'pulmón', fr: 'poumon', pt: 'pulmão', de: 'Lunge'
    },
    'brain': {
        hi: 'दिमाग', ta: 'மூளை', te: 'మెదడు', kn: 'ಮೆದುಳು', ml: 'മസ്തിഷ്കം', mr: 'मेंदू', bn: 'মস্তিষ্ক',
        gu: 'મગજ', pa: 'ਦਿਮਾਗ', or: 'ମସ୍ତିଷ୍କ', ur: 'دماغ', ar: 'دماغ', es: 'cerebro', fr: 'cerveau', pt: 'cérebro', de: 'Gehirn'
    },
    'throat': {
        hi: 'गला', ta: 'தொண்டை', te: 'గొంతు', kn: 'ಗಂಟಲು', ml: 'തൊണ്ട', mr: 'घसा', bn: 'গলা',
        gu: 'ગળું', pa: 'ਗਲਾ', or: 'ଗଳା', ur: 'گلا', ar: 'حنجرة', es: 'garganta', fr: 'gorge', pt: 'garganta', de: 'Hals'
    },
    'joint': {
        hi: 'जोड़', ta: 'மூட்டு', te: 'కీలు', kn: 'ಕೀಲು', ml: 'സന്ധി', mr: 'सांधा', bn: 'জয়েন্ট',
        gu: 'સાંધો', pa: 'ਜੋੜ', or: 'ଗଣ୍ଠି', ur: 'جوڑ', ar: 'مفصل', es: 'articulación', fr: 'articulation', pt: 'articulação', de: 'Gelenk'
    },
    'bone': {
        hi: 'हड्डी', ta: 'எலும்பு', te: 'ఎముక', kn: 'ಮೂಳೆ', ml: 'എല്ല്', mr: 'हाड', bn: 'হাড়',
        gu: 'હાડકું', pa: 'ਹੱਡੀ', or: 'ହାଡ', ur: 'ہڈی', ar: 'عظم', es: 'hueso', fr: 'os', pt: 'osso', de: 'Knochen'
    },
    'nerve': {
        hi: 'नस', ta: 'நரம்பு', te: 'నరాలు', kn: 'ನರ', ml: 'ഞരമ്പ്', mr: 'मज्जातंतू', bn: 'স্নায়ু',
        gu: 'નસ', pa: 'ਨਸ', or: 'ସ୍ନାୟୁ', ur: 'اعصاب', ar: 'عصب', es: 'nervio', fr: 'nerf', pt: 'nervo', de: 'Nerv'
    },
    'muscle': {
        hi: 'मांसपेशी', ta: 'தசை', te: 'కండరం', kn: 'ಸ್ನಾಯು', ml: 'പേശി', mr: 'स्नायू', bn: 'পেশী',
        gu: 'સ્નાયુ', pa: 'ਮਾਸਪੇਸ਼ੀ', or: 'ମାଂସପେଶୀ', ur: 'پٹھہ', ar: 'عضلة', es: 'músculo', fr: 'muscle', pt: 'músculo', de: 'Muskel'
    },
    'blood': {
        hi: 'खून', ta: 'இரத்தம்', te: 'రక్తం', kn: 'ರಕ್ತ', ml: 'രക്തം', mr: 'रक्त', bn: 'রক্ত',
        gu: 'લોહી', pa: 'ਖੂਨ', or: 'ରକ୍ତ', ur: 'خون', ar: 'دم', es: 'sangre', fr: 'sang', pt: 'sangue', de: 'Blut'
    },
    'urine': {
        hi: 'पेशाब', ta: 'சிறுநீர்', te: 'మూత్రం', kn: 'ಮೂತ್ರ', ml: 'മൂത്രം', mr: 'लघवी', bn: 'প্রস্রাব',
        gu: 'પેશાબ', pa: 'ਪਿਸ਼ਾਬ', or: 'ପରିସ୍ରା', ur: 'پیشاب', ar: 'بول', es: 'orina', fr: 'urine', pt: 'urina', de: 'Urin'
    },
    'tooth': {
        hi: 'दांत', ta: 'பல்', te: 'పళ్ళు', kn: 'ಹಲ್ಲು', ml: 'പല്ല്', mr: 'दात', bn: 'দাঁত',
        gu: 'દાંત', pa: 'ਦੰਦ', or: 'ଦାନ୍ତ', ur: 'دانت', ar: 'سن', es: 'diente', fr: 'dent', pt: 'dente', de: 'Zahn'
    },
};

const SYMPTOM_TRANSLATIONS: Record<string, Record<string, string>> = {
    'pain': {
        hi: 'दर्द', ta: 'வலி', te: 'నొప్పి', kn: 'ನೋವು', ml: 'വേദന', mr: 'दुखणे', bn: 'ব্যথা',
        gu: 'દુખાવો', pa: 'ਦਰਦ', or: 'ଯନ୍ତ୍ରଣା', ur: 'درد', ar: 'ألم', es: 'dolor', fr: 'douleur', pt: 'dor', de: 'Schmerz'
    },
    'swelling': {
        hi: 'सूजन', ta: 'வீக்கம்', te: 'వాపు', kn: 'ಊತ', ml: 'വീക്കം', mr: 'सूज', bn: 'ফোলা',
        gu: 'સોજો', pa: 'ਸੋਜ', or: 'ଫୁଲା', ur: 'سوجن', ar: 'تورم', es: 'hinchazón', fr: 'gonflement', pt: 'inchaço', de: 'Schwellung'
    },
    'itching': {
        hi: 'खुजली', ta: 'அரிப்பு', te: 'దురద', kn: 'ತುರಿಕೆ', ml: 'ചൊറിച്ചിൽ', mr: 'खाज', bn: 'চুলকানি',
        gu: 'ખંજવાળ', pa: 'ਖੁਜਲੀ', or: 'କୁଣ୍ଡେଇ', ur: 'خارش', ar: 'حكة', es: 'picazón', fr: 'démangeaison', pt: 'coceira', de: 'Juckreiz'
    },
    'burning': {
        hi: 'जलन', ta: 'எரிச்சல்', te: 'మంట', kn: 'ಉರಿ', ml: 'എരിച്ചിൽ', mr: 'जळजळ', bn: 'জ্বালা',
        gu: 'બળતરા', pa: 'ਜਲਣ', or: 'ଜଳା', ur: 'جلن', ar: 'حرقة', es: 'ardor', fr: 'brûlure', pt: 'queimação', de: 'Brennen'
    },
    'bleeding': {
        hi: 'खून बहना', ta: 'இரத்தப்போக்கு', te: 'రక్తస్రావం', kn: 'ರಕ್ತಸ್ರಾವ', ml: 'രക്തസ്രാവം', mr: 'रक्तस्राव', bn: 'রক্তপাত',
        gu: 'રક્તસ્ત્રાવ', pa: 'ਖੂਨ ਵਹਿਣਾ', or: 'ରକ୍ତସ୍ରାବ', ur: 'خون بہنا', ar: 'نزيف', es: 'sangrado', fr: 'saignement', pt: 'sangramento', de: 'Blutung'
    },
    'weakness': {
        hi: 'कमजोरी', ta: 'பலவீனம்', te: 'బలహీనత', kn: 'ದುರ್ಬಲತೆ', ml: 'ബലഹീനത', mr: 'अशक्तपणा', bn: 'দুর্বলতা',
        gu: 'નબળાઈ', pa: 'ਕਮਜ਼ੋਰੀ', or: 'ଦୁର୍ବଳତା', ur: 'کمزوری', ar: 'ضعف', es: 'debilidad', fr: 'faiblesse', pt: 'fraqueza', de: 'Schwäche'
    },
    'fatigue': {
        hi: 'थकान', ta: 'சோர்வு', te: 'అలసట', kn: 'ಆಯಾಸ', ml: 'ക്ഷീണം', mr: 'थकवा', bn: 'ক্লান্তি',
        gu: 'થાક', pa: 'ਥਕਾਵਟ', or: 'କ୍ଲାନ୍ତି', ur: 'تھکاوٹ', ar: 'إرهاق', es: 'fatiga', fr: 'fatigue', pt: 'fadiga', de: 'Müdigkeit'
    },
    'nausea': {
        hi: 'मतली', ta: 'குமட்டல்', te: 'వికారం', kn: 'ವಾಕರಿಕೆ', ml: 'ഓക്കാനം', mr: 'मळमळ', bn: 'বমি বমি ভাব',
        gu: 'ઊબકા', pa: 'ਮਤਲੀ', or: 'ବାନ୍ତି', ur: 'متلی', ar: 'غثيان', es: 'náusea', fr: 'nausée', pt: 'náusea', de: 'Übelkeit'
    },
    'vomiting': {
        hi: 'उल्टी', ta: 'வாந்தி', te: 'వాంతి', kn: 'ವಾಂತಿ', ml: 'ഛർദ്ദി', mr: 'उलटी', bn: 'বমি',
        gu: 'ઉલટી', pa: 'ਉਲਟੀ', or: 'ବାନ୍ତି', ur: 'قے', ar: 'قيء', es: 'vómito', fr: 'vomissement', pt: 'vômito', de: 'Erbrechen'
    },
    'dizziness': {
        hi: 'चक्कर आना', ta: 'தலை சுற்றல்', te: 'తలతిరుగుడు', kn: 'ತಲೆ ತಿರುಗುವಿಕೆ', ml: 'തലചുറ്റൽ', mr: 'चक्कर येणे', bn: 'মাথা ঘোরা',
        gu: 'ચક્કર આવવા', pa: 'ਚੱਕਰ ਆਉਣਾ', or: 'ମୁଣ୍ଡ ବୁଲାଇବା', ur: 'چکر آنا', ar: 'دوخة', es: 'mareo', fr: 'vertige', pt: 'tontura', de: 'Schwindel'
    },
    'cough': {
        hi: 'खांसी', ta: 'இருமல்', te: 'దగ్గు', kn: 'ಕೆಮ್ಮು', ml: 'ചുമ', mr: 'खोकला', bn: 'কাশি',
        gu: 'ખાંસી', pa: 'ਖੰਘ', or: 'କାଶ', ur: 'کھانسی', ar: 'سعال', es: 'tos', fr: 'toux', pt: 'tosse', de: 'Husten'
    },
    'sneezing': {
        hi: 'छींक', ta: 'தும்மல்', te: 'తుమ్ము', kn: 'ಸೀನು', ml: 'തുമ്മൽ', mr: 'शिंका', bn: 'হাঁচি',
        gu: 'છીંક', pa: 'ਛਿੱਕ', or: 'ଛିଙ୍କ', ur: 'چھینک', ar: 'عطاس', es: 'estornudo', fr: 'éternuement', pt: 'espirro', de: 'Niesen'
    },
    'constipation': {
        hi: 'कब्ज', ta: 'மலச்சிக்கல்', te: 'మలబద్ధకం', kn: 'ಮಲಬದ್ಧತೆ', ml: 'മലബന്ധം', mr: 'बद्धकोष्ठता', bn: 'কোষ্ঠকাঠিন্য',
        gu: 'કબજિયાત', pa: 'ਕਬਜ਼', or: 'କୋଷ୍ଠକାଠିନ୍ୟ', ur: 'قبض', ar: 'إمساك', es: 'estreñimiento', fr: 'constipation', pt: 'prisão de ventre', de: 'Verstopfung'
    },
    'diarrhea': {
        hi: 'दस्त', ta: 'வயிற்றுப்போக்கு', te: 'విరేచనాలు', kn: 'ಅತಿಸಾರ', ml: 'വയറിളക്കം', mr: 'जुलाब', bn: 'ডায়রিয়া',
        gu: 'ઝાડા', pa: 'ਦਸਤ', or: 'ପତଳା ଝାଡ଼ା', ur: 'دست', ar: 'إسهال', es: 'diarrea', fr: 'diarrhée', pt: 'diarreia', de: 'Durchfall'
    },
    'infection': {
        hi: 'संक्रमण', ta: 'தொற்று', te: 'సంక్రమణ', kn: 'ಸೋಂಕು', ml: 'അണുബാധ', mr: 'संसर्ग', bn: 'সংক্রমণ',
        gu: 'ચેપ', pa: 'ਇਨਫੈਕਸ਼ਨ', or: 'ସଂକ୍ରମଣ', ur: 'انفیکشن', ar: 'عدوى', es: 'infección', fr: 'infection', pt: 'infecção', de: 'Infektion'
    },
    'inflammation': {
        hi: 'सूजन/जलन', ta: 'வீக்கம்', te: 'వాపు', kn: 'ಉರಿಯೂತ', ml: 'വീക്കം', mr: 'दाह', bn: 'প্রদাহ',
        gu: 'સોજો', pa: 'ਸੋਜ', or: 'ପ୍ରଦାହ', ur: 'سوزش', ar: 'التهاب', es: 'inflamación', fr: 'inflammation', pt: 'inflamação', de: 'Entzündung'
    },
};

const COMMON_MEDICAL_SUFFIX: Record<string, Record<string, string>> = {
    'disease': {
        hi: 'रोग/बीमारी', ta: 'நோய்', te: 'వ్యాధి', kn: 'ರೋಗ', ml: 'രോഗം', mr: 'रोग', bn: 'রোগ',
        gu: 'રોગ', pa: 'ਰੋਗ', or: 'ରୋଗ', ur: 'بیماری', ar: 'مرض', es: 'enfermedad', fr: 'maladie', pt: 'doença', de: 'Krankheit'
    },
    'problem': {
        hi: 'समस्या', ta: 'பிரச்சனை', te: 'సమస్య', kn: 'ಸಮಸ್ಯೆ', ml: 'പ്രശ്നം', mr: 'समस्या', bn: 'সমস্যা',
        gu: 'સમસ્યા', pa: 'ਸਮੱਸਿਆ', or: 'ସମସ୍ୟା', ur: 'مسئلہ', ar: 'مشكلة', es: 'problema', fr: 'problème', pt: 'problema', de: 'Problem'
    },
    'treatment': {
        hi: 'इलाज/उपचार', ta: 'சிகிச்சை', te: 'చికిత్స', kn: 'ಚಿಕಿತ್ಸೆ', ml: 'ചികിത്സ', mr: 'उपचार', bn: 'চিকিৎসা',
        gu: 'સારવાર', pa: 'ਇਲਾਜ', or: 'ଚିକିତ୍ସା', ur: 'علاج', ar: 'علاج', es: 'tratamiento', fr: 'traitement', pt: 'tratamento', de: 'Behandlung'
    },
};

const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'or', 'ur', 'ar', 'es', 'fr', 'pt', 'de'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeConditionName(name: string): string {
    return name.toLowerCase()
        .replace(/['']/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function findMappingForCondition(conditionName: string): ConditionNameMapping | null {
    const normalized = normalizeConditionName(conditionName);

    // Direct match
    if (CONDITION_MAPPINGS[normalized]) {
        return CONDITION_MAPPINGS[normalized];
    }

    // Partial match
    for (const [key, mapping] of Object.entries(CONDITION_MAPPINGS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return mapping;
        }
        // Check if medical name matches
        if (mapping.medical && normalizeConditionName(mapping.medical).includes(normalized)) {
            return mapping;
        }
    }

    return null;
}

function generateSimpleName(conditionName: string, lang: string): string {
    const mapping = findMappingForCondition(conditionName);

    if (mapping && mapping.simple[lang]) {
        return mapping.simple[lang];
    }

    // For conditions without mapping, generate a basic translation
    // by combining body part + symptom/disease translations
    const normalizedName = normalizeConditionName(conditionName);

    // Try to match body parts and symptoms
    let translatedParts: string[] = [];

    for (const [bodyPart, translations] of Object.entries(BODY_PART_TRANSLATIONS)) {
        if (normalizedName.includes(bodyPart) && translations[lang]) {
            translatedParts.push(translations[lang]);
        }
    }

    for (const [symptom, translations] of Object.entries(SYMPTOM_TRANSLATIONS)) {
        if (normalizedName.includes(symptom) && translations[lang]) {
            translatedParts.push(translations[lang]);
        }
    }

    // Add disease/problem suffix if applicable
    if (normalizedName.includes('disease') || normalizedName.includes('disorder')) {
        const suffix = COMMON_MEDICAL_SUFFIX['disease'][lang];
        if (suffix && !translatedParts.includes(suffix)) {
            translatedParts.push(suffix);
        }
    }

    if (translatedParts.length > 0) {
        return translatedParts.join(' ');
    }

    // Return English name if no translation available
    return conditionName;
}

function generateRegionalNames(conditionName: string, lang: string): Array<{ name: string; region: string; language: string }> {
    const mapping = findMappingForCondition(conditionName);

    if (!mapping || !mapping.regional) {
        return [];
    }

    // Filter regional names for the specified language
    return mapping.regional
        .filter(r => r.lang === lang)
        .map(r => ({
            name: r.name,
            region: r.region,
            language: r.lang,
        }));
}

function generateSearchTags(
    conditionName: string,
    simpleName: string,
    regionalNames: Array<{ name: string; region: string; language: string }>,
    symptoms: string[],
    lang: string
): string[] {
    const tags = new Set<string>();

    // Add condition name
    tags.add(conditionName);

    // Add simple name
    if (simpleName && simpleName !== conditionName) {
        tags.add(simpleName);
        // Also split by / and add parts
        simpleName.split('/').forEach(part => tags.add(part.trim()));
    }

    // Add regional names
    regionalNames.forEach(r => tags.add(r.name));

    // Add symptoms translated to language
    symptoms.forEach(symptom => {
        const symptomLower = symptom.toLowerCase();
        // Try to translate symptom
        for (const [key, translations] of Object.entries(SYMPTOM_TRANSLATIONS)) {
            if (symptomLower.includes(key) && translations[lang]) {
                tags.add(translations[lang]);
            }
        }
        // Also add English symptom
        tags.add(symptom);
    });

    // Clean and return
    return Array.from(tags)
        .filter(tag => tag && tag.length > 1)
        .map(tag => tag.trim());
}

function generateSymptomKeywords(symptoms: string[], lang: string): string[] {
    const keywords: string[] = [];

    symptoms.forEach(symptom => {
        const symptomLower = symptom.toLowerCase();

        // Add original symptom
        keywords.push(symptom);

        // Try to find translation
        for (const [key, translations] of Object.entries(SYMPTOM_TRANSLATIONS)) {
            if (symptomLower.includes(key) && translations[lang]) {
                keywords.push(translations[lang]);
            }
        }

        // Check body parts in symptom
        for (const [bodyPart, translations] of Object.entries(BODY_PART_TRANSLATIONS)) {
            if (symptomLower.includes(bodyPart) && translations[lang]) {
                keywords.push(translations[lang]);
            }
        }
    });

    return [...new Set(keywords)].filter(k => k && k.length > 1);
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function populateSimpleNames(options: {
    lang?: string;
    allLangs?: boolean;
    limit?: number;
    offset?: number;
}) {
    const { lang, allLangs, limit = 25000, offset = 0 } = options;

    const languagesToProcess = allLangs ? SUPPORTED_LANGUAGES : (lang ? [lang] : []);

    if (languagesToProcess.length === 0) {
        console.log('Usage:');
        console.log('  npx tsx scripts/populate-simple-names.ts --lang=hi --limit=1000');
        console.log('  npx tsx scripts/populate-simple-names.ts --all --limit=25000');
        return;
    }

    console.log('='.repeat(60));
    console.log('POPULATING SIMPLE NAMES & REGIONAL TAGS');
    console.log('='.repeat(60));
    console.log(`Languages: ${languagesToProcess.join(', ')}`);
    console.log(`Limit: ${limit}, Offset: ${offset}`);
    console.log('');

    for (const targetLang of languagesToProcess) {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`Processing: ${targetLang.toUpperCase()}`);
        console.log('─'.repeat(50));

        // Get all page content for this language
        const pageContent = await prisma.conditionPageContent.findMany({
            where: { languageCode: targetLang },
            include: {
                condition: {
                    select: {
                        id: true,
                        commonName: true,
                        scientificName: true,
                        symptoms: true,
                    },
                },
            },
            take: limit,
            skip: offset,
            orderBy: { conditionId: 'asc' },
        });

        console.log(`Found ${pageContent.length} pages to process`);

        let processed = 0;
        let updated = 0;
        let errors = 0;

        for (const page of pageContent) {
            try {
                const conditionName = page.condition.commonName;
                const symptoms = Array.isArray(page.condition.symptoms)
                    ? page.condition.symptoms as string[]
                    : [];

                // Generate simple name
                const simpleName = generateSimpleName(conditionName, targetLang);

                // Generate regional names
                const regionalNames = generateRegionalNames(conditionName, targetLang);

                // Generate search tags
                const searchTags = generateSearchTags(
                    conditionName,
                    simpleName,
                    regionalNames,
                    symptoms,
                    targetLang
                );

                // Generate symptom keywords
                const symptomKeywords = generateSymptomKeywords(symptoms, targetLang);

                // Update the record
                await prisma.conditionPageContent.update({
                    where: { id: page.id },
                    data: {
                        simpleName: simpleName.substring(0, 300), // Fit VARCHAR(300)
                        regionalNames: regionalNames.length > 0 ? regionalNames : null,
                        searchTags: searchTags.length > 0 ? searchTags : null,
                        symptomKeywords: symptomKeywords.length > 0 ? symptomKeywords : null,
                    },
                });

                updated++;
                processed++;

                if (processed % 500 === 0) {
                    console.log(`  Processed: ${processed}/${pageContent.length}`);
                }
            } catch (error: any) {
                errors++;
                if (errors <= 3) {
                    console.error(`  Error processing page ${page.id}: ${error.message}`);
                }
            }
        }

        console.log(`\n✅ Completed ${targetLang}:`);
        console.log(`   Processed: ${processed}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Errors: ${errors}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('DONE');
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
        await populateSimpleNames({ lang, allLangs, limit, offset });
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
