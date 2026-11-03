'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SiteFaqItem } from '../../lib/siteFaq';

interface SiteFaqSectionProps {
  siteName: string;
  items: SiteFaqItem[];
  brandColor?: string;
}

export default function SiteFaqSection({
  siteName,
  items,
  brandColor = '#82c8e5',
}: SiteFaqSectionProps) {
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  if (!items || items.length === 0) return null;

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section
      className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 mt-6 text-left"
      style={{ boxShadow: '0 4px 20px -8px rgba(0,0,0,0.5)' }}
      aria-labelledby="site-faq-heading"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 flex-wrap gap-2">
        <h2
          id="site-faq-heading"
          className="text-[11px] font-bold tracking-widest text-[#82c8e5] uppercase m-0"
        >
          Frequently Asked Questions — {siteName} Traffic &amp; Rankings
        </h2>
        <span className="text-[10px] font-mono text-white/40 uppercase">
          Verified FAQ Schema
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = !!openIndices[idx];
          const panelId = `site-faq-panel-${item.id}`;
          const btnId = `site-faq-btn-${item.id}`;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/[0.07] bg-white/[0.015] overflow-hidden transition-colors"
            >
              <button
                id={btnId}
                type="button"
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full text-left px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
              >
                <span className="font-bold text-xs sm:text-sm text-white leading-snug">
                  {item.question}
                </span>
                <span
                  className="text-white/50 text-base font-mono flex-shrink-0 transition-transform duration-200"
                  style={{
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    color: isOpen ? brandColor : undefined,
                  }}
                >
                  +
                </span>
              </button>

              {/* Keep answer mounted in DOM at all times for SSR & Googlebot FAQPage parity */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className={`${isOpen ? 'block' : 'hidden'} px-4 sm:px-5 pb-4 pt-3 text-xs sm:text-sm text-white/80 leading-relaxed border-t border-white/[0.05]`}
              >
                <p className="m-0">{item.answerText}</p>

                {item.competitorLinks && item.competitorLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.04]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block mb-2">
                      Direct Head-to-Head Comparisons:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.competitorLinks.map((peer) => (
                        <React.Fragment key={peer.id}>
                          <Link
                            href={`/compare/${peer.compareSlug}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#82c8e5]/10 text-[#82c8e5] border border-[#82c8e5]/20 hover:bg-[#82c8e5]/20 hover:border-[#82c8e5]/40 transition-all"
                          >
                            <span>
                              {siteName} vs {peer.name}
                            </span>
                            <span className="text-[10px] opacity-75">
                              (#{peer.rank}) →
                            </span>
                          </Link>
                          <Link
                            href={`/sites/${peer.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-white/60 bg-white/[0.03] border border-white/[0.06] hover:text-white hover:border-white/20 transition-all"
                          >
                            <span>{peer.name} Stats</span>
                          </Link>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {item.countryLinks && item.countryLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.04]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d8196] block mb-2">
                      Explore Regional Top-20 Rankings:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.countryLinks.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/top-sites/${c.slug}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.03] border border-white/[0.08] text-white/85 hover:text-[#82c8e5] hover:border-[#82c8e5]/35 transition-all"
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                          <span className="text-[10px] font-mono text-[#82c8e5]">
                            #{c.rank}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
