'use client';

import React from 'react';

export interface SecurityData {
  ssl_grade: string | null;
  ssl_protocol: string | null;
  obs_grade: string | null;
  obs_score: number | null;
  security_grade: string | null;
}

interface Props {
  data: SecurityData;
}

const GRADE_COLORS: Record<string, string> = {
  'A+': '#22c55e',
  A: '#22c55e',
  'A-': '#4ade80',
  B: '#84cc16',
  'B+': '#84cc16',
  C: '#f59e0b',
  'C+': '#f59e0b',
  D: '#f97316',
  'D+': '#f97316',
  F: '#ef4444',
  '?': '#64748b',
};

function GradeItem({ icon, label, grade, detail }: {
  icon?: React.ReactNode;
  label: string;
  grade: string | null;
  detail?: string;
}) {
  const g = grade || '?';
  const gradeColor = GRADE_COLORS[g] || '#64748b';

  return (
    <div style={{
      flex: 1,
      padding: '12px 14px',
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {icon}
          <span>{label}</span>
        </span>
        <span style={{
          fontSize: 16,
          fontWeight: 800,
          color: gradeColor,
          lineHeight: 1,
        }}>
          {g}
        </span>
      </div>
      {detail && (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
          {detail}
        </span>
      )}
    </div>
  );
}

export default function SecurityPanel({ data }: Props) {
  const combinedGrade = data.security_grade || '?';
  const combinedColor = GRADE_COLORS[combinedGrade] || '#64748b';

  const obsDetail = data.obs_score !== null ? `Score: ${data.obs_score}/100` : undefined;
  const sslDetail = data.ssl_protocol || undefined;

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
            Security Posture
          </h4>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, display: 'block' }}>
            SSL Labs + Mozilla Observatory
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 10,
          backgroundColor: `${combinedColor}15`,
          border: `1px solid ${combinedColor}30`,
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Grade
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: combinedColor }}>
            {combinedGrade}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <GradeItem
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          }
          label="SSL/TLS"
          grade={data.ssl_grade}
          detail={sslDetail}
        />
        <GradeItem
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          }
          label="Headers"
          grade={data.obs_grade}
          detail={obsDetail}
        />
      </div>
    </div>
  );
}
