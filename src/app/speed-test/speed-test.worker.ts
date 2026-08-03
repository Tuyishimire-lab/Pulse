/* ═══════════════════════════════════════════════════════════════════════════
   Pulse Speed Test — Web Worker Measurement Engine  (v2)
   ═══════════════════════════════════════════════════════════════════════════
   Runs entirely off the main thread. Communicates via postMessage.

   v2 improvements over v1:
   - Download: 25MB streaming chunks, 3 starting streams, 1s warmup
   - Upload: XMLHttpRequest with upload.onprogress for real byte tracking
   - Ping: 12 pings (2 warmup), 30ms spacing
   - Convergence: ±5% with 3 min windows — test completes in ~15-20s
   ═══════════════════════════════════════════════════════════════════════════ */

/// <reference lib="webworker" />

import type {
  WorkerCommand, WorkerMessage, SpeedMetric, PingMetric,
  BufferbloatResult,
} from './types';
import {
  median, stddev, gradeBufferbloat, computeQualityScore, computeVerdicts,
} from './types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

let aborted = false;

ctx.onmessage = (e: MessageEvent<WorkerCommand>) => {
  if (e.data.type === 'abort') {
    aborted = true;
    return;
  }
  if (e.data.type === 'start') {
    aborted = false;
    runTest(e.data.baseUrl).catch((err) => {
      post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
    });
  }
};

