import { NextResponse } from 'next/server';

export const revalidate = 300; // Revalidate at most once every 5 minutes

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
  TR: 'Turkey',
  PH: 'Philippines',
  VN: 'Vietnam',
  ID: 'Indonesia',
  NG: 'Nigeria',
  AR: 'Argentina',
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
    // Real API shape: result.top_0[].{ clientCountryAlpha2, clientCountryName, value }
    let topLocationsData = mockStats.topLocations;
    if (!hasLocation) {
      try {
        const res = await fetch('https://api.cloudflare.com/client/v4/radar/http/top/locations?dateRange=7d&limit=5&format=json', {
          headers,
          next: { revalidate: 300 }
        });
        if (res.ok) {
          const json = await res.json();
          const locations: { clientCountryAlpha2: string; clientCountryName: string; value: string }[] =
            json?.result?.top_0 ?? [];
          if (Array.isArray(locations) && locations.length > 0) {
            topLocationsData = locations.map((loc) => ({
              location: loc.clientCountryAlpha2,
              name: loc.clientCountryName || COUNTRY_NAMES[loc.clientCountryAlpha2] || loc.clientCountryAlpha2,
              percentage: parseFloat(parseFloat(loc.value || '0').toFixed(1)),
            }));
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
    // Real API shape: each metric needs a separate request with ?metric=bandwidth|latency|dns
    // Response: result.summary_0.{ p25, p50, p75 } - we use p50 (median)
    let qualityData = mockQuality;
    try {
      const iqiBase = `https://api.cloudflare.com/client/v4/radar/quality/iqi/summary?dateRange=7d&format=json${locationQuery}`;
      const [bwRes, latRes, dnsRes] = await Promise.allSettled([
        fetch(`${iqiBase}&metric=bandwidth`, { headers, next: { revalidate: 300 } }),
        fetch(`${iqiBase}&metric=latency`,   { headers, next: { revalidate: 300 } }),
        fetch(`${iqiBase}&metric=dns`,        { headers, next: { revalidate: 300 } }),
      ]);

      const p50 = async (settled: PromiseSettledResult<Response>): Promise<number | null> => {
        if (settled.status !== 'fulfilled' || !settled.value.ok) return null;
        const j = await settled.value.json();
        const raw = j?.result?.summary_0?.p50;
        return raw != null ? parseFloat(parseFloat(raw).toFixed(1)) : null;
      };

      const [bw, lat, dns] = await Promise.all([p50(bwRes), p50(latRes), p50(dnsRes)]);
      qualityData = {
        bandwidth:       bw  ?? mockQuality.bandwidth,
        latency:         lat ?? mockQuality.latency,
        dnsResponseTime: dns ?? mockQuality.dnsResponseTime,
      };
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
