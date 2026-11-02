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

