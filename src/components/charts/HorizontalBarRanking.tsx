'use client';

import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface RankingItem {
  label: string;
  score: number;
}

interface HorizontalBarRankingProps {
  items: RankingItem[];
  color?: string;
  title?: string;
}

export function HorizontalBarRanking({ items, color = '#2563eb', title }: HorizontalBarRankingProps) {
  const chartData = {
    labels: items.map((item) => item.label.length > 50 ? item.label.slice(0, 47) + '...' : item.label),
    datasets: [
      {
        data: items.map((item) => item.score),
        backgroundColor: color,
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v) => `${v}%` },
        grid: { color: '#f3f4f6' },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
    plugins: {
      title: title ? { display: true, text: title, align: 'start', font: { size: 14, weight: 600 } } : undefined,
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.x}% favorable`,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
