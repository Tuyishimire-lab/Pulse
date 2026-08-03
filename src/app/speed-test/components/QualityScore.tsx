'use client';

import React, { useEffect, useState } from 'react';
import type { Verdicts, VerdictLevel } from '../types';

interface QualityScoreProps {
  score: number;
  verdicts: Verdicts;
  visible: boolean;
}

/**
 * Animated quality score ring with use-case verdict cards.
 */
export default function QualityScore({ score, verdicts, visible }: QualityScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate from 0 to score
  useEffect(() => {
    if (!visible) { setAnimatedScore(0); return; }
    let frame: number;
    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score, visible]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * animatedScore) / 100;

  const getGrade = (s: number) => {
    if (s >= 85) return { label: 'Excellent', color: '#82c8e5' };
    if (s >= 70) return { label: 'Great', color: '#00e5a0' };
    if (s >= 50) return { label: 'Good', color: '#e5c400' };
    if (s >= 30) return { label: 'Fair', color: '#e58a00' };
    return { label: 'Poor', color: '#e54040' };
  };

  const grade = getGrade(animatedScore);

  const verdictItems: { key: keyof Verdicts; label: string; icon: string }[] = [
    { key: 'streaming4k', label: '4K Streaming', icon: '📺' },
    { key: 'gaming', label: 'Gaming', icon: '🎮' },
    { key: 'videoCalls', label: 'Video Calls', icon: '📹' },
    { key: 'browsing', label: 'Browsing', icon: '🌐' },
  ];

  const verdictStyle = (level: VerdictLevel) => {
    switch (level) {
      case 'excellent': return { color: '#82c8e5', label: 'Excellent', bg: 'rgba(130,200,229,0.1)' };
      case 'good': return { color: '#00e5a0', label: 'Good', bg: 'rgba(0,229,160,0.1)' };
      case 'poor': return { color: '#e54040', label: 'Poor', bg: 'rgba(229,64,64,0.1)' };
    }
  };

  if (!visible) return null;

  return (
    <div className="quality-score-section">
      {/* Score Ring */}
      <div className="quality-score-ring-container">
        <svg width="150" height="150" viewBox="0 0 150 150" className="quality-score-svg">
          {/* Background ring */}
          <circle
            cx="75" cy="75" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Active ring */}
          <circle
            cx="75" cy="75" r={radius}
            fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 75 75)"
            className="quality-ring-fill"
          />
        </svg>
        <div className="quality-score-center">
          <span className="quality-score-number" style={{ color: grade.color }}>{animatedScore}</span>
          <span className="quality-score-label">{grade.label}</span>
        </div>
      </div>

      {/* Verdicts */}
      <div className="verdict-grid">
        {verdictItems.map(({ key, label, icon }) => {
          const style = verdictStyle(verdicts[key]);
          return (
            <div key={key} className="verdict-card" style={{ borderColor: style.color + '33', background: style.bg }}>
              <span className="verdict-icon">{icon}</span>
              <span className="verdict-name">{label}</span>
              <span className="verdict-level" style={{ color: style.color }}>{style.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
