'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import NavHeader from '../components/NavHeader';
import FaviconImage from '../components/ui/FaviconImage';
import type { MonitoredPlatformStatus } from '../../lib/statusResolver';
import type { FormattedOutageItem } from '../api/outages/route';
import type { RadarStatsData } from '../../types/radar';

interface StatusPageClientProps {
  initialPlatforms: MonitoredPlatformStatus[];
  initialOutages: FormattedOutageItem[];
  outageSource: string;
  radarStats: RadarStatsData;
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
  const [filterTier, setFilterTier] = useState<'all' | 'operational' | 'issues'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hydration-safe timestamp initialization + 60s visibility-aware polling
  useEffect(() => {
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

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

  const filteredPlatforms = useMemo(() => {
    return initialPlatforms.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterTier === 'operational') return p.status.tier === 'operational';
      if (filterTier === 'issues') return p.status.tier !== 'operational';
      return true;
    });
  }, [initialPlatforms, searchQuery, filterTier]);

  const operationalCount = useMemo(
    () => initialPlatforms.filter((p) => p.status.tier === 'operational').length,
    [initialPlatforms]
  );

  const issueCount = initialPlatforms.length - operationalCount;

  const activeOutageCount = useMemo(
    () => outages.filter((o) => !o.raw?.endDate).length,
    [outages]
  );

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans pb-16">
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
        <header className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-[#070b16] to-[#04040c] mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {issueCount === 0
                    ? `All ${operationalCount} Monitored Core Platforms Operational`
                    : `${issueCount} Platform Advisory · ${operationalCount} Operational`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight m-0 bg-gradient-to-r from-white via-white to-[#82c8e5] bg-clip-text text-transparent">
                Live Internet Outage &amp; Status Tracker
              </h1>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-2 max-w-2xl leading-relaxed m-0">
                Real-time operational health checks from official Statuspage v2 endpoints combined with Cloudflare Radar global BGP/ASN network disruption telemetry.
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
                Auto-refreshes every 60s · Source: {source === 'cloudflare' ? 'Cloudflare Radar + Statuspage' : 'Edge Telemetry + Statuspage'}
              </span>
            </div>
          </div>

          {/* 4 Global Network Vitals Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.06]">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Platforms Healthy
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {operationalCount} / {initialPlatforms.length}
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block">
                Direct Statuspage v2 API
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Active ASN Alerts (7d)
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                {activeOutageCount} Active · {outages.length} Total
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block">
                Cloudflare Radar Outages
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Global HTTP/3 Adoption
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#82c8e5] mt-1">
                {radarStats.httpVersion.http3}%
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block">
                HTTP/2 at {radarStats.httpVersion.http2}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block">
                Global Edge Latency
              </span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {radarStats.quality.latency} ms
              </div>
              <span className="text-[11px] text-[#94a3b8] mt-0.5 block">
                DNS {radarStats.quality.dnsResponseTime} ms · {radarStats.deviceType.mobile}% Mobile
              </span>
            </div>
          </div>
        </header>

        {/* Section 1: Monitored Major Platforms Grid */}
        <section className="mb-10" aria-labelledby="monitored-platforms-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2
                id="monitored-platforms-heading"
                className="text-base sm:text-lg font-extrabold text-white m-0"
              >
                Real-Time Platform Status Directory
              </h2>
              <p className="text-xs text-[#6d8196] m-0 mt-0.5">
                Click any platform to inspect its full real-time traffic counter, CrUX latency, and historical rank trajectory.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter platforms..."
                aria-label="Filter monitored platforms"
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-[#6d8196] focus:outline-none focus:border-[#82c8e5]/50 w-44"
              />
              <div className="inline-flex rounded-xl bg-white/[0.03] p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setFilterTier('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterTier === 'all'
                      ? 'bg-[#82c8e5]/20 text-[#82c8e5]'
                      : 'text-[#6d8196] hover:text-white'
                  }`}
                >
                  All ({initialPlatforms.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTier('operational')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterTier === 'operational'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-[#6d8196] hover:text-white'
                  }`}
                >
                  Operational ({operationalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTier('issues')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterTier === 'issues'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-[#6d8196] hover:text-white'
                  }`}
                >
                  Incidents ({issueCount})
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPlatforms.map((platform) => {
              const tier = platform.status.tier;
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

              return (
                <div
                  key={platform.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
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
                        <div className="font-bold text-sm text-white group-hover:text-[#82c8e5] transition-colors truncate">
                          {platform.name}
                        </div>
                        <div className="text-[11px] text-[#6d8196] truncate">
                          {platform.domain} · #{platform.rank} Global
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

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-[11px]">
                    <span className="text-[#94a3b8] truncate pr-2" title={platform.status.detail}>
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
