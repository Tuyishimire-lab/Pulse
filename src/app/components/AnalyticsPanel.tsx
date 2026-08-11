'use client';

import React from 'react';
import { getCategoryColor } from '../../utils/categories';

interface AnalyticsStats {
  totalRate: number;
  avgRank: number;
  categoryCounts: Record<string, number>;
}

interface RadarStats {
  source?: string;
  deviceType?: { mobile: number; desktop: number; other: number };
  httpVersion?: { http3: number; http2: number; http1: number };
  topLocations?: { location: string; name: string; percentage: number }[];
  quality?: { latency: number; bandwidth: number; dnsResponseTime: number };
}

interface AnalyticsPanelProps {
  analyticsStats: AnalyticsStats;
  filteredCount: number;
  radarStats: RadarStats | null;
  loadingRadar: boolean;
  selectedCountry: string;
  trafficTierFilter: 'all' | 'enterprise' | 'midmarket' | 'growth';
  onTrafficTierChange: (v: 'all' | 'enterprise' | 'midmarket' | 'growth') => void;
  sortBy: 'rank' | 'rate' | 'name';
  onSortByChange: (v: 'rank' | 'rate' | 'name') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (v: 'asc' | 'desc') => void;
}

/**
 * Expandable analytics & controls deck:
 * - Aggregate traffic stats (rate, avg rank, monthly volume)
 * - Category distribution bar
 * - Filtering and sorting controls
 * - Cloudflare Radar widget (device mix, protocol, locations, network health)
 */
