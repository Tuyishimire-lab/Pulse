'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchModal from './SearchModal';

/**
 * Shared navigation header for all pages with global search button & modal.
 */
export default function NavHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Live Dashboard' },
    { href: '/top-sites/united-states', label: 'Top Sites' },
    { href: '/trending', label: 'Trending' },
    { href: '/compare', label: 'Compare' },
    { href: '/category/ai', label: 'Categories' },
    { href: '/map', label: 'Traffic Map' },
    { href: '/speed-test', label: 'Speed Test' },
    { href: `/report/${getCurrentWeekSlug()}`, label: 'Weekly Report' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    // Category link is active for any /category/* path
    if (href === '/category/ai') return pathname.startsWith('/category');
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="relative z-50 w-full border-b border-white/[0.06] bg-[#02020a]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <span className="relative flex items-center justify-center w-7 h-7">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#82c8e5] opacity-25 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#82c8e5]" />
            </span>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white to-[#82c8e5] bg-clip-text text-transparent">
              Pulse
            </span>
          </Link>

          {/* Global Search trigger button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-[#6d8196] hover:text-white transition-all text-xs flex-1 max-w-xs"
            aria-label="Search sites, vs, countries"
          >
            <svg className="w-3.5 h-3.5 text-[#82c8e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <span className="hidden xs:inline truncate">Search sites, vs, countries...</span>
            <span className="xs:hidden">Search...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono text-[#6d8196] bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
              ⌘K
            </kbd>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1 flex-shrink-0" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive(href)
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#6d8196] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col justify-center gap-1.5 w-8 h-8 items-center"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`block h-0.5 w-5 bg-white/60 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white/60 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white/60 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <nav className="sm:hidden border-t border-white/[0.06] bg-[#02020a]/95 px-4 py-3 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive(href)
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#6d8196] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Global Command Palette Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

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
