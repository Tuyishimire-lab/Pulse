'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import NavHeader from '../components/NavHeader';
import FaviconImage from '../components/ui/FaviconImage';
import Pagination from '../components/ui/Pagination';
import { CATEGORIES } from '../data/sites';
import type { MonitoredPlatformStatus } from '../../lib/statusResolver';
import type { FormattedOutageItem } from '../../lib/radarOutages';
import type { RadarStatsData } from '../../types/radar';

interface StatusPageClientProps {
  initialPlatforms: MonitoredPlatformStatus[];
  initialOutages: FormattedOutageItem[];
  outageSource: string;
  radarStats: RadarStatsData;
}

const ITEMS_PER_PAGE = 24;

const CATEGORY_LABEL_MAP: Record<string, string> = {
  dev: 'Developer Tools',
  entertainment: 'Entertainment',
  ecommerce: 'E-Commerce',
  ai: 'AI Assistants',
  social: 'Social Media',
  finance: 'Finance & Crypto',
  news: 'News & Media',
  reference: 'Reference',
  search: 'Search',
};

function getPlatformTelemetryTier(p: MonitoredPlatformStatus): 1 | 2 | 3 {
  if (p.status.telemetryTier) return p.status.telemetryTier;
  if (p.status.source === 'statuspage') return 1;
  if (p.status.source === 'crux-telemetry') return 2;
  return 3;
}

