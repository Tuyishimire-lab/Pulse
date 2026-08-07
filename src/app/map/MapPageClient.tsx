'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import NavHeader from '../components/NavHeader';

// World TopoJSON from CDN (110m resolution — good balance of detail vs file size)
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric → alpha-2 lookup (world-atlas countries-110m.json uses numeric IDs)
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


interface CountryInfo {
  slug: string;
  name: string;
  internetUsers: string;
  internetPenetration: string;
  topSiteName: string;
  topSiteId: string;
  topSiteColor: string;
}

interface Props {
  countryMap: Record<string, CountryInfo>;
}

function getPenetrationColor(penetration: string | undefined): string {
  if (!penetration || penetration === 'N/A') return '#1C1C2E';
  const pct = parseInt(penetration.replace('%', ''), 10);
  if (isNaN(pct)) return '#1C1C2E';
  if (pct >= 90) return '#00D4AA';
  if (pct >= 75) return '#00A882';
  if (pct >= 60) return '#007A60';
  if (pct >= 45) return '#005244';
  if (pct >= 30) return '#002E27';
  return '#001A17';
}

function getPenetrationHover(penetration: string | undefined): string {
  if (!penetration || penetration === 'N/A') return '#2A2A3E';
  const pct = parseInt(penetration.replace('%', ''), 10);
  if (isNaN(pct)) return '#2A2A3E';
  if (pct >= 90) return '#00FFCC';
  if (pct >= 75) return '#00CCAA';
  if (pct >= 60) return '#009980';
  if (pct >= 45) return '#006655';
  if (pct >= 30) return '#003D33';
  return '#002820';
}

export default function MapPageClient({ countryMap }: Props) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{
    x: number; y: number;
    country: CountryInfo;
  } | null>(null);
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltip) {
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip((t) => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
      }
    }
  }, [tooltip]);

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  }, []);

  const countriesWithData = Object.keys(countryMap).length;

  return (
    <div className="min-h-screen bg-[#02020a] text-white font-sans flex flex-col overflow-x-hidden">
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />
      <NavHeader />

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#82c8e5] to-[#00D4AA] bg-clip-text text-transparent">
              Global Web Traffic Map
            </h1>
          </div>
          <p className="text-[#6d8196] text-sm sm:text-base max-w-2xl">
            Internet penetration by country — coloured by connectivity level. Click any country to explore its top websites.
            Covering <span className="text-[#00D4AA] font-semibold">{countriesWithData} countries</span> with live data.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-xs text-[#6d8196] font-medium uppercase tracking-widest">Internet Penetration</span>
          {[
            { label: '≥90%', color: '#00D4AA' },
            { label: '75–90%', color: '#00A882' },
            { label: '60–75%', color: '#007A60' },
            { label: '45–60%', color: '#005244' },
            { label: '30–45%', color: '#002E27' },
            { label: '<30%', color: '#001A17' },
            { label: 'No data', color: '#1C1C2E' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
              <span className="text-xs text-[#8899aa]">{label}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          className="relative w-full rounded-2xl border border-white/[0.06] bg-[#080815] overflow-hidden shadow-2xl"
          style={{ aspectRatio: '2 / 1' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <ComposableMap
            projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              minZoom={1}
              maxZoom={8}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const numericId = String(geo.id ?? geo.properties?.['name']);
                    const alpha2 = NUMERIC_TO_ALPHA2[numericId];
                    const countryData = alpha2 ? countryMap[alpha2] : undefined;

                    const fill = getPenetrationColor(countryData?.internetPenetration);
                    const hoverFill = getPenetrationHover(countryData?.internetPenetration);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#0d0d1e"
                        strokeWidth={0.5}
                        style={{
                          default: { fill, outline: 'none', cursor: countryData ? 'pointer' : 'default' },
                          hover: { fill: hoverFill, outline: 'none', cursor: countryData ? 'pointer' : 'default' },
                          pressed: { fill: hoverFill, outline: 'none' },
                        }}
                        onMouseEnter={(e) => {
                          if (!countryData) return;
                          const rect = mapRef.current?.getBoundingClientRect();
                          if (rect) {
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                              country: countryData,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => {
                          if (countryData) {
                            router.push(`/top-sites/${countryData.slug}`);
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 text-xs text-[#4a5568] bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5">
            Scroll to zoom · Drag to pan · Click to explore
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute pointer-events-none z-50 max-w-[220px]"
              style={{
                left: tooltip.x + 14,
                top: tooltip.y - 10,
                transform: tooltip.x > (mapRef.current?.clientWidth ?? 0) - 250
                  ? 'translateX(calc(-100% - 28px))'
                  : 'none',
              }}
            >
              <div className="rounded-xl border border-white/10 bg-[#0d0d1e]/95 backdrop-blur-md shadow-2xl p-3 space-y-1.5">
                <div className="font-bold text-white text-sm leading-tight">{tooltip.country.name}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tooltip.country.topSiteColor }}
                  />
                  <span className="text-[#82c8e5]">#{1} {tooltip.country.topSiteName}</span>
                </div>
                <div className="text-[#6d8196] text-xs space-y-0.5">
                  <div>👥 {tooltip.country.internetUsers} users</div>
                  <div>📶 {tooltip.country.internetPenetration} penetration</div>
                </div>
                <div className="pt-0.5 text-[10px] text-[#00D4AA] font-medium">Click to explore →</div>
              </div>
            </div>
          )}
        </div>

        {/* Country Grid below map */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-white mb-4">
            Browse by Country
            <span className="ml-2 text-sm font-normal text-[#6d8196]">({countriesWithData} countries)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {Object.entries(countryMap)
              .sort(([, a], [, b]) => a.name.localeCompare(b.name))
              .map(([code, country]) => {
                const pct = parseInt(country.internetPenetration.replace('%', ''), 10);
                const dotColor = getPenetrationColor(country.internetPenetration);
                return (
                  <Link
                    key={code}
                    href={`/top-sites/${country.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="text-xs text-[#8899aa] group-hover:text-white transition-colors truncate">
                      {country.name}
                    </span>
                    {!isNaN(pct) && (
                      <span className="ml-auto text-[10px] text-[#4a5568] flex-shrink-0">{pct}%</span>
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      </main>
    </div>
  );
}
