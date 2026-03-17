import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/admin/generate-content
 *
 * Batch generates condition page content using DeepSeek AI
 * This populates the condition_page_content table which the condition pages read from
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY || '';

interface GeneratedContent {
    h1Title: string;
    heroOverview: string;
    definition: string;
    primarySymptoms: string[];
    earlyWarningSigns: string[];
    emergencySigns: string[];
    causes: Array<{ cause: string; description: string }>;
    riskFactors: Array<{ factor: string; category: string; description: string }>;
    diagnosisOverview: string;
    diagnosticTests: Array<{ test: string; purpose: string; whatToExpect?: string }>;
    treatmentOverview: string;
    medicalTreatments: Array<{ name: string; description: string; effectiveness?: string }>;
    surgicalOptions: Array<{ name: string; description: string; successRate?: string }>;
    preventionStrategies: string[];
    lifestyleModifications: string[];
    dietRecommendations: { recommended: string[]; avoid: string[] };
    prognosis: string;
    complications: string[];
    faqs: Array<{ question: string; answer: string }>;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    specialistType: string;
    whySeeSpecialist: string;
}

async function generateContentForCondition(
    conditionName: string,
    conditionSlug: string,
    specialistType: string,
    icdCode: string | null,
    bodySystem: string | null,
    language: string = 'en'
): Promise<GeneratedContent | null> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured');
    }

    const prompt = `You are a medical content expert. Generate comprehensive, accurate, and SEO-optimized content for a medical condition page.

Condition: "${conditionName}"
Specialist Type: ${specialistType || 'General Physician'}
ICD Code: ${icdCode || 'Not specified'}
Body System: ${bodySystem || 'Not specified'}
Language: ${language}

Generate a JSON response with this EXACT structure:
{
    "h1Title": "SEO-optimized H1 title for the condition page",
    "heroOverview": "2-3 sentence overview of the condition (150-200 words)",
    "definition": "Medical definition and explanation of the condition (200-300 words)",
    "primarySymptoms": ["symptom1", "symptom2", "symptom3", "symptom4", "symptom5"],
    "earlyWarningSigns": ["sign1", "sign2", "sign3"],
    "emergencySigns": ["emergency1", "emergency2"],
    "causes": [
        {"cause": "Cause name", "description": "Brief explanation"}
    ],
    "riskFactors": [
        {"factor": "Risk factor", "category": "lifestyle|genetic|medical|environmental", "description": "Brief explanation"}
    ],
    "diagnosisOverview": "How this condition is typically diagnosed (150-200 words)",
    "diagnosticTests": [
        {"test": "Test name", "purpose": "What it detects", "whatToExpect": "Brief description"}
    ],
    "treatmentOverview": "Overview of treatment approaches (150-200 words)",
    "medicalTreatments": [
        {"name": "Treatment name", "description": "How it works", "effectiveness": "High/Moderate/Variable"}
    ],
    "surgicalOptions": [
        {"name": "Procedure name", "description": "When and why it's done", "successRate": "Percentage or descriptor"}
    ],
    "preventionStrategies": ["strategy1", "strategy2", "strategy3"],
    "lifestyleModifications": ["modification1", "modification2"],
    "dietRecommendations": {
        "recommended": ["food1", "food2", "food3"],
        "avoid": ["food1", "food2"]
    },
    "prognosis": "Expected outcomes and long-term outlook (100-150 words)",
    "complications": ["complication1", "complication2"],
    "faqs": [
        {"question": "Common question about the condition?", "answer": "Clear, helpful answer"}
    ],
    "metaTitle": "SEO title under 60 characters",
    "metaDescription": "SEO description under 160 characters",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "specialistType": "${specialistType || 'General Physician'}",
    "whySeeSpecialist": "Why patients should consult this specialist (50-100 words)"
}

Important:
- Be medically accurate and cite standard clinical guidelines
- Make content patient-friendly but authoritative
- Include 5-8 causes/risk factors
- Include 3-5 diagnostic tests
- Include 4-6 medical treatments
- Include 5-8 FAQs
- Content should be helpful for patients researching this condition
- Do NOT include markdown, only output valid JSON`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://aihealz.com',
                'X-Title': 'AIHealz Content Generator',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`OpenRouter API error: ${response.status}`, errorText);
            return null;
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content as GeneratedContent;
    } catch (error) {
        console.error(`Failed to generate content for ${conditionSlug}:`, error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const {
            limit = 10,
            offset = 0,
            prioritize = 'high_search', // 'high_search', 'random', 'alphabetical'
            language = 'en',
            forceRegenerate = false,
        } = body;

        // Get conditions to process
        let conditions;

        if (prioritize === 'high_search') {
            // Prioritize common conditions first
            const priorityConditions = [
                'diabetes', 'hypertension', 'back-pain', 'migraine', 'asthma',
                'arthritis', 'depression', 'anxiety', 'obesity', 'cancer',
                'heart-disease', 'stroke', 'kidney-disease', 'liver-disease',
                'thyroid', 'pneumonia', 'bronchitis', 'tuberculosis', 'malaria',
                'dengue', 'covid-19', 'influenza', 'allergies', 'eczema', 'psoriasis',
            ];

            conditions = await prisma.medicalCondition.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { slug: { in: priorityConditions } },
                        { commonName: { in: priorityConditions.map(p => p.replace(/-/g, ' ')) } },
                    ],
                },
                select: {
                    id: true,
                    slug: true,
                    commonName: true,
                    specialistType: true,
                    icdCode: true,
                    bodySystem: true,
                },
                take: limit,
                skip: offset,
            });

            // If we've exhausted priority conditions, get more
            if (conditions.length < limit) {
                const existingIds = conditions.map(c => c.id);
                const moreConditions = await prisma.medicalCondition.findMany({
                    where: {
                        isActive: true,
                        id: { notIn: existingIds },
                    },
                    select: {
                        id: true,
                        slug: true,
                        commonName: true,
                        specialistType: true,
                        icdCode: true,
                        bodySystem: true,
                    },
                    take: limit - conditions.length,
                    skip: Math.max(0, offset - priorityConditions.length),
                    orderBy: { slug: 'asc' },
                });
                conditions = [...conditions, ...moreConditions];
            }
        } else {
            conditions = await prisma.medicalCondition.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    slug: true,
                    commonName: true,
                    specialistType: true,
                    icdCode: true,
                    bodySystem: true,
                },
                take: limit,
                skip: offset,
                orderBy: prioritize === 'alphabetical' ? { slug: 'asc' } : undefined,
            });
        }

        const results: Array<{ slug: string; status: string; error?: string }> = [];
        let generated = 0;
        let skipped = 0;
        let failed = 0;

        for (const condition of conditions) {
            // Check if content already exists
            if (!forceRegenerate) {
                const existing = await prisma.conditionPageContent.findFirst({
                    where: {
                        conditionId: condition.id,
                        languageCode: language,
                        status: 'published',
                    },
                });

                if (existing) {
                    results.push({ slug: condition.slug, status: 'skipped (exists)' });
                    skipped++;
                    continue;
                }
            }

            // Generate content
            const content = await generateContentForCondition(
                condition.commonName,
                condition.slug,
                condition.specialistType,
                condition.icdCode,
                condition.bodySystem,
                language
            );

            if (!content) {
                results.push({ slug: condition.slug, status: 'failed', error: 'Generation failed' });
                failed++;
                continue;
            }

            // Save to database
            try {
                await prisma.conditionPageContent.upsert({
                    where: {
                        conditionId_languageCode: {
                            conditionId: condition.id,
                            languageCode: language,
                        },
                    },
                    update: {
                        h1Title: content.h1Title,
                        heroOverview: content.heroOverview,
                        definition: content.definition,
                        primarySymptoms: content.primarySymptoms,
                        earlyWarningSigns: content.earlyWarningSigns,
                        emergencySigns: content.emergencySigns,
                        causes: content.causes,
                        riskFactors: content.riskFactors,
                        diagnosisOverview: content.diagnosisOverview,
                        diagnosticTests: content.diagnosticTests,
                        treatmentOverview: content.treatmentOverview,
                        medicalTreatments: content.medicalTreatments,
                        surgicalOptions: content.surgicalOptions,
                        preventionStrategies: content.preventionStrategies,
                        lifestyleModifications: content.lifestyleModifications,
                        dietRecommendations: content.dietRecommendations,
                        prognosis: content.prognosis,
                        complications: content.complications,
                        faqs: content.faqs,
                        metaTitle: content.metaTitle,
                        metaDescription: content.metaDescription,
                        keywords: content.keywords,
                        specialistType: content.specialistType,
                        whySeeSpecialist: content.whySeeSpecialist,
                        status: 'published',
                        updatedAt: new Date(),
                    },
                    create: {
                        conditionId: condition.id,
                        languageCode: language,
                        h1Title: content.h1Title,
                        heroOverview: content.heroOverview,
                        definition: content.definition,
                        primarySymptoms: content.primarySymptoms,
                        earlyWarningSigns: content.earlyWarningSigns,
                        emergencySigns: content.emergencySigns,
                        causes: content.causes,
                        riskFactors: content.riskFactors,
                        diagnosisOverview: content.diagnosisOverview,
                        diagnosticTests: content.diagnosticTests,
                        treatmentOverview: content.treatmentOverview,
                        medicalTreatments: content.medicalTreatments,
                        surgicalOptions: content.surgicalOptions,
                        preventionStrategies: content.preventionStrategies,
                        lifestyleModifications: content.lifestyleModifications,
                        dietRecommendations: content.dietRecommendations,
                        prognosis: content.prognosis,
                        complications: content.complications,
                        faqs: content.faqs,
                        metaTitle: content.metaTitle,
                        metaDescription: content.metaDescription,
                        keywords: content.keywords,
                        specialistType: content.specialistType,
                        whySeeSpecialist: content.whySeeSpecialist,
                        status: 'published',
                    },
                });

                results.push({ slug: condition.slug, status: 'generated' });
                generated++;
            } catch (dbError: any) {
                results.push({ slug: condition.slug, status: 'failed', error: dbError.message?.substring(0, 100) });
                failed++;
            }

            // Rate limiting - wait 1 second between API calls
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Get total counts
        const totalConditions = await prisma.medicalCondition.count({ where: { isActive: true } });
        const totalGenerated = await prisma.conditionPageContent.count({ where: { status: 'published' } });

        return NextResponse.json({
            success: true,
            message: `Generated ${generated}, skipped ${skipped}, failed ${failed}`,
            results,
            progress: {
                totalConditions,
                totalGenerated,
                percentComplete: ((totalGenerated / totalConditions) * 100).toFixed(1) + '%',
            },
        });
    } catch (error: any) {
        console.error('Content generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    const totalConditions = await prisma.medicalCondition.count({ where: { isActive: true } });
    const totalGenerated = await prisma.conditionPageContent.count({ where: { status: 'published' } });
    const byLanguage = await prisma.conditionPageContent.groupBy({
        by: ['languageCode'],
        _count: true,
    });

    return NextResponse.json({
        totalConditions,
        totalGenerated,
        percentComplete: ((totalGenerated / totalConditions) * 100).toFixed(1) + '%',
        byLanguage: byLanguage.map(l => ({ language: l.languageCode, count: l._count })),
        estimatedUrls: totalGenerated * 796 * 33, // conditions × cities × languages
    });
}
