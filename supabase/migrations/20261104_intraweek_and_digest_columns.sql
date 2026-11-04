-- Migration: Add intraweek_metrics, digest_dispatched_at, and digest_recipient_count to weekly_snapshots
-- Target Table: public.weekly_snapshots
-- Date: 2026-11-04

ALTER TABLE public.weekly_snapshots
  ADD COLUMN IF NOT EXISTS intraweek_metrics JSONB;

COMMENT ON COLUMN public.weekly_snapshots.intraweek_metrics IS
  'Pre-computed 7-day macro and per-site intra-week volatility, coefficient of variation, peak velocity timestamps, and aggregate sample telemetry calculated at Monday snapshot creation.';

ALTER TABLE public.weekly_snapshots
  ADD COLUMN IF NOT EXISTS digest_dispatched_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.weekly_snapshots.digest_dispatched_at IS
  'Timestamp when the weekly executive email digest was dispatched, serving as an idempotency lock.';

ALTER TABLE public.weekly_snapshots
  ADD COLUMN IF NOT EXISTS digest_recipient_count INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.weekly_snapshots.digest_recipient_count IS
  'Total number of active newsletter subscribers successfully dispatched to for this report.';
