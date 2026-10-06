import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },

  async redirects() {
    return [
      // ── Canonical origin enforcement ──────────────────────────────────────
      // Both rules run at the edge BEFORE cache lookup and before proxy.ts.
      // Using permanent (308) so browsers + search engines cache it forever.

      // 1. apex → www  (pulstraffic.com → www.pulstraffic.com)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'pulstraffic.com' }],
        destination: 'https://www.pulstraffic.com/:path*',
        permanent: true,
        basePath: false,
      },

      // 2. http → https  (catches www + apex on plain http)
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://www.pulstraffic.com/:path*',
        permanent: true,
        basePath: false,
      },
    ];
  },

  async headers() {
    return [
      {
        // Global security headers for all standard routes
        source: '/((?!embed).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://www.google.com https://*.supabase.co; connect-src 'self' https://*.supabase.co https://api.cloudflare.com https://api.openpagerank.com https://api.groq.com; frame-ancestors 'none';",
          },
        ],
      },
      {
        // Embed routes allow embedding from any parent site
        source: '/embed/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
    ];
  },
};

export default nextConfig;

