'use client';

import React from 'react';
import type { SpeedTestResult } from '../types';

interface TestHistoryProps {
  results: SpeedTestResult[];
  onClear: () => void;
}

/**
 * Displays previous speed test results stored in localStorage.
 */
export default function TestHistory({ results, onClear }: TestHistoryProps) {
  if (results.length === 0) return null;

  return (
    <section className="speed-test-history">
      <div className="history-header">
        <h3>Test History</h3>
        <button onClick={onClear} className="history-clear-btn">Clear All</button>
      </div>

      <div className="history-list">
        {results.map((r) => (
          <div key={r.id} className="history-card">
            <div className="history-date">
              {new Date(r.timestamp).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>

            <div className="history-metrics">
              <div className="history-metric">
                <span className="history-metric-label">↓ Download</span>
                <span className="history-metric-value">{formatSpeed(r.download.speed)}</span>
              </div>
              <div className="history-metric">
                <span className="history-metric-label">↑ Upload</span>
                <span className="history-metric-value">{formatSpeed(r.upload.speed)}</span>
              </div>
              <div className="history-metric">
                <span className="history-metric-label">⏱ Ping</span>
                <span className="history-metric-value">{r.ping.median.toFixed(0)} ms</span>
              </div>
            </div>

            <div className="history-score">
              <span className="history-score-value" style={{ color: getScoreColor(r.qualityScore) }}>
                {r.qualityScore}
              </span>
              <span className="history-score-label">Score</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatSpeed(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
  return `${mbps.toFixed(1)} Mbps`;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#82c8e5';
  if (score >= 70) return '#00e5a0';
  if (score >= 50) return '#e5c400';
  if (score >= 30) return '#e58a00';
  return '#e54040';
}
