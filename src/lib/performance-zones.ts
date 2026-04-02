// Performance zone classifications for GPTW survey scores
// Based on Great Place to Work benchmarking standards

export type PerformanceZone = 'excellent' | 'strong' | 'moderate' | 'concern' | 'critical';

export interface ZoneConfig {
  zone: PerformanceZone;
  label: string;
  labelKey: string;      // i18n key in dashboard namespace (e.g. 'zoneExcellent')
  descriptionKey: string; // i18n key for description
  min: number;
  max: number;
  color: string;        // for badges and indicators
  bgColor: string;      // for backgrounds
  description: string;  // what this means for HR (English fallback)
}

export const PERFORMANCE_ZONES: ZoneConfig[] = [
  { zone: 'excellent', label: 'Excellent', labelKey: 'zoneExcellent', descriptionKey: 'zoneExcellentDesc', min: 85, max: 100, color: 'hsl(155 50% 38%)', bgColor: 'hsl(155 50% 95%)', description: 'Top-tier culture. Maintain and celebrate.' },
  { zone: 'strong', label: 'Strong', labelKey: 'zoneStrong', descriptionKey: 'zoneStrongDesc', min: 75, max: 84, color: 'hsl(220 70% 50%)', bgColor: 'hsl(220 70% 95%)', description: 'Healthy foundation. Small improvements yield big returns.' },
  { zone: 'moderate', label: 'Moderate', labelKey: 'zoneModerate', descriptionKey: 'zoneModerateDesc', min: 65, max: 74, color: 'hsl(35 80% 50%)', bgColor: 'hsl(35 80% 95%)', description: 'Room to grow. Focus on specific sub-dimensions.' },
  { zone: 'concern', label: 'Needs Attention', labelKey: 'zoneConcern', descriptionKey: 'zoneConcernDesc', min: 50, max: 64, color: 'hsl(15 80% 50%)', bgColor: 'hsl(15 80% 95%)', description: 'Below expectations. Develop an action plan.' },
  { zone: 'critical', label: 'Critical', labelKey: 'zoneCritical', descriptionKey: 'zoneCriticalDesc', min: 0, max: 49, color: 'hsl(0 60% 50%)', bgColor: 'hsl(0 60% 95%)', description: 'Urgent intervention needed. Immediate leadership attention.' },
];

export function getPerformanceZone(score: number): ZoneConfig {
  return PERFORMANCE_ZONES.find(z => score >= z.min && score <= z.max) || PERFORMANCE_ZONES[4];
}

// Industry benchmark reference (GPTW "Best Workplaces" 2024-2025 averages)
export const INDUSTRY_BENCHMARKS: Record<string, number> = {
  'Credibility': 80,
  'Respect': 78,
  'Fairness': 76,
  'Pride': 82,
  'Camaraderie': 84,
  'EES': 80,
  'GPTW': 85,
  'ENPS': 70,
};

// Gap analysis helper
export interface GapInsight {
  dimension: string;
  score: number;
  benchmark: number;
  gap: number;         // positive = above benchmark, negative = below
  zone: ZoneConfig;
  actionRequired: boolean;
  insight: string;     // human-readable interpretation
}

export function analyzeGap(dimension: string, score: number): GapInsight {
  const benchmark = INDUSTRY_BENCHMARKS[dimension] ?? 78;
  const gap = score - benchmark;
  const zone = getPerformanceZone(score);
  const actionRequired = gap < -5 || zone.zone === 'concern' || zone.zone === 'critical';

  let insight: string;
  if (gap >= 10) {
    insight = `Significantly above benchmark. A standout strength to leverage.`;
  } else if (gap >= 3) {
    insight = `Above benchmark. Healthy performance — maintain current practices.`;
  } else if (gap >= -3) {
    insight = `On par with benchmark. Stable but watch for trends.`;
  } else if (gap >= -10) {
    insight = `Below benchmark by ${Math.abs(gap)}pts. Targeted improvement recommended.`;
  } else {
    insight = `Significantly below benchmark. Requires structured intervention.`;
  }

  return { dimension, score, benchmark, gap, zone, actionRequired, insight };
}
