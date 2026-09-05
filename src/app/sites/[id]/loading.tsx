import React from 'react';
import NavHeader from '../../components/NavHeader';

/**
 * Loading skeleton for the site detail route (/sites/[id])
 */
export default function SiteLoading() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col items-center">
      <NavHeader />

      <main className="relative z-10 w-full max-w-[800px] px-6 mt-8 flex flex-col gap-8 pb-16">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 rounded skeleton-shimmer" />
          <span className="text-white/20">/</span>
          <div className="h-3 w-10 rounded skeleton-shimmer" />
          <span className="text-white/20">/</span>
          <div className="h-3 w-20 rounded skeleton-shimmer" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col gap-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-[60px] h-[60px] rounded-full skeleton-shimmer" />
              <div className="flex flex-col gap-2">
                <div className="h-8 w-44 rounded-xl skeleton-shimmer" />
                <div className="h-4 w-28 rounded-lg skeleton-shimmer" />
              </div>
            </div>
            {/* Timer card */}
            <div className="w-28 h-16 rounded-2xl border border-white/5 bg-white/[0.02] skeleton-shimmer" />
          </div>

          {/* Executive Overview placeholder */}
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
            <div className="h-3 w-32 rounded skeleton-shimmer" />
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-5/6 rounded skeleton-shimmer" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2 pt-3 border-t border-white/5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.02] skeleton-shimmer" />
              ))}
            </div>
          </div>
        </div>

        {/* 4-Stat Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
              <div className="h-3 w-16 rounded skeleton-shimmer" />
              <div className="h-7 w-24 rounded-lg skeleton-shimmer" />
              <div className="h-2 w-full rounded-full skeleton-shimmer mt-1" />
            </div>
          ))}
        </div>

        {/* Chart Box Skeleton */}
        <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-36 rounded skeleton-shimmer" />
            <div className="h-7 w-24 rounded-lg skeleton-shimmer" />
          </div>
          <div className="h-48 w-full rounded-2xl bg-white/[0.01] skeleton-shimmer" />
        </div>
      </main>
    </div>
  );
}
