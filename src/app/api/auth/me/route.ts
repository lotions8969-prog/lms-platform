import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await getUserById(session.id);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      progress: user.progress,
    },
  });
}
