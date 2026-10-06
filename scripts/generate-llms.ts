import fs from 'fs';
import path from 'path';
import { SITES, CATEGORIES } from '../src/app/data/sites';

const root = path.resolve(__dirname, '..');

const header = `# Pulse - Comprehensive Platform Documentation

> The transparent, model-driven index of global web traffic, visitor velocities, and digital platform momentum.

Website: https://www.pulstraffic.com
Version: Pulse Traffic Index (PTI v1.2)
Monitored Catalog: 137 Top Global Web Domains

---

## 1. System Overview

Pulse (https://www.pulstraffic.com) tracks estimated global web traffic, visitor request rates (requests per second), and digital momentum for the world's most visited internet destinations. Rather than relying on intrusive consumer browser panels or third-party web scraping, Pulse utilizes a reproducible statistical and AI engine called the Pulse Traffic Index (PTI v1.2).

### Core Signals
1. Cloudflare Radar: Real-time DNS query velocity from Cloudflare 1.1.1.1 network telemetry.
2. Tranco Top Sites: Aggregated daily top ranking list combining Cisco Umbrella, Majestic, Farsight, and Google Chrome User Experience (CrUX) data.
3. Open PageRank: Logarithmic backlink authority score (0 to 10) validating structural domain presence.
4. Groq AI Momentum: Llama 3.3 70B contextual trend classification assigning dynamic momentum states (Surging, Growing, Stable, Cooling) weekly.
5. Google CrUX Core Web Vitals: Largest Contentful Paint (LCP), First Input Delay (FID), Cumulative Layout Shift (CLS), and Interaction to Next Paint (INP).

---

## 2. Mathematical Methodology and Rate Physics

### Traffic Estimation Formula
Base traffic estimation follows a Zipf power law anchored to verified macro traffic nodes (Google approximately 85 billion monthly visits):
- Base Monthly Visits = 85,000,000,000 / (Rank ^ 1.3)
- Authority Factor = 0.85 + (PageRank / 10.0) * 0.30
- Category Multipliers: Streaming (1.45x), Social Media (0.55x), Developer Tools (0.65x)
- Visit Velocity = Daily Visits / 86,400 seconds
- Exponential Smoothing Filter: (0.85 * Rate_prev) + (0.15 * Rate_new)

### Tiered Empirical Validation and Confidence Bounds
- Tier 1 (High Confidence, Ranks 1 to 15): Plus/minus 8% to 12% error margin. Verified against quarterly SEC filings, Wikimedia foundation server logs, and high-density Cloudflare Radar DNS telemetry.
- Tier 2 (Moderate Confidence, Ranks 16 to 50): Plus/minus 18% to 24% error margin. Stabilized by daily Tranco rankings and Open PageRank link authority.
- Tier 3 (Modeled Velocity, Ranks 51 to 137): Plus/minus 30% to 35% error margin. Growth-stage domains and developer platforms estimated through algorithmic backlink modeling and AI momentum vectors.

---

## 3. Monitored Categories

${CATEGORIES.filter(c => c.id !== 'all').map(c => `- ${c.label} (ID: ${c.id})`).join('\n')}

---

## 4. Complete Catalog of Monitored Domains (137 Websites)

| Rank | Name | Domain | Category | Monthly Baseline | Visit Velocity (req/s) |
|---|---|---|---|---|---|
${SITES.map(s => `| ${s.rank} | ${s.name} | ${s.url} | ${s.category} | ${s.baseline} | ${s.rate.toLocaleString()} |`).join('\n')}

---

## 5. Public APIs and Feeds

### Site Enrichment API
- Endpoint: GET https://www.pulstraffic.com/api/site-enrichment?domain={domain}
- Response: Core Web Vitals (CrUX), 30-day Wikipedia pageview history, and TLS / HSTS / DNSSEC security audit.

### Outage Monitoring API
- Endpoint: GET https://www.pulstraffic.com/api/outages
- Response: Active and resolved internet service disruptions, affected ASNs, and incident severity.

### Domain Traffic Estimator
- Endpoint: POST https://www.pulstraffic.com/api/estimate-domain
- Response: Algorithmic traffic projection for arbitrary custom web domains using Open PageRank and category regression.

### Search Engine Sitemap
- Location: https://www.pulstraffic.com/sitemap.xml
- Index: 700+ canonical routes covering site profiles, comparisons, country hubs, and weekly intelligence reports.

---

## 6. Ecosystem & AI Search Observability

### CiteRoute Platform
- URL: https://www.citeroute.com
- Description: Autonomous agent observability and Generative Engine Optimization (GEO) platform measuring entity citations across ChatGPT, Perplexity, Claude, and Gemini with machine-readable agent.json protocols.
`;

fs.writeFileSync(path.join(root, 'public', 'llms-full.txt'), header, 'utf8');
console.log('Successfully generated public/llms-full.txt with 137 sites.');
