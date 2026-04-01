'use client';

import { ChartProvider } from '@/components/charts/ChartProvider';
import { MetricCard } from './MetricCard';
import { LeaderboardGrid } from './LeaderboardGrid';
import { ChartSection } from './ChartSection';
import { DimensionBarChart } from '@/components/charts/DimensionBarChart';
import { ResponseDonutChart } from '@/components/charts/ResponseDonutChart';
import { ENPSGauge } from '@/components/charts/ENPSGauge';
import { HorizontalBarRanking } from '@/components/charts/HorizontalBarRanking';
import { FadeIn } from '@/components/motion/FadeIn';
import { StaggerChildren, StaggerItem } from '@/components/motion/StaggerChildren';
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
      <div className="space-y-12">

        {/* Hero Metrics — Optimus style: large numbers, minimal labels */}
        <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12" staggerDelay={0.1}>
          <StaggerItem>
            <MetricCard label="Employee Engagement" value={data.eesScore} trend={{ value: data.eesTrend, label: 'vs last year' }} />
          </StaggerItem>
          <StaggerItem>
            <MetricCard label="Great Place to Work" value={data.gptwScore} />
          </StaggerItem>
          <StaggerItem>
            <MetricCard label="Response Rate" value={data.responseRate} />
          </StaggerItem>
          <StaggerItem>
            <MetricCard label="Total Responses" value={data.totalResponses} suffix="" />
          </StaggerItem>
        </StaggerChildren>

        {/* Leaderboard — with divider dot */}
        <FadeIn delay={0.3}>
          <LeaderboardGrid metrics={data.leaderboard} />
        </FadeIn>

        {/* Section title — Optimus style */}
        <FadeIn delay={0.4}>
          <div className="divider-dot mb-8" />
          <h2 className="text-xl font-medium text-gray-900 tracking-tight">
            Performance you<br />can measure.
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-md">
            Key dimensions and response distribution across your organization.
          </p>
        </FadeIn>

        {/* Dimensions + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSection title="Key Dimensions" description="% favorable by GPTW dimension" height={280}>
              <DimensionBarChart data={data.dimensions} />
            </ChartSection>
          </div>
          <ChartSection title="Response Distribution" description="Overall sentiment" height={280}>
            <ResponseDonutChart {...data.sentiment} />
          </ChartSection>
        </div>

        {/* ENPS + Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartSection title="Net Promoter Score" description="Employee NPS" height={220}>
            <ENPSGauge {...data.enps} />
          </ChartSection>
          <div className="lg:col-span-2">
            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-100">
                <Tabs defaultValue="strengths">
                  <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Statement Rankings</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Top performing and opportunity areas</p>
                    </div>
                    <TabsList className="h-8 bg-gray-100/80">
                      <TabsTrigger value="strengths" className="text-xs px-3 h-7 data-[state=active]:bg-white">Strengths</TabsTrigger>
                      <TabsTrigger value="opportunities" className="text-xs px-3 h-7 data-[state=active]:bg-white">Opportunities</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="px-6 pb-6">
                    <TabsContent value="strengths" className="mt-0">
                      <div style={{ height: 400 }}>
                        <HorizontalBarRanking items={data.strengths} color="#171717" />
                      </div>
                    </TabsContent>
                    <TabsContent value="opportunities" className="mt-0">
                      <div style={{ height: 400 }}>
                        <HorizontalBarRanking items={data.opportunities} color="#a3a3a3" />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </ChartProvider>
  );
}
