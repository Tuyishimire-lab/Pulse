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
};

export default nextConfig;

