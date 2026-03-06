import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getSurveyById, getSurveyResponses, saveSurveyResponse } from '@/lib/db';
import type { SurveyResponse } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await params;
  const responses = await getSurveyResponses(id);
  return NextResponse.json(responses);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }
  const { id: surveyId } = await params;
  const survey = await getSurveyById(surveyId);
  if (!survey || !survey.published) {
    return NextResponse.json({ error: 'アンケートが見つかりません' }, { status: 404 });
  }
  const { answers } = await req.json();
  const response: SurveyResponse = {
    id: uuidv4(),
    surveyId,
    userId: session.id,
    userEmail: session.email,
    userName: session.displayName,
    answers,
    createdAt: new Date().toISOString(),
  };
  await saveSurveyResponse(response);
  return NextResponse.json(response);
}
