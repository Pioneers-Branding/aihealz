/**
 * Translation System for Medical Content
 *
 * Provides translated strings for treatments, conditions, and UI elements.
 * Translations are loaded from JSON files in /public/locales/{lang}/
 */

import { getLanguageConfig, isRTL } from './config';

// Common UI strings that are used across pages
export interface UITranslations {
    // Navigation
    home: string;
    treatments: string;
    conditions: string;
    doctors: string;
    hospitals: string;

    // Treatment page
    costComparison: string;
    costByCountry: string;
    whatIs: string;
    howItWorks: string;
    commonUses: string;
    sideEffects: string;
    whoMayBenefit: string;
    whatToExpect: string;
    importantConsiderations: string;
    findSpecialists: string;
    findDoctorsNearYou: string;
    relatedTreatments: string;
    medicalTravel: string;
    getFreeQuote: string;
    aiHealthAnalysis: string;
    analyzeReports: string;
    medicalReferences: string;
    faq: string;
    browseAllTreatments: string;

    // Common
    readMore: string;
    learnMore: string;
    viewAll: string;
    search: string;
    searchPlaceholder: string;
    loading: string;
    error: string;
    notFound: string;
    backTo: string;

    // Costs
    priceRange: string;
    usdEquivalent: string;
    yourLocation: string;
    priceDisclaimer: string;
    potentialSavings: string;

    // Treatment types
    medicalManagement: string;
    surgicalProcedure: string;
    prescriptionDrug: string;
    injectableTreatment: string;
    otcMedication: string;
    homeRemedy: string;
    therapy: string;

    // Labels
    genericAvailable: string;
    prescriptionRequired: string;
    brandNames: string;
    duration: string;
    setting: string;
    recovery: string;
}

// Base English translations
const englishUI: UITranslations = {
    // Navigation
    home: 'Home',
    treatments: 'Treatments',
    conditions: 'Conditions',
    doctors: 'Doctors',
    hospitals: 'Hospitals',

    // Treatment page
    costComparison: 'Cost Comparison',
    costByCountry: 'Cost Comparison by Country',
    whatIs: 'What is',
    howItWorks: 'How It Works',
    commonUses: 'Common Uses & Indications',
    sideEffects: 'Possible Side Effects',
    whoMayBenefit: 'Who May Benefit',
    whatToExpect: 'What to Expect',
    importantConsiderations: 'Important Considerations',
    findSpecialists: 'Find Specialists',
    findDoctorsNearYou: 'Find Doctors Near You',
    relatedTreatments: 'Related Treatments',
    medicalTravel: 'Medical Travel',
    getFreeQuote: 'Get Free Quote',
    aiHealthAnalysis: 'AI Health Analysis',
    analyzeReports: 'Analyze Your Reports',
    medicalReferences: 'Medical References',
    faq: 'Frequently Asked Questions',
    browseAllTreatments: 'Browse All Treatments',

    // Common
    readMore: 'Read More',
    learnMore: 'Learn More',
    viewAll: 'View All',
    search: 'Search',
    searchPlaceholder: 'Search treatments, conditions...',
    loading: 'Loading...',
    error: 'An error occurred',
    notFound: 'Not Found',
    backTo: 'Back to',

    // Costs
    priceRange: 'Price Range',
    usdEquivalent: 'USD equivalent',
    yourLocation: 'Your Location',
    priceDisclaimer: 'Prices are estimates and may vary based on hospital, facility, and individual requirements.',
    potentialSavings: 'Potential Savings',

    // Treatment types
    medicalManagement: 'Medical Management',
    surgicalProcedure: 'Surgical Procedure',
    prescriptionDrug: 'Prescription Drug',
    injectableTreatment: 'Injectable Treatment',
    otcMedication: 'Over-the-Counter',
    homeRemedy: 'Home Remedy',
    therapy: 'Therapy / Rehabilitation',

    // Labels
    genericAvailable: 'Generic Available',
    prescriptionRequired: 'Rx Required',
    brandNames: 'Brand Names',
    duration: 'Duration',
    setting: 'Setting',
    recovery: 'Recovery',
};

// Hindi translations
const hindiUI: UITranslations = {
    // Navigation
    home: 'होम',
    treatments: 'उपचार',
    conditions: 'स्थितियाँ',
    doctors: 'डॉक्टर',
    hospitals: 'अस्पताल',

    // Treatment page
    costComparison: 'लागत तुलना',
    costByCountry: 'देश के अनुसार लागत तुलना',
    whatIs: 'क्या है',
    howItWorks: 'यह कैसे काम करता है',
    commonUses: 'सामान्य उपयोग और संकेत',
    sideEffects: 'संभावित दुष्प्रभाव',
    whoMayBenefit: 'किसे लाभ हो सकता है',
    whatToExpect: 'क्या उम्मीद करें',
    importantConsiderations: 'महत्वपूर्ण विचार',
    findSpecialists: 'विशेषज्ञ खोजें',
    findDoctorsNearYou: 'अपने पास डॉक्टर खोजें',
    relatedTreatments: 'संबंधित उपचार',
    medicalTravel: 'चिकित्सा यात्रा',
    getFreeQuote: 'मुफ्त कोटेशन पाएं',
    aiHealthAnalysis: 'AI स्वास्थ्य विश्लेषण',
    analyzeReports: 'अपनी रिपोर्ट का विश्लेषण करें',
    medicalReferences: 'चिकित्सा संदर्भ',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    browseAllTreatments: 'सभी उपचार देखें',

    // Common
    readMore: 'और पढ़ें',
    learnMore: 'और जानें',
    viewAll: 'सभी देखें',
    search: 'खोजें',
    searchPlaceholder: 'उपचार, स्थितियाँ खोजें...',
    loading: 'लोड हो रहा है...',
    error: 'एक त्रुटि हुई',
    notFound: 'नहीं मिला',
    backTo: 'वापस जाएं',

    // Costs
    priceRange: 'मूल्य सीमा',
    usdEquivalent: 'USD समकक्ष',
    yourLocation: 'आपका स्थान',
    priceDisclaimer: 'कीमतें अनुमान हैं और अस्पताल, सुविधा और व्यक्तिगत आवश्यकताओं के आधार पर भिन्न हो सकती हैं।',
    potentialSavings: 'संभावित बचत',

    // Treatment types
    medicalManagement: 'चिकित्सा प्रबंधन',
    surgicalProcedure: 'सर्जिकल प्रक्रिया',
    prescriptionDrug: 'प्रिस्क्रिप्शन दवा',
    injectableTreatment: 'इंजेक्शन उपचार',
    otcMedication: 'ओवर-द-काउंटर',
    homeRemedy: 'घरेलू उपचार',
    therapy: 'थेरेपी / पुनर्वास',

    // Labels
    genericAvailable: 'जेनेरिक उपलब्ध',
    prescriptionRequired: 'प्रिस्क्रिप्शन आवश्यक',
    brandNames: 'ब्रांड नाम',
    duration: 'अवधि',
    setting: 'सेटिंग',
    recovery: 'रिकवरी',
};

// Arabic translations (RTL)
const arabicUI: UITranslations = {
    // Navigation
    home: 'الرئيسية',
    treatments: 'العلاجات',
    conditions: 'الحالات',
    doctors: 'الأطباء',
    hospitals: 'المستشفيات',

    // Treatment page
    costComparison: 'مقارنة التكلفة',
    costByCountry: 'مقارنة التكلفة حسب الدولة',
    whatIs: 'ما هو',
    howItWorks: 'كيف يعمل',
    commonUses: 'الاستخدامات الشائعة والمؤشرات',
    sideEffects: 'الآثار الجانبية المحتملة',
    whoMayBenefit: 'من قد يستفيد',
    whatToExpect: 'ماذا تتوقع',
    importantConsiderations: 'اعتبارات مهمة',
    findSpecialists: 'ابحث عن المتخصصين',
    findDoctorsNearYou: 'ابحث عن أطباء بالقرب منك',
    relatedTreatments: 'العلاجات ذات الصلة',
    medicalTravel: 'السياحة العلاجية',
    getFreeQuote: 'احصل على عرض مجاني',
    aiHealthAnalysis: 'تحليل صحي بالذكاء الاصطناعي',
    analyzeReports: 'حلل تقاريرك',
    medicalReferences: 'المراجع الطبية',
    faq: 'الأسئلة المتكررة',
    browseAllTreatments: 'تصفح جميع العلاجات',

    // Common
    readMore: 'اقرأ المزيد',
    learnMore: 'تعلم المزيد',
    viewAll: 'عرض الكل',
    search: 'بحث',
    searchPlaceholder: 'ابحث عن العلاجات والحالات...',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    notFound: 'غير موجود',
    backTo: 'العودة إلى',

    // Costs
    priceRange: 'نطاق السعر',
    usdEquivalent: 'ما يعادل بالدولار',
    yourLocation: 'موقعك',
    priceDisclaimer: 'الأسعار تقديرية وقد تختلف حسب المستشفى والمرافق والمتطلبات الفردية.',
    potentialSavings: 'التوفير المحتمل',

    // Treatment types
    medicalManagement: 'الإدارة الطبية',
    surgicalProcedure: 'إجراء جراحي',
    prescriptionDrug: 'دواء بوصفة طبية',
    injectableTreatment: 'علاج بالحقن',
    otcMedication: 'بدون وصفة طبية',
    homeRemedy: 'علاج منزلي',
    therapy: 'العلاج / إعادة التأهيل',

    // Labels
    genericAvailable: 'متوفر عام',
    prescriptionRequired: 'يتطلب وصفة طبية',
    brandNames: 'الأسماء التجارية',
    duration: 'المدة',
    setting: 'المكان',
    recovery: 'التعافي',
};

