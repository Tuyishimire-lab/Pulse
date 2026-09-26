'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SiteConfig, CATEGORIES } from '../data/sites';
import FaviconImage from './ui/FaviconImage';

interface TreemapViewProps {
  sites: SiteConfig[];
  onSiteClick: (site: SiteConfig) => void;
  getRankChange: (site: SiteConfig) => number | null;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  pageLoadTime: number;
  onViewLayoutChange?: (layout: 'grid' | 'list' | 'treemap') => void;
}

type ColorMode = 'category' | 'momentum' | 'velocity';

interface TreemapRect {
  site: SiteConfig;
  x: number;
  y: number;
  w: number;
  h: number;
  pct: number;
  isOtherGroup?: boolean;
  otherCount?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  search: { bg: 'rgba(66, 133, 244, 0.18)', border: 'rgba(66, 133, 244, 0.5)', glow: 'rgba(66, 133, 244, 0.3)', text: '#60a5fa' },
  social: { bg: 'rgba(225, 48, 108, 0.18)', border: 'rgba(225, 48, 108, 0.5)', glow: 'rgba(225, 48, 108, 0.3)', text: '#f472b6' },
  ai: { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.55)', glow: 'rgba(16, 185, 129, 0.35)', text: '#34d399' },
  entertainment: { bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.5)', glow: 'rgba(239, 68, 68, 0.3)', text: '#f87171' },
  ecommerce: { bg: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.5)', glow: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' },
  reference: { bg: 'rgba(148, 163, 184, 0.18)', border: 'rgba(148, 163, 184, 0.5)', glow: 'rgba(148, 163, 184, 0.3)', text: '#cbd5e1' },
  dev: { bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.5)', glow: 'rgba(168, 85, 247, 0.3)', text: '#c084fc' },
  news: { bg: 'rgba(20, 184, 166, 0.18)', border: 'rgba(20, 184, 166, 0.5)', glow: 'rgba(20, 184, 166, 0.3)', text: '#2dd4bf' },
  finance: { bg: 'rgba(234, 179, 8, 0.18)', border: 'rgba(234, 179, 8, 0.5)', glow: 'rgba(234, 179, 8, 0.3)', text: '#facc15' },
};

const DEFAULT_CATEGORY_COLOR = {
  bg: 'rgba(130, 200, 229, 0.16)',
  border: 'rgba(130, 200, 229, 0.45)',
  glow: 'rgba(130, 200, 229, 0.25)',
  text: '#82c8e5',
};

/**
 * Computes Squarified Treemap partition based on Bruls, Huizing, van Wijk algorithm.
 */
function computeSquarifiedTreemap(
  items: { site: SiteConfig; value: number; isOtherGroup?: boolean; otherCount?: number }[],
  containerWidth: number,
  containerHeight: number,
): TreemapRect[] {
  if (items.length === 0 || containerWidth <= 0 || containerHeight <= 0) return [];

  const totalValue = items.reduce((sum, it) => sum + it.value, 0);
  if (totalValue <= 0) return [];

  const rects: TreemapRect[] = [];
  const normalized = items.map((it) => ({
    site: it.site,
    area: (it.value / totalValue) * (containerWidth * containerHeight),
    pct: (it.value / totalValue) * 100,
    isOtherGroup: it.isOtherGroup,
    otherCount: it.otherCount,
  }));

  layoutRow(
    normalized,
    { x: 0, y: 0, w: containerWidth, h: containerHeight },
    rects,
  );

  return rects;
}

