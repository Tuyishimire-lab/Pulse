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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawLocation = searchParams.get('location') || 'global';
  const location = rawLocation.toLowerCase() === 'global' ? 'global' : rawLocation.toUpperCase();
  const hasLocation = location !== 'global';
  
  const token = process.env.CLOUDFLARE_API_TOKEN;

  // Localized mock network metrics
  let mockQuality = {
    bandwidth: 52.4,
    latency: 78.3,
    dnsResponseTime: 15.2
  };

  if (location === 'US') {
    mockQuality = { bandwidth: 142.5, latency: 22.8, dnsResponseTime: 8.5 };
  } else if (location === 'IN') {
    mockQuality = { bandwidth: 38.2, latency: 62.5, dnsResponseTime: 14.8 };
  } else if (location === 'GB') {
    mockQuality = { bandwidth: 110.1, latency: 28.2, dnsResponseTime: 9.1 };
  } else if (location === 'DE') {
    mockQuality = { bandwidth: 125.4, latency: 25.6, dnsResponseTime: 10.2 };
  } else if (location === 'BR') {
    mockQuality = { bandwidth: 68.5, latency: 45.1, dnsResponseTime: 12.4 };
  } else if (location === 'JP') {
    mockQuality = { bandwidth: 135.2, latency: 18.5, dnsResponseTime: 7.8 };
  }

  // Premium mock metrics for global fallback
  const mockStats = {
    success: true,
    source: 'mock',
    location: location,
    deviceType: {
      desktop: location === 'IN' || location === 'BR' ? 32.5 : 44.8,
      mobile: location === 'IN' || location === 'BR' ? 65.8 : 53.6,
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
    },
    quality: mockQuality
  };

  if (!token) {
    return NextResponse.json(mockStats);
  }

  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    const locationQuery = hasLocation ? `&location=${location}` : '';

    // 1. Fetch Device Type Summary
    let deviceTypeData = { desktop: 44.8, mobile: 53.6, other: 1.6 };
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/radar/http/summary/device_type?dateRange=7d&format=json${locationQuery}`, {
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

    // 2. Fetch Top Locations (Only relevant for global view)
    let topLocationsData = mockStats.topLocations;
    if (!hasLocation) {
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
    } else {
      topLocationsData = [];
    }

    // 3. Fetch HTTP Versions Summary
    let httpVersionData = { http3: 38.5, http2: 51.3, http1: 10.2 };
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/radar/http/summary/http_version?dateRange=7d&format=json${locationQuery}`, {
        headers,
        next: { revalidate: 300 }
      });
      if (res.ok) {
        const json = await res.json();
        const summary = json?.result?.summary_0 || json?.result?.summary;
        if (summary) {
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

    // 4. Fetch IQI Summary (Network Health Quality Metrics)
    let qualityData = mockQuality;
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/radar/quality/iqi/summary?dateRange=7d&format=json${locationQuery}`, {
        headers,
        next: { revalidate: 300 }
      });
      if (res.ok) {
        const json = await res.json();
        const summary = json?.result?.summary;
        if (summary) {
          qualityData = {
            bandwidth: summary.bandwidth?.value !== undefined ? parseFloat(summary.bandwidth.value.toFixed(1)) : mockQuality.bandwidth,
            latency: summary.latency?.value !== undefined ? parseFloat(summary.latency.value.toFixed(1)) : mockQuality.latency,
            dnsResponseTime: summary.dnsResponseTime?.value !== undefined ? parseFloat(summary.dnsResponseTime.value.toFixed(1)) : mockQuality.dnsResponseTime,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch IQI summary from Cloudflare:', e);
    }

    return NextResponse.json({
      success: true,
      source: 'cloudflare',
      location: location,
      deviceType: deviceTypeData,
      topLocations: topLocationsData,
      httpVersion: httpVersionData,
      quality: qualityData
    });

  } catch (err) {
    console.error('Radar Stats proxy call failed:', err);
    return NextResponse.json(mockStats);
  }
}
