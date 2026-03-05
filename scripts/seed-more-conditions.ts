import 'dotenv/config';
import prisma from '@/lib/db';

const conditions = [
    { slug: 'asthma', commonName: 'Asthma', scientificName: 'Asthma', specialistType: 'Pulmonologist', icdCode: 'J45', bodySystem: 'Lungs & Respiratory' },
    { slug: 'osteoarthritis', commonName: 'Osteoarthritis', scientificName: 'Osteoarthritis', specialistType: 'Orthopedic Surgeon', icdCode: 'M19.9', bodySystem: 'Spine & Joints' },
    { slug: 'gerd', commonName: 'Acid Reflux (GERD)', scientificName: 'Gastroesophageal reflux disease', specialistType: 'Gastroenterologist', icdCode: 'K21.9', bodySystem: 'Digestive System' },
    { slug: 'anxiety', commonName: 'Anxiety', scientificName: 'Generalized anxiety disorder', specialistType: 'Psychiatrist', icdCode: 'F41.1', bodySystem: 'Mental Health' },
    { slug: 'depression', commonName: 'Depression', scientificName: 'Major depressive disorder', specialistType: 'Psychiatrist', icdCode: 'F32.9', bodySystem: 'Mental Health' },
    { slug: 'psoriasis', commonName: 'Psoriasis', scientificName: 'Psoriasis', specialistType: 'Dermatologist', icdCode: 'L40.9', bodySystem: 'Skin & Dermatology' },
    { slug: 'rheumatoid-arthritis', commonName: 'Rheumatoid Arthritis', scientificName: 'Rheumatoid Arthritis', specialistType: 'Rheumatologist', icdCode: 'M06.9', bodySystem: 'Immune System' },
    { slug: 'hypothyroidism', commonName: 'Underactive Thyroid (Hypothyroidism)', scientificName: 'Hypothyroidism', specialistType: 'Endocrinologist', icdCode: 'E03.9', bodySystem: 'Endocrine System' },
    { slug: 'sleep-apnea', commonName: 'Sleep Apnea', scientificName: 'Sleep apnea', specialistType: 'Pulmonologist', icdCode: 'G47.30', bodySystem: 'Sleep Medicine' },
    { slug: 'acne', commonName: 'Acne', scientificName: 'Acne vulgaris', specialistType: 'Dermatologist', icdCode: 'L70.0', bodySystem: 'Skin & Dermatology' },
    { slug: 'ibs', commonName: 'Irritable Bowel Syndrome (IBS)', scientificName: 'Irritable bowel syndrome', specialistType: 'Gastroenterologist', icdCode: 'K58.9', bodySystem: 'Digestive System' },
    { slug: 'glaucoma', commonName: 'Glaucoma', scientificName: 'Glaucoma', specialistType: 'Ophthalmologist', icdCode: 'H40.9', bodySystem: 'Eyes & Ears' },
    { slug: 'cataracts', commonName: 'Cataracts', scientificName: 'Cataract', specialistType: 'Ophthalmologist', icdCode: 'H26.9', bodySystem: 'Eyes & Ears' },
    { slug: 'endometriosis', commonName: 'Endometriosis', scientificName: 'Endometriosis', specialistType: 'Gynecologist', icdCode: 'N80.9', bodySystem: 'Women\'s Health' },
    { slug: 'eczema', commonName: 'Eczema', scientificName: 'Atopic dermatitis', specialistType: 'Dermatologist', icdCode: 'L20.9', bodySystem: 'Skin & Dermatology' }
];

async function main() {
    console.log('Seeding 15 additional medical conditions...');
    let created = 0;
    for (const c of conditions) {
        try {
            await prisma.medicalCondition.upsert({
                where: { slug: c.slug },
                update: {},
                create: {
                    slug: c.slug,
                    commonName: c.commonName,
                    scientificName: c.scientificName,
                    specialistType: c.specialistType,
                    icdCode: c.icdCode,
                    bodySystem: c.bodySystem,
                    isActive: true,
                    symptoms: [],
                    treatments: [],
                    description: ''
                }
            });
            created++;
        } catch (e) {
            console.error(`Failed to add ${c.slug}`, e);
        }
    }
    console.log(`✅ Successfully added ${created} conditions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
