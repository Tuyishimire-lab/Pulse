"""
rank_arbiter.py - Collision-Free Rank Arbitration

Produces a guaranteed-unique {site_id: rank} mapping for all sites by:
  1. Scoring each site's best available rank by source priority
  2. Sorting all sites globally by (source_priority, raw_rank)
  3. Assigning clean sequential integers 1, 2, 3...

This means two sites can NEVER share a rank after arbitration, regardless of
what Cloudflare Radar, Tranco, or existing DB values say.

Source priority ladder (lower = higher priority):
  0  RANK_OVERRIDES  - human-curated; corrects structural DNS bias
  1  Cloudflare Radar - real-time DNS query volume, highest precision
  2  Tranco           - multi-source aggregated, very reliable
  3  OPR-adjusted     - Open PageRank used to break ties / fill gaps
  4  DB existing      - preserve last known good value as last resort
"""

from __future__ import annotations

import math


# ── Source priority constants ─────────────────────────────────────────────────
_PRI_OVERRIDE  = 0
_PRI_CF_RADAR  = 1
_PRI_TRANCO    = 2
_PRI_OPR       = 3
_PRI_DB        = 4

# Maximum rank used as a sentinel when no signal is available
_SENTINEL_RANK = 9_999


def _opr_adjusted_rank(page_rank: float, max_opr: float = 10.0) -> int:
    """Convert an Open PageRank score (0-10) to a rough pseudo-rank.

    Higher OPR → lower (better) rank. Produces values in [1, 500].
    Used only as a tiebreaker / gap-filler when DNS rank signals are absent.
    """
    if page_rank <= 0:
        return _SENTINEL_RANK
    # Invert: rank 1 = OPR 10, rank 500 = OPR ~0.1
    return max(1, min(500, int(round(500 * (1.0 - page_rank / max_opr)))))


def arbitrate_ranks(
    sites: list[dict],
    cf_ranks: dict[str, int],
    tranco_ranks: dict[str, int],
    opr_map: dict[str, dict],
    overrides: dict[str, int],
    domain_for: dict[str, str],  # site_id → parsed domain
) -> dict[str, int]:
    """Return a collision-free {site_id: rank} mapping for every site.

    Args:
        sites:       Full list of site dicts from Supabase (must have 'id', 'rank').
        cf_ranks:    {domain: rank} from Cloudflare Radar.
        tranco_ranks:{domain: rank} from Tranco.
        opr_map:     {domain: {'page_rank': float}} from Open PageRank.
        overrides:   {site_id: rank} hard pins (RANK_OVERRIDES).
        domain_for:  {site_id: domain} pre-computed domain map.

    Returns:
        {site_id: int} - sequential ranks 1..N, no duplicates, no gaps.
    """
    # ── Step 1: collect best candidate rank + priority for each site ──────────
    candidates: list[tuple[int, int, str]] = []  # (priority, raw_rank, site_id)

    for site in sites:
        site_id  = site.get("id", "")
        domain   = domain_for.get(site_id, "")
        db_rank  = site.get("rank", _SENTINEL_RANK) or _SENTINEL_RANK

        if site_id in overrides:
            priority = _PRI_OVERRIDE
            raw_rank = overrides[site_id]
        elif domain and domain in cf_ranks:
            priority = _PRI_CF_RADAR
            raw_rank = cf_ranks[domain]
        elif domain and domain in tranco_ranks:
            priority = _PRI_TRANCO
            raw_rank = tranco_ranks[domain]
        else:
            opr_score = opr_map.get(domain, {}).get("page_rank", 0.0)
            opr_rank  = _opr_adjusted_rank(opr_score)
            if opr_rank < _SENTINEL_RANK:
                priority = _PRI_OPR
                raw_rank = opr_rank
            else:
                priority = _PRI_DB
                raw_rank = db_rank

        candidates.append((priority, raw_rank, site_id))

    # ── Step 2: global sort → (priority ASC, raw_rank ASC, site_id ASC) ──────
    # Deterministic secondary sort on site_id prevents non-determinism when
    # two sites have identical (priority, raw_rank).
    candidates.sort(key=lambda t: (t[0], t[1], t[2]))

    # ── Step 3: assign sequential ranks 1..N ─────────────────────────────────
    result: dict[str, int] = {}
    for position, (priority, raw_rank, site_id) in enumerate(candidates, start=1):
        result[site_id] = position

    # ── Step 4: diagnostics ───────────────────────────────────────────────────
    override_sites = [sid for sid in overrides if sid in result]
    cf_count       = sum(1 for p, _, _ in candidates if p == _PRI_CF_RADAR)
    tranco_count   = sum(1 for p, _, _ in candidates if p == _PRI_TRANCO)
    opr_count      = sum(1 for p, _, _ in candidates if p == _PRI_OPR)
    db_count       = sum(1 for p, _, _ in candidates if p == _PRI_DB)

    print(
        f"[Arbiter] Assigned {len(result)} collision-free ranks | "
        f"Overrides: {len(override_sites)} | CF Radar: {cf_count} | "
        f"Tranco: {tranco_count} | OPR: {opr_count} | DB fallback: {db_count}"
    )
    if override_sites:
        sample = {sid: result[sid] for sid in override_sites[:8]}
        print(f"[Arbiter] Override placements: {sample}")

    # Sanity check - should always pass
    assert len(set(result.values())) == len(result), \
        "[Arbiter] BUG: duplicate ranks in output!"

    return result
