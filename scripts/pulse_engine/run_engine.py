"""
run_engine.py — Pulse Traffic Index Engine v2.0 (Static-First)

Architecture change from v1.x:
  - rank, baseline, rate  → derived from STATIC_BASELINES (not computed)
  - volatility, trend     → still computed from CF Radar + Google Trends signals
  - rate display          → static rate ± small noise band for visual realism

This eliminates the Zipf formula multiplication bomb and the rank_arbiter
collision that was causing ChatGPT to appear at #1 with 114B/mo.
"""

import os
import sys
import random
from datetime import datetime, timezone
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from supabase import create_client, Client
from scripts.pulse_engine.config import SUPABASE_URL, SUPABASE_KEY
from scripts.pulse_engine.signals import (
    parse_domain,
    fetch_cloudflare_radar_ranks,
    fetch_google_trends_momentum,
    fetch_cloudflare_outage_count,
)
from scripts.pulse_engine.static_baselines import (
    STATIC_BASELINES,
    get_rank_map,
    get_baseline_str,
    get_rate,
    SECONDS_PER_MONTH,
)


# ─────────────────────────────────────────────────────────────────────────────
# RATE NOISE BAND
# Adds ±NOISE_PCT variation to the static rate for visual realism on the
# live counter. Purely cosmetic — does not affect rank or baseline.
# ─────────────────────────────────────────────────────────────────────────────
NOISE_PCT = 0.04  # ±4% band


def apply_noise(base_rate: int) -> int:
    """Apply ±NOISE_PCT random variation to a static rate."""
    factor = 1.0 + random.uniform(-NOISE_PCT, NOISE_PCT)
    return max(1, int(round(base_rate * factor)))


# ─────────────────────────────────────────────────────────────────────────────
# TREND CLASSIFIER
# Based only on Cloudflare Radar DNS rank delta — not Groq AI or OPR.
# ─────────────────────────────────────────────────────────────────────────────
def classify_trend_from_rank_delta(old_rank: int, new_rank: int) -> str:
    """Classify trend from CF Radar rank movement."""
    if old_rank <= 0 or new_rank <= 0:
        return "stable"
    delta_pct = (old_rank - new_rank) / float(old_rank)  # positive = improving rank
    if delta_pct > 0.10:
        return "surging"
    elif delta_pct > 0.02:
        return "growing"
    elif delta_pct < -0.10:
        return "cooling"
    return "stable"


# ─────────────────────────────────────────────────────────────────────────────
# VOLATILITY
# Measures how much the CF Radar rank moved relative to static rank.
# Positive = improving (rank number dropped), negative = falling.
# ─────────────────────────────────────────────────────────────────────────────
def compute_volatility(static_rank: int, cf_rank: int | None) -> float:
    """
    Returns a volatility score (%) based on CF Radar rank vs. static rank.
    Positive = CF says site is ranked BETTER than our static estimate.
    Negative = CF says site is ranked WORSE.
    """
    if cf_rank is None or cf_rank <= 0:
        return 0.0
    # Positive when cf_rank < static_rank (CF says it's more popular)
    return round(((static_rank - cf_rank) / float(static_rank)) * 100.0, 2)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENGINE
