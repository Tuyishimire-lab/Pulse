import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data & Methodology Disclaimer | Pulse',
  description: 'Learn how Pulse calculates real-time web traffic, visit rates, and country rankings using statistical modeling.',
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Data &amp; Methodology Disclaimer</h1>
            <p className="text-xs text-[#82c8e5] mt-1 font-semibold uppercase tracking-wider">Pulse Traffic Visualizer</p>
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
            <h2 className="text-base font-bold text-white">1. Statistical Physics Modeling</h2>
            <p>
              Pulse metrics are statistical physics models derived from public panel benchmarks, Cloudflare Radar network telemetry, and published 2026 industry research (Semrush &amp; Similarweb average estimates).
            </p>
            <p>
              Pulse data is not a direct server tap into internal corporate load balancers. No third-party platform on the internet has access to private internal server logs of third-party companies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Per-Second Ticker Rate Physics</h2>
            <p>
              Live visitor counters on Pulse represent high-precision mathematical rate calculations designed to illustrate global visit velocity and platform scale in real time:
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-[#82c8e5] space-y-1">
              <div>Visits Per Second (Rate) = Monthly Baseline Visits / 2,628,000 seconds</div>
              <div className="text-white/60">Example: Google = 92.5 Billion / 2.628M = ~35,198 visits / sec</div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Network Telemetry Integration</h2>
            <p>
              Country rankings and network disturbance badges are updated via Cloudflare Radar API endpoints to reflect real-world internet outage events, DNS shifts, and regional traffic velocity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Industry Context</h2>
            <p>
              Similar to public web estimation platforms (Similarweb, Worldometer, Statista), Pulse provides probabilistic statistical visualization. Use of company names and logos is strictly for identification and educational visualization.
            </p>
          </section>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-[#6d8196]">
          Last updated: August 2026 · www.pulstraffic.com
        </div>
      </div>
    </div>
  );
}
