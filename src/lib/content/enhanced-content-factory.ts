import prisma from '@/lib/db';
import { generateConditionRender } from '@/lib/cms/media-engine';
import { getIntentKeyword } from './intent-analyzer';
import { getTreatmentCost } from './cost-estimator';

/**
 * Enhanced Content Factory - Comprehensive SEO-Optimized Medical Content Generator
 *
 * Generates comprehensive, SEO-optimized content for condition pages including:
 * - Risk factors, causes, prevention
 * - When to see a doctor
 * - Diagnosis & prognosis
 * - Complications
 * - Location-specific treatment info
 * - Best doctor sections with SEO keywords
 * - 15-20 comprehensive FAQs
 * - Hospital recommendations
 * - Related conditions
 */

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE = 'https://api.deepseek.com/chat/completions';

interface GeneratedContent {
  h1Title: string;
  metaSummary: string;
  llmSummary: string;
  aiOpinion: string;
  localInsights: string;
  treatmentGuide: string;
  recoveryTips: string;
  riskFactors: string[];
  prevention: string[];
  whenToSeeDoctor: string;
  causes: string[];
  diagnosis: string;
  prognosis: string;
  complications: string[];
  relatedConditions: { name: string; slug: string; relevance: string }[];
  seoKeywords: string[];
  bestDoctorSection: string;
  treatmentInLocation: string;
  hospitalRecommend: { criteria: string[]; tips: string[] };
  faqs: { question: string; answer: string }[];
}

