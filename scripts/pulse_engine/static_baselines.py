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
