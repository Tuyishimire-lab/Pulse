export interface SiteConfig {
  id: string;
  name: string;
  url: string;
  category: string;
  logo: string;
  color: string;
  glow: string;
  // ── Engine-owned fields (authoritative from Supabase, optional for static fallback) ──
  /** Global rank — written by the engine's collision-free arbitration pass. */
  rank: number;
  /** Human-readable monthly visits (e.g. '7.2B / mo') — written by engine. */
  baseline: string;
  /** Raw monthly visits as a number — use this for all numeric comparisons. */
  baselineRaw: number;
  /** Visits per second — written by the PTI model. */
  rate: number;
  /** Progress bar width relative to Google (100%). Written by engine. */
  progress: number;
  // ── Optional / supplemental fields ──
  asn?: number[];
  keywords?: string[] | null;
  rank_history?: { rank: number; date: string }[];
  updated_at?: string;
}

/** Static metadata that never changes — used by getSites.ts to enrich DB rows. */
export type SiteMeta = Pick<SiteConfig, 'id' | 'name' | 'url' | 'category' | 'logo' | 'color' | 'glow' | 'asn'>;

export const CATEGORIES = [
  { id: 'all', label: 'All Platforms' },
  { id: 'search', label: 'Search' },
  { id: 'social', label: 'Social Media' },
  { id: 'ai', label: 'AI Assistants' },
  { id: 'reference', label: 'Reference' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'news', label: 'News & Media' },
  { id: 'finance', label: 'Finance & Crypto' },
  { id: 'dev', label: 'Developer Tools' }
];

