// src/lib/services/analytics.service.ts
// Server-only analytics aggregation — do NOT add 'use client'

import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { countSurveyTokens } from './token.service';
import { GPTW_QUESTIONS } from '@/lib/constants';
import {
  QUESTION_RELATIONSHIP_MAP,
  RELATIONSHIP_LABELS,
  getRelationshipLabels,
  ENPS_STATEMENT_IDS,
  type Relationship,
} from '@/lib/diagnostic-framework';
import { listSurveys } from '@/lib/services/survey.service';
import { PILLAR_DIMENSIONS } from '@/lib/diagnostic-framework';
import { INDUSTRY_BENCHMARKS } from '@/lib/performance-zones';
import type {
  DashboardData,
  DepartmentBreakdownData,
  RelationshipScoreData,
  ENPSDetailData,
  LeadershipComparisonData,
  TenureJourneyData,
  TenureInsightsData,
  EarlyWarningAlert,
  SentimentAnalysisData,
  OpenEndedSentiment,
  PillarHeatmapData,
  SubPillarScore,
  RelationshipStatementBreakdown,
  LeadershipConfidenceData,
  IndustryBenchmarkData,
  MultiSurveyData,
  SurveySummary,
} from '@/lib/types/analytics';

const ANONYMITY_THRESHOLD = 5;

const DIMENSION_DISPLAY_EN: Record<string, string> = {
  camaraderie: 'Camaraderie',
  credibility: 'Credibility',
  fairness: 'Fairness',
  pride: 'Pride',
  respect: 'Respect',
};

const DIMENSION_DISPLAY_MY: Record<string, string> = {
  camaraderie: 'ဖော်ရွေမှု',
  credibility: 'ယုံကြည်ကိုးစားနိုင်မှု',
  fairness: 'တရားမျှတမှု',
  pride: 'ဂုဏ်ယူမှု',
  respect: 'လေးစားမှု',
};

// Active locale display map — set at start of computeAnalytics()
let DIMENSION_DISPLAY: Record<string, string> = DIMENSION_DISPLAY_EN;

function setLocaleDisplays(locale: string) {
  DIMENSION_DISPLAY = locale === 'my' ? DIMENSION_DISPLAY_MY : DIMENSION_DISPLAY_EN;
}

const SCORED_DIMENSIONS = ['camaraderie', 'credibility', 'fairness', 'pride', 'respect'] as const;

// Tenure band ordering — must match DEM-YEAR option values
const TENURE_BAND_ORDER = [
  'Less than 1 year',
  '1 to 3 years',
  '3 to 5 years',
  '5 to 10 years',
  '10 to 20 years',
  'More than 20 years',
] as const;

// Keyword lists for open-ended sentiment classification
const FRUSTRATED_KEYWORDS = [
  'never', 'worst', 'terrible', 'unfair', 'stress', 'overwork', 'no support',
  'awful', 'horrible', 'hate', 'frustrat', 'disappoint', 'fail', 'poor', 'bad',
  'toxic', 'bully', 'harass', 'underpaid', 'underpay', 'burnout', 'exhausted',
];
const CONSTRUCTIVE_KEYWORDS = [
  'could', 'should', 'improve', 'suggest', 'better', 'would be nice',
  'recommend', 'consider', 'perhaps', 'maybe', 'wish', 'hope', 'propose',
  'opportunity', 'enhance', 'increase', 'add', 'provide', 'need more',
];
const POSITIVE_KEYWORDS = [
  'great', 'love', 'best', 'amazing', 'excellent', 'proud', 'thankful',
  'fantastic', 'wonderful', 'awesome', 'enjoy', 'happy', 'grateful', 'blessed',
  'good', 'supportive', 'helpful', 'kind', 'strong', 'trust', 'appreciate',
];

function favorableScore(rows: Record<string, string>[], questionId: string): number {
  const validAnswers = rows
    .map(r => r[questionId])
    .filter(v => v !== undefined && v !== '');

  if (validAnswers.length === 0) return 0;

  const favorable = validAnswers.filter(v => v === '4' || v === '5').length;
  return Math.round((favorable / validAnswers.length) * 100);
}

function computeSegmentDimensionScores(
  rows: Record<string, string>[]
): Record<string, number | null> {
  if (rows.length < ANONYMITY_THRESHOLD) {
    return Object.fromEntries(SCORED_DIMENSIONS.map(d => [DIMENSION_DISPLAY[d], null]));
  }
  return Object.fromEntries(
    SCORED_DIMENSIONS.map(dim => {
      const qs = GPTW_QUESTIONS.filter(q => q.type === 'likert' && q.dimension === dim);
      const scores = qs.map(q => favorableScore(rows, q.id));
      const mean = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      return [DIMENSION_DISPLAY[dim], mean];
    })
  );
}

