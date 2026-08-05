import math
from typing import Dict, Any, Tuple
from .config import ANCHOR_MONTHLY, ZIPF_EXPONENT

# Category Density Multipliers (Cm)
# Adjusts for app-first usage (streaming/chat) vs web link density (social/dev)
CATEGORY_MULTIPLIERS = {
    "video_platform": 12.0,
    "streaming": 0.8,
    "chat": 1.40,
    "social_network": 2.6,
    "community": 0.55,
    "developer": 0.85,
    "search": 1.00,
    "ecommerce": 1.5,
    "ai": 2.4,
    "general": 1.00
}

def normalize_category(cat_str: str) -> str:
    """Normalizes arbitrary category strings to canonical model keys."""
    cat = (cat_str or "").lower()
    if "youtube" in cat_str.lower() or "video platform" in cat: return "video_platform"
    if any(k in cat for k in ["stream", "media", "entertainment", "music"]): return "streaming"
    if any(k in cat for k in ["chat", "messaging", "communication"]): return "chat"
    if any(k in cat for k in ["reddit", "quora", "community", "forum", "wiki"]): return "community"
    if any(k in cat for k in ["social", "network"]): return "social_network"
    if any(k in cat for k in ["dev", "code", "tech", "software"]): return "developer"
    if any(k in cat for k in ["shop", "e-commerce", "store", "retail"]): return "ecommerce"
    if any(k in cat for k in ["search", "portal"]): return "search"
    if "ai" in cat or "chatgpt" in cat: return "ai"
    return "general"

def estimate_traffic_and_pti(
    rank: int,
    page_rank: float = 5.0,
    momentum_score: float = 0.0,
    previous_rate: int = 0,
    category: str = "general"
) -> Tuple[int, int, int, float, str]:
    """
    Computes Pulse Traffic Index (PTI) metrics using 4 signals:
      Signal 1: Cloudflare Radar DNS rank & Tranco rank (via `rank`)
      Signal 2: Open PageRank link authority (via `page_rank`)
      Signal 3: Search intent & category density (via `category`)
      Signal 4: Groq AI momentum vector (via `momentum_score`, range -1.0 to +1.0)
    """
    clamped_rank = max(1, rank)

    # ── Signal 1: Zipf Power Law Base ──────────────────────────────────────────
    monthly_visits = int(round(ANCHOR_MONTHLY / math.pow(clamped_rank, ZIPF_EXPONENT)))

    # ── Signal 2: Authority Multiplier ─────────────────────────────────────────
    if page_rank > 0:
        auth_factor = 0.85 + (min(page_rank, 10.0) / 10.0) * 0.30
        monthly_visits = int(round(monthly_visits * auth_factor))

    # ── Signal 3: Category Density Adjustment ──────────────────────────────────
    norm_cat = normalize_category(category)
    cat_multiplier = CATEGORY_MULTIPLIERS.get(norm_cat, 1.00)
    monthly_visits = int(round(monthly_visits * cat_multiplier))

    # ── Signal 4: Groq AI Momentum Adjustment ──────────────────────────────────
    if momentum_score != 0.0:
        momentum_factor = 1.0 + (momentum_score * 0.10)
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
