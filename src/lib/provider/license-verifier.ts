import prisma from '@/lib/db';

/**
 * License Verifier — Multi-Registry Adapter
 *
 * Verifies medical licenses across different countries:
 * - NPI (USA) via NPPES API
 * - NMC/MCI (India)
 * - GMC (UK)
 * - HPCSA (South Africa)
 * - Manual fallback for unsupported registries
 */

export interface VerificationResult {
    status: 'verified' | 'pending' | 'rejected' | 'inconclusive';
    matchConfidence: number;
    verifiedName: string | null;
    verifiedSpecialty: string | null;
    verifiedStatus: string | null;
    apiResponse: Record<string, unknown>;
}

const REGISTRY_MAP: Record<string, string> = {
    US: 'NPI',
    IN: 'NMC',
    GB: 'GMC',
    ZA: 'HPCSA',
};

/**
 * Verify a doctor's license against the appropriate registry.
 */
export async function verifyLicense(
    doctorId: number,
    licenseNumber: string,
    licensingBody: string,
    countryCode: string
): Promise<VerificationResult> {
    const registryType = REGISTRY_MAP[countryCode] || 'manual';

    let result: VerificationResult;

    switch (registryType) {
        case 'NPI':
            result = await verifyNPI(licenseNumber, doctorId);
            break;
        case 'NMC':
            result = await verifyNMC(licenseNumber, doctorId);
            break;
        case 'GMC':
            result = await verifyGMC(licenseNumber, doctorId);
            break;
        default:
            // Manual verification required
            result = {
                status: 'pending',
                matchConfidence: 0,
                verifiedName: null,
                verifiedSpecialty: null,
                verifiedStatus: null,
                apiResponse: { registry: 'manual', reason: 'No API available for this country' },
            };
    }

    // Store verification record
    await prisma.licenseVerification.create({
        data: {
            doctorId,
            registryType,
            licenseNumber,
            countryCode,
            status: result.status,
            apiResponse: result.apiResponse as object,
            verifiedName: result.verifiedName,
            verifiedSpecialty: result.verifiedSpecialty,
            verifiedStatus: result.verifiedStatus,
            matchConfidence: result.matchConfidence,
            verifiedAt: result.status === 'verified' ? new Date() : null,
            expiresAt: result.status === 'verified'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                : null,
        },
    });

    // Update doctor verification status
    if (result.status === 'verified') {
        await prisma.doctorProvider.update({
            where: { id: doctorId },
            data: {
                isVerified: true,
                verificationDate: new Date(),
            },
        });
    }

    return result;
}

/**
 * NPI Verification (USA) — via NPPES public API
 * https://npiregistry.cms.hhs.gov/api/
 */
async function verifyNPI(npiNumber: string, doctorId: number): Promise<VerificationResult> {
    try {
        const response = await fetch(
            `https://npiregistry.cms.hhs.gov/api/?number=${npiNumber}&version=2.1`
        );

        if (!response.ok) {
            return {
                status: 'inconclusive',
                matchConfidence: 0,
                verifiedName: null,
                verifiedSpecialty: null,
                verifiedStatus: null,
                apiResponse: { error: `NPPES API returned ${response.status}` },
            };
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return {
                status: 'rejected',
                matchConfidence: 0,
                verifiedName: null,
                verifiedSpecialty: null,
                verifiedStatus: null,
                apiResponse: { error: 'NPI not found in NPPES registry' },
            };
        }

        const npiData = data.results[0];
        const basic = npiData.basic || {};
        const taxonomy = npiData.taxonomies?.[0] || {};

        // Get the doctor's name for comparison
        const doctor = await prisma.doctorProvider.findUnique({
            where: { id: doctorId },
            select: { name: true },
        });

        // Calculate name match confidence
        const registryName = `${basic.first_name || ''} ${basic.last_name || ''}`.trim();
        const confidence = calculateNameMatch(doctor?.name || '', registryName);

        return {
            status: confidence > 0.6 ? 'verified' : 'inconclusive',
            matchConfidence: confidence,
            verifiedName: registryName,
            verifiedSpecialty: taxonomy.desc || null,
            verifiedStatus: basic.status === 'A' ? 'Active' : basic.status || null,
            apiResponse: {
                npi: npiData.number,
                name: registryName,
                taxonomy: taxonomy.desc,
                state: basic.authorized_official_last_name ? basic.state : npiData.addresses?.[0]?.state,
                status: basic.status,
            },
        };
    } catch (error) {
        return {
            status: 'inconclusive',
            matchConfidence: 0,
            verifiedName: null,
            verifiedSpecialty: null,
            verifiedStatus: null,
            apiResponse: { error: String(error) },
        };
    }
}

/**
 * NMC Verification (India) — placeholder for National Medical Commission API
 */
async function verifyNMC(registrationNumber: string, _doctorId: number): Promise<VerificationResult> {
    // NMC doesn't have a public API currently.
    // In production: scrape https://www.nmc.org.in/information-desk/indian-medical-register/
    // or use a third-party verification service.
    return {
        status: 'pending',
        matchConfidence: 0,
        verifiedName: null,
        verifiedSpecialty: null,
        verifiedStatus: null,
        apiResponse: {
            registry: 'NMC',
            registrationNumber,
            note: 'NMC verification requires manual review. Added to verification queue.',
        },
    };
}

/**
 * GMC Verification (UK) — placeholder for General Medical Council API
 */
async function verifyGMC(gmcNumber: string, _doctorId: number): Promise<VerificationResult> {
    // GMC has a public register at https://www.gmc-uk.org/registration-and-licensing/the-medical-register
    return {
        status: 'pending',
        matchConfidence: 0,
        verifiedName: null,
        verifiedSpecialty: null,
        verifiedStatus: null,
        apiResponse: {
            registry: 'GMC',
            gmcNumber,
            note: 'GMC verification requires manual review or API integration.',
        },
    };
}

/**
 * Calculate similarity between two names (0.0 - 1.0)
 */
function calculateNameMatch(name1: string, name2: string): number {
    const n1 = name1.toLowerCase().trim().split(/\s+/).sort();
    const n2 = name2.toLowerCase().trim().split(/\s+/).sort();

    if (n1.length === 0 || n2.length === 0) return 0;

    let matches = 0;
    for (const part of n1) {
        if (n2.some((p) => p === part || p.startsWith(part) || part.startsWith(p))) {
            matches++;
        }
    }

    return matches / Math.max(n1.length, n2.length);
}
