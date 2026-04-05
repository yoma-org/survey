import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
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

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'File must be an image' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'Image must be under 5MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'png';
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = process.env.BLOB_READ_WRITE_TOKEN
      ? await saveToBlob(buffer, ext, file.type)
      : await saveToLocal(buffer, ext, file.type);
    return Response.json({ url });
  } catch (err) {
    console.error('Image upload error:', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
