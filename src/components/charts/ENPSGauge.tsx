'use client';

import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface ENPSGaugeProps {
  score: number; // -100 to 100
  promoters: number;
  passives: number;
  detractors: number;
}

export function ENPSGauge({ score, promoters, passives, detractors }: ENPSGaugeProps) {
  const chartData = {
    labels: ['Promoters', 'Passives', 'Detractors'],
    datasets: [
      {
        data: [promoters, passives, detractors],
        backgroundColor: ['#16a34a', '#d1d5db', '#ef4444'],
        borderWidth: 0,
        cutout: '75%',
        circumference: 180,
        rotation: -90,
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[28px] font-semibold text-gray-900">{score}</span>
        <span className="block text-xs text-gray-500">ENPS Score</span>
      </div>
    </div>
  );
}
