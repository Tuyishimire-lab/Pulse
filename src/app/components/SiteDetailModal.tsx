'use client';

import React, { useMemo, useState } from 'react';
import { SiteConfig } from '../data/sites';
import { SiteDetails } from '../data/details';
import FaviconImage from './ui/FaviconImage';
import VisitsCounter from './ui/VisitsCounter';
import { getMostSearchedTopics } from '../../utils/searchTopics';

interface SiteDetailModalProps {
  site: SiteConfig;
  details: SiteDetails;
  pageLoadTime: number;
  radarStats: any;
  onClose: () => void;
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      CF Radar
    </span>
  );
}

// ── ChartSection: tabbed 24h traffic wave + 30-day rank history ───────────────

interface ChartSectionProps {
  site: SiteConfig;
  details: SiteDetails;
  chartPoints: { x: number; y: number; value: number; hour: number }[];
  linePath: string;
  fillPath: string;
  radarStats: any;
}

function ChartSection({ site, details, chartPoints, linePath, fillPath }: ChartSectionProps) {
  const [activeTab, setActiveTab] = useState<'24h' | '30d'>('24h');

  // ── 30-day rank history chart ─────────────────────────────────────────────
  const rankPoints = useMemo(() => {
    if (!site.rank_history || site.rank_history.length < 2) return [];
    const sorted = [...site.rank_history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted;
  }, [site.rank_history]);

  const rankChartData = useMemo(() => {
    if (rankPoints.length < 2) return null;
    const width = 580;
    const height = 110;
    const ranks = rankPoints.map((p) => p.rank);
    const minRank = Math.min(...ranks);
    const maxRank = Math.max(...ranks);
    const range = maxRank - minRank || 1;

    const pts = rankPoints.map((p, idx) => {
      const x = (idx / (rankPoints.length - 1)) * width;
      // Invert: lower rank number (better) = higher on chart
      const y = 15 + ((p.rank - minRank) / range) * 80;
      return { x, y, rank: p.rank, date: p.date, idx };
    });

    const linePath = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
    const fillPath = `M 0 110 ${pts.map((pt) => `L ${pt.x} ${pt.y}`).join(' ')} L 580 110 Z`;

    const best = pts.reduce((a, b) => (a.rank < b.rank ? a : b));
    const worst = pts.reduce((a, b) => (a.rank > b.rank ? a : b));

    return { pts, linePath, fillPath, minRank, maxRank, best, worst };
  }, [rankPoints]);

  const hasRankHistory = rankChartData !== null && rankChartData.pts.length >= 2;

  return (
    <div className="chart-container text-left">
      {/* Tab header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab('24h')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
            activeTab === '24h'
              ? 'bg-white/10 text-white'
              : 'text-[#6d8196] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          24h Traffic Wave
          {details.radarSource === 'cloudflare' && (
            <span className="ml-1.5 text-[9px] text-emerald-400 font-extrabold">● LIVE</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('30d')}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
            activeTab === '30d'
              ? 'bg-white/10 text-white'
              : 'text-[#6d8196] hover:text-white hover:bg-white/[0.05]'
          } ${!hasRankHistory ? 'opacity-40 cursor-not-allowed' : ''}`}
          disabled={!hasRankHistory}
          title={!hasRankHistory ? 'Not enough rank history data yet' : undefined}
        >
          30-Day Rank
          {!hasRankHistory && <span className="ml-1 text-[10px]">N/A</span>}
        </button>
      </div>

      {activeTab === '24h' && (
        <>
          <div className="chart-wrapper-svg">
            <svg viewBox="0 0 580 110" className="chart-svg">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={site.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={site.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="580" y2="20" className="chart-grid-line" />
              <line x1="0" y1="50" x2="580" y2="50" className="chart-grid-line" />
              <line x1="0" y1="80" x2="580" y2="80" className="chart-grid-line" />
              {fillPath && <path d={fillPath} className="chart-fill-path" />}
              {linePath && (
                <path
                  d={linePath}
                  className="chart-trend-line"
                  style={{ stroke: site.color, ['--brand-glow' as any]: site.glow }}
                />
              )}
              {chartPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  className="chart-dot"
                  style={{ ['--brand-color' as any]: site.color }}
                >
                  <title>{`Hour ${pt.hour}:00 - Traffic Capacity: ${pt.value}%`}</title>
                </circle>
              ))}
            </svg>
          </div>
          <div className="chart-axis-labels">
            <span>24h Ago</span>
            <span>12h Ago</span>
            <span>Now</span>
          </div>
        </>
      )}

      {activeTab === '30d' && rankChartData && (
        <>
          <div className="chart-wrapper-svg">
            <svg viewBox="0 0 580 110" className="chart-svg">
              <defs>
                <linearGradient id="rank-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={site.color} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={site.color} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="20" x2="580" y2="20" className="chart-grid-line" />
              <line x1="0" y1="55" x2="580" y2="55" className="chart-grid-line" />
              <line x1="0" y1="90" x2="580" y2="90" className="chart-grid-line" />
              {/* Fill area */}
              <path d={rankChartData.fillPath} fill="url(#rank-gradient)" opacity="0.5" />
              {/* Line */}
              <path
                d={rankChartData.linePath}
                fill="none"
                stroke={site.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${site.glow})` }}
              />
              {/* Best rank label */}
              <circle cx={rankChartData.best.x} cy={rankChartData.best.y} r="4" fill={site.color} />
              <text
                x={Math.min(rankChartData.best.x + 6, 530)}
                y={rankChartData.best.y - 6}
                fontSize="9"
                fill="#4ade80"
                fontWeight="bold"
              >
                #{rankChartData.best.rank} Best
              </text>
              {/* Worst rank label */}
              <circle cx={rankChartData.worst.x} cy={rankChartData.worst.y} r="4" fill="#f87171" />
              <text
                x={Math.min(rankChartData.worst.x + 6, 510)}
                y={rankChartData.worst.y + 14}
                fontSize="9"
                fill="#f87171"
                fontWeight="bold"
              >
                #{rankChartData.worst.rank} Worst
              </text>
              {/* Hover dots */}
              {rankChartData.pts.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3"
                  fill="transparent"
                  stroke={site.color}
                  strokeWidth="1.5"
                  opacity="0"
                  className="chart-dot"
                  style={{ ['--brand-color' as any]: site.color }}
                >
                  <title>{`${new Date(pt.date).toLocaleDateString()} - Rank #${pt.rank}`}</title>
                </circle>
              ))}
            </svg>
          </div>
          <div className="chart-axis-labels">
            <span>30 Days Ago</span>
            <span>15 Days Ago</span>
            <span>Today</span>
          </div>
          <p className="text-[10px] text-[#6d8196] mt-2">
            Lower rank number = higher position. Y-axis inverted: top of chart = better rank.
          </p>
        </>
      )}
    </div>
  );
}