function computeENPS(
  rows: Record<string, string>[]
): { score: number; promoters: number; passives: number; detractors: number } {
  const validAnswers = rows
    .map(r => r['UNC-47'])
    .filter(v => v !== undefined && v !== '');

  if (validAnswers.length === 0) {
    return { score: 0, promoters: 0, passives: 0, detractors: 0 };
  }

  const total = validAnswers.length;
  const promoterCount = validAnswers.filter(v => v === '4' || v === '5').length;
  const passiveCount = validAnswers.filter(v => v === '3').length;
  const detractorCount = validAnswers.filter(v => v === '1' || v === '2').length;

  const promoters = Math.round((promoterCount / total) * 100);
  const passives = Math.round((passiveCount / total) * 100);
  const detractors = Math.round((detractorCount / total) * 100);

  return { score: promoters - detractors, promoters, passives, detractors };
}

function computeSegmentDimensions(
  rows: Record<string, string>[],
): { dimension: string; score: number | null }[] {
  if (rows.length < ANONYMITY_THRESHOLD) {
    return SCORED_DIMENSIONS.map(dim => ({
      dimension: DIMENSION_DISPLAY[dim],
      score: null,
    }));
  }

  return SCORED_DIMENSIONS.map(dim => {
    const dimQuestions = GPTW_QUESTIONS.filter(
      q => q.type === 'likert' && q.dimension === dim
    );
    const scores = dimQuestions.map(q => favorableScore(rows, q.id));
    const meanScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return { dimension: DIMENSION_DISPLAY[dim], score: meanScore };
  });
}

// ---------- Phase 2 computations ----------

function computeRelationshipScores(
  rows: Record<string, string>[],
  questionScoreMap: Record<string, number>,
  locale: string = 'en'
): RelationshipScoreData {
  const relationshipKeys: Relationship[] = ['colleagues', 'job', 'management'];
  const groupScores: Record<Relationship, number[]> = {
    colleagues: [],
    job: [],
    management: [],
  };

  for (const q of GPTW_QUESTIONS.filter(q => q.type === 'likert')) {
    const rel = QUESTION_RELATIONSHIP_MAP[q.id];
    if (rel && questionScoreMap[q.id] !== undefined) {
      groupScores[rel].push(questionScoreMap[q.id]);
    }
  }

  const relLabels = getRelationshipLabels(locale);
  return {
    scores: relationshipKeys.map(rel => {
      const arr = groupScores[rel];
      const score = arr.length > 0
        ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
        : 0;
      return {
        relationship: relLabels[rel],
        key: rel,
        score,
      };
    }),
  };
}

function computeENPSDetail(rows: Record<string, string>[], locale: string = 'en'): ENPSDetailData {
  function enpsBreakdown(questionId: string) {
    const values = rows.map(r => r[questionId]).filter(v => v !== undefined && v !== '');
    const total = values.length;
    if (total === 0) return { promoters: 0, passives: 0, detractors: 0 };
    return {
      promoters: Math.round((values.filter(v => v === '4' || v === '5').length / total) * 100),
      passives: Math.round((values.filter(v => v === '3').length / total) * 100),
      detractors: Math.round((values.filter(v => v === '1' || v === '2').length / total) * 100),
    };
  }

  // Combined from both ENPS statements
  const combined = [...ENPS_STATEMENT_IDS].flatMap(id =>
    rows.map(r => r[id]).filter(v => v !== undefined && v !== '')
  );
  const total = combined.length;
  const promoterCount = combined.filter(v => v === '4' || v === '5').length;
  const passiveCount = combined.filter(v => v === '3').length;
  const detractorCount = combined.filter(v => v === '1' || v === '2').length;

  const promoters = total > 0 ? Math.round((promoterCount / total) * 100) : 0;
  const passives = total > 0 ? Math.round((passiveCount / total) * 100) : 0;
  const detractors = total > 0 ? Math.round((detractorCount / total) * 100) : 0;

  return {
    score: promoters - detractors,
    promoters,
    passives,
    detractors,
    statementScores: ENPS_STATEMENT_IDS.map(id => {
      const q = GPTW_QUESTIONS.find(q => q.id === id);
      const text = q ? (locale === 'my' && q.my ? q.my : q.en) : id;
      return {
        id,
        label: text.length > 60 ? text.substring(0, 60) + '…' : text,
        ...enpsBreakdown(id),
      };
    }),
  };
}

