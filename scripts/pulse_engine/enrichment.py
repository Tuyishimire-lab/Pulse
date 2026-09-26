"""
enrichment.py — Site Enrichment Pipeline v1.0

Fetches supplementary data for all tracked sites:
  1. Google CrUX (Core Web Vitals)
  2. Wikipedia Pageviews (brand interest proxy)
  3. SSL Labs + Mozilla Observatory (Security grading)

Designed to run daily after run_engine.py.
Each enrichment is independent and fault-tolerant —
a failure in one does not block the others.
"""

import os
import sys
import time
import json
import traceback
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from scripts.pulse_engine.config import SUPABASE_URL, SUPABASE_KEY
from scripts.pulse_engine.static_baselines import STATIC_BASELINES, SITE_META
from supabase import create_client, Client

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────
CRUX_API_KEY = os.getenv("GOOGLE_CRUX_API_KEY", "")
CRUX_ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryRecord"

# Map site IDs to their origin URLs for CrUX lookups
def get_origin(site_id: str) -> str:
    """Derive the HTTPS origin URL from the site ID."""
    ORIGIN_MAP = {
        "google": "https://www.google.com",
        "youtube": "https://www.youtube.com",
        "facebook": "https://www.facebook.com",
        "instagram": "https://www.instagram.com",
        "chatgpt": "https://chatgpt.com",
        "wikipedia": "https://en.wikipedia.org",
        "amazon": "https://www.amazon.com",
        "x": "https://x.com",
        "whatsapp": "https://web.whatsapp.com",
        "reddit": "https://www.reddit.com",
        "tiktok": "https://www.tiktok.com",
        "yahoo": "https://www.yahoo.com",
        "yandex": "https://yandex.com",
        "baidu": "https://www.baidu.com",
        "netflix": "https://www.netflix.com",
        "openai": "https://openai.com",
        "bing": "https://www.bing.com",
        "microsoft": "https://www.microsoft.com",
        "linkedin": "https://www.linkedin.com",
        "office": "https://www.office.com",
        "github": "https://github.com",
        "twitch": "https://www.twitch.tv",
        "weather": "https://weather.com",
        "pinterest": "https://www.pinterest.com",
        "claude": "https://claude.ai",
        "zoom": "https://zoom.us",
        "canva": "https://www.canva.com",
        "gemini": "https://gemini.google.com",
        "spotify": "https://open.spotify.com",
        "quora": "https://www.quora.com",
        "ebay": "https://www.ebay.com",
        "duckduckgo": "https://duckduckgo.com",
        "roblox": "https://www.roblox.com",
        "stackoverflow": "https://stackoverflow.com",
        "imgur": "https://imgur.com",
        "apple": "https://www.apple.com",
        "naver": "https://www.naver.com",
        "bilibili": "https://www.bilibili.com",
        "imdb": "https://www.imdb.com",
        "fandom": "https://www.fandom.com",
        "aliexpress": "https://www.aliexpress.com",
        "booking": "https://www.booking.com",
        "discord": "https://discord.com",
        "telegram": "https://web.telegram.org",
        "adobe": "https://www.adobe.com",
        "steam": "https://store.steampowered.com",
        "bbc": "https://www.bbc.com",
        "cnn": "https://www.cnn.com",
        "mailru": "https://mail.ru",
        "globo": "https://www.globo.com",
        "nytimes": "https://www.nytimes.com",
        "paypal": "https://www.paypal.com",
        "walmart": "https://www.walmart.com",
        "target": "https://www.target.com",
        "etsy": "https://www.etsy.com",
        "medium": "https://medium.com",
        "espn": "https://www.espn.com",
        "salesforce": "https://www.salesforce.com",
        "vimeo": "https://vimeo.com",
        "dropbox": "https://www.dropbox.com",
        "slack": "https://slack.com",
        "dailymail": "https://www.dailymail.co.uk",
        "coinbase": "https://www.coinbase.com",
        "binance": "https://www.binance.com",
        "investing": "https://www.investing.com",
        "tradingview": "https://www.tradingview.com",
        "bloomberg": "https://www.bloomberg.com",
        "huggingface": "https://huggingface.co",
        "midjourney": "https://www.midjourney.com",
        "wikihow": "https://www.wikihow.com",
        "merriamwebster": "https://www.merriam-webster.com",
        "accuweather": "https://www.accuweather.com",
        "shopify": "https://www.shopify.com",
        "bestbuy": "https://www.bestbuy.com",
        "ikea": "https://www.ikea.com",
        "indeed": "https://www.indeed.com",
        "nike": "https://www.nike.com",
        "craigslist": "https://www.craigslist.org",
        "patreon": "https://www.patreon.com",
        "soundcloud": "https://soundcloud.com",
        "hulu": "https://www.hulu.com",
        "disneyplus": "https://www.disneyplus.com",
        "max": "https://www.max.com",
        "deviantart": "https://www.deviantart.com",
        "ign": "https://www.ign.com",
        "theguardian": "https://www.theguardian.com",
        "reuters": "https://www.reuters.com",
        "forbes": "https://www.forbes.com",
        "techcrunch": "https://techcrunch.com",
        "wired": "https://www.wired.com",
        "robinhood": "https://robinhood.com",
        "stripe": "https://stripe.com",
        "speedtest": "https://www.speedtest.net",
        "vercel": "https://vercel.com",
        "netlify": "https://www.netlify.com",
        "npm": "https://www.npmjs.com",
        "gitlab": "https://gitlab.com",
        "docker": "https://www.docker.com",
        "stackexchange": "https://stackexchange.com",
        "wunderground": "https://www.wunderground.com",
        "airbnb": "https://www.airbnb.com",
        "uber": "https://www.uber.com",
        "figma": "https://www.figma.com",
        "threads": "https://www.threads.net",
        "notion": "https://www.notion.so",
        "cloudflare": "https://www.cloudflare.com",
        "linear": "https://linear.app",
        "kick": "https://kick.com",
        "perplexity": "https://www.perplexity.ai",
        "substack": "https://substack.com",
        "bsky": "https://bsky.app",
        "suno": "https://suno.com",
        "cursor": "https://www.cursor.com",
        "supabase": "https://supabase.com",
    }
    return ORIGIN_MAP.get(site_id, f"https://{site_id}.com")


