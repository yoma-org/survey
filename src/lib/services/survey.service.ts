// src/lib/services/survey.service.ts
import { randomUUID } from 'crypto';
import { readRows, appendRow, writeRows } from './csv.service';
import type { Survey, Question } from '@/lib/types';

const SURVEYS_FILE = 'surveys.csv';

export async function createSurvey(data: { name: string; description?: string }): Promise<Survey> {
  const survey: Survey = {
    id: randomUUID(),
    name: data.name,
    description: data.description ?? '',
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  await appendRow(SURVEYS_FILE, survey as unknown as Record<string, string>);
  return survey;
}

export async function listSurveys(): Promise<Survey[]> {
  const rows = await readRows<Record<string, string>>(SURVEYS_FILE);
  return (rows as unknown as Survey[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSurvey(id: string): Promise<Survey | null> {
  const rows = await readRows<Record<string, string>>(SURVEYS_FILE);
  const found = rows.find(r => r.id === id);
  return found ? (found as unknown as Survey) : null;
}

export async function saveQuestions(surveyId: string, questions: Question[]): Promise<void> {
  const rows = questions.map(q => ({
    id: q.id,
    type: q.type,
    dimension: q.dimension ?? '',
    subPillar: q.subPillar ?? '',
    en: q.en,
    my: q.my,
    optionsJson: q.options ? JSON.stringify(q.options) : '',
  }));
  await writeRows(`questions-${surveyId}.csv`, rows);
}

export async function getQuestions(surveyId: string): Promise<Question[]> {
  const rows = await readRows<Record<string, string>>(`questions-${surveyId}.csv`);
  return rows.map(r => ({
    id: r.id,
    type: r.type as Question['type'],
    dimension: (r.dimension || undefined) as Question['dimension'],
    subPillar: r.subPillar || undefined,
    en: r.en,
    my: r.my,
    options: r.optionsJson ? JSON.parse(r.optionsJson) : undefined,
  }));
}

/**
 * Count submitted responses for a survey.
 * Reads responses-{surveyId}.csv — returns 0 if file does not exist.
 */
export async function getResponseCount(surveyId: string): Promise<number> {
  try {
    const rows = await readRows<Record<string, string>>(`responses-${surveyId}.csv`);
    return rows.length;
  } catch {
    return 0;
  }
}
