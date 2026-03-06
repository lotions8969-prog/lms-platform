'use client';

import { useEffect, useState } from 'react';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Plus, Trash2, BookOpen, ChevronRight, Eye, ListOrdered } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses').then((r) => r.json()).then((d) => { setCourses(d); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('このコースを削除しますか？\nレッスンも全て削除されます。')) return;
    await fetch('/api/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">コース管理</h1>
            <p className="text-slate-500 text-sm mt-0.5">{courses.length}件のコース</p>
          </div>
          <Link href="/admin/courses/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm hover:shadow-md">
            <Plus className="w-4 h-4" />新しいコース
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">コースがまだありません</p>
            <p className="text-slate-400 text-sm mb-4">最初のコースを作成してみましょう</p>
            <Link href="/admin/courses/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
              <Plus className="w-4 h-4" />コースを作成
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-16 h-14 object-cover rounded-xl shrink-0" />
                  ) : (
                    <div className="w-16 h-14 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-white opacity-80" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{course.title}</h3>
                    <p className="text-sm text-slate-500 truncate mt-0.5">{course.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(course.createdAt).toLocaleDateString('ja-JP')} 作成</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={`/courses/${course.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-medium transition-colors"
                      title="コースをプレビュー（受講生視点）">
                      <Eye className="w-4 h-4" />プレビュー
                    </Link>
                    <Link href={`/admin/courses/${course.id}/lessons`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
                      <ListOrdered className="w-4 h-4" />レッスン
                    </Link>
                    <Link href={`/admin/courses/${course.id}/lessons/new`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-medium transition-colors">
                      <Plus className="w-4 h-4" />追加
                    </Link>
                    <button onClick={() => handleDelete(course.id)}
                      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
