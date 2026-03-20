import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CONDITION_ID = 9435;

// IDs of the untranslated rows to delete (created by the failed script)
const BAD_IDS = [6736,6737,6738,6739,6740,6741,6742,6743,6744,6745,6746,6747,6748,6749,6750,6751,6752,6753];

// Shared structured data (kept as-is from English)
const SHARED = {
  keyStats: { icdCode: "I71.4", severity: "moderate", bodySystem: "Heart & Cardiovascular", prevalence: "Varies by region and demographics", demographics: "Affects people of various ages" },
  typesClassification: [
    { type: "Acute", severity: "moderate", description: "Sudden onset of abdominal aortic aneurysm, without rupture with severe symptoms" },
    { type: "Chronic", severity: "mild", description: "Long-term abdominal aortic aneurysm, without rupture requiring ongoing management" }
  ],
  emergencySigns: ["Severe chest pain lasting more than 15 minutes","Chest pain with shortness of breath and sweating","Sudden loss of consciousness","Severe difficulty breathing at rest","Extremely rapid or irregular heartbeat with dizziness"],
  causes: [
    { cause: "High blood pressure (Hypertension)", category: "primary", description: "Persistently elevated blood pressure damages arteries and strains the heart" },
    { cause: "High cholesterol (Hyperlipidemia)", category: "primary", description: "Elevated LDL cholesterol leads to plaque buildup in arteries" },
    { cause: "Diabetes mellitus", category: "primary", description: "High blood sugar damages blood vessels and nerves controlling the heart" },
    { cause: "Family history of heart disease", category: "primary", description: "First-degree relatives with early heart disease increase risk" },
    { cause: "Smoking and tobacco use", category: "contributing", description: "Damages blood vessel walls and reduces oxygen in blood" },
    { cause: "Obesity (BMI > 30)", category: "contributing", description: "Excess weight increases heart workload and metabolic strain" },
    { cause: "Sedentary lifestyle", category: "contributing", description: "Physical inactivity weakens heart muscle and promotes obesity" }
  ],
  riskFactors: [
    { factor: "High blood pressure (Hypertension)", category: "medical", modifiable: true, description: "Persistently elevated blood pressure damages arteries and strains the heart" },
    { factor: "High cholesterol (Hyperlipidemia)", category: "medical", modifiable: true, description: "Elevated LDL cholesterol leads to plaque buildup in arteries" },
    { factor: "Diabetes mellitus", category: "medical", modifiable: true, description: "High blood sugar damages blood vessels and nerves controlling the heart" },
    { factor: "Smoking and tobacco use", category: "lifestyle", modifiable: true, description: "Damages blood vessel walls and reduces oxygen in blood" },
    { factor: "Obesity (BMI > 30)", category: "lifestyle", modifiable: true, description: "Excess weight increases heart workload and metabolic strain" },
    { factor: "Family history of heart disease", category: "genetic", modifiable: false, description: "First-degree relatives with early heart disease increase risk" },
    { factor: "Sedentary lifestyle", category: "lifestyle", modifiable: true, description: "Physical inactivity weakens heart muscle and promotes obesity" },
    { factor: "Chronic stress", category: "lifestyle", modifiable: true, description: "Prolonged stress elevates blood pressure and heart rate" },
    { factor: "Excessive alcohol consumption", category: "lifestyle", modifiable: true, description: "Heavy drinking can lead to cardiomyopathy and arrhythmias" },
    { factor: "Age (Men >45, Women >55)", category: "demographic", modifiable: false, description: "Risk increases with age as arteries stiffen" }
  ],
  diagnosticTests: [
    { test: "Abdominal Ultrasound", purpose: "The primary tool for screening and long-term surveillance of aneurysm diameter.", whatToExpect: "Painless, low-cost scan using sound waves done in a clinic setting." },
    { test: "CT Scan (Aortic Protocol)", purpose: "High-resolution 3D mapping needed before scheduling elective surgery.", whatToExpect: "Comprehensive scan that requires lying still for several minutes; may involve IV contrast." }
  ],
  medicalTreatments: [
    { name: "Beta-blockers (Metoprolol, Atenolol)", type: "medication", description: "Beta-blockers help slow heart rate and reduce blood pressure.", effectiveness: "high" },
    { name: "ACE inhibitors (Lisinopril, Enalapril)", type: "medication", description: "ACE inhibitors relax blood vessels and reduce strain on the heart.", effectiveness: "high" },
    { name: "ARBs (Losartan, Valsartan)", type: "medication", description: "ARBs help manage blood pressure for aortic aneurysm patients.", effectiveness: "high" },
    { name: "Statins (Atorvastatin, Rosuvastatin)", type: "medication", description: "Statins lower cholesterol levels and reduce complication risk.", effectiveness: "moderate" }
  ],
  surgicalOptions: [
    { name: "Elective EVAR", description: "Minimal incisions, fast recovery, and high success for patients with suitable aortic anatomy.", successRate: "Extremely high for elective cases (>98%)." },
    { name: "Elective Open Repair", description: "Direct surgical grafting used for complex cases where stenting is not feasible.", successRate: "Excellent long-term results with decades of proof." }
  ],
  dietRecommendations: ["Fatty fish (salmon, mackerel) 2-3 times weekly","Fresh fruits and vegetables (5+ servings daily)","Whole grains (oats, brown rice, quinoa)","Nuts and seeds (almonds, walnuts, flaxseeds)","Olive oil as primary cooking fat","Legumes and beans","Low-fat dairy products","Lean proteins (chicken, turkey)"],
  hospitalCriteria: ["Specialized Cardiology department","Experienced specialist team","Modern diagnostic equipment","Comprehensive treatment facilities","Good patient outcomes and reviews","Insurance and cashless options","Emergency care availability","Accreditation (NABH, JCI)"],
  specialistType: "Cardiologist",
  wordCount: 1350,
};

interface LangContent {
  h1Title: string;
  heroOverview: string;
  definition: string;
  diagnosisOverview: string;
  treatmentOverview: string;
  prognosis: string;
  metaTitle: string;
  metaDescription: string;
  whySeeSpecialist: string;
  primarySymptoms: string[];
  earlyWarningSigns: string[];
  preventionStrategies: string[];
  complications: string[];
  faqs: Array<{ question: string; answer: string }>;
  keywords: string[];
  lifestyleModifications: string[];
}

