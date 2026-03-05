import type { GeoChain } from './geo-resolver';
import { buildGeoBreadcrumbs } from './geo-resolver';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';

// ─── Types ──────────────────────────────────────────────────

interface ConditionData {
    scientificName: string;
    commonName: string;
    description: string;
    symptoms: string[];
    treatments: string[];
    specialistType: string;
    icdCode?: string;
}

interface ReviewerData {
    name: string;
    slug: string;
    licenseNumber?: string | null;
    licensingBody?: string | null;
    qualifications?: string[];
    specialistType?: string;
    reviewDate?: string | Date;
}

interface DoctorData {
    name: string;
    slug: string;
    qualifications?: string[];
    rating?: number;
    reviewCount?: number;
    consultationFee?: number;
    feeCurrency?: string;
    contactInfo?: Record<string, string>;
    profileImage?: string;
}

// ─── MedicalWebPage Schema ──────────────────────────────────

export function generateMedicalWebPageSchema(
    condition: ConditionData,
    reviewer: ReviewerData | null,
    geoChain: GeoChain,
    lang: string,
    urlPath: string
): object {
    const deepestGeo = geoChain.locality || geoChain.city || geoChain.state || geoChain.country;
    const locationName = deepestGeo?.name || '';

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: `${condition.commonName} Treatment${locationName ? ` in ${locationName}` : ''}`,
        description: condition.description,
        url: `${SITE_URL}${urlPath}`,
        inLanguage: lang,
        medicalAudience: {
            '@type': 'MedicalAudience',
            audienceType: 'Patient',
        },
        about: {
            '@type': 'MedicalCondition',
            name: condition.commonName,
            alternateName: condition.scientificName,
            ...(condition.icdCode && { code: { '@type': 'MedicalCode', codeValue: condition.icdCode, codingSystem: 'ICD-10' } }),
            signOrSymptom: condition.symptoms.map((s: string) => ({
                '@type': 'MedicalSignOrSymptom',
                name: s,
            })),
            possibleTreatment: condition.treatments.map((t: string) => ({
                '@type': 'MedicalTherapy',
                name: t,
            })),
        },
        specialty: {
            '@type': 'MedicalSpecialty',
            name: condition.specialistType,
        },
    };

    // E-E-A-T: Inject reviewer
    if (reviewer) {
        schema.reviewedBy = {
            '@type': 'Physician',
            name: reviewer.name,
            url: `${SITE_URL}/doctor/${reviewer.slug}`,
            ...(reviewer.licenseNumber && {
                identifier: {
                    '@type': 'PropertyValue',
                    name: reviewer.licensingBody || 'Medical License',
                    value: reviewer.licenseNumber,
                },
            }),
            ...(reviewer.qualifications?.length && {
                hasCredential: reviewer.qualifications.map((q: string) => ({
                    '@type': 'EducationalOccupationalCredential',
                    credentialCategory: q,
                })),
            }),
        };
        schema.lastReviewed = reviewer.reviewDate || new Date().toISOString().split('T')[0];
    }

    return schema;
}

// ─── Physician Schema ───────────────────────────────────────

export function generatePhysicianSchema(doctor: DoctorData): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name: doctor.name,
        url: `${SITE_URL}/doctor/${doctor.slug}`,
        ...(doctor.profileImage && { image: doctor.profileImage }),
        ...(doctor.qualifications?.length && {
            hasCredential: doctor.qualifications.map((q: string) => ({
                '@type': 'EducationalOccupationalCredential',
                credentialCategory: q,
            })),
        }),
        ...(doctor.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: doctor.rating,
                reviewCount: doctor.reviewCount || 0,
                bestRating: 5,
            },
        }),
        ...(doctor.consultationFee && {
            priceRange: `${doctor.feeCurrency || 'INR'} ${doctor.consultationFee}`,
        }),
    };
}

// ─── Breadcrumb Schema ──────────────────────────────────────

export function generateBreadcrumbSchema(
    lang: string,
    conditionName: string,
    conditionSlug: string,
    geoChain: GeoChain
): object {
    const crumbs = buildGeoBreadcrumbs(geoChain);
    let position = 1;

    const items: object[] = [
        {
            '@type': 'ListItem',
            position: position++,
            name: 'Home',
            item: SITE_URL,
        },
        {
            '@type': 'ListItem',
            position: position++,
            name: conditionName,
            item: `${SITE_URL}/${lang}/${conditionSlug}`,
        },
    ];

    // Add geo breadcrumbs
    const geoPathParts: string[] = [];
    for (const crumb of crumbs) {
        geoPathParts.push(crumb.slug);
        items.push({
            '@type': 'ListItem',
            position: position++,
            name: crumb.name,
            item: `${SITE_URL}/${lang}/${conditionSlug}/${geoPathParts.join('/')}`,
        });
    }

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
    };
}

// ─── FAQ Schema (for voice assistants) ─────────────────────

export function generateFAQSchema(faqs: { question: string; answer: string }[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

// ─── Speakable Schema (voice search) ───────────────────────

export function generateSpeakableSchema(urlPath: string, speakableSelectors: string[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: `${SITE_URL}${urlPath}`,
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: speakableSelectors,
        },
    };
}

// ─── HowTo Schema (treatment guides) ───────────────────────

export function generateHowToSchema(
    name: string,
    description: string,
    steps: { name: string; text: string }[],
    estimatedCost?: { currency: string; value: number }
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        ...(estimatedCost && {
            estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: estimatedCost.currency,
                value: estimatedCost.value,
            },
        }),
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
        })),
    };
}

