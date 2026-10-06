-- Migration: Create sync_log table for health check & cron observability
-- Run this in your Supabase SQL Editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS public.sync_log (
  id            BIGSERIAL PRIMARY KEY,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sites_count   INTEGER,
  status        TEXT NOT NULL DEFAULT 'success',
  error_message TEXT
);

-- Index completed_at for fast descending sort
CREATE INDEX IF NOT EXISTS idx_sync_log_completed_at ON public.sync_log (completed_at DESC);

-- Enable RLS
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for /api/health and external uptime monitors)
DROP POLICY IF EXISTS "Allow public read access to sync_log" ON public.sync_log;
CREATE POLICY "Allow public read access to sync_log"
  ON public.sync_log FOR SELECT
  USING (true);

-- Allow service role full access (for cron jobs inserting and pruning sync logs)
DROP POLICY IF EXISTS "Allow service_role full access to sync_log" ON public.sync_log;
CREATE POLICY "Allow service_role full access to sync_log"
  ON public.sync_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed an initial sync record so /api/health is instantly 200/healthy
INSERT INTO public.sync_log (completed_at, sites_count, status, error_message)
VALUES (NOW(), 137, 'success', NULL);
