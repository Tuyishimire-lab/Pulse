import React from 'react';
import NavHeader from '../components/NavHeader';

/**
 * Loading skeleton for the trending route (/trending)
 */
export default function TrendingLoading() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center">
      <NavHeader />

      <main className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-8 pb-16 flex flex-col gap-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 rounded skeleton-shimmer" />
            <span className="text-white/20">/</span>
            <div className="h-3 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="h-9 w-80 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-96 rounded skeleton-shimmer" />
        </div>

        {/* Spotlight Highlight Cards (3 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-3"
            >
              <div className="h-3 w-28 rounded skeleton-shimmer" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.04] skeleton-shimmer flex-shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-4 w-32 rounded skeleton-shimmer" />
                  <div className="h-3 w-24 rounded skeleton-shimmer" />
                </div>
                <div className="h-6 w-14 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* 2-Column Risers & Fallers Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, col) => (
            <div
              key={col}
              className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.015] flex flex-col gap-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                <div className="h-5 w-36 rounded-lg skeleton-shimmer" />
                <div className="h-3 w-20 rounded skeleton-shimmer" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, row) => (
                  <div
                    key={row}
                    className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-center gap-3"
                  >
                    <div className="h-4 w-6 rounded skeleton-shimmer" />
                    <div className="w-9 h-9 rounded-full bg-white/[0.04] skeleton-shimmer" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-4 w-28 rounded skeleton-shimmer" />
                      <div className="h-3 w-20 rounded skeleton-shimmer" />
                    </div>
                    <div className="h-5 w-14 rounded-full skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
