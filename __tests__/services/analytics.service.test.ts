import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock csv.service — must be hoisted before importing the service under test
vi.mock('@/lib/services/csv.service', () => ({
  readRows: vi.fn(),
}));

// Mock token.service to control countSurveyTokens
vi.mock('@/lib/services/token.service', () => ({
  countSurveyTokens: vi.fn(),
}));

import { readRows } from '@/lib/services/csv.service';
import { countSurveyTokens } from '@/lib/services/token.service';
import { computeAnalytics } from '@/lib/services/analytics.service';
import { GPTW_QUESTIONS } from '@/lib/constants';

// All 47 Likert question IDs in order
const LIKERT_IDS = GPTW_QUESTIONS.filter(q => q.type === 'likert').map(q => q.id);

/**
 * Build a mock response row.
 * All 47 Likert questions get `likertValue`.
 * DEM-ORG = org, other fields blank.
 */
function makeRow(likertValue: string, org = 'Wave Money'): Record<string, string> {
  const row: Record<string, string> = {
    'DEM-ORG': org,
    'DEM-YEAR': '',
    'DEM-ROLE': '',
    'OE-01': '',
    'OE-02': '',
    surveyId: 'survey-test',
    token: 'test-token',
    email: 'test@example.com',
    submittedAt: new Date().toISOString(),
  };
  for (const id of LIKERT_IDS) {
    row[id] = likertValue;
  }
  return row;
}

describe('computeAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: 10 issued tokens
    vi.mocked(countSurveyTokens).mockResolvedValue(10);
  });

  it('Test 1 (DASH-01): eesScore is mean % favorable across all 47 Likert questions', async () => {
    // 2 rows: CAM-01="5", CRE-09="4", all others="3"
    const row1 = makeRow('3');
    row1['CAM-01'] = '5';
    row1['CRE-09'] = '4';

    const row2 = makeRow('3');
    row2['CAM-01'] = '5';
    row2['CRE-09'] = '4';

    vi.mocked(readRows).mockResolvedValue([row1, row2]);

    const result = await computeAnalytics('survey-test');
    expect(result).not.toBeNull();

    // CAM-01: 2/2 = 100%, CRE-09: 2/2 = 100%, all other 45: 0/2 = 0%
    // eesScore = Math.round((100 + 100 + 0 * 45) / 47) = Math.round(200/47) = Math.round(4.255) = 4
    expect(result!.eesScore).toBe(Math.round(200 / 47));
  });

  it('Test 2 (DASH-04 / ENPS): score=40, promoters=60, passives=20, detractors=20', async () => {
    // 10 rows: 6×UNC-47="5", 2×UNC-47="3", 2×UNC-47="1"
    const rows: Record<string, string>[] = [
      ...Array(6).fill(null).map(() => { const r = makeRow('3'); r['UNC-47'] = '5'; return r; }),
      ...Array(2).fill(null).map(() => { const r = makeRow('3'); r['UNC-47'] = '3'; return r; }),
      ...Array(2).fill(null).map(() => { const r = makeRow('3'); r['UNC-47'] = '1'; return r; }),
    ];

    vi.mocked(readRows).mockResolvedValue(rows);
    vi.mocked(countSurveyTokens).mockResolvedValue(10);

    const result = await computeAnalytics('survey-test');
    expect(result).not.toBeNull();

    expect(result!.enps.score).toBe(40);       // promoters - detractors = 60 - 20
    expect(result!.enps.promoters).toBe(60);   // 6/10 = 60%
    expect(result!.enps.passives).toBe(20);    // 2/10 = 20%
    expect(result!.enps.detractors).toBe(20);  // 2/10 = 20%
  });

  it('Test 3 (DATA-04): segments < 5 rows have null dimension scores; >= 5 rows computed', async () => {
    // 3 rows for "Wave Money" (below threshold), 8 rows for "Yoma Bank" (above threshold)
    const waveMoney = Array(3).fill(null).map(() => makeRow('4', 'Wave Money'));
    const yomaBank = Array(8).fill(null).map(() => makeRow('4', 'Yoma Bank'));
    const rows = [...waveMoney, ...yomaBank];

    vi.mocked(readRows).mockResolvedValue(rows);

    const result = await computeAnalytics('survey-test');
    expect(result).not.toBeNull();

    const breakdown = result!.departmentBreakdown;
    const waveSegment = breakdown.segments.find(s => s.segmentLabel === 'Wave Money');
    const yomaSegment = breakdown.segments.find(s => s.segmentLabel === 'Yoma Bank');

    expect(waveSegment).toBeDefined();
    expect(yomaSegment).toBeDefined();

    // Wave Money: 3 < 5 => all dimension scores null
    waveSegment!.dimensions.forEach(d => {
      expect(d.score).toBeNull();
    });

    // Yoma Bank: 8 >= 5 => all dimension scores computed (non-null)
    yomaSegment!.dimensions.forEach(d => {
      expect(d.score).not.toBeNull();
      expect(typeof d.score).toBe('number');
    });
  });

  it('Test 4 (null on zero responses): returns null when no responses exist', async () => {
    vi.mocked(readRows).mockResolvedValue([]);

    const result = await computeAnalytics('survey-test');

    expect(result).toBeNull();
  });

  it('Test 5 (pitfall guard): empty string answers are excluded from denominator', async () => {
    // 2 rows: row1 has CAM-01="" (empty), row2 has CAM-01="5"
    // favorableScore(CAM-01) should be 1/1 = 100% (not 1/2 = 50%)
    const row1 = makeRow('3');
    row1['CAM-01'] = '';  // empty — should be excluded

    const row2 = makeRow('3');
    row2['CAM-01'] = '5'; // favorable

    vi.mocked(readRows).mockResolvedValue([row1, row2]);

    const result = await computeAnalytics('survey-test');
    expect(result).not.toBeNull();

    // Find the CAM-01 question score in strengths or opportunities to verify
    // CAM-01 should be 100% favorable (1 favorable out of 1 valid answer)
    const allScores = [...result!.strengths, ...result!.opportunities];
    const cam01Question = GPTW_QUESTIONS.find(q => q.id === 'CAM-01')!;
    const cam01Entry = allScores.find(s => s.label === cam01Question.en || s.label === cam01Question.en.substring(0, 60));

    // If it's in strengths, score should be 100 (not 50)
    if (cam01Entry) {
      expect(cam01Entry.score).toBe(100);
    }

    // Additionally verify that eesScore > 0 (CAM-01's high score contributes)
    // With all others = "3" (0% favorable) and CAM-01 = 100%,
    // eesScore = Math.round(100 / 47) = Math.round(2.12) = 2
    expect(result!.eesScore).toBe(Math.round(100 / 47));
  });
});
