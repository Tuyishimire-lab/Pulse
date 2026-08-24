export interface SiteConfig {
  id: string;
  name: string;
  url: string;
  category: string;
  logo: string;
  color: string;
  glow: string;
  rank: number;
  baseline: string;
  baselineRaw: number;
  rate: number;
  progress: number;
  asn?: number[];
  keywords?: string[] | null;
  rank_history?: { rank: number; date: string }[];
  updated_at?: string;
}

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

export const SITES: SiteConfig[] = [
  { id: 'google', name: 'Google', url: 'https://google.com', rank: 1, category: 'search', baseline: '85.0B / mo', baselineRaw: 85000000000, rate: 32787, logo: 'G', color: '#4285F4', glow: 'rgba(136, 136, 136, 0.15)', progress: 100.0 },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com', rank: 2, category: 'entertainment', baseline: '34.8B / mo', baselineRaw: 34800000000, rate: 13242, logo: 'YT', color: '#ef4444', glow: 'rgba(136, 136, 136, 0.15)', progress: 40.9 },
  { id: 'facebook', name: 'Facebook', url: 'https://facebook.com', rank: 3, category: 'social', baseline: '15.2B / mo', baselineRaw: 15200000000, rate: 5783, logo: 'F', color: '#1877F2', glow: 'rgba(136, 136, 136, 0.15)', progress: 17.9 },
  { id: 'instagram', name: 'Instagram', url: 'https://instagram.com', rank: 4, category: 'social', baseline: '6.8B / mo', baselineRaw: 6800000000, rate: 2587, logo: 'In', color: '#E1306C', glow: 'rgba(136, 136, 136, 0.15)', progress: 8.0 },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', rank: 5, category: 'ai', baseline: '5.5B / mo', baselineRaw: 5500000000, rate: 2092, logo: 'Ci', color: '#10a37f', glow: 'rgba(136, 136, 136, 0.15)', progress: 6.5 },
  { id: 'wikipedia', name: 'Wikipedia', url: 'https://wikipedia.com', rank: 6, category: 'reference', baseline: '4.5B / mo', baselineRaw: 4500000000, rate: 1712, logo: 'Wi', color: '#72777D', glow: 'rgba(136, 136, 136, 0.15)', progress: 5.3 },
  { id: 'amazon', name: 'Amazon', url: 'https://amazon.com', rank: 7, category: 'ecommerce', baseline: '4.2B / mo', baselineRaw: 4200000000, rate: 1598, logo: 'Az', color: '#ff9900', glow: 'rgba(136, 136, 136, 0.15)', progress: 4.9 },
  { id: 'x', name: 'X (Twitter)', url: 'https://x.com', rank: 8, category: 'social', baseline: '4.2B / mo', baselineRaw: 4200000000, rate: 1598, logo: 'X', color: '#ffffff', glow: 'rgba(136, 136, 136, 0.15)', progress: 4.9 },
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://whatsapp.com', rank: 9, category: 'social', baseline: '2.9B / mo', baselineRaw: 2900000000, rate: 1103, logo: 'Wa', color: '#25d366', glow: 'rgba(136, 136, 136, 0.15)', progress: 3.4 },
  { id: 'reddit', name: 'Reddit', url: 'https://reddit.com', rank: 10, category: 'social', baseline: '2.8B / mo', baselineRaw: 2800000000, rate: 1065, logo: 'Re', color: '#FF4500', glow: 'rgba(136, 136, 136, 0.15)', progress: 3.3 },
  { id: 'tiktok', name: 'TikTok', url: 'https://tiktok.com', rank: 11, category: 'social', baseline: '2.8B / mo', baselineRaw: 2800000000, rate: 1065, logo: 'Tk', color: '#01f1e2', glow: 'rgba(136, 136, 136, 0.15)', progress: 3.3 },
  { id: 'yahoo', name: 'Yahoo', url: 'https://yahoo.com', rank: 12, category: 'search', baseline: '2.8B / mo', baselineRaw: 2800000000, rate: 1065, logo: 'Y!', color: '#6001d2', glow: 'rgba(136, 136, 136, 0.15)', progress: 3.3 },
  { id: 'yandex', name: 'Yandex', url: 'https://yandex.com', rank: 13, category: 'search', baseline: '2.5B / mo', baselineRaw: 2500000000, rate: 951, logo: 'Yd', color: '#ffcc00', glow: 'rgba(136, 136, 136, 0.15)', progress: 2.9 },
  { id: 'baidu', name: 'Baidu', url: 'https://baidu.com', rank: 14, category: 'search', baseline: '2.2B / mo', baselineRaw: 2200000000, rate: 837, logo: 'Ba', color: '#2319dc', glow: 'rgba(136, 136, 136, 0.15)', progress: 2.6 },
  { id: 'netflix', name: 'Netflix', url: 'https://netflix.com', rank: 15, category: 'entertainment', baseline: '2.1B / mo', baselineRaw: 2100000000, rate: 799, logo: 'N', color: '#e50914', glow: 'rgba(136, 136, 136, 0.15)', progress: 2.5 },
  { id: 'openai', name: 'OpenAI', url: 'https://openai.com', rank: 16, category: 'dev', baseline: '2.0B / mo', baselineRaw: 2000000000, rate: 772, logo: 'Oa', color: '#10a37f', glow: 'rgba(136, 136, 136, 0.15)', progress: 2.4 },
  { id: 'bing', name: 'Bing', url: 'https://bing.com', rank: 17, category: 'search', baseline: '1.8B / mo', baselineRaw: 1800000000, rate: 684, logo: 'Bi', color: '#008373', glow: 'rgba(136, 136, 136, 0.15)', progress: 2.1 },
  { id: 'microsoft', name: 'Microsoft', url: 'https://microsoft.com', rank: 18, category: 'dev', baseline: '1.8B / mo', baselineRaw: 1800000000, rate: 684, logo: 'Ms', color: '#0078d4', glow: 'rgba(136, 136, 136, 0.15)', progress: 2.1 },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com', rank: 19, category: 'social', baseline: '1.8B / mo', baselineRaw: 1750000000, rate: 665, logo: 'Li', color: '#0a66c2', glow: 'rgba(136, 136, 136, 0.15)', progress: 2.1 },
  { id: 'office', name: 'Office 365', url: 'https://office.com', rank: 20, category: 'dev', baseline: '1.6B / mo', baselineRaw: 1600000000, rate: 608, logo: 'O3', color: '#eb3c00', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.9 },
  { id: 'twitch', name: 'Twitch', url: 'https://twitch.com', rank: 21, category: 'entertainment', baseline: '1.1B / mo', baselineRaw: 1150000000, rate: 437, logo: 'Tw', color: '#9146ff', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.4 },
  { id: 'pinterest', name: 'Pinterest', url: 'https://pinterest.com', rank: 22, category: 'social', baseline: '1.1B / mo', baselineRaw: 1100000000, rate: 418, logo: 'Pi', color: '#bd081c', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.3 },
  { id: 'weather', name: 'Weather', url: 'https://weather.com', rank: 23, category: 'reference', baseline: '1.1B / mo', baselineRaw: 1100000000, rate: 418, logo: 'Wt', color: '#002f6c', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.3 },
  { id: 'github', name: 'GitHub', url: 'https://github.com', rank: 24, category: 'dev', baseline: '1.0B / mo', baselineRaw: 1000000000, rate: 380, logo: 'GH', color: '#24292f', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.2 },
  { id: 'zoom', name: 'Zoom', url: 'https://zoom.com', rank: 25, category: 'dev', baseline: '920.0M / mo', baselineRaw: 920000000, rate: 350, logo: 'Z', color: '#2d8cff', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.1 },
  { id: 'ebay', name: 'eBay', url: 'https://ebay.com', rank: 26, category: 'ecommerce', baseline: '900.0M / mo', baselineRaw: 900000000, rate: 342, logo: 'eB', color: '#e53238', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.1 },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.com', rank: 27, category: 'ai', baseline: '860.0M / mo', baselineRaw: 860000000, rate: 327, logo: 'Gm', color: '#4a90e2', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.0 },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com', rank: 28, category: 'search', baseline: '850.0M / mo', baselineRaw: 850000000, rate: 323, logo: 'DD', color: '#de5833', glow: 'rgba(136, 136, 136, 0.15)', progress: 1.0 },
  { id: 'quora', name: 'Quora', url: 'https://quora.com', rank: 29, category: 'reference', baseline: '750.0M / mo', baselineRaw: 750000000, rate: 285, logo: 'Q', color: '#b92b27', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.9 },
  { id: 'telegram', name: 'Telegram', url: 'https://telegram.com', rank: 30, category: 'social', baseline: '750.0M / mo', baselineRaw: 750000000, rate: 285, logo: 'Tg', color: '#229ed9', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.9 },
  { id: 'aliexpress', name: 'AliExpress', url: 'https://aliexpress.com', rank: 31, category: 'ecommerce', baseline: '680.0M / mo', baselineRaw: 680000000, rate: 258, logo: 'AE', color: '#ff4747', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.8 },
  { id: 'canva', name: 'Canva', url: 'https://canva.com', rank: 32, category: 'dev', baseline: '650.0M / mo', baselineRaw: 650000000, rate: 247, logo: 'Cv', color: '#00c4cc', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.8 },
  { id: 'nytimes', name: 'NY Times', url: 'https://nytimes.com', rank: 33, category: 'news', baseline: '650.0M / mo', baselineRaw: 650000000, rate: 247, logo: 'NY', color: '#555555', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.8 },
  { id: 'bbc', name: 'BBC', url: 'https://bbc.com', rank: 34, category: 'news', baseline: '580.0M / mo', baselineRaw: 580000000, rate: 220, logo: 'BB', color: '#ae251f', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.7 },
  { id: 'discord', name: 'Discord', url: 'https://discord.com', rank: 35, category: 'social', baseline: '580.0M / mo', baselineRaw: 580000000, rate: 220, logo: 'Dc', color: '#5865f2', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.7 },
  { id: 'spotify', name: 'Spotify', url: 'https://spotify.com', rank: 36, category: 'entertainment', baseline: '560.0M / mo', baselineRaw: 560000000, rate: 213, logo: 'Sp', color: '#1db954', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.7 },
  { id: 'roblox', name: 'Roblox', url: 'https://roblox.com', rank: 37, category: 'entertainment', baseline: '545.0M / mo', baselineRaw: 545000000, rate: 207, logo: 'Rx', color: '#888888', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.6 },
  { id: 'apple', name: 'Apple', url: 'https://apple.com', rank: 38, category: 'dev', baseline: '520.0M / mo', baselineRaw: 520000000, rate: 197, logo: 'Ap', color: '#a3aaae', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.6 },
  { id: 'booking', name: 'Booking.com', url: 'https://booking.com', rank: 39, category: 'ecommerce', baseline: '520.0M / mo', baselineRaw: 520000000, rate: 197, logo: 'Bk', color: '#003580', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.6 },
  { id: 'cnn', name: 'CNN', url: 'https://cnn.com', rank: 40, category: 'news', baseline: '520.0M / mo', baselineRaw: 520000000, rate: 197, logo: 'CN', color: '#cc0000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.6 },
  { id: 'walmart', name: 'Walmart', url: 'https://walmart.com', rank: 41, category: 'ecommerce', baseline: '510.0M / mo', baselineRaw: 510000000, rate: 194, logo: 'Wm', color: '#0071dc', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.6 },
  { id: 'imgur', name: 'Imgur', url: 'https://imgur.com', rank: 42, category: 'entertainment', baseline: '450.0M / mo', baselineRaw: 450000000, rate: 171, logo: 'Ig', color: '#1bb76e', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.5 },
  { id: 'paypal', name: 'PayPal', url: 'https://paypal.com', rank: 43, category: 'finance', baseline: '440.0M / mo', baselineRaw: 440000000, rate: 167, logo: 'PP', color: '#003087', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.5 },
  { id: 'etsy', name: 'Etsy', url: 'https://etsy.com', rank: 44, category: 'ecommerce', baseline: '420.0M / mo', baselineRaw: 420000000, rate: 159, logo: 'Et', color: '#d5641c', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.5 },
  { id: 'naver', name: 'Naver', url: 'https://naver.com', rank: 45, category: 'search', baseline: '400.0M / mo', baselineRaw: 400000000, rate: 152, logo: 'Nv', color: '#03c75a', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.5 },
  { id: 'bilibili', name: 'Bilibili', url: 'https://bilibili.com', rank: 46, category: 'entertainment', baseline: '390.0M / mo', baselineRaw: 390000000, rate: 148, logo: 'Bl', color: '#00a1d6', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.5 },
  { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com', rank: 47, category: 'dev', baseline: '390.0M / mo', baselineRaw: 390000000, rate: 148, logo: 'SO', color: '#f48024', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.5 },
  { id: 'imdb', name: 'IMDb', url: 'https://imdb.com', rank: 48, category: 'reference', baseline: '370.0M / mo', baselineRaw: 370000000, rate: 140, logo: 'iM', color: '#e6b91e', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'fandom', name: 'Fandom', url: 'https://fandom.com', rank: 49, category: 'reference', baseline: '360.0M / mo', baselineRaw: 360000000, rate: 136, logo: 'Fd', color: '#00d6d6', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'disneyplus', name: 'Disney+', url: 'https://disneyplus.com', rank: 50, category: 'entertainment', baseline: '350.0M / mo', baselineRaw: 350000000, rate: 133, logo: 'D+', color: '#001d3d', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'target', name: 'Target', url: 'https://target.com', rank: 51, category: 'ecommerce', baseline: '340.0M / mo', baselineRaw: 340000000, rate: 129, logo: 'Tg', color: '#cc0000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'theguardian', name: 'The Guardian', url: 'https://theguardian.com', rank: 52, category: 'news', baseline: '340.0M / mo', baselineRaw: 340000000, rate: 129, logo: 'Gd', color: '#005689', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'mailru', name: 'Mail.ru', url: 'https://mailru.com', rank: 53, category: 'news', baseline: '330.0M / mo', baselineRaw: 330000000, rate: 125, logo: 'Mr', color: '#005eff', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'adobe', name: 'Adobe', url: 'https://adobe.com', rank: 54, category: 'dev', baseline: '310.0M / mo', baselineRaw: 310000000, rate: 117, logo: 'Ad', color: '#ff0000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'steam', name: 'Steam', url: 'https://steam.com', rank: 55, category: 'entertainment', baseline: '305.0M / mo', baselineRaw: 305000000, rate: 116, logo: 'St', color: '#171a21', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.4 },
  { id: 'globo', name: 'Globo', url: 'https://globo.com', rank: 56, category: 'news', baseline: '295.0M / mo', baselineRaw: 295000000, rate: 112, logo: 'Gb', color: '#ff4a4a', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.3 },
  { id: 'tradingview', name: 'TradingView', url: 'https://tradingview.com', rank: 57, category: 'finance', baseline: '220.0M / mo', baselineRaw: 220000000, rate: 83, logo: 'TV', color: '#131722', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.3 },
  { id: 'espn', name: 'ESPN', url: 'https://espn.com', rank: 58, category: 'entertainment', baseline: '210.0M / mo', baselineRaw: 210000000, rate: 79, logo: 'ES', color: '#ff002b', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.com', rank: 59, category: 'ai', baseline: '210.0M / mo', baselineRaw: 210000000, rate: 79, logo: 'HF', color: '#ffc72c', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'salesforce', name: 'Salesforce', url: 'https://salesforce.com', rank: 60, category: 'dev', baseline: '198.0M / mo', baselineRaw: 198000000, rate: 75, logo: 'Sf', color: '#00a1e0', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'dailymail', name: 'Daily Mail', url: 'https://dailymail.com', rank: 61, category: 'news', baseline: '195.0M / mo', baselineRaw: 195000000, rate: 74, logo: 'DM', color: '#00356b', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'medium', name: 'Medium', url: 'https://medium.com', rank: 62, category: 'reference', baseline: '180.0M / mo', baselineRaw: 180000000, rate: 68, logo: 'Md', color: '#333333', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'vimeo', name: 'Vimeo', url: 'https://vimeo.com', rank: 63, category: 'entertainment', baseline: '178.0M / mo', baselineRaw: 178000000, rate: 67, logo: 'V', color: '#1ab7ea', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'dropbox', name: 'Dropbox', url: 'https://dropbox.com', rank: 64, category: 'dev', baseline: '172.0M / mo', baselineRaw: 172000000, rate: 65, logo: 'Db', color: '#0061fe', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'slack', name: 'Slack', url: 'https://slack.com', rank: 65, category: 'dev', baseline: '168.0M / mo', baselineRaw: 168000000, rate: 63, logo: 'Sl', color: '#4a154b', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'investing', name: 'Investing.com', url: 'https://investing.com', rank: 66, category: 'finance', baseline: '162.0M / mo', baselineRaw: 162000000, rate: 61, logo: 'Iv', color: '#1b4f72', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'binance', name: 'Binance', url: 'https://binance.com', rank: 67, category: 'finance', baseline: '160.0M / mo', baselineRaw: 160000000, rate: 60, logo: 'Bn', color: '#f3ba2f', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'airbnb', name: 'Airbnb', url: 'https://airbnb.com', rank: 68, category: 'ecommerce', baseline: '155.0M / mo', baselineRaw: 155000000, rate: 58, logo: 'Ab', color: '#ff5a5f', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'figma', name: 'Figma', url: 'https://figma.com', rank: 69, category: 'dev', baseline: '152.0M / mo', baselineRaw: 152000000, rate: 57, logo: 'Fg', color: '#f24e1e', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'bloomberg', name: 'Bloomberg', url: 'https://bloomberg.com', rank: 70, category: 'finance', baseline: '148.0M / mo', baselineRaw: 148000000, rate: 56, logo: 'Bm', color: '#3b5998', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'uber', name: 'Uber', url: 'https://uber.com', rank: 71, category: 'ecommerce', baseline: '148.0M / mo', baselineRaw: 148000000, rate: 56, logo: 'Ub', color: '#000000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'coinbase', name: 'Coinbase', url: 'https://coinbase.com', rank: 72, category: 'finance', baseline: '145.0M / mo', baselineRaw: 145000000, rate: 55, logo: 'Cb', color: '#0052ff', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'midjourney', name: 'Midjourney', url: 'https://midjourney.com', rank: 73, category: 'ai', baseline: '145.0M / mo', baselineRaw: 145000000, rate: 55, logo: 'Mj', color: '#1a1a2e', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'claude', name: 'Claude.ai', url: 'https://claude.com', rank: 74, category: 'ai', baseline: '135.0M / mo', baselineRaw: 135000000, rate: 51, logo: 'Cl', color: '#d97706', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.2 },
  { id: 'wikihow', name: 'wikiHow', url: 'https://wikihow.com', rank: 75, category: 'reference', baseline: '122.0M / mo', baselineRaw: 122000000, rate: 46, logo: 'WH', color: '#93b546', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'shopify', name: 'Shopify', url: 'https://shopify.com', rank: 76, category: 'ecommerce', baseline: '120.0M / mo', baselineRaw: 120000000, rate: 45, logo: 'Sh', color: '#96bf48', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'indeed', name: 'Indeed', url: 'https://indeed.com', rank: 77, category: 'ecommerce', baseline: '118.0M / mo', baselineRaw: 118000000, rate: 44, logo: 'Ic', color: '#2164f3', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'merriamwebster', name: 'Merriam-Webster', url: 'https://merriamwebster.com', rank: 78, category: 'reference', baseline: '118.0M / mo', baselineRaw: 118000000, rate: 44, logo: 'MW', color: '#0f4a7c', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'accuweather', name: 'AccuWeather', url: 'https://accuweather.com', rank: 79, category: 'reference', baseline: '115.0M / mo', baselineRaw: 115000000, rate: 43, logo: 'Aw', color: '#f05023', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'ikea', name: 'IKEA', url: 'https://ikea.com', rank: 80, category: 'ecommerce', baseline: '112.0M / mo', baselineRaw: 112000000, rate: 42, logo: 'IK', color: '#ffcc00', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'speedtest', name: 'Speedtest', url: 'https://speedtest.com', rank: 81, category: 'dev', baseline: '112.0M / mo', baselineRaw: 112000000, rate: 42, logo: 'Sz', color: '#141b2b', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'bestbuy', name: 'Best Buy', url: 'https://bestbuy.com', rank: 82, category: 'ecommerce', baseline: '108.0M / mo', baselineRaw: 108000000, rate: 41, logo: 'BB', color: '#0046be', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'patreon', name: 'Patreon', url: 'https://patreon.com', rank: 83, category: 'social', baseline: '108.0M / mo', baselineRaw: 108000000, rate: 41, logo: 'Pa', color: '#ff424d', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'nike', name: 'Nike', url: 'https://nike.com', rank: 84, category: 'ecommerce', baseline: '104.0M / mo', baselineRaw: 104000000, rate: 39, logo: 'Nk', color: '#111111', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'hulu', name: 'Hulu', url: 'https://hulu.com', rank: 85, category: 'entertainment', baseline: '102.0M / mo', baselineRaw: 102000000, rate: 38, logo: 'Hu', color: '#1ce783', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'craigslist', name: 'Craigslist', url: 'https://craigslist.com', rank: 86, category: 'ecommerce', baseline: '98.0M / mo', baselineRaw: 98000000, rate: 37, logo: 'CL', color: '#551a8b', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'soundcloud', name: 'SoundCloud', url: 'https://soundcloud.com', rank: 87, category: 'entertainment', baseline: '96.0M / mo', baselineRaw: 96000000, rate: 36, logo: 'SC', color: '#ff5500', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'max', name: 'Max', url: 'https://max.com', rank: 88, category: 'entertainment', baseline: '94.0M / mo', baselineRaw: 94000000, rate: 35, logo: 'Mx', color: '#002be7', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'ign', name: 'IGN', url: 'https://ign.com', rank: 89, category: 'entertainment', baseline: '90.0M / mo', baselineRaw: 90000000, rate: 34, logo: 'IG', color: '#bf1313', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'deviantart', name: 'DeviantArt', url: 'https://deviantart.com', rank: 90, category: 'entertainment', baseline: '88.0M / mo', baselineRaw: 88000000, rate: 33, logo: 'DA', color: '#05cc47', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'reuters', name: 'Reuters', url: 'https://reuters.com', rank: 91, category: 'news', baseline: '84.0M / mo', baselineRaw: 84000000, rate: 31, logo: 'Rt', color: '#ff8000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'forbes', name: 'Forbes', url: 'https://forbes.com', rank: 92, category: 'news', baseline: '82.0M / mo', baselineRaw: 82000000, rate: 31, logo: 'Fb', color: '#00507d', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'npm', name: 'NPM', url: 'https://npm.com', rank: 93, category: 'dev', baseline: '80.0M / mo', baselineRaw: 80000000, rate: 30, logo: 'np', color: '#cb3837', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'vercel', name: 'Vercel', url: 'https://vercel.com', rank: 94, category: 'dev', baseline: '80.0M / mo', baselineRaw: 80000000, rate: 30, logo: 'Vc', color: '#000000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'wired', name: 'Wired', url: 'https://wired.com', rank: 95, category: 'news', baseline: '78.0M / mo', baselineRaw: 78000000, rate: 29, logo: 'Wr', color: '#000000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com', rank: 96, category: 'news', baseline: '75.0M / mo', baselineRaw: 75000000, rate: 28, logo: 'TC', color: '#028000', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'gitlab', name: 'GitLab', url: 'https://gitlab.com', rank: 97, category: 'dev', baseline: '72.0M / mo', baselineRaw: 72000000, rate: 27, logo: 'GL', color: '#fc6d26', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'robinhood', name: 'Robinhood', url: 'https://robinhood.com', rank: 98, category: 'finance', baseline: '72.0M / mo', baselineRaw: 72000000, rate: 27, logo: 'Rh', color: '#00c805', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'docker', name: 'Docker', url: 'https://docker.com', rank: 99, category: 'dev', baseline: '70.0M / mo', baselineRaw: 70000000, rate: 26, logo: 'Dk', color: '#0db7ed', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'netlify', name: 'Netlify', url: 'https://netlify.com', rank: 100, category: 'dev', baseline: '68.0M / mo', baselineRaw: 68000000, rate: 25, logo: 'Nt', color: '#00ad9f', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'stackexchange', name: 'Stack Exchange', url: 'https://stackexchange.com', rank: 101, category: 'reference', baseline: '62.0M / mo', baselineRaw: 62000000, rate: 23, logo: 'SE', color: '#0072bc', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'stripe', name: 'Stripe', url: 'https://stripe.com', rank: 102, category: 'finance', baseline: '62.0M / mo', baselineRaw: 62000000, rate: 23, logo: 'Sr', color: '#635bff', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
  { id: 'wunderground', name: 'Weather Underground', url: 'https://wunderground.com', rank: 103, category: 'reference', baseline: '58.0M / mo', baselineRaw: 58000000, rate: 22, logo: 'Wu', color: '#1a2b4c', glow: 'rgba(136, 136, 136, 0.15)', progress: 0.1 },
];

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
    },
  ]),
);

/**
 * Authoritative catalog size — always equals SITES.length.
 * Import this everywhere a count is needed in UI copy or metadata
 * instead of hardcoding "100" or "103". Updates automatically when
 * sites are added or removed from the catalog.
 */
export const SITE_COUNT = SITES.length;
