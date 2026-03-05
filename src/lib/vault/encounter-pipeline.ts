import prisma from '@/lib/db';
import { grantDoctorAccess } from '@/lib/vault/drive-bridge';

// Helper function to format doctor name without double "Dr." prefix
function formatDoctorName(name: string): string {
    const trimmed = name.trim();
    if (/^dr\.?\s+/i.test(trimmed)) {
        return trimmed;
    }
    return `Dr. ${trimmed}`;
}

/**
 * Encounter Pipeline
 *
 * When a user requests a "Medical Opinion":
 * 1. Create encounter record
 * 2. Grant doctor temporary vault access
 * 3. Generate case dossier from analysis
 * 4. Trigger notification to doctor dashboard
 * 5. Track response times for CMS
 */

export interface CreateEncounterInput {
    sessionHash: string;
    doctorId: number;
    analysisId?: string;
    vaultId?: string;
    conditionSlug?: string;
    geographyId?: number;
    enquiryType?: 'opinion' | 'consultation' | 'referral';
    urgency?: 'routine' | 'urgent' | 'emergency';
    patientLanguage?: string;
}

/**
 * Create a new encounter (patient requesting doctor opinion).
 */
export async function createEncounter(input: CreateEncounterInput) {
    const startTime = Date.now();

    // Build case dossier from analysis
    let caseDossier: Record<string, unknown> = {};
    if (input.analysisId) {
        const analysis = await prisma.analysisResult.findUnique({
            where: { id: input.analysisId },
            select: {
                plainEnglish: true,
                primaryIndicators: true,
                questionsToAsk: true,
                lifestyleFactors: true,
                urgencyLevel: true,
                confidenceScore: true,
                specialtyRequired: true,
            },
        });

        if (analysis) {
            caseDossier = {
                summary: analysis.plainEnglish,
                indicators: analysis.primaryIndicators,
                questions: analysis.questionsToAsk,
                lifestyle: analysis.lifestyleFactors,
                urgency: analysis.urgencyLevel,
                confidence: analysis.confidenceScore ? Number(analysis.confidenceScore) : null,
                specialty: analysis.specialtyRequired,
            };
        }
    }

    // Get doctor's preferred language
    const doctor = await prisma.doctorProvider.findUnique({
        where: { id: input.doctorId },
        select: { name: true },
    });

    const encounter = await prisma.encounter.create({
        data: {
            sessionHash: input.sessionHash,
            doctorId: input.doctorId,
            vaultId: input.vaultId || null,
            analysisId: input.analysisId || null,
            conditionSlug: input.conditionSlug || null,
            geographyId: input.geographyId || null,
            enquiryType: input.enquiryType || 'opinion',
            urgency: input.urgency || 'routine',
            patientLanguage: input.patientLanguage || 'en',
            status: 'pending',
            caseDossier: caseDossier as object,
            expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h expiry
        },
    });

    // Grant doctor access to vault files
    if (input.vaultId) {
        const vaultFiles = await prisma.vaultFile.findMany({
            where: { vaultId: input.vaultId, isArchived: false },
            select: { id: true },
        });

        if (vaultFiles.length > 0) {
            await grantDoctorAccess(
                encounter.id,
                input.doctorId,
                vaultFiles.map((f) => f.id),
                72
            );
        }
    }

    // Create system message in chat
    await prisma.chatMessage.create({
        data: {
            encounterId: encounter.id,
            senderType: 'system',
            content: `Consultation request sent to ${doctor?.name ? formatDoctorName(doctor.name) : 'the doctor'}. They will respond within 72 hours.`,
            contentType: 'system',
        },
    });

    // Log for CMS monitoring
    await prisma.enquiryLog.create({
        data: {
            encounterId: encounter.id,
            geographyId: input.geographyId || null,
            conditionSlug: input.conditionSlug || null,
            aiConfidenceScore: caseDossier.confidence as number || null,
        },
    });

    // Generate the Lead so it appears in the backend
    await prisma.leadLog.create({
        data: {
            doctorId: input.doctorId,
            sessionHash: input.sessionHash,
            analysisId: input.analysisId || null,
            conditionSlug: input.conditionSlug || null,
            geographyId: input.geographyId || null,
            intentLevel: input.urgency === 'emergency' || input.urgency === 'urgent' ? 'high' : 'medium',
            intentScore: input.urgency === 'emergency' ? 0.9 : (input.urgency === 'urgent' ? 0.8 : 0.5),
        }
    });

    return {
        encounterId: encounter.id,
        doctorName: doctor?.name,
        expiresAt: encounter.expiresAt,
        processingTimeMs: Date.now() - startTime,
    };
}

