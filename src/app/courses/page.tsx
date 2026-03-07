'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/courses').then((r) => r.json()).then(async (data: Course[]) => {
      setCourses(data);
      const counts = await Promise.all(
        data.map((c) => fetch(`/api/lessons?courseId=${c.id}`).then((r) => r.json()).then((ls) => [c.id, ls.length] as [string, number]))
      );
      setLessonCounts(Object.fromEntries(counts));
      setLoading(false);
    });
  }, []);

  const completedLessons = (id: string) => user?.progress?.[id]?.completedLessons?.length || 0;
  const isCompleted = (id: string) => user?.progress?.[id]?.completed || false;
  const pct = (id: string) => {
    const t = lessonCounts[id] || 0;
    return t === 0 ? 0 : Math.round((completedLessons(id) / t) * 100);
  };
  const inProgress = (id: string) => completedLessons(id) > 0 && !isCompleted(id);

  const inProgressCourses = courses.filter((c) => inProgress(c.id));
  const notStartedCourses = courses.filter((c) => completedLessons(c.id) === 0);
  const completedCourses = courses.filter((c) => isCompleted(c.id));

  const CourseCard = ({ course }: { course: Course }) => {
    const done = completedLessons(course.id);
    const total = lessonCounts[course.id] || 0;
    const progress = pct(course.id);
    const completed = isCompleted(course.id);
    const started = done > 0;

    return (
      <Link href={`/courses/${course.id}`} className="group block">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative overflow-hidden">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="h-40 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-violet-300" />
              </div>
            )}
            {started && !completed && (
              <div className="absolute top-2.5 left-2.5 bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">受講中</div>
            )}
            {completed && (
              <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />完了
              </div>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug text-sm group-hover:text-violet-700 transition-colors">{course.title}</h3>
            {course.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed flex-1">{course.description}</p>}

            <div className="mt-3">
              {total > 0 && (
                <div className="mb-2">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${completed ? 'bg-emerald-500' : 'bg-violet-500'}`}
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400">{total} セッション</p>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const SectionGrid = ({ title, subtitle, courses: items }: { title: string; subtitle?: string; courses: Course[] }) => (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-violet-600 font-medium">全てを見る ({items.length})</span>
      </div>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">公開中のコースがありません</p>
          </div>
        ) : (
          <>
            {inProgressCourses.length > 0 && (
              <SectionGrid title="受講中" subtitle={`${inProgressCourses.length} コース`} courses={inProgressCourses} />
            )}
            {notStartedCourses.length > 0 && (
              <SectionGrid title="コース一覧" subtitle={`${notStartedCourses.length} コース`} courses={notStartedCourses} />
            )}
            {completedCourses.length > 0 && (
              <SectionGrid title="完了済み" subtitle={`${completedCourses.length} コース`} courses={completedCourses} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
