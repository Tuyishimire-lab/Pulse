'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavHeader from '../../components/NavHeader';
import { SiteConfig } from '../../data/sites';

interface Props {
  slug: string;
  label: string;
  sites: SiteConfig[];
  allCategories: { id: string; label: string }[];
  categoryTotals: Record<string, { count: number; totalRate: number }>;
}

function FaviconImg({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [err, setErr] = useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  if (err) {
    return (
      <span
        className="rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs"
        style={{
          width: 36,
          height: 36,
          backgroundColor: color + '28',
          color: color === '#ffffff' ? '#c0cfd8' : color,
        }}
      >
        {logo}
      </span>
    );
  }
  return (
    <Image
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt={`${logo} favicon`}
      width={36}
      height={36}
      onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0"
      style={{ backgroundColor: color + '18', padding: 2 }}
      unoptimized
    />
  );
}

function LiveRate({ rate }: { rate: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      setCount(Math.floor(rate * (Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [rate]);
  return <span className="font-mono tabular-nums text-emerald-400">+{count.toLocaleString()}</span>;
}

export default function CategoryPageClient({
  slug,
  label,
  sites,
  allCategories,
  categoryTotals,
}: Props) {
  const [sortBy, setSortBy] = useState<'rate' | 'rank' | 'baseline' | 'name'>('rate');

  const totalRate = sites.reduce((s, x) => s + x.rate, 0);
  const totalMonthlyRaw = sites.reduce((s, x) => s + (x.baselineRaw || 0), 0);
  const globalTotalRate = Object.values(categoryTotals).reduce((s, v) => s + v.totalRate, 0) || 1;
  const categoryShare = ((totalRate / globalTotalRate) * 100).toFixed(1);

  // Top rivalry (top 2 sites by rate)
  const defaultSorted = useMemo(() => [...sites].sort((a, b) => b.rate - a.rate), [sites]);
  const [siteA, siteB] = defaultSorted;
  const maxRate = defaultSorted[0]?.rate ?? 1;

  // Sorted sites based on user selection
  const displaySites = useMemo(() => {
    const copy = [...sites];
    if (sortBy === 'rate') return copy.sort((a, b) => b.rate - a.rate);
    if (sortBy === 'rank') return copy.sort((a, b) => a.rank - b.rank);
    if (sortBy === 'baseline') return copy.sort((a, b) => (b.baselineRaw || 0) - (a.baselineRaw || 0));
    if (sortBy === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
  }, [sites, sortBy]);

  // Generate pairwise rivalry matchups for this category
  const categoryRivalries = useMemo(() => {
    const pairs: { a: SiteConfig; b: SiteConfig; slug: string }[] = [];
    for (let i = 0; i < defaultSorted.length; i++) {
      for (let j = i + 1; j < defaultSorted.length; j++) {
        if (pairs.length >= 6) break;
        pairs.push({
          a: defaultSorted[i],
          b: defaultSorted[j],
          slug: `${defaultSorted[i].id}-vs-${defaultSorted[j].id}`,
        });
      }
      if (pairs.length >= 6) break;
    }
    return pairs;
  }, [defaultSorted]);

  let monthlyVolumeFormatted = '';
  if (totalMonthlyRaw >= 1_000_000_000) {
    monthlyVolumeFormatted = `${(totalMonthlyRaw / 1_000_000_000).toFixed(1)}B / mo`;
  } else if (totalMonthlyRaw >= 1_000_000) {
    monthlyVolumeFormatted = `${(totalMonthlyRaw / 1_000_000).toFixed(0)}M / mo`;
  } else {
    monthlyVolumeFormatted = `${(totalRate * 2600).toLocaleString()} / mo`;
  }

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans flex flex-col">
      <NavHeader />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/category" className="hover:text-white transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">{label}</span>
        </nav>

        {/* Page hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-bold tracking-widest text-[#82c8e5] uppercase bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-2.5 py-0.5 rounded-md">
              Industry Sector Breakdown
            </span>
            <span className="text-xs text-[#6d8196]">
              {categoryShare}% of global traffic
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
            {label} Websites Traffic Rankings
          </h1>
          <p className="text-[#8899aa] text-sm leading-relaxed max-w-2xl">
            {sites.length} leading platforms tracked in the {label} industry. Together they generate{' '}
            <span className="text-white font-semibold">{totalRate.toLocaleString()} visits/sec</span>{' '}
            (~{monthlyVolumeFormatted}) worldwide.
          </p>
        </div>

        {/* Category switcher pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {allCategories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                c.id === slug
                  ? 'bg-[#82c8e5] text-black font-bold shadow-md'
                  : 'bg-white/[0.03] text-[#8899aa] hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Platforms Tracked', value: sites.length.toString() },
            { label: 'Visits / sec', value: totalRate.toLocaleString() },
            { label: 'Monthly Volume', value: monthlyVolumeFormatted },
            { label: 'Category Leader', value: defaultSorted[0]?.name ?? 'N/A' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-center"
            >
              <div className="text-lg sm:text-xl font-extrabold text-white truncate">{stat.value}</div>
              <div className="text-[11px] text-[#6d8196] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top Rivalry Spotlight Card */}
        {siteA && siteB && (
          <div className="mb-10 p-5 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.02] via-[#82c8e5]/[0.03] to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-[#82c8e5] uppercase tracking-widest">
                Top Category Rivalry
              </div>
              <span className="text-[10px] text-[#6d8196]">Rank #1 vs Rank #2</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <FaviconImg url={siteA.url} logo={siteA.logo} color={siteA.color} />
                <div>
                  <div className="font-bold text-white text-sm">{siteA.name}</div>
                  <div className="text-xs text-[#6d8196]">{siteA.baseline}</div>
                </div>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="text-sm font-black text-[#6d8196]">VS</span>
                <Link
                  href={`/compare/${siteA.id}-vs-${siteB.id}`}
                  className="text-[11px] font-bold text-[#82c8e5] hover:underline mt-1 whitespace-nowrap"
                >
                  Full Battle →
                </Link>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-[140px] justify-end">
                <div className="text-right">
                  <div className="font-bold text-white text-sm">{siteB.name}</div>
                  <div className="text-xs text-[#6d8196]">{siteB.baseline}</div>
                </div>
                <FaviconImg url={siteB.url} logo={siteB.logo} color={siteB.color} />
              </div>
            </div>
          </div>
        )}

        {/* Traffic Share & Sort Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Market Share by Platform</h2>
            <p className="text-xs text-[#6d8196]">Real-time visitor velocity indexed to category leader</p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start sm:self-auto">
            <span className="text-[10px] text-[#6d8196] px-2 font-medium">Sort:</span>
            {[
              { id: 'rate', label: 'Rate' },
              { id: 'rank', label: 'Global Rank' },
              { id: 'baseline', label: 'Monthly' },
              { id: 'name', label: 'A-Z' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === s.id
                    ? 'bg-white/10 text-white'
                    : 'text-[#8899aa] hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Traffic Bar Chart List */}
        <div className="flex flex-col gap-2.5 mb-12">
          {displaySites.map((site, idx) => {
            const barWidth = Math.max(3, (site.rate / maxRate) * 100);
            const shareOfCategory = totalRate > 0 ? ((site.rate / totalRate) * 100).toFixed(1) : '0.0';

            return (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="group flex items-center gap-3.5 p-3 rounded-xl border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/15 transition-all"
              >
                {/* Index Number */}
                <span className="text-xs font-bold text-[#6d8196] tabular-nums w-5 text-right flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Favicon */}
                <FaviconImg url={site.url} logo={site.logo} color={site.color} />

                {/* Name + Relative Traffic Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-[#82c8e5] transition-colors truncate">
                        {site.name}
                      </span>
                      <span className="text-[10px] text-[#6d8196] font-mono">
                        Rank #{site.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#6d8196] hidden sm:inline">
                        {shareOfCategory}% of sector
                      </span>
                      <span className="font-mono font-bold text-white">
                        {site.baseline}
                      </span>
                    </div>
                  </div>

                  {/* Relative Velocity Bar */}
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: site.color || '#82c8e5',
                      }}
                    />
                  </div>
                </div>

                {/* Live rate counter */}
                <div className="text-right w-24 flex-shrink-0 hidden sm:block">
                  <div className="text-xs font-mono font-semibold text-white">
                    ~{site.rate.toLocaleString()} / s
                  </div>
                  <div className="text-[10px]">
                    <LiveRate rate={site.rate} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sector Head-to-Head Rivalry Grid */}
        {categoryRivalries.length > 0 && (
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.015]">
            <h2 className="text-base font-bold text-white mb-1">
              {label} Head-to-Head Comparisons
            </h2>
            <p className="text-xs text-[#6d8196] mb-5">
              Direct traffic battles and market share comparisons in this category
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryRivalries.map((r) => (
                <Link
                  key={r.slug}
                  href={`/compare/${r.slug}`}
                  className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <FaviconImg url={r.a.url} logo={r.a.logo} color={r.a.color} />
                    <span className="text-xs font-bold text-white group-hover:text-[#82c8e5] transition-colors">
                      {r.a.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-black text-[#6d8196] uppercase px-1">
                    VS
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-[#82c8e5] transition-colors">
                      {r.b.name}
                    </span>
                    <FaviconImg url={r.b.url} logo={r.b.logo} color={r.b.color} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
