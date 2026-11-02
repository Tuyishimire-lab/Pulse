// Trending data for /trending — built ONLY from recorded rank snapshots.
//
// Sources (both written by /api/cron/daily-job):
//   - site_history      one row per site per cron run (~every 6h), pruned to the last 8 days
//   - weekly_snapshots  one full ranking per week (used for the ~30-day window, and 7d if history is short)
//
// Rules:
//   - A site only counts as a mover if its rank actually changed between two real snapshots.
//   - Sparklines are the site's real rank series inside the window.
//   - If there isn't enough history for a timeframe, it is marked unavailable — never padded or simulated.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SITES, SITE_META, CATEGORIES } from '../app/data/sites';
import { getCompareSlug } from '../app/compare/data/pairs';

export type Timeframe = '24h' | '7d' | '30d';

export interface TrendingSite {
  id: string;
  name: string;
  url: string;
  logo: string;
  color: string;
  category: string;
  currentRank: number;
  previousRank: number;
  /** Places moved: positive = climbed (rank number got smaller). */
  delta: number;
  rate: number;
  baseline: string;
  /** Standard deviation of rank within the window (places). Null when < 3 data points. */
  volatility: number | null;
  /** Real rank series (oldest → newest) inside the window. */
  sparkline: number[];
  rivalName?: string;
  rivalHref?: string;
}

export interface CategoryMomentum {
  category: string;
  label: string;
  /** Sum of places moved by sites in this category (rank deltas sum to ~0 across the index). */
  netPlaces: number;
  risers: number;
  fallers: number;
  siteCount: number;
  color: string;
}

export interface TrendingDataset {
  timeframe: Timeframe;
  available: boolean;
  /** Timestamp of the latest snapshot. */
  snapshotAt: string | null;
  /** Timestamp of the snapshot it is compared against. */
  comparedAt: string | null;
  /** Number of snapshots in the window used for sparklines / volatility. */
  pointsInWindow: number;
  totalSites: number;
  steadyCount: number;
  risers: TrendingSite[];
  fallers: TrendingSite[];
  biggestClimber: TrendingSite | null;
  mostVolatile: TrendingSite | null;
  categoryMomentum: CategoryMomentum[];
}

interface Snapshot {
  at: string;
  time: number;
  ranks: Map<string, number>;
}

interface LiveSiteRow {
  id: string;
  name: string;
  url: string;
  category: string;
  baseline: string;
  rate: number;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_LIST = 25;
const MAX_SPARK_POINTS = 28;

const CATEGORY_COLORS: Record<string, string> = {
  search: '#4285F4',
  social: '#E1306C',
  ai: '#10a37f',
  reference: '#72777D',
  ecommerce: '#ff9900',
  entertainment: '#e50914',
  news: '#ae251f',
  finance: '#f3ba2f',
  dev: '#6e7681',
};

const RIVALS: Record<string, string> = {
  google: 'bing', bing: 'google', youtube: 'tiktok', tiktok: 'youtube', facebook: 'x', x: 'facebook',
  instagram: 'tiktok', chatgpt: 'claude', claude: 'chatgpt', gemini: 'chatgpt', wikipedia: 'quora',
  amazon: 'walmart', walmart: 'target', target: 'walmart', ebay: 'amazon', reddit: 'quora',
  netflix: 'disneyplus', disneyplus: 'netflix', github: 'gitlab', gitlab: 'github', spotify: 'soundcloud',
  twitch: 'kick', kick: 'twitch', canva: 'figma', figma: 'canva', coinbase: 'binance', binance: 'coinbase',
  threads: 'bsky', bsky: 'threads', cursor: 'copilot', perplexity: 'chatgpt', deepseek: 'chatgpt',
  flipkart: 'amazon', temu: 'shein', shein: 'temu', suno: 'elevenlabs', lovable: 'v0', v0: 'lovable',
};

const CATALOG_IDS = new Set(SITES.map((s) => s.id));

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Groups site_history rows into snapshots (oldest → newest), dropping partial writes. */
export function groupHistory(rows: { recorded_at: string; site_id: string; rank: number }[]): Snapshot[] {
  const byTime = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (typeof r.rank !== 'number') continue;
    let m = byTime.get(r.recorded_at);
    if (!m) byTime.set(r.recorded_at, (m = new Map()));
    m.set(r.site_id, r.rank);
  }
  const snaps = [...byTime.entries()].map(([at, ranks]) => ({ at, time: new Date(at).getTime(), ranks }));
  const maxSize = Math.max(0, ...snaps.map((s) => s.ranks.size));
  return snaps
    .filter((s) => !Number.isNaN(s.time) && s.ranks.size >= maxSize * 0.5)
    .sort((a, b) => a.time - b.time);
}

