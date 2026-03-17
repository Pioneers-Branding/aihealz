/**
 * Hospital & Insurance Content Generation Script
 * Generates comprehensive content for hospitals and insurance providers across countries
 */

import { PrismaClient, HospitalType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════════════════
// HOSPITAL DATA BY COUNTRY
// ═══════════════════════════════════════════════════════════════════════════

interface HospitalData {
    name: string;
    slug: string;
    type: HospitalType;
    city: string;
    state: string;
    country: string;
    establishedYear: number;
    bedCount: number;
    icuBeds: number;
    operationTheaters: number;
    accreditations: string[];
    description: string;
    tagline: string;
    parentOrganization?: string;
    ownershipType: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    emergencyPhone?: string;
    website?: string;
    googleBusinessUrl?: string;
    equipment: string[];
    specialties: string[];
    prosForPatients: string[];
    consForPatients: string[];
    awards?: { year: number; award: string; org: string }[];
    scandals?: { year: number; title: string; description: string }[];
    notablePatients?: { name: string; category: string; treatment?: string }[];
    testPrices?: Record<string, { inr: number; usd: number; gbp: number; aed: number }>;
}

// ─── India Hospitals ─────────────────────────────────────────────────────────

const INDIA_HOSPITALS: HospitalData[] = [
    {
        name: 'Apollo Hospitals Chennai',
        slug: 'apollo-hospitals-chennai',
        type: 'corporate_chain',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'IN',
        establishedYear: 1983,
        bedCount: 550,
        icuBeds: 150,
        operationTheaters: 18,
        accreditations: ['JCI', 'NABH', 'NABL'],
        description: `Apollo Hospitals Chennai is the flagship hospital of Apollo Hospitals Group, India's largest healthcare provider. Established in 1983 by Dr. Prathap C. Reddy, it was Asia's first corporate hospital and pioneered the concept of private healthcare in India.

The hospital is renowned for its Centers of Excellence in Cardiac Sciences, Orthopedics, Neurosciences, Oncology, and Organ Transplantation. It performs over 15,000 cardiac surgeries and 2,500 organ transplants annually, making it one of the highest-volume transplant centers globally.

With state-of-the-art technology including the da Vinci Robotic Surgery System, 3T MRI, PET-CT, and CyberKnife, Apollo Chennai attracts medical tourists from 140+ countries. The hospital's Proton Therapy Center is the first in South Asia.`,
        tagline: 'Where Patients Come First',
        parentOrganization: 'Apollo Hospitals Enterprise Limited',
        ownershipType: 'Corporate',
        latitude: 13.0604,
        longitude: 80.2496,
        phone: '+91-44-2829-0200',
        emergencyPhone: '1066',
        website: 'https://www.apollohospitals.com',
        googleBusinessUrl: 'https://g.page/apollo-hospitals-chennai',
        equipment: [
            'da Vinci Xi Robotic Surgical System',
            '3 Tesla MRI Scanner',
            '256-Slice CT Scanner',
            'PET-CT Scanner',
            'CyberKnife Radiosurgery System',
            'TrueBeam Linear Accelerator',
            'Proton Therapy System',
            'ECMO Machines',
            'Hybrid Cath Labs',
            'Digital Angiography Suite'
        ],
        specialties: ['Cardiac Surgery', 'Oncology', 'Organ Transplant', 'Neurosurgery', 'Orthopedics', 'Gastroenterology'],
        prosForPatients: [
            'World-class infrastructure and technology',
            'Highly experienced surgeons with international training',
            'Comprehensive international patient services',
            'Short waiting times for procedures',
            '24/7 pharmacy and emergency services'
        ],
        consForPatients: [
            'Premium pricing compared to other hospitals',
            'Can be crowded in OPD areas',
            'Parking can be challenging during peak hours'
        ],
        awards: [
            { year: 2023, award: 'Best Multi-Specialty Hospital', org: 'Times Health Survey' },
            { year: 2022, award: 'Excellence in Cardiac Care', org: 'FICCI Healthcare Awards' },
            { year: 2021, award: 'Best Hospital for Medical Tourism', org: 'MTQUA' }
        ],
        notablePatients: [
            { name: 'Multiple Chief Ministers', category: 'Political Leaders', treatment: 'Various surgeries' },
            { name: 'International Cricketers', category: 'Sports Personalities', treatment: 'Orthopedic surgeries' }
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 350, usd: 4, gbp: 3, aed: 15 },
            'Lipid Profile': { inr: 600, usd: 7, gbp: 6, aed: 26 },
            'Liver Function Test': { inr: 800, usd: 10, gbp: 8, aed: 35 },
            'Thyroid Profile': { inr: 1000, usd: 12, gbp: 10, aed: 44 },
            'CT Scan Brain': { inr: 3500, usd: 42, gbp: 33, aed: 154 },
            'MRI Brain': { inr: 8000, usd: 96, gbp: 76, aed: 352 },
            'PET-CT Scan': { inr: 25000, usd: 300, gbp: 238, aed: 1100 },
            'Coronary Angiography': { inr: 15000, usd: 180, gbp: 143, aed: 660 },
            'Full Body Health Checkup': { inr: 5500, usd: 66, gbp: 52, aed: 242 }
        }
    },
    {
        name: 'Fortis Memorial Research Institute',
        slug: 'fortis-memorial-research-institute-gurgaon',
        type: 'corporate_chain',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'IN',
        establishedYear: 2001,
        bedCount: 1000,
        icuBeds: 300,
        operationTheaters: 25,
        accreditations: ['JCI', 'NABH', 'NABL', 'ISO 9001'],
        description: `Fortis Memorial Research Institute (FMRI) in Gurugram is a multi-super specialty quaternary care hospital and one of the largest private hospitals in India. It is the flagship hospital of Fortis Healthcare, one of India's leading healthcare providers.

FMRI is recognized as a leader in Bone Marrow Transplant, Cardiac Sciences, Neurosciences, Renal Sciences, and Oncology. The hospital has performed over 5,000 bone marrow transplants, making it one of the most experienced transplant centers in Asia.

The hospital features advanced diagnostic and therapeutic equipment including multiple Robotic Surgery systems, CyberKnife, and the latest generation CT and MRI scanners. Its dedicated International Patient Services wing serves patients from over 50 countries.`,
        tagline: 'Advanced Medicine, Personal Care',
        parentOrganization: 'Fortis Healthcare Limited',
        ownershipType: 'Corporate',
        latitude: 28.4431,
        longitude: 77.0413,
        phone: '+91-124-496-2222',
        emergencyPhone: '+91-124-496-2000',
        website: 'https://www.fortishealthcare.com/fmri',
        googleBusinessUrl: 'https://g.page/fortis-memorial-gurgaon',
        equipment: [
            'da Vinci Xi Robotic Surgery System',
            '3 Tesla MRI with AI Analysis',
            '640-Slice Aquilion One CT Scanner',
            'CyberKnife M6 Radiosurgery',
            'TrueBeam STx Linear Accelerator',
            'PET-CT Scanner',
            'Bi-plane Cath Lab',
            'ECMO Support',
            'Novalis Tx Radiosurgery'
        ],
        specialties: ['Bone Marrow Transplant', 'Cardiac Surgery', 'Neurosurgery', 'Oncology', 'Kidney Transplant', 'Joint Replacement'],
        prosForPatients: [
            'Largest BMT program in India',
            'State-of-the-art quaternary care facility',
            'Dedicated international patient lounge',
            'Comprehensive rehabilitation services',
            'Metro connectivity'
        ],
        consForPatients: [
            'High cost of treatment',
            'Long wait times for popular doctors',
            'Traffic congestion in area during peak hours'
        ],
        awards: [
            { year: 2023, award: 'Best Multi-Specialty Hospital North India', org: 'CNBC' },
            { year: 2022, award: 'Excellence in BMT', org: 'Economic Times Healthcare Awards' }
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 400, usd: 5, gbp: 4, aed: 18 },
            'Lipid Profile': { inr: 700, usd: 8, gbp: 7, aed: 31 },
            'HbA1c': { inr: 500, usd: 6, gbp: 5, aed: 22 },
            'MRI Spine': { inr: 9000, usd: 108, gbp: 86, aed: 396 },
            'CT Angiography': { inr: 12000, usd: 144, gbp: 114, aed: 528 },
            'PET-CT Scan': { inr: 28000, usd: 336, gbp: 267, aed: 1232 }
        }
    },
    {
        name: 'AIIMS Delhi',
        slug: 'aiims-delhi',
        type: 'government',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'IN',
        establishedYear: 1956,
        bedCount: 2478,
        icuBeds: 400,
        operationTheaters: 45,
        accreditations: ['NABH'],
        description: `All India Institute of Medical Sciences (AIIMS) Delhi is India's premier government medical institution and hospital. Established in 1956, it serves as the apex healthcare institution in the country and is an Institute of National Importance under the AIIMS Act.

AIIMS Delhi is renowned for providing highly subsidized world-class healthcare, making advanced treatments accessible to all sections of society. It handles over 10,000 OPD patients daily and performs complex surgeries at a fraction of private hospital costs.

The institution has pioneered numerous medical breakthroughs in India including the country's first heart transplant and several innovative surgical techniques. It remains the most sought-after destination for medical education and research in India.`,
        tagline: 'Service to Humanity',
        ownershipType: 'Government',
        latitude: 28.5670,
        longitude: 77.2100,
        phone: '+91-11-2658-8500',
        emergencyPhone: '+91-11-2658-8700',
        website: 'https://www.aiims.edu',
        googleBusinessUrl: 'https://g.page/aiims-delhi',
        equipment: [
            '3 Tesla MRI Scanner',
            '128-Slice CT Scanner',
            'PET-CT Scanner',
            'Linear Accelerator',
            'Gamma Knife',
            'Robotic Surgery System',
            'ECMO Support',
            'Cardiac Cath Labs'
        ],
        specialties: ['All Major Specialties', 'Cardiac Surgery', 'Neurosurgery', 'Oncology', 'Burns & Plastic Surgery', 'Trauma Care'],
        prosForPatients: [
            'Highly subsidized treatment costs',
            'Best medical faculty in India',
            'Pioneering research and treatments',
            'Comprehensive care under one roof',
            'Excellent outcomes in complex cases'
        ],
        consForPatients: [
            'Extremely long waiting lists',
            'Overcrowded OPD and wards',
            'Limited individual attention due to patient volume',
            'Bureaucratic processes',
            'Basic amenities compared to private hospitals'
        ],
        scandals: [
            { year: 2019, title: 'Fire incidents in patient areas', description: 'Multiple minor fire incidents raised safety concerns' },
            { year: 2017, title: 'Overcrowding and patient management issues', description: 'Patient overflow leading to management challenges' }
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 50, usd: 1, gbp: 1, aed: 2 },
            'Lipid Profile': { inr: 100, usd: 1, gbp: 1, aed: 4 },
            'Liver Function Test': { inr: 100, usd: 1, gbp: 1, aed: 4 },
            'MRI Brain': { inr: 1500, usd: 18, gbp: 14, aed: 66 },
            'CT Scan': { inr: 500, usd: 6, gbp: 5, aed: 22 },
            'PET-CT Scan': { inr: 8000, usd: 96, gbp: 76, aed: 352 }
        }
    },
    {
        name: 'Medanta - The Medicity',
        slug: 'medanta-the-medicity-gurgaon',
        type: 'corporate_chain',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'IN',
        establishedYear: 2009,
        bedCount: 1600,
        icuBeds: 350,
        operationTheaters: 45,
        accreditations: ['JCI', 'NABH', 'NABL'],
        description: `Medanta - The Medicity is one of India's largest multi-super specialty hospitals, founded by renowned cardiac surgeon Dr. Naresh Trehan. Spread across 43 acres, it is designed to provide integrated healthcare with emphasis on research and education.

The hospital is home to 45+ super-specialty institutes under one roof and is particularly renowned for its cardiac sciences program, which has achieved outcomes comparable to the best centers in the world. Dr. Trehan and his team have performed over 50,000 cardiac surgeries.

Medanta has established itself as a leader in robotic surgery with multiple da Vinci systems, and its Kidney & Urology Institute is one of the highest-volume transplant programs in the country.`,
        tagline: 'We Care We Cure',
        parentOrganization: 'Global Health Private Limited',
        ownershipType: 'Corporate',
        latitude: 28.4395,
        longitude: 77.0266,
        phone: '+91-124-414-1414',
        emergencyPhone: '+91-124-414-1414',
        website: 'https://www.medanta.org',
        googleBusinessUrl: 'https://g.page/medanta-gurgaon',
        equipment: [
            'Multiple da Vinci Xi Robotic Systems',
            '3 Tesla MRI with Cardiac Imaging',
            '320-Slice CT Scanner',
            'PET-CT Scanner',
            'CyberKnife',
            'Versa HD Linear Accelerator',
            'Hybrid Operating Rooms',
            'ECMO Fleet'
        ],
        specialties: ['Cardiac Sciences', 'Neurosciences', 'Kidney & Urology', 'Liver Transplant', 'Cancer Institute', 'Orthopedics'],
        prosForPatients: [
            'Dr. Naresh Trehan and renowned specialists',
            'High success rates in cardiac surgery',
            'Integrated care across specialties',
            'Modern campus with patient amenities',
            'Strong international patient program'
        ],
        consForPatients: [
            'Premium pricing',
            'Can feel impersonal due to size',
            'Located outside Delhi, traffic issues'
        ],
        awards: [
            { year: 2023, award: 'Best Cardiac Care Hospital', org: 'Outlook Health Awards' },
            { year: 2022, award: 'Excellence in Kidney Transplant', org: 'Times Health Survey' }
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 450, usd: 5, gbp: 4, aed: 20 },
            'Lipid Profile': { inr: 750, usd: 9, gbp: 7, aed: 33 },
            'Cardiac CT': { inr: 15000, usd: 180, gbp: 143, aed: 660 },
            'MRI Heart': { inr: 12000, usd: 144, gbp: 114, aed: 528 },
            'Full Body PET-CT': { inr: 30000, usd: 360, gbp: 286, aed: 1320 }
        }
    },
    {
        name: 'Tata Memorial Hospital',
        slug: 'tata-memorial-hospital-mumbai',
        type: 'trust',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'IN',
        establishedYear: 1941,
        bedCount: 674,
        icuBeds: 100,
        operationTheaters: 15,
        accreditations: ['NABH', 'NABL'],
        description: `Tata Memorial Hospital (TMH) is India's oldest and largest cancer treatment and research center, established in 1941 as a memorial to Lady Meherbai Tata. It operates under the Department of Atomic Energy and is a grant-in-aid institution.

TMH is recognized globally for its pioneering work in cancer treatment, particularly in treating cancers prevalent in India such as oral cancer, breast cancer, and cervical cancer. It provides highly subsidized treatment, with more than 60% of patients treated free or at significantly reduced costs.

The hospital treats over 60,000 new cancer patients annually and has contributed significantly to cancer research through the Tata Memorial Centre which includes the Advanced Centre for Treatment, Research and Education in Cancer (ACTREC).`,
        tagline: 'Hope and Care for All',
        parentOrganization: 'Tata Memorial Centre (Dept of Atomic Energy)',
        ownershipType: 'Trust/Government',
        latitude: 18.9988,
        longitude: 72.8432,
        phone: '+91-22-2417-7000',
        emergencyPhone: '+91-22-2417-7000',
        website: 'https://tmc.gov.in',
        googleBusinessUrl: 'https://g.page/tata-memorial-hospital',
        equipment: [
            'Multiple Linear Accelerators',
            'CyberKnife',
            'Brachytherapy Systems',
            'PET-CT Scanners',
            '3 Tesla MRI',
            '128-Slice CT Scanner',
            'Robotic Surgery System'
        ],
        specialties: ['Medical Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Pediatric Oncology', 'Bone Marrow Transplant', 'Head & Neck Cancers'],
        prosForPatients: [
            'India\'s leading cancer hospital',
            'Highly subsidized treatment for poor patients',
            'Comprehensive cancer care',
            'Active clinical trials access',
            'Excellent survival outcomes'
        ],
        consForPatients: [
            'Very high patient volume',
            'Long waiting times',
            'Limited individual attention',
            'Crowded facilities'
        ],
        awards: [
            { year: 2023, award: 'Best Cancer Hospital India', org: 'Times Health Survey' },
            { year: 2022, award: 'Excellence in Oncology Research', org: 'ICMR' }
        ],
        testPrices: {
            'Tumor Markers Panel': { inr: 2000, usd: 24, gbp: 19, aed: 88 },
            'PET-CT Scan': { inr: 12000, usd: 144, gbp: 114, aed: 528 },
            'Bone Marrow Biopsy': { inr: 3000, usd: 36, gbp: 29, aed: 132 },
            'Immunohistochemistry': { inr: 5000, usd: 60, gbp: 48, aed: 220 }
        }
    }
];

