'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteConfig } from '../../data/sites';
import { CountryData } from '../data/countries';
import NavHeader from '../../components/NavHeader';

interface Props {
  countryData: CountryData;
  sites: SiteConfig[];
  allCountries: CountryData[];
  dataSource?: string;
}

function FaviconImg({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [err, setErr] = useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  if (err) {
    return (
      <span
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: color + '33', color: color === '#ffffff' ? '#111' : color }}
      >
        {logo}
      </span>
    );
  }
  return (
    <Image
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt={`${logo} favicon`}
      width={32}
      height={32}
      onError={() => setErr(true)}
      className="w-8 h-8 rounded-full object-contain p-0.5 bg-white/10"
      unoptimized
    />
  );
}

function LiveCounter({ rate }: { rate: number }) {
  const [count, setCount] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCount(Math.floor(rate * elapsed));
    };
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [rate]);

  return (
    <span className="font-mono text-sm font-semibold text-emerald-400 tabular-nums">
      +{count.toLocaleString()}
    </span>
  );
}

const FAQ_ITEMS = (country: CountryData, sites: SiteConfig[]) => [
  {
    q: `What is the most visited website in ${country.name}?`,
    a: `${sites[0]?.name ?? 'Google'} is the most visited website in ${country.name}, receiving approximately ${sites[0]?.baseline ?? 'billions of'} visits per month. ${country.localNote}`,
  },
  {
    q: `How many people use the internet in ${country.name}?`,
    a: `${country.name} has approximately ${country.internetUsers} internet users, representing a ${country.internetPenetration} internet penetration rate. ${country.insight.split('.')[1]?.trim() ?? ''}`,
  },
  {
    q: `Which social media platform is most popular in ${country.name}?`,
    a: `Based on traffic data, ${sites.filter((s) => s.category === 'social')[0]?.name ?? 'Facebook'} is the leading social media platform in ${country.name}. ${country.localNote}`,
  },
];

function cfCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const offset = 127397; // Unicode regional indicator offset
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join('');
}

