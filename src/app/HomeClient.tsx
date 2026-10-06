'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { SITE_META, SiteConfig } from './data/sites';

import { getSiteDetails, SiteDetails } from './data/details';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { STATIC_TRAFFIC_FACTS } from '../data/marquee';
import { RadarStatsData, MarqueeItem, SiteDbRow } from '../types/radar';
import { parseTrafficMetric } from '../lib/metrics';

// Components
import Header from './components/Header';
import MarqueeBanner from './components/MarqueeBanner';
import DashboardConsole from './components/DashboardConsole';
import AnalyticsPanel from './components/AnalyticsPanel';
import SiteGrid from './components/SiteGrid';
import TreemapView from './components/TreemapView';
import NavHeader from './components/NavHeader';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const SiteDetailModal = dynamic(() => import('./components/SiteDetailModal'), { ssr: false });
const AddCustomSiteModal = dynamic(() => import('./components/AddCustomSiteModal'), { ssr: false });
const LegalModals = dynamic(() => import('./components/LegalModals'), { ssr: false });
const CompareModal = dynamic(() => import('./components/CompareModal'), { ssr: false });
const EmbedWidgetModal = dynamic(() => import('./components/EmbedWidgetModal'), { ssr: false });

interface HomeClientProps {
  /** Sites pre-fetched from Supabase server-side (avoids client waterfall) */
  initialSites: SiteConfig[];
  /** Radar stats pre-fetched server-side */
  initialRadarStats: RadarStatsData | null;
  /** Marquee items pre-fetched server-side */
  initialMarquee: MarqueeItem[];
}

const emptySubscribe = () => () => {};

