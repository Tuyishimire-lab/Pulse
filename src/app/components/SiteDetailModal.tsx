'use client';

import React, { useMemo } from 'react';
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
              <span className="modal-stat-label">Bounce Rate</span>
              <span className="modal-stat-value">{details.bounceRate}</span>
            </div>
            <div className="modal-stat-box">
              <span className="modal-stat-label">Avg Visit Duration</span>
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

          {/* Traffic Wave Chart */}
          <div className="chart-container text-left">
            <h4 className="chart-title flex items-center gap-2">
              {details.radarSource === 'cloudflare' ? 'Live Traffic Pattern (Last 24 Hours)' : 'Estimated Traffic Waves (Last 24 Hours)'}
              {details.radarSource === 'cloudflare' && <LiveBadge />}
            </h4>
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
                    <title>{`Hour ${pt.hour}:00 — Traffic Capacity: ${pt.value}%`}</title>
                  </circle>
                ))}
              </svg>
            </div>
            <div className="chart-axis-labels">
              <span>24h Ago</span>
              <span>12h Ago</span>
              <span>Now</span>
            </div>
          </div>

          {/* Top Geographies */}
          <div className="geo-section text-left">
            <h4 className="geo-title flex items-center gap-2">
              Top Traffic Geographies
              {details.radarSource === 'cloudflare' && <LiveBadge />}
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

          {/* Most Searched Topics */}
          <div className="geo-section text-left mt-6 animate-fadeIn">
            <h4 className="geo-title">Most Searched Topics</h4>
            <div className="flex flex-wrap gap-2 mt-3">
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
