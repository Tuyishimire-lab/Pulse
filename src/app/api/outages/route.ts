import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CloudflareOutage {
  dataSource: string;
  description: string | null;
  scope: string;
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

export async function GET() {
  const token = process.env.CLOUDFLARE_API_TOKEN;

  // Fallback mock outage reports if no token is configured
  const mockOutages = [
    { text: "OUTAGE ALERT: Minor routing latency resolved on Google CDN server clusters.", type: "outage" },
    { text: "OUTAGE ALERT: Regional power grid instability impacts network nodes in Southern Asia.", type: "outage" },
    { text: "OUTAGE ALERT: Transit provider fiber disruption reported in Western Europe; traffic rerouted.", type: "outage" },
    { text: "OUTAGE ALERT: Regional carrier outage temporarily affects connectivity in São Paulo, Brazil.", type: "outage" }
  ];

  if (!token) {
    return NextResponse.json({
      success: true,
      source: "mock",
      outages: mockOutages
    });
  }

  try {
    const url = 'https://api.cloudflare.com/client/v4/radar/annotations/outages?limit=10&dateRange=7d&format=json';
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // cache for 1 minute
    });

    if (!res.ok) {
      console.warn(`Cloudflare Radar Outages API returned status: ${res.status}`);
      return NextResponse.json({
        success: true,
        source: "mock_fallback",
        outages: mockOutages
      });
    }

    const data = await res.json();
    if (data.success && data.result && Array.isArray(data.result.annotations)) {
      const annotations: CloudflareOutage[] = data.result.annotations;
      const formattedOutages = annotations.map((ann) => {
        const locationsStr = ann.locations && ann.locations.length > 0 ? ann.locations.join(', ') : 'Global';
        const cause = ann.outage?.outageCause ? `due to ${ann.outage.outageCause.replace('_', ' ')}` : 'under investigation';
        const scope = ann.outage?.outageType ? `${ann.outage.outageType.toLowerCase()} outage` : 'connectivity disruption';
        
        return {
          text: `OUTAGE ALERT: Active ${scope} in ${locationsStr} (${cause}).`,
          type: "outage",
          raw: ann
        };
      });

      return NextResponse.json({
        success: true,
        source: "cloudflare",
        outages: formattedOutages.length > 0 ? formattedOutages : mockOutages
      });
    }

    return NextResponse.json({
      success: true,
      source: "mock_fallback",
      outages: mockOutages
    });
  } catch (err) {
    console.error("Failed to query Cloudflare Radar Outages API:", err);
    return NextResponse.json({
      success: true,
      source: "mock_error",
      outages: mockOutages
    });
  }
}
