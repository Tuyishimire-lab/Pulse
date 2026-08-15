'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type {
  TestPhase, SpeedTestResult, SpeedMetric, PingMetric,
  BufferbloatResult, Verdicts, WorkerMessage, ConnectionMeta,
} from './types';
import SpeedGauge from './components/SpeedGauge';
import QualityScore from './components/QualityScore';
import TestHistory from './components/TestHistory';

const HISTORY_KEY = 'pulse-speed-test-history';
const MAX_HISTORY = 20;

// Benchmark national average broadband download speeds (Mbps)
const NATIONAL_AVERAGES: Record<string, { name: string; avgDl: number; avgPing: number }> = {
  US: { name: 'United States', avgDl: 255, avgPing: 18 },
  CA: { name: 'Canada', avgDl: 210, avgPing: 22 },
  GB: { name: 'United Kingdom', avgDl: 120, avgPing: 19 },
  DE: { name: 'Germany', avgDl: 95, avgPing: 21 },
  FR: { name: 'France', avgDl: 190, avgPing: 16 },
  JP: { name: 'Japan', avgDl: 180, avgPing: 15 },
  KR: { name: 'South Korea', avgDl: 215, avgPing: 12 },
  IN: { name: 'India', avgDl: 65, avgPing: 28 },
  BR: { name: 'Brazil', avgDl: 145, avgPing: 24 },
  AU: { name: 'Australia', avgDl: 90, avgPing: 25 },
  NL: { name: 'Netherlands', avgDl: 175, avgPing: 14 },
  SG: { name: 'Singapore', avgDl: 290, avgPing: 9 },
  ES: { name: 'Spain', avgDl: 210, avgPing: 16 },
  IT: { name: 'Italy', avgDl: 105, avgPing: 26 },
  SE: { name: 'Sweden', avgDl: 185, avgPing: 13 },
};

const DEFAULT_GLOBAL_BENCHMARK = { name: 'Global Average', avgDl: 110, avgPing: 28 };

interface ThroughputSample {
  id: number;
  speed: number;
  phase: 'download' | 'upload';
}

