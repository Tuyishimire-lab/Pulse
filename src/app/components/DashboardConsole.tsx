'use client';

import React from 'react';
import { SiteConfig, CATEGORIES } from '../data/sites';
import { exportSitesToCsv } from '../../utils/exportCsv';

interface DashboardConsoleProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCountry: string;
  onCountryChange: (c: string) => void;
  watchlistFilter: boolean;
  onWatchlistFilterChange: (v: boolean) => void;
  watchlistCount: number;
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
  watchlistFilter,
  onWatchlistFilterChange,
  watchlistCount,
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
}: DashboardConsoleProps) {
  return (
    <div className="dashboard-console animate-fadeIn">
      {/* Top Row: Search & View Layout Toggling */}
      <div className="console-nav-row">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search top 100 domains..."
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
              <option value="US">US - United States</option>
              <option value="IN">IN - India</option>
              <option value="GB">GB - United Kingdom</option>
              <option value="DE">DE - Germany</option>
              <option value="BR">BR - Brazil</option>
              <option value="JP">JP - Japan</option>
            </select>
          </div>

          <div className="segmented-tabs">
            <button
              className={`tab-item ${!watchlistFilter ? 'active' : ''}`}
              onClick={() => onWatchlistFilterChange(false)}
            >
              All Channels
            </button>
            <button
              className={`tab-item ${watchlistFilter ? 'active' : ''}`}
              onClick={() => onWatchlistFilterChange(true)}
            >
              ⭐ Watchlist ({watchlistCount})
            </button>
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
          Battle Compare {compareModeActive ? 'ON' : 'OFF'}
        </button>

        <button
          className={`action-btn ${showAnalyticsPanel ? 'active' : ''}`}
          onClick={onToggleAnalyticsPanel}
        >
          Analytics Panel {showAnalyticsPanel ? 'ON' : 'OFF'}
        </button>

        <button
          className="action-btn action-btn-secondary"
          onClick={onShowAddCustomModal}
        >
          Track Custom Domain
        </button>

        {filteredSites && filteredSites.length > 0 && (
          <button
            className="action-btn action-btn-secondary"
            onClick={() => exportSitesToCsv(filteredSites)}
          >
            Export CSV ↓
          </button>
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
