'use client';

import { LazyChart } from '@/components/charts/LazyChart';

interface ChartSectionProps {
  title: string;
  description?: string;
  height?: number;
  children: React.ReactNode;
  testId?: string;
}

// Borderless container — avoids rounded-rect-with-shadow anti-pattern
export function ChartSection({ title, description, height = 280, children, testId }: ChartSectionProps) {
  return (
    <div {...(testId && { 'data-test-id': testId })}>
      {title && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      )}
      <LazyChart height={height}>
        {children}
      </LazyChart>
    </div>
  );
}
