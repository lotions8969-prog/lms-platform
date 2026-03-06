'use client';

import { useEffect, useState } from 'react';
import { Course } from '@/lib/types';
import Navigation from '@/components/Navigation';
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
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">コース管理</h1>
            <p className="text-zinc-500 text-sm mt-1">
              全{courses.length}件 · <span className="text-emerald-400">{publishedCount}件公開中</span>
              {courses.length - publishedCount > 0 && <span className="text-zinc-600"> · {courses.length - publishedCount}件下書き</span>}
            </p>
          </div>
          <Link href="/admin/courses/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/30">
            <Plus className="w-4 h-4" />新しいコース
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium mb-1">コースがまだありません</p>
            <p className="text-zinc-600 text-sm mb-5">最初のコースを作成してみましょう</p>
            <Link href="/admin/courses/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500">
              <Plus className="w-4 h-4" />コースを作成
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4 hover:border-zinc-700 transition-all">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="w-16 h-12 object-cover rounded-xl shrink-0" />
                ) : (
                  <div className="w-16 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-100 truncate text-sm">{course.title}</h3>
                    {course.published !== false
                      ? <span className="shrink-0 flex items-center gap-1 text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium"><Globe className="w-2.5 h-2.5" />公開中</span>
                      : <span className="shrink-0 flex items-center gap-1 text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded-full font-medium"><EyeOff className="w-2.5 h-2.5" />下書き</span>
                    }
                  </div>
                  <p className="text-xs text-zinc-600 truncate mt-0.5">{course.description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => togglePublish(course)} disabled={toggling === course.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                      course.published !== false
                        ? 'text-zinc-400 bg-zinc-800 hover:bg-zinc-700'
                        : 'text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50'
                    }`}>
                    {toggling === course.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : course.published !== false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {course.published !== false ? '非公開' : '公開する'}
                  </button>
                  <Link href={`/courses/${course.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-violet-400 bg-violet-900/20 hover:bg-violet-900/40 rounded-xl font-medium transition-colors">
                    <Eye className="w-3.5 h-3.5" />プレビュー
                  </Link>
                  <Link href={`/admin/courses/${course.id}/lessons`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors">
                    <ListOrdered className="w-3.5 h-3.5" />レッスン
                  </Link>
                  <Link href={`/admin/courses/${course.id}/lessons/new`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors">
                    <Plus className="w-3.5 h-3.5" />追加
                  </Link>
                  <button onClick={() => handleDelete(course.id)}
                    className="p-1.5 text-zinc-700 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors">
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
