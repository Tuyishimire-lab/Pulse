# Pulse — Project Documentation

> **Living document.** Updated after every significant change to the codebase.
> Last updated: 2026-08-07

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Database Schema (Supabase)](#4-database-schema-supabase)
5. [Environment Variables](#5-environment-variables)
6. [Data Flow](#6-data-flow)
7. [Pages & Routes](#7-pages--routes)
8. [API Routes](#8-api-routes)
9. [PTI Engine (Python Backend)](#9-pti-engine-python-backend)
10. [Scripts](#10-scripts)
11. [Components](#11-components)
12. [Feature Changelog](#12-feature-changelog)
13. [Roadmap & Future Plans](#13-roadmap--future-plans)

---

## 1. Project Overview

**Pulse** is a real-time web traffic intelligence platform that tracks, ranks, and compares global website traffic. It shows live visitor counters, PTI (Pulse Traffic Index) scores, country-level rankings, weekly reports, and compare pages for any two sites.

**Live URL:** https://www.pulstraffic.com
**GitHub:** https://github.com/Tuyishimire-lab/Pulse
**Deployment:** Vercel (auto-deploys on push to `main`)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.10 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Runtime | React 19 |
| Database | Supabase (PostgreSQL) |
| AI / LLM | Groq (`llama-3.3-70b-versatile`) |
| Traffic Data | Cloudflare Radar API |
| PTI Engine | Python 3.12 |
| Scheduling | GitHub Actions (cron, every 6h) |
| Hosting | Vercel |
| Analytics | Vercel Analytics |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel (Next.js)                    │
│                                                         │
│  page.tsx (Server Component)                            │
│    └─ fetches initialSites from Supabase server-side    │
│    └─ passes to HomeClient.tsx (Client Component)       │
│                                                         │
│  HomeClient.tsx                                         │
│    └─ Supabase realtime subscription (incremental)      │
│    └─ Cloudflare Radar (country filter)                 │
│    └─ DashboardConsole, SiteGrid, AnalyticsPanel        │
└─────────────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
   ┌──────────────┐        ┌──────────────────┐
   │   Supabase   │        │ Cloudflare Radar │
   │  (Postgres)  │        │      API         │
   │              │        └──────────────────┘
   │  sites       │
   │  weekly_snapshots     ┌──────────────────┐
   │  site_history │       │   GitHub Actions │
   │  compare_cache│◄──────│  (every 6 hours) │
   └──────────────┘        │  PTI Engine (Py) │
                           └──────────────────┘
```

### Key Design Decisions

- **Server-side initial fetch** — `page.tsx` fetches `initialSites` from Supabase before render, eliminating a client-side waterfall
- **Realtime subscription** — `HomeClient` subscribes to `postgres_changes` for incremental updates only
- **Static fallback** — `src/app/data/sites.ts` is the canonical static fallback if Supabase is unavailable
- **ISR everywhere** — All dynamic pages use `revalidate` for stale-while-revalidate caching

---

## 4. Database Schema (Supabase)

### `public.sites`
Core site data. Updated by the PTI engine every 6 hours.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Slug (e.g. `google`, `youtube`) |
| `name` | TEXT | Display name |
| `url` | TEXT | Full URL |
| `rank` | INTEGER | Global PTI rank |
| `category` | TEXT | `search`, `social`, `ai`, `dev`, `video`, `news`, `ecom`, `finance` |
| `baseline` | TEXT | Human-readable monthly visits (e.g. `8.5B / mo`) |
| `baseline_raw` | BIGINT | Raw monthly visits as integer |
| `rate` | INTEGER | Visits per second |
| `logo` | TEXT | Emoji or short label |
| `color` | TEXT | Brand hex color |
| `glow` | TEXT | CSS glow color |
| `progress` | INTEGER | 0–100 bar fill |
| `asn` | INTEGER | Autonomous System Number (for Cloudflare Radar) |
| `keywords` | TEXT[] | SEO keywords |
| `rank_history` | INTEGER[] | Last 30 daily ranks |
| `volatility` | NUMERIC | Day-over-day rank volatility |
| `updated_at` | TIMESTAMPTZ | Last PTI engine run timestamp |

### `public.weekly_snapshots`
Full weekly state written by PTI engine after every run.

| Column | Type | Description |
|---|---|---|
| `week_slug` | TEXT PK | ISO week (e.g. `2026-w32`) |
| `snapshot_date` | TIMESTAMPTZ | When written |
| `sites_data` | JSONB | Full ranked site list |
| `category_totals` | JSONB | Totals per category |
| `total_rate` | INTEGER | Global visits/sec sum |
| `outage_count` | INTEGER | Sites with detected outages |
| `ai_stories` | JSONB | AI-generated weekly highlights |

### `public.site_history`
Per-run audit trail for trend analysis.

| Column | Type | Description |
|---|---|---|
| `id` | UUID PK | |
| `site_id` | TEXT FK → sites | |
| `recorded_at` | TIMESTAMPTZ | |
| `rank` | INTEGER | |
| `rate` | INTEGER | |
| `volatility` | NUMERIC | |
| `pti_score` | NUMERIC | |

### `public.compare_cache`
Caches Groq-generated FAQs for compare pages. Each pair written once, never regenerated.

| Column | Type | Description |
|---|---|---|
| `pair_slug` | TEXT PK | e.g. `google-vs-youtube` |
| `site_a_id` | TEXT | |
| `site_b_id` | TEXT | |
| `verdict` | TEXT | AI-generated comparison verdict |
| `context` | TEXT | Neutral context sentence |
| `faq` | JSONB | `[{ q, a }]` — 3 FAQ items |
| `generated_at` | TIMESTAMPTZ | |

### RLS Policies
All tables have Row Level Security enabled with a public `SELECT` policy. Writes go through the `SUPABASE_SERVICE_ROLE_KEY` (PTI engine / server-side only).

---

## 5. Environment Variables

| Variable | Required | Used By | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Client | Public anon key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | — | Client (alias) | Alias for anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server only | Bypasses RLS for writes |
| `CLOUDFLARE_API_TOKEN` | ✅ | API routes | Radar traffic data |
| `GROQ_API_KEY` | ✅ | Server + scripts | AI compare FAQs, country generation |
| `NEXT_PUBLIC_SITE_URL` | — | Server | Canonical URL for internal fetches |

---

## 6. Data Flow

### Live Traffic Counter
```
sites.ts (static) → Supabase sites.rate → HomeClient state
→ SiteGrid card → LiveCounter (increments every 500ms using rate)
```

### Badge API
```
GET /api/badge/[id]
→ unstable_cache (5-min TTL, shared across instances)
→ Supabase sites table
→ SVG response with rank + PTI score
```

### Compare Page (Dynamic)
```
/compare/[pair]
→ getPairBySlug() → hand-crafted pair? → return immediately
→ else → generateDynamicPair()
    → check compare_cache (Supabase)
    → cache hit?  return cached data
    → cache miss? call Groq (1 API call, ever) → store → return
```

### Country Page
```
/top-sites/[country]
→ getCountryBySlug() → ALL_COUNTRIES (hand-crafted + generated)
→ pinnedSiteIds? → pin those sites first
→ else → global ranking from SITES
→ StaticGeneration + ISR (revalidate: 86400)
```

### PTI Engine (every 6h)
```
GitHub Actions → run_engine.py
→ signals.py (Cloudflare Radar + Pytrends + historical)
→ pti_model.py (weighted scoring)
→ auto_tuner.py (ML calibration)
→ validation.py (sanity checks)
→ Supabase sites (upsert rank, rate, volatility, updated_at)
→ Supabase weekly_snapshots (upsert current week)
→ Supabase site_history (insert audit row)
```

---

## 7. Pages & Routes

| Route | Type | Description |
|---|---|---|
| `/` | Server + Client | Main dashboard — live site grid |
| `/sites/[id]` | Dynamic (ISR) | Individual site detail page |
| `/compare/[pair]` | Dynamic (ISR 1h) | Two-site traffic comparison with AI FAQs |
| `/top-sites/[country]` | Static + ISR | Country-specific rankings (115 countries) |
| `/report/[week]` | Dynamic | Weekly traffic report (from weekly_snapshots) |
| `/speed-test` | Client | Browser-based speed test |
| `/methodology` | Static | PTI scoring methodology explained |
| `/privacy` | Static | Privacy policy |
| `/terms` | Static | Terms of service |

### Static Params Coverage
- **Compare pairs:** 20 hand-crafted + top-20×top-20 dynamic combos (~380 total)
- **Country pages:** 24 hand-crafted + 91 generated = **115 total**

---

## 8. API Routes

| Endpoint | Cache | Description |
|---|---|---|
| `GET /api/badge/[id]` | `unstable_cache` 5min | SVG badge with rank + PTI score |
| `GET /api/radar-stats` | 5min | Global Cloudflare Radar summary |
| `GET /api/radar-site?asn=` | 1h | Per-ASN geo + device + traffic data |
| `GET /api/marquee?location=` | 60s | Scrolling traffic facts banner |
| `GET /api/outages` | 60s | Detected site outages |
| `GET /api/speed-test` | no-cache | Latency measurement endpoint |
| `GET /api/sync-rankings` | no-cache | Manual trigger for rank sync |
| `POST /api/cron` | — | GitHub Actions webhook entry point |

---

## 9. PTI Engine (Python Backend)

Located in `scripts/pulse_engine/`. Runs via GitHub Actions every 6 hours.

| File | Role |
|---|---|
| `run_engine.py` | Orchestrator — runs all steps, writes to Supabase |
| `signals.py` | Data collection — Cloudflare Radar, Pytrends, historical |
| `pti_model.py` | Scoring model — weighted multi-signal PTI score |
| `auto_tuner.py` | ML auto-tuner — adjusts signal weights based on accuracy |
| `validation.py` | Sanity checks — flags anomalies before writing |
| `janitor.py` | DB maintenance — prunes stale site_history rows |
| `config.py` | Constants and signal weight configuration |

### PTI Score Formula
```
PTI = w1 × radar_rank + w2 × trend_score + w3 × historical_stability
```
Weights (`w1`, `w2`, `w3`) are auto-tuned by `auto_tuner.py` using a sliding window of accuracy measurements.

---

## 10. Scripts

| Script | Command | Description |
|---|---|---|
| `scripts/generate-countries.ts` | `npm run generate:countries` | Generates 91+ country pages using World Bank API + Groq. Incremental — re-runs only generate missing entries. |
| `scripts/generate-seed-sql.js` | `npm run generate:sql` | Regenerates `supabase_setup.sql` INSERT statements from `sites.ts`. Run after adding new sites. |
| `scripts/social_bot.py` | manual | Posts weekly traffic highlights to social media. |
| `scripts/fix-emdashes.js` | manual | One-off text cleanup utility. |

### Running the Country Generator
```bash
# First time (or to add new countries):
npm run generate:countries

# After completion, commit the output:
git add src/app/top-sites/data/countries.generated.ts scripts/.countries-cache.json
git commit -m "chore: regenerate country pages"
git push origin main
```

---

## 11. Components

### Core UI
| Component | Description |
|---|---|
| `DashboardConsole` | Top control bar — search, filters, category tabs, sync status pill |
| `SiteGrid` | Responsive grid/list of site cards with live counters |
| `AnalyticsPanel` | Expandable panel with Cloudflare Radar stats, traffic tiers, sort |
| `MarqueeBanner` | Auto-scrolling traffic facts ticker |
| `Header` | Hero section with animated tagline and page load time |
| `NavHeader` | Top navigation bar with links |
| `SiteDetailModal` | Full-screen modal with site details, ASN data, charts |
| `CompareModal` | Two-site comparison picker (client-side) |
| `LegalModals` | Privacy/Terms overlays |
| `AddCustomSiteModal` | Add a custom site to the local watchlist |

### Sync Status Pill (`DashboardConsole`)
Reads `lastSynced` (ISO timestamp from `sites.updated_at`):
- 🟢 **Live** — synced < 30 minutes ago
- 🟡 **Synced Xm ago** — 30min–6h
- 🔴 **Stale** — > 6h since last sync

---

## 12. Feature Changelog

### 2026-08-07 — Major Update Session

#### Priority 1 — SQL Reconciliation
- `supabase_setup.sql` updated: `baseline_raw`, `logo`, `volatility`, `updated_at` columns added to `sites`
- `scripts/generate-seed-sql.js` created — generates idempotent UPSERTs from `sites.ts`
- Migration: `supabase_migration_new_tables.sql` — adds all new tables, idempotent (safe to re-run)

#### Priority 2 — Weekly Snapshots
- `run_engine.py` — now upserts `weekly_snapshots` table after every PTI cron run
- `/report/[week]` page now reads from live `weekly_snapshots` data

#### Priority 3 — "Data as of" Sync Timestamp
- `run_engine.py` — writes `updated_at` on every site update
- `HomeClient.tsx` — reads `updated_at` from Supabase, tracks `lastSynced` state
- `DashboardConsole.tsx` — displays live/stale sync status pill

#### Priority 4 — Durable Badge Cache
- `badge/[id]/route.ts` — replaced ephemeral module-level `Map` with `unstable_cache`
- Cache survives serverless cold starts and is shared across Vercel function instances
- 5-minute TTL, tagged `'badge'` for surgical invalidation

#### Priority 5 — Dynamic Compare Pairs + Groq FAQs
- `generateDynamicPair.ts` created — generates verdict + 3 FAQs via Groq
- Groq called **at most once per pair, ever** — all future requests read from `compare_cache`
- `compare/[pair]/page.tsx` — `generateStaticParams` yields top-20×top-20 combos
- JSON-LD `FAQPage` schema added to all compare pages

#### Country Expansion
- `scripts/generate-countries.ts` — World Bank API + Groq batch generation
- `countries.generated.ts` — 91 auto-generated countries with real internet stats
- `countries.ts` — now merges hand-crafted (24) + generated (91) = **115 total**
- `top-sites/[country]/page.tsx` — `dynamicParams = true`, uses `ALL_COUNTRIES`
- `npm run generate:countries` — incremental, cached, re-run safe

---

## 13. Roadmap & Future Plans

### 🔴 High Priority

#### Traffic Map (`/map`)
**Status: ✅ Shipped — 2026-08-07**

An interactive world map where countries are coloured by internet penetration % and clicking any country navigates to `/top-sites/[country]`.

- **Library:** `react-simple-maps` (SVG-based, ~30kb, no API key)
- **Colour coding:** choropleth by penetration % — bright teal (≥90%) → dark (< 30%) → grey (no data)
- **Interaction:** hover → tooltip with country name, #1 site, users, penetration; click → country page
- **Coverage:** 115 countries with data; others greyed out
- **Route:** `/map` — added to NavHeader and sitemap (priority 0.95)

#### Groq-Powered Site Summaries
Generate a 2–3 sentence AI summary per site for the detail modal, cached in Supabase. Triggered on first view, stored permanently.

### 🟡 Medium Priority

#### Embeddable Widgets
Allow site owners to embed a Pulse badge or live counter on their own site. Extends the existing badge API with a JavaScript embed snippet generator.

#### Email / Weekly Digest
Weekly email summarising the biggest movers, drops, and new entrants. Triggered by PTI engine after each weekly snapshot write.

#### Trending Sites Feed (`/trending`)
Sites with the biggest rank improvements week-over-week, powered by `site_history` table.

#### Category Deep-Dive Pages (`/category/[name]`)
e.g. `/category/ai` — all AI sites ranked, with category-specific insights and charts.

#### Interactive Historical Rank Chart
Replace the static `rank_history` sparkline with an interactive Recharts graph in the site detail modal, powered by `site_history`.

### 🟢 Low Priority / Future

#### `/compare` Index Page
A searchable landing page listing all 400+ comparison pairs.

#### China / Russia Ecosystem
Add Baidu, WeChat, VK, Yandex to `sites.ts` with accurate traffic data.

#### PTI Engine — Pytrends Reliability
Current Pytrends integration is throttled by Google. Evaluate SerpAPI Google Trends as a more reliable alternative.

#### More Country Pages
Extend `ALL_COUNTRIES` in `generate-countries.ts` and re-run `npm run generate:countries` to add Pacific Islands, Central Asia, Caribbean, etc.

#### Dark/Light Mode Toggle
Currently dark-only. Add a system-aware toggle stored in localStorage.

#### Site Submission Form
Allow site owners to submit their site for Pulse inclusion, feeding a moderation queue.

---

## Appendix: Key File Reference

```
Pulse/
├── src/app/
│   ├── page.tsx                          Server component — initial data fetch
│   ├── HomeClient.tsx                    Main client component
│   ├── data/
│   │   ├── sites.ts                      Canonical site list (static source of truth)
│   │   └── details.ts                    Rich site descriptions for detail modal
│   ├── api/
│   │   ├── badge/[id]/route.ts           SVG badge endpoint (unstable_cache)
│   │   ├── radar-stats/route.ts          Global Cloudflare stats
│   │   ├── radar-site/route.ts           Per-ASN Cloudflare data
│   │   ├── marquee/route.ts              Ticker facts
│   │   └── outages/route.ts              Outage detection
│   ├── compare/
│   │   ├── [pair]/page.tsx               Compare page (ISR 1h)
│   │   ├── [pair]/generateDynamicPair.ts Groq + compare_cache logic
│   │   ├── [pair]/ComparePageClient.tsx  Compare UI
│   │   └── data/pairs.ts                 Hand-crafted compare pairs
│   ├── top-sites/
│   │   ├── [country]/page.tsx            Country page (ISR 24h)
│   │   ├── [country]/CountryPageClient.tsx Country UI
│   │   └── data/
│   │       ├── countries.ts              24 hand-crafted + merge logic
│   │       └── countries.generated.ts    91 auto-generated (npm run generate:countries)
│   ├── report/
│   │   └── [week]/page.tsx               Weekly report (weekly_snapshots)
│   └── components/
│       ├── DashboardConsole.tsx          Controls + sync status pill
│       ├── SiteGrid.tsx                  Site card grid
│       └── AnalyticsPanel.tsx            Stats panel
├── scripts/
│   ├── pulse_engine/
│   │   ├── run_engine.py                 PTI engine orchestrator
│   │   ├── signals.py                    Data collection
│   │   ├── pti_model.py                  Scoring model
│   │   ├── auto_tuner.py                 ML weight tuning
│   │   └── validation.py                Anomaly detection
│   ├── generate-countries.ts             Country page generator
│   └── generate-seed-sql.js              SQL seed generator
├── supabase_setup.sql                    Full DB schema + seed data
├── supabase_migration_new_tables.sql     Latest migration (idempotent)
└── DOCS.md                               This file
```
