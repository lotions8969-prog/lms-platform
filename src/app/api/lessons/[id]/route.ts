import { NextRequest, NextResponse } from 'next/server';
import { getLessonById, getQuizByLessonId, getSurveyById } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLessonById(id);
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let quiz = null;
  let survey = null;
  if (lesson.type === 'quiz') {
    quiz = await getQuizByLessonId(id);
  } else if (lesson.type === 'survey' && lesson.surveyId) {
    survey = await getSurveyById(lesson.surveyId);
  }
  return NextResponse.json({ lesson, quiz, survey });
}
