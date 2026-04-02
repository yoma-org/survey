// src/lib/types/analytics.ts
// Analytics data shapes for the dashboard — output of computeAnalytics()

export interface DashboardData {
  eesScore: number;
  eesTrend: number;           // hardcoded 0 — no multi-survey comparison in v1
  gptwScore: number;          // favorableScore('UNC-47')
  responseRate: number;       // submitted / total issued tokens × 100
  totalResponses: number;     // rows.length
  dimensions: { dimension: string; score: number }[];  // 5 items, Title Case names
  sentiment: { positive: number; neutral: number; negative: number };
  enps: { score: number; promoters: number; passives: number; detractors: number };
  strengths: { label: string; score: number }[];        // top 10 by % favorable
  opportunities: { label: string; score: number }[];    // bottom 10 by % favorable
  leaderboard: { label: string; value: number; color: string }[];  // 11 items
  departmentBreakdown: DepartmentBreakdownData;
  // Phase 2 additions
  relationshipScores: RelationshipScoreData;
  enpsDetail: ENPSDetailData;
  leadershipComparison: LeadershipComparisonData;
  tenureJourney: TenureJourneyData;
  tenureInsights: TenureInsightsData;
  earlyWarningAlerts: EarlyWarningAlert[];
  sentimentAnalysis: SentimentAnalysisData;
  pillarHeatmap: PillarHeatmapData;
  // Phase 3 additions
  subPillarScores: SubPillarScore[];
  relationshipStatements: RelationshipStatementBreakdown[];
  leadershipConfidence: LeadershipConfidenceData;
  industryBenchmark: IndustryBenchmarkData;
}

export interface DepartmentBreakdownData {
  segments: {
    segmentLabel: string;
    dimensions: { dimension: string; score: number | null }[];  // null = < threshold
    responseCount: number;
  }[];
  anonymityThreshold: number;  // always 5
}

// 3 relationship axes
export interface RelationshipScoreData {
  scores: {
    relationship: string;   // 'Colleagues', 'Their Job', 'Management'
    key: string;            // 'colleagues' | 'job' | 'management'
    score: number;          // % favorable
  }[];
}

// ENPS computed from PRI-31 + PRI-35
export interface ENPSDetailData {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  statementScores: {
    id: string;
    label: string;
    promoters: number;
    passives: number;
    detractors: number;
  }[];
}

// People Manager vs Individual Contributor pillar comparison
export interface LeadershipComparisonData {
  pillars: string[];   // dimension names
  manager: (number | null)[];    // score per pillar, null if < threshold
  ic: (number | null)[];         // score per pillar
  managerCount: number;
  icCount: number;
}

// Pillar scores per service-year tenure band
export interface TenureJourneyData {
  bands: {
    band: string;            // e.g. 'Less than 1 year'
    responseCount: number;
    scores: { dimension: string; score: number | null }[];  // null = < threshold
  }[];
  dimensions: string[];      // ordered dimension names
}

// Caring + Support sub-dimensions by tenure band
export interface TenureInsightsData {
  bands: {
    band: string;
    responseCount: number;
    caring: number | null;
    support: number | null;
  }[];
}

// Department where Their Job AND Credibility both drop below overall average
export interface EarlyWarningAlert {
  department: string;
  jobScore: number;
  credibilityScore: number;
  overallJobAvg: number;
  overallCredibilityAvg: number;
  responseCount: number;
}

// Keyword-based sentiment of open-ended answers
export interface SentimentAnalysisData {
  oe01: OpenEndedSentiment;
  oe02: OpenEndedSentiment;
}

export interface OpenEndedSentiment {
  questionId: string;
  questionLabel: string;
  totalResponses: number;
  frustrated: { count: number; percentage: number; themes: string[] };
  constructive: { count: number; percentage: number; themes: string[] };
  positive: { count: number; percentage: number; themes: string[] };
  unclassified: { count: number; percentage: number };
}

// Heatmap: 5 pillars × departments
export interface PillarHeatmapData {
  departments: string[];
  pillars: string[];
  cells: {
    department: string;
    pillar: string;
    score: number | null;
    delta: number | null;  // score minus overall average for that pillar
  }[];
  overallAverages: Record<string, number>;  // pillar → overall %
}

// ── Phase 3 additions ────────────────────────────────────────────────────────

// Sub-pillar breakdown: 15 items (3 per dimension)
export interface SubPillarScore {
  dimension: string;    // e.g. 'Credibility'
  subPillar: string;    // e.g. 'Communication'
  score: number;        // % favorable
  negative: number;     // % responses 1-2
  neutral: number;      // % responses 3
  positive: number;     // % responses 4-5
  questionCount: number;
}

// Per-statement breakdown for each relationship axis
export interface RelationshipStatementBreakdown {
  relationship: string;  // 'Colleagues (Horizontal Trust)', etc.
  key: string;           // 'colleagues' | 'job' | 'management'
  statements: {
    id: string;
    label: string;
    score: number;       // % favorable
  }[];
  averageScore: number;
}

// Confidence in Leadership — 5 CRE statements
export interface LeadershipConfidenceData {
  overallScore: number;
  statements: {
    id: string;
    label: string;
    score: number;
  }[];
}

// Industry benchmark comparison
export interface IndustryBenchmarkData {
  dimensions: {
    name: string;
    score: number;
    benchmark: number;
    gap: number;   // positive = above benchmark
  }[];
  overall: {
    name: string;
    score: number;
    benchmark: number;
    gap: number;
  }[];
}

// Per-survey summary for multi-survey comparison
export interface SurveySummary {
  surveyId: string;
  surveyName: string;
  year: number;          // extracted from survey name or createdAt year
  eesScore: number;
  gptwScore: number;
  enps: number;
  dimensions: { dimension: string; score: number }[];
  relationships: { key: string; score: number }[];
}

// Multi-survey analytics (for trend and internal benchmark)
export interface MultiSurveyData {
  surveys: SurveySummary[];
}

