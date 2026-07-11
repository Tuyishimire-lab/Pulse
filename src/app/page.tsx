'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
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
    <img
      src={faviconUrl}
      alt={`${logo} logo`}
      onError={() => setError(true)}
      className="w-full h-full object-contain p-1 rounded-full bg-white/10"
    />
  );
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
  const [marqueeItems, setMarqueeItems] = useState<{ text: string; type: string }[]>(MARQUEE_NEWS);

  // Legal Modal States
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  // Filter sites based on category, search, and watchlist
  const filteredSites = useMemo(() => {
    return allSites.filter((site) => {
      const matchesCategory = activeCategory === 'all' || site.category === activeCategory;
      const matchesSearch = searchQuery === '' ||
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWatchlist = !watchlistFilter || watchlistIds.includes(site.id);
      return matchesCategory && matchesSearch && matchesWatchlist;
    });
  }, [allSites, activeCategory, searchQuery, watchlistFilter, watchlistIds]);

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
            setSelectedDetails({
              ...defaultDetails,
              trafficHistory: mappedHistory
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
          {/* Top Row: Search, Segmented Filter Tabs & Actions */}
          <div className="console-top-row">
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

            <div className="console-actions">
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

              <button 
                className={`action-btn ${compareModeActive ? 'active' : ''}`}
                onClick={() => {
                  setCompareModeActive(!compareModeActive);
                  setSelectedCompareIds([]);
                }}
              >
                📊 Compare {compareModeActive ? 'ON' : 'OFF'}
              </button>
              
              <button 
                className="action-btn action-btn-secondary"
                onClick={() => setShowAddCustomModal(true)}
              >
                ➕ Track Domain
              </button>

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

        {/* Live Counters Presentation */}
        {viewLayout === 'grid' ? (
          <div className="counters-grid mt-4 w-full">
            {displayedSites.map((site) => (
              <div
                key={site.id}
                data-site-item="true"
                data-site-id={site.id}
                className="card card-visible cursor-pointer"
                onClick={() => handleSiteClick(site)}
                style={{
                  ['--brand-color' as any]: site.color,
                  ['--brand-glow' as any]: site.glow,
                }}
              >
                <div className="card-header">
                  <span className="rank-badge">RANK #{site.rank}</span>
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
                className="list-row card-visible cursor-pointer"
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
                  <div className="list-rank text-left">#{site.rank}</div>
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
