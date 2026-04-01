// src/app/api/settings/smtp/test/route.ts
// Tests SMTP by sending an actual test email to the fromAddress
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { createTransporter } from '@/lib/services/email.service';
import type { SmtpSettings } from '@/lib/types';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Accept SMTP settings from the request body (form values, not DB)
  let settings: SmtpSettings;
  try {
    settings = await request.json() as SmtpSettings;
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body' });
  }

  if (!settings.host || !settings.port || !settings.username || !settings.password || !settings.fromAddress) {
    return Response.json({ ok: false, error: 'All SMTP fields are required to test' });
  }

  try {
    const transporter = createTransporter(settings);

    // Step 1: Verify connection
    await transporter.verify();

    // Step 2: Send a real test email to the fromAddress
    await transporter.sendMail({
      from: `"${settings.fromName || 'Survey Yoma'}" <${settings.fromAddress}>`,
      to: settings.fromAddress,
      subject: 'Survey Yoma — SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2 style="color: #111827;">SMTP Configuration Test</h2>
          <p style="color: #374151;">If you're reading this, your SMTP settings are working correctly.</p>
          <p style="color: #6b7280; font-size: 13px;">Sent from Survey Yoma at ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ ok: false, error: message });
  }
}
