'use client';

// Placeholder — full implementation in Task 3
import type { Survey, Question, Token } from '@/lib/types';

interface SurveyFormProps {
  survey: Survey;
  questions: Question[];
  tokenRow: Token;
  locale: 'en' | 'my';
}

export function SurveyForm({ survey, questions, tokenRow, locale }: SurveyFormProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1>{survey.name}</h1>
      <p>{tokenRow.email}</p>
      <p>{questions.length} questions</p>
      <p>{locale}</p>
    </div>
  );
}
