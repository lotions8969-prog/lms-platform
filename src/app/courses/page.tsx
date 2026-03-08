'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Play, ChevronRight } from 'lucide-react';

function CourseCard({ course, done, total, inProgress, completed }: {
  course: Course;
  done: number;
  total: number;
  inProgress: boolean;
  completed: boolean;
}) {
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden bg-gray-100 flex-shrink-0" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-white/60" />
              </div>
            )}
          </div>

          {/* Status badge */}
          {completed ? (
            <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 z-10">
              <CheckCircle2 className="w-2.5 h-2.5" />完了
            </span>
          ) : inProgress ? (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm z-10">
              受講中
            </span>
          ) : null}

          {/* Progress bar */}
          {(inProgress || completed) && total > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-10">
              <div
                className={`h-full transition-all ${completed ? 'bg-emerald-400' : 'bg-blue-400'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 text-indigo-600 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors flex-1">
            {course.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-400">{total} セッション</p>
            {inProgress && total > 0 && (
              <p className="text-xs text-blue-500 font-medium">{progress}%</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Section({ title, count, children, showAll }: {
  title: string;
  count: number;
  children: React.ReactNode;
  showAll?: boolean;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {showAll && (
          <button className="text-sm text-indigo-500 font-medium flex items-center gap-0.5 hover:text-indigo-700 transition-colors whitespace-nowrap">
            全てを見る ({count})<ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/courses').then((r) => r.json()).then(async (data: Course[]) => {
      setCourses(data);
      const counts = await Promise.all(
        data.map((c) =>
          fetch(`/api/lessons?courseId=${c.id}`)
            .then((r) => r.json())
            .then((ls) => [c.id, ls.length] as [string, number])
        )
      );
      setLessonCounts(Object.fromEntries(counts));
      setLoading(false);
    });
  }, []);

  const doneLessons = (id: string) => user?.progress?.[id]?.completedLessons?.length || 0;
  const isCompleted = (id: string) => user?.progress?.[id]?.completed || false;
  const isInProgress = (id: string) => doneLessons(id) > 0 && !isCompleted(id);

  const inProgressCourses = courses.filter((c) => isInProgress(c.id));
  const notStartedCourses = courses.filter((c) => doneLessons(c.id) === 0);
  const completedCourses = courses.filter((c) => isCompleted(c.id));

  const Grid = ({ items }: { items: Course[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((c) => (
        <CourseCard
          key={c.id}
          course={c}
          done={doneLessons(c.id)}
          total={lessonCounts[c.id] || 0}
          inProgress={isInProgress(c.id)}
          completed={isCompleted(c.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                <div className="w-full bg-gray-100" style={{ paddingTop: '56.25%' }} />
                <div className="p-3.5 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-full" />
                  <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold">コースがまだありません</p>
            <p className="text-gray-400 text-sm mt-1">管理者がコースを追加するとここに表示されます</p>
          </div>
        ) : (
          <>
            {inProgressCourses.length > 0 && (
              <Section title="受講中のコース" count={inProgressCourses.length} showAll={inProgressCourses.length > 4}>
                <Grid items={inProgressCourses} />
              </Section>
            )}
            {notStartedCourses.length > 0 && (
              <Section title="コース一覧" count={notStartedCourses.length} showAll={notStartedCourses.length > 4}>
                <Grid items={notStartedCourses} />
              </Section>
            )}
            {completedCourses.length > 0 && (
              <Section title="完了済み" count={completedCourses.length} showAll={completedCourses.length > 4}>
                <Grid items={completedCourses} />
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
