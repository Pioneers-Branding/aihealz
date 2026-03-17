import 'dotenv/config';
import prisma from '../src/lib/db';
import { generateAndSaveEnhancedContent } from '../src/lib/content/enhanced-content-factory';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mass Content Generation Script - Enhanced SEO Version
 *
 * Generates comprehensive SEO-optimized content for all 72k+ conditions.
 * Features:
 * - Parallel processing with configurable concurrency
 * - Progress tracking and resume capability
 * - Error logging and recovery
 * - Priority-based generation (popular conditions first)
 * - Location-specific content generation
 */

const CONCURRENCY = parseInt(process.env.GENERATION_CONCURRENCY || '5');
const PROGRESS_FILE = path.join(__dirname, '../.generation-progress.json');
const ERROR_LOG_FILE = path.join(__dirname, '../.generation-errors.log');
const BATCH_SIZE = 100; // Save progress every N conditions

interface ProgressState {
  lastProcessedId: number;
  totalProcessed: number;
  totalErrors: number;
  startedAt: string;
  lastUpdatedAt: string;
  completedConditions: string[];
  errorConditions: string[];
}

function loadProgress(): ProgressState {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.log('No existing progress file, starting fresh.');
  }
  return {
    lastProcessedId: 0,
    totalProcessed: 0,
    totalErrors: 0,
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    completedConditions: [],
    errorConditions: [],
  };
}

function saveProgress(state: ProgressState) {
  state.lastUpdatedAt = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, 2));
}

function logError(conditionSlug: string, error: string) {
  const logLine = `[${new Date().toISOString()}] ${conditionSlug}: ${error}\n`;
  fs.appendFileSync(ERROR_LOG_FILE, logLine);
}

async function getTopCities(limit: number = 50): Promise<{ slug: string; name: string; countryCode: string }[]> {
  // Get major Indian cities first (priority market)
  const indianCities = await prisma.geography.findMany({
    where: {
      level: 'city',
      parent: {
        parent: { slug: 'in' }
      }
    },
    select: { slug: true, name: true },
    take: limit,
    orderBy: { name: 'asc' }
  });

  return indianCities.map(c => ({ ...c, countryCode: 'in' }));
}

