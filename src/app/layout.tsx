import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ContextualFooter from '@/components/contextual-footer';
import GeoAutoDetect from '@/components/geo-auto-detect';
import AIGuide from '@/components/ui/ai-guide';
import CookieConsent from '@/components/ui/cookie-consent';
import NavbarWrapper from '@/components/ui/navbar-wrapper';
import WhatsAppCTA from '@/components/ui/whatsapp-cta';
import { DefaultSiteSchemas } from '@/lib/structured-data';
import './globals.css';



export const metadata: Metadata = {
  title: {
    template: '%s | aihealz',
    default: 'aihealz — AI-Powered Medical Directory',
  },
  description:
    'Find verified doctors, understand medical conditions, and get AI-powered report analysis. Trusted by millions across the globe.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aihealz.com'),
  verification: {
    google: 't79pGq0m5lWEyNC3b8Vto1z6YVgRTDAt9AV55i1ez1g',
  },
  openGraph: {
    type: 'website',
    siteName: 'aihealz',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-N698KG2Z');`}
        </Script>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NGENLNWQL1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NGENLNWQL1');`}
        </Script>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N698KG2Z"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* ── Skip Link for Accessibility ──────────── */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>

        {/* ── Structured Data for AI/Voice/Search ───── */}
        <DefaultSiteSchemas />

        {/* ── Geo Auto-Detection ───────────────────── */}
        <GeoAutoDetect />

        {/* ── Navigation ─────────────────────────────── */}
        <NavbarWrapper />

        {/* ── Main Content ───────────────────────────── */}
        <main id="main-content" className="flex-1 pt-16" role="main">
          {children}
        </main>

        {/* ── Global Interactive AI Guide ─────────────── */}
        <AIGuide />

        {/* ── Global WhatsApp CTA ────────────────────── */}
        <WhatsAppCTA />

        {/* ── Contextual Footer ──────────────────────── */}
        <ContextualFooter />

        {/* ── Cookie Consent Banner ───────────────────── */}
        <CookieConsent />
      </body>
    </html>
  );
}