function buildComprehensiveSEOPrompt(
  conditionName: string,
  scientificName: string,
  specialistType: string,
  locationName: string,
  countryCode: string,
  keyword: string,
  symptoms: string[],
  existingTreatments: string[]
): string {
  const locationKeywords = [
    `${conditionName} treatment in ${locationName}`,
    `best ${specialistType.toLowerCase()} for ${conditionName} in ${locationName}`,
    `${conditionName} specialist ${locationName}`,
    `${conditionName} hospital in ${locationName}`,
    `${conditionName} cost in ${locationName}`,
    `${conditionName} doctor near me ${locationName}`,
    `how to treat ${conditionName} in ${locationName}`,
    `${conditionName} symptoms and treatment ${locationName}`,
  ];

  return `You are an elite medical SEO content writer with deep expertise in healthcare. Generate COMPREHENSIVE, AUTHORITATIVE content for a medical condition page.

=== CONDITION DETAILS ===
Condition: "${conditionName}"
Scientific Name: "${scientificName}"
Specialist Type: "${specialistType}"
Location: "${locationName}" (${countryCode.toUpperCase()})
Primary SEO Keyword: "${keyword}"
Known Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'General symptoms'}
Known Treatments: ${existingTreatments.length > 0 ? existingTreatments.join(', ') : 'Standard medical treatment'}

=== LOCATION-SPECIFIC KEYWORDS TO NATURALLY INCLUDE ===
${locationKeywords.map((k, i) => `${i + 1}. "${k}"`).join('\n')}

=== REQUIRED OUTPUT (JSON) ===
Generate a JSON object with these fields:

{
  "h1Title": "SEO-optimized H1 title (60-70 chars) including location, e.g., '${conditionName} Treatment in ${locationName} - Expert Care & Specialists'",

  "metaSummary": "Compelling meta description (150-160 chars) with call-to-action for CTR optimization",

  "llmSummary": "Hidden summary for AI search engines (200 chars max)",

  "aiOpinion": "Comprehensive AI Second Opinion (300-400 words): Explain ${conditionName} in patient-friendly language. Cover what it is, why it happens, how it affects daily life, and general prognosis. Be empathetic but authoritative. Mention that treatment in ${locationName} follows modern medical protocols.",

  "localInsights": "Location-specific insights (200-300 words): How ${locationName}'s climate, environment, lifestyle, and healthcare infrastructure affect ${conditionName}. Include local health statistics if relevant. Mention top hospitals and medical facilities in ${locationName}.",

  "treatmentGuide": "Comprehensive treatment protocol (500-700 words) using H2/H3 markdown headers. Cover:\n## First-Line Treatment\n## Advanced Treatment Options\n## Surgical Options (if applicable)\n## Treatment in ${locationName}\n## What to Expect During Your Visit\n## Follow-up Care",

  "recoveryTips": "Practical recovery advice (200-300 words) with actionable bullet points",

  "riskFactors": ["Array of 8-12 risk factors for ${conditionName}, be specific and medically accurate"],

  "prevention": ["Array of 8-10 prevention strategies, practical and evidence-based"],

  "whenToSeeDoctor": "Detailed guidance (150-200 words) on warning signs that require immediate medical attention for ${conditionName}. Use bullet points for red flags.",

  "causes": ["Array of 6-10 underlying causes, from most common to rare"],

  "diagnosis": "Explain diagnostic process (200-250 words): tests, imaging, physical exams used to diagnose ${conditionName}. Mention what to expect at a ${specialistType} clinic in ${locationName}.",

  "prognosis": "Detailed prognosis information (150-200 words): expected outcomes, factors affecting recovery, long-term outlook",

  "complications": ["Array of 6-8 potential complications if untreated, with brief explanations"],

  "relatedConditions": [
    {"name": "Related Condition 1", "slug": "related-condition-1", "relevance": "How it relates"},
    {"name": "Related Condition 2", "slug": "related-condition-2", "relevance": "How it relates"},
    {"name": "Related Condition 3", "slug": "related-condition-3", "relevance": "How it relates"},
    {"name": "Related Condition 4", "slug": "related-condition-4", "relevance": "How it relates"},
    {"name": "Related Condition 5", "slug": "related-condition-5", "relevance": "How it relates"}
  ],

  "seoKeywords": ${JSON.stringify(locationKeywords)},

  "bestDoctorSection": "SEO-optimized section (250-350 words) about finding the best ${specialistType} for ${conditionName} in ${locationName}. Include:\n- What qualifications to look for\n- Questions to ask your doctor\n- How to verify credentials\n- Why specialized care matters\nNaturally include: 'best doctor for ${conditionName} treatment in ${locationName}', 'top ${specialistType.toLowerCase()} in ${locationName}', '${conditionName} specialist near me'",

  "treatmentInLocation": "Location-focused treatment section (250-350 words) specifically about ${conditionName} treatment options in ${locationName}. Cover:\n- Available treatment centers\n- Cost considerations in ${locationName}\n- Insurance and payment options\n- What makes ${locationName} a good place for treatment\nNaturally include: '${conditionName} treatment in ${locationName}', 'cost of ${conditionName} treatment in ${locationName}', '${conditionName} hospitals in ${locationName}'",

  "hospitalRecommend": {
    "criteria": ["Array of 6-8 criteria for choosing the best hospital for ${conditionName} treatment in ${locationName}"],
    "tips": ["Array of 5-7 practical tips for patients seeking treatment"]
  },

  "faqs": [
    Generate 15-20 FAQs that real patients would Google. Include:
    - "What is ${conditionName}?"
    - "What causes ${conditionName}?"
    - "What are the symptoms of ${conditionName}?"
    - "How is ${conditionName} diagnosed?"
    - "What is the best treatment for ${conditionName}?"
    - "Can ${conditionName} be cured?"
    - "How long does ${conditionName} treatment take?"
    - "What is the cost of ${conditionName} treatment in ${locationName}?"
    - "Who is the best doctor for ${conditionName} in ${locationName}?"
    - "What are the complications of ${conditionName}?"
    - "Can I prevent ${conditionName}?"
    - "Is ${conditionName} serious?"
    - "When should I see a doctor for ${conditionName}?"
    - "What lifestyle changes help with ${conditionName}?"
    - "Is ${conditionName} hereditary?"
    Each FAQ should have comprehensive 100-150 word answers optimized for Google Featured Snippets.
    Format: {"question": "Full question?", "answer": "Detailed answer..."}
  ]
}

=== CRITICAL INSTRUCTIONS ===
1. Output ONLY valid JSON - no markdown, no code blocks
2. Be medically accurate and evidence-based
3. Use empathetic, patient-friendly language
4. Naturally incorporate ALL location-specific keywords multiple times
5. Make content unique and valuable - not generic
6. Include specific details about ${locationName}'s healthcare landscape
7. Optimize every section for featured snippets
8. Ensure h1Title and metaSummary are unique and compelling`;
}

