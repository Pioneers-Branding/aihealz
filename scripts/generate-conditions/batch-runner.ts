#!/usr/bin/env npx tsx
/**
 * Batch Runner for Condition Page Content Generation
 *
 * CLI tool for batch processing condition content generation
 * with progress tracking, parallel processing, and error handling.
 *
 * Usage:
 *   npx tsx scripts/generate-conditions/batch-runner.ts --specialty=Cardiology
 *   npx tsx scripts/generate-conditions/batch-runner.ts --all --concurrency=5
 *   npx tsx scripts/generate-conditions/batch-runner.ts --conditions=diabetes,hypertension
 *   npx tsx scripts/generate-conditions/batch-runner.ts --resume
 *   npx tsx scripts/generate-conditions/batch-runner.ts --validate --specialty=Cardiology
 */

import { parseArgs } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import {
  generateConditionContent,
  saveConditionContent,
  fetchConditions,
  prisma,
  type GenerationOptions,
  type GenerationResult,
  type GenerationProgress,
} from './index';
import type { MedicalConditionInput } from './templates/base-template';
import { listAvailableSpecialties, hasFullTemplate } from './templates';

// Progress file location
const PROGRESS_FILE = path.join(process.cwd(), '.condition-generation-progress.json');
const ERROR_LOG_FILE = path.join(process.cwd(), '.condition-generation-errors.log');

/**
 * Parse command line arguments
 */
function parseCliArgs(): GenerationOptions & { validate?: boolean; stats?: boolean; help?: boolean } {
  const { values } = parseArgs({
    options: {
      specialty: { type: 'string', short: 's' },
      conditions: { type: 'string', short: 'c' },
      all: { type: 'boolean', short: 'a' },
      concurrency: { type: 'string', default: '5' },
      resume: { type: 'boolean', short: 'r' },
      dryRun: { type: 'boolean', short: 'd' },
      language: { type: 'string', short: 'l', default: 'en' },
      validate: { type: 'boolean', short: 'v' },
      stats: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  });

  return {
    specialty: values.specialty as string | undefined,
    conditions: values.conditions ? (values.conditions as string).split(',') : undefined,
    all: values.all as boolean,
    concurrency: parseInt(values.concurrency as string, 10) || 5,
    resume: values.resume as boolean,
    dryRun: values.dryRun as boolean,
    language: values.language as string || 'en',
    validate: values.validate as boolean,
    stats: values.stats as boolean,
    help: values.help as boolean,
  };
}

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
Condition Page Content Generator
=================================

Generate comprehensive SEO-optimized content for medical condition pages.

Usage:
  npx tsx scripts/generate-conditions/batch-runner.ts [options]

Options:
  -s, --specialty <name>     Generate for specific specialty (e.g., Cardiology)
  -c, --conditions <slugs>   Generate for specific conditions (comma-separated slugs)
  -a, --all                  Generate for all conditions
      --concurrency <n>      Number of parallel generations (default: 5)
  -r, --resume               Resume from last progress
  -d, --dryRun               Preview without saving to database
  -l, --language <code>      Language code (default: en)
  -v, --validate             Validate existing content
      --stats                Show generation statistics
  -h, --help                 Show this help message

Examples:
  # Generate for Cardiology specialty
  npx tsx scripts/generate-conditions/batch-runner.ts --specialty=Cardiology

  # Generate for all conditions with 10 parallel workers
  npx tsx scripts/generate-conditions/batch-runner.ts --all --concurrency=10

  # Generate specific conditions
  npx tsx scripts/generate-conditions/batch-runner.ts --conditions=diabetes,hypertension,asthma

  # Resume interrupted generation
  npx tsx scripts/generate-conditions/batch-runner.ts --resume

  # Dry run (preview only)
  npx tsx scripts/generate-conditions/batch-runner.ts --specialty=Cardiology --dryRun

Available Specialties with Full Templates:
${listAvailableSpecialties().filter(s => hasFullTemplate(s)).map(s => `  - ${s}`).join('\n')}

Specialties without Full Templates (will use base template):
${listAvailableSpecialties().filter(s => !hasFullTemplate(s)).slice(0, 10).map(s => `  - ${s}`).join('\n')}
  ... and more
`);
}

/**
 * Load progress from file
 */
function loadProgress(): GenerationProgress | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return null;
}

/**
 * Save progress to file
 */
function saveProgress(progress: GenerationProgress): void {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

/**
 * Log error to file
 */
function logError(slug: string, error: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${slug}: ${error}\n`;
  fs.appendFileSync(ERROR_LOG_FILE, logEntry);
}

/**
 * Process conditions in parallel batches
 */