// Tamil translations
const tamilUI: UITranslations = {
    // Navigation
    home: 'முகப்பு',
    treatments: 'சிகிச்சைகள்',
    conditions: 'நிலைமைகள்',
    doctors: 'மருத்துவர்கள்',
    hospitals: 'மருத்துவமனைகள்',

    // Treatment page
    costComparison: 'செலவு ஒப்பீடு',
    costByCountry: 'நாடு வாரியாக செலவு ஒப்பீடு',
    whatIs: 'என்றால் என்ன',
    howItWorks: 'இது எப்படி வேலை செய்கிறது',
    commonUses: 'பொதுவான பயன்பாடுகள் மற்றும் அறிகுறிகள்',
    sideEffects: 'சாத்தியமான பக்க விளைவுகள்',
    whoMayBenefit: 'யாருக்கு பயன் கிடைக்கும்',
    whatToExpect: 'என்ன எதிர்பார்க்கலாம்',
    importantConsiderations: 'முக்கிய கருத்தில் கொள்ள வேண்டியவை',
    findSpecialists: 'நிபுணர்களைக் கண்டறியுங்கள்',
    findDoctorsNearYou: 'உங்கள் அருகில் மருத்துவர்களைக் கண்டறியுங்கள்',
    relatedTreatments: 'தொடர்புடைய சிகிச்சைகள்',
    medicalTravel: 'மருத்துவ சுற்றுலா',
    getFreeQuote: 'இலவச மதிப்பீடு பெறுங்கள்',
    aiHealthAnalysis: 'AI சுகாதார பகுப்பாய்வு',
    analyzeReports: 'உங்கள் அறிக்கைகளை பகுப்பாய்வு செய்யுங்கள்',
    medicalReferences: 'மருத்துவ குறிப்புகள்',
    faq: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    browseAllTreatments: 'அனைத்து சிகிச்சைகளையும் பார்க்கவும்',

    // Common
    readMore: 'மேலும் படிக்க',
    learnMore: 'மேலும் அறிய',
    viewAll: 'அனைத்தையும் காண',
    search: 'தேடு',
    searchPlaceholder: 'சிகிச்சைகள், நிலைமைகளைத் தேடுங்கள்...',
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை ஏற்பட்டது',
    notFound: 'கிடைக்கவில்லை',
    backTo: 'திரும்பு',

    // Costs
    priceRange: 'விலை வரம்பு',
    usdEquivalent: 'USD சமானமாக',
    yourLocation: 'உங்கள் இருப்பிடம்',
    priceDisclaimer: 'விலைகள் மதிப்பீடுகள் மற்றும் மருத்துவமனை, வசதி மற்றும் தனிப்பட்ட தேவைகளின் அடிப்படையில் மாறுபடலாம்.',
    potentialSavings: 'சாத்தியமான சேமிப்புகள்',

    // Treatment types
    medicalManagement: 'மருத்துவ மேலாண்மை',
    surgicalProcedure: 'அறுவை சிகிச்சை நடைமுறை',
    prescriptionDrug: 'மருந்து சீட்டு மருந்து',
    injectableTreatment: 'ஊசி சிகிச்சை',
    otcMedication: 'மருந்து சீட்டு இல்லாமல்',
    homeRemedy: 'வீட்டு வைத்தியம்',
    therapy: 'சிகிச்சை / மறுவாழ்வு',

    // Labels
    genericAvailable: 'ஜெனரிக் கிடைக்கும்',
    prescriptionRequired: 'மருந்து சீட்டு தேவை',
    brandNames: 'பிராண்ட் பெயர்கள்',
    duration: 'காலம்',
    setting: 'இடம்',
    recovery: 'மீட்பு',
};

// Bengali translations
const bengaliUI: UITranslations = {
    // Navigation
    home: 'হোম',
    treatments: 'চিকিৎসা',
    conditions: 'অবস্থা',
    doctors: 'ডাক্তার',
    hospitals: 'হাসপাতাল',

    // Treatment page
    costComparison: 'খরচ তুলনা',
    costByCountry: 'দেশ অনুযায়ী খরচ তুলনা',
    whatIs: 'কি',
    howItWorks: 'এটি কিভাবে কাজ করে',
    commonUses: 'সাধারণ ব্যবহার এবং নির্দেশাবলী',
    sideEffects: 'সম্ভাব্য পার্শ্ব প্রতিক্রিয়া',
    whoMayBenefit: 'কারা উপকৃত হতে পারে',
    whatToExpect: 'কি আশা করা যায়',
    importantConsiderations: 'গুরুত্বপূর্ণ বিবেচনা',
    findSpecialists: 'বিশেষজ্ঞ খুঁজুন',
    findDoctorsNearYou: 'আপনার কাছাকাছি ডাক্তার খুঁজুন',
    relatedTreatments: 'সম্পর্কিত চিকিৎসা',
    medicalTravel: 'চিকিৎসা ভ্রমণ',
    getFreeQuote: 'বিনামূল্যে উদ্ধৃতি পান',
    aiHealthAnalysis: 'AI স্বাস্থ্য বিশ্লেষণ',
    analyzeReports: 'আপনার রিপোর্ট বিশ্লেষণ করুন',
    medicalReferences: 'চিকিৎসা রেফারেন্স',
    faq: 'প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী',
    browseAllTreatments: 'সমস্ত চিকিৎসা দেখুন',

    // Common
    readMore: 'আরো পড়ুন',
    learnMore: 'আরো জানুন',
    viewAll: 'সব দেখুন',
    search: 'অনুসন্ধান',
    searchPlaceholder: 'চিকিৎসা, অবস্থা অনুসন্ধান করুন...',
    loading: 'লোড হচ্ছে...',
    error: 'একটি ত্রুটি ঘটেছে',
    notFound: 'পাওয়া যায়নি',
    backTo: 'ফিরে যান',

    // Costs
    priceRange: 'মূল্য পরিসীমা',
    usdEquivalent: 'USD সমতুল্য',
    yourLocation: 'আপনার অবস্থান',
    priceDisclaimer: 'দামগুলি অনুমান এবং হাসপাতাল, সুবিধা এবং ব্যক্তিগত প্রয়োজনীয়তার উপর ভিত্তি করে পরিবর্তিত হতে পারে।',
    potentialSavings: 'সম্ভাব্য সঞ্চয়',

    // Treatment types
    medicalManagement: 'চিকিৎসা ব্যবস্থাপনা',
    surgicalProcedure: 'অস্ত্রোপচার পদ্ধতি',
    prescriptionDrug: 'প্রেসক্রিপশন ওষুধ',
    injectableTreatment: 'ইনজেকশন চিকিৎসা',
    otcMedication: 'ওভার-দ্য-কাউন্টার',
    homeRemedy: 'ঘরোয়া প্রতিকার',
    therapy: 'থেরাপি / পুনর্বাসন',

    // Labels
    genericAvailable: 'জেনেরিক উপলব্ধ',
    prescriptionRequired: 'প্রেসক্রিপশন প্রয়োজন',
    brandNames: 'ব্র্যান্ড নাম',
    duration: 'সময়কাল',
    setting: 'সেটিং',
    recovery: 'পুনরুদ্ধার',
};

// Telugu translations
const teluguUI: UITranslations = {
    home: 'హోమ్', treatments: 'చికిత్సలు', conditions: 'పరిస్థితులు', doctors: 'వైద్యులు', hospitals: 'ఆసుపత్రులు',
    costComparison: 'ఖర్చు పోలిక', costByCountry: 'దేశం వారీగా ఖర్చు పోలిక', whatIs: 'ఏమిటి', howItWorks: 'ఇది ఎలా పనిచేస్తుంది',
    commonUses: 'సాధారణ ఉపయోగాలు & సూచనలు', sideEffects: 'సంభావ్య దుష్ప్రభావాలు', whoMayBenefit: 'ఎవరికి ప్రయోజనం',
    whatToExpect: 'ఏమి ఆశించాలి', importantConsiderations: 'ముఖ్యమైన పరిగణనలు', findSpecialists: 'నిపుణులను కనుగొనండి',
    findDoctorsNearYou: 'మీ సమీపంలో వైద్యులను కనుగొనండి', relatedTreatments: 'సంబంధిత చికిత్సలు', medicalTravel: 'వైద్య పర్యటన',
    getFreeQuote: 'ఉచిత కోట్ పొందండి', aiHealthAnalysis: 'AI ఆరోగ్య విశ్లేషణ', analyzeReports: 'మీ నివేదికలను విశ్లేషించండి',
    medicalReferences: 'వైద్య సూచనలు', faq: 'తరచుగా అడిగే ప్రశ్నలు', browseAllTreatments: 'అన్ని చికిత్సలు చూడండి',
    readMore: 'మరింత చదవండి', learnMore: 'మరింత తెలుసుకోండి', viewAll: 'అన్నీ చూడండి', search: 'వెతకండి',
    searchPlaceholder: 'చికిత్సలు, పరిస్థితులు వెతకండి...', loading: 'లోడ్ అవుతోంది...', error: 'లోపం సంభవించింది', notFound: 'కనుగొనబడలేదు', backTo: 'తిరిగి వెళ్ళు',
    priceRange: 'ధర పరిధి', usdEquivalent: 'USD సమానం', yourLocation: 'మీ స్థానం',
    priceDisclaimer: 'ధరలు అంచనాలు మరియు ఆసుపత్రి, సౌకర్యం మరియు వ్యక్తిగత అవసరాల ఆధారంగా మారవచ్చు.',
    potentialSavings: 'సంభావ్య ఆదా', medicalManagement: 'వైద్య నిర్వహణ', surgicalProcedure: 'శస్త్రచికిత్స విధానం',
    prescriptionDrug: 'ప్రిస్క్రిప్షన్ మందు', injectableTreatment: 'ఇంజెక్షన్ చికిత్స', otcMedication: 'ఓవర్-ది-కౌంటర్',
    homeRemedy: 'ఇంటి వైద్యం', therapy: 'థెరపీ / పునరావాసం', genericAvailable: 'జెనెరిక్ అందుబాటులో ఉంది',
    prescriptionRequired: 'ప్రిస్క్రిప్షన్ అవసరం', brandNames: 'బ్రాండ్ పేర్లు', duration: 'వ్యవధి', setting: 'సెట్టింగ్', recovery: 'రికవరీ',
};

