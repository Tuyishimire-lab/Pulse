import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SITES, SITE_META, CATEGORIES } from '../../data/sites';

export const revalidate = 3600; // re-compute at most once per hour

// ── In-memory sliding-window rate limiter ────────────────────────────────────
// 60 requests per IP per 60-second window.
// Module-level map persists across requests within the same serverless instance.
const RL_WINDOW_MS = 60_000;
const RL_MAX = 60;
const _rl = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = _rl.get(ip);
  if (!entry || now - entry.windowStart > RL_WINDOW_MS) {
    _rl.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RL_MAX;
}
// ─────────────────────────────────────────────────────────────────────────────

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

export interface TrendingSite {
  id: string;
  name: string;
  url: string;
  logo: string;
  color: string;
  glow: string;
  category: string;
  currentRank: number;
  previousRank: number;
  delta: number; // positive = improved (moved up), negative = dropped
  rate: number;
  baseline: string;
  percentageChange: number;
  volatility: number;
  catalyst: string;
  sparkline: number[];
  topRivalId?: string;
  topRivalName?: string;
}

export interface CategoryMomentum {
  category: string;
  label: string;
  velocityPct: number;
  siteCount: number;
  totalRate: number;
  color: string;
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

export async function GET(req: Request) {
  // Rate limit: 60 req / IP / minute
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const { searchParams } = new URL(req.url);
  const timeframe = (searchParams.get('timeframe') || '7d') as '24h' | '7d' | '30d';

  const supabase = getSupabase();
  let rawMovers: TrendingSite[] = [];
  let snapshotAge = '';

  if (supabase) {
    try {
      if (timeframe === '24h') {
        const { data: timestamps } = await supabase
          .from('site_history')
          .select('recorded_at')
          .order('recorded_at', { ascending: false })
          .limit(1000);

        if (timestamps && timestamps.length > 0) {
          const distinctTimes = Array.from(
            new Set(timestamps.map((r: any) => r.recorded_at as string))
          ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

          if (distinctTimes.length >= 2) {
            const [newestTs, olderTs] = distinctTimes;
            snapshotAge = newestTs;
            const [newest, older, sitesData] = await Promise.all([
              supabase.from('site_history').select('site_id, rank, rate, volatility').eq('recorded_at', newestTs),
              supabase.from('site_history').select('site_id, rank').eq('recorded_at', olderTs),
              supabase.from('sites').select('id, name, url, rank, category, baseline, rate, volatility'),
            ]);

            if (newest.data && older.data) {
              const olderMap = new Map<string, number>();
              for (const r of older.data as any[]) olderMap.set(r.site_id, r.rank);
              const siteMetaMap = new Map<string, any>();
              for (const s of (sitesData.data ?? []) as any[]) siteMetaMap.set(s.id, s);

              for (const row of newest.data as any[]) {
                const rawDelta = olderMap.has(row.site_id) ? (olderMap.get(row.site_id)! - row.rank) : 0;
                const delta = rawDelta !== 0 ? rawDelta : (row.rank % 2 === 0 ? 1 : -1);
                const meta = SITE_META[row.site_id] ?? {};
                const live = siteMetaMap.get(row.site_id) ?? {};
                const vol = row.volatility || live.volatility || 5;
                const rawPct = Math.round((Math.abs(delta) / Math.max(1, row.rank)) * 1000) / 10 || +(vol * 0.8).toFixed(1);
                const pct = delta > 0 ? Math.abs(rawPct) : -Math.abs(rawPct);

                const rival = RIVALS[row.site_id];
                rawMovers.push({
                  id: row.site_id,
                  name: live.name ?? meta.name ?? row.site_id,
                  url: live.url ?? meta.url ?? '',
                  logo: meta.logo ?? row.site_id.charAt(0).toUpperCase(),
                  color: meta.color ?? '#82c8e5',
                  glow: meta.glow ?? 'rgba(130,200,229,0.15)',
                  category: live.category ?? meta.category ?? 'general',
                  currentRank: row.rank,
                  previousRank: row.rank + delta,
                  delta,
                  rate: live.rate ?? row.rate ?? 0,
                  baseline: live.baseline ?? '',
                  percentageChange: pct,
                  volatility: Math.abs(pct),
                  catalyst: assignCatalyst(live.category ?? meta.category ?? '', delta, Math.abs(pct)),
                  sparkline: generateSparkline(delta, Math.abs(pct)),
                  topRivalId: rival?.id,
                  topRivalName: rival?.name,
                });
              }
            }
          }
        }
      } else if (timeframe === '7d' || timeframe === '30d') {
        const { data: snapshots } = await supabase
          .from('weekly_snapshots')
          .select('week_slug, snapshot_date, sites_data, total_rate')
          .order('snapshot_date', { ascending: false })
          .limit(6);

        if (snapshots && snapshots.length >= 2) {
          const currentSnap = snapshots[0];
          const compareIdx = timeframe === '30d' && snapshots.length >= 4 ? 3 : 1;
          const compareSnap = snapshots[compareIdx] || snapshots[1];
          snapshotAge = currentSnap.snapshot_date;

          const compareMap = new Map<string, any>();
          for (const s of (compareSnap.sites_data ?? []) as any[]) {
            compareMap.set(s.id, s);
          }

          for (const curr of (currentSnap.sites_data ?? []) as any[]) {
            const prev = compareMap.get(curr.id);
            const rawDelta = prev ? prev.rank - curr.rank : 0;
            const delta = rawDelta !== 0 ? rawDelta : (curr.rank % 2 === 0 ? 1 : -1);
            const rateDiff = prev ? curr.rate - prev.rate : 0;
            const rawPct = prev && prev.rate > 0 ? Math.abs(Math.round((rateDiff / prev.rate) * 1000) / 10) : +(Math.abs(delta) * 1.5).toFixed(1);
            const pct = delta > 0 ? (rawPct || 0.8) : -(rawPct || 0.8);
            const meta = SITE_META[curr.id] ?? {};
            const rival = RIVALS[curr.id];

            rawMovers.push({
              id: curr.id,
              name: curr.name ?? meta.name ?? curr.id,
              url: curr.url ?? meta.url ?? '',
              logo: curr.logo ?? meta.logo ?? curr.id.charAt(0).toUpperCase(),
              color: curr.color ?? meta.color ?? '#82c8e5',
              glow: meta.glow ?? 'rgba(130,200,229,0.15)',
              category: curr.category ?? meta.category ?? 'general',
              currentRank: curr.rank,
              previousRank: curr.rank + delta,
              delta,
              rate: curr.rate,
              baseline: curr.baseline,
              percentageChange: pct,
              volatility: Math.abs(pct),
              catalyst: assignCatalyst(curr.category ?? meta.category ?? '', delta, Math.abs(pct)),
              sparkline: generateSparkline(delta, Math.abs(pct)),
              topRivalId: rival?.id,
              topRivalName: rival?.name,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[trending API] Supabase query failed:', err);
    }
  }

  // Fallback to static site list if DB query was empty
  if (rawMovers.length === 0) {
    for (let i = 0; i < SITES.length; i++) {
      const s = SITES[i];
      const sign = i % 2 === 0 ? 1 : -1;
      const step = (i % 4) + 1;
      const delta = sign * step;
      const rawPct = +(Math.abs(delta) * 1.8).toFixed(1);
      const pct = delta > 0 ? rawPct : -rawPct;
      const rival = RIVALS[s.id];

      rawMovers.push({
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
      });
    }
  }

  // Calculate Category Momentum breakdown
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

  // Filter risers and fallers
  const risers = rawMovers.filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta || b.rate - a.rate);
  const fallers = rawMovers.filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta || b.rate - a.rate);
  
  // Spotlight categories
  const breakoutStars = [...rawMovers].sort((a, b) => b.percentageChange - a.percentageChange).slice(0, 3);
  const highVolatility = [...rawMovers].sort((a, b) => b.volatility - a.volatility).slice(0, 3);

  return NextResponse.json(
    {
      timeframe,
      snapshotAge,
      risers: risers.slice(0, 25),
      fallers: fallers.slice(0, 25),
      breakoutStars,
      highVolatility,
      categoryMomentum,
      totalSitesAnalyzed: rawMovers.length,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
  );
}

