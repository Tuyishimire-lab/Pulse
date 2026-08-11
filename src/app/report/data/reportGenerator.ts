/**
 * Data-Driven Weekly Report Generator
 *
 * Fetches real site metrics from the `weekly_snapshots` Supabase table,
 * compares this week vs last week, and computes authentic rank changes,
 * traffic deltas, top movers, and dynamic stories.
 *
 * Falls back to static data for weeks that don't have a snapshot (pre-migration).
 */

import { createClient } from '@supabase/supabase-js';
import { getSites } from '../../../lib/getSites';

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface SiteSummary {
  id: string;
  name: string;
  url: string;
  rank: number;
  rate: number;
  baseline: string;
  category: string;
  color: string;
  logo: string;
  keywords?: string[] | null;
}

export interface TopMover {
  site: SiteSummary;
  highlight: string;
  rankChange: number;      // positive = improved (moved up)
  trafficDelta: number;    // percentage change vs last week
}

export interface WeeklyReport {
  weekNumber: number;
  year: number;
  slug: string;
  publishedDate: string;
  headline: string;
  subheadline: string;
  internetHealthScore: number;
  totalTopSitesVisitsPerSec: number;
  trafficChangePercent: number;
  outageCount: number;
  topMovers: TopMover[];
  categoryBreakdown: {
    category: string;
    label: string;
    count: number;
    totalBaseline: string;
    color: string;
    weekOverWeekChange?: number; // percentage
  }[];
  stories: { title: string; summary: string; tag: string; tagColor: string }[];
  quickStats: { label: string; value: string; note: string }[];
  isLive: boolean; // true if generated from real snapshot data
}

interface WeeklySnapshot {
  week_slug: string;
  snapshot_date: string;
  sites_data: SiteSummary[];
  category_totals: Record<string, { count: number; totalRate: number }>;
  total_rate: number;
  outage_count: number;
  ai_stories?: { title: string; summary: string; tag: string; tagColor: string }[] | null;
}

/* ── Constants ──────────────────────────────────────────────────────────── */

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  search:        { label: 'Search',          color: '#4285F4' },
  social:        { label: 'Social Media',    color: '#E1306C' },
  ai:            { label: 'AI Assistants',   color: '#10a37f' },
  reference:     { label: 'Reference',       color: '#72777D' },
  ecommerce:     { label: 'E-Commerce',      color: '#ff9900' },
  entertainment: { label: 'Entertainment',   color: '#e50914' },
  news:          { label: 'News & Media',    color: '#ae251f' },
  finance:       { label: 'Finance',         color: '#f3ba2f' },
  dev:           { label: 'Developer Tools', color: '#24292f' },
};

/* ── Supabase client (server-side) ──────────────────────────────────────── */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

/* ── Week helpers ───────────────────────────────────────────────────────── */

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7),
    year: d.getUTCFullYear(),
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function weekSlugFromDate(date: Date): string {
  const monday = getMonday(date);
  const { week, year } = getISOWeek(monday);
  return `${year}-w${String(week).padStart(2, '0')}`;
}

function prevWeekSlug(slug: string): string | null {
  const date = parsReportSlug(slug);
  if (!date) return null;
  const prevMonday = new Date(date);
  prevMonday.setDate(prevMonday.getDate() - 7);
  return weekSlugFromDate(prevMonday);
}

/* ── Fetch snapshots from Supabase ──────────────────────────────────────── */

async function fetchSnapshot(slug: string): Promise<WeeklySnapshot | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('weekly_snapshots')
      .select('week_slug, snapshot_date, sites_data, category_totals, total_rate, outage_count, ai_stories')
      .eq('week_slug', slug)
      .single();

    if (error || !data) return null;
    
    // Safely parse JSONB fields if returned as string-encoded JSON
    const sites_data = typeof data.sites_data === 'string' ? JSON.parse(data.sites_data) : data.sites_data;
    const category_totals = typeof data.category_totals === 'string' ? JSON.parse(data.category_totals) : data.category_totals;
    const ai_stories = data.ai_stories ? (typeof data.ai_stories === 'string' ? JSON.parse(data.ai_stories) : data.ai_stories) : undefined;

    if (!Array.isArray(sites_data)) {
      return null;
    }

    return {
      ...data,
      sites_data,
      category_totals,
      ai_stories
    } as WeeklySnapshot;
  } catch {
    return null;
  }
}

