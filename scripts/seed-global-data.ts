import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'taps',
  database: 'aihealz',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Global Data Seed Script
 *
 * Seeds geographic data, hospitals, doctors, and insurance providers
 * for countries: USA, UK, Thailand, Mexico, Turkey, UAE
 */

// ════════════════════════════════════════════════════════════════════════════
// GEOGRAPHIC DATA
// ════════════════════════════════════════════════════════════════════════════

interface CountryData {
  name: string;
  slug: string;
  isoCode: string;
  languages: string[];
  states: {
    name: string;
    slug: string;
    cities: { name: string; slug: string; lat?: number; lng?: number }[];
  }[];
}

// ════════════════════════════════════════════════════════════════════════════
// COUNTRY LANGUAGE MAPPING
// Languages spoken in each country (primary + secondary)
// ════════════════════════════════════════════════════════════════════════════

const COUNTRY_LANGUAGES: Record<string, string[]> = {
  US: ['en', 'es'],           // English primary, large Spanish-speaking population
  GB: ['en'],                 // English
  TH: ['th', 'en', 'zh'],     // Thai primary, English for tourism, Chinese community
  MX: ['es', 'en'],           // Spanish primary, English for tourism
  TR: ['tr', 'en', 'ar', 'ru'], // Turkish primary, English, Arabic, Russian tourists
  AE: ['ar', 'en', 'hi', 'ur'], // Arabic, English, Hindi/Urdu (large expat community)
  IN: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa'],
  SG: ['en', 'zh', 'ms', 'ta'],
  MY: ['ms', 'en', 'zh', 'ta'],
  DE: ['de', 'en'],
  FR: ['fr', 'en'],
  ES: ['es', 'en'],
  IT: ['it', 'en'],
  JP: ['ja', 'en'],
  KR: ['ko', 'en'],
  SA: ['ar', 'en'],
  EG: ['ar', 'en'],
  BR: ['pt', 'en'],
  AU: ['en'],
  CA: ['en', 'fr'],
};

