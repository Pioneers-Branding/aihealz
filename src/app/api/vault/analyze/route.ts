import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * Health Vault File Analysis API
 *
 * POST /api/vault/analyze — Generate AI summary for a vault file
 *
 * Uses OpenRouter/AI API to analyze medical reports and generate
 * plain English summaries with urgency levels.
 */

const AI_API_BASE = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY;

interface AnalysisResult {
    summary: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    keyFindings: string[];
    recommendations: string[];
    confidence: number;
}

async function analyzeWithAI(fileName: string, fileType: string, ocrText: string | null): Promise<AnalysisResult> {
    // If no AI key, return a helpful default
    if (!AI_API_KEY) {
        return {
            summary: `This ${fileType.replace('_', ' ')} report (${fileName}) has been uploaded to your vault. AI analysis requires API configuration.`,
            urgency: 'routine',
            keyFindings: ['File successfully stored in your health vault'],
            recommendations: ['Consult with your healthcare provider for interpretation'],
            confidence: 0.5,
        };
    }

    const prompt = `You are a medical report analyzer. Analyze this medical document and provide a patient-friendly summary.

File: ${fileName}
Type: ${fileType}
${ocrText ? `Content preview: ${ocrText.substring(0, 2000)}` : 'No OCR text available - analyze based on file name and type'}

Respond in JSON format:
{
    "summary": "2-3 sentence plain English summary of what this report shows",
    "urgency": "routine|urgent|emergency",
    "keyFindings": ["finding 1", "finding 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "confidence": 0.0-1.0
}

Guidelines:
- Use simple, non-medical language a patient can understand
- Be reassuring but honest
- Flag anything that seems abnormal as "urgent"
- Only use "emergency" for life-threatening findings
- If you can't analyze well, set confidence < 0.7`;

    try {
        const response = await fetch(`${AI_API_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                summary: parsed.summary || 'Analysis complete',
                urgency: ['routine', 'urgent', 'emergency'].includes(parsed.urgency) ? parsed.urgency : 'routine',
                keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
                confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.8,
            };
        }

        // Fallback if JSON parsing fails
        return {
            summary: content.substring(0, 500) || 'Report analyzed successfully',
            urgency: 'routine',
            keyFindings: [],
            recommendations: ['Review with your healthcare provider'],
            confidence: 0.6,
        };

    } catch (error) {
        console.error('AI analysis error:', error);
        return {
            summary: `Your ${fileType.replace('_', ' ')} report has been stored. Automated analysis is temporarily unavailable.`,
            urgency: 'routine',
            keyFindings: ['File successfully uploaded'],
            recommendations: ['Please consult with a healthcare professional for interpretation'],
            confidence: 0.5,
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileId } = body;

        if (!fileId) {
            return NextResponse.json({ error: 'fileId required' }, { status: 400 });
        }

        // Get the vault file
        const vaultFile = await prisma.vaultFile.findUnique({
            where: { id: fileId },
            include: { vault: true },
        });

        if (!vaultFile) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Perform AI analysis
        const analysis = await analyzeWithAI(
            vaultFile.fileName,
            vaultFile.fileType,
            vaultFile.ocrText
        );

        // Create or update analysis result
        // VaultFile.analysisId points to AnalysisResult
        let analysisRecord = vaultFile.analysisId
            ? await prisma.analysisResult.findUnique({ where: { id: vaultFile.analysisId } })
            : null;

        if (analysisRecord) {
            analysisRecord = await prisma.analysisResult.update({
                where: { id: analysisRecord.id },
                data: {
                    plainEnglish: analysis.summary,
                    urgencyLevel: analysis.urgency,
                    confidenceScore: analysis.confidence,
                    fullDossier: {
                        keyFindings: analysis.keyFindings,
                        recommendations: analysis.recommendations,
                        analyzedAt: new Date().toISOString(),
                    },
                },
            });
        } else {
            analysisRecord = await prisma.analysisResult.create({
                data: {
                    sessionHash: vaultFile.vault.sessionHash,
                    plainEnglish: analysis.summary,
                    urgencyLevel: analysis.urgency,
                    confidenceScore: analysis.confidence,
                    fullDossier: {
                        keyFindings: analysis.keyFindings,
                        recommendations: analysis.recommendations,
                        analyzedAt: new Date().toISOString(),
                        fileType: vaultFile.fileType,
                    },
                },
            });
        }

        // Update vault file with analysis reference and mark as processed
        await prisma.vaultFile.update({
            where: { id: fileId },
            data: {
                analysisId: analysisRecord.id,
                aiSummary: analysis.summary,
                isProcessed: true,
            },
        });

        return NextResponse.json({
            success: true,
            analysis: {
                summary: analysis.summary,
                urgency: analysis.urgency,
                keyFindings: analysis.keyFindings,
                recommendations: analysis.recommendations,
                confidence: analysis.confidence,
            },
        });

    } catch (error) {
        console.error('Vault analysis error:', error);
        const message = error instanceof Error ? error.message : 'Analysis failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
