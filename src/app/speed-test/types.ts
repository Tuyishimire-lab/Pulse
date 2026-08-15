/* ═══════════════════════════════════════════════════════════════════════════
   Pulse Speed Test  -  Shared Types
   ═══════════════════════════════════════════════════════════════════════════ */

/** Complete result from a single speed test run */
export interface SpeedTestResult {
  id: string;
  timestamp: number;
  download: SpeedMetric;
  upload: SpeedMetric;
  ping: PingMetric;
  bufferbloat: BufferbloatResult;
  qualityScore: number;
  verdicts: Verdicts;
  meta: ConnectionMeta;
}

/** Throughput measurement for download or upload */
export interface SpeedMetric {
  speed: number;           // Mbps (median of sliding windows)
  peak: number;            // Mbps (best window)
  streams: number;         // # of parallel connections used
  bytesTransferred: number;
  duration: number;        // ms (excluding warmup)
  samples: number[];       // all window measurements in Mbps
}

/** Latency measurement */
export interface PingMetric {
  median: number;   // ms
  min: number;      // ms
  max: number;      // ms
  jitter: number;   // ms (standard deviation)
  samples: number[];
  wsUsed?: boolean; // true if WebSocket was used for ping measurement
}

/** Bufferbloat detection  -  latency under load */
export interface BufferbloatResult {
  idlePing: number;    // ms  -  baseline latency
  loadedPing: number;  // ms  -  latency during download
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/** Practical use-case verdicts */
export interface Verdicts {
  streaming4k: VerdictLevel;
  gaming: VerdictLevel;
  videoCalls: VerdictLevel;
  browsing: VerdictLevel;
}

export type VerdictLevel = 'excellent' | 'good' | 'poor';

/** Connection metadata from server headers */
export interface ConnectionMeta {
  ip: string;
  isp: string;
  city: string;
  country: string;
  server: string;
}

/* ── Worker ↔ UI message types ──────────────────────────────────────────── */

export type WorkerCommand =
  | { type: 'start'; baseUrl: string }
  | { type: 'abort' };

/* ── WebSocket message types ────────────────────────────────────────────── */

export interface WsPingMessage {
  type: 'ping' | 'ping-loaded';
  ts: number; // client timestamp (performance.now or Date.now)
}

export interface WsPongMessage {
  type: 'pong';
  clientTs: number;
  serverTs: number;
  loaded: boolean;
}

export type WorkerMessage =
  | { type: 'phase'; phase: TestPhase }
  | { type: 'ping-progress'; index: number; rtt: number }
  | { type: 'ping-complete'; result: PingMetric }
  | { type: 'download-progress'; speedMbps: number; bytes: number; elapsed: number }
  | { type: 'download-complete'; result: SpeedMetric; bufferbloat: BufferbloatResult }
  | { type: 'upload-progress'; speedMbps: number; bytes: number; elapsed: number }
  | { type: 'upload-complete'; result: SpeedMetric }
  | { type: 'complete'; result: Omit<SpeedTestResult, 'id' | 'timestamp' | 'meta'> }
  | { type: 'error'; message: string };

export type TestPhase = 'idle' | 'connecting' | 'ping' | 'download' | 'upload' | 'complete';

/* ── Scoring helpers ────────────────────────────────────────────────────── */

/** Compute the Pulse Quality Score (0-100) */
export function computeQualityScore(
  download: SpeedMetric,
  upload: SpeedMetric,
  ping: PingMetric,
  bufferbloat: BufferbloatResult,
): number {
  // Download score: 0-100 (100Mbps+ = 100)
  const dlScore = Math.min(100, (download.speed / 100) * 100);
  // Upload score: 0-100 (50Mbps+ = 100)
  const ulScore = Math.min(100, (upload.speed / 50) * 100);
  // Ping score: 0-100 (≤5ms = 100, ≥200ms = 0)
  const pingScore = Math.max(0, Math.min(100, 100 - ((ping.median - 5) / 195) * 100));
  // Jitter score: 0-100 (≤1ms = 100, ≥50ms = 0)
  const jitterScore = Math.max(0, Math.min(100, 100 - ((ping.jitter - 1) / 49) * 100));
  // Bufferbloat score: A=100, B=80, C=60, D=30, F=0
  const bbMap = { A: 100, B: 80, C: 60, D: 30, F: 0 };
  const bbScore = bbMap[bufferbloat.grade];

  // Weighted composite
  const score = dlScore * 0.30 + ulScore * 0.20 + pingScore * 0.25 + jitterScore * 0.15 + bbScore * 0.10;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/** Compute practical verdicts from metrics */
export function computeVerdicts(
  download: SpeedMetric,
  upload: SpeedMetric,
  ping: PingMetric,
  jitter: number,
): Verdicts {
  return {
    streaming4k:
      download.speed >= 25 ? 'excellent' : download.speed >= 10 ? 'good' : 'poor',
    gaming:
      ping.median <= 30 && jitter <= 10 ? 'excellent'
        : ping.median <= 60 && jitter <= 25 ? 'good' : 'poor',
    videoCalls:
      download.speed >= 5 && upload.speed >= 3 && ping.median <= 100
        ? 'excellent'
        : download.speed >= 2 && upload.speed >= 1 ? 'good' : 'poor',
    browsing:
      download.speed >= 10 && ping.median <= 100 ? 'excellent'
        : download.speed >= 2 ? 'good' : 'poor',
  };
}

/** Grade bufferbloat from idle vs loaded ping */
export function gradeBufferbloat(idlePing: number, loadedPing: number): BufferbloatResult['grade'] {
  const increase = loadedPing - idlePing;
  const ratio = loadedPing / Math.max(1, idlePing);
  if (increase <= 5 || ratio <= 1.1) return 'A';
  if (increase <= 30 || ratio <= 2) return 'B';
  if (increase <= 60 || ratio <= 4) return 'C';
  if (increase <= 150 || ratio <= 8) return 'D';
  return 'F';
}

/** Compute the median of a number array */
export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Compute standard deviation */
export function stddev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}
