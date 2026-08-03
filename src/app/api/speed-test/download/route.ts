export const runtime = 'edge';

const DEFAULT_BYTES = 25 * 1024 * 1024;  // 25 MB
const MAX_BYTES = 25 * 1024 * 1024;      // 25 MB cap
const STREAM_CHUNK = 262144;             // 256 KB per stream chunk (4x previous)

// Pre-fill a 1MB reusable buffer with random data ONCE at cold-start.
// Reusing this avoids the huge CPU cost of calling crypto.getRandomValues()
// for every 64KB chunk during streaming — which was the main throughput
// bottleneck on Edge and the reason download was CPU-limited.
const PREFILL_SIZE = 1024 * 1024; // 1 MB
let prefilled: Uint8Array | null = null;

function getPrefilledBuffer(): Uint8Array {
  if (!prefilled) {
    prefilled = new Uint8Array(PREFILL_SIZE);
    // Fill in 64KB batches (crypto.getRandomValues limit)
    const batchSize = 65536;
    for (let offset = 0; offset < PREFILL_SIZE; offset += batchSize) {
      const len = Math.min(batchSize, PREFILL_SIZE - offset);
      crypto.getRandomValues(prefilled.subarray(offset, offset + len));
    }
  }
  return prefilled;
}

/**
 * Download endpoint — streams data to the client for throughput measurement.
 *
 * v2: Uses a pre-filled random buffer that's reused cyclically instead of
 * calling crypto.getRandomValues() per chunk. This makes the Edge function
 * ~10-20x faster, so on Vercel the bottleneck is the user's internet
 * connection (not our CPU), giving accurate speed measurements.
 *
 * Query params:
 *   ?bytes=<n>  — total bytes to stream (default 25MB, max 25MB)
 *   ?cb=<rand>  — cache buster (ignored server-side)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedBytes = parseInt(url.searchParams.get('bytes') || '', 10);
  const totalBytes = Math.min(
    Number.isFinite(requestedBytes) && requestedBytes > 0 ? requestedBytes : DEFAULT_BYTES,
    MAX_BYTES,
  );

  const buffer = getPrefilledBuffer();
  let bytesSent = 0;
  let bufferOffset = 0;

  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= totalBytes) {
        controller.close();
        return;
      }

      const remaining = totalBytes - bytesSent;
      const chunkLen = Math.min(STREAM_CHUNK, remaining);

      // Copy from the prefilled buffer cyclically
      const chunk = new Uint8Array(chunkLen);
      let written = 0;
      while (written < chunkLen) {
        const available = buffer.length - bufferOffset;
        const toCopy = Math.min(available, chunkLen - written);
        chunk.set(buffer.subarray(bufferOffset, bufferOffset + toCopy), written);
        written += toCopy;
        bufferOffset = (bufferOffset + toCopy) % buffer.length;
      }

      controller.enqueue(chunk);
      bytesSent += chunkLen;
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': totalBytes.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
      'Timing-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
