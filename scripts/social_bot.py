import os
import sys
import json
import httpx
from pathlib import Path

# Add project root to python path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from dotenv import load_dotenv
env_path = root_dir / '.env.local'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

from supabase import create_client, Client

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Twitter / X API Keys (from developer.x.com)
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY", "")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET", "")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN", "")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET", "")

def generate_weekly_tweet():
    print("=" * 60)
    print("Pulse Weekly X/Twitter Digest Bot")
    print("=" * 60)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Bot Error] Supabase credentials missing in .env.local")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Fetch top sites ordered by rank
    res = supabase.table("sites").select("id, name, rank, rate, baseline, category").order("rank", desc=False).limit(10).execute()
    top_sites = res.data or []

    if not top_sites:
        print("[Bot Error] No sites returned from Supabase.")
        return

    # Sample top 3 sites for tweet
    top_3 = top_sites[:3]
    top_str = "\n".join([f"  {idx+1}. {s['name']} (#{s['rank']} - {s['baseline']})" for idx, s in enumerate(top_3)])

    tweet_text = f"""📊 Pulse Weekly Web Traffic Digest

Top Most Visited Domains:
{top_str}

Explore live per-second tickers & traffic comparisons:
🌐 pulstraffic.com/report

#WebTraffic #TechTrends #AI #DataVisualization"""

    print("\nGenerated Tweet Preview:")
    print("-" * 40)
    try:
        print(tweet_text)
    except UnicodeEncodeError:
        print(tweet_text.encode('ascii', errors='replace').decode('ascii'))
    print("-" * 40)

    # 2. Post to X/Twitter if credentials exist
    if TWITTER_API_KEY and TWITTER_ACCESS_TOKEN:
        print("\nPosting to X/Twitter via API...")
        try:
            # Native X v2 API post using auth
            from authlib.integrations.httpx_client import OAuth1Client
            client = OAuth1Client(
                TWITTER_API_KEY,
                TWITTER_API_SECRET,
                TWITTER_ACCESS_TOKEN,
                TWITTER_ACCESS_SECRET
            )
            res = client.post(
                "https://api.twitter.com/2/tweets",
                json={"text": tweet_text}
            )
            if res.status_code == 201:
                print("SUCCESS: Tweet posted successfully!")
            else:
                print(f"X API Error ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"Failed to post tweet: {e}")
    else:
        print("\n[Notice] TWITTER_API_KEY missing in .env.local.")
        print("Copy the text above to post manually to Twitter/X, or add your Twitter Developer keys to automate!")

if __name__ == "__main__":
    generate_weekly_tweet()
