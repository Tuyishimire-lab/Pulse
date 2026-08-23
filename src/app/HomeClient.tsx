'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CATEGORIES, SITE_META, SiteConfig } from './data/sites';

import { getSiteDetails, SiteDetails } from './data/details';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { STATIC_TRAFFIC_FACTS } from '../data/marquee';
import { getMostSearchedTopics } from '../utils/searchTopics';

// Components
import Header from './components/Header';
import MarqueeBanner from './components/MarqueeBanner';
import DashboardConsole from './components/DashboardConsole';
import AnalyticsPanel from './components/AnalyticsPanel';
import SiteGrid from './components/SiteGrid';
import SiteDetailModal from './components/SiteDetailModal';
import AddCustomSiteModal from './components/AddCustomSiteModal';
import LegalModals from './components/LegalModals';
import CompareModal from './components/CompareModal';
import NavHeader from './components/NavHeader';

interface HomeClientProps {
  /** Sites pre-fetched from Supabase server-side (avoids client waterfall) */
  initialSites: SiteConfig[];
  /** Radar stats pre-fetched server-side */
  initialRadarStats: any | null;
  /** Marquee items pre-fetched server-side */
  initialMarquee: { text: string; type: string; asns?: number[]; locations?: string[] }[];
}

export default function HomeClient({
  initialSites,
  initialRadarStats,
  initialMarquee,
}: HomeClientProps) {
  // ── UI State ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(30);
  const [isMounted, setIsMounted] = useState(false);

  // ── Site Selection ────────────────────────────────────────────────────────
  const [selectedSite, setSelectedSite] = useState<SiteConfig | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<SiteDetails | null>(null);

  // ── Supabase - seed with server-fetched data ──────────────────────────────
  const [dbSites, setDbSites] = useState<SiteConfig[]>(initialSites);
  const [lastSynced, setLastSynced] = useState<string | null>(
    (initialSites[0] as any)?.updated_at ?? null
  );

  // ── Watchlist ─────────────────────────────────────────────────────────────
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [watchlistFilter, setWatchlistFilter] = useState<boolean>(false);

  // ── Custom Sites ──────────────────────────────────────────────────────────
  const [customSites, setCustomSites] = useState<SiteConfig[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('dev');
  const [newSiteBaseline, setNewSiteBaseline] = useState('10M / mo');
  const [newSiteColor, setNewSiteColor] = useState('#0047ab');

  // ── Compare Mode ──────────────────────────────────────────────────────────
  const [compareModeActive, setCompareModeActive] = useState<boolean>(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // ── Marquee - seed with server-fetched data ───────────────────────────────
  const [marqueeItems, setMarqueeItems] = useState<
    { text: string; type: string; asns?: number[]; locations?: string[] }[]
  >(initialMarquee.length > 0 ? initialMarquee : STATIC_TRAFFIC_FACTS);

  // ── Legal Modals ──────────────────────────────────────────────────────────
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  // ── Analytics / Filtering ─────────────────────────────────────────────────
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(true);
  const [trafficTierFilter, setTrafficTierFilter] = useState<'all' | 'enterprise' | 'midmarket' | 'growth'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'rate' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCountry, setSelectedCountry] = useState<string>('global');
  const [localRanks, setLocalRanks] = useState<Record<string, number>>({});

  // ── Cloudflare Radar - seed with server-fetched data ──────────────────────
  const [radarStats, setRadarStats] = useState<any>(initialRadarStats);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(!initialRadarStats);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const loadMoreRef = useRef<HTMLDivElement>(null);
  /** Captured once on mount - never resets during re-renders */
  const pageLoadTimeRef = useRef<number>(Date.now());

  // ── Rank change helper ────────────────────────────────────────────────────
  // Derives the baseline rank from the oldest rank_history entry stored in
  // Supabase by the PTI engine - no longer reads from the static sites.ts file.
  const getRankChange = (site: SiteConfig) => {
    if (!site.rank_history || site.rank_history.length < 2) return null;
    // Sort oldest-first explicitly - do NOT rely on insertion order from the engine
    const sorted = [...site.rank_history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const oldestRank = sorted[0].rank;
    return oldestRank - site.rank; // positive = moved up, negative = moved down
  };

  // ── Incident detection from marquee ──────────────────────────────────────
  const sitesWithIncidents = useMemo(() => {
    const incidentIds = new Set<string>();
    // Always use live Supabase data - never fall back to the static file.
    // If dbSites is empty (Supabase not yet loaded) we simply detect no incidents
    // rather than risk serving stale ASN/name data from the static file.
    const allBaseSites = [...dbSites, ...customSites];

    marqueeItems.forEach((item) => {
      if (item.type !== 'outage') return;
      const itemAsns = item.asns;
      allBaseSites.forEach((site) => {
        const hasAsnMatch =
          site.asn &&
          Array.isArray(itemAsns) &&
          site.asn.some((asn) => itemAsns.includes(asn));
        const nameRegex = new RegExp(`\\b${site.name}\\b`, 'i');
        const idRegex = new RegExp(`\\b${site.id}\\b`, 'i');
        const hasKeywordMatch = nameRegex.test(item.text) || idRegex.test(item.text);
        if (hasAsnMatch || hasKeywordMatch) {
          incidentIds.add(site.id);
        }
      });
    });
    return incidentIds;
  }, [marqueeItems, dbSites, customSites]);

  // ── Load persisted state on mount ─────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    const storedStars = localStorage.getItem('pulse_watchlist');
    if (storedStars) {
      try { setWatchlistIds(JSON.parse(storedStars)); } catch {}
    }
    const storedCustom = localStorage.getItem('pulse_custom_sites');
    if (storedCustom) {
      try { setCustomSites(JSON.parse(storedCustom)); } catch {}
    }
  }, []);

  // ── Supabase realtime subscription (incremental updates only) ─────────────
  // Initial data already loaded from server props - no fetch waterfall
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function fetchSites() {
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('id, name, url, rank, category, baseline, baseline_raw, rate, progress, updated_at')
          .order('rank', { ascending: true });

        if (error) {
          console.error('Error fetching sites from Supabase:', error);
          return;
        }
        if (data && data.length > 0) {
          // Merge static metadata (logo, color, glow, asn) from SITE_META onto DB rows
          const enriched = data.map((row: any) => ({
            ...(SITE_META[row.id] ?? {}),
            ...row,
            baselineRaw: row.baseline_raw ?? 0,
          })) as SiteConfig[];
          setDbSites(enriched);
          const firstUpdated = (data[0] as any).updated_at;
          if (firstUpdated) setLastSynced(firstUpdated);
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
      }
    }

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => {
        fetchSites();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Marquee cycling ───────────────────────────────────────────────────────
  useEffect(() => {
    // Only re-fetch when country changes from initial global load
    fetch(
      `/api/marquee${selectedCountry !== 'global' ? `?location=${selectedCountry}` : ''}`,
      { cache: 'no-store' },
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMarqueeItems(data);
        }
      })
      .catch((err) => console.error('Error fetching live marquee updates:', err));
  }, [selectedCountry]);

  // ── Cloudflare Radar stats ────────────────────────────────────────────────
  useEffect(() => {
    // Skip initial global fetch - we already have server-side data
    if (selectedCountry === 'global' && initialRadarStats) {
      setRadarStats(initialRadarStats);
      setLoadingRadar(false);
      return;
    }

    setLoadingRadar(true);

    fetch(
      `/api/radar-stats${selectedCountry !== 'global' ? `?location=${selectedCountry}` : ''}`,
      { next: { revalidate: 300 } },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) { setRadarStats(data); }
        setLoadingRadar(false);
      })
      .catch((err) => {
        console.error('Error fetching Cloudflare Radar stats:', err);
        setLoadingRadar(false);
      });

    if (selectedCountry !== 'global') {
      fetch(`/api/sync-rankings?location=${selectedCountry}`, { next: { revalidate: 3600 } })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.ranks) { setLocalRanks(data.ranks); }
        })
        .catch((err) => console.warn('Rank synchronization check failed:', err));
    } else {
      setLocalRanks({});
    }
  }, [selectedCountry, initialRadarStats]);

  // ── Keyboard / scroll side-effects ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSite(null);
        setSelectedDetails(null);
        setShowAddCustomModal(false);
        setShowCompareModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedSite || showCompareModal || showAddCustomModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedSite, showCompareModal, showAddCustomModal]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleStar = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = watchlistIds.includes(siteId)
      ? watchlistIds.filter((id) => id !== siteId)
      : [...watchlistIds, siteId];
    setWatchlistIds(updated);
    localStorage.setItem('pulse_watchlist', JSON.stringify(updated));
  };

  const handleAddCustomSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteUrl) return;

    // Validate URL - normalise first then check it parses
    const rawUrl = newSiteUrl.startsWith('http') ? newSiteUrl : `https://${newSiteUrl}`;
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error();
    } catch {
      alert('Please enter a valid domain or URL (e.g. mywebsite.com)');
      return;
    }

    const numStr = newSiteBaseline.replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr) || 10;
    const isBillion = newSiteBaseline.toLowerCase().includes('b');
    const monthlyVisits = num * (isBillion ? 1_000_000_000 : 1_000_000);
    const calculatedRate = Math.max(1, Math.round(monthlyVisits / (30 * 24 * 3600)));
    const customId = `custom-${Date.now()}`;
    const newSite: SiteConfig = {
      id: customId,
      name: newSiteName,
      url: rawUrl,
      rank: dbSites.length > 0 ? dbSites.length + customSites.length + 1 : 104 + customSites.length,
      category: newSiteCategory,
      baseline: newSiteBaseline,
      // Store numeric value so comparisons work correctly (fixes the baselineRaw gap for custom sites)
      baselineRaw: monthlyVisits,
      rate: calculatedRate,
      logo: newSiteName.charAt(0).toUpperCase(),
      color: newSiteColor,
      glow: `${newSiteColor}26`,
      progress: Math.min(100, (calculatedRate / (dbSites[0]?.rate || 35198)) * 100),
    };
    const updated = [...customSites, newSite];
    setCustomSites(updated);
    localStorage.setItem('pulse_custom_sites', JSON.stringify(updated));
    setNewSiteName('');
    setNewSiteUrl('');
    setShowAddCustomModal(false);
  };

  const handleSiteClick = (site: SiteConfig) => {
    if (compareModeActive) {
      setSelectedCompareIds((prev) => {
        const isSelected = prev.includes(site.id);
        if (isSelected) return prev.filter((id) => id !== site.id);
        if (prev.length < 2) return [...prev, site.id];
        return [prev[1], site.id];
      });
      return;
    }
    setSelectedSite(site);
    const defaultDetails = getSiteDetails(site);
    setSelectedDetails(defaultDetails);

    if (isSupabaseConfigured) {
      supabase
        .from('traffic_history')
        .select('visits_percentage')
        .eq('site_id', site.id)
        .order('timestamp', { ascending: true })
        .limit(24)
        .then((res: any) => {
          const data = res.data;
          if (data && data.length > 0) {
            const mappedHistory = data.map((item: any) => Number(item.visits_percentage));
            setSelectedDetails((prev) => prev ? { ...prev, trafficHistory: mappedHistory } : null);
          }
        });

      supabase
        .from('sites')
        .select('keywords')
        .eq('id', site.id)
        .single()
        .then((res: any) => {
          if (res?.data?.keywords?.length > 0) {
            setSelectedDetails((prev) => prev ? { ...prev, keywords: res.data.keywords } : null);
          }
        });
    }

    // ── Cloudflare Radar: real geographies, device split, traffic curve ──
    const primaryAsn = site.asn?.[0];
    if (primaryAsn) {
      fetch(`/api/radar-site?asn=${primaryAsn}`, { next: { revalidate: 3600 } } as any)
        .then((r) => r.json())
        .then((data) => {
          if (!data || data.source === 'unavailable') return;
          setSelectedDetails((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              ...(data.geographies?.length > 0 && { geographies: data.geographies }),
              ...(data.deviceType && {
                desktopShare: data.deviceType.desktop,
                mobileShare: data.deviceType.mobile,
              }),
              ...(data.trafficHistory?.length === 24 && { trafficHistory: data.trafficHistory }),
              radarSource: 'cloudflare',
            };
          });
        })
        .catch(() => {
          // Silent fallback - seeded estimates remain
        });
    }
  };

  const toggleCompareSelect = (siteId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      if (selectedCompareIds.length < 2) {
        setSelectedCompareIds([...selectedCompareIds, siteId]);
      } else {
        setSelectedCompareIds([selectedCompareIds[1], siteId]);
      }
    } else {
      setSelectedCompareIds(selectedCompareIds.filter((id) => id !== siteId));
    }
  };

  // ── Derived Data ──────────────────────────────────────────────────────────
  const allSites = useMemo(() => {
    // Prefer Supabase-fetched rows; fall back to server-side initialSites (also live).
    // Never fall back to the static SITES array, which may have stale rank/baseline.
    const baseSites = dbSites.length > 0 ? dbSites : initialSites;

    const merged = [...baseSites, ...customSites];
    if (selectedCountry !== 'global' && Object.keys(localRanks).length > 0) {
      return merged.map((site) => {
        const countryRank = localRanks[site.id];
        return countryRank !== undefined ? { ...site, rank: countryRank } : site;
      });
    }
    return merged;
  }, [dbSites, customSites, selectedCountry, localRanks]);

  const filteredSites = useMemo(() => {
    return allSites
      .filter((site) => {
        const matchesCategory = activeCategory === 'all' || site.category === activeCategory;
        const matchesSearch =
          searchQuery === '' ||
          site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesWatchlist = !watchlistFilter || watchlistIds.includes(site.id);
        const monthlyVisits = site.rate * 86400 * 30.4;
        let matchesTraffic = true;
        if (trafficTierFilter === 'enterprise') matchesTraffic = monthlyVisits >= 500_000_000;
        else if (trafficTierFilter === 'midmarket') matchesTraffic = monthlyVisits >= 50_000_000 && monthlyVisits < 500_000_000;
        else if (trafficTierFilter === 'growth') matchesTraffic = monthlyVisits < 50_000_000;
        return matchesCategory && matchesSearch && matchesWatchlist && matchesTraffic;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'rank') comparison = a.rank - b.rank;
        else if (sortBy === 'rate') comparison = b.rate - a.rate;
        else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [allSites, activeCategory, searchQuery, watchlistFilter, watchlistIds, trafficTierFilter, sortBy, sortOrder]);

  const analyticsStats = useMemo(() => {
    const count = filteredSites.length;
    if (count === 0) return { totalRate: 0, avgRank: 0, categoryCounts: {} as Record<string, number> };
    let totalRate = 0;
    const categoryCounts: Record<string, number> = {};

    // Collect valid ranks only (exclude sentinel fallback values like 999/9999)
    const validRanks: number[] = [];
    filteredSites.forEach((s) => {
      totalRate += s.rate;
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      if (s.rank > 0 && s.rank <= 500) validRanks.push(s.rank);
    });

    // Use median rank - meaningful for a ranked list and immune to outliers
    let medianRank = 0;
    if (validRanks.length > 0) {
      const sorted = [...validRanks].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      medianRank = sorted.length % 2 !== 0
        ? sorted[mid]
        : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }

    return { totalRate, avgRank: medianRank, categoryCounts };
  }, [filteredSites]);

  const displayedSites = useMemo(() => filteredSites.slice(0, visibleCount), [filteredSites, visibleCount]);

  const compareSiteA = useMemo(() => allSites.find((s) => s.id === selectedCompareIds[0]) || null, [selectedCompareIds, allSites]);
  const compareSiteB = useMemo(() => allSites.find((s) => s.id === selectedCompareIds[1]) || null, [selectedCompareIds, allSites]);

  // ── Infinite scroll (placed after filteredSites is declared) ──────────────
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 30, filteredSites.length));
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(loadMoreRef.current);
    return () => { observer.disconnect(); };
  }, [filteredSites.length, visibleCount]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative bg-[#02020a] text-white font-sans flex flex-col items-center overflow-x-hidden">
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />

      <MarqueeBanner items={marqueeItems} />

      <NavHeader />

      <Header pageLoadTime={pageLoadTimeRef.current} />

      <main className="main-content relative z-10 w-full max-w-[1200px] px-6 pb-8 flex flex-col items-center">
        <DashboardConsole
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setVisibleCount(30); }}
          selectedCountry={selectedCountry}
          onCountryChange={(c) => { setSelectedCountry(c); setVisibleCount(30); }}
          watchlistFilter={watchlistFilter}
          onWatchlistFilterChange={setWatchlistFilter}
          watchlistCount={watchlistIds.length}
          viewLayout={viewLayout}
          onViewLayoutChange={setViewLayout}
          compareModeActive={compareModeActive}
          onToggleCompareMode={() => { setCompareModeActive(!compareModeActive); setSelectedCompareIds([]); }}
          showAnalyticsPanel={showAnalyticsPanel}
          onToggleAnalyticsPanel={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
          onShowAddCustomModal={() => setShowAddCustomModal(true)}
          activeCategory={activeCategory}
          onCategoryChange={(id) => { setActiveCategory(id); setVisibleCount(30); }}
          filteredSites={filteredSites}
          lastSynced={lastSynced}
        />

        {showAnalyticsPanel && (
          <AnalyticsPanel
            analyticsStats={analyticsStats}
            filteredCount={filteredSites.length}
            radarStats={radarStats}
            loadingRadar={loadingRadar}
            selectedCountry={selectedCountry}
            trafficTierFilter={trafficTierFilter}
            onTrafficTierChange={setTrafficTierFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        )}

        <SiteGrid
          displayedSites={displayedSites}
          viewLayout={viewLayout}
          isMounted={isMounted}
          pageLoadTime={pageLoadTimeRef.current}
          sitesWithIncidents={sitesWithIncidents}
          watchlistIds={watchlistIds}
          compareModeActive={compareModeActive}
          selectedCompareIds={selectedCompareIds}
          watchlistFilter={watchlistFilter}
          onSiteClick={handleSiteClick}
          onToggleStar={toggleStar}
          onToggleCompareSelect={toggleCompareSelect}
          onShowAddCustomModal={() => setShowAddCustomModal(true)}
          getRankChange={getRankChange}
          filteredCount={filteredSites.length}
          visibleCount={visibleCount}
          loadMoreRef={loadMoreRef}
          onResetFilters={() => { setSearchQuery(''); setActiveCategory('all'); setWatchlistFilter(false); setVisibleCount(30); }}
        />

        <section className="insights-section mt-12 w-full">
          <div className="insights-card">
            <h3>RealTime Internet Dynamics</h3>
            <p>
              In the span of seconds you spend on this dashboard, millions of internet requests are dispatched worldwide.
              Google dominates search gateway traffic, YouTube handles staggering video data volumes, and platforms like
              ChatGPT represent the rapid growth of conversational AI platforms.
            </p>
            <div className="fun-fact">
              
              <p>
                <strong>Internet Velocity:</strong> By the time you read this sentence, over 4.5 million videos have been streamed, 600,000 queries entered on Google, and 250 million emails dispatched globally.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating comparison bar */}
      {compareModeActive && selectedCompareIds.length > 0 && (
        <div className="compare-bar-sticky flex-wrap justify-center gap-y-2 text-center">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>Ready to Battle:</span>
            <span className="bg-white/10 px-2 py-1 rounded text-xs text-[#82c8e5]">
              {compareSiteA?.name || 'Site A'} vs {compareSiteB?.name || 'Site B'}
            </span>
          </div>
          <button
            className="compare-bar-btn"
            disabled={selectedCompareIds.length < 2}
            onClick={() => setShowCompareModal(true)}
            style={{ opacity: selectedCompareIds.length === 2 ? 1 : 0.5 }}
          >
            Launch Battle
          </button>
        </div>
      )}

      {/* Site Detail Modal */}
      {selectedSite && selectedDetails && (
        <SiteDetailModal
          site={selectedSite}
          details={selectedDetails}
          pageLoadTime={pageLoadTimeRef.current}
          radarStats={radarStats}
          onClose={() => { setSelectedSite(null); setSelectedDetails(null); }}
        />
      )}

      {/* Compare Modal */}
      {showCompareModal && compareSiteA && compareSiteB && (
        <CompareModal
          siteA={compareSiteA}
          siteB={compareSiteB}
          onClose={() => { setShowCompareModal(false); setCompareModeActive(false); setSelectedCompareIds([]); }}
        />
      )}

      {/* Add Custom Domain Modal */}
      <AddCustomSiteModal
        show={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        newSiteName={newSiteName}
        onNameChange={setNewSiteName}
        newSiteUrl={newSiteUrl}
        onUrlChange={setNewSiteUrl}
        newSiteCategory={newSiteCategory}
        onCategoryChange={setNewSiteCategory}
        newSiteBaseline={newSiteBaseline}
        onBaselineChange={setNewSiteBaseline}
        newSiteColor={newSiteColor}
        onColorChange={setNewSiteColor}
        onSubmit={handleAddCustomSite}
      />


      <LegalModals
        showPrivacyModal={showPrivacyModal}
        showTermsModal={showTermsModal}
        showMethodologyModal={showMethodologyModal}
        onClosePrivacy={() => setShowPrivacyModal(false)}
        onCloseTerms={() => setShowTermsModal(false)}
        onCloseMethodology={() => setShowMethodologyModal(false)}
      />
    </div>
  );
}
