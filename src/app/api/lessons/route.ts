import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getLessons, getLessonById, saveLesson, deleteLesson, saveQuiz } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Lesson, Quiz } from '@/lib/types';

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('courseId') || undefined;
  const lessons = await getLessons(courseId);
  return NextResponse.json(lessons);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { courseId, type, title, description, videoUrl, surveyId, order, questions, passingScore } = await req.json();
  const lessonId = uuidv4();
  const lesson: Lesson = {
    id: lessonId,
    courseId,
    type,
    title,
    description: description || undefined,
    videoUrl: type === 'video' ? videoUrl : undefined,
    surveyId: type === 'survey' ? surveyId : undefined,
    order,
    createdAt: new Date().toISOString(),
  };
  await saveLesson(lesson);
  if (type === 'quiz' && questions) {
    const quiz: Quiz = {
      id: uuidv4(),
      lessonId,
      courseId,
      questions,
      passingScore: passingScore || 70,
    };
    await saveQuiz(quiz);
  }
  return NextResponse.json(lesson);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id, order } = await req.json();
  const lesson = await getLessonById(id);
  if (!lesson) return NextResponse.json({ error: 'レッスンが見つかりません' }, { status: 404 });
  lesson.order = order;
  await saveLesson(lesson);
  return NextResponse.json(lesson);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await req.json();
  await deleteLesson(id);
  return NextResponse.json({ ok: true });
}
