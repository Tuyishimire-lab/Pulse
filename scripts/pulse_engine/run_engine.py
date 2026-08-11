import os
import sys
import json
from datetime import datetime, timezone
from pathlib import Path

# Add project root to python path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from supabase import create_client, Client
from scripts.pulse_engine.config import SUPABASE_URL, SUPABASE_KEY
from scripts.pulse_engine.signals import (
    parse_domain,
    fetch_cloudflare_radar_ranks,
    fetch_tranco_ranks,
    merge_rank_sources,
    fetch_open_pagerank,
    fetch_groq_momentum,
    fetch_google_trends_momentum,
    fetch_cloudflare_outage_count
)
from scripts.pulse_engine.pti_model import estimate_traffic_and_pti, classify_trend
from scripts.pulse_engine.validation import run_validation, print_validation_report

# ─────────────────────────────────────────────────────────────────────────────
# RANK OVERRIDES
# Cloudflare Radar measures DNS query volume, which structurally under-counts
# AI platforms (single-page apps + API calls don't generate DNS lookups per
# pageview) and some large apps (WhatsApp, TikTok) that route via mobile SDKs.
# These overrides pin the rank to the real-world value (SimilarWeb/Semrush 2026)
# so the Zipf model produces accurate baselines consistent with sites.ts.
# ─────────────────────────────────────────────────────────────────────────────
RANK_OVERRIDES: dict[str, int] = {
    "chatgpt":   5,    # SimilarWeb rank #5 globally; DNS under-counts SPA visits
    "openai":    16,   # openai.com docs/API — same SPA issue
    "claude":    25,   # Anthropic Claude (rapid growth)
    "gemini":    28,   # Google Gemini web
    "copilot":   32,   # Microsoft Copilot
    "perplexity":38,   # Perplexity AI
    "whatsapp":  9,    # Mostly mobile SDK — DNS volume doesn't reflect users
    "tiktok":    10,   # Mostly mobile SDK
}

