"""
static_baselines.py — Single Source of Truth for Site Traffic

These values are manually verified against SimilarWeb & Semrush monthly reports.
Update this file monthly. NEVER let the engine overwrite these with computed values.

Source: SimilarWeb Global Rankings — June 2026
Last updated: 2026-08-11

Format: { site_id: monthly_visits (integer) }
Rank is derived by sorting on monthly_visits descending — no separate rank field needed.
Rate (visits/sec) = monthly_visits // 2_628_000  (pure math, no model)
"""

# ─────────────────────────────────────────────────────────────────────────────
# ANCHOR: Google is rank 1 by definition
# All other baselines are real-world estimates relative to this anchor
# ─────────────────────────────────────────────────────────────────────────────
STATIC_BASELINES: dict[str, int] = {
    # ── Global Top 10 ─────────────────────────────────────────────────────────
    "google":       85_000_000_000,   # #1  SimilarWeb 2026-06
    "youtube":      34_800_000_000,   # #2  SimilarWeb 2026-06
    "facebook":     15_200_000_000,   # #3  SimilarWeb 2026-06
    "instagram":    10_400_000_000,   # #4  SimilarWeb 2026-06
    "chatgpt":       2_400_000_000,   # #5  SimilarWeb 2026-06 (2.4B web visits)
    "reddit":        4_800_000_000,   # #6  SimilarWeb 2026-06
    "wikipedia":     4_400_000_000,   # #7  SimilarWeb 2026-06
    "x":             3_100_000_000,   # #8  SimilarWeb 2026-06 (Twitter/X)
    "whatsapp":      2_900_000_000,   # #9  SimilarWeb 2026-06
    "tiktok":        2_800_000_000,   # #10 SimilarWeb 2026-06
    # ── 11–20 ─────────────────────────────────────────────────────────────────
    "amazon":        2_700_000_000,   # #11
    "yahoo":         2_600_000_000,   # #12
    "yandex":        2_500_000_000,   # #13
    "baidu":         2_200_000_000,   # #14
    "bing":          2_100_000_000,   # #15
    "openai":        2_000_000_000,   # #16 openai.com portal
    "netflix":       1_900_000_000,   # #17
    "microsoft":     1_800_000_000,   # #18
    "linkedin":      1_700_000_000,   # #19
    "office":        1_600_000_000,   # #20
    # ── 21–40 ─────────────────────────────────────────────────────────────────
    "github":        1_400_000_000,   # #21
    "twitch":        1_200_000_000,   # #22
    "weather":       1_100_000_000,   # #23
    "pinterest":     1_000_000_000,   # #24
    "claude":        1_100_000_000,   # #25 Anthropic Claude (Semrush 2026-06)
    "zoom":            920_000_000,   # #26
    "canva":           860_000_000,   # #27
    "gemini":          860_000_000,   # #28 Google Gemini web app
    "spotify":         640_000_000,   # #29
    "quora":           610_000_000,   # #30
    "ebay":            580_000_000,   # #31
    "duckduckgo":      560_000_000,   # #32
    "roblox":          545_000_000,   # #33
    "stackoverflow":   410_000_000,   # #34
    "imgur":           450_000_000,   # #35
    "apple":           520_000_000,   # #36
    "naver":           400_000_000,   # #37
    "bilibili":        390_000_000,   # #38
    "imdb":            370_000_000,   # #39
    "fandom":          360_000_000,   # #40
    # ── 41–60 ─────────────────────────────────────────────────────────────────
    "aliexpress":      340_000_000,   # #41
    "booking":         330_000_000,   # #42
    "discord":         320_000_000,   # #43
    "telegram":        300_000_000,   # #44
    "adobe":           310_000_000,   # #45
    "steam":           305_000_000,   # #46
    "bbc":             285_000_000,   # #47
    "cnn":             260_000_000,   # #48
    "mailru":          330_000_000,   # #49
    "globo":           295_000_000,   # #50
    "nytimes":         250_000_000,   # #51
    "paypal":          260_000_000,   # #52
    "walmart":         265_000_000,   # #53
    "target":          228_000_000,   # #54
    "etsy":            218_000_000,   # #55
    "medium":          195_000_000,   # #56
    "espn":            210_000_000,   # #57
    "salesforce":      198_000_000,   # #58
    "vimeo":           178_000_000,   # #59
    "dropbox":         172_000_000,   # #60
    # ── 61–80 ─────────────────────────────────────────────────────────────────
    "slack":           168_000_000,   # #61
    "dailymail":       195_000_000,   # #62
    "coinbase":        175_000_000,   # #63
    "binance":         158_000_000,   # #64
    "investing":       162_000_000,   # #65
    "tradingview":     185_000_000,   # #66
    "bloomberg":       148_000_000,   # #67
    "huggingface":     210_000_000,   # #68
    "midjourney":      145_000_000,   # #69
    "wikihow":         122_000_000,   # #70
    "merriamwebster":  118_000_000,   # #71
    "accuweather":     115_000_000,   # #72
    "shopify":         128_000_000,   # #73
    "bestbuy":         108_000_000,   # #74
    "ikea":            112_000_000,   # #75
    "indeed":          118_000_000,   # #76
    "nike":            104_000_000,   # #77
    "craigslist":       98_000_000,   # #78
    "patreon":         108_000_000,   # #79
    "soundcloud":       96_000_000,   # #80
    # ── 81–103 ────────────────────────────────────────────────────────────────
    "hulu":            102_000_000,   # #81
    "disneyplus":      110_000_000,   # #82
    "max":              94_000_000,   # #83
    "deviantart":       88_000_000,   # #84
    "ign":              90_000_000,   # #85
    "theguardian":      92_000_000,   # #86
    "reuters":          84_000_000,   # #87
    "forbes":           82_000_000,   # #88
    "techcrunch":       75_000_000,   # #89
    "wired":            78_000_000,   # #90
    "robinhood":        72_000_000,   # #91
    "stripe":           88_000_000,   # #92
    "speedtest":       112_000_000,   # #93
    "vercel":           80_000_000,   # #94
    "netlify":          68_000_000,   # #95
    "npm":              78_000_000,   # #96
    "gitlab":           72_000_000,   # #97
    "docker":           70_000_000,   # #98
    "stackexchange":    62_000_000,   # #99
    "wunderground":     58_000_000,   # #100
    "airbnb":          155_000_000,   # #101
    "uber":            148_000_000,   # #102
    "figma":           152_000_000,   # #103
}

