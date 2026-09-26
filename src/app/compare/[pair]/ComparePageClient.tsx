'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { SiteConfig } from '../../data/sites';
import { ComparePair } from '../data/pairs';
import NavHeader from '../../components/NavHeader';
import SocialShareBar from '../../components/SocialShareBar';
import EmbedWidgetModal from '../../components/EmbedWidgetModal';
import { CURRENT_YEAR } from '../../../lib/currentYear';
import { exportComparisonReport } from '../../../utils/exportCsv';
import { parseTrafficMetric, compareMetric } from '../../../lib/metrics';


interface Props {
  siteA: SiteConfig;
  siteB: SiteConfig;
  pairData: ComparePair | null;
  related: ComparePair[];
  allSites: SiteConfig[];
}

import FaviconImage from '../../components/ui/FaviconImage';

function LiveCounter({ rate, color }: { rate: number; color: string }) {
  const [count, setCount] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCount(Math.floor(rate * elapsed));
    }, 250);
    return () => clearInterval(id);
  }, [rate]);

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-extrabold tabular-nums font-mono" style={{ color }}>
        +{count.toLocaleString()}
      </div>
      <div className="text-xs text-[#6d8196] mt-0.5">visits since you landed</div>
    </div>
  );
}

function StatRow({ label, a, b, colorA, colorB, winner }: {
  label: string; a: string; b: string; colorA: string; colorB: string; winner?: 'a' | 'b' | null;
}) {
  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-white/[0.05] last:border-0">
      <div className={`text-sm font-medium tabular-nums text-right pr-4 ${winner === 'a' ? 'text-white font-bold' : 'text-[#94a3b8]'}`} style={winner === 'a' ? { color: colorA } : undefined}>
        {a}
        {winner === 'a' && <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">win</span>}
      </div>
      <div className="text-xs text-[#6d8196] text-center font-medium uppercase tracking-wider px-2">{label}</div>
      <div className={`text-sm font-medium tabular-nums pl-4 ${winner === 'b' ? 'text-white font-bold' : 'text-[#94a3b8]'}`} style={winner === 'b' ? { color: colorB } : undefined}>
        {winner === 'b' && <span className="mr-1.5 text-[10px] text-emerald-400 font-bold">win</span>}
        {b}
      </div>
    </div>
  );
}

