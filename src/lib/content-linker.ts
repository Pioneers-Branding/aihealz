/**
 * Content Linker - Extracts entities from AI responses and links to relevant site pages
 * Detects: tests, conditions, treatments, doctors, locations, specialties
 */

export interface ContentLink {
    type: 'test' | 'condition' | 'treatment' | 'doctor' | 'hospital' | 'specialty' | 'location' | 'tool';
    text: string;
    url: string;
    icon: string;
    label: string;
}

export interface ExtractedContent {
    links: ContentLink[];
    highlightedText: string;
}

// Common medical tests with their slugs
const COMMON_TESTS: Record<string, string> = {
    'cbc': 'complete-blood-count',
    'complete blood count': 'complete-blood-count',
    'blood sugar': 'blood-glucose-fasting',
    'fasting blood sugar': 'blood-glucose-fasting',
    'hba1c': 'hba1c-glycated-hemoglobin',
    'glycated hemoglobin': 'hba1c-glycated-hemoglobin',
    'lipid profile': 'lipid-profile',
    'cholesterol': 'lipid-profile',
    'thyroid': 'thyroid-profile',
    'thyroid profile': 'thyroid-profile',
    'tsh': 'tsh',
    't3': 'thyroid-profile',
    't4': 'thyroid-profile',
    'liver function': 'liver-function-test',
    'lft': 'liver-function-test',
    'kidney function': 'kidney-function-test',
    'kft': 'kidney-function-test',
    'creatinine': 'creatinine',
    'urine test': 'urinalysis',
    'urinalysis': 'urinalysis',
    'urine routine': 'urinalysis',
    'ecg': 'ecg-electrocardiogram',
    'ekg': 'ecg-electrocardiogram',
    'electrocardiogram': 'ecg-electrocardiogram',
    'x-ray': 'x-ray',
    'xray': 'x-ray',
    'ct scan': 'ct-scan',
    'mri': 'mri',
    'ultrasound': 'ultrasound',
    'sonography': 'ultrasound',
    'mammogram': 'mammography',
    'mammography': 'mammography',
    'pap smear': 'pap-smear',
    'blood pressure': 'blood-pressure-monitoring',
    'bp': 'blood-pressure-monitoring',
    'bmi': 'bmi-assessment',
    'vitamin d': 'vitamin-d',
    'vitamin b12': 'vitamin-b12',
    'iron': 'iron-studies',
    'hemoglobin': 'hemoglobin',
    'diabetes test': 'blood-glucose-fasting',
    'sugar test': 'blood-glucose-fasting',
    'covid test': 'covid-19-rt-pcr',
    'rt-pcr': 'covid-19-rt-pcr',
    'rapid antigen': 'covid-19-rapid-antigen',
    'dengue': 'dengue-test',
    'malaria': 'malaria-test',
    'typhoid': 'typhoid-test',
};

// Common conditions with their slugs
const COMMON_CONDITIONS: Record<string, string> = {
    'diabetes': 'diabetes-mellitus',
    'type 2 diabetes': 'type-2-diabetes',
    'type 1 diabetes': 'type-1-diabetes',
    'hypertension': 'hypertension',
    'high blood pressure': 'hypertension',
    'heart disease': 'coronary-artery-disease',
    'coronary artery disease': 'coronary-artery-disease',
    'asthma': 'asthma',
    'arthritis': 'arthritis',
    'rheumatoid arthritis': 'rheumatoid-arthritis',
    'osteoarthritis': 'osteoarthritis',
    'thyroid': 'thyroid-disorders',
    'hypothyroidism': 'hypothyroidism',
    'hyperthyroidism': 'hyperthyroidism',
    'migraine': 'migraine',
    'headache': 'tension-headache',
    'back pain': 'lower-back-pain',
    'lower back pain': 'lower-back-pain',
    'depression': 'depression',
    'anxiety': 'anxiety-disorder',
    'obesity': 'obesity',
    'pcod': 'polycystic-ovary-syndrome',
    'pcos': 'polycystic-ovary-syndrome',
    'kidney disease': 'chronic-kidney-disease',
    'liver disease': 'liver-disease',
    'fatty liver': 'non-alcoholic-fatty-liver',
    'anemia': 'anemia',
    'cancer': 'cancer',
    'covid': 'covid-19',
    'flu': 'influenza',
    'cold': 'common-cold',
    'fever': 'fever',
    'cough': 'cough',
    'acne': 'acne',
    'eczema': 'eczema',
    'psoriasis': 'psoriasis',
    'allergies': 'allergies',
    'gastritis': 'gastritis',
    'acid reflux': 'gastroesophageal-reflux',
    'gerd': 'gastroesophageal-reflux',
    'ibs': 'irritable-bowel-syndrome',
    'constipation': 'constipation',
    'diarrhea': 'diarrhea',
};

