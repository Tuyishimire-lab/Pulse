'use client';

import React from 'react';
import Link from 'next/link';
import { WeeklyReport } from '../data/reportGenerator';
import NavHeader from '../../components/NavHeader';
import { SITE_COUNT } from '../../data/siteCount';
import { exportWeeklyReportToCsv, exportWeeklyReportToJson } from '../../../utils/exportCsv';
import ReportSubscribeCard from '../components/ReportSubscribeCard';
import TrajectoryChartIsland from '../components/TrajectoryChartIsland';
import TopMoversHub from '../components/TopMoversHub';
import RankSparkline from '../../components/ui/RankSparkline';

interface Props {
  report: WeeklyReport;
  prevSlug: string | null;
  nextSlug: string | null;
}

function HealthMeter({ score }: { score: number }) {
  const color =
    score >= 90 ? '#10b981' :
    score >= 75 ? '#facc15' :
    score >= 60 ? '#fb923c' : '#f87171';
  const label =
    score >= 90 ? 'Excellent' :
    score >= 75 ? 'Good' :
    score >= 60 ? 'Fair' : 'Degraded';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Ring */}
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${(score / 100) * 263.9} 263.9`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white font-mono">{score}</span>
          <span className="text-[10px] text-[#8ea1b4] font-medium uppercase tracking-wider font-mono">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
      <span className="text-xs text-[#8ea1b4]">Internet Health Score</span>
    </div>
  );
}

function ReportActionsBar({ report }: { report: WeeklyReport }) {
  const [copied, setCopied] = React.useState(false);

  const reportUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/report/${report.slug}`
    : `https://www.pulstraffic.com/report/${report.slug}`;

  const xText = encodeURIComponent(
    `Week ${report.weekNumber}, ${report.year} Internet Pulse: ${report.totalTopSitesVisitsPerSec.toLocaleString()} req/s across ${SITE_COUNT} sites, health score ${report.internetHealthScore}/100. #WebTraffic #Pulse`
  );
  const xUrl = `https://x.com/intent/tweet?text=${xText}&url=${encodeURIComponent(reportUrl)}`;

  function copyLink() {
    navigator.clipboard.writeText(reportUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-4 rounded-2xl bg-[#0c1220] border border-white/[0.08] shadow-xl space-y-3">
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#8ea1b4] font-semibold">
        Report Actions &amp; Data Export
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => exportWeeklyReportToCsv(report)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-[#82c8e5]/30 text-[#82c8e5] bg-[#82c8e5]/10 hover:bg-[#82c8e5]/20 hover:border-[#82c8e5]/50 transition-all cursor-pointer flex-1 justify-center"
          title={`Download complete ${SITE_COUNT}-platform dataset in CSV format with OWASP formula injection protection`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          CSV ({SITE_COUNT} Sites)
        </button>
        <button
          onClick={() => exportWeeklyReportToJson(report)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/[0.08] text-[#8ea1b4] hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer flex-1 justify-center"
          title="Download complete structured report in JSON format"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          JSON
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#8ea1b4] hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer"
        >
          {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#94a3b8] hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
        >
          Share on X
        </a>
      </div>
    </div>
  );
}

export default function ReportPageClient({ report, prevSlug, nextSlug }: Props) {
  const publishedDate = new Date(report.publishedDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      <NavHeader />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#8ea1b4] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
          <span>/</span>
          <Link href="/report" className="text-[#82c8e5] hover:underline transition-colors">Weekly Reports</Link>
          <span>/</span>
          <span className="text-white">Week {report.weekNumber}, {report.year}</span>
        </nav>

        {/* Responsive 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Intelligence Column (68% width on desktop) */}
          <div className="lg:col-span-8 space-y-8 min-w-0">

            {/* Hero Header */}
            <header className="hero-header mb-2" data-print="header">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-bold text-[#82c8e5] bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Weekly Internet Report
                </span>
                {report.isLive && (
                  <span className="text-[9px] font-extrabold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    ● Live Data
                  </span>
                )}
                <span className="text-xs text-[#8ea1b4]">{publishedDate}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white mb-3 font-outfit">
                {report.headline}
              </h1>
              <p className="text-[#94a3b8] text-base leading-relaxed">{report.subheadline}</p>
            </header>

            {/* Quick Stats Grid */}
            <section aria-label="Quick Statistics Overview">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {report.quickStats.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/[0.08] bg-[#070b14] px-4 py-3.5 flex flex-col justify-between gap-1 min-h-[100px]"
                  >
                    {/* Label - fixed height so all values start at the same Y */}
                    <div className="min-h-[2.5rem] flex items-start">
                      <span className="text-[10px] font-bold text-[#82c8e5] uppercase tracking-widest leading-tight">
                        {stat.label}
                      </span>
                    </div>
                    {/* Value */}
                    <div
                      className={`font-extrabold text-white leading-tight tabular-nums ${
                        stat.value.length > 12 ? 'text-lg' : 'text-xl sm:text-2xl'
                      }`}
                    >
                      {stat.value}
                    </div>
                    {/* Note */}
                    <div className="text-[10px] text-[#8ea1b4] leading-tight">{stat.note}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 8-Week Historical Trajectory Chart Island with Dual Y-Axes & Inverse CTM Tracking */}
            {report.trajectory && report.trajectory.length > 1 && (
              <TrajectoryChartIsland trajectory={report.trajectory} />
            )}

            {/* Top Movers Hub Leaf Client Island (5 Tabs, Sparklines, Mobile Badges, Multi-Stage Favicons) */}
            <TopMoversHub report={report} />

            {/* Category Breakdown Table */}
            <section aria-label="Traffic by Category Breakdown">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-outfit">
                Traffic by Category
              </h2>
              <div className="rounded-2xl border border-white/[0.08] bg-[#070b14] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#8ea1b4] uppercase tracking-wider">Category</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[#8ea1b4] uppercase tracking-wider">Sites</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[#8ea1b4] uppercase tracking-wider hidden sm:table-cell">Est. Monthly</th>
                      <th className="px-5 py-3 text-xs font-semibold text-[#8ea1b4] uppercase tracking-wider hidden md:table-cell">Share</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[#8ea1b4] uppercase tracking-wider">vs Last Wk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.categoryBreakdown.map((cat, i) => (
                      <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-[#0c1220] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="font-medium text-white text-xs">{cat.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-[#94a3b8] font-mono">{cat.count}</td>
                        <td className="px-5 py-3 text-right text-xs font-semibold text-white hidden sm:table-cell font-mono">{cat.totalBaseline}</td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          {cat.sharePercent !== undefined && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, cat.sharePercent)}%`, backgroundColor: cat.color }}
                                />
                              </div>
                              <span className="text-[10px] text-[#8ea1b4] tabular-nums w-8 text-right font-mono">{cat.sharePercent.toFixed(0)}%</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-xs font-bold font-mono">
                          {cat.weekOverWeekChange !== undefined ? (
                            <span className={cat.weekOverWeekChange >= 0 ? 'text-[#10b981]' : 'text-rose-400'}>
                              {cat.weekOverWeekChange >= 0 ? '+' : ''}{cat.weekOverWeekChange.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-[#8ea1b4]">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Outage Context & Routing Telemetry */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6" aria-label="Outage Context">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <h2 className="text-base font-bold text-white font-outfit">Outage Context &amp; Routing Stability</h2>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
                {report.healthContext.incidentBreakdown}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#8ea1b4] pt-3 border-t border-white/[0.06] flex-wrap">
                <span>Aggregate Velocity: <strong className="text-white font-mono">{report.totalTopSitesVisitsPerSec.toLocaleString()} req/s</strong></span>
                <span>•</span>
                <span>Rolling Health Baseline: <strong className="text-white font-mono">{report.healthContext.historicalAverage} / 100</strong></span>
                <span>•</span>
                <span>Full Monitored Catalog: <strong className="text-white font-mono">{SITE_COUNT} Platforms</strong></span>
              </div>
            </section>

            {/* Regional Intelligence Spotlight */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6" aria-label="Regional Spotlight">
              <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Regional Spotlight
                  </span>
                  <h2 className="text-base font-bold text-white font-outfit">{report.regionalSpotlight.region}</h2>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                  report.regionalSpotlight.growthRate.startsWith('-')
                    ? 'text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20'
                    : 'text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20'
                }`}>
                  {report.regionalSpotlight.growthRate}
                </span>
              </div>
              <div className="text-sm font-semibold text-[#82c8e5] mb-1.5">{report.regionalSpotlight.keyDriver}</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{report.regionalSpotlight.detail}</p>
            </section>
          </div>

          {/* Executive Sticky Sidebar (32% width on desktop) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">

            {/* Executive Health Brief & Radial Meter */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 shadow-xl" aria-label="Executive Health Brief">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-[#82c8e5] uppercase tracking-wider bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-2.5 py-0.5 rounded-full font-mono">
                  Executive Health Brief
                </span>
                <span
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-mono"
                  style={{
                    color: report.healthContext.statusColor,
                    borderColor: report.healthContext.statusColor + '44',
                    backgroundColor: report.healthContext.statusColor + '18',
                  }}
                >
                  {report.healthContext.statusBand}
                </span>
              </div>

              <div className="flex flex-col items-center py-2 mb-4">
                <HealthMeter score={report.internetHealthScore} />
              </div>

              <div className="space-y-3 pt-3 border-t border-white/[0.08] text-xs">
                <div className="flex items-center justify-between text-[#8ea1b4]">
                  <span>8-Wk Rolling Baseline:</span>
                  <strong className="text-white font-mono">{report.healthContext.historicalAverage} / 100</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8ea1b4]">Variance vs Norm:</span>
                  <span
                    className="font-semibold font-mono"
                    style={{ color: report.healthContext.varianceVsAverage >= 0 ? '#10b981' : '#f87171' }}
                  >
                    {report.healthContext.varianceVsAverage >= 0 ? '+' : ''}{report.healthContext.varianceVsAverage} pts
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#8ea1b4]">
                  <span>Combined Rate:</span>
                  <span className="font-mono text-white font-semibold">{report.totalTopSitesVisitsPerSec.toLocaleString()} req/s</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed pt-2 border-t border-white/[0.06]">
                  {report.healthContext.incidentBreakdown}
                </p>

                <details className="group pt-1">
                  <summary className="text-[11px] text-[#8ea1b4] cursor-pointer hover:text-[#82c8e5] transition-colors list-none flex items-center gap-1 select-none">
                    <span className="group-open:hidden">▸ How is this calculated?</span>
                    <span className="hidden group-open:inline">▾ How is this calculated?</span>
                  </summary>
                  <p className="text-[11px] text-[#8ea1b4] leading-relaxed mt-2 pl-2.5 border-l border-white/10">
                    Score = <strong className="text-white">100 - (8 × outage count)</strong>, minimum 40.
                    An outage is any tracked platform returning sustained 5xx errors during the week. Baseline tracks the 8-week rolling mean across all {SITE_COUNT} tracked platforms.
                  </p>
                </details>
              </div>
            </section>

            {/* AI vs. Traditional Search Convergence Index */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 shadow-xl relative overflow-hidden" aria-label="Search and AI Convergence">
              <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-[#10a37f] bg-[#10a37f]/10 border border-[#10a37f]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Structural Shift
                  </span>
                  <span className="text-xs font-semibold text-[#82c8e5]">Search &amp; AI Convergence</span>
                </div>
                <div className="text-xs text-[#6d8196] font-mono">
                  <strong className="text-white text-sm">{report.aiSearchConvergence.ratioPercent}%</strong> Substitution
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mb-4">
                <div className="p-3 rounded-xl border border-white/[0.08] bg-[#070b14] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-[#8ea1b4] uppercase tracking-wider">AI Assistant Velocity</div>
                    <div className="text-base font-bold text-white tabular-nums font-mono">
                      {report.aiSearchConvergence.aiTotalRate.toLocaleString()} <span className="text-[11px] font-normal text-[#8ea1b4]">req/s</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#10b981] font-semibold font-mono">
                    {report.aiSearchConvergence.aiGrowthPercent >= 0 ? '+' : ''}{report.aiSearchConvergence.aiGrowthPercent}% WoW
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-white/[0.08] bg-[#070b14] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-[#8ea1b4] uppercase tracking-wider">Traditional Search Velocity</div>
                    <div className="text-base font-bold text-white tabular-nums font-mono">
                      {report.aiSearchConvergence.searchTotalRate.toLocaleString()} <span className="text-[11px] font-normal text-[#8ea1b4]">req/s</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#82c8e5] font-semibold font-mono">
                    {report.aiSearchConvergence.searchGrowthPercent >= 0 ? '+' : ''}{report.aiSearchConvergence.searchGrowthPercent}% WoW
                  </div>
                </div>
              </div>

              {/* Convergence Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-[#8ea1b4] mb-1.5 font-medium font-mono">
                  <span>Traditional ({Math.max(10, 100 - report.aiSearchConvergence.ratioPercent).toFixed(1)}%)</span>
                  <span className="text-[#10a37f]">AI ({report.aiSearchConvergence.ratioPercent}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden flex">
                  <div className="h-full bg-[#4285F4]" style={{ width: `${Math.max(10, 100 - report.aiSearchConvergence.ratioPercent)}%` }} />
                  <div className="h-full bg-[#10a37f]" style={{ width: `${report.aiSearchConvergence.ratioPercent}%` }} />
                </div>
              </div>

              <p className="text-xs text-[#94a3b8] leading-relaxed border-t border-white/[0.06] pt-3">
                {report.aiSearchConvergence.convergenceNarrative}
              </p>

              {/* CiteRoute GEO Intelligence Integration */}
              <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-col gap-2.5 bg-gradient-to-r from-[#05AD98]/12 via-[#05AD98]/5 to-transparent p-3.5 rounded-xl border border-[#05AD98]/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#05AD98] animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Optimize for AI Search &amp; GEO
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#05AD98] bg-[#05AD98]/15 border border-[#05AD98]/30 px-1.5 py-0.5 rounded">
                      CiteRoute
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                    Track citations across ChatGPT, Claude, and Perplexity with real-time generative engine optimization.
                  </p>
                </div>
                <a
                  href="https://www.citeroute.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#05AD98] hover:bg-[#038a79] text-white text-xs font-bold transition-all shadow-md shadow-[#05AD98]/20 group self-start"
                >
                  <span>Audit on CiteRoute</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </section>

            {/* Key Divergences / Stories */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 shadow-xl" aria-label="Key Divergences and Stories">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2 font-outfit">
                Key Divergences &amp; Market Stories
              </h2>
              <div className="space-y-3">
                {report.stories.map((story, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 mt-0.5 font-mono"
                        style={{ backgroundColor: story.tagColor + '22', color: story.tagColor }}
                      >
                        {story.tag}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-xs mb-1">{story.title}</h3>
                        <p className="text-[11px] text-[#94a3b8] leading-relaxed">{story.summary}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Newsletter Subscription Card */}
            <ReportSubscribeCard />

            {/* Executive Actions & Export Bar */}
            <ReportActionsBar report={report} />
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between gap-4 mt-12 mb-6 no-print">
          {prevSlug ? (
            <Link
              href={`/report/${prevSlug}`}
              className="flex items-center gap-2 text-sm text-[#6d8196] hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/[0.06] hover:border-white/10"
            >
              &larr; Previous week
            </Link>
          ) : <span />}
          {nextSlug ? (
            <Link
              href={`/report/${nextSlug}`}
              className="flex items-center gap-2 text-sm text-[#6d8196] hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/[0.06] hover:border-white/10"
            >
              Next week &rarr;
            </Link>
          ) : (
            <span className="text-xs text-[#6d8196]">This is the latest report.</span>
          )}
        </div>
      </div>
    </div>
  );
}
