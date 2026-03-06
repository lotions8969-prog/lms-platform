'use client';

import { useEffect, useState } from 'react';
import { Lesson } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, Plus, Play, FileQuestion, Trash2, Eye, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';
import { use } from 'react';

export default function CourseLessonsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/lessons?courseId=${courseId}`).then((r) => r.json()).then((d) => { setLessons(d); setLoading(false); });
  }, [courseId]);

  const handleDelete = async (id: string) => {
    if (!confirm('このレッスンを削除しますか？')) return;
    await fetch('/api/lessons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const moveLesson = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = [...lessons];
    const temp = newLessons[index].order;
    newLessons[index] = { ...newLessons[index], order: newLessons[targetIndex].order };
    newLessons[targetIndex] = { ...newLessons[targetIndex], order: temp };
    [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];

    setLessons(newLessons);
    setReordering(newLessons[targetIndex].id);

    await Promise.all([
      fetch('/api/lessons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newLessons[index].id, order: newLessons[index].order }) }),
      fetch('/api/lessons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newLessons[targetIndex].id, order: newLessons[targetIndex].order }) }),
    ]);
    setReordering(null);
  };

  return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />コース管理
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">レッスン管理</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{lessons.length}件のレッスン</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/courses/${courseId}`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-violet-400 bg-violet-900/20 hover:bg-violet-900/40 border border-violet-800/40 rounded-xl font-medium transition-all">
            <Eye className="w-4 h-4" />受講画面
          </Link>
          <Link href={`/admin/courses/${courseId}/lessons/new`}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-900/20">
            <Plus className="w-4 h-4" />レッスン追加
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />)}</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">レッスンがまだありません</p>
          <p className="text-zinc-600 text-sm mt-1 mb-5">最初のレッスンを追加してみましょう</p>
          <Link href={`/admin/courses/${courseId}/lessons/new`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500">
            <Plus className="w-4 h-4" />レッスンを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 hover:border-zinc-700 transition-all group ${reordering === lesson.id ? 'opacity-50' : ''}`}>
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveLesson(index, 'up')}
                  disabled={index === 0 || !!reordering}
                  className="p-0.5 text-zinc-700 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveLesson(index, 'down')}
                  disabled={index === lessons.length - 1 || !!reordering}
                  className="p-0.5 text-zinc-700 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs font-mono text-zinc-700 w-5 shrink-0 text-center">{index + 1}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                lesson.type === 'quiz' ? 'bg-violet-900/50' : 'bg-zinc-800'
              }`}>
                {lesson.type === 'quiz'
                  ? <FileQuestion className="w-4 h-4 text-violet-400" />
                  : <Play className="w-4 h-4 text-zinc-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-200 truncate text-sm">{lesson.title}</p>
                <span className={`text-[11px] font-medium ${lesson.type === 'quiz' ? 'text-violet-500' : 'text-zinc-600'}`}>
                  {lesson.type === 'quiz' ? 'クイズ' : '動画'} · 順番 {lesson.order}
                </span>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/courses/${courseId}/lessons/${lesson.id}`}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-violet-400 bg-violet-900/20 hover:bg-violet-900/40 rounded-lg font-medium transition-colors">
                  <Eye className="w-3 h-3" />受講
                </Link>
                <button onClick={() => handleDelete(lesson.id)}
                  className="p-1.5 text-zinc-700 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
