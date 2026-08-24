// Unified country site resolver - 4-tier fallback strategy:
//
//  Tier 1  Hand-crafted pinnedSiteIds (in countries.ts) - highest confidence, skip this lib
//  Tier 2  Supabase country_rankings cache (written daily by cron) - stale if > 25h old
//  Tier 3  Live Cloudflare Radar lookup - used when cron hasn't run or data is stale
//  Tier 4  PTI Regional Profile - curated per-region 20-site lists, no Baidu/Yandex
//  Tier 5  Smart-filtered global fallback - global top-20 minus region-irrelevant sites

import { createClient } from '@supabase/supabase-js';
import { SiteConfig } from '../app/data/sites';
import { getRegionalProfile, GLOBALLY_IRRELEVANT } from '../app/top-sites/data/regionalProfiles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const STALE_THRESHOLD_MS = 25 * 60 * 60 * 1000; // 25 hours

// ---------- Domain → Site matching ------------------------------------------
function domainMatchesSite(domain: string, site: SiteConfig): boolean {
  const siteHost = site.url
    .replace(/https?:\/\/(www\.)?/, '')
    .split('/')[0]
    .toLowerCase();
  const d = domain.toLowerCase().replace(/^www\./, '');
  return siteHost === d || siteHost.endsWith('.' + d) || d.endsWith('.' + siteHost);
}

// ---------- Tier 3: Live Cloudflare Radar lookup ----------------------------
async function fetchRadarForCountry(cfCode: string, allSites: SiteConfig[]): Promise<string[]> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/radar/ranking/top?limit=100&location=${cfCode}&format=json`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.success || !json.result?.top_0) return [];

    const siteIds: string[] = [];
    for (const item of json.result.top_0 as { domain: string; rank: number }[]) {
      const matched = allSites.find((s) => domainMatchesSite(item.domain, s));
      if (matched && !siteIds.includes(matched.id)) siteIds.push(matched.id);
      if (siteIds.length >= 20) break;
    }
    return siteIds;
  } catch {
    return [];
  }
}

// ---------- Main resolver ----------------------------------------------------
export interface CountrySitesResult {
  siteIds: string[];
  source: 'pinned' | 'supabase-cache' | 'live-radar' | 'regional-profile' | 'smart-filter';
  cronLastRan: string | null; // ISO timestamp or null if never
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function resolveCountrySites(
  cfCode: string,
  allSites: SiteConfig[]
): Promise<CountrySitesResult> {
  // ── Tier 2: Supabase cache (written by daily cron) ──────────────────────
  let cronLastRan: string | null = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await withTimeout(
        supabase
          .from('country_rankings')
          .select('site_ids, source, updated_at')
          .eq('cf_code', cfCode.toUpperCase())
          .single(),
        3000,
        { data: null, error: null } as any
      );

      if (data) {
        cronLastRan = data.updated_at;
        const age = Date.now() - new Date(data.updated_at).getTime();
        if (age < STALE_THRESHOLD_MS && Array.isArray(data.site_ids) && data.site_ids.length >= 10) {
          return { siteIds: data.site_ids, source: 'supabase-cache', cronLastRan };
        }
        // Data is stale - record the timestamp but continue to Tier 3
      }
    } catch {
      // Supabase unavailable - continue
    }
  }

  // ── Tier 3: Live Cloudflare Radar lookup (cron missed or data stale) ─────
  const radarIds = await withTimeout(fetchRadarForCountry(cfCode, allSites), 3000, []);
  if (radarIds.length >= 10) {
    // Write result back to Supabase cache asynchronously so future renders use it
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        supabase.from('country_rankings').upsert({
          cf_code: cfCode.toUpperCase(),
          site_ids: radarIds,
          source: 'radar',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'cf_code' }).then(() => {}, () => {});
      } catch { /* non-critical */ }
    }
    return { siteIds: radarIds, source: 'live-radar', cronLastRan };
  }

  // ── Tier 4: PTI Regional Profile ─────────────────────────────────────────
  const regionalIds = getRegionalProfile(cfCode);
  if (regionalIds.length >= 10) {
    return { siteIds: regionalIds, source: 'regional-profile', cronLastRan };
  }

  // ── Tier 5: Smart-filtered global fallback ────────────────────────────────
  const filtered = allSites
    .filter((s) => !GLOBALLY_IRRELEVANT.has(s.id))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 20)
    .map((s) => s.id);

  return { siteIds: filtered, source: 'smart-filter', cronLastRan };
}

