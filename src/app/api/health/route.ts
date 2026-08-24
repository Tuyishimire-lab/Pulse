import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * /api/health — Sync-job health endpoint.
 *
 * Returns the last successful cron run timestamp so external uptime monitors
 * (e.g. BetterUptime, UptimeRobot) can alert when data goes stale.
 *
 * Response shape:
 * {
 *   ok: true,
 *   lastSyncedAt: "2026-08-24T08:00:00.000Z",  // ISO, UTC
 *   ageSeconds: 3600,
 *   degraded: false,         // true when age > 2x the 6h cron interval (43200s)
 *   sitesCount: 100,
 *   status: "success" | "error",
 *   message: "Sync healthy"
 * }
 *
 * HTTP codes:
 *   200 — healthy or degraded (check `degraded` field)
 *   503 — no sync log at all (never ran / table missing)
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CRON_INTERVAL_SECONDS = 6 * 60 * 60;   // 6 hours
const DEGRADED_MULTIPLIER   = 2;               // alert at 2× interval = 12h

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  const sb = supabaseClient();

  if (!sb) {
    return NextResponse.json(
      { ok: false, degraded: true, message: 'Database not configured' },
      { status: 503 },
    );
  }

  try {
    const { data, error } = await sb
      .from('sync_log')
      .select('completed_at, sites_count, status, error_message')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Table exists but is empty, or query failed — treat as never-synced
      return NextResponse.json(
        { ok: false, degraded: true, message: 'No sync records found' },
        { status: 503 },
      );
    }

    const completedAt = new Date(data.completed_at);
    const ageSeconds = Math.floor((Date.now() - completedAt.getTime()) / 1000);
    const degraded   = ageSeconds > CRON_INTERVAL_SECONDS * DEGRADED_MULTIPLIER;

    return NextResponse.json({
      ok:            true,
      lastSyncedAt:  completedAt.toISOString(),
      ageSeconds,
      degraded,
      sitesCount:    data.sites_count ?? null,
      status:        data.status      ?? 'success',
      message:       degraded
        ? `Data frozen — last sync was ${Math.round(ageSeconds / 3600)}h ago`
        : 'Sync healthy',
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, degraded: true, message: err?.message ?? 'Unknown error' },
      { status: 503 },
    );
  }
}