/**
 * Doctor accepts/declines an encounter.
 */
export async function respondToEncounter(
    encounterId: string,
    doctorId: number,
    action: 'accept' | 'decline',
    notes?: string
) {
    const encounter = await prisma.encounter.findUnique({
        where: { id: encounterId },
    });

    if (!encounter || encounter.doctorId !== doctorId) {
        throw new Error('Encounter not found or unauthorized');
    }

    const responseTimeMs = Date.now() - encounter.createdAt.getTime();

    await prisma.encounter.update({
        where: { id: encounterId },
        data: {
            status: action === 'accept' ? 'in_progress' : 'declined',
            respondedAt: new Date(),
            responseTimeMs,
            doctorNotes: notes || null,
        },
    });

    // Update enquiry log
    await prisma.enquiryLog.updateMany({
        where: { encounterId },
        data: {
            responseTimeMs,
            outcome: action === 'accept' ? 'converted' : 'declined',
        },
    });

    // System message
    await prisma.chatMessage.create({
        data: {
            encounterId,
            senderType: 'system',
            content: action === 'accept'
                ? 'The doctor has accepted your consultation request. You can now chat.'
                : 'The doctor was unable to take this case. We will suggest alternative specialists.',
            contentType: 'system',
        },
    });

    return { success: true, responseTimeMs };
}

/**
 * Send a chat message with optional real-time translation.
 */
export async function sendChatMessage(
    encounterId: string,
    senderType: 'patient' | 'doctor',
    senderId: string,
    content: string,
    originalLanguage: string = 'en'
) {
    const encounter = await prisma.encounter.findUnique({
        where: { id: encounterId },
        select: { patientLanguage: true, doctorLanguage: true, status: true },
    });

    if (!encounter || encounter.status === 'completed' || encounter.status === 'declined') {
        throw new Error('Cannot send messages to this encounter');
    }

    // Determine if translation is needed
    const targetLanguage = senderType === 'patient'
        ? encounter.doctorLanguage
        : encounter.patientLanguage;

    let translatedText: string | null = null;

    if (originalLanguage !== targetLanguage && targetLanguage) {
        translatedText = await translateMessage(content, originalLanguage, targetLanguage);
    }

    const message = await prisma.chatMessage.create({
        data: {
            encounterId,
            senderType,
            senderId,
            content,
            contentType: 'text',
            originalLanguage,
            translatedText,
            translatedTo: translatedText ? targetLanguage : null,
        },
    });

    return {
        id: message.id,
        content: message.content,
        translatedText: message.translatedText,
        senderType: message.senderType,
        createdAt: message.createdAt,
    };
}

/**
 * Translate a message using LLM.
 */
async function translateMessage(
    text: string,
    from: string,
    to: string
): Promise<string | null> {
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    const apiBase = process.env.AI_API_BASE || 'https://api.openai.com/v1';

    if (!apiKey) return null;

    const langMap: Record<string, string> = {
        en: 'English', es: 'Spanish', hi: 'Hindi', ar: 'Arabic',
        sw: 'Swahili', pt: 'Portuguese', fr: 'French', de: 'German',
        ta: 'Tamil', te: 'Telugu', bn: 'Bengali', ur: 'Urdu',
    };

    try {
        const res = await fetch(`${apiBase}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.AI_MODEL || 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a medical translator. Translate the following message from ${langMap[from] || from} to ${langMap[to] || to}. Preserve medical terminology accuracy. Output ONLY the translation, nothing else.`,
                    },
                    { role: 'user', content: text },
                ],
                temperature: 0.3,
                max_tokens: 500,
            }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
    } catch {
        return null;
    }
}

/**
 * Get chat history for an encounter.
 */
export async function getChatHistory(encounterId: string) {
    return prisma.chatMessage.findMany({
        where: { encounterId, isDeleted: false },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            senderType: true,
            content: true,
            contentType: true,
            translatedText: true,
            translatedTo: true,
            originalLanguage: true,
            isRead: true,
            createdAt: true,
        },
    });
}
