import math
from typing import Dict, Any, Tuple
from .config import ANCHOR_MONTHLY, ZIPF_EXPONENT

def estimate_traffic_and_pti(rank: int, page_rank: float = 5.0) -> Tuple[int, int, int, float, str]:
    """
    Computes Pulse Traffic Index (PTI) metrics:
    - monthly_visits
    - daily_visits
    - rate (visits / second)
    - pti_score (0.0 to 100.0)
    - pretty_baseline (formatted string e.g., "85.0B / mo")
    """
    clamped_rank = max(1, rank)
    
    # 1. Zipf Power Law Base
    monthly_visits = int(round(ANCHOR_MONTHLY / math.pow(clamped_rank, ZIPF_EXPONENT)))
    
    # 2. Authority Multiplier (PageRank 0.0 - 10.0 elasticity adjustment)
    if page_rank > 0:
        auth_factor = 0.85 + (page_rank / 10.0) * 0.3  # ranges from 0.85 to 1.15
        monthly_visits = int(round(monthly_visits * auth_factor))

    daily_visits = int(round(monthly_visits / 30.4))
    rate = max(1, int(round(daily_visits / 86400)))

    # 3. Compute PTI Score (Normalized 0.0 - 100.0)
    # Logarithmic curve mapping rank 1 -> 100.0, rank 10 -> 85.0, rank 100 -> 70.0
    pti_score = max(1.0, round(100.0 - 15.0 * math.log10(clamped_rank), 1))

    # 4. Formatted Baseline String
    if monthly_visits >= 1_000_000_000:
        pretty_baseline = f"{monthly_visits / 1_000_000_000:.1f}B / mo"
    elif monthly_visits >= 1_000_000:
        pretty_baseline = f"{monthly_visits / 1_000_000:.1f}M / mo"
    else:
        pretty_baseline = f"{monthly_visits / 1_000:.1f}K / mo"

    return monthly_visits, daily_visits, rate, pti_score, pretty_baseline

def classify_trend(previous_rate: int, current_rate: int) -> str:
    """Classifies domain growth trajectory."""
    if previous_rate <= 0:
        return "stable"
    diff_pct = (current_rate - previous_rate) / float(previous_rate)
    if diff_pct > 0.05:
        return "surging"
    elif diff_pct > 0.01:
        return "growing"
    elif diff_pct < -0.05:
        return "cooling"
    else:
        return "stable"
