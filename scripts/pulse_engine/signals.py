import re
import httpx
from typing import Dict, Any, Optional, List
from .config import CLOUDFLARE_API_TOKEN, OPENPAGERANK_API_KEY

def parse_domain(url: str) -> str:
    """Clean URL to raw domain string."""
    cleaned = re.sub(r'^https?://', '', url, flags=re.IGNORECASE)
    cleaned = re.sub(r'^www\.', '', cleaned, flags=re.IGNORECASE)
    return cleaned.split('/')[0].lower()

def fetch_cloudflare_radar_ranks() -> Dict[str, int]:
    """Fetch top 100 domain rankings from Cloudflare Radar 1.1.1.1 DNS analytics."""
    if not CLOUDFLARE_API_TOKEN:
        print("[Signals] Warning: CLOUDFLARE_API_TOKEN missing. Skipping Cloudflare Radar fetch.")
        return {}

    url = "https://api.cloudflare.com/client/v4/radar/ranking/top?limit=100&format=json"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Accept": "application/json"
    }
    
    try:
        with httpx.Client(timeout=10.0) as client:
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
                    print(f"[Signals] Fetched {len(rank_map)} rankings from Cloudflare Radar.")
                    return rank_map
    except Exception as e:
        print(f"[Signals] Cloudflare Radar fetch error: {e}")
    return {}

def fetch_open_pagerank(domains: List[str]) -> Dict[str, Dict[str, Any]]:
    """Query Open PageRank API for domain authority and global rank."""
    if not OPENPAGERANK_API_KEY or not domains:
        return {}

    query_str = "&".join([f"domains[]={d}" for d in domains[:100]])
    url = f"https://openpagerank.com/api/v1.0/getPageRank?{query_str}"
    headers = {"API-OPR": OPENPAGERANK_API_KEY}

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                result_map = {}
                for item in data.get("response", []):
                    domain = item.get("domain")
                    if domain:
                        pr_val = float(item.get("page_rank_decimal") or 0.0)
                        rank_val = int(item.get("rank") or 9999999)
                        result_map[domain] = {
                            "page_rank": pr_val,
                            "global_rank": rank_val
                        }
                return result_map
    except Exception as e:
        print(f"[Signals] Open PageRank fetch error: {e}")
    return {}
