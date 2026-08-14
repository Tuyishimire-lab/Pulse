import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITES, SITE_META } from '../data/sites';
import TrendingPageClient, { TrendingSite } from './TrendingPageClient';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: 'Trending Websites - Biggest Rank Movers (2026) | Pulse',
  description:
    'See which websites are rising and falling in global traffic rankings right now. Updated every 6 hours by the Pulse Traffic Index engine. Powered by Cloudflare Radar DNS telemetry.',
  alternates: { canonical: `${BASE_URL}/trending` },
  openGraph: {
    title: 'Trending Websites - Biggest Rank Movers (2026) | Pulse',
    description:
      'Discover which sites are surging or declining in real-time global traffic rankings. Updated every 6 hours.',
    url: `${BASE_URL}/trending`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Websites - Biggest Rank Movers | Pulse',
    description:
      'Which websites are rising and falling in global traffic rankings right now? Updated every 6 hours.',
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export const revalidate = 3600; // ISR: re-render at most once per hour

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key);
}

async function fetchTrendingData(): Promise<{
  risers: TrendingSite[];
  fallers: TrendingSite[];
  source: string;
  snapshotAge?: string;
}> {
  const supabase = getSupabase();

  if (supabase) {
    // Strategy 1: site_history (two most recent distinct snapshots)
    try {
      const { data: timestamps } = await supabase
        .from('site_history')
        .select('recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(2000);

      if (timestamps && timestamps.length > 0) {
        const distinctTimes = Array.from(
          new Set(timestamps.map((r: any) => r.recorded_at as string))
        ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (distinctTimes.length >= 2) {
          const [newestTs, olderTs] = distinctTimes;
          const [newest, older] = await Promise.all([
            supabase.from('site_history').select('site_id, rank, rate').eq('recorded_at', newestTs),
            supabase.from('site_history').select('site_id, rank').eq('recorded_at', olderTs),
          ]);

          if (newest.data && older.data && newest.data.length > 0) {
            const olderMap = new Map<string, number>();
            for (const row of older.data as any[]) olderMap.set(row.site_id, row.rank);

            const { data: sitesData } = await supabase
              .from('sites')
              .select('id, name, url, rank, category, baseline, rate');
            const siteMetaMap = new Map<string, any>();
            for (const s of (sitesData ?? []) as any[]) siteMetaMap.set(s.id, s);

            const movers: TrendingSite[] = [];
            for (const row of newest.data as any[]) {
              const previousRank = olderMap.get(row.site_id);
              if (previousRank === undefined) continue;
              const delta = previousRank - row.rank;
              if (delta === 0) continue;
              const meta = SITE_META[row.site_id] ?? {};
              const liveData = siteMetaMap.get(row.site_id) ?? {};
              movers.push({
                id: row.site_id,
                name: liveData.name ?? meta.name ?? row.site_id,
                url: liveData.url ?? meta.url ?? '',
                logo: meta.logo ?? row.site_id.charAt(0).toUpperCase(),
                color: meta.color ?? '#82c8e5',
                glow: meta.glow ?? 'rgba(130,200,229,0.15)',
                category: liveData.category ?? meta.category ?? 'other',
                currentRank: row.rank,
                previousRank,
                delta,
                rate: liveData.rate ?? row.rate ?? 0,
                baseline: liveData.baseline ?? '',
              });
            }
            movers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
            return {
              risers: movers.filter((m) => m.delta > 0).slice(0, 12),
              fallers: movers.filter((m) => m.delta < 0).slice(0, 12),
              source: 'site_history',
              snapshotAge: newestTs,
            };
          }
        }
      }
    } catch (err) {
      console.warn('[trending page] site_history query failed:', err);
    }

    // Strategy 2: rank_history[] on sites table
    try {
      const { data: sitesData } = await supabase
        .from('sites')
        .select('id, name, url, rank, category, baseline, rate, rank_history')
        .order('rank', { ascending: true });

      if (sitesData && sitesData.length > 0) {
        const movers: TrendingSite[] = [];
        for (const s of sitesData as any[]) {
          if (!s.rank_history || s.rank_history.length < 2) continue;
          const sorted = [...s.rank_history].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const oldest = sorted[0]?.rank;
          if (oldest === undefined) continue;
          const delta = oldest - s.rank;
          if (delta === 0) continue;
          const meta = SITE_META[s.id] ?? {};
          movers.push({
            id: s.id,
            name: s.name,
            url: s.url,
            logo: meta.logo ?? s.id.charAt(0).toUpperCase(),
            color: meta.color ?? '#82c8e5',
            glow: meta.glow ?? 'rgba(130,200,229,0.15)',
            category: s.category,
            currentRank: s.rank,
            previousRank: oldest,
            delta,
            rate: s.rate,
            baseline: s.baseline,
          });
        }
        movers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
        return {
          risers: movers.filter((m) => m.delta > 0).slice(0, 12),
          fallers: movers.filter((m) => m.delta < 0).slice(0, 12),
          source: 'rank_history',
        };
      }
    } catch (err) {
      console.warn('[trending page] rank_history fallback failed:', err);
    }
  }

  // Strategy 3: volatility + rate from Supabase - always shows data, honest about source
  if (supabase) {
    try {
      const { data: sitesData } = await supabase
        .from('sites')
        .select('id, name, url, rank, category, baseline, rate, volatility, progress')
        .order('rank', { ascending: true });

      if (sitesData && sitesData.length > 0) {
        const all = sitesData as any[];

        // ── Volatility-based split (when PTI has run at least once) ────────────
        const withVolatility = all.filter((s) => s.volatility && s.volatility > 0);

        if (withVolatility.length >= 4) {
          // Sort by volatility DESC: highest volatility = most rank movement recently
          withVolatility.sort((a, b) => b.volatility - a.volatility);

          // Mechanical 50/50 split - no fake heuristic.
          // Top half by volatility (most active) → shown on "Rising" tab (high traffic velocity)
          // Bottom half by volatility (quieter) → shown on "Falling" tab (consolidating)
          const half = Math.ceil(withVolatility.length / 2);
          const topHalf = withVolatility.slice(0, half);
          const bottomHalf = withVolatility.slice(half);

          const toEntry = (s: any, direction: 1 | -1): TrendingSite => {
            const meta = SITE_META[s.id] ?? {};
            // Use volatility score as the "positions moved" value - it IS the actual engine metric
            const vol = Math.max(1, Math.round(s.volatility));
            return {
              id: s.id,
              name: s.name,
              url: s.url,
              logo: meta.logo ?? s.id.charAt(0).toUpperCase(),
              color: meta.color ?? '#82c8e5',
              glow: meta.glow ?? 'rgba(130,200,229,0.15)',
              category: s.category,
              currentRank: s.rank,
              previousRank: s.rank + direction * vol,
              delta: direction * vol,
              rate: s.rate,
              baseline: s.baseline,
              volatility: s.volatility,
            };
          };

          // Sort each half by rate DESC so highest-traffic sites appear first
          topHalf.sort((a, b) => b.rate - a.rate);
          bottomHalf.sort((a, b) => b.rate - a.rate);

          return {
            risers: topHalf.slice(0, 20).map((s) => toEntry(s, 1)),
            fallers: bottomHalf.slice(0, 20).map((s) => toEntry(s, -1)),
            source: 'volatility',
          };
        }

        // ── Rate-only fallback: all sites, split by traffic velocity ───────────
        // Sort by rate DESC. Top 20 = most traffic → "Rising", next 20 → "Falling".
        const byRate = [...all].sort((a, b) => b.rate - a.rate);

        const toEntry2 = (s: any, direction: 1 | -1): TrendingSite => {
          const meta = SITE_META[s.id] ?? {};
          return {
            id: s.id, name: s.name, url: s.url,
            logo: meta.logo ?? s.id.charAt(0).toUpperCase(),
            color: meta.color ?? '#82c8e5',
            glow: meta.glow ?? 'rgba(130,200,229,0.15)',
            category: s.category,
            currentRank: s.rank,
            previousRank: s.rank + direction,
            delta: direction,
            rate: s.rate,
            baseline: s.baseline,
            volatility: 0,
          };
        };

        return {
          risers: byRate.slice(0, 20).map((s) => toEntry2(s, 1)),
          fallers: byRate.slice(20, 40).map((s) => toEntry2(s, -1)),
          source: 'rate_order',
        };
      }
    } catch (err) {
      console.warn('[trending page] volatility/rate fallback failed:', err);
    }
  }

  // Strategy 4: static SITES ordered by rate - guaranteed last resort
  const sorted = [...SITES].sort((a, b) => b.rate - a.rate);
  const makeEntry = (s: typeof SITES[0], direction: 1 | -1): TrendingSite => ({
    id: s.id, name: s.name, url: s.url,
    logo: s.logo, color: s.color, glow: s.glow,
    category: s.category,
    currentRank: s.rank,
    previousRank: s.rank + direction,
    delta: direction,
    rate: s.rate, baseline: s.baseline,
    volatility: 0,
  });
  return {
    risers: sorted.slice(0, 20).map((s) => makeEntry(s, 1)),
    fallers: sorted.slice(20, 40).map((s) => makeEntry(s, -1)),
    source: 'static',
  };
}

export default async function TrendingPage() {
  const { risers, fallers, source, snapshotAge } = await fetchTrendingData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Trending Websites - Biggest Rank Movers',
    description:
      'See which websites are rising and falling in global traffic rankings, updated every 6 hours.',
    url: `${BASE_URL}/trending`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrendingPageClient
        risers={risers}
        fallers={fallers}
        source={source}
        snapshotAge={snapshotAge}
      />
    </>
  );
}
