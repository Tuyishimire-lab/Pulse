import React from 'react';
import NavHeader from '../../components/NavHeader';

/**
 * Loading skeleton for the country rankings route (/top-sites/[country])
 */
export default function CountryLoading() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center font-sans">
      <NavHeader />

      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-12 rounded skeleton-shimmer" />
          <span className="text-white/20">/</span>
          <div className="h-3 w-16 rounded skeleton-shimmer" />
          <span className="text-white/20">/</span>
          <div className="h-3 w-24 rounded skeleton-shimmer" />
        </div>

        {/* Hero Meta */}
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-10 rounded-lg bg-white/[0.04] skeleton-shimmer" />
            <div className="h-6 w-28 rounded-full bg-white/[0.04] skeleton-shimmer" />
            <div className="h-4 w-40 rounded skeleton-shimmer hidden sm:block" />
          </div>
          <div className="h-9 w-3/4 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-full rounded skeleton-shimmer" />
        </div>

        {/* Rankings Table Skeleton */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-3">
          <div className="h-8 w-full rounded-xl bg-white/[0.02] skeleton-shimmer" />
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] gap-4">
              <div className="h-4 w-6 rounded skeleton-shimmer" />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-white/[0.04] skeleton-shimmer" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-4 w-28 rounded skeleton-shimmer" />
                  <div className="h-3 w-20 rounded skeleton-shimmer" />
                </div>
              </div>
              <div className="h-4 w-16 rounded skeleton-shimmer hidden sm:block" />
              <div className="h-4 w-20 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
