import 'dotenv/config';
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

// Sample hospitals data (using correct schema field names)
const hospitalsData = [
  {
    name: 'Apollo Hospitals',
    slug: 'apollo-hospitals-delhi',
    city: 'Delhi',
    address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076',
    hospitalType: 'corporate_chain' as const,
    ownershipType: 'Public Listed',
    parentOrganization: 'Apollo Hospitals Enterprise Ltd',
    ownerName: 'Dr. Prathap C. Reddy',
    establishedYear: 1983,
    bedCount: 710,
    icuBeds: 250,
    operationTheaters: 35,
    emergencyBeds: 50,
    accreditations: ['NABH', 'JCI', 'NABL'],
    description: '<p>Apollo Hospitals, Delhi is one of the largest and most comprehensive healthcare facilities in India. Established in 1983 by Dr. Prathap C. Reddy, it pioneered private healthcare in India.</p><p>The hospital offers advanced treatments in cardiology, oncology, neurology, orthopedics, and organ transplantation.</p>',
    tagline: 'The Heartbeat of Healthcare',
    prosForPatients: ['World-class infrastructure', 'Renowned doctors', 'Advanced technology', '24/7 emergency services', 'International patient services'],
    consForPatients: ['Can be expensive', 'Long wait times for some departments', 'Parking can be difficult'],
    awards: [
      { year: 2023, award: 'Best Multi-Specialty Hospital', org: 'Times Healthcare' },
      { year: 2022, award: 'Excellence in Cardiac Care', org: 'FICCI' },
    ],
    notablePatients: [
      { name: 'MS Dhoni', type: 'Sportsman', condition: 'Knee surgery', treatedBy: 'Dr. SK Wangjam' },
      { name: 'Amitabh Bachchan', type: 'Celebrity', condition: 'Health checkup', year: 2018 },
    ],
    scandals: [],
    overallRating: 4.5,
    domesticRating: 4.4,
    internationalRating: 4.7,
    reviewCount: 2500,
    website: 'https://www.apollohospitals.com',
    isVerified: true,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Fortis Memorial Research Institute',
    slug: 'fortis-memorial-gurgaon',
    city: 'Gurgaon',
    address: 'Sector 44, Gurgaon, Haryana - 122002',
    hospitalType: 'corporate_chain' as const,
    ownershipType: 'Private',
    parentOrganization: 'Fortis Healthcare Ltd (IHH Healthcare)',
    ownerName: 'IHH Healthcare Berhad',
    establishedYear: 2001,
    bedCount: 1000,
    icuBeds: 300,
    operationTheaters: 40,
    emergencyBeds: 75,
    accreditations: ['NABH', 'JCI', 'NABL'],
    description: '<p>Fortis Memorial Research Institute (FMRI) is a multi-super specialty, quaternary care hospital with a focus on clinical excellence.</p>',
    tagline: 'Saving and Enriching Lives',
    prosForPatients: ['State-of-the-art facilities', 'Strong oncology department', 'Robotic surgery', 'Air ambulance services'],
    consForPatients: ['Premium pricing', 'Located in outskirts'],
    awards: [
      { year: 2023, award: 'Best Hospital in North India', org: 'Outlook' },
    ],
    overallRating: 4.4,
    domesticRating: 4.3,
    internationalRating: 4.6,
    reviewCount: 1800,
    website: 'https://www.fortishealthcare.com',
    isVerified: true,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'AIIMS Delhi',
    slug: 'aiims-delhi',
    city: 'Delhi',
    address: 'Ansari Nagar, New Delhi - 110029',
    hospitalType: 'teaching' as const,
    ownershipType: 'Government',
    parentOrganization: 'Ministry of Health and Family Welfare, Govt. of India',
    establishedYear: 1956,
    bedCount: 2500,
    icuBeds: 400,
    operationTheaters: 60,
    emergencyBeds: 200,
    accreditations: ['NABH', 'NABL'],
    description: '<p>All India Institute of Medical Sciences (AIIMS) is a premier medical institution and hospital. It is an autonomous institute of national importance.</p>',
    tagline: 'A Symbol of Healthcare Excellence',
    prosForPatients: ['Highly subsidized treatment', 'Top medical experts', 'Research-backed treatment', 'Comprehensive care'],
    consForPatients: ['Very long waiting times', 'Overcrowded', 'Infrastructure needs upgrade'],
    awards: [
      { year: 2023, award: 'Top Medical Institution in India', org: 'NIRF' },
    ],
    overallRating: 4.2,
    domesticRating: 4.3,
    internationalRating: 3.8,
    reviewCount: 5000,
    website: 'https://www.aiims.edu',
    isVerified: true,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Medanta - The Medicity',
    slug: 'medanta-medicity-gurgaon',
    city: 'Gurgaon',
    address: 'Sector 38, Gurgaon, Haryana - 122001',
    hospitalType: 'corporate_chain' as const,
    ownershipType: 'Private',
    parentOrganization: 'Global Health Ltd',
    ownerName: 'Dr. Naresh Trehan',
    establishedYear: 2009,
    bedCount: 1600,
    icuBeds: 350,
    operationTheaters: 45,
    emergencyBeds: 100,
    accreditations: ['NABH', 'JCI', 'NABL'],
    description: '<p>Medanta - The Medicity is a multi-super specialty institute founded by Dr. Naresh Trehan, a world-renowned cardiovascular surgeon.</p>',
    tagline: 'We Treat, He Cures',
    prosForPatients: ['World-class cardiac care', 'Expert doctors', 'Advanced technology', 'International patient coordinator'],
    consForPatients: ['Expensive', 'Can be impersonal at times'],
    awards: [
      { year: 2023, award: 'Best Cardiac Care Hospital', org: 'FICCI' },
    ],
    notablePatients: [
      { name: 'Manmohan Singh', type: 'Politician', condition: 'Cardiac bypass', treatedBy: 'Dr. Naresh Trehan' },
    ],
    overallRating: 4.6,
    domesticRating: 4.5,
    internationalRating: 4.8,
    reviewCount: 2200,
    website: 'https://www.medanta.org',
    isVerified: true,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Tata Memorial Hospital',
    slug: 'tata-memorial-mumbai',
    city: 'Mumbai',
    address: 'Dr. E Borges Road, Parel, Mumbai - 400012',
    hospitalType: 'trust' as const,
    ownershipType: 'Trust',
    parentOrganization: 'Tata Memorial Centre',
    establishedYear: 1941,
    bedCount: 629,
    icuBeds: 100,
    operationTheaters: 25,
    emergencyBeds: 30,
    accreditations: ['NABH', 'NABL'],
    description: '<p>Tata Memorial Hospital is one of the oldest and most renowned cancer treatment centers in India. It is affiliated with Homi Bhabha National Institute.</p>',
    tagline: 'Fighting Cancer, Giving Hope',
    prosForPatients: ['Best oncology care in India', 'Affordable treatment', 'Research-focused', 'Compassionate care'],
    consForPatients: ['Long waiting lists', 'Limited to cancer treatment'],
    awards: [
      { year: 2023, award: 'Best Cancer Hospital in Asia', org: 'Newsweek' },
    ],
    overallRating: 4.7,
    domesticRating: 4.7,
    internationalRating: 4.6,
    reviewCount: 3500,
    website: 'https://tmc.gov.in',
    isVerified: true,
    isFeatured: true,
    isActive: true,
  },
];