function computeLeadershipComparison(
  rows: Record<string, string>[]
): LeadershipComparisonData {
  const pillars = SCORED_DIMENSIONS.map(d => DIMENSION_DISPLAY[d]);

  // Match option values from DEMOGRAPHIC_FIELDS
  const managers = rows.filter(r => {
    const role = r['DEM-ROLE'] ?? '';
    return role.toLowerCase().includes('people manager') || role.toLowerCase().includes('manage');
  });
  const ics = rows.filter(r => {
    const role = r['DEM-ROLE'] ?? '';
    return role.toLowerCase().includes('individual contributor') || role.toLowerCase().includes('do not manage');
  });

  function pillarScores(group: Record<string, string>[]): (number | null)[] {
    if (group.length < ANONYMITY_THRESHOLD) {
      return pillars.map(() => null);
    }
    return SCORED_DIMENSIONS.map(dim => {
      const qs = GPTW_QUESTIONS.filter(q => q.type === 'likert' && q.dimension === dim);
      const scores = qs.map(q => favorableScore(group, q.id));
      return scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    });
  }

  return {
    pillars,
    manager: pillarScores(managers),
    ic: pillarScores(ics),
    managerCount: managers.length,
    icCount: ics.length,
  };
}

function computeTenureJourney(rows: Record<string, string>[]): TenureJourneyData {
  const dimensions = SCORED_DIMENSIONS.map(d => DIMENSION_DISPLAY[d]);
  const bandMap = new Map<string, Record<string, string>[]>();

  for (const band of TENURE_BAND_ORDER) {
    bandMap.set(band, []);
  }
  for (const row of rows) {
    const band = row['DEM-YEAR'];
    if (band && bandMap.has(band)) {
      bandMap.get(band)!.push(row);
    }
  }

  const bands = Array.from(bandMap.entries())
    .filter(([, bandRows]) => bandRows.length > 0)
    .map(([band, bandRows]) => {
      const scores = computeSegmentDimensions(bandRows);
      return {
        band,
        responseCount: bandRows.length,
        scores,
      };
    });

  return { bands, dimensions };
}

function computeTenureInsights(rows: Record<string, string>[]): TenureInsightsData {
  // Caring sub-dimension: RES-37, RES-39, RES-40, RES-41, RES-43, RES-46
  const caringIds = ['RES-37', 'RES-39', 'RES-40', 'RES-41', 'RES-43', 'RES-46'];
  // Support sub-dimension (Development): RES-38, RES-42
  const supportIds = ['RES-38', 'RES-42'];

  const bandMap = new Map<string, Record<string, string>[]>();
  for (const band of TENURE_BAND_ORDER) {
    bandMap.set(band, []);
  }
  for (const row of rows) {
    const band = row['DEM-YEAR'];
    if (band && bandMap.has(band)) {
      bandMap.get(band)!.push(row);
    }
  }

  const bands = Array.from(bandMap.entries())
    .filter(([, bandRows]) => bandRows.length > 0)
    .map(([band, bandRows]) => {
      if (bandRows.length < ANONYMITY_THRESHOLD) {
        return { band, responseCount: bandRows.length, caring: null, support: null };
      }
      const caringScores = caringIds.map(id => favorableScore(bandRows, id));
      const supportScores = supportIds.map(id => favorableScore(bandRows, id));
      return {
        band,
        responseCount: bandRows.length,
        caring: Math.round(caringScores.reduce((a, b) => a + b, 0) / caringScores.length),
        support: Math.round(supportScores.reduce((a, b) => a + b, 0) / supportScores.length),
      };
    });

  return { bands };
}