const translations: Record<string, LangContent> = {

  // ═══════════════════════════════════════
  // HINDI (hi)
  // ═══════════════════════════════════════
  hi: {
    h1Title: "उदर महाधमनी धमनीविस्फार (AAA) निगरानी और सक्रिय मरम्मत: टूटने से बचाव",
    heroOverview: "टूटने से पहले उदर महाधमनी धमनीविस्फार (AAA) एक मूक लेकिन गंभीर हृदय संबंधी जोखिम है जिसके लिए शल्य चिकित्सा विशेषज्ञता और दीर्घकालिक निगरानी की आवश्यकता होती है। जब महाधमनी फूल जाती है लेकिन अभी तक फटी नहीं है, तो आपके पास वैकल्पिक, उच्च-सटीकता मरम्मत की योजना बनाने का समय होता है। aihealz पर, हम आपको विशेष संवहनी क्लीनिकों और बोर्ड-प्रमाणित हृदय रोग विशेषज्ञों से जोड़ते हैं जो नवीनतम इमेजिंग का उपयोग करके धमनीविस्फार की वृद्धि की निगरानी करते हैं।",
    definition: "अक्षुण्ण उदर महाधमनी धमनीविस्फार (AAA) महाधमनी के निचले हिस्से का संरचनात्मक विस्तार है। टूटने के विपरीत, यह स्थिति अक्सर लक्षणहीन होती है, जो केवल नियमित शारीरिक जांच या असंबंधित इमेजिंग के दौरान खोजी जाती है। यह मूल रूप से धमनी की दीवार में एक संरचनात्मक कमजोरी है जो समय के साथ रक्तचाप के कारण गुब्बारे की तरह फूल सकती है। प्राथमिक लक्ष्य 'निगरानी' है—व्यास और वृद्धि दर की सावधानीपूर्वक निगरानी। जब धमनीविस्फार 5.0 से 5.5 सेंटीमीटर तक पहुंचता है, तो वैकल्पिक शल्य चिकित्सा की सिफारिश की जाती है।",
    diagnosisOverview: "अक्षुण्ण AAA का निदान उच्च-रिज़ॉल्यूशन इमेजिंग पर निर्भर करता है क्योंकि शारीरिक लक्षण अक्सर अनुपस्थित होते हैं। डॉक्टर आमतौर पर अल्ट्रासाउंड या CT स्कैन के दौरान धमनीविस्फार की खोज करते हैं। पहचान के बाद, निदान विशेष 'महाधमनी प्रोटोकॉल' अल्ट्रासाउंड या CTA के माध्यम से किया जाता है। ये परीक्षण उभार का सटीक व्यास और गुर्दे की धमनियों से इसकी निकटता प्रदान करते हैं।",
    treatmentOverview: "अटूट AAA का प्रबंधन दो चरणों में विभाजित है: सक्रिय निगरानी और वैकल्पिक मरम्मत। छोटे धमनीविस्फार के लिए, हर 6 से 12 महीने में नियमित अल्ट्रासाउंड और रक्तचाप, कोलेस्ट्रॉल पर सख्त नियंत्रण शामिल है। यदि धमनीविस्फार 5.5 सेमी की सीमा के करीब पहुंचता है, तो वैकल्पिक मरम्मत की योजना बनाई जाती है। वैकल्पिक प्रक्रियाएं 98% से अधिक जीवित रहने की दर के साथ काफी सुरक्षित हैं।",
    prognosis: "जो मरीज अपने AAA का जल्दी पता लगाते हैं और औपचारिक निगरानी कार्यक्रम में भाग लेते हैं, उनके लिए दीर्घकालिक पूर्वानुमान उत्कृष्ट है। वैकल्पिक मरम्मत अत्यधिक सफल है और धमनीविस्फार के खतरे को प्रभावी रूप से 'ठीक' कर देती है। मरम्मत के बाद मरीज आमतौर पर थोड़ी रिकवरी अवधि के बाद पूरी गतिविधि फिर से शुरू कर सकते हैं।",
    metaTitle: "उदर महाधमनी धमनीविस्फार उपचार और विशेषज्ञ",
    metaDescription: "उदर महाधमनी धमनीविस्फार के लक्षण, कारण, निदान और उपचार विकल्पों के बारे में जानें। सर्वश्रेष्ठ हृदय रोग विशेषज्ञ खोजें।",
    whySeeSpecialist: "महाधमनी धमनीविस्फार का सक्रिय प्रबंधन एक विशेष संवहनी सर्जन या महाधमनी रोग में विशेषज्ञता रखने वाले इंटरवेंशनल कार्डियोलॉजिस्ट द्वारा सबसे अच्छा किया जाता है। ये विशेषज्ञ प्रमुख वाहिकाओं की संरचनात्मक अखंडता पर विशेष रूप से ध्यान केंद्रित करते हैं और स्टेंट-ग्राफ्ट की योजना बनाने के लिए उन्नत 3D साइज़िंग सॉफ़्टवेयर का उपयोग करते हैं।",
    primarySymptoms: ["छाती में दर्द या बेचैनी (एनजाइना)", "थकान या कमजोरी", "पैरों, टखनों या पंजों में सूजन (शोफ)", "बांह, जबड़े, गर्दन या पीठ में दर्द"],
    earlyWarningSigns: ["सामान्य गतिविधियों के दौरान असामान्य थकान", "न्यूनतम परिश्रम पर सांस की तकलीफ", "हल्की छाती की बेचैनी जो जल्दी ठीक हो जाती है"],
    preventionStrategies: ["सप्ताह में 150 मिनट मध्यम एरोबिक व्यायाम करें", "स्वस्थ वजन बनाए रखें (BMI 18.5-24.9)", "धूम्रपान छोड़ें और निष्क्रिय धूम्रपान से बचें", "शराब प्रतिदिन 1-2 पेय तक सीमित रखें", "तनाव कम करने की तकनीकें अपनाएं (ध्यान, योग)", "नियमित स्वास्थ्य जांच करवाएं", "लक्षणों पर जल्दी चिकित्सा ध्यान दें", "निर्धारित निवारक उपायों का पालन करें"],
    complications: ["उपचार न होने पर स्थिति का बढ़ना", "संबंधित स्वास्थ्य समस्याओं का विकास", "जीवन की गुणवत्ता पर प्रभाव", "अधिक आक्रामक उपचार की संभावित आवश्यकता", "उचित प्रबंधन के बिना पुनरावृत्ति का जोखिम"],
    faqs: [
      { question: "क्या छोटे AAA का इलाज बिना सर्जरी के किया जा सकता है?", answer: "हाँ, छोटे धमनीविस्फार (5.0 सेमी से कम) को अक्सर 'सक्रिय निगरानी' के माध्यम से प्रबंधित किया जाता है। इसमें हर 6-12 महीने में नियमित इमेजिंग और धूम्रपान और उच्च रक्तचाप जैसे जोखिम कारकों का सख्त प्रबंधन शामिल है।" },
      { question: "अक्षुण्ण AAA के सामान्य लक्षण क्या हैं?", answer: "अधिकांश अक्षुण्ण धमनीविस्फार 'मूक' होते हैं और कोई लक्षण नहीं होते। हालांकि, कुछ मरीजों को पेट में धड़कन जैसी अनुभूति या पीठ के निचले हिस्से या बगल में लगातार गहरा दर्द हो सकता है।" },
      { question: "AAA के लिए सर्जरी किस आकार में सुझाई जाती है?", answer: "सर्जरी आमतौर पर तब सुझाई जाती है जब पुरुषों के लिए धमनीविस्फार 5.5 सेमी या महिलाओं के लिए 5.0 सेमी तक पहुंच जाता है, या यदि यह तेजी से बढ़ रहा हो (छह महीने में 0.5 सेमी से अधिक)।" },
      { question: "AAA प्रबंधन में 'वॉचफुल वेटिंग' क्या है?", answer: "यह एक चिकित्सा रणनीति है जहां डॉक्टर नियमित अल्ट्रासाउंड या CT स्कैन से धमनीविस्फार के आकार की निगरानी करते हैं जबकि रोगी रक्तचाप को नियंत्रित करता है।" },
      { question: "क्या वैकल्पिक AAA मरम्मत आपातकालीन मरम्मत से सुरक्षित है?", answer: "काफी सुरक्षित। वैकल्पिक मरम्मत की जीवित रहने की दर 95-98% से अधिक है, जबकि फटे AAA की आपातकालीन मरम्मत में मृत्यु दर बहुत अधिक होती है (अक्सर 50% या अधिक)।" },
      { question: "क्या मैं अटूट AAA के साथ व्यायाम कर सकता हूं?", answer: "अधिकांश मरीज चलने जैसे हल्के व्यायाम जारी रख सकते हैं। हालांकि, भारी वजन उठाने या उच्च-तीव्रता वाले व्यायाम से बचना चाहिए जो रक्तचाप में अस्थायी वृद्धि कर सकते हैं।" },
      { question: "वैकल्पिक EVAR के बाद रिकवरी कितनी लंबी है?", answer: "न्यूनतम इनवेसिव EVAR के लिए, अस्पताल में रहना आमतौर पर 1-2 दिन होता है, और मरीज एक या दो सप्ताह में हल्की गतिविधियों में लौट जाते हैं।" },
      { question: "क्या धूम्रपान से धमनीविस्फार तेजी से बढ़ता है?", answer: "हाँ, धूम्रपान सबसे महत्वपूर्ण रोकथाम योग्य जोखिम कारक है। यह न केवल धमनीविस्फार के गठन का कारण बनता है बल्कि उनकी वृद्धि को काफी तेज करता है और टूटने की संभावना बढ़ाता है।" }
    ],
    keywords: ["उदर महाधमनी धमनीविस्फार", "AAA उपचार", "AAA लक्षण", "हृदय रोग विशेषज्ञ"],
    lifestyleModifications: ["सप्ताह में 150 मिनट मध्यम एरोबिक व्यायाम करें", "स्वस्थ वजन बनाए रखें (BMI 18.5-24.9)", "धूम्रपान छोड़ें", "शराब सीमित करें", "तनाव कम करने की तकनीकें अपनाएं", "घर पर नियमित रक्तचाप की निगरानी करें", "प्रतिरात्रि 7-9 घंटे की नींद लें", "सामाजिक रूप से जुड़े रहें", "दवाइयाँ नियमित रूप से लें", "नियमित हृदय जांच करवाएं"],
  },

  // ═══════════════════════════════════════
  // TAMIL (ta)
  // ═══════════════════════════════════════
  ta: {
    h1Title: "வயிற்று பெருநாடி நரம்புப் புடைப்பு (AAA) கண்காணிப்பு & செயலூக்க பழுது: வெடிப்பைத் தவிர்த்தல்",
    heroOverview: "வெடிப்பதற்கு முன் வயிற்று பெருநாடி நரம்புப் புடைப்பு (AAA) ஒரு அமைதியான ஆனால் குறிப்பிடத்தக்க இருதய ஆபத்து ஆகும், இதற்கு அறுவை சிகிச்சை நிபுணத்துவம் மற்றும் நீண்டகால கண்காணிப்பு தேவைப்படுகிறது। aihealz இல், சிறப்பு இரத்தக்குழாய் மருத்துவமனைகள் மற்றும் சான்றிதழ் பெற்ற இருதய நிபுணர்களுடன் உங்களை இணைக்கிறோம்.",
    definition: "அப்படியே இருக்கும் வயிற்று பெருநாடி நரம்புப் புடைப்பு என்பது பெருநாடியின் கீழ் பகுதியின் கட்டமைப்பு விரிவாக்கம் ஆகும். வெடிப்பைப் போலன்றி, இந்த நிலை பெரும்பாலும் அறிகுறியற்றது. இது அடிப்படையில் தமனி சுவரில் ஒரு கட்டமைப்பு பலவீனம் ஆகும், இது காலப்போக்கில் இரத்த அழுத்தத்தால் பலூன் போல் வீங்கலாம். நரம்புப் புடைப்பு 5.0 முதல் 5.5 சென்டிமீட்டர் அளவை எட்டும்போது, தேர்ந்தெடுக்கப்பட்ட அறுவை சிகிச்சை பரிந்துரைக்கப்படுகிறது.",
    diagnosisOverview: "AAA கண்டறிதல் உயர் தெளிவுத்திறன் இமேஜிங் மீது பெரிதும் நம்பியுள்ளது, ஏனெனில் உடல் அறிகுறிகள் பெரும்பாலும் இல்லை. மருத்துவர்கள் வழக்கமாக அல்ட்ராசவுண்ட் அல்லது CT ஸ்கேன் போது நரம்புப் புடைப்பைக் கண்டறிகின்றனர். சிறப்பு 'பெருநாடி நெறிமுறை' அல்ட்ராசவுண்ட் அல்லது CTA மூலம் கண்டறிதல் உறுதிப்படுத்தப்படுகிறது.",
    treatmentOverview: "வெடிக்காத AAA மேலாண்மை இரண்டு கட்டங்களாக பிரிக்கப்படுகிறது: செயலில் கண்காணிப்பு மற்றும் தேர்ந்தெடுக்கப்பட்ட பழுது. சிறிய நரம்புப் புடைப்புகளுக்கு, ஒவ்வொரு 6 முதல் 12 மாதங்களுக்கும் வழக்கமான அல்ட்ராசவுண்ட் மற்றும் இரத்த அழுத்தம், கொலஸ்ட்ரால் கட்டுப்பாடு அடங்கும். தேர்ந்தெடுக்கப்பட்ட நடைமுறைகள் 98% க்கும் அதிகமான உயிர்வாழ்வு விகிதத்துடன் கணிசமாக பாதுகாப்பானவை.",
    prognosis: "AAA ஐ முன்கூட்டியே கண்டறிந்து முறையான கண்காணிப்பு திட்டத்தில் பங்கேற்கும் நோயாளிகளுக்கு, நீண்டகால முன்கணிப்பு சிறப்பானது. தேர்ந்தெடுக்கப்பட்ட பழுது மிகவும் வெற்றிகரமானது மற்றும் நரம்புப் புடைப்பின் அச்சுறுத்தலை திறம்பட 'குணப்படுத்துகிறது'.",
    metaTitle: "வயிற்று பெருநாடி நரம்புப் புடைப்பு சிகிச்சை",
    metaDescription: "வயிற்று பெருநாடி நரம்புப் புடைப்பு அறிகுறிகள், காரணங்கள், கண்டறிதல் மற்றும் சிகிச்சை விருப்பங்களைப் பற்றி அறியுங்கள்.",
    whySeeSpecialist: "பெருநாடி நரம்புப் புடைப்பின் செயலூக்க மேலாண்மை சிறப்பு இரத்தக்குழாய் அறுவை சிகிச்சை நிபுணர் அல்லது இருதய நிபுணரால் சிறப்பாக செய்யப்படுகிறது. இந்த நிபுணர்கள் முக்கிய இரத்தக்குழாய்களின் கட்டமைப்பு ஒருமைப்பாட்டில் குறிப்பாக கவனம் செலுத்துகிறார்கள்.",
    primarySymptoms: ["நெஞ்சு வலி அல்லது அசௌகரியம் (ஆஞ்சைனா)", "சோர்வு அல்லது பலவீனம்", "கால்கள், கணுக்கால்கள் அல்லது பாதங்களில் வீக்கம்", "கை, தாடை, கழுத்து அல்லது முதுகுக்கு பரவும் வலி"],
    earlyWarningSigns: ["இயல்பான செயல்பாடுகளின் போது அசாதாரண சோர்வு", "குறைந்த உழைப்பில் மூச்சுத் திணறல்", "விரைவாக சரியாகும் லேசான நெஞ்சு அசௌகரியம்"],
    preventionStrategies: ["வாரத்திற்கு 150 நிமிடங்கள் மிதமான ஏரோபிக் உடற்பயிற்சி செய்யுங்கள்", "ஆரோக்கியமான எடையை பராமரியுங்கள் (BMI 18.5-24.9)", "புகைபிடிப்பதை நிறுத்துங்கள்", "மது அருந்துவதை நாளொன்றுக்கு 1-2 பானங்களாக குறையுங்கள்", "மன அழுத்தம் குறைக்கும் நுட்பங்களை பயிற்சி செய்யுங்கள்", "வழக்கமான உடல்நல பரிசோதனைகள்", "அறிகுறிகளுக்கு விரைவான மருத்துவ கவனம்", "பரிந்துரைக்கப்பட்ட தடுப்பு நடவடிக்கைகளை பின்பற்றுங்கள்"],
    complications: ["சிகிச்சையளிக்கப்படாவிட்டால் நிலையின் முன்னேற்றம்", "தொடர்புடைய உடல்நல பிரச்சினைகளின் வளர்ச்சி", "வாழ்க்கை தரத்தில் தாக்கம்", "மிகவும் தீவிரமான சிகிச்சையின் சாத்தியமான தேவை", "சரியான மேலாண்மை இல்லாமல் மீண்டும் வரும் ஆபத்து"],
    faqs: [
      { question: "சிறிய AAA ஐ அறுவை சிகிச்சை இல்லாமல் சிகிச்சையளிக்க முடியுமா?", answer: "ஆம், சிறிய நரம்புப் புடைப்புகள் (5.0 செமீ க்கு கீழ்) பெரும்பாலும் 'செயலில் கண்காணிப்பு' மூலம் நிர்வகிக்கப்படுகின்றன. இதில் ஒவ்வொரு 6-12 மாதங்களுக்கும் வழக்கமான இமேஜிங் மற்றும் ஆபத்து காரணிகளின் கடுமையான மேலாண்மை அடங்கும்." },
      { question: "AAA க்கு பொதுவாக எந்த அளவில் அறுவை சிகிச்சை பரிந்துரைக்கப்படுகிறது?", answer: "ஆண்களுக்கு 5.5 செமீ அல்லது பெண்களுக்கு 5.0 செமீ அளவை எட்டும்போது, அல்லது வேகமாக வளர்ந்தால் (ஆறு மாதங்களில் 0.5 செமீக்கு மேல்) அறுவை சிகிச்சை பரிந்துரைக்கப்படுகிறது." },
      { question: "தேர்ந்தெடுக்கப்பட்ட EVAR க்கு பிறகு மீட்பு எவ்வளவு நீளம்?", answer: "குறைந்தபட்ச ஊடுருவல் EVAR க்கு, மருத்துவமனையில் தங்குவது வழக்கமாக 1-2 நாட்கள், மற்றும் நோயாளிகள் ஒரு வாரத்தில் லேசான செயல்பாடுகளுக்கு திரும்புவார்கள்." },
      { question: "புகைபிடிப்பதால் நரம்புப் புடைப்பு வேகமாக வளருமா?", answer: "ஆம், புகைபிடிப்பு மிக முக்கியமான தடுக்கக்கூடிய ஆபத்து காரணி. இது நரம்புப் புடைப்பு உருவாவதற்கு மட்டுமல்ல, அவற்றின் வளர்ச்சியை கணிசமாக துரிதப்படுத்துகிறது." }
    ],
    keywords: ["வயிற்று பெருநாடி நரம்புப் புடைப்பு", "AAA சிகிச்சை", "இருதய நிபுணர்"],
    lifestyleModifications: ["வாரத்திற்கு 150 நிமிடங்கள் மிதமான ஏரோபிக் உடற்பயிற்சி", "ஆரோக்கியமான எடை பராமரிப்பு", "புகைபிடிப்பதை நிறுத்துதல்", "மது குறைத்தல்", "மன அழுத்த மேலாண்மை", "வீட்டில் இரத்த அழுத்த கண்காணிப்பு", "7-9 மணி நேர தூக்கம்", "சமூக ரீதியாக இணைந்திருத்தல்", "மருந்துகளை தவறாமல் எடுத்தல்", "வழக்கமான இருதய பரிசோதனைகள்"],
  },

  // ═══════════════════════════════════════
  // TELUGU (te)
  // ═══════════════════════════════════════
  te: {
    h1Title: "ఉదర మహాధమని అనూరిజం (AAA) పర్యవేక్షణ & చురుకైన మరమ్మత్తు: చిట్లడాన్ని నివారించడం",
    heroOverview: "చిట్లడానికి ముందు ఉదర మహాధమని అనూరిజం (AAA) ఒక నిశ్శబ్దమైన కానీ ముఖ్యమైన హృదయ సంబంధ ప్రమాదం, దీనికి శస్త్రచికిత్స నైపుణ్యం మరియు దీర్ఘకాలిక పర్యవేక్షణ అవసరం. aihealz వద్ద, ప్రత్యేక రక్తనాళ క్లినిక్‌లు మరియు ధృవీకరించబడిన హృదయ నిపుణులతో మిమ్మల్ని అనుసంధానం చేస్తాము.",
    definition: "చెడగొట్టబడని ఉదర మహాధమని అనూరిజం అనేది మహాధమని దిగువ భాగం యొక్క నిర్మాణాత్మక విస్తరణ. ఇది తరచుగా లక్షణరహితం, నిత్య శారీరక పరీక్షలు లేదా సంబంధం లేని ఇమేజింగ్ సమయంలో మాత్రమే కనుగొనబడుతుంది. అనూరిజం 5.0 నుండి 5.5 సెంటీమీటర్లకు చేరుకున్నప్పుడు, ఎలక్టివ్ శస్త్రచికిత్స సిఫార్సు చేయబడుతుంది.",
    diagnosisOverview: "AAA నిర్ధారణ అధిక-రిజల్యూషన్ ఇమేజింగ్‌పై ఎక్కువగా ఆధారపడుతుంది. వైద్యులు సాధారణంగా అల్ట్రాసౌండ్ లేదా CT స్కాన్ సమయంలో అనూరిజాన్ని కనుగొంటారు. ప్రత్యేక 'ఎయోర్టిక్ ప్రోటోకాల్' అల్ట్రాసౌండ్ లేదా CTA ద్వారా నిర్ధారణ నిర్ధారించబడుతుంది.",
    treatmentOverview: "చిట్లని AAA నిర్వహణ రెండు దశలుగా విభజించబడింది: చురుకైన పర్యవేక్షణ మరియు ఎలక్టివ్ మరమ్మత్తు. చిన్న అనూరిజాలకు ప్రతి 6 నుండి 12 నెలలకు క్రమం తప్పకుండా అల్ట్రాసౌండ్‌లు చేయించుకోవాలి. ఎలక్టివ్ ప్రక్రియలు 98% కంటే ఎక్కువ మనుగడ రేటుతో చాలా సురక్షితమైనవి.",
    prognosis: "AAA ను ముందుగానే గుర్తించి, అధికారిక పర్యవేక్షణ కార్యక్రమంలో పాల్గొనే రోగులకు, దీర్ఘకాలిక అంచనా అద్భుతంగా ఉంటుంది. ఎలక్టివ్ మరమ్మత్తు అత్యంత విజయవంతమైనది.",
    metaTitle: "ఉదర మహాధమని అనూరిజం చికిత్స మరియు నిపుణులు",
    metaDescription: "ఉదర మహాధమని అనూరిజం లక్షణాలు, కారణాలు, నిర్ధారణ మరియు చికిత్స ఎంపికల గురించి తెలుసుకోండి.",
    whySeeSpecialist: "మహాధమని అనూరిజం యొక్క చురుకైన నిర్వహణ ప్రత్యేక రక్తనాళ శస్త్రచికిత్స నిపుణుడు లేదా ఇంటర్వెన్షనల్ కార్డియాలజిస్ట్ ద్వారా ఉత్తమంగా నిర్వహించబడుతుంది.",
    primarySymptoms: ["ఛాతీ నొప్పి లేదా అసౌకర్యం (ఆంజైనా)", "అలసట లేదా బలహీనత", "కాళ్ళు, చీలమండలు లేదా పాదాలలో వాపు", "చేయి, దవడ, మెడ లేదా వీపుకు వ్యాపించే నొప్పి"],
    earlyWarningSigns: ["సాధారణ కార్యకలాపాల సమయంలో అసాధారణ అలసట", "తక్కువ శ్రమతో ఊపిరి తీసుకోవడంలో ఇబ్బంది", "త్వరగా తగ్గిపోయే తేలికపాటి ఛాతీ అసౌకర్యం"],
    preventionStrategies: ["వారానికి 150 నిమిషాలు మితమైన ఏరోబిక్ వ్యాయామం చేయండి", "ఆరోగ్యకరమైన బరువును నిర్వహించండి (BMI 18.5-24.9)", "ధూమపానం మానేయండి", "మద్యపానాన్ని రోజుకు 1-2 పానీయాలకు పరిమితం చేయండి", "ఒత్తిడి తగ్గింపు పద్ధతులు అభ్యసించండి", "క్రమం తప్పకుండా ఆరోగ్య పరీక్షలు", "లక్షణాలకు ముందస్తు వైద్య శ్రద్ధ", "సూచించిన నివారణ చర్యలను అనుసరించండి"],
    complications: ["చికిత్స చేయకపోతే పరిస్థితి పురోగతి", "సంబంధిత ఆరోగ్య సమస్యల అభివృద్ధి", "జీవన నాణ్యతపై ప్రభావం", "మరింత తీవ్రమైన చికిత్స అవసరం", "సరైన నిర్వహణ లేకుండా పునరావృత్తి ప్రమాదం"],
    faqs: [
      { question: "చిన్న AAA కి శస్త్రచికిత్స లేకుండా చికిత్స చేయవచ్చా?", answer: "అవును, చిన్న అనూరిజాలు (5.0 సెం.మీ. కంటే తక్కువ) తరచుగా 'చురుకైన పర్యవేక్షణ' ద్వారా నిర్వహించబడతాయి." },
      { question: "AAA కి సాధారణంగా ఏ పరిమాణంలో శస్త్రచికిత్స సిఫార్సు చేయబడుతుంది?", answer: "పురుషులకు 5.5 సెం.మీ. లేదా మహిళలకు 5.0 సెం.మీ. పరిమాణం చేరుకున్నప్పుడు శస్త్రచికిత్స సిఫార్సు చేయబడుతుంది." },
      { question: "ధూమపానం వల్ల అనూరిజం వేగంగా పెరుగుతుందా?", answer: "అవును, ధూమపానం అత్యంత ముఖ్యమైన నివారించగల ప్రమాద కారకం." }
    ],
    keywords: ["ఉదర మహాధమని అనూరిజం", "AAA చికిత్స", "హృదయ నిపుణుడు"],
    lifestyleModifications: ["వారానికి 150 నిమిషాలు మితమైన ఏరోబిక్ వ్యాయామం", "ఆరోగ్యకరమైన బరువు నిర్వహణ", "ధూమపానం మానేయడం", "మద్యం తగ్గించడం", "ఒత్తిడి నిర్వహణ", "ఇంట్లో రక్తపోటు పర్యవేక్షణ", "7-9 గంటల నిద్ర", "సామాజికంగా అనుసంధానమై ఉండటం", "మందులు క్రమం తప్పకుండా తీసుకోవడం", "క్రమ హృదయ పరీక్షలు"],
  },

  // ═══════════════════════════════════════
  // SPANISH (es)
  // ═══════════════════════════════════════
  es: {
    h1Title: "Aneurisma de Aorta Abdominal (AAA): Monitoreo y Reparación Proactiva",
    heroOverview: "Un aneurisma de aorta abdominal (AAA) antes de la ruptura es un riesgo cardiovascular silencioso pero significativo que requiere experiencia quirúrgica y vigilancia a largo plazo. Cuando la aorta se hincha pero aún no se ha roto, tiene la ventaja del tiempo para planificar una reparación electiva de alta precisión. En aihealz, lo conectamos con clínicas vasculares especializadas y cardiólogos certificados que utilizan las últimas imágenes para monitorear el crecimiento del aneurisma.",
    definition: "Un aneurisma de aorta abdominal (AAA) intacto es un agrandamiento estructural de la parte inferior de la aorta. A diferencia de una ruptura, esta condición suele ser asintomática, descubierta solo durante exámenes físicos de rutina o imágenes no relacionadas. Es fundamentalmente una debilidad estructural en la pared arterial que puede hincharse como un globo con el tiempo. Cuando el aneurisma alcanza los 5.0 a 5.5 centímetros, se recomienda la intervención quirúrgica electiva.",
    diagnosisOverview: "El diagnóstico de un AAA intacto depende en gran medida de imágenes de alta resolución, ya que los síntomas físicos suelen estar ausentes. Los médicos descubren el aneurisma durante una ecografía o tomografía. El diagnóstico se formaliza mediante una ecografía de 'Protocolo Aórtico' o una ATC (Angiografía por TC).",
    treatmentOverview: "El manejo de un AAA no roto se divide en dos fases: vigilancia activa y reparación electiva. Para aneurismas pequeños, incluye ecografías regulares cada 6 a 12 meses y control estricto de la presión arterial y el colesterol. Los procedimientos electivos son significativamente más seguros con una tasa de supervivencia superior al 98%.",
    prognosis: "Para los pacientes que detectan su AAA tempranamente y participan en un programa de vigilancia formal, el pronóstico a largo plazo es excelente. La reparación electiva es muy exitosa y efectivamente 'cura' la amenaza del aneurisma.",
    metaTitle: "Aneurisma de aorta abdominal: tratamiento y especialistas",
    metaDescription: "Conozca los síntomas, causas, diagnóstico y opciones de tratamiento del aneurisma de aorta abdominal. Encuentre los mejores cardiólogos.",
    whySeeSpecialist: "El manejo proactivo de un aneurisma aórtico es mejor manejado por un cirujano vascular especializado o un cardiólogo intervencionista con experiencia en enfermedades aórticas. Estos especialistas se enfocan específicamente en la integridad estructural de los vasos principales.",
    primarySymptoms: ["Dolor o molestia en el pecho (angina)", "Fatiga o debilidad", "Hinchazón en piernas, tobillos o pies (edema)", "Dolor que se irradia al brazo, mandíbula, cuello o espalda"],
    earlyWarningSigns: ["Fatiga inusual durante actividades normales", "Dificultad para respirar con esfuerzo mínimo", "Molestia leve en el pecho que se resuelve rápidamente"],
    preventionStrategies: ["Realizar 150 minutos de actividad aeróbica moderada semanalmente", "Mantener un peso saludable (IMC 18.5-24.9)", "Dejar de fumar y evitar el humo de segunda mano", "Limitar el alcohol a 1-2 bebidas por día", "Practicar técnicas de reducción del estrés (meditación, yoga)", "Chequeos médicos regulares", "Atención médica temprana ante síntomas", "Seguir las medidas preventivas prescritas"],
    complications: ["Progresión de la condición si no se trata", "Desarrollo de problemas de salud relacionados", "Impacto en la calidad de vida", "Posible necesidad de tratamiento más agresivo", "Riesgo de recurrencia sin manejo adecuado"],
    faqs: [
      { question: "¿Se puede tratar un AAA pequeño sin cirugía?", answer: "Sí, los aneurismas pequeños (menos de 5.0 cm) se manejan frecuentemente mediante 'vigilancia activa'. Esto incluye chequeos de imagen regulares cada 6-12 meses y control estricto de factores de riesgo." },
      { question: "¿A qué tamaño se recomienda la cirugía para AAA?", answer: "La cirugía generalmente se recomienda cuando el aneurisma alcanza 5.5 cm para hombres o 5.0 cm para mujeres, o si está creciendo rápidamente." },
      { question: "¿Es más segura la reparación electiva que la de emergencia?", answer: "Significativamente. La reparación electiva tiene una tasa de supervivencia superior al 95-98%, mientras que la reparación de emergencia tiene una tasa de mortalidad mucho mayor (frecuentemente 50% o más)." },
      { question: "¿Puedo hacer ejercicio con un AAA no roto?", answer: "La mayoría de los pacientes pueden continuar con ejercicio ligero como caminar. Sin embargo, debe evitar levantamiento de pesas pesado o ejercicio de alta intensidad." }
    ],
    keywords: ["aneurisma de aorta abdominal", "tratamiento AAA", "síntomas AAA", "cardiólogo"],
    lifestyleModifications: ["150 minutos de ejercicio aeróbico moderado semanal", "Mantener peso saludable", "Dejar de fumar", "Limitar alcohol", "Técnicas de reducción de estrés", "Monitorear presión arterial en casa", "Dormir 7-9 horas", "Mantenerse socialmente conectado", "Tomar medicamentos según prescripción", "Chequeos cardíacos regulares"],
  },

  // ═══════════════════════════════════════
  // FRENCH (fr)
  // ═══════════════════════════════════════
  fr: {
    h1Title: "Anévrisme de l'Aorte Abdominale (AAA) : Surveillance et Réparation Proactive",
    heroOverview: "Un anévrisme de l'aorte abdominale (AAA) avant la rupture est un risque cardiovasculaire silencieux mais significatif nécessitant une expertise chirurgicale et une surveillance à long terme. Sur aihealz, nous vous mettons en contact avec des cliniques vasculaires spécialisées et des cardiologues certifiés.",
    definition: "Un anévrisme de l'aorte abdominale intact est un élargissement structurel de la partie inférieure de l'aorte. Contrairement à une rupture, cette condition est souvent asymptomatique. C'est fondamentalement une faiblesse structurelle de la paroi artérielle qui peut se gonfler comme un ballon au fil du temps. Lorsque l'anévrisme atteint 5,0 à 5,5 centimètres, une intervention chirurgicale élective est recommandée.",
    diagnosisOverview: "Le diagnostic d'un AAA intact repose fortement sur l'imagerie haute résolution. Les médecins découvrent généralement l'anévrisme lors d'une échographie ou d'un scanner. Le diagnostic est formalisé par une échographie spécialisée ou une angiographie par scanner.",
    treatmentOverview: "La gestion d'un AAA non rompu se divise en deux phases : surveillance active et réparation élective. Les procédures électives sont nettement plus sûres avec un taux de survie supérieur à 98%.",
    prognosis: "Pour les patients qui détectent leur AAA tôt et participent à un programme de surveillance, le pronostic à long terme est excellent. La réparation élective est très réussie et 'guérit' efficacement la menace.",
    metaTitle: "Anévrisme aorte abdominale : traitement et spécialistes",
    metaDescription: "Découvrez les symptômes, causes, diagnostic et options de traitement de l'anévrisme de l'aorte abdominale.",
    whySeeSpecialist: "La gestion proactive d'un anévrisme aortique est mieux assurée par un chirurgien vasculaire spécialisé ou un cardiologue interventionnel expert en pathologie aortique.",
    primarySymptoms: ["Douleur ou gêne thoracique (angine)", "Fatigue ou faiblesse", "Gonflement des jambes, chevilles ou pieds (œdème)", "Douleur irradiant vers le bras, la mâchoire, le cou ou le dos"],
    earlyWarningSigns: ["Fatigue inhabituelle lors d'activités normales", "Essoufflement avec effort minimal", "Légère gêne thoracique se résolvant rapidement"],
    preventionStrategies: ["150 minutes d'activité aérobique modérée par semaine", "Maintenir un poids sain (IMC 18,5-24,9)", "Arrêter de fumer", "Limiter l'alcool à 1-2 verres par jour", "Pratiquer des techniques de réduction du stress", "Bilans de santé réguliers", "Attention médicale précoce", "Suivre les mesures préventives prescrites"],
    complications: ["Progression si non traité", "Développement de problèmes de santé connexes", "Impact sur la qualité de vie", "Besoin potentiel de traitement plus agressif", "Risque de récidive sans gestion appropriée"],
    faqs: [
      { question: "Un petit AAA peut-il être traité sans chirurgie ?", answer: "Oui, les petits anévrismes (moins de 5,0 cm) sont souvent gérés par 'surveillance active' avec des contrôles d'imagerie tous les 6-12 mois." },
      { question: "À quelle taille la chirurgie est-elle recommandée ?", answer: "La chirurgie est recommandée lorsque l'anévrisme atteint 5,5 cm chez les hommes ou 5,0 cm chez les femmes." },
      { question: "La réparation élective est-elle plus sûre que la réparation d'urgence ?", answer: "Nettement. La réparation élective a un taux de survie supérieur à 95-98%, contre un taux de mortalité souvent de 50% ou plus pour la réparation d'urgence." }
    ],
    keywords: ["anévrisme aorte abdominale", "traitement AAA", "cardiologue"],
    lifestyleModifications: ["150 minutes d'exercice aérobique modéré par semaine", "Maintien d'un poids sain", "Arrêt du tabac", "Limitation de l'alcool", "Gestion du stress", "Surveillance de la tension artérielle à domicile", "7-9 heures de sommeil", "Rester socialement connecté", "Prise régulière des médicaments", "Bilans cardiaques réguliers"],
  },

  // ═══════════════════════════════════════
  // ARABIC (ar)
  // ═══════════════════════════════════════
  ar: {
    h1Title: "تمدد الشريان الأبهري البطني (AAA): المراقبة والإصلاح الاستباقي",
    heroOverview: "تمدد الشريان الأبهري البطني قبل التمزق هو خطر قلبي وعائي صامت ولكنه خطير يتطلب خبرة جراحية ومراقبة طويلة الأمد. في aihealz، نربطك بعيادات الأوعية الدموية المتخصصة وأطباء القلب المعتمدين.",
    definition: "تمدد الشريان الأبهري البطني السليم هو توسع هيكلي في الجزء السفلي من الشريان الأبهر. على عكس التمزق، غالبًا ما تكون هذه الحالة بدون أعراض. عندما يصل التمدد إلى 5.0 إلى 5.5 سنتيمتر، يُوصى بالتدخل الجراحي الاختياري.",
    diagnosisOverview: "يعتمد تشخيص تمدد الشريان الأبهري البطني بشكل كبير على التصوير عالي الدقة. يكتشف الأطباء التمدد عادةً أثناء الموجات فوق الصوتية أو التصوير المقطعي.",
    treatmentOverview: "تنقسم إدارة تمدد الشريان الأبهري غير المتمزق إلى مرحلتين: المراقبة النشطة والإصلاح الاختياري. الإجراءات الاختيارية أكثر أمانًا بمعدل بقاء يتجاوز 98%.",
    prognosis: "للمرضى الذين يكتشفون تمدد الشريان مبكرًا ويشاركون في برنامج مراقبة، فإن التوقعات طويلة الأمد ممتازة.",
    metaTitle: "تمدد الشريان الأبهري البطني: العلاج والمتخصصون",
    metaDescription: "تعرف على أعراض وأسباب وتشخيص وخيارات علاج تمدد الشريان الأبهري البطني.",
    whySeeSpecialist: "الإدارة الاستباقية لتمدد الشريان الأبهري تُدار بشكل أفضل من قبل جراح أوعية دموية متخصص أو طبيب قلب تدخلي.",
    primarySymptoms: ["ألم أو انزعاج في الصدر (ذبحة صدرية)", "إرهاق أو ضعف", "تورم في الساقين أو الكاحلين أو القدمين", "ألم ينتشر إلى الذراع أو الفك أو الرقبة أو الظهر"],
    earlyWarningSigns: ["إرهاق غير عادي أثناء الأنشطة العادية", "ضيق في التنفس مع مجهود بسيط", "انزعاج خفيف في الصدر يزول بسرعة"],
    preventionStrategies: ["150 دقيقة من النشاط الهوائي المعتدل أسبوعيًا", "الحفاظ على وزن صحي", "الإقلاع عن التدخين", "تقليل الكحول", "تقنيات تقليل التوتر", "فحوصات صحية منتظمة", "عناية طبية مبكرة", "اتباع التدابير الوقائية"],
    complications: ["تطور الحالة إذا لم تُعالج", "تطور مشاكل صحية مرتبطة", "التأثير على جودة الحياة", "احتمال الحاجة لعلاج أكثر عدوانية", "خطر التكرار بدون إدارة مناسبة"],
    faqs: [
      { question: "هل يمكن علاج تمدد صغير بدون جراحة؟", answer: "نعم، التمددات الصغيرة (أقل من 5.0 سم) تُدار غالبًا من خلال 'المراقبة النشطة' مع فحوصات تصوير منتظمة كل 6-12 شهرًا." },
      { question: "في أي حجم يُوصى بالجراحة؟", answer: "تُوصى الجراحة عندما يصل التمدد إلى 5.5 سم للرجال أو 5.0 سم للنساء." },
      { question: "هل الإصلاح الاختياري أكثر أمانًا من إصلاح الطوارئ؟", answer: "بالتأكيد. الإصلاح الاختياري لديه معدل بقاء يتجاوز 95-98%، بينما إصلاح الطوارئ لديه معدل وفيات أعلى بكثير." }
    ],
    keywords: ["تمدد الشريان الأبهري البطني", "علاج AAA", "طبيب قلب"],
    lifestyleModifications: ["150 دقيقة تمارين هوائية معتدلة أسبوعيًا", "الحفاظ على وزن صحي", "الإقلاع عن التدخين", "تقليل الكحول", "إدارة التوتر", "مراقبة ضغط الدم في المنزل", "نوم 7-9 ساعات", "البقاء على اتصال اجتماعي", "تناول الأدوية بانتظام", "فحوصات قلب منتظمة"],
  },

  // ═══════════════════════════════════════
  // BENGALI (bn)
  // ═══════════════════════════════════════
  bn: {
    h1Title: "পেটের মহাধমনী অ্যানিউরিজম (AAA) পর্যবেক্ষণ ও সক্রিয় মেরামত",
    heroOverview: "ফাটার আগে পেটের মহাধমনী অ্যানিউরিজম একটি নীরব কিন্তু গুরুত্বপূর্ণ হৃদরোগ ঝুঁকি। aihealz-এ আমরা আপনাকে বিশেষ ভাস্কুলার ক্লিনিক এবং প্রত্যয়িত হৃদরোগ বিশেষজ্ঞদের সাথে সংযুক্ত করি।",
    definition: "অক্ষত পেটের মহাধমনী অ্যানিউরিজম হলো মহাধমনীর নিম্নাংশের কাঠামোগত প্রসারণ। এটি প্রায়ই উপসর্গহীন। অ্যানিউরিজম 5.0 থেকে 5.5 সেমি পৌঁছালে ঐচ্ছিক অস্ত্রোপচারের পরামর্শ দেওয়া হয়।",
    diagnosisOverview: "AAA নির্ণয় উচ্চ-রেজোলিউশন ইমেজিংয়ের উপর নির্ভর করে। চিকিৎসকরা সাধারণত আল্ট্রাসাউন্ড বা সিটি স্ক্যানের সময় অ্যানিউরিজম আবিষ্কার করেন।",
    treatmentOverview: "না-ফাটা AAA ব্যবস্থাপনা দুটি পর্যায়ে বিভক্ত: সক্রিয় পর্যবেক্ষণ এবং ঐচ্ছিক মেরামত। ঐচ্ছিক প্রক্রিয়াগুলি 98%-এর বেশি বেঁচে থাকার হার সহ অনেক বেশি নিরাপদ।",
    prognosis: "যে রোগীরা তাদের AAA তাড়াতাড়ি সনাক্ত করেন এবং আনুষ্ঠানিক পর্যবেক্ষণে অংশ নেন, তাদের দীর্ঘমেয়াদী পূর্বাভাস চমৎকার।",
    metaTitle: "পেটের মহাধমনী অ্যানিউরিজম চিকিৎসা ও বিশেষজ্ঞ",
    metaDescription: "পেটের মহাধমনী অ্যানিউরিজমের উপসর্গ, কারণ, নির্ণয় এবং চিকিৎসা বিকল্প সম্পর্কে জানুন।",
    whySeeSpecialist: "মহাধমনী অ্যানিউরিজমের সক্রিয় ব্যবস্থাপনা বিশেষ ভাস্কুলার সার্জন বা ইন্টারভেনশনাল কার্ডিওলজিস্ট দ্বারা সবচেয়ে ভালো হয়।",
    primarySymptoms: ["বুকে ব্যথা বা অস্বস্তি (এনজাইনা)", "ক্লান্তি বা দুর্বলতা", "পা, গোড়ালি বা পায়ে ফোলা", "বাহু, চোয়াল, ঘাড় বা পিঠে ব্যথা ছড়িয়ে পড়া"],
    earlyWarningSigns: ["স্বাভাবিক কাজকর্মে অস্বাভাবিক ক্লান্তি", "সামান্য পরিশ্রমে শ্বাসকষ্ট", "হালকা বুকের অস্বস্তি যা দ্রুত ঠিক হয়ে যায়"],
    preventionStrategies: ["সপ্তাহে 150 মিনিট মাঝারি এরোবিক ব্যায়াম করুন", "স্বাস্থ্যকর ওজন বজায় রাখুন", "ধূমপান ত্যাগ করুন", "মদ্যপান সীমিত করুন", "মানসিক চাপ কমানোর কৌশল অনুশীলন করুন", "নিয়মিত স্বাস্থ্য পরীক্ষা", "উপসর্গে দ্রুত চিকিৎসা মনোযোগ", "নির্ধারিত প্রতিরোধমূলক ব্যবস্থা মেনে চলুন"],
    complications: ["চিকিৎসা না হলে অবস্থার অবনতি", "সম্পর্কিত স্বাস্থ্য সমস্যার বিকাশ", "জীবনযাত্রার মানে প্রভাব", "আরও আক্রমণাত্মক চিকিৎসার সম্ভাব্য প্রয়োজন", "সঠিক ব্যবস্থাপনা ছাড়া পুনরাবৃত্তির ঝুঁকি"],
    faqs: [
      { question: "ছোট AAA কি অস্ত্রোপচার ছাড়া চিকিৎসা করা যায়?", answer: "হ্যাঁ, ছোট অ্যানিউরিজম (5.0 সেমির নিচে) প্রায়ই 'সক্রিয় পর্যবেক্ষণ' দিয়ে পরিচালিত হয়।" },
      { question: "কোন আকারে AAA-র জন্য অস্ত্রোপচার সুপারিশ করা হয়?", answer: "পুরুষদের জন্য 5.5 সেমি বা মহিলাদের জন্য 5.0 সেমি পৌঁছালে অস্ত্রোপচার সুপারিশ করা হয়।" },
      { question: "ধূমপান কি অ্যানিউরিজম দ্রুত বাড়ায়?", answer: "হ্যাঁ, ধূমপান সবচেয়ে গুরুত্বপূর্ণ প্রতিরোধযোগ্য ঝুঁকির কারণ।" }
    ],
    keywords: ["পেটের মহাধমনী অ্যানিউরিজম", "AAA চিকিৎসা", "হৃদরোগ বিশেষজ্ঞ"],
    lifestyleModifications: ["সপ্তাহে 150 মিনিট মাঝারি এরোবিক ব্যায়াম", "স্বাস্থ্যকর ওজন বজায় রাখা", "ধূমপান ত্যাগ", "মদ্যপান সীমিত", "মানসিক চাপ ব্যবস্থাপনা", "বাড়িতে রক্তচাপ পর্যবেক্ষণ", "7-9 ঘণ্টা ঘুম", "সামাজিকভাবে সংযুক্ত থাকা", "নিয়মিত ওষুধ সেবন", "নিয়মিত হৃদযন্ত্র পরীক্ষা"],
  },

  // ═══════════════════════════════════════
  // GERMAN (de)
  // ═══════════════════════════════════════
  de: {
    h1Title: "Bauchaortenaneurysma (AAA): Überwachung und proaktive Reparatur",
    heroOverview: "Ein Bauchaortenaneurysma vor der Ruptur ist ein stilles aber bedeutendes kardiovaskuläres Risiko. Bei aihealz verbinden wir Sie mit spezialisierten Gefäßkliniken und zertifizierten Kardiologen.",
    definition: "Ein intaktes Bauchaortenaneurysma ist eine strukturelle Erweiterung des unteren Teils der Aorta. Dieser Zustand ist oft asymptomatisch. Wenn das Aneurysma 5,0 bis 5,5 Zentimeter erreicht, wird ein elektiver chirurgischer Eingriff empfohlen.",
    diagnosisOverview: "Die Diagnose stützt sich stark auf hochauflösende Bildgebung. Ärzte entdecken das Aneurysma typischerweise während eines Ultraschalls oder CT-Scans.",
    treatmentOverview: "Das Management teilt sich in zwei Phasen: aktive Überwachung und elektive Reparatur. Elektive Eingriffe sind mit einer Überlebensrate von über 98% deutlich sicherer.",
    prognosis: "Für Patienten, die ihr AAA früh erkennen und an einem Überwachungsprogramm teilnehmen, ist die Langzeitprognose ausgezeichnet.",
    metaTitle: "Bauchaortenaneurysma: Behandlung und Spezialisten",
    metaDescription: "Erfahren Sie mehr über Symptome, Ursachen, Diagnose und Behandlung des Bauchaortenaneurysmas.",
    whySeeSpecialist: "Das proaktive Management wird am besten von einem spezialisierten Gefäßchirurgen oder interventionellen Kardiologen durchgeführt.",
    primarySymptoms: ["Brustschmerzen oder -beschwerden (Angina)", "Müdigkeit oder Schwäche", "Schwellungen in Beinen, Knöcheln oder Füßen", "Schmerzen, die in Arm, Kiefer, Hals oder Rücken ausstrahlen"],
    earlyWarningSigns: ["Ungewöhnliche Müdigkeit bei normalen Aktivitäten", "Atemnot bei minimaler Anstrengung", "Leichte Brustbeschwerden, die schnell abklingen"],
    preventionStrategies: ["150 Minuten moderate aerobe Aktivität pro Woche", "Gesundes Gewicht halten (BMI 18,5-24,9)", "Rauchen aufgeben", "Alkohol auf 1-2 Getränke täglich begrenzen", "Stressreduktionstechniken praktizieren", "Regelmäßige Gesundheitsuntersuchungen", "Frühzeitige ärztliche Aufmerksamkeit", "Verordnete Präventivmaßnahmen befolgen"],
    complications: ["Fortschreiten bei Nichtbehandlung", "Entwicklung verwandter Gesundheitsprobleme", "Auswirkungen auf die Lebensqualität", "Möglicher Bedarf an aggressiverer Behandlung", "Rezidivrisiko ohne angemessenes Management"],
    faqs: [
      { question: "Kann ein kleines AAA ohne Operation behandelt werden?", answer: "Ja, kleine Aneurysmen (unter 5,0 cm) werden oft durch 'aktive Überwachung' mit regelmäßigen Bildgebungskontrollen alle 6-12 Monate behandelt." },
      { question: "Bei welcher Größe wird eine Operation empfohlen?", answer: "Bei 5,5 cm für Männer oder 5,0 cm für Frauen, oder bei schnellem Wachstum." },
      { question: "Ist die elektive Reparatur sicherer als die Notfallreparatur?", answer: "Deutlich. Die elektive Reparatur hat eine Überlebensrate von über 95-98%." }
    ],
    keywords: ["Bauchaortenaneurysma", "AAA Behandlung", "Kardiologe"],
    lifestyleModifications: ["150 Minuten moderate Bewegung pro Woche", "Gesundes Gewicht halten", "Rauchen aufgeben", "Alkohol begrenzen", "Stressmanagement", "Blutdruck zu Hause messen", "7-9 Stunden Schlaf", "Sozial verbunden bleiben", "Medikamente regelmäßig einnehmen", "Regelmäßige Herzuntersuchungen"],
  },

  // ═══════════════════════════════════════
  // JAPANESE (ja)
  // ═══════════════════════════════════════
  ja: {
    h1Title: "腹部大動脈瘤（AAA）の監視と積極的修復：破裂の回避",
    heroOverview: "破裂前の腹部大動脈瘤（AAA）は、外科的専門知識と長期的な監視が必要な静かだが重大な心血管リスクです。aihealzでは、専門的な血管クリニックと認定循環器専門医とつなぎます。",
    definition: "無傷の腹部大動脈瘤は、大動脈下部の構造的拡大です。破裂とは異なり、この状態は多くの場合無症状です。動脈瘤が5.0〜5.5センチメートルに達すると、予定手術が推奨されます。",
    diagnosisOverview: "AAAの診断は高解像度イメージングに大きく依存しています。医師は通常、超音波検査やCTスキャン中に動脈瘤を発見します。",
    treatmentOverview: "未破裂AAAの管理は、積極的監視と予定修復の2段階に分かれます。予定手術は98%以上の生存率で大幅に安全です。",
    prognosis: "AAAを早期に発見し、正式な監視プログラムに参加する患者の長期予後は優れています。",
    metaTitle: "腹部大動脈瘤の治療と専門医",
    metaDescription: "腹部大動脈瘤の症状、原因、診断、治療オプションについてご覧ください。",
    whySeeSpecialist: "大動脈瘤の積極的管理は、専門の血管外科医またはインターベンション心臓専門医が最善です。",
    primarySymptoms: ["胸の痛みまたは不快感（狭心症）", "疲労または脱力感", "脚、足首、足のむくみ", "腕、顎、首、背中への放散痛"],
    earlyWarningSigns: ["通常の活動中の異常な疲労", "わずかな労作での息切れ", "すぐに治まる軽い胸部不快感"],
    preventionStrategies: ["週150分の中程度の有酸素運動", "健康的な体重の維持（BMI 18.5-24.9）", "禁煙", "飲酒を1日1-2杯に制限", "ストレス軽減技術の実践", "定期健康診断", "症状への早期医療対応", "処方された予防策の遵守"],
    complications: ["未治療の場合の進行", "関連する健康問題の発生", "生活の質への影響", "より積極的な治療の必要性", "適切な管理なしの再発リスク"],
    faqs: [
      { question: "小さなAAAは手術なしで治療できますか？", answer: "はい、小さな動脈瘤（5.0cm未満）は「積極的監視」で管理されることが多いです。" },
      { question: "どのサイズで手術が推奨されますか？", answer: "男性で5.5cm、女性で5.0cmに達した場合に手術が推奨されます。" },
      { question: "喫煙は動脈瘤の成長を速めますか？", answer: "はい、喫煙は最も重要な予防可能な危険因子です。" }
    ],
    keywords: ["腹部大動脈瘤", "AAA治療", "循環器専門医"],
    lifestyleModifications: ["週150分の中程度の有酸素運動", "健康的な体重維持", "禁煙", "飲酒制限", "ストレス管理", "自宅での血圧測定", "7-9時間の睡眠", "社会的つながりの維持", "処方薬の定期服用", "定期心臓検診"],
  },

  // ═══════════════════════════════════════
  // KOREAN (ko)
  // ═══════════════════════════════════════
  ko: {
    h1Title: "복부대동맥류(AAA) 모니터링 및 사전 수리: 파열 예방",
    heroOverview: "파열 전 복부대동맥류(AAA)는 외과적 전문 지식과 장기적 감시가 필요한 조용하지만 중대한 심혈관 위험입니다. aihealz에서 전문 혈관 클리닉과 인증된 심장 전문의를 연결해 드립니다.",
    definition: "온전한 복부대동맥류는 대동맥 하부의 구조적 확장입니다. 파열과 달리 이 상태는 대개 무증상입니다. 동맥류가 5.0~5.5cm에 도달하면 선택적 수술이 권장됩니다.",
    diagnosisOverview: "AAA 진단은 고해상도 영상에 크게 의존합니다. 의사들은 일반적으로 초음파나 CT 스캔 중에 동맥류를 발견합니다.",
    treatmentOverview: "비파열 AAA 관리는 능동적 감시와 선택적 수리 두 단계로 나뉩니다. 선택적 시술은 98% 이상의 생존율로 훨씬 안전합니다.",
    prognosis: "AAA를 조기에 발견하고 공식 감시 프로그램에 참여하는 환자의 장기 예후는 우수합니다.",
    metaTitle: "복부대동맥류 치료 및 전문의",
    metaDescription: "복부대동맥류의 증상, 원인, 진단 및 치료 옵션에 대해 알아보세요.",
    whySeeSpecialist: "대동맥류의 사전 관리는 전문 혈관외과의 또는 중재적 심장내과의가 가장 잘 수행합니다.",
    primarySymptoms: ["가슴 통증 또는 불편감(협심증)", "피로 또는 쇠약", "다리, 발목 또는 발의 부종", "팔, 턱, 목 또는 등으로 퍼지는 통증"],
    earlyWarningSigns: ["일상 활동 중 비정상적 피로", "최소 운동 시 호흡곤란", "빠르게 해소되는 경미한 가슴 불편감"],
    preventionStrategies: ["주 150분 중등도 유산소 운동", "건강한 체중 유지(BMI 18.5-24.9)", "금연", "음주 하루 1-2잔으로 제한", "스트레스 감소 기법 실천", "정기 건강검진", "증상에 조기 의료 관심", "처방된 예방 조치 준수"],
    complications: ["치료하지 않으면 상태 진행", "관련 건강 문제 발생", "삶의 질 영향", "더 공격적인 치료 필요 가능성", "적절한 관리 없이 재발 위험"],
    faqs: [
      { question: "작은 AAA는 수술 없이 치료할 수 있나요?", answer: "네, 작은 동맥류(5.0cm 미만)는 6-12개월마다 정기 영상 검사를 통한 '능동적 감시'로 관리합니다." },
      { question: "어떤 크기에서 수술이 권장되나요?", answer: "남성 5.5cm, 여성 5.0cm에 도달하면 수술이 권장됩니다." },
      { question: "흡연이 동맥류 성장을 가속하나요?", answer: "네, 흡연은 가장 중요한 예방 가능한 위험 인자입니다." }
    ],
    keywords: ["복부대동맥류", "AAA 치료", "심장 전문의"],
    lifestyleModifications: ["주 150분 중등도 유산소 운동", "건강한 체중 유지", "금연", "음주 제한", "스트레스 관리", "가정 혈압 모니터링", "7-9시간 수면", "사회적 연결 유지", "처방약 정기 복용", "정기 심장 검진"],
  },

  // ═══════════════════════════════════════
  // CHINESE (zh)
  // ═══════════════════════════════════════
  zh: {
    h1Title: "腹主动脉瘤（AAA）监测与主动修复：避免破裂",
    heroOverview: "破裂前的腹主动脉瘤（AAA）是一种无声但重要的心血管风险，需要外科专业知识和长期监测。在aihealz，我们为您连接专业血管诊所和认证心脏病专家。",
    definition: "完整的腹主动脉瘤是主动脉下部的结构性扩张。与破裂不同，这种情况通常无症状。当动脉瘤达到5.0至5.5厘米时，建议进行择期手术干预。",
    diagnosisOverview: "AAA诊断高度依赖高分辨率影像学检查。医生通常在超声或CT扫描中发现动脉瘤。",
    treatmentOverview: "未破裂AAA的管理分为两个阶段：主动监测和择期修复。择期手术生存率超过98%，显著更安全。",
    prognosis: "早期发现AAA并参与正式监测计划的患者，长期预后极佳。",
    metaTitle: "腹主动脉瘤治疗与专家",
    metaDescription: "了解腹主动脉瘤的症状、原因、诊断和治疗方案。寻找最佳心脏病专家。",
    whySeeSpecialist: "主动脉瘤的主动管理最好由专业血管外科医生或介入心脏病专家来处理。",
    primarySymptoms: ["胸痛或不适（心绞痛）", "疲劳或虚弱", "腿部、脚踝或足部肿胀（水肿）", "疼痛放射至手臂、下颌、颈部或背部"],
    earlyWarningSigns: ["日常活动中异常疲劳", "轻微用力即气短", "轻微胸部不适且迅速缓解"],
    preventionStrategies: ["每周150分钟中等强度有氧运动", "保持健康体重（BMI 18.5-24.9）", "戒烟", "限制饮酒每天1-2杯", "练习减压技巧（冥想、瑜伽）", "定期健康检查", "出现症状及早就医", "遵循处方预防措施"],
    complications: ["未治疗则病情进展", "相关健康问题的发展", "对生活质量的影响", "可能需要更积极的治疗", "缺乏适当管理的复发风险"],
    faqs: [
      { question: "小的AAA可以不手术治疗吗？", answer: "可以，小动脉瘤（5.0厘米以下）通常通过每6-12个月定期影像检查的'主动监测'来管理。" },
      { question: "多大尺寸建议手术？", answer: "男性达到5.5厘米或女性达到5.0厘米时建议手术。" },
      { question: "吸烟会加速动脉瘤生长吗？", answer: "是的，吸烟是最重要的可预防危险因素。" }
    ],
    keywords: ["腹主动脉瘤", "AAA治疗", "心脏病专家"],
    lifestyleModifications: ["每周150分钟中等有氧运动", "保持健康体重", "戒烟", "限制饮酒", "压力管理", "家庭血压监测", "7-9小时睡眠", "保持社交联系", "按时服药", "定期心脏检查"],
  },

  // ═══════════════════════════════════════
  // PORTUGUESE (pt)
  // ═══════════════════════════════════════
  pt: {
    h1Title: "Aneurisma da Aorta Abdominal (AAA): Monitoramento e Reparo Proativo",
    heroOverview: "Um aneurisma da aorta abdominal antes da ruptura é um risco cardiovascular silencioso mas significativo. No aihealz, conectamos você com clínicas vasculares especializadas e cardiologistas certificados.",
    definition: "Um aneurisma da aorta abdominal intacto é um alargamento estrutural da parte inferior da aorta. Esta condição é frequentemente assintomática. Quando o aneurisma atinge 5,0 a 5,5 centímetros, a intervenção cirúrgica eletiva é recomendada.",
    diagnosisOverview: "O diagnóstico depende fortemente de imagens de alta resolução. Os médicos descobrem o aneurisma durante ultrassonografia ou tomografia.",
    treatmentOverview: "O manejo divide-se em duas fases: vigilância ativa e reparo eletivo. Procedimentos eletivos são significativamente mais seguros com taxa de sobrevida superior a 98%.",
    prognosis: "Para pacientes que detectam seu AAA precocemente, o prognóstico a longo prazo é excelente.",
    metaTitle: "Aneurisma da aorta abdominal: tratamento e especialistas",
    metaDescription: "Conheça os sintomas, causas, diagnóstico e opções de tratamento do aneurisma da aorta abdominal.",
    whySeeSpecialist: "O manejo proativo é melhor conduzido por um cirurgião vascular especializado ou cardiologista intervencionista.",
    primarySymptoms: ["Dor ou desconforto no peito (angina)", "Fadiga ou fraqueza", "Inchaço nas pernas, tornozelos ou pés", "Dor irradiando para braço, mandíbula, pescoço ou costas"],
    earlyWarningSigns: ["Fadiga incomum durante atividades normais", "Falta de ar com esforço mínimo", "Leve desconforto no peito que resolve rapidamente"],
    preventionStrategies: ["150 minutos de atividade aeróbica moderada por semana", "Manter peso saudável (IMC 18,5-24,9)", "Parar de fumar", "Limitar álcool a 1-2 doses por dia", "Praticar técnicas de redução de estresse", "Exames regulares", "Atenção médica precoce", "Seguir medidas preventivas prescritas"],
    complications: ["Progressão se não tratado", "Desenvolvimento de problemas de saúde relacionados", "Impacto na qualidade de vida", "Possível necessidade de tratamento mais agressivo", "Risco de recorrência sem manejo adequado"],
    faqs: [
      { question: "Um AAA pequeno pode ser tratado sem cirurgia?", answer: "Sim, aneurismas pequenos (menos de 5,0 cm) são frequentemente manejados por 'vigilância ativa' com exames de imagem a cada 6-12 meses." },
      { question: "Em que tamanho a cirurgia é recomendada?", answer: "Quando atinge 5,5 cm para homens ou 5,0 cm para mulheres." },
      { question: "O reparo eletivo é mais seguro que o de emergência?", answer: "Significativamente. O reparo eletivo tem taxa de sobrevida superior a 95-98%." }
    ],
    keywords: ["aneurisma da aorta abdominal", "tratamento AAA", "cardiologista"],
    lifestyleModifications: ["150 minutos de exercício aeróbico moderado por semana", "Manter peso saudável", "Parar de fumar", "Limitar álcool", "Gerenciamento de estresse", "Monitorar pressão em casa", "7-9 horas de sono", "Manter-se socialmente conectado", "Tomar medicamentos regularmente", "Exames cardíacos regulares"],
  },

  // ═══════════════════════════════════════
  // RUSSIAN (ru)
  // ═══════════════════════════════════════
  ru: {
    h1Title: "Аневризма брюшной аорты (ААА): мониторинг и проактивное восстановление",
    heroOverview: "Аневризма брюшной аорты до разрыва — это тихий, но серьёзный сердечно-сосудистый риск, требующий хирургической экспертизы и долгосрочного наблюдения. На aihealz мы связываем вас со специализированными сосудистыми клиниками и сертифицированными кардиологами.",
    definition: "Целая аневризма брюшной аорты — это структурное расширение нижней части аорты. Это состояние часто бессимптомно. Когда аневризма достигает 5,0–5,5 сантиметров, рекомендуется плановое хирургическое вмешательство.",
    diagnosisOverview: "Диагностика ААА в значительной степени зависит от визуализации высокого разрешения. Врачи обычно обнаруживают аневризму при УЗИ или КТ.",
    treatmentOverview: "Управление неразорвавшейся ААА делится на две фазы: активное наблюдение и плановое восстановление. Плановые процедуры значительно безопаснее с выживаемостью более 98%.",
    prognosis: "Для пациентов, которые обнаруживают ААА рано и участвуют в программе наблюдения, долгосрочный прогноз отличный.",
    metaTitle: "Аневризма брюшной аорты: лечение и специалисты",
    metaDescription: "Узнайте о симптомах, причинах, диагностике и вариантах лечения аневризмы брюшной аорты.",
    whySeeSpecialist: "Проактивное управление лучше всего осуществляется специализированным сосудистым хирургом или интервенционным кардиологом.",
    primarySymptoms: ["Боль или дискомфорт в груди (стенокардия)", "Усталость или слабость", "Отёки ног, лодыжек или стоп", "Боль, отдающая в руку, челюсть, шею или спину"],
    earlyWarningSigns: ["Необычная усталость при обычной деятельности", "Одышка при минимальной нагрузке", "Лёгкий дискомфорт в груди, быстро проходящий"],
    preventionStrategies: ["150 минут умеренной аэробной активности в неделю", "Поддержание здорового веса (ИМТ 18,5-24,9)", "Бросить курить", "Ограничить алкоголь до 1-2 порций в день", "Практиковать техники снижения стресса", "Регулярные медосмотры", "Раннее обращение к врачу при симптомах", "Соблюдение предписанных профилактических мер"],
    complications: ["Прогрессирование при отсутствии лечения", "Развитие сопутствующих проблем со здоровьем", "Влияние на качество жизни", "Возможная необходимость более агрессивного лечения", "Риск рецидива без надлежащего управления"],
    faqs: [
      { question: "Можно ли лечить маленькую ААА без операции?", answer: "Да, маленькие аневризмы (менее 5,0 см) часто управляются через «активное наблюдение» с регулярной визуализацией каждые 6-12 месяцев." },
      { question: "При каком размере рекомендуется операция?", answer: "При достижении 5,5 см у мужчин или 5,0 см у женщин." },
      { question: "Курение ускоряет рост аневризмы?", answer: "Да, курение — самый значимый предотвратимый фактор риска." }
    ],
    keywords: ["аневризма брюшной аорты", "лечение ААА", "кардиолог"],
    lifestyleModifications: ["150 минут умеренной аэробной нагрузки в неделю", "Поддержание здорового веса", "Отказ от курения", "Ограничение алкоголя", "Управление стрессом", "Домашний мониторинг давления", "7-9 часов сна", "Социальная активность", "Регулярный приём лекарств", "Регулярные кардиологические осмотры"],
  },

  // ═══════════════════════════════════════
  // MARATHI (mr)
  // ═══════════════════════════════════════
  mr: {
    h1Title: "उदर महाधमनी अॅन्युरिझम (AAA) निरीक्षण आणि सक्रिय दुरुस्ती",
    heroOverview: "फुटण्यापूर्वी उदर महाधमनी अॅन्युरिझम हा एक शांत पण गंभीर हृदय व रक्तवाहिन्यांसंबंधी धोका आहे. aihealz वर, आम्ही तुम्हाला विशेष रक्तवाहिनी क्लिनिक आणि प्रमाणित हृदयरोग तज्ञांशी जोडतो.",
    definition: "अखंड उदर महाधमनी अॅन्युरिझम म्हणजे महाधमनीच्या खालच्या भागाचा संरचनात्मक विस्तार. ही स्थिती बहुतेकदा लक्षणविरहित असते. अॅन्युरिझम 5.0 ते 5.5 सेंटीमीटर पर्यंत पोहोचल्यावर वैकल्पिक शस्त्रक्रियेची शिफारस केली जाते.",
    diagnosisOverview: "AAA निदान उच्च-रिझोल्यूशन इमेजिंगवर अवलंबून असते. डॉक्टर सामान्यत: अल्ट्रासाउंड किंवा CT स्कॅन दरम्यान अॅन्युरिझम शोधतात.",
    treatmentOverview: "न फुटलेल्या AAA व्यवस्थापनात सक्रिय निरीक्षण आणि वैकल्पिक दुरुस्ती या दोन टप्प्यांचा समावेश होतो. वैकल्पिक प्रक्रिया 98% पेक्षा जास्त जगण्याच्या दरासह खूप सुरक्षित आहेत.",
    prognosis: "AAA लवकर शोधणाऱ्या रुग्णांसाठी दीर्घकालीन रोगनिदान उत्कृष्ट आहे.",
    metaTitle: "उदर महाधमनी अॅन्युरिझम उपचार आणि तज्ञ",
    metaDescription: "उदर महाधमनी अॅन्युरिझमची लक्षणे, कारणे, निदान आणि उपचार पर्याय जाणून घ्या.",
    whySeeSpecialist: "महाधमनी अॅन्युरिझमचे सक्रिय व्यवस्थापन विशेष रक्तवाहिनी शल्यचिकित्सक किंवा इंटरव्हेंशनल कार्डिओलॉजिस्ट करू शकतात.",
    primarySymptoms: ["छातीत वेदना किंवा अस्वस्थता", "थकवा किंवा अशक्तपणा", "पाय, घोटे किंवा पायांना सूज", "हात, जबडा, मान किंवा पाठीला पसरणारी वेदना"],
    earlyWarningSigns: ["सामान्य क्रियाकलापांदरम्यान असामान्य थकवा", "कमी श्रमात श्वास लागणे", "लवकर निघून जाणारी सौम्य छातीतील अस्वस्थता"],
    preventionStrategies: ["आठवड्यात 150 मिनिटे मध्यम एरोबिक व्यायाम", "निरोगी वजन राखा", "धूम्रपान सोडा", "मद्यपान मर्यादित करा", "तणाव कमी करण्याच्या तंत्रांचा सराव करा", "नियमित आरोग्य तपासणी", "लक्षणांकडे लवकर वैद्यकीय लक्ष", "निर्धारित प्रतिबंधात्मक उपायांचे पालन करा"],
    complications: ["उपचार न झाल्यास स्थिती बिघडणे", "संबंधित आरोग्य समस्यांचा विकास", "जीवनाच्या गुणवत्तेवर परिणाम", "अधिक आक्रमक उपचारांची संभाव्य गरज", "योग्य व्यवस्थापनाशिवाय पुनरावृत्तीचा धोका"],
    faqs: [
      { question: "लहान AAA शस्त्रक्रियेशिवाय उपचार होऊ शकतो का?", answer: "हो, लहान अॅन्युरिझम (5.0 सेमी पेक्षा कमी) बहुतेकदा 'सक्रिय निरीक्षण' द्वारे व्यवस्थापित केले जातात." },
      { question: "कोणत्या आकारात शस्त्रक्रिया सुचवली जाते?", answer: "पुरुषांसाठी 5.5 सेमी किंवा महिलांसाठी 5.0 सेमी पर्यंत पोहोचल्यावर शस्त्रक्रिया सुचवली जाते." },
      { question: "धूम्रपानामुळे अॅन्युरिझम वेगाने वाढतो का?", answer: "हो, धूम्रपान हा सर्वात महत्त्वाचा टाळता येणारा धोक्याचा घटक आहे." }
    ],
    keywords: ["उदर महाधमनी अॅन्युरिझम", "AAA उपचार", "हृदयरोग तज्ञ"],
    lifestyleModifications: ["आठवड्यात 150 मिनिटे मध्यम व्यायाम", "निरोगी वजन राखणे", "धूम्रपान सोडणे", "मद्यपान मर्यादित करणे", "तणाव व्यवस्थापन", "घरी रक्तदाब मोजणे", "7-9 तास झोप", "सामाजिक संपर्कात राहणे", "नियमित औषधे घेणे", "नियमित हृदय तपासणी"],
  },

  // ═══════════════════════════════════════
  // GUJARATI (gu)
  // ═══════════════════════════════════════
  gu: {
    h1Title: "પેટની મહાધમની એન્યુરિઝમ (AAA) દેખરેખ અને સક્રિય સમારકામ",
    heroOverview: "ફાટવા પહેલાં પેટની મહાધમની એન્યુરિઝમ એક શાંત પરંતુ ગંભીર હૃદય સંબંધી જોખમ છે. aihealz પર, અમે તમને વિશેષ રક્તવાહિની ક્લિનિક્સ અને પ્રમાણિત હૃદય નિષ્ણાતો સાથે જોડીએ છીએ.",
    definition: "અખંડ પેટની મહાધમની એન્યુરિઝમ એ મહાધમનીના નીચેના ભાગનું માળખાકીય વિસ્તરણ છે. આ સ્થિતિ ઘણીવાર લક્ષણ વિનાની હોય છે. જ્યારે એન્યુરિઝમ 5.0 થી 5.5 સે.મી. સુધી પહોંચે છે, ત્યારે વૈકલ્પિક શસ્ત્રક્રિયાની ભલામણ કરવામાં આવે છે.",
    diagnosisOverview: "AAA નિદાન ઉચ્ચ-રિઝોલ્યુશન ઇમેજિંગ પર ઘણો આધાર રાખે છે. ડૉક્ટરો સામાન્ય રીતે અલ્ટ્રાસાઉન્ડ અથવા CT સ્કેન દરમિયાન એન્યુરિઝમ શોધે છે.",
    treatmentOverview: "ન ફાટેલા AAA વ્યવસ્થાપનમાં સક્રિય દેખરેખ અને વૈકલ્પિક સમારકામ બે તબક્કાનો સમાવેશ થાય છે. વૈકલ્પિક પ્રક્રિયાઓ 98% થી વધુ જીવન ટકાવારી સાથે ખૂબ સલામત છે.",
    prognosis: "AAA વહેલી તકે શોધનારા દર્દીઓ માટે લાંબા ગાળાનું પૂર્વાનુમાન ઉત્તમ છે.",
    metaTitle: "પેટની મહાધમની એન્યુરિઝમ સારવાર અને નિષ્ણાતો",
    metaDescription: "પેટની મહાધમની એન્યુરિઝમના લક્ષણો, કારણો, નિદાન અને સારવાર વિકલ્પો વિશે જાણો.",
    whySeeSpecialist: "મહાધમની એન્યુરિઝમનું સક્રિય વ્યવસ્થાપન વિશેષ રક્તવાહિની સર્જન અથવા ઇન્ટરવેન્શનલ કાર્ડિયોલોજિસ્ટ દ્વારા શ્રેષ્ઠ રીતે થાય છે.",
    primarySymptoms: ["છાતીમાં દુખાવો અથવા અસ્વસ્થતા", "થાક અથવા નબળાઈ", "પગ, ઘૂંટણ અથવા પગમાં સોજો", "હાથ, જડબા, ગરદન અથવા પીઠમાં ફેલાતો દુખાવો"],
    earlyWarningSigns: ["સામાન્ય પ્રવૃત્તિઓ દરમિયાન અસામાન્ય થાક", "ઓછા પ્રયાસમાં શ્વાસ લેવામાં તકલીફ", "ઝડપથી ઠીક થતી હળવી છાતીની અસ્વસ્થતા"],
    preventionStrategies: ["અઠવાડિયામાં 150 મિનિટ મધ્યમ એરોબિક કસરત", "તંદુરસ્ત વજન જાળવો", "ધૂમ્રપાન છોડો", "દારૂ મર્યાદિત કરો", "તણાવ ઘટાડવાની ટેકનિકો", "નિયમિત આરોગ્ય તપાસ", "લક્ષણો પર વહેલું ધ્યાન", "નિર્ધારિત નિવારક પગલાં અનુસરો"],
    complications: ["સારવાર ન થાય તો સ્થિતિ વધવી", "સંબંધિત આરોગ્ય સમસ્યાઓનો વિકાસ", "જીવનની ગુણવત્તા પર અસર", "વધુ આક્રમક સારવારની જરૂર", "યોગ્ય વ્યવસ્થાપન વિના પુનરાવર્તનનું જોખમ"],
    faqs: [
      { question: "નાના AAA ની શસ્ત્રક્રિયા વિના સારવાર થઈ શકે?", answer: "હા, નાના એન્યુરિઝમ (5.0 સે.મી. થી ઓછા) 'સક્રિય દેખરેખ' દ્વારા સંચાલિત થાય છે." },
      { question: "ક્યા કદમાં શસ્ત્રક્રિયાની ભલામણ કરાય છે?", answer: "પુરુષો માટે 5.5 સે.મી. અથવા સ્ત્રીઓ માટે 5.0 સે.મી." }
    ],
    keywords: ["પેટની મહાધમની એન્યુરિઝમ", "AAA સારવાર", "હૃદય નિષ્ણાત"],
    lifestyleModifications: ["અઠવાડિયામાં 150 મિનિટ મધ્યમ કસરત", "તંદુરસ્ત વજન જાળવવું", "ધૂમ્રપાન છોડવું", "દારૂ મર્યાદિત", "તણાવ વ્યવસ્થાપન", "ઘરે બ્લડ પ્રેશર મોનિટરિંગ", "7-9 કલાક ઊંઘ", "સામાજિક રીતે જોડાયેલા રહો", "નિયમિત દવાઓ લો", "નિયમિત હૃદય તપાસ"],
  },

  // Remaining languages with shorter but accurate translations
  kn: {
    h1Title: "ಉದರ ಮಹಾಪಧಮನಿ ಅನ್ಯೂರಿಸಂ (AAA) ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಸಕ್ರಿಯ ದುರಸ್ತಿ",
    heroOverview: "ಒಡೆಯುವ ಮೊದಲು ಉದರ ಮಹಾಪಧಮನಿ ಅನ್ಯೂರಿಸಂ ಒಂದು ಮೌನ ಆದರೆ ಗಮನಾರ್ಹ ಹೃದಯರಕ್ತನಾಳ ಅಪಾಯವಾಗಿದೆ. aihealz ನಲ್ಲಿ, ವಿಶೇಷ ರಕ್ತನಾಳ ಚಿಕಿತ್ಸಾಲಯಗಳು ಮತ್ತು ಪ್ರಮಾಣಿತ ಹೃದಯ ತಜ್ಞರೊಂದಿಗೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.",
    definition: "ಅಖಂಡ ಉದರ ಮಹಾಪಧಮನಿ ಅನ್ಯೂರಿಸಂ ಮಹಾಪಧಮನಿಯ ಕೆಳಭಾಗದ ರಚನಾತ್ಮಕ ವಿಸ್ತರಣೆಯಾಗಿದೆ. ಅನ್ಯೂರಿಸಂ 5.0 ರಿಂದ 5.5 ಸೆಂ.ಮೀ. ತಲುಪಿದಾಗ, ಐಚ್ಛಿಕ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಶಿಫಾರಸು ಮಾಡಲಾಗುತ್ತದೆ.",
    diagnosisOverview: "AAA ರೋಗನಿರ್ಣಯ ಉನ್ನತ-ರೆಸಲ್ಯೂಶನ್ ಇಮೇಜಿಂಗ್ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ.",
    treatmentOverview: "ಒಡೆಯದ AAA ನಿರ್ವಹಣೆ ಸಕ್ರಿಯ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಐಚ್ಛಿಕ ದುರಸ್ತಿ ಎಂಬ ಎರಡು ಹಂತಗಳಲ್ಲಿ ವಿಂಗಡಿಸಲಾಗಿದೆ.",
    prognosis: "AAA ಅನ್ನು ಮುಂಚಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚುವ ರೋಗಿಗಳಿಗೆ ದೀರ್ಘಕಾಲೀನ ಮುನ್ಸೂಚನೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.",
    metaTitle: "ಉದರ ಮಹಾಪಧಮನಿ ಅನ್ಯೂರಿಸಂ ಚಿಕಿತ್ಸೆ",
    metaDescription: "ಉದರ ಮಹಾಪಧಮನಿ ಅನ್ಯೂರಿಸಂ ಲಕ್ಷಣಗಳು, ಕಾರಣಗಳು ಮತ್ತು ಚಿಕಿತ್ಸೆ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ.",
    whySeeSpecialist: "ಮಹಾಪಧಮನಿ ಅನ್ಯೂರಿಸಂನ ಸಕ್ರಿಯ ನಿರ್ವಹಣೆ ವಿಶೇಷ ರಕ್ತನಾಳ ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರಿಂದ ಉತ್ತಮವಾಗಿ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ.",
    primarySymptoms: ["ಎದೆ ನೋವು (ಆಂಜೈನಾ)", "ಆಯಾಸ ಅಥವಾ ದೌರ್ಬಲ್ಯ", "ಕಾಲುಗಳಲ್ಲಿ ಊತ", "ತೋಳು, ದವಡೆ, ಕುತ್ತಿಗೆಗೆ ಹರಡುವ ನೋವು"],
    earlyWarningSigns: ["ಅಸಾಮಾನ್ಯ ಆಯಾಸ", "ಕನಿಷ್ಠ ಶ್ರಮದಲ್ಲಿ ಉಸಿರಾಟದ ತೊಂದರೆ", "ಬೇಗ ಕಡಿಮೆಯಾಗುವ ಎದೆ ಅಸ್ವಸ್ಥತೆ"],
    preventionStrategies: ["ವಾರಕ್ಕೆ 150 ನಿಮಿಷ ಮಧ್ಯಮ ಏರೋಬಿಕ್ ವ್ಯಾಯಾಮ", "ಆರೋಗ್ಯಕರ ತೂಕ ಕಾಪಾಡಿ", "ಧೂಮಪಾನ ನಿಲ್ಲಿಸಿ", "ಮದ್ಯ ಮಿತಿಗೊಳಿಸಿ", "ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡುವ ತಂತ್ರಗಳು", "ನಿಯಮಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆ", "ರೋಗಲಕ್ಷಣಗಳಿಗೆ ಆರಂಭಿಕ ಗಮನ", "ನಿಗದಿತ ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳನ್ನು ಅನುಸರಿಸಿ"],
    complications: ["ಚಿಕಿತ್ಸೆ ಇಲ್ಲದಿದ್ದರೆ ಪ್ರಗತಿ", "ಸಂಬಂಧಿತ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳ ಅಭಿವೃದ್ಧಿ", "ಜೀವನ ಗುಣಮಟ್ಟದ ಮೇಲೆ ಪರಿಣಾಮ", "ಹೆಚ್ಚು ಆಕ್ರಮಣಕಾರಿ ಚಿಕಿತ್ಸೆಯ ಅಗತ್ಯ", "ಸರಿಯಾದ ನಿರ್ವಹಣೆ ಇಲ್ಲದೆ ಪುನರಾವರ್ತನೆ ಅಪಾಯ"],
    faqs: [
      { question: "ಸಣ್ಣ AAA ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಇಲ್ಲದೆ ಚಿಕಿತ್ಸೆ ನೀಡಬಹುದೇ?", answer: "ಹೌದು, ಸಣ್ಣ ಅನ್ಯೂರಿಸಂಗಳನ್ನು 'ಸಕ್ರಿಯ ಮೇಲ್ವಿಚಾರಣೆ' ಮೂಲಕ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ." },
      { question: "ಯಾವ ಗಾತ್ರದಲ್ಲಿ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಶಿಫಾರಸು?", answer: "ಪುರುಷರಿಗೆ 5.5 ಸೆಂ.ಮೀ. ಅಥವಾ ಮಹಿಳೆಯರಿಗೆ 5.0 ಸೆಂ.ಮೀ." }
    ],
    keywords: ["ಉದರ ಮಹಾಪಧಮನಿ ಅನ್ಯೂರಿಸಂ", "AAA ಚಿಕಿತ್ಸೆ", "ಹೃದಯ ತಜ್ಞ"],
    lifestyleModifications: ["ವಾರಕ್ಕೆ 150 ನಿಮಿಷ ವ್ಯಾಯಾಮ", "ಆರೋಗ್ಯಕರ ತೂಕ", "ಧೂಮಪಾನ ನಿಲ್ಲಿಸುವುದು", "ಮದ್ಯ ಮಿತಿ", "ಒತ್ತಡ ನಿರ್ವಹಣೆ", "ಮನೆಯಲ್ಲಿ ರಕ್ತದೊತ್ತಡ ಪರಿಶೀಲನೆ", "7-9 ಗಂಟೆ ನಿದ್ರೆ", "ಸಾಮಾಜಿಕ ಸಂಪರ್ಕ", "ನಿಯಮಿತ ಔಷಧಿ", "ನಿಯಮಿತ ಹೃದಯ ತಪಾಸಣೆ"],
  },

  ml: {
    h1Title: "ഉദര മഹാധമനി അനൂറിസം (AAA) നിരീക്ഷണവും സജീവ അറ്റകുറ്റപ്പണിയും",
    heroOverview: "പൊട്ടുന്നതിന് മുമ്പ് ഉദര മഹാധമനി അനൂറിസം നിശ്ശബ്ദമായ എന്നാൽ ഗുരുതരമായ ഹൃദയ സംബന്ധമായ അപകടമാണ്. aihealz-ൽ, പ്രത്യേക രക്തക്കുഴൽ ക്ലിനിക്കുകളുമായും സർട്ടിഫൈഡ് ഹൃദ്രോഗ വിദഗ്ധരുമായും ബന്ധിപ്പിക്കുന്നു.",
    definition: "കേടുവരാത്ത ഉദര മഹാധമനി അനൂറിസം മഹാധമനിയുടെ താഴ്ഭാഗത്തെ ഘടനാപരമായ വികാസമാണ്. അനൂറിസം 5.0 മുതൽ 5.5 സെ.മീ. എത്തുമ്പോൾ ശസ്ത്രക്രിയ ശുപാർശ ചെയ്യപ്പെടുന്നു.",
    diagnosisOverview: "AAA രോഗനിർണയം ഉയർന്ന റെസല്യൂഷൻ ഇമേജിംഗിനെ ആശ്രയിക്കുന്നു.",
    treatmentOverview: "പൊട്ടാത്ത AAA മാനേജ്മെന്റ് സജീവ നിരീക്ഷണം, ഇലക്ടീവ് അറ്റകുറ്റപ്പണി എന്നിങ്ങനെ രണ്ട് ഘട്ടങ്ങളായി തിരിച്ചിരിക്കുന്നു.",
    prognosis: "AAA നേരത്തെ കണ്ടെത്തുന്ന രോഗികൾക്ക് ദീർഘകാല പ്രവചനം മികച്ചതാണ്.",
    metaTitle: "ഉദര മഹാധമനി അനൂറിസം ചികിത്സ",
    metaDescription: "ഉദര മഹാധമനി അനൂറിസത്തിന്റെ ലക്ഷണങ്ങൾ, കാരണങ്ങൾ, ചികിത്സ എന്നിവ അറിയുക.",
    whySeeSpecialist: "മഹാധമനി അനൂറിസത്തിന്റെ സജീവ മാനേജ്മെന്റ് പ്രത്യേക രക്തക്കുഴൽ ശസ്ത്രക്രിയാ വിദഗ്ധനാൽ ഏറ്റവും നന്നായി ചെയ്യപ്പെടുന്നു.",
    primarySymptoms: ["നെഞ്ചുവേദന (ആൻജൈന)", "ക്ഷീണം അല്ലെങ്കിൽ ബലഹീനത", "കാലുകളിൽ നീർക്കെട്ട്", "കൈ, താടിയെല്ല്, കഴുത്ത്, മുതുകിലേക്ക് പരക്കുന്ന വേദന"],
    earlyWarningSigns: ["അസാധാരണ ക്ഷീണം", "ചെറിയ പരിശ്രമത്തിൽ ശ്വാസംമുട്ടൽ", "വേഗം മാറുന്ന ലഘു നെഞ്ച് അസ്വസ്ഥത"],
    preventionStrategies: ["ആഴ്ചയിൽ 150 മിനിറ്റ് മിതമായ വ്യായാമം", "ആരോഗ്യകരമായ ഭാരം നിലനിർത്തുക", "പുകവലി ഉപേക്ഷിക്കുക", "മദ്യം പരിമിതപ്പെടുത്തുക", "സമ്മർദ്ദം കുറയ്ക്കൽ", "പതിവ് ആരോഗ്യ പരിശോധന", "ലക്ഷണങ്ങൾക്ക് നേരത്തെ ശ്രദ്ധ", "നിർദ്ദേശിച്ച പ്രതിരോധ നടപടികൾ പാലിക്കുക"],
    complications: ["ചികിത്സയില്ലെങ്കിൽ പുരോഗതി", "ബന്ധപ്പെട്ട ആരോഗ്യ പ്രശ്നങ്ങൾ", "ജീവിത ഗുണനിലവാരത്തിൽ ആഘാതം", "കൂടുതൽ ആക്രമണാത്മക ചികിത്സ ആവശ്യം", "ശരിയായ മാനേജ്മെന്റ് ഇല്ലാതെ ആവർത്തന അപകടം"],
    faqs: [
      { question: "ചെറിയ AAA ശസ്ത്രക്രിയ ഇല്ലാതെ ചികിത്സിക്കാമോ?", answer: "അതെ, ചെറിയ അനൂറിസങ്ങൾ 'സജീവ നിരീക്ഷണ'ത്തിലൂടെ കൈകാര്യം ചെയ്യപ്പെടുന്നു." }
    ],
    keywords: ["ഉദര മഹാധമനി അനൂറിസം", "AAA ചികിത്സ", "ഹൃദ്രോഗ വിദഗ്ധൻ"],
    lifestyleModifications: ["ആഴ്ചയിൽ 150 മിനിറ്റ് വ്യായാമം", "ആരോഗ്യകരമായ ഭാരം", "പുകവലി ഉപേക്ഷിക്കൽ", "മദ്യം പരിമിതപ്പെടുത്തൽ", "സമ്മർദ്ദ നിയന്ത്രണം", "വീട്ടിൽ രക്തസമ്മർദ്ദ നിരീക്ഷണം", "7-9 മണിക്കൂർ ഉറക്കം", "സാമൂഹിക ബന്ധം", "മരുന്നുകൾ കൃത്യമായി", "പതിവ് ഹൃദയ പരിശോധന"],
  },

  pa: {
    h1Title: "ਪੇਟ ਦੀ ਮਹਾਧਮਨੀ ਐਨਿਉਰਿਜ਼ਮ (AAA) ਨਿਗਰਾਨੀ ਅਤੇ ਸਰਗਰਮ ਮੁਰੰਮਤ",
    heroOverview: "ਫਟਣ ਤੋਂ ਪਹਿਲਾਂ ਪੇਟ ਦੀ ਮਹਾਧਮਨੀ ਐਨਿਉਰਿਜ਼ਮ ਇੱਕ ਚੁੱਪ ਪਰ ਗੰਭੀਰ ਦਿਲ ਸੰਬੰਧੀ ਖ਼ਤਰਾ ਹੈ। aihealz 'ਤੇ, ਅਸੀਂ ਤੁਹਾਨੂੰ ਮਾਹਿਰ ਨਾੜੀ ਕਲੀਨਿਕਾਂ ਅਤੇ ਪ੍ਰਮਾਣਿਤ ਦਿਲ ਦੇ ਮਾਹਿਰਾਂ ਨਾਲ ਜੋੜਦੇ ਹਾਂ।",
    definition: "ਅਖੰਡ ਪੇਟ ਦੀ ਮਹਾਧਮਨੀ ਐਨਿਉਰਿਜ਼ਮ ਮਹਾਧਮਨੀ ਦੇ ਹੇਠਲੇ ਹਿੱਸੇ ਦਾ ਢਾਂਚਾਗਤ ਵਿਸਤਾਰ ਹੈ। ਐਨਿਉਰਿਜ਼ਮ 5.0 ਤੋਂ 5.5 ਸੈ.ਮੀ. ਤੱਕ ਪਹੁੰਚਣ 'ਤੇ ਚੋਣਵੀਂ ਸਰਜਰੀ ਦੀ ਸਿਫ਼ਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
    diagnosisOverview: "AAA ਦਾ ਨਿਦਾਨ ਉੱਚ-ਰੈਜ਼ੋਲਿਊਸ਼ਨ ਇਮੇਜਿੰਗ 'ਤੇ ਨਿਰਭਰ ਕਰਦਾ ਹੈ।",
    treatmentOverview: "ਨਾ ਫਟੇ AAA ਦਾ ਪ੍ਰਬੰਧਨ ਸਰਗਰਮ ਨਿਗਰਾਨੀ ਅਤੇ ਚੋਣਵੀਂ ਮੁਰੰਮਤ ਵਿੱਚ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ।",
    prognosis: "AAA ਨੂੰ ਜਲਦੀ ਲੱਭਣ ਵਾਲੇ ਮਰੀਜ਼ਾਂ ਲਈ ਲੰਬੇ ਸਮੇਂ ਦਾ ਅੰਦਾਜ਼ਾ ਬਹੁਤ ਵਧੀਆ ਹੈ।",
    metaTitle: "ਪੇਟ ਦੀ ਮਹਾਧਮਨੀ ਐਨਿਉਰਿਜ਼ਮ ਇਲਾਜ",
    metaDescription: "ਪੇਟ ਦੀ ਮਹਾਧਮਨੀ ਐਨਿਉਰਿਜ਼ਮ ਦੇ ਲੱਛਣ, ਕਾਰਨ ਅਤੇ ਇਲਾਜ ਬਾਰੇ ਜਾਣੋ।",
    whySeeSpecialist: "ਮਹਾਧਮਨੀ ਐਨਿਉਰਿਜ਼ਮ ਦਾ ਸਰਗਰਮ ਪ੍ਰਬੰਧਨ ਮਾਹਿਰ ਨਾੜੀ ਸਰਜਨ ਦੁਆਰਾ ਸਭ ਤੋਂ ਵਧੀਆ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    primarySymptoms: ["ਛਾਤੀ ਵਿੱਚ ਦਰਦ (ਐਂਜਾਈਨਾ)", "ਥਕਾਵਟ ਜਾਂ ਕਮਜ਼ੋਰੀ", "ਲੱਤਾਂ ਵਿੱਚ ਸੋਜ", "ਬਾਂਹ, ਜਬਾੜੇ, ਗਰਦਨ ਵਿੱਚ ਦਰਦ"],
    earlyWarningSigns: ["ਅਸਧਾਰਨ ਥਕਾਵਟ", "ਥੋੜੀ ਮਿਹਨਤ 'ਤੇ ਸਾਹ ਚੜ੍ਹਨਾ", "ਹਲਕੀ ਛਾਤੀ ਦੀ ਬੇਅਰਾਮੀ"],
    preventionStrategies: ["ਹਫ਼ਤੇ ਵਿੱਚ 150 ਮਿੰਟ ਕਸਰਤ", "ਸਿਹਤਮੰਦ ਭਾਰ ਰੱਖੋ", "ਸਿਗਰਟ ਛੱਡੋ", "ਸ਼ਰਾਬ ਘੱਟ ਕਰੋ", "ਤਣਾਅ ਘਟਾਉਣ ਦੇ ਤਰੀਕੇ", "ਨਿਯਮਿਤ ਸਿਹਤ ਜਾਂਚ", "ਲੱਛਣਾਂ 'ਤੇ ਜਲਦੀ ਧਿਆਨ", "ਨਿਰਧਾਰਿਤ ਰੋਕਥਾਮ ਉਪਾਅ"],
    complications: ["ਇਲਾਜ ਨਾ ਹੋਣ 'ਤੇ ਹਾਲਤ ਵਿਗੜਨਾ", "ਸੰਬੰਧਿਤ ਸਿਹਤ ਸਮੱਸਿਆਵਾਂ", "ਜੀਵਨ ਦੀ ਗੁਣਵੱਤਾ 'ਤੇ ਅਸਰ", "ਵਧੇਰੇ ਤੀਬਰ ਇਲਾਜ ਦੀ ਲੋੜ", "ਸਹੀ ਪ੍ਰਬੰਧਨ ਤੋਂ ਬਿਨਾਂ ਦੁਬਾਰਾ ਹੋਣ ਦਾ ਖ਼ਤਰਾ"],
    faqs: [
      { question: "ਛੋਟੇ AAA ਦਾ ਸਰਜਰੀ ਤੋਂ ਬਿਨਾਂ ਇਲਾਜ ਹੋ ਸਕਦਾ ਹੈ?", answer: "ਹਾਂ, ਛੋਟੇ ਐਨਿਉਰਿਜ਼ਮ 'ਸਰਗਰਮ ਨਿਗਰਾਨੀ' ਨਾਲ ਸੰਭਾਲੇ ਜਾਂਦੇ ਹਨ।" }
    ],
    keywords: ["ਪੇਟ ਦੀ ਮਹਾਧਮਨੀ ਐਨਿਉਰਿਜ਼ਮ", "AAA ਇਲਾਜ", "ਦਿਲ ਦਾ ਮਾਹਿਰ"],
    lifestyleModifications: ["ਹਫ਼ਤੇ ਵਿੱਚ 150 ਮਿੰਟ ਕਸਰਤ", "ਸਿਹਤਮੰਦ ਭਾਰ", "ਸਿਗਰਟ ਛੱਡਣਾ", "ਸ਼ਰਾਬ ਘੱਟ ਕਰਨਾ", "ਤਣਾਅ ਪ੍ਰਬੰਧਨ", "ਘਰ ਵਿੱਚ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਚੈੱਕ", "7-9 ਘੰਟੇ ਨੀਂਦ", "ਸਮਾਜਿਕ ਸੰਪਰਕ", "ਨਿਯਮਿਤ ਦਵਾਈਆਂ", "ਨਿਯਮਿਤ ਦਿਲ ਦੀ ਜਾਂਚ"],
  },
};

