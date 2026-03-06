'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, Play, ArrowRight, GraduationCap } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/courses').then((r) => r.json()).then(async (data: Course[]) => {
      setCourses(data);
      // fetch lesson counts in parallel
      const counts = await Promise.all(
        data.map((c) => fetch(`/api/lessons?courseId=${c.id}`).then((r) => r.json()).then((ls) => [c.id, ls.length] as [string, number]))
      );
      setLessonCounts(Object.fromEntries(counts));
      setLoading(false);
    });
  }, []);

  const completedLessons = (courseId: string) => user?.progress?.[courseId]?.completedLessons?.length || 0;
  const isCompleted = (courseId: string) => user?.progress?.[courseId]?.completed || false;
  const progressPercent = (courseId: string) => {
    const total = lessonCounts[courseId] || 0;
    if (total === 0) return 0;
    return Math.round((completedLessons(courseId) / total) * 100);
  };

  const getStatusLabel = (courseId: string) => {
    if (isCompleted(courseId)) return { label: '完了', cls: 'bg-emerald-100 text-emerald-700' };
    if (completedLessons(courseId) > 0) return { label: '学習中', cls: 'bg-indigo-100 text-indigo-700' };
    return { label: '未開始', cls: 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-7 h-7 text-indigo-200" />
            <h1 className="text-2xl font-bold">マイコース</h1>
          </div>
          <p className="text-indigo-200 text-sm">学習を続けてスキルアップしましょう</p>
          {user && (
            <div className="flex items-center gap-6 mt-5">
              <div>
                <p className="text-2xl font-bold">{Object.values(user.progress || {}).filter((p) => p.completed).length}</p>
                <p className="text-indigo-200 text-xs">完了コース</p>
              </div>
              <div className="w-px h-8 bg-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{Object.values(user.progress || {}).reduce((acc, p) => acc + (p.completedLessons?.length || 0), 0)}</p>
                <p className="text-indigo-200 text-xs">完了レッスン</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">コースがまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const status = getStatusLabel(course.id);
              const pct = progressPercent(course.id);
              const done = completedLessons(course.id);
              const total = lessonCounts[course.id] || 0;
              const hasProgress = done > 0;

              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="group block">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full flex flex-col">
                    {/* Thumbnail */}
                    {course.thumbnail ? (
                      <div className="relative overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold ${status.cls}`}>{status.label}</span>
                      </div>
                    ) : (
                      <div className="relative h-44 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-4 right-6 w-24 h-24 rounded-full bg-white" />
                          <div className="absolute bottom-2 left-4 w-16 h-16 rounded-full bg-white" />
                        </div>
                        <BookOpen className="w-14 h-14 text-white/60 relative z-10" />
                        <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold ${status.cls}`}>{status.label}</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">{course.title}</h2>
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">{course.description}</p>

                      {/* Progress */}
                      {total > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-500">{done}/{total} レッスン</span>
                            <span className="text-xs font-semibold text-indigo-600">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isCompleted(course.id) ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-sm">
                          {isCompleted(course.id)
                            ? <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600 font-medium text-xs">完了済み</span></>
                            : hasProgress
                            ? <><Play className="w-4 h-4 text-indigo-500" /><span className="text-indigo-600 font-medium text-xs">続きから</span></>
                            : <><Play className="w-4 h-4 text-slate-400" /><span className="text-slate-500 text-xs">開始する</span></>
                          }
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
