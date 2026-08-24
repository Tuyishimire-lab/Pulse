'use client';

import React from 'react';
import Link from 'next/link';
import { SiteConfig } from '../data/sites';
import FaviconImage from './ui/FaviconImage';
import VisitsCounter from './ui/VisitsCounter';
import RankSparkline from './ui/RankSparkline';

interface SiteGridProps {
  displayedSites: SiteConfig[];
  viewLayout: 'grid' | 'list';
  isMounted: boolean;
  pageLoadTime: number;
  sitesWithIncidents: Set<string>;
  watchlistIds: string[];
  compareModeActive: boolean;
  selectedCompareIds: string[];
  watchlistFilter: boolean;
  onSiteClick: (site: SiteConfig) => void;
  onToggleStar: (siteId: string, e: React.MouseEvent) => void;
  onToggleCompareSelect: (siteId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowAddCustomModal: () => void;
  getRankChange: (site: SiteConfig) => number | null;
  filteredCount: number;
  visibleCount: number;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  onResetFilters: () => void;
  /**
   * When a non-global filter is active (category, search, tier, watchlist),
   * this map contains the 1-based position of each site within the filtered
   * list. Cards show this position instead of site.rank so there are no gaps.
   * Omit (undefined) when the full unfiltered catalog is shown.
   */
  displayRankMap?: Record<string, number>;
}

/**
 * Renders the site card grid or list view, plus the infinite scroll trigger,
 * the empty state message, and the "Track Custom Domain" ghost card.
 */
export default function SiteGrid({
  displayedSites,
  viewLayout,
  isMounted,
  pageLoadTime,
  sitesWithIncidents,
  watchlistIds,
  compareModeActive,
  selectedCompareIds,
  watchlistFilter,
  onSiteClick,
  onToggleStar,
  onToggleCompareSelect,
  onShowAddCustomModal,
  getRankChange,
  filteredCount,
  visibleCount,
  loadMoreRef,
  onResetFilters,
  displayRankMap,
}: SiteGridProps) {
  // When a filter narrows the list we show position-within-view, not global rank,
  // so there are no confusing gaps (e.g. "RANK #15" jumps to "RANK #18").
  const getDisplayRank = (site: SiteConfig) => displayRankMap?.[site.id] ?? site.rank;
  const rankLabel = displayRankMap ? 'IN VIEW' : 'RANK';
  return (
    <>
      {viewLayout === 'grid' ? (
        <div className="counters-grid mt-4 w-full">
          {displayedSites.map((site) => (
            <div
              key={site.id}
              data-site-item="true"
              data-site-id={site.id}
              className={`card card-visible cursor-pointer ${sitesWithIncidents.has(site.id) ? 'card-incident animate-pulse' : ''}`}
              onClick={() => onSiteClick(site)}
              style={{
                ['--brand-color' as any]: site.color,
                ['--brand-glow' as any]: site.glow,
              }}
            >
              <div className="card-header">
                <div className="flex items-center gap-1.5">
                  <span className="rank-badge">{rankLabel} #{getDisplayRank(site)}</span>
                  {(() => {
                    const change = getRankChange(site);
                    if (change === null || change === 0) return null;
                    if (change > 0) {
                      return <span className="text-[10px] font-bold text-emerald-400">▲ +{change}</span>;
                    } else {
                      return <span className="text-[10px] font-bold text-rose-500">▼ {change}</span>;
                    }
                  })()}
                  {sitesWithIncidents.has(site.id) && (
                    <span className="text-[9px] font-extrabold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-0.5 ml-1">
                      Outage
                    </span>
                  )}
                  {site.rank_history && site.rank_history.length >= 2 && (
                    <RankSparkline history={site.rank_history} />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    className={`star-btn ${watchlistIds.includes(site.id) ? 'active-star' : ''}`}
                    onClick={(e) => onToggleStar(site.id, e)}
                  >
                    ★
                  </button>
                  <div
                    className="site-logo"
                    style={{
                      backgroundColor: site.color,
                      border: site.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    }}
                  >
                    <FaviconImage url={site.url} logo={site.logo} color={site.color} />
                  </div>
                </div>
              </div>
              <div className="card-info text-left">
                <div className="flex items-center justify-between">
                  <h2 className="site-name text-left">{site.name}</h2>
                  <Link
                    href={`/sites/${site.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-[#82c8e5]/70 hover:text-white transition"
                  >
                    Details ↗
                  </Link>
                </div>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="site-url text-left"
                >
                  {site.url.replace('https://', '')}
                </a>
              </div>
              <div className="counter-section text-left">
                <span className="counter-label">VISITS SINCE LANDING</span>
                <div id={`counter-${site.id}`} className="counter-number">
                  {isMounted ? (
                    <VisitsCounter rate={site.rate} pageLoadTime={pageLoadTime} />
                  ) : (
                    '0'
                  )}
                </div>
              </div>
              <div className="card-footer text-left">
                <div className="stat-row">
                  <span className="stat-label">Baseline Traffic</span>
                  <span className="stat-val">{site.baseline}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Estimated Rate</span>
                  <span className="stat-val">~{site.rate.toLocaleString('en-US')} / sec</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${site.progress}%` }} />
                </div>
                {compareModeActive && (
                  <label className="compare-checkbox-label" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCompareIds.includes(site.id)}
                      onChange={(e) => onToggleCompareSelect(site.id, e)}
                    />
                    <span>Select for Battle</span>
                  </label>
                )}
              </div>
            </div>
          ))}

          {!watchlistFilter && (
            <div className="add-custom-card" onClick={onShowAddCustomModal}>
              
              <span className="text-sm font-bold text-[#6d8196]">Track Custom Domain</span>
            </div>
          )}
        </div>
      ) : (
        <div className="counters-list w-full">
          <div className="list-header">
            <span>Rank</span>
            <span>Website</span>
            <span>Category</span>
            <span>Baseline Traffic</span>
            <span>Visits Since Landing</span>
            <span>Progress</span>
          </div>

          {displayedSites.map((site) => (
            <div
              key={site.id}
              data-site-item="true"
              data-site-id={site.id}
              className={`list-row card-visible cursor-pointer ${sitesWithIncidents.has(site.id) ? 'row-incident animate-pulse' : ''}`}
              onClick={() => onSiteClick(site)}
              style={{
                ['--brand-color' as any]: site.color,
                ['--brand-glow' as any]: site.glow,
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  className={`star-btn ${watchlistIds.includes(site.id) ? 'active-star' : ''}`}
                  onClick={(e) => onToggleStar(site.id, e)}
                >
                  ★
                </button>
                <div className="list-rank text-left flex items-center gap-1.5">
                  <span>#{getDisplayRank(site)}</span>
                  {(() => {
                    const change = getRankChange(site);
                    if (change === null || change === 0) return null;
                    if (change > 0) {
                      return <span className="text-[10px] font-bold text-emerald-400">▲ +{change}</span>;
                    } else {
                      return <span className="text-[10px] font-bold text-rose-500">▼ {change}</span>;
                    }
                  })()}
                  {site.rank_history && site.rank_history.length >= 2 && (
                    <RankSparkline history={site.rank_history} />
                  )}
                </div>
              </div>

              <div className="list-identity">
                <div
                  className="list-logo"
                  style={{
                    backgroundColor: site.color,
                    border: site.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  }}
                >
                  <FaviconImage url={site.url} logo={site.logo} color={site.color} />
                </div>
                <div className="list-names text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="list-name">{site.name}</h2>
                    {sitesWithIncidents.has(site.id) && (
                      <span className="text-[8px] font-extrabold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-1 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        Outage
                      </span>
                    )}
                    <Link
                      href={`/sites/${site.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[0.65rem] text-[#82c8e5]/50 hover:text-white transition"
                    >
                      Details ↗
                    </Link>
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="list-url"
                  >
                    {site.url.replace('https://', '')}
                  </a>
                </div>
              </div>

              <div className="list-category text-left">
                <span className="list-category-badge">{site.category}</span>
              </div>

              <div className="list-baseline text-left">{site.baseline}</div>

              <div className="list-counter-container text-left">
                <span className="counter-label md:hidden">VISITS SINCE LANDING</span>
                <div id={`counter-${site.id}`} className="list-counter-number">
                  {isMounted ? (
                    <VisitsCounter rate={site.rate} pageLoadTime={pageLoadTime} />
                  ) : (
                    '0'
                  )}
                </div>
              </div>

              <div className="list-progressbar">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${site.progress}%` }} />
                </div>
                {compareModeActive && (
                  <label className="compare-checkbox-label" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCompareIds.includes(site.id)}
                      onChange={(e) => onToggleCompareSelect(site.id, e)}
                    />
                    <span>Select for Battle</span>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {displayedSites.length === 0 && (
        <div className="w-full text-center py-16 text-[#6d8196]">
          <p className="text-lg">No websites match your search or filter criteria.</p>
          <button
            onClick={onResetFilters}
            className="px-6 py-2.5 bg-[#0047ab] text-white rounded-xl font-semibold hover:bg-[#003c91] transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {filteredCount > visibleCount && (
        <div ref={loadMoreRef} className="infinite-scroll-trigger">
          <div className="loading-spinner" />
          <span>Scanning Stream database...</span>
        </div>
      )}
    </>
  );
}
