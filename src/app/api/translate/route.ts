import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { getGeminiApiKey } from '@/lib/services/app-settings.service';

const GEMINI_MODEL = 'gemini-2.5-flash';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const GEMINI_API_KEY = await getGeminiApiKey();
  if (!GEMINI_API_KEY) {
    return Response.json({ error: 'Translation not configured. Add your Gemini API key in Settings.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const { text, sourceLanguage = 'en', targetLanguage = 'my' } = body as {
    text?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
  };

  if (!text?.trim()) {
    return Response.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translated text, nothing else.\n\n${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Gemini API error:', err);
      return Response.json({ error: 'Translation failed' }, { status: 502 });
    }

    const data = await res.json();
    const translatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    if (!translatedText) {
      return Response.json({ error: 'Empty translation' }, { status: 502 });
    }

    return Response.json({ translatedText });
  } catch (err) {
    console.error('Translation error:', err);
    return Response.json({ error: 'Translation failed' }, { status: 500 });
  }
}
