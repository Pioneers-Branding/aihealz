import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/admin/seed-doctors
 *
 * Seeds realistic doctor profiles - one per specialty per major city
 * Stores specialty info in qualifications and contactInfo (no DoctorSpecialty link)
 */

const SPECIALTIES = [
    { name: 'Cardiologist', slug: 'cardiologist', description: 'Heart and cardiovascular system specialist', category: 'medical' },
    { name: 'Dermatologist', slug: 'dermatologist', description: 'Skin, hair, and nail specialist', category: 'medical' },
    { name: 'Orthopedic Surgeon', slug: 'orthopedic-surgeon', description: 'Bone, joint, and muscle specialist', category: 'surgical' },
    { name: 'Neurologist', slug: 'neurologist', description: 'Brain and nervous system specialist', category: 'medical' },
    { name: 'Pediatrician', slug: 'pediatrician', description: 'Child health specialist', category: 'medical' },
    { name: 'Gynecologist', slug: 'gynecologist', description: "Women's health specialist", category: 'medical' },
    { name: 'Ophthalmologist', slug: 'ophthalmologist', description: 'Eye specialist', category: 'surgical' },
    { name: 'ENT Specialist', slug: 'ent-specialist', description: 'Ear, nose, and throat specialist', category: 'surgical' },
    { name: 'Gastroenterologist', slug: 'gastroenterologist', description: 'Digestive system specialist', category: 'medical' },
    { name: 'Pulmonologist', slug: 'pulmonologist', description: 'Lung and respiratory specialist', category: 'medical' },
    { name: 'Endocrinologist', slug: 'endocrinologist', description: 'Hormone and metabolism specialist', category: 'medical' },
    { name: 'Psychiatrist', slug: 'psychiatrist', description: 'Mental health specialist', category: 'medical' },
    { name: 'Urologist', slug: 'urologist', description: 'Urinary tract specialist', category: 'surgical' },
    { name: 'Nephrologist', slug: 'nephrologist', description: 'Kidney specialist', category: 'medical' },
    { name: 'Oncologist', slug: 'oncologist', description: 'Cancer specialist', category: 'medical' },
    { name: 'Rheumatologist', slug: 'rheumatologist', description: 'Arthritis and autoimmune specialist', category: 'medical' },
    { name: 'General Physician', slug: 'general-physician', description: 'Primary care doctor', category: 'medical' },
    { name: 'Dentist', slug: 'dentist', description: 'Dental and oral health specialist', category: 'dental' },
    { name: 'Physiotherapist', slug: 'physiotherapist', description: 'Physical rehabilitation specialist', category: 'therapy' },
    { name: 'Plastic Surgeon', slug: 'plastic-surgeon', description: 'Reconstructive and cosmetic surgery specialist', category: 'surgical' },
];

// Names by region
const DOCTOR_NAMES: Record<string, { male: string[]; female: string[] }> = {
    india: {
        male: ['Rajesh Kumar', 'Amit Sharma', 'Vikram Singh', 'Suresh Patel', 'Anil Gupta', 'Rahul Verma', 'Manoj Reddy', 'Sanjay Mehta', 'Deepak Joshi', 'Prakash Rao'],
        female: ['Priya Sharma', 'Anjali Gupta', 'Sunita Patel', 'Meera Krishnan', 'Kavita Reddy', 'Neha Singh', 'Pooja Verma', 'Divya Nair', 'Lakshmi Iyer', 'Aarti Desai'],
    },
    usa: {
        male: ['James Wilson', 'Michael Brown', 'David Johnson', 'Robert Smith', 'William Davis', 'John Anderson', 'Richard Taylor', 'Joseph Martinez', 'Thomas Garcia', 'Charles Miller'],
        female: ['Sarah Johnson', 'Emily Davis', 'Jessica Wilson', 'Jennifer Brown', 'Amanda Smith', 'Ashley Taylor', 'Stephanie Anderson', 'Nicole Martinez', 'Michelle Garcia', 'Laura Miller'],
    },
    uk: {
        male: ['James Thompson', 'Oliver Williams', 'William Davies', 'Harry Wilson', 'George Taylor', 'Jack Brown', 'Thomas Jones', 'Daniel Evans', 'Matthew Roberts', 'Joseph Walker'],
        female: ['Emma Thompson', 'Olivia Williams', 'Sophie Davies', 'Amelia Wilson', 'Charlotte Taylor', 'Mia Brown', 'Isabella Jones', 'Emily Evans', 'Grace Roberts', 'Lily Walker'],
    },
    uae: {
        male: ['Ahmed Al-Farsi', 'Mohammed Hassan', 'Khalid Rahman', 'Omar Abdullah', 'Hassan Ali', 'Yusuf Ibrahim', 'Tariq Mahmoud', 'Saeed Al-Rashid', 'Faisal Al-Nasser', 'Hamad Al-Thani'],
        female: ['Fatima Al-Hassan', 'Aisha Mohammed', 'Maryam Ibrahim', 'Noura Al-Rashid', 'Sara Al-Farsi', 'Huda Rahman', 'Layla Abdullah', 'Zainab Ali', 'Reem Al-Nasser', 'Dana Al-Thani'],
    },
    default: {
        male: ['John Smith', 'David Lee', 'Michael Chen', 'Robert Kim', 'William Park', 'James Wang', 'Thomas Liu', 'Richard Zhang', 'Joseph Wong', 'Daniel Tan'],
        female: ['Sarah Lee', 'Emily Chen', 'Jessica Kim', 'Jennifer Park', 'Amanda Wang', 'Ashley Liu', 'Stephanie Zhang', 'Nicole Wong', 'Michelle Tan', 'Laura Yang'],
    },
};

