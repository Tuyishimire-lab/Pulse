'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavHeader from '../components/NavHeader';
import { SiteConfig } from '../data/sites';

export interface CategorySummary {
  id: string;
  label: string;
  color: string;
  description: string;
  icon: string;
  siteCount: number;
  totalRate: number;
  topSites: SiteConfig[];
}

interface Props {
  categories: CategorySummary[];
  totalTrackedTraffic: number;
}

function FaviconImg({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [err, setErr] = React.useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  if (err) {
    return (
      <span
        className="rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs"
        style={{
          width: 28,
          height: 28,
          backgroundColor: color + '28',
          color: color === '#ffffff' ? '#c0cfd8' : color,
        }}
      >
        {logo}
      </span>
    );
  }
  return (
    <Image
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt={`${logo} favicon`}
      width={28}
      height={28}
      onError={() => setErr(true)}
      className="rounded-full object-contain flex-shrink-0"
      style={{ backgroundColor: color + '18', padding: 2 }}
      unoptimized
    />
  );
}

export default function CategoryIndexClient({ categories, totalTrackedTraffic }: Props) {
  return (
    <div className="min-h-screen bg-[#02020a] text-white flex flex-col selection:bg-[#82c8e5]/30">
      <NavHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-[#6d8196] mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Categories</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 sm:p-12 mb-12 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#82c8e5]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#82c8e5]/10 border border-[#82c8e5]/20 text-[#82c8e5] text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-[#82c8e5] animate-pulse" />
              Global Traffic Taxonomies
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Website Traffic Rankings by Category
            </h1>
            <p className="text-base sm:text-lg text-[#94a3b8] leading-relaxed">
              Explore global web traffic share, audience momentum, and real-time visitor flow segmented across 9 major industry sectors. Powered by the Pulse Traffic Index.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const sharePercent = totalTrackedTraffic > 0
              ? ((cat.totalRate / totalTrackedTraffic) * 100).toFixed(1)
              : '0.0';

            return (
              <div
                key={cat.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border"
                        style={{
                          backgroundColor: cat.color + '18',
                          borderColor: cat.color + '35',
                          color: cat.color,
                        }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white group-hover:text-[#82c8e5] transition-colors">
                          {cat.label}
                        </h2>
                        <span className="text-xs text-[#64748b]">
                          {cat.siteCount} Tracked Domains
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: cat.color + '15',
                        borderColor: cat.color + '30',
                        color: cat.color,
                      }}
                    >
                      {sharePercent}% Share
                    </span>
                  </div>

                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-5">
                    {cat.description}
                  </p>

                  {/* Top Sites Mini List */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">
                      Top Leaders
                    </div>
                    <div className="space-y-1.5">
                      {cat.topSites.slice(0, 3).map((site, idx) => (
                        <Link
                          key={site.id}
                          href={`/sites/${site.id}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[#64748b] font-mono text-[11px] w-4">
                              #{idx + 1}
                            </span>
                            <FaviconImg url={site.url} logo={site.logo} color={site.color} />
                            <span className="font-medium text-white truncate">
                              {site.name}
                            </span>
                          </div>
                          <span className="text-[#82c8e5] font-mono text-[11px] flex-shrink-0 ml-2">
                            {site.baseline}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Category Link */}
                <Link
                  href={`/category/${cat.id}`}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all group-hover:border-[#82c8e5]/40"
                >
                  <span>Explore {cat.label} Rankings</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
