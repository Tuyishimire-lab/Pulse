'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WeeklyReport } from '../data/reportGenerator';
import NavHeader from '../../components/NavHeader';

interface Props {
  report: WeeklyReport;
  prevSlug: string | null;
  nextSlug: string | null;
}

function FaviconImg({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [err, setErr] = React.useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  if (err) {
    return (
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0"
        style={{ backgroundColor: color + '22', color: color === '#ffffff' ? '#111' : color }}
      >
        {logo}
      </span>
    );
  }
  return (
    <Image
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt={`${logo} favicon`}
      width={40}
      height={40}
      onError={() => setErr(true)}
      className="w-10 h-10 rounded-xl object-contain p-0.5 flex-shrink-0"
      style={{ backgroundColor: color + '22' }}
      unoptimized
    />
  );
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
          <span className="text-2xl font-extrabold text-white">{score}</span>
          <span className="text-[10px] text-[#8ea1b4] font-medium uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
      <span className="text-xs text-[#8ea1b4]">Internet Health Score</span>
    </div>
  );
}

function ShareRow({ report }: { report: WeeklyReport }) {
  const [copied, setCopied] = React.useState(false);

  const reportUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/report/${report.slug}`
    : `https://www.pulstraffic.com/report/${report.slug}`;

  const xText = encodeURIComponent(
    `Week ${report.weekNumber}, ${report.year} Internet Pulse: ${report.totalTopSitesVisitsPerSec.toLocaleString()} req/s across 100 sites, health score ${report.internetHealthScore}/100. #WebTraffic #Pulse`
  );
  const xUrl = `https://x.com/intent/tweet?text=${xText}&url=${encodeURIComponent(reportUrl)}`;

  function copyLink() {
    navigator.clipboard.writeText(reportUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-10">
      <span className="text-xs text-[#8ea1b4]">Share this report:</span>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#8ea1b4] hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#94a3b8] hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
      >
        Share on X
      </a>
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

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#8ea1b4] mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Weekly Report</span>
          <span>/</span>
          <span className="text-white">Week {report.weekNumber}, {report.year}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white mb-3">
            {report.headline}
          </h1>
          <p className="text-[#94a3b8] text-base">{report.subheadline}</p>
        </header>

        {/* Quick Stats Row */}
        <section className="mb-8">
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

        {/* Internet Health Score */}
        <section className="mb-10 rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 flex flex-col sm:flex-row items-center gap-6">
          <HealthMeter score={report.internetHealthScore} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-base font-bold text-white">This week&apos;s internet health</h2>
              <span
                className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
                style={{
                  color: report.healthContext.statusColor,
                  borderColor: report.healthContext.statusColor + '44',
                  backgroundColor: report.healthContext.statusColor + '18',
                }}
              >
                {report.healthContext.statusBand}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8ea1b4] mb-2 flex-wrap">
              <span>8-Week Rolling Baseline: <strong className="text-white">{report.healthContext.historicalAverage} / 100</strong></span>
              <span
                className="font-semibold"
                style={{ color: report.healthContext.varianceVsAverage >= 0 ? '#10b981' : '#f87171' }}
              >
                ({report.healthContext.varianceVsAverage >= 0 ? '+' : ''}{report.healthContext.varianceVsAverage} vs historical norm)
              </span>
            </div>

            <p className="text-sm text-[#94a3b8] leading-relaxed mb-3">
              {report.healthContext.incidentBreakdown}
            </p>

            <details className="group">
              <summary className="text-xs text-[#8ea1b4] cursor-pointer hover:text-[#82c8e5] transition-colors list-none flex items-center gap-1 select-none">
                <span className="group-open:hidden">▸ How is this calculated?</span>
                <span className="hidden group-open:inline">▾ How is this calculated?</span>
              </summary>
              <p className="text-xs text-[#8ea1b4] leading-relaxed mt-2 pl-3 border-l border-white/10">
                Score = <strong className="text-white">100 - (8 × outage count)</strong>, minimum 40.
                An outage is any tracked site returning sustained 5xx errors during the week. Baseline tracks the 8-week rolling mean across all 100 tracked sites.
              </p>
            </details>
            <div className="mt-3">
              <span className="text-xs text-[#8ea1b4]">
                Combined rate:{' '}
                <strong className="text-white">{report.totalTopSitesVisitsPerSec.toLocaleString()} req/s</strong>
                {' '}across all 100 tracked sites.
              </span>
            </div>
          </div>
        </section>

        {/* AI vs. Traditional Search Convergence Index */}
        <section className="mb-10 rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#10a37f] bg-[#10a37f]/10 border border-[#10a37f]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Structural Shift
              </span>
              <span className="text-xs font-semibold text-[#82c8e5]">Search &amp; AI Convergence Index</span>
            </div>
            <div className="text-xs text-[#6d8196] font-mono">
              Substitution Ratio: <strong className="text-white text-sm">{report.aiSearchConvergence.ratioPercent}%</strong> of Search Volume
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#070b14]">
              <div className="text-[10px] font-semibold text-[#8ea1b4] uppercase tracking-wider mb-1">AI Assistant Velocity</div>
              <div className="text-lg font-bold text-white tabular-nums">
                {report.aiSearchConvergence.aiTotalRate.toLocaleString()} <span className="text-xs font-normal text-[#8ea1b4]">req/s</span>
              </div>
              <div className="text-[11px] text-[#10b981] font-semibold mt-0.5">
                {report.aiSearchConvergence.aiGrowthPercent >= 0 ? '+' : ''}{report.aiSearchConvergence.aiGrowthPercent}% WoW
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#070b14]">
              <div className="text-[10px] font-semibold text-[#8ea1b4] uppercase tracking-wider mb-1">Traditional Search Velocity</div>
              <div className="text-lg font-bold text-white tabular-nums">
                {report.aiSearchConvergence.searchTotalRate.toLocaleString()} <span className="text-xs font-normal text-[#8ea1b4]">req/s</span>
              </div>
              <div className="text-[11px] text-[#82c8e5] font-semibold mt-0.5">
                {report.aiSearchConvergence.searchGrowthPercent >= 0 ? '+' : ''}{report.aiSearchConvergence.searchGrowthPercent}% WoW
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#070b14]">
              <div className="text-[10px] font-semibold text-[#8ea1b4] uppercase tracking-wider mb-1">Query Substitution Share</div>
              <div className="text-lg font-bold text-[#10a37f] tabular-nums">
                {report.aiSearchConvergence.ratioPercent}%
              </div>
              <div className="text-[11px] text-[#8ea1b4] mt-0.5">
                ~1 AI query per {Math.round(100 / Math.max(0.1, report.aiSearchConvergence.ratioPercent))} search queries
              </div>
            </div>
          </div>

          {/* Convergence Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-[#8ea1b4] mb-1.5 font-medium">
              <span>Traditional Search ({Math.max(10, 100 - report.aiSearchConvergence.ratioPercent).toFixed(1)}%)</span>
              <span className="text-[#10a37f]">Conversational AI ({report.aiSearchConvergence.ratioPercent}%)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden flex">
              <div className="h-full bg-[#4285F4]" style={{ width: `${Math.max(10, 100 - report.aiSearchConvergence.ratioPercent)}%` }} />
              <div className="h-full bg-[#10a37f]" style={{ width: `${report.aiSearchConvergence.ratioPercent}%` }} />
            </div>
          </div>

          <p className="text-xs text-[#94a3b8] leading-relaxed border-t border-white/[0.06] pt-3">
            {report.aiSearchConvergence.convergenceNarrative}
          </p>
        </section>

        {/* Top Movers */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 flex-wrap">
             {report.hasRealMovers
               ? 'Top Rank Movers This Week'
               : report.isLive
                 ? 'Top Sites by Traffic This Week'
                 : 'Top Sites This Week'}
             {!report.hasRealMovers && report.isLive && (
               <span className="text-[10px] font-normal text-[#6d8196] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                 No significant rank changes in the top 30 this week
               </span>
             )}
             {!report.isLive && (
               <span className="text-[10px] font-normal text-[#6d8196] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
                 No comparison data available
               </span>
             )}
          </h2>

          <div className="space-y-3">
            {report.topMovers.map((mover) => (
              <Link
                key={mover.site.id}
                href={`/sites/${mover.site.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-[#070b14] hover:bg-[#0c1220] hover:border-white/20 transition-all group"
              >
                {/* Rank */}
                <span className="text-xs font-bold text-[#8ea1b4] w-5 text-center tabular-nums">#{mover.site.rank}</span>

                {/* Favicon */}
                <FaviconImg url={mover.site.url} logo={mover.site.logo} color={mover.site.color} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white group-hover:text-[#82c8e5] transition-colors text-sm">{mover.site.name}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: mover.site.color + '22', color: mover.site.color }}
                    >
                      {mover.site.baseline}
                    </span>
                    {mover.confidence && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{
                          color: mover.confidence.tier === 'High' ? '#34d399' : mover.confidence.tier === 'Moderate' ? '#60a5fa' : '#94a3b8',
                          borderColor: mover.confidence.tier === 'High' ? 'rgba(52, 211, 153, 0.3)' : mover.confidence.tier === 'Moderate' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(148, 163, 184, 0.25)',
                          backgroundColor: mover.confidence.tier === 'High' ? 'rgba(52, 211, 153, 0.1)' : mover.confidence.tier === 'Moderate' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(148, 163, 184, 0.08)',
                        }}
                      >
                        {mover.confidence.label}
                      </span>
                    )}
                    {mover.rankChange !== 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          color: mover.rankChange > 0 ? '#10b981' : '#f87171',
                          backgroundColor: mover.rankChange > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)',
                        }}
                      >
                        {mover.rankChange > 0 ? '▲' : '▼'} {Math.abs(mover.rankChange)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8ea1b4] mt-0.5 leading-relaxed line-clamp-2">{mover.highlight}</p>
                </div>

                {/* Rate + Traffic Delta - only show delta when live data exists */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="text-xs font-mono font-bold text-[#10b981]">{mover.site.rate.toLocaleString()}/s</div>
                  {report.isLive && mover.trafficDelta !== 0 && (
                    <div
                      className="text-[10px] font-semibold mt-0.5"
                      style={{ color: mover.trafficDelta >= 0 ? '#10b981' : '#f87171' }}
                    >
                      {mover.trafficDelta >= 0 ? '+' : ''}{mover.trafficDelta.toFixed(1)}%
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Stories */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             This Week&apos;s Internet Stories
          </h2>
          <div className="space-y-4">
            {report.stories.map((story, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: story.tagColor + '22', color: story.tagColor }}
                  >
                    {story.tag}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1.5">{story.title}</h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{story.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regional Intelligence Spotlight */}
        <section className="mb-10 rounded-2xl border border-white/[0.08] bg-[#0c1220] p-6">
          <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Regional Spotlight
              </span>
              <h2 className="text-base font-bold text-white">{report.regionalSpotlight.region}</h2>
            </div>
            <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-0.5 rounded-full">
              {report.regionalSpotlight.growthRate}
            </span>
          </div>
          <div className="text-sm font-semibold text-[#82c8e5] mb-1.5">{report.regionalSpotlight.keyDriver}</div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">{report.regionalSpotlight.detail}</p>
        </section>

        {/* Category Breakdown */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
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
                    <td className="px-5 py-3 text-right text-xs text-[#94a3b8]">{cat.count}</td>
                    <td className="px-5 py-3 text-right text-xs font-semibold text-white hidden sm:table-cell">{cat.totalBaseline}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      {cat.sharePercent !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, cat.sharePercent)}%`, backgroundColor: cat.color }}
                            />
                          </div>
                          <span className="text-[10px] text-[#8ea1b4] tabular-nums w-8 text-right">{cat.sharePercent.toFixed(0)}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-xs font-bold">
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

        {/* Week Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
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

        {/* Share row */}
        <ShareRow report={report} />


      </div>
    </div>
  );
}
