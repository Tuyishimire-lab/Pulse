'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_COUNT } from '../../data/siteCount';
import {
  WeeklyReport,
  TopMover,
  BreakoutPlatform,
  SiteSummary,
  ConfidenceBand,
} from '../data/reportGenerator';
import { resolveFaviconUrl } from '../../components/ui/FaviconImage';
import RankSparkline from '../../components/ui/RankSparkline';

export type MoverTab = 'All Movers' | 'Gainers' | 'Decliners' | 'Breakouts' | 'Volume';

export interface TopMoversHubItem {
  id: string;
  name: string;
  domain: string;
  url: string;
  rank: number;
  prevRank: number;
  rate: number;
  prevRate: number;
  velocityGrowthPct: number;
  runRateImpact: number;
  trafficDelta: number;
  rankChange: number;
  baseline: string;
  category: string;
  color: string;
  logo: string;
  confidence?: ConfidenceBand;
  highlight?: string;
  history?: { rank: number; date: string }[];
  site: SiteSummary;
}

export interface TopMoversHubProps {
  report?: WeeklyReport;
  sites?: any[];
  topMovers?: TopMover[];
  breakoutRadar?: BreakoutPlatform[];
  isLive?: boolean;
  totalCatalogSize?: number;
}

/**
 * Extracts the initial letter monogram, properly handling numeric and punctuation names (e.g. 1Password -> 1).
 */
export function getPlatformMonogram(name: string): string {
  return (name || '').trim().charAt(0).toUpperCase() || 'P';
}

/**
 * Multi-stage favicon renderer: primary -> fallback -> monogram
 */
export function MoverFavicon({
  url,
  name,
  logo,
  color,
}: {
  url: string;
  name: string;
  logo: string;
  color: string;
}) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'monogram'>('primary');
  const { domain, primarySrc, fallbackSrc } = resolveFaviconUrl(url, 64);
  const monogram = getPlatformMonogram(name || logo);

  if (stage === 'monogram' || !domain) {
    return (
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 font-mono"
        style={{
          backgroundColor: color ? color + '22' : 'rgba(255,255,255,0.08)',
          color: color === '#ffffff' ? '#111' : color || '#82c8e5',
        }}
        aria-label={`${name} monogram`}
      >
        {monogram}
      </span>
    );
  }

  const src = stage === 'primary' ? primarySrc : fallbackSrc;

  return (
    <Image
      src={src}
      alt={`${name} favicon`}
      width={40}
      height={40}
      onError={() => {
        if (stage === 'primary' && primarySrc !== fallbackSrc) {
          setStage('fallback');
        } else {
          setStage('monogram');
        }
      }}
      className="w-10 h-10 rounded-xl object-contain p-0.5 flex-shrink-0 bg-white/[0.04]"
      style={{ backgroundColor: color ? color + '22' : 'transparent' }}
      unoptimized
    />
  );
}

