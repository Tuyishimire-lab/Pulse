# ⚡ Pulse - Live Global Web Traffic Intelligence Platform

**Pulse** is a proprietary, real-time web traffic visualizer, analytics platform, and intelligence engine. Powered by the **Pulse Traffic Index™ (PTI v1.2)**, Pulse fuses network DNS telemetry, link authority, search intent, and AI sentiment analysis to track visitor velocity across top global domains.

![Pulse Badge Example](https://www.pulstraffic.com/api/badge/google)

---

## ✨ Features & Capabilities

- ⏱️ **Live Visitor Ticker Physics:** Calculates real-time visits-per-second velocity based on global traffic baselines.
- 🧠 **Pulse Traffic Index (PTI v1.2):** A multi-signal Python ensemble engine combining Cloudflare Radar DNS query mass, Tranco Top-5000 multi-source ranks, Open PageRank link authority, and Groq AI (Llama 3.3 70B) momentum.
- ⚔️ **Programmatic Comparison Engine (`/compare/[pair]`):** Over 400+ side-by-side comparative analysis pages for rival web platforms (e.g. YouTube vs. TikTok, ChatGPT vs. Claude, Google vs. Bing).
- 🧩 **Embeddable Live Traffic Widgets (`/embed/[id]`):** Zero-friction, responsive `<iframe>` widgets for third-party blogs and websites featuring real-time tickers, rank badges, and dark/light themes.
- 🏷️ **Dynamic SVG Badges (`/api/badge/[id]`):** High-DPI Shields.io-style SVG badges for startup landing pages, documentation, and GitHub READMEs.
- 🌍 **Geographic Rankings (`/top-sites/[country]`):** Country-specific traffic rankings across 115+ countries.
- 📊 **AI-Powered Weekly Reports (`/report/[week]`):** Weekly digests synthesizing market shifts and rank volatility using Groq AI.
- 📢 **Social Sharing & Virality (`SocialShareBar`):** Instant pre-formatted statistical hooks for X/Twitter, Reddit, and LinkedIn.
- 🤖 **Automated Social Digest Bot (`scripts/social_bot.py`):** Automated weekly X/Twitter traffic shift posts.

---

## 🎨 Embeddable Widgets & Badges

Site owners, founders, bloggers, and maintainers can easily embed live Pulse Traffic statistics:

### 1. 🧩 Interactive Iframe Widget (Card View)
```html
<iframe 
  src="https://www.pulstraffic.com/embed/chatgpt?theme=dark&compact=false" 
  width="360" 
  height="200" 
  frameborder="0" 
  scrolling="no" 
  style="border-radius: 12px; overflow: hidden; border: none;"
  title="ChatGPT Live Traffic by Pulse">
</iframe>
```

### 2. ⚡ Compact Live Badge (Iframe)
```html
<iframe 
  src="https://www.pulstraffic.com/embed/chatgpt?theme=dark&compact=true" 
  width="280" 
  height="52" 
  frameborder="0" 
  scrolling="no" 
  style="border-radius: 8px; overflow: hidden; border: none;"
  title="ChatGPT Traffic Badge">
</iframe>
```

### 3. 📝 Markdown SVG Badge (GitHub READMEs & Blogs)
```markdown
[![Pulse Traffic Index](https://www.pulstraffic.com/api/badge/chatgpt)](https://www.pulstraffic.com/sites/chatgpt)
```

---

## 🧠 Pulse Traffic Index (PTI v1.2) Architecture

The Python engine operates across 4 core data signals:

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT SIGNALS                        │
├─────────────────────────────────────────────────────────┤
│  Signal 1a: Cloudflare Radar (Top 100 DNS Query Ranks)  │
│  Signal 1b: Tranco List (Top 5000 Multi-Source Ranks)   │
│  Signal 2 : Open PageRank (Logarithmic Link Authority)  │
│  Signal 3 : Category Density Multipliers (Cm)           │
│  Signal 4 : Groq AI (Llama 3.3 70B Momentum Analysis)  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ Python PTI Model (Ensemble) │
              └──────────────┬──────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    MODEL OUTPUTS                        │
├─────────────────────────────────────────────────────────┤
│  1. Calibrated Monthly & Daily Traffic Estimates        │
│  2. Normalized PTI Score (0.0 to 100.0)                 │
│  3. Historical Rate Smoothing (85/15 Exponential Filter) │
│  4. Self-Auditing Benchmark Validation Suite (25 sites) │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and `npm`
- Python 3.10+ (for the Python PTI engine)

### 1. Installation
```bash
git clone https://github.com/Tuyishimire-lab/Pulse.git
cd Pulse
npm install
pip install httpx supabase python-dotenv
```

### 2. Environment Setup
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENPAGERANK_API_KEY=your_openpagerank_key
KEYWORDSEVERYWHERE_API_KEY=your_keywordseverywhere_key
CLOUDFLARE_API_TOKEN=your_cloudflare_token
GROQ_API_KEY=your_groq_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Running the Python PTI Engine

To manually trigger the Python data pipeline and run the 25-domain ground-truth accuracy validation suite:

```bash
python scripts/pulse_engine/run_engine.py
```

### Automation via GitHub Actions
The repository includes an automated workflow (`.github/workflows/pulse_engine.yml`) that executes the PTI engine in the cloud **every 6 hours**.

---

## 📄 License & Legal Disclaimer

- **Data Methodology:** All metrics displayed on Pulse are probabilistic statistical estimations calculated via the Pulse Traffic Index (PTI v1.2). See [/methodology](https://www.pulstraffic.com/methodology) for full disclosures.
- **Trademarks:** Company names, domain URLs, and brand logos belong to their respective owners and are used strictly for identification and educational visualization.