// Common treatments
const COMMON_TREATMENTS: Record<string, string> = {
    'angioplasty': 'angioplasty',
    'bypass surgery': 'coronary-bypass-surgery',
    'knee replacement': 'knee-replacement',
    'hip replacement': 'hip-replacement',
    'cataract surgery': 'cataract-surgery',
    'lasik': 'lasik-eye-surgery',
    'dialysis': 'dialysis',
    'chemotherapy': 'chemotherapy',
    'radiation therapy': 'radiation-therapy',
    'physiotherapy': 'physiotherapy',
    'ivf': 'ivf-treatment',
    'root canal': 'root-canal-treatment',
    'dental implant': 'dental-implants',
    'braces': 'dental-braces',
};

// Specialties
const SPECIALTIES: Record<string, string> = {
    'cardiologist': 'cardiologist',
    'heart doctor': 'cardiologist',
    'heart specialist': 'cardiologist',
    'neurologist': 'neurologist',
    'brain specialist': 'neurologist',
    'orthopedic': 'orthopedic',
    'bone doctor': 'orthopedic',
    'dermatologist': 'dermatologist',
    'skin doctor': 'dermatologist',
    'skin specialist': 'dermatologist',
    'gastroenterologist': 'gastroenterologist',
    'stomach doctor': 'gastroenterologist',
    'gynecologist': 'gynecologist',
    'obgyn': 'gynecologist',
    'pediatrician': 'pediatrician',
    'child specialist': 'pediatrician',
    'dentist': 'dentist',
    'ophthalmologist': 'ophthalmologist',
    'eye doctor': 'ophthalmologist',
    'eye specialist': 'ophthalmologist',
    'ent': 'ent-specialist',
    'ent specialist': 'ent-specialist',
    'pulmonologist': 'pulmonologist',
    'lung specialist': 'pulmonologist',
    'psychiatrist': 'psychiatrist',
    'psychologist': 'psychologist',
    'urologist': 'urologist',
    'nephrologist': 'nephrologist',
    'kidney specialist': 'nephrologist',
    'oncologist': 'oncologist',
    'cancer specialist': 'oncologist',
    'endocrinologist': 'endocrinologist',
    'diabetologist': 'diabetologist',
    'general physician': 'general-physician',
};

// Indian cities for location detection
const INDIAN_CITIES: Record<string, string> = {
    'delhi': 'delhi',
    'new delhi': 'delhi',
    'mumbai': 'mumbai',
    'bangalore': 'bangalore',
    'bengaluru': 'bangalore',
    'chennai': 'chennai',
    'hyderabad': 'hyderabad',
    'kolkata': 'kolkata',
    'pune': 'pune',
    'ahmedabad': 'ahmedabad',
    'jaipur': 'jaipur',
    'lucknow': 'lucknow',
    'chandigarh': 'chandigarh',
    'gurgaon': 'gurgaon',
    'gurugram': 'gurgaon',
    'noida': 'noida',
    'ghaziabad': 'ghaziabad',
    'faridabad': 'faridabad',
    'kochi': 'kochi',
    'indore': 'indore',
    'bhopal': 'bhopal',
    'nagpur': 'nagpur',
    'surat': 'surat',
    'vadodara': 'vadodara',
    'coimbatore': 'coimbatore',
    'thiruvananthapuram': 'thiruvananthapuram',
    'patna': 'patna',
    'ranchi': 'ranchi',
    'visakhapatnam': 'visakhapatnam',
    'vizag': 'visakhapatnam',
};

