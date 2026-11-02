import csv
import json
import re
import time
from io import StringIO
from typing import Any

import httpx

from .config import CLOUDFLARE_API_TOKEN, GROQ_API_KEY, OPENPAGERANK_API_KEY


def parse_domain(url: str) -> str:
    """Clean URL to root domain (e.g. 'https://www.google.com/search' -> 'google.com')."""
    cleaned = re.sub(r'^https?://', '', url, flags=re.IGNORECASE)
    cleaned = re.sub(r'^www\.', '', cleaned, flags=re.IGNORECASE)
    return cleaned.split('/')[0].lower()

def parse_root_domain(url: str) -> str:
    """Extract just the root hostname without subdomains for OPR queries."""
    return parse_domain(url)

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 1a: Cloudflare Radar (top 100, real-time DNS volume)
# ─────────────────────────────────────────────────────────────────────────────
def fetch_cloudflare_radar_ranks() -> dict[str, int]:
    """Fetch top 100 domain rankings from Cloudflare Radar 1.1.1.1 DNS analytics.
    Note: Free tier limit is 100. Enterprise tier supports up to 500."""
    if not CLOUDFLARE_API_TOKEN:
        print("[Signals] Warning: CLOUDFLARE_API_TOKEN missing. Skipping Cloudflare Radar fetch.")
        return {}

    url = "https://api.cloudflare.com/client/v4/radar/ranking/top?limit=100&format=json"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Accept": "application/json"
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and "result" in data and "top_0" in data["result"]:
                    rank_map = {}
                    for item in data["result"]["top_0"]:
                        domain = item.get("domain", "").lower()
                        rank = item.get("rank")
                        if domain and rank is not None:
                            rank_map[domain] = int(rank)
                    print(f"[Signals] Cloudflare Radar: fetched {len(rank_map)} rankings.")
                    return rank_map
                else:
                    print(f"[Signals] Cloudflare Radar unexpected response shape: {str(data)[:300]}")
            else:
                print(f"[Signals] Cloudflare Radar HTTP {res.status_code}: {res.text[:300]}")
    except Exception as e:
        print(f"[Signals] Cloudflare Radar fetch error: {type(e).__name__}: {e}")
    return {}

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 1b: Tranco List (aggregated from CF Radar + Cisco Umbrella + Majestic)
# Fills the gap where CF Radar free tier only covers top 100
# ─────────────────────────────────────────────────────────────────────────────
def _tranco_get(client: httpx.Client, url: str, timeout: float) -> httpx.Response | None:
    """GET with backoff on HTTP 429 (Tranco rate-limits rapid calls). Never steps to other dates."""
    for wait in (0, 5, 15, 30):
        if wait:
            print(f"[Signals] Tranco rate-limited; retrying in {wait}s...")
            time.sleep(wait)
        try:
            res = client.get(url, timeout=timeout)
        except Exception as e:
            print(f"[Signals] Tranco request error: {type(e).__name__}: {e}")
            continue
        if res.status_code != 429:
            return res
    return None


def _tranco_list_id(client: httpx.Client, target_date: str) -> tuple[str | None, bool]:
    """
    Resolve the Tranco list ID for a YYYY-MM-DD date.
    Returns (list_id, definitive): definitive=False means a transient failure (don't step dates).
    """
    res = _tranco_get(client, f"https://tranco-list.eu/api/lists/date/{target_date}", 15.0)
    if res is None:
        return None, False
    if res.status_code == 404:
        print(f"[Signals] Tranco list {target_date} not published.")
        return None, True
    if res.status_code != 200:
        print(f"[Signals] Tranco list lookup {target_date}: HTTP {res.status_code}")
        return None, False
    try:
        meta = res.json()
    except Exception:
        return None, False
    if not isinstance(meta, dict) or meta.get("available") is False:
        print(f"[Signals] Tranco list {target_date} not available.")
        return None, True
    return (meta.get("list_id") or meta.get("listId")), True


