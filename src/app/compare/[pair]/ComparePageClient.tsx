'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteConfig } from '../../data/sites';
import { ComparePair } from '../data/pairs';
import NavHeader from '../../components/NavHeader';
import SocialShareBar from '../../components/SocialShareBar';
import EmbedWidgetModal from '../../components/EmbedWidgetModal';
import { CURRENT_YEAR } from '../../../lib/currentYear';


interface Props {
  siteA: SiteConfig;
  siteB: SiteConfig;
  pairData: ComparePair | null;
  related: ComparePair[];
  allSites: SiteConfig[];
}

function FaviconImg({ url, logo, color, size = 56 }: { url: string; logo: string; color: string; size?: number }) {
  const [err, setErr] = useState(false);
  const domain = url.replace(/https?:\/\/(www\.)?/, '');
  const bg = color === '#ffffff' ? '#18181b' : color + '22';
  const textColor = color === '#ffffff' ? '#111' : color;
  if (err) {
    return (
      <span
        className="rounded-2xl flex items-center justify-center font-extrabold text-2xl flex-shrink-0"
        style={{ width: size, height: size, backgroundColor: bg, color: textColor }}
      >
        {logo}
      </span>
    );
  }
  return (
    <Image
      src={`https://www.google.com/s2/favicons?sz=128&domain=${domain}`}
      alt={`${logo} logo`}
      width={size}
      height={size}
      onError={() => setErr(true)}
      className="rounded-2xl object-contain p-2 flex-shrink-0"
      style={{ backgroundColor: bg }}
      unoptimized
    />
  );
}

function LiveCounter({ rate, color }: { rate: number; color: string }) {
  const [count, setCount] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCount(Math.floor(rate * elapsed));
    }, 250);
    return () => clearInterval(id);
  }, [rate]);

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-extrabold tabular-nums font-mono" style={{ color }}>
        +{count.toLocaleString()}
      </div>
      <div className="text-xs text-[#6d8196] mt-0.5">visits since you landed</div>
    </div>
  );
}

function StatRow({ label, a, b, colorA, colorB, winner }: {
  label: string; a: string; b: string; colorA: string; colorB: string; winner?: 'a' | 'b' | null;
}) {
  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-white/[0.05] last:border-0">
      <div className={`text-sm font-medium tabular-nums text-right pr-4 ${winner === 'a' ? 'text-white font-bold' : 'text-[#94a3b8]'}`}>
        {a}
        {winner === 'a' && <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">win</span>}
      </div>
      <div className="text-xs text-[#6d8196] text-center font-medium uppercase tracking-wider px-2">{label}</div>
      <div className={`text-sm font-medium tabular-nums pl-4 ${winner === 'b' ? 'text-white font-bold' : 'text-[#94a3b8]'}`}>
        {winner === 'b' && <span className="mr-1.5 text-[10px] text-emerald-400 font-bold">win</span>}
        {b}
      </div>
    </div>
  );
}

