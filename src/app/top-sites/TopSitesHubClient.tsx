'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import NavHeader from '../components/NavHeader';
import { CountryData } from './data/countries';
import { getRegionalProfile } from './data/regionalProfiles';
import { SITES, SiteConfig } from '../data/sites';
import FaviconImage from '../components/ui/FaviconImage';
import { CURRENT_YEAR } from '../../lib/currentYear';
import { getCountryFlagColors } from './data/flagColors';

interface Props {
  countries: CountryData[];
}

type SortMode = 'users' | 'penetration' | 'alpha';

const REGIONS: Record<string, string[]> = {
  'Americas': ['US','CA','MX','BR','AR','CO','CL','PE','VE','EC','BO','PY','UY','GY','SR','PA','CR','HN','SV','GT','NI','CU','DO','PR','JM','TT'],
  'Europe':   ['GB','DE','FR','IT','ES','NL','PL','SE','NO','DK','FI','CH','AT','BE','PT','IE','CZ','HU','RO','GR','BG','HR','SK','SI','EE','LV','LT','LU','MT','CY','BA','RS','MK','ME','AL','MD','UA','BY','RU'],
  'Asia':     ['CN','IN','JP','KR','ID','PH','VN','TH','MY','SG','BD','PK','LK','NP','MM','KH','LA','MN','AF','AM','AZ','GE','KZ','KG','TJ','TM','UZ','IQ','IR','SA','AE','IL','JO','LB','SY','YE','OM','KW','QA','BH','TW','PS'],
  'Africa':   ['NG','ZA','KE','EG','ET','GH','TZ','UG','DZ','MA','TN','SD','SN','CI','CM','AO','MZ','ZM','ZW','SO','MG','MW','BF','ML','GM','SL','GN','GA','CG','CD','RW','BI','BW','LY'],
  'Oceania':  ['AU','NZ','FJ','PG'],
};

const SITE_LOOKUP = new Map<string, SiteConfig>(SITES.map((s) => [s.id, s]));

function getRegion(cfCode: string): string {
  for (const [region, codes] of Object.entries(REGIONS)) {
    if (codes.includes(cfCode)) return region;
  }
  return 'Other';
}

