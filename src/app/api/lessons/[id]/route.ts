import { NextRequest, NextResponse } from 'next/server';
import { getLessonById, getQuizByLessonId } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLessonById(id);
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let quiz = null;
  if (lesson.type === 'quiz') {
    quiz = await getQuizByLessonId(id);
  }
  return NextResponse.json({ lesson, quiz });
}
