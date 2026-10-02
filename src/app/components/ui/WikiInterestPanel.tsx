'use client';

import React, { useMemo } from 'react';

export interface WikiViewsData {
  article_title: string;
  daily_views: { date: string; views: number }[] | null;
  monthly_avg: number | null;
  trend_pct: number | null;
}

interface Props {
  data: WikiViewsData;
  color: string;
}

export default function WikiInterestPanel({ data, color }: Props) {
  const views = useMemo(() => {
    if (!data.daily_views) return [];
    try {
      const parsed = typeof data.daily_views === 'string'
        ? JSON.parse(data.daily_views)
        : data.daily_views;
      return Array.isArray(parsed) ? (parsed as { date: string; views: number }[]) : [];
    } catch {
      return [];
    }
  }, [data.daily_views]);

  const sparklinePath = useMemo(() => {
    if (views.length < 2) return '';
    const maxViews = Math.max(...views.map(v => v.views));
    const minViews = Math.min(...views.map(v => v.views));
    const range = maxViews - minViews || 1;
    const width = 280;
    const height = 40;

    return views.map((v, i) => {
      const x = (i / (views.length - 1)) * width;
      const y = height - ((v.views - minViews) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [views]);

  const fillPath = useMemo(() => {
    if (!sparklinePath) return '';
    return `${sparklinePath} L 280 40 L 0 40 Z`;
  }, [sparklinePath]);

  const trendPct = data.trend_pct ?? 0;
  const trendColor = trendPct >= 0 ? '#22c55e' : '#ef4444';

  const avgFormatted = useMemo(() => {
    const avg = data.monthly_avg ?? 0;
    if (avg >= 1_000_000) return `${(avg / 1_000_000).toFixed(1)}M`;
    if (avg >= 1_000) return `${(avg / 1_000).toFixed(1)}K`;
    return avg.toLocaleString();
  }, [data.monthly_avg]);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '20px 22px',
      marginTop: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h4 style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '-0.02em',
          }}>
            Public Interest
          </h4>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, display: 'block' }}>
            Wikipedia daily pageviews - Last 30 days
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 8,
          backgroundColor: `${trendColor}12`,
          border: `1px solid ${trendColor}25`,
        }}>
          {trendPct >= 0 ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
          <span style={{ fontSize: 11, color: trendColor, fontWeight: 700 }}>
            {Math.abs(trendPct).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Sparkline */}
      {views.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <svg viewBox="0 0 280 40" style={{ width: '100%', height: 50, display: 'block' }}>
            <defs>
              <linearGradient id={`wiki-fill-${data.article_title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={fillPath} fill={`url(#wiki-fill-${data.article_title})`} />
            <path d={sparklinePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Avg Daily Views
          </span>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginTop: 2 }}>
            {avgFormatted}
          </div>
        </div>
        <a
          href={`https://en.wikipedia.org/wiki/${data.article_title}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
        >
          <span>Wikipedia</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  );
}
