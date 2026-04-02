'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { TenureJourneyData } from '@/lib/types/analytics';
import { DIMENSION_COLORS } from '@/lib/chart-colors';
import { useTranslations } from 'next-intl';

interface TenureJourneyChartProps {
  data: TenureJourneyData;
}

const DIMENSION_LINE_COLORS: Record<string, string> = {
  Camaraderie: DIMENSION_COLORS.Camaraderie,
  Credibility: DIMENSION_COLORS.Credibility,
  Fairness: DIMENSION_COLORS.Fairness,
  Pride: DIMENSION_COLORS.Pride,
  Respect: DIMENSION_COLORS.Respect,
};

const BAND_SHORT: Record<string, string> = {
  'Less than 1 year': '<1yr',
  '1 to 3 years': '1–3yr',
  '3 to 5 years': '3–5yr',
  '5 to 10 years': '5–10yr',
  '10 to 20 years': '10–20yr',
  'More than 20 years': '20+yr',
};

interface TooltipEntry {
  name?: string;
  value?: number | null;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export function TenureJourneyChart({ data }: TenureJourneyChartProps) {
  const t = useTranslations('dashboard');

  function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs">
        <p className="font-medium text-foreground mb-1.5">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.value === null || entry.value === undefined
                ? t('insufficientDataTooltip')
                : `${entry.value}%`}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (data.bands.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('noTenureData')}
      </p>
    );
  }

  const chartData = data.bands.map(band => {
    const row: Record<string, string | number | null> = {
      band: BAND_SHORT[band.band] ?? band.band,
      fullBand: band.band,
      responseCount: band.responseCount,
    };
    for (const s of band.scores) {
      row[s.dimension] = s.score;
    }
    return row;
  });

  return (
    <div
      role="img"
      aria-label="Tenure journey chart showing pillar scores across service year bands"
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 8, left: -12 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <XAxis
            dataKey="band"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            width={40}
          />
          <ReferenceLine y={78} stroke="hsl(0 0% 60%)" strokeDasharray="8 4" strokeWidth={1.5} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
          {data.dimensions.map(dim => (
            <Line
              key={dim}
              type="monotone"
              dataKey={dim}
              name={dim}
              stroke={DIMENSION_LINE_COLORS[dim] ?? 'hsl(var(--muted-foreground))'}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
