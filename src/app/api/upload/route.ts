import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '未ログイン' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'webm';
  const blob = await put(`videos/${session.id}/${uuidv4()}.${ext}`, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });

  return NextResponse.json({ url: blob.url });
}
