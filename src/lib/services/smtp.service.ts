// src/lib/services/smtp.service.ts
import { readRows, writeRows } from './csv.service';
import type { SmtpSettings } from '@/lib/types';

const SMTP_FILE = 'smtp-settings.csv';

export async function getSmtpSettings(): Promise<SmtpSettings | null> {
  const rows = await readRows<SmtpSettings>(SMTP_FILE);
  return rows[0] ?? null;
}

export async function saveSmtpSettings(settings: SmtpSettings): Promise<void> {
  await writeRows(SMTP_FILE, [settings as unknown as Record<string, string>]);
}
