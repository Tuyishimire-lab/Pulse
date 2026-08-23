export const runtime = 'edge';

/**
 * Upload endpoint - accepts and discards POST data.
 * The client sends blobs of random data and measures upload throughput.
 * We read the entire body (forcing the transfer to happen) then discard it.
 */
export async function POST(request: Request) {
  let totalBytes = 0;

  if (request.body) {
    const reader = request.body.getReader();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value?.byteLength ?? 0;
    }
  }

  return new Response(JSON.stringify({ bytes: totalBytes }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Timing-Allow-Origin': '*',
    },
  });
}

/** Handle CORS preflight for upload */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
