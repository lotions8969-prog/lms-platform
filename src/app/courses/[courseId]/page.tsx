'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Lesson } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, Lock, Play, FileQuestion, ChevronLeft, Trophy, Clock, ArrowRight } from 'lucide-react';
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
  const isLessonDone = (id: string) => completedLessons.includes(id);
  const progressPct = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;
  const allDone = lessons.length > 0 && completedLessons.length >= lessons.length;

  // Find the first lesson not yet completed for "続きから" button
  const nextLesson = lessons.find((l) => !isLessonDone(l.id));

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-48 bg-slate-200 rounded-2xl" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Course Hero */}
      <div className={`${course?.thumbnail ? '' : 'bg-gradient-to-br from-indigo-600 to-blue-700'} relative`}>
        {course?.thumbnail && (
          <div className="absolute inset-0">
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-indigo-900/70" />
          </div>
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm mb-5 transition-colors">
            <ChevronLeft className="w-4 h-4" />コース一覧
          </Link>
          {course && (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{course.title}</h1>
                <p className="text-indigo-200 mt-2 text-sm leading-relaxed max-w-xl">{course.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-indigo-200">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{lessons.length}レッスン</span>
                  {completedLessons.length > 0 && (
                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-400" />{completedLessons.length}完了</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                {/* Progress ring */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke={allDone ? '#10B981' : '#818CF8'}
                        strokeWidth="4" strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPct / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{progressPct}%</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{allDone ? '完了！' : '進捗'}</p>
                    <p className="text-indigo-200 text-xs">{completedLessons.length}/{lessons.length}</p>
                  </div>
                </div>
                {nextLesson && (
                  <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                    {completedLessons.length === 0 ? <><Play className="w-4 h-4" />学習を開始</> : <><Play className="w-4 h-4" />続きから</>}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {allDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">コース完了おめでとうございます！</p>
              <p className="text-emerald-600 text-sm">すべてのレッスンを修了しました。</p>
            </div>
          </div>
        )}

        <h2 className="font-bold text-slate-800 mb-4 text-lg">レッスン一覧</h2>

        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const done = isLessonDone(lesson.id);
            const isLocked = index > 0 && !isLessonDone(lessons[index - 1].id);
            const isCurrent = !done && !isLocked;

            if (isLocked) return (
              <div key={lesson.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 opacity-60 cursor-not-allowed">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-600 text-sm">{lesson.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">前のレッスンを完了してください</p>
                </div>
              </div>
            );

            return (
              <Link key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`} className="group block">
                <div className={`flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  done ? 'border-emerald-200' : isCurrent ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-100'
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    done ? 'bg-emerald-100' : lesson.type === 'quiz' ? 'bg-violet-100' : 'bg-indigo-100'
                  }`}>
                    {done
                      ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                      : lesson.type === 'quiz'
                      ? <FileQuestion className="w-4 h-4 text-violet-600" />
                      : <Play className="w-4 h-4 text-indigo-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${done ? 'text-slate-500' : 'text-slate-900'} truncate`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${done ? 'text-emerald-500' : lesson.type === 'quiz' ? 'text-violet-500' : 'text-indigo-500'}`}>
                        {done ? '✓ 完了' : lesson.type === 'quiz' ? 'クイズ' : '動画レッスン'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-all ${done ? 'text-emerald-300' : 'text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1'}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
