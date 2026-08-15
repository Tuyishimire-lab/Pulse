'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';
import NavHeader from '../components/NavHeader';

const GEO_URL = '/data/countries-110m.json';
const DEFAULT_ROTATION: [number, number, number] = [-20, -25, 0];
const DEFAULT_SCALE = 220;
const FLY_DURATION = 750; // ms

// ISO numeric to alpha-2
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '4': 'AF',   '8': 'AL',   '12': 'DZ',  '24': 'AO',  '32': 'AR',  '36': 'AU',
  '40': 'AT',  '50': 'BD',  '56': 'BE',  '68': 'BO',  '76': 'BR',  '84': 'BZ',
  '96': 'BN',  '100': 'BG', '104': 'MM', '112': 'BY', '116': 'KH', '120': 'CM',
  '124': 'CA', '144': 'LK', '152': 'CL', '156': 'CN', '170': 'CO', '180': 'CD',
  '188': 'CR', '191': 'HR', '192': 'CU', '203': 'CZ', '208': 'DK', '214': 'DO',
  '218': 'EC', '222': 'SV', '231': 'ET', '233': 'EE', '246': 'FI', '250': 'FR',
  '266': 'GA', '268': 'GE', '276': 'DE', '288': 'GH', '300': 'GR', '320': 'GT',
  '328': 'GY', '332': 'HT', '340': 'HN', '348': 'HU', '356': 'IN', '360': 'ID',
  '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '388': 'JM',
  '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR',
  '414': 'KW', '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR',
  '434': 'LY', '440': 'LT', '454': 'MW', '458': 'MY', '484': 'MX', '498': 'MD',
  '499': 'ME', '504': 'MA', '508': 'MZ', '516': 'NA', '524': 'NP', '528': 'NL',
  '554': 'NZ', '558': 'NI', '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA',
  '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT',
  '630': 'PR', '634': 'QA', '642': 'RO', '643': 'RU', '646': 'RW', '682': 'SA',
  '686': 'SN', '688': 'RS', '694': 'SL', '702': 'SG', '703': 'SK', '704': 'VN',
  '705': 'SI', '706': 'SO', '710': 'ZA', '716': 'ZW', '724': 'ES', '729': 'SD',
  '740': 'SR', '748': 'SZ', '752': 'SE', '756': 'CH', '760': 'SY', '764': 'TH',
  '780': 'TT', '784': 'AE', '788': 'TN', '792': 'TR', '800': 'UG', '804': 'UA',
  '807': 'MK', '818': 'EG', '826': 'GB', '834': 'TZ', '840': 'US', '858': 'UY',
  '860': 'UZ', '862': 'VE', '887': 'YE', '894': 'ZM', '31': 'AZ',  '51': 'AM',
  '70': 'BA',  '72': 'BW',  '158': 'TW',
};

