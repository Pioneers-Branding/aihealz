import crypto from 'crypto';
import prisma from '@/lib/db';
import { sanitizeReportText } from './sanitizer';
import { extractClinicalEntities, type ClinicalExtraction } from './clinical-extractor';
import { matchDoctors, type MatchResult } from './doctor-matcher';
import { buildCacheKey, getCachedPage, setCachedPage } from '@/lib/redis';

/**
 * AI Pipeline Orchestrator
 *
 * End-to-end flow:
 * Upload → OCR (text extraction) → PII Sanitization → LLM Extraction →
 * Dossier Generation → Doctor Matching → DB Storage → Response
 *
 * Privacy guarantees:
 * - PII stripped before ANY LLM call
 * - Files encrypted at rest with AES-256
 * - Auto-deleted after 24 hours
 * - Session-hash based (no user accounts required)
 */

export interface PipelineInput {
    text: string;                   // OCR-extracted or pasted text
    reportType: 'blood_work' | 'imaging' | 'pathology' | 'prescription' | 'other';
    sessionHash: string;
    countrySlug: string;
    citySlug: string | null;
    localitySlug?: string | null;
    lang?: string;
}

export interface PipelineOutput {
    analysisId: string;
    extraction: ClinicalExtraction;
    matchedDoctors: MatchResult;
    dossier: DossierContent;
    meta: {
        sanitizedPiiCount: number;
        confidenceScore: number;
        needsReview: boolean;
        processingTimeMs: number;
        modelUsed: string;
        tokenCount: number;
    };
}

export interface DossierContent {
    title: string;
    plainEnglish: string;
    indicators: Array<{
        name: string;
        value: string;
        normalRange: string;
        severity: string;
        explanation: string;
    }>;
    questionsToAsk: string[];
    lifestyleFactors: string[];
    urgency: {
        level: string;
        message: string;
    };
    disclaimer: string;
}

/**
 * Run the complete analysis pipeline.
 */
export async function runAnalysisPipeline(input: PipelineInput): Promise<PipelineOutput> {
    const startTime = Date.now();

    // ── Step 1: Sanitize PII ──────────────────────────
    const sanitization = sanitizeReportText(input.text);
    const cleanText = sanitization.cleanText;

    // ── Step 2: Check Redis Cache ─────────────────────
    const textHash = crypto.createHash('sha256').update(cleanText).digest('hex');
    const cacheKey = `analysis:${textHash}`;
    const cached = await getCachedPage(cacheKey);
    if (cached) {
        return JSON.parse(cached) as PipelineOutput;
    }

    // ── Step 3: Clinical Extraction ───────────────────
    const { extraction, tokenCount, latencyMs } = await extractClinicalEntities(cleanText);

    // ── Step 4: Doctor Matchmaking ────────────────────
    const matchedDoctors = await matchDoctors(
        extraction,
        input.countrySlug,
        input.citySlug,
        input.localitySlug
    );

    // ── Step 5: Build Dossier ─────────────────────────
    const dossier = buildDossier(extraction);

    // ── Step 6: Determine if review is needed ─────────
    const needsReview = extraction.confidenceScore < 0.80;

    // ── Step 7: Store in database ─────────────────────
    const analysisResult = await prisma.analysisResult.create({
        data: {
            uploadId: null as unknown as string, // Will be linked if file was uploaded
            sessionHash: input.sessionHash,
            primaryIndicators: extraction.primaryIndicators as unknown as object,
            specialtyRequired: extraction.specialtyRequired,
            conditionSlug: extraction.conditionSlug || null,
            urgencyLevel: extraction.urgencyLevel,
            plainEnglish: extraction.plainEnglish,
            questionsToAsk: extraction.questionsToAsk as unknown as object,
            lifestyleFactors: extraction.lifestyleFactors as unknown as object,
            fullDossier: dossier as unknown as object,
            confidenceScore: extraction.confidenceScore,
            needsReview,
            matchedDoctorIds: matchedDoctors.doctors.map((d) => d.id),
            modelUsed: process.env.AI_MODEL || 'gpt-4o-mini',
            tokenCount,
            processingTimeMs: Date.now() - startTime,
        },
    });

    // ── Step 8: Log health timeline indicators ────────
    for (const indicator of extraction.primaryIndicators) {
        const numValue = parseFloat(indicator.value);
        if (!isNaN(numValue)) {
            // Check for previous entries to calculate trend
            const previous = await prisma.healthTimeline.findFirst({
                where: {
                    sessionHash: input.sessionHash,
                    indicatorName: indicator.name,
                },
                orderBy: { recordedDate: 'desc' },
            });

            let trendDirection: string | null = null;
            let trendPercent: number | null = null;

            if (previous?.indicatorValue) {
                const prevValue = Number(previous.indicatorValue);
                if (prevValue > 0) {
                    trendPercent = ((numValue - prevValue) / prevValue) * 100;
                    trendDirection =
                        trendPercent < -2 ? 'improving' :
                            trendPercent > 2 ? 'worsening' :
                                'stable';
                }
            }

            await prisma.healthTimeline.create({
                data: {
                    sessionHash: input.sessionHash,
                    analysisId: analysisResult.id,
                    indicatorName: indicator.name,
                    indicatorValue: numValue,
                    indicatorUnit: extractUnit(indicator.value),
                    trendDirection,
                    trendPercent,
                },
            });
        }
    }

    const output: PipelineOutput = {
        analysisId: analysisResult.id,
        extraction,
        matchedDoctors,
        dossier,
        meta: {
            sanitizedPiiCount: sanitization.redactedCount,
            confidenceScore: extraction.confidenceScore,
            needsReview,
            processingTimeMs: Date.now() - startTime,
            modelUsed: process.env.AI_MODEL || 'gpt-4o-mini',
            tokenCount,
        },
    };

    // ── Step 9: Cache result ──────────────────────────
    await setCachedPage(cacheKey, JSON.stringify(output), 3600); // 1h cache

    return output;
}

