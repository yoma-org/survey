// src/app/api/settings/smtp/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { getSmtpSettings, saveSmtpSettings } from '@/lib/services/smtp.service';
import type { SmtpSettings } from '@/lib/types';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getSmtpSettings();

  if (!settings) {
    return Response.json({ settings: null });
  }

  // Return settings with password OMITTED (password is write-only on client)
  return Response.json({
    settings: {
      host: settings.host,
      port: settings.port,
      username: settings.username,
      password: '',
      fromAddress: settings.fromAddress,
      fromName: settings.fromName,
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as Partial<SmtpSettings>;
  const { host, port, username, password, fromAddress, fromName } = body;

  // Validate all required fields are present (except password — see below)
  if (!host || !port || !username || !fromAddress || !fromName) {
    return Response.json(
      { error: 'Missing required fields: host, port, username, fromAddress, fromName' },
      { status: 400 }
    );
  }

  // If password is empty string in PUT body, preserve the existing password from CSV
  let finalPassword = password ?? '';
  if (!finalPassword) {
    const existing = await getSmtpSettings();
    finalPassword = existing?.password ?? '';
  }

  if (!finalPassword) {
    return Response.json(
      { error: 'Password is required for new SMTP configuration' },
      { status: 400 }
    );
  }

  await saveSmtpSettings({
    host,
    port,
    username,
    password: finalPassword,
    fromAddress,
    fromName,
  });

  return Response.json({ ok: true });
}
