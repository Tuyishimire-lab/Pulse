import { NextResponse } from 'next/server';
import { STATIC_TRAFFIC_FACTS } from '../../../data/marquee';

export const revalidate = 60;

interface StatuspageResponse {
  page?: { id: string; name: string; url: string };
  status?: { indicator: 'none' | 'minor' | 'major' | 'critical'; description: string };
  incidents?: {
    id: string;
    name: string;
    status: string;
    impact: string;
    shortlink: string;
    incident_updates?: { body: string }[];
  }[];
}

/**
 * Strips HTML tags, decodes all common HTML entities (including em-dashes),
 * and truncates cleanly at a word boundary so sentences are never cut mid-word.
 */
function clean(text: string, max = 120): string {
  const decoded = text
    .replace(/<[^>]*>/g, '')
    .replace(/&mdash;/g, ' ')       // replace em-dash with space, not the dash character
    .replace(/&ndash;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\u2014/g, ' ')        // actual em-dash character → space
    .replace(/\u2013/g, ' ')        // actual en-dash character → space
    .replace(/\s+/g, ' ')
    .trim();

  if (decoded.length <= max) return decoded;

  // Cut at the last word boundary before max
  const cut = decoded.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > max * 0.6 ? cut.slice(0, lastSpace) + '...' : cut + '...';
}

/** Capitalise first letter and ensure text ends with a full stop */
function sentence(text: string): string {
  const t = text.charAt(0).toUpperCase() + text.slice(1);
  return t.endsWith('.') || t.endsWith('!') || t.endsWith('?') ? t : `${t}.`;
}

// 15 major internet platforms with public Statuspage APIs
const STATUS_SITES = [
  { name: 'GitHub',     url: 'https://www.githubstatus.com/api/v2/status.json' },
  { name: 'OpenAI',     url: 'https://status.openai.com/api/v2/status.json' },
  { name: 'Reddit',     url: 'https://www.redditstatus.com/api/v2/status.json' },
  { name: 'Discord',    url: 'https://discordstatus.com/api/v2/status.json' },
  { name: 'Slack',      url: 'https://slack-status.com/api/v2/status.json' },
  { name: 'Zoom',       url: 'https://status.zoom.us/api/v2/status.json' },
  { name: 'Cloudflare', url: 'https://www.cloudflarestatus.com/api/v2/status.json' },
  { name: 'Vercel',     url: 'https://www.vercel-status.com/api/v2/status.json' },
  { name: 'Twitch',     url: 'https://twitchstatus.com/api/v2/status.json' },
  { name: 'Shopify',    url: 'https://www.shopifystatus.com/api/v2/status.json' },
  { name: 'Stripe',     url: 'https://status.stripe.com/api/v2/status.json' },
  { name: 'Notion',     url: 'https://notionstatus.com/api/v2/status.json' },
  { name: 'Figma',      url: 'https://status.figma.com/api/v2/status.json' },
  { name: 'Linear',     url: 'https://linearstatus.com/api/v2/status.json' },
  { name: 'Atlassian',  url: 'https://jira-software.status.atlassian.com/api/v2/status.json' },
];

