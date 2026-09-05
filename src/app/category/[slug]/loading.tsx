import React from 'react';
import NavHeader from '../../components/NavHeader';

/**
 * Loading skeleton for category directories (/category/[slug])
 */
export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center">
      <NavHeader />

      <main className="relative z-10 w-full max-w-[1200px] px-6 py-8 pb-16 flex flex-col gap-8">
        {/* Category Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 rounded skeleton-shimmer" />
            <span className="text-white/20">/</span>
            <div className="h-3 w-16 rounded skeleton-shimmer" />
            <span className="text-white/20">/</span>
            <div className="h-3 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="h-9 w-64 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-96 rounded skeleton-shimmer" />
        </div>

        {/* Card Grid Skeleton */}
        <div
          className="grid gap-4 w-full"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 rounded-full bg-white/[0.04] skeleton-shimmer" />
                <div className="w-9 h-9 rounded-full bg-white/[0.04] skeleton-shimmer" />
              </div>
              <div className="h-5 w-3/4 rounded-lg skeleton-shimmer" />
              <div className="h-3 w-1/2 rounded-lg skeleton-shimmer" />
              <div className="h-8 w-full rounded-xl skeleton-shimmer mt-2" />
              <div className="flex justify-between mt-auto pt-2 border-t border-white/5">
                <div className="h-3 w-20 rounded skeleton-shimmer" />
                <div className="h-3 w-14 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
