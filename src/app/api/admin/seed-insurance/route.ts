import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { InsuranceProviderType } from '@prisma/client';

/**
 * POST /api/admin/seed-insurance
 *
 * Seeds realistic insurance providers for India and global markets
 */

const INSURANCE_PROVIDERS: Array<{
    slug: string;
    name: string;
    shortName: string;
    providerType: InsuranceProviderType;
    description: string;
    headquartersCountry: string;
    headquartersCity: string;
    website: string;
    customerCarePhone: string;
    claimPhone?: string;
    establishedYear: number;
    claimSettlementRatio: number;
    rating: number;
    isActive: boolean;
    operatingCountries: string[];
}> = [
    // Indian Health Insurance Providers
    {
        slug: 'star-health',
        name: 'Star Health and Allied Insurance',
        shortName: 'Star Health',
        providerType: InsuranceProviderType.private,
        description: 'India\'s largest standalone health insurer with comprehensive coverage options',
        headquartersCountry: 'India',
        headquartersCity: 'Chennai',
        website: 'https://www.starhealth.in',
        customerCarePhone: '1800-102-4477',
        claimPhone: '1800-102-4488',
        establishedYear: 2006,
        claimSettlementRatio: 87.5,
        rating: 4.2,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'hdfc-ergo',
        name: 'HDFC ERGO General Insurance',
        shortName: 'HDFC ERGO',
        providerType: InsuranceProviderType.private,
        description: 'Joint venture between HDFC and ERGO International offering diverse health plans',
        headquartersCountry: 'India',
        headquartersCity: 'Mumbai',
        website: 'https://www.hdfcergo.com',
        customerCarePhone: '1800-2666-400',
        claimPhone: '1800-2666-400',
        establishedYear: 2002,
        claimSettlementRatio: 91.2,
        rating: 4.3,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'icici-lombard',
        name: 'ICICI Lombard General Insurance',
        shortName: 'ICICI Lombard',
        providerType: InsuranceProviderType.private,
        description: 'Leading private sector general insurance company with comprehensive health solutions',
        headquartersCountry: 'India',
        headquartersCity: 'Mumbai',
        website: 'https://www.icicilombard.com',
        customerCarePhone: '1800-2666-247',
        claimPhone: '1800-2666-247',
        establishedYear: 2001,
        claimSettlementRatio: 89.7,
        rating: 4.4,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'max-bupa',
        name: 'Niva Bupa Health Insurance',
        shortName: 'Niva Bupa',
        providerType: InsuranceProviderType.private,
        description: 'Formerly Max Bupa, specialist health insurance provider with innovative plans',
        headquartersCountry: 'India',
        headquartersCity: 'New Delhi',
        website: 'https://www.nivabupa.com',
        customerCarePhone: '1800-200-7272',
        claimPhone: '1800-200-7272',
        establishedYear: 2010,
        claimSettlementRatio: 92.1,
        rating: 4.1,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'bajaj-allianz',
        name: 'Bajaj Allianz General Insurance',
        shortName: 'Bajaj Allianz',
        providerType: InsuranceProviderType.private,
        description: 'Joint venture between Bajaj Finserv and Allianz SE for general insurance',
        headquartersCountry: 'India',
        headquartersCity: 'Pune',
        website: 'https://www.bajajallianz.com',
        customerCarePhone: '1800-209-5858',
        claimPhone: '1800-209-5858',
        establishedYear: 2001,
        claimSettlementRatio: 88.9,
        rating: 4.2,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'tata-aig',
        name: 'Tata AIG General Insurance',
        shortName: 'Tata AIG',
        providerType: InsuranceProviderType.private,
        description: 'Joint venture between Tata Group and AIG offering comprehensive health coverage',
        headquartersCountry: 'India',
        headquartersCity: 'Mumbai',
        website: 'https://www.tataaig.com',
        customerCarePhone: '1800-266-7780',
        claimPhone: '1800-266-7780',
        establishedYear: 2001,
        claimSettlementRatio: 90.3,
        rating: 4.3,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'new-india-assurance',
        name: 'New India Assurance Company',
        shortName: 'New India',
        providerType: InsuranceProviderType.public,
        description: 'India\'s largest public sector general insurance company with national presence',
        headquartersCountry: 'India',
        headquartersCity: 'Mumbai',
        website: 'https://www.newindia.co.in',
        customerCarePhone: '1800-209-1415',
        claimPhone: '1800-209-1415',
        establishedYear: 1919,
        claimSettlementRatio: 85.2,
        rating: 3.9,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'united-india',
        name: 'United India Insurance Company',
        shortName: 'United India',
        providerType: InsuranceProviderType.public,
        description: 'Major public sector insurer with extensive network across India',
        headquartersCountry: 'India',
        headquartersCity: 'Chennai',
        website: 'https://www.uiic.co.in',
        customerCarePhone: '1800-425-33333',
        claimPhone: '1800-425-33333',
        establishedYear: 1938,
        claimSettlementRatio: 84.1,
        rating: 3.8,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'oriental-insurance',
        name: 'Oriental Insurance Company',
        shortName: 'Oriental Insurance',
        providerType: InsuranceProviderType.public,
        description: 'Established public sector insurer with wide branch network',
        headquartersCountry: 'India',
        headquartersCity: 'New Delhi',
        website: 'https://www.orientalinsurance.org.in',
        customerCarePhone: '1800-11-8485',
        claimPhone: '1800-11-8485',
        establishedYear: 1947,
        claimSettlementRatio: 83.5,
        rating: 3.7,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'care-health',
        name: 'Care Health Insurance',
        shortName: 'Care Health',
        providerType: InsuranceProviderType.private,
        description: 'Formerly Religare Health Insurance, focused on health insurance products',
        headquartersCountry: 'India',
        headquartersCity: 'Gurugram',
        website: 'https://www.careinsurance.com',
        customerCarePhone: '1800-102-6655',
        claimPhone: '1800-102-6655',
        establishedYear: 2012,
        claimSettlementRatio: 86.4,
        rating: 4.0,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'aditya-birla',
        name: 'Aditya Birla Health Insurance',
        shortName: 'ABHI',
        providerType: InsuranceProviderType.private,
        description: 'Health-focused insurer from Aditya Birla Group with wellness benefits',
        headquartersCountry: 'India',
        headquartersCity: 'Mumbai',
        website: 'https://www.adityabirlahealthinsurance.com',
        customerCarePhone: '1800-270-7000',
        claimPhone: '1800-270-7000',
        establishedYear: 2016,
        claimSettlementRatio: 88.1,
        rating: 4.1,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'manipal-cigna',
        name: 'ManipalCigna Health Insurance',
        shortName: 'ManipalCigna',
        providerType: InsuranceProviderType.private,
        description: 'Joint venture between Manipal Group and Cigna Corporation',
        headquartersCountry: 'India',
        headquartersCity: 'Bangalore',
        website: 'https://www.manipalcigna.com',
        customerCarePhone: '1800-102-0164',
        claimPhone: '1800-102-0164',
        establishedYear: 2014,
        claimSettlementRatio: 85.6,
        rating: 3.9,
        isActive: true,
        operatingCountries: ['India'],
    },
    // Government Schemes
    {
        slug: 'ayushman-bharat',
        name: 'Ayushman Bharat PM-JAY',
        shortName: 'PM-JAY',
        providerType: InsuranceProviderType.government,
        description: 'Government health insurance scheme providing Rs. 5 lakh coverage to poor families',
        headquartersCountry: 'India',
        headquartersCity: 'New Delhi',
        website: 'https://pmjay.gov.in',
        customerCarePhone: '14555',
        claimPhone: '14555',
        establishedYear: 2018,
        claimSettlementRatio: 78.0,
        rating: 4.0,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'cghs',
        name: 'Central Government Health Scheme',
        shortName: 'CGHS',
        providerType: InsuranceProviderType.government,
        description: 'Healthcare scheme for central government employees and pensioners',
        headquartersCountry: 'India',
        headquartersCity: 'New Delhi',
        website: 'https://cghs.gov.in',
        customerCarePhone: '1800-11-0928',
        claimPhone: '1800-11-0928',
        establishedYear: 1954,
        claimSettlementRatio: 82.0,
        rating: 3.6,
        isActive: true,
        operatingCountries: ['India'],
    },
    {
        slug: 'esi',
        name: 'Employee State Insurance',
        shortName: 'ESI',
        providerType: InsuranceProviderType.government,
        description: 'Social security scheme for organized sector workers',
        headquartersCountry: 'India',
        headquartersCity: 'New Delhi',
        website: 'https://www.esic.nic.in',
        customerCarePhone: '1800-11-1234',
        claimPhone: '1800-11-1234',
        establishedYear: 1952,
        claimSettlementRatio: 80.0,
        rating: 3.5,
        isActive: true,
        operatingCountries: ['India'],
    },
    // International Insurers
    {
        slug: 'cigna',
        name: 'Cigna Global Health',
        shortName: 'Cigna',
        providerType: InsuranceProviderType.private,
        description: 'Global health service company offering international health insurance',
        headquartersCountry: 'United States',
        headquartersCity: 'Bloomfield',
        website: 'https://www.cigna.com',
        customerCarePhone: '+1-800-244-6224',
        establishedYear: 1982,
        claimSettlementRatio: 91.0,
        rating: 4.3,
        isActive: true,
        operatingCountries: ['United States', 'United Kingdom', 'UAE', 'Singapore', 'Hong Kong'],
    },
    {
        slug: 'aetna',
        name: 'Aetna International',
        shortName: 'Aetna',
        providerType: InsuranceProviderType.private,
        description: 'Major US health insurance provider with international coverage',
        headquartersCountry: 'United States',
        headquartersCity: 'Hartford',
        website: 'https://www.aetnainternational.com',
        customerCarePhone: '+1-800-872-3862',
        establishedYear: 1853,
        claimSettlementRatio: 89.5,
        rating: 4.2,
        isActive: true,
        operatingCountries: ['United States', 'United Kingdom', 'UAE', 'Singapore'],
    },
    {
        slug: 'bupa-global',
        name: 'Bupa Global',
        shortName: 'Bupa',
        providerType: InsuranceProviderType.private,
        description: 'UK-based international health insurance provider',
        headquartersCountry: 'United Kingdom',
        headquartersCity: 'London',
        website: 'https://www.bupaglobal.com',
        customerCarePhone: '+44-1onal-273-323',
        establishedYear: 1947,
        claimSettlementRatio: 93.0,
        rating: 4.5,
        isActive: true,
        operatingCountries: ['United Kingdom', 'UAE', 'Hong Kong', 'Australia', 'Spain'],
    },
    {
        slug: 'allianz-worldwide',
        name: 'Allianz Worldwide Partners',
        shortName: 'Allianz',
        providerType: InsuranceProviderType.private,
        description: 'German multinational offering global health and travel insurance',
        headquartersCountry: 'Germany',
        headquartersCity: 'Munich',
        website: 'https://www.allianzworldwidepartners.com',
        customerCarePhone: '+49-89-3800-0',
        establishedYear: 1890,
        claimSettlementRatio: 90.5,
        rating: 4.3,
        isActive: true,
        operatingCountries: ['Germany', 'United States', 'France', 'UAE', 'Singapore', 'India'],
    },
    {
        slug: 'daman',
        name: 'Daman National Health Insurance',
        shortName: 'Daman',
        providerType: InsuranceProviderType.private,
        description: 'Major health insurer in UAE offering comprehensive coverage',
        headquartersCountry: 'UAE',
        headquartersCity: 'Abu Dhabi',
        website: 'https://www.damanhealth.ae',
        customerCarePhone: '+971-600-500-800',
        establishedYear: 2005,
        claimSettlementRatio: 88.0,
        rating: 4.1,
        isActive: true,
        operatingCountries: ['UAE'],
    },
];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { limit = 25 } = body;

        const results: { name: string; status: string }[] = [];
        let added = 0;
        let skipped = 0;

        for (const provider of INSURANCE_PROVIDERS.slice(0, limit)) {
            // Check if exists
            const existing = await prisma.insuranceProvider.findUnique({
                where: { slug: provider.slug },
            });

            if (existing) {
                results.push({ name: provider.name, status: 'skipped (exists)' });
                skipped++;
                continue;
            }

            await prisma.insuranceProvider.create({
                data: {
                    slug: provider.slug,
                    name: provider.name,
                    shortName: provider.shortName,
                    providerType: provider.providerType,
                    description: provider.description,
                    headquartersCountry: provider.headquartersCountry,
                    headquartersCity: provider.headquartersCity,
                    website: provider.website,
                    customerCarePhone: provider.customerCarePhone,
                    claimPhone: provider.claimPhone,
                    establishedYear: provider.establishedYear,
                    claimSettlementRatio: provider.claimSettlementRatio,
                    rating: provider.rating,
                    isActive: provider.isActive,
                    operatingCountries: provider.operatingCountries,
                },
            });

            results.push({ name: provider.name, status: 'created' });
            added++;
        }

        return NextResponse.json({
            success: true,
            message: `Added ${added} insurance providers, skipped ${skipped} existing`,
            results,
        });
    } catch (error: any) {
        console.error('Seed insurance error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    const count = await prisma.insuranceProvider.count();
    const byType = await prisma.insuranceProvider.groupBy({
        by: ['providerType'],
        _count: true,
    });

    return NextResponse.json({
        totalProviders: count,
        byType: byType.map(t => ({ type: t.providerType, count: t._count })),
    });
}
