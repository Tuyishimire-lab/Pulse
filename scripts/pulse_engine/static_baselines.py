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
    "google":       85_000_000_000,   # #1  Alphabet SEC consensus
    "youtube":      34_800_000_000,   # #2  SimilarWeb 2026
    "facebook":     15_200_000_000,   # #3  Meta 2026 IR
    "instagram":     6_800_000_000,   # #4  Meta Q2 report
    "chatgpt":       5_500_000_000,   # #5  Similarweb 2026 (chatgpt.com)
    "wikipedia":     4_500_000_000,   # #6  Wikimedia Foundation
    "amazon":        4_200_000_000,   # #7  Amazon SEC 10-Q
    "x":             4_200_000_000,   # #8  X Corp disclosures
    "whatsapp":      2_900_000_000,   # #9  Meta messaging
    "reddit":        2_800_000_000,   # #10 Reddit S-1 IPO & 10-Q
    # ── 11–20 ─────────────────────────────────────────────────────────────────
    "tiktok":        2_800_000_000,   # #11 ByteDance Web
    "yahoo":         2_800_000_000,   # #12
    "yandex":        2_500_000_000,   # #13
    "baidu":         2_200_000_000,   # #14
    "netflix":       2_100_000_000,   # #15 Netflix Shareholder report
    "openai":        2_000_000_000,   # #16 openai.com portal
    "bing":          1_800_000_000,   # #17 Microsoft Search
    "microsoft":     1_800_000_000,   # #18
    "linkedin":      1_750_000_000,   # #19 Microsoft Q3 IR
    "office":        1_600_000_000,   # #20
    # ── 21–40 ─────────────────────────────────────────────────────────────────
    "twitch":        1_150_000_000,   # #21 Twitch Media Kit
    "weather":       1_100_000_000,   # #22
    "pinterest":     1_100_000_000,   # #23 Pinterest Q1 IR
    "github":        1_000_000_000,   # #24 GitHub Octoverse
    "zoom":            920_000_000,   # #25
    "ebay":            900_000_000,   # #26 eBay IR
    "duckduckgo":      850_000_000,   # #27 DuckDuckGo public stats
    "gemini":          860_000_000,   # #28 Google Gemini web app
    "quora":           750_000_000,   # #29 Quora press kit
    "telegram":        750_000_000,   # #30 Telegram channel stats
    "aliexpress":      680_000_000,   # #31 Alibaba Group
    "canva":           650_000_000,   # #32 Canva press release
    "nytimes":         650_000_000,   # #33 NY Times SEC 10-Q
    "discord":         580_000_000,   # #34 Discord transparency
    "bbc":             580_000_000,   # #35 Similarweb (bbc.co.uk + bbc.com)
    "spotify":         560_000_000,   # #36 Spotify shareholder deck
    "roblox":          545_000_000,   # #37
    "booking":         520_000_000,   # #38 Booking Holdings
    "walmart":         510_000_000,   # #39 Walmart Digital Commerce
    "disneyplus":      350_000_000,   # #40 Disney Direct-to-Consumer Web
    # ── 41–60 ─────────────────────────────────────────────────────────────────
    "cnn":             520_000_000,   # #41 Warner Bros Discovery
    "apple":           520_000_000,   # #42
    "imgur":           450_000_000,   # #43
    "paypal":          440_000_000,   # #44 PayPal IR
    "etsy":            420_000_000,   # #45 Etsy IR
    "stackoverflow":   390_000_000,   # #46 Prosus Annual Report
    "naver":           400_000_000,   # #47
    "bilibili":        390_000_000,   # #48
    "imdb":            370_000_000,   # #49
    "fandom":          360_000_000,   # #50
    "theguardian":     340_000_000,   # #51 Guardian Media Group
    "target":          340_000_000,   # #52 Target Corp IR
    "mailru":          330_000_000,   # #53
    "adobe":           310_000_000,   # #54
    "steam":           305_000_000,   # #55
    "globo":           295_000_000,   # #56
    "tradingview":     220_000_000,   # #57 TradingView stats
    "espn":            210_000_000,   # #58
    "huggingface":     210_000_000,   # #59
    # ── 60–80 ─────────────────────────────────────────────────────────────────
    "salesforce":      198_000_000,   # #60
    "dailymail":       195_000_000,   # #61
    "medium":          180_000_000,   # #62 Medium Partner stats
    "vimeo":           178_000_000,   # #63
    "coinbase":        145_000_000,   # #64 Coinbase Shareholder Letter
    "binance":         160_000_000,   # #65 Binance transparency
    "dropbox":         172_000_000,   # #66
    "slack":           168_000_000,   # #67
    "investing":       162_000_000,   # #68
    "claude":          135_000_000,   # #69 Anthropic Claude (135M)
    "bloomberg":       148_000_000,   # #70
    "midjourney":      145_000_000,   # #71
    "shopify":         120_000_000,   # #72 Shopify Financials
    "wikihow":         122_000_000,   # #73
    "merriamwebster":  118_000_000,   # #74
    "accuweather":     115_000_000,   # #75
    "speedtest":       112_000_000,   # #76
    "bestbuy":         108_000_000,   # #77
    "ikea":            112_000_000,   # #78
    "indeed":          118_000_000,   # #79
    # ── 80–103 ────────────────────────────────────────────────────────────────
    "patreon":         108_000_000,   # #80
    "nike":            104_000_000,   # #81
    "hulu":            102_000_000,   # #82
    "craigslist":       98_000_000,   # #83
    "soundcloud":       96_000_000,   # #84
    "max":              94_000_000,   # #85
    "ign":              90_000_000,   # #86
    "deviantart":       88_000_000,   # #87
    "reuters":          84_000_000,   # #88
    "forbes":           82_000_000,   # #89
    "vercel":           80_000_000,   # #90
    "wired":            78_000_000,   # #91
    "techcrunch":       75_000_000,   # #92
    "robinhood":        72_000_000,   # #93
    "netlify":          68_000_000,   # #94
    "stripe":           62_000_000,   # #95 Stripe Annual Letter
    "npm":              80_000_000,   # #96 NPM registry stats
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

