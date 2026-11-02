'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import NavHeader from '../components/NavHeader';
import FaviconImage from '../components/ui/FaviconImage';
import type { Timeframe, TrendingDataset, TrendingSite } from '../../lib/getTrendingData';

interface Props {
  datasets: Record<Timeframe, TrendingDataset>;
}

const TIMEFRAMES: { id: Timeframe; label: string; window: string }[] = [
  { id: '24h', label: '24 Hours', window: '24 hours' },
  { id: '7d', label: '7 Days', window: '7 days' },
  { id: '30d', label: '30 Days', window: 'about 30 days' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Deterministic UTC formatting (identical on server and client — no hydration mismatch). */
function formatUtc(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${hh}:${mm} UTC`;
}

function PlacesBadge({ delta }: { delta: number }) {
  const isUp = delta > 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full tabular-nums flex-shrink-0"
      style={{
        backgroundColor: isUp ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
        color: isUp ? '#4ade80' : '#f87171',
        border: `1px solid ${isUp ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
      }}
      title={`${isUp ? 'Up' : 'Down'} ${Math.abs(delta)} place${Math.abs(delta) === 1 ? '' : 's'}`}
    >
      {isUp ? '▲' : '▼'} {Math.abs(delta)}
    </span>
  );
}

/** Real rank series; better rank (smaller number) is drawn higher. */
function RankSparkline({ ranks, isUp }: { ranks: number[]; isUp: boolean }) {
  if (ranks.length < 2) return <div className="w-20" />;
  const width = 80;
  const height = 26;
  const stroke = isUp ? '#4ade80' : '#f87171';
  const fill = isUp ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)';
  const min = Math.min(...ranks);
  const max = Math.max(...ranks);
  const range = max - min || 1;
  const coords = ranks.map((r, i) => {
    const x = (i / (ranks.length - 1)) * width;
    const y = max === min ? height / 2 : 4 + ((r - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} className="overflow-visible flex-shrink-0" aria-label={`Rank #${ranks[0]} to #${ranks[ranks.length - 1]}`}>
      <path d={`M 0,${height} L ${coords.join(' L ')} L ${width},${height} Z`} fill={fill} />
      <path d={`M ${coords.join(' L ')}`} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoverRow({ site }: { site: TrendingSite }) {
  const isUp = site.delta > 0;
  return (
    <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/15 transition-all flex items-center gap-3.5">
      <div className="w-9 text-center flex-shrink-0">
        <span className="text-xs font-bold text-[#6d8196] tabular-nums">#{site.currentRank}</span>
      </div>

      <FaviconImage
        url={site.url}
        logo={site.logo}
        color={site.color}
        size={36}
        className="w-9 h-9 rounded-full object-contain p-1 bg-white/10 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <Link
          href={`/sites/${site.id}`}
          className="font-bold text-sm text-white hover:text-[#82c8e5] transition-colors truncate block"
        >
          {site.name}
        </Link>
        <div className="text-xs text-[#6d8196] mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="tabular-nums">#{site.previousRank} → #{site.currentRank}</span>
          {site.baseline && (
            <>
              <span>·</span>
              <span>{site.baseline}</span>
            </>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
        <RankSparkline ranks={site.sparkline} isUp={isUp} />
      </div>

      <PlacesBadge delta={site.delta} />

      {site.rivalHref && (
        <Link
          href={site.rivalHref}
          className="hidden md:inline-flex text-[10px] font-semibold text-[#82c8e5] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] px-2 py-1 rounded-lg transition-all flex-shrink-0"
        >
          vs {site.rivalName}
        </Link>
      )}
    </div>
  );
}

export default function TrendingPageClient({ datasets }: Props) {
  const firstAvailable = (['7d', '24h', '30d'] as Timeframe[]).find((t) => datasets[t]?.available) ?? '7d';
  const [timeframe, setTimeframe] = useState<Timeframe>(firstAvailable);
  const [activeTab, setActiveTab] = useState<'all' | 'risers' | 'fallers'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const ds = datasets[timeframe];
  const tfMeta = TIMEFRAMES.find((t) => t.id === timeframe)!;

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (site: TrendingSite) =>
      (selectedCategory === 'all' || site.category === selectedCategory) &&
      (!q || site.name.toLowerCase().includes(q) || site.url.toLowerCase().includes(q));
  }, [selectedCategory, searchQuery]);

  const filteredRisers = useMemo(() => ds.risers.filter(matches), [ds.risers, matches]);
  const filteredFallers = useMemo(() => ds.fallers.filter(matches), [ds.fallers, matches]);
  const topSector = ds.categoryMomentum.find((c) => c.netPlaces > 0) ?? null;

  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col">
      <NavHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] font-bold tracking-widest text-[#82c8e5] uppercase bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-2.5 py-0.5 rounded-md">
                  Rank Movers
                </span>
                {ds.snapshotAt && (
                  <span className="text-[11px] text-[#6d8196]">Latest snapshot: {formatUtc(ds.snapshotAt)}</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Trending Websites &amp; Rank Movers
              </h1>
              <p className="text-sm text-[#8899aa] mt-1.5 max-w-2xl">
                Sites whose position in the Pulse Traffic Index changed over the last {tfMeta.window}
                {ds.comparedAt ? <> (compared with the snapshot from {formatUtc(ds.comparedAt)})</> : null}.
                Snapshots are recorded roughly every 6 hours.{' '}
                <Link href="/methodology" className="underline hover:text-white">Methodology</Link>
              </p>
            </div>

            {/* Timeframe switcher */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start md:self-auto">
              {TIMEFRAMES.map((t) => {
                const available = datasets[t.id]?.available;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTimeframe(t.id)}
                    title={available ? undefined : 'Not enough history yet'}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      timeframe === t.id
                        ? 'bg-[#82c8e5] text-black font-bold shadow-md'
                        : available
                          ? 'text-[#8899aa] hover:text-white hover:bg-white/[0.04]'
                          : 'text-[#4a5a6a] hover:text-[#8899aa]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {!ds.available ? (
          /* Honest empty state — never show simulated movers */
          <div className="p-10 rounded-2xl border border-white/[0.08] bg-white/[0.015] text-center">
            <div className="text-base font-bold text-white mb-2">Not enough history for this timeframe yet</div>
            <p className="text-sm text-[#8899aa] max-w-xl mx-auto">
              Rank changes for the last {tfMeta.window} need a snapshot from about that long ago. Pulse records a full
              ranking roughly every 6 hours and keeps weekly snapshots, so this view fills in automatically as history builds up.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              {TIMEFRAMES.filter((t) => t.id !== timeframe && datasets[t.id]?.available).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#82c8e5]/30 text-[#82c8e5] hover:bg-[#82c8e5]/10"
                >
                  View {t.label}
                </button>
              ))}
              <Link href="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 text-[#8899aa] hover:text-white">
                Live dashboard
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Spotlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {ds.biggestClimber && (
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-emerald-500/[0.08] to-transparent">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Biggest Climber</div>
                  <div className="flex items-center gap-3">
                    <FaviconImage url={ds.biggestClimber.url} logo={ds.biggestClimber.logo} color={ds.biggestClimber.color} size={36} className="w-9 h-9 rounded-full object-contain p-1 bg-white/10 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/sites/${ds.biggestClimber.id}`} className="font-bold text-white text-sm truncate block hover:text-[#82c8e5]">
                        {ds.biggestClimber.name}
                      </Link>
                      <div className="text-xs text-[#6d8196] tabular-nums">#{ds.biggestClimber.previousRank} → #{ds.biggestClimber.currentRank}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-400">▲ {ds.biggestClimber.delta}</div>
                      <div className="text-[10px] text-[#6d8196]">places</div>
                    </div>
                  </div>
                </div>
              )}

              {ds.mostVolatile && (
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-sky-500/[0.08] to-transparent">
                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2">Most Volatile</div>
                  <div className="flex items-center gap-3">
                    <FaviconImage url={ds.mostVolatile.url} logo={ds.mostVolatile.logo} color={ds.mostVolatile.color} size={36} className="w-9 h-9 rounded-full object-contain p-1 bg-white/10 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/sites/${ds.mostVolatile.id}`} className="font-bold text-white text-sm truncate block hover:text-[#82c8e5]">
                        {ds.mostVolatile.name}
                      </Link>
                      <div className="text-xs text-[#6d8196]">Across {ds.pointsInWindow} snapshots</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-sky-400">±{ds.mostVolatile.volatility}</div>
                      <div className="text-[10px] text-[#6d8196]">places (std. dev.)</div>
                    </div>
                  </div>
                </div>
              )}

              {topSector && (
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-purple-500/[0.08] to-transparent">
                  <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">Strongest Sector</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{topSector.label}</div>
                      <div className="text-xs text-[#6d8196] mt-0.5">
                        {topSector.risers} up · {topSector.fallers} down · {topSector.siteCount} sites
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-purple-400">+{topSector.netPlaces}</div>
                      <div className="text-[10px] text-[#6d8196]">net places</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sector grid */}
            <div className="mb-8 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.015]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-[#82c8e5] uppercase tracking-widest">Sector Momentum</h2>
                <span className="text-[11px] text-[#6d8196]">Net places gained or lost · click to filter</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedCategory === 'all'
                      ? 'border-[#82c8e5] bg-[#82c8e5]/10 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-[#8899aa] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-[11px] font-semibold">All Categories</div>
                  <div className="text-xs font-bold text-white mt-1">{ds.totalSites} sites</div>
                </button>
                {ds.categoryMomentum.map((cat) => {
                  const isSelected = selectedCategory === cat.category;
                  const tone = cat.netPlaces > 0 ? 'text-emerald-400' : cat.netPlaces < 0 ? 'text-red-400' : 'text-[#6d8196]';
                  return (
                    <button
                      key={cat.category}
                      onClick={() => setSelectedCategory(isSelected ? 'all' : cat.category)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#82c8e5] bg-[#82c8e5]/10 text-white'
                          : 'border-white/[0.06] bg-white/[0.02] text-[#8899aa] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold truncate">{cat.label}</span>
                        <span className={`text-[10px] font-bold tabular-nums ${tone}`}>
                          {cat.netPlaces > 0 ? '+' : ''}{cat.netPlaces}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#6d8196] mt-1">
                        ▲{cat.risers} ▼{cat.fallers} · {cat.siteCount} sites
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tabs + search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start">
                  {([
                    { id: 'all', label: `All Movers (${filteredRisers.length + filteredFallers.length})` },
                    { id: 'risers', label: `Rising (${filteredRisers.length})` },
                    { id: 'fallers', label: `Declining (${filteredFallers.length})` },
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === tab.id ? 'bg-white/10 text-white' : 'text-[#8899aa] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[#6d8196]">{ds.steadyCount} sites held their rank</span>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Filter by name or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3.5 pr-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white placeholder-[#6d8196] focus:outline-none focus:border-[#82c8e5]/50 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {/* Mover lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(activeTab === 'all' || activeTab === 'risers') && (
                <div className={`space-y-3 ${activeTab === 'risers' ? 'lg:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Top Climbers</h3>
                    <span className="text-xs text-[#6d8196]">{filteredRisers.length} sites gained rank</span>
                  </div>
                  <div className="space-y-2">
                    {filteredRisers.map((site) => <MoverRow key={site.id} site={site} />)}
                    {filteredRisers.length === 0 && (
                      <div className="p-8 text-center text-xs text-[#6d8196] rounded-xl border border-white/[0.04]">
                        No sites gained rank{selectedCategory !== 'all' || searchQuery ? ' for these filters' : ' in this window'}.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'fallers') && (
                <div className={`space-y-3 ${activeTab === 'fallers' ? 'lg:col-span-2' : ''}`}>
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Top Declining</h3>
                    <span className="text-xs text-[#6d8196]">{filteredFallers.length} sites lost rank</span>
                  </div>
                  <div className="space-y-2">
                    {filteredFallers.map((site) => <MoverRow key={site.id} site={site} />)}
                    {filteredFallers.length === 0 && (
                      <div className="p-8 text-center text-xs text-[#6d8196] rounded-xl border border-white/[0.04]">
                        No sites lost rank{selectedCategory !== 'all' || searchQuery ? ' for these filters' : ' in this window'}.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