def run_pulse_engine(run_validation_report: bool = True):
    print("=" * 60)
    print("Pulse Traffic Index (PTI) Engine v1.2")
    print("Signals: CF Radar + Tranco | PageRank | Groq AI (all sites)")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Engine Error] Supabase URL or Service Role Key missing. Check .env.local")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Fetch all sites from Supabase
    print("[1/6] Querying sites from Supabase...")
    res = supabase.table("sites").select("*").order("rank", desc=False).execute()
    sites = res.data or []
    if not sites:
        print("[Engine Warning] No sites found in Supabase database.")
        return
    print(f"Loaded {len(sites)} sites.")

    # 2a. Cloudflare Radar ranks (top 100, highest precision)
    print("[2/6] Signal 1a — Cloudflare Radar (top 100 DNS ranks)...")
    cf_ranks = fetch_cloudflare_radar_ranks()

    # 2b. Tranco List ranks (aggregated top 5000, fills coverage gaps)
    print("[2/6] Signal 1b — Tranco List (top 5000 multi-source ranks)...")
    tranco_ranks = fetch_tranco_ranks(top_n=5000)

    # Merge: CF Radar takes precedence for domains it covers
    all_ranks = merge_rank_sources(cf_ranks, tranco_ranks)
    cf_matched = sum(1 for s in sites if parse_domain(s.get("url","")) in cf_ranks)
    tranco_matched = sum(1 for s in sites if parse_domain(s.get("url","")) in tranco_ranks)
    total_matched = sum(1 for s in sites if parse_domain(s.get("url","")) in all_ranks)
    print(
        f"Rank coverage: CF Radar {cf_matched}/{len(sites)} | "
        f"Tranco {tranco_matched}/{len(sites)} | "
        f"Total {total_matched}/{len(sites)} ({round(total_matched/len(sites)*100)}%)"
    )

    # 3. Open PageRank authority scores
    print("[3/6] Signal 2 — Open PageRank authority scores...")
    domain_list = [parse_domain(s.get("url", "")) for s in sites if s.get("url")]
    opr_map = fetch_open_pagerank(domain_list)

    # 4. Groq AI momentum for ALL sites (batched)
    print("[4/6] Signal 4 — Groq AI momentum (all 100 sites, batched)...")
    sites_snapshot = [
        {
            "id": s.get("id"),
            "name": s.get("name", s.get("id", "")),
            "rank": all_ranks.get(parse_domain(s.get("url", "")), s.get("rank", 999)),
            "category": s.get("category", "general")
        }
        for s in sites
    ]
    momentum_map = fetch_groq_momentum(sites_snapshot, batch_size=30)

    # 4b. Google Trends momentum for ALL sites
    print("[4/6] Signal 5 — Google Trends human search momentum...")
    trends_map = fetch_google_trends_momentum(domain_list, batch_size=5)

    # 5. Compute PTI metrics and update Supabase
    print("[5/6] Computing PTI v1.2 metrics and syncing to database...")
    updates_count = 0

    # Compute max_rate anchor
    from scripts.pulse_engine.pti_model import estimate_traffic_and_pti as _est
    max_rate = _est(rank=1, page_rank=10.0, momentum_score=0.0, previous_rate=0)[2]

    updated_sites = []  # track for validation
    for site in sites:
        site_id = site.get("id")
        url = site.get("url", "")
        domain = parse_domain(url)
        old_rank = site.get("rank", 999)
        old_rate = site.get("rate", 0)

        # Best available rank (overrides > CF Radar > Tranco > existing DB)
        # RANK_OVERRIDES take priority for sites where DNS-based ranking is
        # structurally inaccurate (AI platforms, mobile-SDK-first apps).
        if site_id in RANK_OVERRIDES:
            new_rank = RANK_OVERRIDES[site_id]
        else:
            new_rank = all_ranks.get(domain, old_rank)

        # Open PageRank authority
        opr_info = opr_map.get(domain, {})
        page_rank = opr_info.get("page_rank", 5.0)

        # Groq AI momentum
        momentum = momentum_map.get(site_id, {})
        groq_momentum_score = momentum.get("momentum_score", 0.0)
        trend_label = momentum.get("trend_label", "")

        # Google Trends momentum
        trends_momentum_score = trends_map.get(domain, 0.0)

        # Hybrid Momentum (50% AI Context, 50% Human Search Trend)
        momentum_score = round((groq_momentum_score * 0.5) + (trends_momentum_score * 0.5), 2)

        # Run all 5 signals through PTI model
        category = site.get("category", "general")
        monthly_visits, daily_visits, rate, pti_score, baseline = estimate_traffic_and_pti(
            rank=new_rank,
            page_rank=page_rank,
            momentum_score=momentum_score,
            previous_rate=old_rate,
            category=category,
            site_id=site_id
        )

        final_trend = trend_label or classify_trend(old_rate, rate, momentum_score)
        progress = round(min(100.0, (rate / float(max_rate)) * 100.0), 2)
        
        # Volatility Score
        volatility = 0.0
        if old_rate > 0:
            volatility = round(((rate - old_rate) / float(old_rate)) * 100.0, 2)

        update_payload = {
            "rank": new_rank,
            "rate": rate,
            "baseline": baseline,
            "progress": progress,
            "volatility": volatility,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            supabase.table("sites").update(update_payload).eq("id", site_id).execute()
            updates_count += 1
            momentum_info = (
                f"Momentum: {momentum_score:+.2f} ({final_trend})"
                if momentum_score != 0 else f"Trend: {final_trend}"
            )
            rank_source = "CF" if domain in cf_ranks else ("Tr" if domain in tranco_ranks else "DB")
            print(f"  [{rank_source}] {site_id} | Rank #{new_rank} | Rate {rate}/s | PTI {pti_score} | Vol: {volatility:+.1f}% | {momentum_info}")
            updated_sites.append({"id": site_id, "rank": new_rank, "rate": rate, "baseline": baseline})
        except Exception as e:
            if "volatility" in str(e):
                # Fallback if column not created yet
                update_payload.pop("volatility", None)
                supabase.table("sites").update(update_payload).eq("id", site_id).execute()
                updates_count += 1
                rank_source = "CF" if domain in cf_ranks else ("Tr" if domain in tranco_ranks else "DB")
                print(f"  [{rank_source}] {site_id} | Rank #{new_rank} | Rate {rate}/s | (Missing 'volatility' column in DB)")
                updated_sites.append({"id": site_id, "rank": new_rank, "rate": rate, "baseline": baseline})
            else:
                print(f"  X Failed to update {site_id}: {e}")

        # Log to site_history
        try:
            history_payload = {
                "site_id": site_id,
                "rank": new_rank,
                "rate": rate,
                "volatility": volatility,
                "pti_score": pti_score
            }
            supabase.table("site_history").insert(history_payload).execute()
        except Exception as e:
            print(f"  [Warning] Could not insert into site_history for {site_id}: {e}")

    print()
    print(f"SUCCESS: PTI v1.2 Engine updated {updates_count}/{len(sites)} sites.")

    # 5b. Upsert weekly_snapshots row
    print("[5b] Writing weekly snapshot to Supabase...")
    try:
        now_utc = datetime.now(timezone.utc)
        iso_week = now_utc.isocalendar()
        week_slug = f"{iso_week.year}-w{str(iso_week.week).zfill(2)}"

        # Build sites_data from the sites we fetched + updated this run
        sites_lookup = {s.get("id"): s for s in sites}
        sites_data = []
        category_totals = {}
        total_rate = 0

        for upd in updated_sites:
            sid = upd["id"]
            orig = sites_lookup.get(sid, {})
            cat = orig.get("category", "general")
            entry = {
                "id": sid,
                "name": orig.get("name", sid),
                "url": orig.get("url", ""),
                "rank": upd.get("rank", orig.get("rank", 999)),
                "rate": upd["rate"],
                "baseline": upd["baseline"],
                "category": cat,
                "color": orig.get("color", "#888"),
                "logo": orig.get("logo", sid[:2].upper()),
                "keywords": orig.get("keywords"),
            }
            sites_data.append(entry)
            total_rate += upd["rate"]
            if cat not in category_totals:
                category_totals[cat] = {"count": 0, "totalRate": 0}
            category_totals[cat]["count"] += 1
            category_totals[cat]["totalRate"] += upd["rate"]

        # Ensure sites_data is sorted by rank ascending
        sites_data.sort(key=lambda s: s["rank"])

        outage_count = fetch_cloudflare_outage_count()

        snapshot_payload = {
            "week_slug": week_slug,
            "snapshot_date": now_utc.isoformat(),
            "sites_data": sites_data,
            "category_totals": category_totals,
            "total_rate": total_rate,
            "outage_count": outage_count,
        }
        supabase.table("weekly_snapshots").upsert(snapshot_payload, on_conflict="week_slug").execute()
        print(f"  Snapshot written: {week_slug} ({len(sites_data)} sites, total_rate={total_rate}/s)")
    except Exception as e:
        print(f"  [Warning] Could not write weekly snapshot: {e}")

    # 6. Validation report
    if run_validation_report:
        print("[6/6] Running accuracy validation against public benchmarks...")
        report = run_validation(updated_sites)
        print_validation_report(report)

    print("=" * 60)
    print("PTI v1.2 Engine completed.")
    print("=" * 60)
    print()
    
    # 7. Auto-Tuner Recommendation
    from scripts.pulse_engine.auto_tuner import run_auto_tuner
    run_auto_tuner()

if __name__ == "__main__":
    run_pulse_engine(run_validation_report=True)