export default function StatusPageClient({
  initialPlatforms,
  initialOutages,
  outageSource,
  radarStats,
}: StatusPageClientProps) {
  const [outages, setOutages] = useState<FormattedOutageItem[]>(initialOutages);
  const [source, setSource] = useState<string>(outageSource);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTelemetryTier, setActiveTelemetryTier] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'operational' | 'issues'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hydration-safe timestamp initialization + 60s visibility-aware polling
  useEffect(() => {
    setLastRefreshed(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    const pollOutages = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        setIsRefreshing(true);
        const res = await fetch('/api/outages');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.outages)) {
            setOutages(data.outages);
            if (data.source) setSource(data.source);
            setLastRefreshed(
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            );
          }
        }
      } catch {
        // Keep existing state on transient failure
      } finally {
        setIsRefreshing(false);
      }
    };

    const intervalId = setInterval(pollOutages, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Filter setters that reset currentPage to 1
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleTelemetryTierChange = (tier: 'all' | 'tier1' | 'tier2' | 'tier3') => {
    setActiveTelemetryTier(tier);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: 'all' | 'operational' | 'issues') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveTelemetryTier('all');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeCategory !== 'all' ||
    activeTelemetryTier !== 'all' ||
    filterStatus !== 'all';

  // 4-Dimension filter evaluation
  const filteredPlatforms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialPlatforms.filter((p) => {
      // 1. Search Query filter (matches name, domain, category, detail, or status label)
      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDomain = p.domain.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesDetail = p.status.detail.toLowerCase().includes(query);
        const matchesLabel = p.status.label.toLowerCase().includes(query);
        if (!matchesName && !matchesDomain && !matchesCategory && !matchesDetail && !matchesLabel) {
          return false;
        }
      }

      // 2. Category filter
      if (activeCategory !== 'all' && p.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }

      // 3. Telemetry Tier filter
      if (activeTelemetryTier !== 'all') {
        const tier = getPlatformTelemetryTier(p);
        if (activeTelemetryTier === 'tier1' && tier !== 1) return false;
        if (activeTelemetryTier === 'tier2' && tier !== 2) return false;
        if (activeTelemetryTier === 'tier3' && tier !== 3) return false;
      }

      // 4. Health Status filter
      if (filterStatus === 'operational') {
        if (p.status.tier !== 'operational') return false;
      } else if (filterStatus === 'issues') {
        if (p.status.tier === 'operational') return false;
      }

      return true;
    });
  }, [initialPlatforms, searchQuery, activeCategory, activeTelemetryTier, filterStatus]);

  // Pagination calculation
  const totalItems = filteredPlatforms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedPlatforms = useMemo(() => {
    return filteredPlatforms.slice(startIndex, endIndex);
  }, [filteredPlatforms, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('monitored-platforms-heading');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Metrics and statistics across all initial platforms
  const operationalCount = useMemo(
    () => initialPlatforms.filter((p) => p.status.tier === 'operational').length,
    [initialPlatforms]
  );
  const issueCount = initialPlatforms.length - operationalCount;

  const tier1Count = useMemo(
    () => initialPlatforms.filter((p) => getPlatformTelemetryTier(p) === 1).length,
    [initialPlatforms]
  );
  const tier2Count = useMemo(
    () => initialPlatforms.filter((p) => getPlatformTelemetryTier(p) === 2).length,
    [initialPlatforms]
  );
  const tier3Count = useMemo(
    () => initialPlatforms.filter((p) => getPlatformTelemetryTier(p) === 3).length,
    [initialPlatforms]
  );

  const activeOutageCount = useMemo(
    () => outages.filter((o) => !o.raw?.endDate).length,
    [outages]
  );

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans pb-16 overflow-x-hidden">
      <div className="mesh-gradient fixed inset-0 pointer-events-none z-0 opacity-60" />

      <NavHeader />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">
            Pulse
          </Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Live Status &amp; Outages</span>
        </nav>

        {/* Hero Banner */}
        <header className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-[#070b16] to-[#04040c] mb-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {issueCount === 0
                    ? `All ${operationalCount} Monitored Catalog Platforms Operational`
                    : `${issueCount} Platform Advisory · ${operationalCount} Operational`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight m-0 bg-gradient-to-r from-white via-white to-[#82c8e5] bg-clip-text text-transparent">
                Live Internet Outage &amp; Status Tracker
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-2 max-w-2xl leading-relaxed m-0">
                Real-time operational health checks across all {initialPlatforms.length} top web platforms powered by Statuspage v2 APIs, CrUX real-user latency telemetry, and Cloudflare Radar global BGP/ASN disruption tracking.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#82c8e5] font-mono bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/10">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRefreshing ? 'bg-amber-400 animate-ping' : 'bg-[#82c8e5]'
                  }`}
                />
                <span>
                  {lastRefreshed ? `Synced ${lastRefreshed}` : 'Live Stream Active'}
                </span>
              </div>
              <span className="text-[11px] text-[#6d8196]">
                Auto-refreshes every 60s · Source: {source === 'cloudflare' ? 'Cloudflare Radar + Telemetry' : 'Edge Telemetry + Statuspage'}
              </span>
            </div>
          </div>

          {/* 4 Global Network Vitals Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Platforms Healthy
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 tabular-nums">
                {operationalCount} / {initialPlatforms.length}
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block truncate">
                {tier1Count} Statuspage · {tier2Count} CrUX · {tier3Count} Edge
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Active ASN Alerts (7d)
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 tabular-nums">
                {activeOutageCount} Active
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block truncate">
                {outages.length} recorded in 7d · Cloudflare Radar
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Global HTTP/3 Adoption
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#82c8e5] mt-1 tabular-nums">
                {radarStats.httpVersion.http3}%
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block truncate">
                HTTP/2 at {radarStats.httpVersion.http2}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Global Edge Latency
              </span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1 tabular-nums">
                {radarStats.quality.latency} ms
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block truncate">
                DNS {radarStats.quality.dnsResponseTime} ms · {radarStats.deviceType.mobile}% Mobile
              </span>
            </div>
          </div>
        </header>

        {/* Section 1: Monitored Catalog Platforms Directory */}
        <section className="mb-10" aria-labelledby="monitored-platforms-heading">
          {/* Contained Filter Console Card — aligns 100% with Hero Banner & Grid boundaries */}
          <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-white/[0.02] mb-5 shadow-xl space-y-4">
            {/* Console Row 1: Title & Operational Status Segmented Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
              <div className="min-w-0">
                <h2
                  id="monitored-platforms-heading"
                  className="text-base sm:text-lg font-extrabold text-white m-0"
                >
                  Real-Time Platform Status Directory
                </h2>
                <p className="text-xs text-[#6d8196] m-0 mt-0.5">
                  Monitoring all {initialPlatforms.length} catalog platforms across Statuspage v2 feeds, CrUX field telemetry, and edge reachability.
                </p>
              </div>

              <div className="inline-flex rounded-xl bg-white/[0.03] p-1 border border-white/10 self-start md:self-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleStatusChange('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-[#82c8e5]/20 text-[#82c8e5]'
                      : 'text-[#6d8196] hover:text-white'
                  }`}
                >
                  All ({initialPlatforms.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('operational')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'operational'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-[#6d8196] hover:text-white'
                  }`}
                >
                  Operational ({operationalCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('issues')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'issues'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-[#6d8196] hover:text-white'
                  }`}
                >
                  Incidents ({issueCount})
                </button>
              </div>
            </div>

            {/* Console Row 2: Search Input & Telemetry Tier Filter Pills */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative w-full lg:w-64 flex-shrink-0">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={`Search ${initialPlatforms.length} platforms...`}
                  aria-label="Filter monitored platforms"
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-[#6d8196] focus:outline-none focus:border-[#82c8e5]/50"
                />
                <svg
                  className="w-3.5 h-3.5 text-[#82c8e5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap" role="tablist" aria-label="Telemetry tiers">
                <button
                  type="button"
                  onClick={() => handleTelemetryTierChange('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTelemetryTier === 'all'
                      ? 'bg-[#82c8e5]/20 text-[#82c8e5] border border-[#82c8e5]/40'
                      : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  role="tab"
                  aria-selected={activeTelemetryTier === 'all'}
                >
                  All Tiers ({initialPlatforms.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleTelemetryTierChange('tier1')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTelemetryTier === 'tier1'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  role="tab"
                  aria-selected={activeTelemetryTier === 'tier1'}
                >
                  Tier 1 · Statuspage ({tier1Count})
                </button>
                <button
                  type="button"
                  onClick={() => handleTelemetryTierChange('tier2')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTelemetryTier === 'tier2'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  role="tab"
                  aria-selected={activeTelemetryTier === 'tier2'}
                >
                  Tier 2 · CrUX ({tier2Count})
                </button>
                <button
                  type="button"
                  onClick={() => handleTelemetryTierChange('tier3')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTelemetryTier === 'tier3'
                      ? 'bg-slate-500/20 text-slate-200 border border-slate-400/40'
                      : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:bg-white/[0.06] hover:text-white'
                  }`}
                  role="tab"
                  aria-selected={activeTelemetryTier === 'tier3'}
                >
                  Tier 3 · Edge ({tier3Count})
                </button>
              </div>
            </div>

            {/* Console Row 3: Category Filter Pills (Wrapped cleanly inside card — zero right-edge clipping) */}
            <div
              className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-white/[0.06]"
              role="tablist"
              aria-label="Catalog categories"
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0047ab] text-white border border-[#82c8e5]/40 shadow-[0_0_12px_rgba(0,71,171,0.35)]'
                        : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:bg-white/[0.06] hover:text-white'
                    }`}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter Summary Bar */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-3 px-1">
              <span>
                Found <strong className="text-white">{filteredPlatforms.length}</strong> matching platforms
                {activeCategory !== 'all' && (
                  <> in <span className="text-[#82c8e5] font-semibold">{CATEGORY_LABEL_MAP[activeCategory] || activeCategory}</span></>
                )}
                {activeTelemetryTier !== 'all' && (
                  <> under <span className="text-[#82c8e5] font-semibold">Tier {activeTelemetryTier.replace('tier', '')}</span></>
                )}
                {filterStatus !== 'all' && (
                  <> with status <span className="text-[#82c8e5] font-semibold">{filterStatus}</span></>
                )}
                {searchQuery.trim() && (
                  <> matching &ldquo;<span className="text-white">{searchQuery.trim()}</span>&rdquo;</>
                )}
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#82c8e5] hover:text-white hover:underline cursor-pointer flex-shrink-0 ml-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Empty State when 0 platforms match filters */}
          {filteredPlatforms.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08] my-6">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#82c8e5]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white mb-1">No platforms match your filters</h3>
              <p className="text-xs text-[#94a3b8] max-w-md mx-auto mb-5">
                We could not find any platforms matching your selected criteria. Try adjusting your search term, clearing category pills, or selecting a different telemetry tier.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0047ab] hover:bg-[#0055cc] text-white text-xs font-semibold shadow-lg shadow-[#0047ab]/30 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Platforms Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayedPlatforms.map((platform) => {
                const tier = platform.status.tier;
                const telemetryTier = getPlatformTelemetryTier(platform);

                const badgeStyles = {
                  operational: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
                  degraded: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
                  advisory: 'bg-sky-500/10 border-sky-500/25 text-sky-300',
                  outage: 'bg-red-500/15 border-red-500/35 text-red-300',
                }[tier];

                const dotColor = {
                  operational: 'bg-emerald-400',
                  degraded: 'bg-amber-400',
                  advisory: 'bg-sky-400',
                  outage: 'bg-red-400',
                }[tier];

                const telemetryBadge = {
                  1: {
                    label: 'Tier 1 · Statuspage',
                    style: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
                  },
                  2: {
                    label: 'Tier 2 · CrUX Telemetry',
                    style: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
                  },
                  3: {
                    label: 'Tier 3 · Edge Baseline',
                    style: 'bg-slate-500/10 text-slate-300 border-slate-500/25',
                  },
                }[telemetryTier];

                const categoryLabel = CATEGORY_LABEL_MAP[platform.category] || platform.category;

                return (
                  <div
                    key={platform.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <Link
                        href={`/sites/${platform.id}`}
                        className="flex items-center gap-3 group min-w-0"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor:
                              platform.color === '#ffffff' ? '#18181b' : `${platform.color}22`,
                            border: `1px solid ${platform.color}44`,
                          }}
                        >
                          <FaviconImage
                            url={`https://${platform.domain}`}
                            logo={platform.logo}
                            color={platform.color}
                            size={24}
                            className="w-6 h-6 rounded object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white group-hover:text-[#82c8e5] transition-colors truncate">
                              {platform.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#82c8e5] bg-[#82c8e5]/10 px-1.5 py-0.5 rounded flex-shrink-0">
                              #{platform.rank}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6d8196] truncate mt-0.5">
                            {platform.domain}
                          </div>
                        </div>
                      </Link>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${badgeStyles}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
                        <span>{platform.status.label}</span>
                      </span>
                    </div>

                    {/* Metadata Badges: Telemetry Tier & Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${telemetryBadge.style}`}
                      >
                        {telemetryBadge.label}
                      </span>
                      <span className="text-[10px] text-[#6d8196] font-medium bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">
                        {categoryLabel}
                      </span>
                    </div>

                    {/* Footer: Detail string & action links */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-[11px] gap-2">
                      <span className="text-[#94a3b8] truncate" title={platform.status.detail}>
                        {platform.status.detail}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {platform.status.statusUrl && (
                          <a
                            href={platform.status.statusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6d8196] hover:text-white transition-colors"
                            title={`Official ${platform.name} Status Page`}
                          >
                            Status ↗
                          </a>
                        )}
                        <Link
                          href={`/sites/${platform.id}`}
                          className="text-[#82c8e5] hover:underline font-semibold"
                        >
                          Metrics →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </section>

        {/* Section 2: Cloudflare Radar Global Network Disruptions & ASN Outage Log */}
        <section className="mb-10" aria-labelledby="asn-outages-heading">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2
                id="asn-outages-heading"
                className="text-base sm:text-lg font-extrabold text-white m-0"
              >
                Global Network &amp; ISP Outage Annotations (7-Day Window)
              </h2>
              <p className="text-xs text-[#6d8196] m-0 mt-0.5">
                Verified regional connectivity anomalies, submarine cable cuts, and carrier ASN disruptions tracked by Cloudflare Radar.
              </p>
            </div>
            <Link
              href="/map"
              className="text-xs font-semibold text-[#82c8e5] bg-[#82c8e5]/10 border border-[#82c8e5]/25 hover:bg-[#82c8e5]/20 px-3.5 py-1.5 rounded-xl transition-all"
            >
              Open Global Traffic Map →
            </Link>
          </div>

          <div className="space-y-3">
            {outages.map((item, idx) => {
              const raw = item.raw;
              const isResolved = Boolean(raw?.endDate);
              const locations =
                raw?.locations && raw.locations.length > 0 ? raw.locations : ['Global'];
              const asns = raw?.asns && raw.asns.length > 0 ? raw.asns : [];
              const cause = raw?.outage?.outageCause
                ? raw.outage.outageCause.replace(/_/g, ' ')
                : 'NETWORK TELEMETRY';

              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isResolved
                            ? 'bg-white/[0.05] border-white/10 text-white/60'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isResolved ? 'bg-white/40' : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                        <span>{isResolved ? 'RESOLVED' : 'ACTIVE ADVISORY'}</span>
                      </span>

                      <span className="text-[10px] font-mono font-semibold text-[#82c8e5] bg-[#82c8e5]/10 px-2 py-0.5 rounded">
                        {cause}
                      </span>

                      {locations.map((loc) => (
                        <span
                          key={loc}
                          className="text-[10px] font-mono text-white/75 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10"
                        >
                          📍 {loc}
                        </span>
                      ))}

                      {asns.slice(0, 4).map((asn) => (
                        <span
                          key={asn}
                          className="text-[10px] font-mono text-[#94a3b8] bg-white/[0.03] px-2 py-0.5 rounded"
                        >
                          AS{asn}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-white/90 font-medium m-0 leading-relaxed">
                      {raw?.description || item.text.replace(/^OUTAGE ALERT:\s*/i, '')}
                    </p>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0 text-[11px] text-[#6d8196] font-mono">
                    {raw?.startDate && (
                      <div>
                        Started: {new Date(raw.startDate).toISOString().slice(0, 16).replace('T', ' ')} UTC
                      </div>
                    )}
                    {raw?.endDate && (
                      <div className="text-emerald-400/80 mt-0.5">
                        Ended: {new Date(raw.endDate).toISOString().slice(0, 16).replace('T', ' ')} UTC
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
