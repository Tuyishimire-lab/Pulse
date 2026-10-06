-- ============================================================================
-- Pulse Database Seed: New 25 Breakout Domains (Ranks 112 to 136)
-- Target Table: public.sites
-- Includes required columns: id, name, url, rank, category, baseline,
-- baseline_raw, rate, color, glow, progress (omits non-existent 'logo').
-- Safe to re-run: Uses ON CONFLICT (id) DO UPDATE.
-- ============================================================================

INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('deepseek', 'DeepSeek', 'https://deepseek.com', 112, 'ai', '185.0M / mo', 185000000, 70, '#1e88e5', 'rgba(30, 136, 229, 0.2)', 0.2)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('temu', 'Temu', 'https://temu.com', 113, 'ecommerce', '620.0M / mo', 620000000, 236, '#ff6600', 'rgba(255, 102, 0, 0.2)', 0.7)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('characterai', 'Character.ai', 'https://character.ai', 114, 'ai', '220.0M / mo', 220000000, 84, '#6366f1', 'rgba(99, 102, 241, 0.2)', 0.3)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('notion', 'Notion', 'https://notion.so', 115, 'dev', '180.0M / mo', 180000000, 68, '#ffffff', 'rgba(255, 255, 255, 0.15)', 0.2)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('cloudflare', 'Cloudflare', 'https://cloudflare.com', 116, 'dev', '165.0M / mo', 165000000, 63, '#f38020', 'rgba(243, 128, 32, 0.2)', 0.2)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('shein', 'Shein', 'https://shein.com', 117, 'ecommerce', '290.0M / mo', 290000000, 110, '#ffffff', 'rgba(255, 255, 255, 0.15)', 0.3)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('elevenlabs', 'ElevenLabs', 'https://elevenlabs.io', 118, 'ai', '42.0M / mo', 42000000, 16, '#ffffff', 'rgba(255, 255, 255, 0.15)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('poe', 'Poe', 'https://poe.com', 119, 'ai', '65.0M / mo', 65000000, 25, '#6d28d9', 'rgba(109, 40, 217, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('linear', 'Linear', 'https://linear.app', 120, 'dev', '28.0M / mo', 28000000, 11, '#5e6ad2', 'rgba(94, 106, 210, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('replit', 'Replit', 'https://replit.com', 121, 'dev', '45.0M / mo', 45000000, 17, '#f26207', 'rgba(242, 98, 7, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('mistral', 'Mistral AI', 'https://mistral.ai', 122, 'ai', '35.0M / mo', 35000000, 13, '#fd531e', 'rgba(253, 83, 30, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('chess', 'Chess.com', 'https://chess.com', 123, 'entertainment', '250.0M / mo', 250000000, 95, '#81b64c', 'rgba(129, 182, 76, 0.2)', 0.3)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('crunchyroll', 'Crunchyroll', 'https://crunchyroll.com', 124, 'entertainment', '140.0M / mo', 140000000, 53, '#f47521', 'rgba(244, 117, 33, 0.2)', 0.2)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('epicgames', 'Epic Games', 'https://epicgames.com', 125, 'entertainment', '110.0M / mo', 110000000, 42, '#ffffff', 'rgba(255, 255, 255, 0.15)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('civitai', 'Civitai', 'https://civitai.com', 126, 'ai', '52.0M / mo', 52000000, 20, '#2563eb', 'rgba(37, 99, 235, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('postman', 'Postman', 'https://postman.com', 127, 'dev', '38.0M / mo', 38000000, 14, '#ff6c37', 'rgba(255, 108, 55, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('runwayml', 'Runway', 'https://runwayml.com', 128, 'ai', '30.0M / mo', 30000000, 11, '#00ff87', 'rgba(0, 255, 135, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('revolut', 'Revolut', 'https://revolut.com', 129, 'finance', '40.0M / mo', 40000000, 15, '#0075eb', 'rgba(0, 117, 235, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('coinmarketcap', 'CoinMarketCap', 'https://coinmarketcap.com', 130, 'finance', '120.0M / mo', 120000000, 46, '#3861fb', 'rgba(56, 97, 251, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('wise', 'Wise', 'https://wise.com', 131, 'finance', '55.0M / mo', 55000000, 21, '#9fe870', 'rgba(159, 232, 112, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('bybit', 'Bybit', 'https://bybit.com', 132, 'finance', '60.0M / mo', 60000000, 23, '#f7a600', 'rgba(247, 166, 0, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('letterboxd', 'Letterboxd', 'https://letterboxd.com', 133, 'entertainment', '45.0M / mo', 45000000, 17, '#00e054', 'rgba(0, 224, 84, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('digitalocean', 'DigitalOcean', 'https://digitalocean.com', 134, 'dev', '32.0M / mo', 32000000, 12, '#0080ff', 'rgba(0, 128, 255, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('sentry', 'Sentry', 'https://sentry.io', 135, 'dev', '25.0M / mo', 25000000, 10, '#362d59', 'rgba(255, 255, 255, 0.15)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
INSERT INTO public.sites (id, name, url, rank, category, baseline, baseline_raw, rate, color, glow, progress) VALUES ('luma', 'Luma AI', 'https://lumalabs.ai', 136, 'ai', '22.0M / mo', 22000000, 8, '#ff3b30', 'rgba(255, 59, 48, 0.2)', 0.1)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, url = EXCLUDED.url, rank = EXCLUDED.rank,
    category = EXCLUDED.category, baseline = EXCLUDED.baseline,
    baseline_raw = EXCLUDED.baseline_raw, rate = EXCLUDED.rate,
    color = EXCLUDED.color, glow = EXCLUDED.glow,
    progress = EXCLUDED.progress;
