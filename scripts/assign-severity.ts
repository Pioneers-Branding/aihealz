/**
 * assign-severity.ts
 *
 * Assigns real severity levels to medical conditions based on
 * the condition name, specialist type, and ICD-10 code patterns.
 *
 * Run:  npx tsx scripts/assign-severity.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* ─── Rule-based severity assignment ───────────────────────── */

function assignSeverity(name: string, specialist: string, icdCode: string | null): string {
    const n = name.toLowerCase();
    const s = specialist.toLowerCase();

    // ── CRITICAL: Life-threatening conditions ──
    if (/cardiac arrest|myocardial infarction|stroke|cerebrovascular accident|aneurysm.*ruptur|sepsis|septic shock|respiratory failure|pulmonary embolism|aortic dissection|meningitis.*bacterial|necrotizing|malignant neoplasm|carcinoma|metasta|lymphoma|leukemia|melanoma|sarcoma|status epilepticus|anaphyla|hemorrhag.*shock|cardiac tamponade|tension pneumothorax|eclampsia/i.test(n)) {
        return 'critical';
    }

    // ── SEVERE: Serious conditions requiring urgent intervention ──
    if (/fracture|dislocation|embolism|thrombos|deep vein|hemorrhag|hepatitis|pancreatitis|peritonitis|appendicitis|cholecystitis|pyelonephritis|osteomyelitis|endocarditis|pneumonia|abscess|gangrene|necrosis|renal failure|kidney failure|liver failure|heart failure|obstruction|perforation|rupture|dissection|aneurysm|seizure|epilep|psychosis|bipolar|schizophren|brain injury|spinal cord|paralysis|amputation|burn.*degree|poisoning|toxic effect|crush|compartment syndrome/i.test(n)) {
        return 'severe';
    }

    // ── MILD: Minor, self-limiting conditions ──
    if (/abrasion|contusion|bruise|sprain|strain(?!.*(cervical|lumbar))|insect bite|bee sting|sunburn|mild|common cold|rhinitis|allergic rhinitis|hay fever|acne(?!.*cystic)|wart|callus|corn|blister|hangnail|ingrown nail|dandruff|dry skin|xerosis|conjunctivitis|pink eye|earwax|cerumen|hiccup|motion sickness|jet lag|tension headache|muscle cramp|benign|minor|superficial|nausea|vomiting(?!.*blood)|heartburn|gastroesophageal reflux|constipation|flatulence|athlete.s foot|ringworm|jock itch|contact dermatitis|diaper rash|heat rash|canker sore|cold sore|plantar fasciitis/i.test(n)) {
        return 'mild';
    }

    // ── Emergency Medicine default to severe ──
    if (s.includes('emergency')) return 'severe';

    // ── Oncology default to critical ──
    if (s.includes('oncolog')) return 'critical';

    // ── ICD-10 code based rules ──
    if (icdCode) {
        const code = icdCode.toUpperCase();
        // C codes = neoplasms (cancer) → critical
        if (/^C\d/.test(code)) return 'critical';
        // S codes = injuries
        if (/^S\d/.test(code)) {
            // Fractures are severe, others mild-moderate
            if (/fracture/i.test(n)) return 'severe';
            return 'moderate';
        }
        // T codes = poisoning, adverse effects → severe
        if (/^T\d/.test(code)) return 'severe';
        // I codes = circulatory system
        if (/^I\d/.test(code)) return 'severe';
        // J codes = respiratory
        if (/^J\d/.test(code)) return 'moderate';
        // K codes = digestive
        if (/^K\d/.test(code)) return 'moderate';
        // M codes = musculoskeletal
        if (/^M\d/.test(code)) return 'moderate';
        // E codes = endocrine/metabolic
        if (/^E\d/.test(code)) return 'moderate';
        // F codes = mental/behavioral
        if (/^F\d/.test(code)) return 'moderate';
        // G codes = nervous system → severe
        if (/^G\d/.test(code)) return 'severe';
        // D codes = blood/immune or benign neoplasm
        if (/^D[0-4]/.test(code)) return 'severe'; // neoplasms
        if (/^D[5-9]/.test(code)) return 'moderate'; // blood disorders
    }

    // Default: moderate
    return 'moderate';
}

/* ─── Main ─────────────────────────────────────────────────── */

async function main() {
    console.log('🔬 Assigning severity levels to conditions...\n');

    const conditions = await prisma.medicalCondition.findMany({
        select: { id: true, commonName: true, specialistType: true, icdCode: true, severityLevel: true },
    });

    console.log(`  Total conditions: ${conditions.length}`);

    // Group updates by severity
    const severityCounts: Record<string, number> = { mild: 0, moderate: 0, severe: 0, critical: 0, variable: 0 };
    const updates: { id: number; severity: string }[] = [];

    for (const c of conditions) {
        const newSeverity = assignSeverity(c.commonName, c.specialistType, c.icdCode);
        severityCounts[newSeverity]++;
        if (c.severityLevel !== newSeverity) {
            updates.push({ id: c.id, severity: newSeverity });
        }
    }

    console.log('\n📊 Severity distribution:');
    for (const [sev, count] of Object.entries(severityCounts)) {
        const pct = ((count / conditions.length) * 100).toFixed(1);
        console.log(`  ${sev.padEnd(10)} ${count.toLocaleString().padStart(8)}  (${pct}%)`);
    }

    console.log(`\n  Need to update: ${updates.length.toLocaleString()} conditions`);

    if (updates.length === 0) {
        console.log('  ✅ All severities already correct.');
        return;
    }

    // Batch update in chunks of 500
    const BATCH_SIZE = 500;
    let updated = 0;

    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        await Promise.all(
            batch.map(u =>
                prisma.medicalCondition.update({
                    where: { id: u.id },
                    data: { severityLevel: u.severity },
                })
            )
        );
        updated += batch.length;
        process.stdout.write(`\r  Updated: ${updated.toLocaleString()} / ${updates.length.toLocaleString()}`);
    }

    console.log('\n\n✅ Done! Severity levels assigned successfully.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
