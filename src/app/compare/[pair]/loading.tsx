import React from 'react';
import NavHeader from '../../components/NavHeader';

/**
 * Loading skeleton for the comparison route (/compare/[pair])
 */
export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center">
      <NavHeader />

      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 pb-16 flex flex-col gap-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 rounded skeleton-shimmer" />
          <span className="text-white/20">/</span>
          <div className="h-3 w-14 rounded skeleton-shimmer" />
          <span className="text-white/20">/</span>
          <div className="h-3 w-28 rounded skeleton-shimmer" />
        </div>

        {/* Comparison Header Pills */}
        <div className="flex gap-2 overflow-hidden pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-28 rounded-full bg-white/[0.03] skeleton-shimmer flex-shrink-0" />
          ))}
        </div>

        {/* Head-to-Head VS Hero */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col gap-6">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Site A */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] skeleton-shimmer" />
              <div className="h-5 w-24 rounded-lg skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
              <div className="h-8 w-28 rounded-xl skeleton-shimmer mt-2" />
            </div>

            {/* VS Badge */}
            <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs font-bold text-white/30">
              VS
            </div>

            {/* Site B */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] skeleton-shimmer" />
              <div className="h-5 w-24 rounded-lg skeleton-shimmer" />
              <div className="h-3 w-16 rounded skeleton-shimmer" />
              <div className="h-8 w-28 rounded-xl skeleton-shimmer mt-2" />
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-4">
          <div className="h-4 w-32 rounded skeleton-shimmer mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 items-center py-3 border-b border-white/5">
              <div className="h-4 w-20 rounded skeleton-shimmer ml-auto" />
              <div className="h-3 w-16 rounded skeleton-shimmer mx-auto" />
              <div className="h-4 w-20 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
