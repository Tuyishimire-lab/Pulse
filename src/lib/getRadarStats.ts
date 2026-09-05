import { RadarStatsData, RadarQuality } from '../types/radar';

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

export async function getRadarStats(locationParam = 'global'): Promise<RadarStatsData> {
  const rawLocation = locationParam || 'global';
  const location = rawLocation.toLowerCase() === 'global' ? 'global' : rawLocation.toUpperCase();
  const hasLocation = location !== 'global';
  const token = process.env.CLOUDFLARE_API_TOKEN;

  let mockQuality: RadarQuality = {
    bandwidth: 52.4,
    latency: 78.3,
    dnsResponseTime: 15.2,
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

  const mockStats: RadarStatsData = {
    success: true,
    source: 'mock',
    location,
    deviceType: {
      desktop: location === 'IN' || location === 'BR' ? 32.5 : 44.8,
      mobile: location === 'IN' || location === 'BR' ? 65.8 : 53.6,
      other: 1.6,
    },
    topLocations: [
      { location: 'US', name: 'United States', percentage: 18.4 },
      { location: 'IN', name: 'India', percentage: 12.1 },
      { location: 'GB', name: 'United Kingdom', percentage: 6.5 },
      { location: 'DE', name: 'Germany', percentage: 5.8 },
      { location: 'BR', name: 'Brazil', percentage: 4.2 },
    ],
    httpVersion: {
      http3: 38.5,
      http2: 51.3,
      http1: 10.2,
    },
    quality: mockQuality,
  };

  if (!token) {
    return mockStats;
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };

    const locationQuery = hasLocation ? `&location=${location}` : '';
    const endpoints = {
      deviceType: `https://api.cloudflare.com/client/v4/radar/http/top/device_types?dateRange=7d&format=json${locationQuery}`,
      httpVersion: `https://api.cloudflare.com/client/v4/radar/http/top/http_protocols?dateRange=7d&format=json${locationQuery}`,
      topLocations: `https://api.cloudflare.com/client/v4/radar/http/top/locations?dateRange=7d&format=json&limit=5`,
    };

    const [deviceRes, httpRes, locationsRes] = await Promise.allSettled([
      fetch(endpoints.deviceType, { headers, next: { revalidate: 300 } }),
      fetch(endpoints.httpVersion, { headers, next: { revalidate: 300 } }),
      !hasLocation
        ? fetch(endpoints.topLocations, { headers, next: { revalidate: 300 } })
        : Promise.resolve(null),
    ]);

    const result = { ...mockStats, source: 'cloudflare' };

    if (deviceRes.status === 'fulfilled' && deviceRes.value?.ok) {
      const data = await deviceRes.value.json();
      if (data?.result?.top_0) {
        let mobile = 0;
        let desktop = 0;
        let other = 0;
        for (const item of data.result.top_0) {
          const client = (item.clientDeviceType || '').toLowerCase();
          const pct = parseFloat(item.value) || 0;
          if (client === 'mobile') mobile = pct;
          else if (client === 'desktop') desktop = pct;
          else other += pct;
        }
        if (mobile > 0 || desktop > 0) {
          result.deviceType = {
            desktop: Math.round(desktop * 10) / 10,
            mobile: Math.round(mobile * 10) / 10,
            other: Math.round(other * 10) / 10,
          };
        }
      }
    }

    if (httpRes.status === 'fulfilled' && httpRes.value?.ok) {
      const data = await httpRes.value.json();
      if (data?.result?.top_0) {
        let h1 = 0;
        let h2 = 0;
        let h3 = 0;
        for (const item of data.result.top_0) {
          const proto = (item.protocol || '').toLowerCase();
          const pct = parseFloat(item.value) || 0;
          if (proto.includes('http/3') || proto.includes('quic')) h3 = pct;
          else if (proto.includes('http/2')) h2 = pct;
          else if (proto.includes('http/1')) h1 = pct;
        }
        if (h2 > 0 || h3 > 0) {
          result.httpVersion = {
            http3: Math.round(h3 * 10) / 10,
            http2: Math.round(h2 * 10) / 10,
            http1: Math.round(h1 * 10) / 10,
          };
        }
      }
    }

    if (locationsRes.status === 'fulfilled' && locationsRes.value?.ok) {
      const data = await locationsRes.value.json();
      if (data?.result?.top_0 && Array.isArray(data.result.top_0)) {
        interface CfLocationItem { clientCountryAlpha2?: string; value?: string }
        const locs = data.result.top_0.slice(0, 5).map((item: CfLocationItem) => {
          const code = (item.clientCountryAlpha2 || 'XX').toUpperCase();
          return {
            location: code,
            name: COUNTRY_NAMES[code] || code,
            percentage: Math.round((parseFloat(item.value || '0') || 0) * 10) / 10,
          };
        });
        if (locs.length > 0) {
          result.topLocations = locs;
        }
      }
    }

    return result;
  } catch (err) {
    console.warn('[getRadarStats] Failed to fetch live Cloudflare data, using mock:', err);
    return mockStats;
  }
}
