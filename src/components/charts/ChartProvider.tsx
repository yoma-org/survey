'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register all Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global Chart.js defaults
ChartJS.defaults.font.family = 'Inter, Noto Sans Myanmar Variable, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = '#6b7280';
ChartJS.defaults.plugins.legend.display = false;
ChartJS.defaults.animation = { duration: 500, easing: 'easeOutQuart' };
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;

export function ChartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
