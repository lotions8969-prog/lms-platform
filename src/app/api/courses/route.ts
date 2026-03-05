import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCourses, saveCourse, deleteCourse } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Course } from '@/lib/types';

export async function GET() {
  const courses = await getCourses();
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { title, description, thumbnail } = await req.json();
  const course: Course = {
    id: uuidv4(),
    title,
    description,
    thumbnail: thumbnail || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveCourse(course);
  return NextResponse.json(course);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id } = await req.json();
  await deleteCourse(id);
  return NextResponse.json({ ok: true });
}
