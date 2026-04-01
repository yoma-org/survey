// src/app/api/surveys/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { createSurvey, listSurveys } from '@/lib/services/survey.service';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const surveys = await listSurveys();
  return Response.json({ surveys });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, description } = body as { name?: string; description?: string };

  if (!name || name.trim() === '') {
    return Response.json({ error: 'Survey name is required.' }, { status: 400 });
  }

  const survey = await createSurvey({ name: name.trim(), description });
  return Response.json({ survey }, { status: 201 });
}
