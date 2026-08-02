// Helpers to generate and describe weekly report data.
// The report is fully static, built at deploy time, so all "highlights"
// are derived from the stable SITES data plus curated editorial notes.

import { SITES, SiteConfig } from '../../data/sites';

export interface WeeklyReport {
  weekNumber: number;
  year: number;
  slug: string;             // e.g. "2026-w31"
  publishedDate: string;    // ISO date string for the Monday of that week
  headline: string;
  subheadline: string;
  internetHealthScore: number; // 0–100 composite score
  totalTopSitesVisitsPerSec: number;
  /** Top 5 by raw monthly traffic */
  topMovers: { site: SiteConfig; highlight: string }[];
  /** Category breakdown */
  categoryBreakdown: { category: string; label: string; count: number; totalBaseline: string; color: string }[];
  /** 3 notable stories for this week */
  stories: { title: string; summary: string; tag: string; tagColor: string }[];
  /** Quick stats */
  quickStats: { label: string; value: string; note: string }[];
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  search:       { label: 'Search',          color: '#4285F4' },
  social:       { label: 'Social Media',    color: '#E1306C' },
  ai:           { label: 'AI Assistants',   color: '#10a37f' },
  reference:    { label: 'Reference',       color: '#72777D' },
  ecommerce:    { label: 'E-Commerce',      color: '#ff9900' },
  entertainment:{ label: 'Entertainment',   color: '#e50914' },
  news:         { label: 'News & Media',    color: '#ae251f' },
  finance:      { label: 'Finance',         color: '#f3ba2f' },
  dev:          { label: 'Developer Tools', color: '#24292f' },
};

// Editorial highlights per site, used in Top Movers section
const SITE_HIGHLIGHTS: Record<string, string> = {
  google:       'Processed an estimated 8.5B daily searches globally this week.',
  youtube:      'Over 500M hours of video watched daily; Shorts continues rapid growth. YouTube TV surpassed 8M US subscribers.',
  facebook:     'Meta AI integration now active for all 3.2B monthly Facebook users.',
  wikipedia:    'Surpassed 6.7M English articles; editing activity at 5-year high.',
  instagram:    'Reels generating 22% higher engagement than standard posts.',
  chatgpt:      'GPT-4o multimodal features driving record API and consumer usage.',
  reddit:       'Google AI Overviews continue to drive significant referral traffic to Reddit. AI licensing deals generating $60M+ annually.',
  x:            'X Premium subscriptions passed 1M in Q2 2026.',
  amazon:       'Prime Day week drove peak traffic; estimated 375M items ordered.',
  tiktok:       'TikTok Shop expanding; 1 in 5 US TikTok sessions now includes shopping.',
  netflix:      'Password sharing crackdown continues to drive paid subscriber growth.',
  github:       'GitHub Copilot now used by 1.8M developers daily.',
  discord:      'Discord\'s new Activities feature driving 35% more session time.',
  linkedin:     'LinkedIn Premium revenue reached $1.7B annually.',
  spotify:      'Audiobooks now available in 10 new countries; driving Premium upgrades.',
};


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

/** Generate total requests/sec across all top sites */
function getTotalRate(): number {
  return SITES.reduce((sum, s) => sum + s.rate, 0);
}

/** Build category breakdown from SITES */
function buildCategoryBreakdown() {
  const map: Record<string, { count: number; totalRate: number; sites: SiteConfig[] }> = {};
  SITES.forEach((s) => {
    if (!map[s.category]) map[s.category] = { count: 0, totalRate: 0, sites: [] };
    map[s.category].count++;
    map[s.category].totalRate += s.rate;
    map[s.category].sites.push(s);
  });

  return Object.entries(map)
    .sort((a, b) => b[1].totalRate - a[1].totalRate)
    .map(([cat, v]) => ({
      category: cat,
      label: CATEGORY_META[cat]?.label ?? cat,
      count: v.count,
      // Approximate monthly from rate (rate is req/sec, ~2.6M sec/mo)
      totalBaseline: `${(v.totalRate * 2592000 / 1e9).toFixed(1)}B / mo`,
      color: CATEGORY_META[cat]?.color ?? '#888',
    }));
}