// Kannada translations
const kannadaUI: UITranslations = {
    home: 'ಮುಖಪುಟ', treatments: 'ಚಿಕಿತ್ಸೆಗಳು', conditions: 'ಸ್ಥಿತಿಗಳು', doctors: 'ವೈದ್ಯರು', hospitals: 'ಆಸ್ಪತ್ರೆಗಳು',
    costComparison: 'ವೆಚ್ಚ ಹೋಲಿಕೆ', costByCountry: 'ದೇಶದ ಪ್ರಕಾರ ವೆಚ್ಚ ಹೋಲಿಕೆ', whatIs: 'ಏನು', howItWorks: 'ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    commonUses: 'ಸಾಮಾನ್ಯ ಬಳಕೆಗಳು & ಸೂಚನೆಗಳು', sideEffects: 'ಸಂಭಾವ್ಯ ಅಡ್ಡ ಪರಿಣಾಮಗಳು', whoMayBenefit: 'ಯಾರು ಪ್ರಯೋಜನ ಪಡೆಯಬಹುದು',
    whatToExpect: 'ಏನು ನಿರೀಕ್ಷಿಸಬೇಕು', importantConsiderations: 'ಪ್ರಮುಖ ಪರಿಗಣನೆಗಳು', findSpecialists: 'ತಜ್ಞರನ್ನು ಹುಡುಕಿ',
    findDoctorsNearYou: 'ನಿಮ್ಮ ಬಳಿ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ', relatedTreatments: 'ಸಂಬಂಧಿತ ಚಿಕಿತ್ಸೆಗಳು', medicalTravel: 'ವೈದ್ಯಕೀಯ ಪ್ರಯಾಣ',
    getFreeQuote: 'ಉಚಿತ ಕೋಟ್ ಪಡೆಯಿರಿ', aiHealthAnalysis: 'AI ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ', analyzeReports: 'ನಿಮ್ಮ ವರದಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
    medicalReferences: 'ವೈದ್ಯಕೀಯ ಉಲ್ಲೇಖಗಳು', faq: 'ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು', browseAllTreatments: 'ಎಲ್ಲಾ ಚಿಕಿತ್ಸೆಗಳನ್ನು ನೋಡಿ',
    readMore: 'ಇನ್ನಷ್ಟು ಓದಿ', learnMore: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ', viewAll: 'ಎಲ್ಲಾ ನೋಡಿ', search: 'ಹುಡುಕಿ',
    searchPlaceholder: 'ಚಿಕಿತ್ಸೆಗಳು, ಸ್ಥಿತಿಗಳನ್ನು ಹುಡುಕಿ...', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', error: 'ದೋಷ ಸಂಭವಿಸಿದೆ', notFound: 'ಕಂಡುಬಂದಿಲ್ಲ', backTo: 'ಹಿಂತಿರುಗಿ',
    priceRange: 'ಬೆಲೆ ಶ್ರೇಣಿ', usdEquivalent: 'USD ಸಮಾನ', yourLocation: 'ನಿಮ್ಮ ಸ್ಥಳ',
    priceDisclaimer: 'ಬೆಲೆಗಳು ಅಂದಾಜುಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆ, ಸೌಲಭ್ಯ ಮತ್ತು ವೈಯಕ್ತಿಕ ಅವಶ್ಯಕತೆಗಳ ಆಧಾರದ ಮೇಲೆ ಬದಲಾಗಬಹುದು.',
    potentialSavings: 'ಸಂಭಾವ್ಯ ಉಳಿತಾಯ', medicalManagement: 'ವೈದ್ಯಕೀಯ ನಿರ್ವಹಣೆ', surgicalProcedure: 'ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ವಿಧಾನ',
    prescriptionDrug: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಔಷಧ', injectableTreatment: 'ಇಂಜೆಕ್ಷನ್ ಚಿಕಿತ್ಸೆ', otcMedication: 'ಓವರ್-ದಿ-ಕೌಂಟರ್',
    homeRemedy: 'ಮನೆ ಮದ್ದು', therapy: 'ಥೆರಪಿ / ಪುನರ್ವಸತಿ', genericAvailable: 'ಜೆನೆರಿಕ್ ಲಭ್ಯವಿದೆ',
    prescriptionRequired: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಗತ್ಯ', brandNames: 'ಬ್ರಾಂಡ್ ಹೆಸರುಗಳು', duration: 'ಅವಧಿ', setting: 'ಸೆಟ್ಟಿಂಗ್', recovery: 'ಚೇತರಿಕೆ',
};

// Spanish translations
const spanishUI: UITranslations = {
    home: 'Inicio', treatments: 'Tratamientos', conditions: 'Condiciones', doctors: 'Médicos', hospitals: 'Hospitales',
    costComparison: 'Comparación de Costos', costByCountry: 'Comparación de Costos por País', whatIs: 'Qué es', howItWorks: 'Cómo Funciona',
    commonUses: 'Usos Comunes e Indicaciones', sideEffects: 'Posibles Efectos Secundarios', whoMayBenefit: 'Quién Puede Beneficiarse',
    whatToExpect: 'Qué Esperar', importantConsiderations: 'Consideraciones Importantes', findSpecialists: 'Encontrar Especialistas',
    findDoctorsNearYou: 'Encontrar Médicos Cerca de Ti', relatedTreatments: 'Tratamientos Relacionados', medicalTravel: 'Turismo Médico',
    getFreeQuote: 'Obtener Cotización Gratis', aiHealthAnalysis: 'Análisis de Salud con IA', analyzeReports: 'Analizar tus Informes',
    medicalReferences: 'Referencias Médicas', faq: 'Preguntas Frecuentes', browseAllTreatments: 'Ver Todos los Tratamientos',
    readMore: 'Leer Más', learnMore: 'Saber Más', viewAll: 'Ver Todo', search: 'Buscar',
    searchPlaceholder: 'Buscar tratamientos, condiciones...', loading: 'Cargando...', error: 'Ocurrió un error', notFound: 'No Encontrado', backTo: 'Volver a',
    priceRange: 'Rango de Precio', usdEquivalent: 'Equivalente en USD', yourLocation: 'Tu Ubicación',
    priceDisclaimer: 'Los precios son estimaciones y pueden variar según el hospital, las instalaciones y los requisitos individuales.',
    potentialSavings: 'Ahorro Potencial', medicalManagement: 'Gestión Médica', surgicalProcedure: 'Procedimiento Quirúrgico',
    prescriptionDrug: 'Medicamento con Receta', injectableTreatment: 'Tratamiento Inyectable', otcMedication: 'Sin Receta',
    homeRemedy: 'Remedio Casero', therapy: 'Terapia / Rehabilitación', genericAvailable: 'Genérico Disponible',
    prescriptionRequired: 'Requiere Receta', brandNames: 'Nombres Comerciales', duration: 'Duración', setting: 'Entorno', recovery: 'Recuperación',
};

// French translations
const frenchUI: UITranslations = {
    home: 'Accueil', treatments: 'Traitements', conditions: 'Conditions', doctors: 'Médecins', hospitals: 'Hôpitaux',
    costComparison: 'Comparaison des Coûts', costByCountry: 'Comparaison des Coûts par Pays', whatIs: 'Qu\'est-ce que', howItWorks: 'Comment ça Marche',
    commonUses: 'Utilisations Courantes et Indications', sideEffects: 'Effets Secondaires Possibles', whoMayBenefit: 'Qui Peut en Bénéficier',
    whatToExpect: 'À Quoi S\'attendre', importantConsiderations: 'Considérations Importantes', findSpecialists: 'Trouver des Spécialistes',
    findDoctorsNearYou: 'Trouver des Médecins Près de Vous', relatedTreatments: 'Traitements Connexes', medicalTravel: 'Tourisme Médical',
    getFreeQuote: 'Obtenir un Devis Gratuit', aiHealthAnalysis: 'Analyse de Santé IA', analyzeReports: 'Analyser vos Rapports',
    medicalReferences: 'Références Médicales', faq: 'Questions Fréquentes', browseAllTreatments: 'Voir Tous les Traitements',
    readMore: 'Lire Plus', learnMore: 'En Savoir Plus', viewAll: 'Voir Tout', search: 'Rechercher',
    searchPlaceholder: 'Rechercher traitements, conditions...', loading: 'Chargement...', error: 'Une erreur est survenue', notFound: 'Non Trouvé', backTo: 'Retour à',
    priceRange: 'Fourchette de Prix', usdEquivalent: 'Équivalent USD', yourLocation: 'Votre Emplacement',
    priceDisclaimer: 'Les prix sont des estimations et peuvent varier selon l\'hôpital, les installations et les exigences individuelles.',
    potentialSavings: 'Économies Potentielles', medicalManagement: 'Gestion Médicale', surgicalProcedure: 'Procédure Chirurgicale',
    prescriptionDrug: 'Médicament sur Ordonnance', injectableTreatment: 'Traitement Injectable', otcMedication: 'Sans Ordonnance',
    homeRemedy: 'Remède Maison', therapy: 'Thérapie / Rééducation', genericAvailable: 'Générique Disponible',
    prescriptionRequired: 'Ordonnance Requise', brandNames: 'Noms de Marque', duration: 'Durée', setting: 'Cadre', recovery: 'Récupération',
};

