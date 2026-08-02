'use client';

import React from 'react';
import ElapsedTimer from './ui/ElapsedTimer';

interface HeaderProps {
  pageLoadTime: number;
}

/**
 * The top header section: Pulse logo, subtitle, and elapsed session timer.
 */
export default function Header({ pageLoadTime }: HeaderProps) {
  return (
    <header className="app-header relative z-10 flex flex-col items-center w-full max-w-[700px] text-center pt-8 pb-6 px-4">
      <div className="logo-area flex items-center gap-3 mb-2">
        <span className="pulse-dot" />
        <h1 className="m-0 text-[2.8rem] font-extrabold tracking-tight bg-gradient-to-r from-white to-[#82c8e5] bg-clip-text text-transparent">
          Pulse
        </h1>
      </div>
      <p className="subtitle text-[#6d8196] text-lg font-normal m-0 mb-4">
        Real Time Global Web Traffic Stream
      </p>

      <div className="timer-card">
        <span className="timer-label">TIME ELAPSED ON PAGE</span>
        <div className="timer-value">
          <ElapsedTimer pageLoadTime={pageLoadTime} />
        </div>
      </div>
    </header>
  );
}