export default function ComparePageClient({ siteA, siteB, pairData, related, allSites }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [embedSite, setEmbedSite] = useState<SiteConfig | null>(null);

  // Use numeric baselineRaw to avoid JS string-comparison bug ("820M" > "2.0B" alphabetically)
  const aWinsVisits = (siteA.baselineRaw ?? siteA.rate) > (siteB.baselineRaw ?? siteB.rate);
  const aWinsRate = siteA.rate > siteB.rate;
  const aWinsRank = siteA.rank < siteB.rank;

  const faq = pairData?.faq ?? [
    {
      q: `Which gets more traffic, ${siteA.name} or ${siteB.name}?`,
      a: `${aWinsRank ? siteA.name : siteB.name} ranks higher globally at #${Math.min(siteA.rank, siteB.rank)}, receiving ${aWinsRank ? siteA.baseline : siteB.baseline} per month.`,
    },
    {
      q: `What is the difference between ${siteA.name} and ${siteB.name}?`,
      a: `${siteA.name} is a ${siteA.category} platform ranked #${siteA.rank} globally. ${siteB.name} is a ${siteB.category} platform ranked #${siteB.rank} globally.`,
    },
  ];

  const verdict = pairData?.verdict
    ? `${pairData.verdict} Currently: ${siteA.name} receives ${siteA.baseline} vs ${siteB.name}'s ${siteB.baseline}.`
    : `${aWinsRank ? siteA.name : siteB.name} leads in global traffic, ranked #${Math.min(siteA.rank, siteB.rank)} versus #${Math.max(siteA.rank, siteB.rank)}.`;

  // Related site pairs involving A or B (for internal linking)
  const relatedSiteIds = related.flatMap((p) => [p.siteAId, p.siteBId]);
  const relatedSites = allSites
    .filter((s) => relatedSiteIds.includes(s.id) && s.id !== siteA.id && s.id !== siteB.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${siteA.color}22 0%, transparent 45%),
                       radial-gradient(circle at 80% 70%, ${siteB.color}22 0%, transparent 45%)`,
        }}
      />

      <NavHeader />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6d8196] mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Pulse</Link>
          <span>/</span>
          <span className="text-[#82c8e5]">Compare</span>
          <span>/</span>
          <span className="text-white">{siteA.name} vs {siteB.name}</span>
        </nav>

        {/* Horizontal compare pill strip */}
        <div className="mb-8 -mx-4 sm:-mx-6">
          <div
            className="flex gap-2 overflow-x-auto px-4 sm:px-6 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Current pair is always first, then related pairs */}
            {[
              { slug: `${siteA.id}-vs-${siteB.id}`, nameA: siteA.name, nameB: siteB.name, isCurrent: true },
              ...related.map((p) => {
                const rA = allSites.find((s) => s.id === p.siteAId);
                const rB = allSites.find((s) => s.id === p.siteBId);
                return rA && rB ? { slug: p.slug, nameA: rA.name, nameB: rB.name, isCurrent: false } : null;
              }).filter(Boolean)
            ].map((item) =>
              item && (
                <Link
                  key={item.slug}
                  href={`/compare/${item.slug}`}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                    item.isCurrent
                      ? 'bg-[#82c8e5]/15 border-[#82c8e5]/40 text-[#82c8e5]'
                      : 'border-white/[0.08] text-[#6d8196] hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {item.nameA} vs {item.nameB}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Hero VS Section */}
        <header className="mb-10">
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
            {/* Site A */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <FaviconImg url={siteA.url} logo={siteA.logo} color={siteA.color} size={72} />
              <div className="text-center">
                <Link href={`/sites/${siteA.id}`} className="text-lg font-bold text-white hover:opacity-80 transition-opacity">
                  {siteA.name}
                </Link>
                <div
                  className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block"
                  style={{ backgroundColor: siteA.color + '22', color: siteA.color }}
                >
                  #{siteA.rank} Global
                </div>
              </div>
              <LiveCounter rate={siteA.rate} color={siteA.color} />
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-lg font-extrabold text-[#6d8196]">
                VS
              </div>
            </div>

            {/* Site B */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <FaviconImg url={siteB.url} logo={siteB.logo} color={siteB.color} size={72} />
              <div className="text-center">
                <Link href={`/sites/${siteB.id}`} className="text-lg font-bold text-white hover:opacity-80 transition-opacity">
                  {siteB.name}
                </Link>
                <div
                  className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block"
                  style={{ backgroundColor: siteB.color + '22', color: siteB.color }}
                >
                  #{siteB.rank} Global
                </div>
              </div>
              <LiveCounter rate={siteB.rate} color={siteB.color} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight bg-gradient-to-r from-white to-[#82c8e5] bg-clip-text text-transparent">
            {siteA.name} vs {siteB.name}: Traffic Comparison ({CURRENT_YEAR})
          </h1>
          {pairData?.context && (
            <p className="text-center text-[#94a3b8] text-sm mt-2">{pairData.context}</p>
          )}
        </header>

        {/* Stats Comparison */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-[#6d8196] uppercase tracking-wider mb-3">Traffic Statistics</h2>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-3 px-6 py-2 border-b border-white/[0.06]">
              <div className="text-xs font-bold uppercase tracking-wider text-right pr-4" style={{ color: siteA.color }}>{siteA.name}</div>
              <div className="text-xs text-[#6d8196] text-center">Metric</div>
              <div className="text-xs font-bold uppercase tracking-wider pl-4" style={{ color: siteB.color }}>{siteB.name}</div>
            </div>
            <div className="px-6">
              <StatRow
                label="Monthly Visits"
                a={siteA.baseline}
                b={siteB.baseline}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={aWinsVisits ? 'a' : 'b'}
              />
              <StatRow
                label="Global Rank"
                a={`#${siteA.rank}`}
                b={`#${siteB.rank}`}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={aWinsRank ? 'a' : 'b'}
              />
              <StatRow
                label="Requests / sec"
                a={`${siteA.rate.toLocaleString()}/s`}
                b={`${siteB.rate.toLocaleString()}/s`}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={aWinsRate ? 'a' : 'b'}
              />
              <StatRow
                label="Category"
                a={siteA.category}
                b={siteB.category}
                colorA={siteA.color}
                colorB={siteB.color}
                winner={null}
              />
            </div>
          </div>
        </section>

        {/* Verdict Card */}
        <section className="mb-8">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
               Verdict
            </h2>
            <p className="text-[#94a3b8] text-sm leading-relaxed">{verdict}</p>
          </div>
        </section>

        {/* Social Share & Embed Bar */}
        <section className="mb-8 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Share or Embed this Comparison
            </h3>
            <p className="text-xs text-[#6d8196]">
              Share live metrics with your network or embed live widgets on your site.
            </p>
          </div>
          <SocialShareBar
            title={`📊 ${siteA.name} vs ${siteB.name} Traffic Comparison (${CURRENT_YEAR})`}
            summary={`${aWinsRank ? siteA.name : siteB.name} leads with ${aWinsRank ? siteA.baseline : siteB.baseline} vs ${aWinsRank ? siteB.baseline : siteA.baseline}.`}
            hashtags={['WebTraffic', siteA.name.replace(/[^a-zA-Z0-9]/g, ''), siteB.name.replace(/[^a-zA-Z0-9]/g, ''), 'PulseAnalytics']}
            onOpenEmbed={() => setEmbedSite(aWinsRank ? siteA : siteB)}
          />
        </section>


        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                  aria-expanded={openFaq === i}
                  aria-controls={`compare-faq-panel-${i}`}
                  id={`compare-faq-btn-${i}`}
                >
                  <span className="font-semibold text-sm text-white">{item.q}</span>
                  <span
                    className="text-[#6d8196] text-lg flex-shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[#94a3b8] leading-relaxed border-t border-white/[0.04] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>



        {/* Internal links to site pages */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-[#6d8196] uppercase tracking-wider mb-3">Deep Dive</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/sites/${siteA.id}`}
              className="flex-1 px-4 py-3 rounded-xl border text-center text-sm font-semibold transition-all hover:opacity-80"
              style={{ borderColor: siteA.color + '44', backgroundColor: siteA.color + '11', color: siteA.color }}
            >
              View {siteA.name} Full Stats →
            </Link>
            <Link
              href={`/sites/${siteB.id}`}
              className="flex-1 px-4 py-3 rounded-xl border text-center text-sm font-semibold transition-all hover:opacity-80"
              style={{ borderColor: siteB.color + '44', backgroundColor: siteB.color + '11', color: siteB.color }}
            >
              View {siteB.name} Full Stats →
            </Link>
          </div>
        </section>

        {embedSite && (
          <EmbedWidgetModal
            site={embedSite}
            isOpen={true}
            onClose={() => setEmbedSite(null)}
          />
        )}

      </div>
    </div>
  );
}
