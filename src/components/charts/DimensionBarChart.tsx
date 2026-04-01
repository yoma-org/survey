'use client';

import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

// GPTW dimension colors (color-blind accessible)
const DIMENSION_COLORS = {
  Credibility: '#2563eb',  // blue-600
  Respect: '#7c3aed',     // violet-600
  Fairness: '#0891b2',    // cyan-600
  Pride: '#ea580c',       // orange-600
  Camaraderie: '#16a34a', // green-600
};

interface DimensionBarChartProps {
  data: { dimension: string; score: number }[];
}

export function DimensionBarChart({ data }: DimensionBarChartProps) {
  const chartData = {
    labels: data.map((d) => d.dimension),
    datasets: [
      {
        data: data.map((d) => d.score),
        backgroundColor: data.map(
          (d) => DIMENSION_COLORS[d.dimension as keyof typeof DIMENSION_COLORS] || '#2563eb'
        ),
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%` },
        grid: { color: '#f3f4f6' },
      },
      x: {
        grid: { display: false },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}% favorable`,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
