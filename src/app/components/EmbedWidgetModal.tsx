'use client';

import React, { useState } from 'react';
import { SiteConfig } from '../data/sites';

interface EmbedWidgetModalProps {
  site: SiteConfig;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmbedWidgetModal({ site, isOpen, onClose }: EmbedWidgetModalProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [format, setFormat] = useState<'card' | 'badge'>('card');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.pulstraffic.com';
  const iframeSrc = `${baseUrl}/embed/${site.id}?theme=${theme}&compact=${format === 'badge'}`;

  const iframeSnippet = format === 'card'
    ? `<iframe src="${iframeSrc}" width="360" height="200" frameborder="0" scrolling="no" style="border-radius: 12px; overflow: hidden; border: none;" title="${site.name} Live Traffic by Pulse"></iframe>`
    : `<iframe src="${iframeSrc}" width="280" height="52" frameborder="0" scrolling="no" style="border-radius: 8px; overflow: hidden; border: none;" title="${site.name} Traffic Badge"></iframe>`;

  const markdownSnippet = `[![${site.name} Web Traffic on Pulse](${baseUrl}/api/badge/${site.id})](${baseUrl}/sites/${site.id})`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="text-blue-400">⚡</span>
              <span>Embed {site.name} Traffic Widget</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add live traffic data and verified badges to your website, blog, or documentation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Widget Style
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setFormat('card')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  format === 'card'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Card View
              </button>
              <button
                type="button"
                onClick={() => setFormat('badge')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  format === 'badge'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Compact Badge
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dark Glass
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="mb-5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
            Live Preview
          </label>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-center min-h-[120px]">
            <iframe
              src={iframeSrc}
              width={format === 'card' ? '360' : '280'}
              height={format === 'card' ? '180' : '52'}
              style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}
              title="Widget Preview"
            />
          </div>
        </div>

        {/* Embed Snippet Box */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              HTML Embed Code
            </span>
            <button
              onClick={() => handleCopy(iframeSnippet)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              {copied ? '✓ Copied to clipboard!' : 'Copy Code'}
            </button>
          </div>
          <div className="relative">
            <pre className="p-3 bg-black/60 rounded-lg text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap break-all select-all">
              {iframeSnippet}
            </pre>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span>✨ Automatic real-time updates & no API key required</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