def fetch_tranco_list(start_date: str, top_n: int = 100_000, search_days: int = 3,
                      direction: int = -1) -> tuple[dict[str, int], str | None]:
    """
    Download the Tranco list for `start_date` (YYYY-MM-DD). If that day's list isn't
    available, step `direction` days (-1 = earlier, +1 = later) up to `search_days` times.
    Returns ({domain: rank}, list_date) or ({}, None). Tranco is a 30-day-averaged
    ranking aggregated from Cloudflare Radar, Cisco Umbrella, Majestic, Farsight and CrUX.
    """
    from datetime import date, timedelta

    try:
        base = date.fromisoformat(start_date)
        with httpx.Client(timeout=60.0, follow_redirects=True) as client:
            for step in range(search_days + 1):
                target = (base + timedelta(days=direction * step)).isoformat()
                list_id, definitive = _tranco_list_id(client, target)
                if not list_id:
                    if not definitive:
                        print(f"[Signals] Tranco lookup for {target} failed transiently; not falling back to other dates.")
                        return {}, None
                    continue
                csv_res = _tranco_get(client, f"https://tranco-list.eu/download/{list_id}/{top_n}", 90.0)
                if csv_res is None or csv_res.status_code != 200:
                    print(f"[Signals] Tranco download failed for {target} "
                          f"({'rate-limited' if csv_res is None else csv_res.status_code}).")
                    return {}, None
                rank_map: dict[str, int] = {}
                for row in csv.reader(StringIO(csv_res.text)):
                    if len(row) >= 2 and row[0].strip().isdigit():
                        rank_map[row[1].strip().lower()] = int(row[0])
                print(f"[Signals] Tranco list {list_id} ({target}): {len(rank_map)} domains.")
                return rank_map, target
    except Exception as e:
        print(f"[Signals] Tranco fetch error: {type(e).__name__}: {e}")
    return {}, None


def fetch_tranco_ranks(top_n: int = 5000) -> dict[str, int]:
    """
    Fetch the latest Tranco rank list (today, falling back up to 2 days earlier).
    No API key required.
    """
    from datetime import date

    ranks, _ = fetch_tranco_list(date.today().isoformat(), top_n=top_n, search_days=2, direction=-1)
    return ranks

DOMAIN_ALIASES = {
    "x.com": ["x.com", "twitter.com", "t.co"],
    "max.com": ["max.com", "hbomax.com", "hbo.com"],
    "facebook.com": ["facebook.com", "fb.com", "m.facebook.com"],
    "yahoo.com": ["yahoo.com", "yahoo.co.jp", "yahoojapan.co.jp"],
    "amazon.com": ["amazon.com", "amazon.co.uk", "amazon.de", "amazon.co.jp"],
    "wikipedia.org": ["wikipedia.org", "en.wikipedia.org"],
    "bing.com": ["bing.com", "msn.com"],
    "google.com": ["google.com", "google.co.in", "google.co.uk", "google.co.jp"],
    "disneyplus.com": ["disneyplus.com", "disney.com"],
    "chatgpt.com": ["chatgpt.com", "openai.com"],
    "claude.ai": ["claude.ai", "anthropic.com"],
    "reddit.com": ["reddit.com", "redd.it"],
    "youtube.com": ["youtube.com", "youtu.be"],
    "deepseek.com": ["deepseek.com", "chat.deepseek.com"],
    "temu.com": ["temu.com", "us.temu.com"],
    "notion.so": ["notion.so", "notion.site"],
    "character.ai": ["character.ai", "characterai.com"],
}

