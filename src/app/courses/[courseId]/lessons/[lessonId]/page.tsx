'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson, Quiz } from '@/lib/types';
import Navigation from '@/components/Navigation';
import VideoPlayer from '@/components/VideoPlayer';
import RecordingSection from '@/components/RecordingSection';
import QuizSection from '@/components/QuizSection';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle, Play, FileQuestion, Lock, Menu, X, Settings } from 'lucide-react';
import { use } from 'react';

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, refreshUser } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    Promise.all([
      fetch(`/api/lessons/${lessonId}`).then((r) => r.json()),
      fetch(`/api/lessons?courseId=${courseId}`).then((r) => r.json()),
    ]).then(([{ lesson: l, quiz: q }, allLs]) => {
      setLesson(l);
      setQuiz(q);
      setAllLessons(allLs);
      if (user?.progress?.[courseId]?.completedLessons?.includes(lessonId)) setCompleted(true);
      setLoading(false);
    });
  }, [lessonId, courseId, user]);

  const markComplete = async () => {
    if (completed) return;
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, lessonId }),
    });
    await refreshUser();
    setCompleted(true);
  };

  const completedLessons = user?.progress?.[courseId]?.completedLessons || [];
  const isLessonDone = (id: string) => completedLessons.includes(id);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const canAccessNext = nextLesson && (isAdmin || isLessonDone(lessonId) || completed);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="aspect-video bg-zinc-900 rounded-2xl" />
      </div>
    </div>
  );

  if (!lesson) return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-zinc-500">レッスンが見つかりません</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navigation />

      {/* Admin preview banner */}
      {isAdmin && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-semibold px-4 py-2 flex items-center gap-2 justify-center">
          <Settings className="w-3.5 h-3.5" />管理者プレビューモード — 受講者と同じ画面を確認しています
          <Link href={`/admin/courses/${courseId}/lessons`} className="ml-2 underline hover:no-underline">管理画面に戻る</Link>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Video area */}
          {lesson.type === 'video' && (
            <div className="bg-black flex-shrink-0">
              <div className="max-w-5xl mx-auto w-full px-4 pt-6 pb-4">
                {lesson.videoUrl
                  ? <VideoPlayer videoUrl={lesson.videoUrl} onEnded={markComplete} />
                  : <div className="aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-600">動画が設定されていません</div>
                }
              </div>
            </div>
          )}

          {/* Lesson content */}
          <div className="flex-1 bg-zinc-950 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
                    <Link href={`/courses/${courseId}`} className="hover:text-violet-400 transition-colors flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5" />コースに戻る
                    </Link>
                    {allLessons.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{currentIndex + 1} / {allLessons.length}</span>
                        <button onClick={() => setSidebarOpen(true)} className="ml-1 flex items-center gap-1 text-violet-400 hover:text-violet-300 md:hidden">
                          <Menu className="w-3.5 h-3.5" />目次
                        </button>
                      </>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
                  {lesson.description && <p className="text-zinc-500 mt-1 text-sm">{lesson.description}</p>}
                </div>
                {completed && (
                  <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1.5 rounded-xl text-sm font-semibold shrink-0">
                    <CheckCircle className="w-4 h-4" />完了
                  </div>
                )}
              </div>

              {/* Quiz */}
              {lesson.type === 'quiz' && quiz && <QuizSection quiz={quiz} onPass={markComplete} />}
              {lesson.type === 'quiz' && !quiz && (
                <div className="text-center py-12 text-zinc-600 bg-zinc-900 rounded-2xl">クイズが設定されていません</div>
              )}

              {/* Recording (video lessons only) */}
              {lesson.type === 'video' && (
                <RecordingSection lessonId={lessonId} courseId={courseId} onUploaded={markComplete} />
              )}

              {/* Complete without recording */}
              {lesson.type === 'video' && !completed && (
                <div className="flex justify-end">
                  <button onClick={markComplete}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30">
                    <CheckCircle className="w-4 h-4" />録画なしで完了にする
                  </button>
                </div>
              )}

              {/* Prev/Next navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                {prevLesson ? (
                  <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-all">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{prevLesson.title}</span>
                    <span className="sm:hidden">前へ</span>
                  </Link>
                ) : <div />}

                {nextLesson && (
                  canAccessNext ? (
                    <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-900/30">
                      <span className="hidden sm:inline">{nextLesson.title}</span>
                      <span className="sm:hidden">次へ</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-600 rounded-xl text-sm cursor-not-allowed">
                      <span>次のレッスン</span>
                      <Lock className="w-4 h-4" />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col w-72 lg:w-80 bg-zinc-900 border-l border-zinc-800 overflow-y-auto shrink-0">
          <div className="px-4 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
            <p className="font-bold text-zinc-200 text-sm">コース目次</p>
            <p className="text-xs text-zinc-600 mt-0.5">{completedLessons.length}/{allLessons.length} 完了</p>
            <div className="h-1 bg-zinc-800 rounded-full mt-2">
              <div className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: allLessons.length > 0 ? `${Math.round((completedLessons.length / allLessons.length) * 100)}%` : '0%' }} />
            </div>
          </div>
          <div className="flex-1 py-2">
            {allLessons.map((l, i) => {
              const done = isLessonDone(l.id);
              const isCurrent = l.id === lessonId;
              const locked = i > 0 && !isAdmin && !isLessonDone(allLessons[i - 1].id);
              return (
                <div key={l.id}>
                  {locked ? (
                    <div className="flex items-center gap-3 px-4 py-3 opacity-40 cursor-not-allowed">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                        <Lock className="w-3 h-3 text-zinc-600" />
                      </div>
                      <span className="text-xs text-zinc-600 truncate">{l.title}</span>
                    </div>
                  ) : (
                    <Link href={`/courses/${courseId}/lessons/${l.id}`}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${isCurrent ? 'bg-violet-900/20 border-r-2 border-violet-500' : 'hover:bg-zinc-800/50'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        done ? 'bg-emerald-900/50' : isCurrent ? 'bg-violet-900/50' : l.type === 'quiz' ? 'bg-violet-900/30' : 'bg-zinc-800'
                      }`}>
                        {done
                          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          : l.type === 'quiz'
                          ? <FileQuestion className={`w-3.5 h-3.5 ${isCurrent ? 'text-violet-400' : 'text-zinc-500'}`} />
                          : <Play className={`w-3.5 h-3.5 ${isCurrent ? 'text-violet-400' : 'text-zinc-500'}`} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate font-medium ${isCurrent ? 'text-violet-300' : done ? 'text-zinc-600' : 'text-zinc-300'}`}>
                          {l.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${done ? 'text-emerald-600' : 'text-zinc-700'}`}>
                          {done ? '✓ 完了' : l.type === 'quiz' ? 'クイズ' : '動画'}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-72 bg-zinc-900 border-l border-zinc-800 z-50 shadow-xl md:hidden overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
              <p className="font-bold text-zinc-200 text-sm">コース目次</p>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="py-2">
              {allLessons.map((l, i) => {
                const done = isLessonDone(l.id);
                const isCurrent = l.id === lessonId;
                const locked = i > 0 && !isAdmin && !isLessonDone(allLessons[i - 1].id);
                return locked ? (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-3 opacity-40">
                    <Lock className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span className="text-sm text-zinc-600 truncate">{l.title}</span>
                  </div>
                ) : (
                  <Link key={l.id} href={`/courses/${courseId}/lessons/${l.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${isCurrent ? 'bg-violet-900/20' : 'hover:bg-zinc-800/50'}`}>
                    {done ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      : l.type === 'quiz' ? <FileQuestion className="w-4 h-4 text-violet-400 shrink-0" />
                      : <Play className="w-4 h-4 text-zinc-400 shrink-0" />}
                    <span className={`text-sm truncate ${isCurrent ? 'font-semibold text-violet-300' : done ? 'text-zinc-600' : 'text-zinc-300'}`}>
                      {l.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
