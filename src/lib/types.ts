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
  imageUrl?: string;    // optional image displayed alongside the question
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
  status: 'pending' | 'submitted';  // NOT a boolean — CSV stores as string
  createdAt: string;                 // sentAt equivalent
  submittedAt?: string;              // populated when survey is completed
}

export interface SmtpSettings {
  host: string;
  port: string;       // stored as string in CSV
  username: string;
  password: string;   // stored as-is; never transmitted to client
  fromAddress: string;
  fromName: string;
}
