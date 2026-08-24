import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_COUNT } from '../data/sites';

export const metadata: Metadata = {
  title: 'About Pulse - Transparent Web Traffic Index | Pulse',
  description:
    'Learn about Pulse Traffic Index (PTI): a transparent, model-driven statistical estimate of global web traffic. Built with Cloudflare Radar, Tranco, Open PageRank, and Groq AI.',
  alternates: {
    canonical: 'https://www.pulstraffic.com/about',
  },
  openGraph: {
    title: 'About Pulse - Transparent Web Traffic Index',
    description:
      'Pulse is a transparent, model-driven index of global web traffic. We publish our formula, our error margins, and our data sources openly.',
    url: 'https://www.pulstraffic.com/about',
    siteName: 'Pulse',
    type: 'website',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Pulse Traffic Index',
    url: 'https://www.pulstraffic.com/about',
    description:
      'Pulse is a transparent statistical model estimating global web traffic for the top websites. Covering ' + SITE_COUNT + ' domains including Google, YouTube, Meta, Amazon and more.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Pulse',
      url: 'https://www.pulstraffic.com',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'tuyishime1angel@gmail.com',
        contactType: 'customer support',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center justify-start p-6 sm:p-12 pt-16">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 15% 20%, rgba(0,71,171,0.15) 0%, transparent 55%),
                         radial-gradient(ellipse at 85% 80%, rgba(130,200,229,0.08) 0%, transparent 50%)`,
          }}
        />
        <div className="relative z-10 w-full max-w-3xl">
          <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-8">
            <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
            <span>/</span>
            <span className="text-white">About</span>
          </nav>
          <div className="border border-white/10 rounded-3xl bg-white/[0.02] p-8 sm:p-12 shadow-2xl space-y-10">
            <div className="border-b border-white/10 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#82c8e5] animate-pulse" />
                <span className="text-xs font-bold text-[#82c8e5] uppercase tracking-widest">
                  Pulse Traffic Index&trade; &middot; PTI v1.2
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">About Pulse</h1>
              <p className="text-[#94a3b8] text-base leading-relaxed max-w-2xl">
                Pulse is a <strong className="text-white">transparent, model-driven index</strong> of global web traffic.
                We estimate monthly visits, per-second visitor velocity, and momentum trends for the world&apos;s top {SITE_COUNT}+ websites
                &mdash; and we publish exactly how we do it.
              </p>
            </div>
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white">What Pulse Is</h2>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                Pulse is not a real-time server tap. No one outside of Google, Meta, or Amazon has access to their private server
                logs. What Pulse provides instead is something arguably more valuable: a <em>transparent</em> statistical model
                that shows its work. You can read the exact formula, the data sources, the error margins, and the assumptions
                on the{' '}
                <Link href="/methodology" className="text-[#82c8e5] underline hover:text-white transition-colors">
                  methodology page
                </Link>.
              </p>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                Platforms like Similarweb and SemRush provide traffic estimates too &mdash; they just don&apos;t tell you how. Pulse does.
              </p>
            </section>
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white">How It Works</h2>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                The Pulse Traffic Index (PTI v1.2) fuses three independent data signals:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { label: 'Cloudflare Radar + Tranco', desc: 'Real-time DNS query mass analytics combined with the Tranco global ranking list (Cisco Umbrella, Majestic, Farsight, Google CrUX).', color: '#f59e0b' },
                  { label: 'Open PageRank', desc: 'A logarithmic backlink authority score (0-10) used to weight traffic estimates by domain authority.', color: '#4285F4' },
                  { label: 'Groq AI Momentum', desc: `Llama 3.3 70B assigns momentum labels (Surging, Growing, Stable, Cooling) across all ${SITE_COUNT}+ tracked domains weekly.`, color: '#10a37f' },
                ] as const).map((s) => (
                  <div key={s.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.label}</div>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                These signals feed a Zipf-law power model anchored at Google &asymp; 85 billion monthly visits, scaled by category multipliers and authority weights.{' '}
                <Link href="/methodology" className="text-[#82c8e5] underline hover:text-white transition-colors">Full formula &rarr;</Link>
              </p>
            </section>
            <section className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">&#9888;</span>
                <h2 className="text-base font-bold text-white">Accuracy &amp; Error Margin</h2>
              </div>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                Across benchmark sites where public ground-truth exists (Wikimedia Foundation server logs, SEC quarterly filings,
                corporate press releases), PTI maintains a{' '}
                <strong className="text-white">mean error margin of ~34.6%</strong>. That sounds large &mdash; but commercial
                platforms like Similarweb report their own margin in the 30&ndash;40% range for most domains.
                Traffic estimation without server access is inherently approximate.
              </p>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                The difference is that we tell you the number. Our estimates are best used for <strong className="text-white">relative comparisons</strong> (Google vs YouTube vs ChatGPT) rather than precise absolute counts.
              </p>
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">What Pulse Is Not</h2>
              <ul className="space-y-2 text-sm text-[#cbd5e1]">
                {[
                  "A real-time server monitor (we cannot see inside Google's data centres)",
                  "A replacement for Google Analytics or first-party analytics for your own site",
                  "Affiliated with Cloudflare, Tranco, Open PageRank, or Groq in any way",
                  "Capable of tracking private apps, paywalled content, or mobile-only platforms accurately",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5 flex-shrink-0">&#x2715;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="space-y-3 border-t border-white/10 pt-8">
              <h2 className="text-lg font-bold text-white">Contact</h2>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                For questions, feedback, data corrections, or partnership enquiries, reach out directly:
              </p>
              <a
                href="mailto:tuyishime1angel@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#82c8e5]/10 border border-[#82c8e5]/20 hover:bg-[#82c8e5]/20 text-[#82c8e5] font-semibold text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                tuyishime1angel@gmail.com
              </a>
            </section>
            <div className="border-t border-white/10 pt-6 flex flex-wrap gap-4 text-xs text-[#6d8196]">
              <Link href="/methodology" className="hover:text-white transition-colors">Data &amp; Methodology</Link>
              <Link href="/" className="hover:text-white transition-colors">&larr; Back to Dashboard</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
