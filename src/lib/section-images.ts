/**
 * Section-specific images mapped by specialty and content context.
 * Returns different images for each section to create visual variety.
 */

type SectionType = 'symptoms' | 'diagnosis' | 'specialist' | 'faq';

interface SectionImageSet {
    symptoms: string;
    diagnosis: string;
    specialist: string;
    faq: string;
}

const specialtyImages: Record<string, SectionImageSet> = {
    'Cardiology': {
        symptoms: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    },
    'Neurology': {
        symptoms: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Orthopedics': {
        symptoms: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Oncology': {
        symptoms: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    },
    'Dermatology': {
        symptoms: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Gastroenterology': {
        symptoms: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    },
    'Pulmonology': {
        symptoms: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Endocrinology': {
        symptoms: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    },
    'Ophthalmology': {
        symptoms: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Psychiatry': {
        symptoms: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Urology': {
        symptoms: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    },
    'Hematology': {
        symptoms: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Infectious Disease': {
        symptoms: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    },
    'Obstetrics': {
        symptoms: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
    'Genetics': {
        symptoms: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    },
    'Neonatology': {
        symptoms: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
    },
};

// Default fallback images for sections
const defaultImages: SectionImageSet = {
    symptoms: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
    diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
    specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
    faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
};

/**
 * Get a section-specific image for a given specialty
 */
export function getSectionImage(specialty: string, section: SectionType): string {
    const images = specialtyImages[specialty] || defaultImages;
    return images[section];
}

/**
 * Get all section images for a specialty at once
 */
export function getAllSectionImages(specialty: string): SectionImageSet {
    return specialtyImages[specialty] || defaultImages;
}
