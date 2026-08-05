import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Pulse',
  description: 'Terms of Service and legal agreements for using Pulse global web traffic visualizer.',
  alternates: {
    canonical: 'https://www.pulstraffic.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center justify-between p-6 sm:p-12">
      <div className="w-full max-w-3xl border border-white/10 rounded-3xl bg-white/[0.02] p-8 sm:p-12 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Terms of Service</h1>
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
            <h2 className="text-base font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using Pulse (available at pulstraffic.com and www.pulstraffic.com), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Pulse Traffic Index (PTI) Disclaimer</h2>
            <p>
              Pulse metrics, live visitor counters, and country rankings are probabilistic statistical estimations calculated via the <strong className="text-white">Pulse Traffic Index (PTI v1.2)</strong>. PTI combines public network telemetry (Cloudflare Radar, Tranco List, Open PageRank) and Groq AI contextual momentum analysis.
            </p>
            <p>
              Pulse data is not a direct server tap into internal corporate load balancers. No third-party platform on the internet has access to private internal server logs of third-party companies. Like Similarweb, Worldometer, or Statista, Pulse utilizes statistical modeling and real-time rate physics to visualize global web scale.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Intellectual Property &amp; Trademarks</h2>
            <p>
              Company brand names, domain URLs, product names, and registered trademarks displayed on Pulse belong to their respective owners. Use of company names, logos, and brand colors is strictly for identification, news reporting, and educational visualization purposes only, and does not imply endorsement or affiliation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Limitations of Liability</h2>
            <p>
              Under no circumstances shall Pulse or its maintainers be liable for any direct, indirect, incidental, or consequential business or financial decisions made based on the estimations shown on this dashboard. Data is provided &quot;as is&quot; without warranties of any kind.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">5. Revisions and Modifications</h2>
            <p>
              Pulse may revise these terms and methodology parameters at any time without prior notice. By continuing to use this website, you are agreeing to be bound by the current version of these Terms of Service.
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
