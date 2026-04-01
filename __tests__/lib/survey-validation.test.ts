import { describe, it, expect } from 'vitest';
import { validateAnswers } from '@/lib/validation/survey-validation';
import type { Question } from '@/lib/types';

const likertQ: Question = { id: 'CAM-01', type: 'likert', en: 'Q?', my: 'Q?' };
const openEndedQ: Question = { id: 'OE-01', type: 'open_ended', en: 'Q?', my: 'Q?' };
const demQ: Question = { id: 'DEM-ORG', type: 'demographic', en: 'Q?', my: 'Q?', options: [] };

describe('validateAnswers', () => {
  it('returns [] when all required questions answered', () => {
    const errors = validateAnswers([likertQ, openEndedQ, demQ], { 'CAM-01': '4', 'DEM-ORG': 'Org A' });
    expect(errors).toEqual([]);
  });

  it('returns questionId for unanswered likert', () => {
    const errors = validateAnswers([likertQ], {});
    expect(errors).toContain('CAM-01');
  });

  it('returns questionId for unanswered demographic', () => {
    const errors = validateAnswers([demQ], {});
    expect(errors).toContain('DEM-ORG');
  });

  it('does not include open_ended in errors', () => {
    const errors = validateAnswers([openEndedQ], {});
    expect(errors).not.toContain('OE-01');
    expect(errors).toEqual([]);
  });

  it('treats empty string as unanswered', () => {
    const errors = validateAnswers([likertQ], { 'CAM-01': '' });
    expect(errors).toContain('CAM-01');
  });
});
