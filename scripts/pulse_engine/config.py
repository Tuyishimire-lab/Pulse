import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env.local from project root
env_path = Path(__file__).resolve().parent.parent.parent / '.env.local'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN", "")
OPENPAGERANK_API_KEY = os.getenv("OPENPAGERANK_API_KEY", "")
KEYWORDSEVERYWHERE_API_KEY = os.getenv("KEYWORDSEVERYWHERE_API_KEY", "")

# Ground truth anchor calibrators
ANCHOR_MONTHLY = 85_000_000_000  # Google ~85 Billion monthly visits
ZIPF_EXPONENT = 1.3             # Calibrated via validation: optimal for most mid-tier sites
                                # (YouTube is an outlier: traffic served via googleapis.com,
                                #  Reddit/GitHub/Discord have DNS-inflated ranks from API bots)
