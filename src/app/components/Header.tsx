'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ElapsedTimer from './ui/ElapsedTimer';

interface HeaderProps {
  pageLoadTime: number;
  onAnalyzeDomain?: (domain: string) => void;
}

/**
 * The top hero section: value proposition, instant domain analyzer,
 * quick comparison chips, trust indicators, and session timer.
 */
export default function Header({ pageLoadTime, onAnalyzeDomain }: HeaderProps) {
  const [domainInput, setDomainInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    onAnalyzeDomain?.(domainInput.trim());
  };

  const quickComparisons = [
    { label: 'ChatGPT vs Claude', href: '/compare/chatgpt-vs-claude' },
    { label: 'YouTube vs TikTok', href: '/compare/youtube-vs-tiktok' },
    { label: 'Google vs Bing', href: '/compare/google-vs-bing' },
    { label: 'Reddit vs Quora', href: '/compare/reddit-vs-quora' },
  ];

  return (
    <header className="relative z-10 flex flex-col items-center w-full max-w-4xl text-center pt-8 pb-4 px-4">
      {/* Category Eyebrow Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#82c8e5]/20 bg-[#82c8e5]/[0.06] text-[#82c8e5] text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#82c8e5] animate-pulse" />
        <span>The Transparent Real-Time Web Traffic Index</span>
      </div>

      {/* Main Headline */}
      <h1 className="m-0 text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
        Real-Time Traffic Velocity and <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-white via-[#82c8e5] to-[#38bdf8] bg-clip-text text-transparent">
          Global Domain Intelligence
        </span>
      </h1>

      {/* Subtitle */}
      <p className="subtitle text-[#8da0b5] text-sm sm:text-base max-w-2xl font-normal m-0 mb-6 leading-relaxed">
        Track live visitor velocities, compare digital rivals, and monitor global web momentum across top domains.
      </p>

      {/* Hero Domain Analyzer Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mb-4">
        <div className="relative flex items-center rounded-2xl border border-white/15 bg-white/[0.04] p-1.5 shadow-2xl backdrop-blur-md transition-all focus-within:border-[#82c8e5]/60 focus-within:ring-2 focus-within:ring-[#82c8e5]/20 hover:border-white/25">
          <div className="pl-3 pr-2 text-[#6d8196]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="Enter any domain (e.g. stripe.com, vercel.com, chatgpt.com)..."
            className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-[#5a6f84] focus:outline-none"
            aria-label="Enter website domain to analyze"
          />
          <button
            type="submit"
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#82c8e5] hover:bg-[#a1daf1] text-[#02020a] font-bold text-xs transition-all shadow-md active:scale-95"
          >
            Analyze
          </button>
        </div>
      </form>

      {/* Quick Comparison Chips */}
      <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-[#6d8196] mb-6">
        <span className="font-semibold text-[#8da0b5]">Popular Comparisons:</span>
        {quickComparisons.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/25 text-[#8da0b5] hover:text-white transition-all text-[11px]"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Trust & Telemetry Strip */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap text-[11px] text-[#6d8196] pt-2 border-t border-white/[0.06] w-full max-w-2xl">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-medium">PTI v2.0 Live</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-slate-300 font-medium">Cloudflare Radar Telemetry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#82c8e5]" />
          <span className="text-slate-300 font-medium">650+ Pre-Rendered Benchmarks</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
          <span className="text-slate-400">Session:</span>
          <span className="text-[#82c8e5] font-mono font-semibold">
            <ElapsedTimer pageLoadTime={pageLoadTime} />
          </span>
        </div>
      </div>
    </header>
  );
}
