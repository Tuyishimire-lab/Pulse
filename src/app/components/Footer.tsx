'use client';

import React from 'react';
import Link from 'next/link';

/** Returns the current ISO week slug, e.g. "2026-w31" */
function getCurrentWeekSlug(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-w${String(week).padStart(2, '0')}`;
}

const COUNTRY_LINKS = [
  { slug: 'united-states', name: 'United States' },
  { slug: 'india', name: 'India' },
  { slug: 'brazil', name: 'Brazil' },
  { slug: 'united-kingdom', name: 'United Kingdom' },
  { slug: 'germany', name: 'Germany' },
  { slug: 'france', name: 'France' },
  { slug: 'japan', name: 'Japan' },
  { slug: 'canada', name: 'Canada' },
  { slug: 'australia', name: 'Australia' },
  { slug: 'mexico', name: 'Mexico' },
  { slug: 'south-korea', name: 'South Korea' },
  { slug: 'indonesia', name: 'Indonesia' },
  { slug: 'nigeria', name: 'Nigeria' },
  { slug: 'argentina', name: 'Argentina' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer relative z-10">
      {/* Top accent line */}
      <div className="footer-accent" />

      <div className="footer-inner">
        {/* ── Upper section: Brand + Navigation columns ─────────────── */}
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo-link">
              <span className="footer-pulse-dot" />
              <span className="footer-logo-text">Pulse</span>
            </Link>
            <p className="footer-tagline">
              Real-time global web traffic intelligence. Visualizing the top 100 most visited websites with live data streams.
            </p>
            <p className="footer-source">
              Data sourced from Semrush &amp; Similarweb {year} estimates, Cloudflare Radar telemetry, and public panel benchmarks.
            </p>
          </div>

          {/* Navigation column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li><Link href="/">Live Dashboard</Link></li>
              <li><Link href={`/report/${getCurrentWeekSlug()}`}>Weekly Report</Link></li>
              <li><Link href="/compare">Compare Sites</Link></li>
              <li><Link href="/speed-test">Speed Test</Link></li>
              <li><Link href="/top-sites/united-states">Top Sites</Link></li>
            </ul>
          </div>

          {/* Resources column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links">
              <li><Link href="/methodology">Data &amp; Methodology</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Top Sites by Country column */}
          <div className="footer-nav-col footer-countries-col">
            <h4 className="footer-col-title">Top Sites by Country</h4>
            <div className="footer-country-grid">
              {COUNTRY_LINKS.map(({ slug, name }) => (
                <Link key={slug} href={`/top-sites/${slug}`} className="footer-country-link">
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Methodology disclaimer ───────────────────────────────── */}
        <div className="footer-disclaimer">
          <p>
            <strong>Methodology:</strong> Pulse metrics are statistical models derived from public panel benchmarks, Cloudflare Radar network telemetry, and published industry estimates. Pulse is not a direct server tap like Similarweb, Worldometer, or Statista, it uses statistical modeling to visualize global web traffic at scale.
          </p>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Pulse. All rights reserved.
          </p>
          <p className="footer-trademark">
            All product names, logos, and brands are property of their respective owners. Used for identification purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