export default function HomeClient({
  initialSites,
  initialRadarStats,
  initialMarquee,
}: HomeClientProps) {
  // ── UI State ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list' | 'treemap'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 24;
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [pageLoadTime, setPageLoadTime] = useState<number>(0);

  // ── Site Selection ────────────────────────────────────────────────────────
  const [selectedSite, setSelectedSite] = useState<SiteConfig | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<SiteDetails | null>(null);

  // ── Supabase - seed with server-fetched data ──────────────────────────────
  const [dbSites, setDbSites] = useState<SiteConfig[]>(initialSites);
  // lastSynced is authoritative only from /api/health (reads sync_log written by cron).
  // Do NOT use sites[0].updated_at - that column changes on any Supabase write.
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // ── Watchlist & Channels ─────────────────────────────────────────────────
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<'all' | 'watchlist' | 'incidents'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const watchlistFilter = channelFilter === 'watchlist';

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
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>(
    initialMarquee.length > 0 ? initialMarquee : STATIC_TRAFFIC_FACTS
  );

  // ── Legal Modals ──────────────────────────────────────────────────────────
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  // ── Analytics / Filtering ─────────────────────────────────────────────────
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [trafficTierFilter, setTrafficTierFilter] = useState<'all' | 'enterprise' | 'midmarket' | 'growth'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'rate' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCountry, setSelectedCountry] = useState<string>('global');
  const [localRanks, setLocalRanks] = useState<Record<string, number>>({});

  // ── Cloudflare Radar - seed with server-fetched data ──────────────────────
  const [radarStats, setRadarStats] = useState<RadarStatsData | null>(initialRadarStats);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(!initialRadarStats);



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
  // ONLY flag sites whose own Statuspage API confirms a live incident.
  // We no longer keyword-match from HN/Reddit/CF Radar (those sources are
  // great for the scrolling news ticker but unreliable for per-site badges
  // (a week-old Reddit post mentioning "OpenAI" would create a false positive).
  const sitesWithIncidents = useMemo(() => {
    const incidentIds = new Set<string>();
    marqueeItems.forEach((item) => {
      if (item.confirmedSiteId) {
        incidentIds.add(item.confirmedSiteId);
      }
    });
    return incidentIds;
  }, [marqueeItems]);

  // ── Load persisted state on mount ─────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoadTime(Date.now());
      
      // Check for shareable ?watchlist=id1,id2 in URL query first
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlWatchlist = params.get('watchlist');
        if (urlWatchlist) {
          const ids = urlWatchlist.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
          if (ids.length > 0) {
            setWatchlistIds(ids);
            setChannelFilter('watchlist');
            localStorage.setItem('pulse_watchlist', JSON.stringify(ids));
            setToastMessage(`Loaded ${ids.length} sites from shared watchlist!`);
            setTimeout(() => setToastMessage(null), 4000);
            return;
          }
        }
      }

      const storedStars = localStorage.getItem('pulse_watchlist');
      if (storedStars) {
        try { setWatchlistIds(JSON.parse(storedStars)); } catch {}
      }
      const storedCustom = localStorage.getItem('pulse_custom_sites');
      if (storedCustom) {
        try { setCustomSites(JSON.parse(storedCustom)); } catch {}
      }
    }, 0);

    // Fetch authoritative last-sync timestamp from /api/health
    fetch('/api/health')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("API Error")))
      .then((data) => {
        if (data?.lastSyncedAt) setLastSynced(data.lastSyncedAt);
      })
      .catch(() => { /* non-fatal: badge stays hidden */ });

    return () => clearTimeout(timer);
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
          setDbSites((prev) => {
            const historyMap = new Map(prev.map((s) => [s.id, s.rank_history]));
            return (data as SiteDbRow[]).map((row) => ({
              ...(SITE_META[row.id] ?? {}),
              ...row,
              baselineRaw: row.baseline_raw ?? 0,
              rank_history: historyMap.get(row.id) ?? row.rank_history,
            })) as SiteConfig[];
          });
          // lastSynced intentionally NOT set here - use /api/health for that
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
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("API Error")))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMarqueeItems(data);
        }
      })
      .catch((err) => console.error('Error fetching live marquee updates:', err));
  }, [selectedCountry]);

  // ── Cloudflare Radar stats ────────────────────────────────────────────────
  useEffect(() => {
    // Skip initial global fetch if we already have server-side data
    if (selectedCountry === 'global' && initialRadarStats) {
      return;
    }

    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) setLoadingRadar(true);
    }, 0);

    fetch(
      `/api/radar-stats${selectedCountry !== 'global' ? `?location=${selectedCountry}` : ''}`,
    )
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("API Error")))
      .then((data) => {
        if (ignore) return;
        if (data && data.success) { setRadarStats(data); }
        setLoadingRadar(false);
      })
      .catch((err) => {
        if (ignore) return;
        console.error('Error fetching Cloudflare Radar stats:', err);
        setLoadingRadar(false);
      });

    if (selectedCountry !== 'global') {
      fetch(`/api/sync-rankings?location=${selectedCountry}`, { next: { revalidate: 3600 } })
        .then((res) => res.ok ? res.json() : Promise.reject(new Error("API Error")))
        .then((data) => {
          if (ignore) return;
          if (data && data.success && data.ranks) { setLocalRanks(data.ranks); }
        })
        .catch((err) => console.warn('Rank synchronization check failed:', err));
    }

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
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

  const handleShareWatchlist = () => {
    if (watchlistIds.length === 0) return;
    const shareUrl = `${window.location.origin}/?watchlist=${watchlistIds.join(',')}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setToastMessage('Watchlist link copied to clipboard!');
        setTimeout(() => setToastMessage(null), 3500);
      }).catch(() => {
        prompt('Copy your watchlist link:', shareUrl);
      });
    } else {
      prompt('Copy your watchlist link:', shareUrl);
    }
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

    const monthlyVisits = parseTrafficMetric(newSiteBaseline, 1500);
    const calculatedRate = Math.max(0, Math.round(monthlyVisits / (30 * 24 * 3600)));
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
        .then((res: { data: { visits_percentage: number | string }[] | null }) => {
          const data = res.data;
          if (data && data.length > 0) {
            const mappedHistory = data.map((item) => Number(item.visits_percentage));
            setSelectedDetails((prev) => prev ? { ...prev, trafficHistory: mappedHistory } : null);
          }
        });

      supabase
        .from('sites')
        .select('keywords')
        .eq('id', site.id)
        .single()
        .then((res: { data: { keywords: string[] } | null }) => {
          const kw = res?.data?.keywords;
          if (kw && kw.length > 0) {
            setSelectedDetails((prev) => prev ? { ...prev, keywords: kw } : null);
          }
        });

      if (!site.rank_history || site.rank_history.length < 2) {
        supabase
          .from('weekly_snapshots')
          .select('snapshot_date, sites_data')
          .order('snapshot_date', { ascending: true })
          .then(
            (res: { data: { snapshot_date: string; sites_data: { id: string; rank: number }[] }[] | null }) => {
              if (res.data && res.data.length > 0) {
                const hist: { rank: number; date: string }[] = [];
                for (const snap of res.data) {
                  const dateStr = snap.snapshot_date ? snap.snapshot_date.split('T')[0] : '';
                  if (Array.isArray(snap.sites_data)) {
                    const item = snap.sites_data.find((s) => s && s.id === site.id);
                    if (item && typeof item.rank === 'number') {
                      hist.push({ rank: item.rank, date: dateStr });
                    }
                  }
                }
                if (hist.length >= 2) {
                  setSelectedSite((curr) => curr && curr.id === site.id ? { ...curr, rank_history: hist } : curr);
                }
              }
            },
            () => {},
          );
      }
    }

    // ── Cloudflare Radar: real geographies, device split, traffic curve ──
    const primaryAsn = site.asn?.[0];
    if (primaryAsn) {
      fetch(`/api/radar-site?asn=${primaryAsn}`)
        .then((r) => r.ok ? r.json() : Promise.reject(new Error("API Error")))
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
  }, [dbSites, customSites, selectedCountry, localRanks, initialSites]);

  const filteredSites = useMemo(() => {
    return allSites
      .filter((site) => {
        const matchesCategory = activeCategory === 'all' || site.category === activeCategory;
        const matchesSearch =
          searchQuery === '' ||
          site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChannel =
          channelFilter === 'all'
            ? true
            : channelFilter === 'watchlist'
            ? watchlistIds.includes(site.id)
            : sitesWithIncidents.has(site.id);
        const monthlyVisits = site.rate * 86400 * 30.4;
        let matchesTraffic = true;
        if (trafficTierFilter === 'enterprise') matchesTraffic = monthlyVisits >= 500_000_000;
        else if (trafficTierFilter === 'midmarket') matchesTraffic = monthlyVisits >= 50_000_000 && monthlyVisits < 500_000_000;
        else if (trafficTierFilter === 'growth') matchesTraffic = monthlyVisits < 50_000_000;
        return matchesCategory && matchesSearch && matchesChannel && matchesTraffic;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'rank') comparison = a.rank - b.rank;
        else if (sortBy === 'rate') comparison = b.rate - a.rate;
        else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [allSites, activeCategory, searchQuery, channelFilter, watchlistIds, sitesWithIncidents, trafficTierFilter, sortBy, sortOrder]);

  const analyticsStats = useMemo(() => {
    const count = filteredSites.length;
    if (count === 0) return { totalRate: 0, enterpriseShare: 0, categoryCounts: {} as Record<string, number> };

    let totalRate = 0;
    let enterpriseVolume = 0;
    let totalVolume = 0;
    const categoryCounts: Record<string, number> = {};

    // Enterprise threshold matches the Traffic Tier Filter dropdown: > 500M/mo.
    // Enterprise share = what fraction of aggregate estimated monthly visits
    // comes from top-tier platforms. Always changes when filters are applied.
    const ENTERPRISE_THRESHOLD = 500_000_000;

    filteredSites.forEach((s) => {
      totalRate += s.rate;
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      totalVolume += s.baselineRaw;
      if (s.baselineRaw > ENTERPRISE_THRESHOLD) enterpriseVolume += s.baselineRaw;
    });

    const enterpriseShare = totalVolume > 0
      ? Math.round((enterpriseVolume / totalVolume) * 100)
      : 0;

    return { totalRate, enterpriseShare, categoryCounts };
  }, [filteredSites]);

  const totalPages = Math.max(1, Math.ceil(filteredSites.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const displayedSites = useMemo(
    () => filteredSites.slice(startIndex, endIndex),
    [filteredSites, startIndex, endIndex],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const consoleElem = document.querySelector('.dashboard-console');
    if (consoleElem) {
      consoleElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * displayRankMap: maps siteId -> 1-based position within filteredSites.
   * Only computed when a filter is actually active so the global catalog view
   * keeps showing global ranks (RANK #1, #2, …) unchanged.
   * When a filter is active, SiteGrid uses these positions instead of site.rank
   * to eliminate rank gaps (e.g. "#15 → #18" when #16 and #17 are filtered out).
   */
  const isFiltered = useMemo(
    () =>
      activeCategory !== 'all' ||
      searchQuery !== '' ||
      trafficTierFilter !== 'all' ||
      channelFilter !== 'all' ||
      selectedCountry !== 'global',
    [activeCategory, searchQuery, trafficTierFilter, channelFilter, selectedCountry],
  );

  const displayRankMap = useMemo<Record<string, number> | undefined>(() => {
    if (!isFiltered) return undefined; // global view: use site.rank directly
    return Object.fromEntries(filteredSites.map((site, idx) => [site.id, idx + 1]));
  }, [isFiltered, filteredSites]);

  const compareSiteA = useMemo(() => allSites.find((s) => s.id === selectedCompareIds[0]) || null, [selectedCompareIds, allSites]);
  const compareSiteB = useMemo(() => allSites.find((s) => s.id === selectedCompareIds[1]) || null, [selectedCompareIds, allSites]);

  const handleAnalyzeDomain = (rawInput: string) => {
    const cleaned = rawInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
    if (!cleaned) return;

    // Check if domain exists in allSites
    const matched = allSites.find(
      (s) =>
        s.id === cleaned ||
        s.url.toLowerCase().includes(cleaned) ||
        s.name.toLowerCase() === cleaned
    );

    if (matched) {
      handleSiteClick(matched);
      return;
    }

    // Pre-populate AddCustomSiteModal and open it
    const domainPrefix = cleaned.split('.')[0];
    const formattedName = domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1);
    setNewSiteUrl(`https://${cleaned}`);
    setNewSiteName(formattedName);
    setShowAddCustomModal(true);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSubmit = newsletterEmail.trim();
    if (!emailToSubmit || isSubmittingNewsletter) return;

    setIsSubmittingNewsletter(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSubmit, source: 'landing_page' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(data.message || 'Subscribed to Pulse Weekly Traffic Digest.');
        setNewsletterEmail('');
      } else {
        setToastMessage(data.error || data.message || 'Could not complete subscription. Please try again.');
      }
    } catch {
      setToastMessage('Network error. Please try again later.');
    } finally {
      setIsSubmittingNewsletter(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Keep pagination within valid bounds if filters change
  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(1);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative bg-[#02020a] text-white font-sans flex flex-col items-center overflow-x-hidden">
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />

      <MarqueeBanner items={marqueeItems} />

      <NavHeader />

      <Header pageLoadTime={pageLoadTime} onAnalyzeDomain={handleAnalyzeDomain} />

      <main className="main-content relative z-10 w-full max-w-[1200px] px-6 pb-8 flex flex-col items-center">
        <DashboardConsole
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          selectedCountry={selectedCountry}
          onCountryChange={(c) => { setSelectedCountry(c); if (c === 'global') setLocalRanks({}); setCurrentPage(1); }}
          channelFilter={channelFilter}
          onChannelFilterChange={(f) => { setChannelFilter(f); setCurrentPage(1); }}
          watchlistFilter={watchlistFilter}
          onWatchlistFilterChange={(v) => { setChannelFilter(v ? 'watchlist' : 'all'); setCurrentPage(1); }}
          watchlistCount={watchlistIds.length}
          incidentCount={sitesWithIncidents.size}
          onShareWatchlist={handleShareWatchlist}
          viewLayout={viewLayout}
          onViewLayoutChange={setViewLayout}
          compareModeActive={compareModeActive}
          onToggleCompareMode={() => { setCompareModeActive(!compareModeActive); setSelectedCompareIds([]); }}
          showAnalyticsPanel={showAnalyticsPanel}
          onToggleAnalyticsPanel={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
          onShowAddCustomModal={() => setShowAddCustomModal(true)}
          activeCategory={activeCategory}
          onCategoryChange={(id) => { setActiveCategory(id); setCurrentPage(1); }}
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
            onTrafficTierChange={(t) => { setTrafficTierFilter(t); setCurrentPage(1); }}
            sortBy={sortBy}
            onSortByChange={(s) => { setSortBy(s); setCurrentPage(1); }}
            sortOrder={sortOrder}
            onSortOrderChange={(o) => { setSortOrder(o); setCurrentPage(1); }}
          />
        )}

        {viewLayout === 'treemap' ? (
          <TreemapView
            sites={filteredSites}
            onSiteClick={handleSiteClick}
            getRankChange={getRankChange}
            activeCategory={activeCategory}
            onCategoryChange={(id) => { setActiveCategory(id); setCurrentPage(1); }}
            onViewLayoutChange={setViewLayout}
          />
        ) : (
          <SiteGrid
            displayedSites={displayedSites}
            viewLayout={viewLayout}
            isMounted={isMounted}
            pageLoadTime={pageLoadTime}
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
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredSites.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onResetFilters={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setChannelFilter('all');
              setTrafficTierFilter('all');
              setCurrentPage(1);
            }}
            displayRankMap={displayRankMap}
          />
        )}

        {/* Live Badge and Widget Virality Callout */}
        <div className="w-full mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.03] via-white/[0.05] to-white/[0.02] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col gap-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center justify-center md:justify-start gap-2 text-[#82c8e5] text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#82c8e5]" />
              <span>Embeddable Traffic Intelligence</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Add Live Traffic Badges to Your Website or README
            </h3>
            <p className="text-sm text-[#8da0b5] leading-relaxed">
              Showcase your verified rank, real-time visitor velocity, and baseline metrics directly on your GitHub repository, landing page, or documentation in seconds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => setShowEmbedModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#82c8e5] hover:bg-[#a1daf1] text-[#02020a] font-bold text-xs transition-all shadow-lg text-center"
            >
              Get Live Badge Code
            </button>
            <Link
              href="/compare"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-xs transition-all text-center"
            >
              Explore Compare Pairs
            </Link>
          </div>
        </div>

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

        {/* Weekly Digest Newsletter Card */}
        <div className="w-full mt-6 rounded-2xl border border-white/10 bg-[#080d1a]/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-1.5 text-center md:text-left max-w-lg">
            <h4 className="text-lg font-bold text-white tracking-tight">
              Pulse Weekly Traffic Intelligence Digest
            </h4>
            <p className="text-xs sm:text-sm text-[#8da0b5] leading-relaxed">
              Get an automated breakdown of the top 10 surging and cooling global domains delivered to your inbox every Monday morning.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 w-full md:max-w-md">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your work email..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder-[#5a6f84] focus:outline-none focus:border-[#82c8e5]"
            />
            <button
              type="submit"
              disabled={isSubmittingNewsletter}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-[#02020a] font-bold text-xs transition-all shadow-md"
            >
              {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
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
          pageLoadTime={pageLoadTime}
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

      {/* Embed Live Traffic Badge Modal */}
      {showEmbedModal && (
        <EmbedWidgetModal
          site={selectedSite || allSites[0] || initialSites[0]}
          isOpen={showEmbedModal}
          onClose={() => setShowEmbedModal(false)}
        />
      )}

      <LegalModals
        showPrivacyModal={showPrivacyModal}
        showTermsModal={showTermsModal}
        showMethodologyModal={showMethodologyModal}
        onClosePrivacy={() => setShowPrivacyModal(false)}
        onCloseTerms={() => setShowTermsModal(false)}
        onCloseMethodology={() => setShowMethodologyModal(false)}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#82c8e5]/40 text-white text-xs font-semibold shadow-2xl animate-fadeIn flex items-center gap-2">
          <span className="text-emerald-400 font-bold">[OK]</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