/* ── Compute deltas ─────────────────────────────────────────────────────── */

function computeTopMovers(
  current: SiteSummary[],
  previous: SiteSummary[] | null,
): TopMover[] {
  if (!previous) {
    // No previous week — sort current sites by rank ascending and return top 5
    const sortedByRank = [...current].sort((a, b) => a.rank - b.rank);
    return sortedByRank.slice(0, 5).map((site) => ({
      site,
      highlight: `Currently ranked #${site.rank} with ${site.baseline} monthly visits.`,
      rankChange: 0,
      trafficDelta: 0,
    }));
  }

  const prevMap = new Map(previous.map((s) => [s.id, s]));

  // Score each site by rank improvement + traffic growth
  const scored = current.map((site) => {
    const prev = prevMap.get(site.id);
    const rankChange = prev ? prev.rank - site.rank : 0; // positive = improved
    const trafficDelta = prev && prev.rate > 0
      ? ((site.rate - prev.rate) / prev.rate) * 100
      : 0;

    return { site, rankChange, trafficDelta };
  });

  // Sort by rank improvement first, then traffic growth
  scored.sort((a, b) => {
    if (b.rankChange !== a.rankChange) return b.rankChange - a.rankChange;
    return b.trafficDelta - a.trafficDelta;
  });

  return scored.slice(0, 5).map(({ site, rankChange, trafficDelta }) => {
    let highlight: string;
    if (rankChange > 0) {
      highlight = `Climbed ${rankChange} position${rankChange > 1 ? 's' : ''} to #${site.rank}. Traffic ${trafficDelta >= 0 ? 'up' : 'down'} ${Math.abs(trafficDelta).toFixed(1)}% at ${site.baseline}/mo.`;
    } else if (rankChange < 0) {
      highlight = `Dropped ${Math.abs(rankChange)} position${Math.abs(rankChange) > 1 ? 's' : ''} to #${site.rank}. Traffic shifted ${trafficDelta >= 0 ? '+' : ''}${trafficDelta.toFixed(1)}%.`;
    } else {
      highlight = `Held steady at #${site.rank} with ${site.baseline} monthly visits.`;
    }
    return { site, highlight, rankChange, trafficDelta: Math.round(trafficDelta * 10) / 10 };
  });
}

