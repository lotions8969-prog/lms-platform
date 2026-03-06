import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getSurveys, saveSurvey } from '@/lib/db';
import type { Survey } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  const surveys = await getSurveys();
  if (session?.role === 'admin') return NextResponse.json(surveys);
  return NextResponse.json(surveys.filter((s) => s.published));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { title, description, questions, published = false } = await req.json();
  const survey: Survey = {
    id: uuidv4(),
    title,
    description,
    questions: questions || [],
    published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveSurvey(survey);
  return NextResponse.json(survey);
}