export default function ComparePageClient({ siteA, siteB, pairData, related, allSites }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [embedSite, setEmbedSite] = useState<SiteConfig | null>(null);

  // Canonical evaluation: derive directly from rendered baseline strings (with baselineRaw fallback).
  // This guarantees UI displayed numbers NEVER contradict the winner badge.
  const valA = parseTrafficMetric(siteA.baseline, siteA.baselineRaw || siteA.rate * 30 * 24 * 3600);
  const valB = parseTrafficMetric(siteB.baseline, siteB.baselineRaw || siteB.rate * 30 * 24 * 3600);

  const winnerVisits = compareMetric(valA, valB, true);
  const winnerRate = compareMetric(siteA.rate, siteB.rate, true);
  const winnerRank = compareMetric(siteA.rank, siteB.rank, false); // lower rank is better (#1 beats #33)

  // Comparative Intelligence Metrics
  const maxVal = Math.max(valA, valB);
  const minVal = Math.max(1, Math.min(valA, valB));
  const disparityRatio = Number((maxVal / minVal).toFixed(1));
  const leaderSite = valA >= valB ? siteA : siteB;
  const trailingSite = valA >= valB ? siteB : siteA;
  const diffVisits = Math.abs(valA - valB);
  const diffFormatted = diffVisits >= 1_000_000_000
    ? `+${(diffVisits / 1_000_000_000).toFixed(1)}B / mo`
    : diffVisits >= 1_000_000
    ? `+${(diffVisits / 1_000_000).toFixed(0)}M / mo`
    : `+${diffVisits.toLocaleString()} / mo`;

  const velocityDiff = siteA.rate - siteB.rate;
  const velocityAdvantage = velocityDiff === 0
    ? 'Even request velocity'
    : velocityDiff > 0
    ? `${siteA.name} leads by +${velocityDiff.toLocaleString()} req/s`
    : `${siteB.name} leads by +${Math.abs(velocityDiff).toLocaleString()} req/s`;

  const rankLeader = winnerRank === 'a' ? siteA : winnerRank === 'b' ? siteB : siteA;
  const faq = pairData?.faq ?? [
    {
      q: `Which gets more traffic, ${siteA.name} or ${siteB.name}?`,
      a: `${rankLeader.name} ranks higher globally at #${Math.min(siteA.rank, siteB.rank)}, receiving ${rankLeader.baseline} per month.`,
    },
    {
      q: `What is the difference between ${siteA.name} and ${siteB.name}?`,
      a: `${siteA.name} is a ${siteA.category} platform ranked #${siteA.rank} globally. ${siteB.name} is a ${siteB.category} platform ranked #${siteB.rank} globally.`,
    },
  ];

  const cleanVerdict = useMemo(() => {
    const raw = pairData?.verdict?.trim();
    const isBasicFallback = !raw || /currently ranks #\d+ with .* monthly visits, compared to .* at #\d+/i.test(raw);
    
    if (raw && !isBasicFallback) {
      // Strip any legacy appended boilerplate
      return raw.replace(/\s*Currently:\s*.*$/, '').trim();
    }

    // Synthesize high-caliber analytical verdict
    const rankDelta = Math.abs(siteA.rank - siteB.rank);
    let primary = '';
    if (disparityRatio >= 2.0) {
      primary = `${leaderSite.name} commands a decisive ${disparityRatio}x traffic lead over ${trailingSite.name}, generating approximately ${leaderSite.baseline} monthly visits compared to ${trailingSite.baseline}.`;
    } else if (disparityRatio >= 1.15) {
      primary = `${leaderSite.name} holds a clear traffic advantage over ${trailingSite.name} (${leaderSite.baseline} vs ${trailingSite.baseline} monthly visits), outpacing its rival by roughly ${disparityRatio}x.`;
    } else {
      primary = `${leaderSite.name} and ${trailingSite.name} operate in close traffic parity (${leaderSite.baseline} vs ${trailingSite.baseline} monthly visits), separated by only a narrow volume margin.`;
    }

    const rankPart = rankDelta > 0
      ? ` On global leaderboards, ${leaderSite.name} holds position #${leaderSite.rank} while ${trailingSite.name} sits at #${trailingSite.rank} (${rankDelta} positions spread).`
      : '';

    const catPart = siteA.category === siteB.category
      ? ` Within the ${leaderSite.category} sector, ${leaderSite.name} captures the primary share of audience reach and visitor velocity.`
      : ` Comparing ${leaderSite.name}'s ${leaderSite.category} platform with ${trailingSite.name}'s ${trailingSite.category} footprint, ${leaderSite.name} demonstrates broader digital reach.`;

    return `${primary}${rankPart}${catPart}`;
  }, [pairData, siteA, siteB, leaderSite, trailingSite, disparityRatio]);

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${siteA.color}22 0%, transparent 45%),
                       radial-gradient(circle at 80% 70%, ${siteB.color}22 0%, transparent 45%)`,
        }}
      />

      <NavHeader />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Compare</span>
          <span>/</span>
          <span className="text-white">{siteA.name} vs {siteB.name}</span>
        </nav>

        {/* Horizontal compare pill strip */}
        <div className="mb-8 -mx-4 sm:-mx-6">
          <div
            className="flex gap-2 overflow-x-auto px-4 sm:px-6 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Current pair is always first, then related pairs */}
            {[
              { slug: `${siteA.id}-vs-${siteB.id}`, nameA: siteA.name, nameB: siteB.name, isCurrent: true },
              ...related.map((p) => {
                const rA = allSites.find((s) => s.id === p.siteAId);
                const rB = allSites.find((s) => s.id === p.siteBId);
                return rA && rB ? { slug: p.slug, nameA: rA.name, nameB: rB.name, isCurrent: false } : null;
              }).filter(Boolean)
            ].map((item) =>
              item && (
                <Link
                  key={item.slug}
                  href={`/compare/${item.slug}`}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                    item.isCurrent
                      ? 'bg-[#82c8e5]/15 border-[#82c8e5]/40 text-[#82c8e5]'
                      : 'border-white/[0.08] text-[#6d8196] hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {item.nameA} vs {item.nameB}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Hero VS Section */}
        <header className="mb-10">
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
            {/* Site A */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <FaviconImage
                url={siteA.url}
                logo={siteA.logo}
                color={siteA.color}
                size={72}
                rounded="2xl"
                className="rounded-2xl object-contain p-2 flex-shrink-0 bg-white/10"
              />
              <div className="text-center">
                <Link href={`/sites/${siteA.id}`} className="text-lg font-bold text-white hover:opacity-80 transition-opacity">
                  {siteA.name}
                </Link>
                <div
                  className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block"
                  style={{ backgroundColor: siteA.color + '22', color: siteA.color }}
                >
                  #{siteA.rank} Global
                </div>
              </div>
              <LiveCounter rate={siteA.rate} color={siteA.color} />
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-lg font-extrabold text-[#6d8196]">
                VS
              </div>
            </div>

            {/* Site B */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <FaviconImage
                url={siteB.url}
                logo={siteB.logo}
                color={siteB.color}
                size={72}
                rounded="2xl"
                className="rounded-2xl object-contain p-2 flex-shrink-0 bg-white/10"
              />
              <div className="text-center">
                <Link href={`/sites/${siteB.id}`} className="text-lg font-bold text-white hover:opacity-80 transition-opacity">
                  {siteB.name}
                </Link>
                <div
                  className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block"
                  style={{ backgroundColor: siteB.color + '22', color: siteB.color }}
                >
                  #{siteB.rank} Global
                </div>
              </div>
              <LiveCounter rate={siteB.rate} color={siteB.color} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight bg-gradient-to-r from-white to-[#82c8e5] bg-clip-text text-transparent">
            {siteA.name} vs {siteB.name}: Traffic Comparison ({CURRENT_YEAR})
          </h1>
          {pairData?.context && (
            <p className="text-center text-[#94a3b8] text-sm mt-2">{pairData.context}</p>
          )}
        </header>

        {/* Stats Comparison */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-[#6d8196] uppercase tracking-wider mb-3">Traffic Statistics</h2>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-3 px-6 py-2 border-b border-white/[0.06]">
              <div className="text-xs font-bold uppercase tracking-wider text-right pr-4" style={{ color: siteA.color }}>{siteA.name}</div>
              <div className="text-xs text-[#6d8196] text-center">Metric</div>
              <div className="text-xs font-bold uppercase tracking-wider pl-4" style={{ color: siteB.color }}>{siteB.name}</div>
            </div>
            <div className="px-6">
              <StatRow
                label="Monthly Visits"
                a={siteA.baseline}
                b={siteB.baseline}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={winnerVisits}
              />
              <StatRow
                label="Global Rank"
                a={`#${siteA.rank}`}
                b={`#${siteB.rank}`}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={winnerRank}
              />
              <StatRow
                label="Requests / sec"
                a={`${siteA.rate.toLocaleString()}/s`}
                b={`${siteB.rate.toLocaleString()}/s`}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={winnerRate}
              />
              <StatRow
                label="Category"
                a={siteA.category}
                b={siteB.category}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={null}
              />
            </div>
          </div>
        </section>

        {/* Verdict Card */}
        <section className="mb-8" aria-label="Verdict and Market Analysis">
          <div className="relative rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/25 via-[#070e14] to-[#03060a] p-5 sm:p-6 overflow-hidden shadow-[0_0_35px_rgba(16,185,129,0.06)]">
            {/* Ambient subtle corner glow */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 pointer-events-none rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: leaderSite.color || '#10b981' }}
            />

            {/* Header bar with Icon, Title, and Outcome Badge */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Executive Verdict
                  </h2>
                  <div className="text-[11px] text-[#6d8196]">
                    Independent Traffic & Market Intelligence
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {disparityRatio >= 1.05
                  ? `${leaderSite.name} Leads (${disparityRatio}x)`
                  : 'Parity Battle'}
              </div>
            </div>

            {/* Key takeaway structured chips */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
              <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#6d8196]">Audience Leader</div>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: leaderSite.color }} />
                  <span className="truncate">{leaderSite.name}</span>
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#6d8196]">Volume Advantage</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {disparityRatio}x <span className="text-xs font-medium text-[#82c8e5]">({diffFormatted})</span>
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#6d8196]">Global Rank Spread</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  #{leaderSite.rank} vs #{trailingSite.rank} <span className="text-xs font-normal text-[#6d8196]">({Math.abs(siteA.rank - siteB.rank)} spots)</span>
                </div>
              </div>
            </div>

            {/* Core analytical verdict copy */}
            <p className="relative z-10 text-slate-200 text-sm sm:text-[15px] leading-relaxed font-normal">
              {cleanVerdict}
            </p>
          </div>
        </section>

        {/* Comparative Advantage Intelligence Card */}
        <section className="mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#82c8e5]">
                Comparative Advantage Analysis
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportComparisonReport(siteA, siteB, { ratio: disparityRatio, diffBaseline: diffFormatted, winnerName: leaderSite.name, velocityAdvantage }, 'csv')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[#82c8e5] hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-1"
                  title="Download CSV report"
                >
                  Export CSV ↓
                </button>
                <button
                  onClick={() => exportComparisonReport(siteA, siteB, { ratio: disparityRatio, diffBaseline: diffFormatted, winnerName: leaderSite.name, velocityAdvantage }, 'json')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[#94a3b8] hover:bg-white/[0.08] hover:text-white transition-all flex items-center gap-1"
                  title="Download JSON report"
                >
                  Export JSON ↓
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                <span className="text-[10px] font-bold text-[#6d8196] uppercase tracking-wider block">Volume Disparity</span>
                <span className="text-xl font-black text-white mt-1 block">{disparityRatio}×</span>
                <span className="text-[11px] text-[#94a3b8] mt-0.5 block">{leaderSite.name} vs {trailingSite.name}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                <span className="text-[10px] font-bold text-[#6d8196] uppercase tracking-wider block">Net Traffic Spread</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{diffFormatted}</span>
                <span className="text-[11px] text-[#94a3b8] mt-0.5 block">{leaderSite.name} lead</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015]">
                <span className="text-[10px] font-bold text-[#6d8196] uppercase tracking-wider block">Live Request Velocity</span>
                <span className="text-xs font-bold text-white mt-2 block truncate">{velocityAdvantage}</span>
                <span className="text-[11px] text-[#6d8196] mt-0.5 block">real-time throughput delta</span>
              </div>
            </div>
          </div>
        </section>

        {/* Social Share & Embed Bar */}
        <section className="mb-8 p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Share or Embed this Comparison
              </h3>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Share real-time comparison metrics with your audience or embed live interactive telemetry widgets on your site.
            </p>
          </div>
          <SocialShareBar
            title={`${siteA.name} vs ${siteB.name} Traffic Comparison (${CURRENT_YEAR})`}
            summary={`${rankLeader.name} leads with ${rankLeader.baseline} vs ${(rankLeader.id === siteA.id ? siteB : siteA).baseline}.`}
            hashtags={['WebTraffic', siteA.name.replace(/[^a-zA-Z0-9]/g, ''), siteB.name.replace(/[^a-zA-Z0-9]/g, ''), 'PulseAnalytics']}
            onOpenEmbed={() => setEmbedSite(rankLeader)}
          />
        </section>


        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                  aria-expanded={openFaq === i}
                  aria-controls={`compare-faq-panel-${i}`}
                  id={`compare-faq-btn-${i}`}
                >
                  <span className="font-semibold text-sm text-white">{item.q}</span>
                  <span
                    className="text-[#6d8196] text-lg flex-shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[#94a3b8] leading-relaxed border-t border-white/[0.04] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>



        {/* Internal links to site pages */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-[#6d8196] uppercase tracking-wider mb-3">Deep Dive</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/sites/${siteA.id}`}
              className="flex-1 px-4 py-3 rounded-xl border text-center text-sm font-semibold transition-all hover:opacity-80"
              style={{ borderColor: siteA.color + '44', backgroundColor: siteA.color + '11', color: siteA.color }}
            >
              View {siteA.name} Full Stats →
            </Link>
            <Link
              href={`/sites/${siteB.id}`}
              className="flex-1 px-4 py-3 rounded-xl border text-center text-sm font-semibold transition-all hover:opacity-80"
              style={{ borderColor: siteB.color + '44', backgroundColor: siteB.color + '11', color: siteB.color }}
            >
              View {siteB.name} Full Stats →
            </Link>
          </div>
        </section>

        {embedSite && (
          <EmbedWidgetModal
            site={embedSite}
            alternateSite={embedSite.id === siteA.id ? siteB : siteA}
            isOpen={true}
            onClose={() => setEmbedSite(null)}
          />
        )}

      </div>
    </div>
  );
}
