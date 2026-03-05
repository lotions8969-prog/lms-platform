import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSubmissions, saveSubmission } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Submission } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const submissions = await getSubmissions();
  return NextResponse.json(submissions);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '未ログイン' }, { status: 401 });
  const { lessonId, courseId, videoUrl } = await req.json();
  const sub: Submission = {
    id: uuidv4(),
    userId: session.id,
    lessonId,
    courseId,
    videoUrl,
    feedback: '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await saveSubmission(sub);
  return NextResponse.json(sub);
}
