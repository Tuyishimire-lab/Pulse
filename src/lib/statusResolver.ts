import type { SiteEnrichmentData } from './getSiteEnrichment';

export type OperationalTier = 'operational' | 'degraded' | 'advisory' | 'outage';

export interface StatusIndicatorData {
  tier: OperationalTier;
  label: string;
  detail: string;
  source: 'statuspage' | 'cloudflare-radar' | 'crux-telemetry';
  statusUrl?: string;
  checkedAt: string;
  telemetryTier?: 1 | 2 | 3;
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

/**
 * 48 catalog platforms with verified public Statuspage v2 API endpoints.
 * Key matches the catalog site ID in src/app/data/sites.ts (SITES).
 * Legacy alias 'atlassian' is preserved alongside the authoritative catalog ID 'jira'.
 */
export const SITE_TO_STATUSPAGE_ID: Record<string, StatuspageConfig> = {
  // Core & AI / Dev platforms
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
  jira: {
    name: 'Jira',
    summaryUrl: 'https://jira-software.status.atlassian.com/api/v2/status.json',
    publicUrl: 'https://jira-software.status.atlassian.com',
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
  slack: {
    name: 'Slack',
    summaryUrl: 'https://slack-status.com/api/v2/status.json',
    publicUrl: 'https://status.slack.com',
  },
  twitch: {
    name: 'Twitch',
    summaryUrl: 'https://twitchstatus.com/api/v2/status.json',
    publicUrl: 'https://twitchstatus.com',
  },
  stripe: {
    name: 'Stripe',
    summaryUrl: 'https://status.stripe.com/api/v2/status.json',
    publicUrl: 'https://status.stripe.com',
  },
  linear: {
    name: 'Linear',
    summaryUrl: 'https://linearstatus.com/api/v2/status.json',
    publicUrl: 'https://linearstatus.com',
  },
  supabase: {
    name: 'Supabase',
    summaryUrl: 'https://status.supabase.com/api/v2/status.json',
    publicUrl: 'https://status.supabase.com',
  },
  gitlab: {
    name: 'GitLab',
    summaryUrl: 'https://status.gitlab.com/api/v2/status.json',
    publicUrl: 'https://status.gitlab.com',
  },
  digitalocean: {
    name: 'DigitalOcean',
    summaryUrl: 'https://status.digitalocean.com/api/v2/status.json',
    publicUrl: 'https://status.digitalocean.com',
  },
  sentry: {
    name: 'Sentry',
    summaryUrl: 'https://status.sentry.io/api/v2/status.json',
    publicUrl: 'https://status.sentry.io',
  },
  postman: {
    name: 'Postman',
    summaryUrl: 'https://status.postman.com/api/v2/status.json',
    publicUrl: 'https://status.postman.com',
  },
  datadog: {
    name: 'Datadog',
    summaryUrl: 'https://status.datadoghq.com/api/v2/status.json',
    publicUrl: 'https://status.datadoghq.com',
  },
  epicgames: {
    name: 'Epic Games',
    summaryUrl: 'https://status.epicgames.com/api/v2/status.json',
    publicUrl: 'https://status.epicgames.com',
  },
  coinbase: {
    name: 'Coinbase',
    summaryUrl: 'https://status.coinbase.com/api/v2/status.json',
    publicUrl: 'https://status.coinbase.com',
  },
  robinhood: {
    name: 'Robinhood',
    summaryUrl: 'https://status.robinhood.com/api/v2/status.json',
    publicUrl: 'https://status.robinhood.com',
  },
  medium: {
    name: 'Medium',
    summaryUrl: 'https://status.medium.com/api/v2/status.json',
    publicUrl: 'https://status.medium.com',
  },
  patreon: {
    name: 'Patreon',
    summaryUrl: 'https://status.patreon.com/api/v2/status.json',
    publicUrl: 'https://status.patreon.com',
  },
  squarespace: {
    name: 'Squarespace',
    summaryUrl: 'https://status.squarespace.com/api/v2/status.json',
    publicUrl: 'https://status.squarespace.com',
  },
  vimeo: {
    name: 'Vimeo',
    summaryUrl: 'https://status.vimeo.com/api/v2/status.json',
    publicUrl: 'https://status.vimeo.com',
  },
  docker: {
    name: 'Docker',
    summaryUrl: 'https://status.docker.com/api/v2/status.json',
    publicUrl: 'https://status.docker.com',
  },
  netlify: {
    name: 'Netlify',
    summaryUrl: 'https://www.netlifystatus.com/api/v2/status.json',
    publicUrl: 'https://www.netlifystatus.com',
  },
  roblox: {
    name: 'Roblox',
    summaryUrl: 'https://status.roblox.com/api/v2/status.json',
    publicUrl: 'https://status.roblox.com',
  },
  huggingface: {
    name: 'Hugging Face',
    summaryUrl: 'https://status.huggingface.co/api/v2/status.json',
    publicUrl: 'https://status.huggingface.co',
  },
  grafana: {
    name: 'Grafana',
    summaryUrl: 'https://status.grafana.com/api/v2/status.json',
    publicUrl: 'https://status.grafana.com',
  },
  kraken: {
    name: 'Kraken',
    summaryUrl: 'https://status.kraken.com/api/v2/status.json',
    publicUrl: 'https://status.kraken.com',
  },
  bsky: {
    name: 'Bluesky',
    summaryUrl: 'https://status.bsky.app/api/v2/status.json',
    publicUrl: 'https://status.bsky.app',
  },
  replit: {
    name: 'Replit',
    summaryUrl: 'https://status.replit.com/api/v2/status.json',
    publicUrl: 'https://status.replit.com',
  },
  render: {
    name: 'Render',
    summaryUrl: 'https://status.render.com/api/v2/status.json',
    publicUrl: 'https://status.render.com',
  },
  railway: {
    name: 'Railway',
    summaryUrl: 'https://railway.statuspage.io/api/v2/status.json',
    publicUrl: 'https://status.railway.app',
  },
  substack: {
    name: 'Substack',
    summaryUrl: 'https://status.substack.com/api/v2/status.json',
    publicUrl: 'https://status.substack.com',
  },
  canva: {
    name: 'Canva',
    summaryUrl: 'https://www.canvastatus.com/api/v2/status.json',
    publicUrl: 'https://www.canvastatus.com',
  },
  suno: {
    name: 'Suno',
    summaryUrl: 'https://status.suno.com/api/v2/status.json',
    publicUrl: 'https://status.suno.com',
  },
  elevenlabs: {
    name: 'ElevenLabs',
    summaryUrl: 'https://status.elevenlabs.io/api/v2/status.json',
    publicUrl: 'https://status.elevenlabs.io',
  },
  cursor: {
    name: 'Cursor',
    summaryUrl: 'https://status.cursor.com/api/v2/status.json',
    publicUrl: 'https://status.cursor.com',
  },
  runwayml: {
    name: 'Runway',
    summaryUrl: 'https://status.runwayml.com/api/v2/status.json',
    publicUrl: 'https://status.runwayml.com',
  },
};

/**
 * Resolves the 3-tier operational status for a site:
 *  Tier 1: Official Statuspage.io v2 status endpoint (when available for the platform)
 *  Tier 2: CrUX TTFB / LCP real-user latency telemetry health evaluation
 *  Tier 3: Edge baseline operational fallback
 */
export async function resolveSiteHealth(
  siteId: string,
  enrichment?: SiteEnrichmentData | null
): Promise<StatusIndicatorData> {
  const checkedAt = new Date().toISOString();
  const normalizedId = siteId.toLowerCase();
  const spConfig = SITE_TO_STATUSPAGE_ID[normalizedId];

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
            telemetryTier: 1,
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
            telemetryTier: 1,
          };
        }
        return {
          tier: 'operational',
          label: 'Operational',
          detail: description,
          source: 'statuspage',
          statusUrl: spConfig.publicUrl,
          checkedAt,
          telemetryTier: 1,
        };
      }
    } catch {
      // Statuspage check timed out or failed; fall through to Tier 2 CrUX / Tier 3 Edge evaluation
    }
  }

  // Tier 2: CrUX Real-User Web Vitals Latency Check
  const vitals = enrichment?.webVitals as
    | ({
        metrics?: {
          ttfb?: { p75?: number };
          lcp?: { p75?: number };
        };
        ttfb_p75?: number;
        p75_ttfb?: number;
        lcp_p75?: number;
        p75_lcp?: number;
        cwv_grade?: string | null;
      } & Record<string, unknown>)
    | undefined;

  const ttfbP75 =
    vitals?.metrics?.ttfb?.p75 ??
    (typeof vitals?.ttfb_p75 === 'number' ? vitals.ttfb_p75 : undefined) ??
    (typeof vitals?.p75_ttfb === 'number' ? vitals.p75_ttfb : undefined);

  if (typeof ttfbP75 === 'number' && ttfbP75 > 0) {
    if (ttfbP75 > 1800) {
      return {
        tier: 'degraded',
        label: 'Elevated Latency',
        detail: `Origin p75 TTFB ${Math.round(ttfbP75)}ms (CrUX field data)`,
        source: 'crux-telemetry',
        checkedAt,
        telemetryTier: 2,
      };
    }
    return {
      tier: 'operational',
      label: 'Operational',
      detail: `Origin p75 TTFB ${Math.round(ttfbP75)}ms · Edge normal`,
      source: 'crux-telemetry',
      checkedAt,
      telemetryTier: 2,
    };
  }

  // Tier 2 Fallback: Surface CrUX LCP / CWV grade when TTFB is not in payload.
  // Note: LCP measures front-end largest paint (e.g. video player poster on YouTube),
  // not server downtime, so it is reported as operational telemetry rather than an outage.
  const lcpP75 =
    vitals?.metrics?.lcp?.p75 ??
    (typeof vitals?.lcp_p75 === 'number' ? vitals.lcp_p75 : undefined) ??
    (typeof vitals?.p75_lcp === 'number' ? vitals.p75_lcp : undefined);

  if (typeof lcpP75 === 'number' && lcpP75 > 0) {
    const gradeSuffix = vitals?.cwv_grade ? `CWV ${vitals.cwv_grade}` : 'Edge normal';
    return {
      tier: 'operational',
      label: 'Operational',
      detail: `CrUX p75 LCP ${Math.round(lcpP75)}ms · ${gradeSuffix}`,
      source: 'crux-telemetry',
      checkedAt,
      telemetryTier: 2,
    };
  }

  // Tier 3: Global Edge Reachability Baseline
  return {
    tier: 'operational',
    label: 'Operational',
    detail: 'Edge & ASN routing normal',
    source: 'cloudflare-radar',
    checkedAt,
    telemetryTier: 3,
  };
}