// Sample insurance providers (using correct schema field names)
const insuranceData = [
  {
    name: 'Star Health Insurance',
    slug: 'star-health-insurance',
    providerType: 'private' as const,
    licenseNumber: 'IRDAI/129',
    regulatoryBody: 'IRDAI',
    establishedYear: 2006,
    headquartersCity: 'Chennai',
    headquartersCountry: 'India',
    description: '<p>Star Health and Allied Insurance is India\'s first standalone health insurance company. It offers a wide range of health insurance products for individuals and families.</p>',
    claimSettlementRatio: 95.2,
    website: 'https://www.starhealth.in',
    customerCarePhone: '1800-425-2255',
    email: 'info@starhealth.in',
    isActive: true,
  },
  {
    name: 'HDFC ERGO Health Insurance',
    slug: 'hdfc-ergo-health',
    providerType: 'private' as const,
    licenseNumber: 'IRDAI/146',
    regulatoryBody: 'IRDAI',
    establishedYear: 2002,
    headquartersCity: 'Mumbai',
    headquartersCountry: 'India',
    description: '<p>HDFC ERGO is a joint venture between HDFC Ltd and ERGO International AG. It is one of the leading private general insurance companies in India.</p>',
    claimSettlementRatio: 94.5,
    website: 'https://www.hdfcergo.com',
    customerCarePhone: '1800-2666-400',
    email: 'care@hdfcergo.com',
    isActive: true,
  },
  {
    name: 'Max Bupa Health Insurance',
    slug: 'max-bupa-health',
    providerType: 'private' as const,
    licenseNumber: 'IRDAI/145',
    regulatoryBody: 'IRDAI',
    establishedYear: 2008,
    headquartersCity: 'New Delhi',
    headquartersCountry: 'India',
    description: '<p>Max Bupa (now Niva Bupa) is a leading standalone health insurance company offering comprehensive health coverage.</p>',
    claimSettlementRatio: 93.8,
    website: 'https://www.nivabupa.com',
    customerCarePhone: '1800-200-5577',
    email: 'care@nivabupa.com',
    isActive: true,
  },
  {
    name: 'National Insurance Company',
    slug: 'national-insurance-company',
    providerType: 'public' as const,
    licenseNumber: 'IRDAI/002',
    regulatoryBody: 'IRDAI',
    establishedYear: 1906,
    headquartersCity: 'Kolkata',
    headquartersCountry: 'India',
    description: '<p>National Insurance Company is one of the oldest insurance companies in India, a public sector undertaking under the Government of India.</p>',
    claimSettlementRatio: 88.5,
    website: 'https://www.nationalinsurance.nic.co.in',
    customerCarePhone: '1800-345-0330',
    isActive: true,
  },
  {
    name: 'Ayushman Bharat - PMJAY',
    slug: 'ayushman-bharat-pmjay',
    providerType: 'government' as const,
    regulatoryBody: 'National Health Authority',
    establishedYear: 2018,
    headquartersCity: 'New Delhi',
    headquartersCountry: 'India',
    description: '<p>Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY) is the world\'s largest health insurance scheme fully financed by the government.</p>',
    claimSettlementRatio: 92.0,
    website: 'https://pmjay.gov.in',
    customerCarePhone: '14555',
    isActive: true,
  },
];