export function TopMoversHub({
  report,
  sites,
  topMovers,
  breakoutRadar,
  isLive,
  totalCatalogSize = SITE_COUNT,
}: TopMoversHubProps) {
  const [activeTab, setActiveTab] = useState<MoverTab>('All Movers');
  const [showAllVolume, setShowAllVolume] = useState(false);

  const tabs: MoverTab[] = ['All Movers', 'Gainers', 'Decliners', 'Breakouts', 'Volume'];

  // Normalize incoming catalog into uniform MoverItems
  const allItems: TopMoversHubItem[] = useMemo(() => {
    const rawList = sites || report?.sites || [];
    const topMoversMap = new Map<string, TopMover>();
    for (const m of (topMovers || report?.topMovers || [])) {
      if (m.site?.id) topMoversMap.set(m.site.id, m);
      if (m.site?.name) topMoversMap.set(m.site.name.toLowerCase(), m);
    }

    const breakoutMap = new Map<string, BreakoutPlatform>();
    for (const b of (breakoutRadar || report?.breakoutRadar || [])) {
      if (b.site?.id) breakoutMap.set(b.site.id, b);
      if (b.site?.name) breakoutMap.set(b.site.name.toLowerCase(), b);
    }

    if (rawList.length === 0 && (topMovers || report?.topMovers)) {
      // Fallback if only topMovers are passed
      return (topMovers || report?.topMovers || []).map((m) => {
        const currRank = m.site.rank;
        const prevRank = m.site.rank + m.rankChange;
        const prevRate =
          m.trafficDelta !== 0
            ? Math.round(m.site.rate / (1 + m.trafficDelta / 100))
            : m.site.rate;
        const runRate =
          m.runRateImpact ?? Math.round((m.site.rate - prevRate) * 2592000);

        return {
          id: m.site.id,
          name: m.site.name,
          domain: m.site.url.replace(/^https?:\/\//i, '').replace(/\/.*$/, ''),
          url: m.site.url,
          rank: currRank,
          prevRank,
          rate: m.site.rate,
          prevRate,
          velocityGrowthPct: m.trafficDelta,
          runRateImpact: runRate,
          trafficDelta: m.trafficDelta,
          rankChange: m.rankChange,
          baseline: m.site.baseline,
          category: m.site.category,
          color: m.site.color,
          logo: m.site.logo,
          confidence: m.confidence,
          highlight: m.highlight,
          history: (m as unknown as { history?: { rank: number; date: string }[] }).history || [
            { rank: prevRank, date: 'prev' },
            { rank: currRank, date: 'curr' },
          ],
          site: m.site,
        };
      });
    }

    return rawList.map((item: any) => {
      const site: SiteSummary = item.site || item;
      const lookupKey = site.id || item.id;
      const nameKey = (site.name || item.name || '').toLowerCase();
      const moverMatch =
        (lookupKey ? topMoversMap.get(lookupKey) : undefined) ||
        (nameKey ? topMoversMap.get(nameKey) : undefined);
      const breakoutMatch =
        (lookupKey ? breakoutMap.get(lookupKey) : undefined) ||
        (nameKey ? breakoutMap.get(nameKey) : undefined);

      const currRank = item.rank ?? site.rank ?? moverMatch?.site.rank ?? breakoutMatch?.rank ?? 0;
      const rankChange =
        item.rankChange ??
        moverMatch?.rankChange ??
        (breakoutMatch
          ? breakoutMatch.prevRank - breakoutMatch.rank
          : (item.prevRank !== undefined ? item.prevRank - currRank : 0));
      const prevRank =
        item.prevRank ??
        breakoutMatch?.prevRank ??
        (rankChange !== 0 ? currRank + rankChange : currRank);
      const rate = item.rate ?? site.rate ?? moverMatch?.site.rate ?? breakoutMatch?.rate ?? 0;
      const prevRate =
        item.prevRate ??
        breakoutMatch?.prevRate ??
        (moverMatch && moverMatch.trafficDelta !== 0 && moverMatch.trafficDelta !== -100
          ? Math.round(rate / (1 + moverMatch.trafficDelta / 100))
          : rate);

      const velocityGrowthPct =
        item.velocityGrowthPct ??
        breakoutMatch?.velocityGrowthPct ??
        moverMatch?.trafficDelta ??
        (prevRate > 0 ? ((rate - prevRate) / prevRate) * 100 : 0);

      const runRateImpact =
        item.runRateImpact ??
        moverMatch?.runRateImpact ??
        breakoutMatch?.runRateImpact ??
        Math.round((rate - prevRate) * 2592000);
      const trafficDelta = item.trafficDelta ?? moverMatch?.trafficDelta ?? velocityGrowthPct;

      const history =
        item.history && item.history.length >= 2
          ? item.history
          : (moverMatch as unknown as { history?: { rank: number; date: string }[] })?.history &&
            (moverMatch as unknown as { history?: { rank: number; date: string }[] }).history!.length >= 2
          ? (moverMatch as unknown as { history?: { rank: number; date: string }[] }).history!
          : [
              { rank: prevRank, date: 'prev' },
              { rank: currRank, date: 'curr' },
            ];

      return {
        id: site.id || item.id || site.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name: site.name || item.name,
        domain: (site.url || item.url || '')
          .replace(/^https?:\/\//i, '')
          .replace(/\/.*$/, ''),
        url: site.url || item.url || '#',
        rank: currRank,
        prevRank,
        rate,
        prevRate,
        velocityGrowthPct: Math.round(velocityGrowthPct * 10) / 10,
        runRateImpact,
        trafficDelta: Math.round(trafficDelta * 10) / 10,
        rankChange,
        baseline: site.baseline || item.baseline || 'N/A',
        category: site.category || item.category || 'General',
        color: site.color || item.color || '#82c8e5',
        logo: site.logo || item.logo || getPlatformMonogram(site.name || item.name),
        confidence: item.confidence || moverMatch?.confidence || site.confidence,
        highlight:
          item.highlight ||
          moverMatch?.highlight ||
          (breakoutMatch ? `Velocity surge of +${velocityGrowthPct.toFixed(1)}%` : undefined),
        history,
        site,
      };
    });
  }, [report, sites, topMovers, breakoutRadar]);

  // Compute filtered subsets per tab
  const filteredItems: TopMoversHubItem[] = useMemo(() => {
    switch (activeTab) {
      case 'Gainers':
        return allItems
          .filter((s) => s.prevRank - s.rank >= 2)
          .sort(
            (a, b) =>
              b.prevRank - b.rank - (a.prevRank - a.rank) ||
              b.velocityGrowthPct - a.velocityGrowthPct
          );

      case 'Decliners':
        return allItems
          .filter((s) => s.rank - s.prevRank >= 2)
          .sort(
            (a, b) =>
              b.rank - b.prevRank - (a.rank - a.prevRank) ||
              a.velocityGrowthPct - b.velocityGrowthPct
          );

      case 'Breakouts':
        return allItems
          .filter(
            (s) =>
              s.rank >= 31 && s.rank <= totalCatalogSize && s.velocityGrowthPct >= 15.0
          )
          .sort((a, b) => b.velocityGrowthPct - a.velocityGrowthPct);

      case 'Volume':
        return [...allItems].sort((a, b) => b.runRateImpact - a.runRateImpact);

      case 'All Movers':
      default: {
        const movers = allItems
          .filter((s) => Math.abs(s.prevRank - s.rank) >= 2)
          .sort(
            (a, b) =>
              Math.abs(b.prevRank - b.rank) - Math.abs(a.prevRank - a.rank) ||
              b.velocityGrowthPct - a.velocityGrowthPct
          );

        if (movers.length === 0) {
          // Fallback to top platforms if no site moved >= 2 ranks
          return allItems.slice(0, 5);
        }
        return movers;
      }
    }
  }, [allItems, activeTab]);

  // Display slicing: in Volume tab, allow view of all 100 or top 10
  const displayedItems = useMemo(() => {
    if (activeTab === 'Volume' && !showAllVolume && filteredItems.length > 10) {
      return filteredItems.slice(0, 10);
    }
    return filteredItems;
  }, [filteredItems, activeTab, showAllVolume]);

  const hasRealMovers =
    report?.hasRealMovers ?? allItems.some((s) => Math.abs(s.prevRank - s.rank) >= 2);
  const isLiveReport = isLive ?? report?.isLive ?? true;

  return (
    <section aria-label="Top Movers Hub" className="space-y-4">
      {/* Header and Live Context */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
            <span>Market Movers &amp; Velocity Radar</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#82c8e5]/10 border border-[#82c8e5]/20 text-[#82c8e5]">
              {totalCatalogSize} Monitored
            </span>
          </h2>
          <p className="text-xs text-[#8ea1b4] mt-0.5">
            Weekly rank shifts, high-growth breakout radar, and net request volume impact.
          </p>
        </div>
        <Link
          href="/trending"
          className="text-xs font-semibold text-[#82c8e5] hover:text-white transition-colors flex items-center gap-1 no-print"
        >
          View live rank shifts on Trending &rarr;
        </Link>
      </div>

      {/* 5-Tab Filter Navigation (Excluded from Print Mode via no-print) */}
      <div
        className="flex items-center gap-1.5 p-1 bg-[#070b14] border border-white/[0.08] rounded-xl no-print overflow-x-auto scrollbar-none"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          let badgeCount: number | null = null;
          if (tab === 'Gainers')
            badgeCount = allItems.filter((s) => s.prevRank - s.rank >= 2).length;
          if (tab === 'Decliners')
            badgeCount = allItems.filter((s) => s.rank - s.prevRank >= 2).length;
          if (tab === 'Breakouts')
            badgeCount = allItems.filter(
              (s) => s.rank >= 31 && s.rank <= totalCatalogSize && s.velocityGrowthPct >= 15.0
            ).length;

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-[#82c8e5]/15 text-[#82c8e5] border border-[#82c8e5]/30 shadow-sm'
                  : 'text-[#8ea1b4] hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span>{tab}</span>
              {tab === 'Gainers' && <span className="text-[10px] text-[#10b981]">▲</span>}
              {tab === 'Decliners' && <span className="text-[10px] text-[#f87171]">▼</span>}
              {badgeCount !== null && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#82c8e5]/25 text-white' : 'bg-white/[0.06] text-[#8ea1b4]'
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Informational badge when in All Movers but no significant rank shifts */}
      {activeTab === 'All Movers' && !hasRealMovers && (
        <div className="text-[11px] text-[#6d8196] bg-white/[0.02] border border-white/[0.06] px-3 py-1.5 rounded-lg">
          No significant rank changes (&ge; 2 ranks) detected in top tiers this week. Showing top platforms by traffic.
        </div>
      )}

      {/* Empty State for Breakouts Tab (B22.2) */}
      {activeTab === 'Breakouts' && filteredItems.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#070b14] text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#82c8e5]/10 flex items-center justify-center text-[#82c8e5] text-lg">
            ⚡
          </div>
          <h3 className="text-sm font-bold text-white">No Breakouts Detected</h3>
          <p className="text-xs text-[#8ea1b4] max-w-md mx-auto">
            No platform breakouts (&gt;= +15% growth) detected in ranks #31–#{totalCatalogSize} this week.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#070b14] text-center text-xs text-[#8ea1b4]">
          No platforms matched the selected filter criteria for this period.
        </div>
      ) : (
        /* Mover Platform Card List */
        <div className="space-y-3">
          {displayedItems.map((mover) => {
            const isGainer = mover.rankChange > 0;
            const showDelta = mover.trafficDelta !== 0;

            return (
              <Link
                key={mover.id}
                href={`/sites/${mover.id}`}
                className="flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-white/[0.08] bg-[#070b14] hover:bg-[#0c1220] hover:border-white/20 transition-all group block"
              >
                {/* Rank + Sparkline */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs font-bold text-[#8ea1b4] w-6 text-center tabular-nums font-mono">
                    #{mover.rank}
                  </span>
                  <RankSparkline history={mover.history || []} />
                </div>

                {/* Multi-Stage Favicon */}
                <MoverFavicon
                  url={mover.url}
                  name={mover.name}
                  logo={mover.logo}
                  color={mover.color}
                />

                {/* Platform Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white group-hover:text-[#82c8e5] transition-colors text-sm truncate max-w-[140px] sm:max-w-none">
                      {mover.name}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: mover.color + '22', color: mover.color }}
                    >
                      {mover.baseline}
                    </span>
                    {mover.confidence && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{
                          color:
                            mover.confidence.tier === 'High'
                              ? '#34d399'
                              : mover.confidence.tier === 'Moderate'
                              ? '#60a5fa'
                              : '#94a3b8',
                          borderColor:
                            mover.confidence.tier === 'High'
                              ? 'rgba(52, 211, 153, 0.3)'
                              : mover.confidence.tier === 'Moderate'
                              ? 'rgba(96, 165, 250, 0.3)'
                              : 'rgba(148, 163, 184, 0.25)',
                          backgroundColor:
                            mover.confidence.tier === 'High'
                              ? 'rgba(52, 211, 153, 0.1)'
                              : mover.confidence.tier === 'Moderate'
                              ? 'rgba(96, 165, 250, 0.1)'
                              : 'rgba(148, 163, 184, 0.08)',
                        }}
                      >
                        {mover.confidence.label}
                      </span>
                    )}
                    {mover.rankChange !== 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono"
                        style={{
                          color: isGainer ? '#10b981' : '#f87171',
                          backgroundColor: isGainer
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(248,113,113,0.12)',
                        }}
                      >
                        {isGainer ? '▲' : '▼'} {Math.abs(mover.rankChange)}
                      </span>
                    )}
                  </div>
                  {mover.highlight && (
                    <p className="text-xs text-[#8ea1b4] mt-0.5 leading-relaxed line-clamp-2">
                      {mover.highlight}
                    </p>
                  )}

                  {/* Mobile Compact Badges (<640px) */}
                  <div className="flex items-center gap-2 flex-wrap sm:hidden mt-2">
                    <span className="font-mono text-[11px] font-bold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded">
                      {mover.rate.toLocaleString()}/s
                    </span>
                    {isLiveReport && showDelta && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                          mover.trafficDelta >= 0
                            ? 'text-[#10b981] bg-[#10b981]/10'
                            : 'text-[#f87171] bg-[#f87171]/10'
                        }`}
                      >
                        {mover.trafficDelta >= 0 ? '+' : ''}
                        {mover.trafficDelta.toFixed(1)}%
                      </span>
                    )}
                    {mover.runRateImpact !== 0 && (
                      <span className="text-[10px] font-mono text-[#8ea1b4] bg-white/[0.04] px-1.5 py-0.5 rounded">
                        {mover.runRateImpact > 0 ? '+' : ''}
                        {(mover.runRateImpact / 1e6).toFixed(1)}M/mo
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop Metrics Table Cell (>=640px) */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="text-xs font-mono font-bold text-[#10b981]">
                    {mover.rate.toLocaleString()}/s
                  </div>
                  {isLiveReport && showDelta && (
                    <div
                      className="text-[10px] font-semibold mt-0.5 font-mono"
                      style={{ color: mover.trafficDelta >= 0 ? '#10b981' : '#f87171' }}
                    >
                      {mover.trafficDelta >= 0 ? '+' : ''}
                      {mover.trafficDelta.toFixed(1)}%
                    </div>
                  )}
                  {mover.runRateImpact !== 0 && (
                    <div
                      className="text-[10px] font-mono text-[#8ea1b4] mt-0.5"
                      title="Estimated 30-day net volume impact"
                    >
                      {mover.runRateImpact > 0 ? '+' : ''}
                      {(mover.runRateImpact / 1e6).toFixed(1)}M/mo run-rate
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Volume Tab Expansion Control */}
          {activeTab === 'Volume' && filteredItems.length > 10 && (
            <div className="text-center pt-2 no-print">
              <button
                type="button"
                onClick={() => setShowAllVolume(!showAllVolume)}
                className="text-xs font-semibold px-4 py-2 rounded-xl border border-white/[0.08] text-[#82c8e5] hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                {showAllVolume
                  ? 'Show Top 10 Only'
                  : `Show All ${filteredItems.length} Platforms Ranked by Volume`}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default TopMoversHub;