function parseUsersCount(str: string): number {
  if (!str) return 0;
  const s = str.toLowerCase().trim();
  const num = parseFloat(s.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 0;
  if (s.includes('billion') || s.endsWith('b')) return num * 1_000_000_000;
  if (s.includes('million') || s.endsWith('m')) return num * 1_000_000;
  if (s.includes('k')) return num * 1_000;
  return num;
}

function parsePenetration(str: string): number {
  if (!str) return 0;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

/** Returns 4 preview sites for a country card: top 2 overall + 2 regional standouts (or top 4). */
function getCountryPreviewSites(country: CountryData): { site: SiteConfig; isStandout: boolean }[] {
  const rawIds =
    country.pinnedSiteIds && country.pinnedSiteIds.length > 0
      ? country.pinnedSiteIds
      : getRegionalProfile(country.cfCode);

  const resolved: { site: SiteConfig; localRank: number; delta: number }[] = [];
  rawIds.forEach((id, idx) => {
    const site = SITE_LOOKUP.get(id);
    if (site) {
      resolved.push({ site, localRank: idx + 1, delta: site.rank - (idx + 1) });
    }
  });

  if (resolved.length === 0) return [];

  const picked: { site: SiteConfig; isStandout: boolean }[] = [];
  const usedIds = new Set<string>();

  // First 2 top sites in the country
  for (const item of resolved.slice(0, 2)) {
    picked.push({ site: item.site, isStandout: item.delta >= 5 });
    usedIds.add(item.site.id);
  }

  // Up to 2 regional standouts (highest local boost vs global rank)
  const standouts = resolved
    .filter((r) => !usedIds.has(r.site.id) && r.delta >= 5)
    .sort((a, b) => b.delta - a.delta);

  for (const st of standouts) {
    if (picked.length >= 4) break;
    picked.push({ site: st.site, isStandout: true });
    usedIds.add(st.site.id);
  }

  // Fill remaining up to 4 from ordered list
  for (const item of resolved) {
    if (picked.length >= 4) break;
    if (!usedIds.has(item.site.id)) {
      picked.push({ site: item.site, isStandout: false });
      usedIds.add(item.site.id);
    }
  }

  return picked;
}

export default function TopSitesHubClient({ countries }: Props) {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortMode>('users');

  const regionNames = ['All', ...Object.keys(REGIONS)];

  const filtered = useMemo(() => {
    let list = [...countries];
    if (activeRegion !== 'All') {
      list = list.filter((c) => getRegion(c.cfCode) === activeRegion);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q) || c.cfCode.toLowerCase() === q);
    }
    if (sortBy === 'users') {
      list.sort((a, b) => parseUsersCount(b.internetUsers) - parseUsersCount(a.internetUsers));
    } else if (sortBy === 'penetration') {
      list.sort(
        (a, b) =>
          parsePenetration(b.internetPenetration) - parsePenetration(a.internetPenetration) ||
          parseUsersCount(b.internetUsers) - parseUsersCount(a.internetUsers)
      );
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [countries, query, activeRegion, sortBy]);

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
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

            {/* Sort selector */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6d8196] mr-1">Sort:</span>
              {([
                { id: 'users', label: 'Most Users' },
                { id: 'penetration', label: 'Penetration %' },
                { id: 'alpha', label: 'A–Z' },
              ] as { id: SortMode; label: string }[]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === opt.id
                      ? 'bg-[#82c8e5]/15 text-[#82c8e5] border border-[#82c8e5]/30'
                      : 'bg-white/[0.03] text-[#6d8196] border border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filtered.map((country) => {
              const colors = getCountryFlagColors(country.cfCode);
              const previewSites = getCountryPreviewSites(country);
              return (
                <Link
                  key={country.slug}
                  href={'/top-sites/' + country.slug}
                  className="group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  style={{
                    background: colors.bgGradient,
                    borderColor: colors.borderColor,
                    boxShadow: '0 4px 20px -5px rgba(0,0,0,0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 10px 30px -5px ${colors.glowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.borderColor;
                    e.currentTarget.style.boxShadow = '0 4px 20px -5px rgba(0,0,0,0.4)';
                  }}
                >
                  {/* Subtle top flag accent stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                    }}
                  />

                  <div>
                    {/* Header: Country Name + Flag Emoji / CF Tag */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-base text-white group-hover:text-white transition-colors leading-snug">
                        {country.name}
                      </span>
                      {country.flag ? (
                        <span className="text-2xl leading-none flex-shrink-0 drop-shadow">
                          {country.flag}
                        </span>
                      ) : (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase flex-shrink-0 border border-white/10"
                          style={{
                            backgroundColor: colors.tagBg,
                            color: colors.tagText,
                          }}
                        >
                          {country.cfCode}
                        </span>
                      )}
                    </div>

                    {/* Stats: Users & Penetration */}
                    <div className="text-xs text-[#94a3b8] flex items-center gap-1.5 font-medium mb-3">
                      <span>{country.internetUsers} users</span>
                      <span className="opacity-40">·</span>
                      <span style={{ color: colors.primary }}>{country.internetPenetration}</span>
                    </div>

                    {/* Top & Signature Sites Preview */}
                    {previewSites.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {previewSites.map(({ site, isStandout }) => (
                          <span
                            key={site.id}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${
                              isStandout
                                ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-300'
                                : 'bg-white/[0.04] border-white/[0.08] text-[#cbd5e1]'
                            }`}
                          >
                            <FaviconImage
                              url={site.url}
                              logo={site.logo}
                              color={site.color}
                              size={12}
                              className="w-3 h-3 rounded-full object-contain flex-shrink-0"
                            />
                            <span className="truncate max-w-[72px]">{site.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Call to action arrow */}
                  <div
                    className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold transition-colors"
                    style={{ color: colors.primary }}
                  >
                    <span>View top 20 sites</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
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
