# Pulse - Project Documentation

> **Living document.** Updated after every significant change to the codebase.
> Last updated: 2026-08-15

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

**Pulse** is a real-time web traffic intelligence platform that tracks, ranks, and compares global website traffic. It shows live visitor counters, PTI (Pulse Traffic Index) scores, country-level rankings, weekly reports, embeddable traffic widgets, and comparison pages for any two sites.

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
│                                                         │
│  /embed/[id] (Standalone Iframe Route)                  │
│    └─ Lightweight live visitor widget & badges          │
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

---

## 4. Database Schema (Supabase)

### `public.sites`
Core site data. Updated by the PTI engine every 6 hours.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Slug (e.g. `google`, `youtube`) |
| `name` | TEXT | Display name |
| `url` | TEXT | Destination URL |
| `category` | TEXT | Primary taxonomy category |
| `rank` | INTEGER | Global PTI rank |
| `baseline` | TEXT | Human-readable monthly visits |
| `baseline_raw` | BIGINT | Exact numeric monthly visits |
| `rate` | REAL | Live visits per second velocity |
| `color` | TEXT | Brand accent hex color |
| `glow` | TEXT | Brand glow RGBA string |
| `updated_at` | TIMESTAMPTZ | Last synced timestamp |

---

## 7. Pages & Routes

| Route | Type | Description |
|---|---|---|
| `/` | Server + Client | Main dashboard - live site grid |
| `/sites/[id]` | Dynamic (ISR) | Individual site detail page with live metrics & share/embed bar |
| `/compare/[pair]` | Dynamic (SSG / ISR 1h) | Two-site traffic comparison with AI FAQs & share bar (400+ static pairs) |
| `/embed/[id]` | Dynamic | Standalone iframe embeddable live traffic card / compact badge |
| `/top-sites/[country]` | Static + ISR | Country-specific rankings (115 countries) |
| `/report/[week]` | Dynamic | Weekly traffic report (from weekly_snapshots) |
| `/methodology` | Static | PTI scoring methodology explained |
| `/privacy` | Static | Privacy policy |
| `/terms` | Static | Terms of service |

### Static Params Coverage
- **Compare pairs:** 400+ programmatic category and global competitor pairings
- **Country pages:** 24 hand-crafted + 91 generated = **115 total**
- **Total Static / SSG Pre-rendered Pages:** **650+ routes**

---

## 8. API Routes

| Endpoint | Cache | Description |
|---|---|---|
| `GET /api/badge/[id]` | 1 hour | Dynamic SVG badge with live Pulse rank + baseline visits |
| `GET /api/radar-stats` | 5min | Global Cloudflare Radar summary |
| `GET /api/radar-site?asn=` | 1h | Per-ASN geo + device + traffic data |
| `GET /api/marquee?location=` | 60s | Scrolling traffic facts banner |
| `GET /api/outages` | 60s | Detected site outages |
| `GET /api/sync-rankings` | no-cache | Manual trigger for rank sync |
| `POST /api/cron` | - | GitHub Actions webhook entry point |

---

## 11. Components

### Core UI
| Component | Description |
|---|---|
| `DashboardConsole` | Top control bar - search, filters, category tabs, sync status pill |
| `SiteGrid` | Responsive grid/list of site cards with live counters |
| `AnalyticsPanel` | Expandable panel with Cloudflare Radar stats, traffic tiers, sort |
| `MarqueeBanner` | Auto-scrolling traffic facts ticker |
| `Header` | Hero section with animated tagline and page load time |
| `NavHeader` | Top navigation bar with links |
| `SiteDetailModal` | Full-screen modal with site details, ASN data, charts |
| `CompareModal` | Two-site comparison picker (client-side) |
| `SocialShareBar` | Viral sharing bar with pre-formatted statistical hooks for X/Twitter, Reddit, and LinkedIn |
| `EmbedWidgetModal` | Interactive generator and live preview modal for copying `<iframe>` and Markdown embed snippets |

---

## 12. Feature Changelog

### 2026-08-15 - Traffic Growth Engine Release
- **Embeddable Live Widgets (`/embed/[id]`):** Created isolated, lightweight `<iframe />` widget route supporting both card and compact badge formats with real-time velocity counters.
- **Dynamic SVG Badge Generator (`/api/badge/[id]`):** Created shields.io-compatible live SVG badges for GitHub READMEs and blogs with 1-hour CDN caching.
- **Programmatic SEO (pSEO) Multiplier:** Expanded competitor combinations across categories (AI, dev tools, social, search, streaming) in `pairs.ts` and `sitemap.ts`, growing static comparisons to 400+ landing pages.
- **Viral Social Share Integration:** Added `SocialShareBar` and `EmbedWidgetModal` into `ComparePageClient` and `SitePageClient` with pre-filled live statistics.
- **Production Build:** Verified cleanly with 660 pre-rendered static/SSG routes.

---

## 13. Roadmap & Future Plans

### 🔴 High Priority
- **Weekly Email Digest:** Automated subscriber emails with weekly traffic movers.
- **Trending Velocity Algorithm:** Highlight sudden traffic break-outs using 24h rolling delta from `site_history`.
- **Search Auto-Complete Enhancements:** Instant fuzzy search with quick compare shortcuts.
