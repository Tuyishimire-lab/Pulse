import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Canonical compare-slug enforcement.
 *
 * Problem: /compare/youtube-vs-spotify and /compare/spotify-vs-youtube would
 * both render identical content (just A and B swapped), creating near-duplicate
 * thin pages that poison crawl budget at scale (~10,000 pairs for 100 sites).
 *
 * Fix: Pick one canonical ordering - lexicographically smaller ID first.
 * Any reversed slug gets a permanent 308 redirect to the canonical form.
 *
 * Examples:
 *   /compare/youtube-vs-spotify  -> 308 -> /compare/spotify-vs-youtube  (s < y)
 *   /compare/google-vs-chatgpt   -> 308 -> /compare/chatgpt-vs-google   (c < g)
 *   /compare/spotify-vs-youtube  -> 200 (already canonical)
 *
 * Exception: hand-crafted pairs in COMPARE_PAIRS are served as-is regardless
 * of ordering, because they have editorial content intentionally authored for
 * that specific ordering. Only dynamic (non-editorial) pairs are redirected.
 *
 * NOTE: This file follows the Next.js 16 "proxy" file convention.
 * See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */

// Hand-crafted slugs that have intentional A->B ordering and must not be redirected.
// Keep in sync with COMPARE_PAIRS in src/app/compare/data/pairs.ts.
const EDITORIAL_SLUGS = new Set([
  'youtube-vs-tiktok',
  'google-vs-bing',
  'reddit-vs-quora',
  'facebook-vs-instagram',
  'netflix-vs-youtube',
  'amazon-vs-ebay',
  'chatgpt-vs-google',
  'github-vs-stackoverflow',
  'discord-vs-slack',
  'instagram-vs-tiktok',
  'linkedin-vs-x',
  'duckduckgo-vs-google',
  'spotify-vs-youtube',
  'zoom-vs-microsoft',
  'twitch-vs-youtube',
  'reddit-vs-x',
  'openai-vs-google',
  'wikipedia-vs-quora',
  'canva-vs-figma',
  'pinterest-vs-instagram',
  'netflix-vs-disney',
  'twitter-vs-threads',
  'shopify-vs-amazon',
  'reddit-vs-stackoverflow',
  'apple-vs-microsoft',
  'gmail-vs-outlook',
  'twitch-vs-kick',
  'paypal-vs-stripe',
  'wordpress-vs-wix',
  'binance-vs-coinbase',
  'microsoft-vs-google',
  'notion-vs-confluence',
  'amazon-vs-walmart',
  'google-docs-vs-microsoft-word',
  'linkedin-vs-glassdoor',
  'npm-vs-github',
  'whatsapp-vs-telegram',
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only act on /compare/<slug> paths
  const match = pathname.match(/^\/compare\/([^/]+)$/);
  if (!match) return NextResponse.next();

  const slug = match[1];

  // Skip editorial pairs - their ordering is intentional
  if (EDITORIAL_SLUGS.has(slug)) return NextResponse.next();

  // Parse the slug into two site IDs
  const vsMatch = slug.match(/^(.+)-vs-(.+)$/);
  if (!vsMatch) return NextResponse.next();

  const [, idA, idB] = vsMatch;

  // Already canonical (A <= B lexicographically) - serve normally
  if (idA <= idB) return NextResponse.next();

  // Reversed - redirect to canonical ordering (308 = permanent, method-preserving)
  const canonicalSlug = `${idB}-vs-${idA}`;
  const canonicalUrl = new URL(`/compare/${canonicalSlug}`, request.url);
  canonicalUrl.search = request.nextUrl.search;
  return NextResponse.redirect(canonicalUrl, 308);
}

export const config = {
  matcher: ['/compare/:path*'],
};