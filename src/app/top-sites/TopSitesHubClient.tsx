'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import NavHeader from '../components/NavHeader';
import { CountryData } from './data/countries';
import { CURRENT_YEAR } from '../../lib/currentYear';

interface Props {
  countries: CountryData[];
}

const REGIONS: Record<string, string[]> = {
  'Americas':      ['US','CA','MX','BR','AR','CO','CL','PE','VE','EC','BO','PY','UY','GY','SR','PA','CR','HN','SV','GT','NI','CU','DO','PR','JM','TT'],
  'Europe':        ['GB','DE','FR','IT','ES','NL','PL','SE','NO','DK','FI','CH','AT','BE','PT','IE','CZ','HU','RO','GR','BG','HR','SK','SI','EE','LV','LT','LU','MT','CY','BA','RS','MK','ME','AL','MD','UA','BY','RU'],
  'Asia':          ['CN','IN','JP','KR','ID','PH','VN','TH','MY','SG','BD','PK','LK','NP','MM','KH','LA','MN','AF','AM','AZ','GE','KZ','KG','TJ','TM','UZ','IQ','IR','SA','AE','IL','JO','LB','SY','YE','OM','KW','QA','BH'],
  'Africa':        ['NG','ZA','KE','EG','ET','GH','TZ','UG','DZ','MA','TN','SD','SN','CI','CM','AO','MZ','ZM','ZW','SO','MG','MW','BF','ML','GM','SL','GN','GA','CG','CD','RW','BI'],
  'Oceania':       ['AU','NZ','FJ','PG'],
};

function getRegion(cfCode: string): string {
  for (const [region, codes] of Object.entries(REGIONS)) {
    if (codes.includes(cfCode)) return region;
  }
  return 'Other';
}

export default function TopSitesHubClient({ countries }: Props) {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<string>('All');

  const regionNames = ['All', ...Object.keys(REGIONS), 'Other'];

  const filtered = useMemo(() => {
    let list = countries;
    if (activeRegion !== 'All') {
      list = list.filter((c) => getRegion(c.cfCode) === activeRegion);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q));
    }
    return list;
  }, [countries, query, activeRegion]);

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 10% 20%, rgba(0,71,171,0.18) 0%, transparent 55%),
                       radial-gradient(circle at 90% 70%, rgba(130,200,229,0.10) 0%, transparent 55%)`,
        }}
      />

      <NavHeader />

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#82c8e5]/10 text-[#82c8e5] border border-[#82c8e5]/20 mb-4">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#82c8e5] animate-pulse" />
            {countries.length} Countries Tracked
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Top Websites by Country - {CURRENT_YEAR}
          </h1>
          <p className="text-[#94a3b8] text-base leading-relaxed max-w-2xl">
            Discover the most visited websites in every country, ranked by the Pulse Traffic Index (PTI).
            Each page shows real-time visitor estimates, internet penetration stats, and local platform insights.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d8196]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${countries.length} countries…`}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-[#6d8196] focus:outline-none focus:border-[#82c8e5]/40 focus:bg-white/[0.06] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d8196] hover:text-white transition-colors text-lg leading-none"
                aria-label="Clear search"
              >×</button>
            )}
          </div>

          {/* Region filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {regionNames.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRegion === r
                    ? 'bg-[#82c8e5]/15 text-[#82c8e5] border border-[#82c8e5]/30'
                    : 'bg-white/[0.03] text-[#6d8196] border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-xs text-[#6d8196]">
          {filtered.length === countries.length
            ? `All ${countries.length} countries`
            : `${filtered.length} of ${countries.length} countries`}
          {activeRegion !== 'All' && ` in ${activeRegion}`}
          {query && ` matching "${query}"`}
        </div>

        {/* Country grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#6d8196]">
            <p className="text-lg mb-2">No countries match your search.</p>
            <button
              onClick={() => { setQuery(''); setActiveRegion('All'); }}
              className="text-sm text-[#82c8e5] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((country) => (
              <Link
                key={country.slug}
                href={'/top-sites/' + country.slug}
                className="group flex flex-col gap-1.5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  {country.flag && (
                    <span className="text-xl leading-none flex-shrink-0">{country.flag}</span>
                  )}
                  <span className="font-semibold text-sm text-white group-hover:text-[#82c8e5] transition-colors leading-snug">
                    {country.name}
                  </span>
                </div>
                <div className="text-[11px] text-[#6d8196] flex items-center gap-1.5">
                  <span>{country.internetUsers} users</span>
                  <span className="opacity-50">·</span>
                  <span>{country.internetPenetration}</span>
                </div>
                <div className="mt-1 text-[10px] font-medium text-[#82c8e5]/60 group-hover:text-[#82c8e5] transition-colors">
                  View top sites →
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Cross-links to other sections */}
        <div className="mt-14 pt-8 border-t border-white/[0.06]">
          <h2 className="text-base font-bold text-white mb-4">Explore More</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/', label: 'Live Dashboard', desc: 'Real-time global traffic' },
              { href: '/trending', label: 'Trending', desc: 'Biggest rank movers' },
              { href: '/category/ai', label: 'Categories', desc: 'Traffic by industry' },
              { href: '/map', label: 'Traffic Map', desc: 'Visualize by geography' },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
              >
                <div className="font-semibold text-sm text-white group-hover:text-[#82c8e5] transition-colors mb-1">{label}</div>
                <div className="text-[11px] text-[#6d8196]">{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