/**
 * The full-screen site detail modal showing:
 * - Site identity header (logo, name, URL, category)
 * - Aggregate stat boxes (bounce rate, visit duration, visits since landing)
 * - Desktop/mobile device split bar
 * - 24-hour traffic wave chart
 * - Top geographies breakdown
 * - Most searched topics / keywords
 * - Fun fact trivia
 */
export default function SiteDetailModal({
  site,
  details,
  pageLoadTime,
  radarStats,
  onClose,
}: SiteDetailModalProps) {
  const chartPoints = useMemo(() => {
    const width = 580;
    const height = 110;
    const history = details.trafficHistory;
    return history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - (val / 100) * 80 - 15;
      return { x, y, value: val, hour: idx };
    });
  }, [details]);

  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  }, [chartPoints]);

  const fillPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const start = `M 0 110`;
    const points = chartPoints.map((pt) => `L ${pt.x} ${pt.y}`).join(' ');
    const end = `L 580 110 Z`;
    return `${start} ${points} ${end}`;
  }, [chartPoints]);

  const displayedKeywords = useMemo(() => {
    const raw = details.keywords && details.keywords.length > 0 ? details.keywords : [];
    return raw.length > 0 ? raw : getMostSearchedTopics({ name: site.name, category: site.category });
  }, [details.keywords, site.name, site.category]);

  return (
    <div
      className="modal-overlay animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          ['--brand-color' as any]: site.color,
          ['--brand-glow' as any]: site.glow,
        }}
      >
        <div className="modal-body">
          {/* Header */}
          <div className="modal-header-section flex-wrap gap-y-2">
            <div className="modal-title-area">
              <div
                className="modal-logo"
                style={{
                  backgroundColor: site.color,
                  border: site.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                }}
              >
                <FaviconImage url={site.url} logo={site.logo} color={site.color} />
              </div>
              <div className="modal-headline">
                <div className="modal-name-row">
                  <h2 className="modal-name">{site.name}</h2>
                  <span className="list-category-badge">{site.category}</span>
                </div>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="modal-url-link">
                  {site.url}
                </a>
              </div>
            </div>
            <button
              className="modal-close-btn"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          <p className="modal-description text-left">{details.description}</p>

          {/* Stat boxes */}
          <div className="modal-stats-grid text-left">
            <div className="modal-stat-box">
              <span className="modal-stat-label">Bounce Rate <span className="text-[10px] font-semibold text-[#82c8e5]/70 bg-[#82c8e5]/10 px-1.5 py-0.5 rounded-full ml-1">PTI model</span></span>
              <span className="modal-stat-value">{details.bounceRate}</span>
            </div>
            <div className="modal-stat-box">
              <span className="modal-stat-label">Avg Visit Duration <span className="text-[10px] font-semibold text-[#82c8e5]/70 bg-[#82c8e5]/10 px-1.5 py-0.5 rounded-full ml-1">PTI model</span></span>
              <span className="modal-stat-value">{details.visitDuration}</span>
            </div>
            <div className="modal-stat-box">
              <span className="modal-stat-label">Visits Since Landing</span>
              <span className="modal-stat-value glow-ticker">
                <VisitsCounter rate={site.rate} pageLoadTime={pageLoadTime} />
              </span>
            </div>
          </div>

          {/* Device Split */}
          <div className="device-split-container text-left">

            <div className="device-labels">
              <span className="flex items-center gap-2">
                {details.radarSource === 'cloudflare' && <LiveBadge />}
              </span>
              <span className="device-label-item">
                <span className="device-dot desktop" style={{ backgroundColor: site.color }} />
                Desktop: {details.desktopShare}%
              </span>
              <span className="device-label-item">
                <span className="device-dot mobile" />
                Mobile: {details.mobileShare}%
              </span>
            </div>
            <div className="device-bar-track">
              <div
                className="device-bar-fill"
                style={{ width: `${details.desktopShare}%`, backgroundColor: site.color }}
              />
            </div>
            {radarStats?.deviceType && (
              <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-1.5 flex justify-between">
                <span>Cloudflare Radar Benchmark</span>
                <span>{radarStats.deviceType.desktop}% Desktop | {radarStats.deviceType.mobile}% Mobile</span>
              </div>
            )}
          </div>

          {/* Chart Section with tabs */}
          <ChartSection site={site} details={details} chartPoints={chartPoints} linePath={linePath} fillPath={fillPath} radarStats={radarStats} />

          {/* Top Geographies */}
          <div className="geo-section text-left">
            <h4 className="geo-title flex items-center gap-2">
              Top Traffic Geographies
              {details.radarSource === 'cloudflare' ? <LiveBadge /> : (
                <span className="text-[10px] font-semibold text-[#82c8e5]/70 bg-[#82c8e5]/10 px-1.5 py-0.5 rounded-full">PTI model</span>
              )}
            </h4>
            <div className="geo-grid">
              {details.geographies.map((geo, index) => (
                <div key={index} className="geo-row">
                  <div className="geo-info-row">
                    <span className="geo-country-name">{geo.country}</span>
                    <span className="geo-percentage" style={{ color: site.color }}>
                      {geo.percentage}%
                    </span>
                  </div>
                  <div className="geo-bar-track">
                    <div
                      className="geo-bar-fill"
                      style={{ width: `${geo.percentage}%`, backgroundColor: site.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Topics */}
          <div className="geo-section text-left mt-6 animate-fadeIn">
            <h4 className="geo-title flex items-center gap-2">
              Related Topics
              <span className="text-[10px] font-semibold text-[#82c8e5]/70 bg-[#82c8e5]/10 px-1.5 py-0.5 rounded-full">Editorial</span>
            </h4>
            <p className="text-[10px] text-white/30 mt-1 mb-3">
              Category-derived topic associations - not real search-query data.
            </p>
            <div className="flex flex-wrap gap-2">
              {displayedKeywords.map((kw, index) => (
                <div
                  key={index}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 select-none cursor-default"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--brand-color) 4%, rgba(255,255,255,0.02))',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = site.color;
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.boxShadow = `0 0 16px ${site.glow}`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {kw}
                </div>
              ))}
            </div>
          </div>

          {/* Fun Fact */}
          <div className="modal-trivia text-left">
            
            <p>
              <strong>Fact:</strong> {details.funFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
