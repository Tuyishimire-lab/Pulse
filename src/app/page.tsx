'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SITES, CATEGORIES, SiteConfig } from './data/sites';
import { getSiteDetails, SiteDetails } from './data/details';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { STATIC_TRAFFIC_FACTS } from '../data/marquee';

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


/**
 * Returns default search topic labels for a site based on its category.
 * Exported so SiteDetailModal can consume it without circular deps.
 */
export function getMostSearchedTopics(site: { name: string; category: string }) {
  switch (site.category) {
    case 'search':       return ['Translate', 'Maps', 'Images', 'Scholar', 'Drive'];
    case 'social':       return ['Stories', 'Feed', 'Groups', 'Photos', 'Messenger'];
    case 'ai':           return ['API', 'Prompts', 'GPT-4', 'Custom GPTs', 'Pricing'];
    case 'ecommerce':
    case 'shopping':     return ['Prime', 'Deals', 'Tracking', 'Support', 'Shipping'];
    case 'dev':          return ['Docs', 'API', 'Tutorials', 'Libraries', 'GitHub'];
    case 'finance':      return ['Pricing', 'Stock Price', 'Payments', 'Calculator', 'Security'];
    case 'news':
    case 'media':        return ['Live Feed', 'Today', 'Opinion', 'Videos', 'Podcasts'];
    case 'reference':    return ['Definitions', 'History', 'Wiki', 'Facts', 'Citations'];
    case 'entertainment':return ['Stream', 'Trailer', 'Music', 'TV', 'Releases'];
    default:             return ['Website', 'Review', 'Support', 'API', 'Pricing'];
  }
}

export default function Home() {
  // ── UI State ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(30);
  const [isMounted, setIsMounted] = useState(false);

  // ── Site Selection ────────────────────────────────────────────────────────
  const [selectedSite, setSelectedSite] = useState<SiteConfig | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<SiteDetails | null>(null);

  // ── Supabase ──────────────────────────────────────────────────────────────
  const [dbSites, setDbSites] = useState<SiteConfig[]>([]);

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

  // ── Marquee ───────────────────────────────────────────────────────────────
  const [marqueeItems, setMarqueeItems] = useState<
    { text: string; type: string; asns?: number[]; locations?: string[] }[]
  >(STATIC_TRAFFIC_FACTS);

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

  // ── Cloudflare Radar ──────────────────────────────────────────────────────
  const [radarStats, setRadarStats] = useState<any>(null);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(true);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const loadMoreRef = useRef<HTMLDivElement>(null);
  /** Captured once on mount — never resets during re-renders */
  const pageLoadTimeRef = useRef<number>(Date.now());

  // ── Rank change helper ────────────────────────────────────────────────────
  const getRankChange = (site: SiteConfig) => {
    const staticSite = SITES.find((s) => s.id === site.id);
    if (!staticSite) return null;
    return staticSite.rank - site.rank;
  };

  // ── Incident detection from marquee ──────────────────────────────────────
  const sitesWithIncidents = useMemo(() => {
    const incidentIds = new Set<string>();
    const baseSites = dbSites.length > 0 ? dbSites : SITES;
    const allBaseSites = [...baseSites, ...customSites];

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

  // ── Supabase sites fetch + realtime ───────────────────────────────────────
  useEffect(() => {
    async function fetchSites() {
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('id, name, url, rank, category, baseline, rate, logo, color, glow, progress, asn, keywords')
          .order('rank', { ascending: true });

        if (error) {
          console.error('Error fetching sites from Supabase:', error);
          return;
        }
        if (data && data.length > 0) {
          setDbSites(data as SiteConfig[]);
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
      }
    }

    if (isSupabaseConfigured) {
      fetchSites();
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => {
          fetchSites();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  // ── Marquee cycling ───────────────────────────────────────────────────────
  useEffect(() => {
    // Fetch live marquee data on mount / country change
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
  }, [selectedCountry]);

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

  // Infinite scroll effect is declared after filteredSites (see below)

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
    const numStr = newSiteBaseline.replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr) || 10;
    const isBillion = newSiteBaseline.toLowerCase().includes('b');
    const monthlyVisits = num * (isBillion ? 1_000_000_000 : 1_000_000);
    const calculatedRate = Math.max(1, Math.round(monthlyVisits / (30 * 24 * 3600)));
    const customId = `custom-${Date.now()}`;
    const newSite: SiteConfig = {
      id: customId,
      name: newSiteName,
      url: newSiteUrl.startsWith('http') ? newSiteUrl : `https://${newSiteUrl}`,
      rank: SITES.length + customSites.length + 1,
      category: newSiteCategory,
      baseline: newSiteBaseline,
      rate: calculatedRate,
      logo: newSiteName.charAt(0).toUpperCase(),
      color: newSiteColor,
      glow: `${newSiteColor}26`,
      progress: Math.min(100, (calculatedRate / SITES[0].rate) * 100),
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
    // Only fires when the site has an ASN defined in sites.ts
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
              // Only replace if CF returned valid arrays/objects
              ...(data.geographies?.length > 0 && { geographies: data.geographies }),
              ...(data.deviceType && {
                desktopShare: data.deviceType.desktop,
                mobileShare: data.deviceType.mobile,
              }),
              ...(data.trafficHistory?.length === 24 && { trafficHistory: data.trafficHistory }),
              // Flag that this data came from Cloudflare Radar
              radarSource: 'cloudflare',
            };
          });
        })
        .catch(() => {
          // Silent fallback — seeded estimates remain
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
    const baseSites = dbSites.length > 0 ? dbSites : SITES;
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
    let rankSum = 0;
    const categoryCounts: Record<string, number> = {};
    filteredSites.forEach((s) => {
      totalRate += s.rate;
      rankSum += s.rank;
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
    return { totalRate, avgRank: Math.round(rankSum / count), categoryCounts };
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
