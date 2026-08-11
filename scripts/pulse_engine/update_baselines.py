"""
update_baselines.py — Automated Monthly Baseline Updater

Fetches fresh traffic estimates from Cloudflare Radar public rankings
and updates STATIC_BASELINES in static_baselines.py.

Strategy:
  1. Fetch Cloudflare Radar top-100 domain rankings (free, no API key needed)
  2. Map CF Radar domains back to our site IDs using the known URL list
  3. Use the CF Radar rank position to estimate monthly visits via a simple
     reference table (we anchor to known real-world data points)
  4. Only update a site's baseline if the new estimate differs by >5%
     (avoids noisy micro-updates)
  5. Rewrite static_baselines.py with updated values

Real-world anchor points (from SimilarWeb public data):
  Rank #1  (Google)   ≈ 85B/mo
  Rank #5  (ChatGPT)  ≈ 2.4B/mo
  Rank #10 (TikTok)   ≈ 2.8B/mo
  Rank #50 (BBC)      ≈ 285M/mo
  Rank #100 (Docker)  ≈ 70M/mo

We use these as calibration anchors for a log-linear interpolation.
This is NOT the old Zipf model — it's bounded by real observed data.
"""

import os
import re
import sys
import math
import json
from pathlib import Path
from typing import Optional

# ─── Try to import httpx, fall back to urllib ────────────────────────────────
try:
    import httpx
    def get_url(url: str, headers: dict = {}, timeout: int = 10) -> Optional[dict]:
        try:
            r = httpx.get(url, headers=headers, timeout=timeout)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"  [HTTP] {url} failed: {e}")
            return None
except ImportError:
    import urllib.request, urllib.error
    def get_url(url: str, headers: dict = {}, timeout: int = 10) -> Optional[dict]:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read())
        except Exception as e:
            print(f"  [HTTP] {url} failed: {e}")
            return None


# ── Calibration anchors (rank → monthly visits) ───────────────────────────────
# Derived from SimilarWeb public data — updated when we do a manual review.
ANCHOR_POINTS = [
    (1,   85_000_000_000),
    (2,   34_800_000_000),
    (3,   15_200_000_000),
    (4,   10_400_000_000),
    (5,    4_800_000_000),   # Reddit (ChatGPT rank varies)
    (10,   2_800_000_000),
    (20,   1_600_000_000),
    (30,     610_000_000),
    (50,     285_000_000),
    (75,     112_000_000),
    (100,     70_000_000),
    (200,     20_000_000),
]


def estimate_monthly_from_rank(rank: int) -> int:
    """
    Log-linear interpolation between known anchor points.
    Much more accurate than Zipf because it's bounded by real data.
    """
    if rank <= 0:
        return ANCHOR_POINTS[0][1]

    # Find surrounding anchors
    lower = ANCHOR_POINTS[0]
    upper = ANCHOR_POINTS[-1]
    for i, (r, v) in enumerate(ANCHOR_POINTS):
        if r <= rank:
            lower = (r, v)
        if r >= rank:
            upper = (r, v)
            break

    if lower[0] == upper[0]:
        return lower[1]

    # Log-linear interpolation
    log_lower_r = math.log(lower[0])
    log_upper_r = math.log(upper[0])
    log_lower_v = math.log(lower[1])
    log_upper_v = math.log(upper[1])
    log_rank = math.log(rank)

    if log_upper_r == log_lower_r:
        return lower[1]

    t = (log_rank - log_lower_r) / (log_upper_r - log_lower_r)
    log_result = log_lower_v + t * (log_upper_v - log_lower_v)
    return int(round(math.exp(log_result)))


