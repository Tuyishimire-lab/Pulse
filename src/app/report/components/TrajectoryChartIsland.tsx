'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';

export interface TrajectoryPoint {
  weekSlug: string;
  label: string;
  date: string;
  totalRate: number;
  healthScore: number;
}

export interface TrajectoryChartIslandProps {
  trajectory: TrajectoryPoint[];
  className?: string;
}

/**
 * Projects screen coordinates (clientX, clientY) into SVG viewBox coordinates (0..640, 0..185)
 * using the SVG element's inverse Current Transformation Matrix (CTM).
 * Falls back defensively to getBoundingClientRect if getScreenCTM is unavailable or fails.
 */
export function projectScreenToSvg(
  svg: {
    getScreenCTM?: () => { inverse: () => { a: number; b: number; c: number; d: number; e: number; f: number } } | null;
    getBoundingClientRect: () => { left: number; top: number; width: number; height: number };
  },
  clientX: number,
  clientY: number
): { x: number; y: number } {
  try {
    const ctm = svg.getScreenCTM ? svg.getScreenCTM() : null;
    if (ctm) {
      const inv = ctm.inverse();
      const x = clientX * inv.a + clientY * inv.c + inv.e;
      const y = clientX * inv.b + clientY * inv.d + inv.f;
      if (Number.isFinite(x) && Number.isFinite(y)) {
        return { x, y };
      }
    }
  } catch {
    // Graceful fallback to bounding client rect
  }

  const rect = svg.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : 1;
  const height = rect.height > 0 ? rect.height : 1;
  return {
    x: ((clientX - rect.left) / width) * 640,
    y: ((clientY - rect.top) / height) * 185,
  };
}

/**
 * Discrete nearest-neighbor snapping mapping a projected X coordinate
 * to the closest data point index in [0, pointCount - 1].
 */
export function nearestNeighborSnap(
  clampedX: number,
  minX: number,
  chartW: number,
  pointCount: number
): number {
  if (pointCount <= 1) return 0;
  const validChartW = chartW > 0 ? chartW : 1;
  const rho = Math.max(0, Math.min(1, (clampedX - minX) / validChartW));
  return Math.max(0, Math.min(pointCount - 1, Math.round(rho * (pointCount - 1))));
}

