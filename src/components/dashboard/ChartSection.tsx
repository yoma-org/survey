'use client';

import { LazyChart } from '@/components/charts/LazyChart';
import { FadeIn } from '@/components/motion/FadeIn';

interface ChartSectionProps {
  title: string;
  description?: string;
  height?: number;
  children: React.ReactNode;
}

export function ChartSection({ title, description, height = 300, children }: ChartSectionProps) {
  return (
    <FadeIn>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {title && (
          <div className="px-6 pt-6 pb-0">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          </div>
        )}
        <div className="p-6">
          <LazyChart height={height}>
            {children}
          </LazyChart>
        </div>
      </div>
    </FadeIn>
  );
}