// German translations
const germanUI: UITranslations = {
    home: 'Startseite', treatments: 'Behandlungen', conditions: 'Erkrankungen', doctors: 'Ärzte', hospitals: 'Krankenhäuser',
    costComparison: 'Kostenvergleich', costByCountry: 'Kostenvergleich nach Land', whatIs: 'Was ist', howItWorks: 'Wie es Funktioniert',
    commonUses: 'Häufige Anwendungen & Indikationen', sideEffects: 'Mögliche Nebenwirkungen', whoMayBenefit: 'Wer Profitieren Kann',
    whatToExpect: 'Was zu Erwarten ist', importantConsiderations: 'Wichtige Überlegungen', findSpecialists: 'Spezialisten Finden',
    findDoctorsNearYou: 'Ärzte in Ihrer Nähe Finden', relatedTreatments: 'Verwandte Behandlungen', medicalTravel: 'Medizintourismus',
    getFreeQuote: 'Kostenloses Angebot Erhalten', aiHealthAnalysis: 'KI-Gesundheitsanalyse', analyzeReports: 'Ihre Berichte Analysieren',
    medicalReferences: 'Medizinische Referenzen', faq: 'Häufige Fragen', browseAllTreatments: 'Alle Behandlungen Durchsuchen',
    readMore: 'Mehr Lesen', learnMore: 'Mehr Erfahren', viewAll: 'Alle Anzeigen', search: 'Suchen',
    searchPlaceholder: 'Behandlungen, Erkrankungen suchen...', loading: 'Laden...', error: 'Ein Fehler ist aufgetreten', notFound: 'Nicht Gefunden', backTo: 'Zurück zu',
    priceRange: 'Preisbereich', usdEquivalent: 'USD-Äquivalent', yourLocation: 'Ihr Standort',
    priceDisclaimer: 'Die Preise sind Schätzungen und können je nach Krankenhaus, Einrichtung und individuellen Anforderungen variieren.',
    potentialSavings: 'Mögliche Einsparungen', medicalManagement: 'Medizinisches Management', surgicalProcedure: 'Chirurgischer Eingriff',
    prescriptionDrug: 'Verschreibungspflichtiges Medikament', injectableTreatment: 'Injektionsbehandlung', otcMedication: 'Rezeptfrei',
    homeRemedy: 'Hausmittel', therapy: 'Therapie / Rehabilitation', genericAvailable: 'Generikum Verfügbar',
    prescriptionRequired: 'Rezept Erforderlich', brandNames: 'Markennamen', duration: 'Dauer', setting: 'Umgebung', recovery: 'Erholung',
};

// Portuguese translations
const portugueseUI: UITranslations = {
    home: 'Início', treatments: 'Tratamentos', conditions: 'Condições', doctors: 'Médicos', hospitals: 'Hospitais',
    costComparison: 'Comparação de Custos', costByCountry: 'Comparação de Custos por País', whatIs: 'O que é', howItWorks: 'Como Funciona',
    commonUses: 'Usos Comuns e Indicações', sideEffects: 'Possíveis Efeitos Colaterais', whoMayBenefit: 'Quem Pode se Beneficiar',
    whatToExpect: 'O que Esperar', importantConsiderations: 'Considerações Importantes', findSpecialists: 'Encontrar Especialistas',
    findDoctorsNearYou: 'Encontrar Médicos Perto de Você', relatedTreatments: 'Tratamentos Relacionados', medicalTravel: 'Turismo Médico',
    getFreeQuote: 'Obter Orçamento Grátis', aiHealthAnalysis: 'Análise de Saúde com IA', analyzeReports: 'Analisar seus Relatórios',
    medicalReferences: 'Referências Médicas', faq: 'Perguntas Frequentes', browseAllTreatments: 'Ver Todos os Tratamentos',
    readMore: 'Ler Mais', learnMore: 'Saiba Mais', viewAll: 'Ver Tudo', search: 'Buscar',
    searchPlaceholder: 'Buscar tratamentos, condições...', loading: 'Carregando...', error: 'Ocorreu um erro', notFound: 'Não Encontrado', backTo: 'Voltar para',
    priceRange: 'Faixa de Preço', usdEquivalent: 'Equivalente em USD', yourLocation: 'Sua Localização',
    priceDisclaimer: 'Os preços são estimativas e podem variar com base no hospital, instalações e requisitos individuais.',
    potentialSavings: 'Economia Potencial', medicalManagement: 'Gestão Médica', surgicalProcedure: 'Procedimento Cirúrgico',
    prescriptionDrug: 'Medicamento com Receita', injectableTreatment: 'Tratamento Injetável', otcMedication: 'Sem Receita',
    homeRemedy: 'Remédio Caseiro', therapy: 'Terapia / Reabilitação', genericAvailable: 'Genérico Disponível',
    prescriptionRequired: 'Receita Necessária', brandNames: 'Nomes Comerciais', duration: 'Duração', setting: 'Ambiente', recovery: 'Recuperação',
};

// Russian translations
const russianUI: UITranslations = {
    home: 'Главная', treatments: 'Лечение', conditions: 'Заболевания', doctors: 'Врачи', hospitals: 'Больницы',
    costComparison: 'Сравнение Цен', costByCountry: 'Сравнение Цен по Странам', whatIs: 'Что такое', howItWorks: 'Как Это Работает',
    commonUses: 'Распространённые Применения и Показания', sideEffects: 'Возможные Побочные Эффекты', whoMayBenefit: 'Кому Это Может Помочь',
    whatToExpect: 'Чего Ожидать', importantConsiderations: 'Важные Соображения', findSpecialists: 'Найти Специалистов',
    findDoctorsNearYou: 'Найти Врачей Рядом', relatedTreatments: 'Связанные Методы Лечения', medicalTravel: 'Медицинский Туризм',
    getFreeQuote: 'Получить Бесплатную Оценку', aiHealthAnalysis: 'ИИ Анализ Здоровья', analyzeReports: 'Анализировать Ваши Отчёты',
    medicalReferences: 'Медицинские Справки', faq: 'Часто Задаваемые Вопросы', browseAllTreatments: 'Просмотреть Все Методы Лечения',
    readMore: 'Читать Дальше', learnMore: 'Узнать Больше', viewAll: 'Смотреть Всё', search: 'Поиск',
    searchPlaceholder: 'Искать лечение, заболевания...', loading: 'Загрузка...', error: 'Произошла ошибка', notFound: 'Не Найдено', backTo: 'Вернуться к',
    priceRange: 'Ценовой Диапазон', usdEquivalent: 'Эквивалент в USD', yourLocation: 'Ваше Местоположение',
    priceDisclaimer: 'Цены являются оценочными и могут варьироваться в зависимости от больницы, учреждения и индивидуальных требований.',
    potentialSavings: 'Потенциальная Экономия', medicalManagement: 'Медицинское Управление', surgicalProcedure: 'Хирургическая Процедура',
    prescriptionDrug: 'Рецептурный Препарат', injectableTreatment: 'Инъекционное Лечение', otcMedication: 'Без Рецепта',
    homeRemedy: 'Домашнее Средство', therapy: 'Терапия / Реабилитация', genericAvailable: 'Доступен Дженерик',
    prescriptionRequired: 'Требуется Рецепт', brandNames: 'Торговые Названия', duration: 'Продолжительность', setting: 'Условия', recovery: 'Восстановление',
};

// Chinese (Simplified) translations
const chineseUI: UITranslations = {
    home: '首页', treatments: '治疗方法', conditions: '疾病', doctors: '医生', hospitals: '医院',
    costComparison: '费用对比', costByCountry: '各国费用对比', whatIs: '什么是', howItWorks: '如何运作',
    commonUses: '常见用途和适应症', sideEffects: '可能的副作用', whoMayBenefit: '谁可能受益',
    whatToExpect: '期望什么', importantConsiderations: '重要考虑事项', findSpecialists: '寻找专家',
    findDoctorsNearYou: '在您附近寻找医生', relatedTreatments: '相关治疗', medicalTravel: '医疗旅游',
    getFreeQuote: '获取免费报价', aiHealthAnalysis: 'AI健康分析', analyzeReports: '分析您的报告',
    medicalReferences: '医学参考', faq: '常见问题', browseAllTreatments: '浏览所有治疗方法',
    readMore: '阅读更多', learnMore: '了解更多', viewAll: '查看全部', search: '搜索',
    searchPlaceholder: '搜索治疗方法、疾病...', loading: '加载中...', error: '发生错误', notFound: '未找到', backTo: '返回',
    priceRange: '价格范围', usdEquivalent: '美元等值', yourLocation: '您的位置',
    priceDisclaimer: '价格为估算值，可能因医院、设施和个人需求而异。',
    potentialSavings: '潜在节省', medicalManagement: '医学管理', surgicalProcedure: '手术程序',
    prescriptionDrug: '处方药', injectableTreatment: '注射治疗', otcMedication: '非处方药',
    homeRemedy: '家庭疗法', therapy: '治疗/康复', genericAvailable: '有仿制药',
    prescriptionRequired: '需要处方', brandNames: '品牌名称', duration: '持续时间', setting: '环境', recovery: '恢复',
};

