import { put, del, list } from '@vercel/blob';
import type { User, Course, Lesson, Quiz, Submission, Survey, SurveyResponse } from './types';

const STORE = process.env.BLOB_READ_WRITE_TOKEN!;

// Read a single JSON blob by its URL (cache-busted)
async function fetchBlob<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// List all records in a "collection" folder and fetch each one
async function listAll<T>(prefix: string): Promise<T[]> {
  try {
    const { blobs } = await list({ prefix, token: STORE });
    const results = await Promise.all(blobs.map((b) => fetchBlob<T>(b.url)));
    return results.filter((r) => r !== null) as T[];
  } catch {
    return [];
  }
}

// Write a single record
async function writeRecord(path: string, data: unknown): Promise<void> {
  await put(path, JSON.stringify(data), {
    access: 'public',
    token: STORE,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

// Delete a record
async function deleteRecord(path: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix: path, token: STORE });
    const target = blobs.find((b) => b.pathname === path);
    if (target) await del(target.url, { token: STORE });
  } catch {}
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  return listAll<User>('db/users/');
}
export async function getUserById(id: string): Promise<User | null> {
  const { blobs } = await list({ prefix: `db/users/${id}.json`, token: STORE });
  if (blobs.length === 0) return null;
  return fetchBlob<User>(blobs[0].url);
}
export async function getUserByEmail(email: string): Promise<User | null> {
  // Fast path: direct lookup via email index (avoids scanning all users)
  const emailKey = `db/users-email/${encodeURIComponent(email.toLowerCase())}.json`;
  const { blobs: eb } = await list({ prefix: emailKey, token: STORE });
  if (eb.length > 0) {
    return fetchBlob<User>(eb[0].url);
  }
  // Fallback: full scan (for existing users without email index)
  const users = await getUsers();
  const user = users.find((u) => u.email === email) ?? null;
  if (user) {
    // Create email index for next time (non-blocking)
    writeRecord(emailKey, user).catch(() => {});
  }
  return user;
}
export async function saveUser(user: User): Promise<void> {
  const emailKey = `db/users-email/${encodeURIComponent(user.email.toLowerCase())}.json`;
  await Promise.all([
    writeRecord(`db/users/${user.id}.json`, user),
    writeRecord(emailKey, user),
  ]);
}
export async function deleteUser(id: string): Promise<void> {
  await deleteRecord(`db/users/${id}.json`);
}
export async function updateUserProgress(userId: string, courseId: string, lessonId: string): Promise<void> {
  const [user, courseLessons] = await Promise.all([
    getUserById(userId),
    getLessons(courseId),
  ]);
  if (!user) return;
  if (!user.progress[courseId]) user.progress[courseId] = { completedLessons: [], quizScores: {}, completed: false };
  if (!user.progress[courseId].completedLessons.includes(lessonId)) {
    user.progress[courseId].completedLessons.push(lessonId);
  }
  // Auto-complete course when all lessons are done
  if (courseLessons.length > 0 && user.progress[courseId].completedLessons.length >= courseLessons.length) {
    user.progress[courseId].completed = true;
  }
  await writeRecord(`db/users/${userId}.json`, user);
}

// ── Courses ────────────────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  return listAll<Course>('db/courses/');
}
export async function getCourseById(id: string): Promise<Course | null> {
  const { blobs } = await list({ prefix: `db/courses/${id}.json`, token: STORE });
  if (blobs.length === 0) return null;
  return fetchBlob<Course>(blobs[0].url);
}
export async function saveCourse(course: Course): Promise<void> {
  await writeRecord(`db/courses/${course.id}.json`, course);
}
export async function deleteCourse(id: string): Promise<void> {
  await deleteRecord(`db/courses/${id}.json`);
}

// ── Lessons ────────────────────────────────────────────────────────────────

export async function getLessons(courseId?: string): Promise<Lesson[]> {
  const lessons = await listAll<Lesson>('db/lessons/');
  if (!courseId) return lessons;
  return lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
}
export async function getLessonById(id: string): Promise<Lesson | null> {
  const { blobs } = await list({ prefix: `db/lessons/${id}.json`, token: STORE });
  if (blobs.length === 0) return null;
  return fetchBlob<Lesson>(blobs[0].url);
}
export async function saveLesson(lesson: Lesson): Promise<void> {
  await writeRecord(`db/lessons/${lesson.id}.json`, lesson);
}
export async function deleteLesson(id: string): Promise<void> {
  await deleteRecord(`db/lessons/${id}.json`);
}

// ── Quizzes ────────────────────────────────────────────────────────────────

export async function getQuizByLessonId(lessonId: string): Promise<Quiz | null> {
  const { blobs } = await list({ prefix: `db/quizzes/${lessonId}.json`, token: STORE });
  if (blobs.length === 0) return null;
  return fetchBlob<Quiz>(blobs[0].url);
}
export async function saveQuiz(quiz: Quiz): Promise<void> {
  await writeRecord(`db/quizzes/${quiz.lessonId}.json`, quiz);
}

// ── Submissions ────────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<Submission[]> {
  const subs = await listAll<Submission>('db/submissions/');
  return subs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export async function saveSubmission(sub: Submission): Promise<void> {
  await writeRecord(`db/submissions/${sub.id}.json`, sub);
}

// ── Surveys ────────────────────────────────────────────────────────────────

export async function getSurveys(): Promise<Survey[]> {
  return listAll<Survey>('db/surveys/');
}
export async function getSurveyById(id: string): Promise<Survey | null> {
  const { blobs } = await list({ prefix: `db/surveys/${id}.json`, token: STORE });
  if (blobs.length === 0) return null;
  return fetchBlob<Survey>(blobs[0].url);
}
export async function saveSurvey(survey: Survey): Promise<void> {
  await writeRecord(`db/surveys/${survey.id}.json`, survey);
}
export async function deleteSurvey(id: string): Promise<void> {
  await deleteRecord(`db/surveys/${id}.json`);
}

// ── Survey Responses ────────────────────────────────────────────────────────

export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const responses = await listAll<SurveyResponse>(`db/survey-responses/${surveyId}/`);
  return responses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export async function saveSurveyResponse(response: SurveyResponse): Promise<void> {
  await writeRecord(`db/survey-responses/${response.surveyId}/${response.id}.json`, response);
}
