/**
 * Outage data structures and Cloudflare Radar annotations fetching helper.
 * Extracted from src/app/api/outages/route.ts to satisfy Next.js App Router route constraints.
 */

export interface OutageAnnotation {
  dataSource?: string;
  description: string | null;
  scope: string | null;
  startDate: string;
  endDate: string | null;
  locations: string[];
  asns: number[];
  eventType: string;
  linkedUrl: string | null;
  outage?: {
    outageCause: string;
    outageType: string;
  };
}

export interface FormattedOutageItem {
  id: string;
  title: string;
  description: string;
  scope: string;
  type: string;
  category: string;
  status: 'ongoing' | 'resolved';
  startDate: string;
  endDate?: string;
  locations?: string[];
  asns?: number[];
  outageType?: string;
  text: string;
  raw?: OutageAnnotation;
}

export const FALLBACK_OUTAGES: FormattedOutageItem[] = [
  {
    id: 'google-cdn-latency',
    title: 'Minor routing latency resolved on Google CDN server clusters',
    description: 'Minor routing latency resolved on edge CDN server clusters.',
    scope: 'Edge Network',
    type: 'outage',
    category: 'network',
    status: 'ongoing',
    startDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    locations: ['Global'],
    asns: [15169],
    outageType: 'REGIONAL',
    text: 'OUTAGE ALERT: Minor routing latency resolved on Google CDN server clusters.',
    raw: {
      description: 'Minor routing latency resolved on edge CDN server clusters.',
      scope: 'Edge Network',
      startDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      endDate: null,
      locations: ['Global'],
      asns: [15169],
      eventType: 'OUTAGE',
      linkedUrl: null,
      outage: { outageCause: 'ROUTING_LATENCY', outageType: 'REGIONAL' },
    },
  },
  {
    id: 'south-asia-power-grid',
    title: 'Regional power grid instability impacts network nodes in Southern Asia',
    description: 'Regional power grid instability impacting upstream transit nodes.',
    scope: 'Southern Asia',
    type: 'outage',
    category: 'power',
    status: 'ongoing',
    startDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    locations: ['IN', 'BD'],
    asns: [9498, 45609],
    outageType: 'REGIONAL',
    text: 'OUTAGE ALERT: Regional power grid instability impacts network nodes in Southern Asia.',
    raw: {
      description: 'Regional power grid instability impacting upstream transit nodes.',
      scope: 'Southern Asia',
      startDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      endDate: null,
      locations: ['IN', 'BD'],
      asns: [9498, 45609],
      eventType: 'OUTAGE',
      linkedUrl: null,
      outage: { outageCause: 'POWER_OUTAGE', outageType: 'REGIONAL' },
    },
  },
  {
    id: 'western-europe-fiber-disruption',
    title: 'Transit provider fiber disruption reported in Western Europe; traffic rerouted',
    description: 'Transit provider fiber cut reported; BGP traffic automatically rerouted.',
    scope: 'Western Europe',
    type: 'outage',
    category: 'transit',
    status: 'resolved',
    startDate: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    locations: ['DE', 'NL', 'FR'],
    asns: [3320, 1299],
    outageType: 'NETWORK',
    text: 'OUTAGE ALERT: Transit provider fiber disruption reported in Western Europe; traffic rerouted.',
    raw: {
      description: 'Transit provider fiber cut reported; BGP traffic automatically rerouted.',
      scope: 'Western Europe',
      startDate: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
      endDate: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      locations: ['DE', 'NL', 'FR'],
      asns: [3320, 1299],
      eventType: 'OUTAGE',
      linkedUrl: null,
      outage: { outageCause: 'CABLE_CUT', outageType: 'NETWORK' },
    },
  },
  {
    id: 'sao-paulo-carrier-outage',
    title: 'Regional carrier outage temporarily affects connectivity in São Paulo, Brazil',
    description: 'Regional carrier packet loss temporarily affecting broadband access in São Paulo.',
    scope: 'São Paulo',
    type: 'outage',
    category: 'carrier',
    status: 'resolved',
    startDate: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    locations: ['BR'],
    asns: [28573],
    outageType: 'REGIONAL',
    text: 'OUTAGE ALERT: Regional carrier outage temporarily affects connectivity in São Paulo, Brazil.',
    raw: {
      description: 'Regional carrier packet loss temporarily affecting broadband access in São Paulo.',
      scope: 'São Paulo',
      startDate: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      endDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      locations: ['BR'],
      asns: [28573],
      eventType: 'OUTAGE',
      linkedUrl: null,
      outage: { outageCause: 'TECHNICAL_PROBLEM', outageType: 'REGIONAL' },
    },
  },
];

export async function fetchOutagesData(): Promise<{
  source: string;
  outages: FormattedOutageItem[];
}> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    return { source: 'mock', outages: FALLBACK_OUTAGES };
  }

  try {
    const url =
      'https://api.cloudflare.com/client/v4/radar/annotations/outages?limit=12&dateRange=7d&format=json';
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { source: 'mock_fallback', outages: FALLBACK_OUTAGES };
    }

    const data = await res.json();
    if (data.success && data.result && Array.isArray(data.result.annotations)) {
      const annotations: OutageAnnotation[] = data.result.annotations;
      const formattedOutages: FormattedOutageItem[] = annotations.map((ann, idx) => {
        const locationsStr =
          ann.locations && ann.locations.length > 0
            ? ann.locations.join(', ')
            : 'Global';
        const cause = ann.outage?.outageCause
          ? `due to ${ann.outage.outageCause.replace(/_/g, ' ').toLowerCase()}`
          : 'under investigation';
        const scope = ann.outage?.outageType
          ? `${ann.outage.outageType.toLowerCase()} outage`
          : 'connectivity disruption';
        const isResolved = Boolean(ann.endDate);

        return {
          id: `radar-outage-${ann.startDate}-${idx}`,
          title: `Active ${scope} in ${locationsStr}`,
          description:
            ann.description ||
            `Connectivity disruption in ${locationsStr} (${cause}).`,
          scope: ann.scope || scope,
          type: 'outage',
          category: ann.eventType ? ann.eventType.toLowerCase() : 'network',
          status: isResolved ? 'resolved' : 'ongoing',
          startDate: ann.startDate,
          endDate: ann.endDate || undefined,
          locations: ann.locations,
          asns: ann.asns,
          outageType: ann.outage?.outageType,
          text: `OUTAGE ALERT: Active ${scope} in ${locationsStr} (${cause}).`,
          raw: ann,
        };
      });

      return {
        source: 'cloudflare',
        outages: formattedOutages.length > 0 ? formattedOutages : FALLBACK_OUTAGES,
      };
    }

    return { source: 'mock_fallback', outages: FALLBACK_OUTAGES };
  } catch {
    return { source: 'mock_error', outages: FALLBACK_OUTAGES };
  }
}