// Japanese translations
const japaneseUI: UITranslations = {
    home: 'ホーム', treatments: '治療法', conditions: '症状', doctors: '医師', hospitals: '病院',
    costComparison: '費用比較', costByCountry: '国別費用比較', whatIs: 'とは', howItWorks: '仕組み',
    commonUses: '一般的な用途と適応症', sideEffects: '考えられる副作用', whoMayBenefit: '誰に効果があるか',
    whatToExpect: '期待すること', importantConsiderations: '重要な考慮事項', findSpecialists: '専門家を探す',
    findDoctorsNearYou: 'お近くの医師を探す', relatedTreatments: '関連治療法', medicalTravel: '医療ツーリズム',
    getFreeQuote: '無料見積もりを取得', aiHealthAnalysis: 'AI健康分析', analyzeReports: 'レポートを分析',
    medicalReferences: '医学参考文献', faq: 'よくある質問', browseAllTreatments: 'すべての治療法を見る',
    readMore: '続きを読む', learnMore: '詳細を見る', viewAll: 'すべて表示', search: '検索',
    searchPlaceholder: '治療法、症状を検索...', loading: '読み込み中...', error: 'エラーが発生しました', notFound: '見つかりません', backTo: '戻る',
    priceRange: '価格帯', usdEquivalent: 'USD換算', yourLocation: 'あなたの場所',
    priceDisclaimer: '価格は推定であり、病院、施設、個々の要件によって異なる場合があります。',
    potentialSavings: '潜在的な節約', medicalManagement: '医療管理', surgicalProcedure: '外科手術',
    prescriptionDrug: '処方薬', injectableTreatment: '注射治療', otcMedication: '市販薬',
    homeRemedy: '家庭療法', therapy: 'セラピー/リハビリ', genericAvailable: 'ジェネリック利用可',
    prescriptionRequired: '処方箋が必要', brandNames: 'ブランド名', duration: '期間', setting: '環境', recovery: '回復',
};

// Korean translations
const koreanUI: UITranslations = {
    home: '홈', treatments: '치료법', conditions: '질환', doctors: '의사', hospitals: '병원',
    costComparison: '비용 비교', costByCountry: '국가별 비용 비교', whatIs: '이란', howItWorks: '작동 방식',
    commonUses: '일반적인 용도 및 적응증', sideEffects: '가능한 부작용', whoMayBenefit: '누가 혜택을 받을 수 있나',
    whatToExpect: '기대할 수 있는 것', importantConsiderations: '중요한 고려 사항', findSpecialists: '전문가 찾기',
    findDoctorsNearYou: '가까운 의사 찾기', relatedTreatments: '관련 치료법', medicalTravel: '의료 관광',
    getFreeQuote: '무료 견적 받기', aiHealthAnalysis: 'AI 건강 분석', analyzeReports: '보고서 분석하기',
    medicalReferences: '의학 참고 자료', faq: '자주 묻는 질문', browseAllTreatments: '모든 치료법 보기',
    readMore: '더 읽기', learnMore: '자세히 알아보기', viewAll: '모두 보기', search: '검색',
    searchPlaceholder: '치료법, 질환 검색...', loading: '로딩 중...', error: '오류가 발생했습니다', notFound: '찾을 수 없음', backTo: '돌아가기',
    priceRange: '가격 범위', usdEquivalent: 'USD 환산', yourLocation: '현재 위치',
    priceDisclaimer: '가격은 추정치이며 병원, 시설 및 개별 요구 사항에 따라 다를 수 있습니다.',
    potentialSavings: '잠재적 절약', medicalManagement: '의료 관리', surgicalProcedure: '외과 수술',
    prescriptionDrug: '처방약', injectableTreatment: '주사 치료', otcMedication: '일반의약품',
    homeRemedy: '가정 요법', therapy: '치료/재활', genericAvailable: '제네릭 이용 가능',
    prescriptionRequired: '처방 필요', brandNames: '브랜드명', duration: '기간', setting: '환경', recovery: '회복',
};

// Turkish translations
const turkishUI: UITranslations = {
    home: 'Ana Sayfa', treatments: 'Tedaviler', conditions: 'Durumlar', doctors: 'Doktorlar', hospitals: 'Hastaneler',
    costComparison: 'Maliyet Karşılaştırması', costByCountry: 'Ülkeye Göre Maliyet Karşılaştırması', whatIs: 'Nedir', howItWorks: 'Nasıl Çalışır',
    commonUses: 'Yaygın Kullanımlar ve Endikasyonlar', sideEffects: 'Olası Yan Etkiler', whoMayBenefit: 'Kim Fayda Görebilir',
    whatToExpect: 'Ne Beklenmeli', importantConsiderations: 'Önemli Hususlar', findSpecialists: 'Uzman Bul',
    findDoctorsNearYou: 'Yakınındaki Doktorları Bul', relatedTreatments: 'İlgili Tedaviler', medicalTravel: 'Medikal Turizm',
    getFreeQuote: 'Ücretsiz Teklif Al', aiHealthAnalysis: 'AI Sağlık Analizi', analyzeReports: 'Raporlarınızı Analiz Edin',
    medicalReferences: 'Tıbbi Referanslar', faq: 'Sık Sorulan Sorular', browseAllTreatments: 'Tüm Tedavilere Göz At',
    readMore: 'Daha Fazla Oku', learnMore: 'Daha Fazla Bilgi', viewAll: 'Tümünü Gör', search: 'Ara',
    searchPlaceholder: 'Tedavi, durum ara...', loading: 'Yükleniyor...', error: 'Bir hata oluştu', notFound: 'Bulunamadı', backTo: 'Geri Dön',
    priceRange: 'Fiyat Aralığı', usdEquivalent: 'USD Karşılığı', yourLocation: 'Konumunuz',
    priceDisclaimer: 'Fiyatlar tahmini olup hastane, tesis ve bireysel gereksinimlere göre değişebilir.',
    potentialSavings: 'Potansiyel Tasarruf', medicalManagement: 'Tıbbi Yönetim', surgicalProcedure: 'Cerrahi Prosedür',
    prescriptionDrug: 'Reçeteli İlaç', injectableTreatment: 'Enjeksiyon Tedavisi', otcMedication: 'Reçetesiz',
    homeRemedy: 'Ev Tedavisi', therapy: 'Terapi / Rehabilitasyon', genericAvailable: 'Jenerik Mevcut',
    prescriptionRequired: 'Reçete Gerekli', brandNames: 'Marka Adları', duration: 'Süre', setting: 'Ortam', recovery: 'İyileşme',
};

// Thai translations
const thaiUI: UITranslations = {
    home: 'หน้าแรก', treatments: 'การรักษา', conditions: 'อาการ', doctors: 'แพทย์', hospitals: 'โรงพยาบาล',
    costComparison: 'เปรียบเทียบค่าใช้จ่าย', costByCountry: 'เปรียบเทียบค่าใช้จ่ายตามประเทศ', whatIs: 'คืออะไร', howItWorks: 'ทำงานอย่างไร',
    commonUses: 'การใช้งานทั่วไปและข้อบ่งชี้', sideEffects: 'ผลข้างเคียงที่อาจเกิดขึ้น', whoMayBenefit: 'ใครอาจได้รับประโยชน์',
    whatToExpect: 'สิ่งที่คาดหวัง', importantConsiderations: 'ข้อพิจารณาที่สำคัญ', findSpecialists: 'ค้นหาผู้เชี่ยวชาญ',
    findDoctorsNearYou: 'ค้นหาแพทย์ใกล้คุณ', relatedTreatments: 'การรักษาที่เกี่ยวข้อง', medicalTravel: 'การท่องเที่ยวเชิงการแพทย์',
    getFreeQuote: 'รับใบเสนอราคาฟรี', aiHealthAnalysis: 'การวิเคราะห์สุขภาพ AI', analyzeReports: 'วิเคราะห์รายงานของคุณ',
    medicalReferences: 'อ้างอิงทางการแพทย์', faq: 'คำถามที่พบบ่อย', browseAllTreatments: 'ดูการรักษาทั้งหมด',
    readMore: 'อ่านเพิ่มเติม', learnMore: 'เรียนรู้เพิ่มเติม', viewAll: 'ดูทั้งหมด', search: 'ค้นหา',
    searchPlaceholder: 'ค้นหาการรักษา อาการ...', loading: 'กำลังโหลด...', error: 'เกิดข้อผิดพลาด', notFound: 'ไม่พบ', backTo: 'กลับไป',
    priceRange: 'ช่วงราคา', usdEquivalent: 'เทียบเท่า USD', yourLocation: 'ตำแหน่งของคุณ',
    priceDisclaimer: 'ราคาเป็นการประมาณและอาจแตกต่างกันตามโรงพยาบาล สถานที่ และความต้องการส่วนบุคคล',
    potentialSavings: 'การประหยัดที่เป็นไปได้', medicalManagement: 'การจัดการทางการแพทย์', surgicalProcedure: 'ขั้นตอนการผ่าตัด',
    prescriptionDrug: 'ยาตามใบสั่งแพทย์', injectableTreatment: 'การรักษาแบบฉีด', otcMedication: 'ยาที่ไม่ต้องใช้ใบสั่งแพทย์',
    homeRemedy: 'การรักษาที่บ้าน', therapy: 'การบำบัด/ฟื้นฟู', genericAvailable: 'มียาสามัญ',
    prescriptionRequired: 'ต้องมีใบสั่งยา', brandNames: 'ชื่อยี่ห้อ', duration: 'ระยะเวลา', setting: 'สถานที่', recovery: 'การฟื้นตัว',
};

