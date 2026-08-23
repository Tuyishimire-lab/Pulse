import { getSites } from '../lib/getSites';
import HomeClient from './HomeClient';

/**
 * Server Component - fetches initial data server-side to eliminate
 * the client-side Supabase waterfall and reduce JS bundle size.
 * Uses getSites() which is the single source of truth for site data.
 */
export default async function Home() {
  // ── Server-side data fetching ──────────────────────────────────────────
  let initialRadarStats: any = null;
  let initialMarquee: { text: string; type: string; asns?: number[]; locations?: string[] }[] = [];

  // Fetch sites via unified data layer (Supabase → sites.ts fallback)
  const initialSites = await getSites(60);

  // Fetch radar stats and marquee data in parallel
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const [radarRes, marqueeRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/radar-stats`, { next: { revalidate: 300 } }),
      fetch(`${baseUrl}/api/marquee`, { next: { revalidate: 60 } }),
    ]);

    if (radarRes.status === 'fulfilled' && radarRes.value.ok) {
      const data = await radarRes.value.json();
      if (data && data.success) initialRadarStats = data;
    }

    if (marqueeRes.status === 'fulfilled' && marqueeRes.value.ok) {
      const data = await marqueeRes.value.json();
      if (Array.isArray(data) && data.length > 0) initialMarquee = data;
    }
  } catch (err) {
    // Non-critical - client will re-fetch on mount
    console.warn('Server: Failed to pre-fetch radar/marquee data:', err);
  }

  return (
    <HomeClient
      initialSites={initialSites}
      initialRadarStats={initialRadarStats}
      initialMarquee={initialMarquee}
    />
  );
}
