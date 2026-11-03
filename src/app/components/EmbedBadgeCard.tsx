'use client';

import React, { useState } from 'react';
import type { SiteConfig } from '../data/sites';

interface EmbedBadgeCardProps {
  site: SiteConfig;
  liveRank?: number | null;
  liveBaseline?: string | null;
}

export default function EmbedBadgeCard({
  site,
  liveRank,
  liveBaseline,
}: EmbedBadgeCardProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [format, setFormat] = useState<'markdown' | 'html'>('markdown');
  const [copied, setCopied] = useState(false);

  const effectiveRank = liveRank ?? site.rank;
  const effectiveBaseline = liveBaseline ?? site.baseline;

  const badgeUrl =
    theme === 'light'
      ? `https://www.pulstraffic.com/api/badge/${site.id}?theme=light`
      : `https://www.pulstraffic.com/api/badge/${site.id}`;
  const targetUrl = `https://www.pulstraffic.com/sites/${site.id}`;
  const altText = `${site.name} Global Traffic Rank #${effectiveRank} (${effectiveBaseline}/mo) on Pulse`;

  const markdownSnippet = `[![${altText}](${badgeUrl})](${targetUrl})`;
  const htmlSnippet = `<a href="${targetUrl}" target="_blank" rel="noopener" title="${site.name} Live Web Traffic Analytics on Pulse"><img src="${badgeUrl}" alt="${altText}" height="24" /></a>`;

  const activeSnippet = format === 'markdown' ? markdownSnippet : htmlSnippet;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(activeSnippet);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = activeSnippet;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback no-op if clipboard permissions blocked
    }
  };

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 mt-6 text-left"
      style={{ boxShadow: '0 4px 20px -8px rgba(0,0,0,0.5)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-[#82c8e5] uppercase">
            Embed Live {site.name} Rank Badge
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/45">
          Auto-Updating SVG · GitHub README &amp; Docs Ready
        </span>
      </div>

      <p className="text-xs text-white/65 mb-4 leading-relaxed">
        Showcase {site.name}&apos;s live Global Rank #{effectiveRank} ({effectiveBaseline}/mo) on your GitHub README, documentation, or press kit. The SVG updates automatically every hour from Pulse telemetry.
      </p>

      {/* Preview + Controls Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-black/40 border border-white/[0.07] mb-3.5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196]">
            Live Preview:
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/badge/${site.id}${theme === 'light' ? '?theme=light' : ''}`}
            alt={altText}
            height={24}
            className="h-6 w-auto rounded shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Theme Toggle */}
          <div className="inline-flex rounded-lg bg-white/[0.04] p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-[#82c8e5]/20 text-[#82c8e5]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Light
            </button>
          </div>

          {/* Format Toggle */}
          <div className="inline-flex rounded-lg bg-white/[0.04] p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setFormat('markdown')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                format === 'markdown'
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setFormat('html')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                format === 'html'
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              HTML
            </button>
          </div>
        </div>
      </div>

      {/* Code Snippet + 1-Click Copy */}
      <div className="relative flex items-center gap-2">
        <pre className="flex-1 m-0 p-3 rounded-xl bg-[#05050c] border border-white/10 text-[11px] font-mono text-[#82c8e5] overflow-x-auto whitespace-nowrap scrollbar-hide">
          <code>{activeSnippet}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex-shrink-0 px-3.5 py-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            copied
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-[#82c8e5]/15 border-[#82c8e5]/30 text-[#82c8e5] hover:bg-[#82c8e5]/25'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy {format === 'markdown' ? 'MD' : 'HTML'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
