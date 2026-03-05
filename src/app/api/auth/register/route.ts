import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, saveUser } from '@/lib/db';
import { createSession, COOKIE_NAME } from '@/lib/auth';
import type { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { email, password, role = 'student' } = await req.json();
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
    progress: {},
    createdAt: new Date().toISOString(),
  };
  await saveUser(user);
  const session = { id: user.id, email: user.email, role: user.role };
  const token = await createSession(session);
  const res = NextResponse.json({ user: session });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
