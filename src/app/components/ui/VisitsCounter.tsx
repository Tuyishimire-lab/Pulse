'use client';

import React, { useState, useEffect } from 'react';

interface VisitsCounterProps {
  rate: number;
  pageLoadTime: number;
}

/**
 * Self-contained visit counter that ticks at the site's visits/second rate.
 * Updates every 500ms for smooth visual animation.
 */
export default function VisitsCounter({ rate, pageLoadTime }: VisitsCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const elapsedSeconds = (Date.now() - pageLoadTime) / 1000;
    setCount(Math.floor(elapsedSeconds * rate));

    const interval = setInterval(() => {
      const elapsed = (Date.now() - pageLoadTime) / 1000;
      setCount(Math.floor(elapsed * rate));
    }, 500);

    return () => clearInterval(interval);
  }, [rate, pageLoadTime]);

  return <span>{count.toLocaleString('en-US')}</span>;
}