const IMPACT_LABELS: Record<string, string> = {
  critical: 'CRITICAL',
  major:    'MAJOR',
  minor:    'MINOR',
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawLocation = searchParams.get('location') || 'global';
  const location = rawLocation.toLowerCase() === 'global' ? 'global' : rawLocation.toUpperCase();
  const hasLocation = location !== 'global';

  const feedItems: { text: string; type: string; asns?: number[]; locations?: string[] }[] = [];
  const token = process.env.CLOUDFLARE_API_TOKEN;

  // ── 1. Cloudflare Radar: real network outage annotations ─────────────────
  if (token) {
    try {
      const locationQuery = hasLocation ? `&location=${location}` : '';
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/radar/annotations/outages?limit=5&dateRange=7d&format=json${locationQuery}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          next: { revalidate: 60 },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.result?.annotations)) {
          data.result.annotations.slice(0, 4).forEach((ann: any) => {
            const where = ann.locations?.length > 0 ? ann.locations.join(', ') : 'Global';
            const cause = ann.outage?.outageCause
              ? ann.outage.outageCause.replace(/_/g, ' ').toLowerCase()
              : 'cause under investigation';
            const scope = ann.outage?.outageType
              ? ann.outage.outageType.toLowerCase()
              : 'connectivity';

            // Use the description as a self-contained sentence when available;
            // otherwise build a complete sentence from the structured fields.
            let text: string;
            if (ann.description) {
              text = `Network alert: ${sentence(clean(ann.description, 110))}`;
            } else {
              text = `Network alert: ${scope} disruption reported in ${where} due to ${cause}.`;
            }

            feedItems.push({
              text,
              type: 'outage',
              asns: ann.asns || [],
              locations: ann.locations || [],
            });
          });
        }
      }
    } catch (e) {
      console.warn('[marquee] Cloudflare Radar outages failed:', e);
    }

    // Cloudflare Radar general annotations (routing events, elections, shutdowns)
    try {
      const locationQuery = hasLocation ? `&location=${location}` : '';
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/radar/annotations?limit=4&dateRange=3d&format=json${locationQuery}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          next: { revalidate: 120 },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.result?.annotations)) {
          data.result.annotations
            .filter((ann: any) => ann.eventType && ann.eventType !== 'OUTAGE' && ann.description)
            .slice(0, 2)
            .forEach((ann: any) => {
              const where = ann.locations?.length > 0 ? ` (${ann.locations.join(', ')})` : '';
              feedItems.push({
                text: `Radar: ${sentence(clean(ann.description, 100))}${where}`,
                type: 'insight',
                locations: ann.locations || [],
              });
            });
        }
      }
    } catch {
      // Non-critical - skip silently
    }
  }

  // ── 2. Live Statuspage checks - 15 major platforms ───────────────────────
  try {
    const results = await Promise.allSettled(
      STATUS_SITES.map((site) =>
        fetch(site.url, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(4000),
        })
          .then((r) => r.json() as Promise<StatuspageResponse>)
          .then((data) => ({ site, data })),
      ),
    );

    results.forEach((result) => {
      if (result.status !== 'fulfilled') return;
      const { site, data } = result.value;
      const indicator = data.status?.indicator;
      if (!indicator || indicator === 'none') return;

      const label = IMPACT_LABELS[indicator] ?? 'ALERT';

      // Prefer the active incident title (a real sentence) over the generic status description
      const activeIncident = data.incidents?.find(
        (inc) => inc.status !== 'resolved' && inc.status !== 'postmortem',
      );

      let text: string;
      if (activeIncident) {
        text = `${label}: ${site.name} - ${sentence(clean(activeIncident.name, 90))}`;
      } else {
        const description = data.status?.description ?? 'experiencing a service disruption';
        text = `${label}: ${site.name} is currently ${description.toLowerCase()}.`;
      }

      feedItems.push({
        text,
        type: indicator === 'critical' || indicator === 'major' ? 'outage' : 'surge',
      });
    });
  } catch (e) {
    console.error('[marquee] Statuspage batch failed:', e);
  }

  // ── 3. HackerNews RSS - breaking internet & tech news ────────────────────
  try {
    const res = await fetch('https://news.ycombinator.com/rss', {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const text = await res.text();
      const stories = text.split('<item>').slice(1);

      const breakingKeywords =
        /\b(outage|down|crash|offline|incident|surge|spike|ddos|hacked|overload|breach|leak|ban|block|shutdown|disruption|attack|vulnerability|record|billion|milestone|fastest|largest|breaking)\b/i;
      const spamKeywords =
        /show hn:|ask hn:|launch hn:|how to |tutorial|guide|my first|i built|i made/i;

      let hnCount = 0;
      stories.slice(0, 30).forEach((story) => {
        if (hnCount >= 3) return; // cap HN at 3 items to avoid repetition
        const titleMatch = story.match(/<title>(.*?)<\/title>/);
        if (!titleMatch?.[1]) return;
        const title = clean(titleMatch[1], 110);
        if (spamKeywords.test(title) || !breakingKeywords.test(title)) return;

        const isOutage =
          /\b(down|outage|crash|offline|hacked|overload|breach|ban|block|shutdown|attack)\b/i.test(title);
        feedItems.push({
          text: `Breaking: ${sentence(title)}`,
          type: isOutage ? 'outage' : 'news',
        });
        hnCount++;
      });
    }
  } catch (e) {
    console.error('[marquee] HackerNews RSS failed:', e);
  }

  // ── 4. Reddit r/outages RSS - user-reported outages ──────────────────────
  try {
    const res = await fetch('https://www.reddit.com/r/outages.rss?limit=10', {
      headers: { 'User-Agent': 'Pulse Traffic Monitor/1.0' },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const text = await res.text();
      const entries = text.split('<entry>').slice(1);
      let redditCount = 0;
      entries.slice(0, 10).forEach((entry) => {
        if (redditCount >= 2) return; // cap Reddit at 2 items
        const titleMatch = entry.match(/<title(?:[^>]*)>(.*?)<\/title>/);
        if (!titleMatch?.[1]) return;
        const title = clean(titleMatch[1], 100);
        // Skip very short posts or posts that are just questions
        if (title.length < 20 || /\?$/.test(title)) return;
        feedItems.push({
          text: `User report: ${sentence(title)}`,
          type: 'outage',
        });
        redditCount++;
      });
    }
  } catch {
    // Reddit may throttle - fail silently
  }

  // ── 5. Deduplicate by normalised full text ────────────────────────────────
  const seen = new Set<string>();
  const deduped = feedItems.filter((item) => {
    // Normalise: lowercase, strip emojis and punctuation for comparison
    const key = item.text.replace(/[^\w\s]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── 6. Fallback: static facts only when the live feed is empty ───────────
  if (deduped.length < 4) {
    const needed = 6 - deduped.length;
    const shuffled = [...STATIC_TRAFFIC_FACTS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < needed && i < shuffled.length; i++) {
      deduped.push(shuffled[i]);
    }
  }

  return NextResponse.json(deduped, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
  });
}
