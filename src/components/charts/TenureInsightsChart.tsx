'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { TenureInsightsData } from '@/lib/types/analytics';
import { useTranslations } from 'next-intl';

interface TenureInsightsChartProps {
  data: TenureInsightsData;
}

const CARING_COLOR = 'hsl(255 55% 58%)';   // muted violet
const SUPPORT_COLOR = 'hsl(25 75% 55%)';   // warm amber

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
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export function TenureInsightsChart({ data }: TenureInsightsChartProps) {
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
                ? t('insufficientData')
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

  const chartData = data.bands.map(band => ({
    band: BAND_SHORT[band.band] ?? band.band,
    fullBand: band.band,
    Caring: band.caring,
    Support: band.support,
    responseCount: band.responseCount,
  }));

  return (
    <div
      role="img"
      aria-label="Tenure insights chart: Caring and Support sub-dimensions by service year band"
    >
      <p className="text-[11px] text-muted-foreground mb-3">
        {t('tenureInsightsInfo')}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 8, left: -12 }}
          barGap={4}
          barCategoryGap="25%"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="Caring" fill={CARING_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Support" fill={SUPPORT_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
