'use client';

import React, { useMemo } from 'react';

interface RankSparklineProps {
  history: { rank: number; date: string }[];
  color?: string;
}

/**
 * Tiny inline SVG sparkline showing rank movement over the last 7 days.
 * Green = rank improved (lower number), Red = rank declined, Gray = stable.
 * Note: rank is inverted for display (lower rank = higher on chart).
 */
export default function RankSparkline({ history, color }: RankSparklineProps) {
  const { path, strokeColor, tooltip } = useMemo(() => {
    if (!history || history.length < 2) {
      return { path: '', strokeColor: '#6d8196', tooltip: '' };
    }

    const ranks = history.map((h) => h.rank);
    const first = ranks[0];
    const last = ranks[ranks.length - 1];
    const delta = first - last; // positive = improved (rank decreased)

    let sc = '#6d8196'; // neutral gray
    if (delta > 0) sc = '#10b981'; // improved - green
    else if (delta < 0) sc = '#ef4444'; // declined - red

    const W = 44;
    const H = 18;
    const maxRank = Math.max(...ranks);
    const minRank = Math.min(...ranks);

    // If rank never changed across the entire history window, do not render a flat line
    // (which looks like a stray underline/artifact next to the rank number).
    if (maxRank === minRank) {
      return { path: '', strokeColor: '#6d8196', tooltip: '' };
    }

    const range = maxRank - minRank;

    const points = ranks.map((rank, i) => {
      const x = (i / (ranks.length - 1)) * W;
      // Invert: lower rank = higher on chart
      const y = H - 3 - ((maxRank - rank) / range) * (H - 6);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });

    const tooltipStr =
      delta > 0
        ? `Rank improved: #${first} → #${last} (+${delta})`
        : delta < 0
          ? `Rank declined: #${first} → #${last} (${delta})`
          : `Rank varied between #${minRank} and #${maxRank} (currently #${last})`;

    return { path: points.join(' '), strokeColor: color || sc, tooltip: tooltipStr };
  }, [history, color]);

  if (!history || history.length < 2 || !path) return null;

  return (
    <svg
      width="44"
      height="18"
      viewBox="0 0 44 18"
      className="inline-block shrink-0 opacity-75 hover:opacity-100 transition-opacity cursor-help"
      aria-label={tooltip}
    >
      <title>{tooltip}</title>
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
