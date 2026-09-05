'use client';

import React from 'react';
import { SiteConfig, CATEGORIES, SITE_COUNT } from '../data/sites';
import { COUNTRIES } from '../top-sites/data/countries';
import { exportSitesToCsv, exportSitesToJson } from '../../utils/exportCsv';

interface DashboardConsoleProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCountry: string;
  onCountryChange: (c: string) => void;
  channelFilter?: 'all' | 'watchlist' | 'incidents';
  onChannelFilterChange?: (v: 'all' | 'watchlist' | 'incidents') => void;
  watchlistFilter?: boolean;
  onWatchlistFilterChange?: (v: boolean) => void;
  watchlistCount: number;
  incidentCount?: number;
  onShareWatchlist?: () => void;
  viewLayout: 'grid' | 'list';
  onViewLayoutChange: (v: 'grid' | 'list') => void;
  compareModeActive: boolean;
  onToggleCompareMode: () => void;
  showAnalyticsPanel: boolean;
  onToggleAnalyticsPanel: () => void;
  onShowAddCustomModal: () => void;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  filteredSites?: SiteConfig[];
  lastSynced?: string | null; // ISO timestamp of last PTI engine run
}

/**
 * The full dashboard control console:
 * Search, Region, Watchlist toggle, Grid/List switcher,
 * Action buttons (Compare, Analytics, Add Custom), and Category pills.
 */
export default function DashboardConsole({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  channelFilter,
  onChannelFilterChange,
  watchlistFilter,
  onWatchlistFilterChange,
  watchlistCount,
  incidentCount = 0,
  onShareWatchlist,
  viewLayout,
  onViewLayoutChange,
  compareModeActive,
  onToggleCompareMode,
  showAnalyticsPanel,
  onToggleAnalyticsPanel,
  onShowAddCustomModal,
  activeCategory,
  onCategoryChange,
  filteredSites,
  lastSynced,
}: DashboardConsoleProps) {
  const activeChannel = channelFilter ?? (watchlistFilter ? 'watchlist' : 'all');

  const handleChannelChange = (ch: 'all' | 'watchlist' | 'incidents') => {
    if (onChannelFilterChange) {
      onChannelFilterChange(ch);
    } else if (onWatchlistFilterChange) {
      onWatchlistFilterChange(ch === 'watchlist');
    }
  };
  const [now, setNow] = React.useState<number>(0);
  React.useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Derive human-readable sync label
  // Cron interval = 6h. Stale = >13h (2× interval + 1h buffer).
  // Frozen = >12h: show exact timestamp, not a vague relative time.
  const syncLabel = React.useMemo(() => {
    if (!lastSynced || !now) return null;
    const syncDate = new Date(lastSynced);
    const diffMs  = now - syncDate.getTime();
    const diffMin = Math.round(diffMs / 60_000);
    const diffHr  = Math.round(diffMin / 60);

    if (diffMin < 2)   return { text: 'just now',     state: 'live'    as const };
    if (diffMin < 60)  return { text: `${diffMin}m ago`, state: 'live' as const };
    if (diffHr  < 13)  return { text: `${diffHr}h ago`,  state: 'live' as const };

    // >12h - cron is likely dead; show frozen timestamp in UTC
    const utcH = String(syncDate.getUTCHours()).padStart(2, '0');
    const utcM = String(syncDate.getUTCMinutes()).padStart(2, '0');
    return { text: `${utcH}:${utcM} UTC`, state: 'frozen' as const };
  }, [lastSynced, now]);

  return (
    <div className="dashboard-console animate-fadeIn">
      {/* Sync status pill */}
      {syncLabel && (
        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor:
                syncLabel.state === 'frozen' ? '#ef4444'
                : '#4ade80',
            }}
          />
          <span
            style={{
              color:
                syncLabel.state === 'frozen' ? '#ef4444'
                : '#4ade80',
            }}
          >
            {syncLabel.state === 'frozen' ? 'Estimates Frozen' : 'Index Live'}
          </span>
          <span className="text-[#6d8196]">
            {syncLabel.state === 'frozen'
              ? `· last sync ${syncLabel.text}`
              : `· PTI synced ${syncLabel.text}`}
          </span>
        </div>
      )}
      {/* Top Row: Search & View Layout Toggling */}
      <div className="console-nav-row">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder={`Search ${SITE_COUNT} domains…`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <svg
            className="search-icon-svg"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="console-view-controls flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#6d8196] font-extrabold">Region:</span>
            <select
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value)}
              className="bg-[#0f1b2b] text-[#82c8e5] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#1e324a] focus:outline-none focus:border-[#00e5ff] cursor-pointer hover:bg-[#15263d] transition-all"
            >
              <option value="global">Worldwide</option>
              {COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <option key={c.cfCode} value={c.cfCode}>{c.cfCode} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="segmented-tabs">
            <button
              className={`tab-item ${activeChannel === 'all' ? 'active' : ''}`}
              onClick={() => handleChannelChange('all')}
            >
              All Channels
            </button>
            <button
              className={`tab-item ${activeChannel === 'watchlist' ? 'active' : ''}`}
              onClick={() => handleChannelChange('watchlist')}
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Watchlist ({watchlistCount})</span>
            </button>
            {incidentCount > 0 && (
              <button
                className={`tab-item ${activeChannel === 'incidents' ? 'active' : ''}`}
                onClick={() => handleChannelChange('incidents')}
              >
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Disrupted ({incidentCount})</span>
              </button>
            )}
          </div>

          <div className="toggle-group">
            <button
              onClick={() => onViewLayoutChange('grid')}
              className={`toggle-btn ${viewLayout === 'grid' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => onViewLayoutChange('list')}
              className={`toggle-btn ${viewLayout === 'list' ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
              List
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Tool Action Center */}
      <div className="console-toolbar-row">
        <button
          className={`action-btn ${compareModeActive ? 'active' : ''}`}
          onClick={onToggleCompareMode}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${compareModeActive ? 'bg-emerald-400 shadow-sm' : 'bg-slate-500'}`} />
          <span>Battle Compare</span>
        </button>

        <button
          className={`action-btn ${showAnalyticsPanel ? 'active' : ''}`}
          onClick={onToggleAnalyticsPanel}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${showAnalyticsPanel ? 'bg-blue-400 shadow-sm' : 'bg-slate-500'}`} />
          <span>Telemetry Deck</span>
        </button>

        <button
          className="action-btn action-btn-secondary"
          onClick={onShowAddCustomModal}
        >
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Track Custom Domain</span>
        </button>

        {watchlistCount > 0 && onShareWatchlist && (
          <button
            className="action-btn action-btn-secondary"
            onClick={onShareWatchlist}
            title="Copy shareable link for current watchlist"
          >
            <span>Share Watchlist</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}

        {filteredSites && filteredSites.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              className="action-btn action-btn-secondary"
              onClick={() => exportSitesToCsv(filteredSites)}
            >
              <span>Export CSV</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            <button
              className="action-btn action-btn-secondary"
              onClick={() => exportSitesToJson(filteredSites)}
            >
              <span>Export JSON</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="filter-bar animate-fadeIn" role="tablist" aria-label="Website categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            role="tab"
            aria-selected={activeCategory === cat.id}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