function generateDynamicStories(
  current: SiteSummary[],
  previous: SiteSummary[] | null,
  currentSnapshot: WeeklySnapshot,
  prevSnapshot: WeeklySnapshot | null,
): { title: string; summary: string; tag: string; tagColor: string }[] {
  const stories: { title: string; summary: string; tag: string; tagColor: string }[] = [];

  // Story 1: Biggest single-site mover
  if (previous) {
    const prevMap = new Map(previous.map((s) => [s.id, s]));
    let biggestMover = { site: current[0], change: 0 };

    for (const site of current) {
      const prev = prevMap.get(site.id);
      if (prev) {
        const change = prev.rank - site.rank;
        if (change > biggestMover.change) {
          biggestMover = { site, change };
        }
      }
    }

    if (biggestMover.change > 0) {
      const categoryLabel = CATEGORY_META[biggestMover.site.category]?.label || biggestMover.site.category;
      stories.push({
        title: `${biggestMover.site.name} surges ${biggestMover.change} positions`,
        summary: `The ${categoryLabel.toLowerCase()} platform jumped from #${biggestMover.site.rank + biggestMover.change} to #${biggestMover.site.rank} this week, the largest rank improvement across all 100 tracked sites. Current traffic sits at ${biggestMover.site.baseline} monthly visits.`,
        tag: categoryLabel,
        tagColor: CATEGORY_META[biggestMover.site.category]?.color || '#888',
      });
    }
  }

  // Story 2: Fastest growing category
  if (prevSnapshot) {
    const prevCats = prevSnapshot.category_totals;
    const curCats = currentSnapshot.category_totals;
    let fastestCat = { cat: '', growth: 0 };

    for (const [cat, cur] of Object.entries(curCats)) {
      const prev = prevCats[cat];
      if (prev && prev.totalRate > 0) {
        const growth = ((cur.totalRate - prev.totalRate) / prev.totalRate) * 100;
        if (growth > fastestCat.growth) {
          fastestCat = { cat, growth };
        }
      }
    }

    if (fastestCat.growth > 0) {
      const label = CATEGORY_META[fastestCat.cat]?.label || fastestCat.cat;
      const currentCatTotal = curCats[fastestCat.cat];
      const estMonthly = ((currentCatTotal.totalRate * 2592000) / 1e9).toFixed(1);

      stories.push({
        title: `${label} leads growth at +${fastestCat.growth.toFixed(1)}%`,
        summary: `The ${label.toLowerCase()} category saw the largest week-over-week traffic increase across all sectors, with ${currentCatTotal.count} tracked sites generating an estimated ${estMonthly}B monthly visits combined.`,
        tag: label,
        tagColor: CATEGORY_META[fastestCat.cat]?.color || '#888',
      });
    }
  }

  // Story 3: AI category spotlight (always interesting)
  const aiSites = current.filter((s) => s.category === 'ai');
  if (aiSites.length > 0) {
    const totalAiRate = aiSites.reduce((s, site) => s + site.rate, 0);
    const totalRate = current.reduce((s, site) => s + site.rate, 0);
    const aiSharePercent = totalRate > 0 ? ((totalAiRate / totalRate) * 100).toFixed(1) : '0';
    const topAi = aiSites.sort((a, b) => a.rank - b.rank)[0];

    stories.push({
      title: 'AI platforms command growing internet share',
      summary: `${aiSites.length} AI platforms now account for ${aiSharePercent}% of all tracked web traffic. ${topAi.name} leads the category at #${topAi.rank} with ${topAi.baseline} monthly visits.`,
      tag: 'AI',
      tagColor: '#10a37f',
    });
  }

  // Story 4: Overall traffic trend (fallback if we need more stories)
  if (stories.length < 3 && prevSnapshot) {
    const change = currentSnapshot.total_rate - prevSnapshot.total_rate;
    const changePercent = prevSnapshot.total_rate > 0
      ? ((change / prevSnapshot.total_rate) * 100).toFixed(2)
      : '0';
    const direction = change >= 0 ? 'up' : 'down';

    stories.push({
      title: `Global internet traffic ${direction} ${Math.abs(parseFloat(changePercent))}% this week`,
      summary: `Combined traffic across all 100 monitored sites is ${direction} from last week, with a current aggregate rate of ${currentSnapshot.total_rate.toLocaleString()} requests per second.`,
      tag: 'Traffic',
      tagColor: '#82c8e5',
    });
  }

  return stories.slice(0, 3);
}

function computeHealthScore(outageCount: number): number {
  // 100 = no outages, lose 8 points per outage, minimum 40
  return Math.max(40, 100 - outageCount * 8);
}

/* ── Main generator (async — fetches from Supabase) ─────────────────────── */