export async function generateEnhancedContent(
  conditionSlug: string,
  countryCode: string,
  citySlug?: string,
  language: string = 'en'
): Promise<GeneratedContent | null> {
  // 1. Fetch condition info
  const condition = await prisma.medicalCondition.findUnique({
    where: { slug: conditionSlug },
  });

  if (!condition) {
    console.error(`Condition not found: ${conditionSlug}`);
    return null;
  }

  // 2. Get location name
  let locationName = countryCode === 'in' ? 'India' : countryCode.toUpperCase();
  if (citySlug) {
    const city = await prisma.geography.findFirst({
      where: { slug: citySlug, level: 'city' },
      select: { name: true },
    });
    if (city) locationName = city.name;
  }

  // 3. Get primary keyword
  const keyword = await getIntentKeyword(conditionSlug, condition.commonName, citySlug, countryCode);

  // 4. Build prompt
  const symptoms = Array.isArray(condition.symptoms) ? condition.symptoms as string[] : [];
  const treatments = Array.isArray(condition.treatments) ? condition.treatments as string[] : [];

  const prompt = buildComprehensiveSEOPrompt(
    condition.commonName,
    condition.scientificName,
    condition.specialistType,
    locationName,
    countryCode,
    keyword,
    symptoms,
    treatments
  );

  // 5. Call DeepSeek API
  let contentData: GeneratedContent | null = null;
  let retries = 3;

  while (retries > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout for comprehensive content

      const res = await fetch(DEEPSEEK_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.15,
          max_tokens: 8000,
          response_format: { type: 'json_object' },
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`DeepSeek Error (${res.status}): ${errorText}`);
        retries--;
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const json = await res.json();
      const rawContent = json.choices[0]?.message?.content;

      if (!rawContent) {
        console.error('Empty response from DeepSeek');
        retries--;
        continue;
      }

      contentData = JSON.parse(rawContent);
      break;
    } catch (e: any) {
      console.error(`Attempt failed (${retries} left): ${e.message}`);
      retries--;
      if (retries > 0) await new Promise(r => setTimeout(r, 5000));
    }
  }

  if (!contentData) {
    console.error(`Failed to generate content for ${conditionSlug}`);
    return null;
  }

  return contentData;
}

export async function saveEnhancedContent(
  conditionSlug: string,
  countryCode: string,
  citySlug: string,
  language: string,
  content: GeneratedContent
): Promise<void> {
  await prisma.conditionContent.upsert({
    where: {
      conditionSlug_countryCode_citySlug_language: {
        conditionSlug,
        countryCode,
        citySlug: citySlug || '',
        language,
      },
    },
    update: {
      h1Title: content.h1Title,
      metaSummary: content.metaSummary,
      llmSummary: content.llmSummary,
      aiOpinion: content.aiOpinion,
      localInsights: content.localInsights,
      treatmentGuide: content.treatmentGuide,
      recoveryTips: content.recoveryTips,
      riskFactors: content.riskFactors,
      prevention: content.prevention,
      whenToSeeDoctor: content.whenToSeeDoctor,
      causes: content.causes,
      diagnosis: content.diagnosis,
      prognosis: content.prognosis,
      complications: content.complications,
      relatedConditions: content.relatedConditions,
      seoKeywords: content.seoKeywords,
      bestDoctorSection: content.bestDoctorSection,
      treatmentInLocation: content.treatmentInLocation,
      hospitalRecommend: content.hospitalRecommend,
      faqSchema: content.faqs,
      needsRefresh: false,
      lastGenerated: new Date(),
    },
    create: {
      conditionSlug,
      countryCode,
      citySlug: citySlug || '',
      language,
      h1Title: content.h1Title,
      metaSummary: content.metaSummary,
      llmSummary: content.llmSummary,
      aiOpinion: content.aiOpinion,
      localInsights: content.localInsights,
      treatmentGuide: content.treatmentGuide,
      recoveryTips: content.recoveryTips,
      riskFactors: content.riskFactors,
      prevention: content.prevention,
      whenToSeeDoctor: content.whenToSeeDoctor,
      causes: content.causes,
      diagnosis: content.diagnosis,
      prognosis: content.prognosis,
      complications: content.complications,
      relatedConditions: content.relatedConditions,
      seoKeywords: content.seoKeywords,
      bestDoctorSection: content.bestDoctorSection,
      treatmentInLocation: content.treatmentInLocation,
      hospitalRecommend: content.hospitalRecommend,
      faqSchema: content.faqs,
    },
  });
}

export async function generateAndSaveEnhancedContent(
  conditionSlug: string,
  countryCode: string,
  citySlug?: string,
  language: string = 'en'
): Promise<boolean> {
  try {
    const content = await generateEnhancedContent(conditionSlug, countryCode, citySlug, language);

    if (!content) return false;

    await saveEnhancedContent(conditionSlug, countryCode, citySlug || '', language, content);

    // Generate visual if needed
    const condition = await prisma.medicalCondition.findUnique({
      where: { slug: conditionSlug },
      select: { commonName: true },
    });

    if (condition) {
      await generateConditionRender(conditionSlug, condition.commonName);
    }

    // Generate cost estimate if city-level
    if (citySlug && condition) {
      await getTreatmentCost(conditionSlug, condition.commonName, citySlug, countryCode);
    }

    return true;
  } catch (error) {
    console.error(`Error generating content for ${conditionSlug}:`, error);
    return false;
  }
}
