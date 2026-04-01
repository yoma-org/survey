// src/app/api/surveys/[id]/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { getSurvey, getQuestions } from '@/lib/services/survey.service';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const survey = await getSurvey(id);

  if (!survey) {
    return Response.json({ error: 'Survey not found' }, { status: 404 });
  }

  const questions = await getQuestions(id);
  return Response.json({ survey, questions });
}
