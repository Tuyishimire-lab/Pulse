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
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'a' | 'b'>('a');

  // Touch gesture tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // min 50px swipe distance

    if (diffX > swipeThreshold) {
      // Swiped Left -> show Site B
      setActiveTab('b');
    } else if (diffX < -swipeThreshold) {
      // Swiped Right -> show Site A
      setActiveTab('a');
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    setElapsed((Date.now() - pageLoadTimeRef.current) / 1000);
    const interval = setInterval(() => {
      setElapsed((Date.now() - pageLoadTimeRef.current) / 1000);
    }, 500);
    return () => clearInterval(interval);
  }, [siteA, siteB]);

  const countA = Math.floor(elapsed * siteA.rate);
  const countB = Math.floor(elapsed * siteB.rate);
  const delta = Math.abs(countA - countB);

  const numFormatter = useMemo(() => new Intl.NumberFormat('en-US'), []);

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
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <h2 className="text-xl md:text-2xl font-black text-white m-0 flex items-center gap-2">
            Domain Battle: {siteA.name} <span className="text-xs bg-white/10 px-2 py-0.5 rounded uppercase">VS</span> {siteB.name}
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all"
              style={{
                borderColor: copiedLink ? '#10b981' : 'rgba(255,255,255,0.1)',
                backgroundColor: copiedLink ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                color: copiedLink ? '#10b981' : '#82c8e5',
              }}
              onClick={() => {
                const url = `https://www.pulstraffic.com/compare/${siteA.id}-vs-${siteB.id}`;
                navigator.clipboard.writeText(url).then(() => {
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                });
              }}
            >
              {copiedLink ? 'Copied!' : 'Share'}
            </button>
            <button className="modal-close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Real-time Ticking comparison ticker card */}
        <div className="compare-live-card p-6 rounded-2xl bg-black/40 border border-white/5 mb-6 text-center relative overflow-hidden">
          <span className="text-xs font-bold text-[#64748b] tracking-widest uppercase block mb-1">Live Visitor Gap Since Landing</span>
          <span className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] to-[#82C8E5] glow-ticker">
            {numFormatter.format(delta)}
          </span>
          <p className="text-xs md:text-sm text-[#94a3b8] mt-2 mb-0 font-medium">
            {multiplierText}
          </p>
        </div>

        {/* Mobile Swipe Tab Selector (Only visible on small screens) */}
        <div className="flex md:hidden justify-center items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('a')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'a' 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'bg-white/5 border-transparent text-[#64748b]'
            }`}
            style={{ color: activeTab === 'a' ? siteA.color : undefined }}
          >
            {siteA.name}
          </button>
          <span className="text-xs text-[#64748b] font-bold">◄ swipe ►</span>
          <button
            onClick={() => setActiveTab('b')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'b' 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'bg-white/5 border-transparent text-[#64748b]'
            }`}
            style={{ color: activeTab === 'b' ? siteB.color : undefined }}
          >
            {siteB.name}
          </button>
        </div>

        {/* Comparative Columns Grid with Touch Gesture Swipe Handlers */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Vertical divider line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 -translate-x-1/2 hidden md:block" />

          {/* Site A Column */}
          <div className={`flex-col gap-4 text-left ${activeTab === 'a' ? 'flex' : 'hidden md:flex'}`}>
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
          <div className={`flex-col gap-4 text-left ${activeTab === 'b' ? 'flex' : 'hidden md:flex'}`}>
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

        {/* Mobile touch indicator footer */}
        <div className="md:hidden text-center text-[10px] text-[#64748b] mt-4">
          Swipe left or right to switch between domains
        </div>

        {/* Dynamic Comparison Analysis */}
        <div className="mt-6 text-center text-xs text-[#64748b] border-t border-white/5 pt-4">
          Disclaimer: Sourced comparisons are based on average traffic trends and run dynamically from landing stopwatch offsets.
        </div>
      </div>
    </div>
  );
}