# Map site IDs to Wikipedia article titles
WIKI_ARTICLE_MAP = {
    "google": "Google", "youtube": "YouTube", "facebook": "Facebook",
    "instagram": "Instagram", "chatgpt": "ChatGPT", "wikipedia": "Wikipedia",
    "amazon": "Amazon_(company)", "x": "Twitter", "whatsapp": "WhatsApp",
    "reddit": "Reddit", "tiktok": "TikTok", "yahoo": "Yahoo!",
    "yandex": "Yandex", "baidu": "Baidu", "netflix": "Netflix",
    "openai": "OpenAI", "bing": "Microsoft_Bing", "microsoft": "Microsoft",
    "linkedin": "LinkedIn", "github": "GitHub", "twitch": "Twitch_(service)",
    "pinterest": "Pinterest", "claude": "Claude_(language_model)",
    "zoom": "Zoom_(software)", "canva": "Canva",
    "gemini": "Gemini_(chatbot)", "spotify": "Spotify", "quora": "Quora",
    "ebay": "EBay", "duckduckgo": "DuckDuckGo", "roblox": "Roblox",
    "stackoverflow": "Stack_Overflow", "apple": "Apple_Inc.",
    "bilibili": "Bilibili", "imdb": "IMDb", "discord": "Discord",
    "telegram": "Telegram_(software)", "adobe": "Adobe_Inc.",
    "steam": "Steam_(service)", "bbc": "BBC", "cnn": "CNN",
    "nytimes": "The_New_York_Times", "paypal": "PayPal",
    "walmart": "Walmart", "etsy": "Etsy", "medium": "Medium_(website)",
    "espn": "ESPN", "dropbox": "Dropbox_(service)", "slack": "Slack_(software)",
    "coinbase": "Coinbase", "binance": "Binance", "bloomberg": "Bloomberg_L.P.",
    "huggingface": "Hugging_Face", "shopify": "Shopify",
    "airbnb": "Airbnb", "uber": "Uber", "figma": "Figma_(software)",
    "nike": "Nike,_Inc.", "stripe": "Stripe_(company)",
    "vercel": "Vercel", "gitlab": "GitLab", "docker": "Docker_(software)",
    "robinhood": "Robinhood_Markets", "notion": "Notion_(productivity_software)",
    "cloudflare": "Cloudflare", "hulu": "Hulu", "disneyplus": "Disney%2B",
    "perplexity": "Perplexity_AI", "cursor": "Cursor_(text_editor)",
    "supabase": "Supabase", "substack": "Substack",
}