async function generateForCondition(
  condition: { id: number; slug: string; commonName: string },
  cities: { slug: string; name: string; countryCode: string }[]
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Generate country-level content first (India)
  try {
    const result = await generateAndSaveEnhancedContent(condition.slug, 'in', undefined, 'en');
    if (!result) {
      errors.push(`Country-level (India): Generation failed`);
    }
  } catch (e: any) {
    errors.push(`Country-level (India): ${e.message}`);
  }

  // Generate for top cities (with rate limiting)
  for (const city of cities.slice(0, 10)) { // Start with top 10 cities per condition
    try {
      const result = await generateAndSaveEnhancedContent(
        condition.slug,
        city.countryCode,
        city.slug,
        'en'
      );
      if (!result) {
        errors.push(`${city.name}: Generation failed`);
      }
      // Small delay between cities to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (e: any) {
      errors.push(`${city.name}: ${e.message}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

async function main() {
  console.log('========================================');
  console.log('  ENHANCED SEO CONTENT MASS GENERATOR  ');
  console.log('========================================');
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Batch Size: ${BATCH_SIZE}`);
  console.log('');

  // Load progress
  const progress = loadProgress();
  console.log(`Resuming from condition ID: ${progress.lastProcessedId}`);
  console.log(`Previously processed: ${progress.totalProcessed}`);
  console.log(`Previous errors: ${progress.totalErrors}`);
  console.log('');

  // Get all active conditions
  const conditions = await prisma.medicalCondition.findMany({
    where: {
      isActive: true,
      id: { gt: progress.lastProcessedId }
    },
    select: { id: true, slug: true, commonName: true },
    orderBy: { id: 'asc' },
  });

  console.log(`Conditions remaining: ${conditions.length}`);

  if (conditions.length === 0) {
    console.log('All conditions have been processed!');
    return;
  }

  // Get top cities
  const cities = await getTopCities(50);
  console.log(`Target cities: ${cities.length}`);
  console.log('');

  // Process in batches with concurrency
  let batchCount = 0;
  for (let i = 0; i < conditions.length; i += CONCURRENCY) {
    const batch = conditions.slice(i, i + CONCURRENCY);

    const batchStart = Date.now();
    process.stdout.write(
      `[Batch ${Math.floor(i / CONCURRENCY) + 1}] Processing ${batch.map(c => c.slug.slice(0, 20)).join(', ')}... `
    );

    // Process batch in parallel
    const results = await Promise.all(
      batch.map(async (condition) => {
        try {
          const result = await generateForCondition(condition, cities);
          return { condition, ...result };
        } catch (e: any) {
          return { condition, success: false, errors: [e.message] };
        }
      })
    );

    // Update progress
    let batchErrors = 0;
    for (const result of results) {
      progress.totalProcessed++;
      progress.lastProcessedId = result.condition.id;

      if (result.success) {
        progress.completedConditions.push(result.condition.slug);
      } else {
        progress.totalErrors++;
        batchErrors++;
        progress.errorConditions.push(result.condition.slug);
        result.errors.forEach(err => logError(result.condition.slug, err));
      }
    }

    const batchTime = ((Date.now() - batchStart) / 1000).toFixed(1);
    console.log(`Done in ${batchTime}s (${batchErrors} errors)`);

    // Save progress every BATCH_SIZE conditions
    batchCount += CONCURRENCY;
    if (batchCount >= BATCH_SIZE) {
      saveProgress(progress);
      batchCount = 0;

      // Print stats
      const percent = ((progress.totalProcessed / conditions.length) * 100).toFixed(1);
      console.log(`--- Progress: ${progress.totalProcessed}/${conditions.length} (${percent}%) | Errors: ${progress.totalErrors} ---`);
    }

    // Rate limiting delay
    await new Promise(r => setTimeout(r, 2000));
  }

  // Final save
  saveProgress(progress);

  console.log('');
  console.log('========================================');
  console.log('           GENERATION COMPLETE         ');
  console.log('========================================');
  console.log(`Total Processed: ${progress.totalProcessed}`);
  console.log(`Total Errors: ${progress.totalErrors}`);
  console.log(`Success Rate: ${((progress.totalProcessed - progress.totalErrors) / progress.totalProcessed * 100).toFixed(1)}%`);
  console.log(`Error log: ${ERROR_LOG_FILE}`);
}

// Alternative: Generate for specific conditions (for testing or targeted generation)
async function generateForSpecificConditions(slugs: string[]) {
  const cities = await getTopCities(10);

  for (const slug of slugs) {
    const condition = await prisma.medicalCondition.findUnique({
      where: { slug },
      select: { id: true, slug: true, commonName: true },
    });

    if (!condition) {
      console.log(`Condition not found: ${slug}`);
      continue;
    }

    console.log(`Generating for: ${condition.commonName}...`);
    const result = await generateForCondition(condition, cities);

    if (result.success) {
      console.log(`  Success!`);
    } else {
      console.log(`  Errors: ${result.errors.join(', ')}`);
    }
  }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--specific')) {
  const slugIndex = args.indexOf('--specific');
  const slugs = args.slice(slugIndex + 1);
  if (slugs.length > 0) {
    generateForSpecificConditions(slugs).catch(console.error).finally(() => prisma.$disconnect());
  } else {
    console.log('Usage: npx tsx scripts/mass-generate-enhanced.ts --specific diabetes hypertension');
  }
} else if (args.includes('--reset')) {
  // Reset progress
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
    console.log('Progress reset.');
  }
} else {
  main().catch(console.error).finally(() => prisma.$disconnect());
}