const countriesData: CountryData[] = [
  {
    name: 'United States',
    slug: 'united-states',
    isoCode: 'US',
    languages: COUNTRY_LANGUAGES['US'],
    states: [
      {
        name: 'California',
        slug: 'california',
        cities: [
          { name: 'Los Angeles', slug: 'los-angeles', lat: 34.0522, lng: -118.2437 },
          { name: 'San Francisco', slug: 'san-francisco', lat: 37.7749, lng: -122.4194 },
          { name: 'San Diego', slug: 'san-diego', lat: 32.7157, lng: -117.1611 },
        ],
      },
      {
        name: 'New York',
        slug: 'new-york-state',
        cities: [
          { name: 'New York City', slug: 'new-york-city', lat: 40.7128, lng: -74.006 },
          { name: 'Buffalo', slug: 'buffalo', lat: 42.8864, lng: -78.8784 },
        ],
      },
      {
        name: 'Texas',
        slug: 'texas',
        cities: [
          { name: 'Houston', slug: 'houston', lat: 29.7604, lng: -95.3698 },
          { name: 'Dallas', slug: 'dallas', lat: 32.7767, lng: -96.797 },
          { name: 'Austin', slug: 'austin', lat: 30.2672, lng: -97.7431 },
        ],
      },
      {
        name: 'Florida',
        slug: 'florida',
        cities: [
          { name: 'Miami', slug: 'miami', lat: 25.7617, lng: -80.1918 },
          { name: 'Orlando', slug: 'orlando', lat: 28.5383, lng: -81.3792 },
        ],
      },
      {
        name: 'Massachusetts',
        slug: 'massachusetts',
        cities: [
          { name: 'Boston', slug: 'boston', lat: 42.3601, lng: -71.0589 },
        ],
      },
    ],
  },
  {
    name: 'United Kingdom',
    slug: 'united-kingdom',
    isoCode: 'GB',
    languages: COUNTRY_LANGUAGES['GB'],
    states: [
      {
        name: 'England',
        slug: 'england',
        cities: [
          { name: 'London', slug: 'london', lat: 51.5074, lng: -0.1278 },
          { name: 'Manchester', slug: 'manchester', lat: 53.4808, lng: -2.2426 },
          { name: 'Birmingham', slug: 'birmingham', lat: 52.4862, lng: -1.8904 },
          { name: 'Liverpool', slug: 'liverpool', lat: 53.4084, lng: -2.9916 },
        ],
      },
      {
        name: 'Scotland',
        slug: 'scotland',
        cities: [
          { name: 'Edinburgh', slug: 'edinburgh', lat: 55.9533, lng: -3.1883 },
          { name: 'Glasgow', slug: 'glasgow', lat: 55.8642, lng: -4.2518 },
        ],
      },
    ],
  },
  {
    name: 'Thailand',
    slug: 'thailand',
    isoCode: 'TH',
    languages: COUNTRY_LANGUAGES['TH'],
    states: [
      {
        name: 'Bangkok Metropolitan',
        slug: 'bangkok-metropolitan',
        cities: [
          { name: 'Bangkok', slug: 'bangkok', lat: 13.7563, lng: 100.5018 },
        ],
      },
      {
        name: 'Chiang Mai Province',
        slug: 'chiang-mai-province',
        cities: [
          { name: 'Chiang Mai', slug: 'chiang-mai', lat: 18.7883, lng: 98.9853 },
        ],
      },
      {
        name: 'Phuket Province',
        slug: 'phuket-province',
        cities: [
          { name: 'Phuket', slug: 'phuket', lat: 7.8804, lng: 98.3923 },
        ],
      },
    ],
  },
  {
    name: 'Mexico',
    slug: 'mexico',
    isoCode: 'MX',
    languages: COUNTRY_LANGUAGES['MX'],
    states: [
      {
        name: 'Mexico City',
        slug: 'mexico-city-state',
        cities: [
          { name: 'Mexico City', slug: 'mexico-city', lat: 19.4326, lng: -99.1332 },
        ],
      },
      {
        name: 'Jalisco',
        slug: 'jalisco',
        cities: [
          { name: 'Guadalajara', slug: 'guadalajara', lat: 20.6597, lng: -103.3496 },
        ],
      },
      {
        name: 'Nuevo Leon',
        slug: 'nuevo-leon',
        cities: [
          { name: 'Monterrey', slug: 'monterrey', lat: 25.6866, lng: -100.3161 },
        ],
      },
      {
        name: 'Baja California',
        slug: 'baja-california',
        cities: [
          { name: 'Tijuana', slug: 'tijuana', lat: 32.5149, lng: -117.0382 },
        ],
      },
    ],
  },
  {
    name: 'Turkey',
    slug: 'turkey',
    isoCode: 'TR',
    languages: COUNTRY_LANGUAGES['TR'],
    states: [
      {
        name: 'Istanbul Province',
        slug: 'istanbul-province',
        cities: [
          { name: 'Istanbul', slug: 'istanbul', lat: 41.0082, lng: 28.9784 },
        ],
      },
      {
        name: 'Ankara Province',
        slug: 'ankara-province',
        cities: [
          { name: 'Ankara', slug: 'ankara', lat: 39.9334, lng: 32.8597 },
        ],
      },
      {
        name: 'Antalya Province',
        slug: 'antalya-province',
        cities: [
          { name: 'Antalya', slug: 'antalya', lat: 36.8969, lng: 30.7133 },
        ],
      },
      {
        name: 'Izmir Province',
        slug: 'izmir-province',
        cities: [
          { name: 'Izmir', slug: 'izmir', lat: 38.4192, lng: 27.1287 },
        ],
      },
    ],
  },
  {
    name: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    isoCode: 'AE',
    languages: COUNTRY_LANGUAGES['AE'],
    states: [
      {
        name: 'Dubai',
        slug: 'dubai-emirate',
        cities: [
          { name: 'Dubai', slug: 'dubai', lat: 25.2048, lng: 55.2708 },
        ],
      },
      {
        name: 'Abu Dhabi',
        slug: 'abu-dhabi-emirate',
        cities: [
          { name: 'Abu Dhabi', slug: 'abu-dhabi', lat: 24.4539, lng: 54.3773 },
        ],
      },
      {
        name: 'Sharjah',
        slug: 'sharjah-emirate',
        cities: [
          { name: 'Sharjah', slug: 'sharjah', lat: 25.3462, lng: 55.4211 },
        ],
      },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// HOSPITALS DATA
// ════════════════════════════════════════════════════════════════════════════

interface HospitalSeed {
  name: string;
  slug: string;
  citySlug: string;
  countrySlug: string;
  hospitalType: 'teaching' | 'corporate_chain' | 'trust' | 'government' | 'standalone';
  ownershipType: string;
  description: string;
  bedCount: number;
  accreditations: string[];
  specialties: string[];
  website?: string;
  overallRating: number;
}

const hospitalsData: HospitalSeed[] = [
  // USA Hospitals
  {
    name: 'Mayo Clinic',
    slug: 'mayo-clinic-rochester',
    citySlug: 'los-angeles', // Placeholder - Mayo is actually in Rochester
    countrySlug: 'united-states',
    hospitalType: 'trust',
    ownershipType: 'Non-Profit',
    description: 'World-renowned medical center known for integrated clinical practice, education, and research.',
    bedCount: 1265,
    accreditations: ['JCI', 'TJC'],
    specialties: ['Oncology', 'Cardiology', 'Neurology', 'Gastroenterology', 'Orthopedics'],
    website: 'https://www.mayoclinic.org',
    overallRating: 4.9,
  },
  {
    name: 'Cleveland Clinic',
    slug: 'cleveland-clinic',
    citySlug: 'new-york-city',
    countrySlug: 'united-states',
    hospitalType: 'trust',
    ownershipType: 'Non-Profit',
    description: 'Premier academic medical center recognized for excellence in heart care and innovation.',
    bedCount: 1400,
    accreditations: ['JCI', 'TJC'],
    specialties: ['Cardiology', 'Cardiac Surgery', 'Urology', 'Gastroenterology'],
    website: 'https://my.clevelandclinic.org',
    overallRating: 4.8,
  },
  {
    name: 'Johns Hopkins Hospital',
    slug: 'johns-hopkins-hospital',
    citySlug: 'boston',
    countrySlug: 'united-states',
    hospitalType: 'teaching',
    ownershipType: 'Non-Profit',
    description: 'Pioneering teaching hospital known for groundbreaking medical research and patient care.',
    bedCount: 1000,
    accreditations: ['JCI', 'TJC', 'AAHRPP'],
    specialties: ['Neurology', 'Oncology', 'Ophthalmology', 'Psychiatry', 'ENT'],
    website: 'https://www.hopkinsmedicine.org',
    overallRating: 4.8,
  },
  {
    name: 'MD Anderson Cancer Center',
    slug: 'md-anderson-cancer-center',
    citySlug: 'houston',
    countrySlug: 'united-states',
    hospitalType: 'teaching',
    ownershipType: 'Public',
    description: 'World-leading cancer treatment and research center, ranked #1 for cancer care.',
    bedCount: 670,
    accreditations: ['JCI', 'TJC', 'NCI'],
    specialties: ['Oncology', 'Radiation Oncology', 'Surgical Oncology', 'Hematology'],
    website: 'https://www.mdanderson.org',
    overallRating: 4.9,
  },
  {
    name: 'UCLA Medical Center',
    slug: 'ucla-medical-center',
    citySlug: 'los-angeles',
    countrySlug: 'united-states',
    hospitalType: 'teaching',
    ownershipType: 'Public',
    description: 'Premier academic health system with comprehensive services and research programs.',
    bedCount: 520,
    accreditations: ['JCI', 'TJC'],
    specialties: ['Cardiology', 'Neurology', 'Transplant', 'Oncology'],
    website: 'https://www.uclahealth.org',
    overallRating: 4.7,
  },

  // UK Hospitals
  {
    name: "Guy's and St Thomas' Hospital",
    slug: 'guys-st-thomas-hospital',
    citySlug: 'london',
    countrySlug: 'united-kingdom',
    hospitalType: 'teaching',
    ownershipType: 'NHS Trust',
    description: 'Major NHS teaching hospital providing comprehensive healthcare services in central London.',
    bedCount: 1100,
    accreditations: ['CQC Outstanding'],
    specialties: ['Cardiology', 'Cancer', 'Renal', 'Neurosciences'],
    website: 'https://www.guysandstthomas.nhs.uk',
    overallRating: 4.5,
  },
  {
    name: 'Great Ormond Street Hospital',
    slug: 'great-ormond-street',
    citySlug: 'london',
    countrySlug: 'united-kingdom',
    hospitalType: 'teaching',
    ownershipType: 'NHS Trust',
    description: "World-famous children's hospital and research center treating rare and complex conditions.",
    bedCount: 400,
    accreditations: ['CQC Outstanding'],
    specialties: ['Pediatric Cardiology', 'Pediatric Oncology', 'Pediatric Neurology', 'Genetics'],
    website: 'https://www.gosh.nhs.uk',
    overallRating: 4.8,
  },
  {
    name: 'The Christie',
    slug: 'the-christie-manchester',
    citySlug: 'manchester',
    countrySlug: 'united-kingdom',
    hospitalType: 'trust',
    ownershipType: 'NHS Trust',
    description: 'One of the largest cancer treatment centers in Europe with advanced radiotherapy facilities.',
    bedCount: 300,
    accreditations: ['CQC Outstanding'],
    specialties: ['Oncology', 'Radiation Therapy', 'Hematology'],
    website: 'https://www.christie.nhs.uk',
    overallRating: 4.7,
  },

  // Thailand Hospitals
  {
    name: 'Bumrungrad International Hospital',
    slug: 'bumrungrad-hospital',
    citySlug: 'bangkok',
    countrySlug: 'thailand',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: 'Leading medical tourism destination serving over 1 million patients annually from 190 countries.',
    bedCount: 580,
    accreditations: ['JCI', 'AACI'],
    specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Cosmetic Surgery', 'Fertility'],
    website: 'https://www.bumrungrad.com',
    overallRating: 4.8,
  },
  {
    name: 'Bangkok Hospital',
    slug: 'bangkok-hospital',
    citySlug: 'bangkok',
    countrySlug: 'thailand',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: 'Flagship hospital of Bangkok Dusit Medical Services, offering comprehensive care.',
    bedCount: 500,
    accreditations: ['JCI', 'HA Thailand'],
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
    website: 'https://www.bangkokhospital.com',
    overallRating: 4.7,
  },
  {
    name: 'Bangkok International Hospital Phuket',
    slug: 'bangkok-hospital-phuket',
    citySlug: 'phuket',
    countrySlug: 'thailand',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: 'Premier international hospital in Phuket offering medical tourism services.',
    bedCount: 200,
    accreditations: ['JCI', 'HA Thailand'],
    specialties: ['Emergency', 'Orthopedics', 'Dental', 'Plastic Surgery'],
    website: 'https://www.phukethospital.com',
    overallRating: 4.5,
  },

  // Mexico Hospitals
  {
    name: 'Hospital Angeles',
    slug: 'hospital-angeles-mexico',
    citySlug: 'mexico-city',
    countrySlug: 'mexico',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: "Mexico's largest private hospital network with state-of-the-art facilities.",
    bedCount: 450,
    accreditations: ['JCI', 'CSG'],
    specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurosurgery'],
    website: 'https://www.hospitalangeles.com',
    overallRating: 4.6,
  },
  {
    name: 'Hospital Christus Muguerza',
    slug: 'christus-muguerza',
    citySlug: 'monterrey',
    countrySlug: 'mexico',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: 'Partnership between CHRISTUS Health and Muguerza hospitals offering quality care.',
    bedCount: 380,
    accreditations: ['JCI'],
    specialties: ['Cardiology', 'Bariatric Surgery', 'Orthopedics'],
    website: 'https://www.christusmuguerza.com.mx',
    overallRating: 4.5,
  },

  // Turkey Hospitals
  {
    name: 'Acibadem Healthcare Group',
    slug: 'acibadem-healthcare',
    citySlug: 'istanbul',
    countrySlug: 'turkey',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: "Turkey's largest healthcare chain with international accreditation and medical tourism focus.",
    bedCount: 800,
    accreditations: ['JCI', 'ISO 15189'],
    specialties: ['Oncology', 'Cardiology', 'IVF', 'Hair Transplant', 'Cosmetic Surgery'],
    website: 'https://www.acibadem.com',
    overallRating: 4.7,
  },
  {
    name: 'Memorial Healthcare Group',
    slug: 'memorial-healthcare-istanbul',
    citySlug: 'istanbul',
    countrySlug: 'turkey',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: 'Premium healthcare chain known for advanced treatment options and international patient services.',
    bedCount: 600,
    accreditations: ['JCI'],
    specialties: ['Organ Transplant', 'Oncology', 'Cardiology', 'Orthopedics'],
    website: 'https://www.memorial.com.tr',
    overallRating: 4.6,
  },
  {
    name: 'Liv Hospital Ankara',
    slug: 'liv-hospital-ankara',
    citySlug: 'ankara',
    countrySlug: 'turkey',
    hospitalType: 'standalone',
    ownershipType: 'Private',
    description: 'Modern smart hospital with integrated technology and personalized care.',
    bedCount: 300,
    accreditations: ['JCI'],
    specialties: ['Cardiology', 'Oncology', 'Robotic Surgery'],
    website: 'https://www.livhospital.com',
    overallRating: 4.5,
  },

  // UAE Hospitals
  {
    name: 'Cleveland Clinic Abu Dhabi',
    slug: 'cleveland-clinic-abudhabi',
    citySlug: 'abu-dhabi',
    countrySlug: 'united-arab-emirates',
    hospitalType: 'corporate_chain',
    ownershipType: 'Government Partnership',
    description: 'Extension of Cleveland Clinic bringing world-class care to the Middle East.',
    bedCount: 364,
    accreditations: ['JCI', 'CAP'],
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Urology'],
    website: 'https://www.clevelandclinicabudhabi.ae',
    overallRating: 4.8,
  },
  {
    name: 'Mediclinic City Hospital Dubai',
    slug: 'mediclinic-city-dubai',
    citySlug: 'dubai',
    countrySlug: 'united-arab-emirates',
    hospitalType: 'corporate_chain',
    ownershipType: 'Private',
    description: 'Multi-specialty hospital in Dubai Healthcare City with comprehensive services.',
    bedCount: 280,
    accreditations: ['JCI'],
    specialties: ['Cardiology', 'Orthopedics', 'Oncology', 'Maternity'],
    website: 'https://www.mediclinic.ae',
    overallRating: 4.6,
  },
  {
    name: 'American Hospital Dubai',
    slug: 'american-hospital-dubai',
    citySlug: 'dubai',
    countrySlug: 'united-arab-emirates',
    hospitalType: 'standalone',
    ownershipType: 'Private',
    description: "First private hospital in Dubai, known for American standards of care.",
    bedCount: 252,
    accreditations: ['JCI'],
    specialties: ['Oncology', 'Cardiology', 'Orthopedics', 'IVF'],
    website: 'https://www.ahdubai.com',
    overallRating: 4.7,
  },
];

// ════════════════════════════════════════════════════════════════════════════
// DOCTORS DATA
// ════════════════════════════════════════════════════════════════════════════

interface DoctorSeed {
  name: string;
  slug: string;
  citySlug: string;
  countrySlug: string;
  specialty: string;
  qualifications: string[];
  experienceYears: number;
  bio: string;
  rating: number;
  consultationFee: number;
  feeCurrency: string;
}

const doctorsData: DoctorSeed[] = [
  // USA Doctors
  {
    name: 'Dr. James Wilson',
    slug: 'dr-james-wilson-cardiology',
    citySlug: 'new-york-city',
    countrySlug: 'united-states',
    specialty: 'Cardiology',
    qualifications: ['MD', 'FACC', 'Harvard Medical School'],
    experienceYears: 25,
    bio: 'Board-certified cardiologist specializing in interventional cardiology and heart failure management.',
    rating: 4.9,
    consultationFee: 350,
    feeCurrency: 'USD',
  },
  {
    name: 'Dr. Sarah Chen',
    slug: 'dr-sarah-chen-oncology',
    citySlug: 'houston',
    countrySlug: 'united-states',
    specialty: 'Oncology',
    qualifications: ['MD', 'PhD', 'Memorial Sloan Kettering'],
    experienceYears: 18,
    bio: 'Medical oncologist with expertise in breast cancer and immunotherapy treatments.',
    rating: 4.8,
    consultationFee: 400,
    feeCurrency: 'USD',
  },
  {
    name: 'Dr. Michael Rodriguez',
    slug: 'dr-michael-rodriguez-orthopedics',
    citySlug: 'los-angeles',
    countrySlug: 'united-states',
    specialty: 'Orthopedics',
    qualifications: ['MD', 'FAAOS', 'Stanford'],
    experienceYears: 20,
    bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement.',
    rating: 4.7,
    consultationFee: 300,
    feeCurrency: 'USD',
  },

  // UK Doctors
  {
    name: 'Dr. Emma Thompson',
    slug: 'dr-emma-thompson-neurology',
    citySlug: 'london',
    countrySlug: 'united-kingdom',
    specialty: 'Neurology',
    qualifications: ['MBBS', 'FRCP', 'Cambridge'],
    experienceYears: 22,
    bio: 'Consultant neurologist with special interest in multiple sclerosis and neurodegenerative diseases.',
    rating: 4.8,
    consultationFee: 250,
    feeCurrency: 'GBP',
  },
  {
    name: 'Mr. David Patel',
    slug: 'mr-david-patel-cardiac-surgery',
    citySlug: 'london',
    countrySlug: 'united-kingdom',
    specialty: 'Cardiac Surgery',
    qualifications: ['MBBS', 'FRCS', 'Imperial College'],
    experienceYears: 28,
    bio: 'Leading cardiac surgeon specializing in minimally invasive heart surgery and valve repairs.',
    rating: 4.9,
    consultationFee: 300,
    feeCurrency: 'GBP',
  },

  // Thailand Doctors
  {
    name: 'Dr. Somchai Wongcharoen',
    slug: 'dr-somchai-wongcharoen-cosmetic',
    citySlug: 'bangkok',
    countrySlug: 'thailand',
    specialty: 'Plastic Surgery',
    qualifications: ['MD', 'Board Certified', 'Chulalongkorn University'],
    experienceYears: 15,
    bio: 'Award-winning plastic surgeon known for facial rejuvenation and body contouring procedures.',
    rating: 4.8,
    consultationFee: 3000,
    feeCurrency: 'THB',
  },
  {
    name: 'Dr. Pranee Sirikulchayanont',
    slug: 'dr-pranee-sirikulchayanont-ivf',
    citySlug: 'bangkok',
    countrySlug: 'thailand',
    specialty: 'Reproductive Medicine',
    qualifications: ['MD', 'PhD', 'Mahidol University'],
    experienceYears: 20,
    bio: 'IVF specialist with high success rates in assisted reproduction and fertility preservation.',
    rating: 4.7,
    consultationFee: 2500,
    feeCurrency: 'THB',
  },

  // Mexico Doctors
  {
    name: 'Dr. Carlos Martinez',
    slug: 'dr-carlos-martinez-bariatric',
    citySlug: 'tijuana',
    countrySlug: 'mexico',
    specialty: 'Bariatric Surgery',
    qualifications: ['MD', 'FACS', 'UNAM'],
    experienceYears: 16,
    bio: 'Renowned bariatric surgeon performing gastric sleeve and bypass procedures for international patients.',
    rating: 4.7,
    consultationFee: 1500,
    feeCurrency: 'MXN',
  },
  {
    name: 'Dr. Ana Garcia',
    slug: 'dr-ana-garcia-dentistry',
    citySlug: 'mexico-city',
    countrySlug: 'mexico',
    specialty: 'Dentistry',
    qualifications: ['DDS', 'Prosthodontics Specialist'],
    experienceYears: 12,
    bio: 'Dental specialist offering full mouth reconstruction and cosmetic dentistry at affordable prices.',
    rating: 4.6,
    consultationFee: 800,
    feeCurrency: 'MXN',
  },

  // Turkey Doctors
  {
    name: 'Dr. Mehmet Yilmaz',
    slug: 'dr-mehmet-yilmaz-hair-transplant',
    citySlug: 'istanbul',
    countrySlug: 'turkey',
    specialty: 'Dermatology',
    qualifications: ['MD', 'Hair Restoration Certified'],
    experienceYears: 14,
    bio: 'Leading hair transplant specialist with over 5000 successful FUE procedures.',
    rating: 4.8,
    consultationFee: 500,
    feeCurrency: 'TRY',
  },
  {
    name: 'Dr. Ayse Demir',
    slug: 'dr-ayse-demir-ophthalmology',
    citySlug: 'istanbul',
    countrySlug: 'turkey',
    specialty: 'Ophthalmology',
    qualifications: ['MD', 'FEBO', 'Istanbul University'],
    experienceYears: 18,
    bio: 'Eye surgeon specializing in LASIK, cataract surgery, and corneal treatments.',
    rating: 4.7,
    consultationFee: 600,
    feeCurrency: 'TRY',
  },

  // UAE Doctors
  {
    name: 'Dr. Ahmed Al-Mansouri',
    slug: 'dr-ahmed-almansouri-cardiology',
    citySlug: 'dubai',
    countrySlug: 'united-arab-emirates',
    specialty: 'Cardiology',
    qualifications: ['MD', 'FACC', 'King Edward Medical University'],
    experienceYears: 24,
    bio: 'Interventional cardiologist with expertise in complex coronary procedures.',
    rating: 4.8,
    consultationFee: 800,
    feeCurrency: 'AED',
  },
  {
    name: 'Dr. Fatima Hassan',
    slug: 'dr-fatima-hassan-pediatrics',
    citySlug: 'abu-dhabi',
    countrySlug: 'united-arab-emirates',
    specialty: 'Pediatrics',
    qualifications: ['MBBS', 'MRCPCH', 'UAE Board Certified'],
    experienceYears: 15,
    bio: 'Pediatrician specializing in developmental disorders and pediatric allergies.',
    rating: 4.7,
    consultationFee: 600,
    feeCurrency: 'AED',
  },
];

// ════════════════════════════════════════════════════════════════════════════
// SEED FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

async function seedGeographies() {
  console.log('[INFO] Seeding geographies...');

  const geoMap: Map<string, number> = new Map();

  for (const country of countriesData) {
    // Create or update country
    const existingCountry = await prisma.geography.findFirst({
      where: { slug: country.slug, level: 'country' },
    });

    let countryRecord;
    if (existingCountry) {
      countryRecord = existingCountry;
      console.log(`  [*] Country exists: ${country.name}`);
    } else {
      countryRecord = await prisma.geography.create({
        data: {
          name: country.name,
          slug: country.slug,
          level: 'country',
          isoCode: country.isoCode,
          supportedLanguages: country.languages,
          isActive: true,
        },
      });
      console.log(`  [+] Created country: ${country.name}`);
    }
    geoMap.set(country.slug, countryRecord.id);

    // Create states
    for (const state of country.states) {
      const existingState = await prisma.geography.findFirst({
        where: { slug: state.slug, level: 'state', parentId: countryRecord.id },
      });

      let stateRecord;
      if (existingState) {
        stateRecord = existingState;
      } else {
        stateRecord = await prisma.geography.create({
          data: {
            name: state.name,
            slug: state.slug,
            level: 'state',
            parentId: countryRecord.id,
            supportedLanguages: country.languages,
            isActive: true,
          },
        });
        console.log(`    [+] Created state: ${state.name}`);
      }
      geoMap.set(`${country.slug}/${state.slug}`, stateRecord.id);

      // Create cities
      for (const city of state.cities) {
        const existingCity = await prisma.geography.findFirst({
          where: { slug: city.slug, level: 'city', parentId: stateRecord.id },
        });

        if (!existingCity) {
          const cityRecord = await prisma.geography.create({
            data: {
              name: city.name,
              slug: city.slug,
              level: 'city',
              parentId: stateRecord.id,
              latitude: city.lat,
              longitude: city.lng,
              supportedLanguages: country.languages,
              isActive: true,
            },
          });
          geoMap.set(`${country.slug}/${city.slug}`, cityRecord.id);
          console.log(`      [+] Created city: ${city.name}`);
        } else {
          geoMap.set(`${country.slug}/${city.slug}`, existingCity.id);
        }
      }
    }
  }

  return geoMap;
}

async function seedHospitals(geoMap: Map<string, number>) {
  console.log('\n[INFO] Seeding hospitals...');

  for (const hospital of hospitalsData) {
    const cityGeoId = geoMap.get(`${hospital.countrySlug}/${hospital.citySlug}`);
    if (!cityGeoId) {
      console.log(`  [!] Skipping ${hospital.name} - city not found: ${hospital.citySlug}`);
      continue;
    }

    const existing = await prisma.hospital.findUnique({
      where: { slug: hospital.slug },
    });

    if (existing) {
      console.log(`  [*] Hospital exists: ${hospital.name}`);
      continue;
    }

    await prisma.hospital.create({
      data: {
        name: hospital.name,
        slug: hospital.slug,
        geographyId: cityGeoId,
        hospitalType: hospital.hospitalType,
        ownershipType: hospital.ownershipType,
        description: `<p>${hospital.description}</p>`,
        bedCount: hospital.bedCount,
        accreditations: hospital.accreditations,
        website: hospital.website,
        overallRating: hospital.overallRating,
        isVerified: true,
        isFeatured: true,
        isActive: true,
      },
    });
    console.log(`  [+] Created hospital: ${hospital.name}`);

    // Add specialties
    const createdHospital = await prisma.hospital.findUnique({ where: { slug: hospital.slug } });
    if (createdHospital) {
      for (const spec of hospital.specialties) {
        await prisma.hospitalSpecialty.create({
          data: {
            hospitalId: createdHospital.id,
            specialty: spec,
            description: `${spec} services at ${hospital.name}`,
            isCenter: true,
          },
        });
      }
    }
  }
}

async function seedDoctors(geoMap: Map<string, number>) {
  console.log('\n[INFO] Seeding doctors...');

  // Get or create condition for specialty mapping
  const specialtyMap = new Map<string, number>();

  for (const doctor of doctorsData) {
    const cityGeoId = geoMap.get(`${doctor.countrySlug}/${doctor.citySlug}`);
    if (!cityGeoId) {
      console.log(`  [!] Skipping ${doctor.name} - city not found: ${doctor.citySlug}`);
      continue;
    }

    const existing = await prisma.doctorProvider.findUnique({
      where: { slug: doctor.slug },
    });

    if (existing) {
      console.log(`  [*] Doctor exists: ${doctor.name}`);
      continue;
    }

    // Create doctor
    await prisma.doctorProvider.create({
      data: {
        name: doctor.name,
        slug: doctor.slug,
        bio: doctor.bio,
        qualifications: doctor.qualifications,
        experienceYears: doctor.experienceYears,
        geographyId: cityGeoId,
        rating: doctor.rating,
        consultationFee: doctor.consultationFee,
        feeCurrency: doctor.feeCurrency,
        isVerified: true,
        subscriptionTier: 'premium',
        badgeScore: 85 + Math.random() * 10,
      },
    });
    console.log(`  [+] Created doctor: ${doctor.name} (${doctor.specialty})`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('       AIHEALZ GLOBAL DATA SEED SCRIPT                         ');
  console.log('================================================================\n');

  const geoMap = await seedGeographies();
  await seedHospitals(geoMap);
  await seedDoctors(geoMap);

  // Summary stats
  const countryCount = await prisma.geography.count({ where: { level: 'country' } });
  const stateCount = await prisma.geography.count({ where: { level: 'state' } });
  const cityCount = await prisma.geography.count({ where: { level: 'city' } });
  const hospitalCount = await prisma.hospital.count();
  const doctorCount = await prisma.doctorProvider.count();

  console.log('\n================================================================');
  console.log('SUMMARY');
  console.log(`   Countries: ${countryCount}`);
  console.log(`   States/Regions: ${stateCount}`);
  console.log(`   Cities: ${cityCount}`);
  console.log(`   Hospitals: ${hospitalCount}`);
  console.log(`   Doctors: ${doctorCount}`);
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('[ERROR] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
