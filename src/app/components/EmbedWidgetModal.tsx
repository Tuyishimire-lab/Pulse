'use client';

import React, { useState, useEffect } from 'react';
import { SiteConfig } from '../data/sites';

interface EmbedWidgetModalProps {
  site: SiteConfig;
  alternateSite?: SiteConfig;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmbedWidgetModal({ site, alternateSite, isOpen, onClose }: EmbedWidgetModalProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [format, setFormat] = useState<'card' | 'badge'>('card');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeSite = (alternateSite && selectedSiteId === alternateSite.id) ? alternateSite : site;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.pulstraffic.com';
  const iframeSrc = `${baseUrl}/embed/${activeSite.id}?theme=${theme}&compact=${format === 'badge'}`;

  const iframeSnippet = format === 'card'
    ? `<iframe src="${iframeSrc}" width="360" height="200" frameborder="0" scrolling="no" style="border-radius: 12px; overflow: hidden; border: none; display: block;" title="${activeSite.name} Live Traffic by Pulse"></iframe>`
    : `<iframe src="${iframeSrc}" width="300" height="52" frameborder="0" scrolling="no" style="border-radius: 8px; overflow: hidden; border: none; display: block;" title="${activeSite.name} Traffic Badge"></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[800px] bg-[#0d131f] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl text-white flex flex-col max-h-[calc(100vh-1.5rem)] my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex-shrink-0 flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate leading-tight">
                Embed Live Traffic Widget
              </h2>
              <p className="text-xs text-slate-400 truncate leading-tight">
                Real-time interactive benchmarks for your site or blog.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors flex-shrink-0 ml-2"
            title="Close modal (Esc)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 2-Column Content Area (Side-by-Side on desktop to avoid vertical scrolling) */}
        <div className="flex-1 overflow-y-auto py-3.5 modal-custom-scroll">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* Left Column: Configuration & Embed Code (5 cols) */}
            <div className="md:col-span-6 space-y-3">
              {/* Site Switcher (when comparing two sites) */}
              {alternateSite && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Site Selection
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedSiteId(site.id)}
                      className={`py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        activeSite.id === site.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{site.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">#{site.rank}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSiteId(alternateSite.id)}
                      className={`py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        activeSite.id === alternateSite.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{alternateSite.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">#{alternateSite.rank}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Options: Style & Theme */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                    Style
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormat('card')}
                      className={`py-1 text-xs font-semibold rounded transition-all ${
                        format === 'card'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('badge')}
                      className={`py-1 text-xs font-semibold rounded transition-all ${
                        format === 'badge'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Badge
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-900/80 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`py-1 text-xs font-semibold rounded transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`py-1 text-xs font-semibold rounded transition-all ${
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

              {/* Embed Snippet Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    HTML Embed Code
                  </span>
                  <button
                    onClick={() => handleCopy(iframeSnippet)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 bg-black/60 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800 whitespace-pre-wrap break-all select-all leading-relaxed scrollbar-hide">
                  {iframeSnippet}
                </pre>
              </div>
            </div>

            {/* Right Column: Live Preview (6 cols) */}
            <div className="md:col-span-6 flex flex-col justify-center">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                Live Preview
              </label>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-center min-h-[215px] overflow-hidden">
                <iframe
                  src={iframeSrc}
                  width={format === 'card' ? '360' : '300'}
                  height={format === 'card' ? '200' : '52'}
                  scrolling="no"
                  style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', display: 'block', maxWidth: '100%' }}
                  title="Widget Preview"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span className="truncate">Real-time telemetry synced • Zero API keys</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm flex-shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
