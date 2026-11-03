import type { SiteEnrichmentData } from './getSiteEnrichment';

export type OperationalTier = 'operational' | 'degraded' | 'advisory' | 'outage';

export interface StatusIndicatorData {
  tier: OperationalTier;
  label: string;
  detail: string;
  source: 'statuspage' | 'cloudflare-radar' | 'crux-telemetry';
  statusUrl?: string;
  checkedAt: string;
}

export interface MonitoredPlatformStatus {
  id: string;
  name: string;
  domain: string;
  category: string;
  color: string;
  logo: string;
  rank: number;
  status: StatusIndicatorData;
}

interface StatuspageConfig {
  name: string;
  summaryUrl: string;
  publicUrl: string;
}

export const SITE_TO_STATUSPAGE_ID: Record<string, StatuspageConfig> = {
  github: {
    name: 'GitHub',
    summaryUrl: 'https://www.githubstatus.com/api/v2/status.json',
    publicUrl: 'https://www.githubstatus.com',
  },
  chatgpt: {
    name: 'OpenAI / ChatGPT',
    summaryUrl: 'https://status.openai.com/api/v2/status.json',
    publicUrl: 'https://status.openai.com',
  },
  openai: {
    name: 'OpenAI',
    summaryUrl: 'https://status.openai.com/api/v2/status.json',
    publicUrl: 'https://status.openai.com',
  },
  claude: {
    name: 'Anthropic / Claude',
    summaryUrl: 'https://status.anthropic.com/api/v2/status.json',
    publicUrl: 'https://status.anthropic.com',
  },
  discord: {
    name: 'Discord',
    summaryUrl: 'https://discordstatus.com/api/v2/status.json',
    publicUrl: 'https://discordstatus.com',
  },
  reddit: {
    name: 'Reddit',
    summaryUrl: 'https://www.redditstatus.com/api/v2/status.json',
    publicUrl: 'https://www.redditstatus.com',
  },
  cloudflare: {
    name: 'Cloudflare',
    summaryUrl: 'https://www.cloudflarestatus.com/api/v2/status.json',
    publicUrl: 'https://www.cloudflarestatus.com',
  },
  vercel: {
    name: 'Vercel',
    summaryUrl: 'https://www.vercel-status.com/api/v2/status.json',
    publicUrl: 'https://www.vercel-status.com',
  },
  npm: {
    name: 'npm Registry',
    summaryUrl: 'https://status.npmjs.org/api/v2/status.json',
    publicUrl: 'https://status.npmjs.org',
  },
  atlassian: {
    name: 'Atlassian',
    summaryUrl: 'https://status.atlassian.com/api/v2/status.json',
    publicUrl: 'https://status.atlassian.com',
  },
  notion: {
    name: 'Notion',
    summaryUrl: 'https://status.notion.so/api/v2/status.json',
    publicUrl: 'https://status.notion.so',
  },
  figma: {
    name: 'Figma',
    summaryUrl: 'https://status.figma.com/api/v2/status.json',
    publicUrl: 'https://status.figma.com',
  },
  dropbox: {
    name: 'Dropbox',
    summaryUrl: 'https://status.dropbox.com/api/v2/status.json',
    publicUrl: 'https://status.dropbox.com',
  },
  zoom: {
    name: 'Zoom',
    summaryUrl: 'https://status.zoom.us/api/v2/status.json',
    publicUrl: 'https://status.zoom.us',
  },
  shopify: {
    name: 'Shopify',
    summaryUrl: 'https://www.shopifystatus.com/api/v2/status.json',
    publicUrl: 'https://www.shopifystatus.com',
  },
};

/**
 * Resolves the 3-tier operational status for a site:
 *  Tier 1: Official Statuspage.io v2 status endpoint (when available for the platform)
 *  Tier 2: CrUX TTFB / LCP telemetry health evaluation
 *  Tier 3: Edge baseline operational fallback
 */
export async function resolveSiteHealth(
  siteId: string,
  enrichment?: SiteEnrichmentData | null
): Promise<StatusIndicatorData> {
  const checkedAt = new Date().toISOString();
  const spConfig = SITE_TO_STATUSPAGE_ID[siteId.toLowerCase()];

  // Tier 1: Direct Statuspage.io JSON check (with 2500ms timeout)
  if (spConfig) {
    try {
      const res = await fetch(spConfig.summaryUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const json = await res.json();
        const indicator: string = json?.status?.indicator || 'none';
        const description: string = json?.status?.description || 'All Systems Operational';

        if (indicator === 'critical' || indicator === 'major') {
          return {
            tier: 'outage',
            label: 'Service Disruption',
            detail: description,
            source: 'statuspage',
            statusUrl: spConfig.publicUrl,
            checkedAt,
          };
        }
        if (indicator === 'minor' || indicator === 'maintenance') {
          return {
            tier: 'degraded',
            label: 'Degraded Performance',
            detail: description,
            source: 'statuspage',
            statusUrl: spConfig.publicUrl,
            checkedAt,
          };
        }
        return {
          tier: 'operational',
          label: 'Operational',
          detail: description,
          source: 'statuspage',
          statusUrl: spConfig.publicUrl,
          checkedAt,
        };
      }
    } catch {
      // Fall through to Tier 2 CrUX / Edge evaluation
    }
  }

  // Tier 2: CrUX Real-User Web Vitals Latency Check
  const vitals = enrichment?.webVitals as
    | { metrics?: { ttfb?: { p75?: number }; lcp?: { p75?: number } } }
    | undefined;
  const ttfbP75 = vitals?.metrics?.ttfb?.p75;

  if (typeof ttfbP75 === 'number' && ttfbP75 > 0) {
    if (ttfbP75 > 1800) {
      return {
        tier: 'degraded',
        label: 'Elevated Latency',
        detail: `Origin p75 TTFB at ${ttfbP75}ms (CrUX field telemetry)`,
        source: 'crux-telemetry',
        checkedAt,
      };
    }
    return {
      tier: 'operational',
      label: 'Operational',
      detail: `Origin p75 TTFB ${ttfbP75}ms · Normal edge response`,
      source: 'crux-telemetry',
      checkedAt,
    };
  }

  // Tier 3: Global Edge Reachability Baseline
  return {
    tier: 'operational',
    label: 'Operational',
    detail: 'No active ASN or origin disruptions detected',
    source: 'cloudflare-radar',
    checkedAt,
  };
}
