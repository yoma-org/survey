// src/app/api/surveys/[id]/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { getSurvey } from '@/lib/services/survey.service';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

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
  if (!survey) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ survey });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, description, status } = body as {
    name?: string;
    description?: string;
    status?: 'draft' | 'active' | 'closed';
  };

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim() || null;
  if (status !== undefined) {
    if (!['draft', 'active', 'closed'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  const [updated] = await db.update(schema.surveys)
    .set(updates)
    .where(eq(schema.surveys.id, id))
    .returning();

  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json({
    survey: {
      id: updated.id,
      name: updated.name,
      description: updated.description ?? undefined,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(schema.surveys).where(eq(schema.surveys.id, id));
  return Response.json({ success: true });
}
