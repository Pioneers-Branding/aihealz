import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Allow images from these domains
    remotePatterns: [
      // CDN and cloud storage
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Video thumbnails
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
      // Hospital and doctor image sources
      { protocol: 'https', hostname: '**.practo.com' },
      { protocol: 'https', hostname: 'practo.com' },
      { protocol: 'https', hostname: '**.justdial.com' },
      { protocol: 'https', hostname: '**.apollohospitals.com' },
      { protocol: 'https', hostname: '**.maxhealthcare.in' },
      { protocol: 'https', hostname: '**.fortishealthcare.com' },
      { protocol: 'https', hostname: '**.medanta.org' },
      { protocol: 'https', hostname: '**.manipalhospitals.com' },
      { protocol: 'https', hostname: '**.narayanahealth.org' },
      { protocol: 'https', hostname: '**.aiims.edu' },
      // Generic patterns for any medical site
      { protocol: 'https', hostname: '**.hospital.com' },
      { protocol: 'https', hostname: '**.healthcare.com' },
      // Wikipedia and other reference sites
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // Placeholder services
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      // Vercel blob storage
      { protocol: 'https', hostname: '**.vercel-storage.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      // Cloudflare
      { protocol: 'https', hostname: '**.cloudflare.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      // Medical image APIs
      { protocol: 'https', hostname: 'pollinations.ai' },
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      // Allow any HTTPS source as fallback (for user-submitted URLs)
      { protocol: 'https', hostname: '**' },
    ],
    // Image formats to generate
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    // Disable static image imports if not needed
    disableStaticImages: false,
  },

  // Enable strict mode for better debugging
  reactStrictMode: false,

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        // Cache static assets
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.aihealz.com' }],
        destination: 'https://aihealz.com/:path*',
        permanent: true,
      },
    ];
  },

  // Turbopack configuration (Next.js 15+ default bundler)
  turbopack: {
    resolveAlias: {
      // Polyfill Node.js modules for client-side
      fs: { browser: './src/lib/empty-module.js' },
      net: { browser: './src/lib/empty-module.js' },
      tls: { browser: './src/lib/empty-module.js' },
    },
  },
};

export default nextConfig;
