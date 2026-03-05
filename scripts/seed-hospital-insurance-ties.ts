/**
 * seed-hospital-insurance-ties.ts
 *
 * Links hospitals to insurance providers for cashless treatment eligibility.
 * Strategy:
 * 1. All hospitals linked to insurers in their country
 * 2. Premium/featured hospitals also linked to international insurers
 * 3. Random variation so not all hospitals accept all insurers
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz?schema=public'
});

// International insurers that operate globally
const GLOBAL_INSURERS = [
  'bupa-uk',
  'cigna-global',
  'allianz-worldwide',
  'aetna-international',
  'axa-global',
  'metlife-international'
];

// Government insurers - link to all hospitals in their country
const GOVERNMENT_INSURERS_BY_COUNTRY: Record<string, string[]> = {
  'India': ['ayushman-bharat-pmjay', 'cghs-india', 'esis-india'],
  'United Kingdom': ['nhs-uk'],
  'United States': ['medicare-usa', 'medicaid-usa'],
  'Canada': ['ohip-canada', 'bc-msp-canada'],
  'Australia': ['medicare-australia'],
  'Germany': ['tk-germany'],
  'Japan': ['nhis-japan'],
  'South Korea': ['nhis-korea'],
  'France': ['ameli-france'],
  'Thailand': ['nhso-thailand'],
  'Malaysia': ['mysurance-malaysia'],
  'Indonesia': ['bpjs-indonesia'],
  'Philippines': ['philhealth-philippines'],
  'Vietnam': ['vss-vietnam'],
  'Saudi Arabia': ['chi-saudi'],
  'United Arab Emirates': ['dha-uae'],
  'Singapore': ['medishield-singapore'],
  'South Africa': ['gems-southafrica'],
  'Egypt': ['uhia-egypt'],
  'Nigeria': ['nhia-nigeria'],
  'Kenya': ['nhif-kenya'],
  'Pakistan': ['ssr-pakistan'],
  'China': ['bmis-china'],
};

interface HospitalInsuranceTie {
  hospitalId: number;
  insurerId: number;
  isCashless: boolean;
  isPreferred: boolean;
  discountPercent: number | null;
  notes: string | null;
}

async function getHospitals() {
  const result = await pool.query(`
    SELECT id, name, country, hospital_type, is_featured, bed_count
    FROM hospitals
    WHERE is_active = true
  `);
  return result.rows;
}

async function getInsurers() {
  const result = await pool.query(`
    SELECT id, slug, name, headquarters_country, provider_type
    FROM insurance_providers
    WHERE is_active = true
  `);
  return result.rows;
}

async function getExistingTies() {
  const result = await pool.query(`
    SELECT hospital_id, insurer_id FROM hospital_insurance_ties
  `);
  return new Set(result.rows.map(r => `${r.hospital_id}-${r.insurer_id}`));
}

function isPremiumHospital(hospital: any): boolean {
  return hospital.is_featured ||
         hospital.hospital_type === 'multi_specialty' ||
         hospital.hospital_type === 'super_specialty' ||
         (hospital.bed_count && hospital.bed_count > 200);
}

function shouldLink(probability: number): boolean {
  return Math.random() < probability;
}

function getDiscountPercent(isPreferred: boolean, hospitalType: string): number | null {
  if (!isPreferred) return null;

  // Preferred hospitals get discounts
  const baseDiscount = hospitalType === 'super_specialty' ? 5 :
                       hospitalType === 'multi_specialty' ? 7 : 10;
  return baseDiscount + Math.floor(Math.random() * 5); // 5-15% range
}

async function seedHospitalInsuranceTies() {
  console.log('Starting hospital-insurance ties seeding...\n');

  const hospitals = await getHospitals();
  const insurers = await getInsurers();
  const existingTies = await getExistingTies();

  console.log(`Found ${hospitals.length} hospitals`);
  console.log(`Found ${insurers.length} insurers`);
  console.log(`Existing ties: ${existingTies.size}`);

  // Create lookup maps
  const insurersByCountry: Record<string, any[]> = {};
  const insurerBySlug: Record<string, any> = {};

  for (const insurer of insurers) {
    const country = insurer.headquarters_country;
    if (!insurersByCountry[country]) {
      insurersByCountry[country] = [];
    }
    insurersByCountry[country].push(insurer);
    insurerBySlug[insurer.slug] = insurer;
  }

  const ties: HospitalInsuranceTie[] = [];
  let skippedExisting = 0;

  for (const hospital of hospitals) {
    if (!hospital.country) continue;

    const countryInsurers = insurersByCountry[hospital.country] || [];
    const isPremium = isPremiumHospital(hospital);

    // 1. Link to same-country insurers
    for (const insurer of countryInsurers) {
      const key = `${hospital.id}-${insurer.id}`;
      if (existingTies.has(key)) {
        skippedExisting++;
        continue;
      }

      // Government insurers - link to all hospitals (100% probability)
      // Private insurers - link based on hospital type
      const linkProbability = insurer.provider_type === 'government' ? 1.0 :
                              isPremium ? 0.85 : 0.6;

      if (shouldLink(linkProbability)) {
        const isPreferred = isPremium && shouldLink(0.3); // 30% of premium hospitals are preferred
        ties.push({
          hospitalId: hospital.id,
          insurerId: insurer.id,
          isCashless: true,
          isPreferred,
          discountPercent: getDiscountPercent(isPreferred, hospital.hospital_type),
          notes: isPreferred ? 'Preferred network hospital with negotiated rates' : null
        });
      }
    }

    // 2. Link premium hospitals to global insurers
    if (isPremium) {
      for (const slug of GLOBAL_INSURERS) {
        const insurer = insurerBySlug[slug];
        if (!insurer) continue;

        const key = `${hospital.id}-${insurer.id}`;
        if (existingTies.has(key)) {
          skippedExisting++;
          continue;
        }

        if (shouldLink(0.7)) { // 70% of premium hospitals get global insurers
          ties.push({
            hospitalId: hospital.id,
            insurerId: insurer.id,
            isCashless: true,
            isPreferred: false,
            discountPercent: null,
            notes: 'International insurance network'
          });
        }
      }
    }
  }

  console.log(`\nPrepared ${ties.length} new ties to insert`);
  console.log(`Skipped ${skippedExisting} existing ties`);

  if (ties.length === 0) {
    console.log('No new ties to insert');
    await pool.end();
    return;
  }

  // Batch insert
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < ties.length; i += batchSize) {
    const batch = ties.slice(i, i + batchSize);

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIndex = 1;

    for (const tie of batch) {
      placeholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`);
      values.push(
        tie.hospitalId,
        tie.insurerId,
        tie.isCashless,
        tie.isPreferred,
        tie.discountPercent,
        tie.notes
      );
      paramIndex += 6;
    }

    try {
      await pool.query(`
        INSERT INTO hospital_insurance_ties
        (hospital_id, insurer_id, is_cashless, is_preferred, discount_percent, notes)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (hospital_id, insurer_id) DO NOTHING
      `, values);

      inserted += batch.length;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} ties (total: ${inserted})`);
    } catch (error) {
      console.error('Error inserting batch:', error);
      throw error;
    }
  }

  // Final count
  const finalCount = await pool.query('SELECT COUNT(*) as cnt FROM hospital_insurance_ties');
  console.log(`\n✅ Total hospital-insurance ties in database: ${finalCount.rows[0].cnt}`);

  // Stats
  const stats = await pool.query(`
    SELECT
      COUNT(*) as total_ties,
      COUNT(CASE WHEN is_cashless THEN 1 END) as cashless_count,
      COUNT(CASE WHEN is_preferred THEN 1 END) as preferred_count,
      COUNT(DISTINCT hospital_id) as hospitals_with_ties,
      COUNT(DISTINCT insurer_id) as insurers_with_ties
    FROM hospital_insurance_ties
  `);

  console.log('\n📊 Statistics:');
  console.log(`  Total ties: ${stats.rows[0].total_ties}`);
  console.log(`  Cashless enabled: ${stats.rows[0].cashless_count}`);
  console.log(`  Preferred hospitals: ${stats.rows[0].preferred_count}`);
  console.log(`  Hospitals with insurance ties: ${stats.rows[0].hospitals_with_ties}`);
  console.log(`  Insurers with hospital ties: ${stats.rows[0].insurers_with_ties}`);

  await pool.end();
}

seedHospitalInsuranceTies().catch(console.error);
