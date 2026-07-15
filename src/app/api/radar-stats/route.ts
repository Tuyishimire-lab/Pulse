import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CloudflareTopLocation {
  location: string;
  value: string;
}

// Simple lookup map for country names
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  IN: 'India',
  GB: 'United Kingdom',
  DE: 'Germany',
  BR: 'Brazil',
  JP: 'Japan',
  CA: 'Canada',
  FR: 'France',
  AU: 'Australia',
  MX: 'Mexico',
  CN: 'China',
  RU: 'Russia',
  KR: 'South Korea',
  IT: 'Italy',
  ES: 'Spain',
  ZA: 'South Africa',
  SG: 'Singapore',
  NL: 'Netherlands',
  SE: 'Sweden',
  PL: 'Poland',
};

export async function GET() {
  const token = process.env.CLOUDFLARE_API_TOKEN;

  // Premium mock metrics for global fallback
  const mockStats = {
    success: true,
    source: 'mock',
    deviceType: {
      desktop: 44.8,
      mobile: 53.6,
      other: 1.6
    },
    topLocations: [
      { location: 'US', name: 'United States', percentage: 18.4 },
      { location: 'IN', name: 'India', percentage: 12.1 },
      { location: 'GB', name: 'United Kingdom', percentage: 6.5 },
      { location: 'DE', name: 'Germany', percentage: 5.8 },
      { location: 'BR', name: 'Brazil', percentage: 4.2 }
    ],
    httpVersion: {
      http3: 38.5,
      http2: 51.3,
      http1: 10.2
    }
  };

  if (!token) {
    return NextResponse.json(mockStats);
  }

  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    // 1. Fetch Device Type Summary
    let deviceTypeData = { desktop: 44.8, mobile: 53.6, other: 1.6 };
    try {
      const res = await fetch('https://api.cloudflare.com/client/v4/radar/http/summary/device_type?dateRange=7d&format=json', {
        headers,
        next: { revalidate: 300 }
      });
      if (res.ok) {
        const json = await res.json();
        const summary = json?.result?.summary_0 || json?.result?.summary;
        if (summary) {
          deviceTypeData = {
            desktop: parseFloat(parseFloat(summary.desktop || '0').toFixed(1)),
            mobile: parseFloat(parseFloat(summary.mobile || '0').toFixed(1)),
            other: parseFloat(parseFloat(summary.other || '0').toFixed(1)),
          };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch device_type from Cloudflare:', e);
    }

    // 2. Fetch Top Locations
    let topLocationsData = mockStats.topLocations;
    try {
      const res = await fetch('https://api.cloudflare.com/client/v4/radar/http/top/locations?dateRange=7d&limit=5&format=json', {
        headers,
        next: { revalidate: 300 }
      });
      if (res.ok) {
        const json = await res.json();
        const locations = json?.result?.topLocations || json?.result?.locations;
        if (Array.isArray(locations)) {
          topLocationsData = locations.map((loc: CloudflareTopLocation) => {
            const pct = parseFloat(parseFloat(loc.value || '0').toFixed(1));
            return {
              location: loc.location,
              name: COUNTRY_NAMES[loc.location] || loc.location,
              percentage: pct
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch top locations from Cloudflare:', e);
    }

    // 3. Fetch HTTP Versions Summary
    let httpVersionData = { http3: 38.5, http2: 51.3, http1: 10.2 };
    try {
      const res = await fetch('https://api.cloudflare.com/client/v4/radar/http/summary/http_version?dateRange=7d&format=json', {
        headers,
        next: { revalidate: 300 }
      });
      if (res.ok) {
        const json = await res.json();
        const summary = json?.result?.summary_0 || json?.result?.summary;
        if (summary) {
          // Cloudflare returns key names like 'HTTP/3', 'HTTP/2', 'HTTP/1.x' or lowercase
          const http3Val = parseFloat(summary['HTTP/3'] || summary['http3'] || summary['http/3'] || '0');
          const http2Val = parseFloat(summary['HTTP/2'] || summary['http2'] || summary['http/2'] || '0');
          const http1Val = parseFloat(summary['HTTP/1.x'] || summary['HTTP/1.1'] || summary['http1'] || '0');
          
          const total = (http3Val + http2Val + http1Val) || 1;
          httpVersionData = {
            http3: parseFloat(((http3Val / total) * 100).toFixed(1)),
            http2: parseFloat(((http2Val / total) * 100).toFixed(1)),
            http1: parseFloat(((http1Val / total) * 100).toFixed(1)),
          };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch http_version from Cloudflare:', e);
    }

    return NextResponse.json({
      success: true,
      source: 'cloudflare',
      deviceType: deviceTypeData,
      topLocations: topLocationsData,
      httpVersion: httpVersionData
    });

  } catch (err) {
    console.error('Radar Stats proxy call failed:', err);
    return NextResponse.json(mockStats);
  }
}
