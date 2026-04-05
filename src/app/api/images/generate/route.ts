import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { getGeminiApiKey } from '@/lib/services/app-settings.service';
import * as fs from 'fs/promises';
import * as path from 'path';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

async function saveToLocal(buffer: Buffer, ext: string, _contentType: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'questions');
  await fs.mkdir(uploadsDir, { recursive: true });
  const filename = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/questions/${filename}`;
}

async function saveToBlob(buffer: Buffer, ext: string, contentType: string): Promise<string> {
  const { put } = await import('@vercel/blob');
  const filename = `questions/${crypto.randomUUID()}.${ext}`;
  const blob = await put(filename, buffer, {
    access: 'public',
    contentType,
  });
  return blob.url;
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    return Response.json({ error: 'Gemini API key not configured. Add it in Settings.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const { prompt } = body as { prompt?: string };

  if (!prompt?.trim()) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const GEMINI_IMAGE_MODEL = 'gemini-3.1-flash-image-preview';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a clean, professional illustration for a workplace survey question. The image should be simple, friendly, and culturally neutral. No text in the image. Description: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
              aspectRatio: '4:3',
              imageSize: '1K',
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Gemini image generation error:', err);
      return Response.json({ error: 'Image generation failed' }, { status: 502 });
    }

    const data = await res.json();

    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart?.inlineData) {
      return Response.json({ error: 'No image generated. Try a different prompt.' }, { status: 502 });
    }

    const { mimeType, data: base64Data } = imagePart.inlineData;
    const ext = mimeType === 'image/png' ? 'png' : 'webp';
    const buffer = Buffer.from(base64Data, 'base64');

    const url = process.env.BLOB_READ_WRITE_TOKEN
      ? await saveToBlob(buffer, ext, mimeType)
      : await saveToLocal(buffer, ext, mimeType);

    return Response.json({ url });
  } catch (err) {
    console.error('Image generation error:', err);
    return Response.json({ error: 'Image generation failed' }, { status: 500 });
  }
}
