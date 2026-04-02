'use client';

import { ChartProvider } from '@/components/charts/ChartProvider';
import { MetricCard } from './MetricCard';
import { LeaderboardGrid } from './LeaderboardGrid';
import { ChartSection } from './ChartSection';
import { DimensionBarChart } from '@/components/charts/DimensionBarChart';
import { ResponseDonutChart } from '@/components/charts/ResponseDonutChart';
import { ENPSGauge } from '@/components/charts/ENPSGauge';
import { HorizontalBarRanking } from '@/components/charts/HorizontalBarRanking';
import { RelationshipRadar } from '@/components/charts/RelationshipRadar';
import { LeadershipComparisonChart } from '@/components/charts/LeadershipComparisonChart';
import { TenureJourneyChart } from '@/components/charts/TenureJourneyChart';
import { TenureInsightsChart } from '@/components/charts/TenureInsightsChart';
import { ENPSDetailChart } from '@/components/charts/ENPSDetailChart';
import { PillarHeatmap } from './PillarHeatmap';
import { SentimentAnalysisCards } from './SentimentAnalysisCards';
import { EarlyWarningAlerts } from './EarlyWarningAlerts';
import { DepartmentBreakdownChart } from './DepartmentBreakdownChart';

import { FadeIn } from '@/components/motion/FadeIn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// DIMENSION_COLORS no longer used directly — performance zones handle coloring
import { ErrorBoundary } from './ErrorBoundary';
import { EESTrendChart } from '@/components/charts/EESTrendChart';
import { SubPillarBreakdownChart } from '@/components/charts/SubPillarBreakdownChart';
import { LeadershipConfidenceChart } from '@/components/charts/LeadershipConfidenceChart';
import { RelationshipStatementsChart } from '@/components/charts/RelationshipStatementsChart';
import { InternalBenchmarkChart } from '@/components/charts/InternalBenchmarkChart';
import { IndustryBenchmarkChart } from '@/components/charts/IndustryBenchmarkChart';
import type { DashboardData, MultiSurveyData } from '@/lib/types/analytics';

interface DashboardChartsProps {
  data: DashboardData;
  multiSurvey?: MultiSurveyData;
}

