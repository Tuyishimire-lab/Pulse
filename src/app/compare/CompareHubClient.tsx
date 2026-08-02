'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SiteConfig, CATEGORIES } from '../data/sites';
import { ComparePair } from './data/pairs';
import NavHeader from '../components/NavHeader';

interface Props {
  sites: SiteConfig[];
  pairs: ComparePair[];
}

function FaviconImg({ url, logo, color, size = 32 }: { url: string; logo: string; color: string; size?: number }) {
  const [err, setErr] = useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  if (err) {
    return (
      <span
        className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: color + '33',
          color: color === '#ffffff' ? '#111' : color,
          fontSize: size * 0.45,
        }}
      >
        {logo}
      </span>
    );
  }
  return (
    <Image
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt={`${logo} logo`}
      width={size}
      height={size}
      onError={() => setErr(true)}
      className="rounded-full object-contain p-0.5 bg-white/10 flex-shrink-0"
      unoptimized
    />
  );
}

export default function CompareHubClient({ sites, pairs }: Props) {
  const router = useRouter();

  // Custom VS Picker state
  const [siteAId, setSiteAId] = useState<string>('youtube');
  const [siteBId, setSiteBId] = useState<string>('tiktok');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const siteA = useMemo(() => sites.find((s) => s.id === siteAId) ?? sites[0], [sites, siteAId]);
  const siteB = useMemo(() => sites.find((s) => s.id === siteBId) ?? sites[1], [sites, siteBId]);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (siteAId === siteBId) return;
    router.push(`/compare/${siteAId}-vs-${siteBId}`);
  };

  // Filtered comparison pairs
  const filteredPairs = useMemo(() => {
    return pairs.filter((p) => {
      const sA = sites.find((s) => s.id === p.siteAId);
      const sB = sites.find((s) => s.id === p.siteBId);
      if (!sA || !sB) return false;

      const matchesSearch =
        p.slug.includes(searchFilter.toLowerCase()) ||
        sA.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        sB.name.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      return sA.category === selectedCategory || sB.category === selectedCategory;
    });
  }, [pairs, sites, searchFilter, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      {/* Background Gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 15% 20%, rgba(0,71,171,0.2) 0%, transparent 50%),
                       radial-gradient(circle at 85% 75%, rgba(130,200,229,0.12) 0%, transparent 50%)`,
        }}
      />

      <NavHeader />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Compare</span>
          <span>/</span>
          <span className="text-white font-medium">Traffic Engine</span>
        </nav>

        {/* Horizontal comparison pairs pill strip */}
        <div className="mb-8 -mx-4 sm:-mx-6">
          <div
            className="flex gap-2 overflow-x-auto px-4 sm:px-6 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {pairs.map((p) => {
              const sA = sites.find((s) => s.id === p.siteAId);
              const sB = sites.find((s) => s.id === p.siteBId);
              return (
                <Link
                  key={p.slug}
                  href={`/compare/${p.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/[0.08] text-[#6d8196] hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all whitespace-nowrap"
                >
                  <span>{sA?.name ?? p.siteAId} vs {sB?.name ?? p.siteBId}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Left-Aligned Hero Header (Matching Top Sites design system) */}
        <header className="mb-10">
          {/* Top meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className="text-xs font-black tracking-widest px-2.5 py-1 rounded-lg border"
              style={{ color: '#82c8e5', borderColor: '#82c8e5', backgroundColor: 'rgba(130,200,229,0.08)' }}
            >
              VS
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              ● Live Comparison Engine
            </span>
            <span className="text-xs text-[#6d8196]">40 Editorial Pairs · 103 Tracked Platforms</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-5">
            <span className="text-[#94a3b8] font-semibold">Compare Any Two Websites in</span>{' '}
            <span className="bg-gradient-to-r from-white via-white to-[#82c8e5] bg-clip-text text-transparent">
              Real-Time
            </span>
            <span className="text-[#6d8196] font-semibold text-xl"> (2026)</span>
          </h1>

          {/* Description Blockquote Accent */}
          <div className="flex gap-3 items-stretch">
            <div className="w-0.5 rounded-full bg-gradient-to-b from-[#82c8e5]/60 to-transparent flex-shrink-0" />
            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
              Select any two platforms from our top 100 directory to compare monthly traffic, global rank, and visitor velocity side-by-side.
            </p>
          </div>
        </header>

        {/* ── Interactive Custom VS Picker Card ──────────────────────────────── */}
        <section className="mb-12 rounded-2xl border border-[#82c8e5]/20 bg-[#82c8e5]/[0.04] p-6">
          <h2 className="text-base font-bold text-[#82c8e5] mb-5 flex items-center gap-2">
            Custom Platform Comparison
          </h2>

          <form onSubmit={handleCompare} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
              
              {/* Site A Selector */}
              <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <label className="text-xs font-semibold text-[#82c8e5] uppercase tracking-wider">
                  First Website (Site A)
                </label>
                <div className="flex items-center gap-3">
                  <FaviconImg url={siteA.url} logo={siteA.logo} color={siteA.color} size={32} />
                  <div className="flex-1 min-w-0">
                    <select
                      value={siteAId}
                      onChange={(e) => setSiteAId(e.target.value)}
                      className="w-full bg-[#070b14] text-white font-semibold text-sm border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#82c8e5] cursor-pointer"
                    >
                      {sites.map((s) => (
                        <option key={s.id} value={s.id} disabled={s.id === siteBId}>
                          #{s.rank} {s.name} ({s.baseline})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6d8196] mt-1 px-1">
                  <span>Category: <strong className="text-white capitalize">{siteA.category}</strong></span>
                  <span>Rank: <strong className="text-white">#{siteA.rank} Global</strong></span>
                </div>
              </div>

              {/* VS Badge */}
              <div className="flex items-center justify-center">
                <span className="w-10 h-10 rounded-full border border-[#82c8e5]/30 bg-[#82c8e5]/10 text-[#82c8e5] font-black text-xs flex items-center justify-center shadow-md">
                  VS
                </span>
              </div>

              {/* Site B Selector */}
              <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <label className="text-xs font-semibold text-[#82c8e5] uppercase tracking-wider">
                  Second Website (Site B)
                </label>
                <div className="flex items-center gap-3">
                  <FaviconImg url={siteB.url} logo={siteB.logo} color={siteB.color} size={32} />
                  <div className="flex-1 min-w-0">
                    <select
                      value={siteBId}
                      onChange={(e) => setSiteBId(e.target.value)}
                      className="w-full bg-[#070b14] text-white font-semibold text-sm border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#82c8e5] cursor-pointer"
                    >
                      {sites.map((s) => (
                        <option key={s.id} value={s.id} disabled={s.id === siteAId}>
                          #{s.rank} {s.name} ({s.baseline})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6d8196] mt-1 px-1">
                  <span>Category: <strong className="text-white capitalize">{siteB.category}</strong></span>
                  <span>Rank: <strong className="text-white">#{siteB.rank} Global</strong></span>
                </div>
              </div>
            </div>

            {/* Compare Button CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-[#6d8196]">
                Comparing <span className="text-white font-semibold">{siteA.name}</span> vs{' '}
                <span className="text-white font-semibold">{siteB.name}</span>
              </div>

              <button
                type="submit"
                disabled={siteAId === siteBId}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-[#82c8e5] hover:bg-[#9dd5ec] text-[#02020a] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Compare Platforms Now</span>
                <span>→</span>
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6d8196] font-semibold mr-1">Popular Comparisons:</span>
            {[
              { label: 'YouTube vs TikTok', slug: 'youtube-vs-tiktok' },
              { label: 'Google vs ChatGPT', slug: 'google-vs-chatgpt' },
              { label: 'Netflix vs Disney+', slug: 'netflix-vs-disney' },
              { label: 'PayPal vs Stripe', slug: 'paypal-vs-stripe' },
              { label: 'GitHub vs Stack Overflow', slug: 'github-vs-stackoverflow' },
            ].map((preset) => (
              <Link
                key={preset.slug}
                href={`/compare/${preset.slug}`}
                className="text-xs px-2.5 py-1 rounded-full border border-white/[0.08] bg-[#0d121f] text-[#94a3b8] hover:text-white hover:border-[#82c8e5] transition-all"
              >
                {preset.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Editorial Comparisons Section ───────────────────────────── */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Featured Comparisons ({filteredPairs.length})
              </h2>
              <p className="text-xs text-[#6d8196] mt-0.5">
                Curated traffic comparisons with detailed verdicts and analysis.
              </p>
            </div>

            {/* Search Filter input */}
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter comparisons..."
              className="px-3.5 py-2 text-xs rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-[#6d8196] focus:outline-none focus:border-[#82c8e5] w-full sm:w-64"
            />
          </div>

          {/* Category Tabs (Solid color active button) */}
          <div
            className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-[#0047ab] border-[#0047ab] text-white shadow-md'
                    : 'bg-white/[0.02] border-white/[0.08] text-[#6d8196] hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Compare Cards */}
          {filteredPairs.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#6d8196] border border-white/[0.06] rounded-2xl bg-white/[0.02]">
              No editorial comparisons found matching "{searchFilter}". Use the Custom VS Picker above to compare any two platforms!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPairs.map((pair) => {
                const sA = sites.find((s) => s.id === pair.siteAId);
                const sB = sites.find((s) => s.id === pair.siteBId);
                if (!sA || !sB) return null;

                return (
                  <Link
                    key={pair.slug}
                    href={`/compare/${pair.slug}`}
                    className="group p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#82c8e5]/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header with icons */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FaviconImg url={sA.url} logo={sA.logo} color={sA.color} size={26} />
                          <span className="text-sm font-bold text-white group-hover:text-[#82c8e5] transition-colors">
                            {sA.name}
                          </span>
                          <span className="text-xs text-[#6d8196] font-mono">vs</span>
                          <FaviconImg url={sB.url} logo={sB.logo} color={sB.color} size={26} />
                          <span className="text-sm font-bold text-white group-hover:text-[#82c8e5] transition-colors">
                            {sB.name}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#82c8e5] bg-white/[0.06] group-hover:bg-[#82c8e5] group-hover:text-[#02020a] px-2 py-0.5 rounded-full border border-white/10 transition-all">
                          Compare →
                        </span>
                      </div>

                      {/* Context / Verdict preview */}
                      <p className="text-xs text-[#94a3b8] line-clamp-2 leading-relaxed mb-4">
                        {pair.verdict}
                      </p>
                    </div>

                    {/* Stats footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[11px] text-[#6d8196]">
                      <span>{sA.name}: <strong className="text-white">{sA.baseline}</strong></span>
                      <span>{sB.name}: <strong className="text-white">{sB.baseline}</strong></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
