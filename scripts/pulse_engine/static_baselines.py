"""
static_baselines.py - Single Source of Truth for Site Traffic

These values are manually verified against SimilarWeb & Semrush monthly reports.
Update this file monthly. NEVER let the engine overwrite these with computed values.

Source: SimilarWeb Global Rankings - 2026
Last updated: 2026-11-02

Format: { site_id: monthly_visits (integer) }
Rank is derived by sorting on monthly_visits descending - no separate rank field needed.
Rate (visits/sec) = monthly_visits // 2_628_000  (pure math, no model)

Engine v3: these curated values are the ANCHOR. The daily engine adjusts them (max ±15%)
by each site's Tranco rank movement since BASELINE_ANCHOR_DATE - see live_rank.py.
update_baselines.py bakes those adjustments in monthly and moves the anchor date forward.
"""

# Date (YYYY-MM-DD) the curated baselines below were last calibrated.
# The daily engine measures Tranco rank movement relative to this date.
BASELINE_ANCHOR_DATE: str = "2026-10-01"

# ─────────────────────────────────────────────────────────────────────────────
# ANCHOR: Google is rank 1 by definition
# All other baselines are real-world estimates relative to this anchor
# ─────────────────────────────────────────────────────────────────────────────
STATIC_BASELINES: dict[str, int] = {
    "google":           85_000_000_000,   # #1 Google
    "youtube":          34_800_000_000,   # #2 YouTube
    "facebook":         15_200_000_000,   # #3 Facebook
    "instagram":         6_800_000_000,   # #4 Instagram
    "chatgpt":           5_500_000_000,   # #5 ChatGPT
    "wikipedia":         4_500_000_000,   # #6 Wikipedia
    "amazon":            4_200_000_000,   # #7 Amazon
    "x":                 4_200_000_000,   # #8 X (Twitter)
    "whatsapp":          2_900_000_000,   # #9 WhatsApp
    "reddit":            2_800_000_000,   # #10 Reddit
    "tiktok":            2_800_000_000,   # #11 TikTok
    "yahoo":             2_800_000_000,   # #12 Yahoo
    "yandex":            2_500_000_000,   # #13 Yandex
    "baidu":             2_200_000_000,   # #14 Baidu
    "netflix":           2_100_000_000,   # #15 Netflix
    "openai":            2_000_000_000,   # #16 OpenAI
    "bing":              1_800_000_000,   # #17 Bing
    "microsoft":         1_800_000_000,   # #18 Microsoft
    "linkedin":          1_750_000_000,   # #19 LinkedIn
    "office":            1_600_000_000,   # #20 Office 365
    "vk":                1_300_000_000,   # #21 VK
    "twitch":            1_150_000_000,   # #22 Twitch
    "pinterest":         1_100_000_000,   # #23 Pinterest
    "weather":           1_100_000_000,   # #24 Weather
    "github":            1_000_000_000,   # #25 GitHub
    "zoom":                920_000_000,   # #26 Zoom
    "ebay":                900_000_000,   # #27 eBay
    "gemini":              860_000_000,   # #28 Gemini
    "duckduckgo":          850_000_000,   # #29 DuckDuckGo
    "quora":               750_000_000,   # #30 Quora
    "telegram":            750_000_000,   # #31 Telegram
    "aliexpress":          680_000_000,   # #32 AliExpress
    "canva":               650_000_000,   # #33 Canva
    "nytimes":             650_000_000,   # #34 NY Times
    "mercadolibre":        640_000_000,   # #35 Mercado Libre
    "temu":                620_000_000,   # #36 Temu
    "bbc":                 580_000_000,   # #37 BBC
    "discord":             580_000_000,   # #38 Discord
    "spotify":             560_000_000,   # #39 Spotify
    "roblox":              545_000_000,   # #40 Roblox
    "weibo":               540_000_000,   # #41 Weibo
    "rakuten":             530_000_000,   # #42 Rakuten
    "apple":               520_000_000,   # #43 Apple
    "booking":             520_000_000,   # #44 Booking.com
    "cnn":                 520_000_000,   # #45 CNN
    "walmart":             510_000_000,   # #46 Walmart
    "snapchat":            490_000_000,   # #47 Snapchat
    "primevideo":          480_000_000,   # #48 Prime Video
    "aws":                 460_000_000,   # #49 Amazon Web Services
    "imgur":               450_000_000,   # #50 Imgur
    "paypal":              440_000_000,   # #51 PayPal
    "flipkart":            430_000_000,   # #52 Flipkart
    "copilot":             420_000_000,   # #53 Microsoft Copilot
    "etsy":                420_000_000,   # #54 Etsy
    "wordpress":           410_000_000,   # #55 WordPress
    "naver":               400_000_000,   # #56 Naver
    "bilibili":            390_000_000,   # #57 Bilibili
    "stackoverflow":       390_000_000,   # #58 Stack Overflow
    "threads":             380_000_000,   # #59 Threads
    "imdb":                370_000_000,   # #60 IMDb
    "foxnews":             365_000_000,   # #61 Fox News
    "fandom":              360_000_000,   # #62 Fandom
    "disneyplus":          350_000_000,   # #63 Disney+
    "target":              340_000_000,   # #64 Target
    "theguardian":         340_000_000,   # #65 The Guardian
    "coupang":             335_000_000,   # #66 Coupang
    "mailru":              330_000_000,   # #67 Mail.ru
    "dailymotion":         325_000_000,   # #68 Dailymotion
    "homedepot":           320_000_000,   # #69 Home Depot
    "chase":               315_000_000,   # #70 Chase
    "adobe":               310_000_000,   # #71 Adobe
    "brave":               310_000_000,   # #72 Brave Search
    "grok":                310_000_000,   # #73 Grok
    "steam":               305_000_000,   # #74 Steam
    "globo":               295_000_000,   # #75 Globo
    "shein":               290_000_000,   # #76 Shein
    "seznam":              285_000_000,   # #77 Seznam
    "cnbc":                275_000_000,   # #78 CNBC
    "archive":             265_000_000,   # #79 Internet Archive
    "wix":                 260_000_000,   # #80 Wix
    "chess":               250_000_000,   # #81 Chess.com
    "costco":              245_000_000,   # #82 Costco
    "tumblr":              240_000_000,   # #83 Tumblr
    "myanimelist":         235_000_000,   # #84 MyAnimeList
    "line":                230_000_000,   # #85 LINE
    "washingtonpost":      230_000_000,   # #86 Washington Post
    "characterai":         220_000_000,   # #87 Character.ai
    "tradingview":         220_000_000,   # #88 TradingView
    "doordash":            215_000_000,   # #89 DoorDash
    "espn":                210_000_000,   # #90 ESPN
    "huggingface":         210_000_000,   # #91 Hugging Face
    "salesforce":          198_000_000,   # #92 Salesforce
    "dailymail":           195_000_000,   # #93 Daily Mail
    "fidelity":            190_000_000,   # #94 Fidelity
    "deepseek":            185_000_000,   # #95 DeepSeek
    "medium":              180_000_000,   # #96 Medium
    "notion":              180_000_000,   # #97 Notion
    "vimeo":               178_000_000,   # #98 Vimeo
    "applemusic":          175_000_000,   # #99 Apple Music
    "dropbox":             172_000_000,   # #100 Dropbox
    "goodreads":           168_000_000,   # #101 Goodreads
    "slack":               168_000_000,   # #102 Slack
    "cloudflare":          165_000_000,   # #103 Cloudflare
    "godaddy":             165_000_000,   # #104 GoDaddy
    "kick":                165_000_000,   # #105 Kick
    "investing":           162_000_000,   # #106 Investing.com
    "binance":             160_000_000,   # #107 Binance
    "wsj":                 160_000_000,   # #108 Wall Street Journal
    "airbnb":              155_000_000,   # #109 Airbnb
    "figma":               152_000_000,   # #110 Figma
    "bloomberg":           148_000_000,   # #111 Bloomberg
    "uber":                148_000_000,   # #112 Uber
    "schwab":              146_000_000,   # #113 Charles Schwab
    "coinbase":            145_000_000,   # #114 Coinbase
    "midjourney":          145_000_000,   # #115 Midjourney
    "rottentomatoes":      142_000_000,   # #116 Rotten Tomatoes
    "crunchyroll":         140_000_000,   # #117 Crunchyroll
    "squarespace":         140_000_000,   # #118 Squarespace
    "claude":              135_000_000,   # #119 Claude.ai
    "perplexity":          135_000_000,   # #120 Perplexity
    "nextdoor":            130_000_000,   # #121 Nextdoor
    "lichess":             128_000_000,   # #122 Lichess
    "wayfair":             125_000_000,   # #123 Wayfair
    "wikihow":             122_000_000,   # #124 wikiHow
    "coinmarketcap":       120_000_000,   # #125 CoinMarketCap
    "shopify":             120_000_000,   # #126 Shopify
    "indeed":              118_000_000,   # #127 Indeed
    "merriamwebster":      118_000_000,   # #128 Merriam-Webster
    "accuweather":         115_000_000,   # #129 AccuWeather
    "ecosia":              115_000_000,   # #130 Ecosia
    "ikea":                112_000_000,   # #131 IKEA
    "speedtest":           112_000_000,   # #132 Speedtest
    "epicgames":           110_000_000,   # #133 Epic Games
    "substack":            110_000_000,   # #134 Substack
    "bestbuy":             108_000_000,   # #135 Best Buy
    "patreon":             108_000_000,   # #136 Patreon
    "nike":                104_000_000,   # #137 Nike
    "hulu":                102_000_000,   # #138 Hulu
    "craigslist":           98_000_000,   # #139 Craigslist
    "soundcloud":           96_000_000,   # #140 SoundCloud
    "coingecko":            95_000_000,   # #141 CoinGecko
    "notebooklm":           95_000_000,   # #142 NotebookLM
    "max":                  94_000_000,   # #143 Max
    "arxiv":                92_000_000,   # #144 arXiv
    "instacart":            92_000_000,   # #145 Instacart
    "ign":                  90_000_000,   # #146 IGN
    "deviantart":           88_000_000,   # #147 DeviantArt
    "theverge":             86_000_000,   # #148 The Verge
    "bsky":                 85_000_000,   # #149 Bluesky
    "reuters":              84_000_000,   # #150 Reuters
    "forbes":               82_000_000,   # #151 Forbes
    "npm":                  80_000_000,   # #152 NPM
    "vercel":               80_000_000,   # #153 Vercel
    "wired":                78_000_000,   # #154 Wired
    "itchio":               76_000_000,   # #155 itch.io
    "techcrunch":           75_000_000,   # #156 TechCrunch
    "klarna":               74_000_000,   # #157 Klarna
    "gitlab":               72_000_000,   # #158 GitLab
    "robinhood":            72_000_000,   # #159 Robinhood
    "docker":               70_000_000,   # #160 Docker
    "jira":                 68_000_000,   # #161 Jira
    "netlify":              68_000_000,   # #162 Netlify
    "poe":                  65_000_000,   # #163 Poe
    "namecheap":            64_000_000,   # #164 Namecheap
    "stackexchange":        62_000_000,   # #165 Stack Exchange
    "stripe":               62_000_000,   # #166 Stripe
    "bybit":                60_000_000,   # #167 Bybit
    "kraken":               58_000_000,   # #168 Kraken
    "leonardo":             58_000_000,   # #169 Leonardo.Ai
    "wunderground":         58_000_000,   # #170 Weather Underground
    "wolframalpha":         56_000_000,   # #171 WolframAlpha
    "suno":                 55_000_000,   # #172 Suno
    "wise":                 55_000_000,   # #173 Wise
    "arstechnica":          54_000_000,   # #174 Ars Technica
    "civitai":              52_000_000,   # #175 Civitai
    "cursor":               48_000_000,   # #176 Cursor
    "kling":                46_000_000,   # #177 Kling AI
    "letterboxd":           45_000_000,   # #178 Letterboxd
    "replit":               45_000_000,   # #179 Replit
    "ollama":               44_000_000,   # #180 Ollama
    "elevenlabs":           42_000_000,   # #181 ElevenLabs
    "supabase":             42_000_000,   # #182 Supabase
    "revolut":              40_000_000,   # #183 Revolut
    "postman":              38_000_000,   # #184 Postman
    "v0":                   38_000_000,   # #185 v0 by Vercel
    "datadog":              36_000_000,   # #186 Datadog
    "mistral":              35_000_000,   # #187 Mistral AI
    "lovable":              34_000_000,   # #188 Lovable
    "grafana":              33_000_000,   # #189 Grafana
    "digitalocean":         32_000_000,   # #190 DigitalOcean
    "bolt":                 31_000_000,   # #191 Bolt.new
    "runwayml":             30_000_000,   # #192 Runway
    "render":               29_000_000,   # #193 Render
    "linear":               28_000_000,   # #194 Linear
    "mastodon":             26_000_000,   # #195 Mastodon
    "sentry":               25_000_000,   # #196 Sentry
    "railway":              24_000_000,   # #197 Railway
    "luma":                 22_000_000,   # #198 Luma AI
    "kagi":                 19_000_000,   # #199 Kagi Search
    "you":                  18_000_000,   # #200 You.com
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
# SITE_META - Static metadata that doesn't change (mirrors sites.ts SITE_META)
# Only includes fields NOT written by the engine: name, category, color, logo.
# Used by run_engine.py to build the weekly snapshot with correct categories.
# ─────────────────────────────────────────────────────────────────────────────
SITE_META: dict[str, dict] = {
    "google":        {"name": "Google", "category": "search", "color": "#4285F4", "logo": "G"},
    "youtube":       {"name": "YouTube", "category": "entertainment", "color": "#ef4444", "logo": "YT"},
    "facebook":      {"name": "Facebook", "category": "social", "color": "#1877F2", "logo": "F"},
    "instagram":     {"name": "Instagram", "category": "social", "color": "#E1306C", "logo": "In"},
    "chatgpt":       {"name": "ChatGPT", "category": "ai", "color": "#10a37f", "logo": "Ci"},
    "wikipedia":     {"name": "Wikipedia", "category": "reference", "color": "#72777D", "logo": "Wi"},
    "amazon":        {"name": "Amazon", "category": "ecommerce", "color": "#ff9900", "logo": "Az"},
    "x":             {"name": "X (Twitter)", "category": "social", "color": "#ffffff", "logo": "X"},
    "whatsapp":      {"name": "WhatsApp", "category": "social", "color": "#25d366", "logo": "Wa"},
    "reddit":        {"name": "Reddit", "category": "social", "color": "#FF4500", "logo": "Re"},
    "tiktok":        {"name": "TikTok", "category": "social", "color": "#01f1e2", "logo": "Tk"},
    "yahoo":         {"name": "Yahoo", "category": "search", "color": "#6001d2", "logo": "Y!"},
    "yandex":        {"name": "Yandex", "category": "search", "color": "#ffcc00", "logo": "Yd"},
    "baidu":         {"name": "Baidu", "category": "search", "color": "#2319dc", "logo": "Ba"},
    "netflix":       {"name": "Netflix", "category": "entertainment", "color": "#e50914", "logo": "N"},
    "openai":        {"name": "OpenAI", "category": "dev", "color": "#10a37f", "logo": "Oa"},
    "bing":          {"name": "Bing", "category": "search", "color": "#008373", "logo": "Bi"},
    "microsoft":     {"name": "Microsoft", "category": "dev", "color": "#0078d4", "logo": "Ms"},
    "linkedin":      {"name": "LinkedIn", "category": "social", "color": "#0a66c2", "logo": "Li"},
    "office":        {"name": "Office 365", "category": "dev", "color": "#eb3c00", "logo": "O3"},
    "vk":            {"name": "VK", "category": "social", "color": "#0077ff", "logo": "VK"},
    "twitch":        {"name": "Twitch", "category": "entertainment", "color": "#9146ff", "logo": "Tw"},
    "pinterest":     {"name": "Pinterest", "category": "social", "color": "#bd081c", "logo": "Pi"},
    "weather":       {"name": "Weather", "category": "reference", "color": "#002f6c", "logo": "Wt"},
    "github":        {"name": "GitHub", "category": "dev", "color": "#24292f", "logo": "GH"},
    "zoom":          {"name": "Zoom", "category": "dev", "color": "#2d8cff", "logo": "Z"},
    "ebay":          {"name": "eBay", "category": "ecommerce", "color": "#e53238", "logo": "eB"},
    "gemini":        {"name": "Gemini", "category": "ai", "color": "#4a90e2", "logo": "Gm"},
    "duckduckgo":    {"name": "DuckDuckGo", "category": "search", "color": "#de5833", "logo": "DD"},
    "quora":         {"name": "Quora", "category": "reference", "color": "#b92b27", "logo": "Q"},
    "telegram":      {"name": "Telegram", "category": "social", "color": "#229ed9", "logo": "Tg"},
    "aliexpress":    {"name": "AliExpress", "category": "ecommerce", "color": "#ff4747", "logo": "AE"},
    "canva":         {"name": "Canva", "category": "dev", "color": "#00c4cc", "logo": "Cv"},
    "nytimes":       {"name": "NY Times", "category": "news", "color": "#555555", "logo": "NY"},
    "mercadolibre":  {"name": "Mercado Libre", "category": "ecommerce", "color": "#ffe600", "logo": "ML"},
    "temu":          {"name": "Temu", "category": "ecommerce", "color": "#ff6600", "logo": "Tm"},
    "bbc":           {"name": "BBC", "category": "news", "color": "#ae251f", "logo": "BB"},
    "discord":       {"name": "Discord", "category": "social", "color": "#5865f2", "logo": "Dc"},
    "spotify":       {"name": "Spotify", "category": "entertainment", "color": "#1db954", "logo": "Sp"},
    "roblox":        {"name": "Roblox", "category": "entertainment", "color": "#888888", "logo": "Rx"},
    "weibo":         {"name": "Weibo", "category": "social", "color": "#df2029", "logo": "Wb"},
    "rakuten":       {"name": "Rakuten", "category": "ecommerce", "color": "#bf0000", "logo": "Rk"},
    "apple":         {"name": "Apple", "category": "dev", "color": "#a3aaae", "logo": "Ap"},
    "booking":       {"name": "Booking.com", "category": "ecommerce", "color": "#003580", "logo": "Bk"},
    "cnn":           {"name": "CNN", "category": "news", "color": "#cc0000", "logo": "CN"},
    "walmart":       {"name": "Walmart", "category": "ecommerce", "color": "#0071dc", "logo": "Wm"},
    "snapchat":      {"name": "Snapchat", "category": "social", "color": "#fffc00", "logo": "Sn"},
    "primevideo":    {"name": "Prime Video", "category": "entertainment", "color": "#00a8e1", "logo": "PV"},
    "aws":           {"name": "Amazon Web Services", "category": "dev", "color": "#ff9900", "logo": "AW"},
    "imgur":         {"name": "Imgur", "category": "entertainment", "color": "#1bb76e", "logo": "Ig"},
    "paypal":        {"name": "PayPal", "category": "finance", "color": "#003087", "logo": "PP"},
    "flipkart":      {"name": "Flipkart", "category": "ecommerce", "color": "#2874f0", "logo": "Fk"},
    "copilot":       {"name": "Microsoft Copilot", "category": "ai", "color": "#00a4ef", "logo": "Cp"},
    "etsy":          {"name": "Etsy", "category": "ecommerce", "color": "#d5641c", "logo": "Et"},
    "wordpress":     {"name": "WordPress", "category": "dev", "color": "#21759b", "logo": "WP"},
    "naver":         {"name": "Naver", "category": "search", "color": "#03c75a", "logo": "Nv"},
    "bilibili":      {"name": "Bilibili", "category": "entertainment", "color": "#00a1d6", "logo": "Bl"},
    "stackoverflow": {"name": "Stack Overflow", "category": "dev", "color": "#f48024", "logo": "SO"},
    "threads":       {"name": "Threads", "category": "social", "color": "#ffffff", "logo": "Th"},
    "imdb":          {"name": "IMDb", "category": "reference", "color": "#e6b91e", "logo": "iM"},
    "foxnews":       {"name": "Fox News", "category": "news", "color": "#003366", "logo": "FX"},
    "fandom":        {"name": "Fandom", "category": "reference", "color": "#00d6d6", "logo": "Fd"},
    "disneyplus":    {"name": "Disney+", "category": "entertainment", "color": "#001d3d", "logo": "D+"},
    "target":        {"name": "Target", "category": "ecommerce", "color": "#cc0000", "logo": "Tg"},
    "theguardian":   {"name": "The Guardian", "category": "news", "color": "#005689", "logo": "Gd"},
    "coupang":       {"name": "Coupang", "category": "ecommerce", "color": "#e62e2d", "logo": "Cp"},
    "mailru":        {"name": "Mail.ru", "category": "news", "color": "#005eff", "logo": "Mr"},
    "dailymotion":   {"name": "Dailymotion", "category": "entertainment", "color": "#0066dc", "logo": "Dm"},
    "homedepot":     {"name": "Home Depot", "category": "ecommerce", "color": "#f96302", "logo": "HD"},
    "chase":         {"name": "Chase", "category": "finance", "color": "#117aca", "logo": "Ch"},
    "adobe":         {"name": "Adobe", "category": "dev", "color": "#ff0000", "logo": "Ad"},
    "brave":         {"name": "Brave Search", "category": "search", "color": "#fb542b", "logo": "Br"},
    "grok":          {"name": "Grok", "category": "ai", "color": "#ffffff", "logo": "Gk"},
    "steam":         {"name": "Steam", "category": "entertainment", "color": "#171a21", "logo": "St"},
    "globo":         {"name": "Globo", "category": "news", "color": "#ff4a4a", "logo": "Gb"},
    "shein":         {"name": "Shein", "category": "ecommerce", "color": "#ffffff", "logo": "Sh"},
    "seznam":        {"name": "Seznam", "category": "search", "color": "#cc0000", "logo": "Sz"},
    "cnbc":          {"name": "CNBC", "category": "news", "color": "#005594", "logo": "CB"},
    "archive":       {"name": "Internet Archive", "category": "reference", "color": "#ffffff", "logo": "IA"},
    "wix":           {"name": "Wix", "category": "dev", "color": "#0c6efc", "logo": "Wx"},
    "chess":         {"name": "Chess.com", "category": "entertainment", "color": "#81b64c", "logo": "Ch"},
    "costco":        {"name": "Costco", "category": "ecommerce", "color": "#e31837", "logo": "Co"},
    "tumblr":        {"name": "Tumblr", "category": "social", "color": "#36465d", "logo": "Tb"},
    "myanimelist":   {"name": "MyAnimeList", "category": "entertainment", "color": "#2e51a2", "logo": "MA"},
    "line":          {"name": "LINE", "category": "social", "color": "#00c300", "logo": "LN"},
    "washingtonpost":{"name": "Washington Post", "category": "news", "color": "#ffffff", "logo": "WP"},
    "characterai":   {"name": "Character.ai", "category": "ai", "color": "#6366f1", "logo": "CA"},
    "tradingview":   {"name": "TradingView", "category": "finance", "color": "#131722", "logo": "TV"},
    "doordash":      {"name": "DoorDash", "category": "ecommerce", "color": "#ff3008", "logo": "DD"},
    "espn":          {"name": "ESPN", "category": "entertainment", "color": "#ff002b", "logo": "ES"},
    "huggingface":   {"name": "Hugging Face", "category": "ai", "color": "#ffc72c", "logo": "HF"},
    "salesforce":    {"name": "Salesforce", "category": "dev", "color": "#00a1e0", "logo": "Sf"},
    "dailymail":     {"name": "Daily Mail", "category": "news", "color": "#00356b", "logo": "DM"},
    "fidelity":      {"name": "Fidelity", "category": "finance", "color": "#368727", "logo": "Fd"},
    "deepseek":      {"name": "DeepSeek", "category": "ai", "color": "#1e88e5", "logo": "DS"},
    "medium":        {"name": "Medium", "category": "reference", "color": "#333333", "logo": "Md"},
    "notion":        {"name": "Notion", "category": "dev", "color": "#ffffff", "logo": "No"},
    "vimeo":         {"name": "Vimeo", "category": "entertainment", "color": "#1ab7ea", "logo": "V"},
    "applemusic":    {"name": "Apple Music", "category": "entertainment", "color": "#fa243c", "logo": "AM"},
    "dropbox":       {"name": "Dropbox", "category": "dev", "color": "#0061fe", "logo": "Db"},
    "goodreads":     {"name": "Goodreads", "category": "reference", "color": "#553b08", "logo": "Gr"},
    "slack":         {"name": "Slack", "category": "dev", "color": "#4a154b", "logo": "Sl"},
    "cloudflare":    {"name": "Cloudflare", "category": "dev", "color": "#f38020", "logo": "CF"},
    "godaddy":       {"name": "GoDaddy", "category": "dev", "color": "#1bdbdb", "logo": "GD"},
    "kick":          {"name": "Kick", "category": "entertainment", "color": "#53fc18", "logo": "Kc"},
    "investing":     {"name": "Investing.com", "category": "finance", "color": "#1b4f72", "logo": "Iv"},
    "binance":       {"name": "Binance", "category": "finance", "color": "#f3ba2f", "logo": "Bn"},
    "wsj":           {"name": "Wall Street Journal", "category": "news", "color": "#ffffff", "logo": "WJ"},
    "airbnb":        {"name": "Airbnb", "category": "ecommerce", "color": "#ff5a5f", "logo": "Ab"},
    "figma":         {"name": "Figma", "category": "dev", "color": "#f24e1e", "logo": "Fg"},
    "bloomberg":     {"name": "Bloomberg", "category": "finance", "color": "#3b5998", "logo": "Bm"},
    "uber":          {"name": "Uber", "category": "ecommerce", "color": "#000000", "logo": "Ub"},
    "schwab":        {"name": "Charles Schwab", "category": "finance", "color": "#00a0df", "logo": "CS"},
    "coinbase":      {"name": "Coinbase", "category": "finance", "color": "#0052ff", "logo": "Cb"},
    "midjourney":    {"name": "Midjourney", "category": "ai", "color": "#1a1a2e", "logo": "Mj"},
    "rottentomatoes":{"name": "Rotten Tomatoes", "category": "entertainment", "color": "#fa320a", "logo": "RT"},
    "crunchyroll":   {"name": "Crunchyroll", "category": "entertainment", "color": "#f47521", "logo": "Cr"},
    "squarespace":   {"name": "Squarespace", "category": "dev", "color": "#ffffff", "logo": "Sq"},
    "claude":        {"name": "Claude.ai", "category": "ai", "color": "#d97706", "logo": "Cl"},
    "perplexity":    {"name": "Perplexity", "category": "ai", "color": "#22b8cd", "logo": "Px"},
    "nextdoor":      {"name": "Nextdoor", "category": "social", "color": "#8ed500", "logo": "Nd"},
    "lichess":       {"name": "Lichess", "category": "entertainment", "color": "#ffffff", "logo": "Lc"},
    "wayfair":       {"name": "Wayfair", "category": "ecommerce", "color": "#7f187f", "logo": "Wf"},
    "wikihow":       {"name": "wikiHow", "category": "reference", "color": "#93b546", "logo": "WH"},
    "coinmarketcap": {"name": "CoinMarketCap", "category": "finance", "color": "#3861fb", "logo": "CM"},
    "shopify":       {"name": "Shopify", "category": "ecommerce", "color": "#96bf48", "logo": "Sh"},
    "indeed":        {"name": "Indeed", "category": "ecommerce", "color": "#2164f3", "logo": "Ic"},
    "merriamwebster":{"name": "Merriam-Webster", "category": "reference", "color": "#0f4a7c", "logo": "MW"},
    "accuweather":   {"name": "AccuWeather", "category": "reference", "color": "#f05023", "logo": "Aw"},
    "ecosia":        {"name": "Ecosia", "category": "search", "color": "#3c8a2e", "logo": "Ec"},
    "ikea":          {"name": "IKEA", "category": "ecommerce", "color": "#ffcc00", "logo": "IK"},
    "speedtest":     {"name": "Speedtest", "category": "dev", "color": "#141b2b", "logo": "Sz"},
    "epicgames":     {"name": "Epic Games", "category": "entertainment", "color": "#ffffff", "logo": "EG"},
    "substack":      {"name": "Substack", "category": "reference", "color": "#ff6719", "logo": "Sb"},
    "bestbuy":       {"name": "Best Buy", "category": "ecommerce", "color": "#0046be", "logo": "BB"},
    "patreon":       {"name": "Patreon", "category": "social", "color": "#ff424d", "logo": "Pa"},
    "nike":          {"name": "Nike", "category": "ecommerce", "color": "#111111", "logo": "Nk"},
    "hulu":          {"name": "Hulu", "category": "entertainment", "color": "#1ce783", "logo": "Hu"},
    "craigslist":    {"name": "Craigslist", "category": "ecommerce", "color": "#551a8b", "logo": "CL"},
    "soundcloud":    {"name": "SoundCloud", "category": "entertainment", "color": "#ff5500", "logo": "SC"},
    "coingecko":     {"name": "CoinGecko", "category": "finance", "color": "#8bc53f", "logo": "CG"},
    "notebooklm":    {"name": "NotebookLM", "category": "ai", "color": "#34a853", "logo": "NB"},
    "max":           {"name": "Max", "category": "entertainment", "color": "#002be7", "logo": "Mx"},
    "arxiv":         {"name": "arXiv", "category": "reference", "color": "#b31b1b", "logo": "aX"},
    "instacart":     {"name": "Instacart", "category": "ecommerce", "color": "#43b02a", "logo": "Ic"},
    "ign":           {"name": "IGN", "category": "entertainment", "color": "#bf1313", "logo": "IG"},
    "deviantart":    {"name": "DeviantArt", "category": "entertainment", "color": "#05cc47", "logo": "DA"},
    "theverge":      {"name": "The Verge", "category": "news", "color": "#e5127d", "logo": "TV"},
    "bsky":          {"name": "Bluesky", "category": "social", "color": "#0285ff", "logo": "Bs"},
    "reuters":       {"name": "Reuters", "category": "news", "color": "#ff8000", "logo": "Rt"},
    "forbes":        {"name": "Forbes", "category": "news", "color": "#00507d", "logo": "Fb"},
    "npm":           {"name": "NPM", "category": "dev", "color": "#cb3837", "logo": "np"},
    "vercel":        {"name": "Vercel", "category": "dev", "color": "#000000", "logo": "Vc"},
    "wired":         {"name": "Wired", "category": "news", "color": "#000000", "logo": "Wr"},
    "itchio":        {"name": "itch.io", "category": "entertainment", "color": "#fa5c5c", "logo": "it"},
    "techcrunch":    {"name": "TechCrunch", "category": "news", "color": "#028000", "logo": "TC"},
    "klarna":        {"name": "Klarna", "category": "finance", "color": "#ffb3c7", "logo": "Kl"},
    "gitlab":        {"name": "GitLab", "category": "dev", "color": "#fc6d26", "logo": "GL"},
    "robinhood":     {"name": "Robinhood", "category": "finance", "color": "#00c805", "logo": "Rh"},
    "docker":        {"name": "Docker", "category": "dev", "color": "#0db7ed", "logo": "Dk"},
    "jira":          {"name": "Jira", "category": "dev", "color": "#0052cc", "logo": "Jr"},
    "netlify":       {"name": "Netlify", "category": "dev", "color": "#00ad9f", "logo": "Nt"},
    "poe":           {"name": "Poe", "category": "ai", "color": "#6d28d9", "logo": "Po"},
    "namecheap":     {"name": "Namecheap", "category": "dev", "color": "#de3723", "logo": "Nc"},
    "stackexchange": {"name": "Stack Exchange", "category": "reference", "color": "#0072bc", "logo": "SE"},
    "stripe":        {"name": "Stripe", "category": "finance", "color": "#635bff", "logo": "Sr"},
    "bybit":         {"name": "Bybit", "category": "finance", "color": "#f7a600", "logo": "By"},
    "kraken":        {"name": "Kraken", "category": "finance", "color": "#5741d9", "logo": "Kr"},
    "leonardo":      {"name": "Leonardo.Ai", "category": "ai", "color": "#8b5cf6", "logo": "Le"},
    "wunderground":  {"name": "Weather Underground", "category": "reference", "color": "#1a2b4c", "logo": "Wu"},
    "wolframalpha":  {"name": "WolframAlpha", "category": "reference", "color": "#dd1100", "logo": "WA"},
    "suno":          {"name": "Suno", "category": "ai", "color": "#ff3366", "logo": "Su"},
    "wise":          {"name": "Wise", "category": "finance", "color": "#9fe870", "logo": "Ws"},
    "arstechnica":   {"name": "Ars Technica", "category": "news", "color": "#ff4e00", "logo": "AT"},
    "civitai":       {"name": "Civitai", "category": "ai", "color": "#2563eb", "logo": "Cv"},
    "cursor":        {"name": "Cursor", "category": "dev", "color": "#00f0ff", "logo": "Cr"},
    "kling":         {"name": "Kling AI", "category": "ai", "color": "#06b6d4", "logo": "Kl"},
    "letterboxd":    {"name": "Letterboxd", "category": "entertainment", "color": "#00e054", "logo": "Lb"},
    "replit":        {"name": "Replit", "category": "dev", "color": "#f26207", "logo": "Rp"},
    "ollama":        {"name": "Ollama", "category": "ai", "color": "#ffffff", "logo": "Ol"},
    "elevenlabs":    {"name": "ElevenLabs", "category": "ai", "color": "#ffffff", "logo": "11"},
    "supabase":      {"name": "Supabase", "category": "dev", "color": "#3ecf8e", "logo": "Sb"},
    "revolut":       {"name": "Revolut", "category": "finance", "color": "#0075eb", "logo": "Rv"},
    "postman":       {"name": "Postman", "category": "dev", "color": "#ff6c37", "logo": "Pm"},
    "v0":            {"name": "v0 by Vercel", "category": "ai", "color": "#ffffff", "logo": "v0"},
    "datadog":       {"name": "Datadog", "category": "dev", "color": "#632ca6", "logo": "DD"},
    "mistral":       {"name": "Mistral AI", "category": "ai", "color": "#fd531e", "logo": "Ms"},
    "lovable":       {"name": "Lovable", "category": "ai", "color": "#ec4899", "logo": "Lv"},
    "grafana":       {"name": "Grafana", "category": "dev", "color": "#f46800", "logo": "Gf"},
    "digitalocean":  {"name": "DigitalOcean", "category": "dev", "color": "#0080ff", "logo": "DO"},
    "bolt":          {"name": "Bolt.new", "category": "ai", "color": "#3b82f6", "logo": "Bt"},
    "runwayml":      {"name": "Runway", "category": "ai", "color": "#00ff87", "logo": "Rw"},
    "render":        {"name": "Render", "category": "dev", "color": "#46e3b7", "logo": "Rn"},
    "linear":        {"name": "Linear", "category": "dev", "color": "#5e6ad2", "logo": "Ln"},
    "mastodon":      {"name": "Mastodon", "category": "social", "color": "#6364ff", "logo": "Ma"},
    "sentry":        {"name": "Sentry", "category": "dev", "color": "#362d59", "logo": "Sn"},
    "railway":       {"name": "Railway", "category": "dev", "color": "#9333ea", "logo": "Rw"},
    "luma":          {"name": "Luma AI", "category": "ai", "color": "#ff3b30", "logo": "Lu"},
    "kagi":          {"name": "Kagi Search", "category": "search", "color": "#ffb319", "logo": "Kg"},
    "you":           {"name": "You.com", "category": "ai", "color": "#6366f1", "logo": "Yo"},
}
