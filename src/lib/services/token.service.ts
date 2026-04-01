// src/lib/services/token.service.ts
import { randomBytes } from 'crypto';
import { readRows, appendRow, writeRows } from './csv.service';
import type { Token } from '@/lib/types';

function tokenFile(surveyId: string) {
  return `tokens-${surveyId}.csv`;
}

/**
 * Generate a unique 64-char hex token for a survey+email pair.
 * Idempotent: returns the existing token if one already exists for this email.
 */
export async function generateToken(surveyId: string, email: string): Promise<string> {
  const filename = tokenFile(surveyId);
  const existing = await readRows<Record<string, string>>(filename);
  const found = existing.find(r => r.email === email && r.surveyId === surveyId);
  if (found) return found.token;

  const token = randomBytes(32).toString('hex');
  await appendRow(filename, {
    token,
    email,
    surveyId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    submittedAt: '',
  });
  return token;
}

/**
 * Validate a token for a given survey.
 * Returns the Token row if found and status is 'pending'; null otherwise.
 */
export async function validateToken(token: string, surveyId: string): Promise<Token | null> {
  const filename = tokenFile(surveyId);
  const rows = await readRows<Record<string, string>>(filename);
  const row = rows.find(r => r.token === token && r.surveyId === surveyId);
  if (!row || row.status !== 'pending') return null;
  return {
    token: row.token,
    surveyId: row.surveyId,
    email: row.email,
    status: 'pending',
    createdAt: row.createdAt,
    submittedAt: row.submittedAt || undefined,
  };
}

/**
 * List all invitation tokens for a survey, sorted by createdAt descending.
 * Used to render the persistent invitation history table on the invite page.
 * Returns [] if the file does not exist yet.
 */
export async function listTokens(surveyId: string): Promise<Token[]> {
  try {
    const rows = await readRows<Record<string, string>>(tokenFile(surveyId));
    return rows
      .map(r => ({
        token: r.token,
        surveyId: r.surveyId,
        email: r.email,
        status: r.status as Token['status'],
        createdAt: r.createdAt,
        submittedAt: r.submittedAt || undefined,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

/**
 * Find a token row by its token string value, scanning all surveys.
 * Does NOT filter by status — returns the row as-is (used vs pending).
 * Use validateToken() if you need to enforce pending status.
 */
export async function findTokenByValue(token: string): Promise<Token | null> {
  const surveys = await readRows<Record<string, string>>('surveys.csv');
  for (const survey of surveys) {
    const rows = await readRows<Record<string, string>>(tokenFile(survey.id));
    const row = rows.find(r => r.token === token);
    if (row) {
      return {
        token: row.token,
        surveyId: row.surveyId,
        email: row.email,
        status: row.status as Token['status'],
        createdAt: row.createdAt,
        submittedAt: row.submittedAt || undefined,
      };
    }
  }
  return null;
}

/**
 * Mark a token as used (submitted). Reads the token file, mutates the target row,
 * writes all rows back. Called AFTER appendRow succeeds (response must be persisted first).
 */
export async function markTokenUsed(token: string, surveyId: string): Promise<void> {
  const filename = tokenFile(surveyId);
  const rows = await readRows<Record<string, string>>(filename);
  const updated = rows.map(r =>
    r.token === token
      ? { ...r, status: 'submitted', submittedAt: new Date().toISOString() }
      : r
  );
  await writeRows(filename, updated);
}
