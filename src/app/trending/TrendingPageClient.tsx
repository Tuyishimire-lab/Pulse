'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavHeader from '../components/NavHeader';

export interface TrendingSite {
  id: string;
  name: string;
  url: string;
  logo: string;
  color: string;
  glow: string;
  category: string;
  currentRank: number;
  previousRank: number;
  delta: number;
  rate: number;
  baseline: string;
  volatility?: number; // PTI engine metric, present when source is 'volatility'
}

interface Props {
  risers: TrendingSite[];
  fallers: TrendingSite[];
  source: string;
  snapshotAge?: string;
}

function FaviconImg({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [err, setErr] = useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  if (err) {
    return (
      <span
        className="rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm"
        style={{
          width: 40,
          height: 40,
          backgroundColor: color + '28',
          color: color === '#ffffff' ? '#c0cfd8' : color,
        }}
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
      className="rounded-full object-contain flex-shrink-0"
      style={{ backgroundColor: color + '1a', padding: 3 }}
      unoptimized
    />
  );
}

function DeltaBadge({ delta, source }: { delta: number; source: string }) {
  // Only show a real directional badge when we have actual historical data
  const isHistorical = source === 'site_history' || source === 'rank_history';
  if (!isHistorical) return null;
  const isUp = delta > 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: isUp ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
        color: isUp ? '#4ade80' : '#f87171',
        border: `1px solid ${isUp ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
      }}
    >
      {isUp ? '+' : '-'}{Math.abs(delta)}
    </span>
  );
}

function VolatilityBadge({ volatility }: { volatility?: number }) {
  if (!volatility || volatility <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: 'rgba(130,200,229,0.08)',
        color: '#82c8e5',
        border: '1px solid rgba(130,200,229,0.18)',
      }}
    >
      {volatility.toFixed(1)}
    </span>
  );
}

function RankChip({ rank }: { rank: number }) {
  return (
    <span className="text-[11px] font-bold text-[#6d8196] bg-white/5 border border-white/[0.06] px-2 py-0.5 rounded-md tabular-nums">
      #{rank}
    </span>
  );
}

function LiveCounter({ rate }: { rate: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      setCount(Math.floor(rate * (Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [rate]);
  return <span className="font-mono text-emerald-400 tabular-nums text-xs">+{count.toLocaleString()}</span>;
}

interface MoverCardProps { site: TrendingSite; isRiser: boolean; source: string; }

function MoverCard({ site, source }: MoverCardProps) {
  return (
    <Link
      href={`/sites/${site.id}`}
      className="group flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-200"
      style={{ '--card-glow': site.glow } as React.CSSProperties}
    >
      {/* Rank badge + delta/volatility on the left */}
      <div className="flex flex-col items-center gap-1 w-12 flex-shrink-0">
        <RankChip rank={site.currentRank} />
        <DeltaBadge delta={site.delta} source={source} />
        <VolatilityBadge volatility={site.volatility} />
      </div>

      {/* Favicon */}
      <FaviconImg url={site.url} logo={site.logo} color={site.color} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-white group-hover:text-[#82c8e5] transition-colors truncate">
            {site.name}
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize"
            style={{
              backgroundColor: site.color + '18',
              color: site.color === '#ffffff' ? '#c0cfd8' : site.color,
            }}
          >
            {site.category}
          </span>
        </div>
        <div className="text-xs text-[#6d8196] mt-0.5">{site.baseline}</div>
      </div>

      {/* Live counter */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-[10px] text-[#6d8196]">visits since load</span>
        <LiveCounter rate={site.rate} />
        <span className="text-[10px] text-[#6d8196]">{site.rate.toLocaleString()}/s</span>
      </div>
    </Link>
  );
}

export default function TrendingPageClient({ risers, fallers, source, snapshotAge }: Props) {
  const [activeTab, setActiveTab] = useState<'risers' | 'fallers'>('risers');
  const sites = activeTab === 'risers' ? risers : fallers;
  const isEmpty = sites.length === 0;

  const isHistoricalData = source === 'site_history' || source === 'rank_history';
  const isVolatility = source === 'volatility';

  const sourceLabel: Record<string, string> = {
    site_history: 'PTI snapshot delta',
    rank_history: 'rank history delta',
    volatility: 'volatility index',
    rate_order: 'traffic rate index',
    static: 'static baseline',
  };
  const sourceBadge = sourceLabel[source] ?? source;

  // Tab labels change based on data quality
  const riserLabel = isHistoricalData ? 'Rising' : isVolatility ? 'Most Active' : 'Highest Traffic';
  const fallerLabel = isHistoricalData ? 'Falling' : isVolatility ? 'Stabilizing' : 'More Sites';

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      <div className="mesh-gradient fixed inset-0 pointer-events-none z-0" />
      <NavHeader />

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#82c8e5] bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#82c8e5] animate-pulse" />
            Live Rankings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
            Trending Sites
          </h1>
          <p className="text-[#6d8196] text-base leading-relaxed max-w-xl">
            Websites with the biggest rank movements detected by the Pulse Traffic Index engine.
            Updated every 6 hours.
          </p>
          {(snapshotAge || source) && (
            <p className="text-[10px] text-[#6d8196]/60 mt-2 flex items-center gap-2">
              {snapshotAge && <span>Last snapshot: {new Date(snapshotAge).toLocaleString()} ·</span>}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  backgroundColor: isHistoricalData ? 'rgba(74,222,128,0.1)' : 'rgba(130,200,229,0.08)',
                  color: isHistoricalData ? '#4ade80' : '#82c8e5',
                  border: `1px solid ${isHistoricalData ? 'rgba(74,222,128,0.2)' : 'rgba(130,200,229,0.15)'}`,
                }}
              >
                {isHistoricalData ? 'Live delta' : 'Estimated'} · {sourceBadge}
              </span>
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('risers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'risers'
                ? isHistoricalData
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#82c8e5]/10 text-[#82c8e5] border border-[#82c8e5]/25'
                : 'text-[#6d8196] hover:text-white border border-transparent hover:border-white/10 hover:bg-white/[0.04]'
            }`}
          >
            {riserLabel}
            <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
              activeTab === 'risers'
                ? isHistoricalData ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#82c8e5]/15 text-[#82c8e5]'
                : 'bg-white/10 text-white/50'
            }`}>
              {risers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('fallers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'fallers'
                ? isHistoricalData
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-[#6d8196]/10 text-[#c0cfd8] border border-[#6d8196]/25'
                : 'text-[#6d8196] hover:text-white border border-transparent hover:border-white/10 hover:bg-white/[0.04]'
            }`}
          >
            {fallerLabel}
            <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
              activeTab === 'fallers'
                ? isHistoricalData ? 'bg-red-500/20 text-red-400' : 'bg-[#6d8196]/20 text-[#c0cfd8]'
                : 'bg-white/10 text-white/50'
            }`}>
              {fallers.length}
            </span>
          </button>
        </div>

        {/* Legend - adapts to data source */}
        <div className="flex items-center gap-4 text-[11px] text-[#6d8196] mb-4 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/20" /> Current global rank
          </span>
          {isHistoricalData ? (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(74,222,128,0.12)', color: '#4ade80' }}
              >
                +N
              </span>
              Positions moved
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(130,200,229,0.08)', color: '#82c8e5' }}
              >
                N.N
              </span>
              {isVolatility ? 'PTI volatility score' : 'Traffic velocity rank'}
            </span>
          )}
        </div>

        {/* Site list */}
        {isEmpty ? (
          <div className="text-center py-20 text-[#6d8196]">
            <p className="font-semibold text-lg text-white/70">No data available yet</p>
            <p className="text-sm mt-1">
              The PTI engine writes history every 6 hours. Check back after the next cron run.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sites.map((site, idx) => (
              <div
                key={site.id}
                className="flex items-stretch gap-3"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Position number */}
                <div className="flex items-center justify-center w-7 flex-shrink-0 text-[#6d8196] text-xs font-bold tabular-nums">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <MoverCard site={site} isRiser={activeTab === 'risers'} source={source} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explanation card */}
        <div className="mt-12 p-5 rounded-2xl border border-[#82c8e5]/10 bg-[#82c8e5]/[0.03]">
          <h3 className="text-sm font-bold text-white mb-1.5">How ranking moves are calculated</h3>
          {isHistoricalData ? (
            <p className="text-xs text-[#6d8196] leading-relaxed">
              The Pulse Traffic Index (PTI) engine runs every 6 hours, collecting DNS telemetry from
              Cloudflare Radar, link authority from Open PageRank, and AI sentiment from Groq. Each run
              computes a fresh global rank for all tracked domains. Sites shown here had the largest
              position shifts between the two most recent engine snapshots.
            </p>
          ) : (
            <p className="text-xs text-[#6d8196] leading-relaxed">
              Historical rank deltas are computed after each PTI engine run (every 6 hours). Until at
              least two engine snapshots are available, this page estimates movement using the{' '}
              <strong className="text-white/70">{sourceBadge}</strong>. Sites with high traffic
              velocity and rank volatility appear under Most Active, while consolidating sites
              appear under Stabilizing. Deltas will become precise after the next PTI cron cycle.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
