'use client';

import React from 'react';

interface SpeedGaugeProps {
  /** Current speed in Mbps to display on the needle */
  speed: number;
  /** Max speed for the gauge scale (auto-adapts) */
  maxSpeed?: number;
  /** Label below the speed value */
  label: string;
  /** Whether the gauge is actively measuring */
  active: boolean;
}

/**
 * Animated semicircular SVG speed gauge.
 * Auto-scales based on measured speed. Smooth needle transitions.
 */
export default function SpeedGauge({ speed, maxSpeed: maxOverride, label, active }: SpeedGaugeProps) {
  // Auto-scale: pick the next "nice" ceiling
  const maxSpeed = maxOverride ?? getScaleCeiling(speed);
  const fraction = Math.min(speed / Math.max(1, maxSpeed), 1);

  // Gauge geometry
  const cx = 160, cy = 150, radius = 120;
  const startAngle = -210; // degrees from 3 o'clock position
  const endAngle = 30;
  const totalArc = endAngle - startAngle; // 240 degrees

  const needleAngle = startAngle + totalArc * fraction;

  // Arc path helper
  const polarToCartesian = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (start: number, end: number, r: number) => {
    const s = polarToCartesian(start, r);
    const e = polarToCartesian(end, r);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  // Active fill arc (from start to current speed)
  const fillEnd = startAngle + totalArc * fraction;

  // Tick marks
  const ticks = [];
  const tickCount = 8;
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (totalArc / tickCount) * i;
    const outer = polarToCartesian(angle, radius + 6);
    const inner = polarToCartesian(angle, radius - 6);
    const labelPos = polarToCartesian(angle, radius + 22);
    const value = Math.round((maxSpeed / tickCount) * i);
    ticks.push({ outer, inner, labelPos, value, angle });
  }

  // Needle tip
  const needleTip = polarToCartesian(needleAngle, radius - 10);

  // Format speed display
  const displaySpeed = speed >= 1000 ? (speed / 1000).toFixed(2) : speed.toFixed(1);
  const unit = speed >= 1000 ? 'Gbps' : 'Mbps';

  return (
    <div className="speed-gauge-container">
      <svg viewBox="0 0 320 200" className="speed-gauge-svg">
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle, radius)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Active fill arc */}
        {fraction > 0.001 && (
          <path
            d={describeArc(startAngle, fillEnd, radius)}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            className="speed-gauge-fill"
          />
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0047AB" />
            <stop offset="50%" stopColor="#82c8e5" />
            <stop offset="100%" stopColor="#00e5a0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={t.inner.x} y1={t.inner.y}
              x2={t.outer.x} y2={t.outer.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={i % 2 === 0 ? 2 : 1}
            />
            {i % 2 === 0 && (
              <text
                x={t.labelPos.x} y={t.labelPos.y}
                fill="rgba(255,255,255,0.35)"
                fontSize="8"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {t.value}
              </text>
            )}
          </g>
        ))}

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x} y2={needleTip.y}
          stroke="#82c8e5"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
          className="speed-gauge-needle"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="5" fill="#82c8e5" opacity="0.8" />
        {active && (
          <circle cx={cx} cy={cy} r="8" fill="none" stroke="#82c8e5" strokeWidth="1" opacity="0.4" className="speed-gauge-pulse-ring" />
        )}
      </svg>

      {/* Speed readout */}
      <div className="speed-gauge-readout">
        <span className="speed-gauge-value">{displaySpeed}</span>
        <span className="speed-gauge-unit">{unit}</span>
      </div>

      {/* Phase label */}
      <div className="speed-gauge-label">{label}</div>
    </div>
  );
}

function getScaleCeiling(speed: number): number {
  if (speed <= 25) return 50;
  if (speed <= 50) return 100;
  if (speed <= 100) return 200;
  if (speed <= 250) return 500;
  if (speed <= 500) return 1000;
  if (speed <= 1000) return 2000;
  return Math.ceil(speed / 1000) * 1000;
}