// Sample TPAs (using correct schema field names)
const tpaData = [
  {
    name: 'Medi Assist Insurance TPA',
    slug: 'medi-assist-tpa',
    tpaType: 'private' as const,
    licenseNumber: 'IRDAI/HLT/TPA/001/2001',
    regulatoryBody: 'IRDAI',
    description: 'Medi Assist is one of the largest TPAs in India, providing cashless hospitalization services.',
    establishedYear: 2000,
    headquartersCity: 'Bangalore',
    website: 'https://www.mediassistindia.com',
    customerCarePhone: '1800-425-3400',
    email: 'customersupport@mediassist.in',
    isActive: true,
  },
  {
    name: 'Paramount Health Services TPA',
    slug: 'paramount-tpa',
    tpaType: 'private' as const,
    licenseNumber: 'IRDAI/HLT/TPA/002/2001',
    regulatoryBody: 'IRDAI',
    description: 'Paramount TPA provides third party administration services for health insurance claims.',
    establishedYear: 2001,
    headquartersCity: 'Mumbai',
    website: 'https://www.paramounttpa.com',
    customerCarePhone: '1800-103-8008',
    email: 'support@paramounttpa.com',
    isActive: true,
  },
  {
    name: 'Vidal Health TPA',
    slug: 'vidal-health-tpa',
    tpaType: 'private' as const,
    licenseNumber: 'IRDAI/HLT/TPA/005/2002',
    regulatoryBody: 'IRDAI',
    description: 'Vidal Health Insurance TPA provides end-to-end health insurance administration services.',
    establishedYear: 2002,
    headquartersCity: 'Hyderabad',
    website: 'https://www.vidalhealth.com',
    customerCarePhone: '1800-212-3456',
    email: 'contact@vidalhealth.com',
    isActive: true,
  },
  {
    name: 'Health India TPA Services',
    slug: 'health-india-tpa',
    tpaType: 'private' as const,
    licenseNumber: 'IRDAI/HLT/TPA/010/2003',
    regulatoryBody: 'IRDAI',
    description: 'Health India TPA provides comprehensive health insurance administration.',
    establishedYear: 2003,
    headquartersCity: 'Chennai',
    website: 'https://www.healthindiatpa.com',
    customerCarePhone: '1800-103-3131',
    email: 'info@healthindiatpa.com',
    isActive: true,
  },
];