export default function SpeedTestClient() {
  // State
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [pingProgress, setPingProgress] = useState<number[]>([]);
  const [downloadResult, setDownloadResult] = useState<SpeedMetric | null>(null);
  const [uploadResult, setUploadResult] = useState<SpeedMetric | null>(null);
  const [pingResult, setPingResult] = useState<PingMetric | null>(null);
  const [bufferbloat, setBufferbloat] = useState<BufferbloatResult | null>(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdicts | null>(null);
  const [meta, setMeta] = useState<ConnectionMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [samples, setSamples] = useState<ThroughputSample[]>([]);
  const [copied, setCopied] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const sampleCounterRef = useRef(0);

  // Detect localhost
  useEffect(() => {
    const host = window.location.hostname;
    setIsLocalhost(host === 'localhost' || host === '127.0.0.1' || host === '::1');
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = useCallback((results: SpeedTestResult[]) => {
    setHistory(results);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(results)); } catch { /* ignore */ }
  }, []);

  // Fetch connection meta
  const fetchMeta = useCallback(async () => {
    try {
      const resp = await fetch('/api/speed-test/meta');
      if (resp.ok) {
        const data = await resp.json();
        setMeta(data);
      }
    } catch { /* silent */ }
  }, []);

  // Start test
  const startTest = useCallback(() => {
    // Reset state
    setPhase('connecting');
    setCurrentSpeed(0);
    setPingProgress([]);
    setDownloadResult(null);
    setUploadResult(null);
    setPingResult(null);
    setBufferbloat(null);
    setQualityScore(0);
    setVerdicts(null);
    setError(null);
    setSamples([]);
    setCopied(false);
    sampleCounterRef.current = 0;

    // Fetch metadata
    fetchMeta();

    // Create worker
    if (workerRef.current) workerRef.current.terminate();
    const worker = new Worker(new URL('./speed-test.worker.ts', import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;

      switch (msg.type) {
        case 'phase':
          setPhase(msg.phase);
          if (msg.phase === 'download' || msg.phase === 'upload') setCurrentSpeed(0);
          break;
        case 'ping-progress':
          setPingProgress((prev) => [...prev, msg.rtt]);
          break;
        case 'ping-complete':
          setPingResult(msg.result);
          break;
        case 'download-progress':
          setCurrentSpeed(msg.speedMbps);
          setSamples((prev) => [
            ...prev,
            { id: sampleCounterRef.current++, speed: msg.speedMbps, phase: 'download' as const },
          ].slice(-50));
          break;
        case 'download-complete':
          setDownloadResult(msg.result);
          setBufferbloat(msg.bufferbloat);
          setCurrentSpeed(0);
          break;
        case 'upload-progress':
          setCurrentSpeed(msg.speedMbps);
          setSamples((prev) => [
            ...prev,
            { id: sampleCounterRef.current++, speed: msg.speedMbps, phase: 'upload' as const },
          ].slice(-50));
          break;
        case 'upload-complete':
          setUploadResult(msg.result);
          setCurrentSpeed(0);
          break;
        case 'complete': {
          setPhase('complete');
          setQualityScore(msg.result.qualityScore);
          setVerdicts(msg.result.verdicts);

          // Save to history
          const result: SpeedTestResult = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...msg.result,
            meta: meta || { ip: '', isp: '', city: '', country: '', server: '' },
          };
          saveHistory([result, ...history].slice(0, MAX_HISTORY));
          break;
        }
        case 'error':
          setError(msg.message);
          setPhase('idle');
          break;
      }
    };

    worker.onerror = (e) => {
      setError(e.message || 'Worker error');
      setPhase('idle');
    };

    // Start the measurement
    const baseUrl = window.location.origin;
    worker.postMessage({ type: 'start', baseUrl });
  }, [fetchMeta, history, meta, saveHistory]);

  // Abort test
  const abortTest = useCallback(() => {
    workerRef.current?.postMessage({ type: 'abort' });
    workerRef.current?.terminate();
    workerRef.current = null;
    setPhase('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { workerRef.current?.terminate(); };
  }, []);

  // Copy shareable summary
  const copyShareResult = useCallback(() => {
    const dl = downloadResult ? `${formatSpeed(downloadResult.speed)} Mbps` : 'N/A';
    const ul = uploadResult ? `${formatSpeed(uploadResult.speed)} Mbps` : 'N/A';
    const ping = pingResult ? `${pingResult.median.toFixed(0)} ms` : 'N/A';
    const score = qualityScore > 0 ? `${qualityScore}/100` : '';

    const text = `Pulse Speed Test: ${dl} Download | ${ul} Upload | ${ping} Ping | Score: ${score} - https://www.pulstraffic.com/speed-test`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [downloadResult, uploadResult, pingResult, qualityScore]);

  const isRunning = phase !== 'idle' && phase !== 'complete';
  const isComplete = phase === 'complete';

  const getGaugeLabel = () => {
    switch (phase) {
      case 'idle': return 'Ready to test';
      case 'connecting': return 'Connecting...';
      case 'ping': return 'Measuring latency...';
      case 'download': return 'Testing download...';
      case 'upload': return 'Testing upload...';
      case 'complete': return 'Test complete';
      default: return '';
    }
  };

  const phaseSteps: { key: TestPhase; label: string }[] = [
    { key: 'ping', label: 'Ping' },
    { key: 'download', label: 'Download' },
    { key: 'upload', label: 'Upload' },
  ];

  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // National comparison benchmark calculation
  const benchmark = useMemo(() => {
    if (!meta || !meta.country) return DEFAULT_GLOBAL_BENCHMARK;
    return NATIONAL_AVERAGES[meta.country] || DEFAULT_GLOBAL_BENCHMARK;
  }, [meta]);

  const comparisonStats = useMemo(() => {
    if (!downloadResult) return null;
    const diff = Math.round(((downloadResult.speed - benchmark.avgDl) / benchmark.avgDl) * 100);
    const isFaster = diff >= 0;
    return { diff: Math.abs(diff), isFaster, avgDl: benchmark.avgDl, name: benchmark.name };
  }, [downloadResult, benchmark]);

  // Throughput SVG path
  const waveformPath = useMemo(() => {
    if (samples.length < 2) return '';
    const maxSpeed = Math.max(...samples.map((s) => s.speed), 10);
    const width = 600;
    const height = 70;

    const points = samples.map((s, idx) => {
      const x = (idx / (samples.length - 1)) * width;
      const y = height - (s.speed / maxSpeed) * (height - 10) - 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  }, [samples]);

  const waveformAreaPath = useMemo(() => {
    if (samples.length < 2) return '';
    const maxSpeed = Math.max(...samples.map((s) => s.speed), 10);
    const width = 600;
    const height = 70;

    const points = samples.map((s, idx) => {
      const x = (idx / (samples.length - 1)) * width;
      const y = height - (s.speed / maxSpeed) * (height - 10) - 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  }, [samples]);

  return (
    <div className="speed-test-page">
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />

      <div className="speed-test-content relative z-10">
        {/* Localhost warning */}
        {isLocalhost && (
          <div className="localhost-warning">
            <span className="localhost-warning-icon">!</span>
            <div>
              <strong>Development Mode</strong>
              <p>You are testing against localhost. Data is not leaving your machine. Deploy to production for real-world broadband measurement.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="speed-test-header">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold uppercase tracking-wider">
            Broadband Diagnostics Suite
          </div>
          <h1>Internet Speed Test</h1>
          <p className="speed-test-subtitle">
            Measure your download, upload, latency, jitter, and bufferbloat under active load.
          </p>
        </header>

        {/* Phase progress indicator */}
        <div className="phase-indicators">
          {phaseSteps.map((step) => {
            const phaseOrder = ['ping', 'download', 'upload', 'complete'];
            const currentIdx = phaseOrder.indexOf(phase);
            const stepIdx = phaseOrder.indexOf(step.key);
            const isDone = currentIdx > stepIdx || phase === 'complete';
            const isCurrent = phase === step.key;
            return (
              <div key={step.key} className={`phase-dot ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}>
                <span className="phase-dot-circle">{isDone ? 'OK' : ''}</span>
                <span className="phase-dot-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Gauge */}
        <SpeedGauge
          speed={currentSpeed}
          label={getGaugeLabel()}
          active={isRunning}
        />

        {/* Real-time Throughput Waveform */}
        {(isRunning || (isComplete && samples.length > 0)) && (
          <div className="w-full max-w-lg mx-auto my-4 p-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] text-[#6d8196] font-mono mb-1 px-1">
              <span>REAL-TIME THROUGHPUT</span>
              <span className="text-[#00D4AA]">
                {currentSpeed > 0 ? `${formatSpeed(currentSpeed)} Mbps` : (isComplete ? 'Peak Locked' : 'Measuring...')}
              </span>
            </div>
            <div className="relative h-16 w-full overflow-hidden rounded-lg bg-white/[0.02]">
              {samples.length >= 2 ? (
                <svg viewBox="0 0 600 70" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="waveformGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={waveformAreaPath} fill="url(#waveformGrad)" />
                  <path d={waveformPath} fill="none" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-[#4a5568]">
                  Sampling bandwidth stream...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="speed-test-action">
          {phase === 'idle' && (
            <button onClick={startTest} className="speed-test-start-btn">
              Start Test
            </button>
          )}
          {isRunning && (
            <button onClick={abortTest} className="speed-test-stop-btn">
              Stop Test
            </button>
          )}
          {isComplete && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={startTest} className="speed-test-start-btn">
                Test Again
              </button>
              <button
                onClick={copyShareResult}
                className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#00D4AA]/40 text-xs font-bold text-white transition-all shadow-md"
              >
                {copied ? 'Copied to Clipboard!' : 'Share Result'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="speed-test-error">
            <span>!</span> {error}
          </div>
        )}

        {/* National Comparison Banner */}
        {isComplete && comparisonStats && (
          <div className="w-full max-w-xl mx-auto my-6 p-4 rounded-xl border border-[#00D4AA]/20 bg-gradient-to-r from-[#00D4AA]/10 via-transparent to-white/[0.02] backdrop-blur-md text-left">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#00D4AA] mb-1">
              National Broadband Comparison
            </div>
            <div className="text-sm text-white font-medium">
              Your measured download of <span className="text-[#00D4AA] font-bold">{formatSpeed(downloadResult?.speed || 0)} Mbps</span> is{' '}
              <span className={comparisonStats.isFaster ? 'text-[#00D4AA] font-bold' : 'text-amber-400 font-bold'}>
                {comparisonStats.diff}% {comparisonStats.isFaster ? 'faster' : 'slower'}
              </span>{' '}
              than the {comparisonStats.name} national average ({comparisonStats.avgDl} Mbps).
            </div>
          </div>
        )}

        {/* Live metric cards */}
        <div className="speed-metric-cards">
          {/* Ping */}
          <div className={`speed-metric-card ${pingResult ? 'filled' : ''}`}>
            <div className="metric-card-tag">LATENCY</div>
            <div className="metric-card-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              Ping
              {pingResult?.wsUsed && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    color: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}
                >
                  WS
                </span>
              )}
            </div>
            <div className="metric-card-value">
              {pingResult ? `${pingResult.median.toFixed(0)}` : 'N/A'}
            </div>
            <div className="metric-card-unit">ms</div>
            {pingResult && (
              <div className="metric-card-detail">
                Jitter: {pingResult.jitter.toFixed(1)} ms
              </div>
            )}
          </div>

          {/* Download */}
          <div className={`speed-metric-card ${downloadResult ? 'filled' : ''}`}>
            <div className="metric-card-tag">DOWNLOAD</div>
            <div className="metric-card-label">Download</div>
            <div className="metric-card-value">
              {downloadResult ? formatSpeed(downloadResult.speed) : phase === 'download' ? formatSpeed(currentSpeed) : 'N/A'}
            </div>
            <div className="metric-card-unit">
              {downloadResult && downloadResult.speed >= 1000 ? 'Gbps' : 'Mbps'}
            </div>
            {downloadResult && (
              <div className="metric-card-detail">
                Peak: {formatSpeed(downloadResult.peak)} · {downloadResult.streams} streams
              </div>
            )}
          </div>

          {/* Upload */}
          <div className={`speed-metric-card ${uploadResult ? 'filled' : ''}`}>
            <div className="metric-card-tag">UPLOAD</div>
            <div className="metric-card-label">Upload</div>
            <div className="metric-card-value">
              {uploadResult ? formatSpeed(uploadResult.speed) : phase === 'upload' ? formatSpeed(currentSpeed) : 'N/A'}
            </div>
            <div className="metric-card-unit">
              {uploadResult && uploadResult.speed >= 1000 ? 'Gbps' : 'Mbps'}
            </div>
            {uploadResult && (
              <div className="metric-card-detail">
                Peak: {formatSpeed(uploadResult.peak)} · {uploadResult.streams} streams
              </div>
            )}
          </div>
        </div>

        {/* Bufferbloat indicator */}
        {bufferbloat && isComplete && (
          <div className="bufferbloat-section">
            <h3>Connection Quality Under Load</h3>
            <div className="bufferbloat-card">
              <div className="bufferbloat-grade" data-grade={bufferbloat.grade}>
                {bufferbloat.grade}
              </div>
              <div className="bufferbloat-details">
                <div className="bufferbloat-row">
                  <span>Idle Latency</span>
                  <span className="bufferbloat-value">{bufferbloat.idlePing.toFixed(0)} ms</span>
                </div>
                <div className="bufferbloat-row">
                  <span>Latency Under Load</span>
                  <span className="bufferbloat-value">{bufferbloat.loadedPing.toFixed(0)} ms</span>
                </div>
                <div className="bufferbloat-row">
                  <span>Increase</span>
                  <span className="bufferbloat-value">
                    +{(bufferbloat.loadedPing - bufferbloat.idlePing).toFixed(0)} ms
                    ({((bufferbloat.loadedPing / Math.max(1, bufferbloat.idlePing) - 1) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality Score + Verdicts */}
        {verdicts && (
          <QualityScore
            score={qualityScore}
            verdicts={verdicts}
            visible={isComplete}
          />
        )}

        {/* Connection metadata */}
        {meta && isComplete && (
          <div className="connection-meta">
            <div className="meta-item"><span className="meta-label">ISP Gateway</span><span className="meta-value">{meta.isp || 'Broadband ISP'}</span></div>
            <div className="meta-item"><span className="meta-label">Edge Node</span><span className="meta-value">{meta.server}</span></div>
            <div className="meta-item"><span className="meta-label">Location</span><span className="meta-value">{meta.city}, {meta.country}</span></div>
            <div className="meta-item"><span className="meta-label">IP</span><span className="meta-value">{meta.ip}</span></div>
          </div>
        )}

        {/* History */}
        <TestHistory results={history} onClear={clearHistory} />
      </div>
    </div>
  );
}

function formatSpeed(mbps: number): string {
  if (mbps >= 1000) return (mbps / 1000).toFixed(2);
  if (mbps >= 100) return mbps.toFixed(0);
  return mbps.toFixed(1);
}
