/**
 * getSites.ts - Unified Site Data Fetcher
 *
 * Single source of truth for site data across all surfaces:
 *   - Live Dashboard    (page.tsx → HomeClient.tsx)
 *   - Weekly Report     (reportGenerator.ts)
 *   - Compare Pages     (compare/[pair]/page.tsx)
 *   - Top Sites         (top-sites/[country]/page.tsx)
 *   - Site Detail Pages (sites/[id]/page.tsx)
 *
 * Strategy:
 *   1. Fetch live rank/rate/baseline from Supabase `sites` table (ordered by rank)
 *   2. Merge with SITE_META from sites.ts for static metadata (color, logo, glow, asn)
 *   3. Fall back to full SITES array from sites.ts if Supabase is unavailable
 *
 * This guarantees that rank/baseline values are ALWAYS from the engine
 * (collision-free, arbitrated) and never from the hardcoded static file.
 */

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SITES, SITE_META, SiteConfig } from '../app/data/sites';
import { SiteDbRow } from '../types/radar';
import { parseTrafficMetric } from './metrics';

// ── Supabase client (server-safe, no cookie auth needed here) ────────────────
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key);
}

// ── DB row → SiteConfig ───────────────────────────────────────────────────────
function rowToSiteConfig(row: SiteDbRow): SiteConfig {
  // Merge static metadata (color, logo, glow, asn) that the engine doesn't write
  const meta = SITE_META[row.id] ?? {};
  const parsedBaseline = parseTrafficMetric(row.baseline);
  const baselineRaw = parsedBaseline > 0 ? parsedBaseline : (row.baseline_raw ?? row.baselineRaw ?? 0);
  return {
    ...meta,      // static fields first (provides defaults)
    ...row,       // DB fields override everything (rank, rate, baseline, etc.)
    // Normalise snake_case → camelCase with verified numeric integrity
    baselineRaw,
  } as SiteConfig;
}

function withTimeout<T, F>(promise: PromiseLike<T>, ms: number, fallback: F): Promise<T | F> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<F>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Fetch all sites from Supabase, merged with static metadata.
 * Falls back to SITES from sites.ts if Supabase is unreachable.
 * Wrapped in React.cache() to deduplicate multiple calls during the same render pass.
 *
 * @param _revalidate  Next.js ISR revalidation seconds (default 60).
 */
export const getSites = cache(async function getSites(_revalidate = 60): Promise<SiteConfig[]> {
  void _revalidate;
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('sites')
          .select(
            'id, name, url, rank, category, baseline, baseline_raw, rate, progress, updated_at'
          )
          .order('rank', { ascending: true }),
        1200,
        { data: null, error: { message: 'Timed out' } } as { data: SiteDbRow[] | null; error: { message: string } | null }
      );

      if (!error && data && data.length > 0) {
        return (data as SiteDbRow[]).map(rowToSiteConfig);
      }
      if (error) {
        console.warn('[getSites] Supabase error/timeout:', error.message);
      }
    } catch (err) {
      console.warn('[getSites] Supabase unreachable:', err);
    }
  }

  // Graceful fallback: static data (pre-populated at build time)
  return SITES;
});

/**
 * Fetch a single site by ID.
 * Tries Supabase first, falls back to SITES static lookup.
 * Wrapped in React.cache() to deduplicate calls between generateMetadata and Page.
 */
export const getSiteById = cache(async function getSiteById(id: string): Promise<SiteConfig | null> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('sites')
          .select(
            'id, name, url, rank, category, baseline, baseline_raw, rate, progress, updated_at'
          )
          .eq('id', id)
          .single(),
        1200,
        { data: null, error: { message: 'Timed out' } } as { data: SiteDbRow | null; error: { message: string } | null }
      );

      if (!error && data) {
        return rowToSiteConfig(data as SiteDbRow);
      }
    } catch {}
  }

  return SITES.find((s) => s.id === id) ?? null;
});
