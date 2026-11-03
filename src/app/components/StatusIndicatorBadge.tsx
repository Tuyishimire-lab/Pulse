'use client';

import React from 'react';
import Link from 'next/link';
import type { StatusIndicatorData } from '../../lib/statusResolver';

interface StatusIndicatorBadgeProps {
  status?: StatusIndicatorData | null;
  siteName: string;
}

export default function StatusIndicatorBadge({
  status,
  siteName,
}: StatusIndicatorBadgeProps) {
  const tier = status?.tier ?? 'operational';
  const label = status?.label ?? 'Operational';
  const detail =
    status?.detail ?? `${siteName} edge telemetry normal`;

  const styles = {
    operational: {
      bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    degraded: {
      bg: 'bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20',
      dot: 'bg-amber-400',
    },
    advisory: {
      bg: 'bg-sky-500/10 border-sky-500/25 text-sky-300 hover:bg-sky-500/20',
      dot: 'bg-sky-400',
    },
    outage: {
      bg: 'bg-red-500/15 border-red-500/35 text-red-300 hover:bg-red-500/25',
      dot: 'bg-red-400',
    },
  }[tier];

  return (
    <Link
      href="/status"
      title={`${siteName} Health: ${detail} — Click to open Live Internet Outage & Status Tracker`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${styles.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />
      <span>{label}</span>
    </Link>
  );
}
