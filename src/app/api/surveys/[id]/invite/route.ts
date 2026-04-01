// src/app/api/surveys/[id]/invite/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { getSurvey } from '@/lib/services/survey.service';
import { getSmtpSettings } from '@/lib/services/smtp.service';
import { createTransporter, sendInvitation } from '@/lib/services/email.service';
import { generateToken } from '@/lib/services/token.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendResult {
  email: string;
  status: 'sent' | 'failed' | 'already-invited';
  error?: string;
}

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

  const { id: surveyId } = await params;

  // Load SMTP settings
  const smtpSettings = await getSmtpSettings();
  if (!smtpSettings) {
    return Response.json({ error: 'SMTP not configured' }, { status: 400 });
  }

  // Load survey
  const survey = await getSurvey(surveyId);
  if (!survey) {
    return Response.json({ error: 'Survey not found' }, { status: 404 });
  }

  // Parse request body
  let body: { emails?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawEmails = Array.isArray(body.emails) ? (body.emails as string[]) : [];
  const locale = typeof body.locale === 'string' ? body.locale : 'en';

  // Validate and deduplicate emails
  const invalidEmails: string[] = [];
  const validEmails: string[] = [];
  const seen = new Set<string>();

  for (const email of rawEmails) {
    const trimmed = String(email).trim().toLowerCase();
    if (!trimmed) continue;
    if (!EMAIL_REGEX.test(trimmed)) {
      invalidEmails.push(trimmed);
      continue;
    }
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      validEmails.push(trimmed);
    }
  }

  if (invalidEmails.length > 0) {
    return Response.json(
      { error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
      { status: 400 }
    );
  }

  if (validEmails.length === 0) {
    return Response.json({ error: 'No valid email addresses provided' }, { status: 400 });
  }

  // Create transporter once for the whole batch
  const transporter = createTransporter(smtpSettings);

  const results: SendResult[] = [];
  let successCount = 0;
  let failCount = 0;

  // Sequential send — avoids SMTP rate limiting
  for (const email of validEmails) {
    try {
      const token = await generateToken(surveyId, email);
      await sendInvitation({
        to: email,
        surveyName: survey.name,
        token,
        locale,
        fromName: smtpSettings.fromName,
        fromAddress: smtpSettings.fromAddress,
        transporter,
      });
      results.push({ email, status: 'sent' });
      successCount++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      results.push({ email, status: 'failed', error: errorMessage });
      failCount++;
    }
  }

  return Response.json({ results, successCount, failCount });
}
