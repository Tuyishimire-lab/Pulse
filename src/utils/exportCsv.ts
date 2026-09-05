import { SiteConfig } from '../app/data/sites';

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the given sites array as a CSV file and triggers a browser download.
 */
export function exportSitesToCsv(sites: SiteConfig[], filename?: string): void {
  const headers = ['Rank', 'Name', 'URL', 'Category', 'Baseline Traffic', 'Rate (visits/sec)', 'Progress (%)'];
  
  const rows = sites.map((site) => [
    site.rank,
    `"${site.name.replace(/"/g, '""')}"`,
    site.url,
    site.category,
    `"${site.baseline}"`,
    site.rate,
    site.progress.toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  downloadBlob(
    csvContent,
    filename || `pulse-sites-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Exports the given sites array as an indented JSON file.
 */
export function exportSitesToJson(sites: SiteConfig[], filename?: string): void {
  const data = sites.map((site) => ({
    rank: site.rank,
    name: site.name,
    url: site.url,
    category: site.category,
    baselineTraffic: site.baseline,
    baselineRaw: site.baselineRaw ?? null,
    requestsPerSecond: site.rate,
    progressPercentage: site.progress,
  }));

  downloadBlob(
    JSON.stringify(data, null, 2),
    filename || `pulse-sites-${new Date().toISOString().split('T')[0]}.json`,
    'application/json;charset=utf-8;'
  );
}

/**
 * Exports a head-to-head comparison battle report in CSV or JSON format.
 */
export function exportComparisonReport(
  siteA: SiteConfig,
  siteB: SiteConfig,
  disparity: {
    ratio: number;
    diffBaseline: string;
    winnerName: string;
    velocityAdvantage: string;
  },
  format: 'csv' | 'json' = 'csv'
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `pulse-compare-${siteA.id}-vs-${siteB.id}-${dateStr}.${format}`;

  if (format === 'json') {
    const report = {
      comparisonDate: new Date().toISOString(),
      pair: `${siteA.name} vs ${siteB.name}`,
      verdict: {
        leader: disparity.winnerName,
        trafficMultiplier: `${disparity.ratio}x`,
        monthlyDifferential: disparity.diffBaseline,
        velocityAdvantage: disparity.velocityAdvantage,
      },
      siteA: {
        name: siteA.name,
        rank: siteA.rank,
        url: siteA.url,
        baseline: siteA.baseline,
        rate: siteA.rate,
        category: siteA.category,
      },
      siteB: {
        name: siteB.name,
        rank: siteB.rank,
        url: siteB.url,
        baseline: siteB.baseline,
        rate: siteB.rate,
        category: siteB.category,
      },
    };

    downloadBlob(JSON.stringify(report, null, 2), filename, 'application/json;charset=utf-8;');
  } else {
    const rows = [
      ['Metric', `"${siteA.name}"`, `"${siteB.name}"`, 'Advantage'],
      ['Global Rank', `#${siteA.rank}`, `#${siteB.rank}`, siteA.rank < siteB.rank ? siteA.name : siteB.name],
      ['Monthly Visits', `"${siteA.baseline}"`, `"${siteB.baseline}"`, disparity.winnerName],
      ['Requests per Sec', `${siteA.rate}/s`, `${siteB.rate}/s`, siteA.rate > siteB.rate ? siteA.name : siteB.name],
      ['Traffic Multiplier', `${disparity.ratio}x`, '-', disparity.winnerName],
      ['Net Traffic Lead', disparity.diffBaseline, '-', disparity.winnerName],
      ['Velocity Momentum', disparity.velocityAdvantage, '-', '-'],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
  }
}

/**
 * Exports country rankings report as CSV or JSON.
 */
export function exportCountryRankingReport(
  countryName: string,
  cfCode: string,
  sites: SiteConfig[],
  format: 'csv' | 'json' = 'csv'
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `pulse-top-${cfCode.toLowerCase()}-${dateStr}.${format}`;

  if (format === 'json') {
    const report = {
      country: countryName,
      countryCode: cfCode,
      exportedAt: new Date().toISOString(),
      topSites: sites.map((site, idx) => ({
        localRank: idx + 1,
        name: site.name,
        url: site.url,
        category: site.category,
        globalRank: site.rank,
        monthlyVisits: site.baseline,
        requestsPerSec: site.rate,
      })),
    };

    downloadBlob(JSON.stringify(report, null, 2), filename, 'application/json;charset=utf-8;');
  } else {
    const headers = ['Local Rank', 'Name', 'URL', 'Category', 'Global Rank', 'Monthly Visits', 'Requests / sec'];
    const rows = sites.map((site, idx) => [
      idx + 1,
      `"${site.name.replace(/"/g, '""')}"`,
      site.url,
      site.category,
      site.rank,
      `"${site.baseline}"`,
      site.rate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
  }
}