async function fetchHistory(supabase: SupabaseClient): Promise<Snapshot[]> {
  const since = new Date(Date.now() - 9 * DAY).toISOString();
  const rows: { recorded_at: string; site_id: string; rank: number }[] = [];
  // PostgREST caps responses (default 1000 rows), so page through explicitly.
  for (let from = 0; from < 12000; from += 1000) {
    const { data, error } = await supabase
      .from('site_history')
      .select('recorded_at, site_id, rank')
      .not('rank', 'is', null)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })
      .order('site_id', { ascending: true })
      .range(from, from + 999);
    if (error || !data) break;
    rows.push(...(data as typeof rows));
    if (data.length < 1000) break;
  }
  return groupHistory(rows);
}

async function fetchWeekly(supabase: SupabaseClient): Promise<Snapshot[]> {
  const { data } = await supabase
    .from('weekly_snapshots')
    .select('snapshot_date, sites_data')
    .order('snapshot_date', { ascending: false })
    .limit(8);
  const snaps: Snapshot[] = [];
  for (const row of (data ?? []) as { snapshot_date: string; sites_data: { id: string; rank: number }[] | null }[]) {
    const ranks = new Map<string, number>();
    for (const s of row.sites_data ?? []) if (s?.id && typeof s.rank === 'number') ranks.set(s.id, s.rank);
    const time = new Date(row.snapshot_date).getTime();
    if (ranks.size > 0 && !Number.isNaN(time)) snaps.push({ at: row.snapshot_date, time, ranks });
  }
  const maxSize = Math.max(0, ...snaps.map((s) => s.ranks.size));
  return snaps
    .filter((s) => s.ranks.size >= maxSize * 0.8)
    .sort((a, b) => a.time - b.time);
}

/**
 * Picks the snapshot closest to (current - window), requiring it to be at least
 * `minCoverage * window` older than current. Returns null if none qualifies.
 */
export function pickBaseline(snaps: Snapshot[], current: Snapshot, windowMs: number, minCoverage: number): Snapshot | null {
  const target = current.time - windowMs;
  let best: Snapshot | null = null;
  for (const s of snaps) {
    if (s.time > current.time - windowMs * minCoverage) continue;
    if (!best || Math.abs(s.time - target) < Math.abs(best.time - target)) best = s;
  }
  return best;
}

function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const out: T[] = [];
  const step = (arr.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) out.push(arr[Math.round(i * step)]);
  return out;
}

function stdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
}

function emptyDataset(timeframe: Timeframe, snapshotAt: string | null, totalSites: number): TrendingDataset {
  return {
    timeframe, available: false, snapshotAt, comparedAt: null, pointsInWindow: 0, totalSites,
    steadyCount: 0, risers: [], fallers: [], biggestClimber: null, mostVolatile: null, categoryMomentum: [],
  };
}

