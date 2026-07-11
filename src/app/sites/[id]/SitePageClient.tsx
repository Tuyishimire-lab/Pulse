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

export default function SitePageClient({ id }: { id: string }) {
  const site = useMemo(() => SITES.find((s) => s.id === id), [id]);
  const details = useMemo(() => (site ? getSiteDetails(site) : null), [site]);

  const timerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());
  const [dbHistory, setDbHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!site || !isSupabaseConfigured) return;

    supabase
      .from('traffic_history')
      .select('visits_percentage')
      .eq('site_id', site.id)
      .order('timestamp', { ascending: true })
      .limit(24)
      .then((res: any) => {
        const data = res.data;
        if (data && data.length > 0) {
          setDbHistory(data.map((item: any) => Number(item.visits_percentage)));
        }
      });
  }, [site]);

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

  // SVG Chart calculation helper arrays
  const chartPoints = useMemo(() => {
    if (!details) return [];
    const width = 580; // responsive scale
    const height = 110;
    const history = dbHistory.length > 0 ? dbHistory : details.trafficHistory;
    return history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - (val / 100) * 80 - 15; // Inverted y-axis maps 0-100 score to 15-95px heights
      return { x, y, value: val, hour: idx };
    });
  }, [details, dbHistory]);

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
              <h4 className="chart-title">Estimated Traffic Waves (Last 24 Hours)</h4>
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
