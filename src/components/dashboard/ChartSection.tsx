'use client';

import { Card } from '@/components/ui/card';
import { LazyChart } from '@/components/charts/LazyChart';

interface ChartSectionProps {
  title: string;
  description?: string;
  height?: number;
  children: React.ReactNode;
}

export function ChartSection({ title, description, height = 300, children }: ChartSectionProps) {
  return (
    <Card className="p-4 border-gray-100">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <LazyChart height={height}>
        {children}
      </LazyChart>
    </Card>
  );
}
