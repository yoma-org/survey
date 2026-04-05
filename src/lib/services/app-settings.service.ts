import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export interface AppSettings {
  geminiApiKey: string | null;
}

export async function getAppSettings(): Promise<AppSettings | null> {
  const [row] = await db.select().from(schema.appSettings).where(eq(schema.appSettings.id, 1));
  if (!row) return null;
  return { geminiApiKey: row.geminiApiKey };
}

export async function getGeminiApiKey(): Promise<string | null> {
  const settings = await getAppSettings();
  return settings?.geminiApiKey || process.env.GEMINI_API_KEY || null;
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<void> {
  const existing = await getAppSettings();
  if (existing) {
    await db.update(schema.appSettings).set({
      geminiApiKey: settings.geminiApiKey ?? existing.geminiApiKey,
    }).where(eq(schema.appSettings.id, 1));
  } else {
    await db.insert(schema.appSettings).values({
      id: 1,
      geminiApiKey: settings.geminiApiKey ?? null,
    });
  }
}
