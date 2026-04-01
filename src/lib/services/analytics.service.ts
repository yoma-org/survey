// src/lib/services/analytics.service.ts
// Server-only analytics aggregation — do NOT add 'use client'

import { readRows } from './csv.service';
import { countSurveyTokens } from './token.service';
import { GPTW_QUESTIONS } from '@/lib/constants';
import type { DashboardData, DepartmentBreakdownData } from '@/lib/types/analytics';

const ANONYMITY_THRESHOLD = 5;

// Dimension display name mapping (Title Case)
const DIMENSION_DISPLAY: Record<string, string> = {
  camaraderie: 'Camaraderie',
  credibility: 'Credibility',
  fairness: 'Fairness',
  pride: 'Pride',
  respect: 'Respect',
};

// The 5 scored dimensions (excludes 'uncategorized')
const SCORED_DIMENSIONS = ['camaraderie', 'credibility', 'fairness', 'pride', 'respect'] as const;

/**
 * Compute % favorable for a single question across all rows.
 * Favorable = answer "4" or "5" (string comparison — CSV values are always strings).
 * Empty strings are EXCLUDED from the denominator before any calculation.
 * Returns 0 if there are no valid (non-empty) answers.
 */
function favorableScore(rows: Record<string, string>[], questionId: string): number {
  const validAnswers = rows
    .map(r => r[questionId])
    .filter(v => v !== undefined && v !== '');

  if (validAnswers.length === 0) return 0;

  const favorable = validAnswers.filter(v => v === '4' || v === '5').length;
  return Math.round((favorable / validAnswers.length) * 100);
}

/**
 * Compute ENPS from UNC-47 responses.
 * Promoters = "4" or "5", Passives = "3", Detractors = "1" or "2".
 * Percentages rounded to nearest integer. Score = promoters% - detractors% (signed integer).
 */
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
  const score = promoters - detractors;

  return { score, promoters, passives, detractors };
}

/**
 * Compute dimension breakdown for a segment of rows.
 * If segment has < ANONYMITY_THRESHOLD rows, all dimension scores are null.
 */