# ─────────────────────────────────────────────────────────────────────────────
# 1. Google CrUX — Core Web Vitals
# ─────────────────────────────────────────────────────────────────────────────
def compute_cwv_grade(lcp_rating: str, inp_rating: str, cls_rating: str) -> str:
    """
    Compute a letter grade from CrUX metric ratings.
      A = all 3 'good'
      B = 2 'good'
      C = 1 'good' or all 'needs-improvement'
      D = 1+ 'poor'
      F = 2+ 'poor'
    """
    ratings = [lcp_rating, inp_rating, cls_rating]
    good_count = ratings.count("good")
    poor_count = ratings.count("poor")

    if good_count == 3:
        return "A"
    elif good_count == 2 and poor_count == 0:
        return "B"
    elif poor_count >= 2:
        return "F"
    elif poor_count == 1:
        return "D"
    else:
        return "C"


def get_metric_rating(percentile_ms: float, metric: str) -> str:
    """Classify a CrUX metric percentile into good/needs-improvement/poor."""
    thresholds = {
        "largest_contentful_paint": (2500, 4000),
        "interaction_to_next_paint": (200, 500),
        "cumulative_layout_shift": (0.1, 0.25),
    }
    good_threshold, poor_threshold = thresholds.get(metric, (2500, 4000))
    if percentile_ms <= good_threshold:
        return "good"
    elif percentile_ms <= poor_threshold:
        return "needs-improvement"
    else:
        return "poor"