export function buildDataset(
  timeframe: Timeframe,
  current: Snapshot,
  baseline: Snapshot | null,
  windowSnaps: Snapshot[],
  live: Map<string, LiveSiteRow>
): TrendingDataset {
  if (!baseline) return emptyDataset(timeframe, current.at, current.ranks.size);

  const series = [...windowSnaps.filter((s) => s.time >= baseline.time && s.time < current.time), current];
  const movers: TrendingSite[] = [];
  let steadyCount = 0;
  const catStats = new Map<string, { net: number; up: number; down: number; count: number }>();

  for (const [id, currentRank] of current.ranks) {
    const meta = SITE_META[id];
    const row = live.get(id);
    const category = row?.category ?? meta?.category ?? 'other';
    const stat = catStats.get(category) ?? { net: 0, up: 0, down: 0, count: 0 };
    stat.count++;
    catStats.set(category, stat);

    const previousRank = baseline.ranks.get(id);
    if (previousRank === undefined) continue; // new to the index in this window; no comparable rank
    const delta = previousRank - currentRank;
    stat.net += delta;
    if (delta === 0) { steadyCount++; continue; }
    if (delta > 0) stat.up++; else stat.down++;

    const ranks = series.map((s) => s.ranks.get(id)).filter((r): r is number => typeof r === 'number');
    const staticSite = SITES.find((s) => s.id === id);
    const rivalId = RIVALS[id];
    const hasRival = !!rivalId && CATALOG_IDS.has(rivalId);

    movers.push({
      id,
      name: row?.name ?? meta?.name ?? id,
      url: row?.url ?? meta?.url ?? '',
      logo: meta?.logo ?? id.charAt(0).toUpperCase(),
      color: meta?.color ?? '#82c8e5',
      category,
      currentRank,
      previousRank,
      delta,
      rate: row?.rate ?? staticSite?.rate ?? 0,
      baseline: row?.baseline ?? staticSite?.baseline ?? '',
      volatility: ranks.length >= 3 ? Math.round(stdDev(ranks) * 10) / 10 : null,
      sparkline: downsample(ranks, MAX_SPARK_POINTS),
      rivalName: hasRival ? SITE_META[rivalId]?.name ?? rivalId : undefined,
      rivalHref: hasRival ? `/compare/${getCompareSlug(id, rivalId)}` : undefined,
    });
  }

  const risers = movers.filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta || a.currentRank - b.currentRank);
  const fallers = movers.filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta || a.currentRank - b.currentRank);
  const mostVolatile = [...movers]
    .filter((m) => (m.volatility ?? 0) > 0)
    .sort((a, b) => (b.volatility ?? 0) - (a.volatility ?? 0) || a.currentRank - b.currentRank)[0] ?? null;

  const categoryMomentum: CategoryMomentum[] = CATEGORIES.filter((c) => c.id !== 'all')
    .map((c) => {
      const s = catStats.get(c.id) ?? { net: 0, up: 0, down: 0, count: 0 };
      return {
        category: c.id, label: c.label, netPlaces: s.net, risers: s.up, fallers: s.down,
        siteCount: s.count, color: CATEGORY_COLORS[c.id] ?? '#82c8e5',
      };
    })
    .filter((c) => c.siteCount > 0)
    .sort((a, b) => b.netPlaces - a.netPlaces);

  return {
    timeframe,
    available: true,
    snapshotAt: current.at,
    comparedAt: baseline.at,
    pointsInWindow: series.length,
    totalSites: current.ranks.size,
    steadyCount,
    risers: risers.slice(0, MAX_LIST),
    fallers: fallers.slice(0, MAX_LIST),
    biggestClimber: risers[0] ?? null,
    mostVolatile,
    categoryMomentum,
  };
}

export async function getTrendingData(): Promise<Record<Timeframe, TrendingDataset>> {
  const empty = {
    '24h': emptyDataset('24h', null, 0),
    '7d': emptyDataset('7d', null, 0),
    '30d': emptyDataset('30d', null, 0),
  };
  const supabase = getSupabase();
  if (!supabase) return empty;

  try {
    const [history, weekly, sitesRes] = await Promise.all([
      fetchHistory(supabase),
      fetchWeekly(supabase),
      supabase.from('sites').select('id, name, url, category, baseline, rate'),
    ]);
    const live = new Map<string, LiveSiteRow>();
    for (const r of (sitesRes.data ?? []) as LiveSiteRow[]) live.set(r.id, r);

    const current = history[history.length - 1] ?? weekly[weekly.length - 1];
    if (!current) return empty;

    // 24h: history only (needs ≥ 12h of coverage)
    const b24 = pickBaseline(history, current, DAY, 0.5);
    // 7d: history first (8-day retention), else the weekly snapshot (needs ≥ ~5 days)
    const b7h = pickBaseline(history, current, 7 * DAY, 0.7);
    const b7 = b7h ?? pickBaseline(weekly, current, 7 * DAY, 0.7);
    // ~30d: weekly snapshots (needs ≥ 21 days)
    const b30 = pickBaseline(weekly, current, 30 * DAY, 0.7);

    return {
      '24h': buildDataset('24h', current, b24, history, live),
      '7d': buildDataset('7d', current, b7, b7h ? history : weekly, live),
      '30d': buildDataset('30d', current, b30, weekly, live),
    };
  } catch (err) {
    console.warn('[trending] failed to load rank history:', err);
    return empty;
  }
}

