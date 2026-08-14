import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SITES, SITE_META } from '../../data/sites';

export const revalidate = 3600; // re-compute at most once per hour

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key);
}

interface TrendingSite {
  id: string;
  name: string;
  url: string;
  logo: string;
  color: string;
  glow: string;
  category: string;
  currentRank: number;
  previousRank: number;
  delta: number; // positive = improved (moved up), negative = dropped
  rate: number;
  baseline: string;
}

export async function GET() {
  const supabase = getSupabase();

  // ── Strategy 1: use site_history (PTI engine writes this every 6h) ──────────
  if (supabase) {
    try {
      // Get the two most recent distinct recorded_at values
      const { data: timestamps } = await supabase
        .from('site_history')
        .select('recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(2000); // fetch enough rows to find 2 snapshots

      if (timestamps && timestamps.length > 0) {
        // Deduplicate to the two most recent distinct timestamps
        const distinctTimes = Array.from(
          new Set(timestamps.map((r: any) => r.recorded_at as string))
        ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (distinctTimes.length >= 2) {
          const [newestTs, olderTs] = distinctTimes;

          const [newest, older] = await Promise.all([
            supabase
              .from('site_history')
              .select('site_id, rank, rate')
              .eq('recorded_at', newestTs),
            supabase
              .from('site_history')
              .select('site_id, rank')
              .eq('recorded_at', olderTs),
          ]);

          if (newest.data && older.data && newest.data.length > 0) {
            const olderMap = new Map<string, number>();
            for (const row of older.data as any[]) {
              olderMap.set(row.site_id, row.rank);
            }

            // Also pull live site data for metadata
            const { data: sitesData } = await supabase
              .from('sites')
              .select('id, name, url, rank, category, baseline, rate, progress, updated_at');

            const siteMetaMap = new Map<string, any>();
            for (const s of (sitesData ?? []) as any[]) {
              siteMetaMap.set(s.id, s);
            }

            const movers: TrendingSite[] = [];

            for (const row of newest.data as any[]) {
              const previousRank = olderMap.get(row.site_id);
              if (previousRank === undefined) continue;
              const delta = previousRank - row.rank; // positive = moved up
              if (delta === 0) continue;

              const meta = SITE_META[row.site_id] ?? {};
              const liveData = siteMetaMap.get(row.site_id) ?? {};

              movers.push({
                id: row.site_id,
                name: liveData.name ?? meta.name ?? row.site_id,
                url: liveData.url ?? meta.url ?? '',
                logo: meta.logo ?? row.site_id.charAt(0).toUpperCase(),
                color: meta.color ?? '#82c8e5',
                glow: meta.glow ?? 'rgba(130,200,229,0.15)',
                category: liveData.category ?? meta.category ?? 'other',
                currentRank: row.rank,
                previousRank,
                delta,
                rate: liveData.rate ?? row.rate ?? 0,
                baseline: liveData.baseline ?? '',
              });
            }

            movers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
            const risers = movers.filter((m) => m.delta > 0).slice(0, 12);
            const fallers = movers.filter((m) => m.delta < 0).slice(0, 12);

            return NextResponse.json(
              { risers, fallers, source: 'site_history', snapshotAge: newestTs },
              { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
            );
          }
        }
      }
    } catch (err) {
      console.warn('[trending] site_history query failed:', err);
    }

    // ── Strategy 2: fall back to rank_history[] on sites table ────────────────
    try {
      const { data: sitesData } = await supabase
        .from('sites')
        .select('id, name, url, rank, category, baseline, rate, rank_history')
        .order('rank', { ascending: true });

      if (sitesData && sitesData.length > 0) {
        const movers: TrendingSite[] = [];

        for (const s of sitesData as any[]) {
          if (!s.rank_history || s.rank_history.length < 2) continue;

          const sorted = [...s.rank_history].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const oldest = sorted[0]?.rank;
          if (oldest === undefined) continue;

          const delta = oldest - s.rank;
          if (delta === 0) continue;

          const meta = SITE_META[s.id] ?? {};
          movers.push({
            id: s.id,
            name: s.name,
            url: s.url,
            logo: meta.logo ?? s.id.charAt(0).toUpperCase(),
            color: meta.color ?? '#82c8e5',
            glow: meta.glow ?? 'rgba(130,200,229,0.15)',
            category: s.category,
            currentRank: s.rank,
            previousRank: oldest,
            delta,
            rate: s.rate,
            baseline: s.baseline,
          });
        }

        movers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
        const risers = movers.filter((m) => m.delta > 0).slice(0, 12);
        const fallers = movers.filter((m) => m.delta < 0).slice(0, 12);

        return NextResponse.json(
          { risers, fallers, source: 'rank_history' },
          { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
        );
      }
    } catch (err) {
      console.warn('[trending] rank_history fallback failed:', err);
    }
  }

  // ── Strategy 3: static fallback — synthetic deltas from static SITES ─────────
  // Use rank_history from static SITES array
  const movers: TrendingSite[] = [];

  for (const s of SITES) {
    if (!s.rank_history || s.rank_history.length < 2) continue;
    const sorted = [...s.rank_history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const oldest = sorted[0]?.rank;
    if (oldest === undefined) continue;
    const delta = oldest - s.rank;
    if (delta === 0) continue;
    movers.push({
      id: s.id,
      name: s.name,
      url: s.url,
      logo: s.logo,
      color: s.color,
      glow: s.glow,
      category: s.category,
      currentRank: s.rank,
      previousRank: oldest,
      delta,
      rate: s.rate,
      baseline: s.baseline,
    });
  }

  movers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const risers = movers.filter((m) => m.delta > 0).slice(0, 12);
  const fallers = movers.filter((m) => m.delta < 0).slice(0, 12);

  return NextResponse.json(
    { risers, fallers, source: 'static' },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
  );
}