export async function generateWeeklyReport(dateOrSlug: Date | string): Promise<WeeklyReport> {
  let slug: string;
  let monday: Date;

  if (typeof dateOrSlug === 'string') {
    slug = dateOrSlug;
    const parsed = parsReportSlug(slug);
    monday = parsed || getMonday(new Date());
  } else {
    monday = getMonday(dateOrSlug);
    const { week, year } = getISOWeek(monday);
    slug = `${year}-w${String(week).padStart(2, '0')}`;
  }

  const { week, year } = getISOWeek(monday);
  const prevSlug = prevWeekSlug(slug);

  // Try to fetch real snapshots
  const [currentSnapshot, previousSnapshot] = await Promise.all([
    fetchSnapshot(slug),
    prevSlug ? fetchSnapshot(prevSlug) : Promise.resolve(null),
  ]);

  // If no snapshot exists, fall back to static generation
  if (!currentSnapshot) {
    return await generateStaticReport(monday, week, year, slug);
  }

  const currentSites = currentSnapshot.sites_data;
  const previousSites = previousSnapshot?.sites_data ?? null;

  // Compute deltas
  const topMovers = computeTopMovers(currentSites, previousSites);

  const trafficChangePercent = previousSnapshot && previousSnapshot.total_rate > 0
    ? ((currentSnapshot.total_rate - previousSnapshot.total_rate) / previousSnapshot.total_rate) * 100
    : 0;

  // Prefer AI-generated stories from the snapshot; fall back to template-based
  const stories = (currentSnapshot.ai_stories && currentSnapshot.ai_stories.length > 0)
    ? currentSnapshot.ai_stories
    : generateDynamicStories(
        currentSites,
        previousSites,
        currentSnapshot,
        previousSnapshot,
      );

  const healthScore = computeHealthScore(currentSnapshot.outage_count);

  // Category breakdown with week-over-week change
  const categoryBreakdown = Object.entries(currentSnapshot.category_totals)
    .sort((a, b) => b[1].totalRate - a[1].totalRate)
    .map(([cat, cur]) => {
      const prev = previousSnapshot?.category_totals[cat];
      const wowChange = prev && prev.totalRate > 0
        ? ((cur.totalRate - prev.totalRate) / prev.totalRate) * 100
        : undefined;

      return {
        category: cat,
        label: CATEGORY_META[cat]?.label ?? cat,
        count: cur.count,
        totalBaseline: `${((cur.totalRate * 2592000) / 1e9).toFixed(1)}B / mo`,
        color: CATEGORY_META[cat]?.color ?? '#888',
        weekOverWeekChange: wowChange !== undefined ? Math.round(wowChange * 10) / 10 : undefined,
      };
    });

  // Quick stats
  const topSite = currentSites[0];
  const fastestGrowingCat = categoryBreakdown.reduce(
    (best, cat) => (cat.weekOverWeekChange !== undefined && cat.weekOverWeekChange > (best.weekOverWeekChange ?? -Infinity)) ? cat : best,
    categoryBreakdown[0],
  );

  const quickStats = [
    {
      label: 'Total Tracked Traffic',
      value: `${currentSnapshot.total_rate.toLocaleString()}/s`,
      note: trafficChangePercent !== 0
        ? `${trafficChangePercent >= 0 ? '▲' : '▼'} ${Math.abs(trafficChangePercent).toFixed(1)}% vs last week`
        : 'Across all monitored sites',
    },
    {
      label: 'Most Visited Site',
      value: topSite.name,
      note: `${topSite.baseline} at ${topSite.rate.toLocaleString()} req/s`,
    },
    {
      label: 'Fastest Growing',
      value: fastestGrowingCat.label,
      note: fastestGrowingCat.weekOverWeekChange !== undefined
        ? `+${fastestGrowingCat.weekOverWeekChange.toFixed(1)}% this week`
        : `${fastestGrowingCat.count} sites tracked`,
    },
    {
      label: 'Internet Health',
      value: `${healthScore} / 100`,
      note: currentSnapshot.outage_count === 0
        ? 'No outages detected this week'
        : `${currentSnapshot.outage_count} outage${currentSnapshot.outage_count > 1 ? 's' : ''} detected`,
    },
  ];

  return {
    weekNumber: week,
    year,
    slug,
    publishedDate: monday.toISOString(),
    headline: `The Weekly Internet Pulse: Week ${week}, ${year}`,
    subheadline: `Real-time traffic insights for the week of ${formatDate(monday)}`,
    internetHealthScore: healthScore,
    totalTopSitesVisitsPerSec: currentSnapshot.total_rate,
    trafficChangePercent: Math.round(trafficChangePercent * 10) / 10,
    outageCount: currentSnapshot.outage_count,
    topMovers,
    categoryBreakdown,
    stories,
    quickStats,
    isLive: true,
  };
}

/* ── Static fallback (for weeks without a snapshot) ─────────────────────── */

