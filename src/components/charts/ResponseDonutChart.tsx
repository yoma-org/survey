'use client';

import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface ResponseDonutChartProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function ResponseDonutChart({ positive, neutral, negative }: ResponseDonutChartProps) {
  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [positive, neutral, negative],
        backgroundColor: ['#2563eb', '#d1d5db', '#ef4444'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <div className="relative">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-semibold text-gray-900">{positive}%</span>
        <span className="text-xs text-gray-500">Positive</span>
      </div>
    </div>
  );
}