/**
 * Build the human-readable dossier from clinical extraction.
 */
function buildDossier(extraction: ClinicalExtraction): DossierContent {
    const urgencyMessages: Record<string, string> = {
        routine: 'No immediate action required. Schedule a consultation at your convenience.',
        urgent: 'We recommend scheduling a consultation within the next few days.',
        emergency: 'Some values require prompt medical attention. Please consult a doctor as soon as possible.',
    };

    return {
        title: 'Your Pre-Consultation Summary',
        plainEnglish: extraction.plainEnglish,
        indicators: extraction.primaryIndicators.map((ind) => ({
            name: ind.name,
            value: ind.value,
            normalRange: ind.normalRange,
            severity: ind.severity,
            explanation: buildIndicatorExplanation(ind),
        })),
        questionsToAsk: extraction.questionsToAsk,
        lifestyleFactors: extraction.lifestyleFactors,
        urgency: {
            level: extraction.urgencyLevel,
            message: urgencyMessages[extraction.urgencyLevel] || urgencyMessages.routine,
        },
        disclaimer:
            'This summary is generated by AI for informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.',
    };
}

/**
 * Build a plain-English explanation for a single indicator.
 */
function buildIndicatorExplanation(indicator: {
    name: string;
    value: string;
    normalRange: string;
    severity: string;
}): string {
    const severityDescriptions: Record<string, string> = {
        normal: 'within the expected range',
        borderline: 'slightly outside the typical range',
        high: 'notably outside the expected range',
        critical: 'significantly outside the expected range and may require prompt attention',
    };

    const desc = severityDescriptions[indicator.severity] || '';
    if (indicator.normalRange) {
        return `Your ${indicator.name} is ${indicator.value}, which is ${desc}. The typical range is ${indicator.normalRange}.`;
    }
    return `Your ${indicator.name} is ${indicator.value}, which is ${desc}.`;
}

/**
 * Extract unit from a value string (e.g., "2.8 mg/dL" → "mg/dL")
 */
function extractUnit(value: string): string | null {
    const match = value.match(/[a-zA-Z/%]+(?:\/[a-zA-Z]+)?$/);
    return match ? match[0] : null;
}

/**
 * Generate a session hash from request context.
 * Uses a combination of IP + User-Agent for anonymous tracking.
 */
export function generateSessionHash(ip: string, userAgent: string): string {
    return crypto
        .createHash('sha256')
        .update(`${ip}:${userAgent}:${process.env.SESSION_SALT || 'aihealz-salt'}`)
        .digest('hex');
}
