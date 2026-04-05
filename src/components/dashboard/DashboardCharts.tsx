'use client';

import dynamic from 'next/dynamic';
import { ChartProvider } from '@/components/charts/ChartProvider';
import { MetricCard } from './MetricCard';
import { ChartSection } from './ChartSection';
import { HorizontalBarRanking } from '@/components/charts/HorizontalBarRanking';

import { useTranslations } from 'next-intl';
import { FadeIn } from '@/components/motion/FadeIn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from './ErrorBoundary';
import type { DashboardData, MultiSurveyData } from '@/lib/types/analytics';

// Lazy-load heavy chart components — only loaded when their tab is active
const DimensionBarChart = dynamic(() => import('@/components/charts/DimensionBarChart').then(m => ({ default: m.DimensionBarChart })), { ssr: false });
const ResponseDonutChart = dynamic(() => import('@/components/charts/ResponseDonutChart').then(m => ({ default: m.ResponseDonutChart })), { ssr: false });
const ENPSGauge = dynamic(() => import('@/components/charts/ENPSGauge').then(m => ({ default: m.ENPSGauge })), { ssr: false });
const RelationshipRadar = dynamic(() => import('@/components/charts/RelationshipRadar').then(m => ({ default: m.RelationshipRadar })), { ssr: false });
const LeadershipComparisonChart = dynamic(() => import('@/components/charts/LeadershipComparisonChart').then(m => ({ default: m.LeadershipComparisonChart })), { ssr: false });
const TenureJourneyChart = dynamic(() => import('@/components/charts/TenureJourneyChart').then(m => ({ default: m.TenureJourneyChart })), { ssr: false });
const TenureInsightsChart = dynamic(() => import('@/components/charts/TenureInsightsChart').then(m => ({ default: m.TenureInsightsChart })), { ssr: false });
const ENPSDetailChart = dynamic(() => import('@/components/charts/ENPSDetailChart').then(m => ({ default: m.ENPSDetailChart })), { ssr: false });
const EESTrendChart = dynamic(() => import('@/components/charts/EESTrendChart').then(m => ({ default: m.EESTrendChart })), { ssr: false });
const SubPillarBreakdownChart = dynamic(() => import('@/components/charts/SubPillarBreakdownChart').then(m => ({ default: m.SubPillarBreakdownChart })), { ssr: false });
const LeadershipConfidenceChart = dynamic(() => import('@/components/charts/LeadershipConfidenceChart').then(m => ({ default: m.LeadershipConfidenceChart })), { ssr: false });
const RelationshipStatementsChart = dynamic(() => import('@/components/charts/RelationshipStatementsChart').then(m => ({ default: m.RelationshipStatementsChart })), { ssr: false });
const InternalBenchmarkChart = dynamic(() => import('@/components/charts/InternalBenchmarkChart').then(m => ({ default: m.InternalBenchmarkChart })), { ssr: false });
const IndustryBenchmarkChart = dynamic(() => import('@/components/charts/IndustryBenchmarkChart').then(m => ({ default: m.IndustryBenchmarkChart })), { ssr: false });
const PillarHeatmap = dynamic(() => import('./PillarHeatmap').then(m => ({ default: m.PillarHeatmap })), { ssr: false });
const SentimentAnalysisCards = dynamic(() => import('./SentimentAnalysisCards').then(m => ({ default: m.SentimentAnalysisCards })), { ssr: false });
const EarlyWarningAlerts = dynamic(() => import('./EarlyWarningAlerts').then(m => ({ default: m.EarlyWarningAlerts })), { ssr: false });
const DepartmentBreakdownChart = dynamic(() => import('./DepartmentBreakdownChart').then(m => ({ default: m.DepartmentBreakdownChart })), { ssr: false });

interface DashboardChartsProps {
  data: DashboardData;
  multiSurvey?: MultiSurveyData;
}