// Capital city coordinates [lon, lat]
const CAPITAL_COORDS: Record<string, [number, number]> = {
  AF: [69.2, 34.5],    AL: [19.8, 41.3],    DZ: [3.1, 36.7],     AO: [13.2, -8.8],
  AR: [-58.4, -34.6],  AM: [44.5, 40.2],    AU: [149.1, -35.3],  AT: [16.4, 48.2],
  AZ: [49.9, 40.4],    BA: [18.4, 43.8],    BD: [90.4, 23.7],    BE: [4.4, 50.8],
  BF: [-1.5, 12.4],    BG: [23.3, 42.7],    BO: [-68.1, -16.5],  BR: [-47.9, -15.8],
  BW: [25.9, -24.7],   BY: [27.6, 53.9],    BZ: [-88.8, 17.3],   CA: [-75.7, 45.4],
  CD: [15.3, -4.3],    CL: [-70.7, -33.5],  CM: [11.5, 3.9],     CN: [116.4, 39.9],
  CO: [-74.1, 4.7],    CR: [-84.1, 9.9],    CU: [-82.4, 23.1],   CZ: [14.5, 50.1],
  DE: [13.4, 52.5],    DK: [12.6, 55.7],    DO: [-69.9, 18.5],
  EC: [-78.5, -0.2],   EE: [24.7, 59.4],    EG: [31.2, 30.1],    ES: [-3.7, 40.4],
  ET: [38.7, 9.0],     FI: [25.0, 60.2],    FR: [2.3, 48.9],     GA: [9.5, 0.4],
  GB: [-0.1, 51.5],    GE: [44.8, 41.7],    GH: [-0.2, 5.6],     GR: [23.7, 38.0],
  GT: [-90.5, 14.6],   GY: [-58.2, 6.8],    HN: [-87.2, 14.1],   HR: [16.0, 45.8],
  HT: [-72.3, 18.5],   HU: [19.0, 47.5],    ID: [106.8, -6.2],   IE: [-6.3, 53.3],
  IL: [35.2, 31.8],    IN: [77.2, 28.6],    IQ: [44.4, 33.3],    IR: [51.4, 35.7],
  IT: [12.5, 41.9],    JM: [-76.8, 18.0],   JO: [35.9, 31.9],    JP: [139.7, 35.7],
  KE: [36.8, -1.3],    KH: [104.9, 11.6],   KP: [125.8, 39.0],   KR: [126.9, 37.6],
  KW: [47.5, 29.4],    KZ: [71.4, 51.2],    LA: [102.6, 18.0],   LB: [35.5, 33.9],
  LK: [80.6, 7.0],     LR: [-10.8, 6.3],    LS: [27.5, -29.3],   LT: [25.3, 54.7],
  LV: [24.1, 56.9],    LY: [13.2, 32.9],    MA: [-5.8, 34.0],    MD: [28.9, 47.0],
  ME: [19.3, 42.4],    MK: [21.4, 42.0],    MM: [96.2, 19.7],    MW: [33.8, -13.9],
  MX: [-99.1, 19.4],   MY: [101.7, 3.1],    MZ: [32.6, -25.9],   NA: [17.1, -22.6],
  NG: [7.5, 9.1],      NI: [-86.3, 12.1],   NL: [4.9, 52.4],     NO: [10.7, 59.9],
  NP: [85.3, 27.7],    NZ: [174.8, -41.3],  OM: [58.6, 23.6],    PA: [-79.5, 9.0],
  PE: [-77.0, -12.1],  PG: [147.2, -9.5],   PH: [121.0, 14.6],   PK: [73.1, 33.7],
  PL: [21.0, 52.2],    PT: [-9.1, 38.7],    PY: [-57.6, -25.3],  QA: [51.5, 25.3],
  RO: [26.1, 44.4],    RS: [20.5, 44.8],    RU: [37.6, 55.8],    RW: [30.1, -1.9],
  SA: [46.7, 24.7],    SD: [32.5, 15.6],    SE: [18.1, 59.3],    SG: [103.8, 1.4],
  SI: [14.5, 46.1],    SK: [17.1, 48.1],    SL: [-13.2, 8.5],    SN: [-17.5, 14.7],
  SO: [45.3, 2.0],     SR: [-55.2, 5.9],    SY: [36.3, 33.5],    SZ: [31.1, -26.3],
  TH: [100.5, 13.8],   TN: [10.2, 36.8],    TR: [32.9, 39.9],    TT: [-61.5, 10.7],
  TW: [121.5, 25.0],   TZ: [39.3, -6.8],    UA: [30.5, 50.5],    AE: [54.4, 24.5],
  UG: [32.6, 0.3],     US: [-77.0, 38.9],   UY: [-56.2, -34.9],  UZ: [69.3, 41.3],
  VE: [-66.9, 10.5],   VN: [105.8, 21.0],   YE: [44.2, 15.4],    ZA: [28.2, -25.7],
  ZM: [28.3, -15.4],   ZW: [31.0, -17.8],
};

const REGIONS = [
  { id: 'all', label: 'Global', coords: [-20, -25] as [number, number], scale: 220 },
  { id: 'na', label: 'North America', coords: [-100, 42] as [number, number], scale: 320 },
  { id: 'eu', label: 'Europe', coords: [15, 52] as [number, number], scale: 380 },
  { id: 'apac', label: 'Asia Pacific', coords: [115, 20] as [number, number], scale: 310 },
  { id: 'latam', label: 'Latin America', coords: [-60, -18] as [number, number], scale: 300 },
  { id: 'africa', label: 'Africa', coords: [20, 2] as [number, number], scale: 300 },
  { id: 'mideast', label: 'Middle East', coords: [45, 28] as [number, number], scale: 360 },
];

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function shortestAngle(from: number, to: number): number {
  let d = ((to - from) % 360 + 540) % 360 - 180;
  return from + d;
}

