'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, Play, ArrowRight, Sparkles } from 'lucide-react';

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

  const totalCompleted = Object.values(user?.progress || {}).filter((p) => p.completed).length;
  const totalLessons = Object.values(user?.progress || {}).reduce((a, p) => a + (p.completedLessons?.length || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />

      {/* Hero */}
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-violet-400 text-sm font-semibold tracking-wide uppercase">ENISHI LESSONS</span>
          </div>
          <h1 className="text-3xl font-bold text-white">マイコース</h1>
          <p className="text-zinc-500 mt-2">学習を続けてスキルアップしましょう</p>
          {user && (totalCompleted > 0 || totalLessons > 0) && (
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-zinc-900">
              <div>
                <p className="text-xl font-bold text-white">{totalCompleted}</p>
                <p className="text-xs text-zinc-600 mt-0.5">完了コース</p>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div>
                <p className="text-xl font-bold text-white">{totalLessons}</p>
                <p className="text-xs text-zinc-600 mt-0.5">完了レッスン</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500">公開中のコースがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const done = completedLessons(course.id);
              const total = lessonCounts[course.id] || 0;
              const progress = pct(course.id);
              const completed = isCompleted(course.id);
              const started = done > 0;

              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="group block">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:-translate-y-0.5 h-full flex flex-col">
                    {/* Thumbnail */}
                    {course.thumbnail ? (
                      <div className="relative overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-4 right-6 w-24 h-24 rounded-full bg-violet-400" />
                          <div className="absolute bottom-2 left-4 w-16 h-16 rounded-full bg-violet-400" />
                        </div>
                        <BookOpen className="w-10 h-10 text-zinc-700 relative z-10" />
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="font-bold text-zinc-100 group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug text-[15px]">{course.title}</h2>
                      <p className="text-sm text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">{course.description}</p>

                      {total > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-xs text-zinc-600">{done}/{total} レッスン</span>
                            <span className="text-xs font-semibold text-violet-400">{progress}%</span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${completed ? 'bg-emerald-500' : 'bg-violet-500'}`}
                              style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/60">
                        <div className="flex items-center gap-1.5">
                          {completed
                            ? <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs text-emerald-400 font-medium">完了済み</span></>
                            : started
                            ? <><Play className="w-4 h-4 text-violet-400" /><span className="text-xs text-violet-400 font-medium">続きから</span></>
                            : <><Play className="w-4 h-4 text-zinc-600" /><span className="text-xs text-zinc-500">開始する</span></>
                          }
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
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