function layoutRow(
  items: { site: SiteConfig; area: number; pct: number; isOtherGroup?: boolean; otherCount?: number }[],
  container: { x: number; y: number; w: number; h: number },
  result: TreemapRect[],
) {
  if (items.length === 0) return;
  if (items.length === 1) {
    result.push({
      site: items[0].site,
      x: container.x,
      y: container.y,
      w: container.w,
      h: container.h,
      pct: items[0].pct,
      isOtherGroup: items[0].isOtherGroup,
      otherCount: items[0].otherCount,
    });
    return;
  }

  let row = [items[0]];
  let rem = items.slice(1);
  const side = Math.min(container.w, container.h);

  while (rem.length > 0) {
    const nextItem = rem[0];
    const curWorst = worstAspect(row, side);
    const nextWorst = worstAspect([...row, nextItem], side);
    if (nextWorst <= curWorst) {
      row.push(nextItem);
      rem = rem.slice(1);
    } else {
      break;
    }
  }

  const rowArea = row.reduce((sum, it) => sum + it.area, 0);
  const isHorizontal = container.w >= container.h;
  const rowThickness = side > 0 ? rowArea / side : 0;

  let currentPos = isHorizontal ? container.y : container.x;
  for (const it of row) {
    const itLength = rowThickness > 0 ? it.area / rowThickness : 0;
    if (isHorizontal) {
      result.push({
        site: it.site,
        x: container.x,
        y: currentPos,
        w: rowThickness,
        h: itLength,
        pct: it.pct,
        isOtherGroup: it.isOtherGroup,
        otherCount: it.otherCount,
      });
      currentPos += itLength;
    } else {
      result.push({
        site: it.site,
        x: currentPos,
        y: container.y,
        w: itLength,
        h: rowThickness,
        pct: it.pct,
        isOtherGroup: it.isOtherGroup,
        otherCount: it.otherCount,
      });
      currentPos += itLength;
    }
  }

  const newContainer = isHorizontal
    ? {
        x: container.x + rowThickness,
        y: container.y,
        w: Math.max(0, container.w - rowThickness),
        h: container.h,
      }
    : {
        x: container.x,
        y: container.y + rowThickness,
        w: container.w,
        h: Math.max(0, container.h - rowThickness),
      };

  layoutRow(rem, newContainer, result);
}

function worstAspect(row: { area: number }[], side: number): number {
  if (row.length === 0 || side <= 0) return Infinity;
  const rowArea = row.reduce((sum, it) => sum + it.area, 0);
  if (rowArea <= 0) return Infinity;
  const s2 = side * side;
  const r2 = rowArea * rowArea;
  let maxRatio = 0;
  for (const it of row) {
    const a = it.area;
    if (a <= 0) continue;
    const ratio = Math.max((s2 * a) / r2, r2 / (s2 * a));
    if (ratio > maxRatio) maxRatio = ratio;
  }
  return maxRatio;
}

