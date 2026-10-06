-- Migration: Add updated_at to sites table
-- Run this once in your Supabase SQL Editor. Safe to re-run.
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── weekly_snapshots ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weekly_snapshots (
  week_slug       TEXT PRIMARY KEY,
  snapshot_date   TIMESTAMPTZ DEFAULT NOW(),
  sites_data      JSONB NOT NULL,
  category_totals JSONB NOT NULL,
  total_rate      INTEGER NOT NULL,
  outage_count    INTEGER DEFAULT 0,
  ai_stories      JSONB
);
ALTER TABLE public.weekly_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to weekly_snapshots" ON public.weekly_snapshots;
CREATE POLICY "Allow public read access to weekly_snapshots"
  ON public.weekly_snapshots FOR SELECT USING (true);

-- ── site_history ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id     TEXT REFERENCES public.sites(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  rank        INTEGER,
  rate        INTEGER,
  volatility  NUMERIC,
  pti_score   NUMERIC
);
ALTER TABLE public.site_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to site_history" ON public.site_history;
CREATE POLICY "Allow public read access to site_history"
  ON public.site_history FOR SELECT USING (true);

-- ── compare_cache ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compare_cache (
  pair_slug    TEXT PRIMARY KEY,
  site_a_id    TEXT NOT NULL,
  site_b_id    TEXT NOT NULL,
  verdict      TEXT NOT NULL,
  context      TEXT NOT NULL,
  faq          JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.compare_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to compare_cache" ON public.compare_cache;
CREATE POLICY "Allow public read access to compare_cache"
  ON public.compare_cache FOR SELECT USING (true);

-- Verify: should return 0 rows when everything is clean
-- SELECT COUNT(*) FROM public.sites WHERE updated_at IS NULL;
