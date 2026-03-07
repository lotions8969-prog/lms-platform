'use client';

import { useEffect, useState } from 'react';
import { Course } from '@/lib/types';
import Link from 'next/link';
import { Plus, Trash2, BookOpen, ListOrdered, Eye, EyeOff, Globe, Loader2 } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/courses').then((r) => r.json()).then((d) => { setCourses(d); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('このコースを削除しますか？')) return;
    await fetch('/api/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const togglePublish = async (course: Course) => {
    setToggling(course.id);
    const res = await fetch('/api/courses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: course.id, published: !course.published }),
    });
    const updated = await res.json();
    setCourses((prev) => prev.map((c) => c.id === course.id ? updated : c));
    setToggling(null);
  };

  const publishedCount = courses.filter((c) => c.published !== false).length;

  return (
    <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">コース管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            全{courses.length}件 · <span className="text-emerald-600">{publishedCount}件公開中</span>
            {courses.length - publishedCount > 0 && <span className="text-gray-400"> · {courses.length - publishedCount}件下書き</span>}
          </p>
        </div>
        <Link href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm">
          <Plus className="w-4 h-4" />新しいコース
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-700 font-medium mb-1">コースがまだありません</p>
          <p className="text-gray-400 text-sm mb-5">最初のコースを作成してみましょう</p>
          <Link href="/admin/courses/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" />コースを作成
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 hover:shadow-sm transition-all">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="" className="w-16 h-11 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-16 h-11 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 truncate text-sm">{course.title}</h3>
                  {course.published !== false
                    ? <span className="shrink-0 flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium"><Globe className="w-2.5 h-2.5" />公開中</span>
                    : <span className="shrink-0 flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium"><EyeOff className="w-2.5 h-2.5" />下書き</span>
                  }
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{course.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => togglePublish(course)} disabled={toggling === course.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                    course.published !== false
                      ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                      : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  }`}>
                  {toggling === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : course.published !== false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {course.published !== false ? '非公開' : '公開する'}
                </button>
                <Link href={`/courses/${course.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                  <Eye className="w-3.5 h-3.5" />プレビュー
                </Link>
                <Link href={`/admin/courses/${course.id}/lessons`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  <ListOrdered className="w-3.5 h-3.5" />レッスン
                </Link>
                <Link href={`/admin/courses/${course.id}/lessons/new`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  <Plus className="w-3.5 h-3.5" />追加
                </Link>
                <button onClick={() => handleDelete(course.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
