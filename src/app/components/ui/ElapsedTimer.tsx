'use client';

import React, { useState, useEffect } from 'react';

interface ElapsedTimerProps {
  pageLoadTime: number;
}

/**
 * Self-contained HH:MM:SS timer that counts up from page load.
 * Updates every second.
 */
export default function ElapsedTimer({ pageLoadTime }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const updateTimer = () => {
      const totalSecs = Math.floor((Date.now() - pageLoadTime) / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      setElapsed(
        String(hours).padStart(2, '0') +
          ':' +
          String(minutes).padStart(2, '0') +
          ':' +
          String(seconds).padStart(2, '0'),
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [pageLoadTime]);

  return <div>{elapsed}</div>;
}
