// src/app/api/settings/smtp/test/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { getSmtpSettings } from '@/lib/services/smtp.service';
import { testSmtpConnection } from '@/lib/services/email.service';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function POST() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getSmtpSettings();
  if (!settings) {
    return Response.json({ ok: false, error: 'SMTP not configured' });
  }

  try {
    await testSmtpConnection(settings);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Return 200 with ok:false so the client handles it via the ok flag, not HTTP status
    return Response.json({ ok: false, error: message });
  }
}