# ── Site ID → domain mapping (mirrors what run_engine.py knows) ───────────────
SITE_DOMAINS = {
    "google": "google.com", "youtube": "youtube.com", "facebook": "facebook.com",
    "instagram": "instagram.com", "chatgpt": "chatgpt.com", "reddit": "reddit.com",
    "wikipedia": "wikipedia.org", "x": "x.com", "whatsapp": "whatsapp.com",
    "tiktok": "tiktok.com", "amazon": "amazon.com", "yahoo": "yahoo.com",
    "yandex": "yandex.ru", "baidu": "baidu.com", "bing": "bing.com",
    "openai": "openai.com", "netflix": "netflix.com", "microsoft": "microsoft.com",
    "linkedin": "linkedin.com", "office": "office.com", "github": "github.com",
    "twitch": "twitch.tv", "weather": "weather.com", "pinterest": "pinterest.com",
    "claude": "claude.ai", "zoom": "zoom.us", "canva": "canva.com",
    "gemini": "gemini.google.com", "spotify": "spotify.com", "quora": "quora.com",
    "ebay": "ebay.com", "duckduckgo": "duckduckgo.com", "roblox": "roblox.com",
    "stackoverflow": "stackoverflow.com", "imgur": "imgur.com", "apple": "apple.com",
    "naver": "naver.com", "bilibili": "bilibili.com", "imdb": "imdb.com",
    "fandom": "fandom.com", "aliexpress": "aliexpress.com", "booking": "booking.com",
    "discord": "discord.com", "telegram": "telegram.org", "adobe": "adobe.com",
    "steam": "steampowered.com", "bbc": "bbc.com", "cnn": "cnn.com",
    "mailru": "mail.ru", "globo": "globo.com", "nytimes": "nytimes.com",
    "paypal": "paypal.com", "walmart": "walmart.com", "target": "target.com",
    "etsy": "etsy.com", "medium": "medium.com", "espn": "espn.com",
    "salesforce": "salesforce.com", "vimeo": "vimeo.com", "dropbox": "dropbox.com",
    "slack": "slack.com", "dailymail": "dailymail.co.uk", "coinbase": "coinbase.com",
    "binance": "binance.com", "investing": "investing.com", "tradingview": "tradingview.com",
    "bloomberg": "bloomberg.com", "huggingface": "huggingface.co", "midjourney": "midjourney.com",
    "wikihow": "wikihow.com", "merriamwebster": "merriam-webster.com", "accuweather": "accuweather.com",
    "shopify": "shopify.com", "bestbuy": "bestbuy.com", "ikea": "ikea.com",
    "indeed": "indeed.com", "nike": "nike.com", "craigslist": "craigslist.org",
    "patreon": "patreon.com", "soundcloud": "soundcloud.com", "hulu": "hulu.com",
    "disneyplus": "disneyplus.com", "max": "max.com", "deviantart": "deviantart.com",
    "ign": "ign.com", "theguardian": "theguardian.com", "reuters": "reuters.com",
    "forbes": "forbes.com", "techcrunch": "techcrunch.com", "wired": "wired.com",
    "robinhood": "robinhood.com", "stripe": "stripe.com", "speedtest": "speedtest.net",
    "vercel": "vercel.com", "netlify": "netlify.com", "npm": "npmjs.com",
    "gitlab": "gitlab.com", "docker": "docker.com", "stackexchange": "stackexchange.com",
    "wunderground": "wunderground.com", "airbnb": "airbnb.com", "uber": "uber.com",
    "figma": "figma.com",
}

# Reverse map: domain → site_id (strip www.)
DOMAIN_TO_SITE = {v.replace("www.", ""): k for k, v in SITE_DOMAINS.items()}


def fetch_cf_radar_ranks() -> dict[str, int]:
    """Fetch Cloudflare Radar top-100 global domain ranks."""
    cf_token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not cf_token:
        print("  [CF Radar] No CLOUDFLARE_API_TOKEN — skipping rank fetch.")
        return {}

    data = get_url(
        "https://api.cloudflare.com/client/v4/radar/ranking/top?limit=100&format=json",
        headers={"Authorization": f"Bearer {cf_token}", "Accept": "application/json"},
    )

    if not data or not data.get("success"):
        print("  [CF Radar] API call failed.")
        return {}

    ranks: dict[str, int] = {}
    for item in data.get("result", {}).get("top_0", []):
        domain = item.get("domain", "").lower().replace("www.", "")
        rank = item.get("rank")
        if domain and rank:
            ranks[domain] = rank

    print(f"  [CF Radar] Fetched {len(ranks)} domain ranks.")
    return ranks


