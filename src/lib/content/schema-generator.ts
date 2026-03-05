export const MEDICAL_WEBPAGE_SCHEMA = (
    page: any,
    condition: any,
    url: string,
    imageUrl: string
) => ({
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": page.h1Title,
    "description": page.metaSummary,
    "url": url,
    "primaryImageOfPage": imageUrl,
    "lastReviewed": new Date().toISOString(),
    "reviewedBy": {
        "@type": "Organization",
        "name": "aihealz Medical Review Board"
    },
    "about": {
        "@type": "MedicalCondition",
        "name": condition.commonName,
        "alternateName": condition.scientificName,
        "code": {
            "@type": "MedicalCode",
            "code": condition.icdCode,
            "codingSystem": "ICD-10"
        }
    }
});

export const FAQ_SCHEMA = (faqs: any[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
        }
    }))
});