function CountryPicker({ current, allCountries }: { current: CountryData; allCountries: CountryData[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? allCountries.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.flag && c.flag.includes(query))
      )
    : allCountries;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    }
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">Rankings by Country</h2>
        <span className="text-xs text-[#6d8196]">{allCountries.length} countries</span>
      </div>

      <div ref={ref} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-[#82c8e5]/40 transition-all text-left group"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-xl">{cfCodeToFlag(current.cfCode)}</span>
            <span className="text-sm font-semibold text-white">
              {current.name}
              <span className="ml-2 text-xs font-normal text-[#6d8196]">- currently viewing</span>
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#82c8e5] bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Switch Country
            </span>
            <svg
              className={`w-4 h-4 text-[#6d8196] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {/* Dropdown panel - opens UPWARD so it never overlaps the footer */}
        {open && (
          <div
            className="absolute z-50 w-full rounded-2xl border border-white/10 bg-[#0a0f1a] shadow-2xl shadow-black/60 overflow-hidden"
            style={{
              backdropFilter: 'blur(20px)',
              bottom: 'calc(100% + 8px)',
            }}
            role="listbox"
          >
            {/* Search */}
            <div className="p-3 border-b border-white/[0.06]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6d8196]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search countries…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-sm bg-white/[0.04] border border-white/[0.06] rounded-lg text-white placeholder-[#6d8196] focus:outline-none focus:border-[#82c8e5]/50 focus:bg-white/[0.06] transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6d8196] hover:text-white"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Results - custom dark scrollbar */}
            <div className="country-picker-scroll overflow-y-auto" style={{ maxHeight: '280px' }}>
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-[#6d8196]">No countries match &ldquo;{query}&rdquo;</div>
              ) : (
                <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                  {filtered.map((c) => {
                    const isCurrent = c.slug === current.slug;
                    return (
                      <Link
                        key={c.slug}
                        href={`/top-sites/${c.slug}`}
                        onClick={() => { setOpen(false); setQuery(''); }}
                        role="option"
                        aria-selected={isCurrent}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                          isCurrent
                            ? 'bg-[#82c8e5]/10 border border-[#82c8e5]/20 text-[#82c8e5] font-semibold'
                            : 'text-[#94a3b8] hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{cfCodeToFlag(c.cfCode)}</span>
                        <span className="truncate">{c.name}</span>
                        {isCurrent && (
                          <svg className="w-3.5 h-3.5 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer count */}
            <div className="px-4 py-2 border-t border-white/[0.04] text-[10px] text-[#6d8196] flex items-center justify-between">
              <span>{filtered.length} of {allCountries.length} countries</span>
              <span>↑↓ scroll · Esc to close</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CountryPageClient({ countryData, sites, allCountries, dataSource }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = FAQ_ITEMS(countryData, sites);

  const sourceLabel: Record<string, { label: string; color: string }> = {
    'supabase-cache': { label: '📡 Radar Data (cached)', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' },
    'live-radar':    { label: '🛰️ Live Radar Data', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' },
    'regional-profile': { label: '🌍 PTI Regional Profile', color: 'text-[#82c8e5] border-[#82c8e5]/20 bg-[#82c8e5]/5' },
    'smart-filter':  { label: '🔍 Global Filtered Estimate', color: 'text-amber-400 border-amber-400/20 bg-amber-400/5' },
    'global-fallback': { label: '📊 Global Estimate', color: 'text-[#6d8196] border-white/10 bg-white/[0.02]' },
  };
  const badge = dataSource && dataSource !== 'pinned' ? sourceLabel[dataSource] : null;


  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 15% 20%, rgba(0,71,171,0.2) 0%, transparent 50%),
                       radial-gradient(circle at 85% 75%, rgba(130,200,229,0.12) 0%, transparent 50%)`,
        }}
      />

      <NavHeader />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Top Sites</span>
          <span>/</span>
          <span className="text-white">{countryData.name}</span>
        </nav>

        {/* Horizontal country pill strip */}
        <div className="mb-8 -mx-4 sm:-mx-6">
          <div
            className="flex gap-2 overflow-x-auto px-4 sm:px-6 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              countryData,
              ...allCountries.filter((c) => c.slug !== countryData.slug)
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/top-sites/${c.slug}`}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  c.slug === countryData.slug
                    ? 'bg-[#82c8e5]/15 border-[#82c8e5]/40 text-[#82c8e5]'
                    : 'border-white/[0.08] text-[#6d8196] hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <span>{c.cfCode}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Hero */}
        <header className="mb-10">
          {/* Top meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {/* Country code badge - reliable across all OS/browsers */}
            <span
              className="text-xs font-black tracking-widest px-2.5 py-1 rounded-lg border"
              style={{ color: '#82c8e5', borderColor: '#82c8e5', backgroundColor: 'rgba(130,200,229,0.08)' }}
            >
              {countryData.cfCode}
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              ● Live Rankings
            </span>
            {badge && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            )}
            <span className="text-xs text-[#6d8196]">{countryData.internetUsers} internet users · {countryData.internetPenetration} penetration</span>
          </div>

          {/* Title - split so it wraps naturally */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-5">
            <span className="text-[#94a3b8] font-semibold">Most Visited Websites in</span>{' '}
            <span className="bg-gradient-to-r from-white via-white to-[#82c8e5] bg-clip-text text-transparent">
              {countryData.name}
            </span>
            <span className="text-[#6d8196] font-semibold text-xl"> (2026)</span>
          </h1>

          {/* Description - styled as an accent blockquote */}
          <div className="flex gap-3 items-stretch">
            <div className="w-0.5 rounded-full bg-gradient-to-b from-[#82c8e5]/60 to-transparent flex-shrink-0" />
            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
              {countryData.insight}
            </p>
          </div>
        </header>

        {/* Rankings Table */}
        <section aria-label={`Top 20 websites in ${countryData.name}`} className="mb-12">
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6d8196] uppercase tracking-wider w-10">Local</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6d8196] uppercase tracking-wider">Website</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6d8196] uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6d8196] uppercase tracking-wider hidden lg:table-cell">Global Rank</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6d8196] uppercase tracking-wider">Monthly Visits</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6d8196] uppercase tracking-wider hidden md:table-cell">Visits since you landed</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site, index) => (
                  <tr
                    key={site.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-[#6d8196] tabular-nums">{index + 1}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/sites/${site.id}`} className="flex items-center gap-3 group">
                        <FaviconImg url={site.url} logo={site.logo} color={site.color} />
                        <div>
                          <div className="font-semibold text-white group-hover:text-[#82c8e5] transition-colors text-sm">
                            {site.name}
                          </div>
                          <div className="text-xs text-[#6d8196]">
                            {site.url.replace('https://', '')}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: site.color + '22', color: site.color }}
                      >
                        {site.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                      <span className="text-xs font-mono text-[#a78bfa] tabular-nums">#{site.rank}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-white tabular-nums">
                        {site.baseline}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <LiveCounter rate={site.rate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6d8196] mt-3 text-right">
            Traffic estimates powered by the Pulse Traffic Index (PTI). Rankings reflect global usage patterns adjusted for regional behavior. <a href="/methodology" className="underline hover:text-white transition-colors">Learn how →</a>
          </p>
        </section>

        {/* Country Insight Card */}
        <section className="mb-12 rounded-2xl border border-[#82c8e5]/20 bg-[#82c8e5]/[0.04] p-6">
          <h2 className="text-base font-bold text-[#82c8e5] mb-4 flex items-center gap-2">
             Internet Overview: {countryData.name}
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-2xl font-extrabold text-white">{countryData.internetUsers}</div>
              <div className="text-xs text-[#6d8196]">Internet users</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{countryData.internetPenetration}</div>
              <div className="text-xs text-[#6d8196]">Penetration rate</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{sites.length}</div>
              <div className="text-xs text-[#6d8196]">Sites tracked</div>
            </div>
          </div>
          <p className="text-sm text-[#94a3b8] leading-relaxed">{countryData.localNote}</p>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                  aria-expanded={openFaq === i}
                  aria-controls={`country-faq-panel-${i}`}
                  id={`country-faq-btn-${i}`}
                >
                  <span className="font-semibold text-sm text-white">{faq.q}</span>
                  <span className="text-[#6d8196] text-lg flex-shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[#94a3b8] leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Other Countries - compact searchable picker */}
        <CountryPicker current={countryData} allCountries={allCountries} />

        {/* Back to main */}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#6d8196] hover:text-white transition-colors"
          >
            ← Back to Live Dashboard
          </Link>
          <span className="text-xs text-[#6d8196]">
            Updated in real-time · www.pulstraffic.com
          </span>
        </div>
      </div>
    </div>
  );
}
