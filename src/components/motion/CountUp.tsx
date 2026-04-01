'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function CountUp({ value, duration = 1.2, suffix = '%', className }: CountUpProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return (
    <motion.span className={className}>
      {display.toLocaleString()}{suffix}
    </motion.span>
  );
}
