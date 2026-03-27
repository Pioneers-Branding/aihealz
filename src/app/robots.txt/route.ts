import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com';

export async function GET() {
    const robotsTxt = `# aihealz.com — Robots.txt

User-agent: *

# ── ALLOW: All public pages ───────────────────────
Allow: /
Allow: /conditions/
Allow: /treatments/
Allow: /doctors/
Allow: /doctor/
Allow: /hospitals/
Allow: /insurance/
Allow: /diagnostic-labs/
Allow: /tests/
Allow: /symptoms
Allow: /remedies
Allow: /clinical-reference
Allow: /reference/
Allow: /healz-ai
Allow: /analyze
Allow: /tools/
Allow: /for-doctors/
Allow: /medical-travel
Allow: /chat/
Allow: /book/
Allow: /vault
Allow: /advertise/
Allow: /pricing
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms

# ── ALLOW: Localized condition + treatment pages ──
Allow: /*/*/*/
Allow: /*/*/treatments/

# ── DISALLOW: Internal and protected paths ────────
Disallow: /api/
Disallow: /admin/
Disallow: /provider/login
Disallow: /provider/forgot-password
Disallow: /provider/dashboard
Disallow: /provider/hospital/dashboard
Disallow: /provider/lab/dashboard
Disallow: /provider/medical-tourism/
Disallow: /_next/
Disallow: /static/
Disallow: /vault/dossier/
Disallow: /advertise/success

# ── DISALLOW: Query parameters to save crawl budget
Disallow: /*?sort=
Disallow: /*?filter=
Disallow: /*?page=
Disallow: /*?ref=
Disallow: /*?utm_
Disallow: /*?q=

# ── Crawl rate ────────────────────────────────────
Crawl-delay: 1

# ── Sitemaps ──────────────────────────────────────
Sitemap: ${SITE_URL}/sitemap.xml

# ── AI training opt-out ───────────────────────────
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

User-agent: Bytespider
Disallow: /

User-agent: ClaudeBot
Disallow: /
`;

    return new NextResponse(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
    });
}
