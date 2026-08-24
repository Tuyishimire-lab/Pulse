'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CURRENT_YEAR } from '../../lib/currentYear';

// ─── SSR skeleton ────────────────────────────────────────────────────────────
// Rendered on the server in place of the WebGL/SVG map while React hydrates.
// Must ship meaningful HTML so crawlers and no-JS users see real content.
function MapSkeleton({ countryMap }: Props) {
  const countries = Object.values(countryMap);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #060d18 0%, #0a1628 50%, #060d18 100%)',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Nav placeholder */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#00e5ff',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          Pulse
        </Link>
        <Link
          href="/"
          style={{ fontSize: '0.8rem', color: '#6d8196', textDecoration: 'none' }}
        >
          ← Back to Dashboard
        </Link>
      </nav>

      {/* Hero text - the only part Googlebot will index */}
      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '56px 24px 32px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 16,
            background: 'linear-gradient(90deg, #00e5ff, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Global Web Traffic Map {CURRENT_YEAR}
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: '#94a3b8',
            lineHeight: 1.7,
            maxWidth: 640,
            margin: '0 auto 40px',
          }}
        >
          Interactive world map visualizing internet penetration rates, dominant
          platform ecosystems, and online population across{' '}
          <strong style={{ color: '#e2e8f0' }}>{countries.length}+ countries</strong>.
          Click any country to explore its top websites and traffic data.
        </p>

        {/* Visual map placeholder - animated shimmer while WebGL loads */}
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            maxWidth: 720,
            aspectRatio: '16/9',
            margin: '0 auto 48px',
            borderRadius: 16,
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.06) 0%, rgba(10,22,40,0.9) 70%)',
            border: '1px solid rgba(0,229,255,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="rgba(0,229,255,0.3)" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="4" ry="10" stroke="rgba(0,229,255,0.3)" strokeWidth="1.5" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="rgba(0,229,255,0.3)" strokeWidth="1.5" />
          </svg>
          <span style={{ fontSize: '0.75rem', color: '#4d6a84', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Loading interactive map…
          </span>
        </div>

        {/* Static country list for crawlers */}
        <h2
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6d8196',
            marginBottom: 20,
          }}
        >
          Countries covered
        </h2>
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '6px 12px',
            listStyle: 'none',
            padding: 0,
            margin: '0 auto',
            maxWidth: 760,
            textAlign: 'left',
          }}
        >
          {countries.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/top-sites/${c.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                  fontSize: '0.8rem',
                  color: '#82c8e5',
                  textDecoration: 'none',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: c.topSiteColor,
                    flexShrink: 0,
                  }}
                />
                {c.name}
                <span style={{ color: '#4d6a84', marginLeft: 'auto', fontSize: '0.7rem' }}>
                  #{c.topSiteName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* No-JS fallback - hidden from regular users, visible to non-JS scrapers */}
      <noscript>
        <div
          style={{
            margin: '24px auto',
            maxWidth: 720,
            padding: '20px 24px',
            background: 'rgba(0,229,255,0.04)',
            border: '1px solid rgba(0,229,255,0.15)',
            borderRadius: 12,
            fontSize: '0.85rem',
            color: '#94a3b8',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: '#e2e8f0' }}>JavaScript is required</strong> for the
          interactive 3D map. You can explore country-level traffic data by visiting
          the individual country pages linked above.
        </div>
      </noscript>
    </div>
  );
}

// ─── Dynamic import - ssr: false because react-simple-maps uses browser APIs ─
// We provide a loading: skeleton so the server ships real HTML rather than
// an empty body, keeping crawlers and no-JS users happy.
const MapPageClient = dynamic(() => import('./MapPageClient'), {
  ssr: false,
  loading: ({ error }) => {
    // On load error show a minimal message instead of silently nothing
    if (error) {
      return (
        <div style={{ padding: 48, textAlign: 'center', color: '#ef4444', fontFamily: 'system-ui' }}>
          Map failed to load. <a href="/" style={{ color: '#00e5ff' }}>Return to dashboard →</a>
        </div>
      );
    }
    // Return null here - the skeleton is rendered server-side via the wrapper
    return null;
  },
});

interface Props {
  countryMap: Record<string, {
    slug: string;
    name: string;
    internetUsers: string;
    internetUsersMillions?: number;
    internetPenetration: string;
    topSiteName: string;
    topSiteId: string;
    topSiteColor: string;
  }>;
}

export default function MapClientWrapper({ countryMap }: Props) {
  // After JS hydrates, hide the SSR skeleton so the interactive map shows cleanly.
  // We use a simple inline style toggle rather than a class to avoid needing a
  // global CSS rule - this way the skeleton is visible in the SSR HTML but
  // disappears immediately once the client component tree mounts.
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => { setHydrated(true); }, []);

  return (
    <>
      {/* SSR skeleton - visible to crawlers, first paint, and no-JS users.
          Hidden client-side as soon as React hydrates (via visibility: hidden
          so it still occupies layout space, avoiding CLS during the swap). */}
      <div
        id="map-ssr-shell"
        aria-hidden={hydrated}
        suppressHydrationWarning
        style={hydrated ? { display: 'none' } : undefined}
      >
        <MapSkeleton countryMap={countryMap} />
      </div>

      {/* Client-only interactive map - rendered only after hydration.
          Absent from SSR HTML, so crawlers never see a duplicate. */}
      {hydrated && <MapPageClient countryMap={countryMap} />}
    </>
  );
}

