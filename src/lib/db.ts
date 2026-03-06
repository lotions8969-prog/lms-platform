import { put, list } from '@vercel/blob';
import type { User, Course, Lesson, Quiz, Submission } from './types';

const STORE = process.env.BLOB_READ_WRITE_TOKEN!;

async function readJson<T>(key: string): Promise<T[]> {
  try {
    const { blobs } = await list({ prefix: key, token: STORE });
    if (blobs.length === 0) return [];
    // Sort by uploadedAt descending to get the latest
    blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    const blob = blobs[0];
    // Bypass CDN cache with no-store and cache-busting timestamp
    const res = await fetch(`${blob.url}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function writeJson<T>(key: string, data: T[]): Promise<void> {
  await put(key, JSON.stringify(data), {
    access: 'public',
    token: STORE,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

// Users
export async function getUsers(): Promise<User[]> {
  return readJson<User>('db/users.json');
}
export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email === email) ?? null;
}
export async function saveUser(user: User): Promise<void> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  await writeJson('db/users.json', users);
}
export async function updateUserProgress(userId: string, courseId: string, lessonId: string): Promise<void> {
  const users = await getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return;
  if (!user.progress[courseId]) user.progress[courseId] = { completedLessons: [], quizScores: {}, completed: false };
  if (!user.progress[courseId].completedLessons.includes(lessonId)) {
    user.progress[courseId].completedLessons.push(lessonId);
  }
  await writeJson('db/users.json', users);
}

// Courses
export async function getCourses(): Promise<Course[]> {
  return readJson<Course>('db/courses.json');
}
export async function getCourseById(id: string): Promise<Course | null> {
  const courses = await getCourses();
  return courses.find((c) => c.id === id) ?? null;
}
export async function saveCourse(course: Course): Promise<void> {
  const courses = await getCourses();
  const idx = courses.findIndex((c) => c.id === course.id);
  if (idx >= 0) courses[idx] = course;
  else courses.push(course);
  await writeJson('db/courses.json', courses);
}
export async function deleteCourse(id: string): Promise<void> {
  const courses = await getCourses();
  await writeJson('db/courses.json', courses.filter((c) => c.id !== id));
}

// Lessons
export async function getLessons(courseId?: string): Promise<Lesson[]> {
  const lessons = await readJson<Lesson>('db/lessons.json');
  if (!courseId) return lessons;
  return lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
}
export async function getLessonById(id: string): Promise<Lesson | null> {
  const lessons = await readJson<Lesson>('db/lessons.json');
  return lessons.find((l) => l.id === id) ?? null;
}
export async function saveLesson(lesson: Lesson): Promise<void> {
  const lessons = await readJson<Lesson>('db/lessons.json');
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  if (idx >= 0) lessons[idx] = lesson;
  else lessons.push(lesson);
  await writeJson('db/lessons.json', lessons);
}
export async function deleteLesson(id: string): Promise<void> {
  const lessons = await readJson<Lesson>('db/lessons.json');
  await writeJson('db/lessons.json', lessons.filter((l) => l.id !== id));
}

// Quizzes
export async function getQuizByLessonId(lessonId: string): Promise<Quiz | null> {
  const quizzes = await readJson<Quiz>('db/quizzes.json');
  return quizzes.find((q) => q.lessonId === lessonId) ?? null;
}
export async function saveQuiz(quiz: Quiz): Promise<void> {
  const quizzes = await readJson<Quiz>('db/quizzes.json');
  const idx = quizzes.findIndex((q) => q.id === quiz.id);
  if (idx >= 0) quizzes[idx] = quiz;
  else quizzes.push(quiz);
  await writeJson('db/quizzes.json', quizzes);
}

// Submissions
export async function getSubmissions(): Promise<Submission[]> {
  const subs = await readJson<Submission>('db/submissions.json');
  return subs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export async function saveSubmission(sub: Submission): Promise<void> {
  const subs = await readJson<Submission>('db/submissions.json');
  const idx = subs.findIndex((s) => s.id === sub.id);
  if (idx >= 0) subs[idx] = sub;
  else subs.push(sub);
  await writeJson('db/submissions.json', subs);
}
