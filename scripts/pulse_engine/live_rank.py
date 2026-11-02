"""
live_rank.py - Live PTI rank (Engine v3)

The curated monthly baselines in static_baselines.py remain the anchor. Each day the
engine adjusts every baseline by how the site's Tranco rank has moved since the date
those baselines were calibrated (BASELINE_ANCHOR_DATE), then re-ranks all sites by the
adjusted estimate.

    adjusted = baseline * clamp((tranco_rank_at_anchor / tranco_rank_now) ** ELASTICITY, ±MAX_ADJUST)

Why this shape:
  - It compares a site with ITSELF over time, so it is unaffected by the fact that our
    200-site catalog rank is not the same scale as a global rank list.
  - Tranco is a 30-day average of several sources, so day-to-day moves are small and real.
  - Elasticity < 1 and a ±15% clamp keep curated numbers dominant.
  - Protected anchors (audited / filing-backed numbers) are never adjusted.
  - No data for a site (or a failed fetch) => factor 1.0. Nothing is ever simulated.
"""

from __future__ import annotations

import re

ELASTICITY = 0.6     # visits ~ rank^-k; dampened below the ~1.0–1.5 seen in the anchor table
MAX_ADJUST = 0.15    # max ±15% deviation from the curated baseline

# Audited / filing-backed baselines: never adjusted by rank signals.
PROTECTED_ANCHORS = {
    "google", "youtube", "facebook", "instagram", "chatgpt", "wikipedia",
    "amazon", "x", "whatsapp", "reddit", "tiktok", "apple", "microsoft",
}

# Two-label public suffixes where the registrable domain has three labels (e.g. bbc.co.uk).
_CC_SLD = re.compile(r"\.(co|com|org|net|ac|gov)\.[a-z]{2}$")


def host_of(url: str) -> str:
    h = re.sub(r"^https?://", "", (url or "").strip(), flags=re.IGNORECASE)
    h = re.sub(r"^www\.", "", h, flags=re.IGNORECASE)
    return h.split("/")[0].split(":")[0].lower()


def registrable(host: str) -> str:
    parts = host.split(".")
    keep = 3 if _CC_SLD.search(host) else 2
    return ".".join(parts[-keep:]) if len(parts) > keep else host


def resolve_tranco_domains(site_urls: dict[str, str]) -> dict[str, str | None]:
    """
    Map site_id -> domain to look up in Tranco (which lists registrable domains only).
    Subdomain sites (music.apple.com, aws.amazon.com) map to their parent ONLY if the
    parent isn't another catalog site; otherwise they'd just mirror that site's signal.
    """
    hosts = {sid: host_of(u) for sid, u in site_urls.items()}
    catalog_domains = {h for h in hosts.values() if registrable(h) == h}
    out: dict[str, str | None] = {}
    for sid, h in hosts.items():
        reg = registrable(h)
        if reg == h:
            out[sid] = h
        elif reg in catalog_domains:
            out[sid] = None
        else:
            out[sid] = reg
    return out


def adjustment_factor(anchor_rank: int | None, now_rank: int | None) -> float:
    if not anchor_rank or not now_rank or anchor_rank <= 0 or now_rank <= 0:
        return 1.0
    raw = (anchor_rank / now_rank) ** ELASTICITY
    return max(1.0 - MAX_ADJUST, min(1.0 + MAX_ADJUST, raw))


def compute_live(
    baselines: dict[str, int],
    tranco_domains: dict[str, str | None],
    tranco_now: dict[str, int],
    tranco_anchor: dict[str, int],
) -> dict[str, dict]:
    """Returns {site_id: {adjusted, factor, tranco_now, tranco_anchor, reason}}."""
    out: dict[str, dict] = {}
    for sid, base in baselines.items():
        dom = tranco_domains.get(sid)
        a = tranco_anchor.get(dom) if dom else None
        n = tranco_now.get(dom) if dom else None
        if sid in PROTECTED_ANCHORS:
            factor, reason = 1.0, "protected"
        elif not dom:
            factor, reason = 1.0, "no-domain"
        elif a is None or n is None:
            factor, reason = 1.0, "not-in-tranco"
        else:
            factor, reason = adjustment_factor(a, n), "tranco"
        out[sid] = {
            "adjusted": max(1, int(round(base * factor))),
            "factor": factor,
            "tranco_now": n,
            "tranco_anchor": a,
            "reason": reason,
        }
    return out


def rank_by_value(values: dict[str, int]) -> dict[str, int]:
    """Collision-free ranks: value DESC, then site_id ASC (same tiebreak as get_rank_map)."""
    ordered = sorted(values.items(), key=lambda kv: (-kv[1], kv[0]))
    return {sid: i for i, (sid, _) in enumerate(ordered, start=1)}