function computeEarlyWarningAlerts(
  rows: Record<string, string>[],
  dimensionScoreMap: Record<string, number>
): EarlyWarningAlert[] {
  const overallJobAvg = dimensionScoreMap['pride'] ?? 0;
  const overallCredibilityAvg = dimensionScoreMap['credibility'] ?? 0;

  const segmentMap = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const dept = row['DEM-ORG'] || 'Unknown';
    if (!segmentMap.has(dept)) segmentMap.set(dept, []);
    segmentMap.get(dept)!.push(row);
  }

  const alerts: EarlyWarningAlert[] = [];
  for (const [department, deptRows] of segmentMap.entries()) {
    if (deptRows.length < ANONYMITY_THRESHOLD) continue;

    const jobQs = GPTW_QUESTIONS.filter(q => q.type === 'likert' && q.dimension === 'pride');
    const jobScores = jobQs.map(q => favorableScore(deptRows, q.id));
    const jobScore = jobScores.length > 0
      ? Math.round(jobScores.reduce((a, b) => a + b, 0) / jobScores.length)
      : 0;

    const credQs = GPTW_QUESTIONS.filter(q => q.type === 'likert' && q.dimension === 'credibility');
    const credScores = credQs.map(q => favorableScore(deptRows, q.id));
    const credibilityScore = credScores.length > 0
      ? Math.round(credScores.reduce((a, b) => a + b, 0) / credScores.length)
      : 0;

    if (jobScore < overallJobAvg && credibilityScore < overallCredibilityAvg) {
      alerts.push({
        department,
        jobScore,
        credibilityScore,
        overallJobAvg,
        overallCredibilityAvg,
        responseCount: deptRows.length,
      });
    }
  }

  return alerts.sort((a, b) => (a.jobScore + a.credibilityScore) - (b.jobScore + b.credibilityScore));
}

function classifySentiment(text: string): 'frustrated' | 'constructive' | 'positive' | 'unclassified' {
  const lower = text.toLowerCase();
  const frustrated = FRUSTRATED_KEYWORDS.some(kw => lower.includes(kw));
  const constructive = CONSTRUCTIVE_KEYWORDS.some(kw => lower.includes(kw));
  const positive = POSITIVE_KEYWORDS.some(kw => lower.includes(kw));

  // Priority: frustrated > constructive > positive (worst first)
  if (frustrated) return 'frustrated';
  if (constructive) return 'constructive';
  if (positive) return 'positive';
  return 'unclassified';
}

function extractThemes(texts: string[], keywords: string[]): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    const lower = text.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) found.add(kw);
    }
  }
  return Array.from(found).slice(0, 8);
}

function computeOpenEndedSentiment(
  rows: Record<string, string>[],
  questionId: string,
  questionLabel: string
): OpenEndedSentiment {
  const answers = rows
    .map(r => r[questionId])
    .filter(v => v !== undefined && v.trim() !== '');

  if (answers.length === 0) {
    return {
      questionId,
      questionLabel,
      totalResponses: 0,
      frustrated: { count: 0, percentage: 0, themes: [] },
      constructive: { count: 0, percentage: 0, themes: [] },
      positive: { count: 0, percentage: 0, themes: [] },
      unclassified: { count: 0, percentage: 0 },
    };
  }

  const classified = answers.map(a => ({ text: a, sentiment: classifySentiment(a) }));
  const total = answers.length;

  const frustratedTexts = classified.filter(c => c.sentiment === 'frustrated').map(c => c.text);
  const constructiveTexts = classified.filter(c => c.sentiment === 'constructive').map(c => c.text);
  const positiveTexts = classified.filter(c => c.sentiment === 'positive').map(c => c.text);
  const unclassifiedCount = classified.filter(c => c.sentiment === 'unclassified').length;

  return {
    questionId,
    questionLabel,
    totalResponses: total,
    frustrated: {
      count: frustratedTexts.length,
      percentage: Math.round((frustratedTexts.length / total) * 100),
      themes: extractThemes(frustratedTexts, FRUSTRATED_KEYWORDS),
    },
    constructive: {
      count: constructiveTexts.length,
      percentage: Math.round((constructiveTexts.length / total) * 100),
      themes: extractThemes(constructiveTexts, CONSTRUCTIVE_KEYWORDS),
    },
    positive: {
      count: positiveTexts.length,
      percentage: Math.round((positiveTexts.length / total) * 100),
      themes: extractThemes(positiveTexts, POSITIVE_KEYWORDS),
    },
    unclassified: {
      count: unclassifiedCount,
      percentage: Math.round((unclassifiedCount / total) * 100),
    },
  };
}

function computeSentimentAnalysis(rows: Record<string, string>[]): SentimentAnalysisData {
  return {
    oe01: computeOpenEndedSentiment(
      rows,
      'OE-01',
      'What makes this company a great place to work?'
    ),
    oe02: computeOpenEndedSentiment(
      rows,
      'OE-02',
      'One thing to change for a better workplace'
    ),
  };
}

