-- Fix 7 wrong site URLs (wrong domains broke favicons, links and Tranco/Radar matching).
-- Run once in the Supabase SQL Editor. Safe to re-run.
UPDATE public.sites SET url = 'https://telegram.org' WHERE id = 'telegram';
UPDATE public.sites SET url = 'https://mail.ru' WHERE id = 'mailru';
UPDATE public.sites SET url = 'https://store.steampowered.com' WHERE id = 'steam';
UPDATE public.sites SET url = 'https://huggingface.co' WHERE id = 'huggingface';
UPDATE public.sites SET url = 'https://www.merriam-webster.com' WHERE id = 'merriamwebster';
UPDATE public.sites SET url = 'https://www.speedtest.net' WHERE id = 'speedtest';
UPDATE public.sites SET url = 'https://www.npmjs.com' WHERE id = 'npm';
