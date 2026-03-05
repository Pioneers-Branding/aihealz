import prisma from '@/lib/db';

/**
 * ICD-10-CM Condition Seeder
 *
 * Batch process:
 * 1. Ingest ICD-10 codes from JSON/CSV
 * 2. Use LLM to categorize into specialties + body systems
 * 3. Insert into medical_conditions with specialty mapping
 *
 * Run: npx ts-node src/lib/cms/icd10-seeder.ts
 */

const OPENROUTER_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_BASE = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';
const MODEL = process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct';
const BATCH_SIZE = 50;

interface ICD10Entry {
    code: string;
    description: string;
    category?: string;
}

/**
 * Map a batch of ICD-10 codes to specialties using LLM.
 */
async function mapBatchToSpecialties(entries: ICD10Entry[]): Promise<Array<{
    code: string;
    specialty: string;
    bodySystem: string;
    severity: string;
    treatments: string[];
    slug: string;
}>> {
    const prompt = `You are a medical classifier. For each ICD-10 condition below, return a JSON array where each element has:
- code: the ICD-10 code
- specialty: the primary medical specialty (e.g., Cardiology, Orthopedics, Neurology)
- bodySystem: the body system (e.g., Head & Brain, Heart, Spine & Joints)
- severity: one of "mild", "moderate", "severe"
- treatments: array of 2-3 common treatment approaches
- slug: URL-friendly slug from the condition name

Conditions:
${entries.map((e) => `${e.code}: ${e.description}`).join('\n')}

Return ONLY valid JSON array. No markdown.`;

    try {
        const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 4000,
            }),
        });

        if (!res.ok) throw new Error(`LLM error: ${res.status}`);
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '[]';

        // Parse JSON from response (handle markdown code blocks)
        const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Batch mapping failed:', error);
        // Fallback: simple chapter-based mapping
        return entries.map((e) => ({
            code: e.code,
            specialty: mapChapterToSpecialty(e.code),
            bodySystem: mapChapterToBodySystem(e.code),
            severity: 'moderate',
            treatments: [],
            slug: e.description.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
        }));
    }
}

/**
 * Seed conditions from an ICD-10 dataset.
 */
export async function seedFromICD10(entries: ICD10Entry[]) {
    console.log(`[INFO] Seeding ${entries.length} ICD-10 conditions...`);
    let processed = 0;
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);

        // Map to specialties via LLM
        const mappedBatch = await mapBatchToSpecialties(batch);

        for (const mapped of mappedBatch) {
            const original = batch.find((e) => e.code === mapped.code);
            if (!original) continue;

            // Check if condition already exists
            const existing = await prisma.medicalCondition.findFirst({
                where: { slug: mapped.slug },
            });

            if (existing) {
                skipped++;
                continue;
            }

            // Create condition
            await prisma.medicalCondition.create({
                data: {
                    commonName: original.description,
                    scientificName: original.description,
                    slug: mapped.slug,
                    specialistType: mapped.specialty,
                    symptoms: [],
                    isActive: true,
                },
            });

            // Store specialty mapping
            await prisma.icd10SpecialtyMap.create({
                data: {
                    icdCode: mapped.code,
                    conditionName: original.description,
                    specialty: mapped.specialty,
                    bodySystem: mapped.bodySystem,
                    severityLevel: mapped.severity,
                    treatments: mapped.treatments,
                },
            });

            created++;
        }

        processed += batch.length;
        console.log(`  [+] Processed ${processed}/${entries.length} (${created} created, ${skipped} skipped)`);

        // Rate limit: 500ms between batches
        await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`[OK] Seeding complete: ${created} created, ${skipped} skipped`);
    return { created, skipped, total: entries.length };
}

// ── Fallback chapter-based mapping ──────────────────────────

function mapChapterToSpecialty(code: string): string {
    const chapter = code.charAt(0);
    const map: Record<string, string> = {
        A: 'Infectious Disease', B: 'Infectious Disease',
        C: 'Oncology', D: 'Hematology',
        E: 'Endocrinology', F: 'Psychiatry',
        G: 'Neurology', H: 'Ophthalmology',
        I: 'Cardiology', J: 'Pulmonology',
        K: 'Gastroenterology', L: 'Dermatology',
        M: 'Orthopedics', N: 'Urology',
        O: 'Obstetrics', P: 'Neonatology',
        Q: 'Genetics', R: 'General Medicine',
        S: 'Orthopedics', T: 'Emergency Medicine',
    };
    return map[chapter] || 'General Medicine';
}

function mapChapterToBodySystem(code: string): string {
    const chapter = code.charAt(0);
    const map: Record<string, string> = {
        A: 'Immune System', B: 'Immune System',
        C: 'Multiple Systems', D: 'Blood & Lymphatic',
        E: 'Endocrine System', F: 'Mental Health',
        G: 'Head & Brain', H: 'Eyes & Ears',
        I: 'Heart & Cardiovascular', J: 'Lungs & Respiratory',
        K: 'Digestive System', L: 'Skin & Dermatology',
        M: 'Spine & Joints', N: 'Urinary System',
        O: "Women's Health", P: "Children's Health",
    };
    return map[chapter] || 'Multiple Systems';
}
