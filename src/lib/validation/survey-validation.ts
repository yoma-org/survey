// src/lib/validation/survey-validation.ts
import type { Question } from '@/lib/types';

/**
 * Validate that all required questions have been answered.
 * Required: likert, demographic, and __department__. Optional: open_ended.
 * Returns array of questionIds that are unanswered.
 */
export function validateAnswers(
  questions: Question[],
  answers: Record<string, string>
): string[] {
  const unanswered = questions
    .filter(q => q.type !== 'open_ended')
    .filter(q => !answers[q.id] || answers[q.id].trim() === '')
    .map(q => q.id);

  // Department is required
  if (!answers['__department__'] || answers['__department__'].trim() === '') {
    unanswered.push('__department__');
  }

  return unanswered;
}
