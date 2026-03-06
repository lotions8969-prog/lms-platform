import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUsers, getCourses, getLessons } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  const [users, courses, allLessons] = await Promise.all([
    getUsers(),
    getCourses(),
    getLessons(),
  ]);

  const students = users.filter((u) => u.role === 'student');

  // Per-course stats
  const courseStats = courses.map((course) => {
    const courseLessons = allLessons.filter((l) => l.courseId === course.id);
    const totalLessons = courseLessons.length;

    const enrolledUsers = students.filter((u) => u.progress[course.id]);
    const completedUsers = students.filter((u) => u.progress[course.id]?.completed);

    const avgProgress = enrolledUsers.length > 0
      ? Math.round(enrolledUsers.reduce((sum, u) => {
          const done = u.progress[course.id]?.completedLessons?.length || 0;
          return sum + (totalLessons > 0 ? done / totalLessons : 0);
        }, 0) / enrolledUsers.length * 100)
      : 0;

    return {
      courseId: course.id,
      title: course.title,
      published: course.published,
      totalLessons,
      enrolled: enrolledUsers.length,
      completed: completedUsers.length,
      completionRate: enrolledUsers.length > 0
        ? Math.round((completedUsers.length / enrolledUsers.length) * 100)
        : 0,
      avgProgress,
    };
  });

  // Per-user stats (students only)
  const userStats = students.map((user) => {
    const enrolledCourses = Object.keys(user.progress).length;
    const completedCourses = Object.values(user.progress).filter((p) => p.completed).length;
    const totalLessonsDone = Object.values(user.progress).reduce(
      (sum, p) => sum + (p.completedLessons?.length || 0), 0
    );
    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      enrolledCourses,
      completedCourses,
      totalLessonsDone,
    };
  }).sort((a, b) => b.totalLessonsDone - a.totalLessonsDone);

  // Summary
  const totalStudents = students.length;
  const activeStudents = students.filter((u) => Object.values(u.progress).some((p) => p.completedLessons?.length > 0)).length;
  const totalCompletions = students.reduce((sum, u) =>
    sum + Object.values(u.progress).filter((p) => p.completed).length, 0
  );

  return NextResponse.json({ courseStats, userStats, totalStudents, activeStudents, totalCompletions });
}
