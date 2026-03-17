/**
 * Seed insurance plans for all providers
 * Creates individual, family, senior citizen, and critical illness plans
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz' });

interface PlanTemplate {
    nameSuffix: string;
    planType: string;
    description: string;
    coverageHighlights: string[];
    sumInsuredMin: number;
    sumInsuredMax: number;
    premiumStartsAt: number;
    premiumFrequency: string;
    entryAgeMin: number;
    entryAgeMax: number;
    renewableUpto: number;
    preCoverDays: number;
    postCoverDays: number;
    dayCareProcedures: boolean;
    maternityCover: boolean;
    ayushCover: boolean;
    restoreBenefit: boolean;
    noClaimBonus: string;
    preExistingWaitYears: number;
    specificDiseaseWait: number;
    majorExclusions: string[];
    isFeatured: boolean;
}

// Currency conversion rates (approximate, for display purposes)
const CURRENCY_RATES: Record<string, { code: string; rate: number }> = {
    'India': { code: 'INR', rate: 1 },
    'United States': { code: 'USD', rate: 0.012 },
    'United Kingdom': { code: 'GBP', rate: 0.0095 },
    'United Arab Emirates': { code: 'AED', rate: 0.044 },
    'Saudi Arabia': { code: 'SAR', rate: 0.045 },
    'Singapore': { code: 'SGD', rate: 0.016 },
    'Australia': { code: 'AUD', rate: 0.018 },
    'Canada': { code: 'CAD', rate: 0.016 },
    'Germany': { code: 'EUR', rate: 0.011 },
    'France': { code: 'EUR', rate: 0.011 },
    'Japan': { code: 'JPY', rate: 1.78 },
    'South Korea': { code: 'KRW', rate: 15.8 },
    'Thailand': { code: 'THB', rate: 0.42 },
    'Malaysia': { code: 'MYR', rate: 0.056 },
    'Philippines': { code: 'PHP', rate: 0.67 },
    'Indonesia': { code: 'IDR', rate: 188 },
    'Nigeria': { code: 'NGN', rate: 18.5 },
    'South Africa': { code: 'ZAR', rate: 0.22 },
    'Egypt': { code: 'EGP', rate: 0.37 },
    'Pakistan': { code: 'PKR', rate: 3.35 },
    'Bangladesh': { code: 'BDT', rate: 1.32 },
    'Vietnam': { code: 'VND', rate: 296 },
    'China': { code: 'CNY', rate: 0.086 },
    'Sri Lanka': { code: 'LKR', rate: 3.88 },
    'Nepal': { code: 'NPR', rate: 1.6 },
    'Qatar': { code: 'QAR', rate: 0.044 },
    'Kuwait': { code: 'KWD', rate: 0.0037 },
    'Bahrain': { code: 'BHD', rate: 0.0045 },
    'Oman': { code: 'OMR', rate: 0.0046 },
    'Kenya': { code: 'KES', rate: 1.85 },
    'Tanzania': { code: 'TZS', rate: 30.5 },
    'Ghana': { code: 'GHS', rate: 0.15 },
    'Ethiopia': { code: 'ETB', rate: 0.68 },
};

// Plan templates for private insurers
const PRIVATE_PLAN_TEMPLATES: PlanTemplate[] = [
    {
        nameSuffix: 'Basic Health Plan',
        planType: 'individual',
        description: 'Essential health coverage for individuals with basic hospitalization benefits.',
        coverageHighlights: ['Hospitalization cover', 'Day care procedures', 'Pre & post hospitalization', 'Ambulance cover'],
        sumInsuredMin: 300000,
        sumInsuredMax: 500000,
        premiumStartsAt: 4500,
        premiumFrequency: 'yearly',
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 80,
        preCoverDays: 30,
        postCoverDays: 60,
        dayCareProcedures: true,
        maternityCover: false,
        ayushCover: false,
        restoreBenefit: false,
        noClaimBonus: '10% per year',
        preExistingWaitYears: 4,
        specificDiseaseWait: 90,
        majorExclusions: ['Cosmetic procedures', 'Self-inflicted injuries', 'War and terrorism'],
        isFeatured: false
    },
    {
        nameSuffix: 'Comprehensive Health Plan',
        planType: 'individual',
        description: 'Comprehensive coverage with higher sum insured and additional benefits like maternity and AYUSH.',
        coverageHighlights: ['No room rent limit', 'Maternity cover', 'AYUSH treatment', 'Restore benefit', 'Organ donor cover', 'Domiciliary care'],
        sumInsuredMin: 500000,
        sumInsuredMax: 2500000,
        premiumStartsAt: 12000,
        premiumFrequency: 'yearly',
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 99,
        preCoverDays: 60,
        postCoverDays: 180,
        dayCareProcedures: true,
        maternityCover: true,
        ayushCover: true,
        restoreBenefit: true,
        noClaimBonus: '50% cumulative',
        preExistingWaitYears: 3,
        specificDiseaseWait: 30,
        majorExclusions: ['Cosmetic procedures', 'Experimental treatments'],
        isFeatured: true
    },
    {
        nameSuffix: 'Family Floater Plan',
        planType: 'family_floater',
        description: 'Single sum insured shared by the entire family. Covers self, spouse, and up to 4 dependent children.',
        coverageHighlights: ['Family coverage', 'Single premium', 'Maternity benefits', 'New born cover from day 1', 'Annual health checkup'],
        sumInsuredMin: 500000,
        sumInsuredMax: 5000000,
        premiumStartsAt: 18000,
        premiumFrequency: 'yearly',
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 99,
        preCoverDays: 60,
        postCoverDays: 90,
        dayCareProcedures: true,
        maternityCover: true,
        ayushCover: true,
        restoreBenefit: true,
        noClaimBonus: '20% per year up to 100%',
        preExistingWaitYears: 3,
        specificDiseaseWait: 30,
        majorExclusions: ['Cosmetic procedures', 'Infertility treatment'],
        isFeatured: true
    },
    {
        nameSuffix: 'Senior Citizen Plan',
        planType: 'senior_citizen',
        description: 'Specially designed for senior citizens aged 60+ with coverage for age-related conditions.',
        coverageHighlights: ['No medical checkup up to 65', 'Cataract surgery', 'Knee replacement', 'Cardiac procedures', 'Pre-existing disease cover'],
        sumInsuredMin: 200000,
        sumInsuredMax: 1500000,
        premiumStartsAt: 25000,
        premiumFrequency: 'yearly',
        entryAgeMin: 60,
        entryAgeMax: 80,
        renewableUpto: 99,
        preCoverDays: 60,
        postCoverDays: 90,
        dayCareProcedures: true,
        maternityCover: false,
        ayushCover: true,
        restoreBenefit: true,
        noClaimBonus: '10% per year',
        preExistingWaitYears: 2,
        specificDiseaseWait: 30,
        majorExclusions: ['Cosmetic procedures', 'Dental unless from accident'],
        isFeatured: false
    },
    {
        nameSuffix: 'Critical Illness Cover',
        planType: 'critical_illness',
        description: 'Lump sum payout on diagnosis of critical illnesses like cancer, heart attack, stroke.',
        coverageHighlights: ['Lump sum payout', 'Covers 30+ critical illnesses', 'Second opinion benefit', 'Premium waiver', 'Worldwide coverage'],
        sumInsuredMin: 1000000,
        sumInsuredMax: 10000000,
        premiumStartsAt: 8000,
        premiumFrequency: 'yearly',
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 75,
        preCoverDays: 0,
        postCoverDays: 0,
        dayCareProcedures: false,
        maternityCover: false,
        ayushCover: false,
        restoreBenefit: false,
        noClaimBonus: 'None',
        preExistingWaitYears: 0,
        specificDiseaseWait: 90,
        majorExclusions: ['Pre-existing critical illness', 'Self-inflicted conditions'],
        isFeatured: false
    },
    {
        nameSuffix: 'Top-Up Plan',
        planType: 'top_up',
        description: 'Additional coverage that kicks in after your base policy exhausts, with lower premiums.',
        coverageHighlights: ['Low premium', 'High cover', 'Works with any base policy', 'Deductible based'],
        sumInsuredMin: 1000000,
        sumInsuredMax: 5000000,
        premiumStartsAt: 3500,
        premiumFrequency: 'yearly',
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 80,
        preCoverDays: 30,
        postCoverDays: 60,
        dayCareProcedures: true,
        maternityCover: false,
        ayushCover: false,
        restoreBenefit: false,
        noClaimBonus: 'None',
        preExistingWaitYears: 4,
        specificDiseaseWait: 90,
        majorExclusions: ['Same as base policy'],
        isFeatured: false
    },
    {
        nameSuffix: 'Super Top-Up Plan',
        planType: 'super_top_up',
        description: 'Aggregate deductible plan that covers multiple claims in a year beyond the threshold.',
        coverageHighlights: ['Aggregate deductible', 'Multiple claims covered', 'Very low premium', 'High sum insured'],
        sumInsuredMin: 2500000,
        sumInsuredMax: 10000000,
        premiumStartsAt: 5500,
        premiumFrequency: 'yearly',
        entryAgeMin: 18,
        entryAgeMax: 65,
        renewableUpto: 80,
        preCoverDays: 30,
        postCoverDays: 60,
        dayCareProcedures: true,
        maternityCover: false,
        ayushCover: false,
        restoreBenefit: false,
        noClaimBonus: '5% per year',
        preExistingWaitYears: 4,
        specificDiseaseWait: 90,
        majorExclusions: ['Same as base policy'],
        isFeatured: false
    }
];

// Simplified templates for government schemes
const GOVERNMENT_PLAN_TEMPLATES: PlanTemplate[] = [
    {
        nameSuffix: 'Basic Coverage',
        planType: 'individual',
        description: 'Government-provided basic health coverage for eligible citizens.',
        coverageHighlights: ['Public hospital care', 'Emergency services', 'Essential medicines', 'Preventive care'],
        sumInsuredMin: 0,
        sumInsuredMax: 500000,
        premiumStartsAt: 0,
        premiumFrequency: 'tax-funded',
        entryAgeMin: 0,
        entryAgeMax: 99,
        renewableUpto: 99,
        preCoverDays: 0,
        postCoverDays: 30,
        dayCareProcedures: true,
        maternityCover: true,
        ayushCover: false,
        restoreBenefit: false,
        noClaimBonus: 'N/A',
        preExistingWaitYears: 0,
        specificDiseaseWait: 0,
        majorExclusions: ['Cosmetic procedures', 'Experimental treatments', 'Private hospital care'],
        isFeatured: true
    },
    {
        nameSuffix: 'Family Coverage',
        planType: 'family_floater',
        description: 'Family coverage under government health scheme for all family members.',
        coverageHighlights: ['Entire family covered', 'Free hospitalization', 'Cashless at empaneled hospitals', 'No premium required'],
        sumInsuredMin: 0,
        sumInsuredMax: 500000,
        premiumStartsAt: 0,
        premiumFrequency: 'tax-funded',
        entryAgeMin: 0,
        entryAgeMax: 99,
        renewableUpto: 99,
        preCoverDays: 0,
        postCoverDays: 15,
        dayCareProcedures: true,
        maternityCover: true,
        ayushCover: false,
        restoreBenefit: false,
        noClaimBonus: 'N/A',
        preExistingWaitYears: 0,
        specificDiseaseWait: 0,
        majorExclusions: ['Private facilities', 'Non-essential procedures'],
        isFeatured: false
    }
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function main() {
    console.log('Starting insurance plans seeding...\n');
    const client = await pool.connect();

    try {
        // Get all insurance providers
        const providers = await client.query(`
            SELECT id, slug, name, provider_type, headquarters_country
            FROM insurance_providers
            WHERE is_active = true
            ORDER BY id
        `);

        console.log(`Found ${providers.rows.length} insurance providers\n`);

        let created = 0;
        let skipped = 0;

        for (const provider of providers.rows) {
            const isGovernment = provider.provider_type === 'government';
            const templates = isGovernment ? GOVERNMENT_PLAN_TEMPLATES : PRIVATE_PLAN_TEMPLATES;
            const country = provider.headquarters_country || 'India';
            const currencyInfo = CURRENCY_RATES[country] || CURRENCY_RATES['India'];

            // Skip government providers for now if they already have plans or are pure government services
            // that don't offer traditional "plans"
            const skipGovernmentPlans = isGovernment && [
                'medicare-usa', 'nhs-uk', 'medishield-life-sg', 'medicare-australia',
                'provincial-health-canada', 'assurance-maladie-france', 'nhi-japan',
                'nhis-korea', 'basic-medical-china'
            ].includes(provider.slug);

            if (skipGovernmentPlans) {
                // Create a single informational "plan" for government schemes
                const planSlug = `${provider.slug}-coverage`;
                const existing = await client.query(
                    'SELECT id FROM insurance_plans WHERE slug = $1',
                    [planSlug]
                );

                if (existing.rows.length === 0) {
                    await client.query(`
                        INSERT INTO insurance_plans (
                            slug, provider_id, name, plan_type, description,
                            coverage_highlights, sum_insured_min, sum_insured_max, currency,
                            premium_starts_at, premium_frequency, entry_age_min, entry_age_max,
                            renewable_upto, pre_cover_days, post_cover_days, day_care_procedures,
                            maternity_cover, ayush_cover, restore_benefit, no_claim_bonus,
                            pre_existing_wait_years, specific_disease_wait_days, major_exclusions,
                            is_active, is_featured, created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, true, true, NOW(), NOW())
                    `, [
                        planSlug,
                        provider.id,
                        `${provider.name} - Public Health Coverage`,
                        'individual',
                        `Public health coverage provided by ${provider.name}. Coverage details vary by eligibility and location.`,
                        ['Public hospital care', 'Emergency services', 'Essential medicines', 'Preventive care'],
                        0,
                        null,
                        currencyInfo.code,
                        0,
                        'tax-funded',
                        0,
                        99,
                        99,
                        0,
                        30,
                        true,
                        true,
                        false,
                        false,
                        'N/A',
                        0,
                        0,
                        ['Cosmetic procedures', 'Private facilities']
                    ]);
                    console.log(`  Created: ${provider.name} - Public Health Coverage`);
                    created++;
                }
                continue;
            }

            // Create plans from templates
            for (const template of templates) {
                const planName = `${provider.name} ${template.nameSuffix}`;
                const planSlug = slugify(`${provider.slug}-${template.nameSuffix}`);

                // Check if plan already exists
                const existing = await client.query(
                    'SELECT id FROM insurance_plans WHERE slug = $1',
                    [planSlug]
                );

                if (existing.rows.length > 0) {
                    skipped++;
                    continue;
                }

                // Convert amounts based on currency
                const sumInsuredMin = Math.round(template.sumInsuredMin * currencyInfo.rate);
                const sumInsuredMax = Math.round(template.sumInsuredMax * currencyInfo.rate);
                const premiumStartsAt = Math.round(template.premiumStartsAt * currencyInfo.rate);

                await client.query(`
                    INSERT INTO insurance_plans (
                        slug, provider_id, name, plan_type, description,
                        coverage_highlights, sum_insured_min, sum_insured_max, currency,
                        premium_starts_at, premium_frequency, entry_age_min, entry_age_max,
                        renewable_upto, pre_cover_days, post_cover_days, day_care_procedures,
                        maternity_cover, ayush_cover, restore_benefit, no_claim_bonus,
                        pre_existing_wait_years, specific_disease_wait_days, major_exclusions,
                        is_active, is_featured, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, true, $25, NOW(), NOW())
                `, [
                    planSlug,
                    provider.id,
                    planName,
                    template.planType,
                    template.description,
                    template.coverageHighlights,
                    sumInsuredMin,
                    sumInsuredMax,
                    currencyInfo.code,
                    premiumStartsAt,
                    template.premiumFrequency,
                    template.entryAgeMin,
                    template.entryAgeMax,
                    template.renewableUpto,
                    template.preCoverDays,
                    template.postCoverDays,
                    template.dayCareProcedures,
                    template.maternityCover,
                    template.ayushCover,
                    template.restoreBenefit,
                    template.noClaimBonus,
                    template.preExistingWaitYears,
                    template.specificDiseaseWait,
                    template.majorExclusions,
                    template.isFeatured
                ]);

                created++;
            }

            console.log(`  Created plans for: ${provider.name} (${country})`);
        }

        console.log(`\nCompleted!`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped} (already exist)`);

        // Show total count
        const total = await client.query('SELECT COUNT(*) FROM insurance_plans');
        console.log(`   Total plans: ${total.rows[0].count}`);

        // Show counts by plan type
        const byType = await client.query(`
            SELECT plan_type, COUNT(*) as count
            FROM insurance_plans
            GROUP BY plan_type
            ORDER BY count DESC
        `);
        console.log('\n=== Plans by Type ===');
        byType.rows.forEach((row: { plan_type: string; count: string }) => {
            console.log(`   ${row.plan_type}: ${row.count}`);
        });

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