def load_current_baselines() -> dict[str, int]:
    """Parse the current STATIC_BASELINES from static_baselines.py."""
    baselines_path = Path(__file__).parent / "static_baselines.py"
    source = baselines_path.read_text(encoding="utf-8")

    baselines: dict[str, int] = {}
    pattern = re.compile(r'"(\w+)":\s+([\d_]+),')
    in_dict = False

    for line in source.splitlines():
        if "STATIC_BASELINES" in line and "dict" in line:
            in_dict = True
            continue
        if in_dict:
            if line.strip().startswith("}"):
                break
            m = pattern.search(line)
            if m:
                site_id = m.group(1)
                value = int(m.group(2).replace("_", ""))
                baselines[site_id] = value

    return baselines


def rewrite_baselines(updated: dict[str, int]) -> None:
    """Rewrite the STATIC_BASELINES dict in static_baselines.py."""
    baselines_path = Path(__file__).parent / "static_baselines.py"
    source = baselines_path.read_text(encoding="utf-8")

    def replacement(m: re.Match) -> str:
        site_id = m.group(1)
        old_raw = m.group(2)
        new_val = updated.get(site_id)
        if new_val is None:
            return m.group(0)
        # Format with underscores for readability
        formatted = f"{new_val:_}"
        # Preserve alignment padding
        return m.group(0).replace(old_raw, formatted)

    new_source = re.sub(r'"(\w+)":\s+([\d_]+),', replacement, source)
    baselines_path.write_text(new_source, encoding="utf-8")
    print(f"  Rewrote {baselines_path.name} with updated values.")


def run_baseline_update():
    print("=" * 60)
    print("Pulse Baseline Updater")
    print("Source: Cloudflare Radar (rank) + calibrated anchor table")
    print("=" * 60)

    # 1. Load current baselines
    current = load_current_baselines()
    print(f"[1/3] Loaded {len(current)} current baselines.")

    # 2. Fetch CF Radar ranks
    cf_ranks = fetch_cf_radar_ranks()

    if not cf_ranks:
        print("[2/3] No CF Radar data — nothing to update. Exiting.")
        return

    # 3. Compute new estimates and apply if >5% change
    print("[3/3] Computing updated estimates...")
    updated = dict(current)  # start with current values
    changes = 0

    for site_id, current_val in current.items():
        domain = SITE_DOMAINS.get(site_id, "").replace("www.", "")
        cf_rank = cf_ranks.get(domain)

        if cf_rank is None:
            # Site not in CF Radar top-100 — keep current value
            continue

        new_estimate = estimate_monthly_from_rank(cf_rank)
        change_pct = abs(new_estimate - current_val) / current_val * 100

        if change_pct > 5.0:
            updated[site_id] = new_estimate
            direction = "+" if new_estimate > current_val else "-"
            print(f"  {site_id:20s} | CF=#{cf_rank:3d} | "
                  f"{current_val/1e9:.2f}B -> {new_estimate/1e9:.2f}B "
                  f"({direction}{change_pct:.1f}%)")
            changes += 1
        else:
            print(f"  {site_id:20s} | CF=#{cf_rank:3d} | {current_val/1e9:.2f}B "
                  f"(change {change_pct:.1f}% < 5% threshold, kept)")

    if changes == 0:
        print("\nNo baselines changed by more than 5% — file unchanged.")
    else:
        rewrite_baselines(updated)
        print(f"\nUpdated {changes} baselines in static_baselines.py.")

    print("=" * 60)
    print("Baseline updater completed.")
    print("=" * 60)


if __name__ == "__main__":
    run_baseline_update()
