import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

/**
 * OmniRoute Telemetry & Canonical Compare-Slug Enforcement Proxy
 *
 * NOTE: In Next.js 16, the middleware convention is deprecated and superseded
 * by `proxy.ts`. See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */

const OMNIROUTE_ENDPOINT = 'https://omni-route-rho.vercel.app/api/v1/track';
const YOUR_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'www.pulstraffic.com';

const AI_BOTS = [
  'gptbot',
  'claudebot',
  'perplexitybot',
  'bytespider',
  'oai-searchbot',
  'applebot-extended',
  'google-extended',
  'diffbot',
  'cohere-ai',
  'anthropic-ai',
];

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

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const referer = request.headers.get('referer') || '';
  const isAiCrawler = AI_BOTS.some((bot) => ua.includes(bot));
  const isAiReferral = /chatgpt|perplexity|claude|gemini|copilot/i.test(referer);

  // If non-human or AI referral, capture telemetry in background
  if (isAiCrawler || isAiReferral) {
    event.waitUntil(
      fetch(OMNIROUTE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-user-agent': request.headers.get('user-agent') || '',
          'x-forwarded-referer': referer,
        },
        body: JSON.stringify({
          domain: YOUR_DOMAIN,
          path: request.nextUrl.pathname,
        }),
      }).catch(() => {})
    );
  }

  const { pathname } = request.nextUrl;

  // 1. Canonical compare-slug enforcement (/compare/<slug>)
  const match = pathname.match(/^\/compare\/([^/]+)$/);
  if (match) {
    const slug = match[1];

    // Check non-editorial pairs for ordering
    if (!EDITORIAL_SLUGS.has(slug)) {
      const vsMatch = slug.match(/^(.+)-vs-(.+)$/);
      if (vsMatch) {
        const [, idA, idB] = vsMatch;

        // Reversed - redirect to canonical ordering (308 = permanent)
        if (idA > idB) {
          const canonicalSlug = `${idB}-vs-${idA}`;
          const canonicalUrl = new URL(`/compare/${canonicalSlug}`, request.url);
          canonicalUrl.search = request.nextUrl.search;
          const redirectResponse = NextResponse.redirect(canonicalUrl, 308);
          redirectResponse.headers.set('x-omniroute-tracked', '1');
          return redirectResponse;
        }
      }
    }
  }

  // 2. Attach diagnostic header so OmniRoute Verifier detects your proxy/middleware
  const response = NextResponse.next();
  response.headers.set('x-omniroute-tracked', '1');
  return response;
}

// Backwards compatibility and aliases
export { proxy as middleware };
export default proxy;

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|robots.txt).*)'],
};