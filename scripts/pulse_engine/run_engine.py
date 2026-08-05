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
    fetch_open_pagerank
)
from scripts.pulse_engine.pti_model import estimate_traffic_and_pti, classify_trend

def run_pulse_engine():
    print("=" * 60)
    print("Starting Pulse Traffic Index (PTI) Engine v1.0")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Engine Error] Supabase URL or Service Role Key missing. Check .env.local")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Fetch current sites from database
    print("[1/4] Querying sites from Supabase...")
    res = supabase.table("sites").select("*").order("rank", desc=False).execute()
    sites = res.data or []
    if not sites:
        print("[Engine Warning] No sites found in Supabase database.")
        return

    print(f"Loaded {len(sites)} sites from database.")

    # 2. Fetch fresh rankings from Cloudflare Radar
    print("[2/4] Syncing Cloudflare Radar DNS ranks...")
    cf_ranks = fetch_cloudflare_radar_ranks()

    # 3. Query Open PageRank for domains
    print("[3/4] Querying Open PageRank scores...")
    domain_list = [parse_domain(s.get("url", "")) for s in sites if s.get("url")]
    opr_map = fetch_open_pagerank(domain_list)

    # 4. Process and compute PTI metrics for all domains
    print("[4/4] Computing PTI traffic metrics and updating database...")
    updates_count = 0
    max_rate = 1

    # First pass: determine max_rate (Google or rank #1)
    google_traffic = estimate_traffic_and_pti(1, 10.0)
    max_rate = google_traffic[2]

    for site in sites:
        site_id = site.get("id")
        url = site.get("url", "")
        domain = parse_domain(url)
        old_rank = site.get("rank", 999)
        old_rate = site.get("rate", 1)

        # Cloudflare Radar rank override if available
        new_rank = cf_ranks.get(domain, old_rank)

        # Open PageRank authority score
        opr_info = opr_map.get(domain, {})
        page_rank = opr_info.get("page_rank", 5.0)

        # Compute PTI Model metrics
        monthly_visits, daily_visits, rate, pti_score, baseline = estimate_traffic_and_pti(
            rank=new_rank, 
            page_rank=page_rank
        )

        progress = round(min(100.0, (rate / float(max_rate)) * 100.0), 2)
        trend = classify_trend(old_rate, rate)

        # Update Supabase
        update_payload = {
            "rank": new_rank,
            "rate": rate,
            "baseline": baseline,
            "progress": progress
        }

        try:
            supabase.table("sites").update(update_payload).eq("id", site_id).execute()
            updates_count += 1
            print(f"  -> [{site_id}] Rank: #{new_rank} | Rate: {rate}/s | Baseline: {baseline} | PTI Score: {pti_score}")
        except Exception as e:
            print(f"  X Failed to update {site_id}: {e}")

    print("=" * 60)
    print(f"SUCCESS: PTI Engine finished! Updated {updates_count}/{len(sites)} sites.")
    print("=" * 60)

if __name__ == "__main__":
    run_pulse_engine()