function computePillarHeatmap(
  rows: Record<string, string>[],
  dimensionScoreMap: Record<string, number>
): PillarHeatmapData {
  const pillars = SCORED_DIMENSIONS.map(d => DIMENSION_DISPLAY[d]);
  const overallAverages: Record<string, number> = {};
  for (const dim of SCORED_DIMENSIONS) {
    overallAverages[DIMENSION_DISPLAY[dim]] = dimensionScoreMap[dim] ?? 0;
  }

  const segmentMap = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const dept = row['DEM-ORG'] || 'Unknown';
    if (!segmentMap.has(dept)) segmentMap.set(dept, []);
    segmentMap.get(dept)!.push(row);
  }

  const departments = Array.from(segmentMap.keys());
  const cells: PillarHeatmapData['cells'] = [];

  for (const [dept, deptRows] of segmentMap.entries()) {
    const scores = computeSegmentDimensionScores(deptRows);
    for (const pillar of pillars) {
      const score = scores[pillar] ?? null;
      const overall = overallAverages[pillar] ?? 0;
      cells.push({
        department: dept,
        pillar,
        score,
        delta: score !== null ? score - overall : null,
      });
    }
  }

  return { departments, pillars, cells, overallAverages };
}

// ── Phase 3 computations ─────────────────────────────────────────────────────

function computeSubPillarScores(rows: Record<string, string>[]): SubPillarScore[] {
  const results: SubPillarScore[] = [];

  for (const dim of SCORED_DIMENSIONS) {
    const dimDisplay = DIMENSION_DISPLAY[dim];
    const subPillarsConfig = PILLAR_DIMENSIONS[dim]?.subPillars ?? [];
    const subPillarNames = subPillarsConfig.map(sp => sp.name);

    for (const spName of subPillarNames) {
      const qs = GPTW_QUESTIONS.filter(
        q => q.type === 'likert' && q.dimension === dim && q.subPillar === spName
      );
      if (qs.length === 0) continue;

      if (rows.length < ANONYMITY_THRESHOLD) {
        results.push({ dimension: dimDisplay, subPillar: spName, score: 0, negative: 0, neutral: 0, positive: 0, questionCount: qs.length });
        continue;
      }

      // Collect all valid answers across sub-pillar questions
      let totalAnswers = 0;
      let negCount = 0;
      let neuCount = 0;
      let posCount = 0;
      for (const q of qs) {
        for (const r of rows) {
          const v = r[q.id];
          if (v === undefined || v === '') continue;
          totalAnswers++;
          if (v === '1' || v === '2') negCount++;
          else if (v === '3') neuCount++;
          else if (v === '4' || v === '5') posCount++;
        }
      }

      const scores = qs.map(q => favorableScore(rows, q.id));
      const mean = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const negative = totalAnswers > 0 ? Math.round((negCount / totalAnswers) * 100) : 0;
      const neutral = totalAnswers > 0 ? Math.round((neuCount / totalAnswers) * 100) : 0;
      const positive = totalAnswers > 0 ? Math.round((posCount / totalAnswers) * 100) : 0;
      results.push({ dimension: dimDisplay, subPillar: spName, score: mean, negative, neutral, positive, questionCount: qs.length });
    }
  }

  return results;
}

function computeRelationshipStatements(
  rows: Record<string, string>[],
  questionScoreMap: Record<string, number>,
  locale: string = 'en'
): RelationshipStatementBreakdown[] {
  const relationshipKeys: Relationship[] = ['colleagues', 'job', 'management'];
  const relLabels = getRelationshipLabels(locale);

  return relationshipKeys.map(rel => {
    const matchingQuestions = GPTW_QUESTIONS.filter(
      q => q.type === 'likert' && QUESTION_RELATIONSHIP_MAP[q.id] === rel
    );

    const statements = matchingQuestions.map(q => {
      const text = locale === 'my' && q.my ? q.my : q.en;
      return {
        id: q.id,
        label: text.length > 70 ? text.substring(0, 70) + '…' : text,
        score: rows.length >= ANONYMITY_THRESHOLD ? (questionScoreMap[q.id] ?? 0) : 0,
      };
    });

    const scores = statements.map(s => s.score);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      relationship: relLabels[rel],
      key: rel,
      statements,
      averageScore,
    };
  });
}

function computeLeadershipConfidence(
  rows: Record<string, string>[],
  questionScoreMap: Record<string, number>,
  locale: string = 'en'
): LeadershipConfidenceData {
  const leadershipIds = ['CRE-09', 'CRE-10', 'CRE-12', 'CRE-13', 'CRE-15'];

  const statements = leadershipIds.map(id => {
    const q = GPTW_QUESTIONS.find(q => q.id === id);
    const text = q ? (locale === 'my' && q.my ? q.my : q.en) : id;
    return {
      id,
      label: text.length > 70 ? text.substring(0, 70) + '…' : text,
      score: rows.length >= ANONYMITY_THRESHOLD ? (questionScoreMap[id] ?? 0) : 0,
    };
  });

  const overallScore = statements.length > 0
    ? Math.round(statements.reduce((a, b) => a + b.score, 0) / statements.length)
    : 0;

  return { overallScore, statements };
}

