import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions, saveSubmission } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await params;
  const { status, feedback } = await req.json();
  const submissions = await getSubmissions();
  const sub = submissions.find((s) => s.id === id);
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  sub.status = status;
  sub.feedback = feedback || '';
  await saveSubmission(sub);
  return NextResponse.json(sub);
}
