// src/app/api/surveys/[id]/submit/route.ts
// Public route — no admin session auth. Authenticated by token in body.
import { validateToken, markTokenUsed } from '@/lib/services/token.service';
import { appendRow } from '@/lib/services/csv.service';
import { getQuestions } from '@/lib/services/survey.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: surveyId } = await params;

  let body: { token?: string; answers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }
  if (!body.answers || typeof body.answers !== 'object') {
    return Response.json({ error: 'Missing answers' }, { status: 400 });
  }

  // Validate token — returns null if used, expired, or not found
  const tokenRow = await validateToken(body.token, surveyId);
  if (!tokenRow) {
    return Response.json({ error: 'Invalid or already-used token' }, { status: 410 });
  }

  // Load question schema to ensure consistent CSV columns
  const questions = await getQuestions(surveyId);
  const allQuestionIds = questions.map(q => q.id);

  // Build response row: all question IDs → empty string default, then merge answers
  const answerColumns: Record<string, string> = {};
  for (const id of allQuestionIds) {
    answerColumns[id] = '';
  }
  for (const [id, value] of Object.entries(body.answers)) {
    answerColumns[id] = value;
  }

  const responseRow: Record<string, string> = {
    surveyId,
    token: body.token,
    email: tokenRow.email,
    submittedAt: new Date().toISOString(),
    ...answerColumns,
  };

  // Persist response FIRST — then invalidate token (ordering critical: FORM-11 before FORM-10)
  await appendRow(`responses-${surveyId}.csv`, responseRow);
  await markTokenUsed(body.token, surveyId);

  return Response.json({ success: true });
}
