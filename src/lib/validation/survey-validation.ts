// src/lib/validation/survey-validation.ts
import type { Question } from '@/lib/types';

/**
 * Validate that all required questions have been answered.
 * Required: likert and demographic. Optional: open_ended.
 * Returns array of questionIds that are unanswered.
 */
export function validateAnswers(
  questions: Question[],
  answers: Record<string, string>
): string[] {
  return questions
    .filter(q => q.type !== 'open_ended')
    .filter(q => !answers[q.id] || answers[q.id].trim() === '')
    .map(q => q.id);
}
