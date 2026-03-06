import { NextRequest, NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';
import { getSession } from '@/lib/auth';

const STORE = process.env.BLOB_READ_WRITE_TOKEN!;

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  // List all uploaded lesson videos (not submission recordings)
  const { blobs } = await list({ prefix: 'lesson-videos/', token: STORE });
  const videos = blobs.map((b) => ({
    url: b.url,
    pathname: b.pathname,
    filename: b.pathname.split('/').pop() || b.pathname,
    size: b.size,
    uploadedAt: b.uploadedAt,
  }));
  return NextResponse.json(videos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { url } = await req.json();
  await del(url, { token: STORE });
  return NextResponse.json({ ok: true });
}
