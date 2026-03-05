/**
 * Seed Global Languages into the Language table.
 *
 * Usage:
 *   npx tsx scripts/seed-languages.ts
 *
 * Seeds all languages needed for global medical tourism markets:
 * - English (global)
 * - Spanish (USA, Mexico, Spain, Latin America)
 * - Arabic (UAE, Middle East)
 * - Thai (Thailand)
 * - Turkish (Turkey)
 * - French (France, Canada, West Africa)
 * - German (Germany, Austria, Switzerland)
 * - Portuguese (Portugal, Brazil)
 * - Chinese (China, Singapore, Taiwan)
 * - Japanese (Japan)
 * - Korean (Korea)
 * - Russian (Russia, Eastern Europe)
 * - Plus Indian languages for India market
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface LanguageData {
    code: string;
    name: string;
    nativeName: string;
    regions: string[]; // ISO country codes where this language is spoken
}

const LANGUAGES: LanguageData[] = [
    // ═══════════════════════════════════════════════════════════
    // GLOBAL LANGUAGES
    // ═══════════════════════════════════════════════════════════
    { code: 'en', name: 'English', nativeName: 'English', regions: ['US', 'GB', 'AU', 'CA', 'IN', 'SG', 'AE', 'TH', 'MX', 'TR', 'PH'] },
    { code: 'es', name: 'Spanish', nativeName: 'Español', regions: ['ES', 'MX', 'US', 'AR', 'CO', 'PE', 'CL', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY'] },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', regions: ['AE', 'SA', 'EG', 'JO', 'LB', 'KW', 'QA', 'BH', 'OM', 'IQ', 'MA', 'DZ', 'TN', 'LY', 'SD', 'SY', 'YE'] },
    { code: 'zh', name: 'Chinese', nativeName: '中文', regions: ['CN', 'TW', 'SG', 'HK', 'MO', 'MY'] },
    { code: 'fr', name: 'French', nativeName: 'Français', regions: ['FR', 'CA', 'BE', 'CH', 'LU', 'MC', 'SN', 'CI', 'ML', 'NE', 'BF', 'TG', 'BJ', 'CD', 'MG', 'CM', 'HT', 'RW', 'GA'] },
    { code: 'de', name: 'German', nativeName: 'Deutsch', regions: ['DE', 'AT', 'CH', 'LI', 'LU', 'BE'] },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', regions: ['PT', 'BR', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL'] },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', regions: ['RU', 'BY', 'KZ', 'KG', 'UA', 'UZ', 'TJ', 'MD'] },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', regions: ['JP'] },
    { code: 'ko', name: 'Korean', nativeName: '한국어', regions: ['KR', 'KP'] },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', regions: ['IT', 'CH', 'SM', 'VA'] },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', regions: ['NL', 'BE', 'SR'] },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', regions: ['PL'] },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', regions: ['VN'] },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', regions: ['ID'] },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', regions: ['MY', 'SG', 'BN'] },
    { code: 'tl', name: 'Filipino', nativeName: 'Filipino', regions: ['PH'] },

    // ═══════════════════════════════════════════════════════════
    // MEDICAL TOURISM HUB LANGUAGES
    // ═══════════════════════════════════════════════════════════
    { code: 'th', name: 'Thai', nativeName: 'ไทย', regions: ['TH'] },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', regions: ['TR', 'CY'] },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', regions: ['IL'] },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', regions: ['IR', 'AF', 'TJ'] },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', regions: ['GR', 'CY'] },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', regions: ['HU'] },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština', regions: ['CZ'] },
    { code: 'ro', name: 'Romanian', nativeName: 'Română', regions: ['RO', 'MD'] },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', regions: ['UA'] },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', regions: ['SE', 'FI'] },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', regions: ['DK'] },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', regions: ['NO'] },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', regions: ['FI'] },

    // ═══════════════════════════════════════════════════════════
    // INDIAN LANGUAGES
    // ═══════════════════════════════════════════════════════════
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', regions: ['IN', 'NP', 'FJ', 'MU'] },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', regions: ['IN', 'LK', 'SG', 'MY'] },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', regions: ['IN'] },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', regions: ['IN'] },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', regions: ['IN', 'BD'] },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', regions: ['IN'] },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', regions: ['IN'] },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', regions: ['IN'] },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', regions: ['IN', 'PK'] },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', regions: ['PK', 'IN'] },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', regions: ['IN'] },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', regions: ['IN'] },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', regions: ['NP', 'IN'] },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', regions: ['LK'] },
];

// Map ISO country codes to languages spoken there (for geographies)
export const COUNTRY_LANGUAGES: Record<string, string[]> = {
    // Americas
    US: ['en', 'es'],
    CA: ['en', 'fr'],
    MX: ['es', 'en'],
    BR: ['pt', 'en'],
    AR: ['es', 'en'],
    CO: ['es', 'en'],
    PE: ['es', 'en'],
    CL: ['es', 'en'],

    // Europe
    GB: ['en'],
    DE: ['de', 'en'],
    FR: ['fr', 'en'],
    IT: ['it', 'en'],
    ES: ['es', 'en'],
    NL: ['nl', 'en'],
    BE: ['nl', 'fr', 'de', 'en'],
    CH: ['de', 'fr', 'it', 'en'],
    AT: ['de', 'en'],
    PL: ['pl', 'en'],
    PT: ['pt', 'en'],
    GR: ['el', 'en'],
    TR: ['tr', 'en'],
    SE: ['sv', 'en'],
    NO: ['no', 'en'],
    DK: ['da', 'en'],
    FI: ['fi', 'sv', 'en'],
    RU: ['ru', 'en'],
    UA: ['uk', 'ru', 'en'],
    CZ: ['cs', 'en'],
    HU: ['hu', 'en'],
    RO: ['ro', 'en'],

    // Middle East
    AE: ['ar', 'en'],
    SA: ['ar', 'en'],
    IL: ['he', 'ar', 'en'],
    QA: ['ar', 'en'],
    KW: ['ar', 'en'],
    BH: ['ar', 'en'],
    OM: ['ar', 'en'],
    JO: ['ar', 'en'],
    LB: ['ar', 'fr', 'en'],
    EG: ['ar', 'en'],
    IR: ['fa', 'en'],

    // Asia Pacific
    IN: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa'],
    TH: ['th', 'en'],
    SG: ['en', 'zh', 'ms', 'ta'],
    MY: ['ms', 'en', 'zh', 'ta'],
    ID: ['id', 'en'],
    PH: ['tl', 'en'],
    VN: ['vi', 'en'],
    JP: ['ja', 'en'],
    KR: ['ko', 'en'],
    CN: ['zh', 'en'],
    TW: ['zh', 'en'],
    HK: ['zh', 'en'],
    AU: ['en'],
    NZ: ['en'],
    PK: ['ur', 'en', 'pa'],
    BD: ['bn', 'en'],
    LK: ['si', 'ta', 'en'],
    NP: ['ne', 'en', 'hi'],
};

async function main() {
    console.log('[INFO] Seeding global languages...\n');

    let created = 0;
    let updated = 0;
    let existing = 0;

    for (const lang of LANGUAGES) {
        const exists = await prisma.language.findUnique({ where: { code: lang.code } });
        if (exists) {
            // Update if nativeName is missing or different
            if (exists.nativeName !== lang.nativeName) {
                await prisma.language.update({
                    where: { code: lang.code },
                    data: { nativeName: lang.nativeName, isActive: true },
                });
                console.log(`  [*] Updated ${lang.code} (${lang.name}): nativeName -> "${lang.nativeName}"`);
                updated++;
            } else {
                console.log(`  [.] ${lang.code} (${lang.name}) already exists`);
                existing++;
            }
        } else {
            await prisma.language.create({
                data: {
                    code: lang.code,
                    name: lang.name,
                    nativeName: lang.nativeName,
                    isActive: true,
                },
            });
            console.log(`  [+] Created ${lang.code} (${lang.name} / ${lang.nativeName})`);
            created++;
        }
    }

    console.log(`\n[OK] Languages: ${created} created, ${updated} updated, ${existing} unchanged.`);
    console.log(`     Total languages in database: ${await prisma.language.count()}`);
    await prisma.$disconnect();
    await pool.end();
}

main().catch((err) => {
    console.error('[ERROR] Seed failed:', err);
    process.exit(1);
});
