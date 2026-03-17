/**
 * Populate TreatmentCost table with condition-specific pricing by location
 *
 * This script:
 * 1. Loads all conditions from the database
 * 2. Loads treatments from treatments-with-costs.json
 * 3. Matches conditions to relevant treatments based on specialty/bodySystem
 * 4. Creates TreatmentCost records for each condition/country combination
 *
 * Usage: npx tsx scripts/populate-condition-costs.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Import unified country config
import { COUNTRIES_WITH_COSTS } from '../src/lib/countries';

// Country code mappings (from unified config - only countries with cost data)
const COUNTRY_MAPPINGS: Record<string, { code: string; currency: string }> = Object.fromEntries(
    COUNTRIES_WITH_COSTS.map(c => [c.slug, { code: c.code.toLowerCase(), currency: c.currency }])
);

// Treatment type to price multiplier (some conditions need more expensive treatments)
const TYPE_MULTIPLIERS: Record<string, number> = {
    surgery: 1.5,
    medication: 0.8,
    medical: 1.0,
    procedure: 1.2,
    otc: 0.5,
    therapy: 0.9,
    diagnostic: 0.7,
};

// Map condition specialty to treatment specialty (treatments use "Cardiologist", conditions use "Cardiology")
const SPECIALTY_MAP: Record<string, string> = {
    cardiology: 'cardiologist',
    neurology: 'neurologist',
    dermatology: 'dermatologist',
    orthopedics: 'orthopedic surgeon',
    gastroenterology: 'gastroenterologist',
    psychiatry: 'psychiatrist',
    endocrinology: 'endocrinologist',
    pulmonology: 'pulmonologist',
    oncology: 'oncologist',
    pediatrics: 'pediatrician',
    gynecology: 'gynecologist',
    'obstetrics & gynecology': 'gynecologist',
    urology: 'urologist',
    ophthalmology: 'ophthalmologist',
    'ent': 'ent specialist',
    otolaryngology: 'ent specialist',
    rheumatology: 'rheumatologist',
    allergy: 'allergist',
    'allergy & immunology': 'allergist',
    'infectious disease': 'infectious disease specialist',
    nephrology: 'nephrologist',
    hematology: 'hematologist',
    'general medicine': 'general',
    'internal medicine': 'general',
    'family medicine': 'general',
};

interface TreatmentData {
    name: string;
    type: string;
    specialty: string;
    costs: Record<string, {
        usd: number;
        currency: string;
        range: [number, number];
    }>;
    indications?: string[];
}

async function main() {
    console.log('Starting condition cost population...\n');

    // Initialize Prisma
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not set');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    try {
        // Load treatments data
        const treatmentsPath = path.join(process.cwd(), 'public', 'data', 'treatments-with-costs.json');
        const treatments: TreatmentData[] = JSON.parse(fs.readFileSync(treatmentsPath, 'utf-8'));
        console.log(`Loaded ${treatments.length} treatments with cost data`);

        // Group treatments by specialty
        const treatmentsBySpecialty: Record<string, TreatmentData[]> = {};
        treatments.forEach(t => {
            const spec = t.specialty.toLowerCase();
            if (!treatmentsBySpecialty[spec]) treatmentsBySpecialty[spec] = [];
            treatmentsBySpecialty[spec].push(t);
        });

        // Get all conditions
        const conditions = await prisma.medicalCondition.findMany({
            where: { isActive: true },
            select: {
                slug: true,
                commonName: true,
                specialistType: true,
                bodySystem: true,
            },
        });
        console.log(`Found ${conditions.length} active conditions\n`);

        let created = 0;
        let skipped = 0;

        // Process conditions in batches
        const BATCH_SIZE = 100;
        for (let i = 0; i < conditions.length; i += BATCH_SIZE) {
            const batch = conditions.slice(i, i + BATCH_SIZE);

            for (const condition of batch) {
                // Find relevant treatments based on specialty
                const specialty = (condition.specialistType || 'general').toLowerCase();
                const bodySystem = (condition.bodySystem || '').toLowerCase();

                // Map condition specialty to treatment specialty
                const mappedSpecialty = SPECIALTY_MAP[specialty] || specialty;

                // Get treatments for this specialty
                let relevantTreatments = treatmentsBySpecialty[mappedSpecialty] || [];

                // Try without mapping if not found
                if (relevantTreatments.length === 0) {
                    relevantTreatments = treatmentsBySpecialty[specialty] || [];
                }

                // Fallback to general treatments if none found
                if (relevantTreatments.length === 0) {
                    relevantTreatments = treatmentsBySpecialty['general'] || [];
                }

                // If still none, try body system match
                if (relevantTreatments.length === 0 && bodySystem) {
                    for (const [spec, treats] of Object.entries(treatmentsBySpecialty)) {
                        if (bodySystem.includes(spec) || spec.includes(bodySystem)) {
                            relevantTreatments = treats;
                            break;
                        }
                    }
                }

                // Last resort: use general treatments
                if (relevantTreatments.length === 0) {
                    relevantTreatments = treatmentsBySpecialty['general'] || treatments.slice(0, 5);
                }

                if (relevantTreatments.length === 0) {
                    skipped++;
                    continue;
                }

                // Pick primary treatment (most relevant based on type)
                const primaryTreatment = relevantTreatments.find(t =>
                    t.type === 'medication' || t.type === 'medical'
                ) || relevantTreatments[0];

                // Create cost entries for each country
                for (const [countryKey, countryInfo] of Object.entries(COUNTRY_MAPPINGS)) {
                    const costData = primaryTreatment.costs[countryKey];
                    if (!costData) continue;

                    // Apply condition severity multiplier (based on condition name patterns)
                    let severityMultiplier = 1.0;
                    const nameLower = condition.commonName.toLowerCase();
                    if (nameLower.includes('chronic') || nameLower.includes('advanced')) {
                        severityMultiplier = 1.4;
                    } else if (nameLower.includes('acute') || nameLower.includes('severe')) {
                        severityMultiplier = 1.3;
                    } else if (nameLower.includes('mild') || nameLower.includes('minor')) {
                        severityMultiplier = 0.7;
                    }

                    const typeMultiplier = TYPE_MULTIPLIERS[primaryTreatment.type] || 1.0;
                    const finalMultiplier = severityMultiplier * typeMultiplier;

                    const minCost = Math.round(costData.range[0] * finalMultiplier);
                    const maxCost = Math.round(costData.range[1] * finalMultiplier);
                    const avgCost = Math.round((minCost + maxCost) / 2);

                    try {
                        // Use createMany for better performance, skip duplicates
                        await prisma.treatmentCost.create({
                            data: {
                                conditionSlug: condition.slug,
                                countryCode: countryInfo.code,
                                treatmentName: primaryTreatment.name,
                                minCost,
                                maxCost,
                                avgCost,
                                currency: costData.currency,
                                dataSource: 'treatments-json-2024',
                                confidence: 0.85,
                            },
                        });
                        created++;
                    } catch (error: any) {
                        // Skip duplicates (unique constraint violation)
                        if (error.code === 'P2002') {
                            // Already exists, try update instead
                            try {
                                await prisma.treatmentCost.updateMany({
                                    where: {
                                        conditionSlug: condition.slug,
                                        countryCode: countryInfo.code,
                                        treatmentName: primaryTreatment.name,
                                    },
                                    data: {
                                        minCost,
                                        maxCost,
                                        avgCost,
                                        currency: costData.currency,
                                        dataSource: 'treatments-json-2024',
                                        confidence: 0.85,
                                    },
                                });
                                created++;
                            } catch {
                                skipped++;
                            }
                        } else {
                            skipped++;
                        }
                    }
                }
            }

            // Progress update
            const progress = Math.min(i + BATCH_SIZE, conditions.length);
            console.log(`Processed ${progress}/${conditions.length} conditions (${created} costs created)`);
        }

        console.log(`\nDone!`);
        console.log(`Created/updated: ${created} cost entries`);
        console.log(`Skipped: ${skipped}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
