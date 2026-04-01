// src/lib/services/token.service.ts
import { randomBytes } from 'crypto';
import { readRows, appendRow } from './csv.service';
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
