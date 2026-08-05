import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pulse Traffic Index (PTI) Methodology | Pulse',
  description: 'Discover how the Pulse Traffic Index (PTI) multi-signal Python & AI engine estimates global web traffic, domain authority, and real-time visitor velocity.',
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pulse Traffic Index (PTI) Methodology</h1>
            <p className="text-xs text-[#82c8e5] mt-1 font-semibold uppercase tracking-wider">Multi-Signal AI &amp; Python Statistical Model v1.0</p>
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
            <h2 className="text-base font-bold text-white">1. Overview of the Pulse Traffic Index (PTI)</h2>
            <p>
              Pulse utilizes a proprietary multi-signal Python engine called the <strong className="text-white">Pulse Traffic Index (PTI)</strong>. PTI combines real-time network DNS telemetry, global link authority metrics, and AI momentum analysis to produce reliable estimates of domain popularity and traffic velocity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. The 4 Core Signals of PTI</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 1 · Cloudflare Radar</div>
                <div className="text-xs text-white/80">Real-time DNS query volume rankings from 1.1.1.1 network telemetry.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 2 · Open PageRank</div>
                <div className="text-xs text-white/80">Logarithmic backlink authority score ensuring domain structural validity.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 3 · Search Intent</div>
                <div className="text-xs text-white/80">Search volume and keyword density via Keywords Everywhere &amp; Google Suggest.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs font-bold text-[#82c8e5] uppercase mb-1">Signal 4 · Groq AI Momentum</div>
                <div className="text-xs text-white/80">AI sentiment and trend classification (Surging, Growing, Stable, Cooling).</div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Mathematical Power Law &amp; Rate Physics</h2>
            <p>
              Traffic estimation follows a Zipf-like power law calibrated against public benchmark anchors (e.g. Google ~85B monthly visits):
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-[#82c8e5] space-y-1">
              <div>Monthly Visits = Anchor Monthly / (Cloudflare Rank ^ 1.1)</div>
              <div>Per-Second Visit Rate = Daily Visits / 86,400 seconds</div>
              <div>PTI Score = Max(1.0, 100 - 15 * log10(Rank))</div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Independent Transparency</h2>
            <p>
              Pulse metrics are probabilistic statistical models. No third-party analytics platform has direct access to private corporate server load balancers. Pulse metrics provide independent, transparent comparative insights across the web ecosystem.
            </p>
          </section>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-[#6d8196]">
          Last updated: August 2026 · Pulse Traffic Index v1.0 · www.pulstraffic.com
        </div>
      </div>
    </div>
  );
}