export default function AnalyticsPanel({
  analyticsStats,
  filteredCount,
  radarStats,
  loadingRadar,
  selectedCountry,
  trafficTierFilter,
  onTrafficTierChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: AnalyticsPanelProps) {
  return (
    <div className="w-full mt-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md animate-fadeIn flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Dashboard Analytics &amp; Controls</span>
        </h3>
        <span className="text-xs text-[#82c8e5] bg-[#82c8e5]/10 px-2.5 py-1 rounded-full font-bold">
          {filteredCount} Channels Filtered
        </span>
      </div>

      {/* Split layout: Left is Local Catalog Stats + Filters, Right is Cloudflare Radar Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Stats + Filters */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
              <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Combined Rate Velocity</span>
              <div className="text-2xl font-extrabold text-[#82c8e5] mt-1">
                ~{analyticsStats.totalRate.toLocaleString('en-US')} <span className="text-sm font-normal text-white/50">/ sec</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1">Sum of live dispatch counters across all selected domains.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
              <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Median Global Rank</span>
              <div className="text-2xl font-extrabold text-[#a78bfa] mt-1">
                #{analyticsStats.avgRank.toLocaleString('en-US')}
              </div>
              <p className="text-[10px] text-white/40 mt-1">Median rank position across all filtered sites in our active catalog.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
              <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Est. Monthly Volume</span>
              <div className="text-2xl font-extrabold text-[#34d399] mt-1">
                {((analyticsStats.totalRate * 86400 * 30.4) / 1000000000).toFixed(2)}B <span className="text-sm font-normal text-white/50">/ mo</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1">Total estimated global monthly organic user visits.</p>
            </div>
          </div>

          {/* Category Mix Breakdown bar */}
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
            <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Category Distribution Mix</span>
            <div className="flex gap-1.5 h-3 rounded-full overflow-hidden mt-3 bg-white/5">
              {Object.entries(analyticsStats.categoryCounts).map(([cat, count]) => {
                const pct = Math.max(5, Math.round((count / filteredCount) * 100));
                return (
                  <div
                    key={cat}
                    style={{ width: `${pct}%`, backgroundColor: getCategoryColor(cat) }}
                    title={`${cat.toUpperCase()}: ${count} (${pct}%)`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] font-bold text-white/70">
              {Object.entries(analyticsStats.categoryCounts).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                  <span className="uppercase">{cat}:</span>
                  <span className="text-white">{count} ({Math.round((count / filteredCount) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filtering controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Traffic Tier Filter</label>
              <select
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#82c8e5]"
                value={trafficTierFilter}
                onChange={(e) => onTrafficTierChange(e.target.value as any)}
              >
                <option value="all">All Tiers</option>
                <option value="enterprise">Enterprise (&gt; 500M / mo)</option>
                <option value="midmarket">Mid-Market (50M - 500M / mo)</option>
                <option value="growth">Growth (&lt; 50M / mo)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Sort Metric By</label>
              <select
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#82c8e5]"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as any)}
              >
                <option value="rank">⭐ Global Rank</option>
                <option value="rate">Live Dispatch Rate</option>
                <option value="name">Brand Name</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Sort Order Direction</label>
              <div className="segmented-tabs mt-0.5">
                <button
                  className={`tab-item text-xs py-1.5 ${sortOrder === 'asc' ? 'active' : ''}`}
                  onClick={() => onSortOrderChange('asc')}
                >
                  Ascending ↑
                </button>
                <button
                  className={`tab-item text-xs py-1.5 ${sortOrder === 'desc' ? 'active' : ''}`}
                  onClick={() => onSortOrderChange('desc')}
                >
                  Descending ↓
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Global Radar Pulse Widget */}
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.01] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#82c8e5] uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#82c8e5] animate-pulse" />
              Global Radar Traffic Pulse
            </h4>
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              {radarStats?.source === 'cloudflare' ? 'Live' : 'Cached'}
            </span>
          </div>

          {loadingRadar ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/50">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/40" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Syncing Cloudflare Radar...</span>
            </div>
          ) : (
            <>
              {/* Device Share */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#6d8196] uppercase tracking-wider">Global Device Mix</span>
                  <span className="text-white">
                    Mobile {radarStats?.deviceType?.mobile}% | Desktop {radarStats?.deviceType?.desktop}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-white/5 flex">
                  <div style={{ width: `${radarStats?.deviceType?.mobile}%`, backgroundColor: '#3b82f6' }} title={`Mobile: ${radarStats?.deviceType?.mobile}%`} />
                  <div style={{ width: `${radarStats?.deviceType?.desktop}%`, backgroundColor: '#a78bfa' }} title={`Desktop: ${radarStats?.deviceType?.desktop}%`} />
                  <div style={{ width: `${radarStats?.deviceType?.other}%`, backgroundColor: '#72777d' }} title={`Other: ${radarStats?.deviceType?.other}%`} />
                </div>
              </div>

              {/* Protocol Split */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#6d8196] uppercase tracking-wider">Protocol Adoption</span>
                  <span className="text-white">HTTP/3: {radarStats?.httpVersion?.http3}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-white/5 flex">
                  <div style={{ width: `${radarStats?.httpVersion?.http3}%`, backgroundColor: '#10b981' }} title={`HTTP/3: ${radarStats?.httpVersion?.http3}%`} />
                  <div style={{ width: `${radarStats?.httpVersion?.http2}%`, backgroundColor: '#f59e0b' }} title={`HTTP/2: ${radarStats?.httpVersion?.http2}%`} />
                  <div style={{ width: `${radarStats?.httpVersion?.http1}%`, backgroundColor: '#ef4444' }} title={`HTTP/1.x: ${radarStats?.httpVersion?.http1}%`} />
                </div>
              </div>

              {/* Top Locations (global only) */}
              {selectedCountry === 'global' && radarStats?.topLocations && radarStats.topLocations.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Top Client Locations</span>
                  <div className="flex flex-col gap-2 mt-1">
                    {radarStats.topLocations.map((loc, idx) => (
                      <div key={loc.location} className="flex justify-between items-center text-xs">
                        <span className="text-white/80 font-medium flex items-center gap-1.5">
                          <span className="text-[10px] text-white/40">#{idx + 1}</span>
                          {loc.name}
                        </span>
                        <span className="font-semibold text-[#82c8e5]">{loc.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Health */}
              <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider flex items-center justify-between">
                  <span>Network Health Index</span>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Optimal
                  </span>
                </span>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-[#6d8196] uppercase tracking-wider">Latency</span>
                    <span className="text-xs font-extrabold text-emerald-400 mt-1 whitespace-nowrap">
                      {radarStats?.quality?.latency !== undefined ? `${radarStats.quality.latency} ms` : '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-[#6d8196] uppercase tracking-wider">Bandwidth</span>
                    <span className="text-xs font-extrabold text-[#82c8e5] mt-1 whitespace-nowrap">
                      {radarStats?.quality?.bandwidth !== undefined ? `${radarStats.quality.bandwidth} Mb/s` : '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-[#6d8196] uppercase tracking-wider">DNS Speed</span>
                    <span className="text-xs font-extrabold text-purple-400 mt-1 whitespace-nowrap">
                      {radarStats?.quality?.dnsResponseTime !== undefined ? `${radarStats.quality.dnsResponseTime} ms` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
