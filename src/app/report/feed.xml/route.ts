import {
  generateWeeklyReport,
  getReportSlugs,
  type WeeklyReport,
} from '../data/reportGenerator';

export const revalidate = 3600; // Cache feed at edge for 1 hour

const BASE_URL = 'https://pulstraffic.com';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatItemDescription(report: WeeklyReport): string {
  const parts: string[] = [];

  // 1. Executive Summary
  if (report.subheadline) {
    parts.push(report.subheadline);
  } else {
    parts.push(`Weekly web traffic intelligence for Week ${report.weekNumber}, ${report.year}.`);
  }

  // 2. Health & Outages
  const status = report.healthContext?.statusBand ? ` (${report.healthContext.statusBand})` : '';
  parts.push(`WIHI Health Score: ${report.internetHealthScore}/100${status}.`);
  parts.push(`Outages: ${report.outageCount} detected.`);

  // 3. Traffic Velocity
  const rateMillions = (report.totalTopSitesVisitsPerSec / 1e6).toFixed(2);
  const deltaSign = report.trafficChangePercent >= 0 ? '+' : '';
  parts.push(`Aggregate Traffic Velocity: ${rateMillions}M req/s (${deltaSign}${report.trafficChangePercent}% WoW).`);

  // 4. Top Movers
  if (report.topMovers && report.topMovers.length > 0) {
    const moversList = report.topMovers
      .slice(0, 3)
      .map((m) => `${m.site.name} (${m.trafficDelta >= 0 ? '+' : ''}${m.trafficDelta.toFixed(1)}%)`)
      .join(', ');
    parts.push(`Top Movers: ${moversList}.`);
  }

  // 5. Lead Story
  if (report.stories && report.stories.length > 0) {
    parts.push(`Lead Story: ${report.stories[0].title} — ${report.stories[0].summary}`);
  }

  return parts.join(' ');
}

export async function GET(): Promise<Response> {
  try {
    const allSlugs = await getReportSlugs();
    const targetSlugs = (allSlugs || []).slice(0, 10);

    const reports: WeeklyReport[] = [];
    for (const slug of targetSlugs) {
      try {
        const report = await generateWeeklyReport(slug);
        if (report) {
          reports.push(report);
        }
      } catch (err) {
        console.warn(`[Feed XML] Failed to generate report for ${slug}:`, err);
      }
    }

    const lastBuildDate = reports.length > 0
      ? new Date(reports[0].publishedDate).toUTCString()
      : new Date().toUTCString();

    const itemsXml = reports
      .map((report) => {
        const itemUrl = `${BASE_URL}/report/${report.slug}`;
        const itemTitle = `Weekly Internet Report: Week ${report.weekNumber}, ${report.year}`;
        const pubDate = new Date(report.publishedDate).toUTCString();
        const description = escapeXml(formatItemDescription(report));

        return `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pulse — Weekly Internet Report</title>
    <link>${BASE_URL}/report</link>
    <description>Weekly macroeconomic web traffic intelligence and global DNS velocity analysis.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Pulse Platform</generator>
    <atom:link href="${BASE_URL}/report/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml ? `${itemsXml}\n  ` : '  '}</channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[Feed XML] Error generating RSS feed:', error);
    // Graceful fallback to valid empty channel rather than crashing
    const fallbackDate = new Date().toUTCString();
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pulse — Weekly Internet Report</title>
    <link>${BASE_URL}/report</link>
    <description>Weekly macroeconomic web traffic intelligence and global DNS velocity analysis.</description>
    <language>en</language>
    <lastBuildDate>${fallbackDate}</lastBuildDate>
    <generator>Pulse Platform</generator>
    <atom:link href="${BASE_URL}/report/feed.xml" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;

    return new Response(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
}