// ─── UAE Hospitals ─────────────────────────────────────────────────────────

const UAE_HOSPITALS: HospitalData[] = [
    {
        name: 'Cleveland Clinic Abu Dhabi',
        slug: 'cleveland-clinic-abu-dhabi',
        type: 'corporate_chain',
        city: 'Abu Dhabi',
        state: 'Abu Dhabi',
        country: 'AE',
        establishedYear: 2015,
        bedCount: 364,
        icuBeds: 60,
        operationTheaters: 13,
        accreditations: ['JCI', 'CAP', 'AAHRPP'],
        description: `Cleveland Clinic Abu Dhabi is a world-class multispecialty hospital on Al Maryah Island, operated by Cleveland Clinic in partnership with Mubadala Health. It brings American healthcare excellence to the Middle East.

The hospital is renowned for its Heart, Vascular & Thoracic Institute, which offers the full spectrum of cardiac care including complex heart surgeries and TAVR procedures. It was the first in the UAE to perform certain advanced cardiac procedures.

With a focus on American standards of care, the hospital serves as a tertiary and quaternary care center, handling complex cases from across the region. Its Digestive Disease Institute and Neurological Institute are also recognized centers of excellence.`,
        tagline: 'Every Life Deserves World Class Care',
        parentOrganization: 'Mubadala Health & Cleveland Clinic',
        ownershipType: 'Joint Venture',
        latitude: 24.4999,
        longitude: 54.3840,
        phone: '+971-2-501-9000',
        emergencyPhone: '+971-2-501-9999',
        website: 'https://www.clevelandclinicabudhabi.ae',
        googleBusinessUrl: 'https://g.page/cleveland-clinic-abu-dhabi',
        equipment: [
            'da Vinci Xi Robotic Surgery System',
            '3 Tesla MRI',
            '256-Slice CT Scanner',
            'PET-CT Scanner',
            'Hybrid Operating Rooms',
            'ECMO Support',
            'CyberKnife',
            'Advanced Cardiac Cath Labs'
        ],
        specialties: ['Heart & Vascular', 'Digestive Disease', 'Neurological', 'Respiratory', 'Eye', 'Critical Care'],
        prosForPatients: [
            'American healthcare standards',
            'Cleveland Clinic expertise',
            'Modern waterfront facility',
            'Multilingual staff',
            'No waiting times'
        ],
        consForPatients: [
            'Premium pricing',
            'Some insurance limitations',
            'Limited public transport access'
        ],
        awards: [
            { year: 2023, award: 'Best Hospital Middle East', org: 'Newsweek' },
            { year: 2022, award: 'Excellence in Cardiac Care', org: 'Arab Health Awards' }
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 1500, usd: 18, gbp: 14, aed: 65 },
            'Lipid Profile': { inr: 2500, usd: 30, gbp: 24, aed: 110 },
            'MRI Brain': { inr: 25000, usd: 300, gbp: 238, aed: 1100 },
            'CT Scan Chest': { inr: 12000, usd: 144, gbp: 114, aed: 525 },
            'PET-CT Scan': { inr: 83000, usd: 1000, gbp: 794, aed: 3660 }
        }
    },
    {
        name: 'Mediclinic City Hospital Dubai',
        slug: 'mediclinic-city-hospital-dubai',
        type: 'corporate_chain',
        city: 'Dubai',
        state: 'Dubai',
        country: 'AE',
        establishedYear: 2008,
        bedCount: 280,
        icuBeds: 45,
        operationTheaters: 10,
        accreditations: ['JCI'],
        description: `Mediclinic City Hospital is a premium multi-disciplinary hospital located in Dubai Healthcare City. As part of the Mediclinic International group with origins in South Africa, it combines international standards with personalized care.

The hospital excels in Oncology, Orthopedics, and Women's Health. Its Cancer Center provides comprehensive oncology services including medical, surgical, and radiation oncology with the latest treatment modalities.

With its strategic location in Dubai Healthcare City free zone, Mediclinic City Hospital serves both local residents and medical tourists, offering seamless coordination between outpatient consultations and inpatient care.`,
        tagline: 'Expertise. Care. Excellence.',
        parentOrganization: 'Mediclinic International',
        ownershipType: 'Corporate',
        latitude: 25.2336,
        longitude: 55.3177,
        phone: '+971-4-435-9999',
        emergencyPhone: '+971-4-435-9911',
        website: 'https://www.mediclinic.ae/city-hospital',
        googleBusinessUrl: 'https://g.page/mediclinic-city-hospital-dubai',
        equipment: [
            'da Vinci Robotic Surgery System',
            '3 Tesla MRI',
            '128-Slice CT Scanner',
            'Linear Accelerator',
            'PET-CT Scanner',
            'Advanced Endoscopy Suite'
        ],
        specialties: ['Oncology', 'Orthopedics', 'Cardiology', 'Gastroenterology', 'Women\'s Health', 'IVF'],
        prosForPatients: [
            'Premium private rooms',
            'Efficient appointment system',
            'Insurance-friendly',
            'Central DHCC location',
            'Multilingual staff'
        ],
        consForPatients: [
            'High consultation fees',
            'Limited parking',
            'Some specialists on specific days only'
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 1200, usd: 14, gbp: 11, aed: 52 },
            'Lipid Profile': { inr: 2000, usd: 24, gbp: 19, aed: 88 },
            'Thyroid Profile': { inr: 2500, usd: 30, gbp: 24, aed: 110 },
            'MRI Knee': { inr: 20000, usd: 240, gbp: 190, aed: 880 }
        }
    }
];

