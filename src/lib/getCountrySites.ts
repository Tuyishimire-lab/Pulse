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

export const RADAR_DOMAIN_ALIASES: Record<string, string> = {
  'twitter.com': 'x',
  't.co': 'x',
  'openai.com': 'chatgpt',
  'fb.com': 'facebook',
  'm.facebook.com': 'facebook',
  'youtu.be': 'youtube',
  'en.wikipedia.org': 'wikipedia',
  'characterai.com': 'characterai',
  'notion.site': 'notion',
  'us.temu.com': 'temu',
  'yahoo.co.jp': 'yahoo',
  'rakuten.co.jp': 'rakuten',
  'mercadolivre.com.br': 'mercadolibre',
  'mercadolibre.com.ar': 'mercadolibre',
  'mercadolibre.com.mx': 'mercadolibre',
  'mercadolibre.com.co': 'mercadolibre',
  'mercadolibre.cl': 'mercadolibre',
  'vkontakte.ru': 'vk',
  'line.me': 'line',
  'seznam.cz': 'seznam',
  'coupang.com': 'coupang',
  'flipkart.com': 'flipkart',
  'bbc.co.uk': 'bbc',
};

const MULTI_TLD_BRANDS: Record<string, string> = {
  google: 'google',
  amazon: 'amazon',
  ebay: 'ebay',
  yahoo: 'yahoo',
  mercadolibre: 'mercadolibre',
  mercadolivre: 'mercadolibre',
  rakuten: 'rakuten',
  pinterest: 'pinterest',
  shopify: 'shopify',
  indeed: 'indeed',
};

// ---------- Domain → Site matching ------------------------------------------
export function matchRadarDomainToSiteId(domain: string, allSites: SiteConfig[]): string | undefined {
  const d = domain.toLowerCase().replace(/^www\./, '');

  // 1. Direct alias lookup
  if (RADAR_DOMAIN_ALIASES[d]) {
    return RADAR_DOMAIN_ALIASES[d];
  }

  // 2. Exact host or subdomain match against catalog sites
  for (const site of allSites) {
    const siteHost = site.url
      .replace(/https?:\/\/(www\.)?/, '')
      .split('/')[0]
      .toLowerCase();
    if (siteHost === d || siteHost.endsWith('.' + d) || d.endsWith('.' + siteHost)) {
      return site.id;
    }
  }

  // 3. Multi-country ccTLD match for global brands (e.g. amazon.co.jp, google.co.in, ebay.de)
  const firstLabel = d.split('.')[0];
  if (firstLabel && MULTI_TLD_BRANDS[firstLabel]) {
    return MULTI_TLD_BRANDS[firstLabel];
  }

  return undefined;
}

/** Backfills a list of siteIds up to 20 using the country's regional profile and global fallback. */
export function ensureTwentyCountrySites(
  siteIds: string[],
  cfCode: string,
  allSites: SiteConfig[]
): string[] {
  const validCatalogIds = new Set(allSites.map((s) => s.id));
  const result: string[] = [];

  for (const id of siteIds) {
    if (validCatalogIds.has(id) && !result.includes(id)) {
      result.push(id);
    }
    if (result.length >= 20) return result;
  }

  const regionalIds = getRegionalProfile(cfCode);
  for (const id of regionalIds) {
    if (validCatalogIds.has(id) && !result.includes(id)) {
      result.push(id);
    }
    if (result.length >= 20) return result;
  }

  const globalFallback = allSites
    .filter((s) => !GLOBALLY_IRRELEVANT.has(s.id))
    .sort((a, b) => a.rank - b.rank);

  for (const site of globalFallback) {
    if (!result.includes(site.id)) {
      result.push(site.id);
    }
    if (result.length >= 20) break;
  }

  return result;
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
      const matchedId = matchRadarDomainToSiteId(item.domain, allSites);
      if (matchedId && !siteIds.includes(matchedId)) siteIds.push(matchedId);
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

function withTimeout<T, F>(promise: PromiseLike<T>, ms: number, fallback: F): Promise<T | F> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<F>((resolve) => setTimeout(() => resolve(fallback), ms)),
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
        { data: null, error: null } as { data: { site_ids: string[]; source: string; updated_at: string } | null; error: null }
      );

      if (data) {
        cronLastRan = data.updated_at;
        const age = Date.now() - new Date(data.updated_at).getTime();
        if (age < STALE_THRESHOLD_MS && Array.isArray(data.site_ids) && data.site_ids.length >= 10) {
          return {
            siteIds: ensureTwentyCountrySites(data.site_ids, cfCode, allSites),
            source: 'supabase-cache',
            cronLastRan,
          };
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
    const fullIds = ensureTwentyCountrySites(radarIds, cfCode, allSites);
    // Write result back to Supabase cache asynchronously so future renders use it
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        supabase.from('country_rankings').upsert({
          cf_code: cfCode.toUpperCase(),
          site_ids: fullIds,
          source: 'radar',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'cf_code' }).then(() => {}, () => {});
      } catch { /* non-critical */ }
    }
    return { siteIds: fullIds, source: 'live-radar', cronLastRan };
  }

  // ── Tier 4: PTI Regional Profile ─────────────────────────────────────────
  const regionalIds = getRegionalProfile(cfCode);
  if (regionalIds.length >= 10) {
    return {
      siteIds: ensureTwentyCountrySites(regionalIds, cfCode, allSites),
      source: 'regional-profile',
      cronLastRan,
    };
  }

  // ── Tier 5: Smart-filtered global fallback ────────────────────────────────
  return {
    siteIds: ensureTwentyCountrySites([], cfCode, allSites),
    source: 'smart-filter',
    cronLastRan,
  };
}
