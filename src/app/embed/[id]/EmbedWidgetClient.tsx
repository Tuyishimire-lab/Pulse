'use client';

import React, { useEffect, useState } from 'react';
import { SiteConfig } from '../../data/sites';

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
        className={`w-full h-full p-2 flex items-center justify-between font-sans select-none rounded-lg border transition-all ${
          isDark
            ? 'bg-[#0b0f19]/90 border-slate-800 text-white shadow-lg'
            : 'bg-white border-slate-200 text-slate-900 shadow-md'
        }`}
        style={{ minHeight: '48px' }}
      >
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 group overflow-hidden"
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0"
            style={{
              backgroundColor: site.color || '#3b82f6',
              color: '#ffffff',
            }}
          >
            {site.logo || site.name.slice(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">
              {site.name}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {site.rate.toLocaleString()} visits/s
            </span>
          </div>
        </a>

        <a
          href="https://www.pulstraffic.com?ref=badge"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold border flex-shrink-0 ${
            isDark
              ? 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
          }`}
        >
          <span className="text-blue-400 font-black">#</span>
          <span>{site.rank}</span>
          <span className="opacity-40">|</span>
          <span className="font-mono text-blue-400">PULSE</span>
        </a>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-[360px] p-4 rounded-xl font-sans select-none border transition-all ${
        isDark
          ? 'bg-[#090d16]/95 border-slate-800/80 text-white shadow-2xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md"
            style={{
              backgroundColor: site.color || '#3b82f6',
              color: '#ffffff',
            }}
          >
            {site.logo || site.name.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">{site.name}</h3>
            <span className="text-[11px] text-slate-400 capitalize">{site.category}</span>
          </div>
        </div>

        <div
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
            isDark
              ? 'bg-blue-950/40 border-blue-500/30 text-blue-400'
              : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}
        >
          Global #{site.rank}
        </div>
      </div>

      {/* Live Ticker Metric */}
      <div
        className={`p-3 rounded-lg border mb-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5"></span>
            <span>Live Web Traffic</span>
          </span>
          <span className="font-mono text-emerald-400 font-semibold">
            +{site.rate.toLocaleString()} /s
          </span>
        </div>
        <div className="text-xl font-black font-mono tracking-tight text-emerald-400">
          {(site.baselineRaw + Math.floor(tickerCount)).toLocaleString()}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Estimated total monthly volume: <span className="font-semibold text-slate-400">{site.baseline}</span>
        </div>
      </div>

      {/* Footer Branding & Attribution */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[11px]">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>View Detailed Breakdown</span>
          <span>→</span>
        </a>
        <a
          href="https://www.pulstraffic.com?ref=embed_badge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 font-mono transition-colors"
        >
          <span>Verified by</span>
          <span className="font-bold text-slate-400">PULSE</span>
        </a>
      </div>
    </div>
  );
}
