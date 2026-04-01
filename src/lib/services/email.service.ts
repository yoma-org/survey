// src/lib/services/email.service.ts
import nodemailer from 'nodemailer';
import type { SmtpSettings } from '@/lib/types';

export function createTransporter(settings: SmtpSettings) {
  return nodemailer.createTransport({
    host: settings.host,
    port: Number(settings.port),
    secure: Number(settings.port) === 465,
    auth: { user: settings.username, pass: settings.password },
    connectionTimeout: 15_000,
    socketTimeout: 15_000,
  });
}

export async function testSmtpConnection(settings: SmtpSettings): Promise<void> {
  const transporter = createTransporter(settings);
  await transporter.verify();
}

export async function sendInvitation(opts: {
  to: string;
  surveyName: string;
  token: string;
  locale: string;
  fromName: string;
  fromAddress: string;
  transporter: ReturnType<typeof nodemailer.createTransport>;
}): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const surveyLink = `${baseUrl}/${opts.locale}/survey/${opts.token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f9fafb; padding: 32px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 40px;">
        <h1 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 8px;">
          You're invited to complete a survey
        </h1>
        <p style="color: #374151; font-size: 16px; margin-bottom: 4px;">
          မင်္ဂလာပါ — စစ်တမ်းတစ်ခုဖြေဆိုရန် ဖိတ်ကြားထားသည်
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #374151; font-size: 15px;">
          <strong>${opts.surveyName}</strong>
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
          Please click the button below to access your personalized survey link.
        </p>
        <a href="${surveyLink}"
           style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none;
                  padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Start Survey / စစ်တမ်းစတင်ရန်
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          Sent by ${opts.fromName}. This link is unique to you — do not share it.
        </p>
      </div>
    </body>
    </html>
  `;

  await opts.transporter.sendMail({
    from: `"${opts.fromName}" <${opts.fromAddress}>`,
    to: opts.to,
    subject: `You're invited to complete the ${opts.surveyName} survey`,
    html,
  });
}
