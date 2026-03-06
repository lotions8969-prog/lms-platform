import { NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import { saveUser, saveCourse, saveLesson, saveQuiz, saveSubmission } from '@/lib/db';

const STORE = process.env.BLOB_READ_WRITE_TOKEN!;

async function fetchOldJson(key: string): Promise<unknown[]> {
  try {
    const { blobs } = await list({ prefix: key, token: STORE });
    const target = blobs.find((b) => b.pathname === key);
    if (!target) return [];
    const res = await fetch(`${target.url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function POST() {
  const results: Record<string, number> = {};

  // Migrate old array-format blobs to per-record files
  const [users, courses, lessons, quizzes, submissions] = await Promise.all([
    fetchOldJson('db/users.json'),
    fetchOldJson('db/courses.json'),
    fetchOldJson('db/lessons.json'),
    fetchOldJson('db/quizzes.json'),
    fetchOldJson('db/submissions.json'),
  ]);

  for (const u of users as any[]) await saveUser(u);
  results.users = users.length;

  for (const c of courses as any[]) await saveCourse(c);
  results.courses = courses.length;

  for (const l of lessons as any[]) await saveLesson(l);
  results.lessons = lessons.length;

  for (const q of quizzes as any[]) await saveQuiz(q);
  results.quizzes = quizzes.length;

  for (const s of submissions as any[]) await saveSubmission(s);
  results.submissions = submissions.length;

  return NextResponse.json({ ok: true, migrated: results });
}
