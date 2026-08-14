'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavHeader from '../../components/NavHeader';
import { SiteConfig, CATEGORIES } from '../../data/sites';

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

const CATEGORY_ICONS: Record<string, string> = {
  search: 'Search',
  social: 'Social',
  ai: 'AI',
  reference: 'Ref',
  ecommerce: 'Shop',
  entertainment: 'Ent',
  news: 'News',
  finance: 'Fin',
  dev: 'Dev',
};

export default function CategoryPageClient({ slug, label, sites, allCategories, categoryTotals }: Props) {
  // Sort sites by rate (visits/sec) descending for bar chart
  const sortedSites = [...sites].sort((a, b) => b.rate - a.rate);
  const maxRate = sortedSites[0]?.rate ?? 1;

  const totalRate = sites.reduce((s, x) => s + x.rate, 0);
  const globalTotalRate = Object.values(categoryTotals).reduce((s, v) => s + v.totalRate, 0) || 1;
  const categoryShare = ((totalRate / globalTotalRate) * 100).toFixed(1);

  // Top rivalry (top 2 sites)
  const [siteA, siteB] = sortedSites;

  const icon = CATEGORY_ICONS[slug] ?? slug;

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      <div className="mesh-gradient fixed inset-0 pointer-events-none z-0" />
      <NavHeader />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white font-semibold">{label}</span>
        </nav>

        {/* Page hero */}
        <div className="mb-10">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
            {label} Rankings
          </h1>
          <p className="text-[#6d8196] text-base leading-relaxed max-w-xl">
            {sites.length} platforms tracked in the {label} category.
            Combined, they receive{' '}
            <span className="text-white font-semibold">{totalRate.toLocaleString()} visits/sec</span>{' '}
            globally - <span className="text-[#82c8e5] font-semibold">{categoryShare}%</span> of all
            tracked internet traffic.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Sites tracked', value: sites.length.toString() },
            { label: 'Visits / sec', value: totalRate.toLocaleString() },
            { label: 'Traffic share', value: `${categoryShare}%` },
            { label: '#1 site', value: sortedSites[0]?.name ?? 'N/A' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-center"
            >
              <div className="text-lg sm:text-xl font-extrabold text-white">{stat.value}</div>
              <div className="text-[11px] text-[#6d8196] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top rivalry card */}
        {siteA && siteB && (
          <div className="mb-10 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015]">
            <div className="text-xs font-bold text-[#82c8e5] uppercase tracking-widest mb-4">
              Top Category Rivalry
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <FaviconImg url={siteA.url} logo={siteA.logo} color={siteA.color} />
                <div>
                  <div className="font-bold text-white text-sm">{siteA.name}</div>
                  <div className="text-xs text-[#6d8196]">{siteA.baseline}</div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-[#6d8196]">VS</span>
                <Link
                  href={`/compare/${siteA.id}-vs-${siteB.id}`}
                  className="text-[10px] font-bold text-[#82c8e5] hover:underline mt-1"
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

        {/* Traffic bar chart */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-5">Traffic Share by Site</h2>
          <div className="flex flex-col gap-3">
            {sortedSites.map((site, idx) => {
              const barWidth = (site.rate / maxRate) * 100;
              return (
                <Link
                  key={site.id}
                  href={`/sites/${site.id}`}
                  className="group flex items-center gap-3 hover:bg-white/[0.03] p-2 rounded-xl transition-colors -mx-2"
                >
                  {/* Rank */}
                  <span className="text-[11px] font-bold text-[#6d8196] tabular-nums w-5 text-right flex-shrink-0">
                    {idx + 1}
                  </span>

                  {/* Favicon */}
                  <FaviconImg url={site.url} logo={site.logo} color={site.color} />

                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-white group-hover:text-[#82c8e5] transition-colors truncate">
                        {site.name}
                      </span>
                      <span className="text-xs text-[#6d8196] flex-shrink-0 ml-2">
                        {site.rate.toLocaleString()}/s
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: site.color,
                          boxShadow: `0 0 8px ${site.glow}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Live counter */}
                  <div className="flex-shrink-0 text-xs text-right hidden sm:block w-24">
                    <div className="text-[10px] text-[#6d8196]">since load</div>
                    <LiveRate rate={site.rate} />
                  </div>

                  {/* Global rank */}
                  <span className="flex-shrink-0 text-[11px] font-bold text-[#6d8196] bg-white/5 border border-white/[0.06] px-2 py-0.5 rounded-md tabular-nums">
                    #{site.rank}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Other category links */}
        <div className="mt-12">
          <h3 className="text-sm font-bold text-[#6d8196] uppercase tracking-widest mb-4">
            Explore Other Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {allCategories
              .filter((c) => c.id !== 'all' && c.id !== slug)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] text-xs font-semibold text-[#6d8196] hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all"
                >
                  {cat.label}
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