// Vietnamese translations
const vietnameseUI: UITranslations = {
    home: 'Trang Chủ', treatments: 'Điều Trị', conditions: 'Bệnh Lý', doctors: 'Bác Sĩ', hospitals: 'Bệnh Viện',
    costComparison: 'So Sánh Chi Phí', costByCountry: 'So Sánh Chi Phí Theo Quốc Gia', whatIs: 'Là gì', howItWorks: 'Cách Hoạt Động',
    commonUses: 'Công Dụng Phổ Biến & Chỉ Định', sideEffects: 'Tác Dụng Phụ Có Thể', whoMayBenefit: 'Ai Có Thể Hưởng Lợi',
    whatToExpect: 'Điều Gì Có Thể Xảy Ra', importantConsiderations: 'Những Điều Quan Trọng Cần Cân Nhắc', findSpecialists: 'Tìm Chuyên Gia',
    findDoctorsNearYou: 'Tìm Bác Sĩ Gần Bạn', relatedTreatments: 'Điều Trị Liên Quan', medicalTravel: 'Du Lịch Y Tế',
    getFreeQuote: 'Nhận Báo Giá Miễn Phí', aiHealthAnalysis: 'Phân Tích Sức Khỏe AI', analyzeReports: 'Phân Tích Báo Cáo',
    medicalReferences: 'Tài Liệu Y Khoa', faq: 'Câu Hỏi Thường Gặp', browseAllTreatments: 'Xem Tất Cả Điều Trị',
    readMore: 'Đọc Thêm', learnMore: 'Tìm Hiểu Thêm', viewAll: 'Xem Tất Cả', search: 'Tìm Kiếm',
    searchPlaceholder: 'Tìm kiếm điều trị, bệnh lý...', loading: 'Đang tải...', error: 'Đã xảy ra lỗi', notFound: 'Không Tìm Thấy', backTo: 'Quay Lại',
    priceRange: 'Khoảng Giá', usdEquivalent: 'Tương Đương USD', yourLocation: 'Vị Trí Của Bạn',
    priceDisclaimer: 'Giá là ước tính và có thể thay đổi tùy thuộc vào bệnh viện, cơ sở và yêu cầu cá nhân.',
    potentialSavings: 'Tiết Kiệm Tiềm Năng', medicalManagement: 'Quản Lý Y Tế', surgicalProcedure: 'Phẫu Thuật',
    prescriptionDrug: 'Thuốc Kê Đơn', injectableTreatment: 'Điều Trị Tiêm', otcMedication: 'Thuốc Không Kê Đơn',
    homeRemedy: 'Bài Thuốc Dân Gian', therapy: 'Trị Liệu/Phục Hồi', genericAvailable: 'Có Thuốc Generic',
    prescriptionRequired: 'Cần Đơn Thuốc', brandNames: 'Tên Thương Hiệu', duration: 'Thời Gian', setting: 'Môi Trường', recovery: 'Hồi Phục',
};

// Indonesian translations
const indonesianUI: UITranslations = {
    home: 'Beranda', treatments: 'Perawatan', conditions: 'Kondisi', doctors: 'Dokter', hospitals: 'Rumah Sakit',
    costComparison: 'Perbandingan Biaya', costByCountry: 'Perbandingan Biaya per Negara', whatIs: 'Apa itu', howItWorks: 'Cara Kerja',
    commonUses: 'Kegunaan Umum & Indikasi', sideEffects: 'Efek Samping yang Mungkin', whoMayBenefit: 'Siapa yang Dapat Manfaat',
    whatToExpect: 'Apa yang Diharapkan', importantConsiderations: 'Pertimbangan Penting', findSpecialists: 'Cari Spesialis',
    findDoctorsNearYou: 'Cari Dokter di Dekat Anda', relatedTreatments: 'Perawatan Terkait', medicalTravel: 'Wisata Medis',
    getFreeQuote: 'Dapatkan Penawaran Gratis', aiHealthAnalysis: 'Analisis Kesehatan AI', analyzeReports: 'Analisis Laporan Anda',
    medicalReferences: 'Referensi Medis', faq: 'Pertanyaan yang Sering Diajukan', browseAllTreatments: 'Lihat Semua Perawatan',
    readMore: 'Baca Selengkapnya', learnMore: 'Pelajari Lebih Lanjut', viewAll: 'Lihat Semua', search: 'Cari',
    searchPlaceholder: 'Cari perawatan, kondisi...', loading: 'Memuat...', error: 'Terjadi kesalahan', notFound: 'Tidak Ditemukan', backTo: 'Kembali ke',
    priceRange: 'Rentang Harga', usdEquivalent: 'Setara USD', yourLocation: 'Lokasi Anda',
    priceDisclaimer: 'Harga adalah perkiraan dan dapat bervariasi berdasarkan rumah sakit, fasilitas, dan kebutuhan individu.',
    potentialSavings: 'Potensi Penghematan', medicalManagement: 'Manajemen Medis', surgicalProcedure: 'Prosedur Bedah',
    prescriptionDrug: 'Obat Resep', injectableTreatment: 'Perawatan Suntik', otcMedication: 'Obat Bebas',
    homeRemedy: 'Pengobatan Rumahan', therapy: 'Terapi/Rehabilitasi', genericAvailable: 'Generik Tersedia',
    prescriptionRequired: 'Perlu Resep', brandNames: 'Nama Merek', duration: 'Durasi', setting: 'Pengaturan', recovery: 'Pemulihan',
};

// Malay translations
const malayUI: UITranslations = {
    home: 'Laman Utama', treatments: 'Rawatan', conditions: 'Keadaan', doctors: 'Doktor', hospitals: 'Hospital',
    costComparison: 'Perbandingan Kos', costByCountry: 'Perbandingan Kos Mengikut Negara', whatIs: 'Apakah', howItWorks: 'Cara Ia Berfungsi',
    commonUses: 'Kegunaan Biasa & Petunjuk', sideEffects: 'Kesan Sampingan Mungkin', whoMayBenefit: 'Siapa yang Mungkin Mendapat Manfaat',
    whatToExpect: 'Apa yang Dijangkakan', importantConsiderations: 'Pertimbangan Penting', findSpecialists: 'Cari Pakar',
    findDoctorsNearYou: 'Cari Doktor Berhampiran', relatedTreatments: 'Rawatan Berkaitan', medicalTravel: 'Pelancongan Perubatan',
    getFreeQuote: 'Dapatkan Sebut Harga Percuma', aiHealthAnalysis: 'Analisis Kesihatan AI', analyzeReports: 'Analisis Laporan Anda',
    medicalReferences: 'Rujukan Perubatan', faq: 'Soalan Lazim', browseAllTreatments: 'Lihat Semua Rawatan',
    readMore: 'Baca Lagi', learnMore: 'Ketahui Lebih Lanjut', viewAll: 'Lihat Semua', search: 'Cari',
    searchPlaceholder: 'Cari rawatan, keadaan...', loading: 'Memuatkan...', error: 'Ralat berlaku', notFound: 'Tidak Dijumpai', backTo: 'Kembali ke',
    priceRange: 'Julat Harga', usdEquivalent: 'Setara USD', yourLocation: 'Lokasi Anda',
    priceDisclaimer: 'Harga adalah anggaran dan mungkin berbeza berdasarkan hospital, kemudahan, dan keperluan individu.',
    potentialSavings: 'Potensi Penjimatan', medicalManagement: 'Pengurusan Perubatan', surgicalProcedure: 'Prosedur Pembedahan',
    prescriptionDrug: 'Ubat Preskripsi', injectableTreatment: 'Rawatan Suntikan', otcMedication: 'Ubat Tanpa Preskripsi',
    homeRemedy: 'Ubat Rumah', therapy: 'Terapi/Pemulihan', genericAvailable: 'Generik Tersedia',
    prescriptionRequired: 'Preskripsi Diperlukan', brandNames: 'Nama Jenama', duration: 'Tempoh', setting: 'Tetapan', recovery: 'Pemulihan',
};

// Urdu translations (RTL)
const urduUI: UITranslations = {
    home: 'ہوم', treatments: 'علاج', conditions: 'حالات', doctors: 'ڈاکٹرز', hospitals: 'ہسپتال',
    costComparison: 'لاگت کا موازنہ', costByCountry: 'ملک کے حساب سے لاگت کا موازنہ', whatIs: 'کیا ہے', howItWorks: 'یہ کیسے کام کرتا ہے',
    commonUses: 'عام استعمال اور اشارے', sideEffects: 'ممکنہ ضمنی اثرات', whoMayBenefit: 'کسے فائدہ ہو سکتا ہے',
    whatToExpect: 'کیا توقع کریں', importantConsiderations: 'اہم تحفظات', findSpecialists: 'ماہرین تلاش کریں',
    findDoctorsNearYou: 'اپنے قریب ڈاکٹر تلاش کریں', relatedTreatments: 'متعلقہ علاج', medicalTravel: 'طبی سفر',
    getFreeQuote: 'مفت قیمت حاصل کریں', aiHealthAnalysis: 'AI صحت کا تجزیہ', analyzeReports: 'اپنی رپورٹس کا تجزیہ کریں',
    medicalReferences: 'طبی حوالہ جات', faq: 'اکثر پوچھے گئے سوالات', browseAllTreatments: 'تمام علاج دیکھیں',
    readMore: 'مزید پڑھیں', learnMore: 'مزید جانیں', viewAll: 'سب دیکھیں', search: 'تلاش کریں',
    searchPlaceholder: 'علاج، حالات تلاش کریں...', loading: 'لوڈ ہو رہا ہے...', error: 'ایک خرابی ہوئی', notFound: 'نہیں ملا', backTo: 'واپس جائیں',
    priceRange: 'قیمت کی حد', usdEquivalent: 'USD مساوی', yourLocation: 'آپ کا مقام',
    priceDisclaimer: 'قیمتیں تخمینہ ہیں اور ہسپتال، سہولت اور انفرادی ضروریات کی بنیاد پر مختلف ہو سکتی ہیں۔',
    potentialSavings: 'ممکنہ بچت', medicalManagement: 'طبی انتظام', surgicalProcedure: 'جراحی طریقہ کار',
    prescriptionDrug: 'نسخے کی دوائی', injectableTreatment: 'انجیکشن علاج', otcMedication: 'بغیر نسخے کے',
    homeRemedy: 'گھریلو علاج', therapy: 'تھراپی / بحالی', genericAvailable: 'جنرک دستیاب ہے',
    prescriptionRequired: 'نسخہ درکار ہے', brandNames: 'برانڈ نام', duration: 'دورانیہ', setting: 'ترتیب', recovery: 'صحت یابی',
};

