import { NextResponse } from 'next/server';

/**
 * Dynamic robots.txt
 *
 * Strategy:
 * - ALLOW high-value condition+city pages (primary crawl targets)
 * - ALLOW doctor profile pages
 * - DISALLOW search filters, API routes, admin pages
 * - DISALLOW duplicate parameter-based URLs to conserve crawl budget
 * - Point to sitemap index
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';

export async function GET() {
    const robotsTxt = `# aihealz.com — Robots.txt
# Optimized for crawl budget conservation

User-agent: *

# ── HIGH-VALUE: Allow condition + city pages ────────
Allow: /*/back-pain
Allow: /*/diabetes
Allow: /*/heart-disease
Allow: /*/*/*/  
Allow: /doctor/
Allow: /condition/

# ── DISALLOW: Internal and low-value paths ──────────
Disallow: /api/
Disallow: /admin/
Disallow: /provider/
Disallow: /_next/
Disallow: /static/
Disallow: /analyze

# ── DISALLOW: Search filters to save crawl budget ──
Disallow: /*?sort=
Disallow: /*?filter=
Disallow: /*?page=
Disallow: /*?lang=
Disallow: /*?ref=
Disallow: /*?utm_

# ── Crawl rate ──────────────────────────────────────
Crawl-delay: 1

# ── Sitemaps ────────────────────────────────────────
Sitemap: ${SITE_URL}/sitemap-index.xml

# ── Media bots (AI training opt-out) ────────────────
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: anthropic-ai
Disallow: /
`;

    return new NextResponse(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
    });
}