export function DashboardCharts({ data, multiSurvey }: DashboardChartsProps) {
  const emptyMultiSurvey: MultiSurveyData = { surveys: [] };
  const multiSurveyData = multiSurvey ?? emptyMultiSurvey;
  return (
    <ChartProvider>
      <div className="space-y-10">

        {/* Hero metrics — with benchmarks and performance zones */}
        <FadeIn>
          <div className="flex flex-wrap gap-x-8 gap-y-6 md:gap-x-12">
            <MetricCard label="Employee Engagement" value={data.eesScore} benchmark={80} trend={{ value: data.eesTrend, label: 'vs last year' }} />
            <MetricCard label="Great Place to Work" value={data.gptwScore} benchmark={85} />
            <MetricCard label="Response Rate" value={data.responseRate} showZone={false} />
            <MetricCard label="Responses" value={data.totalResponses} suffix="" showZone={false} />
          </div>
        </FadeIn>

        {/* Leaderboard */}
        <LeaderboardGrid metrics={data.leaderboard} />

        {/* Tabbed deep-dive content */}
        <FadeIn delay={0.1}>
          <Tabs defaultValue="overview">
            <TabsList className="h-9 bg-muted/50 mb-8">
              <TabsTrigger value="overview" className="text-xs px-4 h-8">Overview</TabsTrigger>
              <TabsTrigger value="deepdive" className="text-xs px-4 h-8">Deep Dive</TabsTrigger>
              <TabsTrigger value="workforce" className="text-xs px-4 h-8">Workforce Insights</TabsTrigger>
              <TabsTrigger value="qualitative" className="text-xs px-4 h-8">Qualitative</TabsTrigger>
            </TabsList>

            {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
            <TabsContent value="overview" className="mt-0 space-y-8">

              {/* EES Trend — full width */}
              {multiSurveyData.surveys.length > 0 && (
                <ErrorBoundary>
                  <ChartSection
                    title="Annual EES Trend"
                    description="Employee Engagement Score and GPTW satisfaction across all survey years"
                  >
                    <EESTrendChart data={multiSurveyData} />
                  </ChartSection>
                </ErrorBoundary>
              )}

              {/* Dimensions + Sentiment */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <ChartSection title="Pillar Performance" description="% favorable vs industry benchmark — hover for zone analysis">
                      <DimensionBarChart data={data.dimensions} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection title="Overall Sentiment" description="How employees feel — positive answers (4-5) vs neutral (3) vs negative (1-2)">
                      <ResponseDonutChart {...data.sentiment} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
              </div>

              {/* Industry Benchmark — full width */}
              <ErrorBoundary>
                <ChartSection
                  title="Industry Benchmark"
                  description="Our scores vs GPTW Best Workplaces 2024–2025 averages — gap annotations on our score bars"
                >
                  <IndustryBenchmarkChart data={data.industryBenchmark} />
                </ChartSection>
              </ErrorBoundary>

              {/* Relationship Radar + Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection
                      title="Relationship Axes"
                      description="3 key relationship dimensions that explain where issues originate"
                      height={300}
                    >
                      <RelationshipRadar data={data.relationshipScores} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <Tabs defaultValue="strengths">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">Statement Rankings</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Highest and lowest scoring statements</p>
                        </div>
                        <TabsList className="h-8 bg-muted/50">
                          <TabsTrigger value="strengths" className="text-xs px-3 h-7">Strengths</TabsTrigger>
                          <TabsTrigger value="opportunities" className="text-xs px-3 h-7">Opportunities</TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="strengths" className="mt-0">
                        <HorizontalBarRanking items={data.strengths} mode="strengths" />
                      </TabsContent>
                      <TabsContent value="opportunities" className="mt-0">
                        <HorizontalBarRanking items={data.opportunities} mode="opportunities" />
                      </TabsContent>
                    </Tabs>
                  </ErrorBoundary>
                </div>
              </div>

              {/* Department Breakdown */}
              <ErrorBoundary>
                <ChartSection title="Department Breakdown" description="Pillar scores by organization segment">
                  <DepartmentBreakdownChart data={data.departmentBreakdown} />
                </ChartSection>
              </ErrorBoundary>
            </TabsContent>

            {/* ── DEEP DIVE TAB ─────────────────────────────────────── */}
            <TabsContent value="deepdive" className="mt-0 space-y-8">

              {/* Pillar Heatmap — full width */}
              <ErrorBoundary>
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-foreground">Pillar Heatmap</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      5 pillars × departments — cells are color-coded relative to the overall average
                    </p>
                  </div>
                  <PillarHeatmap data={data.pillarHeatmap} />
                </div>
              </ErrorBoundary>

              {/* Sub-Pillar Breakdown — full width, after heatmap */}
              <ErrorBoundary>
                <ChartSection
                  title="Sub-Pillar Deep Dive"
                  description="15 sub-pillars grouped by dimension — click any section to expand or collapse"
                >
                  <SubPillarBreakdownChart data={data.subPillarScores} />
                </ChartSection>
              </ErrorBoundary>

              {/* Relationship Statements — full width */}
              <ErrorBoundary>
                <ChartSection
                  title="Relationship Statements"
                  description="Per-statement scores grouped by the 3 relationship axes — select a tab to explore each axis"
                >
                  <RelationshipStatementsChart data={data.relationshipStatements} />
                </ChartSection>
              </ErrorBoundary>

              {/* Leadership Confidence + Leadership Comparison side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <ChartSection
                      title="Leadership Perspective"
                      description="Pillar scores: People Managers vs Individual Contributors"
                      height={300}
                    >
                      <LeadershipComparisonChart data={data.leadershipComparison} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection
                      title="Confidence in Leadership"
                      description="5 Credibility statements measuring trust in leadership"
                      height={300}
                    >
                      <LeadershipConfidenceChart data={data.leadershipConfidence} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
              </div>

              {/* eNPS Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <ChartSection
                      title="eNPS — Loyalty Score"
                      description="Computed from the 2 endorsement statements (PRI-31 + PRI-35)"
                      height={340}
                    >
                      <ENPSDetailChart data={data.enpsDetail} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>

                {/* Legacy ENPS reference */}
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection title="Overall NPS (legacy)" description="Based on single statement UNC-47">
                      <ENPSGauge {...data.enps} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
              </div>
            </TabsContent>

            {/* ── WORKFORCE INSIGHTS TAB ────────────────────────────── */}
            <TabsContent value="workforce" className="mt-0 space-y-8">

              {/* Internal Benchmark — full width, before tenure journey */}
              {multiSurveyData.surveys.length >= 2 && (
                <ErrorBoundary>
                  <ChartSection
                    title="Internal Benchmark"
                    description="Dimension scores compared across all survey years — track improvement over time"
                  >
                    <InternalBenchmarkChart data={multiSurveyData} />
                  </ChartSection>
                </ErrorBoundary>
              )}

              {/* Tenure Journey */}
              <ErrorBoundary>
                <ChartSection
                  title="Tenure Journey"
                  description="Pillar scores across employee service year bands — tracks engagement through career lifecycle"
                  height={320}
                >
                  <TenureJourneyChart data={data.tenureJourney} />
                </ChartSection>
              </ErrorBoundary>

              {/* Tenure Insights + Early Warning side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <ChartSection
                      title="Caring & Support by Tenure"
                      description="Two sub-dimensions most at risk for long-tenured employees"
                      height={280}
                    >
                      <TenureInsightsChart data={data.tenureInsights} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <div>
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-foreground">Early Warning Signals</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Departments where &ldquo;Their Job&rdquo; AND Credibility are below average
                        </p>
                      </div>
                      <EarlyWarningAlerts alerts={data.earlyWarningAlerts} />
                    </div>
                  </ErrorBoundary>
                </div>
              </div>
            </TabsContent>

            {/* ── QUALITATIVE TAB ───────────────────────────────────── */}
            <TabsContent value="qualitative" className="mt-0 space-y-8">
              <ErrorBoundary>
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-foreground">Open-Ended Response Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Keyword-based sentiment classification of open-ended responses. No raw text is displayed to protect anonymity.
                    </p>
                  </div>
                  <SentimentAnalysisCards data={data.sentimentAnalysis} />
                </div>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </ChartProvider>
  );
}
