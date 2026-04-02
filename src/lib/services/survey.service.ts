// src/lib/services/survey.service.ts
import { db, schema } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import type { Question } from '@/lib/types';

export async function createSurvey(name: string, description?: string) {
  const [survey] = await db.insert(schema.surveys).values({
    name,
    description: description || null,
    status: 'draft',
  }).returning();
  return {
    id: survey.id,
    name: survey.name,
    description: survey.description ?? undefined,
    status: survey.status as 'draft' | 'active' | 'closed',
    createdAt: survey.createdAt.toISOString(),
  };
}

export async function listSurveys() {
  const rows = await db.select().from(schema.surveys).orderBy(schema.surveys.createdAt);
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    status: r.status as 'draft' | 'active' | 'closed',
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getSurvey(id: string) {
  const [row] = await db.select().from(schema.surveys).where(eq(schema.surveys.id, id));
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as 'draft' | 'active' | 'closed',
    createdAt: row.createdAt.toISOString(),
  };
}

export async function saveQuestions(surveyId: string, questions: Question[]) {
  await db.delete(schema.questions).where(eq(schema.questions.surveyId, surveyId));
  if (questions.length === 0) return;

  await db.insert(schema.questions).values(
    questions.map((q, i) => ({
      id: q.id,
      surveyId,
      type: q.type,
      dimension: q.dimension || null,
      subPillar: q.subPillar || null,
      en: q.en,
      my: q.my,
      options: q.options ? JSON.parse(JSON.stringify(q.options)) : null,
      sortOrder: i,
    }))
  );
}

export async function getQuestions(surveyId: string): Promise<Question[]> {
  const rows = await db.select().from(schema.questions)
    .where(eq(schema.questions.surveyId, surveyId))
    .orderBy(schema.questions.sortOrder);

  return rows.map(r => ({
    id: r.id,
    type: r.type as Question['type'],
    dimension: r.dimension as Question['dimension'],
    subPillar: r.subPillar || undefined,
    en: r.en,
    my: r.my,
    options: r.options as Question['options'],
  }));
}

export async function getDepartments() {
  const rows = await db.select().from(schema.departments).orderBy(schema.departments.sortOrder);
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    nameMy: r.nameMy,
  }));
}

export async function getResponseCount(surveyId: string): Promise<number> {
  const [result] = await db.select({ count: sql<number>`count(*)::int` })
    .from(schema.responses)
    .where(eq(schema.responses.surveyId, surveyId));
  return result?.count ?? 0;
}
