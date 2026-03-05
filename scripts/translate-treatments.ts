/**
 * Treatment Translation Script
 *
 * Translates treatment data (descriptions, indications, side effects)
 * and generates per-language JSON files.
 *
 * Usage:
 *   npx tsx scripts/translate-treatments.ts --lang=hi
 *   npx tsx scripts/translate-treatments.ts --all
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// TREATMENT-SPECIFIC VOCABULARY DICTIONARIES
// ============================================================================

interface LanguageDictionary {
    // Medical terms
    terms: Record<string, string>;
    // Body parts
    bodyParts: Record<string, string>;
    // Treatment types
    treatmentTypes: Record<string, string>;
    // Side effects
    sideEffects: Record<string, string>;
    // Actions/Verbs
    actions: Record<string, string>;
    // Adjectives
    adjectives: Record<string, string>;
    // Connectors
    connectors: Record<string, string>;
    // Common phrases
    phrases: Record<string, string>;
}

const DICTIONARIES: Record<string, LanguageDictionary> = {
    hi: {
        terms: {
            // Treatment names
            'physical therapy': 'फिजियोथेरेपी',
            'physiotherapy': 'फिजियोथेरेपी',
            'chemotherapy': 'कीमोथेरेपी',
            'radiation therapy': 'विकिरण चिकित्सा',
            'immunotherapy': 'इम्यूनोथेरेपी',
            'hormone therapy': 'हार्मोन थेरेपी',
            'gene therapy': 'जीन थेरेपी',
            'stem cell therapy': 'स्टेम सेल थेरेपी',
            'dialysis': 'डायलिसिस',
            'transplant': 'प्रत्यारोपण',
            'organ transplant': 'अंग प्रत्यारोपण',
            'surgery': 'सर्जरी',
            'operation': 'ऑपरेशन',
            'procedure': 'प्रक्रिया',
            'injection': 'इंजेक्शन',
            'infusion': 'आसव',
            'therapy': 'चिकित्सा',
            'treatment': 'उपचार',
            'medication': 'दवा',
            'medicine': 'दवाई',
            'drug': 'औषधि',
            'tablet': 'गोली',
            'capsule': 'कैप्सूल',
            'syrup': 'सिरप',
            'ointment': 'मरहम',
            'cream': 'क्रीम',
            'drops': 'बूंदें',
            'inhaler': 'इनहेलर',
            // Drug classes
            'nsaids': 'एनएसएआईडी',
            'antibiotics': 'एंटीबायोटिक्स',
            'antibiotic': 'एंटीबायोटिक',
            'antiviral': 'एंटीवायरल',
            'antifungal': 'एंटीफंगल',
            'antihistamine': 'एंटीहिस्टामाइन',
            'antidepressant': 'एंटीडिप्रेसेंट',
            'antipsychotic': 'एंटीसाइकोटिक',
            'anticonvulsant': 'एंटीकॉन्वल्सेंट',
            'anticoagulant': 'एंटीकोआगुलेंट',
            'blood thinner': 'रक्त पतला करने वाली दवा',
            'beta blocker': 'बीटा ब्लॉकर',
            'ace inhibitor': 'एसीई इनहिबिटर',
            'calcium channel blocker': 'कैल्शियम चैनल ब्लॉकर',
            'diuretic': 'मूत्रवर्धक',
            'statin': 'स्टैटिन',
            'steroid': 'स्टेरॉयड',
            'corticosteroid': 'कॉर्टिकोस्टेरॉयड',
            'painkiller': 'दर्द निवारक',
            'pain reliever': 'दर्द निवारक',
            'analgesic': 'दर्दनाशक',
            'sedative': 'शामक',
            'muscle relaxant': 'मांसपेशी शिथिलक',
            'insulin': 'इंसुलिन',
            'vaccine': 'टीका',
            'immunization': 'टीकाकरण',
            // Procedures
            'angioplasty': 'एंजियोप्लास्टी',
            'bypass surgery': 'बाईपास सर्जरी',
            'coronary bypass': 'कोरोनरी बाईपास',
            'stent placement': 'स्टेंट प्लेसमेंट',
            'pacemaker': 'पेसमेकर',
            'catheterization': 'कैथेटेराइजेशन',
            'endoscopy': 'एंडोस्कोपी',
            'colonoscopy': 'कोलोनोस्कोपी',
            'laparoscopy': 'लैप्रोस्कोपी',
            'arthroscopy': 'आर्थ्रोस्कोपी',
            'biopsy': 'बायोप्सी',
            'excision': 'उच्छेदन',
            'resection': 'उच्छेदन',
            'amputation': 'अंगच्छेदन',
            'joint replacement': 'जोड़ प्रतिस्थापन',
            'hip replacement': 'कूल्हा प्रतिस्थापन',
            'knee replacement': 'घुटना प्रतिस्थापन',
            'cataract surgery': 'मोतियाबिंद सर्जरी',
            'lasik': 'लेसिक',
            // Therapies
            'occupational therapy': 'व्यावसायिक चिकित्सा',
            'speech therapy': 'वाक् चिकित्सा',
            'cognitive therapy': 'संज्ञानात्मक चिकित्सा',
            'behavioral therapy': 'व्यवहार चिकित्सा',
            'psychotherapy': 'मनोचिकित्सा',
            'rehabilitation': 'पुनर्वास',
            'massage therapy': 'मालिश चिकित्सा',
            'acupuncture': 'एक्यूपंक्चर',
            'chiropractic': 'कायरोप्रैक्टिक',
            // Medical conditions
            'diabetes': 'मधुमेह',
            'hypertension': 'उच्च रक्तचाप',
            'high blood pressure': 'उच्च रक्तचाप',
            'heart disease': 'हृदय रोग',
            'heart failure': 'हृदय विफलता',
            'heart attack': 'दिल का दौरा',
            'stroke': 'स्ट्रोक',
            'cancer': 'कैंसर',
            'tumor': 'ट्यूमर',
            'infection': 'संक्रमण',
            'inflammation': 'सूजन',
            'arthritis': 'गठिया',
            'osteoarthritis': 'अस्थिसंधिशोथ',
            'rheumatoid arthritis': 'संधिशोथ',
            'asthma': 'दमा',
            'copd': 'सीओपीडी',
            'pneumonia': 'निमोनिया',
            'bronchitis': 'ब्रोंकाइटिस',
            'allergy': 'एलर्जी',
            'allergic reaction': 'एलर्जी प्रतिक्रिया',
            'anaphylaxis': 'तीव्रग्राहिता',
            'depression': 'अवसाद',
            'anxiety': 'चिंता',
            'insomnia': 'अनिद्रा',
            'migraine': 'माइग्रेन',
            'epilepsy': 'मिर्गी',
            'seizure': 'दौरा',
            'paralysis': 'लकवा',
            // General medical
            'patient': 'मरीज',
            'doctor': 'डॉक्टर',
            'physician': 'चिकित्सक',
            'specialist': 'विशेषज्ञ',
            'surgeon': 'सर्जन',
            'nurse': 'नर्स',
            'hospital': 'अस्पताल',
            'clinic': 'क्लिनिक',
            'healthcare': 'स्वास्थ्य सेवा',
            'medical': 'चिकित्सा',
            'clinical': 'नैदानिक',
            'diagnosis': 'निदान',
            'prognosis': 'पूर्वानुमान',
            'symptoms': 'लक्षण',
            'symptom': 'लक्षण',
            'condition': 'स्थिति',
            'disease': 'रोग',
            'disorder': 'विकार',
            'syndrome': 'सिंड्रोम',
            'chronic': 'पुराना',
            'acute': 'तीव्र',
            'severe': 'गंभीर',
            'mild': 'हल्का',
            'moderate': 'मध्यम',
            'recovery': 'स्वस्थ होना',
            'healing': 'उपचार',
            'remission': 'छूट',
            'relapse': 'पुनरावृत्ति',
        },
        bodyParts: {
            'heart': 'हृदय',
            'brain': 'मस्तिष्क',
            'lung': 'फेफड़ा',
            'lungs': 'फेफड़े',
            'liver': 'जिगर',
            'kidney': 'गुर्दा',
            'kidneys': 'गुर्दे',
            'stomach': 'पेट',
            'intestine': 'आंत',
            'intestines': 'आंतें',
            'colon': 'बृहदान्त्र',
            'pancreas': 'अग्न्याशय',
            'spleen': 'प्लीहा',
            'bladder': 'मूत्राशय',
            'bone': 'हड्डी',
            'bones': 'हड्डियां',
            'joint': 'जोड़',
            'joints': 'जोड़ों',
            'muscle': 'मांसपेशी',
            'muscles': 'मांसपेशियां',
            'nerve': 'नस',
            'nerves': 'नसें',
            'blood': 'रक्त',
            'blood vessel': 'रक्त वाहिका',
            'artery': 'धमनी',
            'vein': 'नस',
            'skin': 'त्वचा',
            'eye': 'आंख',
            'eyes': 'आंखें',
            'ear': 'कान',
            'nose': 'नाक',
            'throat': 'गला',
            'chest': 'छाती',
            'back': 'पीठ',
            'spine': 'रीढ़',
            'neck': 'गर्दन',
            'shoulder': 'कंधा',
            'arm': 'बांह',
            'hand': 'हाथ',
            'leg': 'पैर',
            'knee': 'घुटना',
            'hip': 'कूल्हा',
            'foot': 'पैर',
            'head': 'सिर',
        },
        treatmentTypes: {
            'medical': 'चिकित्सा प्रबंधन',
            'surgical': 'शल्य चिकित्सा',
            'drug': 'प्रिस्क्रिप्शन दवा',
            'injection': 'इंजेक्शन उपचार',
            'prescription': 'प्रिस्क्रिप्शन दवाई',
            'otc': 'ओवर-द-काउंटर',
            'over-the-counter': 'ओवर-द-काउंटर',
            'home remedy': 'घरेलू उपचार',
            'home_remedy': 'घरेलू उपचार',
            'therapy': 'चिकित्सा / पुनर्वास',
        },
        sideEffects: {
            'nausea': 'मतली',
            'vomiting': 'उल्टी',
            'diarrhea': 'दस्त',
            'constipation': 'कब्ज',
            'headache': 'सिरदर्द',
            'dizziness': 'चक्कर',
            'drowsiness': 'उनींदापन',
            'fatigue': 'थकान',
            'weakness': 'कमजोरी',
            'insomnia': 'अनिद्रा',
            'rash': 'दाने',
            'itching': 'खुजली',
            'swelling': 'सूजन',
            'pain': 'दर्द',
            'fever': 'बुखार',
            'chills': 'ठंड लगना',
            'appetite loss': 'भूख न लगना',
            'weight gain': 'वजन बढ़ना',
            'weight loss': 'वजन कम होना',
            'hair loss': 'बालों का झड़ना',
            'dry mouth': 'मुंह सूखना',
            'blurred vision': 'धुंधली दृष्टि',
            'muscle pain': 'मांसपेशियों में दर्द',
            'joint pain': 'जोड़ों में दर्द',
            'stomach upset': 'पेट खराब',
            'heartburn': 'सीने में जलन',
            'indigestion': 'अपच',
            'bloating': 'पेट फूलना',
            'gas': 'गैस',
            'cramping': 'ऐंठन',
            'bleeding': 'रक्तस्राव',
            'bruising': 'नील पड़ना',
            'infection': 'संक्रमण',
            'allergic reaction': 'एलर्जी प्रतिक्रिया',
            'difficulty breathing': 'सांस लेने में कठिनाई',
            'chest pain': 'सीने में दर्द',
            'palpitations': 'धड़कन',
            'high blood pressure': 'उच्च रक्तचाप',
            'low blood pressure': 'निम्न रक्तचाप',
            'liver damage': 'जिगर की क्षति',
            'kidney damage': 'गुर्दे की क्षति',
        },
        actions: {
            'helps': 'मदद करता है',
            'help': 'मदद',
            'reduces': 'कम करता है',
            'reduce': 'कम करना',
            'prevents': 'रोकता है',
            'prevent': 'रोकना',
            'treats': 'इलाज करता है',
            'treat': 'इलाज',
            'relieves': 'राहत देता है',
            'relieve': 'राहत',
            'improves': 'सुधार करता है',
            'improve': 'सुधार',
            'restores': 'बहाल करता है',
            'restore': 'बहाल',
            'manages': 'प्रबंधन करता है',
            'manage': 'प्रबंधन',
            'controls': 'नियंत्रित करता है',
            'control': 'नियंत्रण',
            'strengthens': 'मजबूत करता है',
            'strengthen': 'मजबूत',
            'promotes': 'बढ़ावा देता है',
            'promote': 'बढ़ावा',
            'addresses': 'संबोधित करता है',
            'address': 'संबोधित',
            'works': 'काम करता है',
            'work': 'काम',
            'targets': 'लक्ष्य करता है',
            'target': 'लक्ष्य',
            'blocks': 'अवरुद्ध करता है',
            'block': 'अवरोध',
            'inhibits': 'रोकता है',
            'inhibit': 'रोकना',
            'stimulates': 'उत्तेजित करता है',
            'stimulate': 'उत्तेजित',
            'enhances': 'बढ़ाता है',
            'enhance': 'बढ़ाना',
            'increases': 'बढ़ाता है',
            'increase': 'बढ़ाना',
            'decreases': 'घटाता है',
            'decrease': 'घटाना',
            'affecting': 'प्रभावित करने वाला',
            'including': 'सहित',
            'causing': 'कारण',
            'resulting': 'परिणामस्वरूप',
            'leading': 'अग्रणी',
            'following': 'अनुसरण',
            'requiring': 'आवश्यक',
            'recommended': 'अनुशंसित',
            'prescribed': 'निर्धारित',
            'administered': 'प्रशासित',
            'taken': 'लिया गया',
            'used': 'उपयोग किया गया',
            'applied': 'लागू किया गया',
            'injected': 'इंजेक्ट किया गया',
        },
        adjectives: {
            'effective': 'प्रभावी',
            'safe': 'सुरक्षित',
            'common': 'सामान्य',
            'rare': 'दुर्लभ',
            'serious': 'गंभीर',
            'minor': 'मामूली',
            'major': 'बड़ा',
            'temporary': 'अस्थायी',
            'permanent': 'स्थायी',
            'immediate': 'तत्काल',
            'gradual': 'धीरे-धीरे',
            'long-term': 'दीर्घकालिक',
            'short-term': 'अल्पकालिक',
            'chronic': 'पुराना',
            'acute': 'तीव्र',
            'severe': 'गंभीर',
            'mild': 'हल्का',
            'moderate': 'मध्यम',
            'daily': 'दैनिक',
            'weekly': 'साप्ताहिक',
            'monthly': 'मासिक',
            'oral': 'मौखिक',
            'topical': 'सामयिक',
            'intravenous': 'अंतःशिरा',
            'intramuscular': 'इंट्रामस्क्युलर',
            'subcutaneous': 'चमड़े के नीचे',
            'necessary': 'आवश्यक',
            'essential': 'जरूरी',
            'optional': 'वैकल्पिक',
            'alternative': 'वैकल्पिक',
            'natural': 'प्राकृतिक',
            'synthetic': 'कृत्रिम',
            'generic': 'जेनेरिक',
            'branded': 'ब्रांडेड',
            'available': 'उपलब्ध',
            'generally': 'आम तौर पर',
            'usually': 'आमतौर पर',
            'well tolerated': 'अच्छी तरह सहन',
        },
        connectors: {
            ' of ': ' का ',
            ' in ': ' में ',
            ' with ': ' के साथ ',
            ' and ': ' और ',
            ' or ': ' या ',
            ' for ': ' के लिए ',
            ' to ': ' को ',
            ' from ': ' से ',
            ' by ': ' द्वारा ',
            ' through ': ' के माध्यम से ',
            ' after ': ' के बाद ',
            ' before ': ' से पहले ',
            ' during ': ' के दौरान ',
            ' between ': ' के बीच ',
            ' without ': ' बिना ',
            ' including ': ' सहित ',
            ' such as ': ' जैसे ',
            ' as well as ': ' साथ ही ',
            ' that ': ' जो ',
            ' which ': ' जो ',
            ' when ': ' जब ',
            ' if ': ' अगर ',
            ' may ': ' सकता है ',
            ' can ': ' सकता है ',
            ' is ': ' है ',
            ' are ': ' हैं ',
            ' have ': ' है ',
            ' has ': ' है ',
            ' the ': ' ',
            ' a ': ' एक ',
            ' an ': ' एक ',
        },
        phrases: {
            'post-surgical rehabilitation': 'सर्जरी के बाद पुनर्वास',
            'post surgical rehabilitation': 'सर्जरी के बाद पुनर्वास',
            'sports injuries': 'खेल की चोटें',
            'back and neck pain': 'पीठ और गर्दन का दर्द',
            'stroke recovery': 'स्ट्रोक से रिकवरी',
            'balance disorders': 'संतुलन विकार',
            'chronic pain conditions': 'पुराने दर्द की स्थिति',
            'neurological conditions': 'तंत्रिका संबंधी स्थितियां',
            'temporary muscle soreness': 'अस्थायी मांसपेशियों में दर्द',
            'fatigue after sessions': 'सत्रों के बाद थकान',
            'occasional symptom flare-up': 'कभी-कभी लक्षणों का बढ़ना',
            'generally very well tolerated': 'आम तौर पर बहुत अच्छी तरह सहन',
            'healthcare specialty': 'स्वास्थ्य देखभाल विशेषता',
            'quality of life': 'जीवन की गुणवत्ता',
            'manual therapy': 'मैनुअल थेरेपी',
            'exercise program': 'व्यायाम कार्यक्रम',
            'proper movement patterns': 'उचित गति पैटर्न',
            'injury prevention': 'चोट की रोकथाम',
            'patient education': 'रोगी शिक्षा',
            'physical therapist': 'फिजियोथेरेपिस्ट',
            'physical therapists': 'फिजियोथेरेपिस्ट',
            'targeted exercises': 'लक्षित व्यायाम',
            'joint mobility': 'जोड़ों की गतिशीलता',
            'soft tissue restrictions': 'कोमल ऊतक प्रतिबंध',
        },
    },

    // Tamil
    ta: {
        terms: {
            'physical therapy': 'இயற்பியல் சிகிச்சை',
            'chemotherapy': 'கீமோதெரபி',
            'surgery': 'அறுவை சிகிச்சை',
            'treatment': 'சிகிச்சை',
            'medication': 'மருந்து',
            'therapy': 'சிகிச்சை',
            'injection': 'ஊசி',
            'doctor': 'மருத்துவர்',
            'hospital': 'மருத்துவமனை',
            'patient': 'நோயாளி',
            'pain': 'வலி',
            'fever': 'காய்ச்சல்',
            'infection': 'தொற்று',
            'disease': 'நோய்',
            'heart': 'இதயம்',
            'brain': 'மூளை',
            'blood': 'இரத்தம்',
            'bone': 'எலும்பு',
            'muscle': 'தசை',
            'diabetes': 'நீரிழிவு',
            'cancer': 'புற்றுநோய்',
            'asthma': 'ஆஸ்துமா',
        },
        bodyParts: {
            'heart': 'இதயம்',
            'brain': 'மூளை',
            'lung': 'நுரையீரல்',
            'liver': 'கல்லீரல்',
            'kidney': 'சிறுநீரகம்',
            'stomach': 'வயிறு',
            'bone': 'எலும்பு',
            'muscle': 'தசை',
            'skin': 'தோல்',
            'eye': 'கண்',
            'ear': 'காது',
        },
        treatmentTypes: {
            'medical': 'மருத்துவ மேலாண்மை',
            'surgical': 'அறுவை சிகிச்சை',
            'therapy': 'சிகிச்சை',
        },
        sideEffects: {
            'nausea': 'குமட்டல்',
            'vomiting': 'வாந்தி',
            'headache': 'தலைவலி',
            'fever': 'காய்ச்சல்',
            'pain': 'வலி',
            'weakness': 'பலவீனம்',
        },
        actions: {
            'helps': 'உதவுகிறது',
            'reduces': 'குறைக்கிறது',
            'treats': 'சிகிச்சையளிக்கிறது',
            'prevents': 'தடுக்கிறது',
        },
        adjectives: {
            'effective': 'பயனுள்ள',
            'safe': 'பாதுகாப்பான',
            'common': 'பொதுவான',
            'severe': 'கடுமையான',
        },
        connectors: {
            ' of ': ' இன் ',
            ' in ': ' இல் ',
            ' with ': ' உடன் ',
            ' and ': ' மற்றும் ',
            ' or ': ' அல்லது ',
            ' for ': ' க்கு ',
        },
        phrases: {},
    },

    // Telugu
    te: {
        terms: {
            'physical therapy': 'భౌతిక చికిత్స',
            'surgery': 'శస్త్రచికిత్స',
            'treatment': 'చికిత్స',
            'medication': 'మందు',
            'doctor': 'వైద్యుడు',
            'hospital': 'ఆసుపత్రి',
            'patient': 'రోగి',
            'pain': 'నొప్పి',
            'diabetes': 'మధుమేహం',
            'cancer': 'క్యాన్సర్',
        },
        bodyParts: {
            'heart': 'గుండె',
            'brain': 'మెదడు',
            'lung': 'ఊపిరితిత్తి',
            'liver': 'కాలేయం',
            'kidney': 'మూత్రపిండం',
        },
        treatmentTypes: {
            'medical': 'వైద్య నిర్వహణ',
            'surgical': 'శస్త్రచికిత్స',
        },
        sideEffects: {
            'nausea': 'వికారం',
            'headache': 'తలనొప్పి',
            'fever': 'జ్వరం',
        },
        actions: {
            'helps': 'సహాయపడుతుంది',
            'treats': 'చికిత్స చేస్తుంది',
        },
        adjectives: {
            'effective': 'ప్రభావవంతమైన',
            'safe': 'సురక్షితమైన',
        },
        connectors: {
            ' of ': ' యొక్క ',
            ' and ': ' మరియు ',
        },
        phrases: {},
    },

    // Bengali
    bn: {
        terms: {
            'physical therapy': 'ফিজিওথেরাপি',
            'surgery': 'অস্ত্রোপচার',
            'treatment': 'চিকিৎসা',
            'medication': 'ওষুধ',
            'doctor': 'ডাক্তার',
            'hospital': 'হাসপাতাল',
            'patient': 'রোগী',
            'pain': 'ব্যথা',
            'diabetes': 'ডায়াবেটিস',
        },
        bodyParts: {
            'heart': 'হৃদয়',
            'brain': 'মস্তিষ্ক',
            'liver': 'যকৃত',
            'kidney': 'কিডনি',
        },
        treatmentTypes: {},
        sideEffects: {
            'nausea': 'বমি বমি ভাব',
            'headache': 'মাথাব্যথা',
        },
        actions: {
            'helps': 'সাহায্য করে',
        },
        adjectives: {
            'effective': 'কার্যকর',
        },
        connectors: {
            ' and ': ' এবং ',
        },
        phrases: {},
    },

    // Marathi
    mr: {
        terms: {
            'physical therapy': 'फिजिओथेरपी',
            'surgery': 'शस्त्रक्रिया',
            'treatment': 'उपचार',
            'medication': 'औषध',
            'doctor': 'डॉक्टर',
            'hospital': 'रुग्णालय',
            'patient': 'रुग्ण',
            'pain': 'वेदना',
            'diabetes': 'मधुमेह',
        },
        bodyParts: {
            'heart': 'हृदय',
            'brain': 'मेंदू',
        },
        treatmentTypes: {},
        sideEffects: {},
        actions: {},
        adjectives: {},
        connectors: {
            ' and ': ' आणि ',
        },
        phrases: {},
    },

    // Gujarati
    gu: {
        terms: {
            'treatment': 'સારવાર',
            'doctor': 'ડૉક્ટર',
            'hospital': 'હોસ્પિટલ',
            'patient': 'દર્દી',
            'diabetes': 'ડાયાબિટીસ',
        },
        bodyParts: {
            'heart': 'હૃદય',
        },
        treatmentTypes: {},
        sideEffects: {},
        actions: {},
        adjectives: {},
        connectors: {
            ' and ': ' અને ',
        },
        phrases: {},
    },

    // Spanish
    es: {
        terms: {
            'physical therapy': 'fisioterapia',
            'chemotherapy': 'quimioterapia',
            'radiation therapy': 'radioterapia',
            'surgery': 'cirugía',
            'treatment': 'tratamiento',
            'medication': 'medicación',
            'medicine': 'medicina',
            'therapy': 'terapia',
            'injection': 'inyección',
            'doctor': 'médico',
            'physician': 'médico',
            'specialist': 'especialista',
            'surgeon': 'cirujano',
            'hospital': 'hospital',
            'clinic': 'clínica',
            'patient': 'paciente',
            'pain': 'dolor',
            'fever': 'fiebre',
            'infection': 'infección',
            'disease': 'enfermedad',
            'diabetes': 'diabetes',
            'cancer': 'cáncer',
            'heart': 'corazón',
            'brain': 'cerebro',
            'blood': 'sangre',
        },
        bodyParts: {
            'heart': 'corazón',
            'brain': 'cerebro',
            'lung': 'pulmón',
            'liver': 'hígado',
            'kidney': 'riñón',
            'stomach': 'estómago',
            'bone': 'hueso',
            'muscle': 'músculo',
            'skin': 'piel',
        },
        treatmentTypes: {
            'medical': 'Tratamiento médico',
            'surgical': 'Procedimiento quirúrgico',
            'therapy': 'Terapia',
        },
        sideEffects: {
            'nausea': 'náuseas',
            'vomiting': 'vómitos',
            'headache': 'dolor de cabeza',
            'dizziness': 'mareos',
            'fatigue': 'fatiga',
        },
        actions: {
            'helps': 'ayuda',
            'reduces': 'reduce',
            'treats': 'trata',
            'prevents': 'previene',
        },
        adjectives: {
            'effective': 'eficaz',
            'safe': 'seguro',
            'common': 'común',
        },
        connectors: {
            ' of ': ' de ',
            ' in ': ' en ',
            ' with ': ' con ',
            ' and ': ' y ',
            ' or ': ' o ',
            ' for ': ' para ',
        },
        phrases: {
            'quality of life': 'calidad de vida',
            'side effects': 'efectos secundarios',
        },
    },

    // French
    fr: {
        terms: {
            'physical therapy': 'physiothérapie',
            'chemotherapy': 'chimiothérapie',
            'surgery': 'chirurgie',
            'treatment': 'traitement',
            'medication': 'médicament',
            'therapy': 'thérapie',
            'doctor': 'médecin',
            'hospital': 'hôpital',
            'patient': 'patient',
            'pain': 'douleur',
            'diabetes': 'diabète',
            'cancer': 'cancer',
        },
        bodyParts: {
            'heart': 'cœur',
            'brain': 'cerveau',
            'lung': 'poumon',
            'liver': 'foie',
            'kidney': 'rein',
        },
        treatmentTypes: {
            'medical': 'Traitement médical',
            'surgical': 'Procédure chirurgicale',
        },
        sideEffects: {
            'nausea': 'nausée',
            'headache': 'mal de tête',
            'fatigue': 'fatigue',
        },
        actions: {
            'helps': 'aide',
            'treats': 'traite',
        },
        adjectives: {
            'effective': 'efficace',
            'safe': 'sûr',
        },
        connectors: {
            ' of ': ' de ',
            ' in ': ' dans ',
            ' with ': ' avec ',
            ' and ': ' et ',
            ' or ': ' ou ',
            ' for ': ' pour ',
        },
        phrases: {},
    },

    // Portuguese
    pt: {
        terms: {
            'physical therapy': 'fisioterapia',
            'surgery': 'cirurgia',
            'treatment': 'tratamento',
            'medication': 'medicação',
            'doctor': 'médico',
            'hospital': 'hospital',
            'patient': 'paciente',
            'diabetes': 'diabetes',
        },
        bodyParts: {
            'heart': 'coração',
            'brain': 'cérebro',
        },
        treatmentTypes: {},
        sideEffects: {},
        actions: {},
        adjectives: {},
        connectors: {
            ' and ': ' e ',
            ' of ': ' de ',
        },
        phrases: {},
    },

    // German
    de: {
        terms: {
            'physical therapy': 'Physiotherapie',
            'chemotherapy': 'Chemotherapie',
            'surgery': 'Chirurgie',
            'treatment': 'Behandlung',
            'medication': 'Medikament',
            'therapy': 'Therapie',
            'doctor': 'Arzt',
            'hospital': 'Krankenhaus',
            'patient': 'Patient',
            'pain': 'Schmerz',
            'diabetes': 'Diabetes',
        },
        bodyParts: {
            'heart': 'Herz',
            'brain': 'Gehirn',
            'lung': 'Lunge',
            'liver': 'Leber',
        },
        treatmentTypes: {
            'medical': 'Medizinische Behandlung',
            'surgical': 'Chirurgischer Eingriff',
        },
        sideEffects: {
            'nausea': 'Übelkeit',
            'headache': 'Kopfschmerzen',
        },
        actions: {
            'helps': 'hilft',
            'treats': 'behandelt',
        },
        adjectives: {
            'effective': 'wirksam',
            'safe': 'sicher',
        },
        connectors: {
            ' and ': ' und ',
            ' of ': ' von ',
            ' with ': ' mit ',
            ' for ': ' für ',
        },
        phrases: {},
    },

    // Arabic
    ar: {
        terms: {
            'physical therapy': 'العلاج الطبيعي',
            'surgery': 'جراحة',
            'treatment': 'علاج',
            'medication': 'دواء',
            'doctor': 'طبيب',
            'hospital': 'مستشفى',
            'patient': 'مريض',
            'diabetes': 'السكري',
        },
        bodyParts: {
            'heart': 'قلب',
            'brain': 'دماغ',
        },
        treatmentTypes: {},
        sideEffects: {},
        actions: {},
        adjectives: {},
        connectors: {
            ' and ': ' و ',
        },
        phrases: {},
    },

    // Urdu
    ur: {
        terms: {
            'treatment': 'علاج',
            'doctor': 'ڈاکٹر',
            'hospital': 'ہسپتال',
            'patient': 'مریض',
            'diabetes': 'ذیابیطس',
        },
        bodyParts: {
            'heart': 'دل',
        },
        treatmentTypes: {},
        sideEffects: {},
        actions: {},
        adjectives: {},
        connectors: {
            ' and ': ' اور ',
        },
        phrases: {},
    },
};

// Languages to process
const LANGUAGES = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'ur', 'ar', 'es', 'fr', 'pt', 'de'];

// ============================================================================
// TRANSLATION FUNCTIONS
// ============================================================================

function translateText(text: string | undefined | null, lang: string): string {
    if (!text) return '';

    const dict = DICTIONARIES[lang];
    if (!dict) return text;

    let result = text;

    // Apply phrase translations first (longest matches)
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

    // Apply body parts
    if (dict.bodyParts) {
        for (const [en, translated] of Object.entries(dict.bodyParts)) {
            const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            result = result.replace(regex, translated);
        }
    }

    // Apply side effects vocabulary
    if (dict.sideEffects) {
        for (const [en, translated] of Object.entries(dict.sideEffects)) {
            const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            result = result.replace(regex, translated);
        }
    }

    // Apply actions
    if (dict.actions) {
        for (const [en, translated] of Object.entries(dict.actions)) {
            const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            result = result.replace(regex, translated);
        }
    }

    // Apply adjectives
    if (dict.adjectives) {
        for (const [en, translated] of Object.entries(dict.adjectives)) {
            const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            result = result.replace(regex, translated);
        }
    }

    // Apply connectors (with spaces)
    if (dict.connectors) {
        for (const [en, translated] of Object.entries(dict.connectors)) {
            result = result.split(en).join(translated);
        }
    }

    return result;
}

function translateArray(arr: string[] | undefined | null, lang: string): string[] {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(item => translateText(item, lang));
}

interface TreatmentEntry {
    name: string;
    type: string;
    specialty: string;
    group?: string;
    brandNames?: string[];
    genericAvailable?: boolean;
    requiresPrescription?: boolean;
    description?: string;
    mechanism?: string;
    indications?: string[];
    sideEffects?: string[];
    references?: { title: string; url: string }[];
    costs?: Record<string, any>;
}

function translateTreatment(treatment: TreatmentEntry, lang: string): TreatmentEntry {
    const dict = DICTIONARIES[lang];

    return {
        ...treatment,
        // Keep original name but add translated name
        name: treatment.name,
        translatedName: translateText(treatment.name, lang),
        // Translate type label
        typeLabel: dict?.treatmentTypes?.[treatment.type] || treatment.type,
        // Translate description
        description: translateText(treatment.description, lang),
        // Translate mechanism
        mechanism: translateText(treatment.mechanism, lang),
        // Translate indications array
        indications: translateArray(treatment.indications, lang),
        // Translate side effects array
        sideEffects: translateArray(treatment.sideEffects, lang),
    } as any;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    const langArg = args.find(a => a.startsWith('--lang='));
    const allLangs = args.includes('--all');

    const langsToProcess = allLangs
        ? LANGUAGES
        : langArg
            ? [langArg.replace('--lang=', '')]
            : ['hi']; // default to Hindi

    console.log('============================================================');
    console.log('TREATMENT TRANSLATION');
    console.log('============================================================');
    console.log(`Languages: ${langsToProcess.join(', ')}`);

    // Load treatments
    const treatmentsPath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
    const treatments: TreatmentEntry[] = JSON.parse(fs.readFileSync(treatmentsPath, 'utf-8'));
    console.log(`\nLoaded ${treatments.length} treatments`);

    for (const lang of langsToProcess) {
        console.log(`\n──────────────────────────────────────────────────`);
        console.log(`Translating to: ${lang.toUpperCase()}`);
        console.log(`──────────────────────────────────────────────────`);

        const translatedTreatments = treatments.map(t => translateTreatment(t, lang));

        // Write translated file
        const outputPath = path.join(process.cwd(), 'public', 'data', `treatments-${lang}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(translatedTreatments, null, 2));

        console.log(`✅ Wrote ${outputPath}`);
    }

    console.log('\n============================================================');
    console.log('TRANSLATION COMPLETE');
    console.log('============================================================');
}

main().catch(console.error);
