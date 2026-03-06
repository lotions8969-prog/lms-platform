import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { getUserById, saveUser, deleteUser } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });

  const body = await req.json();
  if (body.displayName !== undefined) user.displayName = body.displayName;
  if (body.email !== undefined) user.email = body.email;
  if (body.role !== undefined) user.role = body.role === 'admin' ? 'admin' : 'student';
  if (body.password) {
    user.passwordHash = await bcrypt.hash(body.password, 10);
  }
  if (body.progress !== undefined) user.progress = body.progress;

  await saveUser(user);
  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await params;
  // Prevent deleting self
  if (id === session.id) {
    return NextResponse.json({ error: '自分自身は削除できません' }, { status: 400 });
  }
  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
