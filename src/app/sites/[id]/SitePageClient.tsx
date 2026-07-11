'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { SITES } from '../../data/sites';
import { getSiteDetails, SiteDetails } from '../../data/details';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

// Reusable Favicon Component with Letter Fallback
function FaviconImage({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [error, setError] = useState(false);
  const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

  if (error) {
    return (
      <span 
        style={{
          color: color === '#ffffff' ? '#111111' : '#ffffff',
          fontWeight: 800
        }}
      >
        {logo}
      </span>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt={`${logo} logo`}
      onError={() => setError(true)}
      className="w-full h-full object-contain p-1 rounded-full bg-white/10"
    />
  );
}

// Helper to generate dynamic fallback search topics based on domain name & category
export function getMostSearchedTopics(site: { name: string; category: string }) {
  switch (site.category) {
    case 'search':
      return ["Translate", "Maps", "Images", "Scholar", "Drive"];
    case 'social':
      return ["Stories", "Feed", "Groups", "Photos", "Messenger"];
    case 'ai':
      return ["API", "Prompts", "GPT-4", "Custom GPTs", "Pricing"];
    case 'ecommerce':
    case 'shopping':
      return ["Prime", "Deals", "Tracking", "Support", "Shipping"];
    case 'dev':
      return ["Docs", "API", "Tutorials", "Libraries", "GitHub"];
    case 'finance':
      return ["Pricing", "Stock Price", "Payments", "Calculator", "Security"];
    case 'news':
    case 'media':
      return ["Live Feed", "Today", "Opinion", "Videos", "Podcasts"];
    case 'reference':
      return ["Definitions", "History", "Wiki", "Facts", "Citations"];
    case 'entertainment':
      return ["Stream", "Trailer", "Music", "TV", "Releases"];
    default:
      return ["Website", "Review", "Support", "API", "Pricing"];
  }
}

export default function SitePageClient({ id }: { id: string }) {
  const site = useMemo(() => SITES.find((s) => s.id === id), [id]);
  const details = useMemo(() => (site ? getSiteDetails(site) : null), [site]);

  const timerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const [dbHistory, setDbHistory] = useState<{ visits_percentage: number; timestamp: string }[]>([]);
  const [dbKeywords, setDbKeywords] = useState<string[] | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');

  useEffect(() => {
    if (!site || !isSupabaseConfigured) return;

    // Fetch up to 168 hours (7 days) of traffic history
    supabase
      .from('traffic_history')
      .select('visits_percentage, timestamp')
      .eq('site_id', site.id)
      .order('timestamp', { ascending: true })
      .limit(168)
      .then((res: any) => {
        const data = res.data;
        if (data && data.length > 0) {
          setDbHistory(data.map((item: any) => ({
            visits_percentage: Number(item.visits_percentage),
            timestamp: item.timestamp
          })));
        }
      });

    // Fetch dynamic keywords from database
    supabase
      .from('sites')
      .select('keywords')
      .eq('id', site.id)
      .single()
      .then((res: any) => {
        if (res && res.data && Array.isArray(res.data.keywords) && res.data.keywords.length > 0) {
          setDbKeywords(res.data.keywords);
        }
      });
  }, [site]);

  const displayedKeywords = useMemo(() => {
    const raw = dbKeywords && dbKeywords.length > 0 ? dbKeywords : (details?.keywords || []);
    if (raw && raw.length > 0) return raw;
    if (site) {
      return getMostSearchedTopics({ name: site.name, category: site.category });
    }
    return [];
  }, [dbKeywords, details, site]);

  useEffect(() => {
    if (!site) return;
    let animationFrameId: number;
    const numberFormatter = new Intl.NumberFormat('en-US');

    const tick = () => {
      const elapsedSeconds = (Date.now() - pageLoadTimeRef.current) / 1000;

      // Update counter DOM element directly
      if (counterRef.current) {
        const count = Math.floor(elapsedSeconds * site.rate);
        counterRef.current.textContent = numberFormatter.format(count);
      }

      // Update timer DOM element directly
      if (timerRef.current) {
        const totalSecs = Math.floor(elapsedSeconds);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;

        timerRef.current.textContent = 
          String(hours).padStart(2, '0') + ':' +
          String(minutes).padStart(2, '0') + ':' +
          String(seconds).padStart(2, '0');
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [site]);

  // Compute active history based on selected timeline range
  const activeHistory = useMemo(() => {
    if (dbHistory.length > 0) {
      if (timeRange === '24h') {
        return dbHistory.slice(-24);
      }
      return dbHistory;
    }
    // Fallback static history (always 24 hourly nodes)
    return details?.trafficHistory.map((val, idx) => {
      const ts = new Date(Date.now() - (23 - idx) * 60 * 60 * 1000).toISOString();
      return { visits_percentage: val, timestamp: ts };
    }) || [];
  }, [dbHistory, timeRange, details]);

  // Calculate high-performance SVG plotting coordinates
  const chartPoints = useMemo(() => {
    const width = 580; 
    const height = 110;
    return activeHistory.map((node, idx) => {
      const x = (idx / (activeHistory.length - 1)) * width;
      const y = height - (node.visits_percentage / 100) * 80 - 15;
      
      const date = new Date(node.timestamp);
      const hourStr = date.getHours().toString().padStart(2, '0') + ':00';
      return { x, y, value: node.visits_percentage, label: hourStr };
    });
  }, [activeHistory]);

  const axisLabels = useMemo(() => {
    if (timeRange === '24h') {
      return ['24h Ago', '12h Ago', 'Now'];
    }
    return ['7 Days Ago', '3.5 Days Ago', 'Now'];
  }, [timeRange]);

  // Calculate detailed average, lowest, and peak stats across the timeline
  const analyticsSummary = useMemo(() => {
    if (activeHistory.length === 0) return null;
    let sum = 0;
    let peakVal = -1;
    let peakHourStr = '';
    let minVal = 101;
    let minHourStr = '';

    activeHistory.forEach(node => {
      sum += node.visits_percentage;
      
      const date = new Date(node.timestamp);
      const dateLabel = timeRange === '24h' 
        ? date.getHours().toString().padStart(2, '0') + ':00'
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.getHours().toString().padStart(2, '0') + ':00';

      if (node.visits_percentage > peakVal) {
        peakVal = node.visits_percentage;
        peakHourStr = dateLabel;
      }
      if (node.visits_percentage < minVal) {
        minVal = node.visits_percentage;
        minHourStr = dateLabel;
      }
    });

    const average = Math.round(sum / activeHistory.length);

    return {
      average,
      peakVal,
      peakHourStr,
      minVal,
      minHourStr
    };
  }, [activeHistory, timeRange]);

  // Handle local CSV generation and download trigger
  const handleExportCSV = () => {
    if (activeHistory.length === 0 || !site) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Timestamp,Capacity Percentage (%)\n';
    
    activeHistory.forEach(node => {
      const dateStr = new Date(node.timestamp).toLocaleString();
      csvContent += `"${dateStr}",${node.visits_percentage}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${site.id}_traffic_history_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Construct chart stroke line path
  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  }, [chartPoints]);

  // Construct chart area fill path
  const fillPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const start = `M 0 110`;
    const points = chartPoints.map(pt => `L ${pt.x} ${pt.y}`).join(' ');
    const end = `L 580 110 Z`;
    return `${start} ${points} ${end}`;
  }, [chartPoints]);

  if (!site || !details) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#08080f] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold">Domain Not Found</h1>
          <p className="text-[#94a3b8]">The requested website statistics page does not exist in our catalog.</p>
          <Link href="/" className="mt-4 px-6 py-3 bg-[#6366f1] text-white rounded-xl font-semibold hover:bg-[#4f46e5] transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-[#08080f] text-white font-sans flex flex-col items-center pb-16 animate-fadeIn"
      style={{
        ['--brand-color' as any]: site.color,
        ['--brand-glow' as any]: site.glow,
      }}
    >
      {/* Background mesh element for aesthetic gradients */}
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />

      {/* Styled top navigation bar */}
      <nav className="relative z-10 w-full max-w-[1200px] px-6 py-6 flex justify-between items-center border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#94a3b8] hover:text-white transition group">
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="pulse-dot" />
          <span className="text-xs font-bold tracking-wider text-[#94a3b8]">LIVE STREAM</span>
        </div>
      </nav>

      <main 
        className="relative z-10 w-full max-w-[800px] px-6 mt-10 flex flex-col gap-8"
      >
        {/* Dynamic header cards tinted by brand color */}
        <div 
          className="p-8 rounded-3xl border border-white/10"
          style={{
            background: 'color-mix(in srgb, var(--brand-color) 8%, #0a0a14)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 50px var(--brand-glow)'
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div 
                  className="modal-logo"
                  style={{
                    backgroundColor: site.color,
                    border: site.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    width: '60px',
                    height: '60px',
                    fontSize: '1.8rem'
                  }}
                >
                  <FaviconImage url={site.url} logo={site.logo} color={site.color} />
                </div>
                <div className="modal-headline">
                  <div className="modal-name-row">
                    <h1 className="text-3xl font-extrabold tracking-tight m-0">{site.name}</h1>
                    <span className="list-category-badge">{site.category}</span>
                  </div>
                  <a 
                    href={site.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="modal-url-link text-base"
                  >
                    {site.url}
                  </a>
                </div>
              </div>
              <div className="timer-card scale-90">
                <span className="timer-label">ELAPSED TIME</span>
                <div ref={timerRef} className="timer-value text-xl">00:00:00</div>
              </div>
            </div>

            <p className="modal-description text-lg leading-relaxed">
              {details.description}
            </p>

            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span className="modal-stat-label">Rank</span>
                <span className="modal-stat-value text-2xl">#{site.rank}</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-label">Bounce Rate</span>
                <span className="modal-stat-value text-2xl">{details.bounceRate}</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-label">Avg Duration</span>
                <span className="modal-stat-value text-2xl">{details.visitDuration}</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-label">Visits Since Landing</span>
                <span 
                  ref={counterRef}
                  className="modal-stat-value text-2xl glow-ticker"
                >
                  0
                </span>
              </div>
            </div>

            {/* Device Split Bar */}
            <div className="device-split-container">
              <div className="device-labels">
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
                  style={{ 
                    width: `${details.desktopShare}%`,
                    backgroundColor: site.color
                  }}
                />
              </div>
            </div>

            {/* SVG Hour-by-Hour Traffic History Chart */}
            <div className="chart-container">
              <div className="flex justify-between items-center flex-wrap gap-y-2 border-b border-white/5 pb-3.5 mb-4">
                <h4 className="chart-title m-0">Estimated Traffic Capacity Waves</h4>
                <div className="flex items-center gap-2.5 scale-90 origin-right">
                  <div className="segmented-tabs mt-0">
                    <button 
                      className={`tab-item text-[10px] py-1 px-3 ${timeRange === '24h' ? 'active' : ''}`}
                      onClick={() => setTimeRange('24h')}
                    >
                      24 Hours
                    </button>
                    <button 
                      className={`tab-item text-[10px] py-1 px-3 ${timeRange === '7d' ? 'active' : ''}`}
                      onClick={() => setTimeRange('7d')}
                    >
                      7 Days
                    </button>
                  </div>
                  <button 
                    onClick={handleExportCSV}
                    className="px-3 py-1 text-[10px] font-bold text-white/80 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg hover:bg-white/10 transition"
                  >
                    📥 Export CSV
                  </button>
                </div>
              </div>

              <div className="chart-wrapper-svg">
                <svg 
                  viewBox="0 0 580 110" 
                  className="chart-svg"
                >
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={site.color} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={site.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="20" x2="580" y2="20" className="chart-grid-line" />
                  <line x1="0" y1="50" x2="580" y2="50" className="chart-grid-line" />
                  <line x1="0" y1="80" x2="580" y2="80" className="chart-grid-line" />

                  {/* Fill area underneath curve */}
                  {fillPath && (
                    <path d={fillPath} className="chart-fill-path" />
                  )}

                  {/* Glowing Stroke Curve Line */}
                  {linePath && (
                    <path 
                      d={linePath} 
                      className="chart-trend-line" 
                      style={{ 
                        stroke: site.color,
                        ['--brand-glow' as any]: site.glow
                      }} 
                    />
                  )}

                  {/* Data Node Circles */}
                  {chartPoints.map((pt, i) => (
                    (timeRange === '24h' || i % 6 === 0) && (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        className="chart-dot"
                        style={{ ['--brand-color' as any]: site.color }}
                      >
                        <title>{`${pt.label} — Capacity: ${pt.value}%`}</title>
                      </circle>
                    )
                  ))}
                </svg>
              </div>
              <div className="chart-axis-labels">
                <span>{axisLabels[0]}</span>
                <span>{axisLabels[1]}</span>
                <span>{axisLabels[2]}</span>
              </div>

              {/* Advanced SVG Analytics Breakdown numbers */}
              {analyticsSummary && (
                <div className="grid grid-cols-3 gap-2.5 mt-5 border-t border-white/5 pt-4 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-bold text-[#6d8196] uppercase tracking-wider">Avg Capacity</span>
                    <div className="text-base font-extrabold text-white mt-0.5">{analyticsSummary.average}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-bold text-[#6d8196] uppercase tracking-wider">Peak Hour</span>
                    <div className="text-base font-extrabold text-[#10b981] mt-0.5" title={`Max: ${analyticsSummary.peakVal}%`}>
                      {analyticsSummary.peakHourStr.split(' ').slice(-1)[0]}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-bold text-[#6d8196] uppercase tracking-wider">Lowest Hour</span>
                    <div className="text-base font-extrabold text-[#ef4444] mt-0.5" title={`Min: ${analyticsSummary.minVal}%`}>
                      {analyticsSummary.minHourStr.split(' ').slice(-1)[0]}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Geographic Traffic Sources */}
            <div className="geo-section">
              <h4 className="geo-title">Top Traffic Geographies</h4>
              <div className="geo-grid">
                {details.geographies.map((geo, index) => (
                  <div key={index} className="geo-row">
                    <div className="geo-info-row">
                      <span className="geo-country-name">{geo.country}</span>
                      <span 
                        className="geo-percentage"
                        style={{ color: site.color }}
                      >
                        {geo.percentage}%
                      </span>
                    </div>
                    <div className="geo-bar-track">
                      <div 
                        className="geo-bar-fill"
                        style={{ 
                          width: `${geo.percentage}%`,
                          backgroundColor: site.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Searched Topics Badges Card */}
            {displayedKeywords.length > 0 && (
              <div className="geo-section mt-6">
                <h4 className="geo-title">Most Searched Topics</h4>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {displayedKeywords.map((kw, index) => (
                    <div 
                      key={index}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-300 select-none cursor-default"
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
                      🔍 {kw}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trivia Fact */}
            <div className="modal-trivia">
              <span className="fact-icon">💡</span>
              <p>
                <strong>Fact:</strong> {details.funFact}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer mt-16 w-full max-w-[800px] border-t border-white/5 pt-8 text-center text-xs text-[#64748b] leading-relaxed">
        <p>Data compiled from 2026 industry statistics (Semrush & Similarweb).</p>
        <p className="mt-2 max-w-[600px] mx-auto">
          Disclaimer: All company names and logos are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
        </p>
      </footer>
    </div>
  );
}