# Seconds in a calendar month (30.4167 days)
SECONDS_PER_MONTH: int = 2_628_000


def get_rank_map() -> dict[str, int]:
    """
    Returns collision-free ranks derived by sorting on monthly visits descending.
    Sites with equal visits get a deterministic tiebreak via alphabetical site_id.
    """
    sorted_sites = sorted(
        STATIC_BASELINES.items(),
        key=lambda x: (-x[1], x[0])  # primary: traffic DESC, secondary: id ASC
    )
    return {site_id: rank for rank, (site_id, _) in enumerate(sorted_sites, start=1)}


def get_baseline_str(monthly: int) -> str:
    """Format monthly visits as a human-readable string: '7.2B / mo'"""
    if monthly >= 1_000_000_000:
        return f"{monthly / 1_000_000_000:.1f}B / mo"
    elif monthly >= 1_000_000:
        return f"{monthly / 1_000_000:.1f}M / mo"
    else:
        return f"{monthly / 1_000:.1f}K / mo"


def get_rate(monthly: int) -> int:
    """Pure math: visits per second = monthly / seconds_per_month"""
    return max(1, monthly // SECONDS_PER_MONTH)


# ─────────────────────────────────────────────────────────────────────────────
# SITE_META — Static metadata that doesn't change (mirrors sites.ts SITE_META)
# Only includes fields NOT written by the engine: name, category, color, logo.
# Used by run_engine.py to build the weekly snapshot with correct categories.
# ─────────────────────────────────────────────────────────────────────────────
SITE_META: dict[str, dict] = {
    "google":        {"name": "Google",           "category": "search",        "color": "#4285F4", "logo": "G"},
    "youtube":       {"name": "YouTube",          "category": "entertainment", "color": "#ef4444", "logo": "YT"},
    "facebook":      {"name": "Facebook",         "category": "social",        "color": "#1877F2", "logo": "F"},
    "instagram":     {"name": "Instagram",        "category": "social",        "color": "#E1306C", "logo": "In"},
    "chatgpt":       {"name": "ChatGPT",          "category": "ai",            "color": "#10a37f", "logo": "Ci"},
    "reddit":        {"name": "Reddit",           "category": "social",        "color": "#FF4500", "logo": "Re"},
    "wikipedia":     {"name": "Wikipedia",        "category": "reference",     "color": "#72777D", "logo": "Wi"},
    "x":             {"name": "X (Twitter)",      "category": "social",        "color": "#ffffff", "logo": "X"},
    "whatsapp":      {"name": "WhatsApp",         "category": "social",        "color": "#25d366", "logo": "Wa"},
    "tiktok":        {"name": "TikTok",           "category": "social",        "color": "#01f1e2", "logo": "Tk"},
    "amazon":        {"name": "Amazon",           "category": "ecommerce",     "color": "#ff9900", "logo": "Az"},
    "yahoo":         {"name": "Yahoo",            "category": "search",        "color": "#6001d2", "logo": "Y!"},
    "yandex":        {"name": "Yandex",           "category": "search",        "color": "#ffcc00", "logo": "Yd"},
    "baidu":         {"name": "Baidu",            "category": "search",        "color": "#2319dc", "logo": "Ba"},
    "bing":          {"name": "Bing",             "category": "search",        "color": "#008373", "logo": "Bi"},
    "openai":        {"name": "OpenAI",           "category": "ai",            "color": "#10a37f", "logo": "Oa"},
    "netflix":       {"name": "Netflix",          "category": "entertainment", "color": "#e50914", "logo": "N"},
    "microsoft":     {"name": "Microsoft",        "category": "dev",           "color": "#0078d4", "logo": "Ms"},
    "linkedin":      {"name": "LinkedIn",         "category": "social",        "color": "#0a66c2", "logo": "Li"},
    "office":        {"name": "Office 365",       "category": "dev",           "color": "#eb3c00", "logo": "O3"},
    "github":        {"name": "GitHub",           "category": "dev",           "color": "#24292f", "logo": "GH"},
    "twitch":        {"name": "Twitch",           "category": "entertainment", "color": "#9146ff", "logo": "Tw"},
    "weather":       {"name": "Weather",          "category": "reference",     "color": "#002f6c", "logo": "Wt"},
    "pinterest":     {"name": "Pinterest",        "category": "social",        "color": "#bd081c", "logo": "Pi"},
    "claude":        {"name": "Claude.ai",        "category": "ai",            "color": "#d97706", "logo": "Cl"},
    "zoom":          {"name": "Zoom",             "category": "dev",           "color": "#2d8cff", "logo": "Z"},
    "canva":         {"name": "Canva",            "category": "dev",           "color": "#00c4cc", "logo": "Cv"},
    "gemini":        {"name": "Gemini",           "category": "ai",            "color": "#4a90e2", "logo": "Gm"},
    "spotify":       {"name": "Spotify",          "category": "entertainment", "color": "#1db954", "logo": "Sp"},
    "quora":         {"name": "Quora",            "category": "reference",     "color": "#b92b27", "logo": "Q"},
    "ebay":          {"name": "eBay",             "category": "ecommerce",     "color": "#e53238", "logo": "eB"},
    "duckduckgo":    {"name": "DuckDuckGo",       "category": "search",        "color": "#de5833", "logo": "DD"},
    "roblox":        {"name": "Roblox",           "category": "entertainment", "color": "#888888", "logo": "Rx"},
    "stackoverflow": {"name": "Stack Overflow",   "category": "dev",           "color": "#f48024", "logo": "SO"},
    "imgur":         {"name": "Imgur",            "category": "entertainment", "color": "#1bb76e", "logo": "Ig"},
    "apple":         {"name": "Apple",            "category": "dev",           "color": "#a3aaae", "logo": "Ap"},
    "naver":         {"name": "Naver",            "category": "search",        "color": "#03c75a", "logo": "Nv"},
    "bilibili":      {"name": "Bilibili",         "category": "entertainment", "color": "#00a1d6", "logo": "Bl"},
    "imdb":          {"name": "IMDb",             "category": "reference",     "color": "#e6b91e", "logo": "iM"},
    "fandom":        {"name": "Fandom",           "category": "reference",     "color": "#00d6d6", "logo": "Fd"},
    "aliexpress":    {"name": "AliExpress",       "category": "ecommerce",     "color": "#ff4747", "logo": "AE"},
    "booking":       {"name": "Booking.com",      "category": "ecommerce",     "color": "#003580", "logo": "Bk"},
    "discord":       {"name": "Discord",          "category": "social",        "color": "#5865f2", "logo": "Dc"},
    "telegram":      {"name": "Telegram",         "category": "social",        "color": "#229ed9", "logo": "Tg"},
    "adobe":         {"name": "Adobe",            "category": "dev",           "color": "#ff0000", "logo": "Ad"},
    "steam":         {"name": "Steam",            "category": "entertainment", "color": "#171a21", "logo": "St"},
    "bbc":           {"name": "BBC",              "category": "news",          "color": "#ae251f", "logo": "BB"},
    "cnn":           {"name": "CNN",              "category": "news",          "color": "#cc0000", "logo": "CN"},
    "mailru":        {"name": "Mail.ru",          "category": "news",          "color": "#005eff", "logo": "Mr"},
    "globo":         {"name": "Globo",            "category": "news",          "color": "#ff4a4a", "logo": "Gb"},
    "nytimes":       {"name": "NY Times",         "category": "news",          "color": "#555555", "logo": "NY"},
    "paypal":        {"name": "PayPal",           "category": "finance",       "color": "#003087", "logo": "PP"},
    "walmart":       {"name": "Walmart",          "category": "ecommerce",     "color": "#0071dc", "logo": "Wm"},
    "target":        {"name": "Target",           "category": "ecommerce",     "color": "#cc0000", "logo": "Tg"},
    "etsy":          {"name": "Etsy",             "category": "ecommerce",     "color": "#d5641c", "logo": "Et"},
    "medium":        {"name": "Medium",           "category": "reference",     "color": "#333333", "logo": "Md"},
    "espn":          {"name": "ESPN",             "category": "entertainment", "color": "#ff002b", "logo": "ES"},
    "salesforce":    {"name": "Salesforce",       "category": "dev",           "color": "#00a1e0", "logo": "Sf"},
    "vimeo":         {"name": "Vimeo",            "category": "entertainment", "color": "#1ab7ea", "logo": "V"},
    "dropbox":       {"name": "Dropbox",          "category": "dev",           "color": "#0061fe", "logo": "Db"},
    "slack":         {"name": "Slack",            "category": "dev",           "color": "#4a154b", "logo": "Sl"},
    "dailymail":     {"name": "Daily Mail",       "category": "news",          "color": "#00356b", "logo": "DM"},
    "coinbase":      {"name": "Coinbase",         "category": "finance",       "color": "#0052ff", "logo": "Cb"},
    "binance":       {"name": "Binance",          "category": "finance",       "color": "#f3ba2f", "logo": "Bn"},
    "investing":     {"name": "Investing.com",    "category": "finance",       "color": "#1b4f72", "logo": "Iv"},
    "tradingview":   {"name": "TradingView",      "category": "finance",       "color": "#131722", "logo": "TV"},
    "bloomberg":     {"name": "Bloomberg",        "category": "finance",       "color": "#3b5998", "logo": "Bm"},
    "huggingface":   {"name": "Hugging Face",     "category": "ai",            "color": "#ffc72c", "logo": "HF"},
    "midjourney":    {"name": "Midjourney",       "category": "ai",            "color": "#1a1a2e", "logo": "Mj"},
    "wikihow":       {"name": "wikiHow",          "category": "reference",     "color": "#93b546", "logo": "WH"},
    "merriamwebster":{"name": "Merriam-Webster",  "category": "reference",     "color": "#0f4a7c", "logo": "MW"},
    "accuweather":   {"name": "AccuWeather",      "category": "reference",     "color": "#f05023", "logo": "Aw"},
    "shopify":       {"name": "Shopify",          "category": "ecommerce",     "color": "#96bf48", "logo": "Sh"},
    "bestbuy":       {"name": "Best Buy",         "category": "ecommerce",     "color": "#0046be", "logo": "BB"},
    "ikea":          {"name": "IKEA",             "category": "ecommerce",     "color": "#ffcc00", "logo": "IK"},
    "indeed":        {"name": "Indeed",           "category": "ecommerce",     "color": "#2164f3", "logo": "Ic"},
    "nike":          {"name": "Nike",             "category": "ecommerce",     "color": "#111111", "logo": "Nk"},
    "craigslist":    {"name": "Craigslist",       "category": "ecommerce",     "color": "#551a8b", "logo": "CL"},
    "patreon":       {"name": "Patreon",          "category": "social",        "color": "#ff424d", "logo": "Pa"},
    "soundcloud":    {"name": "SoundCloud",       "category": "entertainment", "color": "#ff5500", "logo": "SC"},
    "hulu":          {"name": "Hulu",             "category": "entertainment", "color": "#1ce783", "logo": "Hu"},
    "disneyplus":    {"name": "Disney+",          "category": "entertainment", "color": "#001d3d", "logo": "D+"},
    "max":           {"name": "Max",              "category": "entertainment", "color": "#002be7", "logo": "Mx"},
    "deviantart":    {"name": "DeviantArt",       "category": "entertainment", "color": "#05cc47", "logo": "DA"},
    "ign":           {"name": "IGN",              "category": "entertainment", "color": "#bf1313", "logo": "IG"},
    "theguardian":   {"name": "The Guardian",     "category": "news",          "color": "#005689", "logo": "Gd"},
    "reuters":       {"name": "Reuters",          "category": "news",          "color": "#ff8000", "logo": "Rt"},
    "forbes":        {"name": "Forbes",           "category": "news",          "color": "#00507d", "logo": "Fb"},
    "techcrunch":    {"name": "TechCrunch",       "category": "news",          "color": "#028000", "logo": "TC"},
    "wired":         {"name": "Wired",            "category": "news",          "color": "#000000", "logo": "Wr"},
    "robinhood":     {"name": "Robinhood",        "category": "finance",       "color": "#00c805", "logo": "Rh"},
    "stripe":        {"name": "Stripe",           "category": "finance",       "color": "#635bff", "logo": "Sr"},
    "speedtest":     {"name": "Speedtest",        "category": "dev",           "color": "#141b2b", "logo": "Sz"},
    "vercel":        {"name": "Vercel",           "category": "dev",           "color": "#000000", "logo": "Vc"},
    "netlify":       {"name": "Netlify",          "category": "dev",           "color": "#00ad9f", "logo": "Nt"},
    "npm":           {"name": "NPM",              "category": "dev",           "color": "#cb3837", "logo": "np"},
    "gitlab":        {"name": "GitLab",           "category": "dev",           "color": "#fc6d26", "logo": "GL"},
    "docker":        {"name": "Docker",           "category": "dev",           "color": "#0db7ed", "logo": "Dk"},
    "stackexchange": {"name": "Stack Exchange",   "category": "reference",     "color": "#0072bc", "logo": "SE"},
    "wunderground":  {"name": "Weather Underground","category": "reference",   "color": "#1a2b4c", "logo": "Wu"},
    "airbnb":        {"name": "Airbnb",           "category": "ecommerce",     "color": "#ff5a5f", "logo": "Ab"},
    "uber":          {"name": "Uber",             "category": "ecommerce",     "color": "#000000", "logo": "Ub"},
    "figma":         {"name": "Figma",            "category": "dev",           "color": "#f24e1e", "logo": "Fg"},
}

