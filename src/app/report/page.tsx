import { Metadata } from 'next';
import Link from 'next/link';
import NavHeader from '../components/NavHeader';
import { getReportSummaries, ReportArchiveItem } from './data/reportGenerator';
import { SITE_COUNT } from '../data/sites';

export const revalidate = 3600; // ISR hourly to pick up new snapshots

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: 'Weekly Internet Reports Archive | Pulse',
  description: `Browse weekly intelligence reports on global web traffic trends, outage summaries, AI vs. traditional search convergence, and the top ${SITE_COUNT} websites.`,
  alternates: { canonical: `${BASE_URL}/report` },
  openGraph: {
    title: 'Weekly Internet Reports Archive | Pulse',
    description: `Chronological archive of global web traffic reports, outage analyses, and AI platform growth statistics across ${SITE_COUNT} tracked sites.`,
    url: `${BASE_URL}/report`,
    siteName: 'Pulse',
    type: 'website',
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekly Internet Reports Archive | Pulse',
    description: `Chronological archive of global web traffic reports, outage analyses, and AI platform growth statistics.`,
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default async function ReportArchivePage() {
  const reports: ReportArchiveItem[] = await getReportSummaries(24);
  const latest = reports[0];
  const pastReports = reports.slice(1);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Pulse Weekly Internet Reports Archive',
    description: `Chronological archive of global web traffic reports, outage analyses, and AI platform growth statistics.`,
    url: `${BASE_URL}/report`,
    publisher: {
      '@type': 'Organization',
      name: 'Pulse',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon.png` },
    },
    hasPart: reports.map((r) => ({
      '@type': 'Article',
      headline: r.headline,
      url: `${BASE_URL}/report/${r.slug}`,
      datePublished: r.publishedDate,
    })),
  };

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      <NavHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#8ea1b4] mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Weekly Reports</span>
          <span>/</span>
          <span className="text-white">Archive</span>
        </nav>

        {/* Hero */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-[#82c8e5] bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Pulse Intelligence Archive
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Weekly Internet Reports
          </h1>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-3xl leading-relaxed">
            Data-driven editorial digests tracking aggregate global web traffic velocity, internet health scores, AI search substitution rates, and the top {SITE_COUNT} digital platforms.
          </p>
        </header>

        {/* Featured Latest Edition */}
        {latest && (
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-[#82c8e5]/30 bg-gradient-to-br from-[#0c1220] via-[#070b14] to-[#04060c] p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#82c8e5]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    ● Latest Edition
                  </span>
                  <span className="text-xs font-semibold text-[#8ea1b4]">
                    {new Date(latest.publishedDate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#8ea1b4]">Health Score:</span>
                  <span
                    className="font-bold px-2.5 py-0.5 rounded-full border text-[11px]"
                    style={{
                      color: latest.healthScore >= 85 ? '#10b981' : latest.healthScore >= 70 ? '#38bdf8' : '#fb923c',
                      borderColor: (latest.healthScore >= 85 ? '#10b981' : latest.healthScore >= 70 ? '#38bdf8' : '#fb923c') + '44',
                      backgroundColor: (latest.healthScore >= 85 ? '#10b981' : latest.healthScore >= 70 ? '#38bdf8' : '#fb923c') + '15',
                    }}
                  >
                    {latest.healthScore} / 100
                  </span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                {latest.headline}
              </h2>
              <p className="text-sm sm:text-base text-[#94a3b8] mb-6 max-w-2xl">
                {latest.subheadline}
              </p>

              {latest.leadStoryTitle && (
                <div className="mb-6 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="text-[10px] font-bold text-[#82c8e5] uppercase tracking-wider mb-1">
                    Featured Lead Story
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {latest.leadStoryTitle}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-4 text-xs text-[#8ea1b4]">
                  <div>
                    Tracked Traffic: <strong className="text-white font-mono">{latest.totalRate.toLocaleString()}/s</strong>
                  </div>
                  <div>
                    Incidents: <strong className="text-white">{latest.outageCount}</strong>
                  </div>
                </div>
                <Link
                  href={`/report/${latest.slug}`}
                  className="inline-flex items-center gap-2 bg-[#82c8e5] text-[#02020a] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#a0dbf2] transition-colors shadow-lg shadow-[#82c8e5]/20"
                >
                  Read Full Report &rarr;
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Historical Reports Archive */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Historical Editions ({reports.length})
            </h2>
            <span className="text-xs text-[#8ea1b4]">Updated every Monday</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastReports.map((report) => {
              const pubDate = new Date(report.publishedDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });

              return (
                <Link
                  key={report.slug}
                  href={`/report/${report.slug}`}
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-white/[0.08] bg-[#070b14] hover:bg-[#0c1220] hover:border-white/20 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-[#82c8e5] bg-[#82c8e5]/10 px-2.5 py-0.5 rounded-full border border-[#82c8e5]/20">
                        Week {report.weekNumber}, {report.year}
                      </span>
                      <span className="text-[11px] text-[#8ea1b4]">{pubDate}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#82c8e5] transition-colors mb-2 leading-snug">
                      {report.headline}
                    </h3>
                    <p className="text-xs text-[#94a3b8] line-clamp-2 leading-relaxed mb-4">
                      {report.subheadline}
                    </p>

                    {report.leadStoryTitle && (
                      <div className="text-xs text-[#8ea1b4] line-clamp-1 mb-3">
                        <strong className="text-white/80">Story:</strong> {report.leadStoryTitle}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-[#8ea1b4]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white/90">{report.totalRate.toLocaleString()}/s</span>
                      <span
                        className="font-semibold text-[10px] px-2 py-0.5 rounded border"
                        style={{
                          color: report.healthScore >= 85 ? '#10b981' : report.healthScore >= 70 ? '#38bdf8' : '#fb923c',
                          borderColor: (report.healthScore >= 85 ? '#10b981' : report.healthScore >= 70 ? '#38bdf8' : '#fb923c') + '33',
                          backgroundColor: (report.healthScore >= 85 ? '#10b981' : report.healthScore >= 70 ? '#38bdf8' : '#fb923c') + '10',
                        }}
                      >
                        {report.healthScore}/100
                      </span>
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform text-[#82c8e5] font-semibold text-xs">
                      View Report &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