// Sample insurance plans (using correct schema field names)
const plansData = [
  {
    insurerSlug: 'star-health-insurance',
    plans: [
      {
        name: 'Star Comprehensive Insurance',
        slug: 'star-comprehensive',
        planType: 'individual' as const,
        description: 'Complete health coverage with no room rent limits',
        sumInsuredMin: 500000,
        sumInsuredMax: 10000000,
        premiumStartsAt: 8000,
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 100,
        coverageHighlights: ['No room rent capping', 'No co-pay', 'Annual health checkup', 'Day care coverage', 'Organ donor expenses'],
        preExistingWaitYears: 3,
        specificDiseaseWait: 730,
        preCoverDays: 60,
        postCoverDays: 90,
        dayCareProcedures: true,
        ambulanceCover: 2500,
        organDonorCover: true,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Star Family Health Optima',
        slug: 'star-family-health-optima',
        planType: 'family_floater' as const,
        description: 'Family floater plan with automatic recharge',
        sumInsuredMin: 300000,
        sumInsuredMax: 2500000,
        premiumStartsAt: 12000,
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 75,
        coverageHighlights: ['Automatic recharge', 'Maternity cover', 'New born cover', 'No claim bonus'],
        preExistingWaitYears: 4,
        maternitycover: true,
        restoreBenefit: true,
        noClaimBonus: '50% increase',
        isFeatured: true,
        isActive: true,
      },
    ],
  },
  {
    insurerSlug: 'hdfc-ergo-health',
    plans: [
      {
        name: 'Optima Secure',
        slug: 'optima-secure',
        planType: 'individual' as const,
        description: 'Comprehensive health plan with unlimited sum insured',
        sumInsuredMin: 300000,
        sumInsuredMax: 50000000,
        premiumStartsAt: 7500,
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 99,
        coverageHighlights: ['Unlimited sum insured option', 'Global coverage', 'Wellness benefits', 'OPD cover'],
        preExistingWaitYears: 3,
        isFeatured: true,
        isActive: true,
      },
    ],
  },
  {
    insurerSlug: 'ayushman-bharat-pmjay',
    plans: [
      {
        name: 'Ayushman Bharat Coverage',
        slug: 'ayushman-bharat-coverage',
        planType: 'family_floater' as const,
        description: 'Government scheme for economically weaker sections',
        sumInsuredMin: 500000,
        sumInsuredMax: 500000,
        premiumStartsAt: 0,
        entryAgeMin: 0,
        entryAgeMax: 100,
        renewableUpto: 100,
        coverageHighlights: ['Completely free', 'Cashless at empaneled hospitals', 'Covers pre-existing diseases from day 1', 'No waiting period'],
        preExistingWaitYears: 0,
        preCoverDays: 3,
        postCoverDays: 15,
        isFeatured: true,
        isActive: true,
      },
    ],
  },
];

// Hospital specialties
const specialtiesData = [
  { name: 'Cardiology & Cardiac Surgery', slug: 'cardiology', description: 'Heart and cardiovascular system treatments' },
  { name: 'Oncology', slug: 'oncology', description: 'Cancer treatment and care' },
  { name: 'Neurology & Neurosurgery', slug: 'neurology', description: 'Brain and nervous system disorders' },
  { name: 'Orthopedics', slug: 'orthopedics', description: 'Bone, joint and musculoskeletal treatments' },
  { name: 'Gastroenterology', slug: 'gastroenterology', description: 'Digestive system disorders' },
  { name: 'Nephrology', slug: 'nephrology', description: 'Kidney diseases and dialysis' },
  { name: 'Urology', slug: 'urology', description: 'Urinary tract and male reproductive system' },
  { name: 'Pulmonology', slug: 'pulmonology', description: 'Respiratory and lung disorders' },
  { name: 'Endocrinology', slug: 'endocrinology', description: 'Hormonal and metabolic disorders' },
  { name: 'Organ Transplant', slug: 'organ-transplant', description: 'Liver, kidney, heart transplants' },
];

