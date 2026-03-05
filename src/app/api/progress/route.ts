import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateUserProgress, getUserById } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: '未ログイン' }, { status: 401 });
  const { courseId, lessonId } = await req.json();
  await updateUserProgress(session.id, courseId, lessonId);
  const user = await getUserById(session.id);
  return NextResponse.json({ progress: user?.progress || {} });
}