# ─────────────────────────────────────────────────────────────────────────────
def run_pulse_engine(run_validation_report: bool = True):
    print("=" * 60)
    print("Pulse Traffic Engine v2.0 (Static-First)")
    print("rank/baseline/rate <- STATIC_BASELINES (immutable)")
    print("volatility/trend   <- CF Radar + Google Trends signals")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Engine Error] Supabase credentials missing. Check .env.local")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # ── 1. Compute static ranks (derived, not fetched) ─────────────────────
    print("[1/4] Computing static ranks from STATIC_BASELINES...")
    rank_map = get_rank_map()
    print(f"  {len(rank_map)} sites ranked. Top 5: " +
          ", ".join(f"{sid}=#{r}" for sid, r in list(rank_map.items())[:5]))

    # ── 2. Fetch existing DB rows (for old_rank / old_rate references) ─────
    print("[2/4] Fetching current DB rows from Supabase...")
    res = supabase.table("sites").select("id, rank, rate, url").execute()
    db_sites = res.data or []
    db_lookup: dict[str, dict] = {s["id"]: s for s in db_sites}
    print(f"  Found {len(db_sites)} rows in DB.")

    # ── 3. Fetch CF Radar ranks for volatility/trend only ──────────────────
    print("[3/4] Fetching Cloudflare Radar ranks (for volatility/trend signals)...")
    cf_ranks = fetch_cloudflare_radar_ranks()
    print(f"  CF Radar returned {len(cf_ranks)} domain ranks.")

    # ── 4. Fetch Google Trends for trend label enrichment ──────────────────
    print("[3/4] Fetching Google Trends momentum signals...")
    all_domains = [
        parse_domain(db_lookup[sid]["url"])
        for sid in STATIC_BASELINES
        if sid in db_lookup and db_lookup[sid].get("url")
    ]
    trends_map = fetch_google_trends_momentum(all_domains, batch_size=5)

    # ── 5. Update every site in Supabase ───────────────────────────────────
    print("[4/4] Syncing all sites to Supabase...")
    updates_count = 0
    updated_sites = []
    google_monthly = STATIC_BASELINES.get("google", 85_000_000_000)

    for site_id, monthly_visits in STATIC_BASELINES.items():
        db_row = db_lookup.get(site_id, {})
        domain = parse_domain(db_row.get("url", "")) if db_row else ""

        # ── Core values from static (immutable) ────────────────────────────
        static_rank = rank_map[site_id]
        baseline_str = get_baseline_str(monthly_visits)
        base_rate = get_rate(monthly_visits)
        progress = round((monthly_visits / google_monthly) * 100.0, 2)

        # ── Dynamic rate: static ± noise band ──────────────────────────────
        display_rate = apply_noise(base_rate)

        # ── Volatility: CF Radar rank vs. static rank ───────────────────────
        cf_rank = cf_ranks.get(domain) if domain else None
        volatility = compute_volatility(static_rank, cf_rank)

        # ── Trend: combine CF rank delta + Google Trends ────────────────────
        old_cf_rank = db_row.get("rank", static_rank)  # previous DB rank as proxy
        cf_trend = classify_trend_from_rank_delta(old_cf_rank, cf_rank or static_rank)
        trends_score = trends_map.get(domain, 0.0)
        if trends_score >= 0.5 and cf_trend in ("stable", "growing"):
            trend = "surging"
        elif trends_score >= 0.2:
            trend = "growing"
        elif trends_score <= -0.4:
            trend = "cooling"
        else:
            trend = cf_trend

        update_payload = {
            "rank": static_rank,
            "baseline": baseline_str,
            "rate": display_rate,
            "progress": progress,
            "volatility": volatility,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            supabase.table("sites").update(update_payload).eq("id", site_id).execute()
            updates_count += 1
            cf_note = f"CF=#{cf_rank}" if cf_rank else "CF=n/a"
            print(f"  {site_id:20s} | #{static_rank:3d} | {baseline_str:12s} | {display_rate:5d}/s | Vol:{volatility:+6.1f}% | {trend} | {cf_note}")
            updated_sites.append({
                "id": site_id,
                "rank": static_rank,
                "rate": display_rate,
                "baseline": baseline_str,
            })
        except Exception as e:
            print(f"  X Failed to update {site_id}: {e}")

        # Log to site_history
        try:
            supabase.table("site_history").insert({
                "site_id": site_id,
                "rank": static_rank,
                "rate": display_rate,
                "volatility": volatility,
                "pti_score": 0.0,  # PTI score deprecated in v2.0
            }).execute()
        except Exception as e:
            print(f"  [Warning] site_history insert failed for {site_id}: {e}")

    print()
    print(f"SUCCESS: Engine v2.0 updated {updates_count}/{len(STATIC_BASELINES)} sites.")

    # ── 6. Write weekly snapshot ────────────────────────────────────────────
    print("[Weekly] Writing weekly snapshot to Supabase...")
    try:
        now_utc = datetime.now(timezone.utc)
        iso_week = now_utc.isocalendar()
        week_slug = f"{iso_week.year}-w{str(iso_week.week).zfill(2)}"

        db_lookup_full = {s["id"]: s for s in db_sites}
        sites_data = []
        category_totals: dict[str, dict] = {}
        total_rate = 0

        for upd in updated_sites:
            sid = upd["id"]
            orig = db_lookup_full.get(sid, {})
            cat = orig.get("category", "general")
            entry = {
                "id": sid,
                "name": orig.get("name", sid),
                "url": orig.get("url", ""),
                "rank": upd["rank"],
                "rate": upd["rate"],
                "baseline": upd["baseline"],
                "category": cat,
                "color": orig.get("color", "#888"),
                "logo": orig.get("logo", sid[:2].upper()),
                "keywords": orig.get("keywords"),
            }
            sites_data.append(entry)
            total_rate += upd["rate"]
            category_totals.setdefault(cat, {"count": 0, "totalRate": 0})
            category_totals[cat]["count"] += 1
            category_totals[cat]["totalRate"] += upd["rate"]

        sites_data.sort(key=lambda s: s["rank"])
        outage_count = fetch_cloudflare_outage_count()

        supabase.table("weekly_snapshots").upsert({
            "week_slug": week_slug,
            "snapshot_date": now_utc.isoformat(),
            "sites_data": sites_data,
            "category_totals": category_totals,
            "total_rate": total_rate,
            "outage_count": outage_count,
        }, on_conflict="week_slug").execute()
        print(f"  Snapshot written: {week_slug} ({len(sites_data)} sites, total_rate={total_rate}/s)")
    except Exception as e:
        print(f"  [Warning] Could not write weekly snapshot: {e}")

    print("=" * 60)
    print("Pulse Engine v2.0 completed.")
    print("=" * 60)


if __name__ == "__main__":
    run_pulse_engine()