export type MapLayer = 'penetration' | 'ecosystem' | 'population';

export interface CountryInfo {
  slug: string;
  name: string;
  internetUsers: string;
  internetUsersMillions?: number;
  internetPenetration: string;
  topSiteName: string;
  topSiteId: string;
  topSiteColor: string;
}

interface Props {
  countryMap: Record<string, CountryInfo>;
}

function getCountryColor(country: CountryInfo | undefined, layer: MapLayer): { fill: string; hover: string } {
  if (!country) {
    return { fill: '#111827', hover: '#1f2937' };
  }

  if (layer === 'penetration') {
    const pct = parseInt((country.internetPenetration || '').replace('%', ''), 10);
    if (isNaN(pct)) return { fill: '#111827', hover: '#1f2937' };
    if (pct >= 90) return { fill: '#00D4AA', hover: '#00FFCC' };
    if (pct >= 75) return { fill: '#00A882', hover: '#00CCAA' };
    if (pct >= 60) return { fill: '#007A60', hover: '#009980' };
    if (pct >= 45) return { fill: '#005244', hover: '#006655' };
    if (pct >= 30) return { fill: '#002E27', hover: '#003D33' };
    return { fill: '#001A17', hover: '#002820' };
  }

  if (layer === 'ecosystem') {
    const siteId = country.topSiteId || 'google';
    const siteColorMap: Record<string, { fill: string; hover: string }> = {
      google: { fill: '#3b82f6', hover: '#60a5fa' },
      youtube: { fill: '#ef4444', hover: '#f87171' },
      facebook: { fill: '#2563eb', hover: '#3b82f6' },
      instagram: { fill: '#ec4899', hover: '#f472b6' },
      chatgpt: { fill: '#10b981', hover: '#34d399' },
      yandex: { fill: '#dc2626', hover: '#ef4444' },
      naver: { fill: '#059669', hover: '#10b981' },
      yahoo: { fill: '#7c3aed', hover: '#8b5cf6' },
      baidu: { fill: '#1d4ed8', hover: '#2563eb' },
    };
    return siteColorMap[siteId] || { fill: country.topSiteColor || '#3b82f6', hover: '#60a5fa' };
  }

  if (layer === 'population') {
    const millions = country.internetUsersMillions || 0;
    if (millions >= 200) return { fill: '#8b5cf6', hover: '#a78bfa' };
    if (millions >= 100) return { fill: '#6366f1', hover: '#818cf8' };
    if (millions >= 50)  return { fill: '#3b82f6', hover: '#60a5fa' };
    if (millions >= 20)  return { fill: '#0284c7', hover: '#38bdf8' };
    if (millions >= 5)   return { fill: '#0369a1', hover: '#0284c7' };
    return { fill: '#082f49', hover: '#075985' };
  }

  return { fill: '#111827', hover: '#1f2937' };
}

