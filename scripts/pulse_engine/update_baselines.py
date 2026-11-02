"""
update_baselines.py - Monthly baseline recalibration (Engine v3)

Runs on the 1st of each month (and on demand). It "bakes in" the live adjustments the
daily engine has been applying, then moves BASELINE_ANCHOR_DATE to today so the next
month's adjustments start from fresh, recalibrated baselines.

For each non-protected site with Tranco data at both dates:
    new_baseline = baseline x clamp((tranco_at_anchor / tranco_now) ** ELASTICITY, ±15%)
Changes under 5% are skipped to avoid churn. Same formula/safeguards as live_rank.py.

Domains come from the Supabase `sites` table (all catalog sites), not a hardcoded list.
"""

import re
import sys
from datetime import date
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from scripts.pulse_engine.config import SUPABASE_KEY, SUPABASE_URL
from scripts.pulse_engine.live_rank import compute_live, resolve_tranco_domains
from scripts.pulse_engine.signals import fetch_tranco_list
from scripts.pulse_engine.static_baselines import BASELINE_ANCHOR_DATE, STATIC_BASELINES
from supabase import create_client

MIN_CHANGE_PCT = 5.0
BASELINES_PATH = Path(__file__).parent / "static_baselines.py"


def rewrite_baselines(updated: dict[str, int], new_anchor_date: str) -> None:
    """Rewrite STATIC_BASELINES values and BASELINE_ANCHOR_DATE in static_baselines.py."""
    source = BASELINES_PATH.read_text(encoding="utf-8")

    def replacement(m: re.Match) -> str:
        new_val = updated.get(m.group(1))
        if new_val is None:
            return m.group(0)
        return m.group(0).replace(m.group(2), f"{new_val:_}")

    source = re.sub(r'"(\w+)":\s+([\d_]+),', replacement, source)
    source = re.sub(r'BASELINE_ANCHOR_DATE: str = "[\d-]+"', f'BASELINE_ANCHOR_DATE: str = "{new_anchor_date}"', source)
    source = re.sub(r"Last updated: [\d-]+", f"Last updated: {new_anchor_date}", source)
    BASELINES_PATH.write_text(source, encoding="utf-8")
    print(f"  Rewrote {BASELINES_PATH.name} (anchor date -> {new_anchor_date}).")


def run_baseline_update():
    print("=" * 60)
    print("Pulse Baseline Recalibration (Engine v3)")
    print(f"Current anchor date: {BASELINE_ANCHOR_DATE}")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Error] Supabase credentials missing.")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    rows = supabase.table("sites").select("id, url").execute().data or []
    urls = {r["id"]: r.get("url", "") for r in rows}
    print(f"[1/3] {len(STATIC_BASELINES)} baselines, {len(urls)} DB urls.")

    today = date.today().isoformat()
    tranco_now, now_date = fetch_tranco_list(today, 100_000, search_days=3, direction=-1)
    tranco_anchor, anchor_date = fetch_tranco_list(BASELINE_ANCHOR_DATE, 100_000, search_days=5, direction=+1)
    if not tranco_now or not tranco_anchor:
        print("[2/3] Tranco unavailable - nothing changed.")
        return
    print(f"[2/3] Tranco {anchor_date} -> {now_date}")

    domains = resolve_tranco_domains({sid: urls.get(sid, "") for sid in STATIC_BASELINES})
    live = compute_live(STATIC_BASELINES, domains, tranco_now, tranco_anchor)

    print("[3/3] Applying changes >= 5%...")
    updated: dict[str, int] = {}
    for sid, info in live.items():
        if info["reason"] != "tranco":
            continue
        old = STATIC_BASELINES[sid]
        change = (info["adjusted"] - old) / old * 100.0
        if abs(change) >= MIN_CHANGE_PCT:
            updated[sid] = info["adjusted"]
            print(f"  {sid:18s} | {old:>15,} -> {info['adjusted']:>15,} ({change:+.1f}%) "
                  f"| Tranco {info['tranco_anchor']}->{info['tranco_now']}")

    # Always move the anchor forward: sub-5% drift is intentionally dropped at recalibration.
    rewrite_baselines(updated, today)
    print(f"\nRecalibrated {len(updated)} baselines; anchor date is now {today}.")
    print("=" * 60)


if __name__ == "__main__":
    run_baseline_update()
