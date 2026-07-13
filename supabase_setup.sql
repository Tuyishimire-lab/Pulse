-- Setup Tables
CREATE TABLE IF NOT EXISTS public.sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  rank INTEGER NOT NULL,
  category TEXT NOT NULL,
  baseline TEXT NOT NULL,
  rate INTEGER NOT NULL,
  color TEXT NOT NULL,
  glow TEXT NOT NULL,
  progress NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS public.traffic_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id TEXT REFERENCES public.sites(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  visits_percentage NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS public.traffic_daily_aggregation (
  site_id TEXT REFERENCES public.sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_visits_percentage NUMERIC NOT NULL,
  max_visits_percentage NUMERIC NOT NULL,
  min_visits_percentage NUMERIC NOT NULL,
  record_count INTEGER DEFAULT 1,
  PRIMARY KEY (site_id, date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_daily_aggregation ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access (Essential so frontend clients can fetch data)
CREATE POLICY "Allow public read access to sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Allow public read access to traffic_history" ON public.traffic_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access to traffic_daily_aggregation" ON public.traffic_daily_aggregation FOR SELECT USING (true);

-- Sync trigger function to update dynamic daily metrics
CREATE OR REPLACE FUNCTION public.sync_traffic_daily_aggregation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.traffic_daily_aggregation (site_id, date, avg_visits_percentage, max_visits_percentage, min_visits_percentage, record_count)
  VALUES (
    NEW.site_id,
    NEW.timestamp::DATE,
    NEW.visits_percentage,
    NEW.visits_percentage,
    NEW.visits_percentage,
    1
  )
  ON CONFLICT (site_id, date) DO UPDATE SET
    avg_visits_percentage = ROUND((traffic_daily_aggregation.avg_visits_percentage * traffic_daily_aggregation.record_count + EXCLUDED.avg_visits_percentage) / (traffic_daily_aggregation.record_count + 1), 2),
    max_visits_percentage = GREATEST(traffic_daily_aggregation.max_visits_percentage, EXCLUDED.max_visits_percentage),
    min_visits_percentage = LEAST(traffic_daily_aggregation.min_visits_percentage, EXCLUDED.min_visits_percentage),
    record_count = traffic_daily_aggregation.record_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger definition
CREATE OR REPLACE TRIGGER trigger_sync_traffic_daily_aggregation
AFTER INSERT ON public.traffic_history
FOR EACH ROW
EXECUTE FUNCTION public.sync_traffic_daily_aggregation();

-- Seed aggregations from existing traffic_history data if any
INSERT INTO public.traffic_daily_aggregation (site_id, date, avg_visits_percentage, max_visits_percentage, min_visits_percentage, record_count)
SELECT 
  site_id, 
  timestamp::DATE as date, 
  ROUND(AVG(visits_percentage), 2) as avg_visits_percentage,
  MAX(visits_percentage) as max_visits_percentage,
  MIN(visits_percentage) as min_visits_percentage,
  COUNT(*) as record_count
FROM public.traffic_history
GROUP BY site_id, timestamp::DATE
ON CONFLICT (site_id, date) DO NOTHING;

-- Clear existing data
TRUNCATE TABLE public.sites CASCADE;

-- Insert Seed Data
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('google', 'Google', 'https://google.com', 1, 'search', '85.2B / mo', 32382, '#4285F4', 'rgba(66, 133, 244, 0.15)', 100);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('youtube', 'YouTube', 'https://youtube.com', 2, 'entertainment', '32.7B / mo', 12442, '#ef4444', 'rgba(239, 68, 68, 0.15)', 38.38);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('facebook', 'Facebook', 'https://facebook.com', 3, 'social', '16.3B / mo', 6198, '#1877F2', 'rgba(24, 119, 242, 0.15)', 19.13);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('wikipedia', 'Wikipedia', 'https://wikipedia.org', 4, 'reference', '4.3B / mo', 1636, '#72777D', 'rgba(114, 119, 125, 0.15)', 5.05);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('instagram', 'Instagram', 'https://instagram.com', 5, 'social', '7.1B / mo', 2701, '#E1306C', 'rgba(225, 48, 108, 0.15)', 8.33);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('chatgpt', 'ChatGPT', 'https://chatgpt.com', 6, 'ai', '3.7B / mo', 1407, '#10a37f', 'rgba(16, 163, 127, 0.15)', 4.34);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('reddit', 'Reddit', 'https://reddit.com', 7, 'social', '3.4B / mo', 1293, '#FF4500', 'rgba(255, 69, 0, 0.15)', 3.99);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('x', 'X (Twitter)', 'https://x.com', 8, 'social', '3.2B / mo', 1217, '#ffffff', 'rgba(255, 255, 255, 0.1)', 3.76);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('yahoo', 'Yahoo', 'https://yahoo.com', 9, 'search', '3.1B / mo', 1178, '#6001d2', 'rgba(96, 1, 210, 0.15)', 3.64);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('amazon', 'Amazon', 'https://amazon.com', 10, 'ecommerce', '2.9B / mo', 1102, '#ff9900', 'rgba(255, 153, 0, 0.15)', 3.4);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('yandex', 'Yandex', 'https://yandex.ru', 11, 'search', '2.8B / mo', 1064, '#ffcc00', 'rgba(255, 204, 0, 0.15)', 3.29);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('baidu', 'Baidu', 'https://baidu.com', 12, 'search', '2.5B / mo', 950, '#2319dc', 'rgba(35, 25, 220, 0.15)', 2.93);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('tiktok', 'TikTok', 'https://tiktok.com', 13, 'social', '2.1B / mo', 798, '#01f1e2', 'rgba(1, 241, 226, 0.15)', 2.46);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('netflix', 'Netflix', 'https://netflix.com', 14, 'entertainment', '1.9B / mo', 722, '#e50914', 'rgba(229, 9, 20, 0.15)', 2.23);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('microsoft', 'Microsoft', 'https://microsoft.com', 15, 'dev', '1.8B / mo', 684, '#0078d4', 'rgba(0, 120, 212, 0.15)', 2.11);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('office', 'Office', 'https://office.com', 16, 'dev', '1.6B / mo', 608, '#eb3c00', 'rgba(235, 60, 0, 0.15)', 1.88);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('linkedin', 'LinkedIn', 'https://linkedin.com', 17, 'social', '1.5B / mo', 570, '#0a66c2', 'rgba(10, 102, 194, 0.15)', 1.76);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('weather', 'Weather', 'https://weather.com', 18, 'reference', '1.2B / mo', 456, '#002f6c', 'rgba(0, 47, 108, 0.15)', 1.41);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('twitch', 'Twitch', 'https://twitch.tv', 19, 'entertainment', '1.1B / mo', 418, '#9146ff', 'rgba(145, 70, 255, 0.15)', 1.29);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('github', 'GitHub', 'https://github.com', 20, 'dev', '1.0B / mo', 380, '#24292f', 'rgba(36, 41, 47, 0.15)', 1.17);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('zoom', 'Zoom', 'https://zoom.us', 21, 'dev', '900M / mo', 342, '#2d8cff', 'rgba(45, 140, 255, 0.15)', 1.06);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('ebay', 'eBay', 'https://ebay.com', 22, 'ecommerce', '800M / mo', 304, '#e53238', 'rgba(229, 50, 56, 0.15)', 0.94);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('pinterest', 'Pinterest', 'https://pinterest.com', 23, 'social', '800M / mo', 304, '#bd081c', 'rgba(189, 8, 28, 0.15)', 0.94);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('quora', 'Quora', 'https://quora.com', 24, 'reference', '700M / mo', 266, '#b92b27', 'rgba(185, 43, 39, 0.15)', 0.82);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('canva', 'Canva', 'https://canva.com', 25, 'dev', '600M / mo', 228, '#00c4cc', 'rgba(0, 196, 204, 0.15)', 0.7);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('duckduckgo', 'DuckDuckGo', 'https://duckduckgo.com', 26, 'search', '600M / mo', 228, '#de5833', 'rgba(222, 88, 51, 0.15)', 0.7);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('imgur', 'Imgur', 'https://imgur.com', 27, 'entertainment', '500M / mo', 190, '#1bb76e', 'rgba(27, 183, 110, 0.15)', 0.59);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('spotify', 'Spotify', 'https://spotify.com', 28, 'entertainment', '500M / mo', 190, '#1db954', 'rgba(29, 185, 84, 0.15)', 0.59);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('roblox', 'Roblox', 'https://roblox.com', 29, 'entertainment', '500M / mo', 190, '#888888', 'rgba(255, 255, 255, 0.05)', 0.59);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('stackoverflow', 'Stack Overflow', 'https://stackoverflow.com', 30, 'dev', '400M / mo', 152, '#f48024', 'rgba(244, 128, 36, 0.15)', 0.47);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('apple', 'Apple', 'https://apple.com', 31, 'dev', '400M / mo', 152, '#a3aaae', 'rgba(163, 170, 174, 0.15)', 0.47);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('fandom', 'Fandom', 'https://fandom.com', 32, 'reference', '380M / mo', 144, '#00d6d6', 'rgba(0, 214, 214, 0.15)', 0.45);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('mailru', 'Mail.ru', 'https://mail.ru', 33, 'news', '370M / mo', 140, '#005eff', 'rgba(0, 94, 255, 0.15)', 0.43);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('naver', 'Naver', 'https://naver.com', 34, 'search', '360M / mo', 137, '#03c75a', 'rgba(3, 199, 90, 0.15)', 0.42);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('bilibili', 'Bilibili', 'https://bilibili.com', 35, 'entertainment', '350M / mo', 133, '#00a1d6', 'rgba(0, 161, 214, 0.15)', 0.41);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('imdb', 'IMDb', 'https://imdb.com', 36, 'reference', '340M / mo', 129, '#e6b91e', 'rgba(230, 185, 30, 0.15)', 0.4);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('aliexpress', 'AliExpress', 'https://aliexpress.com', 37, 'ecommerce', '330M / mo', 125, '#ff4747', 'rgba(255, 71, 71, 0.15)', 0.39);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('booking', 'Booking.com', 'https://booking.com', 38, 'ecommerce', '320M / mo', 121, '#003580', 'rgba(0, 53, 128, 0.15)', 0.38);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('globo', 'Globo', 'https://globo.com', 39, 'news', '310M / mo', 118, '#ff4a4a', 'rgba(255, 74, 74, 0.15)', 0.36);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('whatsapp', 'WhatsApp', 'https://whatsapp.com', 40, 'social', '300M / mo', 114, '#25d366', 'rgba(37, 211, 102, 0.15)', 0.35);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('adobe', 'Adobe', 'https://adobe.com', 41, 'dev', '290M / mo', 110, '#ff0000', 'rgba(255, 0, 0, 0.15)', 0.34);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('steam', 'Steam', 'https://store.steampowered.com', 42, 'entertainment', '280M / mo', 106, '#171a21', 'rgba(23, 26, 33, 0.15)', 0.33);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('bbc', 'BBC', 'https://bbc.co.uk', 43, 'news', '270M / mo', 102, '#ae251f', 'rgba(174, 37, 31, 0.15)', 0.32);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('cnn', 'CNN', 'https://cnn.com', 44, 'news', '260M / mo', 99, '#cc0000', 'rgba(204, 0, 0, 0.15)', 0.31);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('nytimes', 'NY Times', 'https://nytimes.com', 45, 'news', '250M / mo', 95, '#555555', 'rgba(255, 255, 255, 0.05)', 0.29);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('paypal', 'PayPal', 'https://paypal.com', 46, 'finance', '240M / mo', 91, '#003087', 'rgba(0, 48, 135, 0.15)', 0.28);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('target', 'Target', 'https://target.com', 47, 'ecommerce', '230M / mo', 87, '#cc0000', 'rgba(204, 0, 0, 0.15)', 0.27);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('walmart', 'Walmart', 'https://walmart.com', 48, 'ecommerce', '225M / mo', 85, '#0071dc', 'rgba(0, 113, 220, 0.15)', 0.26);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('etsy', 'Etsy', 'https://etsy.com', 49, 'ecommerce', '220M / mo', 83, '#d5641c', 'rgba(213, 100, 28, 0.15)', 0.26);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('discord', 'Discord', 'https://discord.com', 50, 'social', '215M / mo', 81, '#5865f2', 'rgba(88, 101, 242, 0.15)', 0.25);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('telegram', 'Telegram', 'https://telegram.org', 51, 'social', '210M / mo', 80, '#229ed9', 'rgba(34, 158, 217, 0.15)', 0.25);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('dailymail', 'Daily Mail', 'https://dailymail.co.uk', 52, 'news', '205M / mo', 78, '#00356b', 'rgba(0, 53, 107, 0.15)', 0.24);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('espn', 'ESPN', 'https://espn.com', 53, 'entertainment', '200M / mo', 76, '#ff002b', 'rgba(255, 0, 43, 0.15)', 0.23);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('medium', 'Medium', 'https://medium.com', 54, 'reference', '195M / mo', 74, '#333333', 'rgba(255, 255, 255, 0.05)', 0.23);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('salesforce', 'Salesforce', 'https://salesforce.com', 55, 'dev', '190M / mo', 72, '#00a1e0', 'rgba(0, 161, 224, 0.15)', 0.22);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('vimeo', 'Vimeo', 'https://vimeo.com', 56, 'entertainment', '185M / mo', 70, '#1ab7ea', 'rgba(26, 183, 234, 0.15)', 0.22);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('dropbox', 'Dropbox', 'https://dropbox.com', 57, 'dev', '180M / mo', 68, '#0061fe', 'rgba(0, 97, 254, 0.15)', 0.21);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('slack', 'Slack', 'https://slack.com', 58, 'dev', '175M / mo', 66, '#4a154b', 'rgba(74, 21, 75, 0.15)', 0.21);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('coinbase', 'Coinbase', 'https://coinbase.com', 59, 'finance', '170M / mo', 64, '#0052ff', 'rgba(0, 82, 255, 0.15)', 0.2);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('binance', 'Binance', 'https://binance.com', 60, 'finance', '165M / mo', 62, '#f3ba2f', 'rgba(243, 186, 47, 0.15)', 0.19);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('investing', 'Investing.com', 'https://investing.com', 61, 'finance', '160M / mo', 60, '#1b4f72', 'rgba(27, 79, 114, 0.15)', 0.19);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('bloomberg', 'Bloomberg', 'https://bloomberg.com', 62, 'finance', '155M / mo', 59, '#3b5998', 'rgba(59, 89, 152, 0.15)', 0.18);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('tradingview', 'TradingView', 'https://tradingview.com', 63, 'finance', '150M / mo', 57, '#131722', 'rgba(19, 23, 34, 0.15)', 0.18);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('claude', 'Claude.ai', 'https://claude.ai', 64, 'ai', '145M / mo', 55, '#d97706', 'rgba(217, 119, 6, 0.15)', 0.17);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('gemini', 'Gemini', 'https://gemini.google.com', 65, 'ai', '140M / mo', 53, '#4a90e2', 'rgba(74, 144, 226, 0.15)', 0.16);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('huggingface', 'Hugging Face', 'https://huggingface.co', 66, 'ai', '135M / mo', 51, '#ffc72c', 'rgba(255, 199, 44, 0.15)', 0.16);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('midjourney', 'Midjourney', 'https://midjourney.com', 67, 'ai', '130M / mo', 49, '#1a1a2e', 'rgba(26, 26, 46, 0.15)', 0.15);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('wikihow', 'wikiHow', 'https://wikihow.com', 68, 'reference', '125M / mo', 47, '#93b546', 'rgba(147, 181, 70, 0.15)', 0.15);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('merriamwebster', 'Merriam-Webster', 'https://merriam-webster.com', 69, 'reference', '120M / mo', 45, '#0f4a7c', 'rgba(15, 74, 124, 0.15)', 0.14);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('accuweather', 'AccuWeather', 'https://accuweather.com', 70, 'reference', '118M / mo', 44, '#f05023', 'rgba(240, 80, 35, 0.15)', 0.14);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('speedtest', 'Speedtest', 'https://speedtest.net', 71, 'dev', '115M / mo', 43, '#141b2b', 'rgba(20, 27, 43, 0.15)', 0.13);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('shopify', 'Shopify', 'https://shopify.com', 72, 'ecommerce', '112M / mo', 42, '#96bf48', 'rgba(150, 191, 72, 0.15)', 0.13);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('bestbuy', 'Best Buy', 'https://bestbuy.com', 73, 'ecommerce', '110M / mo', 41, '#0046be', 'rgba(0, 70, 190, 0.15)', 0.13);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('ikea', 'IKEA', 'https://ikea.com', 74, 'ecommerce', '108M / mo', 41, '#ffcc00', 'rgba(255, 204, 0, 0.15)', 0.13);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('nike', 'Nike', 'https://nike.com', 75, 'ecommerce', '106M / mo', 40, '#111111', 'rgba(255, 255, 255, 0.05)', 0.12);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('craigslist', 'Craigslist', 'https://craigslist.org', 76, 'ecommerce', '104M / mo', 39, '#551a8b', 'rgba(85, 26, 139, 0.15)', 0.12);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('patreon', 'Patreon', 'https://patreon.com', 77, 'social', '102M / mo', 38, '#ff424d', 'rgba(255, 66, 77, 0.15)', 0.12);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('soundcloud', 'SoundCloud', 'https://soundcloud.com', 78, 'entertainment', '100M / mo', 38, '#ff5500', 'rgba(255, 85, 0, 0.15)', 0.12);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('hulu', 'Hulu', 'https://hulu.com', 79, 'entertainment', '98M / mo', 37, '#1ce783', 'rgba(28, 231, 131, 0.15)', 0.11);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('disneyplus', 'Disney+', 'https://disneyplus.com', 80, 'entertainment', '96M / mo', 36, '#001d3d', 'rgba(0, 29, 61, 0.15)', 0.11);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('max', 'Max', 'https://max.com', 81, 'entertainment', '94M / mo', 35, '#002be7', 'rgba(0, 43, 231, 0.15)', 0.11);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('deviantart', 'DeviantArt', 'https://deviantart.com', 82, 'entertainment', '92M / mo', 35, '#05cc47', 'rgba(5, 204, 71, 0.15)', 0.11);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('ign', 'IGN', 'https://ign.com', 83, 'entertainment', '90M / mo', 34, '#bf1313', 'rgba(191, 19, 19, 0.15)', 0.11);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('theguardian', 'The Guardian', 'https://theguardian.com', 84, 'news', '88M / mo', 33, '#005689', 'rgba(0, 86, 137, 0.15)', 0.1);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('reuters', 'Reuters', 'https://reuters.com', 85, 'news', '86M / mo', 32, '#ff8000', 'rgba(255, 128, 0, 0.15)', 0.1);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('forbes', 'Forbes', 'https://forbes.com', 86, 'news', '84M / mo', 32, '#00507d', 'rgba(0, 80, 125, 0.15)', 0.1);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('techcrunch', 'TechCrunch', 'https://techcrunch.com', 87, 'news', '82M / mo', 31, '#028000', 'rgba(2, 128, 0, 0.15)', 0.1);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('wired', 'Wired', 'https://wired.com', 88, 'news', '80M / mo', 30, '#000000', 'rgba(255, 255, 255, 0.05)', 0.09);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('robinhood', 'Robinhood', 'https://robinhood.com', 89, 'finance', '78M / mo', 29, '#00c805', 'rgba(0, 200, 5, 0.15)', 0.09);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('stripe', 'Stripe', 'https://stripe.com', 90, 'finance', '76M / mo', 28, '#635bff', 'rgba(99, 91, 255, 0.15)', 0.09);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('vercel', 'Vercel', 'https://vercel.com', 91, 'dev', '74M / mo', 28, '#000000', 'rgba(255, 255, 255, 0.05)', 0.09);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('netlify', 'Netlify', 'https://netlify.com', 92, 'dev', '72M / mo', 27, '#00ad9f', 'rgba(0, 173, 159, 0.15)', 0.08);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('npm', 'NPM', 'https://npmjs.com', 93, 'dev', '70M / mo', 26, '#cb3837', 'rgba(203, 56, 55, 0.15)', 0.08);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('gitlab', 'GitLab', 'https://gitlab.com', 94, 'dev', '68M / mo', 25, '#fc6d26', 'rgba(252, 109, 38, 0.15)', 0.08);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('docker', 'Docker', 'https://docker.com', 95, 'dev', '66M / mo', 25, '#0db7ed', 'rgba(13, 183, 237, 0.15)', 0.08);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('stackexchange', 'Stack Exchange', 'https://stackexchange.com', 96, 'reference', '64M / mo', 24, '#0072bc', 'rgba(0, 114, 188, 0.15)', 0.08);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('wunderground', 'Weather Underground', 'https://wunderground.com', 97, 'reference', '62M / mo', 23, '#1a2b4c', 'rgba(26, 43, 76, 0.15)', 0.07);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('airbnb', 'Airbnb', 'https://airbnb.com', 98, 'ecommerce', '148M / mo', 56, '#ff5a5f', 'rgba(255, 90, 95, 0.15)', 0.17);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('uber', 'Uber', 'https://uber.com', 99, 'ecommerce', '142M / mo', 54, '#000000', 'rgba(255, 255, 255, 0.05)', 0.17);
INSERT INTO public.sites (id, name, url, rank, category, baseline, rate, color, glow, progress) VALUES ('figma', 'Figma', 'https://figma.com', 100, 'dev', '138M / mo', 52, '#f24e1e', 'rgba(242, 78, 30, 0.15)', 0.16);

-- Seed Traffic History (last 24 hours mock data)
INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'google',
      NOW() - INTERVAL '24 hours',
      80
    ),
(
      'google',
      NOW() - INTERVAL '23 hours',
      85
    ),
(
      'google',
      NOW() - INTERVAL '22 hours',
      89
    ),
(
      'google',
      NOW() - INTERVAL '21 hours',
      93
    ),
(
      'google',
      NOW() - INTERVAL '20 hours',
      95
    ),
(
      'google',
      NOW() - INTERVAL '19 hours',
      95
    ),
(
      'google',
      NOW() - INTERVAL '18 hours',
      94
    ),
(
      'google',
      NOW() - INTERVAL '17 hours',
      91
    ),
(
      'google',
      NOW() - INTERVAL '16 hours',
      87
    ),
(
      'google',
      NOW() - INTERVAL '15 hours',
      82
    ),
(
      'google',
      NOW() - INTERVAL '14 hours',
      77
    ),
(
      'google',
      NOW() - INTERVAL '13 hours',
      72
    ),
(
      'google',
      NOW() - INTERVAL '12 hours',
      69
    ),
(
      'google',
      NOW() - INTERVAL '11 hours',
      66
    ),
(
      'google',
      NOW() - INTERVAL '10 hours',
      65
    ),
(
      'google',
      NOW() - INTERVAL '9 hours',
      66
    ),
(
      'google',
      NOW() - INTERVAL '8 hours',
      68
    ),
(
      'google',
      NOW() - INTERVAL '7 hours',
      71
    ),
(
      'google',
      NOW() - INTERVAL '6 hours',
      76
    ),
(
      'google',
      NOW() - INTERVAL '5 hours',
      81
    ),
(
      'google',
      NOW() - INTERVAL '4 hours',
      86
    ),
(
      'google',
      NOW() - INTERVAL '3 hours',
      90
    ),
(
      'google',
      NOW() - INTERVAL '2 hours',
      93
    ),
(
      'google',
      NOW() - INTERVAL '1 hours',
      95
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'youtube',
      NOW() - INTERVAL '24 hours',
      31
    ),
(
      'youtube',
      NOW() - INTERVAL '23 hours',
      33
    ),
(
      'youtube',
      NOW() - INTERVAL '22 hours',
      34
    ),
(
      'youtube',
      NOW() - INTERVAL '21 hours',
      36
    ),
(
      'youtube',
      NOW() - INTERVAL '20 hours',
      36
    ),
(
      'youtube',
      NOW() - INTERVAL '19 hours',
      36
    ),
(
      'youtube',
      NOW() - INTERVAL '18 hours',
      36
    ),
(
      'youtube',
      NOW() - INTERVAL '17 hours',
      35
    ),
(
      'youtube',
      NOW() - INTERVAL '16 hours',
      33
    ),
(
      'youtube',
      NOW() - INTERVAL '15 hours',
      32
    ),
(
      'youtube',
      NOW() - INTERVAL '14 hours',
      30
    ),
(
      'youtube',
      NOW() - INTERVAL '13 hours',
      28
    ),
(
      'youtube',
      NOW() - INTERVAL '12 hours',
      26
    ),
(
      'youtube',
      NOW() - INTERVAL '11 hours',
      25
    ),
(
      'youtube',
      NOW() - INTERVAL '10 hours',
      25
    ),
(
      'youtube',
      NOW() - INTERVAL '9 hours',
      25
    ),
(
      'youtube',
      NOW() - INTERVAL '8 hours',
      26
    ),
(
      'youtube',
      NOW() - INTERVAL '7 hours',
      27
    ),
(
      'youtube',
      NOW() - INTERVAL '6 hours',
      29
    ),
(
      'youtube',
      NOW() - INTERVAL '5 hours',
      31
    ),
(
      'youtube',
      NOW() - INTERVAL '4 hours',
      33
    ),
(
      'youtube',
      NOW() - INTERVAL '3 hours',
      34
    ),
(
      'youtube',
      NOW() - INTERVAL '2 hours',
      36
    ),
(
      'youtube',
      NOW() - INTERVAL '1 hours',
      36
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'facebook',
      NOW() - INTERVAL '24 hours',
      15
    ),
(
      'facebook',
      NOW() - INTERVAL '23 hours',
      16
    ),
(
      'facebook',
      NOW() - INTERVAL '22 hours',
      17
    ),
(
      'facebook',
      NOW() - INTERVAL '21 hours',
      18
    ),
(
      'facebook',
      NOW() - INTERVAL '20 hours',
      18
    ),
(
      'facebook',
      NOW() - INTERVAL '19 hours',
      18
    ),
(
      'facebook',
      NOW() - INTERVAL '18 hours',
      18
    ),
(
      'facebook',
      NOW() - INTERVAL '17 hours',
      17
    ),
(
      'facebook',
      NOW() - INTERVAL '16 hours',
      17
    ),
(
      'facebook',
      NOW() - INTERVAL '15 hours',
      16
    ),
(
      'facebook',
      NOW() - INTERVAL '14 hours',
      15
    ),
(
      'facebook',
      NOW() - INTERVAL '13 hours',
      14
    ),
(
      'facebook',
      NOW() - INTERVAL '12 hours',
      13
    ),
(
      'facebook',
      NOW() - INTERVAL '11 hours',
      13
    ),
(
      'facebook',
      NOW() - INTERVAL '10 hours',
      12
    ),
(
      'facebook',
      NOW() - INTERVAL '9 hours',
      13
    ),
(
      'facebook',
      NOW() - INTERVAL '8 hours',
      13
    ),
(
      'facebook',
      NOW() - INTERVAL '7 hours',
      14
    ),
(
      'facebook',
      NOW() - INTERVAL '6 hours',
      15
    ),
(
      'facebook',
      NOW() - INTERVAL '5 hours',
      15
    ),
(
      'facebook',
      NOW() - INTERVAL '4 hours',
      16
    ),
(
      'facebook',
      NOW() - INTERVAL '3 hours',
      17
    ),
(
      'facebook',
      NOW() - INTERVAL '2 hours',
      18
    ),
(
      'facebook',
      NOW() - INTERVAL '1 hours',
      18
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'wikipedia',
      NOW() - INTERVAL '24 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '23 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '22 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '21 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '20 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '19 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '18 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '17 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '16 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '15 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '14 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '13 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '12 hours',
      3
    ),
(
      'wikipedia',
      NOW() - INTERVAL '11 hours',
      3
    ),
(
      'wikipedia',
      NOW() - INTERVAL '10 hours',
      3
    ),
(
      'wikipedia',
      NOW() - INTERVAL '9 hours',
      3
    ),
(
      'wikipedia',
      NOW() - INTERVAL '8 hours',
      3
    ),
(
      'wikipedia',
      NOW() - INTERVAL '7 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '6 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '5 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '4 hours',
      4
    ),
(
      'wikipedia',
      NOW() - INTERVAL '3 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '2 hours',
      5
    ),
(
      'wikipedia',
      NOW() - INTERVAL '1 hours',
      5
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'instagram',
      NOW() - INTERVAL '24 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '23 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '22 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '21 hours',
      8
    ),
(
      'instagram',
      NOW() - INTERVAL '20 hours',
      8
    ),
(
      'instagram',
      NOW() - INTERVAL '19 hours',
      8
    ),
(
      'instagram',
      NOW() - INTERVAL '18 hours',
      8
    ),
(
      'instagram',
      NOW() - INTERVAL '17 hours',
      8
    ),
(
      'instagram',
      NOW() - INTERVAL '16 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '15 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '14 hours',
      6
    ),
(
      'instagram',
      NOW() - INTERVAL '13 hours',
      6
    ),
(
      'instagram',
      NOW() - INTERVAL '12 hours',
      6
    ),
(
      'instagram',
      NOW() - INTERVAL '11 hours',
      6
    ),
(
      'instagram',
      NOW() - INTERVAL '10 hours',
      5
    ),
(
      'instagram',
      NOW() - INTERVAL '9 hours',
      5
    ),
(
      'instagram',
      NOW() - INTERVAL '8 hours',
      6
    ),
(
      'instagram',
      NOW() - INTERVAL '7 hours',
      6
    ),
(
      'instagram',
      NOW() - INTERVAL '6 hours',
      6
    ),
(
      'instagram',
      NOW() - INTERVAL '5 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '4 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '3 hours',
      7
    ),
(
      'instagram',
      NOW() - INTERVAL '2 hours',
      8
    ),
(
      'instagram',
      NOW() - INTERVAL '1 hours',
      8
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'chatgpt',
      NOW() - INTERVAL '24 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '23 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '22 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '21 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '20 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '19 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '18 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '17 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '16 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '15 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '14 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '13 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '12 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '11 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '10 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '9 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '8 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '7 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '6 hours',
      3
    ),
(
      'chatgpt',
      NOW() - INTERVAL '5 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '4 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '3 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '2 hours',
      4
    ),
(
      'chatgpt',
      NOW() - INTERVAL '1 hours',
      4
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'reddit',
      NOW() - INTERVAL '24 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '23 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '22 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '21 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '20 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '19 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '18 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '17 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '16 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '15 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '14 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '13 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '12 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '11 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '10 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '9 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '8 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '7 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '6 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '5 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '4 hours',
      3
    ),
(
      'reddit',
      NOW() - INTERVAL '3 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '2 hours',
      4
    ),
(
      'reddit',
      NOW() - INTERVAL '1 hours',
      4
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'x',
      NOW() - INTERVAL '24 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '23 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '22 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '21 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '20 hours',
      4
    ),
(
      'x',
      NOW() - INTERVAL '19 hours',
      4
    ),
(
      'x',
      NOW() - INTERVAL '18 hours',
      4
    ),
(
      'x',
      NOW() - INTERVAL '17 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '16 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '15 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '14 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '13 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '12 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '11 hours',
      2
    ),
(
      'x',
      NOW() - INTERVAL '10 hours',
      2
    ),
(
      'x',
      NOW() - INTERVAL '9 hours',
      2
    ),
(
      'x',
      NOW() - INTERVAL '8 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '7 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '6 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '5 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '4 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '3 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '2 hours',
      3
    ),
(
      'x',
      NOW() - INTERVAL '1 hours',
      4
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'yahoo',
      NOW() - INTERVAL '24 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '23 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '22 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '21 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '20 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '19 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '18 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '17 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '16 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '15 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '14 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '13 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '12 hours',
      2
    ),
(
      'yahoo',
      NOW() - INTERVAL '11 hours',
      2
    ),
(
      'yahoo',
      NOW() - INTERVAL '10 hours',
      2
    ),
(
      'yahoo',
      NOW() - INTERVAL '9 hours',
      2
    ),
(
      'yahoo',
      NOW() - INTERVAL '8 hours',
      2
    ),
(
      'yahoo',
      NOW() - INTERVAL '7 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '6 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '5 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '4 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '3 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '2 hours',
      3
    ),
(
      'yahoo',
      NOW() - INTERVAL '1 hours',
      3
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'amazon',
      NOW() - INTERVAL '24 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '23 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '22 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '21 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '20 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '19 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '18 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '17 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '16 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '15 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '14 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '13 hours',
      2
    ),
(
      'amazon',
      NOW() - INTERVAL '12 hours',
      2
    ),
(
      'amazon',
      NOW() - INTERVAL '11 hours',
      2
    ),
(
      'amazon',
      NOW() - INTERVAL '10 hours',
      2
    ),
(
      'amazon',
      NOW() - INTERVAL '9 hours',
      2
    ),
(
      'amazon',
      NOW() - INTERVAL '8 hours',
      2
    ),
(
      'amazon',
      NOW() - INTERVAL '7 hours',
      2
    ),
(
      'amazon',
      NOW() - INTERVAL '6 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '5 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '4 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '3 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '2 hours',
      3
    ),
(
      'amazon',
      NOW() - INTERVAL '1 hours',
      3
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'yandex',
      NOW() - INTERVAL '24 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '23 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '22 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '21 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '20 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '19 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '18 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '17 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '16 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '15 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '14 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '13 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '12 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '11 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '10 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '9 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '8 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '7 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '6 hours',
      2
    ),
(
      'yandex',
      NOW() - INTERVAL '5 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '4 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '3 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '2 hours',
      3
    ),
(
      'yandex',
      NOW() - INTERVAL '1 hours',
      3
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'baidu',
      NOW() - INTERVAL '24 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '23 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '22 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '21 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '20 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '19 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '18 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '17 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '16 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '15 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '14 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '13 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '12 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '11 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '10 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '9 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '8 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '7 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '6 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '5 hours',
      2
    ),
(
      'baidu',
      NOW() - INTERVAL '4 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '3 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '2 hours',
      3
    ),
(
      'baidu',
      NOW() - INTERVAL '1 hours',
      3
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'tiktok',
      NOW() - INTERVAL '24 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '23 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '22 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '21 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '20 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '19 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '18 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '17 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '16 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '15 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '14 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '13 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '12 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '11 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '10 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '9 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '8 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '7 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '6 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '5 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '4 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '3 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '2 hours',
      2
    ),
(
      'tiktok',
      NOW() - INTERVAL '1 hours',
      2
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'netflix',
      NOW() - INTERVAL '24 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '23 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '22 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '21 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '20 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '19 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '18 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '17 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '16 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '15 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '14 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '13 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '12 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'netflix',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'netflix',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'netflix',
      NOW() - INTERVAL '8 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '7 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '6 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '5 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '4 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '3 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '2 hours',
      2
    ),
(
      'netflix',
      NOW() - INTERVAL '1 hours',
      2
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'microsoft',
      NOW() - INTERVAL '24 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '23 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '22 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '21 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '20 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '19 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '18 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '17 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '16 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '15 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '14 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '13 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'microsoft',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'microsoft',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'microsoft',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'microsoft',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'microsoft',
      NOW() - INTERVAL '7 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '6 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '5 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '4 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '3 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '2 hours',
      2
    ),
(
      'microsoft',
      NOW() - INTERVAL '1 hours',
      2
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'office',
      NOW() - INTERVAL '24 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '23 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '22 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '21 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '20 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '19 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '18 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '17 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '16 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '15 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'office',
      NOW() - INTERVAL '5 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '4 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '3 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '2 hours',
      2
    ),
(
      'office',
      NOW() - INTERVAL '1 hours',
      2
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'linkedin',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '22 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '21 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '20 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '19 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '18 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '17 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '16 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'linkedin',
      NOW() - INTERVAL '4 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '3 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '2 hours',
      2
    ),
(
      'linkedin',
      NOW() - INTERVAL '1 hours',
      2
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'weather',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'weather',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'twitch',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'twitch',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'github',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'github',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'zoom',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'zoom',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'ebay',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'ebay',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'pinterest',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'pinterest',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'quora',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'quora',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'canva',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'canva',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'duckduckgo',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'duckduckgo',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'imgur',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'imgur',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'spotify',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'spotify',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'roblox',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'roblox',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'stackoverflow',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'stackoverflow',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'apple',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'apple',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'fandom',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'fandom',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'mailru',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'mailru',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'naver',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'naver',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'bilibili',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'bilibili',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'imdb',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'imdb',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'aliexpress',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'aliexpress',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'booking',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'booking',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'globo',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'globo',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'whatsapp',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'whatsapp',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'adobe',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'adobe',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'steam',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'steam',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'bbc',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'bbc',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'cnn',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'cnn',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'nytimes',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'nytimes',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'paypal',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'paypal',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'target',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'target',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'walmart',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'walmart',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'etsy',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'etsy',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'discord',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'discord',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'telegram',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'telegram',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'dailymail',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'dailymail',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'espn',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'espn',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'medium',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'medium',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'salesforce',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'salesforce',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'vimeo',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'vimeo',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'dropbox',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'dropbox',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'slack',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'slack',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'coinbase',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'coinbase',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'binance',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'binance',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'investing',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'investing',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'bloomberg',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'bloomberg',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'tradingview',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'tradingview',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'claude',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'claude',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'gemini',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'gemini',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'huggingface',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'huggingface',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'midjourney',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'midjourney',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'wikihow',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'wikihow',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'merriamwebster',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'merriamwebster',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'accuweather',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'accuweather',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'speedtest',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'speedtest',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'shopify',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'shopify',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'bestbuy',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'bestbuy',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'ikea',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'ikea',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'nike',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'nike',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'craigslist',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'craigslist',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'patreon',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'patreon',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'soundcloud',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'soundcloud',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'hulu',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'hulu',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'disneyplus',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'disneyplus',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'max',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'max',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'deviantart',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'deviantart',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'ign',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'ign',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'theguardian',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'theguardian',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'reuters',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'reuters',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'forbes',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'forbes',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'techcrunch',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'techcrunch',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'wired',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'wired',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'robinhood',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'robinhood',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'stripe',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'stripe',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'vercel',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'vercel',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'netlify',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'netlify',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'npm',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'npm',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'gitlab',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'gitlab',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'docker',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'docker',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'stackexchange',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'stackexchange',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'wunderground',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'wunderground',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'airbnb',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'airbnb',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'uber',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'uber',
      NOW() - INTERVAL '1 hours',
      1
    );

INSERT INTO public.traffic_history (site_id, timestamp, visits_percentage) VALUES
(
      'figma',
      NOW() - INTERVAL '24 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '23 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '22 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '21 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '20 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '19 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '18 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '17 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '16 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '15 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '14 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '13 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '12 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '11 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '10 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '9 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '8 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '7 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '6 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '5 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '4 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '3 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '2 hours',
      1
    ),
(
      'figma',
      NOW() - INTERVAL '1 hours',
      1
    );

-- Add keywords column to sites table if it doesn't exist
ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]'::jsonb;

-- Seed real popular Google Autocomplete keywords for the top 100 domains
UPDATE public.sites SET keywords = '["Translate", "Maps", "Images", "Scholar", "Drive"]' WHERE id = 'google';
UPDATE public.sites SET keywords = '["Music", "TV", "Premium", "Kids", "Gaming"]' WHERE id = 'youtube';
UPDATE public.sites SET keywords = '["Messenger", "Marketplace", "Watch", "Groups", "Gaming"]' WHERE id = 'facebook';
UPDATE public.sites SET keywords = '["Dictionary", "Donations", "English", "Citations", "History"]' WHERE id = 'wikipedia';
UPDATE public.sites SET keywords = '["Stories", "Reels", "Direct", "Search", "Photos"]' WHERE id = 'instagram';
UPDATE public.sites SET keywords = '["API", "Prompts", "GPT-4", "Custom GPTs", "Coding"]' WHERE id = 'chatgpt';
UPDATE public.sites SET keywords = '["Forums", "Investing", "Karma", "Communities", "Stories"]' WHERE id = 'reddit';
UPDATE public.sites SET keywords = '["Analytics", "Premium", "API", "Spaces", "Trending"]' WHERE id = 'x';
UPDATE public.sites SET keywords = '["Mail", "Finance", "News", "Search", "Weather"]' WHERE id = 'yahoo';
UPDATE public.sites SET keywords = '["Prime", "Orders", "Kindle", "AWS", "Deals"]' WHERE id = 'amazon';
UPDATE public.sites SET keywords = '["Search", "Translate", "Mail", "Maps", "Browser"]' WHERE id = 'yandex';
UPDATE public.sites SET keywords = '["Search", "Translate", "Maps", "Stock", "Fanyi"]' WHERE id = 'baidu';
UPDATE public.sites SET keywords = '["Coins", "Download", "Creator Fund", "Music", "Live"]' WHERE id = 'tiktok';
UPDATE public.sites SET keywords = '["Streaming", "Pricing", "Movies", "Plans", "Originals"]' WHERE id = 'netflix';
UPDATE public.sites SET keywords = '["Store", "Teams", "Office", "Support", "Windows"]' WHERE id = 'microsoft';
UPDATE public.sites SET keywords = '["365 Login", "OneDrive", "Word", "Excel", "Outlook"]' WHERE id = 'office';
UPDATE public.sites SET keywords = '["Jobs", "Premium", "Learning", "Recruiter", "Connections"]' WHERE id = 'linkedin';
UPDATE public.sites SET keywords = '["Radar", "Tomorrow", "Local", "Forecast", "Maps"]' WHERE id = 'weather';
UPDATE public.sites SET keywords = '["Prime", "Channels", "Subs", "Tracker", "Clips"]' WHERE id = 'twitch';
UPDATE public.sites SET keywords = '["Repositories", "Actions", "Copilot", "Pull Requests", "Docs"]' WHERE id = 'github';
UPDATE public.sites SET keywords = '["Meetings", "Support", "App", "Extensions", "Webinars"]' WHERE id = 'zoom';
UPDATE public.sites SET keywords = '["Store", "Bidding", "Seller Hub", "Buyer Protection", "Deals"]' WHERE id = 'ebay';
UPDATE public.sites SET keywords = '["Search", "Aesthetic", "Extension", "Boards", "DIY"]' WHERE id = 'pinterest';
UPDATE public.sites SET keywords = '["Questions", "Answers", "Spaces", "Digest", "Partner"]' WHERE id = 'quora';
UPDATE public.sites SET keywords = '["Templates", "Resumes", "Logo Maker", "Fonts", "Pro"]' WHERE id = 'canva';
UPDATE public.sites SET keywords = '["Search", "Browser", "Privacy", "Email", "Extension"]' WHERE id = 'duckduckgo';
UPDATE public.sites SET keywords = '["Uploader", "Memes", "API", "GIFs", "Community"]' WHERE id = 'imgur';
UPDATE public.sites SET keywords = '["Premium", "Web Player", "Wrapped", "Playlists", "Podcasts"]' WHERE id = 'spotify';
UPDATE public.sites SET keywords = '["Robux", "Status", "Developer", "Studio", "Toys"]' WHERE id = 'roblox';
UPDATE public.sites SET keywords = '["Questions", "Answers", "Survey", "Careers", "Tags"]' WHERE id = 'stackoverflow';
UPDATE public.sites SET keywords = '["Store", "Support", "ID Login", "Releases", "Devices"]' WHERE id = 'apple';
UPDATE public.sites SET keywords = '["Wiki", "App", "Support", "Guidelines", "Communities"]' WHERE id = 'fandom';
UPDATE public.sites SET keywords = '["Mail", "Search", "Games", "Client", "Translation"]' WHERE id = 'mailru';
UPDATE public.sites SET keywords = '["Map", "Translate", "Dictionary", "Webtoons", "Blogs"]' WHERE id = 'naver';
UPDATE public.sites SET keywords = '["Videos", "App", "Stock", "Anime", "Streaming"]' WHERE id = 'bilibili';
UPDATE public.sites SET keywords = '["Top 250", "Movies", "Ratings", "Cast", "Reviews"]' WHERE id = 'imdb';
UPDATE public.sites SET keywords = '["Tracker", "Promo Codes", "Support", "Coupons", "Deals"]' WHERE id = 'aliexpress';
UPDATE public.sites SET keywords = '["Flights", "Support", "Hotel Deals", "Cancel", "Affiliate"]' WHERE id = 'booking';
UPDATE public.sites SET keywords = '["Noticias", "Play", "Esporte", "G1", "Gshow"]' WHERE id = 'globo';
UPDATE public.sites SET keywords = '["Web", "Status", "Desktop", "Business API", "Security"]' WHERE id = 'whatsapp';
UPDATE public.sites SET keywords = '["Creative Cloud", "Photoshop", "Acrobat Reader", "Fonts", "PDF"]' WHERE id = 'adobe';
UPDATE public.sites SET keywords = '["Store", "Community", "Refunds", "Sales", "Support"]' WHERE id = 'steam';
UPDATE public.sites SET keywords = '["iPlayer", "News", "Sport", "Weather", "Radio"]' WHERE id = 'bbc';
UPDATE public.sites SET keywords = '["Live TV", "Breaking News", "Business", "Opinion", "Podcasts"]' WHERE id = 'cnn';
UPDATE public.sites SET keywords = '["Crosswords", "Cooking", "News", "Spelling Bee", "Subscription"]' WHERE id = 'nytimes';
UPDATE public.sites SET keywords = '["Fees", "Support", "Prepaid", "Business", "Wallet"]' WHERE id = 'paypal';
UPDATE public.sites SET keywords = '["Circle", "Weekly Ad", "Delivery", "Registry", "Deals"]' WHERE id = 'target';
UPDATE public.sites SET keywords = '["Delivery", "Pharmacy", "Weekly Flyer", "Careers", "Rollbacks"]' WHERE id = 'walmart';
UPDATE public.sites SET keywords = '["Seller Studio", "Custom Gifts", "Support", "Tracking", "Coupons"]' WHERE id = 'etsy';
UPDATE public.sites SET keywords = '["Overlay", "Status", "Bots", "Servers", "Nitro"]' WHERE id = 'discord';
UPDATE public.sites SET keywords = '["Web Client", "Channels", "Desktop", "Premium", "Bots"]' WHERE id = 'telegram';
UPDATE public.sites SET keywords = '["Showbiz", "News", "Health", "Opinion", "Videos"]' WHERE id = 'dailymail';
UPDATE public.sites SET keywords = '["Fantasy", "Live Scores", "College", "Stream", "Schedule"]' WHERE id = 'espn';
UPDATE public.sites SET keywords = '["Membership", "Writing", "Partner Program", "Publications", "Stories"]' WHERE id = 'medium';
UPDATE public.sites SET keywords = '["Developers", "Trailhead", "Certifications", "AppExchange", "Dashboards"]' WHERE id = 'salesforce';
UPDATE public.sites SET keywords = '["Upload", "Pricing", "Live", "Record", "Support"]' WHERE id = 'vimeo';
UPDATE public.sites SET keywords = '["Sharing", "Desktop App", "Smart Sync", "Business", "Storage"]' WHERE id = 'dropbox';
UPDATE public.sites SET keywords = '["Integrations", "Pricing", "Workspace", "Shortcuts", "Enterprise"]' WHERE id = 'slack';
UPDATE public.sites SET keywords = '["Wallet", "Fees", "Staking", "Support", "Markets"]' WHERE id = 'coinbase';
UPDATE public.sites SET keywords = '["Exchange", "Staking", "Referrals", "Security", "Fees"]' WHERE id = 'binance';
UPDATE public.sites SET keywords = '["Portfolio", "Calendar", "Technical Analysis", "Stocks", "News"]' WHERE id = 'investing';
UPDATE public.sites SET keywords = '["Terminal", "Quotes", "Markets", "TV Live", "Business"]' WHERE id = 'bloomberg';
UPDATE public.sites SET keywords = '["Charts", "Screener", "Desktop App", "Pine Script", "Community"]' WHERE id = 'tradingview';
UPDATE public.sites SET keywords = '["API", "Pro Pricing", "vs GPT-4", "Developers", "Artifacts"]' WHERE id = 'claude';
UPDATE public.sites SET keywords = '["API Key", "Advanced", "Developers", "Code Helper", "Models"]' WHERE id = 'gemini';
UPDATE public.sites SET keywords = '["Models", "Spaces", "Datasets", "Transformers", "API"]' WHERE id = 'huggingface';
UPDATE public.sites SET keywords = '["Prompts", "Discord", "Gallery", "Pricing", "Editor"]' WHERE id = 'midjourney';
UPDATE public.sites SET keywords = '["Articles", "Writer Help", "Illustrations", "Random", "Categories"]' WHERE id = 'wikihow';
UPDATE public.sites SET keywords = '["Dictionary", "Word of Day", "Thesaurus", "Scrabble", "Wordle"]' WHERE id = 'merriamwebster';
UPDATE public.sites SET keywords = '["Radar Map", "Forecast", "Storm Alerts", "Hurricane Track", "Local"]' WHERE id = 'accuweather';
UPDATE public.sites SET keywords = '["Internet", "CLI", "Server Select", "Results", "Global Index"]' WHERE id = 'speedtest';
UPDATE public.sites SET keywords = '["Themes", "App Store", "Dropshipping", "Pricing", "POS"]' WHERE id = 'shopify';
UPDATE public.sites SET keywords = '["Weekly Ad", "Deals", "Support", "Store Locator", "Tracking"]' WHERE id = 'bestbuy';
UPDATE public.sites SET keywords = '["Catalog", "Delivery", "Locator", "Family Rewards", "Furniture"]' WHERE id = 'ikea';
UPDATE public.sites SET keywords = '["Sneakers Release", "Membership", "Tracking", "Custom Shoes", "App"]' WHERE id = 'nike';
UPDATE public.sites SET keywords = '["Rentals", "Garage Sales", "Jobs", "Community", "Services"]' WHERE id = 'craigslist';
UPDATE public.sites SET keywords = '["Creators", "Pricing Tiers", "App Download", "Support", "Guidelines"]' WHERE id = 'patreon';
UPDATE public.sites SET keywords = '["Playlists", "Go Premium", "Artist Panel", "Downloader", "Tracks"]' WHERE id = 'soundcloud';
UPDATE public.sites SET keywords = '["Pricing Plans", "Student Deal", "Live TV", "Movies", "Library"]' WHERE id = 'hulu';
UPDATE public.sites SET keywords = '["Releases", "Bundle Deal", "Watchlist", "Kids", "Help"]' WHERE id = 'disneyplus';
UPDATE public.sites SET keywords = '["Streaming", "Movies", "Deals", "Originals", "Support"]' WHERE id = 'max';
UPDATE public.sites SET keywords = '["Wall Art", "Commissions", "Tags", "Packs", "Daily Deviation"]' WHERE id = 'deviantart';
UPDATE public.sites SET keywords = '["Reviews", "Releases", "Live Streams", "Walkthroughs", "Guides"]' WHERE id = 'ign';
UPDATE public.sites SET keywords = '["Live Feed", "Breaking News", "Opinion", "Crosswords", "Podcasts"]' WHERE id = 'theguardian';
UPDATE public.sites SET keywords = '["Finance", "Breaking News", "Pictures", "Markets", "Videos"]' WHERE id = 'reuters';
UPDATE public.sites SET keywords = '["Billionaires", "30 Under 30", "Business News", "Indexes", "Lists"]' WHERE id = 'forbes';
UPDATE public.sites SET keywords = '["Disrupt", "Startups", "Daily brief", "Videos", "Podcasts"]' WHERE id = 'techcrunch';
UPDATE public.sites SET keywords = '["Science", "Tech News", "Reviews", "Videos", "Ideas"]' WHERE id = 'wired';
UPDATE public.sites SET keywords = '["Gold", "Stock Quotes", "Options", "Crypto", "Transfer"]' WHERE id = 'robinhood';
UPDATE public.sites SET keywords = '["Developer API", "Checkout", "Pricing", "Terminal", "Radar"]' WHERE id = 'stripe';
UPDATE public.sites SET keywords = '["Deployment", "Domains", "Serverless", "Analytics", "Pricing"]' WHERE id = 'vercel';
UPDATE public.sites SET keywords = '["DNS", "Functions", "Analytics", "Pricing", "Builder"]' WHERE id = 'netlify';
UPDATE public.sites SET keywords = '["Registry", "Packages", "CLI", "Audit", "Security"]' WHERE id = 'npm';
UPDATE public.sites SET keywords = '["CI/CD Pipelines", "Runners", "Pricing", "Self-Hosted", "Registry"]' WHERE id = 'gitlab';
UPDATE public.sites SET keywords = '["Desktop", "Hub", "Containers", "Compose", "Volumes"]' WHERE id = 'docker';
UPDATE public.sites SET keywords = '["Sites List", "Reputation", "Badges", "Meta", "Community"]' WHERE id = 'stackexchange';
UPDATE public.sites SET keywords = '["Radar Map", "Local Weather", "Alerts", "Monthly Stats", "Historical"]' WHERE id = 'wunderground';
UPDATE public.sites SET keywords = '["Stays", "Experiences", "Hosting", "Support", "Deals"]' WHERE id = 'airbnb';
UPDATE public.sites SET keywords = '["Rides", "Eats Delivery", "Driver Portal", "Business", "Support"]' WHERE id = 'uber';
UPDATE public.sites SET keywords = '["Team Files", "Design Tool", "Plugins", "Student Deal", "Community"]' WHERE id = 'figma';
