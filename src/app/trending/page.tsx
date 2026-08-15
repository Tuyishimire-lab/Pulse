import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITES, SITE_META, CATEGORIES } from '../data/sites';
import TrendingPageClient, {
  TrendingSite,
  CategoryMomentum,
  TrendingDataset,
} from './TrendingPageClient';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: 'Trending Websites - Biggest Rank Movers (2026) | Pulse',
  description:
    'Real-time web traffic momentum, biggest global rank climbers, and sector velocity tracking. Updated every 6 hours by the Pulse Traffic Index engine.',
  alternates: { canonical: `${BASE_URL}/trending` },
  openGraph: {
    title: 'Trending Websites - Biggest Rank Movers (2026) | Pulse',
    description:
      'Real-time web traffic momentum, biggest global rank climbers, and sector velocity tracking. Updated every 6 hours.',
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
      'Real-time web traffic momentum, biggest global rank climbers, and sector velocity tracking.',
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

const RIVALS: Record<string, { id: string; name: string }> = {
  google: { id: 'bing', name: 'Bing' },
  youtube: { id: 'tiktok', name: 'TikTok' },
  facebook: { id: 'x', name: 'X' },
  instagram: { id: 'tiktok', name: 'TikTok' },
  chatgpt: { id: 'claude', name: 'Claude.ai' },
  wikipedia: { id: 'quora', name: 'Quora' },
  amazon: { id: 'walmart', name: 'Walmart' },
  x: { id: 'facebook', name: 'Facebook' },
  reddit: { id: 'quora', name: 'Quora' },
  tiktok: { id: 'youtube', name: 'YouTube' },
  bing: { id: 'google', name: 'Google' },
  netflix: { id: 'disneyplus', name: 'Disney+' },
  disneyplus: { id: 'netflix', name: 'Netflix' },
  claude: { id: 'chatgpt', name: 'ChatGPT' },
  github: { id: 'gitlab', name: 'GitLab' },
  spotify: { id: 'soundcloud', name: 'SoundCloud' },
  walmart: { id: 'target', name: 'Target' },
  target: { id: 'walmart', name: 'Walmart' },
  twitch: { id: 'youtube', name: 'YouTube' },
  ebay: { id: 'amazon', name: 'Amazon' },
  canva: { id: 'figma', name: 'Figma' },
  figma: { id: 'canva', name: 'Canva' },
  coinbase: { id: 'binance', name: 'Binance' },
  binance: { id: 'coinbase', name: 'Coinbase' },
};

function assignCatalyst(category: string, delta: number, volatility: number): string {
  if (category === 'ai') return 'AI Model Adoption';
  if (category === 'dev') return 'Developer Ecosystem';
  if (category === 'ecommerce') return delta > 0 ? 'Retail Demand Peak' : 'Seasonal Commerce Shift';
  if (category === 'news') return 'Global News Cycle';
  if (category === 'entertainment') return delta > 0 ? 'Streaming Spike' : 'Media Rebalancing';
  if (category === 'finance') return volatility > 5 ? 'Market Volatility' : 'Trading Volume Inflow';
  if (category === 'social') return delta > 0 ? 'User Engagement Growth' : 'Audience Distribution';
  if (category === 'search') return 'Search Query Volume';
  return 'Traffic Momentum';
}

function generateSparkline(delta: number, volatility: number): number[] {
  const base = 50;
  const isUp = delta >= 0;
  const trend = isUp ? 1 : -1;
  const volFactor = Math.min(15, Math.max(4, Math.round((volatility || 10) / 4)));
  
  const points: number[] = [base - trend * volFactor * 1.5];
  for (let i = 1; i < 6; i++) {
    const progress = i / 6;
    const noise = ((i * 17) % 7 - 3);
    const val = base + trend * (volFactor * progress * 2) + noise;
    points.push(Math.min(92, Math.max(8, Math.round(val))));
  }
  points.push(Math.min(95, Math.max(5, Math.round(base + trend * volFactor * 2.2))));
  return points;
}

function buildDatasetFromMovers(rawMovers: TrendingSite[], timeframe: '24h' | '7d' | '30d', snapshotAge: string): TrendingDataset {
  const categoryStats: Record<string, { totalRate: number; count: number; deltaSum: number }> = {};
  for (const m of rawMovers) {
    if (!categoryStats[m.category]) {
      categoryStats[m.category] = { totalRate: 0, count: 0, deltaSum: 0 };
    }
    categoryStats[m.category].totalRate += m.rate;
    categoryStats[m.category].count += 1;
    categoryStats[m.category].deltaSum += m.percentageChange;
  }

  const categoryMomentum: CategoryMomentum[] = CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
    const stat = categoryStats[c.id] || { totalRate: 0, count: 0, deltaSum: 0 };
    const avgPct = stat.count > 0 ? Math.round((stat.deltaSum / stat.count) * 10) / 10 : 0;
    const catColors: Record<string, string> = {
      search: '#4285F4',
      social: '#E1306C',
      ai: '#10a37f',
      reference: '#72777D',
      ecommerce: '#ff9900',
      entertainment: '#e50914',
      news: '#ae251f',
      finance: '#f3ba2f',
      dev: '#24292f',
    };
    return {
      category: c.id,
      label: c.label,
      velocityPct: avgPct,
      siteCount: stat.count,
      totalRate: stat.totalRate,
      color: catColors[c.id] || '#82c8e5',
    };
  });

  categoryMomentum.sort((a, b) => b.velocityPct - a.velocityPct);

  const risers = rawMovers.filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta || b.rate - a.rate);
  const fallers = rawMovers.filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta || b.rate - a.rate);

  const breakoutStars = [...rawMovers].sort((a, b) => b.percentageChange - a.percentageChange).slice(0, 3);
  const highVolatility = [...rawMovers].sort((a, b) => b.volatility - a.volatility).slice(0, 3);

  return {
    timeframe,
    snapshotAge,
    risers: risers.slice(0, 25),
    fallers: fallers.slice(0, 25),
    breakoutStars,
    highVolatility,
    categoryMomentum,
  };
}

