"""
run_engine.py - Pulse Traffic Index Engine v3 (Live Rank)

Architecture:
  - baseline anchor      -> STATIC_BASELINES (curated, calibrated on BASELINE_ANCHOR_DATE)
  - live estimate        -> anchor x Tranco rank movement since the anchor date (max ±15%)
  - rank                 -> sites re-ranked daily by the live estimate
  - rate / baseline      -> derived from the live estimate (so rank and displayed numbers agree)

See live_rank.py for the formula and safeguards. If Tranco is unreachable, every factor is
1.0 and ranks fall back to the curated order - values are never simulated.

v3 changes vs v2.1:
  - rank is no longer frozen to the static file order
  - removed the CF-Radar rate modulator (it compared catalog rank with global rank, which are
    different scales, and biased most sites downward)
  - removed the Google Trends step (its output was computed but never stored)
  - site_history rows now include rank and share one recorded_at per run
"""

import sys
from datetime import date, datetime, timezone
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from supabase import Client, create_client

from scripts.pulse_engine.config import SUPABASE_KEY, SUPABASE_URL
from scripts.pulse_engine.live_rank import compute_live, rank_by_value, resolve_tranco_domains
from scripts.pulse_engine.signals import fetch_cloudflare_outage_count, fetch_tranco_list
from scripts.pulse_engine.static_baselines import (
    BASELINE_ANCHOR_DATE,
    SITE_META,
    STATIC_BASELINES,
    get_baseline_str,
    get_rank_map,
    get_rate,
)
from scripts.pulse_engine.validation import print_validation_report, run_validation

TRANCO_TOP_N = 100_000


