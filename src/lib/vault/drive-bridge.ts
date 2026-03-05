import prisma from '@/lib/db';

/**
 * Google Drive Health Vault Bridge
 *
 * - Creates secure non-public folders per user
 * - Generates temporary signed URLs for viewing
 * - Grants/revokes doctor access to specific files
 */

const DRIVE_ROOT = 'aihealz_Vault';

interface DriveCredentials {
    accessToken: string;
}

/**
 * Get Google Drive auth token from service account.
 */
async function getDriveAuth(): Promise<DriveCredentials | null> {
    const serviceAccountJson = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) return null;

    try {
        const sa = JSON.parse(serviceAccountJson);
        const now = Math.floor(Date.now() / 1000);
        const crypto = await import('crypto');

        const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
        const payload = Buffer.from(JSON.stringify({
            iss: sa.client_email,
            scope: 'https://www.googleapis.com/auth/drive',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now, exp: now + 3600,
        })).toString('base64url');

        const sign = crypto.createSign('RSA-SHA256');
        sign.update(`${header}.${payload}`);
        const signature = sign.sign(sa.private_key, 'base64url');

        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${payload}.${signature}`,
        });

        if (!res.ok) return null;
        const data = await res.json();
        return { accessToken: data.access_token };
    } catch {
        return null;
    }
}

/**
 * Create a vault folder for a user on Google Drive.
 */
export async function createVaultFolder(
    sessionHash: string,
    countryCode: string
): Promise<{ vaultId: string; driveFolderId: string | null }> {
    // Check if vault already exists
    const existing = await prisma.healthVault.findUnique({
        where: { sessionHash },
    });
    if (existing) return { vaultId: existing.id, driveFolderId: existing.driveFolderId };

    let driveFolderId: string | null = null;
    const folderPath = `/${DRIVE_ROOT}/${countryCode.toUpperCase()}/${sessionHash.substring(0, 12)}`;

    // Try creating Google Drive folder
    const auth = await getDriveAuth();
    if (auth) {
        try {
            // Create country folder if needed
            const countryFolder = await findOrCreateFolder(auth, countryCode.toUpperCase(), null);
            // Create user folder inside country folder
            const userFolder = await findOrCreateFolder(
                auth, sessionHash.substring(0, 12), countryFolder
            );
            driveFolderId = userFolder;
        } catch (error) {
            console.error('Drive folder creation error:', error);
        }
    }

    const vault = await prisma.healthVault.create({
        data: {
            sessionHash,
            countryCode,
            driveFolderId,
            driveFolderPath: folderPath,
        },
    });

    return { vaultId: vault.id, driveFolderId };
}

/**
 * Upload a file reference to the vault.
 */
export async function addFileToVault(
    vaultId: string,
    file: {
        fileName: string;
        fileType: 'blood_work' | 'imaging' | 'pathology' | 'prescription' | 'other';
        mimeType: string;
        fileSizeBytes: number;
        analysisId?: string;
    }
): Promise<string> {
    const vaultFile = await prisma.vaultFile.create({
        data: {
            vaultId,
            fileName: file.fileName,
            fileType: file.fileType,
            mimeType: file.mimeType,
            fileSizeBytes: file.fileSizeBytes,
            analysisId: file.analysisId || null,
        },
    });

    // Update vault storage counter
    await prisma.healthVault.update({
        where: { id: vaultId },
        data: { storageUsedBytes: { increment: file.fileSizeBytes } },
    });

    return vaultFile.id;
}

/**
 * Generate a temporary signed URL for file access (expires in 1 hour).
 */
export async function getSignedUrl(fileId: string): Promise<string | null> {
    const file = await prisma.vaultFile.findUnique({
        where: { id: fileId },
        select: { driveFileId: true },
    });

    if (!file?.driveFileId) return null;

    const auth = await getDriveAuth();
    if (!auth) return null;

    try {
        // Create a temporary download link
        const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.driveFileId}?fields=webContentLink`,
            { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        const data = await res.json();
        return data.webContentLink || null;
    } catch {
        return null;
    }
}

/**
 * Grant a doctor temporary access to vault files for an encounter.
 */
export async function grantDoctorAccess(
    encounterId: string,
    doctorId: number,
    fileIds: string[],
    hoursValid: number = 72
): Promise<void> {
    const expiresAt = new Date(Date.now() + hoursValid * 60 * 60 * 1000);

    for (const fileId of fileIds) {
        await prisma.vaultFile.update({
            where: { id: fileId },
            data: {
                sharedWithDoctors: { push: doctorId },
                accessExpiresAt: expiresAt,
            },
        });
    }
}

/**
 * Revoke doctor access (after encounter completion or expiry).
 */
export async function revokeDoctorAccess(
    doctorId: number,
    fileIds: string[]
): Promise<void> {
    for (const fileId of fileIds) {
        const file = await prisma.vaultFile.findUnique({
            where: { id: fileId },
            select: { sharedWithDoctors: true },
        });
        if (file) {
            await prisma.vaultFile.update({
                where: { id: fileId },
                data: {
                    sharedWithDoctors: file.sharedWithDoctors.filter((id) => id !== doctorId),
                },
            });
        }
    }
}

/**
 * Get all files in a user's vault.
 */
export async function getVaultFiles(sessionHash: string) {
    const vault = await prisma.healthVault.findUnique({
        where: { sessionHash },
        include: {
            files: {
                where: { isArchived: false },
                orderBy: { uploadDate: 'desc' },
                include: {
                    analysis: {
                        select: { plainEnglish: true, urgencyLevel: true, confidenceScore: true },
                    },
                },
            },
        },
    });

    if (!vault) return null;

    return {
        id: vault.id,
        storageUsed: vault.storageUsedBytes,
        maxStorage: vault.maxStorageBytes,
        files: vault.files.map((f) => ({
            id: f.id,
            name: f.fileName,
            type: f.fileType,
            size: f.fileSizeBytes,
            aiSummary: f.aiSummary,
            analysis: f.analysis ? {
                summary: f.analysis.plainEnglish,
                urgency: f.analysis.urgencyLevel,
                confidence: f.analysis.confidenceScore ? Number(f.analysis.confidenceScore) : null,
            } : null,
            isProcessed: f.isProcessed,
            uploadDate: f.uploadDate,
        })),
    };
}

// ── Drive API Helpers ────────────────────────────────────────

async function findOrCreateFolder(
    auth: DriveCredentials,
    name: string,
    parentId: string | null
): Promise<string> {
    // Search for existing folder
    const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentId ? ` and '${parentId}' in parents` : ''
        }`;

    const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
    );
    const searchData = await searchRes.json();

    if (searchData.files?.length > 0) return searchData.files[0].id;

    // Create new folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.folder',
            ...(parentId ? { parents: [parentId] } : {}),
        }),
    });
    const createData = await createRes.json();
    return createData.id;
}