export default function TreemapView({
  sites,
  onSiteClick,
  getRankChange,
  activeCategory,
  onCategoryChange,
  pageLoadTime,
  onViewLayoutChange,
}: TreemapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1100, height: 640 });
  const [colorMode, setColorMode] = useState<ColorMode>('category');
  const [hoveredSite, setHoveredSite] = useState<SiteConfig | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Update container dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = Math.floor(entry.contentRect.width);
        const h = Math.max(540, Math.floor(w * 0.58));
        setDimensions({ width: w, height: h });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filtered and sorted sites for treemap
  const { topSites, otherSites, totalVolume } = useMemo(() => {
    const valid = [...sites].filter((s) => s.baselineRaw > 0).sort((a, b) => b.baselineRaw - a.baselineRaw);
    const total = valid.reduce((sum, s) => sum + s.baselineRaw, 0);
    // Render top 36 prominent sites to avoid tiny 10px clutter
    const top = valid.slice(0, 36);
    const other = valid.slice(36);
    return { topSites: top, otherSites: other, totalVolume: total };
  }, [sites]);

  // Compute rectangular layout with sub-linear power damping (pow 0.72)
  // This preserves Google/YouTube as the largest leaders while giving medium/small sites readable room
  const rects = useMemo(() => {
    const DAMPING_EXPONENT = 0.72;
    const items: { site: SiteConfig; value: number; isOtherGroup?: boolean; otherCount?: number }[] = topSites.map((site) => ({
      site,
      value: Math.pow(site.baselineRaw, DAMPING_EXPONENT),
    }));

    if (otherSites.length > 0) {
      const otherRawSum = otherSites.reduce((sum, s) => sum + s.baselineRaw, 0);
      const dummySite: SiteConfig = {
        id: 'other-domains-cluster',
        name: `+${otherSites.length} Other Domains`,
        url: '',
        rank: 999,
        category: 'reference',
        baseline: `${(otherRawSum / 1e9).toFixed(1)}B / mo`,
        baselineRaw: otherRawSum,
        rate: otherSites.reduce((sum, s) => sum + s.rate, 0),
        progress: 0,
        logo: '+',
        color: '#6d8196',
        glow: 'rgba(109, 129, 150, 0.2)',
      };

      items.push({
        site: dummySite,
        value: Math.pow(otherRawSum, DAMPING_EXPONENT) * 0.9,
        isOtherGroup: true,
        otherCount: otherSites.length,
      });
    }

    return computeSquarifiedTreemap(items, dimensions.width, dimensions.height);
  }, [topSites, otherSites, dimensions]);

  // Max visits/sec rate for velocity scaling
  const maxRate = useMemo(() => {
    return Math.max(...topSites.map((s) => s.rate), 1);
  }, [topSites]);

  // Color generator based on active mode
  const getTileStyles = (site: SiteConfig, isOther?: boolean) => {
    if (isOther) {
      return {
        bg: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.08) 0%, rgba(10, 16, 32, 0.9) 80%)',
        border: 'rgba(255, 255, 255, 0.2)',
        glow: 'rgba(255, 255, 255, 0.1)',
        text: '#cbd5e1',
      };
    }

    if (colorMode === 'momentum') {
      const delta = getRankChange(site);
      if (delta !== null && delta > 0) {
        return {
          bg: 'radial-gradient(circle at top left, rgba(34, 197, 94, 0.28) 0%, rgba(8, 20, 16, 0.88) 75%)',
          border: 'rgba(34, 197, 94, 0.55)',
          glow: 'rgba(34, 197, 94, 0.35)',
          text: '#4ade80',
        };
      }
      if (delta !== null && delta < 0) {
        return {
          bg: 'radial-gradient(circle at top left, rgba(239, 68, 68, 0.28) 0%, rgba(26, 10, 14, 0.88) 75%)',
          border: 'rgba(239, 68, 68, 0.55)',
          glow: 'rgba(239, 68, 68, 0.35)',
          text: '#f87171',
        };
      }
      return {
        bg: 'radial-gradient(circle at top left, rgba(100, 116, 139, 0.22) 0%, rgba(12, 18, 28, 0.88) 75%)',
        border: 'rgba(100, 116, 139, 0.45)',
        glow: 'rgba(100, 116, 139, 0.25)',
        text: '#94a3b8',
      };
    }

    if (colorMode === 'velocity') {
      const ratio = Math.min(1, site.rate / maxRate);
      const alpha = 0.2 + ratio * 0.3;
      return {
        bg: `radial-gradient(circle at top left, rgba(0, 120, 212, ${alpha}) 0%, rgba(4, 12, 28, 0.9) 75%)`,
        border: `rgba(130, 200, 229, ${0.3 + ratio * 0.5})`,
        glow: `rgba(56, 189, 248, ${ratio * 0.4})`,
        text: '#82c8e5',
      };
    }

    // Default: category themed with brand glow
    const catStyle = CATEGORY_COLORS[site.category] || DEFAULT_CATEGORY_COLOR;
    return {
      bg: `radial-gradient(circle at top left, ${site.color}25 0%, rgba(7, 12, 24, 0.92) 80%)`,
      border: `${site.color}55`,
      glow: `${site.color}35`,
      text: catStyle.text,
    };
  };

  const formatBaselineShort = (bytes: number) => {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + 'B';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + 'M';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + 'K';
    return bytes.toString();
  };

  return (
    <div className="w-full flex flex-col items-center mt-4">
      {/* Treemap Toolbar */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#82c8e5] animate-pulse" />
          <span className="text-xs font-semibold text-[#82c8e5] uppercase tracking-wider">
            Market Share Map
          </span>
          <span className="text-xs text-[#6d8196]">
            ({topSites.length} leaders shown : {formatBaselineShort(totalVolume)} visits/mo total)
          </span>
        </div>

        {/* Color Mode Switcher */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] uppercase tracking-wider text-[#6d8196] font-bold mr-1">
            Color By:
          </span>
          <button
            onClick={() => setColorMode('category')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              colorMode === 'category'
                ? 'bg-[#0047ab] text-white border border-[#82c8e5]/40 shadow-sm'
                : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:text-white'
            }`}
          >
            Category
          </button>
          <button
            onClick={() => setColorMode('momentum')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              colorMode === 'momentum'
                ? 'bg-[#0047ab] text-white border border-[#82c8e5]/40 shadow-sm'
                : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:text-white'
            }`}
          >
            Momentum
          </button>
          <button
            onClick={() => setColorMode('velocity')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              colorMode === 'velocity'
                ? 'bg-[#0047ab] text-white border border-[#82c8e5]/40 shadow-sm'
                : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:text-white'
            }`}
          >
            Velocity
          </button>
        </div>
      </div>

      {/* Main Treemap Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }
        }}
        onMouseLeave={() => setHoveredSite(null)}
        className="relative w-full rounded-2xl border border-white/10 bg-[#030611] overflow-hidden shadow-2xl select-none"
        style={{ height: dimensions.height }}
      >
        {rects.map((r) => {
          const isOther = r.isOtherGroup;
          const style = getTileStyles(r.site, isOther);
          const delta = isOther ? null : getRankChange(r.site);
          const trueShare = totalVolume > 0 ? ((r.site.baselineRaw / totalVolume) * 100).toFixed(1) : '0';

          // Size classification
          const isMammoth = r.w >= 170 && r.h >= 130;
          const isBig = r.w >= 115 && r.h >= 80;
          const isMedium = r.w >= 70 && r.h >= 50;
          const showName = r.w >= 105 && r.h >= 60;

          // Padding inside tiles
          const tilePad = 2.5;
          const tileX = r.x + tilePad;
          const tileY = r.y + tilePad;
          const tileW = Math.max(0, r.w - tilePad * 2);
          const tileH = Math.max(0, r.h - tilePad * 2);

          const handleClick = () => {
            if (isOther) {
              if (onViewLayoutChange) onViewLayoutChange('grid');
            } else {
              onSiteClick(r.site);
            }
          };

          return (
            <div
              key={r.site.id}
              onClick={handleClick}
              onMouseEnter={() => {
                if (!isOther) setHoveredSite(r.site);
              }}
              style={{
                position: 'absolute',
                left: `${tileX}px`,
                top: `${tileY}px`,
                width: `${tileW}px`,
                height: `${tileH}px`,
                background: style.bg,
                borderColor: style.border,
              }}
              className="rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden p-3 flex flex-col justify-between hover:z-20 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(130,200,229,0.4)] group relative backdrop-blur-sm"
            >
              {/* Subtle brand watermark background on mammoth tiles */}
              {isMammoth && !isOther && (
                <div
                  className="absolute right-3 bottom-3 text-7xl font-black select-none pointer-events-none transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: r.site.color,
                    opacity: 0.08,
                    lineHeight: 1,
                  }}
                >
                  {r.site.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              {/* Top Row: Logo, Name & Rank Badge */}
              <div className="flex items-center justify-between gap-1.5 w-full pointer-events-none relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 flex items-center justify-center bg-black/40 border border-white/15 shadow-sm">
                    {isOther ? (
                      <span className="text-xs font-bold text-white">+</span>
                    ) : (
                      <FaviconImage
                        url={r.site.url}
                        logo={r.site.logo}
                        color={r.site.color}
                        size={16}
                        rounded="md"
                      />
                    )}
                  </div>
                  {showName && (
                    <span className="text-xs font-bold text-white truncate group-hover:text-[#82c8e5] transition-colors">
                      {r.site.name}
                    </span>
                  )}
                </div>

                {!isOther && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-black/60 text-[#82c8e5] border border-white/10 shrink-0">
                    #{r.site.rank}
                  </span>
                )}
              </div>

              {/* Centerpiece stats for mammoth hero tiles (Google, YouTube, Facebook, ChatGPT) */}
              {isMammoth && !isOther && (
                <div className="flex-1 flex flex-col justify-center gap-1.5 my-2 pointer-events-none relative z-10">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                    {r.site.baseline}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-[#82c8e5]">
                    <span>~{r.site.rate.toLocaleString()} / s</span>
                    <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full font-medium shrink-0">
                      {trueShare}% Web Share
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom footer for mammoth tiles: Category & Rank shift */}
              {isMammoth && !isOther && (
                <div className="flex items-center justify-between text-[11px] text-[#6d8196] border-t border-white/5 pt-2 mt-auto pointer-events-none relative z-10">
                  <span className="capitalize text-slate-300 font-medium">{r.site.category}</span>
                  {delta !== null && delta !== 0 ? (
                    <span className={delta > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {delta > 0 ? `+${delta} rank` : `${delta} rank`}
                    </span>
                  ) : (
                    <span className="text-slate-400">Steady</span>
                  )}
                </div>
              )}

              {/* Bottom Row / Stats for big tiles */}
              {isBig && !isMammoth && !isOther && (
                <div className="flex flex-col gap-0.5 mt-auto pointer-events-none relative z-10">
                  <div className="text-sm font-bold text-white tracking-tight">
                    {r.site.baseline}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6d8196]">
                    <span>~{r.site.rate.toLocaleString()} / s</span>
                    {delta !== null && delta !== 0 && (
                      <span className={delta > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {delta > 0 ? `+${delta}` : delta}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom stat for medium-only tiles */}
              {isMedium && !isBig && !isOther && (
                <div className="flex items-center justify-between text-[11px] font-bold text-white mt-auto pointer-events-none relative z-10">
                  <span>{r.site.baseline.split(' ')[0]}</span>
                  {delta !== null && delta !== 0 && (
                    <span className={delta > 0 ? 'text-emerald-400 text-[10px]' : 'text-red-400 text-[10px]'}>
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  )}
                </div>
              )}

              {/* Bottom content for the "+Other Domains" cluster tile */}
              {isOther && (
                <div className="flex flex-col gap-1 mt-auto pointer-events-none relative z-10 text-left">
                  <div className="text-xs font-bold text-white">
                    {r.site.baseline}
                  </div>
                  <div className="text-[10px] text-[#82c8e5] group-hover:underline">
                    View in Grid Catalog
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Hover HUD Tooltip */}
        {hoveredSite && (
          <div
            className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 rounded-xl border border-[#82c8e5]/40 bg-[#0a1020]/95 p-3.5 shadow-2xl backdrop-blur-md text-left transition-all"
            style={{
              left: Math.max(140, Math.min(mousePos.x, dimensions.width - 140)),
              top: Math.max(140, mousePos.y - 10),
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                <FaviconImage
                  url={hoveredSite.url}
                  logo={hoveredSite.logo}
                  color={hoveredSite.color}
                  size={20}
                  rounded="md"
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{hoveredSite.name}</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#0047ab] text-white">
                    RANK #{hoveredSite.rank}
                  </span>
                </div>
                <div className="text-[10px] text-[#6d8196]">{hoveredSite.url.replace(/^https?:\/\//, '')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/10">
              <div>
                <span className="text-[#6d8196] block text-[9px] uppercase tracking-wider">Monthly Traffic</span>
                <span className="font-bold text-white">{hoveredSite.baseline}</span>
              </div>
              <div>
                <span className="text-[#6d8196] block text-[9px] uppercase tracking-wider">Velocity</span>
                <span className="font-bold text-[#82c8e5]">~{hoveredSite.rate.toLocaleString()} / sec</span>
              </div>
              <div>
                <span className="text-[#6d8196] block text-[9px] uppercase tracking-wider">Category</span>
                <span className="font-medium text-slate-300 capitalize">{hoveredSite.category}</span>
              </div>
              <div>
                <span className="text-[#6d8196] block text-[9px] uppercase tracking-wider">30d Rank Shift</span>
                <span className="font-bold">
                  {(() => {
                    const delta = getRankChange(hoveredSite);
                    if (delta === null || delta === 0) return <span className="text-slate-400">Steady</span>;
                    return delta > 0 ? (
                      <span className="text-emerald-400">+{delta} positions</span>
                    ) : (
                      <span className="text-red-400">{delta} positions</span>
                    );
                  })()}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-white/5 text-[9px] text-[#82c8e5] text-center font-medium">
              Click to open detailed telemetry and 30-day chart
            </div>
          </div>
        )}
      </div>

      {/* Treemap Legend Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-[#6d8196] px-2">
        <div className="flex flex-wrap items-center gap-3">
          {colorMode === 'category' ? (
            CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const style = CATEGORY_COLORS[cat.id] || DEFAULT_CATEGORY_COLOR;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(isActive ? 'all' : cat.id)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    isActive ? 'bg-white/10 text-white font-bold' : 'hover:text-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: style.text }}
                  />
                  <span className="text-[11px]">{cat.label}</span>
                </button>
              );
            })
          ) : colorMode === 'momentum' ? (
            <div className="flex items-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Rank Gaining (+)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Steady (0)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Rank Declining (-)</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px]">
              <span>Velocity Intensity:</span>
              <div className="w-28 h-2 rounded-full bg-gradient-to-r from-[#003c91] via-[#0078d4] to-[#38bdf8]" />
              <span className="text-[#82c8e5]">Highest (/s)</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-[#6d8196]">
          Surface area visualizes relative monthly traffic volume with power-law damping.
        </div>
      </div>
    </div>
  );
}
