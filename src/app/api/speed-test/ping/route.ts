export const runtime = 'edge';

/**
 * Ping endpoint — returns the smallest possible response as fast as possible.
 * Used for latency measurement. Cache-busting is handled by the client via
 * a random query param (?cb=...).
 */
export async function GET() {
  return new Response(JSON.stringify({ t: Date.now() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
      'Timing-Allow-Origin': '*',
    },
  });
}