// ─── Medical Condition Schema (standalone) ─────────────────

export function generateMedicalConditionSchema(condition: ConditionData): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'MedicalCondition',
        name: condition.commonName,
        alternateName: condition.scientificName,
        description: condition.description,
        ...(condition.icdCode && {
            code: {
                '@type': 'MedicalCode',
                codeValue: condition.icdCode,
                codingSystem: 'ICD-10',
            },
        }),
        signOrSymptom: condition.symptoms.map(s => ({
            '@type': 'MedicalSignOrSymptom',
            name: s,
        })),
        possibleTreatment: condition.treatments.map(t => ({
            '@type': 'MedicalTherapy',
            name: t,
        })),
        relevantSpecialty: {
            '@type': 'MedicalSpecialty',
            name: condition.specialistType,
        },
    };
}

// ─── Video Schema (for educational content) ────────────────

export function generateVideoSchema(
    name: string,
    description: string,
    thumbnailUrl: string,
    uploadDate: string,
    duration?: string,
    contentUrl?: string,
    embedUrl?: string
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name,
        description,
        thumbnailUrl,
        uploadDate,
        ...(duration && { duration }),
        ...(contentUrl && { contentUrl }),
        ...(embedUrl && { embedUrl }),
    };
}

// ─── Image Schema (for medical diagrams) ───────────────────

export function generateImageSchema(
    url: string,
    caption: string,
    creditText?: string
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        url,
        caption,
        contentUrl: url,
        ...(creditText && { creditText }),
        creator: {
            '@type': 'Organization',
            name: 'AIHealz',
        },
    };
}

// ─── Article Schema (for blog/educational posts) ──────────

export function generateArticleSchema(
    headline: string,
    description: string,
    url: string,
    image: string,
    datePublished: string,
    dateModified: string,
    authorName: string,
    speakableSelectors?: string[]
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'MedicalScholarlyArticle',
        headline,
        description,
        url,
        image,
        datePublished,
        dateModified,
        author: {
            '@type': 'Person',
            name: authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: 'AIHealz',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
            },
        },
        ...(speakableSelectors && {
            speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: speakableSelectors,
            },
        }),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    };
}

// ─── Combined Page Schema ───────────────────────────────────

export function generatePageSchemas(
    condition: ConditionData,
    reviewer: ReviewerData | null,
    doctors: DoctorData[],
    geoChain: GeoChain,
    lang: string,
    urlPath: string,
    options?: {
        faqs?: { question: string; answer: string }[];
        treatmentSteps?: { name: string; text: string }[];
        estimatedCost?: { currency: string; value: number };
        featureImage?: string;
    }
): string {
    const deepestGeo = geoChain.locality || geoChain.city || geoChain.state || geoChain.country;
    const locationName = deepestGeo?.name || '';

    const schemas = [
        // Core medical web page
        generateMedicalWebPageSchema(condition, reviewer, geoChain, lang, urlPath),

        // Standalone medical condition (helps AI understand)
        generateMedicalConditionSchema(condition),

        // Breadcrumbs for navigation
        generateBreadcrumbSchema(lang, condition.commonName, condition.commonName.toLowerCase().replace(/\s+/g, '-'), geoChain),

        // Top doctors
        ...doctors.slice(0, 3).map(generatePhysicianSchema),

        // Speakable content for voice assistants
        generateSpeakableSchema(urlPath, [
            'h1',
            '.ai-opinion',
            '.condition-description',
            '.treatment-summary',
        ]),
    ];

    // Auto-generate FAQs if not provided
    const defaultFaqs = [
        {
            question: `What are the symptoms of ${condition.commonName}?`,
            answer: condition.symptoms.slice(0, 5).join(', ') || 'Common symptoms vary by patient. Consult a specialist for diagnosis.',
        },
        {
            question: `How is ${condition.commonName} treated?`,
            answer: condition.treatments.slice(0, 3).join(', ') || 'Treatment depends on severity. Options include medical management and surgical intervention.',
        },
        {
            question: `Which doctor treats ${condition.commonName}?`,
            answer: `${condition.commonName} is typically treated by a ${condition.specialistType}.`,
        },
        ...(locationName ? [{
            question: `Where can I find a ${condition.specialistType} for ${condition.commonName} in ${locationName}?`,
            answer: `AIHealz lists verified ${condition.specialistType}s in ${locationName}. Browse our directory to find specialists with patient reviews and availability.`,
        }] : []),
    ];

    schemas.push(generateFAQSchema(options?.faqs || defaultFaqs));

    // Treatment guide if available
    if (options?.treatmentSteps && options.treatmentSteps.length > 0) {
        schemas.push(generateHowToSchema(
            `How to manage ${condition.commonName}`,
            `Step-by-step guide for ${condition.commonName} treatment`,
            options.treatmentSteps,
            options.estimatedCost
        ));
    }

    // Feature image schema
    if (options?.featureImage) {
        schemas.push(generateImageSchema(
            options.featureImage,
            `Medical illustration of ${condition.commonName}`,
            'AIHealz Medical Illustrations'
        ));
    }

    return JSON.stringify(schemas);
}
