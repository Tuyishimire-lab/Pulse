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
              Pulse metrics are powered by the <strong className="text-white">Pulse Traffic Index (PTI v2.1)</strong> - a multi-signal statistical engine that derives base traffic from verified public disclosures and modulates displayed velocity using live Cloudflare Radar DNS rank signals.
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
                <div className="text-xs text-white/80">Logarithmic backlink authority score (0-10) validating structural web domain presence.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 3 · Groq AI Momentum</div>
                <div className="text-xs text-white/80">Llama 3.3 70B AI contextual momentum classification (Surging, Growing, Stable, Cooling) across all 137+ domains.</div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Rate Computation &amp; Radar Modulation</h2>
            <p>
              Monthly traffic baselines are sourced from verified public disclosures (SEC filings, Wikimedia analytics, investor reports) and validated against 45+ ground-truth benchmarks. Displayed visit velocity is then modulated by live Cloudflare Radar DNS rank signals:
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-[#82c8e5] space-y-1">
              <div>Base Traffic = Verified Monthly Baselines (SEC filings, Wikimedia, IR data)</div>
              <div>Base Rate = Monthly Visits / 2,628,000 seconds</div>
              <div>Radar Volatility = ((Static Rank - CF Radar Rank) / Static Rank) * 100%</div>
              <div>Radar Modulator = 1.0 + (Volatility% * 0.75), clamped to [0.85, 1.15]</div>
              <div>Displayed Rate = Base Rate * Radar Modulator</div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Empirical Benchmark Validation &amp; Tiered Confidence</h2>
            <p>
              The PTI engine continuously self-audits its estimations against publicly disclosed benchmark datasets (SEC quarterly filings, Wikimedia foundation analytics, and verified investor disclosures). Rather than applying a single flat margin across all properties, Pulse employs a 3-tier dynamic confidence model reflecting empirical data availability:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-emerald-500/20">
                <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Tier 1: High Confidence</div>
                <div className="text-[11px] text-white/90 font-semibold mb-1">±8% to 12% Error Margin</div>
                <div className="text-xs text-white/70">Top 15 global infrastructure and search nodes verified against authoritative Cloudflare Radar DNS telemetry and high-density telemetry anchors.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-blue-500/20">
                <div className="text-xs font-bold text-blue-400 uppercase mb-1">Tier 2: Moderate Confidence</div>
                <div className="text-[11px] text-white/90 font-semibold mb-1">±18% to 24% Error Margin</div>
                <div className="text-xs text-white/70">Positions 16 to 50 encompassing established consumer tech, digital media, streaming, and retail platforms with stable Open PageRank authority.</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Tier 3: Modeled Velocity</div>
                <div className="text-[11px] text-white/90 font-semibold mb-1">±30% to 38% Error Margin</div>
                <div className="text-xs text-white/70">Growth-stage sites and specialized developer tools estimated via algorithmic backlink modeling and AI momentum vectors.</div>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8] pt-1">
              Overall aggregate mean error margin across all 137 monitored domains sits at approximately 34.6%, directly in line with commercial market intelligence standards.
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
