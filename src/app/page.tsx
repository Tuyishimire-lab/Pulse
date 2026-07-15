'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITES, CATEGORIES, SiteConfig } from './data/sites';
import { getSiteDetails, SiteDetails } from './data/details';
import CompareModal from './components/CompareModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Reusable Favicon Component with Letter Fallback
function FaviconImage({ url, logo, color }: { url: string; logo: string; color: string }) {
  const [error, setError] = useState(false);
  const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

  if (error) {
    return (
      <span
        style={{
          color: color === '#ffffff' ? '#111111' : '#ffffff',
          fontWeight: 800
        }}
      >
        {logo}
      </span>
    );
  }

  return (
    <Image
      src={faviconUrl}
      alt={`${logo} logo`}
      width={64}
      height={64}
      onError={() => setError(true)}
      className="w-full h-full object-contain p-1 rounded-full bg-white/10"
      unoptimized
    />
  );
}

// Helper to generate dynamic fallback search topics based on domain name & category
export function getMostSearchedTopics(site: { name: string; category: string }) {
  switch (site.category) {
    case 'search':
      return ["Translate", "Maps", "Images", "Scholar", "Drive"];
    case 'social':
      return ["Stories", "Feed", "Groups", "Photos", "Messenger"];
    case 'ai':
      return ["API", "Prompts", "GPT-4", "Custom GPTs", "Pricing"];
    case 'ecommerce':
    case 'shopping':
      return ["Prime", "Deals", "Tracking", "Support", "Shipping"];
    case 'dev':
      return ["Docs", "API", "Tutorials", "Libraries", "GitHub"];
    case 'finance':
      return ["Pricing", "Stock Price", "Payments", "Calculator", "Security"];
    case 'news':
    case 'media':
      return ["Live Feed", "Today", "Opinion", "Videos", "Podcasts"];
    case 'reference':
      return ["Definitions", "History", "Wiki", "Facts", "Citations"];
    case 'entertainment':
      return ["Stream", "Trailer", "Music", "TV", "Releases"];
    default:
      return ["Website", "Review", "Support", "API", "Pricing"];
  }
}

// Self-contained VisitsCounter Leaf Component (updates twice a second / 500ms)
function VisitsCounter({ rate, pageLoadTime }: { rate: number; pageLoadTime: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const elapsedSeconds = (Date.now() - pageLoadTime) / 1000;
    setCount(Math.floor(elapsedSeconds * rate));

    const interval = setInterval(() => {
      const elapsed = (Date.now() - pageLoadTime) / 1000;
      setCount(Math.floor(elapsed * rate));
    }, 500);

    return () => clearInterval(interval);
  }, [rate, pageLoadTime]);

  return <span>{count.toLocaleString('en-US')}</span>;
}