// ─── Thailand Hospitals ─────────────────────────────────────────────────────

const THAILAND_HOSPITALS: HospitalData[] = [
    {
        name: 'Bumrungrad International Hospital',
        slug: 'bumrungrad-international-hospital-bangkok',
        type: 'corporate_chain',
        city: 'Bangkok',
        state: 'Bangkok',
        country: 'TH',
        establishedYear: 1980,
        bedCount: 580,
        icuBeds: 80,
        operationTheaters: 20,
        accreditations: ['JCI', 'ISO 9001', 'ISO 14001'],
        description: `Bumrungrad International Hospital is one of the world's most recognized medical tourism destinations. Founded in 1980, it serves over 1.1 million patients annually from more than 190 countries.

The hospital is renowned for being one of the first in Asia to receive JCI accreditation and has maintained this status continuously since 2002. It offers over 70 clinical specialties and has built a reputation for excellent outcomes in cardiac surgery, orthopedics, and oncology.

With interpreters for over 30 languages, comprehensive international patient services, and prices significantly lower than Western countries, Bumrungrad has become synonymous with medical tourism excellence in Asia.`,
        tagline: 'World-Class Healthcare & Service',
        parentOrganization: 'Bumrungrad Hospital PCL',
        ownershipType: 'Corporate (Listed)',
        latitude: 13.7434,
        longitude: 100.5531,
        phone: '+66-2-066-8888',
        emergencyPhone: '+66-2-066-8999',
        website: 'https://www.bumrungrad.com',
        googleBusinessUrl: 'https://g.page/bumrungrad',
        equipment: [
            'da Vinci Xi Robotic Surgery',
            '3 Tesla MRI',
            '640-Slice CT Scanner',
            'PET-CT Scanner',
            'CyberKnife',
            'TrueBeam Linear Accelerator',
            'Hybrid OR',
            'Advanced Endoscopy Suite'
        ],
        specialties: ['Cardiac Center', 'Oncology', 'Orthopedics', 'Spine Institute', 'Digestive Disease', 'Cosmetic Surgery'],
        prosForPatients: [
            'World-leading medical tourism hospital',
            'Excellent international patient services',
            '30+ language interpreters',
            '40-60% cost savings vs USA',
            'Luxury hotel-like facilities'
        ],
        consForPatients: [
            'Can feel commercial',
            'Premium pricing for Thailand',
            'Busy during peak seasons'
        ],
        awards: [
            { year: 2023, award: 'World\'s Best Hospital for Medical Tourism', org: 'MTQUA' },
            { year: 2022, award: 'Best International Hospital', org: 'International Hospital Federation' }
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 800, usd: 10, gbp: 8, aed: 35 },
            'Lipid Profile': { inr: 1200, usd: 14, gbp: 11, aed: 52 },
            'Full Health Checkup': { inr: 25000, usd: 300, gbp: 238, aed: 1100 },
            'MRI Brain': { inr: 15000, usd: 180, gbp: 143, aed: 660 },
            'PET-CT Scan': { inr: 50000, usd: 600, gbp: 476, aed: 2200 }
        }
    }
];

