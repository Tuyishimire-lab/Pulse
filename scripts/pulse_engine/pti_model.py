import math
from typing import Dict, Any, Tuple
from .config import ANCHOR_MONTHLY, ZIPF_EXPONENT

def estimate_traffic_and_pti(
    rank: int,
    page_rank: float = 5.0,
    momentum_score: float = 0.0,
    previous_rate: int = 0
) -> Tuple[int, int, int, float, str]:
    """
    Computes Pulse Traffic Index (PTI) metrics using 4 signals:
      Signal 1: Cloudflare Radar DNS rank (via `rank`)
      Signal 2: Open PageRank link authority (via `page_rank`)
      Signal 3: Search intent (applied upstream via rank quality)
      Signal 4: Groq AI momentum vector (via `momentum_score`, range -1.0 to +1.0)

    Returns:
      - monthly_visits (int)
      - daily_visits (int)
      - rate (visits / second, int) — with optional historical smoothing
      - pti_score (float, 0.0 to 100.0)
      - pretty_baseline (str, e.g. "85.0B / mo")
    """
    clamped_rank = max(1, rank)

    # ── Signal 1: Zipf Power Law Base ──────────────────────────────────────────
    monthly_visits = int(round(ANCHOR_MONTHLY / math.pow(clamped_rank, ZIPF_EXPONENT)))

    # ── Signal 2: Authority Multiplier ─────────────────────────────────────────
    # PageRank 0–10 maps to a multiplier range of 0.85 (low authority) → 1.15 (high authority)
    if page_rank > 0:
        auth_factor = 0.85 + (min(page_rank, 10.0) / 10.0) * 0.30
        monthly_visits = int(round(monthly_visits * auth_factor))

    # ── Signal 4: Groq AI Momentum Adjustment ──────────────────────────────────
    # momentum_score ranges from -1.0 (severe decline) to +1.0 (major surge)
    # Maps to a multiplier range of 0.90 (cooling) → 1.10 (surging)
    if momentum_score != 0.0:
        momentum_factor = 1.0 + (momentum_score * 0.10)  # max ±10% adjustment
        monthly_visits = int(round(monthly_visits * momentum_factor))

    daily_visits = int(round(monthly_visits / 30.4))
    raw_rate = max(1, int(round(daily_visits / 86400)))

    # ── Historical Smoothing (85% old / 15% new) ───────────────────────────────
    # Prevents sudden spikes from a single data point disrupting the displayed ticker.
    # Only applied when a previous rate exists (after the first run).
    if previous_rate > 0:
        rate = max(1, int(round(previous_rate * 0.85 + raw_rate * 0.15)))
    else:
        rate = raw_rate

    # ── PTI Score ──────────────────────────────────────────────────────────────
    # Logarithmic curve: Rank 1 → 100.0, Rank 10 → 85.0, Rank 100 → 70.0
    # Groq momentum nudges the score by up to ±5 points.
    base_pti = max(1.0, 100.0 - 15.0 * math.log10(clamped_rank))
    pti_score = round(min(100.0, max(1.0, base_pti + (momentum_score * 5.0))), 1)

    # ── Formatted Baseline String ───────────────────────────────────────────────
    if monthly_visits >= 1_000_000_000:
        pretty_baseline = f"{monthly_visits / 1_000_000_000:.1f}B / mo"
    elif monthly_visits >= 1_000_000:
        pretty_baseline = f"{monthly_visits / 1_000_000:.1f}M / mo"
    else:
        pretty_baseline = f"{monthly_visits / 1_000:.1f}K / mo"

    return monthly_visits, daily_visits, rate, pti_score, pretty_baseline

def classify_trend(previous_rate: int, current_rate: int, momentum_score: float = 0.0) -> str:
    """Classifies domain growth trajectory, blending rate delta with Groq AI signal."""
    rate_trend = "stable"
    if previous_rate > 0:
        diff_pct = (current_rate - previous_rate) / float(previous_rate)
        if diff_pct > 0.05:
            rate_trend = "surging"
        elif diff_pct > 0.01:
            rate_trend = "growing"
        elif diff_pct < -0.05:
            rate_trend = "cooling"

    # Groq signal overrides if strong enough
    if momentum_score >= 0.6:
        return "surging"
    elif momentum_score >= 0.2 and rate_trend in ("stable", "growing"):
        return "growing"
    elif momentum_score <= -0.4:
        return "cooling"
    return rate_trend
