/**
 * Seeds UI translations for condition pages in all 26 languages.
 * These are static UI strings (headings, labels, buttons) — NOT content.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// All condition page UI strings with translations for 26 languages
const TRANSLATIONS: Record<string, Record<string, string>> = {
    // Navigation & Breadcrumbs
    'cond.home': {
        en: 'Home', hi: 'होम', ta: 'முகப்பு', te: 'హోమ్', kn: 'ಮುಖಪುಟ', ml: 'ഹോം',
        mr: 'मुख्यपृष्ठ', gu: 'હોમ', bn: 'হোম', pa: 'ਹੋਮ', ar: 'الرئيسية', es: 'Inicio',
        fr: 'Accueil', de: 'Startseite', ru: 'Главная', pt: 'Início', ja: 'ホーム', ko: '홈',
        tr: 'Ana Sayfa', th: 'หน้าแรก', vi: 'Trang chủ', id: 'Beranda', ms: 'Laman Utama',
        ur: 'ہوم', sw: 'Nyumbani', zh: '首页',
    },
    'cond.conditions': {
        en: 'Conditions', hi: 'रोग', ta: 'நிலைகள்', te: 'పరిస్థితులు', kn: 'ಪರಿಸ್ಥಿತಿಗಳು', ml: 'അവസ്ഥകൾ',
        mr: 'रोग', gu: 'રોગો', bn: 'রোগ', pa: 'ਰੋਗ', ar: 'الحالات', es: 'Condiciones',
        fr: 'Pathologies', de: 'Erkrankungen', ru: 'Заболевания', pt: 'Condições', ja: '疾患', ko: '질환',
        tr: 'Hastalıklar', th: 'โรค', vi: 'Bệnh lý', id: 'Kondisi', ms: 'Keadaan',
        ur: 'امراض', sw: 'Hali', zh: '疾病',
    },

    // Hero Section
    'cond.icdCode': {
        en: 'ICD Code', hi: 'ICD कोड', ta: 'ICD குறியீடு', te: 'ICD కోడ్', kn: 'ICD ಕೋಡ್', ml: 'ICD കോഡ്',
        mr: 'ICD कोड', gu: 'ICD કોડ', bn: 'ICD কোড', pa: 'ICD ਕੋਡ', ar: 'رمز ICD', es: 'Código ICD',
        fr: 'Code CIM', de: 'ICD-Code', ru: 'Код МКБ', pt: 'Código CID', ja: 'ICDコード', ko: 'ICD 코드',
        tr: 'ICD Kodu', th: 'รหัส ICD', vi: 'Mã ICD', id: 'Kode ICD', ms: 'Kod ICD',
        ur: 'ICD کوڈ', sw: 'Msimbo wa ICD', zh: 'ICD编码',
    },
    'cond.specialists': {
        en: 'Specialists', hi: 'विशेषज्ञ', ta: 'நிபுணர்கள்', te: 'నిపుణులు', kn: 'ತಜ್ಞರು', ml: 'വിദഗ്ധർ',
        mr: 'विशेषज्ञ', gu: 'નિષ્ણાતો', bn: 'বিশেষজ্ঞ', pa: 'ਮਾਹਿਰ', ar: 'أخصائيون', es: 'Especialistas',
        fr: 'Spécialistes', de: 'Spezialisten', ru: 'Специалисты', pt: 'Especialistas', ja: '専門医', ko: '전문의',
        tr: 'Uzmanlar', th: 'ผู้เชี่ยวชาญ', vi: 'Chuyên gia', id: 'Spesialis', ms: 'Pakar',
        ur: 'ماہرین', sw: 'Wataalamu', zh: '专科医生',
    },
    'cond.reviewedBy': {
        en: 'Reviewed By', hi: 'समीक्षा', ta: 'மதிப்பாய்வு', te: 'సమీక్ష', kn: 'ಪರಿಶೀಲನೆ', ml: 'അവലോകനം',
        mr: 'पुनरावलोकन', gu: 'સમીક્ષા', bn: 'পর্যালোচনা', pa: 'ਸਮੀਖਿਆ', ar: 'مراجعة', es: 'Revisado por',
        fr: 'Révisé par', de: 'Geprüft von', ru: 'Проверено', pt: 'Revisado por', ja: '監修', ko: '검토',
        tr: 'İnceleme', th: 'ตรวจสอบโดย', vi: 'Đánh giá bởi', id: 'Ditinjau oleh', ms: 'Disemak oleh',
        ur: 'جائزہ', sw: 'Imepitiwa na', zh: '审核',
    },
    'cond.findSpecialist': {
        en: 'Find a Specialist', hi: 'विशेषज्ञ खोजें', ta: 'நிபுணரைக் கண்டறியுங்கள்', te: 'నిపుణుడిని కనుగొనండి',
        kn: 'ತಜ್ಞರನ್ನು ಹುಡುಕಿ', ml: 'വിദഗ്ധനെ കണ്ടെത്തുക', mr: 'विशेषज्ञ शोधा', gu: 'નિષ્ણાત શોધો',
        bn: 'বিশেষজ্ঞ খুঁজুন', pa: 'ਮਾਹਿਰ ਲੱਭੋ', ar: 'ابحث عن أخصائي', es: 'Buscar especialista',
        fr: 'Trouver un spécialiste', de: 'Spezialisten finden', ru: 'Найти специалиста', pt: 'Encontrar especialista',
        ja: '専門医を探す', ko: '전문의 찾기', tr: 'Uzman bul', th: 'ค้นหาผู้เชี่ยวชาญ',
        vi: 'Tìm chuyên gia', id: 'Cari spesialis', ms: 'Cari pakar', ur: 'ماہر تلاش کریں',
        sw: 'Tafuta mtaalamu', zh: '查找专科医生',
    },
    'cond.viewSymptoms': {
        en: 'View Symptoms', hi: 'लक्षण देखें', ta: 'அறிகுறிகளைக் காண்க', te: 'లక్షణాలు చూడండి',
        kn: 'ರೋಗಲಕ್ಷಣಗಳನ್ನು ನೋಡಿ', ml: 'ലക്ഷണങ്ങൾ കാണുക', mr: 'लक्षणे पहा', gu: 'લક્ષણો જુઓ',
        bn: 'লক্ষণ দেখুন', pa: 'ਲੱਛਣ ਵੇਖੋ', ar: 'عرض الأعراض', es: 'Ver síntomas',
        fr: 'Voir les symptômes', de: 'Symptome anzeigen', ru: 'Просмотр симптомов', pt: 'Ver sintomas',
        ja: '症状を見る', ko: '증상 보기', tr: 'Belirtileri gör', th: 'ดูอาการ',
        vi: 'Xem triệu chứng', id: 'Lihat gejala', ms: 'Lihat gejala', ur: 'علامات دیکھیں',
        sw: 'Tazama dalili', zh: '查看症状',
    },

    // Table of Contents labels
    'cond.overview': {
        en: 'Overview', hi: 'अवलोकन', ta: 'கண்ணோட்டம்', te: 'అవలోకనం', kn: 'ಅವಲೋಕನ', ml: 'അവലോകനം',
        mr: 'आढावा', gu: 'ઝાંખી', bn: 'সংক্ষিপ্ত বিবরণ', pa: 'ਸੰਖੇਪ', ar: 'نظرة عامة', es: 'Resumen',
        fr: 'Aperçu', de: 'Überblick', ru: 'Обзор', pt: 'Visão geral', ja: '概要', ko: '개요',
        tr: 'Genel Bakış', th: 'ภาพรวม', vi: 'Tổng quan', id: 'Ikhtisar', ms: 'Gambaran keseluruhan',
        ur: 'جائزہ', sw: 'Muhtasari', zh: '概述',
    },
    'cond.treatments': {
        en: 'Treatments', hi: 'उपचार', ta: 'சிகிச்சைகள்', te: 'చికిత్సలు', kn: 'ಚಿಕಿತ್ಸೆಗಳು', ml: 'ചികിത്സകൾ',
        mr: 'उपचार', gu: 'ઉપચાર', bn: 'চিকিৎসা', pa: 'ਇਲਾਜ', ar: 'العلاجات', es: 'Tratamientos',
        fr: 'Traitements', de: 'Behandlungen', ru: 'Лечение', pt: 'Tratamentos', ja: '治療', ko: '치료',
        tr: 'Tedaviler', th: 'การรักษา', vi: 'Phương pháp điều trị', id: 'Perawatan', ms: 'Rawatan',
        ur: 'علاج', sw: 'Matibabu', zh: '治疗',
    },
    'cond.symptoms': {
        en: 'Symptoms', hi: 'लक्षण', ta: 'அறிகுறிகள்', te: 'లక్షణాలు', kn: 'ರೋಗಲಕ್ಷಣಗಳು', ml: 'ലക്ഷണങ്ങൾ',
        mr: 'लक्षणे', gu: 'લક્ષણો', bn: 'লক্ষণ', pa: 'ਲੱਛਣ', ar: 'الأعراض', es: 'Síntomas',
        fr: 'Symptômes', de: 'Symptome', ru: 'Симптомы', pt: 'Sintomas', ja: '症状', ko: '증상',
        tr: 'Belirtiler', th: 'อาการ', vi: 'Triệu chứng', id: 'Gejala', ms: 'Gejala',
        ur: 'علامات', sw: 'Dalili', zh: '症状',
    },
    'cond.diagnosis': {
        en: 'Diagnosis', hi: 'निदान', ta: 'நோயறிதல்', te: 'రోగనిర్ధారణ', kn: 'ರೋಗನಿರ್ಣಯ', ml: 'രോഗനിർണയം',
        mr: 'निदान', gu: 'નિદાન', bn: 'রোগনির্ণয়', pa: 'ਨਿਦਾਨ', ar: 'التشخيص', es: 'Diagnóstico',
        fr: 'Diagnostic', de: 'Diagnose', ru: 'Диагностика', pt: 'Diagnóstico', ja: '診断', ko: '진단',
        tr: 'Teşhis', th: 'การวินิจฉัย', vi: 'Chẩn đoán', id: 'Diagnosis', ms: 'Diagnosis',
        ur: 'تشخیص', sw: 'Uchunguzi', zh: '诊断',
    },
    'cond.lifestyle': {
        en: 'Lifestyle', hi: 'जीवनशैली', ta: 'வாழ்க்கை முறை', te: 'జీవనశైలి', kn: 'ಜೀವನಶೈಲಿ', ml: 'ജീവിതശൈലി',
        mr: 'जीवनशैली', gu: 'જીવનશૈલી', bn: 'জীবনযাত্রা', pa: 'ਜੀਵਨ ਸ਼ੈਲੀ', ar: 'نمط الحياة', es: 'Estilo de vida',
        fr: 'Mode de vie', de: 'Lebensstil', ru: 'Образ жизни', pt: 'Estilo de vida', ja: '生活習慣', ko: '생활습관',
        tr: 'Yaşam tarzı', th: 'วิถีชีวิต', vi: 'Lối sống', id: 'Gaya hidup', ms: 'Gaya hidup',
        ur: 'طرز زندگی', sw: 'Mtindo wa maisha', zh: '生活方式',
    },
    'cond.complications': {
        en: 'Complications', hi: 'जटिलताएं', ta: 'சிக்கல்கள்', te: 'సమస్యలు', kn: 'ತೊಂದರೆಗಳು', ml: 'സങ്കീർണതകൾ',
        mr: 'गुंतागुंत', gu: 'ગૂંચવણો', bn: 'জটিলতা', pa: 'ਮੁਸ਼ਕਲਾਂ', ar: 'المضاعفات', es: 'Complicaciones',
        fr: 'Complications', de: 'Komplikationen', ru: 'Осложнения', pt: 'Complicações', ja: '合併症', ko: '합병증',
        tr: 'Komplikasyonlar', th: 'ภาวะแทรกซ้อน', vi: 'Biến chứng', id: 'Komplikasi', ms: 'Komplikasi',
        ur: 'پیچیدگیاں', sw: 'Matatizo', zh: '并发症',
    },
    'cond.faqs': {
        en: 'FAQs', hi: 'सवाल-जवाब', ta: 'கேள்வி பதில்', te: 'ప్రశ్నలు', kn: 'FAQ ಗಳು', ml: 'FAQ',
        mr: 'प्रश्नोत्तरे', gu: 'FAQ', bn: 'প্রশ্নোত্তর', pa: 'ਸਵਾਲ-ਜਵਾਬ', ar: 'الأسئلة الشائعة', es: 'Preguntas frecuentes',
        fr: 'FAQ', de: 'FAQ', ru: 'Вопросы', pt: 'Perguntas frequentes', ja: 'よくある質問', ko: '자주 묻는 질문',
        tr: 'SSS', th: 'คำถามที่พบบ่อย', vi: 'Câu hỏi thường gặp', id: 'FAQ', ms: 'Soalan lazim',
        ur: 'عمومی سوالات', sw: 'Maswali', zh: '常见问题',
    },
    'cond.findDoctors': {
        en: 'Find Doctors', hi: 'डॉक्टर खोजें', ta: 'மருத்துவரைக் கண்டறியுங்கள்', te: 'డాక్టర్‌ను కనుగొనండి',
        kn: 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ', ml: 'ഡോക്ടറെ കണ്ടെത്തുക', mr: 'डॉक्टर शोधा', gu: 'ડૉક્ટર શોધો',
        bn: 'ডাক্তার খুঁজুন', pa: 'ਡਾਕਟਰ ਲੱਭੋ', ar: 'ابحث عن طبيب', es: 'Buscar médicos',
        fr: 'Trouver un médecin', de: 'Arzt finden', ru: 'Найти врача', pt: 'Encontrar médicos',
        ja: '医師を探す', ko: '의사 찾기', tr: 'Doktor bul', th: 'ค้นหาแพทย์',
        vi: 'Tìm bác sĩ', id: 'Cari dokter', ms: 'Cari doktor', ur: 'ڈاکٹر تلاش کریں',
        sw: 'Tafuta daktari', zh: '查找医生',
    },

    // Section Headings
    'cond.whatIs': {
        en: 'What is', hi: 'क्या है', ta: 'என்றால் என்ன', te: 'అంటే ఏమిటి', kn: 'ಎಂದರೇನು', ml: 'എന്താണ്',
        mr: 'काय आहे', gu: 'શું છે', bn: 'কী', pa: 'ਕੀ ਹੈ', ar: 'ما هو', es: 'Qué es',
        fr: "Qu'est-ce que", de: 'Was ist', ru: 'Что такое', pt: 'O que é', ja: 'とは', ko: '란',
        tr: 'Nedir', th: 'คืออะไร', vi: 'là gì', id: 'Apa itu', ms: 'Apa itu',
        ur: 'کیا ہے', sw: 'Ni nini', zh: '是什么',
    },
    'cond.diagnosisAndTreatment': {
        en: 'Diagnosis & Treatment', hi: 'निदान और उपचार', ta: 'நோயறிதல் & சிகிச்சை', te: 'రోగనిర్ధారణ & చికిత్స',
        kn: 'ರೋಗನಿರ್ಣಯ & ಚಿಕಿತ್ಸೆ', ml: 'രോഗനിർണയം & ചികിത്സ', mr: 'निदान आणि उपचार', gu: 'નિદાન અને ઉપચાર',
        bn: 'রোগনির্ণয় ও চিকিৎসা', pa: 'ਨਿਦਾਨ ਅਤੇ ਇਲਾਜ', ar: 'التشخيص والعلاج', es: 'Diagnóstico y tratamiento',
        fr: 'Diagnostic et traitement', de: 'Diagnose & Behandlung', ru: 'Диагностика и лечение', pt: 'Diagnóstico e tratamento',
        ja: '診断と治療', ko: '진단 및 치료', tr: 'Teşhis ve Tedavi', th: 'การวินิจฉัยและการรักษา',
        vi: 'Chẩn đoán & Điều trị', id: 'Diagnosis & Perawatan', ms: 'Diagnosis & Rawatan',
        ur: 'تشخیص اور علاج', sw: 'Uchunguzi na Matibabu', zh: '诊断与治疗',
    },
    'cond.keyTests': {
        en: 'Key Tests', hi: 'प्रमुख जांच', ta: 'முக்கிய சோதனைகள்', te: 'ముఖ్య పరీక్షలు',
        kn: 'ಪ್ರಮುಖ ಪರೀಕ್ಷೆಗಳು', ml: 'പ്രധാന പരിശോധനകൾ', mr: 'प्रमुख चाचण्या', gu: 'મુખ્ય પરીક્ષણો',
        bn: 'প্রধান পরীক্ষা', pa: 'ਮੁੱਖ ਟੈਸਟ', ar: 'الفحوصات الرئيسية', es: 'Pruebas clave',
        fr: 'Tests clés', de: 'Wichtige Tests', ru: 'Ключевые тесты', pt: 'Exames principais',
        ja: '主な検査', ko: '주요 검사', tr: 'Temel testler', th: 'การตรวจสำคัญ',
        vi: 'Xét nghiệm chính', id: 'Tes utama', ms: 'Ujian utama', ur: 'اہم ٹیسٹ',
        sw: 'Vipimo muhimu', zh: '主要检查',
    },
    'cond.prognosisOutlook': {
        en: 'Prognosis & Outlook', hi: 'पूर्वानुमान', ta: 'முன்கணிப்பு', te: 'అంచనా',
        kn: 'ಮುನ್ಸೂಚನೆ', ml: 'പ്രവചനം', mr: 'पूर्वानुमान', gu: 'પૂર્વાનુમાન',
        bn: 'পূর্বাভাস', pa: 'ਪੂਰਵ ਅਨੁਮਾਨ', ar: 'التوقعات', es: 'Pronóstico',
        fr: 'Pronostic', de: 'Prognose', ru: 'Прогноз', pt: 'Prognóstico',
        ja: '予後', ko: '예후', tr: 'Prognoz', th: 'การพยากรณ์โรค',
        vi: 'Tiên lượng', id: 'Prognosis', ms: 'Prognosis', ur: 'تشخیصِ مرض',
        sw: 'Utabiri', zh: '预后',
    },
    'cond.emergencySigns': {
        en: 'Emergency Warning Signs', hi: 'आपातकालीन चेतावनी', ta: 'அவசர எச்சரிக்கை', te: 'అత్యవసర హెచ్చరిక',
        kn: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ', ml: 'അടിയന്തര മുന്നറിയിപ്പ്', mr: 'आपत्कालीन इशारे', gu: 'કટોકટી ચેતવણી',
        bn: 'জরুরি সতর্কতা', pa: 'ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ', ar: 'علامات الطوارئ', es: 'Signos de emergencia',
        fr: "Signes d'urgence", de: 'Notfall-Warnzeichen', ru: 'Экстренные признаки', pt: 'Sinais de emergência',
        ja: '緊急の警告サイン', ko: '응급 경고 징후', tr: 'Acil uyarı işaretleri', th: 'สัญญาณฉุกเฉิน',
        vi: 'Dấu hiệu khẩn cấp', id: 'Tanda darurat', ms: 'Tanda kecemasan', ur: 'ہنگامی علامات',
        sw: 'Dalili za dharura', zh: '紧急警告信号',
    },
    'cond.choosingHospital': {
        en: 'Choosing the Right Hospital', hi: 'सही अस्पताल चुनें', ta: 'சரியான மருத்துவமனையைத் தேர்ந்தெடுங்கள்',
        te: 'సరైన ఆసుపత్రిని ఎంచుకోండి', kn: 'ಸರಿಯಾದ ಆಸ್ಪತ್ರೆ ಆಯ್ಕೆ', ml: 'ശരിയായ ആശുപത്രി തിരഞ്ഞെടുക്കുക',
        mr: 'योग्य रुग्णालय निवडा', gu: 'યોગ્ય હોસ્પિટલ પસંદ કરો', bn: 'সঠিক হাসপাতাল বেছে নিন',
        pa: 'ਸਹੀ ਹਸਪਤਾਲ ਚੁਣੋ', ar: 'اختيار المستشفى المناسب', es: 'Elegir el hospital adecuado',
        fr: 'Choisir le bon hôpital', de: 'Das richtige Krankenhaus wählen', ru: 'Выбор подходящей больницы',
        pt: 'Escolher o hospital certo', ja: '適切な病院の選び方', ko: '올바른 병원 선택',
        tr: 'Doğru hastaneyi seçmek', th: 'เลือกโรงพยาบาลที่เหมาะสม', vi: 'Chọn bệnh viện phù hợp',
        id: 'Memilih rumah sakit yang tepat', ms: 'Memilih hospital yang sesuai', ur: 'صحیح ہسپتال کا انتخاب',
        sw: 'Kuchagua hospitali sahihi', zh: '选择合适的医院',
    },
    'cond.essentialFacilities': {
        en: 'Essential Facilities', hi: 'आवश्यक सुविधाएं', ta: 'அத்தியாவசிய வசதிகள்', te: 'ముఖ్యమైన సౌకర్యాలు',
        kn: 'ಅಗತ್ಯ ಸೌಲಭ್ಯಗಳು', ml: 'അത്യാവശ്യ സൗകര്യങ്ങൾ', mr: 'आवश्यक सुविधा', gu: 'જરૂરી સુવિધાઓ',
        bn: 'অপরিহার্য সুবিধা', pa: 'ਜ਼ਰੂਰੀ ਸਹੂਲਤਾਂ', ar: 'المرافق الأساسية', es: 'Instalaciones esenciales',
        fr: 'Installations essentielles', de: 'Wichtige Einrichtungen', ru: 'Необходимые учреждения', pt: 'Instalações essenciais',
        ja: '必要な施設', ko: '필수 시설', tr: 'Temel tesisler', th: 'สิ่งอำนวยความสะดวกสำคัญ',
        vi: 'Cơ sở thiết yếu', id: 'Fasilitas penting', ms: 'Kemudahan penting', ur: 'ضروری سہولیات',
        sw: 'Vifaa muhimu', zh: '基本设施',
    },
    'cond.relatedConditions': {
        en: 'Related Conditions', hi: 'संबंधित रोग', ta: 'தொடர்புடைய நிலைகள்', te: 'సంబంధిత పరిస్థితులు',
        kn: 'ಸಂಬಂಧಿತ ಪರಿಸ್ಥಿತಿಗಳು', ml: 'ബന്ധപ്പെട്ട അവസ്ഥകൾ', mr: 'संबंधित रोग', gu: 'સંબંધિત રોગો',
        bn: 'সম্পর্কিত রোগ', pa: 'ਸੰਬੰਧਿਤ ਰੋਗ', ar: 'حالات ذات صلة', es: 'Condiciones relacionadas',
        fr: 'Pathologies associées', de: 'Verwandte Erkrankungen', ru: 'Связанные заболевания', pt: 'Condições relacionadas',
        ja: '関連疾患', ko: '관련 질환', tr: 'İlişkili hastalıklar', th: 'โรคที่เกี่ยวข้อง',
        vi: 'Bệnh liên quan', id: 'Kondisi terkait', ms: 'Keadaan berkaitan', ur: 'متعلقہ امراض',
        sw: 'Hali zinazohusiana', zh: '相关疾病',
    },
    'cond.frequentlyAsked': {
        en: 'Frequently Asked Questions', hi: 'अक्सर पूछे जाने वाले प्रश्न', ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
        te: 'తరచుగా అడిగే ప్రశ్నలు', kn: 'ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು', ml: 'പതിവ് ചോദ്യങ്ങൾ',
        mr: 'वारंवार विचारले जाणारे प्रश्न', gu: 'વારંવાર પૂછાતા પ્રશ્નો', bn: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
        pa: 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ', ar: 'الأسئلة الشائعة', es: 'Preguntas frecuentes',
        fr: 'Questions fréquentes', de: 'Häufige Fragen', ru: 'Часто задаваемые вопросы', pt: 'Perguntas frequentes',
        ja: 'よくある質問', ko: '자주 묻는 질문', tr: 'Sıkça sorulan sorular', th: 'คำถามที่พบบ่อย',
        vi: 'Câu hỏi thường gặp', id: 'Pertanyaan yang sering diajukan', ms: 'Soalan lazim',
        ur: 'اکثر پوچھے جانے والے سوالات', sw: 'Maswali yanayoulizwa mara kwa mara', zh: '常见问题',
    },
    'cond.findYourSpecialist': {
        en: 'Find Your Specialist', hi: 'अपना विशेषज्ञ खोजें', ta: 'உங்கள் நிபுணரைக் கண்டறியுங்கள்',
        te: 'మీ నిపుణుడిని కనుగొనండి', kn: 'ನಿಮ್ಮ ತಜ್ಞರನ್ನು ಹುಡುಕಿ', ml: 'നിങ്ങളുടെ വിദഗ്ധനെ കണ്ടെത്തുക',
        mr: 'तुमचा विशेषज्ञ शोधा', gu: 'તમારા નિષ્ણાત શોધો', bn: 'আপনার বিশেষজ্ঞ খুঁজুন',
        pa: 'ਆਪਣਾ ਮਾਹਿਰ ਲੱਭੋ', ar: 'ابحث عن أخصائيك', es: 'Encuentra tu especialista',
        fr: 'Trouvez votre spécialiste', de: 'Finden Sie Ihren Spezialisten', ru: 'Найдите своего специалиста',
        pt: 'Encontre seu especialista', ja: 'あなたの専門医を見つける', ko: '전문의를 찾으세요',
        tr: 'Uzmanınızı bulun', th: 'ค้นหาผู้เชี่ยวชาญของคุณ', vi: 'Tìm chuyên gia của bạn',
        id: 'Temukan spesialis Anda', ms: 'Cari pakar anda', ur: 'اپنا ماہر تلاش کریں',
        sw: 'Tafuta mtaalamu wako', zh: '找到您的专科医生',
    },
    'cond.verifiedSpecialists': {
        en: 'Verified Specialists', hi: 'सत्यापित विशेषज्ञ', ta: 'சரிபார்க்கப்பட்ட நிபுணர்கள்',
        te: 'ధృవీకరించబడిన నిపుణులు', kn: 'ಪರಿಶೀಲಿಸಿದ ತಜ್ಞರು', ml: 'സ്ഥിരീകരിച്ച വിദഗ്ധർ',
        mr: 'सत्यापित विशेषज्ञ', gu: 'ચકાસાયેલ નિષ્ણાતો', bn: 'যাচাইকৃত বিশেষজ্ঞ',
        pa: 'ਤਸਦੀਕਸ਼ੁਦਾ ਮਾਹਿਰ', ar: 'أخصائيون معتمدون', es: 'Especialistas verificados',
        fr: 'Spécialistes vérifiés', de: 'Verifizierte Spezialisten', ru: 'Проверенные специалисты',
        pt: 'Especialistas verificados', ja: '認定専門医', ko: '검증된 전문의',
        tr: 'Doğrulanmış uzmanlar', th: 'ผู้เชี่ยวชาญที่ยืนยันแล้ว', vi: 'Chuyên gia đã xác minh',
        id: 'Spesialis terverifikasi', ms: 'Pakar yang disahkan', ur: 'تصدیق شدہ ماہرین',
        sw: 'Wataalamu waliothibitishwa', zh: '认证专科医生',
    },
    'cond.connectWithTop': {
        en: 'Connect with top', hi: 'शीर्ष से जुड़ें', ta: 'சிறந்தவர்களுடன் இணையுங்கள்',
        te: 'ఉత్తమ వారితో అనుసంధానం', kn: 'ಉತ್ತಮರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ', ml: 'മികച്ചവരുമായി ബന്ധപ്പെടുക',
        mr: 'उत्तमांशी जोडा', gu: 'શ્રેષ્ઠ સાથે જોડાઓ', bn: 'শীর্ষের সাথে যোগাযোগ করুন',
        pa: 'ਚੋਟੀ ਦੇ ਨਾਲ ਜੁੜੋ', ar: 'تواصل مع أفضل', es: 'Conecte con los mejores',
        fr: 'Connectez-vous avec les meilleurs', de: 'Verbinden Sie sich mit den besten', ru: 'Свяжитесь с лучшими',
        pt: 'Conecte-se com os melhores', ja: 'トップの専門家につながる', ko: '최고의 전문의와 연결',
        tr: 'En iyi uzmanlarla bağlantı kurun', th: 'เชื่อมต่อกับผู้เชี่ยวชาญชั้นนำ',
        vi: 'Kết nối với chuyên gia hàng đầu', id: 'Hubungi spesialis terbaik', ms: 'Berhubung dengan pakar terbaik',
        ur: 'بہترین ماہرین سے رابطہ کریں', sw: 'Wasiliana na wataalamu bora', zh: '连接顶级专家',
    },
    'cond.boardCertified': {
        en: 'Board-certified specialists with proven expertise in your condition',
        hi: 'आपकी स्थिति में सिद्ध विशेषज्ञता वाले प्रमाणित विशेषज्ञ',
        ta: 'உங்கள் நிலையில் நிரூபிக்கப்பட்ட நிபுணத்துவம் கொண்ட சான்றளிக்கப்பட்ட நிபுணர்கள்',
        te: 'మీ పరిస్థితిలో నిరూపించబడిన నైపుణ్యం కలిగిన ధృవీకరించబడిన నిపుణులు',
        kn: 'ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಸಾಬೀತಾದ ಪರಿಣತಿ ಹೊಂದಿರುವ ಪ್ರಮಾಣಿತ ತಜ್ಞರು',
        ml: 'നിങ്ങളുടെ അവസ്ഥയിൽ തെളിയിക്കപ്പെട്ട വൈദഗ്ധ്യമുള്ള സർട്ടിഫൈഡ് വിദഗ്ധർ',
        mr: 'तुमच्या स्थितीत सिद्ध कौशल्य असलेले प्रमाणित विशेषज्ञ', gu: 'તમારી સ્થિતિમાં સાબિત કુશળતા ધરાવતા પ્રમાણિત નિષ્ણાતો',
        bn: 'আপনার অবস্থায় প্রমাণিত দক্ষতা সম্পন্ন প্রত্যয়িত বিশেষজ্ঞ', pa: 'ਤੁਹਾਡੀ ਸਥਿਤੀ ਵਿੱਚ ਸਿੱਧ ਮਾਹਿਰਤਾ ਵਾਲੇ ਪ੍ਰਮਾਣਿਤ ਮਾਹਿਰ',
        ar: 'أخصائيون معتمدون ذوو خبرة مثبتة في حالتك', es: 'Especialistas certificados con experiencia comprobada en su condición',
        fr: 'Spécialistes certifiés avec une expertise prouvée dans votre pathologie', de: 'Zertifizierte Spezialisten mit nachgewiesener Expertise',
        ru: 'Сертифицированные специалисты с подтверждённым опытом', pt: 'Especialistas certificados com experiência comprovada na sua condição',
        ja: 'あなたの症状に実績のある認定専門医', ko: '귀하의 상태에 입증된 전문성을 가진 인증 전문의',
        tr: 'Durumunuzda kanıtlanmış uzmanlığa sahip sertifikalı uzmanlar', th: 'ผู้เชี่ยวชาญที่ได้รับการรับรองพร้อมความเชี่ยวชาญที่พิสูจน์แล้ว',
        vi: 'Chuyên gia được chứng nhận với chuyên môn đã được chứng minh', id: 'Spesialis bersertifikat dengan keahlian terbukti',
        ms: 'Pakar bertauliah dengan kepakaran terbukti', ur: 'آپ کی حالت میں ثابت مہارت والے مصدقہ ماہرین',
        sw: 'Wataalamu waliothibitishwa wenye ujuzi uliothbitishwa', zh: '拥有经过验证的专业知识的认证专科医生',
    },
    'cond.healthyHabits': {
        en: 'Healthy habits make a difference', hi: 'स्वस्थ आदतें बदलाव लाती हैं', ta: 'ஆரோக்கிய பழக்கங்கள் மாற்றத்தை ஏற்படுத்துகின்றன',
        te: 'ఆరోగ్యకరమైన అలవాట్లు మార్పు తెస్తాయి', kn: 'ಆರೋಗ್ಯಕರ ಅಭ್ಯಾಸಗಳು ವ್ಯತ್ಯಾಸ ತರುತ್ತವೆ', ml: 'ആരോഗ്യകരമായ ശീലങ്ങൾ മാറ്റം ഉണ്ടാക്കുന്നു',
        mr: 'आरोग्यदायी सवयी बदल घडवतात', gu: 'સ્વસ્થ ટેવો ફરક પાડે છે', bn: 'স্বাস্থ্যকর অভ্যাস পরিবর্তন আনে',
        pa: 'ਸਿਹਤਮੰਦ ਆਦਤਾਂ ਫਰਕ ਪਾਉਂਦੀਆਂ ਹਨ', ar: 'العادات الصحية تصنع الفرق', es: 'Los hábitos saludables marcan la diferencia',
        fr: 'Les bonnes habitudes font la différence', de: 'Gesunde Gewohnheiten machen den Unterschied', ru: 'Здоровые привычки меняют жизнь',
        pt: 'Hábitos saudáveis fazem a diferença', ja: '健康的な習慣が変化をもたらす', ko: '건강한 습관이 변화를 만듭니다',
        tr: 'Sağlıklı alışkanlıklar fark yaratır', th: 'นิสัยสุขภาพดีสร้างความแตกต่าง', vi: 'Thói quen lành mạnh tạo nên sự khác biệt',
        id: 'Kebiasaan sehat membuat perbedaan', ms: 'Tabiat sihat membuat perbezaan', ur: 'صحت مند عادات فرق ڈالتی ہیں',
        sw: 'Tabia za kiafya huleta mabadiliko', zh: '健康习惯带来改变',
    },
    'cond.smallDailyChanges': {
        en: 'Small daily changes lead to lasting health improvements', hi: 'छोटे दैनिक बदलाव स्थायी स्वास्थ्य सुधार लाते हैं',
        ta: 'சிறிய அன்றாட மாற்றங்கள் நிலையான ஆரோக்கிய மேம்பாடுகளுக்கு வழிவகுக்கும்',
        te: 'చిన్న రోజువారీ మార్పులు శాశ్వత ఆరోగ్య మెరుగుదలలకు దారితీస్తాయి',
        kn: 'ಸಣ್ಣ ದೈನಂದಿನ ಬದಲಾವಣೆಗಳು ಶಾಶ್ವತ ಆರೋಗ್ಯ ಸುಧಾರಣೆಗಳಿಗೆ ಕಾರಣವಾಗುತ್ತವೆ',
        ml: 'ചെറിയ ദൈനംദിന മാറ്റങ്ങൾ ശാശ്വതമായ ആരോഗ്യ മെച്ചപ്പെടുത്തലുകളിലേക്ക് നയിക്കുന്നു',
        mr: 'छोटे दैनंदिन बदल चिरस्थायी आरोग्य सुधार आणतात', gu: 'નાના દૈનિક ફેરફારો કાયમી સ્વાસ્થ્ય સુધારણા તરફ દોરી જાય છે',
        bn: 'ছোট দৈনিক পরিবর্তন স্থায়ী স্বাস্থ্য উন্নতি আনে', pa: 'ਛੋਟੀਆਂ ਰੋਜ਼ਾਨਾ ਤਬਦੀਲੀਆਂ ਸਥਾਈ ਸਿਹਤ ਸੁਧਾਰ ਲਿਆਉਂਦੀਆਂ ਹਨ',
        ar: 'التغييرات اليومية الصغيرة تؤدي إلى تحسينات صحية دائمة', es: 'Pequeños cambios diarios conducen a mejoras duraderas',
        fr: 'De petits changements quotidiens mènent à des améliorations durables', de: 'Kleine tägliche Änderungen führen zu dauerhaften Verbesserungen',
        ru: 'Маленькие ежедневные изменения ведут к устойчивому улучшению здоровья', pt: 'Pequenas mudanças diárias levam a melhorias duradouras',
        ja: '小さな日々の変化が持続的な健康改善につながる', ko: '작은 일상의 변화가 지속적인 건강 개선으로 이어집니다',
        tr: 'Küçük günlük değişiklikler kalıcı sağlık iyileşmelerine yol açar', th: 'การเปลี่ยนแปลงเล็กๆ ในแต่ละวันนำไปสู่การปรับปรุงสุขภาพที่ยั่งยืน',
        vi: 'Những thay đổi nhỏ hàng ngày dẫn đến cải thiện sức khỏe lâu dài', id: 'Perubahan kecil sehari-hari mengarah pada perbaikan kesehatan yang bertahan lama',
        ms: 'Perubahan kecil harian membawa kepada peningkatan kesihatan yang berkekalan', ur: 'چھوٹی روزانہ تبدیلیاں پائیدار صحت میں بہتری لاتی ہیں',
        sw: 'Mabadiliko madogo ya kila siku yanasababisha maboresho ya kudumu ya kiafya', zh: '每天的小改变带来持久的健康改善',
    },
    'cond.stayInformed': {
        en: 'Stay informed, stay ahead', hi: 'जानकार रहें, आगे रहें', ta: 'தகவல் அறிந்திருங்கள், முன்னேறுங்கள்',
        te: 'సమాచారంతో ఉండండి, ముందుండండి', kn: 'ಮಾಹಿತಿ ಪಡೆಯಿರಿ, ಮುಂದಿರಿ', ml: 'വിവരമുള്ളവരായിരിക്കുക, മുന്നിലായിരിക്കുക',
        mr: 'माहिती ठेवा, पुढे रहा', gu: 'માહિતગાર રહો, આગળ રહો', bn: 'অবগত থাকুন, এগিয়ে থাকুন',
        pa: 'ਜਾਣਕਾਰ ਰਹੋ, ਅੱਗੇ ਰਹੋ', ar: 'ابقَ على اطلاع، ابقَ في المقدمة', es: 'Mantente informado, mantente adelante',
        fr: 'Restez informé, gardez une longueur d\'avance', de: 'Bleiben Sie informiert, bleiben Sie voraus', ru: 'Будьте в курсе, будьте впереди',
        pt: 'Mantenha-se informado, mantenha-se à frente', ja: '情報を得て、一歩先へ', ko: '정보를 얻고 앞서 나가세요',
        tr: 'Bilgili olun, önde olun', th: 'รับข้อมูล ก้าวนำหน้า', vi: 'Cập nhật thông tin, đi trước',
        id: 'Tetap terinformasi, tetap selangkah lebih maju', ms: 'Kekal bermaklumat, kekal di hadapan', ur: 'باخبر رہیں، آگے رہیں',
        sw: 'Endelea kuwa na habari, endelea kuwa mbele', zh: '保持了解，保持领先',
    },
    'cond.understandingRisks': {
        en: 'Understanding risks helps you take timely action', hi: 'जोखिम समझने से समय पर कार्रवाई करने में मदद मिलती है',
        ta: 'அபாயங்களைப் புரிந்துகொள்வது சரியான நேரத்தில் நடவடிக்கை எடுக்க உதவுகிறது',
        te: 'రిస్క్‌లను అర్థం చేసుకోవడం సకాలంలో చర్య తీసుకోవడంలో సహాయపడుతుంది',
        kn: 'ಅಪಾಯಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು ಸಮಯೋಚಿತ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ',
        ml: 'അപകടസാധ്യതകൾ മനസ്സിലാക്കുന്നത് സമയോചിതമായ നടപടി എടുക്കാൻ സഹായിക്കുന്നു',
        mr: 'जोखीम समजून घेतल्याने वेळीच कृती करण्यास मदत होते', gu: 'જોખમો સમજવાથી સમયસર પગલાં લેવામાં મદદ મળે છે',
        bn: 'ঝুঁকি বোঝা সময়মতো পদক্ষেপ নিতে সাহায্য করে', pa: 'ਜੋਖਮਾਂ ਨੂੰ ਸਮਝਣਾ ਸਮੇਂ ਸਿਰ ਕਾਰਵਾਈ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ',
        ar: 'فهم المخاطر يساعدك على اتخاذ إجراء في الوقت المناسب', es: 'Comprender los riesgos le ayuda a actuar a tiempo',
        fr: 'Comprendre les risques vous aide à agir à temps', de: 'Das Verständnis von Risiken hilft Ihnen, rechtzeitig zu handeln',
        ru: 'Понимание рисков помогает вовремя принять меры', pt: 'Compreender os riscos ajuda a agir a tempo',
        ja: 'リスクを理解することで適切な対応ができます', ko: '위험을 이해하면 적시에 조치를 취할 수 있습니다',
        tr: 'Riskleri anlamak zamanında harekete geçmenize yardımcı olur', th: 'การเข้าใจความเสี่ยงช่วยให้คุณดำเนินการได้ทันเวลา',
        vi: 'Hiểu rõ rủi ro giúp bạn hành động kịp thời', id: 'Memahami risiko membantu Anda mengambil tindakan tepat waktu',
        ms: 'Memahami risiko membantu anda mengambil tindakan tepat pada masanya', ur: 'خطرات کو سمجھنا بروقت عمل کرنے میں مدد کرتا ہے',
        sw: 'Kuelewa hatari kunakusaidia kuchukua hatua kwa wakati', zh: '了解风险有助于及时采取行动',
    },
    'cond.findSpecialistFor': {
        en: 'Find the right specialist for your treatment', hi: 'अपने इलाज के लिए सही विशेषज्ञ खोजें',
        ta: 'உங்கள் சிகிச్சைக்கு சரியான நிபுணரைக் கண்டறியுங்கள்', te: 'మీ చికిత్సకు సరైన నిపుణుడిని కనుగొనండి',
        kn: 'ನಿಮ್ಮ ಚಿಕಿತ್ಸೆಗೆ ಸರಿಯಾದ ತಜ್ಞರನ್ನು ಹುಡುಕಿ', ml: 'നിങ്ങളുടെ ചികിത്സയ്ക്ക് ശരിയായ വിദഗ്ധനെ കണ്ടെത്തുക',
        mr: 'तुमच्या उपचारासाठी योग्य विशेषज्ञ शोधा', gu: 'તમારી સારવાર માટે યોગ્ય નિષ્ણાત શોધો',
        bn: 'আপনার চিকিৎসার জন্য সঠিক বিশেষজ্ঞ খুঁজুন', pa: 'ਆਪਣੇ ਇਲਾਜ ਲਈ ਸਹੀ ਮਾਹਿਰ ਲੱਭੋ',
        ar: 'ابحث عن الأخصائي المناسب لعلاجك', es: 'Encuentre al especialista adecuado para su tratamiento',
        fr: 'Trouvez le bon spécialiste pour votre traitement', de: 'Finden Sie den richtigen Spezialisten für Ihre Behandlung',
        ru: 'Найдите подходящего специалиста для вашего лечения', pt: 'Encontre o especialista certo para o seu tratamento',
        ja: 'あなたの治療に適した専門医を見つける', ko: '치료에 적합한 전문의를 찾으세요',
        tr: 'Tedaviniz için doğru uzmanı bulun', th: 'ค้นหาผู้เชี่ยวชาญที่เหมาะสมสำหรับการรักษาของคุณ',
        vi: 'Tìm chuyên gia phù hợp cho phương pháp điều trị của bạn', id: 'Temukan spesialis yang tepat untuk perawatan Anda',
        ms: 'Cari pakar yang sesuai untuk rawatan anda', ur: 'اپنے علاج کے لیے صحیح ماہر تلاش کریں',
        sw: 'Tafuta mtaalamu sahihi kwa matibabu yako', zh: '找到适合您治疗的专科医生',
    },
    'cond.procedure': {
        en: 'Procedure', hi: 'प्रक्रिया', ta: 'செயல்முறை', te: 'ప్రక్రియ', kn: 'ಪ್ರಕ್ರಿಯೆ', ml: 'നടപടിക്രമം',
        mr: 'प्रक्रिया', gu: 'પ્રક્રિયા', bn: 'পদ্ধতি', pa: 'ਪ੍ਰਕਿਰਿਆ', ar: 'الإجراء', es: 'Procedimiento',
        fr: 'Procédure', de: 'Verfahren', ru: 'Процедура', pt: 'Procedimento', ja: '手術', ko: '시술',
        tr: 'Prosedür', th: 'ขั้นตอน', vi: 'Thủ thuật', id: 'Prosedur', ms: 'Prosedur',
        ur: 'طریقہ کار', sw: 'Utaratibu', zh: '手术',
    },
    'cond.averageCost': {
        en: 'Average Cost', hi: 'औसत लागत', ta: 'சராசரி செலவு', te: 'సగటు ధర', kn: 'ಸರಾಸರಿ ವೆಚ್ಚ', ml: 'ശരാശരി ചെലവ്',
        mr: 'सरासरी खर्च', gu: 'સરેરાશ ખર્ચ', bn: 'গড় খরচ', pa: 'ਔਸਤ ਖਰਚ', ar: 'متوسط التكلفة', es: 'Costo promedio',
        fr: 'Coût moyen', de: 'Durchschnittliche Kosten', ru: 'Средняя стоимость', pt: 'Custo médio', ja: '平均費用', ko: '평균 비용',
        tr: 'Ortalama maliyet', th: 'ค่าใช้จ่ายเฉลี่ย', vi: 'Chi phí trung bình', id: 'Biaya rata-rata', ms: 'Kos purata',
        ur: 'اوسط لاگت', sw: 'Gharama wastani', zh: '平均费用',
    },
    'cond.medicalBoard': {
        en: 'Medical Board', hi: 'चिकित्सा बोर्ड', ta: 'மருத்துவ குழு', te: 'వైద్య బోర్డు', kn: 'ವೈದ್ಯಕೀಯ ಮಂಡಳಿ', ml: 'മെഡിക്കൽ ബോർഡ്',
        mr: 'वैद्यकीय मंडळ', gu: 'મેડિકલ બોર્ડ', bn: 'মেডিকেল বোর্ড', pa: 'ਮੈਡੀਕਲ ਬੋਰਡ', ar: 'المجلس الطبي', es: 'Junta Médica',
        fr: 'Conseil médical', de: 'Ärztlicher Beirat', ru: 'Медицинский совет', pt: 'Conselho Médico', ja: '医療委員会', ko: '의료위원회',
        tr: 'Tıbbi Kurul', th: 'คณะกรรมการแพทย์', vi: 'Hội đồng Y khoa', id: 'Dewan Medis', ms: 'Lembaga Perubatan',
        ur: 'میڈیکل بورڈ', sw: 'Bodi ya Matibabu', zh: '医学委员会',
    },
    'cond.findSpecialists': {
        en: 'Find Specialists', hi: 'विशेषज्ञ खोजें', ta: 'நிபுணர்களைக் கண்டறியுங்கள்', te: 'నిపుణులను కనుగొనండి',
        kn: 'ತಜ್ಞರನ್ನು ಹುಡುಕಿ', ml: 'വിദഗ്ധരെ കണ്ടെത്തുക', mr: 'विशेषज्ञ शोधा', gu: 'નિષ્ણાતો શોધો',
        bn: 'বিশেষজ্ঞ খুঁজুন', pa: 'ਮਾਹਿਰ ਲੱਭੋ', ar: 'ابحث عن أخصائيين', es: 'Buscar especialistas',
        fr: 'Trouver des spécialistes', de: 'Spezialisten finden', ru: 'Найти специалистов', pt: 'Encontrar especialistas',
        ja: '専門医を探す', ko: '전문의 찾기', tr: 'Uzmanları bul', th: 'ค้นหาผู้เชี่ยวชาญ',
        vi: 'Tìm chuyên gia', id: 'Cari spesialis', ms: 'Cari pakar', ur: 'ماہرین تلاش کریں',
        sw: 'Tafuta wataalamu', zh: '查找专科医生',
    },
};

async function main() {
    console.log('Seeding condition page UI translations...');
    let count = 0;

    for (const [key, langs] of Object.entries(TRANSLATIONS)) {
        for (const [langCode, value] of Object.entries(langs)) {
            await prisma.uiTranslation.upsert({
                where: {
                    languageCode_namespace_key: {
                        languageCode: langCode,
                        namespace: 'condition',
                        key,
                    },
                },
                update: { value },
                create: {
                    languageCode: langCode,
                    namespace: 'condition',
                    key,
                    value,
                },
            });
            count++;
        }
    }

    console.log(`Done! Seeded ${count} translations for ${Object.keys(TRANSLATIONS).length} keys in 26 languages.`);
    await prisma.$disconnect();
    pool.end();
}

main().catch(console.error);
