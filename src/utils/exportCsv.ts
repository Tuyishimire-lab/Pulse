import { SiteConfig } from '../app/data/sites';

/**
 * Exports the given sites array as a CSV file and triggers a browser download.
 * Entirely client-side - no server requests.
 */
export function exportSitesToCsv(sites: SiteConfig[], filename?: string): void {
  const headers = ['Rank', 'Name', 'URL', 'Category', 'Baseline Traffic', 'Rate (visits/sec)', 'Progress (%)'];
  
  const rows = sites.map((site) => [
    site.rank,
    // Escape name in case it contains commas
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

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `pulse-sites-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
