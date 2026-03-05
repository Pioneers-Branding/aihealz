/**
 * Seed hospitals for ALL regions
 *
 * This script creates at least 1 hospital per city/region
 * to ensure proper coverage for the hospital listing pages.
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz' });

// Hospital types enum matching the schema
type HospitalType = 'government' | 'private' | 'public_private_partnership' | 'charitable' | 'trust' | 'corporate_chain' | 'standalone' | 'teaching' | 'research' | 'military' | 'railway' | 'municipal';

// Hospital chains by type
const HOSPITAL_CHAINS = {
    corporate_chain: [
        { name: 'Apollo Hospitals', parent: 'Apollo Hospitals Enterprise Ltd', tagline: 'The Heartbeat of Healthcare' },
        { name: 'Fortis Healthcare', parent: 'Fortis Healthcare Ltd', tagline: 'Saving and Enriching Lives' },
        { name: 'Max Healthcare', parent: 'Max Healthcare Institute Ltd', tagline: 'Excellence in Healthcare' },
        { name: 'Manipal Hospitals', parent: 'Manipal Health Enterprises', tagline: 'Life Before Everything' },
        { name: 'Narayana Health', parent: 'Narayana Health Ltd', tagline: 'Quality Healthcare for All' },
        { name: 'Aster DM Healthcare', parent: 'Aster DM Healthcare Ltd', tagline: 'We Will Treat You Well' },
        { name: 'Columbia Asia', parent: 'Columbia Asia', tagline: 'Excellence in Healthcare' },
        { name: 'Wockhardt Hospitals', parent: 'Wockhardt Ltd', tagline: 'Advanced Medical Care' },
        { name: 'Shalby Hospitals', parent: 'Shalby Ltd', tagline: 'Joint Replacement Specialists' },
        { name: 'KIMS Hospitals', parent: 'KIMS Healthcare Management Ltd', tagline: 'Quality Healthcare' },
    ],
    teaching: [
        { name: 'Government Medical College Hospital', parent: 'State Medical Education Dept', tagline: 'Excellence in Medical Education' },
        { name: 'Medical College Hospital', parent: 'State Health Dept', tagline: 'Training the Healers of Tomorrow' },
        { name: 'University Hospital', parent: 'State University', tagline: 'Academic Medicine Excellence' },
        { name: 'Institute of Medical Sciences', parent: 'State Govt', tagline: 'Research and Patient Care' },
    ],
    government: [
        { name: 'District Hospital', parent: 'State Health Department', tagline: 'Healthcare for All' },
        { name: 'Civil Hospital', parent: 'State Health Department', tagline: 'Public Healthcare Services' },
        { name: 'General Hospital', parent: 'State Health Department', tagline: 'Quality Government Healthcare' },
        { name: 'Regional Hospital', parent: 'Central Health Ministry', tagline: 'Regional Healthcare Hub' },
        { name: 'Sub-District Hospital', parent: 'State Health Department', tagline: 'Community Healthcare' },
    ],
    private: [
        { name: 'City Hospital', parent: null, tagline: 'Your Health, Our Priority' },
        { name: 'Multispecialty Hospital', parent: null, tagline: 'Comprehensive Healthcare' },
        { name: 'Super Speciality Hospital', parent: null, tagline: 'Specialized Medical Care' },
        { name: 'Nursing Home', parent: null, tagline: 'Personalized Patient Care' },
        { name: 'Polyclinic', parent: null, tagline: 'Multi-specialty Outpatient Care' },
    ],
    trust: [
        { name: 'Mission Hospital', parent: null, tagline: 'Healthcare with Compassion' },
        { name: 'Charitable Hospital', parent: null, tagline: 'Affordable Quality Care' },
        { name: 'Community Hospital', parent: null, tagline: 'Serving the Community' },
        { name: 'Memorial Hospital', parent: null, tagline: 'In Service of Humanity' },
    ],
    standalone: [
        { name: 'Clinic', parent: null, tagline: 'Primary Healthcare' },
        { name: 'Day Care Centre', parent: null, tagline: 'Quick Procedures' },
        { name: 'Diagnostic Centre', parent: null, tagline: 'Accurate Diagnostics' },
    ],
};

// Specialties commonly offered by hospitals
const HOSPITAL_SPECIALTIES = [
    { name: 'Cardiology', procedures: ['Angioplasty', 'Bypass Surgery', 'Pacemaker Implantation'] },
    { name: 'Orthopedics', procedures: ['Joint Replacement', 'Spine Surgery', 'Arthroscopy'] },
    { name: 'Neurology', procedures: ['Brain Surgery', 'Stroke Treatment', 'Epilepsy Management'] },
    { name: 'Oncology', procedures: ['Chemotherapy', 'Radiation Therapy', 'Cancer Surgery'] },
    { name: 'Gastroenterology', procedures: ['Endoscopy', 'Colonoscopy', 'Liver Transplant'] },
    { name: 'Nephrology', procedures: ['Dialysis', 'Kidney Transplant', 'Stone Removal'] },
    { name: 'Pulmonology', procedures: ['Bronchoscopy', 'COPD Treatment', 'Asthma Care'] },
    { name: 'General Surgery', procedures: ['Laparoscopy', 'Hernia Repair', 'Appendectomy'] },
    { name: 'Pediatrics', procedures: ['Neonatal Care', 'Vaccinations', 'Child Health'] },
    { name: 'Obstetrics & Gynecology', procedures: ['Normal Delivery', 'C-Section', 'IVF'] },
    { name: 'Dermatology', procedures: ['Skin Treatments', 'Laser Therapy', 'Cosmetic Procedures'] },
    { name: 'Ophthalmology', procedures: ['Cataract Surgery', 'LASIK', 'Glaucoma Treatment'] },
    { name: 'ENT', procedures: ['Tonsillectomy', 'Cochlear Implant', 'Sinus Surgery'] },
    { name: 'Urology', procedures: ['Prostate Surgery', 'Stone Removal', 'Kidney Surgery'] },
    { name: 'Emergency Medicine', procedures: ['Trauma Care', 'Emergency Surgery', 'ICU Care'] },
];

// Accreditations
const ACCREDITATIONS = ['NABH', 'JCI', 'NABL', 'ISO 9001', 'QCI'];

// City tier classification
const METRO_CITIES = ['delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'gurgaon', 'gurugram', 'noida', 'ghaziabad', 'navi-mumbai', 'thane'];
const TIER1_CITIES = ['jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'patna', 'vadodara', 'coimbatore', 'ludhiana', 'agra', 'nashik', 'varanasi', 'surat', 'visakhapatnam', 'kochi', 'thiruvananthapuram', 'chandigarh', 'guwahati', 'bhubaneswar', 'dehradun', 'ranchi', 'raipur', 'amritsar', 'jodhpur', 'madurai', 'mysore', 'mysuru', 'mangalore', 'mangaluru', 'vijayawada', 'tiruchirappalli', 'trichy', 'jalandhar'];

interface CityTierConfig {
    hospitalTypes: HospitalType[];
    bedRange: [number, number];
    icuRange: [number, number];
    otRange: [number, number];
    ratingRange: [number, number];
    accreditationCount: number;
    specialtyCount: number;
    hasMultipleHospitals: boolean;
}

const CITY_TIER_CONFIG: Record<string, CityTierConfig> = {
    metro: {
        hospitalTypes: ['corporate_chain', 'teaching', 'government', 'private', 'trust'],
        bedRange: [200, 1500],
        icuRange: [50, 300],
        otRange: [10, 50],
        ratingRange: [4.0, 4.9],
        accreditationCount: 3,
        specialtyCount: 12,
        hasMultipleHospitals: true,
    },
    tier1: {
        hospitalTypes: ['corporate_chain', 'teaching', 'government', 'private', 'trust'],
        bedRange: [100, 500],
        icuRange: [20, 100],
        otRange: [5, 20],
        ratingRange: [3.8, 4.6],
        accreditationCount: 2,
        specialtyCount: 8,
        hasMultipleHospitals: true,
    },
    tier2: {
        hospitalTypes: ['government', 'private', 'trust', 'standalone'],
        bedRange: [50, 200],
        icuRange: [10, 50],
        otRange: [2, 10],
        ratingRange: [3.5, 4.3],
        accreditationCount: 1,
        specialtyCount: 5,
        hasMultipleHospitals: false,
    },
};

// State-wise local naming patterns for hospital addresses
const STATE_ADDRESSES: Record<string, string[]> = {
    'Delhi': ['Safdarjung Enclave', 'Sarita Vihar', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Janakpuri', 'Pitampura'],
    'Maharashtra': ['Andheri', 'Bandra', 'Worli', 'Parel', 'Vashi', 'Thane', 'Kalyan'],
    'Karnataka': ['Jayanagar', 'Indiranagar', 'Whitefield', 'Electronic City', 'Malleshwaram', 'Koramangala'],
    'Tamil Nadu': ['T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Vadapalani', 'Porur'],
    'Telangana': ['Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Gachibowli', 'Secunderabad', 'Kukatpally'],
    'Kerala': ['Ernakulam', 'Vytilla', 'Kalamassery', 'Tripunithura', 'Palarivattom'],
    'Gujarat': ['Navrangpura', 'Satellite', 'Vastrapur', 'Prahlad Nagar', 'Bodakdev'],
    'West Bengal': ['Salt Lake', 'Park Street', 'Rajarhat', 'Howrah', 'New Town', 'Alipore'],
    'Rajasthan': ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Ajmer Road', 'Sanganer'],
    'Uttar Pradesh': ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Ashiyana'],
    'Punjab': ['Model Town', 'Civil Lines', 'Sector 34', 'Phase 7', 'Sector 17'],
    'Haryana': ['Sector 44', 'Sector 56', 'DLF Phase 1', 'MG Road', 'Sohna Road'],
    'Madhya Pradesh': ['Arera Colony', 'MP Nagar', 'New Market', 'Kolar Road', 'Ayodhya Bypass'],
    'Bihar': ['Boring Road', 'Patliputra', 'Kankarbagh', 'Bailey Road', 'Rajendra Nagar'],
    'Andhra Pradesh': ['Vijayawada', 'Guntur', 'Rajahmundry', 'Tirupati', 'Nellore'],
    'default': ['Main Road', 'Hospital Road', 'Civil Lines', 'Station Road', 'Market Area'],
};

function getCityTier(citySlug: string): 'metro' | 'tier1' | 'tier2' {
    const slug = citySlug.toLowerCase();
    if (METRO_CITIES.includes(slug)) return 'metro';
    if (TIER1_CITIES.includes(slug)) return 'tier1';
    return 'tier2';
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElements<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
}

interface City {
    id: number;
    name: string;
    slug: string;
    state_name: string | null;
    country_name: string | null;
}

interface HospitalData {
    slug: string;
    name: string;
    hospitalType: HospitalType;
    description: string;
    tagline: string;
    geographyId: number;
    address: string;
    city: string;
    state: string | null;
    country: string;
    bedCount: number;
    icuBeds: number;
    operationTheaters: number;
    emergencyBeds: number;
    accreditations: string[];
    parentOrganization: string | null;
    ownershipType: string;
    establishedYear: number;
    overallRating: number;
    domesticRating: number;
    internationalRating: number;
    reviewCount: number;
    prosForPatients: string[];
    consForPatients: string[];
    bloodBank: boolean;
    pharmacy24x7: boolean;
    cafeteria: boolean;
    parking: boolean;
    wifi: boolean;
    isVerified: boolean;
    isFeatured: boolean;
    isActive: boolean;
    specialties: {
        name: string;
        procedures: string[];
        isCenter: boolean;
    }[];
}

async function main() {
    console.log('Starting comprehensive hospital seeding...\n');

    const client = await pool.connect();

    try {
        // Get all cities with their states and countries
        const citiesResult = await client.query(`
            SELECT
                c.id, c.name, c.slug,
                s.name as state_name,
                co.name as country_name
            FROM geographies c
            LEFT JOIN geographies s ON c.parent_id = s.id AND s.level = 'state'
            LEFT JOIN geographies co ON s.parent_id = co.id AND co.level = 'country'
            WHERE c.level = 'city' AND c.is_active = true
            ORDER BY c.name
        `);

        const cities: City[] = citiesResult.rows;
        console.log(`Found ${cities.length} cities\n`);

        // Get existing hospital slugs to avoid duplicates
        const existingHospitals = await client.query(`SELECT slug FROM hospitals`);
        const existingSlugs = new Set(existingHospitals.rows.map((h: { slug: string }) => h.slug));
        console.log(`Found ${existingSlugs.size} existing hospitals\n`);

        let created = 0;
        let skipped = 0;

        for (const city of cities) {
            const stateName = city.state_name || 'default';
            const cityTier = getCityTier(city.slug);
            const config = CITY_TIER_CONFIG[cityTier];
            const addresses = STATE_ADDRESSES[stateName] || STATE_ADDRESSES['default'];

            // Determine how many hospitals to create for this city
            const hospitalCount = config.hasMultipleHospitals ? getRandomInt(2, 4) : 1;

            // Select hospital types to create
            const selectedTypes = getRandomElements(config.hospitalTypes, hospitalCount);

            for (let i = 0; i < selectedTypes.length; i++) {
                const hospitalType = selectedTypes[i];
                const typeConfig = HOSPITAL_CHAINS[hospitalType] || HOSPITAL_CHAINS.private;
                const hospitalTemplate = getRandomElement(typeConfig);

                // Generate hospital name
                const hospitalName = hospitalType === 'corporate_chain' || hospitalType === 'teaching'
                    ? `${hospitalTemplate.name} ${city.name}`
                    : `${city.name} ${hospitalTemplate.name}`;

                // Create unique slug
                const baseSlug = slugify(hospitalName);
                let hospitalSlug = baseSlug;
                let counter = 1;
                while (existingSlugs.has(hospitalSlug)) {
                    hospitalSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
                existingSlugs.add(hospitalSlug);

                // Generate hospital data
                const bedCount = getRandomInt(config.bedRange[0], config.bedRange[1]);
                const icuBeds = getRandomInt(config.icuRange[0], config.icuRange[1]);
                const otCount = getRandomInt(config.otRange[0], config.otRange[1]);
                const rating = (Math.random() * (config.ratingRange[1] - config.ratingRange[0]) + config.ratingRange[0]);
                const roundedRating = Math.round(rating * 10) / 10;

                const selectedAccreditations = getRandomElements(ACCREDITATIONS, config.accreditationCount);
                const selectedSpecialties = getRandomElements(HOSPITAL_SPECIALTIES, config.specialtyCount);

                const address = getRandomElement(addresses);
                const establishedYear = hospitalType === 'government' || hospitalType === 'teaching'
                    ? getRandomInt(1950, 2010)
                    : getRandomInt(1990, 2020);

                const ownershipType = hospitalType === 'government' ? 'Government'
                    : hospitalType === 'trust' ? 'Trust'
                    : hospitalType === 'corporate_chain' ? 'Private (Corporate)'
                    : 'Private';

                const pros = [
                    'Experienced medical staff',
                    'Modern facilities',
                    '24/7 emergency services',
                    'Patient-friendly environment',
                    'Transparent pricing',
                ];

                const cons = hospitalType === 'government'
                    ? ['Long waiting times', 'Crowded OPD', 'Limited parking']
                    : ['Premium pricing', 'Waiting for specialists', 'Insurance processing time'];

                const hospitalData: HospitalData = {
                    slug: hospitalSlug,
                    name: hospitalName,
                    hospitalType,
                    description: `<p>${hospitalName} is a leading healthcare facility in ${city.name}${city.state_name ? `, ${city.state_name}` : ''}. Established in ${establishedYear}, the hospital offers comprehensive medical services with ${bedCount} beds and state-of-the-art infrastructure.</p><p>Our team of experienced doctors and medical staff are committed to providing quality healthcare services to patients from ${city.name} and surrounding areas.</p>`,
                    tagline: hospitalTemplate.tagline,
                    geographyId: city.id,
                    address: `${address}, ${city.name}${city.state_name ? `, ${city.state_name}` : ''}`,
                    city: city.name,
                    state: city.state_name,
                    country: city.country_name || 'India',
                    bedCount,
                    icuBeds,
                    operationTheaters: otCount,
                    emergencyBeds: Math.floor(bedCount * 0.1),
                    accreditations: selectedAccreditations,
                    parentOrganization: hospitalTemplate.parent,
                    ownershipType,
                    establishedYear,
                    overallRating: roundedRating,
                    domesticRating: roundedRating,
                    internationalRating: Math.round((roundedRating - 0.2 + Math.random() * 0.4) * 10) / 10,
                    reviewCount: getRandomInt(50, 500),
                    prosForPatients: getRandomElements(pros, 3),
                    consForPatients: getRandomElements(cons, 2),
                    bloodBank: Math.random() > 0.3,
                    pharmacy24x7: Math.random() > 0.2,
                    cafeteria: Math.random() > 0.4,
                    parking: Math.random() > 0.3,
                    wifi: Math.random() > 0.5,
                    isVerified: hospitalType === 'corporate_chain' || hospitalType === 'teaching',
                    isFeatured: hospitalType === 'corporate_chain' && cityTier === 'metro',
                    isActive: true,
                    specialties: selectedSpecialties.map((spec, idx) => ({
                        name: spec.name,
                        procedures: spec.procedures,
                        isCenter: idx < 3 && (hospitalType === 'corporate_chain' || hospitalType === 'teaching'),
                    })),
                };

                // Insert hospital
                try {
                    const result = await client.query(`
                        INSERT INTO hospitals (
                            slug, name, hospital_type, description, tagline,
                            geography_id, address, city, state, country,
                            bed_count, icu_beds, operation_theaters, emergency_beds,
                            accreditations, parent_organization, ownership_type, established_year,
                            overall_rating, domestic_rating, international_rating, review_count,
                            pros_for_patients, cons_for_patients,
                            blood_bank, pharmacy_24x7, cafeteria, parking, wifi,
                            is_verified, is_featured, is_active,
                            created_at, updated_at
                        ) VALUES (
                            $1, $2, $3, $4, $5,
                            $6, $7, $8, $9, $10,
                            $11, $12, $13, $14,
                            $15, $16, $17, $18,
                            $19, $20, $21, $22,
                            $23, $24,
                            $25, $26, $27, $28, $29,
                            $30, $31, $32,
                            NOW(), NOW()
                        )
                        ON CONFLICT (slug) DO NOTHING
                        RETURNING id
                    `, [
                        hospitalData.slug,
                        hospitalData.name,
                        hospitalData.hospitalType,
                        hospitalData.description,
                        hospitalData.tagline,
                        hospitalData.geographyId,
                        hospitalData.address,
                        hospitalData.city,
                        hospitalData.state,
                        hospitalData.country,
                        hospitalData.bedCount,
                        hospitalData.icuBeds,
                        hospitalData.operationTheaters,
                        hospitalData.emergencyBeds,
                        hospitalData.accreditations,
                        hospitalData.parentOrganization,
                        hospitalData.ownershipType,
                        hospitalData.establishedYear,
                        hospitalData.overallRating,
                        hospitalData.domesticRating,
                        hospitalData.internationalRating,
                        hospitalData.reviewCount,
                        hospitalData.prosForPatients,
                        hospitalData.consForPatients,
                        hospitalData.bloodBank,
                        hospitalData.pharmacy24x7,
                        hospitalData.cafeteria,
                        hospitalData.parking,
                        hospitalData.wifi,
                        hospitalData.isVerified,
                        hospitalData.isFeatured,
                        hospitalData.isActive,
                    ]);

                    // Add specialties if hospital was inserted
                    if (result.rows.length > 0) {
                        const hospitalId = result.rows[0].id;

                        for (let j = 0; j < hospitalData.specialties.length; j++) {
                            const spec = hospitalData.specialties[j];
                            await client.query(`
                                INSERT INTO hospital_specialties (
                                    hospital_id, specialty, description, is_center,
                                    key_procedures, success_rate, display_order
                                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                                ON CONFLICT (hospital_id, specialty) DO NOTHING
                            `, [
                                hospitalId,
                                spec.name,
                                `Expert ${spec.name} care at ${hospitalData.name}`,
                                spec.isCenter,
                                spec.procedures,
                                85 + Math.random() * 10, // 85-95% success rate
                                j,
                            ]);
                        }

                        created++;
                        if (created % 50 === 0) {
                            console.log(`Created ${created} hospitals...`);
                        }
                    } else {
                        skipped++;
                    }
                } catch (err) {
                    console.error(`Error inserting hospital ${hospitalData.name}:`, err);
                    skipped++;
                }
            }
        }

        console.log(`\nCompleted!`);
        console.log(`   Created: ${created} hospitals`);
        console.log(`   Skipped: ${skipped} (duplicates or errors)`);

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
