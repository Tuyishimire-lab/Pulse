'use client';

import React from 'react';
import Link from 'next/link';
import { getPlatformLinks, RESOURCE_LINKS } from '../../lib/navLinks';

// Featured countries shown in the footer - covers major traffic regions.
// All other countries are reachable via /top-sites hub.
const FEATURED_COUNTRIES = [
  { slug: 'united-states',  name: 'United States' },
  { slug: 'india',          name: 'India' },
  { slug: 'brazil',         name: 'Brazil' },
  { slug: 'united-kingdom', name: 'United Kingdom' },
  { slug: 'japan',          name: 'Japan' },
  { slug: 'germany',        name: 'Germany' },
  { slug: 'indonesia',      name: 'Indonesia' },
  { slug: 'nigeria',        name: 'Nigeria' },
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
              The transparent, model-driven index of global web traffic. Visualizing the top 100+ most visited websites with statistical estimates.
            </p>
            <p className="footer-source">
              Powered by the Pulse Traffic Index (PTI): Cloudflare Radar DNS telemetry, Tranco rankings, Open PageRank, and Groq AI momentum signals.
            </p>
          </div>

          {/* Navigation column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              {getPlatformLinks().map(({ href, label }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Resources</h4>
            <ul className="footer-links">
              {RESOURCE_LINKS.map(({ href, label }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Top Sites by Country column */}
          <div className="footer-nav-col footer-countries-col">
            <h4 className="footer-col-title">Top Sites by Country</h4>
            <div className="footer-country-grid">
              {FEATURED_COUNTRIES.map(({ slug, name }) => (
                <Link key={slug} href={'/top-sites/' + slug} className="footer-country-link">
                  {name}
                </Link>
              ))}
            </div>
            {/* Hub link - ensures every country page has an internal link path */}
            <Link
              href="/top-sites"
              className="mt-2 inline-flex items-center gap-1 text-xs text-[#82c8e5] hover:text-white transition-colors font-medium"
            >
              Browse all countries →
            </Link>
          </div>
        </div>

        {/* ── Methodology disclaimer ───────────────────────────────── */}
        <div className="footer-disclaimer">
          <p>
            <strong>Methodology:</strong> Pulse metrics are produced by the Pulse Traffic Index (PTI) - a statistical model combining Cloudflare Radar DNS telemetry, Tranco global rankings, Open PageRank authority scores, and Groq AI momentum signals. Pulse is not a real-time server tap; it is an independent probabilistic estimate. Mean error margin: ~34.6%. <Link href="/methodology" className="underline hover:text-white transition-colors">Full methodology →</Link>
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