async function main() {
  console.log('\n🗑️  Deleting untranslated rows...');
  const deleted = await prisma.conditionPageContent.deleteMany({
    where: { id: { in: BAD_IDS } }
  });
  console.log(`   Deleted ${deleted.count} rows\n`);

  let created = 0;
  let skipped = 0;

  for (const [lang, content] of Object.entries(translations)) {
    // Check if already exists (from hi, ta, te, es which had status 'review')
    const existing = await prisma.conditionPageContent.findFirst({
      where: { conditionId: CONDITION_ID, languageCode: lang }
    });

    if (existing) {
      // Update existing row with proper translations
      await prisma.conditionPageContent.update({
        where: { id: existing.id },
        data: {
          h1Title: content.h1Title,
          heroOverview: content.heroOverview,
          definition: content.definition,
          diagnosisOverview: content.diagnosisOverview,
          treatmentOverview: content.treatmentOverview,
          prognosis: content.prognosis,
          metaTitle: content.metaTitle,
          metaDescription: content.metaDescription,
          whySeeSpecialist: content.whySeeSpecialist,
          primarySymptoms: content.primarySymptoms,
          earlyWarningSigns: content.earlyWarningSigns,
          preventionStrategies: content.preventionStrategies,
          complications: content.complications,
          faqs: content.faqs,
          keywords: content.keywords,
          lifestyleModifications: content.lifestyleModifications,
          status: 'published',
        }
      });
      console.log(`  ✏️  Updated ${lang} (existing row #${existing.id})`);
      created++;
      continue;
    }

    // Create new row
    await prisma.conditionPageContent.create({
      data: {
        conditionId: CONDITION_ID,
        languageCode: lang,
        h1Title: content.h1Title,
        heroOverview: content.heroOverview,
        definition: content.definition,
        diagnosisOverview: content.diagnosisOverview,
        treatmentOverview: content.treatmentOverview,
        prognosis: content.prognosis,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        whySeeSpecialist: content.whySeeSpecialist,
        primarySymptoms: content.primarySymptoms,
        earlyWarningSigns: content.earlyWarningSigns,
        preventionStrategies: content.preventionStrategies,
        complications: content.complications,
        faqs: content.faqs,
        keywords: content.keywords,
        lifestyleModifications: content.lifestyleModifications,
        ...SHARED,
        status: 'published',
      }
    });
    console.log(`  ✅ Created ${lang}`);
    created++;
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📊 DONE: ${created} languages created/updated, ${skipped} skipped`);
  console.log(`${'═'.repeat(50)}\n`);
}

main()
  .catch(e => console.error('Fatal:', e))
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