export function DashboardCharts({ data, multiSurvey }: DashboardChartsProps) {
  const t = useTranslations('dashboard');
  const emptyMultiSurvey: MultiSurveyData = { surveys: [] };
  const multiSurveyData = multiSurvey ?? emptyMultiSurvey;
  return (
    <ChartProvider>
      <div className="space-y-10">

        {/* Hero metrics — with benchmarks and performance zones */}
        <FadeIn>
          <div className="flex flex-wrap gap-x-8 gap-y-6 md:gap-x-12">
            <MetricCard label={t('metricEmployeeEngagement')} value={data.eesScore} benchmark={80} trend={{ value: data.eesTrend, label: t('metricVsLastYear') }} testId="metric-employee-engagement" />
            <MetricCard label={t('metricGreatPlaceToWork')} value={data.gptwScore} benchmark={85} testId="metric-great-place-to-work" />
            <MetricCard label={t('metricResponseRate')} value={data.responseRate} showZone={false} testId="metric-response-rate" />
            <MetricCard label={t('metricResponses')} value={data.totalResponses} suffix="" showZone={false} testId="metric-total-responses" />
          </div>
        </FadeIn>

        {/* Leaderboard */}
        {/* <LeaderboardGrid metrics={data.leaderboard} /> */}

        {/* Tabbed deep-dive content */}
        <FadeIn delay={0.1}>
          <Tabs defaultValue="overview">
            <TabsList className="h-9 bg-muted/50 mb-8">
              <TabsTrigger value="overview" className="text-xs px-4 h-8">{t('tabOverview')}</TabsTrigger>
              <TabsTrigger value="deepdive" className="text-xs px-4 h-8">{t('tabDeepDive')}</TabsTrigger>
              <TabsTrigger value="workforce" className="text-xs px-4 h-8">{t('tabWorkforce')}</TabsTrigger>
              <TabsTrigger value="qualitative" className="text-xs px-4 h-8">{t('tabQualitative')}</TabsTrigger>
            </TabsList>

            {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
            <TabsContent value="overview" className="mt-0 space-y-8">

              {/* EES Trend — full width */}
              {multiSurveyData.surveys.length > 1 && (
                <ErrorBoundary>
                  <ChartSection
                    title={t('sectionEESTrend')}
                    description={t('sectionEESTrendDesc')}
                    testId="chart-ees-trend"
                  >
                    <EESTrendChart data={multiSurveyData} />
                  </ChartSection>
                </ErrorBoundary>
              )}

              {/* Dimensions + Sentiment */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <ChartSection title={t('sectionPillarPerformance')} description={t('sectionPillarPerformanceDesc')} testId="chart-pillar-performance">
                      <DimensionBarChart data={data.dimensions} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection title={t('sectionOverallSentiment')} description={t('sectionOverallSentimentDesc')} testId="chart-overall-sentiment">
                      <ResponseDonutChart {...data.sentiment} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
              </div>

              {/* Industry Benchmark — full width */}
              <ErrorBoundary>
                <ChartSection
                  title={t('sectionIndustryBenchmark')}
                  description={t('sectionIndustryBenchmarkDesc')}
                  testId="chart-industry-benchmark"
                >
                  <IndustryBenchmarkChart data={data.industryBenchmark} />
                </ChartSection>
              </ErrorBoundary>

              {/* Relationship Radar + Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection
                      title={t('sectionRelationshipAxes')}
                      description={t('sectionRelationshipAxesDesc')}
                      height={300}
                      testId="chart-relationship-axes"
                    >
                      <RelationshipRadar data={data.relationshipScores} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <div data-test-id="chart-statement-rankings">
                    <Tabs defaultValue="strengths">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{t('sectionStatementRankings')}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{t('sectionStatementRankingsDesc')}</p>
                        </div>
                        <TabsList className="h-8 bg-muted/50">
                          <TabsTrigger value="strengths" className="text-xs px-3 h-7">{t('sectionStrengths')}</TabsTrigger>
                          <TabsTrigger value="opportunities" className="text-xs px-3 h-7">{t('sectionOpportunities')}</TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="strengths" className="mt-0">
                        <HorizontalBarRanking items={data.strengths} mode="strengths" />
                      </TabsContent>
                      <TabsContent value="opportunities" className="mt-0">
                        <HorizontalBarRanking items={data.opportunities} mode="opportunities" />
                      </TabsContent>
                    </Tabs>
                    </div>
                  </ErrorBoundary>
                </div>
              </div>

              {/* Department Breakdown */}
              <ErrorBoundary>
                <ChartSection title={t('sectionDepartmentBreakdown')} description={t('sectionDepartmentBreakdownDesc')} testId="chart-department-breakdown">
                  <DepartmentBreakdownChart data={data.departmentBreakdown} />
                </ChartSection>
              </ErrorBoundary>
            </TabsContent>

            {/* ── DEEP DIVE TAB ─────────────────────────────────────── */}
            <TabsContent value="deepdive" className="mt-0 space-y-8">

              {/* Pillar Heatmap — full width */}
              <ErrorBoundary>
                <div data-test-id="chart-pillar-heatmap">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-foreground">{t('sectionPillarHeatmap')}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('sectionPillarHeatmapDesc')}
                    </p>
                  </div>
                  <PillarHeatmap data={data.pillarHeatmap} />
                </div>
              </ErrorBoundary>

              {/* Sub-Pillar Breakdown — full width, after heatmap */}
              <ErrorBoundary>
                <ChartSection
                  title={t('sectionSubPillarDeepDive')}
                  description={t('sectionSubPillarDeepDiveDesc')}
                  testId="chart-sub-pillar-breakdown"
                >
                  <SubPillarBreakdownChart data={data.subPillarScores} />
                </ChartSection>
              </ErrorBoundary>

              {/* Relationship Statements — full width */}
              <ErrorBoundary>
                <ChartSection
                  title={t('sectionRelationshipStatements')}
                  description={t('sectionRelationshipStatementsDesc')}
                  testId="chart-relationship-statements"
                >
                  <RelationshipStatementsChart data={data.relationshipStatements} />
                </ChartSection>
              </ErrorBoundary>

              {/* Leadership Confidence + Leadership Comparison side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <ChartSection
                      title={t('sectionLeadershipPerspective')}
                      description={t('sectionLeadershipPerspectiveDesc')}
                      height={300}
                      testId="chart-leadership-comparison"
                    >
                      <LeadershipComparisonChart data={data.leadershipComparison} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection
                      title={t('sectionConfidenceInLeadership')}
                      description={t('sectionConfidenceInLeadershipDesc')}
                      height={300}
                      testId="chart-leadership-confidence"
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
                      title={t('sectionEnpsDetail')}
                      description={t('sectionEnpsDetailDesc')}
                      height={340}
                      testId="chart-enps-detail"
                    >
                      <ENPSDetailChart data={data.enpsDetail} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>

                {/* Legacy ENPS reference */}
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <ChartSection title={t('sectionEnpsLegacy')} description={t('sectionEnpsLegacyDesc')} testId="chart-enps-legacy">
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
                    title={t('sectionInternalBenchmark')}
                    description={t('sectionInternalBenchmarkDesc')}
                    testId="chart-internal-benchmark"
                  >
                    <InternalBenchmarkChart data={multiSurveyData} />
                  </ChartSection>
                </ErrorBoundary>
              )}

              {/* Tenure Journey */}
              <ErrorBoundary>
                <ChartSection
                  title={t('sectionTenureJourney')}
                  description={t('sectionTenureJourneyDesc')}
                  height={320}
                  testId="chart-tenure-journey"
                >
                  <TenureJourneyChart data={data.tenureJourney} />
                </ChartSection>
              </ErrorBoundary>

              {/* Tenure Insights + Early Warning side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <ErrorBoundary>
                    <ChartSection
                      title={t('sectionTenureInsights')}
                      description={t('sectionTenureInsightsDesc')}
                      height={280}
                      testId="chart-tenure-insights"
                    >
                      <TenureInsightsChart data={data.tenureInsights} />
                    </ChartSection>
                  </ErrorBoundary>
                </div>
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <div data-test-id="chart-early-warning">
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-foreground">{t('sectionEarlyWarning')}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('sectionEarlyWarningDesc')}
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
                <div data-test-id="chart-sentiment-analysis">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-foreground">{t('sectionQualitative')}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('sectionQualitativeDesc')}
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
