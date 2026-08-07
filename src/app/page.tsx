import { createClient } from '@supabase/supabase-js';
import { SiteConfig } from './data/sites';
import HomeClient from './HomeClient';

/**
 * Server Component — fetches initial data server-side to eliminate
 * the client-side Supabase waterfall and reduce JS bundle size.
 */
export default async function Home() {
  // ── Server-side data fetching ──────────────────────────────────────────
  let initialSites: SiteConfig[] = [];
  let initialRadarStats: any = null;
  let initialMarquee: { text: string; type: string; asns?: number[]; locations?: string[] }[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  // Fetch sites from Supabase
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('sites')
        .select('id, name, url, rank, category, baseline, baseline_raw, rate, logo, color, glow, progress, asn, keywords, rank_history')
        .order('rank', { ascending: true });

      if (!error && data && data.length > 0) {
        // Map baseline_raw (DB snake_case) → baselineRaw (SiteConfig camelCase)
        initialSites = data.map((row: any) => ({
          ...row,
          baselineRaw: row.baseline_raw ?? 0,
        })) as SiteConfig[];
      }
    } catch (err) {
      console.error('Server: Failed to fetch sites from Supabase:', err);
    }
  }

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
    // Non-critical — client will re-fetch on mount
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