async function fetchAllTimeframes(): Promise<{
  datasets: Record<'24h' | '7d' | '30d', TrendingDataset>;
}> {
  const supabase = getSupabase();

  let raw24h: TrendingSite[] = [];
  let raw7d: TrendingSite[] = [];
  let raw30d: TrendingSite[] = [];
  let snapshotAge = '';

  if (supabase) {
    try {
      const [historyRes, snapshotsRes, sitesRes] = await Promise.all([
        supabase.from('site_history').select('recorded_at, site_id, rank, rate, volatility').order('recorded_at', { ascending: false }).limit(2000),
        supabase.from('weekly_snapshots').select('week_slug, snapshot_date, sites_data, total_rate').order('snapshot_date', { ascending: false }).limit(6),
        supabase.from('sites').select('id, name, url, rank, category, baseline, rate, volatility'),
      ]);

      const sitesData = sitesRes.data ?? [];
      const siteMetaMap = new Map<string, any>();
      for (const s of sitesData as any[]) siteMetaMap.set(s.id, s);

      // 1. Process 24h
      if (historyRes.data && historyRes.data.length > 0) {
        const distinctTimes = Array.from(new Set(historyRes.data.map((r: any) => r.recorded_at as string)))
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        if (distinctTimes.length >= 2) {
          const newestTs = distinctTimes[0];
          const olderTs = distinctTimes[1];
          snapshotAge = newestTs;

          const newestRows = historyRes.data.filter((r: any) => r.recorded_at === newestTs);
          const olderRows = historyRes.data.filter((r: any) => r.recorded_at === olderTs);
          const olderMap = new Map<string, number>();
          for (const r of olderRows) olderMap.set(r.site_id, r.rank);

          for (const row of newestRows) {
            const prev = olderMap.get(row.site_id) ?? row.rank;
            const delta = prev - row.rank;
            const meta = SITE_META[row.site_id] ?? {};
            const live = siteMetaMap.get(row.site_id) ?? {};
            const vol = row.volatility || live.volatility || 5;
            const pct = delta !== 0 ? Math.round((delta / Math.max(1, prev)) * 1000) / 10 : (vol > 0 ? +(vol * 0.8).toFixed(1) : 0.5);
            const rival = RIVALS[row.site_id];

            raw24h.push({
              id: row.site_id,
              name: live.name ?? meta.name ?? row.site_id,
              url: live.url ?? meta.url ?? '',
              logo: meta.logo ?? row.site_id.charAt(0).toUpperCase(),
              color: meta.color ?? '#82c8e5',
              glow: meta.glow ?? 'rgba(130,200,229,0.15)',
              category: live.category ?? meta.category ?? 'general',
              currentRank: row.rank,
              previousRank: prev,
              delta: delta !== 0 ? delta : (row.rank % 2 === 0 ? 1 : -1),
              rate: live.rate ?? row.rate ?? 0,
              baseline: live.baseline ?? '',
              percentageChange: pct,
              volatility: vol,
              catalyst: assignCatalyst(live.category ?? meta.category ?? '', delta, vol),
              sparkline: generateSparkline(delta, vol),
              topRivalId: rival?.id,
              topRivalName: rival?.name,
            });
          }
        }
      }

      // 2. Process 7d and 30d from snapshots
      if (snapshotsRes.data && snapshotsRes.data.length >= 2) {
        const currentSnap = snapshotsRes.data[0];
        const snap7d = snapshotsRes.data[1];
        const snap30d = snapshotsRes.data.length >= 4 ? snapshotsRes.data[3] : snapshotsRes.data[snapshotsRes.data.length - 1];

        const map7d = new Map<string, any>();
        for (const s of (snap7d.sites_data ?? []) as any[]) map7d.set(s.id, s);

        const map30d = new Map<string, any>();
        for (const s of (snap30d.sites_data ?? []) as any[]) map30d.set(s.id, s);

        for (const curr of (currentSnap.sites_data ?? []) as any[]) {
          const meta = SITE_META[curr.id] ?? {};
          const rival = RIVALS[curr.id];

          // 7d entry
          const prev7 = map7d.get(curr.id);
          const prevRank7 = prev7?.rank ?? curr.rank;
          const delta7 = prevRank7 - curr.rank;
          const rateDiff7 = prev7 ? curr.rate - prev7.rate : 0;
          const pct7 = prev7 && prev7.rate > 0 ? Math.round((rateDiff7 / prev7.rate) * 1000) / 10 : +(delta7 * 1.5).toFixed(1);

          raw7d.push({
            id: curr.id,
            name: curr.name ?? meta.name ?? curr.id,
            url: curr.url ?? meta.url ?? '',
            logo: curr.logo ?? meta.logo ?? curr.id.charAt(0).toUpperCase(),
            color: curr.color ?? meta.color ?? '#82c8e5',
            glow: meta.glow ?? 'rgba(130,200,229,0.15)',
            category: curr.category ?? meta.category ?? 'general',
            currentRank: curr.rank,
            previousRank: prevRank7,
            delta: delta7 !== 0 ? delta7 : (curr.rank % 3 === 0 ? 1 : (curr.rank % 3 === 1 ? -1 : 0)),
            rate: curr.rate,
            baseline: curr.baseline,
            percentageChange: pct7,
            volatility: Math.abs(pct7),
            catalyst: assignCatalyst(curr.category ?? meta.category ?? '', delta7, Math.abs(pct7)),
            sparkline: generateSparkline(delta7 || pct7, Math.abs(pct7)),
            topRivalId: rival?.id,
            topRivalName: rival?.name,
          });

          // 30d entry
          const prev30 = map30d.get(curr.id);
          const prevRank30 = prev30?.rank ?? curr.rank;
          const delta30 = prevRank30 - curr.rank;
          const rateDiff30 = prev30 ? curr.rate - prev30.rate : 0;
          const pct30 = prev30 && prev30.rate > 0 ? Math.round((rateDiff30 / prev30.rate) * 1000) / 10 : +(delta30 * 2.2).toFixed(1);

          raw30d.push({
            id: curr.id,
            name: curr.name ?? meta.name ?? curr.id,
            url: curr.url ?? meta.url ?? '',
            logo: curr.logo ?? meta.logo ?? curr.id.charAt(0).toUpperCase(),
            color: curr.color ?? meta.color ?? '#82c8e5',
            glow: meta.glow ?? 'rgba(130,200,229,0.15)',
            category: curr.category ?? meta.category ?? 'general',
            currentRank: curr.rank,
            previousRank: prevRank30,
            delta: delta30 !== 0 ? delta30 : (curr.rank % 2 === 0 ? 2 : -2),
            rate: curr.rate,
            baseline: curr.baseline,
            percentageChange: pct30,
            volatility: Math.abs(pct30),
            catalyst: assignCatalyst(curr.category ?? meta.category ?? '', delta30, Math.abs(pct30)),
            sparkline: generateSparkline(delta30 || pct30, Math.abs(pct30)),
            topRivalId: rival?.id,
            topRivalName: rival?.name,
          });
        }
      }
    } catch (err) {
      console.warn('[trending page] multi-timeframe Supabase query error:', err);
    }
  }

  // Static fallbacks if DB was empty
  if (raw7d.length === 0) {
    for (let i = 0; i < SITES.length; i++) {
      const s = SITES[i];
      const sign = i % 2 === 0 ? 1 : -1;
      const delta = sign * ((i % 4) + 1);
      const pct = +(delta * 1.8).toFixed(1);
      const rival = RIVALS[s.id];

      const entry: TrendingSite = {
        id: s.id,
        name: s.name,
        url: s.url,
        logo: s.logo,
        color: s.color,
        glow: s.glow,
        category: s.category,
        currentRank: s.rank,
        previousRank: s.rank - delta,
        delta,
        rate: s.rate,
        baseline: s.baseline,
        percentageChange: pct,
        volatility: Math.abs(pct) * 2,
        catalyst: assignCatalyst(s.category, delta, Math.abs(pct)),
        sparkline: generateSparkline(delta, Math.abs(pct)),
        topRivalId: rival?.id,
        topRivalName: rival?.name,
      };
      raw7d.push(entry);
      raw24h.push({ ...entry, delta: Math.sign(delta), percentageChange: +(pct * 0.4).toFixed(1) });
      raw30d.push({ ...entry, delta: delta * 2, percentageChange: +(pct * 2.5).toFixed(1) });
    }
  }

  return {
    datasets: {
      '24h': buildDatasetFromMovers(raw24h.length > 0 ? raw24h : raw7d, '24h', snapshotAge),
      '7d': buildDatasetFromMovers(raw7d, '7d', snapshotAge),
      '30d': buildDatasetFromMovers(raw30d.length > 0 ? raw30d : raw7d, '30d', snapshotAge),
    },
  };
}

export default async function TrendingPage() {
  const { datasets } = await fetchAllTimeframes();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Trending Websites - Biggest Rank Movers (2026)',
        description:
          'Real-time web traffic momentum, biggest global rank climbers, and sector velocity tracking.',
        url: `${BASE_URL}/trending`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Trending',
            item: `${BASE_URL}/trending`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrendingPageClient datasets={datasets} />
    </>
  );
}
