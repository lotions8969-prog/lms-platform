'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Lesson } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { CheckCircle, Lock, Play, FileQuestion, ChevronLeft, ChevronRight, Trophy, ClipboardList, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-3">
        <div className="h-56 bg-white rounded-2xl" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Course header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 mb-5 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" />コース一覧へ戻る
          </Link>

          {course && (
            <div className="flex flex-col sm:flex-row gap-6">
              {course.thumbnail ? (
                <div className="shrink-0">
                  <img src={course.thumbnail} alt={course.title} className="w-full sm:w-52 h-36 object-cover rounded-2xl shadow-sm" />
                </div>
              ) : (
                <div className="shrink-0 w-full sm:w-52 h-36 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-sm flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/60" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{course.title}</h1>
                {course.description && <p className="text-gray-500 mt-2 text-sm leading-relaxed">{course.description}</p>}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{lessons.length} レッスン</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" />{completedLessons.length} 完了</span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-400 font-medium">進捗率</span>
                      <span className={`text-xs font-bold ${allDone ? 'text-emerald-600' : 'text-violet-600'}`}>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-emerald-500' : 'bg-violet-500'}`}
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {nextLesson && (
                    <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-violet-200">
                      <Play className="w-4 h-4" />
                      {completedLessons.length === 0 ? '学習を開始' : '続きから学習'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {allDone && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-emerald-700">コース完了おめでとうございます！🎉</p>
              <p className="text-emerald-600 text-sm mt-0.5">すべてのレッスンを修了しました。素晴らしい成果です！</p>
            </div>
          </div>
        )}

        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">カリキュラム</h2>

        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const done = isDone(lesson.id);
            const isLocked = index > 0 && !isDone(lessons[index - 1].id);

            const typeIcon = done
              ? <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
              : lesson.type === 'quiz' ? <FileQuestion className="w-4.5 h-4.5 text-violet-500" />
              : lesson.type === 'survey' ? <ClipboardList className="w-4.5 h-4.5 text-violet-500" />
              : <Play className="w-4.5 h-4.5 text-gray-400 group-hover:text-violet-500 transition-colors" />;

            const typeBadge = lesson.type === 'quiz' ? 'クイズ' : lesson.type === 'survey' ? 'アンケート' : '動画';

            if (isLocked) return (
              <div key={lesson.id} className="flex items-center gap-4 px-5 py-4 bg-white border border-gray-100 rounded-2xl opacity-40 cursor-not-allowed">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-500 truncate">{lesson.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">前のレッスンを完了してください</p>
                </div>
                <span className="text-xs text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">{typeBadge}</span>
              </div>
            );

            return (
              <Link key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`} className="group block">
                <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-150 ${
                  done
                    ? 'bg-white border-gray-100 hover:border-emerald-200'
                    : 'bg-white border-gray-200 hover:border-violet-300 hover:shadow-sm hover:-translate-y-0.5'
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    done ? 'bg-emerald-50' : lesson.type !== 'video' ? 'bg-violet-50' : 'bg-gray-50 group-hover:bg-violet-50'
                  }`}>
                    {typeIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate transition-colors ${done ? 'text-gray-400' : 'text-gray-800 group-hover:text-violet-700'}`}>
                      {lesson.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${done ? 'text-emerald-500 font-medium' : 'text-gray-400'}`}>
                      {done ? '✓ 完了' : typeBadge}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${done ? 'text-gray-200' : 'text-gray-300 group-hover:text-violet-400 group-hover:translate-x-0.5'}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
