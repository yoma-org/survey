// src/app/api/surveys/[id]/questions/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { parseExcelBuffer } from '@/lib/services/excel.service';
import { saveQuestions } from '@/lib/services/survey.service';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const questions = await parseExcelBuffer(buffer);
  await saveQuestions(id, questions);

  return Response.json({ questions, count: questions.length });
}