// Swahili translations
const swahiliUI: UITranslations = {
    home: 'Nyumbani', treatments: 'Matibabu', conditions: 'Hali', doctors: 'Madaktari', hospitals: 'Hospitali',
    costComparison: 'Ulinganisho wa Gharama', costByCountry: 'Ulinganisho wa Gharama kwa Nchi', whatIs: 'Ni Nini', howItWorks: 'Inavyofanya Kazi',
    commonUses: 'Matumizi ya Kawaida na Dalili', sideEffects: 'Athari Zinazowezekana', whoMayBenefit: 'Nani Anaweza Kunufaika',
    whatToExpect: 'Nini cha Kutarajia', importantConsiderations: 'Mambo Muhimu ya Kuzingatia', findSpecialists: 'Tafuta Wataalamu',
    findDoctorsNearYou: 'Tafuta Madaktari Karibu Nawe', relatedTreatments: 'Matibabu Yanayohusiana', medicalTravel: 'Safari ya Matibabu',
    getFreeQuote: 'Pata Bei Bure', aiHealthAnalysis: 'Uchambuzi wa Afya wa AI', analyzeReports: 'Chambua Ripoti Zako',
    medicalReferences: 'Marejeo ya Kimatibabu', faq: 'Maswali Yanayoulizwa Mara Kwa Mara', browseAllTreatments: 'Tazama Matibabu Yote',
    readMore: 'Soma Zaidi', learnMore: 'Jifunze Zaidi', viewAll: 'Tazama Yote', search: 'Tafuta',
    searchPlaceholder: 'Tafuta matibabu, hali...', loading: 'Inapakia...', error: 'Hitilafu imetokea', notFound: 'Haipatikani', backTo: 'Rudi kwa',
    priceRange: 'Kiwango cha Bei', usdEquivalent: 'Sawa na USD', yourLocation: 'Mahali Pako',
    priceDisclaimer: 'Bei ni makadirio na zinaweza kutofautiana kulingana na hospitali, kituo, na mahitaji ya mtu binafsi.',
    potentialSavings: 'Akiba Inayowezekana', medicalManagement: 'Usimamizi wa Kimatibabu', surgicalProcedure: 'Utaratibu wa Upasuaji',
    prescriptionDrug: 'Dawa ya Daktari', injectableTreatment: 'Matibabu ya Sindano', otcMedication: 'Bila Maagizo',
    homeRemedy: 'Dawa ya Nyumbani', therapy: 'Tiba/Ukarabati', genericAvailable: 'Jenerik Inapatikana',
    prescriptionRequired: 'Cheti cha Daktari Kinahitajika', brandNames: 'Majina ya Bidhaa', duration: 'Muda', setting: 'Mpangilio', recovery: 'Kupona',
};

// Marathi translations
const marathiUI: UITranslations = {
    home: 'मुख्यपृष्ठ', treatments: 'उपचार', conditions: 'स्थिती', doctors: 'डॉक्टर', hospitals: 'रुग्णालये',
    costComparison: 'खर्चाची तुलना', costByCountry: 'देशानुसार खर्चाची तुलना', whatIs: 'काय आहे', howItWorks: 'हे कसे कार्य करते',
    commonUses: 'सामान्य वापर आणि संकेत', sideEffects: 'संभाव्य दुष्परिणाम', whoMayBenefit: 'कोणाला फायदा होऊ शकतो',
    whatToExpect: 'काय अपेक्षा करावी', importantConsiderations: 'महत्त्वाचे विचार', findSpecialists: 'तज्ञ शोधा',
    findDoctorsNearYou: 'तुमच्या जवळ डॉक्टर शोधा', relatedTreatments: 'संबंधित उपचार', medicalTravel: 'वैद्यकीय प्रवास',
    getFreeQuote: 'मोफत कोट मिळवा', aiHealthAnalysis: 'AI आरोग्य विश्लेषण', analyzeReports: 'तुमच्या अहवालांचे विश्लेषण करा',
    medicalReferences: 'वैद्यकीय संदर्भ', faq: 'वारंवार विचारले जाणारे प्रश्न', browseAllTreatments: 'सर्व उपचार पहा',
    readMore: 'अधिक वाचा', learnMore: 'अधिक जाणून घ्या', viewAll: 'सर्व पहा', search: 'शोधा',
    searchPlaceholder: 'उपचार, स्थिती शोधा...', loading: 'लोड होत आहे...', error: 'त्रुटी आली', notFound: 'सापडले नाही', backTo: 'परत जा',
    priceRange: 'किंमत श्रेणी', usdEquivalent: 'USD समतुल्य', yourLocation: 'तुमचे स्थान',
    priceDisclaimer: 'किंमती अंदाज आहेत आणि रुग्णालय, सुविधा आणि वैयक्तिक आवश्यकतांनुसार बदलू शकतात.',
    potentialSavings: 'संभाव्य बचत', medicalManagement: 'वैद्यकीय व्यवस्थापन', surgicalProcedure: 'शस्त्रक्रिया प्रक्रिया',
    prescriptionDrug: 'प्रिस्क्रिप्शन औषध', injectableTreatment: 'इंजेक्शन उपचार', otcMedication: 'ओव्हर-द-काउंटर',
    homeRemedy: 'घरगुती उपाय', therapy: 'थेरपी / पुनर्वसन', genericAvailable: 'जेनेरिक उपलब्ध',
    prescriptionRequired: 'प्रिस्क्रिप्शन आवश्यक', brandNames: 'ब्रँड नावे', duration: 'कालावधी', setting: 'सेटिंग', recovery: 'पुनर्प्राप्ती',
};

// Gujarati translations
const gujaratiUI: UITranslations = {
    home: 'હોમ', treatments: 'સારવાર', conditions: 'સ્થિતિઓ', doctors: 'ડૉક્ટરો', hospitals: 'હોસ્પિટલો',
    costComparison: 'ખર્ચ સરખામણી', costByCountry: 'દેશ પ્રમાણે ખર્ચ સરખામણી', whatIs: 'શું છે', howItWorks: 'તે કેવી રીતે કામ કરે છે',
    commonUses: 'સામાન્ય ઉપયોગો અને સંકેતો', sideEffects: 'સંભવિત આડઅસરો', whoMayBenefit: 'કોને ફાયદો થઈ શકે',
    whatToExpect: 'શું અપેક્ષા રાખવી', importantConsiderations: 'મહત્વપૂર્ણ વિચારણાઓ', findSpecialists: 'નિષ્ણાતો શોધો',
    findDoctorsNearYou: 'તમારી નજીક ડૉક્ટરો શોધો', relatedTreatments: 'સંબંધિત સારવાર', medicalTravel: 'તબીબી મુસાફરી',
    getFreeQuote: 'મફત ક્વોટ મેળવો', aiHealthAnalysis: 'AI આરોગ્ય વિશ્લેષણ', analyzeReports: 'તમારા અહેવાલોનું વિશ્લેષણ કરો',
    medicalReferences: 'તબીબી સંદર્ભો', faq: 'વારંવાર પૂછાતા પ્રશ્નો', browseAllTreatments: 'બધી સારવાર જુઓ',
    readMore: 'વધુ વાંચો', learnMore: 'વધુ જાણો', viewAll: 'બધું જુઓ', search: 'શોધો',
    searchPlaceholder: 'સારવાર, સ્થિતિઓ શોધો...', loading: 'લોડ થઈ રહ્યું છે...', error: 'ભૂલ આવી', notFound: 'મળ્યું નહીં', backTo: 'પાછા જાઓ',
    priceRange: 'કિંમત શ્રેણી', usdEquivalent: 'USD સમકક્ષ', yourLocation: 'તમારું સ્થાન',
    priceDisclaimer: 'કિંમતો અંદાજો છે અને હોસ્પિટલ, સુવિધા અને વ્યક્તિગત જરૂરિયાતોના આધારે બદલાઈ શકે છે.',
    potentialSavings: 'સંભવિત બચત', medicalManagement: 'તબીબી વ્યવસ્થાપન', surgicalProcedure: 'સર્જિકલ પ્રક્રિયા',
    prescriptionDrug: 'પ્રિસ્ક્રિપ્શન દવા', injectableTreatment: 'ઇન્જેક્શન સારવાર', otcMedication: 'ઓવર-ધ-કાઉન્ટર',
    homeRemedy: 'ઘરેલુ ઉપાય', therapy: 'થેરાપી / પુનર્વસન', genericAvailable: 'જેનેરિક ઉપલબ્ધ',
    prescriptionRequired: 'પ્રિસ્ક્રિપ્શન જરૂરી', brandNames: 'બ્રાન્ડ નામો', duration: 'અવધિ', setting: 'સેટિંગ', recovery: 'પુનઃપ્રાપ્તિ',
};

