'use client';

import React from 'react';

interface MarqueeItem {
  text: string;
  type: string;
  asns?: number[];
  locations?: string[];
}

interface MarqueeBannerProps {
  items: MarqueeItem[];
}

const TYPE_CONFIG: Record<string, { icon: string; className: string }> = {
  outage:  { icon: 'ALERT', className: 'marquee-item-outage' },
  surge:   { icon: 'SURGE', className: 'marquee-item-surge' },
  insight: { icon: 'RADAR', className: 'marquee-item-insight' },
  news:    { icon: 'HOT', className: 'marquee-item-news' },
};

/**
 * Scrolling live ticker banner.
 * Items are color-coded by type:
 *  - outage  → red pulse (real outage reports)
 *  - surge   → amber (minor/degraded service)
 *  - news    → orange (breaking tech news)
 *  - insight → cyan (Cloudflare Radar events & traffic facts)
 */
export default function MarqueeBanner({ items }: MarqueeBannerProps) {
  // Duplicate items so the scroll loop is seamless
  const doubled = [...items, ...items];

  return (
    <div className="news-marquee-container relative z-20">
      <span className="news-marquee-badge">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block mr-1.5" />
        Live
      </span>
      <div className="news-marquee-track-container">
        <div className="news-marquee-track">
          {doubled.map((news, idx) => {
            const config = TYPE_CONFIG[news.type] ?? { icon: 'LIVE', className: '' };
            return (
              <span
                key={idx}
                className={`news-marquee-item ${config.className}`}
              >
                {config.icon} {news.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
