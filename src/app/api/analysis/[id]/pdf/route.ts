import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/analysis/[id]/pdf
 *
 * Generates a branded "aihealz Pre-Consultation Summary" PDF.
 * Returns HTML that can be printed to PDF by the browser (window.print())
 * or server-rendered via Puppeteer in production.
 *
 * The HTML is specifically designed for A4 printing with proper margins,
 * branding, and a clean medical document aesthetic.
 */

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = await params;

    const analysis = await prisma.analysisResult.findUnique({
        where: { id },
    });

    if (!analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const dossier = analysis.fullDossier as Record<string, unknown>;
    const indicators = (dossier.indicators || analysis.primaryIndicators || []) as Array<{
        name: string; value: string; normalRange: string; severity: string; explanation: string;
    }>;
    const questions = (dossier.questionsToAsk || analysis.questionsToAsk || []) as string[];
    const lifestyle = (dossier.lifestyleFactors || analysis.lifestyleFactors || []) as string[];
    const urgency = (dossier.urgency || { level: analysis.urgencyLevel, message: '' }) as { level: string; message: string };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>aihealz Pre-Consultation Summary</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
      font-size: 11pt;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 20pt;
      font-weight: 700;
      background: linear-gradient(135deg, #4f46e5, #059669);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .date { color: #6b7280; font-size: 9pt; }
    .title {
      font-size: 16pt;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 10pt;
      color: #6b7280;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 600;
      color: #4f46e5;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }
    .summary { font-size: 11pt; color: #374151; }
    .urgency {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .urgency-routine { background: #d1fae5; color: #065f46; }
    .urgency-urgent { background: #fef3c7; color: #92400e; }
    .urgency-emergency { background: #fee2e2; color: #991b1b; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 10pt;
    }
    th {
      background: #f8fafc;
      text-align: left;
      padding: 8px;
      border-bottom: 2px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #f3f4f6;
    }
    .severity-normal { color: #059669; }
    .severity-borderline { color: #d97706; }
    .severity-high { color: #ea580c; }
    .severity-critical { color: #dc2626; font-weight: 600; }
    ol, ul { padding-left: 20px; }
    li { margin-bottom: 6px; color: #374151; }
    .disclaimer {
      margin-top: 24px;
      padding: 12px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 8pt;
      color: #6b7280;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 8pt;
      color: #9ca3af;
    }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="brand">aihealz</span>
    <span class="date">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </div>

  <h1 class="title">Pre-Consultation Summary</h1>
  <p class="subtitle">Reference ID: ${id.substring(0, 8).toUpperCase()}</p>

  <span class="urgency urgency-${urgency.level}">${urgency.level}</span>

  <div class="section">
    <h2 class="section-title">What Your Report Shows</h2>
    <p class="summary">${analysis.plainEnglish || 'Summary not available.'}</p>
  </div>

  ${indicators.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Key Findings</h2>
    <table>
      <thead>
        <tr><th>Indicator</th><th>Your Value</th><th>Normal Range</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${indicators.map((ind) => `
        <tr>
          <td>${ind.name}</td>
          <td><strong>${ind.value}</strong></td>
          <td>${ind.normalRange || 'N/A'}</td>
          <td class="severity-${ind.severity}">${ind.severity}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${questions.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Questions for Your Doctor</h2>
    <ol>
      ${questions.map((q: string) => `<li>${q}</li>`).join('')}
    </ol>
  </div>` : ''}

  ${lifestyle.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Lifestyle Considerations</h2>
    <ul>
      ${lifestyle.map((l: string) => `<li>${l}</li>`).join('')}
    </ul>
  </div>` : ''}

  <div class="section">
    <h2 class="section-title">Recommended Specialist</h2>
    <p>${analysis.specialtyRequired || 'General Physician'}</p>
  </div>

  <div class="disclaimer">
    This summary is generated by AI for informational purposes only. It does not constitute
    medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
    Confidence score: ${Number(analysis.confidenceScore).toFixed(0)}%.
  </div>

  <div class="footer">
    <p>aihealz.com &mdash; AI-Powered Medical Intelligence</p>
    <p>This document was generated on ${new Date().toISOString().split('T')[0]} and is valid for reference purposes only.</p>
  </div>

  <button class="no-print" onclick="window.print()" style="
    position: fixed; bottom: 20px; right: 20px; padding: 12px 24px;
    background: #4f46e5; color: white; border: none; border-radius: 8px;
    cursor: pointer; font-size: 14px; font-weight: 600;">
    Download PDF
  </button>
</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'private, no-store',
        },
    });
}
