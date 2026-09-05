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
    let active = true;
    const tick = () => {
      if (!active) return;
      const elapsed = pageLoadTime ? (Date.now() - pageLoadTime) / 1000 : 0;
      setCount(Math.floor(elapsed * rate));
    };

    const timer = setTimeout(tick, 0);
    const interval = setInterval(tick, 500);

    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [rate, pageLoadTime]);

  return <span>{count.toLocaleString('en-US')}</span>;
}