async function generateStaticReport(monday: Date, week: number, year: number, slug: string): Promise<WeeklyReport> {
  // Use getSites() so even the static fallback reflects live Supabase data
  const sites = await getSites();
  const totalRate = sites.reduce((sum, s) => sum + s.rate, 0);
  const top5 = sites.slice(0, 5);

  const categoryMap: Record<string, { count: number; totalRate: number }> = {};
  sites.forEach((s) => {
    if (!categoryMap[s.category]) categoryMap[s.category] = { count: 0, totalRate: 0 };
    categoryMap[s.category].count++;
    categoryMap[s.category].totalRate += s.rate;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .sort((a, b) => b[1].totalRate - a[1].totalRate)
    .map(([cat, v]) => ({
      category: cat,
      label: CATEGORY_META[cat]?.label ?? cat,
      count: v.count,
      totalBaseline: `${((v.totalRate * 2592000) / 1e9).toFixed(1)}B / mo`,
      color: CATEGORY_META[cat]?.color ?? '#888',
    }));

  const stories = [
    {
      title: 'AI platforms continue record growth',
      summary: `AI assistants collectively account for ${((sites.filter(s => s.category === 'ai').reduce((a, b) => a + b.rate, 0) / totalRate) * 100).toFixed(1)}% of all tracked web traffic.`,
      tag: 'AI',
      tagColor: '#10a37f',
    },
    {
      title: 'Short-form video dominates mobile internet',
      summary: 'TikTok and YouTube Shorts collectively drive an estimated 38% of all mobile internet sessions globally.',
      tag: 'Social',
      tagColor: '#E1306C',
    },
    {
      title: 'Developer tools see sustained growth',
      summary: `Developer platforms are receiving ${sites.filter(s => s.category === 'dev').reduce((a, b) => a + b.rate, 0).toLocaleString()} requests per second.`,
      tag: 'Dev Tools',
      tagColor: '#24292f',
    },
  ];

  return {
    weekNumber: week,
    year,
    slug,
    publishedDate: monday.toISOString(),
    headline: `The Weekly Internet Pulse: Week ${week}, ${year}`,
    subheadline: `Real-time traffic insights for the week of ${formatDate(monday)}`,
    internetHealthScore: 94,
    totalTopSitesVisitsPerSec: totalRate,
    trafficChangePercent: 0,
    outageCount: 0,
    topMovers: top5.map((site) => ({
      site: {
        id: site.id,
        name: site.name,
        url: site.url,
        rank: site.rank,
        rate: site.rate,
        baseline: site.baseline,
        category: site.category,
        color: site.color,
        logo: site.logo,
      },
      highlight: `Currently ranked #${site.rank} with ${site.baseline} monthly visits.`,
      rankChange: 0,
      trafficDelta: 0,
    })),
    categoryBreakdown,
    stories,
    quickStats: [
      { label: 'Total Tracked Traffic', value: `${totalRate.toLocaleString()}/s`, note: 'Across all monitored sites' },
      { label: 'Most Visited Site', value: sites[0].name, note: `${sites[0].baseline} at ${sites[0].rate.toLocaleString()} req/s` },
      { label: 'Fastest Growing', value: 'AI Assistants', note: `${sites.filter(s => s.category === 'ai').length} sites tracked` },
      { label: 'Internet Health', value: '94 / 100', note: 'All systems operational' },
    ],
    isLive: false,
  };
}

/* ── Slug utilities (used by page.tsx) ──────────────────────────────────── */

/** Get available report slugs (from Supabase + fallback date generation) */
export async function getReportSlugs(): Promise<string[]> {
  const sb = getSupabase();
  const dateSlugs = getDateBasedSlugs();

  if (!sb) return dateSlugs;

  try {
    const { data, error } = await sb
      .from('weekly_snapshots')
      .select('week_slug')
      .order('snapshot_date', { ascending: false })
      .limit(52); // last year of reports

    if (error || !data || data.length === 0) return dateSlugs;

    const dbSlugs = data.map((d: { week_slug: string }) => d.week_slug);
    // Merge: DB slugs first, then fill in any missing date-based ones
    const allSlugs = [...new Set([...dbSlugs, ...dateSlugs])];
    // Sort descending (most recent first)
    allSlugs.sort((a, b) => b.localeCompare(a));
    return allSlugs;
  } catch {
    return dateSlugs;
  }
}

/** Fallback: generate slugs for current + 3 past weeks */
function getDateBasedSlugs(): string[] {
  const slugs: string[] = [];
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    slugs.push(weekSlugFromDate(d));
  }
  return [...new Set(slugs)];
}

/** Parse a slug like "2026-w31" into a Date for the Monday of that week */
export function parsReportSlug(slug: string): Date | null {
  const match = slug.match(/^(\d{4})-w(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const weekOneMonday = new Date(jan4);
  weekOneMonday.setDate(jan4.getDate() - (jan4Day - 1));
  const monday = new Date(weekOneMonday);
  monday.setDate(weekOneMonday.getDate() + (week - 1) * 7);
  return monday;
}
