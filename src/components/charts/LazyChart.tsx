'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyChartProps {
  children: ReactNode;
  className?: string;
  height?: number;
}

export function LazyChart({ children, className = '', height = 300 }: LazyChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ minHeight: height }}>
      {visible ? children : (
        <div className="animate-pulse bg-gray-100 rounded-lg w-full h-full" style={{ minHeight: height }} />
      )}
    </div>
  );
}
