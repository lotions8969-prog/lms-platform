import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSurveyById, saveSurvey, deleteSurvey } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getSurveyById(id);
  if (!survey) return NextResponse.json({ error: 'アンケートが見つかりません' }, { status: 404 });
  const session = await getSession();
  if (!survey.published && session?.role !== 'admin') {
    return NextResponse.json({ error: '公開されていません' }, { status: 403 });
  }
  return NextResponse.json(survey);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await params;
  const survey = await getSurveyById(id);
  if (!survey) return NextResponse.json({ error: 'アンケートが見つかりません' }, { status: 404 });
  const body = await req.json();
  const updated = { ...survey, ...body, id: survey.id, updatedAt: new Date().toISOString() };
  await saveSurvey(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await params;
  await deleteSurvey(id);
  return NextResponse.json({ ok: true });
}
