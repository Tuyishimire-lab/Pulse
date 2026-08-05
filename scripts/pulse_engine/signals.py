import re
import json
import httpx
from typing import Dict, Any, Optional, List, Tuple
from .config import CLOUDFLARE_API_TOKEN, OPENPAGERANK_API_KEY, GROQ_API_KEY

def parse_domain(url: str) -> str:
    """Clean URL to root domain (e.g. 'https://www.google.com/search' -> 'google.com')."""
    cleaned = re.sub(r'^https?://', '', url, flags=re.IGNORECASE)
    cleaned = re.sub(r'^www\.', '', cleaned, flags=re.IGNORECASE)
    return cleaned.split('/')[0].lower()

def parse_root_domain(url: str) -> str:
    """Extract just the root hostname without subdomains for OPR queries."""
    return parse_domain(url)

def fetch_cloudflare_radar_ranks() -> Dict[str, int]:
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
                    print(f"[Signals] Fetched {len(rank_map)} rankings from Cloudflare Radar.")
                    return rank_map
                else:
                    print(f"[Signals] Cloudflare Radar unexpected response shape: {str(data)[:300]}")
            else:
                print(f"[Signals] Cloudflare Radar HTTP {res.status_code}: {res.text[:300]}")
    except Exception as e:
        print(f"[Signals] Cloudflare Radar fetch error: {type(e).__name__}: {e}")
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

def fetch_groq_momentum(sites_snapshot: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Signal 4: Use Groq AI to analyze internet momentum trends across domains.
    Returns a momentum map keyed by site ID with keys:
      - momentum_score: float -1.0 to +1.0 (negative = cooling, positive = surging)
      - trend_label: str (e.g. 'surging', 'growing', 'stable', 'cooling')
      - reason: str (short 1-sentence AI reasoning)
    """
    if not GROQ_API_KEY:
        print("[Signals] Warning: GROQ_API_KEY missing. Skipping Groq AI momentum signal.")
        return {}

    # Build a compact summary of the top sites for the AI to analyze
    # We only send the top 30 to stay within token budget
    top_sites = sorted(sites_snapshot, key=lambda s: s.get("rank", 9999))[:30]
    site_summaries = [
        {
            "id": s.get("id"),
            "name": s.get("name", s.get("id", "")),
            "rank": s.get("rank"),
            "category": s.get("category", "general"),
        }
        for s in top_sites
    ]

    prompt = f"""You are an internet traffic analyst. Based on global internet trends in 2026, analyze the momentum for each of these domains and return a JSON array.

Domains to analyze:
{json.dumps(site_summaries, indent=2)}

Consider current global trends:
- AI tools (ChatGPT, Claude, Gemini, Midjourney) are seeing rapid user growth
- Social media platforms face varying regulatory and user-engagement pressures
- Streaming wars continue with Disney+, Netflix, Max, Hulu competing
- E-commerce shifts post-pandemic, with Amazon and Etsy seeing different trajectories
- Cryptocurrency markets are volatile

Return ONLY a valid JSON array with NO additional text, markdown, or code fences. Each element must have exactly these fields:
- "id": string (domain id from input)
- "momentum_score": float between -1.0 and 1.0 (positive = growing, negative = declining)
- "trend_label": one of ["surging", "growing", "stable", "cooling"]
- "reason": string (max 12 words explaining why)

Example format:
[{{"id": "google", "momentum_score": 0.05, "trend_label": "stable", "reason": "Mature market leader, steady search volume globally"}}]"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2000
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            res = client.post("https://api.groq.com/openai/v1/chat/completions", 
                            headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"].strip()

                # Strip code fences if model adds them despite instructions
                if content.startswith("```"):
                    content = re.sub(r'^```[a-z]*\n?', '', content)
                    content = re.sub(r'\n?```$', '', content)

                parsed = json.loads(content)
                momentum_map = {}
                for entry in parsed:
                    site_id = entry.get("id")
                    if site_id:
                        momentum_map[site_id] = {
                            "momentum_score": float(entry.get("momentum_score", 0.0)),
                            "trend_label": entry.get("trend_label", "stable"),
                            "reason": entry.get("reason", "")
                        }
                print(f"[Signals] Groq AI momentum computed for {len(momentum_map)} domains.")
                return momentum_map
    except Exception as e:
        print(f"[Signals] Groq AI momentum fetch error: {e}")
    return {}
