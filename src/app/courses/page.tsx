'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, Play, TrendingUp, Award, Clock, ChevronRight } from 'lucide-react';

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

  const totalLessonsDone = Object.values(user?.progress || {}).reduce((a, p) => a + (p.completedLessons?.length || 0), 0);
  const enrolledCount = courses.length;
  const completedCount = completedCourses.length;
  const inProgressCount = inProgressCourses.length;

  // Most recent in-progress course (for "continue learning" hero)
  const continueLearn = inProgressCourses[0] ?? null;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'おはようございます' : greetingHour < 18 ? 'こんにちは' : 'こんばんは';
  const displayName = user?.displayName || user?.email?.split('@')[0] || '';
  const todayStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

  const stats = [
    { label: '受講中コース', value: inProgressCount, icon: Clock, color: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' },
    { label: '登録コース', value: enrolledCount, icon: BookOpen, color: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500' },
    { label: '完了コース', value: completedCount, icon: Award, color: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
    { label: '完了レッスン', value: totalLessonsDone, icon: TrendingUp, color: 'bg-orange-50 text-orange-600', bar: 'bg-orange-500' },
  ];

  const CourseCard = ({ course }: { course: Course }) => {
    const done = completedLessons(course.id);
    const total = lessonCounts[course.id] || 0;
    const progress = pct(course.id);
    const completed = isCompleted(course.id);
    const started = done > 0;

    return (
      <Link href={`/courses/${course.id}`} className="group block h-full">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
          <div className="relative overflow-hidden">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="h-44 bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white/60" />
              </div>
            )}
            {started && !completed && (
              <span className="absolute top-3 left-3 bg-blue-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">受講中</span>
            )}
            {completed && (
              <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />完了
              </span>
            )}
            {!started && !completed && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
                  <Play className="w-5 h-5 text-violet-600 ml-0.5" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug text-sm group-hover:text-violet-700 transition-colors">{course.title}</h3>
            {course.description && <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed flex-1">{course.description}</p>}

            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{done}/{total} レッスン</span>
                <span className={`text-xs font-bold ${completed ? 'text-emerald-600' : started ? 'text-violet-600' : 'text-gray-400'}`}>{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${completed ? 'bg-emerald-500' : 'bg-violet-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-40 bg-white rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Welcome banner */}
        <div className="relative bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 rounded-2xl p-7 overflow-hidden text-white shadow-lg shadow-violet-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-24 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative">
            <p className="text-violet-200 text-sm mb-1">{todayStr}</p>
            <h1 className="text-2xl font-bold">{greeting}{displayName ? `、${displayName}` : ''}👋</h1>
            <p className="text-violet-200 text-sm mt-1.5">今日も学習を続けましょう。あなたの努力が未来を作ります。</p>
            {continueLearn && (
              <Link href={`/courses/${continueLearn.id}`}
                className="inline-flex items-center gap-2 mt-4 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors shadow-sm">
                <Play className="w-4 h-4" />続きから学習する
              </Link>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* In-progress courses */}
        {inProgressCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">受講中のコース</h2>
                <p className="text-sm text-gray-400 mt-0.5">{inProgressCourses.length}件のコースを受講中</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inProgressCourses.map((course) => {
                const done = completedLessons(course.id);
                const total = lessonCounts[course.id] || 0;
                const progress = pct(course.id);
                return (
                  <Link key={course.id} href={`/courses/${course.id}`} className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex gap-4 p-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        {course.thumbnail
                          ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center"><BookOpen className="w-8 h-8 text-white/70" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-violet-700 transition-colors">{course.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{done}/{total} レッスン完了</p>
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-[11px] text-gray-400">進捗</span>
                            <span className="text-[11px] font-bold text-violet-600">{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All courses */}
        {notStartedCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">コース一覧</h2>
                <p className="text-sm text-gray-400 mt-0.5">{notStartedCourses.length}件のコース</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {notStartedCourses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          </div>
        )}

        {/* Completed courses */}
        {completedCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">完了済みコース</h2>
                <p className="text-sm text-gray-400 mt-0.5">{completedCourses.length}件修了</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {completedCourses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-gray-700 font-semibold mb-1">コースがまだありません</h3>
            <p className="text-gray-400 text-sm">管理者がコースを追加するとここに表示されます</p>
          </div>
        )}
      </div>
    </div>
  );
}
