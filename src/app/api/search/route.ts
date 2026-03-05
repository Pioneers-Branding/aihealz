import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { normalizeSpecialty, SPECIALTY_ICON_MAP } from '@/lib/normalize-specialty';
import { checkRateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';

// Sanitize user input to prevent XSS
function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Search rate limit: higher than forms since search needs to be responsive
const SEARCH_RATE_LIMIT = { maxRequests: 60, windowMs: 60 * 1000 }; // 60 requests per minute

// Get user's geo context from middleware headers
function getGeoFromRequest(req: NextRequest): { country: string; lang: string } {
    const country = req.headers.get('x-aihealz-country') || 'india';
    const lang = req.headers.get('x-aihealz-lang') || 'en';
    return { country, lang };
}

interface SearchResult {
    type: 'condition' | 'treatment' | 'specialty' | 'tool' | 'symptom' | 'test';
    slug: string;
    name: string;
    subtitle: string;
    url: string;
    icon?: string;
    matchedSymptom?: string; // For symptom-based matches
}

// Load treatments once at module level
interface TreatmentData {
    name: string;
    simpleName?: string;
    specialty: string;
    type: string;
    brandNames?: string[];
    searchTags?: string[];
}
let treatmentsCache: TreatmentData[] | null = null;
let treatmentsCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getTreatments(): TreatmentData[] {
    const now = Date.now();
    if (!treatmentsCache || now - treatmentsCacheTime > CACHE_TTL) {
        try {
            const filePath = path.join(process.cwd(), 'public', 'data', 'treatments.json');
            treatmentsCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            treatmentsCacheTime = now;
        } catch {
            treatmentsCache = [];
        }
    }
    return treatmentsCache!;
}

// Known specialties for matching
const SPECIALTIES = Object.keys(SPECIALTY_ICON_MAP);

// Quick-access tool pages (icons are now rendered client-side, these are legacy identifiers)
const TOOLS: SearchResult[] = [
    { type: 'tool', slug: 'drugs', name: 'Drug Reference', subtitle: 'Look up drug info, dosages, side effects', url: '/reference/drugs', icon: 'pill' },
    { type: 'tool', slug: 'interaction', name: 'Drug Interaction Checker', subtitle: 'Check interactions between medications', url: '/reference/drug-interaction', icon: 'refresh' },
    { type: 'tool', slug: 'pill-id', name: 'Pill Identifier', subtitle: 'Identify a pill by shape, color, imprint', url: '/reference/pill-identifier', icon: 'search' },
    { type: 'tool', slug: 'lab', name: 'Lab Result Interpreter', subtitle: 'Understand your lab values', url: '/reference/lab-medicine', icon: 'beaker' },
    { type: 'tool', slug: 'calc', name: 'Health Calculators', subtitle: 'BMI, BMR, eGFR, and more', url: '/tools', icon: 'calculator' },
    { type: 'tool', slug: 'analyze', name: 'AI Report Analyzer', subtitle: 'Upload medical reports for AI analysis', url: '/analyze', icon: 'document' },
    { type: 'tool', slug: 'symptoms', name: 'Symptom Checker', subtitle: 'AI-powered symptom analysis', url: '/symptoms', icon: 'heart' },
    { type: 'tool', slug: 'guidelines', name: 'Clinical Guidelines', subtitle: 'Latest evidence-based guidelines', url: '/reference/guidelines', icon: 'book' },
    { type: 'tool', slug: 'anatomy', name: 'Clinical Anatomy', subtitle: 'Detailed anatomical references', url: '/reference/anatomy', icon: 'brain' },
    { type: 'tool', slug: 'cases', name: 'Cases & Quizzes', subtitle: 'Test your clinical knowledge', url: '/reference/simulations', icon: 'target' },
];

export async function GET(req: NextRequest) {
    // Apply rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`search:${clientId}`, SEARCH_RATE_LIMIT);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: 'Too many search requests. Please wait a moment.' },
            {
                status: 429,
                headers: rateLimitHeaders(rateLimit),
            }
        );
    }

    try {
        const q = req.nextUrl.searchParams.get('q')?.trim();
        const typeFilter = req.nextUrl.searchParams.get('type')?.trim(); // Filter by type: 'condition', 'treatment', 'specialty', 'tool'
        const limitParam = req.nextUrl.searchParams.get('limit');
        const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 12, 1), 50) : 12; // Default 12, max 50

        // Validate query length
        if (!q || q.length < 2) {
            return NextResponse.json([]);
        }

        // Bound query length to prevent abuse
        if (q.length > 100) {
            return NextResponse.json({ error: 'Query too long' }, { status: 400 });
        }

        const lowerQ = q.toLowerCase();
        const results: SearchResult[] = [];

        // Get user's selected country/language from middleware headers
        // Only use geo prefix if headers are explicitly set (not defaults)
        const geo = getGeoFromRequest(req);
        const hasExplicitGeo = req.headers.get('x-aihealz-country') !== null;
        const geoPrefix = hasExplicitGeo ? `/${geo.country}/${geo.lang}` : '/india/en'; // Default to india/en for direct API calls

        // 1. Search specialties (skip if filtering by specific type that's not specialty)
        if (!typeFilter || typeFilter === 'specialty') {
            const matchedSpecialties = SPECIALTIES.filter(s =>
                s.toLowerCase().includes(lowerQ)
            ).slice(0, 3);

            matchedSpecialties.forEach(spec => {
                results.push({
                    type: 'specialty',
                    slug: spec.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    name: spec,
                    subtitle: `Browse ${spec} conditions & treatments`,
                    url: `/conditions?specialty=${encodeURIComponent(spec)}`,
                    icon: SPECIALTY_ICON_MAP[spec] || 'medical',
                });
            });
        }

        // 2. Search conditions by name (from DB) - skip if filtering for treatments only
        // Prioritize exact matches and shorter (canonical) names over longer ICD subtypes
        // Also search by scientific name and ICD code
        let conditionsByName: Array<{
            slug: string;
            commonName: string;
            specialistType: string | null;
            bodySystem: string | null;
        }> = [];

        if (!typeFilter || typeFilter === 'condition') {
            // First try exact match on commonName or scientificName
            const exactMatch = await prisma.medicalCondition.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { commonName: { equals: q, mode: 'insensitive' } },
                        { scientificName: { equals: q, mode: 'insensitive' } },
                        { icdCode: { equals: q, mode: 'insensitive' } },
                    ]
                },
                select: {
                    slug: true,
                    commonName: true,
                    specialistType: true,
                    bodySystem: true,
                },
                take: 1,
            });

            // Then search for starts-with matches (prioritize canonical names)
            const startsWithMatches = await prisma.medicalCondition.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { commonName: { startsWith: q, mode: 'insensitive' } },
                        { scientificName: { startsWith: q, mode: 'insensitive' } },
                        { icdCode: { startsWith: q, mode: 'insensitive' } },
                    ],
                    NOT: exactMatch.length > 0 ? { slug: exactMatch[0].slug } : undefined,
                },
                select: {
                    slug: true,
                    commonName: true,
                    specialistType: true,
                    bodySystem: true,
                },
                take: 3,
            });

            // Finally, contains matches for broader search
            const containsMatches = await prisma.medicalCondition.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { commonName: { contains: q, mode: 'insensitive' } },
                        { scientificName: { contains: q, mode: 'insensitive' } },
                        { bodySystem: { contains: q, mode: 'insensitive' } },
                    ],
                    NOT: {
                        slug: { in: [...exactMatch, ...startsWithMatches].map(c => c.slug) }
                    },
                },
                select: {
                    slug: true,
                    commonName: true,
                    specialistType: true,
                    bodySystem: true,
                },
                take: 4,
            });

            // Combine and sort by name length (shorter = more canonical)
            conditionsByName = [...exactMatch, ...startsWithMatches, ...containsMatches]
                .sort((a, b) => a.commonName.length - b.commonName.length)
                .slice(0, 5);
        }

        // 3. Search conditions by symptoms (JSON array search) - skip if filtering for treatments only
        let conditionsBySymptom: Array<{
            slug: string;
            common_name: string;
            specialist_type: string | null;
            body_system: string | null;
            matched_symptom: string | null;
        }> = [];

        if (!typeFilter || typeFilter === 'condition' || typeFilter === 'symptom') {
            const symptomSearchPattern = `%${q}%`;
            conditionsBySymptom = await prisma.$queryRaw<Array<{
                slug: string;
                common_name: string;
                specialist_type: string | null;
                body_system: string | null;
                matched_symptom: string | null;
            }>>`
                SELECT DISTINCT ON (mc.slug)
                    mc.slug,
                    mc.common_name,
                    mc.specialist_type,
                    mc.body_system,
                    symptom.value::text as matched_symptom
                FROM medical_conditions mc,
                     jsonb_array_elements_text(mc.symptoms) AS symptom(value)
                WHERE mc.is_active = true
                  AND symptom.value ILIKE ${symptomSearchPattern}
                ORDER BY mc.slug, LENGTH(mc.common_name), symptom.value
                LIMIT 8
            `;
        }

        // Deduplicate and add conditions by name first
        const seenNames = new Set<string>();
        conditionsByName.forEach(c => {
            const key = c.commonName.toLowerCase();
            if (!seenNames.has(key)) {
                seenNames.add(key);
                results.push({
                    type: 'condition',
                    slug: c.slug,
                    name: c.commonName,
                    subtitle: normalizeSpecialty(c.specialistType) || c.bodySystem || 'Medical Condition',
                    url: `${geoPrefix}/${c.slug}`,
                });
            }
        });

        // Add symptom-matched conditions with symptom indicator
        conditionsBySymptom.forEach(c => {
            const key = c.common_name.toLowerCase();
            if (!seenNames.has(key)) {
                seenNames.add(key);
                const matchedSymptomClean = c.matched_symptom?.replace(/^"|"$/g, '') || '';
                results.push({
                    type: 'symptom',
                    slug: c.slug,
                    name: c.common_name,
                    subtitle: `Symptom: ${matchedSymptomClean}`,
                    url: `${geoPrefix}/${c.slug}`,
                    matchedSymptom: matchedSymptomClean,
                });
            }
        });

        // 4. Search treatments (from JSON) - skip if filtering for conditions only
        // Search by name, simpleName, brandNames, and searchTags
        if (!typeFilter || typeFilter === 'treatment') {
            const treatments = getTreatments();
            const maxResults = typeFilter === 'treatment' ? 10 : 5;

            // Score treatments by match quality
            const scoredTreatments = treatments
                .map(t => {
                    let score = 0;
                    const lowerName = t.name.toLowerCase();
                    const lowerSimple = t.simpleName?.toLowerCase() || '';

                    // Exact name match (highest priority)
                    if (lowerName === lowerQ) score += 100;
                    else if (lowerSimple === lowerQ) score += 95;
                    // Name starts with query
                    else if (lowerName.startsWith(lowerQ)) score += 80;
                    else if (lowerSimple.startsWith(lowerQ)) score += 75;
                    // Name contains query
                    else if (lowerName.includes(lowerQ)) score += 60;
                    else if (lowerSimple.includes(lowerQ)) score += 55;
                    // Brand name match
                    else if (t.brandNames?.some(b => b.toLowerCase().includes(lowerQ))) score += 50;
                    // Search tag match
                    else if (t.searchTags?.some(tag => tag.includes(lowerQ))) score += 40;
                    // Partial tag match (for multi-word queries)
                    else if (t.searchTags?.some(tag => lowerQ.split(' ').some(word => word.length > 2 && tag.includes(word)))) score += 20;

                    return { treatment: t, score };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, maxResults);

            const seenTreatments = new Set<string>();
            scoredTreatments.forEach(({ treatment: t }) => {
                const key = t.name.toLowerCase();
                if (!seenTreatments.has(key)) {
                    seenTreatments.add(key);
                    const treatmentSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    // Use simple name as display name if available
                    const displayName = t.simpleName || t.name;
                    results.push({
                        type: 'treatment',
                        slug: treatmentSlug,
                        name: displayName,
                        subtitle: `${normalizeSpecialty(t.specialty)} • ${t.type}`,
                        url: `/treatments/${treatmentSlug}`,
                    });
                }
            });
        }

        // 5. Search diagnostic tests (from DB) - skip if filtering for other types
        // Search by name, shortName, aliases, and keywords array
        if (!typeFilter || typeFilter === 'test') {
            const matchedTests = await prisma.diagnosticTest.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { shortName: { contains: q, mode: 'insensitive' } },
                        { aliases: { hasSome: [q, q.toLowerCase(), q.toUpperCase()] } },
                        { keywords: { hasSome: [q.toLowerCase()] } },
                    ],
                },
                select: {
                    slug: true,
                    name: true,
                    shortName: true,
                    category: { select: { name: true } },
                    avgPriceInr: true,
                    bodySystem: true,
                },
                take: typeFilter === 'test' ? 10 : 4,
                orderBy: { searchVolume: 'desc' },
            });

            matchedTests.forEach(test => {
                results.push({
                    type: 'test',
                    slug: test.slug,
                    name: test.shortName || test.name,
                    subtitle: test.category?.name || test.bodySystem || 'Diagnostic Test',
                    url: `/tests/${test.slug}`,
                    icon: 'test',
                });
            });
        }

        // 6. Match tools/pages - skip if filtering by specific type
        if (!typeFilter || typeFilter === 'tool') {
            const matchedTools = TOOLS.filter(t =>
                t.name.toLowerCase().includes(lowerQ) ||
                t.subtitle.toLowerCase().includes(lowerQ)
            ).slice(0, 2);
            results.push(...matchedTools);
        }

        // 7. If few results, add AI fallback suggestion (skip if filtering by specific type)
        if (!typeFilter && results.length < 3 && q.length >= 3) {
            // Sanitize user input to prevent XSS when displayed
            const sanitizedQuery = sanitizeInput(q);
            results.push({
                type: 'tool',
                slug: 'ai-ask',
                name: `Ask AI: "${sanitizedQuery}"`,
                subtitle: 'Get an AI-powered answer to your medical question',
                url: `/reference/drugs?q=${encodeURIComponent(q)}`,
                icon: 'ai',
            });
        }

        return NextResponse.json(results.slice(0, limit));
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
