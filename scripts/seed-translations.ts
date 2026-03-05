/**
 * Translation Seeding Script
 *
 * Seeds UI translations for all major languages.
 * Run with: npx tsx scripts/seed-translations.ts
 *
 * Languages prioritized by global reach:
 * 1. Hindi (hi) - 600M speakers
 * 2. Spanish (es) - 550M speakers
 * 3. Arabic (ar) - 420M speakers
 * 4. Bengali (bn) - 270M speakers
 * 5. Portuguese (pt) - 260M speakers
 * 6. Russian (ru) - 250M speakers
 * 7. Japanese (ja) - 125M speakers
 * 8. German (de) - 100M speakers
 * 9. French (fr) - 280M speakers
 * 10. Korean (ko) - 80M speakers
 * 12. Vietnamese (vi) - 85M speakers
 * 13. Tamil (ta) - 80M speakers
 * 14. Telugu (te) - 85M speakers
 * 15. Marathi (mr) - 85M speakers
 * 16. Turkish (tr) - 80M speakers
 * 17. Urdu (ur) - 230M speakers
 * 18. Indonesian (id) - 200M speakers
 * 19. Thai (th) - 60M speakers
 * 20. Italian (it) - 65M speakers
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Load .env file
config();

// Use the same DB setup as the app
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
}
console.log('📦 Connecting to database...');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
});

// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface LanguageDef {
    code: string;
    name: string;
    nativeName: string;
}

const LANGUAGES: LanguageDef[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATION DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

type TranslationSet = Record<string, Record<string, string>>;

// English base translations (source of truth)
const EN_TRANSLATIONS: Record<string, Record<string, string>> = {
    common: {
        // Navigation
        home: 'Home',
        conditions: 'Conditions',
        treatments: 'Treatments',
        doctors: 'Doctors',
        hospitals: 'Hospitals',
        tests: 'Lab Tests',
        symptoms: 'Symptoms',
        analyze: 'AI Analysis',
        about: 'About',
        contact: 'Contact',
        pricing: 'Pricing',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',

        // Actions
        search: 'Search',
        searchPlaceholder: 'Search conditions, treatments, doctors...',
        findDoctors: 'Find Doctors',
        findHospitals: 'Find Hospitals',
        bookAppointment: 'Book Appointment',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
        readMore: 'Read More',
        viewAll: 'View All',
        seeMore: 'See More',
        showLess: 'Show Less',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',

        // Status
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        noResults: 'No results found',
        tryAgain: 'Try Again',

        // Location
        location: 'Location',
        selectCountry: 'Select Country',
        selectCity: 'Select City',
        nearYou: 'Near You',
        inYourCity: 'In Your City',

        // Medical
        specialist: 'Specialist',
        specialists: 'Specialists',
        consultation: 'Consultation',
        consultationFee: 'Consultation Fee',
        experience: 'Experience',
        yearsExperience: 'Years Experience',
        rating: 'Rating',
        reviews: 'Reviews',
        verified: 'Verified',
        available: 'Available',
        unavailable: 'Unavailable',

        // Pricing
        free: 'Free',
        premium: 'Premium',
        enterprise: 'Enterprise',
        price: 'Price',
        cost: 'Cost',
        costRange: 'Cost Range',
        averageCost: 'Average Cost',
        estimatedCost: 'Estimated Cost',

        // Time
        today: 'Today',
        tomorrow: 'Tomorrow',
        thisWeek: 'This Week',
        minutes: 'minutes',
        hours: 'hours',
        days: 'days',
        weeks: 'weeks',
        months: 'months',
        years: 'years',

        // Common phrases
        disclaimer: 'Disclaimer',
        medicalDisclaimer: 'This information is for educational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        allRightsReserved: 'All Rights Reserved',
        poweredBy: 'Powered by',

        // Footer
        followUs: 'Follow Us',
        newsletter: 'Newsletter',
        subscribeNewsletter: 'Subscribe to our newsletter',
        emailPlaceholder: 'Enter your email',
        subscribe: 'Subscribe',

        // Errors
        errorOccurred: 'An error occurred',
        pageNotFound: 'Page not found',
        serverError: 'Server error',
        networkError: 'Network error',

        // AI Features
        aiAnalysis: 'AI Analysis',
        aiPowered: 'AI Powered',
        analyzeSymptoms: 'Analyze Symptoms',
        getAIAnalysis: 'Get AI Analysis',
        aiDisclaimer: 'AI analysis is not a substitute for professional medical diagnosis.',
    },

    condition: {
        // Section Headers
        whatIs: 'What is',
        overview: 'Overview',
        symptoms: 'Symptoms',
        causes: 'Causes',
        riskFactors: 'Risk Factors',
        diagnosis: 'Diagnosis',
        treatment: 'Treatment',
        treatmentOptions: 'Treatment Options',
        prevention: 'Prevention',
        complications: 'Complications',
        prognosis: 'Prognosis',
        livingWith: 'Living With',
        whenToSeeDoctor: 'When to See a Doctor',
        relatedConditions: 'Related Conditions',
        frequentlyAskedQuestions: 'Frequently Asked Questions',

        // Condition page specific
        aboutThisCondition: 'About This Condition',
        commonSymptoms: 'Common Symptoms',
        primaryCauses: 'Primary Causes',
        diagnosticTests: 'Diagnostic Tests',
        treatmentApproaches: 'Treatment Approaches',
        preventionTips: 'Prevention Tips',

        // Doctor section
        findSpecialist: 'Find a Specialist',
        topDoctors: 'Top Doctors',
        recommendedDoctors: 'Recommended Doctors',
        specialistType: 'Specialist Type',
        consultSpecialist: 'Consult a Specialist',

        // Hospital section
        topHospitals: 'Top Hospitals',
        recommendedHospitals: 'Recommended Hospitals',
        hospitalsWith: 'Hospitals with',
        treatmentAvailable: 'Treatment Available',

        // Cost section
        treatmentCost: 'Treatment Cost',
        costComparison: 'Cost Comparison',
        costIn: 'Cost in',
        priceRange: 'Price Range',
        insuranceCoverage: 'Insurance Coverage',

        // Medical terms
        icdCode: 'ICD Code',
        specialistRequired: 'Specialist Required',
        commonlyAffects: 'Commonly Affects',
        prevalence: 'Prevalence',
        recoveryTime: 'Recovery Time',

        // Severity
        severity: 'Severity',
        mild: 'Mild',
        moderate: 'Moderate',
        severe: 'Severe',
        critical: 'Critical',

        // Urgency
        urgency: 'Urgency',
        low: 'Low',
        high: 'High',
        emergency: 'Emergency',
        seekImmediateCare: 'Seek Immediate Care',
    },

    treatment: {
        // Treatment page headers
        aboutTreatment: 'About This Treatment',
        howItWorks: 'How It Works',
        procedure: 'Procedure',
        benefits: 'Benefits',
        risks: 'Risks',
        sideEffects: 'Side Effects',
        recovery: 'Recovery',
        alternatives: 'Alternatives',

        // Treatment details
        treatmentDuration: 'Treatment Duration',
        successRate: 'Success Rate',
        requiredTests: 'Required Tests',
        preOperative: 'Pre-Operative',
        postOperative: 'Post-Operative',
        followUp: 'Follow Up',

        // Types
        medication: 'Medication',
        surgery: 'Surgery',
        therapy: 'Therapy',
        lifestyle: 'Lifestyle Changes',
        alternative: 'Alternative Treatment',

        // Actions
        findTreatmentCenter: 'Find Treatment Center',
        compareTreatments: 'Compare Treatments',
        getTreatmentQuote: 'Get Treatment Quote',
    },

    doctor: {
        // Doctor profile
        doctorProfile: 'Doctor Profile',
        qualifications: 'Qualifications',
        specializations: 'Specializations',
        languagesSpoken: 'Languages Spoken',
        consultationModes: 'Consultation Modes',
        inPerson: 'In Person',
        videoConsultation: 'Video Consultation',
        phoneConsultation: 'Phone Consultation',

        // Booking
        bookNow: 'Book Now',
        checkAvailability: 'Check Availability',
        nextAvailable: 'Next Available',
        selectTimeSlot: 'Select Time Slot',
        confirmBooking: 'Confirm Booking',

        // Reviews
        patientReviews: 'Patient Reviews',
        writeReview: 'Write a Review',
        overallRating: 'Overall Rating',
        waitTime: 'Wait Time',
        recommendedBy: 'Recommended by',
        patientsRecommend: 'patients recommend',
    },

    hospital: {
        // Hospital profile
        hospitalProfile: 'Hospital Profile',
        facilities: 'Facilities',
        departments: 'Departments',
        accreditations: 'Accreditations',
        bedCapacity: 'Bed Capacity',
        emergencyServices: 'Emergency Services',

        // Features
        insuranceAccepted: 'Insurance Accepted',
        internationalPatients: 'International Patients',
        medicalTourism: 'Medical Tourism',

        // Contact
        contactHospital: 'Contact Hospital',
        getDirections: 'Get Directions',
        virtualTour: 'Virtual Tour',
    },

    symptoms: {
        // Symptom checker
        symptomChecker: 'Symptom Checker',
        describeSymptoms: 'Describe Your Symptoms',
        selectSymptoms: 'Select Your Symptoms',
        addSymptom: 'Add Symptom',
        removeSymptom: 'Remove Symptom',
        analyzeSymptoms: 'Analyze Symptoms',

        // Results
        possibleConditions: 'Possible Conditions',
        likelihood: 'Likelihood',
        recommendedTests: 'Recommended Tests',
        recommendedSpecialist: 'Recommended Specialist',

        // Patient info
        age: 'Age',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',

        // Severity
        howLong: 'How long have you had this symptom?',
        howSevere: 'How severe is this symptom?',
        gettingWorse: 'Is it getting worse?',

        // Disclaimer
        symptomDisclaimer: 'This symptom checker is for informational purposes only and does not constitute medical advice.',
    },

    tools: {
        // Calculator tools
        healthTools: 'Health Tools',
        bmiCalculator: 'BMI Calculator',
        bmrCalculator: 'BMR Calculator',
        bodyFatCalculator: 'Body Fat Calculator',
        waterIntakeCalculator: 'Water Intake Calculator',
        calorieCalculator: 'Calorie Calculator',
        pregnancyCalculator: 'Pregnancy Due Date Calculator',
        heartRiskCalculator: 'Heart Risk Calculator',
        diabetesRiskCalculator: 'Diabetes Risk Calculator',

        // Inputs
        weight: 'Weight',
        height: 'Height',
        age: 'Age',
        gender: 'Gender',
        activityLevel: 'Activity Level',

        // Results
        calculate: 'Calculate',
        yourResult: 'Your Result',
        interpretation: 'Interpretation',
        recommendations: 'Recommendations',

        // Categories
        underweight: 'Underweight',
        normal: 'Normal',
        overweight: 'Overweight',
        obese: 'Obese',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS FOR MAJOR LANGUAGES
// ═══════════════════════════════════════════════════════════════════════════════

const TRANSLATIONS: Record<string, TranslationSet> = {
    // Hindi translations
    hi: {
        common: {
            home: 'होम',
            conditions: 'बीमारियाँ',
            treatments: 'इलाज',
            doctors: 'डॉक्टर',
            hospitals: 'अस्पताल',
            tests: 'लैब टेस्ट',
            symptoms: 'लक्षण',
            analyze: 'एआई विश्लेषण',
            about: 'हमारे बारे में',
            contact: 'संपर्क',
            pricing: 'मूल्य',
            login: 'लॉगिन',
            signup: 'साइन अप',
            logout: 'लॉगआउट',
            search: 'खोजें',
            searchPlaceholder: 'बीमारियाँ, इलाज, डॉक्टर खोजें...',
            findDoctors: 'डॉक्टर खोजें',
            findHospitals: 'अस्पताल खोजें',
            bookAppointment: 'अपॉइंटमेंट बुक करें',
            getStarted: 'शुरू करें',
            learnMore: 'और जानें',
            readMore: 'और पढ़ें',
            viewAll: 'सभी देखें',
            seeMore: 'और देखें',
            showLess: 'कम दिखाएं',
            submit: 'जमा करें',
            cancel: 'रद्द करें',
            save: 'सहेजें',
            edit: 'संपादित करें',
            delete: 'हटाएं',
            close: 'बंद करें',
            back: 'वापस',
            next: 'अगला',
            previous: 'पिछला',
            loading: 'लोड हो रहा है...',
            error: 'त्रुटि',
            success: 'सफल',
            noResults: 'कोई परिणाम नहीं मिला',
            tryAgain: 'पुनः प्रयास करें',
            location: 'स्थान',
            selectCountry: 'देश चुनें',
            selectCity: 'शहर चुनें',
            nearYou: 'आपके पास',
            inYourCity: 'आपके शहर में',
            specialist: 'विशेषज्ञ',
            specialists: 'विशेषज्ञ',
            consultation: 'परामर्श',
            consultationFee: 'परामर्श शुल्क',
            experience: 'अनुभव',
            yearsExperience: 'वर्षों का अनुभव',
            rating: 'रेटिंग',
            reviews: 'समीक्षाएं',
            verified: 'सत्यापित',
            available: 'उपलब्ध',
            unavailable: 'अनुपलब्ध',
            free: 'मुफ्त',
            premium: 'प्रीमियम',
            price: 'मूल्य',
            cost: 'लागत',
            costRange: 'लागत सीमा',
            averageCost: 'औसत लागत',
            estimatedCost: 'अनुमानित लागत',
            today: 'आज',
            tomorrow: 'कल',
            thisWeek: 'इस सप्ताह',
            minutes: 'मिनट',
            hours: 'घंटे',
            days: 'दिन',
            weeks: 'सप्ताह',
            months: 'महीने',
            years: 'वर्ष',
            disclaimer: 'अस्वीकरण',
            medicalDisclaimer: 'यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है और यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है। हमेशा योग्य स्वास्थ्य सेवा प्रदाता से परामर्श लें।',
            privacyPolicy: 'गोपनीयता नीति',
            termsOfService: 'सेवा की शर्तें',
            allRightsReserved: 'सर्वाधिकार सुरक्षित',
            aiAnalysis: 'एआई विश्लेषण',
            aiPowered: 'एआई संचालित',
            analyzeSymptoms: 'लक्षणों का विश्लेषण करें',
            getAIAnalysis: 'एआई विश्लेषण प्राप्त करें',
            aiDisclaimer: 'एआई विश्लेषण पेशेवर चिकित्सा निदान का विकल्प नहीं है।',
        },
        condition: {
            whatIs: 'क्या है',
            overview: 'अवलोकन',
            symptoms: 'लक्षण',
            causes: 'कारण',
            riskFactors: 'जोखिम कारक',
            diagnosis: 'निदान',
            treatment: 'उपचार',
            treatmentOptions: 'उपचार विकल्प',
            prevention: 'रोकथाम',
            complications: 'जटिलताएं',
            prognosis: 'पूर्वानुमान',
            livingWith: 'के साथ जीना',
            whenToSeeDoctor: 'डॉक्टर से कब मिलें',
            relatedConditions: 'संबंधित बीमारियाँ',
            frequentlyAskedQuestions: 'अक्सर पूछे जाने वाले प्रश्न',
            aboutThisCondition: 'इस बीमारी के बारे में',
            commonSymptoms: 'सामान्य लक्षण',
            primaryCauses: 'प्रमुख कारण',
            diagnosticTests: 'नैदानिक परीक्षण',
            treatmentApproaches: 'उपचार दृष्टिकोण',
            preventionTips: 'रोकथाम के सुझाव',
            findSpecialist: 'विशेषज्ञ खोजें',
            topDoctors: 'शीर्ष डॉक्टर',
            recommendedDoctors: 'अनुशंसित डॉक्टर',
            specialistType: 'विशेषज्ञ प्रकार',
            consultSpecialist: 'विशेषज्ञ से परामर्श करें',
            topHospitals: 'शीर्ष अस्पताल',
            recommendedHospitals: 'अनुशंसित अस्पताल',
            treatmentCost: 'उपचार लागत',
            costComparison: 'लागत तुलना',
            costIn: 'में लागत',
            priceRange: 'मूल्य सीमा',
            insuranceCoverage: 'बीमा कवरेज',
            icdCode: 'आईसीडी कोड',
            specialistRequired: 'विशेषज्ञ आवश्यक',
            severity: 'गंभीरता',
            mild: 'हल्का',
            moderate: 'मध्यम',
            severe: 'गंभीर',
            critical: 'अत्यंत गंभीर',
            urgency: 'तात्कालिकता',
            low: 'कम',
            high: 'उच्च',
            emergency: 'आपातकाल',
            seekImmediateCare: 'तुरंत चिकित्सा लें',
        },
    },

    // Spanish translations
    es: {
        common: {
            home: 'Inicio',
            conditions: 'Condiciones',
            treatments: 'Tratamientos',
            doctors: 'Médicos',
            hospitals: 'Hospitales',
            tests: 'Pruebas de Laboratorio',
            symptoms: 'Síntomas',
            analyze: 'Análisis IA',
            about: 'Acerca de',
            contact: 'Contacto',
            pricing: 'Precios',
            login: 'Iniciar Sesión',
            signup: 'Registrarse',
            logout: 'Cerrar Sesión',
            search: 'Buscar',
            searchPlaceholder: 'Buscar condiciones, tratamientos, médicos...',
            findDoctors: 'Encontrar Médicos',
            findHospitals: 'Encontrar Hospitales',
            bookAppointment: 'Reservar Cita',
            getStarted: 'Comenzar',
            learnMore: 'Saber Más',
            readMore: 'Leer Más',
            viewAll: 'Ver Todo',
            seeMore: 'Ver Más',
            showLess: 'Mostrar Menos',
            submit: 'Enviar',
            cancel: 'Cancelar',
            save: 'Guardar',
            edit: 'Editar',
            delete: 'Eliminar',
            close: 'Cerrar',
            back: 'Volver',
            next: 'Siguiente',
            previous: 'Anterior',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            noResults: 'No se encontraron resultados',
            tryAgain: 'Intentar de Nuevo',
            location: 'Ubicación',
            selectCountry: 'Seleccionar País',
            selectCity: 'Seleccionar Ciudad',
            nearYou: 'Cerca de Ti',
            inYourCity: 'En Tu Ciudad',
            specialist: 'Especialista',
            specialists: 'Especialistas',
            consultation: 'Consulta',
            consultationFee: 'Tarifa de Consulta',
            experience: 'Experiencia',
            yearsExperience: 'Años de Experiencia',
            rating: 'Calificación',
            reviews: 'Reseñas',
            verified: 'Verificado',
            available: 'Disponible',
            unavailable: 'No Disponible',
            free: 'Gratis',
            premium: 'Premium',
            price: 'Precio',
            cost: 'Costo',
            costRange: 'Rango de Costo',
            averageCost: 'Costo Promedio',
            estimatedCost: 'Costo Estimado',
            today: 'Hoy',
            tomorrow: 'Mañana',
            thisWeek: 'Esta Semana',
            minutes: 'minutos',
            hours: 'horas',
            days: 'días',
            weeks: 'semanas',
            months: 'meses',
            years: 'años',
            disclaimer: 'Aviso Legal',
            medicalDisclaimer: 'Esta información es solo para fines educativos y no sustituye el consejo médico profesional. Siempre consulte a un proveedor de salud calificado.',
            privacyPolicy: 'Política de Privacidad',
            termsOfService: 'Términos de Servicio',
            allRightsReserved: 'Todos los Derechos Reservados',
            aiAnalysis: 'Análisis IA',
            aiPowered: 'Impulsado por IA',
            analyzeSymptoms: 'Analizar Síntomas',
            getAIAnalysis: 'Obtener Análisis IA',
            aiDisclaimer: 'El análisis de IA no sustituye el diagnóstico médico profesional.',
        },
        condition: {
            whatIs: 'Qué es',
            overview: 'Descripción General',
            symptoms: 'Síntomas',
            causes: 'Causas',
            riskFactors: 'Factores de Riesgo',
            diagnosis: 'Diagnóstico',
            treatment: 'Tratamiento',
            treatmentOptions: 'Opciones de Tratamiento',
            prevention: 'Prevención',
            complications: 'Complicaciones',
            prognosis: 'Pronóstico',
            livingWith: 'Vivir Con',
            whenToSeeDoctor: 'Cuándo Ver al Médico',
            relatedConditions: 'Condiciones Relacionadas',
            frequentlyAskedQuestions: 'Preguntas Frecuentes',
            aboutThisCondition: 'Acerca de Esta Condición',
            commonSymptoms: 'Síntomas Comunes',
            primaryCauses: 'Causas Principales',
            diagnosticTests: 'Pruebas Diagnósticas',
            treatmentApproaches: 'Enfoques de Tratamiento',
            preventionTips: 'Consejos de Prevención',
            findSpecialist: 'Encontrar Especialista',
            topDoctors: 'Mejores Médicos',
            recommendedDoctors: 'Médicos Recomendados',
            specialistType: 'Tipo de Especialista',
            consultSpecialist: 'Consultar Especialista',
            topHospitals: 'Mejores Hospitales',
            recommendedHospitals: 'Hospitales Recomendados',
            treatmentCost: 'Costo del Tratamiento',
            costComparison: 'Comparación de Costos',
            costIn: 'Costo en',
            priceRange: 'Rango de Precios',
            insuranceCoverage: 'Cobertura de Seguro',
            icdCode: 'Código ICD',
            specialistRequired: 'Especialista Requerido',
            severity: 'Gravedad',
            mild: 'Leve',
            moderate: 'Moderado',
            severe: 'Grave',
            critical: 'Crítico',
            urgency: 'Urgencia',
            low: 'Baja',
            high: 'Alta',
            emergency: 'Emergencia',
            seekImmediateCare: 'Busque Atención Inmediata',
        },
    },

    // Arabic translations (RTL)
    ar: {
        common: {
            home: 'الرئيسية',
            conditions: 'الحالات الطبية',
            treatments: 'العلاجات',
            doctors: 'الأطباء',
            hospitals: 'المستشفيات',
            tests: 'الفحوصات المخبرية',
            symptoms: 'الأعراض',
            analyze: 'تحليل الذكاء الاصطناعي',
            about: 'عن الموقع',
            contact: 'اتصل بنا',
            pricing: 'الأسعار',
            login: 'تسجيل الدخول',
            signup: 'إنشاء حساب',
            logout: 'تسجيل الخروج',
            search: 'بحث',
            searchPlaceholder: 'ابحث عن الحالات والعلاجات والأطباء...',
            findDoctors: 'البحث عن أطباء',
            findHospitals: 'البحث عن مستشفيات',
            bookAppointment: 'حجز موعد',
            getStarted: 'ابدأ الآن',
            learnMore: 'اعرف المزيد',
            readMore: 'اقرأ المزيد',
            viewAll: 'عرض الكل',
            seeMore: 'المزيد',
            showLess: 'عرض أقل',
            submit: 'إرسال',
            cancel: 'إلغاء',
            save: 'حفظ',
            edit: 'تعديل',
            delete: 'حذف',
            close: 'إغلاق',
            back: 'رجوع',
            next: 'التالي',
            previous: 'السابق',
            loading: 'جاري التحميل...',
            error: 'خطأ',
            success: 'نجاح',
            noResults: 'لم يتم العثور على نتائج',
            tryAgain: 'حاول مرة أخرى',
            location: 'الموقع',
            selectCountry: 'اختر الدولة',
            selectCity: 'اختر المدينة',
            nearYou: 'بالقرب منك',
            inYourCity: 'في مدينتك',
            specialist: 'أخصائي',
            specialists: 'أخصائيون',
            consultation: 'استشارة',
            consultationFee: 'رسوم الاستشارة',
            experience: 'الخبرة',
            yearsExperience: 'سنوات الخبرة',
            rating: 'التقييم',
            reviews: 'المراجعات',
            verified: 'موثق',
            available: 'متاح',
            unavailable: 'غير متاح',
            free: 'مجاني',
            premium: 'مميز',
            price: 'السعر',
            cost: 'التكلفة',
            costRange: 'نطاق التكلفة',
            averageCost: 'متوسط التكلفة',
            estimatedCost: 'التكلفة المقدرة',
            today: 'اليوم',
            tomorrow: 'غداً',
            thisWeek: 'هذا الأسبوع',
            minutes: 'دقائق',
            hours: 'ساعات',
            days: 'أيام',
            weeks: 'أسابيع',
            months: 'أشهر',
            years: 'سنوات',
            disclaimer: 'إخلاء المسؤولية',
            medicalDisclaimer: 'هذه المعلومات لأغراض تعليمية فقط وليست بديلاً عن الاستشارة الطبية المتخصصة. استشر دائماً مقدم رعاية صحية مؤهل.',
            privacyPolicy: 'سياسة الخصوصية',
            termsOfService: 'شروط الخدمة',
            allRightsReserved: 'جميع الحقوق محفوظة',
            aiAnalysis: 'تحليل الذكاء الاصطناعي',
            aiPowered: 'مدعوم بالذكاء الاصطناعي',
            analyzeSymptoms: 'تحليل الأعراض',
            getAIAnalysis: 'احصل على تحليل الذكاء الاصطناعي',
            aiDisclaimer: 'تحليل الذكاء الاصطناعي ليس بديلاً عن التشخيص الطبي المتخصص.',
        },
        condition: {
            whatIs: 'ما هو',
            overview: 'نظرة عامة',
            symptoms: 'الأعراض',
            causes: 'الأسباب',
            riskFactors: 'عوامل الخطر',
            diagnosis: 'التشخيص',
            treatment: 'العلاج',
            treatmentOptions: 'خيارات العلاج',
            prevention: 'الوقاية',
            complications: 'المضاعفات',
            prognosis: 'التوقعات',
            livingWith: 'التعايش مع',
            whenToSeeDoctor: 'متى تزور الطبيب',
            relatedConditions: 'حالات ذات صلة',
            frequentlyAskedQuestions: 'الأسئلة الشائعة',
            aboutThisCondition: 'عن هذه الحالة',
            commonSymptoms: 'الأعراض الشائعة',
            primaryCauses: 'الأسباب الرئيسية',
            diagnosticTests: 'الفحوصات التشخيصية',
            treatmentApproaches: 'طرق العلاج',
            preventionTips: 'نصائح للوقاية',
            findSpecialist: 'البحث عن أخصائي',
            topDoctors: 'أفضل الأطباء',
            recommendedDoctors: 'أطباء موصى بهم',
            specialistType: 'نوع التخصص',
            consultSpecialist: 'استشر أخصائي',
            topHospitals: 'أفضل المستشفيات',
            recommendedHospitals: 'مستشفيات موصى بها',
            treatmentCost: 'تكلفة العلاج',
            costComparison: 'مقارنة التكاليف',
            costIn: 'التكلفة في',
            priceRange: 'نطاق السعر',
            insuranceCoverage: 'تغطية التأمين',
            icdCode: 'رمز التصنيف الدولي',
            specialistRequired: 'يتطلب أخصائي',
            severity: 'الشدة',
            mild: 'خفيف',
            moderate: 'متوسط',
            severe: 'شديد',
            critical: 'حرج',
            urgency: 'الإلحاح',
            low: 'منخفض',
            high: 'مرتفع',
            emergency: 'طوارئ',
            seekImmediateCare: 'اطلب الرعاية الفورية',
        },
    },

    // Bengali translations
    bn: {
        common: {
            home: 'হোম',
            conditions: 'রোগ',
            treatments: 'চিকিৎসা',
            doctors: 'ডাক্তার',
            hospitals: 'হাসপাতাল',
            tests: 'ল্যাব টেস্ট',
            symptoms: 'লক্ষণ',
            analyze: 'এআই বিশ্লেষণ',
            about: 'আমাদের সম্পর্কে',
            contact: 'যোগাযোগ',
            pricing: 'মূল্য',
            login: 'লগইন',
            signup: 'সাইন আপ',
            logout: 'লগআউট',
            search: 'অনুসন্ধান',
            searchPlaceholder: 'রোগ, চিকিৎসা, ডাক্তার খুঁজুন...',
            findDoctors: 'ডাক্তার খুঁজুন',
            findHospitals: 'হাসপাতাল খুঁজুন',
            bookAppointment: 'অ্যাপয়েন্টমেন্ট বুক করুন',
            getStarted: 'শুরু করুন',
            learnMore: 'আরও জানুন',
            readMore: 'আরও পড়ুন',
            viewAll: 'সব দেখুন',
            submit: 'জমা দিন',
            cancel: 'বাতিল',
            save: 'সংরক্ষণ',
            loading: 'লোড হচ্ছে...',
            error: 'ত্রুটি',
            success: 'সফল',
            noResults: 'কোন ফলাফল পাওয়া যায়নি',
            location: 'অবস্থান',
            selectCountry: 'দেশ নির্বাচন করুন',
            specialist: 'বিশেষজ্ঞ',
            consultation: 'পরামর্শ',
            experience: 'অভিজ্ঞতা',
            rating: 'রেটিং',
            reviews: 'রিভিউ',
            verified: 'যাচাইকৃত',
            free: 'বিনামূল্যে',
            price: 'মূল্য',
            cost: 'খরচ',
            disclaimer: 'দাবিত্যাগ',
            medicalDisclaimer: 'এই তথ্য শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে এবং পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়। সর্বদা একজন যোগ্য স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন।',
            aiAnalysis: 'এআই বিশ্লেষণ',
        },
        condition: {
            whatIs: 'কি',
            overview: 'সংক্ষিপ্ত বিবরণ',
            symptoms: 'লক্ষণ',
            causes: 'কারণ',
            riskFactors: 'ঝুঁকির কারণ',
            diagnosis: 'রোগ নির্ণয়',
            treatment: 'চিকিৎসা',
            prevention: 'প্রতিরোধ',
            complications: 'জটিলতা',
            findSpecialist: 'বিশেষজ্ঞ খুঁজুন',
            topDoctors: 'সেরা ডাক্তার',
            topHospitals: 'সেরা হাসপাতাল',
            treatmentCost: 'চিকিৎসা খরচ',
            severity: 'তীব্রতা',
            mild: 'হালকা',
            moderate: 'মাঝারি',
            severe: 'গুরুতর',
            emergency: 'জরুরি',
        },
    },

    // French translations
    fr: {
        common: {
            home: 'Accueil',
            conditions: 'Pathologies',
            treatments: 'Traitements',
            doctors: 'Médecins',
            hospitals: 'Hôpitaux',
            tests: 'Analyses de Laboratoire',
            symptoms: 'Symptômes',
            analyze: 'Analyse IA',
            about: 'À Propos',
            contact: 'Contact',
            pricing: 'Tarifs',
            login: 'Connexion',
            signup: 'Inscription',
            logout: 'Déconnexion',
            search: 'Rechercher',
            searchPlaceholder: 'Rechercher pathologies, traitements, médecins...',
            findDoctors: 'Trouver des Médecins',
            findHospitals: 'Trouver des Hôpitaux',
            bookAppointment: 'Prendre Rendez-vous',
            getStarted: 'Commencer',
            learnMore: 'En Savoir Plus',
            readMore: 'Lire la Suite',
            viewAll: 'Voir Tout',
            submit: 'Envoyer',
            cancel: 'Annuler',
            save: 'Enregistrer',
            loading: 'Chargement...',
            error: 'Erreur',
            success: 'Succès',
            noResults: 'Aucun résultat trouvé',
            location: 'Localisation',
            selectCountry: 'Sélectionner un Pays',
            specialist: 'Spécialiste',
            consultation: 'Consultation',
            experience: 'Expérience',
            rating: 'Note',
            reviews: 'Avis',
            verified: 'Vérifié',
            free: 'Gratuit',
            price: 'Prix',
            cost: 'Coût',
            disclaimer: 'Avertissement',
            medicalDisclaimer: 'Ces informations sont fournies à titre éducatif uniquement et ne remplacent pas un avis médical professionnel. Consultez toujours un professionnel de santé qualifié.',
            aiAnalysis: 'Analyse IA',
        },
        condition: {
            whatIs: 'Qu\'est-ce que',
            overview: 'Aperçu',
            symptoms: 'Symptômes',
            causes: 'Causes',
            riskFactors: 'Facteurs de Risque',
            diagnosis: 'Diagnostic',
            treatment: 'Traitement',
            prevention: 'Prévention',
            complications: 'Complications',
            findSpecialist: 'Trouver un Spécialiste',
            topDoctors: 'Meilleurs Médecins',
            topHospitals: 'Meilleurs Hôpitaux',
            treatmentCost: 'Coût du Traitement',
            severity: 'Gravité',
            mild: 'Léger',
            moderate: 'Modéré',
            severe: 'Sévère',
            emergency: 'Urgence',
        },
    },

    // Portuguese translations
    pt: {
        common: {
            home: 'Início',
            conditions: 'Condições',
            treatments: 'Tratamentos',
            doctors: 'Médicos',
            hospitals: 'Hospitais',
            tests: 'Exames Laboratoriais',
            symptoms: 'Sintomas',
            analyze: 'Análise IA',
            about: 'Sobre',
            contact: 'Contato',
            pricing: 'Preços',
            login: 'Entrar',
            signup: 'Cadastrar',
            logout: 'Sair',
            search: 'Pesquisar',
            searchPlaceholder: 'Pesquisar condições, tratamentos, médicos...',
            findDoctors: 'Encontrar Médicos',
            findHospitals: 'Encontrar Hospitais',
            bookAppointment: 'Agendar Consulta',
            getStarted: 'Começar',
            learnMore: 'Saiba Mais',
            readMore: 'Leia Mais',
            viewAll: 'Ver Tudo',
            submit: 'Enviar',
            cancel: 'Cancelar',
            save: 'Salvar',
            loading: 'Carregando...',
            error: 'Erro',
            success: 'Sucesso',
            noResults: 'Nenhum resultado encontrado',
            location: 'Localização',
            selectCountry: 'Selecionar País',
            specialist: 'Especialista',
            consultation: 'Consulta',
            experience: 'Experiência',
            rating: 'Avaliação',
            reviews: 'Avaliações',
            verified: 'Verificado',
            free: 'Grátis',
            price: 'Preço',
            cost: 'Custo',
            disclaimer: 'Aviso Legal',
            medicalDisclaimer: 'Estas informações são apenas para fins educacionais e não substituem o aconselhamento médico profissional. Sempre consulte um profissional de saúde qualificado.',
            aiAnalysis: 'Análise IA',
        },
        condition: {
            whatIs: 'O que é',
            overview: 'Visão Geral',
            symptoms: 'Sintomas',
            causes: 'Causas',
            riskFactors: 'Fatores de Risco',
            diagnosis: 'Diagnóstico',
            treatment: 'Tratamento',
            prevention: 'Prevenção',
            complications: 'Complicações',
            findSpecialist: 'Encontrar Especialista',
            topDoctors: 'Melhores Médicos',
            topHospitals: 'Melhores Hospitais',
            treatmentCost: 'Custo do Tratamento',
            severity: 'Gravidade',
            mild: 'Leve',
            moderate: 'Moderado',
            severe: 'Grave',
            emergency: 'Emergência',
        },
    },

    // German translations
    de: {
        common: {
            home: 'Startseite',
            conditions: 'Erkrankungen',
            treatments: 'Behandlungen',
            doctors: 'Ärzte',
            hospitals: 'Krankenhäuser',
            tests: 'Laboruntersuchungen',
            symptoms: 'Symptome',
            analyze: 'KI-Analyse',
            about: 'Über uns',
            contact: 'Kontakt',
            pricing: 'Preise',
            login: 'Anmelden',
            signup: 'Registrieren',
            logout: 'Abmelden',
            search: 'Suchen',
            searchPlaceholder: 'Erkrankungen, Behandlungen, Ärzte suchen...',
            findDoctors: 'Ärzte finden',
            findHospitals: 'Krankenhäuser finden',
            bookAppointment: 'Termin buchen',
            getStarted: 'Loslegen',
            learnMore: 'Mehr erfahren',
            readMore: 'Weiterlesen',
            viewAll: 'Alle anzeigen',
            submit: 'Absenden',
            cancel: 'Abbrechen',
            save: 'Speichern',
            loading: 'Wird geladen...',
            error: 'Fehler',
            success: 'Erfolg',
            noResults: 'Keine Ergebnisse gefunden',
            location: 'Standort',
            selectCountry: 'Land auswählen',
            specialist: 'Spezialist',
            consultation: 'Beratung',
            experience: 'Erfahrung',
            rating: 'Bewertung',
            reviews: 'Bewertungen',
            verified: 'Verifiziert',
            free: 'Kostenlos',
            price: 'Preis',
            cost: 'Kosten',
            disclaimer: 'Haftungsausschluss',
            medicalDisclaimer: 'Diese Informationen dienen nur zu Bildungszwecken und ersetzen keine professionelle medizinische Beratung. Konsultieren Sie immer einen qualifizierten Gesundheitsdienstleister.',
            aiAnalysis: 'KI-Analyse',
        },
        condition: {
            whatIs: 'Was ist',
            overview: 'Überblick',
            symptoms: 'Symptome',
            causes: 'Ursachen',
            riskFactors: 'Risikofaktoren',
            diagnosis: 'Diagnose',
            treatment: 'Behandlung',
            prevention: 'Prävention',
            complications: 'Komplikationen',
            findSpecialist: 'Spezialisten finden',
            topDoctors: 'Top-Ärzte',
            topHospitals: 'Top-Krankenhäuser',
            treatmentCost: 'Behandlungskosten',
            severity: 'Schweregrad',
            mild: 'Leicht',
            moderate: 'Mittel',
            severe: 'Schwer',
            emergency: 'Notfall',
        },
    },

    // Tamil translations
    ta: {
        common: {
            home: 'முகப்பு',
            conditions: 'நோய்கள்',
            treatments: 'சிகிச்சைகள்',
            doctors: 'மருத்துவர்கள்',
            hospitals: 'மருத்துவமனைகள்',
            tests: 'ஆய்வக பரிசோதனைகள்',
            symptoms: 'அறிகுறிகள்',
            analyze: 'AI பகுப்பாய்வு',
            about: 'எங்களைப் பற்றி',
            contact: 'தொடர்பு',
            search: 'தேடு',
            findDoctors: 'மருத்துவர்களைக் கண்டறிக',
            findHospitals: 'மருத்துவமனைகளைக் கண்டறிக',
            bookAppointment: 'சந்திப்பு முன்பதிவு',
            learnMore: 'மேலும் அறிக',
            readMore: 'மேலும் படிக்க',
            viewAll: 'அனைத்தையும் காண்க',
            loading: 'ஏற்றுகிறது...',
            error: 'பிழை',
            success: 'வெற்றி',
            noResults: 'முடிவுகள் இல்லை',
            location: 'இடம்',
            specialist: 'நிபுணர்',
            consultation: 'ஆலோசனை',
            experience: 'அனுபவம்',
            rating: 'மதிப்பீடு',
            verified: 'சரிபார்க்கப்பட்டது',
            free: 'இலவசம்',
            price: 'விலை',
            disclaimer: 'மறுப்பு',
            medicalDisclaimer: 'இந்த தகவல் கல்வி நோக்கங்களுக்காக மட்டுமே. எப்போதும் தகுதிவாய்ந்த மருத்துவரை அணுகவும்.',
        },
        condition: {
            whatIs: 'என்ன',
            overview: 'கண்ணோட்டம்',
            symptoms: 'அறிகுறிகள்',
            causes: 'காரணங்கள்',
            diagnosis: 'நோய் கண்டறிதல்',
            treatment: 'சிகிச்சை',
            prevention: 'தடுப்பு',
            findSpecialist: 'நிபுணரைக் கண்டறிக',
            topDoctors: 'சிறந்த மருத்துவர்கள்',
            topHospitals: 'சிறந்த மருத்துவமனைகள்',
            treatmentCost: 'சிகிச்சை செலவு',
            severity: 'தீவிரம்',
            mild: 'லேசான',
            moderate: 'மிதமான',
            severe: 'கடுமையான',
            emergency: 'அவசரம்',
        },
    },

    // Telugu translations
    te: {
        common: {
            home: 'హోమ్',
            conditions: 'వ్యాధులు',
            treatments: 'చికిత్సలు',
            doctors: 'వైద్యులు',
            hospitals: 'ఆసుపత్రులు',
            tests: 'ల్యాబ్ పరీక్షలు',
            symptoms: 'లక్షణాలు',
            analyze: 'AI విశ్లేషణ',
            search: 'వెతకండి',
            findDoctors: 'వైద్యులను కనుగొనండి',
            findHospitals: 'ఆసుపత్రులను కనుగొనండి',
            bookAppointment: 'అపాయింట్‌మెంట్ బుక్ చేయండి',
            learnMore: 'మరింత తెలుసుకోండి',
            readMore: 'మరింత చదవండి',
            loading: 'లోడ్ అవుతోంది...',
            error: 'లోపం',
            location: 'స్థానం',
            specialist: 'నిపుణుడు',
            consultation: 'సంప్రదింపు',
            experience: 'అనుభవం',
            rating: 'రేటింగ్',
            verified: 'ధృవీకరించబడింది',
            free: 'ఉచితం',
            price: 'ధర',
            disclaimer: 'నిరాకరణ',
        },
        condition: {
            whatIs: 'ఏమిటి',
            overview: 'అవలోకనం',
            symptoms: 'లక్షణాలు',
            causes: 'కారణాలు',
            diagnosis: 'రోగనిర్ధారణ',
            treatment: 'చికిత్స',
            prevention: 'నివారణ',
            findSpecialist: 'నిపుణుడిని కనుగొనండి',
            topDoctors: 'టాప్ వైద్యులు',
            treatmentCost: 'చికిత్స ఖర్చు',
            severity: 'తీవ్రత',
        },
    },

    // Urdu translations (RTL)
    ur: {
        common: {
            home: 'ہوم',
            conditions: 'بیماریاں',
            treatments: 'علاج',
            doctors: 'ڈاکٹر',
            hospitals: 'ہسپتال',
            tests: 'لیب ٹیسٹ',
            symptoms: 'علامات',
            analyze: 'اے آئی تجزیہ',
            search: 'تلاش کریں',
            findDoctors: 'ڈاکٹر تلاش کریں',
            findHospitals: 'ہسپتال تلاش کریں',
            bookAppointment: 'اپائنٹمنٹ بک کریں',
            learnMore: 'مزید جانیں',
            readMore: 'مزید پڑھیں',
            loading: 'لوڈ ہو رہا ہے...',
            error: 'خرابی',
            location: 'مقام',
            specialist: 'ماہر',
            consultation: 'مشاورت',
            experience: 'تجربہ',
            rating: 'درجہ بندی',
            verified: 'تصدیق شدہ',
            free: 'مفت',
            price: 'قیمت',
            disclaimer: 'دستبرداری',
            medicalDisclaimer: 'یہ معلومات صرف تعلیمی مقاصد کے لیے ہیں۔ ہمیشہ کسی مستند ڈاکٹر سے مشورہ کریں۔',
        },
        condition: {
            whatIs: 'کیا ہے',
            overview: 'جائزہ',
            symptoms: 'علامات',
            causes: 'وجوہات',
            diagnosis: 'تشخیص',
            treatment: 'علاج',
            prevention: 'روک تھام',
            findSpecialist: 'ماہر تلاش کریں',
            topDoctors: 'بہترین ڈاکٹر',
            treatmentCost: 'علاج کی لاگت',
            severity: 'شدت',
            emergency: 'ایمرجنسی',
        },
    },
};

// Add English as base
TRANSLATIONS['en'] = EN_TRANSLATIONS;

// ═══════════════════════════════════════════════════════════════════════════════
// SEEDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function seedLanguages() {
    console.log('📝 Seeding languages...');

    for (const lang of LANGUAGES) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: {
                name: lang.name,
                nativeName: lang.nativeName,
                isActive: true,
            },
            create: {
                code: lang.code,
                name: lang.name,
                nativeName: lang.nativeName,
                isActive: true,
            },
        });
        console.log(`  ✓ ${lang.name} (${lang.code})`);
    }

    console.log(`✅ Seeded ${LANGUAGES.length} languages\n`);
}

async function seedTranslations() {
    console.log('📝 Seeding translations...');

    let totalCount = 0;

    for (const [langCode, namespaces] of Object.entries(TRANSLATIONS)) {
        console.log(`\n  Processing ${langCode}...`);
        let langCount = 0;

        for (const [namespace, translations] of Object.entries(namespaces)) {
            for (const [key, value] of Object.entries(translations)) {
                try {
                    await prisma.uiTranslation.upsert({
                        where: {
                            languageCode_namespace_key: {
                                languageCode: langCode,
                                namespace,
                                key,
                            },
                        },
                        update: { value },
                        create: {
                            languageCode: langCode,
                            namespace,
                            key,
                            value,
                        },
                    });
                    langCount++;
                } catch (error) {
                    // Language might not exist yet, skip
                    console.error(`    ⚠ Failed: ${langCode}/${namespace}/${key}`);
                }
            }
        }

        console.log(`    ✓ ${langCount} translations for ${langCode}`);
        totalCount += langCount;
    }

    console.log(`\n✅ Seeded ${totalCount} total translations\n`);
}

async function main() {
    console.log('🌐 Starting Translation Seeding\n');
    console.log('=' .repeat(50));

    try {
        await seedLanguages();
        await seedTranslations();

        console.log('=' .repeat(50));
        console.log('✅ Translation seeding complete!\n');

        // Summary
        const langCount = await prisma.language.count();
        const transCount = await prisma.uiTranslation.count();

        console.log('📊 Summary:');
        console.log(`   Languages: ${langCount}`);
        console.log(`   Translations: ${transCount}`);

    } catch (error) {
        console.error('❌ Error seeding translations:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