// Health calculators/tools
const HEALTH_TOOLS: Record<string, string> = {
    'bmi calculator': '/tools/bmi-calculator',
    'bmi': '/tools/bmi-calculator',
    'body mass index': '/tools/bmi-calculator',
    'bmr calculator': '/tools/bmr-calculator',
    'bmr': '/tools/bmr-calculator',
    'calorie calculator': '/tools/bmr-calculator',
    'body fat calculator': '/tools/body-fat-calculator',
    'body fat': '/tools/body-fat-calculator',
    'heart risk calculator': '/tools/heart-risk-calculator',
    'heart risk': '/tools/heart-risk-calculator',
    'cardiovascular risk': '/tools/heart-risk-calculator',
    'diabetes risk calculator': '/tools/diabetes-risk-calculator',
    'diabetes risk': '/tools/diabetes-risk-calculator',
    'kidney calculator': '/tools/kidney-function-calculator',
    'egfr calculator': '/tools/kidney-function-calculator',
    'egfr': '/tools/kidney-function-calculator',
    'water intake calculator': '/tools/water-intake-calculator',
    'water intake': '/tools/water-intake-calculator',
    'hydration calculator': '/tools/water-intake-calculator',
    'pregnancy calculator': '/tools/pregnancy-due-date-calculator',
    'due date calculator': '/tools/pregnancy-due-date-calculator',
    'due date': '/tools/pregnancy-due-date-calculator',
};

export interface GeoContext {
    country: string;
    lang: string;
}

/**
 * Get geo context from cookies (client-side)
 * Falls back to india/en if not set
 */
export function getClientGeoContext(): GeoContext {
    if (typeof document === 'undefined') {
        return { country: 'india', lang: 'en' };
    }

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = decodeURIComponent(value);
        return acc;
    }, {} as Record<string, string>);

    return {
        country: cookies['aihealz-country'] || 'india',
        lang: cookies['aihealz-lang'] || 'en',
    };
}

/**
 * Extract content links from AI response text
 * @param text - The AI response text to extract links from
 * @param userLocation - Optional city/location context
 * @param geoContext - Optional country/language context for URL generation
 */
