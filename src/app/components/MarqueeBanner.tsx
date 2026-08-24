'use client';

import React, { useRef, useEffect, useState } from 'react';

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
  news:    { icon: 'HOT',   className: 'marquee-item-news' },
};

/**
 * Scrolling live ticker banner.
 *
 * Accessibility & motion rules:
 *  - The track holds TWO identical sets of items so the CSS translate(-50%)
 *    loop is seamless. The second set is marked aria-hidden="true" so screen
 *    readers only announce each item once.
 *  - The role="marquee" region has an aria-label so AT users know what it is.
 *  - `prefers-reduced-motion: reduce` pauses the CSS animation entirely.
 *  - Hovering or focusing any element inside the track pauses animation.
 *
 * Color coding by type:
 *  - outage  → red pulse (real outage reports)
 *  - surge   → amber (minor/degraded service)
 *  - news    → orange (breaking tech news)
 *  - insight → cyan (Cloudflare Radar events & traffic facts)
 */
export default function MarqueeBanner({ items }: MarqueeBannerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Detect prefers-reduced-motion and pause immediately if set
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPaused(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPaused(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Apply pause to the CSS animation via inline style rather than toggling a class,
  // so it works regardless of the active stylesheet.
  const animationStyle = paused ? { animationPlayState: 'paused' as const } : {};

  if (items.length === 0) return null;

  const renderItems = (hidden: boolean) =>
    items.map((news, idx) => {
      const config = TYPE_CONFIG[news.type] ?? { icon: 'LIVE', className: '' };
      return (
        <span
          key={idx}
          className={`news-marquee-item ${config.className}`}
          // Items in the cloned (hidden) set are invisible to screen readers
          aria-hidden={hidden ? 'true' : undefined}
        >
          {config.icon} {news.text}
        </span>
      );
    });

  return (
    /*
     * role="marquee" is the implicit ARIA landmark for auto-scrolling content.
     * aria-label gives it a human-readable name.
     * aria-live="off" suppresses live-region chatter — the items don't need to
     * be announced as they scroll; they're navigable as static content.
     */
    <div
      className="news-marquee-container relative z-20"
      role="marquee"
      aria-label="Live traffic insights ticker"
      aria-live="off"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={(e) => {
        // Only resume if the element losing focus isn't inside the container
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!mq.matches) setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        // Resume only if focus left the container entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
          if (!mq.matches) setPaused(false);
        }
      }}
    >
      <span className="news-marquee-badge" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block mr-1.5" />
        Live
      </span>

      <div className="news-marquee-track-container" aria-hidden="true">
        {/*
          aria-hidden on the outer container means the track text is hidden
          from the AT tree. Instead we render a visually-hidden <ul> below
          that screen readers CAN navigate — proper list semantics, no duplication.
        */}
        <div
          className="news-marquee-track"
          ref={trackRef}
          style={animationStyle}
        >
          {/* First set — visible, animated */}
          {renderItems(false)}
          {/* Second set — purely visual clone for seamless CSS loop */}
          {renderItems(true)}
        </div>
      </div>

      {/*
        Visually-hidden static list for screen readers.
        Positioned off-screen with the standard sr-only technique so it
        doesn't affect layout but is fully accessible.
      */}
      <ul
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {items.map((news, idx) => {
          const config = TYPE_CONFIG[news.type] ?? { icon: 'LIVE', className: '' };
          return (
            <li key={idx}>
              {config.icon} {news.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