def fetch_crux_for_site(client: httpx.Client, origin: str) -> dict | None:
    """Fetch CrUX data for a single origin. Returns parsed metrics or None."""
    if not CRUX_API_KEY:
        return None

    try:
        resp = client.post(
            f"{CRUX_ENDPOINT}?key={CRUX_API_KEY}",
            json={"origin": origin},
            timeout=10,
        )
        if resp.status_code == 404:
            return None  # No CrUX data for this origin
        resp.raise_for_status()
        data = resp.json()

        metrics = data.get("record", {}).get("metrics", {})
        result = {}

        for metric_key, db_key in [
            ("largest_contentful_paint", "lcp"),
            ("interaction_to_next_paint", "inp"),
            ("cumulative_layout_shift", "cls"),
        ]:
            metric_data = metrics.get(metric_key, {})
            p75 = metric_data.get("percentiles", {}).get("p75")
            if p75 is not None:
                result[f"{db_key}_p75"] = float(p75)
                result[f"{db_key}_rating"] = get_metric_rating(float(p75), metric_key)

        if "lcp_rating" in result and "inp_rating" in result and "cls_rating" in result:
            result["cwv_grade"] = compute_cwv_grade(
                result["lcp_rating"], result["inp_rating"], result["cls_rating"]
            )
        
        # Fetch form factor breakdown
        form_factors = {}
        for ff in ["DESKTOP", "PHONE"]:
            try:
                ff_resp = client.post(
                    f"{CRUX_ENDPOINT}?key={CRUX_API_KEY}",
                    json={"origin": origin, "formFactor": ff},
                    timeout=10,
                )
                if ff_resp.status_code == 200:
                    ff_metrics = ff_resp.json().get("record", {}).get("metrics", {})
                    ff_data = {}
                    for mk, dk in [
                        ("largest_contentful_paint", "lcp"),
                        ("interaction_to_next_paint", "inp"),
                        ("cumulative_layout_shift", "cls"),
                    ]:
                        p75 = ff_metrics.get(mk, {}).get("percentiles", {}).get("p75")
                        if p75 is not None:
                            ff_data[dk] = float(p75)
                    if ff_data:
                        form_factors[ff.lower()] = ff_data
            except Exception:
                pass

        if form_factors:
            result["form_factors"] = form_factors

        return result if result else None

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            print(f"  ⚠ CrUX rate limited, pausing 30s...")
            time.sleep(30)
        return None
    except Exception as e:
        print(f"  ✗ CrUX error: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 2. Wikipedia Pageviews
# ─────────────────────────────────────────────────────────────────────────────
def fetch_wiki_views(client: httpx.Client, article: str) -> dict | None:
    """Fetch Wikipedia daily pageviews for last 60 days."""
    try:
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=60)
        start_str = start.strftime("%Y%m%d")
        end_str = end.strftime("%Y%m%d")

        url = (
            f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
            f"en.wikipedia/all-access/all-agents/{article}/daily/{start_str}/{end_str}"
        )
        resp = client.get(url, timeout=10)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        data = resp.json()

        items = data.get("items", [])
        if not items:
            return None

        # Split into current 30 days and previous 30 days
        recent_30 = items[-30:] if len(items) >= 30 else items
        prev_30 = items[:30] if len(items) >= 60 else items[:len(items)//2]

        daily_views = [
            {"date": item["timestamp"][:8], "views": item["views"]}
            for item in recent_30
        ]
        monthly_avg = sum(d["views"] for d in daily_views) // max(len(daily_views), 1)

        prev_avg = sum(item["views"] for item in prev_30) // max(len(prev_30), 1) if prev_30 else 0
        trend_pct = round(((monthly_avg - prev_avg) / max(prev_avg, 1)) * 100, 1) if prev_avg else 0

        return {
            "daily_views": daily_views,
            "monthly_avg": monthly_avg,
            "trend_pct": trend_pct,
        }

    except Exception as e:
        print(f"  ✗ Wiki error for {article}: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# 3. Security — SSL Labs + Mozilla Observatory
# ─────────────────────────────────────────────────────────────────────────────
def fetch_ssl_grade(client: httpx.Client, domain: str) -> dict | None:
    """
    Fetch SSL grade from SSL Labs using cached results only.
    Does NOT trigger a new scan (fromCache=on, maxAge=72).
    """
    try:
        resp = client.get(
            "https://api.ssllabs.com/api/v3/analyze",
            params={"host": domain, "fromCache": "on", "maxAge": 72, "all": "done"},
            timeout=15,
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        status = data.get("status")

        if status == "READY":
            endpoints = data.get("endpoints", [])
            if endpoints:
                ep = endpoints[0]
                return {
                    "ssl_grade": ep.get("grade", "?"),
                    "ssl_protocol": ep.get("details", {}).get("protocols", [{}])[0].get("name", "TLS")
                        if ep.get("details", {}).get("protocols") else "TLS",
                }
        elif status == "DNS":
            # Not in cache — don't wait, skip
            return None

        return None

    except Exception as e:
        print(f"  ✗ SSL Labs error for {domain}: {e}")
        return None


def fetch_observatory(client: httpx.Client, domain: str) -> dict | None:
    """
    Fetch Mozilla Observatory security headers grade.
    Uses hidden=true to avoid public listing, rescan=false to use cache.
    """
    try:
        # Start/retrieve scan
        resp = client.post(
            f"https://http-observatory.security.mozilla.org/api/v1/analyze?host={domain}",
            data={"hidden": "true", "rescan": "false"},
            timeout=15,
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        state = data.get("state")

        if state == "FINISHED":
            return {
                "obs_grade": data.get("grade", "?"),
                "obs_score": data.get("score", 0),
            }

        return None

    except Exception as e:
        print(f"  ✗ Observatory error for {domain}: {e}")
        return None


GRADE_SCORES = {"A+": 100, "A": 95, "A-": 90, "B": 80, "B+": 85, "B-": 75,
                "C": 65, "C+": 70, "C-": 60, "D": 50, "D+": 55, "D-": 45,
                "E": 35, "F": 20, "T": 10, "?": 0}


def compute_security_grade(ssl_grade: str | None, obs_grade: str | None) -> str:
    """Combine SSL + Observatory into a single letter grade (SSL 60%, Obs 40%)."""
    ssl_score = GRADE_SCORES.get(ssl_grade or "?", 0)
    obs_score = GRADE_SCORES.get(obs_grade or "?", 0)

    # If we only have one, use it as 100%
    if ssl_grade and not obs_grade:
        combined = ssl_score
    elif obs_grade and not ssl_grade:
        combined = obs_score
    else:
        combined = ssl_score * 0.6 + obs_score * 0.4

    if combined >= 95: return "A+"
    if combined >= 85: return "A"
    if combined >= 75: return "B"
    if combined >= 60: return "C"
    if combined >= 45: return "D"
    return "F"


# ─────────────────────────────────────────────────────────────────────────────
# Main Pipeline
# ─────────────────────────────────────────────────────────────────────────────
def run_enrichment():
    print("=" * 70)
    print(f"  Site Enrichment Pipeline v1.0 — {datetime.now(timezone.utc).isoformat()}")
    print("=" * 70)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("✗ Missing Supabase credentials. Aborting.")
        return

    sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    site_ids = list(STATIC_BASELINES.keys())
    print(f"\n  Processing {len(site_ids)} sites...\n")

    crux_results = {}
    wiki_results = {}
    security_results = {}

    with httpx.Client(
        headers={"User-Agent": "PulseTraffic-Enrichment/1.0 (https://pulstraffic.com)"},
        follow_redirects=True,
    ) as client:

        # ── Pass 1: CrUX ────────────────────────────────────────────────────
        if CRUX_API_KEY:
            print("── 1/3: Google CrUX (Core Web Vitals) ──")
            batch_count = 0
            for i, sid in enumerate(site_ids):
                origin = get_origin(sid)
                result = fetch_crux_for_site(client, origin)
                if result:
                    crux_results[sid] = result
                    grade = result.get("cwv_grade", "?")
                    lcp = result.get("lcp_p75", "?")
                    print(f"  ✓ {sid:20s}  Grade: {grade}  LCP: {lcp}ms")
                else:
                    print(f"  · {sid:20s}  (no CrUX data)")

                batch_count += 1
                if batch_count >= 50:
                    print(f"    … pausing 20s (rate limit)")
                    time.sleep(20)
                    batch_count = 0
                else:
                    time.sleep(0.3)  # ~3 req/s within batch

            print(f"  CrUX: {len(crux_results)}/{len(site_ids)} sites have data\n")
        else:
            print("── 1/3: CrUX SKIPPED (no GOOGLE_CRUX_API_KEY) ──\n")

        # ── Pass 2: Wikipedia ────────────────────────────────────────────────
        print("── 2/3: Wikipedia Pageviews ──")
        for sid in site_ids:
            article = WIKI_ARTICLE_MAP.get(sid)
            if not article:
                continue
            result = fetch_wiki_views(client, article)
            if result:
                wiki_results[sid] = {**result, "article_title": article}
                print(f"  ✓ {sid:20s}  avg: {result['monthly_avg']:,}/day  trend: {result['trend_pct']:+.1f}%")
            else:
                print(f"  · {sid:20s}  (no Wikipedia article)")
            time.sleep(0.1)

        print(f"  Wiki: {len(wiki_results)}/{len(site_ids)} sites have data\n")

        # ── Pass 3: Security ─────────────────────────────────────────────────
        print("── 3/3: Security (SSL Labs + Mozilla Observatory) ──")
        for sid in site_ids:
            origin = get_origin(sid)
            domain = origin.replace("https://", "").replace("http://", "").rstrip("/")

            ssl_data = fetch_ssl_grade(client, domain)
            time.sleep(1)  # SSL Labs courtesy delay

            obs_data = fetch_observatory(client, domain)
            time.sleep(1)  # Observatory courtesy delay

            if ssl_data or obs_data:
                combined = {}
                if ssl_data:
                    combined.update(ssl_data)
                if obs_data:
                    combined.update(obs_data)
                combined["security_grade"] = compute_security_grade(
                    combined.get("ssl_grade"), combined.get("obs_grade")
                )
                security_results[sid] = combined
                print(f"  ✓ {sid:20s}  SSL: {combined.get('ssl_grade', '?')}  Obs: {combined.get('obs_grade', '?')}  Combined: {combined['security_grade']}")
            else:
                print(f"  · {sid:20s}  (no security data)")

        print(f"  Security: {len(security_results)}/{len(site_ids)} sites have data\n")

    # ── Write to Supabase ────────────────────────────────────────────────────
    now = datetime.now(timezone.utc).isoformat()

    # CrUX upserts
    if crux_results:
        print("Writing CrUX data to Supabase...")
        for sid, data in crux_results.items():
            row = {
                "site_id": sid,
                "lcp_p75": data.get("lcp_p75"),
                "inp_p75": data.get("inp_p75"),
                "cls_p75": data.get("cls_p75"),
                "lcp_rating": data.get("lcp_rating"),
                "inp_rating": data.get("inp_rating"),
                "cls_rating": data.get("cls_rating"),
                "form_factors": json.dumps(data.get("form_factors", {})),
                "cwv_grade": data.get("cwv_grade"),
                "fetched_at": now,
            }
            try:
                sb.table("site_webvitals").upsert(row, on_conflict="site_id").execute()
            except Exception as e:
                print(f"  ✗ CrUX write failed for {sid}: {e}")

    # Wiki upserts
    if wiki_results:
        print("Writing Wikipedia data to Supabase...")
        for sid, data in wiki_results.items():
            row = {
                "site_id": sid,
                "article_title": data["article_title"],
                "daily_views": json.dumps(data["daily_views"]),
                "monthly_avg": data["monthly_avg"],
                "trend_pct": data["trend_pct"],
                "fetched_at": now,
            }
            try:
                sb.table("site_wiki_views").upsert(row, on_conflict="site_id").execute()
            except Exception as e:
                print(f"  ✗ Wiki write failed for {sid}: {e}")

    # Security upserts
    if security_results:
        print("Writing Security data to Supabase...")
        for sid, data in security_results.items():
            row = {
                "site_id": sid,
                "ssl_grade": data.get("ssl_grade"),
                "ssl_protocol": data.get("ssl_protocol"),
                "obs_grade": data.get("obs_grade"),
                "obs_score": data.get("obs_score"),
                "security_grade": data.get("security_grade"),
                "fetched_at": now,
            }
            try:
                sb.table("site_security").upsert(row, on_conflict="site_id").execute()
            except Exception as e:
                print(f"  ✗ Security write failed for {sid}: {e}")

    # ── Summary ──────────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print(f"  Enrichment complete at {datetime.now(timezone.utc).isoformat()}")
    print(f"  CrUX:     {len(crux_results):3d} sites")
    print(f"  Wiki:     {len(wiki_results):3d} sites")
    print(f"  Security: {len(security_results):3d} sites")
    print("=" * 70)


if __name__ == "__main__":
    run_enrichment()