function computeIndustryBenchmark(
  dimensionScoreMap: Record<string, number>,
  eesScore: number,
  gptwScore: number,
  enpsScore: number
): IndustryBenchmarkData {
  const dimensions = SCORED_DIMENSIONS.map(dim => {
    const name = DIMENSION_DISPLAY[dim];
    const enName = DIMENSION_DISPLAY_EN[dim]; // Always use English for benchmark lookup
    const score = dimensionScoreMap[dim] ?? 0;
    const benchmark = INDUSTRY_BENCHMARKS[enName] ?? 78;
    return { name, score, benchmark, gap: score - benchmark };
  });

  const overall = [
    {
      name: 'EES',
      score: eesScore,
      benchmark: INDUSTRY_BENCHMARKS['EES'] ?? 80,
      gap: eesScore - (INDUSTRY_BENCHMARKS['EES'] ?? 80),
    },
    {
      name: 'GPTW',
      score: gptwScore,
      benchmark: INDUSTRY_BENCHMARKS['GPTW'] ?? 85,
      gap: gptwScore - (INDUSTRY_BENCHMARKS['GPTW'] ?? 85),
    },
    {
      name: 'ENPS',
      score: enpsScore,
      benchmark: INDUSTRY_BENCHMARKS['ENPS'] ?? 70,
      gap: enpsScore - (INDUSTRY_BENCHMARKS['ENPS'] ?? 70),
    },
  ];

  return { dimensions, overall };
}

export async function computeMultiSurveyAnalytics(org?: string, locale: string = 'en'): Promise<MultiSurveyData> {
  setLocaleDisplays(locale);
  // Load all surveys sorted chronologically
  const allSurveys = await listSurveys();
  if (allSurveys.length === 0) return { surveys: [] };

  const summaries: SurveySummary[] = [];

  for (const survey of allSurveys) {
    const dbResponses = await db.select().from(schema.responses)
      .where(eq(schema.responses.surveyId, survey.id));

    if (dbResponses.length === 0) continue;

    const allRows: Record<string, string>[] = dbResponses.map(r => {
      const answers = r.answers as Record<string, string>;
      return { ...answers, email: r.email };
    });

    const rows = org ? allRows.filter(r => r['DEM-ORG'] === org) : allRows;
    if (rows.length < ANONYMITY_THRESHOLD) continue;

    const likertQuestions = GPTW_QUESTIONS.filter(q => q.type === 'likert');

    const questionScoreMap: Record<string, number> = {};
    for (const q of likertQuestions) {
      questionScoreMap[q.id] = favorableScore(rows, q.id);
    }

    const allScores = Object.values(questionScoreMap);
    const eesScore = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    const gptwScore = questionScoreMap['UNC-47'] ?? 0;

    const dimensionScores: { dimension: string; score: number }[] = SCORED_DIMENSIONS.map(dim => {
      const dimQs = likertQuestions.filter(q => q.dimension === dim);
      const scores = dimQs.map(q => questionScoreMap[q.id]);
      const mean = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      return { dimension: DIMENSION_DISPLAY[dim], score: mean };
    });

    // eNPS from UNC-47
    const enpsData = computeENPS(rows);

    // Relationship scores
    const relKeys: Relationship[] = ['colleagues', 'job', 'management'];
    const relationships = relKeys.map(rel => {
      const qs = GPTW_QUESTIONS.filter(
        q => q.type === 'likert' && QUESTION_RELATIONSHIP_MAP[q.id] === rel
      );
      const scores = qs.map(q => questionScoreMap[q.id] ?? 0);
      const score = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      return { key: rel, score };
    });

    // Extract year from survey name or fall back to createdAt year
    const createdYear = new Date(survey.createdAt).getFullYear();
    const nameYearMatch = survey.name.match(/\b(20\d{2})\b/);
    const year = nameYearMatch ? parseInt(nameYearMatch[1], 10) : createdYear;

    summaries.push({
      surveyId: survey.id,
      surveyName: survey.name,
      year,
      eesScore,
      gptwScore,
      enps: enpsData.score,
      dimensions: dimensionScores,
      relationships,
    });
  }

  // Sort chronologically
  summaries.sort((a, b) => a.year - b.year || a.surveyName.localeCompare(b.surveyName));

  return { surveys: summaries };
}

