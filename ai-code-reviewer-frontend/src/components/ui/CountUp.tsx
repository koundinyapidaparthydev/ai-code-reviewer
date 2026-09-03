'use client';

import React, { useEffect, useState } from 'react';

export function CountUp({
  value,
  suffix = '',
  duration = 700,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    if (target === 0) {
      setShown(0);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span>
      {shown}
      {suffix}
    </span>
  );
}
