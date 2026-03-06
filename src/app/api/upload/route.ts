import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '未ログイン' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = (formData.get('type') as string) || 'submission'; // 'lesson' | 'submission'
  const originalName = formData.get('name') as string || file?.name || 'video';

  if (!file) return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });

  // Admin-only for lesson videos
  if (type === 'lesson' && session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const ext = file.name.split('.').pop() || 'mp4';
  const prefix = type === 'lesson' ? 'lesson-videos' : `videos/${session.id}`;
  const safeName = originalName.replace(/[^a-zA-Z0-9._\-\u3040-\u9FFF]/g, '_');
  const filename = type === 'lesson'
    ? `${safeName.replace(/\.[^.]+$/, '')}_${uuidv4().slice(0, 8)}.${ext}`
    : `${uuidv4()}.${ext}`;

  const blob = await put(`${prefix}/${filename}`, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });

  return NextResponse.json({ url: blob.url, filename });
}
