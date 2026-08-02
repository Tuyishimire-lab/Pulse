import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache per-site data for 1 hour

// Country code → display name lookup
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', IN: 'India', GB: 'United Kingdom', DE: 'Germany',
  BR: 'Brazil', JP: 'Japan', CA: 'Canada', FR: 'France', AU: 'Australia',
  MX: 'Mexico', CN: 'China', RU: 'Russia', KR: 'South Korea', IT: 'Italy',
  ES: 'Spain', ZA: 'South Africa', SG: 'Singapore', NL: 'Netherlands',
  SE: 'Sweden', PL: 'Poland', NG: 'Nigeria', AR: 'Argentina', ID: 'Indonesia',
  TR: 'Turkey', SA: 'Saudi Arabia', PH: 'Philippines', VN: 'Vietnam', TH: 'Thailand',
};

/**
 * GET /api/radar-site?asn=15169
 *
 * Returns three real Cloudflare Radar data points for a specific ASN:
 *  - Top geographic locations (real country breakdown)
 *  - Device type split (real desktop/mobile ratio)
 *  - 24-hour HTTP traffic timeseries (real hourly curve)
 *
 * Falls back gracefully to null fields if the API key is missing or the
 * ASN has insufficient traffic data in Cloudflare's network.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const asn = searchParams.get('asn');

  if (!asn) {
    return NextResponse.json({ error: 'Missing asn parameter' }, { status: 400 });
  }

  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!token) {
    // No API key — caller will fall back to seeded estimates
    return NextResponse.json({ source: 'unavailable', asn });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
  const asnParam = `asn=AS${asn}`;

  const results: {
    source: string;
    asn: string;
    geographies: { country: string; percentage: number }[] | null;
    deviceType: { desktop: number; mobile: number } | null;
    trafficHistory: number[] | null;
  } = {
    source: 'cloudflare',
    asn,
    geographies: null,
    deviceType: null,
    trafficHistory: null,
  };

  // ── 1. Top geographic locations by ASN ──────────────────────────────────
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/radar/http/top/locations?dateRange=7d&limit=6&format=json&${asnParam}`,
      { headers, next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const json = await res.json();
      const locations = json?.result?.top_0 ?? json?.result?.topLocations ?? json?.result?.locations;
      if (Array.isArray(locations) && locations.length > 0) {
        // Normalize percentage fields — CF may return 'value' or 'share'
        const total = locations.reduce((sum: number, loc: any) => {
          const v = parseFloat(loc.value ?? loc.share ?? loc.clientCountryAlpha2 ?? '0');
          return sum + (isNaN(v) ? 0 : v);
        }, 0);

        results.geographies = locations
          .map((loc: any) => {
            const code: string = loc.clientCountryAlpha2 ?? loc.location ?? '';
            const raw = parseFloat(loc.value ?? loc.share ?? '0');
            // If values already look like percentages (sum ~100), use directly
            const pct = total > 10 ? parseFloat(((raw / total) * 100).toFixed(1)) : parseFloat(raw.toFixed(1));
            return {
              country: COUNTRY_NAMES[code] ?? code,
              percentage: isNaN(pct) ? 0 : pct,
            };
          })
          .filter((g) => g.percentage > 0)
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5);
      }
    }
  } catch (e) {
    console.warn(`[radar-site] geo fetch failed for ASN ${asn}:`, e);
  }

  // ── 2. Device type split by ASN ─────────────────────────────────────────
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/radar/http/summary/device_type?dateRange=7d&format=json&${asnParam}`,
      { headers, next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const json = await res.json();
      const summary = json?.result?.summary_0 ?? json?.result?.summary;
      if (summary) {
        const desktop = parseFloat(parseFloat(summary.desktop ?? '0').toFixed(1));
        const mobile = parseFloat(parseFloat(summary.mobile ?? '0').toFixed(1));
        if (desktop + mobile > 0) {
          results.deviceType = { desktop, mobile };
        }
      }
    }
  } catch (e) {
    console.warn(`[radar-site] device_type fetch failed for ASN ${asn}:`, e);
  }

  // ── 3. 24-hour HTTP request timeseries by ASN ───────────────────────────
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/radar/http/timeseries?dateRange=1d&aggInterval=1h&format=json&${asnParam}`,
      { headers, next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const json = await res.json();
      // Radar returns { result: { serie_0: { timestamps: [...], values: [...] } } }
      const serie = json?.result?.serie_0 ?? json?.result?.timeseries;
      const values: string[] | undefined = serie?.values ?? serie?.requests;
      if (Array.isArray(values) && values.length > 0) {
        const nums = values.map((v) => parseFloat(v));
        const max = Math.max(...nums);
        const min = Math.min(...nums);
        const range = max - min || 1;
        // Normalise to 10–100% scale (matching the seeded history format)
        results.trafficHistory = nums.map((v) =>
          Math.round(10 + ((v - min) / range) * 90),
        );
        // Ensure exactly 24 data points
        if (results.trafficHistory.length > 24) {
          results.trafficHistory = results.trafficHistory.slice(-24);
        } else {
          while (results.trafficHistory.length < 24) {
            results.trafficHistory.unshift(results.trafficHistory[0] ?? 50);
          }
        }
      }
    }
  } catch (e) {
    console.warn(`[radar-site] timeseries fetch failed for ASN ${asn}:`, e);
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
  });
}