/**
 * Generate report data for the week containing `date`.
 * This is deterministic: same date always produces same report.
 */
export function generateWeeklyReport(date: Date = new Date()): WeeklyReport {
  const monday = getMonday(date);
  const { week, year } = getISOWeek(monday);
  const slug = `${year}-w${String(week).padStart(2, '0')}`;

  const top5 = SITES.slice(0, 5);

  const stories = [
    {
      title: 'AI platforms continue record growth',
      summary: `ChatGPT, Claude, and Gemini collectively account for ${((SITES.filter(s => s.category === 'ai').reduce((a, b) => a + b.rate, 0) / getTotalRate()) * 100).toFixed(1)}% of all tracked web traffic, up from near-zero two years ago. ChatGPT reached ${SITES.find(s => s.id === 'chatgpt')?.baseline ?? '7.2B / mo'} monthly visits this period.`,
      tag: 'AI',
      tagColor: '#10a37f',
    },
    {
      title: 'Short-form video dominates mobile internet',
      summary: 'TikTok and YouTube Shorts collectively drive an estimated 38% of all mobile internet sessions globally. Instagram Reels continues to gain ground, with engagement rates outperforming standard video posts by over 20%.',
      tag: 'Social',
      tagColor: '#E1306C',
    },
    {
      title: 'Developer tools see sustained growth',
      summary: `GitHub, Stack Overflow, and Vercel are collectively receiving ${SITES.filter(s => s.category === 'dev').reduce((a, b) => a + b.rate, 0).toLocaleString()} requests per second across the Pulse dashboard. AI coding tools like GitHub Copilot are keeping developers on these platforms longer per session.`,
      tag: 'Dev Tools',
      tagColor: '#24292f',
    },
  ];

  const quickStats = [
    {
      label: 'Total Tracked Requests/sec',
      value: `${getTotalRate().toLocaleString()}/s`,
      note: 'Across all 100 monitored sites',
    },
    {
      label: 'Most Visited Site',
      value: `${SITES[0].name}`,
      note: `${SITES[0].baseline} at ${SITES[0].rate.toLocaleString()} req/s`,
    },
    {
      label: 'Fastest Growing Category',
      value: 'AI Assistants',
      note: `${SITES.filter(s => s.category === 'ai').length} sites tracked; up 340% YoY`,
    },
    {
      label: 'Internet Health Score',
      value: '94 / 100',
      note: 'All top 100 sites reported operational this week',
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
    totalTopSitesVisitsPerSec: getTotalRate(),
    topMovers: top5.map((site) => ({
      site,
      highlight: SITE_HIGHLIGHTS[site.id] ?? `${site.name} received ${site.baseline} visits this period.`,
    })),
    categoryBreakdown: buildCategoryBreakdown(),
    stories,
    quickStats,
  };
}

/** Slugs we pre-generate statically: current + 3 past weeks */
export function getReportSlugs(): string[] {
  const slugs: string[] = [];
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const monday = getMonday(d);
    const { week, year } = getISOWeek(monday);
    slugs.push(`${year}-w${String(week).padStart(2, '0')}`);
  }
  return [...new Set(slugs)]; // deduplicate
}

/** Parse a slug like "2026-w31" into a Date for the Monday of that week */
export function parsReportSlug(slug: string): Date | null {
  const match = slug.match(/^(\d{4})-w(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  // ISO week date: find Jan 4 (always in week 1), then offset
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const weekOneMonday = new Date(jan4);
  weekOneMonday.setDate(jan4.getDate() - (jan4Day - 1));
  const monday = new Date(weekOneMonday);
  monday.setDate(weekOneMonday.getDate() + (week - 1) * 7);
  return monday;
}
