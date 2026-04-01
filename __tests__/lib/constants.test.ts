import { describe, it, expect } from 'vitest';
import { GPTW_QUESTIONS, ALL_QUESTIONS } from '@/lib/constants';

describe('GPTW_QUESTIONS', () => {
  it('exports exactly 46 Likert questions', () => {
    expect(GPTW_QUESTIONS).toHaveLength(46);
  });

  it('starts with CAM-01', () => {
    expect(GPTW_QUESTIONS[0].id).toBe('CAM-01');
  });

  it('ends with UNC-47 (last Likert question)', () => {
    const last = GPTW_QUESTIONS[GPTW_QUESTIONS.length - 1];
    expect(last.id).toBe('UNC-47');
  });

  it('every question has en and my string properties', () => {
    for (const q of GPTW_QUESTIONS) {
      expect(typeof q.en).toBe('string');
      expect(q.en.length).toBeGreaterThan(0);
      expect(typeof q.my).toBe('string');
    }
  });

  it('every question has a dimension', () => {
    for (const q of GPTW_QUESTIONS) {
      expect(q.dimension).toBeDefined();
    }
  });
});

describe('ALL_QUESTIONS', () => {
  it('includes demographic fields DEM-ORG, DEM-YEAR, DEM-ROLE', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(ids).toContain('DEM-ORG');
    expect(ids).toContain('DEM-YEAR');
    expect(ids).toContain('DEM-ROLE');
  });

  it('includes open-ended questions OE-01 and OE-02', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(ids).toContain('OE-01');
    expect(ids).toContain('OE-02');
  });
});
