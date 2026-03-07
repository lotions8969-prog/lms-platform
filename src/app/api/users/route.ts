import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { getUsers, getUserByEmail, saveUser } from '@/lib/db';
import type { User } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const users = await getUsers();
  const safe = users.map(({ passwordHash: _, ...u }) => u);
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { email, password, role = 'student', displayName } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 });
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: uuidv4(),
    email,
    passwordHash,
    role: role === 'admin' ? 'admin' : 'student',
    displayName: displayName || undefined,
    progress: {},
    createdAt: new Date().toISOString(),
  };
  await saveUser(user);
  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}
