import os
import sys
from pathlib import Path

# Add project root to python path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from supabase import create_client, Client
from scripts.pulse_engine.config import SUPABASE_URL, SUPABASE_KEY
from scripts.pulse_engine.signals import (
    parse_domain,
    fetch_cloudflare_radar_ranks,
    fetch_open_pagerank,
    fetch_groq_momentum
)
from scripts.pulse_engine.pti_model import estimate_traffic_and_pti, classify_trend

def run_pulse_engine():
    print("=" * 60)
    print("Starting Pulse Traffic Index (PTI) Engine v1.1")
    print("Signals: Cloudflare Radar | PageRank | Groq AI Momentum")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Engine Error] Supabase URL or Service Role Key missing. Check .env.local")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Fetch current sites from database (including existing rates for smoothing)
    print("[1/5] Querying sites from Supabase...")
    res = supabase.table("sites").select("*").order("rank", desc=False).execute()
    sites = res.data or []
    if not sites:
        print("[Engine Warning] No sites found in Supabase database.")
        return
    print(f"Loaded {len(sites)} sites from database.")

    # 2. Fetch fresh rankings from Cloudflare Radar (top 500)
    print("[2/5] Syncing Cloudflare Radar DNS ranks (top 500)...")
    cf_ranks = fetch_cloudflare_radar_ranks()

    # 3. Query Open PageRank for domain authority
    print("[3/5] Querying Open PageRank scores...")
    domain_list = [parse_domain(s.get("url", "")) for s in sites if s.get("url")]
    opr_map = fetch_open_pagerank(domain_list)

    # 4. Groq AI Momentum Signal (Signal 4)
    print("[4/5] Computing Groq AI momentum signal...")
    # Build a lightweight snapshot of the current sites for Groq analysis
    sites_snapshot = [
        {
            "id": s.get("id"),
            "name": s.get("name", s.get("id", "")),
            "rank": cf_ranks.get(parse_domain(s.get("url", "")), s.get("rank", 999)),
            "category": s.get("category", "general")
        }
        for s in sites
    ]
    momentum_map = fetch_groq_momentum(sites_snapshot)

    # 5. Process all domains through the PTI model
    print("[5/5] Computing PTI metrics and updating database...")
    updates_count = 0

    # Determine max_rate anchor using Google (rank #1 with max authority)
    from scripts.pulse_engine.pti_model import estimate_traffic_and_pti as _est
    max_rate = _est(rank=1, page_rank=10.0, momentum_score=0.0, previous_rate=0)[2]

    for site in sites:
        site_id = site.get("id")
        url = site.get("url", "")
        domain = parse_domain(url)
        old_rank = site.get("rank", 999)
        old_rate = site.get("rate", 0)

        # Updated rank from Cloudflare Radar (falls back to existing DB rank)
        new_rank = cf_ranks.get(domain, old_rank)

        # Open PageRank authority
        opr_info = opr_map.get(domain, {})
        page_rank = opr_info.get("page_rank", 5.0)

        # Groq AI momentum
        momentum = momentum_map.get(site_id, {})
        momentum_score = momentum.get("momentum_score", 0.0)
        trend_label = momentum.get("trend_label", "")

        # Run PTI model (all 4 signals + smoothing)
        monthly_visits, daily_visits, rate, pti_score, baseline = estimate_traffic_and_pti(
            rank=new_rank,
            page_rank=page_rank,
            momentum_score=momentum_score,
            previous_rate=old_rate
        )

        # Classify trend using both rate delta and Groq signal
        final_trend = trend_label or classify_trend(old_rate, rate, momentum_score)
        progress = round(min(100.0, (rate / float(max_rate)) * 100.0), 2)

        update_payload = {
            "rank": new_rank,
            "rate": rate,
            "baseline": baseline,
            "progress": progress,
        }

        try:
            supabase.table("sites").update(update_payload).eq("id", site_id).execute()
            updates_count += 1
            momentum_info = f"Momentum: {momentum_score:+.2f} ({final_trend})" if momentum_score != 0 else f"Trend: {final_trend}"
            print(f"  -> [{site_id}] Rank: #{new_rank} | Rate: {rate}/s | PTI: {pti_score} | {momentum_info}")
        except Exception as e:
            print(f"  X Failed to update {site_id}: {e}")

    print("=" * 60)
    print(f"SUCCESS: PTI v1.1 Engine finished! Updated {updates_count}/{len(sites)} sites.")
    cf_coverage = round((len([s for s in sites if parse_domain(s.get("url","")) in cf_ranks]) / len(sites)) * 100, 1)
    groq_coverage = round((len(momentum_map) / min(30, len(sites))) * 100, 1)
    print(f"Coverage:  Cloudflare Radar {cf_coverage}% | Groq AI {groq_coverage}%")
    print("=" * 60)

if __name__ == "__main__":
    run_pulse_engine()
