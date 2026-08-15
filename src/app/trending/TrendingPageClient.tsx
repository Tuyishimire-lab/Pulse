'use client';

import React, { useState, useMemo } from 'react';
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
  percentageChange: number;
  volatility: number;
  catalyst: string;
  sparkline: number[];
  topRivalId?: string;
  topRivalName?: string;
}

export interface CategoryMomentum {
  category: string;
  label: string;
  velocityPct: number;
  siteCount: number;
  totalRate: number;
  color: string;
}

export interface TrendingDataset {
  timeframe: '24h' | '7d' | '30d';
  snapshotAge?: string;
  risers: TrendingSite[];
  fallers: TrendingSite[];
  breakoutStars: TrendingSite[];
  highVolatility: TrendingSite[];
  categoryMomentum: CategoryMomentum[];
}

interface Props {
  datasets: Record<'24h' | '7d' | '30d', TrendingDataset>;
}

function FaviconImg({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [err, setErr] = useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  if (err) {
    return (
      <span
        className="rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs"
        style={{
          width: 36,
          height: 36,
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
      width={36}
      height={36}
      onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0"
      style={{ backgroundColor: color + '1a', padding: 2 }}
      unoptimized
    />
  );
}

function DeltaBadge({ delta, pct }: { delta: number; pct: number }) {
  const isUp = delta > 0;
  return (
    <div className="flex flex-col items-end">
      <span
        className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: isUp ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
          color: isUp ? '#4ade80' : '#f87171',
          border: `1px solid ${isUp ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
        }}
      >
        {isUp ? '+' : ''}{delta}
      </span>
      <span className="text-[10px] font-mono text-[#6d8196] mt-0.5">
        {pct > 0 ? '+' : ''}{pct}%
      </span>
    </div>
  );
}

function SparklineSvg({ points, isUp }: { points: number[]; isUp: boolean }) {
  const width = 80;
  const height = 26;
  const strokeColor = isUp ? '#4ade80' : '#f87171';
  const fillColor = isUp ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)';

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${coords.join(' L ')}`;
  const areaD = `M 0,${height} L ${coords.join(' L ')} L ${width},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible flex-shrink-0">
      <path d={areaD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TrendingPageClient({ datasets }: Props) {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState<'all' | 'risers' | 'fallers'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentDataset = datasets[timeframe] || datasets['7d'];

  const filteredRisers = useMemo(() => {
    return currentDataset.risers.filter((site) => {
      const matchCat = selectedCategory === 'all' || site.category === selectedCategory;
      const matchQuery = !searchQuery || site.name.toLowerCase().includes(searchQuery.toLowerCase()) || site.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [currentDataset.risers, selectedCategory, searchQuery]);

  const filteredFallers = useMemo(() => {
    return currentDataset.fallers.filter((site) => {
      const matchCat = selectedCategory === 'all' || site.category === selectedCategory;
      const matchQuery = !searchQuery || site.name.toLowerCase().includes(searchQuery.toLowerCase()) || site.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [currentDataset.fallers, selectedCategory, searchQuery]);

  const totalMovers = filteredRisers.length + filteredFallers.length;

  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col">
      <NavHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-widest text-[#82c8e5] uppercase bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-2.5 py-0.5 rounded-md">
                  Momentum Intelligence
                </span>
                {currentDataset.snapshotAge && (
                  <span className="text-[11px] text-[#6d8196]">
                    Updated: {new Date(currentDataset.snapshotAge).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Trending Websites & Rank Movers
              </h1>
              <p className="text-sm text-[#8899aa] mt-1.5 max-w-2xl">
                Global traffic momentum based on Cloudflare Radar DNS flux and weekly engine snapshots.
              </p>
            </div>

            {/* Timeframe Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start md:self-auto">
              {[
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    timeframe === t.id
                      ? 'bg-[#82c8e5] text-black font-bold shadow-md'
                      : 'text-[#8899aa] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spotlight Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Spotlight 1: Breakout Star */}
          {currentDataset.breakoutStars[0] && (
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-emerald-500/[0.08] to-transparent relative overflow-hidden">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                Top Velocity Breakout
              </div>
              <div className="flex items-center gap-3">
                <FaviconImg
                  url={currentDataset.breakoutStars[0].url}
                  logo={currentDataset.breakoutStars[0].logo}
                  color={currentDataset.breakoutStars[0].color}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm truncate">
                    {currentDataset.breakoutStars[0].name}
                  </div>
                  <div className="text-xs text-[#6d8196]">
                    Rank #{currentDataset.breakoutStars[0].currentRank} - {currentDataset.breakoutStars[0].baseline}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-400">
                    +{currentDataset.breakoutStars[0].percentageChange}%
                  </div>
                  <div className="text-[10px] text-[#6d8196]">Velocity</div>
                </div>
              </div>
            </div>
          )}

          {/* Spotlight 2: Turbulence Radar */}
          {currentDataset.highVolatility[0] && (
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-sky-500/[0.08] to-transparent relative overflow-hidden">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2">
                Highest Volatility Radar
              </div>
              <div className="flex items-center gap-3">
                <FaviconImg
                  url={currentDataset.highVolatility[0].url}
                  logo={currentDataset.highVolatility[0].logo}
                  color={currentDataset.highVolatility[0].color}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm truncate">
                    {currentDataset.highVolatility[0].name}
                  </div>
                  <div className="text-xs text-[#6d8196]">
                    Rank #{currentDataset.highVolatility[0].currentRank} - {currentDataset.highVolatility[0].catalyst}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-sky-400">
                    {currentDataset.highVolatility[0].volatility.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-[#6d8196]">Turbulence Index</div>
                </div>
              </div>
            </div>
          )}

          {/* Spotlight 3: Sector Growth Leader */}
          {currentDataset.categoryMomentum[0] && (
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-purple-500/[0.08] to-transparent relative overflow-hidden">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                Fastest Growing Sector
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">
                    {currentDataset.categoryMomentum[0].label}
                  </div>
                  <div className="text-xs text-[#6d8196] mt-0.5">
                    {currentDataset.categoryMomentum[0].siteCount} sites tracked
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-purple-400">
                    {currentDataset.categoryMomentum[0].velocityPct > 0 ? '+' : ''}
                    {currentDataset.categoryMomentum[0].velocityPct}%
                  </div>
                  <div className="text-[10px] text-[#6d8196]">Net Sector Growth</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Momentum Bar */}
        <div className="mb-8 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.015]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#82c8e5] uppercase tracking-widest">
              Sector Momentum Velocity Matrix
            </h2>
            <span className="text-[11px] text-[#6d8196]">
              Click any sector to filter
            </span>
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
              <div className="text-xs font-bold text-white mt-1">103 Sites</div>
            </button>

            {currentDataset.categoryMomentum.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              const isPositive = cat.velocityPct >= 0;
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
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold truncate">{cat.label}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}{cat.velocityPct}%
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6d8196] mt-1">
                    {cat.siteCount} sites
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter and Tab Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start">
            {[
              { id: 'all', label: `All Movers (${totalMovers})` },
              { id: 'risers', label: `Rising (${filteredRisers.length})` },
              { id: 'fallers', label: `Declining (${filteredFallers.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-[#8899aa] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search input */}
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

        {/* Mover Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risers Column */}
          {(activeTab === 'all' || activeTab === 'risers') && (
            <div className={`space-y-3 ${activeTab === 'risers' ? 'lg:col-span-2' : ''}`}>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  Top Climbers
                </h3>
                <span className="text-xs text-[#6d8196]">
                  {filteredRisers.length} sites gaining rank
                </span>
              </div>

              <div className="space-y-2">
                {filteredRisers.map((site) => (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/15 transition-all flex items-center gap-3.5"
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#6d8196] tabular-nums">
                        #{site.currentRank}
                      </span>
                    </div>

                    {/* Favicon */}
                    <FaviconImg url={site.url} logo={site.logo} color={site.color} />

                    {/* Site Info & Catalyst */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sites/${site.id}`}
                          className="font-bold text-sm text-white hover:text-[#82c8e5] transition-colors truncate"
                        >
                          {site.name}
                        </Link>
                        <span className="text-[10px] font-medium text-[#82c8e5] bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-1.5 py-0.2 rounded">
                          {site.catalyst}
                        </span>
                      </div>
                      <div className="text-xs text-[#6d8196] mt-0.5 flex items-center gap-2">
                        <span>{site.baseline}</span>
                        <span>·</span>
                        <span>~{site.rate.toLocaleString()} / sec</span>
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div className="hidden sm:block">
                      <SparklineSvg points={site.sparkline} isUp={true} />
                    </div>

                    {/* Delta Badge */}
                    <DeltaBadge delta={site.delta} pct={site.percentageChange} />

                    {/* Rival Battle Link */}
                    {site.topRivalId && (
                      <Link
                        href={`/compare/${site.id}-vs-${site.topRivalId}`}
                        className="hidden md:inline-flex text-[10px] font-semibold text-[#82c8e5] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] px-2 py-1 rounded-lg transition-all flex-shrink-0"
                      >
                        vs {site.topRivalName}
                      </Link>
                    )}
                  </div>
                ))}

                {filteredRisers.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#6d8196] rounded-xl border border-white/[0.04]">
                    No rising sites match the current filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallers Column */}
          {(activeTab === 'all' || activeTab === 'fallers') && (
            <div className={`space-y-3 ${activeTab === 'fallers' ? 'lg:col-span-2' : ''}`}>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">
                  Top Declining
                </h3>
                <span className="text-xs text-[#6d8196]">
                  {filteredFallers.length} sites dropping rank
                </span>
              </div>

              <div className="space-y-2">
                {filteredFallers.map((site) => (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/15 transition-all flex items-center gap-3.5"
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#6d8196] tabular-nums">
                        #{site.currentRank}
                      </span>
                    </div>

                    {/* Favicon */}
                    <FaviconImg url={site.url} logo={site.logo} color={site.color} />

                    {/* Site Info & Catalyst */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sites/${site.id}`}
                          className="font-bold text-sm text-white hover:text-[#82c8e5] transition-colors truncate"
                        >
                          {site.name}
                        </Link>
                        <span className="text-[10px] font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.2 rounded">
                          {site.catalyst}
                        </span>
                      </div>
                      <div className="text-xs text-[#6d8196] mt-0.5 flex items-center gap-2">
                        <span>{site.baseline}</span>
                        <span>·</span>
                        <span>~{site.rate.toLocaleString()} / sec</span>
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div className="hidden sm:block">
                      <SparklineSvg points={site.sparkline} isUp={false} />
                    </div>

                    {/* Delta Badge */}
                    <DeltaBadge delta={site.delta} pct={site.percentageChange} />

                    {/* Rival Battle Link */}
                    {site.topRivalId && (
                      <Link
                        href={`/compare/${site.id}-vs-${site.topRivalId}`}
                        className="hidden md:inline-flex text-[10px] font-semibold text-[#82c8e5] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] px-2 py-1 rounded-lg transition-all flex-shrink-0"
                      >
                        vs {site.topRivalName}
                      </Link>
                    )}
                  </div>
                ))}

                {filteredFallers.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#6d8196] rounded-xl border border-white/[0.04]">
                    No declining sites match the current filters.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
