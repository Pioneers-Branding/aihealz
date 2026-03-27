/**
 * Section-specific images mapped by specialty and content context.
 * Returns different images for each section to create visual variety.
 */

type SectionType = 'symptoms' | 'diagnosis' | 'specialist' | 'faq' | 'hospital' | 'lifestyle' | 'complications';

interface SectionImageSet {
    symptoms: string;
    diagnosis: string;
    specialist: string;
    faq: string;
    hospital: string;
    lifestyle: string;
    complications: string;
}

const specialtyImages: Record<string, SectionImageSet> = {
    'Cardiology': {
        symptoms: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=600&fit=crop&q=80',
    },
    'Neurology': {
        symptoms: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop&q=80',
    },
    'Orthopedics': {
        symptoms: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Oncology': {
        symptoms: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Dermatology': {
        symptoms: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Gastroenterology': {
        symptoms: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Pulmonology': {
        symptoms: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Endocrinology': {
        symptoms: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Ophthalmology': {
        symptoms: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Psychiatry': {
        symptoms: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Urology': {
        symptoms: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Hematology': {
        symptoms: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Infectious Disease': {
        symptoms: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Obstetrics': {
        symptoms: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Genetics': {
        symptoms: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=600&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
    'Neonatology': {
        symptoms: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=500&fit=crop&q=80',
        diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
        specialist: 'https://images.unsplash.com/photo-1666214280557-091d56d9bec5?w=1200&h=500&fit=crop&q=80',
        faq: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop&q=80',
        hospital: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=500&fit=crop&q=80',
        lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
        complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
    },
};

// Default fallback images for sections
const defaultImages: SectionImageSet = {
    symptoms: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=500&fit=crop&q=80',
    diagnosis: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop&q=80',
    specialist: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=600&fit=crop&q=80',
    faq: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop&q=80',
    hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop&q=80',
    lifestyle: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    complications: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop&q=80',
};

function findSpecialtyImages(specialty: string): SectionImageSet {
    if (specialtyImages[specialty]) return specialtyImages[specialty];
    // Case-insensitive fallback
    const key = Object.keys(specialtyImages).find(
        k => k.toLowerCase() === specialty.toLowerCase()
    );
    return key ? specialtyImages[key] : defaultImages;
}

/**
 * Get a section-specific image for a given specialty
 */
export function getSectionImage(specialty: string, section: SectionType): string {
    return findSpecialtyImages(specialty)[section];
}

/**
 * Get all section images for a specialty at once
 */
export function getAllSectionImages(specialty: string): SectionImageSet {
    return findSpecialtyImages(specialty);
}