// Traffic baselines updated for 2026 — aligned with Similarweb & Semrush global traffic rankings (June 2026).
// rate = visits per second (baseline / 2,628,000 seconds per month), rounded.
// progress = % of Google traffic (used for bar chart width).
export const SITES: SiteConfig[] = [
  // ── Global Top 10 (Authentic 2026 Rankings) ──────────────────────────────────
  { id: 'google', name: 'Google', url: 'https://google.com', rank: 1, category: 'search', baseline: '92.5B / mo', baselineRaw: 92_500_000_000, rate: 35198, logo: 'G', color: '#4285F4', glow: 'rgba(66, 133, 244, 0.15)', progress: 100, asn: [15169] },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com', rank: 2, category: 'entertainment', baseline: '34.8B / mo', baselineRaw: 34_800_000_000, rate: 13242, logo: 'YT', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.15)', progress: 37.6, asn: [15169] },
  { id: 'facebook', name: 'Facebook', url: 'https://facebook.com', rank: 3, category: 'social', baseline: '15.2B / mo', baselineRaw: 15_200_000_000, rate: 5783, logo: 'F', color: '#1877F2', glow: 'rgba(24, 119, 242, 0.15)', progress: 16.4, asn: [32934] },
  { id: 'instagram', name: 'Instagram', url: 'https://instagram.com', rank: 4, category: 'social', baseline: '10.4B / mo', baselineRaw: 10_400_000_000, rate: 3957, logo: 'In', color: '#E1306C', glow: 'rgba(225, 48, 108, 0.15)', progress: 11.2, asn: [32934] },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', rank: 5, category: 'ai', baseline: '7.2B / mo', baselineRaw: 7_200_000_000, rate: 2739, logo: 'Ci', color: '#10a37f', glow: 'rgba(16, 163, 127, 0.15)', progress: 7.8, asn: [20473] },
  { id: 'reddit', name: 'Reddit', url: 'https://reddit.com', rank: 6, category: 'social', baseline: '4.8B / mo', baselineRaw: 4_800_000_000, rate: 1826, logo: 'Re', color: '#FF4500', glow: 'rgba(255, 69, 0, 0.15)', progress: 5.2, asn: [30064] },
  { id: 'wikipedia', name: 'Wikipedia', url: 'https://wikipedia.org', rank: 7, category: 'reference', baseline: '4.4B / mo', baselineRaw: 4_400_000_000, rate: 1674, logo: 'Wi', color: '#72777D', glow: 'rgba(114, 119, 125, 0.15)', progress: 4.8, asn: [14907] },
  { id: 'x', name: 'X (Twitter)', url: 'https://x.com', rank: 8, category: 'social', baseline: '3.1B / mo', baselineRaw: 3_100_000_000, rate: 1179, logo: 'X', color: '#ffffff', glow: 'rgba(255, 255, 255, 0.1)', progress: 3.4, asn: [13414] },
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://whatsapp.com', rank: 9, category: 'social', baseline: '2.9B / mo', baselineRaw: 2_900_000_000, rate: 1103, logo: 'Wa', color: '#25d366', glow: 'rgba(37, 211, 102, 0.15)', progress: 3.1 },
  { id: 'tiktok', name: 'TikTok', url: 'https://tiktok.com', rank: 10, category: 'social', baseline: '2.8B / mo', baselineRaw: 2_800_000_000, rate: 1065, logo: 'Tk', color: '#01f1e2', glow: 'rgba(1, 241, 226, 0.15)', progress: 3.0, asn: [396986] },
  // ── 11–20 ────────────────────────────────────────────────────────────────
  { id: 'amazon', name: 'Amazon', url: 'https://amazon.com', rank: 11, category: 'ecommerce', baseline: '2.7B / mo', baselineRaw: 2_700_000_000, rate: 1027, logo: 'Az', color: '#ff9900', glow: 'rgba(255, 153, 0, 0.15)', progress: 2.9, asn: [16509] },
  { id: 'yahoo', name: 'Yahoo', url: 'https://yahoo.com', rank: 12, category: 'search', baseline: '2.6B / mo', baselineRaw: 2_600_000_000, rate: 989, logo: 'Y!', color: '#6001d2', glow: 'rgba(96, 1, 210, 0.15)', progress: 2.8, asn: [10310] },
  { id: 'yandex', name: 'Yandex', url: 'https://yandex.ru', rank: 13, category: 'search', baseline: '2.5B / mo', baselineRaw: 2_500_000_000, rate: 951, logo: 'Yd', color: '#ffcc00', glow: 'rgba(255, 204, 0, 0.15)', progress: 2.7, asn: [13238] },
  { id: 'baidu', name: 'Baidu', url: 'https://baidu.com', rank: 14, category: 'search', baseline: '2.2B / mo', baselineRaw: 2_200_000_000, rate: 837, logo: 'Ba', color: '#2319dc', glow: 'rgba(35, 25, 220, 0.15)', progress: 2.4, asn: [55967] },
  { id: 'bing', name: 'Bing', url: 'https://bing.com', rank: 15, category: 'search', baseline: '2.1B / mo', baselineRaw: 2_100_000_000, rate: 799, logo: 'Bi', color: '#008373', glow: 'rgba(0, 131, 115, 0.15)', progress: 2.3 },
  { id: 'openai', name: 'OpenAI', url: 'https://openai.com', rank: 16, category: 'ai', baseline: '2.0B / mo', baselineRaw: 2_000_000_000, rate: 761, logo: 'Oa', color: '#10a37f', glow: 'rgba(16, 163, 127, 0.15)', progress: 2.2 },
  { id: 'netflix', name: 'Netflix', url: 'https://netflix.com', rank: 17, category: 'entertainment', baseline: '1.9B / mo', baselineRaw: 1_900_000_000, rate: 722, logo: 'N', color: '#e50914', glow: 'rgba(229, 9, 20, 0.15)', progress: 2.1, asn: [2906] },
  { id: 'microsoft', name: 'Microsoft', url: 'https://microsoft.com', rank: 18, category: 'dev', baseline: '1.8B / mo', baselineRaw: 1_800_000_000, rate: 684, logo: 'Ms', color: '#0078d4', glow: 'rgba(0, 120, 212, 0.15)', progress: 1.9, asn: [8075] },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com', rank: 19, category: 'social', baseline: '1.7B / mo', baselineRaw: 1_700_000_000, rate: 646, logo: 'Li', color: '#0a66c2', glow: 'rgba(10, 102, 194, 0.15)', progress: 1.8, asn: [8075] },
  { id: 'office', name: 'Office 365', url: 'https://office.com', rank: 20, category: 'dev', baseline: '1.6B / mo', baselineRaw: 1_600_000_000, rate: 608, logo: 'O3', color: '#eb3c00', glow: 'rgba(235, 60, 0, 0.15)', progress: 1.7, asn: [8075] },
  // ── 21–40 ────────────────────────────────────────────────────────────────
  { id: 'github', name: 'GitHub', url: 'https://github.com', rank: 21, category: 'dev', baseline: '1.4B / mo', baselineRaw: 1_400_000_000, rate: 532, logo: 'GH', color: '#24292f', glow: 'rgba(36, 41, 47, 0.15)', progress: 1.5, asn: [36459] },
  { id: 'twitch', name: 'Twitch', url: 'https://twitch.tv', rank: 22, category: 'entertainment', baseline: '1.2B / mo', baselineRaw: 1_200_000_000, rate: 456, logo: 'Tw', color: '#9146ff', glow: 'rgba(145, 70, 255, 0.15)', progress: 1.3, asn: [46489] },
  { id: 'weather', name: 'Weather', url: 'https://weather.com', rank: 23, category: 'reference', baseline: '1.1B / mo', baselineRaw: 1_100_000_000, rate: 418, logo: 'Wt', color: '#002f6c', glow: 'rgba(0, 47, 108, 0.15)', progress: 1.2, asn: [21859] },
  { id: 'pinterest', name: 'Pinterest', url: 'https://pinterest.com', rank: 24, category: 'social', baseline: '1.0B / mo', baselineRaw: 1_000_000_000, rate: 380, logo: 'Pi', color: '#bd081c', glow: 'rgba(189, 8, 28, 0.15)', progress: 1.1 },
  { id: 'zoom', name: 'Zoom', url: 'https://zoom.us', rank: 26, category: 'dev', baseline: '920M / mo', baselineRaw: 920_000_000, rate: 350, logo: 'Z', color: '#2d8cff', glow: 'rgba(45, 140, 255, 0.15)', progress: 0.99 },
  { id: 'canva', name: 'Canva', url: 'https://canva.com', rank: 27, category: 'dev', baseline: '860M / mo', baselineRaw: 860_000_000, rate: 327, logo: 'Cv', color: '#00c4cc', glow: 'rgba(0, 196, 204, 0.15)', progress: 0.93 },
  { id: 'spotify', name: 'Spotify', url: 'https://spotify.com', rank: 29, category: 'entertainment', baseline: '640M / mo', baselineRaw: 640_000_000, rate: 243, logo: 'Sp', color: '#1db954', glow: 'rgba(29, 185, 84, 0.15)', progress: 0.69 },
  { id: 'quora', name: 'Quora', url: 'https://quora.com', rank: 30, category: 'reference', baseline: '610M / mo', baselineRaw: 610_000_000, rate: 232, logo: 'Q', color: '#b92b27', glow: 'rgba(185, 43, 39, 0.15)', progress: 0.66 },
  { id: 'ebay', name: 'eBay', url: 'https://ebay.com', rank: 31, category: 'ecommerce', baseline: '580M / mo', baselineRaw: 580_000_000, rate: 220, logo: 'eB', color: '#e53238', glow: 'rgba(229, 50, 56, 0.15)', progress: 0.63 },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com', rank: 32, category: 'search', baseline: '560M / mo', baselineRaw: 560_000_000, rate: 213, logo: 'DD', color: '#de5833', glow: 'rgba(222, 88, 51, 0.15)', progress: 0.61 },
  { id: 'roblox', name: 'Roblox', url: 'https://roblox.com', rank: 33, category: 'entertainment', baseline: '545M / mo', baselineRaw: 545_000_000, rate: 207, logo: 'Rx', color: '#888888', glow: 'rgba(255, 255, 255, 0.05)', progress: 0.59 },
  { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com', rank: 34, category: 'dev', baseline: '410M / mo', baselineRaw: 410_000_000, rate: 156, logo: 'SO', color: '#f48024', glow: 'rgba(244, 128, 36, 0.15)', progress: 0.44 },
  { id: 'imgur', name: 'Imgur', url: 'https://imgur.com', rank: 35, category: 'entertainment', baseline: '450M / mo', baselineRaw: 450_000_000, rate: 171, logo: 'Ig', color: '#1bb76e', glow: 'rgba(27, 183, 110, 0.15)', progress: 0.49 },
  { id: 'apple', name: 'Apple', url: 'https://apple.com', rank: 36, category: 'dev', baseline: '520M / mo', baselineRaw: 520_000_000, rate: 197, logo: 'Ap', color: '#a3aaae', glow: 'rgba(163, 170, 174, 0.15)', progress: 0.56 },
  { id: 'naver', name: 'Naver', url: 'https://naver.com', rank: 37, category: 'search', baseline: '400M / mo', baselineRaw: 400_000_000, rate: 152, logo: 'Nv', color: '#03c75a', glow: 'rgba(3, 199, 90, 0.15)', progress: 0.43 },
  { id: 'bilibili', name: 'Bilibili', url: 'https://bilibili.com', rank: 38, category: 'entertainment', baseline: '390M / mo', baselineRaw: 390_000_000, rate: 148, logo: 'Bl', color: '#00a1d6', glow: 'rgba(0, 161, 214, 0.15)', progress: 0.42 },
  { id: 'imdb', name: 'IMDb', url: 'https://imdb.com', rank: 39, category: 'reference', baseline: '370M / mo', baselineRaw: 370_000_000, rate: 141, logo: 'iM', color: '#e6b91e', glow: 'rgba(230, 185, 30, 0.15)', progress: 0.40 },
  { id: 'fandom', name: 'Fandom', url: 'https://fandom.com', rank: 40, category: 'reference', baseline: '360M / mo', baselineRaw: 360_000_000, rate: 137, logo: 'Fd', color: '#00d6d6', glow: 'rgba(0, 214, 214, 0.15)', progress: 0.39 },
  { id: 'aliexpress', name: 'AliExpress', url: 'https://aliexpress.com', rank: 41, category: 'ecommerce', baseline: '340M / mo', baselineRaw: 340_000_000, rate: 129, logo: 'AE', color: '#ff4747', glow: 'rgba(255, 71, 71, 0.15)', progress: 0.37 },
  { id: 'booking', name: 'Booking.com', url: 'https://booking.com', rank: 42, category: 'ecommerce', baseline: '330M / mo', baselineRaw: 330_000_000, rate: 125, logo: 'Bk', color: '#003580', glow: 'rgba(0, 53, 128, 0.15)', progress: 0.36 },
  // ── 41–60 ────────────────────────────────────────────────────────────────
  { id: 'discord', name: 'Discord', url: 'https://discord.com', rank: 43, category: 'social', baseline: '320M / mo', baselineRaw: 320_000_000, rate: 121, logo: 'Dc', color: '#5865f2', glow: 'rgba(88, 101, 242, 0.15)', progress: 0.35 },
  { id: 'telegram', name: 'Telegram', url: 'https://telegram.org', rank: 44, category: 'social', baseline: '300M / mo', baselineRaw: 300_000_000, rate: 114, logo: 'Tg', color: '#229ed9', glow: 'rgba(34, 158, 217, 0.15)', progress: 0.32 },
  { id: 'adobe', name: 'Adobe', url: 'https://adobe.com', rank: 45, category: 'dev', baseline: '310M / mo', baselineRaw: 310_000_000, rate: 118, logo: 'Ad', color: '#ff0000', glow: 'rgba(255, 0, 0, 0.15)', progress: 0.34 },
  { id: 'steam', name: 'Steam', url: 'https://store.steampowered.com', rank: 46, category: 'entertainment', baseline: '305M / mo', baselineRaw: 305_000_000, rate: 116, logo: 'St', color: '#171a21', glow: 'rgba(23, 26, 33, 0.15)', progress: 0.33 },
  { id: 'bbc', name: 'BBC', url: 'https://bbc.co.uk', rank: 47, category: 'news', baseline: '285M / mo', baselineRaw: 285_000_000, rate: 108, logo: 'BB', color: '#ae251f', glow: 'rgba(174, 37, 31, 0.15)', progress: 0.31 },
  { id: 'cnn', name: 'CNN', url: 'https://cnn.com', rank: 48, category: 'news', baseline: '260M / mo', baselineRaw: 260_000_000, rate: 98, logo: 'CN', color: '#cc0000', glow: 'rgba(204, 0, 0, 0.15)', progress: 0.28 },
  { id: 'mailru', name: 'Mail.ru', url: 'https://mail.ru', rank: 49, category: 'news', baseline: '330M / mo', baselineRaw: 330_000_000, rate: 125, logo: 'Mr', color: '#005eff', glow: 'rgba(0, 94, 255, 0.15)', progress: 0.36 },
  { id: 'globo', name: 'Globo', url: 'https://globo.com', rank: 50, category: 'news', baseline: '295M / mo', baselineRaw: 295_000_000, rate: 112, logo: 'Gb', color: '#ff4a4a', glow: 'rgba(255, 74, 74, 0.15)', progress: 0.32 },
  { id: 'nytimes', name: 'NY Times', url: 'https://nytimes.com', rank: 51, category: 'news', baseline: '250M / mo', baselineRaw: 250_000_000, rate: 95, logo: 'NY', color: '#555555', glow: 'rgba(255, 255, 255, 0.05)', progress: 0.27 },
  { id: 'paypal', name: 'PayPal', url: 'https://paypal.com', rank: 52, category: 'finance', baseline: '260M / mo', baselineRaw: 260_000_000, rate: 98, logo: 'PP', color: '#003087', glow: 'rgba(0, 48, 135, 0.15)', progress: 0.28 },
  { id: 'walmart', name: 'Walmart', url: 'https://walmart.com', rank: 53, category: 'ecommerce', baseline: '265M / mo', baselineRaw: 265_000_000, rate: 101, logo: 'Wm', color: '#0071dc', glow: 'rgba(0, 113, 220, 0.15)', progress: 0.29 },
  { id: 'target', name: 'Target', url: 'https://target.com', rank: 54, category: 'ecommerce', baseline: '228M / mo', baselineRaw: 228_000_000, rate: 87, logo: 'Tg', color: '#cc0000', glow: 'rgba(204, 0, 0, 0.15)', progress: 0.25 },
  { id: 'etsy', name: 'Etsy', url: 'https://etsy.com', rank: 55, category: 'ecommerce', baseline: '218M / mo', baselineRaw: 218_000_000, rate: 83, logo: 'Et', color: '#d5641c', glow: 'rgba(213, 100, 28, 0.15)', progress: 0.24 },
  { id: 'medium', name: 'Medium', url: 'https://medium.com', rank: 56, category: 'reference', baseline: '195M / mo', baselineRaw: 195_000_000, rate: 74, logo: 'Md', color: '#333333', glow: 'rgba(255, 255, 255, 0.05)', progress: 0.21 },
  { id: 'espn', name: 'ESPN', url: 'https://espn.com', rank: 57, category: 'entertainment', baseline: '210M / mo', baselineRaw: 210_000_000, rate: 80, logo: 'ES', color: '#ff002b', glow: 'rgba(255, 0, 43, 0.15)', progress: 0.23 },
  { id: 'salesforce', name: 'Salesforce', url: 'https://salesforce.com', rank: 58, category: 'dev', baseline: '198M / mo', baselineRaw: 198_000_000, rate: 75, logo: 'Sf', color: '#00a1e0', glow: 'rgba(0, 161, 224, 0.15)', progress: 0.21 },
  { id: 'vimeo', name: 'Vimeo', url: 'https://vimeo.com', rank: 59, category: 'entertainment', baseline: '178M / mo', baselineRaw: 178_000_000, rate: 68, logo: 'V', color: '#1ab7ea', glow: 'rgba(26, 183, 234, 0.15)', progress: 0.19 },
  { id: 'dropbox', name: 'Dropbox', url: 'https://dropbox.com', rank: 60, category: 'dev', baseline: '172M / mo', baselineRaw: 172_000_000, rate: 65, logo: 'Db', color: '#0061fe', glow: 'rgba(0, 97, 254, 0.15)', progress: 0.19 },
  { id: 'slack', name: 'Slack', url: 'https://slack.com', rank: 61, category: 'dev', baseline: '168M / mo', baselineRaw: 168_000_000, rate: 64, logo: 'Sl', color: '#4a154b', glow: 'rgba(74, 21, 75, 0.15)', progress: 0.18 },
  { id: 'dailymail', name: 'Daily Mail', url: 'https://dailymail.co.uk', rank: 62, category: 'news', baseline: '195M / mo', baselineRaw: 195_000_000, rate: 74, logo: 'DM', color: '#00356b', glow: 'rgba(0, 53, 107, 0.15)', progress: 0.21 },
  // ── 63–80 ────────────────────────────────────────────────────────────────
  { id: 'coinbase', name: 'Coinbase', url: 'https://coinbase.com', rank: 63, category: 'finance', baseline: '175M / mo', baselineRaw: 175_000_000, rate: 67, logo: 'Cb', color: '#0052ff', glow: 'rgba(0, 82, 255, 0.15)', progress: 0.19 },
  { id: 'binance', name: 'Binance', url: 'https://binance.com', rank: 64, category: 'finance', baseline: '158M / mo', baselineRaw: 158_000_000, rate: 60, logo: 'Bn', color: '#f3ba2f', glow: 'rgba(243, 186, 47, 0.15)', progress: 0.17 },
  { id: 'investing', name: 'Investing.com', url: 'https://investing.com', rank: 65, category: 'finance', baseline: '162M / mo', baselineRaw: 162_000_000, rate: 62, logo: 'Iv', color: '#1b4f72', glow: 'rgba(27, 79, 114, 0.15)', progress: 0.18 },
  { id: 'tradingview', name: 'TradingView', url: 'https://tradingview.com', rank: 66, category: 'finance', baseline: '185M / mo', baselineRaw: 185_000_000, rate: 70, logo: 'TV', color: '#131722', glow: 'rgba(19, 23, 34, 0.15)', progress: 0.20 },
  { id: 'bloomberg', name: 'Bloomberg', url: 'https://bloomberg.com', rank: 67, category: 'finance', baseline: '148M / mo', baselineRaw: 148_000_000, rate: 56, logo: 'Bm', color: '#3b5998', glow: 'rgba(59, 89, 152, 0.15)', progress: 0.16 },
  { id: 'claude', name: 'Claude.ai', url: 'https://claude.ai', rank: 25, category: 'ai', baseline: '1.1B / mo', baselineRaw: 1_100_000_000, rate: 418, logo: 'Cl', color: '#d97706', glow: 'rgba(217, 119, 6, 0.15)', progress: 1.2 },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', rank: 28, category: 'ai', baseline: '860M / mo', baselineRaw: 860_000_000, rate: 327, logo: 'Gm', color: '#4a90e2', glow: 'rgba(74, 144, 226, 0.15)', progress: 0.93 },
  { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co', rank: 68, category: 'ai', baseline: '210M / mo', baselineRaw: 210_000_000, rate: 80, logo: 'HF', color: '#ffc72c', glow: 'rgba(255, 199, 44, 0.15)', progress: 0.23 },
  { id: 'midjourney', name: 'Midjourney', url: 'https://midjourney.com', rank: 69, category: 'ai', baseline: '145M / mo', baselineRaw: 145_000_000, rate: 55, logo: 'Mj', color: '#1a1a2e', glow: 'rgba(26, 26, 46, 0.15)', progress: 0.16 },
  { id: 'wikihow', name: 'wikiHow', url: 'https://wikihow.com', rank: 70, category: 'reference', baseline: '122M / mo', baselineRaw: 122_000_000, rate: 46, logo: 'WH', color: '#93b546', glow: 'rgba(147, 181, 70, 0.15)', progress: 0.13 },
  { id: 'merriamwebster', name: 'Merriam-Webster', url: 'https://merriam-webster.com', rank: 71, category: 'reference', baseline: '118M / mo', baselineRaw: 118_000_000, rate: 45, logo: 'MW', color: '#0f4a7c', glow: 'rgba(15, 74, 124, 0.15)', progress: 0.13 },
  { id: 'accuweather', name: 'AccuWeather', url: 'https://accuweather.com', rank: 72, category: 'reference', baseline: '115M / mo', baselineRaw: 115_000_000, rate: 44, logo: 'Aw', color: '#f05023', glow: 'rgba(240, 80, 35, 0.15)', progress: 0.12 },
  { id: 'shopify', name: 'Shopify', url: 'https://shopify.com', rank: 73, category: 'ecommerce', baseline: '128M / mo', baselineRaw: 128_000_000, rate: 49, logo: 'Sh', color: '#96bf48', glow: 'rgba(150, 191, 72, 0.15)', progress: 0.14 },
  { id: 'bestbuy', name: 'Best Buy', url: 'https://bestbuy.com', rank: 74, category: 'ecommerce', baseline: '108M / mo', baselineRaw: 108_000_000, rate: 41, logo: 'BB', color: '#0046be', glow: 'rgba(0, 70, 190, 0.15)', progress: 0.12 },
  { id: 'ikea', name: 'IKEA', url: 'https://ikea.com', rank: 75, category: 'ecommerce', baseline: '112M / mo', baselineRaw: 112_000_000, rate: 43, logo: 'IK', color: '#ffcc00', glow: 'rgba(255, 204, 0, 0.15)', progress: 0.12 },
  { id: 'indeed', name: 'Indeed', url: 'https://indeed.com', rank: 76, category: 'ecommerce', baseline: '118M / mo', baselineRaw: 118_000_000, rate: 45, logo: 'Ic', color: '#2164f3', glow: 'rgba(33, 100, 243, 0.15)', progress: 0.13 },
  { id: 'nike', name: 'Nike', url: 'https://nike.com', rank: 77, category: 'ecommerce', baseline: '104M / mo', baselineRaw: 104_000_000, rate: 40, logo: 'Nk', color: '#111111', glow: 'rgba(255, 255, 255, 0.05)', progress: 0.11 },
  { id: 'craigslist', name: 'Craigslist', url: 'https://craigslist.org', rank: 78, category: 'ecommerce', baseline: '98M / mo', baselineRaw: 98_000_000, rate: 37, logo: 'CL', color: '#551a8b', glow: 'rgba(85, 26, 139, 0.15)', progress: 0.11 },
  { id: 'patreon', name: 'Patreon', url: 'https://patreon.com', rank: 79, category: 'social', baseline: '108M / mo', baselineRaw: 108_000_000, rate: 41, logo: 'Pa', color: '#ff424d', glow: 'rgba(255, 66, 77, 0.15)', progress: 0.12 },
  { id: 'soundcloud', name: 'SoundCloud', url: 'https://soundcloud.com', rank: 80, category: 'entertainment', baseline: '96M / mo', baselineRaw: 96_000_000, rate: 37, logo: 'SC', color: '#ff5500', glow: 'rgba(255, 85, 0, 0.15)', progress: 0.10 },
  // ── 81–100 ───────────────────────────────────────────────────────────────
  { id: 'hulu', name: 'Hulu', url: 'https://hulu.com', rank: 81, category: 'entertainment', baseline: '102M / mo', baselineRaw: 102_000_000, rate: 39, logo: 'Hu', color: '#1ce783', glow: 'rgba(28, 231, 131, 0.15)', progress: 0.11 },
  { id: 'disneyplus', name: 'Disney+', url: 'https://disneyplus.com', rank: 82, category: 'entertainment', baseline: '110M / mo', baselineRaw: 110_000_000, rate: 42, logo: 'D+', color: '#001d3d', glow: 'rgba(0, 29, 61, 0.15)', progress: 0.12 },
  { id: 'max', name: 'Max', url: 'https://max.com', rank: 83, category: 'entertainment', baseline: '94M / mo', baselineRaw: 94_000_000, rate: 36, logo: 'Mx', color: '#002be7', glow: 'rgba(0, 43, 231, 0.15)', progress: 0.10 },
  { id: 'deviantart', name: 'DeviantArt', url: 'https://deviantart.com', rank: 84, category: 'entertainment', baseline: '88M / mo', baselineRaw: 88_000_000, rate: 33, logo: 'DA', color: '#05cc47', glow: 'rgba(5, 204, 71, 0.15)', progress: 0.10 },
  { id: 'ign', name: 'IGN', url: 'https://ign.com', rank: 85, category: 'entertainment', baseline: '90M / mo', baselineRaw: 90_000_000, rate: 34, logo: 'IG', color: '#bf1313', glow: 'rgba(191, 19, 19, 0.15)', progress: 0.10 },
  { id: 'theguardian', name: 'The Guardian', url: 'https://theguardian.com', rank: 86, category: 'news', baseline: '92M / mo', baselineRaw: 92_000_000, rate: 35, logo: 'Gd', color: '#005689', glow: 'rgba(0, 86, 137, 0.15)', progress: 0.10 },
  { id: 'reuters', name: 'Reuters', url: 'https://reuters.com', rank: 87, category: 'news', baseline: '84M / mo', baselineRaw: 84_000_000, rate: 32, logo: 'Rt', color: '#ff8000', glow: 'rgba(255, 128, 0, 0.15)', progress: 0.09 },
  { id: 'forbes', name: 'Forbes', url: 'https://forbes.com', rank: 88, category: 'news', baseline: '82M / mo', baselineRaw: 82_000_000, rate: 31, logo: 'Fb', color: '#00507d', glow: 'rgba(0, 80, 125, 0.15)', progress: 0.09 },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com', rank: 89, category: 'news', baseline: '75M / mo', baselineRaw: 75_000_000, rate: 29, logo: 'TC', color: '#028000', glow: 'rgba(2, 128, 0, 0.15)', progress: 0.08 },
  { id: 'wired', name: 'Wired', url: 'https://wired.com', rank: 90, category: 'news', baseline: '78M / mo', baselineRaw: 78_000_000, rate: 30, logo: 'Wr', color: '#000000', glow: 'rgba(255, 255, 255, 0.05)', progress: 0.08 },
  { id: 'robinhood', name: 'Robinhood', url: 'https://robinhood.com', rank: 91, category: 'finance', baseline: '72M / mo', baselineRaw: 72_000_000, rate: 27, logo: 'Rh', color: '#00c805', glow: 'rgba(0, 200, 5, 0.15)', progress: 0.08 },
  { id: 'stripe', name: 'Stripe', url: 'https://stripe.com', rank: 92, category: 'finance', baseline: '88M / mo', baselineRaw: 88_000_000, rate: 33, logo: 'Sr', color: '#635bff', glow: 'rgba(99, 91, 255, 0.15)', progress: 0.10 },
  { id: 'speedtest', name: 'Speedtest', url: 'https://speedtest.net', rank: 93, category: 'dev', baseline: '112M / mo', baselineRaw: 112_000_000, rate: 43, logo: 'Sz', color: '#141b2b', glow: 'rgba(20, 27, 43, 0.15)', progress: 0.12 },
  { id: 'vercel', name: 'Vercel', url: 'https://vercel.com', rank: 94, category: 'dev', baseline: '80M / mo', baselineRaw: 80_000_000, rate: 30, logo: 'Vc', color: '#000000', glow: 'rgba(255, 255, 255, 0.05)', progress: 0.09 },
  { id: 'netlify', name: 'Netlify', url: 'https://netlify.com', rank: 95, category: 'dev', baseline: '68M / mo', baselineRaw: 68_000_000, rate: 26, logo: 'Nt', color: '#00ad9f', glow: 'rgba(0, 173, 159, 0.15)', progress: 0.07 },
  { id: 'npm', name: 'NPM', url: 'https://npmjs.com', rank: 96, category: 'dev', baseline: '78M / mo', baselineRaw: 78_000_000, rate: 30, logo: 'np', color: '#cb3837', glow: 'rgba(203, 56, 55, 0.15)', progress: 0.08 },
  { id: 'gitlab', name: 'GitLab', url: 'https://gitlab.com', rank: 97, category: 'dev', baseline: '72M / mo', baselineRaw: 72_000_000, rate: 27, logo: 'GL', color: '#fc6d26', glow: 'rgba(252, 109, 38, 0.15)', progress: 0.08 },
  { id: 'docker', name: 'Docker', url: 'https://docker.com', rank: 98, category: 'dev', baseline: '70M / mo', baselineRaw: 70_000_000, rate: 27, logo: 'Dk', color: '#0db7ed', glow: 'rgba(13, 183, 237, 0.15)', progress: 0.08 },
  { id: 'stackexchange', name: 'Stack Exchange', url: 'https://stackexchange.com', rank: 99, category: 'reference', baseline: '62M / mo', baselineRaw: 62_000_000, rate: 24, logo: 'SE', color: '#0072bc', glow: 'rgba(0, 114, 188, 0.15)', progress: 0.07 },
  { id: 'wunderground', name: 'Weather Underground', url: 'https://wunderground.com', rank: 100, category: 'reference', baseline: '58M / mo', baselineRaw: 58_000_000, rate: 22, logo: 'Wu', color: '#1a2b4c', glow: 'rgba(26, 43, 76, 0.15)', progress: 0.06 },
  // ── Extended Top List ──────────────────────────────────────────────────
  { id: 'airbnb', name: 'Airbnb', url: 'https://airbnb.com', rank: 101, category: 'ecommerce', baseline: '155M / mo', baselineRaw: 155_000_000, rate: 59, logo: 'Ab', color: '#ff5a5f', glow: 'rgba(255, 90, 95, 0.15)', progress: 0.17 },
  { id: 'uber', name: 'Uber', url: 'https://uber.com', rank: 102, category: 'ecommerce', baseline: '148M / mo', baselineRaw: 148_000_000, rate: 56, logo: 'Ub', color: '#000000', glow: 'rgba(255, 255, 255, 0.05)', progress: 0.16 },
  { id: 'figma', name: 'Figma', url: 'https://figma.com', rank: 103, category: 'dev', baseline: '152M / mo', baselineRaw: 152_000_000, rate: 58, logo: 'Fg', color: '#f24e1e', glow: 'rgba(242, 78, 30, 0.15)', progress: 0.16 },
];

/**
 * Fast id → static metadata lookup.
 * Used by getSites.ts to merge color/logo/glow/asn onto Supabase DB rows
 * without requiring a full array scan on every request.
 *
 * Only contains fields that are NOT written by the engine
 * (i.e. not rank, baseline, rate, progress — those come from Supabase).
 */
export const SITE_META: Record<string, SiteMeta> = Object.fromEntries(
  SITES.map((s) => [
    s.id,
    {
      id: s.id,
      name: s.name,
      url: s.url,
      category: s.category,
      logo: s.logo,
      color: s.color,
      glow: s.glow,
      asn: s.asn,
    } satisfies SiteMeta,
  ])
);
