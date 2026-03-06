import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCourses, saveCourse, deleteCourse } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Course } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  const courses = await getCourses();
  // Admins see all courses; students/guests see only published
  if (session?.role === 'admin') return NextResponse.json(courses);
  return NextResponse.json(courses.filter((c) => c.published !== false));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { title, description, thumbnail, published = false } = await req.json();
  const course: Course = {
    id: uuidv4(),
    title,
    description,
    thumbnail: thumbnail || undefined,
    published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveCourse(course);
  return NextResponse.json(course);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }
  const { id, published } = await req.json();
  const courses = await getCourses();
  const course = courses.find((c) => c.id === id);
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  course.published = published;
  course.updatedAt = new Date().toISOString();
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
