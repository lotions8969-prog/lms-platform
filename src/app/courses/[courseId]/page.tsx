'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Lesson } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { CheckCircle, Lock, Play, FileQuestion, ChevronLeft, Trophy, ClipboardList, BookOpen } from 'lucide-react';
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
        <div className="h-48 bg-white rounded-xl" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Course header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
            <ChevronLeft className="w-4 h-4" />コース一覧
          </Link>

          {course && (
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Thumbnail */}
              {course.thumbnail && (
                <div className="shrink-0">
                  <img src={course.thumbnail} alt={course.title} className="w-full sm:w-48 h-32 object-cover rounded-xl" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{course.title}</h1>
                {course.description && <p className="text-gray-500 mt-1.5 text-sm leading-relaxed">{course.description}</p>}
                <p className="text-gray-400 text-sm mt-2">{lessons.length} セッション · {completedLessons.length} 完了</p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">進捗</span>
                      <span className="text-xs font-semibold text-violet-600">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${allDone ? 'bg-emerald-500' : 'bg-violet-500'}`}
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {nextLesson && (
                    <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm transition-all">
                      <Play className="w-3.5 h-3.5" />
                      {completedLessons.length === 0 ? '学習を開始' : '続きから'}
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
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold text-emerald-700 text-sm">コース完了おめでとうございます！</p>
              <p className="text-emerald-600 text-xs mt-0.5">すべてのレッスンを修了しました。</p>
            </div>
          </div>
        )}

        <h2 className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-3">レッスン一覧</h2>

        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const done = isDone(lesson.id);
            const isLocked = index > 0 && !isDone(lessons[index - 1].id);

            const typeIcon = done
              ? <CheckCircle className="w-4 h-4 text-emerald-500" />
              : lesson.type === 'quiz' ? <FileQuestion className="w-4 h-4 text-violet-500" />
              : lesson.type === 'survey' ? <ClipboardList className="w-4 h-4 text-violet-500" />
              : <Play className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />;

            const typeLabel = done ? '完了' : lesson.type === 'quiz' ? 'クイズ' : lesson.type === 'survey' ? 'アンケート' : '動画';

            if (isLocked) return (
              <div key={lesson.id} className="flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-100 rounded-xl opacity-50 cursor-not-allowed">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">{lesson.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">前のレッスンを完了してください</p>
                </div>
              </div>
            );

            return (
              <Link key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`} className="group block">
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                  done
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : 'bg-white border-gray-200 hover:border-violet-300 hover:shadow-sm'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    done ? 'bg-emerald-50' : lesson.type !== 'video' ? 'bg-violet-50' : 'bg-gray-50'
                  }`}>
                    {typeIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${done ? 'text-gray-400' : 'text-gray-800 group-hover:text-violet-700 transition-colors'}`}>
                      {lesson.title}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${done ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {done ? '✓ ' : ''}{typeLabel}
                    </p>
                  </div>
                  {!isLocked && (
                    <BookOpen className={`w-4 h-4 shrink-0 transition-all ${done ? 'text-gray-200' : 'text-gray-300 group-hover:text-violet-400'}`} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
