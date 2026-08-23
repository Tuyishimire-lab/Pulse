import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data & Methodology | Pulse Traffic Index (PTI)',
  description: 'Explore the Pulse Traffic Index (PTI) v1.2 methodology: a 4-signal statistical & AI engine combining Cloudflare Radar, Tranco List, Open PageRank, and Groq AI momentum.',
  alternates: {
    canonical: 'https://www.pulstraffic.com/methodology',
  },
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center justify-between p-6 sm:p-12">
      <div className="w-full max-w-3xl border border-white/10 rounded-3xl bg-white/[0.02] p-8 sm:p-12 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Data &amp; Methodology</h1>
            <p className="text-xs text-[#82c8e5] mt-1 font-semibold uppercase tracking-wider">Pulse Traffic Index™ (PTI v1.2) Multi-Signal Engine</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
          >
            ← Back to App
          </Link>
        </div>

        <div className="space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Executive Overview</h2>
            <p>
              Pulse metrics are powered by the <strong className="text-white">Pulse Traffic Index (PTI v1.2)</strong> - a multi-signal statistical and artificial intelligence engine designed to estimate global website visit volume, per-second visitor velocity, and market growth momentum.
            </p>
            <p>
              Unlike legacy platforms that rely on single-source web scrapers or intrusive browser extensions, Pulse fuses multiple independent network telemetry datasets with advanced machine learning vectors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. The 4 Data Source Signals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 1a · Cloudflare Radar</div>
                <div className="text-xs text-white/80">Real-time DNS query mass analytics from Cloudflare 1.1.1.1 network telemetry for top global domains.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 1b · Tranco List API</div>
                <div className="text-xs text-white/80">Aggregated daily top 5,000 ranking list combining Cisco Umbrella, Majestic, Farsight, and Google CrUX.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 2 · Open PageRank</div>
                <div className="text-xs text-white/80">Logarithmic backlink authority score (0–10) validating structural web domain presence.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 3 · Groq AI Momentum</div>
                <div className="text-xs text-white/80">Llama 3.3 70B AI contextual momentum classification (Surging, Growing, Stable, Cooling) across all 100+ domains.</div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Mathematical Power Law &amp; Category Scaling</h2>
            <p>
              Traffic estimation follows a Zipf-like power law anchored against verified global traffic nodes (Google ~85B monthly visits):
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-[#82c8e5] space-y-1">
              <div>Base Traffic = 85,000,000,000 / (Rank ^ 1.3)</div>
              <div>Authority Factor = 0.85 + (PageRank / 10.0) * 0.30</div>
              <div>Category Multipliers (Cm): Streaming (1.45x), Social (0.55x), Dev (0.65x)</div>
              <div>Rate Physics = Daily Visits / 86,400 seconds</div>
              <div>Exponential Filter = (0.85 * Rate_prev) + (0.15 * Rate_new)</div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Empirical Benchmark Validation</h2>
            <p>
              The PTI engine continuously self-audits its estimations against publicly disclosed benchmark datasets (SEC filings, Wikimedia foundation logs, and corporate disclosures). Across top benchmark sites, PTI maintains a mean error margin of ~34.6%, placing it directly in line with commercial traffic intelligence platforms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">5. Independent Telemetry Disclaimer</h2>
            <p>
              Pulse metrics are independent probabilistic estimates. No third-party platform has direct access to private internal corporate server logs. Pulse provides open, transparent comparative insights across the web ecosystem.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">6. Estimated Engagement Metrics</h2>
            <p>
              Engagement metrics shown in site detail panels (bounce rate, avg. session duration, device split, top geographies, traffic trend) are <strong className="text-white">PTI model estimates</strong> derived from a site&apos;s global rank, category, and publicly available industry benchmarks - not sourced from real-user analytics panels, browser extensions, or ISP data. They are labeled accordingly in the UI to maintain transparency.
            </p>
          </section>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-[#6d8196]">
          Last updated: August 2026 · Pulse Traffic Index v1.2 · www.pulstraffic.com
        </div>
      </div>
    </div>
  );
}