function post(msg: WorkerMessage) {
  ctx.postMessage(msg);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main test orchestrator
   ═══════════════════════════════════════════════════════════════════════════ */

async function runTest(baseUrl: string) {
  // 1. Ping phase
  post({ type: 'phase', phase: 'ping' });
  const pingResult = await measurePing(baseUrl);
  if (aborted) return;
  post({ type: 'ping-complete', result: pingResult });

  // 2. Download phase (with bufferbloat detection)
  post({ type: 'phase', phase: 'download' });
  const { download, bufferbloat } = await measureDownload(baseUrl, pingResult);
  if (aborted) return;
  post({ type: 'download-complete', result: download, bufferbloat });

  // 3. Upload phase
  post({ type: 'phase', phase: 'upload' });
  const upload = await measureUpload(baseUrl);
  if (aborted) return;
  post({ type: 'upload-complete', result: upload });

  // 4. Compute final score + verdicts
  const qualityScore = computeQualityScore(download, upload, pingResult, bufferbloat);
  const verdicts = computeVerdicts(download, upload, pingResult, pingResult.jitter);

  post({
    type: 'complete',
    result: { download, upload, ping: pingResult, bufferbloat, qualityScore, verdicts },
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   PING measurement  (v2: 12 pings, 2 warmup, 30ms spacing)
   ═══════════════════════════════════════════════════════════════════════════ */

async function measurePing(baseUrl: string): Promise<PingMetric> {
  const TOTAL_PINGS = 12;
  const WARMUP = 2;
  const samples: number[] = [];

  for (let i = 0; i < TOTAL_PINGS; i++) {
    if (aborted) break;
    const start = performance.now();
    await fetch(`${baseUrl}/api/speed-test/ping?cb=${Math.random()}`, {
      cache: 'no-store',
    });
    const rtt = performance.now() - start;

    if (i >= WARMUP) {
      samples.push(rtt);
    }

    post({ type: 'ping-progress', index: i, rtt });
    await sleep(30);
  }

  return {
    median: round2(median(samples)),
    min: round2(Math.min(...samples)),
    max: round2(Math.max(...samples)),
    jitter: round2(stddev(samples)),
    samples: samples.map(round2),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   DOWNLOAD measurement  (v2: 25MB chunks, 3 start streams, 1s warmup)
   ═══════════════════════════════════════════════════════════════════════════ */

async function measureDownload(
  baseUrl: string,
  pingResult: PingMetric,
): Promise<{ download: SpeedMetric; bufferbloat: BufferbloatResult }> {
  const WARMUP_MS = 1000;
  const MAX_DURATION_MS = 12000;
  const WINDOW_MS = 1000;
  const CONVERGENCE_THRESHOLD = 0.05; // ±5%
  const MIN_WINDOWS = 3;
  const INITIAL_STREAMS = 3;
  const MAX_STREAMS = 8;
  const CHUNK_SIZE = 25 * 1024 * 1024; // 25MB per stream request
  const SCALE_INTERVAL_MS = 1000;

  let totalBytes = 0;
  let testStartTime = performance.now();
  let windowBytes = 0;
  let windowStart = performance.now();
  const windowSpeeds: number[] = [];
  let inWarmup = true;
  let peakSpeed = 0;
  let streamCount = 0;
  let settled = false; // flag to tell streams to stop

  // Bufferbloat: fire pings during download
  const loadedPings: number[] = [];
  const bbPingInterval = setInterval(async () => {
    try {
      const start = performance.now();
      await fetch(`${baseUrl}/api/speed-test/ping?cb=${Math.random()}`, { cache: 'no-store' });
      loadedPings.push(performance.now() - start);
    } catch { /* ignore ping failures during load */ }
  }, 500);

  // Stream: fetch a 25MB payload and read it in a streaming loop
  const activeStreams = new Set<Promise<void>>();

  const spawnStream = () => {
    const p = (async () => {
      while (!aborted && !settled) {
        try {
          const resp = await fetch(
            `${baseUrl}/api/speed-test/download?bytes=${CHUNK_SIZE}&cb=${Math.random()}`,
            { cache: 'no-store' },
          );
          if (!resp.body) return;
          const reader = resp.body.getReader();
          while (true) { // eslint-disable-line no-constant-condition
            if (aborted || settled) { reader.cancel(); return; }
            const { done, value } = await reader.read();
            if (done) break;
            const bytes = value?.byteLength ?? 0;
            totalBytes += bytes;
            windowBytes += bytes;

            const now = performance.now();
            const elapsed = now - testStartTime;

            // Check warmup
            if (inWarmup && elapsed > WARMUP_MS) {
              inWarmup = false;
              testStartTime = now;
              totalBytes = 0;
              windowBytes = 0;
              windowStart = now;
              windowSpeeds.length = 0;
            }

            // Sliding window
            if (!inWarmup && now - windowStart >= WINDOW_MS) {
              const windowDuration = (now - windowStart) / 1000;
              const speedMbps = (windowBytes * 8) / (windowDuration * 1_000_000);
              windowSpeeds.push(speedMbps);
              if (speedMbps > peakSpeed) peakSpeed = speedMbps;
              windowBytes = 0;
              windowStart = now;

              post({
                type: 'download-progress',
                speedMbps: round2(median(windowSpeeds)),
                bytes: totalBytes,
                elapsed: round2(elapsed),
              });

              // Convergence check
              if (windowSpeeds.length >= MIN_WINDOWS) {
                const med = median(windowSpeeds);
                const dev = stddev(windowSpeeds);
                if (med > 0 && dev / med <= CONVERGENCE_THRESHOLD) {
                  settled = true;
                  reader.cancel();
                  return;
                }
              }
            }

            // Hard time limit
            if (elapsed > MAX_DURATION_MS) { settled = true; reader.cancel(); return; }
          }
        } catch { /* stream error — retry if not settled */ }
      }
    })();

    activeStreams.add(p);
    p.finally(() => activeStreams.delete(p));
    return p;
  };

  // Launch initial streams immediately (saturate the pipe fast)
  for (let i = 0; i < INITIAL_STREAMS; i++) {
    spawnStream();
    streamCount = i + 1;
  }

  // Wait for warmup + first few windows, then adaptively scale
  await sleep(WARMUP_MS + SCALE_INTERVAL_MS);

  let lastMedian = median(windowSpeeds);

  for (let round = INITIAL_STREAMS; round < MAX_STREAMS && !aborted && !settled; round++) {
    spawnStream();
    streamCount = round + 1;
    await sleep(SCALE_INTERVAL_MS);
    if (aborted || settled) break;

    const currentMedian = median(windowSpeeds);
    // If adding a stream didn't improve speed by >5%, stop scaling
    if (lastMedian > 0 && currentMedian / lastMedian < 1.05) break;
    lastMedian = currentMedian;

    // Check convergence
    if (windowSpeeds.length >= MIN_WINDOWS) {
      const dev = stddev(windowSpeeds);
      if (currentMedian > 0 && dev / currentMedian <= CONVERGENCE_THRESHOLD) break;
    }
  }

  // Signal all streams to stop and wait
  settled = true;
  await Promise.allSettled(Array.from(activeStreams));
  clearInterval(bbPingInterval);

  const duration = performance.now() - testStartTime;

  // Bufferbloat result
  const loadedPingMedian = loadedPings.length > 0 ? median(loadedPings) : pingResult.median;
  const bufferbloat: BufferbloatResult = {
    idlePing: round2(pingResult.median),
    loadedPing: round2(loadedPingMedian),
    grade: gradeBufferbloat(pingResult.median, loadedPingMedian),
  };

  const download: SpeedMetric = {
    speed: round2(median(windowSpeeds)),
    peak: round2(peakSpeed),
    streams: streamCount,
    bytesTransferred: totalBytes,
    duration: round2(duration),
    samples: windowSpeeds.map(round2),
  };

  return { download, bufferbloat };
}

/* ═══════════════════════════════════════════════════════════════════════════
   UPLOAD measurement  (v2: XMLHttpRequest with upload.onprogress)
   ═══════════════════════════════════════════════════════════════════════════
   Uses XHR instead of fetch() because XHR fires upload.onprogress events
   as bytes actually leave the network adapter, giving us real throughput
   instead of memory-buffer speed.
   ═══════════════════════════════════════════════════════════════════════════ */

async function measureUpload(baseUrl: string): Promise<SpeedMetric> {
  const WARMUP_MS = 1000;
  const MAX_DURATION_MS = 12000;
  const WINDOW_MS = 1000;
  const CONVERGENCE_THRESHOLD = 0.05;
  const MIN_WINDOWS = 3;
  const UPLOAD_CHUNK = 2 * 1024 * 1024; // 2MB per POST (Vercel body limit)
  const INITIAL_STREAMS = 2;
  const MAX_STREAMS = 6;
  const SCALE_INTERVAL_MS = 1000;

  let totalBytes = 0;
  let testStartTime = performance.now();
  let windowBytes = 0;
  let windowStart = performance.now();
  const windowSpeeds: number[] = [];
  let inWarmup = true;
  let peakSpeed = 0;
  let streamCount = 0;
  let settled = false;

  // Generate random upload payload — fill in 64KB chunks
  const payload = new Uint8Array(UPLOAD_CHUNK);
  const CRYPTO_CHUNK = 65536;
  for (let offset = 0; offset < UPLOAD_CHUNK; offset += CRYPTO_CHUNK) {
    const len = Math.min(CRYPTO_CHUNK, UPLOAD_CHUNK - offset);
    crypto.getRandomValues(payload.subarray(offset, offset + len));
  }

  /**
   * Upload a single chunk via XMLHttpRequest.
   * Returns a promise that resolves with the number of bytes the
   * browser *actually reported* as sent via onprogress events.
   */
  const uploadOneXHR = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let progressBytes = 0;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const delta = e.loaded - progressBytes;
          if (delta > 0) {
            totalBytes += delta;
            windowBytes += delta;
            progressBytes = e.loaded;

            // Process windows during upload progress
            const now = performance.now();
            const elapsed = now - testStartTime;

            if (inWarmup && elapsed > WARMUP_MS) {
              inWarmup = false;
              testStartTime = now;
              totalBytes = 0;
              windowBytes = 0;
              windowStart = now;
              windowSpeeds.length = 0;
            }

            if (!inWarmup && now - windowStart >= WINDOW_MS) {
              const windowDuration = (now - windowStart) / 1000;
              const speedMbps = (windowBytes * 8) / (windowDuration * 1_000_000);
              windowSpeeds.push(speedMbps);
              if (speedMbps > peakSpeed) peakSpeed = speedMbps;
              windowBytes = 0;
              windowStart = now;

              post({
                type: 'upload-progress',
                speedMbps: round2(median(windowSpeeds)),
                bytes: totalBytes,
                elapsed: round2(elapsed),
              });
            }
          }
        }
      };

      xhr.onload = () => resolve(progressBytes);
      xhr.onerror = () => reject(new Error('XHR upload error'));
      xhr.ontimeout = () => reject(new Error('XHR upload timeout'));

      xhr.open('POST', `${baseUrl}/api/speed-test/upload?cb=${Math.random()}`);
      xhr.timeout = MAX_DURATION_MS;
      xhr.send(payload);
    });
  };

  // Stream: continuously upload chunks until settled
  const activeStreams = new Set<Promise<void>>();

  const spawnUploadStream = () => {
    const p = (async () => {
      while (!aborted && !settled) {
        try {
          await uploadOneXHR();
        } catch { /* ignore single chunk failures */ }

        // Check convergence after each chunk
        if (!inWarmup && windowSpeeds.length >= MIN_WINDOWS) {
          const med = median(windowSpeeds);
          const dev = stddev(windowSpeeds);
          if (med > 0 && dev / med <= CONVERGENCE_THRESHOLD) { settled = true; return; }
        }

        // Hard time limit
        const elapsed = performance.now() - testStartTime;
        if (elapsed > MAX_DURATION_MS) { settled = true; return; }
      }
    })();

    activeStreams.add(p);
    p.finally(() => activeStreams.delete(p));
    return p;
  };

  // Launch initial streams
  for (let i = 0; i < INITIAL_STREAMS; i++) {
    spawnUploadStream();
    streamCount = i + 1;
  }

  // Wait for warmup + first windows
  await sleep(WARMUP_MS + SCALE_INTERVAL_MS);

  // Adaptive scaling
  let lastMedian = median(windowSpeeds);

  for (let round = INITIAL_STREAMS; round < MAX_STREAMS && !aborted && !settled; round++) {
    spawnUploadStream();
    streamCount = round + 1;
    await sleep(SCALE_INTERVAL_MS);
    if (aborted || settled) break;

    const currentMedian = median(windowSpeeds);
    if (lastMedian > 0 && currentMedian / lastMedian < 1.05) break;
    lastMedian = currentMedian;

    if (windowSpeeds.length >= MIN_WINDOWS) {
      const dev = stddev(windowSpeeds);
      if (currentMedian > 0 && dev / currentMedian <= CONVERGENCE_THRESHOLD) break;
    }
  }

  settled = true;
  await Promise.allSettled(Array.from(activeStreams));

  const duration = performance.now() - testStartTime;

  return {
    speed: round2(median(windowSpeeds)),
    peak: round2(peakSpeed),
    streams: streamCount,
    bytesTransferred: totalBytes,
    duration: round2(duration),
    samples: windowSpeeds.map(round2),
  };
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