def merge_rank_sources(cf_ranks: dict[str, int], tranco_ranks: dict[str, int]) -> dict[str, int]:
    """
    Merge Cloudflare Radar (high-precision, top 100) and Tranco (broader coverage, top 5000).
    CF Radar takes precedence for domains it covers; Tranco fills the rest.
    Applies domain alias resolving (e.g., x.com <-> twitter.com).
    """
    merged = dict(tranco_ranks)   # start with Tranco (broader)
    merged.update(cf_ranks)       # CF Radar overrides (more precise for top 100)

    # Handle domain aliases (take best rank among aliases)
    for primary_domain, aliases in DOMAIN_ALIASES.items():
        best_rank = None
        for alias in aliases:
            rank = merged.get(alias)
            if rank is not None:
                if best_rank is None or rank < best_rank:
                    best_rank = rank
        if best_rank is not None:
            merged[primary_domain] = best_rank

    return merged

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 2: Open PageRank (Link Authority)
# ─────────────────────────────────────────────────────────────────────────────
def fetch_open_pagerank(domains: list[str]) -> dict[str, dict[str, Any]]:
    """Query Open PageRank API for domain authority and global rank."""
    if not OPENPAGERANK_API_KEY or not domains:
        return {}

    url = "https://openpagerank.keywordseverywhere.com/v1/domains/bulk"
    headers = {
        "Authorization": f"Bearer {OPENPAGERANK_API_KEY}",
        "Content-Type": "application/json",
    }

    result_map = {}
    try:
        with httpx.Client(timeout=12.0) as client:
            chunk_size = 100
            for i in range(0, len(domains), chunk_size):
                chunk = domains[i:i + chunk_size]
                res = client.post(url, headers=headers, json={"domains": chunk})
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("results", []):
                        domain = item.get("domain")
                        if domain:
                            pr_val = float(item.get("open_page_rank") or 0.0)
                            rank_val = int(item.get("rank") or 9999999)
                            result_map[domain] = {
                                "page_rank": pr_val,
                                "global_rank": rank_val,
                            }
                else:
                    print(f"[Signals] Open PageRank chunk HTTP {res.status_code}")
        return result_map
    except Exception as e:
        print(f"[Signals] Open PageRank fetch error: {e}")
        return result_map

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 4: Groq AI Momentum - ALL 100 sites in batches of 30
# ─────────────────────────────────────────────────────────────────────────────
def _call_groq_batch(batch: list[dict], client: httpx.Client) -> dict[str, dict[str, Any]]:
    """Call Groq AI for a single batch of sites. Returns momentum map."""
    site_summaries = [
        {
            "id": s.get("id"),
            "name": s.get("name", s.get("id", "")),
            "rank": s.get("rank"),
            "category": s.get("category", "general"),
        }
        for s in batch
    ]

    prompt = f"""You are an internet traffic analyst. Based on global internet trends in 2026, analyze the momentum for each domain and return a JSON array.

Domains to analyze:
{json.dumps(site_summaries, indent=2)}

Consider current global trends:
- AI tools (ChatGPT, Claude, Gemini, Midjourney, HuggingFace) are seeing rapid user growth
- Social media platforms face varying regulatory and user-engagement pressures
- Streaming wars continue with Disney+, Netflix, Max, Hulu, Twitch competing
- E-commerce shifts with Amazon, Etsy, AliExpress, eBay seeing different trajectories
- Crypto is volatile - Binance, Coinbase facing regulatory pressure
- Developer tools (GitHub, GitLab, Docker, npm, Vercel, Netlify) growing steadily
- News sites facing declining ad revenue and subscriber pressure

Return ONLY a valid JSON array with NO additional text, markdown, or code fences. Each element must have exactly these fields:
- "id": string (domain id from input, EXACT match)
- "momentum_score": float between -1.0 and 1.0 (positive = growing, negative = declining)
- "trend_label": one of ["surging", "growing", "stable", "cooling"]
- "reason": string (max 12 words explaining why)

Example: [{{"id": "google", "momentum_score": 0.05, "trend_label": "stable", "reason": "Mature market leader, steady search volume globally"}}]"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2500
    }

    res = client.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers, json=payload, timeout=45.0
    )
    if res.status_code != 200:
        print(f"[Signals] Groq batch error HTTP {res.status_code}: {res.text[:200]}")
        return {}

    data = res.json()
    content = data["choices"][0]["message"]["content"].strip()

    # Strip code fences if model adds them despite instructions
    if content.startswith("```"):
        content = re.sub(r'^```[a-z]*\n?', '', content)
        content = re.sub(r'\n?```$', '', content)

    parsed = json.loads(content)
    result = {}
    for entry in parsed:
        site_id = entry.get("id")
        if site_id:
            result[site_id] = {
                "momentum_score": float(entry.get("momentum_score", 0.0)),
                "trend_label": entry.get("trend_label", "stable"),
                "reason": entry.get("reason", "")
            }
    return result

def fetch_groq_momentum(sites_snapshot: list[dict[str, Any]], batch_size: int = 30) -> dict[str, dict[str, Any]]:
    """
    Signal 4: Use Groq AI to analyze internet momentum trends across ALL domains.
    Processes in batches of `batch_size` to stay within Groq's token limits.
    Returns a momentum map keyed by site ID.
    """
    if not GROQ_API_KEY:
        print("[Signals] Warning: GROQ_API_KEY missing. Skipping Groq AI momentum signal.")
        return {}

    # Sort by rank so the most important sites are in the first batches
    sorted_sites = sorted(sites_snapshot, key=lambda s: s.get("rank", 9999))
    batches = [sorted_sites[i:i + batch_size] for i in range(0, len(sorted_sites), batch_size)]

    momentum_map: dict[str, dict[str, Any]] = {}
    print(f"[Signals] Groq AI: processing {len(sorted_sites)} domains in {len(batches)} batches...")

    with httpx.Client(timeout=60.0) as client:
        for idx, batch in enumerate(batches):
            try:
                batch_result = _call_groq_batch(batch, client)
                momentum_map.update(batch_result)
                print(f"[Signals] Groq batch {idx + 1}/{len(batches)}: {len(batch_result)} domains analyzed.")
                # Respect Groq free tier rate limit (30 req/min = 2s between requests)
                if idx < len(batches) - 1:
                    time.sleep(2.5)
            except Exception as e:
                print(f"[Signals] Groq batch {idx + 1} error: {type(e).__name__}: {e}")
                continue

    print(f"[Signals] Groq AI momentum complete: {len(momentum_map)}/{len(sorted_sites)} domains.")
    return momentum_map

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL 5: Google Trends (Human Search Momentum)
# ─────────────────────────────────────────────────────────────────────────────
def fetch_google_trends_momentum(domains: list[str], batch_size: int = 5) -> dict[str, float]:
    """
    Fetch Google Trends interest over the last 90 days for given domains.
    Computes a linear slope and normalizes it to a momentum score (-1.0 to +1.0).
    Processes in small batches to avoid rate limits.
    """
    try:
        import numpy as np
        from pytrends.request import TrendReq
    except ImportError:
        print("[Signals] Warning: pytrends or numpy not installed. Skipping Google Trends.")
        return {}

    pytrends = TrendReq(hl='en-US', tz=360, retries=2, backoff_factor=1)
    momentum_map = {}

    print(f"[Signals] Google Trends: querying {len(domains)} domains...")

    # Process in small batches (Google Trends limits to 5 keywords per request)
    batches = [domains[i:i + batch_size] for i in range(0, len(domains), batch_size)]

    for idx, batch in enumerate(batches):
        try:
            pytrends.build_payload(batch, cat=0, timeframe='today 3-m', geo='', gprop='')
            df = pytrends.interest_over_time()

            if not df.empty:
                for kw in batch:
                    if kw in df.columns:
                        series = df[kw].values
                        if len(series) > 1:
                            # Simple linear regression slope
                            x = np.arange(len(series))
                            y = series
                            slope = np.polyfit(x, y, 1)[0]
                            # Normalize slope (heuristic: +/- 1.0 slope over 90 days is a max score of 1.0)
                            score = max(-1.0, min(1.0, slope))
                            momentum_map[kw] = round(score, 2)

            # Rate limiting prevention
            if idx < len(batches) - 1:
                import random
                time.sleep(random.uniform(2.0, 4.0))
        except Exception as e:
            if "429" in str(e):
                print(f"[Signals] Google Trends Rate Limit hit at batch {idx}. Stopping early.")
                break
            print(f"[Signals] Google Trends batch {idx} error: {e}")

    print(f"[Signals] Google Trends complete: fetched momentum for {len(momentum_map)} domains.")
    return momentum_map

def fetch_cloudflare_outage_count() -> int:
    """Fetch 7-day verified network outage count from Cloudflare Radar Annotations API."""
    if not CLOUDFLARE_API_TOKEN:
        return 0

    url = "https://api.cloudflare.com/client/v4/radar/annotations/outages?limit=50&dateRange=7d&format=json"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Accept": "application/json"
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and "result" in data and "annotations" in data["result"]:
                    count = len(data["result"]["annotations"])
                    print(f"[Signals] Cloudflare Radar Outages: detected {count} incidents in past 7 days.")
                    return count
    except Exception as e:
        print(f"[Signals] Cloudflare Radar outages fetch error: {e}")
    return 0
