'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type {
  TestPhase, SpeedTestResult, SpeedMetric, PingMetric,
  BufferbloatResult, Verdicts, WorkerMessage, ConnectionMeta,
} from './types';
import SpeedGauge from './components/SpeedGauge';
import QualityScore from './components/QualityScore';
import TestHistory from './components/TestHistory';

const HISTORY_KEY = 'pulse-speed-test-history';
const MAX_HISTORY = 20;

export default function SpeedTestClient() {
  // ── State ──────────────────────────────────────────────────────────────
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

  const workerRef = useRef<Worker | null>(null);

  // ── Detect localhost ────────────────────────────────────────────────
  useEffect(() => {
    const host = window.location.hostname;
    setIsLocalhost(host === 'localhost' || host === '127.0.0.1' || host === '::1');
  }, []);

  // ── Load history from localStorage ──────────────────────────────────
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

  // ── Fetch connection meta ───────────────────────────────────────────
  const fetchMeta = useCallback(async () => {
    try {
      const resp = await fetch('/api/speed-test/meta');
      if (resp.ok) {
        const data = await resp.json();
        setMeta(data);
      }
    } catch { /* silent */ }
  }, []);

  // ── Start test ──────────────────────────────────────────────────────
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
          break;
        case 'download-complete':
          setDownloadResult(msg.result);
          setBufferbloat(msg.bufferbloat);
          setCurrentSpeed(0);
          break;
        case 'upload-progress':
          setCurrentSpeed(msg.speedMbps);
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

  // ── Abort test ──────────────────────────────────────────────────────
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

  // ── Helpers ─────────────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="speed-test-page">
      <div className="mesh-gradient absolute inset-0 pointer-events-none z-0" />

      <div className="speed-test-content relative z-10">
        {/* Localhost warning */}
        {isLocalhost && (
          <div className="localhost-warning">
            <span className="localhost-warning-icon">⚠</span>
            <div>
              <strong>Development Mode</strong>
              <p>You&apos;re testing against localhost — data is not leaving your machine. Results do not reflect real internet speed. Deploy to Vercel for accurate measurements.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="speed-test-header">
          <h1>Internet Speed Test</h1>
          <p className="speed-test-subtitle">
            Measure your download, upload, latency, and connection quality with precision.
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
                <span className="phase-dot-circle">{isDone ? '✓' : ''}</span>
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

        {/* Action button */}
        <div className="speed-test-action">
          {phase === 'idle' && (
            <button onClick={startTest} className="speed-test-start-btn">
              <span className="start-btn-icon">▶</span>
              Start Test
            </button>
          )}
          {isRunning && (
            <button onClick={abortTest} className="speed-test-stop-btn">
              Stop
            </button>
          )}
          {isComplete && (
            <button onClick={startTest} className="speed-test-start-btn">
              <span className="start-btn-icon">↻</span>
              Test Again
            </button>
          )}
        </div>

        {error && (
          <div className="speed-test-error">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Live metric cards */}
        <div className="speed-metric-cards">
          {/* Ping */}
          <div className={`speed-metric-card ${pingResult ? 'filled' : ''}`}>
            <div className="metric-card-icon">⏱</div>
            <div className="metric-card-label">Ping</div>
            <div className="metric-card-value">
              {pingResult ? `${pingResult.median.toFixed(0)}` : '—'}
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
            <div className="metric-card-icon">↓</div>
            <div className="metric-card-label">Download</div>
            <div className="metric-card-value">
              {downloadResult ? formatSpeed(downloadResult.speed) : phase === 'download' ? formatSpeed(currentSpeed) : '—'}
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
            <div className="metric-card-icon">↑</div>
            <div className="metric-card-label">Upload</div>
            <div className="metric-card-value">
              {uploadResult ? formatSpeed(uploadResult.speed) : phase === 'upload' ? formatSpeed(currentSpeed) : '—'}
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
            <div className="meta-item"><span className="meta-label">Server</span><span className="meta-value">{meta.server}</span></div>
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
