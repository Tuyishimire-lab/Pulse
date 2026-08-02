/**
 * Strips protocol and www prefix from a URL to return a bare domain.
 * e.g. "https://www.google.com/search" → "google.com"
 */
export function parseDomain(url: string): string {
  return url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')
    .split('/')[0]
    .toLowerCase();
}
