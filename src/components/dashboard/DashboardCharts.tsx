'use client';

import { ChartProvider } from '@/components/charts/ChartProvider';
import { MetricCard } from './MetricCard';
import { LeaderboardGrid } from './LeaderboardGrid';
import { ChartSection } from './ChartSection';
import { DimensionBarChart } from '@/components/charts/DimensionBarChart';
import { ResponseDonutChart } from '@/components/charts/ResponseDonutChart';
import { ENPSGauge } from '@/components/charts/ENPSGauge';
import { HorizontalBarRanking } from '@/components/charts/HorizontalBarRanking';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardData {
  eesScore: number;
  eesTrend: number;
  gptwScore: number;
  responseRate: number;
  totalResponses: number;
  dimensions: { dimension: string; score: number }[];
  sentiment: { positive: number; neutral: number; negative: number };
  enps: { score: number; promoters: number; passives: number; detractors: number };
  strengths: { label: string; score: number }[];
  opportunities: { label: string; score: number }[];
  leaderboard: { label: string; value: number; color: string }[];
}

export function DashboardCharts({ data }: { data: DashboardData }) {
  return (
    <ChartProvider>
      <div className="space-y-6">
        {/* Row 1: Hero Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="EES Score"
            value={data.eesScore}
            trend={{ value: data.eesTrend, label: 'vs last year' }}
          />
          <MetricCard
            label="GPTW Score"
            value={data.gptwScore}
            color="#16a34a"
          />
          <MetricCard
            label="Response Rate"
            value={data.responseRate}
            color="#0891b2"
          />
          <MetricCard
            label="Total Responses"
            value={data.totalResponses}
            suffix=""
            color="#7c3aed"
          />
        </div>

        {/* Row 2: Leaderboard */}
        <LeaderboardGrid metrics={data.leaderboard} />

        {/* Row 3: Dimension Overview + Response Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartSection title="Key Dimensions" description="% favorable by GPTW dimension" height={280}>
              <DimensionBarChart data={data.dimensions} />
            </ChartSection>
          </div>
          <ChartSection title="Response Distribution" description="Overall sentiment split" height={280}>
            <ResponseDonutChart {...data.sentiment} />
          </ChartSection>
        </div>

        {/* Row 4: ENPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartSection title="Employee Net Promoter Score" description="ENPS gauge" height={220}>
            <ENPSGauge {...data.enps} />
          </ChartSection>
          <div className="lg:col-span-2">
            {/* Strengths & Opportunities tabs */}
            <Tabs defaultValue="strengths" className="h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Statement Rankings</h3>
                <TabsList className="h-8">
                  <TabsTrigger value="strengths" className="text-xs px-3 h-7">Top 10 Strengths</TabsTrigger>
                  <TabsTrigger value="opportunities" className="text-xs px-3 h-7">Bottom 10</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="strengths" className="mt-0">
                <ChartSection title="" height={400}>
                  <HorizontalBarRanking items={data.strengths} color="#16a34a" />
                </ChartSection>
              </TabsContent>
              <TabsContent value="opportunities" className="mt-0">
                <ChartSection title="" height={400}>
                  <HorizontalBarRanking items={data.opportunities} color="#ef4444" />
                </ChartSection>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ChartProvider>
  );
}