async function seed() {
  console.log('Starting hospital and insurance seeding...');

  // Get Delhi geography
  let delhiGeo = await prisma.geography.findFirst({
    where: { slug: 'delhi', level: 'city' },
  });

  if (!delhiGeo) {
    // Create India and Delhi if they don't exist
    let india = await prisma.geography.findFirst({
      where: { slug: 'india', level: 'country' },
    });

    if (!india) {
      india = await prisma.geography.create({
        data: {
          name: 'India',
          slug: 'india',
          level: 'country',
          isoCode: 'IN',
          supportedLanguages: ['en', 'hi'],
          isActive: true,
        },
      });
      console.log('Created India geography');
    }

    delhiGeo = await prisma.geography.create({
      data: {
        name: 'Delhi',
        slug: 'delhi',
        level: 'city',
        parentId: india.id,
        supportedLanguages: ['en', 'hi'],
        isActive: true,
      },
    });
    console.log('Created Delhi geography');
  }

  // Seed Hospitals
  console.log('\nSeeding hospitals...');
  for (const hospitalData of hospitalsData) {
    const existing = await prisma.hospital.findUnique({
      where: { slug: hospitalData.slug },
    });

    if (existing) {
      console.log(`  Hospital ${hospitalData.name} already exists, skipping...`);
      continue;
    }

    const hospital = await prisma.hospital.create({
      data: {
        ...hospitalData,
        geographyId: delhiGeo.id,
        notablePatients: hospitalData.notablePatients || [],
        scandals: hospitalData.scandals || [],
      },
    });
    console.log(`  Created hospital: ${hospital.name}`);

    // Add specialties
    for (const spec of specialtiesData.slice(0, 5)) {
      await prisma.hospitalSpecialty.create({
        data: {
          hospitalId: hospital.id,
          specialty: spec.name,
          description: spec.description,
          isCenter: Math.random() > 0.5,
          keyProcedures: ['Surgery', 'Consultation', 'Diagnosis'],
          successRate: 85 + Math.random() * 10,
        },
      });
    }
    console.log(`    Added ${Math.min(5, specialtiesData.length)} specialties`);
  }

  // Seed Insurance Providers
  console.log('\nSeeding insurance providers...');
  for (const insurerData of insuranceData) {
    const existing = await prisma.insuranceProvider.findUnique({
      where: { slug: insurerData.slug },
    });

    if (existing) {
      console.log(`  Insurance provider ${insurerData.name} already exists, skipping...`);
      continue;
    }

    const insurer = await prisma.insuranceProvider.create({
      data: insurerData,
    });
    console.log(`  Created insurance provider: ${insurer.name}`);
  }

  // Seed TPAs
  console.log('\nSeeding TPAs...');
  for (const tpaInfo of tpaData) {
    const existing = await prisma.tpa.findUnique({
      where: { slug: tpaInfo.slug },
    });

    if (existing) {
      console.log(`  TPA ${tpaInfo.name} already exists, skipping...`);
      continue;
    }

    const tpa = await prisma.tpa.create({
      data: tpaInfo,
    });
    console.log(`  Created TPA: ${tpa.name}`);
  }

  // Seed Insurance Plans
  console.log('\nSeeding insurance plans...');
  for (const planGroup of plansData) {
    const insurer = await prisma.insuranceProvider.findUnique({
      where: { slug: planGroup.insurerSlug },
    });

    if (!insurer) {
      console.log(`  Insurance provider ${planGroup.insurerSlug} not found, skipping plans...`);
      continue;
    }

    for (const planData of planGroup.plans) {
      const existing = await prisma.insurancePlan.findUnique({
        where: { slug: planData.slug },
      });

      if (existing) {
        console.log(`  Plan ${planData.name} already exists, skipping...`);
        continue;
      }

      const plan = await prisma.insurancePlan.create({
        data: {
          ...planData,
          providerId: insurer.id,
        },
      });
      console.log(`  Created plan: ${plan.name}`);
    }
  }

  // Create TPA-Insurance Links
  console.log('\nCreating TPA-Insurance links...');
  const allTPAs = await prisma.tpa.findMany();
  const allInsurers = await prisma.insuranceProvider.findMany({
    where: { providerType: 'private' },
  });

  for (const tpa of allTPAs) {
    for (const insurer of allInsurers.slice(0, 2)) {
      const existing = await prisma.tpaInsuranceLink.findFirst({
        where: { tpaId: tpa.id, insurerId: insurer.id },
      });

      if (!existing) {
        await prisma.tpaInsuranceLink.create({
          data: {
            tpaId: tpa.id,
            insurerId: insurer.id,
            isExclusive: Math.random() > 0.7,
          },
        });
      }
    }
  }
  console.log('  Created TPA-Insurance links');

  // Create Hospital-Insurance Ties
  console.log('\nCreating hospital-insurance cashless ties...');
  const allHospitals = await prisma.hospital.findMany();
  for (const hospital of allHospitals) {
    for (const insurer of allInsurers) {
      const existing = await prisma.hospitalInsuranceTie.findFirst({
        where: { hospitalId: hospital.id, insurerId: insurer.id },
      });

      if (!existing) {
        await prisma.hospitalInsuranceTie.create({
          data: {
            hospitalId: hospital.id,
            insurerId: insurer.id,
            isCashless: true,
            isPreferred: Math.random() > 0.7,
          },
        });
      }
    }
  }
  console.log('  Created hospital-insurance ties');

  console.log('\n Seeding completed successfully!');

  await prisma.$disconnect();
  await pool.end();
}

seed().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