// Phone formats by country
const PHONE_FORMATS: Record<string, { code: string; format: () => string }> = {
    india: { code: '+91', format: () => `98765 ${String(10000 + Math.floor(Math.random() * 89999))}` },
    usa: { code: '+1', format: () => `${String(200 + Math.floor(Math.random() * 799))} ${String(200 + Math.floor(Math.random() * 799))} ${String(1000 + Math.floor(Math.random() * 8999))}` },
    uk: { code: '+44', format: () => `7${String(100 + Math.floor(Math.random() * 899))} ${String(100000 + Math.floor(Math.random() * 899999))}` },
    uae: { code: '+971', format: () => `50 ${String(100 + Math.floor(Math.random() * 899))} ${String(1000 + Math.floor(Math.random() * 8999))}` },
    default: { code: '+1', format: () => `555 ${String(100 + Math.floor(Math.random() * 899))} ${String(1000 + Math.floor(Math.random() * 8999))}` },
};

const QUALIFICATIONS: Record<string, string[]> = {
    'cardiologist': ['MBBS', 'MD (Cardiology)', 'DM (Cardiology)', 'FACC'],
    'dermatologist': ['MBBS', 'MD (Dermatology)', 'DVD', 'FRCP'],
    'orthopedic-surgeon': ['MBBS', 'MS (Ortho)', 'MCh (Ortho)', 'FRCS'],
    'neurologist': ['MBBS', 'MD (Neurology)', 'DM (Neurology)', 'FRCP'],
    'pediatrician': ['MBBS', 'MD (Pediatrics)', 'DCH', 'MRCPCH'],
    'gynecologist': ['MBBS', 'MS (OBG)', 'DGO', 'FRCOG'],
    'ophthalmologist': ['MBBS', 'MS (Ophthalmology)', 'DO', 'FRCS'],
    'ent-specialist': ['MBBS', 'MS (ENT)', 'DLO', 'FRCS'],
    'gastroenterologist': ['MBBS', 'MD (Gastro)', 'DM (Gastro)', 'FACG'],
    'pulmonologist': ['MBBS', 'MD (Pulmonology)', 'DTCD', 'FCCP'],
    'endocrinologist': ['MBBS', 'MD (Medicine)', 'DM (Endocrinology)'],
    'psychiatrist': ['MBBS', 'MD (Psychiatry)', 'DPM', 'MRCPsych'],
    'urologist': ['MBBS', 'MS (Surgery)', 'MCh (Urology)', 'FRCS'],
    'nephrologist': ['MBBS', 'MD (Medicine)', 'DM (Nephrology)'],
    'oncologist': ['MBBS', 'MD (Oncology)', 'DM (Medical Oncology)'],
    'rheumatologist': ['MBBS', 'MD (Medicine)', 'DM (Rheumatology)'],
    'general-physician': ['MBBS', 'MD (Medicine)', 'DNB'],
    'dentist': ['BDS', 'MDS', 'FDSRCS'],
    'physiotherapist': ['BPT', 'MPT', 'PhD (Physiotherapy)'],
    'plastic-surgeon': ['MBBS', 'MS (Surgery)', 'MCh (Plastic Surgery)'],
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { limit = 20 } = body;

        // Get active cities
        const cities = await prisma.geography.findMany({
            where: {
                level: 'city',
                isActive: true,
            },
            include: {
                parent: {
                    include: {
                        parent: true, // country
                    },
                },
            },
            take: limit,
        });

        // First, ensure specialties exist in MedicalSpecialty table (for reference)
        console.log('Creating specialties...');
        for (const spec of SPECIALTIES) {
            await prisma.medicalSpecialty.upsert({
                where: { slug: spec.slug },
                update: {},
                create: {
                    name: spec.name,
                    slug: spec.slug,
                    description: spec.description,
                    category: spec.category,
                    isActive: true,
                },
            });
        }

        const results: { city: string; added: number; errors: string[] }[] = [];
        let totalAdded = 0;

        for (const city of cities) {
            const cityName = city.name;
            const countrySlug = city.parent?.parent?.slug || 'india';
            const errors: string[] = [];
            let added = 0;

            // Get names for this region
            const names = DOCTOR_NAMES[countrySlug] || DOCTOR_NAMES.default;

            // Create one doctor per specialty for this city
            for (let i = 0; i < SPECIALTIES.length; i++) {
                const specialty = SPECIALTIES[i];
                const isFemale = i % 3 === 0; // Mix of male/female
                const nameList = isFemale ? names.female : names.male;
                const nameIndex = i % nameList.length;
                const doctorName = nameList[nameIndex];

                // Generate unique slug
                const slug = `dr-${doctorName.toLowerCase().replace(/\s+/g, '-')}-${specialty.slug}-${city.slug}`;

                // Check if doctor with this slug already exists
                const existingDoctor = await prisma.doctorProvider.findUnique({
                    where: { slug },
                });

                if (existingDoctor) continue;

                try {
                    const experience = 8 + Math.floor(Math.random() * 20); // 8-28 years
                    const consultationFee = Math.round((500 + Math.random() * 1500) / 100) * 100; // 500-2000 rounded

                    const qualifications = QUALIFICATIONS[specialty.slug] || ['MBBS', 'MD'];

                    await prisma.doctorProvider.create({
                        data: {
                            name: `Dr. ${doctorName}`,
                            slug,
                            bio: `${specialty.name} with ${experience}+ years of experience. Specializing in ${specialty.description.toLowerCase()}. Committed to providing exceptional patient care.`,
                            qualifications,
                            experienceYears: experience,
                            consultationFee,
                            feeCurrency: countrySlug === 'usa' ? 'USD' : countrySlug === 'uk' ? 'GBP' : countrySlug === 'uae' ? 'AED' : 'INR',
                            geographyId: city.id,
                            isVerified: true,
                            subscriptionTier: 'free',
                            availableOnline: Math.random() > 0.3, // 70% available online
                            contactInfo: {
                                phone: `${(PHONE_FORMATS[countrySlug] || PHONE_FORMATS.default).code} ${(PHONE_FORMATS[countrySlug] || PHONE_FORMATS.default).format()}`,
                                specialty: specialty.name,
                                specialtySlug: specialty.slug,
                            },
                        },
                    });

                    added++;
                    totalAdded++;
                } catch (err: any) {
                    errors.push(`${specialty.name}: ${err.message?.substring(0, 100)}`);
                }
            }

            results.push({ city: cityName, added, errors });
        }

        return NextResponse.json({
            success: true,
            message: `Added ${totalAdded} doctors across ${cities.length} cities`,
            specialtiesCreated: SPECIALTIES.length,
            results,
        });
    } catch (error: any) {
        console.error('Seed doctors error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    const [doctors, specialties] = await Promise.all([
        prisma.doctorProvider.count(),
        prisma.medicalSpecialty.count(),
    ]);

    return NextResponse.json({
        doctors,
        specialties,
        message: `Database has ${doctors} doctors and ${specialties} specialties`,
    });
}
