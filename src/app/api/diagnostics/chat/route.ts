import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const AI_API_BASE = process.env.AI_API_BASE || 'https://openrouter.ai/api/v1';
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'anthropic/claude-sonnet-4';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], testSlug, providerSlug } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Gather context about the test or provider if specified
    let testContext = '';
    let providerContext = '';

    if (testSlug) {
      const test = await prisma.diagnosticTest.findUnique({
        where: { slug: testSlug },
        select: {
          name: true,
          shortName: true,
          description: true,
          sampleType: true,
          fastingRequired: true,
          fastingHours: true,
          preparationInstructions: true,
          reportTimeHours: true,
          normalRanges: true,
          relatedConditions: true,
          homeCollectionPossible: true,
          avgPriceInr: true,
          category: { select: { name: true } },
        },
      });

      if (test) {
        testContext = `
Current Test Information:
- Name: ${test.name} (${test.shortName || ''})
- Category: ${test.category.name}
- Description: ${test.description || 'N/A'}
- Sample Type: ${test.sampleType || 'N/A'}
- Fasting Required: ${test.fastingRequired ? `Yes (${test.fastingHours || 8}-12 hours)` : 'No'}
- Preparation: ${test.preparationInstructions || 'No special preparation needed'}
- Report Time: ${test.reportTimeHours ? (test.reportTimeHours < 24 ? `${test.reportTimeHours} hours` : `${Math.round(test.reportTimeHours / 24)} days`) : 'Varies'}
- Home Collection: ${test.homeCollectionPossible ? 'Available' : 'Visit lab required'}
- Average Price: ${test.avgPriceInr ? `₹${Number(test.avgPriceInr).toLocaleString('en-IN')}` : 'Contact lab'}
- Related Conditions: ${test.relatedConditions?.join(', ') || 'N/A'}
- Normal Ranges: ${test.normalRanges ? JSON.stringify(test.normalRanges) : 'Consult lab report'}
`;
      }
    }

    if (providerSlug) {
      const provider = await prisma.diagnosticProvider.findUnique({
        where: { slug: providerSlug },
        select: {
          name: true,
          providerType: true,
          description: true,
          address: true,
          phone: true,
          accreditations: true,
          homeCollectionAvailable: true,
          homeCollectionFee: true,
          onlineReportsAvailable: true,
          rating: true,
          reviewCount: true,
        },
      });

      if (provider) {
        providerContext = `
Lab/Provider Information:
- Name: ${provider.name}
- Type: ${provider.providerType}
- Description: ${provider.description || 'N/A'}
- Address: ${provider.address || 'N/A'}
- Phone: ${provider.phone || 'N/A'}
- Accreditations: ${provider.accreditations?.join(', ') || 'N/A'}
- Home Collection: ${provider.homeCollectionAvailable ? `Yes (Fee: ₹${Number(provider.homeCollectionFee || 0)})` : 'No'}
- Online Reports: ${provider.onlineReportsAvailable ? 'Yes' : 'No'}
- Rating: ${provider.rating ? `${Number(provider.rating).toFixed(1)}/5 (${provider.reviewCount} reviews)` : 'N/A'}
`;
      }
    }

    // Search for relevant tests based on the user's message
    let searchContext = '';
    const searchTerms = message.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);

    if (searchTerms.length > 0 && !testSlug) {
      const relevantTests = await prisma.diagnosticTest.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchTerms[0], mode: 'insensitive' } },
            { shortName: { contains: searchTerms[0], mode: 'insensitive' } },
            { aliases: { hasSome: searchTerms } },
            { keywords: { hasSome: searchTerms } },
          ],
        },
        select: {
          name: true,
          shortName: true,
          slug: true,
          sampleType: true,
          avgPriceInr: true,
          homeCollectionPossible: true,
        },
        take: 5,
      });

      if (relevantTests.length > 0) {
        searchContext = `
Relevant Tests Found:
${relevantTests
  .map(
    (t) =>
      `- ${t.name} (${t.shortName || t.slug}): ${t.sampleType || 'N/A'} sample, ${
        t.avgPriceInr ? `₹${Number(t.avgPriceInr).toLocaleString('en-IN')}` : 'Price varies'
      }, ${t.homeCollectionPossible ? 'Home collection available' : 'Visit lab'}`
  )
  .join('\n')}
`;
      }
    }

    const systemPrompt = `You are a helpful medical diagnostics assistant for aihealz.com. You help users understand lab tests, diagnostic procedures, and guide them to book tests.

Your capabilities:
1. Explain what different lab tests measure and why they're done
2. Provide information about test preparation (fasting, medications to avoid, etc.)
3. Explain normal ranges and what abnormal results might indicate
4. Recommend appropriate tests based on symptoms (but always suggest consulting a doctor)
5. Help users understand when they should get tested
6. Provide information about home collection options and pricing

Guidelines:
- Be concise but informative
- Always recommend consulting a healthcare provider for medical advice
- If you don't know something specific, say so clearly
- Provide pricing information when available
- Mention home collection availability when relevant
- Never diagnose conditions - only explain what tests measure
- Use simple language that patients can understand
- When suggesting tests, mention the test name and brief purpose

${testContext}
${providerContext}
${searchContext}
`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call AI API
    const response = await fetch(`${AI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
        'HTTP-Referer': 'https://aihealz.com',
        'X-Title': 'AIHealz Diagnostic Chat',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
