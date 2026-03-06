'use client';

import { useEffect, useState } from 'react';
import { Lesson } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Play, FileQuestion, Trash2, Eye, GripVertical, BookOpen } from 'lucide-react';
import { use } from 'react';

export default function CourseLessonsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lessons?courseId=${courseId}`).then((r) => r.json()).then((d) => { setLessons(d); setLoading(false); });
  }, [courseId]);

  const handleDelete = async (id: string) => {
    if (!confirm('このレッスンを削除しますか？')) return;
    await fetch('/api/lessons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />コース管理に戻る
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">レッスン管理</h1>
            <p className="text-slate-500 text-sm mt-0.5">{lessons.length}件のレッスン</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/courses/${courseId}`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-semibold transition-colors">
              <Eye className="w-4 h-4" />コースを受講する
            </Link>
            <Link href={`/admin/courses/${courseId}/lessons/new`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm">
              <Plus className="w-4 h-4" />レッスン追加
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-slate-600 font-medium">レッスンがまだありません</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">最初のレッスンを追加してみましょう</p>
            <Link href={`/admin/courses/${courseId}/lessons/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
              <Plus className="w-4 h-4" />レッスンを追加
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-all group">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                <span className="text-xs font-mono text-slate-400 w-5 shrink-0">{index + 1}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  lesson.type === 'quiz' ? 'bg-violet-100' : 'bg-indigo-100'
                }`}>
                  {lesson.type === 'quiz'
                    ? <FileQuestion className="w-4 h-4 text-violet-600" />
                    : <Play className="w-4 h-4 text-indigo-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate text-sm">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      lesson.type === 'quiz' ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {lesson.type === 'quiz' ? 'クイズ' : '動画'}
                    </span>
                    <span className="text-xs text-slate-400">順番: {lesson.order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/courses/${courseId}/lessons/${lesson.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                    <Eye className="w-3.5 h-3.5" />受講する
                  </Link>
                  <button onClick={() => handleDelete(lesson.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