// Malayalam translations
const malayalamUI: UITranslations = {
    home: 'ഹോം', treatments: 'ചികിത്സകൾ', conditions: 'അവസ്ഥകൾ', doctors: 'ഡോക്ടർമാർ', hospitals: 'ആശുപത്രികൾ',
    costComparison: 'ചെലവ് താരതമ്യം', costByCountry: 'രാജ്യം അനുസരിച്ച് ചെലവ് താരതമ്യം', whatIs: 'എന്താണ്', howItWorks: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    commonUses: 'സാധാരണ ഉപയോഗങ്ങളും സൂചനകളും', sideEffects: 'സാധ്യമായ പാർശ്വഫലങ്ങൾ', whoMayBenefit: 'ആർക്ക് പ്രയോജനം ലഭിക്കും',
    whatToExpect: 'എന്താണ് പ്രതീക്ഷിക്കേണ്ടത്', importantConsiderations: 'പ്രധാന പരിഗണനകൾ', findSpecialists: 'വിദഗ്ധരെ കണ്ടെത്തുക',
    findDoctorsNearYou: 'നിങ്ങളുടെ അടുത്തുള്ള ഡോക്ടർമാരെ കണ്ടെത്തുക', relatedTreatments: 'ബന്ധപ്പെട്ട ചികിത്സകൾ', medicalTravel: 'മെഡിക്കൽ ടൂറിസം',
    getFreeQuote: 'സൗജന്യ ക്വോട്ട് നേടുക', aiHealthAnalysis: 'AI ആരോഗ്യ വിശകലനം', analyzeReports: 'നിങ്ങളുടെ റിപ്പോർട്ടുകൾ വിശകലനം ചെയ്യുക',
    medicalReferences: 'മെഡിക്കൽ റഫറൻസുകൾ', faq: 'പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ', browseAllTreatments: 'എല്ലാ ചികിത്സകളും കാണുക',
    readMore: 'കൂടുതൽ വായിക്കുക', learnMore: 'കൂടുതൽ അറിയുക', viewAll: 'എല്ലാം കാണുക', search: 'തിരയുക',
    searchPlaceholder: 'ചികിത്സകൾ, അവസ്ഥകൾ തിരയുക...', loading: 'ലോഡ് ചെയ്യുന്നു...', error: 'ഒരു പിശക് സംഭവിച്ചു', notFound: 'കണ്ടെത്തിയില്ല', backTo: 'തിരികെ പോകുക',
    priceRange: 'വില ശ്രേണി', usdEquivalent: 'USD തുല്യമായത്', yourLocation: 'നിങ്ങളുടെ സ്ഥാനം',
    priceDisclaimer: 'വിലകൾ കണക്കുകൂട്ടലുകളാണ്, ആശുപത്രി, സൗകര്യം, വ്യക്തിഗത ആവശ്യകതകൾ എന്നിവയെ അടിസ്ഥാനമാക്കി മാറാം.',
    potentialSavings: 'സാധ്യമായ ലാഭം', medicalManagement: 'മെഡിക്കൽ മാനേജ്മെന്റ്', surgicalProcedure: 'ശസ്ത്രക്രിയാ നടപടിക്രമം',
    prescriptionDrug: 'പ്രിസ്ക്രിപ്ഷൻ മരുന്ന്', injectableTreatment: 'ഇൻജെക്ഷൻ ചികിത്സ', otcMedication: 'ഓവർ-ദി-കൗണ്ടർ',
    homeRemedy: 'വീട്ടുവൈദ്യം', therapy: 'തെറാപ്പി / പുനരധിവാസം', genericAvailable: 'ജനറിക് ലഭ്യമാണ്',
    prescriptionRequired: 'പ്രിസ്ക്രിപ്ഷൻ ആവശ്യമാണ്', brandNames: 'ബ്രാൻഡ് പേരുകൾ', duration: 'കാലാവധി', setting: 'സെറ്റിംഗ്', recovery: 'വീണ്ടെടുക്കൽ',
};

// Punjabi translations
const punjabiUI: UITranslations = {
    home: 'ਹੋਮ', treatments: 'ਇਲਾਜ', conditions: 'ਹਾਲਾਤ', doctors: 'ਡਾਕਟਰ', hospitals: 'ਹਸਪਤਾਲ',
    costComparison: 'ਖਰਚੇ ਦੀ ਤੁਲਨਾ', costByCountry: 'ਦੇਸ਼ ਅਨੁਸਾਰ ਖਰਚੇ ਦੀ ਤੁਲਨਾ', whatIs: 'ਕੀ ਹੈ', howItWorks: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    commonUses: 'ਆਮ ਵਰਤੋਂ ਅਤੇ ਸੰਕੇਤ', sideEffects: 'ਸੰਭਾਵੀ ਮਾੜੇ ਪ੍ਰਭਾਵ', whoMayBenefit: 'ਕਿਸ ਨੂੰ ਫਾਇਦਾ ਹੋ ਸਕਦਾ ਹੈ',
    whatToExpect: 'ਕੀ ਉਮੀਦ ਕਰਨੀ ਹੈ', importantConsiderations: 'ਮਹੱਤਵਪੂਰਨ ਵਿਚਾਰ', findSpecialists: 'ਮਾਹਿਰ ਲੱਭੋ',
    findDoctorsNearYou: 'ਆਪਣੇ ਨੇੜੇ ਡਾਕਟਰ ਲੱਭੋ', relatedTreatments: 'ਸੰਬੰਧਿਤ ਇਲਾਜ', medicalTravel: 'ਮੈਡੀਕਲ ਯਾਤਰਾ',
    getFreeQuote: 'ਮੁਫ਼ਤ ਕੋਟ ਪ੍ਰਾਪਤ ਕਰੋ', aiHealthAnalysis: 'AI ਸਿਹਤ ਵਿਸ਼ਲੇਸ਼ਣ', analyzeReports: 'ਆਪਣੀਆਂ ਰਿਪੋਰਟਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
    medicalReferences: 'ਡਾਕਟਰੀ ਹਵਾਲੇ', faq: 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ', browseAllTreatments: 'ਸਾਰੇ ਇਲਾਜ ਦੇਖੋ',
    readMore: 'ਹੋਰ ਪੜ੍ਹੋ', learnMore: 'ਹੋਰ ਜਾਣੋ', viewAll: 'ਸਭ ਦੇਖੋ', search: 'ਖੋਜੋ',
    searchPlaceholder: 'ਇਲਾਜ, ਹਾਲਾਤ ਖੋਜੋ...', loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', error: 'ਇੱਕ ਗਲਤੀ ਹੋਈ', notFound: 'ਨਹੀਂ ਲੱਭਿਆ', backTo: 'ਵਾਪਸ ਜਾਓ',
    priceRange: 'ਕੀਮਤ ਸੀਮਾ', usdEquivalent: 'USD ਬਰਾਬਰ', yourLocation: 'ਤੁਹਾਡਾ ਸਥਾਨ',
    priceDisclaimer: 'ਕੀਮਤਾਂ ਅੰਦਾਜ਼ੇ ਹਨ ਅਤੇ ਹਸਪਤਾਲ, ਸਹੂਲਤ ਅਤੇ ਵਿਅਕਤੀਗਤ ਲੋੜਾਂ ਦੇ ਅਧਾਰ ਤੇ ਵੱਖ ਹੋ ਸਕਦੀਆਂ ਹਨ।',
    potentialSavings: 'ਸੰਭਾਵੀ ਬੱਚਤ', medicalManagement: 'ਡਾਕਟਰੀ ਪ੍ਰਬੰਧਨ', surgicalProcedure: 'ਸਰਜੀਕਲ ਪ੍ਰਕਿਰਿਆ',
    prescriptionDrug: 'ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਦਵਾਈ', injectableTreatment: 'ਇੰਜੈਕਸ਼ਨ ਇਲਾਜ', otcMedication: 'ਓਵਰ-ਦ-ਕਾਊਂਟਰ',
    homeRemedy: 'ਘਰੇਲੂ ਨੁਸਖਾ', therapy: 'ਥੈਰੇਪੀ / ਮੁੜ-ਵਸੇਬਾ', genericAvailable: 'ਜੈਨਰਿਕ ਉਪਲਬਧ',
    prescriptionRequired: 'ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਲੋੜੀਂਦੀ ਹੈ', brandNames: 'ਬ੍ਰਾਂਡ ਨਾਮ', duration: 'ਮਿਆਦ', setting: 'ਸੈਟਿੰਗ', recovery: 'ਰਿਕਵਰੀ',
};

// All UI translations indexed by language code
const UI_TRANSLATIONS: Record<string, UITranslations> = {
    en: englishUI,
    hi: hindiUI,
    ar: arabicUI,
    ta: tamilUI,
    bn: bengaliUI,
    te: teluguUI,
    kn: kannadaUI,
    es: spanishUI,
    fr: frenchUI,
    de: germanUI,
    pt: portugueseUI,
    ru: russianUI,
    zh: chineseUI,
    ja: japaneseUI,
    ko: koreanUI,
    tr: turkishUI,
    th: thaiUI,
    vi: vietnameseUI,
    id: indonesianUI,
    ms: malayUI,
    ur: urduUI,
    sw: swahiliUI,
    mr: marathiUI,
    gu: gujaratiUI,
    ml: malayalamUI,
    pa: punjabiUI,
};

/**
 * Get UI translations for a language
 */
export function getUITranslations(langCode: string): UITranslations {
    return UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS.en;
}

/**
 * Get a specific UI translation with fallback
 */
export function t(langCode: string, key: keyof UITranslations): string {
    const translations = getUITranslations(langCode);
    return translations[key] || englishUI[key];
}

/**
 * Translation context for React components
 */
export interface TranslationContext {
    lang: string;
    dir: 'ltr' | 'rtl';
    ui: UITranslations;
    isRTL: boolean;
    fontFamily?: string;
}

export function createTranslationContext(langCode: string): TranslationContext {
    const config = getLanguageConfig(langCode);
    return {
        lang: langCode,
        dir: config.dir,
        ui: getUITranslations(langCode),
        isRTL: isRTL(langCode),
        fontFamily: config.googleFontFamily,
    };
}
