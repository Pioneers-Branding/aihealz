import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const API_KEY = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
const API_URL = process.env.OPENAI_API_KEY ? 'https://api.openai.com/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

const treatmentsFile = path.resolve(__dirname, '../public/data/treatments.json');

const specialties = [
    "Neurologist", "Dermatologist", "Orthopedic Surgeon",
    "Gastroenterologist", "Psychiatrist", "Endocrinologist", "Pulmonologist",
    "Oncologist", "Pediatrician", "Gynecologist", "Urologist", "Ophthalmologist",
    "ENT Specialist", "Rheumatologist", "Allergist", "Infectious Disease Specialist",
    "Nephrologist", "Hematologist", "Plastic Surgeon", "General Surgeon"
]; // Removed Cardiologist as it finished

const segments = [
    { type: "medical", label: "Prescription medications and clinical medical management" },
    { type: "surgical", label: "Surgeries, operative interventions, and interventional procedures" },
    { type: "otc", label: "Over-the-counter (OTC) medications and supplements" },
    { type: "home_remedy", label: "Home remedies, active lifestyle interventions, and self-care" },
    { type: "therapy", label: "Physical, occupational, respiratory, or mental health therapies / rehabilitation" }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromLLM(prompt: string, retries = 3): Promise<any[]> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2
                })
            });

            if (!response.ok) {
                console.warn(`[Retry ${i + 1}/${retries}] API Error: ${response.status} ${response.statusText}`);
                await sleep(2000);
                continue;
            }

            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            const jsonStr = content.replace(/^```json\s*/i, '').replace(/```$/i, '');
            return JSON.parse(jsonStr);

        } catch (error) {
            console.warn(`[Retry ${i + 1}/${retries}] Network Error:`, error);
            await sleep(2000);
        }
    }
    return [];
}

async function main() {
    if (!API_KEY) {
        console.error("No API KEY found in environment.");
        process.exit(1);
    }

    console.log(`Using API URL: ${API_URL}`);
    console.log(`Starting CONCURRENT EXHAUSTIVE generation for ${specialties.length} specialties...`);

    let existingTreatments: any[] = [];
    if (fs.existsSync(treatmentsFile)) {
        existingTreatments = JSON.parse(fs.readFileSync(treatmentsFile, 'utf-8'));
    }

    const existingNames = new Set(existingTreatments.map((t: any) => t.name.toLowerCase() + t.specialty.toLowerCase()));
    let newlyAdded = 0;

    for (const specialty of specialties) {
        console.log(`\n=== Processing: ${specialty} [${specialties.indexOf(specialty) + 1}/${specialties.length}] ===`);

        // Execute all 5 segment requests simultaneously for the current specialty
        const promises = segments.map(async (segment) => {
            const prompt = `You are a medical encyclopedist compiling the world's most comprehensive database of medical treatments and interventions.

Focus ONLY on the specialty: "${specialty}".
Focus ONLY on the category: "${segment.label}".

Task: Generate an EXHAUSTIVE, comprehensive list of EVERY known treatment, procedure, or intervention that fits this category for this specialty. 
Do not truncate. Aim for 30 to 100+ items per category. Think deeply through all sub-specializations, rare diseases, and standard protocols to list everything possible.

Return your response ONLY as a pure JSON array of objects. Do not include markdown, backticks, or any non-JSON text.
Every object must have "name", "type": "${segment.type}", and "specialty": "${specialty}".
Example format:
[
  { "name": "Aspirin", "type": "${segment.type}", "specialty": "${specialty}" }
]`;

            const generated = await fetchFromLLM(prompt);
            return { segment: segment.type, items: generated };
        });

        const results = await Promise.all(promises);

        for (const result of results) {
            let countForSegment = 0;
            for (const t of result.items) {
                const signature = t.name.toLowerCase() + t.specialty.toLowerCase();
                if (!existingNames.has(signature)) {
                    existingTreatments.push({
                        name: t.name,
                        type: result.segment,
                        specialty: specialty
                    });
                    existingNames.add(signature);
                    newlyAdded++;
                    countForSegment++;
                }
            }
            console.log(`  -> Segment [${result.segment}] added ${countForSegment} items.`);
        }

        // Save incrementally after every specialty
        fs.writeFileSync(treatmentsFile, JSON.stringify(existingTreatments, null, 2));

        // Moderate rate limit between specialties (Wait 5s since we just blasted 5 parallel reqs)
        await sleep(5000);
    }

    console.log(`\nSuccess! Completed deep generation. Added ${newlyAdded} total new treatments.`);
    console.log(`The database now has ${existingTreatments.length} total treatments in public/data/treatments.json.`);
}

main();
