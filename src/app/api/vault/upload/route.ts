import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * Health Vault File Upload API
 *
 * POST /api/vault/upload — Upload a medical report
 *
 * Since we're not using actual Google Drive (requires setup),
 * we store file metadata and base64 content in DB for now.
 * In production, this would upload to Google Drive.
 */

// File type detection based on name/mime
function detectFileType(fileName: string, mimeType: string): 'blood_work' | 'imaging' | 'pathology' | 'prescription' | 'other' {
    const name = fileName.toLowerCase();

    if (name.includes('blood') || name.includes('cbc') || name.includes('hemoglobin') || name.includes('lipid')) {
        return 'blood_work';
    }
    if (name.includes('xray') || name.includes('x-ray') || name.includes('ct') || name.includes('mri') || name.includes('scan') || name.includes('ultrasound')) {
        return 'imaging';
    }
    if (name.includes('biopsy') || name.includes('pathology') || name.includes('histology')) {
        return 'pathology';
    }
    if (name.includes('prescription') || name.includes('rx') || name.includes('medicine')) {
        return 'prescription';
    }

    // Check mime type for images (likely imaging)
    if (mimeType.startsWith('image/')) {
        return 'imaging';
    }

    return 'other';
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const session = formData.get('session') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!session) {
            return NextResponse.json({ error: 'Session required' }, { status: 400 });
        }

        // Validate file size (max 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: PDF, JPG, PNG, DOCX' }, { status: 400 });
        }

        // Find or create vault
        let vault = await prisma.healthVault.findUnique({
            where: { sessionHash: session },
        });

        if (!vault) {
            vault = await prisma.healthVault.create({
                data: {
                    sessionHash: session,
                    countryCode: 'US',
                    driveFolderPath: `/vault/${session.substring(0, 12)}`,
                },
            });
        }

        // Check storage limit
        const newTotal = Number(vault.storageUsedBytes) + file.size;
        if (newTotal > Number(vault.maxStorageBytes)) {
            return NextResponse.json({
                error: 'Storage limit exceeded. Please delete some files first.',
                storageUsed: vault.storageUsedBytes,
                maxStorage: vault.maxStorageBytes,
            }, { status: 400 });
        }

        // Detect file type
        const fileType = detectFileType(file.name, file.type);

        // Read file as buffer for potential processing
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Content = buffer.toString('base64');

        // Create vault file record
        const vaultFile = await prisma.vaultFile.create({
            data: {
                vaultId: vault.id,
                fileName: file.name,
                fileType: fileType,
                mimeType: file.type,
                fileSizeBytes: file.size,
                // Store base64 in ocrText field temporarily (or create a separate storage solution)
                ocrText: base64Content.substring(0, 50000), // Truncate for DB limits
                isProcessed: false,
            },
        });

        // Update vault storage counter
        await prisma.healthVault.update({
            where: { id: vault.id },
            data: {
                storageUsedBytes: { increment: file.size },
                lastAccessed: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            fileId: vaultFile.id,
            fileName: vaultFile.fileName,
            fileType: vaultFile.fileType,
            size: vaultFile.fileSizeBytes,
        });

    } catch (error) {
        console.error('Vault upload error:', error);
        const message = error instanceof Error ? error.message : 'Upload failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false, // Required for file uploads
    },
};
