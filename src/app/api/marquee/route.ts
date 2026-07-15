import { NextResponse } from 'next/server';
import { SITES } from '../../data/sites';

export const dynamic = 'force-dynamic';

interface StatuspageResponse {
  page?: {
    id: string;
    name: string;
    url: string;
  };
  status?: {
    indicator: 'none' | 'minor' | 'major' | 'critical';
    description: string;
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawLocation = searchParams.get('location') || 'global';
  const location = rawLocation.toLowerCase() === 'global' ? 'global' : rawLocation.toUpperCase();
  const hasLocation = location !== 'global';

  const feedItems: { text: string; type: string; asns?: number[]; locations?: string[] }[] = [];
  const token = process.env.CLOUDFLARE_API_TOKEN;

  // 1. Fetch Cloudflare Radar Outages if token is available
  let cloudflareOutagesFetched = false;
  if (token) {
    try {
      const locationQuery = hasLocation ? `&location=${location}` : '';
      const radarUrl = `https://api.cloudflare.com/client/v4/radar/annotations/outages?limit=5&dateRange=7d&format=json${locationQuery}`;
      const res = await fetch(radarUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result && Array.isArray(data.result.annotations)) {
          const annotations = data.result.annotations;
          annotations.forEach((ann: any) => {
            const locationsStr = ann.locations && ann.locations.length > 0 ? ann.locations.join(', ') : 'Global';
            const cause = ann.outage?.outageCause ? `due to ${ann.outage.outageCause.replace('_', ' ')}` : 'under investigation';
            const scope = ann.outage?.outageType ? `${ann.outage.outageType.toLowerCase()} outage` : 'connectivity disruption';
            
            feedItems.push({
              text: `CLOUD ALERT: Active ${scope} in ${locationsStr} (${cause}).`,
              type: 'outage',
              asns: ann.asns || [],
              locations: ann.locations || []
            });
          });
          cloudflareOutagesFetched = feedItems.length > 0;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Cloudflare Radar outages for marquee:', e);
    }
  }

  // 2. Fetch Status Pages (Outage checks) as secondary or fallback
  if (!cloudflareOutagesFetched) {
    try {
      const statusUrls = [
        { name: 'OpenAI', url: 'https://status.openai.com/api/v2/status.json' },
        { name: 'GitHub', url: 'https://www.githubstatus.com/api/v2/status.json' },
        { name: 'Vercel', url: 'https://www.vercel-status.com/api/v2/status.json' },
        { name: 'Reddit', url: 'https://www.redditstatus.com/api/v2/status.json' }
      ];

      const results = await Promise.allSettled(
        statusUrls.map(item => 
          fetch(item.url, { next: { revalidate: 60 } })
            .then(res => res.json() as Promise<StatuspageResponse>)
        )
      );

      results.forEach((result, index) => {
        const siteName = statusUrls[index].name;
        if (result.status === 'fulfilled') {
          const data = result.value;
          const status = data.status?.indicator;
          const description = data.status?.description;

          if (status && status !== 'none') {
            feedItems.push({
              text: `OUTAGE ALERT: ${siteName} reports ${description} (${status.toUpperCase()} status).`,
              type: 'outage'
            });
          }
        }
      });
    } catch (e) {
      console.error('Outage statuses fetch failed', e);
    }
  }

  // 2. Fetch Hacker News RSS Feed and filter specifically for outages/crashes/surges
  try {
    const res = await fetch('https://news.ycombinator.com/rss', { next: { revalidate: 300 } });
    if (res.ok) {
      const text = await res.text();
      const items = text.split('<item>');
      const stories = items.slice(1);
      
      const outageKeywords = /\b(outage|down|crash|offline|incident|surge|spike|ddos|hacked|overload)\b/i;

      stories.forEach((story) => {
        const titleMatch = story.match(/<title>(.*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          const decodedTitle = titleMatch[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/');

          const titleLower = decodedTitle.toLowerCase();
          const isSpam = titleLower.includes('show hn:') || 
                          titleLower.includes('ask hn:') || 
                          titleLower.includes('launch hn:') ||
                          titleLower.startsWith('how ') ||
                          titleLower.includes('tutorial') ||
                          titleLower.includes('guide') ||
                          titleLower.includes('my ');

          if (outageKeywords.test(decodedTitle) && !isSpam) {
            const isOutage = /\b(down|outage|crash|offline|hacked|overload)\b/i.test(decodedTitle);
            feedItems.push({
              text: `LIVE REPORT: ${decodedTitle}`,
              type: isOutage ? 'outage' : 'surge'
            });
          }
        }
      });
    }
  } catch (e) {
    console.error('Hacker News RSS fetch failed', e);
  }

  // 3. Dynamic filler generation targeting traffic surges and outages for our SITES dataset
  if (feedItems.length < 5) {
    const targetCount = 6;
    const fillersNeeded = targetCount - feedItems.length;

    const templates = [
      (name: string, p: number) => ({ text: `TRAFFIC SURGE: ${name} estimated concurrent queries surge +${p}% in response to trending global traffic.`, type: 'surge' }),
      (name: string, p: number) => ({ text: `TRAFFIC SURGE: ${name} mobile traffic estimated share spikes +${p}%.`, type: 'surge' }),
      (name: string) => ({ text: `OUTAGE UPDATE: Minor routing latency resolved on ${name} CDN server clusters.`, type: 'outage' }),
      (name: string, p: number) => ({ text: `TRAFFIC SURGE: Claude/ChatGPT API response splits drive ${name} query surges by +${p}%.`, type: 'surge' }),
      (name: string, p: number) => ({ text: `TRAFFIC SURGE: Global streaming bandwidth demands surge +${p}% on ${name} edge infrastructure.`, type: 'surge' }),
    ];

    for (let i = 0; i < fillersNeeded; i++) {
      const randomSite = SITES[Math.floor(Math.random() * SITES.length)];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      const randomPercent = Math.floor(Math.random() * 20) + 5;

      feedItems.push(randomTemplate(randomSite.name, randomPercent));
    }
  }

  return NextResponse.json(feedItems, {
    headers: {
      'Cache-Control': 'public, s-maxage=0, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
