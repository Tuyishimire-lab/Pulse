'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  if (pathname?.startsWith('/embed')) return null;

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
              The transparent, model-driven index of global web traffic. Visualizing the top 137+ most visited websites with statistical estimates.
            </p>
            <p className="footer-source">
              Powered by the Pulse Traffic Index (PTI): Cloudflare Radar DNS telemetry, Tranco rankings, Open PageRank, and Groq AI momentum signals.
            </p>
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block mb-1">
                Ecosystem &amp; AI Search
              </span>
              <a
                href="https://www.citeroute.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#05AD98] hover:text-[#049381] font-semibold transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#05AD98] animate-pulse" />
                <span>CiteRoute: Generative Engine (GEO) &amp; Agent Observability</span>
                <svg className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>
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
              <li>
                <a
                  href="https://www.citeroute.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#05AD98] hover:underline flex items-center gap-1"
                >
                  CiteRoute GEO ↗
                </a>
              </li>
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
            <strong>Methodology:</strong> Pulse metrics are produced by the Pulse Traffic Index (PTI), a statistical model combining verified monthly traffic baselines with live Cloudflare Radar DNS telemetry, Tranco global rankings, Open PageRank authority scores, and Groq AI momentum signals. Displayed rates are modulated by real-time Radar signals (±15%). Pulse is an independent probabilistic estimate with tiered confidence (±8% to 12% for top global nodes; ±18% to 24% mid-tier). <Link href="/methodology" className="underline hover:text-white transition-colors">Full methodology →</Link>
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