export function extractContentLinks(
    text: string,
    userLocation?: string,
    geoContext?: GeoContext
): ContentLink[] {
    const links: ContentLink[] = [];
    const foundItems = new Set<string>();
    const lowerText = text.toLowerCase();

    // Use provided geo context or default to india/en
    const country = geoContext?.country || 'india';
    const lang = geoContext?.lang || 'en';
    const geoPrefix = `/${country}/${lang}`;

    // Detect location from text or use provided location
    let detectedLocation = userLocation?.toLowerCase() || '';
    for (const [cityName, citySlug] of Object.entries(INDIAN_CITIES)) {
        if (lowerText.includes(cityName) && !detectedLocation) {
            detectedLocation = citySlug;
            break;
        }
    }

    // Extract tests
    for (const [testName, testSlug] of Object.entries(COMMON_TESTS)) {
        if (lowerText.includes(testName) && !foundItems.has(testSlug)) {
            foundItems.add(testSlug);
            const url = detectedLocation
                ? `/tests/${testSlug}/${detectedLocation}`
                : `/tests/${testSlug}`;
            links.push({
                type: 'test',
                text: testName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                url,
                icon: 'test-tube',
                label: detectedLocation
                    ? `${testName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} in ${detectedLocation.charAt(0).toUpperCase() + detectedLocation.slice(1)}`
                    : testName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            });
        }
    }

    // Extract conditions
    for (const [condName, condSlug] of Object.entries(COMMON_CONDITIONS)) {
        if (lowerText.includes(condName) && !foundItems.has(condSlug)) {
            foundItems.add(condSlug);
            const url = detectedLocation
                ? `${geoPrefix}/${condSlug}/${detectedLocation}`
                : `${geoPrefix}/${condSlug}`;
            links.push({
                type: 'condition',
                text: condName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                url,
                icon: 'heart-pulse',
                label: `Learn about ${condName}`,
            });
        }
    }

    // Extract treatments
    for (const [treatName, treatSlug] of Object.entries(COMMON_TREATMENTS)) {
        if (lowerText.includes(treatName) && !foundItems.has(treatSlug)) {
            foundItems.add(treatSlug);
            links.push({
                type: 'treatment',
                text: treatName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                url: `${geoPrefix}/treatments/${treatSlug}`,
                icon: 'pill',
                label: `${treatName} treatment guide`,
            });
        }
    }

    // Extract specialties (link to find doctors)
    for (const [specName, specSlug] of Object.entries(SPECIALTIES)) {
        if (lowerText.includes(specName) && !foundItems.has(specSlug)) {
            foundItems.add(specSlug);
            const url = detectedLocation
                ? `/doctors/specialty/${specSlug}?city=${detectedLocation}`
                : `/doctors/specialty/${specSlug}`;
            links.push({
                type: 'specialty',
                text: specName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                url,
                icon: 'stethoscope',
                label: detectedLocation
                    ? `Find ${specName}s in ${detectedLocation.charAt(0).toUpperCase() + detectedLocation.slice(1)}`
                    : `Find ${specName}s near you`,
            });
        }
    }

    // Extract health tools
    for (const [toolName, toolUrl] of Object.entries(HEALTH_TOOLS)) {
        if (lowerText.includes(toolName) && !foundItems.has(toolUrl)) {
            foundItems.add(toolUrl);
            links.push({
                type: 'tool',
                text: toolName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                url: toolUrl,
                icon: 'calculator',
                label: `Use ${toolName}`,
            });
        }
    }

    // Sort by relevance (tests first if price/cost mentioned, then conditions, etc.)
    const hasPriceMention = /price|cost|fee|charge|rate|rs|inr|₹|\$/i.test(text);
    if (hasPriceMention) {
        links.sort((a, b) => {
            if (a.type === 'test' && b.type !== 'test') return -1;
            if (a.type !== 'test' && b.type === 'test') return 1;
            return 0;
        });
    }

    return links.slice(0, 6); // Limit to 6 most relevant links
}

/**
 * Get icon SVG for content type
 */
export function getContentIcon(type: ContentLink['type']): string {
    const icons: Record<string, string> = {
        'test': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />`,
        'condition': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />`,
        'treatment': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />`,
        'doctor': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />`,
        'hospital': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />`,
        'specialty': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`,
        'location': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />`,
        'tool': `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />`,
    };
    return icons[type] || icons['condition'];
}

/**
 * Get color scheme for content type
 */
export function getContentColor(type: ContentLink['type']): { bg: string; text: string; border: string; icon: string } {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
        'test': { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20', icon: 'text-violet-400' },
        'condition': { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20', icon: 'text-rose-400' },
        'treatment': { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
        'doctor': { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20', icon: 'text-blue-400' },
        'hospital': { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20', icon: 'text-amber-400' },
        'specialty': { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20', icon: 'text-cyan-400' },
        'location': { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/20', icon: 'text-orange-400' },
        'tool': { bg: 'bg-primary-500/10', text: 'text-primary-300', border: 'border-primary-500/20', icon: 'text-primary-400' },
    };
    return colors[type] || colors['condition'];
}
