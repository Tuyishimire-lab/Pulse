'use client';

import React from 'react';

interface WebVitalsData {
  lcp_p75: number | null;
  inp_p75: number | null;
  cls_p75: number | null;
  lcp_rating: string | null;
  inp_rating: string | null;
  cls_rating: string | null;
  cwv_grade: string | null;
  form_factors: Record<string, Record<string, number>> | null;
}

interface Props {
  data: WebVitalsData;
  color: string;
}

const RATING_COLORS: Record<string, string> = {
  good: '#22c55e',
  'needs-improvement': '#f59e0b',
  poor: '#ef4444',
};

const RATING_LABELS: Record<string, string> = {
  good: 'Good',
  'needs-improvement': 'Needs Work',
  poor: 'Poor',
};

const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
};

function MetricBar({ label, value, unit, rating, maxVal }: {
  label: string;
  value: number | null;
  unit: string;
  rating: string | null;
  maxVal: number;
}) {
  if (value === null || !rating) return null;
  const pct = Math.min((value / maxVal) * 100, 100);
  const barColor = RATING_COLORS[rating] || '#6366f1';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
            {unit === 'ms' ? `${Math.round(value)}ms` : value.toFixed(2)}
          </span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: barColor,
            backgroundColor: `${barColor}18`,
            padding: '2px 6px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {RATING_LABELS[rating] || rating}
          </span>
        </div>
      </div>
      <div style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          backgroundColor: barColor,
          transition: 'width 0.8s ease-out',
        }} />
      </div>
    </div>
  );
}

export default function WebVitalsPanel({ data, color }: Props) {
  const grade = data.cwv_grade || '?';
  const gradeColor = GRADE_COLORS[grade] || '#6366f1';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '20px 22px',
      marginTop: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h4 style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '-0.02em',
          }}>
            Core Web Vitals
          </h4>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, display: 'block' }}>
            Source: Google Chrome UX Report
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 10,
          backgroundColor: `${gradeColor}15`,
          border: `1px solid ${gradeColor}30`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Grade
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: gradeColor }}>
            {grade}
          </span>
        </div>
      </div>

      <MetricBar label="LCP (Largest Contentful Paint)" value={data.lcp_p75} unit="ms" rating={data.lcp_rating} maxVal={6000} />
      <MetricBar label="INP (Interaction to Next Paint)" value={data.inp_p75} unit="ms" rating={data.inp_rating} maxVal={800} />
      <MetricBar label="CLS (Cumulative Layout Shift)" value={data.cls_p75} unit="" rating={data.cls_rating} maxVal={0.5} />

      {/* Form factor breakdown */}
      {data.form_factors && Object.keys(data.form_factors).length > 0 && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {Object.entries(data.form_factors).map(([ff, metrics]) => (
            <div key={ff} style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {ff === 'phone' ? '📱 Mobile' : '🖥️ Desktop'}
              </span>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                {metrics.lcp !== undefined && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    LCP: <strong>{Math.round(metrics.lcp)}ms</strong>
                  </span>
                )}
                {metrics.inp !== undefined && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    INP: <strong>{Math.round(metrics.inp)}ms</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
