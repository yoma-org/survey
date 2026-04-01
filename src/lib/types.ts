// src/lib/types.ts

export type QuestionType = 'likert' | 'open_ended' | 'demographic';
export type Dimension = 'camaraderie' | 'credibility' | 'fairness' | 'pride' | 'respect' | 'uncategorized';

export interface Question {
  id: string;           // e.g. "CAM-01", "OE-01", "DEM-ORG"
  type: QuestionType;
  dimension?: Dimension;
  subPillar?: string;   // e.g. "Communication", "Integrity"
  en: string;           // English text
  my: string;           // Burmese text (Unicode Myanmar — from PDF)
  options?: { en: string; my: string }[]; // for demographic select fields only
}

export interface Survey {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;   // ISO string
}

export interface Response {
  surveyId: string;
  token: string;
  email: string;
  submittedAt: string;
  answers: Record<string, string>;  // questionId -> value (always string for CSV safety)
}

export interface Token {
  token: string;
  surveyId: string;
  email: string;
  used: boolean;
  sentAt: string;
}
