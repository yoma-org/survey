import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { isAdmin } from '@/lib/auth';
import { getAppSettings, saveAppSettings } from '@/lib/services/app-settings.service';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function GET() {
  if (!(await isAuthenticated()) || !(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAppSettings();

  return Response.json({
    settings: settings
      ? { geminiApiKey: settings.geminiApiKey ? '••••••••' : '' }
      : null,
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated()) || !(await isAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { geminiApiKey } = body as { geminiApiKey?: string };

  // If masked value sent, preserve existing key
  if (geminiApiKey === '••••••••') {
    return Response.json({ ok: true });
  }

  await saveAppSettings({
    geminiApiKey: geminiApiKey?.trim() || null,
  });

  return Response.json({ ok: true });
}