def run_pulse_engine(run_validation_report: bool = True):
    print("=" * 60)
    print("Pulse Traffic Engine v3 (Live Rank)")
    print(f"anchor baselines <- STATIC_BASELINES (calibrated {BASELINE_ANCHOR_DATE})")
    print("live rank        <- anchor x Tranco movement since anchor (max ±15%)")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Engine Error] Supabase credentials missing. Check .env.local")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # ── 1. Current DB rows (urls for domain matching, previous rank for logging) ──
    print("[1/4] Fetching current DB rows from Supabase...")
    res = supabase.table("sites").select("id, url, rank, rate").execute()
    db_sites = res.data or []
    db_lookup: dict[str, dict] = {s["id"]: s for s in db_sites}
    print(f"  Found {len(db_sites)} rows in DB.")

    # ── 2. Tranco: latest list + the list at the baseline anchor date ───────────
    print("[2/4] Fetching Tranco lists (latest + anchor)...")
    tranco_now, now_date = fetch_tranco_list(date.today().isoformat(), TRANCO_TOP_N, search_days=3, direction=-1)
    tranco_anchor, anchor_date = fetch_tranco_list(BASELINE_ANCHOR_DATE, TRANCO_TOP_N, search_days=5, direction=+1)
    if not tranco_now or not tranco_anchor:
        print("  [Warning] Tranco unavailable - live adjustments disabled for this run (curated order kept).")
        tranco_now, tranco_anchor = {}, {}
    else:
        print(f"  Comparing Tranco {anchor_date} -> {now_date}")

    site_urls = {sid: (db_lookup.get(sid) or {}).get("url", "") for sid in STATIC_BASELINES}
    tranco_domains = resolve_tranco_domains(site_urls)
    live = compute_live(STATIC_BASELINES, tranco_domains, tranco_now, tranco_anchor)
    live_values = {sid: v["adjusted"] for sid, v in live.items()}
    rank_map = rank_by_value(live_values)
    static_rank_map = get_rank_map()

    reasons: dict[str, int] = {}
    for v in live.values():
        reasons[v["reason"]] = reasons.get(v["reason"], 0) + 1
    moved = sum(1 for sid in rank_map if rank_map[sid] != static_rank_map[sid])
    print(f"  Signal coverage: {reasons}")
    print(f"  {moved} sites ranked differently from the curated order.")

    # ── 3. Write sites + one site_history snapshot ─────────────────────────────
    print("[3/4] Syncing all sites to Supabase...")
    now_iso = datetime.now(timezone.utc).isoformat()
    google_live = live_values.get("google", STATIC_BASELINES.get("google", 85_000_000_000))
    updates_count = 0
    updated_sites = []
    history_rows = []

    for site_id in sorted(STATIC_BASELINES, key=lambda s: rank_map[s]):
        info = live[site_id]
        monthly = info["adjusted"]
        rank = rank_map[site_id]
        rate = get_rate(monthly)
        baseline_str = get_baseline_str(monthly)
        db_row = db_lookup.get(site_id, {})

        update_payload = {
            "rank": rank,
            "baseline": baseline_str,
            "baseline_raw": monthly,
            "rate": rate,
            "progress": round((monthly / google_live) * 100.0, 2),
            # % deviation of the live estimate from the curated anchor
            "volatility": round((info["factor"] - 1.0) * 100.0, 2),
            "updated_at": now_iso,
        }

        try:
            if not db_row:
                meta = SITE_META.get(site_id, {})
                supabase.table("sites").upsert({
                    "id": site_id,
                    "name": meta.get("name", site_id.capitalize()),
                    "url": f"https://{site_id}.com",
                    "category": meta.get("category", "dev"),
                    "color": meta.get("color", "#82c8e5"),
                    "glow": "rgba(130,200,229,0.15)",
                    **update_payload,
                }).execute()
                print(f"  [Warning] {site_id} was missing from DB; inserted with placeholder url - fix it in Supabase.")
            else:
                supabase.table("sites").update(update_payload).eq("id", site_id).execute()

            updates_count += 1
            prev = db_row.get("rank")
            move = f"{prev:>3}->{rank:<3}" if isinstance(prev, int) else f"new->{rank:<3}"
            tr = f"T {info['tranco_anchor']}->{info['tranco_now']}" if info["reason"] == "tranco" else info["reason"]
            print(f"  {site_id:18s} | {move} | {baseline_str:11s} | x{info['factor']:.3f} | {tr}")
            updated_sites.append({"id": site_id, "rank": rank, "rate": rate, "baseline": baseline_str})
            history_rows.append({"site_id": site_id, "rank": rank, "rate": rate,
                                 "volatility": update_payload["volatility"], "recorded_at": now_iso})
        except Exception as e:
            print(f"  X Failed to update {site_id}: {e}")

    try:
        for i in range(0, len(history_rows), 200):
            supabase.table("site_history").insert(history_rows[i:i + 200]).execute()
        print(f"  site_history: wrote {len(history_rows)} rows at {now_iso}")
    except Exception as e:
        print(f"  [Warning] site_history insert failed: {e}")

    print()
    print(f"SUCCESS: Engine v3 updated {updates_count}/{len(STATIC_BASELINES)} sites.")

    # ── 4. Weekly snapshot ─────────────────────────────────────────────────────
    print("[4/4] Writing weekly snapshot to Supabase...")
    try:
        now_utc = datetime.now(timezone.utc)
        iso_week = now_utc.isocalendar()
        week_slug = f"{iso_week.year}-w{str(iso_week.week).zfill(2)}"

        sites_data = []
        category_totals: dict[str, dict] = {}
        total_rate = 0
        for upd in updated_sites:
            sid = upd["id"]
            meta = SITE_META.get(sid, {})
            cat = meta.get("category", "general")
            sites_data.append({
                "id": sid,
                "name": meta.get("name", sid),
                "url": (db_lookup.get(sid) or {}).get("url", ""),
                "rank": upd["rank"],
                "rate": upd["rate"],
                "baseline": upd["baseline"],
                "category": cat,
                "color": meta.get("color", "#888"),
                "logo": meta.get("logo", sid[:2].upper()),
                "keywords": None,
            })
            total_rate += upd["rate"]
            category_totals.setdefault(cat, {"count": 0, "totalRate": 0})
            category_totals[cat]["count"] += 1
            category_totals[cat]["totalRate"] += upd["rate"]

        sites_data.sort(key=lambda s: s["rank"])
        supabase.table("weekly_snapshots").upsert({
            "week_slug": week_slug,
            "snapshot_date": now_utc.isoformat(),
            "sites_data": sites_data,
            "category_totals": category_totals,
            "total_rate": total_rate,
            "outage_count": fetch_cloudflare_outage_count(),
        }, on_conflict="week_slug").execute()
        print(f"  Snapshot written: {week_slug} ({len(sites_data)} sites, total_rate={total_rate}/s)")
    except Exception as e:
        print(f"  [Warning] Could not write weekly snapshot: {e}")

    if run_validation_report and updated_sites:
        try:
            print_validation_report(run_validation(updated_sites))
        except Exception as e:
            print(f"  [Warning] Ground-truth validation error: {e}")

    print("=" * 60)
    print("Pulse Engine v3 completed.")
    print("=" * 60)


if __name__ == "__main__":
    run_pulse_engine()
