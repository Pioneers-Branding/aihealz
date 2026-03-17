/**
 * Seed insurance providers for multiple countries
 * Includes: USA, UK, UAE, Saudi Arabia, Singapore, Australia, Canada, Germany, etc.
 */

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taps@localhost:5432/aihealz' });

interface InsuranceProvider {
    slug: string;
    name: string;
    shortName?: string;
    providerType: 'private' | 'public' | 'government';
    description: string;
    headquartersCountry: string;
    headquartersCity: string;
    website: string;
    customerCarePhone: string;
    email?: string;
    licenseNumber?: string;
    regulatoryBody?: string;
    establishedYear?: number;
    claimSettlementRatio?: number;
}

const INSURANCE_PROVIDERS: InsuranceProvider[] = [
    // USA
    { slug: 'unitedhealth-usa', name: 'UnitedHealthcare', shortName: 'UHC', providerType: 'private', description: '<p>UnitedHealthcare is the largest health insurer in the US, serving over 50 million members with comprehensive health benefit programs.</p>', headquartersCountry: 'United States', headquartersCity: 'Minnetonka, MN', website: 'https://www.uhc.com', customerCarePhone: '1-800-328-5979', establishedYear: 1977, claimSettlementRatio: 88.5 },
    { slug: 'anthem-bcbs-usa', name: 'Anthem Blue Cross Blue Shield', shortName: 'Anthem', providerType: 'private', description: '<p>Anthem serves 45 million members through Blue Cross Blue Shield plans in 14 states.</p>', headquartersCountry: 'United States', headquartersCity: 'Indianapolis, IN', website: 'https://www.anthem.com', customerCarePhone: '1-800-331-1476', establishedYear: 2004, claimSettlementRatio: 87.2 },
    { slug: 'aetna-usa', name: 'Aetna (CVS Health)', shortName: 'Aetna', providerType: 'private', description: '<p>Aetna serves 39 million people with medical, dental, pharmacy, and disability insurance.</p>', headquartersCountry: 'United States', headquartersCity: 'Hartford, CT', website: 'https://www.aetna.com', customerCarePhone: '1-800-872-3862', establishedYear: 1853, claimSettlementRatio: 89.1 },
    { slug: 'cigna-usa', name: 'Cigna Healthcare', shortName: 'Cigna', providerType: 'private', description: '<p>Cigna serves 190 million customers worldwide with health, pharmacy, and dental coverage.</p>', headquartersCountry: 'United States', headquartersCity: 'Bloomfield, CT', website: 'https://www.cigna.com', customerCarePhone: '1-800-997-1654', establishedYear: 1982, claimSettlementRatio: 90.3 },
    { slug: 'humana-usa', name: 'Humana', shortName: 'Humana', providerType: 'private', description: '<p>Humana serves 17 million members, specializing in Medicare Advantage plans.</p>', headquartersCountry: 'United States', headquartersCity: 'Louisville, KY', website: 'https://www.humana.com', customerCarePhone: '1-800-457-4708', establishedYear: 1961, claimSettlementRatio: 91.5 },
    { slug: 'kaiser-usa', name: 'Kaiser Permanente', shortName: 'Kaiser', providerType: 'private', description: '<p>Kaiser is an integrated managed care consortium serving 12.5 million members in 8 states.</p>', headquartersCountry: 'United States', headquartersCity: 'Oakland, CA', website: 'https://www.kaiserpermanente.org', customerCarePhone: '1-800-464-4000', establishedYear: 1945, claimSettlementRatio: 93.2 },
    { slug: 'medicare-usa', name: 'Medicare (US Government)', providerType: 'government', description: '<p>Federal health insurance for 65+ and disabled Americans, covering 65 million people.</p>', headquartersCountry: 'United States', headquartersCity: 'Baltimore, MD', website: 'https://www.medicare.gov', customerCarePhone: '1-800-633-4227', regulatoryBody: 'CMS', establishedYear: 1965, claimSettlementRatio: 95.0 },

    // UK
    { slug: 'nhs-uk', name: 'National Health Service (NHS)', shortName: 'NHS', providerType: 'government', description: '<p>The NHS provides free healthcare to all UK residents, funded through taxation.</p>', headquartersCountry: 'United Kingdom', headquartersCity: 'London', website: 'https://www.nhs.uk', customerCarePhone: '111', regulatoryBody: 'DHSC', establishedYear: 1948, claimSettlementRatio: 98.0 },
    { slug: 'bupa-uk', name: 'Bupa UK', shortName: 'Bupa', providerType: 'private', description: '<p>Bupa is the UKs leading private medical insurer serving 31 million customers globally.</p>', headquartersCountry: 'United Kingdom', headquartersCity: 'London', website: 'https://www.bupa.co.uk', customerCarePhone: '0345-600-8822', establishedYear: 1947, claimSettlementRatio: 92.0 },
    { slug: 'axa-health-uk', name: 'AXA Health UK', shortName: 'AXA Health', providerType: 'private', description: '<p>AXA Health provides private medical insurance with mental health and digital GP services.</p>', headquartersCountry: 'United Kingdom', headquartersCity: 'Tunbridge Wells', website: 'https://www.axahealth.co.uk', customerCarePhone: '0800-003-004', establishedYear: 1940, claimSettlementRatio: 90.5 },
    { slug: 'vitality-uk', name: 'Vitality Health UK', shortName: 'Vitality', providerType: 'private', description: '<p>Vitality rewards healthy behaviour with discounts and benefits through its Vitality Programme.</p>', headquartersCountry: 'United Kingdom', headquartersCity: 'Bournemouth', website: 'https://www.vitality.co.uk', customerCarePhone: '0800-316-8670', establishedYear: 2007, claimSettlementRatio: 89.5 },

    // UAE
    { slug: 'daman-uae', name: 'Daman Health Insurance', shortName: 'Daman', providerType: 'private', description: '<p>Daman is the leading health insurer in UAE, serving 3+ million lives in Abu Dhabi.</p>', headquartersCountry: 'United Arab Emirates', headquartersCity: 'Abu Dhabi', website: 'https://www.damanhealth.ae', customerCarePhone: '800-42626', regulatoryBody: 'DOH', establishedYear: 2005, claimSettlementRatio: 94.0 },
    { slug: 'oman-insurance-uae', name: 'Oman Insurance Company', shortName: 'OIC', providerType: 'private', description: '<p>One of the oldest insurance companies in UAE with extensive hospital networks.</p>', headquartersCountry: 'United Arab Emirates', headquartersCity: 'Dubai', website: 'https://www.tameen.ae', customerCarePhone: '800-4746', establishedYear: 1975, claimSettlementRatio: 92.0 },
    { slug: 'axa-gulf-uae', name: 'AXA Gulf', shortName: 'AXA Gulf', providerType: 'private', description: '<p>Part of AXA Group, providing comprehensive health insurance across the Gulf region.</p>', headquartersCountry: 'United Arab Emirates', headquartersCity: 'Dubai', website: 'https://www.axa-gulf.com', customerCarePhone: '800-292', establishedYear: 1950, claimSettlementRatio: 91.5 },

    // Saudi Arabia
    { slug: 'bupa-arabia-ksa', name: 'Bupa Arabia', shortName: 'Bupa Arabia', providerType: 'private', description: '<p>Largest health insurer in Saudi Arabia with 4+ million members and 1,600 partner hospitals.</p>', headquartersCountry: 'Saudi Arabia', headquartersCity: 'Jeddah', website: 'https://www.bupa.com.sa', customerCarePhone: '920001040', regulatoryBody: 'SAMA', establishedYear: 1997, claimSettlementRatio: 93.5 },
    { slug: 'medgulf-ksa', name: 'MEDGULF Insurance', shortName: 'MEDGULF', providerType: 'private', description: '<p>One of the largest insurance companies in Saudi Arabia under CCHI regulations.</p>', headquartersCountry: 'Saudi Arabia', headquartersCity: 'Riyadh', website: 'https://www.medgulf.com.sa', customerCarePhone: '920004636', establishedYear: 1980, claimSettlementRatio: 91.0 },
    { slug: 'tawuniya-ksa', name: 'Tawuniya Insurance', shortName: 'Tawuniya', providerType: 'private', description: '<p>Major cooperative insurance company providing mandatory health insurance.</p>', headquartersCountry: 'Saudi Arabia', headquartersCity: 'Riyadh', website: 'https://www.tawuniya.com', customerCarePhone: '8001249990', regulatoryBody: 'SAMA', establishedYear: 1986, claimSettlementRatio: 92.0 },

    // Singapore
    { slug: 'medishield-life-sg', name: 'MediShield Life', providerType: 'government', description: '<p>Compulsory national health insurance for all Singapore Citizens and PRs.</p>', headquartersCountry: 'Singapore', headquartersCity: 'Singapore', website: 'https://www.moh.gov.sg/medishield-life', customerCarePhone: '+65-6225-5225', regulatoryBody: 'MOH', establishedYear: 2015, claimSettlementRatio: 96.0 },
    { slug: 'great-eastern-sg', name: 'Great Eastern Life Singapore', shortName: 'Great Eastern', providerType: 'private', description: '<p>Oldest and largest life insurer in Singapore with Integrated Shield Plans.</p>', headquartersCountry: 'Singapore', headquartersCity: 'Singapore', website: 'https://www.greateasternlife.com', customerCarePhone: '+65-6248-2888', establishedYear: 1908, claimSettlementRatio: 94.0 },
    { slug: 'prudential-sg', name: 'Prudential Singapore', shortName: 'Prudential', providerType: 'private', description: '<p>Leading life insurer offering PRUShield and comprehensive health products.</p>', headquartersCountry: 'Singapore', headquartersCity: 'Singapore', website: 'https://www.prudential.com.sg', customerCarePhone: '+65-1800-333-0333', establishedYear: 1931, claimSettlementRatio: 93.5 },
    { slug: 'ntuc-income-sg', name: 'NTUC Income', shortName: 'Income', providerType: 'private', description: '<p>Largest composite insurer known for affordable and accessible health insurance.</p>', headquartersCountry: 'Singapore', headquartersCity: 'Singapore', website: 'https://www.income.com.sg', customerCarePhone: '+65-6788-1777', establishedYear: 1970, claimSettlementRatio: 92.0 },

    // Australia
    { slug: 'medicare-australia', name: 'Medicare Australia', providerType: 'government', description: '<p>Universal health insurance providing free or subsidised healthcare to all Australians.</p>', headquartersCountry: 'Australia', headquartersCity: 'Canberra', website: 'https://www.servicesaustralia.gov.au/medicare', customerCarePhone: '132-011', regulatoryBody: 'Services Australia', establishedYear: 1984, claimSettlementRatio: 97.0 },
    { slug: 'medibank-australia', name: 'Medibank Australia', shortName: 'Medibank', providerType: 'private', description: '<p>Australias largest private health insurer covering 3.7 million people.</p>', headquartersCountry: 'Australia', headquartersCity: 'Melbourne', website: 'https://www.medibank.com.au', customerCarePhone: '132-331', establishedYear: 1976, claimSettlementRatio: 91.0 },
    { slug: 'bupa-australia', name: 'Bupa Australia', shortName: 'Bupa', providerType: 'private', description: '<p>Second largest private health insurer in Australia with 4 million customers.</p>', headquartersCountry: 'Australia', headquartersCity: 'Melbourne', website: 'https://www.bupa.com.au', customerCarePhone: '134-135', establishedYear: 1947, claimSettlementRatio: 90.5 },
    { slug: 'hcf-australia', name: 'HCF Australia', shortName: 'HCF', providerType: 'private', description: '<p>Largest not-for-profit health fund in Australia covering 1.8 million people.</p>', headquartersCountry: 'Australia', headquartersCity: 'Sydney', website: 'https://www.hcf.com.au', customerCarePhone: '131-334', establishedYear: 1932, claimSettlementRatio: 92.5 },

    // Canada
    { slug: 'provincial-health-canada', name: 'Provincial Health Insurance (OHIP/MSP)', providerType: 'government', description: '<p>Publicly funded universal healthcare through provincial plans like OHIP, MSP, RAMQ.</p>', headquartersCountry: 'Canada', headquartersCity: 'Ottawa', website: 'https://www.canada.ca/en/health-canada', customerCarePhone: 'Varies by province', regulatoryBody: 'Health Canada', establishedYear: 1966, claimSettlementRatio: 98.0 },
    { slug: 'sunlife-canada', name: 'Sun Life Financial Canada', shortName: 'Sun Life', providerType: 'private', description: '<p>One of the largest life and health insurers providing supplemental coverage.</p>', headquartersCountry: 'Canada', headquartersCity: 'Toronto', website: 'https://www.sunlife.ca', customerCarePhone: '1-877-786-5433', establishedYear: 1865, claimSettlementRatio: 93.0 },
    { slug: 'manulife-canada', name: 'Manulife Canada', shortName: 'Manulife', providerType: 'private', description: '<p>Major insurer providing group and individual health benefits including drug and dental.</p>', headquartersCountry: 'Canada', headquartersCity: 'Toronto', website: 'https://www.manulife.ca', customerCarePhone: '1-800-268-6195', establishedYear: 1887, claimSettlementRatio: 92.5 },

    // Germany
    { slug: 'tk-germany', name: 'Techniker Krankenkasse (TK)', shortName: 'TK', providerType: 'public', description: '<p>Largest statutory health insurance fund in Germany with 11+ million members.</p>', headquartersCountry: 'Germany', headquartersCity: 'Hamburg', website: 'https://www.tk.de', customerCarePhone: '+49-800-285-8585', regulatoryBody: 'BMG', establishedYear: 1884, claimSettlementRatio: 97.0 },
    { slug: 'aok-germany', name: 'AOK - Allgemeine Ortskrankenkasse', shortName: 'AOK', providerType: 'public', description: '<p>Federation of regional statutory health insurance funds covering 27 million people.</p>', headquartersCountry: 'Germany', headquartersCity: 'Berlin', website: 'https://www.aok.de', customerCarePhone: '+49-800-265-0800', establishedYear: 1884, claimSettlementRatio: 96.5 },
    { slug: 'allianz-pkv-germany', name: 'Allianz Private Health Insurance', shortName: 'Allianz PKV', providerType: 'private', description: '<p>Leading private health insurer for those opting out of statutory system.</p>', headquartersCountry: 'Germany', headquartersCity: 'Munich', website: 'https://www.allianz.de', customerCarePhone: '+49-800-444-1020', establishedYear: 1890, claimSettlementRatio: 94.0 },

    // Japan
    { slug: 'nhi-japan', name: 'National Health Insurance (Kokumin Kenko Hoken)', providerType: 'government', description: '<p>Universal health insurance covering all residents with 70% reimbursement.</p>', headquartersCountry: 'Japan', headquartersCity: 'Tokyo', website: 'https://www.mhlw.go.jp', customerCarePhone: 'Local municipal office', regulatoryBody: 'MHLW', establishedYear: 1961, claimSettlementRatio: 99.0 },
    { slug: 'nippon-life-japan', name: 'Nippon Life Insurance', shortName: 'Nippon Life', providerType: 'private', description: '<p>Largest life insurance company in Japan with supplementary health products.</p>', headquartersCountry: 'Japan', headquartersCity: 'Osaka', website: 'https://www.nissay.co.jp', customerCarePhone: '+81-3-5533-1111', establishedYear: 1889, claimSettlementRatio: 96.0 },

    // South Korea
    { slug: 'nhis-korea', name: 'National Health Insurance Service (NHIS)', providerType: 'government', description: '<p>Mandatory national health insurance covering all Korean residents with high efficiency.</p>', headquartersCountry: 'South Korea', headquartersCity: 'Seoul', website: 'https://www.nhis.or.kr', customerCarePhone: '1577-1000', regulatoryBody: 'MOHW', establishedYear: 1977, claimSettlementRatio: 98.5 },
    { slug: 'samsung-life-korea', name: 'Samsung Life Insurance', shortName: 'Samsung Life', providerType: 'private', description: '<p>Largest life insurer in South Korea with supplementary health coverage.</p>', headquartersCountry: 'South Korea', headquartersCity: 'Seoul', website: 'https://www.samsunglife.com', customerCarePhone: '1588-3114', establishedYear: 1957, claimSettlementRatio: 94.5 },

    // Thailand
    { slug: 'ucs-thailand', name: 'Universal Coverage Scheme (30 Baht Scheme)', providerType: 'government', description: '<p>Universal health coverage for all Thai citizens not covered by other schemes.</p>', headquartersCountry: 'Thailand', headquartersCity: 'Bangkok', website: 'https://www.nhso.go.th', customerCarePhone: '1330', regulatoryBody: 'NHSO', establishedYear: 2002, claimSettlementRatio: 95.0 },
    { slug: 'muangthai-life-thailand', name: 'Muang Thai Life Assurance', shortName: 'MTL', providerType: 'private', description: '<p>Leading insurance company in Thailand with comprehensive health products.</p>', headquartersCountry: 'Thailand', headquartersCity: 'Bangkok', website: 'https://www.muangthai.co.th', customerCarePhone: '1766', establishedYear: 1951, claimSettlementRatio: 91.0 },

    // Malaysia
    { slug: 'great-eastern-malaysia', name: 'Great Eastern Life Malaysia', shortName: 'Great Eastern', providerType: 'private', description: '<p>Largest and oldest life insurer in Malaysia with 3+ million policyholders.</p>', headquartersCountry: 'Malaysia', headquartersCity: 'Kuala Lumpur', website: 'https://www.greateasternlife.com/my', customerCarePhone: '+60-3-4259-8888', establishedYear: 1908, claimSettlementRatio: 93.0 },
    { slug: 'aia-malaysia', name: 'AIA Malaysia', shortName: 'AIA', providerType: 'private', description: '<p>Leading insurer with A-Plus Health and critical illness coverage.</p>', headquartersCountry: 'Malaysia', headquartersCity: 'Kuala Lumpur', website: 'https://www.aia.com.my', customerCarePhone: '+60-3-2056-1111', establishedYear: 1948, claimSettlementRatio: 92.5 },

    // Philippines
    { slug: 'philhealth-philippines', name: 'Philippine Health Insurance (PhilHealth)', providerType: 'government', description: '<p>National health insurance covering 100+ million Filipinos with hospitalization benefits.</p>', headquartersCountry: 'Philippines', headquartersCity: 'Pasig City', website: 'https://www.philhealth.gov.ph', customerCarePhone: '(02) 8441-7442', regulatoryBody: 'DOH', establishedYear: 1995, claimSettlementRatio: 90.0 },
    { slug: 'maxicare-philippines', name: 'Maxicare Healthcare', shortName: 'Maxicare', providerType: 'private', description: '<p>Largest HMO in the Philippines serving 1+ million members.</p>', headquartersCountry: 'Philippines', headquartersCity: 'Makati City', website: 'https://www.maxicare.com.ph', customerCarePhone: '(02) 8582-1900', establishedYear: 1987, claimSettlementRatio: 91.0 },

    // Indonesia
    { slug: 'bpjs-kesehatan-indonesia', name: 'BPJS Kesehatan', providerType: 'government', description: '<p>National health insurance covering 200+ million Indonesians, one of the largest in the world.</p>', headquartersCountry: 'Indonesia', headquartersCity: 'Jakarta', website: 'https://www.bpjs-kesehatan.go.id', customerCarePhone: '165', regulatoryBody: 'MOH', establishedYear: 2014, claimSettlementRatio: 88.0 },
    { slug: 'prudential-indonesia', name: 'Prudential Indonesia', shortName: 'Prudential', providerType: 'private', description: '<p>Leading life and health insurer with PRUMedical Network.</p>', headquartersCountry: 'Indonesia', headquartersCity: 'Jakarta', website: 'https://www.prudential.co.id', customerCarePhone: '+62-21-1500-085', establishedYear: 1995, claimSettlementRatio: 92.0 },

    // Nigeria
    { slug: 'nhis-nigeria', name: 'National Health Insurance Scheme (NHIS)', providerType: 'government', description: '<p>National program expanding health coverage to formal and informal sectors.</p>', headquartersCountry: 'Nigeria', headquartersCity: 'Abuja', website: 'https://www.nhis.gov.ng', customerCarePhone: '+234-9-290-5676', regulatoryBody: 'FMOH', establishedYear: 1999, claimSettlementRatio: 75.0 },
    { slug: 'hygeia-nigeria', name: 'Hygeia HMO', shortName: 'Hygeia', providerType: 'private', description: '<p>Leading HMO serving 500k+ lives through 1,000+ healthcare providers.</p>', headquartersCountry: 'Nigeria', headquartersCity: 'Lagos', website: 'https://www.hygeiagroup.com', customerCarePhone: '+234-1-271-7441', establishedYear: 1986, claimSettlementRatio: 85.0 },

    // South Africa
    { slug: 'discovery-health-sa', name: 'Discovery Health', shortName: 'Discovery', providerType: 'private', description: '<p>Largest medical scheme administrator in South Africa with Vitality wellness program.</p>', headquartersCountry: 'South Africa', headquartersCity: 'Johannesburg', website: 'https://www.discovery.co.za', customerCarePhone: '0860-99-88-77', establishedYear: 1992, claimSettlementRatio: 94.0 },
    { slug: 'bonitas-sa', name: 'Bonitas Medical Fund', shortName: 'Bonitas', providerType: 'private', description: '<p>One of the largest open medical schemes serving 700k+ beneficiaries.</p>', headquartersCountry: 'South Africa', headquartersCity: 'Johannesburg', website: 'https://www.bonitas.co.za', customerCarePhone: '0860-002-108', establishedYear: 1982, claimSettlementRatio: 92.0 },

    // Egypt
    { slug: 'uhia-egypt', name: 'Universal Health Insurance Authority (UHIA)', providerType: 'government', description: '<p>New universal health insurance being rolled out across Egypt.</p>', headquartersCountry: 'Egypt', headquartersCity: 'Cairo', website: 'https://www.uhia.gov.eg', customerCarePhone: '15333', regulatoryBody: 'MOH', establishedYear: 2018, claimSettlementRatio: 80.0 },
    { slug: 'axa-egypt', name: 'AXA Egypt', shortName: 'AXA', providerType: 'private', description: '<p>Leading insurer offering comprehensive health products for individuals and corporates.</p>', headquartersCountry: 'Egypt', headquartersCity: 'Cairo', website: 'https://www.axa-egypt.com', customerCarePhone: '+20-2-2461-9800', establishedYear: 1928, claimSettlementRatio: 88.0 },

    // Pakistan
    { slug: 'sehat-sahulat-pakistan', name: 'Sehat Sahulat Program', providerType: 'government', description: '<p>National health insurance providing free hospitalization for families below poverty line.</p>', headquartersCountry: 'Pakistan', headquartersCity: 'Islamabad', website: 'https://www.pmhealthprogram.gov.pk', customerCarePhone: '0800-00-786', regulatoryBody: 'MOH', establishedYear: 2016, claimSettlementRatio: 82.0 },
    { slug: 'jubilee-life-pakistan', name: 'Jubilee Life Insurance', shortName: 'Jubilee', providerType: 'private', description: '<p>Largest private life insurer in Pakistan with comprehensive health coverage.</p>', headquartersCountry: 'Pakistan', headquartersCity: 'Karachi', website: 'https://www.jubileelife.com', customerCarePhone: '0800-00-433', establishedYear: 1995, claimSettlementRatio: 90.0 },

    // Bangladesh
    { slug: 'green-delta-bangladesh', name: 'Green Delta Insurance', shortName: 'Green Delta', providerType: 'private', description: '<p>Largest private general insurance company in Bangladesh.</p>', headquartersCountry: 'Bangladesh', headquartersCity: 'Dhaka', website: 'https://www.green-delta.com', customerCarePhone: '+880-2-8431515', establishedYear: 1985, claimSettlementRatio: 85.0 },

    // Vietnam
    { slug: 'vss-vietnam', name: 'Vietnam Social Security (VSS)', providerType: 'government', description: '<p>Compulsory social health insurance covering 90%+ of the population.</p>', headquartersCountry: 'Vietnam', headquartersCity: 'Hanoi', website: 'https://www.vss.gov.vn', customerCarePhone: '1900-9068', regulatoryBody: 'MOLISA', establishedYear: 1995, claimSettlementRatio: 90.0 },
    { slug: 'bao-viet-vietnam', name: 'Bao Viet Insurance', shortName: 'Bao Viet', providerType: 'private', description: '<p>Largest insurance corporation in Vietnam with 50+ years of experience.</p>', headquartersCountry: 'Vietnam', headquartersCity: 'Hanoi', website: 'https://www.baoviet.com.vn', customerCarePhone: '+84-24-3928-9999', establishedYear: 1965, claimSettlementRatio: 89.0 },

    // China
    { slug: 'basic-medical-china', name: 'Basic Medical Insurance (BMI)', providerType: 'government', description: '<p>National system covering 1.3+ billion people through UEBMI and URRBMI.</p>', headquartersCountry: 'China', headquartersCity: 'Beijing', website: 'https://www.nhsa.gov.cn', customerCarePhone: '12393', regulatoryBody: 'NHSA', establishedYear: 1998, claimSettlementRatio: 85.0 },
    { slug: 'ping-an-china', name: 'Ping An Health Insurance', shortName: 'Ping An', providerType: 'private', description: '<p>One of the largest insurers globally with AI-enabled Ping An Good Doctor platform.</p>', headquartersCountry: 'China', headquartersCity: 'Shenzhen', website: 'https://www.pingan.com', customerCarePhone: '95511', establishedYear: 1988, claimSettlementRatio: 91.0 },

    // France
    { slug: 'assurance-maladie-france', name: 'Assurance Maladie (French Social Security)', providerType: 'government', description: '<p>National health insurance reimbursing ~70% of medical costs for all residents.</p>', headquartersCountry: 'France', headquartersCity: 'Paris', website: 'https://www.ameli.fr', customerCarePhone: '3646', regulatoryBody: 'Ministry of Health', establishedYear: 1945, claimSettlementRatio: 98.0 },
    { slug: 'axa-france', name: 'AXA France', shortName: 'AXA', providerType: 'private', description: '<p>One of the largest insurers offering complementary health insurance (mutuelle).</p>', headquartersCountry: 'France', headquartersCity: 'Paris', website: 'https://www.axa.fr', customerCarePhone: '+33-9-69-39-99-99', establishedYear: 1985, claimSettlementRatio: 92.0 },

    // Sri Lanka
    { slug: 'sri-lanka-insurance', name: 'Sri Lanka Insurance Corporation', shortName: 'SLIC', providerType: 'public', description: '<p>State-owned insurer providing comprehensive health coverage across Sri Lanka.</p>', headquartersCountry: 'Sri Lanka', headquartersCity: 'Colombo', website: 'https://www.srilankainsurance.com', customerCarePhone: '+94-11-2357357', establishedYear: 1962, claimSettlementRatio: 88.0 },

    // Nepal
    { slug: 'social-health-nepal', name: 'Social Health Security Programme', providerType: 'government', description: '<p>Government health insurance program targeting the poor and vulnerable population.</p>', headquartersCountry: 'Nepal', headquartersCity: 'Kathmandu', website: 'https://www.mohp.gov.np', customerCarePhone: '+977-1-4262802', regulatoryBody: 'MOHP', establishedYear: 2016, claimSettlementRatio: 75.0 },

    // Qatar
    { slug: 'seha-qatar', name: 'SEHA - Qatar Healthcare System', providerType: 'government', description: '<p>Qatar national healthcare system providing free/subsidized care to citizens.</p>', headquartersCountry: 'Qatar', headquartersCity: 'Doha', website: 'https://www.moph.gov.qa', customerCarePhone: '16000', regulatoryBody: 'MOPH', establishedYear: 2012, claimSettlementRatio: 96.0 },
    { slug: 'qlm-qatar', name: 'QLM Life & Medical Insurance', shortName: 'QLM', providerType: 'private', description: '<p>Leading medical and life insurance provider in Qatar.</p>', headquartersCountry: 'Qatar', headquartersCity: 'Doha', website: 'https://www.qlm.com.qa', customerCarePhone: '+974-4496-2555', establishedYear: 2011, claimSettlementRatio: 92.0 },

    // Kuwait
    { slug: 'moh-kuwait', name: 'Ministry of Health Kuwait', providerType: 'government', description: '<p>Government provides free healthcare to Kuwaiti citizens through MOH hospitals.</p>', headquartersCountry: 'Kuwait', headquartersCity: 'Kuwait City', website: 'https://www.moh.gov.kw', customerCarePhone: '151', regulatoryBody: 'MOH', establishedYear: 1936, claimSettlementRatio: 95.0 },

    // Bahrain
    { slug: 'nhra-bahrain', name: 'National Health Regulatory Authority', providerType: 'government', description: '<p>Regulates and provides health insurance for Bahrain residents.</p>', headquartersCountry: 'Bahrain', headquartersCity: 'Manama', website: 'https://www.nhra.bh', customerCarePhone: '+973-17288888', regulatoryBody: 'NHRA', establishedYear: 2009, claimSettlementRatio: 90.0 },

    // Oman
    { slug: 'moh-oman', name: 'Ministry of Health Oman', providerType: 'government', description: '<p>Government provides free healthcare to Omani citizens through MOH facilities.</p>', headquartersCountry: 'Oman', headquartersCity: 'Muscat', website: 'https://www.moh.gov.om', customerCarePhone: '+968-24564777', regulatoryBody: 'MOH', establishedYear: 1970, claimSettlementRatio: 92.0 },

    // Kenya
    { slug: 'nhif-kenya', name: 'National Hospital Insurance Fund (NHIF)', providerType: 'government', description: '<p>National health insurer providing coverage to formal and informal sector workers.</p>', headquartersCountry: 'Kenya', headquartersCity: 'Nairobi', website: 'https://www.nhif.or.ke', customerCarePhone: '0800-720-601', regulatoryBody: 'MOH', establishedYear: 1966, claimSettlementRatio: 80.0 },
    { slug: 'jubilee-kenya', name: 'Jubilee Insurance Kenya', shortName: 'Jubilee', providerType: 'private', description: '<p>Largest insurer in East Africa with comprehensive health products.</p>', headquartersCountry: 'Kenya', headquartersCity: 'Nairobi', website: 'https://www.jubileeinsurance.com', customerCarePhone: '+254-20-328-1000', establishedYear: 1937, claimSettlementRatio: 88.0 },

    // Tanzania
    { slug: 'nhif-tanzania', name: 'National Health Insurance Fund Tanzania', providerType: 'government', description: '<p>Mandatory health insurance for public sector employees.</p>', headquartersCountry: 'Tanzania', headquartersCity: 'Dodoma', website: 'https://www.nhif.or.tz', customerCarePhone: '+255-22-213-0100', regulatoryBody: 'MOH', establishedYear: 1999, claimSettlementRatio: 78.0 },

    // Ghana
    { slug: 'nhis-ghana', name: 'National Health Insurance Scheme Ghana', providerType: 'government', description: '<p>National program providing financial access to quality healthcare for residents.</p>', headquartersCountry: 'Ghana', headquartersCity: 'Accra', website: 'https://www.nhis.gov.gh', customerCarePhone: '+233-302-233-555', regulatoryBody: 'NHIA', establishedYear: 2003, claimSettlementRatio: 75.0 },

    // Ethiopia
    { slug: 'cbhi-ethiopia', name: 'Community Based Health Insurance (CBHI)', providerType: 'government', description: '<p>Health insurance scheme targeting the informal sector and rural population.</p>', headquartersCountry: 'Ethiopia', headquartersCity: 'Addis Ababa', website: 'https://www.moh.gov.et', customerCarePhone: '+251-11-551-7011', regulatoryBody: 'MOH', establishedYear: 2011, claimSettlementRatio: 70.0 },
];

