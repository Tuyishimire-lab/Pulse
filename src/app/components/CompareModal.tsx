import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SiteConfig } from '../data/sites';
import { getSiteDetails } from '../data/details';

interface CompareModalProps {
  siteA: SiteConfig;
  siteB: SiteConfig;
  onClose: () => void;
}

export default function CompareModal({ siteA, siteB, onClose }: CompareModalProps) {
  const detailsA = useMemo(() => getSiteDetails(siteA), [siteA]);
  const detailsB = useMemo(() => getSiteDetails(siteB), [siteB]);

  const pageLoadTimeRef = useRef<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Set initial value
    setElapsed((Date.now() - pageLoadTimeRef.current) / 1000);

    const interval = setInterval(() => {
      setElapsed((Date.now() - pageLoadTimeRef.current) / 1000);
    }, 500); // Throttled to 500ms (twice a second)

    return () => clearInterval(interval);
  }, [siteA, siteB]);

  const countA = Math.floor(elapsed * siteA.rate);
  const countB = Math.floor(elapsed * siteB.rate);
  const delta = Math.abs(countA - countB);

  const numFormatter = useMemo(() => new Intl.NumberFormat('en-US'), []);

  // Rate multiplier ratio comparison
  const multiplierText = useMemo(() => {
    if (siteA.rate === siteB.rate) {
      return "Both platforms are gaining visitors at the exact same rate.";
    }
    const aFaster = siteA.rate > siteB.rate;
    const fasterSite = aFaster ? siteA.name : siteB.name;
    const slowerSite = aFaster ? siteB.name : siteA.name;
    const ratio = (Math.max(siteA.rate, siteB.rate) / Math.min(siteA.rate, siteB.rate) || 1).toFixed(1);
    return `${fasterSite} is gaining visitors ${ratio}x faster than ${slowerSite}!`;
  }, [siteA, siteB]);

  return (
    <div 
      className="modal-overlay flex items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="compare-modal-content max-w-[850px] w-full p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-y-auto max-h-[90vh] mx-4"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${siteA.color} 8%, #02020a) 0%, color-mix(in srgb, ${siteB.color} 8%, #02020a) 100%)`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-black text-white m-0 flex items-center gap-2">
            Domain Battle: {siteA.name} <span className="text-xs bg-white/10 px-2 py-0.5 rounded uppercase">VS</span> {siteB.name}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Real-time Ticking comparison ticker card */}
        <div className="compare-live-card p-6 rounded-2xl bg-black/40 border border-white/5 mb-8 text-center relative overflow-hidden">
          <span className="text-xs font-bold text-[#64748b] tracking-widest uppercase block mb-1">Live Visitor Gap Since Landing</span>
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] to-[#82C8E5] glow-ticker">
            {numFormatter.format(delta)}
          </span>
          <p className="text-sm text-[#94a3b8] mt-2 mb-0 font-medium">
            {multiplierText}
          </p>
        </div>

        {/* Comparative Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Vertical divider line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 -translate-x-1/2 hidden md:block" />

          {/* Site A Column */}
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: siteA.color }} />
              <h3 className="text-xl font-extrabold m-0 text-white">{siteA.name}</h3>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Rank</span>
                <span className="font-semibold">#{siteA.rank}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Baseline Traffic</span>
                <span className="font-semibold">{siteA.baseline}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Visit Speed</span>
                <span className="font-semibold">{siteA.rate}/sec</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Bounce Rate</span>
                <span className="font-semibold">{detailsA.bounceRate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Visit Duration</span>
                <span className="font-semibold">{detailsA.visitDuration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Desktop Split</span>
                <span className="font-semibold">{detailsA.desktopShare}%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[0.75rem] font-bold text-[#64748b] block mb-1">Visits Since Page Load</span>
              <span className="text-xl font-extrabold glow-ticker" style={{ color: siteA.color }}>{numFormatter.format(countA)}</span>
            </div>
          </div>

          {/* Site B Column */}
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: siteB.color }} />
              <h3 className="text-xl font-extrabold m-0 text-white">{siteB.name}</h3>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Rank</span>
                <span className="font-semibold">#{siteB.rank}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Baseline Traffic</span>
                <span className="font-semibold">{siteB.baseline}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Visit Speed</span>
                <span className="font-semibold">{siteB.rate}/sec</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Bounce Rate</span>
                <span className="font-semibold">{detailsB.bounceRate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Visit Duration</span>
                <span className="font-semibold">{detailsB.visitDuration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Desktop Split</span>
                <span className="font-semibold">{detailsB.desktopShare}%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[0.75rem] font-bold text-[#64748b] block mb-1">Visits Since Page Load</span>
              <span className="text-xl font-extrabold glow-ticker" style={{ color: siteB.color }}>{numFormatter.format(countB)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Comparison Analysis */}
        <div className="mt-8 text-center text-xs text-[#64748b] border-t border-white/5 pt-4">
          Disclaimer: Sourced comparisons are based on average traffic trends and run dynamically from landing stopwatch offsets.
        </div>
      </div>
    </div>
  );
}
