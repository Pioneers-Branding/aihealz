/**
 * Structured Data (JSON-LD) for SEO, AI, Voice, and Rich Search
 *
 * These schemas help search engines, AI assistants (Siri, Alexa, Google Assistant),
 * and LLMs understand our content for featured snippets, voice answers, and AI summaries.
 */

import Script from 'next/script';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION SCHEMA - Site-wide identity
// ═══════════════════════════════════════════════════════════════════════════

export interface OrganizationData {
    name: string;
    url: string;
    logo: string;
    description: string;
    sameAs?: string[]; // Social profiles
    contactPoint?: {
        telephone: string;
        contactType: string;
        availableLanguage?: string[];
    };
}

export function OrganizationSchema({ data }: { data: OrganizationData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${data.url}/#organization`,
        name: data.name,
        url: data.url,
        logo: {
            '@type': 'ImageObject',
            url: data.logo,
            width: 512,
            height: 512,
        },
        description: data.description,
        sameAs: data.sameAs || [],
        ...(data.contactPoint && {
            contactPoint: {
                '@type': 'ContactPoint',
                ...data.contactPoint,
            },
        }),
    };

    return (
        <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBSITE SCHEMA - Enables voice/AI search via SearchAction
// ═══════════════════════════════════════════════════════════════════════════

export interface WebSiteData {
    name: string;
    url: string;
    description: string;
    searchUrl: string; // URL template with {search_term_string}
    potentialActions?: string[];
}

export function WebSiteSchema({ data }: { data: WebSiteData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${data.url}/#website`,
        name: data.name,
        url: data.url,
        description: data.description,
        publisher: { '@id': `${data.url}/#organization` },
        potentialAction: [
            {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: data.searchUrl,
                },
                'query-input': 'required name=search_term_string',
            },
        ],
        inLanguage: ['en', 'hi', 'ta', 'te', 'kn', 'mr', 'bn', 'gu', 'ml', 'pa'],
    };

    return (
        <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICAL WEB PAGE - For condition/treatment pages
// ═══════════════════════════════════════════════════════════════════════════

export interface MedicalWebPageData {
    url: string;
    name: string;
    description: string;
    datePublished: string;
    dateModified: string;
    author?: {
        name: string;
        url?: string;
        credentials?: string;
    };
    reviewedBy?: {
        name: string;
        credentials: string;
        url?: string;
    };
    medicalAudience?: 'Patient' | 'Clinician' | 'MedicalResearcher';
    specialty?: string;
    lastReviewed?: string;
}

export function MedicalWebPageSchema({ data }: { data: MedicalWebPageData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        '@id': data.url,
        url: data.url,
        name: data.name,
        description: data.description,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        ...(data.author && {
            author: {
                '@type': 'Person',
                name: data.author.name,
                ...(data.author.url && { url: data.author.url }),
                ...(data.author.credentials && {
                    hasCredential: {
                        '@type': 'EducationalOccupationalCredential',
                        credentialCategory: data.author.credentials,
                    }
                }),
            },
        }),
        ...(data.reviewedBy && {
            reviewedBy: {
                '@type': 'Person',
                name: data.reviewedBy.name,
                ...(data.reviewedBy.url && { url: data.reviewedBy.url }),
                hasCredential: {
                    '@type': 'EducationalOccupationalCredential',
                    credentialCategory: data.reviewedBy.credentials,
                },
            },
        }),
        ...(data.lastReviewed && { lastReviewed: data.lastReviewed }),
        ...(data.medicalAudience && {
            audience: {
                '@type': 'MedicalAudience',
                audienceType: data.medicalAudience,
            },
        }),
        ...(data.specialty && {
            specialty: {
                '@type': 'MedicalSpecialty',
                name: data.specialty,
            },
        }),
        isAccessibleForFree: true,
        publisher: { '@id': 'https://aihealz.com/#organization' },
    };

    return (
        <Script
            id="medical-webpage-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICAL CONDITION SCHEMA - Rich snippets for conditions
// ═══════════════════════════════════════════════════════════════════════════

export interface MedicalConditionData {
    name: string;
    alternateName?: string;
    description: string;
    url: string;
    code?: { system: string; code: string }; // ICD-10
    symptoms?: string[];
    possibleTreatment?: string[];
    riskFactor?: string[];
    signOrSymptom?: { name: string; description?: string }[];
    associatedAnatomy?: string;
    relevantSpecialty?: string;
    stage?: string;
    status?: string;
    epidemiology?: string;
}

export function MedicalConditionSchema({ data }: { data: MedicalConditionData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalCondition',
        name: data.name,
        ...(data.alternateName && { alternateName: data.alternateName }),
        description: data.description,
        url: data.url,
        ...(data.code && {
            code: {
                '@type': 'MedicalCode',
                codeValue: data.code.code,
                codingSystem: data.code.system,
            },
        }),
        ...(data.symptoms && data.symptoms.length > 0 && {
            signOrSymptom: data.symptoms.map(s => ({
                '@type': 'MedicalSignOrSymptom',
                name: s,
            })),
        }),
        ...(data.possibleTreatment && data.possibleTreatment.length > 0 && {
            possibleTreatment: data.possibleTreatment.map(t => ({
                '@type': 'MedicalTherapy',
                name: t,
            })),
        }),
        ...(data.riskFactor && data.riskFactor.length > 0 && {
            riskFactor: data.riskFactor.map(r => ({
                '@type': 'MedicalRiskFactor',
                name: r,
            })),
        }),
        ...(data.associatedAnatomy && {
            associatedAnatomy: {
                '@type': 'AnatomicalStructure',
                name: data.associatedAnatomy,
            },
        }),
        ...(data.relevantSpecialty && {
            relevantSpecialty: {
                '@type': 'MedicalSpecialty',
                name: data.relevantSpecialty,
            },
        }),
        ...(data.epidemiology && { epidemiology: data.epidemiology }),
    };

    return (
        <Script
            id="medical-condition-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICIAN SCHEMA - For doctor profiles
// ═══════════════════════════════════════════════════════════════════════════

export interface PhysicianData {
    name: string;
    url: string;
    image?: string;
    description?: string;
    medicalSpecialty: string[];
    address?: {
        streetAddress?: string;
        addressLocality: string;
        addressRegion?: string;
        addressCountry: string;
        postalCode?: string;
    };
    telephone?: string;
    email?: string;
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    priceRange?: string;
    availableService?: string[];
    hospitalAffiliation?: string[];
    alumniOf?: string[];
    memberOf?: string[];
    award?: string[];
    knowsLanguage?: string[];
}

export function PhysicianSchema({ data }: { data: PhysicianData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name: data.name,
        url: data.url,
        ...(data.image && { image: data.image }),
        ...(data.description && { description: data.description }),
        medicalSpecialty: data.medicalSpecialty.map(s => ({
            '@type': 'MedicalSpecialty',
            name: s,
        })),
        ...(data.address && {
            address: {
                '@type': 'PostalAddress',
                ...data.address,
            },
        }),
        ...(data.telephone && { telephone: data.telephone }),
        ...(data.email && { email: data.email }),
        ...(data.aggregateRating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: data.aggregateRating.ratingValue,
                reviewCount: data.aggregateRating.reviewCount,
                bestRating: 5,
                worstRating: 1,
            },
        }),
        ...(data.priceRange && { priceRange: data.priceRange }),
        ...(data.availableService && {
            availableService: data.availableService.map(s => ({
                '@type': 'MedicalProcedure',
                name: s,
            })),
        }),
        ...(data.hospitalAffiliation && {
            hospitalAffiliation: data.hospitalAffiliation.map(h => ({
                '@type': 'Hospital',
                name: h,
            })),
        }),
        ...(data.alumniOf && {
            alumniOf: data.alumniOf.map(a => ({
                '@type': 'EducationalOrganization',
                name: a,
            })),
        }),
        ...(data.memberOf && {
            memberOf: data.memberOf.map(m => ({
                '@type': 'MedicalOrganization',
                name: m,
            })),
        }),
        ...(data.award && { award: data.award }),
        ...(data.knowsLanguage && { knowsLanguage: data.knowsLanguage }),
    };

    return (
        <Script
            id="physician-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// FAQ SCHEMA - For featured snippets and voice answers
// ═══════════════════════════════════════════════════════════════════════════

export interface FAQData {
    questions: { question: string; answer: string }[];
}

export function FAQSchema({ data }: { data: FAQData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions.map(q => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer,
            },
        })),
    };

    return (
        <Script
            id="faq-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMB SCHEMA - Navigation path for search results
// ═══════════════════════════════════════════════════════════════════════════

export interface BreadcrumbData {
    items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ data }: { data: BreadcrumbData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <Script
            id="breadcrumb-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOWTO SCHEMA - For treatment/procedure guides
// ═══════════════════════════════════════════════════════════════════════════

export interface HowToData {
    name: string;
    description: string;
    image?: string;
    totalTime?: string; // ISO 8601 duration
    estimatedCost?: { currency: string; value: string };
    supply?: string[];
    tool?: string[];
    steps: { name: string; text: string; image?: string; url?: string }[];
}

export function HowToSchema({ data }: { data: HowToData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: data.name,
        description: data.description,
        ...(data.image && { image: data.image }),
        ...(data.totalTime && { totalTime: data.totalTime }),
        ...(data.estimatedCost && {
            estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: data.estimatedCost.currency,
                value: data.estimatedCost.value,
            },
        }),
        ...(data.supply && {
            supply: data.supply.map(s => ({
                '@type': 'HowToSupply',
                name: s,
            })),
        }),
        ...(data.tool && {
            tool: data.tool.map(t => ({
                '@type': 'HowToTool',
                name: t,
            })),
        }),
        step: data.steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.image && { image: step.image }),
            ...(step.url && { url: step.url }),
        })),
    };

    return (
        <Script
            id="howto-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIDEO SCHEMA - For video content (future telemedicine, educational)
// ═══════════════════════════════════════════════════════════════════════════

export interface VideoData {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration?: string; // ISO 8601
    contentUrl?: string;
    embedUrl?: string;
    interactionStatistic?: {
        watchCount?: number;
        likeCount?: number;
    };
    expires?: string;
    hasPart?: { name: string; startOffset: number; endOffset: number; url?: string }[];
}

export function VideoSchema({ data }: { data: VideoData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: data.name,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        uploadDate: data.uploadDate,
        ...(data.duration && { duration: data.duration }),
        ...(data.contentUrl && { contentUrl: data.contentUrl }),
        ...(data.embedUrl && { embedUrl: data.embedUrl }),
        ...(data.expires && { expires: data.expires }),
        ...(data.interactionStatistic && {
            interactionStatistic: [
                ...(data.interactionStatistic.watchCount ? [{
                    '@type': 'InteractionCounter',
                    interactionType: { '@type': 'WatchAction' },
                    userInteractionCount: data.interactionStatistic.watchCount,
                }] : []),
                ...(data.interactionStatistic.likeCount ? [{
                    '@type': 'InteractionCounter',
                    interactionType: { '@type': 'LikeAction' },
                    userInteractionCount: data.interactionStatistic.likeCount,
                }] : []),
            ],
        }),
        ...(data.hasPart && {
            hasPart: data.hasPart.map(part => ({
                '@type': 'Clip',
                name: part.name,
                startOffset: part.startOffset,
                endOffset: part.endOffset,
                ...(part.url && { url: part.url }),
            })),
        }),
    };

    return (
        <Script
            id="video-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE SCHEMA - For medical images, diagrams
// ═══════════════════════════════════════════════════════════════════════════

export interface ImageData {
    url: string;
    caption: string;
    contentUrl: string;
    creditText?: string;
    creator?: string;
    copyrightNotice?: string;
    license?: string;
    acquireLicensePage?: string;
}

export function ImageSchema({ data }: { data: ImageData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        url: data.url,
        caption: data.caption,
        contentUrl: data.contentUrl,
        ...(data.creditText && { creditText: data.creditText }),
        ...(data.creator && {
            creator: {
                '@type': 'Organization',
                name: data.creator,
            },
        }),
        ...(data.copyrightNotice && { copyrightNotice: data.copyrightNotice }),
        ...(data.license && { license: data.license }),
        ...(data.acquireLicensePage && { acquireLicensePage: data.acquireLicensePage }),
    };

    return (
        <Script
            id="image-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPEAKABLE SCHEMA - For voice assistant answers
// ═══════════════════════════════════════════════════════════════════════════

export interface SpeakableData {
    url: string;
    cssSelector?: string[];
    xpath?: string[];
}

export function SpeakableSchema({ data }: { data: SpeakableData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: data.url,
        speakable: {
            '@type': 'SpeakableSpecification',
            ...(data.cssSelector && { cssSelector: data.cssSelector }),
            ...(data.xpath && { xpath: data.xpath }),
        },
    };

    return (
        <Script
            id="speakable-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTICLE SCHEMA - For blog posts, medical articles
// ═══════════════════════════════════════════════════════════════════════════

export interface ArticleData {
    headline: string;
    description: string;
    url: string;
    image: string;
    datePublished: string;
    dateModified: string;
    author: { name: string; url?: string };
    publisher?: { name: string; logo: string };
    articleSection?: string;
    keywords?: string[];
    wordCount?: number;
    speakable?: string[];
}

export function ArticleSchema({ data }: { data: ArticleData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.headline,
        description: data.description,
        url: data.url,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        author: {
            '@type': 'Person',
            name: data.author.name,
            ...(data.author.url && { url: data.author.url }),
        },
        publisher: data.publisher ? {
            '@type': 'Organization',
            name: data.publisher.name,
            logo: {
                '@type': 'ImageObject',
                url: data.publisher.logo,
            },
        } : { '@id': 'https://aihealz.com/#organization' },
        ...(data.articleSection && { articleSection: data.articleSection }),
        ...(data.keywords && { keywords: data.keywords.join(', ') }),
        ...(data.wordCount && { wordCount: data.wordCount }),
        ...(data.speakable && {
            speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: data.speakable,
            },
        }),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url,
        },
    };

    return (
        <Script
            id="article-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL BUSINESS SCHEMA - For clinic/hospital listings
// ═══════════════════════════════════════════════════════════════════════════

export interface LocalBusinessData {
    name: string;
    url: string;
    image?: string;
    description?: string;
    address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion?: string;
        addressCountry: string;
        postalCode?: string;
    };
    geo?: { latitude: number; longitude: number };
    telephone?: string;
    email?: string;
    openingHours?: string[];
    priceRange?: string;
    aggregateRating?: { ratingValue: number; reviewCount: number };
    medicalSpecialty?: string[];
}

export function LocalBusinessSchema({ data }: { data: LocalBusinessData }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'MedicalClinic',
        name: data.name,
        url: data.url,
        ...(data.image && { image: data.image }),
        ...(data.description && { description: data.description }),
        address: {
            '@type': 'PostalAddress',
            ...data.address,
        },
        ...(data.geo && {
            geo: {
                '@type': 'GeoCoordinates',
                latitude: data.geo.latitude,
                longitude: data.geo.longitude,
            },
        }),
        ...(data.telephone && { telephone: data.telephone }),
        ...(data.email && { email: data.email }),
        ...(data.openingHours && { openingHours: data.openingHours }),
        ...(data.priceRange && { priceRange: data.priceRange }),
        ...(data.aggregateRating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: data.aggregateRating.ratingValue,
                reviewCount: data.aggregateRating.reviewCount,
                bestRating: 5,
                worstRating: 1,
            },
        }),
        ...(data.medicalSpecialty && {
            medicalSpecialty: data.medicalSpecialty.map(s => ({
                '@type': 'MedicalSpecialty',
                name: s,
            })),
        }),
    };

    return (
        <Script
            id="local-business-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT SITE SCHEMAS - Add to layout.tsx
// ═══════════════════════════════════════════════════════════════════════════

export function DefaultSiteSchemas() {
    return (
        <>
            <OrganizationSchema
                data={{
                    name: 'AIHealz',
                    url: 'https://aihealz.com',
                    logo: 'https://aihealz.com/logo.png',
                    description: 'AI-powered global healthcare platform providing medical condition information, doctor discovery, treatment cost estimates, and AI health assistants.',
                    sameAs: [
                        'https://twitter.com/aihealz',
                        'https://linkedin.com/company/aihealz',
                        'https://facebook.com/aihealz',
                    ],
                    contactPoint: {
                        telephone: '+1-800-AIHEALZ',
                        contactType: 'customer service',
                        availableLanguage: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi'],
                    },
                }}
            />
            <WebSiteSchema
                data={{
                    name: 'AIHealz',
                    url: 'https://aihealz.com',
                    description: 'AI-powered healthcare platform with 70,000+ medical conditions, 8,900+ treatments, and verified doctor listings.',
                    searchUrl: 'https://aihealz.com/search?q={search_term_string}',
                }}
            />
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS - Return plain JSON objects for use with script tags
// ═══════════════════════════════════════════════════════════════════════════

const SITE_URL = 'https://aihealz.com';
const SITE_NAME = 'AIHealz';

export function generateOrganizationSchema(): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
            width: 512,
            height: 512,
        },
        sameAs: [
            'https://twitter.com/aihealz',
            'https://linkedin.com/company/aihealz',
            'https://facebook.com/aihealz',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'support@aihealz.com',
            availableLanguage: ['English', 'Hindi', 'Spanish', 'Arabic'],
        },
    };
}

export function generateWebPageSchema(
    title: string,
    description: string,
    url: string,
    options?: {
        datePublished?: string;
        dateModified?: string;
        image?: string;
    }
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url,
        url,
        name: title,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        ...(options?.datePublished && { datePublished: options.datePublished }),
        ...(options?.dateModified && { dateModified: options.dateModified }),
        ...(options?.image && {
            primaryImageOfPage: {
                '@type': 'ImageObject',
                url: options.image,
            },
        }),
        inLanguage: 'en',
    };
}

export function generateAboutPageSchema(): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': `${SITE_URL}/about`,
        url: `${SITE_URL}/about`,
        name: 'About AIHealz',
        description: 'Learn about AIHealz - an AI-powered healthcare platform connecting patients with doctors, hospitals, and medical information worldwide.',
        mainEntity: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
    };
}

export function generateContactPageSchema(): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        '@id': `${SITE_URL}/contact`,
        url: `${SITE_URL}/contact`,
        name: 'Contact AIHealz',
        description: 'Get in touch with AIHealz for healthcare inquiries, partnerships, or support.',
        mainEntity: {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            contactPoint: [
                {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: 'support@aihealz.com',
                    availableLanguage: ['English', 'Hindi'],
                },
            ],
        },
    };
}

export function generateBreadcrumbSchema(
    items: { name: string; url: string }[]
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    };
}

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

export function generateItemListSchema(
    name: string,
    description: string,
    items: { name: string; url: string; position?: number }[]
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name,
        description,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: item.position || index + 1,
            name: item.name,
            url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    };
}