// Self-contained ElapsedTimer Leaf Component (updates once a second / 1000ms)
function ElapsedTimer({ pageLoadTime }: { pageLoadTime: number }) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const updateTimer = () => {
      const totalSecs = Math.floor((Date.now() - pageLoadTime) / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      setElapsed(
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0')
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [pageLoadTime]);

  return <div>{elapsed}</div>;
}


const MARQUEE_NEWS = [
  { text: "Meta Platforms outage reports drop traffic splits temporarily; Naver search spikes.", type: "outage" },
  { text: "Claude.ai estimated monthly traffic surges by 18% following latest model release.", type: "surge" },
  { text: "OpenAI developer portal experiences high volume; ChatGPT API requests hit new peaks.", type: "surge" },
  { text: "Vercel and Netlify report surge in serverless edge requests globally.", type: "surge" },
  { text: "AWS Cloudfront edge routing issues reported: minor regional traffic shifts.", type: "outage" }
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(30);
  const [isMounted, setIsMounted] = useState(false);

  // Modal selection state
  const [selectedSite, setSelectedSite] = useState<SiteConfig | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<SiteDetails | null>(null);

  // Supabase states
  const [dbSites, setDbSites] = useState<SiteConfig[]>([]);

  // Watchlist Bookmarks
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [watchlistFilter, setWatchlistFilter] = useState<boolean>(false);

  // Custom Domain addition
  const [customSites, setCustomSites] = useState<SiteConfig[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('dev');
  const [newSiteBaseline, setNewSiteBaseline] = useState('10M / mo');
  const [newSiteColor, setNewSiteColor] = useState('#0047ab');

  // Compare Mode
  const [compareModeActive, setCompareModeActive] = useState<boolean>(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);



  // Live News Marquee Current Headline
  const [marqueeIndex, setMarqueeIndex] = useState(0);
  const [marqueeItems, setMarqueeItems] = useState<{ text: string; type: string; asns?: number[]; locations?: string[] }[]>(MARQUEE_NEWS);

  // Legal Modal States
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Advanced Filtering and Analytics States
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(true);
  const [trafficTierFilter, setTrafficTierFilter] = useState<'all' | 'enterprise' | 'midmarket' | 'growth'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'rate' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Cloudflare Radar Stats State
  const [radarStats, setRadarStats] = useState<any>(null);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(true);

  // Helper to calculate rank change against static baseline
  const getRankChange = (site: SiteConfig) => {
    const staticSite = SITES.find(s => s.id === site.id);
    if (!staticSite) return null;
    return staticSite.rank - site.rank; // positive value means rank improved (closer to #1)
  };

  // Memoized set of site IDs with active outages matching ASNs or brand names in ticker
  const sitesWithIncidents = useMemo(() => {
    const incidentIds = new Set<string>();
    const baseSites = dbSites.length > 0 ? dbSites : SITES;
    const allBaseSites = [...baseSites, ...customSites];

    marqueeItems.forEach((item) => {
      if (item.type !== 'outage') return;

      const itemAsns = item.asns;
      allBaseSites.forEach((site) => {
        // 1. Check ASN match
        const hasAsnMatch = site.asn && Array.isArray(itemAsns) &&
          site.asn.some((asn) => itemAsns.includes(asn));

        // 2. Check brand name or ID keyword match
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

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Capture landing timestamp so counters never reset during state changes
  const pageLoadTimeRef = useRef<number>(Date.now());


  // Load watchlist & custom domains on mount
  useEffect(() => {
    setIsMounted(true);
    const storedStars = localStorage.getItem('pulse_watchlist');
    if (storedStars) {
      try { setWatchlistIds(JSON.parse(storedStars)); } catch (e) {}
    }
    const storedCustom = localStorage.getItem('pulse_custom_sites');
    if (storedCustom) {
      try { setCustomSites(JSON.parse(storedCustom)); } catch (e) {}
    }
  }, []);

  // Fetch sites and handle Realtime subscriptions
  useEffect(() => {
    async function fetchSites() {
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('*')
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

      // Subscribe to real-time changes on the sites table
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sites' },
          () => {
            fetchSites();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Marquee cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueeIndex((prev) => (prev + 1) % marqueeItems.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [marqueeItems.length]);

  // Fetch live updates marquee on mount
  useEffect(() => {
    fetch('/api/marquee?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMarqueeItems(data);
        }
      })
      .catch((err) => console.error('Error fetching live marquee updates:', err));
  }, []);

  // Fetch Cloudflare Radar Global Traffic Statistics on mount
  useEffect(() => {
    setLoadingRadar(true);
    fetch('/api/radar-stats?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setRadarStats(data);
        }
        setLoadingRadar(false);
      })
      .catch((err) => {
        console.error('Error fetching Cloudflare Radar stats:', err);
        setLoadingRadar(false);
      });

    // Proactively request a rank synchronization check in the background
    fetch('/api/sync-rankings?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.syncedCount > 0) {
          console.log(`Synchronized ${data.syncedCount} domain rankings with Cloudflare Radar.`);
        }
      })
      .catch((err) => console.warn('Rank synchronization check failed:', err));
  }, []);

  const toggleStar = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = watchlistIds.includes(siteId)
      ? watchlistIds.filter(id => id !== siteId)
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
    const monthlyVisits = num * (isBillion ? 1000000000 : 1000000);
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
      progress: Math.min(100, (calculatedRate / SITES[0].rate) * 100)
    };

    const updated = [...customSites, newSite];
    setCustomSites(updated);
    localStorage.setItem('pulse_custom_sites', JSON.stringify(updated));

    // Reset fields
    setNewSiteName('');
    setNewSiteUrl('');
    setShowAddCustomModal(false);
  };



  // Merge datasets, prioritizing database sites if available, falling back to static mock data
  const allSites = useMemo(() => {
    const baseSites = dbSites.length > 0 ? dbSites : SITES;
    return [...baseSites, ...customSites];
  }, [dbSites, customSites]);

  // Filter and sort sites based on category, search, watchlist, traffic tier, and sorting preferences
  const filteredSites = useMemo(() => {
    return allSites.filter((site) => {
      const matchesCategory = activeCategory === 'all' || site.category === activeCategory;
      const matchesSearch = searchQuery === '' ||
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWatchlist = !watchlistFilter || watchlistIds.includes(site.id);
      
      // Calculate monthly volume (rate is visits/sec)
      const monthlyVisits = site.rate * 86400 * 30.4;
      let matchesTraffic = true;
      if (trafficTierFilter === 'enterprise') {
        matchesTraffic = monthlyVisits >= 500000000;
      } else if (trafficTierFilter === 'midmarket') {
        matchesTraffic = monthlyVisits >= 50000000 && monthlyVisits < 500000000;
      } else if (trafficTierFilter === 'growth') {
        matchesTraffic = monthlyVisits < 50000000;
      }

      return matchesCategory && matchesSearch && matchesWatchlist && matchesTraffic;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rank') {
        comparison = a.rank - b.rank;
      } else if (sortBy === 'rate') {
        comparison = b.rate - a.rate;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [allSites, activeCategory, searchQuery, watchlistFilter, watchlistIds, trafficTierFilter, sortBy, sortOrder]);

  // Compute aggregated real-time analytics for the currently filtered domains catalog
  const analyticsStats = useMemo(() => {
    const count = filteredSites.length;
    if (count === 0) {
      return { totalRate: 0, avgRank: 0, categoryCounts: {} as Record<string, number> };
    }
    let totalRate = 0;
    let rankSum = 0;
    const categoryCounts: Record<string, number> = {};

    filteredSites.forEach(s => {
      totalRate += s.rate;
      rankSum += s.rank;
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });

    return {
      totalRate,
      avgRank: Math.round(rankSum / count),
      categoryCounts
    };
  }, [filteredSites]);

  // Paginated/Sliced sites to display
  const displayedSites = useMemo(() => {
    return filteredSites.slice(0, visibleCount);
  }, [filteredSites, visibleCount]);

  // Build lookup rates map for animation ticker loop
  const siteRatesMap = useMemo(() => {
    const map: Record<string, number> = {};
    allSites.forEach((site) => {
      map[site.id] = site.rate;
    });
    return map;
  }, [allSites]);

  // Click handler to select a site card/row
  const handleSiteClick = (site: SiteConfig) => {
    if (compareModeActive) {
      setSelectedCompareIds((prev) => {
        const isSelected = prev.includes(site.id);
        if (isSelected) {
          return prev.filter((id) => id !== site.id);
        } else {
          if (prev.length < 2) {
            return [...prev, site.id];
          } else {
            return [prev[1], site.id];
          }
        }
      });
      return;
    }
    setSelectedSite(site);
    
    const defaultDetails = getSiteDetails(site);
    setSelectedDetails(defaultDetails);

    if (isSupabaseConfigured) {
      // 1. Fetch traffic history
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
            setSelectedDetails(prev => {
              if (!prev) return null;
              return {
                ...prev,
                trafficHistory: mappedHistory
              };
            });
          }
        });

      // 2. Fetch keywords
      supabase
        .from('sites')
        .select('keywords')
        .eq('id', site.id)
        .single()
        .then((res: any) => {
          if (res && res.data && Array.isArray(res.data.keywords) && res.data.keywords.length > 0) {
            setSelectedDetails(prev => {
              if (!prev) return null;
              return {
                ...prev,
                keywords: res.data.keywords
              };
            });
          }
        });
    }
  };

  // Keyboard Escape listener to close modal
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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedSite || showCompareModal || showAddCustomModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedSite, showCompareModal, showAddCustomModal]);



  // Intersection Observer for Infinite Scroll Loading
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const loadMoreObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 30, filteredSites.length));
      }
    }, {
      rootMargin: '200px'
    });

    loadMoreObserver.observe(loadMoreRef.current);

    return () => {
      loadMoreObserver.disconnect();
    };
  }, [filteredSites.length, visibleCount]);



  const toggleCompareSelect = (siteId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      if (selectedCompareIds.length < 2) {
        setSelectedCompareIds([...selectedCompareIds, siteId]);
      } else {
        setSelectedCompareIds([selectedCompareIds[1], siteId]);
      }
    } else {
      setSelectedCompareIds(selectedCompareIds.filter(id => id !== siteId));
    }
  };

  const compareSiteA = useMemo(() => {
    return allSites.find(s => s.id === selectedCompareIds[0]) || null;
  }, [selectedCompareIds, allSites]);

  const compareSiteB = useMemo(() => {
    return allSites.find(s => s.id === selectedCompareIds[1]) || null;
  }, [selectedCompareIds, allSites]);

  // SVG Chart calculation helpers
  const chartPoints = useMemo(() => {
    if (!selectedDetails) return [];
    const width = 580;
    const height = 110;
    const history = selectedDetails.trafficHistory;
    return history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - (val / 100) * 80 - 15;
      return { x, y, value: val, hour: idx };
    });
  }, [selectedDetails]);

  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
  }, [chartPoints]);

  const fillPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const start = `M 0 110`;
    const points = chartPoints.map(pt => `L ${pt.x} ${pt.y}`).join(' ');
    const end = `L 580 110 Z`;
    return `${start} ${points} ${end}`;
  }, [chartPoints]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#02020a] text-white font-sans flex flex-col items-center">
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />

      {/* 1. Live Outages and News Marquee Banner */}
      <div className="news-marquee-container relative z-20">
        <span className="news-marquee-badge">Live Updates</span>
        <div className="news-marquee-track-container">
          <div className="news-marquee-track">
            {marqueeItems.map((news, idx) => (
              <span key={idx} className="news-marquee-item">
                {news.type === 'outage' ? '⚠️' : news.type === 'surge' ? '📈' : news.type === 'news' ? '🔥' : '⚡'} {news.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="app-header relative z-10 flex flex-col items-center w-full max-w-[700px] text-center pt-8 pb-6 px-4">
        <div className="logo-area flex items-center gap-3 mb-2">
          <span className="pulse-dot" />
          <h1 className="m-0 text-[2.8rem] font-extrabold tracking-tight bg-gradient-to-r from-white to-[#82c8e5] bg-clip-text text-transparent">
            Pulse
          </h1>
        </div>
        <p className="subtitle text-[#6d8196] text-lg font-normal m-0 mb-4">
          Real Time Global Web Traffic Stream
        </p>

        <div className="timer-card">
          <span className="timer-label">TIME ELAPSED ON PAGE</span>
          <div className="timer-value">
            <ElapsedTimer pageLoadTime={pageLoadTimeRef.current} />
          </div>
        </div>
      </header>

      <main className="main-content relative z-10 flex-grow w-full max-w-[1200px] px-6 pb-16 flex flex-col items-center">
        {/* Unified Dashboard Control Console */}
        <div className="dashboard-console animate-fadeIn">
          {/* Top Row: Search & View Layout Toggling */}
          <div className="console-nav-row">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search top 100 domains..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(30);
                }}
                className="search-input"
              />
              <svg
                className="search-icon-svg"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setVisibleCount(30);
                  }}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="console-view-controls">
              <div className="segmented-tabs">
                <button 
                  className={`tab-item ${!watchlistFilter ? 'active' : ''}`}
                  onClick={() => setWatchlistFilter(false)}
                >
                  🌐 All Channels
                </button>
                <button 
                  className={`tab-item ${watchlistFilter ? 'active' : ''}`}
                  onClick={() => setWatchlistFilter(true)}
                >
                  ⭐ Watchlist ({watchlistIds.length})
                </button>
              </div>

              <div className="toggle-group">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`toggle-btn ${viewLayout === 'grid' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
                  </svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`toggle-btn ${viewLayout === 'list' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                  </svg>
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Tool Action Center */}
          <div className="console-toolbar-row">
            <button 
              className={`action-btn ${compareModeActive ? 'active' : ''}`}
              onClick={() => {
                setCompareModeActive(!compareModeActive);
                setSelectedCompareIds([]);
              }}
            >
              📊 Battle Compare {compareModeActive ? 'ON' : 'OFF'}
            </button>

            <button 
              className={`action-btn ${showAnalyticsPanel ? 'active' : ''}`}
              onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            >
              📈 Analytics Panel {showAnalyticsPanel ? 'ON' : 'OFF'}
            </button>
            
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => setShowAddCustomModal(true)}
            >
              ➕ Track Custom Domain
            </button>
          </div>

          {/* Bottom Row: Category Selection Pills */}
          <div className="filter-bar animate-fadeIn" role="tablist" aria-label="Website categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setVisibleCount(30);
                }}
                className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                role="tab"
                aria-selected={activeCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Advanced Analytics & Controls Deck */}
        {showAnalyticsPanel && (
          <div className="w-full mt-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md animate-fadeIn flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📈 Dashboard Analytics & Controls</span>
              </h3>
              <span className="text-xs text-[#82c8e5] bg-[#82c8e5]/10 px-2.5 py-1 rounded-full font-bold">
                {filteredSites.length} Channels Filtered
              </span>
            </div>

            {/* Split layout: Left is Local Catalog Stats + Filters, Right is Cloudflare Global Radar Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Local Catalog Stats + Filters */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Calculated summary stats card grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Combined Rate Velocity</span>
                    <div className="text-2xl font-extrabold text-[#82c8e5] mt-1">
                      ~{analyticsStats.totalRate.toLocaleString('en-US')} <span className="text-sm font-normal text-white/50">/ sec</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">Sum of live dispatch counters across all selected domains.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Avg Global Rank</span>
                    <div className="text-2xl font-extrabold text-[#a78bfa] mt-1">
                      #{analyticsStats.avgRank.toLocaleString('en-US')}
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">Average PageRank placement index in our active catalog.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Est. Monthly Volume</span>
                    <div className="text-2xl font-extrabold text-[#34d399] mt-1">
                      {((analyticsStats.totalRate * 86400 * 30.4) / 1000000000).toFixed(2)}B <span className="text-sm font-normal text-white/50">/ mo</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">Total estimated global monthly organic user visits.</p>
                  </div>
                </div>

                {/* Category Mix Breakdown bar */}
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                  <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Category Distribution Mix</span>
                  <div className="flex gap-1.5 h-3 rounded-full overflow-hidden mt-3 bg-white/5">
                    {Object.entries(analyticsStats.categoryCounts).map(([cat, count]) => {
                      const pct = Math.max(5, Math.round((count / filteredSites.length) * 100));
                      let color = '#3b82f6';
                      if (cat === 'dev') color = '#6366f1';
                      else if (cat === 'finance') color = '#10b981';
                      else if (cat === 'social') color = '#ec4899';
                      else if (cat === 'media') color = '#f59e0b';
                      else if (cat === 'shopping') color = '#a855f7';
                      
                      return (
                        <div 
                          key={cat} 
                          style={{ width: `${pct}%`, backgroundColor: color }} 
                          title={`${cat.toUpperCase()}: ${count} (${pct}%)`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] font-bold text-white/70">
                    {Object.entries(analyticsStats.categoryCounts).map(([cat, count]) => {
                      let color = '#3b82f6';
                      if (cat === 'dev') color = '#6366f1';
                      else if (cat === 'finance') color = '#10b981';
                      else if (cat === 'social') color = '#ec4899';
                      else if (cat === 'media') color = '#f59e0b';
                      else if (cat === 'shopping') color = '#a855f7';

                      return (
                        <div key={cat} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="uppercase">{cat}:</span>
                          <span className="text-white">{count} ({Math.round((count / filteredSites.length) * 100)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filtering parameters input selects */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Traffic Tier Filter</label>
                    <select 
                      className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#82c8e5]"
                      value={trafficTierFilter}
                      onChange={(e) => setTrafficTierFilter(e.target.value as any)}
                    >
                      <option value="all">🌐 All Tiers</option>
                      <option value="enterprise">🏢 Enterprise (&gt; 500M / mo)</option>
                      <option value="midmarket">💼 Mid-Market (50M - 500M / mo)</option>
                      <option value="growth">🚀 Growth (&lt; 50M / mo)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Sort Metric By</label>
                    <select 
                      className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#82c8e5]"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="rank">⭐ Global Rank</option>
                      <option value="rate">⚡ Live Dispatch Rate</option>
                      <option value="name">🔤 Brand Name</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Sort Order Direction</label>
                    <div className="segmented-tabs mt-0.5">
                      <button 
                        className={`tab-item text-xs py-1.5 ${sortOrder === 'asc' ? 'active' : ''}`}
                        onClick={() => setSortOrder('asc')}
                      >
                        Ascending ↑
                      </button>
                      <button 
                        className={`tab-item text-xs py-1.5 ${sortOrder === 'desc' ? 'active' : ''}`}
                        onClick={() => setSortOrder('desc')}
                      >
                        Descending ↓
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Global Radar Pulse Widget */}
              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.01] flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#82c8e5] uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#82c8e5] animate-pulse" />
                    Global Radar Traffic Pulse
                  </h4>
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                    {radarStats?.source === 'cloudflare' ? '⚡ Live' : '⚠️ Cached'}
                  </span>
                </div>

                {loadingRadar ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/50">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/40" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Syncing Cloudflare Radar...</span>
                  </div>
                ) : (
                  <>
                    {/* Device Share splits */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#6d8196] uppercase tracking-wider">Global Device Mix</span>
                        <span className="text-white">
                          📱 {radarStats?.deviceType?.mobile}% | 💻 {radarStats?.deviceType?.desktop}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-white/5 flex">
                        <div style={{ width: `${radarStats?.deviceType?.mobile}%`, backgroundColor: '#3b82f6' }} title={`Mobile: ${radarStats?.deviceType?.mobile}%`} />
                        <div style={{ width: `${radarStats?.deviceType?.desktop}%`, backgroundColor: '#a78bfa' }} title={`Desktop: ${radarStats?.deviceType?.desktop}%`} />
                        <div style={{ width: `${radarStats?.deviceType?.other}%`, backgroundColor: '#72777d' }} title={`Other: ${radarStats?.deviceType?.other}%`} />
                      </div>
                    </div>

                    {/* Protocol Split */}
                    <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#6d8196] uppercase tracking-wider">Protocol Adoption</span>
                        <span className="text-white">HTTP/3: {radarStats?.httpVersion?.http3}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-white/5 flex">
                        <div style={{ width: `${radarStats?.httpVersion?.http3}%`, backgroundColor: '#10b981' }} title={`HTTP/3: ${radarStats?.httpVersion?.http3}%`} />
                        <div style={{ width: `${radarStats?.httpVersion?.http2}%`, backgroundColor: '#f59e0b' }} title={`HTTP/2: ${radarStats?.httpVersion?.http2}%`} />
                        <div style={{ width: `${radarStats?.httpVersion?.http1}%`, backgroundColor: '#ef4444' }} title={`HTTP/1.x: ${radarStats?.httpVersion?.http1}%`} />
                      </div>
                    </div>

                    {/* Top Locations list */}
                    <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                      <span className="text-xs font-bold text-[#6d8196] uppercase tracking-wider">Top Client Locations</span>
                      <div className="flex flex-col gap-2 mt-1">
                        {radarStats?.topLocations?.map((loc: any, idx: number) => (
                          <div key={loc.location} className="flex justify-between items-center text-xs">
                            <span className="text-white/80 font-medium flex items-center gap-1.5">
                              <span className="text-[10px] text-white/40">#{idx + 1}</span>
                              {loc.name}
                            </span>
                            <span className="font-semibold text-[#82c8e5]">{loc.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Live Counters Presentation */}
        {viewLayout === 'grid' ? (
          <div className="counters-grid mt-4 w-full">
            {displayedSites.map((site) => (
              <div
                key={site.id}
                data-site-item="true"
                data-site-id={site.id}
                className={`card card-visible cursor-pointer ${sitesWithIncidents.has(site.id) ? 'card-incident animate-pulse' : ''}`}
                onClick={() => handleSiteClick(site)}
                style={{
                  ['--brand-color' as any]: site.color,
                  ['--brand-glow' as any]: site.glow,
                }}
              >
                <div className="card-header">
                  <div className="flex items-center gap-1.5">
                    <span className="rank-badge">RANK #{site.rank}</span>
                    {(() => {
                      const change = getRankChange(site);
                      if (change === null || change === 0) return null;
                      if (change > 0) {
                        return <span className="text-[10px] font-bold text-emerald-400">▲ +{change}</span>;
                      } else {
                        return <span className="text-[10px] font-bold text-rose-500">▼ {change}</span>;
                      }
                    })()}
                    {sitesWithIncidents.has(site.id) && (
                      <span className="text-[9px] font-extrabold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-0.5 ml-1">
                        ⚠️ Outage
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      className={`star-btn ${watchlistIds.includes(site.id) ? 'active-star' : ''}`}
                      onClick={(e) => toggleStar(site.id, e)}
                    >
                      ★
                    </button>
                    <div
                      className="site-logo"
                      style={{
                        backgroundColor: site.color,
                        border: site.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none'
                      }}
                    >
                      <FaviconImage url={site.url} logo={site.logo} color={site.color} />
                    </div>
                  </div>
                </div>
                <div className="card-info text-left">
                  <div className="flex items-center justify-between">
                    <h2 className="site-name text-left">{site.name}</h2>
                    <Link 
                      href={`/sites/${site.id}`} 
                      onClick={(e) => e.stopPropagation()} 
                      className="text-xs text-[#82c8e5]/70 hover:text-white transition"
                    >
                      Details ↗
                    </Link>
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="site-url text-left"
                  >
                    {site.url.replace('https://', '')}
                  </a>
                </div>
                <div className="counter-section text-left">
                  <span className="counter-label">VISITS SINCE LANDING</span>
                  <div
                    id={`counter-${site.id}`}
                    className="counter-number"
                  >
                    {isMounted ? (
                      <VisitsCounter rate={site.rate} pageLoadTime={pageLoadTimeRef.current} />
                    ) : (
                      '0'
                    )}
                  </div>
                </div>
                <div className="card-footer text-left">
                  <div className="stat-row">
                    <span className="stat-label">Baseline Traffic</span>
                    <span className="stat-val">{site.baseline}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Estimated Rate</span>
                    <span className="stat-val">~{site.rate.toLocaleString('en-US')} / sec</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${site.progress}%` }}
                    />
                  </div>
                  
                  {compareModeActive && (
                    <label className="compare-checkbox-label" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedCompareIds.includes(site.id)} 
                        onChange={(e) => toggleCompareSelect(site.id, e)} 
                      />
                      <span>Select for Battle</span>
                    </label>
                  )}
                </div>
              </div>
            ))}
            
            {!watchlistFilter && (
              <div 
                className="add-custom-card"
                onClick={() => setShowAddCustomModal(true)}
              >
                <span className="add-custom-icon">➕</span>
                <span className="text-sm font-bold text-[#6d8196]">Track Custom Domain</span>
              </div>
            )}
          </div>
        ) : (
          <div className="counters-list w-full">
            <div className="list-header">
              <span>Rank</span>
              <span>Website</span>
              <span>Category</span>
              <span>Baseline Traffic</span>
              <span>Visits Since Landing</span>
              <span>Progress</span>
            </div>

            {displayedSites.map((site) => (
              <div
                key={site.id}
                data-site-item="true"
                data-site-id={site.id}
                className={`list-row card-visible cursor-pointer ${sitesWithIncidents.has(site.id) ? 'row-incident animate-pulse' : ''}`}
                onClick={() => handleSiteClick(site)}
                style={{
                  ['--brand-color' as any]: site.color,
                  ['--brand-glow' as any]: site.glow,
                }}
              >
                <div className="flex items-center gap-3">
                  <button 
                    className={`star-btn ${watchlistIds.includes(site.id) ? 'active-star' : ''}`}
                    onClick={(e) => toggleStar(site.id, e)}
                  >
                    ★
                  </button>
                  <div className="list-rank text-left flex items-center gap-1.5">
                    <span>#{site.rank}</span>
                    {(() => {
                      const change = getRankChange(site);
                      if (change === null || change === 0) return null;
                      if (change > 0) {
                        return <span className="text-[10px] font-bold text-emerald-400">▲ +{change}</span>;
                      } else {
                        return <span className="text-[10px] font-bold text-rose-500">▼ {change}</span>;
                      }
                    })()}
                  </div>
                </div>

                <div className="list-identity">
                  <div
                    className="list-logo"
                    style={{
                      backgroundColor: site.color,
                      border: site.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    <FaviconImage url={site.url} logo={site.logo} color={site.color} />
                  </div>
                  <div className="list-names text-left">
                    <div className="flex items-center gap-2">
                      <h2 className="list-name">{site.name}</h2>
                      {sitesWithIncidents.has(site.id) && (
                        <span className="text-[8px] font-extrabold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-1 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Outage
                        </span>
                      )}
                      <Link 
                        href={`/sites/${site.id}`} 
                        onClick={(e) => e.stopPropagation()} 
                        className="text-[0.65rem] text-[#82c8e5]/50 hover:text-white transition"
                      >
                        [SEO] ↗
                      </Link>
                    </div>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="list-url"
                    >
                      {site.url.replace('https://', '')}
                    </a>
                  </div>
                </div>

                <div className="list-category text-left">
                  <span className="list-category-badge">{site.category}</span>
                </div>

                <div className="list-baseline text-left">{site.baseline}</div>

                <div className="list-counter-container text-left">
                  <span className="counter-label md:hidden">VISITS SINCE LANDING</span>
                  <div
                    id={`counter-${site.id}`}
                    className="list-counter-number"
                  >
                    {isMounted ? (
                      <VisitsCounter rate={site.rate} pageLoadTime={pageLoadTimeRef.current} />
                    ) : (
                      '0'
                    )}
                  </div>
                </div>

                <div className="list-progressbar">
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${site.progress}%` }}
                    />
                  </div>
                  {compareModeActive && (
                    <label className="compare-checkbox-label" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedCompareIds.includes(site.id)} 
                        onChange={(e) => toggleCompareSelect(site.id, e)} 
                      />
                      <span>Select for Battle</span>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {displayedSites.length === 0 && (
          <div className="w-full text-center py-16 text-[#6d8196]">
            <p className="text-lg">No websites match your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setWatchlistFilter(false);
                setVisibleCount(30);
              }}
              className="px-6 py-2.5 bg-[#0047ab] text-white rounded-xl font-semibold hover:bg-[#003c91] transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {filteredSites.length > visibleCount && (
          <div ref={loadMoreRef} className="infinite-scroll-trigger">
            <div className="loading-spinner" />
            <span>Scanning Stream database...</span>
          </div>
        )}

        <section className="insights-section mt-12 w-full">
          <div className="insights-card">
            <h3>RealTime Internet Dynamics</h3>
            <p>
              In the span of seconds you spend on this dashboard, millions of internet requests are dispatched worldwide.
              Google dominates search gateway traffic, YouTube handles staggering video data volumes, and platforms like
              ChatGPT represent the rapid growth of conversational AI platforms.
            </p>
            <div className="fun-fact">
              <span className="fact-icon">💡</span>
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
            <span>⚔️ Ready to Battle:</span>
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

      {/* 2. Interactive Site Details Modal */}
      {selectedSite && selectedDetails && (
        <div
          className="modal-overlay animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedSite(null);
              setSelectedDetails(null);
            }
          }}
        >
          <div
            className="modal-content"
            style={{
              ['--brand-color' as any]: selectedSite.color,
              ['--brand-glow' as any]: selectedSite.glow,
            }}
          >
            <div className="modal-body">
              <div className="modal-header-section flex-wrap gap-y-2">
                <div className="modal-title-area">
                  <div
                    className="modal-logo"
                    style={{
                      backgroundColor: selectedSite.color,
                      border: selectedSite.color === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    <FaviconImage url={selectedSite.url} logo={selectedSite.logo} color={selectedSite.color} />
                  </div>
                  <div className="modal-headline">
                    <div className="modal-name-row">
                      <h2 className="modal-name">{selectedSite.name}</h2>
                      <span className="list-category-badge">{selectedSite.category}</span>
                    </div>
                    <a
                      href={selectedSite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-url-link"
                    >
                      {selectedSite.url}
                    </a>
                  </div>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => {
                    setSelectedSite(null);
                    setSelectedDetails(null);
                  }}
                >
                  &times;
                </button>
              </div>

              <p className="modal-description text-left">
                {selectedDetails.description}
              </p>

              <div className="modal-stats-grid text-left">
                <div className="modal-stat-box">
                  <span className="modal-stat-label">Bounce Rate</span>
                  <span className="modal-stat-value">{selectedDetails.bounceRate}</span>
                </div>
                <div className="modal-stat-box">
                  <span className="modal-stat-label">Avg Visit Duration</span>
                  <span className="modal-stat-value">{selectedDetails.visitDuration}</span>
                </div>
                <div className="modal-stat-box">
                  <span className="modal-stat-label">Visits Since Landing</span>
                  <span className="modal-stat-value glow-ticker">
                    <VisitsCounter rate={selectedSite.rate} pageLoadTime={pageLoadTimeRef.current} />
                  </span>
                </div>
              </div>

              <div className="device-split-container text-left">
                <div className="device-labels">
                  <span className="device-label-item">
                    <span className="device-dot desktop" style={{ backgroundColor: selectedSite.color }} />
                    Desktop: {selectedDetails.desktopShare}%
                  </span>
                  <span className="device-label-item">
                    <span className="device-dot mobile" />
                    Mobile: {selectedDetails.mobileShare}%
                  </span>
                </div>
                <div className="device-bar-track">
                  <div
                    className="device-bar-fill"
                    style={{
                      width: `${selectedDetails.desktopShare}%`,
                      backgroundColor: selectedSite.color
                    }}
                  />
                </div>
                {radarStats?.deviceType && (
                  <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-1.5 flex justify-between">
                    <span>Cloudflare Radar Benchmark</span>
                    <span>💻 {radarStats.deviceType.desktop}% Desktop | 📱 {radarStats.deviceType.mobile}% Mobile</span>
                  </div>
                )}
              </div>

              <div className="chart-container text-left">
                <h4 className="chart-title">Estimated Traffic Waves (Last 24 Hours)</h4>
                <div className="chart-wrapper-svg">
                  <svg
                    viewBox="0 0 580 110"
                    className="chart-svg"
                  >
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={selectedSite.color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={selectedSite.color} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="20" x2="580" y2="20" className="chart-grid-line" />
                    <line x1="0" y1="50" x2="580" y2="50" className="chart-grid-line" />
                    <line x1="0" y1="80" x2="580" y2="80" className="chart-grid-line" />

                    {fillPath && (
                      <path d={fillPath} className="chart-fill-path" />
                    )}

                    {linePath && (
                      <path
                        d={linePath}
                        className="chart-trend-line"
                        style={{
                          stroke: selectedSite.color,
                          ['--brand-glow' as any]: selectedSite.glow
                        }}
                      />
                    )}

                    {chartPoints.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        className="chart-dot"
                        style={{ ['--brand-color' as any]: selectedSite.color }}
                      >
                        <title>{`Hour ${pt.hour}:00 — Traffic Capacity: ${pt.value}%`}</title>
                      </circle>
                    ))}
                  </svg>
                </div>
                <div className="chart-axis-labels">
                  <span>24h Ago</span>
                  <span>12h Ago</span>
                  <span>Now</span>
                </div>
              </div>

              <div className="geo-section text-left">
                <h4 className="geo-title">Top Traffic Geographies</h4>
                <div className="geo-grid">
                  {selectedDetails.geographies.map((geo, index) => (
                    <div key={index} className="geo-row">
                      <div className="geo-info-row">
                        <span className="geo-country-name">{geo.country}</span>
                        <span
                          className="geo-percentage"
                          style={{ color: selectedSite.color }}
                        >
                          {geo.percentage}%
                        </span>
                      </div>
                      <div className="geo-bar-track">
                        <div
                          className="geo-bar-fill"
                          style={{
                            width: `${geo.percentage}%`,
                            backgroundColor: selectedSite.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Searched Topics Badges Card */}
              {(() => {
                const raw = selectedDetails.keywords && selectedDetails.keywords.length > 0
                  ? selectedDetails.keywords
                  : [];
                const displayed = raw.length > 0 ? raw : getMostSearchedTopics({ name: selectedSite.name, category: selectedSite.category });
                return (
                  <div className="geo-section text-left mt-6 animate-fadeIn">
                    <h4 className="geo-title">Most Searched Topics</h4>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {displayed.map((kw, index) => (
                        <div 
                          key={index}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 select-none cursor-default"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--brand-color) 4%, rgba(255,255,255,0.02))',
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.85)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = selectedSite.color;
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.boxShadow = `0 0 16px ${selectedSite.glow}`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          🔍 {kw}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="modal-trivia text-left">
                <span className="fact-icon">💡</span>
                <p>
                  <strong>Fact:</strong> {selectedDetails.funFact}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Side by side Compare Modal wrapper */}
      {showCompareModal && compareSiteA && compareSiteB && (
        <CompareModal 
          siteA={compareSiteA} 
          siteB={compareSiteB} 
          onClose={() => {
            setShowCompareModal(false);
            setCompareModeActive(false);
            setSelectedCompareIds([]);
          }}
        />
      )}

      {/* 4. Add Custom Domain Form Modal */}
      {showAddCustomModal && (
        <div 
          className="modal-overlay flex items-center justify-center animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddCustomModal(false);
          }}
        >
          <div className="modal-content max-w-[500px] w-full p-8 rounded-3xl border border-white/10 mx-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold m-0">➕ Track Your Own Domain</h2>
              <button className="modal-close-btn" onClick={() => setShowAddCustomModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleAddCustomSite} className="custom-form-container">
              <div className="form-field">
                <label className="form-label">Website Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. My Portfolio"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Domain URL</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. mywebsite.com"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select 
                    value={newSiteCategory}
                    onChange={(e) => setNewSiteCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="dev">Developer Tools</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="social">Social Media</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="search">Search</option>
                    <option value="ai">AI Assistants</option>
                    <option value="reference">Reference</option>
                    <option value="news">News & Media</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Monthly Traffic</label>
                  <select 
                    value={newSiteBaseline}
                    onChange={(e) => setNewSiteBaseline(e.target.value)}
                    className="form-select"
                  >
                    <option value="1M / mo">1 Million / mo</option>
                    <option value="5M / mo">5 Million / mo</option>
                    <option value="10M / mo">10 Million / mo</option>
                    <option value="50M / mo">50 Million / mo</option>
                    <option value="100M / mo">100 Million / mo</option>
                    <option value="500M / mo">500 Million / mo</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Brand Color Highlight</label>
                <div className="flex gap-3 mt-1 items-center">
                  <input 
                    type="color" 
                    value={newSiteColor}
                    onChange={(e) => setNewSiteColor(e.target.value)}
                    className="w-10 h-10 border border-white/10 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-[#94a3b8] font-mono">{newSiteColor.toUpperCase()}</span>
                </div>
              </div>

              <button type="submit" className="form-submit-btn">
                Launch Live Tracker
              </button>
            </form>
          </div>
        </div>
      )}



      {/* Footer Navigation Privacy & Terms dialog links */}
      <footer className="app-footer">
        <p>
          Data consolidated from 2026 industry reports (Semrush & Similarweb average estimates).
        </p>
        <p>
          Visualizing the top 100 most visited global websites in real-time. Powered by Next.js & Tailwind CSS.
        </p>
        
        {/* Compliance Legal Links */}
        <div className="flex justify-center gap-4 mt-3 mb-4 text-xs font-semibold">
          <button onClick={() => setShowPrivacyModal(true)} className="text-[#82c8e5]/70 hover:text-white transition">Privacy Policy</button>
          <span className="text-white/10">|</span>
          <button onClick={() => setShowTermsModal(true)} className="text-[#82c8e5]/70 hover:text-white transition">Terms of Service</button>
        </div>

        <p className="mt-4 text-[0.7rem] text-[#6d8196] max-w-[800px] mx-auto leading-relaxed">
          Disclaimer: All product names, logos, and brands are property of their respective owners. All company, product, and service names used on this website are for identification purposes only. Use of these names, logos, and brands does not imply endorsement.
        </p>
      </footer>

      {/* Privacy Policy glassmorphic popup overlay */}
      {showPrivacyModal && (
        <div 
          className="modal-overlay flex items-center justify-center animate-fadeIn"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div className="modal-content max-w-[550px] w-full p-8 rounded-3xl border border-white/10 text-left mx-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold m-0">🔒 Privacy Policy</h2>
              <button className="modal-close-btn" onClick={() => setShowPrivacyModal(false)}>&times;</button>
            </div>
            <div className="text-sm text-[#cbd5e1] leading-relaxed mt-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
              <p><strong>1. Introduction:</strong> Welcome to Pulse. We respect your privacy and do not collect, store, or sell any of your personal identifiers or browsing histories.</p>
              <p><strong>2. Local Storage Usage:</strong> This application uses your browser's local storage to save your personal watchlist and custom tracked domains. This data is stored entirely on your local machine and is never transmitted to our servers or third-party networks.</p>
              <p><strong>3. Analytics:</strong> We use privacy-focused analytics packages to monitor overall site views and page performance. No personal tracking cookies are used.</p>
              <p><strong>4. Third-Party Connections:</strong> Brand icons and logos are fetched dynamically from public URL endpoints (Google Favicon API). No credentials or user headers are shared with these gateways.</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service glassmorphic popup overlay */}
      {showTermsModal && (
        <div 
          className="modal-overlay flex items-center justify-center animate-fadeIn"
          onClick={() => setShowTermsModal(false)}
        >
          <div className="modal-content max-w-[550px] w-full p-8 rounded-3xl border border-white/10 text-left mx-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold m-0">📄 Terms of Service</h2>
              <button className="modal-close-btn" onClick={() => setShowTermsModal(false)}>&times;</button>
            </div>
            <div className="text-sm text-[#cbd5e1] leading-relaxed mt-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
              <p><strong>1. Agreement to Terms:</strong> By accessing Pulse, you agree to comply with and be bound by these terms.</p>
              <p><strong>2. Information Disclaimer:</strong> Traffic counts shown are simulations based on average monthly traffic estimates from public reporting channels. Counters display ticking statistics designed to illustrate visit velocities and do not represent exact live connection streams.</p>
              <p><strong>3. Intellectual Property:</strong> Company brand names, domain URLs, and registered trademarks belong to their respective owners. Brand colors and logo assets are used strictly for informational identification purposes.</p>
              <p><strong>4. Limitations of Liability:</strong> Under no circumstances shall Pulse be liable for any direct or indirect business decisions made based on the estimations shown on this dashboard.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
