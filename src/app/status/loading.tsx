import React from 'react';

export default function StatusLoading() {
  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans p-6">
      <div className="max-w-5xl mx-auto pt-12 space-y-6 animate-pulse">
        <div className="h-44 rounded-3xl bg-white/[0.03] border border-white/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