async function processBatch(
  conditions: MedicalConditionInput[],
  options: GenerationOptions,
  progress: GenerationProgress
): Promise<GenerationResult[]> {
  const concurrency = options.concurrency || 5;
  const results: GenerationResult[] = [];

  // Find starting point for resume
  let startIndex = 0;
  if (options.resume && progress.lastProcessedSlug) {
    const idx = conditions.findIndex(c => c.slug === progress.lastProcessedSlug);
    if (idx !== -1) {
      startIndex = idx + 1;
      console.log(`Resuming from condition #${startIndex + 1}: ${conditions[startIndex]?.slug || 'END'}`);
    }
  }

  // Process in batches
  for (let i = startIndex; i < conditions.length; i += concurrency) {
    const batch = conditions.slice(i, i + concurrency);

    console.log(`\nProcessing batch ${Math.floor(i / concurrency) + 1} (${i + 1}-${Math.min(i + concurrency, conditions.length)} of ${conditions.length})`);

    const batchPromises = batch.map(async (condition): Promise<GenerationResult> => {
      const startTime = Date.now();

      try {
        console.log(`  Generating: ${condition.commonName} (${condition.slug})`);

        const content = await generateConditionContent(condition, options.language);

        if (!options.dryRun) {
          await saveConditionContent(content);
        }

        const duration = Date.now() - startTime;
        console.log(`  ✓ ${condition.slug} - ${content.wordCount} words, score: ${content.qualityScore.toFixed(2)} (${duration}ms)`);

        // Update progress
        progress.processed++;
        progress.successful++;
        progress.lastProcessedSlug = condition.slug;
        progress.lastProcessedAt = new Date().toISOString();
        saveProgress(progress);

        return {
          success: true,
          conditionSlug: condition.slug,
          wordCount: content.wordCount,
          qualityScore: content.qualityScore,
          status: content.status,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ ${condition.slug}: ${errorMessage}`);

        // Log error
        logError(condition.slug, errorMessage);
        progress.processed++;
        progress.failed++;
        progress.errors.push({ slug: condition.slug, error: errorMessage });
        saveProgress(progress);

        return {
          success: false,
          conditionSlug: condition.slug,
          wordCount: 0,
          qualityScore: 0,
          status: 'draft',
          error: errorMessage,
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Brief pause between batches to avoid overwhelming the system
    if (i + concurrency < conditions.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Show generation statistics
 */
async function showStats(): Promise<void> {
  console.log('\n=== Generation Statistics ===\n');

  // Total conditions
  const totalConditions = await prisma.medicalCondition.count({ where: { isActive: true } });
  console.log(`Total Active Conditions: ${totalConditions}`);

  // Generated content count
  const generatedCount = await prisma.conditionPageContent.count();
  console.log(`Generated Content Pages: ${generatedCount}`);

  // Coverage percentage
  const coverage = ((generatedCount / totalConditions) * 100).toFixed(2);
  console.log(`Coverage: ${coverage}%`);

  // By status
  const byStatus = await prisma.conditionPageContent.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  console.log('\nBy Status:');
  byStatus.forEach(s => {
    console.log(`  ${s.status}: ${s._count.status}`);
  });

  // By specialty
  const bySpecialty = await prisma.conditionPageContent.groupBy({
    by: ['specialistType'],
    _count: { specialistType: true },
    orderBy: { _count: { specialistType: 'desc' } },
    take: 10,
  });
  console.log('\nTop 10 Specialties:');
  bySpecialty.forEach(s => {
    console.log(`  ${s.specialistType}: ${s._count.specialistType}`);
  });

  // Average quality score
  const avgQuality = await prisma.conditionPageContent.aggregate({
    _avg: { qualityScore: true },
    _min: { qualityScore: true },
    _max: { qualityScore: true },
  });
  console.log('\nQuality Scores:');
  console.log(`  Average: ${avgQuality._avg.qualityScore?.toFixed(2) || 'N/A'}`);
  console.log(`  Min: ${avgQuality._min.qualityScore?.toFixed(2) || 'N/A'}`);
  console.log(`  Max: ${avgQuality._max.qualityScore?.toFixed(2) || 'N/A'}`);

  // Average word count
  const avgWords = await prisma.conditionPageContent.aggregate({
    _avg: { wordCount: true },
    _sum: { wordCount: true },
  });
  console.log('\nWord Counts:');
  console.log(`  Average: ${Math.round(avgWords._avg.wordCount || 0)}`);
  console.log(`  Total: ${avgWords._sum.wordCount?.toLocaleString() || 0}`);

  // Last progress
  const progress = loadProgress();
  if (progress) {
    console.log('\nLast Generation Run:');
    console.log(`  Processed: ${progress.processed}/${progress.totalConditions}`);
    console.log(`  Successful: ${progress.successful}`);
    console.log(`  Failed: ${progress.failed}`);
    console.log(`  Last Updated: ${progress.lastProcessedAt || 'N/A'}`);
  }
}

/**
 * Validate existing content
 */
async function validateContent(options: GenerationOptions): Promise<void> {
  console.log('\n=== Validating Content ===\n');

  const where: any = {};
  if (options.specialty) {
    where.specialistType = options.specialty;
  }

  const content = await prisma.conditionPageContent.findMany({
    where,
    select: {
      id: true,
      conditionId: true,
      h1Title: true,
      qualityScore: true,
      wordCount: true,
      status: true,
      faqs: true,
      condition: {
        select: { slug: true, commonName: true },
      },
    },
  });

  console.log(`Validating ${content.length} content pages...\n`);

  let issues = 0;

  for (const page of content) {
    const problems: string[] = [];

    // Check word count
    if (!page.wordCount || page.wordCount < 500) {
      problems.push(`Low word count: ${page.wordCount || 0}`);
    }

    // Check quality score
    if (!page.qualityScore || Number(page.qualityScore) < 0.5) {
      problems.push(`Low quality score: ${page.qualityScore}`);
    }

    // Check FAQs
    const faqs = page.faqs as any[];
    if (!faqs || faqs.length < 10) {
      problems.push(`Few FAQs: ${faqs?.length || 0}`);
    }

    // Check H1 title
    if (!page.h1Title || page.h1Title.length < 10) {
      problems.push('Missing or short H1 title');
    }

    if (problems.length > 0) {
      issues++;
      console.log(`${page.condition.commonName} (${page.condition.slug}):`);
      problems.forEach(p => console.log(`  - ${p}`));
    }
  }

  console.log(`\nValidation complete: ${issues} pages with issues out of ${content.length}`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const options = parseCliArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.stats) {
    await showStats();
    await prisma.$disconnect();
    process.exit(0);
  }

  if (options.validate) {
    await validateContent(options);
    await prisma.$disconnect();
    process.exit(0);
  }

  if (!options.specialty && !options.conditions && !options.all && !options.resume) {
    console.error('Error: Please specify --specialty, --conditions, --all, or --resume');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  console.log('=== Condition Page Content Generator ===\n');
  console.log(`Options:`);
  console.log(`  Specialty: ${options.specialty || 'All'}`);
  console.log(`  Concurrency: ${options.concurrency}`);
  console.log(`  Language: ${options.language}`);
  console.log(`  Dry Run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log(`  Resume: ${options.resume ? 'Yes' : 'No'}`);

  // Fetch conditions
  console.log('\nFetching conditions...');
  const conditions = await fetchConditions(options);
  console.log(`Found ${conditions.length} conditions to process`);

  if (conditions.length === 0) {
    console.log('No conditions found. Exiting.');
    await prisma.$disconnect();
    process.exit(0);
  }

  // Initialize or load progress
  let progress: GenerationProgress;
  if (options.resume) {
    const loadedProgress = loadProgress();
    if (loadedProgress && loadedProgress.totalConditions === conditions.length) {
      progress = loadedProgress;
      console.log(`\nResuming from previous run: ${progress.processed}/${progress.totalConditions} processed`);
    } else {
      console.log('\nNo valid progress found. Starting fresh.');
      progress = {
        totalConditions: conditions.length,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
      };
    }
  } else {
    progress = {
      totalConditions: conditions.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };
    saveProgress(progress);
  }

  // Process conditions
  const startTime = Date.now();
  const results = await processBatch(conditions, options, progress);
  const duration = Date.now() - startTime;

  // Summary
  console.log('\n=== Generation Complete ===\n');
  console.log(`Total Processed: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log(`Average: ${(duration / results.length).toFixed(0)}ms per condition`);

  // Quality summary
  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    const avgQuality = successful.reduce((sum, r) => sum + r.qualityScore, 0) / successful.length;
    const avgWords = successful.reduce((sum, r) => sum + r.wordCount, 0) / successful.length;
    console.log(`\nAverage Quality Score: ${avgQuality.toFixed(2)}`);
    console.log(`Average Word Count: ${Math.round(avgWords)}`);

    const statusCounts = successful.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`\nBy Status:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
  }

  // Show errors if any
  if (progress.errors.length > 0) {
    console.log(`\nErrors logged to: ${ERROR_LOG_FILE}`);
  }

  // Cleanup
  if (options.resume === false || progress.processed >= progress.totalConditions) {
    // Clear progress file on completion
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  }

  await prisma.$disconnect();
}

// Run main
main().catch(error => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