function Stars() {
  const stars = useMemo(() => {
    const s: { x: number; y: number; size: number; opacity: number; delay: number }[] = [];
    let seed = 42;
    const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    for (let i = 0; i < 40; i++) {
      s.push({ x: rand() * 100, y: rand() * 100, size: rand() * 1.5 + 0.5, opacity: rand() * 0.5 + 0.2, delay: rand() * 4 });
    }
    return s;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            backgroundColor: 'white',
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function MapPageClient({ countryMap }: Props) {
  const router = useRouter();

  const [activeLayer, setActiveLayer] = useState<MapLayer>('penetration');
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [rotation, setRotation] = useState<[number, number, number]>(DEFAULT_ROTATION);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const dragRef = useRef<{ x: number; y: number; rot: [number, number, number] } | null>(null);
  const pinchRef = useRef<number | null>(null);
  const autoRafRef = useRef<number | null>(null);
  const flyRafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; country: CountryInfo } | null>(null);

  useEffect(() => setMounted(true), []);

  // Auto-rotation - throttled to 30 FPS and pauses on tab visibility / user interaction
  useEffect(() => {
    let lastTime = performance.now();
    let isVisible = true;

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const tick = (now: number) => {
      if (isVisible && !isHovered && !isDragging && !isFlying) {
        const delta = now - lastTime;
        if (delta >= 33.3) {
          setRotation((r) => [r[0] - (0.12 * (delta / 16.67)), r[1], r[2]]);
          lastTime = now;
        }
      } else {
        lastTime = now;
      }
      autoRafRef.current = requestAnimationFrame(tick);
    };
    autoRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isHovered, isDragging, isFlying]);

  // Ctrl+scroll = zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setScale((s) => Math.min(600, Math.max(150, s - e.deltaY * 0.4)));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Animated fly-to coordinates
  const flyToCoords = useCallback((lonLat: [number, number], targetScale: number = 360) => {
    const targetRot: [number, number, number] = [-lonLat[0], -lonLat[1], 0];

    setIsFlying(true);
    setSearchOpen(false);
    setSearchQuery('');
    if (flyRafRef.current) cancelAnimationFrame(flyRafRef.current);

    const startRot = rotation;
    const startScale = scale;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / FLY_DURATION);
      const e = easeInOut(t);
      setRotation([
        startRot[0] + (shortestAngle(startRot[0], targetRot[0]) - startRot[0]) * e,
        startRot[1] + (targetRot[1] - startRot[1]) * e,
        0,
      ]);
      setScale(Math.round(startScale + (targetScale - startScale) * e));
      if (t < 1) {
        flyRafRef.current = requestAnimationFrame(animate);
      } else {
        setIsFlying(false);
      }
    };
    flyRafRef.current = requestAnimationFrame(animate);
  }, [rotation, scale]);

  const flyTo = useCallback((alpha2: string) => {
    const coords = CAPITAL_COORDS[alpha2];
    if (coords) flyToCoords(coords, 360);
  }, [flyToCoords]);

  const flyToRegion = useCallback((regionId: string) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;
    setActiveRegion(regionId);
    flyToCoords(region.coords, region.scale);
  }, [flyToCoords]);

  // Mouse drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY, rot: [...rotation] as [number, number, number] };
  }, [rotation]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltip) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setTooltip((t) => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
    }
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setRotation([
      dragRef.current.rot[0] - dx * 0.35,
      Math.max(-90, Math.min(90, dragRef.current.rot[1] + dy * 0.35)),
      0,
    ]);
  }, [isDragging, tooltip]);

  const onMouseUp = useCallback(() => { setIsDragging(false); dragRef.current = null; }, []);
  const onMouseLeave = useCallback(() => {
    setIsHovered(false); setIsDragging(false); setTooltip(null); dragRef.current = null;
  }, []);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      dragRef.current = { x: t.clientX, y: t.clientY, rot: [...rotation] as [number, number, number] };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = Math.hypot(dx, dy);
    }
  }, [rotation]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && dragRef.current) {
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.x;
      const dy = t.clientY - dragRef.current.y;
      setRotation([
        dragRef.current.rot[0] - dx * 0.35,
        Math.max(-90, Math.min(90, dragRef.current.rot[1] + dy * 0.35)),
        0,
      ]);
    } else if (e.touches.length === 2 && pinchRef.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = pinchRef.current - dist;
      setScale((s) => Math.min(600, Math.max(150, s - delta * 0.5)));
      pinchRef.current = dist;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
    pinchRef.current = null;
  }, []);

  // Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return Object.entries(countryMap)
      .filter(([, c]) => c.name.toLowerCase().startsWith(q))
      .slice(0, 6)
      .map(([code, c]) => ({ code, ...c }));
  }, [searchQuery, countryMap]);

  const countriesWithData = Object.keys(countryMap).length;

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans flex flex-col overflow-x-hidden">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--op, 0.4); }
          50% { opacity: calc(var(--op, 0.4) * 0.2); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .star-twinkle { animation: twinkle 4s ease-in-out infinite; }
        }
        .globe-sidebar::-webkit-scrollbar { width: 4px; }
        .globe-sidebar::-webkit-scrollbar-track { background: transparent; }
        .globe-sidebar::-webkit-scrollbar-thumb { background: rgba(0,212,170,0.18); border-radius: 4px; }
        .globe-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(0,212,170,0.38); }
      `}</style>

      {/* Starfield */}
      <Stars />

      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,170,0.07) 0%, transparent 70%)' }}
      />

      <NavHeader />

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header row */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold tracking-widest text-[#00D4AA] uppercase bg-[#00D4AA]/10 border border-[#00D4AA]/20 px-2.5 py-0.5 rounded-md">
                Geospatial Telemetry
              </span>
              <span className="text-xs text-[#6d8196]">
                {countriesWithData} countries covered
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#82c8e5] to-[#00D4AA] bg-clip-text text-transparent">
              Global Web Traffic Map
            </h1>
            <p className="text-[#8899aa] text-sm max-w-xl mt-1">
              Interactive 3D orthographic globe visualizing global connectivity, platform dominance, and online population volume.
            </p>
          </div>

          {/* Search bar */}
          <div ref={searchRef} className="relative w-full sm:w-64 flex-shrink-0">
            <input
              type="text"
              placeholder="Fly to a country..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-3.5 pr-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder-[#6d8196] focus:outline-none focus:border-[#00D4AA]/50 focus:bg-white/[0.07] transition-all"
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-white/10 bg-[#0d0d1e]/98 backdrop-blur-xl shadow-2xl overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => flyTo(r.code)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/[0.06] transition-colors text-xs"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCountryColor(r, activeLayer).fill }}
                    />
                    <span className="text-white font-medium">{r.name}</span>
                    <span className="ml-auto text-[11px] text-[#6d8196]">{r.internetPenetration}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Mode Switcher + Regional Orbit Control Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6 p-2 rounded-2xl border border-white/[0.08] bg-white/[0.015]">
          {/* Layer View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <span className="text-[10px] text-[#6d8196] px-2.5 font-bold uppercase tracking-wider hidden sm:inline">
              Layer:
            </span>
            {[
              { id: 'penetration', label: 'Penetration %' },
              { id: 'ecosystem', label: 'Dominant Platform' },
              { id: 'population', label: 'Connected Population' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as MapLayer)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeLayer === layer.id
                    ? 'bg-[#00D4AA] text-black font-bold shadow-md'
                    : 'text-[#8899aa] hover:text-white'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Regional Orbit Quick-Fly Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-[10px] text-[#6d8196] px-2 font-bold uppercase tracking-wider hidden xl:inline">
              Orbit:
            </span>
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => flyToRegion(r.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  activeRegion === r.id
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-[#8899aa] hover:text-white bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Legend Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl border border-white/[0.06] bg-white/[0.01]">
          <span className="text-xs font-bold text-white uppercase tracking-wider mr-2">
            Legend:
          </span>

          {activeLayer === 'penetration' && (
            <>
              {[
                { label: '≥90%', color: '#00D4AA' },
                { label: '75-90%', color: '#00A882' },
                { label: '60-75%', color: '#007A60' },
                { label: '45-60%', color: '#005244' },
                { label: '30-45%', color: '#002E27' },
                { label: '<30%', color: '#001A17' },
                { label: 'No data', color: '#111827' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                  <span className="text-xs text-[#8899aa]">{label}</span>
                </div>
              ))}
            </>
          )}

          {activeLayer === 'ecosystem' && (
            <>
              {[
                { label: 'Google', color: '#3b82f6' },
                { label: 'YouTube', color: '#ef4444' },
                { label: 'Facebook', color: '#2563eb' },
                { label: 'Instagram', color: '#ec4899' },
                { label: 'ChatGPT', color: '#10b981' },
                { label: 'Yandex', color: '#dc2626' },
                { label: 'Naver', color: '#059669' },
                { label: 'Yahoo', color: '#7c3aed' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                  <span className="text-xs text-[#8899aa]">{label}</span>
                </div>
              ))}
            </>
          )}

          {activeLayer === 'population' && (
            <>
              {[
                { label: '>200M Users', color: '#8b5cf6' },
                { label: '100M-200M', color: '#6366f1' },
                { label: '50M-100M', color: '#3b82f6' },
                { label: '20M-50M', color: '#0284c7' },
                { label: '5M-20M', color: '#0369a1' },
                { label: '<5M Users', color: '#082f49' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                  <span className="text-xs text-[#8899aa]">{label}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Globe and Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div
            ref={containerRef}
            className="relative w-full lg:flex-1 flex items-center justify-center select-none"
            style={{ height: 440 }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onMouseEnter={() => setIsHovered(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* 3-layer atmosphere glow */}
            <div className="absolute pointer-events-none" style={{
              width: 410, height: 410, top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', borderRadius: '50%',
              boxShadow: [
                '0 0 80px 40px rgba(0,212,170,0.04)',
                '0 0 40px 12px rgba(0,212,170,0.09)',
                '0 0 12px 2px rgba(130,200,229,0.13)',
              ].join(', '),
            }} />

            {/* Globe */}
            {!mounted ? (
              <div
                className="rounded-full bg-[#040d1a] border border-[#0d2035] animate-pulse"
                style={{ width: 400, height: 400 }}
              />
            ) : (
              <ComposableMap
                projection="geoOrthographic"
                projectionConfig={{ rotate: rotation, scale }}
                width={800}
                height={800}
                style={{ width: 400, height: 400, cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <Sphere id="ocean-bg" fill="#040d1a" stroke="#0d2035" strokeWidth={1} />
                <Graticule stroke="#0a2030" strokeWidth={0.4} />
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const alpha2 = NUMERIC_TO_ALPHA2[String(geo.id)];
                      const countryData = alpha2 ? countryMap[alpha2] : undefined;
                      const { fill, hover } = getCountryColor(countryData, activeLayer);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#0d1f30"
                          strokeWidth={0.4}
                          style={{
                            default: { fill, outline: 'none', cursor: countryData ? 'pointer' : 'grab' },
                            hover: { fill: hover, outline: 'none', cursor: countryData ? 'pointer' : 'grab' },
                            pressed: { fill: hover, outline: 'none' },
                          }}
                          onMouseEnter={(e) => {
                            if (!countryData) return;
                            const rect = containerRef.current?.getBoundingClientRect();
                            if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, country: countryData });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          onClick={() => { if (!isDragging && countryData) router.push(`/top-sites/${countryData.slug}`); }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            )}

            {/* Hint bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#6d8196] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 whitespace-nowrap">
              {isFlying ? 'Flying to coordinate...' : 'Ctrl+scroll to zoom · Drag to rotate · Click country to inspect'}
            </div>

            {/* Reset button */}
            <button
              onClick={() => {
                flyToRegion('all');
                setTimeout(() => setRotation(DEFAULT_ROTATION), 50);
                setScale(DEFAULT_SCALE);
              }}
              className="absolute top-3 right-3 text-xs text-[#8899aa] hover:text-[#00D4AA] bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 hover:border-[#00D4AA]/40 transition-all"
              title="Reset view"
            >
              Reset View
            </button>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute pointer-events-none z-50 max-w-[220px]"
                style={{
                  left: tooltip.x + 14,
                  top: tooltip.y - 10,
                  transform: tooltip.x > (containerRef.current?.clientWidth ?? 0) - 240
                    ? 'translateX(calc(-100% - 28px))' : 'none',
                }}
              >
                <div className="rounded-xl border border-white/10 bg-[#0d0d1e]/98 backdrop-blur-md shadow-2xl p-3 space-y-1.5">
                  <div className="font-bold text-white text-sm">{tooltip.country.name}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tooltip.country.topSiteColor }} />
                    <span className="text-[#82c8e5]">#1 {tooltip.country.topSiteName}</span>
                  </div>
                  <div className="text-[#6d8196] text-xs space-y-0.5">
                    <div>Users: {tooltip.country.internetUsers}</div>
                    <div>Penetration: {tooltip.country.internetPenetration}</div>
                  </div>
                  <div className="pt-0.5 text-[10px] text-[#00D4AA] font-medium">Click to explore full report →</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Access sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
            <h2 className="text-xs font-bold text-[#6d8196] uppercase tracking-widest mb-3">
              Country Directory ({countriesWithData})
            </h2>
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 globe-sidebar">
              {Object.entries(countryMap)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                .map(([code, country]) => {
                  const { fill } = getCountryColor(country, activeLayer);
                  return (
                    <button
                      key={code}
                      onClick={() => flyTo(code)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group text-left"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fill }} />
                      <span className="text-xs text-[#8899aa] group-hover:text-white transition-colors truncate flex-1">
                        {country.name}
                      </span>
                      <span className="text-[10px] text-[#6d8196] font-mono flex-shrink-0">
                        {activeLayer === 'penetration' ? country.internetPenetration : (activeLayer === 'ecosystem' ? country.topSiteName : country.internetUsers)}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