function computeSegmentDimensions(
  rows: Record<string, string>[],
  questionScoreMap: Record<string, number>
): { dimension: string; score: number | null }[] {
  if (rows.length < ANONYMITY_THRESHOLD) {
    // Below anonymity threshold — null all scores
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

/**
 * Main analytics aggregation function.
 * Reads responses-{surveyId}.csv and tokens-{surveyId}.csv.
 * Returns null if no responses exist.
 */
export async function computeAnalytics(surveyId: string): Promise<DashboardData | null> {
  // Step 1: Load responses
  const rows = await readRows<Record<string, string>>(`responses-${surveyId}.csv`);

  // Step 2: Return null if no responses
  if (rows.length === 0) return null;

  // Step 3: Get all 47 Likert question IDs
  const likertQuestions = GPTW_QUESTIONS.filter(q => q.type === 'likert');
  // Verify we have exactly 47: CAM-01..08, CRE-09..17, FAI-18..25, PRI-26..35, RES-36..46, UNC-47

  // Step 5: Compute per-question favorable scores
  const questionScoreMap: Record<string, number> = {};
  for (const q of likertQuestions) {
    questionScoreMap[q.id] = favorableScore(rows, q.id);
  }

  // Step 6: EES = mean of all 47 per-question scores, rounded
  const allScores = Object.values(questionScoreMap);
  const eesScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  // Step 7: GPTW score = favorableScore('UNC-47')
  const gptwScore = questionScoreMap['UNC-47'] ?? 0;

  // Step 8: Dimension scores (5 dimensions, Title Case)
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

  // Step 9: Sentiment across ALL Likert answers
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalValidLikertAnswers = 0;

  for (const q of likertQuestions) {
    for (const row of rows) {
      const v = row[q.id];
      if (v === undefined || v === '') continue;
      totalValidLikertAnswers++;
      if (v === '4' || v === '5') positiveCount++;
      else if (v === '3') neutralCount++;
      else if (v === '1' || v === '2') negativeCount++;
    }
  }

  const sentiment = {
    positive: totalValidLikertAnswers > 0
      ? Math.round((positiveCount / totalValidLikertAnswers) * 100)
      : 0,
    neutral: totalValidLikertAnswers > 0
      ? Math.round((neutralCount / totalValidLikertAnswers) * 100)
      : 0,
    negative: totalValidLikertAnswers > 0
      ? Math.round((negativeCount / totalValidLikertAnswers) * 100)
      : 0,
  };

  // Step 10: ENPS from UNC-47
  const enps = computeENPS(rows);

  // Step 11: Strengths — all 47 per-question scores, sorted descending, top 10
  const scoredQuestions = likertQuestions.map(q => {
    const en = q.en.length > 60 ? q.en.substring(0, 60) + '…' : q.en;
    return { label: en, score: questionScoreMap[q.id] };
  });

  const sortedDesc = [...scoredQuestions].sort((a, b) => b.score - a.score);
  const strengths = sortedDesc.slice(0, 10);

  // Step 12: Opportunities — same list sorted ascending, bottom 10
  const sortedAsc = [...scoredQuestions].sort((a, b) => a.score - b.score);
  const opportunities = sortedAsc.slice(0, 10);

  // Step 13: Response rate
  const totalTokens = await countSurveyTokens(surveyId);
  const responseRate = totalTokens === 0
    ? 0
    : Math.round((rows.length / totalTokens) * 100);

  // Step 13 continued: Innovation and Leadership composite scores
  // Innovation: discretionary grouping of questions reflecting adaptability and new idea encouragement
  // Leadership: discretionary grouping of credibility questions reflecting leadership quality
  const innovationIds = ['CRE-11', 'RES-38', 'RES-44', 'PRI-28'];
  const leadershipIds = ['CRE-09', 'CRE-10', 'CRE-12', 'CRE-13', 'CRE-15'];

  const innovationScore = Math.round(
    innovationIds
      .map(id => questionScoreMap[id] ?? 0)
      .reduce((a, b) => a + b, 0) / innovationIds.length
  );

  const leadershipScore = Math.round(
    leadershipIds
      .map(id => questionScoreMap[id] ?? 0)
      .reduce((a, b) => a + b, 0) / leadershipIds.length
  );

  const leaderboard = [
    { label: 'Completion',   value: responseRate,                  color: 'hsl(220 70% 55%)' },
    { label: 'Credibility',  value: dimensionScoreMap.credibility, color: 'hsl(220 70% 55%)' },
    { label: 'Respect',      value: dimensionScoreMap.respect,     color: 'hsl(255 55% 58%)' },
    { label: 'Fairness',     value: dimensionScoreMap.fairness,    color: 'hsl(175 45% 45%)' },
    { label: 'Pride',        value: dimensionScoreMap.pride,       color: 'hsl(25 75% 55%)'  },
    { label: 'Camaraderie',  value: dimensionScoreMap.camaraderie, color: 'hsl(155 45% 45%)' },
    { label: 'Satisfaction', value: gptwScore,                     color: 'hsl(220 70% 55%)' },
    { label: 'ENPS',         value: enps.score,                    color: 'hsl(155 45% 45%)' },
    { label: 'Engagement',   value: eesScore,                      color: 'hsl(255 55% 58%)' },
    { label: 'Innovation',   value: innovationScore,               color: 'hsl(175 45% 45%)' },
    { label: 'Leadership',   value: leadershipScore,               color: 'hsl(25 75% 55%)'  },
  ];

  // Step 14: Department breakdown — group by DEM-ORG
  const segmentMap = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const org = row['DEM-ORG'] || 'Unknown';
    if (!segmentMap.has(org)) segmentMap.set(org, []);
    segmentMap.get(org)!.push(row);
  }

  const segments = Array.from(segmentMap.entries()).map(([segmentLabel, segmentRows]) => ({
    segmentLabel,
    dimensions: computeSegmentDimensions(segmentRows, questionScoreMap),
    responseCount: segmentRows.length,
  }));

  const departmentBreakdown: DepartmentBreakdownData = {
    segments,
    anonymityThreshold: ANONYMITY_THRESHOLD,
  };

  // Step 16: Assemble and return DashboardData
  return {
    eesScore,
    eesTrend: 0,  // hardcoded — no multi-survey comparison in v1
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
  };
}
