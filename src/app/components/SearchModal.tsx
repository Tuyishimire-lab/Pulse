'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SITES } from '../data/sites';
import { COMPARE_PAIRS } from '../compare/data/pairs';
import { COUNTRIES } from '../top-sites/data/countries';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K & Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default top suggestions
      return [
        {
          type: 'site',
          id: 'chatgpt',
          title: 'ChatGPT',
          subtitle: '#5 Global Rank · AI Assistant',
          url: '/sites/chatgpt',
          badge: 'Site',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        },
        {
          type: 'compare',
          id: 'google-vs-chatgpt',
          title: 'Google vs ChatGPT',
          subtitle: 'Search Engine vs AI Search Comparison',
          url: '/compare/google-vs-chatgpt',
          badge: 'VS',
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        },
        {
          type: 'country',
          id: 'united-states',
          title: 'United States',
          subtitle: 'Top 20 Visited Websites in US',
          url: '/top-sites/united-states',
          badge: 'Country',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        },
      ];
    }

    const items: Array<{
      type: 'site' | 'compare' | 'country';
      id: string;
      title: string;
      subtitle: string;
      url: string;
      badge: string;
      badgeColor: string;
    }> = [];

    // Search Sites (max 6)
    const matchingSites = SITES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    ).slice(0, 5);

    matchingSites.forEach((s) => {
      items.push({
        type: 'site',
        id: s.id,
        title: s.name,
        subtitle: `#${s.rank} Global Rank · ${s.baseline}`,
        url: `/sites/${s.id}`,
        badge: 'Site',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      });
    });

    // Search Compare Pairs (max 5)
    const matchingPairs = COMPARE_PAIRS.filter((p) => {
      const siteA = SITES.find((s) => s.id === p.siteAId)?.name.toLowerCase() ?? '';
      const siteB = SITES.find((s) => s.id === p.siteBId)?.name.toLowerCase() ?? '';
      return p.slug.includes(q) || siteA.includes(q) || siteB.includes(q) || p.context.toLowerCase().includes(q);
    }).slice(0, 5);

    matchingPairs.forEach((p) => {
      const siteA = SITES.find((s) => s.id === p.siteAId)?.name ?? p.siteAId;
      const siteB = SITES.find((s) => s.id === p.siteBId)?.name ?? p.siteBId;
      items.push({
        type: 'compare',
        id: p.slug,
        title: `${siteA} vs ${siteB}`,
        subtitle: p.context || 'Traffic & metrics comparison',
        url: `/compare/${p.slug}`,
        badge: 'VS',
        badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      });
    });

    // Search Countries (max 4)
    const matchingCountries = COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.cfCode.toLowerCase().includes(q) || c.slug.includes(q)
    ).slice(0, 4);

    matchingCountries.forEach((c) => {
      items.push({
        type: 'country',
        id: c.slug,
        title: `${c.flag} ${c.name}`,
        subtitle: `Top sites in ${c.name} (${c.internetUsers} users)`,
        url: `/top-sites/${c.slug}`,
        badge: 'Country',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      });
    });

    return items;
  }, [query]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].url);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click listener */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-xl bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <svg className="w-4 h-4 text-[#82c8e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search sites, vs comparisons, or countries... (e.g. 'ChatGPT', 'Spain')"
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-[#6d8196] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#6d8196] hover:text-white px-1.5 py-0.5 rounded bg-white/10"
            >
              Clear
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono text-[#6d8196] px-1.5 py-0.5 border border-white/10 rounded">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/[0.04]">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6d8196]">
              No results found for "{query}". Try searching for a domain like "youtube" or country like "spain".
            </div>
          ) : (
            results.map((item, idx) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.url}
                onClick={onClose}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                  idx === selectedIndex ? 'bg-white/[0.08] text-white' : 'text-[#94a3b8] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      {item.title}
                    </span>
                    <span className="text-xs text-[#6d8196]">{item.subtitle}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#6d8196]">
          <span>
            Use <kbd className="px-1 py-0.5 bg-white/10 rounded font-mono text-[10px]">↑</kbd>{' '}
            <kbd className="px-1 py-0.5 bg-white/10 rounded font-mono text-[10px]">↓</kbd> to navigate,{' '}
            <kbd className="px-1 py-0.5 bg-white/10 rounded font-mono text-[10px]">↵</kbd> to select
          </span>
          <span className="hidden sm:inline">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