export default function TrajectoryChartIsland({
  trajectory,
  className = '',
}: TrajectoryChartIslandProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 640;
  const height = 185;
  const padding = { top: 22, right: 48, bottom: 28, left: 54 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { points, minRate, maxRate, lineD, areaD, healthLineD, leftTicks, rightTicks } = useMemo(() => {
    if (!trajectory || trajectory.length < 2) {
      return {
        points: [],
        minRate: 0,
        maxRate: 0,
        lineD: '',
        areaD: '',
        healthLineD: '',
        leftTicks: [],
        rightTicks: [],
      };
    }

    const rates = trajectory.map((t) => t.totalRate);
    const rawMin = Math.min(...rates);
    const rawMax = Math.max(...rates);
    const minR = rawMin * 0.985;
    const maxR = rawMax * 1.015;
    const rateRange = maxR - minR || 1;

    const pts = trajectory.map((t, idx) => {
      const x = padding.left + (idx / (trajectory.length - 1)) * chartW;
      const yRate = padding.top + chartH - ((t.totalRate - minR) / rateRange) * chartH;
      const clampedHealth = Math.max(40, Math.min(100, t.healthScore));
      const yHealth = padding.top + chartH - ((clampedHealth - 40) / 60) * chartH;
      return { ...t, x, yRate, yHealth };
    });

    const lD = pts.reduce(
      (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yRate.toFixed(1)}`,
      ''
    );
    const aD = `${lD} L ${pts[pts.length - 1].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;
    const hD = pts.reduce(
      (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yHealth.toFixed(1)}`,
      ''
    );

    const midRate = (maxR + minR) / 2;
    const lTicks = [
      { y: padding.top + 4, label: `${(maxR / 1e6).toFixed(1)}M` },
      { y: padding.top + chartH * 0.5 + 4, label: `${(midRate / 1e6).toFixed(1)}M` },
      { y: padding.top + chartH, label: `${(minR / 1e6).toFixed(1)}M` },
    ];

    const rTicks = [100, 80, 60, 40].map((score) => ({
      score,
      y: padding.top + chartH - ((score - 40) / 60) * chartH + 3,
      label: String(score),
    }));

    return {
      points: pts,
      minRate: minR,
      maxRate: maxR,
      lineD: lD,
      areaD: aD,
      healthLineD: hD,
      leftTicks: lTicks,
      rightTicks: rTicks,
    };
  }, [trajectory, chartW, chartH, padding.left, padding.top]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!svgRef.current || points.length === 0) return;
      const coords = projectScreenToSvg(svgRef.current, e.clientX, e.clientY);
      const clampedX = Math.max(padding.left, Math.min(padding.left + chartW, coords.x));
      const snapped = nearestNeighborSnap(clampedX, padding.left, chartW, points.length);
      setHoveredIdx(snapped);
    },
    [points.length, chartW, padding.left]
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredIdx(null);
  }, []);

  if (!trajectory || trajectory.length < 2) return null;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  // Tooltip horizontal position percentage
  const activePercent = activePoint
    ? Math.max(0, Math.min(100, (activePoint.x / width) * 100))
    : 50;

  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-[#0c1220] p-5 shadow-xl relative overflow-hidden ${className}`}
      aria-label="Multi-Week Trajectory Section"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#82c8e5] uppercase tracking-wider bg-[#82c8e5]/10 border border-[#82c8e5]/20 px-2.5 py-0.5 rounded-full font-mono">
              Multi-Week Trajectory
            </span>
            <span className="text-xs font-semibold text-white">8-Week Macro Momentum</span>
          </div>
          <div className="text-xs text-[#8ea1b4]">
            {activePoint ? (
              <span>
                <strong className="text-white">{activePoint.label}</strong> ({new Date(activePoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}):{' '}
                <span className="font-mono text-[#82c8e5] font-semibold">{activePoint.totalRate.toLocaleString()} req/s</span>
                {' · '}
                <span className="text-[#10b981] font-semibold font-mono">Health {activePoint.healthScore}/100</span>
              </span>
            ) : (
              'Continuous pointer tracking: hover to inspect multi-horizon baselines'
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-[#8ea1b4]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#82c8e5]" />
            <span className="text-[#82c8e5] font-medium">Traffic Velocity (req/s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#10b981]" />
            <span className="text-[#10b981] font-medium">Health Score (40–100)</span>
          </div>
        </div>
      </div>

      {/* Relative container for SVG + floating HTML glassmorphic tooltip */}
      <div className="relative w-full">
        {/* Floating HTML glassmorphic tooltip overlay */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75 ease-out rounded-xl px-3 py-2 bg-[#0c1220]/90 border border-white/10 shadow-2xl backdrop-blur-md text-xs font-sans text-white min-w-[190px] max-w-[calc(100%-8px)]"
            style={{
              left: `${activePercent}%`,
              top: '4px',
              transform: `translate(-${activePercent}%, 0)`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-1.5 mb-1.5">
              <span className="font-bold text-white text-[11px]">{activePoint.label}</span>
              <span className="text-[10px] text-[#8ea1b4] font-mono">
                {new Date(activePoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-3 text-[#82c8e5]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82c8e5]" />
                  <span>Velocity</span>
                </span>
                <span className="font-bold">{activePoint.totalRate.toLocaleString()}/s</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[#10b981]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span>Health</span>
                </span>
                <span className="font-bold">{activePoint.healthScore} / 100</span>
              </div>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          role="img"
          aria-label="Multi-Week Internet Traffic Velocity and Health Score Trajectory Chart"
        >
          <desc>8-week historical trajectory plotting traffic velocity and Internet health score.</desc>
          <defs>
            <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#82c8e5" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#82c8e5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="trajGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#82c8e5" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#82c8e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left + chartW}
            y2={padding.top}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH * 0.5}
            x2={padding.left + chartW}
            y2={padding.top + chartH * 0.5}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={padding.left + chartW}
            y2={padding.top + chartH}
            stroke="rgba(255,255,255,0.12)"
          />

          {/* Area & line for Traffic Rate */}
          <path d={areaD} fill="url(#trafficGradient)" />
          <path d={lineD} fill="none" stroke="#82c8e5" strokeWidth="2.5" strokeLinecap="round" />

          {/* Health Score line */}
          <path
            d={healthLineD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.9"
          />

          {/* Vertical Crosshair Line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padding.top}
              x2={activePoint.x}
              y2={padding.top + chartH}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={p.weekSlug} className="cursor-pointer">
                {/* Traffic Rate point */}
                <circle
                  cx={p.x}
                  cy={p.yRate}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#070b14"
                  stroke="#82c8e5"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all"
                />

                {/* Health Score point */}
                <circle
                  cx={p.x}
                  cy={p.yHealth}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#070b14"
                  stroke="#10b981"
                  strokeWidth={isHovered ? 2 : 1.5}
                  className="transition-all"
                />

                {/* Bottom week label */}
                <text
                  x={p.x}
                  y={padding.top + chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? '#ffffff' : '#8ea1b4'}
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Left Y-Axis Tick Labels (Traffic Velocity) */}
          {leftTicks.map((t, idx) => (
            <text
              key={`left-tick-${idx}`}
              x={padding.left - 8}
              y={t.y}
              textAnchor="end"
              fontSize="9"
              fill="#6d8196"
              fontFamily="monospace"
              fontWeight="600"
            >
              {t.label}
            </text>
          ))}

          {/* Right Y-Axis Tick Labels (Health Score 40..100) */}
          {rightTicks.map((t) => (
            <text
              key={`right-tick-${t.score}`}
              x={width - padding.right + 8}
              y={t.y}
              textAnchor="start"
              fontSize="9"
              fill="#10b981"
              fontFamily="monospace"
              fontWeight="600"
            >
              {t.label}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
