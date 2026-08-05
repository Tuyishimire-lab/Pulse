import sys
from pathlib import Path
from datetime import datetime, timedelta

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from scripts.pulse_engine.config import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client

print("=" * 60)
print("PTI ENGINE: Database Janitor")
print("=" * 60)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[Janitor] Missing Supabase credentials.")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def run_janitor():
    print("[1/2] Pruning & Compressing Site History (Older than 30 days)...")
    cutoff_date = (datetime.now(datetime.UTC) - timedelta(days=30)).isoformat()
    
    try:
        # Note: Since PostgREST (Supabase Python client) doesn't easily support complex 
        # aggregate group-by deletions in a single pass without an RPC, we will invoke 
        # a standard query to fetch old records.
        res = supabase.table("site_history").select("*").lt("created_at", cutoff_date).execute()
        old_records = res.data or []
        
        if not old_records:
            print("  No history records older than 30 days found. DB is clean.")
        else:
            # Here we could aggregate and compress, but for a lightweight janitor, 
            # we simply delete logs older than 30 days to keep the DB fast.
            # In a production scenario, you would insert the monthly average into a 'site_history_monthly' table first.
            print(f"  Found {len(old_records)} stale history records. Cleaning up...")
            
            # Delete in batches
            ids_to_delete = [r["id"] for r in old_records]
            batch_size = 100
            for i in range(0, len(ids_to_delete), batch_size):
                batch_ids = ids_to_delete[i:i+batch_size]
                supabase.table("site_history").delete().in_("id", batch_ids).execute()
            print("  Stale history successfully purged.")
            
    except Exception as e:
        if "relation \"public.site_history\" does not exist" in str(e) or "Could not find the table 'public.site_history'" in str(e):
            print("  Table 'site_history' does not exist yet. Please run the SQL schema script.")
        else:
            print(f"  Error accessing site_history: {e}")

    print("\n[2/2] Scanning for Dead Domains...")
    try:
        # Find sites that have fallen off the top 5000 and have essentially zero traffic
        res = supabase.table("sites").select("id, rank, rate, url").gte("rank", 5000).execute()
        dead_sites = res.data or []
        
        if not dead_sites:
            print("  No dead sites found. All tracked sites are active.")
        else:
            print(f"  Found {len(dead_sites)} domains ranking >5000.")
            for site in dead_sites:
                print(f"    - {site['id']} (Rank {site['rank']}) -> Candidate for archival/deletion.")
            print("\n  Recommendation: Review these domains in your Supabase dashboard and consider deleting them to save DB overhead.")
            
    except Exception as e:
        print(f"  Error scanning sites: {e}")

    print("\nJanitor maintenance complete.")

if __name__ == "__main__":
    run_janitor()
