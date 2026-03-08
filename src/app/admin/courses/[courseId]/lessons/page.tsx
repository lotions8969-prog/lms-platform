'use client';

import { useEffect, useState } from 'react';
import { Lesson } from '@/lib/types';
import Link from 'next/link';
import { ChevronLeft, Plus, Play, FileQuestion, Trash2, Eye, BookOpen, ChevronUp, ChevronDown, ClipboardList } from 'lucide-react';
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

  const typeInfo = (type: string) => {
    if (type === 'quiz') return { icon: FileQuestion, label: 'クイズ', color: 'text-violet-600', bg: 'bg-violet-50' };
    if (type === 'survey') return { icon: ClipboardList, label: 'アンケート', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { icon: Play, label: '動画', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />コース管理
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">レッスン管理</h1>
          <p className="text-gray-500 text-sm mt-0.5">{lessons.length}件のレッスン</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/courses/${courseId}`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium transition-all">
            <Eye className="w-4 h-4" />受講画面
          </Link>
          <Link href={`/admin/courses/${courseId}/lessons/new`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm">
            <Plus className="w-4 h-4" />レッスン追加
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white border border-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-700 font-medium">レッスンがまだありません</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">最初のレッスンを追加してみましょう</p>
          <Link href={`/admin/courses/${courseId}/lessons/new`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" />レッスンを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {lessons.map((lesson, index) => {
            const { icon: Icon, label, color, bg } = typeInfo(lesson.type);
            return (
              <div key={lesson.id} className={`bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-gray-300 hover:shadow-sm transition-all group ${reordering === lesson.id ? 'opacity-50' : ''}`}>
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveLesson(index, 'up')} disabled={index === 0 || !!reordering}
                    className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveLesson(index, 'down')} disabled={index === lessons.length - 1 || !!reordering}
                    className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-mono text-gray-400 w-5 shrink-0 text-center">{index + 1}</span>
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate text-sm">{lesson.title}</p>
                  <span className={`text-[11px] font-medium ${color}`}>
                    {label} · 順番 {lesson.order}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/courses/${courseId}/lessons/${lesson.id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                    <Eye className="w-3 h-3" />受講
                  </Link>
                  <button onClick={() => handleDelete(lesson.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
