'use client';

import React, { useEffect, useState } from 'react';
import { SiteConfig } from '../../data/sites';
import FaviconImage from '../../components/ui/FaviconImage';

interface EmbedWidgetClientProps {
  site: SiteConfig;
  theme: 'dark' | 'light';
  compact: boolean;
}

export default function EmbedWidgetClient({ site, theme, compact }: EmbedWidgetClientProps) {
  const [tickerCount, setTickerCount] = useState<number>(0);

  useEffect(() => {
    // Tick at 100ms intervals based on rate
    const interval = setInterval(() => {
      setTickerCount((prev) => prev + site.rate * 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [site.rate]);

  const isDark = theme === 'dark';
  const siteUrl = `https://www.pulstraffic.com/sites/${site.id}?ref=widget_badge`;

  if (compact) {
    return (
      <div
        className={`w-full max-w-[300px] h-[52px] box-border px-3 py-1.5 flex items-center justify-between font-sans select-none rounded-lg border transition-all ${
          isDark
            ? 'bg-[#090d16] border-white/10 text-white shadow-md'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 group overflow-hidden min-w-0"
        >
          <FaviconImage
            url={site.url}
            logo={site.logo}
            color={site.color}
            size={24}
            rounded="md"
            className="rounded-md object-contain flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors leading-tight">
              {site.name}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              +{site.rate.toLocaleString()} /s
            </span>
          </div>
        </a>

        <a
          href="https://www.pulstraffic.com?ref=badge"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold border flex-shrink-0 transition-colors ${
            isDark
              ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:border-white/20'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <span className="text-blue-400 font-bold">#{site.rank}</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-blue-400 font-bold tracking-wider">PULSE</span>
        </a>
      </div>
    );
  }

  return (
    <div
      className={`w-[360px] h-[200px] box-border p-3.5 flex flex-col justify-between rounded-xl font-sans select-none border transition-all ${
        isDark
          ? 'bg-[#090d16] border-white/10 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <FaviconImage
            url={site.url}
            logo={site.logo}
            color={site.color}
            size={28}
            rounded="lg"
            className="rounded-lg object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate leading-tight">{site.name}</h3>
            <span className="text-[10px] text-slate-400 capitalize leading-tight">{site.category}</span>
          </div>
        </div>

        <div
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
            isDark
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}
        >
          #{site.rank} Global
        </div>
      </div>

      {/* Live Ticker Metric */}
      <div
        className={`px-3 py-2 rounded-lg border ${
          isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">Live Traffic</span>
          </span>
          <span className="font-mono text-emerald-400 font-semibold">
            +{site.rate.toLocaleString()} /s
          </span>
        </div>
        <div className="text-lg font-black font-mono tracking-tight text-emerald-400 tabular-nums">
          {(site.baselineRaw + Math.floor(tickerCount)).toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-500">
          Monthly Baseline: <span className="font-semibold text-slate-300">{site.baseline}</span>
        </div>
      </div>

      {/* Footer Branding & Attribution */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px]">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors group"
        >
          <span>View Breakdown</span>
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
        <a
          href="https://www.pulstraffic.com?ref=embed_badge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1.5 font-mono transition-colors"
        >
          <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Verified by</span>
          <span className="font-bold text-slate-400">PULSE</span>
        </a>
      </div>
    </div>
  );
}
