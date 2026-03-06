'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Lesson } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { CheckCircle, Lock, Play, FileQuestion, ChevronLeft, Trophy, ArrowRight } from 'lucide-react';
import { use } from 'react';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses`).then((r) => r.json()),
      fetch(`/api/lessons?courseId=${courseId}`).then((r) => r.json()),
    ]).then(([courses, ls]) => {
      setCourse(courses.find((c: Course) => c.id === courseId) || null);
      setLessons(ls);
      setLoading(false);
    });
  }, [courseId]);

  const completedLessons = user?.progress?.[courseId]?.completedLessons || [];
  const isDone = (id: string) => completedLessons.includes(id);
  const progress = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;
  const allDone = lessons.length > 0 && completedLessons.length >= lessons.length;
  const nextLesson = lessons.find((l) => !isDone(l.id));

  if (loading) return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-3">
        <div className="h-48 bg-zinc-900 rounded-2xl" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-zinc-900 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />

      {/* Course header */}
      <div className="border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-300 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />コース一覧
          </Link>
          {course && (
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white leading-tight">{course.title}</h1>
                <p className="text-zinc-500 mt-2 text-sm leading-relaxed">{course.description}</p>
                <p className="text-zinc-600 text-sm mt-3">{lessons.length} レッスン · {completedLessons.length} 完了</p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                {/* Progress */}
                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl">
                  <div className="relative w-11 h-11">
                    <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#27272A" strokeWidth="3.5" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke={allDone ? '#10B981' : '#8B5CF6'}
                        strokeWidth="3.5" strokeDasharray={`${2 * Math.PI * 18}`}
                        strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{progress}%</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{allDone ? '完了！🎉' : '進捗'}</p>
                    <p className="text-zinc-600 text-xs">{completedLessons.length}/{lessons.length}</p>
                  </div>
                </div>
                {nextLesson && (
                  <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-900/30">
                    <Play className="w-4 h-4" />
                    {completedLessons.length === 0 ? '学習を開始' : '続きから'}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {allDone && (
          <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-2xl p-5 mb-6 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-emerald-300 text-sm">コース完了おめでとうございます！</p>
              <p className="text-emerald-600 text-xs mt-0.5">すべてのレッスンを修了しました。</p>
            </div>
          </div>
        )}

        <h2 className="font-semibold text-zinc-400 text-xs uppercase tracking-wider mb-4">レッスン一覧</h2>

        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const done = isDone(lesson.id);
            const isLocked = index > 0 && !isDone(lessons[index - 1].id);

            if (isLocked) return (
              <div key={lesson.id} className="flex items-center gap-4 px-4 py-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl opacity-40 cursor-not-allowed">
                <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">{lesson.title}</p>
                  <p className="text-[11px] text-zinc-700 mt-0.5">前のレッスンを完了してください</p>
                </div>
              </div>
            );

            return (
              <Link key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`} className="group block">
                <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                  done ? 'bg-zinc-900/60 border-zinc-800/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    done ? 'bg-emerald-900/50' : lesson.type === 'quiz' ? 'bg-violet-900/50' : 'bg-zinc-800'
                  }`}>
                    {done ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : lesson.type === 'quiz' ? <FileQuestion className="w-4 h-4 text-violet-400" />
                      : <Play className="w-4 h-4 text-zinc-400 group-hover:text-violet-400 transition-colors" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${done ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                      {lesson.title}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${done ? 'text-emerald-600' : lesson.type === 'quiz' ? 'text-violet-600' : 'text-zinc-600'}`}>
                      {done ? '✓ 完了' : lesson.type === 'quiz' ? 'クイズ' : '動画レッスン'}
                    </p>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-all ${done ? 'text-zinc-700' : 'text-zinc-700 group-hover:text-violet-400 group-hover:translate-x-1'}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