export async function getDistinctDepartments(surveyId: string): Promise<string[]> {
  const dbResponses = await db.select({ answers: schema.responses.answers })
    .from(schema.responses)
    .where(eq(schema.responses.surveyId, surveyId));

  const depts = new Set<string>();
  for (const r of dbResponses) {
    const answers = r.answers as Record<string, string>;
    const dept = answers['__department__'];
    if (dept && dept.trim()) depts.add(dept.trim());
  }
  return Array.from(depts).sort();
}

export async function computeAnalytics(surveyId: string, org?: string, dept?: string, locale: string = 'en'): Promise<DashboardData | null> {
  // Load responses from PostgreSQL
  const dbResponses = await db.select().from(schema.responses)
    .where(eq(schema.responses.surveyId, surveyId));

  if (dbResponses.length === 0) return null;

  // Convert DB rows to flat answer records (same shape as old CSV rows)
  const allRows: Record<string, string>[] = dbResponses.map(r => {
    const answers = r.answers as Record<string, string>;
    return { ...answers, email: r.email };
  });

  // Apply org and department filters
  let rows = org ? allRows.filter(r => r['DEM-ORG'] === org) : allRows;
  if (dept) rows = rows.filter(r => (r['__department__'] ?? '').trim() === dept);

  if (rows.length === 0) return null;

  // Set locale-aware display names for this computation
  setLocaleDisplays(locale);

  const likertQuestions = GPTW_QUESTIONS.filter(q => q.type === 'likert');

  // Per-question favorable scores
  const questionScoreMap: Record<string, number> = {};
  for (const q of likertQuestions) {
    questionScoreMap[q.id] = favorableScore(rows, q.id);
  }

  // EES = mean of all per-question scores
  const allScores = Object.values(questionScoreMap);
  const eesScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  // GPTW score = UNC-47
  const gptwScore = questionScoreMap['UNC-47'] ?? 0;

  // Dimension scores
  const dimensionScoreMap: Record<string, number> = {};
  for (const dim of SCORED_DIMENSIONS) {
    const dimQuestions = likertQuestions.filter(q => q.dimension === dim);
    const dimScores = dimQuestions.map(q => questionScoreMap[q.id]);
    dimensionScoreMap[dim] = dimScores.length > 0
      ? Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length)
      : 0;
  }

  const dimensions = SCORED_DIMENSIONS.map(dim => ({
    dimension: DIMENSION_DISPLAY[dim],
    score: dimensionScoreMap[dim],
  }));

  // Sentiment
  let positiveCount = 0, neutralCount = 0, negativeCount = 0, totalValid = 0;
  for (const q of likertQuestions) {
    for (const row of rows) {
      const v = row[q.id];
      if (!v) continue;
      totalValid++;
      if (v === '4' || v === '5') positiveCount++;
      else if (v === '3') neutralCount++;
      else negativeCount++;
    }
  }

  const sentiment = {
    positive: totalValid > 0 ? Math.round((positiveCount / totalValid) * 100) : 0,
    neutral: totalValid > 0 ? Math.round((neutralCount / totalValid) * 100) : 0,
    negative: totalValid > 0 ? Math.round((negativeCount / totalValid) * 100) : 0,
  };

  // ENPS
  const enps = computeENPS(rows);

  // Strengths / Opportunities
  const qText = (q: typeof likertQuestions[number]) => locale === 'my' && q.my ? q.my : q.en;
  const scoredQuestions = likertQuestions.map(q => {
    const text = qText(q);
    return {
      label: text.length > 60 ? text.substring(0, 60) + '…' : text,
      score: questionScoreMap[q.id],
    };
  });

  const strengths = [...scoredQuestions].sort((a, b) => b.score - a.score).slice(0, 10);
  const opportunities = [...scoredQuestions].sort((a, b) => a.score - b.score).slice(0, 10);

  // Response rate
  const totalTokens = await countSurveyTokens(surveyId);
  const responseRate = totalTokens === 0 ? 0 : Math.round((rows.length / totalTokens) * 100);

  // Innovation / Leadership composite scores
  const innovationIds = ['CRE-11', 'RES-38', 'RES-44', 'PRI-28'];
  const leadershipIds = ['CRE-09', 'CRE-10', 'CRE-12', 'CRE-13', 'CRE-15'];

  const innovationScore = Math.round(
    innovationIds.map(id => questionScoreMap[id] ?? 0).reduce((a, b) => a + b, 0) / innovationIds.length
  );
  const leadershipScore = Math.round(
    leadershipIds.map(id => questionScoreMap[id] ?? 0).reduce((a, b) => a + b, 0) / leadershipIds.length
  );

  const leaderboardLabels = locale === 'my' ? {
    completion: 'ပြီးစီးမှု', credibility: 'ယုံကြည်ကိုးစားနိုင်မှု', respect: 'လေးစားမှု',
    fairness: 'တရားမျှတမှု', pride: 'ဂုဏ်ယူမှု', camaraderie: 'ဖော်ရွေမှု',
    satisfaction: 'ကျေနပ်မှု', enps: 'ENPS', engagement: 'ပါဝင်မှု',
    innovation: 'ဆန်းသစ်မှု', leadership: 'ခေါင်းဆောင်မှု',
  } : {
    completion: 'Completion', credibility: 'Credibility', respect: 'Respect',
    fairness: 'Fairness', pride: 'Pride', camaraderie: 'Camaraderie',
    satisfaction: 'Satisfaction', enps: 'ENPS', engagement: 'Engagement',
    innovation: 'Innovation', leadership: 'Leadership',
  };

  const leaderboard = [
    { label: leaderboardLabels.completion,   value: responseRate,                  color: 'hsl(220 70% 55%)' },
    { label: leaderboardLabels.credibility,  value: dimensionScoreMap.credibility, color: 'hsl(220 70% 55%)' },
    { label: leaderboardLabels.respect,      value: dimensionScoreMap.respect,     color: 'hsl(255 55% 58%)' },
    { label: leaderboardLabels.fairness,     value: dimensionScoreMap.fairness,    color: 'hsl(175 45% 45%)' },
    { label: leaderboardLabels.pride,        value: dimensionScoreMap.pride,       color: 'hsl(25 75% 55%)'  },
    { label: leaderboardLabels.camaraderie,  value: dimensionScoreMap.camaraderie, color: 'hsl(155 45% 45%)' },
    { label: leaderboardLabels.satisfaction, value: gptwScore,                     color: 'hsl(220 70% 55%)' },
    { label: leaderboardLabels.enps,         value: enps.score,                    color: 'hsl(155 45% 45%)' },
    { label: leaderboardLabels.engagement,   value: eesScore,                      color: 'hsl(255 55% 58%)' },
    { label: leaderboardLabels.innovation,   value: innovationScore,               color: 'hsl(175 45% 45%)' },
    { label: leaderboardLabels.leadership,   value: leadershipScore,               color: 'hsl(25 75% 55%)'  },
  ];

  // Department breakdown — group by DEM-ORG
  const segmentMap = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const org = row['DEM-ORG'] || 'Unknown';
    if (!segmentMap.has(org)) segmentMap.set(org, []);
    segmentMap.get(org)!.push(row);
  }

  const departmentBreakdown: DepartmentBreakdownData = {
    segments: Array.from(segmentMap.entries()).map(([segmentLabel, segmentRows]) => ({
      segmentLabel,
      dimensions: computeSegmentDimensions(segmentRows),
      responseCount: segmentRows.length,
    })),
    anonymityThreshold: ANONYMITY_THRESHOLD,
  };

  // Phase 2 computations
  const relationshipScores = computeRelationshipScores(rows, questionScoreMap, locale);
  const enpsDetail = computeENPSDetail(rows, locale);
  const leadershipComparison = computeLeadershipComparison(rows);
  const tenureJourney = computeTenureJourney(rows);
  const tenureInsights = computeTenureInsights(rows);
  const earlyWarningAlerts = computeEarlyWarningAlerts(rows, dimensionScoreMap);
  const sentimentAnalysis = computeSentimentAnalysis(rows);
  const pillarHeatmap = computePillarHeatmap(rows, dimensionScoreMap);

  // Phase 3 computations
  const subPillarScores = computeSubPillarScores(rows);
  const relationshipStatements = computeRelationshipStatements(rows, questionScoreMap, locale);
  const leadershipConfidence = computeLeadershipConfidence(rows, questionScoreMap, locale);
  const industryBenchmark = computeIndustryBenchmark(dimensionScoreMap, eesScore, gptwScore, enps.score);

  return {
    eesScore,
    eesTrend: 0,
    gptwScore,
    responseRate,
    totalResponses: rows.length,
    dimensions,
    sentiment,
    enps,
    strengths,
    opportunities,
    leaderboard,
    departmentBreakdown,
    // Phase 2
    relationshipScores,
    enpsDetail,
    leadershipComparison,
    tenureJourney,
    tenureInsights,
    earlyWarningAlerts,
    sentimentAnalysis,
    pillarHeatmap,
    // Phase 3
    subPillarScores,
    relationshipStatements,
    leadershipConfidence,
    industryBenchmark,
  };
}
