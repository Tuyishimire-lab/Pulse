-- Migration: align production tables with what /api/cron/daily-job writes.
-- Run once in the Supabase SQL Editor. Safe to re-run.
--
-- Why: production `site_history` was created with an older schema (created_at, no rank),
-- so every cron insert of {site_id, rank, rate, recorded_at} has been failing, and the
-- 8-day prune (which filters on recorded_at) has never run. `sites.rank_history` is also
-- missing, so the cron's rank_history updates fail too.

-- 1. site_history: add the columns the cron writes
ALTER TABLE public.site_history ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.site_history ADD COLUMN IF NOT EXISTS rank INTEGER;

-- Remove legacy pre-migration rows that lack a rank value
DELETE FROM public.site_history WHERE rank IS NULL;

CREATE INDEX IF NOT EXISTS site_history_recorded_at_idx ON public.site_history (recorded_at DESC);
CREATE INDEX IF NOT EXISTS site_history_site_recorded_idx ON public.site_history (site_id, recorded_at DESC);

-- 2. sites: rank_history used by the cron and site pages
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS rank_history JSONB DEFAULT '[]'::jsonb;

-- Verify (expect both columns listed):
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'site_history' AND column_name IN ('recorded_at', 'rank');

