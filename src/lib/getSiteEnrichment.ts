import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface SiteEnrichmentData {
  webVitals: Record<string, unknown> | null;
  wikiViews: Record<string, unknown> | null;
  security: Record<string, unknown> | null;
}

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

function withTimeout<T, F>(promise: PromiseLike<T>, ms: number, fallback: F): Promise<T | F> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<F>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Fetches cached CrUX Web Vitals, Wikipedia pageviews, and Security Header grades
 * for a site from Supabase. Wrapped in React.cache() for per-request deduplication.
 */
export const getSiteEnrichment = cache(async function getSiteEnrichment(
  siteId: string
): Promise<SiteEnrichmentData> {
  const sb = getSupabaseClient();
  if (!sb || !siteId) {
    return { webVitals: null, wikiViews: null, security: null };
  }

  try {
    const [webVitalsRes, wikiRes, securityRes] = await Promise.all([
      withTimeout(
        sb.from('site_webvitals').select('*').eq('site_id', siteId).maybeSingle(),
        2500,
        { data: null }
      ),
      withTimeout(
        sb.from('site_wiki_views').select('*').eq('site_id', siteId).maybeSingle(),
        2500,
        { data: null }
      ),
      withTimeout(
        sb.from('site_security').select('*').eq('site_id', siteId).maybeSingle(),
        2500,
        { data: null }
      ),
    ]);

    return {
      webVitals: (webVitalsRes?.data as Record<string, unknown>) ?? null,
      wikiViews: (wikiRes?.data as Record<string, unknown>) ?? null,
      security: (securityRes?.data as Record<string, unknown>) ?? null,
    };
  } catch {
    return { webVitals: null, wikiViews: null, security: null };
  }
});

/**
 * Batch-fetches site enrichment telemetry from Supabase in a single query.
 * Queries 'site_enrichment' table with automatic fallback to 'site_webvitals'.
 * Normalizes both flat columns (ttfb_p75, p75_ttfb, lcp_p75, p75_lcp) and
 * nested metrics ({ metrics: { ttfb: { p75 }, lcp: { p75 } } }).
 * Returns a Map<string, SiteEnrichmentData> keyed by lowercased site ID for O(1) lookups.
 * Wrapped in React.cache() for per-request deduplication.
 */
export const getBatchSiteEnrichment = cache(async function getBatchSiteEnrichment(): Promise<
  Map<string, SiteEnrichmentData>
> {
  const enrichmentMap = new Map<string, SiteEnrichmentData>();
  const sb = getSupabaseClient();
  if (!sb) return enrichmentMap;

  try {
    // 1. Attempt batch retrieval from 'site_enrichment' table
    let rows: Record<string, unknown>[] | null = null;
    const enrichmentRes = await withTimeout(
      sb.from('site_enrichment').select('*'),
      2500,
      { data: null, error: { message: 'timeout' } }
    );

    if (enrichmentRes?.data && Array.isArray(enrichmentRes.data) && enrichmentRes.data.length > 0) {
      rows = enrichmentRes.data as Record<string, unknown>[];
    } else {
      // 2. Fallback to 'site_webvitals' table if 'site_enrichment' is unavailable or empty
      const webVitalsRes = await withTimeout(
        sb.from('site_webvitals').select('*'),
        2500,
        { data: null, error: { message: 'timeout' } }
      );
      if (webVitalsRes?.data && Array.isArray(webVitalsRes.data)) {
        rows = webVitalsRes.data as Record<string, unknown>[];
      }
    }

    if (!rows || rows.length === 0) return enrichmentMap;

    for (const row of rows) {
      const rawId = (row.site_id as string) || (row.id as string);
      if (!rawId) continue;
      const siteId = rawId.toLowerCase();

      // Normalize TTFB and LCP percentiles
      const ttfb =
        typeof row.ttfb_p75 === 'number'
          ? row.ttfb_p75
          : typeof row.p75_ttfb === 'number'
          ? row.p75_ttfb
          : typeof (row.metrics as { ttfb?: { p75?: number } })?.ttfb?.p75 === 'number'
          ? (row.metrics as { ttfb?: { p75?: number } })?.ttfb?.p75
          : undefined;

      const lcp =
        typeof row.lcp_p75 === 'number'
          ? row.lcp_p75
          : typeof row.p75_lcp === 'number'
          ? row.p75_lcp
          : typeof (row.metrics as { lcp?: { p75?: number } })?.lcp?.p75 === 'number'
          ? (row.metrics as { lcp?: { p75?: number } })?.lcp?.p75
          : undefined;

      const rawMetrics =
        row.metrics && typeof row.metrics === 'object'
          ? (row.metrics as Record<string, unknown>)
          : {};

      const normalizedWebVitals: Record<string, unknown> = {
        ...row,
        ttfb_p75: ttfb,
        p75_ttfb: ttfb,
        lcp_p75: lcp,
        p75_lcp: lcp,
        metrics: {
          ...rawMetrics,
          ttfb: typeof ttfb === 'number' ? { p75: ttfb } : undefined,
          lcp: typeof lcp === 'number' ? { p75: lcp } : undefined,
        },
      };

      enrichmentMap.set(siteId, {
        webVitals: normalizedWebVitals,
        wikiViews: (row.wiki_views as Record<string, unknown>) ?? null,
        security: (row.security as Record<string, unknown>) ?? null,
      });
    }

    return enrichmentMap;
  } catch {
    return enrichmentMap;
  }
});