// ─── Turkey Hospitals ─────────────────────────────────────────────────────

const TURKEY_HOSPITALS: HospitalData[] = [
    {
        name: 'Acibadem Maslak Hospital',
        slug: 'acibadem-maslak-hospital-istanbul',
        type: 'corporate_chain',
        city: 'Istanbul',
        state: 'Istanbul',
        country: 'TR',
        establishedYear: 2009,
        bedCount: 256,
        icuBeds: 71,
        operationTheaters: 12,
        accreditations: ['JCI', 'ISO 9001'],
        description: `Acibadem Maslak Hospital is the flagship facility of Acibadem Healthcare Group, Turkey's largest private healthcare network. Located in the prestigious Maslak business district of Istanbul, it represents the pinnacle of Turkish private healthcare.

The hospital is particularly renowned for its Oncology Center, featuring Intraoperative Radiation Therapy (IORT), and its Robotic Surgery Center which has performed thousands of procedures. Its IVF Center has achieved international recognition for high success rates.

As part of the IHH Healthcare network (Malaysia), Acibadem combines Turkish medical expertise with international standards, making Istanbul one of the top medical tourism destinations globally with excellent value for money.`,
        tagline: 'Creating a Difference in Healthcare',
        parentOrganization: 'Acibadem Healthcare Group (IHH Healthcare)',
        ownershipType: 'Corporate',
        latitude: 41.1118,
        longitude: 29.0260,
        phone: '+90-212-304-4444',
        emergencyPhone: '+90-212-304-4911',
        website: 'https://www.acibadem.com.tr',
        googleBusinessUrl: 'https://g.page/acibadem-maslak',
        equipment: [
            'da Vinci Xi Robotic Surgery',
            '3 Tesla MRI',
            '256-Slice CT Scanner',
            'PET-CT Scanner',
            'IORT System',
            'CyberKnife',
            'Gamma Knife'
        ],
        specialties: ['Oncology', 'Robotic Surgery', 'IVF', 'Cardiac Surgery', 'Orthopedics', 'Hair Transplant'],
        prosForPatients: [
            'Leading Turkish healthcare group',
            'Excellent value for money',
            'International patient coordinator service',
            'Modern facilities',
            'English-speaking doctors'
        ],
        consForPatients: [
            'Istanbul traffic affects accessibility',
            'Language barrier with some staff',
            'Insurance claims may require additional paperwork'
        ],
        testPrices: {
            'Complete Blood Count (CBC)': { inr: 500, usd: 6, gbp: 5, aed: 22 },
            'Lipid Profile': { inr: 800, usd: 10, gbp: 8, aed: 35 },
            'MRI Brain': { inr: 8000, usd: 96, gbp: 76, aed: 352 },
            'PET-CT Scan': { inr: 35000, usd: 420, gbp: 333, aed: 1540 }
        }
    }
];

