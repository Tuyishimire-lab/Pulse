import type { Metadata } from 'next';
import { getSites } from '../lib/getSites';
import { getRadarStats } from '../lib/getRadarStats';
import { getMarqueeItems } from '../lib/getMarquee';
import { RadarStatsData, MarqueeItem } from '../types/radar';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.pulstraffic.com',
  },
};

/**
 * Server Component - fetches initial data server-side to eliminate
 * the client-side Supabase waterfall and reduce JS bundle size.
 * Uses getSites() which is the single source of truth for site data.
 */
export default async function Home() {
  // Fetch initial data in parallel directly without loopback HTTP fetches
  let initialRadarStats: RadarStatsData | null = null;
  let initialMarquee: MarqueeItem[] = [];

  const [initialSites, radarData, marqueeData] = await Promise.all([
    getSites(60),
    getRadarStats('global').catch(() => null),
    getMarqueeItems().catch(() => []),
  ]);

  if (radarData && radarData.success) {
    initialRadarStats = radarData;
  }
  if (Array.isArray(marqueeData) && marqueeData.length > 0) {
    initialMarquee = marqueeData;
  }

  return (
    <HomeClient
      initialSites={initialSites}
      initialRadarStats={initialRadarStats}
      initialMarquee={initialMarquee}
    />
  );
}
