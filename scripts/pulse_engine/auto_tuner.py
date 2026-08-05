import sys
import math
import time
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from scripts.pulse_engine.validation import KNOWN_BENCHMARKS, run_validation
from scripts.pulse_engine.pti_model import normalize_category
from scripts.pulse_engine.config import SUPABASE_URL, SUPABASE_KEY
from scripts.pulse_engine.signals import fetch_cloudflare_radar_ranks, fetch_tranco_ranks, merge_rank_sources, parse_domain

from supabase import create_client

ANCHOR_MONTHLY = 85_000_000_000

def run_auto_tuner():
    print("=" * 60)
    print("PTI ENGINE: ML Auto-Tuner (Coordinate Descent)")
    print("=" * 60)

    print("[1/3] Fetching rank signals and known benchmarks...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
res = supabase.table('sites').select('*').execute()
sites = res.data or []

cf_ranks = fetch_cloudflare_radar_ranks()
tranco_ranks = fetch_tranco_ranks(top_n=5000)
all_ranks = merge_rank_sources(cf_ranks, tranco_ranks)

# Build benchmark dataset
benchmark_dataset = []
for site in sites:
    site_id = site.get('id')
    if site_id in KNOWN_BENCHMARKS:
        domain = parse_domain(site.get('url', ''))
        old_rank = site.get('rank', 999)
    res = supabase.table('sites').select('*').execute()
    sites = res.data or []

    cf_ranks = fetch_cloudflare_radar_ranks()
    tranco_ranks = fetch_tranco_ranks(top_n=5000)
    all_ranks = merge_rank_sources(cf_ranks, tranco_ranks)

    # Build benchmark dataset
    benchmark_dataset = []
    for site in sites:
        site_id = site.get('id')
        if site_id in KNOWN_BENCHMARKS:
            domain = parse_domain(site.get('url', ''))
            old_rank = site.get('rank', 999)
            new_rank = all_ranks.get(domain, old_rank)
            category = site.get('category', 'general')
            benchmark_dataset.append({
                'site_id': site_id,
                'rank': new_rank,
                'category': category
            })

    print(f"Loaded {len(benchmark_dataset)} benchmark domains.")

    # Initial parameters
    from scripts.pulse_engine.config import ZIPF_EXPONENT
    from scripts.pulse_engine.pti_model import CATEGORY_MULTIPLIERS
    
    best_zipf = ZIPF_EXPONENT
    best_multipliers = CATEGORY_MULTIPLIERS.copy()

    def evaluate_model(zipf: float, multipliers: dict) -> float:
        """Returns the mean error % for the given parameters."""
        updated_sites = []
        for item in benchmark_dataset:
            clamped_rank = max(1, item['rank'])
            monthly_visits = int(round(ANCHOR_MONTHLY / math.pow(clamped_rank, zipf)))
            norm_cat = normalize_category(item['category'])
            cat_multiplier = multipliers.get(norm_cat, 1.00)
            monthly_visits = int(round(monthly_visits * cat_multiplier))
            rate = max(1, int(round((monthly_visits / 30.4) / 86400)))
            updated_sites.append({'id': item['site_id'], 'rate': rate})
        
        report = run_validation(updated_sites)
        return report["mean_error_pct"]

    current_error = evaluate_model(best_zipf, best_multipliers)
    best_error = current_error
    print(f"[2/3] Baseline Mean Error (Current Config): {best_error}%")

    print("[3/3] Starting Coordinate Descent Optimization...")
    epochs = 3
    zipf_steps = [0.01, -0.01, 0.05, -0.05]
    mult_steps = [0.1, -0.1, 0.5, -0.5]

    for epoch in range(epochs):
        improved = False
        
        # Tune Zipf
        for step in zipf_steps:
            test_zipf = best_zipf + step
            if test_zipf < 1.0 or test_zipf > 1.5: continue
            err = evaluate_model(test_zipf, best_multipliers)
            if err < best_error:
                best_error = err
                best_zipf = test_zipf
                improved = True
                
        # Tune Multipliers
        for cat in best_multipliers.keys():
            if cat in ['search', 'general']: continue # keep anchor fixed
            for step in mult_steps:
                test_mults = best_multipliers.copy()
                test_mults[cat] = max(0.1, round(test_mults[cat] + step, 2))
                err = evaluate_model(best_zipf, test_mults)
                if err < best_error:
                    best_error = err
                    best_multipliers = test_mults
                    improved = True
                    
        if not improved:
            break # Local minima reached

    print("\n" + "=" * 60)
    print("OPTIMIZATION COMPLETE")
    print("=" * 60)
    print(f"Optimized Mean Error : {best_error}%")
    print(f"ZIPF_EXPONENT        : {round(best_zipf, 3)}")
    print("CATEGORY_MULTIPLIERS :")
    for cat, val in best_multipliers.items():
        print(f"  '{cat}': {round(val, 2)},")
    
    if best_error < current_error - 1.0:
        print("\nRecommendation: The optimized parameters offer a significant improvement.")
        print("Review the above values and manually update `config.py` and `pti_model.py` if acceptable.")
    else:
        print("\nRecommendation: The current configuration is optimal. No changes needed.")
    print("=" * 60)

if __name__ == "__main__":
    run_auto_tuner()