// ─── UK Hospitals ─────────────────────────────────────────────────────

const UK_HOSPITALS: HospitalData[] = [
    {
        name: 'Royal Marsden Hospital',
        slug: 'royal-marsden-hospital-london',
        type: 'government',
        city: 'London',
        state: 'England',
        country: 'GB',
        establishedYear: 1851,
        bedCount: 300,
        icuBeds: 30,
        operationTheaters: 8,
        accreditations: ['CQC Outstanding'],
        description: `The Royal Marsden NHS Foundation Trust is one of the world's leading cancer centers, founded in 1851 as the first hospital dedicated to cancer treatment. It handles some of the most complex cancer cases and is at the forefront of cancer research.

The hospital works closely with the Institute of Cancer Research (ICR) and together they form the largest comprehensive cancer center in Europe. Many cancer treatments used worldwide were developed or refined at Royal Marsden.

As an NHS Trust, the hospital provides free treatment to UK residents while also accepting private and international patients through its Private Care division.`,
        tagline: 'The World\'s First Cancer Hospital',
        parentOrganization: 'NHS Foundation Trust',
        ownershipType: 'Government (NHS)',
        latitude: 51.4648,
        longitude: -0.1689,
        phone: '+44-20-7352-8171',
        emergencyPhone: '+44-20-7352-8171',
        website: 'https://www.royalmarsden.nhs.uk',
        googleBusinessUrl: 'https://g.page/royal-marsden-hospital',
        equipment: [
            'Proton Beam Therapy',
            'CyberKnife',
            'TomoTherapy',
            '3 Tesla MRI',
            'PET-CT Scanner',
            'Versa HD Linear Accelerator'
        ],
        specialties: ['Medical Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Pediatric Oncology', 'Sarcoma', 'Skin Cancer'],
        prosForPatients: [
            'World-leading cancer expertise',
            'Access to latest clinical trials',
            'Free NHS treatment for UK residents',
            'Excellent survival outcomes',
            'Integrated research and treatment'
        ],
        consForPatients: [
            'Long NHS waiting times',
            'Limited private patient capacity',
            'Not all locations easily accessible'
        ],
        testPrices: {
            'Tumor Markers': { inr: 5000, usd: 60, gbp: 48, aed: 220 },
            'PET-CT Scan': { inr: 75000, usd: 900, gbp: 714, aed: 3300 },
            'MRI': { inr: 35000, usd: 420, gbp: 333, aed: 1540 }
        }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// INSURANCE PROVIDERS DATA
// ═══════════════════════════════════════════════════════════════════════════

interface InsuranceData {
    name: string;
    slug: string;
    country: string;
    providerType: 'private' | 'public' | 'government';
    claimSettlementRatio?: number;
    description: string;
    website: string;
    customerCarePhone: string;
    networkHospitalsCount: number;
    plans: string[];
    keyFeatures: string[];
}

const INSURANCE_PROVIDERS: InsuranceData[] = [
    // India
    {
        name: 'Star Health Insurance',
        slug: 'star-health-insurance',
        country: 'IN',
        providerType: 'private',
        claimSettlementRatio: 91.5,
        description: 'Star Health and Allied Insurance is India\'s first standalone health insurance company and the largest in the sector. Known for comprehensive health plans, wide network, and efficient claim processing.',
        website: 'https://www.starhealth.in',
        customerCarePhone: '1800-102-4477',
        networkHospitalsCount: 14000,
        plans: ['Family Health Optima', 'Comprehensive', 'Young Star', 'Senior Citizens Red Carpet', 'Diabetes Safe'],
        keyFeatures: ['No medical checkup up to 50L', 'Day-care procedures covered', 'Pre & post hospitalization', 'AYUSH treatment covered']
    },
    {
        name: 'HDFC ERGO Health Insurance',
        slug: 'hdfc-ergo-health-insurance',
        country: 'IN',
        providerType: 'private',
        claimSettlementRatio: 93.2,
        description: 'HDFC ERGO is one of India\'s leading general insurance companies, known for its Optima range of health insurance products that offer comprehensive coverage with flexible options.',
        website: 'https://www.hdfcergo.com',
        customerCarePhone: '1800-266-0700',
        networkHospitalsCount: 13000,
        plans: ['Optima Secure', 'Optima Restore', 'My Health Suraksha', 'Energy', 'Medisure Super Top Up'],
        keyFeatures: ['Restore benefit', 'Unlimited automatic recharge', 'No claim bonus up to 100%', 'Coverage worldwide']
    },
    {
        name: 'ICICI Lombard Health Insurance',
        slug: 'icici-lombard-health-insurance',
        country: 'IN',
        providerType: 'private',
        claimSettlementRatio: 87.4,
        description: 'ICICI Lombard is one of the largest private sector general insurance companies in India, offering a wide range of health insurance products backed by strong service network.',
        website: 'https://www.icicilombard.com',
        customerCarePhone: '1800-266-9725',
        networkHospitalsCount: 6500,
        plans: ['Complete Health Insurance', 'iHealth', 'Health Booster', 'Elevate', 'Arogya Sanjeevani'],
        keyFeatures: ['Sum insured protection', 'Modern treatment coverage', 'Air ambulance cover', 'Daily cash benefit']
    },
    {
        name: 'Max Bupa Health Insurance',
        slug: 'max-bupa-niva-bupa',
        country: 'IN',
        providerType: 'private',
        claimSettlementRatio: 94.1,
        description: 'Niva Bupa (formerly Max Bupa) combines Indian market knowledge with Bupa\'s global healthcare expertise to offer comprehensive health insurance solutions.',
        website: 'https://www.nivabupa.com',
        customerCarePhone: '1800-200-7272',
        networkHospitalsCount: 10000,
        plans: ['ReAssure', 'Health Companion', 'Heartbeat', 'Senior First', 'Criticare'],
        keyFeatures: ['OPD cover available', 'Organ donor expenses', 'Mental illness coverage', 'No room rent capping']
    },
    // UAE
    {
        name: 'Daman Insurance',
        slug: 'daman-insurance-uae',
        country: 'AE',
        providerType: 'private',
        claimSettlementRatio: 89.5,
        description: 'National Health Insurance Company (Daman) is the largest health insurer in the UAE, established in partnership with the Abu Dhabi government. It manages the mandatory Thiqa program for UAE nationals.',
        website: 'https://www.damanhealth.ae',
        customerCarePhone: '800-4health',
        networkHospitalsCount: 2500,
        plans: ['Thiqa', 'Saada', 'Corporate Plans', 'SME Health'],
        keyFeatures: ['Mandatory coverage provider', 'Wide network', 'Maternity coverage', 'Dental and optical']
    },
    {
        name: 'AXA Gulf Insurance',
        slug: 'axa-gulf-insurance-uae',
        country: 'AE',
        providerType: 'private',
        claimSettlementRatio: 91.0,
        description: 'AXA is a global insurance leader with strong presence in UAE and GCC, offering comprehensive health insurance solutions for individuals and corporates.',
        website: 'https://www.axa.ae',
        customerCarePhone: '+971-4-444-7747',
        networkHospitalsCount: 3000,
        plans: ['Gold Health', 'Silver Health', 'SmartHealth', 'Corporate Health'],
        keyFeatures: ['Global coverage options', 'Direct billing network', 'Wellness programs', '24/7 customer support']
    },
    // UK
    {
        name: 'Bupa UK',
        slug: 'bupa-health-insurance-uk',
        country: 'GB',
        providerType: 'private',
        claimSettlementRatio: 96.0,
        description: 'Bupa is the UK\'s leading private health insurer, serving millions of customers with comprehensive health insurance, dental plans, and health services.',
        website: 'https://www.bupa.co.uk',
        customerCarePhone: '0345-600-8822',
        networkHospitalsCount: 400,
        plans: ['Treatment and Care', 'Comprehensive', 'By You', 'Cash Plan'],
        keyFeatures: ['Fast access to specialists', 'Mental health support', 'Digital GP services', 'Health assessments included']
    },
    // Thailand
    {
        name: 'Allianz Ayudhya Thailand',
        slug: 'allianz-ayudhya-thailand',
        country: 'TH',
        providerType: 'private',
        description: 'Allianz Ayudhya is Thailand\'s leading life and health insurer, combining global Allianz expertise with local market knowledge.',
        website: 'https://www.azay.co.th',
        customerCarePhone: '1373',
        networkHospitalsCount: 500,
        plans: ['My Health Plus', 'Prestige Health', 'Allianz Care'],
        keyFeatures: ['International coverage option', 'Direct billing at partner hospitals', 'Cashless treatment', 'Wellness benefits']
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function generateHospitalContent() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(' Hospital & Insurance Content Generator');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const allHospitals = [
        ...INDIA_HOSPITALS,
        ...UAE_HOSPITALS,
        ...THAILAND_HOSPITALS,
        ...TURKEY_HOSPITALS,
        ...UK_HOSPITALS
    ];

    let hospitalsCreated = 0;
    let hospitalsUpdated = 0;
    let insurersCreated = 0;
    let insurersUpdated = 0;

    // Process Hospitals
    console.log('Processing Hospitals...\n');
    for (const hosp of allHospitals) {
        try {
            // Find or get geography
            let geographyId: number | null = null;
            const geo = await prisma.geography.findFirst({
                where: {
                    name: { contains: hosp.city, mode: 'insensitive' },
                    level: 'city'
                }
            });
            if (geo) geographyId = geo.id;

            const existing = await prisma.hospital.findUnique({
                where: { slug: hosp.slug }
            });

            const hospitalData = {
                name: hosp.name,
                hospitalType: hosp.type,
                city: hosp.city,
                state: hosp.state,
                country: hosp.country,
                geographyId,
                establishedYear: hosp.establishedYear,
                bedCount: hosp.bedCount,
                icuBeds: hosp.icuBeds,
                operationTheaters: hosp.operationTheaters,
                accreditations: hosp.accreditations,
                description: hosp.description,
                tagline: hosp.tagline,
                parentOrganization: hosp.parentOrganization,
                ownershipType: hosp.ownershipType,
                latitude: hosp.latitude || null,
                longitude: hosp.longitude || null,
                phone: hosp.phone,
                emergencyPhone: hosp.emergencyPhone,
                website: hosp.website,
                prosForPatients: hosp.prosForPatients,
                consForPatients: hosp.consForPatients,
                awards: hosp.awards || [],
                scandals: hosp.scandals || [],
                notablePatients: hosp.notablePatients || [],
                isActive: true,
                metaTitle: `${hosp.name} - Reviews, Doctors, Costs & Insurance | AIHealz`,
                metaDescription: `${hosp.name} in ${hosp.city}: ${hosp.bedCount} beds, ${hosp.accreditations.join(', ')} accredited. Compare doctors, costs, reviews & insurance. Book appointment today.`,
            };

            if (existing) {
                await prisma.hospital.update({
                    where: { slug: hosp.slug },
                    data: hospitalData
                });
                hospitalsUpdated++;
                console.log(`  Updated: ${hosp.name}`);
            } else {
                await prisma.hospital.create({
                    data: {
                        slug: hosp.slug,
                        ...hospitalData
                    }
                });
                hospitalsCreated++;
                console.log(`  Created: ${hosp.name}`);
            }

            // Add specialties
            const hospital = await prisma.hospital.findUnique({ where: { slug: hosp.slug } });
            if (hospital && hosp.specialties) {
                for (let i = 0; i < hosp.specialties.length; i++) {
                    const spec = hosp.specialties[i];
                    const existingSpec = await prisma.hospitalSpecialty.findFirst({
                        where: { hospitalId: hospital.id, specialty: spec }
                    });
                    if (!existingSpec) {
                        await prisma.hospitalSpecialty.create({
                            data: {
                                hospitalId: hospital.id,
                                specialty: spec,
                                displayOrder: i
                            }
                        });
                    }
                }
            }

        } catch (err) {
            console.error(`  Error processing ${hosp.name}:`, err);
        }
    }

    // Process Insurance Providers
    console.log('\nProcessing Insurance Providers...\n');
    for (const ins of INSURANCE_PROVIDERS) {
        try {
            const existing = await prisma.insuranceProvider.findUnique({
                where: { slug: ins.slug }
            });

            const insurerData = {
                name: ins.name,
                providerType: ins.providerType,
                description: ins.description,
                website: ins.website,
                customerCarePhone: ins.customerCarePhone,
                claimSettlementRatio: ins.claimSettlementRatio || null,
                networkHospitalsCount: ins.networkHospitalsCount,
                isActive: true,
                metaTitle: `${ins.name} - Plans, Network Hospitals & Claim Settlement | AIHealz`,
                metaDescription: `${ins.name}: Compare health insurance plans, ${ins.networkHospitalsCount}+ network hospitals, ${ins.claimSettlementRatio || 'N/A'}% claim settlement ratio. Get quotes now.`,
            };

            if (existing) {
                await prisma.insuranceProvider.update({
                    where: { slug: ins.slug },
                    data: insurerData
                });
                insurersUpdated++;
                console.log(`  Updated: ${ins.name}`);
            } else {
                await prisma.insuranceProvider.create({
                    data: {
                        slug: ins.slug,
                        ...insurerData
                    }
                });
                insurersCreated++;
                console.log(`  Created: ${ins.name}`);
            }

        } catch (err) {
            console.error(`  Error processing ${ins.name}:`, err);
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(' Summary');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(` Hospitals Created: ${hospitalsCreated}`);
    console.log(` Hospitals Updated: ${hospitalsUpdated}`);
    console.log(` Insurance Created: ${insurersCreated}`);
    console.log(` Insurance Updated: ${insurersUpdated}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run
generateHospitalContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
