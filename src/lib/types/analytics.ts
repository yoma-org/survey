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
}

export interface DepartmentBreakdownData {
  segments: {
    segmentLabel: string;
    dimensions: { dimension: string; score: number | null }[];  // null = < threshold
    responseCount: number;
  }[];
  anonymityThreshold: number;  // always 5
}