async function main() {
    console.log('Starting global insurance providers seeding...\n');
    const client = await pool.connect();

    try {
        let created = 0;
        let skipped = 0;

        for (const provider of INSURANCE_PROVIDERS) {
            const existing = await client.query(
                'SELECT id FROM insurance_providers WHERE slug = $1',
                [provider.slug]
            );

            if (existing.rows.length > 0) {
                skipped++;
                continue;
            }

            await client.query(`
                INSERT INTO insurance_providers (
                    slug, name, short_name, provider_type, description,
                    headquarters_country, headquarters_city, website,
                    customer_care_phone, email, license_number, regulatory_body,
                    established_year, claim_settlement_ratio,
                    is_active, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, NOW(), NOW())
            `, [
                provider.slug,
                provider.name,
                provider.shortName || null,
                provider.providerType,
                provider.description,
                provider.headquartersCountry,
                provider.headquartersCity,
                provider.website,
                provider.customerCarePhone,
                provider.email || null,
                provider.licenseNumber || null,
                provider.regulatoryBody || null,
                provider.establishedYear || null,
                provider.claimSettlementRatio || null,
            ]);

            console.log(`  Created: ${provider.name} (${provider.headquartersCountry})`);
            created++;
        }

        console.log(`\nCompleted!`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped} (already exist)`);

        const total = await client.query('SELECT COUNT(*) FROM insurance_providers');
        console.log(`   Total providers: ${total.rows[0].count}`);

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
